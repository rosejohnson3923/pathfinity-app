/**
 * Journey Summary Service
 *
 * Manages journey summaries for lesson plan generation and summary screen display.
 * Aggregates data from all three containers (LEARN, EXPERIENCE, DISCOVER).
 *
 * Key Features:
 * - Create/update journey summaries
 * - Track container progress
 * - Calculate overall metrics
 * - Mark lesson plan generation
 * - Query for summary screen
 *
 * Integration Flow:
 * Container Completion → JourneySummaryService → journey_summaries table → Summary Screen / Lesson Plan
 */

import { supabase, getCurrentUserId, getCurrentTenantId } from '../../lib/supabase';
import { getDemoUserType } from '../../utils/demoUserDetection';
import type { ContainerType, Subject } from '../../types/MasterNarrativeTypes';

// ================================================================
// TYPE DEFINITIONS
// ================================================================

export interface ContainerProgress {
  subjects: SubjectProgress[];
  averageScore: number;
  totalXP: number;
  totalTime: number; // seconds
}

export interface SubjectProgress {
  subject: Subject;
  skillName: string;
  skillId: string;
  score: number;
  questionsAttempted: number;
  questionsCorrect: number;
  timeSpent: number; // seconds
  xpEarned: number;
  completed: boolean;
}

export interface JourneySummary {
  id?: string;

  // Session identification
  userId: string;
  tenantId: string;
  sessionId: string;

  // Student context
  studentName: string;
  gradeLevel: string;

  // Career & companion
  careerId: string;
  careerName: string;
  careerIcon?: string;
  companionId: string;
  companionName: string;

  // Overall metrics
  totalXpEarned: number;
  totalTimeSpent: number; // seconds
  overallScore: number;
  skillsMastered: number;
  skillsAttempted: number;

  // Container progress (JSONB)
  learnProgress: ContainerProgress;
  experienceProgress: ContainerProgress;
  discoverProgress: ContainerProgress;

  // Session timeline
  startTime: string;
  endTime?: string;

  // Completion status
  completed: boolean;
  completedContainers: number;

  // Lesson plan
  lessonPlanGenerated: boolean;
  lessonPlanGeneratedAt?: string;
  lessonPlanUrl?: string;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface DetailedJourneySummary extends JourneySummary {
  learnSubjects: SubjectProgress[];
  experienceSubjects: SubjectProgress[];
  discoverSubjects: SubjectProgress[];
}

// ================================================================
// SERVICE CLASS
// ================================================================

class JourneySummaryService {
  private static instance: JourneySummaryService;

  // Cache for active summaries
  private summaryCache: Map<string, JourneySummary> = new Map();

  private constructor() {}

  static getInstance(): JourneySummaryService {
    if (!JourneySummaryService.instance) {
      JourneySummaryService.instance = new JourneySummaryService();
    }
    return JourneySummaryService.instance;
  }

  // ================================================================
  // SUMMARY MANAGEMENT
  // ================================================================

