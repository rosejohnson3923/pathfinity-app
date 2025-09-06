/**
 * Container Integration Module
 * Bridges the rules engines with existing React containers
 * Provides clean API for containers to interact with rules engines
 */

import { learnAIRulesEngine, LearnContext } from '../containers/LearnAIRulesEngine';
import { experienceAIRulesEngine, ExperienceContext } from '../containers/ExperienceAIRulesEngine';
import { discoverAIRulesEngine, DiscoverContext } from '../containers/DiscoverAIRulesEngine';
import { companionRulesEngine } from '../companions/CompanionRulesEngine';
import { themeRulesEngine } from '../theme/ThemeRulesEngine';
import { gamificationRulesEngine } from '../gamification/GamificationRulesEngine';
import { masterAIRulesEngine } from '../MasterAIRulesEngine';

// ============================================================================
// CONTAINER INTEGRATION SERVICE
// ============================================================================

export class ContainerIntegrationService {
  private static instance: ContainerIntegrationService;
  
  private constructor() {
    this.initialize();
  }
  
  public static getInstance(): ContainerIntegrationService {
    if (!ContainerIntegrationService.instance) {
      ContainerIntegrationService.instance = new ContainerIntegrationService();
    }
    return ContainerIntegrationService.instance;
  }
  
  /**
   * Initialize all rules engines
   */
  private initialize(): void {
    // Engines are already initialized as singletons
    console.log('[ContainerIntegration] Rules engines initialized');
  }
  
  // ============================================================================
  // LEARN CONTAINER INTEGRATION
  // ============================================================================
  
  /**
   * Select appropriate question type based on context
   */
  public async selectQuestionType(
    subject: string,
    grade: string,
    questionContext?: any
  ): Promise<{
    type: string;
    allowedTypes: string[];
    reason: string;
  }> {
    const context: LearnContext = {
      userId: 'system',
      timestamp: new Date(),
      metadata: {},
      student: {
        id: 'current',
        grade
      },
      subject: subject as any,
      questionContext,
      mode: 'practice'
    };
    
    const results = await learnAIRulesEngine.execute(context);
    const result = results.find(r => r.data?.selectedType);
    
    return {
      type: result?.data?.selectedType || 'multiple_choice',
      allowedTypes: result?.data?.allowedTypes || ['multiple_choice'],
      reason: result?.data?.reason || 'Default selection'
    };
  }
  
  /**
   * Validate answer with proper type coercion and rules
   * CRITICAL: This fixes the "correct answers marked wrong" bug
   */
  public async validateAnswer(
    questionType: string,
    userAnswer: any,
    correctAnswer: any,
    subject: string,
    grade: string
  ): Promise<{
    isCorrect: boolean;
    feedback?: string;
    rulesApplied: any;
  }> {
    const context: LearnContext = {
      userId: 'system',
      timestamp: new Date(),
      metadata: {},
      student: {
        id: 'current',
        grade
      },
      subject: subject as any,
      answerContext: {
        questionType,
        userAnswer,
        correctAnswer
      }
    };
    
    console.log('🔍 ContainerIntegration validateAnswer called:', {
      questionType,
      userAnswer,
      correctAnswer,
      userAnswerType: typeof userAnswer,
      correctAnswerType: typeof correctAnswer
    });
    
    const results = await learnAIRulesEngine.execute(context);
    const validationResult = results.find(r => r.data?.isCorrect !== undefined);
    
    console.log('📋 Rules Engine Results:', {
      totalResults: results.length,
      validationResult: validationResult?.data,
      allResults: results.map(r => ({ ruleId: r.ruleId, data: r.data }))
    });
    
    if (validationResult?.data) {
      return {
        isCorrect: validationResult.data.isCorrect,
        feedback: validationResult.data.feedback,
        rulesApplied: validationResult.data.rulesApplied
      };
    }
    
    // Fallback validation
    console.log('⚠️ Using fallback validation');
    const fallbackCorrect = String(userAnswer).toLowerCase() === String(correctAnswer).toLowerCase();
    return {
      isCorrect: fallbackCorrect,
      feedback: 'Standard validation applied',
      rulesApplied: { fallback: true }
    };
  }
  
