/**
 * JustInTimeContentService
 * 
 * Generates content only when needed, with intelligent caching and
 * performance-based adaptation to optimize learning experience.
 */

import { Subject, Grade, Skill, Career, QuestionType } from '../../types';
import { Question } from './QuestionTypes';
import { questionFactory } from './QuestionFactory';
import { contentGenerationPipeline } from './ContentGenerationPipeline';
import { DailyLearningContext, getDailyLearningContext } from './DailyLearningContextManager';
import { getSkillAdaptationService } from './SkillAdaptationService';
import { getContentRequestBuilder } from './ContentRequestBuilder';
import { getQuestionTemplateEngine } from './QuestionTemplateEngine';
import { getFallbackContentProvider } from './FallbackContentProvider';
import { getContentVolumeManager } from './ContentVolumeManager';
import { getConsistencyValidator } from './ConsistencyValidator';
import { SessionState, PerformanceMetrics, getSessionStateManager } from './SessionStateManager';
// CRITICAL FIX: Import AI Learning Journey Service for proper content generation
import { aiLearningJourneyService, StudentProfile, LearningSkill } from '../AILearningJourneyService';
import { staticDataService } from '../StaticDataService';
import { questionTypeTracker } from '../../utils/QuestionTypeTracker';

/**
 * JIT content request structure
 */
export interface JITContentRequest {
  userId: string;
  container: string;
  containerType: 'learn' | 'experience' | 'discover';
  subject: Subject;
  performanceContext?: PerformanceContext;
  timeConstraint?: number; // minutes
  forceRegenerate?: boolean;
  // Context for AI content generation
  context?: {
    skill?: {
      skill_number?: string;
      skill_name?: string;
      name?: string;
    };
    student?: {
      id?: string;
      name?: string;
      display_name?: string;
      grade_level?: string;
      interests?: string[];
      learning_style?: string;
    };
    career?: string;
    careerDescription?: string;
    // Narrative context from MasterNarrative
    narrativeContext?: {
      setting?: string;
      context?: string;
      narrative?: string;
      mission?: string;
      throughLine?: string;
      companion?: any;
      subjectContext?: any;
    };
  };
}

/**
 * Performance context for adaptation
 */
export interface PerformanceContext {
  recentAccuracy: number;
  averageTimePerQuestion: number;
  hintsUsedRate: number;
  streakCount: number;
  adaptationLevel: 'easy' | 'medium' | 'hard';
}

/**
 * Generated content structure
 */
export interface GeneratedContent {
  container: string;
  subject: Subject;
  questions: Question[]; // Type-safe Question array
  instructions: string;
  estimatedTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  careerContext: string;
  skillFocus: string;
  metadata: ContentMetadata;
}

/**
 * Content metadata
 */
export interface ContentMetadata {
  generatedAt: Date;
  generationTime: number; // milliseconds
  cacheHit: boolean;
  adaptationsApplied: string[];
  consistencyScore: number;
  source: 'ai' | 'template' | 'fallback' | 'cache';
}

/**
 * Cache entry structure
 */
export interface ContentCache {
  userId: string;
  container: string;
  content: GeneratedContent;
  timestamp: Date;
  expiresAt: Date;
  hitCount: number;
  lastAccessed: Date;
  performanceContext?: PerformanceContext;
}

/**
 * Cache statistics
 */
export interface CacheStatistics {
  totalEntries: number;
  memoryUsage: number; // bytes
  hitRate: number; // percentage
  avgGenerationTime: number; // milliseconds
  oldestEntry: Date;
  newestEntry: Date;
}

/**
 * Content adaptation rules
 */
export interface ContentAdaptation {
  type: 'difficulty' | 'quantity' | 'hints' | 'time' | 'visuals';
  adjustment: 'increase' | 'decrease' | 'maintain';
  magnitude: number; // 0-1 scale
  reason: string;
}

/**
 * Preload strategy
 */
export interface PreloadStrategy {
  containers: string[];
  priority: 'high' | 'medium' | 'low';
  timing: 'immediate' | 'idle' | 'background';
}

/**
 * Service for just-in-time content generation
 */
export class JustInTimeContentService {
  private static instance: JustInTimeContentService;
  
  // Caching layers
  private memoryCache: Map<string, ContentCache> = new Map();
  private sessionCache: Map<string, ContentCache> = new Map();
  private preloadQueue: Map<string, PreloadStrategy> = new Map();
  
  // Cache configuration
  private readonly MEMORY_CACHE_SIZE = 50;
  private readonly SESSION_CACHE_SIZE = 200;
  private readonly CACHE_TTL_MINUTES = 30;
  private readonly TARGET_GENERATION_TIME = 500; // ms
  
  // Performance tracking
  private generationMetrics: Map<string, number[]> = new Map();
  private cacheHits = 0;
  private cacheMisses = 0;

  private constructor() {
    this.setupCacheManagement();
    this.restoreSessionCache();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): JustInTimeContentService {
    if (!JustInTimeContentService.instance) {
      JustInTimeContentService.instance = new JustInTimeContentService();
    }
    return JustInTimeContentService.instance;
  }

