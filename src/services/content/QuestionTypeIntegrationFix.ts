/**
 * Question Type Integration Fix
 * Ensures all 15 question types work properly throughout the system
 */

import { Question, QuestionType } from './QuestionTypes';
import { staticDataService } from '../staticDataService';

export class QuestionTypeIntegrationFix {
  private static instance: QuestionTypeIntegrationFix;
  
  // All 15 supported question types
  private readonly ALL_QUESTION_TYPES: QuestionType[] = [
    'multiple_choice',
    'true_false',
    'true_false_w_image',
    'true_false_wo_image',
    'fill_blank',
    'numeric',
    'short_answer',
    'matching',
    'sequencing',
    'visual_pattern',
    'drawing',
    'coding',
    'creative_writing',
    'counting',
    'word_problem'
  ];
  
  private constructor() {}
  
  static getInstance(): QuestionTypeIntegrationFix {
    if (!QuestionTypeIntegrationFix.instance) {
      QuestionTypeIntegrationFix.instance = new QuestionTypeIntegrationFix();
    }
    return QuestionTypeIntegrationFix.instance;
  }
  
  /**
   * Ensure question type is valid and supported
   */
  normalizeQuestionType(type: string): QuestionType {
    // Handle legacy type mappings
    const typeMap: Record<string, QuestionType> = {
      'multiple-choice': 'multiple_choice',
      'multiplechoice': 'multiple_choice',
      'mc': 'multiple_choice',
      'true-false': 'true_false',
      'truefalse': 'true_false',
      'tf': 'true_false',
      'true_false': 'true_false',
      'true_false_with_image': 'true_false_w_image',
      'true_false_without_image': 'true_false_wo_image',
      'fill-in-the-blank': 'fill_blank',
      'fillblank': 'fill_blank',
      'fill_in_blank': 'fill_blank',
      'number': 'numeric',
      'numerical': 'numeric',
      'short-answer': 'short_answer',
      'shortanswer': 'short_answer',
      'match': 'matching',
      'sequence': 'sequencing',
      'ordering': 'sequencing',
      'order': 'sequencing',
      'pattern': 'visual_pattern',
      'visual': 'visual_pattern',
      'draw': 'drawing',
      'sketch': 'drawing',
      'code': 'coding',
      'programming': 'coding',
      'creative': 'creative_writing',
      'writing': 'creative_writing',
      'essay': 'creative_writing',
      'count': 'counting',
      'word-problem': 'word_problem',
      'wordproblem': 'word_problem',
      'story_problem': 'word_problem'
    };
    
    const normalizedType = type.toLowerCase().replace(/\s+/g, '_');
    const mappedType = typeMap[normalizedType] || normalizedType;
    
    // Validate it's a supported type
    if (!this.ALL_QUESTION_TYPES.includes(mappedType as QuestionType)) {
      console.warn(`Unknown question type: ${type}, defaulting to multiple_choice`);
      return 'multiple_choice';
    }
    
    return mappedType as QuestionType;
  }
  
  /**
   * Get suitable question types for grade and subject
   */
  async getSuitableQuestionTypes(
    grade: string,
    subject: string
  ): Promise<QuestionType[]> {
    try {
      // Get from database
      const dbTypes = await staticDataService.getQuestionTypesForGrade(grade, subject);
      
      // Ensure all types are normalized
      const normalizedTypes = dbTypes.map(t => this.normalizeQuestionType(t));
      
      // Filter out duplicates
      const uniqueTypes = [...new Set(normalizedTypes)];
      
      // If no types found, return sensible defaults
      if (uniqueTypes.length === 0) {
        const gradeNum = parseInt(grade) || 5;
        
        // Age-appropriate defaults
        if (gradeNum <= 2) {
          return ['multiple_choice', 'true_false', 'counting', 'matching', 'visual_pattern'];
        } else if (gradeNum <= 5) {
          return ['multiple_choice', 'true_false', 'fill_blank', 'numeric', 'matching'];
        } else if (gradeNum <= 8) {
          return ['multiple_choice', 'true_false', 'fill_blank', 'numeric', 'short_answer', 'sequencing'];
        } else {
          // High school - all types available
          return ['multiple_choice', 'true_false', 'fill_blank', 'numeric', 'short_answer', 
                  'matching', 'sequencing', 'word_problem', 'coding', 'creative_writing'];
        }
      }
      
      return uniqueTypes;
    } catch (error) {
      console.error('Error getting suitable question types:', error);
      // Return safe defaults on error
      return ['multiple_choice', 'true_false', 'fill_blank', 'numeric', 'short_answer'];
    }
  }
  
