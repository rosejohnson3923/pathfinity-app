/**
 * Career Challenge Game Engine
 * Manages game state, turn flow, and multiplayer coordination
 */

import { createClient } from '@supabase/supabase-js';
import {
  GameSession,
  GameSessionPlayer,
  Challenge,
  RoleCard,
  GameAction,
  GamePhase,
  TurnPhase,
  GameEvent,
  VictoryCondition
} from '../types/CareerChallengeTypes';
import { careerChallengeService } from './CareerChallengeService';

export interface GameState {
  sessionId: string;
  phase: GamePhase;
  turnPhase: TurnPhase;
  currentTurn: number;
  currentPlayerId: string;
  players: Map<string, PlayerState>;
  activeChallenge?: Challenge;
  centerChallenges: Challenge[]; // Available challenges in center
  turnTimer?: number;
  events: GameEvent[];
  victoryCondition: VictoryCondition;
}

export interface PlayerState {
  playerId: string;
  displayName: string;
  roleCards: RoleCard[];
  completedChallenges: Challenge[];
  failedChallenges: Challenge[];
  score: number;
  streakCount: number;
  isReady: boolean;
  isActive: boolean;
  lastAction?: GameAction;
}

export class CareerChallengeGameEngine {
  private supabase: any;
  private gameState: GameState | null = null;
  private service: typeof careerChallengeService;
  private subscriptions: Map<string, any> = new Map();
  private turnTimerInterval?: NodeJS.Timeout;

  // Game configuration
  private readonly CONFIG = {
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 6,
    TURN_DURATION_SECONDS: 90,
    CHALLENGES_IN_CENTER: 3,
    STARTING_ROLE_CARDS: 3,
    MAX_ROLE_CARDS: 5,
    VICTORY_SCORE: 100,
    STREAK_BONUS_THRESHOLD: 3,
    PERFECT_SCORE_MULTIPLIER: 2,
  };

  constructor(supabase: any) {
    this.supabase = supabase;
    this.service = careerChallengeService;
  }

  /**
   * Initialize a new game session
   */
  async createGameSession(
    hostPlayerId: string,
    industryId: string,
    roomCode: string,
    victoryCondition: VictoryCondition = { type: 'score', target: 100 },
    hostDisplayName: string = 'Host'
  ): Promise<GameState> {
    try {
      // Create session in database
      const session = await this.service.createSession(
        hostPlayerId,
        industryId,
        roomCode,
        hostDisplayName
      );

      if (!session) {
        throw new Error('Failed to create game session');
      }

      // Initialize game state
      this.gameState = {
        sessionId: session.id,
        phase: 'waiting',
        turnPhase: 'idle',
        currentTurn: 0,
        currentPlayerId: hostPlayerId,
        players: new Map(),
        centerChallenges: [],
        events: [],
        victoryCondition,
      };

      // Add host as first player
      await this.addPlayer(hostPlayerId, hostDisplayName);

      // Setup real-time subscriptions
      await this.setupSubscriptions(session.id);

      // Load initial challenges for the center
      await this.loadCenterChallenges(industryId);

      return this.gameState;
    } catch (error) {
      console.error('Error creating game session:', error);
      throw error;
    }
  }

