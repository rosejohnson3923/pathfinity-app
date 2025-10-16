/**
 * Challenge Card Component
 *
 * Displays a challenge scenario with flip animation and interactive elements
 * Used in Career Challenge game mode
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Target,
  Users,
  Clock,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import type { Challenge, Industry } from '../../types/CareerChallengeTypes';

interface ChallengeCardProps {
  challenge: Challenge;
  industry: Industry;
  isRevealed?: boolean;
  isActive?: boolean;
  onReveal?: () => void;
  showStats?: boolean;
  compact?: boolean;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  industry,
  isRevealed = false,
  isActive = false,
  onReveal,
  showStats = false,
  compact = false
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    if (!isRevealed && onReveal) {
      onReveal();
    }
    setIsFlipped(!isFlipped);
  };

  // Determine difficulty color
  const difficultyColors = {
    easy: 'from-green-400 to-green-600',
    medium: 'from-yellow-400 to-yellow-600',
    hard: 'from-orange-400 to-red-600',
    expert: 'from-purple-600 to-pink-600'
  };

  const difficultyGradient = difficultyColors[challenge.difficulty];

  // Card size based on compact mode
  const cardSize = compact ? 'h-64 w-48' : 'h-96 w-72';

  return (
    <div className={`${cardSize} perspective-1000 cursor-pointer`}>
      <motion.div
        className="relative w-full h-full transform-style-preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        onClick={handleFlip}
        whileHover={{ scale: compact ? 1.02 : 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Card Back (Hidden State) */}
        <div className="absolute inset-0 backface-hidden">
          <motion.div
            className={`
              w-full h-full rounded-2xl
              bg-gradient-to-br ${industry.colorScheme?.primary || 'from-indigo-600'} ${industry.colorScheme?.secondary || 'to-purple-700'}
              shadow-2xl border-2 border-white/20
              flex flex-col items-center justify-center
              relative overflow-hidden
            `}
            animate={isActive ? {
              boxShadow: [
                '0 0 20px rgba(147, 51, 234, 0.3)',
                '0 0 40px rgba(147, 51, 234, 0.5)',
                '0 0 20px rgba(147, 51, 234, 0.3)'
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(255,255,255,0.1) 10px,
                    rgba(255,255,255,0.1) 20px
                  )`
                }}
              />
            </div>

            {/* Industry Icon */}
            <div className="text-6xl mb-4 animate-pulse">
              {industry.icon}
            </div>

            {/* Card Title */}
            <h3 className="text-white font-bold text-xl text-center px-4">
              CHALLENGE
            </h3>

            {/* Category Badge */}
            <div className="mt-4 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
              <span className="text-white/90 text-sm font-medium">
                {challenge.category}
              </span>
            </div>

            {/* Difficulty Indicator */}
            <div className="absolute bottom-4 left-4">
              <div className="flex gap-1">
                {[...Array(challenge.difficulty === 'easy' ? 1 :
                             challenge.difficulty === 'medium' ? 2 :
                             challenge.difficulty === 'hard' ? 3 : 4)].map((_, i) => (
                  <Zap key={i} className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                ))}
              </div>
            </div>

            {/* Card Number */}
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {challenge.challengeNumber || '?'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Card Front (Revealed State) */}
        <div className="absolute inset-0 rotate-y-180 backface-hidden">
          <div className={`
            w-full h-full rounded-2xl bg-white dark:bg-gray-900
            shadow-2xl border-2 border-gray-200 dark:border-gray-700
            flex flex-col ${compact ? 'p-3' : 'p-4'}
            relative overflow-hidden
          `}>
            {/* Difficulty Banner */}
            <div className={`
              absolute top-0 left-0 right-0 h-2
              bg-gradient-to-r ${difficultyGradient}
            `} />

            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className={`font-bold text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-lg'}`}>
                  {challenge.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-gray-500 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                    {industry.name}
                  </span>
                </div>
              </div>
              <div className="text-2xl">
                {industry.icon}
              </div>
            </div>

            {/* Scenario Text */}
            <div className={`
              flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg
              ${compact ? 'p-2 mb-2' : 'p-3 mb-3'}
              relative overflow-y-auto
            `}>
              <p className={`text-gray-700 dark:text-gray-300 ${compact ? 'text-xs' : 'text-sm'}`}>
                {challenge.scenarioText}
              </p>

              {/* Alert for critical challenges */}
              {challenge.timePressureLevel >= 4 && (
                <div className="flex items-center gap-1 mt-2 text-orange-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs font-medium">Time Critical!</span>
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className={`grid grid-cols-2 gap-2 ${compact ? 'mb-2' : 'mb-3'}`}>
              <div className="flex items-center gap-1">
                <Users className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
                <span className={`text-gray-600 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                  {challenge.minRolesRequired}-{challenge.maxRolesAllowed} roles
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Target className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
                <span className={`text-gray-600 dark:text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
                  {challenge.baseDifficultyScore} pts
                </span>
              </div>
            </div>

            {/* Score Thresholds */}
            <div className={`
              bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700
              rounded-lg ${compact ? 'p-2' : 'p-3'}
            `}>
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400`}>
                    Fail
                  </div>
                  <div className={`font-bold text-red-600 ${compact ? 'text-sm' : 'text-base'}`}>
                    &lt;{challenge.failureThreshold}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400`}>
                    Pass
                  </div>
                  <div className={`font-bold text-green-600 ${compact ? 'text-sm' : 'text-base'}`}>
                    {challenge.baseDifficultyScore}+
                  </div>
                </div>
                <div className="text-center">
                  <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500 dark:text-gray-400`}>
                    Perfect
                  </div>
                  <div className={`font-bold text-purple-600 ${compact ? 'text-sm' : 'text-base'}`}>
                    {challenge.perfectScore}+
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics (Optional) */}
            {showStats && !compact && challenge.successRate && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Success Rate: {challenge.successRate}%</span>
                  <span>Played: {challenge.timesPresented}x</span>
                </div>
              </div>
            )}

            {/* Recommended Roles (if any) */}
            {challenge.recommendedRoles && challenge.recommendedRoles.length > 0 && !compact && (
              <div className="mt-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Recommended:
                </div>
                <div className="flex flex-wrap gap-1">
                  {challenge.recommendedRoles.slice(0, 3).map(role => (
                    <span
                      key={role}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * Challenge Card Stack
 * Shows multiple challenge cards in a stack formation
 */
export const ChallengeCardStack: React.FC<{
  challenges: Challenge[];
  industry: Industry;
  currentIndex: number;
  onCardSelect?: (index: number) => void;
}> = ({ challenges, industry, currentIndex, onCardSelect }) => {
  return (
    <div className="relative h-96 w-72">
      <AnimatePresence>
        {challenges.slice(0, 3).map((challenge, index) => {
          const isTop = index === 0;
          const offset = index * 10;

          return (
            <motion.div
              key={challenge.id}
              className="absolute"
              initial={{ x: 0, y: 0, scale: 1 }}
              animate={{
                x: offset,
                y: offset,
                scale: 1 - (index * 0.05),
                zIndex: 3 - index
              }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <ChallengeCard
                challenge={challenge}
                industry={industry}
                isActive={isTop}
                onReveal={() => onCardSelect?.(currentIndex + index)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ChallengeCard;