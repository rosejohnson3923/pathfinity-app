/**
 * Fallback Content Provider
 * Provides reliable fallback content when AI generation fails
 */

import {
  Question,
  QuestionType,
  Grade,
  Subject,
  Difficulty,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  CountingQuestion,
  NumericQuestion,
  FillBlankQuestion,
  MatchingQuestion,
  OrderingQuestion,
  ShortAnswerQuestion,
  Visual,
  HintSystem
} from '../../types/questions';
import { validationService } from './ValidationService';
import { questionTypeRegistry } from './QuestionTypeRegistry';

// ============================================================================
// INTERFACES
// ============================================================================

export interface FallbackContent {
  questions: Question[];
  metadata: FallbackMetadata;
}

export interface FallbackMetadata {
  source: 'static' | 'template' | 'cached';
  quality: 'high' | 'medium' | 'low';
  coverage: number; // 0-1, how well it matches requirements
  timestamp: Date;
}

export interface FallbackRequest {
  grade: Grade;
  subject: Subject;
  skill: string;
  career: string;
  questionTypes?: QuestionType[];
  count: number;
  difficulty?: Difficulty;
}

export interface FallbackLibrary {
  [key: string]: FallbackQuestionSet;
}

export interface FallbackQuestionSet {
  grade: Grade;
  subject: Subject;
  skill: string;
  questions: Question[];
  lastUsed?: Date;
  useCount: number;
}

// ============================================================================
// FALLBACK CONTENT PROVIDER
// ============================================================================

export class FallbackContentProvider {
  private static instance: FallbackContentProvider;
  private library: Map<string, FallbackQuestionSet>;
  private cache: Map<string, FallbackContent>;

  private constructor() {
    this.library = new Map();
    this.cache = new Map();
    this.initializeFallbackLibrary();
  }

  public static getInstance(): FallbackContentProvider {
    if (!FallbackContentProvider.instance) {
      FallbackContentProvider.instance = new FallbackContentProvider();
    }
    return FallbackContentProvider.instance;
  }

  // ============================================================================
  // MAIN METHODS
  // ============================================================================

  public getFallbackContent(
    grade: Grade,
    subject: Subject,
    skill: string,
    career: string,
    count: number = 5
  ): FallbackContent {
    // Check cache first
    const cacheKey = this.generateCacheKey(grade, subject, skill, career);
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      return this.adjustContentCount(cached, count);
    }

    // Generate new fallback content
    const content = this.generateFallbackContent({
      grade,
      subject,
      skill,
      career,
      count
    });

    // Cache the result
    this.cache.set(cacheKey, content);

