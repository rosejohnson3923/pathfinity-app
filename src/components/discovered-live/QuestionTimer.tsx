/**
 * Question Timer Component
 * Displays countdown timer for Discovered Live! multiplayer questions
 *
 * Features:
 * - Visual countdown with color coding
 * - Animations when time is running low
 * - Circular progress indicator
 * - Audio-ready for sound effects
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';

export interface QuestionTimerProps {
  timeRemaining: number;
  totalTime: number;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

/**
 * QuestionTimer Component
 */
export const QuestionTimer: React.FC<QuestionTimerProps> = ({
  timeRemaining,
  totalTime,
  size = 'medium',
  showProgress = true,
}) => {
  // Calculate percentage remaining
  const percentageRemaining = (timeRemaining / totalTime) * 100;

  // Determine color based on time remaining
  const getColorClasses = () => {
    if (timeRemaining > totalTime * 0.5) {
      return {
        bg: 'bg-green-500',
        border: 'border-green-300',
        text: 'text-green-700 dark:text-green-300',
        glow: 'bg-green-400',
        ring: 'ring-green-300',
      };
    } else if (timeRemaining > totalTime * 0.2) {
      return {
        bg: 'bg-yellow-500',
        border: 'border-yellow-300',
        text: 'text-yellow-700 dark:text-yellow-300',
        glow: 'bg-yellow-400',
        ring: 'ring-yellow-300',
      };
    } else {
      return {
        bg: 'bg-red-500',
        border: 'border-red-300',
        text: 'text-red-700 dark:text-red-300',
        glow: 'bg-red-400',
        ring: 'ring-red-300',
      };
    }
  };

  // Size configurations
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'w-16 h-16',
          text: 'text-2xl',
          label: 'text-[8px]',
          icon: 'w-3 h-3',
        };
      case 'large':
        return {
          container: 'w-32 h-32',
          text: 'text-6xl',
          label: 'text-sm',
          icon: 'w-8 h-8',
        };
      default: // medium
        return {
          container: 'w-24 h-24',
          text: 'text-4xl',
          label: 'text-xs',
          icon: 'w-5 h-5',
        };
    }
  };

  const colors = getColorClasses();
  const sizes = getSizeClasses();
  const isCritical = timeRemaining <= totalTime * 0.2;
  const isWarning = timeRemaining <= totalTime * 0.5 && timeRemaining > totalTime * 0.2;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Circular Timer */}
      <motion.div
        animate={
          isCritical
            ? {
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0],
              }
            : {}
        }
        transition={{
          duration: 0.5,
          repeat: isCritical ? Infinity : 0,
        }}
        className="relative"
      >
        {/* Background glow */}
        {isCritical && (
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className={`absolute inset-0 ${colors.glow} rounded-full blur-xl -z-10`}
          />
        )}

        {/* Circular Progress Background */}
        {showProgress && (
          <svg
            className={`absolute inset-0 ${sizes.container}`}
            style={{ transform: 'rotate(-90deg)' }}
          >
            {/* Background circle */}
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className={colors.text}
              initial={{ strokeDasharray: '283 283', strokeDashoffset: 0 }}
              animate={{
                strokeDashoffset: 283 - (283 * percentageRemaining) / 100,
              }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </svg>
        )}

        {/* Timer Display */}
        <div
          className={`
            ${sizes.container} rounded-full flex flex-col items-center justify-center
            ${colors.bg} border-4 ${colors.border} shadow-2xl
            relative z-10
          `}
        >
          {/* Icon */}
          {isCritical ? (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              <Zap className={`${sizes.icon} text-white mb-1`} />
            </motion.div>
          ) : (
            <Clock className={`${sizes.icon} text-white mb-1`} />
          )}

          {/* Time */}
          <p className={`${sizes.text} font-black text-white leading-none`}>
            {timeRemaining}
          </p>

          {/* Label */}
          <p className={`${sizes.label} font-bold text-white/90 uppercase tracking-wider mt-1`}>
            {timeRemaining === 1 ? 'sec' : 'secs'}
          </p>
        </div>
      </motion.div>

      {/* Warning Pulse Ring */}
      {isWarning && (
        <motion.div
          animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className={`absolute inset-0 rounded-full border-4 ${colors.border}`}
        />
      )}

      {/* Critical Pulse Rings */}
      {isCritical && (
        <>
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className={`absolute inset-0 rounded-full border-4 ${colors.border}`}
          />
          <motion.div
            animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
            className={`absolute inset-0 rounded-full border-4 ${colors.border}`}
          />
        </>
      )}
    </div>
  );
};

/**
 * Simple Linear Timer Bar
 * Alternative timer display as a progress bar
 */
export const QuestionTimerBar: React.FC<QuestionTimerProps> = ({
  timeRemaining,
  totalTime,
}) => {
  const percentageRemaining = (timeRemaining / totalTime) * 100;
  const isCritical = timeRemaining <= totalTime * 0.2;

  const getBarColor = () => {
    if (timeRemaining > totalTime * 0.5) return 'bg-green-500';
    if (timeRemaining > totalTime * 0.2) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      {/* Time Display */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
            Time Remaining
          </p>
        </div>
        <motion.p
          animate={isCritical ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: isCritical ? Infinity : 0 }}
          className={`text-2xl font-black ${
            isCritical
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-900 dark:text-white'
          }`}
        >
          {timeRemaining}s
        </motion.p>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${percentageRemaining}%` }}
          transition={{ duration: 1, ease: 'linear' }}
          className={`h-full ${getBarColor()} relative`}
        >
          {/* Shine effect */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>

        {/* Pulse effect when critical */}
        {isCritical && (
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute inset-0 bg-red-400"
          />
        )}
      </div>
    </div>
  );
};

export default QuestionTimer;
