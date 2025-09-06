/**
 * Content Volume Manager
 * Controls content volume based on modes and time constraints
 */

import {
  Question,
  QuestionType,
  Grade,
  Subject,
  Difficulty
} from '../../types/questions';
import { questionTypeRegistry } from './QuestionTypeRegistry';
import { ContentRequest, TimeAllocation } from './ContentRequestBuilder';

// ============================================================================
// INTERFACES
// ============================================================================

export enum ContentMode {
  DEMO = 'demo',           // 2 min per container
  TESTING = 'testing',     // 5 min per container  
  STANDARD = 'standard',   // 15 min per subject
  FULL = 'full'           // 20 min per subject
}

export interface ContentVolume {
  mode: ContentMode;
  totalMinutes: number;
  questionsPerContainer: QuestionCountByContainer;
  questionsPerSubject: QuestionCountBySubject;
  totalQuestions: number;
  estimatedCompletionTime: number; // minutes
}

export interface QuestionCountByContainer {
  discover: number;
  learn: number;
  experience: number;
  threeJourney: number;
}

export interface QuestionCountBySubject {
  Math: number;
  ELA: number;
  Science: number;
  'Social Studies': number;
}

export interface VolumeDistribution {
  questionTypes: Record<QuestionType, number>;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
    advanced: number;
  };
  containers: QuestionCountByContainer;
  subjects: QuestionCountBySubject;
}

export interface VolumeConstraints {
  minQuestions?: number;
  maxQuestions?: number;
  minMinutes?: number;
  maxMinutes?: number;
  requiredContainers?: string[];
  requiredSubjects?: Subject[];
}

export interface TimeDistribution {
  instruction: number;  // Time for reading instructions
  practice: number;     // Time for practice questions
  assessment: number;   // Time for assessment questions
  review: number;      // Time for review
  transitions: number; // Time between activities
  buffer: number;      // Extra time buffer
}

// ============================================================================
// CONTENT VOLUME CALCULATOR
// ============================================================================

export class ContentVolumeCalculator {
  private static instance: ContentVolumeCalculator;
  private modeConfigs: Map<ContentMode, ModeConfiguration>;

  private constructor() {
    this.modeConfigs = new Map();
    this.initializeModeConfigurations();
  }

  public static getInstance(): ContentVolumeCalculator {
    if (!ContentVolumeCalculator.instance) {
      ContentVolumeCalculator.instance = new ContentVolumeCalculator();
    }
    return ContentVolumeCalculator.instance;
  }

  // ============================================================================
  // MAIN CALCULATION METHODS
  // ============================================================================

  public calculateDistribution(
    totalMinutes: number,
    subjects: Subject[],
    containers: string[],
    mode: ContentMode
  ): VolumeDistribution {
    // Get mode configuration
    const config = this.modeConfigs.get(mode);
    if (!config) {
      throw new Error(`Invalid content mode: ${mode}`);
    }

    // Calculate time per subject
    const minutesPerSubject = totalMinutes / subjects.length;
    
    // Calculate questions per subject based on time
    const questionsPerSubject = this.calculateQuestionCount(minutesPerSubject);

    // Distribute across containers
    const containerDistribution = this.distributeAcrossContainers(
      questionsPerSubject.total,
      containers
    );

    // Distribute across question types
    const typeDistribution = this.distributeAcrossTypes(
      questionsPerSubject.total,
      subjects[0] // Use first subject for type distribution
    );

    // Calculate difficulty distribution
    const difficultyDistribution = this.calculateDifficultyDistribution(
      mode,
      questionsPerSubject.total
    );

    // Build subject distribution
    const subjectDistribution: QuestionCountBySubject = {
      Math: 0,
      ELA: 0,
      Science: 0,
      'Social Studies': 0
    };

    subjects.forEach(subject => {
      subjectDistribution[subject] = questionsPerSubject.total;
    });

    return {
      questionTypes: typeDistribution,
      difficulty: difficultyDistribution,
      containers: containerDistribution,
      subjects: subjectDistribution
    };
  }