    return content;
  }

  public validateFallbackQuality(content: FallbackContent): boolean {
    if (!content.questions || content.questions.length === 0) {
      return false;
    }

    // Validate each question
    for (const question of content.questions) {
      const validation = validationService.validateQuestion(question, {
        grade: question.metadata.grade,
        subject: question.metadata.subject,
        difficulty: question.metadata.difficulty
      });

      if (!validation.valid) {
        return false;
      }
    }

    // Check quality threshold
    return content.metadata.quality !== 'low' && 
           content.metadata.coverage >= 0.6;
  }

  // ============================================================================
  // GENERATION METHODS
  // ============================================================================

  private generateFallbackContent(request: FallbackRequest): FallbackContent {
    const questions: Question[] = [];
    
    // Get available question types for grade/subject
    const availableTypes = questionTypeRegistry.getTypesForGradeSubject(
      request.grade,
      request.subject
    );

    // Generate distribution
    const distribution = questionTypeRegistry.calculateDistribution(
      request.grade,
      request.subject,
      request.count,
      'balanced'
    );

    // Generate questions for each type
    for (const [type, count] of Object.entries(distribution)) {
      for (let i = 0; i < count; i++) {
        const question = this.generateFallbackQuestion(
          type as QuestionType,
          request
        );
        questions.push(question);
      }
    }

    // Calculate metadata
    const metadata: FallbackMetadata = {
      source: 'template',
      quality: this.assessQuality(questions, request),
      coverage: this.calculateCoverage(questions, request),
      timestamp: new Date()
    };

    return { questions, metadata };
  }

  private generateFallbackQuestion(
    type: QuestionType,
    request: FallbackRequest
  ): Question {
    const baseQuestion = this.createBaseQuestion(type, request);

    switch (type) {
      case 'multiple_choice':
        return this.generateMultipleChoice(baseQuestion, request);
      case 'true_false':
        return this.generateTrueFalse(baseQuestion, request);
      case 'counting':
        return this.generateCounting(baseQuestion, request);
      case 'numeric':
        return this.generateNumeric(baseQuestion, request);
      case 'fill_blank':
        return this.generateFillBlank(baseQuestion, request);
      case 'matching':
        return this.generateMatching(baseQuestion, request);
      case 'ordering':
        return this.generateOrdering(baseQuestion, request);
      case 'short_answer':
        return this.generateShortAnswer(baseQuestion, request);
      default:
        return baseQuestion;
    }
  }

  // ============================================================================
  // TYPE-SPECIFIC GENERATORS
  // ============================================================================

  private generateMultipleChoice(
    base: Question,
    request: FallbackRequest
  ): MultipleChoiceQuestion {
    const question = base as MultipleChoiceQuestion;
    
    // Generate grade-appropriate content
    if (request.subject === 'Math') {
      const problems = this.getMathProblems(request.grade);
      const problem = problems[Math.floor(Math.random() * problems.length)];
      
      question.question = problem.question;
      question.options = problem.options;
      question.correctAnswer = problem.correctIndex;
      question.explanation = problem.explanation;
    } else if (request.subject === 'ELA') {
      const vocab = this.getVocabularyQuestions(request.grade);
      const item = vocab[Math.floor(Math.random() * vocab.length)];
      
      question.question = item.question;
      question.options = item.options;
      question.correctAnswer = item.correctIndex;
      question.explanation = item.explanation;
    } else {
      // Generic fallback
      question.question = `Which of the following relates to ${request.skill}?`;
      question.options = ['Option A', 'Option B', 'Option C', 'Option D'];
      question.correctAnswer = 0;
      question.explanation = 'Option A is the correct answer.';
    }

    // Add career context
    question.careerContext = request.career;
    question.realWorldConnection = `This skill is important for ${request.career}s.`;

    return question;
  }

  private generateTrueFalse(
    base: Question,
    request: FallbackRequest
  ): TrueFalseQuestion {
    const question = base as TrueFalseQuestion;
    
    const statements = this.getTrueFalseStatements(request.grade, request.subject);
    const statement = statements[Math.floor(Math.random() * statements.length)];
    
    question.question = 'True or False:';
    question.statement = statement.text;
    question.correctAnswer = statement.isTrue;
    question.explanation = statement.explanation;
    
    // Add career context
    question.careerContext = request.career;

    return question;
  }

  private generateCounting(
    base: Question,
    request: FallbackRequest
  ): CountingQuestion {
    const question = base as CountingQuestion;
    
    // Generate appropriate count for grade
    const maxCount = this.getMaxCountForGrade(request.grade);
    const count = Math.floor(Math.random() * maxCount) + 1;
    
    const items = ['stars', 'circles', 'apples', 'flowers', 'cars'];
    const item = items[Math.floor(Math.random() * items.length)];
    
    question.question = `How many ${item} do you see?`;
    question.correctAnswer = count;
    question.countableItems = item;
    
    // Generate visual
    question.visual = this.generateCountingVisual(item, count);
    
    question.explanation = `There are ${count} ${item} in the image.`;
    
    return question;
  }

  private generateNumeric(
    base: Question,
    request: FallbackRequest
  ): NumericQuestion {
    const question = base as NumericQuestion;
    
    if (request.subject === 'Math') {
      const problem = this.generateMathProblem(request.grade);
      question.question = problem.question;
      question.correctAnswer = problem.answer;
      question.explanation = problem.explanation;
      
      if (request.grade >= '6') {
        question.acceptableRange = [
          problem.answer - 0.01,
          problem.answer + 0.01
        ];
      }
    } else if (request.subject === 'Science') {
      question.question = 'What is the boiling point of water in Celsius?';
      question.correctAnswer = 100;
      question.unit = '°C';
      question.explanation = 'Water boils at 100 degrees Celsius at sea level.';
    } else {
      question.question = `Enter the number: ${Math.floor(Math.random() * 100)}`;
      question.correctAnswer = Math.floor(Math.random() * 100);
      question.explanation = 'Enter the exact number shown.';
    }
    
    return question;
  }

  private generateFillBlank(
    base: Question,
    request: FallbackRequest
  ): FillBlankQuestion {
    const question = base as FillBlankQuestion;
    
    const templates = this.getFillBlankTemplates(request.grade, request.subject);
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    question.question = 'Fill in the blank:';
    question.template = template.template;
    question.correctAnswers = template.answers;
    question.explanation = template.explanation;
    
    return question;
  }

  private generateMatching(
    base: Question,
    request: FallbackRequest
  ): MatchingQuestion {
    const question = base as MatchingQuestion;
    
    const pairs = this.getMatchingPairs(request.grade, request.subject);
    
    question.question = 'Match the items:';
    question.leftColumn = pairs.map((p, i) => ({
      id: `left_${i}`,
      text: p.left
    }));
    
    // Shuffle right column and add distractor
    const rightItems = [...pairs.map(p => p.right), 'Extra item'];
    const shuffled = rightItems.sort(() => Math.random() - 0.5);
    
    question.rightColumn = shuffled.map((text, i) => ({
      id: `right_${i}`,
      text
    }));
    
    question.correctPairs = pairs.map((p, i) => {
      const rightIndex = shuffled.indexOf(p.right);
      return [`left_${i}`, `right_${rightIndex}`] as [string, string];
    });
    
    question.explanation = 'Match each item with its corresponding pair.';
    
    return question;
  }

  private generateOrdering(
    base: Question,
    request: FallbackRequest
  ): OrderingQuestion {
    const question = base as OrderingQuestion;
    
    const sequences = this.getOrderingSequences(request.grade, request.subject);
    const sequence = sequences[Math.floor(Math.random() * sequences.length)];
    
    question.question = sequence.question;
    
    // Shuffle items
    const shuffled = [...sequence.items].sort(() => Math.random() - 0.5);
    
    question.items = shuffled.map((text, i) => ({
      id: `item_${i}`,
      text
    }));
    
    question.correctOrder = sequence.items.map(item => {
      const index = shuffled.indexOf(item);
      return `item_${index}`;
    });
    
    question.orderType = sequence.type;
    question.explanation = sequence.explanation;
    
    return question;
  }

  private generateShortAnswer(
    base: Question,
    request: FallbackRequest
  ): ShortAnswerQuestion {
    const question = base as ShortAnswerQuestion;
    
    question.question = `Explain how ${request.skill} is used in ${request.career}.`;
    question.sampleAnswer = `${request.skill} is important for ${request.career}s because it helps them perform their job effectively and solve problems.`;
    question.keyWords = [request.skill, request.career, 'important', 'helps'];
    question.minLength = 20;
    question.maxLength = 200;
    question.rubric = [
      `Mentions ${request.skill}`,
      `References ${request.career}`,
      'Provides clear explanation',
      'Uses appropriate vocabulary'
    ];
    question.explanation = 'A good answer should explain the connection between the skill and career.';
    
    return question;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private createBaseQuestion(type: QuestionType, request: FallbackRequest): Question {
    return {
      id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      question: '',
      explanation: '',
      metadata: {
        grade: request.grade,
        subject: request.subject,
        difficulty: request.difficulty || 'medium',
        estimatedTime: 30,
        skills: [request.skill],
        career: request.career
      },
      careerContext: request.career,
      skillContext: request.skill
    } as Question;
  }

  private initializeFallbackLibrary(): void {
    // Initialize with some static content for each grade/subject
    this.initializeMathContent();
    this.initializeELAContent();
    this.initializeScienceContent();
    this.initializeSocialStudiesContent();
  }

  private initializeMathContent(): void {
    // PreK-K Math
    this.library.set('math_prek_counting', {
      grade: 'PreK',
      subject: 'Math',
      skill: 'Counting',
      useCount: 0,
      questions: [
        this.createCountingQuestion('PreK', 5, 'stars'),
        this.createCountingQuestion('PreK', 3, 'circles'),
        this.createCountingQuestion('PreK', 4, 'apples')
      ]
    });

    // Grade 1-2 Math
    this.library.set('math_1_addition', {
      grade: '1',
      subject: 'Math',
      skill: 'Addition',
      useCount: 0,
      questions: [
        this.createMathMultipleChoice('1', '3 + 2 = ?', ['4', '5', '6', '7'], 1),
        this.createMathMultipleChoice('1', '5 + 4 = ?', ['8', '9', '10', '11'], 1),
        this.createMathMultipleChoice('1', '2 + 6 = ?', ['7', '8', '9', '10'], 1)
      ]
    });
  }

  private initializeELAContent(): void {
    // Grade 2-3 ELA
    this.library.set('ela_2_vocabulary', {
      grade: '2',
      subject: 'ELA',
      skill: 'Vocabulary',
      useCount: 0,
      questions: [
        this.createVocabMultipleChoice(
          '2',
          'What does "happy" mean?',
          ['Sad', 'Joyful', 'Angry', 'Tired'],
          1
        ),
        this.createVocabMultipleChoice(
          '2',
          'Which word means "big"?',
          ['Tiny', 'Small', 'Large', 'Little'],
          2
        )
      ]
    });
  }

  private initializeScienceContent(): void {
    // Grade 3-4 Science
    this.library.set('science_3_nature', {
      grade: '3',
      subject: 'Science',
      skill: 'Nature',
      useCount: 0,
      questions: [
        this.createScienceTrueFalse('3', 'Plants need water to grow.', true),
        this.createScienceTrueFalse('3', 'The sun orbits the Earth.', false),
        this.createScienceTrueFalse('3', 'Fish can breathe underwater.', true)
      ]
    });
  }

  private initializeSocialStudiesContent(): void {
    // Grade 4-5 Social Studies
    this.library.set('social_4_geography', {
      grade: '4',
      subject: 'Social Studies',
      skill: 'Geography',
      useCount: 0,
      questions: [
        this.createSocialMultipleChoice(
          '4',
          'What is the capital of the United States?',
          ['New York', 'Washington D.C.', 'Los Angeles', 'Chicago'],
          1
        )
      ]
    });
  }

  // Content generation helpers
  private createCountingQuestion(grade: Grade, count: number, items: string): CountingQuestion {
    return {
      id: `counting_${Date.now()}`,
      type: 'counting',
      question: `How many ${items} are there?`,
      correctAnswer: count,
      countableItems: items,
      visual: this.generateCountingVisual(items, count),
      explanation: `There are ${count} ${items}.`,
      metadata: {
        grade,
        subject: 'Math',
        difficulty: 'easy',
        estimatedTime: 30,
        skills: ['Counting']
      }
    } as CountingQuestion;
  }

  private createMathMultipleChoice(
    grade: Grade,
    question: string,
    options: string[],
    correctIndex: number
  ): MultipleChoiceQuestion {
    return {
      id: `mc_math_${Date.now()}`,
      type: 'multiple_choice',
      question,
      options,
      correctAnswer: correctIndex,
      explanation: `The correct answer is ${options[correctIndex]}.`,
      metadata: {
        grade,
        subject: 'Math',
        difficulty: 'medium',
        estimatedTime: 30,
        skills: ['Math']
      }
    } as MultipleChoiceQuestion;
  }

  private createVocabMultipleChoice(
    grade: Grade,
    question: string,
    options: string[],
    correctIndex: number
  ): MultipleChoiceQuestion {
    return {
      id: `mc_vocab_${Date.now()}`,
      type: 'multiple_choice',
      question,
      options,
      correctAnswer: correctIndex,
      explanation: `The correct answer is "${options[correctIndex]}".`,
      metadata: {
        grade,
        subject: 'ELA',
        difficulty: 'medium',
        estimatedTime: 30,
        skills: ['Vocabulary']
      }
    } as MultipleChoiceQuestion;
  }

  private createScienceTrueFalse(
    grade: Grade,
    statement: string,
    isTrue: boolean
  ): TrueFalseQuestion {
    return {
      id: `tf_science_${Date.now()}`,
      type: 'true_false',
      question: 'True or False:',
      statement,
      correctAnswer: isTrue,
      explanation: isTrue ? 'This statement is true.' : 'This statement is false.',
      metadata: {
        grade,
        subject: 'Science',
        difficulty: 'medium',
        estimatedTime: 20,
        skills: ['Science Facts']
      }
    } as TrueFalseQuestion;
  }

  private createSocialMultipleChoice(
    grade: Grade,
    question: string,
    options: string[],
    correctIndex: number
  ): MultipleChoiceQuestion {
    return {
      id: `mc_social_${Date.now()}`,
      type: 'multiple_choice',
      question,
      options,
      correctAnswer: correctIndex,
      explanation: `The correct answer is "${options[correctIndex]}".`,
      metadata: {
        grade,
        subject: 'Social Studies',
        difficulty: 'medium',
        estimatedTime: 30,
        skills: ['Geography']
      }
    } as MultipleChoiceQuestion;
  }

  private generateCountingVisual(item: string, count: number): Visual {
    const emojis: Record<string, string> = {
      'stars': '⭐',
      'circles': '⭕',
      'apples': '🍎',
      'flowers': '🌸',
      'cars': '🚗'
    };

    const emoji = emojis[item] || '●';

    return {
      type: 'emoji',
      content: emoji.repeat(count),
      alt: `${count} ${item}`
    };
  }

  // Grade-specific content helpers
  private getMaxCountForGrade(grade: Grade): number {
    const maxCounts: Record<Grade, number> = {
      'PreK': 5,
      'K': 10,
      '1': 15,
      '2': 20,
      '3': 25,
      '4': 30,
      '5': 50,
      '6': 100,
      '7': 100,
      '8': 100,
      '9': 100,
      '10': 100,
      '11': 100,
      '12': 100
    };
    return maxCounts[grade] || 20;
  }

  private getMathProblems(grade: Grade): any[] {
    // Returns grade-appropriate math problems
    const problems: Record<string, any[]> = {
      'PreK': [
        { question: 'What comes after 2?', options: ['1', '2', '3', '4'], correctIndex: 2, explanation: 'After 2 comes 3.' }
      ],
      'K': [
        { question: 'What is 2 + 1?', options: ['1', '2', '3', '4'], correctIndex: 2, explanation: '2 + 1 = 3' }
      ],
      '1': [
        { question: 'What is 5 + 3?', options: ['6', '7', '8', '9'], correctIndex: 2, explanation: '5 + 3 = 8' }
      ],
      '2': [
        { question: 'What is 12 + 8?', options: ['18', '19', '20', '21'], correctIndex: 2, explanation: '12 + 8 = 20' }
      ]
    };
    
    return problems[grade] || problems['1'];
  }

  private getVocabularyQuestions(grade: Grade): any[] {
    return [
      { question: 'Which word means "fast"?', options: ['Slow', 'Quick', 'Loud', 'Soft'], correctIndex: 1, explanation: '"Quick" means fast.' },
      { question: 'What is the opposite of "hot"?', options: ['Warm', 'Cool', 'Cold', 'Wet'], correctIndex: 2, explanation: 'The opposite of hot is cold.' }
    ];
  }

  private getTrueFalseStatements(grade: Grade, subject: Subject): any[] {
    const statements = {
      'Math': [
        { text: '2 + 2 = 4', isTrue: true, explanation: 'This is a basic addition fact.' },
        { text: '5 is greater than 10', isTrue: false, explanation: '5 is less than 10, not greater.' }
      ],
      'Science': [
        { text: 'Water freezes at 0°C', isTrue: true, explanation: 'Water freezes at 0 degrees Celsius.' },
        { text: 'Plants can grow without sunlight', isTrue: false, explanation: 'Plants need sunlight for photosynthesis.' }
      ],
      'ELA': [
        { text: 'A sentence always ends with a period', isTrue: false, explanation: 'Sentences can end with periods, question marks, or exclamation points.' }
      ],
      'Social Studies': [
        { text: 'There are 50 states in the USA', isTrue: true, explanation: 'The United States has 50 states.' }
      ]
    };
    
    return statements[subject] || statements['Math'];
  }

  private generateMathProblem(grade: Grade): any {
    const gradeLevel = parseInt(grade) || 1;
    const max = Math.pow(10, Math.min(gradeLevel, 3));
    const a = Math.floor(Math.random() * max);
    const b = Math.floor(Math.random() * max);
    
    return {
      question: `What is ${a} + ${b}?`,
      answer: a + b,
      explanation: `${a} + ${b} = ${a + b}`
    };
  }

  private getFillBlankTemplates(grade: Grade, subject: Subject): any[] {
    const templates = {
      'ELA': [
        { template: 'The cat {{blank}} on the mat.', answers: ['sat', 'sits'], explanation: 'The verb "sat" or "sits" completes the sentence.' },
        { template: 'I like to {{blank}} books.', answers: ['read'], explanation: '"Read" is the correct verb.' }
      ],
      'Math': [
        { template: '5 + 5 = {{blank}}', answers: ['10', 'ten'], explanation: '5 + 5 equals 10.' }
      ],
      'Science': [
        { template: 'Plants need {{blank}} to grow.', answers: ['water', 'sunlight'], explanation: 'Plants need water or sunlight to grow.' }
      ],
      'Social Studies': [
        { template: 'The president lives in the {{blank}} House.', answers: ['White'], explanation: 'The president lives in the White House.' }
      ]
    };
    
    return templates[subject] || templates['ELA'];
  }

  private getMatchingPairs(grade: Grade, subject: Subject): any[] {
    const pairs = {
      'Math': [
        { left: '2 + 2', right: '4' },
        { left: '3 + 3', right: '6' },
        { left: '4 + 4', right: '8' }
      ],
      'ELA': [
        { left: 'Cat', right: 'Meow' },
        { left: 'Dog', right: 'Bark' },
        { left: 'Bird', right: 'Chirp' }
      ],
      'Science': [
        { left: 'Sun', right: 'Star' },
        { left: 'Earth', right: 'Planet' },
        { left: 'Moon', right: 'Satellite' }
      ],
      'Social Studies': [
        { left: 'USA', right: 'Washington D.C.' },
        { left: 'France', right: 'Paris' },
        { left: 'Japan', right: 'Tokyo' }
      ]
    };
    
    return pairs[subject] || pairs['Math'];
  }

  private getOrderingSequences(grade: Grade, subject: Subject): any[] {
    const sequences = {
      'Math': [
        {
          question: 'Order these numbers from smallest to largest:',
          items: ['1', '3', '5', '7', '9'],
          type: 'sequential' as const,
          explanation: 'Numbers should be in ascending order.'
        }
      ],
      'ELA': [
        {
          question: 'Put these words in alphabetical order:',
          items: ['Apple', 'Banana', 'Cherry', 'Date'],
          type: 'sequential' as const,
          explanation: 'Words should be in alphabetical order.'
        }
      ],
      'Science': [
        {
          question: 'Order the stages of a butterfly:',
          items: ['Egg', 'Larva', 'Pupa', 'Adult'],
          type: 'sequential' as const,
          explanation: 'This is the life cycle of a butterfly.'
        }
      ],
      'Social Studies': [
        {
          question: 'Order these events chronologically:',
          items: ['Stone Age', 'Bronze Age', 'Iron Age', 'Modern Age'],
          type: 'chronological' as const,
          explanation: 'These are historical periods in order.'
        }
      ]
    };
    
    return sequences[subject] || sequences['Math'];
  }

  // Cache management
  private generateCacheKey(
    grade: Grade,
    subject: Subject,
    skill: string,
    career: string
  ): string {
    return `${grade}_${subject}_${skill}_${career}`.toLowerCase();
  }

  private isCacheValid(content: FallbackContent): boolean {
    const cacheTime = content.metadata.timestamp.getTime();
    const now = Date.now();
    const maxAge = 1000 * 60 * 60; // 1 hour
    
    return (now - cacheTime) < maxAge;
  }

  private adjustContentCount(
    content: FallbackContent,
    targetCount: number
  ): FallbackContent {
    if (content.questions.length === targetCount) {
      return content;
    }

    if (content.questions.length > targetCount) {
      // Return subset
      return {
        questions: content.questions.slice(0, targetCount),
        metadata: {
          ...content.metadata,
          coverage: content.metadata.coverage * (targetCount / content.questions.length)
        }
      };
    }

    // Need more questions - duplicate some
    const questions = [...content.questions];
    while (questions.length < targetCount) {
      const randomQ = content.questions[Math.floor(Math.random() * content.questions.length)];
      questions.push({
        ...randomQ,
        id: `${randomQ.id}_copy_${Date.now()}`
      });
    }

    return {
      questions,
      metadata: {
        ...content.metadata,
        quality: 'medium' as const, // Downgrade quality due to duplication
        coverage: content.metadata.coverage * 0.8
      }
    };
  }

  private assessQuality(
    questions: Question[],
    request: FallbackRequest
  ): 'high' | 'medium' | 'low' {
    // Check if all questions are valid
    let validCount = 0;
    for (const q of questions) {
      const validation = validationService.validateQuestion(q, {
        grade: request.grade,
        subject: request.subject,
        difficulty: request.difficulty
      });
      if (validation.valid) validCount++;
    }

    const validRatio = validCount / questions.length;
    
    if (validRatio >= 0.9) return 'high';
    if (validRatio >= 0.6) return 'medium';
    return 'low';
  }

  private calculateCoverage(
    questions: Question[],
    request: FallbackRequest
  ): number {
    let coverage = 1.0;

    // Check if we have the requested count
    if (questions.length < request.count) {
      coverage *= (questions.length / request.count);
    }

    // Check if career context is included
    const hasCareerContext = questions.every(q => q.careerContext === request.career);
    if (!hasCareerContext) {
      coverage *= 0.8;
    }

    // Check if skill is covered
    const hasSkill = questions.every(q => 
      q.metadata.skills.includes(request.skill) || q.skillContext === request.skill
    );
    if (!hasSkill) {
      coverage *= 0.7;
    }

    return Math.max(0, Math.min(1, coverage));
  }

  // ============================================================================
  // PUBLIC UTILITY METHODS
  // ============================================================================

  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheSize(): number {
    return this.cache.size;
  }

  public getLibraryStats(): {
    totalSets: number;
    totalQuestions: number;
    mostUsed: string[];
  } {
    let totalQuestions = 0;
    const usage: Array<{ key: string; count: number }> = [];

    this.library.forEach((set, key) => {
      totalQuestions += set.questions.length;
      usage.push({ key, count: set.useCount });
    });

    usage.sort((a, b) => b.count - a.count);

    return {
      totalSets: this.library.size,
      totalQuestions,
      mostUsed: usage.slice(0, 5).map(u => u.key)
    };
  }
}

// Export singleton instance and getter function
export const fallbackContentProvider = FallbackContentProvider.getInstance();
export const getFallbackContentProvider = () => FallbackContentProvider.getInstance();