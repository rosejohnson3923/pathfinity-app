/**
 * VOLUME CONTROL SERVICE
 * 
 * Controls content volume based on time constraints and modes
 * Ensures content fits within specified time limits
 */

import { Question, QuestionType } from './QuestionTypes';

// ================================================================
// INTERFACES
// ================================================================

export interface VolumeMode {
  name: 'demo' | 'testing' | 'standard' | 'full' | 'custom';
  duration: number; // in minutes
  questionCount: QuestionCountConfig;
  complexity: 'simple' | 'moderate' | 'complex';
  includeExtras: boolean; // hints, explanations, etc.
}

export interface QuestionCountConfig {
  min: number;
  max: number;
  optimal: number;
}

export interface VolumeConstraints {
  minDuration: number; // in minutes
  maxDuration: number;
  minQuestions: number;
  maxQuestions: number;
  allowedTypes?: QuestionType[];
  priorityTypes?: QuestionType[];
}

export interface VolumeAdjustment {
  originalCount: number;
  adjustedCount: number;
  reason: string;
  removedTypes?: QuestionType[];
  timeEstimate: number;
}

// ================================================================
// PREDEFINED VOLUME MODES
// ================================================================

const VOLUME_MODES: Record<string, VolumeMode> = {
  demo: {
    name: 'demo',
    duration: 2,
    questionCount: { min: 2, max: 3, optimal: 3 },
    complexity: 'simple',
    includeExtras: false
  },
  testing: {
    name: 'testing',
    duration: 5,
    questionCount: { min: 3, max: 5, optimal: 4 },
    complexity: 'simple',
    includeExtras: true
  },
  standard: {
    name: 'standard',
    duration: 15,
    questionCount: { min: 8, max: 12, optimal: 10 },
    complexity: 'moderate',
    includeExtras: true
  },
  full: {
    name: 'full',
    duration: 20,
    questionCount: { min: 12, max: 20, optimal: 15 },
    complexity: 'complex',
    includeExtras: true
  }
};

// ================================================================
// TIME ESTIMATES BY QUESTION TYPE
// ================================================================

const QUESTION_TIME_ESTIMATES: Record<QuestionType, number> = {
  'multiple_choice': 1.0,
  'true_false': 0.5,
  'fill_blank': 1.5,
  'numeric': 1.5,
  'short_answer': 2.0,
  'long_answer': 5.0,
  'matching': 2.0,
  'ordering': 2.0,
  'classification': 2.5,
  'visual_identification': 1.5,
  'counting': 1.0,
  'pattern_recognition': 2.0,
  'code_completion': 4.0,
  'diagram_labeling': 2.5,
  'open_ended': 3.0
};

// ================================================================
// VOLUME CONTROL SERVICE CLASS
// ================================================================

export class VolumeControlService {
  private static instance: VolumeControlService;
  private currentMode: VolumeMode = VOLUME_MODES.standard;

  private constructor() {}

  public static getInstance(): VolumeControlService {
    if (!VolumeControlService.instance) {
      VolumeControlService.instance = new VolumeControlService();
    }
    return VolumeControlService.instance;
  }

  // ================================================================
  // MODE MANAGEMENT
  // ================================================================

  public setMode(mode: 'demo' | 'testing' | 'standard' | 'full'): void {
    this.currentMode = VOLUME_MODES[mode];
    console.log(`[VolumeControl] Mode set to: ${mode} (${this.currentMode.duration} minutes)`);
  }

  public setCustomMode(duration: number, questionCount?: number): void {
    const optimal = questionCount || Math.round(duration * 0.67); // ~40 seconds per question
    this.currentMode = {
      name: 'custom',
      duration,
      questionCount: {
        min: Math.max(1, optimal - 2),
        max: optimal + 3,
        optimal
      },
      complexity: duration < 10 ? 'simple' : duration < 20 ? 'moderate' : 'complex',
      includeExtras: duration >= 5
    };
    console.log(`[VolumeControl] Custom mode: ${duration} minutes, ${optimal} questions`);
  }

  public getCurrentMode(): VolumeMode {
    return this.currentMode;
  }

  public getAvailableModes(): string[] {
    return Object.keys(VOLUME_MODES);
  }

  // ================================================================
  // QUESTION COUNT CALCULATION
  // ================================================================

  public calculateQuestionCount(
    duration: number,
    questionTypes?: QuestionType[]
  ): number {
    if (!questionTypes || questionTypes.length === 0) {
      // Simple calculation based on average time
      return Math.round(duration / 1.5); // Average 1.5 minutes per question
    }

    // Calculate based on specific question types
    const avgTimePerQuestion = this.calculateAverageTime(questionTypes);
    return Math.round(duration / avgTimePerQuestion);
  }

