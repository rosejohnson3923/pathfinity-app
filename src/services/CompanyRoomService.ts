/**
 * CompanyRoomService
 *
 * Manages company rooms for the Executive Decision Maker game,
 * including real-time subscriptions, player management, and room state.
 */

import { supabase } from '../lib/supabase';
import {
  CompanyRoom,
  CSuiteRole,
  ExecutiveDecisionSession,
} from '../types/CareerChallengeTypes';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RoomPlayer {
  playerId: string;
  displayName: string;
  avatar?: string;
  isActive: boolean;
  currentScore: number;
  sessionCount: number;
  lastActiveAt: string;
  sixCsAverages?: {
    character: number;
    competence: number;
    communication: number;
    compassion: number;
    commitment: number;
    confidence: number;
  };
}

interface RoomMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  type: 'chat' | 'system' | 'achievement';
  timestamp: string;
}

interface RoomState {
  room: CompanyRoom;
  players: RoomPlayer[];
  messages: RoomMessage[];
  activeSessions: ExecutiveDecisionSession[];
  leaderboard: any[];
}

export class CompanyRoomService {
  private static instance: CompanyRoomService;
  private client: any;
  private channels: Map<string, RealtimeChannel> = new Map();
  private roomStates: Map<string, RoomState> = new Map();
  private messageCallbacks: Map<string, (message: RoomMessage) => void> = new Map();
  private playerCallbacks: Map<string, (players: RoomPlayer[]) => void> = new Map();
  private leaderboardCallbacks: Map<string, (leaderboard: any[]) => void> = new Map();

  private constructor() {}

  static getInstance(): CompanyRoomService {
    if (!CompanyRoomService.instance) {
      CompanyRoomService.instance = new CompanyRoomService();
    }
    return CompanyRoomService.instance;
  }

  async initialize() {
    this.client = await supabase();
    await this.initializeCompanyRooms();
  }

