/**
 * SessionStateManager
 * 
 * Manages user session state, tracking progression through containers,
 * performance metrics, and ensuring smooth learning journey flow.
 */

import { Subject, Grade, Skill, Career } from '../../types';

/**
 * Container information for tracking
 */
export interface ContainerInfo {
  id: string;
  type: 'learn' | 'experience' | 'discover';
  subject: Subject;
  startTime: Date;
  endTime?: Date;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  timeSpent: number; // in seconds
  hintsUsed: number;
  xpEarned: number;
  completionRate: number; // 0-100%
}

/**
 * Performance metrics for session
 */
export interface PerformanceMetrics {
  overallAccuracy: number; // 0-100%
  averageTimePerQuestion: number; // seconds
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalHintsUsed: number;
  totalXpEarned: number;
  streakCount: number;
  bestStreak: number;
  skillProgress: Map<string, number>; // skill ID -> mastery %
}

/**
 * User session state
 */
export interface SessionState {
  userId: string;
  sessionId: string;
  dailyContextId: string; // Links to DailyLearningContext
  currentContainer: ContainerInfo | null;
  completedContainers: ContainerInfo[];
  activeContainers: ContainerInfo[]; // Started but not completed
  performance: PerformanceMetrics;
  startTime: Date;
  lastActivity: Date;
  expectedPath: string[]; // Expected container progression
  actualPath: string[]; // Actual containers visited
  adaptationLevel: 'easy' | 'medium' | 'hard';
  isActive: boolean;
}

/**
 * Performance history for analysis
 */
export interface PerformanceHistory {
  userId: string;
  sessions: SessionSummary[];
  lifetimeStats: LifetimeStatistics;
  recentTrends: PerformanceTrend[];
}

/**
 * Session summary for history
 */
export interface SessionSummary {
  sessionId: string;
  date: Date;
  duration: number; // minutes
  containersCompleted: number;
  accuracy: number;
  xpEarned: number;
  skillsProgressed: { skill: string; progress: number }[];
}

/**
 * Lifetime statistics
 */
export interface LifetimeStatistics {
  totalSessions: number;
  totalTimeSpent: number; // minutes
  totalQuestionsAnswered: number;
  overallAccuracy: number;
  totalXpEarned: number;
  masteredSkills: string[];
  preferredSubjects: Subject[];
}

/**
 * Performance trend analysis
 */
export interface PerformanceTrend {
  period: 'daily' | 'weekly' | 'monthly';
  trend: 'improving' | 'stable' | 'declining';
  metric: string;
  change: number; // percentage change
}

/**
 * Container progression validation result
 */
export interface ProgressionValidation {
  canProgress: boolean;
  reason?: string;
  suggestedContainer?: string;
  requiredCompletions?: string[];
}

/**
 * Service for managing learning session state
 */
export class SessionStateManager {
  private static instance: SessionStateManager;
  private currentStates: Map<string, SessionState> = new Map();
  private stateHistory: Map<string, PerformanceHistory> = new Map();
  private readonly STORAGE_KEY = 'pathfinity_session_state';
  private readonly STATE_EXPIRY_HOURS = 4; // Session expires after 4 hours
  private readonly CACHE_SIZE = 100; // Max cached sessions

