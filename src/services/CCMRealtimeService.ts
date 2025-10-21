/**
 * CCM (Career Challenge Multiplayer) Realtime Service
 * Handles real-time updates for CCM perpetual rooms using Supabase Realtime
 *
 * Features:
 * - Room state synchronization
 * - Live game events (rounds, card selections, scoring)
 * - Participant presence tracking
 * - Leaderboard updates
 * - Event broadcasting
 */

import { supabase } from '../lib/supabase';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * CCM Event Types
 */
export type CCMEventType =
  | 'player_joined'
  | 'player_left'
  | 'player_locked_in'
  | 'round_started'
  | 'round_ended'
  | 'game_started'
  | 'game_ended'
  | 'c_suite_selected'
  | 'mvp_selected'
  | 'leaderboard_updated'
  | 'room_status_changed';

/**
 * CCM WebSocket Event
 */
export interface CCMEvent {
  type: CCMEventType;
  roomId: string;
  timestamp: string;
  data: any;
}

/**
 * Event handler type
 */
type EventHandler = (event: CCMEvent) => void;

/**
 * Realtime Service for CCM
 */
class CCMRealtimeService {
  private static instance: CCMRealtimeService;
  private channels: Map<string, RealtimeChannel> = new Map();
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();

  private constructor() {}

  static getInstance(): CCMRealtimeService {
    if (!CCMRealtimeService.instance) {
      CCMRealtimeService.instance = new CCMRealtimeService();
    }
    return CCMRealtimeService.instance;
  }

  // ================================================================
  // CHANNEL MANAGEMENT
  // ================================================================

