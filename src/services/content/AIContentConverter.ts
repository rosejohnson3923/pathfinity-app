/**
 * AI CONTENT CONVERTER
 * Converts AI-generated content from AILearningJourneyService format
 * to proper Question objects that work with QuestionRenderer
 */

import {
  Question,
  QuestionType,
  MultipleChoiceQuestion,
  NumericQuestion,
  CountingQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  ShortAnswerQuestion
} from './QuestionTypes';

export class AIContentConverter {
  private static instance: AIContentConverter;
  private idCounter: number = 0;

  private constructor() {}

  static getInstance(): AIContentConverter {
    if (!AIContentConverter.instance) {
      AIContentConverter.instance = new AIContentConverter();
    }
    return AIContentConverter.instance;
  }

  /**
   * Generate unique IDs for questions
   */
  private generateQuestionId(prefix: string = 'q'): string {
    this.idCounter++;
    return `${prefix}-${Date.now()}-${this.idCounter}`;
  }

  /**
   * Convert assessment from AI format to Question object
   */
  convertAssessment(
    assessment: {
      question: string;
      type?: QuestionType;
      visual?: string;
      options?: string[];
      correct_answer: number | string;
      explanation?: string;
      success_message?: string;
    },
    skillInfo: {
      subject: string;
      grade: string;
      skill_name: string;
      skill_number: string;
    }
  ): Question {
    // Log the assessment structure to debug
    console.log('📝 Converting assessment:', {
      question: assessment?.question,
      type: assessment?.type,
      visual: assessment?.visual,
      options: assessment?.options,
      correctAnswer: assessment?.correct_answer
    });
    
    // Detect type if not provided
    const questionType = this.detectQuestionType(assessment, skillInfo);
    
    console.log('🎯 Detected question type:', questionType);
    
    // No need to normalize type variants anymore
    const normalizedType = questionType;
    
    // Convert based on type
    switch (normalizedType) {
      case 'counting':
        return this.toCountingQuestion(assessment, skillInfo);
      
      case 'multiple_choice':
        return this.toMultipleChoiceQuestion(assessment, skillInfo);
      
      case 'true_false':
        return this.toTrueFalseQuestion(assessment, skillInfo);
      
      case 'fill_blank':
        return this.toFillBlankQuestion(assessment, skillInfo);
      
      case 'numeric':
        return this.toNumericQuestion(assessment, skillInfo);
      
      case 'short_answer':
        return this.toShortAnswerQuestion(assessment, skillInfo);
      
      default:
        // Default to multiple choice if we have options
        if (assessment.options && assessment.options.length > 0) {
          return this.toMultipleChoiceQuestion(assessment, skillInfo);
        }
        return this.toShortAnswerQuestion(assessment, skillInfo);
    }
  }

  /**
   * Convert practice questions from AI format to Question objects
   */
  convertPracticeQuestions(
    practice: Array<{
      question: string;
      type?: QuestionType;
      options?: string[];
      correct_answer: string | number;
      hint?: string;
      explanation?: string;
      visual?: string;
      content?: string;  // Sometimes passed directly
    }>,
    skillInfo: {
      subject: string;
      grade: string;
      skill_name: string;
      skill_number: string;
    }
  ): Question[] {
    return practice.map((q, index) => {
      console.log(`🔍 Converting practice question ${index}:`, {
        originalQuestion: q,
        questionField: q.question,
        contentField: q.content,
        hasVisual: !!q.visual,
        visual: q.visual,
        type: q.type
      });
      
      const question = this.convertAssessment(
        {
          ...q,
          success_message: 'Great job!'
        },
        skillInfo
      );
      
      // Add practice-specific metadata
      question.id = this.generateQuestionId(`practice-${index}`);
      if (q.hint) {
        question.hints = [q.hint];
      }
      
      console.log(`✅ Converted practice question ${index}:`, {
        id: question.id,
        type: question.type,
        content: question.content,
        hasContent: !!question.content,
        hasMedia: !!(question as any).media,
        media: (question as any).media
      });
      
      return question;
    });
  }