  private constructor() {
    this.restoreStates();
    this.setupAutoSave();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SessionStateManager {
    if (!SessionStateManager.instance) {
      SessionStateManager.instance = new SessionStateManager();
    }
    return SessionStateManager.instance;
  }

  /**
   * Initialize new session for user
   */
  public initializeSession(
    userId: string,
    dailyContextId: string
  ): SessionState {
    const sessionId = this.generateSessionId(userId);
    
    const state: SessionState = {
      userId,
      sessionId,
      dailyContextId,
      currentContainer: null,
      completedContainers: [],
      activeContainers: [],
      performance: this.createEmptyPerformance(),
      startTime: new Date(),
      lastActivity: new Date(),
      expectedPath: this.generateExpectedPath(userId),
      actualPath: [],
      adaptationLevel: 'medium',
      isActive: true
    };

    this.currentStates.set(userId, state);
    this.persistState(userId);

    console.log('[SessionState] Initialized session:', sessionId);
    return state;
  }

  /**
   * Track container progression
   */
  public trackContainerProgression(
    userId: string,
    containerId: string,
    containerType: 'learn' | 'experience' | 'discover',
    subject: Subject
  ): void {
    const state = this.getOrCreateState(userId);
    
    // End current container if exists
    if (state.currentContainer && state.currentContainer.id !== containerId) {
      this.completeContainer(userId, state.currentContainer.id);
    }

    // Check if container already exists in active
    let container = state.activeContainers.find(c => c.id === containerId);
    
    if (!container) {
      // Create new container tracking
      container = {
        id: containerId,
        type: containerType,
        subject,
        startTime: new Date(),
        questionsAnswered: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        timeSpent: 0,
        hintsUsed: 0,
        xpEarned: 0,
        completionRate: 0
      };
      state.activeContainers.push(container);
    }

    // Set as current
    state.currentContainer = container;
    state.actualPath.push(containerId);
    state.lastActivity = new Date();

    this.updateAdaptationLevel(state);
    this.persistState(userId);

    console.log('[SessionState] Progressed to container:', containerId);
  }

  /**
   * Get performance history for user
   */
  public getPerformanceHistory(userId: string): PerformanceHistory {
    // Check cache first
    if (this.stateHistory.has(userId)) {
      return this.stateHistory.get(userId)!;
    }

    // Build history from current and past sessions
    const history = this.buildPerformanceHistory(userId);
    this.stateHistory.set(userId, history);
    
    return history;
  }

  /**
   * Validate if user can progress to target container
   */
  public validateProgression(
    userId: string,
    targetContainer: string
  ): ProgressionValidation {
    const state = this.getCurrentState(userId);
    
    if (!state) {
      return {
        canProgress: false,
        reason: 'No active session found'
      };
    }

    // Check if current container is complete
    if (state.currentContainer && state.currentContainer.completionRate < 80) {
      return {
        canProgress: false,
        reason: 'Current container not sufficiently complete',
        requiredCompletions: [state.currentContainer.id]
      };
    }

    // Check performance threshold
    if (state.performance.overallAccuracy < 60 && state.completedContainers.length > 0) {
      return {
        canProgress: false,
        reason: 'Performance below threshold',
        suggestedContainer: this.getSuggestedReviewContainer(state)
      };
    }

    // Check if following expected path
    const expectedNext = this.getExpectedNextContainer(state);
    if (targetContainer !== expectedNext) {
      console.warn('[SessionState] Deviating from expected path:', {
        expected: expectedNext,
        actual: targetContainer
      });
    }

    return {
      canProgress: true
    };
  }

  /**
   * Get current session state
   */
  public getCurrentState(userId: string): SessionState | null {
    const state = this.currentStates.get(userId);
    
    if (state && this.isStateExpired(state)) {
      console.log('[SessionState] State expired, archiving');
      this.archiveState(userId);
      return null;
    }

    return state || null;
  }

  /**
   * Update question performance
   */
  public updateQuestionPerformance(
    userId: string,
    questionId: string,
    correct: boolean,
    timeSpent: number,
    hintsUsed: number = 0,
    xpEarned: number = 0
  ): void {
    const state = this.getOrCreateState(userId);
    
    if (!state.currentContainer) {
      console.warn('[SessionState] No current container to update');
      return;
    }

    // Update container stats
    const container = state.currentContainer;
    container.questionsAnswered++;
    if (correct) {
      container.correctAnswers++;
      state.performance.totalCorrect++;
      state.performance.streakCount++;
      if (state.performance.streakCount > state.performance.bestStreak) {
        state.performance.bestStreak = state.performance.streakCount;
      }
    } else {
      container.incorrectAnswers++;
      state.performance.totalIncorrect++;
      state.performance.streakCount = 0;
    }
    
    container.timeSpent += timeSpent;
    container.hintsUsed += hintsUsed;
    container.xpEarned += xpEarned;
    
    // Update overall performance
    state.performance.totalQuestionsAnswered++;
    state.performance.totalHintsUsed += hintsUsed;
    state.performance.totalXpEarned += xpEarned;
    
    // Recalculate metrics
    this.recalculatePerformanceMetrics(state);
    
    // Update last activity
    state.lastActivity = new Date();
    
    this.persistState(userId);
  }

  /**
   * Complete current container
   */
  public completeContainer(userId: string, containerId: string): void {
    const state = this.getCurrentState(userId);
    if (!state) return;

    const container = state.activeContainers.find(c => c.id === containerId);
    if (!container) return;

    // Mark as complete
    container.endTime = new Date();
    
    // Ensure startTime is a Date object (safety check for restored states)
    if (!(container.startTime instanceof Date)) {
      container.startTime = new Date(container.startTime);
    }
    
    container.timeSpent = Math.round(
      (container.endTime.getTime() - container.startTime.getTime()) / 1000
    );
    
    // Calculate completion rate
    if (container.questionsAnswered > 0) {
      container.completionRate = 100; // Marked as complete
    }

    // Move from active to completed
    state.activeContainers = state.activeContainers.filter(c => c.id !== containerId);
    state.completedContainers.push(container);

    // Clear current if it matches
    if (state.currentContainer?.id === containerId) {
      state.currentContainer = null;
    }

    this.persistState(userId);
    
    console.log('[SessionState] Container completed:', containerId, {
      accuracy: container.questionsAnswered > 0 
        ? (container.correctAnswers / container.questionsAnswered * 100).toFixed(1) 
        : 0,
      timeSpent: container.timeSpent,
      xpEarned: container.xpEarned
    });
  }

  /**
   * Get container statistics
   */
  public getContainerStats(userId: string, containerId: string): ContainerInfo | null {
    const state = this.getCurrentState(userId);
    if (!state) return null;

    // Check current
    if (state.currentContainer?.id === containerId) {
      return state.currentContainer;
    }

    // Check active
    const active = state.activeContainers.find(c => c.id === containerId);
    if (active) return active;

    // Check completed
    const completed = state.completedContainers.find(c => c.id === containerId);
    return completed || null;
  }

  /**
   * Check if a container has been completed
   */
  public isContainerCompleted(userId: string, containerId: string): boolean {
    const state = this.getCurrentState(userId);
    if (!state) return false;

    // Check if container exists in completed list
    return state.completedContainers.some(c => c.id === containerId);
  }

  /**
   * Update skill progress
   */
  public updateSkillProgress(
    userId: string,
    skillId: string,
    progressDelta: number
  ): void {
    const state = this.getOrCreateState(userId);
    
    const currentProgress = state.performance.skillProgress.get(skillId) || 0;
    const newProgress = Math.min(100, Math.max(0, currentProgress + progressDelta));
    
    state.performance.skillProgress.set(skillId, newProgress);
    
    this.persistState(userId);
  }

  /**
   * Get adaptation recommendations
   */
  public getAdaptationLevel(userId: string): 'easy' | 'medium' | 'hard' {
    const state = this.getCurrentState(userId);
    return state?.adaptationLevel || 'medium';
  }

  /**
   * Clear session for user
   */
  public clearSession(userId: string): void {
    const state = this.getCurrentState(userId);
    if (state) {
      this.archiveState(userId);
    }
    this.currentStates.delete(userId);
    this.persistStates();
  }

  /**
   * Get active session count
   */
  public getActiveSessionCount(): number {
    let activeCount = 0;
    this.currentStates.forEach(state => {
      if (state.isActive && !this.isStateExpired(state)) {
        activeCount++;
      }
    });
    return activeCount;
  }

  /**
   * Get session summary
   */
  public getSessionSummary(userId: string): SessionSummary | null {
    const state = this.getCurrentState(userId);
    if (!state) return null;

    const duration = Math.round(
      (new Date().getTime() - state.startTime.getTime()) / 60000
    ); // minutes

    const skillsProgressed: { skill: string; progress: number }[] = [];
    state.performance.skillProgress.forEach((progress, skill) => {
      if (progress > 0) {
        skillsProgressed.push({ skill, progress });
      }
    });

    return {
      sessionId: state.sessionId,
      date: state.startTime,
      duration,
      containersCompleted: state.completedContainers.length,
      accuracy: state.performance.overallAccuracy,
      xpEarned: state.performance.totalXpEarned,
      skillsProgressed
    };
  }

  /**
   * Create empty performance metrics
   */
  private createEmptyPerformance(): PerformanceMetrics {
    return {
      overallAccuracy: 0,
      averageTimePerQuestion: 0,
      totalQuestionsAnswered: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      totalHintsUsed: 0,
      totalXpEarned: 0,
      streakCount: 0,
      bestStreak: 0,
      skillProgress: new Map()
    };
  }

  /**
   * Generate session ID
   */
  private generateSessionId(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `session-${userId}-${timestamp}-${random}`;
  }

  /**
   * Generate expected learning path
   */
  private generateExpectedPath(userId: string): string[] {
    // Standard progression path
    return [
      'learn-math',
      'experience-math',
      'discover-math',
      'learn-ela',
      'experience-ela',
      'discover-ela',
      'learn-science',
      'experience-science',
      'discover-science',
      'learn-social',
      'experience-social',
      'discover-social'
    ];
  }

  /**
   * Get or create state for user
   */
  private getOrCreateState(userId: string): SessionState {
    let state = this.getCurrentState(userId);
    
    if (!state) {
      // Create new session with placeholder context
      state = this.initializeSession(userId, `context-${userId}-${Date.now()}`);
    }

    return state;
  }

  /**
   * Recalculate performance metrics
   */
  private recalculatePerformanceMetrics(state: SessionState): void {
    const perf = state.performance;
    
    // Overall accuracy
    if (perf.totalQuestionsAnswered > 0) {
      perf.overallAccuracy = (perf.totalCorrect / perf.totalQuestionsAnswered) * 100;
    }

    // Average time per question
    let totalTime = 0;
    let totalQuestions = 0;
    
    [...state.completedContainers, ...state.activeContainers].forEach(container => {
      totalTime += container.timeSpent;
      totalQuestions += container.questionsAnswered;
    });

    if (totalQuestions > 0) {
      perf.averageTimePerQuestion = totalTime / totalQuestions;
    }
  }

  /**
   * Update adaptation level based on performance
   */
  private updateAdaptationLevel(state: SessionState): void {
    const accuracy = state.performance.overallAccuracy;
    const avgTime = state.performance.averageTimePerQuestion;

    // Adjust difficulty based on performance
    if (accuracy > 85 && avgTime < 30) {
      state.adaptationLevel = 'hard';
    } else if (accuracy < 60 || avgTime > 90) {
      state.adaptationLevel = 'easy';
    } else {
      state.adaptationLevel = 'medium';
    }
  }

  /**
   * Get expected next container
   */
  private getExpectedNextContainer(state: SessionState): string {
    const lastVisited = state.actualPath[state.actualPath.length - 1];
    const expectedIndex = state.expectedPath.indexOf(lastVisited);
    
    if (expectedIndex >= 0 && expectedIndex < state.expectedPath.length - 1) {
      return state.expectedPath[expectedIndex + 1];
    }

    // Default to next unvisited in expected path
    for (const container of state.expectedPath) {
      if (!state.actualPath.includes(container)) {
        return container;
      }
    }

    return state.expectedPath[0]; // Start over
  }

  /**
   * Get suggested review container
   */
  private getSuggestedReviewContainer(state: SessionState): string {
    // Find container with lowest performance
    let worstContainer: ContainerInfo | null = null;
    let worstAccuracy = 100;

    state.completedContainers.forEach(container => {
      if (container.questionsAnswered > 0) {
        const accuracy = (container.correctAnswers / container.questionsAnswered) * 100;
        if (accuracy < worstAccuracy) {
          worstAccuracy = accuracy;
          worstContainer = container;
        }
      }
    });

    if (worstContainer) {
      // Suggest reviewing the same type in same subject
      return `${worstContainer.type}-${worstContainer.subject.toLowerCase()}-review`;
    }

    return 'learn-math'; // Default
  }

  /**
   * Check if state is expired
   */
  private isStateExpired(state: SessionState): boolean {
    const now = new Date();
    const hoursSinceActivity = (now.getTime() - state.lastActivity.getTime()) / (1000 * 60 * 60);
    return hoursSinceActivity > this.STATE_EXPIRY_HOURS;
  }

  /**
   * Build performance history
   */
  private buildPerformanceHistory(userId: string): PerformanceHistory {
    // Get archived sessions from storage
    const archived = this.getArchivedSessions(userId);
    
    // Build lifetime stats
    const lifetimeStats: LifetimeStatistics = {
      totalSessions: archived.length,
      totalTimeSpent: 0,
      totalQuestionsAnswered: 0,
      overallAccuracy: 0,
      totalXpEarned: 0,
      masteredSkills: [],
      preferredSubjects: []
    };

    let totalCorrect = 0;
    const subjectCounts = new Map<Subject, number>();

    archived.forEach(session => {
      lifetimeStats.totalTimeSpent += session.duration;
      lifetimeStats.totalXpEarned += session.xpEarned;
      // Accumulate other stats
    });

    if (lifetimeStats.totalQuestionsAnswered > 0) {
      lifetimeStats.overallAccuracy = (totalCorrect / lifetimeStats.totalQuestionsAnswered) * 100;
    }

    // Determine trends
    const recentTrends = this.calculateTrends(archived);

    return {
      userId,
      sessions: archived,
      lifetimeStats,
      recentTrends
    };
  }

  /**
   * Calculate performance trends
   */
  private calculateTrends(sessions: SessionSummary[]): PerformanceTrend[] {
    const trends: PerformanceTrend[] = [];

    if (sessions.length < 2) return trends;

    // Compare recent to previous
    const recent = sessions.slice(-5);
    const previous = sessions.slice(-10, -5);

    if (recent.length > 0 && previous.length > 0) {
      const recentAccuracy = recent.reduce((sum, s) => sum + s.accuracy, 0) / recent.length;
      const previousAccuracy = previous.reduce((sum, s) => sum + s.accuracy, 0) / previous.length;
      
      const change = recentAccuracy - previousAccuracy;
      
      trends.push({
        period: 'weekly',
        trend: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
        metric: 'accuracy',
        change
      });
    }

    return trends;
  }

  /**
   * Archive completed session
   */
  private archiveState(userId: string): void {
    const state = this.currentStates.get(userId);
    if (!state) return;

    const summary = this.getSessionSummary(userId);
    if (summary) {
      this.saveArchivedSession(userId, summary);
    }

    state.isActive = false;
  }

  /**
   * Get archived sessions from storage
   */
  private getArchivedSessions(userId: string): SessionSummary[] {
    try {
      const archived = localStorage.getItem(`${this.STORAGE_KEY}_archive_${userId}`);
      if (archived) {
        return JSON.parse(archived);
      }
    } catch (error) {
      console.error('[SessionState] Failed to get archived sessions:', error);
    }
    return [];
  }

  /**
   * Save archived session
   */
  private saveArchivedSession(userId: string, summary: SessionSummary): void {
    try {
      const archived = this.getArchivedSessions(userId);
      archived.push(summary);
      
      // Keep only last N sessions
      if (archived.length > this.CACHE_SIZE) {
        archived.shift();
      }

      localStorage.setItem(
        `${this.STORAGE_KEY}_archive_${userId}`,
        JSON.stringify(archived)
      );
    } catch (error) {
      console.error('[SessionState] Failed to save archived session:', error);
    }
  }

  /**
   * Persist single user state
   */
  private persistState(userId: string): void {
    const state = this.currentStates.get(userId);
    if (!state) return;

    try {
      // Convert Map to array for serialization
      const serializable = {
        ...state,
        performance: {
          ...state.performance,
          skillProgress: Array.from(state.performance.skillProgress.entries())
        }
      };

      sessionStorage.setItem(
        `${this.STORAGE_KEY}_${userId}`,
        JSON.stringify(serializable)
      );
    } catch (error) {
      console.error('[SessionState] Failed to persist state:', error);
    }
  }

  /**
   * Persist all states
   */
  private persistStates(): void {
    this.currentStates.forEach((state, userId) => {
      this.persistState(userId);
    });
  }

  /**
   * Restore states from storage
   */
  private restoreStates(): void {
    try {
      // Look for session states in storage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key?.startsWith(this.STORAGE_KEY)) {
          const userId = key.replace(`${this.STORAGE_KEY}_`, '');
          const serialized = sessionStorage.getItem(key);
          
          if (serialized) {
            const state = JSON.parse(serialized);
            
            // Restore Map from array
            if (state.performance?.skillProgress) {
              state.performance.skillProgress = new Map(state.performance.skillProgress);
            }

            // Restore dates
            state.startTime = new Date(state.startTime);
            state.lastActivity = new Date(state.lastActivity);
            
            // Restore container dates
            if (state.currentContainer) {
              state.currentContainer.startTime = new Date(state.currentContainer.startTime);
              if (state.currentContainer.endTime) {
                state.currentContainer.endTime = new Date(state.currentContainer.endTime);
              }
            }
            
            state.activeContainers?.forEach(container => {
              container.startTime = new Date(container.startTime);
              if (container.endTime) {
                container.endTime = new Date(container.endTime);
              }
            });
            
            state.completedContainers?.forEach(container => {
              container.startTime = new Date(container.startTime);
              if (container.endTime) {
                container.endTime = new Date(container.endTime);
              }
            });
            
            // Check if not expired
            if (!this.isStateExpired(state)) {
              this.currentStates.set(userId, state);
              console.log('[SessionState] Restored state for user:', userId);
            }
          }
        }
      }
    } catch (error) {
      console.error('[SessionState] Failed to restore states:', error);
    }
  }

  /**
   * Setup auto-save interval
   */
  private setupAutoSave(): void {
    setInterval(() => {
      this.persistStates();
    }, 30000); // Auto-save every 30 seconds
  }

  /**
   * Export session data for analytics
   */
  public exportSessionData(userId: string): any {
    const state = this.getCurrentState(userId);
    const history = this.getPerformanceHistory(userId);
    
    return {
      currentSession: state,
      history,
      exported: new Date().toISOString()
    };
  }
}

// Export singleton instance getter
export const getSessionStateManager = () => SessionStateManager.getInstance();