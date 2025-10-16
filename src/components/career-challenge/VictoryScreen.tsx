/**
 * Victory Screen for DLCC (Discovered Live! Career Challenge)
 * Displays game results, rankings, and achievements
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Medal,
  Crown,
  Star,
  TrendingUp,
  Award,
  Users,
  Target,
  Zap,
  CheckCircle,
  ChevronRight,
  Share2,
  Home,
  RotateCcw,
  Sparkles,
  Gift
} from 'lucide-react';
import { ParticleEffects, FloatingEmojis } from './ParticleEffects';
import { soundManager, playVictory, playDefeat } from '../../services/CareerChallengeSoundManager';

interface PlayerResult {
  playerId: string;
  displayName: string;
  score: number;
  rank: number;
  challengesCompleted: number;
  maxStreak: number;
  roleCardsUsed: number;
  synergiesActivated: number;
  perfectChallenges: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface VictoryScreenProps {
  playerResults: PlayerResult[];
  currentPlayerId: string;
  gameStats: {
    totalTurns: number;
    gameDuration: number;
    totalChallengesAttempted: number;
    industryName: string;
  };
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
  onViewStats?: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  playerResults,
  currentPlayerId,
  gameStats,
  onPlayAgain,
  onReturnToLobby,
  onViewStats
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'rankings' | 'achievements' | 'stats'>('rankings');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [particlesTrigger, setParticlesTrigger] = useState<'victory' | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);

  const currentPlayer = playerResults.find(p => p.playerId === currentPlayerId);
  const isWinner = currentPlayer?.rank === 1;
  const topThree = playerResults.slice(0, 3);

  // Generate achievements based on performance
  useEffect(() => {
    const generateAchievements = () => {
      const achievementList: Achievement[] = [];

      if (currentPlayer) {
        // Winner achievement
        if (isWinner) {
          achievementList.push({
            id: 'winner',
            title: 'Victory Royale',
            description: 'Won the Career Challenge',
            icon: Crown,
            unlocked: true,
            rarity: 'legendary'
          });
        }

        // Streak achievement
        if (currentPlayer.maxStreak >= 3) {
          achievementList.push({
            id: 'streak',
            title: 'On Fire',
            description: '3+ challenge winning streak',
            icon: Zap,
            unlocked: true,
            rarity: 'epic'
          });
        }

        // Synergy master
        if (currentPlayer.synergiesActivated >= 5) {
          achievementList.push({
            id: 'synergy',
            title: 'Synergy Master',
            description: 'Activated 5+ synergies',
            icon: Sparkles,
            unlocked: true,
            rarity: 'rare'
          });
        }

        // Perfect challenges
        if (currentPlayer.perfectChallenges > 0) {
          achievementList.push({
            id: 'perfect',
            title: 'Perfectionist',
            description: 'Completed challenges perfectly',
            icon: Star,
            unlocked: true,
            rarity: 'epic'
          });
        }

        // Participation
        achievementList.push({
          id: 'participant',
          title: 'Team Player',
          description: 'Completed the game',
          icon: Users,
          unlocked: true,
          rarity: 'common'
        });
      }

      setAchievements(achievementList);
    };

    generateAchievements();
  }, [currentPlayer, isWinner]);

  // Initialize effects on mount
  useEffect(() => {
    // Play appropriate sound
    if (isWinner) {
      playVictory();
      setParticlesTrigger('victory');
      setShowEmojis(true);
    } else {
      playDefeat();
    }

    // Stop effects after delays
    const confettiTimer = setTimeout(() => setShowConfetti(false), 5000);
    const particlesTimer = setTimeout(() => setParticlesTrigger(null), 4000);
    const emojiTimer = setTimeout(() => setShowEmojis(false), 3000);

    return () => {
      clearTimeout(confettiTimer);
      clearTimeout(particlesTimer);
      clearTimeout(emojiTimer);
    };
  }, [isWinner]);

  // Get rank display
  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return { icon: '👑', label: '1st Place', color: 'from-yellow-400 to-orange-500' };
      case 2:
        return { icon: '🥈', label: '2nd Place', color: 'from-gray-300 to-gray-500' };
      case 3:
        return { icon: '🥉', label: '3rd Place', color: 'from-orange-400 to-orange-600' };
      default:
        return { icon: `#${rank}`, label: `${rank}th Place`, color: 'from-blue-400 to-blue-600' };
    }
  };

  // Get achievement color
  const getAchievementColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 via-orange-500 to-red-500';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 z-40 overflow-y-auto"
    >
      {/* Particle Effects */}
      {particlesTrigger && (
        <ParticleEffects
          trigger={particlesTrigger}
          onComplete={() => setParticlesTrigger(null)}
        />
      )}

      {/* Floating Emojis for Winner */}
      {showEmojis && isWinner && (
        <FloatingEmojis emoji="🏆" count={8} duration={4000} />
      )}

      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden"
        >
          {/* Header */}
          <div className={`
            relative p-8 text-white bg-gradient-to-r
            ${isWinner
              ? 'from-yellow-400 via-orange-500 to-red-500'
              : 'from-purple-600 to-blue-600'
            }
          `}>
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="inline-block mb-4"
              >
                <Trophy className="w-20 h-20 mx-auto" />
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-bold mb-2"
              >
                {isWinner ? 'VICTORY!' : 'GAME COMPLETE!'}
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xl opacity-90"
              >
                {gameStats.industryName} Career Challenge
              </motion.p>
            </div>

            {/* Player Result Banner */}
            {currentPlayer && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 bg-white/20 backdrop-blur-sm rounded-xl p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{getRankDisplay(currentPlayer.rank).icon}</div>
                    <div>
                      <p className="font-bold text-lg">{currentPlayer.displayName}</p>
                      <p className="text-sm opacity-90">{getRankDisplay(currentPlayer.rank).label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{currentPlayer.score}</p>
                    <p className="text-sm opacity-90">points</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {(['rankings', 'achievements', 'stats'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`
                  flex-1 py-3 px-4 font-medium capitalize transition-all
                  ${selectedTab === tab
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Rankings Tab */}
              {selectedTab === 'rankings' && (
                <motion.div
                  key="rankings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Podium for top 3 */}
                  {topThree.length >= 3 && (
                    <div className="flex justify-center items-end gap-4 mb-6">
                      {[topThree[1], topThree[0], topThree[2]].map((player, index) => {
                        const position = index === 1 ? 1 : index === 0 ? 2 : 3;
                        const height = position === 1 ? 'h-32' : position === 2 ? 'h-24' : 'h-20';

                        return player ? (
                          <motion.div
                            key={player.playerId}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 + (index * 0.1) }}
                            className="text-center"
                          >
                            <div className="mb-2">
                              <p className="font-bold text-sm">{player.displayName}</p>
                              <p className="text-2xl font-bold text-purple-600">{player.score}</p>
                            </div>
                            <div className={`
                              ${height} w-24 rounded-t-lg flex items-center justify-center
                              bg-gradient-to-b ${getRankDisplay(position).color}
                            `}>
                              <span className="text-white text-3xl font-bold">{position}</span>
                            </div>
                          </motion.div>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Full Rankings */}
                  <div className="space-y-2">
                    {playerResults.map((player, index) => (
                      <motion.div
                        key={player.playerId}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.9 + (index * 0.05) }}
                        className={`
                          flex items-center justify-between p-4 rounded-xl
                          ${player.playerId === currentPlayerId
                            ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500'
                            : 'bg-gray-50 dark:bg-gray-800'
                          }
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-2xl">{getRankDisplay(player.rank).icon}</div>
                          <div>
                            <p className="font-bold">{player.displayName}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                              <span>🎯 {player.challengesCompleted} completed</span>
                              <span>🔥 {player.maxStreak} streak</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">{player.score}</p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Achievements Tab */}
              {selectedTab === 'achievements' && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {achievements.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                          relative p-4 rounded-xl overflow-hidden
                          ${achievement.unlocked
                            ? `bg-gradient-to-br ${getAchievementColor(achievement.rarity)}`
                            : 'bg-gray-200 dark:bg-gray-800 opacity-50'
                          }
                        `}
                      >
                        <div className="relative z-10 text-white">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                              <Icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold">{achievement.title}</p>
                              <p className="text-sm opacity-90">{achievement.description}</p>
                              <p className="text-xs mt-1 uppercase tracking-wider opacity-75">
                                {achievement.rarity}
                              </p>
                            </div>
                          </div>
                        </div>
                        {achievement.unlocked && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-5 h-5 text-white/80" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* Stats Tab */}
              {selectedTab === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {[
                    { label: 'Total Turns', value: gameStats.totalTurns, icon: RotateCcw },
                    { label: 'Duration', value: `${Math.floor(gameStats.gameDuration / 60)}m`, icon: Trophy },
                    { label: 'Challenges', value: gameStats.totalChallengesAttempted, icon: Target },
                    { label: 'Players', value: playerResults.length, icon: Users }
                  ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.label}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center"
                      >
                        <Icon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReturnToLobby}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold"
              >
                <Home className="w-5 h-5" />
                Return to Lobby
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onPlayAgain}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold shadow-lg"
              >
                <RotateCcw className="w-5 h-5" />
                Play Again
              </motion.button>

              {onViewStats && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onViewStats}
                  className="py-3 px-6 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl font-semibold"
                >
                  <TrendingUp className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VictoryScreen;