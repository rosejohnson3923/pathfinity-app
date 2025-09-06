// Adaptive Data Provider - Context for managing adaptive learning state
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  AdaptiveRecommendation,
  LearningPath,
  ThemeConfig,
  SAMPLE_PROFILES,
  GRADE_THEMES,
  AdaptiveSkillsLoader,
  AdaptiveRecommendations,
  ProgressAnalytics
} from '../data/adaptiveSkillsData';
import { SkillHierarchyProcessor, EnhancedFinnOrchestrationEngine } from '../utils/EnhancedSkillProcessor';

// Context Interface
interface AdaptiveDataContextType {
  currentProfile: UserProfile | null;
  currentTheme: ThemeConfig;
  isLoading: boolean;
  profiles: UserProfile[];
  switchProfile: (profileId: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  availableSkills: any[];
  completedSkills: any[];
  inProgressSkills: any[];
  startSkill: (skillId: string) => void;
  completeSkill: (skillId: string) => void;
  recommendations: AdaptiveRecommendation[];
  learningPaths: LearningPath[];
  refreshRecommendations: () => void;
  completionPercentage: number;
  weeklyProgress: {
    skillsCompleted: number;
    timeSpent: number;
    newAchievements: number;
  };
  subjectProgress: Record<string, {
    completed: number;
    total: number;
    percentage: number;
  }>;
  getRecommendedSkills: (subject?: string) => any[];
  getSkillsByDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => any[];
  searchSkills: (query: string) => any[];
  dailyPlan: any;
  refreshDailyPlan: () => void;
}

const AdaptiveDataContext = createContext<AdaptiveDataContextType | undefined>(undefined);

interface AdaptiveDataProviderProps {
  children: ReactNode;
  initialProfileId?: string;
}

export const AdaptiveDataProvider: React.FC<AdaptiveDataProviderProps> = ({
  children,
  initialProfileId
}) => {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>(SAMPLE_PROFILES);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendation[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [dailyPlan, setDailyPlan] = useState<any>(null);

  const currentTheme = currentProfile ? GRADE_THEMES[currentProfile.grade] : GRADE_THEMES['Grade 3'];
  
  // Enhanced skill loading that excludes section titles
  const availableSkills = currentProfile 
    ? SkillHierarchyProcessor.getAssignableSkills(
        AdaptiveSkillsLoader.getSkillsByStatus(currentProfile, 'available')
      )
    : [];
    
  const completedSkills = currentProfile 
    ? SkillHierarchyProcessor.getAssignableSkills(
        AdaptiveSkillsLoader.getSkillsByStatus(currentProfile, 'completed')
      )
    : [];
    
  const inProgressSkills = currentProfile 
    ? SkillHierarchyProcessor.getAssignableSkills(
        AdaptiveSkillsLoader.getSkillsByStatus(currentProfile, 'inProgress')
      )
    : [];

  const completionPercentage = currentProfile 
    ? ProgressAnalytics.getCompletionPercentage(currentProfile)
    : 0;
    
  const weeklyProgress = currentProfile 
    ? ProgressAnalytics.getWeeklyProgress(currentProfile)
    : { skillsCompleted: 0, timeSpent: 0, newAchievements: 0 };
    
  const subjectProgress = currentProfile 
    ? ProgressAnalytics.getSubjectProgress(currentProfile)
    : {};

  useEffect(() => {
    if (initialProfileId) {
      const profile = profiles.find(p => p.id === initialProfileId);
      if (profile) {
        setCurrentProfile(profile);
      }
    }
    setIsLoading(false);
  }, [initialProfileId, profiles]);

  useEffect(() => {
    if (currentProfile) {
      refreshRecommendations();
      refreshDailyPlan();
    }
  }, [currentProfile]);

  const refreshDailyPlan = async () => {
    if (!currentProfile) return;
    
    try {
      const plan = await EnhancedFinnOrchestrationEngine.generateDailyPlan(currentProfile);
      setDailyPlan(plan);
      console.log('Enhanced Daily Plan:', plan);
    } catch (error) {
      console.error('Error generating daily plan:', error);
    }
  };

  const switchProfile = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setCurrentProfile(profile);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!currentProfile) return;
    
    const updatedProfile = { ...currentProfile, ...updates };
    setCurrentProfile(updatedProfile);
    
    setProfiles(prev => 
      prev.map(p => p.id === currentProfile.id ? updatedProfile : p)
    );
  };

