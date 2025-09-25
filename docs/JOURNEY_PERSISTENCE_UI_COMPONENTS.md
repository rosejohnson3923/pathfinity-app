# Journey Persistence - Stylized UI Components

## Design Philosophy
Pathfinity combines professional educational excellence with engaging, delightful interactions. Our UI components should feel magical and alive while maintaining trust and credibility.

---

## 1. Enhanced WelcomeBackModal with Animations

### Component: WelcomeBackModal.tsx
```tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { sessionManager } from '../../services/content/SessionLearningContextManager';
import { useAuthContext } from '../../contexts/AuthContext';
import { Sparkles, ArrowRight, RefreshCw, Trophy, Star, Zap, BookOpen, Compass, Telescope } from 'lucide-react';
import confetti from 'canvas-confetti';
import '../../design-system/index.css';

interface WelcomeBackModalProps {
  onContinue: () => void;
  onChooseNew: () => void;
  session: any;
}

export const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({
  onContinue,
  onChooseNew,
  session
}) => {
  const { user } = useAuthContext();
  const [showModal, setShowModal] = useState(true);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax effect for companion avatar
  const avatarX = useTransform(mouseX, [-300, 300], [-10, 10]);
  const avatarY = useTransform(mouseY, [-300, 300], [-10, 10]);

  // Calculate progress with milestone detection
  const calculateProgress = () => {
    const progress = session.container_progress;
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
            if (!lastCompleted || progress[container][subject].completed_at > lastCompleted) {
              streakCount++;
              lastCompleted = progress[container][subject].completed_at;
            }
          }
        });
      }
    });

    const percentage = Math.round((completedSubjects / 12) * 100);
    const milestone = percentage >= 75 ? 'champion' :
                     percentage >= 50 ? 'explorer' :
                     percentage >= 25 ? 'adventurer' : 'beginner';

    return {
      percentage,
      completedSubjects,
      totalSubjects: 12,
      currentContainer: session.current_container,
      currentSubject: session.current_subject,
      milestone,
      streakCount
    };
  };

  const { percentage, completedSubjects, totalSubjects, currentContainer, currentSubject, milestone, streakCount } = calculateProgress();

  // Trigger celebration for milestones
  useEffect(() => {
    if (percentage >= 25 && percentage % 25 === 0) {
      triggerCelebration();
    }
  }, [percentage]);

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
    learn: { icon: BookOpen, color: 'purple', gradient: 'from-purple-400 to-purple-600' },
    experience: { icon: Compass, color: 'teal', gradient: 'from-teal-400 to-teal-600' },
    discover: { icon: Telescope, color: 'pink', gradient: 'from-pink-400 to-pink-600' }
  };

  const ContainerIcon = containerConfig[currentContainer].icon;

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="modal-overlay backdrop-blur-md bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal-content max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.8, rotateX: -30 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateX: 30 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            onMouseMove={handleMouseMove}
          >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10">
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
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg%3E%3Cpolygon fill="%239333ea" opacity="0.1" points="30 0 45 15 30 30 15 15"/%3E%3C/g%3E%3C/svg%3E")',
                  backgroundSize: '60px 60px'
                }}
              />
            </div>

            {/* Header Section with Floating Elements */}
            <div className="relative p-8 pb-0">
              {/* Floating Achievement Badges */}
              <div className="absolute top-4 right-4 flex space-x-2">
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
                    className="w-10 h-10 bg-gradient-to-br from-gold-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Trophy className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </div>

              {/* Companion Avatar with Parallax */}
              <div className="flex items-center space-x-6">
                <motion.div
                  className="relative"
                  style={{ x: avatarX, y: avatarY }}
                >
                  {/* Animated Ring Around Avatar */}
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

                  {/* Avatar Image */}
                  <motion.img
                    src={`/images/companions/${session.companion_id}.png`}
                    alt={session.companion_name}
                    className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 shadow-xl relative z-10"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />

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

                {/* Welcome Text with Typewriter Effect */}
                <div className="flex-1">
                  <motion.h2
                    className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Welcome back, {user?.full_name?.split(' ')[0]}! ✨
                  </motion.h2>
                  <motion.p
                    className="text-gray-600 dark:text-gray-400 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {session.companion_name} missed you! Ready to continue as a{' '}
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {session.career_name}
                    </span>?
                  </motion.p>
                </div>
              </div>
            </div>

            {/* Progress Section with Animated Elements */}
            <div className="px-8 py-6">
              {/* Milestone Badge */}
              <motion.div
                className="flex items-center justify-between mb-4"
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
              <div className="relative mb-6">
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
              <div className="grid grid-cols-3 gap-3 mb-6">
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
                        className="text-white font-bold"
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
                  className={`bg-gradient-to-br ${containerConfig[currentContainer].gradient} rounded-xl p-3 text-white`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    >
                      <ContainerIcon className="w-5 h-5" />
                    </motion.div>
                    <div>
                      <p className="text-xs opacity-90">Current</p>
                      <p className="font-bold capitalize">{currentContainer}</p>
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

              {/* Current Activity Indicator */}
              <motion.div
                className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 mb-6"
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
                    className="font-bold text-purple-600 dark:text-purple-400 capitalize"
                    whileHover={{ scale: 1.05 }}
                  >
                    {currentContainer} → {currentSubject.replace('_', ' ')}
                  </motion.span>
                </div>
              </motion.div>

              {/* Action Buttons with Hover Effects */}
              <div className="space-y-3">
                {/* Continue Button */}
                <motion.button
                  onClick={onContinue}
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
                    <span>Continue Adventure as {session.career_name}</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </span>
                </motion.button>

                {/* Choose New Adventure Button */}
                {(!currentContainer || currentContainer !== 'learn' || percentage === 0) && (
                  <motion.button
                    onClick={onChooseNew}
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
                      <span>Start New Adventure</span>
                    </span>
                  </motion.button>
                )}

                {/* Learn Lock Message */}
                {currentContainer === 'learn' && percentage > 0 && percentage < 33 && (
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

---

## 2. Gamified Container Selection Cards

### Component: ContainerSelectionCard.tsx
```tsx
import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { BookOpen, Compass, Telescope, Lock, CheckCircle, Star } from 'lucide-react';

