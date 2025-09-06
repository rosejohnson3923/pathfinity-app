/**
 * Student Progress Service
 * Tracks and manages student learning progress across all subjects and skills
 */

export interface StudentProgress {
  studentId: string;
  studentName: string;
  grade: string;
  overallProgress: number;
  subjectProgress: Record<string, number>;
  skillsMastered: string[];
  skillsInProgress: string[];
  totalTimeSpent: number;
  lastActive: Date;
  streakDays: number;
  achievements: string[];
}

export interface LearningSession {
  sessionId: string;
  studentId: string;
  startTime: Date;
  endTime?: Date;
  subject: string;
  skillsPracticed: string[];
  questionsAnswered: number;
  correctAnswers: number;
  hintsUsed: number;
}

export interface ProgressMetrics {
  accuracy: number;
  speed: number;
  consistency: number;
  improvement: number;
  engagement: number;
}

class StudentProgressService {
  private studentProgress: Map<string, StudentProgress> = new Map();
  private activeSessions: Map<string, LearningSession> = new Map();
  
  constructor() {
    this.initializeSampleData();
  }
  
  /**
   * Initialize with sample data
   */
  private initializeSampleData() {
    // Sample progress for Sam (Kindergarten)
    this.studentProgress.set('sam-k', {
      studentId: 'sam-k',
      studentName: 'Sam',
      grade: 'K',
      overallProgress: 35,
      subjectProgress: {
        'Math': 40,
        'ELA': 30,
        'Science': 35,
        'Social Studies': 30
      },
      skillsMastered: ['Math_K_4', 'ELA_K_1', 'Science_K_2'],
      skillsInProgress: ['Math_K_14', 'ELA_K_5', 'Science_K_8', 'Math_K_24', 'Math_K_34'],
      totalTimeSpent: 7200, // 2 hours in seconds
      lastActive: new Date(),
      streakDays: 5,
      achievements: ['First Steps', 'Counting Champion', 'Week Warrior']
    });
  }
  
  /**
   * Get student progress
   */
  async getStudentProgress(studentId: string): Promise<StudentProgress | undefined> {
    return this.studentProgress.get(studentId);
  }
  
  /**
   * Update student progress
   */
  async updateProgress(
    studentId: string,
    updates: Partial<StudentProgress>
  ): Promise<StudentProgress> {
    const current = this.studentProgress.get(studentId);
    if (!current) {
      throw new Error(`Student ${studentId} not found`);
    }
    
    const updated = {
      ...current,
      ...updates,
      lastActive: new Date()
    };
    
    this.studentProgress.set(studentId, updated);
    return updated;
  }
  
  /**
   * Start a learning session
   */
  async startSession(
    studentId: string,
    subject: string
  ): Promise<string> {
    const sessionId = `session-${Date.now()}`;
    const session: LearningSession = {
      sessionId,
      studentId,
      startTime: new Date(),
      subject,
      skillsPracticed: [],
      questionsAnswered: 0,
      correctAnswers: 0,
      hintsUsed: 0
    };
    
    this.activeSessions.set(sessionId, session);
    return sessionId;
  }
  
  /**
   * End a learning session
   */
  async endSession(sessionId: string): Promise<LearningSession> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    session.endTime = new Date();
    
    // Update student progress based on session
    const progress = this.studentProgress.get(session.studentId);
    if (progress) {
      const duration = (session.endTime.getTime() - session.startTime.getTime()) / 1000;
      progress.totalTimeSpent += duration;
      progress.lastActive = new Date();
      
      // Update subject progress
      if (session.questionsAnswered > 0) {
        const accuracy = session.correctAnswers / session.questionsAnswered;
        const currentSubjectProgress = progress.subjectProgress[session.subject] || 0;
        progress.subjectProgress[session.subject] = Math.min(100, 
          currentSubjectProgress + (accuracy * 5) // Simple progress increment
        );
      }
      
      // Update overall progress
      const subjectValues = Object.values(progress.subjectProgress);
      progress.overallProgress = subjectValues.reduce((a, b) => a + b, 0) / subjectValues.length;
      
      this.studentProgress.set(session.studentId, progress);
    }
    
    this.activeSessions.delete(sessionId);
    return session;
  }
  
  /**
   * Record answer
   */
  async recordAnswer(
    sessionId: string,
    skillId: string,
    correct: boolean,
    hintsUsed: number = 0
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;
    
    session.questionsAnswered++;
    if (correct) {
      session.correctAnswers++;
    }
    session.hintsUsed += hintsUsed;
    
    if (!session.skillsPracticed.includes(skillId)) {
      session.skillsPracticed.push(skillId);
    }
  }
  
  /**
   * Get progress metrics
   */
  async getProgressMetrics(studentId: string): Promise<ProgressMetrics> {
    const progress = this.studentProgress.get(studentId);
    if (!progress) {
      return {
        accuracy: 0,
        speed: 0,
        consistency: 0,
        improvement: 0,
        engagement: 0
      };
    }
    
    // Calculate metrics (simplified)
    const accuracy = progress.skillsMastered.length / 
                     (progress.skillsMastered.length + progress.skillsInProgress.length);
    
    const engagement = Math.min(100, (progress.totalTimeSpent / 3600) * 10); // Hours * 10
    
    return {
      accuracy: accuracy * 100,
      speed: 75, // Placeholder
      consistency: Math.min(100, progress.streakDays * 10),
      improvement: 80, // Placeholder
      engagement
    };
  }
  
  /**
   * Add achievement
   */
  async addAchievement(studentId: string, achievement: string): Promise<void> {
    const progress = this.studentProgress.get(studentId);
    if (!progress) return;
    
    if (!progress.achievements.includes(achievement)) {
      progress.achievements.push(achievement);
      this.studentProgress.set(studentId, progress);
    }
  }
  
  /**
   * Mark skill as mastered
   */
  async markSkillMastered(studentId: string, skillId: string): Promise<void> {
    const progress = this.studentProgress.get(studentId);
    if (!progress) return;
    
    // Move from in progress to mastered
    const index = progress.skillsInProgress.indexOf(skillId);
    if (index !== -1) {
      progress.skillsInProgress.splice(index, 1);
    }
    
    if (!progress.skillsMastered.includes(skillId)) {
      progress.skillsMastered.push(skillId);
    }
    
    this.studentProgress.set(studentId, progress);
  }
  
  /**
   * Get active session
   */
  async getActiveSession(studentId: string): Promise<LearningSession | undefined> {
    for (const session of this.activeSessions.values()) {
      if (session.studentId === studentId && !session.endTime) {
        return session;
      }
    }
    return undefined;
  }
  
  /**
   * Calculate streak
   */
  async updateStreak(studentId: string): Promise<number> {
    const progress = this.studentProgress.get(studentId);
    if (!progress) return 0;
    
    const now = new Date();
    const lastActive = new Date(progress.lastActive);
    const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Same day, maintain streak
      return progress.streakDays;
    } else if (daysDiff === 1) {
      // Next day, increment streak
      progress.streakDays++;
    } else {
      // Missed days, reset streak
      progress.streakDays = 1;
    }
    
    progress.lastActive = now;
    this.studentProgress.set(studentId, progress);
    return progress.streakDays;
  }
}

// Export singleton instance
export const studentProgressService = new StudentProgressService();

// Also export the class for testing
export { StudentProgressService };