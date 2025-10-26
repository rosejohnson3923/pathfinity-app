/**
 * Career Match XP Service
 * Calculates and awards XP for Career Match game completion
 *
 * XP Formula:
 * - Base XP: (matches × match_xp) from room config
 * - Streak Bonus: streak_bonus_xp for every 3+ consecutive matches
 * - Rank Bonus: Winner gets +50 XP, 2nd place +30 XP, 3rd place +10 XP
 * - Completion Bonus: +25 XP for finishing the game
 *
 * Total XP is added to arcade_xp (which has 10:1 conversion to PathIQ XP)
 */

import { supabase } from '../lib/supabase';

export interface CMXPReward {
  sessionId: string;
  participantId: string;
  userId: string | null;
  displayName: string;
  pairsMatched: number;
  maxStreak: number;
  xpEarned: number;
  rank: number;
  achievements: string[];
  bonuses: {
    baseXP: number;
    streakBonus: number;
    rankBonus: number;
    completionBonus: number;
  };
}

export interface CMXPSummary {
  baseXP: number;
  streakBonus: number;
  rankBonus: number;
  completionBonus: number;
  totalXP: number;
  breakdown: string;
}

class CareerMatchXPService {
  private static instance: CareerMatchXPService;
  private client: any;

  // XP configuration for Career Match
  private readonly XP_CONFIG = {
    RANK_BONUSES: {
      1: 50,  // Winner
      2: 30,  // 2nd place
      3: 10,  // 3rd place
    },
    COMPLETION_BONUS: 25, // For finishing the game
    STREAK_THRESHOLD: 3,  // Need 3+ consecutive matches for bonus
  };

  private constructor() {}

  static getInstance(): CareerMatchXPService {
    if (!CareerMatchXPService.instance) {
      CareerMatchXPService.instance = new CareerMatchXPService();
    }
    return CareerMatchXPService.instance;
  }

  async initialize() {
    this.client = await supabase();
  }

  /**
   * Calculate XP for a game session participant
   */
  calculateXP(
    pairsMatched: number,
    maxStreak: number,
    rank: number,
    matchXP: number,
    streakBonusXP: number
  ): CMXPSummary {
    // Base XP from matches
    const baseXP = pairsMatched * matchXP;

    // Streak bonus (awarded if max streak >= 3)
    const streakBonus = maxStreak >= this.XP_CONFIG.STREAK_THRESHOLD ? streakBonusXP : 0;

    // Rank bonus
    const rankBonus = this.XP_CONFIG.RANK_BONUSES[rank as keyof typeof this.XP_CONFIG.RANK_BONUSES] || 0;

    // Completion bonus (awarded to all players who finish)
    const completionBonus = this.XP_CONFIG.COMPLETION_BONUS;

    const totalXP = baseXP + streakBonus + rankBonus + completionBonus;

    // Create breakdown string
    const breakdownParts = [`Base: ${baseXP} XP (${pairsMatched} matches × ${matchXP})`];
    if (streakBonus > 0) breakdownParts.push(`Streak: +${streakBonus} XP (${maxStreak} max streak)`);
    if (rankBonus > 0) breakdownParts.push(`Rank #${rank}: +${rankBonus} XP`);
    breakdownParts.push(`Completion: +${completionBonus} XP`);

    return {
      baseXP,
      streakBonus,
      rankBonus,
      completionBonus,
      totalXP,
      breakdown: breakdownParts.join(' | ')
    };
  }

