/**
 * Journey Celebration Screen Component
 *
 * Ultimate celebration for completing DISCOVER container and entire career exploration journey
 * Most elaborate Glassmorphism design with enhanced animations
 * Shows completion of all three containers (LEARN → EXPERIENCE → DISCOVER)
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Crown, Award, Sparkles, Target, Rocket } from 'lucide-react';
import confetti from 'canvas-confetti';
import '../../design-system/index.css';

interface SubjectSummary {
  name: string;
  xpEarned: number;
  completed: boolean;
}

interface JourneyCelebrationScreenProps {
  subjects: SubjectSummary[];
  totalXP: number;
  studentName: string;
  careerName?: string;
  onComplete?: () => void;
}

export const JourneyCelebrationScreen: React.FC<JourneyCelebrationScreenProps> = ({
  subjects,
  totalXP,
  studentName,
  careerName,
  onComplete
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Epic confetti celebration - multiple bursts and styles
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 50, spread: 360, ticks: 100, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Initial burst
    confetti({
      particleCount: 200,
      spread: 160,
      origin: { y: 0.6 },
      zIndex: 9999
    });

    // Continuous celebration
    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 80 * (timeLeft / duration);

      // Multiple confetti sources
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
      confetti({
        ...defaults,
        particleCount: particleCount / 2,
        origin: { x: 0.5, y: 0.3 }
      });

      // Star shapes
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.5 },
        colors: ['#FFD700', '#FFA500', '#FF6347'],
        zIndex: 9999
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.5 },
        colors: ['#FFD700', '#FFA500', '#FF6347'],
        zIndex: 9999
      });
    }, 200);

    // Show content after brief delay
    setTimeout(() => setShowContent(true), 100);

    // Auto-complete after 12 seconds (gives user time to enjoy celebration and read summary)
    if (onComplete) {
      setTimeout(onComplete, 12000);
    }

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Glassmorphism Backdrop with stronger blur */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-pink-900/60 to-blue-900/60 backdrop-blur-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Animated Background Pattern - More prominent */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Cpolygon fill='%23FFD700' opacity='0.3' points='30 0 45 15 30 30 15 15'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      {/* Celebration Card - Larger */}
      <motion.div
        className="relative max-w-4xl w-full mx-4 bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border-2 border-yellow-400/50"
        initial={{ opacity: 0, scale: 0.7, rotateY: -40 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        exit={{ opacity: 0, scale: 0.7, rotateY: 40 }}
        transition={{ type: "spring", damping: 12, stiffness: 80 }}
      >
        {/* Animated Gradient Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-purple-500/20 to-pink-500/20 pointer-events-none"
          animate={{
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        {/* Content */}
        <div className="relative p-12">
          {/* Crown at top center */}
          <motion.div
            className="absolute top-6 left-1/2 transform -translate-x-1/2"
            initial={{ scale: 0, rotate: -180, y: -50 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            transition={{ type: "spring", delay: 0.3, damping: 10 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-yellow-200">
              <Crown className="w-9 h-9 text-white" />
            </div>
          </motion.div>

          {/* Floating Achievement Badges */}
          <div className="absolute top-6 right-6 flex space-x-2">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.4 }}
              className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Trophy className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.5 }}
              className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Star className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.6 }}
              className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Award className="w-6 h-6 text-white" />
            </motion.div>
          </div>

          {/* Left side badges */}
          <div className="absolute top-6 left-6 flex flex-col space-y-2">
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.7 }}
              className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Target className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.8 }}
              className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Rocket className="w-6 h-6 text-white" />
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="text-center space-y-8 mt-8">
            {/* Epic Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <h2 className="text-6xl font-extrabold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-3">
                  Journey Complete!
                </h2>
              </motion.div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Incredible Work, {studentName}!
              </p>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                You've mastered{careerName ? ` the ${careerName} path` : ' your career exploration'}!
              </p>
            </motion.div>

            {/* Container XP Breakdown - Show XP for LEARN, EXPERIENCE, DISCOVER */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-6 my-8 max-w-4xl mx-auto"
            >
              {['LEARN', 'EXPERIENCE', 'DISCOVER'].map((containerName, index) => {
                // Calculate XP for this container by summing subjects
                // subjects array has 12 items (4 subjects × 3 containers)
                // First 4 are LEARN, next 4 are EXPERIENCE, last 4 are DISCOVER
                const startIdx = index * 4;
                const endIdx = startIdx + 4;
                const containerSubjects = subjects.slice(startIdx, endIdx);
                const containerXP = containerSubjects.reduce((sum, subj) => sum + (subj.xpEarned || 0), 0);

                return (
                  <motion.div
                    key={containerName}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + (index * 0.15), type: "spring" }}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border-2 border-gradient shadow-xl"
                  >
                    <div className="text-center">
                      <div className="mb-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {containerName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        ✓ Complete
                      </div>
                      <div className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        +{containerXP} XP
                      </div>
                      {/* Show subjects breakdown */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                          {containerSubjects.map(subj => (
                            <div key={subj.name} className="flex justify-between">
                              <span>{subj.name}:</span>
                              <span className="font-semibold">+{subj.xpEarned}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Epic Total XP Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 1.4,
                type: "spring",
                damping: 8
              }}
              className="relative"
            >
              {/* Multi-layer Pulsing Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-3xl blur-2xl opacity-60"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.6, 0.8, 0.6],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />

              {/* XP Card */}
              <div className="relative bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-3xl p-10 shadow-2xl">
                <motion.div
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="flex items-center justify-center space-x-6"
                >
                  <Zap className="w-12 h-12 text-white" />
                  <div className="text-center">
                    <div className="text-7xl font-extrabold text-white drop-shadow-lg">
                      +{totalXP}
                    </div>
                    <div className="text-2xl text-white/95 font-bold">
                      Total XP Mastered
                    </div>
                  </div>
                  <Zap className="w-12 h-12 text-white" />
                </motion.div>
              </div>
            </motion.div>

            {/* Final Message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="text-gray-600 dark:text-gray-300 text-xl font-medium"
            >
              🎉 You're ready for your next adventure! 🚀
            </motion.p>

            {/* Return Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0 }}
              className="flex justify-center mt-8"
            >
              <button
                onClick={onComplete}
                className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl font-bold rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 flex items-center space-x-3"
              >
                <span>Return to Career Hub</span>
                <Rocket className="w-6 h-6" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Animated Bottom Gradient Bar */}
        <motion.div
          className="h-3 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 8, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
};

export default JourneyCelebrationScreen;
