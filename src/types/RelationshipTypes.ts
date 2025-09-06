// ================================================================
// RELATIONSHIP TYPES - Unified Teacher/Student & Parent/Child Structure
// Same data structure, different labels based on user role preference
// ================================================================

export interface StudentChildData {
  id: string;
  name: string;
  grade: string;
  last_activity: string;
  total_xp: number;
  containers_completed: number;
  avg_accuracy: number;
  learning_streak: number;
  current_container: string;
  subjects_mastered: string[];
  time_spent_minutes: number;
  badges_earned: number;
  preferred_session_time: string;
  engagement_level: 'High' | 'Medium-High' | 'Medium' | 'Low';
  avatar_url?: string;
}

export interface EducatorData {
  id: string;
  name: string;
  email: string;
  role: 'educator' | 'parent'; // Role preference selected during onboarding
  school: string;
  district?: string;
  tenant_ids: string[];
  avatar_url?: string;
  
  // Unified relationship - same data structure for both roles
  students_children: StudentChildData[]; // Same data, different context labels
  
  // Role-specific display preferences
  dashboard_preferences: {
    primary_tab_label: string; // "Teacher Dashboard" or "Parent Dashboard"
    secondary_tab_label: string; // "Student Dashboard" or "Child Dashboard"
    relationship_term: string; // "students" or "children"
    possessive_term: string; // "my students" or "my children"
  };
}

// Helper function to get role-specific labels
export const getRoleLabels = (role: 'educator' | 'parent') => {
  if (role === 'parent') {
    return {
      primary_tab_label: 'Parent Dashboard',
      secondary_tab_label: 'Child Dashboard',
      relationship_term: 'children',
      possessive_term: 'my children',
      individual_term: 'child',
      progress_term: 'learning journey',
      oversight_term: 'monitoring'
    };
  } else {
    return {
      primary_tab_label: 'Teacher Dashboard',
      secondary_tab_label: 'Student Dashboard', 
      relationship_term: 'students',
      possessive_term: 'my students',
      individual_term: 'student',
      progress_term: 'academic progress',
      oversight_term: 'instruction'
    };
  }
};

// Unified analytics structure - same data, different interpretation
export interface LearningAnalytics {
  total_learners: number; // students or children
  complete_journeys: number;
  total_xp_earned: number;
  average_learning_streak: number;
  
  // Subject performance - same data structure
  subject_performance: {
    [subject: string]: {
      average_xp: number;
      completion_rate: number;
      engagement_level: number;
    };
  };
  
  // Time allocation - same structure for both roles
  weekly_time_allocation: {
    [subject: string]: {
      minutes: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  
  // Individual performance tracking
  individual_analytics: {
    [studentChildId: string]: {
      engagement_trends: number[];
      learning_velocity: number;
      challenge_level_match: number;
      subject_xp_breakdown: { [subject: string]: number };
    };
  };
}

// Tenant structure that works for both families and schools
export interface TenantData {
  id: string;
  name: string; // "Davis Family School" or "Sand View Elementary School"
  type: 'family' | 'school' | 'district';
  subscription_tier: 'family' | 'premium' | 'enterprise';
  domain: string;
  logo?: string;
  
  // Unified educator structure
  educators: EducatorData[];
  
  // Analytics apply to entire tenant
  tenant_analytics: LearningAnalytics;
}

// Factory function to create educator data with proper role labels
export const createEducatorData = (
  baseData: Omit<EducatorData, 'dashboard_preferences'>,
  rolePreference: 'educator' | 'parent'
): EducatorData => {
  const labels = getRoleLabels(rolePreference);
  
  return {
    ...baseData,
    role: rolePreference,
    dashboard_preferences: {
      primary_tab_label: labels.primary_tab_label,
      secondary_tab_label: labels.secondary_tab_label,
      relationship_term: labels.relationship_term,
      possessive_term: labels.possessive_term
    }
  };
};