  /**
   * Subscribe to a CCM room's events
   */
  async subscribeToRoom(roomId: string, handlers: Partial<Record<CCMEventType, EventHandler>>): Promise<void> {
    const client = await supabase();

    // Create channel for this room
    const channel = client.channel(`ccm:room:${roomId}`, {
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
          table: 'ccm_game_sessions',
          filter: `perpetual_room_id=eq.${roomId}`,
        },
        (payload) => this.handleSessionUpdate(roomId, payload)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ccm_perpetual_rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => this.handleRoomUpdate(roomId, payload)
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ccm_session_participants',
          filter: `perpetual_room_id=eq.${roomId}`,
        },
        (payload) => this.handleParticipantJoin(roomId, payload)
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ccm_session_participants',
          filter: `perpetual_room_id=eq.${roomId}`,
        },
        (payload) => this.handleParticipantUpdate(roomId, payload)
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ccm_round_plays',
          filter: `game_session_id=eq.${roomId}`,
        },
        (payload) => this.handleRoundPlayInsert(roomId, payload)
      );

    // Subscribe to channel
    await channel.subscribe();

    // Store channel
    this.channels.set(roomId, channel);

    console.log(`✅ [CCM] Subscribed to room ${roomId}`);
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
      console.log(`❌ [CCM] Unsubscribed from room ${roomId}`);
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
   * Broadcast player joined event
   */
  async broadcastPlayerJoined(
    roomId: string,
    participantId: string,
    displayName: string,
    participantType: 'human' | 'ai'
  ): Promise<void> {
    await this.broadcast(roomId, 'player_joined', {
      participantId,
      displayName,
      participantType,
    });
  }

  /**
   * Broadcast player left event
   */
  async broadcastPlayerLeft(
    roomId: string,
    playerId: string,
    displayName: string,
    remainingPlayers: number
  ): Promise<void> {
    await this.broadcast(roomId, 'player_left', {
      playerId,
      displayName,
      remainingPlayers,
    });
  }

  /**
   * Broadcast game started event
   */
  async broadcastGameStarted(
    roomId: string,
    sessionId: string,
    gameNumber: number,
    participants: any[]
  ): Promise<void> {
    await this.broadcast(roomId, 'game_started', {
      sessionId,
      gameNumber,
      participants,
    });
  }

  /**
   * Broadcast round started event
   */
  async broadcastRoundStarted(
    roomId: string,
    sessionId: string,
    roundNumber: number,
    roundType: string,
    challengeCard: any
  ): Promise<void> {
    await this.broadcast(roomId, 'round_started', {
      sessionId,
      roundNumber,
      roundType,
      challengeCard,
    });
  }

  /**
   * Broadcast player locked in selection
   */
  async broadcastPlayerLockedIn(
    roomId: string,
    sessionId: string,
    participantId: string,
    displayName: string,
    roundNumber: number
  ): Promise<void> {
    await this.broadcast(roomId, 'player_locked_in', {
      sessionId,
      participantId,
      displayName,
      roundNumber,
    });
  }

  /**
   * Broadcast C-Suite selection
   */
  async broadcastCSuiteSelected(
    roomId: string,
    sessionId: string,
    participantId: string,
    cSuiteChoice: string
  ): Promise<void> {
    await this.broadcast(roomId, 'c_suite_selected', {
      sessionId,
      participantId,
      cSuiteChoice,
    });
  }

  /**
   * Broadcast MVP selection
   */
  async broadcastMVPSelected(
    roomId: string,
    sessionId: string,
    participantId: string,
    displayName: string,
    afterRound: number
  ): Promise<void> {
    await this.broadcast(roomId, 'mvp_selected', {
      sessionId,
      participantId,
      displayName,
      afterRound,
    });
  }

  /**
   * Broadcast round ended event
   */
  async broadcastRoundEnded(
    roomId: string,
    sessionId: string,
    roundNumber: number,
    roundScores: any[]
  ): Promise<void> {
    await this.broadcast(roomId, 'round_ended', {
      sessionId,
      roundNumber,
      roundScores,
    });
  }

  /**
   * Broadcast game ended event
   */
  async broadcastGameEnded(
    roomId: string,
    sessionId: string,
    gameNumber: number,
    finalLeaderboard: any[],
    nextGameStartsAt: string
  ): Promise<void> {
    await this.broadcast(roomId, 'game_ended', {
      sessionId,
      gameNumber,
      finalLeaderboard,
      nextGameStartsAt,
    });
  }

  /**
   * Broadcast leaderboard updated event
   */
  async broadcastLeaderboardUpdated(
    roomId: string,
    sessionId: string,
    leaderboard: any[]
  ): Promise<void> {
    await this.broadcast(roomId, 'leaderboard_updated', {
      sessionId,
      leaderboard,
    });
  }

  /**
   * Generic broadcast helper
   */
  private async broadcast(roomId: string, eventType: CCMEventType, data: any): Promise<void> {
    const channel = this.channels.get(roomId);
    if (!channel) {
      console.warn(`[CCM] Cannot broadcast - not subscribed to room ${roomId}`);
      return;
    }

    try {
      const payload = {
        type: eventType,
        roomId,
        timestamp: new Date().toISOString(),
        data,
      };

      // Emit event locally first (for same-client updates)
      this.emitEvent(roomId, eventType, data);

      // Broadcast via channel
      await channel.send({
        type: 'broadcast',
        event: eventType,
        payload,
      }).catch((error) => {
        console.warn(`[CCM] Broadcast failed for ${eventType}:`, error.message);
      });
    } catch (error) {
      console.error(`[CCM] Error broadcasting ${eventType}:`, error);
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
    const event = payload.payload as CCMEvent;

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
    console.log(`[CCM] Presence sync for room ${roomId}:`, state);
    this.emitEvent(roomId, 'player_joined' as CCMEventType, { state });
  }

  /**
   * Handle presence join
   */
  private handlePresenceJoin(roomId: string, key: string, newPresences: any[]): void {
    console.log(`[CCM] User joined room ${roomId}:`, newPresences);
    this.emitEvent(roomId, 'player_joined' as CCMEventType, { key, newPresences });
  }

  /**
   * Handle presence leave
   */
  private handlePresenceLeave(roomId: string, key: string, leftPresences: any[]): void {
    console.log(`[CCM] User left room ${roomId}:`, leftPresences);
    this.emitEvent(roomId, 'player_left' as CCMEventType, { key, leftPresences });
  }

  /**
   * Handle session update (postgres changes)
   */
  private handleSessionUpdate(roomId: string, payload: RealtimePostgresChangesPayload<any>): void {
    console.log(`[CCM] Session updated in room ${roomId}:`, payload.new);

    // Check if round changed
    if (payload.new.current_round !== payload.old?.current_round) {
      this.emitEvent(roomId, 'round_started' as CCMEventType, payload.new);
    }

    // Check if game status changed
    if (payload.new.status !== payload.old?.status) {
      if (payload.new.status === 'completed') {
        this.emitEvent(roomId, 'game_ended' as CCMEventType, payload.new);
      }
    }
  }

  /**
   * Handle room update (postgres changes)
   */
  private handleRoomUpdate(roomId: string, payload: RealtimePostgresChangesPayload<any>): void {
    console.log(`[CCM] Room updated ${roomId}:`, payload.new);
    this.emitEvent(roomId, 'room_status_changed' as CCMEventType, payload.new);
  }

  /**
   * Handle participant join (postgres changes)
   */
  private handleParticipantJoin(roomId: string, payload: RealtimePostgresChangesPayload<any>): void {
    console.log(`[CCM] Participant joined room ${roomId}:`, payload.new);
    this.emitEvent(roomId, 'player_joined' as CCMEventType, payload.new);
  }

  /**
   * Handle participant update (postgres changes)
   */
  private handleParticipantUpdate(roomId: string, payload: RealtimePostgresChangesPayload<any>): void {
    console.log(`[CCM] Participant updated in room ${roomId}:`, payload.new);

    // Check if score changed - trigger leaderboard update
    if (payload.new.total_score !== payload.old?.total_score) {
      this.emitEvent(roomId, 'leaderboard_updated' as CCMEventType, payload.new);
    }

    // Check if C-Suite choice was set
    if (payload.new.c_suite_choice && !payload.old?.c_suite_choice) {
      this.emitEvent(roomId, 'c_suite_selected' as CCMEventType, payload.new);
    }
  }

  /**
   * Handle round play insert (postgres changes)
   */
  private handleRoundPlayInsert(roomId: string, payload: RealtimePostgresChangesPayload<any>): void {
    console.log(`[CCM] Round play recorded in room ${roomId}:`, payload.new);
    this.emitEvent(roomId, 'player_locked_in' as CCMEventType, payload.new);
  }

  /**
   * Emit custom event
   */
  private emitEvent(roomId: string, eventType: CCMEventType, data: any): void {
    const event: CCMEvent = {
      type: eventType,
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

export const ccmRealtimeService = CCMRealtimeService.getInstance();
