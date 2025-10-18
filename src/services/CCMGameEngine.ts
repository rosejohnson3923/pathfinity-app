/**
 * Career Challenge Multiplayer (CCM) Game Engine
 * Manages round-based gameplay in perpetual rooms
 *
 * Key Differences from CC:
 * - Round-based (5 rounds per game) vs turn-based
 * - Simultaneous play vs sequential turns
 * - 60-second rounds vs 90-second turns
 * - MVP voting after each round
 * - Perpetual room integration (games cycle continuously)
 */

import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface CCMGameState {
  sessionId: string;
  roomId: string;
  gameNumber: number;
  phase: CCMGamePhase;
  currentRound: number;
  totalRounds: number;
  participants: Map<string, CCMParticipantState>;
  currentChallengeCard?: CCMChallengeCard;
  roundTimer: number;
  events: CCMGameEvent[];
  roundStartedAt?: string;
}

export type CCMGamePhase =
  | 'waiting'        // Waiting for game to start
  | 'active'         // Game in progress
  | 'round_playing'  // Round in progress (card selection)
  | 'round_voting'   // MVP voting phase
  | 'round_results'  // Showing round results
  | 'game_over'      // Game complete, showing final leaderboard
  | 'intermission';  // Between games

export interface CCMParticipantState {
  participantId: string;
  participantType: 'human' | 'ai_agent';
  studentId: string | null;
  displayName: string;
  roleHand: string[];           // Array of 10 role card IDs
  synergyHand: string[];        // Array of 5 synergy card IDs
  hasGoldenCard: boolean;
  cSuiteChoice?: string;        // Selected C-suite role
  totalScore: number;
  roundScores: number[];        // Score per round [round1, round2, ...]
  mvpBonuses: number;           // Total MVP bonuses earned
  currentRoundPlay?: {
    roleCardId: string;
    synergyCardId: string;
    useGoldenCard: boolean;
    useMvpBonus: boolean;
    submittedAt: string;
  };
  isActive: boolean;
  isReady: boolean;
}

export interface CCMChallengeCard {
  id: string;
  code: string;
  displayName: string;
  description: string;
  difficulty: string;
  baseScores: { perfect: number; good: number; pass: number };
}

export interface CCMGameEvent {
  type: 'round_started' | 'round_ended' | 'cards_submitted' | 'mvp_selected' | 'game_started' | 'game_ended';
  participantId: string;
  data?: any;
  timestamp: string;
}

export class CCMGameEngine {
  private supabase: any;
  private gameState: CCMGameState | null = null;
  private subscriptions: Map<string, any> = new Map();
  private roundTimerInterval?: NodeJS.Timeout;

  // Game configuration for CCM
  private readonly CONFIG = {
    TOTAL_ROUNDS: 5,
    ROUND_DURATION_SECONDS: 60,
    MVP_VOTING_SECONDS: 15,
    RESULTS_DISPLAY_SECONDS: 5,
    MIN_PARTICIPANTS: 2,
    MAX_PARTICIPANTS: 8,
    ROLE_CARDS_PER_HAND: 10,
    SYNERGY_CARDS_PER_HAND: 5,
    GOLDEN_CARD_MULTIPLIER: 2,
    MVP_BONUS_SCORE: 10,
  };

  constructor() {
    this.initSupabase();
  }

  private async initSupabase() {
    this.supabase = await supabase();
  }

