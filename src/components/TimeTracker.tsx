// ================================================================
// TIME TRACKER COMPONENT
// Displays 4-hour daily learning progress and milestones
// ================================================================

import React, { useState, useEffect } from 'react';
import { Clock, Target, Star, TrendingUp, Award } from 'lucide-react';
import { DailyTimeBudget } from '../types/LearningTypes';
import { timeBudgetService } from '../services/timeBudgetService';

interface TimeTrackerProps {
  studentId: string;
  isVisible?: boolean;
  onExtensionRequest?: () => void;
  variant?: 'compact' | 'expanded'; // New prop for layout variant
}

export const TimeTracker: React.FC<TimeTrackerProps> = ({
  studentId,
  isVisible = true,
  onExtensionRequest,
  variant = 'compact'
}) => {
  const [budget, setBudget] = useState<DailyTimeBudget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const loadBudget = async () => {
      try {
        const todaysBudget = await timeBudgetService.getTodaysBudget(studentId);
        setBudget(todaysBudget);
      } catch (error) {
        console.error('Error loading time budget:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBudget();

    // Refresh budget every minute
    const interval = setInterval(loadBudget, 60000);
    return () => clearInterval(interval);
  }, [studentId]);

  if (!isVisible || isLoading || !budget) {
    return null;
  }

  const summary = timeBudgetService.getBudgetSummary(budget);
  const extensionOpportunity = timeBudgetService.shouldOfferExtension(budget);

  // Calculate progress relative to 4-hour target
  const targetProgress = Math.min(100, (budget.baselineBudget.usedMinutes / budget.baselineBudget.targetMinutes) * 100);
  const isOverTarget = budget.baselineBudget.usedMinutes > budget.baselineBudget.targetMinutes;
  const isComplete = budget.baselineBudget.curriculumComplete;

  // Color scheme based on curriculum completion and target adherence
  const getProgressColor = () => {
    if (isComplete && !isOverTarget) return 'from-green-500 to-emerald-600'; // Completed on target
    if (isComplete && isOverTarget) return 'from-yellow-500 to-orange-600';  // Completed but over target
    if (isOverTarget && !isComplete) return 'from-red-500 to-pink-600';       // Over target, still working
    if (targetProgress >= 75) return 'from-blue-500 to-indigo-600';           // On track
    return 'from-purple-500 to-blue-600';                                     // Just started
  };

  const getProgressTextColor = () => {
    if (isComplete && !isOverTarget) return 'text-green-600 dark:text-green-400';
    if (isComplete && isOverTarget) return 'text-yellow-600 dark:text-yellow-400';
    if (isOverTarget && !isComplete) return 'text-red-600 dark:text-red-400';
    if (targetProgress >= 75) return 'text-blue-600 dark:text-blue-400';
    return 'text-purple-600 dark:text-purple-400';
  };

  const getStatusText = () => {
    if (isComplete && !isOverTarget) return '✅ On Target';
    if (isComplete && isOverTarget) return '⚠️ Over Target';
    if (isOverTarget && !isComplete) return '🔄 Struggling';
    return '🎯 On Track';
  };

  // Compact horizontal progress bar for top of screen
  if (variant === 'compact') {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Left: Progress info */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                  {budget.baselineBudget.usedMinutes}m / {budget.baselineBudget.targetMinutes}m
                </span>
              </div>
              
              {/* Mini progress bar */}
              <div className="w-20 md:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500`}
                  style={{ width: `${Math.min(100, targetProgress)}%` }}
                />
              </div>
              
              <div className={`text-xs font-medium ${getProgressTextColor()} hidden sm:block`}>
                {getStatusText()}
              </div>
            </div>

            {/* Right: Container breakdown and expand button */}
            <div className="flex items-center space-x-4">
              {/* Container mini indicators */}
              <div className="hidden md:flex items-center space-x-2 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">{budget.containerTime.learn}m</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">{budget.containerTime.experience}m</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">{budget.containerTime.discover}m</span>
                </div>
              </div>

              {/* Expand button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
              >
                <span className="text-gray-700 dark:text-gray-300">Details</span>
                <svg 
                  className={`w-3 h-3 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Expanded details dropdown */}
          {isExpanded && (
            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Progress Details */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Progress Details</h4>
                  {isComplete ? (
                    <div className={`flex items-center p-2 rounded-lg ${
                      isOverTarget 
                        ? 'bg-yellow-50 dark:bg-yellow-900/20' 
                        : 'bg-green-50 dark:bg-green-900/20'
                    }`}>
                      <Award className={`w-4 h-4 mr-2 ${
                        isOverTarget ? 'text-yellow-500' : 'text-green-500'
                      }`} />
                      <span className={`text-xs font-medium ${
                        isOverTarget 
                          ? 'text-yellow-700 dark:text-yellow-300' 
                          : 'text-green-700 dark:text-green-300'
                      }`}>
                        {isOverTarget 
                          ? `Complete! (+${budget.baselineBudget.overTargetMinutes}m over)`
                          : 'Complete On Target! 🎉'
                        }
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Target Progress</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {Math.round(targetProgress)}%
                        </span>
                      </div>
                      {isOverTarget && (
                        <div className="text-xs text-orange-600 dark:text-orange-400">
                          +{budget.baselineBudget.overTargetMinutes}m over target
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Container Breakdown */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Learning Containers</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <div className="font-semibold text-blue-600 dark:text-blue-400">
                        {budget.containerTime.learn}m
                      </div>
                      <div className="text-blue-500 dark:text-blue-400">Learn</div>
                    </div>
                    
                    <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <div className="font-semibold text-purple-600 dark:text-purple-400">
                        {budget.containerTime.experience}m
                      </div>
                      <div className="text-purple-500 dark:text-purple-400">Experience</div>
                    </div>
                    
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        {budget.containerTime.discover}m
                      </div>
                      <div className="text-green-500 dark:text-green-400">Discover</div>
                    </div>
                  </div>
                </div>

                {/* Stats and Actions */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Today's Stats</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <TrendingUp className="w-3 h-3 text-blue-500 mr-1" />
                        <span className="text-gray-500 dark:text-gray-400">Efficiency</span>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {budget.efficiencyScore}%
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="w-3 h-3 text-purple-500 mr-1" />
                        <span className="text-gray-500 dark:text-gray-400">Engagement</span>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {budget.engagementScore}%
                      </div>
                    </div>
                  </div>

                  {/* Extension Opportunity */}
                  {extensionOpportunity.shouldOffer && onExtensionRequest && (
                    <button
                      onClick={onExtensionRequest}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 px-3 rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 text-xs"
                    >
                      <Star className="w-3 h-3" />
                      <span>Continue Adventure?</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Extension Sessions */}
              {budget.extensions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Extension Sessions ({budget.extensions.reduce((sum, ext) => sum + ext.duration, 0)}m total)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {budget.extensions.map((ext, index) => (
                      <div key={ext.sessionId} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-xs">
                        <span className="text-purple-700 dark:text-purple-300 capitalize">
                          {ext.extensionType.replace('-', ' ')}: {ext.duration}m
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Milestone Message */}
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {summary.nextMilestone}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Legacy expanded view (keep for backward compatibility)
  return (
    <div className="fixed top-4 left-4 z-40 max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        {/* All the original content stays the same for expanded variant */}
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Today's Progress</h3>
          </div>
          <div className={`text-sm font-medium ${getProgressTextColor()}`}>
            {getStatusText()}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>{isComplete ? 'Curriculum Complete' : 'Curriculum Progress'}</span>
            <span>{budget.baselineBudget.usedMinutes}m / {budget.baselineBudget.targetMinutes}m target</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500`}
              style={{ width: `${Math.min(100, targetProgress)}%` }}
            />
          </div>
          {isOverTarget && (
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              +{budget.baselineBudget.overTargetMinutes}m over target (learning takes time!)
            </div>
          )}
        </div>

        {/* Rest of the original content for backward compatibility */}
        {!isComplete ? (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isOverTarget ? 'Keep Going!' : 'Target Progress'}
              </span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {isOverTarget ? 'Taking needed time' : `${Math.round(targetProgress)}%`}
            </span>
          </div>
        ) : (
          <div className={`flex items-center justify-center mb-3 p-2 rounded-lg ${
            isOverTarget 
              ? 'bg-yellow-50 dark:bg-yellow-900/20' 
              : 'bg-green-50 dark:bg-green-900/20'
          }`}>
            <Award className={`w-5 h-5 mr-2 ${
              isOverTarget ? 'text-yellow-500' : 'text-green-500'
            }`} />
            <span className={`text-sm font-medium ${
              isOverTarget 
                ? 'text-yellow-700 dark:text-yellow-300' 
                : 'text-green-700 dark:text-green-300'
            }`}>
              {isOverTarget 
                ? `Curriculum Complete! (${budget.baselineBudget.overTargetMinutes}m over target) 💪`
                : 'Curriculum Complete On Target! 🎉'
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTracker;