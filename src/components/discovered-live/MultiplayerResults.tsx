/**
 * Multiplayer Results Component
 * Displays game results, leaderboard, and celebration for Discovered Live! multiplayer games
 *
 * Features:
 * - Podium display for top 3 players
 * - Full leaderboard with rankings
 * - Individual participant stats
 * - XP breakdown visualization
 * - Celebration animations
 * - Auto-transition to intermission
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Star, Zap, Target, TrendingUp, Users, Clock, Play } from 'lucide-react';
import type { ParticipantResult, BingoWinner } from '../../types/DiscoveredLiveMultiplayerTypes';

export interface MultiplayerResultsProps {
  gameNumber: number;
  leaderboard: ParticipantResult[];
  bingoWinners: BingoWinner[];
  currentParticipantId?: string;
  nextGameStartsAt: string;
  intermissionSeconds: number;
  onPlayAgain?: () => void;
  onLeaveRoom?: () => void;
}

/**
 * MultiplayerResults Component
 */
export const MultiplayerResults: React.FC<MultiplayerResultsProps> = ({
  gameNumber,
  leaderboard,
  bingoWinners,
  currentParticipantId,
  nextGameStartsAt,
  intermissionSeconds,
  onPlayAgain,
  onLeaveRoom,
}) => {
  const [timeUntilNextGame, setTimeUntilNextGame] = useState(intermissionSeconds);
  const [showConfetti, setShowConfetti] = useState(true);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const nextGame = new Date(nextGameStartsAt);
      const secondsRemaining = Math.max(0, Math.floor((nextGame.getTime() - now.getTime()) / 1000));
      setTimeUntilNextGame(secondsRemaining);

      if (secondsRemaining === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextGameStartsAt]);

  // Hide confetti after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Get top 3 for podium
  const top3 = leaderboard.slice(0, 3);
  const currentPlayer = leaderboard.find(p => p.participantId === currentParticipantId);

  // Get rank medal
  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1: return { color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: '🥇' };
      case 2: return { color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', label: '🥈' };
      case 3: return { color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', label: '🥉' };
      default: return { color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-700', label: `#${rank}` };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-6">
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(100)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: '50%',
                  y: '-10%',
                  scale: 1,
                  opacity: 1,
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${100 + Math.random() * 20}%`,
                  scale: 0,
                  opacity: 0,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  ease: 'easeOut',
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#FCD34D', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6'][i % 5],
                  left: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-2">
            Game #{gameNumber} Complete!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Amazing work, everyone! 🎉
          </p>
        </motion.div>

        {/* Podium Display */}
        {top3.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-end justify-center gap-4 mb-8"
          >
            {/* 2nd Place */}
            <PodiumPlace player={top3[1]} rank={2} height="h-40" delay={0.4} />

            {/* 1st Place */}
            <PodiumPlace player={top3[0]} rank={1} height="h-56" delay={0.3} />

            {/* 3rd Place */}
            <PodiumPlace player={top3[2]} rank={3} height="h-32" delay={0.5} />
          </motion.div>
        )}

        {/* Current Player Highlight */}
        {currentPlayer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-full p-4">
                  <Trophy className="w-12 h-12 text-purple-600" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold uppercase tracking-wide opacity-90">
                    Your Performance
                  </p>
                  <p className="text-white text-3xl font-black">
                    {getRankMedal(currentPlayer.rank).label} Rank #{currentPlayer.rank}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <StatCard
                  icon={<Trophy className="w-5 h-5" />}
                  label="Bingos"
                  value={currentPlayer.bingosWon.toString()}
                  color="text-yellow-300"
                />
                <StatCard
                  icon={<Zap className="w-5 h-5" />}
                  label="XP"
                  value={currentPlayer.totalXp.toString()}
                  color="text-green-300"
                />
                <StatCard
                  icon={<Target className="w-5 h-5" />}
                  label="Accuracy"
                  value={`${Math.round(currentPlayer.accuracy)}%`}
                  color="text-blue-300"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6" />
              Full Leaderboard
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {leaderboard.map((player, index) => {
              const medal = getRankMedal(player.rank);
              const isCurrentPlayer = player.participantId === currentParticipantId;

              return (
                <motion.div
                  key={player.participantId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className={`
                    p-4 transition-colors
                    ${isCurrentPlayer
                      ? 'bg-purple-50 dark:bg-purple-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    {/* Rank and Name */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`${medal.bg} ${medal.color} rounded-full w-12 h-12 flex items-center justify-center text-xl font-black`}>
                        {medal.label}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-bold text-lg ${
                            isCurrentPlayer
                              ? 'text-purple-900 dark:text-purple-100'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {player.displayName}
                          </p>
                          {isCurrentPlayer && (
                            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                              YOU
                            </span>
                          )}
                          {player.isAI && (
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full font-bold">
                              BOT
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bingos</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {player.bingosWon}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">XP</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {player.totalXp}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Accuracy</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {Math.round(player.accuracy)}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Streak</p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {player.maxStreak}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Next Game Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 shadow-2xl text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Clock className="w-8 h-8 text-white" />
            <h3 className="text-2xl font-bold text-white">Next Game Starting In</h3>
          </div>
          <motion.div
            animate={timeUntilNextGame <= 3 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: timeUntilNextGame <= 3 ? Infinity : 0 }}
            className="text-8xl font-black text-white mb-4"
          >
            {timeUntilNextGame}
          </motion.div>
          <p className="text-white text-lg opacity-90">
            Get ready for another round!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          {onPlayAgain && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPlayAgain}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-xl hover:from-green-700 hover:to-emerald-700 transition"
            >
              <Play className="w-6 h-6" />
              Stay for Next Game
            </motion.button>
          )}

          {onLeaveRoom && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLeaveRoom}
              className="flex items-center gap-3 px-8 py-4 bg-gray-600 text-white rounded-xl font-bold text-lg shadow-xl hover:bg-gray-700 transition"
            >
              Leave Room
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Podium Place Component
 */
interface PodiumPlaceProps {
  player: ParticipantResult;
  rank: number;
  height: string;
  delay: number;
}

const PodiumPlace: React.FC<PodiumPlaceProps> = ({ player, rank, height, delay }) => {
  const colors = {
    1: { bg: 'from-yellow-400 to-yellow-600', text: 'text-yellow-900', ring: 'ring-yellow-300' },
    2: { bg: 'from-gray-300 to-gray-500', text: 'text-gray-900', ring: 'ring-gray-200' },
    3: { bg: 'from-orange-400 to-orange-600', text: 'text-orange-900', ring: 'ring-orange-300' },
  }[rank] || { bg: 'from-gray-400 to-gray-600', text: 'text-gray-900', ring: 'ring-gray-300' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 15 }}
      className="flex flex-col items-center"
    >
      {/* Trophy */}
      <motion.div
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mb-4"
      >
        {rank === 1 && <Trophy className="w-16 h-16 text-yellow-500 drop-shadow-2xl" />}
        {rank === 2 && <Medal className="w-12 h-12 text-gray-400 drop-shadow-xl" />}
        {rank === 3 && <Medal className="w-10 h-10 text-orange-600 drop-shadow-xl" />}
      </motion.div>

      {/* Player Card */}
      <div className={`bg-gradient-to-br ${colors.bg} rounded-t-2xl w-48 ${height} flex flex-col items-center justify-center p-4 ring-4 ${colors.ring} shadow-2xl`}>
        <p className={`text-4xl font-black ${colors.text} mb-2`}>#{rank}</p>
        <p className={`text-lg font-bold ${colors.text} text-center mb-3 leading-tight`}>
          {player.displayName}
        </p>
        <div className="space-y-1 text-center">
          <p className={`text-sm font-bold ${colors.text} opacity-80`}>
            {player.bingosWon} Bingos
          </p>
          <p className={`text-sm font-bold ${colors.text} opacity-80`}>
            {player.totalXp} XP
          </p>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Stat Card Component (small)
 */
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  return (
    <div className="text-center">
      <div className={`flex items-center justify-center gap-1 mb-1 ${color}`}>
        {icon}
        <p className="text-xs font-medium opacity-90">{label}</p>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
};

export default MultiplayerResults;
