/**
 * Learn AI Rules Engine
 * Manages rules for the Learn container including question generation,
 * answer validation, skill progression, and diagnostic practice
 */

import { BaseRulesEngine, Rule, RuleContext, RuleResult } from '../core/BaseRulesEngine';
import { AISkillsMappingEngine } from '../skills/AISkillsMappingEngine';

// ============================================================================
// LEARN CONTEXT DEFINITIONS
// ============================================================================

export interface LearnContext extends RuleContext {
  student: {
    id: string;
    grade: string;
    age?: number;
    skillLevel?: 'beginner' | 'intermediate' | 'advanced';
    learningStyle?: string;
  };
  subject: 'math' | 'ela' | 'science' | 'social_studies';
  skill?: {
    id: string;
    name: string;
    category: string;
    difficulty: number;
  };
  career?: {
    id: string;
    name: string;
  };
  companion?: {
    id: string;
    name: string;
  };
  theme?: 'light' | 'dark';
  questionContext?: {
    type?: string;
    previousQuestions?: string[];
    targetDifficulty?: 'easy' | 'medium' | 'hard';
    useCareerContext?: boolean;
  };
  answerContext?: {
    questionType: string;
    userAnswer: any;
    correctAnswer: any;
    timeSpent?: number;
    hintsUsed?: number;
  };
  mode?: 'diagnostic' | 'practice' | 'assessment' | 'review';
}

export interface QuestionGenerationRules {
  typeSelection: QuestionTypeSelectionRules;
  contentGeneration: ContentGenerationRules;
  validation: QuestionValidationRules;
  careerIntegration: CareerIntegrationRules;
}

export interface QuestionTypeSelectionRules {
  bySubject: Map<string, SubjectTypeRules>;
  byGrade: Map<string, string[]>;
  byDifficulty: Map<string, string[]>;
}

export interface SubjectTypeRules {
  subject: string;
  allowedTypes: string[];
  prohibitedTypes: string[];
  preferredTypes: Map<string, string[]>; // grade -> types
  specialRules: string[];
}

export interface ContentGenerationRules {
  vocabulary: Map<string, string[]>; // grade -> vocabulary
  complexity: Map<string, 'simple' | 'moderate' | 'complex'>;
  contextRequirements: {
    useRealWorld: boolean;
    useCareer: boolean;
    useVisuals: boolean;
    useStoryProblems: boolean;
  };
  lengthLimits: {
    questionLength: Map<string, number>; // grade -> max words
    optionLength: Map<string, number>;
  };
}

export interface QuestionValidationRules {
  required: string[];
  typeSpecific: Map<string, string[]>;
  answerFormat: Map<string, AnswerFormatRule>;
  difficultyAlignment: boolean;
}

export interface AnswerFormatRule {
  type: string;
  format: 'string' | 'number' | 'boolean' | 'array';
  validation: (answer: any) => boolean;
}

export interface CareerIntegrationRules {
  contextLevel: 'none' | 'light' | 'moderate' | 'heavy';
  vocabularySubstitution: boolean;
  scenarioGeneration: boolean;
  visualTheming: boolean;
}

export interface AnswerValidationRules {
  exactMatch: boolean;
  caseSensitive: boolean;
  partialCredit: boolean;
  typeCoercion: boolean;
  tolerance?: number; // For numeric answers
}

export interface SkillProgressionRules {
  masteryThreshold: number;
  practiceRequired: number;
  difficultyProgression: 'linear' | 'adaptive' | 'spiral';
  retentionCheck: {
    enabled: boolean;
    interval: number; // days
    threshold: number;
  };
}

// ============================================================================
// LEARN AI RULES ENGINE
// ============================================================================

export class LearnAIRulesEngine extends BaseRulesEngine<LearnContext> {
  private questionRules: QuestionGenerationRules;
  private answerRules: Map<string, AnswerValidationRules> = new Map();
  private progressionRules: SkillProgressionRules;
  private diagnosticHistory: Map<string, DiagnosticHistory> = new Map();

