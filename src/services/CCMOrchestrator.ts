/**
 * Career Challenge Multiplayer (CCM) Orchestrator
 * Manages perpetual room game lifecycle and coordination
 *
 * Key Differences from CC Orchestrator:
 * - Perpetual room management (continuous game cycles)
 * - Intermission handling (15s between games)
 * - AI player fill for empty seats
 * - Round-based coordination (not turn-based)
 * - Drop-in/drop-out support
 */

import { ccmService } from './CCMService';
import { CCMGameEngine, CCMGameState } from './CCMGameEngine';
import { supabase } from '../lib/supabase';

export interface CCMOrchestratorConfig {
  roomId: string;
  autoFillAI?: boolean;
  intermissionDuration?: number;
}

export interface CCMRoom {
  id: string;
  roomCode: string;
  roomName: string;
  status: 'active' | 'intermission';
  currentGameId?: string;
  currentGameNumber: number;
  nextGameStartsAt?: string;
  maxPlayersPerGame: number;
  currentPlayerCount: number;
}

export class CCMOrchestrator {
  private supabase: any;
  private config: CCMOrchestratorConfig;
  private gameEngine: CCMGameEngine | null = null;
  private room: CCMRoom | null = null;
  private subscriptions: Map<string, any> = new Map();
  private intermissionTimer?: NodeJS.Timeout;

  constructor(config: CCMOrchestratorConfig) {
    this.config = config;
    this.initSupabase();
  }

  private async initSupabase() {
    this.supabase = await supabase();
  }

  /**
   * Initialize the orchestrator and load room
   */
  async initialize(): Promise<CCMRoom> {
    try {
      if (!this.supabase) await this.initSupabase();

      // Load room data
      const roomData = await ccmService.getRoomStatus(this.config.roomId);
      if (!roomData) {
        throw new Error('Room not found');
      }

      this.room = {
        id: roomData.id,
        roomCode: roomData.room_code,
        roomName: roomData.room_name,
        status: roomData.status,
        currentGameId: roomData.current_game_id,
        currentGameNumber: roomData.current_game_number || 1,
        nextGameStartsAt: roomData.next_game_starts_at,
        maxPlayersPerGame: roomData.max_players_per_game || 8,
        currentPlayerCount: roomData.current_player_count || 0,
      };

      // Setup room subscriptions
      await this.setupRoomSubscriptions();

      // If in intermission, start countdown
      if (this.room.status === 'intermission' && this.room.nextGameStartsAt) {
        this.startIntermissionCountdown(this.room.nextGameStartsAt);
      }

      // If game is active, load existing game
      if (this.room.status === 'active' && this.room.currentGameId) {
        await this.loadExistingGame(this.room.currentGameId);
      }

      return this.room;
    } catch (error) {
      console.error('Failed to initialize CCM orchestrator:', error);
      throw error;
    }
  }

  /**
   * Load existing active game
   */
  private async loadExistingGame(gameId: string): Promise<void> {
    try {
      this.gameEngine = new CCMGameEngine();
      await this.gameEngine.joinGameSession(gameId);

      console.log('Loaded existing game:', gameId);
    } catch (error) {
      console.error('Failed to load existing game:', error);
    }
  }

  /**
   * Handle player joining room
   */
  async handlePlayerJoin(
    playerId: string,
    displayName: string
  ): Promise<{ success: boolean; message?: string; canJoinNow: boolean }> {
    if (!this.room) {
      throw new Error('Room not initialized');
    }

    try {
      // Check room capacity
      if (this.room.currentPlayerCount >= this.room.maxPlayersPerGame) {
        return {
          success: false,
          message: 'Room is full',
          canJoinNow: false,
        };
      }

      // If game is active, player must wait for intermission
      if (this.room.status === 'active') {
        // Queue player for next game
        await this.queuePlayerForNextGame(playerId, displayName);

        return {
          success: true,
          message: 'Game in progress. You will join during intermission.',
          canJoinNow: false,
        };
      }

      // Room is in intermission, player can join immediately
      if (this.room.status === 'intermission') {
        await this.addPlayerToNextGame(playerId, displayName);

        return {
          success: true,
          message: 'Joined room. Game starts soon!',
          canJoinNow: true,
        };
      }

      return {
        success: false,
        message: 'Room status unknown',
        canJoinNow: false,
      };
    } catch (error) {
      console.error('Error handling player join:', error);
      return {
        success: false,
        message: 'Failed to join room',
        canJoinNow: false,
      };
    }
  }

