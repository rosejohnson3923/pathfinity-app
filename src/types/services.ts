// ================================================================
// PATHFINITY SERVICE TYPES
// Enhanced TypeScript interfaces for service functions
// ================================================================

// Core domain types
export type Grade = 'Pre-K' | 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
export type Subject = 'Math' | 'ELA' | 'Science' | 'SocialStudies';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'mastered';
export type AssignmentStatus = 'assigned' | 'started' | 'completed';
export type ToolName = 'MasterToolInterface' | 'AlgebraTiles' | 'GraphingCalculator' | 'VirtualLab' | 'WritingStudio' | 'BrandStudio';

// ================================================================
// SKILL INTERFACES
// ================================================================

export interface Skill {
  id: string;
  subject: Subject;
  grade: Grade;
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

export interface SkillWithProgress extends Skill {
  progress?: StudentProgress;
}

export interface SkillSequence {
  skills_area: string;
  skills: Skill[];
  total_skills: number;
  completed_skills: number;
  next_skill?: Skill;
  progress_percentage: number;
}

// ================================================================
// STUDENT PROGRESS INTERFACES
// ================================================================

export interface StudentProgress {
  id: string;
  student_id: string;
  skill_id: string;
  status: ProgressStatus;
  attempts: number;
  score?: number; // 0.0 to 1.0
  time_spent_minutes: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgressUpdate {
  status?: ProgressStatus;
  score?: number;
  time_spent_minutes?: number;
  attempts?: number;
}

export interface ProgressSummary {
  student_id: string;
  subject: Subject;
  grade: Grade;
  total_skills: number;
  completed_skills: number;
  mastered_skills: number;
  in_progress_skills: number;
  average_score: number;
  total_time_minutes: number;
  completion_percentage: number;
  mastery_percentage: number;
}

export interface SkillAreaProgress {
  skills_area: string;
  total_skills: number;
  completed_skills: number;
  mastered_skills: number;
  average_score: number;
  total_time_minutes: number;
  progress_percentage: number;
  skills: SkillWithProgress[];
}

// ================================================================
// DAILY ASSIGNMENT INTERFACES
// ================================================================

export interface DailyAssignment {
  id: string;
  student_id: string;
  assignment_date: string; // Date string YYYY-MM-DD
  skill_id: string;
  subject: Subject;
  estimated_time_minutes: number;
  assigned_tool: ToolName;
  status: AssignmentStatus;
  created_at: string;
}

export interface AssignmentWithSkill extends DailyAssignment {
  skill: Skill;
  progress?: StudentProgress;
}

export interface AssignmentGeneration {
  student_id: string;
  target_date: string;
  total_minutes: number;
  preferred_subjects?: Subject[];
  focus_areas?: string[]; // Specific skills areas to focus on
  difficulty_preference?: 'adaptive' | 'challenging' | 'review';
}

export interface GeneratedAssignments {
  assignments: DailyAssignment[];
  total_estimated_minutes: number;
  subjects_covered: Subject[];
  skills_areas_covered: string[];
  difficulty_distribution: Record<number, number>;
  recommendations: string[];
}

// ================================================================
// QUERY INTERFACES
// ================================================================

export interface SkillFilters {
  grade?: Grade;
  subject?: Subject;
  skills_area?: string;
  skills_cluster?: string;
  difficulty_level?: number;
  difficulty_range?: [number, number];
  estimated_time_max?: number;
  has_prerequisites?: boolean;
}

export interface ProgressFilters {
  student_id?: string;
  grade?: Grade;
  subject?: Subject;
  skills_area?: string;
  status?: ProgressStatus;
  completed_after?: string;
  completed_before?: string;
  min_score?: number;
  max_attempts?: number;
}

export interface AssignmentFilters {
  student_id?: string;
  assignment_date?: string;
  date_range?: [string, string];
  subject?: Subject;
  status?: AssignmentStatus;
  assigned_tool?: ToolName;
}

// ================================================================
// SEARCH INTERFACES
// ================================================================

export interface SkillSearchQuery {
  query: string;
  grade?: Grade;
  subject?: Subject;
  skills_area?: string;
  limit?: number;
  offset?: number;
}

export interface SkillSearchResult {
  skills: Skill[];
  total_count: number;
  has_more: boolean;
  search_time_ms: number;
}

// ================================================================
// ANALYTICS INTERFACES
// ================================================================

export interface LearningPath {
  student_id: string;
  subject: Subject;
  grade: Grade;
  current_skills_area: string;
  next_recommended_skills: Skill[];
  completion_estimate_days: number;
  difficulty_trajectory: number[];
  learning_velocity: number; // skills per day
}

export interface SkillAnalytics {
  skill_id: string;
  skill_name: string;
  total_attempts: number;
  unique_students: number;
  success_rate: number;
  average_completion_time: number;
  difficulty_rating: number;
  common_prerequisite_gaps: string[];
}

export interface StudentAnalytics {
  student_id: string;
  learning_profile: {
    strongest_subjects: Subject[];
    preferred_learning_time: number; // minutes per session
    optimal_difficulty_level: number;
    learning_patterns: string[];
  };
  progress_trends: {
    skills_per_week: number;
    average_score_trend: number[];
    time_efficiency_trend: number[];
    subject_preferences: Record<Subject, number>;
  };
  recommendations: {
    next_focus_areas: string[];
    suggested_tools: ToolName[];
    optimal_session_length: number;
    challenge_level_adjustment: number;
  };
}

// ================================================================
// SERVICE RESPONSE INTERFACES
// ================================================================

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: ServiceError;
  metadata?: {
    query_time_ms: number;
    cache_hit: boolean;
    total_count?: number;
    page?: number;
    has_more?: boolean;
  };
}

export interface ServiceError {
  code: string;
  message: string;
  details?: Record<string, any>;
  suggestions?: string[];
}

export interface BatchOperationResult<T> {
  success: boolean;
  successful_operations: T[];
  failed_operations: Array<{
    item: any;
    error: ServiceError;
  }>;
  total_processed: number;
  processing_time_ms: number;
}

// ================================================================
// CACHING INTERFACES
// ================================================================

export interface CacheConfig {
  enabled: boolean;
  ttl_seconds: number;
  max_entries: number;
  key_prefix: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  access_count: number;
}

export interface CacheStats {
  total_entries: number;
  hit_rate: number;
  miss_rate: number;
  evictions: number;
  memory_usage_bytes: number;
}

// ================================================================
// FINN ORCHESTRATION INTEGRATION
// ================================================================

export interface FinnAssignmentContext {
  student_profile: {
    grade: Grade;
    learning_preferences: Subject[];
    average_session_time: number;
    current_difficulty_comfort: number;
  };
  recent_performance: {
    last_week_completions: number;
    average_score: number;
    struggling_areas: string[];
    mastered_areas: string[];
  };
  learning_goals: {
    target_skills_per_week: number;
    focus_subjects: Subject[];
    upcoming_assessments: string[];
  };
}

export interface FinnRecommendation {
  recommended_skills: string[]; // skill IDs
  reasoning: string;
  confidence_score: number; // 0.0 to 1.0
  estimated_success_rate: number;
  adaptive_adjustments: {
    difficulty_modifier: number;
    time_allocation: Record<Subject, number>;
    tool_preferences: ToolName[];
  };
}

// ================================================================
// PAGINATION AND SORTING
// ================================================================

export interface PaginationOptions {
  page: number;
  limit: number;
  offset?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_previous: boolean;
    has_next: boolean;
  };
}

