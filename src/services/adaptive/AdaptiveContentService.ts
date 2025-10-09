/**
 * Adaptive Content Service
 *
 * Manages performance-based content adaptation across containers.
 * Analyzes student performance and adjusts difficulty, scaffolding, and support.
 *
 * Phase 5 Implementation
 */

import type { DataRubric } from '../../types/RubricTypes';
import type { ContainerType, Subject } from '../../types/MasterNarrativeTypes';
import { getRubricStorage } from '../storage/RubricStorageService';

/**
 * Performance metrics for adaptation analysis
 */
export interface PerformanceMetrics {
  score: number;
  attempts: number;
  timeSpent: number; // seconds
  struggledQuestions: string[];
  completedAt: string;
  container: ContainerType;
  subject: Subject;
}

/**
 * Adaptation strategy derived from performance
 */
export interface AdaptationStrategy {
  // Content difficulty
  scenarioComplexity: 'simplified' | 'standard' | 'advanced' | 'expert';
  vocabularyLevel: 'basic' | 'grade-level' | 'advanced';
  conceptDensity: 'sparse' | 'moderate' | 'dense';

  // Scaffolding and support
  supportLevel: 'high-guidance' | 'moderate-guidance' | 'minimal-guidance' | 'independent';
  hintAvailability: 'always-available' | 'on-demand' | 'minimal' | 'none';
  feedbackFrequency: 'after-each' | 'after-section' | 'end-only';
  encouragementTone: 'frequent' | 'standard' | 'minimal';

  // Skill application
  skillApplicationFocus: 'reinforcement' | 'application' | 'creative-application' | 'extension';
  practiceQuantity: 'extra-practice' | 'standard' | 'reduced';

  // Pacing
  recommendedTimeLimit: number | null; // seconds, null = no limit
  breakSuggestions: boolean;

  // Confidence metrics
  reasoning: string; // Explanation of why this strategy was chosen
}

/**
 * Student performance profile across all containers
 */
export interface PerformanceProfile {
  userId: string;
  sessionId: string;

  // Overall metrics
  averageScore: number;
  totalAttempts: number;
  totalTimeSpent: number;
  containersCompleted: number;

  // Per-subject performance
  subjectPerformance: Record<Subject, {
    averageScore: number;
    containersCompleted: number;
    struggledTopics: string[];
  }>;

  // Per-container performance
  containerPerformance: Record<ContainerType, {
    averageScore: number;
    subjectsCompleted: number;
  }>;

  // Learning patterns
  learningVelocity: 'slow' | 'moderate' | 'fast'; // Based on time spent vs. score
  consistencyPattern: 'consistent' | 'variable' | 'improving' | 'declining';
  strengthAreas: Subject[];
  challengeAreas: Subject[];
}

/**
 * Adaptive Content Service
 * Analyzes performance and determines content adaptations
 */
export class AdaptiveContentService {
  private static instance: AdaptiveContentService;
  private rubricStorage = getRubricStorage();

  private constructor() {}

  public static getInstance(): AdaptiveContentService {
    if (!AdaptiveContentService.instance) {
      AdaptiveContentService.instance = new AdaptiveContentService();
    }
    return AdaptiveContentService.instance;
  }

  /**
   * Analyze performance and generate adaptation strategy
   * Main entry point for adaptive content
   */
  async generateAdaptationStrategy(
    sessionId: string,
    completedMetrics: PerformanceMetrics,
    nextContainer: ContainerType,
    nextSubject: Subject
  ): Promise<AdaptationStrategy> {
    console.log(`🎯 [Adaptive] Generating strategy for ${nextContainer}-${nextSubject}`);

    try {
      // Build performance profile
      const profile = await this.buildPerformanceProfile(sessionId);

      // Analyze completed performance
      const performanceLevel = this.analyzePerformanceLevel(completedMetrics);

      // Determine adaptation based on multiple factors
      const strategy = this.determineAdaptationStrategy(
        completedMetrics,
        profile,
        performanceLevel,
        nextContainer,
        nextSubject
      );

      console.log(`✅ [Adaptive] Strategy generated:`, strategy.scenarioComplexity);

      return strategy;

    } catch (error) {
      console.error('❌ [Adaptive] Failed to generate strategy:', error);

      // Fallback to standard difficulty
      return this.getStandardStrategy('Error generating strategy - using defaults');
    }
  }

