/**
 * WelcomeBackModal Component
 *
 * Engaging welcome back experience for returning users
 * Features:
 * - Parallax companion avatar
 * - Animated progress bars
 * - Achievement badges
 * - Streak counters
 * - Confetti celebrations
 * - Container-aware choices
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, ArrowRight, RefreshCw, Trophy, Star, Zap, BookOpen, Compass, Telescope, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sessionManager } from '../../services/content/SessionLearningContextManager';
import { useAuthContext } from '../../contexts/AuthContext';
import { useThemeContext } from '../../contexts/ThemeContext';
import { azureAudioService } from '../../services/azureAudioService';
import { SCRIPT_IDS } from '../../constants/scriptRegistry';
import '../../design-system/index.css';

interface WelcomeBackModalProps {
  session: any;
  onContinue: () => void;
  onChooseNew: () => void;
  onClose?: () => void;
}

export const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({
  session,
  onContinue,
  onChooseNew,
  onClose
}) => {
  const { user } = useAuthContext();
  const { theme } = useThemeContext();
  const [showModal, setShowModal] = useState(true);
  const [narrationComplete, setNarrationComplete] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const hasPlayedNarration = useRef(false);

  // Get user's grade level for age-appropriate language
  const gradeLevel = user?.grade_level || 'K';

  // Get companion ID from session
  // The session from SessionLearningContextManager has companion as nested object:
  // session.companion = { id: 'sage', name: 'Sage', personality: 'encouraging', voice: '...' }
  // Priority order:
  // 1. session.companion.id (from SessionLearningContextManager)
  // 2. session.companion_id (if directly from API)
  // 3. Convert companion name to lowercase as fallback
  const companionId = session.companion?.id ||
                      session.companion_id ||
                      session.companion?.name?.toLowerCase() ||
                      session.companion_name?.toLowerCase() ||
                      'finn'; // Default to finn if missing

  // Helper function for age-appropriate text based on grade level
  const getAgeAppropriateText = (textKey: string): string => {
    const gradeNum = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);
    const companionName = session.companion?.name || session.companion_name || 'Your friend';
    const careerName = session.career?.name || session.career?.title || session.career_name || 'Explorer';

    const texts: Record<string, Record<string, string>> = {
      welcomeBack: {
        'K': 'Hi again!',
        '1-2': 'Welcome back, friend!',
        '3-5': 'Welcome back to your adventure!',
        '6-8': 'Welcome back to your learning journey!',
        '9-12': 'Welcome back to continue your educational journey!'
      },
      missedYou: {
        'K': 'We missed you!',
        '1-2': `${companionName} missed you!`,
        '3-5': `${companionName} is happy you're back!`,
        '6-8': `${companionName} has been waiting for you to return!`,
        '9-12': `${companionName} is ready to continue your journey together!`
      },
      readyToContinue: {
        'K': `Be a ${careerName}!`,
        '1-2': `Keep being a ${careerName}!`,
        '3-5': `Ready to keep learning as a ${careerName}?`,
        '6-8': `Ready to continue your ${careerName} journey?`,
        '9-12': `Ready to advance your skills as a ${careerName}?`
      },
      continueButton: {
        'K': 'Play!',
        '1-2': 'Keep Going',
        '3-5': 'Continue Adventure',
        '6-8': 'Continue Your Journey',
        '9-12': 'Continue Your Learning Path'
      },
      newAdventureButton: {
        'K': 'New Game',
        '1-2': 'Try Something New',
        '3-5': 'Start New Adventure',
        '6-8': 'Choose a New Path',
        '9-12': 'Explore a Different Career'
      },
      yourProgress: {
        'K': 'You did it!',
        '1-2': 'Look what you did!',
        '3-5': 'Your awesome progress:',
        '6-8': 'Your learning achievements:',
        '9-12': 'Your academic progress and achievements:'
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

  // Parallax effect for companion avatar
  const avatarX = useTransform(mouseX, [-300, 300], [-10, 10]);
  const avatarY = useTransform(mouseY, [-300, 300], [-10, 10]);

  // Calculate progress with milestone detection
  const calculateProgress = () => {
    const progress = session.container_progress || {};
    const containers = ['learn', 'experience', 'discover'];
    let totalSubjects = 0;
    let completedSubjects = 0;
    let streakCount = 0;
    let lastCompleted = null;

    containers.forEach(container => {
      if (progress[container]) {
        ['math', 'ela', 'science', 'social_studies'].forEach(subject => {
          totalSubjects++;
          if (progress[container][subject]?.completed) {
            completedSubjects++;
            // Simple streak calculation based on consecutive completions
            if (!lastCompleted || progress[container][subject].completed_at > lastCompleted) {
              streakCount++;
              lastCompleted = progress[container][subject].completed_at;
            }
          }
        });
      }
    });

    const percentage = totalSubjects > 0 ? Math.round((completedSubjects / 12) * 100) : 0;
    const milestone =
      percentage >= 75 ? 'champion' :
      percentage >= 50 ? 'explorer' :
      percentage >= 25 ? 'adventurer' :
      'beginner';

    return {
      percentage,
      completedSubjects,
      totalSubjects: 12,
      currentContainer: session.current_container || 'learn',
      currentSubject: session.current_subject || 'math',
      milestone,
      streakCount: Math.min(streakCount, 7) // Cap at 7 for display
    };
  };

  const {
    percentage,
    completedSubjects,
    totalSubjects,
    currentContainer,
    currentSubject,
    milestone,
    streakCount
  } = calculateProgress();

  // Check if in Learn with progress (can't switch careers)
  const isInLearnWithProgress = () => {
    if (currentContainer !== 'learn') return false;
    const learnProgress = session.container_progress?.learn || {};
    return Object.values(learnProgress).some((subj: any) => subj.completed);
  };

  const canSwitchCareer = !isInLearnWithProgress();

  // Trigger celebration for milestones
  useEffect(() => {
    if (percentage > 0 && percentage % 25 === 0) {
      triggerCelebration();
    }
  }, []);

  // Play narration when modal appears
  useEffect(() => {
    if (showModal && !hasPlayedNarration.current) {
      hasPlayedNarration.current = true;

      // Determine grade-appropriate script ID
      const gradeNum = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);
      let scriptKey = 'welcomeback.greeting.';
      if (gradeNum === 0) scriptKey += 'K';
      else if (gradeNum <= 2) scriptKey += '1-2';
      else if (gradeNum <= 5) scriptKey += '3-5';
      else if (gradeNum <= 8) scriptKey += '6-8';
      else scriptKey += '9-12';

      const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'friend';
      const companionName = session.companion?.name || session.companion_name || 'Pat';
      const careerName = session.career?.name || session.career?.title || session.career_name || 'Explorer';

      // Use the companion ID from session (already computed at component level)
      const narratorCompanionId = companionId;

      // Get the script text from scriptRegistry
      const scriptTemplate = SCRIPT_IDS[scriptKey as keyof typeof SCRIPT_IDS];
      if (!scriptTemplate) {
        console.error('Script not found:', scriptKey);
        return;
      }

      // Format the script with variables
      const narrationText = scriptTemplate
        .replace(/{firstName}/g, firstName)
        .replace(/{companionName}/g, companionName)
        .replace(/{careerName}/g, careerName);

      // Play the formatted narration text
      azureAudioService.playText(narrationText, narratorCompanionId, {
        scriptId: scriptKey,
        variables: {
          firstName,
          companionName,
          careerName
        },
        emotion: 'friendly',
        style: 'cheerful',
        onStart: () => {
          setIsAudioPlaying(true);
        },
        onEnd: () => {
          setIsAudioPlaying(false);
          setNarrationComplete(true);

          // Track completion
          const completeKey = `narration_complete_welcomeback_${user?.id}`;
          localStorage.setItem(completeKey, new Date().toISOString());
        }
      });
    }
  }, [showModal, gradeLevel, user, session]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#14b8a6', '#ec4899']
    });
  };

  // Mouse tracking for parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  // Container icons and colors
  const containerConfig = {
    learn: {
      icon: BookOpen,
      color: 'purple',
      gradient: 'from-purple-400 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20'
    },
    experience: {
      icon: Compass,
      color: 'teal',
      gradient: 'from-teal-400 to-teal-600',
      bgGradient: 'from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20'
    },
    discover: {
      icon: Telescope,
      color: 'pink',
      gradient: 'from-pink-400 to-pink-600',
      bgGradient: 'from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20'
    }
  };

  const ContainerIcon = containerConfig[currentContainer as keyof typeof containerConfig]?.icon || BookOpen;
  const containerColor = containerConfig[currentContainer as keyof typeof containerConfig] || containerConfig.learn;

  const handleClose = () => {
    console.log('🚫 WelcomeBack backdrop clicked - preventing close');
    console.log('📊 Current state:', {
      showModal,
      hasOnClose: !!onClose,
      currentView: 'welcomeback'
    });

    // Don't close the modal on backdrop click - force user to choose an option
    // This prevents the blank screen issue
    // If we want to allow closing, the parent needs to pass an onClose handler
    if (onClose) {
      console.log('✅ Calling onClose handler from parent');
      setShowModal(false);
      onClose();
    } else {
      console.log('⚠️ No onClose handler - modal stays open');
      // Don't close the modal if no handler is provided
      // User must click Continue or Start New Adventure
    }
  };

  // Format subject name for display
  const formatSubject = (subject: string) => {
    return subject.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop - clicking does nothing to prevent blank screen */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              console.log('🖱️ Backdrop clicked - ignoring to prevent blank screen');
              console.log('💡 User must click Continue or Start New Adventure buttons');
              // Don't close on backdrop click - prevents blank screen issue
              // handleClose(); // Disabled to prevent blank screen
            }}
          />

          {/* Modal Content */}
          <motion.div
            className="relative max-w-2xl w-full mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, rotateX: -30 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateX: 30 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            onMouseMove={handleMouseMove}
          >
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

            {/* Content */}
            <div className="relative p-8">
              {/* Header Section with Floating Elements */}
              <div className="relative mb-6">
                {/* Floating Achievement Badges */}
                <div className="absolute top-0 right-0 flex space-x-2">
                  {streakCount >= 3 && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", delay: 0.3 }}
                      className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Zap className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                  {percentage >= 50 && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", delay: 0.4 }}
                      className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Star className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                  {percentage >= 75 && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", delay: 0.5 }}
                      className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Trophy className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* Companion Avatar with Parallax */}
                <div className="flex items-center space-x-6">
                  <motion.div
                    className="relative z-10"
                    style={{ x: avatarX, y: avatarY }}
                  >
                    {/* Speaking Animation Rings */}
                    {isAudioPlaying ? (
                      <>
                        {/* Multiple pulsing rings when speaking */}
                        <motion.div
                          className="absolute inset-0 rounded-full border-3 border-purple-400"
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
                          className="absolute inset-0 rounded-full border-2 border-pink-400"
                          animate={{
                            scale: [1, 1.3, 1.3],
                            opacity: [0.6, 0, 0]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: 0.2,
                            ease: "easeOut"
                          }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-purple-300"
                          animate={{
                            scale: [1, 1.2, 1.2],
                            opacity: [0.4, 0, 0]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: 0.4,
                            ease: "easeOut"
                          }}
                        />
                      </>
                    ) : (
                      /* Regular subtle animation when not speaking */
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                          boxShadow: [
                            '0 0 0 0px rgba(168, 85, 247, 0.4)',
                            '0 0 0 20px rgba(168, 85, 247, 0)',
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                    )}

                    {/* Avatar Image */}
                    <motion.div
                      className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl bg-gradient-to-br from-purple-400 to-pink-400"
                      animate={isAudioPlaying ? {
                        y: [0, -5, 0],
                        rotate: [0, 2, -2, 0]
                      } : {}}
                      transition={isAudioPlaying ? {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      } : {}}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <img
                        src={`/images/companions/${companionId}-${theme || 'dark'}.png`}
                        alt={session.companion_name || 'Your Companion'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Fallback to finn if image fails to load
                          target.src = `/images/companions/finn-${theme || 'dark'}.png`;
                          console.error('Failed to load companion image for:', {
                            companion_id: session.companion_id,
                            companion_name: session.companion_name,
                            companion: session.companion,
                            attemptedSrc: target.src
                          });
                        }}
                      />
                    </motion.div>

                    {/* Sparkle Badge */}
                    <motion.div
                      className="absolute -bottom-1 -right-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-1.5 z-20"
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </motion.div>
                  </motion.div>

                  {/* Welcome Text */}
                  <div className="flex-1">
                    <motion.h2
                      className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {getAgeAppropriateText('welcomeBack')}
                    </motion.h2>
                    <motion.p
                      className="text-gray-600 dark:text-gray-400 mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {getAgeAppropriateText('readyToContinue')}
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="space-y-6">
                {/* Milestone Badge */}
                <motion.div
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Journey Progress
                    </span>
                    <motion.span
                      className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full uppercase"
                      whileHover={{ scale: 1.05 }}
                    >
                      {milestone}
                    </motion.span>
                  </div>
                  <motion.span
                    className="text-2xl font-bold text-purple-600 dark:text-purple-400"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 3 }}
                  >
                    {percentage}%
                  </motion.span>
                </motion.div>

                {/* Animated Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                    <motion.div
                      className="h-full relative overflow-hidden"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    >
                      {/* Gradient Fill */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-teal-500" />

                      {/* Animated Shimmer */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ['-100%', '200%']
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                      />
                    </motion.div>
                  </div>

                  {/* Milestone Markers */}
                  {[25, 50, 75].map((mark) => (
                    <motion.div
                      key={mark}
                      className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                        percentage >= mark ? 'bg-white' : 'bg-gray-400'
                      }`}
                      style={{ left: `${mark}%` }}
                      initial={{ scale: 0 }}
                      animate={{ scale: percentage >= mark ? 1.5 : 1 }}
                      transition={{ delay: percentage >= mark ? 0.5 : 0 }}
                    />
                  ))}
                </div>

                {/* Progress Stats Cards */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Completed Card */}
                  <motion.div
                    className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                        <motion.span
                          className="text-white font-bold text-sm"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          ✓
                        </motion.span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {completedSubjects}/{totalSubjects}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Current Container Card */}
                  <motion.div
                    className={`bg-gradient-to-br ${containerColor.bgGradient} rounded-xl p-3`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center space-x-2">
                      <motion.div
                        className={`w-8 h-8 bg-gradient-to-br ${containerColor.gradient} rounded-lg flex items-center justify-center`}
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                      >
                        <ContainerIcon className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Current</p>
                        <p className="font-bold capitalize text-gray-900 dark:text-white">
                          {currentContainer}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Streak Card */}
                  <motion.div
                    className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center space-x-2">
                      <motion.div
                        className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Zap className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Streak</p>
                        <p className="font-bold text-orange-600 dark:text-orange-400">
                          {streakCount} 🔥
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Current Activity */}
                <motion.div
                  className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        className="w-3 h-3 bg-green-500 rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.7, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity
                        }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Ready to continue in:
                      </span>
                    </div>
                    <motion.span
                      className="font-bold text-purple-600 dark:text-purple-400"
                      whileHover={{ scale: 1.05 }}
                    >
                      {currentContainer.charAt(0).toUpperCase() + currentContainer.slice(1)} → {formatSubject(currentSubject)}
                    </motion.span>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  {/* Continue Button */}
                  <motion.button
                    onClick={() => {
                      // Stop any playing narration
                      azureAudioService.stop();
                      setIsAudioPlaying(false);
                      onContinue();
                    }}
                    className="relative w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Animated Background */}
                    <motion.div
                      className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />

                    <span className="relative flex items-center justify-center space-x-2">
                      <span>{getAgeAppropriateText('continueButton')}</span>
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </span>
                  </motion.button>

                  {/* Choose New Adventure Button */}
                  {canSwitchCareer && (
                    <motion.button
                      onClick={() => {
                        // Stop any playing narration
                        azureAudioService.stop();
                        setIsAudioPlaying(false);

                        // Track skip behavior
                        const skipKey = `narration_skip_welcomeback_${user?.id}`;
                        const skipCount = parseInt(localStorage.getItem(skipKey) || '0');
                        localStorage.setItem(skipKey, String(skipCount + 1));

                        if (onChooseNew) {
                          onChooseNew();
                        } else {
                          console.error('❌ onChooseNew function is not defined!');
                        }
                      }}
                      className="w-full bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 font-bold py-4 px-6 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all group"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <motion.span
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <RefreshCw className="w-5 h-5" />
                        </motion.span>
                        <span>{getAgeAppropriateText('newAdventureButton')}</span>
                      </span>
                    </motion.button>
                  )}

                  {/* Learn Lock Message */}
                  {!canSwitchCareer && (
                    <motion.div
                      className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        💡 Complete Learn to unlock career switching for Experience & Discover!
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};