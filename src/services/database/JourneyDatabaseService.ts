/**
 * Journey Database Service
 * Syncs learning journey data between localStorage and Supabase database
 * Implements Phase 2 of the Journey Persistence Implementation Plan
 */

import { supabase } from '../../lib/supabase';
import { LearningJourney, ParentOverride, SyncMetadata } from '../LearningJourneyService';
import { getDemoUserType, DemoUserType } from '../../utils/demoUserDetection';
import { DEMO_USER_CONFIG } from '../../types/demo.types';

interface DatabaseJourney {
  id?: string;
  user_id: string;
  tenant_id: string;
  grade_level: string;
  school_year: string;
  career: string | null;
  career_data?: any;
  career_selected_date?: string;
  companion: string | null;
  companion_data?: any;
  companion_selected_date?: string;
  completion_percentage: number;
  skills_completed: number;
  skills_total: number;
  advanced_early: boolean;
  last_skill_completed?: string;
  last_skill_completed_date?: string;
  current_unit?: string;
  current_lesson?: string;
  time_spent_minutes: number;
  streak_days: number;
  last_active_date?: string;
  started_date?: string;
  last_accessed: string;
  created_at?: string;
  updated_at?: string;
  // Demo fields
  is_demo?: boolean;
  demo_type?: string;
}

interface GradeProgression {
  id?: string;
  user_id: string;
  tenant_id: string;
  grade_level: string;
  school_year: string;
  started_date: string;
  completed_date?: string;
  completion_percentage: number;
  advanced_early: boolean;
  advancement_date?: string;
  advancement_by?: 'student_completion' | 'parent_override';
  advancement_reason?: string;
  parent_id?: string;
  override_completion_percentage?: number;
}

interface SkillAuthority {
  id?: string;
  user_id: string;
  tenant_id: string;
  skill_id: string;
  grade_level: string;
  completed_by: 'student' | 'parent_override';
  completed_date: string;
  mastery_score?: number;
  attempts: number;
  time_spent_minutes: number;
  parent_id?: string;
  override_reason?: string;
}

export class JourneyDatabaseService {
  private static instance: JourneyDatabaseService;

  private constructor() {}

  static getInstance(): JourneyDatabaseService {
    if (!JourneyDatabaseService.instance) {
      JourneyDatabaseService.instance = new JourneyDatabaseService();
    }
    return JourneyDatabaseService.instance;
  }

  /**
   * Convert localStorage journey to database format
   */
  private toDatabaseJourney(
    journey: LearningJourney,
    userId: string,
    tenantId: string,
    gradeLevel: string
  ): DatabaseJourney {
    const now = new Date().toISOString();

    return {
      user_id: userId,
      tenant_id: tenantId,
      grade_level: gradeLevel,
      school_year: journey.school_year || this.getCurrentSchoolYear(),
      career: journey.career,
      career_data: journey.careerData || {},
      career_selected_date: journey.careerSelectedDate,
      companion: journey.companion,
      companion_data: {},
      companion_selected_date: journey.companionSelectedDate,
      completion_percentage: journey.completionPercentage || 0,
      skills_completed: journey.skillsCompleted || 0,
      skills_total: journey.skillsTotal || 0,
      advanced_early: journey.advancedEarly || false,
      last_skill_completed: journey.lastSkillCompleted,
      last_skill_completed_date: journey.lastSkillCompletedDate,
      current_unit: journey.currentUnit,
      current_lesson: journey.currentLesson,
      time_spent_minutes: journey.timeSpentMinutes || 0,
      streak_days: journey.streakDays || 0,
      last_active_date: journey.lastActiveDate,
      last_accessed: journey.lastAccessedDate || now
    };
  }

  /**
   * Convert database record to localStorage format
   */
  private fromDatabaseJourney(dbJourney: DatabaseJourney): LearningJourney {
    return {
      career: dbJourney.career,
      careerData: dbJourney.career_data,
      careerSelectedDate: dbJourney.career_selected_date,
      companion: dbJourney.companion,
      companionSelectedDate: dbJourney.companion_selected_date,
      lastAccessedDate: dbJourney.last_accessed,
      user_id: dbJourney.user_id,
      tenant_id: dbJourney.tenant_id,
      grade_level: dbJourney.grade_level,
      school_year: dbJourney.school_year,
      completionPercentage: dbJourney.completion_percentage,
      skillsCompleted: dbJourney.skills_completed,
      skillsTotal: dbJourney.skills_total,
      advancedEarly: dbJourney.advanced_early,
      lastSkillCompleted: dbJourney.last_skill_completed,
      lastSkillCompletedDate: dbJourney.last_skill_completed_date,
      currentUnit: dbJourney.current_unit,
      currentLesson: dbJourney.current_lesson,
      timeSpentMinutes: dbJourney.time_spent_minutes,
      streakDays: dbJourney.streak_days,
      lastActiveDate: dbJourney.last_active_date
    };
  }

