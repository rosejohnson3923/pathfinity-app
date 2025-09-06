/**
 * Grade Utilities
 * Centralized grade formatting and mapping functions
 */

/**
 * Convert grade code to display format
 * Examples: 'K' → 'Kindergarten', '1' → '1st', '7' → '7th', '10' → '10th'
 */
export function getGradeDisplay(grade: string | number | null | undefined): string {
  if (!grade) return 'Kindergarten';
  
  const gradeStr = String(grade).toUpperCase();
  
  // Handle Kindergarten and Pre-K
  if (gradeStr === 'K' || gradeStr === 'KINDERGARTEN') {
    return 'Kindergarten';
  }
  if (gradeStr === 'PRE-K' || gradeStr === 'PREK') {
    return 'Pre-K';
  }
  
  // Extract numeric grade
  const gradeNum = parseInt(gradeStr);
  if (isNaN(gradeNum)) {
    return gradeStr; // Return as-is if not a number
  }
  
  // Convert to ordinal (1st, 2nd, 3rd, etc.)
  return getOrdinal(gradeNum);
}

/**
 * Convert number to ordinal string
 * Examples: 1 → '1st', 2 → '2nd', 11 → '11th'
 */
export function getOrdinal(num: number): string {
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  
  // Special cases for 11th, 12th, 13th
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${num}th`;
  }
  
  // Regular cases
  switch (lastDigit) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;
    default:
      return `${num}th`;
  }
}

/**
 * Get grade level for display in sentences
 * Examples: 'K' → 'Kindergarten', '1' → '1st Grade', '7' → '7th Grade'
 */
export function getGradeLevelDisplay(grade: string | number | null | undefined): string {
  if (!grade) return 'Kindergarten';
  
  const gradeStr = String(grade).toUpperCase();
  
  // Special cases
  if (gradeStr === 'K' || gradeStr === 'KINDERGARTEN') {
    return 'Kindergarten';
  }
  if (gradeStr === 'PRE-K' || gradeStr === 'PREK') {
    return 'Pre-K';
  }
  
  // Numeric grades - use ordinal format
  const gradeNum = parseInt(gradeStr);
  if (!isNaN(gradeNum)) {
    return `${getOrdinal(gradeNum)} Grade`;
  }
  
  return gradeStr;
}

/**
 * Get possessive form of grade
 * Examples: '1' → '1st grade', '7' → '7th grade'
 */
export function getGradePossessive(grade: string | number | null | undefined): string {
  const display = getGradeDisplay(grade);
  
  if (display === 'Kindergarten' || display === 'Pre-K') {
    return display;
  }
  
  return `${display} grade`;
}

/**
 * Map grade to skill data key (for skillsData structure)
 * K-2 → 'Kindergarten', 3-6 → 'Grade 3', 7-9 → 'Grade 7', 10-12 → 'Grade 10'
 */
export function getGradeSkillKey(grade: string | number | null | undefined): string {
  if (!grade) return 'Kindergarten';
  
  const gradeStr = String(grade).toUpperCase();
  
  // Handle K specifically
  if (gradeStr === 'K' || gradeStr === 'PRE-K' || gradeStr === 'PREK') {
    return 'Kindergarten';
  }
  
  const gradeNum = parseInt(gradeStr);
  if (isNaN(gradeNum)) {
    return 'Kindergarten'; // Default fallback
  }
  
  // Map to skill data groups
  if (gradeNum <= 2) return 'Kindergarten';
  if (gradeNum <= 6) return 'Grade 3';
  if (gradeNum <= 9) return 'Grade 7';
  return 'Grade 10';
}

/**
 * Check if a grade is elementary (K-5)
 */
export function isElementaryGrade(grade: string | number | null | undefined): boolean {
  const gradeStr = String(grade || 'K').toUpperCase();
  if (gradeStr === 'K' || gradeStr === 'PRE-K') return true;
  
  const gradeNum = parseInt(gradeStr);
  return !isNaN(gradeNum) && gradeNum >= 1 && gradeNum <= 5;
}

/**
 * Check if a grade is middle school (6-8)
 */
export function isMiddleSchoolGrade(grade: string | number | null | undefined): boolean {
  const gradeStr = String(grade || 'K').toUpperCase();
  const gradeNum = parseInt(gradeStr);
  return !isNaN(gradeNum) && gradeNum >= 6 && gradeNum <= 8;
}

/**
 * Check if a grade is high school (9-12)
 */
export function isHighSchoolGrade(grade: string | number | null | undefined): boolean {
  const gradeStr = String(grade || 'K').toUpperCase();
  const gradeNum = parseInt(gradeStr);
  return !isNaN(gradeNum) && gradeNum >= 9 && gradeNum <= 12;
}

// Export a constant mapping for quick lookups
export const GRADE_DISPLAY_MAP: Record<string, string> = {
  'PRE-K': 'Pre-K',
  'K': 'Kindergarten',
  '1': '1st',
  '2': '2nd',
  '3': '3rd',
  '4': '4th',
  '5': '5th',
  '6': '6th',
  '7': '7th',
  '8': '8th',
  '9': '9th',
  '10': '10th',
  '11': '11th',
  '12': '12th'
};

export const GRADE_LEVEL_MAP: Record<string, string> = {
  'PRE-K': 'Pre-K',
  'K': 'Kindergarten',
  '1': '1st Grade',
  '2': '2nd Grade',
  '3': '3rd Grade',
  '4': '4th Grade',
  '5': '5th Grade',
  '6': '6th Grade',
  '7': '7th Grade',
  '8': '8th Grade',
  '9': '9th Grade',
  '10': '10th Grade',
  '11': '11th Grade',
  '12': '12th Grade'
};