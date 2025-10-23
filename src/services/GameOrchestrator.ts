/**
 * Game Orchestrator
 * Central controller for multiplayer Discovered Live! game sessions
 *
 * Responsibilities:
 * - Run game loop (question cycling)
 * - Coordinate AI agent clicks
 * - Validate player clicks
 * - Check for bingos after each answer
 * - Manage game end conditions
 * - Broadcast real-time events
 */

import { supabase } from '../lib/supabase';
import { aiAgentService } from './AIAgentService';
import { perpetualRoomManager } from './PerpetualRoomManager';
import { discoveredLiveRealtimeService } from './DiscoveredLiveRealtimeService';
import type {
  GameSession,
  SessionParticipant,
  AIClickDecision,
  BingoWinner,
} from '../types/DiscoveredLiveMultiplayerTypes';
import type {
  CareerClue,
  GridPosition,
} from '../types/DiscoveredLiveTypes';

interface QuestionState {
  clue: CareerClue;
  questionNumber: number;
  startedAt: Date;
  timeLimit: number;
  clickedParticipants: Set<string>;
  aiClickTimeouts: Map<string, NodeJS.Timeout>;
}

class GameOrchestrator {
  private static instance: GameOrchestrator;
  private activeGames: Map<string, QuestionState> = new Map();
  private gameLoops: Map<string, boolean> = new Map(); // sessionId -> isRunning

  private constructor() {}

  static getInstance(): GameOrchestrator {
    if (!GameOrchestrator.instance) {
      GameOrchestrator.instance = new GameOrchestrator();
    }
    return GameOrchestrator.instance;
  }

  // ================================================================
  // GAME LOOP
  // ================================================================

  /**
   * Start the game loop for a session
   */
  async startGameLoop(sessionId: string): Promise<void> {
    if (this.gameLoops.get(sessionId)) {
      console.warn(`Game loop already running for session ${sessionId}`);
      return;
    }

    this.gameLoops.set(sessionId, true);
    console.log(`🎮 Starting game loop for session ${sessionId}`);

    try {
      await this.runGameLoop(sessionId);
    } catch (error) {
      console.error('Error in game loop:', error);
      this.gameLoops.set(sessionId, false);
    }
  }

  /**
   * Stop the game loop
   */
  stopGameLoop(sessionId: string): void {
    this.gameLoops.set(sessionId, false);

    // Clear any active question state
    const questionState = this.activeGames.get(sessionId);
    if (questionState) {
      // Clear all AI click timeouts
      questionState.aiClickTimeouts.forEach(timeout => clearTimeout(timeout));
      this.activeGames.delete(sessionId);
    }

    console.log(`🛑 Stopped game loop for session ${sessionId}`);
  }

