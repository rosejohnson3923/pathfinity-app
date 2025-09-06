/**
 * Question Type Validator Service
 * Validates and corrects AI-generated questions to ensure they match
 * the expected format for UI components
 */

import {
  PathfinityQuestionType,
  QuestionData,
  ValidationResult,
  QUESTION_TYPES,
  TYPE_DETECTION_PATTERNS,
  isTypeAppropriateForGrade,
  ALL_TYPE_IDS
} from '../types/questionTypes';

class QuestionTypeValidator {
  private static instance: QuestionTypeValidator;
  private typeRegistry: Map<string, PathfinityQuestionType>;
  private validationLog: Array<{
    timestamp: Date;
    original: any;
    corrected: any;
    issues: string[];
  }> = [];

  private constructor() {
    // Initialize type registry
    this.typeRegistry = new Map();
    Object.values(QUESTION_TYPES).forEach(type => {
      this.typeRegistry.set(type.id, type);
    });
  }

  static getInstance(): QuestionTypeValidator {
    if (!QuestionTypeValidator.instance) {
      QuestionTypeValidator.instance = new QuestionTypeValidator();
    }
    return QuestionTypeValidator.instance;
  }

  /**
   * Main validation method - validates and corrects a question
   */
  validate(question: any, grade: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Deep clone to avoid modifying original
    const correctedQuestion = JSON.parse(JSON.stringify(question));
    
    // Step 1: Validate type exists
    if (!question.type) {
      errors.push('Question type is missing');
      correctedQuestion.type = this.detectType(question);
      suggestions.push(`Detected type as: ${correctedQuestion.type}`);
    } else if (!this.typeRegistry.has(question.type)) {
      errors.push(`Unknown question type: ${question.type}`);
      correctedQuestion.type = this.detectType(question);
      suggestions.push(`Corrected type to: ${correctedQuestion.type}`);
    }
    
    // Step 2: Check if type is appropriate for grade
    if (!isTypeAppropriateForGrade(correctedQuestion.type, grade)) {
      warnings.push(`Type ${correctedQuestion.type} may not be appropriate for grade ${grade}`);
      const suggestedType = this.suggestGradeAppropriateType(correctedQuestion, grade);
      if (suggestedType !== correctedQuestion.type) {
        suggestions.push(`Consider using type: ${suggestedType}`);
      }
    }
    
    // Step 3: Validate required fields
    const type = this.typeRegistry.get(correctedQuestion.type);
    if (type) {
      const fieldValidation = this.validateRequiredFields(correctedQuestion, type);
      errors.push(...fieldValidation.errors);
      warnings.push(...fieldValidation.warnings);
      
      // Apply corrections
      Object.assign(correctedQuestion, fieldValidation.corrections);
    }
    
    // Step 4: Type-specific validation and correction
    const typeValidation = this.validateTypeSpecific(correctedQuestion);
    errors.push(...typeValidation.errors);
    warnings.push(...typeValidation.warnings);
    Object.assign(correctedQuestion, typeValidation.corrections);
    
    // Log validation for analysis
    if (errors.length > 0 || warnings.length > 0) {
      this.logValidation(question, correctedQuestion, [...errors, ...warnings]);
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      correctedType: correctedQuestion.type !== question.type ? correctedQuestion.type : undefined
    };
  }