  private calculateAverageTime(types: QuestionType[]): number {
    const totalTime = types.reduce((sum, type) => {
      return sum + (QUESTION_TIME_ESTIMATES[type] || 1.5);
    }, 0);
    return totalTime / types.length;
  }

  // ================================================================
  // CONTENT ADJUSTMENT
  // ================================================================

  public adjustContentVolume(
    questions: Question[],
    targetDuration: number
  ): VolumeAdjustment {
    const currentEstimate = this.estimateDuration(questions);
    const adjustment: VolumeAdjustment = {
      originalCount: questions.length,
      adjustedCount: questions.length,
      reason: 'No adjustment needed',
      timeEstimate: currentEstimate
    };

    if (Math.abs(currentEstimate - targetDuration) <= 1) {
      // Within 1 minute of target, no adjustment needed
      return adjustment;
    }

    if (currentEstimate > targetDuration) {
      // Need to reduce content
      return this.reduceContent(questions, targetDuration);
    } else {
      // Need to expand content
      return this.expandContent(questions, targetDuration);
    }
  }

  private reduceContent(
    questions: Question[],
    targetDuration: number
  ): VolumeAdjustment {
    const currentEstimate = this.estimateDuration(questions);
    const reductionNeeded = currentEstimate - targetDuration;
    
    // Sort questions by time estimate (longest first)
    const sorted = [...questions].sort((a, b) => {
      const timeA = QUESTION_TIME_ESTIMATES[a.type] || 1.5;
      const timeB = QUESTION_TIME_ESTIMATES[b.type] || 1.5;
      return timeB - timeA;
    });

    const toRemove: Question[] = [];
    let timeRemoved = 0;

    for (const question of sorted) {
      if (timeRemoved >= reductionNeeded) break;
      
      const questionTime = QUESTION_TIME_ESTIMATES[question.type] || 1.5;
      toRemove.push(question);
      timeRemoved += questionTime;
    }

    return {
      originalCount: questions.length,
      adjustedCount: questions.length - toRemove.length,
      reason: `Removed ${toRemove.length} questions to fit ${targetDuration} minute limit`,
      removedTypes: [...new Set(toRemove.map(q => q.type))],
      timeEstimate: currentEstimate - timeRemoved
    };
  }

  private expandContent(
    questions: Question[],
    targetDuration: number
  ): VolumeAdjustment {
    const currentEstimate = this.estimateDuration(questions);
    const expansionNeeded = targetDuration - currentEstimate;
    
    // Calculate how many simple questions to add
    const simpleQuestionTime = QUESTION_TIME_ESTIMATES['true_false'];
    const questionsToAdd = Math.floor(expansionNeeded / simpleQuestionTime);

    return {
      originalCount: questions.length,
      adjustedCount: questions.length + questionsToAdd,
      reason: `Add ${questionsToAdd} quick questions to reach ${targetDuration} minutes`,
      timeEstimate: currentEstimate + (questionsToAdd * simpleQuestionTime)
    };
  }

  // ================================================================
  // TIME ESTIMATION
  // ================================================================

  public estimateDuration(questions: Question[]): number {
    let totalMinutes = 0;

    for (const question of questions) {
      totalMinutes += QUESTION_TIME_ESTIMATES[question.type] || 1.5;
    }

    // Add overhead for instructions, transitions, etc.
    const overhead = questions.length * 0.1; // 6 seconds per question
    totalMinutes += overhead;

    return Math.round(totalMinutes * 10) / 10; // Round to 1 decimal
  }

  public estimateQuestionTime(type: QuestionType): number {
    return QUESTION_TIME_ESTIMATES[type] || 1.5;
  }

  // ================================================================
  // CONSTRAINTS VALIDATION
  // ================================================================

