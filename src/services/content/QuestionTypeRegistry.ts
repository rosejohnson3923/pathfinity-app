/**
 * Question Type Registry
 * Centralized management of question types and their rules
 */

import {
  Question,
  QuestionType,
  Grade,
  Subject,
  GRADE_APPROPRIATE_TYPES,
  SUBJECT_CONSTRAINTS,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  CountingQuestion,
  NumericQuestion,
  FillBlankQuestion,
  MatchingQuestion,
  OrderingQuestion,
  ShortAnswerQuestion,
  validateQuestionForGrade,
  validateQuestionForSubject,
  getAvailableTypesForGradeSubject
} from '../../types/questions';

// ============================================================================
// QUESTION TYPE DEFINITION
// ============================================================================

export interface QuestionTypeDefinition {
  type: QuestionType;
  displayName: string;
  description: string;
  minGrade: Grade;
  supportedSubjects: Subject[];
  requiresVisual: boolean;
  averageTimeSeconds: number;
  difficultyModifier: number; // Multiplier for time based on difficulty
  validator: (question: Question) => ValidationResult;
  renderer?: string; // Component name for rendering
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

// ============================================================================
// QUESTION DISTRIBUTION
// ============================================================================

export interface QuestionDistribution {
  [key: string]: number; // questionType -> count
}

export interface ContentRequirements {
  totalQuestions: number;
  distribution: QuestionDistribution;
  constraints: {
    mustIncludeVisuals?: boolean;
    avoidTypes?: QuestionType[];
    preferredTypes?: QuestionType[];
  };
}

// ============================================================================
// REGISTRY CLASS
// ============================================================================

export class QuestionTypeRegistry {
  private static instance: QuestionTypeRegistry;
  private types: Map<QuestionType, QuestionTypeDefinition>;
  private renderers: Map<QuestionType, React.ComponentType<any>>;

  private constructor() {
    this.types = new Map();
    this.renderers = new Map();
    this.initializeDefaultTypes();
  }

