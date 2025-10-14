/**
 * Disconnection Handler Service
 * Manages player disconnections, reconnections, and AI takeover
 *
 * Responsibilities:
 * - Detect disconnected players
 * - Mark players as disconnected in database
 * - Handle reconnection logic
 * - Sync missed events for reconnected players
 * - Optional AI takeover for disconnected players
 * - Grace period before marking as disconnected
 */

import { supabase } from '../lib/supabase';
import { discoveredLiveRealtimeService } from './DiscoveredLiveRealtimeService';
import type {
  SessionParticipant,
  ClickEvent,
  CurrentQuestion,
  BingoWinner,
} from '../types/DiscoveredLiveMultiplayerTypes';

interface DisconnectionRecord {
  participantId: string;
  disconnectedAt: Date;
  lastPingAt: Date;
  gracePeriodEnds: Date;
  isMarkedDisconnected: boolean;
}

interface MissedEventsSummary {
  missedQuestions: number[];
  currentQuestion?: CurrentQuestion;
  participantUpdates: SessionParticipant;
  clickEvents: ClickEvent[];
  bingoWinners: BingoWinner[];
}

class DisconnectionHandler {
  private static instance: DisconnectionHandler;
  private disconnectionMap: Map<string, DisconnectionRecord> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly GRACE_PERIOD_MS = 10000; // 10 seconds before marking disconnected
  private readonly HEARTBEAT_INTERVAL_MS = 5000; // Check every 5 seconds
  private readonly PING_TIMEOUT_MS = 8000; // Consider disconnected if no ping in 8s

  private constructor() {}

  static getInstance(): DisconnectionHandler {
    if (!DisconnectionHandler.instance) {
      DisconnectionHandler.instance = new DisconnectionHandler();
    }
    return DisconnectionHandler.instance;
  }

  // ================================================================
  // MONITORING
  // ================================================================