  private detectQuestionType(
    assessment: any,
    skillInfo: { subject: string; grade: string }
  ): QuestionType {
    // Ensure question is a string first
    const questionText = String(assessment.question || '').toLowerCase();
    
    // Check for counting patterns
    // But trust the AI's type since we've improved the prompt
    const countingPatterns = [
      'how many',
      'count',
      'total number',
      'what is the number',
      'how much',
      'find the number'
    ];
    
    const hasCountingPattern = countingPatterns.some(pattern => 
      questionText.includes(pattern)
    );
    
    // If it has counting pattern AND visual with emojis, override to counting
    if (hasCountingPattern && assessment.visual) {
      // Handle visual as either string or object with content property
      const visualContent = typeof assessment.visual === 'string' 
        ? assessment.visual 
        : assessment.visual?.content || assessment.visual?.text || '';
      
      const hasEmojis = visualContent && /[\p{Emoji}]/u.test(visualContent);
      if (hasEmojis) {
        console.log('🎯 Overriding type to counting due to pattern + emojis', {
          visual: assessment.visual,
          visualContent,
          hasEmojis
        });
        return 'counting';
      }
    }
    
    // If it has counting pattern AND all numeric options, override to counting
    if (hasCountingPattern && assessment.options) {
      const allNumeric = assessment.options.every((opt: any) => 
        !isNaN(Number(opt))
      );
      if (allNumeric) {
        console.log('🎯 Overriding type to counting due to pattern + numeric options');
        return 'counting';
      }
    }
    
    // Now check if type is explicitly set and handle it
    if (assessment.type) {
      // No variants needed - just use the type as-is
      return assessment.type;
    }
    
    // Also check if it's a math question for young grades with visual (fallback)
    if (assessment.visual && skillInfo.subject === 'Math' && 
        (parseInt(skillInfo.grade) <= 2 || skillInfo.grade === 'K')) {
      return 'counting';
    }
    
    // Check for fill in the blank
    if (questionText.includes('_____') || questionText.includes('___')) {
      return 'fill_blank';
    }
    
    // Check for true/false
    if (assessment.options?.length === 2 && 
        (assessment.options.includes('True') || assessment.options.includes('true'))) {
      return 'true_false';
    }
    
    // For questions with counting patterns but numeric options, still treat as counting
    if (hasCountingPattern && assessment.options) {
      const allNumeric = assessment.options.every((opt: any) => 
        !isNaN(Number(opt))
      );
      if (allNumeric) {
        console.log('🎯 Detected as counting question due to pattern + numeric options');
        return 'counting';
      }
    }
    
    // Default to multiple choice if options exist
    if (assessment.options && assessment.options.length > 0) {
      return 'multiple_choice';
    }
    
    // Check for numeric
    if (skillInfo.subject === 'Math' && !isNaN(Number(assessment.correct_answer))) {
      return 'numeric';
    }
    
    return 'short_answer';
  }

  private toCountingQuestion(assessment: any, skillInfo: any): CountingQuestion {
    // Count emojis in visual - this is the primary source of truth
    let correctCount = 0;
    
    if (assessment.visual && assessment.visual !== '❓') {
      // Handle visual as either string or object with content property
      const visualContent = typeof assessment.visual === 'string' 
        ? assessment.visual 
        : assessment.visual?.content || assessment.visual?.text || '';
      
      const matches = visualContent.match(/[\p{Emoji}]/gu);
      correctCount = matches ? matches.length : 0;
      
      console.log('🔢 Counting visual emojis:', {
        visual: assessment.visual,
        visualContent,
        emojiCount: correctCount
      });
    }
    
    // Fallback: If no visual or no emojis found, check correct_answer
    if (correctCount === 0) {
      if (typeof assessment.correct_answer === 'number') {
        // Check if it's an index into options
        if (assessment.options && assessment.correct_answer < assessment.options.length) {
          const optionValue = assessment.options[assessment.correct_answer];
          correctCount = parseInt(optionValue) || assessment.correct_answer;
        } else {
          // It's the actual count
          correctCount = assessment.correct_answer;
        }
      } else if (typeof assessment.correct_answer === 'string') {
        correctCount = parseInt(assessment.correct_answer) || 0;
      }
    }
    
    console.log('🔢 Counting question:', {
      visual: assessment.visual,
      correctCount,
      originalAnswer: assessment.correct_answer
    });
    
    return {
      id: this.generateQuestionId('assessment'),
      type: 'counting',
      content: String(assessment.content || assessment.question || ''),
      topic: skillInfo.skill_name,
      subject: skillInfo.subject,
      difficulty: 'easy',
      points: 10,
      visualElements: (assessment.visual && assessment.visual !== '❓') ? {
        type: 'objects',
        description: typeof assessment.visual === 'string' 
          ? assessment.visual 
          : assessment.visual?.content || assessment.visual?.text || ''
      } : undefined,
      correctCount, // Use the determined count
      countWhat: 'items', // Default label
      minCount: 0,
      maxCount: 10,
      explanation: assessment.explanation,
      metadata: {
        bloomsLevel: 'remember',
        estimatedTime: 30
      }
    };
  }

