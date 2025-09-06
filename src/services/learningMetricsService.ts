/**
 * Learning Metrics Service
 * Tracks and analyzes learning metrics and performance data
 */

export interface LearningMetrics {
  studentId: string;
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  averageTimePerQuestion: number;
  hintsUsed: number;
  skillsAttempted: string[];
  skillsMastered: string[];
  engagementScore: number;
  streakCount: number;
}

export interface SkillMetrics {
  skillId: string;
  skillName: string;
  attempts: number;
  correct: number;
  accuracy: number;
  averageTime: number;
  mastered: boolean;
  lastAttempted: Date;
}

class LearningMetricsService {
  private metrics: Map<string, LearningMetrics> = new Map();
  private skillMetrics: Map<string, SkillMetrics> = new Map();
  private sessionStartTimes: Map<string, Date> = new Map();
  
  /**
   * Start a learning session
   */
  startSession(studentId: string, sessionId: string): void {
    const key = `${studentId}-${sessionId}`;
    
    this.metrics.set(key, {
      studentId,
      sessionId,
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      accuracy: 0,
      averageTimePerQuestion: 0,
      hintsUsed: 0,
      skillsAttempted: [],
      skillsMastered: [],
      engagementScore: 0,
      streakCount: 0
    });
    
    this.sessionStartTimes.set(key, new Date());
  }
  
  /**
   * Record a question attempt
   */
  recordQuestionAttempt(params: {
    studentId: string;
    sessionId: string;
    skillId: string;
    skillName: string;
    correct: boolean;
    timeSpent: number;
    hintsUsed?: number;
  }): void {
    const key = `${params.studentId}-${params.sessionId}`;
    const metrics = this.metrics.get(key);
    
    if (!metrics) {
      this.startSession(params.studentId, params.sessionId);
      return this.recordQuestionAttempt(params);
    }
    
    // Update session metrics
    metrics.totalQuestions++;
    if (params.correct) {
      metrics.correctAnswers++;
      metrics.streakCount++;
    } else {
      metrics.incorrectAnswers++;
      metrics.streakCount = 0;
    }
    
    metrics.accuracy = metrics.correctAnswers / metrics.totalQuestions;
    
    // Update average time
    const totalTime = metrics.averageTimePerQuestion * (metrics.totalQuestions - 1) + params.timeSpent;
    metrics.averageTimePerQuestion = totalTime / metrics.totalQuestions;
    
    // Update hints
    if (params.hintsUsed) {
      metrics.hintsUsed += params.hintsUsed;
    }
    
    // Track skills
    if (!metrics.skillsAttempted.includes(params.skillId)) {
      metrics.skillsAttempted.push(params.skillId);
    }
    
    // Update skill-specific metrics
    this.updateSkillMetrics(params);
    
    // Calculate engagement score
    metrics.engagementScore = this.calculateEngagementScore(metrics);
    
    this.metrics.set(key, metrics);
  }
  
  /**
   * Update skill-specific metrics
   */
  private updateSkillMetrics(params: {
    skillId: string;
    skillName: string;
    correct: boolean;
    timeSpent: number;
  }): void {
    let skillMetric = this.skillMetrics.get(params.skillId);
    
    if (!skillMetric) {
      skillMetric = {
        skillId: params.skillId,
        skillName: params.skillName,
        attempts: 0,
        correct: 0,
        accuracy: 0,
        averageTime: 0,
        mastered: false,
        lastAttempted: new Date()
      };
    }
    
    skillMetric.attempts++;
    if (params.correct) {
      skillMetric.correct++;
    }
    
    skillMetric.accuracy = skillMetric.correct / skillMetric.attempts;
    
    // Update average time
    const totalTime = skillMetric.averageTime * (skillMetric.attempts - 1) + params.timeSpent;
    skillMetric.averageTime = totalTime / skillMetric.attempts;
    
    // Check mastery (80% accuracy with at least 5 attempts)
    skillMetric.mastered = skillMetric.accuracy >= 0.8 && skillMetric.attempts >= 5;
    skillMetric.lastAttempted = new Date();
    
    this.skillMetrics.set(params.skillId, skillMetric);
  }
  
  /**
   * Calculate engagement score
   */
  private calculateEngagementScore(metrics: LearningMetrics): number {
    let score = 0;
    
    // Accuracy component (0-40 points)
    score += metrics.accuracy * 40;
    
    // Consistency component (0-20 points)
    const consistencyScore = Math.min(metrics.streakCount / 5, 1) * 20;
    score += consistencyScore;
    
    // Efficiency component (0-20 points)
    const efficiencyScore = metrics.hintsUsed === 0 ? 20 : 
      Math.max(0, 20 - (metrics.hintsUsed * 2));
    score += efficiencyScore;
    
    // Progress component (0-20 points)
    const progressScore = Math.min(metrics.skillsAttempted.length / 10, 1) * 20;
    score += progressScore;
    
    return Math.round(score);
  }
  
  /**
   * Mark skill as mastered
   */
  markSkillMastered(studentId: string, sessionId: string, skillId: string): void {
    const key = `${studentId}-${sessionId}`;
    const metrics = this.metrics.get(key);
    
    if (metrics && !metrics.skillsMastered.includes(skillId)) {
      metrics.skillsMastered.push(skillId);
      this.metrics.set(key, metrics);
    }
    
    const skillMetric = this.skillMetrics.get(skillId);
    if (skillMetric) {
      skillMetric.mastered = true;
      this.skillMetrics.set(skillId, skillMetric);
    }
  }
  
  /**
   * Get session metrics
   */
  getSessionMetrics(studentId: string, sessionId: string): LearningMetrics | undefined {
    return this.metrics.get(`${studentId}-${sessionId}`);
  }
  
  /**
   * Get skill metrics
   */
  getSkillMetrics(skillId: string): SkillMetrics | undefined {
    return this.skillMetrics.get(skillId);
  }
  
  /**
   * Get all skill metrics for a student
   */
  getAllSkillMetrics(): SkillMetrics[] {
    return Array.from(this.skillMetrics.values());
  }
  
  /**
   * Get session duration
   */
  getSessionDuration(studentId: string, sessionId: string): number {
    const key = `${studentId}-${sessionId}`;
    const startTime = this.sessionStartTimes.get(key);
    
    if (!startTime) {
      return 0;
    }
    
    return Date.now() - startTime.getTime();
  }
  
  /**
   * End session and get final metrics
   */
  endSession(studentId: string, sessionId: string): LearningMetrics | undefined {
    const key = `${studentId}-${sessionId}`;
    const metrics = this.metrics.get(key);
    
    if (metrics) {
      // Final calculations
      const duration = this.getSessionDuration(studentId, sessionId);
      console.log(`Session ended. Duration: ${duration}ms, Metrics:`, metrics);
    }
    
    // Clean up
    this.sessionStartTimes.delete(key);
    
    return metrics;
  }
  
  /**
   * Clear all metrics (for testing)
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.skillMetrics.clear();
    this.sessionStartTimes.clear();
  }
}

// Export singleton instance
export const learningMetricsService = new LearningMetricsService();