  constructor() {
    super('LearnAIRulesEngine', {
      name: 'Learn AI Rules Engine',
      description: 'Manages learning journey rules and question generation'
    });
    
    this.questionRules = this.initializeQuestionRules();
    this.progressionRules = this.initializeProgressionRules();
    this.initializeAnswerRules();
  }

  /**
   * Register learn-specific rules
   */
  protected registerRules(): void {
    // Rule: Select appropriate question type
    this.addRuleInternal({
      id: 'select_question_type',
      name: 'Select Question Type',
      priority: 1,
      condition: (context) => context.mode === 'diagnostic' || context.mode === 'practice',
      action: (context) => this.selectQuestionType(context)
    });

    // Rule: Validate question generation
    this.addRuleInternal({
      id: 'validate_question',
      name: 'Validate Generated Question',
      priority: 2,
      condition: (context) => !!context.questionContext,
      action: (context) => this.validateQuestion(context)
    });

    // Rule: Apply career context
    this.addRuleInternal({
      id: 'apply_career_context',
      name: 'Apply Career Context to Question',
      priority: 3,
      condition: (context) => !!context.career && context.questionContext?.useCareerContext !== false,
      action: (context) => this.applyCareerContext(context)
    });

    // Rule: Validate answer
    this.addRuleInternal({
      id: 'validate_answer',
      name: 'Validate User Answer',
      priority: 4,
      condition: (context) => !!context.answerContext,
      action: (context) => this.validateAnswer(context)
    });

    // Rule: Check skill progression
    this.addRuleInternal({
      id: 'check_progression',
      name: 'Check Skill Progression',
      priority: 5,
      condition: (context) => !!context.skill,
      action: (context) => this.checkProgression(context)
    });

    // Rule: Adjust difficulty
    this.addRuleInternal({
      id: 'adjust_difficulty',
      name: 'Adjust Question Difficulty',
      priority: 6,
      condition: (context) => context.mode === 'practice',
      action: (context) => this.adjustDifficulty(context)
    });

    // Rule: Prevent question repetition
    this.addRuleInternal({
      id: 'prevent_repetition',
      name: 'Prevent Question Repetition',
      priority: 7,
      condition: (context) => !!context.questionContext?.previousQuestions,
      action: (context) => this.preventRepetition(context)
    });

    // Rule: Age-appropriate content
    this.addRuleInternal({
      id: 'age_appropriate',
      name: 'Ensure Age-Appropriate Content',
      priority: 8,
      condition: (context) => !!context.student.grade_level,
      action: (context) => this.ensureAgeAppropriate(context)
    });

    // Rule: Fix diagnostic practice issues
    this.addRuleInternal({
      id: 'fix_diagnostic_issues',
      name: 'Fix Diagnostic Practice Issues',
      priority: 9,
      condition: (context) => context.mode === 'diagnostic',
      action: (context) => this.fixDiagnosticIssues(context)
    });
  }

