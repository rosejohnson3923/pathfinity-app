/**
 * QUESTION FACTORY - TYPE-SAFE QUESTION GENERATION
 * 
 * Factory class for creating properly typed questions with:
 * - Type-safe construction methods for each question type
 * - Automatic ID generation
 * - Default value handling
 * - Validation on creation
 */

import {
  Question,
  QuestionType,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  NumericQuestion,
  ShortAnswerQuestion,
  LongAnswerQuestion,
  MatchingQuestion,
  OrderingQuestion,
  ClassificationQuestion,
  VisualIdentificationQuestion,
  CountingQuestion,
  PatternRecognitionQuestion,
  CodeCompletionQuestion,
  DiagramLabelingQuestion,
  OpenEndedQuestion,
  validateQuestion
} from './QuestionTypes';

// ================================================================
// QUESTION FACTORY CLASS
// ================================================================

export class QuestionFactory {
  private static instance: QuestionFactory;
  private questionCounter: number = 0;

  private constructor() {}

  public static getInstance(): QuestionFactory {
    if (!QuestionFactory.instance) {
      QuestionFactory.instance = new QuestionFactory();
    }
    return QuestionFactory.instance;
  }

  // ================================================================
  // ID GENERATION
  // ================================================================

  private generateId(type: QuestionType): string {
    this.questionCounter++;
    const timestamp = Date.now();
    return `${type}_${timestamp}_${this.questionCounter}`;
  }

  // ================================================================
  // GENERIC QUESTION CREATOR
  // ================================================================

  public createQuestion(type: QuestionType, params: any): Question {
    switch (type) {
      case 'multiple_choice':
        return this.createMultipleChoice(params);
      case 'true_false':
        return this.createTrueFalse(params);
      case 'fill_blank':
        return this.createFillBlank(params);
      case 'numeric':
        return this.createNumeric(params);
      case 'short_answer':
        return this.createShortAnswer(params);
      case 'long_answer':
        return this.createLongAnswer(params);
      case 'matching':
        return this.createMatching(params);
      case 'ordering':
        return this.createOrdering(params);
      case 'classification':
        return this.createClassification(params);
      case 'visual_identification':
        return this.createVisualIdentification(params);
      case 'counting':
        return this.createCounting(params);
      case 'pattern_recognition':
        return this.createPatternRecognition(params);
      case 'code_completion':
        return this.createCodeCompletion(params);
      case 'diagram_labeling':
        return this.createDiagramLabeling(params);
      case 'open_ended':
        return this.createOpenEnded(params);
      default:
        throw new Error(`Unknown question type: ${type}`);
    }
  }

  // ================================================================
  // SPECIFIC QUESTION CREATORS
  // ================================================================

  public createMultipleChoice(params: {
    content: string;
    topic: string;
    options: Array<{ text: string; isCorrect: boolean }>;
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
    allowMultiple?: boolean;
    hints?: string[];
    explanation?: string;
  }): MultipleChoiceQuestion {
    const question: MultipleChoiceQuestion = {
      id: this.generateId('multiple_choice'),
      type: 'multiple_choice',
      content: params.content,
      topic: params.topic,
      difficulty: params.difficulty || 'medium',
      points: params.points || 10,
      options: params.options.map((opt, idx) => ({
        id: `option_${idx}`,
        text: opt.text,
        isCorrect: opt.isCorrect
      })),
      allowMultiple: params.allowMultiple || false,
      randomizeOptions: true,
      hints: params.hints,
      explanation: params.explanation
    };

    if (!validateQuestion(question)) {
      throw new Error('Invalid multiple choice question');
    }

    return question;
  }

  public createTrueFalse(params: {
    content: string;
    statement: string;
    topic: string;
    correctAnswer: boolean;
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
    hints?: string[];
    explanation?: string;
  }): TrueFalseQuestion {
    const question: TrueFalseQuestion = {
      id: this.generateId('true_false'),
      type: 'true_false',
      content: params.content,
      statement: params.statement,
      topic: params.topic,
      correctAnswer: params.correctAnswer,
      difficulty: params.difficulty || 'easy',
      points: params.points || 5,
      hints: params.hints,
      explanation: params.explanation
    };

    if (!validateQuestion(question)) {
      throw new Error('Invalid true/false question');
    }

    return question;
  }