interface ContainerCardProps {
  type: 'learn' | 'experience' | 'discover';
  isLocked: boolean;
  isCompleted: boolean;
  isActive: boolean;
  progress: number;
  onClick: () => void;
}

export const ContainerSelectionCard: React.FC<ContainerCardProps> = ({
  type,
  isLocked,
  isCompleted,
  isActive,
  progress,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 3D tilt effect
  const rotateX = useTransform(mouseY, [-100, 100], [10, -10]);
  const rotateY = useTransform(mouseX, [-100, 100], [-10, 10]);

  const containerConfig = {
    learn: {
      icon: BookOpen,
      title: 'Learn',
      subtitle: 'Master the fundamentals',
      gradient: 'from-purple-500 to-purple-700',
      lightGradient: 'from-purple-100 to-purple-200',
      shadowColor: 'shadow-purple-500/30',
      particles: '🎓',
      description: 'Build your foundation with guided lessons'
    },
    experience: {
      icon: Compass,
      title: 'Experience',
      subtitle: 'Apply your knowledge',
      gradient: 'from-teal-500 to-teal-700',
      lightGradient: 'from-teal-100 to-teal-200',
      shadowColor: 'shadow-teal-500/30',
      particles: '🎯',
      description: 'Practice real-world applications'
    },
    discover: {
      icon: Telescope,
      title: 'Discover',
      subtitle: 'Explore new horizons',
      gradient: 'from-pink-500 to-pink-700',
      lightGradient: 'from-pink-100 to-pink-200',
      shadowColor: 'shadow-pink-500/30',
      particles: '🚀',
      description: 'Uncover connections and possibilities'
    }
  };

  const config = containerConfig[type];
  const Icon = config.icon;

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  return (
    <motion.div
      className={`relative ${!isLocked && !isCompleted ? 'cursor-pointer' : ''}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isLocked && !isCompleted ? { scale: 1.05 } : {}}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={!isLocked && !isCompleted ? onClick : undefined}
      style={{
        perspective: 1000,
      }}
    >
      <motion.div
        className={`
          relative rounded-2xl p-6 h-64
          ${isLocked ? 'bg-gray-100 dark:bg-gray-800' : ''}
          ${isCompleted ? `bg-gradient-to-br ${config.lightGradient} dark:${config.gradient}` : ''}
          ${isActive ? `bg-gradient-to-br ${config.gradient} text-white` : ''}
          ${!isLocked && !isCompleted && !isActive ? 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700' : ''}
          shadow-xl ${isHovered && !isLocked ? config.shadowColor : ''}
          transition-all duration-300
        `}
        style={{
          rotateX: !isLocked ? rotateX : 0,
          rotateY: !isLocked ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Animated Background Pattern */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-2xl overflow-hidden opacity-20"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, white 10%, transparent 10%)`,
              backgroundSize: '20px 20px'
            }}
          />
        )}

        {/* Floating Particles */}
        {isHovered && !isLocked && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute text-2xl"
                initial={{
                  x: Math.random() * 200 - 100,
                  y: 200,
                  opacity: 0
                }}
                animate={{
                  y: -50,
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity
                }}
              >
                {config.particles}
              </motion.span>
            ))}
          </>
        )}

        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-gray-900/50 dark:bg-gray-900/70 rounded-2xl flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lock className="w-12 h-12 text-gray-400" />
            </motion.div>
          </div>
        )}

        {/* Completion Overlay */}
        {isCompleted && (
          <motion.div
            className="absolute top-3 right-3"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.3 }}
          >
            <div className="bg-green-500 rounded-full p-2">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </motion.div>
        )}

        {/* Content */}
        <div className="relative z-10">
          {/* Icon with Animation */}
          <motion.div
            className={`
              w-16 h-16 rounded-xl flex items-center justify-center mb-4
              ${isActive ? 'bg-white/20' : `bg-gradient-to-br ${config.gradient}`}
            `}
            animate={isActive ? {
              rotate: [0, 360],
            } : {}}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Icon className={`w-8 h-8 ${isActive ? 'text-white' : 'text-white'}`} />
          </motion.div>

          {/* Title and Subtitle */}
          <h3 className={`text-xl font-bold mb-1 ${
            isActive ? 'text-white' :
            isLocked ? 'text-gray-400' :
            'text-gray-900 dark:text-white'
          }`}>
            {config.title}
          </h3>
          <p className={`text-sm mb-3 ${
            isActive ? 'text-white/80' :
            isLocked ? 'text-gray-400' :
            'text-gray-600 dark:text-gray-400'
          }`}>
            {config.subtitle}
          </p>

          {/* Description */}
          <p className={`text-xs mb-4 ${
            isActive ? 'text-white/70' :
            isLocked ? 'text-gray-400' :
            'text-gray-500 dark:text-gray-500'
          }`}>
            {config.description}
          </p>

          {/* Progress Bar */}
          {!isLocked && progress > 0 && (
            <div className="relative">
              <div className={`w-full h-2 rounded-full overflow-hidden ${
                isActive ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                <motion.div
                  className={`h-full ${
                    isActive ? 'bg-white' : `bg-gradient-to-r ${config.gradient}`
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <motion.span
                className={`absolute -top-6 right-0 text-xs font-bold ${
                  isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {progress}%
              </motion.span>
            </div>
          )}

          {/* Stars for completed */}
          {isCompleted && (
            <div className="flex space-x-1 mt-3">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1 * i, type: "spring" }}
                >
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Active Indicator Pulse */}
        {isActive && (
          <motion.div
            className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-30"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};
```

---

## 3. Celebration and Milestone Components

### Component: MilestoneAchievement.tsx
```tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Star, Medal, Target, Zap, Award } from 'lucide-react';

interface MilestoneAchievementProps {
  type: 'subject_complete' | 'container_complete' | 'journey_complete' | 'streak' | 'perfect_score';
  title: string;
  description: string;
  points?: number;
  onClose: () => void;
}

export const MilestoneAchievement: React.FC<MilestoneAchievementProps> = ({
  type,
  title,
  description,
  points = 100,
  onClose
}) => {
  const achievementConfig = {
    subject_complete: {
      icon: Star,
      color: 'from-yellow-400 to-orange-500',
      particles: ['⭐', '✨', '🌟'],
      sound: 'success-chime'
    },
    container_complete: {
      icon: Trophy,
      color: 'from-purple-500 to-pink-500',
      particles: ['🏆', '🎉', '🎊'],
      sound: 'level-up'
    },
    journey_complete: {
      icon: Award,
      color: 'from-gold-400 to-gold-600',
      particles: ['🏅', '👑', '🌟'],
      sound: 'epic-win'
    },
    streak: {
      icon: Zap,
      color: 'from-orange-400 to-red-500',
      particles: ['🔥', '⚡', '💥'],
      sound: 'streak-bonus'
    },
    perfect_score: {
      icon: Medal,
      color: 'from-green-400 to-emerald-600',
      particles: ['💎', '💚', '✅'],
      sound: 'perfect'
    }
  };

  const config = achievementConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    // Trigger confetti
    const duration = type === 'journey_complete' ? 5000 : 3000;
    const particleCount = type === 'journey_complete' ? 200 : 100;

    confetti({
      particleCount,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#14b8a6', '#ec4899', '#fbbf24']
    });

    // Auto close after delay
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [type, onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", damping: 10, stiffness: 100 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Outer Ring Animation */}
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.color}`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          />

          {/* Main Achievement Card */}
          <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-2xl max-w-md">
            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              {config.particles.map((particle, i) => (
                <motion.span
                  key={i}
                  className="absolute text-4xl"
                  initial={{
                    x: Math.random() * 400 - 200,
                    y: 400,
                    opacity: 0
                  }}
                  animate={{
                    y: -100,
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.5,
                    repeat: Infinity
                  }}
                >
                  {particle}
                </motion.span>
              ))}
            </div>

            {/* Icon Badge */}
            <motion.div
              className="relative mx-auto w-32 h-32 mb-6"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.color} shadow-2xl`} />
              <div className="absolute inset-2 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center">
                <Icon className="w-16 h-16 text-transparent bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text"
                      style={{ fill: 'url(#gradient)' }} />
              </div>

              {/* Points Badge */}
              {points && (
                <motion.div
                  className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 rounded-full px-3 py-1 font-bold text-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  +{points} XP
                </motion.div>
              )}
            </motion.div>

            {/* Text Content */}
            <motion.h2
              className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {title}
            </motion.h2>

            <motion.p
              className="text-center text-gray-600 dark:text-gray-400 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {description}
            </motion.p>

            {/* Action Button */}
            <motion.button
              onClick={onClose}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Awesome! Continue Journey
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
```

---

## 4. Interactive Progress Journey Map

### Component: JourneyProgressMap.tsx
```tsx
import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Flag, Circle } from 'lucide-react';

interface JourneyProgressMapProps {
  currentPosition: { container: string; subject: string };
  progress: any;
}

export const JourneyProgressMap: React.FC<JourneyProgressMapProps> = ({
  currentPosition,
  progress
}) => {
  const containers = ['learn', 'experience', 'discover'];
  const subjects = ['math', 'ela', 'science', 'social_studies'];

  const getNodeStatus = (container: string, subject: string) => {
    const subjectProgress = progress[container]?.[subject];
    if (!subjectProgress) return 'locked';
    if (subjectProgress.completed) return 'completed';
    if (currentPosition.container === container && currentPosition.subject === subject) return 'current';
    return 'available';
  };

  const containerColors = {
    learn: 'from-purple-400 to-purple-600',
    experience: 'from-teal-400 to-teal-600',
    discover: 'from-pink-400 to-pink-600'
  };

  return (
    <div className="relative p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Journey Path */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
        {containers.map((container, cIdx) => (
          subjects.map((subject, sIdx) => {
            if (sIdx === subjects.length - 1 && cIdx === containers.length - 1) return null;

            const startX = 100 + sIdx * 150;
            const startY = 100 + cIdx * 120;
            const endX = sIdx === subjects.length - 1 ? 100 : startX + 150;
            const endY = sIdx === subjects.length - 1 ? startY + 120 : startY;

            const status = getNodeStatus(container, subject);
            const isActive = status === 'completed' || status === 'current';

            return (
              <motion.line
                key={`${container}-${subject}`}
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={isActive ? 'url(#gradient)' : '#e5e7eb'}
                strokeWidth="3"
                strokeDasharray={isActive ? "0" : "5,5"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: isActive ? 1 : 0.3 }}
                transition={{ duration: 1, delay: cIdx * 0.2 + sIdx * 0.1 }}
              />
            );
          })
        ))}

        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      {/* Journey Nodes */}
      <div className="relative z-10">
        {containers.map((container, cIdx) => (
          <div key={container} className="flex items-center space-x-8 mb-8">
            {/* Container Label */}
            <motion.div
              className={`w-32 text-right pr-4`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: cIdx * 0.2 }}
            >
              <h3 className="font-bold capitalize text-gray-900 dark:text-white">
                {container}
              </h3>
            </motion.div>

            {/* Subject Nodes */}
            <div className="flex space-x-12">
              {subjects.map((subject, sIdx) => {
                const status = getNodeStatus(container, subject);

                return (
                  <motion.div
                    key={subject}
                    className="relative"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: cIdx * 0.2 + sIdx * 0.1,
                      type: "spring"
                    }}
                  >
                    {/* Node */}
                    <motion.div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        ${status === 'completed' ? `bg-gradient-to-br ${containerColors[container]} shadow-lg` : ''}
                        ${status === 'current' ? 'bg-white dark:bg-gray-800 border-4 border-purple-500 shadow-xl' : ''}
                        ${status === 'available' ? 'bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600' : ''}
                        ${status === 'locked' ? 'bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700' : ''}
                      `}
                      whileHover={status !== 'locked' ? { scale: 1.1 } : {}}
                    >
                      {status === 'completed' && <span className="text-white font-bold">✓</span>}
                      {status === 'current' && (
                        <motion.div
                          className="w-3 h-3 bg-purple-500 rounded-full"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                      {status === 'locked' && <span className="text-gray-400">🔒</span>}
                    </motion.div>

                    {/* Subject Label */}
                    <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {subject.replace('_', ' ')}
                    </span>

                    {/* Current Position Indicator */}
                    {status === 'current' && (
                      <motion.div
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <MapPin className="w-6 h-6 text-purple-500" />
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600" />
          <span className="text-gray-600 dark:text-gray-400">Completed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-white border-2 border-purple-500" />
          <span className="text-gray-600 dark:text-gray-400">Current</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-300" />
          <span className="text-gray-600 dark:text-gray-400">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-gray-200" />
          <span className="text-gray-600 dark:text-gray-400">Locked</span>
        </div>
      </div>
    </div>
  );
};
```

---

## Design Token Integration

All components use the Pathfinity design system tokens:

### Colors
- Primary actions: `var(--purple-600)`
- Container-specific: Learn (purple), Experience (teal), Discover (pink/magenta)
- Status indicators: Success (green), Warning (yellow), Error (red)
- Gradients for visual richness

### Animations
- Spring physics for natural movement
- Parallax effects for depth
- Particle systems for celebration
- Smooth transitions with proper easing

### Spacing & Layout
- Consistent padding using design tokens
- Responsive grid systems
- Mobile-first approach
- Touch-friendly interaction areas (min 44px)

### Theme Support
- Full dark mode support
- Automatic color adjustments
- Proper contrast ratios
- Smooth theme transitions

## Accessibility Features
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader announcements
- Reduced motion support

These components create an engaging, professional, and delightful learning experience that aligns with Pathfinity's brand while making the journey persistence system feel magical and rewarding!