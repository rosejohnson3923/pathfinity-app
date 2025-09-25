/**
 * PathIQ Analytics Service
 *
 * Frontend analytics integration for tracking learning patterns,
 * career progression, and generating insights about student behavior.
 *
 * Features:
 * - Career selection pattern tracking
 * - Progress event monitoring
 * - Achievement tracking
 * - Session analytics
 * - Learning insights generation
 */

import { supabase } from '../../config/supabase';

export interface AnalyticsEvent {
  eventType: string;
  eventData: Record<string, any>;
  timestamp?: Date;
  sessionId?: string;
  userId?: string;
}

export interface CareerSelectionPattern {
  careerId: string;
  careerName: string;
  frequency: number;
  averageCompletionRate: number;
  averageTimeSpent: number;
  lastSelected?: Date;
}

export interface LearningInsight {
  type: 'strength' | 'challenge' | 'recommendation' | 'achievement';
  subject: string;
  message: string;
  data?: Record<string, any>;
  confidence: number;
}

export interface SessionStats {
  totalSessions: number;
  averageSessionDuration: number;
  completionRate: number;
  streakDays: number;
  totalLearningTime: number;
  subjectsCompleted: number;
  achievementsEarned: number;
}

class PathIQAnalyticsService {
  private batchedEvents: AnalyticsEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_DELAY = 5000; // 5 seconds

  /**
   * Track a generic analytics event
   */
  async trackEvent(
    eventType: string,
    eventData: Record<string, any>,
    sessionId?: string
  ): Promise<void> {
    const event: AnalyticsEvent = {
      eventType,
      eventData,
      timestamp: new Date(),
      sessionId,
      userId: eventData.userId
    };

    // Add to batch
    this.batchedEvents.push(event);

    // Process batch if size exceeded
    if (this.batchedEvents.length >= this.BATCH_SIZE) {
      await this.processBatch();
    } else {
      // Schedule batch processing
      this.scheduleBatchProcessing();
    }
  }

  /**
   * Track career selection
   */
  async trackCareerSelection(
    userId: string,
    careerId: string,
    careerName: string,
    companionId: string,
    sessionId: string
  ): Promise<void> {
    await this.trackEvent('career_selected', {
      userId,
      careerId,
      careerName,
      companionId,
      sessionId
    }, sessionId);
  }

  /**
   * Track container start
   */
  async trackContainerStart(
    sessionId: string,
    container: string,
    userId: string
  ): Promise<void> {
    await this.trackEvent('container_started', {
      userId,
      container,
      startTime: new Date()
    }, sessionId);
  }

  /**
   * Track subject completion
   */
  async trackSubjectCompletion(
    sessionId: string,
    container: string,
    subject: string,
    score: number,
    timeSpent: number,
    userId: string
  ): Promise<void> {
    await this.trackEvent('subject_completed', {
      userId,
      container,
      subject,
      score,
      timeSpent,
      completedAt: new Date()
    }, sessionId);
  }

  /**
   * Track achievement earned
   */
  async trackAchievement(
    sessionId: string,
    achievementType: string,
    achievementData: Record<string, any>,
    userId: string
  ): Promise<void> {
    await this.trackEvent('achievement_earned', {
      userId,
      achievementType,
      ...achievementData,
      earnedAt: new Date()
    }, sessionId);
  }

  /**
   * Track session restart
   */
  async trackSessionRestart(
    oldSessionId: string,
    newSessionId: string,
    reason: string,
    progressLost: Record<string, any>,
    userId: string
  ): Promise<void> {
    await this.trackEvent('session_restarted', {
      userId,
      oldSessionId,
      newSessionId,
      reason,
      progressLost,
      restartedAt: new Date()
    }, newSessionId);
  }

  /**
   * Track struggle detection
   */
  async trackStruggle(
    sessionId: string,
    subject: string,
    skillId: string,
    struggleType: string,
    userId: string
  ): Promise<void> {
    await this.trackEvent('struggle_detected', {
      userId,
      subject,
      skillId,
      struggleType,
      detectedAt: new Date()
    }, sessionId);
  }

  /**
   * Get career selection patterns for a user
   */
  async getCareerSelectionPatterns(userId: string): Promise<CareerSelectionPattern[]> {
    try {
      const { data, error } = await supabase
        .from('session_analytics')
        .select('event_data')
        .eq('user_id', userId)
        .eq('event_type', 'career_selected');

      if (error) throw error;

      // Process data to extract patterns
      const careerMap = new Map<string, CareerSelectionPattern>();

      data?.forEach(event => {
        const { careerId, careerName } = event.event_data;
        if (!careerMap.has(careerId)) {
          careerMap.set(careerId, {
            careerId,
            careerName,
            frequency: 0,
            averageCompletionRate: 0,
            averageTimeSpent: 0
          });
        }
        const pattern = careerMap.get(careerId)!;
        pattern.frequency++;
      });

      return Array.from(careerMap.values()).sort((a, b) => b.frequency - a.frequency);
    } catch (error) {
      console.error('Failed to get career selection patterns:', error);
      return [];
    }
  }

