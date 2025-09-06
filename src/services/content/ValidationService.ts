/**
 * Comprehensive Validation Service
 * Centralized validation for all question types with grade and subject constraints
 */

import {
  Question,
  QuestionType,
  Grade,
  Subject,
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
  getAvailableTypesForGradeSubject,
  GRADE_APPROPRIATE_TYPES,
  SUBJECT_CONSTRAINTS
} from '../../types/questions';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
}

export interface ValidationError {
  code: string;
  field: string;
  message: string;
  severity: 'critical' | 'error';
}

export interface ValidationWarning {
  code: string;
  field: string;
  message: string;
}

export interface ValidationSuggestion {
  field: string;
  suggestion: string;
  improvement: string;
}

export interface ValidationContext {
  grade: Grade;
  subject: Subject;
  career?: string;
  skill?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'advanced';
  studentAge?: number;
  allowComplexity?: boolean;
}

export interface ContentValidationRules {
  minQuestions: number;
  maxQuestions: number;
  requiredTypes?: QuestionType[];
  forbiddenTypes?: QuestionType[];
  visualsRequired: boolean;
  timeLimit?: number;
  difficultyDistribution?: {
    easy: number;
    medium: number;
    hard: number;
    advanced: number;
  };
}

// ============================================================================
// VALIDATION SERVICE
// ============================================================================

