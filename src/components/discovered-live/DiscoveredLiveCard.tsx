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
import { Gamepad2, Lock, Trophy, Zap, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
    >
      {/* Multi-layer Animated Background Glow - ENHANCED */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 dark:from-purple-600/40 dark:via-pink-600/40 dark:to-blue-600/40 rounded-3xl blur-2xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.6, 1, 0.6],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-l from-yellow-400/20 via-orange-500/20 to-red-500/20 dark:from-yellow-500/30 dark:via-orange-600/30 dark:to-red-600/30 rounded-3xl blur-2xl"
        animate={{
          scale: [1.05, 1, 1.05],
          opacity: [0.4, 0.7, 0.4],
          rotate: [0, -5, 0]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5
        }}
      />

      {/* Main Card - ENHANCED */}
      <motion.button
        onClick={handleClick}
        className="relative w-full glass-card hover:scale-[1.03] transition-all duration-300 cursor-pointer border-4 border-purple-400/60 dark:border-purple-500/70 shadow-2xl"
        whileHover={{ scale: 1.03, boxShadow: '0 20px 60px rgba(168, 85, 247, 0.4)' }}
        whileTap={{ scale: 0.97 }}
      >
        <div className="flex flex-col md:flex-row items-center gap-8 p-8">
          {/* Icon Section - ENHANCED SIZE */}
          <div className="flex-shrink-0">
            <div className="relative">
              <motion.div
                className="w-32 h-32 glass-game rounded-3xl flex items-center justify-center"
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(168, 85, 247, 0.5)',
                    '0 0 50px rgba(168, 85, 247, 0.8)',
                    '0 0 30px rgba(168, 85, 247, 0.5)'
                  ],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity
                }}
              >
                <Gamepad2 className="w-16 h-16 text-white" />
              </motion.div>
              {/* Trophy Badge - BIGGER */}
              <motion.div
                className="absolute -top-3 -right-3 w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-lg"
                animate={{
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <Trophy className="w-7 h-7 text-white" />
              </motion.div>
              {/* Sparkle Effect */}
              <motion.div
                className="absolute -top-1 -left-1"
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </motion.div>
            </div>
          </div>

          {/* Content Section - ENHANCED */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <h3 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
                Discovered Live!
              </h3>
              <motion.span
                className="text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-bold shadow-lg"
                animate={{
                  scale: [1, 1.15, 1],
                  rotate: [0, 3, -3, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                ✨ UNLOCKED
              </motion.span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-4 font-medium leading-relaxed">
              Discover your talent in our gamified learning arcade where you can level up your skills or compete with others in real-time multiplayer games!
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

          {/* CTA Section - ENHANCED */}
          <div className="flex-shrink-0">
            <motion.div
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-500 dark:via-pink-500 dark:to-purple-500 px-10 py-5 rounded-2xl shadow-2xl"
              whileHover={{
                boxShadow: '0 15px 50px rgba(168, 85, 247, 0.6)',
                scale: 1.05
              }}
              animate={{
                boxShadow: [
                  '0 10px 30px rgba(168, 85, 247, 0.3)',
                  '0 15px 40px rgba(168, 85, 247, 0.5)',
                  '0 10px 30px rgba(168, 85, 247, 0.3)'
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            >
              <div className="flex items-center gap-3 text-white font-bold text-2xl">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                >
                  <Sparkles className="w-7 h-7" />
                </motion.div>
                <span>Play Now</span>
                <motion.div
                  animate={{
                    x: [0, 8, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity
                  }}
                >
                  <ArrowRight className="w-7 h-7" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.button>

      {/* Success Message - ENHANCED */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring' }}
      >
        <motion.p
          className="text-lg text-gray-700 dark:text-gray-300 font-bold px-6 py-3 rounded-2xl bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 inline-block"
          animate={{
            scale: [1, 1.02, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          🎉 Amazing work! You've completed all learning containers. Time to play and compete!
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default DiscoveredLiveCard;
