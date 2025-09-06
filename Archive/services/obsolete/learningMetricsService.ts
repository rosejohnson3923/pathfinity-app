/**
 * Learning Metrics Service - Phase 1
 * Tracks and analyzes student learning interactions for adaptive learning
 */

export interface LearningMetric {
  sessionId: string;
  studentId: string;
  questionId: string;
  skillArea: string;
  responseTimeMs: number;
  isCorrect: boolean;
  hintsUsed: number;
  attemptsCount: number;
  timestamp: string;
  career?: string;
  companion?: string;
}

export interface SessionMetrics {
  sessionId: string;
  studentId: string;
  startTime: string;
  endTime?: string;
  totalQuestions: number;
  correctAnswers: number;
  averageResponseTime: number;
  hintsUsed: number;
  streak: number;
  maxStreak: number;
  skillAreas: string[];
}

export interface StudentProgress {
  totalSessions: number;
  totalQuestions: number;
  overallAccuracy: number;
  averageResponseTime: number;
  strongAreas: string[];
  needsImprovement: string[];
  currentStreak: number;
  bestStreak: number;
  lastSessionDate: string;
  learningVelocity: number; // Questions per minute
}

class LearningMetricsService {
  private static instance: LearningMetricsService;
  private currentSession: SessionMetrics | null = null;
  private currentStreak: number = 0;
  private readonly STORAGE_KEY = 'pathfinity_learning_metrics';
  private readonly SESSION_KEY = 'pathfinity_current_session';
  private readonly QUICK_RESPONSE_THRESHOLD = 5000; // 5 seconds
  private readonly SLOW_RESPONSE_THRESHOLD = 30000; // 30 seconds

  private constructor() {
    this.loadCurrentSession();
  }

  static getInstance(): LearningMetricsService {
    if (!LearningMetricsService.instance) {
      LearningMetricsService.instance = new LearningMetricsService();
    }
    return LearningMetricsService.instance;
  }

  /**
   * Start a new learning session
   */
  startSession(studentId: string, career?: string, companion?: string): string {
    // Prevent duplicate session starts for the same student
    if (this.currentSession && this.currentSession.studentId === studentId) {
      console.log('📊 Session already active for student, returning existing session:', this.currentSession.sessionId);
      return this.currentSession.sessionId;
    }

    const sessionId = this.generateSessionId();
    
    this.currentSession = {
      sessionId,
      studentId,
      startTime: new Date().toISOString(),
      totalQuestions: 0,
      correctAnswers: 0,
      averageResponseTime: 0,
      hintsUsed: 0,
      streak: 0,
      maxStreak: 0,
      skillAreas: []
    };

    this.currentStreak = 0;
    this.saveCurrentSession();
    
    console.log('📊 Learning session started:', sessionId, { career, companion });
    return sessionId;
  }

  /**
   * Track a learning interaction
   */
  trackInteraction(metric: Omit<LearningMetric, 'sessionId' | 'timestamp'>): void {
    if (!this.currentSession) {
      console.warn('No active session. Starting new session.');
      this.startSession(metric.studentId);
    }

    const fullMetric: LearningMetric = {
      ...metric,
      sessionId: this.currentSession!.sessionId,
      timestamp: new Date().toISOString()
    };

    // Update session metrics
    this.updateSessionMetrics(fullMetric);
    
    // Save to storage
    this.saveMetric(fullMetric);
    
    // Check for adaptive triggers
    this.checkAdaptiveTriggers(fullMetric);
    
    console.log('📈 Metric tracked:', {
      question: metric.questionId,
      correct: metric.isCorrect,
      time: metric.responseTimeMs,
      streak: this.currentStreak
    });
  }