  public calculateQuestionCount(minutes: number): QuestionVolume {
    // Average time per question by type (in seconds)
    const avgTimePerQuestion = 45; // seconds
    const totalSeconds = minutes * 60;
    
    // Account for instruction and transition time (20% overhead)
    const availableSeconds = totalSeconds * 0.8;
    
    // Calculate base question count
    const baseCount = Math.floor(availableSeconds / avgTimePerQuestion);
    
    // Distribute across question purposes
    const practiceRatio = 0.5;
    const assessmentRatio = 0.35;
    const reviewRatio = 0.15;

    return {
      mode: ContentMode.STANDARD,
      totalMinutes: minutes,
      questionsPerContainer: {
        discover: Math.floor(baseCount * 0.2),
        learn: Math.floor(baseCount * 0.4),
        experience: Math.floor(baseCount * 0.25),
        threeJourney: Math.floor(baseCount * 0.15)
      },
      questionsPerSubject: {
        Math: baseCount,
        ELA: baseCount,
        Science: baseCount,
        'Social Studies': baseCount
      },
      totalQuestions: baseCount,
      estimatedCompletionTime: (baseCount * avgTimePerQuestion) / 60
    };
  }

  // ============================================================================
  // MODE-SPECIFIC CALCULATIONS
  // ============================================================================

  public calculateDemoVolume(): ContentVolume {
    return {
      mode: ContentMode.DEMO,
      totalMinutes: 2,
      questionsPerContainer: {
        discover: 1,
        learn: 1,
        experience: 1,
        threeJourney: 0
      },
      questionsPerSubject: {
        Math: 1,
        ELA: 1,
        Science: 1,
        'Social Studies': 0
      },
      totalQuestions: 3,
      estimatedCompletionTime: 2
    };
  }

  public calculateTestingVolume(): ContentVolume {
    return {
      mode: ContentMode.TESTING,
      totalMinutes: 5,
      questionsPerContainer: {
        discover: 2,
        learn: 2,
        experience: 2,
        threeJourney: 1
      },
      questionsPerSubject: {
        Math: 2,
        ELA: 2,
        Science: 2,
        'Social Studies': 1
      },
      totalQuestions: 7,
      estimatedCompletionTime: 5
    };
  }

  public calculateStandardVolume(): ContentVolume {
    return {
      mode: ContentMode.STANDARD,
      totalMinutes: 15,
      questionsPerContainer: {
        discover: 4,
        learn: 6,
        experience: 5,
        threeJourney: 3
      },
      questionsPerSubject: {
        Math: 5,
        ELA: 5,
        Science: 4,
        'Social Studies': 4
      },
      totalQuestions: 18,
      estimatedCompletionTime: 15
    };
  }

  public calculateFullVolume(): ContentVolume {
    return {
      mode: ContentMode.FULL,
      totalMinutes: 20,
      questionsPerContainer: {
        discover: 5,
        learn: 8,
        experience: 7,
        threeJourney: 5
      },
      questionsPerSubject: {
        Math: 7,
        ELA: 6,
        Science: 6,
        'Social Studies': 6
      },
      totalQuestions: 25,
      estimatedCompletionTime: 20
    };
  }

  // ============================================================================
  // TIME MANAGEMENT
  // ============================================================================

  public calculateTimeDistribution(
    totalMinutes: number,
    questionCount: number
  ): TimeDistribution {
    // Calculate time components
    const instructionTime = Math.min(2, totalMinutes * 0.1); // 10% for instructions, max 2 min
    const transitionTime = Math.min(3, totalMinutes * 0.15); // 15% for transitions, max 3 min
    const bufferTime = Math.min(2, totalMinutes * 0.1); // 10% buffer, max 2 min
    
    // Remaining time for questions
    const questionTime = totalMinutes - instructionTime - transitionTime - bufferTime;
    
    // Distribute question time by purpose
    const practiceTime = questionTime * 0.4;
    const assessmentTime = questionTime * 0.4;
    const reviewTime = questionTime * 0.2;

    return {
      instruction: instructionTime,
      practice: practiceTime,
      assessment: assessmentTime,
      review: reviewTime,
      transitions: transitionTime,
      buffer: bufferTime
    };
  }

