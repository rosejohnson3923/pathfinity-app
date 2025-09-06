// ================================================================
// ENHANCED SKILLS SERVICE
// Comprehensive service for skills database operations
// ================================================================

import { supabase } from '../lib/supabase';
import type {
  Skill,
  SkillWithProgress,
  SkillSequence,
  SkillFilters,
  SkillSearchQuery,
  SkillSearchResult,
  ServiceResponse,
  ServiceError,
  PaginationOptions,
  SortOptions,
  PaginatedResult,
  Grade,
  Subject,
  CreateSkillData,
  UpdateSkillData
} from '../types/services';

// ================================================================
// CACHE MANAGEMENT
// ================================================================

class SkillsCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    // Clean up expired entries periodically
    if (this.cache.size > 100) {
      this.cleanup();
    }
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

  invalidate(pattern: string): void {
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

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      expired: Array.from(this.cache.values()).filter(
        entry => Date.now() - entry.timestamp > entry.ttl
      ).length
    };
  }
}

// ================================================================
// ENHANCED SKILLS SERVICE CLASS
// ================================================================

export class EnhancedSkillsService {
  private static instance: EnhancedSkillsService;
  private cache = new SkillsCache();

  static getInstance(): EnhancedSkillsService {
    if (!EnhancedSkillsService.instance) {
      EnhancedSkillsService.instance = new EnhancedSkillsService();
    }
    return EnhancedSkillsService.instance;
  }

  // ================================================================
  // CORE SKILL OPERATIONS
  // ================================================================

  /**
   * Get skills by grade and subject - wrapper for getSkillsByGrade
   */
  async getSkillsByGradeAndSubject(
    grade: Grade,
    subject: Subject,
    options?: { useCache?: boolean; includeCounts?: boolean }
  ): Promise<ServiceResponse<Skill[]>> {
    return this.getSkillsByGrade(grade, subject, options);
  }

