/**
 * Career Challenge Orchestrator
 * Integrates Career Challenge with the existing GameOrchestrator pattern
 */

import { GameOrchestrator } from './GameOrchestrator';
import { CareerChallengeGameEngine } from './CareerChallengeGameEngine';
import { CareerChallengeService } from './CareerChallengeService';
import {
  GameSession,
  Challenge,
  RoleCard,
  GamePhase,
  VictoryCondition,
  GameEvent,
} from '../types/CareerChallengeTypes';

export interface CareerChallengeConfig {
  industryId: string;
  victoryCondition: VictoryCondition;
  maxPlayers?: number;
  turnDuration?: number;
  startingCards?: number;
}

export class CareerChallengeOrchestrator extends GameOrchestrator {
  private gameEngine: CareerChallengeGameEngine | null = null;
  private service: CareerChallengeService;
  private config: CareerChallengeConfig;
  private sessionId: string | null = null;

  constructor(supabase: any, roomId: string, config: CareerChallengeConfig) {
    super(supabase, roomId, 'career-challenge');
    this.service = new CareerChallengeService(supabase);
    this.config = config;
  }

  /**
   * Initialize the Career Challenge game
   */
  async initialize(hostPlayerId: string, hostDisplayName: string): Promise<void> {
    try {
      // Initialize base orchestrator
      await super.initialize(hostPlayerId);

      // Create game engine
      this.gameEngine = new CareerChallengeGameEngine(this.supabase);

      // Create game session
      const gameState = await this.gameEngine.createGameSession(
        hostPlayerId,
        this.config.industryId,
        this.roomId,
        this.config.victoryCondition
      );

      this.sessionId = gameState.sessionId;

      // Set initial game state
      this.gameState = {
        phase: 'waiting',
        currentTurn: 0,
        currentPlayer: hostPlayerId,
        scores: {},
        custom: {
          gameEngine: this.gameEngine,
          industryId: this.config.industryId,
          centerChallenges: gameState.centerChallenges,
          activeChallenge: null,
        }
      };

      // Subscribe to game events
      this.subscribeToGameEvents();

      // Broadcast initialization
      await this.broadcastGameState({
        type: 'career_challenge_initialized',
        industryId: this.config.industryId,
        sessionId: this.sessionId,
      });
    } catch (error) {
      console.error('Failed to initialize Career Challenge:', error);
      throw error;
    }
  }

  /**
   * Handle player joining
   */
  async handlePlayerJoin(playerId: string, displayName: string): Promise<void> {
    if (!this.gameEngine || !this.sessionId) {
      throw new Error('Game not initialized');
    }

    // Add to base orchestrator
    await super.addPlayer(playerId, displayName);

    // Join game session
    await this.gameEngine.joinGameSession(this.sessionId, playerId, displayName);

    // Broadcast player joined
    await this.broadcastGameState({
      type: 'player_joined',
      playerId,
      displayName,
    });
  }

  /**
   * Start the game
   */
  async startGame(): Promise<void> {
    if (!this.gameEngine) {
      throw new Error('Game engine not initialized');
    }

    if (this.players.size < 2) {
      throw new Error('Minimum 2 players required to start');
    }

    // Start game in engine
    await this.gameEngine.startGame();

    // Update orchestrator state
    this.gameState.phase = 'playing';

    // Broadcast game started
    await this.broadcastGameState({
      type: 'game_started',
      players: Array.from(this.players.entries()).map(([id, p]) => ({
        id,
        name: p.displayName,
      })),
    });
  }

  /**
   * Handle challenge selection
   */
  async selectChallenge(playerId: string, challengeId: string): Promise<void> {
    if (!this.gameEngine) {
      throw new Error('Game engine not initialized');
    }

    // Validate it's player's turn
    if (this.gameState.currentPlayer !== playerId) {
      throw new Error('Not your turn');
    }

    // Select challenge in engine
    await this.gameEngine.selectChallenge(playerId, challengeId);

    // Update custom state
    const challenge = this.gameState.custom?.centerChallenges?.find(
      (c: Challenge) => c.id === challengeId
    );

    if (challenge) {
      this.gameState.custom.activeChallenge = challenge;
      this.gameState.custom.centerChallenges =
        this.gameState.custom.centerChallenges.filter(
          (c: Challenge) => c.id !== challengeId
        );
    }

    // Broadcast challenge selected
    await this.broadcastGameState({
      type: 'challenge_selected',
      playerId,
      challenge,
    });
  }

  /**
   * Handle team submission
   */
  async submitTeam(playerId: string, roleCardIds: string[]): Promise<any> {
    if (!this.gameEngine) {
      throw new Error('Game engine not initialized');
    }

    // Submit team in engine
    const result = await this.gameEngine.submitTeam(playerId, roleCardIds);

    // Update scores
    if (!this.gameState.scores[playerId]) {
      this.gameState.scores[playerId] = 0;
    }
    this.gameState.scores[playerId] += result.score;

    // Check for victory
    if (this.checkVictoryConditions()) {
      await this.endGame();
    } else {
      // Move to next turn
      await this.nextTurn();
    }

    // Broadcast result
    await this.broadcastGameState({
      type: 'challenge_completed',
      playerId,
      result,
      scores: this.gameState.scores,
    });

    return result;
  }

  /**
   * Move to next turn
   */
  private async nextTurn(): Promise<void> {
    // Rotate to next player
    const playerIds = Array.from(this.players.keys());
    const currentIndex = playerIds.indexOf(this.gameState.currentPlayer);
    const nextIndex = (currentIndex + 1) % playerIds.length;

    this.gameState.currentPlayer = playerIds[nextIndex];
    this.gameState.currentTurn++;

    // Clear active challenge
    if (this.gameState.custom) {
      this.gameState.custom.activeChallenge = null;
    }

    // Broadcast turn change
    await this.broadcastGameState({
      type: 'turn_started',
      currentPlayer: this.gameState.currentPlayer,
      turn: this.gameState.currentTurn,
    });
  }

