/**
 * Perpetual Room Manager
 * Manages always-on multiplayer rooms for Discovered Live!
 *
 * Features:
 * - Room lifecycle management (active -> intermission -> active)
 * - Game session creation and completion
 * - Participant management (humans + AI)
 * - Spectator handling
 * - Bingo slot tracking
 * - Real-time state updates
 */

import { supabase } from '../lib/supabase';
import { aiPlayerPoolService } from './AIPlayerPoolService';
import type {
  PerpetualRoom,
  GameSession,
  SessionParticipant,
  Spectator,
  BingoWinner,
  DbPerpetualRoom,
  DbGameSession,
  DbSessionParticipant,
  DbSpectator,
  dbRoomToRoom,
  dbSessionToSession,
  dbParticipantToParticipant,
  dbSpectatorToSpectator,
  calculateBingoSlots,
} from '../types/DiscoveredLiveMultiplayerTypes';
import type { BingoGrid, GridPosition } from '../types/DiscoveredLiveTypes';

class PerpetualRoomManager {
  private static instance: PerpetualRoomManager;

  private constructor() {}

  static getInstance(): PerpetualRoomManager {
    if (!PerpetualRoomManager.instance) {
      PerpetualRoomManager.instance = new PerpetualRoomManager();
    }
    return PerpetualRoomManager.instance;
  }

  // ================================================================
  // ROOM MANAGEMENT
  // ================================================================

  /**
   * Get all active featured rooms
   */
  async getFeaturedRooms(): Promise<PerpetualRoom[]> {
    const client = await supabase();

    const { data, error } = await client
      .from('cb_perpetual_rooms')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('room_code');

    if (error) {
      console.error('Error fetching featured rooms:', error);
      return [];
    }

    return data.map((room: DbPerpetualRoom) => ({
      id: room.id,
      roomCode: room.room_code,
      roomName: room.room_name,
      themeCode: room.theme_code,
      status: room.status,
      currentGameNumber: room.current_game_number,
      currentGameId: room.current_game_id,
      nextGameStartsAt: room.next_game_starts_at,
      intermissionDurationSeconds: room.intermission_duration_seconds,
      maxPlayersPerGame: room.max_players_per_game,
      currentPlayerCount: room.current_player_count,
      spectatorCount: room.spectator_count,
      bingoSlotsPerGame: room.bingo_slots_per_game,
      questionTimeLimitSeconds: room.question_time_limit_seconds,
      questionsPerGame: room.questions_per_game,
      gradeLevel: room.grade_level,
      aiFillEnabled: room.ai_fill_enabled,
      aiDifficultyMix: room.ai_difficulty_mix,
      totalGamesPlayed: room.total_games_played,
      totalUniquePlayers: room.total_unique_players,
      totalBingosWon: room.total_bingos_won,
      peakConcurrentPlayers: room.peak_concurrent_players,
      avgGameDurationSeconds: room.avg_game_duration_seconds,
      isActive: room.is_active,
      isFeatured: room.is_featured,
      createdAt: room.created_at,
      lastGameStartedAt: room.last_game_started_at,
      updatedAt: room.updated_at,
    }));
  }

  /**
   * Get room by code
   */
  async getRoomByCode(roomCode: string): Promise<PerpetualRoom | null> {
    const client = await supabase();

    const { data, error } = await client
      .from('cb_perpetual_rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (error || !data) {
      console.error('Error fetching room:', error);
      return null;
    }

    return {
      id: data.id,
      roomCode: data.room_code,
      roomName: data.room_name,
      themeCode: data.theme_code,
      status: data.status,
      currentGameNumber: data.current_game_number,
      currentGameId: data.current_game_id,
      nextGameStartsAt: data.next_game_starts_at,
      intermissionDurationSeconds: data.intermission_duration_seconds,
      maxPlayersPerGame: data.max_players_per_game,
      currentPlayerCount: data.current_player_count,
      spectatorCount: data.spectator_count,
      bingoSlotsPerGame: data.bingo_slots_per_game,
      questionTimeLimitSeconds: data.question_time_limit_seconds,
      questionsPerGame: data.questions_per_game,
      gradeLevel: data.grade_level,
      aiFillEnabled: data.ai_fill_enabled,
      aiDifficultyMix: data.ai_difficulty_mix,
      totalGamesPlayed: data.total_games_played,
      totalUniquePlayers: data.total_unique_players,
      totalBingosWon: data.total_bingos_won,
      peakConcurrentPlayers: data.peak_concurrent_players,
      avgGameDurationSeconds: data.avg_game_duration_seconds,
      isActive: data.is_active,
      isFeatured: data.is_featured,
      createdAt: data.created_at,
      lastGameStartedAt: data.last_game_started_at,
      updatedAt: data.updated_at,
    };
  }

