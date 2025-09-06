/**
 * Practice Support Service
 * Manages AI Companion support during practice phase
 */

import {
  PracticeQuestionSupport,
  StruggleIndicators,
  MasteryProfile,
  MasteryLevel,
  MasteryAttempt,
  AdaptiveHelp,
  AdaptiveAction,
  GradeConfiguration,
  getGradeConfig,
  getGradeBand,
  COMPANION_PRACTICE_SCRIPTS
} from '../types/practiceSupport';
import { voiceManagerService } from './voiceManagerService';
import { companionVoiceoverService } from './companionVoiceoverService';

class PracticeSupportService {
  private static instance: PracticeSupportService;
  private currentSupport: PracticeQuestionSupport | null = null;
  private struggleIndicators: Map<number, StruggleIndicators> = new Map();
  private masteryProfiles: Map<string, MasteryProfile> = new Map();
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();
  private currentGradeConfig: GradeConfiguration | null = null;
  private isMonitoring: boolean = false;

  private constructor() {}

  static getInstance(): PracticeSupportService {
    if (!PracticeSupportService.instance) {
      PracticeSupportService.instance = new PracticeSupportService();
    }
    return PracticeSupportService.instance;
  }

  /**
   * Initialize practice support for a student
   */
  initialize(studentId: string, grade: string, skillId: string) {
    this.currentGradeConfig = getGradeConfig(grade);
    
    // Initialize or retrieve mastery profile
    const profileKey = `${studentId}_${skillId}`;
    if (!this.masteryProfiles.has(profileKey)) {
      this.masteryProfiles.set(profileKey, {
        studentId,
        skillId,
        questionType: '',
        attempts: [],
        currentLevel: {
          level: 'developing',
          confidence: 50,
          consistency: 50,
          speed: 'moderate'
        },
        trends: {
          improving: false,
          struggledAreas: [],
          strongAreas: [],
          recommendedFocus: []
        }
      });
    }
    
    console.log('📚 Practice Support initialized for:', { studentId, grade, skillId });
  }

  /**
   * Start support for a practice question
   */
  async startQuestionSupport(
    question: PracticeQuestionSupport,
    studentId: string,
    companion: string,
    career: string
  ): Promise<void> {
    this.currentSupport = question;
    this.isMonitoring = true;
    
    // Initialize struggle indicators for this question
    this.struggleIndicators.set(question.questionId, {
      questionId: question.questionId,
      timeOnQuestion: 0,
      attemptCount: 0,
      hintsUsed: 0,
      hintsRequested: false,
      backtracking: false,
      pauseDuration: 0
    });
    
    // Pre-question support
    await this.providePreQuestionSupport(question, companion, career);
    
    // Start monitoring
    this.startMonitoring(question.questionId);
  }

  /**
   * Provide pre-question context and support
   */
  private async providePreQuestionSupport(
    question: PracticeQuestionSupport,
    companion: string,
    career: string
  ): Promise<void> {
    const support = question.companionSupport.preQuestion;
    
    // Set companion voice
    companionVoiceoverService.setCompanion(companion);
    
    // Context setup - connect to career
    if (support.contextSetup) {
      const contextMessage = support.contextSetup.replace('${career}', career);
      await this.speak(contextMessage, companion);
    }
    
    // Connection to what was learned
    if (support.connectionToLearn) {
      await this.speak(support.connectionToLearn, companion);
    }
    
    // Read the question if appropriate for grade
    if (support.readQuestion && this.currentGradeConfig?.autoReadQuestions) {
      await this.speak(question.question, companion);
    }
    
    // Confidence builder
    if (support.confidenceBuilder) {
      await this.speak(support.confidenceBuilder, companion);
    }
  }

  /**
   * Start monitoring for struggle indicators
   */
  private startMonitoring(questionId: number) {
    // Clear any existing timer
    this.stopMonitoring();
    
    // Start time tracking
    const timerId = setInterval(() => {
      if (!this.isMonitoring) return;
      
      const indicators = this.struggleIndicators.get(questionId);
      if (!indicators) return;
      
      // Increment time
      indicators.timeOnQuestion++;
      
      // Check hint triggers
      this.checkHintTriggers(questionId, indicators);
      
      // Check for extended pause (no activity)
      if (indicators.timeOnQuestion > 0 && indicators.timeOnQuestion % 15 === 0) {
        this.checkForStruggle(questionId, indicators);
      }
      
    }, 1000); // Check every second
    
    this.activeTimers.set('monitoring', timerId);
  }