  /**
   * Generate content for container (main entry point)
   */
  public async generateContainerContent(
    request: JITContentRequest
  ): Promise<GeneratedContent | null> {
    try {
      const startTime = typeof window !== 'undefined' && window.performance ?
        window.performance.now() : Date.now();
    
    // Build cache key
    const cacheKey = this.buildCacheKey(request);
    
    // Check cache if not forcing regeneration
    if (!request.forceRegenerate) {
      const cached = this.checkCache(cacheKey);
      if (cached) {
        console.log('[JIT] Cache hit for:', cacheKey);
        this.recordCacheHit(cached);
        return cached.content;
      }
    }
    
    console.log('[JIT] Cache miss, generating content for:', cacheKey);
    this.cacheMisses++;

    // CRITICAL FIX: Check if we should use AI generation for storyline continuity
    const hasRequiredData = request.context?.skill?.skill_name && 
                           request.context?.student?.grade_level &&
                           request.context?.career;
    
    if (hasRequiredData) {
      console.log('[JIT] 🎯 Using AI content generation for cohesive storyline');
      try {
        const aiContent = await this.generateAIContent(request);
        
        // Cache the AI-generated content
        const endTime = typeof window !== 'undefined' && window.performance ? 
          window.performance.now() : Date.now();
        
        aiContent.metadata = {
          ...aiContent.metadata,
          generationTime: endTime - startTime,
          source: 'ai' as const
        };
        
        this.cacheContent(cacheKey, request.userId, aiContent, request.performanceContext);
        return aiContent;
      } catch (error) {
        console.error('[JIT] AI generation failed, falling back to templates:', error);
        // Continue with template generation as fallback
      }
    }

    // Original template generation (fallback)
    const context = getDailyLearningContext().getCurrentContext();
    if (!context) {
      throw new Error('No daily learning context available');
    }

    const performance = this.getPerformanceContext(request.userId);
    
    // Apply adaptations based on performance
    const adaptations = this.determineAdaptations(performance);
    
    // Generate content
    const content = await this.generateAdaptedContent(
      request,
      context,
      adaptations
    );

    // Validate consistency
    const consistencyScore = this.validateContentConsistency(content, context);
    
    // Add metadata
    const generationTime = (typeof window !== 'undefined' && window.performance ? 
      window.performance.now() : Date.now()) - startTime;
    content.metadata = {
      generatedAt: new Date(),
      generationTime,
      cacheHit: false,
      adaptationsApplied: adaptations.map(a => `${a.type}:${a.adjustment}`),
      consistencyScore,
      source: 'template' // Will be 'ai' when AI integration is complete
    };

    // Cache the content
    this.cacheContent(cacheKey, request.userId, content, performance);
    
    // Track generation metrics
    this.recordGenerationMetrics(request.container, generationTime);
    
    // Queue preloading for likely next containers
    this.queuePreloading(request);

    console.log('[JIT] Content generated in', generationTime.toFixed(0), 'ms');
    
    return content;
    } catch (error) {
      console.error('Error generating content:', error);
      // Return null on error - the orchestrator will handle with fallback
      return null;
    }
  }

  /**
   * Adapt content based on performance
   */
  public adaptBasedOnPerformance(
    performance: PerformanceMetrics
  ): ContentAdaptation[] {
    const adaptations: ContentAdaptation[] = [];

    // Difficulty adaptation
    if (performance.overallAccuracy > 85 && performance.streakCount > 5) {
      adaptations.push({
        type: 'difficulty',
        adjustment: 'increase',
        magnitude: 0.3,
        reason: 'High accuracy and streak'
      });
    } else if (performance.overallAccuracy < 60) {
      adaptations.push({
        type: 'difficulty',
        adjustment: 'decrease',
        magnitude: 0.3,
        reason: 'Low accuracy'
      });
    }

    // Quantity adaptation
    if (performance.averageTimePerQuestion < 20) {
      adaptations.push({
        type: 'quantity',
        adjustment: 'increase',
        magnitude: 0.2,
        reason: 'Fast completion time'
      });
    } else if (performance.averageTimePerQuestion > 90) {
      adaptations.push({
        type: 'quantity',
        adjustment: 'decrease',
        magnitude: 0.2,
        reason: 'Slow completion time'
      });
    }

    // Hint adaptation
    const hintRate = performance.totalQuestionsAnswered > 0
      ? performance.totalHintsUsed / performance.totalQuestionsAnswered
      : 0;
    
    if (hintRate > 0.5) {
      adaptations.push({
        type: 'hints',
        adjustment: 'increase',
        magnitude: 0.4,
        reason: 'High hint usage'
      });
    }

    // Visual adaptation for younger grades
    const sessionState = getSessionStateManager().getCurrentState(performance.totalQuestionsAnswered.toString());
    if (sessionState && this.isYoungerGrade(sessionState)) {
      adaptations.push({
        type: 'visuals',
        adjustment: 'increase',
        magnitude: 0.5,
        reason: 'Visual learning for younger grade'
      });
    }

    return adaptations;
  }

  /**
   * Cache content for reuse
   */
  public cacheContent(
    key: string,
    userId: string,
    content: GeneratedContent,
    performanceContext?: PerformanceContext
  ): void {
    const cache: ContentCache = {
      userId,
      container: content.container || 'unknown',
      content,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + this.CACHE_TTL_MINUTES * 60000),
      hitCount: 0,
      lastAccessed: new Date(),
      performanceContext
    };

    // Add to memory cache
    this.addToMemoryCache(key, cache);
    
    // Add to session cache
    this.addToSessionCache(key, cache);
    
