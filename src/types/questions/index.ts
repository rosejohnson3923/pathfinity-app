/**
 * Comprehensive Question Type System
 * Foundation for all question types in Pathfinity
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export type Grade = 'PreK' | 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
export type Subject = 'Math' | 'ELA' | 'Science' | 'Social Studies';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'advanced';
export type QuestionType = 
  | 'multiple_choice' 
  | 'true_false' 
  | 'counting' 
  | 'numeric' 
  | 'fill_blank' 
  | 'matching' 
  | 'ordering' 
  | 'short_answer';

// ============================================================================
// VISUAL SYSTEM
// ============================================================================

export interface Visual {
  type: 'emoji' | 'image' | 'icon' | 'svg' | 'video';
  content: string;
  alt?: string;
  caption?: string;
}

export interface RequiredVisual extends Visual {
  required: true;
}

export interface OptionalVisual extends Visual {
  required: false;
}

// ============================================================================
// METADATA
// ============================================================================

export interface QuestionMetadata {
  subject: Subject;
  grade: Grade;
  difficulty: Difficulty;
  estimatedTime: number; // in seconds
  skills: string[];
  standards?: string[];
  career?: string;
  companion?: string;
  tags?: string[];
}

// ============================================================================
// HINT SYSTEM
// ============================================================================

export interface HintSystem {
  progressive: string[];  // Array of progressively more helpful hints
  cost: number[];        // XP cost for each hint level
  customized: boolean;   // Whether hints are career/context specific
  effectiveness?: number; // Tracked effectiveness score
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationRules {
  caseSensitive?: boolean;
  exactMatch?: boolean;
  tolerance?: number;      // For numeric answers
  partialCredit?: boolean;
  acceptableVariations?: string[]; // Alternative correct answers
}

// ============================================================================
// BASE QUESTION INTERFACE
// ============================================================================

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  instructions?: string;
  visual?: Visual;
  hint?: string;           // Simple hint (deprecated, use hintSystem)
  hintSystem?: HintSystem; // Progressive hint system
  explanation: string;
  metadata: QuestionMetadata;
  validation?: ValidationRules;
  
  // Career and skill context
  careerContext?: string;
  skillContext?: string;
  realWorldConnection?: string;
  
  // Tracking
  attemptCount?: number;
  successRate?: number;
  averageTime?: number;
}

// ============================================================================
// QUESTION-SPECIFIC INTERFACES
// ============================================================================

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: string[];
  correctAnswer: number; // Index of correct option (0-based)
  distractors?: string[]; // Explanation of why wrong answers are wrong
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  correctAnswer: boolean;
  statement: string; // The statement to evaluate
}

export interface CountingQuestion extends BaseQuestion {
  type: 'counting';
  visual: RequiredVisual; // Counting always requires visual
  correctAnswer: number;
  countableItems: string; // What is being counted
  minValue?: number;
  maxValue?: number;
}

export interface NumericQuestion extends BaseQuestion {
  type: 'numeric';
  correctAnswer: number;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  acceptableRange?: [number, number]; // For answers within a range
  decimalPlaces?: number;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill_blank';
  template: string; // Text with {{blank}} placeholder
  correctAnswers: string[]; // Multiple acceptable answers
  blankPosition?: number; // Position of blank in template
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  leftColumn: Array<{ id: string; text: string; visual?: Visual }>;
  rightColumn: Array<{ id: string; text: string; visual?: Visual }>;
  correctPairs: Array<[string, string]>; // [leftId, rightId] pairs
}

export interface OrderingQuestion extends BaseQuestion {
  type: 'ordering';
  items: Array<{ id: string; text: string; visual?: Visual }>;
  correctOrder: string[]; // Array of item IDs in correct order
  orderType: 'sequential' | 'chronological' | 'logical' | 'size' | 'custom';
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short_answer';
  sampleAnswer: string;
  keyWords: string[]; // Words that should appear in answer
  minLength?: number;
  maxLength?: number;
  rubric?: string[]; // Grading criteria
}

// ============================================================================
// UNION TYPE
// ============================================================================

export type Question = 
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | CountingQuestion
  | NumericQuestion
  | FillBlankQuestion
  | MatchingQuestion
  | OrderingQuestion
  | ShortAnswerQuestion;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isMultipleChoice(question: Question): question is MultipleChoiceQuestion {
  return question.type === 'multiple_choice';
}

export function isTrueFalse(question: Question): question is TrueFalseQuestion {
  return question.type === 'true_false';
}

export function isCounting(question: Question): question is CountingQuestion {
  return question.type === 'counting';
}

export function isNumeric(question: Question): question is NumericQuestion {
  return question.type === 'numeric';
}

export function isFillBlank(question: Question): question is FillBlankQuestion {
  return question.type === 'fill_blank';
}

export function isMatching(question: Question): question is MatchingQuestion {
  return question.type === 'matching';
}

export function isOrdering(question: Question): question is OrderingQuestion {
  return question.type === 'ordering';
}

export function isShortAnswer(question: Question): question is ShortAnswerQuestion {
  return question.type === 'short_answer';
}

// ============================================================================
// GRADE-APPROPRIATE QUESTION TYPES
// ============================================================================

export const GRADE_APPROPRIATE_TYPES: Record<Grade, QuestionType[]> = {
  'PreK': ['counting', 'true_false', 'multiple_choice'],
  'K': ['counting', 'true_false', 'multiple_choice'],
  '1': ['counting', 'true_false', 'multiple_choice', 'numeric'],
  '2': ['counting', 'true_false', 'multiple_choice', 'numeric', 'fill_blank'],
  '3': ['multiple_choice', 'true_false', 'numeric', 'fill_blank', 'matching'],
  '4': ['multiple_choice', 'true_false', 'numeric', 'fill_blank', 'matching'],
  '5': ['multiple_choice', 'true_false', 'numeric', 'fill_blank', 'matching', 'ordering'],
  '6': ['multiple_choice', 'true_false', 'numeric', 'fill_blank', 'matching', 'ordering', 'short_answer'],
  '7': ['multiple_choice', 'true_false', 'numeric', 'fill_blank', 'matching', 'ordering', 'short_answer'],
  '8': ['multiple_choice', 'true_false', 'numeric', 'fill_blank', 'matching', 'ordering', 'short_answer'],
  '9': ['multiple_choice', 'true_false', 'numeric', 'fill_blank', 'matching', 'ordering', 'short_answer'],
  '10': ['multiple_choice', 'true_false', 'numeric', 'fill_blank', 'matching', 'ordering', 'short_answer'],
  '11': ['multiple_choice', 'true_false', 'numeric', 'fill_blank', 'matching', 'ordering', 'short_answer'],
  '12': ['multiple_choice', 'true_false', 'numeric', 'fill_blank', 'matching', 'ordering', 'short_answer'],
};

// ============================================================================
// SUBJECT-SPECIFIC CONSTRAINTS
// ============================================================================

export const SUBJECT_CONSTRAINTS: Record<Subject, Partial<Record<QuestionType, boolean>>> = {
  'Math': {
    counting: true,
    numeric: true,
    multiple_choice: true,
    true_false: true,
    fill_blank: true,
    matching: true,
    ordering: true,
    short_answer: true,
  },
  'ELA': {
    counting: false, // Never use counting in ELA
    numeric: false,  // Rarely use numeric in ELA
    multiple_choice: true,
    true_false: true,
    fill_blank: true,
    matching: true,
    ordering: true,
    short_answer: true,
  },
  'Science': {
    counting: false, // Don't use counting in Science (use observation instead)
    numeric: true,
    multiple_choice: true,
    true_false: true,
    fill_blank: true,
    matching: true,
    ordering: true,
    short_answer: true,
  },
  'Social Studies': {
    counting: false, // Don't use counting in Social Studies
    numeric: false,
    multiple_choice: true,
    true_false: true,
    fill_blank: true,
    matching: true,
    ordering: true,
    short_answer: true,
  },
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function validateQuestionForGrade(question: Question, grade: Grade): boolean {
  const appropriateTypes = GRADE_APPROPRIATE_TYPES[grade];
  return appropriateTypes.includes(question.type);
}

export function validateQuestionForSubject(question: Question, subject: Subject): boolean {
  const constraints = SUBJECT_CONSTRAINTS[subject];
  return constraints[question.type] !== false;
}

export function getAvailableTypesForGradeSubject(grade: Grade, subject: Subject): QuestionType[] {
  const gradeTypes = GRADE_APPROPRIATE_TYPES[grade];
  const subjectConstraints = SUBJECT_CONSTRAINTS[subject];
  
  // Safety check for undefined grade or subject
  if (!gradeTypes) {
    console.warn(`Grade '${grade}' not found in GRADE_APPROPRIATE_TYPES, using K as default`);
    return GRADE_APPROPRIATE_TYPES['K'] || ['multiple_choice', 'true_false'];
  }
  
  if (!subjectConstraints) {
    console.warn(`Subject '${subject}' not found in SUBJECT_CONSTRAINTS, returning all grade types`);
    return gradeTypes;
  }
  
  return gradeTypes.filter(type => subjectConstraints[type] !== false);
}