  public createFillBlank(params: {
    content: string;
    topic: string;
    template: string;
    blanks: Array<{
      position: number;
      correctAnswers: string[];
      caseSensitive?: boolean;
    }>;
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
    hints?: string[];
  }): FillBlankQuestion {
    const question: FillBlankQuestion = {
      id: this.generateId('fill_blank'),
      type: 'fill_blank',
      content: params.content,
      topic: params.topic,
      template: params.template,
      blanks: params.blanks.map((blank, idx) => ({
        id: `blank_${idx}`,
        position: blank.position,
        correctAnswers: blank.correctAnswers,
        caseSensitive: blank.caseSensitive || false
      })),
      difficulty: params.difficulty || 'medium',
      points: params.points || 10,
      hints: params.hints
    };

    if (!validateQuestion(question)) {
      throw new Error('Invalid fill blank question');
    }

    return question;
  }

  public createNumeric(params: {
    content: string;
    topic: string;
    correctAnswer: number;
    tolerance?: number;
    unit?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
    hints?: string[];
    minValue?: number;
    maxValue?: number;
  }): NumericQuestion {
    const question: NumericQuestion = {
      id: this.generateId('numeric'),
      type: 'numeric',
      content: params.content,
      topic: params.topic,
      correctAnswer: params.correctAnswer,
      tolerance: params.tolerance || 0.01,
      unit: params.unit,
      difficulty: params.difficulty || 'medium',
      points: params.points || 10,
      hints: params.hints,
      minValue: params.minValue,
      maxValue: params.maxValue
    };

    if (!validateQuestion(question)) {
      throw new Error('Invalid numeric question');
    }

    return question;
  }

  public createShortAnswer(params: {
    content: string;
    topic: string;
    acceptableAnswers: string[];
    caseSensitive?: boolean;
    maxLength?: number;
    keywords?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
  }): ShortAnswerQuestion {
    const question: ShortAnswerQuestion = {
      id: this.generateId('short_answer'),
      type: 'short_answer',
      content: params.content,
      topic: params.topic,
      acceptableAnswers: params.acceptableAnswers,
      caseSensitive: params.caseSensitive || false,
      maxLength: params.maxLength || 100,
      keywords: params.keywords,
      difficulty: params.difficulty || 'medium',
      points: params.points || 15
    };

    return question;
  }

  public createLongAnswer(params: {
    content: string;
    topic: string;
    minWords?: number;
    maxWords?: number;
    requiredElements?: string[];
    rubric?: any;
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
  }): LongAnswerQuestion {
    const question: LongAnswerQuestion = {
      id: this.generateId('long_answer'),
      type: 'long_answer',
      content: params.content,
      topic: params.topic,
      minWords: params.minWords || 50,
      maxWords: params.maxWords || 500,
      requiredElements: params.requiredElements,
      rubric: params.rubric,
      difficulty: params.difficulty || 'hard',
      points: params.points || 25
    };

    return question;
  }

  public createMatching(params: {
    content: string;
    topic: string;
    leftColumn: Array<{ text: string }>;
    rightColumn: Array<{ text: string }>;
    correctPairs: Array<{ leftIndex: number; rightIndex: number }>;
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
  }): MatchingQuestion {
    const question: MatchingQuestion = {
      id: this.generateId('matching'),
      type: 'matching',
      content: params.content,
      topic: params.topic,
      leftColumn: params.leftColumn.map((item, idx) => ({
        id: `left_${idx}`,
        text: item.text
      })),
      rightColumn: params.rightColumn.map((item, idx) => ({
        id: `right_${idx}`,
        text: item.text
      })),
      correctPairs: params.correctPairs.map(pair => ({
        leftId: `left_${pair.leftIndex}`,
        rightId: `right_${pair.rightIndex}`
      })),
      allowPartialCredit: true,
      difficulty: params.difficulty || 'medium',
      points: params.points || 20
    };

    return question;
  }

  public createOrdering(params: {
    content: string;
    topic: string;
    items: Array<{ text: string; correctPosition: number }>;
    orderType: 'sequential' | 'chronological' | 'logical' | 'custom';
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
  }): OrderingQuestion {
    const question: OrderingQuestion = {
      id: this.generateId('ordering'),
      type: 'ordering',
      content: params.content,
      topic: params.topic,
      items: params.items.map((item, idx) => ({
        id: `item_${idx}`,
        text: item.text,
        correctPosition: item.correctPosition
      })),
      orderType: params.orderType,
      allowPartialCredit: true,
      difficulty: params.difficulty || 'medium',
      points: params.points || 15
    };

    return question;
  }