// ================================================================
// UTILITY TYPES
// ================================================================

export type CreateSkillData = Omit<Skill, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSkillData = Partial<CreateSkillData>;

export type CreateProgressData = Omit<StudentProgress, 'id' | 'created_at' | 'updated_at'>;
export type UpdateProgressData = Partial<Pick<StudentProgress, 'status' | 'score' | 'time_spent_minutes' | 'attempts'>>;

export type CreateAssignmentData = Omit<DailyAssignment, 'id' | 'created_at'>;
export type UpdateAssignmentData = Partial<Pick<DailyAssignment, 'status' | 'estimated_time_minutes'>>;

// ================================================================
// VALIDATION SCHEMAS (for runtime validation)
// ================================================================

export interface ValidationSchema {
  required_fields: string[];
  field_types: Record<string, string>;
  constraints: Record<string, any>;
}

// ================================================================
// STUDENT PROFILE INTERFACES
// ================================================================

export interface StudentProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  grade_level: Grade;
  date_of_birth?: string;
  enrollment_date: string;
  learning_preferences: LearningPreferences;
  parent_email?: string;
  school_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StudentProfileSummary {
  id: string;
  user_id: string;
  display_name: string;
  grade_level: Grade;
  age?: number;
  enrollment_date: string;
  learning_style?: string;
  attention_span?: string;
  is_active: boolean;
  created_at: string;
}