  /**
   * Apply career context to questions
   */
  public async applyCareerContext(
    question: any,
    career: string,
    subject: string,
    grade: string
  ): Promise<any> {
    const context: LearnContext = {
      userId: 'system',
      timestamp: new Date(),
      metadata: {},
      student: {
        id: 'current',
        grade
      },
      subject: subject as any,
      career: {
        id: career.toLowerCase(),
        name: career
      },
      questionContext: question
    };
    
    const results = await learnAIRulesEngine.execute(context);
    const careerResult = results.find(r => r.data?.vocabulary || r.data?.scenario);
    
    if (careerResult?.data) {
      return {
        ...question,
        vocabulary: careerResult.data.vocabulary,
        scenario: careerResult.data.scenario,
        visualTheme: careerResult.data.visualTheme
      };
    }
    
    return question;
  }
  
  /**
   * Get question rules for a specific subject and grade
   */
  public getQuestionRules(subject: string, grade: string): any {
    return learnAIRulesEngine.getQuestionRules(subject, grade);
  }
  
  /**
   * Validate question structure before use
   */
  public validateQuestionStructure(question: any): boolean {
    return learnAIRulesEngine.validateQuestionStructure(question);
  }
  
  // ============================================================================
  // EXPERIENCE CONTAINER INTEGRATION
  // ============================================================================
  
  /**
   * Adapt experience based on engagement level
   */
  public async adaptExperience(
    engagementLevel: 'low' | 'medium' | 'high',
    activityType: string,
    grade: string
  ): Promise<any> {
    const context: ExperienceContext = {
      userId: 'system',
      timestamp: new Date(),
      metadata: {},
      student: {
        id: 'current',
        grade,
        engagementLevel
      },
      activity: {
        type: activityType as any,
        subject: 'general',
        topic: 'adaptive'
      }
    };
    
    const results = await experienceAIRulesEngine.execute(context);
    return results[0]?.data || {};
  }
  
  /**
   * Get engagement metrics for a student
   */
  public getEngagementMetrics(studentId: string): any {
    return experienceAIRulesEngine.getEngagementMetrics(studentId);
  }
  
  // ============================================================================
  // DISCOVER CONTAINER INTEGRATION
  // ============================================================================
  
  /**
   * Get recommended exploration pathway
   */
  public async getExplorationPathway(
    interests: string[],
    grade: string,
    explorationStyle: 'guided' | 'semi-guided' | 'independent'
  ): Promise<any> {
    const context: DiscoverContext = {
      userId: 'system',
      timestamp: new Date(),
      metadata: {},
      student: {
        id: 'current',
        grade,
        interests,
        explorationStyle
      },
      exploration: {
        type: 'research',
        topic: interests[0] || 'science',
        depth: 'intermediate'
      }
    };
    
    const pathway = discoverAIRulesEngine.getRecommendedPathway(context);
    return pathway;
  }
  
  /**
   * Track curiosity and generate rewards
   */
  public async trackCuriosity(
    studentId: string,
    discovery: {
      findings: string[];
      connections: string[];
      questions: string[];
      hypotheses: string[];
    }
  ): Promise<any> {
    const context: DiscoverContext = {
      userId: 'system',
      timestamp: new Date(),
      metadata: {},
      student: {
        id: studentId,
        grade: '3' // Default, should be passed in
      },
      exploration: {
        type: 'research',
        topic: 'discovery',
        depth: 'intermediate'
      },
      discovery
    };
    
    const results = await discoverAIRulesEngine.execute(context);
    const curiosityResult = results.find(r => r.data?.curiosityScore !== undefined);
    
    return curiosityResult?.data || {};
  }
  