  /**
   * Initialize the 10 default company rooms if they don't exist
   */
  private async initializeCompanyRooms() {
    if (!this.client) await this.initialize();

    const companyRooms = [
      {
        code: 'TECH-TITAN',
        name: 'Tech Titans Inc.',
        description: 'Silicon Valley tech giant facing digital transformation challenges',
        company_size: 'large',
        company_age: 15,
        company_values: ['Innovation', 'Speed', 'User-Centric'],
        industry_code: 'TECH',
        max_players: 50,
        display_order: 1,
      },
      {
        code: 'HEALTH-HERO',
        name: 'HealthCare Heroes',
        description: 'Regional healthcare provider balancing patient care and efficiency',
        company_size: 'medium',
        company_age: 25,
        company_values: ['Patient First', 'Quality', 'Compassion'],
        industry_code: 'HEALTH',
        max_players: 50,
        display_order: 2,
      },
      {
        code: 'RETAIL-KING',
        name: 'Retail Kingdom',
        description: 'National retail chain adapting to e-commerce disruption',
        company_size: 'large',
        company_age: 40,
        company_values: ['Customer Service', 'Value', 'Community'],
        industry_code: 'RETAIL',
        max_players: 50,
        display_order: 3,
      },
      {
        code: 'FIN-FORTRESS',
        name: 'Financial Fortress',
        description: 'Investment firm navigating market volatility and regulations',
        company_size: 'medium',
        company_age: 30,
        company_values: ['Trust', 'Performance', 'Integrity'],
        industry_code: 'FINANCE',
        max_players: 50,
        display_order: 4,
      },
      {
        code: 'MFG-MASTER',
        name: 'Manufacturing Masters',
        description: 'Industrial manufacturer optimizing global supply chains',
        company_size: 'large',
        company_age: 50,
        company_values: ['Quality', 'Efficiency', 'Safety'],
        industry_code: 'MFG',
        max_players: 50,
        display_order: 5,
      },
      {
        code: 'EDU-EXCEL',
        name: 'Education Excellence',
        description: 'Education provider modernizing learning experiences',
        company_size: 'medium',
        company_age: 20,
        company_values: ['Learning', 'Growth', 'Accessibility'],
        industry_code: 'EDU',
        max_players: 50,
        display_order: 6,
      },
      {
        code: 'GREEN-GROW',
        name: 'GreenGrow Ventures',
        description: 'Sustainable startup scaling renewable energy solutions',
        company_size: 'small',
        company_age: 5,
        company_values: ['Sustainability', 'Innovation', 'Impact'],
        industry_code: 'ENERGY',
        max_players: 50,
        display_order: 7,
      },
      {
        code: 'MEDIA-MAGIC',
        name: 'Media Magic Corp',
        description: 'Entertainment company creating next-gen content',
        company_size: 'medium',
        company_age: 18,
        company_values: ['Creativity', 'Storytelling', 'Engagement'],
        industry_code: 'MEDIA',
        max_players: 50,
        display_order: 8,
      },
      {
        code: 'FOOD-FRESH',
        name: 'Fresh Foods Co.',
        description: 'Food service company ensuring quality and sustainability',
        company_size: 'medium',
        company_age: 22,
        company_values: ['Freshness', 'Quality', 'Sustainability'],
        industry_code: 'FOOD',
        max_players: 50,
        display_order: 9,
      },
      {
        code: 'TRANS-TREK',
        name: 'TransTrek Logistics',
        description: 'Logistics company optimizing global transportation networks',
        company_size: 'large',
        company_age: 35,
        company_values: ['Reliability', 'Speed', 'Global Reach'],
        industry_code: 'TRANSPORT',
        max_players: 50,
        display_order: 10,
      },
    ];

    // Check which rooms already exist
    const { data: existingRooms } = await this.client
      .from('dd_company_rooms')
      .select('code');

    const existingCodes = new Set(existingRooms?.map((r: any) => r.code) || []);

    // Get industry IDs
    const { data: industries } = await this.client
      .from('dd_industries')
      .select('id, code');

    const industryMap = new Map(industries?.map((i: any) => [i.code, i.id]) || []);

    // Insert missing rooms
    const roomsToInsert = companyRooms
      .filter(room => !existingCodes.has(room.code))
      .map(room => ({
        ...room,
        industry_id: industryMap.get(room.industry_code),
        current_players: 0,
        is_active: true,
      }))
      .filter(room => room.industry_id); // Only insert if we have a valid industry

    if (roomsToInsert.length > 0) {
      const { error } = await this.client
        .from('dd_company_rooms')
        .insert(roomsToInsert);

      if (error) {
        console.error('Error initializing company rooms:', error);
      } else {
        console.log(`Initialized ${roomsToInsert.length} company rooms`);
      }
    }
  }

