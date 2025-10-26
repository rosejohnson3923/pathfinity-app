/**
 * Career Match Realtime Service
 * Handles realtime multiplayer synchronization using Supabase Realtime
 * Broadcasts game events to all players in a room
 */

import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import type {
  CareerMatchEvent,
  CareerMatchPlayer,
  CareerMatchCard,
  CareerMatchRoom,
  PlayerJoinedEvent,
  PlayerLeftEvent,
  GameStartedEvent,
  CardFlippedEvent,
  MatchFoundEvent,
  NoMatchEvent,
  TurnChangedEvent,
  GameEndedEvent,
  StreakBonusEvent,
  TimeWarningEvent,
} from '@/types/CareerMatchTypes';

interface EventCallback {
  (event: CareerMatchEvent): void;
}

class CareerMatchRealtimeService {
  private static instance: CareerMatchRealtimeService;
  private channels: Map<string, RealtimeChannel> = new Map();
  private eventCallbacks: Map<string, EventCallback[]> = new Map();

  private constructor() {}

  static getInstance(): CareerMatchRealtimeService {
    if (!CareerMatchRealtimeService.instance) {
      CareerMatchRealtimeService.instance = new CareerMatchRealtimeService();
    }
    return CareerMatchRealtimeService.instance;
  }

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  /**
   * Subscribe to realtime events for a room
   * @param roomId - Perpetual room ID
   * @param callback - Event callback
   * @param sessionId - Optional game session ID for card updates
   */
  subscribeToRoom(roomId: string, callback: EventCallback, sessionId?: string): void {
    // Add callback only if not already registered
    if (!this.eventCallbacks.has(roomId)) {
      this.eventCallbacks.set(roomId, []);
    }

    const callbacks = this.eventCallbacks.get(roomId)!;
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
      console.log('[CareerMatch] Added callback for room:', roomId, '- total callbacks:', callbacks.length);
    } else {
      console.log('[CareerMatch] Callback already registered for room:', roomId);
    }

    // Create channel if doesn't exist OR if sessionId has changed
    // (need to recreate cards channel with proper filter when game starts)
    const sessionChannelKey = `${roomId}:sessions`;
    const cardsChannelKey = `${roomId}:cards`;
    const needsRecreate = sessionId && !this.channels.has(cardsChannelKey);