  /**
   * Convert legacy question format to proper Question type
   */
  convertToProperQuestion(rawQuestion: any): Question {
    const type = this.normalizeQuestionType(rawQuestion.type || 'multiple_choice');
    
    // Base question properties
    const baseQuestion = {
      id: rawQuestion.id || `q-${Date.now()}-${Math.random()}`,
      type,
      content: rawQuestion.question || rawQuestion.content || '',
      points: rawQuestion.points || 10,
      timeLimit: rawQuestion.timeLimit,
      hint: rawQuestion.hint,
      explanation: rawQuestion.explanation,
      metadata: {
        difficulty: rawQuestion.difficulty || 'medium',
        skill: rawQuestion.skill,
        career: rawQuestion.career,
        ...rawQuestion.metadata
      }
    };
    
    // Add type-specific properties
    switch (type) {
      case 'multiple_choice':
        return {
          ...baseQuestion,
          type: 'multiple_choice',
          options: this.normalizeOptions(rawQuestion.options || rawQuestion.choices || []),
          correctAnswer: rawQuestion.correctAnswer || rawQuestion.correct_answer || '',
          allowMultiple: rawQuestion.allowMultiple || false
        };
        
      case 'true_false':
      case 'true_false_w_image':
      case 'true_false_wo_image':
        return {
          ...baseQuestion,
          type,
          correctAnswer: this.normalizeTrueFalse(rawQuestion.correctAnswer || rawQuestion.correct_answer),
          image: type === 'true_false_w_image' ? (rawQuestion.image || rawQuestion.visual) : undefined
        };
        
      case 'fill_blank':
        return {
          ...baseQuestion,
          type: 'fill_blank',
          blanks: rawQuestion.blanks || this.extractBlanks(baseQuestion.content),
          correctAnswers: rawQuestion.correctAnswers || rawQuestion.correct_answers || [],
          acceptableAnswers: rawQuestion.acceptableAnswers || []
        };
        
      case 'numeric':
        return {
          ...baseQuestion,
          type: 'numeric',
          correctAnswer: Number(rawQuestion.correctAnswer || rawQuestion.correct_answer || 0),
          tolerance: rawQuestion.tolerance || 0.01,
          units: rawQuestion.units
        };
        
      case 'matching':
        return {
          ...baseQuestion,
          type: 'matching',
          leftItems: rawQuestion.leftItems || rawQuestion.items || [],
          rightItems: rawQuestion.rightItems || rawQuestion.matches || [],
          correctPairs: rawQuestion.correctPairs || rawQuestion.correct_pairs || []
        };
        
      case 'sequencing':
        return {
          ...baseQuestion,
          type: 'sequencing',
          items: rawQuestion.items || rawQuestion.sequence || [],
          correctOrder: rawQuestion.correctOrder || rawQuestion.correct_order || []
        };
        
      case 'visual_pattern':
        return {
          ...baseQuestion,
          type: 'visual_pattern',
          pattern: rawQuestion.pattern || [],
          options: rawQuestion.options || [],
          correctAnswer: rawQuestion.correctAnswer || rawQuestion.correct_answer
        };
        
      case 'counting':
        return {
          ...baseQuestion,
          type: 'counting',
          image: rawQuestion.image || rawQuestion.visual,
          correctCount: Number(rawQuestion.correctCount || rawQuestion.correct_count || 0),
          itemType: rawQuestion.itemType || rawQuestion.item_type || 'objects'
        };
        
      case 'word_problem':
        return {
          ...baseQuestion,
          type: 'word_problem',
          scenario: rawQuestion.scenario || baseQuestion.content,
          steps: rawQuestion.steps || [],
          correctAnswer: rawQuestion.correctAnswer || rawQuestion.correct_answer,
          answerType: rawQuestion.answerType || 'numeric'
        };
        
      case 'drawing':
        return {
          ...baseQuestion,
          type: 'drawing',
          prompt: rawQuestion.prompt || baseQuestion.content,
          rubric: rawQuestion.rubric || [],
          referenceImage: rawQuestion.referenceImage || rawQuestion.reference
        };
        
      case 'coding':
        return {
          ...baseQuestion,
          type: 'coding',
          language: rawQuestion.language || 'javascript',
          starterCode: rawQuestion.starterCode || rawQuestion.starter_code || '',
          testCases: rawQuestion.testCases || rawQuestion.test_cases || [],
          solution: rawQuestion.solution
        };
        
      case 'creative_writing':
        return {
          ...baseQuestion,
          type: 'creative_writing',
          prompt: rawQuestion.prompt || baseQuestion.content,
          minWords: rawQuestion.minWords || rawQuestion.min_words || 50,
          maxWords: rawQuestion.maxWords || rawQuestion.max_words || 500,
          rubric: rawQuestion.rubric || []
        };
        
      case 'short_answer':
      default:
        return {
          ...baseQuestion,
          type: 'short_answer',
          acceptableAnswers: rawQuestion.acceptableAnswers || 
                           rawQuestion.acceptable_answers || 
                           [rawQuestion.correctAnswer || rawQuestion.correct_answer || ''],
          caseSensitive: rawQuestion.caseSensitive || false,
          rubric: rawQuestion.rubric || []
        };
    }
  }
  
