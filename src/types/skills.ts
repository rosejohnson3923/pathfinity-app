// ================================================================
// PATHFINITY SKILLS DATABASE TYPES
// TypeScript interfaces for the skills database schema
// ================================================================

// Core Skills Database Types
export interface SkillsMaster {
  id: string;
  subject: 'Math' | 'ELA' | 'Science' | 'SocialStudies';
  grade: 'Pre-K' | 'K';
  skills_area: string;
  skills_cluster: string;
  skill_number: string;
  skill_name: string;
  skill_description?: string;
  difficulty_level: number; // 1-10
  estimated_time_minutes: number;
  prerequisites?: string[]; // Array of skill IDs
  created_at: string;
  updated_at: string;
}

export interface StudentSkillProgress {
  id: string;
  student_id: string;
  skill_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  attempts: number;
  score?: number; // 0.0 to 1.0
  time_spent_minutes: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyAssignment {
  id: string;
  student_id: string;
  assignment_date: string; // Date string
  skill_id: string;
  subject: string;
  estimated_time_minutes: number;
  assigned_tool: 'MasterToolInterface' | 'AlgebraTiles' | 'GraphingCalculator' | 'VirtualLab' | 'WritingStudio' | 'BrandStudio';
  status: 'assigned' | 'started' | 'completed';
  created_at: string;
}

// View Types (for database views)
export interface StudentProgressSummary {
  student_id: string;
  subject: string;
  grade: string;
  total_skills: number;
  completed_skills: number;
  mastered_skills: number;
  in_progress_skills: number;
  average_score: number;
  total_time_minutes: number;
}

export interface DailyAssignmentSummary {
  student_id: string;
  assignment_date: string;
  total_assignments: number;
  completed_assignments: number;
  started_assignments: number;
  total_estimated_minutes: number;
  subjects_assigned: string;
}

// Extended Types with Relationships
export interface SkillWithProgress extends SkillsMaster {
  progress?: StudentSkillProgress;
}

export interface AssignmentWithSkill extends DailyAssignment {
  skill: SkillsMaster;
}

export interface AssignmentWithSkillAndProgress extends DailyAssignment {
  skill: SkillsMaster;
  progress?: StudentSkillProgress;
}

// API Request/Response Types
export interface CreateSkillRequest {
  subject: SkillsMaster['subject'];
  grade: SkillsMaster['grade'];
  skills_area: string;
  skills_cluster: string;
  skill_number: string;
  skill_name: string;
  skill_description?: string;
  difficulty_level: number;
  estimated_time_minutes: number;
  prerequisites?: string[];
}

export interface UpdateProgressRequest {
  skill_id: string;
  status?: StudentSkillProgress['status'];
  score?: number;
  time_spent_minutes?: number;
}

export interface CreateAssignmentRequest {
  student_id: string;
  assignment_date: string;
  skill_id: string;
  subject: string;
  estimated_time_minutes: number;
  assigned_tool: DailyAssignment['assigned_tool'];
}

// Skill Analytics Types
export interface SkillAnalytics {
  skill_id: string;
  skill_name: string;
  total_attempts: number;
  success_rate: number;
  average_time: number;
  difficulty_rating: number;
  completion_rate: number;
}

export interface StudentAnalytics {
  student_id: string;
  total_skills_assigned: number;
  skills_completed: number;
  skills_mastered: number;
  overall_score: number;
  total_time_spent: number;
  subjects_progress: Record<string, {
    completed: number;
    total: number;
    average_score: number;
  }>;
}

// Filter and Query Types
export interface SkillFilters {
  subject?: SkillsMaster['subject'];
  grade?: SkillsMaster['grade'];
  skills_area?: string;
  difficulty_level?: number;
  estimated_time_max?: number;
}

export interface ProgressFilters {
  student_id?: string;
  status?: StudentSkillProgress['status'];
  subject?: string;
  grade?: string;
  date_range?: {
    start: string;
    end: string;
  };
}

// Dashboard Data Types
export interface StudentDashboardData {
  student: {
    id: string;
    name: string;
    grade: string;
  };
  today_assignments: AssignmentWithSkillAndProgress[];
  progress_summary: StudentProgressSummary[];
  recent_completions: (StudentSkillProgress & { skill: SkillsMaster })[];
  suggested_skills: SkillWithProgress[];
}

export interface TeacherDashboardData {
  class_summary: {
    total_students: number;
    assignments_today: number;
    avg_completion_rate: number;
  };
  student_progress: (StudentProgressSummary & {
    student_name: string;
  })[];
  skill_analytics: SkillAnalytics[];
}

// Error Types
export interface SkillsError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Export utility type for database operations
export type DatabaseTables = {
  skills_master: SkillsMaster;
  student_skill_progress: StudentSkillProgress;
  daily_assignments: DailyAssignment;
};

export type DatabaseViews = {
  student_progress_summary: StudentProgressSummary;
  daily_assignment_summary: DailyAssignmentSummary;
};