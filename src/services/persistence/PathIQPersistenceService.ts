/**
 * PathIQ Persistence Service
 *
 * Handles database persistence for PathIQ gamification system.
 * Integrates with pathiq_profiles and xp_transactions tables.
 *
 * Key Features:
 * - Profile creation and updates (XP, levels, achievements)
 * - XP transaction logging (immutable audit trail)
 * - Leaderboard queries
 * - Streak tracking
 * - Achievement management
 *
 * Integration Flow:
 * PathIQ (client) → PathIQPersistenceService → Supabase → Leaderboard
 */

import { supabase, getCurrentUserId, getCurrentTenantId } from '../../lib/supabase';
import { getDemoUserType } from '../../utils/demoUserDetection';

// ================================================================
// TYPE DEFINITIONS
// ================================================================

export interface PathIQProfile {
  id?: string;
  userId: string;
  tenantId: string;

  // XP & Leveling
  xp: number;
  level: number;
  nextLevelXp: number;
  lifetimeXp: number;

  // Daily Progress
  dailyXpEarned: number;
  lastXpDate: string;

  // Streak Tracking
  streakDays: number;
  bestStreak: number;
  lastActiveDate: string;

  // Achievements
  achievements: Achievement[];

  // Hint System
  hintsUsedToday: number;
  freeHintsRemaining: number;
  hintsUsedLifetime: number;

  // PathIQ Ranking
  pathiqRank?: number;
  pathiqTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'PathIQ Master';

  // Context
  gradeLevel?: string;
  career?: string;
  companion?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface Achievement {
  id: string;
  unlockedAt: string;
  xpAwarded: number;
}

export interface XPTransaction {
  id?: string;
  userId: string;
  tenantId: string;

  // Transaction details
  amount: number;
  type: 'earned' | 'spent';
  reason: string;
  category: 'learning' | 'hint' | 'achievement' | 'streak' | 'bonus';

  // Context
  balanceAfter: number;
  sessionId?: string;
  container?: string;
  subject?: string;
  skillId?: string;

  // PathIQ validation
  pathiqVerified: boolean;
  multiplier: number;

  // Timestamp
  timestamp?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  xp: number;
  level: number;
  streakDays: number;
  career?: string;
  companion?: string;
}

export interface AwardXPResult {
  success: boolean;
  transactionId?: string;
  amountAwarded?: number;
  newXp?: number;
  newLevel?: number;
  levelUps?: number;
  error?: string;
}

export interface SpendXPResult {
  success: boolean;
  transactionId?: string;
  amountSpent?: number;
  remainingXp?: number;
  error?: string;
}

// ================================================================
// SERVICE CLASS
// ================================================================

class PathIQPersistenceService {
  private static instance: PathIQPersistenceService;

  // Cache for loaded profiles
  private profileCache: Map<string, PathIQProfile> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): PathIQPersistenceService {
    if (!PathIQPersistenceService.instance) {
      PathIQPersistenceService.instance = new PathIQPersistenceService();
    }
    return PathIQPersistenceService.instance;
  }

  // ================================================================
  // PROFILE MANAGEMENT
  // ================================================================

