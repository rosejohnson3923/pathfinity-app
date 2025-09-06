/**
 * CONTENT GENERATION PIPELINE - ORCHESTRATION SERVICE
 * 
 * Orchestrates the entire content generation process:
 * - Integrates with JIT services
 * - Uses QuestionFactory for type-safe generation
 * - Validates with QuestionValidator
 * - Applies consistency checks
 * - Manages caching
 */

import { Question, QuestionType } from './QuestionTypes';
import { questionFactory } from './QuestionFactory';
import { questionValidator } from './QuestionValidator';
import { DailyLearningContextManager } from './DailyLearningContextManager';
import { ConsistencyValidator } from './ConsistencyValidator';
import { SkillAdaptationService } from './SkillAdaptationService';
import { ContentVolumeManager } from './ContentVolumeManager';

// ================================================================
// INTERFACES
// ================================================================

export interface ContentGenerationRequest {
  userId: string;
  subject: string;
  topic: string;
  skill: {
    id: string;
    name: string;
    grade_level: string;
  };
  questionTypes?: QuestionType[];
  count?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'adaptive';
  timeConstraint?: number; // in minutes
  containerType?: 'learn' | 'experience' | 'discover';
}

export interface GeneratedContent {
  questions: Question[];
  metadata: {
    generatedAt: number;
    userId: string;
    subject: string;
    topic: string;
    skill: any;
    career?: any;
    companion?: any;
    totalQuestions: number;
    questionTypes: QuestionType[];
    estimatedTime: number; // in minutes
    difficulty: string;
  };
  consistency: {
    validated: boolean;
    corrections: number;
    careerAligned: boolean;
  };
}

export interface ContentGenerationOptions {
  useCache?: boolean;
  validateConsistency?: boolean;
  adaptToPerformance?: boolean;
  includeHints?: boolean;
  includeExplanations?: boolean;
}

// ================================================================
// CONTENT GENERATION PIPELINE CLASS
// ================================================================

export class ContentGenerationPipeline {
  private static instance: ContentGenerationPipeline;
  private cache: Map<string, GeneratedContent> = new Map();
  private cacheTimeout: number = 30 * 60 * 1000; // 30 minutes

  private dailyContextManager: DailyLearningContextManager;
  private consistencyValidator: ConsistencyValidator;
  private skillAdapter: SkillAdaptationService;
  private volumeManager: ContentVolumeManager;

  private constructor() {
    this.dailyContextManager = DailyLearningContextManager.getInstance();
    this.consistencyValidator = ConsistencyValidator.getInstance();
    this.skillAdapter = SkillAdaptationService.getInstance();
    this.volumeManager = ContentVolumeManager.getInstance();
  }

  public static getInstance(): ContentGenerationPipeline {
    if (!ContentGenerationPipeline.instance) {
      ContentGenerationPipeline.instance = new ContentGenerationPipeline();
    }
    return ContentGenerationPipeline.instance;
  }

  // ================================================================
  // MAIN GENERATION METHOD
  // ================================================================

  public async generateContent(
    request: ContentGenerationRequest,
    options: ContentGenerationOptions = {}
  ): Promise<GeneratedContent> {
    const startTime = Date.now();

    // 1. Check cache if enabled
    if (options.useCache !== false) {
      const cached = this.getCachedContent(request);
      if (cached) {
        console.log('[Pipeline] Returning cached content');
        return cached;
      }
    }

    // 2. Get daily context
    const dailyContext = this.dailyContextManager.getCurrentContext();
    if (!dailyContext) {
      throw new Error('No daily context available');
    }

    // 3. Adapt skill to subject if needed
    const adaptedSkill = await this.skillAdapter.adaptSkillToSubject(
      request.skill,
      request.subject,
      dailyContext.selectedCareer
    );

    // 4. Determine question types and count
    const questionTypes = this.selectQuestionTypes(
      request.questionTypes,
      request.skill.grade_level,
      request.containerType
    );

    const questionCount = this.determineQuestionCount(
      request.count,
      request.timeConstraint,
      request.containerType
    );

    // 5. Generate questions
    const questions = await this.generateQuestions(
      adaptedSkill,
      questionTypes,
      questionCount,
      request.difficulty || 'medium',
      dailyContext
    );

    // 6. Validate questions
    const validatedQuestions = this.validateQuestions(questions);

    // 7. Apply consistency if enabled
    let finalQuestions = validatedQuestions;
    let corrections = 0;
    
    if (options.validateConsistency !== false) {
      const consistencyResult = await this.applyConsistency(
        validatedQuestions,
        dailyContext
      );
      finalQuestions = consistencyResult.questions;
      corrections = consistencyResult.corrections;
    }

    // 8. Add hints and explanations if requested
    if (options.includeHints || options.includeExplanations) {
      finalQuestions = await this.enrichQuestions(
        finalQuestions,
        options.includeHints || false,
        options.includeExplanations || false
      );
    }

    // 9. Create result
    const result: GeneratedContent = {
      questions: finalQuestions,
      metadata: {
        generatedAt: Date.now(),
        userId: request.userId,
        subject: request.subject,
        topic: request.topic,
        skill: adaptedSkill,
        career: dailyContext.selectedCareer,
        companion: dailyContext.companion,
        totalQuestions: finalQuestions.length,
        questionTypes: [...new Set(finalQuestions.map(q => q.type))],
        estimatedTime: this.estimateTime(finalQuestions),
        difficulty: request.difficulty || 'medium'
      },
      consistency: {
        validated: options.validateConsistency !== false,
        corrections,
        careerAligned: true
      }
    };

    // 10. Cache result
    if (options.useCache !== false) {
      this.cacheContent(request, result);
    }

    const endTime = Date.now();
    console.log(`[Pipeline] Content generated in ${endTime - startTime}ms`);

    return result;
  }