  /**
   * Stop monitoring
   */
  private stopMonitoring() {
    const timerId = this.activeTimers.get('monitoring');
    if (timerId) {
      clearInterval(timerId);
      this.activeTimers.delete('monitoring');
    }
    this.isMonitoring = false;
  }

  /**
   * Check if hints should be triggered
   */
  private async checkHintTriggers(questionId: number, indicators: StruggleIndicators) {
    if (!this.currentSupport || !this.currentGradeConfig) return;
    
    const hints = this.currentSupport.companionSupport.hints;
    const hintTimings = this.currentGradeConfig.hintTiming;
    
    // Check each hint level
    for (let i = 0; i < hints.length && i < hintTimings.length; i++) {
      const hint = hints[i];
      const timing = hintTimings[i];
      
      // If we've reached the time and haven't used this hint
      if (indicators.timeOnQuestion === timing && indicators.hintsUsed === i) {
        await this.provideHint(hint.level, questionId);
        break;
      }
    }
  }

  /**
   * Provide a hint
   */
  async provideHint(level: 1 | 2 | 3, questionId: number): Promise<void> {
    if (!this.currentSupport) return;
    
    const indicators = this.struggleIndicators.get(questionId);
    if (!indicators) return;
    
    const hint = this.currentSupport.companionSupport.hints.find(h => h.level === level);
    if (!hint) return;
    
    console.log(`💡 Providing level ${level} hint for question ${questionId}`);
    
    // Update indicators
    indicators.hintsUsed++;
    
    // Speak the hint
    await this.speak(hint.hint, 'current');
    
    // Show visual cue if provided
    if (hint.visualCue) {
      this.showVisualHint(hint.visualCue);
    }
    
    // Provide example if at level 2+
    if (level >= 2 && hint.example) {
      await this.speak(hint.example, 'current');
    }
    
    // Provide scaffolding if at level 3
    if (level === 3 && hint.scaffolding) {
      for (const step of hint.scaffolding) {
        await this.speak(step, 'current');
        await this.pause(2000); // Pause between steps
      }
    }
  }

  /**
   * Check for struggle patterns
   */
  private async checkForStruggle(questionId: number, indicators: StruggleIndicators) {
    const gradeBand = getGradeBand(this.currentGradeConfig?.grade || '3');
    const scripts = COMPANION_PRACTICE_SCRIPTS;
    
    // Provide encouragement based on time spent
    if (indicators.timeOnQuestion === 30 && indicators.attemptCount === 0) {
      const encouragement = scripts.encouragement[gradeBand]?.[0] || "You're doing great!";
      await this.speak(encouragement, 'current');
    } else if (indicators.timeOnQuestion === 60 && indicators.attemptCount === 0) {
      await this.speak("Take your time. There's no rush!", 'current');
    }
  }

  /**
   * Handle answer attempt
   */
  async handleAnswer(
    questionId: number,
    answer: any,
    isCorrect: boolean,
    studentId: string
  ): Promise<void> {
    if (!this.currentSupport) return;
    
    const indicators = this.struggleIndicators.get(questionId) || {
      questionId,
      timeOnQuestion: 0,
      attemptCount: 0,
      hintsUsed: 0,
      hintsRequested: false,
      backtracking: false,
      pauseDuration: 0
    };
    
    // Update attempt count
    indicators.attemptCount++;
    
    // Stop monitoring while providing feedback
    this.stopMonitoring();
    
    // Provide appropriate feedback
    if (isCorrect) {
      await this.provideCorrectFeedback(questionId, indicators);
    } else {
      await this.provideIncorrectFeedback(questionId, indicators);
    }
    
    // Update mastery tracking
    this.updateMastery(studentId, questionId, isCorrect, indicators);
    
    // Resume monitoring if not correct and can retry
    if (!isCorrect && indicators.attemptCount < (this.currentGradeConfig?.maxAttempts || 3)) {
      this.startMonitoring(questionId);
    }
  }