  /**
   * Main game loop
   */
  private async runGameLoop(sessionId: string): Promise<void> {
    const client = await supabase();

    // Get session details
    const { data: session, error: sessionError } = await client
      .from('cb_game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const totalQuestions = session.total_questions || 30; // Temporary: increased for bingo testing
    let questionIndex = session.current_question_number || 0;

    // Game loop
    while (this.gameLoops.get(sessionId) && questionIndex < totalQuestions) {
      // Check if game should end early (all bingo slots filled)
      const { data: currentSession } = await client
        .from('cb_game_sessions')
        .select('bingo_slots_remaining, status')
        .eq('id', sessionId)
        .single();

      if (currentSession?.bingo_slots_remaining === 0) {
        console.log('🏆 All bingo slots claimed! Ending game early.');
        break;
      }

      if (currentSession?.status === 'completed') {
        console.log('Game already completed.');
        break;
      }

      // Ask next question
      await this.askQuestion(sessionId);

      // Brief pause between questions
      await this.delay(2000);

      questionIndex++;
    }

    // End game
    await this.endGame(sessionId);
  }

  // ================================================================
  // QUESTION CYCLE
  // ================================================================

  /**
   * Ask a single question
   */
  private async askQuestion(sessionId: string): Promise<void> {
    const client = await supabase();

    // 1. Get session and participants
    const { data: session } = await client
      .from('cb_game_sessions')
      .select('*, cb_perpetual_rooms(*)')
      .eq('id', sessionId)
      .single();

    if (!session) {
      throw new Error('Session not found');
    }

    const participants = await perpetualRoomManager.getSessionParticipants(sessionId);
    const room = session.cb_perpetual_rooms;

    // 2. Select next clue
    const clue = await this.getNextClue(sessionId, room.grade_level);
    if (!clue) {
      console.error('No more clues available');
      return;
    }

    const questionNumber = session.current_question_number + 1;
    const timeLimit = room.question_time_limit_seconds || 15;

    // 3. Initialize question state
    const questionState: QuestionState = {
      clue,
      questionNumber,
      startedAt: new Date(),
      timeLimit,
      clickedParticipants: new Set(),
      aiClickTimeouts: new Map(),
    };

    this.activeGames.set(sessionId, questionState);

    // 4. Update session
    await client
      .from('cb_game_sessions')
      .update({
        current_question_number: questionNumber,
        questions_asked: [...(session.questions_asked || []), clue.id],
      })
      .eq('id', sessionId);

    // 5. Broadcast question started
    await discoveredLiveRealtimeService.broadcastQuestionStarted(
      session.perpetual_room_id,
      questionNumber,
      clue.clueText,
      clue.skillConnection,
      clue.careerCode,
      timeLimit
    );

    console.log(`❓ Question ${questionNumber}: ${clue.clueText}`);

    // 6. Schedule AI clicks
    await this.scheduleAIClicks(sessionId, clue, participants, questionState);

    // 7. Wait for timer to expire
    await this.delay(timeLimit * 1000);

    // 8. Process any remaining bingos
    await this.checkAllParticipantBingos(sessionId);

    // 9. Clear question state
    this.activeGames.delete(sessionId);
  }

  /**
   * Get next clue for the session
   * Ensures we don't ask about the same career multiple times
   */
  private async getNextClue(sessionId: string, gradeLevel: string): Promise<CareerClue | null> {
    const client = await supabase();

    // Get session to see what questions have been asked
    const { data: session } = await client
      .from('cb_game_sessions')
      .select('questions_asked')
      .eq('id', sessionId)
      .single();

    const askedClueIds = session?.questions_asked || [];

    // Get career codes from already-asked clues to avoid duplicate careers
    let askedCareerCodes: string[] = [];
    if (askedClueIds.length > 0) {
      const { data: askedClues } = await client
        .from('cb_clues')
        .select('career_code')
        .in('id', askedClueIds);

      askedCareerCodes = askedClues?.map(c => c.career_code) || [];
      console.log(`🚫 Already asked careers: ${askedCareerCodes.join(', ')}`);
    }

    // STEP 1: Get all careers sorted by total times_shown (aggregated)
    // This ensures fair distribution across careers, not individual clues
    const { data: careerStats, error: careerError } = await client.rpc('get_career_clue_stats', {
      p_grade_category: gradeLevel || 'elementary',
      p_excluded_careers: askedCareerCodes
    });

    // Fallback if RPC function doesn't exist - use manual aggregation
    let availableCareers: string[] = [];

    if (careerError || !careerStats || careerStats.length === 0) {
      console.log('⚠️ RPC function not available, using fallback career selection');

      // Get all clues for this grade level, excluding already-asked careers
      let fallbackQuery = client
        .from('cb_clues')
        .select('career_code, times_shown')
        .eq('grade_category', gradeLevel || 'elementary')
        .eq('is_active', true);

      if (askedCareerCodes.length > 0) {
        fallbackQuery = fallbackQuery.not('career_code', 'in', `(${askedCareerCodes.join(',')})`);
      }

      const { data: allClues } = await fallbackQuery;

      if (allClues && allClues.length > 0) {
        // Group by career and calculate total times_shown
        const careerMap = new Map<string, number>();
        allClues.forEach(clue => {
          const current = careerMap.get(clue.career_code) || 0;
          careerMap.set(clue.career_code, current + (clue.times_shown || 0));
        });

        // Sort careers by total times_shown
        availableCareers = Array.from(careerMap.entries())
          .sort((a, b) => a[1] - b[1]) // Sort by times_shown ascending
          .slice(0, 10) // Take top 10 least-shown careers
          .map(([career]) => career);
      }
    } else {
      availableCareers = careerStats.slice(0, 10).map((stat: any) => stat.career_code);
    }

    if (availableCareers.length === 0) {
      console.error('No available careers found');
      return null;
    }

    // STEP 2: Pick a random career from the top 10 least-shown
    const selectedCareer = availableCareers[Math.floor(Math.random() * availableCareers.length)];
    console.log(`🎯 Selected career from top ${availableCareers.length} least-shown: ${selectedCareer}`);
    console.log(`   Available careers: ${availableCareers.join(', ')}`);

    // STEP 3: Get all clues for this career and pick a random one
    const { data: careerClues, error: cluesError } = await client
      .from('cb_clues')
      .select('*')
      .eq('career_code', selectedCareer)
      .eq('grade_category', gradeLevel || 'elementary')
      .eq('is_active', true);

    if (cluesError || !careerClues || careerClues.length === 0) {
      console.error('Error fetching clues for selected career:', cluesError);
      return null;
    }

    // Pick random clue from this career (prefer least-shown clues)
    const sortedCareerClues = careerClues.sort((a, b) => (a.times_shown || 0) - (b.times_shown || 0));
    const topClues = sortedCareerClues.slice(0, Math.min(5, sortedCareerClues.length)); // Top 5 least-shown clues for this career
    const randomClue = topClues[Math.floor(Math.random() * topClues.length)];
    console.log(`✅ Selected clue for ${selectedCareer}: "${randomClue.clue_text.substring(0, 50)}..."`);
    console.log(`   Clue has been shown ${randomClue.times_shown || 0} times`);

    return {
      id: randomClue.id,
      careerCode: randomClue.career_code,
      clueText: randomClue.clue_text,
      skillConnection: randomClue.skill_connection,
      difficulty: randomClue.difficulty,
      gradeCategory: randomClue.grade_category,
      minPlayCount: randomClue.min_play_count,
      distractorCareers: randomClue.distractor_careers,
      distractorStrategy: randomClue.distractor_strategy,
      createdAt: randomClue.created_at,
      updatedAt: randomClue.updated_at,
      isActive: randomClue.is_active,
      timesShown: randomClue.times_shown,
      timesCorrect: randomClue.times_correct,
      avgResponseTimeSeconds: randomClue.avg_response_time_seconds,
    };
  }

  // ================================================================
  // AI CLICK HANDLING
  // ================================================================

  /**
   * Schedule AI agent clicks
   */
  private async scheduleAIClicks(
    sessionId: string,
    clue: CareerClue,
    participants: SessionParticipant[],
    questionState: QuestionState
  ): Promise<void> {
    const aiParticipants = participants.filter(p => p.participantType === 'ai_agent');

    for (const aiParticipant of aiParticipants) {
      if (!aiParticipant.aiDifficulty) continue;

      // Get AI decision
      const config = aiAgentService.createAgent(
        aiParticipant.aiDifficulty,
        aiParticipant.displayName
      );

      const decision = await aiAgentService.decideClick(
        clue,
        aiParticipant.bingoCard,
        config
      );

      // Schedule click
      const timeout = setTimeout(async () => {
        await this.handleAIClick(sessionId, aiParticipant, decision, clue);
      }, decision.responseTime * 1000);

      questionState.aiClickTimeouts.set(aiParticipant.id, timeout);
    }
  }

  /**
   * Handle AI agent click
   */
  private async handleAIClick(
    sessionId: string,
    participant: SessionParticipant,
    decision: AIClickDecision,
    clue: CareerClue
  ): Promise<void> {
    const isCorrect = decision.careerCode === clue.careerCode;

    console.log(
      `🤖 ${participant.displayName} clicked ${decision.careerCode} at (${decision.position.row},${decision.position.col}) - ${isCorrect ? '✅' : '❌'}`
    );

    // Process the click
    await this.processClick(
      sessionId,
      participant.id,
      decision.position,
      clue,
      decision.responseTime
    );
  }

  // ================================================================
  // CLICK PROCESSING
  // ================================================================

  /**
   * Process a player or AI click
   */
  async processClick(
    sessionId: string,
    participantId: string,
    position: GridPosition,
    clue: CareerClue,
    responseTime: number
  ): Promise<{ isCorrect: boolean; unlockedPosition?: GridPosition; newBingo?: boolean }> {
    const client = await supabase();

    // Get participant
    const { data: participant } = await client
      .from('cb_session_participants')
      .select('*')
      .eq('id', participantId)
      .single();

    if (!participant) {
      throw new Error('Participant not found');
    }

    // Check if square is already unlocked (prevent double-clicking or clicking pre-unlocked squares)
    const isAlreadyUnlocked = (participant.unlocked_squares || []).some(
      (pos: GridPosition) => pos.row === position.row && pos.col === position.col
    );

    if (isAlreadyUnlocked) {
      console.log(`⚠️ ${participant.display_name} clicked already unlocked square at (${position.row},${position.col}) - ignoring`);
      return { isCorrect: false }; // Return without penalty or reward
    }

    // Get career at clicked position
    const clickedCareer = participant.bingo_card.careers[position.row][position.col];
    const isCorrect = clickedCareer === clue.careerCode;

    // Record click event
    const questionState = this.activeGames.get(sessionId);
    await client.from('cb_click_events').insert({
      game_session_id: sessionId,
      participant_id: participantId,
      question_number: questionState?.questionNumber || 0,
      clue_id: clue.id,
      clicked_career_code: clickedCareer,
      clicked_position: position,
      correct_career_code: clue.careerCode,
      is_correct: isCorrect,
      question_started_at: questionState?.startedAt.toISOString(),
      response_time_seconds: responseTime,
      unlocked_position: isCorrect ? position : null,
    });

    if (!isCorrect) {
      // PENALTY for wrong answer: -5 XP, break streak, increment incorrect count
      const xpPenalty = -5;
      const currentXP = participant.total_xp || 0; // Handle NULL
      const newXP = Math.max(0, currentXP + xpPenalty); // XP cannot go below 0

      await client
        .from('cb_session_participants')
        .update({
          incorrect_answers: (participant.incorrect_answers || 0) + 1,
          total_xp: newXP,
          current_streak: 0, // Break streak on wrong answer
        })
        .eq('id', participantId);

      console.log(`❌ ${participant.display_name} wrong answer: -5 XP, streak broken`);

      // Broadcast wrong answer (no unlock) with penalty
      const { data: session } = await client
        .from('cb_game_sessions')
        .select('perpetual_room_id')
        .eq('id', sessionId)
        .single();

      if (session) {
        await discoveredLiveRealtimeService.broadcastPlayerClicked(
          session.perpetual_room_id,
          participantId,
          participant.display_name,
          clickedCareer,
          position,
          false,
          responseTime,
          undefined, // No unlocked position
          0, // Streak reset to 0
          xpPenalty // Negative XP to show penalty
        );
      }

      return { isCorrect: false };
    }

    // Correct answer - unlock square
    console.log(`🔓 [processClick] ${participant.display_name} - Current unlocked from DB:`, participant.unlocked_squares);
    console.log(`🔓 [processClick] ${participant.display_name} - Adding position:`, position);
    const unlockedSquares = [...(participant.unlocked_squares || []), position];
    console.log(`🔓 [processClick] ${participant.display_name} - New unlocked array (${unlockedSquares.length} total):`, unlockedSquares);
    const completedLines = participant.completed_lines || { rows: [], columns: [], diagonals: [], corners: false };

    // Check for new bingos
    const newBingos = perpetualRoomManager.checkForBingos(unlockedSquares, completedLines);
    const hasBingo = newBingos.rows.length > 0 || newBingos.columns.length > 0 || newBingos.diagonals.length > 0 || newBingos.corners === true;

    // Update completed lines
    const updatedCompletedLines = {
      rows: [...completedLines.rows, ...newBingos.rows],
      columns: [...completedLines.columns, ...newBingos.columns],
      diagonals: [...completedLines.diagonals, ...newBingos.diagonals],
      corners: completedLines.corners || newBingos.corners || false,
    };

    // Calculate XP
    const baseXP = 10;
    const speedBonus = responseTime < 5 ? 5 : 0;
    const currentStreak = participant.current_streak || 0;
    const streakBonus = this.calculateStreakBonus(currentStreak + 1);
    const totalXP = baseXP + speedBonus + streakBonus;

    // Update participant (handle NULLs with defaults)
    const { error: updateError } = await client
      .from('cb_session_participants')
      .update({
        unlocked_squares: unlockedSquares,
        completed_lines: updatedCompletedLines,
        correct_answers: (participant.correct_answers || 0) + 1,
        total_xp: (participant.total_xp || 0) + totalXP,
        current_streak: currentStreak + 1,
        max_streak: Math.max(participant.max_streak || 0, currentStreak + 1),
      })
      .eq('id', participantId);

    if (updateError) {
      console.error(`❌ [processClick] Failed to update participant ${participant.display_name}:`, updateError);
    } else {
      console.log(`✅ [processClick] Updated ${participant.display_name} - Saved ${unlockedSquares.length} unlocked squares to DB`);

      // VERIFY: Read back what was actually saved
      const { data: verifyData } = await client
        .from('cb_session_participants')
        .select('unlocked_squares')
        .eq('id', participantId)
        .single();

      console.log(`🔍 [VERIFY] Immediately after update, DB shows ${(verifyData?.unlocked_squares || []).length} unlocked squares:`, verifyData?.unlocked_squares);
    }

    // Broadcast correct answer
    const { data: session } = await client
      .from('cb_game_sessions')
      .select('perpetual_room_id')
      .eq('id', sessionId)
      .single();

    if (session) {
      await discoveredLiveRealtimeService.broadcastPlayerClicked(
        session.perpetual_room_id,
        participantId,
        participant.display_name,
        clickedCareer,
        position,
        true,
        responseTime,
        position,
        participant.current_streak + 1,
        totalXP
      );
    }

    // Handle bingo if achieved
    if (hasBingo) {
      await this.handleBingo(sessionId, participantId, newBingos, questionState?.questionNumber || 0);
    }

    return { isCorrect: true, unlockedPosition: position, newBingo: hasBingo };
  }

  /**
   * Calculate streak bonus XP
   */
  private calculateStreakBonus(streak: number): number {
    if (streak < 3) return 0;
    if (streak < 5) return 5;
    if (streak < 7) return 10;
    return 15;
  }

  // ================================================================
  // BINGO HANDLING
  // ================================================================

  /**
   * Handle bingo achievement
   */
  private async handleBingo(
    sessionId: string,
    participantId: string,
    newBingos: { rows: number[]; columns: number[]; diagonals: number[]; corners?: boolean },
    questionNumber: number
  ): Promise<void> {
    const client = await supabase();

    // Get session
    const { data: session } = await client
      .from('cb_game_sessions')
      .select('*, cb_perpetual_rooms(*)')
      .eq('id', sessionId)
      .single();

    if (!session || session.bingo_slots_remaining <= 0) {
      return; // No more bingo slots available
    }

    // Get participant
    const { data: participant } = await client
      .from('cb_session_participants')
      .select('*')
      .eq('id', participantId)
      .single();

    if (!participant) return;

    // Determine which type of bingo (prioritize in order: row, column, diagonal, corners)
    let bingoType: 'row' | 'column' | 'diagonal' | 'corners';
    let bingoIndex: number;

    if (newBingos.rows.length > 0) {
      bingoType = 'row';
      bingoIndex = newBingos.rows[0];
    } else if (newBingos.columns.length > 0) {
      bingoType = 'column';
      bingoIndex = newBingos.columns[0];
    } else if (newBingos.diagonals.length > 0) {
      bingoType = 'diagonal';
      bingoIndex = newBingos.diagonals[0];
    } else {
      bingoType = 'corners';
      bingoIndex = 0; // Corners don't have an index
    }

    // Calculate bingo number (1-based)
    const bingoNumber = session.bingo_slots_total - session.bingo_slots_remaining + 1;

    // Create bingo winner record
    const bingoWinner: BingoWinner = {
      participantId,
      bingoNumber,
      bingoType,
      bingoIndex,
      claimedAt: new Date().toISOString(),
      questionNumber,
    };

    // Update session
    const bingoWinners = [...(session.bingo_winners || []), bingoWinner];
    await client
      .from('cb_game_sessions')
      .update({
        bingo_winners: bingoWinners,
        bingo_slots_remaining: session.bingo_slots_remaining - 1,
      })
      .eq('id', sessionId);

    // Update participant (handle NULLs)
    await client
      .from('cb_session_participants')
      .update({
        bingos_won: (participant.bingos_won || 0) + 1,
        total_xp: (participant.total_xp || 0) + this.getBingoXP(bingoNumber),
      })
      .eq('id', participantId);

    // Broadcast bingo achievement
    await discoveredLiveRealtimeService.broadcastBingoAchieved(
      session.perpetual_room_id,
      participantId,
      participant.display_name,
      bingoNumber,
      bingoType,
      bingoIndex,
      session.bingo_slots_remaining - 1,
      this.getBingoXP(bingoNumber)
    );

    console.log(`🎉 BINGO! ${participant.display_name} won bingo #${bingoNumber}`);

    // Check if game should end
    if (session.bingo_slots_remaining - 1 === 0) {
      console.log('🏁 All bingo slots claimed! Game will end.');
    }
  }

  /**
   * Get XP reward for bingo based on position
   */
  private getBingoXP(bingoNumber: number): number {
    switch (bingoNumber) {
      case 1: return 50;
      case 2: return 40;
      case 3: return 30;
      default: return 20;
    }
  }

  /**
   * Check all participants for new bingos
   */
  private async checkAllParticipantBingos(sessionId: string): Promise<void> {
    const participants = await perpetualRoomManager.getSessionParticipants(sessionId);

    for (const participant of participants) {
      const newBingos = perpetualRoomManager.checkForBingos(
        participant.unlockedSquares,
        participant.completedLines
      );

      const hasBingo = newBingos.rows.length > 0 || newBingos.columns.length > 0 || newBingos.diagonals.length > 0 || newBingos.corners === true;

      if (hasBingo) {
        const questionState = this.activeGames.get(sessionId);
        await this.handleBingo(sessionId, participant.id, newBingos, questionState?.questionNumber || 0);
      }
    }
  }

  // ================================================================
  // GAME END
  // ================================================================

  /**
   * End the game
   */
  private async endGame(sessionId: string): Promise<void> {
    this.stopGameLoop(sessionId);

    console.log(`🏁 Ending game for session ${sessionId}`);

    const client = await supabase();

    // Get session
    const { data: session } = await client
      .from('cb_game_sessions')
      .select('*, cb_perpetual_rooms(*)')
      .eq('id', sessionId)
      .single();

    if (!session) return;

    // Get participants for leaderboard
    const participants = await perpetualRoomManager.getSessionParticipants(sessionId);

    // Sort by bingos won, then XP
    const leaderboard = participants
      .sort((a, b) => {
        if (b.bingosWon !== a.bingosWon) {
          return b.bingosWon - a.bingosWon;
        }
        return b.totalXp - a.totalXp;
      })
      .map((p, index) => ({
        participantId: p.id,
        displayName: p.displayName,
        isAI: p.participantType === 'ai_agent',
        rank: index + 1,
        bingosWon: p.bingosWon,
        correctAnswers: p.correctAnswers,
        incorrectAnswers: p.incorrectAnswers,
        accuracy: p.correctAnswers / (p.correctAnswers + p.incorrectAnswers) * 100,
        totalXp: p.totalXp,
        maxStreak: p.maxStreak,
      }));

    // Complete game via PerpetualRoomManager
    await perpetualRoomManager.completeGame(sessionId);

    // Broadcast game completed
    const room = session.cb_perpetual_rooms;
    const nextGameStartsAt = new Date(Date.now() + (room.intermission_duration_seconds || 10) * 1000);

    await discoveredLiveRealtimeService.broadcastGameCompleted(
      session.perpetual_room_id,
      session.game_number,
      session.bingo_winners || [],
      leaderboard,
      nextGameStartsAt.toISOString(),
      room.intermission_duration_seconds || 10
    );

    console.log('🎊 Game completed! Leaderboard:', leaderboard);
  }

  // ================================================================
  // UTILITIES
  // ================================================================

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get active question state
   */
  getQuestionState(sessionId: string): QuestionState | undefined {
    return this.activeGames.get(sessionId);
  }

  /**
   * Check if game loop is running
   */
  isGameRunning(sessionId: string): boolean {
    return this.gameLoops.get(sessionId) || false;
  }
}

export const gameOrchestrator = GameOrchestrator.getInstance();
export type { QuestionState };