  /**
   * Get skills by grade with optional subject filtering
   */
  async getSkillsByGrade(
    grade: Grade,
    subject?: Subject,
    options?: { useCache?: boolean; includeCounts?: boolean }
  ): Promise<ServiceResponse<Skill[]>> {
    const startTime = Date.now();
    const cacheKey = `skills_by_grade_${grade}_${subject || 'all'}`;
    
    try {
      // Check cache first
      if (options?.useCache !== false) {
        const cached = this.cache.get<Skill[]>(cacheKey);
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
        .from('skills_master')
        .select('*')
        .eq('grade', grade)
        .order('subject', { ascending: true })
        .order('skills_area', { ascending: true })
        .order('skill_number', { ascending: true });

      if (subject) {
        query = query.eq('subject', subject);
      }

      const { data, error } = await query;

      if (error) {
        throw this.createError('FETCH_SKILLS_ERROR', `Failed to fetch skills for grade ${grade}`, error);
      }

      const skills = data || [];
      
      // Cache the results
      if (options?.useCache !== false) {
        this.cache.set(cacheKey, skills);
      }

      return {
        success: true,
        data: skills,
        metadata: {
          query_time_ms: Date.now() - startTime,
          cache_hit: false,
          total_count: skills.length
        }
      };

    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  /**
   * Get skills by subject with optional grade filtering
   */
  async getSkillsBySubject(
    subject: Subject,
    grade?: Grade,
    options?: { useCache?: boolean; sortBy?: 'difficulty' | 'sequence' | 'area' }
  ): Promise<ServiceResponse<Skill[]>> {
    const startTime = Date.now();
    const cacheKey = `skills_by_subject_${subject}_${grade || 'all'}_${options?.sortBy || 'default'}`;
    
    try {
      // Check cache first
      if (options?.useCache !== false) {
        const cached = this.cache.get<Skill[]>(cacheKey);
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
        .from('skills_master')
        .select('*')
        .eq('subject', subject);

      if (grade) {
        query = query.eq('grade', grade);
      }

      // Apply sorting
      switch (options?.sortBy) {
        case 'difficulty':
          query = query.order('difficulty_level', { ascending: true });
          break;
        case 'sequence':
          query = query.order('skill_number', { ascending: true });
          break;
        case 'area':
          query = query.order('skills_area', { ascending: true }).order('skill_number', { ascending: true });
          break;
        default:
          query = query.order('skills_area', { ascending: true }).order('skill_number', { ascending: true });
      }

      const { data, error } = await query;

      if (error) {
        throw this.createError('FETCH_SKILLS_ERROR', `Failed to fetch skills for subject ${subject}`, error);
      }

      const skills = data || [];
      
      // Cache the results
      if (options?.useCache !== false) {
        this.cache.set(cacheKey, skills);
      }

      return {
        success: true,
        data: skills,
        metadata: {
          query_time_ms: Date.now() - startTime,
          cache_hit: false,
          total_count: skills.length
        }
      };

    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  /**
   * Get a specific skill by ID
   */
  async getSkillById(skillId: string, options?: { useCache?: boolean }): Promise<ServiceResponse<Skill | null>> {
    const startTime = Date.now();
    const cacheKey = `skill_${skillId}`;
    
    try {
      // Check cache first
      if (options?.useCache !== false) {
        const cached = this.cache.get<Skill>(cacheKey);
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

      const { data, error } = await supabase
        .from('skills_master')
        .select('*')
        .eq('id', skillId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return {
            success: true,
            data: null,
            metadata: {
              query_time_ms: Date.now() - startTime,
              cache_hit: false
            }
          };
        }
        throw this.createError('FETCH_SKILL_ERROR', `Failed to fetch skill ${skillId}`, error);
      }

      // Cache the result
      if (options?.useCache !== false && data) {
        this.cache.set(cacheKey, data);
      }

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
   * Get ordered skill sequence for a subject and grade
   */
  async getSkillSequence(
    grade: Grade,
    subject: Subject,
    options?: { useCache?: boolean; includeProgress?: boolean; studentId?: string }
  ): Promise<ServiceResponse<SkillSequence[]>> {
    const startTime = Date.now();
    const cacheKey = `skill_sequence_${grade}_${subject}_${options?.studentId || 'no_student'}`;
    
    try {
      // Check cache first
      if (options?.useCache !== false) {
        const cached = this.cache.get<SkillSequence[]>(cacheKey);
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

      // Get skills grouped by skills_area
      const { data: skills, error } = await supabase
        .from('skills_master')
        .select('*')
        .eq('grade', grade)
        .eq('subject', subject)
        .order('skills_area', { ascending: true })
        .order('skill_number', { ascending: true });

      if (error) {
        throw this.createError('FETCH_SEQUENCE_ERROR', `Failed to fetch skill sequence for ${subject} ${grade}`, error);
      }

      // Get progress data if student ID provided
      let progressData: any[] = [];
      if (options?.includeProgress && options?.studentId) {
        const { data: progress, error: progressError } = await supabase
          .from('student_skill_progress')
          .select('skill_id, status')
          .eq('student_id', options.studentId)
          .in('status', ['completed', 'mastered']);

        if (!progressError) {
          progressData = progress || [];
        }
      }

      // Group skills by skills_area
      const skillsByArea = new Map<string, Skill[]>();
      const completedSkillIds = new Set(progressData.map(p => p.skill_id));

      for (const skill of skills || []) {
        if (!skillsByArea.has(skill.skills_area)) {
          skillsByArea.set(skill.skills_area, []);
        }
        skillsByArea.get(skill.skills_area)!.push(skill);
      }

      // Build skill sequences
      const sequences: SkillSequence[] = [];
      for (const [skillsArea, areaSkills] of skillsByArea) {
        const completedInArea = areaSkills.filter(skill => completedSkillIds.has(skill.id)).length;
        const nextSkill = areaSkills.find(skill => !completedSkillIds.has(skill.id));

        sequences.push({
          skills_area: skillsArea,
          skills: areaSkills,
          total_skills: areaSkills.length,
          completed_skills: completedInArea,
          next_skill: nextSkill,
          progress_percentage: areaSkills.length > 0 ? (completedInArea / areaSkills.length) * 100 : 0
        });
      }

      // Cache the results
      if (options?.useCache !== false) {
        this.cache.set(cacheKey, sequences);
      }

      return {
        success: true,
        data: sequences,
        metadata: {
          query_time_ms: Date.now() - startTime,
          cache_hit: false,
          total_count: sequences.length
        }
      };

    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  /**
   * Search skills with flexible query options
   */
  async searchSkills(searchQuery: SkillSearchQuery): Promise<ServiceResponse<SkillSearchResult>> {
    const startTime = Date.now();
    
    try {
      let query = supabase
        .from('skills_master')
        .select('*', { count: 'exact' });

      // Apply text search on skill_name and skill_description
      if (searchQuery.query) {
        query = query.or(`skill_name.ilike.%${searchQuery.query}%,skill_description.ilike.%${searchQuery.query}%`);
      }

      // Apply filters
      if (searchQuery.grade) {
        query = query.eq('grade', searchQuery.grade);
      }
      if (searchQuery.subject) {
        query = query.eq('subject', searchQuery.subject);
      }
      if (searchQuery.skills_area) {
        query = query.eq('skills_area', searchQuery.skills_area);
      }

      // Apply pagination
      const limit = searchQuery.limit || 20;
      const offset = searchQuery.offset || 0;
      query = query.range(offset, offset + limit - 1);

      // Apply ordering
      query = query.order('subject', { ascending: true })
        .order('skills_area', { ascending: true })
        .order('skill_number', { ascending: true });

      const { data, error, count } = await query;

      if (error) {
        throw this.createError('SEARCH_SKILLS_ERROR', `Failed to search skills with query: ${searchQuery.query}`, error);
      }

      const skills = data || [];
      const totalCount = count || 0;
      const hasMore = offset + limit < totalCount;

      const result: SkillSearchResult = {
        skills,
        total_count: totalCount,
        has_more: hasMore,
        search_time_ms: Date.now() - startTime
      };

      return {
        success: true,
        data: result,
        metadata: {
          query_time_ms: Date.now() - startTime,
          cache_hit: false,
          total_count: totalCount,
          has_more: hasMore
        }
      };

    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  /**
   * Get skills by specific skills area
   */
  async getSkillsByArea(
    grade: Grade,
    subject: Subject,
    skillsArea: string,
    options?: { useCache?: boolean; includeProgress?: boolean; studentId?: string }
  ): Promise<ServiceResponse<SkillWithProgress[]>> {
    const startTime = Date.now();
    const cacheKey = `skills_by_area_${grade}_${subject}_${skillsArea}_${options?.studentId || 'no_student'}`;
    
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

      // Get skills
      const { data: skills, error } = await supabase
        .from('skills_master')
        .select('*')
        .eq('grade', grade)
        .eq('subject', subject)
        .eq('skills_area', skillsArea)
        .order('skill_number', { ascending: true });

      if (error) {
        throw this.createError('FETCH_AREA_SKILLS_ERROR', `Failed to fetch skills for area ${skillsArea}`, error);
      }

      let skillsWithProgress: SkillWithProgress[] = skills || [];

      // Get progress data if requested
      if (options?.includeProgress && options?.studentId && skills?.length) {
        const skillIds = skills.map(skill => skill.id);
        const { data: progressData, error: progressError } = await supabase
          .from('student_skill_progress')
          .select('*')
          .eq('student_id', options.studentId)
          .in('skill_id', skillIds);

        if (!progressError && progressData) {
          const progressMap = new Map(progressData.map(p => [p.skill_id, p]));
          skillsWithProgress = skills.map(skill => ({
            ...skill,
            progress: progressMap.get(skill.id)
          }));
        }
      }

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
   * Get prerequisites for a specific skill
   */
  async getPrerequisites(skillId: string, options?: { recursive?: boolean }): Promise<ServiceResponse<Skill[]>> {
    const startTime = Date.now();
    
    try {
      // Get the skill first
      const skillResponse = await this.getSkillById(skillId);
      if (!skillResponse.success || !skillResponse.data) {
        throw this.createError('SKILL_NOT_FOUND', `Skill ${skillId} not found`);
      }

      const skill = skillResponse.data;
      const prerequisites: Skill[] = [];

      if (skill.prerequisites && skill.prerequisites.length > 0) {
        // Get direct prerequisites
        const { data: prereqSkills, error } = await supabase
          .from('skills_master')
          .select('*')
          .in('id', skill.prerequisites);

        if (error) {
          throw this.createError('FETCH_PREREQUISITES_ERROR', `Failed to fetch prerequisites for skill ${skillId}`, error);
        }

        prerequisites.push(...(prereqSkills || []));

        // Get recursive prerequisites if requested
        if (options?.recursive) {
          for (const prereqSkill of prereqSkills || []) {
            if (prereqSkill.prerequisites && prereqSkill.prerequisites.length > 0) {
              const recursivePrereqs = await this.getPrerequisites(prereqSkill.id, { recursive: true });
              if (recursivePrereqs.success && recursivePrereqs.data) {
                prerequisites.push(...recursivePrereqs.data);
              }
            }
          }
        }
      }

      // Remove duplicates
      const uniquePrerequisites = prerequisites.filter((skill, index, array) => 
        array.findIndex(s => s.id === skill.id) === index
      );

      return {
        success: true,
        data: uniquePrerequisites,
        metadata: {
          query_time_ms: Date.now() - startTime,
          cache_hit: false,
          total_count: uniquePrerequisites.length
        }
      };

    } catch (error) {
      return this.handleError(error as Error, startTime);
    }
  }

  // ================================================================
  // ADVANCED QUERY OPERATIONS
  // ================================================================

  /**
   * Get skills with advanced filtering
   */
  async getSkillsWithFilters(
    filters: SkillFilters,
    pagination?: PaginationOptions,
    sort?: SortOptions
  ): Promise<ServiceResponse<PaginatedResult<Skill>>> {
    const startTime = Date.now();
    
    try {
      let query = supabase
        .from('skills_master')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.grade) query = query.eq('grade', filters.grade);
      if (filters.subject) query = query.eq('subject', filters.subject);
      if (filters.skills_area) query = query.eq('skills_area', filters.skills_area);
      if (filters.skills_cluster) query = query.eq('skills_cluster', filters.skills_cluster);
      if (filters.difficulty_level) query = query.eq('difficulty_level', filters.difficulty_level);
      if (filters.difficulty_range) {
        query = query.gte('difficulty_level', filters.difficulty_range[0])
          .lte('difficulty_level', filters.difficulty_range[1]);
      }
      if (filters.estimated_time_max) query = query.lte('estimated_time_minutes', filters.estimated_time_max);
      if (filters.has_prerequisites !== undefined) {
        if (filters.has_prerequisites) {
          query = query.not('prerequisites', 'is', null);
        } else {
          query = query.is('prerequisites', null);
        }
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('subject', { ascending: true })
          .order('skills_area', { ascending: true })
          .order('skill_number', { ascending: true });
      }

      // Apply pagination
      if (pagination) {
        const offset = pagination.offset || ((pagination.page - 1) * pagination.limit);
        query = query.range(offset, offset + pagination.limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        throw this.createError('FETCH_FILTERED_SKILLS_ERROR', 'Failed to fetch skills with filters', error);
      }

      const skills = data || [];
      const totalItems = count || 0;

      let paginatedResult: PaginatedResult<Skill>;

      if (pagination) {
        const totalPages = Math.ceil(totalItems / pagination.limit);
        const currentPage = pagination.page;
        
        paginatedResult = {
          items: skills,
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
          items: skills,
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
  // ADMINISTRATIVE OPERATIONS
  // ================================================================

  /**
   * Create a new skill
   */
  async createSkill(skillData: CreateSkillData): Promise<ServiceResponse<Skill>> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase
        .from('skills_master')
        .insert(skillData)
        .select()
        .single();

      if (error) {
        throw this.createError('CREATE_SKILL_ERROR', 'Failed to create skill', error);
      }

      // Invalidate relevant cache entries
      this.cache.invalidate(`skills_by_grade_${skillData.grade}`);
      this.cache.invalidate(`skills_by_subject_${skillData.subject}`);
      this.cache.invalidate(`skill_sequence_${skillData.grade}_${skillData.subject}`);

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
   * Update an existing skill
   */
  async updateSkill(skillId: string, updateData: UpdateSkillData): Promise<ServiceResponse<Skill>> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase
        .from('skills_master')
        .update(updateData)
        .eq('id', skillId)
        .select()
        .single();

      if (error) {
        throw this.createError('UPDATE_SKILL_ERROR', `Failed to update skill ${skillId}`, error);
      }

      // Invalidate cache entries
      this.cache.invalidate(`skill_${skillId}`);
      if (data) {
        this.cache.invalidate(`skills_by_grade_${data.grade}`);
        this.cache.invalidate(`skills_by_subject_${data.subject}`);
        this.cache.invalidate(`skill_sequence_${data.grade}_${data.subject}`);
      }

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

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  /**
   * Clear all cache entries
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
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
      'FETCH_SKILLS_ERROR': [
        'Check if the grade and subject parameters are valid',
        'Verify database connection',
        'Try again with different filters'
      ],
      'SKILL_NOT_FOUND': [
        'Verify the skill ID is correct',
        'Check if the skill exists in the database',
        'Try searching for the skill by name'
      ],
      'CREATE_SKILL_ERROR': [
        'Ensure all required fields are provided',
        'Check for duplicate skill numbers within the same subject/grade',
        'Verify the skill data meets validation requirements'
      ],
      'UPDATE_SKILL_ERROR': [
        'Verify the skill ID exists',
        'Check if the update data is valid',
        'Ensure you have permission to update skills'
      ]
    };

    return suggestions[code] || ['Check the error details for more information'];
  }
}

// ================================================================
// SINGLETON EXPORT
// ================================================================

export const skillsService = EnhancedSkillsService.getInstance();