  /**
   * Detect question type based on patterns and structure
   */
  detectType(question: any): string {
    // CRITICAL: Check for True/False first with highest priority
    // This must come before any other detection to prevent misclassification
    const questionText = question.question || '';
    if (questionText.match(/^true or false:?/i) || questionText.match(/^t\/f:?/i)) {
      console.log(`🔍 Type detected as true_false using explicit True/False pattern`);
      return 'true_false';
    }
    
    // Sort patterns by priority
    const sortedPatterns = [...TYPE_DETECTION_PATTERNS].sort((a, b) => a.priority - b.priority);
    
    for (const pattern of sortedPatterns) {
      // Skip true/false patterns as we already checked them
      if (pattern.type === 'true_false') continue;
      
      if (pattern.pattern.test(questionText)) {
        // Check additional conditions if any
        if (!pattern.conditions || pattern.conditions(question)) {
          console.log(`🔍 Type detected as ${pattern.type} using pattern: ${pattern.pattern}`);
          return pattern.type;
        }
      }
    }
    
    // Fallback detection based on structure
    // Check answer type BEFORE checking question content
    if (typeof question.correct_answer === 'boolean' ||
        ['true', 'false'].includes(String(question.correct_answer).toLowerCase())) {
      console.log(`🔍 Type detected as true_false based on answer format`);
      return 'true_false';
    }
    
    if (Array.isArray(question.options) && question.options.length > 0) {
      return 'multiple_choice';
    }
    
    // Only check for counting if we have visual AND it's not already true/false
    if (question.visual && (questionText.toLowerCase().includes('count') || 
                           questionText.toLowerCase().includes('how many'))) {
      return 'counting';
    }
    
    if (typeof question.correct_answer === 'number' || 
        !isNaN(Number(question.correct_answer))) {
      return 'numeric';
    }
    
    // Default fallback
    return 'fill_blank';
  }

  /**
   * Suggest a grade-appropriate alternative type
   */
  private suggestGradeAppropriateType(question: any, grade: string): string {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    
    // For K-2, prefer visual and simple types
    if (gradeNum <= 2) {
      if (question.visual) return 'counting';
      if (question.options) return 'multiple_choice';
      return 'true_false';
    }
    
    // For 3-5, standard types
    if (gradeNum <= 5) {
      if (question.options) return 'multiple_choice';
      if (!isNaN(Number(question.correct_answer))) return 'numeric';
      return 'fill_blank';
    }
    
    // For 6+, any basic type is fine
    return question.type || 'multiple_choice';
  }

  /**
   * Validate required fields for a question type
   */
  private validateRequiredFields(
    question: any, 
    type: PathfinityQuestionType
  ): { errors: string[]; warnings: string[]; corrections: any } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const corrections: any = {};
    
    // Check required fields
    for (const field of type.requiredFields) {
      if (!question[field] || (Array.isArray(question[field]) && question[field].length === 0)) {
        errors.push(`Missing required field: ${field}`);
        
        // Apply default corrections
        if (field === 'visual' && type.id === 'counting') {
          // Generate default visual for counting
          const count = parseInt(question.correct_answer) || 3;
          corrections.visual = '⭐ '.repeat(count).trim();
          warnings.push(`Generated default visual for counting question`);
        }
        
        if (field === 'options' && type.id === 'multiple_choice') {
          // Can't generate options, this is a critical error
          errors.push(`Cannot generate options for multiple choice question`);
        }
      }
    }
    
