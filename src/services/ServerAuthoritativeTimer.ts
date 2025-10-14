/**
 * Server-Authoritative Timer Service
 * Provides synchronized timing across all clients
 *
 * Problem: Client clocks may be out of sync, causing timing issues
 * Solution: Server broadcasts authoritative time updates
 *
 * Features:
 * - Server-controlled countdown timers
 * - Clock skew compensation
 * - Periodic time sync broadcasts
 * - Client-side interpolation for smooth countdown
 */

import { supabase } from '../lib/supabase';
import { discoveredLiveRealtimeService } from './DiscoveredLiveRealtimeService';

interface TimerState {
  sessionId: string;
  questionNumber: number;
  startedAt: Date;
  endsAt: Date;
  durationSeconds: number;
  isPaused: boolean;
}

interface TimeSync {
  serverTime: Date;
  clientTime: Date;
  offset: number; // milliseconds
}

class ServerAuthoritativeTimer {
  private static instance: ServerAuthoritativeTimer;
  private activeTimers: Map<string, TimerState> = new Map();
  private syncBroadcastIntervals: Map<string, NodeJS.Timeout> = new Map();
  private timeSync: TimeSync | null = null;

  private readonly SYNC_INTERVAL_MS = 2000; // Broadcast time every 2 seconds

  private constructor() {}

  static getInstance(): ServerAuthoritativeTimer {
    if (!ServerAuthoritativeTimer.instance) {
      ServerAuthoritativeTimer.instance = new ServerAuthoritativeTimer();
    }
    return ServerAuthoritativeTimer.instance;
  }

  // ================================================================
  // SERVER-SIDE TIMER CONTROL
  // ================================================================

  /**
   * Start a timer for a question
   * (Called from GameOrchestrator when question starts)
   */
  async startTimer(
    sessionId: string,
    roomId: string,
    questionNumber: number,
    durationSeconds: number
  ): Promise<void> {
    const now = new Date();
    const endsAt = new Date(now.getTime() + durationSeconds * 1000);

    const timerState: TimerState = {
      sessionId,
      questionNumber,
      startedAt: now,
      endsAt,
      durationSeconds,
      isPaused: false,
    };

    this.activeTimers.set(sessionId, timerState);

    // Broadcast initial timer state
    await this.broadcastTimerUpdate(roomId, timerState);

    // Start periodic sync broadcasts
    this.startSyncBroadcasts(sessionId, roomId);

    console.log(`⏱️ Started timer for session ${sessionId}, Q${questionNumber} (${durationSeconds}s)`);
  }

  /**
   * Stop a timer
   */
  stopTimer(sessionId: string): void {
    this.activeTimers.delete(sessionId);
    this.stopSyncBroadcasts(sessionId);
    console.log(`⏹️ Stopped timer for session ${sessionId}`);
  }

  /**
   * Pause a timer
   */
  pauseTimer(sessionId: string): void {
    const timer = this.activeTimers.get(sessionId);
    if (timer) {
      timer.isPaused = true;
      console.log(`⏸️ Paused timer for session ${sessionId}`);
    }
  }

  /**
   * Resume a timer
   */
  resumeTimer(sessionId: string): void {
    const timer = this.activeTimers.get(sessionId);
    if (timer) {
      timer.isPaused = false;
      console.log(`▶️ Resumed timer for session ${sessionId}`);
    }
  }

  /**
   * Get remaining time for a timer
   */
  getTimeRemaining(sessionId: string): number {
    const timer = this.activeTimers.get(sessionId);
    if (!timer) return 0;

    if (timer.isPaused) {
      return Math.max(0, Math.floor((timer.endsAt.getTime() - timer.startedAt.getTime()) / 1000));
    }

    const now = new Date();
    const remainingMs = Math.max(0, timer.endsAt.getTime() - now.getTime());
    return Math.floor(remainingMs / 1000);
  }

  // ================================================================
  // SYNC BROADCASTS
  // ================================================================

  /**
   * Start periodic sync broadcasts for a timer
   */
  private startSyncBroadcasts(sessionId: string, roomId: string): void {
    // Clear existing interval if any
    this.stopSyncBroadcasts(sessionId);

    const interval = setInterval(async () => {
      const timer = this.activeTimers.get(sessionId);
      if (!timer) {
        this.stopSyncBroadcasts(sessionId);
        return;
      }

      await this.broadcastTimerUpdate(roomId, timer);
    }, this.SYNC_INTERVAL_MS);

    this.syncBroadcastIntervals.set(sessionId, interval);
  }