  /**
   * Subscribe to a company room for real-time updates
   */
  async subscribeToRoom(
    roomId: string,
    onMessage?: (message: RoomMessage) => void,
    onPlayerUpdate?: (players: RoomPlayer[]) => void,
    onLeaderboardUpdate?: (leaderboard: any[]) => void
  ): Promise<boolean> {
    if (!this.client) await this.initialize();

    // Store callbacks
    if (onMessage) this.messageCallbacks.set(roomId, onMessage);
    if (onPlayerUpdate) this.playerCallbacks.set(roomId, onPlayerUpdate);
    if (onLeaderboardUpdate) this.leaderboardCallbacks.set(roomId, onLeaderboardUpdate);

    // Get initial room state
    await this.loadRoomState(roomId);

    // Create channel if doesn't exist
    if (!this.channels.has(roomId)) {
      const channel = this.client
        .channel(`room:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'dd_game_session_players',
            filter: `room_id=eq.${roomId}`,
          },
          (payload: any) => {
            this.handlePlayerChange(roomId, payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'dd_room_messages',
            filter: `room_id=eq.${roomId}`,
          },
          (payload: any) => {
            this.handleNewMessage(roomId, payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'dd_executive_sessions',
            filter: `room_id=eq.${roomId}`,
          },
          (payload: any) => {
            this.handleSessionChange(roomId, payload);
          }
        )
        .on('presence', { event: 'sync' }, () => {
          this.handlePresenceSync(roomId);
        })
        .subscribe();

      this.channels.set(roomId, channel);
    }

    return true;
  }

  /**
   * Unsubscribe from a room
   */
  async unsubscribeFromRoom(roomId: string): Promise<void> {
    const channel = this.channels.get(roomId);
    if (channel) {
      await this.client.removeChannel(channel);
      this.channels.delete(roomId);
    }

    this.messageCallbacks.delete(roomId);
    this.playerCallbacks.delete(roomId);
    this.leaderboardCallbacks.delete(roomId);
    this.roomStates.delete(roomId);
  }

  /**
   * Send a message to the room
   */
  async sendMessage(
    roomId: string,
    playerId: string,
    playerName: string,
    message: string,
    type: 'chat' | 'system' | 'achievement' = 'chat'
  ): Promise<boolean> {
    if (!this.client) await this.initialize();

    const { error } = await this.client
      .from('dd_room_messages')
      .insert({
        room_id: roomId,
        player_id: playerId,
        player_name: playerName,
        message,
        type,
      });

    return !error;
  }

  /**
   * Get room players
   */
  /**
   * Get players for a specific session (session-scoped)
   */
  async getSessionPlayers(sessionId: string): Promise<RoomPlayer[]> {
    if (!this.client) await this.initialize();

    console.log(`🔍 getSessionPlayers called with sessionId: ${sessionId}`);

    // Get session players
    const { data: players, error } = await this.client
      .from('dd_game_session_players')
      .select('*')
      .eq('session_id', sessionId)
      .eq('is_active', true);

    console.log(`🔍 Query result - players:`, players?.length || 0, error);

    if (error) {
      console.error('Error fetching session players:', error);
      return [];
    }

    if (!players || players.length === 0) {
      console.log(`⚠️ No session players found for session ${sessionId}`);
      return [];
    }

    // Get player stats separately
    const playerIds = players.map((p: any) => p.player_id);
    const { data: stats } = await this.client
      .from('dd_executive_stats')
      .select('*')
      .in('player_id', playerIds);

    // Create a map of player stats
    const statsMap = new Map(stats?.map((s: any) => [s.player_id, s]) || []);

    return players.map((player: any) => {
      const playerStats = statsMap.get(player.player_id);

      return {
        playerId: player.player_id,
        displayName: player.display_name,
        avatar: player.avatar_url,
        isActive: player.is_active,
        currentScore: player.current_score || 0,
        sessionCount: playerStats?.total_sessions_played || 0,
        lastActiveAt: player.last_active_at || player.joined_at,
        sixCsAverages: playerStats ? {
          character: playerStats.avg_character_score,
          competence: playerStats.avg_competence_score,
          communication: playerStats.avg_communication_score,
          compassion: playerStats.avg_compassion_score,
          commitment: playerStats.avg_commitment_score,
          confidence: playerStats.avg_confidence_score,
        } : undefined,
      };
    });
  }

  /**
   * Get players for a room (room-scoped, legacy)
   */
  async getRoomPlayers(roomId: string): Promise<RoomPlayer[]> {
    if (!this.client) await this.initialize();

    // Get room players
    const { data: players, error } = await this.client
      .from('dd_game_session_players')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching room players:', error);
      return [];
    }

    if (!players || players.length === 0) return [];

    // Get player stats separately
    const playerIds = players.map((p: any) => p.player_id);
    const { data: stats } = await this.client
      .from('dd_executive_stats')
      .select('*')
      .in('player_id', playerIds);

    // Create a map of player stats
    const statsMap = new Map(stats?.map((s: any) => [s.player_id, s]) || []);

    return players.map((player: any) => {
      const playerStats = statsMap.get(player.player_id);

      return {
        playerId: player.player_id,
        displayName: player.display_name,
        avatar: player.avatar_url,
        isActive: player.is_active,
        currentScore: player.current_score || 0,
        sessionCount: playerStats?.total_sessions_played || 0,
        lastActiveAt: player.last_active_at || player.joined_at,
        sixCsAverages: playerStats ? {
          character: playerStats.avg_character_score,
          competence: playerStats.avg_competence_score,
          communication: playerStats.avg_communication_score,
          compassion: playerStats.avg_compassion_score,
          commitment: playerStats.avg_commitment_score,
          confidence: playerStats.avg_confidence_score,
        } : undefined,
      };
    });
  }

  /**
   * Get room messages
   */
  async getRoomMessages(
    roomId: string,
    limit: number = 50
  ): Promise<RoomMessage[]> {
    if (!this.client) await this.initialize();

    const { data, error } = await this.client
      .from('dd_room_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data?.reverse().map((msg: any) => ({
      id: msg.id,
      playerId: msg.player_id,
      playerName: msg.player_name,
      message: msg.message,
      type: msg.type,
      timestamp: msg.created_at,
    })) || [];
  }

  /**
   * Update player presence
   */
  async updatePresence(
    roomId: string,
    playerId: string,
    status: 'online' | 'away' | 'busy'
  ): Promise<void> {
    const channel = this.channels.get(roomId);
    if (!channel) return;

    await channel.track({
      user_id: playerId,
      status,
      online_at: new Date().toISOString(),
    });
  }

  /**
   * Get available executives for current room scenarios
   */
  async getAvailableExecutives(roomId: string): Promise<CSuiteRole[]> {
    // All executives are always available
    return ['CMO', 'CFO', 'CHRO', 'COO', 'CTO'];
  }

  /**
   * Broadcast achievement to room
   */
  async broadcastAchievement(
    roomId: string,
    playerId: string,
    playerName: string,
    achievement: string
  ): Promise<void> {
    await this.sendMessage(
      roomId,
      playerId,
      playerName,
      `🏆 ${playerName} earned: ${achievement}!`,
      'achievement'
    );
  }

  /**
   * Get room statistics
   */
  async getRoomStatistics(roomId: string): Promise<{
    totalSessions: number;
    avgScore: number;
    topScore: number;
    mostUsedExecutive: CSuiteRole | null;
    avgSixCs: any;
  }> {
    if (!this.client) await this.initialize();

    const { data: sessions } = await this.client
      .from('dd_executive_sessions')
      .select('total_score, selected_executive, six_cs_scores')
      .eq('room_id', roomId)
      .eq('status', 'completed');

    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        avgScore: 0,
        topScore: 0,
        mostUsedExecutive: null,
        avgSixCs: null,
      };
    }

    // Calculate statistics
    const totalScore = sessions.reduce((sum: number, s: any) => sum + s.total_score, 0);
    const topScore = Math.max(...sessions.map((s: any) => s.total_score));

    // Find most used executive
    const executiveCounts = new Map<CSuiteRole, number>();
    sessions.forEach((s: any) => {
      const count = executiveCounts.get(s.selected_executive) || 0;
      executiveCounts.set(s.selected_executive, count + 1);
    });

    let mostUsedExecutive: CSuiteRole | null = null;
    let maxCount = 0;
    executiveCounts.forEach((count, exec) => {
      if (count > maxCount) {
        maxCount = count;
        mostUsedExecutive = exec;
      }
    });

    // Calculate average 6 C's
    const avgSixCs = {
      character: 0,
      competence: 0,
      communication: 0,
      compassion: 0,
      commitment: 0,
      confidence: 0,
    };

    sessions.forEach((s: any) => {
      if (s.six_cs_scores) {
        avgSixCs.character += s.six_cs_scores.character;
        avgSixCs.competence += s.six_cs_scores.competence;
        avgSixCs.communication += s.six_cs_scores.communication;
        avgSixCs.compassion += s.six_cs_scores.compassion;
        avgSixCs.commitment += s.six_cs_scores.commitment;
        avgSixCs.confidence += s.six_cs_scores.confidence;
      }
    });

    Object.keys(avgSixCs).forEach(key => {
      avgSixCs[key as keyof typeof avgSixCs] =
        avgSixCs[key as keyof typeof avgSixCs] / sessions.length;
    });

    return {
      totalSessions: sessions.length,
      avgScore: totalScore / sessions.length,
      topScore,
      mostUsedExecutive,
      avgSixCs,
    };
  }

  // Private helper methods

  private async loadRoomState(roomId: string): Promise<void> {
    const [room, players, messages, leaderboard] = await Promise.all([
      this.getRoom(roomId),
      this.getRoomPlayers(roomId),
      this.getRoomMessages(roomId),
      this.getRoomLeaderboard(roomId),
    ]);

    if (room) {
      this.roomStates.set(roomId, {
        room,
        players,
        messages,
        activeSessions: [],
        leaderboard,
      });

      // Notify callbacks with initial state
      const playerCallback = this.playerCallbacks.get(roomId);
      if (playerCallback) playerCallback(players);

      const leaderboardCallback = this.leaderboardCallbacks.get(roomId);
      if (leaderboardCallback) leaderboardCallback(leaderboard);
    }
  }

  private async getRoom(roomId: string): Promise<CompanyRoom | null> {
    if (!this.client) await this.initialize();

    const { data, error } = await this.client
      .from('dd_company_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      code: data.code,
      name: data.name,
      industryId: data.industry_id,
      description: data.description,
      companySize: data.company_size,
      companyAge: data.company_age,
      companyValues: data.company_values,
      currentScenarios: data.current_scenarios,
      maxPlayers: data.max_players,
      currentPlayers: data.current_players,
      isActive: data.is_active,
      displayOrder: data.display_order,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  private async getRoomLeaderboard(roomId: string): Promise<any[]> {
    if (!this.client) await this.initialize();

    // Get completed sessions
    const { data: completedSessions } = await this.client
      .from('dd_executive_sessions')
      .select(`
        player_id,
        total_score,
        six_cs_scores,
        completed_at
      `)
      .eq('room_id', roomId)
      .eq('status', 'completed')
      .order('total_score', { ascending: false });

    // Get all active players in the room
    const { data: activePlayers } = await this.client
      .from('dd_game_session_players')
      .select('player_id, display_name')
      .eq('room_id', roomId)
      .eq('is_active', true);

    if (!activePlayers || activePlayers.length === 0) {
      return completedSessions || [];
    }

    // Create a map of best scores per player
    const scoreMap = new Map();
    if (completedSessions) {
      for (const session of completedSessions) {
        const existing = scoreMap.get(session.player_id);
        if (!existing || session.total_score > existing.total_score) {
          scoreMap.set(session.player_id, session);
        }
      }
    }

    // Build leaderboard with all active players
    const leaderboard = activePlayers.map((player: any) => {
      const session = scoreMap.get(player.player_id);
      return {
        playerId: player.player_id,
        displayName: player.display_name,
        score: session?.total_score || 0,
        sixCs: session?.six_cs_scores || null,
        completedAt: session?.completed_at || null,
      };
    });

    // Sort by score descending, then by name
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.displayName.localeCompare(b.displayName);
    });

    // Add rank
    return leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    })).slice(0, 10);
  }

  private handlePlayerChange(roomId: string, payload: any): void {
    const state = this.roomStates.get(roomId);
    if (!state) return;

    // Reload players
    this.getRoomPlayers(roomId).then(players => {
      state.players = players;
      const callback = this.playerCallbacks.get(roomId);
      if (callback) callback(players);
    });
  }

  private handleNewMessage(roomId: string, payload: any): void {
    const state = this.roomStates.get(roomId);
    if (!state) return;

    const message: RoomMessage = {
      id: payload.new.id,
      playerId: payload.new.player_id,
      playerName: payload.new.player_name,
      message: payload.new.message,
      type: payload.new.type,
      timestamp: payload.new.created_at,
    };

    state.messages.push(message);

    // Keep only last 100 messages
    if (state.messages.length > 100) {
      state.messages = state.messages.slice(-100);
    }

    const callback = this.messageCallbacks.get(roomId);
    if (callback) callback(message);
  }

  private handleSessionChange(roomId: string, payload: any): void {
    // Reload leaderboard when a session completes
    if (payload.new?.status === 'completed') {
      this.getRoomLeaderboard(roomId).then(leaderboard => {
        const state = this.roomStates.get(roomId);
        if (state) {
          state.leaderboard = leaderboard;
          const callback = this.leaderboardCallbacks.get(roomId);
          if (callback) callback(leaderboard);
        }
      });
    }
  }

  private handlePresenceSync(roomId: string): void {
    const channel = this.channels.get(roomId);
    if (!channel) return;

    const presence = channel.presenceState();
    console.log(`Room ${roomId} presence:`, presence);

    // Update player online status based on presence
    const state = this.roomStates.get(roomId);
    if (state) {
      const onlinePlayerIds = new Set(
        Object.values(presence)
          .flat()
          .map((p: any) => p.user_id)
      );

      state.players.forEach(player => {
        player.isActive = onlinePlayerIds.has(player.playerId);
      });

      const callback = this.playerCallbacks.get(roomId);
      if (callback) callback(state.players);
    }
  }
}

// Export singleton instance
export const companyRoomService = CompanyRoomService.getInstance();