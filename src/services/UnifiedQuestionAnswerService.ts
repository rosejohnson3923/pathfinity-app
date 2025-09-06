/**
 * Unified Question Answer Service
 * ================================
 * Standardizes how we handle correct answers across all 15 question types
 * Provides a single source of truth for answer extraction and validation
 * 
 * Created: 2025-08-31
 */

import {
  QuestionData,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  NumericQuestion,
  CountingQuestion,
  ShortAnswerQuestion,
  LongAnswerQuestion,
  MatchingQuestion,
  OrderingQuestion,
  ClassificationQuestion,
  VisualIdentificationQuestion,
  PatternRecognitionQuestion,
  CodeCompletionQuestion,
  DiagramLabelingQuestion,
  OpenEndedQuestion
} from '../types/questionTypes';

interface AnswerInfo {
  displayValue: string;
  rawValue: any;
  type: 'text' | 'number' | 'boolean' | 'array' | 'object';
  unit?: string;
}

export class UnifiedQuestionAnswerService {
  private static instance: UnifiedQuestionAnswerService;
  
  static getInstance(): UnifiedQuestionAnswerService {
    if (!UnifiedQuestionAnswerService.instance) {
      UnifiedQuestionAnswerService.instance = new UnifiedQuestionAnswerService();
    }
    return UnifiedQuestionAnswerService.instance;
  }
  
  /**
   * Get the correct answer for any question type
   * This is the SINGLE source of truth for correct answers
   */
  getCorrectAnswer(question: QuestionData): AnswerInfo {
    switch (question.type) {
      case 'multiple_choice':
        return this.getMultipleChoiceAnswer(question as MultipleChoiceQuestion);
      
      case 'true_false':
        return this.getTrueFalseAnswer(question as TrueFalseQuestion);
      
      case 'fill_blank':
        return this.getFillBlankAnswer(question as FillBlankQuestion);
      
      case 'numeric':
        return this.getNumericAnswer(question as NumericQuestion);
      
      case 'counting':
        return this.getCountingAnswer(question as CountingQuestion);
      
      case 'short_answer':
        return this.getShortAnswerAnswer(question as ShortAnswerQuestion);
      
      case 'long_answer':
        return this.getLongAnswerAnswer(question as LongAnswerQuestion);
      
      case 'matching':
        return this.getMatchingAnswer(question as MatchingQuestion);
      
      case 'ordering':
        return this.getOrderingAnswer(question as OrderingQuestion);
      
      case 'classification':
        return this.getClassificationAnswer(question as ClassificationQuestion);
      
      case 'visual_identification':
        return this.getVisualIdentificationAnswer(question as VisualIdentificationQuestion);
      
      case 'pattern_recognition':
        return this.getPatternRecognitionAnswer(question as PatternRecognitionQuestion);
      
      case 'code_completion':
        return this.getCodeCompletionAnswer(question as CodeCompletionQuestion);
      
      case 'diagram_labeling':
        return this.getDiagramLabelingAnswer(question as DiagramLabelingQuestion);
      
      case 'open_ended':
        return this.getOpenEndedAnswer(question as OpenEndedQuestion);
      
      default:
        console.warn(`Unknown question type: ${(question as any).type}`);
        return {
          displayValue: 'Answer not available',
          rawValue: null,
          type: 'text'
        };
    }
  }
  
  /**
   * Get display text for the correct answer
   * Used in UI feedback messages
   */
  getCorrectAnswerDisplay(question: QuestionData): string {
    const answerInfo = this.getCorrectAnswer(question);
    return answerInfo.displayValue;
  }
  
  /**
   * Get raw value for validation
   */
  getCorrectAnswerValue(question: QuestionData): any {
    const answerInfo = this.getCorrectAnswer(question);
    return answerInfo.rawValue;
  }
  
  // Individual type handlers
  
  private getMultipleChoiceAnswer(question: MultipleChoiceQuestion): AnswerInfo {
    const correctOption = question.options.find(opt => opt.isCorrect);
    
    if (!correctOption) {
      console.warn('No correct option found for multiple choice question');
      return {
        displayValue: 'No correct answer defined',
        rawValue: null,
        type: 'text'
      };
    }
    
    return {
      displayValue: correctOption.text,
      rawValue: correctOption.id,
      type: 'text'
    };
  }
  
  private getTrueFalseAnswer(question: TrueFalseQuestion): AnswerInfo {
    const isTrue = question.correctAnswer === true || 
                   question.correctAnswer === 'true' ||
                   (question as any).correct_answer === true ||
                   (question as any).correct_answer === 'true';
    
    return {
      displayValue: isTrue ? 'True' : 'False',
      rawValue: isTrue,
      type: 'boolean'
    };
  }
  