  // ================================================================
  // GAME SESSION MANAGEMENT
  // ================================================================

  /**
   * Start a new game in a perpetual room
   * @param currentUserId - The ID of the user who triggered the game start (for career code assignment)
   * @param currentUserCareerCode - The career code for the current user's center square
   */
  async startNewGame(
    roomId: string,
    currentUserId?: string,
    currentUserCareerCode?: string
  ): Promise<GameSession> {
    const client = await supabase();

    // 1. Get room details
    const { data: roomData, error: roomError } = await client
      .from('cb_perpetual_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !roomData) {
      throw new Error(`Failed to fetch room: ${roomError?.message}`);
    }

    const room = roomData as DbPerpetualRoom;

    // 2. Get spectators who will join
    const { data: spectators } = await client
      .from('cb_spectators')
      .select('*')
      .eq('perpetual_room_id', roomId)
      .eq('will_join_next_game', true);

    const humanCount = spectators?.length || 0;

    // 3. Calculate AI needed
    const aiNeeded = Math.max(0, room.max_players_per_game - humanCount);

    // 4. Create game session
    const gameNumber = room.current_game_number + 1;
    const bingoSlots = room.bingo_slots_per_game;

    // Clean up any existing session for this game number (from failed previous attempts)
    await client
      .from('cb_game_sessions')
      .delete()
      .eq('perpetual_room_id', roomId)
      .eq('game_number', gameNumber);

    const { data: session, error: sessionError } = await client
      .from('cb_game_sessions')
      .insert({
        perpetual_room_id: roomId,
        game_number: gameNumber,
        status: 'active',
        bingo_slots_total: bingoSlots,
        bingo_slots_remaining: bingoSlots,
        bingo_winners: [],
        current_question_number: 0,
        total_questions: room.questions_per_game,
        questions_asked: [],
        total_participants: humanCount + aiNeeded,
        human_participants: humanCount,
        ai_participants: aiNeeded,
      })
      .select()
      .single();

    if (sessionError || !session) {
      throw new Error(`Failed to create game session: ${sessionError?.message}`);
    }

    // 5. Create participants (humans from spectators)
    if (spectators && spectators.length > 0) {
      for (const spectator of spectators) {
        // Use the provided career code if this is the current user, otherwise default to 'teacher'
        const careerCode = (spectator.user_id === currentUserId && currentUserCareerCode)
          ? currentUserCareerCode
          : 'teacher';

        console.log(`👤 Adding participant: ${spectator.display_name}, userId: ${spectator.user_id}, careerCode: ${careerCode}`);

        await this.addHumanParticipant(session.id, roomId, spectator.user_id, spectator.display_name, careerCode, room.grade_level);
      }

      // Clear spectators (they're now active players)
      await client
        .from('cb_spectators')
        .delete()
        .eq('perpetual_room_id', roomId);
    }

    // 6. Add AI agents
    if (aiNeeded > 0) {
      await this.addAIAgents(session.id, roomId, aiNeeded, room.ai_difficulty_mix, room.grade_level);
    }

    // 7. Update room state
    await client
      .from('cb_perpetual_rooms')
      .update({
        status: 'active',
        current_game_number: gameNumber,
        current_game_id: session.id,
        last_game_started_at: new Date().toISOString(),
        spectator_count: 0,
      })
      .eq('id', roomId);

    return {
      id: session.id,
      perpetualRoomId: session.perpetual_room_id,
      gameNumber: session.game_number,
      status: session.status,
      bingoSlotsTotal: session.bingo_slots_total,
      bingoSlotsRemaining: session.bingo_slots_remaining,
      bingoWinners: session.bingo_winners || [],
      currentQuestionNumber: session.current_question_number,
      totalQuestions: session.total_questions,
      questionsAsked: session.questions_asked || [],
      startedAt: session.started_at,
      totalParticipants: session.total_participants,
      humanParticipants: session.human_participants,
      aiParticipants: session.ai_participants,
    };
  }

  /**
   * Complete a game and start intermission
   */
  async completeGame(sessionId: string): Promise<void> {
    const client = await supabase();

    // 1. Get session
    const { data: session, error: sessionError } = await client
      .from('cb_game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new Error(`Failed to fetch session: ${sessionError?.message}`);
    }

    // 2. Calculate duration
    const startedAt = new Date(session.started_at);
    const now = new Date();
    const durationSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);