  public static getInstance(): QuestionTypeRegistry {
    if (!QuestionTypeRegistry.instance) {
      QuestionTypeRegistry.instance = new QuestionTypeRegistry();
    }
    return QuestionTypeRegistry.instance;
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private initializeDefaultTypes(): void {
    // Multiple Choice
    this.registerType({
      type: 'multiple_choice',
      displayName: 'Multiple Choice',
      description: 'Select one correct answer from multiple options',
      minGrade: 'PreK',
      supportedSubjects: ['Math', 'ELA', 'Science', 'Social Studies'],
      requiresVisual: false,
      averageTimeSeconds: 30,
      difficultyModifier: 1.2,
      validator: this.validateMultipleChoice,
      renderer: 'MultipleChoiceQuestion'
    });

    // True/False
    this.registerType({
      type: 'true_false',
      displayName: 'True or False',
      description: 'Determine if a statement is true or false',
      minGrade: 'PreK',
      supportedSubjects: ['Math', 'ELA', 'Science', 'Social Studies'],
      requiresVisual: false,
      averageTimeSeconds: 20,
      difficultyModifier: 1.0,
      validator: this.validateTrueFalse,
      renderer: 'TrueFalseQuestion'
    });

    // Counting
    this.registerType({
      type: 'counting',
      displayName: 'Counting',
      description: 'Count objects in a visual',
      minGrade: 'PreK',
      supportedSubjects: ['Math'], // Only Math!
      requiresVisual: true,
      averageTimeSeconds: 40,
      difficultyModifier: 1.1,
      validator: this.validateCounting,
      renderer: 'CountingQuestion'
    });

    // Numeric
    this.registerType({
      type: 'numeric',
      displayName: 'Numeric Answer',
      description: 'Enter a numeric answer',
      minGrade: '1',
      supportedSubjects: ['Math', 'Science'],
      requiresVisual: false,
      averageTimeSeconds: 35,
      difficultyModifier: 1.3,
      validator: this.validateNumeric,
      renderer: 'NumericQuestion'
    });

    // Fill in the Blank
    this.registerType({
      type: 'fill_blank',
      displayName: 'Fill in the Blank',
      description: 'Complete a sentence with the correct word',
      minGrade: '2',
      supportedSubjects: ['Math', 'ELA', 'Science', 'Social Studies'],
      requiresVisual: false,
      averageTimeSeconds: 45,
      difficultyModifier: 1.4,
      validator: this.validateFillBlank,
      renderer: 'FillBlankQuestion'
    });

    // Matching
    this.registerType({
      type: 'matching',
      displayName: 'Matching',
      description: 'Match items from two columns',
      minGrade: '3',
      supportedSubjects: ['Math', 'ELA', 'Science', 'Social Studies'],
      requiresVisual: false,
      averageTimeSeconds: 60,
      difficultyModifier: 1.5,
      validator: this.validateMatching,
      renderer: 'MatchingQuestion'
    });

    // Ordering
    this.registerType({
      type: 'ordering',
      displayName: 'Ordering/Sequencing',
      description: 'Put items in the correct order',
      minGrade: '5',
      supportedSubjects: ['Math', 'ELA', 'Science', 'Social Studies'],
      requiresVisual: false,
      averageTimeSeconds: 50,
      difficultyModifier: 1.4,
      validator: this.validateOrdering,
      renderer: 'OrderingQuestion'
    });

    // Short Answer
    this.registerType({
      type: 'short_answer',
      displayName: 'Short Answer',
      description: 'Write a brief text response',
      minGrade: '6',
      supportedSubjects: ['Math', 'ELA', 'Science', 'Social Studies'],
      requiresVisual: false,
      averageTimeSeconds: 90,
      difficultyModifier: 1.8,
      validator: this.validateShortAnswer,
      renderer: 'ShortAnswerQuestion'
    });
  }

  // ============================================================================
  // REGISTRATION
  // ============================================================================

  public registerType(definition: QuestionTypeDefinition): void {
    this.types.set(definition.type, definition);
  }

  public registerRenderer(type: QuestionType, component: React.ComponentType<any>): void {
    this.renderers.set(type, component);
  }

  // ============================================================================
  // RETRIEVAL
  // ============================================================================

  public getTypeDefinition(type: QuestionType): QuestionTypeDefinition | undefined {
    return this.types.get(type);
  }

  public getRenderer(type: QuestionType): React.ComponentType<any> | undefined {
    return this.renderers.get(type);
  }

  public getTypesForGradeSubject(grade: Grade, subject: Subject): QuestionType[] {
    return getAvailableTypesForGradeSubject(grade, subject);
  }

  public getAllTypes(): QuestionType[] {
    return Array.from(this.types.keys());
  }

  // ============================================================================
  // DISTRIBUTION CALCULATION
  // ============================================================================

  public calculateDistribution(
    grade: Grade,
    subject: Subject,
    totalQuestions: number,
    mode: 'balanced' | 'practice' | 'assessment' = 'balanced'
  ): QuestionDistribution {
    const availableTypes = this.getTypesForGradeSubject(grade, subject);
    const distribution: QuestionDistribution = {};

    if (availableTypes.length === 0) {
      throw new Error(`No question types available for ${grade} ${subject}`);
    }

    if (mode === 'balanced') {
      // Distribute evenly across available types
      const baseCount = Math.floor(totalQuestions / availableTypes.length);
      const remainder = totalQuestions % availableTypes.length;

      availableTypes.forEach((type, index) => {
        distribution[type] = baseCount + (index < remainder ? 1 : 0);
      });
    } else if (mode === 'practice') {
      // Favor easier question types for practice
      const easyTypes = availableTypes.filter(t => 
        ['multiple_choice', 'true_false', 'counting'].includes(t)
      );
      const hardTypes = availableTypes.filter(t => !easyTypes.includes(t));

      const easyCount = Math.ceil(totalQuestions * 0.7);
      const hardCount = totalQuestions - easyCount;

      if (easyTypes.length > 0) {
        const easyBase = Math.floor(easyCount / easyTypes.length);
        easyTypes.forEach(type => {
          distribution[type] = easyBase;
        });
      }

      if (hardTypes.length > 0 && hardCount > 0) {
        const hardBase = Math.floor(hardCount / hardTypes.length);
        hardTypes.forEach(type => {
          distribution[type] = hardBase;
        });
      }
    } else if (mode === 'assessment') {
      // Use varied types for assessment
      const primaryTypes = ['multiple_choice', 'numeric', 'true_false'].filter(t => 
        availableTypes.includes(t)
      );
      
      primaryTypes.forEach(type => {
        distribution[type] = Math.ceil(totalQuestions / primaryTypes.length);
      });
    }

    // Ensure we have exactly totalQuestions
    const currentTotal = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    if (currentTotal !== totalQuestions) {
      const diff = totalQuestions - currentTotal;
      const firstType = Object.keys(distribution)[0];
      distribution[firstType] += diff;
    }

    return distribution;
  }

  // ============================================================================
  // TIME ESTIMATION
  // ============================================================================

  public estimateTime(
    distribution: QuestionDistribution,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): number {
    let totalSeconds = 0;
    const difficultyMultiplier = { easy: 0.8, medium: 1.0, hard: 1.3 }[difficulty];

    for (const [type, count] of Object.entries(distribution)) {
      const definition = this.types.get(type as QuestionType);
      if (definition) {
        const timePerQuestion = definition.averageTimeSeconds * 
                               definition.difficultyModifier * 
                               difficultyMultiplier;
        totalSeconds += timePerQuestion * count;
      }
    }

    return Math.round(totalSeconds);
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  public validateQuestion(question: Question): ValidationResult {
    const definition = this.types.get(question.type);
    if (!definition) {
      return { valid: false, errors: [`Unknown question type: ${question.type}`] };
    }

    // Use type-specific validator
    const typeValidation = definition.validator(question);
    if (!typeValidation.valid) {
      return typeValidation;
    }

    // Grade validation
    if (!validateQuestionForGrade(question, question.metadata.grade)) {
      return {
        valid: false,
        errors: [`Question type ${question.type} not appropriate for grade ${question.metadata.grade}`]
      };
    }

    // Subject validation
    if (!validateQuestionForSubject(question, question.metadata.subject)) {
      return {
        valid: false,
        errors: [`Question type ${question.type} not appropriate for subject ${question.metadata.subject}`]
      };
    }

    return { valid: true };
  }

  // ============================================================================
  // TYPE-SPECIFIC VALIDATORS
  // ============================================================================

  private validateMultipleChoice(question: Question): ValidationResult {
    const q = question as MultipleChoiceQuestion;
    const errors: string[] = [];

    if (!q.options || q.options.length < 2) {
      errors.push('Multiple choice must have at least 2 options');
    }
    if (q.options && q.options.length > 6) {
      errors.push('Multiple choice should not have more than 6 options');
    }
    if (q.correctAnswer < 0 || q.correctAnswer >= (q.options?.length || 0)) {
      errors.push('Correct answer index out of range');
    }

    return { valid: errors.length === 0, errors };
  }

  private validateTrueFalse(question: Question): ValidationResult {
    const q = question as TrueFalseQuestion;
    const errors: string[] = [];

    if (typeof q.correctAnswer !== 'boolean') {
      errors.push('True/False must have boolean correct answer');
    }
    if (!q.statement && !q.question) {
      errors.push('True/False must have a statement or question');
    }

    return { valid: errors.length === 0, errors };
  }

  private validateCounting(question: Question): ValidationResult {
    const q = question as CountingQuestion;
    const errors: string[] = [];

    if (!q.visual) {
      errors.push('Counting questions must have a visual');
    }
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0) {
      errors.push('Counting must have a non-negative numeric answer');
    }
    if (!q.countableItems) {
      errors.push('Counting must specify what is being counted');
    }

    return { valid: errors.length === 0, errors };
  }

  private validateNumeric(question: Question): ValidationResult {
    const q = question as NumericQuestion;
    const errors: string[] = [];

    if (typeof q.correctAnswer !== 'number') {
      errors.push('Numeric questions must have a numeric answer');
    }
    if (q.acceptableRange && q.acceptableRange[0] > q.acceptableRange[1]) {
      errors.push('Invalid acceptable range');
    }

    return { valid: errors.length === 0, errors };
  }

  private validateFillBlank(question: Question): ValidationResult {
    const q = question as FillBlankQuestion;
    const errors: string[] = [];

    if (!q.template || !q.template.includes('{{blank}}')) {
      errors.push('Fill blank must have template with {{blank}} placeholder');
    }
    if (!q.correctAnswers || q.correctAnswers.length === 0) {
      errors.push('Fill blank must have at least one correct answer');
    }

    return { valid: errors.length === 0, errors };
  }

  private validateMatching(question: Question): ValidationResult {
    const q = question as MatchingQuestion;
    const errors: string[] = [];

    if (!q.leftColumn || q.leftColumn.length < 2) {
      errors.push('Matching must have at least 2 items in left column');
    }
    if (!q.rightColumn || q.rightColumn.length < 2) {
      errors.push('Matching must have at least 2 items in right column');
    }
    if (!q.correctPairs || q.correctPairs.length === 0) {
      errors.push('Matching must have correct pairs defined');
    }

    return { valid: errors.length === 0, errors };
  }

  private validateOrdering(question: Question): ValidationResult {
    const q = question as OrderingQuestion;
    const errors: string[] = [];

    if (!q.items || q.items.length < 2) {
      errors.push('Ordering must have at least 2 items');
    }
    if (!q.correctOrder || q.correctOrder.length !== q.items?.length) {
      errors.push('Correct order must match number of items');
    }

    return { valid: errors.length === 0, errors };
  }

  private validateShortAnswer(question: Question): ValidationResult {
    const q = question as ShortAnswerQuestion;
    const errors: string[] = [];

    if (!q.sampleAnswer) {
      errors.push('Short answer must have a sample answer');
    }
    if (!q.keyWords || q.keyWords.length === 0) {
      errors.push('Short answer must have keywords for validation');
    }

    return { valid: errors.length === 0, errors };
  }
}

// Export singleton instance
export const questionTypeRegistry = QuestionTypeRegistry.getInstance();