export class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  // ============================================================================
  // MAIN VALIDATION
  // ============================================================================

  public validateQuestion(
    question: Question,
    context: ValidationContext
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Basic validation
    this.validateBasicFields(question, errors, warnings);

    // Type-specific validation
    this.validateTypeSpecific(question, errors, warnings, suggestions);

    // Grade appropriateness
    this.validateGradeAppropriateness(question, context, errors, warnings);

    // Subject appropriateness
    this.validateSubjectAppropriateness(question, context, errors, warnings);

    // Content quality
    this.validateContentQuality(question, context, warnings, suggestions);

    // Visual requirements
    this.validateVisualRequirements(question, context, errors, warnings);

    // Answer format
    this.validateAnswerFormat(question, errors, warnings);

    // Career context if provided
    if (context.career) {
      this.validateCareerContext(question, context.career, warnings, suggestions);
    }

    // Skill alignment if provided
    if (context.skill) {
      this.validateSkillAlignment(question, context.skill, warnings, suggestions);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  // ============================================================================
  // BASIC FIELD VALIDATION
  // ============================================================================

  private validateBasicFields(
    question: Question,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Required fields
    if (!question.id) {
      errors.push({
        code: 'MISSING_ID',
        field: 'id',
        message: 'Question ID is required',
        severity: 'critical'
      });
    }

    if (!question.type) {
      errors.push({
        code: 'MISSING_TYPE',
        field: 'type',
        message: 'Question type is required',
        severity: 'critical'
      });
    }

    if (!question.question || question.question.trim().length === 0) {
      errors.push({
        code: 'MISSING_QUESTION',
        field: 'question',
        message: 'Question text is required',
        severity: 'error'
      });
    }

    if (!question.explanation) {
      warnings.push({
        code: 'MISSING_EXPLANATION',
        field: 'explanation',
        message: 'Explanation is recommended for better learning'
      });
    }

    // Metadata validation
    if (!question.metadata) {
      errors.push({
        code: 'MISSING_METADATA',
        field: 'metadata',
        message: 'Question metadata is required',
        severity: 'critical'
      });
    } else {
      if (!question.metadata.grade) {
        errors.push({
          code: 'MISSING_GRADE',
          field: 'metadata.grade',
          message: 'Grade level is required',
          severity: 'error'
        });
      }

      if (!question.metadata.subject) {
        errors.push({
          code: 'MISSING_SUBJECT',
          field: 'metadata.subject',
          message: 'Subject is required',
          severity: 'error'
        });
      }

      if (!question.metadata.difficulty) {
        warnings.push({
          code: 'MISSING_DIFFICULTY',
          field: 'metadata.difficulty',
          message: 'Difficulty level should be specified'
        });
      }

      if (!question.metadata.estimatedTime || question.metadata.estimatedTime <= 0) {
        warnings.push({
          code: 'INVALID_TIME',
          field: 'metadata.estimatedTime',
          message: 'Estimated time should be a positive number'
        });
      }
    }
  }

  // ============================================================================
  // TYPE-SPECIFIC VALIDATION
  // ============================================================================

  private validateTypeSpecific(
    question: Question,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): void {
    switch (question.type) {
      case 'multiple_choice':
        this.validateMultipleChoice(
          question as MultipleChoiceQuestion,
          errors,
          warnings,
          suggestions
        );
        break;
      case 'true_false':
        this.validateTrueFalse(
          question as TrueFalseQuestion,
          errors,
          warnings,
          suggestions
        );
        break;
      case 'counting':
        this.validateCounting(
          question as CountingQuestion,
          errors,
          warnings,
          suggestions
        );
        break;
      case 'numeric':
        this.validateNumeric(
          question as NumericQuestion,
          errors,
          warnings,
          suggestions
        );
        break;
      case 'fill_blank':
        this.validateFillBlank(
          question as FillBlankQuestion,
          errors,
          warnings,
          suggestions
        );
        break;
      case 'matching':
        this.validateMatching(
          question as MatchingQuestion,
          errors,
          warnings,
          suggestions
        );
        break;
      case 'ordering':
        this.validateOrdering(
          question as OrderingQuestion,
          errors,
          warnings,
          suggestions
        );
        break;
      case 'short_answer':
        this.validateShortAnswer(
          question as ShortAnswerQuestion,
          errors,
          warnings,
          suggestions
        );
        break;
    }
  }

  private validateMultipleChoice(
    question: MultipleChoiceQuestion,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): void {
    if (!question.options || question.options.length < 2) {
      errors.push({
        code: 'INSUFFICIENT_OPTIONS',
        field: 'options',
        message: 'Multiple choice must have at least 2 options',
        severity: 'error'
      });
    }

    if (question.options && question.options.length > 6) {
      warnings.push({
        code: 'TOO_MANY_OPTIONS',
        field: 'options',
        message: 'Consider limiting options to 6 or fewer for better UX'
      });
    }

    if (question.correctAnswer < 0 || 
        question.correctAnswer >= (question.options?.length || 0)) {
      errors.push({
        code: 'INVALID_CORRECT_ANSWER',
        field: 'correctAnswer',
        message: 'Correct answer index is out of range',
        severity: 'error'
      });
    }

    // Check for duplicate options
    if (question.options) {
      const uniqueOptions = new Set(question.options);
      if (uniqueOptions.size !== question.options.length) {
        errors.push({
          code: 'DUPLICATE_OPTIONS',
          field: 'options',
          message: 'Options contain duplicates',
          severity: 'error'
        });
      }
    }

    // Suggest distractors explanation
    if (!question.distractors) {
      suggestions.push({
        field: 'distractors',
        suggestion: 'Add explanations for why wrong answers are incorrect',
        improvement: 'Helps students learn from mistakes'
      });
    }
  }

  private validateTrueFalse(
    question: TrueFalseQuestion,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): void {
    if (typeof question.correctAnswer !== 'boolean') {
      errors.push({
        code: 'INVALID_BOOLEAN',
        field: 'correctAnswer',
        message: 'True/False must have boolean correct answer',
        severity: 'error'
      });
    }

    if (!question.statement && !question.question) {
      errors.push({
        code: 'MISSING_STATEMENT',
        field: 'statement',
        message: 'True/False must have a statement or question',
        severity: 'error'
      });
    }

    // Check for ambiguous language
    const ambiguousWords = ['maybe', 'sometimes', 'often', 'usually', 'might'];
    const text = (question.statement || question.question || '').toLowerCase();
    
    if (ambiguousWords.some(word => text.includes(word))) {
      warnings.push({
        code: 'AMBIGUOUS_LANGUAGE',
        field: 'statement',
        message: 'Avoid ambiguous language in true/false questions'
      });
    }
  }

  private validateCounting(
    question: CountingQuestion,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): void {
    if (!question.visual) {
      errors.push({
        code: 'MISSING_VISUAL',
        field: 'visual',
        message: 'Counting questions must have a visual',
        severity: 'critical'
      });
    }

    if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0) {
      errors.push({
        code: 'INVALID_COUNT',
        field: 'correctAnswer',
        message: 'Counting must have a non-negative numeric answer',
        severity: 'error'
      });
    }

    if (!question.countableItems) {
      errors.push({
        code: 'MISSING_COUNTABLE',
        field: 'countableItems',
        message: 'Must specify what is being counted',
        severity: 'error'
      });
    }

    // Grade-appropriate counting ranges
    const grade = question.metadata.grade;
    const count = question.correctAnswer;
    
    if (grade === 'PreK' && count > 10) {
      warnings.push({
        code: 'COUNT_TOO_HIGH',
        field: 'correctAnswer',
        message: 'PreK counting should typically stay under 10'
      });
    } else if (grade === 'K' && count > 20) {
      warnings.push({
        code: 'COUNT_TOO_HIGH',
        field: 'correctAnswer',
        message: 'Kindergarten counting should typically stay under 20'
      });
    }
  }

  private validateNumeric(
    question: NumericQuestion,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): void {
    if (typeof question.correctAnswer !== 'number') {
      errors.push({
        code: 'INVALID_NUMERIC',
        field: 'correctAnswer',
        message: 'Numeric questions must have a numeric answer',
        severity: 'error'
      });
    }

    if (question.acceptableRange) {
      if (question.acceptableRange[0] > question.acceptableRange[1]) {
        errors.push({
          code: 'INVALID_RANGE',
          field: 'acceptableRange',
          message: 'Invalid acceptable range (min > max)',
          severity: 'error'
        });
      }

      if (question.correctAnswer < question.acceptableRange[0] || 
          question.correctAnswer > question.acceptableRange[1]) {
        warnings.push({
          code: 'ANSWER_OUTSIDE_RANGE',
          field: 'correctAnswer',
          message: 'Correct answer is outside acceptable range'
        });
      }
    }

    if (!question.unit && question.metadata.subject === 'Science') {
      suggestions.push({
        field: 'unit',
        suggestion: 'Consider adding units for science problems',
        improvement: 'Reinforces proper scientific notation'
      });
    }
  }

  private validateFillBlank(
    question: FillBlankQuestion,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): void {
    if (!question.template || !question.template.includes('{{blank}}')) {
      errors.push({
        code: 'INVALID_TEMPLATE',
        field: 'template',
        message: 'Fill blank must have template with {{blank}} placeholder',
        severity: 'error'
      });
    }

    if (!question.correctAnswers || question.correctAnswers.length === 0) {
      errors.push({
        code: 'MISSING_ANSWERS',
        field: 'correctAnswers',
        message: 'Fill blank must have at least one correct answer',
        severity: 'error'
      });
    }

    // Check for overly strict answers
    if (question.correctAnswers && question.correctAnswers.length === 1) {
      suggestions.push({
        field: 'correctAnswers',
        suggestion: 'Consider adding acceptable variations',
        improvement: 'Reduces frustration from minor spelling/format differences'
      });
    }
  }

  private validateMatching(
    question: MatchingQuestion,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): void {
    if (!question.leftColumn || question.leftColumn.length < 2) {
      errors.push({
        code: 'INSUFFICIENT_LEFT',
        field: 'leftColumn',
        message: 'Matching must have at least 2 items in left column',
        severity: 'error'
      });
    }

    if (!question.rightColumn || question.rightColumn.length < 2) {
      errors.push({
        code: 'INSUFFICIENT_RIGHT',
        field: 'rightColumn',
        message: 'Matching must have at least 2 items in right column',
        severity: 'error'
      });
    }

    if (!question.correctPairs || question.correctPairs.length === 0) {
      errors.push({
        code: 'MISSING_PAIRS',
        field: 'correctPairs',
        message: 'Matching must have correct pairs defined',
        severity: 'error'
      });
    }

    // Check for unmatched items
    if (question.leftColumn && question.rightColumn && question.correctPairs) {
      const leftIds = new Set(question.leftColumn.map(item => item.id));
      const rightIds = new Set(question.rightColumn.map(item => item.id));
      
      question.correctPairs.forEach(([leftId, rightId]) => {
        if (!leftIds.has(leftId)) {
          errors.push({
            code: 'INVALID_LEFT_ID',
            field: 'correctPairs',
            message: `Invalid left ID in pair: ${leftId}`,
            severity: 'error'
          });
        }
        if (!rightIds.has(rightId)) {
          errors.push({
            code: 'INVALID_RIGHT_ID',
            field: 'correctPairs',
            message: `Invalid right ID in pair: ${rightId}`,
            severity: 'error'
          });
        }
      });
    }

    // Suggest adding distractors
    if (question.leftColumn && question.rightColumn && 
        question.leftColumn.length === question.rightColumn.length) {
      suggestions.push({
        field: 'rightColumn',
        suggestion: 'Consider adding extra items in right column as distractors',
        improvement: 'Makes the matching more challenging'
      });
    }
  }

  private validateOrdering(
    question: OrderingQuestion,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): void {
    if (!question.items || question.items.length < 2) {
      errors.push({
        code: 'INSUFFICIENT_ITEMS',
        field: 'items',
        message: 'Ordering must have at least 2 items',
        severity: 'error'
      });
    }

    if (!question.correctOrder || question.correctOrder.length !== question.items?.length) {
      errors.push({
        code: 'INVALID_ORDER',
        field: 'correctOrder',
        message: 'Correct order must match number of items',
        severity: 'error'
      });
    }

    if (!question.orderType) {
      warnings.push({
        code: 'MISSING_ORDER_TYPE',
        field: 'orderType',
        message: 'Order type should be specified for clarity'
      });
    }

    // Check for duplicate items
    if (question.items) {
      const itemIds = new Set(question.items.map(item => item.id));
      if (itemIds.size !== question.items.length) {
        errors.push({
          code: 'DUPLICATE_ITEMS',
          field: 'items',
          message: 'Items contain duplicates',
          severity: 'error'
        });
      }
    }
  }

  private validateShortAnswer(
    question: ShortAnswerQuestion,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): void {
    if (!question.sampleAnswer) {
      errors.push({
        code: 'MISSING_SAMPLE',
        field: 'sampleAnswer',
        message: 'Short answer must have a sample answer',
        severity: 'error'
      });
    }

    if (!question.keyWords || question.keyWords.length === 0) {
      errors.push({
        code: 'MISSING_KEYWORDS',
        field: 'keyWords',
        message: 'Short answer must have keywords for validation',
        severity: 'error'
      });
    }

    if (!question.rubric || question.rubric.length === 0) {
      suggestions.push({
        field: 'rubric',
        suggestion: 'Add grading rubric for consistent evaluation',
        improvement: 'Provides clear expectations for students'
      });
    }

    // Check length constraints
    if (question.minLength && question.maxLength && 
        question.minLength > question.maxLength) {
      errors.push({
        code: 'INVALID_LENGTH',
        field: 'minLength',
        message: 'Minimum length cannot exceed maximum length',
        severity: 'error'
      });
    }
  }

  // ============================================================================
  // GRADE APPROPRIATENESS
  // ============================================================================

  private validateGradeAppropriateness(
    question: Question,
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const grade = context.grade || question.metadata.grade;
    
    if (!validateQuestionForGrade(question, grade)) {
      errors.push({
        code: 'GRADE_INAPPROPRIATE',
        field: 'type',
        message: `Question type ${question.type} not appropriate for grade ${grade}`,
        severity: 'error'
      });
    }

    // Additional grade-specific checks
    this.checkReadingLevel(question, grade, warnings);
    this.checkMathComplexity(question, grade, warnings);
    this.checkTimeRequirements(question, grade, warnings);
  }

  private checkReadingLevel(
    question: Question,
    grade: Grade,
    warnings: ValidationWarning[]
  ): void {
    const text = question.question;
    const wordCount = text.split(/\s+/).length;
    const avgWordLength = text.replace(/\s+/g, '').length / wordCount;

    // Simple readability check
    const gradeToMaxWords: Record<string, number> = {
      'PreK': 10, 'K': 15, '1': 20, '2': 25, '3': 30,
      '4': 35, '5': 40, '6': 45, '7': 50, '8': 55,
      '9': 60, '10': 65, '11': 70, '12': 75
    };

    const maxWords = gradeToMaxWords[grade] || 50;
    
    if (wordCount > maxWords) {
      warnings.push({
        code: 'QUESTION_TOO_LONG',
        field: 'question',
        message: `Question may be too long for grade ${grade} (${wordCount} words)`
      });
    }

    // Check for complex words in early grades
    if (['PreK', 'K', '1', '2'].includes(grade) && avgWordLength > 6) {
      warnings.push({
        code: 'WORDS_TOO_COMPLEX',
        field: 'question',
        message: 'Words may be too complex for early readers'
      });
    }
  }

  private checkMathComplexity(
    question: Question,
    grade: Grade,
    warnings: ValidationWarning[]
  ): void {
    if (question.metadata.subject !== 'Math') return;

    // Check for appropriate number ranges
    if (question.type === 'numeric' || question.type === 'counting') {
      const answer = (question as NumericQuestion | CountingQuestion).correctAnswer;
      
      const gradeToMaxNumber: Record<string, number> = {
        'PreK': 10, 'K': 20, '1': 100, '2': 1000, '3': 10000,
        '4': 100000, '5': 1000000, '6': Infinity, '7': Infinity,
        '8': Infinity, '9': Infinity, '10': Infinity, '11': Infinity, '12': Infinity
      };

      const maxNumber = gradeToMaxNumber[grade] || Infinity;
      
      if (Math.abs(answer) > maxNumber) {
        warnings.push({
          code: 'NUMBER_TOO_LARGE',
          field: 'correctAnswer',
          message: `Number may be too large for grade ${grade}`
        });
      }
    }
  }

  private checkTimeRequirements(
    question: Question,
    grade: Grade,
    warnings: ValidationWarning[]
  ): void {
    const estimatedTime = question.metadata.estimatedTime;
    
    const gradeToMaxTime: Record<string, number> = {
      'PreK': 60, 'K': 90, '1': 120, '2': 150, '3': 180,
      '4': 240, '5': 300, '6': 360, '7': 420, '8': 480,
      '9': 540, '10': 600, '11': 600, '12': 600
    };

    const maxTime = gradeToMaxTime[grade] || 300;
    
    if (estimatedTime > maxTime) {
      warnings.push({
        code: 'TIME_TOO_LONG',
        field: 'metadata.estimatedTime',
        message: `Question may take too long for grade ${grade}`
      });
    }
  }

  // ============================================================================
  // SUBJECT APPROPRIATENESS
  // ============================================================================

  private validateSubjectAppropriateness(
    question: Question,
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const subject = context.subject || question.metadata.subject;
    
    if (!validateQuestionForSubject(question, subject)) {
      errors.push({
        code: 'SUBJECT_INAPPROPRIATE',
        field: 'type',
        message: `Question type ${question.type} not appropriate for ${subject}`,
        severity: 'error'
      });
    }

    // Subject-specific content checks
    this.checkSubjectContent(question, subject, warnings);
  }

  private checkSubjectContent(
    question: Question,
    subject: Subject,
    warnings: ValidationWarning[]
  ): void {
    switch (subject) {
      case 'Math':
        if (!question.question.match(/\d/) && question.type !== 'true_false') {
          warnings.push({
            code: 'NO_NUMBERS',
            field: 'question',
            message: 'Math questions typically include numbers'
          });
        }
        break;

      case 'Science':
        if (question.type === 'numeric' && !(question as NumericQuestion).unit) {
          warnings.push({
            code: 'MISSING_UNITS',
            field: 'unit',
            message: 'Science numeric questions should include units'
          });
        }
        break;

      case 'ELA':
        if (question.type === 'counting' || question.type === 'numeric') {
          warnings.push({
            code: 'INAPPROPRIATE_TYPE',
            field: 'type',
            message: `${question.type} questions are unusual for ELA`
          });
        }
        break;

      case 'Social Studies':
        if (question.type === 'counting') {
          warnings.push({
            code: 'INAPPROPRIATE_TYPE',
            field: 'type',
            message: 'Counting questions are unusual for Social Studies'
          });
        }
        break;
    }
  }

  // ============================================================================
  // CONTENT QUALITY
  // ============================================================================

  private validateContentQuality(
    question: Question,
    context: ValidationContext,
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): void {
    // Check for engagement
    if (!question.visual && !question.realWorldConnection) {
      suggestions.push({
        field: 'visual',
        suggestion: 'Add visual or real-world connection',
        improvement: 'Increases engagement and understanding'
      });
    }

    // Check for hints
    if (!question.hint && !question.hintSystem) {
      suggestions.push({
        field: 'hintSystem',
        suggestion: 'Add progressive hints',
        improvement: 'Supports struggling students'
      });
    }

    // Check explanation quality
    if (question.explanation && question.explanation.length < 20) {
      warnings.push({
        code: 'SHORT_EXPLANATION',
        field: 'explanation',
        message: 'Explanation seems too brief'
      });
    }

    // Check for skills tracking
    if (!question.metadata.skills || question.metadata.skills.length === 0) {
      warnings.push({
        code: 'NO_SKILLS',
        field: 'metadata.skills',
        message: 'No skills tagged for tracking'
      });
    }
  }

  // ============================================================================
  // VISUAL REQUIREMENTS
  // ============================================================================

  private validateVisualRequirements(
    question: Question,
    context: ValidationContext,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const grade = context.grade || question.metadata.grade;
    
    // Counting questions always need visuals
    if (question.type === 'counting' && !question.visual) {
      errors.push({
        code: 'VISUAL_REQUIRED',
        field: 'visual',
        message: 'Counting questions must have visuals',
        severity: 'critical'
      });
    }

    // Early grades benefit from visuals
    if (['PreK', 'K', '1', '2'].includes(grade) && !question.visual) {
      warnings.push({
        code: 'VISUAL_RECOMMENDED',
        field: 'visual',
        message: `Visual recommended for grade ${grade}`
      });
    }

    // Validate visual if present
    if (question.visual) {
      if (!question.visual.content) {
        errors.push({
          code: 'EMPTY_VISUAL',
          field: 'visual.content',
          message: 'Visual content is empty',
          severity: 'error'
        });
      }

      if (!question.visual.alt) {
        warnings.push({
          code: 'MISSING_ALT',
          field: 'visual.alt',
          message: 'Visual should have alt text for accessibility'
        });
      }

      // Check visual type appropriateness
      if (question.visual.type === 'video' && 
          question.metadata.estimatedTime < 120) {
        warnings.push({
          code: 'VIDEO_TIME_MISMATCH',
          field: 'visual.type',
          message: 'Video may not fit in estimated time'
        });
      }
    }
  }

  // ============================================================================
  // ANSWER FORMAT VALIDATION
  // ============================================================================

  private validateAnswerFormat(
    question: Question,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Check for answer standardization
    switch (question.type) {
      case 'multiple_choice':
        const mc = question as MultipleChoiceQuestion;
        if (mc.options) {
          // Check for consistent formatting
          const hasNumbers = mc.options.some(opt => /^\d/.test(opt));
          const hasLetters = mc.options.some(opt => /^[A-Z]/i.test(opt));
          
          if (hasNumbers && hasLetters) {
            warnings.push({
              code: 'INCONSISTENT_FORMAT',
              field: 'options',
              message: 'Options have inconsistent formatting'
            });
          }
        }
        break;

      case 'numeric':
        const num = question as NumericQuestion;
        if (num.decimalPlaces !== undefined && 
            num.correctAnswer !== parseFloat(num.correctAnswer.toFixed(num.decimalPlaces))) {
          warnings.push({
            code: 'DECIMAL_MISMATCH',
            field: 'correctAnswer',
            message: 'Correct answer has more decimals than specified'
          });
        }
        break;

      case 'fill_blank':
        const fb = question as FillBlankQuestion;
        if (fb.correctAnswers) {
          // Check for reasonable variations
          const hasCapitalized = fb.correctAnswers.some(a => /^[A-Z]/.test(a));
          const hasLowercase = fb.correctAnswers.some(a => /^[a-z]/.test(a));
          
          if (hasCapitalized && !hasLowercase) {
            suggestions.push({
              field: 'correctAnswers',
              suggestion: 'Include lowercase variations',
              improvement: 'Avoids penalizing capitalization differences'
            });
          }
        }
        break;
    }
  }

  // ============================================================================
  // CAREER CONTEXT VALIDATION
  // ============================================================================

  private validateCareerContext(
    question: Question,
    career: string,
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): void {
    if (!question.careerContext) {
      suggestions.push({
        field: 'careerContext',
        suggestion: `Add career context for ${career}`,
        improvement: 'Makes learning more relevant and engaging'
      });
    } else if (!question.careerContext.toLowerCase().includes(career.toLowerCase())) {
      warnings.push({
        code: 'CAREER_MISMATCH',
        field: 'careerContext',
        message: `Career context doesn't match selected career: ${career}`
      });
    }

    // Check if question text references career
    if (!question.question.toLowerCase().includes(career.toLowerCase()) &&
        !question.realWorldConnection) {
      suggestions.push({
        field: 'question',
        suggestion: `Incorporate ${career} into question text`,
        improvement: 'Strengthens career connection'
      });
    }
  }

  // ============================================================================
  // SKILL ALIGNMENT VALIDATION
  // ============================================================================

  private validateSkillAlignment(
    question: Question,
    skill: string,
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[]
  ): void {
    if (!question.skillContext) {
      suggestions.push({
        field: 'skillContext',
        suggestion: `Add skill context for ${skill}`,
        improvement: 'Clarifies learning objectives'
      });
    }

    if (!question.metadata.skills || !question.metadata.skills.includes(skill)) {
      warnings.push({
        code: 'SKILL_NOT_TAGGED',
        field: 'metadata.skills',
        message: `Primary skill ${skill} not in metadata`
      });
    }

    // Check if question actually tests the skill
    if (question.metadata.skills && question.metadata.skills.length > 3) {
      warnings.push({
        code: 'TOO_MANY_SKILLS',
        field: 'metadata.skills',
        message: 'Question may be testing too many skills at once'
      });
    }
  }

  // ============================================================================
  // BATCH VALIDATION
  // ============================================================================

  public validateQuestionSet(
    questions: Question[],
    context: ValidationContext,
    rules: ContentValidationRules
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Check question count
    if (questions.length < rules.minQuestions) {
      errors.push({
        code: 'INSUFFICIENT_QUESTIONS',
        field: 'questions',
        message: `Need at least ${rules.minQuestions} questions`,
        severity: 'error'
      });
    }

    if (questions.length > rules.maxQuestions) {
      warnings.push({
        code: 'TOO_MANY_QUESTIONS',
        field: 'questions',
        message: `Consider limiting to ${rules.maxQuestions} questions`
      });
    }

    // Check type distribution
    const typeCount = new Map<QuestionType, number>();
    questions.forEach(q => {
      typeCount.set(q.type, (typeCount.get(q.type) || 0) + 1);
    });

    // Check required types
    if (rules.requiredTypes) {
      rules.requiredTypes.forEach(type => {
        if (!typeCount.has(type)) {
          errors.push({
            code: 'MISSING_REQUIRED_TYPE',
            field: 'questions',
            message: `Missing required question type: ${type}`,
            severity: 'error'
          });
        }
      });
    }

    // Check forbidden types
    if (rules.forbiddenTypes) {
      rules.forbiddenTypes.forEach(type => {
        if (typeCount.has(type)) {
          errors.push({
            code: 'FORBIDDEN_TYPE',
            field: 'questions',
            message: `Forbidden question type used: ${type}`,
            severity: 'error'
          });
        }
      });
    }

    // Check visual requirements
    if (rules.visualsRequired) {
      const hasVisuals = questions.some(q => q.visual);
      if (!hasVisuals) {
        errors.push({
          code: 'NO_VISUALS',
          field: 'questions',
          message: 'At least one question must have visuals',
          severity: 'error'
        });
      }
    }

    // Check time limit
    if (rules.timeLimit) {
      const totalTime = questions.reduce((sum, q) => sum + q.metadata.estimatedTime, 0);
      if (totalTime > rules.timeLimit) {
        warnings.push({
          code: 'TIME_EXCEEDED',
          field: 'questions',
          message: `Total time (${totalTime}s) exceeds limit (${rules.timeLimit}s)`
        });
      }
    }

    // Check difficulty distribution
    if (rules.difficultyDistribution) {
      const difficultyCount = new Map<string, number>();
      questions.forEach(q => {
        const diff = q.metadata.difficulty;
        difficultyCount.set(diff, (difficultyCount.get(diff) || 0) + 1);
      });

      Object.entries(rules.difficultyDistribution).forEach(([difficulty, expected]) => {
        const actual = difficultyCount.get(difficulty) || 0;
        const expectedCount = Math.round(questions.length * expected);
        
        if (Math.abs(actual - expectedCount) > 1) {
          warnings.push({
            code: 'DIFFICULTY_IMBALANCE',
            field: 'questions',
            message: `${difficulty} questions: expected ~${expectedCount}, got ${actual}`
          });
        }
      });
    }

    // Validate each question individually
    questions.forEach((question, index) => {
      const result = this.validateQuestion(question, context);
      
      result.errors.forEach(error => {
        errors.push({
          ...error,
          field: `questions[${index}].${error.field}`
        });
      });
      
      // Only include first warning per question to avoid spam
      if (result.warnings.length > 0) {
        warnings.push({
          ...result.warnings[0],
          field: `questions[${index}].${result.warnings[0].field}`
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
}

// Export singleton instance
export const validationService = ValidationService.getInstance();