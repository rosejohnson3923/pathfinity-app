/**
 * Game Leaderboard Service
 * Provides in-game leaderboard rankings for Discovered Live! multiplayer games
 * Each game displays its own leaderboard in a sidebar
 */

import { supabase } from '../lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

// ================================================================
// TYPE DEFINITIONS
// ================================================================

export type GameType = 'career_bingo' | 'decision_desk' | 'ceo_takeover';

export interface BaseLeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  isCurrentPlayer: boolean;
  lastPlayedAt: string;
}

export interface CareerBingoLeaderboardEntry extends BaseLeaderboardEntry {
  totalXP: number;
  gamesPlayed: number;
  totalBingos: number;
  accuracy: number;
  bestGameXP: number;
}

export interface DecisionDeskLeaderboardEntry extends BaseLeaderboardEntry {
  totalScore: number;
  sessionsPlayed: number;
  avgSixCs: number;
  perfectDecisions: number;
  bestSessionScore: number;
}

export interface CEOTakeoverLeaderboardEntry extends BaseLeaderboardEntry {
  totalScore: number;
  bingosAchieved: number;
  cSuiteChoice: string;
  roundScores: number[];
  participantType: 'human' | 'ai';
  isActive: boolean;
}

// ================================================================
// GAME LEADERBOARD SERVICE
// ================================================================

class GameLeaderboardService {
  private client: SupabaseClient | null = null;

  /**
   * Initialize Supabase client
   */
  private async initialize() {
    if (!this.client) {
      this.client = await supabase();
    }
  }

  /**
   * Get Career Bingo Leaderboard
   * Ranks players by total XP across all completed games
   */
  async getCareerBingoLeaderboard(filters?: {
    roomId?: string;
    gradeCategory?: 'elementary' | 'middle' | 'high';
    limit?: number;
  }): Promise<CareerBingoLeaderboardEntry[]> {
    await this.initialize();
    if (!this.client) return [];

    const limit = filters?.limit || 100;

    try {
      // Query cb_game_sessions to get all completed games with participants
      let query = this.client
        .from('cb_game_sessions')
        .select(`
          id,
          perpetual_room_id,
          started_at,
          cb_session_participants!inner (
            user_id,
            display_name,
            total_xp,
            bingos_won,
            correct_answers,
            incorrect_answers,
            is_active
          )
        `)
        .eq('status', 'completed')
        .eq('cb_session_participants.is_active', true);

      // Filter by room if specified
      if (filters?.roomId) {
        query = query.eq('perpetual_room_id', filters.roomId);
      }

      const { data: sessions, error } = await query;

      if (error) {
        console.error('Error fetching Career Bingo leaderboard:', error);
        return [];
      }

      if (!sessions || sessions.length === 0) {
        return [];
      }

      // Aggregate stats by player
      const playerStats = new Map<string, {
        playerId: string;
        displayName: string;
        totalXP: number;
        gamesPlayed: number;
        totalBingos: number;
        totalCorrect: number;
        totalAnswers: number;
        bestGameXP: number;
        lastPlayedAt: string;
      }>();

      for (const session of sessions) {
        const participants = Array.isArray(session.cb_session_participants)
          ? session.cb_session_participants
          : [session.cb_session_participants];

        for (const participant of participants) {
          const existing = playerStats.get(participant.user_id);
          const totalAnswers = (participant.correct_answers || 0) + (participant.incorrect_answers || 0);

          if (existing) {
            existing.totalXP += participant.total_xp || 0;
            existing.gamesPlayed += 1;
            existing.totalBingos += participant.bingos_won || 0;
            existing.totalCorrect += participant.correct_answers || 0;
            existing.totalAnswers += totalAnswers;
            existing.bestGameXP = Math.max(existing.bestGameXP, participant.total_xp || 0);
            if (session.started_at > existing.lastPlayedAt) {
              existing.lastPlayedAt = session.started_at;
            }
          } else {
            playerStats.set(participant.user_id, {
              playerId: participant.user_id,
              displayName: participant.display_name,
              totalXP: participant.total_xp || 0,
              gamesPlayed: 1,
              totalBingos: participant.bingos_won || 0,
              totalCorrect: participant.correct_answers || 0,
              totalAnswers: totalAnswers,
              bestGameXP: participant.total_xp || 0,
              lastPlayedAt: session.started_at
            });
          }
        }
      }

      // Convert to array and sort by total XP
      const rankings = Array.from(playerStats.values())
        .map(stats => ({
          playerId: stats.playerId,
          displayName: stats.displayName,
          totalXP: stats.totalXP,
          gamesPlayed: stats.gamesPlayed,
          totalBingos: stats.totalBingos,
          accuracy: stats.totalAnswers > 0
            ? Math.round((stats.totalCorrect / stats.totalAnswers) * 100)
            : 0,
          bestGameXP: stats.bestGameXP,
          lastPlayedAt: stats.lastPlayedAt
        }))
        .sort((a, b) => {
          // Primary: Total XP (descending)
          if (b.totalXP !== a.totalXP) return b.totalXP - a.totalXP;
          // Secondary: Accuracy (descending)
          if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
          // Tertiary: Total bingos (descending)
          return b.totalBingos - a.totalBingos;
        })
        .slice(0, limit);

      // Add ranks
      return rankings.map((entry, index) => ({
        rank: index + 1,
        ...entry,
        isCurrentPlayer: false // Will be set by UI component
      }));

    } catch (error) {
      console.error('Error in getCareerBingoLeaderboard:', error);
      return [];
    }
  }