  /**
   * Normalize multiple choice options
   */
  private normalizeOptions(options: any[]): Array<{ id: string; text: string; isCorrect: boolean }> {
    if (!options || options.length === 0) {
      return [
        { id: 'a', text: 'Option A', isCorrect: true },
        { id: 'b', text: 'Option B', isCorrect: false },
        { id: 'c', text: 'Option C', isCorrect: false },
        { id: 'd', text: 'Option D', isCorrect: false }
      ];
    }
    
    return options.map((opt, idx) => {
      if (typeof opt === 'string') {
        return {
          id: String.fromCharCode(97 + idx), // a, b, c, d...
          text: opt,
          isCorrect: idx === 0 // Assume first is correct if not specified
        };
      }
      
      return {
        id: opt.id || String.fromCharCode(97 + idx),
        text: opt.text || opt.label || opt.value || String(opt),
        isCorrect: opt.isCorrect || opt.is_correct || false
      };
    });
  }
  
  /**
   * Normalize true/false answer
   */
  private normalizeTrueFalse(answer: any): boolean {
    if (typeof answer === 'boolean') return answer;
    if (typeof answer === 'string') {
      const lower = answer.toLowerCase();
      return lower === 'true' || lower === 't' || lower === 'yes' || lower === 'y';
    }
    return false;
  }
  
  /**
   * Extract blanks from fill-in-the-blank content
   */
  private extractBlanks(content: string): Array<{ id: string; position: number; length: number }> {
    const blanks: Array<{ id: string; position: number; length: number }> = [];
    const regex = /_{2,}|\[.*?\]/g;
    let match;
    let blankId = 0;
    
    while ((match = regex.exec(content)) !== null) {
      blanks.push({
        id: `blank-${blankId++}`,
        position: match.index,
        length: match[0].length
      });
    }
    
    return blanks;
  }
  
  /**
   * Validate that a question has all required properties
   */
  validateQuestion(question: Question): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check base properties
    if (!question.id) errors.push('Question missing ID');
    if (!question.type) errors.push('Question missing type');
    if (!question.content && question.type !== 'drawing' && question.type !== 'coding') {
      errors.push('Question missing content');
    }
    
    // Type-specific validation
    switch (question.type) {
      case 'multiple_choice':
        const mc = question as any;
        if (!mc.options || mc.options.length < 2) {
          errors.push('Multiple choice needs at least 2 options');
        }
        if (!mc.correctAnswer && !mc.options?.some((o: any) => o.isCorrect)) {
          errors.push('Multiple choice needs a correct answer');
        }
        break;
        
      case 'true_false':
      case 'true_false_w_image':
      case 'true_false_wo_image':
        const tf = question as any;
        if (tf.correctAnswer === undefined || tf.correctAnswer === null) {
          errors.push('True/False needs a correct answer');
        }
        break;
        
      case 'numeric':
        const num = question as any;
        if (num.correctAnswer === undefined || num.correctAnswer === null) {
          errors.push('Numeric question needs a correct answer');
        }
        break;
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const questionTypeIntegrationFix = QuestionTypeIntegrationFix.getInstance();