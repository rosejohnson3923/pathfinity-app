/**
 * PerformanceTracker
 * 
 * Tracks and analyzes user performance in real-time, providing insights
 * and recommendations for adaptive content generation.
 */

import { QuestionType, Subject, Grade, Skill } from '../../types';
import { getSessionStateManager } from './SessionStateManager';

/**
 * Performance data for a single question
 */
export interface PerformanceData {
  questionId: string;
  type: QuestionType;
  subject: Subject;
  skill: Skill;
  difficulty: 'easy' | 'medium' | 'hard';
  correct: boolean;
  timeSpent: number; // seconds
  hintsUsed: number;
  attempts: number;
  timestamp: Date;
  containerId: string;
  xpEarned: number;
}

/**
 * Performance pattern detected
 */
export interface PerformancePattern {
  pattern: string;
  frequency: number;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-1
  recommendation: string;
  affectedSkills: string[];
  examples: PerformanceData[];
}

/**
 * Adaptation recommendation
 */
export interface AdaptationRecommendation {
  type: 'difficulty' | 'quantity' | 'questionType' | 'time' | 'hints' | 'visuals';
  action: 'increase' | 'decrease' | 'maintain' | 'change';
  target?: any;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  expectedImpact: string;
  confidence: number;
}

/**
 * Skill mastery information
 */
export interface SkillMastery {
  skillId: string;
  skillName: string;
  masteryLevel: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  recentPerformance: number;
  totalAttempts: number;
  successRate: number;
  averageTime: number;
  lastPracticed: Date;
  subSkills?: Map<string, number>;
}

/**
 * Performance analytics
 */
export interface PerformanceAnalytics {
  overallTrend: 'improving' | 'stable' | 'declining';
  strengths: SkillMastery[];
  weaknesses: SkillMastery[];
  recommendations: AdaptationRecommendation[];
  patterns: PerformancePattern[];
  insights: PerformanceInsight[];
  predictedDifficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Performance insight
 */
export interface PerformanceInsight {
  type: 'achievement' | 'warning' | 'tip' | 'milestone';
  message: string;
  icon?: string;
  actionable: boolean;
  action?: string;
  priority: number;
}

/**
 * Time analysis
 */
export interface TimeAnalysis {
  averageTimePerQuestion: number;
  fastestQuestionType: QuestionType;
  slowestQuestionType: QuestionType;
  optimalTimeRange: { min: number; max: number };
  timeDistribution: Map<QuestionType, number>;
  rushingIndicator: boolean;
  overthinkingIndicator: boolean;
}

/**
 * Error analysis
 */
export interface ErrorAnalysis {
  commonErrorTypes: ErrorType[];
  errorPatterns: Map<string, number>;
  conceptualGaps: string[];
  proceduralErrors: string[];
  carelessMistakes: number;
  systematicErrors: number;
}

/**
 * Error type classification
 */
export interface ErrorType {
  category: 'conceptual' | 'procedural' | 'careless' | 'misunderstanding';
  frequency: number;
  examples: string[];
  suggestedRemedy: string;
}

/**
 * Service for tracking and analyzing performance
 */
export class PerformanceTracker {
  private static instance: PerformanceTracker;
  
  // Performance data storage
  private performanceHistory: Map<string, PerformanceData[]> = new Map();
  private skillMastery: Map<string, Map<string, SkillMastery>> = new Map();
  private patterns: Map<string, PerformancePattern[]> = new Map();
  
  // Analysis caches
  private analysisCache: Map<string, PerformanceAnalytics> = new Map();
  private timeAnalysisCache: Map<string, TimeAnalysis> = new Map();
  private errorAnalysisCache: Map<string, ErrorAnalysis> = new Map();
  
  // Configuration
  private readonly MAX_HISTORY_SIZE = 1000;
  private readonly PATTERN_MIN_FREQUENCY = 3;
  private readonly MASTERY_THRESHOLD = 80;
  private readonly WEAKNESS_THRESHOLD = 60;
  private readonly CACHE_TTL = 300000; // 5 minutes
  
  // Real-time tracking
  private currentSession: Map<string, any> = new Map();
  private realtimeMetrics: Map<string, any> = new Map();