  /**
   * Update session metrics based on new interaction
   */
  private updateSessionMetrics(metric: LearningMetric): void {
    if (!this.currentSession) return;

    this.currentSession.totalQuestions++;
    
    if (metric.isCorrect) {
      this.currentSession.correctAnswers++;
      this.currentStreak++;
      this.currentSession.streak = this.currentStreak;
      
      if (this.currentStreak > this.currentSession.maxStreak) {
        this.currentSession.maxStreak = this.currentStreak;
      }
    } else {
      this.currentStreak = 0;
      this.currentSession.streak = 0;
    }

    // Update average response time
    const currentAvg = this.currentSession.averageResponseTime;
    const newAvg = (currentAvg * (this.currentSession.totalQuestions - 1) + metric.responseTimeMs) 
                   / this.currentSession.totalQuestions;
    this.currentSession.averageResponseTime = Math.round(newAvg);

    // Track skill areas
    if (!this.currentSession.skillAreas.includes(metric.skillArea)) {
      this.currentSession.skillAreas.push(metric.skillArea);
    }

    this.currentSession.hintsUsed += metric.hintsUsed;
    
    this.saveCurrentSession();
  }

  /**
   * Check for adaptive learning triggers
   */
  private checkAdaptiveTriggers(metric: LearningMetric): void {
    // Struggling detection
    if (!metric.isCorrect && metric.attemptsCount >= 3) {
      this.triggerAdaptation('struggling', {
        skill: metric.skillArea,
        attempts: metric.attemptsCount,
        message: 'Student may need additional support'
      });
    }

    // Success streak celebration
    if (this.currentStreak === 3) {
      this.triggerAdaptation('streak_3', {
        message: 'Great job! 3 in a row! 🎉'
      });
    } else if (this.currentStreak === 5) {
      this.triggerAdaptation('streak_5', {
        message: 'Amazing! 5 correct answers! 🌟'
      });
    } else if (this.currentStreak === 10) {
      this.triggerAdaptation('streak_10', {
        message: 'Incredible! 10 in a row! You\'re on fire! 🔥'
      });
    }

    // Pace detection
    if (metric.responseTimeMs < this.QUICK_RESPONSE_THRESHOLD) {
      this.triggerAdaptation('fast_pace', {
        message: 'Quick response - might be ready for harder content'
      });
    } else if (metric.responseTimeMs > this.SLOW_RESPONSE_THRESHOLD) {
      this.triggerAdaptation('slow_pace', {
        message: 'Taking time - might need clearer instructions'
      });
    }

    // Hint usage pattern
    if (metric.hintsUsed > 2) {
      this.triggerAdaptation('high_hint_usage', {
        skill: metric.skillArea,
        message: 'Multiple hints needed - consider simpler explanation'
      });
    }
  }

  /**
   * Trigger an adaptation based on metrics
   */
  private triggerAdaptation(type: string, data: any): void {
    // Dispatch custom event that UI components can listen to
    const event = new CustomEvent('learning-adaptation', {
      detail: { 
        type, 
        data: {
          ...data,
          sessionId: this.currentSession?.sessionId,
          studentId: this.currentSession?.studentId
        }, 
        timestamp: new Date().toISOString() 
      }
    });
    window.dispatchEvent(event);
    
    console.log('🎯 Adaptation triggered:', type, data);
  }

  /**
   * Get current session metrics
   */
  getCurrentSession(): SessionMetrics | null {
    return this.currentSession;
  }

  /**
   * End the current session
   */
  endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date().toISOString();
      this.saveCurrentSession();
      
      // Archive session
      this.archiveSession(this.currentSession);
      
