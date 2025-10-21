/**
 * CCM (Career Challenge Multiplayer) XP Service
 * Converts CCM game scores to XP and awards to student profiles
 *
 * Formula: Total Game Points ÷ 10 = XP Points
 * Max: 650 points = 65 XP
 */

import { supabase } from '../lib/supabase';

export interface CCMXPReward {
  sessionId: string;
  participantId: string;
  studentId: string | null;
  displayName: string;
  totalScore: number;
  xpEarned: number;
  rank: number;
  achievements: string[];
  bonuses: {
    winnerBonus?: number;
    podiumBonus?: number;
    perfectRoundBonus?: number;
    goldenCardBonus?: number;
  };
}

export interface CCMXPSummary {
  baseXP: number;
  bonuses: {
    winner: number;
    podium: number;
    perfectRounds: number;
    goldenCard: number;
  };
  totalXP: number;
  breakdown: string;
}

class CCMXPService {
  private static instance: CCMXPService;
  private client: any;

  // XP configuration for CCM
  private readonly XP_CONFIG = {
    BASE_CONVERSION_RATE: 10, // Divide total score by 10
    MAX_GAME_SCORE: 650, // 5 rounds × 130 max per round
    MAX_XP: 65, // 650 ÷ 10 = 65 XP
    WINNER_BONUS: 10, // Extra 10 XP for 1st place
    PODIUM_BONUS: 5, // Extra 5 XP for 2nd-3rd place
    PERFECT_ROUND_BONUS: 2, // 2 XP per round with 130 points
    GOLDEN_CARD_BONUS: 1, // 1 XP for using Golden Card
  };

  private constructor() {}

  static getInstance(): CCMXPService {
    if (!CCMXPService.instance) {
      CCMXPService.instance = new CCMXPService();
    }
    return CCMXPService.instance;
  }

  async initialize() {
    this.client = await supabase();
  }

  /**
   * Calculate XP for a game session participant
   */
  calculateXP(
    totalScore: number,
    rank: number,
    roundScores: number[],
    usedGoldenCard: boolean
  ): CCMXPSummary {
    // Base XP from score (Total Points ÷ 10)
    const baseXP = Math.floor(totalScore / this.XP_CONFIG.BASE_CONVERSION_RATE);

    // Bonuses
    const bonuses = {
      winner: rank === 1 ? this.XP_CONFIG.WINNER_BONUS : 0,
      podium: (rank === 2 || rank === 3) ? this.XP_CONFIG.PODIUM_BONUS : 0,
      perfectRounds: roundScores.filter(score => score === 130).length * this.XP_CONFIG.PERFECT_ROUND_BONUS,
      goldenCard: usedGoldenCard ? this.XP_CONFIG.GOLDEN_CARD_BONUS : 0,
    };

    const totalXP = baseXP + bonuses.winner + bonuses.podium + bonuses.perfectRounds + bonuses.goldenCard;

    // Create breakdown string
    const breakdownParts = [`Base: ${baseXP} XP (${totalScore} pts ÷ 10)`];
    if (bonuses.winner > 0) breakdownParts.push(`Winner: +${bonuses.winner} XP`);
    if (bonuses.podium > 0) breakdownParts.push(`Podium: +${bonuses.podium} XP`);
    if (bonuses.perfectRounds > 0) breakdownParts.push(`Perfect Rounds: +${bonuses.perfectRounds} XP`);
    if (bonuses.goldenCard > 0) breakdownParts.push(`Golden Card: +${bonuses.goldenCard} XP`);

    return {
      baseXP,
      bonuses,
      totalXP,
      breakdown: breakdownParts.join(' | ')
    };
  }

