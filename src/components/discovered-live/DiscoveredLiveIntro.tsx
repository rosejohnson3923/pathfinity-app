/**
 * Discovered Live! - Intro Screen
 * Welcome/Instructions screen with GlassMorphism design
 *
 * Shows:
 * - Game logo
 * - 5x5 bingo grid preview with center FREE space
 * - How to play instructions
 * - Start button
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Play, Target, Award, Zap } from 'lucide-react';
import type { BingoGrid } from '../../types/DiscoveredLiveTypes';

interface DiscoveredLiveIntroProps {
  bingoGrid: BingoGrid;
  studentName: string;
  onStart: () => void;
}

export const DiscoveredLiveIntro: React.FC<DiscoveredLiveIntroProps> = ({
  bingoGrid,
  studentName,
  onStart
}) => {
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

      {/* Main Glass Card */}
      <motion.div
        className="relative max-w-3xl w-full mx-4 bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border border-white/20"
        initial={{ opacity: 0, scale: 0.8, rotateX: -30 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotateX: 30 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />

        {/* Content */}
        <div className="relative p-8 md:p-12">
          {/* Logo with floating animation */}
          <motion.div
            className="flex justify-center mb-8"
            animate={{ y: [-5, 5, -5] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
          >
            <img
              src="/images/DiscoveredLive/DL Logo.png"
              alt="Discovered Live!"
              className="h-16 md:h-20 w-auto"
            />
          </motion.div>

          {/* Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome, {studentName}!
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
              Match skills to careers and unlock the bingo grid!
            </p>
          </motion.div>

          {/* Bingo Grid Preview */}
          <motion.div
            className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-center text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Your Career Card
            </h3>
            <div className="grid grid-cols-5 gap-2 max-w-md mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
              {bingoGrid.careers.map((row, rowIndex) =>
                row.map((careerCode, colIndex) => {
                  const isUserCareer =
                    bingoGrid.userCareerPosition?.row === rowIndex &&
                    bingoGrid.userCareerPosition?.col === colIndex;

                  return (
                    <motion.div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        aspect-square rounded-md flex items-center justify-center text-xl
                        ${isUserCareer
                          ? 'bg-gradient-to-br from-purple-400/30 to-pink-500/30 border-2 border-purple-500 ring-2 ring-purple-300'
                          : 'bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600'
                        }
                      `}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + (rowIndex * 0.05 + colIndex * 0.05) }}
                    >
                      {isUserCareer && <span className="text-lg">⭐</span>}
                    </motion.div>
                  );
                })
              )}
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              ⭐ Your chosen career is highlighted!
            </p>
          </motion.div>

          {/* Instructions */}
          <motion.div
            className="mb-8 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-purple-600" />
              How to Play
            </h3>
            <div className="space-y-3">
              {[
                { icon: '🎯', text: 'Answer career clues by matching skills to careers' },
                { icon: '✅', text: 'Get it right to unlock a square on your bingo grid' },
                { icon: '🎊', text: 'Complete rows, columns, or diagonals for bonus XP!' },
                { icon: '🔥', text: 'Build streaks for even more rewards' }
              ].map((instruction, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + (index * 0.1) }}
                >
                  <span className="text-2xl">{instruction.icon}</span>
                  <p className="text-gray-700 dark:text-gray-300 flex-1">
                    {instruction.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* XP Info */}
          <motion.div
            className="mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-300 dark:border-purple-700"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
          >
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  10 XP per correct answer
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  25 XP per bingo line
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">🔥</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bonus XP for streaks
                </span>
              </div>
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.button
            onClick={onStart}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(168, 85, 247, 0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="w-6 h-6" fill="currentColor" />
            Let's Play!
          </motion.button>
        </div>

        {/* Bottom Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
      </motion.div>
    </motion.div>
  );
};

export default DiscoveredLiveIntro;