    if (!this.channels.has(sessionChannelKey) || needsRecreate) {
      if (needsRecreate) {
        console.log('[CareerMatch] Recreating channels for session:', sessionId);
        this.removeRoomChannel(roomId);
      }
      this.createRoomChannel(roomId, sessionId);
    } else {
      console.log('[CareerMatch] Channels already exist for room:', roomId, '- skipping creation');
    }
  }

  /**
   * Unsubscribe from room events
   */
  unsubscribeFromRoom(roomId: string, callback?: EventCallback): void {
    if (callback) {
      // Remove specific callback
      const callbacks = this.eventCallbacks.get(roomId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    } else {
      // Remove all callbacks
      this.eventCallbacks.delete(roomId);
    }

    // Remove channel if no more callbacks
    if (!this.eventCallbacks.get(roomId)?.length) {
      this.removeRoomChannel(roomId);
    }
  }

  /**
   * Create realtime channels for a room (one channel per table)
   */
  private async createRoomChannel(roomId: string, sessionId?: string): Promise<void> {
    const client = await supabase();

    console.log('[CareerMatch] Creating channels for room:', roomId, 'session:', sessionId);

    // ============================================================================
    // CHANNEL 1: cm_game_sessions changes (card flips, turn changes, game status)
    // ============================================================================
    const sessionChannel = client.channel(`career-match:${roomId}:sessions`, {
      config: {
        broadcast: { self: true },
      },
    });

    sessionChannel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cm_game_sessions',
          filter: `perpetual_room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('[CareerMatch] Session UPDATE:', payload);

          const oldData = payload.old;
          const newData = payload.new;

          // Detect turn changes
          if (oldData.current_turn_player_id !== newData.current_turn_player_id) {
            console.log('[CareerMatch] Turn changed detected');
            this.notifyCallbacks(roomId, {
              type: 'turn_changed',
              data: {
                next_player_id: newData.current_turn_player_id,
                turn_number: newData.current_turn_number,
              },
            });
          }

          // Detect first card flip (null -> number)
          if (oldData.first_card_flipped === null && newData.first_card_flipped !== null) {
            console.log('[CareerMatch] First card flipped:', newData.first_card_flipped);
            this.notifyCallbacks(roomId, {
              type: 'card_flipped',
              data: {
                position: newData.first_card_flipped,
                is_first_flip: true,
              },
            });
          }

          // Detect second card flip (second_card_flipped changes from null -> number)
          if (oldData.second_card_flipped === null && newData.second_card_flipped !== null) {
            console.log('[CareerMatch] Second card flipped:', newData.second_card_flipped);
            this.notifyCallbacks(roomId, {
              type: 'card_flipped',
              data: {
                position: newData.second_card_flipped,
                is_first_flip: false,
              },
            });
          }

          // NOTE: Match/no-match events are now emitted by the cards channel
          // based on match_state transitions (M1→M2→M3 or M1→NULL)
          // This provides better synchronization for simultaneous UI updates

          // Detect game completion
          if (oldData.status === 'active' && newData.status === 'completed') {
            console.log('[CareerMatch] Game completed');
            this.notifyCallbacks(roomId, {
              type: 'game_ended',
              data: {
                winners: newData.winners || [],
              },
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`[CareerMatch] Session channel status:`, status);
      });

    // ============================================================================
    // CHANNEL 2: cm_cards changes (matched cards)
    // ============================================================================
    const cardsChannel = client.channel(`career-match:${roomId}:cards`, {
      config: {
        broadcast: { self: true },
      },
    });

    cardsChannel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cm_cards',
          ...(sessionId ? { filter: `game_session_id=eq.${sessionId}` } : {}),
        },
        (payload) => {
          console.log('[CareerMatch] Card UPDATE:', payload);

          const oldData = payload.old;
          const newData = payload.new;

          // Detect match_state changes for M1→M2→M3 state machine
          const oldState = oldData.match_state;
          const newState = newData.match_state;

          // Card flipped (NULL → M1)
          if (oldState === null && newState === 'M1') {
            console.log('[CareerMatch] Card flipped to M1 at position:', newData.position);
            this.notifyCallbacks(roomId, {
              type: 'card_flipped',
              data: {
                position: newData.position,
                career_name: newData.career_name,
                match_state: 'M1',
              },
            });
          }

          // Match detected (M1 → M2)
          if (oldState === 'M1' && newState === 'M2') {
            console.log('[CareerMatch] Card transitioned to M2 (match detected) at position:', newData.position);
            this.notifyCallbacks(roomId, {
              type: 'match_detected',
              data: {
                position: newData.position,
                career_name: newData.career_name,
                match_state: 'M2',
              },
            });
          }

          // Match persisted (M2 → M3) - Show checkmark!
          if (oldState === 'M2' && newState === 'M3') {
            console.log('[CareerMatch] Card transitioned to M3 (match persisted) at position:', newData.position);
            this.notifyCallbacks(roomId, {
              type: 'match_found',
              data: {
                position: newData.position,
                career_name: newData.career_name,
                player_name: newData.matched_by_participant_id, // Will need to resolve this
                match_state: 'M3',
              },
            });
          }

          // No match - reset (M1 → NULL)
          if (oldState === 'M1' && newState === null) {
            console.log('[CareerMatch] Card reset to NULL (no match) at position:', newData.position);
            this.notifyCallbacks(roomId, {
              type: 'card_reset',
              data: {
                position: newData.position,
                match_state: null,
              },
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`[CareerMatch] Cards channel status:`, status);
      });

    // ============================================================================
    // CHANNEL 3: cm_session_participants changes (streaks)
    // ============================================================================
    const participantsChannel = client.channel(`career-match:${roomId}:participants`, {
      config: {
        broadcast: { self: true },
      },
    });

    participantsChannel
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cm_session_participants',
          filter: `perpetual_room_id=eq.${roomId}`,
        },
        (payload) => {
          console.log('[CareerMatch] Participant UPDATE:', payload);

          const oldData = payload.old;
          const newData = payload.new;

          // Detect pairs_matched changes (for leaderboard updates)
          if (oldData.pairs_matched !== newData.pairs_matched) {
            console.log('[CareerMatch] Pairs matched updated:', {
              player: newData.display_name,
              old: oldData.pairs_matched,
              new: newData.pairs_matched
            });
            this.notifyCallbacks(roomId, {
              type: 'player_stats_updated',
              data: {
                player_id: newData.id,
                participant_id: newData.id,
                user_id: newData.user_id,
                display_name: newData.display_name,
                pairs_matched: newData.pairs_matched,
                total_xp: newData.total_xp,
                arcade_xp: newData.arcade_xp,
                current_streak: newData.current_streak,
                max_streak: newData.max_streak,
              },
            });
          }

          // Detect streak changes
          if (oldData.current_streak !== newData.current_streak && newData.current_streak >= 3) {
            console.log('[CareerMatch] Streak bonus:', newData.current_streak);
            this.notifyCallbacks(roomId, {
              type: 'streak_bonus',
              data: {
                player_id: newData.id,
                display_name: newData.display_name,
                streak_count: newData.current_streak,
              },
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`[CareerMatch] Participants channel status:`, status);
      });

    // Store all channels with a composite key
    this.channels.set(`${roomId}:sessions`, sessionChannel);
    this.channels.set(`${roomId}:cards`, cardsChannel);
    this.channels.set(`${roomId}:participants`, participantsChannel);

    // Also store the main roomId for backwards compatibility
    this.channels.set(roomId, sessionChannel);
  }

  /**
   * Remove and unsubscribe from all channels for a room
   */
  private async removeRoomChannel(roomId: string): Promise<void> {
    const client = await supabase();

    // Remove all 3 channels
    const channelKeys = [
      `${roomId}:sessions`,
      `${roomId}:cards`,
      `${roomId}:participants`,
      roomId // backwards compatibility
    ];

    for (const key of channelKeys) {
      const channel = this.channels.get(key);
      if (channel) {
        client.removeChannel(channel);
        this.channels.delete(key);
      }
    }
  }

  // ============================================================================
  // DATABASE CHANGE HANDLERS
  // ============================================================================

  /**
   * Handle player table changes
   */
  private handlePlayerChange(roomId: string, payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT') {
      const player = newRecord as CareerMatchPlayer;
      this.notifyCallbacks(roomId, {
        type: 'player_joined',
        data: {
          player,
          room_code: '', // Will be filled by component
        },
      });
    } else if (eventType === 'DELETE') {
      const player = oldRecord as CareerMatchPlayer;
      this.notifyCallbacks(roomId, {
        type: 'player_left',
        data: {
          player_id: player.id,
          display_name: player.display_name,
        },
      });
    } else if (eventType === 'UPDATE') {
      const player = newRecord as CareerMatchPlayer;
      const oldPlayer = oldRecord as CareerMatchPlayer;

      // Check if turn changed
      if (player.is_active_turn && !oldPlayer.is_active_turn) {
        // This player's turn just started
        // Turn change event will be handled by room update
      }
    }
  }

  /**
   * Handle card table changes
   */
  private handleCardChange(roomId: string, payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'UPDATE') {
      const card = newRecord as CareerMatchCard;
      const oldCard = oldRecord as CareerMatchCard;

      // Card was revealed
      if (card.is_revealed && !oldCard.is_revealed) {
        // Card flip will be broadcast separately
      }

      // Card was matched
      if (card.is_matched && !oldCard.is_matched) {
        // Match event will be broadcast separately
      }
    }
  }

  /**
   * Handle room table changes
   */
  private handleRoomChange(roomId: string, payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'UPDATE') {
      const room = newRecord as CareerMatchRoom;
      const oldRoom = oldRecord as CareerMatchRoom;

      // Game started
      if (room.status === 'active' && oldRoom.status === 'waiting') {
        // Game start event will be broadcast separately
      }

      // Game ended
      if (room.status === 'completed' && oldRoom.status === 'active') {
        // Game end event will be broadcast separately
      }

      // Turn changed
      if (room.current_turn_player_id !== oldRoom.current_turn_player_id) {
        // Turn change event will be broadcast separately
      }
    }
  }

  /**
   * Handle broadcast events
   */
  private handleBroadcastEvent(roomId: string, event: CareerMatchEvent): void {
    this.notifyCallbacks(roomId, event);
  }

  /**
   * Notify all callbacks for a room
   */
  private notifyCallbacks(roomId: string, event: CareerMatchEvent): void {
    const callbacks = this.eventCallbacks.get(roomId);
    if (callbacks) {
      callbacks.forEach((callback) => callback(event));
    }
  }

  // ============================================================================
  // BROADCAST EVENTS
  // ============================================================================

  /**
   * Broadcast player joined event
   */
  broadcastPlayerJoined(roomId: string, player: CareerMatchPlayer, roomCode: string): void {
    const event: PlayerJoinedEvent = {
      type: 'player_joined',
      data: { player, room_code: roomCode },
    };
    this.broadcast(roomId, event);
  }

  /**
   * Broadcast player left event
   */
  broadcastPlayerLeft(roomId: string, playerId: string, displayName: string): void {
    const event: PlayerLeftEvent = {
      type: 'player_left',
      data: { player_id: playerId, display_name: displayName },
    };
    this.broadcast(roomId, event);
  }

  /**
   * Broadcast game started event
   */
  broadcastGameStarted(roomId: string, cards: CareerMatchCard[], firstPlayerId: string, startedAt: string): void {
    const event: GameStartedEvent = {
      type: 'game_started',
      data: { cards, first_player_id: firstPlayerId, started_at: startedAt },
    };
    this.broadcast(roomId, event);
  }

  /**
   * Broadcast card flipped event
   */
  broadcastCardFlipped(
    roomId: string,
    position: number,
    cardId: string,
    playerId: string,
    isFirstFlip: boolean
  ): void {
    const event: CardFlippedEvent = {
      type: 'card_flipped',
      data: { position, card_id: cardId, player_id: playerId, is_first_flip: isFirstFlip },
    };
    this.broadcast(roomId, event);
  }

  /**
   * Broadcast match found event
   */
  broadcastMatchFound(
    roomId: string,
    playerId: string,
    playerName: string,
    card1Position: number,
    card2Position: number,
    careerName: string,
    pairId: number,
    xpEarned: number,
    consecutiveMatches: number
  ): void {
    const event: MatchFoundEvent = {
      type: 'match_found',
      data: {
        player_id: playerId,
        player_name: playerName,
        card_1_position: card1Position,
        card_2_position: card2Position,
        career_name: careerName,
        pair_id: pairId,
        xp_earned: xpEarned,
        consecutive_matches: consecutiveMatches,
      },
    };
    this.broadcast(roomId, event);
  }

  /**
   * Broadcast no match event
   */
  broadcastNoMatch(roomId: string, playerId: string, card1Position: number, card2Position: number): void {
    const event: NoMatchEvent = {
      type: 'no_match',
      data: { player_id: playerId, card_1_position: card1Position, card_2_position: card2Position },
    };
    this.broadcast(roomId, event);
  }

  /**
   * Broadcast turn changed event
   */
  broadcastTurnChanged(
    roomId: string,
    previousPlayerId: string,
    nextPlayerId: string,
    nextPlayerName: string,
    turnNumber: number
  ): void {
    const event: TurnChangedEvent = {
      type: 'turn_changed',
      data: {
        previous_player_id: previousPlayerId,
        next_player_id: nextPlayerId,
        next_player_name: nextPlayerName,
        turn_number: turnNumber,
      },
    };
    this.broadcast(roomId, event);
  }

  /**
   * Broadcast game ended event
   */
  broadcastGameEnded(
    roomId: string,
    winners: any[],
    totalTurns: number,
    durationSeconds: number,
    endedAt: string
  ): void {
    const event: GameEndedEvent = {
      type: 'game_ended',
      data: {
        winners,
        total_turns: totalTurns,
        duration_seconds: durationSeconds,
        ended_at: endedAt,
      },
    };
    this.broadcast(roomId, event);
  }

  /**
   * Broadcast streak bonus event
   */
  broadcastStreakBonus(
    roomId: string,
    playerId: string,
    playerName: string,
    streakCount: number,
    bonusXp: number
  ): void {
    const event: StreakBonusEvent = {
      type: 'streak_bonus',
      data: {
        player_id: playerId,
        player_name: playerName,
        streak_count: streakCount,
        bonus_xp: bonusXp,
      },
    };
    this.broadcast(roomId, event);
  }

  /**
   * Broadcast time warning event
   */
  broadcastTimeWarning(roomId: string, secondsRemaining: number, message: string): void {
    const event: TimeWarningEvent = {
      type: 'time_warning',
      data: { seconds_remaining: secondsRemaining, message },
    };
    this.broadcast(roomId, event);
  }

  /**
   * Generic broadcast method
   */
  private broadcast(roomId: string, event: CareerMatchEvent): void {
    const channel = this.channels.get(roomId);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'game_event',
        payload: event,
      });
    }
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  /**
   * Get active subscriptions count
   */
  getActiveSubscriptions(): number {
    return this.channels.size;
  }

  /**
   * Get subscribed room IDs
   */
  getSubscribedRooms(): string[] {
    return Array.from(this.channels.keys());
  }

  /**
   * Unsubscribe from all rooms
   */
  async unsubscribeAll(): Promise<void> {
    const client = await supabase();
    this.channels.forEach((channel) => {
      client.removeChannel(channel);
    });
    this.channels.clear();
    this.eventCallbacks.clear();
  }
}

export default CareerMatchRealtimeService.getInstance();
