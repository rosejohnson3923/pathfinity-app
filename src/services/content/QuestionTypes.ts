/**
 * QUESTION TYPE SYSTEM - PHASE 1 FOUNDATION
 * 
 * This file defines the complete type-safe question system with:
 * - BaseQuestion interface for common properties
 * - 15 discriminated union types for specific question formats
 * - Type guards for runtime validation
 * - Proper TypeScript type safety
 */

// ================================================================
// BASE QUESTION INTERFACE
// ================================================================

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  content: string;
  topic: string;
  subject?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  hints?: string[];
  explanation?: string;
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    alt?: string;
  };
  metadata?: {
    bloomsLevel?: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
    estimatedTime?: number; // in seconds
    tags?: string[];
  };
}

// ================================================================
// QUESTION TYPE DISCRIMINATED UNION
// ================================================================

export type QuestionType = 
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'numeric'
  | 'short_answer'
  | 'long_answer'
  | 'matching'
  | 'ordering'
  | 'classification'
  | 'visual_identification'
  | 'counting'
  | 'pattern_recognition'
  | 'code_completion'
  | 'diagram_labeling'
  | 'open_ended';

// ================================================================
// SPECIFIC QUESTION TYPE INTERFACES
// ================================================================

// 1. Multiple Choice Question
export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  allowMultiple?: boolean;
  randomizeOptions?: boolean;
}

// 2. True/False Question
export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  correctAnswer: boolean;
  statement: string;
}

// 3. Fill in the Blank Question
export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill_blank';
  blanks: Array<{
    id: string;
    position: number;
    correctAnswers: string[]; // Multiple acceptable answers
    caseSensitive?: boolean;
  }>;
  template: string; // Text with {{blank_id}} placeholders
  options?: string[]; // Optional multiple choice options for display
  correctAnswer?: string; // The primary correct answer
}

// 4. Numeric Question
export interface NumericQuestion extends BaseQuestion {
  type: 'numeric';
  correctAnswer: number;
  tolerance?: number; // Acceptable margin of error
  unit?: string;
  requiresUnit?: boolean;
  minValue?: number;
  maxValue?: number;
}

// 5. Short Answer Question
export interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short_answer';
  acceptableAnswers: string[];
  caseSensitive?: boolean;
  maxLength?: number;
  keywords?: string[]; // Required keywords in answer
}

// 6. Long Answer/Essay Question
export interface LongAnswerQuestion extends BaseQuestion {
  type: 'long_answer';
  rubric?: {
    criteria: Array<{
      name: string;
      description: string;
      points: number;
    }>;
  };
  minWords?: number;
  maxWords?: number;
  requiredElements?: string[];
}

// 7. Matching Question
export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  leftColumn: Array<{
    id: string;
    text: string;
  }>;
  rightColumn: Array<{
    id: string;
    text: string;
  }>;
  correctPairs: Array<{
    leftId: string;
    rightId: string;
  }>;
  allowPartialCredit?: boolean;
}

// 8. Ordering/Sequencing Question
export interface OrderingQuestion extends BaseQuestion {
  type: 'ordering';
  items: Array<{
    id: string;
    text: string;
    correctPosition: number;
  }>;
  orderType: 'sequential' | 'chronological' | 'logical' | 'custom';
  allowPartialCredit?: boolean;
}

// 9. Classification/Categorization Question
export interface ClassificationQuestion extends BaseQuestion {
  type: 'classification';
  categories: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  items: Array<{
    id: string;
    text: string;
    correctCategoryId: string;
  }>;
  allowMultipleCategories?: boolean;
}

// 10. Visual Identification Question
export interface VisualIdentificationQuestion extends BaseQuestion {
  type: 'visual_identification';
  imageUrl: string;
  imageAlt: string;
  targetAreas: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }>;
  questionPrompt: string;
  correctAreaIds: string[];
}

// 11. Counting Question
export interface CountingQuestion extends BaseQuestion {
  type: 'counting';
  visualElements?: {
    type: 'shapes' | 'objects' | 'patterns';
    imageUrl?: string;
    description: string;
  };
  correctCount: number;
  countWhat: string; // "apples", "triangles", etc.
}

// 12. Pattern Recognition Question
export interface PatternRecognitionQuestion extends BaseQuestion {
  type: 'pattern_recognition';
  sequence: Array<string | number>;
  missingPosition: number;
  options: Array<string | number>;
  correctAnswer: string | number;
  patternType: 'numeric' | 'alphabetic' | 'visual' | 'logical';
}

// 13. Code Completion Question
export interface CodeCompletionQuestion extends BaseQuestion {
  type: 'code_completion';
  language: 'javascript' | 'python' | 'html' | 'css' | 'sql' | 'pseudocode';
  codeTemplate: string;
  blanks: Array<{
    id: string;
    lineNumber: number;
    correctCode: string;
    alternatives?: string[];
  }>;
  executionTest?: {
    input: any;
    expectedOutput: any;
  };
}

// 14. Diagram Labeling Question
export interface DiagramLabelingQuestion extends BaseQuestion {
  type: 'diagram_labeling';
  diagramUrl: string;
  diagramAlt: string;
  labelPoints: Array<{
    id: string;
    x: number;
    y: number;
    correctLabel: string;
    acceptableLabels?: string[];
  }>;
  labelBank?: string[]; // Optional bank of labels to choose from
}

