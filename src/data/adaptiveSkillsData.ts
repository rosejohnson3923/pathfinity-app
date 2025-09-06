// Core data structures for Pathfinity Revolutionary Adaptive Skills System
// Updated to work with existing user profiles

import { skillsData } from './skillsDataComplete';

// [Keep all the existing interfaces - UserProfile, UserProgress, Achievement, etc.]
export interface UserProfile {
  id: string;
  name: string;
  grade: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  avatar: string;
  role?: 'student' | 'teacher' | 'admin' | 'demo';
  preferences: {
    subjects: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    sessionLength: number;
  };
  progress: UserProgress;
}

export interface UserProgress {
  completedSkills: Set<string>;
  inProgressSkills: Set<string>;
  masteredSkills: Set<string>;
  totalTimeSpent: number;
  lastActiveDate: Date;
  streakDays: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: Date;
  category: 'completion' | 'streak' | 'mastery' | 'exploration';
}

export interface AdaptiveRecommendation {
  skill: any;
  reason: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  prerequisites: string[];
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  grade: string;
  subject: string;
  skills: any[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export interface ThemeConfig {
  grade: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  bgPattern: string;
  iconStyle: 'playful' | 'academic' | 'professional';
}

// Updated grade themes to include Kindergarten
export const GRADE_THEMES: Record<string, ThemeConfig> = {
  'Kindergarten': {
    grade: 'Kindergarten',
    primaryColor: '#FF9F43',
    secondaryColor: '#10ac84',
    accentColor: '#ff6b6b',
    gradientFrom: '#FF9F43',
    gradientTo: '#10ac84',
    bgPattern: 'bubbles',
    iconStyle: 'playful'
  },
  'Grade 3': {
    grade: 'Grade 3',
    primaryColor: '#FF6B6B',
    secondaryColor: '#4ECDC4',
    accentColor: '#FFE66D',
    gradientFrom: '#FF6B6B',
    gradientTo: '#4ECDC4',
    bgPattern: 'dots',
    iconStyle: 'playful'
  },
  'Grade 7': {
    grade: 'Grade 7',
    primaryColor: '#6C5CE7',
    secondaryColor: '#00B894',
    accentColor: '#FDCB6E',
    gradientFrom: '#6C5CE7',
    gradientTo: '#00B894',
    bgPattern: 'geometric',
    iconStyle: 'academic'
  },
  'Grade 10': {
    grade: 'Grade 10',
    primaryColor: '#2D3436',
    secondaryColor: '#0984E3',
    accentColor: '#E17055',
    gradientFrom: '#2D3436',
    gradientTo: '#0984E3',
    bgPattern: 'lines',
    iconStyle: 'professional'
  }
};

// Updated sample profiles to match your existing users
export const SAMPLE_PROFILES: UserProfile[] = [
  {
    id: 'demo_alex_k',
    name: 'Alex',
    grade: 'Kindergarten',
    learningStyle: 'visual',
    skillLevel: 'beginner',
    avatar: '🧒',
    role: 'demo',
    preferences: {
      subjects: ['Math', 'ELA', 'Science'],
      difficulty: 'easy',
      sessionLength: 10
    },
    progress: {
      completedSkills: new Set(['Math_K_1', 'ELA_K_1']),
      inProgressSkills: new Set(['Science_K_1']),
      masteredSkills: new Set(['Math_K_1']),
      totalTimeSpent: 120,
      lastActiveDate: new Date(),
      streakDays: 2,
      achievements: [
        {
          id: 'first_skill',
          name: 'First Steps',
          description: 'Completed your first skill!',
          icon: '🌟',
          earnedDate: new Date(),
          category: 'completion'
        }
      ]
    }
  },
];

// [Keep all the existing helper classes with same logic]
export class AdaptiveSkillsLoader {
  static getSkillsForUser(profile: UserProfile) {
    const gradeSkills = skillsData[profile.grade_level];
    return gradeSkills || {};
  }

  static getSkillsByStatus(profile: UserProfile, status: string) {
    const userSkills = this.getSkillsForUser(profile);
    const allSkills: any[] = [];
    
    Object.values(userSkills).forEach((skills: any) => {
      allSkills.push(...skills);
    });

    switch (status) {
      case 'completed':
        return allSkills.filter(skill => profile.progress.completedSkills.has(skill.id));
      case 'inProgress':
        return allSkills.filter(skill => profile.progress.inProgressSkills.has(skill.id));
      case 'available':
        return allSkills.filter(skill => 
          !profile.progress.completedSkills.has(skill.id) && 
          !profile.progress.inProgressSkills.has(skill.id)
        );
      default:
        return [];
    }
  }
}

export class AdaptiveRecommendations {
  static generateRecommendations(profile: UserProfile): AdaptiveRecommendation[] {
    const availableSkills = AdaptiveSkillsLoader.getSkillsByStatus(profile, 'available');
    
    return availableSkills.slice(0, 5).map(skill => ({
      skill,
      reason: `Perfect for ${profile.grade_level} ${profile.learningStyle} learners`,
      confidence: 0.8,
      priority: 'medium' as const,
      estimatedTime: profile.grade_level === 'Kindergarten' ? 10 : profile.grade_level === 'Grade 3' ? 15 : profile.grade_level === 'Grade 7' ? 25 : 35,
      prerequisites: []
    }));
  }

  static generateLearningPaths(profile: UserProfile): LearningPath[] {
    const userSkills = AdaptiveSkillsLoader.getSkillsForUser(profile);
    const paths: LearningPath[] = [];
    
    Object.entries(userSkills).forEach(([subject, skills]: [string, any]) => {
      if (Array.isArray(skills) && skills.length > 0) {
        paths.push({
          id: `path_${subject.replace(/\s+/g, '_').toLowerCase()}`,
          name: `${subject} for ${profile.grade_level}`,
          description: `Master ${subject} skills at the ${profile.grade_level} level`,
          grade: profile.grade_level,
          subject,
          skills: skills.slice(0, 5),
          estimatedDuration: skills.length * (profile.grade_level === 'Kindergarten' ? 10 : profile.grade_level === 'Grade 3' ? 15 : 25),
          difficulty: profile.skillLevel,
          tags: [subject, profile.grade_level]
        });
      }
    });
    
    return paths;
  }
}

export class ProgressAnalytics {
  static getCompletionPercentage(profile: UserProfile): number {
    const totalSkills = this.getTotalAvailableSkills(profile);
    const completedSkills = profile.progress.completedSkills.size;
    return totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;
  }

  static getTotalAvailableSkills(profile: UserProfile): number {
    const userSkills = AdaptiveSkillsLoader.getSkillsForUser(profile);
    return Object.values(userSkills).reduce((total: number, skills: any) => total + (Array.isArray(skills) ? skills.length : 0), 0);
  }

  static getWeeklyProgress(profile: UserProfile) {
    return {
      skillsCompleted: Math.min(profile.progress.completedSkills.size, 7),
      timeSpent: Math.min(profile.progress.totalTimeSpent, 180),
      newAchievements: profile.progress.achievements.length
    };
  }

  static getSubjectProgress(profile: UserProfile) {
    const userSkills = AdaptiveSkillsLoader.getSkillsForUser(profile);
    const progress: Record<string, any> = {};

    Object.entries(userSkills).forEach(([subject, skills]: [string, any]) => {
      const skillsArray = Array.isArray(skills) ? skills : [];
      const completed = skillsArray.filter((skill: any) => 
        profile.progress.completedSkills.has(skill.id)
      ).length;
      
      const total = skillsArray.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      progress[subject] = { completed, total, percentage };
    });

    return progress;
  }
}

export default {
  SAMPLE_PROFILES,
  GRADE_THEMES,
  AdaptiveSkillsLoader,
  AdaptiveRecommendations,
  ProgressAnalytics
};