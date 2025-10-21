/**
 * Perpetual Room Scheduler
 * Background service that automatically starts games for perpetual rooms
 *
 * Responsibilities:
 * - Monitor rooms in intermission
 * - Start next game when intermission ends
 * - Handle room lifecycle (active → intermission → active)
 * - Ensure rooms always have games running
 */

import { supabase } from '../lib/supabase';
import { perpetualRoomManager } from './PerpetualRoomManager';
import { gameOrchestrator } from './GameOrchestrator';
import type { DbPerpetualRoom } from '../types/DiscoveredLiveMultiplayerTypes';

class PerpetualRoomScheduler {
  private static instance: PerpetualRoomScheduler;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private checkIntervalMs: number = 1000; // Check every second

  private constructor() {}

  static getInstance(): PerpetualRoomScheduler {
    if (!PerpetualRoomScheduler.instance) {
      PerpetualRoomScheduler.instance = new PerpetualRoomScheduler();
    }
    return PerpetualRoomScheduler.instance;
  }

  // ================================================================
  // SCHEDULER CONTROL
  // ================================================================

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.warn('Perpetual room scheduler is already running');
      return;
    }

    console.log('🚀 Starting perpetual room scheduler...');
    this.isRunning = true;

    // Check immediately
    this.checkRooms();

    // Then check at regular intervals
    this.intervalId = setInterval(() => {
      this.checkRooms();
    }, this.checkIntervalMs);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Stopping perpetual room scheduler...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Check if scheduler is running
   */
  isSchedulerRunning(): boolean {
    return this.isRunning;
  }

  // ================================================================
  // ROOM CHECKING
  // ================================================================

  /**
   * Check all rooms and start games as needed
   */
  private async checkRooms(): Promise<void> {
    try {
      const client = await supabase();

      // Get all active, featured rooms
      const { data: rooms, error } = await client
        .from('cb_perpetual_rooms')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true);

      if (error) {
        console.error('Error fetching rooms:', error);
        return;
      }

      if (!rooms || rooms.length === 0) {
        return;
      }

      // Check each room
      for (const room of rooms) {
        await this.checkRoom(room);
      }
    } catch (error) {
      console.error('Error in room checker:', error);
    }
  }

  /**
   * Check a single room and start game if needed
   */
  private async checkRoom(room: DbPerpetualRoom): Promise<void> {
    try {
      // Skip if room is paused
      if (room.status === 'paused') {
        return;
      }

      // Check if room should start next game
      if (room.status === 'intermission' && room.next_game_starts_at) {
        const now = new Date();
        const nextGameTime = new Date(room.next_game_starts_at);

        // Time to start the game?
        if (now >= nextGameTime) {
          await this.startGameForRoom(room.id);
        }
      }

      // If room has no current game (shouldn't happen, but handle it)
      if (room.status === 'intermission' && !room.current_game_id) {
        console.warn(`Room ${room.room_code} in intermission but has no next_game_starts_at. Starting immediately.`);
        await this.startGameForRoom(room.id);
      }
    } catch (error) {
      console.error(`Error checking room ${room.room_code}:`, error);
    }
  }

  /**
   * Start a new game for a room
   */
  private async startGameForRoom(roomId: string): Promise<void> {
    try {
      const client = await supabase();

      // Double-check room status (prevent race conditions)
      const { data: room, error: roomError } = await client
        .from('cb_perpetual_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError || !room) {
        console.error('Room not found:', roomId);
        return;
      }

      // Only start if still in intermission
      if (room.status !== 'intermission') {
        console.log(`Room ${room.room_code} already has active game, skipping`);
        return;
      }

      console.log(`🎮 Starting new game for room ${room.room_code}...`);

      // Start new game (creates session, moves spectators to participants, adds AI)
      const sessionId = await perpetualRoomManager.startNewGame(roomId);

      if (!sessionId) {
        console.error(`Failed to create session for room ${roomId}`);
        return;
      }

      console.log(`✅ Game session created: ${sessionId}`);

      // Start the game loop
      await gameOrchestrator.startGameLoop(sessionId);

      console.log(`🎉 Game started for room ${room.room_code}!`);
    } catch (error) {
      console.error(`Error starting game for room ${roomId}:`, error);
    }
  }

  // ================================================================
  // MANUAL CONTROLS
  // ================================================================

  /**
   * Manually start a game for a specific room
   * (Useful for testing or admin controls)
   */
  async manualStartGame(roomId: string): Promise<string | null> {
    await this.startGameForRoom(roomId);

    // Get the session ID
    const client = await supabase();
    const { data: room } = await client
      .from('cb_perpetual_rooms')
      .select('current_game_id')
      .eq('id', roomId)
      .single();

    return room?.current_game_id || null;
  }

  /**
   * Force stop all games in a room
   * (Useful for emergency stops or maintenance)
   */
  async forceStopRoomGames(roomId: string): Promise<void> {
    const client = await supabase();

    // Get current game session
    const { data: room } = await client
      .from('cb_perpetual_rooms')
      .select('current_game_id')
      .eq('id', roomId)
      .single();

    if (room?.current_game_id) {
      // Stop the game loop
      gameOrchestrator.stopGameLoop(room.current_game_id);

      // Mark session as abandoned
      await client
        .from('cb_game_sessions')
        .update({ status: 'abandoned' })
        .eq('id', room.current_game_id);

      // Update room to intermission
      await client
        .from('cb_perpetual_rooms')
        .update({
          status: 'intermission',
          current_game_id: null,
          next_game_starts_at: new Date(Date.now() + 10000).toISOString(), // 10 seconds
        })
        .eq('id', roomId);

      console.log(`⚠️ Forcefully stopped game for room ${roomId}`);
    }
  }

  /**
   * Pause a room (stops automatic game starts)
   */
  async pauseRoom(roomId: string): Promise<void> {
    const client = await supabase();

    await client
      .from('cb_perpetual_rooms')
      .update({ status: 'paused' })
      .eq('id', roomId);

    console.log(`⏸️ Paused room ${roomId}`);
  }

  /**
   * Resume a paused room
   */
  async resumeRoom(roomId: string): Promise<void> {
    const client = await supabase();

    // Set to intermission and schedule immediate game start
    await client
      .from('cb_perpetual_rooms')
      .update({
        status: 'intermission',
        next_game_starts_at: new Date(Date.now() + 5000).toISOString(), // 5 seconds
      })
      .eq('id', roomId);

    console.log(`▶️ Resumed room ${roomId}`);
  }

  // ================================================================
  // MONITORING
  // ================================================================

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    checkIntervalMs: number;
    uptime: string;
  } {
    return {
      isRunning: this.isRunning,
      checkIntervalMs: this.checkIntervalMs,
      uptime: this.isRunning ? 'Active' : 'Stopped',
    };
  }

  /**
   * Get statistics for all rooms
   */
  async getRoomStatistics(): Promise<any[]> {
    const client = await supabase();

    const { data: rooms, error } = await client
      .from('cb_perpetual_rooms')
      .select(`
        *,
        cb_game_sessions!cb_game_sessions_perpetual_room_id_fkey(
          id,
          status,
          started_at,
          completed_at
        )
      `)
      .eq('is_active', true)
      .order('room_code');

    if (error) {
      console.error('Error fetching room statistics:', error);
      return [];
    }

    return rooms || [];
  }

  /**
   * Health check - verify scheduler is working correctly
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    message: string;
    details: any;
  }> {
    try {
      const client = await supabase();

      // Check if scheduler is running
      if (!this.isRunning) {
        return {
          status: 'unhealthy',
          message: 'Scheduler is not running',
          details: { isRunning: false },
        };
      }

      // Check if rooms are accessible
      const { data: rooms, error } = await client
        .from('cb_perpetual_rooms')
        .select('id, room_code, status')
        .eq('is_active', true)
        .limit(1);

      if (error) {
        return {
          status: 'unhealthy',
          message: 'Cannot access database',
          details: { error: error.message },
        };
      }

      // Check for stuck rooms (in intermission for > 5 minutes)
      const { data: stuckRooms } = await client
        .from('cb_perpetual_rooms')
        .select('id, room_code, next_game_starts_at')
        .eq('status', 'intermission')
        .lt('next_game_starts_at', new Date(Date.now() - 300000).toISOString());

      if (stuckRooms && stuckRooms.length > 0) {
        return {
          status: 'degraded',
          message: 'Some rooms are stuck in intermission',
          details: {
            stuckRoomCount: stuckRooms.length,
            stuckRooms: stuckRooms.map(r => r.room_code),
          },
        };
      }

      return {
        status: 'healthy',
        message: 'Scheduler is running normally',
        details: {
          isRunning: true,
          activeRoomCount: rooms?.length || 0,
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Health check failed',
        details: { error: String(error) },
      };
    }
  }
}

export const perpetualRoomScheduler = PerpetualRoomScheduler.getInstance();