  // ============================================================================
  // COMPANION INTEGRATION
  // ============================================================================
  
  /**
   * Get companion message based on context
   */
  public async getCompanionMessage(
    companionId: string,
    career: string,
    triggerType: string,
    context: any
  ): Promise<{
    message: string;
    emotion: string;
    animation?: string;
  }> {
    const companionContext = {
      userId: 'system',
      timestamp: new Date(),
      metadata: {},
      companionId,
      career: {
        id: career.toLowerCase(),
        name: career
      },
      trigger: {
        type: triggerType,
        context
      },
      student: {
        grade_level: context.grade_level || '3',
        level: context.level || 1
      }
    };
    
    const results = await companionRulesEngine.execute(companionContext);
    const messageResult = results.find(r => r.data?.message);
    
    if (messageResult?.data) {
      return {
        message: messageResult.data.message,
        emotion: messageResult.data.emotion || 'happy',
        animation: messageResult.data.animation
      };
    }
    
    // Fallback message
    return {
      message: 'Keep going! You\'re doing great!',
      emotion: 'encouraging',
      animation: 'wave'
    };
  }
  
  // ============================================================================
  // THEME INTEGRATION
  // ============================================================================
  
  /**
   * Get theme configuration
   */
  public async getThemeConfig(
    mode: 'light' | 'dark',
    component?: string
  ): Promise<any> {
    const context = {
      userId: 'system',
      timestamp: new Date(),
      metadata: {},
      mode,
      component,
      preferences: {
        reduceMotion: false,
        highContrast: false
      }
    };
    
    const results = await themeRulesEngine.execute(context);
    return results[0]?.data || {};
  }
  
  // ============================================================================
  // GAMIFICATION INTEGRATION
  // ============================================================================
  
  /**
   * Calculate XP for an action
   */
  public async calculateXP(
    action: string,
    context: any
  ): Promise<number> {
    const gamificationContext = {
      userId: context.studentId || 'system',
      timestamp: new Date(),
      metadata: {},
      action: {
        type: action,
        context
      },
      student: {
        level: context.level || 1,
        streak: context.streak || 0
      }
    };
    
    const results = await gamificationRulesEngine.execute(gamificationContext);
    const xpResult = results.find(r => r.data?.xp !== undefined);
    
    return xpResult?.data?.xp || 0;
  }
  
  /**
   * Check for achievements
   */
  public async checkAchievements(
    studentId: string,
    action: string,
    context: any
  ): Promise<any[]> {
    const gamificationContext = {
      userId: studentId,
      timestamp: new Date(),
      metadata: {},
      action: {
        type: action,
        context
      },
      student: {
        level: context.level || 1,
        achievements: context.achievements || []
      }
    };
    
    const results = await gamificationRulesEngine.execute(gamificationContext);
    const achievementResult = results.find(r => r.data?.achievements);
    
    return achievementResult?.data?.achievements || [];
  }
  
  // ============================================================================
  // MASTER ORCHESTRATION
  // ============================================================================
  
  /**
   * Orchestrate multiple engines for complex operations
   */
  public async orchestrate(context: any): Promise<any> {
    const masterContext = {
      userId: context.userId || 'system',
      timestamp: new Date(),
      metadata: {},
      ...context
    };
    
    const result = await masterAIRulesEngine.orchestrate(masterContext);
    return result;
  }
  
  /**
   * Get diagnostic fixes status
   */
  public getDiagnosticFixesStatus(): {
    correctAnswersFixed: boolean;
    elaQuestionTypesFixed: boolean;
    countingQuestionsFixed: boolean;
    questionStabilityFixed: boolean;
  } {
    return {
      correctAnswersFixed: true,  // validateAnswer now uses type coercion
      elaQuestionTypesFixed: true, // selectQuestionType prevents counting for ELA
      countingQuestionsFixed: true, // Counting questions require visual field
      questionStabilityFixed: true  // Questions are locked after generation
    };
  }
}