  /**
   * Initialize a new game session in perpetual room
   */
  async createGameSession(
    roomId: string,
    gameNumber: number
  ): Promise<CCMGameState> {
    try {
      if (!this.supabase) await this.initSupabase();

      // Create game session in database
      const { data: session, error } = await this.supabase
        .from('ccm_game_sessions')
        .insert({
          perpetual_room_id: roomId,
          game_number: gameNumber,
          status: 'active',
          current_round: 1,
          total_rounds: this.CONFIG.TOTAL_ROUNDS,
          rounds_completed: 0,
          total_participants: 0,
          human_participants: 0,
          ai_participants: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating game session:', error);
        throw new Error('Failed to create game session');
      }

      // Initialize game state
      this.gameState = {
        sessionId: session.id,
        roomId: roomId,
        gameNumber: gameNumber,
        phase: 'waiting',
        currentRound: 1,
        totalRounds: this.CONFIG.TOTAL_ROUNDS,
        participants: new Map(),
        roundTimer: this.CONFIG.ROUND_DURATION_SECONDS,
        events: [],
      };

      // Setup real-time subscriptions
      await this.setupSubscriptions(session.id);

      // Update room status
      await this.supabase
        .from('ccm_perpetual_rooms')
        .update({
          status: 'active',
          current_game_id: session.id,
          current_game_number: gameNumber,
          last_game_started_at: new Date().toISOString()
        })
        .eq('id', roomId);

      return this.gameState;
    } catch (error) {
      console.error('Error creating CCM game session:', error);
      throw error;
    }
  }

  /**
   * Join an existing game session
   */
  async joinGameSession(
    sessionId: string,
    participantId?: string
  ): Promise<CCMGameState> {
    try {
      if (!this.supabase) await this.initSupabase();

      // Get session details
      const { data: session, error } = await this.supabase
        .from('ccm_game_sessions')
        .select(`
          *,
          ccm_session_participants (*)
        `)
        .eq('id', sessionId)
        .single();

      if (error || !session) {
        throw new Error('Session not found');
      }

      // Initialize game state if not already loaded
      if (!this.gameState) {
        this.gameState = {
          sessionId: session.id,
          roomId: session.perpetual_room_id,
          gameNumber: session.game_number,
          phase: session.status as CCMGamePhase,
          currentRound: session.current_round || 1,
          totalRounds: this.CONFIG.TOTAL_ROUNDS,
          participants: new Map(),
          roundTimer: this.CONFIG.ROUND_DURATION_SECONDS,
          events: [],
        };

        // Load existing participants
        if (session.ccm_session_participants && Array.isArray(session.ccm_session_participants)) {
          for (const participant of session.ccm_session_participants) {
            this.gameState.participants.set(participant.id, {
              participantId: participant.id,
              participantType: participant.participant_type,
              studentId: participant.student_id,
              displayName: participant.display_name,
              roleHand: participant.role_hand || [],
              synergyHand: participant.synergy_hand || [],
              hasGoldenCard: participant.has_golden_card ?? true,
              cSuiteChoice: participant.c_suite_choice,
              totalScore: participant.total_score || 0,
              roundScores: [],
              mvpBonuses: 0,
              isActive: participant.is_active ?? true,
              isReady: false,
            });
          }
        }

        // Setup subscriptions
        await this.setupSubscriptions(session.id);
      }

      // Add specific participant to local state if provided
      if (participantId && !this.gameState.participants.has(participantId)) {
        const participant = session.ccm_session_participants?.find(
          (p: any) => p.id === participantId
        );
        if (participant) {
          this.gameState.participants.set(participant.id, {
            participantId: participant.id,
            participantType: participant.participant_type,
            studentId: participant.student_id,
            displayName: participant.display_name,
            roleHand: participant.role_hand || [],
            synergyHand: participant.synergy_hand || [],
            hasGoldenCard: participant.has_golden_card ?? true,
            cSuiteChoice: participant.c_suite_choice,
            totalScore: participant.total_score || 0,
            roundScores: [],
            mvpBonuses: 0,
            isActive: participant.is_active ?? true,
            isReady: false,
          });
        }
      }

      return this.gameState;
    } catch (error) {
      console.error('Error joining CCM session:', error);
      throw error;
    }
  }

  /**
   * Start the game (all participants ready)
   */
  async startGame(): Promise<void> {
    if (!this.gameState) {
      throw new Error('No active game state');
    }

    if (this.gameState.participants.size < this.CONFIG.MIN_PARTICIPANTS) {
      throw new Error(`Minimum ${this.CONFIG.MIN_PARTICIPANTS} participants required`);
    }

    // Update game status
    this.gameState.phase = 'active';

    await this.supabase
      .from('ccm_game_sessions')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', this.gameState.sessionId);

    // Broadcast game start
    await this.broadcastEvent({
      type: 'game_started',
      participantId: 'system',
      timestamp: new Date().toISOString(),
    });

    // Start first round
    await this.startRound(1);
  }

  /**
   * Start a new round
   */
  async startRound(roundNumber: number): Promise<void> {
    if (!this.gameState) return;

    this.gameState.currentRound = roundNumber;
    this.gameState.phase = 'round_playing';
    this.gameState.roundStartedAt = new Date().toISOString();

    // Draw challenge card for this round
    const challengeCard = await this.drawChallengeCard();
    this.gameState.currentChallengeCard = challengeCard;

    // Clear previous round plays
    for (const participant of this.gameState.participants.values()) {
      participant.currentRoundPlay = undefined;
    }

    // Update session
    await this.supabase
      .from('ccm_game_sessions')
      .update({ current_round: roundNumber })
      .eq('id', this.gameState.sessionId);

    // Start round timer
    this.startRoundTimer();

    // Broadcast round start
    await this.broadcastEvent({
      type: 'round_started',
      participantId: 'system',
      data: {
        roundNumber,
        challengeCard,
        duration: this.CONFIG.ROUND_DURATION_SECONDS,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Participant submits their card selection for the round
   */
  async submitCards(
    participantId: string,
    roleCardId: string,
    synergyCardId: string,
    useGoldenCard: boolean = false,
    useMvpBonus: boolean = false
  ): Promise<{ success: boolean; message?: string }> {
    if (!this.gameState) {
      throw new Error('No active game');
    }

    if (this.gameState.phase !== 'round_playing') {
      throw new Error('Not in card selection phase');
    }

    const participant = this.gameState.participants.get(participantId);
    if (!participant) {
      throw new Error('Participant not found');
    }

    if (participant.currentRoundPlay) {
      throw new Error('Cards already submitted for this round');
    }

    // Validate card selection
    if (!participant.roleHand.includes(roleCardId)) {
      throw new Error('Invalid role card selection');
    }

    if (!participant.synergyHand.includes(synergyCardId)) {
      throw new Error('Invalid synergy card selection');
    }

    if (useGoldenCard && !participant.hasGoldenCard) {
      throw new Error('Golden card not available');
    }

    // Record the play
    participant.currentRoundPlay = {
      roleCardId,
      synergyCardId,
      useGoldenCard,
      useMvpBonus,
      submittedAt: new Date().toISOString(),
    };

    // Save to database
    await this.supabase
      .from('ccm_round_plays')
      .insert({
        game_session_id: this.gameState.sessionId,
        participant_id: participantId,
        round_number: this.gameState.currentRound,
        challenge_card_id: this.gameState.currentChallengeCard?.id,
        slot_1_role_card_id: roleCardId,
        slot_2_synergy_card_id: synergyCardId,
        slot_3_card_type: useGoldenCard ? 'golden' : (useMvpBonus ? 'mvp' : null),
      });

    // Broadcast submission
    await this.broadcastEvent({
      type: 'cards_submitted',
      participantId,
      data: { roundNumber: this.gameState.currentRound },
      timestamp: new Date().toISOString(),
    });

    // Check if all participants have submitted
    const allSubmitted = Array.from(this.gameState.participants.values())
      .filter(p => p.isActive)
      .every(p => p.currentRoundPlay !== undefined);

    if (allSubmitted) {
      await this.endRound();
    }

    return { success: true };
  }

  /**
   * End the current round and calculate scores
   */
  private async endRound(): Promise<void> {
    if (!this.gameState) return;

    this.clearRoundTimer();
    this.gameState.phase = 'round_voting';

    // Calculate scores for all participants
    for (const [participantId, participant] of this.gameState.participants.entries()) {
      if (!participant.currentRoundPlay || !participant.isActive) continue;

      // Calculate base score (would integrate with soft skills matrix)
      const baseScore = this.calculateRoundScore(participant);

      // Apply golden card multiplier
      let finalScore = baseScore;
      if (participant.currentRoundPlay.useGoldenCard) {
        finalScore *= this.CONFIG.GOLDEN_CARD_MULTIPLIER;
        participant.hasGoldenCard = false; // Consume golden card
      }

      // Apply MVP bonus if applicable
      if (participant.currentRoundPlay.useMvpBonus) {
        finalScore += this.CONFIG.MVP_BONUS_SCORE;
      }

      participant.roundScores.push(finalScore);
      participant.totalScore += finalScore;

      // Update database
      await this.supabase
        .from('ccm_round_plays')
        .update({
          base_score: baseScore,
          final_score: finalScore,
        })
        .eq('game_session_id', this.gameState.sessionId)
        .eq('participant_id', participantId)
        .eq('round_number', this.gameState.currentRound);
    }

    // Update participant totals
    for (const participant of this.gameState.participants.values()) {
      await this.supabase
        .from('ccm_session_participants')
        .update({ total_score: participant.totalScore })
        .eq('id', participant.participantId);
    }

    // Update rounds completed
    await this.supabase
      .from('ccm_game_sessions')
      .update({ rounds_completed: this.gameState.currentRound })
      .eq('id', this.gameState.sessionId);

    // Broadcast round end
    await this.broadcastEvent({
      type: 'round_ended',
      participantId: 'system',
      data: {
        roundNumber: this.gameState.currentRound,
        scores: Array.from(this.gameState.participants.entries()).map(([id, p]) => ({
          participantId: id,
          displayName: p.displayName,
          roundScore: p.roundScores[this.gameState!.currentRound - 1],
          totalScore: p.totalScore,
        })),
      },
      timestamp: new Date().toISOString(),
    });

    // Start MVP voting phase
    setTimeout(() => {
      this.endMvpVoting();
    }, this.CONFIG.MVP_VOTING_SECONDS * 1000);
  }

  /**
   * End MVP voting and move to next round or game over
   */
  private async endMvpVoting(): Promise<void> {
    if (!this.gameState) return;

    this.gameState.phase = 'round_results';

    // Show results briefly
    setTimeout(async () => {
      if (!this.gameState) return;

      // Check if game is complete
      if (this.gameState.currentRound >= this.CONFIG.TOTAL_ROUNDS) {
        await this.endGame();
      } else {
        // Start next round
        await this.startRound(this.gameState.currentRound + 1);
      }
    }, this.CONFIG.RESULTS_DISPLAY_SECONDS * 1000);
  }

  /**
   * End the game and transition to intermission
   */
  private async endGame(): Promise<void> {
    if (!this.gameState) return;

    this.gameState.phase = 'game_over';
    this.clearRoundTimer();

    // Calculate final rankings
    const rankings = Array.from(this.gameState.participants.values())
      .filter(p => p.isActive)
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((participant, index) => ({
        rank: index + 1,
        participantId: participant.participantId,
        displayName: participant.displayName,
        totalScore: participant.totalScore,
        roundScores: participant.roundScores,
      }));

    const winner = rankings[0];

    // Update session
    const duration = this.gameState.roundStartedAt
      ? Math.floor((new Date().getTime() - new Date(this.gameState.roundStartedAt).getTime()) / 1000)
      : 0;

    await this.supabase
      .from('ccm_game_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        duration_seconds: duration,
        rounds_completed: this.CONFIG.TOTAL_ROUNDS,
        winner_participant_id: winner.participantId,
        final_scores: rankings,
      })
      .eq('id', this.gameState.sessionId);

    // Start intermission
    const nextGameStartsAt = new Date(Date.now() + 15000); // 15 seconds

    await this.supabase
      .from('ccm_perpetual_rooms')
      .update({
        status: 'intermission',
        next_game_starts_at: nextGameStartsAt.toISOString(),
      })
      .eq('id', this.gameState.roomId);

    // Broadcast game end
    await this.broadcastEvent({
      type: 'game_ended',
      participantId: 'system',
      data: {
        rankings,
        winner: winner.displayName,
        nextGameStartsAt: nextGameStartsAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    });

    // Clean up
    this.cleanup();
  }

  /**
   * Calculate round score based on card selection
   * TODO: Integrate with soft skills matrix for actual calculation
   */
  private calculateRoundScore(participant: CCMParticipantState): number {
    if (!this.gameState?.currentChallengeCard) return 0;

    // Placeholder scoring logic
    // In production, this would query ccm_soft_skills_matrix
    const baseScores = this.gameState.currentChallengeCard.baseScores;

    // Random score for now (would be calculated from matrix)
    const scoreOptions = [baseScores.perfect, baseScores.good, baseScores.pass];
    return scoreOptions[Math.floor(Math.random() * scoreOptions.length)];
  }

  /**
   * Draw a random challenge card for the round
   */
  private async drawChallengeCard(): Promise<CCMChallengeCard> {
    if (!this.supabase) await this.initSupabase();

    const { data: cards, error } = await this.supabase
      .from('ccm_challenge_cards')
      .select('*')
      .eq('is_active', true)
      .limit(10);

    if (error || !cards || cards.length === 0) {
      throw new Error('No challenge cards available');
    }

    const randomCard = cards[Math.floor(Math.random() * cards.length)];

    return {
      id: randomCard.id,
      code: randomCard.challenge_code,
      displayName: randomCard.display_name,
      description: randomCard.description,
      difficulty: randomCard.difficulty,
      baseScores: {
        perfect: randomCard.perfect_score || 120,
        good: randomCard.good_score || 60,
        pass: randomCard.pass_score || 40,
      },
    };
  }

  /**
   * Start round timer
   */
  private startRoundTimer(): void {
    this.clearRoundTimer();

    let timeRemaining = this.CONFIG.ROUND_DURATION_SECONDS;

    this.roundTimerInterval = setInterval(async () => {
      timeRemaining--;

      if (timeRemaining <= 0) {
        // Auto-submit for players who haven't submitted
        await this.autoSubmitRemainingPlayers();
        await this.endRound();
      } else if (timeRemaining === 10) {
        // Warning at 10 seconds
        await this.broadcastEvent({
          type: 'round_started', // Using existing event type
          participantId: 'system',
          data: { warning: true, timeRemaining },
          timestamp: new Date().toISOString(),
        });
      }
    }, 1000);
  }

  /**
   * Clear round timer
   */
  private clearRoundTimer(): void {
    if (this.roundTimerInterval) {
      clearInterval(this.roundTimerInterval);
      this.roundTimerInterval = undefined;
    }
  }

  /**
   * Auto-submit for participants who haven't submitted in time
   */
  private async autoSubmitRemainingPlayers(): Promise<void> {
    if (!this.gameState) return;

    for (const participant of this.gameState.participants.values()) {
      if (!participant.currentRoundPlay && participant.isActive) {
        // Auto-select random cards
        const roleCard = participant.roleHand[0];
        const synergyCard = participant.synergyHand[0];

        if (roleCard && synergyCard) {
          await this.submitCards(participant.participantId, roleCard, synergyCard, false, false);
        }
      }
    }
  }

  /**
   * Setup real-time subscriptions for game events
   */
  private async setupSubscriptions(sessionId: string): Promise<void> {
    if (!this.supabase) await this.initSupabase();

    // Subscribe to game session updates
    const sessionSub = this.supabase
      .channel(`ccm_game_session:${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ccm_game_sessions',
        filter: `id=eq.${sessionId}`,
      }, (payload: any) => {
        this.handleSessionUpdate(payload);
      })
      .subscribe();

    this.subscriptions.set('session', sessionSub);

    // Subscribe to game events
    const eventSub = this.supabase
      .channel(`ccm_game_events:${sessionId}`)
      .on('broadcast', { event: 'game_event' }, (payload: any) => {
        this.handleGameEvent(payload);
      })
      .subscribe();

    this.subscriptions.set('events', eventSub);
  }

  /**
   * Handle session updates from database
   */
  private handleSessionUpdate(payload: any): void {
    console.log('CCM Session update:', payload);
    // Handle real-time session updates
  }

  /**
   * Handle game events
   */
  private handleGameEvent(payload: any): void {
    console.log('CCM Game event:', payload);
    // Handle real-time game events
  }

  /**
   * Broadcast game event to all participants
   */
  private async broadcastEvent(event: CCMGameEvent): Promise<void> {
    if (!this.gameState) return;

    // Add to local event history
    this.gameState.events.push(event);

    // Broadcast via Supabase
    const channel = this.subscriptions.get('events');
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'game_event',
        payload: event,
      });
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.clearRoundTimer();

    // Unsubscribe from all channels
    if (this.supabase) {
      for (const sub of this.subscriptions.values()) {
        this.supabase.removeChannel(sub);
      }
    }

    this.subscriptions.clear();
    this.gameState = null;
  }

  /**
   * Get current game state
   */
  getGameState(): CCMGameState | null {
    return this.gameState;
  }

  /**
   * Get participant state
   */
  getParticipantState(participantId: string): CCMParticipantState | undefined {
    return this.gameState?.participants.get(participantId);
  }
}

export const ccmGameEngine = new CCMGameEngine();
