/**
 * Question Display Card
 *
 * Shows the current career clue with timer
 *
 * Features:
 * - Glass card styling
 * - Animated timer countdown
 * - Question number display
 * - Visual feedback
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, HelpCircle } from 'lucide-react';

interface QuestionDisplayCardProps {
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  timer: number;
  maxTimer: number;
}

export const QuestionDisplayCard: React.FC<QuestionDisplayCardProps> = ({
  questionNumber,
  totalQuestions,
  questionText,
  timer,
  maxTimer
}) => {
  const timerPercentage = (timer / maxTimer) * 100;
  const isLowTime = timer <= 3;

  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      key={questionNumber}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-purple-300" />
          <span className="text-white font-bold text-lg">
            Question {questionNumber}/{totalQuestions}
          </span>
        </div>

        {/* Timer */}
        <motion.div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg ${
            isLowTime
              ? 'glass-game-warning text-white'
              : 'glass-game text-white'
          }`}
          animate={isLowTime ? {
            scale: [1, 1.1, 1],
          } : {}}
          transition={isLowTime ? {
            duration: 0.5,
            repeat: Infinity
          } : {}}
        >
          <Clock className="w-5 h-5" />
          <span>{timer}s</span>
        </motion.div>
      </div>

      {/* Question Text */}
      <motion.div
        className="glass-subtle p-6 rounded-xl"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <p className="text-white text-2xl font-semibold text-center leading-relaxed">
          {questionText}
        </p>
      </motion.div>

      {/* Timer Progress Bar */}
      <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${
            isLowTime
              ? 'bg-gradient-to-r from-red-500 to-orange-500'
              : 'bg-gradient-to-r from-green-500 to-emerald-500'
          }`}
          initial={{ width: '100%' }}
          animate={{ width: `${timerPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Instruction */}
      <p className="text-white/70 text-center text-sm mt-3">
        Click the correct career on your bingo card!
      </p>
    </motion.div>
  );
};

export default QuestionDisplayCard;