  /**
   * Get Decision Desk Leaderboard (Current Session Only)
   * Shows rankings for players in the current multiplayer session
   */
  async getDecisionDeskLeaderboard(filters?: {
    sessionId?: string;
    roomId?: string;
    gradeCategory?: 'elementary' | 'middle' | 'high';
    limit?: number;
  }): Promise<DecisionDeskLeaderboardEntry[]> {
    await this.initialize();
    if (!this.client) return [];

    const limit = filters?.limit || 100;

    try {
      // Query dd_game_session_players to get CURRENT session participants
      let query = this.client
        .from('dd_game_session_players')
        .select('*')
        .eq('is_active', true)
        .order('current_score', { ascending: false });

      // Filter by session ID (preferred for current session)
      if (filters?.sessionId) {
        query = query.eq('session_id', filters.sessionId);
      } else if (filters?.roomId) {
        // Fallback to room_id if session not provided
        query = query.eq('room_id', filters.roomId);
      }

      const { data: players, error } = await query;

      if (error) {
        console.error('Error fetching Decision Desk leaderboard:', error);
        return [];
      }

      if (!players || players.length === 0) {
        return [];
      }

      console.log('🎯 GameLeaderboardService - Raw player data:', players);

      // Get player stats for additional metrics
      const playerIds = players.map(p => p.player_id);
      const { data: stats } = await this.client
        .from('dd_executive_stats')
        .select('*')
        .in('player_id', playerIds);

      const statsMap = new Map(stats?.map((s: any) => [s.player_id, s]) || []);

      // Build leaderboard entries
      const rankings = players
        .map((player: any, index: number) => {
          const playerStats = statsMap.get(player.player_id);

          console.log('🎯 Player:', player.display_name, 'current_score:', player.current_score, 'stats:', playerStats);

          // Calculate average Six Cs from stats
          const sixCsScores = playerStats ? [
            playerStats.avg_character_score,
            playerStats.avg_competence_score,
            playerStats.avg_communication_score,
            playerStats.avg_compassion_score,
            playerStats.avg_commitment_score,
            playerStats.avg_confidence_score
          ].filter(s => s != null) : [];

          const avgSixCs = sixCsScores.length > 0
            ? sixCsScores.reduce((sum, val) => sum + val, 0) / sixCsScores.length
            : 0;

          return {
            rank: index + 1,
            playerId: player.player_id,
            displayName: player.display_name || player.player_id,
            totalScore: player.current_score || 0,
            sessionsPlayed: playerStats?.total_sessions_played || 0,
            avgSixCs: Math.round(avgSixCs * 10) / 10,
            perfectDecisions: 0, // Not tracked in session players
            bestSessionScore: playerStats?.highest_score || 0,
            lastPlayedAt: player.last_active_at || player.joined_at,
            isCurrentPlayer: false // Will be set by UI component
          };
        })
        .slice(0, limit);

      return rankings;

    } catch (error) {
      console.error('Error in getDecisionDeskLeaderboard:', error);
      return [];
    }
  }

  /**
   * Get CEO Takeover Leaderboard (Session-Specific)
   * Shows rankings for current multiplayer session
   */
  async getCEOTakeoverLeaderboard(sessionId: string): Promise<CEOTakeoverLeaderboardEntry[]> {
    await this.initialize();
    if (!this.client) return [];

    try {
      const { data: participants, error } = await this.client
        .from('ccm_session_participants')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .order('total_score', { ascending: false });

      if (error) {
        console.error('Error fetching CEO Takeover leaderboard:', error);
        return [];
      }

      if (!participants || participants.length === 0) {
        return [];
      }

      // Add ranks (handle ties)
      const rankings: CEOTakeoverLeaderboardEntry[] = [];
      let currentRank = 1;
      let previousScore = -1;

      participants.forEach((participant, index) => {
        if (participant.total_score !== previousScore) {
          currentRank = index + 1;
        }

        rankings.push({
          rank: currentRank,
          playerId: participant.player_id,
          displayName: participant.display_name,
          totalScore: participant.total_score || 0,
          bingosAchieved: participant.bingos_achieved || 0,
          cSuiteChoice: participant.c_suite_choice || 'None',
          roundScores: participant.round_scores || [],
          participantType: participant.participant_type || 'human',
          isActive: participant.is_active,
          isCurrentPlayer: false, // Will be set by UI component
          lastPlayedAt: participant.updated_at
        });

        previousScore = participant.total_score || 0;
      });

      return rankings;

    } catch (error) {
      console.error('Error in getCEOTakeoverLeaderboard:', error);
      return [];
    }
  }

  /**
   * Get player's rank in a specific game
   */
  async getPlayerRank(
    gameType: GameType,
    playerId: string,
    filters?: any
  ): Promise<number> {
    let leaderboard: BaseLeaderboardEntry[] = [];

    switch (gameType) {
      case 'career_bingo':
        leaderboard = await this.getCareerBingoLeaderboard(filters);
        break;
      case 'decision_desk':
        leaderboard = await this.getDecisionDeskLeaderboard(filters);
        break;
      case 'ceo_takeover':
        if (filters?.sessionId) {
          leaderboard = await this.getCEOTakeoverLeaderboard(filters.sessionId);
        }
        break;
    }

    const entry = leaderboard.find(e => e.playerId === playerId);
    return entry?.rank || 0;
  }
}

// Export singleton instance
export const gameLeaderboardService = new GameLeaderboardService();
export default gameLeaderboardService;
