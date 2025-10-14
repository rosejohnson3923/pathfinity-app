/**
 * Discovered Live! Integration Card
 *
 * Shows in CareerIncLobby between learning journey cards and progress goals
 * Unlocks when user completes all 3 containers (Learn, Experience, Discover)
 *
 * Features:
 * - Locked state with progress indicator
 * - Unlocked state with call-to-action
 * - Glass styling with theme support
 * - Animated entrance and hover effects
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Lock, Trophy, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import '../../design-system/index.css';

interface DiscoveredLiveCardProps {
  isUnlocked: boolean;
  completedContainers: number; // 0-3
  onNavigate?: () => void;
}

export const DiscoveredLiveCard: React.FC<DiscoveredLiveCardProps> = ({
  isUnlocked,
  completedContainers,
  onNavigate
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isUnlocked) {
      if (onNavigate) {
        onNavigate();
      } else {
        navigate('/discovered-live');
      }
    }
  };

  if (!isUnlocked) {
    // LOCKED STATE
    return (
      <motion.div
        className="relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Locked Card */}
        <div className="glass-card opacity-60 cursor-not-allowed">
          <div className="flex flex-col md:flex-row items-center gap-6 p-6">
            {/* Icon Section */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-20 h-20 glass-subtle rounded-2xl flex items-center justify-center">
                  <Gamepad2 className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                </div>
                {/* Lock Badge */}
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-gray-500 dark:bg-gray-700 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900">
                  <Lock className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">
                  Discovered Live!
                </h3>
                <span className="text-xs bg-gray-500 dark:bg-gray-700 text-white px-2 py-1 rounded-full font-semibold">
                  LOCKED
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                Complete your learning journey to unlock competitive career games!
              </p>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        i < completedContainers
                          ? 'bg-green-500 dark:bg-green-600'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      {i < completedContainers ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-white text-xs font-bold">{i + 1}</span>
                      )}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                  {completedContainers}/3 Containers Complete
                </span>
              </div>
            </div>

            {/* CTA Section (Disabled) */}
            <div className="flex-shrink-0">
              <div className="glass-subtle px-6 py-3 rounded-xl opacity-50">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-600 font-bold">
                  <Lock className="w-5 h-5" />
                  <span>Locked</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <motion.div
          className="mt-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 Keep learning! You're {3 - completedContainers} container{3 - completedContainers !== 1 ? 's' : ''} away from unlocking multiplayer games
          </p>
        </motion.div>
      </motion.div>
    );
  }

  // UNLOCKED STATE
  return (
    <motion.div
      className="relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, type: 'spring' }}
    >
      {/* Animated Background Glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 dark:from-purple-600/30 dark:via-pink-600/30 dark:to-blue-600/30 rounded-2xl blur-xl"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Main Card */}
      <motion.button
        onClick={handleClick}
        className="relative w-full glass-card hover:scale-[1.02] transition-all duration-300 cursor-pointer border-2 border-purple-400/50 dark:border-purple-600/50"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex flex-col md:flex-row items-center gap-6 p-6">
          {/* Icon Section */}
          <div className="flex-shrink-0">
            <div className="relative">
              <motion.div
                className="w-20 h-20 glass-game rounded-2xl flex items-center justify-center"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.3)',
                    '0 0 30px rgba(168, 85, 247, 0.5)',
                    '0 0 20px rgba(168, 85, 247, 0.3)'
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
              >
                <Gamepad2 className="w-10 h-10 text-white" />
              </motion.div>
              {/* Trophy Badge */}
              <motion.div
                className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900"
                animate={{
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Trophy className="w-5 h-5 text-white" />
              </motion.div>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Discovered Live!
              </h3>
              <motion.span
                className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full font-bold"
                animate={{
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                ✨ UNLOCKED
              </motion.span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-base mb-3">
              Ready to level up? Play Career Bingo and compete with others in real-time multiplayer games!
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <div className="glass-game-success px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Earn XP
              </div>
              <div className="glass-game-success px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Compete Live
              </div>
              <div className="glass-game-success px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1">
                <Gamepad2 className="w-3 h-3" />
                Multiple Games
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="flex-shrink-0">
            <motion.div
              className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 px-6 py-4 rounded-xl shadow-lg"
              whileHover={{
                boxShadow: '0 10px 40px rgba(168, 85, 247, 0.4)'
              }}
            >
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <span>Explore Now</span>
                <motion.div
                  animate={{
                    x: [0, 5, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity
                  }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.button>

      {/* Success Message */}
      <motion.div
        className="mt-3 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">
          🎉 Amazing work! You've completed all learning containers. Time to play and compete!
        </p>
      </motion.div>
    </motion.div>
  );
};

export default DiscoveredLiveCard;
