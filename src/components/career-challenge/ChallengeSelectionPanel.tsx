/**
 * Challenge Selection Panel
 * Interactive interface for selecting challenges during gameplay
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Clock,
  Star,
  Users,
  TrendingUp,
  Award,
  Zap,
  AlertCircle,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { Challenge } from '../../types/CareerChallengeTypes';

interface ChallengeSelectionPanelProps {
  challenges: Challenge[];
  isMyTurn: boolean;
  onSelectChallenge: (challengeId: string) => void;
  selectedChallengeId: string | null;
  industryColorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const ChallengeSelectionPanel: React.FC<ChallengeSelectionPanelProps> = ({
  challenges,
  isMyTurn,
  onSelectChallenge,
  selectedChallengeId,
  industryColorScheme = {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#60A5FA'
  }
}) => {
  const [hoveredChallenge, setHoveredChallenge] = useState<string | null>(null);

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'from-green-400 to-green-600';
      case 'medium':
        return 'from-yellow-400 to-orange-500';
      case 'hard':
        return 'from-orange-500 to-red-500';
      case 'expert':
        return 'from-red-500 to-purple-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      'Team Management': Users,
      'Finance': TrendingUp,
      'Strategy': Target,
      'Innovation': Sparkles,
      'Leadership': Award,
      'Technology': Zap,
    };
    return iconMap[category] || Target;
  };

  if (!isMyTurn) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl p-6 text-center">
        <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400 animate-pulse" />
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Waiting for current player to select a challenge...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-600" />
          Select Your Challenge
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Choose wisely - {challenges.length} available
        </div>
      </div>

      <div className="grid gap-4">
        <AnimatePresence>
          {challenges.map((challenge, index) => {
            const CategoryIcon = getCategoryIcon(challenge.category);
            const isSelected = selectedChallengeId === challenge.id;
            const isHovered = hoveredChallenge === challenge.id;

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectChallenge(challenge.id)}
                onMouseEnter={() => setHoveredChallenge(challenge.id)}
                onMouseLeave={() => setHoveredChallenge(null)}
                className={`
                  relative cursor-pointer rounded-xl p-5 transition-all
                  ${isSelected
                    ? 'ring-3 ring-purple-500 shadow-xl bg-white dark:bg-gray-800'
                    : 'bg-white dark:bg-gray-800 hover:shadow-lg border-2 border-transparent hover:border-purple-500/50'
                  }
                `}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${industryColorScheme.primary}10, ${industryColorScheme.secondary}10)`
                    : undefined
                }}
              >
                <div className="flex gap-4">
                  {/* Challenge Icon/Difficulty */}
                  <div className="flex-shrink-0">
                    <div className={`
                      w-14 h-14 rounded-xl flex items-center justify-center
                      bg-gradient-to-br ${getDifficultyColor(challenge.difficulty)}
                    `}>
                      <CategoryIcon className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  {/* Challenge Content */}
                  <div className="flex-1 space-y-2">
                    {/* Title and Category */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-lg leading-tight">
                          {challenge.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-medium px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg">
                            {challenge.category}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {challenge.difficulty}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-purple-600"
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </motion.div>
                      )}
                    </div>

                    {/* Scenario Text */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {challenge.scenarioText}
                    </p>

                    {/* Challenge Stats */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {challenge.minRolesRequired}-{challenge.maxRolesAllowed} roles
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {challenge.basePoints} base pts
                        </span>
                      </div>
                      {challenge.time_pressure_level && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-orange-400" />
                          <span className="text-orange-600 dark:text-orange-400">
                            Time: {challenge.time_pressure_level}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expanded Details (on hover) */}
                    <AnimatePresence>
                      {isHovered && challenge.recommended_roles && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-2 border-t border-gray-200 dark:border-gray-700"
                        >
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            <strong>Recommended roles:</strong> {challenge.recommended_roles.join(', ')}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Selection Arrow */}
                  <div className="flex items-center">
                    <ChevronRight className={`
                      w-6 h-6 transition-all
                      ${isSelected
                        ? 'text-purple-600 translate-x-1'
                        : 'text-gray-400'
                      }
                    `} />
                  </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="selection-indicator"
                    className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-purple-600 rounded-r-full"
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Helper Text */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Consider your available role cards and their synergies when selecting a challenge.
          Higher difficulty challenges offer more points but require stronger teams.
        </p>
      </div>
    </div>
  );
};

export default ChallengeSelectionPanel;