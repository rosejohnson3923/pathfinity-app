/**
 * AnalyticsService
 * Tracks user behavior, learning patterns, and engagement metrics
 */

import { supabase } from '../../lib/supabaseClient';
import MonitoringService from './MonitoringService';

export interface LearningEvent {
  eventType: 'question_answered' | 'skill_completed' | 'container_finished' | 'session_started' | 'session_ended';
  studentId: string;
  grade: string;
  subject: string;
  containerType?: string;
  skillId?: string;
  questionType?: string;
  isCorrect?: boolean;
  timeSpent?: number;
  attempts?: number;
  score?: number;
  metadata?: Record<string, any>;
}

export interface EngagementMetrics {
  sessionDuration: number;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  hintsUsed: number;
  averageResponseTime: number;
  engagementScore: number;
}

export interface LearningProgress {
  studentId: string;
  grade: string;
  subject: string;
  skillsMastered: number;
  totalSkills: number;
  masteryPercentage: number;
  currentStreak: number;
  bestStreak: number;
  totalTimeSpent: number;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private monitoring: MonitoringService;
  private sessionStartTime: number | null = null;
  private sessionEvents: LearningEvent[] = [];
  private engagementMetrics: Map<string, EngagementMetrics> = new Map();
  
  private constructor() {
    this.monitoring = MonitoringService.getInstance();
    this.initializeSession();
  }
  
  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }
  
  private initializeSession(): void {
    this.sessionStartTime = Date.now();
    
    // Track session start
    this.trackLearningEvent({
      eventType: 'session_started',
      studentId: this.getStudentId(),
      grade: this.getCurrentGrade(),
      subject: 'all',
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: navigator?.userAgent
      }
    });
    
    // Setup beforeunload to track session end
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.endSession();
      });
    }
  }
  
  // Track learning events
  trackLearningEvent(event: LearningEvent): void {
    this.sessionEvents.push(event);
    
    // Update engagement metrics
    this.updateEngagementMetrics(event);
    
    // Track in monitoring service
    this.monitoring.trackUsage(event.eventType, {
      ...event,
      timestamp: new Date().toISOString()
    });
    
    // Store in database
    this.storeLearningEvent(event);
  }
  
  // Track question answered
  trackQuestionAnswered(
    questionType: string,
    isCorrect: boolean,
    timeSpent: number,
    attempts: number = 1,
    metadata?: Record<string, any>
  ): void {
    const event: LearningEvent = {
      eventType: 'question_answered',
      studentId: this.getStudentId(),
      grade: this.getCurrentGrade(),
      subject: this.getCurrentSubject(),
      containerType: this.getCurrentContainer(),
      questionType,
      isCorrect,
      timeSpent,
      attempts,
      metadata
    };
    
    this.trackLearningEvent(event);
    
    // Track question type performance
    this.monitoring.trackBusinessMetric('question_performance', isCorrect ? 100 : 0, {
      questionType,
      timeSpent,
      attempts
    });
    
    // Check for patterns
    this.analyzeAnswerPattern(questionType, isCorrect);
  }
  
  // Track skill completion
  trackSkillCompleted(
    skillId: string,
    score: number,
    timeSpent: number,
    metadata?: Record<string, any>
  ): void {
    const event: LearningEvent = {
      eventType: 'skill_completed',
      studentId: this.getStudentId(),
      grade: this.getCurrentGrade(),
      subject: this.getCurrentSubject(),
      skillId,
      score,
      timeSpent,
      metadata
    };
    
    this.trackLearningEvent(event);
    
    // Update progress
    this.updateLearningProgress(skillId, score);
  }
  
  // Track container completion
  trackContainerFinished(
    containerType: string,
    questionsAnswered: number,
    correctAnswers: number,
    timeSpent: number
  ): void {
    const event: LearningEvent = {
      eventType: 'container_finished',
      studentId: this.getStudentId(),
      grade: this.getCurrentGrade(),
      subject: this.getCurrentSubject(),
      containerType,
      metadata: {
        questionsAnswered,
        correctAnswers,
        accuracy: (correctAnswers / questionsAnswered) * 100,
        timeSpent
      }
    };
    
    this.trackLearningEvent(event);
    
    // Calculate and store container metrics
    this.calculateContainerMetrics(containerType, questionsAnswered, correctAnswers, timeSpent);
  }
  
  // Analyze answer patterns for insights
  private analyzeAnswerPattern(questionType: string, isCorrect: boolean): void {
    const recentAnswers = this.sessionEvents
      .filter(e => e.eventType === 'question_answered' && e.questionType === questionType)
      .slice(-10);
    
    if (recentAnswers.length >= 5) {
      const correctCount = recentAnswers.filter(e => e.isCorrect).length;
      const accuracy = (correctCount / recentAnswers.length) * 100;
      
      // Alert if struggling with specific question type
      if (accuracy < 50) {
        this.monitoring.trackBusinessMetric('struggling_pattern_detected', accuracy, {
          questionType,
          sampleSize: recentAnswers.length
        });
      }
      
      // Alert if mastery achieved
      if (accuracy >= 90 && recentAnswers.length >= 10) {
        this.monitoring.trackBusinessMetric('mastery_pattern_detected', accuracy, {
          questionType,
          sampleSize: recentAnswers.length
        });
      }
    }
  }
  
  // Update engagement metrics
  private updateEngagementMetrics(event: LearningEvent): void {
    const key = `${event.studentId}_${event.grade}_${event.subject}`;
    let metrics = this.engagementMetrics.get(key) || this.createEmptyMetrics();
    
    if (event.eventType === 'question_answered') {
      metrics.questionsAnswered++;
      if (event.isCorrect) {
        metrics.correctAnswers++;
      } else {
        metrics.incorrectAnswers++;
      }
      
      if (event.timeSpent) {
        // Calculate running average
        const totalTime = metrics.averageResponseTime * (metrics.questionsAnswered - 1) + event.timeSpent;
        metrics.averageResponseTime = totalTime / metrics.questionsAnswered;
      }
    }
    
    // Update session duration
    if (this.sessionStartTime) {
      metrics.sessionDuration = Date.now() - this.sessionStartTime;
    }
    
    // Calculate engagement score (0-100)
    metrics.engagementScore = this.calculateEngagementScore(metrics);
    
    this.engagementMetrics.set(key, metrics);
  }
  
  private calculateEngagementScore(metrics: EngagementMetrics): number {
    let score = 0;
    
    // Accuracy component (40 points)
    if (metrics.questionsAnswered > 0) {
      const accuracy = (metrics.correctAnswers / metrics.questionsAnswered) * 100;
      score += (accuracy / 100) * 40;
    }
    
    // Activity component (30 points)
    const activityScore = Math.min(metrics.questionsAnswered / 20, 1) * 30;
    score += activityScore;
    
    // Consistency component (20 points)
    const sessionMinutes = metrics.sessionDuration / 60000;
    const consistencyScore = Math.min(sessionMinutes / 30, 1) * 20;
    score += consistencyScore;
    
    // Speed component (10 points)
    if (metrics.averageResponseTime > 0) {
      const speedScore = Math.max(0, 1 - (metrics.averageResponseTime / 60000)) * 10;
      score += speedScore;
    }
    
    return Math.round(score);
  }
  
  // Get current engagement metrics
  getEngagementMetrics(studentId?: string, grade?: string, subject?: string): EngagementMetrics {
    const key = `${studentId || this.getStudentId()}_${grade || this.getCurrentGrade()}_${subject || this.getCurrentSubject()}`;
    return this.engagementMetrics.get(key) || this.createEmptyMetrics();
  }
  
  private createEmptyMetrics(): EngagementMetrics {
    return {
      sessionDuration: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      hintsUsed: 0,
      averageResponseTime: 0,
      engagementScore: 0
    };
  }
  
  // Update learning progress
  private async updateLearningProgress(skillId: string, score: number): Promise<void> {
    const studentId = this.getStudentId();
    const grade = this.getCurrentGrade();
    const subject = this.getCurrentSubject();
    
    try {
      // Get current progress
      const { data: currentProgress } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', studentId)
        .eq('grade', grade)
        .eq('subject', subject)
        .single();
      
      let skillsMastered = currentProgress?.skills_mastered || [];
      if (score >= 80 && !skillsMastered.includes(skillId)) {
        skillsMastered.push(skillId);
      }
      
      // Update progress
      const { error } = await supabase
        .from('student_progress')
        .upsert({
          student_id: studentId,
          grade,
          subject,
          skills_mastered: skillsMastered,
          last_skill_completed: skillId,
          last_score: score,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Failed to update progress:', error);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }
  
  // Calculate container-specific metrics
  private calculateContainerMetrics(
    containerType: string,
    questionsAnswered: number,
    correctAnswers: number,
    timeSpent: number
  ): void {
    const accuracy = (correctAnswers / questionsAnswered) * 100;
    const avgTimePerQuestion = timeSpent / questionsAnswered;
    
    // Track container performance
    this.monitoring.trackBusinessMetric(`container_${containerType}_accuracy`, accuracy);
    this.monitoring.trackBusinessMetric(`container_${containerType}_avg_time`, avgTimePerQuestion);
    
    // Store in database
    supabase
      .from('container_analytics')
      .insert({
        student_id: this.getStudentId(),
        container_type: containerType,
        questions_answered: questionsAnswered,
        correct_answers: correctAnswers,
        accuracy,
        time_spent: timeSpent,
        avg_time_per_question: avgTimePerQuestion,
        completed_at: new Date().toISOString()
      })
      .then(({ error }) => {
        if (error) {
          console.error('Failed to store container analytics:', error);
        }
      });
  }
  
  // Store learning event in database
  private async storeLearningEvent(event: LearningEvent): Promise<void> {
    try {
      const { error } = await supabase
        .from('learning_events')
        .insert({
          event_type: event.eventType,
          student_id: event.studentId,
          grade: event.grade,
          subject: event.subject,
          container_type: event.containerType,
          skill_id: event.skillId,
          question_type: event.questionType,
          is_correct: event.isCorrect,
          time_spent: event.timeSpent,
          attempts: event.attempts,
          score: event.score,
          metadata: event.metadata,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Failed to store learning event:', error);
      }
    } catch (error) {
      console.error('Error storing learning event:', error);
    }
  }
  
  // Get learning progress
  async getLearningProgress(studentId?: string): Promise<LearningProgress | null> {
    const id = studentId || this.getStudentId();
    const grade = this.getCurrentGrade();
    const subject = this.getCurrentSubject();
    
    try {
      const { data: progress } = await supabase
        .from('student_progress')
        .select('*')
        .eq('student_id', id)
        .eq('grade', grade)
        .eq('subject', subject)
        .single();
      
      if (!progress) return null;
      
      // Get total skills for grade/subject
      const { count: totalSkills } = await supabase
        .from('skills_master')
        .select('*', { count: 'exact', head: true })
        .eq('grade_level', grade)
        .eq('subject', subject);
      
      return {
        studentId: id,
        grade,
        subject,
        skillsMastered: progress.skills_mastered?.length || 0,
        totalSkills: totalSkills || 0,
        masteryPercentage: ((progress.skills_mastered?.length || 0) / (totalSkills || 1)) * 100,
        currentStreak: progress.current_streak || 0,
        bestStreak: progress.best_streak || 0,
        totalTimeSpent: progress.total_time_spent || 0
      };
    } catch (error) {
      console.error('Error getting learning progress:', error);
      return null;
    }
  }
  
  // End session
  endSession(): void {
    if (!this.sessionStartTime) return;
    
    const sessionDuration = Date.now() - this.sessionStartTime;
    
    this.trackLearningEvent({
      eventType: 'session_ended',
      studentId: this.getStudentId(),
      grade: this.getCurrentGrade(),
      subject: 'all',
      metadata: {
        duration: sessionDuration,
        eventsCount: this.sessionEvents.length,
        engagementMetrics: Object.fromEntries(this.engagementMetrics)
      }
    });
    
    // Flush all metrics
    this.monitoring.destroy();
  }
  
  // Helper methods
  private getStudentId(): string {
    const userData = localStorage.getItem('pathfinity_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id || user.email || 'anonymous';
      } catch {
        return 'anonymous';
      }
    }
    return 'anonymous';
  }
  
  private getCurrentGrade(): string {
    return localStorage.getItem('current_grade') || '10';
  }
  
  private getCurrentSubject(): string {
    return localStorage.getItem('current_subject') || 'Math';
  }
  
  private getCurrentContainer(): string {
    return localStorage.getItem('current_container') || 'learn';
  }
}

export default AnalyticsService;