  /**
   * Queue player for next game (when current game is active)
   */
  private async queuePlayerForNextGame(
    playerId: string,
    displayName: string
  ): Promise<void> {
    // Store in waiting queue (could use a separate table or in-memory)
    // For now, we'll just broadcast the event
    await this.broadcastRoomEvent({
      type: 'player_queued',
      playerId,
      displayName,
      nextGameStartsAt: this.room?.nextGameStartsAt,
    });
  }

  /**
   * Add player to next game during intermission
   */
  private async addPlayerToNextGame(
    playerId: string,
    displayName: string
  ): Promise<void> {
    // Players added during intermission will be included when game starts
    // This would be stored in a staging area or directly added to next session

    await this.broadcastRoomEvent({
      type: 'player_ready',
      playerId,
      displayName,
    });
  }

  /**
   * Start a new game in the perpetual room
   */
  async startNewGame(): Promise<void> {
    if (!this.room) {
      throw new Error('Room not initialized');
    }

    try {
      // Create new game session
      const gameNumber = this.room.currentGameNumber + 1;

      // Initialize game engine
      this.gameEngine = new CCMGameEngine();
      const gameState = await this.gameEngine.createGameSession(
        this.room.id,
        gameNumber
      );

      // Update room state
      this.room.status = 'active';
      this.room.currentGameId = gameState.sessionId;
      this.room.currentGameNumber = gameNumber;
      this.room.nextGameStartsAt = undefined;

      // Clear intermission timer
      if (this.intermissionTimer) {
        clearTimeout(this.intermissionTimer);
        this.intermissionTimer = undefined;
      }

      // Add participants (human players + AI fill if enabled)
      await this.addParticipantsToGame(gameState.sessionId);

      // Start the game
      await this.gameEngine.startGame();

      // Broadcast game started
      await this.broadcastRoomEvent({
        type: 'game_started',
        sessionId: gameState.sessionId,
        gameNumber: gameNumber,
        round: 1,
      });

      console.log(`Started game ${gameNumber} in room ${this.room.roomCode}`);
    } catch (error) {
      console.error('Failed to start new game:', error);
      throw error;
    }
  }

  /**
   * Add participants to game (human + AI fill)
   */
  private async addParticipantsToGame(sessionId: string): Promise<void> {
    if (!this.room) return;

    // Get waiting players (would query from staging/queue)
    const waitingPlayers: Array<{ playerId: string; displayName: string }> = [];

    // Add human players
    for (const player of waitingPlayers) {
      await ccmService.addParticipant(
        sessionId,
        this.room.id,
        player.playerId,
        player.displayName,
        false
      );
    }

    // Fill remaining seats with AI if enabled
    if (this.config.autoFillAI !== false) {
      const humanCount = waitingPlayers.length;
      const minPlayers = 4; // Minimum for good game experience
      const aiNeeded = Math.max(0, minPlayers - humanCount);

      for (let i = 0; i < aiNeeded; i++) {
        const aiName = this.generateAIName();
        await ccmService.addParticipant(
          sessionId,
          this.room.id,
          null,
          aiName,
          true
        );
      }

      console.log(`Added ${aiNeeded} AI players to fill seats`);
    }
  }