  /**
   * Get or create PathIQ profile
   */
  async getProfile(
    userId?: string,
    tenantId?: string
  ): Promise<{ profile: PathIQProfile | null; error?: string }> {
    try {
      const uid = userId || await getCurrentUserId();
      const tid = tenantId || await getCurrentTenantId();

      // Check cache first
      const cached = this.getCachedProfile(uid);
      if (cached) {
        console.log('📦 PathIQ profile loaded from cache');
        return { profile: cached };
      }

      const client = await supabase();

      const { data, error } = await client
        .from('pathiq_profiles')
        .select('*')
        .eq('user_id', uid)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows (not an error)
        console.error('Error loading PathIQ profile:', error);
        return { profile: null, error: error.message };
      }

      if (data) {
        // Convert database format to application format
        const profile = this.fromDatabaseProfile(data);
        this.cacheProfile(uid, profile);
        console.log('✅ PathIQ profile loaded from database');
        return { profile };
      }

      // Profile doesn't exist - create one
      console.log('🆕 Creating new PathIQ profile');
      return await this.createProfile(uid, tid);

    } catch (error) {
      console.error('Error getting PathIQ profile:', error);
      return {
        profile: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a new PathIQ profile
   */
  async createProfile(
    userId: string,
    tenantId: string,
    gradeLevel?: string,
    career?: string,
    companion?: string
  ): Promise<{ profile: PathIQProfile | null; error?: string }> {
    try {
      const demoType = getDemoUserType({ id: userId });
      if (demoType === 'demo-viewer') {
        return { profile: null, error: 'Read-only demo mode' };
      }

      const client = await supabase();

      const profileData = {
        user_id: userId,
        tenant_id: tenantId,
        xp: 0,
        level: 1,
        next_level_xp: 100,
        lifetime_xp: 0,
        daily_xp_earned: 0,
        last_xp_date: new Date().toISOString().split('T')[0],
        streak_days: 0,
        best_streak: 0,
        last_active_date: new Date().toISOString().split('T')[0],
        achievements: [],
        hints_used_today: 0,
        free_hints_remaining: 10,
        hints_used_lifetime: 0,
        pathiq_tier: 'Bronze' as const,
        grade_level: gradeLevel,
        career,
        companion
      };

      const { data, error } = await client
        .from('pathiq_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Error creating PathIQ profile:', error);
        return { profile: null, error: error.message };
      }

      const profile = this.fromDatabaseProfile(data);
      this.cacheProfile(userId, profile);
      console.log('✅ PathIQ profile created');

      return { profile };

    } catch (error) {
      console.error('Error creating profile:', error);
      return {
        profile: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update profile context (grade, career, companion)
   */
  async updateProfileContext(
    userId: string,
    context: {
      gradeLevel?: string;
      career?: string;
      companion?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const demoType = getDemoUserType({ id: userId });
      if (demoType === 'demo-viewer') {
        return { success: false, error: 'Read-only demo mode' };
      }

      const client = await supabase();

      const updates: any = {};
      if (context.gradeLevel !== undefined) updates.grade_level = context.gradeLevel;
      if (context.career !== undefined) updates.career = context.career;
      if (context.companion !== undefined) updates.companion = context.companion;

      const { error } = await client
        .from('pathiq_profiles')
        .update(updates)
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating profile context:', error);
        return { success: false, error: error.message };
      }

      // Invalidate cache
      this.invalidateCache(userId);
      console.log('✅ Profile context updated');

      return { success: true };

    } catch (error) {
      console.error('Error updating context:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ================================================================
  // XP TRANSACTIONS
  // ================================================================

  /**
   * Award XP to user (uses database function)
   */
  async awardXP(params: {
    userId?: string;
    tenantId?: string;
    amount: number;
    reason: string;
    category: 'learning' | 'achievement' | 'streak' | 'bonus';
    sessionId?: string;
    container?: string;
    subject?: string;
    skillId?: string;
  }): Promise<AwardXPResult> {
    try {
      const userId = params.userId || await getCurrentUserId();
      const tenantId = params.tenantId || await getCurrentTenantId();

      const demoType = getDemoUserType({ id: userId });
      if (demoType === 'demo-viewer') {
        return {
          success: false,
          error: 'Read-only demo mode'
        };
      }

      const client = await supabase();

      // Call database function
      const { data, error } = await client.rpc('award_xp', {
        p_user_id: userId,
        p_tenant_id: tenantId,
        p_amount: params.amount,
        p_reason: params.reason,
        p_category: params.category,
        p_session_id: params.sessionId || null,
        p_container: params.container || null,
        p_subject: params.subject || null,
        p_skill_id: params.skillId || null
      });

      if (error) {
        console.error('Error awarding XP:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Invalidate cache
      this.invalidateCache(userId);

      console.log(`⭐ XP awarded: +${params.amount} (${params.reason})`);
      if (data.level_ups > 0) {
        console.log(`🎉 Level up! New level: ${data.new_level}`);
      }

      return {
        success: data.success,
        transactionId: data.transaction_id,
        amountAwarded: data.amount_awarded,
        newXp: data.new_xp,
        newLevel: data.new_level,
        levelUps: data.level_ups
      };

    } catch (error) {
      console.error('Error awarding XP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Spend XP for hints (uses database function)
   */
  async spendXP(params: {
    userId?: string;
    tenantId?: string;
    amount: number;
    reason: string;
  }): Promise<SpendXPResult> {
    try {
      const userId = params.userId || await getCurrentUserId();
      const tenantId = params.tenantId || await getCurrentTenantId();

      const demoType = getDemoUserType({ id: userId });
      if (demoType === 'demo-viewer') {
        return {
          success: false,
          error: 'Read-only demo mode'
        };
      }

      const client = await supabase();

      // Call database function (amount should be negative)
      const { data, error } = await client.rpc('spend_xp', {
        p_user_id: userId,
        p_tenant_id: tenantId,
        p_amount: -Math.abs(params.amount),
        p_reason: params.reason
      });

      if (error) {
        console.error('Error spending XP:', error);
        return {
          success: false,
          error: error.message
        };
      }

      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Insufficient XP'
        };
      }

      // Invalidate cache
      this.invalidateCache(userId);

      console.log(`💸 XP spent: -${params.amount} (${params.reason})`);

      return {
        success: true,
        transactionId: data.transaction_id,
        amountSpent: data.amount_spent,
        remainingXp: data.remaining_xp
      };

    } catch (error) {
      console.error('Error spending XP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user's XP transaction history
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50
  ): Promise<{ transactions: XPTransaction[]; error?: string }> {
    try {
      const client = await supabase();

      const { data, error } = await client
        .from('xp_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching transactions:', error);
        return { transactions: [], error: error.message };
      }

      const transactions = (data || []).map(this.fromDatabaseTransaction);

      return { transactions };

    } catch (error) {
      console.error('Error getting transaction history:', error);
      return {
        transactions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ================================================================
  // ACHIEVEMENTS
  // ================================================================

  /**
   * Unlock achievement and award XP
   */
  async unlockAchievement(
    userId: string,
    achievementId: string,
    xpReward: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const demoType = getDemoUserType({ id: userId });
      if (demoType === 'demo-viewer') {
        return { success: false, error: 'Read-only demo mode' };
      }

      // Get current profile
      const { profile } = await this.getProfile(userId);
      if (!profile) {
        return { success: false, error: 'Profile not found' };
      }

      // Check if already unlocked
      if (profile.achievements.some(a => a.id === achievementId)) {
        return { success: false, error: 'Achievement already unlocked' };
      }

      // Add achievement
      const newAchievement: Achievement = {
        id: achievementId,
        unlockedAt: new Date().toISOString(),
        xpAwarded: xpReward
      };

      const client = await supabase();

      const { error } = await client
        .from('pathiq_profiles')
        .update({
          achievements: [...profile.achievements, newAchievement]
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error unlocking achievement:', error);
        return { success: false, error: error.message };
      }

      // Award XP for achievement
      await this.awardXP({
        userId,
        amount: xpReward,
        reason: `Achievement unlocked: ${achievementId}`,
        category: 'achievement'
      });

      // Invalidate cache
      this.invalidateCache(userId);

      console.log(`🏆 Achievement unlocked: ${achievementId} (+${xpReward} XP)`);

      return { success: true };

    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ================================================================
  // LEADERBOARD
  // ================================================================

  /**
   * Get leaderboard rankings (uses database function)
   */
  async getLeaderboard(
    tenantId: string,
    gradeLevel?: string,
    limit: number = 10
  ): Promise<{ leaderboard: LeaderboardEntry[]; error?: string }> {
    try {
      const client = await supabase();

      const { data, error } = await client.rpc('get_leaderboard', {
        p_tenant_id: tenantId,
        p_grade_level: gradeLevel || null,
        p_limit: limit
      });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return { leaderboard: [], error: error.message };
      }

      const leaderboard: LeaderboardEntry[] = (data || []).map((entry: any) => ({
        rank: entry.rank,
        userId: entry.user_id,
        xp: entry.xp,
        level: entry.level,
        streakDays: entry.streak_days,
        career: entry.career,
        companion: entry.companion
      }));

      return { leaderboard };

    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return {
        leaderboard: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user's rank in leaderboard
   */
  async getUserRank(
    userId: string,
    tenantId: string,
    gradeLevel?: string
  ): Promise<{ rank: number | null; error?: string }> {
    try {
      const client = await supabase();

      let query = client
        .from('pathiq_leaderboard_view')
        .select('rank_in_grade, rank_in_tenant')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId);

      if (gradeLevel) {
        query = query.eq('grade_level', gradeLevel);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user rank:', error);
        return { rank: null, error: error.message };
      }

      const rank = gradeLevel ? data?.rank_in_grade : data?.rank_in_tenant;

      return { rank: rank || null };

    } catch (error) {
      console.error('Error getting user rank:', error);
      return {
        rank: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ================================================================
  // CACHE MANAGEMENT
  // ================================================================

  private getCachedProfile(userId: string): PathIQProfile | null {
    const cached = this.profileCache.get(userId);
    const expiry = this.cacheExpiry.get(userId);

    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    // Expired or not found
    this.profileCache.delete(userId);
    this.cacheExpiry.delete(userId);
    return null;
  }

  private cacheProfile(userId: string, profile: PathIQProfile): void {
    this.profileCache.set(userId, profile);
    this.cacheExpiry.set(userId, Date.now() + this.CACHE_TTL_MS);
  }

  private invalidateCache(userId: string): void {
    this.profileCache.delete(userId);
    this.cacheExpiry.delete(userId);
  }

  // ================================================================
  // DATA CONVERSION
  // ================================================================

  private fromDatabaseProfile(data: any): PathIQProfile {
    return {
      id: data.id,
      userId: data.user_id,
      tenantId: data.tenant_id,
      xp: data.xp,
      level: data.level,
      nextLevelXp: data.next_level_xp,
      lifetimeXp: data.lifetime_xp,
      dailyXpEarned: data.daily_xp_earned,
      lastXpDate: data.last_xp_date,
      streakDays: data.streak_days,
      bestStreak: data.best_streak,
      lastActiveDate: data.last_active_date,
      achievements: data.achievements || [],
      hintsUsedToday: data.hints_used_today,
      freeHintsRemaining: data.free_hints_remaining,
      hintsUsedLifetime: data.hints_used_lifetime,
      pathiqRank: data.pathiq_rank,
      pathiqTier: data.pathiq_tier,
      gradeLevel: data.grade_level,
      career: data.career,
      companion: data.companion,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }

  private fromDatabaseTransaction(data: any): XPTransaction {
    return {
      id: data.id,
      userId: data.user_id,
      tenantId: data.tenant_id,
      amount: data.amount,
      type: data.type,
      reason: data.reason,
      category: data.category,
      balanceAfter: data.balance_after,
      sessionId: data.session_id,
      container: data.container,
      subject: data.subject,
      skillId: data.skill_id,
      pathiqVerified: data.pathiq_verified,
      multiplier: data.multiplier,
      timestamp: data.timestamp
    };
  }
}

// Export singleton instance
export const pathiqPersistenceService = PathIQPersistenceService.getInstance();
export type {
  PathIQProfile,
  Achievement,
  XPTransaction,
  LeaderboardEntry,
  AwardXPResult,
  SpendXPResult
};