  /**
   * Start monitoring player connections
   */
  startMonitoring(): void {
    if (this.heartbeatInterval) {
      console.warn('Disconnection handler already monitoring');
      return;
    }

    console.log('🔍 Starting disconnection monitoring...');
    this.heartbeatInterval = setInterval(() => {
      this.checkDisconnections();
    }, this.HEARTBEAT_INTERVAL_MS);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('🛑 Stopped disconnection monitoring');
    }
  }

  /**
   * Check all tracked participants for disconnections
   */
  private async checkDisconnections(): Promise<void> {
    const now = new Date();

    for (const [participantId, record] of this.disconnectionMap.entries()) {
      // Check if grace period has ended and not yet marked
      if (now >= record.gracePeriodEnds && !record.isMarkedDisconnected) {
        await this.markAsDisconnected(participantId);
        record.isMarkedDisconnected = true;
      }

      // Check if ping timeout exceeded
      const timeSinceLastPing = now.getTime() - record.lastPingAt.getTime();
      if (timeSinceLastPing > this.PING_TIMEOUT_MS && !record.isMarkedDisconnected) {
        console.warn(`⚠️ Participant ${participantId} exceeded ping timeout`);
      }
    }
  }

  // ================================================================
  // PING/HEARTBEAT
  // ================================================================

  /**
   * Receive ping from participant (keeps them marked as connected)
   */
  async receivePing(participantId: string): Promise<void> {
    const now = new Date();
    const existing = this.disconnectionMap.get(participantId);

    if (existing) {
      // Update last ping time
      existing.lastPingAt = now;
      existing.gracePeriodEnds = new Date(now.getTime() + this.GRACE_PERIOD_MS);

      // If was marked disconnected, handle reconnection
      if (existing.isMarkedDisconnected) {
        await this.handleReconnection(participantId);
        this.disconnectionMap.delete(participantId);
      }
    } else {
      // Start tracking this participant
      this.disconnectionMap.set(participantId, {
        participantId,
        disconnectedAt: now,
        lastPingAt: now,
        gracePeriodEnds: new Date(now.getTime() + this.GRACE_PERIOD_MS),
        isMarkedDisconnected: false,
      });
    }
  }

  /**
   * Manually register a participant for monitoring
   */
  registerParticipant(participantId: string): void {
    if (!this.disconnectionMap.has(participantId)) {
      const now = new Date();
      this.disconnectionMap.set(participantId, {
        participantId,
        disconnectedAt: now,
        lastPingAt: now,
        gracePeriodEnds: new Date(now.getTime() + this.GRACE_PERIOD_MS),
        isMarkedDisconnected: false,
      });
      console.log(`📝 Registered participant ${participantId} for monitoring`);
    }
  }

  /**
   * Unregister a participant (they left the game cleanly)
   */
  unregisterParticipant(participantId: string): void {
    this.disconnectionMap.delete(participantId);
    console.log(`🗑️ Unregistered participant ${participantId}`);
  }

  // ================================================================
  // DISCONNECTION HANDLING
  // ================================================================

  /**
   * Mark participant as disconnected in database
   */
  private async markAsDisconnected(participantId: string): Promise<void> {
    try {
      const client = await supabase();

      // Get participant info
      const { data: participant, error: fetchError } = await client
        .from('dl_session_participants')
        .select('*, dl_game_sessions!inner(perpetual_room_id)')
        .eq('id', participantId)
        .single();

      if (fetchError || !participant) {
        console.error('Failed to fetch participant:', fetchError);
        return;
      }

      // Update connection status
      const { error: updateError } = await client
        .from('dl_session_participants')
        .update({
          connection_status: 'disconnected',
        })
        .eq('id', participantId);

      if (updateError) {
        console.error('Failed to update participant status:', updateError);
        return;
      }

      console.log(`🔌 Marked participant ${participantId} as disconnected`);

      // Broadcast disconnection event
      await discoveredLiveRealtimeService.broadcastEvent(
        (participant as any).dl_game_sessions.perpetual_room_id,
        'participant_disconnected',
        {
          participantId,
          displayName: participant.display_name,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Error marking participant as disconnected:', error);
    }
  }

  /**
   * Handle participant reconnection
   */
  private async handleReconnection(participantId: string): Promise<void> {
    try {
      const client = await supabase();

      // Get participant info
      const { data: participant, error: fetchError } = await client
        .from('dl_session_participants')
        .select('*, dl_game_sessions!inner(perpetual_room_id, id)')
        .eq('id', participantId)
        .single();

      if (fetchError || !participant) {
        console.error('Failed to fetch participant:', fetchError);
        return;
      }

      // Update connection status
      const { error: updateError } = await client
        .from('dl_session_participants')
        .update({
          connection_status: 'connected',
        })
        .eq('id', participantId);

      if (updateError) {
        console.error('Failed to update participant status:', updateError);
        return;
      }

      console.log(`✅ Participant ${participantId} reconnected`);

      // Broadcast reconnection event
      await discoveredLiveRealtimeService.broadcastEvent(
        (participant as any).dl_game_sessions.perpetual_room_id,
        'participant_reconnected',
        {
          participantId,
          displayName: participant.display_name,
          timestamp: new Date().toISOString(),
        }
      );

      // Sync missed events
      const missedEvents = await this.getMissedEvents(
        participantId,
        (participant as any).dl_game_sessions.id
      );

      // Send missed events to reconnected player
      // (This would be sent via WebSocket directly to the player)
      console.log(`📦 Sending ${missedEvents.missedQuestions.length} missed questions to player`);
    } catch (error) {
      console.error('Error handling reconnection:', error);
    }
  }

  // ================================================================
  // EVENT SYNCING
  // ================================================================

  /**
   * Get missed events for reconnected player
   */
  async getMissedEvents(
    participantId: string,
    sessionId: string
  ): Promise<MissedEventsSummary> {
    try {
      const client = await supabase();

      // Get participant's last known question
      const { data: participant } = await client
        .from('dl_session_participants')
        .select('*')
        .eq('id', participantId)
        .single();

      if (!participant) {
        throw new Error('Participant not found');
      }

      // Get current session state
      const { data: session } = await client
        .from('dl_game_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) {
        throw new Error('Session not found');
      }

      // Get all click events that happened while disconnected
      const { data: clickEvents } = await client
        .from('dl_click_events')
        .select('*')
        .eq('game_session_id', sessionId)
        .order('question_number', { ascending: true });

      // Get updated participant data
      const { data: updatedParticipant } = await client
        .from('dl_session_participants')
        .select('*')
        .eq('id', participantId)
        .single();

      // Calculate missed questions
      const missedQuestions: number[] = [];
      const currentQuestionNumber = session.current_question_number;

      // Get bingo winners
      const bingoWinners = session.bingo_winners || [];

      return {
        missedQuestions,
        currentQuestion: undefined, // Would need to fetch current question
        participantUpdates: updatedParticipant as any,
        clickEvents: clickEvents || [],
        bingoWinners,
      };
    } catch (error) {
      console.error('Error getting missed events:', error);
      return {
        missedQuestions: [],
        participantUpdates: {} as any,
        clickEvents: [],
        bingoWinners: [],
      };
    }
  }

  /**
   * Sync participant state after reconnection
   */
  async syncParticipantState(participantId: string): Promise<SessionParticipant | null> {
    try {
      const client = await supabase();

      const { data: participant, error } = await client
        .from('dl_session_participants')
        .select('*')
        .eq('id', participantId)
        .single();

      if (error || !participant) {
        console.error('Failed to sync participant state:', error);
        return null;
      }

      return {
        id: participant.id,
        gameSessionId: participant.game_session_id,
        perpetualRoomId: participant.perpetual_room_id,
        participantType: participant.participant_type,
        studentId: participant.student_id,
        displayName: participant.display_name,
        aiDifficulty: participant.ai_difficulty,
        aiPersonality: participant.ai_personality,
        bingoCard: participant.bingo_card,
        unlockedSquares: participant.unlocked_squares || [],
        completedLines: participant.completed_lines || { rows: [], columns: [], diagonals: [] },
        bingosWon: participant.bingos_won,
        correctAnswers: participant.correct_answers,
        incorrectAnswers: participant.incorrect_answers,
        totalXp: participant.total_xp,
        currentStreak: participant.current_streak,
        maxStreak: participant.max_streak,
        isActive: participant.is_active,
        connectionStatus: participant.connection_status,
        joinedAt: participant.joined_at,
        leftAt: participant.left_at,
      };
    } catch (error) {
      console.error('Error syncing participant state:', error);
      return null;
    }
  }

  // ================================================================
  // AI TAKEOVER (OPTIONAL)
  // ================================================================

  /**
   * Enable AI takeover for disconnected player
   * (AI will play on their behalf until they reconnect)
   */
  async enableAITakeover(participantId: string): Promise<void> {
    try {
      const client = await supabase();

      // Mark participant as AI-controlled
      const { error } = await client
        .from('dl_session_participants')
        .update({
          connection_status: 'disconnected',
          // Could add an 'ai_takeover_enabled' field
        })
        .eq('id', participantId);

      if (error) {
        console.error('Failed to enable AI takeover:', error);
        return;
      }

      console.log(`🤖 Enabled AI takeover for participant ${participantId}`);
    } catch (error) {
      console.error('Error enabling AI takeover:', error);
    }
  }

  /**
   * Disable AI takeover (player reconnected)
   */
  async disableAITakeover(participantId: string): Promise<void> {
    try {
      const client = await supabase();

      const { error } = await client
        .from('dl_session_participants')
        .update({
          connection_status: 'connected',
          // Could remove 'ai_takeover_enabled' field
        })
        .eq('id', participantId);

      if (error) {
        console.error('Failed to disable AI takeover:', error);
        return;
      }

      console.log(`👤 Disabled AI takeover for participant ${participantId}`);
    } catch (error) {
      console.error('Error disabling AI takeover:', error);
    }
  }

  // ================================================================
  // UTILITY
  // ================================================================

  /**
   * Get connection status for a participant
   */
  getConnectionStatus(participantId: string): {
    isTracking: boolean;
    isDisconnected: boolean;
    lastPingAt?: Date;
    gracePeriodEnds?: Date;
  } {
    const record = this.disconnectionMap.get(participantId);

    if (!record) {
      return { isTracking: false, isDisconnected: false };
    }

    return {
      isTracking: true,
      isDisconnected: record.isMarkedDisconnected,
      lastPingAt: record.lastPingAt,
      gracePeriodEnds: record.gracePeriodEnds,
    };
  }

  /**
   * Get all disconnected participants
   */
  getDisconnectedParticipants(): string[] {
    return Array.from(this.disconnectionMap.entries())
      .filter(([_, record]) => record.isMarkedDisconnected)
      .map(([participantId, _]) => participantId);
  }

  /**
   * Clear all tracking data (for testing/cleanup)
   */
  clearAll(): void {
    this.disconnectionMap.clear();
    console.log('🧹 Cleared all disconnection tracking data');
  }
}

export const disconnectionHandler = DisconnectionHandler.getInstance();