  /**
   * Provide feedback for correct answer
   */
  private async provideCorrectFeedback(
    questionId: number,
    indicators: StruggleIndicators
  ): Promise<void> {
    if (!this.currentSupport) return;
    
    const feedback = this.currentSupport.companionSupport.feedback.correct;
    const gradeBand = getGradeBand(this.currentGradeConfig?.grade || '3');
    
    // Immediate celebration
    const celebration = COMPANION_PRACTICE_SCRIPTS.celebration[gradeBand]?.[0] || feedback.immediate;
    await this.speak(celebration, 'current');
    
    // Explain why it's correct
    if (feedback.explanation) {
      await this.speak(feedback.explanation, 'current');
    }
    
    // Connect to career
    if (feedback.careerConnection) {
      await this.speak(feedback.careerConnection, 'current');
    }
    
    // Skill reinforcement
    if (feedback.skillReinforcement) {
      await this.speak(feedback.skillReinforcement, 'current');
    }
    
    // Special recognition for quick/independent success
    if (indicators.hintsUsed === 0 && indicators.timeOnQuestion < 15) {
      await this.speak("Wow, you got that so quickly! You really understand this!", 'current');
    } else if (indicators.hintsUsed > 0) {
      await this.speak("Great job using the hints to figure it out!", 'current');
    }
  }

  /**
   * Provide feedback for incorrect answer
   */
  private async provideIncorrectFeedback(
    questionId: number,
    indicators: StruggleIndicators
  ): Promise<void> {
    if (!this.currentSupport || !this.currentGradeConfig) return;
    
    const feedback = this.currentSupport.companionSupport.feedback.incorrect;
    const gradeBand = getGradeBand(this.currentGradeConfig.grade);
    
    // Encouragement first
    const support = COMPANION_PRACTICE_SCRIPTS.support[gradeBand]?.[
      Math.min(indicators.attemptCount - 1, 3)
    ] || feedback.immediate;
    await this.speak(support, 'current');
    
    // Explain correct approach
    if (feedback.explanation) {
      await this.speak(feedback.explanation, 'current');
    }
    
    // Reteach if multiple attempts
    if (indicators.attemptCount >= 2 && feedback.reteach) {
      await this.speak("Let me explain this differently...", 'current');
      await this.speak(feedback.reteach, 'current');
    }
    
    // Specific guidance for retry
    if (indicators.attemptCount < this.currentGradeConfig.maxAttempts) {
      if (feedback.tryAgainPrompt) {
        await this.speak(feedback.tryAgainPrompt, 'current');
      } else {
        await this.speak("Let's try again with what you just learned!", 'current');
      }
    } else {
      // Max attempts reached - show answer and teach
      if (feedback.showCorrectAnswer) {
        await this.provideFullExplanation();
      }
    }
  }

  /**
   * Provide full explanation after max attempts
   */
  private async provideFullExplanation(): Promise<void> {
    if (!this.currentSupport) return;
    
    const teaching = this.currentSupport.teachingMoments;
    
    await this.speak("Let me show you how to solve this...", 'current');
    
    // Concept explanation
    if (teaching.conceptExplanation) {
      await this.speak(teaching.conceptExplanation, 'current');
    }
    
    // Real world example
    if (teaching.realWorldExample) {
      await this.speak(teaching.realWorldExample, 'current');
    }
    
    // Common mistakes to avoid
    if (teaching.commonMistakes && teaching.commonMistakes.length > 0) {
      await this.speak("Here's what to watch out for next time...", 'current');
      for (const mistake of teaching.commonMistakes) {
        await this.speak(mistake, 'current');
      }
    }
    
    await this.speak("Don't worry, we'll practice more of these!", 'current');
  }

  /**
   * Update mastery tracking
   */
  private updateMastery(
    studentId: string,
    questionId: number,
    success: boolean,
    indicators: StruggleIndicators
  ): void {
    const skillId = this.currentSupport?.questionId.toString() || '';
    const profileKey = `${studentId}_${skillId}`;
    const profile = this.masteryProfiles.get(profileKey);
    
    if (!profile) return;
    
    // Record attempt
    const attempt: MasteryAttempt = {
      timestamp: new Date(),
      questionId,
      success,
      timeToAnswer: indicators.timeOnQuestion,
      hintsUsed: indicators.hintsUsed,
      attemptCount: indicators.attemptCount,
      struggledWith: success ? undefined : [this.currentSupport?.type || 'unknown']
    };
    
    profile.attempts.push(attempt);
    
    // Update mastery level
    profile.currentLevel = this.calculateMasteryLevel(profile.attempts);
    
    // Update trends
    profile.trends = this.analyzeTrends(profile.attempts);
    
    console.log('📊 Mastery updated:', profile.currentLevel);
  }

