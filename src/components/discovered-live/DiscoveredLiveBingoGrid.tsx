/**
 * Discovered Live! - Bingo Grid Display
 * Shows the full 5x5 bingo grid with unlocked squares and completed lines
 *
 * Features:
 * - 5x5 grid of career squares with center FREE space
 * - Locked/unlocked states
 * - User career highlighted in center
 * - Completed line animations (rows, columns, diagonals)
 * - Progress stats
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { BingoGrid, GridPosition, CareerOption } from '../../types/DiscoveredLiveTypes';

interface DiscoveredLiveBingoGridProps {
  bingoGrid: BingoGrid;
  unlockedSquares: GridPosition[];
  completedRows: number[];
  completedColumns: number[];
  completedDiagonals: number[];
  careerDetails: Map<string, CareerOption>; // Map of career_code -> {careerName, icon}
  currentQuestionIndex: number;
  totalQuestions: number;
  currentXP: number;
  currentStreak: number;
  onContinue: () => void;
}

export const DiscoveredLiveBingoGrid: React.FC<DiscoveredLiveBingoGridProps> = ({
  bingoGrid,
  unlockedSquares,
  completedRows,
  completedColumns,
  completedDiagonals,
  careerDetails,
  currentQuestionIndex,
  totalQuestions,
  currentXP,
  currentStreak,
  onContinue
}) => {
  const [newBingo, setNewBingo] = useState(false);
  const [previousBingoCount, setPreviousBingoCount] = useState(0);

  // Detect new bingos and celebrate ONLY when count increases
  useEffect(() => {
    const totalBingos = completedRows.length + completedColumns.length + completedDiagonals.length;

    // Only celebrate if there's a NEW bingo (count increased)
    if (totalBingos > previousBingoCount) {
      setNewBingo(true);

      // Confetti celebration
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#9333ea', '#ec4899', '#14b8a6', '#f59e0b']
      });

      setTimeout(() => setNewBingo(false), 3000);

      // Update previous count
      setPreviousBingoCount(totalBingos);
    }
  }, [completedRows.length, completedColumns.length, completedDiagonals.length, previousBingoCount]);

  const isSquareUnlocked = (row: number, col: number): boolean => {
    return unlockedSquares.some(pos => pos.row === row && pos.col === col);
  };

  const isUserCareer = (row: number, col: number): boolean => {
    return bingoGrid.userCareerPosition?.row === row && bingoGrid.userCareerPosition?.col === col;
  };

  const isInCompletedLine = (row: number, col: number): boolean => {
    // Check if in completed row
    if (completedRows.includes(row)) return true;

    // Check if in completed column
    if (completedColumns.includes(col)) return true;

    // Check if in diagonal 1 (top-left to bottom-right)
    if (completedDiagonals.includes(0) && row === col) return true;

    // Check if in diagonal 2 (top-right to bottom-left)
    if (completedDiagonals.includes(1) && row + col === 4) return true;

    return false;
  };

  const totalBingos = completedRows.length + completedColumns.length + completedDiagonals.length;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Glassmorphism Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

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
        className="relative max-w-4xl w-full mx-4 bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border border-white/20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />

        {/* Content */}
        <div className="relative p-6 md:p-8">
          {/* Header */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Your Career Card
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {unlockedSquares.length} of 25 squares unlocked
            </p>
          </motion.div>

          {/* Bingo Grid */}
          <motion.div
            className="mb-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 md:p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-5 gap-2 md:gap-3 max-w-md mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
              {bingoGrid.careers.map((row, rowIndex) =>
                row.map((careerCode, colIndex) => {
                  const isUnlocked = isSquareUnlocked(rowIndex, colIndex);
                  const isUser = isUserCareer(rowIndex, colIndex);
                  const inBingo = isInCompletedLine(rowIndex, colIndex);
                  const career = careerDetails.get(careerCode);

                  return (
                    <motion.div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        aspect-square rounded-md border-2 backdrop-blur-sm flex flex-col items-center justify-center p-1 relative
                        ${isUser
                          ? 'bg-gradient-to-br from-purple-400/30 to-pink-500/30 border-purple-500 ring-2 ring-purple-300'
                          : isUnlocked
                          ? inBingo
                            ? 'bg-gradient-to-br from-green-400/30 to-emerald-500/30 border-green-500 ring-2 ring-green-300'
                            : 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-400'
                          : 'bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 opacity-50'
                        }
                      `}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: 1,
                        scale: isUnlocked || isUser ? 1 : 0.95,
                      }}
                      transition={{
                        delay: 0.3 + (rowIndex * 0.05 + colIndex * 0.05),
                        type: "spring"
                      }}
                    >
                      {/* Career Icon */}
                      <div className={`text-xl mb-0.5 ${isUnlocked || isUser ? '' : 'grayscale blur-[2px]'}`}>
                        {career?.icon || '💼'}
                      </div>

                      {/* Career Name */}
                      <div className={`text-[9px] font-medium text-center leading-tight ${
                        isUnlocked || isUser
                          ? 'text-gray-800 dark:text-gray-200'
                          : 'text-gray-400 dark:text-gray-600'
                      }`}>
                        {career?.careerName.split(' ')[0] || 'Career'}
                      </div>

                      {/* User Star Badge */}
                      {isUser && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", delay: 0.5 }}
                        >
                          <span className="text-white text-xs">⭐</span>
                        </motion.div>
                      )}

                      {/* Bingo Badge */}
                      {inBingo && isUnlocked && (
                        <motion.div
                          className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring" }}
                        >
                          <Trophy className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {/* Progress */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentQuestionIndex}/{totalQuestions}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Questions</div>
            </div>

            {/* XP */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentXP}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total XP</div>
            </div>

            {/* Streak */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">🔥</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentStreak}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
            </div>

            {/* Bingos */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalBingos}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Bingos</div>
            </div>
          </motion.div>

          {/* New Bingo Celebration */}
          {newBingo && (
            <motion.div
              className="mb-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <div className="text-4xl mb-2">🎉</div>
              <div className="text-2xl font-bold text-white mb-1">BINGO!</div>
              <div className="text-white/90">+25 XP Bonus!</div>
            </motion.div>
          )}

          {/* Continue Button */}
          <motion.button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(168, 85, 247, 0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            Continue
          </motion.button>
        </div>

        {/* Bottom Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
      </motion.div>
    </motion.div>
  );
};

export default DiscoveredLiveBingoGrid;
