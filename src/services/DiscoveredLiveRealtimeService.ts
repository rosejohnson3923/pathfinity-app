/**
 * Discovered Live! Realtime Service
 * Handles real-time updates for multiplayer games using Supabase Realtime
 *
 * Features:
 * - Room state synchronization
 * - Live game events (questions, clicks, bingos)
 * - Participant presence tracking
 * - Spectator updates
 * - Event broadcasting
 */

import { supabase } from '../lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type {
  WebSocketEvent,
  GameStartedEvent,
  QuestionStartedEvent,
  PlayerClickedEvent,
  BingoAchievedEvent,
  GameCompletedEvent,
  PerpetualRoom,
  GameSession,
  SessionParticipant,
  Spectator,
} from '../types/DiscoveredLiveMultiplayerTypes';

/**
 * Event handler type
 */
type EventHandler = (event: WebSocketEvent) => void;

/**
 * Realtime Service for Discovered Live!
 */
class DiscoveredLiveRealtimeService {
  private static instance: DiscoveredLiveRealtimeService;
  private channels: Map<string, RealtimeChannel> = new Map();
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();

  private constructor() {}

  static getInstance(): DiscoveredLiveRealtimeService {
    if (!DiscoveredLiveRealtimeService.instance) {
      DiscoveredLiveRealtimeService.instance = new DiscoveredLiveRealtimeService();
    }
    return DiscoveredLiveRealtimeService.instance;
  }

  // ================================================================
  // CHANNEL MANAGEMENT
  // ================================================================