  public createClassification(params: {
    content: string;
    topic: string;
    categories: Array<{ name: string; description?: string }>;
    items: Array<{ text: string; correctCategoryIndex: number }>;
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
  }): ClassificationQuestion {
    const question: ClassificationQuestion = {
      id: this.generateId('classification'),
      type: 'classification',
      content: params.content,
      topic: params.topic,
      categories: params.categories.map((cat, idx) => ({
        id: `category_${idx}`,
        name: cat.name,
        description: cat.description
      })),
      items: params.items.map((item, idx) => ({
        id: `item_${idx}`,
        text: item.text,
        correctCategoryId: `category_${item.correctCategoryIndex}`
      })),
      difficulty: params.difficulty || 'medium',
      points: params.points || 20
    };

    return question;
  }

  public createVisualIdentification(params: {
    content: string;
    topic: string;
    imageUrl: string;
    imageAlt: string;
    questionPrompt: string;
    targetAreas: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
      label: string;
      isCorrect: boolean;
    }>;
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
  }): VisualIdentificationQuestion {
    const targetAreas = params.targetAreas.map((area, idx) => ({
      id: `area_${idx}`,
      x: area.x,
      y: area.y,
      width: area.width,
      height: area.height,
      label: area.label
    }));

    const question: VisualIdentificationQuestion = {
      id: this.generateId('visual_identification'),
      type: 'visual_identification',
      content: params.content,
      topic: params.topic,
      imageUrl: params.imageUrl,
      imageAlt: params.imageAlt,
      questionPrompt: params.questionPrompt,
      targetAreas,
      correctAreaIds: targetAreas
        .filter((_, idx) => params.targetAreas[idx].isCorrect)
        .map(area => area.id),
      difficulty: params.difficulty || 'medium',
      points: params.points || 15
    };

    return question;
  }

  public createCounting(params: {
    content: string;
    topic: string;
    countWhat: string;
    correctCount: number;
    visualElements?: {
      type: 'shapes' | 'objects' | 'patterns';
      imageUrl?: string;
      description: string;
    };
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
  }): CountingQuestion {
    const question: CountingQuestion = {
      id: this.generateId('counting'),
      type: 'counting',
      content: params.content,
      topic: params.topic,
      countWhat: params.countWhat,
      correctCount: params.correctCount,
      visualElements: params.visualElements,
      difficulty: params.difficulty || 'easy',
      points: params.points || 5
    };

    if (!validateQuestion(question)) {
      throw new Error('Invalid counting question');
    }

    return question;
  }

  public createPatternRecognition(params: {
    content: string;
    topic: string;
    sequence: Array<string | number>;
    missingPosition: number;
    options: Array<string | number>;
    correctAnswer: string | number;
    patternType: 'numeric' | 'alphabetic' | 'visual' | 'logical';
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
  }): PatternRecognitionQuestion {
    const question: PatternRecognitionQuestion = {
      id: this.generateId('pattern_recognition'),
      type: 'pattern_recognition',
      content: params.content,
      topic: params.topic,
      sequence: params.sequence,
      missingPosition: params.missingPosition,
      options: params.options,
      correctAnswer: params.correctAnswer,
      patternType: params.patternType,
      difficulty: params.difficulty || 'medium',
      points: params.points || 15
    };

    return question;
  }

  public createCodeCompletion(params: {
    content: string;
    topic: string;
    language: 'javascript' | 'python' | 'html' | 'css' | 'sql' | 'pseudocode';
    codeTemplate: string;
    blanks: Array<{
      lineNumber: number;
      correctCode: string;
      alternatives?: string[];
    }>;
    executionTest?: {
      input: any;
      expectedOutput: any;
    };
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
  }): CodeCompletionQuestion {
    const question: CodeCompletionQuestion = {
      id: this.generateId('code_completion'),
      type: 'code_completion',
      content: params.content,
      topic: params.topic,
      language: params.language,
      codeTemplate: params.codeTemplate,
      blanks: params.blanks.map((blank, idx) => ({
        id: `blank_${idx}`,
        lineNumber: blank.lineNumber,
        correctCode: blank.correctCode,
        alternatives: blank.alternatives
      })),
      executionTest: params.executionTest,
      difficulty: params.difficulty || 'hard',
      points: params.points || 25
    };

    return question;
  }

  public createDiagramLabeling(params: {
    content: string;
    topic: string;
    diagramUrl: string;
    diagramAlt: string;
    labelPoints: Array<{
      x: number;
      y: number;
      correctLabel: string;
      acceptableLabels?: string[];
    }>;
    labelBank?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
  }): DiagramLabelingQuestion {
    const question: DiagramLabelingQuestion = {
      id: this.generateId('diagram_labeling'),
      type: 'diagram_labeling',
      content: params.content,
      topic: params.topic,
      diagramUrl: params.diagramUrl,
      diagramAlt: params.diagramAlt,
      labelPoints: params.labelPoints.map((point, idx) => ({
        id: `label_${idx}`,
        x: point.x,
        y: point.y,
        correctLabel: point.correctLabel,
        acceptableLabels: point.acceptableLabels
      })),
      labelBank: params.labelBank,
      difficulty: params.difficulty || 'medium',
      points: params.points || 20
    };

    return question;
  }

  public createOpenEnded(params: {
    content: string;
    topic: string;
    prompt: string;
    suggestedTopics?: string[];
    responseFormat?: 'text' | 'audio' | 'drawing' | 'mixed';
    evaluationCriteria?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
    points?: number;
  }): OpenEndedQuestion {
    const question: OpenEndedQuestion = {
      id: this.generateId('open_ended'),
      type: 'open_ended',
      content: params.content,
      topic: params.topic,
      prompt: params.prompt,
      suggestedTopics: params.suggestedTopics,
      responseFormat: params.responseFormat || 'text',
      evaluationCriteria: params.evaluationCriteria,
      difficulty: params.difficulty || 'medium',
      points: params.points || 20
    };

    return question;
  }

  // ================================================================
  // BATCH CREATION
  // ================================================================

  public createQuestionSet(
    type: QuestionType,
    count: number,
    baseParams: any
  ): Question[] {
    const questions: Question[] = [];
    
    for (let i = 0; i < count; i++) {
      // Modify params slightly for variety
      const params = {
        ...baseParams,
        content: `${baseParams.content} (Question ${i + 1})`
      };
      
      questions.push(this.createQuestion(type, params));
    }
    
    return questions;
  }

  // ================================================================
  // CONVERSION FROM LEGACY FORMAT
  // ================================================================

  public convertFromLegacy(legacyQuestion: any): Question {
    // Detect type from legacy format
    const type = this.detectLegacyType(legacyQuestion);
    
    switch (type) {
      case 'multiple_choice':
        return this.createMultipleChoice({
          content: legacyQuestion.content || legacyQuestion.question,
          topic: legacyQuestion.topic || 'General',
          options: legacyQuestion.options || legacyQuestion.answers || [],
          difficulty: legacyQuestion.difficulty,
          points: legacyQuestion.points || 10
        });
      
      case 'true_false':
        return this.createTrueFalse({
          content: legacyQuestion.content || legacyQuestion.question,
          statement: legacyQuestion.statement || legacyQuestion.content,
          topic: legacyQuestion.topic || 'General',
          correctAnswer: legacyQuestion.correct_answer === 'true' || 
                        legacyQuestion.correct_answer === true,
          difficulty: legacyQuestion.difficulty,
          points: legacyQuestion.points || 5
        });
      
      case 'numeric':
        return this.createNumeric({
          content: legacyQuestion.content || legacyQuestion.question,
          topic: legacyQuestion.topic || 'Math',
          correctAnswer: parseFloat(legacyQuestion.correct_answer),
          tolerance: legacyQuestion.tolerance,
          unit: legacyQuestion.unit,
          difficulty: legacyQuestion.difficulty,
          points: legacyQuestion.points || 10
        });
      
      case 'counting':
        return this.createCounting({
          content: legacyQuestion.content || legacyQuestion.question,
          topic: legacyQuestion.topic || 'Math',
          countWhat: legacyQuestion.count_what || 'items',
          correctCount: parseInt(legacyQuestion.correct_answer),
          difficulty: legacyQuestion.difficulty || 'easy',
          points: legacyQuestion.points || 5
        });
      
      default:
        // Fallback to open-ended
        return this.createOpenEnded({
          content: legacyQuestion.content || legacyQuestion.question,
          topic: legacyQuestion.topic || 'General',
          prompt: legacyQuestion.content || legacyQuestion.question,
          difficulty: legacyQuestion.difficulty,
          points: legacyQuestion.points || 10
        });
    }
  }

  private detectLegacyType(question: any): QuestionType {
    // Try to detect type from structure
    if (question.type) return question.type;
    
    if (question.options || question.answers) return 'multiple_choice';
    if (question.correct_answer === 'true' || question.correct_answer === 'false') return 'true_false';
    if (typeof question.correct_answer === 'number') return 'numeric';
    if (question.count_what) return 'counting';
    
    return 'open_ended';
  }
}

// ================================================================
// EXPORT SINGLETON INSTANCE
// ================================================================

export const questionFactory = QuestionFactory.getInstance();