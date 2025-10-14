/**
 * Discovered Live! - Results/Celebration Screen
 * Shows game summary with confetti and stats when game completes
 *
 * Features:
 * - Enhanced confetti celebration
 * - Total XP earned with pulsing animation
 * - Game statistics (accuracy, streak, bingos)
 * - Achievement badges
 * - Auto-advance option
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, CheckCircle, Award, Target, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { GameSummary } from '../../types/DiscoveredLiveTypes';

interface DiscoveredLiveResultsProps {
  studentName: string;
  summary: GameSummary;
  onComplete: () => void;
}

export const DiscoveredLiveResults: React.FC<DiscoveredLiveResultsProps> = ({
  studentName,
  summary,
  onComplete
}) => {
  useEffect(() => {
    // Enhanced confetti celebration
    const duration = 4000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 40, spread: 360, ticks: 80, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 60 * (timeLeft / duration);

      // Multiple confetti bursts from different positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#9333ea', '#ec4899', '#14b8a6']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#9333ea', '#ec4899', '#14b8a6']
      });
      confetti({
        ...defaults,
        particleCount: particleCount / 2,
        origin: { x: 0.5, y: 0.5 },
        colors: ['#f59e0b', '#10b981', '#3b82f6']
      });
    }, 250);

    // Auto-complete after 6 seconds
    const timeout = setTimeout(onComplete, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Glassmorphism Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Cpolygon fill='%239333ea' opacity='0.1' points='30 0 45 15 30 30 15 15'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Celebration Card */}
      <motion.div
        className="relative max-w-3xl w-full mx-4 bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border border-white/20"
        initial={{ opacity: 0, scale: 0.8, rotateX: -30 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotateX: 30 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />

        {/* Content */}
        <div className="relative p-8 md:p-12">
          {/* Floating Achievement Badges */}
          <div className="absolute top-6 right-6 flex space-x-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Trophy className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.3 }}
              className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Star className="w-6 h-6 text-white" />
            </motion.div>
            {summary.completedLines > 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.4 }}
                className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Award className="w-6 h-6 text-white" />
              </motion.div>
            )}
          </div>

          {/* Main Content */}
          <div className="text-center space-y-6">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                Amazing Work, {studentName}!
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300">
                You completed Discovered Live!
              </p>
            </motion.div>

            {/* Trophy Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.4, damping: 10 }}
              className="flex justify-center"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Total XP Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.6,
                type: "spring",
                damping: 10
              }}
              className="relative"
            >
              {/* Pulsing Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl blur-xl opacity-50"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.7, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />

              {/* XP Card */}
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center justify-center space-x-4">
                  <Zap className="w-10 h-10 text-white" />
                  <div className="text-center">
                    <div className="text-5xl md:text-6xl font-bold text-white">
                      +{summary.totalXp}
                    </div>
                    <div className="text-lg md:text-xl text-white/90 font-medium">
                      Total XP Earned
                    </div>
                  </div>
                  <Zap className="w-10 h-10 text-white" />
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {/* Accuracy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col items-center">
                  <Target className="w-8 h-8 text-blue-500 mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(summary.accuracy)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Accuracy
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {summary.correctAnswers}/{summary.totalQuestions}
                  </div>
                </div>
              </motion.div>

              {/* Max Streak */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col items-center">
                  <Flame className="w-8 h-8 text-orange-500 mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {summary.maxStreak}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Max Streak
                  </div>
                </div>
              </motion.div>

              {/* Bingos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {summary.completedLines}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Bingos
                  </div>
                </div>
              </motion.div>

              {/* Time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col items-center">
                  <span className="text-3xl mb-2">⏱️</span>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatTime(summary.timeElapsedSeconds)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Time
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* XP Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm rounded-xl p-4 border border-purple-200 dark:border-purple-800"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {summary.baseXp}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Base XP
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-pink-600 dark:text-pink-400">
                    {summary.bonusXp}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Bonus XP
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {summary.totalXp}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Total XP
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-gray-500 dark:text-gray-400 text-lg"
            >
              Returning to Career Hub...
            </motion.p>
          </div>
        </div>

        {/* Bottom Gradient Bar (Progress) */}
        <motion.div
          className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 6, ease: "linear" }}
        />
      </motion.div>
    </motion.div>
  );
};

export default DiscoveredLiveResults;