  private constructor() {
    this.restoreHistory();
    this.setupAnalysisJobs();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  /**
   * Track question performance
   */
  public trackQuestionPerformance(
    userId: string,
    question: any,
    result: {
      correct: boolean;
      timeSpent: number;
      hintsUsed: number;
      attempts: number;
    }
  ): void {
    const performanceData: PerformanceData = {
      questionId: question.id || `q-${Date.now()}`,
      type: question.type,
      subject: question.subject,
      skill: question.skill,
      difficulty: question.difficulty || 'medium',
      correct: result.correct,
      timeSpent: result.timeSpent,
      hintsUsed: result.hintsUsed,
      attempts: result.attempts,
      timestamp: new Date(),
      containerId: question.containerId || 'unknown',
      xpEarned: this.calculateXP(result, question.difficulty)
    };

    // Store performance data
    this.addPerformanceData(userId, performanceData);
    
    // Update skill mastery
    this.updateSkillMastery(userId, performanceData);
    
    // Update session state
    getSessionStateManager().updateQuestionPerformance(
      userId,
      performanceData.questionId,
      result.correct,
      result.timeSpent,
      result.hintsUsed,
      performanceData.xpEarned
    );

    // Detect patterns in real-time
    this.detectRealtimePatterns(userId, performanceData);
    
    // Clear analysis cache
    this.clearUserCache(userId);

    console.log('[Performance] Tracked:', {
      user: userId,
      correct: result.correct,
      time: result.timeSpent,
      skill: question.skill?.name
    });
  }

  /**
   * Analyze performance patterns
   */
  public analyzePatterns(
    performanceData: PerformanceData[]
  ): PerformancePattern[] {
    const patterns: PerformancePattern[] = [];

    // Time-based patterns
    const timePattern = this.analyzeTimePatterns(performanceData);
    if (timePattern) patterns.push(timePattern);

    // Accuracy patterns
    const accuracyPattern = this.analyzeAccuracyPatterns(performanceData);
    if (accuracyPattern) patterns.push(accuracyPattern);

    // Question type patterns
    const typePattern = this.analyzeQuestionTypePatterns(performanceData);
    if (typePattern) patterns.push(typePattern);

    // Hint usage patterns
    const hintPattern = this.analyzeHintPatterns(performanceData);
    if (hintPattern) patterns.push(hintPattern);

    // Subject-specific patterns
    const subjectPattern = this.analyzeSubjectPatterns(performanceData);
    if (subjectPattern) patterns.push(subjectPattern);

    // Streak patterns
    const streakPattern = this.analyzeStreakPatterns(performanceData);
    if (streakPattern) patterns.push(streakPattern);

    return patterns;
  }

  /**
   * Get adaptation recommendations
   */
  public getAdaptationRecommendations(userId: string): AdaptationRecommendation[] {
    const recommendations: AdaptationRecommendation[] = [];
    const analytics = this.getPerformanceAnalytics(userId);

    // Difficulty recommendations
    if (analytics.overallTrend === 'improving') {
      recommendations.push({
        type: 'difficulty',
        action: 'increase',
        priority: 'medium',
        reason: 'Consistent improvement detected',
        expectedImpact: 'Challenge student appropriately',
        confidence: 0.8
      });
    } else if (analytics.overallTrend === 'declining') {
      recommendations.push({
        type: 'difficulty',
        action: 'decrease',
        priority: 'high',
        reason: 'Performance decline detected',
        expectedImpact: 'Build confidence',
        confidence: 0.85
      });
    }

    // Quantity recommendations
    const timeAnalysis = this.getTimeAnalysis(userId);
    if (timeAnalysis.rushingIndicator) {
      recommendations.push({
        type: 'quantity',
        action: 'decrease',
        priority: 'medium',
        reason: 'Student appears to be rushing',
        expectedImpact: 'Improve accuracy',
        confidence: 0.75
      });
    } else if (timeAnalysis.averageTimePerQuestion < 20) {
      recommendations.push({
        type: 'quantity',
        action: 'increase',
        priority: 'low',
        reason: 'Fast completion rate',
        expectedImpact: 'Maintain engagement',
        confidence: 0.7
      });
    }

    // Question type recommendations
    const weakTypes = this.getWeakQuestionTypes(userId);
    if (weakTypes.length > 0) {
      recommendations.push({
        type: 'questionType',
        action: 'change',
        target: weakTypes[0],
        priority: 'high',
        reason: `Struggling with ${weakTypes[0]} questions`,
        expectedImpact: 'Target specific weakness',
        confidence: 0.9
      });
    }

    // Hint recommendations
    const hintUsage = this.getHintUsageRate(userId);
    if (hintUsage > 0.5) {
      recommendations.push({
        type: 'hints',
        action: 'increase',
        priority: 'medium',
        reason: 'High hint dependency',
        expectedImpact: 'Provide needed support',
        confidence: 0.8
      });
    }

    // Visual recommendations (for younger grades)
    const userHistory = this.performanceHistory.get(userId);
    if (userHistory && this.needsVisualSupport(userHistory)) {
      recommendations.push({
        type: 'visuals',
        action: 'increase',
        priority: 'medium',
        reason: 'Visual learning preference detected',
        expectedImpact: 'Improve comprehension',
        confidence: 0.7
      });
    }

    return recommendations;
  }

  /**
   * Get user strengths
   */
  public getStrengths(userId: string): SkillMastery[] {
    const userMastery = this.skillMastery.get(userId);
    if (!userMastery) return [];

    return Array.from(userMastery.values())
      .filter(skill => skill.masteryLevel >= this.MASTERY_THRESHOLD)
      .sort((a, b) => b.masteryLevel - a.masteryLevel)
      .slice(0, 5);
  }

  /**
   * Get user weaknesses
   */
  public getWeaknesses(userId: string): SkillMastery[] {
    const userMastery = this.skillMastery.get(userId);
    if (!userMastery) return [];

    return Array.from(userMastery.values())
      .filter(skill => skill.masteryLevel < this.WEAKNESS_THRESHOLD)
      .sort((a, b) => a.masteryLevel - b.masteryLevel)
      .slice(0, 5);
  }

  /**
   * Calculate skill mastery
   */
  public calculateMastery(userId: string, skillId: string): number {
    const userMastery = this.skillMastery.get(userId);
    if (!userMastery) return 0;

    const mastery = userMastery.get(skillId);
    return mastery?.masteryLevel || 0;
  }

  /**
   * Get performance analytics
   */
  public getPerformanceAnalytics(userId: string): PerformanceAnalytics {
    // Check cache
    const cached = this.analysisCache.get(userId);
    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    const userHistory = this.performanceHistory.get(userId) || [];
    
    // Analyze patterns
    const patterns = this.analyzePatterns(userHistory);
    
    // Get strengths and weaknesses
    const strengths = this.getStrengths(userId);
    const weaknesses = this.getWeaknesses(userId);
    
    // Get recommendations
    const recommendations = this.getAdaptationRecommendations(userId);
    
    // Determine overall trend
    const overallTrend = this.calculateOverallTrend(userHistory);
    
    // Generate insights
    const insights = this.generateInsights(userHistory, patterns);
    
    // Predict difficulty
    const predictedDifficulty = this.predictOptimalDifficulty(userHistory);

    const analytics: PerformanceAnalytics = {
      overallTrend,
      strengths,
      weaknesses,
      recommendations,
      patterns,
      insights,
      predictedDifficulty
    };

    // Cache results
    this.analysisCache.set(userId, analytics);
    
    return analytics;
  }

  /**
   * Get time analysis
   */
  public getTimeAnalysis(userId: string): TimeAnalysis {
    // Check cache
    const cached = this.timeAnalysisCache.get(userId);
    if (cached) return cached;

    const userHistory = this.performanceHistory.get(userId) || [];
    
    // Calculate time metrics
    const timeDistribution = new Map<QuestionType, number>();
    let totalTime = 0;
    let count = 0;
    let fastestType: QuestionType = 'multiple_choice';
    let slowestType: QuestionType = 'multiple_choice';
    let fastestTime = Infinity;
    let slowestTime = 0;

    userHistory.forEach(data => {
      const currentAvg = timeDistribution.get(data.type) || 0;
      const currentCount = userHistory.filter(d => d.type === data.type).length;
      timeDistribution.set(
        data.type,
        (currentAvg * (currentCount - 1) + data.timeSpent) / currentCount
      );

      totalTime += data.timeSpent;
      count++;

      const typeAvg = timeDistribution.get(data.type) || 0;
      if (typeAvg < fastestTime) {
        fastestTime = typeAvg;
        fastestType = data.type;
      }
      if (typeAvg > slowestTime) {
        slowestTime = typeAvg;
        slowestType = data.type;
      }
    });

    const averageTime = count > 0 ? totalTime / count : 0;
    
    // Determine if rushing or overthinking
    const recentData = userHistory.slice(-20);
    const rushingIndicator = this.detectRushing(recentData);
    const overthinkingIndicator = this.detectOverthinking(recentData);

    const analysis: TimeAnalysis = {
      averageTimePerQuestion: averageTime,
      fastestQuestionType: fastestType,
      slowestQuestionType: slowestType,
      optimalTimeRange: { min: 20, max: 90 }, // seconds
      timeDistribution,
      rushingIndicator,
      overthinkingIndicator
    };

    // Cache results
    this.timeAnalysisCache.set(userId, analysis);
    
    return analysis;
  }

  /**
   * Get error analysis
   */
  public getErrorAnalysis(userId: string): ErrorAnalysis {
    // Check cache
    const cached = this.errorAnalysisCache.get(userId);
    if (cached) return cached;

    const userHistory = this.performanceHistory.get(userId) || [];
    const errors = userHistory.filter(d => !d.correct);
    
    // Classify errors
    const errorTypes = this.classifyErrors(errors);
    
    // Find error patterns
    const errorPatterns = new Map<string, number>();
    errors.forEach(error => {
      const pattern = `${error.type}-${error.difficulty}`;
      errorPatterns.set(pattern, (errorPatterns.get(pattern) || 0) + 1);
    });

    // Identify gaps
    const conceptualGaps = this.identifyConceptualGaps(errors);
    const proceduralErrors = this.identifyProceduralErrors(errors);
    
    // Count mistake types
    const carelessMistakes = errorTypes.filter(e => e.category === 'careless').length;
    const systematicErrors = errorTypes.filter(e => e.category === 'conceptual').length;

    const analysis: ErrorAnalysis = {
      commonErrorTypes: errorTypes,
      errorPatterns,
      conceptualGaps,
      proceduralErrors,
      carelessMistakes,
      systematicErrors
    };

    // Cache results
    this.errorAnalysisCache.set(userId, analysis);
    
    return analysis;
  }

  /**
   * Get performance trend
   */
  public getPerformanceTrend(
    userId: string,
    period: 'session' | 'daily' | 'weekly'
  ): 'improving' | 'stable' | 'declining' {
    const userHistory = this.performanceHistory.get(userId) || [];
    if (userHistory.length < 10) return 'stable';

    // Get relevant time window
    const now = new Date();
    const windowMs = period === 'session' ? 3600000 : // 1 hour
                    period === 'daily' ? 86400000 : // 1 day
                    604800000; // 1 week
    
    const recentData = userHistory.filter(d => 
      now.getTime() - d.timestamp.getTime() < windowMs
    );

    if (recentData.length < 5) return 'stable';

    // Calculate trend
    const firstHalf = recentData.slice(0, Math.floor(recentData.length / 2));
    const secondHalf = recentData.slice(Math.floor(recentData.length / 2));

    const firstAccuracy = this.calculateAccuracy(firstHalf);
    const secondAccuracy = this.calculateAccuracy(secondHalf);

    if (secondAccuracy > firstAccuracy + 10) return 'improving';
    if (secondAccuracy < firstAccuracy - 10) return 'declining';
    return 'stable';
  }

  /**
   * Get mastery progress
   */
  public getMasteryProgress(userId: string): Map<string, number> {
    const userMastery = this.skillMastery.get(userId) || new Map();
    const progress = new Map<string, number>();
    
    userMastery.forEach((mastery, skillId) => {
      progress.set(skillId, mastery.masteryLevel);
    });

    return progress;
  }

  /**
   * Predict next question difficulty
   */
  public predictNextDifficulty(userId: string): 'easy' | 'medium' | 'hard' {
    const analytics = this.getPerformanceAnalytics(userId);
    return analytics.predictedDifficulty;
  }

  /**
   * Export performance data
   */
  public exportPerformanceData(userId: string): any {
    return {
      history: this.performanceHistory.get(userId) || [],
      mastery: Array.from(this.skillMastery.get(userId)?.entries() || []),
      analytics: this.getPerformanceAnalytics(userId),
      timeAnalysis: this.getTimeAnalysis(userId),
      errorAnalysis: this.getErrorAnalysis(userId),
      exported: new Date().toISOString()
    };
  }

  /**
   * Add performance data
   */
  private addPerformanceData(userId: string, data: PerformanceData): void {
    if (!this.performanceHistory.has(userId)) {
      this.performanceHistory.set(userId, []);
    }

    const history = this.performanceHistory.get(userId)!;
    history.push(data);

    // Maintain max size
    if (history.length > this.MAX_HISTORY_SIZE) {
      history.shift();
    }

    // Persist to storage
    this.persistUserHistory(userId);
  }

  /**
   * Update skill mastery
   */
  private updateSkillMastery(userId: string, data: PerformanceData): void {
    if (!this.skillMastery.has(userId)) {
      this.skillMastery.set(userId, new Map());
    }

    const userMastery = this.skillMastery.get(userId)!;
    const skillId = data.skill?.id || 'unknown';
    
    let mastery = userMastery.get(skillId);
    if (!mastery) {
      mastery = {
        skillId,
        skillName: data.skill?.name || 'Unknown',
        masteryLevel: 50,
        trend: 'stable',
        recentPerformance: 0,
        totalAttempts: 0,
        successRate: 0,
        averageTime: 0,
        lastPracticed: new Date(),
        subSkills: new Map()
      };
      userMastery.set(skillId, mastery);
    }

    // Update mastery metrics
    mastery.totalAttempts++;
    mastery.lastPracticed = new Date();
    
    // Update success rate
    const prevSuccessRate = mastery.successRate;
    mastery.successRate = ((prevSuccessRate * (mastery.totalAttempts - 1)) + 
                          (data.correct ? 100 : 0)) / mastery.totalAttempts;
    
    // Update average time
    mastery.averageTime = ((mastery.averageTime * (mastery.totalAttempts - 1)) + 
                          data.timeSpent) / mastery.totalAttempts;
    
    // Update mastery level using ELO-like system
    const k = 32; // Learning rate
    const expected = mastery.masteryLevel / 100;
    const actual = data.correct ? 1 : 0;
    const delta = k * (actual - expected);
    
    mastery.masteryLevel = Math.max(0, Math.min(100, mastery.masteryLevel + delta));
    
    // Update trend
    mastery.trend = this.calculateMasteryTrend(userId, skillId);
    
    // Update recent performance
    const recentHistory = this.performanceHistory.get(userId)?.filter(d => 
      d.skill?.id === skillId
    ).slice(-10) || [];
    mastery.recentPerformance = this.calculateAccuracy(recentHistory);
  }

  /**
   * Calculate mastery trend
   */
  private calculateMasteryTrend(
    userId: string,
    skillId: string
  ): 'improving' | 'stable' | 'declining' {
    const history = this.performanceHistory.get(userId) || [];
    const skillHistory = history.filter(d => d.skill?.id === skillId);
    
    if (skillHistory.length < 5) return 'stable';
    
    const recent = skillHistory.slice(-5);
    const previous = skillHistory.slice(-10, -5);
    
    if (previous.length === 0) return 'stable';
    
    const recentAccuracy = this.calculateAccuracy(recent);
    const previousAccuracy = this.calculateAccuracy(previous);
    
    if (recentAccuracy > previousAccuracy + 10) return 'improving';
    if (recentAccuracy < previousAccuracy - 10) return 'declining';
    return 'stable';
  }

  /**
   * Detect realtime patterns
   */
  private detectRealtimePatterns(userId: string, data: PerformanceData): void {
    const history = this.performanceHistory.get(userId) || [];
    const recent = history.slice(-10);
    
    // Check for streak patterns
    if (recent.length >= 3) {
      const lastThree = recent.slice(-3);
      if (lastThree.every(d => d.correct)) {
        console.log('[Performance] Hot streak detected!');
      } else if (lastThree.every(d => !d.correct)) {
        console.log('[Performance] Struggling pattern detected');
      }
    }
    
    // Check for time patterns
    if (data.timeSpent < 5 && !data.correct) {
      console.log('[Performance] Rushing detected');
    } else if (data.timeSpent > 180) {
      console.log('[Performance] Overthinking detected');
    }
  }

  /**
   * Calculate XP earned
   */
  private calculateXP(
    result: { correct: boolean; hintsUsed: number; attempts: number },
    difficulty: string
  ): number {
    let xp = 0;
    
    if (result.correct) {
      // Base XP by difficulty
      const baseXP = {
        'easy': 10,
        'medium': 20,
        'hard': 30
      };
      xp = baseXP[difficulty as keyof typeof baseXP] || 20;
      
      // Bonus for no hints
      if (result.hintsUsed === 0) {
        xp += 5;
      }
      
      // Bonus for first attempt
      if (result.attempts === 1) {
        xp += 5;
      }
      
      // Penalty for multiple attempts
      xp -= (result.attempts - 1) * 2;
      
      // Penalty for hints
      xp -= result.hintsUsed * 2;
    } else {
      // Partial XP for trying
      xp = 2;
    }
    
    return Math.max(0, xp);
  }

  /**
   * Analyze time patterns
   */
  private analyzeTimePatterns(data: PerformanceData[]): PerformancePattern | null {
    if (data.length < this.PATTERN_MIN_FREQUENCY) return null;
    
    const avgTime = data.reduce((sum, d) => sum + d.timeSpent, 0) / data.length;
    
    if (avgTime < 10) {
      return {
        pattern: 'rushing',
        frequency: data.filter(d => d.timeSpent < 10).length,
        impact: 'negative',
        confidence: 0.8,
        recommendation: 'Slow down and read questions carefully',
        affectedSkills: [...new Set(data.map(d => d.skill?.id || ''))],
        examples: data.slice(0, 3)
      };
    } else if (avgTime > 120) {
      return {
        pattern: 'overthinking',
        frequency: data.filter(d => d.timeSpent > 120).length,
        impact: 'negative',
        confidence: 0.7,
        recommendation: 'Trust your first instinct',
        affectedSkills: [...new Set(data.map(d => d.skill?.id || ''))],
        examples: data.slice(0, 3)
      };
    }
    
    return null;
  }

  /**
   * Analyze accuracy patterns
   */
  private analyzeAccuracyPatterns(data: PerformanceData[]): PerformancePattern | null {
    if (data.length < this.PATTERN_MIN_FREQUENCY) return null;
    
    const accuracy = this.calculateAccuracy(data);
    
    if (accuracy > 90) {
      return {
        pattern: 'high_accuracy',
        frequency: data.filter(d => d.correct).length,
        impact: 'positive',
        confidence: 0.9,
        recommendation: 'Ready for more challenging content',
        affectedSkills: [...new Set(data.map(d => d.skill?.id || ''))],
        examples: data.filter(d => d.correct).slice(0, 3)
      };
    } else if (accuracy < 50) {
      return {
        pattern: 'low_accuracy',
        frequency: data.filter(d => !d.correct).length,
        impact: 'negative',
        confidence: 0.85,
        recommendation: 'Review fundamentals and slow down',
        affectedSkills: [...new Set(data.map(d => d.skill?.id || ''))],
        examples: data.filter(d => !d.correct).slice(0, 3)
      };
    }
    
    return null;
  }

  /**
   * Analyze question type patterns
   */
  private analyzeQuestionTypePatterns(data: PerformanceData[]): PerformancePattern | null {
    const typePerformance = new Map<QuestionType, number>();
    
    data.forEach(d => {
      const current = typePerformance.get(d.type) || 0;
      typePerformance.set(d.type, current + (d.correct ? 1 : 0));
    });
    
    // Find weakest type
    let weakestType: QuestionType | null = null;
    let weakestRate = 1;
    
    typePerformance.forEach((correct, type) => {
      const total = data.filter(d => d.type === type).length;
      const rate = correct / total;
      if (rate < weakestRate && total >= this.PATTERN_MIN_FREQUENCY) {
        weakestRate = rate;
        weakestType = type;
      }
    });
    
    if (weakestType && weakestRate < 0.5) {
      return {
        pattern: `struggling_with_${weakestType}`,
        frequency: data.filter(d => d.type === weakestType && !d.correct).length,
        impact: 'negative',
        confidence: 0.8,
        recommendation: `Practice more ${weakestType} questions`,
        affectedSkills: [...new Set(data.filter(d => d.type === weakestType).map(d => d.skill?.id || ''))],
        examples: data.filter(d => d.type === weakestType && !d.correct).slice(0, 3)
      };
    }
    
    return null;
  }

  /**
   * Analyze hint patterns
   */
  private analyzeHintPatterns(data: PerformanceData[]): PerformancePattern | null {
    const hintUsers = data.filter(d => d.hintsUsed > 0);
    
    if (hintUsers.length >= this.PATTERN_MIN_FREQUENCY) {
      const hintRate = hintUsers.length / data.length;
      
      if (hintRate > 0.6) {
        return {
          pattern: 'high_hint_dependency',
          frequency: hintUsers.length,
          impact: 'neutral',
          confidence: 0.75,
          recommendation: 'Try solving without hints first',
          affectedSkills: [...new Set(hintUsers.map(d => d.skill?.id || ''))],
          examples: hintUsers.slice(0, 3)
        };
      }
    }
    
    return null;
  }

  /**
   * Analyze subject patterns
   */
  private analyzeSubjectPatterns(data: PerformanceData[]): PerformancePattern | null {
    const subjectPerformance = new Map<Subject, number>();
    
    data.forEach(d => {
      const current = subjectPerformance.get(d.subject) || 0;
      subjectPerformance.set(d.subject, current + (d.correct ? 1 : 0));
    });
    
    // Find strongest subject
    let strongestSubject: Subject | null = null;
    let strongestRate = 0;
    
    subjectPerformance.forEach((correct, subject) => {
      const total = data.filter(d => d.subject === subject).length;
      const rate = correct / total;
      if (rate > strongestRate && total >= this.PATTERN_MIN_FREQUENCY) {
        strongestRate = rate;
        strongestSubject = subject;
      }
    });
    
    if (strongestSubject && strongestRate > 0.8) {
      return {
        pattern: `excelling_in_${strongestSubject}`,
        frequency: data.filter(d => d.subject === strongestSubject && d.correct).length,
        impact: 'positive',
        confidence: 0.85,
        recommendation: `Leverage ${strongestSubject} strength for cross-subject learning`,
        affectedSkills: [...new Set(data.filter(d => d.subject === strongestSubject).map(d => d.skill?.id || ''))],
        examples: data.filter(d => d.subject === strongestSubject && d.correct).slice(0, 3)
      };
    }
    
    return null;
  }

  /**
   * Analyze streak patterns
   */
  private analyzeStreakPatterns(data: PerformanceData[]): PerformancePattern | null {
    let currentStreak = 0;
    let maxStreak = 0;
    
    data.forEach(d => {
      if (d.correct) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    if (maxStreak >= 5) {
      return {
        pattern: 'hot_streak',
        frequency: maxStreak,
        impact: 'positive',
        confidence: 0.9,
        recommendation: 'Maintain momentum with slight difficulty increase',
        affectedSkills: [...new Set(data.slice(-maxStreak).map(d => d.skill?.id || ''))],
        examples: data.slice(-maxStreak, -maxStreak + 3)
      };
    }
    
    return null;
  }

  /**
   * Calculate overall trend
   */
  private calculateOverallTrend(
    data: PerformanceData[]
  ): 'improving' | 'stable' | 'declining' {
    if (data.length < 20) return 'stable';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAccuracy = this.calculateAccuracy(firstHalf);
    const secondAccuracy = this.calculateAccuracy(secondHalf);
    
    if (secondAccuracy > firstAccuracy + 10) return 'improving';
    if (secondAccuracy < firstAccuracy - 10) return 'declining';
    return 'stable';
  }

  /**
   * Generate insights
   */
  private generateInsights(
    data: PerformanceData[],
    patterns: PerformancePattern[]
  ): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];
    
    // Achievement insights
    const recentAccuracy = this.calculateAccuracy(data.slice(-20));
    if (recentAccuracy > 90) {
      insights.push({
        type: 'achievement',
        message: 'Outstanding performance! You\'re mastering this content!',
        icon: '🌟',
        actionable: false,
        priority: 1
      });
    }
    
    // Warning insights
    const rushingPattern = patterns.find(p => p.pattern === 'rushing');
    if (rushingPattern) {
      insights.push({
        type: 'warning',
        message: 'You might be rushing. Take your time to read carefully.',
        icon: '⚠️',
        actionable: true,
        action: 'Practice mindful reading',
        priority: 2
      });
    }
    
    // Tip insights
    const hintPattern = patterns.find(p => p.pattern === 'high_hint_dependency');
    if (hintPattern) {
      insights.push({
        type: 'tip',
        message: 'Try solving problems without hints first to build confidence.',
        icon: '💡',
        actionable: true,
        action: 'Attempt without hints',
        priority: 3
      });
    }
    
    // Milestone insights
    const totalQuestions = data.length;
    if (totalQuestions === 100) {
      insights.push({
        type: 'milestone',
        message: 'You\'ve completed 100 questions! Keep up the great work!',
        icon: '🎉',
        actionable: false,
        priority: 1
      });
    }
    
    return insights.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Predict optimal difficulty
   */
  private predictOptimalDifficulty(
    data: PerformanceData[]
  ): 'easy' | 'medium' | 'hard' {
    if (data.length < 10) return 'medium';
    
    const recent = data.slice(-20);
    const accuracy = this.calculateAccuracy(recent);
    const avgTime = recent.reduce((sum, d) => sum + d.timeSpent, 0) / recent.length;
    
    if (accuracy > 85 && avgTime < 30) {
      return 'hard';
    } else if (accuracy < 60 || avgTime > 90) {
      return 'easy';
    }
    
    return 'medium';
  }

  /**
   * Calculate accuracy
   */
  private calculateAccuracy(data: PerformanceData[]): number {
    if (data.length === 0) return 0;
    const correct = data.filter(d => d.correct).length;
    return (correct / data.length) * 100;
  }

  /**
   * Detect rushing behavior
   */
  private detectRushing(data: PerformanceData[]): boolean {
    const fastIncorrect = data.filter(d => !d.correct && d.timeSpent < 10);
    return fastIncorrect.length > data.length * 0.3;
  }

  /**
   * Detect overthinking behavior
   */
  private detectOverthinking(data: PerformanceData[]): boolean {
    const slowIncorrect = data.filter(d => !d.correct && d.timeSpent > 120);
    return slowIncorrect.length > data.length * 0.3;
  }

  /**
   * Get weak question types
   */
  private getWeakQuestionTypes(userId: string): QuestionType[] {
    const history = this.performanceHistory.get(userId) || [];
    const typePerformance = new Map<QuestionType, number>();
    
    history.forEach(d => {
      const key = d.type;
      const current = typePerformance.get(key) || 0;
      typePerformance.set(key, current + (d.correct ? 1 : -1));
    });
    
    return Array.from(typePerformance.entries())
      .filter(([_, score]) => score < 0)
      .map(([type]) => type);
  }

  /**
   * Get hint usage rate
   */
  private getHintUsageRate(userId: string): number {
    const history = this.performanceHistory.get(userId) || [];
    if (history.length === 0) return 0;
    
    const hintsUsed = history.filter(d => d.hintsUsed > 0).length;
    return hintsUsed / history.length;
  }

  /**
   * Check if needs visual support
   */
  private needsVisualSupport(data: PerformanceData[]): boolean {
    // Check if visual questions perform better
    const visualTypes: QuestionType[] = ['counting', 'matching'];
    const visualPerf = data.filter(d => visualTypes.includes(d.type));
    const nonVisualPerf = data.filter(d => !visualTypes.includes(d.type));
    
    if (visualPerf.length > 5 && nonVisualPerf.length > 5) {
      const visualAccuracy = this.calculateAccuracy(visualPerf);
      const nonVisualAccuracy = this.calculateAccuracy(nonVisualPerf);
      return visualAccuracy > nonVisualAccuracy + 20;
    }
    
    return false;
  }

  /**
   * Classify errors
   */
  private classifyErrors(errors: PerformanceData[]): ErrorType[] {
    const types: ErrorType[] = [];
    
    // Fast errors = careless
    const careless = errors.filter(e => e.timeSpent < 10);
    if (careless.length > 0) {
      types.push({
        category: 'careless',
        frequency: careless.length,
        examples: careless.slice(0, 3).map(e => e.questionId),
        suggestedRemedy: 'Slow down and double-check answers'
      });
    }
    
    // Repeated errors = conceptual
    const conceptual = errors.filter(e => e.attempts > 2);
    if (conceptual.length > 0) {
      types.push({
        category: 'conceptual',
        frequency: conceptual.length,
        examples: conceptual.slice(0, 3).map(e => e.questionId),
        suggestedRemedy: 'Review fundamental concepts'
      });
    }
    
    return types;
  }

  /**
   * Identify conceptual gaps
   */
  private identifyConceptualGaps(errors: PerformanceData[]): string[] {
    const gaps: string[] = [];
    const skillErrors = new Map<string, number>();
    
    errors.forEach(e => {
      const skill = e.skill?.name || 'Unknown';
      skillErrors.set(skill, (skillErrors.get(skill) || 0) + 1);
    });
    
    skillErrors.forEach((count, skill) => {
      if (count >= 3) {
        gaps.push(skill);
      }
    });
    
    return gaps;
  }

  /**
   * Identify procedural errors
   */
  private identifyProceduralErrors(errors: PerformanceData[]): string[] {
    // Errors with hints but still wrong = procedural issues
    return errors
      .filter(e => e.hintsUsed > 0 && !e.correct)
      .map(e => e.skill?.name || 'Unknown')
      .filter((v, i, a) => a.indexOf(v) === i); // unique
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(cached: any): boolean {
    // Simple time-based validation
    return true; // Simplified for now
  }

  /**
   * Clear user cache
   */
  private clearUserCache(userId: string): void {
    this.analysisCache.delete(userId);
    this.timeAnalysisCache.delete(userId);
    this.errorAnalysisCache.delete(userId);
  }

  /**
   * Persist user history
   */
  private persistUserHistory(userId: string): void {
    try {
      const history = this.performanceHistory.get(userId);
      if (history) {
        localStorage.setItem(
          `performance_history_${userId}`,
          JSON.stringify(history.slice(-100)) // Keep last 100
        );
      }
    } catch (error) {
      console.error('[Performance] Failed to persist history:', error);
    }
  }

  /**
   * Restore history from storage
   */
  private restoreHistory(): void {
    try {
      // Look for stored history
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('performance_history_')) {
          const userId = key.replace('performance_history_', '');
          const stored = localStorage.getItem(key);
          
          if (stored) {
            const history = JSON.parse(stored);
            // Restore dates
            history.forEach((item: any) => {
              item.timestamp = new Date(item.timestamp);
            });
            this.performanceHistory.set(userId, history);
          }
        }
      }
    } catch (error) {
      console.error('[Performance] Failed to restore history:', error);
    }
  }

  /**
   * Setup analysis jobs
   */
  private setupAnalysisJobs(): void {
    // Periodic cache cleanup
    setInterval(() => {
      this.analysisCache.clear();
      this.timeAnalysisCache.clear();
      this.errorAnalysisCache.clear();
    }, this.CACHE_TTL);
  }
}

// Export singleton instance getter
export const getPerformanceTracker = () => PerformanceTracker.getInstance();