  private toMultipleChoiceQuestion(assessment: any, skillInfo: any): MultipleChoiceQuestion {
    const options = assessment.options || [];
    
    // CRITICAL DEBUG: Log exactly what we receive
    console.log('🔍 MULTIPLE CHOICE RAW INPUT:', {
      correct_answer: assessment.correct_answer,
      correctAnswer: assessment.correctAnswer, // Check camelCase too
      correct_answer_type: typeof assessment.correct_answer,
      correctAnswer_type: typeof assessment.correctAnswer,
      options: assessment.options,
      has_correct_answer: 'correct_answer' in assessment,
      has_correctAnswer: 'correctAnswer' in assessment,
      assessment_keys: Object.keys(assessment)
    });
    
    // Handle correct_answer which can be either snake_case or camelCase
    // Check both correct_answer and correctAnswer fields
    const rawCorrectAnswer = assessment.correct_answer !== undefined 
      ? assessment.correct_answer 
      : assessment.correctAnswer;
    
    // Handle correct_answer which can be either:
    // 1. A number (index into options array)
    // 2. A string (the actual answer text)
    let correctAnswer: string;
    
    if (typeof rawCorrectAnswer === 'number') {
      // It's an index
      if (rawCorrectAnswer >= 0 && rawCorrectAnswer < options.length) {
        correctAnswer = String(options[rawCorrectAnswer]);
      } else {
        console.warn('⚠️ Invalid correct_answer index:', rawCorrectAnswer, 'for options:', options);
        correctAnswer = '';
      }
    } else {
      // It's the actual answer text
      correctAnswer = String(rawCorrectAnswer || '');
    }
    
    // Try to find the correct index
    let correctIndex = -1;
    
    if (typeof rawCorrectAnswer === 'number') {
      // We already handled this above by setting correctAnswer to the option text
      correctIndex = rawCorrectAnswer;
    } else if (correctAnswer) {
      // Find the index by matching the text
      for (let i = 0; i < options.length; i++) {
        const optionText = String(options[i]).trim();
        const answerText = correctAnswer.trim();
        
        // Try exact match first
        if (optionText === answerText) {
          correctIndex = i;
          break;
        }
        
        // Try case-insensitive match
        if (optionText.toLowerCase() === answerText.toLowerCase()) {
          correctIndex = i;
          break;
        }
      }
    }
    
    console.log('🎯 MultipleChoice conversion:', {
      options,
      correctAnswer,
      correctIndex,
      foundMatch: correctIndex !== -1,
      optionsAsStrings: options.map(o => String(o))
    });
    
    // Log warning if no correct answer found
    if (correctIndex === -1) {
      console.warn('⚠️ No matching option found for correct answer:', {
        correctAnswer,
        availableOptions: options,
        assessment
      });
    }
    
    // Handle visual field - it can be a string (emoji) or an object with content property
    let mediaObject = undefined;
    if (assessment.visual) {
      const visualContent = typeof assessment.visual === 'string' 
        ? assessment.visual 
        : assessment.visual.content || assessment.visual;
      
      console.log('🎨 Converting MultipleChoice visual:', {
        original: assessment.visual,
        extracted: visualContent,
        type: typeof assessment.visual
      });
      
      // Only add media if we have actual emoji content (not the placeholder '📝')
      if (visualContent && visualContent !== '📝') {
        mediaObject = {
          type: 'image' as const,
          url: visualContent,
          alt: 'Question visual'
        };
      }
    }
    
    return {
      id: this.generateQuestionId('assessment'),
      type: 'multiple_choice',
      content: String(assessment.content || assessment.question || ''),
      topic: skillInfo.skill_name,
      subject: skillInfo.subject,
      difficulty: 'medium',
      points: 10,
      options: options.map((opt, idx) => ({
        id: `opt-${idx}`,
        text: String(opt),
        isCorrect: idx === correctIndex
      })),
      allowMultiple: false,
      randomizeOptions: false,
      explanation: assessment.explanation,
      media: mediaObject,
      metadata: {
        bloomsLevel: 'understand',
        estimatedTime: 45
      }
    };
  }

