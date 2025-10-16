/**
 * Tutorial Overlay Component
 * Interactive onboarding for first-time players
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Target,
  Users,
  Shield,
  Zap,
  Trophy,
  Star,
  HelpCircle,
  Sparkles,
  Play,
  BookOpen,
  Lightbulb,
  Award
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  highlightElement?: string;
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  interactive?: boolean;
  action?: () => void;
}

interface TutorialOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  industryName?: string;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  isVisible,
  onComplete,
  onSkip,
  industryName = 'Technology'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasInteracted, setHasInteracted] = useState<Set<string>>(new Set());

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to DLCC: Career Challenge!',
      content: `Get ready for an exciting multiplayer journey through the ${industryName} industry! You'll face real-world challenges, build dream teams, and compete with friends.`,
      icon: <Sparkles className="w-8 h-8 text-yellow-400" />,
      position: 'center'
    },
    {
      id: 'objective',
      title: 'Your Mission',
      content: 'Be the first player to reach 100 points by successfully completing industry challenges. Choose wisely and think strategically!',
      icon: <Target className="w-8 h-8 text-blue-400" />,
      position: 'center'
    },
    {
      id: 'role-cards',
      title: 'Role Cards - Your Team',
      content: 'Each role card represents a professional with unique skills. Cards have different rarities and power levels. Collect and use them strategically!',
      icon: <Shield className="w-8 h-8 text-purple-400" />,
      highlightElement: '.role-cards-panel',
      position: 'top-right'
    },
    {
      id: 'challenges',
      title: 'Industry Challenges',
      content: 'Each turn, select from available challenges. They vary in difficulty and reward. Match the right team to the right challenge!',
      icon: <BookOpen className="w-8 h-8 text-green-400" />,
      highlightElement: '.challenge-selection',
      position: 'center'
    },
    {
      id: 'team-building',
      title: 'Build Your Dream Team',
      content: 'After selecting a challenge, choose role cards from your hand to form a team. The better the match, the higher your score!',
      icon: <Users className="w-8 h-8 text-indigo-400" />,
      highlightElement: '.team-building-panel',
      position: 'bottom-right'
    },
    {
      id: 'synergies',
      title: 'Activate Synergies',
      content: 'Certain role combinations create powerful synergies! Look for the lightning bolt indicator when roles work well together.',
      icon: <Zap className="w-8 h-8 text-orange-400" />,
      position: 'center'
    },
    {
      id: 'scoring',
      title: 'Scoring System',
      content: 'Earn base points for completing challenges, plus bonuses for perfect matches, synergies, and streaks. Aim for combos!',
      icon: <Star className="w-8 h-8 text-yellow-400" />,
      position: 'center'
    },
    {
      id: 'multiplayer',
      title: 'Play with Friends',
      content: 'Share the room code to invite friends. Up to 6 players can compete in real-time. May the best strategist win!',
      icon: <Trophy className="w-8 h-8 text-gold-400" />,
      position: 'center'
    },
    {
      id: 'tips',
      title: 'Pro Tips',
      content: '• Save powerful cards for hard challenges\n• Build streaks for bonus points\n• Watch what opponents play\n• Time management is key - you have 90 seconds per turn!',
      icon: <Lightbulb className="w-8 h-8 text-cyan-400" />,
      position: 'center'
    },
    {
      id: 'ready',
      title: "You're Ready!",
      content: 'Jump in and show everyone your strategic skills. Remember, every challenge is an opportunity to learn about real careers!',
      icon: <Award className="w-8 h-8 text-purple-400" />,
      position: 'center',
      interactive: true
    }
  ];

  const currentStepData = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInteraction = (stepId: string) => {
    setHasInteracted(prev => new Set(prev).add(stepId));
    if (currentStepData.action) {
      currentStepData.action();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isVisible) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'Escape') {
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, isVisible]);

  if (!isVisible) return null;

  const getPositionClasses = (position?: string) => {
    switch (position) {
      case 'top-left':
        return 'top-20 left-8';
      case 'top-right':
        return 'top-20 right-8';
      case 'bottom-left':
        return 'bottom-20 left-8';
      case 'bottom-right':
        return 'bottom-20 right-8';
      default:
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onSkip}
          />

          {/* Highlight overlay if needed */}
          {currentStepData.highlightElement && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="highlight-mask" />
            </div>
          )}

          {/* Tutorial Card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`absolute max-w-md w-full mx-4 ${getPositionClasses(currentStepData.position)}`}
          >
            <div className="bg-gradient-to-br from-purple-800/95 to-blue-800/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4">
                <button
                  onClick={onSkip}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>

                <div className="flex items-start gap-4">
                  <motion.div
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="p-3 bg-white/10 rounded-xl"
                  >
                    {currentStepData.icon}
                  </motion.div>

                  <div className="flex-1">
                    <motion.h3
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-xl font-bold text-white mb-1"
                    >
                      {currentStepData.title}
                    </motion.h3>

                    {/* Progress bar */}
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-gradient-to-r from-purple-400 to-blue-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-white/90 leading-relaxed whitespace-pre-line"
                >
                  {currentStepData.content}
                </motion.p>

                {/* Interactive element */}
                {currentStepData.interactive && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleInteraction(currentStepData.id)}
                    className="mt-4 w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Try it out!
                  </motion.button>
                )}
              </div>

              {/* Navigation */}
              <div className="px-6 pb-6 flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                    ${currentStep === 0
                      ? 'bg-white/5 text-white/30 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-white/20'
                    }
                  `}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex gap-2">
                  {tutorialSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`
                        w-2 h-2 rounded-full transition-all
                        ${index === currentStep
                          ? 'w-8 bg-white'
                          : 'bg-white/30 hover:bg-white/50'
                        }
                      `}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all flex items-center gap-2"
                >
                  {currentStep === tutorialSteps.length - 1 ? (
                    <>
                      Start Playing
                      <Sparkles className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Help button for returning to tutorial */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="fixed bottom-8 right-8 p-3 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg transition-colors"
            onClick={onSkip}
          >
            <HelpCircle className="w-6 h-6 text-white" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TutorialOverlay;