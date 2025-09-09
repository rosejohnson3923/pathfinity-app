/**
 * Static career basic information for display purposes
 * This data is used for the career selection grid WITHOUT making API calls
 * Enriched data is only fetched when user previews or selects a career
 */

export interface CareerBasic {
  id: string;
  name: string;
  icon: string;
  color: string;
  quickDesc: string;
  category: string;
  subjects: string[];
  gradeRange: {
    min: number; // 0 = K, 1-12 for grades
    max: number;
  };
}

// Career categories for grouping
export const CAREER_CATEGORIES = {
  HEALTHCARE: 'Healthcare',
  EDUCATION: 'Education',
  STEM: 'Science & Technology',
  ARTS_CREATIVE: 'Arts & Creative',
  BUSINESS: 'Business & Finance',
  PUBLIC_SERVICE: 'Public Service',
  SPORTS_FITNESS: 'Sports & Fitness',
  ENVIRONMENT: 'Environment & Agriculture',
  MEDIA_COMMUNICATION: 'Media & Communication',
  ENGINEERING: 'Engineering',
  HOSPITALITY: 'Hospitality & Service'
};

// Grade-appropriate career definitions
export const CAREER_BASICS: Record<string, CareerBasic> = {
  // Healthcare Careers
  'doctor': {
    id: 'doctor',
    name: 'Doctor',
    icon: '👩‍⚕️',
    color: '#10B981',
    quickDesc: 'Help people feel better',
    category: CAREER_CATEGORIES.HEALTHCARE,
    subjects: ['science', 'math', 'ela'],
    gradeRange: { min: 0, max: 12 }
  },
  'nurse': {
    id: 'nurse',
    name: 'Nurse',
    icon: '👩‍⚕️',
    color: '#E11D48',
    quickDesc: 'Care for patients',
    category: CAREER_CATEGORIES.HEALTHCARE,
    subjects: ['science', 'math', 'ela'],
    gradeRange: { min: 6, max: 12 }
  },
  'veterinarian': {
    id: 'veterinarian',
    name: 'Veterinarian',
    icon: '🐾',
    color: '#84CC16',
    quickDesc: 'Help animals',
    category: CAREER_CATEGORIES.HEALTHCARE,
    subjects: ['science', 'math'],
    gradeRange: { min: 0, max: 12 }
  },
  'surgeon': {
    id: 'surgeon',
    name: 'Surgeon',
    icon: '🏥',
    color: '#DC2626',
    quickDesc: 'Perform operations',
    category: CAREER_CATEGORIES.HEALTHCARE,
    subjects: ['science', 'math'],
    gradeRange: { min: 9, max: 12 }
  },
  'psychologist': {
    id: 'psychologist',
    name: 'Psychologist',
    icon: '🧠',
    color: '#9333EA',
    quickDesc: 'Understand minds',
    category: CAREER_CATEGORIES.HEALTHCARE,
    subjects: ['science', 'social', 'ela'],
    gradeRange: { min: 9, max: 12 }
  },

  // Education Careers
  'teacher': {
    id: 'teacher',
    name: 'Teacher',
    icon: '📚',
    color: '#6366F1',
    quickDesc: 'Help students learn',
    category: CAREER_CATEGORIES.EDUCATION,
    subjects: ['ela', 'math', 'science', 'social'],
    gradeRange: { min: 0, max: 12 }
  },

  // Science & Technology Careers
  'scientist': {
    id: 'scientist',
    name: 'Scientist',
    icon: '🔬',
    color: '#10B981',
    quickDesc: 'Make discoveries',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['science', 'math'],
    gradeRange: { min: 0, max: 12 }
  },
  'programmer': {
    id: 'programmer',
    name: 'Programmer',
    icon: '💻',
    color: '#7C3AED',
    quickDesc: 'Create software',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['math', 'science'],
    gradeRange: { min: 6, max: 12 }
  },
  'data-scientist': {
    id: 'data-scientist',
    name: 'Data Scientist',
    icon: '📊',
    color: '#0891B2',
    quickDesc: 'Analyze data',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'marine-biologist': {
    id: 'marine-biologist',
    name: 'Marine Biologist',
    icon: '🐠',
    color: '#0D9488',
    quickDesc: 'Study ocean life',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['science', 'math'],
    gradeRange: { min: 9, max: 12 }
  },
  'ai-ml-engineer': {
    id: 'ai-ml-engineer',
    name: 'AI/ML Engineer',
    icon: '🤖',
    color: '#8B5CF6',
    quickDesc: 'Create AI systems',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'cybersecurity-specialist': {
    id: 'cybersecurity-specialist',
    name: 'Cybersecurity Specialist',
    icon: '🔒',
    color: '#DC2626',
    quickDesc: 'Protect digital systems',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'software-engineer': {
    id: 'software-engineer',
    name: 'Software Engineer',
    icon: '💾',
    color: '#6366F1',
    quickDesc: 'Build software systems',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'mobile-app-developer': {
    id: 'mobile-app-developer',
    name: 'Mobile App Developer',
    icon: '📱',
    color: '#F97316',
    quickDesc: 'Create mobile apps',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'biotech-researcher': {
    id: 'biotech-researcher',
    name: 'Biotech Researcher',
    icon: '🧬',
    color: '#7C3AED',
    quickDesc: 'Research biotechnology',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['science', 'math'],
    gradeRange: { min: 9, max: 12 }
  },
  'blockchain-developer': {
    id: 'blockchain-developer',
    name: 'Blockchain Developer',
    icon: '🔗',
    color: '#F59E0B',
    quickDesc: 'Build blockchain apps',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },

  // Arts & Creative Careers
  'artist': {
    id: 'artist',
    name: 'Artist',
    icon: '🎨',
    color: '#F59E0B',
    quickDesc: 'Create beautiful art',
    category: CAREER_CATEGORIES.ARTS_CREATIVE,
    subjects: ['ela', 'social'],
    gradeRange: { min: 0, max: 12 }
  },
  'musician': {
    id: 'musician',
    name: 'Musician',
    icon: '🎵',
    color: '#6366F1',
    quickDesc: 'Create music',
    category: CAREER_CATEGORIES.ARTS_CREATIVE,
    subjects: ['ela', 'math'],
    gradeRange: { min: 0, max: 12 }
  },
  'writer': {
    id: 'writer',
    name: 'Writer',
    icon: '✍️',
    color: '#D97706',
    quickDesc: 'Tell stories',
    category: CAREER_CATEGORIES.ARTS_CREATIVE,
    subjects: ['ela', 'social'],
    gradeRange: { min: 6, max: 12 }
  },
  'photographer': {
    id: 'photographer',
    name: 'Photographer',
    icon: '📷',
    color: '#7E22CE',
    quickDesc: 'Capture moments',
    category: CAREER_CATEGORIES.ARTS_CREATIVE,
    subjects: ['ela', 'science'],
    gradeRange: { min: 6, max: 12 }
  },
  'dancer': {
    id: 'dancer',
    name: 'Dancer',
    icon: '💃',
    color: '#BE185D',
    quickDesc: 'Express through movement',
    category: CAREER_CATEGORIES.ARTS_CREATIVE,
    subjects: ['ela', 'science'],
    gradeRange: { min: 6, max: 12 }
  },
  'game-designer': {
    id: 'game-designer',
    name: 'Game Designer',
    icon: '🎮',
    color: '#F97316',
    quickDesc: 'Create games',
    category: CAREER_CATEGORIES.ARTS_CREATIVE,
    subjects: ['math', 'science', 'ela'],
    gradeRange: { min: 6, max: 12 }
  },

  // Business & Finance Careers
  'entrepreneur': {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    icon: '💼',
    color: '#EA580C',
    quickDesc: 'Start businesses',
    category: CAREER_CATEGORIES.BUSINESS,
    subjects: ['math', 'social', 'ela'],
    gradeRange: { min: 9, max: 12 }
  },
  'investment-banker': {
    id: 'investment-banker',
    name: 'Investment Banker',
    icon: '💰',
    color: '#10B981',
    quickDesc: 'Manage investments',
    category: CAREER_CATEGORIES.BUSINESS,
    subjects: ['math', 'social'],
    gradeRange: { min: 9, max: 12 }
  },
  'marketing-director': {
    id: 'marketing-director',
    name: 'Marketing Director',
    icon: '📈',
    color: '#EC4899',
    quickDesc: 'Lead marketing strategy',
    category: CAREER_CATEGORIES.BUSINESS,
    subjects: ['ela', 'social', 'math'],
    gradeRange: { min: 9, max: 12 }
  },
  'financial-analyst': {
    id: 'financial-analyst',
    name: 'Financial Analyst',
    icon: '📊',
    color: '#14B8A6',
    quickDesc: 'Analyze finances',
    category: CAREER_CATEGORIES.BUSINESS,
    subjects: ['math', 'social'],
    gradeRange: { min: 9, max: 12 }
  },
  'ceo': {
    id: 'ceo',
    name: 'Chief Executive Officer',
    icon: '👔',
    color: '#1E40AF',
    quickDesc: 'Lead companies',
    category: CAREER_CATEGORIES.BUSINESS,
    subjects: ['ela', 'math', 'social'],
    gradeRange: { min: 9, max: 12 }
  },

  // Public Service Careers
  'police-officer': {
    id: 'police-officer',
    name: 'Police Officer',
    icon: '👮',
    color: '#1E40AF',
    quickDesc: 'Protect and serve',
    category: CAREER_CATEGORIES.PUBLIC_SERVICE,
    subjects: ['social', 'ela'],
    gradeRange: { min: 6, max: 12 }
  },
  'firefighter': {
    id: 'firefighter',
    name: 'Firefighter',
    icon: '🚒',
    color: '#DC2626',
    quickDesc: 'Save lives',
    category: CAREER_CATEGORIES.PUBLIC_SERVICE,
    subjects: ['science', 'math'],
    gradeRange: { min: 6, max: 12 }
  },
  'social-worker': {
    id: 'social-worker',
    name: 'Social Worker',
    icon: '🤝',
    color: '#7C3AED',
    quickDesc: 'Help communities',
    category: CAREER_CATEGORIES.PUBLIC_SERVICE,
    subjects: ['social', 'ela'],
    gradeRange: { min: 6, max: 12 }
  },
  'lawyer': {
    id: 'lawyer',
    name: 'Lawyer',
    icon: '⚖️',
    color: '#991B1B',
    quickDesc: 'Fight for justice',
    category: CAREER_CATEGORIES.PUBLIC_SERVICE,
    subjects: ['ela', 'social'],
    gradeRange: { min: 9, max: 12 }
  },

  // Sports & Fitness Careers
  'athlete': {
    id: 'athlete',
    name: 'Athlete',
    icon: '⚽',
    color: '#EF4444',
    quickDesc: 'Play sports',
    category: CAREER_CATEGORIES.SPORTS_FITNESS,
    subjects: ['science', 'math'],
    gradeRange: { min: 0, max: 12 }
  },
  'professional-athlete': {
    id: 'professional-athlete',
    name: 'Professional Athlete',
    icon: '🏆',
    color: '#F59E0B',
    quickDesc: 'Compete professionally',
    category: CAREER_CATEGORIES.SPORTS_FITNESS,
    subjects: ['science', 'math'],
    gradeRange: { min: 6, max: 12 }
  },

  // Environment & Agriculture Careers
  'farmer': {
    id: 'farmer',
    name: 'Farmer',
    icon: '🌾',
    color: '#65A30D',
    quickDesc: 'Grow food',
    category: CAREER_CATEGORIES.ENVIRONMENT,
    subjects: ['science', 'math'],
    gradeRange: { min: 0, max: 12 }
  },

  // Media & Communication Careers
  'youtuber': {
    id: 'youtuber',
    name: 'YouTuber',
    icon: '📹',
    color: '#EF4444',
    quickDesc: 'Create content',
    category: CAREER_CATEGORIES.MEDIA_COMMUNICATION,
    subjects: ['ela', 'social'],
    gradeRange: { min: 6, max: 12 }
  },

  // Engineering Careers
  'engineer': {
    id: 'engineer',
    name: 'Engineer',
    icon: '⚙️',
    color: '#059669',
    quickDesc: 'Design solutions',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'builder': {
    id: 'builder',
    name: 'Builder',
    icon: '🏗️',
    color: '#8B5CF6',
    quickDesc: 'Construct structures',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['math', 'science'],
    gradeRange: { min: 0, max: 12 }
  },
  'architect': {
    id: 'architect',
    name: 'Architect',
    icon: '🏛️',
    color: '#4338CA',
    quickDesc: 'Design buildings',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['math', 'science', 'ela'],
    gradeRange: { min: 9, max: 12 }
  },
  'robotics-engineer': {
    id: 'robotics-engineer',
    name: 'Robotics Engineer',
    icon: '🤖',
    color: '#6366F1',
    quickDesc: 'Build robots',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'aerospace-engineer': {
    id: 'aerospace-engineer',
    name: 'Aerospace Engineer',
    icon: '🚀',
    color: '#0EA5E9',
    quickDesc: 'Design aircraft',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'renewable-energy-engineer': {
    id: 'renewable-energy-engineer',
    name: 'Renewable Energy Engineer',
    icon: '⚡',
    color: '#10B981',
    quickDesc: 'Create clean energy',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['science', 'math'],
    gradeRange: { min: 9, max: 12 }
  },
  'cloud-architect': {
    id: 'cloud-architect',
    name: 'Cloud Architect',
    icon: '☁️',
    color: '#0EA5E9',
    quickDesc: 'Design cloud systems',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'astronaut': {
    id: 'astronaut',
    name: 'Astronaut',
    icon: '🚀',
    color: '#0EA5E9',
    quickDesc: 'Explore space',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['science', 'math'],
    gradeRange: { min: 9, max: 12 }
  },
  'pilot': {
    id: 'pilot',
    name: 'Pilot',
    icon: '✈️',
    color: '#0284C7',
    quickDesc: 'Fly aircraft',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },

  // Hospitality & Service Careers
  'chef': {
    id: 'chef',
    name: 'Chef',
    icon: '👨‍🍳',
    color: '#EC4899',
    quickDesc: 'Create delicious meals',
    category: CAREER_CATEGORIES.HOSPITALITY,
    subjects: ['math', 'science', 'ela'],
    gradeRange: { min: 0, max: 12 }
  }
};

/**
 * Get careers appropriate for a specific grade level
 */
export function getCareersForGrade(gradeLevel: number): CareerBasic[] {
  return Object.values(CAREER_BASICS).filter(career => 
    gradeLevel >= career.gradeRange.min && gradeLevel <= career.gradeRange.max
  );
}

/**
 * Get careers grouped by category for a specific grade
 */
export function getCareersByCategory(gradeLevel: number): Map<string, CareerBasic[]> {
  const careers = getCareersForGrade(gradeLevel);
  const grouped = new Map<string, CareerBasic[]>();
  
  careers.forEach(career => {
    if (!grouped.has(career.category)) {
      grouped.set(career.category, []);
    }
    grouped.get(career.category)!.push(career);
  });
  
  // Sort categories by number of careers (most careers first)
  return new Map(
    Array.from(grouped.entries())
      .sort((a, b) => b[1].length - a[1].length)
  );
}

/**
 * Get recommended careers based on grade and interests
 * Returns 3 careers for quick selection
 */
export function getRecommendedCareers(gradeLevel: number, interests?: string[]): CareerBasic[] {
  const availableCareers = getCareersForGrade(gradeLevel);
  
  // For now, return first 3 appropriate careers from different categories
  const defaultRecommendations = ['teacher', 'doctor', 'artist'];
  
  return defaultRecommendations
    .map(id => CAREER_BASICS[id])
    .filter(career => career && 
      gradeLevel >= career.gradeRange.min && 
      gradeLevel <= career.gradeRange.max
    )
    .slice(0, 3);
}

/**
 * Parse grade string to grade number
 */
export function parseGradeToNumber(grade: string): number {
  if (grade === 'K' || grade === 'k') return 0;
  const num = parseInt(grade);
  return isNaN(num) ? 0 : num;
}