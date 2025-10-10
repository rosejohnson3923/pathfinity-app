/**
 * useLeaderboard Hook
 *
 * React hook for fetching and managing real-time leaderboard data.
 *
 * Features:
 * - Real-time leaderboard rankings
 * - Current user position tracking
 * - Automatic refresh
 * - Loading and error states
 * - Grade-level filtering
 */

import { useState, useEffect, useCallback } from 'react';
import {
  realLeaderboardService,
  type LeaderboardData,
  type LeaderboardPlayer,
  type LeaderboardFilters
} from '../services/leaderboard/RealLeaderboardService';
import { getCurrentUserId, getCurrentTenantId } from '../lib/supabase';

// ================================================================
// HOOK RESULT TYPE
// ================================================================

export interface UseLeaderboardResult {
  data: LeaderboardData | null;
  loading: boolean;
  error: string | null;
  currentUserPosition: {
    rank: number | null;
    xp: number;
    level: number;
    percentile: number | null;
  } | null;
  refresh: () => Promise<void>;
}

// ================================================================
// HOOK
// ================================================================

/**
 * Fetch real-time leaderboard data
 */
export function useLeaderboard(
  filters?: LeaderboardFilters
): UseLeaderboardResult {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [currentUserPosition, setCurrentUserPosition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🏆 Fetching leaderboard data...');

      // Get current user ID
      const userId = await getCurrentUserId();
      const tenantId = filters?.tenantId || await getCurrentTenantId();

      // Fetch leaderboard
      const leaderboardData = await realLeaderboardService.getLeaderboard(userId, {
        ...filters,
        tenantId
      });

      if (!leaderboardData) {
        throw new Error('Failed to load leaderboard');
      }

      setData(leaderboardData);

      // Fetch current user position
      const position = await realLeaderboardService.getCurrentUserPosition(
        userId,
        tenantId,
        filters?.gradeLevel
      );

      setCurrentUserPosition(position);

      console.log('✅ Leaderboard loaded successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load leaderboard';
      console.error('❌ Error loading leaderboard:', errorMessage);
      setError(errorMessage);
      setData(null);
      setCurrentUserPosition(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    currentUserPosition,
    refresh: fetchData
  };
}

/**
 * Get leaderboard context (nearby players)
 */
export function useLeaderboardContext(
  gradeLevel?: string,
  range: number = 5
): {
  context: LeaderboardPlayer[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [context, setContext] = useState<LeaderboardPlayer[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContext = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = await getCurrentUserId();
      const tenantId = await getCurrentTenantId();

      const contextData = await realLeaderboardService.getLeaderboardContext(
        userId,
        tenantId,
        gradeLevel,
        range
      );

      setContext(contextData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load context';
      console.error('Error loading leaderboard context:', errorMessage);
      setError(errorMessage);
      setContext(null);
    } finally {
      setLoading(false);
    }
  }, [gradeLevel, range]);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  return {
    context,
    loading,
    error,
    refresh: fetchContext
  };
}

/**
 * Simple hook to just get current user's rank
 */
export function useCurrentUserRank(
  gradeLevel?: string
): {
  rank: number | null;
  xp: number;
  level: number;
  percentile: number | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<any>({
    rank: null,
    xp: 0,
    level: 1,
    percentile: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRank = async () => {
      try {
        setLoading(true);
        const userId = await getCurrentUserId();
        const tenantId = await getCurrentTenantId();

        const position = await realLeaderboardService.getCurrentUserPosition(
          userId,
          tenantId,
          gradeLevel
        );

        if (position) {
          setData(position);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load rank';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRank();
  }, [gradeLevel]);

  return {
    ...data,
    loading,
    error
  };
}
