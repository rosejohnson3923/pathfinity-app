/**
 * Real Leaderboard Service
 *
 * Production-ready leaderboard service that uses real data from Supabase.
 * Replaces mock data with actual PathIQ profile data and XP transactions.
 *
 * Features:
 * - Real-time leaderboard rankings
 * - Grade-level filtering
 * - Tenant isolation
 * - Student profiles with XP, levels, streaks
 * - Career-based rankings
 */

import {
  pathiqPersistenceService,
  type LeaderboardEntry as DBLeaderboardEntry
} from '../persistence/PathIQPersistenceService';
import { getCurrentTenantId } from '../../lib/supabase';

// ================================================================
// TYPE DEFINITIONS
// ================================================================

export interface LeaderboardPlayer {
  userId: string;
  rank: number;
  name?: string; // Anonymous by default for privacy
  displayName: string; // "Player 1", "Player 2", etc. or actual name if opt-in
  xp: number;
  level: number;
  streakDays: number;
  career?: string;
  careerIcon?: string;
  companion?: string;
  isCurrentUser?: boolean;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

export interface LeaderboardData {
  players: LeaderboardPlayer[];
  totalPlayers: number;
  currentUserRank: number | null;
  currentUserXP: number | null;
  lastUpdated: string;
  gradeLevel?: string;
  tenantId: string;
}

export interface LeaderboardFilters {
  gradeLevel?: string;
  tenantId?: string;
  limit?: number;
  includeCurrentUser?: boolean;
}

// ================================================================
// SERVICE CLASS
// ================================================================

class RealLeaderboardService {
  private static instance: RealLeaderboardService;

  // Cache for leaderboard data
  private cache: Map<string, { data: LeaderboardData; expiry: number }> = new Map();
  private readonly CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

  private constructor() {}

  static getInstance(): RealLeaderboardService {
    if (!RealLeaderboardService.instance) {
      RealLeaderboardService.instance = new RealLeaderboardService();
    }
    return RealLeaderboardService.instance;
  }

  // ================================================================
  // PUBLIC API
  // ================================================================

