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
    <div className="glass-card">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-6 h-6 text-purple-300" />
        <h3 className="text-white font-bold text-lg">Live Leaderboard</h3>
      </div>

      {/* Players List */}
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <motion.div
            key={player.name}
            className={`
              glass-player-card
              ${player.isCurrentUser ? 'glass-player-card-active ring-2 ring-purple-400' : ''}
            `}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between">
              {/* Rank & Name */}
              <div className="flex items-center gap-3">
                {/* Medal or Rank */}
                <div className="w-8 text-center text-xl font-bold">
                  {index < 3 ? medals[index] : `#${index + 1}`}
                </div>

                {/* Player Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${
                      player.isCurrentUser
                        ? 'text-white'
                        : 'text-gray-200 dark:text-gray-300'
                    }`}>
                      {player.name}
                    </span>
                    {player.isAI && (
                      <span className="text-xs text-white/60">🤖</span>
                    )}
                    {player.isCurrentUser && (
                      <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-white/60">
                    {player.correct} correct
                  </div>
                </div>
              </div>

              {/* XP */}
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-300" />
                  <span className="font-bold text-white text-lg">
                    {player.xp}
                  </span>
                </div>
                <div className="text-xs text-white/60">XP</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Current User Position Summary */}
      {sortedPlayers.length > 0 && (
        <motion.div
          className="mt-4 glass-game-warning p-3 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <span className="text-white/90 text-sm">Your Rank:</span>
            <span className="text-white font-bold text-lg">
              {sortedPlayers.findIndex(p => p.isCurrentUser) + 1} / {sortedPlayers.length}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PlayerLeaderboardCard;