  public validateConstraints(
    questions: Question[],
    constraints: VolumeConstraints
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const duration = this.estimateDuration(questions);

    // Check duration constraints
    if (duration < constraints.minDuration) {
      errors.push(`Duration ${duration} minutes is below minimum ${constraints.minDuration}`);
    }
    if (duration > constraints.maxDuration) {
      errors.push(`Duration ${duration} minutes exceeds maximum ${constraints.maxDuration}`);
    }

    // Check question count constraints
    if (questions.length < constraints.minQuestions) {
      errors.push(`Question count ${questions.length} is below minimum ${constraints.minQuestions}`);
    }
    if (questions.length > constraints.maxQuestions) {
      errors.push(`Question count ${questions.length} exceeds maximum ${constraints.maxQuestions}`);
    }

    // Check allowed types
    if (constraints.allowedTypes) {
      const disallowedTypes = questions.filter(q => 
        !constraints.allowedTypes!.includes(q.type)
      );
      if (disallowedTypes.length > 0) {
        errors.push(`Contains disallowed question types: ${[...new Set(disallowedTypes.map(q => q.type))]}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ================================================================
  // OPTIMAL DISTRIBUTION
  // ================================================================

  public getOptimalQuestionDistribution(
    duration: number,
    allowedTypes?: QuestionType[]
  ): Map<QuestionType, number> {
    const distribution = new Map<QuestionType, number>();
    const types = allowedTypes || this.getDefaultTypesForDuration(duration);
    
    let remainingTime = duration;
    const questionsPerType = Math.floor(duration / types.length / 1.5);

    for (const type of types) {
      const timePerQuestion = QUESTION_TIME_ESTIMATES[type];
      const count = Math.min(
        questionsPerType,
        Math.floor(remainingTime / timePerQuestion)
      );
      
      if (count > 0) {
        distribution.set(type, count);
        remainingTime -= count * timePerQuestion;
      }
    }

    return distribution;
  }

  private getDefaultTypesForDuration(duration: number): QuestionType[] {
    if (duration <= 5) {
      // Quick types only
      return ['multiple_choice', 'true_false', 'counting'];
    } else if (duration <= 15) {
      // Standard mix
      return ['multiple_choice', 'true_false', 'fill_blank', 'numeric', 'matching'];
    } else {
      // Full variety
      return [
        'multiple_choice', 'true_false', 'fill_blank', 'numeric',
        'short_answer', 'matching', 'ordering', 'classification'
      ];
    }
  }

  // ================================================================
  // PACING HELPERS
  // ================================================================

  public calculatePacing(
    questions: Question[],
    totalDuration: number
  ): Map<string, number> {
    const pacing = new Map<string, number>();
    const estimatedTime = this.estimateDuration(questions);
    const timePerQuestion = totalDuration / questions.length;

    questions.forEach((question, index) => {
      const expectedTime = QUESTION_TIME_ESTIMATES[question.type] || timePerQuestion;
      const startTime = index * timePerQuestion;
      pacing.set(question.id, startTime);
    });

    return pacing;
  }

  public isOnPace(
    questionsCompleted: number,
    elapsedTime: number,
    totalQuestions: number,
    totalDuration: number
  ): { onPace: boolean; message: string } {
    const expectedProgress = (elapsedTime / totalDuration) * totalQuestions;
    const actualProgress = questionsCompleted;
    const difference = actualProgress - expectedProgress;

    if (Math.abs(difference) < 0.5) {
      return { onPace: true, message: 'On pace' };
    } else if (difference > 0) {
      return { onPace: true, message: `Ahead by ${Math.round(difference)} questions` };
    } else {
      return { onPace: false, message: `Behind by ${Math.round(-difference)} questions` };
    }
  }

  // ================================================================
  // SUMMARY GENERATION
  // ================================================================

  public generateVolumeSummary(questions: Question[]): {
    totalQuestions: number;
    estimatedDuration: number;
    questionTypes: Map<QuestionType, number>;
    complexity: string;
    recommendation: string;
  } {
    const typeCount = new Map<QuestionType, number>();
    let totalDifficulty = 0;

    questions.forEach(q => {
      typeCount.set(q.type, (typeCount.get(q.type) || 0) + 1);
      totalDifficulty += q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 2 : 3;
    });

    const avgDifficulty = totalDifficulty / questions.length;
    const complexity = avgDifficulty < 1.5 ? 'simple' : avgDifficulty < 2.5 ? 'moderate' : 'complex';
    const duration = this.estimateDuration(questions);

    let recommendation = '';
    if (duration < 5) {
      recommendation = 'Quick practice session';
    } else if (duration < 15) {
      recommendation = 'Standard learning session';
    } else if (duration < 30) {
      recommendation = 'Extended study session';
    } else {
      recommendation = 'Consider breaking into multiple sessions';
    }

    return {
      totalQuestions: questions.length,
      estimatedDuration: duration,
      questionTypes: typeCount,
      complexity,
      recommendation
    };
  }
}

// ================================================================
// EXPORT SINGLETON INSTANCE
// ================================================================

export const volumeControlService = VolumeControlService.getInstance();