  /**
   * Award XP to all participants after game completion
   */
  async awardXPToParticipants(sessionId: string): Promise<CMXPReward[]> {
    if (!this.client) await this.initialize();

    console.log('[CMXPService] Awarding XP for session:', sessionId);

    // Get session and participants with room config
    const { data: sessionData, error: sessionError } = await this.client
      .from('cm_game_sessions')
      .select(`
        *,
        cm_perpetual_rooms!inner (
          match_xp,
          streak_bonus_xp
        ),
        cm_session_participants!inner (
          id,
          user_id,
          display_name,
          pairs_matched,
          arcade_xp,
          max_streak,
          participant_type
        )
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData) {
      console.error('[CMXPService] Error fetching session:', sessionError);
      return [];
    }

    const room = sessionData.cm_perpetual_rooms;
    const matchXP = room.match_xp || 100;
    const streakBonusXP = room.streak_bonus_xp || 50;

    // Sort participants by pairs matched (descending) for ranking
    const participants = (sessionData.cm_session_participants || [])
      .sort((a: any, b: any) => b.pairs_matched - a.pairs_matched);

    const rewards: CMXPReward[] = [];

    for (let index = 0; index < participants.length; index++) {
      const participant = participants[index];
      const rank = index + 1;

      // Calculate XP
      const xpSummary = this.calculateXP(
        participant.pairs_matched || 0,
        participant.max_streak || 0,
        rank,
        matchXP,
        streakBonusXP
      );

      // Generate achievements
      const achievements = this.generateAchievements(
        rank,
        participant.pairs_matched || 0,
        participant.max_streak || 0
      );

      const reward: CMXPReward = {
        sessionId,
        participantId: participant.id,
        userId: participant.user_id,
        displayName: participant.display_name,
        pairsMatched: participant.pairs_matched || 0,
        maxStreak: participant.max_streak || 0,
        xpEarned: xpSummary.totalXP,
        rank,
        achievements,
        bonuses: {
          baseXP: xpSummary.baseXP,
          streakBonus: xpSummary.streakBonus,
          rankBonus: xpSummary.rankBonus,
          completionBonus: xpSummary.completionBonus,
        }
      };

      rewards.push(reward);

      console.log('[CMXPService] Calculated XP for', participant.display_name, ':', {
        rank,
        totalXP: xpSummary.totalXP,
        breakdown: xpSummary.breakdown
      });

      // Update participant's arcade_xp in database
      // Note: arcade_xp was already incremented during gameplay for each match
      // Here we're adding the additional bonuses (streak, rank, completion)
      const additionalXP = xpSummary.streakBonus + xpSummary.rankBonus + xpSummary.completionBonus;

      await this.client
        .from('cm_session_participants')
        .update({
          arcade_xp: participant.arcade_xp + additionalXP,
          total_xp: Math.floor((participant.arcade_xp + additionalXP) / 10) // 10:1 conversion
        })
        .eq('id', participant.id);

      // If participant is a human player (has user_id), update leaderboard
      if (participant.user_id) {
        await this.updateLeaderboard(
          participant.user_id,
          xpSummary.totalXP,
          rank === 1
        );
      }
    }

    // Update session with completion timestamp and XP summary
    await this.client
      .from('cm_game_sessions')
      .update({
        completed_at: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', sessionId);

    console.log('[CMXPService] XP awarded to', rewards.length, 'participants');

    return rewards;
  }

  /**
   * Update global leaderboard for this player
   */
  private async updateLeaderboard(
    userId: string,
    xpEarned: number,
    isWin: boolean
  ): Promise<void> {
    if (!this.client) await this.initialize();

    const gameCode = 'career_match';
    const now = new Date();

    // Get current period dates
    const periods = [
      {
        type: 'daily' as const,
        start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        end: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      },
      {
        type: 'weekly' as const,
        start: this.getWeekStart(now),
        end: this.getWeekEnd(now)
      },
      {
        type: 'monthly' as const,
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      },
      {
        type: 'all_time' as const,
        start: new Date(2024, 0, 1), // Arbitrary start date
        end: new Date(2100, 0, 1)     // Far future
      }
    ];

    for (const period of periods) {
      // Get or create leaderboard entry
      const { data: existing } = await this.client
        .from('game_leaderboards')
        .select('*')
        .eq('game_code', gameCode)
        .eq('leaderboard_type', period.type)
        .eq('student_id', userId)
        .gte('period_end', now.toISOString())
        .single();

      if (existing) {
        // Update existing entry
        const newGamesCompleted = existing.games_completed + 1;
        const newTotalXP = existing.total_xp + xpEarned;
        const newBestScore = Math.max(existing.best_score || 0, xpEarned);

        await this.client
          .from('game_leaderboards')
          .update({
            total_xp: newTotalXP,
            games_played: existing.games_played + 1,
            games_completed: newGamesCompleted,
            best_score: newBestScore,
            avg_score: newTotalXP / newGamesCompleted,
            updated_at: now.toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Create new entry
        await this.client
          .from('game_leaderboards')
          .insert({
            game_code: gameCode,
            mechanic_code: null, // Career Match doesn't use the mechanic system
            leaderboard_type: period.type,
            student_id: userId,
            total_xp: xpEarned,
            games_played: 1,
            games_completed: 1,
            best_score: xpEarned,
            avg_score: xpEarned,
            period_start: period.start.toISOString(),
            period_end: period.end.toISOString(),
            updated_at: now.toISOString()
          });
      }
    }

    console.log('[CMXPService] Updated leaderboard for user:', userId);
  }

  /**
   * Helper: Get start of week (Sunday)
   */
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }

  /**
   * Helper: Get end of week (Saturday)
   */
  private getWeekEnd(date: Date): Date {
    const start = this.getWeekStart(date);
    return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  /**
   * Generate achievements based on performance
   */
  private generateAchievements(
    rank: number,
    pairsMatched: number,
    maxStreak: number
  ): string[] {
    const achievements: string[] = [];

    // Rank achievements
    if (rank === 1) {
      achievements.push('🏆 Memory Master');
    } else if (rank === 2) {
      achievements.push('🥈 Sharp Mind');
    } else if (rank === 3) {
      achievements.push('🥉 Quick Thinker');
    }

    // Match achievements
    if (pairsMatched >= 10) {
      achievements.push('💯 Perfect Match');
    } else if (pairsMatched >= 5) {
      achievements.push('⭐ Card Collector');
    }

    // Streak achievements
    if (maxStreak >= 5) {
      achievements.push('🔥 Hot Streak');
    } else if (maxStreak >= 3) {
      achievements.push('✨ On a Roll');
    }

    // Participation
    achievements.push('🎮 Career Explorer');

    return achievements;
  }

  /**
   * Get XP summary for a specific participant
   */
  async getParticipantXPSummary(
    sessionId: string,
    participantId: string
  ): Promise<CMXPSummary | null> {
    if (!this.client) await this.initialize();

    const { data: participant } = await this.client
      .from('cm_session_participants')
      .select(`
        pairs_matched,
        max_streak,
        cm_game_sessions!inner (
          id,
          cm_perpetual_rooms!inner (
            match_xp,
            streak_bonus_xp
          )
        )
      `)
      .eq('id', participantId)
      .eq('game_session_id', sessionId)
      .single();

    if (!participant) return null;

    const room = participant.cm_game_sessions.cm_perpetual_rooms;

    // Get rank by counting participants with more pairs matched
    const { count } = await this.client
      .from('cm_session_participants')
      .select('*', { count: 'exact', head: true })
      .eq('game_session_id', sessionId)
      .gt('pairs_matched', participant.pairs_matched);

    const rank = (count || 0) + 1;

    return this.calculateXP(
      participant.pairs_matched || 0,
      participant.max_streak || 0,
      rank,
      room.match_xp || 100,
      room.streak_bonus_xp || 50
    );
  }
}

export const careerMatchXPService = CareerMatchXPService.getInstance();
export type { CareerMatchXPService };