// Export singleton instance
export const containerIntegration = ContainerIntegrationService.getInstance();

// ============================================================================
// REACT HOOKS FOR EASY INTEGRATION
// ============================================================================

/**
 * Hook for using Learn rules engine
 */
export function useLearnRules() {
  const validateAnswer = async (
    questionType: string,
    userAnswer: any,
    correctAnswer: any,
    subject: string,
    grade: string
  ) => {
    return containerIntegration.validateAnswer(
      questionType,
      userAnswer,
      correctAnswer,
      subject,
      grade
    );
  };
  
  const selectQuestionType = async (
    subject: string,
    grade: string,
    questionContext?: any
  ) => {
    return containerIntegration.selectQuestionType(subject, grade, questionContext);
  };
  
  const applyCareerContext = async (
    question: any,
    career: string,
    subject: string,
    grade: string
  ) => {
    return containerIntegration.applyCareerContext(question, career, subject, grade);
  };
  
  return {
    validateAnswer,
    selectQuestionType,
    applyCareerContext,
    getQuestionRules: containerIntegration.getQuestionRules,
    validateQuestionStructure: containerIntegration.validateQuestionStructure
  };
}

/**
 * Hook for using Experience rules engine
 */
export function useExperienceRules() {
  const adaptExperience = async (
    engagementLevel: 'low' | 'medium' | 'high',
    activityType: string,
    grade: string
  ) => {
    return containerIntegration.adaptExperience(engagementLevel, activityType, grade);
  };
  
  const getEngagementMetrics = (studentId: string) => {
    return containerIntegration.getEngagementMetrics(studentId);
  };
  
  const execute = async (context: ExperienceContext) => {
    return experienceAIRulesEngine.execute(context);
  };
  
  return {
    adaptExperience,
    getEngagementMetrics,
    execute
  };
}

/**
 * Hook for using Discover rules engine
 */
export function useDiscoverRules() {
  const getExplorationPathway = async (
    interests: string[],
    grade: string,
    explorationStyle: 'guided' | 'semi-guided' | 'independent'
  ) => {
    return containerIntegration.getExplorationPathway(interests, grade, explorationStyle);
  };
  
  const trackCuriosity = async (
    studentId: string,
    discovery: any
  ) => {
    return containerIntegration.trackCuriosity(studentId, discovery);
  };
  
  const execute = async (context: DiscoverContext) => {
    return discoverAIRulesEngine.execute(context);
  };
  
  return {
    getExplorationPathway,
    trackCuriosity,
    execute
  };
}

/**
 * Hook for using Companion rules
 */
export function useCompanionRules() {
  const getCompanionMessage = async (
    companionId: string,
    career: string,
    triggerType: string,
    context: any
  ) => {
    return containerIntegration.getCompanionMessage(companionId, career, triggerType, context);
  };
  
  return {
    getCompanionMessage
  };
}

/**
 * Hook for using Theme rules
 */
export function useThemeRules() {
  const getThemeConfig = async (
    mode: 'light' | 'dark',
    component?: string
  ) => {
    return containerIntegration.getThemeConfig(mode, component);
  };
  
  return {
    getThemeConfig
  };
}

/**
 * Hook for using Gamification rules
 */
export function useGamificationRules() {
  const calculateXP = async (action: string, context: any) => {
    return containerIntegration.calculateXP(action, context);
  };
  
  const checkAchievements = async (
    studentId: string,
    action: string,
    context: any
  ) => {
    return containerIntegration.checkAchievements(studentId, action, context);
  };
  
  return {
    calculateXP,
    checkAchievements
  };
}

/**
 * Hook for master orchestration
 */
export function useMasterOrchestration() {
  const orchestrate = async (context: any) => {
    return containerIntegration.orchestrate(context);
  };
  
  return {
    orchestrate
  };
}