  /**
   * Subscribe to a room's events
   */
  async subscribeToRoom(roomId: string, handlers: Partial<Record<string, EventHandler>>): Promise<void> {
    const client = await supabase();

    // Create channel for this room
    const channel = client.channel(`room:${roomId}`, {
      config: {
        broadcast: { self: true },
        presence: { key: roomId },
      },
    });

    // Register event handlers
    Object.entries(handlers).forEach(([eventType, handler]) => {
      if (handler) {
        this.addEventListener(roomId, eventType, handler);
      }
    });

    // Subscribe to broadcast messages
    channel.on('broadcast', { event: '*' }, (payload) => {
      this.handleBroadcastEvent(roomId, payload);
    });

    // Subscribe to presence changes
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      this.handlePresenceSync(roomId, state);
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      this.handlePresenceJoin(roomId, key, newPresences);
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      this.handlePresenceLeave(roomId, key, leftPresences);
    });

    // Subscribe to database changes for real-time updates
    channel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cb_game_sessions',
          filter: `perpetual_room_id=eq.${roomId}`,
        },
        (payload) => this.handleSessionUpdate(roomId, payload)
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cb_session_participants',
          filter: `perpetual_room_id=eq.${roomId}`,
        },
        (payload) => this.handleParticipantJoin(roomId, payload)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cb_session_participants',
          filter: `perpetual_room_id=eq.${roomId}`,
        },
        (payload) => this.handleParticipantUpdate(roomId, payload)
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cb_spectators',
          filter: `perpetual_room_id=eq.${roomId}`,
        },
        (payload) => this.handleSpectatorChange(roomId, payload)
      );

    // Subscribe to channel
    await channel.subscribe();

    // Store channel
    this.channels.set(roomId, channel);

    console.log(`✅ Subscribed to room ${roomId}`);
  }

  /**
   * Unsubscribe from a room
   */
  async unsubscribeFromRoom(roomId: string): Promise<void> {
    const channel = this.channels.get(roomId);
    if (channel) {
      await channel.unsubscribe();
      this.channels.delete(roomId);
      this.eventHandlers.delete(roomId);
      console.log(`❌ Unsubscribed from room ${roomId}`);
    }
  }

  /**
   * Track presence in a room
   */
  async trackPresence(roomId: string, userId: string, userData: any): Promise<void> {
    const channel = this.channels.get(roomId);
    if (channel) {
      await channel.track({
        user_id: userId,
        ...userData,
        online_at: new Date().toISOString(),
      });
    }
  }

  /**
   * Untrack presence in a room
   */
  async untrackPresence(roomId: string): Promise<void> {
    const channel = this.channels.get(roomId);
    if (channel) {
      await channel.untrack();
    }
  }

  // ================================================================
  // EVENT BROADCASTING
  // ================================================================

  /**
   * Broadcast game started event
   */
  async broadcastGameStarted(
    roomId: string,
    gameNumber: number,
    gameSessionId: string,
    participants: SessionParticipant[],
    bingoSlotsTotal: number
  ): Promise<void> {
    await this.broadcast(roomId, 'game_started', {
      gameNumber,
      gameSessionId,
      participants,
      bingoSlotsTotal,
    });
  }

  /**
   * Broadcast question started event
   */
  async broadcastQuestionStarted(
    roomId: string,
    questionNumber: number,
    clueText: string,
    skillConnection: string,
    correctCareerCode: string,
    timeLimitSeconds: number
  ): Promise<void> {
    const now = new Date();
    const endsAt = new Date(now.getTime() + timeLimitSeconds * 1000);

    await this.broadcast(roomId, 'question_started', {
      questionNumber,
      clueText,
      skillConnection,
      correctCareerCode,
      timeLimitSeconds,
      endsAt: endsAt.toISOString(),
    });
  }

  /**
   * Broadcast player clicked event
   */
  async broadcastPlayerClicked(
    roomId: string,
    participantId: string,
    displayName: string,
    clickedCareerCode: string,
    clickedPosition: { row: number; col: number },
    isCorrect: boolean,
    responseTime: number,
    unlockedPosition?: { row: number; col: number },
    newStreak?: number,
    xpEarned?: number
  ): Promise<void> {
    const eventType = isCorrect ? 'player_correct' : 'player_incorrect';

    await this.broadcast(roomId, eventType, {
      participantId,
      displayName,
      clickedCareerCode,
      clickedPosition,
      isCorrect,
      responseTime,
      unlockedPosition,
      newStreak,
      xpEarned,
    });
  }

  /**
   * Broadcast bingo achieved event
   */
  async broadcastBingoAchieved(
    roomId: string,
    participantId: string,
    displayName: string,
    bingoNumber: number,
    bingoType: 'row' | 'column' | 'diagonal',
    bingoIndex: number,
    bingoSlotsRemaining: number,
    xpBonus: number
  ): Promise<void> {
    await this.broadcast(roomId, 'bingo_achieved', {
      participantId,
      displayName,
      bingoNumber,
      bingoType,
      bingoIndex,
      bingoSlotsRemaining,
      xpBonus,
    });
  }

  /**
   * Broadcast game completed event
   */
  async broadcastGameCompleted(
    roomId: string,
    gameNumber: number,
    winners: any[],
    leaderboard: any[],
    nextGameStartsAt: string,
    intermissionSeconds: number
  ): Promise<void> {
    await this.broadcast(roomId, 'game_completed', {
      gameNumber,
      winners,
      leaderboard,
      nextGameStartsAt,
      intermissionSeconds,
    });
  }

  /**
   * Generic broadcast helper
   */
  private async broadcast(roomId: string, eventType: string, data: any): Promise<void> {
    const channel = this.channels.get(roomId);
    if (!channel) {
      console.warn(`Cannot broadcast - not subscribed to room ${roomId}`);
      return;
    }

    try {
      // Use the channel's track method for broadcasting instead of send
      // This works better with Supabase realtime's broadcast feature
      const payload = {
        type: eventType,
        roomId,
        timestamp: new Date().toISOString(),
        data,
      };

      // Emit event locally first (for same-client updates)
      this.emitEvent(roomId, eventType, data);

      // Try to broadcast via channel (but don't fail if it doesn't work)
      await channel.send({
        type: 'broadcast',
        event: eventType,
        payload,
      }).catch((error) => {
        console.warn(`Broadcast failed for ${eventType} (using local events only):`, error.message);
      });
    } catch (error) {
      console.error(`Error broadcasting ${eventType}:`, error);
      // Still emit locally even if broadcast fails
      this.emitEvent(roomId, eventType, data);
    }
  }

  // ================================================================
  // EVENT HANDLING
  // ================================================================

  /**
   * Add event listener
   */
  private addEventListener(roomId: string, eventType: string, handler: EventHandler): void {
    const key = `${roomId}:${eventType}`;
    if (!this.eventHandlers.has(key)) {
      this.eventHandlers.set(key, new Set());
    }
    this.eventHandlers.get(key)!.add(handler);
  }

  /**
   * Remove event listener
   */
  removeEventListener(roomId: string, eventType: string, handler: EventHandler): void {
    const key = `${roomId}:${eventType}`;
    const handlers = this.eventHandlers.get(key);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  /**
   * Handle broadcast event
   */
  private handleBroadcastEvent(roomId: string, payload: any): void {
    const event = payload.payload as WebSocketEvent;

    // Trigger specific event handlers
    const key = `${roomId}:${event.type}`;
    const handlers = this.eventHandlers.get(key);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }

    // Trigger wildcard handlers
    const wildcardKey = `${roomId}:*`;
    const wildcardHandlers = this.eventHandlers.get(wildcardKey);
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => handler(event));
    }
  }

  /**
   * Handle presence sync
   */
  private handlePresenceSync(roomId: string, state: any): void {
    console.log(`Presence sync for room ${roomId}:`, state);
    // Emit presence_sync event
    this.emitEvent(roomId, 'presence_sync', { state });
  }

  /**
   * Handle presence join
   */
  private handlePresenceJoin(roomId: string, key: string, newPresences: any[]): void {
    console.log(`User joined room ${roomId}:`, newPresences);
    this.emitEvent(roomId, 'participant_joined', { key, newPresences });
  }

  /**
   * Handle presence leave
   */
  private handlePresenceLeave(roomId: string, key: string, leftPresences: any[]): void {
    console.log(`User left room ${roomId}:`, leftPresences);
    this.emitEvent(roomId, 'participant_left', { key, leftPresences });
  }

  /**
   * Handle session update (postgres changes)
   */
  private handleSessionUpdate(roomId: string, payload: RealtimePostgresChangesPayload<any>): void {
    console.log(`Session updated in room ${roomId}:`, payload);
    this.emitEvent(roomId, 'session_updated', payload.new);
  }

  /**
   * Handle participant join (postgres changes)
   */
  private handleParticipantJoin(roomId: string, payload: RealtimePostgresChangesPayload<any>): void {
    console.log(`Participant joined room ${roomId}:`, payload);
    this.emitEvent(roomId, 'participant_joined', payload.new);
  }

  /**
   * Handle participant update (postgres changes)
   */
  private handleParticipantUpdate(roomId: string, payload: RealtimePostgresChangesPayload<any>): void {
    console.log(`Participant updated in room ${roomId}:`, payload);
    this.emitEvent(roomId, 'participant_updated', payload.new);
  }

  /**
   * Handle spectator change (postgres changes)
   */
  private handleSpectatorChange(roomId: string, payload: RealtimePostgresChangesPayload<any>): void {
    console.log(`Spectator change in room ${roomId}:`, payload);
    this.emitEvent(roomId, 'spectator_changed', {
      event: payload.eventType,
      data: payload.new || payload.old,
    });
  }

  /**
   * Emit custom event
   */
  private emitEvent(roomId: string, eventType: string, data: any): void {
    const event: WebSocketEvent = {
      type: eventType as any,
      roomId,
      timestamp: new Date().toISOString(),
      data,
    };

    const key = `${roomId}:${eventType}`;
    const handlers = this.eventHandlers.get(key);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }

    // Wildcard handlers
    const wildcardKey = `${roomId}:*`;
    const wildcardHandlers = this.eventHandlers.get(wildcardKey);
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => handler(event));
    }
  }

  // ================================================================
  // UTILITY
  // ================================================================

  /**
   * Get channel for a room
   */
  getChannel(roomId: string): RealtimeChannel | undefined {
    return this.channels.get(roomId);
  }

  /**
   * Check if subscribed to a room
   */
  isSubscribed(roomId: string): boolean {
    return this.channels.has(roomId);
  }

  /**
   * Get all subscribed room IDs
   */
  getSubscribedRooms(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Cleanup all subscriptions
   */
  async cleanup(): Promise<void> {
    const rooms = Array.from(this.channels.keys());
    for (const roomId of rooms) {
      await this.unsubscribeFromRoom(roomId);
    }
  }
}

export const discoveredLiveRealtimeService = DiscoveredLiveRealtimeService.getInstance();