  private toTrueFalseQuestion(assessment: any, skillInfo: any): TrueFalseQuestion {
    // Handle correct_answer which can be either snake_case or camelCase
    const rawCorrectAnswer = assessment.correct_answer !== undefined 
      ? assessment.correct_answer 
      : assessment.correctAnswer;
    
    // Handle different formats of correct answer
    let correctAnswer: boolean;
    
    console.log('🔍 TrueFalse conversion - input:', {
      correct_answer: assessment.correct_answer,
      correctAnswer: assessment.correctAnswer,
      rawCorrectAnswer: rawCorrectAnswer,
      type: typeof rawCorrectAnswer,
      options: assessment.options,
      question: assessment.question,
      visual: assessment.visual
    });
    
    if (typeof rawCorrectAnswer === 'boolean') {
      // AI now sends proper boolean values
      correctAnswer = rawCorrectAnswer;
    } else if (typeof rawCorrectAnswer === 'string') {
      // Legacy support for string formats
      const answerStr = String(rawCorrectAnswer).trim().toLowerCase();
      correctAnswer = answerStr === 'true' || answerStr === 't' || answerStr === 'yes' || answerStr === '1';
    } else if (typeof rawCorrectAnswer === 'number') {
      // If options array exists, use index
      if (assessment.options && assessment.options.length > 0) {
        const selectedOption = assessment.options[rawCorrectAnswer];
        correctAnswer = selectedOption?.toLowerCase() === 'true';
      } else {
        // 0 = true, 1 = false (common convention)
        correctAnswer = rawCorrectAnswer === 0;
      }
    } else if (rawCorrectAnswer === undefined && assessment.visual) {
      // SPECIAL CASE: If no correct_answer but has visual, try to infer from question
      const questionText = String(assessment.question || '').toLowerCase();
      const visualContent = typeof assessment.visual === 'string' 
        ? assessment.visual 
        : assessment.visual?.content || assessment.visual?.text || '';
      
      // Count emojis in visual
      const emojiCount = (visualContent.match(/[\p{Emoji}]/gu) || []).length;
      
      // Check if question mentions a number
      const numberMatch = questionText.match(/there (?:are|is) (\d+)/);
      if (numberMatch) {
        const mentionedNumber = parseInt(numberMatch[1]);
        correctAnswer = emojiCount === mentionedNumber;
        console.log('🎯 Inferred TrueFalse answer from visual count:', {
          emojiCount,
          mentionedNumber,
          correctAnswer
        });
      } else {
        // Default to false if we can't determine
        correctAnswer = false;
      }
    } else {
      // Default to false if we can't determine
      correctAnswer = false;
    }
    
    console.log('✅ TrueFalse conversion - output:', {
      correctAnswer,
      correctAnswerType: typeof correctAnswer,
      isBoolean: typeof correctAnswer === 'boolean'
    });
    
    // Ensure correctAnswer is always a boolean
    if (typeof correctAnswer !== 'boolean') {
      console.warn('⚠️ TrueFalse correctAnswer is not boolean, defaulting to false:', {
        assessment,
        correctAnswer
      });
      correctAnswer = false;
    }
    
    // Handle visual field - skip if it's the placeholder ❓
    let mediaObject = undefined;
    if (assessment.visual && assessment.visual !== '❓') {
      const visualContent = typeof assessment.visual === 'string' 
        ? assessment.visual 
        : assessment.visual.content || assessment.visual;
      
      console.log('🎨 Converting TrueFalse visual:', {
        original: assessment.visual,
        isPlaceholder: assessment.visual === '❓',
        extracted: visualContent,
        mediaObject: {
          type: 'image',
          url: visualContent,
          alt: 'Question visual'
        }
      });
      
      mediaObject = {
        type: 'image' as const,
        url: visualContent,
        alt: 'Question visual'
      };
    }
    
    // Extract the actual statement from the question
    // Remove "True or False:" prefix if present
    const fullQuestion = String(assessment.content || assessment.question || '');
    let statement = fullQuestion;
    
    // Common patterns to remove
    const prefixPatterns = [
      /^true or false:?\s*/i,
      /^t\/f:?\s*/i,
      /^is it true that:?\s*/i,
      /^is the following true:?\s*/i
    ];
    
    for (const pattern of prefixPatterns) {
      if (pattern.test(statement)) {
        statement = statement.replace(pattern, '');
        break;
      }
    }
    
    // If no pattern matched but we have "statement" field, use it
    if (statement === fullQuestion && assessment.statement) {
      statement = String(assessment.statement);
    }
    
    return {
      id: this.generateQuestionId('assessment'),
      type: 'true_false',
      content: fullQuestion,
      statement: statement.trim(),
      topic: skillInfo.skill_name,
      subject: skillInfo.subject,
      difficulty: 'easy',
      points: 5,
      correctAnswer,
      explanation: assessment.explanation,
      // Include visual as media if present
      media: mediaObject,
      metadata: {
        bloomsLevel: 'understand',
        estimatedTime: 20
      }
    };
  }

