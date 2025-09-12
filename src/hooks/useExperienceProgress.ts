import { useState, useEffect, useCallback } from 'react';

interface ExperienceProgress {
  studentId: string;
  currentSubject: string;
  currentSkill: string;
  currentScenarioIndex: number;
  totalScenarios: number;
  completedScenarios: string[];
  completedSubjects: string[];
  xpEarned: number;
  timeSpent: number;
  lastUpdated: Date;
  interactions: InteractionRecord[];
}

interface InteractionRecord {
  timestamp: Date;
  scenarioId: string;
  action: string;
  result: 'correct' | 'incorrect' | 'hint' | 'skip';
  timeToComplete: number;
}

const STORAGE_KEY = 'pathfinity_experience_progress';

export const useExperienceProgress = (studentId: string, subjectArea: string, skillName: string) => {
  const [progress, setProgress] = useState<ExperienceProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from localStorage
  useEffect(() => {
    if (!studentId) {
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${studentId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if this is the same subject and skill
        if (parsed.currentSubject === subjectArea && parsed.currentSkill === skillName) {
          setProgress({
            ...parsed,
            lastUpdated: new Date(parsed.lastUpdated)
          });
        } else {
          // Different subject/skill, create new progress
          initializeProgress();
        }
      } else {
        initializeProgress();
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      initializeProgress();
    } finally {
      setIsLoading(false);
    }
  }, [studentId, subjectArea, skillName]);

  const initializeProgress = () => {
    const newProgress: ExperienceProgress = {
      studentId,
      currentSubject: subjectArea,
      currentSkill: skillName,
      currentScenarioIndex: 0,
      totalScenarios: 0,
      completedScenarios: [],
      completedSubjects: [],
      xpEarned: 0,
      timeSpent: 0,
      lastUpdated: new Date(),
      interactions: []
    };
    setProgress(newProgress);
  };

  // Save progress to localStorage
  const saveProgress = useCallback((updatedProgress: ExperienceProgress) => {
    if (!studentId) return;

    try {
      const toStore = {
        ...updatedProgress,
        lastUpdated: new Date()
      };
      localStorage.setItem(`${STORAGE_KEY}_${studentId}`, JSON.stringify(toStore));
      // Only update state if the values have actually changed
      setProgress(prev => {
        if (JSON.stringify(prev) === JSON.stringify(toStore)) {
          return prev; // No change, return same reference
        }
        return toStore;
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }, [studentId]);

  // Update scenario progress
  const updateScenarioProgress = useCallback((scenarioIndex: number, totalScenarios: number) => {
    setProgress(prev => {
      if (!prev) return prev;
      
      // Check if values actually changed
      if (prev.currentScenarioIndex === scenarioIndex && prev.totalScenarios === totalScenarios) {
        return prev; // No change
      }
      
      const updated = {
        ...prev,
        currentScenarioIndex: scenarioIndex,
        totalScenarios,
        lastUpdated: new Date()
      };
      
      // Save to localStorage
      if (studentId) {
        try {
          localStorage.setItem(`${STORAGE_KEY}_${studentId}`, JSON.stringify(updated));
        } catch (error) {
          console.error('Error saving progress:', error);
        }
      }
      
      return updated;
    });
  }, [studentId]);

  // Mark scenario as completed
  const completeScenario = useCallback((scenarioId: string, xpAmount: number = 0) => {
    if (!progress) return;

    const updated = {
      ...progress,
      completedScenarios: [...progress.completedScenarios, scenarioId],
      xpEarned: progress.xpEarned + xpAmount,
      currentScenarioIndex: progress.currentScenarioIndex + 1
    };
    saveProgress(updated);
  }, [progress, saveProgress]);

  // Mark subject as completed
  const completeSubject = useCallback(() => {
    if (!progress) return;

    const updated = {
      ...progress,
      completedSubjects: [...progress.completedSubjects, progress.currentSubject]
    };
    saveProgress(updated);
  }, [progress, saveProgress]);

  // Record an interaction
  const recordInteraction = useCallback((
    scenarioId: string,
    action: string,
    result: 'correct' | 'incorrect' | 'hint' | 'skip',
    timeToComplete: number
  ) => {
    if (!progress) return;

    const interaction: InteractionRecord = {
      timestamp: new Date(),
      scenarioId,
      action,
      result,
      timeToComplete
    };

    const updated = {
      ...progress,
      interactions: [...progress.interactions, interaction],
      timeSpent: progress.timeSpent + timeToComplete
    };
    saveProgress(updated);
  }, [progress, saveProgress]);

  // Clear progress (for new session)
  const clearProgress = useCallback(() => {
    if (!studentId) return;

    try {
      localStorage.removeItem(`${STORAGE_KEY}_${studentId}`);
      initializeProgress();
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  }, [studentId]);

  // Get resume data
  const getResumeData = useCallback(() => {
    if (!progress) return null;

    return {
      canResume: progress.currentScenarioIndex > 0 && 
                 progress.currentScenarioIndex < progress.totalScenarios,
      scenarioIndex: progress.currentScenarioIndex,
      completedCount: progress.completedScenarios.length,
      xpEarned: progress.xpEarned,
      timeSpent: progress.timeSpent
    };
  }, [progress]);

  // Calculate completion percentage
  const getCompletionPercentage = useCallback(() => {
    if (!progress || progress.totalScenarios === 0) return 0;
    return Math.round((progress.completedScenarios.length / progress.totalScenarios) * 100);
  }, [progress]);

  return {
    progress,
    isLoading,
    updateScenarioProgress,
    completeScenario,
    completeSubject,
    recordInteraction,
    clearProgress,
    getResumeData,
    getCompletionPercentage,
    saveProgress
  };
};