  const startSkill = (skillId: string) => {
    if (!currentProfile) return;
    
    const updatedProgress = {
      ...currentProfile.progress,
      inProgressSkills: new Set([...currentProfile.progress.inProgressSkills, skillId])
    };
    
    updateProfile({ progress: updatedProgress });
  };

  const completeSkill = (skillId: string) => {
    if (!currentProfile) return;
    
    const updatedProgress = {
      ...currentProfile.progress,
      completedSkills: new Set([...currentProfile.progress.completedSkills, skillId]),
      inProgressSkills: new Set([...currentProfile.progress.inProgressSkills].filter(id => id !== skillId)),
      totalTimeSpent: currentProfile.progress.totalTimeSpent + 15,
      lastActiveDate: new Date()
    };
    
    updateProfile({ progress: updatedProgress });
  };

  const refreshRecommendations = () => {
    if (!currentProfile) return;
    
    const newRecommendations = AdaptiveRecommendations.generateRecommendations(currentProfile);
    const newLearningPaths = AdaptiveRecommendations.generateLearningPaths(currentProfile);
    
    setRecommendations(newRecommendations);
    setLearningPaths(newLearningPaths);
  };

  const getRecommendedSkills = (subject?: string): any[] => {
    if (!currentProfile) return [];
    
    // Use enhanced skill processing to get only assignable skills
    const allAvailableSkills = SkillHierarchyProcessor.getAssignableSkills(availableSkills);
    let filtered = allAvailableSkills;
    
    if (subject) {
      filtered = filtered.filter(skill => skill.subject === subject);
    }
    
    return filtered.slice(0, 5);
  };

  const getSkillsByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): any[] => {
    if (!currentProfile) return [];
    
    return availableSkills.filter((skill: any) => {
      const skillNumber = parseInt(skill.skillNumber.split('.')[1] || '0');
      
      switch (difficulty) {
        case 'easy':
          return skillNumber <= 3;
        case 'medium':
          return skillNumber > 3 && skillNumber <= 7;
        case 'hard':
          return skillNumber > 7;
        default:
          return true;
      }
    });
  };

  const searchSkills = (query: string): any[] => {
    if (!currentProfile || !query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    const userSkills = AdaptiveSkillsLoader.getSkillsForUser(currentProfile);
    const allSkills: any[] = [];
    
    Object.values(userSkills).forEach((skills: any) => {
      if (Array.isArray(skills)) {
        allSkills.push(...skills);
      }
    });
    
    return allSkills.filter((skill: any) =>
      skill.skillName.toLowerCase().includes(lowerQuery) ||
      skill.subject.toLowerCase().includes(lowerQuery) ||
      skill.skillsArea.toLowerCase().includes(lowerQuery) ||
      skill.description?.toLowerCase().includes(lowerQuery)
    );
  };

  const contextValue: AdaptiveDataContextType = {
    currentProfile,
    currentTheme,
    isLoading,
    profiles,
    switchProfile,
    updateProfile,
    availableSkills,
    completedSkills,
    inProgressSkills,
    startSkill,
    completeSkill,
    recommendations,
    learningPaths,
    refreshRecommendations,
    completionPercentage,
    weeklyProgress,
    subjectProgress,
    getRecommendedSkills,
    getSkillsByDifficulty,
    searchSkills,
    dailyPlan,
    refreshDailyPlan
  };

  return (
    <AdaptiveDataContext.Provider value={contextValue}>
      {children}
    </AdaptiveDataContext.Provider>
  );
};

export const useAdaptiveData = (): AdaptiveDataContextType => {
  const context = useContext(AdaptiveDataContext);
  if (context === undefined) {
    throw new Error('useAdaptiveData must be used within an AdaptiveDataProvider');
  }
  return context;
};

export default AdaptiveDataProvider;