  private toFillBlankQuestion(assessment: any, skillInfo: any): FillBlankQuestion {
    // Extract all blank positions and create template
    const question = String(assessment.question || '');
    const blankMatches = question.match(/_{3,}/g);  // Note the 'g' flag for multiple matches
    
    // Handle multiple blanks
    let template = question;
    const blanks: any[] = [];
    
    if (blankMatches && blankMatches.length > 0) {
      blankMatches.forEach((match, index) => {
        const blankId = `blank_${index}`;
        // Replace each occurrence with its placeholder
        template = template.replace(match, `{{${blankId}}}`);
        
        // Handle correct answers - if array, distribute among blanks
        let correctAnswersForBlank: string[];
        if (Array.isArray(assessment.correct_answer)) {
          correctAnswersForBlank = index < assessment.correct_answer.length 
            ? [String(assessment.correct_answer[index])]
            : [String(assessment.correct_answer[0])]; // Fallback to first answer
        } else {
          correctAnswersForBlank = [String(assessment.correct_answer)];
        }
        
        blanks.push({
          id: blankId,
          position: question.indexOf(match),
          correctAnswers: correctAnswersForBlank,
          caseSensitive: false
        });
      });
    } else {
      // No blanks found, create a default template
      template = question.replace(/_{3,}/g, '{{blank_0}}');
      blanks.push({
        id: 'blank_0',
        position: 0,
        correctAnswers: Array.isArray(assessment.correct_answer) 
          ? assessment.correct_answer.map(String)
          : [String(assessment.correct_answer)],
        caseSensitive: false
      });
    }
    
    return {
      id: this.generateQuestionId('assessment'),
      type: 'fill_blank',
      content: question,
      topic: skillInfo.skill_name,
      subject: skillInfo.subject,
      difficulty: 'medium',
      points: 10,
      template,
      blanks,
      explanation: assessment.explanation,
      metadata: {
        bloomsLevel: 'apply',
        estimatedTime: 60
      }
    };
  }

  private toNumericQuestion(assessment: any, skillInfo: any): NumericQuestion {
    let correctAnswer: number;
    
    if (typeof assessment.correct_answer === 'number') {
      correctAnswer = assessment.correct_answer;
    } else {
      // Parse string to number, handling various formats
      const parsed = parseFloat(String(assessment.correct_answer).replace(/[^0-9.-]/g, ''));
      if (isNaN(parsed)) {
        console.error('⚠️ Invalid numeric answer, defaulting to 0:', {
          original: assessment.correct_answer,
          skill: skillInfo.skill_name
        });
        correctAnswer = 0;
      } else {
        correctAnswer = parsed;
      }
    }
    
    return {
      id: this.generateQuestionId('assessment'),
      type: 'numeric',
      content: String(assessment.content || assessment.question || ''),
      topic: skillInfo.skill_name,
      subject: skillInfo.subject,
      difficulty: 'medium',
      points: 10,
      correctAnswer,
      tolerance: 0.01,
      explanation: assessment.explanation,
      metadata: {
        bloomsLevel: 'apply',
        estimatedTime: 45
      }
    };
  }

  private toShortAnswerQuestion(assessment: any, skillInfo: any): ShortAnswerQuestion {
    const acceptableAnswers = Array.isArray(assessment.correct_answer) ? 
      assessment.correct_answer.map(String) : 
      [String(assessment.correct_answer)];
    
    return {
      id: this.generateQuestionId('assessment'),
      type: 'short_answer',
      content: String(assessment.content || assessment.question || ''),
      topic: skillInfo.skill_name,
      subject: skillInfo.subject,
      difficulty: 'medium',
      points: 10,
      acceptableAnswers,
      caseSensitive: false,
      maxLength: 100,
      explanation: assessment.explanation,
      metadata: {
        bloomsLevel: 'understand',
        estimatedTime: 60
      }
    };
  }
}

// Export singleton instance
export const aiContentConverter = AIContentConverter.getInstance();