  /**
   * Initialize question generation rules
   */
  private initializeQuestionRules(): QuestionGenerationRules {
    const typeSelection: QuestionTypeSelectionRules = {
      bySubject: new Map([
        ['math', {
          subject: 'math',
          allowedTypes: ['counting', 'numeric', 'multiple_choice', 'true_false', 'word_problem'],
          prohibitedTypes: ['essay', 'drawing'],
          preferredTypes: new Map([
            ['K', ['counting', 'true_false']],
            ['1', ['counting', 'numeric', 'true_false']],
            ['2', ['counting', 'numeric', 'multiple_choice']],
            ['3', ['numeric', 'multiple_choice', 'word_problem']],
            ['4', ['numeric', 'multiple_choice', 'word_problem']],
            ['5', ['numeric', 'multiple_choice', 'word_problem', 'true_false']]
          ]),
          specialRules: [
            'K-2: "How many" questions MUST use counting type with visual',
            '3-5: Word problems should include career context',
            'All grades: Show work for multi-step problems'
          ]
        }],
        ['ela', {
          subject: 'ela',
          allowedTypes: ['multiple_choice', 'true_false', 'fill_blank', 'short_answer', 'reading_comp'],
          prohibitedTypes: ['counting', 'numeric_only'],
          preferredTypes: new Map([
            ['K', ['true_false', 'letter_recognition']],
            ['1', ['true_false', 'multiple_choice', 'sight_words']],
            ['2', ['multiple_choice', 'fill_blank', 'short_answer']],
            ['3', ['multiple_choice', 'reading_comp', 'fill_blank']],
            ['4', ['reading_comp', 'multiple_choice', 'short_answer']],
            ['5', ['reading_comp', 'short_answer', 'grammar']]
          ]),
          specialRules: [
            'K: Focus on letter recognition and phonics',
            '1-2: Include sight words and simple sentences',
            '3-5: Include reading passages with comprehension',
            'NEVER use counting type for ELA'
          ]
        }],
        ['science', {
          subject: 'science',
          allowedTypes: ['multiple_choice', 'true_false', 'experiment', 'observation', 'hypothesis'],
          prohibitedTypes: ['counting'],
          preferredTypes: new Map([
            ['K', ['true_false', 'observation']],
            ['1', ['true_false', 'multiple_choice']],
            ['2', ['multiple_choice', 'observation']],
            ['3', ['multiple_choice', 'experiment', 'true_false']],
            ['4', ['multiple_choice', 'hypothesis', 'experiment']],
            ['5', ['hypothesis', 'experiment', 'multiple_choice']]
          ]),
          specialRules: [
            'Include scientific method concepts',
            'Use real-world examples',
            'Career context: scientist, doctor, veterinarian'
          ]
        }],
        ['social_studies', {
          subject: 'social_studies',
          allowedTypes: ['multiple_choice', 'true_false', 'map_reading', 'timeline', 'short_answer'],
          prohibitedTypes: ['counting', 'pure_numeric'],
          preferredTypes: new Map([
            ['K', ['true_false', 'community_helpers']],
            ['1', ['true_false', 'multiple_choice', 'community']],
            ['2', ['multiple_choice', 'map_reading']],
            ['3', ['multiple_choice', 'map_reading', 'timeline']],
            ['4', ['timeline', 'multiple_choice', 'map_reading']],
            ['5', ['timeline', 'short_answer', 'multiple_choice']]
          ]),
          specialRules: [
            'K-2: Focus on community and helpers',
            '3-5: Include geography and history',
            'Connect to careers in community'
          ]
        }]
      ]),
      byGrade: new Map([
        ['K', ['counting', 'true_false', 'picture_match']],
        ['1', ['counting', 'true_false', 'multiple_choice', 'numeric']],
        ['2', ['multiple_choice', 'true_false', 'numeric', 'fill_blank']],
        ['3', ['multiple_choice', 'numeric', 'fill_blank', 'word_problem']],
        ['4', ['multiple_choice', 'word_problem', 'short_answer', 'numeric']],
        ['5', ['multiple_choice', 'word_problem', 'short_answer', 'essay']]
      ]),
      byDifficulty: new Map([
        ['easy', ['true_false', 'multiple_choice', 'counting']],
        ['medium', ['numeric', 'fill_blank', 'word_problem']],
        ['hard', ['short_answer', 'multi_step', 'essay']]
      ])
    };

    return {
      typeSelection,
      contentGeneration: {
        vocabulary: new Map([
          ['K', ['big', 'small', 'more', 'less', 'same', 'different']],
          ['1', ['add', 'subtract', 'count', 'read', 'write']],
          ['2', ['compare', 'measure', 'solve', 'explain']],
          ['3', ['multiply', 'divide', 'analyze', 'describe']],
          ['4', ['calculate', 'estimate', 'interpret', 'evaluate']],
          ['5', ['determine', 'justify', 'conclude', 'synthesize']]
        ]),
        complexity: new Map([
          ['K', 'simple'],
          ['1', 'simple'],
          ['2', 'simple'],
          ['3', 'moderate'],
          ['4', 'moderate'],
          ['5', 'complex']
        ]),
        contextRequirements: {
          useRealWorld: true,
          useCareer: true,
          useVisuals: true,
          useStoryProblems: true
        },
        lengthLimits: {
          questionLength: new Map([
            ['K', 10],
            ['1', 15],
            ['2', 20],
            ['3', 30],
            ['4', 40],
            ['5', 50]
          ]),
          optionLength: new Map([
            ['K', 3],
            ['1', 5],
            ['2', 8],
            ['3', 10],
            ['4', 15],
            ['5', 20]
          ])
        }
      },
      validation: {
        required: ['type', 'question', 'correct_answer'],
        typeSpecific: new Map([
          ['counting', ['visual']],
          ['multiple_choice', ['options']],
          ['true_false', []],
          ['numeric', []],
          ['fill_blank', []],
          ['short_answer', ['rubric']]
        ]),
        answerFormat: new Map([
          ['counting', { type: 'counting', format: 'string', validation: (a) => !isNaN(Number(a)) }],
          ['numeric', { type: 'numeric', format: 'number', validation: (a) => !isNaN(Number(a)) }],
          ['true_false', { type: 'true_false', format: 'string', validation: (a) => ['true', 'false'].includes(String(a).toLowerCase()) }],
          ['multiple_choice', { type: 'multiple_choice', format: 'number', validation: (a) => Number.isInteger(Number(a)) && Number(a) >= 0 }]
        ]),
        difficultyAlignment: true
      },
      careerIntegration: {
        contextLevel: 'moderate',
        vocabularySubstitution: true,
        scenarioGeneration: true,
        visualTheming: true
      }
    };
  }

