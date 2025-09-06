// User Profile Integration - Connect real authentication with adaptive system
// This bridges the gap between authenticated users and the adaptive learning system

import { UserProfile } from '../data/adaptiveSkillsData';

// Function to create a user profile from authenticated user data
export function createUserProfileFromAuth(authUser: any, userPreferences?: any): UserProfile {
  // Extract grade from user metadata or preferences
  const grade = userPreferences?.grade || authUser?.user_metadata?.grade || 'Grade 3';
  
  // Extract learning style from preferences or default to mixed
  const learningStyle = userPreferences?.learningStyle || authUser?.user_metadata?.learningStyle || 'mixed';
  
  // Determine skill level based on grade or assessment
  const skillLevel = getSkillLevelFromGrade(grade);
  
  // Get subjects based on grade
  const subjects = getSubjectsForGrade(grade);
  
  return {
    id: authUser.id,
    name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Student',
    grade,
    learningStyle: learningStyle as any,
    skillLevel,
    avatar: getUserAvatar(grade),
    role: 'student', // Real users are students by default
    preferences: {
      subjects,
      difficulty: userPreferences?.difficulty || 'medium',
      sessionLength: getSessionLengthForGrade(grade)
    },
    progress: {
      completedSkills: new Set(userPreferences?.completedSkills || []),
      inProgressSkills: new Set(userPreferences?.inProgressSkills || []),
      masteredSkills: new Set(userPreferences?.masteredSkills || []),
      totalTimeSpent: userPreferences?.totalTimeSpent || 0,
      lastActiveDate: new Date(),
      streakDays: userPreferences?.streakDays || 0,
      achievements: userPreferences?.achievements || []
    }
  };
}

// Helper function to determine skill level from grade
function getSkillLevelFromGrade(grade: string): 'beginner' | 'intermediate' | 'advanced' {
  if (grade === 'Kindergarten' || grade === 'Grade 1' || grade === 'Grade 2') {
    return 'beginner';
  } else if (grade === 'Grade 3' || grade === 'Grade 4' || grade === 'Grade 5' || grade === 'Grade 6' || grade === 'Grade 7') {
    return 'intermediate';
  } else {
    return 'advanced';
  }
}

// Helper function to get subjects for grade level
function getSubjectsForGrade(grade: string): string[] {
  if (grade === 'Kindergarten') {
    return ['Math', 'ELA', 'Science'];
  } else if (grade.includes('Grade') && parseInt(grade.split(' ')[1]) <= 8) {
    return ['Math', 'ELA', 'Science', 'Social Studies'];
  } else {
    return ['Algebra I', 'Pre-Calculus', 'Physics', 'Chemistry', 'Biology'];
  }
}

// Helper function to get appropriate avatar for grade
function getUserAvatar(grade: string): string {
  if (grade === 'Kindergarten') return '🧒';
  if (grade === 'Grade 1' || grade === 'Grade 2' || grade === 'Grade 3') return '👧';
  if (grade === 'Grade 4' || grade === 'Grade 5' || grade === 'Grade 6' || grade === 'Grade 7') return '🧑';
  return '👨‍🎓';
}

// Helper function to get session length based on grade
function getSessionLengthForGrade(grade: string): number {
  if (grade === 'Kindergarten') return 10;
  if (grade === 'Grade 1' || grade === 'Grade 2' || grade === 'Grade 3') return 15;
  if (grade.includes('Grade') && parseInt(grade.split(' ')[1]) <= 8) return 25;
  return 40;
}

// Function to save user progress to database
export async function saveUserProgress(userId: string, progress: any) {
  try {
    // In a real implementation, this would save to Supabase or your database
    localStorage.setItem(`pathfinity_progress_${userId}`, JSON.stringify(progress));
    console.log('Progress saved for user:', userId);
  } catch (error) {
    console.error('Error saving user progress:', error);
  }
}

// Function to load user progress from database
export async function loadUserProgress(userId: string) {
  try {
    // In a real implementation, this would load from Supabase or your database
    const saved = localStorage.getItem(`pathfinity_progress_${userId}`);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading user progress:', error);
    return null;
  }
}

// Function to check if user is in demo mode
export function isDemoUser(profile: UserProfile | null): boolean {
  return profile?.id.includes('demo') || profile?.role === 'demo' || false;
}

// Function to check if user can switch profiles (demo/admin only)
export function canSwitchProfiles(profile: UserProfile | null): boolean {
  return isDemoUser(profile) || profile?.role === 'admin' || false;
}

export default {
  createUserProfileFromAuth,
  saveUserProgress,
  loadUserProgress,
  isDemoUser,
  canSwitchProfiles
};