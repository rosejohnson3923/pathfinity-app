/**
 * Player Leaderboard Card
 *
 * Real-time player rankings with glass cards
 *
 * Features:
 * - Sorted by XP
 * - Current user highlighted
 * - AI player indicators
 * - Trophy medals for top 3
 * - Glass player card styling
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Users } from 'lucide-react';

interface Player {
  name: string;
  xp: number;
  correct: number;
  isAI: boolean;
  isCurrentUser?: boolean;
}

interface PlayerLeaderboardCardProps {
  players: Player[];
}

const medals = ['🥇', '🥈', '🥉'];

export const PlayerLeaderboardCard: React.FC<PlayerLeaderboardCardProps> = ({ players }) => {
  // Sort players by XP (descending)
  const sortedPlayers = [...players].sort((a, b) => b.xp - a.xp);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-white/10">
        <Users className="w-5 h-5 text-purple-300 flex-shrink-0" />
        <h3 className="text-white font-bold">Live Leaderboard</h3>
      </div>

      {/* Players List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sortedPlayers.map((player, index) => (
          <motion.div
            key={player.name}
            className={`
              rounded-lg p-2.5
              ${player.isCurrentUser
                ? 'bg-purple-600/30 border border-purple-400'
                : 'bg-white/5 border border-white/10'
              }
            `}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {/* Rank & Name Row */}
            <div className="flex items-center gap-2 mb-1">
              {/* Rank */}
              <span className="text-base font-bold text-white flex-shrink-0 w-6">
                {index < 3 ? medals[index] : `#${index + 1}`}
              </span>

              {/* Name */}
              <span className={`font-semibold text-sm truncate ${
                player.isCurrentUser ? 'text-white' : 'text-gray-200'
              }`}>
                {player.name}
              </span>

              {/* Badges */}
              {player.isAI && (
                <span className="text-xs flex-shrink-0">🤖</span>
              )}
              {player.isCurrentUser && (
                <span className="text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded flex-shrink-0">
                  YOU
                </span>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between text-xs pl-8">
              <span className="text-white/70">
                {player.correct} correct
              </span>
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                <span className="font-bold text-white">
                  {player.xp} XP
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Current User Position Summary */}
      {sortedPlayers.length > 0 && (
        <motion.div
          className="p-3 border-t border-white/10 bg-purple-900/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">Your Rank:</span>
            <span className="text-white font-bold">
              #{sortedPlayers.findIndex(p => p.isCurrentUser) + 1} of {sortedPlayers.length}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PlayerLeaderboardCard;