  /**
   * Get learning insights for a user
   */
  async generateLearningInsights(userId: string, sessionId?: string): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    try {
      // Get session stats
      const stats = await this.getSessionStats(userId);

      // Strength insights
      if (stats.completionRate > 0.8) {
        insights.push({
          type: 'strength',
          subject: 'Overall',
          message: `Excellent completion rate of ${Math.round(stats.completionRate * 100)}%! Keep up the great work!`,
          confidence: 0.9
        });
      }

      // Streak insights
      if (stats.streakDays > 3) {
        insights.push({
          type: 'achievement',
          subject: 'Consistency',
          message: `You're on a ${stats.streakDays} day streak! Consistency is key to learning.`,
          data: { streakDays: stats.streakDays },
          confidence: 1.0
        });
      }

      // Get subject performance
      if (sessionId) {
        const { data: sessionData } = await supabase
          .from('learning_sessions')
          .select('container_progress')
          .eq('id', sessionId)
          .single();

        if (sessionData?.container_progress) {
          // Analyze subject performance
          Object.entries(sessionData.container_progress).forEach(([container, subjects]: [string, any]) => {
            Object.entries(subjects || {}).forEach(([subject, data]: [string, any]) => {
              if (data.score >= 90) {
                insights.push({
                  type: 'strength',
                  subject,
                  message: `Outstanding performance in ${subject}! You scored ${data.score}%`,
                  data: { score: data.score },
                  confidence: 0.95
                });
              } else if (data.score < 70 && data.attempts > 2) {
                insights.push({
                  type: 'challenge',
                  subject,
                  message: `${subject} seems challenging. Consider reviewing the fundamentals.`,
                  data: { score: data.score, attempts: data.attempts },
                  confidence: 0.85
                });
              }
            });
          });
        }
      }

      // Recommendations
      if (stats.averageSessionDuration < 15) {
        insights.push({
          type: 'recommendation',
          subject: 'Learning Strategy',
          message: 'Try to spend at least 15-20 minutes per session for better retention.',
          confidence: 0.8
        });
      }

    } catch (error) {
      console.error('Failed to generate insights:', error);
    }

    return insights;
  }

  /**
   * Get session statistics for a user
   */
  async getSessionStats(userId: string): Promise<SessionStats> {
    try {
      // Get all sessions
      const { data: sessions, error } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate statistics
      const totalSessions = sessions?.length || 0;
      let totalTime = 0;
      let completedSessions = 0;
      let subjectsCompleted = 0;

      sessions?.forEach(session => {
        const progress = session.container_progress || {};
        Object.values(progress).forEach((container: any) => {
          Object.values(container || {}).forEach((subject: any) => {
            if (subject.completed) {
              subjectsCompleted++;
            }
            totalTime += subject.time_spent || 0;
          });
        });

        if (session.completed_at) {
          completedSessions++;
        }
      });

      // Calculate streak
      const streakDays = this.calculateStreak(sessions || []);

      // Get achievements count
      const { count: achievementsCount } = await supabase
        .from('session_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        totalSessions,
        averageSessionDuration: totalSessions > 0 ? totalTime / totalSessions : 0,
        completionRate: totalSessions > 0 ? completedSessions / totalSessions : 0,
        streakDays,
        totalLearningTime: totalTime,
        subjectsCompleted,
        achievementsEarned: achievementsCount || 0
      };
    } catch (error) {
      console.error('Failed to get session stats:', error);
      return {
        totalSessions: 0,
        averageSessionDuration: 0,
        completionRate: 0,
        streakDays: 0,
        totalLearningTime: 0,
        subjectsCompleted: 0,
        achievementsEarned: 0
      };
    }
  }

  /**
   * Calculate learning streak
   */
  private calculateStreak(sessions: any[]): number {
    if (!sessions || sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessionDates = sessions
      .map(s => new Date(s.created_at))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentDate = new Date(today);

    for (const sessionDate of sessionDates) {
      sessionDate.setHours(0, 0, 0, 0);

      if (sessionDate.getTime() === currentDate.getTime()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (sessionDate.getTime() < currentDate.getTime()) {
        break;
      }
    }

    return streak;
  }

  /**
   * Process batched events
   */
  private async processBatch(): Promise<void> {
    if (this.batchedEvents.length === 0) return;

    const eventsToProcess = [...this.batchedEvents];
    this.batchedEvents = [];

    try {
      // Insert events into database
      const analyticsEvents = eventsToProcess.map(event => ({
        session_id: event.sessionId,
        user_id: event.userId,
        event_type: event.eventType,
        event_data: event.eventData,
        created_at: event.timestamp
      }));

      const { error } = await supabase
        .from('session_analytics')
        .insert(analyticsEvents);

      if (error) {
        console.error('Failed to insert analytics events:', error);
        // Re-add events to batch for retry
        this.batchedEvents.push(...eventsToProcess);
      }
    } catch (error) {
      console.error('Failed to process analytics batch:', error);
      // Re-add events to batch for retry
      this.batchedEvents.push(...eventsToProcess);
    }

    // Clear timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * Schedule batch processing
   */
  private scheduleBatchProcessing(): void {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, this.BATCH_DELAY);
  }

  /**
   * Flush any pending events (call on unmount)
   */
  async flush(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    await this.processBatch();
  }
}

// Export singleton instance
export const pathIQAnalytics = new PathIQAnalyticsService();