      console.log('📊 Session ended:', this.currentSession);
      this.currentSession = null;
      localStorage.removeItem(this.SESSION_KEY);
    }
  }

  /**
   * Get student progress summary
   */
  getStudentProgress(studentId: string): StudentProgress {
    const metrics = this.getAllMetrics().filter(m => m.studentId === studentId);
    const sessions = this.getArchivedSessions().filter(s => s.studentId === studentId);
    
    if (metrics.length === 0) {
      return this.getEmptyProgress(studentId);
    }

    const totalQuestions = metrics.length;
    const correctAnswers = metrics.filter(m => m.isCorrect).length;
    const overallAccuracy = (correctAnswers / totalQuestions) * 100;
    
    // Calculate average response time
    const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTimeMs, 0) / totalQuestions;
    
    // Identify strong and weak areas
    const skillPerformance = this.analyzeSkillPerformance(metrics);
    const strongAreas = skillPerformance.filter(s => s.accuracy >= 80).map(s => s.skill);
    const needsImprovement = skillPerformance.filter(s => s.accuracy < 60).map(s => s.skill);
    
    // Get best streak from sessions
    const bestStreak = Math.max(...sessions.map(s => s.maxStreak), 0);
    const currentStreak = this.currentSession?.streak || 0;
    
    // Calculate learning velocity (questions per minute)
    const totalTime = sessions.reduce((sum, s) => {
      const start = new Date(s.startTime).getTime();
      const end = s.endTime ? new Date(s.endTime).getTime() : Date.now();
      return sum + (end - start);
    }, 0);
    const learningVelocity = totalTime > 0 ? (totalQuestions / (totalTime / 60000)) : 0;
    
    return {
      totalSessions: sessions.length,
      totalQuestions,
      overallAccuracy: Math.round(overallAccuracy),
      averageResponseTime: Math.round(avgResponseTime),
      strongAreas,
      needsImprovement,
      currentStreak,
      bestStreak,
      lastSessionDate: sessions[sessions.length - 1]?.startTime || '',
      learningVelocity: Math.round(learningVelocity * 10) / 10
    };
  }

  /**
   * Analyze performance by skill area
   */
  private analyzeSkillPerformance(metrics: LearningMetric[]): Array<{skill: string, accuracy: number}> {
    const skillGroups = new Map<string, {correct: number, total: number}>();
    
    metrics.forEach(m => {
      const current = skillGroups.get(m.skillArea) || {correct: 0, total: 0};
      current.total++;
      if (m.isCorrect) current.correct++;
      skillGroups.set(m.skillArea, current);
    });
    
    return Array.from(skillGroups.entries()).map(([skill, data]) => ({
      skill,
      accuracy: (data.correct / data.total) * 100
    }));
  }

  /**
   * Get recommendations based on metrics
   */
  getRecommendations(studentId: string): string[] {
    const progress = this.getStudentProgress(studentId);
    const recommendations: string[] = [];
    
    if (progress.overallAccuracy < 60) {
      recommendations.push('Consider reviewing fundamental concepts');
    }
    
    if (progress.averageResponseTime > 20000) {
      recommendations.push('Break down problems into smaller steps');
    }
    
    if (progress.needsImprovement.length > 0) {
      recommendations.push(`Focus on: ${progress.needsImprovement.join(', ')}`);
    }
    
    if (progress.currentStreak >= 5) {
      recommendations.push('Ready for more challenging content!');
    }
    
    if (progress.learningVelocity < 2) {
      recommendations.push('Try shorter, more focused sessions');
    }
    
    return recommendations;
  }

  // Storage methods
  private saveMetric(metric: LearningMetric): void {
    const metrics = this.getAllMetrics();
    metrics.push(metric);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(metrics));
  }

  private getAllMetrics(): LearningMetric[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private saveCurrentSession(): void {
    if (this.currentSession) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(this.currentSession));
    }
  }

  private loadCurrentSession(): void {
    const stored = localStorage.getItem(this.SESSION_KEY);
    if (stored) {
      this.currentSession = JSON.parse(stored);
    }
  }

  private archiveSession(session: SessionMetrics): void {
    const key = 'pathfinity_archived_sessions';
    const sessions = this.getArchivedSessions();
    sessions.push(session);
    localStorage.setItem(key, JSON.stringify(sessions));
  }

  private getArchivedSessions(): SessionMetrics[] {
    const stored = localStorage.getItem('pathfinity_archived_sessions');
    return stored ? JSON.parse(stored) : [];
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getEmptyProgress(studentId: string): StudentProgress {
    return {
      totalSessions: 0,
      totalQuestions: 0,
      overallAccuracy: 0,
      averageResponseTime: 0,
      strongAreas: [],
      needsImprovement: [],
      currentStreak: 0,
      bestStreak: 0,
      lastSessionDate: '',
      learningVelocity: 0
    };
  }

  /**
   * Clear all metrics (for testing/reset)
   */
  clearAllMetrics(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem('pathfinity_archived_sessions');
    this.currentSession = null;
    this.currentStreak = 0;
    console.log('🗑️ All metrics cleared');
  }
}

export const learningMetricsService = LearningMetricsService.getInstance();