  /**
   * Calculate mastery level from attempts
   */
  private calculateMasteryLevel(attempts: MasteryAttempt[]): MasteryLevel {
    if (attempts.length === 0) {
      return { level: 'developing', confidence: 50, consistency: 50, speed: 'moderate' };
    }
    
    // Get recent attempts (last 5)
    const recent = attempts.slice(-5);
    
    // Calculate success rate
    const successRate = recent.filter(a => a.success).length / recent.length;
    
    // Calculate average hints used
    const avgHints = recent.reduce((sum, a) => sum + a.hintsUsed, 0) / recent.length;
    
    // Calculate average time
    const avgTime = recent.reduce((sum, a) => sum + a.timeToAnswer, 0) / recent.length;
    
    // Determine level
    let level: MasteryLevel['level'];
    if (successRate >= 0.8 && avgHints < 0.5) {
      level = 'mastering';
    } else if (successRate >= 0.6) {
      level = 'proficient';
    } else if (successRate >= 0.4) {
      level = 'developing';
    } else {
      level = 'struggling';
    }
    
    // Determine speed
    let speed: MasteryLevel['speed'];
    if (avgTime < 15) {
      speed = 'fast';
    } else if (avgTime < 30) {
      speed = 'moderate';
    } else {
      speed = 'slow';
    }
    
    return {
      level,
      confidence: Math.round(successRate * 100),
      consistency: Math.round((1 - (avgHints / 3)) * 100),
      speed
    };
  }

  /**
   * Analyze learning trends
   */
  private analyzeTrends(attempts: MasteryAttempt[]): {
    improving: boolean;
    struggledAreas: string[];
    strongAreas: string[];
    recommendedFocus: string[];
  } {
    if (attempts.length < 2) {
      return {
        improving: false,
        struggledAreas: [],
        strongAreas: [],
        recommendedFocus: []
      };
    }
    
    // Compare first half vs second half performance
    const mid = Math.floor(attempts.length / 2);
    const firstHalf = attempts.slice(0, mid);
    const secondHalf = attempts.slice(mid);
    
    const firstSuccess = firstHalf.filter(a => a.success).length / firstHalf.length;
    const secondSuccess = secondHalf.filter(a => a.success).length / secondHalf.length;
    
    // Identify struggled areas
    const struggledAreas = Array.from(new Set(
      attempts
        .filter(a => !a.success)
        .flatMap(a => a.struggledWith || [])
    ));
    
    // Identify strong areas (consistent success)
    const strongAreas = Array.from(new Set(
      attempts
        .filter(a => a.success && a.hintsUsed === 0)
        .map(a => this.currentSupport?.type || 'unknown')
    ));
    
    return {
      improving: secondSuccess > firstSuccess,
      struggledAreas,
      strongAreas,
      recommendedFocus: struggledAreas
    };
  }

  /**
   * Provide transition between questions
   */
  async provideTransition(
    fromQuestion: number,
    toQuestion: number,
    totalQuestions: number
  ): Promise<void> {
    const gradeBand = getGradeBand(this.currentGradeConfig?.grade || '3');
    const transitions = COMPANION_PRACTICE_SCRIPTS.questionTransitions;
    
    if (toQuestion < totalQuestions) {
      const message = transitions[toQuestion] || `Let's move on to question ${toQuestion + 1}!`;
      await this.speak(message, 'current');
    } else {
      // Practice complete
      const completion = COMPANION_PRACTICE_SCRIPTS.phaseIntro[gradeBand];
      await this.speak("Excellent work! You've completed all the practice questions!", 'current');
    }
  }

  /**
   * Get mastery summary
   */
  getMasterySummary(studentId: string, skillId: string): MasteryProfile | undefined {
    const profileKey = `${studentId}_${skillId}`;
    return this.masteryProfiles.get(profileKey);
  }

  /**
   * Helper to speak with companion voice
   */
  private async speak(message: string, companion: string): Promise<void> {
    if (companion === 'current') {
      await companionVoiceoverService.playVoiceover('practice-support', { message });
    } else {
      companionVoiceoverService.setCompanion(companion);
      await companionVoiceoverService.playVoiceover('practice-support', { message });
    }
  }

  /**
   * Helper to pause
   */
  private pause(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Show visual hint
   */
  private showVisualHint(visualCue: string): void {
    // This would trigger UI updates to highlight or show visual hints
    console.log('👁️ Visual hint:', visualCue);
    // Dispatch event for UI to handle
    window.dispatchEvent(new CustomEvent('showVisualHint', { detail: visualCue }));
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopMonitoring();
    this.activeTimers.forEach(timer => clearInterval(timer));
    this.activeTimers.clear();
    this.struggleIndicators.clear();
    this.currentSupport = null;
  }
}

// Export singleton instance
export const practiceSupportService = PracticeSupportService.getInstance();

export default PracticeSupportService;