  /**
   * Award XP to all participants after game completion
   */
  async awardXPToParticipants(sessionId: string): Promise<CCMXPReward[]> {
    if (!this.client) await this.initialize();

    // Get session and participants
    const { data: session, error: sessionError } = await this.client
      .from('ccm_game_sessions')
      .select(`
        *,
        ccm_session_participants (
          id,
          student_id,
          display_name,
          total_score,
          round_scores,
          used_golden_card,
          is_active
        )
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('[CCMXPService] Error fetching session:', sessionError);
      return [];
    }

    // Filter active participants and sort by score for ranking
    const participants = (session.ccm_session_participants || [])
      .filter((p: any) => p.is_active)
      .sort((a: any, b: any) => b.total_score - a.total_score);

    const rewards: CCMXPReward[] = [];

    for (let index = 0; index < participants.length; index++) {
      const participant = participants[index];
      const rank = index + 1;

      // Calculate XP
      const xpSummary = this.calculateXP(
        participant.total_score || 0,
        rank,
        participant.round_scores || [],
        participant.used_golden_card || false
      );

      // Generate achievements
      const achievements = this.generateAchievements(
        rank,
        participant.total_score || 0,
        participant.round_scores || [],
        participant.used_golden_card || false
      );

      const reward: CCMXPReward = {
        sessionId,
        participantId: participant.id,
        studentId: participant.student_id,
        displayName: participant.display_name,
        totalScore: participant.total_score || 0,
        xpEarned: xpSummary.totalXP,
        rank,
        achievements,
        bonuses: {
          winnerBonus: xpSummary.bonuses.winner,
          podiumBonus: xpSummary.bonuses.podium,
          perfectRoundBonus: xpSummary.bonuses.perfectRounds,
          goldenCardBonus: xpSummary.bonuses.goldenCard,
        }
      };

      rewards.push(reward);

      // If participant has a student ID, award XP to their profile
      if (participant.student_id) {
        await this.awardXPToStudent(
          participant.student_id,
          xpSummary.totalXP,
          sessionId,
          rank
        );
      }
    }

    // Update session with XP rewards
    const xpAwarded = Object.fromEntries(
      rewards.map(r => [r.participantId, r.xpEarned])
    );

    await this.client
      .from('ccm_game_sessions')
      .update({ xp_awarded: xpAwarded })
      .eq('id', sessionId);

    return rewards;
  }

  /**
   * Award XP to a student's progress record
   */
  private async awardXPToStudent(
    studentId: string,
    xpEarned: number,
    sessionId: string,
    rank: number
  ): Promise<void> {
    if (!this.client) await this.initialize();

    // Get or create student progress record
    const { data: progress } = await this.client
      .from('ccm_player_progression')
      .select('*')
      .eq('player_id', studentId)
      .single();

    if (progress) {
      // Update existing progress
      const newTotalXP = (progress.total_xp || 0) + xpEarned;
      const newLevel = this.calculateLevel(newTotalXP);

      const updates: any = {
        total_xp: newTotalXP,
        current_level: newLevel,
        xp_to_next_level: this.getXPToNextLevel(newLevel),
        total_challenges_attempted: (progress.total_challenges_attempted || 0) + 1,
        last_played_at: new Date().toISOString()
      };

      // Update win stats
      if (rank === 1) {
        updates.total_challenges_succeeded = (progress.total_challenges_succeeded || 0) + 1;
        updates.current_win_streak = (progress.current_win_streak || 0) + 1;
        updates.best_win_streak = Math.max(
          progress.best_win_streak || 0,
          updates.current_win_streak
        );
      } else {
        updates.current_win_streak = 0;
      }

      // Calculate win rate
      updates.win_rate = ((updates.total_challenges_succeeded / updates.total_challenges_attempted) * 100).toFixed(2);

      await this.client
        .from('ccm_player_progression')
        .update(updates)
        .eq('player_id', studentId);

    } else {
      // Create new progress record
      const level = this.calculateLevel(xpEarned);

      await this.client
        .from('ccm_player_progression')
        .insert({
          player_id: studentId,
          total_xp: xpEarned,
          current_level: level,
          xp_to_next_level: this.getXPToNextLevel(level),
          total_challenges_attempted: 1,
          total_challenges_succeeded: rank === 1 ? 1 : 0,
          current_win_streak: rank === 1 ? 1 : 0,
          best_win_streak: rank === 1 ? 1 : 0,
          win_rate: rank === 1 ? 100 : 0,
          last_played_at: new Date().toISOString()
        });
    }
  }

  /**
   * Calculate level from total XP
   * Every 100 XP = 1 level
   */
  private calculateLevel(totalXP: number): number {
    return Math.floor(totalXP / 100) + 1;
  }

  /**
   * Get XP needed for next level
   */
  private getXPToNextLevel(currentLevel: number): number {
    return currentLevel * 100;
  }

  /**
   * Generate achievements based on performance
   */
  private generateAchievements(
    rank: number,
    totalScore: number,
    roundScores: number[],
    usedGoldenCard: boolean
  ): string[] {
    const achievements: string[] = [];

    // Rank achievements
    if (rank === 1) {
      achievements.push('Champion');
    } else if (rank === 2) {
      achievements.push('Runner-Up');
    } else if (rank === 3) {
      achievements.push('Bronze Medal');
    }

    // Score achievements
    if (totalScore >= 600) {
      achievements.push('High Scorer');
    }
    if (totalScore >= 650) {
      achievements.push('Perfect Game');
    }

    // Round achievements
    const perfectRounds = roundScores.filter(score => score === 130).length;
    if (perfectRounds >= 3) {
      achievements.push('Consistent Performer');
    }
    if (perfectRounds === 5) {
      achievements.push('Perfection Streak');
    }

    // Special card achievements
    if (usedGoldenCard) {
      achievements.push('Golden Strategy');
    }

    // Participation
    achievements.push('Team Player');

    return achievements;
  }

  /**
   * Get XP summary for a specific participant
   */
  async getParticipantXPSummary(
    sessionId: string,
    participantId: string
  ): Promise<CCMXPSummary | null> {
    if (!this.client) await this.initialize();

    const { data: participant } = await this.client
      .from('ccm_session_participants')
      .select('total_score, round_scores, used_golden_card')
      .eq('id', participantId)
      .eq('game_session_id', sessionId)
      .single();

    if (!participant) return null;

    // Get rank by counting participants with higher scores
    const { count } = await this.client
      .from('ccm_session_participants')
      .select('*', { count: 'exact', head: true })
      .eq('game_session_id', sessionId)
      .eq('is_active', true)
      .gt('total_score', participant.total_score);

    const rank = (count || 0) + 1;

    return this.calculateXP(
      participant.total_score || 0,
      rank,
      participant.round_scores || [],
      participant.used_golden_card || false
    );
  }
}

export const ccmXPService = CCMXPService.getInstance();
export type { CCMXPService };