  /**
   * Get current school year
   */
  private getCurrentSchoolYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // School year starts in August (month 7)
    if (month >= 7) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  }

  /**
   * Check if operation should include demo flag
   */
  private shouldFlagAsDemo(userId: string): { isDemo: boolean; demoType?: string } {
    const user = { id: userId }; // Minimal user object
    const demoType = getDemoUserType(user);

    if (demoType === 'demo-student') {
      return { isDemo: true, demoType: 'demo-student' };
    }

    return { isDemo: false };
  }

  /**
   * Add demo flags to any database write operation
   */
  private addDemoFlags<T extends Record<string, any>>(
    data: T,
    userId: string
  ): T & { is_demo?: boolean; demo_type?: string } {
    const demoInfo = this.shouldFlagAsDemo(userId);

    if (demoInfo.isDemo) {
      return {
        ...data,
        is_demo: true,
        demo_type: demoInfo.demoType
      };
    }

    return data;
  }

  /**
   * Save or update journey in database
   */
  async saveJourney(
    journey: LearningJourney,
    userId: string,
    tenantId: string,
    gradeLevel: string
  ): Promise<{ data: DatabaseJourney | null; error: any }> {
    try {
      // Check demo status
      const demoType = getDemoUserType({ id: userId });

      // Block saves for demo viewers
      if (demoType === 'demo-viewer') {
        console.log('🚫 Database save blocked for demo viewer');
        return { data: null, error: 'Read-only access - saves not permitted in demo mode' };
      }

      const client = await supabase();
      let dbJourney = this.toDatabaseJourney(journey, userId, tenantId, gradeLevel);

      // Add demo flags for demo students
      if (demoType === 'demo-student') {
        dbJourney = this.addDemoFlags(dbJourney, userId);
        console.log('📝 Saving demo student journey with demo flags');
      }

      // Check if journey exists
      const { data: existing } = await client
        .from('learning_journeys')
        .select('id')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .eq('grade_level', gradeLevel)
        .eq('school_year', dbJourney.school_year)
        .single();

      if (existing) {
        // Update existing journey
        const { data, error } = await client
          .from('learning_journeys')
          .update(dbJourney)
          .eq('id', existing.id)
          .select()
          .single();

        return { data, error };
      } else {
        // Insert new journey
        const { data, error } = await client
          .from('learning_journeys')
          .insert(dbJourney)
          .select()
          .single();

        return { data, error };
      }
    } catch (error) {
      console.error('Error saving journey to database:', error);
      return { data: null, error };
    }
  }

  /**
   * Get journey from database
   */
  async getJourney(
    userId: string,
    tenantId: string,
    gradeLevel: string
  ): Promise<{ data: LearningJourney | null; error: any }> {
    try {
      const client = await supabase();
      const schoolYear = this.getCurrentSchoolYear();

      const { data, error } = await client
        .from('learning_journeys')
        .select('*')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .eq('grade_level', gradeLevel)
        .eq('school_year', schoolYear)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is not an error
        return { data: null, error };
      }

      if (data) {
        return { data: this.fromDatabaseJourney(data), error: null };
      }

      return { data: null, error: null };
    } catch (error) {
      console.error('Error getting journey from database:', error);
      return { data: null, error };
    }
  }

  /**
   * Save parent override to database
   */
  async saveParentOverride(
    override: ParentOverride,
    tenantId: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const client = await supabase();

      // Call the database function to process parent override
      const { data, error } = await client.rpc('process_parent_override', {
        p_student_id: override.student_id,
        p_parent_id: override.parent_id,
        p_tenant_id: tenantId,
        p_from_grade: override.from_grade,
        p_to_grade: override.to_grade,
        p_completion_percentage: override.completion_at_override,
        p_reason: override.reason
      });

      if (error) {
        console.error('Error processing parent override:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error saving parent override:', error);
      return { success: false, error };
    }
  }

  /**
   * Get parent override history
   */
  async getParentOverrides(
    studentId: string
  ): Promise<{ data: ParentOverride[]; error: any }> {
    try {
      const client = await supabase();

      const { data, error } = await client
        .from('parent_override_audit')
        .select('*')
        .eq('student_id', studentId)
        .order('override_date', { ascending: false });

      if (error) {
        return { data: [], error };
      }

      const overrides: ParentOverride[] = (data || []).map(row => ({
        student_id: row.student_id,
        from_grade: row.from_grade,
        to_grade: row.to_grade,
        completion_at_override: row.completion_at_override,
        override_date: row.override_date,
        parent_id: row.parent_id,
        reason: row.reason,
        skills_incomplete: row.skills_incomplete
      }));

      return { data: overrides, error: null };
    } catch (error) {
      console.error('Error getting parent overrides:', error);
      return { data: [], error };
    }
  }

  /**
   * Track skill completion
   */
  async trackSkillCompletion(
    userId: string,
    tenantId: string,
    skillId: string,
    gradeLevel: string,
    completedBy: 'student' | 'parent_override',
    masteryScore?: number,
    parentId?: string
  ): Promise<{ success: boolean; error: any }> {
    try {
      const client = await supabase();

      const skillData: SkillAuthority = {
        user_id: userId,
        tenant_id: tenantId,
        skill_id: skillId,
        grade_level: gradeLevel,
        completed_by: completedBy,
        completed_date: new Date().toISOString(),
        mastery_score: masteryScore,
        attempts: 1,
        time_spent_minutes: 0,
        parent_id: parentId
      };

      const { error } = await client
        .from('skill_authority_tracking')
        .upsert(skillData, {
          onConflict: 'user_id,tenant_id,skill_id,grade_level'
        });

      if (error) {
        console.error('Error tracking skill completion:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error tracking skill:', error);
      return { success: false, error };
    }
  }

  /**
   * Add skill to remediation queue
   */
  async addToRemediationQueue(
    userId: string,
    tenantId: string,
    skillId: string,
    fromGrade: string,
    currentGrade: string,
    priority: number = 5
  ): Promise<{ success: boolean; error: any }> {
    try {
      const client = await supabase();

      const { error } = await client
        .from('remediation_queue')
        .insert({
          user_id: userId,
          tenant_id: tenantId,
          skill_id: skillId,
          from_grade: fromGrade,
          current_grade: currentGrade,
          priority,
          status: 'pending'
        });

      if (error) {
        console.error('Error adding to remediation queue:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error adding to remediation:', error);
      return { success: false, error };
    }
  }

  /**
   * Get remediation queue for user
   */
  async getRemediationQueue(
    userId: string,
    tenantId: string,
    status: string = 'pending'
  ): Promise<{ data: any[]; error: any }> {
    try {
      const client = await supabase();

      const { data, error } = await client
        .from('remediation_queue')
        .select('*')
        .eq('user_id', userId)
        .eq('tenant_id', tenantId)
        .eq('status', status)
        .order('priority', { ascending: true })
        .order('due_date', { ascending: true });

      if (error) {
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error getting remediation queue:', error);
      return { data: [], error };
    }
  }

  /**
   * Update sync metadata
   */
  async updateSyncMetadata(
    userId: string,
    deviceId: string,
    metadata: Partial<SyncMetadata>
  ): Promise<{ success: boolean; error: any }> {
    try {
      const client = await supabase();

      const syncData = {
        user_id: userId,
        device_id: deviceId,
        last_sync: new Date().toISOString(),
        sync_version: metadata.sync_version || 1,
        conflicts: metadata.conflicts || [],
        platform: (typeof window !== 'undefined' ? window.navigator.platform : 'unknown')
      };

      const { error } = await client
        .from('journey_sync_metadata')
        .upsert(syncData, {
          onConflict: 'user_id,device_id'
        });

      if (error) {
        console.error('Error updating sync metadata:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating sync:', error);
      return { success: false, error };
    }
  }

  /**
   * Calculate streak days using database function
   */
  async calculateStreakDays(
    userId: string,
    tenantId: string,
    gradeLevel: string
  ): Promise<{ streak: number; error: any }> {
    try {
      const client = await supabase();

      const { data, error } = await client.rpc('calculate_streak_days', {
        p_user_id: userId,
        p_tenant_id: tenantId,
        p_grade_level: gradeLevel
      });

      if (error) {
        console.error('Error calculating streak:', error);
        return { streak: 0, error };
      }

      return { streak: data || 0, error: null };
    } catch (error) {
      console.error('Error calculating streak:', error);
      return { streak: 0, error };
    }
  }
}

// Export singleton instance
export const journeyDatabaseService = JourneyDatabaseService.getInstance();