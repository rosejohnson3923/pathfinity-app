/**
 * Lightweight Practice Support Service
 * A simplified, non-reactive version that doesn't cause component remounting
 * Focuses on essential support without complex state management
 */

import { companionReactionService } from './companionReactionService';

export interface LightweightPracticeSupport {
  questionId: number;
  hintsGiven: number;
  startTime: number;
  lastInteractionTime: number;
}

class LightweightPracticeSupportService {
  private static instance: LightweightPracticeSupportService;
  
  // Store data in memory without triggering React updates
  private sessionData: Map<number, LightweightPracticeSupport> = new Map();
  private isActive: boolean = false;
  
  private constructor() {}

  static getInstance(): LightweightPracticeSupportService {
    if (!LightweightPracticeSupportService.instance) {
      LightweightPracticeSupportService.instance = new LightweightPracticeSupportService();
    }
    return LightweightPracticeSupportService.instance;
  }

  /**
   * Initialize support (lightweight - no state updates)
   */
  initialize(studentId: string, grade: string, skillId: string) {
    this.isActive = true;
    this.sessionData.clear();
    console.log('🪶 Lightweight Practice Support initialized:', { studentId, grade, skillId });
  }

  /**
   * Start tracking a question (no timers, no state updates)
   */
  startQuestion(questionId: number) {
    if (!this.isActive) return;
    
    this.sessionData.set(questionId, {
      questionId,
      hintsGiven: 0,
      startTime: Date.now(),
      lastInteractionTime: Date.now()
    });
    
    console.log('🪶 Started tracking question:', questionId);
  }

  /**
   * Get contextual hint based on time spent (passive check, no timers)
   */
  getHintIfNeeded(questionId: number, career: string, companion: string): string | null {
    if (!this.isActive) return null;
    
    const data = this.sessionData.get(questionId);
    if (!data) return null;
    
    const timeSpent = (Date.now() - data.startTime) / 1000; // seconds
    
    // Simple threshold-based hints without complex monitoring
    if (timeSpent > 30 && data.hintsGiven === 0) {
      data.hintsGiven = 1;
      return this.generateHint(1, career, companion);
    } else if (timeSpent > 60 && data.hintsGiven === 1) {
      data.hintsGiven = 2;
      return this.generateHint(2, career, companion);
    }
    
    return null;
  }

  /**
   * Generate career-contextualized hints
   */
  private generateHint(level: number, career: string, companion: string): string {
    const hints: Record<number, string> = {
      1: `Remember, a ${career} would look at this step by step. Take your time!`,
      2: `Think about how a ${career} counts things. You can do this!`,
      3: `Let's count together like a ${career} would. Start with the first one...`
    };
    
    return hints[level] || `You're doing great! Keep thinking like a ${career}!`;
  }

  /**
   * Handle answer without complex state updates
   */
  handleAnswer(questionId: number, isCorrect: boolean, career: string, companion: string) {
    if (!this.isActive) return;
    
    const data = this.sessionData.get(questionId);
    if (!data) return;
    
    // Update last interaction time
    data.lastInteractionTime = Date.now();
    
    // Log for debugging only
    console.log('🪶 Answer handled:', {
      questionId,
      isCorrect,
      timeSpent: (Date.now() - data.startTime) / 1000,
      hintsGiven: data.hintsGiven
    });
  }

  /**
   * Get struggle-based encouragement (passive, no monitoring)
   */
  getEncouragement(questionId: number, attemptCount: number, career: string): string | null {
    if (!this.isActive) return null;
    
    const data = this.sessionData.get(questionId);
    if (!data) return null;
    
    const timeSpent = (Date.now() - data.startTime) / 1000;
    
    // Provide encouragement based on attempts and time
    if (attemptCount > 2 && timeSpent > 45) {
      return `Every ${career} takes time to learn. You're getting closer!`;
    } else if (attemptCount > 1) {
      return `Good ${career}s always try again. Let's think about it differently!`;
    }
    
    return null;
  }

  /**
   * Cleanup without affecting React state
   */
  cleanup() {
    this.isActive = false;
    this.sessionData.clear();
    console.log('🪶 Lightweight Practice Support cleaned up');
  }

  /**
   * Check if service is active
   */
  isServiceActive(): boolean {
    return this.isActive;
  }

  /**
   * Get simple progress feedback
   */
  getProgressFeedback(correctCount: number, totalQuestions: number, career: string): string {
    const percentage = (correctCount / totalQuestions) * 100;
    
    if (percentage >= 80) {
      return `Amazing! You're thinking just like a professional ${career}!`;
    } else if (percentage >= 60) {
      return `Good work! You're learning ${career} skills quickly!`;
    } else if (percentage >= 40) {
      return `Keep going! Every ${career} started where you are now!`;
    } else {
      return `You're doing great! Learning takes practice, future ${career}!`;
    }
  }
}

export const lightweightPracticeSupportService = LightweightPracticeSupportService.getInstance();