  /**
   * Join an existing game session
   */
  async joinGameSession(
    sessionId: string,
    playerId: string,
    displayName: string
  ): Promise<GameState> {
    try {
      // Get session details from database
      const session = await this.service.getSession(sessionId);

      if (!session) {
        throw new Error('Session not found');
      }

      // Check if this is the host (they're already in the session)
      const isHost = session.host_player_id === playerId;

      if (!isHost) {
        // Only non-hosts need to join
        const joined = await this.service.joinSession(sessionId, playerId);

        if (!joined) {
          throw new Error('Failed to join session');
        }
      }

      // Initialize game state if not already loaded
      if (!this.gameState) {
        this.gameState = {
          sessionId: session.id,
          phase: session.status as GamePhase,
          turnPhase: 'idle',
          currentTurn: session.current_turn || 0,
          currentPlayerId: session.current_player_id || session.host_player_id,
          players: new Map(),
          centerChallenges: [],
          events: [],
          victoryCondition: session.victory_condition || { type: 'score', target: 100 },
        };

        // Load existing players from session
        if (session.cc_game_session_players && Array.isArray(session.cc_game_session_players)) {
          for (const player of session.cc_game_session_players) {
            this.gameState.players.set(player.player_id, {
              playerId: player.player_id,
              displayName: player.display_name || 'Player',
              roleCards: [],
              completedChallenges: [],
              failedChallenges: [],
              score: player.score || 0,
              streakCount: 0,
              isReady: player.is_ready || false,
              isActive: true,
            });
          }
        }

        // Setup real-time subscriptions
        await this.setupSubscriptions(session.id);

        // Load center challenges
        await this.loadCenterChallenges(session.industry_id);
      }

      // Add current player to local state if not already there
      if (!this.gameState.players.has(playerId)) {
        await this.addPlayer(playerId, displayName);
      }

      // Broadcast join event
      await this.broadcastEvent({
        type: 'player_joined',
        playerId,
        data: { displayName },
        timestamp: new Date().toISOString(),
      });

      return this.gameState!;
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    }
  }

