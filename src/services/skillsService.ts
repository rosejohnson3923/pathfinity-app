// ================================================================
// PATHFINITY SKILLS SERVICE
// Service layer for interacting with the skills database
// ================================================================

import { supabase } from '../lib/supabase';
import type {
  SkillsMaster,
  StudentSkillProgress,
  DailyAssignment,
  CreateSkillRequest,
  UpdateProgressRequest,
  CreateAssignmentRequest,
  SkillFilters,
  ProgressFilters,
  StudentDashboardData,
  SkillWithProgress,
  AssignmentWithSkillAndProgress,
  StudentProgressSummary,
  SkillsError
} from '../types/skills';

// ================================================================
// SKILLS MASTER OPERATIONS
// ================================================================

export class SkillsService {
  
  // Get all skills with optional filtering
  static async getSkills(filters?: SkillFilters): Promise<SkillsMaster[]> {
    try {
      let query = supabase
        .from('skills_master')
        .select('*')
        .order('subject', { ascending: true })
        .order('grade', { ascending: true })
        .order('skill_number', { ascending: true });

      if (filters) {
        if (filters.subject) query = query.eq('subject', filters.subject);
        if (filters.grade) query = query.eq('grade', filters.grade);
        if (filters.skills_area) query = query.eq('skills_area', filters.skills_area);
        if (filters.difficulty_level) query = query.eq('difficulty_level', filters.difficulty_level);
        if (filters.estimated_time_max) query = query.lte('estimated_time_minutes', filters.estimated_time_max);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching skills:', error);
      throw this.createError('FETCH_SKILLS_ERROR', 'Failed to fetch skills', error);
    }
  }

  // Get a single skill by ID
  static async getSkillById(skillId: string): Promise<SkillsMaster | null> {
    try {
      const { data, error } = await supabase
        .from('skills_master')
        .select('*')
        .eq('id', skillId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching skill:', error);
      throw this.createError('FETCH_SKILL_ERROR', 'Failed to fetch skill', error);
    }
  }

  // Create a new skill
  static async createSkill(skillData: CreateSkillRequest): Promise<SkillsMaster> {
    try {
      const { data, error } = await supabase
        .from('skills_master')
        .insert(skillData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating skill:', error);
      throw this.createError('CREATE_SKILL_ERROR', 'Failed to create skill', error);
    }
  }

  // ================================================================
  // STUDENT PROGRESS OPERATIONS
  // ================================================================

  // Get student progress for specific skills
  static async getStudentProgress(
    studentId: string, 
    filters?: ProgressFilters
  ): Promise<StudentSkillProgress[]> {
    try {
      let query = supabase
        .from('student_skill_progress')
        .select('*')
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false });

      if (filters) {
        if (filters.status) query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching student progress:', error);
      throw this.createError('FETCH_PROGRESS_ERROR', 'Failed to fetch progress', error);
    }
  }

  // Update student progress on a skill
  static async updateProgress(
    studentId: string,
    progressData: UpdateProgressRequest
  ): Promise<StudentSkillProgress> {
    try {
      const { data, error } = await supabase
        .from('student_skill_progress')
        .upsert({
          student_id: studentId,
          skill_id: progressData.skill_id,
          status: progressData.status || 'in_progress',
          score: progressData.score,
          time_spent_minutes: progressData.time_spent_minutes || 0,
          attempts: 1 // This will be incremented if record exists
        }, {
          onConflict: 'student_id,skill_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw this.createError('UPDATE_PROGRESS_ERROR', 'Failed to update progress', error);
    }
  }

  // Get skills with progress for a student
  static async getSkillsWithProgress(
    studentId: string,
    filters?: SkillFilters
  ): Promise<SkillWithProgress[]> {
    try {
      let query = supabase
        .from('skills_master')
        .select(`
          *,
          progress:student_skill_progress(*)
        `)
        .order('subject', { ascending: true })
        .order('skill_number', { ascending: true });

      if (filters) {
        if (filters.subject) query = query.eq('subject', filters.subject);
        if (filters.grade) query = query.eq('grade', filters.grade);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transform the data to match our type
      return (data || []).map(skill => ({
        ...skill,
        progress: skill.progress?.find((p: any) => p.student_id === studentId)
      }));
    } catch (error) {
      console.error('Error fetching skills with progress:', error);
      throw this.createError('FETCH_SKILLS_PROGRESS_ERROR', 'Failed to fetch skills with progress', error);
    }
  }

  // ================================================================
  // DAILY ASSIGNMENTS OPERATIONS
  // ================================================================

  // Get daily assignments for a student
  static async getDailyAssignments(
    studentId: string,
    date?: string
  ): Promise<AssignmentWithSkillAndProgress[]> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_assignments')
        .select(`
          *,
          skill:skills_master(*),
          progress:student_skill_progress(*)
        `)
        .eq('student_id', studentId)
        .eq('assignment_date', targetDate)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our type
      return (data || []).map(assignment => ({
        ...assignment,
        skill: assignment.skill,
        progress: assignment.progress?.find((p: any) => 
          p.student_id === studentId && p.skill_id === assignment.skill_id
        )
      }));
    } catch (error) {
      console.error('Error fetching daily assignments:', error);
      throw this.createError('FETCH_ASSIGNMENTS_ERROR', 'Failed to fetch assignments', error);
    }
  }

  // Create a daily assignment
  static async createAssignment(assignmentData: CreateAssignmentRequest): Promise<DailyAssignment> {
    try {
      const { data, error } = await supabase
        .from('daily_assignments')
        .insert(assignmentData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw this.createError('CREATE_ASSIGNMENT_ERROR', 'Failed to create assignment', error);
    }
  }

  // Update assignment status
  static async updateAssignmentStatus(
    assignmentId: string,
    status: 'assigned' | 'started' | 'completed'
  ): Promise<DailyAssignment> {
    try {
      const { data, error } = await supabase
        .from('daily_assignments')
        .update({ status })
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating assignment status:', error);
      throw this.createError('UPDATE_ASSIGNMENT_ERROR', 'Failed to update assignment', error);
    }
  }

  // ================================================================
  // DASHBOARD DATA OPERATIONS
  // ================================================================

  // Get complete dashboard data for a student
  static async getStudentDashboardData(studentId: string): Promise<StudentDashboardData> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's assignments
      const todayAssignments = await this.getDailyAssignments(studentId, today);
      
      // Get progress summary
      const { data: progressSummary, error: progressError } = await supabase
        .from('student_progress_summary')
        .select('*')
        .eq('student_id', studentId);

      if (progressError) throw progressError;

      // Get recent completions (last 5)
      const { data: recentCompletions, error: recentError } = await supabase
        .from('student_skill_progress')
        .select(`
          *,
          skill:skills_master(*)
        `)
        .eq('student_id', studentId)
        .in('status', ['completed', 'mastered'])
        .order('completed_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      // Get suggested skills (not started, appropriate difficulty)
      const suggestedSkills = await this.getSkillsWithProgress(studentId, {
        // Add logic for skill suggestions based on progress
      });

      return {
        student: {
          id: studentId,
          name: 'Student', // This would come from user profile
          grade: 'Pre-K' // This would come from user profile
        },
        today_assignments: todayAssignments,
        progress_summary: progressSummary || [],
        recent_completions: recentCompletions || [],
        suggested_skills: suggestedSkills.filter(skill => !skill.progress).slice(0, 5)
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw this.createError('FETCH_DASHBOARD_ERROR', 'Failed to fetch dashboard data', error);
    }
  }

  // ================================================================
  // SAMPLE DATA OPERATIONS
  // ================================================================

  // Insert sample skills data
  static async insertSampleSkills(): Promise<void> {
    try {
      const { error } = await supabase.rpc('insert_sample_pre_k_math_skills');
      
      if (error) throw error;
      console.log('Sample skills inserted successfully');
    } catch (error) {
      console.error('Error inserting sample skills:', error);
      throw this.createError('INSERT_SAMPLE_ERROR', 'Failed to insert sample skills', error);
    }
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  private static createError(code: string, message: string, details?: any): SkillsError {
    return {
      code,
      message,
      details: details || {}
    };
  }

  // Validate skill data before insertion
  static validateSkillData(skillData: CreateSkillRequest): string[] {
    const errors: string[] = [];
    
    if (!skillData.skill_name?.trim()) {
      errors.push('Skill name is required');
    }
    
    if (!skillData.subject) {
      errors.push('Subject is required');
    }
    
    if (!skillData.grade) {
      errors.push('Grade is required');
    }
    
    if (skillData.difficulty_level < 1 || skillData.difficulty_level > 10) {
      errors.push('Difficulty level must be between 1 and 10');
    }
    
    if (skillData.estimated_time_minutes <= 0) {
      errors.push('Estimated time must be greater than 0');
    }
    
    return errors;
  }

  // Generate skill assignments for a student based on their progress
  static async generateDailyAssignments(
    studentId: string,
    targetDate?: string,
    maxAssignments: number = 3
  ): Promise<DailyAssignment[]> {
    try {
      const date = targetDate || new Date().toISOString().split('T')[0];
      
      // Get student's current progress
      const skillsWithProgress = await this.getSkillsWithProgress(studentId);
      
      // Filter for skills that need work (not completed/mastered)
      const availableSkills = skillsWithProgress.filter(skill => 
        !skill.progress || skill.progress.status === 'not_started' || skill.progress.status === 'in_progress'
      );
      
      // Sort by difficulty and select appropriate skills
      const selectedSkills = availableSkills
        .sort((a, b) => a.difficulty_level - b.difficulty_level)
        .slice(0, maxAssignments);
      
      const assignments: DailyAssignment[] = [];
      
      for (const skill of selectedSkills) {
        // Determine appropriate tool based on subject
        let assignedTool: DailyAssignment['assigned_tool'] = 'MasterToolInterface';
        
        switch (skill.subject) {
          case 'Math':
            assignedTool = 'MasterToolInterface';
            break;
          case 'Science':
            assignedTool = 'MasterToolInterface';
            break;
          case 'ELA':
            assignedTool = 'MasterToolInterface';
            break;
          default:
            assignedTool = 'MasterToolInterface';
        }
        
        const assignment = await this.createAssignment({
          student_id: studentId,
          assignment_date: date,
          skill_id: skill.id,
          subject: skill.subject,
          estimated_time_minutes: skill.estimated_time_minutes,
          assigned_tool: assignedTool
        });
        
        assignments.push(assignment);
      }
      
      return assignments;
    } catch (error) {
      console.error('Error generating assignments:', error);
      throw this.createError('GENERATE_ASSIGNMENTS_ERROR', 'Failed to generate assignments', error);
    }
  }
}