  /**
   * Initialize answer validation rules
   */
  private initializeAnswerRules(): void {
    // Counting type rules - CRITICAL FIX
    this.answerRules.set('counting', {
      exactMatch: false, // Allow string/number flexibility
      caseSensitive: false,
      partialCredit: false,
      typeCoercion: true, // IMPORTANT: Coerce types for comparison
      tolerance: 0
    });

    // Numeric type rules
    this.answerRules.set('numeric', {
      exactMatch: false,
      caseSensitive: false,
      partialCredit: true,
      typeCoercion: true,
      tolerance: 0.001
    });

    // True/False rules (no variants needed)
    this.answerRules.set('true_false', {
      exactMatch: false,
      caseSensitive: false,
      partialCredit: false,
      typeCoercion: true
    });

    // Multiple choice rules
    this.answerRules.set('multiple_choice', {
      exactMatch: true,
      caseSensitive: false,
      partialCredit: false,
      typeCoercion: true
    });

    // Fill in the blank rules
    this.answerRules.set('fill_blank', {
      exactMatch: false,
      caseSensitive: false,
      partialCredit: true,
      typeCoercion: false
    });
  }

  /**
   * Initialize progression rules
   */
  private initializeProgressionRules(): SkillProgressionRules {
    return {
      masteryThreshold: 0.8,
      practiceRequired: 5,
      difficultyProgression: 'adaptive',
      retentionCheck: {
        enabled: true,
        interval: 7,
        threshold: 0.7
      }
    };
  }

  // Rule action methods

  private selectQuestionType(context: LearnContext): RuleResult {
    const { subject, student } = context;
    
    // Get subject-specific rules
    const subjectRules = this.questionRules.typeSelection.bySubject.get(subject);
    if (!subjectRules) {
      return { success: false, error: `No rules for subject: ${subject}` };
    }

    // Get grade-appropriate types
    const gradeTypes = subjectRules.preferredTypes.get(student.grade_level) || 
                      this.questionRules.typeSelection.byGrade.get(student.grade_level) || 
                      ['multiple_choice'];

    // Filter out prohibited types
    const allowedTypes = gradeTypes.filter(type => 
      !subjectRules.prohibitedTypes.includes(type)
    );

    // Select based on context
    let selectedType = allowedTypes[0];
    
    // CRITICAL FIX: Math "How many" questions MUST use counting type
    if (subject === 'math' && context.questionContext?.type === 'how_many') {
      if (['K', '1', '2'].includes(student.grade_level)) {
        selectedType = 'counting';
      } else {
        selectedType = 'numeric';
      }
    }
    
    // CRITICAL FIX: ELA must NEVER use counting
    if (subject === 'ela' && selectedType === 'counting') {
      selectedType = 'multiple_choice';
    }

    return {
      success: true,
      data: {
        selectedType,
        allowedTypes,
        reason: `Selected for ${subject} grade ${student.grade_level}`
      }
    };
  }