    // Persist session cache
    this.persistSessionCache();
  }

  /**
   * Preload content for likely next containers
   */
  public async preloadNextContent(
    userId: string,
    currentContainer: string
  ): Promise<void> {
    const nextContainers = this.predictNextContainers(currentContainer);
    
    for (const container of nextContainers) {
      const strategy: PreloadStrategy = {
        containers: [container.id],
        priority: container.probability > 0.7 ? 'high' : 'medium',
        timing: 'background'
      };
      
      this.preloadQueue.set(`${userId}-${container.id}`, strategy);
    }

    // Process preload queue in background
    this.processPreloadQueue();
  }

  /**
   * Invalidate cache for user
   */
  public invalidateCache(userId: string): void {
    // Remove from memory cache
    this.memoryCache.forEach((cache, key) => {
      if (cache.userId === userId) {
        this.memoryCache.delete(key);
      }
    });

    // Remove from session cache
    this.sessionCache.forEach((cache, key) => {
      if (cache.userId === userId) {
        this.sessionCache.delete(key);
      }
    });

    // Clear preload queue
    this.preloadQueue.forEach((strategy, key) => {
      if (key.startsWith(userId)) {
        this.preloadQueue.delete(key);
      }
    });

    console.log('[JIT] Cache invalidated for user:', userId);
  }

  /**
   * Clear all caches - useful for testing new content generation
   */
  public clearCache(): void {
    this.memoryCache.clear();
    this.sessionCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    
    // Also clear localStorage cache
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('jit-cache-')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // Clear sessionStorage content keys
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.includes('learn-content-') || key.includes('jit-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('[JIT] All caches cleared');
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): CacheStatistics {
    const allCaches = [...this.memoryCache.values(), ...this.sessionCache.values()];
    
    const totalHits = this.cacheHits;
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

    const memoryUsage = this.estimateMemoryUsage();
    
    const timestamps = allCaches.map(c => c.timestamp);
    const oldestEntry = timestamps.length > 0 
      ? new Date(Math.min(...timestamps.map(t => t.getTime())))
      : new Date();
    const newestEntry = timestamps.length > 0
      ? new Date(Math.max(...timestamps.map(t => t.getTime())))
      : new Date();

    // Calculate average generation time
    let totalGenTime = 0;
    let genCount = 0;
    this.generationMetrics.forEach(times => {
      times.forEach(time => {
        totalGenTime += time;
        genCount++;
      });
    });
    const avgGenerationTime = genCount > 0 ? totalGenTime / genCount : 0;

    return {
      totalEntries: allCaches.length,
      memoryUsage,
      hitRate,
      avgGenerationTime,
      oldestEntry,
      newestEntry
    };
  }

  /**
   * Get performance context for user
   */
  private getPerformanceContext(userId: string): PerformanceContext {
    const sessionState = getSessionStateManager().getCurrentState(userId);
    
    if (!sessionState || !sessionState.performance) {
      // Default context for new users
      return {
        recentAccuracy: 70,
        averageTimePerQuestion: 45,
        hintsUsedRate: 0.2,
        streakCount: 0,
        adaptationLevel: 'medium'
      };
    }

    const perf = sessionState.performance;
    const hintsRate = perf.totalQuestionsAnswered > 0
      ? perf.totalHintsUsed / perf.totalQuestionsAnswered
      : 0;

    return {
      recentAccuracy: perf.overallAccuracy,
      averageTimePerQuestion: perf.averageTimePerQuestion,
      hintsUsedRate: hintsRate,
      streakCount: perf.streakCount,
      adaptationLevel: sessionState.adaptationLevel
    };
  }

  /**
   * Determine content adaptations
   */
  private determineAdaptations(
    performance: PerformanceContext
  ): ContentAdaptation[] {
    const adaptations: ContentAdaptation[] = [];

    // Difficulty based on accuracy
    if (performance.recentAccuracy > 85) {
      adaptations.push({
        type: 'difficulty',
        adjustment: 'increase',
        magnitude: 0.3,
        reason: 'High recent accuracy'
      });
    } else if (performance.recentAccuracy < 60) {
      adaptations.push({
        type: 'difficulty',
        adjustment: 'decrease',
        magnitude: 0.3,
        reason: 'Low recent accuracy'
      });
    }

    // Quantity based on speed
    if (performance.averageTimePerQuestion < 30) {
      adaptations.push({
        type: 'quantity',
        adjustment: 'increase',
        magnitude: 0.25,
        reason: 'Fast completion'
      });
    } else if (performance.averageTimePerQuestion > 90) {
      adaptations.push({
        type: 'quantity',
        adjustment: 'decrease',
        magnitude: 0.25,
        reason: 'Needs more time per question'
      });
    }

    // Hints based on usage
    if (performance.hintsUsedRate > 0.4) {
      adaptations.push({
        type: 'hints',
        adjustment: 'increase',
        magnitude: 0.5,
        reason: 'Frequent hint usage'
      });
    }

    return adaptations;
  }

  /**
   * Generate adapted content
   */
  private async generateAdaptedContent(
    request: JITContentRequest,
    context: DailyLearningContext,
    adaptations: ContentAdaptation[]
  ): Promise<GeneratedContent> {
    // Get skill adaptation for subject
    const skillAdaptation = getSkillAdaptationService().adaptSkill(
      context.primarySkill,
      request.subject,
      context.career,
      context.grade
    );

    // Determine question count based on container type and adaptations
    const baseCount = this.getBaseQuestionCount(request.containerType);
    const adjustedCount = this.adjustQuestionCount(baseCount, adaptations);

    // Determine difficulty
    const difficulty = this.determineDifficulty(adaptations, context.grade);

    // Build content request
    const contentRequest = getContentRequestBuilder().buildRequest(
      context.primarySkill,
      {
        id: request.userId,
        grade: request.gradeLevel || context.grade || 'K',
        currentSkill: context.primarySkill,
        selectedCareer: context.career,
        enrolledSubjects: context.subjects
      } as any,
      context.career,
      this.getContentMode(request.timeConstraint)
    );

    // Generate questions using template engine
    const questions = await this.generateQuestions(
      contentRequest,
      adjustedCount,
      difficulty,
      request.subject
    );

    // Build instructions
    const instructions = this.buildInstructions(
      request.containerType,
      skillAdaptation,
      context
    );

    // Estimate time
    const estimatedTime = this.estimateCompletionTime(
      adjustedCount,
      adaptations
    );

    return {
      container: request.container,
      subject: request.subject,
      questions,
      instructions,
      estimatedTime,
      difficulty,
      careerContext: skillAdaptation.careerConnection,
      skillFocus: skillAdaptation.adaptedDescription,
      metadata: {} as ContentMetadata // Will be filled by caller
    };
  }

  /**
   * Generate content using AI Learning Journey Service for cohesive storyline
   * This is the CRITICAL FIX for maintaining narrative continuity across containers
   */
  private async generateAIContent(request: JITContentRequest): Promise<GeneratedContent> {
    const { context, containerType, subject } = request;
    
    // Prepare proper data structures for AI service
    const skill: LearningSkill = {
      skill_number: context.skill.skill_number || `${subject}.1`,
      skill_name: context.skill.skill_name,
      subject: subject,
      grade_level: context.student.grade_level
    };
    
    const student: StudentProfile = {
      id: context.student.id || request.userId,
      display_name: context.student.display_name || context.student.name || 'Student',
      grade_level: context.student.grade_level,
      interests: context.student.interests || [context.career],
      learning_style: context.student.learning_style || 'visual'
    };
    
    const career = context.career ? {
      name: typeof context.career === 'string' ? context.career : context.career.name || context.career.title,
      description: context.careerDescription || (typeof context.career === 'string' ? `${context.career} professional` : context.career.description || `${context.career.name || context.career.title} professional`),
      // Pass narrative context to AI service
      narrativeContext: context.narrativeContext
    } : undefined;
    
    console.log('[JIT] 📚 Calling AI service with:', {
      containerType,
      skill: skill.skill_name,
      grade: student.grade_level,
      career: career?.name,
      subject: subject
    });
    
    // Generate AI content based on container type
    let aiContent: any;
    switch (containerType) {
      case 'learn':
        aiContent = await aiLearningJourneyService.generateLearnContent(skill, student, career);
        break;
      case 'experience':
        aiContent = await aiLearningJourneyService.generateExperienceContent(skill, student, career);
        break;
      case 'discover':
        aiContent = await aiLearningJourneyService.generateDiscoverContent(skill, student, career);
        break;
      default:
        throw new Error(`Unknown container type: ${containerType}`);
    }
    
    // Convert AI content to GeneratedContent format
    return this.convertAIContentToGeneratedFormat(aiContent, request, containerType, subject);
  }
  
  /**
   * Convert AI-generated content to JIT GeneratedContent format
   */
  private convertAIContentToGeneratedFormat(
    aiContent: any,
    request: JITContentRequest,
    containerType: string,
    subject: Subject
  ): GeneratedContent {
    // Extract appropriate content based on container type
    let questions: Question[] = [];
    let instructions = '';
    let careerContext = request.context?.career || '';
    let skillFocus = request.context?.skill?.skill_name || '';
    
    if (containerType === 'learn' && aiContent.practice) {
      // Convert AI practice questions to JIT Question format
      questions = aiContent.practice.map((q: any, idx: number) => ({
        id: `${request.container}-q-${idx}`,
        type: q.type,
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correct_answer,
        hint: q.hint,
        explanation: q.explanation,
        visual: q.visual,
        practiceSupport: q.practiceSupport,
        metadata: {
          difficulty: 'medium',
          skill: skillFocus,
          career: careerContext
        }
      }));
      instructions = aiContent.greeting + '\n\n' + aiContent.concept;
      
    } else if (containerType === 'experience' && aiContent.interactive_simulation) {
      // Debug log the first challenge to see what we're getting
      if (aiContent.interactive_simulation.challenges?.[0]) {
        console.log('🔍 JIT - Raw AI challenge structure:', {
          challenge: aiContent.interactive_simulation.challenges[0],
          hasDescription: !!aiContent.interactive_simulation.challenges[0].description
        });
      }

      // Convert experience challenges to questions - PRESERVE ALL RICH CONTENT
      questions = aiContent.interactive_simulation.challenges.map((c: any, idx: number) => ({
        id: `${request.container}-q-${idx}`,
        type: c.question_type || 'multiple_choice',
        // Use the full description as the question (this is what we want to show!)
        question: c.description || c.question || '',
        description: c.description,  // Full challenge description
        challenge_summary: c.challenge_summary,  // Short summary
        options: c.options || [],
        correct_choice: c.correct_choice,  // Index of correct answer
        correctAnswer: c.correct_answer || (c.correct_choice !== undefined ? c.options?.[c.correct_choice] : ''),
        hint: c.hint || '',
        outcome: c.outcome || '',  // What happens when answered correctly
        learning_point: c.learning_point || '',  // Learning takeaway
        explanation: c.feedback || c.outcome || '',
        scenario: c.scenario || aiContent.scenario,
        metadata: {
          difficulty: c.difficulty || 'medium',
          skill: skillFocus,
          career: careerContext
        }
      }));

      // Debug log what we mapped
      if (questions.length > 0) {
        console.log('🔍 JIT - Mapped question structure:', {
          firstQuestion: questions[0],
          hasDescription: !!questions[0].description,
          descriptionValue: questions[0].description
        });
      }

      // Use the setup from interactive_simulation if available
      instructions = aiContent.interactive_simulation.setup ||
                    (aiContent.scenario + '\n\n' + aiContent.character_context);
      
    } else if (containerType === 'discover') {
      // Handle new 3-2-1 structure where all 6 scenarios are in "practice" array
      if (aiContent.practice && Array.isArray(aiContent.practice)) {
        questions = aiContent.practice.map((q: any, idx: number) => ({
          id: `${request.container}-q-${idx}`,
          type: q.type || 'multiple_choice',
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correct_answer,
          hint: q.hint || '',
          explanation: q.explanation || '',
          visual: q.visual,
          practiceSupport: q.practiceSupport,
          scenario_type: q.scenario_type, // example, practice, or assessment
          metadata: {
            difficulty: q.scenario_type === 'assessment' ? 'hard' : 'medium',
            skill: skillFocus,
            career: careerContext
          }
        }));
        instructions = aiContent.greeting || aiContent.exploration_theme || 'Discover new connections!';
      } else if (aiContent.exploration_activities) {
        // Fallback for old format
        questions = aiContent.exploration_activities.map((a: any, idx: number) => ({
          id: `${request.container}-q-${idx}`,
          type: a.activity_type || 'exploration',
          question: a.prompt,
          options: a.options || [],
          correctAnswer: a.expected_outcome,
          hint: a.guidance || '',
          explanation: a.discovery_insight || '',
          metadata: {
            difficulty: 'medium',
            skill: skillFocus,
            career: careerContext
          }
        }));
        instructions = aiContent.discovery_prompt;
      }
    }

    // Add assessment question if available (skip for discover since it's included in the 6 scenarios)
    if (containerType !== 'discover' && aiContent.assessment) {
      questions.push({
        id: `${request.container}-assessment`,
        type: aiContent.assessment.type,
        question: aiContent.assessment.question,
        options: aiContent.assessment.options || [],
        correctAnswer: aiContent.assessment.correct_answer,
        hint: '',
        explanation: aiContent.assessment.explanation,
        visual: aiContent.assessment.visual,
        isAssessment: true,
        metadata: {
          difficulty: 'hard',
          skill: skillFocus,
          career: careerContext
        }
      });
    }
    
    return {
      container: request.container || `${containerType}-container`,
      subject: subject,
      questions: questions,
      instructions: instructions,
      estimatedTime: 15,
      difficulty: request.performanceContext?.adaptationLevel || 'medium',
      careerContext: careerContext,
      skillFocus: skillFocus,
      metadata: {
        generatedAt: new Date(),
        generationTime: 0, // Will be set by caller
        cacheHit: false,
        adaptationsApplied: [],
        consistencyScore: 1.0, // AI content has perfect consistency
        source: 'ai' as const
      },
      // Store full AI content for reference and storyline continuity
      aiSourceContent: aiContent
    };
  }

  /**
   * Generate questions using template engine
   */
  private async generateQuestions(
    request: any,
    count: number,
    difficulty: 'easy' | 'medium' | 'hard',
    subject: Subject
  ): Promise<any[]> {
    const questions: any[] = [];
    const templateEngine = getQuestionTemplateEngine();

    // Get appropriate question types for grade/subject
    const gradeLevel = request.context?.grade || request.student?.grade || 'K';
    const types = await this.getQuestionTypesForSubject(subject, difficulty, gradeLevel);

    // Ensure context has grade, career, and visual requirements
    const gradeNum = parseInt(gradeLevel) || (gradeLevel === 'K' ? 0 : 13);
    const isYoungLearner = gradeNum <= 2;
    
    const context = {
      ...request.context,
      grade: gradeLevel,
      subject: subject,  // Add the subject to context!
      career: request.context?.career || request.student?.selectedCareer || request.career,
      // Require visuals for young learners in math, or for specific question types
      requireVisual: (isYoungLearner && subject === 'Math') || 
                     types.includes('counting') ||
                     types.includes('true_false')
    };
    
    console.log('[JIT] Question generation context:', {
      grade: gradeLevel,
      career: context.career,
      requireVisual: context.requireVisual,
      types,
      isYoungLearner
    });

    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      
      // Track question type being generated
      questionTypeTracker.trackQuestionType(type);
      
      // Add difficulty to context
      const questionContext = {
        ...context,
        difficulty: difficulty || 'medium'
      };
      
      const result = templateEngine.generateQuestion(
        type,
        questionContext
      );
      
      // Extract the actual question from the result
      if (result && result.question) {
        console.log(`[JIT] Question ${i} from template engine:`, {
          type: result.question.type,
          hasVisual: !!result.question.visual,
          visual: result.question.visual,
          confidence: result.confidence
        });
        questions.push(result.question);
      } else {
        console.warn(`[JIT] Failed to generate question ${i} of type ${type}`);
      }
    }

    // Use fallback if generation fails
    if (questions.length === 0) {
      const fallback = getFallbackContentProvider().getFallbackContent(
        request.context.grade,
        subject,
        request.context.skill,
        request.context.career
      );
      return fallback.practice || [];
    }

    return questions;
  }

  /**
   * Validate content consistency
   */
  private validateContentConsistency(
    content: GeneratedContent,
    context: DailyLearningContext
  ): number {
    const validator = getConsistencyValidator();
    
    let totalScore = 0;
    let count = 0;

    content.questions.forEach(question => {
      const report = validator.validateContent(
        {
          type: 'question',
          subject: content.subject,
          text: JSON.stringify(question)
        },
        context
      );
      totalScore += report.overallScore;
      count++;
    });

    return count > 0 ? totalScore / count : 0;
  }

  /**
   * Build cache key
   */
  private buildCacheKey(request: JITContentRequest): string {
    const perfContext = request.performanceContext;
    const perfKey = perfContext 
      ? `-${perfContext.adaptationLevel}-${Math.round(perfContext.recentAccuracy)}`
      : '';
    
    // Include career and skill in cache key to prevent content mismatch
    // Handle career as either string or object with id/name properties
    const careerValue = typeof request.context?.career === 'string'
      ? request.context.career
      : request.context?.career?.id || request.context?.career?.name || '';
    const careerKey = careerValue ? `-${careerValue}` : '';
    const skillKey = request.context?.skill?.skill_number ? `-${request.context.skill.skill_number}` : '';
    
    return `${request.userId}-${request.container}-${request.subject}${careerKey}${skillKey}${perfKey}`;
  }

  /**
   * Check cache for content
   */
  private checkCache(key: string): ContentCache | null {
    // Check memory cache first
    const memCache = this.memoryCache.get(key);
    if (memCache && !this.isCacheExpired(memCache)) {
      memCache.hitCount++;
      memCache.lastAccessed = new Date();
      return memCache;
    }

    // Check session cache
    const sessCache = this.sessionCache.get(key);
    if (sessCache && !this.isCacheExpired(sessCache)) {
      sessCache.hitCount++;
      sessCache.lastAccessed = new Date();
      
      // Promote to memory cache
      this.addToMemoryCache(key, sessCache);
      
      return sessCache;
    }

    return null;
  }

  /**
   * Check if cache entry is expired
   */
  private isCacheExpired(cache: ContentCache): boolean {
    return new Date() > cache.expiresAt;
  }

  /**
   * Add to memory cache with LRU eviction
   */
  private addToMemoryCache(key: string, cache: ContentCache): void {
    // Evict if at capacity
    if (this.memoryCache.size >= this.MEMORY_CACHE_SIZE) {
      // Find least recently used
      let lruKey = '';
      let lruTime = new Date();
      
      this.memoryCache.forEach((c, k) => {
        if (c.lastAccessed < lruTime) {
          lruTime = c.lastAccessed;
          lruKey = k;
        }
      });

      if (lruKey) {
        this.memoryCache.delete(lruKey);
      }
    }

    this.memoryCache.set(key, cache);
  }

  /**
   * Add to session cache
   */
  private addToSessionCache(key: string, cache: ContentCache): void {
    // Evict if at capacity
    if (this.sessionCache.size >= this.SESSION_CACHE_SIZE) {
      // Remove oldest
      const oldest = Array.from(this.sessionCache.entries())
        .sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime())[0];
      
      if (oldest) {
        this.sessionCache.delete(oldest[0]);
      }
    }

    this.sessionCache.set(key, cache);
  }

  /**
   * Record cache hit
   */
  private recordCacheHit(cache: ContentCache): void {
    this.cacheHits++;
    cache.hitCount++;
    cache.lastAccessed = new Date();
  }

  /**
   * Record generation metrics
   */
  private recordGenerationMetrics(container: string, time: number): void {
    if (!this.generationMetrics.has(container)) {
      this.generationMetrics.set(container, []);
    }
    
    const metrics = this.generationMetrics.get(container)!;
    metrics.push(time);
    
    // Keep only last 100 metrics
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  /**
   * Get base question count for container type
   */
  private getBaseQuestionCount(containerType: 'learn' | 'experience' | 'discover'): number {
    const counts = {
      'learn': 5,
      'experience': 3,
      'discover': 2
    };
    return counts[containerType];
  }

  /**
   * Adjust question count based on adaptations
   */
  private adjustQuestionCount(base: number, adaptations: ContentAdaptation[]): number {
    let adjusted = base;
    
    adaptations.forEach(adaptation => {
      if (adaptation.type === 'quantity') {
        if (adaptation.adjustment === 'increase') {
          adjusted = Math.ceil(adjusted * (1 + adaptation.magnitude));
        } else if (adaptation.adjustment === 'decrease') {
          adjusted = Math.floor(adjusted * (1 - adaptation.magnitude));
        }
      }
    });

    return Math.max(1, Math.min(10, adjusted)); // Clamp between 1-10
  }

  /**
   * Determine difficulty level
   */
  private determineDifficulty(
    adaptations: ContentAdaptation[],
    grade: Grade
  ): 'easy' | 'medium' | 'hard' {
    let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
    
    adaptations.forEach(adaptation => {
      if (adaptation.type === 'difficulty') {
        if (adaptation.adjustment === 'increase') {
          difficulty = 'hard';
        } else if (adaptation.adjustment === 'decrease') {
          difficulty = 'easy';
        }
      }
    });

    // Grade-based limits
    const gradeNum = this.gradeToNumber(grade);
    if (gradeNum <= 2 && difficulty === 'hard') {
      difficulty = 'medium'; // Cap difficulty for K-2
    }

    return difficulty;
  }

  /**
   * Get content mode based on time constraint
   */
  private getContentMode(timeConstraint?: number): 'demo' | 'testing' | 'standard' | 'full' {
    if (!timeConstraint) return 'standard';
    
    if (timeConstraint <= 2) return 'demo';
    if (timeConstraint <= 5) return 'testing';
    if (timeConstraint <= 15) return 'standard';
    return 'full';
  }

  /**
   * Get appropriate question types for subject using database
   */
  private async getQuestionTypesForSubject(
    subject: Subject,
    difficulty: 'easy' | 'medium' | 'hard',
    grade?: string
  ): Promise<QuestionType[]> {
    // Use database to get suitable question types
    const dbTypes = await staticDataService.getQuestionTypesForGrade(
      grade || '5', // Default to grade 5 if not specified
      subject
    );
    
    // ENHANCED: Include ALL question types with difficulty weighting
    // This ensures we can cycle through all 15 types
    const allTypes = [
      'multiple_choice', 'true_false', 'fill_blank', 'numeric', 'counting',
      'matching', 'ordering', 'sequencing', 'short_answer', 'essay',
      'word_problem', 'drag_drop', 'drawing', 'coding', 'creative_writing'
    ];
    
    // Difficulty influences probability, not exclusion
    const difficultyWeights = {
      'easy': {
        'true_false': 3, 'multiple_choice': 3, 'counting': 2, 'matching': 2,
        'fill_blank': 1, 'numeric': 1, 'ordering': 1, 'sequencing': 1,
        'short_answer': 0.5, 'essay': 0.2, 'word_problem': 0.5,
        'drag_drop': 1, 'drawing': 0.5, 'coding': 0.2, 'creative_writing': 0.2
      },
      'medium': {
        'true_false': 1, 'multiple_choice': 2, 'counting': 1, 'matching': 1,
        'fill_blank': 3, 'numeric': 3, 'ordering': 2, 'sequencing': 2,
        'short_answer': 2, 'essay': 1, 'word_problem': 2,
        'drag_drop': 2, 'drawing': 1, 'coding': 1, 'creative_writing': 1
      },
      'hard': {
        'true_false': 0.5, 'multiple_choice': 1, 'counting': 0.5, 'matching': 0.5,
        'fill_blank': 2, 'numeric': 2, 'ordering': 1, 'sequencing': 1,
        'short_answer': 3, 'essay': 3, 'word_problem': 3,
        'drag_drop': 1, 'drawing': 2, 'coding': 3, 'creative_writing': 3
      }
    };
    
    const weights = difficultyWeights[difficulty];
    
    // Filter to types that exist in database and sort by weight
    const availableTypes = dbTypes
      .filter(t => allTypes.includes(t.id))
      .sort((a, b) => {
        const weightA = weights[a.id as keyof typeof weights] || 1;
        const weightB = weights[b.id as keyof typeof weights] || 1;
        return weightB - weightA; // Higher weight first
      });
    
    // For testing: Rotate through all types to ensure coverage
    // Get session-based rotation to ensure variety
    const sessionManager = getSessionStateManager();
    const sessionState = sessionManager.getCurrentState('current-user');
    const usedTypes = sessionState?.questionsAnswered
      .map(q => q.type)
      .filter(Boolean) || [];
    
    // Prioritize unused types for complete coverage
    const unusedTypes = availableTypes.filter(t => !usedTypes.includes(t.id));
    const typesToUse = unusedTypes.length > 0 ? unusedTypes : availableTypes;
    
    // Return top 3-5 types based on weights and variety
    const numTypes = Math.min(5, Math.max(3, typesToUse.length));
    const selectedTypes = typesToUse.slice(0, numTypes).map(t => t.id as QuestionType);
    
    console.log('[JIT] Question types selected:', {
      grade,
      subject,
      difficulty,
      available: availableTypes.length,
      selected: selectedTypes,
      previouslyUsed: usedTypes.length,
      prioritizingUnused: unusedTypes.length > 0
    });
    
    return selectedTypes;
  }

  /**
   * Build instructions for container
   */
  private buildInstructions(
    containerType: 'learn' | 'experience' | 'discover',
    skillAdaptation: any,
    context: DailyLearningContext
  ): string {
    const templates = {
      'learn': `Welcome to your learning journey! Today with ${context.companion.name}, you'll practice ${skillAdaptation.adaptedDescription}. ${skillAdaptation.practiceContext}`,
      'experience': `Time to experience how ${context.career.title}s use these skills! ${skillAdaptation.careerConnection}`,
      'discover': `Let's discover new ways to apply ${context.primarySkill.name}! ${context.companion.name} will guide you through exciting challenges.`
    };

    return templates[containerType];
  }

  /**
   * Estimate completion time
   */
  private estimateCompletionTime(
    questionCount: number,
    adaptations: ContentAdaptation[]
  ): number {
    let baseTimePerQuestion = 2; // minutes
    
    adaptations.forEach(adaptation => {
      if (adaptation.type === 'time') {
        if (adaptation.adjustment === 'increase') {
          baseTimePerQuestion *= (1 + adaptation.magnitude);
        } else if (adaptation.adjustment === 'decrease') {
          baseTimePerQuestion *= (1 - adaptation.magnitude);
        }
      }
    });

    return Math.ceil(questionCount * baseTimePerQuestion);
  }

  /**
   * Predict next containers
   */
  private predictNextContainers(
    currentContainer: string
  ): Array<{ id: string; probability: number }> {
    // Simple progression prediction
    const progressionMap: Record<string, Array<{ id: string; probability: number }>> = {
      'learn-math': [
        { id: 'experience-math', probability: 0.8 },
        { id: 'discover-math', probability: 0.2 }
      ],
      'experience-math': [
        { id: 'discover-math', probability: 0.7 },
        { id: 'learn-ela', probability: 0.3 }
      ],
      'discover-math': [
        { id: 'learn-ela', probability: 0.9 },
        { id: 'learn-science', probability: 0.1 }
      ]
      // Add more mappings as needed
    };

    return progressionMap[currentContainer] || [
      { id: 'learn-math', probability: 0.5 }
    ];
  }

  /**
   * Queue preloading of content
   */
  private queuePreloading(request: JITContentRequest): void {
    const nextContainers = this.predictNextContainers(request.container);
    
    nextContainers.forEach(next => {
      if (next.probability > 0.5) {
        const strategy: PreloadStrategy = {
          containers: [next.id],
          priority: next.probability > 0.7 ? 'high' : 'medium',
          timing: 'idle'
        };
        
        const key = `${request.userId}-${next.id}`;
        this.preloadQueue.set(key, strategy);
      }
    });
  }

  /**
   * Process preload queue
   */
  private async processPreloadQueue(): Promise<void> {
    // Process high priority first
    const highPriority = Array.from(this.preloadQueue.entries())
      .filter(([_, strategy]) => strategy.priority === 'high');

    for (const [key, strategy] of highPriority) {
      if (strategy.timing === 'immediate') {
        // Generate immediately
        await this.preloadContainer(key, strategy);
      } else {
        // Schedule for idle time
        requestIdleCallback(() => this.preloadContainer(key, strategy));
      }
    }
  }

  /**
   * Preload a container
   */
  private async preloadContainer(
    key: string,
    strategy: PreloadStrategy
  ): Promise<void> {
    const [userId, containerId] = key.split('-');
    
    // Check if already cached
    if (this.checkCache(key)) {
      this.preloadQueue.delete(key);
      return;
    }

    // Generate in background
    try {
      const [containerType, subject] = containerId.split('-') as any;
      await this.generateContainerContent({
        userId,
        container: containerId,
        containerType,
        subject: subject.charAt(0).toUpperCase() + subject.slice(1) as Subject
      });
      
      console.log('[JIT] Preloaded content for:', containerId);
    } catch (error) {
      console.error('[JIT] Preload failed:', error);
    }

    this.preloadQueue.delete(key);
  }

  /**
   * Check if younger grade
   */
  private isYoungerGrade(state: any): boolean {
    // Implementation would check actual grade
    return false; // Placeholder
  }

  /**
   * Convert grade to number
   */
  private gradeToNumber(grade: Grade): number {
    const gradeMap: Record<string, number> = {
      'K': 0, '1': 1, '2': 2, '3': 3, '4': 4,
      '5': 5, '6': 6, '7': 7, '8': 8
    };
    return gradeMap[grade] || 3;
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage
    let totalSize = 0;
    
    this.memoryCache.forEach(cache => {
      totalSize += JSON.stringify(cache).length * 2; // Unicode chars = 2 bytes
    });
    
    this.sessionCache.forEach(cache => {
      totalSize += JSON.stringify(cache).length * 2;
    });

    return totalSize;
  }

  /**
   * Setup cache management
   */
  private setupCacheManagement(): void {
    // Periodic cache cleanup
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 60000); // Every minute

    // Periodic metrics reset
    setInterval(() => {
      this.cacheHits = 0;
      this.cacheMisses = 0;
    }, 3600000); // Every hour
  }

  /**
   * Cleanup expired cache entries
   */
  private cleanupExpiredCache(): void {
    const now = new Date();
    
    // Clean memory cache
    this.memoryCache.forEach((cache, key) => {
      if (this.isCacheExpired(cache)) {
        this.memoryCache.delete(key);
      }
    });

    // Clean session cache
    this.sessionCache.forEach((cache, key) => {
      if (this.isCacheExpired(cache)) {
        this.sessionCache.delete(key);
      }
    });
  }

  /**
   * Persist session cache
   */
  private persistSessionCache(): void {
    try {
      // Convert Map to array for serialization
      const cacheArray = Array.from(this.sessionCache.entries()).map(([key, cache]) => ({
        key,
        cache: {
          ...cache,
          content: cache.content // Simplified for storage
        }
      }));

      sessionStorage.setItem('jit_content_cache', JSON.stringify(cacheArray));
    } catch (error) {
      console.error('[JIT] Failed to persist cache:', error);
    }
  }

  /**
   * Restore session cache
   */
  private restoreSessionCache(): void {
    try {
      const stored = sessionStorage.getItem('jit_content_cache');
      if (stored) {
        const cacheArray = JSON.parse(stored);
        cacheArray.forEach((item: any) => {
          // Restore dates
          item.cache.timestamp = new Date(item.cache.timestamp);
          item.cache.expiresAt = new Date(item.cache.expiresAt);
          item.cache.lastAccessed = new Date(item.cache.lastAccessed);
          
          if (!this.isCacheExpired(item.cache)) {
            this.sessionCache.set(item.key, item.cache);
          }
        });
        
        console.log('[JIT] Restored', this.sessionCache.size, 'cache entries');
      }
    } catch (error) {
      console.error('[JIT] Failed to restore cache:', error);
    }
  }
}

// Export singleton instance getter
export const getJustInTimeContentService = () => JustInTimeContentService.getInstance();