// ================================================================
// STUDENT PROGRESS SERVICE
// Comprehensive service for student progress tracking
// ================================================================

import { supabase } from '../lib/supabase';
import { skillsService } from './enhanced-skillsService';
import type {
  StudentProgress,
  ProgressUpdate,
  ProgressSummary,
  SkillAreaProgress,
  ProgressFilters,
  ServiceResponse,
  ServiceError,
  Skill,
  SkillWithProgress,
  Grade,
  Subject,
  ProgressStatus,
  PaginationOptions,
  PaginatedResult,
  LearningPath,
  StudentAnalytics
} from '../types/services';

// ================================================================
// PROGRESS CACHE MANAGEMENT
// ================================================================

class ProgressCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 2 * 60 * 1000; // 2 minutes (shorter TTL for progress data)

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidateStudent(studentId: string): void {
    const pattern = `.*${studentId}.*`;
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

// ================================================================
// STUDENT PROGRESS SERVICE CLASS
// ================================================================

export class StudentProgressService {
  private static instance: StudentProgressService;
  private cache = new ProgressCache();

  static getInstance(): StudentProgressService {
    if (!StudentProgressService.instance) {
      StudentProgressService.instance = new StudentProgressService();
    }
    return StudentProgressService.instance;
  }

  // ================================================================
  // CORE PROGRESS OPERATIONS
  // ================================================================

  /**
   * Get student progress with optional filtering
   */
  async getStudentProgress(
    studentId: string,
    filters?: {
      grade?: Grade;
      subject?: Subject;
      status?: ProgressStatus;
      skills_area?: string;
    },
    options?: { useCache?: boolean; includeSkillDetails?: boolean }
  ): Promise<ServiceResponse<SkillWithProgress[]>> {
    const startTime = Date.now();
    const cacheKey = `progress_${studentId}_${JSON.stringify(filters || {})}_${options?.includeSkillDetails || false}`;
    
    try {
      // Check cache first
      if (options?.useCache !== false) {
        const cached = this.cache.get<SkillWithProgress[]>(cacheKey);
        if (cached) {
          return {
            success: true,
            data: cached,
            metadata: {
              query_time_ms: Date.now() - startTime,
              cache_hit: true
            }
          };
        }
      }

      // Build the query
      let progressQuery = supabase
        .from('student_skill_progress')
        .select(`
          *,
          skills_master!inner(*)
        `)
        .eq('student_id', studentId);

      // Apply filters through the joined skills_master table
      if (filters?.grade) {
        progressQuery = progressQuery.eq('skills_master.grade', filters.grade);
      }
      if (filters?.subject) {
        progressQuery = progressQuery.eq('skills_master.subject', filters.subject);
      }
      if (filters?.skills_area) {
        progressQuery = progressQuery.eq('skills_master.skills_area', filters.skills_area);
      }
      if (filters?.status) {
        progressQuery = progressQuery.eq('status', filters.status);
      }

      // Order by skill sequence
      progressQuery = progressQuery.order('updated_at', { ascending: false });

      const { data: progressData, error } = await progressQuery;

      if (error) {
        throw this.createError('FETCH_PROGRESS_ERROR', `Failed to fetch progress for student ${studentId}`, error);
      }

      // Transform the data to include skill details
      const skillsWithProgress: SkillWithProgress[] = (progressData || []).map(item => ({
        ...item.skills_master,
        progress: {
          id: item.id,
          student_id: item.student_id,
          skill_id: item.skill_id,
          status: item.status,
          attempts: item.attempts,
          score: item.score,
          time_spent_minutes: item.time_spent_minutes,
          completed_at: item.completed_at,
          created_at: item.created_at,
          updated_at: item.updated_at
        }
      }));

      // Cache the results
      if (options?.useCache !== false) {
        this.cache.set(cacheKey, skillsWithProgress);
      }

      return {
        success: true,
        data: skillsWithProgress,
        metadata: {
          query_time_ms: Date.now() - startTime,
          cache_hit: false,
          total_count: skillsWithProgress.length
        }
      };

    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  /**
   * Update skill progress for a student
   */
  async updateSkillProgress(
    studentId: string,
    skillId: string,
    progressUpdate: ProgressUpdate
  ): Promise<ServiceResponse<StudentProgress>> {
    const startTime = Date.now();
    
    try {
      // Check if progress record exists
      const { data: existingProgress } = await supabase
        .from('student_skill_progress')
        .select('*')
        .eq('student_id', studentId)
        .eq('skill_id', skillId)
        .single();

      let result;

      if (existingProgress) {
        // Update existing progress
        const updateData = {
          ...progressUpdate,
          attempts: progressUpdate.attempts !== undefined 
            ? progressUpdate.attempts 
            : existingProgress.attempts + 1,
          updated_at: new Date().toISOString()
        };

        if (progressUpdate.status && ['completed', 'mastered'].includes(progressUpdate.status) && !existingProgress.completed_at) {
          updateData.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
          .from('student_skill_progress')
          .update(updateData)
          .eq('id', existingProgress.id)
          .select()
          .single();

        if (error) {
          throw this.createError('UPDATE_PROGRESS_ERROR', `Failed to update progress for skill ${skillId}`, error);
        }

        result = data;
      } else {
        // Create new progress record
        const newProgress = {
          student_id: studentId,
          skill_id: skillId,
          status: progressUpdate.status || 'in_progress',
          attempts: progressUpdate.attempts || 1,
          score: progressUpdate.score,
          time_spent_minutes: progressUpdate.time_spent_minutes || 0,
          completed_at: progressUpdate.status && ['completed', 'mastered'].includes(progressUpdate.status) 
            ? new Date().toISOString() 
            : null
        };

        const { data, error } = await supabase
          .from('student_skill_progress')
          .insert(newProgress)
          .select()
          .single();

        if (error) {
          throw this.createError('CREATE_PROGRESS_ERROR', `Failed to create progress for skill ${skillId}`, error);
        }

        result = data;
      }

      // Invalidate cache
      this.cache.invalidateStudent(studentId);

      return {
        success: true,
        data: result,
        metadata: {
          query_time_ms: Date.now() - startTime,
          cache_hit: false
        }
      };

    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  /**
   * Mark a skill as completed with score and time
   */
  async markSkillCompleted(
    studentId: string,
    skillId: string,
    score: number,
    timeSpent: number,
    status: 'completed' | 'mastered' = 'completed'
  ): Promise<ServiceResponse<StudentProgress>> {
    const startTime = Date.now();
    
    try {
      // Validate inputs
      if (score < 0 || score > 1) {
        throw this.createError('INVALID_SCORE', 'Score must be between 0 and 1');
      }

      if (timeSpent < 0) {
        throw this.createError('INVALID_TIME', 'Time spent must be non-negative');
      }

      const progressUpdate: ProgressUpdate = {
        status,
        score,
        time_spent_minutes: timeSpent
      };

      const result = await this.updateSkillProgress(studentId, skillId, progressUpdate);

      // If successful, check for achievement unlocks or next skill recommendations
      if (result.success && result.data) {
        // This could trigger additional logic like:
        // - Checking for skill area completion
        // - Unlocking next skills
        // - Updating learning analytics
        this.triggerCompletionEvents(studentId, skillId, score, status);
      }

      return result;

    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  /**
   * Get completed skills for a student
   */
  async getCompletedSkills(
    studentId: string,
    filters?: { grade?: Grade; subject?: Subject; since?: string }
  ): Promise<ServiceResponse<SkillWithProgress[]>> {
    const startTime = Date.now();
    
    try {
      const progressFilters = {
        status: 'completed' as ProgressStatus,
        ...filters
      };

      const result = await this.getStudentProgress(studentId, progressFilters, { includeSkillDetails: true });

      if (!result.success) {
        return result;
      }

      // Filter completed skills and add mastered ones
      const masteredResult = await this.getStudentProgress(studentId, {
        ...progressFilters,
        status: 'mastered'
      }, { includeSkillDetails: true });

      let allCompleted = result.data || [];
      if (masteredResult.success && masteredResult.data) {
        allCompleted = allCompleted.concat(masteredResult.data);
      }

      // Sort by completion date (most recent first)
      allCompleted.sort((a, b) => {
        const dateA = a.progress?.completed_at || '';
        const dateB = b.progress?.completed_at || '';
        return dateB.localeCompare(dateA);
      });

      return {
        success: true,
        data: allCompleted,
        metadata: {
          query_time_ms: Date.now() - startTime,
          cache_hit: false,
          total_count: allCompleted.length
        }
      };

    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  /**
   * Get next recommended skills for a student
   */
  async getNextSkills(
    studentId: string,
    subject: Subject,
    grade: Grade,
    options?: { limit?: number; difficulty_preference?: 'adaptive' | 'challenging' | 'review' }
  ): Promise<ServiceResponse<Skill[]>> {
    const startTime = Date.now();
    
    try {
      // Get student's current progress
      const progressResult = await this.getStudentProgress(studentId, { subject, grade });
      if (!progressResult.success) {
        return this.handleError(new Error('Failed to fetch student progress'), startTime);
      }

      const completedSkillIds = new Set(
        (progressResult.data || [])
          .filter(sp => sp.progress && ['completed', 'mastered'].includes(sp.progress.status))
          .map(sp => sp.id)
      );

      // Get all skills for the subject and grade
      const skillsResult = await skillsService.getSkillsBySubject(subject, grade);
      if (!skillsResult.success) {
        return this.handleError(new Error('Failed to fetch skills'), startTime);
      }

      const allSkills = skillsResult.data || [];
      
      // Filter out completed skills
      const availableSkills = allSkills.filter(skill => !completedSkillIds.has(skill.id));

      // Sort by skill sequence and apply difficulty preference
      let recommendedSkills = this.sortSkillsByRecommendation(
        availableSkills,
        completedSkillIds,
        options?.difficulty_preference
      );

      // Apply limit
      if (options?.limit) {
        recommendedSkills = recommendedSkills.slice(0, options.limit);
      }

      return {
        success: true,
        data: recommendedSkills,
        metadata: {
          query_time_ms: Date.now() - startTime,
          cache_hit: false,
          total_count: recommendedSkills.length
        }
      };

    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  /**
   * Get progress for a specific skills area
   */
  async getSkillsAreaProgress(
    studentId: string,
    grade: Grade,
    subject: Subject,
    skillsArea: string
  ): Promise<ServiceResponse<SkillAreaProgress>> {
    const startTime = Date.now();
    const cacheKey = `area_progress_${studentId}_${grade}_${subject}_${skillsArea}`;
    
    try {
      // Check cache first
      const cached = this.cache.get<SkillAreaProgress>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          metadata: {
            query_time_ms: Date.now() - startTime,
            cache_hit: true
          }
        };
      }

      // Get skills for the area
      const skillsResult = await skillsService.getSkillsByArea(grade, subject, skillsArea, {
        includeProgress: true,
        studentId
      });

      if (!skillsResult.success) {
        return this.handleError(new Error('Failed to fetch skills for area'), startTime);
      }

      const skills = skillsResult.data || [];
      
      // Calculate progress metrics
      const totalSkills = skills.length;
      const completedSkills = skills.filter(skill => 
        skill.progress && ['completed', 'mastered'].includes(skill.progress.status)
      ).length;
      const masteredSkills = skills.filter(skill => 
        skill.progress?.status === 'mastered'
      ).length;

      const progressSkills = skills.filter(skill => skill.progress);
      const averageScore = progressSkills.length > 0
        ? progressSkills.reduce((sum, skill) => sum + (skill.progress?.score || 0), 0) / progressSkills.length
        : 0;

      const totalTimeMinutes = progressSkills.reduce(
        (sum, skill) => sum + (skill.progress?.time_spent_minutes || 0), 0
      );

      const progressPercentage = totalSkills > 0 ? (completedSkills / totalSkills) * 100 : 0;

      const areaProgress: SkillAreaProgress = {
        skills_area: skillsArea,
        total_skills: totalSkills,
        completed_skills: completedSkills,
        mastered_skills: masteredSkills,
        average_score: averageScore,
        total_time_minutes: totalTimeMinutes,
        progress_percentage: progressPercentage,
        skills: skills
      };

      // Cache the result
      this.cache.set(cacheKey, areaProgress);

      return {
        success: true,
        data: areaProgress,
        metadata: {
          query_time_ms: Date.now() - startTime,
          cache_hit: false
        }
      };

    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  /**
   * Get comprehensive progress summary for a student
   */
  async getProgressSummary(
    studentId: string,
    filters?: { grade?: Grade; subject?: Subject }
  ): Promise<ServiceResponse<ProgressSummary[]>> {
    const startTime = Date.now();
    const cacheKey = `progress_summary_${studentId}_${JSON.stringify(filters || {})}`;
    
    try {
      // Check cache first
      const cached = this.cache.get<ProgressSummary[]>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          metadata: {
            query_time_ms: Date.now() - startTime,
            cache_hit: true
          }
        };
      }

      // Use the database view if available, otherwise calculate manually
      let query = supabase
        .from('student_progress_summary')
        .select('*')
        .eq('student_id', studentId);

      if (filters?.grade) {
        query = query.eq('grade', filters.grade);
      }
      if (filters?.subject) {
        query = query.eq('subject', filters.subject);
      }

      const { data, error } = await query;

      if (error) {
        // Fallback to manual calculation if view doesn't exist
        return this.calculateProgressSummaryManually(studentId, filters, startTime);
      }

      const summaries: ProgressSummary[] = (data || []).map(item => ({
        student_id: item.student_id,
        subject: item.subject,
        grade: item.grade,
        total_skills: item.total_skills,
        completed_skills: item.completed_skills,
        mastered_skills: item.mastered_skills,
        in_progress_skills: item.in_progress_skills,
        average_score: item.average_score || 0,
        total_time_minutes: item.total_time_minutes || 0,
        completion_percentage: item.total_skills > 0 ? (item.completed_skills / item.total_skills) * 100 : 0,
        mastery_percentage: item.total_skills > 0 ? (item.mastered_skills / item.total_skills) * 100 : 0
      }));

      // Cache the result
      this.cache.set(cacheKey, summaries);

      return {
        success: true,
        data: summaries,
        metadata: {
          query_time_ms: Date.now() - startTime,
          cache_hit: false,
          total_count: summaries.length
        }
      };

    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  // ================================================================
  // HELPER METHODS
  // ================================================================

  /**
   * Sort skills by recommendation priority
   */
  private sortSkillsByRecommendation(
    skills: Skill[],
    completedSkillIds: Set<string>,
    difficultyPreference?: 'adaptive' | 'challenging' | 'review'
  ): Skill[] {
    return skills.sort((a, b) => {
      // First, sort by skills area and skill number (natural progression)
      const areaComparison = a.skills_area.localeCompare(b.skills_area);
      if (areaComparison !== 0) return areaComparison;

      const numberComparison = a.skill_number.localeCompare(b.skill_number);
      if (numberComparison !== 0) return numberComparison;

      // Then apply difficulty preference
      if (difficultyPreference === 'challenging') {
        return b.difficulty_level - a.difficulty_level; // Higher difficulty first
      } else if (difficultyPreference === 'review') {
        return a.difficulty_level - b.difficulty_level; // Lower difficulty first
      }

      // Default: adaptive (natural difficulty progression)
      return a.difficulty_level - b.difficulty_level;
    });
  }

  /**
   * Calculate progress summary manually (fallback)
   */
  private async calculateProgressSummaryManually(
    studentId: string,
    filters?: { grade?: Grade; subject?: Subject },
    startTime?: number
  ): Promise<ServiceResponse<ProgressSummary[]>> {
    try {
      // This would involve multiple queries to calculate the summary
      // For now, return empty array as fallback
      return {
        success: true,
        data: [],
        metadata: {
          query_time_ms: startTime ? Date.now() - startTime : 0,
          cache_hit: false,
          total_count: 0
        }
      };
    } catch (error) {
      return this.handleError(error as Error, startTime || Date.now());
    }
  }

  /**
   * Trigger completion events (for future enhancements)
   */
  private async triggerCompletionEvents(
    studentId: string,
    skillId: string,
    score: number,
    status: 'completed' | 'mastered'
  ): Promise<void> {
    // Future implementation could include:
    // - Checking for area completion achievements
    // - Updating learning analytics
    // - Triggering notifications
    // - Updating recommendation algorithms
    console.log(`Skill ${skillId} ${status} by student ${studentId} with score ${score}`);
  }

  /**
   * Create a standardized error
   */
  private createError(code: string, message: string, details?: any): ServiceError {
    return {
      code,
      message,
      details: details || {},
      suggestions: this.getErrorSuggestions(code)
    };
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: Error, startTime: number): ServiceResponse<never> {
    const serviceError = error instanceof Error && 'code' in error
      ? error as ServiceError
      : this.createError('UNKNOWN_ERROR', error.message, error);

    return {
      success: false,
      error: serviceError,
      metadata: {
        query_time_ms: Date.now() - startTime,
        cache_hit: false
      }
    };
  }

  /**
   * Get error suggestions based on error code
   */
  private getErrorSuggestions(code: string): string[] {
    const suggestions: Record<string, string[]> = {
      'FETCH_PROGRESS_ERROR': [
        'Check if the student ID is valid',
        'Verify database connection',
        'Try with different filter parameters'
      ],
      'UPDATE_PROGRESS_ERROR': [
        'Ensure the skill ID is valid',
        'Check if the progress data meets validation requirements',
        'Verify the student has access to this skill'
      ],
      'INVALID_SCORE': [
        'Score must be between 0.0 and 1.0',
        'Use decimal values (e.g., 0.85 for 85%)'
      ],
      'INVALID_TIME': [
        'Time spent must be a non-negative number',
        'Use minutes as the unit of measurement'
      ]
    };

    return suggestions[code] || ['Check the error details for more information'];
  }

  /**
   * Clear progress cache for a student
   */
  clearStudentCache(studentId: string): void {
    this.cache.invalidateStudent(studentId);
  }

  /**
   * Clear all progress cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// ================================================================
// SINGLETON EXPORT
// ================================================================

export const studentProgressService = StudentProgressService.getInstance();