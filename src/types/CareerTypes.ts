// ================================================================
// CAREER TYPES
// Supports the new career_paths + career_attributes structure
// ================================================================

// Legacy interfaces (kept for compatibility)
export interface CareerBadge {
  id: string;
  careerId: string;
  gradeLevel: string;
  imageUrl?: string; // Optional for future DALL-E integration
  emoji: string;
  title: string;
  description: string;
  colors: string[]; // Gradient colors for badge background
  createdAt: Date;
  isFallback?: boolean; // Always true for in-app generated badges
}

export interface CareerOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
  skills: string[];
  colors: string[];
}

// ================================================================
// NEW CAREER SYSTEM TYPES
// ================================================================

// Core career data (from career_paths table)
export interface CareerCore {
  career_code: string;
  career_name: string;
  icon?: string;
  color?: string;
  grade_category: 'elementary' | 'middle' | 'high';
  min_grade_level: string;
  max_grade_level: string;
  min_grade_level_num?: number;
  max_grade_level_num?: number;
  access_tier: 'select' | 'premium';
  career_category?: string;
  description?: string;
  is_active: boolean;
  display_order?: number;
  is_featured?: boolean;
  tags?: string[];
}

// Frequency indicator enum
export type FrequencyIndicator = 'LIF' | 'MIF' | 'HIF';

// Career attributes (from career_attributes table)
export interface CareerAttributes {
  career_code: string;

  // Engagement Ratings (1-100)
  ers_student_engagement?: number;
  erp_parent_engagement?: number;
  ere_employer_engagement?: number;
  total_engagement_score?: number;

  // Frequency Indicator
  interaction_frequency?: FrequencyIndicator;

  // Industry Ratings (1-100)
  lir_legacy_rating?: number;
  eir_emerging_rating?: number;
  air_ai_first_rating?: number;
  future_readiness_score?: number;

  // Industry and Career Classification
  industry_sector?: string;
  career_cluster?: string;
  automation_risk?: 'Low' | 'Medium' | 'High';
  remote_work_potential?: 'Low' | 'Medium' | 'High' | 'Full';

  // Student Engagement Content
  fun_facts?: string[];
  day_in_life_description?: string;
  why_its_exciting?: string;
}

// Combined career data (joined)
export interface CareerWithAttributes extends CareerCore {
  attributes?: CareerAttributes;
}

// Helper functions for frequency indicators
export const FrequencyIndicatorLabels = {
  LIF: 'Low Interaction',
  MIF: 'Medium Interaction',
  HIF: 'High Interaction'
} as const;

// Helper to get career badge based on attributes
export function getCareerPopularityBadge(attributes?: CareerAttributes): string | null {
  if (!attributes) return null;

  const studentScore = attributes.ers_student_engagement || 0;
  const futureScore = attributes.future_readiness_score || 0;

  if (futureScore >= 90) return '🚀 Future';
  if (studentScore >= 85) return '🔥 Hot';
  if (studentScore >= 70) return '⭐ Popular';
  if (attributes.air_ai_first_rating && attributes.air_ai_first_rating >= 80) return '🤖 AI-Ready';

  return null;
}