/**
 * Skill Progression Service
 * Manages student progression through skill categories using skillsDataComplete.ts
 * Handles A.0 (category headers) through A.1-A.5 (skills) to Review/Assessment
 */

import { skillsData, Skill, GradeSkills } from '../data/skillsDataComplete';

// ================================================================
// INTERFACES
// ================================================================

export interface SkillCategory {
  categoryHeader: Skill | null;  // A.0, B.0, etc.
  skills: Skill[];               // A.1-A.5, B.1-B.5, etc.
  cluster: string;               // "A.", "B.", etc.
}

export interface StudentProgress {
  studentId: string;
  grade: string;
  completedSkills: string[];      // ["A.1", "A.2", ...]
  currentCluster: string;          // "A.", "B.", etc.
  assessmentScores: {
    [cluster: string]: number;     // "A.": 85, "B.": 92
  };
}

export interface DailySkills {
  skillNumber: string;             // "A.1"
  subjects: Skill[];               // Math, ELA, Science, Social Studies skills for A.1
  categoryName: string;            // "Numbers to 3" (from A.0)
}

export type LearningAction = 
  | { type: 'learn'; skillNumber: string; }
  | { type: 'review'; cluster: string; }
  | { type: 'assessment'; cluster: string; }
  | { type: 'advance'; nextCluster: string; nextSkill: string; };

// ================================================================
// CORE FUNCTIONS
// ================================================================

/**
 * Get all skills for a specific skill number across all subjects
 * Example: getSkillsForDay('Kindergarten', 'A.1') returns Math, ELA, Science, Social Studies A.1 skills
 */
export const getSkillsForDay = (grade: string, skillNumber: string): DailySkills | null => {
  const gradeData = skillsData[grade];
  if (!gradeData) {
    console.warn(`No data found for grade: ${grade}`);
    return null;
  }
  
  const todaySkills: Skill[] = [];
  let categoryName = '';
  
  // Extract cluster from skill number (A.1 -> A.)
  const cluster = skillNumber.split('.')[0] + '.';
  
  // For each subject in this grade, get the matching skill
  Object.keys(gradeData).forEach(subject => {
    const subjectSkills = gradeData[subject];
    
    // Find category header if we haven't found it yet
    if (!categoryName) {
      const header = subjectSkills.find(skill => 
        skill.skillNumber === `${cluster}0`
      );
      if (header) {
        categoryName = header.skillName;
      }
    }
    
    // Find the specific skill
    const matchingSkill = subjectSkills.find(skill => 
      skill.skillNumber === skillNumber
    );
    
    if (matchingSkill) {
      todaySkills.push(matchingSkill);
    }
  });
  
  if (todaySkills.length === 0) {
    console.warn(`No skills found for ${grade} ${skillNumber}`);
    return null;
  }
  
  return {
    skillNumber,
    subjects: todaySkills,
    categoryName: categoryName || `${cluster} Skills`
  };
};

/**
 * Get all skills in a category for a specific grade and subject
 */
export const getSkillCategory = (
  grade: string, 
  subject: string, 
  cluster: string
): SkillCategory | null => {
  const gradeData = skillsData[grade];
  if (!gradeData || !gradeData[subject]) {
    console.warn(`No data found for ${grade} ${subject}`);
    return null;
  }
  
  const subjectSkills = gradeData[subject];
  
  // Find category header (A.0, B.0, etc.)
  const categoryHeader = subjectSkills.find(skill => 
    skill.skillCluster === cluster && 
    skill.skillNumber === `${cluster}0`
  );
  
  // Find all skills in this category (A.1, A.2, etc.)
  const categorySkills = subjectSkills
    .filter(skill =>
      skill.skillCluster === cluster && 
      skill.skillNumber !== `${cluster}0` // Exclude the header
    )
    .sort((a, b) => {
      // Sort by skill number (A.1, A.2, A.3...)
      const aNum = parseInt(a.skillNumber.split('.')[1]);
      const bNum = parseInt(b.skillNumber.split('.')[1]);
      return aNum - bNum;
    });
  
  return {
    categoryHeader,
    skills: categorySkills,
    cluster
  };
};

/**
 * Get all skills for a complete category across all subjects
 */