// 15. Open-Ended Question
export interface OpenEndedQuestion extends BaseQuestion {
  type: 'open_ended';
  prompt: string;
  suggestedTopics?: string[];
  responseFormat?: 'text' | 'audio' | 'drawing' | 'mixed';
  evaluationCriteria?: string[];
}

// ================================================================
// COMBINED QUESTION TYPE
// ================================================================

export type Question = 
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | NumericQuestion
  | ShortAnswerQuestion
  | LongAnswerQuestion
  | MatchingQuestion
  | OrderingQuestion
  | ClassificationQuestion
  | VisualIdentificationQuestion
  | CountingQuestion
  | PatternRecognitionQuestion
  | CodeCompletionQuestion
  | DiagramLabelingQuestion
  | OpenEndedQuestion;

// ================================================================
// TYPE GUARDS
// ================================================================

export function isMultipleChoice(question: Question): question is MultipleChoiceQuestion {
  return question.type === 'multiple_choice';
}

export function isTrueFalse(question: Question): question is TrueFalseQuestion {
  return question.type === 'true_false';
}

export function isFillBlank(question: Question): question is FillBlankQuestion {
  return question.type === 'fill_blank';
}

export function isNumeric(question: Question): question is NumericQuestion {
  return question.type === 'numeric';
}

export function isShortAnswer(question: Question): question is ShortAnswerQuestion {
  return question.type === 'short_answer';
}

export function isLongAnswer(question: Question): question is LongAnswerQuestion {
  return question.type === 'long_answer';
}

export function isMatching(question: Question): question is MatchingQuestion {
  return question.type === 'matching';
}

export function isOrdering(question: Question): question is OrderingQuestion {
  return question.type === 'ordering';
}

export function isClassification(question: Question): question is ClassificationQuestion {
  return question.type === 'classification';
}

export function isVisualIdentification(question: Question): question is VisualIdentificationQuestion {
  return question.type === 'visual_identification';
}

export function isCounting(question: Question): question is CountingQuestion {
  return question.type === 'counting';
}

export function isPatternRecognition(question: Question): question is PatternRecognitionQuestion {
  return question.type === 'pattern_recognition';
}

export function isCodeCompletion(question: Question): question is CodeCompletionQuestion {
  return question.type === 'code_completion';
}

export function isDiagramLabeling(question: Question): question is DiagramLabelingQuestion {
  return question.type === 'diagram_labeling';
}

export function isOpenEnded(question: Question): question is OpenEndedQuestion {
  return question.type === 'open_ended';
}

// ================================================================
// QUESTION DIFFICULTY HELPERS
// ================================================================

export function adjustDifficultyForGrade(
  question: Question,
  gradeLevel: string
): Question {
  const gradeNum = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);
  
  // Adjust difficulty based on grade
  if (gradeNum <= 2) {
    return { ...question, difficulty: 'easy' };
  } else if (gradeNum <= 5) {
    return { ...question, difficulty: 'medium' };
  } else {
    return { ...question, difficulty: 'hard' };
  }
}

// ================================================================
// QUESTION VALIDATION HELPERS
// ================================================================

export function validateQuestion(question: any): question is Question {
  // Basic validation
  if (!question || typeof question !== 'object') return false;
  if (!question.id || !question.type || !question.content) return false;
  if (!question.difficulty || !['easy', 'medium', 'hard'].includes(question.difficulty)) return false;
  if (typeof question.points !== 'number' || question.points < 0) return false;
  
  // Type-specific validation
  switch (question.type) {
    case 'multiple_choice':
      return validateMultipleChoice(question);
    case 'true_false':
      return validateTrueFalse(question);
    case 'fill_blank':
      return validateFillBlank(question);
    case 'numeric':
      return validateNumeric(question);
    case 'counting':
      return validateCounting(question);
    // Add more specific validators as needed
    default:
      return true; // Basic validation passed
  }
}

function validateMultipleChoice(q: any): boolean {
  return Array.isArray(q.options) && 
         q.options.length >= 2 &&
         q.options.some((o: any) => o.isCorrect === true);
}

function validateTrueFalse(q: any): boolean {
  return typeof q.correctAnswer === 'boolean' &&
         typeof q.statement === 'string';
}

function validateFillBlank(q: any): boolean {
  return Array.isArray(q.blanks) &&
         q.blanks.length > 0 &&
         typeof q.template === 'string';
}

function validateNumeric(q: any): boolean {
  return typeof q.correctAnswer === 'number';
}

function validateCounting(q: any): boolean {
  return typeof q.correctCount === 'number' &&
         typeof q.countWhat === 'string';
}

// ================================================================
// EXPORT SUMMARY
// ================================================================

export default {
  // Type Guards
  isMultipleChoice,
  isTrueFalse,
  isFillBlank,
  isNumeric,
  isShortAnswer,
  isLongAnswer,
  isMatching,
  isOrdering,
  isClassification,
  isVisualIdentification,
  isCounting,
  isPatternRecognition,
  isCodeCompletion,
  isDiagramLabeling,
  isOpenEnded,
  
  // Helpers
  adjustDifficultyForGrade,
  validateQuestion
};