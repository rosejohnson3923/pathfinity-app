/**
 * Career Bingo - Game Summary Screen
 *
 * Shows comprehensive results after completing a Career Bingo game
 * Displays final rankings, XP earned, accuracy, and bingos achieved
 *
 * Features:
 * - Final leaderboard with rankings
 * - Personal stats (XP, accuracy, bingos, streak)
 * - Celebration animations for winners
 * - Play again or return to hub options
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Zap, Grid3x3, ArrowLeft, Play, Award, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import '../../design-system/index.css';

interface PlayerResult {
  id: string;
  name: string;
  xp: number;
  correct: number;
  total: number;
  bingos: number;
  streak: number;
  isCurrentUser: boolean;
  rank: number;
}

interface BingoGameSummaryProps {
  playerResults: PlayerResult[];
  totalQuestions: number;
  userXPEarned: number;
  userAccuracy: number;
  userBingos: number;
  userMaxStreak: number;
  onPlayAgain: () => void;
  onReturnToHub: () => void;
}

export const BingoGameSummary: React.FC<BingoGameSummaryProps> = ({
  playerResults,
  totalQuestions,
  userXPEarned,
  userAccuracy,
  userBingos,
  userMaxStreak,
  onPlayAgain,
  onReturnToHub
}) => {
  const currentUser = playerResults.find(p => p.isCurrentUser);
  const userRank = currentUser?.rank || playerResults.length;

  // Fire confetti if user placed in top 3
  React.useEffect(() => {
    if (userRank <= 3) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#9333ea', '#ec4899', '#14b8a6', '#f59e0b']
      });
    }
  }, [userRank]);

  // Get rank display (1st, 2nd, 3rd, etc.)
  const getRankDisplay = (rank: number): string => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
  };

  // Get rank color
  const getRankColor = (rank: number): string => {
    if (rank === 1) return 'text-yellow-300';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-white/60';
  };

  // Get rank icon
  const getRankIcon = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '📊';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Cpolygon fill='%23ffffff' opacity='0.3' points='30 0 45 15 30 30 15 15'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          className="glass-card mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center">
            <motion.div
              className="inline-block mb-4"
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <Trophy className="w-20 h-20 glass-icon-accent mx-auto" />
            </motion.div>
            <h1 className="text-5xl font-bold glass-text-primary mb-2">
              Game Complete!
            </h1>
            <p className="glass-text-secondary text-xl">
              You finished {getRankDisplay(userRank)} place!
            </p>
          </div>
        </motion.div>

        {/* Personal Stats Grid */}
        <motion.div
          className="grid md:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass-game text-center p-6">
            <Star className="w-8 h-8 glass-icon-accent mx-auto mb-2" />
            <div className="text-3xl font-bold glass-text-primary mb-1">
              {userXPEarned.toLocaleString()}
            </div>
            <div className="glass-text-tertiary text-sm">XP Earned</div>
          </div>

          <div className="glass-game text-center p-6">
            <Target className="w-8 h-8 glass-icon-primary mx-auto mb-2" />
            <div className="text-3xl font-bold glass-text-primary mb-1">
              {userAccuracy}%
            </div>
            <div className="glass-text-tertiary text-sm">Accuracy</div>
          </div>

          <div className="glass-game text-center p-6">
            <Grid3x3 className="w-8 h-8 glass-icon-success mx-auto mb-2" />
            <div className="text-3xl font-bold glass-text-primary mb-1">
              {userBingos}
            </div>
            <div className="glass-text-tertiary text-sm">Bingos</div>
          </div>

          <div className="glass-game text-center p-6">
            <Zap className="w-8 h-8 glass-icon-warning mx-auto mb-2" />
            <div className="text-3xl font-bold glass-text-primary mb-1">
              {userMaxStreak}
            </div>
            <div className="glass-text-tertiary text-sm">Best Streak</div>
          </div>
        </motion.div>

        {/* Final Leaderboard */}
        <motion.div
          className="glass-card mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-8 h-8 glass-icon-accent" />
            <h2 className="text-2xl font-bold glass-text-primary">Final Rankings</h2>
          </div>

          <div className="space-y-3">
            {playerResults.map((player, index) => (
              <motion.div
                key={player.id}
                className={`glass-subtle p-4 ${
                  player.isCurrentUser ? 'ring-2 ring-yellow-400' : ''
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className="flex flex-col items-center">
                      <div className="text-3xl mb-1">{getRankIcon(player.rank)}</div>
                      <div className={`text-lg font-bold ${getRankColor(player.rank)}`}>
                        {getRankDisplay(player.rank)}
                      </div>
                    </div>

                    {/* Player Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="glass-text-primary font-bold text-lg">
                          {player.name}
                        </div>
                        {player.isCurrentUser && (
                          <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded-full font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="glass-text-tertiary text-sm flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {player.correct}/{player.total} correct
                        </span>
                        <span className="flex items-center gap-1">
                          <Grid3x3 className="w-4 h-4" />
                          {player.bingos} bingos
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* XP Display */}
                  <div className="text-right">
                    <div className="text-2xl font-bold glass-icon-accent flex items-center gap-1">
                      <Star className="w-6 h-6" />
                      {player.xp.toLocaleString()}
                    </div>
                    <div className="glass-text-tertiary text-xs">XP</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="grid md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button
            onClick={onPlayAgain}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="w-6 h-6" fill="currentColor" />
            Play Again
          </motion.button>

          <motion.button
            onClick={onReturnToHub}
            className="glass-card hover:scale-[1.02] transition-transform text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-6 h-6" />
            Return to Hub
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default BingoGameSummary;