export const getCategorySkillsAcrossSubjects = (
  grade: string,
  cluster: string
): { [subject: string]: SkillCategory } => {
  const gradeData = skillsData[grade];
  if (!gradeData) return {};
  
  const result: { [subject: string]: SkillCategory } = {};
  
  Object.keys(gradeData).forEach(subject => {
    const category = getSkillCategory(grade, subject, cluster);
    if (category && category.skills.length > 0) {
      result[subject] = category;
    }
  });
  
  return result;
};

/**
 * Check if all skills in a category are complete
 */
export const isCategoryComplete = (
  grade: string,
  cluster: string,
  completedSkills: string[]
): boolean => {
  const categorySkills = getCategorySkillsAcrossSubjects(grade, cluster);
  
  // Check each subject
  for (const subject in categorySkills) {
    const category = categorySkills[subject];
    
    // Check if all skills in this category are completed
    for (const skill of category.skills) {
      if (!completedSkills.includes(skill.skillNumber)) {
        return false; // Found an incomplete skill
      }
    }
  }
  
  return true; // All skills in category are complete
};

/**
 * Get the next learning action for a student
 */
export const getNextLearningAction = (
  progress: StudentProgress
): LearningAction => {
  const { grade, completedSkills, currentCluster } = progress;
  
  // Get all skills in current cluster for Math (as reference)
  const mathCategory = getSkillCategory(grade, "Math", currentCluster);
  if (!mathCategory || mathCategory.skills.length === 0) {
    console.warn(`No skills found for ${grade} Math ${currentCluster}`);
    return { type: 'learn', skillNumber: `${currentCluster}1` };
  }
  
  // Find first incomplete skill
  for (const skill of mathCategory.skills) {
    if (!completedSkills.includes(skill.skillNumber)) {
      return { type: 'learn', skillNumber: skill.skillNumber };
    }
  }
  
  // All skills complete - check for review/assessment
  const reviewKey = `${currentCluster}review`;
  const assessmentKey = `${currentCluster}assessment`;
  
  if (!completedSkills.includes(reviewKey)) {
    return { type: 'review', cluster: currentCluster };
  }
  
  if (!completedSkills.includes(assessmentKey)) {
    return { type: 'assessment', cluster: currentCluster };
  }
  
  // Category complete - advance to next cluster
  const nextCluster = getNextCluster(currentCluster);
  return { 
    type: 'advance', 
    nextCluster, 
    nextSkill: `${nextCluster}1` 
  };
};

/**
 * Get next cluster in sequence (A. -> B. -> C.)
 */
export const getNextCluster = (currentCluster: string): string => {
  const clusterLetter = currentCluster.charAt(0);
  const nextLetter = String.fromCharCode(clusterLetter.charCodeAt(0) + 1);
  return `${nextLetter}.`;
};

/**
 * Get previous cluster in sequence (B. -> A.)
 */
export const getPreviousCluster = (currentCluster: string): string => {
  const clusterLetter = currentCluster.charAt(0);
  if (clusterLetter === 'A') return 'A.'; // Can't go before A
  const prevLetter = String.fromCharCode(clusterLetter.charCodeAt(0) - 1);
  return `${prevLetter}.`;
};

/**
 * Calculate progress percentage for a category
 */
export const getCategoryProgress = (
  grade: string,
  cluster: string,
  completedSkills: string[]
): number => {
  const mathCategory = getSkillCategory(grade, "Math", cluster);
  if (!mathCategory || mathCategory.skills.length === 0) return 0;
  
  const totalSkills = mathCategory.skills.length + 2; // +2 for review and assessment
  let completedCount = 0;
  
  // Count completed skills
  mathCategory.skills.forEach(skill => {
    if (completedSkills.includes(skill.skillNumber)) {
      completedCount++;
    }
  });
  
  // Check review and assessment
  if (completedSkills.includes(`${cluster}review`)) completedCount++;
  if (completedSkills.includes(`${cluster}assessment`)) completedCount++;
  
  return Math.round((completedCount / totalSkills) * 100);
};

/**
 * Get a student's current learning streak
 */
export const getLearningStreak = (completedSkills: string[]): number => {
  // Count consecutive days/skills completed
  // This is simplified - in production, you'd track actual dates
  return completedSkills.length;
};

/**
 * Determine if student qualifies for accelerated learning
 */