  /**
   * Create or update journey summary (uses database function)
   */
  async upsertJourneySummary(params: {
    sessionId: string;
    studentName: string;
    gradeLevel: string;
    careerId: string;
    careerName: string;
    companionId: string;
    companionName: string;
    userId?: string;
    tenantId?: string;
  }): Promise<{ summaryId: string | null; error?: string }> {
    try {
      const userId = params.userId || await getCurrentUserId();
      const tenantId = params.tenantId || await getCurrentTenantId();

      const demoType = getDemoUserType({ id: userId });
      if (demoType === 'demo-viewer') {
        return { summaryId: null, error: 'Read-only demo mode' };
      }

      const client = await supabase();

      // Call database function
      const { data, error } = await client.rpc('upsert_journey_summary', {
        p_user_id: userId,
        p_tenant_id: tenantId,
        p_session_id: params.sessionId,
        p_student_name: params.studentName,
        p_grade_level: params.gradeLevel,
        p_career_id: params.careerId,
        p_career_name: params.careerName,
        p_companion_id: params.companionId,
        p_companion_name: params.companionName
      });

      if (error) {
        console.error('Error upserting journey summary:', error);
        return { summaryId: null, error: error.message };
      }

      console.log('✅ Journey summary created/updated:', params.sessionId);

      return { summaryId: data };

    } catch (error) {
      console.error('Error upserting summary:', error);
      return {
        summaryId: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update container progress (uses database function)
   */
  async updateContainerProgress(
    sessionId: string,
    container: ContainerType,
    progress: ContainerProgress
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await supabase();

      // Call database function
      const { data, error } = await client.rpc('update_container_progress', {
        p_session_id: sessionId,
        p_container: container,
        p_progress: progress as any // JSONB
      });

      if (error) {
        console.error('Error updating container progress:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: 'Journey summary not found' };
      }

      console.log(`✅ ${container} progress updated for session:`, sessionId);

      // Invalidate cache
      this.summaryCache.delete(sessionId);

      return { success: true };

    } catch (error) {
      console.error('Error updating progress:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get journey summary for a session
   */
  async getJourneySummary(
    sessionId: string
  ): Promise<{ summary: JourneySummary | null; error?: string }> {
    try {
      // Check cache
      const cached = this.summaryCache.get(sessionId);
      if (cached) {
        console.log('📦 Journey summary loaded from cache');
        return { summary: cached };
      }

      const client = await supabase();

      const { data, error } = await client
        .from('journey_summaries')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching journey summary:', error);
        return { summary: null, error: error.message };
      }

      if (!data) {
        return { summary: null };
      }

      const summary = this.fromDatabaseSummary(data);
      this.summaryCache.set(sessionId, summary);

      return { summary };

    } catch (error) {
      console.error('Error getting journey summary:', error);
      return {
        summary: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get detailed journey summary (uses database function)
   */
  async getDetailedJourneySummary(
    sessionId: string
  ): Promise<{ summary: DetailedJourneySummary | null; error?: string }> {
    try {
      const client = await supabase();

      const { data, error } = await client.rpc('get_journey_summary_detailed', {
        p_session_id: sessionId
      });

      if (error) {
        console.error('Error fetching detailed summary:', error);
        return { summary: null, error: error.message };
      }

      if (!data || data.length === 0) {
        return { summary: null };
      }

      const record = data[0];
      const summary: DetailedJourneySummary = {
        userId: '', // Not returned by function
        tenantId: '', // Not returned by function
        sessionId: record.session_id,
        studentName: record.student_name,
        gradeLevel: record.grade_level,
        careerId: '', // Not returned
        careerName: record.career_name,
        companionId: '', // Not returned
        companionName: record.companion_name,
        totalXpEarned: record.total_xp_earned,
        totalTimeSpent: record.total_time_spent,
        overallScore: record.overall_score,
        skillsMastered: 0, // Calculate from subjects
        skillsAttempted: 0, // Calculate from subjects
        learnProgress: { subjects: [], averageScore: 0, totalXP: 0, totalTime: 0 },
        experienceProgress: { subjects: [], averageScore: 0, totalXP: 0, totalTime: 0 },
        discoverProgress: { subjects: [], averageScore: 0, totalXP: 0, totalTime: 0 },
        learnSubjects: record.learn_subjects || [],
        experienceSubjects: record.experience_subjects || [],
        discoverSubjects: record.discover_subjects || [],
        startTime: record.start_time,
        endTime: record.end_time,
        completed: record.completed,
        completedContainers: 0, // Calculate from subjects
        lessonPlanGenerated: false,
        lessonPlanUrl: undefined
      };

      return { summary };

    } catch (error) {
      console.error('Error getting detailed summary:', error);
      return {
        summary: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user's journey history
   */
  async getUserJourneyHistory(
    userId: string,
    limit: number = 10
  ): Promise<{ summaries: JourneySummary[]; error?: string }> {
    try {
      const client = await supabase();

      const { data, error } = await client
        .from('journey_summaries')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching journey history:', error);
        return { summaries: [], error: error.message };
      }

      const summaries = (data || []).map(this.fromDatabaseSummary);

      return { summaries };

    } catch (error) {
      console.error('Error getting journey history:', error);
      return {
        summaries: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ================================================================
  // LESSON PLAN MANAGEMENT
  // ================================================================

  /**
   * Mark lesson plan as generated (uses database function)
   */
  async markLessonPlanGenerated(
    sessionId: string,
    lessonPlanUrl: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await supabase();

      const { data, error } = await client.rpc('mark_lesson_plan_generated', {
        p_session_id: sessionId,
        p_lesson_plan_url: lessonPlanUrl
      });

      if (error) {
        console.error('Error marking lesson plan:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: 'Journey summary not found' };
      }

      console.log('📄 Lesson plan marked as generated:', lessonPlanUrl);

      // Invalidate cache
      this.summaryCache.delete(sessionId);

      return { success: true };

    } catch (error) {
      console.error('Error marking lesson plan:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get journeys pending lesson plan generation
   */
  async getPendingLessonPlans(
    tenantId: string,
    limit: number = 50
  ): Promise<{ summaries: JourneySummary[]; error?: string }> {
    try {
      const client = await supabase();

      const { data, error } = await client
        .from('journey_summaries')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('completed', true)
        .eq('lesson_plan_generated', false)
        .order('end_time', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Error fetching pending lesson plans:', error);
        return { summaries: [], error: error.message };
      }

      const summaries = (data || []).map(this.fromDatabaseSummary);

      return { summaries };

    } catch (error) {
      console.error('Error getting pending lesson plans:', error);
      return {
        summaries: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ================================================================
  // ANALYTICS QUERIES
  // ================================================================

  /**
   * Get journey completion analytics
   */
  async getCompletionAnalytics(
    tenantId: string,
    gradeLevel?: string,
    careerId?: string
  ): Promise<{ analytics: any | null; error?: string }> {
    try {
      const client = await supabase();

      let query = client
        .from('journey_completion_analytics')
        .select('*')
        .eq('tenant_id', tenantId);

      if (gradeLevel) {
        query = query.eq('grade_level', gradeLevel);
      }

      if (careerId) {
        query = query.eq('career_id', careerId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching completion analytics:', error);
        return { analytics: null, error: error.message };
      }

      return { analytics: data };

    } catch (error) {
      console.error('Error getting completion analytics:', error);
      return {
        analytics: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get lesson plan generation analytics
   */
  async getLessonPlanAnalytics(
    tenantId: string,
    gradeLevel?: string
  ): Promise<{ analytics: any | null; error?: string }> {
    try {
      const client = await supabase();

      let query = client
        .from('lesson_plan_analytics')
        .select('*')
        .eq('tenant_id', tenantId);

      if (gradeLevel) {
        query = query.eq('grade_level', gradeLevel);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching lesson plan analytics:', error);
        return { analytics: null, error: error.message };
      }

      return { analytics: data };

    } catch (error) {
      console.error('Error getting lesson plan analytics:', error);
      return {
        analytics: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ================================================================
  // HELPER METHODS
  // ================================================================

  /**
   * Build container progress from container sessions
   */
  async buildContainerProgress(
    sessionId: string,
    container: ContainerType
  ): Promise<ContainerProgress> {
    try {
      const client = await supabase();

      const { data, error } = await client
        .from('container_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('container', container)
        .eq('completed', true);

      if (error) {
        console.error('Error fetching container sessions:', error);
        return {
          subjects: [],
          averageScore: 0,
          totalXP: 0,
          totalTime: 0
        };
      }

      const subjects: SubjectProgress[] = (data || []).map(session => ({
        subject: session.subject as Subject,
        skillName: session.skill_name,
        skillId: session.skill_id,
        score: session.score,
        questionsAttempted: session.questions_attempted,
        questionsCorrect: session.questions_correct,
        timeSpent: session.time_spent,
        xpEarned: session.xp_earned,
        completed: session.completed
      }));

      const totalXP = subjects.reduce((sum, s) => sum + s.xpEarned, 0);
      const totalTime = subjects.reduce((sum, s) => sum + s.timeSpent, 0);
      const averageScore = subjects.length > 0
        ? subjects.reduce((sum, s) => sum + s.score, 0) / subjects.length
        : 0;

      return {
        subjects,
        averageScore: Math.round(averageScore * 100) / 100,
        totalXP,
        totalTime
      };

    } catch (error) {
      console.error('Error building container progress:', error);
      return {
        subjects: [],
        averageScore: 0,
        totalXP: 0,
        totalTime: 0
      };
    }
  }

  // ================================================================
  // DATA CONVERSION
  // ================================================================

  private fromDatabaseSummary(data: any): JourneySummary {
    return {
      id: data.id,
      userId: data.user_id,
      tenantId: data.tenant_id,
      sessionId: data.session_id,
      studentName: data.student_name,
      gradeLevel: data.grade_level,
      careerId: data.career_id,
      careerName: data.career_name,
      careerIcon: data.career_icon,
      companionId: data.companion_id,
      companionName: data.companion_name,
      totalXpEarned: data.total_xp_earned,
      totalTimeSpent: data.total_time_spent,
      overallScore: data.overall_score,
      skillsMastered: data.skills_mastered,
      skillsAttempted: data.skills_attempted,
      learnProgress: data.learn_progress || { subjects: [], averageScore: 0, totalXP: 0, totalTime: 0 },
      experienceProgress: data.experience_progress || { subjects: [], averageScore: 0, totalXP: 0, totalTime: 0 },
      discoverProgress: data.discover_progress || { subjects: [], averageScore: 0, totalXP: 0, totalTime: 0 },
      startTime: data.start_time,
      endTime: data.end_time,
      completed: data.completed,
      completedContainers: data.completed_containers,
      lessonPlanGenerated: data.lesson_plan_generated,
      lessonPlanGeneratedAt: data.lesson_plan_generated_at,
      lessonPlanUrl: data.lesson_plan_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

// Export singleton instance
export const journeySummaryService = JourneySummaryService.getInstance();
export type {
  JourneySummary,
  DetailedJourneySummary,
  ContainerProgress,
  SubjectProgress
};
