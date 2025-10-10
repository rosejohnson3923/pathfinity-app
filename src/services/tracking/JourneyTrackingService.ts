/**
 * Journey Tracking Service
 *
 * Real-time tracking of student performance during LEARN, EXPERIENCE, and DISCOVER containers.
 * Writes detailed session data to container_sessions table for:
 * - PathIQ gamification (XP awards)
 * - Journey summaries (lesson plans)
 * - Analytics and reporting
 *
 * Integration Flow:
 * Container → JourneyTrackingService → container_sessions table → PathIQ → Leaderboard
 */

import { supabase, getCurrentUserId, getCurrentTenantId } from '../../lib/supabase';
import { getDemoUserType } from '../../utils/demoUserDetection';
import type { ContainerType, Subject } from '../../types/MasterNarrativeTypes';

// ================================================================
// TYPE DEFINITIONS
// ================================================================

export interface QuestionAttempt {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  attemptNumber: number;
  timeSpent: number; // seconds
  hintsUsed: number;
  timestamp: string; // ISO string
  questionType?: 'practice' | 'assessment'; // Track question type for reporting
}

export interface ContainerSessionData {
  // Session identification
  userId: string;
  tenantId: string;
  sessionId: string;

  // Container & subject info
  container: ContainerType;
  subject: Subject;
  skillId: string;
  skillName: string;
  gradeLevel: string;

  // Performance metrics
  questionsAttempted: number;
  questionsCorrect: number;
  practiceQuestionsAttempted: number;
  practiceQuestionsCorrect: number;
  assessmentQuestionsAttempted: number;
  assessmentQuestionsCorrect: number;
  score: number; // percentage
  timeSpent: number; // seconds
  attempts: number;

  // XP & gamification
  xpEarned: number;
  hintsUsed: number;
  achievementsUnlocked: string[];

  // Detailed history
  questionHistory: QuestionAttempt[];

  // Status
  completed: boolean;
  completedAt?: string;
}

export interface SessionTracking {
  // Active session data
  sessionData: ContainerSessionData;

  // Timing
  startTime: Date;
  lastUpdateTime: Date;

  // State
  isActive: boolean;
  isSaved: boolean;
}

// ================================================================
// SERVICE CLASS
// ================================================================

class JourneyTrackingService {
  private static instance: JourneyTrackingService;

  // Active sessions by session ID + container
  private activeSessions: Map<string, SessionTracking> = new Map();

  // Auto-save interval (save every 30 seconds)
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private readonly AUTO_SAVE_INTERVAL_MS = 30000;

  private constructor() {
    this.startAutoSave();
  }

  static getInstance(): JourneyTrackingService {
    if (!JourneyTrackingService.instance) {
      JourneyTrackingService.instance = new JourneyTrackingService();
    }
    return JourneyTrackingService.instance;
  }

  // ================================================================
  // SESSION MANAGEMENT
  // ================================================================