export const canAccelerate = (
  progress: StudentProgress,
  minAssessmentScore: number = 90
): boolean => {
  const { assessmentScores, currentCluster } = progress;
  
  // Check if previous cluster was passed with high score
  const prevCluster = getPreviousCluster(currentCluster);
  if (prevCluster !== 'A.' && assessmentScores[prevCluster] >= minAssessmentScore) {
    return true;
  }
  
  return false;
};

/**
 * Get skill recommendations based on performance
 */
export const getSkillRecommendations = (
  progress: StudentProgress
): { reinforceSkills: string[]; challengeSkills: string[] } => {
  // This would analyze performance data to recommend
  // skills that need reinforcement or challenge opportunities
  // Simplified for now
  return {
    reinforceSkills: [],
    challengeSkills: []
  };
};

// ================================================================
// VISUAL HELPERS
// ================================================================

/**
 * Format skill number for display (A.1 -> "Skill 1")
 */
export const formatSkillNumber = (skillNumber: string): string => {
  const parts = skillNumber.split('.');
  if (parts.length !== 2) return skillNumber;
  return `Skill ${parts[1]}`;
};

/**
 * Get emoji for skill mastery level
 */
export const getMasteryEmoji = (score: number): string => {
  if (score >= 95) return '🌟'; // Master
  if (score >= 85) return '⭐'; // Proficient
  if (score >= 75) return '✨'; // Developing
  return '💫'; // Learning
};

/**
 * Get encouraging message based on progress
 */
export const getProgressMessage = (
  progressPercent: number,
  cluster: string
): string => {
  if (progressPercent === 100) {
    return `Amazing! You've mastered all ${cluster} skills! 🎉`;
  } else if (progressPercent >= 80) {
    return `Almost there! Just a few more ${cluster} skills to go! 💪`;
  } else if (progressPercent >= 60) {
    return `Great progress! You're over halfway through ${cluster} skills! 🚀`;
  } else if (progressPercent >= 40) {
    return `Keep going! You're building strong ${cluster} foundations! 📚`;
  } else if (progressPercent >= 20) {
    return `Good start! Every ${cluster} skill makes you stronger! 🌱`;
  } else {
    return `Let's begin your ${cluster} journey! Exciting learning ahead! ✨`;
  }
};

// ================================================================
// BACKWARD COMPATIBILITY METHODS
// ================================================================

// Storage key for progress tracking
const PROGRESS_STORAGE_KEY = 'pathfinity-skill-progression';

interface SkillProgress {
  userId: string;
  grade: string;
  currentSkillGroup: string;  // "A", "B", "C"
  currentSkillNumber: number; // 1, 2, 3, 4, 5
  completedSkills: Record<string, string[]>; // subject -> skill IDs
  lastUpdated: string;
}

/**
 * Get current progress for a student
 */