  private getFillBlankAnswer(question: FillBlankQuestion): AnswerInfo {
    if (!question.blanks || question.blanks.length === 0) {
      return {
        displayValue: 'No blanks defined',
        rawValue: [],
        type: 'array'
      };
    }
    
    const answers = question.blanks.map(blank => 
      blank.correctAnswers && blank.correctAnswers.length > 0 
        ? blank.correctAnswers[0] 
        : '___'
    );
    
    return {
      displayValue: answers.join(', '),
      rawValue: answers,
      type: 'array'
    };
  }
  
  private getNumericAnswer(question: NumericQuestion): AnswerInfo {
    const value = question.correctAnswer ?? (question as any).correct_answer;
    const unit = question.unit;
    
    if (value === undefined || value === null) {
      return {
        displayValue: 'No answer defined',
        rawValue: null,
        type: 'number'
      };
    }
    
    return {
      displayValue: unit ? `${value} ${unit}` : String(value),
      rawValue: Number(value),
      type: 'number',
      unit
    };
  }
  
  private getCountingAnswer(question: CountingQuestion): AnswerInfo {
    // CRITICAL: For counting questions, use correctCount field
    const count = question.correctCount ?? 
                  (question as any).correctAnswer ?? 
                  (question as any).correct_answer;
    
    if (count === undefined || count === null) {
      // Try to count visual elements
      if (question.visualElements?.description) {
        const emojiCount = (question.visualElements.description.match(/[\p{Emoji}]/gu) || []).length;
        if (emojiCount > 0) {
          return {
            displayValue: String(emojiCount),
            rawValue: emojiCount,
            type: 'number'
          };
        }
      }
      
      return {
        displayValue: 'No count defined',
        rawValue: 0,
        type: 'number'
      };
    }
    
    // If count is an index into options, resolve it
    if (typeof count === 'number' && (question as any).options && count < (question as any).options.length) {
      const optionValue = (question as any).options[count];
      const resolvedCount = parseInt(optionValue) || count;
      
      return {
        displayValue: String(resolvedCount),
        rawValue: resolvedCount,
        type: 'number'
      };
    }
    
    return {
      displayValue: String(count),
      rawValue: Number(count),
      type: 'number'
    };
  }
  
  private getShortAnswerAnswer(question: ShortAnswerQuestion): AnswerInfo {
    const answers = question.acceptableAnswers || [];
    const primary = answers[0] || (question as any).correctAnswer || (question as any).correct_answer || '';
    
    return {
      displayValue: primary,
      rawValue: answers.length > 0 ? answers : [primary],
      type: 'text'
    };
  }
  
  private getLongAnswerAnswer(question: LongAnswerQuestion): AnswerInfo {
    const sample = question.sampleAnswer || 'Sample answer not provided';
    
    return {
      displayValue: sample.length > 100 ? sample.substring(0, 100) + '...' : sample,
      rawValue: sample,
      type: 'text'
    };
  }
  
  private getMatchingAnswer(question: MatchingQuestion): AnswerInfo {
    const pairs = question.correctPairs.map(pair => 
      `${question.leftItems[pair.leftIndex]} → ${question.rightItems[pair.rightIndex]}`
    );
    
    return {
      displayValue: pairs.join(', '),
      rawValue: question.correctPairs,
      type: 'array'
    };
  }
  
  private getOrderingAnswer(question: OrderingQuestion): AnswerInfo {
    // Handle both correctOrder and correct_order
    const correctOrder = question.correctOrder || 
                        (question as any).correct_order || 
                        [];
    
    const items = question.items || (question as any).items || [];
    
    if (!correctOrder || correctOrder.length === 0) {
      return {
        displayValue: 'No order defined',
        rawValue: [],
        type: 'array'
      };
    }
    
    const ordered = correctOrder.map((index: number) => 
      items[index] || `Item ${index}`
    );
    
    return {
      displayValue: ordered.join(' → '),
      rawValue: correctOrder,
      type: 'array'
    };
  }
  
  private getClassificationAnswer(question: ClassificationQuestion): AnswerInfo {
    // Handle both correctClassifications and correct_classification
    const correctClassifications = question.correctClassifications || 
                                   (question as any).correct_classification ||
                                   (question as any).correct_answer ||
                                   {};
    
    if (!correctClassifications || Object.keys(correctClassifications).length === 0) {
      return {
        displayValue: 'No classifications defined',
        rawValue: {},
        type: 'object'
      };
    }
    
    const classifications = Object.entries(correctClassifications)
      .map(([item, category]) => `${item}: ${category}`)
      .slice(0, 3);
    
    const display = classifications.join(', ');
    const suffix = Object.keys(correctClassifications).length > 3 ? '...' : '';
    
    return {
      displayValue: display + suffix,
      rawValue: correctClassifications,
      type: 'object'
    };
  }
  
