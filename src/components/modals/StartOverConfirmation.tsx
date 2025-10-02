/**
 * StartOverConfirmation Component
 *
 * Educational confirmation dialog for session restart
 * Features:
 * - Progress loss visualization
 * - Smart recommendations
 * - Time investment display
 * - Alternative path suggestions
 * - Animated warnings
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Clock, Target, TrendingUp, X, CheckCircle, Sparkles } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useThemeContext } from '../../contexts/ThemeContext';
import { azureAudioService } from '../../services/azureAudioService';
import { SCRIPT_IDS } from '../../constants/scriptRegistry';
import '../../design-system/index.css';

interface StartOverConfirmationProps {
  session: any;
  onConfirm: () => void;
  onCancel: () => void;
  onChangeSelections?: () => void;
}

export const StartOverConfirmation: React.FC<StartOverConfirmationProps> = ({
  session,
  onConfirm,
  onCancel,
  onChangeSelections
}) => {
  const { user } = useAuthContext();
  const { theme } = useThemeContext();
  const [isConfirming, setIsConfirming] = useState(false);
  const [narrationComplete, setNarrationComplete] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const hasPlayedNarration = useRef(false);

  // Get user's grade level for age-appropriate language
  const gradeLevel = user?.grade_level || 'K';

  // Helper function for age-appropriate text
  const getAgeAppropriateText = (textKey: string): string => {
    const gradeNum = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);

    const texts: Record<string, Record<string, string>> = {
      title: {
        'K': 'New game?',
        '1-2': 'Start a new game?',
        '3-5': 'Start over with new choice?',
        '6-8': 'Are you sure you want to start over?',
        '9-12': 'Confirm: Start New Learning Path?'
      },
      warning: {
        'K': 'Your stars go away.',
        '1-2': 'You will lose your stars.',
        '3-5': 'Your progress will be lost.',
        '6-8': 'All your progress will be reset.',
        '9-12': 'All progress and achievements will be permanently lost.'
      },
      keepGoing: {
        'K': 'Keep playing!',
        '1-2': 'Keep going!',
        '3-5': 'Continue my adventure',
        '6-8': 'Continue my current path',
        '9-12': 'Continue with current progress'
      },
      startNew: {
        'K': 'New game',
        '1-2': 'Start new',
        '3-5': 'Start fresh',
        '6-8': 'Start over',
        '9-12': 'Begin new path'
      },
      timeSpent: {
        'K': 'You played:',
        '1-2': 'Time played:',
        '3-5': 'Time invested:',
        '6-8': 'Learning time:',
        '9-12': 'Time invested in learning:'
      }
    };

    // Determine which grade range to use
    let gradeKey = 'K';
    if (gradeNum === 0) gradeKey = 'K';
    else if (gradeNum <= 2) gradeKey = '1-2';
    else if (gradeNum <= 5) gradeKey = '3-5';
    else if (gradeNum <= 8) gradeKey = '6-8';
    else gradeKey = '9-12';

    return texts[textKey]?.[gradeKey] || texts[textKey]?.['3-5'] || '';
  };

  // Calculate what will be lost
  const calculateLostProgress = () => {
    const progress = session.container_progress?.learn || {};
    const completed = Object.values(progress).filter((s: any) => s.completed).length;
    const totalTime = Object.values(progress).reduce((acc: number, s: any) =>
      acc + (s.time_spent || 0), 0);

    // Calculate scores achieved
    const scores = Object.values(progress)
      .filter((s: any) => s.completed)
      .map((s: any) => s.score || 0);
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    return {
      subjectsCompleted: completed,
      timeSpent: Math.round(totalTime / 60), // Convert to minutes
      percentComplete: Math.round((completed / 4) * 100),
      averageScore,
      hasHighScores: scores.some(score => score >= 90)
    };
  };

  const {
    subjectsCompleted,
    timeSpent,
    percentComplete,
    averageScore,
    hasHighScores
  } = calculateLostProgress();

  const remainingSubjects = 4 - subjectsCompleted;
  const estimatedTimeToComplete = remainingSubjects * 30; // 30 mins per subject estimate

  // Get subject names that were completed
  const getCompletedSubjects = () => {
    const progress = session.container_progress?.learn || {};
    return Object.entries(progress)
      .filter(([_, data]: [string, any]) => data.completed)
      .map(([subject, _]) => subject.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()));
  };

  const completedSubjects = getCompletedSubjects();

  const handleConfirmStart = () => {
    // Stop any playing narration
    azureAudioService.stop();
    setIsAudioPlaying(false);
    console.log('📊 Narration interrupted at Confirm Start Over');

    setIsConfirming(true);
    // Add a small delay for animation
    setTimeout(() => {
      onConfirm();
    }, 500);
  };

  const handleCancel = () => {
    // Stop any playing narration
    azureAudioService.stop();
    setIsAudioPlaying(false);
    console.log('📊 Narration interrupted at Cancel');

    // Track if user canceled after hearing warning
    if (narrationComplete) {
      const heardWarningKey = `narration_heeded_warning_${user?.id}`;
      const count = parseInt(localStorage.getItem(heardWarningKey) || '0');
      localStorage.setItem(heardWarningKey, String(count + 1));
    }

    onCancel();
  };

  // Play warning narration when modal appears
  useEffect(() => {
    if (!hasPlayedNarration.current) {
      hasPlayedNarration.current = true;

      // Determine grade-appropriate script ID
      const gradeNum = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);
      let scriptKey = 'startover.warning.';
      if (gradeNum === 0) scriptKey += 'K';
      else if (gradeNum <= 2) scriptKey += '1-2';
      else if (gradeNum <= 5) scriptKey += '3-5';
      else if (gradeNum <= 8) scriptKey += '6-8';
      else scriptKey += '9-12';

      const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'friend';
      // Get companion ID from nested structure (same logic as avatar display)
      const companionId = session.companion?.id ||
                         session.companion_id ||
                         session.companion?.name?.toLowerCase() ||
                         session.companion_name?.toLowerCase() ||
                         'finn';

      console.log('🎤 StartOver warning narration:', {
        scriptKey,
        companionId,
        gradeLevel,
        firstName
      });

      // Get the script text from scriptRegistry
      const scriptTemplate = SCRIPT_IDS[scriptKey as keyof typeof SCRIPT_IDS];
      if (!scriptTemplate) {
        console.error('Script not found:', scriptKey);
        return;
      }

      // Format the script with variables
      const narrationText = scriptTemplate.replace(/{firstName}/g, firstName);

      console.log('📝 Formatted narration text:', narrationText);

      // Play the warning narration with the companion's voice
      azureAudioService.playText(narrationText, companionId, {
        scriptId: scriptKey,
        variables: {
          firstName
        },
        emotion: 'concerned',
        style: 'gentle',
        onStart: () => {
          console.log('🔊 StartOver warning narration started');
          setIsAudioPlaying(true);
        },
        onEnd: () => {
          console.log('🔊 StartOver warning narration completed');
          setIsAudioPlaying(false);
          setNarrationComplete(true);

          // Track completion
          const completeKey = `narration_complete_startover_${user?.id}`;
          localStorage.setItem(completeKey, new Date().toISOString());
        }
      });
    }
  }, [gradeLevel, user, session]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop - no onClick to prevent accidental cancellation */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('🖱️ StartOver backdrop clicked - ignoring to prevent accidental cancellation');
            console.log('💡 User must explicitly click Cancel or Start Fresh buttons');
            // Don't close on backdrop click - prevents accidental navigation
            // handleCancel(); // Disabled to prevent backdrop click issues
          }}
        />

        {/* Modal Content */}
        <motion.div
          className="relative max-w-lg w-full mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", damping: 20 }}
        >
          {/* Close Button */}
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Warning Header with Companion Avatar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full"
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                >
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getAgeAppropriateText('title')}
                </h2>
              </div>

              {/* Companion Avatar with Speaking Animation */}
              <motion.div
                className="relative w-16 h-16"
                animate={isAudioPlaying ? {
                  y: [0, -4, 0],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Speaking Animation Rings */}
                {isAudioPlaying ? (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border-3 border-red-400"
                      animate={{
                        scale: [1, 1.4, 1.4],
                        opacity: [0.8, 0, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-red-300"
                      animate={{
                        scale: [1, 1.3, 1.3],
                        opacity: [0.6, 0, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: 0.2
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-red-200"
                      animate={{
                        scale: [1, 1.2, 1.2],
                        opacity: [0.4, 0, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: 0.4
                      }}
                    />
                  </>
                ) : (
                  /* Idle State Border */
                  <div className="absolute inset-0 rounded-full border-2 border-red-200 dark:border-red-800" />
                )}

                {/* Companion Avatar */}
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-lg overflow-hidden">
                  {(() => {
                    // Get companion ID from nested structure (same as WelcomeBackModal)
                    const companionId = session.companion?.id ||
                                       session.companion_id ||
                                       session.companion?.name?.toLowerCase() ||
                                       session.companion_name?.toLowerCase();

                    if (companionId && ['finn', 'sage', 'harmony', 'spark'].includes(companionId)) {
                      return (
                        <img
                          src={`/images/companions/${companionId}-${theme || 'dark'}.png`}
                          alt={session.companion?.name || session.companion_name || companionId}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            // Show emoji fallback if image fails
                            const fallbackSpan = document.createElement('span');
                            fallbackSpan.className = 'text-2xl';
                            fallbackSpan.textContent = '🎓';
                            target.parentElement?.appendChild(fallbackSpan);
                          }}
                        />
                      );
                    } else {
                      return (
                        <span className="text-2xl">
                          {companionId === 'pat' ? '🧭' : '🎓'}
                        </span>
                      );
                    }
                  })()}
                </div>

                {/* Speaking Indicator */}
                {isAudioPlaying && (
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                    }}
                  />
                )}
              </motion.div>
            </div>

            {/* Current Progress Card */}
            <motion.div
              className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                You've completed{' '}
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {subjectsCompleted} of 4 subjects ({percentComplete}%)
                </span>{' '}
                as a{' '}
                <span className="font-semibold">{session.career_name}</span> with{' '}
                <span className="font-semibold">{session.companion_name}</span>
              </p>

              {/* Progress Stats */}
              <div className="grid grid-cols-3 gap-3 mt-3">
                {/* Time Invested */}
                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <Clock className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Time Invested</p>
                    <p className="font-bold text-purple-600 dark:text-purple-400">
                      {timeSpent} min
                    </p>
                  </div>
                </motion.div>

                {/* Average Score */}
                {averageScore > 0 && (
                  <motion.div
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Target className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Avg Score</p>
                      <p className="font-bold text-green-600 dark:text-green-400">
                        {averageScore}%
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Progress */}
                <motion.div
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400">
                      {percentComplete}%
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Completed Subjects List */}
              {completedSubjects.length > 0 && (
                <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Completed Subjects:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {completedSubjects.map((subject, index) => (
                      <motion.span
                        key={subject}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        ✓ {subject}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Smart Suggestion */}
            <motion.div
              className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-start space-x-3">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Target className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                </motion.div>
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                    💡 Did you know?
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Once you complete Learn (just{' '}
                    <span className="font-bold">{remainingSubjects} subject{remainingSubjects !== 1 ? 's' : ''}</span>{' '}
                    left!), you can switch to ANY career for Experience and Discover.
                    Many students learn fundamentals with one career then explore applications with different careers!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Options with Visual Impact */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Your Options:
              </h3>

              <div className="space-y-3">
                {/* Option 1: Finish Current */}
                <motion.div
                  className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Finish Learn as {session.career_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        ~{estimatedTimeToComplete} minutes remaining
                      </span>
                      {' → Then choose NEW career for Experience & Discover'}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {getAgeAppropriateText('keepGoing')}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Option 2: Start Over */}
                <motion.div
                  className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Start Over with new career
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {getAgeAppropriateText('warning')}
                      </span>
                      {' → Begin Learn from scratch'}
                    </p>
                    {hasHighScores && (
                      <div className="flex items-center space-x-2 mt-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-orange-600 dark:text-orange-400">
                          You'll lose high scores achieved!
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Visual Progress Loss Warning */}
            {percentComplete > 0 && (
              <motion.div
                className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Progress that will be lost:
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-400 to-red-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentComplete}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <motion.button
                onClick={handleCancel}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Continue Journey</span>
                </span>
              </motion.button>

              {onChangeSelections && (
                <motion.button
                  onClick={onChangeSelections}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="flex items-center justify-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Change Selections</span>
                  </span>
                </motion.button>
              )}

              <motion.button
                onClick={handleConfirmStart}
                disabled={isConfirming}
                className="py-3 px-6 bg-white dark:bg-gray-800 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                whileHover={{ scale: isConfirming ? 1 : 1.02 }}
                whileTap={{ scale: isConfirming ? 1 : 0.98 }}
              >
                {isConfirming ? (
                  <span className="flex items-center justify-center space-x-2">
                    <motion.div
                      className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <span>Starting Over...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Start Over</span>
                  </span>
                )}
              </motion.button>
            </div>

            {/* Final Tip */}
            <motion.p
              className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Tip: Most students complete Learn in one career, then explore different careers in Experience & Discover!
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};