    return { errors, warnings, corrections };
  }

  /**
   * Type-specific validation and correction
   */
  private validateTypeSpecific(question: any): { 
    errors: string[]; 
    warnings: string[]; 
    corrections: any 
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const corrections: any = {};
    
    switch (question.type) {
      case 'true_false':
        // Ensure answer is string 'true' or 'false'
        const tfAnswer = String(question.correct_answer).toLowerCase();
        if (!['true', 'false'].includes(tfAnswer)) {
          errors.push(`Invalid true/false answer: ${question.correct_answer}`);
        } else {
          corrections.correct_answer = tfAnswer;
        }
        break;
        
      case 'counting':
        // Must have visual and numeric answer
        if (!question.visual) {
          errors.push('Counting questions require visual field');
        }
        
        const countAnswer = parseInt(question.correct_answer);
        if (isNaN(countAnswer)) {
          errors.push(`Invalid counting answer: ${question.correct_answer}`);
        } else {
          corrections.correct_answer = String(countAnswer);
          
          // Validate visual matches answer
          if (question.visual) {
            const emojiCount = (question.visual.match(/[\p{Emoji}]/gu) || []).length;
            if (emojiCount !== countAnswer) {
              warnings.push(`Visual has ${emojiCount} items but answer is ${countAnswer}`);
              // Auto-correct visual
              const emoji = question.visual.match(/[\p{Emoji}]/u)?.[0] || '⭐';
              corrections.visual = `${emoji} `.repeat(countAnswer).trim();
            }
          }
        }
        break;
        
      case 'multiple_choice':
        // Must have exactly 4 options for consistency
        if (!Array.isArray(question.options)) {
          errors.push('Multiple choice requires options array');
        } else if (question.options.length !== 4) {
          warnings.push(`Multiple choice should have 4 options, found ${question.options.length}`);
        }
        
        // Correct answer should be index or value
        if (typeof question.correct_answer === 'number') {
          if (question.correct_answer < 0 || question.correct_answer >= question.options?.length) {
            errors.push(`Invalid option index: ${question.correct_answer}`);
          }
        } else if (typeof question.correct_answer === 'string') {
          // Convert to index if it's the actual answer text
          const index = question.options?.indexOf(question.correct_answer);
          if (index >= 0) {
            corrections.correct_answer = index;
          } else {
            errors.push(`Answer not found in options: ${question.correct_answer}`);
          }
        }
        break;
        
      case 'numeric':
        // Ensure answer is numeric
        const numAnswer = Number(question.correct_answer);
        if (isNaN(numAnswer)) {
          errors.push(`Invalid numeric answer: ${question.correct_answer}`);
        } else {
          corrections.correct_answer = numAnswer;
        }
        break;
        
      case 'fill_blank':
        // Ensure answer is string
        if (typeof question.correct_answer !== 'string') {
          corrections.correct_answer = String(question.correct_answer);
        }
        
        // Check if question has blank indicator
        if (!question.question?.includes('_') && !question.question?.includes('[blank]')) {
          warnings.push('Fill-in-blank question should contain _ or [blank] to indicate where to fill');
        }
        break;
    }
    
    return { errors, warnings, corrections };
  }

  /**
   * Batch validate multiple questions
   */
  validateBatch(questions: any[], grade: string): {
    results: ValidationResult[];
    summary: {
      total: number;
      valid: number;
      corrected: number;
      failed: number;
    };
  } {
    const results = questions.map(q => this.validate(q, grade));
    
    return {
      results,
      summary: {
        total: questions.length,
        valid: results.filter(r => r.valid && !r.correctedType).length,
        corrected: results.filter(r => r.correctedType).length,
        failed: results.filter(r => !r.valid).length
      }
    };
  }

  /**
   * Apply corrections to a question
   */
  applyCorrections(question: any, grade: string): QuestionData {
    const validation = this.validate(question, grade);
    
    // Apply type correction if needed
    if (validation.correctedType) {
      question.type = validation.correctedType;
    }
    
    // Re-validate with corrected type
    const finalValidation = this.validate(question, grade);
    
    if (!finalValidation.valid) {
      console.warn('Question still invalid after corrections:', finalValidation.errors);
    }
    
    return question as QuestionData;
  }

  /**
   * Log validation for analytics
   */
  private logValidation(original: any, corrected: any, issues: string[]) {
    this.validationLog.push({
      timestamp: new Date(),
      original,
      corrected,
      issues
    });
    
    // Keep only last 100 entries
    if (this.validationLog.length > 100) {
      this.validationLog.shift();
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Question Validation:', {
        original: original.type,
        corrected: corrected.type,
        issues
      });
    }
  }

  /**
   * Get validation statistics
   */
  getValidationStats(): {
    totalValidations: number;
    typeMismatches: number;
    mostCommonIssues: string[];
    typeCorrections: Record<string, number>;
  } {
    const typeCorrections: Record<string, number> = {};
    const allIssues: string[] = [];
    
    this.validationLog.forEach(log => {
      if (log.original.type !== log.corrected.type) {
        const key = `${log.original.type} → ${log.corrected.type}`;
        typeCorrections[key] = (typeCorrections[key] || 0) + 1;
      }
      allIssues.push(...log.issues);
    });
    
    // Count issue frequency
    const issueCounts = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonIssues = Object.entries(issueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue]) => issue);
    
    return {
      totalValidations: this.validationLog.length,
      typeMismatches: Object.keys(typeCorrections).length,
      mostCommonIssues,
      typeCorrections
    };
  }

  /**
   * Export validation log for analysis
   */
  exportValidationLog(): string {
    return JSON.stringify(this.validationLog, null, 2);
  }

  /**
   * Clear validation log
   */
  clearValidationLog(): void {
    this.validationLog = [];
  }
}

// Export singleton instance
export const questionTypeValidator = QuestionTypeValidator.getInstance();

// Export for testing
export default QuestionTypeValidator;