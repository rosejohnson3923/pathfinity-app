/**
 * SessionLearningContextManager
 *
 * Manages session-based learning context with database persistence
 * Replaces DailyLearningContextManager with proper session timeout (8 hours)
 * Ensures career and skill consistency across all subjects and containers
 *
 * Key Features:
 * - Database-driven sessions (not localStorage)
 * - 8-hour timeout for flexible scheduling
 * - Career/companion persistence per session
 * - Master Narrative caching for Learn container
 * - PathIQ analytics tracking
 */

import { Skill, Career, Subject, StudentProfile, Grade } from '../../types';

/**
 * Session-based learning context (replaces DailyLearningContext)
 * Stored in database, not localStorage
 */
export interface SessionLearningContext {
  readonly sessionId: string;
  readonly userId: string;
  readonly studentProfile: StudentProfile;
  readonly primarySkill: Skill;
  readonly career: Career;
  readonly companion: {
    id: string;
    name: string;
    personality: string;
    voice?: string;
  };
  readonly currentContainer: 'learn' | 'experience' | 'discover';
  readonly currentSubject: Subject;
  readonly subjects: Subject[];
  readonly grade: Grade;
  readonly startedAt: Date;
  readonly lastActivity: Date;
  readonly isDemo: boolean;
  readonly masterNarrativeCache?: string;
  readonly containerProgress: {
    [container: string]: {
      [subject: string]: {
        completed: boolean;
        score: number;
        time_spent: number;
        completed_at?: string;
      };
    };
  };
}

/**
 * Container-specific context derived from session context
 */
export interface ContainerContext {
  sessionContext: SessionLearningContext;
  containerId: string;
  containerType: 'learn' | 'experience' | 'discover';
  subject: Subject;
  skillAdaptation: string;
  careerScenario: string;
  timeAllocation: number; // minutes
}

/**
 * Subject-adapted skill with career context
 */
export interface SubjectAdaptedSkill {
  originalSkill: Skill;
  subject: Subject;
  adaptedDescription: string;
  learningObjectives: string[];
  careerConnection: string;
  practiceContext: string;
  assessmentFocus: string;
}

/**
 * API response types
 */
interface SessionResponse {
  session: any;
  error?: string;
}

interface ProgressUpdateRequest {
  container: string;
  subject: string;
  completed: boolean;
  score: number;
  timeSpent: number;
}

/**
 * Singleton manager for session-based learning context
 */
export class SessionLearningContextManager {
  private static instance: SessionLearningContextManager;
  private currentContext: SessionLearningContext | null = null;
  private readonly API_BASE = import.meta.env.VITE_API_URL ?
    `${import.meta.env.VITE_API_URL}/sessions` :
    'http://localhost:3002/api/sessions';
  private readonly SESSION_TIMEOUT_HOURS = 8;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SessionLearningContextManager {
    if (!SessionLearningContextManager.instance) {
      SessionLearningContextManager.instance = new SessionLearningContextManager();
    }
    return SessionLearningContextManager.instance;
  }

