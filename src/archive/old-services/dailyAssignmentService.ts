// ================================================================
// DAILY ASSIGNMENT SERVICE
// Comprehensive service for daily assignment management
// ================================================================

import { supabase } from '../lib/supabase';
import { skillsService } from './enhanced-skillsService';
import { studentProgressService } from './studentProgressService';
import type {
  DailyAssignment,
  AssignmentWithSkill,
  AssignmentGeneration,
  GeneratedAssignments,
  AssignmentFilters,
  ServiceResponse,
  ServiceError,
  Skill,
  Subject,
  Grade,
  ToolName,
  AssignmentStatus,
  FinnAssignmentContext,
  FinnRecommendation,
  PaginationOptions,
  PaginatedResult
} from '../types/services';

// ================================================================
// ASSIGNMENT CACHE MANAGEMENT
// ================================================================

class AssignmentCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

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

  invalidateDate(date: string): void {
    const pattern = `.*${date}.*`;
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
// TOOL ASSIGNMENT MAPPING
// ================================================================

const SUBJECT_TO_TOOL_MAPPING: Record<Subject, ToolName> = {
  'Math': 'MasterToolInterface',
  'Science': 'MasterToolInterface',
  'ELA': 'MasterToolInterface',
  'SocialStudies': 'MasterToolInterface' // Master Tool Interface for all subjects
};

// Alternative tools for variety
const ALTERNATIVE_TOOLS: Record<Subject, ToolName[]> = {
  'Math': ['MasterToolInterface'],
  'Science': ['MasterToolInterface'],
  'ELA': ['MasterToolInterface'],
  'SocialStudies': ['MasterToolInterface']
};

// ================================================================
// DAILY ASSIGNMENT SERVICE CLASS
// ================================================================

export class DailyAssignmentService {
  private static instance: DailyAssignmentService;
  private cache = new AssignmentCache();

  static getInstance(): DailyAssignmentService {
    if (!DailyAssignmentService.instance) {
      DailyAssignmentService.instance = new DailyAssignmentService();
    }
    return DailyAssignmentService.instance;
  }

  // ================================================================
  // CORE ASSIGNMENT OPERATIONS
  // ================================================================

  /**
   * Generate intelligent daily assignments for a student
   */
  async generateDailyAssignments(
    assignmentConfig: AssignmentGeneration,
    finnContext?: FinnAssignmentContext
  ): Promise<ServiceResponse<GeneratedAssignments>> {
    const startTime = Date.now();
    
    try {
      const { student_id, target_date, total_minutes, preferred_subjects, focus_areas, difficulty_preference } = assignmentConfig;

      // Get student's current progress across all subjects
      const progressResult = await studentProgressService.getProgressSummary(student_id);
      if (!progressResult.success) {
        throw this.createError('PROGRESS_FETCH_ERROR', 'Failed to fetch student progress for assignment generation');
      }

      const progressSummaries = progressResult.data || [];

      // Determine subjects to include
      const targetSubjects = preferred_subjects || this.determineTargetSubjects(progressSummaries, finnContext);
      
      // Generate skill recommendations for each subject
      const assignmentPromises = targetSubjects.map(async (subject) => {
        const subjectSummary = progressSummaries.find(p => p.subject === subject);
        const grade = subjectSummary?.grade || (finnContext?.student_profile.grade || 'Pre-K');
        
        return this.generateSubjectAssignments(
          student_id,
          subject,
          grade,
          Math.floor(total_minutes / targetSubjects.length),
          {
            difficulty_preference,
            focus_areas: focus_areas?.filter(area => 
              // Filter focus areas relevant to this subject
              this.isAreaRelevantToSubject(area, subject)
            ),
            finn_context: finnContext
          }
        );
      });

      const subjectAssignments = await Promise.all(assignmentPromises);
      
      // Combine all assignments
      const allAssignments: DailyAssignment[] = [];
      const subjectsCovered = new Set<Subject>();
      const skillsAreasCovered = new Set<string>();
      const difficultyDistribution: Record<number, number> = {};

      for (const assignments of subjectAssignments) {
        if (assignments.success && assignments.data) {
          for (const assignment of assignments.data) {
            allAssignments.push(assignment);
            subjectsCovered.add(assignment.subject);
            
            // Get skill details to track areas and difficulty
            const skillResult = await skillsService.getSkillById(assignment.skill_id);
            if (skillResult.success && skillResult.data) {
              skillsAreasCovered.add(skillResult.data.skills_area);
              const difficulty = skillResult.data.difficulty_level;
              difficultyDistribution[difficulty] = (difficultyDistribution[difficulty] || 0) + 1;
            }
          }
        }
      }

      // Save assignments to database
      if (allAssignments.length > 0) {
        const { error: insertError } = await supabase
          .from('daily_assignments')
          .insert(allAssignments);

        if (insertError) {
          throw this.createError('INSERT_ASSIGNMENTS_ERROR', 'Failed to save generated assignments', insertError);
        }
      }

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        allAssignments,
        progressSummaries,
        total_minutes,
        finnContext
      );

      const result: GeneratedAssignments = {
        assignments: allAssignments,
        total_estimated_minutes: allAssignments.reduce((sum, a) => sum + a.estimated_time_minutes, 0),
        subjects_covered: Array.from(subjectsCovered),
        skills_areas_covered: Array.from(skillsAreasCovered),
        difficulty_distribution: difficultyDistribution,
        recommendations
      };

      // Invalidate cache for this student and date
      this.cache.invalidateStudent(student_id);
      this.cache.invalidateDate(target_date);

      return {
        success: true,
        data: result,
        metadata: {
          query_time_ms: Date.now() - startTime,
          cache_hit: false,
          total_count: allAssignments.length
        }
      };

    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  /**
   * Get assignments for a specific date
   */
  async getAssignmentsForDate(
    studentId: string,
    date: Date,
    options?: { includeSkillDetails?: boolean; useCache?: boolean }
  ): Promise<ServiceResponse<AssignmentWithSkill[]>> {
    const startTime = Date.now();
    const dateString = date.toISOString().split('T')[0];
    const cacheKey = `assignments_${studentId}_${dateString}_${options?.includeSkillDetails || false}`;
    
    try {
      // Check cache first
      if (options?.useCache !== false) {
        const cached = this.cache.get<AssignmentWithSkill[]>(cacheKey);
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

      let query = supabase
        .from('daily_assignments')
        .select(options?.includeSkillDetails ? `
          *,
          skills_master!inner(*),
          student_skill_progress(*)
        ` : '*')
        .eq('student_id', studentId)
        .eq('assignment_date', dateString)
        .order('created_at', { ascending: true });

      const { data, error } = await query;

      if (error) {
        throw this.createError('FETCH_ASSIGNMENTS_ERROR', `Failed to fetch assignments for ${dateString}`, error);
      }

      let assignments: AssignmentWithSkill[];

      if (options?.includeSkillDetails) {
        // Transform data when skill details are included
        assignments = (data || []).map(item => ({
          id: item.id,
          student_id: item.student_id,
          assignment_date: item.assignment_date,
          skill_id: item.skill_id,
          subject: item.subject,
          estimated_time_minutes: item.estimated_time_minutes,
          assigned_tool: item.assigned_tool,
          status: item.status,
          created_at: item.created_at,
          skill: item.skills_master,
          progress: item.student_skill_progress?.[0] || undefined
        }));
      } else {
        // For each assignment, fetch skill details separately
        assignments = await Promise.all(
          (data || []).map(async (assignment) => {
            const skillResult = await skillsService.getSkillById(assignment.skill_id);
            const skill = skillResult.success ? skillResult.data : null;
            
            return {
              ...assignment,
              skill: skill!
            };
          })
        );
      }

      // Cache the results
      if (options?.useCache !== false) {
        this.cache.set(cacheKey, assignments);
      }

      return {
        success: true,
        data: assignments,
        metadata: {
          query_time_ms: Date.now() - startTime,
          cache_hit: false,
          total_count: assignments.length
        }
      };

    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  /**
   * Update assignment status
   */
  async updateAssignmentStatus(
    assignmentId: string,
    status: AssignmentStatus,
    metadata?: { completion_time?: number; notes?: string }
  ): Promise<ServiceResponse<DailyAssignment>> {
    const startTime = Date.now();
    
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      // Add metadata if provided
      if (metadata) {
        updateData.metadata = metadata;
      }

      const { data, error } = await supabase
        .from('daily_assignments')
        .update(updateData)
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) {
        throw this.createError('UPDATE_ASSIGNMENT_ERROR', `Failed to update assignment ${assignmentId}`, error);
      }

      // If assignment is completed, potentially update skill progress
      if (status === 'completed' && data) {
        await this.handleAssignmentCompletion(data, metadata);
      }

      // Invalidate cache
      this.cache.invalidateStudent(data.student_id);
      this.cache.invalidateDate(data.assignment_date);

      return {
        success: true,
        data: data,
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
   * Get assignment history for a student
   */
  async getAssignmentHistory(
    studentId: string,
    days: number = 7,
    filters?: AssignmentFilters,
    pagination?: PaginationOptions
  ): Promise<ServiceResponse<PaginatedResult<AssignmentWithSkill>>> {
    const startTime = Date.now();
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      let query = supabase
        .from('daily_assignments')
        .select(`
          *,
          skills_master!inner(*)
        `, { count: 'exact' })
        .eq('student_id', studentId)
        .gte('assignment_date', startDate.toISOString().split('T')[0])
        .lte('assignment_date', endDate.toISOString().split('T')[0]);

      // Apply additional filters
      if (filters?.subject) {
        query = query.eq('subject', filters.subject);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.assigned_tool) {
        query = query.eq('assigned_tool', filters.assigned_tool);
      }

      // Apply sorting
      query = query.order('assignment_date', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply pagination
      if (pagination) {
        const offset = pagination.offset || ((pagination.page - 1) * pagination.limit);
        query = query.range(offset, offset + pagination.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw this.createError('FETCH_HISTORY_ERROR', `Failed to fetch assignment history for student ${studentId}`, error);
      }

      // Transform the data
      const assignments: AssignmentWithSkill[] = (data || []).map(item => ({
        id: item.id,
        student_id: item.student_id,
        assignment_date: item.assignment_date,
        skill_id: item.skill_id,
        subject: item.subject,
        estimated_time_minutes: item.estimated_time_minutes,
        assigned_tool: item.assigned_tool,
        status: item.status,
        created_at: item.created_at,
        skill: item.skills_master
      }));

      const totalItems = count || 0;

      let paginatedResult: PaginatedResult<AssignmentWithSkill>;

      if (pagination) {
        const totalPages = Math.ceil(totalItems / pagination.limit);
        const currentPage = pagination.page;
        
        paginatedResult = {
          items: assignments,
          pagination: {
            current_page: currentPage,
            total_pages: totalPages,
            total_items: totalItems,
            items_per_page: pagination.limit,
            has_previous: currentPage > 1,
            has_next: currentPage < totalPages
          }
        };
      } else {
        paginatedResult = {
          items: assignments,
          pagination: {
            current_page: 1,
            total_pages: 1,
            total_items: totalItems,
            items_per_page: totalItems,
            has_previous: false,
            has_next: false
          }
        };
      }

      return {
        success: true,
        data: paginatedResult,
        metadata: {
          query_time_ms: Date.now() - startTime,
          cache_hit: false,
          total_count: totalItems
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
   * Generate assignments for a specific subject
   */
  private async generateSubjectAssignments(
    studentId: string,
    subject: Subject,
    grade: Grade,
    timeAllocation: number,
    options?: {
      difficulty_preference?: 'adaptive' | 'challenging' | 'review';
      focus_areas?: string[];
      finn_context?: FinnAssignmentContext;
    }
  ): Promise<ServiceResponse<DailyAssignment[]>> {
    try {
      // Get next recommended skills for this subject
      const nextSkillsResult = await studentProgressService.getNextSkills(
        studentId,
        subject,
        grade,
        {
          limit: 5,
          difficulty_preference: options?.difficulty_preference
        }
      );

      if (!nextSkillsResult.success || !nextSkillsResult.data?.length) {
        return {
          success: true,
          data: [],
          metadata: {
            query_time_ms: 0,
            cache_hit: false,
            total_count: 0
          }
        };
      }

      const availableSkills = nextSkillsResult.data;

      // Filter by focus areas if specified
      let targetSkills = availableSkills;
      if (options?.focus_areas && options.focus_areas.length > 0) {
        targetSkills = availableSkills.filter(skill => 
          options.focus_areas!.some(area => 
            skill.skills_area.toLowerCase().includes(area.toLowerCase())
          )
        );
      }

      // If no skills match focus areas, fall back to available skills
      if (targetSkills.length === 0) {
        targetSkills = availableSkills;
      }

      // Select skills that fit within time allocation
      const selectedSkills = this.selectSkillsForTimeAllocation(targetSkills, timeAllocation);

      // Generate assignments
      const assignments: DailyAssignment[] = selectedSkills.map(skill => ({
        id: '', // Will be set by database
        student_id: studentId,
        assignment_date: new Date().toISOString().split('T')[0],
        skill_id: skill.id,
        subject: skill.subject,
        estimated_time_minutes: skill.estimated_time_minutes,
        assigned_tool: this.selectToolForSkill(skill, options?.finn_context),
        status: 'assigned' as AssignmentStatus,
        created_at: new Date().toISOString()
      }));

      return {
        success: true,
        data: assignments,
        metadata: {
          query_time_ms: 0,
          cache_hit: false,
          total_count: assignments.length
        }
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Select skills that fit within time allocation
   */
  private selectSkillsForTimeAllocation(skills: Skill[], maxMinutes: number): Skill[] {
    const selected: Skill[] = [];
    let totalTime = 0;

    // Sort by priority (earlier in sequence, appropriate difficulty)
    const sortedSkills = [...skills].sort((a, b) => {
      const areaComparison = a.skills_area.localeCompare(b.skills_area);
      if (areaComparison !== 0) return areaComparison;
      return a.skill_number.localeCompare(b.skill_number);
    });

    for (const skill of sortedSkills) {
      if (totalTime + skill.estimated_time_minutes <= maxMinutes) {
        selected.push(skill);
        totalTime += skill.estimated_time_minutes;
      }
    }

    // Ensure at least one skill is selected if possible
    if (selected.length === 0 && skills.length > 0) {
      selected.push(skills[0]);
    }

    return selected;
  }

  /**
   * Select appropriate tool for a skill
   */
  private selectToolForSkill(skill: Skill, finnContext?: FinnAssignmentContext): ToolName {
    // Use Finn context if available for intelligent tool selection
    if (finnContext?.adaptive_adjustments?.tool_preferences) {
      const preferences = finnContext.adaptive_adjustments.tool_preferences;
      const subjectTools = ALTERNATIVE_TOOLS[skill.subject];
      
      for (const preferredTool of preferences) {
        if (subjectTools.includes(preferredTool)) {
          return preferredTool;
        }
      }
    }

    // Default to subject mapping
    return SUBJECT_TO_TOOL_MAPPING[skill.subject];
  }

  /**
   * Determine target subjects based on progress and context
   */
  private determineTargetSubjects(
    progressSummaries: any[],
    finnContext?: FinnAssignmentContext
  ): Subject[] {
    if (finnContext?.learning_goals?.focus_subjects) {
      return finnContext.learning_goals.focus_subjects;
    }

    // Default to all subjects with progress, or all subjects if no progress
    const subjectsWithProgress = progressSummaries.map(p => p.subject);
    return subjectsWithProgress.length > 0 
      ? subjectsWithProgress 
      : ['Math', 'ELA'];
  }

  /**
   * Check if a focus area is relevant to a subject
   */
  private isAreaRelevantToSubject(area: string, subject: Subject): boolean {
    const subjectAreas: Record<Subject, string[]> = {
      'Math': ['numbers', 'counting', 'addition', 'subtraction', 'geometry', 'measurement'],
      'ELA': ['reading', 'writing', 'phonics', 'vocabulary', 'comprehension', 'letters'],
      'Science': ['observation', 'experiments', 'nature', 'animals', 'plants', 'weather'],
      'SocialStudies': ['community', 'family', 'culture', 'geography', 'history', 'citizenship']
    };

    const relevantAreas = subjectAreas[subject] || [];
    return relevantAreas.some(relevantArea => 
      area.toLowerCase().includes(relevantArea) || relevantArea.includes(area.toLowerCase())
    );
  }

  /**
   * Generate recommendations based on assignments
   */
  private generateRecommendations(
    assignments: DailyAssignment[],
    progressSummaries: any[],
    totalMinutes: number,
    finnContext?: FinnAssignmentContext
  ): string[] {
    const recommendations: string[] = [];

    if (assignments.length === 0) {
      recommendations.push('No assignments could be generated. Consider reviewing completed skills or adjusting difficulty preferences.');
      return recommendations;
    }

    const actualMinutes = assignments.reduce((sum, a) => sum + a.estimated_time_minutes, 0);
    
    if (actualMinutes < totalMinutes * 0.8) {
      recommendations.push('Consider adding more challenging skills to reach your time goal.');
    }

    if (actualMinutes > totalMinutes * 1.2) {
      recommendations.push('This session might take longer than planned. Consider breaking it into multiple sessions.');
    }

    const subjects = new Set(assignments.map(a => a.subject));
    if (subjects.size === 1) {
      recommendations.push('Try including skills from multiple subjects for a well-rounded learning session.');
    }

    return recommendations;
  }

  /**
   * Handle assignment completion
   */
  private async handleAssignmentCompletion(
    assignment: DailyAssignment,
    metadata?: { completion_time?: number; notes?: string }
  ): Promise<void> {
    try {
      // Update skill progress if completion time is provided
      if (metadata?.completion_time) {
        await studentProgressService.updateSkillProgress(
          assignment.student_id,
          assignment.skill_id,
          {
            status: 'completed',
            time_spent_minutes: metadata.completion_time
          }
        );
      }
    } catch (error) {
      console.warn('Failed to update skill progress on assignment completion:', error);
    }
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
      'PROGRESS_FETCH_ERROR': [
        'Ensure the student has some progress recorded',
        'Check if the student ID is valid',
        'Try generating assignments with different parameters'
      ],
      'INSERT_ASSIGNMENTS_ERROR': [
        'Check for duplicate assignments on the same date',
        'Verify all required fields are present',
        'Ensure the student and skills exist in the database'
      ],
      'FETCH_ASSIGNMENTS_ERROR': [
        'Verify the date format is correct (YYYY-MM-DD)',
        'Check if the student ID is valid',
        'Try with a different date range'
      ],
      'UPDATE_ASSIGNMENT_ERROR': [
        'Ensure the assignment ID exists',
        'Check if the status value is valid',
        'Verify you have permission to update this assignment'
      ]
    };

    return suggestions[code] || ['Check the error details for more information'];
  }

  /**
   * Clear assignment cache for a student
   */
  clearStudentCache(studentId: string): void {
    this.cache.invalidateStudent(studentId);
  }

  /**
   * Clear assignment cache for a date
   */
  clearDateCache(date: string): void {
    this.cache.invalidateDate(date);
  }

  /**
   * Clear all assignment cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// ================================================================
// SINGLETON EXPORT
// ================================================================

export const dailyAssignmentService = DailyAssignmentService.getInstance();