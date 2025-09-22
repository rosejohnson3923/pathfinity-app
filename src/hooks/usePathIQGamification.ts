/**
 * React Hook for PathIQ Gamification
 * Provides easy integration of PathIQ gamification features
 */

import { useState, useEffect, useCallback } from 'react';
import { pathIQGamification, XPTransaction, HintCost, UserGameProfile } from '../services/pathIQGamificationService';
import { pathIQ } from '../services/pathIQIntelligenceSystem';

export interface UsePathIQGamificationReturn {
  // User Profile
  profile: UserGameProfile;
  
  // XP Functions
  awardXP: (amount: number, reason: string, category?: XPTransaction['category']) => void;
  
  // Hint System
  availableHints: HintCost[];
  useHint: (hintType: HintCost['type']) => boolean;
  
  // Leaderboards
  leaderboard: any;
  
  // PathIQ Insights
  insights: string[];
  
  // Grade-appropriate features
  features: {
    showXP: boolean;
    showLeaderboard: boolean;
    showHintCosts: boolean;
  };
  
  // Loading states
  isLoading: boolean;
}

export function usePathIQGamification(userId: string, grade?: string, pauseBackgroundUpdates?: boolean): UsePathIQGamificationReturn {
  const [profile, setProfile] = useState<UserGameProfile>(pathIQGamification.getUserProfile(userId));
  const [availableHints, setAvailableHints] = useState<HintCost[]>([]);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [features, setFeatures] = useState({
    showXP: true,
    showLeaderboard: true,
    showHintCosts: true
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize and update profile
  useEffect(() => {
    const updateProfile = () => {
      const newProfile = pathIQGamification.getUserProfile(userId);

      // Only update if profile has actually changed to prevent unnecessary re-renders
      setProfile(prevProfile => {
        // Check if the profiles are actually different
        if (JSON.stringify(prevProfile) !== JSON.stringify(newProfile)) {
          console.log('Profile updated:', { userId, changes: true });
          return newProfile;
        }
        return prevProfile;
      });
    };

    // Initial profile load
    updateProfile();

    // Only set up interval if background updates are not paused
    let interval: NodeJS.Timeout | undefined;
    if (!pauseBackgroundUpdates) {
      // Update profile every 30 seconds instead of 5 seconds
      // This reduces unnecessary re-renders during active learning
      interval = setInterval(updateProfile, 30000);
    }

    // Listen for PathIQ events
    const handlePathIQEvent = (event: CustomEvent) => {
      if (event.detail.data.userId === userId) {
        updateProfile();
      }
    };

    window.addEventListener('pathiq-event', handlePathIQEvent as EventListener);

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('pathiq-event', handlePathIQEvent as EventListener);
    };
  }, [userId, pauseBackgroundUpdates]);

  // Update available hints
  useEffect(() => {
    const updateHints = () => {
      const hints = pathIQGamification.getAvailableHints(userId);
      setAvailableHints(hints);
    };

    updateHints();
    let interval: NodeJS.Timeout | undefined;
    if (!pauseBackgroundUpdates) {
      interval = setInterval(updateHints, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userId, pauseBackgroundUpdates]);

  // Update leaderboard
  useEffect(() => {
    const updateLeaderboard = () => {
      const board = pathIQGamification.getPathIQLeaderboard(userId, grade || '3');
      setLeaderboard(board);
    };

    updateLeaderboard();
    let interval: NodeJS.Timeout | undefined;
    if (!pauseBackgroundUpdates) {
      interval = setInterval(updateLeaderboard, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userId, grade, pauseBackgroundUpdates]);

  // Update insights
  useEffect(() => {
    const updateInsights = () => {
      const newInsights = pathIQGamification.getPathIQInsights(userId);
      setInsights(newInsights);
    };

    updateInsights();
    let interval: NodeJS.Timeout | undefined;
    if (!pauseBackgroundUpdates) {
      interval = setInterval(updateInsights, 20000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userId, pauseBackgroundUpdates]);

  // Update grade-appropriate features
  useEffect(() => {
    if (grade) {
      const gradeNum = grade === 'K' ? 0 : parseInt(grade);
      setFeatures({
        showXP: gradeNum >= 3,
        showLeaderboard: gradeNum >= 3,
        showHintCosts: gradeNum >= 3
      });
    }
  }, [grade]);

  // Award XP callback
  const awardXP = useCallback((amount: number, reason: string, category: XPTransaction['category'] = 'learning') => {
    const transaction = pathIQGamification.awardXP(userId, amount, reason, category);
    console.log('XP Awarded:', transaction);

    // Update profile immediately
    setProfile(pathIQGamification.getUserProfile(userId));

    // Disabled floating XP animation - using detailed feedback notification instead
    // showXPAnimation(amount);
  }, [userId]);

  // Use hint callback
  const useHint = useCallback((hintType: HintCost['type']): boolean => {
    const transaction = pathIQGamification.spendXPForHint(userId, hintType);
    
    if (transaction) {
      console.log('Hint used:', transaction);
      
      // Update profile and hints immediately
      setProfile(pathIQGamification.getUserProfile(userId));
      setAvailableHints(pathIQGamification.getAvailableHints(userId));
      
      return true;
    }
    
    return false;
  }, [userId]);

  return {
    profile,
    awardXP,
    availableHints,
    useHint,
    leaderboard,
    insights,
    features,
    isLoading
  };
}

// Visual feedback helper
function showXPAnimation(amount: number) {
  // Don't show animation for 0 XP
  if (amount <= 0) return;

  // Create floating XP indicator
  const indicator = document.createElement('div');
  indicator.className = 'xp-gain-indicator';
  indicator.textContent = `+${amount} XP`;
  indicator.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 24px;
    z-index: 10000;
    animation: floatUp 2s ease-out forwards;
    pointer-events: none;
  `;
  
  // Add animation styles if not already present
  if (!document.querySelector('#xp-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'xp-animation-styles';
    style.textContent = `
      @keyframes floatUp {
        0% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.5);
        }
        50% {
          opacity: 1;
          transform: translate(-50%, -70%) scale(1.2);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -100%) scale(1);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(indicator);
  setTimeout(() => indicator.remove(), 2000);
}

// Export helper functions
export function getXPRewardForAction(action: string): number {
  const rewards: { [key: string]: number } = {
    'correct_first_try': 10,
    'correct_second_try': 5,
    'correct_third_try': 2,
    'lesson_complete': 20,
    'perfect_score': 50,
    'daily_login': 5,
    'streak_bonus': 5,
    'help_classmate': 15,
    'explore_career': 10,
    'quick_answer': 5,
    'speed_demon': 15,
    'first_achievement': 25,
    'level_up': 100,
    'mastery_complete': 75
  };
  
  return rewards[action] || 5;
}

export default usePathIQGamification;