  /**
   * Build comprehensive performance profile from session history
   */
  async buildPerformanceProfile(sessionId: string): Promise<PerformanceProfile> {
    console.log(`📊 [Adaptive] Building performance profile: ${sessionId}`);

    try {
      // Fetch all data rubrics for session
      const allRubrics = await this.rubricStorage.getAllDataRubrics(sessionId);

      // Filter to only completed rubrics
      const completedRubrics = allRubrics.filter(r => r.performance !== null);

      if (completedRubrics.length === 0) {
        // No history - return default profile
        return this.getDefaultProfile(sessionId);
      }

      // Calculate overall metrics
      const totalScore = completedRubrics.reduce((sum, r) => sum + (r.performance?.score || 0), 0);
      const averageScore = totalScore / completedRubrics.length;
      const totalAttempts = completedRubrics.reduce((sum, r) => sum + (r.performance?.attempts || 0), 0);
      const totalTimeSpent = completedRubrics.reduce((sum, r) => sum + (r.performance?.timeSpent || 0), 0);

      // Calculate per-subject performance
      const subjectPerformance: Record<Subject, any> = {
        'Math': { averageScore: 0, containersCompleted: 0, struggledTopics: [] },
        'ELA': { averageScore: 0, containersCompleted: 0, struggledTopics: [] },
        'Science': { averageScore: 0, containersCompleted: 0, struggledTopics: [] },
        'Social Studies': { averageScore: 0, containersCompleted: 0, struggledTopics: [] }
      };

      for (const rubric of completedRubrics) {
        const subject = rubric.subject;
        subjectPerformance[subject].averageScore += rubric.performance?.score || 0;
        subjectPerformance[subject].containersCompleted++;
        subjectPerformance[subject].struggledTopics.push(...(rubric.performance?.struggledQuestions || []));
      }

      // Average the subject scores
      for (const subject of Object.keys(subjectPerformance) as Subject[]) {
        if (subjectPerformance[subject].containersCompleted > 0) {
          subjectPerformance[subject].averageScore /= subjectPerformance[subject].containersCompleted;
        }
      }

      // Calculate per-container performance
      const containerPerformance: Record<ContainerType, any> = {
        'LEARN': { averageScore: 0, subjectsCompleted: 0 },
        'EXPERIENCE': { averageScore: 0, subjectsCompleted: 0 },
        'DISCOVER': { averageScore: 0, subjectsCompleted: 0 }
      };

      for (const rubric of completedRubrics) {
        const container = rubric.container;
        containerPerformance[container].averageScore += rubric.performance?.score || 0;
        containerPerformance[container].subjectsCompleted++;
      }

      // Average the container scores
      for (const container of Object.keys(containerPerformance) as ContainerType[]) {
        if (containerPerformance[container].subjectsCompleted > 0) {
          containerPerformance[container].averageScore /= containerPerformance[container].subjectsCompleted;
        }
      }

      // Determine learning patterns
      const learningVelocity = this.calculateLearningVelocity(completedRubrics);
      const consistencyPattern = this.calculateConsistencyPattern(completedRubrics);
      const strengthAreas = this.identifyStrengthAreas(subjectPerformance);
      const challengeAreas = this.identifyChallengeAreas(subjectPerformance);

      const profile: PerformanceProfile = {
        userId: completedRubrics[0]?.skill.gradeLevel || 'unknown',
        sessionId,
        averageScore,
        totalAttempts,
        totalTimeSpent,
        containersCompleted: completedRubrics.length,
        subjectPerformance,
        containerPerformance,
        learningVelocity,
        consistencyPattern,
        strengthAreas,
        challengeAreas
      };

      console.log(`✅ [Adaptive] Profile built:`, {
        averageScore: profile.averageScore.toFixed(1),
        velocity: profile.learningVelocity,
        pattern: profile.consistencyPattern
      });

      return profile;

    } catch (error) {
      console.error('❌ [Adaptive] Failed to build profile:', error);
      return this.getDefaultProfile(sessionId);
    }
  }

  /**
   * Analyze performance level from metrics
   */
  private analyzePerformanceLevel(metrics: PerformanceMetrics): 'struggling' | 'developing' | 'proficient' | 'advanced' {
    const { score, attempts, timeSpent } = metrics;

    // Multi-factor analysis
    if (score >= 90 && attempts <= 2) {
      return 'advanced';
    } else if (score >= 75 && attempts <= 3) {
      return 'proficient';
    } else if (score >= 60 || attempts <= 4) {
      return 'developing';
    } else {
      return 'struggling';
    }
  }

