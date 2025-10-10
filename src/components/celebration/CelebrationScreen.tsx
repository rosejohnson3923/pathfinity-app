/**
 * Celebration Screen Component
 *
 * Glassmorphism-styled celebration screen for subject completion
 * Displays XP earned and congratulatory message
 * Distinct visual break from loading screens
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import '../../design-system/index.css';

interface CelebrationScreenProps {
  subjectName: string;
  xpEarned: number;
  studentName: string;
  onComplete?: () => void;
}

export const CelebrationScreen: React.FC<CelebrationScreenProps> = ({
  subjectName,
  xpEarned,
  studentName,
  onComplete
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // Show content after brief delay
    setTimeout(() => setShowContent(true), 100);

    // Auto-complete after 4 seconds
    if (onComplete) {
      setTimeout(onComplete, 4000);
    }

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
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
        className="relative max-w-xl w-full mx-4 bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border border-white/20"
        initial={{ opacity: 0, scale: 0.8, rotateX: -30 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotateX: 30 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />

        {/* Content */}
        <div className="relative p-12">
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
          </div>

          {/* Main Content */}
          <div className="text-center space-y-6">
            {/* Celebration Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="flex justify-center"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Great Job, {studentName}!
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                You completed {subjectName}!
              </p>
            </motion.div>

            {/* XP Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.4,
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
                <div className="flex items-center justify-center space-x-3">
                  <Zap className="w-8 h-8 text-white" />
                  <div className="text-left">
                    <div className="text-5xl font-bold text-white">
                      +{xpEarned}
                    </div>
                    <div className="text-lg text-white/90 font-medium">
                      XP Earned
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500 dark:text-gray-400 text-lg"
            >
              Loading your next adventure...
            </motion.p>
          </div>
        </div>

        {/* Bottom Gradient Bar */}
        <motion.div
          className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 4, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
};

export default CelebrationScreen;