  public estimateQuestionTime(
    question: Question,
    includeReading: boolean = true
  ): number {
    // Base time by question type (seconds)
    const baseTime = questionTypeRegistry
      .getTypeDefinition(question.type)?.averageTimeSeconds || 30;

    // Adjust for difficulty
    const difficultyMultiplier = {
      easy: 0.8,
      medium: 1.0,
      hard: 1.3,
      advanced: 1.5
    }[question.metadata.difficulty] || 1.0;

    // Add reading time if needed
    const readingTime = includeReading ? 
      this.estimateReadingTime(question.question) : 0;

    return Math.round((baseTime * difficultyMultiplier) + readingTime);
  }

  private estimateReadingTime(text: string): number {
    // Average reading speed: 200 words per minute
    const words = text.split(/\s+/).length;
    const readingSpeed = 200 / 60; // words per second
    return Math.round(words / readingSpeed);
  }

  // ============================================================================
  // DISTRIBUTION HELPERS
  // ============================================================================

  private distributeAcrossContainers(
    totalQuestions: number,
    containers: string[]
  ): QuestionCountByContainer {
    const distribution: QuestionCountByContainer = {
      discover: 0,
      learn: 0,
      experience: 0,
      threeJourney: 0
    };

    // Default weights for each container
    const weights = {
      discover: 0.2,
      learn: 0.4,
      experience: 0.25,
      threeJourney: 0.15
    };

    // Calculate based on which containers are active
    let totalWeight = 0;
    containers.forEach(container => {
      if (container in weights) {
        totalWeight += weights[container as keyof typeof weights];
      }
    });

    // Distribute questions
    containers.forEach(container => {
      if (container in weights) {
        const weight = weights[container as keyof typeof weights];
        const count = Math.round((weight / totalWeight) * totalQuestions);
        distribution[container as keyof QuestionCountByContainer] = count;
      }
    });

    // Ensure we have exactly totalQuestions
    const currentTotal = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    if (currentTotal !== totalQuestions) {
      distribution.learn += (totalQuestions - currentTotal);
    }

    return distribution;
  }

  private distributeAcrossTypes(
    totalQuestions: number,
    subject: Subject
  ): Record<QuestionType, number> {
    // This will use the registry's distribution calculation
    const distribution = questionTypeRegistry.calculateDistribution(
      '5', // Default to grade 5 for balanced distribution
      subject,
      totalQuestions,
      'balanced'
    );

    return distribution;
  }

  private calculateDifficultyDistribution(
    mode: ContentMode,
    totalQuestions: number
  ): VolumeDistribution['difficulty'] {
    // Mode-specific difficulty distributions
    const distributions = {
      [ContentMode.DEMO]: { easy: 0.7, medium: 0.3, hard: 0, advanced: 0 },
      [ContentMode.TESTING]: { easy: 0.4, medium: 0.4, hard: 0.2, advanced: 0 },
      [ContentMode.STANDARD]: { easy: 0.25, medium: 0.5, hard: 0.25, advanced: 0 },
      [ContentMode.FULL]: { easy: 0.2, medium: 0.4, hard: 0.3, advanced: 0.1 }
    };

    const dist = distributions[mode];

    return {
      easy: Math.round(totalQuestions * dist.easy),
      medium: Math.round(totalQuestions * dist.medium),
      hard: Math.round(totalQuestions * dist.hard),
      advanced: Math.round(totalQuestions * dist.advanced)
    };
  }

  // ============================================================================
  // VOLUME VALIDATION
  // ============================================================================