  /**
   * Generate random AI player name
   */
  private generateAIName(): string {
    const prefixes = ['Bot', 'AI', 'Challenger'];
    const suffixes = ['Alpha', 'Beta', 'Delta', 'Gamma', 'Omega', 'Pro', 'Max'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix}_${suffix}`;
  }

  /**
   * Handle game completion and start intermission
   */
  async handleGameComplete(): Promise<void> {
    if (!this.room) return;

    try {
      // Update room to intermission
      this.room.status = 'intermission';

      const intermissionDuration = this.config.intermissionDuration || 15000; // 15 seconds
      const nextGameStartsAt = new Date(Date.now() + intermissionDuration);
      this.room.nextGameStartsAt = nextGameStartsAt.toISOString();

      await this.supabase
        .from('ccm_perpetual_rooms')
        .update({
          status: 'intermission',
          next_game_starts_at: nextGameStartsAt.toISOString(),
        })
        .eq('id', this.room.id);

      // Start intermission countdown
      this.startIntermissionCountdown(nextGameStartsAt.toISOString());

      // Broadcast intermission started
      await this.broadcastRoomEvent({
        type: 'intermission_started',
        nextGameStartsAt: nextGameStartsAt.toISOString(),
        duration: intermissionDuration,
      });

      console.log('Game complete. Intermission started.');
    } catch (error) {
      console.error('Failed to handle game completion:', error);
    }
  }

  /**
   * Start intermission countdown timer
   */
  private startIntermissionCountdown(nextGameStartsAt: string): void {
    if (this.intermissionTimer) {
      clearTimeout(this.intermissionTimer);
    }

    const now = new Date().getTime();
    const targetTime = new Date(nextGameStartsAt).getTime();
    const delay = targetTime - now;

    if (delay > 0) {
      this.intermissionTimer = setTimeout(async () => {
        await this.startNewGame();
      }, delay);

      console.log(`Next game starts in ${Math.round(delay / 1000)} seconds`);
    } else {
      // Time already passed, start immediately
      this.startNewGame();
    }
  }

  /**
   * Handle player submitting cards for current round
   */
  async handleCardSubmission(
    participantId: string,
    roleCardId: string,
    synergyCardId: string,
    useGoldenCard: boolean = false,
    useMvpBonus: boolean = false
  ): Promise<{ success: boolean; message?: string }> {
    if (!this.gameEngine) {
      return { success: false, message: 'No active game' };
    }

    try {
      const result = await this.gameEngine.submitCards(
        participantId,
        roleCardId,
        synergyCardId,
        useGoldenCard,
        useMvpBonus
      );

      return result;
    } catch (error: any) {
      console.error('Card submission error:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get current game state
   */
  getGameState(): CCMGameState | null {
    return this.gameEngine?.getGameState() || null;
  }

  /**
   * Get room info
   */
  getRoomInfo(): CCMRoom | null {
    return this.room;
  }

  /**
   * Setup room subscriptions for real-time updates
   */
  private async setupRoomSubscriptions(): Promise<void> {
    if (!this.supabase || !this.room) return;

    // Subscribe to room updates
    const roomSub = this.supabase
      .channel(`ccm_room:${this.room.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ccm_perpetual_rooms',
        filter: `id=eq.${this.room.id}`,
      }, (payload: any) => {
        this.handleRoomUpdate(payload);
      })
      .subscribe();

    this.subscriptions.set('room', roomSub);

    // Subscribe to room events broadcast channel
    const eventSub = this.supabase
      .channel(`ccm_room_events:${this.room.id}`)
      .on('broadcast', { event: 'room_event' }, (payload: any) => {
        this.handleRoomEvent(payload);
      })
      .subscribe();

    this.subscriptions.set('events', eventSub);
  }

  /**
   * Handle room updates from database
   */
  private handleRoomUpdate(payload: any): void {
    console.log('Room update:', payload);

    if (payload.new && this.room) {
      this.room.status = payload.new.status;
      this.room.currentGameId = payload.new.current_game_id;
      this.room.currentGameNumber = payload.new.current_game_number;
      this.room.nextGameStartsAt = payload.new.next_game_starts_at;
      this.room.currentPlayerCount = payload.new.current_player_count;
    }
  }

  /**
   * Handle room events
   */
  private handleRoomEvent(payload: any): void {
    console.log('Room event:', payload);
    // Handle custom room events (player joined, game started, etc.)
  }

  /**
   * Broadcast room event to all connected clients
   */
  private async broadcastRoomEvent(event: any): Promise<void> {
    if (!this.room) return;

    const channel = this.subscriptions.get('events');
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'room_event',
        payload: event,
      });
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    // Clear intermission timer
    if (this.intermissionTimer) {
      clearTimeout(this.intermissionTimer);
      this.intermissionTimer = undefined;
    }

    // Clean up game engine
    this.gameEngine?.cleanup();
    this.gameEngine = null;

    // Unsubscribe from all channels
    if (this.supabase) {
      for (const sub of this.subscriptions.values()) {
        this.supabase.removeChannel(sub);
      }
    }

    this.subscriptions.clear();
    this.room = null;
  }
}

export const createCCMOrchestrator = (config: CCMOrchestratorConfig) => {
  return new CCMOrchestrator(config);
};
