/**
 * Unified Learning Analytics Service
 * Tracks and analyzes learning events across all containers
 */

export interface LearningEvent {
  eventType: string;
  timestamp: Date;
  studentId: string;
  sessionId: string;
  container?: string;
  skill?: string;
  subject?: string;
  grade?: string;
  career?: string;
  companion?: string;
  data?: any;
  metadata?: Record<string, any>;
}

export interface AnalyticsMetrics {
  totalEvents: number;
  sessionDuration: number;
  skillsAttempted: number;
  skillsMastered: number;
  accuracy: number;
  engagementScore: number;
}

class UnifiedLearningAnalyticsService {
  private events: LearningEvent[] = [];
  private sessionStartTime: Date = new Date();
  
  /**
   * Track a learning event
   */
  async trackLearningEvent(event: Partial<LearningEvent>): Promise<void> {
    const fullEvent: LearningEvent = {
      eventType: event.eventType || 'unknown',
      timestamp: new Date(),
      studentId: event.studentId || '',
      sessionId: event.sessionId || '',
      ...event
    };
    
    this.events.push(fullEvent);
    
    // Log in debug mode
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', fullEvent.eventType, fullEvent);
    }
  }
  
  /**
   * Track a question answered event
   */
  async trackQuestionAnswered(data: {
    studentId: string;
    sessionId: string;
    questionId: string;
    subject: string;
    skill: string;
    correct: boolean;
    timeSpent?: number;
    hintsUsed?: number;
  }): Promise<void> {
    await this.trackLearningEvent({
      eventType: 'question_answered',
      studentId: data.studentId,
      sessionId: data.sessionId,
      subject: data.subject,
      skill: data.skill,
      data: {
        questionId: data.questionId,
        correct: data.correct,
        timeSpent: data.timeSpent,
        hintsUsed: data.hintsUsed
      }
    });
  }
  
  /**
   * Track skill progression
   */
  async trackSkillProgression(data: {
    studentId: string;
    sessionId: string;
    skill: string;
    previousLevel: number;
    newLevel: number;
    mastered: boolean;
  }): Promise<void> {
    await this.trackLearningEvent({
      eventType: 'skill_progression',
      studentId: data.studentId,
      sessionId: data.sessionId,
      skill: data.skill,
      data: {
        previousLevel: data.previousLevel,
        newLevel: data.newLevel,
        mastered: data.mastered
      }
    });
  }
  
  /**
   * Track engagement metrics
   */
  async trackEngagement(data: {
    studentId: string;
    sessionId: string;
    container: string;
    engagementType: string;
    duration?: number;
    interactions?: number;
  }): Promise<void> {
    await this.trackLearningEvent({
      eventType: 'engagement',
      studentId: data.studentId,
      sessionId: data.sessionId,
      container: data.container,
      data: {
        engagementType: data.engagementType,
        duration: data.duration,
        interactions: data.interactions
      }
    });
  }
  
  /**
   * Get analytics metrics for current session
   */
  getSessionMetrics(sessionId: string): AnalyticsMetrics {
    const sessionEvents = this.events.filter(e => e.sessionId === sessionId);
    const questionEvents = sessionEvents.filter(e => e.eventType === 'question_answered');
    const correctAnswers = questionEvents.filter(e => e.data?.correct === true);
    
    return {
      totalEvents: sessionEvents.length,
      sessionDuration: Date.now() - this.sessionStartTime.getTime(),
      skillsAttempted: new Set(sessionEvents.map(e => e.skill).filter(Boolean)).size,
      skillsMastered: sessionEvents.filter(e => e.data?.mastered === true).length,
      accuracy: questionEvents.length > 0 ? correctAnswers.length / questionEvents.length : 0,
      engagementScore: this.calculateEngagementScore(sessionEvents)
    };
  }
  
  /**
   * Calculate engagement score
   */
  private calculateEngagementScore(events: LearningEvent[]): number {
    const engagementEvents = events.filter(e => e.eventType === 'engagement');
    if (engagementEvents.length === 0) return 0;
    
    const totalDuration = engagementEvents.reduce((sum, e) => sum + (e.data?.duration || 0), 0);
    const totalInteractions = engagementEvents.reduce((sum, e) => sum + (e.data?.interactions || 0), 0);
    
    // Simple engagement score calculation
    const durationScore = Math.min(totalDuration / 600000, 1); // 10 minutes = full score
    const interactionScore = Math.min(totalInteractions / 100, 1); // 100 interactions = full score
    
    return (durationScore + interactionScore) / 2;
  }
  
  /**
   * Clear session data
   */
  clearSession(): void {
    this.events = [];
    this.sessionStartTime = new Date();
  }
}

// Export singleton instance
export const unifiedLearningAnalyticsService = new UnifiedLearningAnalyticsService();