  /**
   * Get real-time leaderboard data
   */
  async getLeaderboard(
    userId: string,
    filters?: LeaderboardFilters
  ): Promise<LeaderboardData | null> {
    try {
      const tenantId = filters?.tenantId || await getCurrentTenantId();
      const gradeLevel = filters?.gradeLevel;
      const limit = filters?.limit || 10;

      // Check cache
      const cacheKey = `${tenantId}_${gradeLevel || 'all'}_${limit}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) {
        console.log('📦 Leaderboard loaded from cache');
        // Update current user flag
        cached.players.forEach(p => {
          p.isCurrentUser = p.userId === userId;
        });
        return cached;
      }

      console.log('🏆 Fetching real leaderboard data...');

      // Fetch from database
      const { leaderboard, error } = await pathiqPersistenceService.getLeaderboard(
        tenantId,
        gradeLevel,
        limit
      );

      if (error || !leaderboard) {
        console.error('Error fetching leaderboard:', error);
        return null;
      }

      // Get current user's rank
      const { rank: userRank } = await pathiqPersistenceService.getUserRank(
        userId,
        tenantId,
        gradeLevel
      );

      // Get current user's profile for XP
      const { profile } = await pathiqPersistenceService.getProfile(userId);

      // Transform to UI format
      const players: LeaderboardPlayer[] = leaderboard.map((entry, index) => ({
        userId: entry.userId,
        rank: entry.rank,
        displayName: this.generateDisplayName(entry.rank), // Anonymous display
        xp: entry.xp,
        level: entry.level,
        streakDays: entry.streakDays,
        career: entry.career,
        careerIcon: this.getCareerIcon(entry.career),
        companion: entry.companion,
        isCurrentUser: entry.userId === userId,
        trend: this.calculateTrend(index), // Calculate from historical data if available
        change: this.calculateChange(index) // Calculate from historical data if available
      }));

      const data: LeaderboardData = {
        players,
        totalPlayers: leaderboard.length,
        currentUserRank: userRank,
        currentUserXP: profile?.xp || 0,
        lastUpdated: new Date().toISOString(),
        gradeLevel,
        tenantId
      };

      // Cache result
      this.cacheData(cacheKey, data);

      console.log(`✅ Leaderboard loaded: ${players.length} players`);

      return data;

    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return null;
    }
  }

  /**
   * Get current user's leaderboard position
   */
  async getCurrentUserPosition(
    userId: string,
    tenantId?: string,
    gradeLevel?: string
  ): Promise<{
    rank: number | null;
    xp: number;
    level: number;
    percentile: number | null;
  } | null> {
    try {
      const tid = tenantId || await getCurrentTenantId();

      const { rank } = await pathiqPersistenceService.getUserRank(
        userId,
        tid,
        gradeLevel
      );

      const { profile } = await pathiqPersistenceService.getProfile(userId);

      if (!profile) {
        return null;
      }

      // TODO: Calculate percentile from total users
      const percentile = rank ? Math.max(0, 100 - (rank * 2)) : null;

      return {
        rank,
        xp: profile.xp,
        level: profile.level,
        percentile
      };

    } catch (error) {
      console.error('Error getting user position:', error);
      return null;
    }
  }

  /**
   * Get leaderboard context (nearby players)
   */
  async getLeaderboardContext(
    userId: string,
    tenantId?: string,
    gradeLevel?: string,
    range: number = 5
  ): Promise<LeaderboardPlayer[] | null> {
    try {
      // Get full leaderboard
      const leaderboard = await this.getLeaderboard(userId, {
        tenantId,
        gradeLevel,
        limit: 100 // Fetch more to find context
      });

      if (!leaderboard || !leaderboard.currentUserRank) {
        return null;
      }

      const userRank = leaderboard.currentUserRank;

      // Get players within range
      const startRank = Math.max(1, userRank - range);
      const endRank = userRank + range;

      const context = leaderboard.players.filter(
        p => p.rank >= startRank && p.rank <= endRank
      );

      return context;

    } catch (error) {
      console.error('Error getting leaderboard context:', error);
      return null;
    }
  }

  /**
   * Refresh leaderboard (clear cache)
   */
  refreshLeaderboard(tenantId?: string, gradeLevel?: string): void {
    if (tenantId && gradeLevel) {
      const cacheKey = `${tenantId}_${gradeLevel}_10`;
      this.cache.delete(cacheKey);
    } else {
      // Clear all cache
      this.cache.clear();
    }
    console.log('🔄 Leaderboard cache cleared');
  }

  // ================================================================
  // HELPER METHODS
  // ================================================================

  /**
   * Generate anonymous display name for privacy
   */
  private generateDisplayName(rank: number): string {
    // Use rank-based names for anonymity
    const adjectives = [
      'Swift', 'Bright', 'Clever', 'Bold', 'Wise',
      'Quick', 'Sharp', 'Smart', 'Keen', 'Skilled',
      'Brilliant', 'Gifted', 'Talented', 'Expert', 'Master'
    ];

    const nouns = [
      'Explorer', 'Scholar', 'Learner', 'Thinker', 'Achiever',
      'Champion', 'Star', 'Genius', 'Hero', 'Leader',
      'Pioneer', 'Innovator', 'Creator', 'Builder', 'Solver'
    ];

    const adjIndex = (rank * 3) % adjectives.length;
    const nounIndex = (rank * 7) % nouns.length;

    return `${adjectives[adjIndex]} ${nouns[nounIndex]} #${rank}`;
  }

  /**
   * Get career icon emoji
   */
  private getCareerIcon(career?: string): string {
    const iconMap: Record<string, string> = {
      'teacher': '👨‍🏫',
      'doctor': '👩‍⚕️',
      'firefighter': '🚒',
      'police-officer': '👮',
      'chef': '👨‍🍳',
      'artist': '🎨',
      'scientist': '🔬',
      'engineer': '⚙️',
      'programmer': '💻',
      'veterinarian': '🐾',
      'musician': '🎵',
      'athlete': '⚽',
      'astronaut': '🚀',
      'pilot': '✈️'
    };

    return career ? iconMap[career] || '👤' : '👤';
  }

  /**
   * Calculate trend from historical data
   * TODO: Implement with historical rank tracking
   */
  private calculateTrend(currentRank: number): 'up' | 'down' | 'stable' {
    // Placeholder - would compare with previous rank
    return 'stable';
  }

  /**
   * Calculate rank change from previous period
   * TODO: Implement with historical rank tracking
   */
  private calculateChange(currentRank: number): number {
    // Placeholder - would return actual change
    return 0;
  }

  // ================================================================
  // CACHE MANAGEMENT
  // ================================================================

  private getCachedData(key: string): LeaderboardData | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private cacheData(key: string, data: LeaderboardData): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.CACHE_TTL_MS
    });
  }
}

// Export singleton instance
export const realLeaderboardService = RealLeaderboardService.getInstance();
export type { LeaderboardPlayer, LeaderboardData, LeaderboardFilters };