  /**
   * Determine adaptation strategy based on multiple factors
   */
  private determineAdaptationStrategy(
    completedMetrics: PerformanceMetrics,
    profile: PerformanceProfile,
    performanceLevel: 'struggling' | 'developing' | 'proficient' | 'advanced',
    nextContainer: ContainerType,
    nextSubject: Subject
  ): AdaptationStrategy {
    console.log(`🎯 [Adaptive] Determining strategy for ${performanceLevel} learner`);

    // Base strategy on performance level
    let strategy: AdaptationStrategy;

    switch (performanceLevel) {
      case 'struggling':
        strategy = {
          scenarioComplexity: 'simplified',
          vocabularyLevel: 'basic',
          conceptDensity: 'sparse',
          supportLevel: 'high-guidance',
          hintAvailability: 'always-available',
          feedbackFrequency: 'after-each',
          encouragementTone: 'frequent',
          skillApplicationFocus: 'reinforcement',
          practiceQuantity: 'extra-practice',
          recommendedTimeLimit: null, // No time pressure
          breakSuggestions: true,
          reasoning: `Student scored ${completedMetrics.score}% with ${completedMetrics.attempts} attempts. Providing high support and simplified content.`
        };
        break;

      case 'developing':
        strategy = {
          scenarioComplexity: 'standard',
          vocabularyLevel: 'grade-level',
          conceptDensity: 'moderate',
          supportLevel: 'moderate-guidance',
          hintAvailability: 'on-demand',
          feedbackFrequency: 'after-section',
          encouragementTone: 'standard',
          skillApplicationFocus: 'application',
          practiceQuantity: 'standard',
          recommendedTimeLimit: null,
          breakSuggestions: completedMetrics.timeSpent > 600, // Suggest breaks if over 10 min
          reasoning: `Student scored ${completedMetrics.score}% with moderate performance. Using grade-appropriate content.`
        };
        break;

      case 'proficient':
        strategy = {
          scenarioComplexity: 'standard',
          vocabularyLevel: 'grade-level',
          conceptDensity: 'moderate',
          supportLevel: 'minimal-guidance',
          hintAvailability: 'on-demand',
          feedbackFrequency: 'after-section',
          encouragementTone: 'minimal',
          skillApplicationFocus: 'creative-application',
          practiceQuantity: 'standard',
          recommendedTimeLimit: null,
          breakSuggestions: false,
          reasoning: `Student scored ${completedMetrics.score}% efficiently. Providing opportunities for creative application.`
        };
        break;

      case 'advanced':
        strategy = {
          scenarioComplexity: 'advanced',
          vocabularyLevel: 'advanced',
          conceptDensity: 'dense',
          supportLevel: 'independent',
          hintAvailability: 'minimal',
          feedbackFrequency: 'end-only',
          encouragementTone: 'minimal',
          skillApplicationFocus: 'extension',
          practiceQuantity: 'reduced',
          recommendedTimeLimit: null,
          breakSuggestions: false,
          reasoning: `Student excelled with ${completedMetrics.score}% on first/second attempt. Providing challenging extension activities.`
        };
        break;
    }

    // Adjust based on subject-specific performance
    const subjectHistory = profile.subjectPerformance[nextSubject];
    if (subjectHistory && subjectHistory.containersCompleted > 0) {
      if (subjectHistory.averageScore < 70 && performanceLevel !== 'struggling') {
        // Student struggles with this subject - increase support
        strategy.supportLevel = 'moderate-guidance';
        strategy.hintAvailability = 'always-available';
        strategy.reasoning += ` Increased support due to lower ${nextSubject} average (${subjectHistory.averageScore.toFixed(1)}%).`;
      } else if (subjectHistory.averageScore >= 90) {
        // Student excels in this subject - reduce scaffolding
        strategy.supportLevel = 'minimal-guidance';
        strategy.hintAvailability = 'minimal';
        strategy.reasoning += ` Reduced scaffolding due to strong ${nextSubject} performance (${subjectHistory.averageScore.toFixed(1)}%).`;
      }
    }

    // Adjust based on learning velocity
    if (profile.learningVelocity === 'slow' && performanceLevel !== 'struggling') {
      strategy.breakSuggestions = true;
      strategy.feedbackFrequency = 'after-each';
      strategy.reasoning += ' Added breaks and frequent feedback for slower pacing.';
    } else if (profile.learningVelocity === 'fast' && performanceLevel !== 'advanced') {
      strategy.practiceQuantity = 'reduced';
      strategy.reasoning += ' Reduced practice quantity for fast learner.';
    }

    // Adjust based on consistency pattern
    if (profile.consistencyPattern === 'variable') {
      strategy.feedbackFrequency = 'after-section';
      strategy.encouragementTone = 'standard';
      strategy.reasoning += ' Consistent feedback for variable performance.';
    }

    return strategy;
  }