  /**
   * Start the game
   */
  async startGame(): Promise<void> {
    if (!this.gameState) {
      throw new Error('No active game state');
    }

    if (this.gameState.players.size < this.CONFIG.MIN_PLAYERS) {
      throw new Error(`Minimum ${this.CONFIG.MIN_PLAYERS} players required`);
    }

    // Deal starting role cards to each player
    for (const [playerId, player] of this.gameState.players) {
      const roleCards = await this.service.drawRoleCards(
        this.gameState.sessionId,
        playerId,
        this.CONFIG.STARTING_ROLE_CARDS
      );
      player.roleCards = roleCards;
    }

    // Set game phase
    this.gameState.phase = 'playing';
    this.gameState.currentTurn = 1;

    // Select first player
    const playerIds = Array.from(this.gameState.players.keys());
    this.gameState.currentPlayerId = playerIds[0];

    // Start first turn
    await this.startTurn();

    // Broadcast game start
    await this.broadcastEvent({
      type: 'game_started',
      playerId: 'system',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Start a player's turn
   */
  private async startTurn(): Promise<void> {
    if (!this.gameState) return;

    this.gameState.turnPhase = 'selecting_challenge';

    // Start turn timer
    this.startTurnTimer();

    // Broadcast turn start
    await this.broadcastEvent({
      type: 'turn_started',
      playerId: this.gameState.currentPlayerId,
      data: {
        turn: this.gameState.currentTurn,
        availableChallenges: this.gameState.centerChallenges,
      },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Player selects a challenge
   */
  async selectChallenge(playerId: string, challengeId: string): Promise<void> {
    if (!this.gameState) {
      throw new Error('No active game');
    }

    if (playerId !== this.gameState.currentPlayerId) {
      throw new Error('Not your turn');
    }

    if (this.gameState.turnPhase !== 'selecting_challenge') {
      throw new Error('Invalid phase for challenge selection');
    }

    // Find the challenge
    const challenge = this.gameState.centerChallenges.find(c => c.id === challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    this.gameState.activeChallenge = challenge;
    this.gameState.turnPhase = 'selecting_team';

    // Remove challenge from center
    this.gameState.centerChallenges = this.gameState.centerChallenges.filter(
      c => c.id !== challengeId
    );

    await this.broadcastEvent({
      type: 'challenge_selected',
      playerId,
      data: { challenge },
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Player submits their team for the challenge
   */
  async submitTeam(
    playerId: string,
    roleCardIds: string[]
  ): Promise<{ success: boolean; score: number; bonuses: any[] }> {
    if (!this.gameState || !this.gameState.activeChallenge) {
      throw new Error('No active challenge');
    }

    if (playerId !== this.gameState.currentPlayerId) {
      throw new Error('Not your turn');
    }

    if (this.gameState.turnPhase !== 'selecting_team') {
      throw new Error('Invalid phase for team submission');
    }

    // Calculate challenge result
    const result = await this.service.attemptChallenge(
      this.gameState.sessionId,
      playerId,
      this.gameState.activeChallenge.id,
      roleCardIds
    );

    // Update player state
    const player = this.gameState.players.get(playerId);
    if (player) {
      if (result.success) {
        player.completedChallenges.push(this.gameState.activeChallenge);
        player.streakCount++;

        // Apply streak bonus
        if (player.streakCount >= this.CONFIG.STREAK_BONUS_THRESHOLD) {
          result.score *= 1.5;
          result.bonuses = result.bonuses || [];
          result.bonuses.push({
            type: 'streak',
            value: 50,
            description: `${player.streakCount} challenge streak!`
          });
        }
      } else {
        player.failedChallenges.push(this.gameState.activeChallenge);
        player.streakCount = 0;
      }

      player.score += result.score;
    }

    this.gameState.turnPhase = 'resolving';

    // Broadcast result
    await this.broadcastEvent({
      type: 'challenge_attempted',
      playerId,
      data: {
        challenge: this.gameState.activeChallenge,
        result,
      },
      timestamp: new Date().toISOString(),
    });

    // Check victory conditions
    if (await this.checkVictoryConditions()) {
      await this.endGame();
    } else {
      // Continue to next turn
      await this.nextTurn();
    }

    return result;
  }

  /**
   * Move to next turn
   */
  private async nextTurn(): Promise<void> {
    if (!this.gameState) return;

    // Clear turn timer
    this.clearTurnTimer();

    // Rotate to next player
    const playerIds = Array.from(this.gameState.players.keys());
    const currentIndex = playerIds.indexOf(this.gameState.currentPlayerId);
    const nextIndex = (currentIndex + 1) % playerIds.length;

    this.gameState.currentPlayerId = playerIds[nextIndex];
    this.gameState.currentTurn++;
    this.gameState.activeChallenge = undefined;

    // Refill center challenges
    await this.loadCenterChallenges();

    // Start next turn
    await this.startTurn();
  }

  /**
   * Check if any victory conditions are met
   */
  private async checkVictoryConditions(): Promise<boolean> {
    if (!this.gameState) return false;

    const { victoryCondition, players } = this.gameState;

    switch (victoryCondition.type) {
      case 'score':
        for (const player of players.values()) {
          if (player.score >= victoryCondition.target) {
            return true;
          }
        }
        break;

      case 'challenges':
        for (const player of players.values()) {
          if (player.completedChallenges.length >= victoryCondition.target) {
            return true;
          }
        }
        break;

      case 'time':
        // Check if time limit reached (handled by external timer)
        break;
    }

    return false;
  }

  /**
   * End the game
   */
  private async endGame(): Promise<void> {
    if (!this.gameState) return;

    this.gameState.phase = 'finished';
    this.clearTurnTimer();

    // Calculate final rankings
    const rankings = Array.from(this.gameState.players.values())
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        rank: index + 1,
        playerId: player.playerId,
        displayName: player.displayName,
        score: player.score,
        challengesCompleted: player.completedChallenges.length,
        maxStreak: player.streakCount,
      }));

    // Update session in database
    await this.service.endSession(this.gameState.sessionId, rankings[0].playerId);

    // Broadcast game end
    await this.broadcastEvent({
      type: 'game_ended',
      playerId: 'system',
      data: { rankings },
      timestamp: new Date().toISOString(),
    });

    // Clean up subscriptions
    this.cleanup();
  }

  /**
   * Load challenges for the center area
   */
  private async loadCenterChallenges(industryId?: string): Promise<void> {
    if (!this.gameState) return;

    const session = await this.service.getSession(this.gameState.sessionId);
    const targetIndustry = industryId || session?.industryId;

    if (!targetIndustry) return;

    // Ensure we have enough challenges in center
    while (this.gameState.centerChallenges.length < this.CONFIG.CHALLENGES_IN_CENTER) {
      const challenges = await this.service.getChallengesByIndustry(
        targetIndustry,
        this.CONFIG.CHALLENGES_IN_CENTER - this.gameState.centerChallenges.length
      );

      this.gameState.centerChallenges.push(...challenges);
    }
  }

  /**
   * Add a player to the game
   */
  private async addPlayer(playerId: string, displayName: string): Promise<void> {
    if (!this.gameState) return;

    if (this.gameState.players.size >= this.CONFIG.MAX_PLAYERS) {
      throw new Error('Game is full');
    }

    this.gameState.players.set(playerId, {
      playerId,
      displayName,
      roleCards: [],
      completedChallenges: [],
      failedChallenges: [],
      score: 0,
      streakCount: 0,
      isReady: false,
      isActive: true,
    });
  }

  /**
   * Start turn timer
   */
  private startTurnTimer(): void {
    this.clearTurnTimer();

    let timeRemaining = this.CONFIG.TURN_DURATION_SECONDS;

    this.turnTimerInterval = setInterval(async () => {
      timeRemaining--;

      if (timeRemaining <= 0) {
        // Auto-skip turn if time runs out
        await this.skipTurn();
      } else if (timeRemaining === 10) {
        // Warning at 10 seconds
        await this.broadcastEvent({
          type: 'timer_warning',
          playerId: 'system',
          data: { timeRemaining },
          timestamp: new Date().toISOString(),
        });
      }
    }, 1000);
  }

  /**
   * Clear turn timer
   */
  private clearTurnTimer(): void {
    if (this.turnTimerInterval) {
      clearInterval(this.turnTimerInterval);
      this.turnTimerInterval = undefined;
    }
  }

  /**
   * Skip current player's turn
   */
  private async skipTurn(): Promise<void> {
    if (!this.gameState) return;

    await this.broadcastEvent({
      type: 'turn_skipped',
      playerId: this.gameState.currentPlayerId,
      data: { reason: 'timeout' },
      timestamp: new Date().toISOString(),
    });

    await this.nextTurn();
  }

  /**
   * Setup real-time subscriptions for game events
   */
  private async setupSubscriptions(sessionId: string): Promise<void> {
    // Subscribe to game session updates
    const sessionSub = this.supabase
      .channel(`game_session:${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'cc_game_sessions',
        filter: `id=eq.${sessionId}`,
      }, (payload: any) => {
        this.handleSessionUpdate(payload);
      })
      .subscribe();

    this.subscriptions.set('session', sessionSub);

    // Subscribe to player actions
    const actionSub = this.supabase
      .channel(`game_actions:${sessionId}`)
      .on('broadcast', {
        event: 'game_action',
      }, (payload: any) => {
        this.handlePlayerAction(payload);
      })
      .subscribe();

    this.subscriptions.set('actions', actionSub);
  }

  /**
   * Handle session updates from database
   */
  private handleSessionUpdate(payload: any): void {
    // Handle real-time session updates
    console.log('Session update:', payload);
  }

  /**
   * Handle player actions
   */
  private handlePlayerAction(payload: any): void {
    // Handle real-time player actions
    console.log('Player action:', payload);
  }

  /**
   * Broadcast game event to all players
   */
  private async broadcastEvent(event: GameEvent): Promise<void> {
    if (!this.gameState) return;

    // Add to local event history
    this.gameState.events.push(event);

    // Broadcast via Supabase
    const channel = this.subscriptions.get('actions');
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
    this.clearTurnTimer();

    // Unsubscribe from all channels
    for (const sub of this.subscriptions.values()) {
      this.supabase.removeChannel(sub);
    }

    this.subscriptions.clear();
    this.gameState = null;
  }

  /**
   * Get current game state
   */
  getGameState(): GameState | null {
    return this.gameState;
  }

  /**
   * Get player state
   */
  getPlayerState(playerId: string): PlayerState | undefined {
    return this.gameState?.players.get(playerId);
  }
}