    // 3. Mark session as completed
    await client
      .from('cb_game_sessions')
      .update({
        status: 'completed',
        completed_at: now.toISOString(),
        duration_seconds: durationSeconds,
      })
      .eq('id', sessionId);

    // 4. Get room and start intermission
    const { data: room } = await client
      .from('cb_perpetual_rooms')
      .select('*')
      .eq('id', session.perpetual_room_id)
      .single();

    if (room) {
      const nextGameStartsAt = new Date(now.getTime() + room.intermission_duration_seconds * 1000);

      await client
        .from('cb_perpetual_rooms')
        .update({
          status: 'intermission',
          next_game_starts_at: nextGameStartsAt.toISOString(),
        })
        .eq('id', session.perpetual_room_id);
    }
  }

  // ================================================================
  // PARTICIPANT MANAGEMENT
  // ================================================================

  /**
   * Add human participant to game session
   * @param userCareerCode - The user's career code for center square
   * @param gradeLevel - Grade level from room (maps to grade_category in clues)
   */
  private async addHumanParticipant(
    sessionId: string,
    roomId: string,
    userId: string,
    displayName: string,
    userCareerCode: string,
    gradeLevel: string
  ): Promise<SessionParticipant> {
    const client = await supabase();

    // Generate unique bingo card for this participant with their career in center
    const bingoCard = await this.generateUniqueBingoCard(gradeLevel, userCareerCode);

    const { data, error } = await client
      .from('cb_session_participants')
      .insert({
        game_session_id: sessionId,
        perpetual_room_id: roomId,
        participant_type: 'human',
        user_id: userId,
        display_name: displayName,
        bingo_card: bingoCard,
        unlocked_squares: [],
        completed_lines: { rows: [], columns: [], diagonals: [] },
        connection_status: 'connected',
        is_active: true, // Explicitly set for consistency
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to add participant: ${error?.message}`);
    }

    return {
      id: data.id,
      gameSessionId: data.game_session_id,
      perpetualRoomId: data.perpetual_room_id,
      participantType: data.participant_type,
      studentId: data.user_id,
      displayName: data.display_name,
      bingoCard: data.bingo_card,
      unlockedSquares: data.unlocked_squares || [],
      completedLines: data.completed_lines || { rows: [], columns: [], diagonals: [] },
      bingosWon: data.bingos_won,
      correctAnswers: data.correct_answers,
      incorrectAnswers: data.incorrect_answers,
      totalXp: data.total_xp,
      currentStreak: data.current_streak,
      maxStreak: data.max_streak,
      isActive: data.is_active,
      connectionStatus: data.connection_status,
      joinedAt: data.joined_at,
    };
  }

  /**
   * Add AI agents to game session
   */
  private async addAIAgents(
    sessionId: string,
    roomId: string,
    count: number,
    difficultyMix: 'mixed' | 'easy' | 'medium' | 'hard',
    gradeLevel: string
  ): Promise<void> {
    const client = await supabase();

    // Get AI players from centralized pool (ensures consistent names across all games)
    const aiPlayers = aiPlayerPoolService.getRandomPlayers(count, roomId);
    console.log(`🤖 Adding ${aiPlayers.length} AI players from centralized pool:`, aiPlayers.map(p => p.name).join(', '));

    for (const aiPlayer of aiPlayers) {
      // Generate unique bingo card for each AI
      const bingoCard = await this.generateUniqueBingoCard(gradeLevel);

      // Map difficulty based on difficultyMix
      const difficulty = difficultyMix === 'mixed'
        ? ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
        : difficultyMix;

      await client
        .from('cb_session_participants')
        .insert({
          game_session_id: sessionId,
          perpetual_room_id: roomId,
          participant_type: 'ai_agent',
          user_id: aiPlayer.id, // Use centralized AI player ID
          display_name: aiPlayer.name, // Use centralized AI player name
          ai_difficulty: difficulty as 'easy' | 'medium' | 'hard',
          ai_personality: 'friendly', // Default personality (can be randomized if needed)
          bingo_card: bingoCard,
          unlocked_squares: [],
          completed_lines: { rows: [], columns: [], diagonals: [] },
          connection_status: 'connected',
          is_active: true, // Ensure AI players appear in leaderboard
        });
    }

    console.log(`✅ Added ${aiPlayers.length} AI players to Career Bingo session ${sessionId}`);
  }

  /**
   * Generate a unique 5x5 bingo card with scrambled careers
   * @param gradeCategory - The grade category for filtering careers (e.g., 'elementary')
   * @param userCareerCode - Optional career code to place in center square (player's career)
   */
  private async generateUniqueBingoCard(
    gradeCategory: string,
    userCareerCode?: string
  ): Promise<BingoGrid> {
    const client = await supabase();

    // Get distinct career codes with active clues
    const { data: cluesData } = await client
      .from('cb_clues')
      .select('career_code')
      .eq('grade_category', gradeCategory)
      .eq('is_active', true);

    if (!cluesData || cluesData.length === 0) {
      throw new Error(`No careers found with clues for grade: ${gradeCategory}`);
    }

    // Get unique career codes
    const uniqueCareerCodes = [...new Set(cluesData.map(c => c.career_code))];

    // Shuffle careers
    const shuffled = uniqueCareerCodes.sort(() => Math.random() - 0.5);

    // Determine center square career
    let centerCareer: string;
    if (userCareerCode && uniqueCareerCodes.includes(userCareerCode)) {
      // Use player's career if it's available in this grade category
      centerCareer = userCareerCode;
      console.log(`✅ Using player's career for center: ${userCareerCode}`);
    } else {
      // Fallback to random career from available list
      centerCareer = shuffled[Math.floor(Math.random() * shuffled.length)];
      if (userCareerCode) {
        console.warn(`⚠️ User career '${userCareerCode}' not found in ${gradeCategory} careers, using random: ${centerCareer}`);
      }
    }

    // Take first 24 careers for outer squares (exclude center career to avoid duplicates)
    const availableForGrid = shuffled.filter(c => c !== centerCareer);
    const gridCareers = availableForGrid.slice(0, 24);

    // Fill any gaps if we don't have 24 unique careers (shouldn't happen with 42 elementary careers)
    while (gridCareers.length < 24) {
      gridCareers.push(shuffled[gridCareers.length % shuffled.length]);
    }

    // Generate 5x5 grid
    const grid: string[][] = [];
    let careerIndex = 0;

    for (let row = 0; row < 5; row++) {
      grid[row] = [];
      for (let col = 0; col < 5; col++) {
        // Center square (2,2) gets the player's career (or random if not provided)
        if (row === 2 && col === 2) {
          grid[row][col] = centerCareer;
        } else {
          grid[row][col] = gridCareers[careerIndex];
          careerIndex++;
        }
      }
    }

    return {
      careers: grid,
      userCareerPosition: { row: 2, col: 2 },
    };
  }

  /**
   * Get all participants in a session
   */
  async getSessionParticipants(sessionId: string): Promise<SessionParticipant[]> {
    const client = await supabase();

    const { data, error } = await client
      .from('cb_session_participants')
      .select('*')
      .eq('game_session_id', sessionId)
      .eq('is_active', true);

    if (error || !data) {
      console.error('Error fetching participants:', error);
      return [];
    }

    return data.map(p => ({
      id: p.id,
      gameSessionId: p.game_session_id,
      perpetualRoomId: p.perpetual_room_id,
      participantType: p.participant_type,
      studentId: p.user_id,
      displayName: p.display_name,
      aiDifficulty: p.ai_difficulty,
      aiPersonality: p.ai_personality,
      bingoCard: p.bingo_card,
      unlockedSquares: p.unlocked_squares || [],
      completedLines: p.completed_lines || { rows: [], columns: [], diagonals: [] },
      bingosWon: p.bingos_won,
      correctAnswers: p.correct_answers,
      incorrectAnswers: p.incorrect_answers,
      totalXp: p.total_xp,
      currentStreak: p.current_streak,
      maxStreak: p.max_streak,
      isActive: p.is_active,
      connectionStatus: p.connection_status,
      joinedAt: p.joined_at,
      leftAt: p.left_at,
    }));
  }

  // ================================================================
  // SPECTATOR MANAGEMENT
  // ================================================================

  /**
   * Add spectator to room (or update if already exists)
   * Note: Career code is stored in sessionStorage on client and passed when game starts
   */
  async addSpectator(
    roomId: string,
    userId: string,
    displayName: string
  ): Promise<Spectator> {
    const client = await supabase();

    // Get current game session ID
    const { data: room } = await client
      .from('cb_perpetual_rooms')
      .select('current_game_id')
      .eq('id', roomId)
      .single();

    // First, check if spectator already exists
    const { data: existingSpectator } = await client
      .from('cb_spectators')
      .select('*')
      .eq('perpetual_room_id', roomId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingSpectator) {
      // Update existing spectator record
      const { data: updated, error: updateError } = await client
        .from('cb_spectators')
        .update({
          current_game_session_id: room?.current_game_id,
          display_name: displayName,
          will_join_next_game: true,
          started_spectating_at: new Date().toISOString(),
        })
        .eq('id', existingSpectator.id)
        .select()
        .single();

      if (updateError || !updated) {
        throw new Error(`Failed to update spectator: ${updateError?.message}`);
      }

      console.log('🔄 Updated existing spectator record');

      return {
        id: updated.id,
        perpetualRoomId: updated.perpetual_room_id,
        currentGameSessionId: updated.current_game_session_id,
        studentId: updated.user_id,
        displayName: updated.display_name,
        willJoinNextGame: updated.will_join_next_game,
        startedSpectatingAt: updated.started_spectating_at,
      };
    }

    // Insert new spectator
    const { data, error } = await client
      .from('cb_spectators')
      .insert({
        perpetual_room_id: roomId,
        current_game_session_id: room?.current_game_id,
        user_id: userId,
        display_name: displayName,
        will_join_next_game: true,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to add spectator: ${error?.message}`);
    }

    console.log('✅ Added new spectator');

    return {
      id: data.id,
      perpetualRoomId: data.perpetual_room_id,
      currentGameSessionId: data.current_game_session_id,
      studentId: data.user_id,
      displayName: data.display_name,
      willJoinNextGame: data.will_join_next_game,
      startedSpectatingAt: data.started_spectating_at,
    };
  }

  /**
   * Remove spectator from room
   */
  async removeSpectator(roomId: string, userId: string): Promise<void> {
    const client = await supabase();

    await client
      .from('cb_spectators')
      .delete()
      .eq('perpetual_room_id', roomId)
      .eq('user_id', userId);
  }

  /**
   * Get all spectators in a room
   */
  async getSpectators(roomId: string): Promise<Spectator[]> {
    const client = await supabase();

    const { data, error } = await client
      .from('cb_spectators')
      .select('*')
      .eq('perpetual_room_id', roomId);

    if (error || !data) {
      console.error('Error fetching spectators:', error);
      return [];
    }

    return data.map(s => ({
      id: s.id,
      perpetualRoomId: s.perpetual_room_id,
      currentGameSessionId: s.current_game_session_id,
      studentId: s.user_id,
      displayName: s.display_name,
      willJoinNextGame: s.will_join_next_game,
      startedSpectatingAt: s.started_spectating_at,
    }));
  }

  // ================================================================
  // BINGO TRACKING
  // ================================================================

  /**
   * Check for new bingos for a participant
   */
  checkForBingos(
    unlockedSquares: GridPosition[],
    completedLines: { rows: number[]; columns: number[]; diagonals: number[] }
  ): { rows: number[]; columns: number[]; diagonals: number[] } {
    const newRows: number[] = [];
    const newColumns: number[] = [];
    const newDiagonals: number[] = [];

    // Check rows (0-4)
    for (let row = 0; row < 5; row++) {
      if (completedLines.rows.includes(row)) continue;

      const rowComplete = [0, 1, 2, 3, 4].every(col =>
        unlockedSquares.some(pos => pos.row === row && pos.col === col)
      );

      if (rowComplete) {
        newRows.push(row);
      }
    }

    // Check columns (0-4)
    for (let col = 0; col < 5; col++) {
      if (completedLines.columns.includes(col)) continue;

      const colComplete = [0, 1, 2, 3, 4].every(row =>
        unlockedSquares.some(pos => pos.row === row && pos.col === col)
      );

      if (colComplete) {
        newColumns.push(col);
      }
    }

    // Check diagonal 1 (top-left to bottom-right: 0)
    if (!completedLines.diagonals.includes(0)) {
      const diag1Complete = [0, 1, 2, 3, 4].every(i =>
        unlockedSquares.some(pos => pos.row === i && pos.col === i)
      );

      if (diag1Complete) {
        newDiagonals.push(0);
      }
    }

    // Check diagonal 2 (top-right to bottom-left: 1)
    if (!completedLines.diagonals.includes(1)) {
      const diag2Complete = [0, 1, 2, 3, 4].every(i =>
        unlockedSquares.some(pos => pos.row === i && pos.col === 4 - i)
      );

      if (diag2Complete) {
        newDiagonals.push(1);
      }
    }

    return { rows: newRows, columns: newColumns, diagonals: newDiagonals };
  }
}

export const perpetualRoomManager = PerpetualRoomManager.getInstance();