  // ================================================================
  // QUESTION TYPE SELECTION
  // ================================================================

  private selectQuestionTypes(
    requested: QuestionType[] | undefined,
    gradeLevel: string,
    containerType?: string
  ): QuestionType[] {
    if (requested && requested.length > 0) {
      return requested;
    }

    const gradeNum = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);

    // Select appropriate types based on grade level
    if (gradeNum <= 2) {
      // K-2: Simple types
      return ['multiple_choice', 'true_false', 'counting', 'visual_identification'];
    } else if (gradeNum <= 5) {
      // 3-5: Intermediate types
      return ['multiple_choice', 'true_false', 'fill_blank', 'numeric', 
              'matching', 'ordering', 'counting'];
    } else if (gradeNum <= 8) {
      // 6-8: Advanced types
      return ['multiple_choice', 'short_answer', 'numeric', 'matching', 
              'ordering', 'classification', 'pattern_recognition'];
    } else {
      // 9-12: All types
      return ['multiple_choice', 'short_answer', 'long_answer', 'numeric',
              'matching', 'ordering', 'classification', 'code_completion'];
    }
  }

  // ================================================================
  // QUESTION COUNT DETERMINATION
  // ================================================================

  private determineQuestionCount(
    requested: number | undefined,
    timeConstraint: number | undefined,
    containerType?: string
  ): number {
    if (requested) return requested;

    if (timeConstraint) {
      // Estimate ~1 minute per question average
      return Math.min(Math.max(3, timeConstraint), 20);
    }

    // Default based on container type
    switch (containerType) {
      case 'learn':
        return 10;
      case 'experience':
        return 8;
      case 'discover':
        return 6;
      default:
        return 10;
    }
  }

  // ================================================================
  // QUESTION GENERATION
  // ================================================================

  private async generateQuestions(
    skill: any,
    types: QuestionType[],
    count: number,
    difficulty: string,
    context: any
  ): Promise<Question[]> {
    const questions: Question[] = [];
    const questionsPerType = Math.ceil(count / types.length);

    for (const type of types) {
      const typeCount = Math.min(questionsPerType, count - questions.length);
      
      for (let i = 0; i < typeCount; i++) {
        const question = await this.generateSingleQuestion(
          type,
          skill,
          difficulty,
          context,
          i
        );
        questions.push(question);
      }
    }

    return questions;
  }

  private async generateSingleQuestion(
    type: QuestionType,
    skill: any,
    difficulty: string,
    context: any,
    index: number
  ): Promise<Question> {
    // This is where you'd integrate with AI service
    // For now, using factory to create sample questions
    
    const baseContent = `${skill.name} question ${index + 1}`;
    const topic = skill.name;

    switch (type) {
      case 'multiple_choice':
        return questionFactory.createMultipleChoice({
          content: `Which of the following best describes ${skill.name}?`,
          topic,
          options: [
            { text: 'Option A', isCorrect: index === 0 },
            { text: 'Option B', isCorrect: index === 1 },
            { text: 'Option C', isCorrect: index === 2 },
            { text: 'Option D', isCorrect: index > 2 }
          ],
          difficulty: difficulty as any,
          points: 10
        });

      case 'true_false':
        return questionFactory.createTrueFalse({
          content: `Is this statement about ${skill.name} true or false?`,
          statement: `${skill.name} is important for ${context.selectedCareer?.name}`,
          topic,
          correctAnswer: true,
          difficulty: difficulty as any,
          points: 5
        });

      case 'numeric':
        return questionFactory.createNumeric({
          content: `Calculate the value related to ${skill.name}`,
          topic,
          correctAnswer: 42 + index,
          tolerance: 0.1,
          difficulty: difficulty as any,
          points: 10
        });

      case 'counting':
        return questionFactory.createCounting({
          content: `Count the items related to ${skill.name}`,
          topic,
          countWhat: 'objects',
          correctCount: 5 + index,
          difficulty: difficulty as any,
          points: 5
        });

      case 'fill_blank':
        return questionFactory.createFillBlank({
          content: `Complete the sentence about ${skill.name}`,
          topic,
          template: `The {{blank_0}} is important for ${skill.name}`,
          blanks: [{
            position: 0,
            correctAnswers: ['concept', 'idea', 'principle']
          }],
          difficulty: difficulty as any,
          points: 10
        });

      default:
        // Fallback to open-ended
        return questionFactory.createOpenEnded({
          content: `Describe your understanding of ${skill.name}`,
          topic,
          prompt: `How does ${skill.name} relate to ${context.selectedCareer?.name}?`,
          difficulty: difficulty as any,
          points: 15
        });
    }
  }

  // ================================================================
  // VALIDATION
  // ================================================================

  private validateQuestions(questions: Question[]): Question[] {
    const validated: Question[] = [];

    for (const question of questions) {
      const validation = questionValidator.validateQuestionStructure(question);
      
      if (validation.isValid) {
        validated.push(question);
      } else {
        console.warn('[Pipeline] Invalid question:', validation.errors);
        // Could generate replacement here
      }
    }

    return validated;
  }

  // ================================================================
  // CONSISTENCY
  // ================================================================

  private async applyConsistency(
    questions: Question[],
    context: any
  ): Promise<{ questions: Question[]; corrections: number }> {
    let corrections = 0;
    const consistent: Question[] = [];

    for (const question of questions) {
      const validation = this.consistencyValidator.validateQuestionConsistency(
        question,
        context
      );

      if (validation.isConsistent) {
        consistent.push(question);
      } else {
        // Apply corrections
        const corrected = this.consistencyValidator.enforceConsistency(
          question,
          context
        );
        consistent.push(corrected);
        corrections++;
      }
    }

    return { questions: consistent, corrections };
  }

  // ================================================================
  // ENRICHMENT
  // ================================================================

  private async enrichQuestions(
    questions: Question[],
    includeHints: boolean,
    includeExplanations: boolean
  ): Promise<Question[]> {
    return questions.map(question => {
      const enriched = { ...question };

      if (includeHints && !enriched.hints) {
        enriched.hints = this.generateHints(question);
      }

      if (includeExplanations && !enriched.explanation) {
        enriched.explanation = this.generateExplanation(question);
      }

      return enriched;
    });
  }

  private generateHints(question: Question): string[] {
    // Generate contextual hints based on question type
    const hints: string[] = [];

    switch (question.type) {
      case 'multiple_choice':
        hints.push('Read all options carefully before choosing');
        hints.push('Look for keywords in the question');
        break;
      case 'numeric':
        hints.push('Check your units');
        hints.push('Round to the appropriate decimal place');
        break;
      case 'fill_blank':
        hints.push('Consider the context of the sentence');
        hints.push('Think about grammar and word form');
        break;
      default:
        hints.push('Take your time and think carefully');
    }

    return hints;
  }

  private generateExplanation(question: Question): string {
    return `This question tests your understanding of ${question.topic}. ` +
           `It requires ${question.metadata?.bloomsLevel || 'understanding'} level thinking.`;
  }

  // ================================================================
  // TIME ESTIMATION
  // ================================================================

  private estimateTime(questions: Question[]): number {
    let totalMinutes = 0;

    for (const question of questions) {
      // Estimate based on question type
      switch (question.type) {
        case 'true_false':
          totalMinutes += 0.5;
          break;
        case 'multiple_choice':
        case 'counting':
          totalMinutes += 1;
          break;
        case 'fill_blank':
        case 'numeric':
        case 'short_answer':
          totalMinutes += 1.5;
          break;
        case 'matching':
        case 'ordering':
        case 'classification':
          totalMinutes += 2;
          break;
        case 'long_answer':
        case 'code_completion':
          totalMinutes += 5;
          break;
        default:
          totalMinutes += 1;
      }
    }

    return Math.ceil(totalMinutes);
  }

  // ================================================================
  // CACHING
  // ================================================================

  private getCacheKey(request: ContentGenerationRequest): string {
    return `${request.userId}_${request.subject}_${request.topic}_${request.skill.id}`;
  }

  private getCachedContent(request: ContentGenerationRequest): GeneratedContent | null {
    const key = this.getCacheKey(request);
    const cached = this.cache.get(key);

    if (cached) {
      const age = Date.now() - cached.metadata.generatedAt;
      if (age < this.cacheTimeout) {
        return cached;
      }
      // Remove expired cache
      this.cache.delete(key);
    }

    return null;
  }

  private cacheContent(request: ContentGenerationRequest, content: GeneratedContent): void {
    const key = this.getCacheKey(request);
    this.cache.set(key, content);

    // Limit cache size
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  // ================================================================
  // UTILITIES
  // ================================================================

  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheSize(): number {
    return this.cache.size;
  }

  public async validateContent(content: GeneratedContent): Promise<boolean> {
    // Validate all questions in content
    for (const question of content.questions) {
      const validation = questionValidator.validateQuestionStructure(question);
      if (!validation.isValid) {
        return false;
      }
    }
    return true;
  }
}

// ================================================================
// EXPORT SINGLETON INSTANCE
// ================================================================

export const contentGenerationPipeline = ContentGenerationPipeline.getInstance();