export const getProgress = (userId: string, grade: string): SkillProgress => {
  const key = `${PROGRESS_STORAGE_KEY}-${userId}-${grade}`;
  const stored = localStorage.getItem(key);
  
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Default progress
  const defaultProgress: SkillProgress = {
    userId,
    grade,
    currentSkillGroup: 'A',
    currentSkillNumber: 1,
    completedSkills: {},
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem(key, JSON.stringify(defaultProgress));
  return defaultProgress;
};

/**
 * Get the appropriate skill for a subject based on progression
 */
export const getSkillForSubject = (
  subject: string,
  grade: string,
  userId: string,
  availableSkills: Skill[]
): Skill | null => {
  const progress = getProgress(userId, grade);
  const targetSkillNumber = `${progress.currentSkillGroup}.${progress.currentSkillNumber}`;
  
  // Find skill matching current progression
  const skill = availableSkills.find(s => 
    s.skillNumber === targetSkillNumber && !s.skillNumber.endsWith('.0')
  );
  
  if (skill) {
    return skill;
  }
  
  // Fallback to first non-header skill
  return availableSkills.find(s => !s.skillNumber.endsWith('.0')) || null;
};

/**
 * Mark a skill as completed
 */
export const markSkillCompleted = (
  userId: string,
  grade: string,
  subject: string,
  skillId: string
): void => {
  const progress = getProgress(userId, grade);
  
  if (!progress.completedSkills[subject]) {
    progress.completedSkills[subject] = [];
  }
  
  if (!progress.completedSkills[subject].includes(skillId)) {
    progress.completedSkills[subject].push(skillId);
    progress.lastUpdated = new Date().toISOString();
    
    const key = `${PROGRESS_STORAGE_KEY}-${userId}-${grade}`;
    localStorage.setItem(key, JSON.stringify(progress));
  }
};

/**
 * Check if all subjects completed for current skill group
 */
export const checkForGroupCompletion = (
  userId: string,
  grade: string
): boolean => {
  const progress = getProgress(userId, grade);
  const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
  const currentSkillId = `${progress.currentSkillGroup}.${progress.currentSkillNumber}`;
  
  // Check if all subjects have completed current skill
  const allCompleted = subjects.every(subject => {
    const completed = progress.completedSkills[subject] || [];
    return completed.some(id => id.includes(currentSkillId));
  });
  
  if (allCompleted) {
    // Use skillsData to determine actual progression, not assumptions
    const gradeData = skillsData[grade] || skillsData['Kindergarten'];
    
    // Check Math skills to determine cluster structure (all subjects should have same structure)
    const mathSkills = gradeData['Math'] || [];
    const currentCluster = progress.currentSkillGroup + '.';
    
    // Find the next skill number in current cluster
    const nextSkillNumber = progress.currentSkillNumber + 1;
    const nextSkillId = `${currentCluster}${nextSkillNumber}`;
    
    // Check if next skill exists in current cluster
    const nextSkillExists = mathSkills.some(skill => 
      skill.skillNumber === nextSkillId
    );
    
    if (nextSkillExists) {
      // Advance to next skill in same cluster
      progress.currentSkillNumber = nextSkillNumber;
    } else {
      // No more skills in current cluster, move to next cluster
      const nextCluster = getNextCluster(currentCluster);
      progress.currentSkillGroup = nextCluster.replace('.', '');
      
      // Check if new cluster starts at .0 (header) or .1
      const headerExists = mathSkills.some(skill => 
        skill.skillNumber === `${nextCluster}0`
      );
      const firstSkillExists = mathSkills.some(skill => 
        skill.skillNumber === `${nextCluster}1`
      );
      
      // Start at .1 if it exists (skip header for progression)
      progress.currentSkillNumber = firstSkillExists ? 1 : 0;
    }
    
    progress.lastUpdated = new Date().toISOString();
    const key = `${PROGRESS_STORAGE_KEY}-${userId}-${grade}`;
    localStorage.setItem(key, JSON.stringify(progress));
    
    return true;
  }
  
  return false;
};

/**
 * Reset progress for a user (useful for testing/development)
 */
export const resetProgress = (userId: string, grade: string): void => {
  const key = `${PROGRESS_STORAGE_KEY}-${userId}-${grade}`;
  localStorage.removeItem(key);
  console.log(`🔄 Reset skill progression for user ${userId} grade ${grade}`);
  
  // Create fresh progress starting at A.1
  const freshProgress: SkillProgress = {
    userId,
    grade,
    currentSkillGroup: 'A',
    currentSkillNumber: 1,
    completedSkills: {},
    lastUpdated: new Date().toISOString()
  };
  
  localStorage.setItem(key, JSON.stringify(freshProgress));
  console.log(`✅ User now starting at A.1`);
};

/**
 * Get progress summary text
 */
export const getProgressSummary = (
  userId: string,
  grade: string
): string => {
  const progress = getProgress(userId, grade);
  const totalCompleted = Object.values(progress.completedSkills)
    .reduce((sum, skills) => sum + skills.length, 0);
  
  return `Skill ${progress.currentSkillGroup}.${progress.currentSkillNumber} | ${totalCompleted} skills completed`;
};

// ================================================================
// EXPORT
// ================================================================

export const skillProgressionService = {
  // New architecture methods
  getSkillsForDay,
  getSkillCategory,
  getCategorySkillsAcrossSubjects,
  isCategoryComplete,
  getNextLearningAction,
  getNextCluster,
  getPreviousCluster,
  getCategoryProgress,
  getLearningStreak,
  canAccelerate,
  getSkillRecommendations,
  formatSkillNumber,
  getMasteryEmoji,
  getProgressMessage,
  // Backward compatibility methods
  getProgress,
  getSkillForSubject,
  markSkillCompleted,
  checkForGroupCompletion,
  getProgressSummary
};

export default skillProgressionService;