  /**
   * Apply adaptation strategy to Data Rubric
   * Updates rubric with adaptive parameters
   */
  async applyAdaptationToRubric(
    sessionId: string,
    container: ContainerType,
    subject: Subject,
    strategy: AdaptationStrategy
  ): Promise<void> {
    console.log(`🔄 [Adaptive] Applying strategy to ${container}-${subject}`);

    try {
      // Fetch rubric
      const rubric = await this.rubricStorage.getDataRubric(sessionId, container, subject);

      if (!rubric) {
        console.error(`❌ [Adaptive] Rubric not found: ${container}-${subject}`);
        return;
      }

      // Update rubric with adaptation data
      const updatedRubric: DataRubric = {
        ...rubric,
        adaptationData: {
          strategy,
          appliedAt: new Date().toISOString()
        } as any
      };

      // Save updated rubric
      await this.rubricStorage.updateDataRubric(updatedRubric);

      console.log(`✅ [Adaptive] Strategy applied to ${container}-${subject}`);

    } catch (error) {
      console.error('❌ [Adaptive] Failed to apply strategy:', error);
    }
  }

  /**
   * Calculate learning velocity from rubric history
   */
  private calculateLearningVelocity(rubrics: DataRubric[]): 'slow' | 'moderate' | 'fast' {
    const avgTime = rubrics.reduce((sum, r) => sum + (r.performance?.timeSpent || 0), 0) / rubrics.length;
    const avgScore = rubrics.reduce((sum, r) => sum + (r.performance?.score || 0), 0) / rubrics.length;

    // Fast: High score + low time
    if (avgScore >= 80 && avgTime < 300) return 'fast';

    // Slow: Lower score + high time
    if (avgScore < 70 || avgTime > 600) return 'slow';

    return 'moderate';
  }

  /**
   * Calculate consistency pattern from score variance
   */
  private calculateConsistencyPattern(rubrics: DataRubric[]): 'consistent' | 'variable' | 'improving' | 'declining' {
    if (rubrics.length < 2) return 'consistent';

    const scores = rubrics.map(r => r.performance?.score || 0);
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

    // Calculate variance
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Check trend
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 10) return 'improving';
    if (secondAvg < firstAvg - 10) return 'declining';
    if (stdDev > 15) return 'variable';
    return 'consistent';
  }

  /**
   * Identify strength areas (subjects with high performance)
   */
  private identifyStrengthAreas(subjectPerformance: Record<Subject, any>): Subject[] {
    return (Object.keys(subjectPerformance) as Subject[]).filter(
      subject => subjectPerformance[subject].averageScore >= 80
    );
  }

  /**
   * Identify challenge areas (subjects with lower performance)
   */
  private identifyChallengeAreas(subjectPerformance: Record<Subject, any>): Subject[] {
    return (Object.keys(subjectPerformance) as Subject[]).filter(
      subject => subjectPerformance[subject].averageScore < 70 && subjectPerformance[subject].containersCompleted > 0
    );
  }

  /**
   * Get standard difficulty strategy (fallback)
   */
  private getStandardStrategy(reason: string): AdaptationStrategy {
    return {
      scenarioComplexity: 'standard',
      vocabularyLevel: 'grade-level',
      conceptDensity: 'moderate',
      supportLevel: 'moderate-guidance',
      hintAvailability: 'on-demand',
      feedbackFrequency: 'after-section',
      encouragementTone: 'standard',
      skillApplicationFocus: 'application',
      practiceQuantity: 'standard',
      recommendedTimeLimit: null,
      breakSuggestions: false,
      reasoning: reason
    };
  }

  /**
   * Get default performance profile (no history)
   */
  private getDefaultProfile(sessionId: string): PerformanceProfile {
    return {
      userId: 'unknown',
      sessionId,
      averageScore: 0,
      totalAttempts: 0,
      totalTimeSpent: 0,
      containersCompleted: 0,
      subjectPerformance: {
        'Math': { averageScore: 0, containersCompleted: 0, struggledTopics: [] },
        'ELA': { averageScore: 0, containersCompleted: 0, struggledTopics: [] },
        'Science': { averageScore: 0, containersCompleted: 0, struggledTopics: [] },
        'Social Studies': { averageScore: 0, containersCompleted: 0, struggledTopics: [] }
      },
      containerPerformance: {
        'LEARN': { averageScore: 0, subjectsCompleted: 0 },
        'EXPERIENCE': { averageScore: 0, subjectsCompleted: 0 },
        'DISCOVER': { averageScore: 0, subjectsCompleted: 0 }
      },
      learningVelocity: 'moderate',
      consistencyPattern: 'consistent',
      strengthAreas: [],
      challengeAreas: []
    };
  }
}

// Export singleton instance getter
export const getAdaptiveContentService = () => AdaptiveContentService.getInstance();