  /**
   * Load existing session or return null if none exists
   */
  public async loadSession(userId: string): Promise<SessionLearningContext | null> {
    try {
      console.log('[SessionManager] Loading session for user:', userId);

      const response = await fetch(`${this.API_BASE}/active/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data: SessionResponse = await response.json();

      if (!data.session) {
        console.log('[SessionManager] No active session found');
        return null;
      }

      console.log('[SessionManager] Active session loaded:', data.session.id);

      // Map database session to context
      this.currentContext = this.mapSessionToContext(data.session);
      return this.currentContext;

    } catch (error) {
      console.error('[SessionManager] Failed to load session:', error);
      return null;
    }
  }

  /**
   * Create a new session with career/companion selection
   */
  public async createSession(
    student: StudentProfile,
    career: Career,
    companion: any,
    skill?: Skill
  ): Promise<SessionLearningContext> {
    try {
      console.log('[SessionManager] Creating new session');
      console.log('  Career:', career.name || career.title);
      console.log('  Companion:', companion.name);

      const sessionData = {
        userId: student.id,
        tenantId: student.tenant_id,
        careerId: career.id,
        careerName: career.name || career.title,
        companionId: companion.id,
        companionName: companion.name,
        isDemo: student.is_demo || false,
        sessionSource: this.detectSessionSource()
      };

      const response = await fetch(`${this.API_BASE}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });

      const data: SessionResponse = await response.json();

      if (!data.session) {
        throw new Error(data.error || 'Failed to create session');
      }

      console.log('[SessionManager] Session created:', data.session.id);

      // Create full context with student profile
      this.currentContext = this.mapSessionToContext(data.session, student, skill);
      return this.currentContext;

    } catch (error) {
      console.error('[SessionManager] Failed to create session:', error);
      throw error;
    }
  }

  /**
   * Restart session with new career/companion (loses all progress)
   */
  public async restartSession(
    sessionId: string,
    newCareer: Career,
    newCompanion: any
  ): Promise<SessionLearningContext> {
    try {
      console.log('[SessionManager] Restarting session:', sessionId);

      const restartData = {
        newCareerId: newCareer.id,
        newCareerName: newCareer.name || newCareer.title,
        newCompanionId: newCompanion.id,
        newCompanionName: newCompanion.name
      };

      const response = await fetch(`${this.API_BASE}/${sessionId}/restart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(restartData)
      });

      const data: SessionResponse = await response.json();

      if (!data.session) {
        throw new Error(data.error || 'Failed to restart session');
      }

      console.log('[SessionManager] Session restarted:', data.session.id);

      // Update context
      this.currentContext = this.mapSessionToContext(data.session);
      return this.currentContext;

    } catch (error) {
      console.error('[SessionManager] Failed to restart session:', error);
      throw error;
    }
  }

  /**
   * Update progress for current subject
   */
  public async updateProgress(
    subject: Subject,
    completed: boolean,
    score: number,
    timeSpent: number
  ): Promise<void> {
    if (!this.currentContext) {
      throw new Error('No active session to update');
    }

    try {
      console.log('[SessionManager] Updating progress');
      console.log('  Subject:', subject);
      console.log('  Completed:', completed);
      console.log('  Score:', score);

      const progressData: ProgressUpdateRequest = {
        container: this.currentContext.currentContainer,
        subject: subject.toLowerCase(),
        completed,
        score,
        timeSpent
      };

      const response = await fetch(`${this.API_BASE}/${this.currentContext.sessionId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressData)
      });

      const data = await response.json();

      if (!data.session) {
        throw new Error(data.error || 'Failed to update progress');
      }

      // Update local context with new progress
      this.currentContext = this.mapSessionToContext(data.session);

      console.log('[SessionManager] Progress updated successfully');

    } catch (error) {
      console.error('[SessionManager] Failed to update progress:', error);
      throw error;
    }
  }

  /**
   * Cache Master Narrative for Learn container
   */
  public async cacheMasterNarrative(narrative: any): Promise<void> {
    if (!this.currentContext) {
      throw new Error('No active session to cache narrative');
    }

    try {
      console.log('[SessionManager] Caching Master Narrative');

      const cacheData = {
        narrative: JSON.stringify(narrative),
        cacheKey: this.generateNarrativeCacheKey()
      };

      const response = await fetch(`${this.API_BASE}/${this.currentContext.sessionId}/cache-narrative`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cacheData)
      });

      if (!response.ok) {
        throw new Error('Failed to cache narrative');
      }

      // Update local context
      this.currentContext = {
        ...this.currentContext,
        masterNarrativeCache: JSON.stringify(narrative)
      };

      console.log('[SessionManager] Master Narrative cached successfully');

    } catch (error) {
      console.error('[SessionManager] Failed to cache narrative:', error);
    }
  }

  /**
   * Get cached Master Narrative if available
   */
  public getCachedNarrative(): any | null {
    if (!this.currentContext?.masterNarrativeCache) {
      return null;
    }

    try {
      return JSON.parse(this.currentContext.masterNarrativeCache);
    } catch {
      return null;
    }
  }

  /**
   * Get current session context
   */
  public getCurrentContext(): SessionLearningContext | null {
    return this.currentContext;
  }

  /**
   * Check if user is continuing same career/companion
   */
  public isContinuingJourney(
    newCareer: Career,
    newCompanion: any
  ): boolean {
    if (!this.currentContext) return false;

    return (
      this.currentContext.career.id === newCareer.id &&
      this.currentContext.companion.id === newCompanion.id
    );
  }

  /**
   * Get progress statistics for current session
   */
  public getProgressStats(): {
    percentage: number;
    completedSubjects: number;
    currentStreak: number;
    containerProgress: { [key: string]: number };
  } {
    if (!this.currentContext) {
      return {
        percentage: 0,
        completedSubjects: 0,
        currentStreak: 0,
        containerProgress: {}
      };
    }

    let totalSubjects = 0;
    let completedSubjects = 0;
    const containerProgress: { [key: string]: number } = {};

    ['learn', 'experience', 'discover'].forEach(container => {
      let containerCompleted = 0;
      const subjects = ['math', 'ela', 'science', 'social_studies'];

      subjects.forEach(subject => {
        totalSubjects++;
        if (this.currentContext?.containerProgress[container]?.[subject]?.completed) {
          completedSubjects++;
          containerCompleted++;
        }
      });

      containerProgress[container] = Math.round((containerCompleted / 4) * 100);
    });

    return {
      percentage: Math.round((completedSubjects / 12) * 100),
      completedSubjects,
      currentStreak: this.calculateStreak(),
      containerProgress
    };
  }

  /**
   * Check if current container is Learn and has progress
   */
  public isInLearnWithProgress(): boolean {
    if (!this.currentContext) return false;

    if (this.currentContext.currentContainer !== 'learn') return false;

    // Check if any Learn subjects are completed
    const learnProgress = this.currentContext.containerProgress.learn;
    return Object.values(learnProgress).some(subj => subj.completed);
  }

  /**
   * Validate that content maintains context consistency
   */
  public validateContextConsistency(content: any): boolean {
    if (!this.currentContext) {
      console.warn('[SessionManager] No context to validate against');
      return false;
    }

    const validations = {
      hasCareerReference: this.validateCareerReference(content),
      hasSkillFocus: this.validateSkillFocus(content),
      hasCompanionVoice: this.validateCompanionVoice(content),
      isGradeAppropriate: this.validateGradeAppropriateness(content)
    };

    const isConsistent = Object.values(validations).every(v => v);

    if (!isConsistent) {
      console.warn('[SessionManager] Consistency validation failed:', validations);
    }

    return isConsistent;
  }

  /**
   * Adapt skill to specific subject while maintaining career context
   */
  public adaptSkillToSubject(subject: Subject): SubjectAdaptedSkill {
    if (!this.currentContext) {
      throw new Error('No session context available for skill adaptation');
    }

    const { primarySkill, career } = this.currentContext;

    // Generate subject-specific adaptation
    const adaptation = this.generateSkillAdaptation(primarySkill, subject, career);

    console.log('[SessionManager] Skill adapted for', subject, ':', adaptation.adaptedDescription);

    return adaptation;
  }

  /**
   * Clear session (logout)
   */
  public clearSession(): void {
    console.log('[SessionManager] Clearing session');
    this.currentContext = null;
  }

  // ================================================================
  // Private Helper Methods
  // ================================================================

  /**
   * Map database session to context object
   */
  private mapSessionToContext(
    session: any,
    studentProfile?: StudentProfile,
    skill?: Skill
  ): SessionLearningContext {
    // Use provided student profile or create minimal one from session
    const student = studentProfile || {
      id: session.user_id,
      name: 'Student',
      grade: '5', // Default grade
      enrolledSubjects: ['Math', 'ELA', 'Science', 'Social Studies']
    } as StudentProfile;

    // Use provided skill or create default
    const primarySkill = skill || {
      id: 'default-skill',
      name: 'Learning',
      skill_name: 'General Learning',
      description: 'General learning skills',
      grade_level: student.grade
    } as Skill;

    return {
      sessionId: session.id,
      userId: session.user_id,
      studentProfile: student,
      primarySkill,
      career: {
        id: session.career_id,
        name: session.career_name,
        title: session.career_name,
        description: `${session.career_name} professional`
      } as Career,
      companion: {
        id: session.companion_id,
        name: session.companion_name,
        personality: 'encouraging',
        voice: session.companion_voice
      },
      currentContainer: session.current_container,
      currentSubject: session.current_subject as Subject,
      subjects: ['Math', 'ELA', 'Science', 'Social Studies'] as Subject[],
      grade: student.grade as Grade,
      startedAt: new Date(session.started_at),
      lastActivity: new Date(session.last_activity),
      isDemo: session.is_demo,
      masterNarrativeCache: session.master_narrative_cache,
      containerProgress: session.container_progress
    };
  }

  /**
   * Detect the source of the session (web, mobile, tablet)
   */
  private detectSessionSource(): string {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/mobile|android|iphone/i.test(userAgent)) {
      return 'mobile';
    } else if (/ipad|tablet/i.test(userAgent)) {
      return 'tablet';
    } else {
      return 'web';
    }
  }

  /**
   * Generate cache key for Master Narrative
   */
  private generateNarrativeCacheKey(): string {
    if (!this.currentContext) return '';

    return [
      this.currentContext.userId,
      this.currentContext.career.id,
      this.currentContext.companion.id,
      this.currentContext.primarySkill.id,
      'learn' // Only Learn container has Master Narrative
    ].join('_');
  }

  /**
   * Calculate current learning streak
   */
  private calculateStreak(): number {
    // This would need to fetch from the API or be provided by the session
    // For now, return a placeholder
    return 0;
  }

  /**
   * Validate career reference in content
   */
  private validateCareerReference(content: any): boolean {
    if (!content || !this.currentContext) return false;

    const careerName = this.currentContext.career.name.toLowerCase();
    const contentStr = JSON.stringify(content).toLowerCase();

    return contentStr.includes(careerName);
  }

  /**
   * Validate skill focus in content
   */
  private validateSkillFocus(content: any): boolean {
    if (!content || !this.currentContext) return false;

    const skillName = this.currentContext.primarySkill.name.toLowerCase();
    const contentStr = JSON.stringify(content).toLowerCase();

    return contentStr.includes(skillName);
  }

  /**
   * Validate companion voice consistency
   */
  private validateCompanionVoice(content: any): boolean {
    // Check if companion personality traits are reflected
    return true; // Simplified for now
  }

  /**
   * Validate grade appropriateness
   */
  private validateGradeAppropriateness(content: any): boolean {
    // Check if content matches grade level
    return true; // Simplified for now
  }

  /**
   * Generate skill adaptation for subject
   */
  private generateSkillAdaptation(
    skill: Skill,
    subject: Subject,
    career: Career
  ): SubjectAdaptedSkill {
    // This would ideally call an AI service for proper adaptation
    // For now, create a template-based adaptation

    const adaptations: { [key: string]: any } = {
      'Math': {
        adaptedDescription: `Apply ${skill.name} through mathematical problem-solving`,
        learningObjectives: [
          `Use ${skill.name} to solve math problems`,
          `Connect math concepts to ${career.name} applications`,
          `Practice numerical reasoning skills`
        ],
        careerConnection: `${career.name}s use math for calculations and analysis`,
        practiceContext: 'Mathematical scenarios and word problems',
        assessmentFocus: 'Problem-solving accuracy and methodology'
      },
      'ELA': {
        adaptedDescription: `Develop ${skill.name} through reading and writing`,
        learningObjectives: [
          `Apply ${skill.name} to comprehension tasks`,
          `Express ideas related to ${career.name} field`,
          `Build vocabulary and communication skills`
        ],
        careerConnection: `${career.name}s need strong communication skills`,
        practiceContext: 'Reading passages and writing exercises',
        assessmentFocus: 'Comprehension and expression quality'
      },
      'Science': {
        adaptedDescription: `Explore ${skill.name} through scientific inquiry`,
        learningObjectives: [
          `Use ${skill.name} in experiments and observations`,
          `Understand scientific concepts in ${career.name} context`,
          `Develop critical thinking through science`
        ],
        careerConnection: `${career.name}s apply scientific principles daily`,
        practiceContext: 'Experiments and scientific scenarios',
        assessmentFocus: 'Scientific reasoning and accuracy'
      },
      'Social Studies': {
        adaptedDescription: `Understand ${skill.name} in social contexts`,
        learningObjectives: [
          `Apply ${skill.name} to historical and social topics`,
          `Explore how ${career.name}s impact society`,
          `Develop cultural awareness and understanding`
        ],
        careerConnection: `${career.name}s contribute to community and society`,
        practiceContext: 'Historical events and social scenarios',
        assessmentFocus: 'Critical thinking and analysis'
      }
    };

    const subjectAdaptation = adaptations[subject] || adaptations['Math'];

    return {
      originalSkill: skill,
      subject,
      ...subjectAdaptation
    };
  }
}

// Export singleton instance
export const sessionManager = SessionLearningContextManager.getInstance();

// Also export the function name used by existing code
export function getSessionLearningContext(): SessionLearningContextManager {
  return SessionLearningContextManager.getInstance();
}