  public validateVolume(
    volume: ContentVolume,
    constraints?: VolumeConstraints
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (constraints) {
      // Check question count constraints
      if (constraints.minQuestions && volume.totalQuestions < constraints.minQuestions) {
        errors.push(`Total questions (${volume.totalQuestions}) below minimum (${constraints.minQuestions})`);
      }

      if (constraints.maxQuestions && volume.totalQuestions > constraints.maxQuestions) {
        errors.push(`Total questions (${volume.totalQuestions}) exceeds maximum (${constraints.maxQuestions})`);
      }

      // Check time constraints
      if (constraints.minMinutes && volume.totalMinutes < constraints.minMinutes) {
        errors.push(`Total time (${volume.totalMinutes} min) below minimum (${constraints.minMinutes} min)`);
      }

      if (constraints.maxMinutes && volume.totalMinutes > constraints.maxMinutes) {
        errors.push(`Total time (${volume.totalMinutes} min) exceeds maximum (${constraints.maxMinutes} min)`);
      }
    }

    // Validate internal consistency
    const containerTotal = Object.values(volume.questionsPerContainer)
      .reduce((sum, count) => sum + count, 0);
    
    const subjectTotal = Object.values(volume.questionsPerSubject)
      .reduce((sum, count) => sum + count, 0);

    if (Math.abs(containerTotal - volume.totalQuestions) > 1) {
      errors.push('Container distribution does not match total questions');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ============================================================================
  // ADAPTIVE VOLUME
  // ============================================================================

  public adjustVolumeForPerformance(
    baseVolume: ContentVolume,
    performanceLevel: 'struggling' | 'on-track' | 'advanced'
  ): ContentVolume {
    const adjustmentFactors = {
      struggling: 0.7,  // Reduce volume by 30%
      'on-track': 1.0,  // No adjustment
      advanced: 1.3     // Increase volume by 30%
    };

    const factor = adjustmentFactors[performanceLevel];
    
    return {
      ...baseVolume,
      totalQuestions: Math.round(baseVolume.totalQuestions * factor),
      questionsPerContainer: {
        discover: Math.round(baseVolume.questionsPerContainer.discover * factor),
        learn: Math.round(baseVolume.questionsPerContainer.learn * factor),
        experience: Math.round(baseVolume.questionsPerContainer.experience * factor),
        threeJourney: Math.round(baseVolume.questionsPerContainer.threeJourney * factor)
      },
      questionsPerSubject: {
        Math: Math.round(baseVolume.questionsPerSubject.Math * factor),
        ELA: Math.round(baseVolume.questionsPerSubject.ELA * factor),
        Science: Math.round(baseVolume.questionsPerSubject.Science * factor),
        'Social Studies': Math.round(baseVolume.questionsPerSubject['Social Studies'] * factor)
      },
      estimatedCompletionTime: Math.round(baseVolume.estimatedCompletionTime * factor)
    };
  }

  public adjustVolumeForTimeConstraint(
    targetMinutes: number,
    subjects: Subject[],
    grade: Grade
  ): ContentVolume {
    // Determine best mode for time constraint
    let mode: ContentMode;
    if (targetMinutes <= 3) {
      mode = ContentMode.DEMO;
    } else if (targetMinutes <= 7) {
      mode = ContentMode.TESTING;
    } else if (targetMinutes <= 17) {
      mode = ContentMode.STANDARD;
    } else {
      mode = ContentMode.FULL;
    }

    // Get base volume for mode
    const baseVolume = this.getVolumeForMode(mode);

    // Adjust for actual time
    const timeFactor = targetMinutes / baseVolume.totalMinutes;
    
    return {
      ...baseVolume,
      totalMinutes: targetMinutes,
      totalQuestions: Math.round(baseVolume.totalQuestions * timeFactor),
      estimatedCompletionTime: targetMinutes
    };
  }

  // ============================================================================
  // MODE CONFIGURATION
  // ============================================================================

  private initializeModeConfigurations(): void {
    // Demo Mode Configuration
    this.modeConfigs.set(ContentMode.DEMO, {
      mode: ContentMode.DEMO,
      totalMinutes: 2,
      questionsPerContainer: 1,
      questionTypeLimits: {
        multiple_choice: 2,
        true_false: 1
      },
      difficultyWeights: {
        easy: 0.7,
        medium: 0.3,
        hard: 0,
        advanced: 0
      },
      features: {
        hintsEnabled: true,
        skipEnabled: true,
        timerEnabled: false,
        adaptiveEnabled: false
      }
    });

    // Testing Mode Configuration
    this.modeConfigs.set(ContentMode.TESTING, {
      mode: ContentMode.TESTING,
      totalMinutes: 5,
      questionsPerContainer: 2,
      questionTypeLimits: {
        multiple_choice: 3,
        true_false: 2,
        numeric: 1,
        counting: 1
      },
      difficultyWeights: {
        easy: 0.4,
        medium: 0.4,
        hard: 0.2,
        advanced: 0
      },
      features: {
        hintsEnabled: true,
        skipEnabled: true,
        timerEnabled: true,
        adaptiveEnabled: false
      }
    });

    // Standard Mode Configuration
    this.modeConfigs.set(ContentMode.STANDARD, {
      mode: ContentMode.STANDARD,
      totalMinutes: 15,
      questionsPerContainer: 5,
      questionTypeLimits: {}, // No limits
      difficultyWeights: {
        easy: 0.25,
        medium: 0.5,
        hard: 0.25,
        advanced: 0
      },
      features: {
        hintsEnabled: true,
        skipEnabled: false,
        timerEnabled: true,
        adaptiveEnabled: true
      }
    });

    // Full Mode Configuration
    this.modeConfigs.set(ContentMode.FULL, {
      mode: ContentMode.FULL,
      totalMinutes: 20,
      questionsPerContainer: 7,
      questionTypeLimits: {}, // No limits
      difficultyWeights: {
        easy: 0.2,
        medium: 0.4,
        hard: 0.3,
        advanced: 0.1
      },
      features: {
        hintsEnabled: true,
        skipEnabled: false,
        timerEnabled: true,
        adaptiveEnabled: true
      }
    });
  }

  private getVolumeForMode(mode: ContentMode): ContentVolume {
    switch (mode) {
      case ContentMode.DEMO:
        return this.calculateDemoVolume();
      case ContentMode.TESTING:
        return this.calculateTestingVolume();
      case ContentMode.STANDARD:
        return this.calculateStandardVolume();
      case ContentMode.FULL:
        return this.calculateFullVolume();
      default:
        return this.calculateStandardVolume();
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  public getModeByTime(minutes: number): ContentMode {
    if (minutes <= 3) return ContentMode.DEMO;
    if (minutes <= 7) return ContentMode.TESTING;
    if (minutes <= 17) return ContentMode.STANDARD;
    return ContentMode.FULL;
  }

  public getTimeByMode(mode: ContentMode): number {
    const times = {
      [ContentMode.DEMO]: 2,
      [ContentMode.TESTING]: 5,
      [ContentMode.STANDARD]: 15,
      [ContentMode.FULL]: 20
    };
    return times[mode];
  }

  public getModeName(mode: ContentMode): string {
    const names = {
      [ContentMode.DEMO]: 'Demo Mode (2 minutes)',
      [ContentMode.TESTING]: 'Testing Mode (5 minutes)',
      [ContentMode.STANDARD]: 'Standard Mode (15 minutes)',
      [ContentMode.FULL]: 'Full Mode (20 minutes)'
    };
    return names[mode];
  }

  public getAllModes(): ContentMode[] {
    return [
      ContentMode.DEMO,
      ContentMode.TESTING,
      ContentMode.STANDARD,
      ContentMode.FULL
    ];
  }
}

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

interface ModeConfiguration {
  mode: ContentMode;
  totalMinutes: number;
  questionsPerContainer: number;
  questionTypeLimits: Partial<Record<QuestionType, number>>;
  difficultyWeights: {
    easy: number;
    medium: number;
    hard: number;
    advanced: number;
  };
  features: {
    hintsEnabled: boolean;
    skipEnabled: boolean;
    timerEnabled: boolean;
    adaptiveEnabled: boolean;
  };
}

// Export singleton instance
export const contentVolumeCalculator = ContentVolumeCalculator.getInstance();

// Export ContentMode for use in other modules
export { ContentMode as Mode } from './ContentVolumeManager';