  /**
   * Stop sync broadcasts for a timer
   */
  private stopSyncBroadcasts(sessionId: string): void {
    const interval = this.syncBroadcastIntervals.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.syncBroadcastIntervals.delete(sessionId);
    }
  }

  /**
   * Broadcast timer update to all clients
   */
  private async broadcastTimerUpdate(roomId: string, timer: TimerState): Promise<void> {
    const now = new Date();
    const remainingMs = Math.max(0, timer.endsAt.getTime() - now.getTime());
    const remainingSeconds = Math.floor(remainingMs / 1000);

    await discoveredLiveRealtimeService.broadcastEvent(roomId, 'timer_update', {
      sessionId: timer.sessionId,
      questionNumber: timer.questionNumber,
      serverTime: now.toISOString(),
      remainingSeconds,
      endsAt: timer.endsAt.toISOString(),
      isPaused: timer.isPaused,
    });
  }

  // ================================================================
  // CLIENT-SIDE CLOCK SYNC
  // ================================================================

  /**
   * Sync client clock with server
   * (Called from client to establish time offset)
   */
  async syncClientClock(): Promise<TimeSync> {
    const clientRequestTime = new Date();

    try {
      // Get server time from database
      const client = await supabase();
      const { data, error } = await client.rpc('get_server_time');

      if (error) throw error;

      const clientResponseTime = new Date();
      const roundTripTime = clientResponseTime.getTime() - clientRequestTime.getTime();
      const serverTime = new Date(data);

      // Estimate one-way latency
      const estimatedLatency = roundTripTime / 2;

      // Calculate offset (server time - client time)
      const offset = serverTime.getTime() + estimatedLatency - clientResponseTime.getTime();

      this.timeSync = {
        serverTime,
        clientTime: clientResponseTime,
        offset,
      };

      console.log(`🔄 Clock synced: offset = ${offset}ms`);

      return this.timeSync;
    } catch (error) {
      console.error('Failed to sync clock:', error);
      // Fallback: assume no offset
      return {
        serverTime: clientRequestTime,
        clientTime: clientRequestTime,
        offset: 0,
      };
    }
  }

  /**
   * Get synchronized server time on client
   */
  getServerTime(): Date {
    if (!this.timeSync) {
      return new Date(); // No sync yet, use local time
    }

    const now = new Date();
    return new Date(now.getTime() + this.timeSync.offset);
  }

  /**
   * Convert server timestamp to client time
   */
  serverToClientTime(serverTimestamp: string): Date {
    const serverTime = new Date(serverTimestamp);

    if (!this.timeSync) {
      return serverTime;
    }

    return new Date(serverTime.getTime() - this.timeSync.offset);
  }

  /**
   * Calculate time remaining from server timestamp
   */
  calculateTimeRemaining(endsAtServer: string): number {
    const serverNow = this.getServerTime();
    const endsAt = new Date(endsAtServer);
    const remainingMs = Math.max(0, endsAt.getTime() - serverNow.getTime());
    return Math.floor(remainingMs / 1000);
  }

  // ================================================================
  // UTILITY
  // ================================================================

  /**
   * Get all active timers
   */
  getActiveTimers(): TimerState[] {
    return Array.from(this.activeTimers.values());
  }

  /**
   * Get timer state
   */
  getTimerState(sessionId: string): TimerState | null {
    return this.activeTimers.get(sessionId) || null;
  }

  /**
   * Check if timer has expired
   */
  hasTimerExpired(sessionId: string): boolean {
    const timer = this.activeTimers.get(sessionId);
    if (!timer) return true;

    const now = new Date();
    return now >= timer.endsAt;
  }

  /**
   * Get clock sync status
   */
  getSyncStatus(): {
    isSynced: boolean;
    offset: number;
    lastSyncAt?: Date;
  } {
    return {
      isSynced: this.timeSync !== null,
      offset: this.timeSync?.offset || 0,
      lastSyncAt: this.timeSync?.clientTime,
    };
  }

  /**
   * Clear all timers
   */
  clearAll(): void {
    // Stop all intervals
    for (const sessionId of this.syncBroadcastIntervals.keys()) {
      this.stopSyncBroadcasts(sessionId);
    }

    this.activeTimers.clear();
    this.timeSync = null;
    console.log('🧹 Cleared all timers');
  }
}

export const serverAuthoritativeTimer = ServerAuthoritativeTimer.getInstance();