  /**
   * Start tracking a new container session
   */
  async startSession(params: {
    sessionId: string;
    container: ContainerType;
    subject: Subject;
    skillId: string;
    skillName: string;
    gradeLevel: string;
    userId?: string;
    tenantId?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📊 Starting ${params.container} session tracking:`, params.skillId);

      // Get user context
      const userId = params.userId || await getCurrentUserId();
      const tenantId = params.tenantId || await getCurrentTenantId();

      // Check demo status
      const demoType = getDemoUserType({ id: userId });
      if (demoType === 'demo-viewer') {
        console.log('🚫 Demo viewer - session tracking blocked');
        return { success: false, error: 'Read-only demo mode' };
      }

      // Create session key (unique per session + container)
      const sessionKey = `${params.sessionId}_${params.container}`;

      // Initialize session data
      const sessionData: ContainerSessionData = {
        userId,
        tenantId,
        sessionId: params.sessionId,
        container: params.container,
        subject: params.subject,
        skillId: params.skillId,
        skillName: params.skillName,
        gradeLevel: params.gradeLevel,
        questionsAttempted: 0,
        questionsCorrect: 0,
        practiceQuestionsAttempted: 0,
        practiceQuestionsCorrect: 0,
        assessmentQuestionsAttempted: 0,
        assessmentQuestionsCorrect: 0,
        score: 0,
        timeSpent: 0,
        attempts: 1,
        xpEarned: 0,
        hintsUsed: 0,
        achievementsUnlocked: [],
        questionHistory: [],
        completed: false
      };

      // Store active session
      this.activeSessions.set(sessionKey, {
        sessionData,
        startTime: new Date(),
        lastUpdateTime: new Date(),
        isActive: true,
        isSaved: false
      });

      return { success: true };

    } catch (error) {
      console.error('Error starting session tracking:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Record a question attempt
   */
  async recordQuestionAttempt(
    sessionId: string,
    container: ContainerType,
    attempt: Omit<QuestionAttempt, 'timestamp'>
  ): Promise<{ success: boolean }> {
    try {
      const sessionKey = `${sessionId}_${container}`;
      const session = this.activeSessions.get(sessionKey);

      if (!session) {
        console.warn('⚠️ Session not found for question attempt:', sessionKey);
        return { success: false };
      }

      // Add timestamp
      const fullAttempt: QuestionAttempt = {
        ...attempt,
        timestamp: new Date().toISOString()
      };

      // Update session data
      session.sessionData.questionHistory.push(fullAttempt);
      session.sessionData.questionsAttempted++;
      if (fullAttempt.isCorrect) {
        session.sessionData.questionsCorrect++;
      }

      // Track practice vs assessment separately
      if (fullAttempt.questionType === 'practice') {
        session.sessionData.practiceQuestionsAttempted++;
        if (fullAttempt.isCorrect) {
          session.sessionData.practiceQuestionsCorrect++;
        }
      } else if (fullAttempt.questionType === 'assessment') {
        session.sessionData.assessmentQuestionsAttempted++;
        if (fullAttempt.isCorrect) {
          session.sessionData.assessmentQuestionsCorrect++;
        }
      }

      session.sessionData.hintsUsed += fullAttempt.hintsUsed;
      session.sessionData.timeSpent += fullAttempt.timeSpent;

      // Calculate score percentage
      if (session.sessionData.questionsAttempted > 0) {
        session.sessionData.score = Math.round(
          (session.sessionData.questionsCorrect / session.sessionData.questionsAttempted) * 100
        );
      }

      // Mark as needs save
      session.lastUpdateTime = new Date();
      session.isSaved = false;

      console.log(`📝 Question recorded: ${fullAttempt.isCorrect ? '✓' : '✗'} (Score: ${session.sessionData.score}%)`);

      return { success: true };

    } catch (error) {
      console.error('Error recording question attempt:', error);
      return { success: false };
    }
  }

  /**
   * Award XP for session performance
   */
  async awardSessionXP(
    sessionId: string,
    container: ContainerType,
    xpAmount: number
  ): Promise<{ success: boolean }> {
    try {
      const sessionKey = `${sessionId}_${container}`;
      const session = this.activeSessions.get(sessionKey);

      if (!session) {
        console.warn('⚠️ Session not found for XP award:', sessionKey);
        return { success: false };
      }

      session.sessionData.xpEarned += xpAmount;
      session.isSaved = false;

      console.log(`⭐ XP awarded: +${xpAmount} (Total: ${session.sessionData.xpEarned})`);

      return { success: true };

    } catch (error) {
      console.error('Error awarding XP:', error);
      return { success: false };
    }
  }

  /**
   * Record achievement unlock
   */
  async recordAchievement(
    sessionId: string,
    container: ContainerType,
    achievementId: string
  ): Promise<{ success: boolean }> {
    try {
      const sessionKey = `${sessionId}_${container}`;
      const session = this.activeSessions.get(sessionKey);

      if (!session) {
        console.warn('⚠️ Session not found for achievement:', sessionKey);
        return { success: false };
      }

      if (!session.sessionData.achievementsUnlocked.includes(achievementId)) {
        session.sessionData.achievementsUnlocked.push(achievementId);
        session.isSaved = false;
        console.log(`🏆 Achievement unlocked: ${achievementId}`);
      }

      return { success: true };

    } catch (error) {
      console.error('Error recording achievement:', error);
      return { success: false };
    }
  }

  /**
   * Complete a session and save final data
   */
  async completeSession(
    sessionId: string,
    container: ContainerType
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const sessionKey = `${sessionId}_${container}`;
      const session = this.activeSessions.get(sessionKey);

      if (!session) {
        return {
          success: false,
          error: 'Session not found'
        };
      }

      console.log(`✅ Completing ${container} session:`, sessionId);

      // Mark as completed
      session.sessionData.completed = true;
      session.sessionData.completedAt = new Date().toISOString();
      session.isActive = false;

      // Save to database
      const saveResult = await this.saveSessionToDatabase(session);

      if (saveResult.success) {
        // Return session data before removing from memory
        const sessionDataCopy = { ...session.sessionData };

        // Remove from active sessions
        this.activeSessions.delete(sessionKey);
        console.log(`💾 Session saved and closed: ${sessionKey}`);

        // Return session data so container can use it for XP awards, etc.
        return {
          ...saveResult,
          data: sessionDataCopy
        };
      }

      return saveResult;

    } catch (error) {
      console.error('Error completing session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ================================================================
  // DATABASE OPERATIONS
  // ================================================================

  /**
   * Save session data to container_sessions table
   */
  private async saveSessionToDatabase(
    session: SessionTracking
  ): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const { sessionData } = session;
      const demoType = getDemoUserType({ id: sessionData.userId });

      // Block saves for demo viewers
      if (demoType === 'demo-viewer') {
        console.log('🚫 Database save blocked for demo viewer');
        return {
          success: false,
          error: 'Read-only demo mode'
        };
      }

      const client = await supabase();

      // Prepare database record
      const dbRecord = {
        user_id: sessionData.userId,
        tenant_id: sessionData.tenantId,
        session_id: sessionData.sessionId,
        container: sessionData.container,
        subject: sessionData.subject,
        skill_id: sessionData.skillId,
        skill_name: sessionData.skillName,
        grade_level: sessionData.gradeLevel,
        questions_attempted: sessionData.questionsAttempted,
        questions_correct: sessionData.questionsCorrect,
        practice_questions_attempted: sessionData.practiceQuestionsAttempted,
        practice_questions_correct: sessionData.practiceQuestionsCorrect,
        assessment_questions_attempted: sessionData.assessmentQuestionsAttempted,
        assessment_questions_correct: sessionData.assessmentQuestionsCorrect,
        score: sessionData.score,
        time_spent: sessionData.timeSpent,
        attempts: sessionData.attempts,
        xp_earned: sessionData.xpEarned,
        hints_used: sessionData.hintsUsed,
        achievements_unlocked: sessionData.achievementsUnlocked,
        question_history: sessionData.questionHistory,
        completed: sessionData.completed,
        completed_at: sessionData.completedAt || null
      };

      // Debug: Log what we're trying to save
      console.log('🔍 Attempting to save with user_id:', sessionData.userId);
      console.log('🔍 Container:', sessionData.container, '| Session:', sessionData.sessionId);

      // Check if record exists (for updates)
      const { data: existing } = await client
        .from('container_sessions')
        .select('id')
        .eq('session_id', sessionData.sessionId)
        .eq('container', sessionData.container)
        .eq('skill_id', sessionData.skillId)
        .single();

      let result;
      if (existing) {
        // Update existing record
        result = await client
          .from('container_sessions')
          .update(dbRecord)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        // Insert new record
        result = await client
          .from('container_sessions')
          .insert(dbRecord)
          .select()
          .single();
      }

      if (result.error) {
        console.error('❌ Database save error:', result.error);
        return {
          success: false,
          error: result.error.message
        };
      }

      // Mark as saved
      session.isSaved = true;
      console.log(`💾 Session saved to database: ${sessionData.container} - ${sessionData.skillName}`);

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('❌ Error saving to database:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Auto-save all active sessions periodically
   */
  private async autoSaveActiveSessions(): Promise<void> {
    const unsavedSessions = Array.from(this.activeSessions.entries())
      .filter(([_, session]) => !session.isSaved && session.isActive);

    if (unsavedSessions.length === 0) {
      return;
    }

    console.log(`🔄 Auto-saving ${unsavedSessions.length} active session(s)...`);

    for (const [key, session] of unsavedSessions) {
      try {
        await this.saveSessionToDatabase(session);
      } catch (error) {
        console.error(`❌ Auto-save failed for ${key}:`, error);
      }
    }
  }

  /**
   * Start auto-save interval
   */
  private startAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(() => {
      this.autoSaveActiveSessions();
    }, this.AUTO_SAVE_INTERVAL_MS);

    console.log(`⏰ Auto-save enabled (every ${this.AUTO_SAVE_INTERVAL_MS / 1000}s)`);
  }

  /**
   * Stop auto-save interval (cleanup)
   */
  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('⏰ Auto-save disabled');
    }
  }

  // ================================================================
  // QUERY METHODS
  // ================================================================

  /**
   * Get session data for analytics
   */
  getActiveSession(
    sessionId: string,
    container: ContainerType
  ): ContainerSessionData | null {
    const sessionKey = `${sessionId}_${container}`;
    const session = this.activeSessions.get(sessionKey);
    return session ? session.sessionData : null;
  }

  /**
   * Get all active sessions (for debugging)
   */
  getAllActiveSessions(): Map<string, SessionTracking> {
    return this.activeSessions;
  }

  /**
   * Get user's container performance from database
   */
  async getUserContainerPerformance(
    userId: string,
    container?: ContainerType,
    subject?: Subject
  ): Promise<{ data: any[]; error?: string }> {
    try {
      const client = await supabase();

      let query = client
        .from('container_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('created_at', { ascending: false });

      if (container) {
        query = query.eq('container', container);
      }

      if (subject) {
        query = query.eq('subject', subject);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching performance:', error);
        return { data: [], error: error.message };
      }

      return { data: data || [] };

    } catch (error) {
      console.error('Error querying performance:', error);
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get session total XP (using database function)
   */
  async getSessionTotalXP(
    userId: string,
    sessionId: string
  ): Promise<{ xp: number; error?: string }> {
    try {
      const client = await supabase();

      const { data, error } = await client.rpc('get_session_total_xp', {
        p_user_id: userId,
        p_session_id: sessionId
      });

      if (error) {
        console.error('Error getting session XP:', error);
        return { xp: 0, error: error.message };
      }

      return { xp: data || 0 };

    } catch (error) {
      console.error('Error querying session XP:', error);
      return {
        xp: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get container subject breakdown (using database function)
   */
  async getContainerSubjectBreakdown(
    userId: string,
    sessionId: string,
    container: ContainerType
  ): Promise<{ data: any[]; error?: string }> {
    try {
      const client = await supabase();

      const { data, error } = await client.rpc('get_container_subject_breakdown', {
        p_user_id: userId,
        p_session_id: sessionId,
        p_container: container
      });

      if (error) {
        console.error('Error getting subject breakdown:', error);
        return { data: [], error: error.message };
      }

      return { data: data || [] };

    } catch (error) {
      console.error('Error querying breakdown:', error);
      return {
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ================================================================
  // CLEANUP
  // ================================================================

  /**
   * Force save all active sessions (call on app close/unmount)
   */
  async saveAllSessions(): Promise<void> {
    console.log('💾 Saving all active sessions...');
    const sessions = Array.from(this.activeSessions.values());

    for (const session of sessions) {
      if (!session.isSaved) {
        await this.saveSessionToDatabase(session);
      }
    }

    console.log('✅ All sessions saved');
  }

  /**
   * Cleanup - stop auto-save and save all sessions
   */
  async cleanup(): Promise<void> {
    this.stopAutoSave();
    await this.saveAllSessions();
  }
}

// Export singleton instance
export const journeyTrackingService = JourneyTrackingService.getInstance();
export type { ContainerSessionData, SessionTracking, QuestionAttempt };
