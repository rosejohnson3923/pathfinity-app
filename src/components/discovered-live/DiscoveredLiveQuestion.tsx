/**
 * Discovered Live! - Question Screen
 * Shows clue and 4 career options with interactive animations
 *
 * Features:
 * - Question text with skill connection
 * - 4 clickable career options
 * - Progress indicators (question number, streak)
 * - Answer feedback (correct/wrong animations)
 * - Mini bingo grid progress (5x5 = 25 squares)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, HelpCircle, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { QuestionData, GridPosition } from '../../types/DiscoveredLiveTypes';

interface DiscoveredLiveQuestionProps {
  questionData: QuestionData;
  totalQuestions: number;
  currentStreak: number;
  unlockedSquares: GridPosition[];
  onAnswerSubmit: (selectedIndex: number, responseTime: number) => void;
  showHint?: boolean;
}

export const DiscoveredLiveQuestion: React.FC<DiscoveredLiveQuestionProps> = ({
  questionData,
  totalQuestions,
  currentStreak,
  unlockedSquares,
  onAnswerSubmit,
  showHint = false
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answering, setAnswering] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - questionData.timeStarted) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [questionData.timeStarted]);

  const handleOptionClick = (index: number) => {
    if (answering || selectedIndex !== null) return;

    setSelectedIndex(index);
    setAnswering(true);

    const responseTime = (Date.now() - questionData.timeStarted) / 1000;
    const isCorrect = index === questionData.correctOptionIndex;

    // Visual feedback
    if (isCorrect) {
      // Confetti burst for correct answer
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9333ea', '#ec4899', '#14b8a6']
      });
    }

    // Submit answer after brief delay for animation
    setTimeout(() => {
      onAnswerSubmit(index, responseTime);
    }, isCorrect ? 1500 : 1000);
  };

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
        className="relative max-w-3xl w-full mx-4 bg-white/95 dark:bg-gray-900/95 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border border-white/20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />

        {/* Content */}
        <div className="relative p-6 md:p-8">
          {/* Header - Progress & Streak */}
          <div className="flex items-center justify-between mb-6">
            <motion.div
              className="text-sm font-semibold text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Question {questionData.questionNumber}/{totalQuestions}
            </motion.div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <motion.div
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Clock className="w-4 h-4" />
                {formatTime(elapsedTime)}
              </motion.div>

              {/* Streak Badge */}
              {currentStreak > 0 && (
                <motion.div
                  className="flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.3 }}
                >
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                    {currentStreak}
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Question Box */}
          <motion.div
            className="mb-8 bg-purple-50/80 dark:bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-200 dark:border-purple-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{questionData.clue.skillConnection === 'counting' ? '🧮' : '💡'}</span>
              <div className="flex-1">
                <p className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200">
                  {questionData.clue.clueText}
                </p>
                {showHint && (
                  <motion.p
                    className="mt-2 text-sm text-purple-600 dark:text-purple-400 flex items-center gap-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <HelpCircle className="w-4 h-4" />
                    Hint: Think about {questionData.clue.skillConnection}
                  </motion.p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Answer Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {questionData.options.map((option, index) => {
              const isSelected = selectedIndex === index;
              const isCorrect = index === questionData.correctOptionIndex;
              const showResult = selectedIndex !== null;
              const isWrong = showResult && isSelected && !isCorrect;

              return (
                <motion.button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  disabled={answering || selectedIndex !== null}
                  className={`
                    relative p-4 rounded-xl border-2 backdrop-blur-sm transition-all
                    ${isSelected && isCorrect
                      ? 'bg-green-50/80 dark:bg-green-900/20 border-green-500 ring-4 ring-green-300'
                      : isWrong
                      ? 'bg-red-50/80 dark:bg-red-900/20 border-red-500'
                      : showResult && isCorrect
                      ? 'bg-green-50/80 dark:bg-green-900/20 border-green-500'
                      : 'bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:scale-[1.02]'
                    }
                    ${!answering && selectedIndex === null ? 'cursor-pointer' : 'cursor-not-allowed'}
                  `}
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isWrong
                      ? {
                          opacity: 1,
                          y: 0,
                          x: [-5, 5, -5, 5, 0],
                          transition: { duration: 0.4 }
                        }
                      : { opacity: 1, y: 0 }
                  }
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  whileHover={!answering && selectedIndex === null ? { scale: 1.03, y: -2 } : {}}
                  whileTap={!answering && selectedIndex === null ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl">
                      {option.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {option.careerName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Option {String.fromCharCode(65 + index)}
                      </div>
                    </div>
                    {/* Checkmark for correct */}
                    {showResult && isCorrect && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-white text-xl">✓</span>
                      </motion.div>
                    )}
                    {/* X for wrong */}
                    {isWrong && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <span className="text-white text-xl">✗</span>
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Mini Bingo Progress */}
          <motion.div
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 text-center">
              Bingo Progress: {unlockedSquares.length}/25
            </div>
            <div className="flex justify-center gap-1">
              {[...Array(25)].map((_, index) => {
                const isUnlocked = unlockedSquares.length > index;
                return (
                  <motion.div
                    key={index}
                    className={`w-2.5 h-2.5 rounded-sm ${
                      isUnlocked
                        ? 'bg-green-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: isUnlocked ? 1 : 0.8 }}
                    transition={{ delay: 0.8 + (index * 0.02) }}
                  />
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Bottom Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
      </motion.div>
    </motion.div>
  );
};

export default DiscoveredLiveQuestion;