export interface LearningPreferences {
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  favorite_subjects?: string[];
  attention_span?: 'short' | 'medium' | 'long';
  prefers_hands_on?: boolean;
  prefers_group_work?: boolean;
  prefers_individual_work?: boolean;
  needs_encouragement?: boolean;
  difficulty_preference?: 'easy' | 'moderate' | 'challenging';
  session_length_preference?: number; // minutes
  best_time_of_day?: 'morning' | 'afternoon' | 'evening';
  [key: string]: any; // Allow for additional custom preferences
}

export interface CreateProfileRequest {
  user_id: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  grade_level: Grade;
  date_of_birth?: string;
  learning_preferences?: LearningPreferences;
  parent_email?: string;
  school_id?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  display_name?: string;
  grade_level?: Grade;
  date_of_birth?: string;
  learning_preferences?: LearningPreferences;
  parent_email?: string;
  school_id?: string;
  is_active?: boolean;
}

export const SKILL_VALIDATION_SCHEMA: ValidationSchema = {
  required_fields: ['subject', 'grade', 'skills_area', 'skill_number', 'skill_name', 'difficulty_level', 'estimated_time_minutes'],
  field_types: {
    subject: 'Subject',
    grade: 'Grade',
    skills_area: 'string',
    skills_cluster: 'string',
    skill_number: 'string',
    skill_name: 'string',
    difficulty_level: 'number',
    estimated_time_minutes: 'number'
  },
  constraints: {
    difficulty_level: { min: 1, max: 10 },
    estimated_time_minutes: { min: 1, max: 120 },
    skill_name: { min_length: 3, max_length: 200 }
  }
};

export const PROGRESS_VALIDATION_SCHEMA: ValidationSchema = {
  required_fields: ['student_id', 'skill_id', 'status'],
  field_types: {
    student_id: 'string',
    skill_id: 'string',
    status: 'ProgressStatus',
    score: 'number',
    time_spent_minutes: 'number',
    attempts: 'number'
  },
  constraints: {
    score: { min: 0.0, max: 1.0 },
    time_spent_minutes: { min: 0 },
    attempts: { min: 0, max: 50 }
  }
};

// ================================================================
// EXPORT GROUPS
// ================================================================

// Core types for skills management
export type SkillsTypes = Skill | SkillWithProgress | SkillSequence | SkillFilters | SkillSearchQuery | SkillSearchResult;

// Progress tracking types
export type ProgressTypes = StudentProgress | ProgressUpdate | ProgressSummary | SkillAreaProgress | ProgressFilters;

// Assignment management types
export type AssignmentTypes = DailyAssignment | AssignmentWithSkill | AssignmentGeneration | GeneratedAssignments | AssignmentFilters;

// Service infrastructure types
export type ServiceTypes = ServiceResponse<any> | ServiceError | BatchOperationResult<any> | CacheConfig | CacheEntry<any>;

// Analytics and recommendations
export type AnalyticsTypes = LearningPath | SkillAnalytics | StudentAnalytics | FinnAssignmentContext | FinnRecommendation;