  private getVisualIdentificationAnswer(question: VisualIdentificationQuestion): AnswerInfo {
    const identifications = question.correctIdentifications || [];
    const primary = identifications[0] || (question as any).correctAnswer || '';
    
    return {
      displayValue: primary,
      rawValue: identifications,
      type: 'array'
    };
  }
  
  private getPatternRecognitionAnswer(question: PatternRecognitionQuestion): AnswerInfo {
    const next = question.nextInPattern || (question as any).correctAnswer || '';
    
    return {
      displayValue: String(next),
      rawValue: next,
      type: typeof next === 'number' ? 'number' : 'text'
    };
  }
  
  private getCodeCompletionAnswer(question: CodeCompletionQuestion): AnswerInfo {
    const code = question.correctCode || (question as any).correctAnswer || '';
    
    return {
      displayValue: code.length > 50 ? code.substring(0, 50) + '...' : code,
      rawValue: code,
      type: 'text'
    };
  }
  
  private getDiagramLabelingAnswer(question: DiagramLabelingQuestion): AnswerInfo {
    // Handle both correctLabels and legacy formats
    const correctLabels = question.correctLabels || 
                         (question as any).correct_labels ||
                         (question as any).labels ||
                         [];
    
    const correctPositions = (question as any).correct_positions || [];
    
    // If we have labels as strings and positions separately, combine them
    if (Array.isArray(correctLabels) && typeof correctLabels[0] === 'string' && correctPositions.length > 0) {
      const combinedLabels = correctLabels.map((text: string, i: number) => ({
        text,
        position: { 
          x: correctPositions[i]?.[0] || 0, 
          y: correctPositions[i]?.[1] || 0 
        }
      }));
      
      const display = combinedLabels.slice(0, 2)
        .map((label: any) => `${label.text} at (${label.position.x}, ${label.position.y})`)
        .join(', ');
      
      const suffix = combinedLabels.length > 2 ? '...' : '';
      
      return {
        displayValue: display + suffix,
        rawValue: combinedLabels,
        type: 'array'
      };
    }
    
    // If correctLabels is already in the expected format
    if (Array.isArray(correctLabels) && correctLabels.length > 0 && correctLabels[0].text) {
      const labels = correctLabels.map((label: any) => 
        `${label.text} at (${label.position?.x || 0}, ${label.position?.y || 0})`
      ).slice(0, 2);
      
      const display = labels.join(', ');
      const suffix = correctLabels.length > 2 ? '...' : '';
      
      return {
        displayValue: display + suffix,
        rawValue: correctLabels,
        type: 'array'
      };
    }
    
    // Fallback if no labels found
    return {
      displayValue: 'No labels defined',
      rawValue: [],
      type: 'array'
    };
  }
  
  private getOpenEndedAnswer(question: OpenEndedQuestion): AnswerInfo {
    return {
      displayValue: 'Open-ended (various answers accepted)',
      rawValue: null,
      type: 'text'
    };
  }
  
  /**
   * Validate if a user's answer is correct
   */
  validateAnswer(question: QuestionData, userAnswer: any): {
    isCorrect: boolean;
    feedback: string;
    correctAnswer: any;
  } {
    const correctAnswerInfo = this.getCorrectAnswer(question);
    
    switch (question.type) {
      case 'counting':
        const userCount = Number(userAnswer);
        const correctCount = correctAnswerInfo.rawValue;
        const isCorrect = userCount === correctCount;
        
        return {
          isCorrect,
          feedback: isCorrect 
            ? 'Correct count!' 
            : `The correct answer is ${correctCount}`,
          correctAnswer: correctCount
        };
      
      case 'numeric':
        const userNum = Number(userAnswer);
        const correctNum = correctAnswerInfo.rawValue;
        const numCorrect = Math.abs(userNum - correctNum) < 0.0001;
        
        return {
          isCorrect: numCorrect,
          feedback: numCorrect 
            ? 'Correct!' 
            : `The correct answer is ${correctAnswerInfo.displayValue}`,
          correctAnswer: correctNum
        };
      
      case 'true_false':
        const userBool = userAnswer === true || userAnswer === 'true';
        const correctBool = correctAnswerInfo.rawValue;
        const tfCorrect = userBool === correctBool;
        
        return {
          isCorrect: tfCorrect,
          feedback: tfCorrect 
            ? 'Correct!' 
            : `The correct answer is ${correctAnswerInfo.displayValue}`,
          correctAnswer: correctBool
        };
      
      default:
        // For other types, use string comparison for now
        const isMatch = String(userAnswer).toLowerCase() === 
                       String(correctAnswerInfo.rawValue).toLowerCase();
        
        return {
          isCorrect: isMatch,
          feedback: isMatch 
            ? 'Correct!' 
            : `The correct answer is ${correctAnswerInfo.displayValue}`,
          correctAnswer: correctAnswerInfo.rawValue
        };
    }
  }
}

// Export singleton instance
export const unifiedAnswerService = UnifiedQuestionAnswerService.getInstance();