  /**
   * Check victory conditions
   */
  private checkVictoryConditions(): boolean {
    const { victoryCondition } = this.config;

    switch (victoryCondition.type) {
      case 'score':
        for (const score of Object.values(this.gameState.scores)) {
          if ((score as number) >= victoryCondition.target) {
            return true;
          }
        }
        break;

      case 'challenges':
        // Check completed challenges count
        // Would need to track this in gameState
        break;

      case 'time':
        // Check elapsed time
        // Would need to track start time
        break;
    }

    return false;
  }

  /**
   * End the game
   */
  async endGame(): Promise<void> {
    if (!this.gameEngine) return;

    // Update phase
    this.gameState.phase = 'finished';

    // Calculate rankings
    const rankings = Object.entries(this.gameState.scores)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([playerId, score], index) => ({
        rank: index + 1,
        playerId,
        score,
        displayName: this.players.get(playerId)?.displayName || 'Unknown',
      }));

    // Broadcast game end
    await this.broadcastGameState({
      type: 'game_ended',
      rankings,
      winner: rankings[0],
    });

    // Clean up
    this.cleanup();
  }

  /**
   * Subscribe to game events from the engine
   */
  private subscribeToGameEvents(): void {
    if (!this.gameEngine) return;

    // The game engine will broadcast events through Supabase channels
    // We can listen for specific events here if needed
  }

  /**
   * Handle player disconnect
   */
  async handlePlayerDisconnect(playerId: string): Promise<void> {
    // Mark player as inactive
    const player = this.players.get(playerId);
    if (player) {
      player.isActive = false;
    }

    // If it was their turn, skip it
    if (this.gameState.currentPlayer === playerId && this.gameState.phase === 'playing') {
      await this.nextTurn();
    }

    // Broadcast disconnect
    await this.broadcastGameState({
      type: 'player_disconnected',
      playerId,
    });
  }

  /**
   * Handle player reconnect
   */
  async handlePlayerReconnect(playerId: string): Promise<void> {
    // Mark player as active
    const player = this.players.get(playerId);
    if (player) {
      player.isActive = true;
    }

    // Send current game state to reconnected player
    const currentState = this.gameEngine?.getGameState();
    if (currentState) {
      await this.broadcastToPlayer(playerId, {
        type: 'game_state_sync',
        gameState: currentState,
      });
    }

    // Broadcast reconnect
    await this.broadcastGameState({
      type: 'player_reconnected',
      playerId,
    });
  }

  /**
   * Get role cards for a player
   */
  async getPlayerRoleCards(playerId: string): Promise<RoleCard[]> {
    const playerState = this.gameEngine?.getPlayerState(playerId);
    return playerState?.roleCards || [];
  }

  /**
   * Get current challenges available
   */
  getCenterChallenges(): Challenge[] {
    return this.gameState.custom?.centerChallenges || [];
  }

  /**
   * Get active challenge
   */
  getActiveChallenge(): Challenge | null {
    return this.gameState.custom?.activeChallenge || null;
  }

  /**
   * Trade role cards between players
   */
  async tradeRoleCards(
    fromPlayerId: string,
    toPlayerId: string,
    offeredCards: string[],
    requestedCards: string[]
  ): Promise<void> {
    // Implement trading logic
    // This would involve:
    // 1. Validating both players have the cards
    // 2. Swapping cards in their collections
    // 3. Broadcasting the trade

    await this.service.createTrade({
      offeringPlayerId: fromPlayerId,
      receivingPlayerId: toPlayerId,
      offeredCardIds: offeredCards,
      requestedCardIds: requestedCards,
    });

    await this.broadcastGameState({
      type: 'trade_completed',
      fromPlayer: fromPlayerId,
      toPlayer: toPlayerId,
      offeredCards,
      requestedCards,
    });
  }

  /**
   * Use a role card's special ability
   */
  async useSpecialAbility(
    playerId: string,
    roleCardId: string,
    targetId?: string
  ): Promise<void> {
    // Implement special ability logic
    // This would involve:
    // 1. Validating the player has the card
    // 2. Checking ability cooldowns/conditions
    // 3. Applying the ability effect
    // 4. Broadcasting the ability use

    const roleCard = await this.service.getRoleCard(roleCardId);
    if (!roleCard || !roleCard.specialAbilities?.length) {
      throw new Error('No special abilities available');
    }

    // Apply ability effect
    // ... implementation based on ability type

    await this.broadcastGameState({
      type: 'ability_used',
      playerId,
      roleCard: roleCard.roleName,
      ability: roleCard.specialAbilities[0].name,
      target: targetId,
    });
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.gameEngine?.cleanup();
    this.gameEngine = null;
    super.cleanup();
  }

  /**
   * Export game state for UI
   */
  exportGameState(): any {
    const engineState = this.gameEngine?.getGameState();

    return {
      ...this.gameState,
      sessionId: this.sessionId,
      industryId: this.config.industryId,
      players: Array.from(this.players.entries()).map(([id, player]) => ({
        id,
        ...player,
        roleCards: engineState?.players.get(id)?.roleCards || [],
        score: this.gameState.scores[id] || 0,
      })),
      centerChallenges: this.getCenterChallenges(),
      activeChallenge: this.getActiveChallenge(),
      currentTurn: this.gameState.currentTurn,
      currentPlayer: this.gameState.currentPlayer,
      phase: this.gameState.phase,
    };
  }
}