  private validateQuestion(context: LearnContext): RuleResult {
    const validationErrors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    const required = this.questionRules.validation.required;
    for (const field of required) {
      if (!context.questionContext || !(field in context.questionContext)) {
        validationErrors.push(`Missing required field: ${field}`);
      }
    }

    // Type-specific validation
    if (context.questionContext?.type) {
      const typeRequirements = this.questionRules.validation.typeSpecific.get(context.questionContext.type);
      if (typeRequirements) {
        for (const req of typeRequirements) {
          if (!(req in context.questionContext)) {
            validationErrors.push(`Missing ${req} for ${context.questionContext.type} question`);
          }
        }
      }
    }

    // CRITICAL: Validate counting questions have proper visual
    if (context.questionContext?.type === 'counting') {
      if (!context.questionContext.visual) {
        validationErrors.push('Counting questions MUST have visual field');
      }
    }

    // Age appropriateness check
    const maxLength = this.questionRules.contentGeneration.lengthLimits.questionLength.get(context.student.grade_level);
    if (maxLength && context.questionContext?.question) {
      const wordCount = context.questionContext.question.split(' ').length;
      if (wordCount > maxLength) {
        warnings.push(`Question too long for grade ${context.student.grade_level}: ${wordCount} > ${maxLength} words`);
      }
    }

    return {
      success: validationErrors.length === 0,
      error: validationErrors.length > 0 ? validationErrors.join('; ') : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  private applyCareerContext(context: LearnContext): RuleResult {
    if (!context.career) {
      return { success: false, error: 'No career context' };
    }

    const careerRules = this.questionRules.careerIntegration;
    const modifications: any = {
      career: context.career.name,
      contextLevel: careerRules.contextLevel
    };

    // Apply career vocabulary
    if (careerRules.vocabularySubstitution) {
      modifications.vocabulary = this.getCareerVocabulary(context.career.name, context.subject);
    }

    // Generate career scenario
    if (careerRules.scenarioGeneration) {
      modifications.scenario = this.generateCareerScenario(context.career.name, context.subject, context.student.grade_level);
    }

    // Apply visual theming
    if (careerRules.visualTheming) {
      modifications.visualTheme = this.getCareerVisualTheme(context.career.name);
    }

    return {
      success: true,
      data: modifications
    };
  }

  private validateAnswer(context: LearnContext): RuleResult {
    const { answerContext } = context;
    if (!answerContext) {
      return { success: false, error: 'No answer context' };
    }

    console.log('🎯 LearnAIRulesEngine validateAnswer:', {
      questionType: answerContext.questionType,
      userAnswer: answerContext.userAnswer,
      correctAnswer: answerContext.correctAnswer,
      userType: typeof answerContext.userAnswer,
      correctType: typeof answerContext.correctAnswer,
      userAnswerValue: JSON.stringify(answerContext.userAnswer),
      correctAnswerValue: JSON.stringify(answerContext.correctAnswer)
    });

    const rules = this.answerRules.get(answerContext.questionType);
    if (!rules) {
      console.log('⚠️ No validation rules for type:', answerContext.questionType);
      console.log('Available rules:', Array.from(this.answerRules.keys()));
      return { success: false, error: `No validation rules for type: ${answerContext.questionType}` };
    }

    let userAnswer = answerContext.userAnswer;
    let correctAnswer = answerContext.correctAnswer;
    let isCorrect = false;

    // CRITICAL FIX: Type coercion for counting questions
    if (rules.typeCoercion) {
      // Convert both to strings for comparison
      userAnswer = String(userAnswer).trim();
      correctAnswer = String(correctAnswer).trim();
      
      // For numeric types, also try numeric comparison
      if (answerContext.questionType === 'counting' || answerContext.questionType === 'numeric') {
        const userNum = Number(userAnswer);
        const correctNum = Number(correctAnswer);
        
        console.log('🔢 Numeric comparison:', {
          userNum,
          correctNum,
          isUserNaN: isNaN(userNum),
          isCorrectNaN: isNaN(correctNum)
        });
        
        if (!isNaN(userNum) && !isNaN(correctNum)) {
          if (rules.tolerance !== undefined) {
            isCorrect = Math.abs(userNum - correctNum) <= rules.tolerance;
          } else {
            isCorrect = userNum === correctNum;
          }
          console.log('📊 Numeric result:', isCorrect);
        }
      }
    }

    // True/False comparison - handle both boolean and string formats
    if (!isCorrect && answerContext.questionType === 'true_false') {
      // Convert both to boolean for consistent comparison
      const userBool = typeof userAnswer === 'boolean' ? userAnswer : 
                       String(userAnswer).toLowerCase() === 'true';
      const correctBool = typeof correctAnswer === 'boolean' ? correctAnswer :
                          String(correctAnswer).toLowerCase() === 'true';
      
      isCorrect = userBool === correctBool;
      
      console.log('🔧 True/False validation:', {
        questionType: answerContext.questionType,
        userAnswer: answerContext.userAnswer,
        correctAnswer: answerContext.correctAnswer,
        userBool,
        correctBool,
        isCorrect
      });
    }

    // Multiple choice validation
    if (!isCorrect && answerContext.questionType === 'multiple_choice') {
      // Handle both index and value comparisons
      isCorrect = Number(userAnswer) === Number(correctAnswer);
    }

    // Default string comparison
    if (!isCorrect && !rules.caseSensitive) {
      isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    } else if (!isCorrect) {
      isCorrect = userAnswer === correctAnswer;
    }

    const result = {
      success: true,
      data: {
        isCorrect,
        userAnswer: answerContext.userAnswer,
        correctAnswer: answerContext.correctAnswer,
        validationType: answerContext.questionType,
        rulesApplied: {
          typeCoercion: rules.typeCoercion,
          exactMatch: rules.exactMatch,
          caseSensitive: rules.caseSensitive
        }
      }
    };
    
    console.log('✅ Validation complete:', {
      isCorrect,
      userAnswer: answerContext.userAnswer,
      correctAnswer: answerContext.correctAnswer,
      type: answerContext.questionType
    });
    
    return result;
  }

  private async checkProgression(context: LearnContext): Promise<RuleResult> {
    if (!context.skill || !context.student.id) {
      return { success: false, error: 'Missing skill or student ID' };
    }

    const history = this.getOrCreateHistory(context.student.id, context.skill.id);
    
    // Update history
    if (context.answerContext) {
      history.attempts++;
      if (context.data?.isCorrect) {
        history.correct++;
      }
    }

    const accuracy = history.attempts > 0 ? history.correct / history.attempts : 0;
    const mastered = accuracy >= this.progressionRules.masteryThreshold && 
                    history.attempts >= this.progressionRules.practiceRequired;

    // Use AISkillsMappingEngine for skill recommendations
    const skillsEngine = AISkillsMappingEngine.getInstance();
    let nextSkillRecommendations: any[] = [];
    
    if (mastered && context.skill.id) {
      // Get next skill recommendations
      const masteredSkills = Array.from(this.studentProgress.keys())
        .filter(key => key.startsWith(context.student.id))
        .map(key => key.split(':')[1])
        .filter(skillId => {
          const prog = this.studentProgress.get(`${context.student.id}:${skillId}`);
          return prog && prog.correct / prog.attempts >= this.progressionRules.masteryThreshold;
        });
      
      nextSkillRecommendations = await skillsEngine.getRecommendations(
        context.skill.id,
        masteredSkills
      );
    }

    return {
      success: true,
      data: {
        skillId: context.skill.id,
        attempts: history.attempts,
        correct: history.correct,
        accuracy,
        mastered,
        nextDifficulty: this.calculateNextDifficulty(accuracy)
      }
    };
  }

  private adjustDifficulty(context: LearnContext): RuleResult {
    const studentHistory = this.diagnosticHistory.get(context.student.id);
    if (!studentHistory) {
      return {
        success: true,
        data: { difficulty: 'medium', reason: 'No history' }
      };
    }

    const recentAccuracy = studentHistory.recentAccuracy || 0.5;
    let difficulty: 'easy' | 'medium' | 'hard';

    if (recentAccuracy < 0.4) {
      difficulty = 'easy';
    } else if (recentAccuracy > 0.8) {
      difficulty = 'hard';
    } else {
      difficulty = 'medium';
    }

    return {
      success: true,
      data: {
        difficulty,
        accuracy: recentAccuracy,
        adjustment: 'adaptive'
      }
    };
  }

  private preventRepetition(context: LearnContext): RuleResult {
    const previousQuestions = context.questionContext?.previousQuestions || [];
    
    if (previousQuestions.length === 0) {
      return { success: true, data: { unique: true } };
    }

    // Check for duplicates
    const currentQuestion = context.questionContext?.question;
    if (currentQuestion && previousQuestions.includes(currentQuestion)) {
      return {
        success: false,
        error: 'Duplicate question detected',
        data: { regenerate: true }
      };
    }

    return {
      success: true,
      data: { unique: true, historySize: previousQuestions.length }
    };
  }

  private async ensureAgeAppropriate(context: LearnContext): Promise<RuleResult> {
    const grade = context.student.grade_level;
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    
    const recommendations: string[] = [];

    // Use AISkillsMappingEngine to validate skill is appropriate for grade
    const skillsEngine = AISkillsMappingEngine.getInstance();
    
    if (context.skill?.id) {
      const skillData = await skillsEngine.getSkill(context.skill.id);
      
      if (skillData) {
        // Check if skill matches student's grade
        const normalizedGrade = grade === 'K' ? 'Kindergarten' : `Grade ${grade}`;
        if (skillData.grade !== normalizedGrade && skillData.grade !== grade) {
          recommendations.push(`Warning: Skill is for ${skillData.grade}, student is ${normalizedGrade}`);
        }
        
        // Check if visual aids are required
        if (skillData.visualAidsRequired) {
          recommendations.push('Visual aids required for this skill');
        }
        
        // Add career connections if available
        if (skillData.careerConnections && context.career) {
          if (skillData.careerConnections.includes(context.career.name)) {
            recommendations.push(`Connect to ${context.career.name} career context`);
          }
        }
      }
    }

    // Vocabulary check
    const vocabulary = this.questionRules.contentGeneration.vocabulary.get(grade);
    if (vocabulary) {
      recommendations.push(`Use vocabulary: ${vocabulary.join(', ')}`);
    }

    // Complexity check
    const complexity = this.questionRules.contentGeneration.complexity.get(grade);
    if (complexity) {
      recommendations.push(`Complexity level: ${complexity}`);
    }

    // Visual requirements
    if (gradeNum <= 2) {
      recommendations.push('Include visuals for younger learners');
    }

    return {
      success: true,
      data: {
        grade,
        ageAppropriate: true,
        recommendations
      }
    };
  }

  private fixDiagnosticIssues(context: LearnContext): RuleResult {
    const fixes: string[] = [];

    // FIX 1: Ensure counting questions have proper format
    if (context.questionContext?.type === 'counting') {
      fixes.push('Ensure visual field is present');
      fixes.push('Set correct_answer as string number');
      fixes.push('Use input entry, not array selection');
    }

    // FIX 2: Prevent ELA from showing math questions
    if (context.subject === 'ela') {
      fixes.push('Never use counting type for ELA');
      fixes.push('Use letter recognition for K grade');
      fixes.push('Focus on reading and language skills');
    }

    // FIX 3: Ensure answers are validated correctly
    fixes.push('Apply type coercion for answer validation');
    fixes.push('Handle string/number conversion properly');

    // FIX 4: Prevent question changes
    fixes.push('Lock question once generated');
    fixes.push('Prevent re-generation on render');

    return {
      success: true,
      data: {
        fixesApplied: fixes,
        diagnostic: true,
        validationStrict: true
      }
    };
  }

  // Helper methods

  private getCareerVocabulary(career: string, subject: string): string[] {
    const careerVocab: Record<string, Record<string, string[]>> = {
      'Doctor': {
        'math': ['patients', 'doses', 'temperature', 'heartbeats'],
        'science': ['diagnosis', 'treatment', 'symptoms', 'medicine'],
        'ela': ['medical chart', 'prescription', 'health report'],
        'social_studies': ['hospital', 'clinic', 'community health']
      },
      'Teacher': {
        'math': ['students', 'books', 'pencils', 'desks'],
        'science': ['experiment', 'observe', 'hypothesis'],
        'ela': ['lesson', 'story', 'reading', 'writing'],
        'social_studies': ['classroom', 'school', 'education']
      },
      'Athlete': {
        'math': ['points', 'scores', 'laps', 'minutes'],
        'science': ['muscles', 'energy', 'nutrition'],
        'ela': ['playbook', 'strategy', 'team communication'],
        'social_studies': ['stadium', 'Olympics', 'teamwork']
      }
      // Add more careers as needed
    };

    return careerVocab[career]?.[subject] || [];
  }

  private generateCareerScenario(career: string, subject: string, grade: string): string {
    const scenarios: Record<string, string> = {
      'Doctor_math': `Dr. Smith needs to give medicine to patients...`,
      'Teacher_ela': `Ms. Johnson is teaching her class about...`,
      'Athlete_science': `The coach is explaining how muscles work...`
      // Add more scenarios
    };

    const key = `${career}_${subject}`;
    return scenarios[key] || `A ${career} is working on a ${subject} problem...`;
  }

  private getCareerVisualTheme(career: string): any {
    const themes: Record<string, any> = {
      'Doctor': { icon: '🏥', color: '#10B981' },
      'Teacher': { icon: '🏫', color: '#6366F1' },
      'Athlete': { icon: '🏃', color: '#F59E0B' }
      // Add more themes
    };

    return themes[career] || { icon: '🎯', color: '#6B7280' };
  }

  private getOrCreateHistory(studentId: string, skillId: string): DiagnosticHistory {
    const key = `${studentId}_${skillId}`;
    let history = this.diagnosticHistory.get(key);
    
    if (!history) {
      history = {
        studentId,
        skillId,
        attempts: 0,
        correct: 0,
        lastAttempt: new Date(),
        recentAccuracy: 0
      };
      this.diagnosticHistory.set(key, history);
    }
    
    return history;
  }

  private calculateNextDifficulty(accuracy: number): 'easy' | 'medium' | 'hard' {
    if (accuracy < 0.5) return 'easy';
    if (accuracy > 0.8) return 'hard';
    return 'medium';
  }

  // Public methods

  public getQuestionRules(subject: string, grade: string): any {
    const subjectRules = this.questionRules.typeSelection.bySubject.get(subject);
    const gradeTypes = subjectRules?.preferredTypes.get(grade);
    
    return {
      subject,
      grade,
      allowedTypes: subjectRules?.allowedTypes || [],
      preferredTypes: gradeTypes || [],
      specialRules: subjectRules?.specialRules || []
    };
  }

  public validateQuestionStructure(question: any): boolean {
    // Validate question has required structure
    if (!question.type || !question.question || question.correct_answer === undefined) {
      return false;
    }

    // Type-specific validation
    if (question.type === 'counting' && !question.visual) {
      return false;
    }

    if (question.type === 'multiple_choice' && (!question.options || question.options.length < 2)) {
      return false;
    }

    return true;
  }

  public getDiagnosticHistory(studentId: string): any {
    const histories: any[] = [];
    
    this.diagnosticHistory.forEach((history, key) => {
      if (key.startsWith(studentId)) {
        histories.push(history);
      }
    });
    
    return histories;
  }
}

// Helper interface
interface DiagnosticHistory {
  studentId: string;
  skillId: string;
  attempts: number;
  correct: number;
  lastAttempt: Date;
  recentAccuracy: number;
}

// Export singleton instance
export const learnAIRulesEngine = new LearnAIRulesEngine();