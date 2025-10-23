/**
 * Leaderboard Panel Component
 *
 * Database-backed leaderboard display for multiplayer games.
 * Queries Supabase for participant stats and rankings.
 *
 * USE THIS WHEN:
 * - Need all-time/historical rankings across multiple completed games
 * - Game doesn't maintain live state in memory
 * - Database is the source of truth for rankings
 * - Auto-refresh is acceptable (not instant WebSocket updates)
 * - Examples: Decision Desk current session, Career Bingo global all-time rankings
 *
 * DO NOT USE WHEN:
 * - Need instant real-time updates during active gameplay with WebSocket
 * - Game maintains local state that updates faster than database
 * - Examples: Career Bingo DURING active gameplay (use PlayerLeaderboardCard instead)
 *
 * Features:
 * - Queries cb_session_participants or other tables
 * - Auto-refresh every 10 seconds (configurable)
 * - Supports filtering by session/room/grade
 * - Game-specific metric displays (Career Bingo, Decision Desk, CEO Takeover)
 * - Designed to fit in w-64 (256px) sidebar with tabbed interface
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Crown, TrendingUp, Target, Zap } from 'lucide-react';
import { gameLeaderboardService, GameType } from '../services/GameLeaderboardService';
import type {
  BaseLeaderboardEntry,
  CareerBingoLeaderboardEntry,
  DecisionDeskLeaderboardEntry,
  CEOTakeoverLeaderboardEntry
} from '../services/GameLeaderboardService';

interface LeaderboardPanelProps {
  gameType: GameType;
  currentPlayerId?: string;
  filters?: {
    roomId?: string;
    sessionId?: string;
    gradeCategory?: 'elementary' | 'middle' | 'high';
    limit?: number;
  };
  title?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({
  gameType,
  currentPlayerId,
  filters,
  title,
  autoRefresh = true,
  refreshInterval = 10000 // 10 seconds
}) => {
  const [leaderboard, setLeaderboard] = useState<BaseLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLeaderboardTitle = () => {
    if (title) return title;

    switch (gameType) {
      case 'career_bingo':
        return 'Career Bingo Leaders';
      case 'decision_desk':
        return 'Room Leaderboard';
      case 'ceo_takeover':
        return 'Session Rankings';
      default:
        return 'Leaderboard';
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: BaseLeaderboardEntry[] = [];

      switch (gameType) {
        case 'career_bingo':
          data = await gameLeaderboardService.getCareerBingoLeaderboard(filters);
          break;
        case 'decision_desk':
          data = await gameLeaderboardService.getDecisionDeskLeaderboard(filters);
          break;
        case 'ceo_takeover':
          if (filters?.sessionId) {
            data = await gameLeaderboardService.getCEOTakeoverLeaderboard(filters.sessionId);
          }
          break;
      }

      // Mark current player
      if (currentPlayerId) {
        data = data.map(entry => ({
          ...entry,
          isCurrentPlayer: entry.playerId === currentPlayerId
        }));
      }

      console.log('🎯 LeaderboardPanel - Fetched data:', data);
      setLeaderboard(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    if (autoRefresh) {
      const interval = setInterval(fetchLeaderboard, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [gameType, currentPlayerId, filters?.roomId, filters?.sessionId, autoRefresh]);

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-orange-400" />;
      default:
        return null;
    }
  };

  const getEntryBorderColor = (rank: number, isCurrentPlayer: boolean) => {
    if (isCurrentPlayer) {
      return 'border-purple-500/50 bg-purple-900/30';
    }

    switch (rank) {
      case 1:
        return 'border-yellow-500/30 bg-yellow-900/20';
      case 2:
        return 'border-gray-500/30 bg-gray-600/20';
      case 3:
        return 'border-orange-500/30 bg-orange-900/20';
      default:
        return 'border-transparent bg-gray-800/50';
    }
  };

  const renderMetric = (entry: BaseLeaderboardEntry) => {
    switch (gameType) {
      case 'career_bingo':
        const cbEntry = entry as CareerBingoLeaderboardEntry;
        return (
          <div className="text-xs text-gray-400 mt-1">
            <div className="flex items-center justify-between">
              <span>{cbEntry.totalXP} XP</span>
              <span>{cbEntry.accuracy}% accuracy</span>
            </div>
            <div className="text-gray-500">
              {cbEntry.totalBingos} bingos " {cbEntry.gamesPlayed} games
            </div>
          </div>
        );

      case 'decision_desk':
        const ddEntry = entry as DecisionDeskLeaderboardEntry;
        console.log('🎯 Rendering Decision Desk entry:', ddEntry.displayName, 'totalScore:', ddEntry.totalScore, 'avgSixCs:', ddEntry.avgSixCs, 'sessionsPlayed:', ddEntry.sessionsPlayed);
        return (
          <div className="text-xs text-gray-400 mt-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{ddEntry.totalScore.toLocaleString()} pts</span>
              {ddEntry.avgSixCs > 0 && (
                <span className="flex items-center text-green-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {ddEntry.avgSixCs.toFixed(1)}
                </span>
              )}
            </div>
            {ddEntry.sessionsPlayed > 0 && (
              <div className="text-gray-500">
                {ddEntry.perfectDecisions > 0 && `${ddEntry.perfectDecisions} perfect • `}
                {ddEntry.sessionsPlayed} {ddEntry.sessionsPlayed === 1 ? 'session' : 'sessions'}
              </div>
            )}
          </div>
        );

      case 'ceo_takeover':
        const ctoEntry = entry as CEOTakeoverLeaderboardEntry;
        return (
          <div className="text-xs text-gray-400 mt-1">
            <div className="flex items-center justify-between">
              <span>{ctoEntry.totalScore} pts</span>
              <span className="text-purple-400">{ctoEntry.cSuiteChoice}</span>
            </div>
            <div className="text-gray-500">
              {ctoEntry.bingosAchieved} bingos
              {ctoEntry.participantType === 'ai' && ' " AI'}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <div className="text-gray-400 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-400">
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchLeaderboard}
          className="mt-2 text-xs text-purple-400 hover:text-purple-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400 py-8">
        <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No players yet</p>
        <p className="text-xs text-gray-500 mt-1">Be the first to play!</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 h-full overflow-y-auto">
      {/* Header */}
      <h3 className="font-semibold text-lg mb-3 flex items-center sticky top-0 bg-gray-900/50 backdrop-blur-sm pb-2 whitespace-nowrap">
        <Crown className="w-5 h-5 mr-2 text-yellow-400" />
        {getLeaderboardTitle()}
      </h3>

      {/* Leaderboard Entries */}
      <div className="space-y-2">
        {leaderboard.map((entry, index) => {
          const isTopThree = entry.rank <= 3;

          return (
            <div
              key={`leaderboard-${entry.playerId}-${entry.rank || index}`}
              className={`
                flex items-start p-3 rounded-lg border transition-all
                ${getEntryBorderColor(entry.rank, entry.isCurrentPlayer)}
                ${entry.isCurrentPlayer ? 'ring-2 ring-purple-500/30' : ''}
              `}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <span className={`
                      font-bold mr-2 flex-shrink-0
                      ${isTopThree ? 'text-xl' : 'text-lg'}
                      ${entry.isCurrentPlayer ? 'text-purple-400' : ''}
                    `}>
                      #{entry.rank}
                    </span>
                    <div className="min-w-0">
                      <p className={`
                        font-semibold truncate
                        ${entry.isCurrentPlayer ? 'text-purple-300' : 'text-white'}
                      `}>
                        {entry.displayName}
                        {entry.isCurrentPlayer && (
                          <span className="text-xs text-purple-400 ml-1">(You)</span>
                        )}
                      </p>
                      {renderMetric(entry)}
                    </div>
                  </div>

                  {/* Medal for top 3 */}
                  {isTopThree && (
                    <div className="ml-2 flex-shrink-0">
                      {getMedalIcon(entry.rank)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer - Total Players */}
      {leaderboard.length > 0 && (
        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-700 mt-4">
          {leaderboard.length} {leaderboard.length === 1 ? 'player' : 'players'} ranked
        </div>
      )}
    </div>
  );
};

export default LeaderboardPanel;
