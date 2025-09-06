/**
 * Container Visualization Hook
 * =============================
 * Custom hook for managing visualization state and animations
 * across Learn, Experience, and Discover containers
 * 
 * Created: 2025-08-30
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import GradeContentAdapter from '../services/GradeContentAdapter';

export interface VisualizationState {
  isActive: boolean;
  currentAnimation: string;
  visualComplexity: number;
  attentionTimer: number;
  achievements: string[];
}

export interface UseContainerVisualizationProps {
  containerType: 'learn' | 'experience' | 'discover';
  grade: string;
  currentPhase: string;
  isPlaying?: boolean;
}

export const useContainerVisualization = ({
  containerType,
  grade,
  currentPhase,
  isPlaying = false
}: UseContainerVisualizationProps) => {
  const [visualizationState, setVisualizationState] = useState<VisualizationState>({
    isActive: false,
    currentAnimation: 'idle',
    visualComplexity: 50,
    attentionTimer: 0,
    achievements: []
  });

  const [progress, setProgress] = useState(0);
  const [milestones, setMilestones] = useState<number[]>([]);
  const attentionIntervalRef = useRef<NodeJS.Timeout>();
  const animationTimeoutRef = useRef<NodeJS.Timeout>();

  // Get grade-specific parameters
  const gradeRange = GradeContentAdapter.getGradeRange(grade);
  const attentionSpan = GradeContentAdapter.getAttentionSpan(grade);
  const visualRatio = GradeContentAdapter.getVisualRatio(grade);

  // Container-specific animation sets
  const containerAnimations = {
    learn: {
      idle: 'float',
      active: 'pulse',
      success: 'bounce',
      thinking: 'rotate'
    },
    experience: {
      idle: 'wave',
      active: 'orbit',
      success: 'burst',
      thinking: 'spiral'
    },
    discover: {
      idle: 'quantum',
      active: 'spiral',
      success: 'rainbow',
      thinking: 'cosmic'
    }
  };

  // Initialize visualization based on grade
  useEffect(() => {
    const complexity = calculateVisualComplexity(gradeRange, visualRatio);
    setVisualizationState(prev => ({
      ...prev,
      visualComplexity: complexity,
      isActive: isPlaying
    }));
  }, [grade, gradeRange, visualRatio, isPlaying]);

  // Manage attention span timer
  useEffect(() => {
    if (isPlaying && attentionSpan > 0) {
      attentionIntervalRef.current = setInterval(() => {
        setVisualizationState(prev => {
          const newTimer = prev.attentionTimer + 1;
          
          // Check if attention break needed
          if (newTimer >= attentionSpan * 60) { // Convert minutes to seconds
            triggerAttentionBreak();
            return { ...prev, attentionTimer: 0 };
          }
          
          return { ...prev, attentionTimer: newTimer };
        });
      }, 1000);

      return () => {
        if (attentionIntervalRef.current) {
          clearInterval(attentionIntervalRef.current);
        }
      };
    }
  }, [isPlaying, attentionSpan]);

  // Calculate visual complexity based on grade
  const calculateVisualComplexity = (
    gradeRange: string, 
    visualRatio: { visual: number; text: number }
  ): number => {
    const complexityMap = {
      'K-2': 80,  // High visual, simple
      '3-5': 60,  // Balanced
      '6-8': 40,  // More abstract
      '9-12': 20  // Minimal, professional
    };
    
    return complexityMap[gradeRange as keyof typeof complexityMap] || 50;
  };

  // Trigger attention break for younger students
  const triggerAttentionBreak = useCallback(() => {
    if (gradeRange === 'K-2' || gradeRange === '3-5') {
      setVisualizationState(prev => ({
        ...prev,
        currentAnimation: 'break',
        isActive: false
      }));

      // Resume after short break
      setTimeout(() => {
        setVisualizationState(prev => ({
          ...prev,
          currentAnimation: containerAnimations[containerType].idle,
          isActive: true
        }));
      }, 5000);
    }
  }, [gradeRange, containerType]);

  // Update animation based on phase
  useEffect(() => {
    const animations = containerAnimations[containerType];
    let newAnimation = animations.idle;

    switch (currentPhase) {
      case 'introduction':
        newAnimation = animations.idle;
        break;
      case 'learning':
      case 'experiencing':
      case 'discovering':
        newAnimation = animations.active;
        break;
      case 'thinking':
      case 'processing':
        newAnimation = animations.thinking;
        break;
      case 'success':
      case 'complete':
        newAnimation = animations.success;
        break;
    }

    setVisualizationState(prev => ({
      ...prev,
      currentAnimation: newAnimation
    }));
  }, [currentPhase, containerType]);

  // Progress tracking
  const updateProgress = useCallback((newProgress: number) => {
    setProgress(newProgress);
    
    // Check for milestones
    const milestonePoints = [25, 50, 75, 100];
    const reached = milestonePoints.filter(point => newProgress >= point);
    
    reached.forEach(milestone => {
      if (!milestones.includes(milestone)) {
        handleMilestone(milestone);
        setMilestones(prev => [...prev, milestone]);
      }
    });
  }, [milestones]);

  // Handle milestone achievements
  const handleMilestone = useCallback((milestone: number) => {
    const achievementMessages = {
      25: getAchievementMessage('quarter', gradeRange),
      50: getAchievementMessage('half', gradeRange),
      75: getAchievementMessage('almost', gradeRange),
      100: getAchievementMessage('complete', gradeRange)
    };

    const message = achievementMessages[milestone as keyof typeof achievementMessages];
    
    setVisualizationState(prev => ({
      ...prev,
      achievements: [...prev.achievements, message],
      currentAnimation: containerAnimations[containerType].success
    }));

    // Reset animation after celebration
    animationTimeoutRef.current = setTimeout(() => {
      setVisualizationState(prev => ({
        ...prev,
        currentAnimation: containerAnimations[containerType].active
      }));
    }, 3000);
  }, [gradeRange, containerType]);

  // Get grade-appropriate achievement messages
  const getAchievementMessage = (type: string, gradeRange: string): string => {
    const messages = {
      'K-2': {
        quarter: '🌟 Great start!',
        half: '🎉 Halfway there!',
        almost: '🚀 Almost done!',
        complete: '🏆 You did it!'
      },
      '3-5': {
        quarter: '25% Complete!',
        half: '50% - Keep going!',
        almost: '75% - Nearly there!',
        complete: 'Mission Complete!'
      },
      '6-8': {
        quarter: 'Quarter Progress',
        half: 'Halfway Point',
        almost: 'Three Quarters',
        complete: 'Objective Complete'
      },
      '9-12': {
        quarter: '25%',
        half: '50%',
        almost: '75%',
        complete: '100%'
      }
    };

    const gradeMessages = messages[gradeRange as keyof typeof messages] || messages['3-5'];
    return gradeMessages[type as keyof typeof gradeMessages] || '';
  };

  // Animation control methods
  const startAnimation = useCallback(() => {
    setVisualizationState(prev => ({
      ...prev,
      isActive: true,
      currentAnimation: containerAnimations[containerType].active
    }));
  }, [containerType]);

  const stopAnimation = useCallback(() => {
    setVisualizationState(prev => ({
      ...prev,
      isActive: false,
      currentAnimation: containerAnimations[containerType].idle
    }));
  }, [containerType]);

  const pauseAnimation = useCallback(() => {
    setVisualizationState(prev => ({
      ...prev,
      isActive: false
    }));
  }, []);

  const resumeAnimation = useCallback(() => {
    setVisualizationState(prev => ({
      ...prev,
      isActive: true
    }));
  }, []);

  // Get container-specific theme colors
  const getContainerTheme = useCallback(() => {
    const themes = {
      learn: {
        primary: '#14b8a6',
        secondary: '#06b6d4',
        gradient: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)'
      },
      experience: {
        primary: '#f97316',
        secondary: '#ea580c',
        gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
      },
      discover: {
        primary: '#ec4899',
        secondary: '#a855f7',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)'
      }
    };
    
    return themes[containerType];
  }, [containerType]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (attentionIntervalRef.current) {
        clearInterval(attentionIntervalRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return {
    visualizationState,
    progress,
    updateProgress,
    startAnimation,
    stopAnimation,
    pauseAnimation,
    resumeAnimation,
    containerTheme: getContainerTheme(),
    gradeRange,
    attentionSpan,
    visualRatio,
    milestones,
    triggerAttentionBreak
  };
};

export default useContainerVisualization;