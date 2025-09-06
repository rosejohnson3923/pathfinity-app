/**
 * Question Template Engine
 * Generates structured question content based on templates and context
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
import { staticDataService } from '../StaticDataService';

// ============================================================================
// INTERFACES
// ============================================================================

export interface GenerationContext {
  grade: Grade;
  subject: Subject;
  difficulty: Difficulty;
  skill: string;
  career: string;
  companion: string;
  studentName?: string;
  previousPerformance?: number; // 0-1 scale
  preferredStyle?: 'visual' | 'textual' | 'interactive';
  timeConstraint?: number; // seconds
  requireVisual?: boolean;
}

export interface QuestionTemplate {
  id: string;
  type: QuestionType;
  gradeRange: [Grade, Grade];
  subjects: Subject[];
  templateString: string;
  variables: TemplateVariable[];
  constraints: TemplateConstraints;
  examples: QuestionExample[];
}

export interface TemplateVariable {
  name: string;
  type: 'number' | 'string' | 'array' | 'object';
  generator: (context: GenerationContext) => any;
  validation?: (value: any) => boolean;
}

export interface TemplateConstraints {
  minValue?: number;
  maxValue?: number;
  wordCount?: { min: number; max: number };
  optionCount?: { min: number; max: number };
  visualRequired?: boolean;
  careerIntegration: 'required' | 'optional' | 'none';
}

export interface QuestionExample {
  context: Partial<GenerationContext>;
  output: Question;
}

export interface GenerationResult {
  question: Question;
  template: QuestionTemplate;
  confidence: number; // 0-1 scale
  fallbackUsed: boolean;
}

// ============================================================================
// TEMPLATE ENGINE
// ============================================================================

export class QuestionTemplateEngine {
  private static instance: QuestionTemplateEngine;
  private templates: Map<string, QuestionTemplate[]>;
  private visualGenerator: VisualGenerator;
  private hintGenerator: HintGenerator;
  private careerIntegrator: CareerIntegrator;

  private constructor() {
    this.templates = new Map();
    this.visualGenerator = new VisualGenerator();
    this.hintGenerator = new HintGenerator();
    this.careerIntegrator = new CareerIntegrator();
    this.initializeTemplates();
  }

  public static getInstance(): QuestionTemplateEngine {
    if (!QuestionTemplateEngine.instance) {
      QuestionTemplateEngine.instance = new QuestionTemplateEngine();
    }
    return QuestionTemplateEngine.instance;
  }

  // ============================================================================
  // TEMPLATE INITIALIZATION
  // ============================================================================

  private initializeTemplates(): void {
    // Initialize templates for each question type
    this.initializeMultipleChoiceTemplates();
    this.initializeTrueFalseTemplates();
    this.initializeCountingTemplates();
    this.initializeNumericTemplates();
    this.initializeFillBlankTemplates();
    this.initializeMatchingTemplates();
    this.initializeOrderingTemplates();
    this.initializeShortAnswerTemplates();
  }

  private initializeMultipleChoiceTemplates(): void {
    const templates: QuestionTemplate[] = [
      // Kindergarten Math template - Counting with visuals
      {
        id: 'mc-math-k-counting',
        type: 'multiple_choice',
        gradeRange: ['K', '1'],
        subjects: ['Math'],
        templateString: 'How many {{items}} do you see?',
        variables: [
          {
            name: 'items',
            type: 'string',
            generator: (ctx) => {
              // Generate varied career-specific items
              const careerItemNames: Record<string, string[]> = {
                'Athlete': ['basketballs', 'soccer balls', 'tennis balls', 'footballs', 'baseballs'],
                'Doctor': ['stethoscopes', 'medicine bottles', 'thermometers', 'bandages', 'syringes'],
                'Artist': ['paintbrushes', 'pencils', 'crayons', 'easels', 'paint tubes'],
                'Scientist': ['test tubes', 'microscopes', 'beakers', 'magnifying glasses', 'lab coats'],
                'Chef': ['pans', 'spoons', 'plates', 'knives', 'bowls'],
                'Teacher': ['books', 'pencils', 'notebooks', 'backpacks', 'rulers'],
                'Firefighter': ['fire trucks', 'hoses', 'helmets', 'ladders', 'axes']
              };
              
              const items = careerItemNames[ctx.career] || ['stars', 'circles', 'hearts'];
              const idx = ctx.questionIndex || Math.floor(Math.random() * items.length);
              return items[idx % items.length];
            }
          },
          {
            name: 'count',
            type: 'number',
            generator: (ctx) => Math.floor(Math.random() * 5) + 1
          }
        ],
        constraints: {
          optionCount: { min: 4, max: 4 },
          careerIntegration: 'required',
          visualRequired: true
        },
        examples: []
      },
      // Math template for older grades
      {
        id: 'mc-math-basic',
        type: 'multiple_choice',
        gradeRange: ['1', '5'],
        subjects: ['Math'],
        templateString: 'What is {{operation}} {{num1}} {{operator}} {{num2}}?',
        variables: [
          {
            name: 'operation',
            type: 'string',
            generator: (ctx) => ctx.difficulty === 'easy' ? '' : 'the result of'
          },
          {
            name: 'num1',
            type: 'number',
            generator: (ctx) => this.generateNumber(ctx, 'first')
          },
          {
            name: 'num2',
            type: 'number',
            generator: (ctx) => this.generateNumber(ctx, 'second')
          },
          {
            name: 'operator',
            type: 'string',
            generator: (ctx) => this.selectOperator(ctx)
          }
        ],
        constraints: {
          optionCount: { min: 3, max: 5 },
          careerIntegration: 'optional'
        },
        examples: []
      },
      // ELA template
      {
        id: 'mc-ela-vocab',
        type: 'multiple_choice',
        gradeRange: ['2', '8'],
        subjects: ['ELA'],
        templateString: 'Which word best completes the sentence: "{{sentence}}"?',
        variables: [
          {
            name: 'sentence',
            type: 'string',
            generator: (ctx) => this.generateSentenceWithBlank(ctx)
          }
        ],
        constraints: {
          optionCount: { min: 4, max: 4 },
          careerIntegration: 'optional'
        },
        examples: []
      },
      // Algebra I template for Grade 10
      {
        id: 'mc-algebra1-integers',
        type: 'multiple_choice',
        gradeRange: ['9', '12'],
        subjects: ['Algebra I', 'Math', 'Mathematics'],
        templateString: 'What is {{operation}}: {{expression}}?',
        variables: [
          {
            name: 'operation',
            type: 'string',
            generator: (ctx) => {
              const ops = ['the result of', 'the value of', 'equal to'];
              return ops[Math.floor(Math.random() * ops.length)];
            }
          },
          {
            name: 'expression',
            type: 'string',
            generator: (ctx) => {
              // Generate integer arithmetic expressions for Algebra I
              const ops = ['+', '-', '×', '÷'];
              const op = ops[Math.floor(Math.random() * ops.length)];
              const a = Math.floor(Math.random() * 20) - 10; // -10 to 9
              const b = Math.floor(Math.random() * 10) + 1;  // 1 to 10
              
              if (op === '÷') {
                // Ensure clean division
                const quotient = Math.floor(Math.random() * 10) - 5;
                const divisor = Math.floor(Math.random() * 5) + 1;
                const dividend = quotient * divisor;
                return `${dividend} ${op} ${divisor}`;
              }
              
              return `(${a}) ${op} ${b}`;
            }
          }
        ],
        constraints: {
          optionCount: { min: 4, max: 4 },
          careerIntegration: 'optional'
        },
        examples: []
      },
      // Advanced Math template for Grade 10+
      {
        id: 'mc-advanced-math',
        type: 'multiple_choice',
        gradeRange: ['9', '12'],
        subjects: ['Pre-Calculus', 'Calculus', 'Advanced Math', 'Math'],
        templateString: '{{question}}',
        variables: [
          {
            name: 'question',
            type: 'string',
            generator: (ctx) => {
              const questions = [
                'Simplify: 2x + 3x - x',
                'Factor: x² - 4',
                'Solve for x: 2x + 6 = 14',
                'Evaluate: 3² + 4²',
                'What is the slope of y = 2x + 3?'
              ];
              return questions[Math.floor(Math.random() * questions.length)];
            }
          }
        ],
        constraints: {
          optionCount: { min: 4, max: 4 },
          careerIntegration: 'optional'
        },
        examples: []
      }
    ];

    this.templates.set('multiple_choice', templates);
  }

  private initializeTrueFalseTemplates(): void {
    const templates: QuestionTemplate[] = [
      {
        id: 'tf-science-fact',
        type: 'true_false',
        gradeRange: ['K', '12'],
        subjects: ['Science'],
        templateString: '{{statement}}',
        variables: [
          {
            name: 'statement',
            type: 'string',
            generator: (ctx) => this.generateScienceStatement(ctx)
          }
        ],
        constraints: {
          careerIntegration: 'optional'
        },
        examples: []
      },
      // Math counting template for young learners
      {
        id: 'tf-math-counting',
        type: 'true_false',
        gradeRange: ['K', '2'],
        subjects: ['Math'],
        templateString: 'True or False: There are {{count}} {{items}} in the picture.',
        variables: [
          {
            name: 'count',
            type: 'number',
            generator: (ctx) => Math.floor(Math.random() * 5) + 1
          },
          {
            name: 'items',
            type: 'string',
            generator: (ctx) => {
              const career = ctx.career?.toLowerCase() || '';
              if (career === 'athlete') return 'basketballs';
              if (career === 'doctor') return 'stethoscopes';
              if (career === 'teacher') return 'books';
              if (career === 'chef') return 'pans';
              return 'items';
            }
          }
        ],
        constraints: {
          careerIntegration: 'required',
          visualRequired: true
        },
        examples: []
      },
      // Math comparison template
      {
        id: 'tf-math-comparison',
        type: 'true_false',
        gradeRange: ['K', '5'],
        subjects: ['Math'],
        templateString: 'True or False: {{num1}} is {{comparison}} {{num2}}.',
        variables: [
          {
            name: 'num1',
            type: 'number',
            generator: (ctx) => Math.floor(Math.random() * 10) + 1
          },
          {
            name: 'num2',
            type: 'number',
            generator: (ctx) => Math.floor(Math.random() * 10) + 1
          },
          {
            name: 'comparison',
            type: 'string',
            generator: (ctx) => {
              const comparisons = ['greater than', 'less than', 'equal to'];
              return comparisons[Math.floor(Math.random() * comparisons.length)];
            }
          }
        ],
        constraints: {
          careerIntegration: 'optional'
        },
        examples: []
      },
      // Algebra I true/false for Grade 10
      {
        id: 'tf-algebra1',
        type: 'true_false',
        gradeRange: ['9', '12'],
        subjects: ['Algebra I', 'Math', 'Mathematics'],
        templateString: 'True or False: {{statement}}',
        variables: [
          {
            name: 'statement',
            type: 'string',
            generator: (ctx) => {
              const statements = [
                'The sum of two negative integers is always negative.',
                'The product of two negative integers is positive.',
                'Zero is neither positive nor negative.',
                'The absolute value of -5 is 5.',
                'When dividing integers, the quotient is always an integer.',
                'The additive inverse of 7 is -7.',
                'Subtracting a negative number is the same as adding a positive number.'
              ];
              return statements[Math.floor(Math.random() * statements.length)];
            }
          }
        ],
        constraints: {
          careerIntegration: 'optional'
        },
        examples: []
      }
    ];

    this.templates.set('true_false', templates);
  }

  private initializeCountingTemplates(): void {
    const templates: QuestionTemplate[] = [
      {
        id: 'counting-basic',
        type: 'counting',
        gradeRange: ['PreK', '2'],
        subjects: ['Math'],
        templateString: 'How many {{items}} do you see?',
        variables: [
          {
            name: 'items',
            type: 'string',
            generator: (ctx) => this.generateCountableItem(ctx)
          }
        ],
        constraints: {
          minValue: 1,
          maxValue: 20,
          visualRequired: true,
          careerIntegration: 'optional'
        },
        examples: []
      }
    ];

    this.templates.set('counting', templates);
  }

  private initializeNumericTemplates(): void {
    const templates: QuestionTemplate[] = [
      {
        id: 'numeric-math-calculation',
        type: 'numeric',
        gradeRange: ['1', '12'],
        subjects: ['Math'],
        templateString: 'Calculate: {{expression}}',
        variables: [
          {
            name: 'expression',
            type: 'string',
            generator: (ctx) => this.generateMathExpression(ctx)
          }
        ],
        constraints: {
          careerIntegration: 'optional'
        },
        examples: []
      }
    ];

    this.templates.set('numeric', templates);
  }

  private initializeFillBlankTemplates(): void {
    const templates: QuestionTemplate[] = [
      {
        id: 'fillblank-ela-grammar',
        type: 'fill_blank',
        gradeRange: ['2', '12'],
        subjects: ['ELA'],
        templateString: '{{sentence_part1}} {{blank}} {{sentence_part2}}',
        variables: [
          {
            name: 'sentence_part1',
            type: 'string',
            generator: (ctx) => this.generateSentencePart(ctx, 'start')
          },
          {
            name: 'sentence_part2',
            type: 'string',
            generator: (ctx) => this.generateSentencePart(ctx, 'end')
          }
        ],
        constraints: {
          wordCount: { min: 5, max: 20 },
          careerIntegration: 'optional'
        },
        examples: []
      }
    ];

    this.templates.set('fill_blank', templates);
  }

  private initializeMatchingTemplates(): void {
    const templates: QuestionTemplate[] = [
      {
        id: 'matching-vocabulary',
        type: 'matching',
        gradeRange: ['3', '12'],
        subjects: ['ELA', 'Science', 'Social Studies'],
        templateString: 'Match the {{leftCategory}} with their {{rightCategory}}',
        variables: [
          {
            name: 'leftCategory',
            type: 'string',
            generator: (ctx) => this.generateCategory(ctx, 'left')
          },
          {
            name: 'rightCategory',
            type: 'string',
            generator: (ctx) => this.generateCategory(ctx, 'right')
          }
        ],
        constraints: {
          optionCount: { min: 3, max: 6 },
          careerIntegration: 'optional'
        },
        examples: []
      }
    ];

    this.templates.set('matching', templates);
  }

  private initializeOrderingTemplates(): void {
    const templates: QuestionTemplate[] = [
      {
        id: 'ordering-sequence',
        type: 'ordering',
        gradeRange: ['5', '12'],
        subjects: ['Math', 'ELA', 'Science', 'Social Studies'],
        templateString: 'Put these {{items}} in {{orderType}} order',
        variables: [
          {
            name: 'items',
            type: 'string',
            generator: (ctx) => this.generateOrderableItems(ctx)
          },
          {
            name: 'orderType',
            type: 'string',
            generator: (ctx) => this.selectOrderType(ctx)
          }
        ],
        constraints: {
          optionCount: { min: 3, max: 6 },
          careerIntegration: 'optional'
        },
        examples: []
      }
    ];

    this.templates.set('ordering', templates);
  }

  private initializeShortAnswerTemplates(): void {
    const templates: QuestionTemplate[] = [
      {
        id: 'shortanswer-explain',
        type: 'short_answer',
        gradeRange: ['6', '12'],
        subjects: ['Math', 'ELA', 'Science', 'Social Studies'],
        templateString: 'Explain {{concept}} in your own words',
        variables: [
          {
            name: 'concept',
            type: 'string',
            generator: (ctx) => this.generateConcept(ctx)
          }
        ],
        constraints: {
          wordCount: { min: 20, max: 100 },
          careerIntegration: 'required'
        },
        examples: []
      }
    ];

    this.templates.set('short_answer', templates);
  }

  // ============================================================================
  // MAIN GENERATION METHODS
  // ============================================================================

  public async generateQuestion(
    type: QuestionType,
    context: GenerationContext
  ): Promise<GenerationResult> {
    // Use database to get suitable question types
    const dbQuestionTypes = await staticDataService.getQuestionTypesForGrade(
      context.grade,
      context.subject
    );
    
    // Check if the requested type is suitable
    const isSuitable = dbQuestionTypes.some(qt => qt.id === type);
    if (!isSuitable) {
      console.warn(`Question type ${type} not suitable for grade ${context.grade}, subject ${context.subject}`);
    }
    
    const templates = this.templates.get(type) || [];
    const validTemplates = this.filterTemplates(templates, context);

    if (validTemplates.length === 0) {
      // Use fallback generation
      return this.generateFallbackQuestion(type, context);
    }

    // Select best template based on context
    const template = this.selectBestTemplate(validTemplates, context);
    
    // Generate question from template (this returns {question, variables})
    const result = this.generateFromTemplateWithVariables(template, context);
    const question = result.question;
    const variables = result.variables;
    
    // Add career context if required
    if (template.constraints.careerIntegration !== 'none') {
      this.careerIntegrator.integrateCareer(question, context.career);
    }

    // Add visual if required
    if (template.constraints.visualRequired || context.requireVisual) {
      // Pass variables through context for visual generation
      const visualContext = { ...context, variables };
      const visual = this.visualGenerator.generateVisual(question, visualContext);
      question.visual = visual;
      
      console.log('[TemplateEngine] Visual generated:', {
        questionType: question.type,
        hasVisual: !!visual,
        visual,
        templateId: template.id,
        requireVisual: context.requireVisual,
        visualRequired: template.constraints.visualRequired
      });
    }

    // Generate hints
    question.hintSystem = this.hintGenerator.generateHints(question, context);

    // Log the final question structure
    console.log('[TemplateEngine] Final question:', {
      type: question.type,
      hasVisual: !!question.visual,
      visual: question.visual,
      question: question.question?.substring(0, 50)
    });

    return {
      question,
      template,
      confidence: this.calculateConfidence(question, context),
      fallbackUsed: false
    };
  }

  public generateMultipleChoice(context: GenerationContext): MultipleChoiceQuestion {
    const result = this.generateQuestion('multiple_choice', context);
    return result.question as MultipleChoiceQuestion;
  }

  public generateTrueFalse(context: GenerationContext): TrueFalseQuestion {
    const result = this.generateQuestion('true_false', context);
    return result.question as TrueFalseQuestion;
  }

  public generateCounting(context: GenerationContext): CountingQuestion {
    const result = this.generateQuestion('counting', context);
    return result.question as CountingQuestion;
  }

  public generateNumeric(context: GenerationContext): NumericQuestion {
    const result = this.generateQuestion('numeric', context);
    return result.question as NumericQuestion;
  }

  public generateFillBlank(context: GenerationContext): FillBlankQuestion {
    const result = this.generateQuestion('fill_blank', context);
    return result.question as FillBlankQuestion;
  }

  public generateMatching(context: GenerationContext): MatchingQuestion {
    const result = this.generateQuestion('matching', context);
    return result.question as MatchingQuestion;
  }

  public generateOrdering(context: GenerationContext): OrderingQuestion {
    const result = this.generateQuestion('ordering', context);
    return result.question as OrderingQuestion;
  }

  public generateShortAnswer(context: GenerationContext): ShortAnswerQuestion {
    const result = this.generateQuestion('short_answer', context);
    return result.question as ShortAnswerQuestion;
  }

  // ============================================================================
  // TEMPLATE PROCESSING
  // ============================================================================

  private filterTemplates(
    templates: QuestionTemplate[],
    context: GenerationContext
  ): QuestionTemplate[] {
    console.log('[TemplateEngine] Filtering templates:', {
      templateCount: templates.length,
      contextSubject: context.subject,
      contextGrade: context.grade,
      templates: templates.map(t => ({
        id: t.id,
        subjects: t.subjects,
        gradeRange: t.gradeRange
      }))
    });
    
    return templates.filter(template => {
      // Check grade range - default to K if grade is undefined
      const grade = context.grade || 'K';
      const gradeIndex = this.getGradeIndex(grade);
      const minIndex = this.getGradeIndex(template.gradeRange[0]);
      const maxIndex = this.getGradeIndex(template.gradeRange[1]);
      
      if (gradeIndex < minIndex || gradeIndex > maxIndex) {
        console.log(`[TemplateEngine] Template ${template.id} filtered out - grade mismatch`);
        return false;
      }

      // Check subject - normalize case
      const normalizedSubject = context.subject?.toLowerCase();
      const hasSubject = template.subjects.some(s => s.toLowerCase() === normalizedSubject);
      
      if (!hasSubject) {
        console.log(`[TemplateEngine] Template ${template.id} filtered out - subject mismatch. Looking for ${context.subject}, template has ${template.subjects}`);
        return false;
      }

      console.log(`[TemplateEngine] Template ${template.id} passed filter`);
      return true;
    });
  }

  private selectBestTemplate(
    templates: QuestionTemplate[],
    context: GenerationContext
  ): QuestionTemplate {
    // Score each template based on context fit
    const scored = templates.map(template => ({
      template,
      score: this.scoreTemplate(template, context)
    }));

    // Sort by score and select best
    scored.sort((a, b) => b.score - a.score);
    return scored[0].template;
  }

  private scoreTemplate(
    template: QuestionTemplate,
    context: GenerationContext
  ): number {
    let score = 100;

    // Career integration match
    if (template.constraints.careerIntegration === 'required') {
      score += 20;
    }

    // Visual preference match
    if (context.preferredStyle === 'visual' && template.constraints.visualRequired) {
      score += 15;
    }

    // Performance-based adjustment
    if (context.previousPerformance !== undefined) {
      if (context.previousPerformance < 0.5 && context.difficulty === 'easy') {
        score += 10;
      } else if (context.previousPerformance > 0.8 && context.difficulty === 'hard') {
        score += 10;
      }
    }

    return score;
  }

  private generateFromTemplateWithVariables(
    template: QuestionTemplate,
    context: GenerationContext
  ): { question: Question; variables: Record<string, any> } {
    // Generate variable values
    const variables: Record<string, any> = {};
    template.variables.forEach(variable => {
      const value = variable.generator(context);
      if (variable.validation && !variable.validation(value)) {
        throw new Error(`Invalid value generated for ${variable.name}`);
      }
      variables[variable.name] = value;
    });

    // Replace variables in template string
    let questionText = template.templateString;
    Object.entries(variables).forEach(([name, value]) => {
      questionText = questionText.replace(`{{${name}}}`, value);
    });

    // Create base question structure
    const baseQuestion = this.createBaseQuestion(template.type, context);
    baseQuestion.question = questionText;
    baseQuestion.content = questionText;  // Also set content field for QuestionRenderer

    // Generate type-specific fields
    const question = this.addTypeSpecificFields(baseQuestion, template, context, variables);

    return { question, variables };
  }

  private generateFromTemplate(
    template: QuestionTemplate,
    context: GenerationContext
  ): Question {
    const result = this.generateFromTemplateWithVariables(template, context);
    return result.question;
  }

  private createBaseQuestion(type: QuestionType, context: GenerationContext): Question {
    const id = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      type,
      content: '',  // QuestionRenderer expects content field
      question: '',  // Keep for backward compatibility
      topic: context.skill || 'Practice',
      subject: context.subject,
      difficulty: context.difficulty || 'medium',
      points: 10,
      explanation: '',
      metadata: {
        grade: context.grade,
        subject: context.subject,
        difficulty: context.difficulty,
        estimatedTime: this.estimateTime(type, context),
        skills: [context.skill],
        career: context.career,
        companion: context.companion
      }
    } as Question;
  }

  private addTypeSpecificFields(
    baseQuestion: Question,
    template: QuestionTemplate,
    context: GenerationContext,
    variables: Record<string, any>
  ): Question {
    switch (baseQuestion.type) {
      case 'multiple_choice':
        return this.completeMultipleChoice(baseQuestion, context, variables);
      case 'true_false':
        return this.completeTrueFalse(baseQuestion, context, variables);
      case 'counting':
        return this.completeCounting(baseQuestion, context, variables);
      case 'numeric':
        return this.completeNumeric(baseQuestion, context, variables);
      case 'fill_blank':
        return this.completeFillBlank(baseQuestion, context, variables);
      case 'matching':
        return this.completeMatching(baseQuestion, context, variables);
      case 'ordering':
        return this.completeOrdering(baseQuestion, context, variables);
      case 'short_answer':
        return this.completeShortAnswer(baseQuestion, context, variables);
      default:
        return baseQuestion;
    }
  }

  // ============================================================================
  // TYPE-SPECIFIC COMPLETION
  // ============================================================================

  private completeMultipleChoice(
    base: Question,
    context: GenerationContext,
    variables: Record<string, any>
  ): MultipleChoiceQuestion {
    const question = base as MultipleChoiceQuestion;
    
    // Special handling for kindergarten counting questions
    if (variables.count !== undefined && variables.items !== undefined) {
      const correctCount = variables.count;
      
      // Generate options around the correct count
      const options: string[] = [];
      const usedNumbers = new Set<number>();
      
      // ALWAYS add the correct answer first
      options.push(correctCount.toString());
      usedNumbers.add(correctCount);
      
      // Add distractors - make sure we have reasonable options
      // For kindergarten counting, include numbers close to the correct answer
      const distractors: number[] = [];
      
      // Add numbers around the correct answer
      if (correctCount > 1) distractors.push(correctCount - 1);
      if (correctCount > 2) distractors.push(correctCount - 2);
      distractors.push(correctCount + 1);
      distractors.push(correctCount + 2);
      
      // Add distractors until we have 4 options total
      for (const distractor of distractors) {
        if (options.length >= 4) break;
        if (distractor >= 1 && distractor <= 10 && !usedNumbers.has(distractor)) {
          options.push(distractor.toString());
          usedNumbers.add(distractor);
        }
      }
      
      // If still need more options, add sequential numbers
      for (let i = 1; i <= 10 && options.length < 4; i++) {
        if (!usedNumbers.has(i)) {
          options.push(i.toString());
          usedNumbers.add(i);
        }
      }
      
      // If we couldn't generate enough unique options, add sequential numbers
      while (options.length < 4) {
        for (let i = 1; i <= 10 && options.length < 4; i++) {
          if (!usedNumbers.has(i)) {
            options.push(i.toString());
            usedNumbers.add(i);
          }
        }
      }
      
      // Shuffle options
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      
      question.options = options;
      question.correct_answer = correctCount.toString(); // Use the actual value, not index
      question.correctAnswer = correctCount.toString(); // Support both formats
      question.explanation = `There are ${correctCount} ${variables.items} in the picture.`;
    } else {
      // Regular multiple choice handling
      const correctAnswer = this.calculateCorrectAnswer(variables);
      const options = this.generateOptions(correctAnswer, context);
      
      question.options = options;
      question.correct_answer = correctAnswer; // Use the actual value
      question.correctAnswer = correctAnswer; // Support both formats
      question.explanation = this.generateExplanation(context, correctAnswer);
    }
    
    return question;
  }

  private completeTrueFalse(
    base: Question,
    context: GenerationContext,
    variables: Record<string, any>
  ): TrueFalseQuestion {
    const question = base as TrueFalseQuestion;
    
    question.statement = variables.statement || question.question;
    
    // For counting true/false questions, determine truth based on visual
    if (variables.count !== undefined && variables.items !== undefined) {
      // Generate a visual with the actual count (may be different from stated count)
      let actualCount = Math.random() > 0.5 ? variables.count : 
                          variables.count + (Math.random() > 0.5 ? 1 : -1);
      actualCount = Math.max(1, Math.min(5, actualCount)); // Keep between 1-5
      
      // Set correctAnswer based on whether statement matches actual count
      question.correctAnswer = actualCount === variables.count;
      
      // Store the actual count for visual generation
      variables.actualCount = actualCount;
      variables.visualCount = actualCount;
    } else if (variables.num1 !== undefined && variables.comparison !== undefined) {
      // For comparison questions
      const num1 = variables.num1;
      const num2 = variables.num2;
      const comparison = variables.comparison;
      
      if (comparison === 'greater than') {
        question.correctAnswer = num1 > num2;
      } else if (comparison === 'less than') {
        question.correctAnswer = num1 < num2;
      } else if (comparison === 'equal to') {
        question.correctAnswer = num1 === num2;
      }
    } else {
      question.correctAnswer = this.determineStatementTruth(variables.statement, context);
    }
    
    question.explanation = this.generateTrueFalseExplanation(context, question.correctAnswer);
    
    return question;
  }

  private completeCounting(
    base: Question,
    context: GenerationContext,
    variables: Record<string, any>
  ): CountingQuestion {
    const question = base as CountingQuestion;
    
    const count = this.generateCountValue(context);
    question.correctAnswer = count;
    question.countableItems = variables.items;
    
    // Always generate visual for counting
    question.visual = this.visualGenerator.generateCountingVisual(
      variables.items,
      count,
      context
    );
    
    question.explanation = `There are ${count} ${variables.items} in the image.`;
    
    return question;
  }

  private completeNumeric(
    base: Question,
    context: GenerationContext,
    variables: Record<string, any>
  ): NumericQuestion {
    const question = base as NumericQuestion;
    
    question.correctAnswer = this.evaluateExpression(variables.expression);
    
    // Add unit for science questions
    if (context.subject === 'Science') {
      question.unit = this.selectUnit(context, variables);
    }
    
    // Set acceptable range for higher grades
    if (['6', '7', '8', '9', '10', '11', '12'].includes(context.grade)) {
      const tolerance = question.correctAnswer * 0.01; // 1% tolerance
      question.acceptableRange = [
        question.correctAnswer - tolerance,
        question.correctAnswer + tolerance
      ];
    }
    
    question.explanation = this.generateNumericExplanation(context, question.correctAnswer);
    
    return question;
  }

  private completeFillBlank(
    base: Question,
    context: GenerationContext,
    variables: Record<string, any>
  ): FillBlankQuestion {
    const question = base as FillBlankQuestion;
    
    question.template = `${variables.sentence_part1} {{blank}} ${variables.sentence_part2}`;
    question.correctAnswers = this.generateAcceptableAnswers(context, variables);
    question.explanation = this.generateFillBlankExplanation(context, question.correctAnswers[0]);
    
    return question;
  }

  private completeMatching(
    base: Question,
    context: GenerationContext,
    variables: Record<string, any>
  ): MatchingQuestion {
    const question = base as MatchingQuestion;
    
    const pairs = this.generateMatchingPairs(context, variables);
    
    question.leftColumn = pairs.map(p => ({
      id: `left_${p.leftId}`,
      text: p.leftText
    }));
    
    question.rightColumn = pairs.map(p => ({
      id: `right_${p.rightId}`,
      text: p.rightText
    }));
    
    // Add distractor
    question.rightColumn.push({
      id: `right_distractor`,
      text: this.generateDistractor(context)
    });
    
    question.correctPairs = pairs.map(p => [
      `left_${p.leftId}`,
      `right_${p.rightId}`
    ]);
    
    question.explanation = 'Match each item with its corresponding pair.';
    
    return question;
  }

  private completeOrdering(
    base: Question,
    context: GenerationContext,
    variables: Record<string, any>
  ): OrderingQuestion {
    const question = base as OrderingQuestion;
    
    const items = this.generateOrderableItemsList(context, variables);
    
    question.items = items.map((item, index) => ({
      id: `item_${index}`,
      text: item.text
    }));
    
    question.correctOrder = items
      .sort((a, b) => a.order - b.order)
      .map((item, index) => `item_${items.indexOf(item)}`);
    
    question.orderType = variables.orderType;
    question.explanation = this.generateOrderingExplanation(context, question.orderType);
    
    return question;
  }

  private completeShortAnswer(
    base: Question,
    context: GenerationContext,
    variables: Record<string, any>
  ): ShortAnswerQuestion {
    const question = base as ShortAnswerQuestion;
    
    question.sampleAnswer = this.generateSampleAnswer(context, variables);
    question.keyWords = this.extractKeywords(question.sampleAnswer, context);
    question.minLength = 20;
    question.maxLength = 200;
    
    question.rubric = [
      `Mentions ${variables.concept}`,
      'Provides clear explanation',
      'Uses appropriate vocabulary',
      `Relates to ${context.career} when applicable`
    ];
    
    question.explanation = 'Your answer should explain the concept clearly and concisely.';
    
    return question;
  }

  // ============================================================================
  // FALLBACK GENERATION
  // ============================================================================

  private generateFallbackQuestion(
    type: QuestionType,
    context: GenerationContext
  ): GenerationResult {
    // Generate a simple, safe question based on type
    const question = this.createBaseQuestion(type, context);
    
    switch (type) {
      case 'multiple_choice':
        return this.generateFallbackMultipleChoice(question as MultipleChoiceQuestion, context);
      case 'true_false':
        return this.generateFallbackTrueFalse(question as TrueFalseQuestion, context);
      default:
        // For other types, create minimal valid question
        question.question = `Practice question for ${context.skill}`;
        question.explanation = 'This is a practice question.';
        
        return {
          question,
          template: this.createFallbackTemplate(type),
          confidence: 0.5,
          fallbackUsed: true
        };
    }
  }

  private generateFallbackMultipleChoice(
    question: MultipleChoiceQuestion,
    context: GenerationContext
  ): GenerationResult {
    // Generate simple math or vocabulary question
    if (context.subject === 'Math') {
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      const answer = num1 + num2;
      
      question.question = `What is ${num1} + ${num2}?`;
      question.content = question.question;  // Set content for QuestionRenderer
      const answerStr = answer.toString();
      question.options = [
        answerStr,
        (answer - 1).toString(),
        (answer + 1).toString(),
        (answer + 2).toString()
      ];
      question.correctAnswer = answerStr;  // Use the actual answer string, not index
      question.correct_answer = answerStr;  // Support both formats
      question.explanation = `${num1} + ${num2} = ${answer}`;
    } else {
      question.question = 'Which word means "happy"?';
      question.content = question.question;  // Set content for QuestionRenderer
      question.options = ['Joyful', 'Sad', 'Angry', 'Tired'];
      question.correctAnswer = 'Joyful';  // Use the actual answer string, not index
      question.correct_answer = 'Joyful';  // Support both formats
      question.explanation = 'Joyful means feeling happy or pleased.';
    }
    
    return {
      question,
      template: this.createFallbackTemplate('multiple_choice'),
      confidence: 0.6,
      fallbackUsed: true
    };
  }

  private generateFallbackTrueFalse(
    question: TrueFalseQuestion,
    context: GenerationContext
  ): GenerationResult {
    // Generate simple factual statement
    const facts = [
      { statement: 'The sun rises in the east.', answer: true },
      { statement: 'Water freezes at 100 degrees Celsius.', answer: false },
      { statement: 'There are 7 days in a week.', answer: true }
    ];
    
    const fact = facts[Math.floor(Math.random() * facts.length)];
    
    question.question = 'True or False:';
    question.content = `True or False: ${fact.statement}`;  // Set content for QuestionRenderer
    question.statement = fact.statement;
    question.correctAnswer = fact.answer;
    question.explanation = fact.answer ? 
      'This statement is correct.' : 
      'This statement is incorrect.';
    
    return {
      question,
      template: this.createFallbackTemplate('true_false'),
      confidence: 0.7,
      fallbackUsed: true
    };
  }

  private createFallbackTemplate(type: QuestionType): QuestionTemplate {
    return {
      id: `fallback-${type}`,
      type,
      gradeRange: ['PreK', '12'],
      subjects: ['Math', 'ELA', 'Science', 'Social Studies'],
      templateString: 'Fallback question',
      variables: [],
      constraints: {
        careerIntegration: 'none'
      },
      examples: []
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getGradeIndex(grade: Grade): number {
    const grades: Grade[] = ['PreK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    return grades.indexOf(grade);
  }

  private estimateTime(type: QuestionType, context: GenerationContext): number {
    const baseTime: Record<QuestionType, number> = {
      'multiple_choice': 30,
      'true_false': 20,
      'counting': 40,
      'numeric': 35,
      'fill_blank': 45,
      'matching': 60,
      'ordering': 50,
      'short_answer': 90
    };

    let time = baseTime[type] || 30;

    // Adjust for difficulty
    if (context.difficulty === 'easy') time *= 0.8;
    if (context.difficulty === 'hard') time *= 1.3;
    if (context.difficulty === 'advanced') time *= 1.5;

    // Adjust for grade
    const gradeIndex = this.getGradeIndex(context.grade);
    if (gradeIndex <= 2) time *= 1.2; // PreK-1 need more time
    if (gradeIndex >= 9) time *= 0.9; // High school can work faster

    return Math.round(time);
  }

  private calculateConfidence(question: Question, context: GenerationContext): number {
    let confidence = 0.8;

    // Check if all required fields are present
    if (question.question && question.explanation) confidence += 0.1;
    if (question.metadata.skills.length > 0) confidence += 0.05;
    if (question.careerContext) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  // Placeholder methods for variable generation
  private generateNumber(context: GenerationContext, position: string): number {
    const max = context.grade === 'PreK' ? 5 : 
                context.grade === 'K' ? 10 :
                context.grade === '1' ? 20 :
                context.grade === '2' ? 100 : 1000;
    return Math.floor(Math.random() * max) + 1;
  }

  private selectOperator(context: GenerationContext): string {
    if (['PreK', 'K', '1', '2'].includes(context.grade)) return '+';
    if (['3', '4', '5'].includes(context.grade)) return Math.random() > 0.5 ? '+' : '-';
    return ['+', '-', '×', '÷'][Math.floor(Math.random() * 4)];
  }

  private generateSentenceWithBlank(context: GenerationContext): string {
    return 'The cat ___ on the mat';
  }

  private generateScienceStatement(context: GenerationContext): string {
    return 'Plants need sunlight to grow';
  }

  private generateCountableItem(context: GenerationContext): string {
    const items = ['apples', 'stars', 'flowers', 'cars', 'birds'];
    return items[Math.floor(Math.random() * items.length)];
  }

  private generateMathExpression(context: GenerationContext): string {
    const num1 = this.generateNumber(context, 'first');
    const num2 = this.generateNumber(context, 'second');
    const operator = this.selectOperator(context);
    return `${num1} ${operator} ${num2}`;
  }

  private generateSentencePart(context: GenerationContext, position: string): string {
    return position === 'start' ? 'The student' : 'to school';
  }

  private generateCategory(context: GenerationContext, side: string): string {
    return side === 'left' ? 'words' : 'definitions';
  }

  private generateOrderableItems(context: GenerationContext): string {
    return 'steps';
  }

  private selectOrderType(context: GenerationContext): string {
    return 'sequential';
  }

  private generateConcept(context: GenerationContext): string {
    return `how ${context.skill} relates to ${context.career}`;
  }

  private calculateCorrectAnswer(variables: Record<string, any>): string {
    // Handle expression-based calculations for Algebra I
    if (variables.expression) {
      const expr = variables.expression;
      
      // Parse expressions like "(-5) + 3" or "12 ÷ 4"
      const match = expr.match(/\(?([-\d]+)\)?\s*([+\-×÷])\s*(\d+)/);
      if (match) {
        const num1 = parseInt(match[1]);
        const op = match[2];
        const num2 = parseInt(match[3]);
        
        let result = 0;
        switch (op) {
          case '+': result = num1 + num2; break;
          case '-': result = num1 - num2; break;
          case '×': result = num1 * num2; break;
          case '÷': result = Math.round(num1 / num2); break;
        }
        return result.toString();
      }
    }
    
    // Handle pre-defined questions for advanced math
    if (variables.question) {
      const questionAnswers: Record<string, string> = {
        'Simplify: 2x + 3x - x': '4x',
        'Factor: x² - 4': '(x+2)(x-2)',
        'Solve for x: 2x + 6 = 14': '4',
        'Evaluate: 3² + 4²': '25',
        'What is the slope of y = 2x + 3?': '2'
      };
      return questionAnswers[variables.question] || 'Unknown';
    }
    
    // Simple calculation for basic math
    if (variables.num1 && variables.num2 && variables.operator) {
      const num1 = variables.num1;
      const num2 = variables.num2;
      let result = 0;
      
      switch (variables.operator) {
        case '+': result = num1 + num2; break;
        case '-': result = num1 - num2; break;
        case '×': result = num1 * num2; break;
        case '÷': result = Math.round(num1 / num2); break;
      }
      
      return result.toString();
    }
    
    // For non-math questions (like ELA), return a word answer
    // This will be overridden by specific templates
    return 'Correct';
  }

  private generateOptions(correctAnswer: string, context: GenerationContext): string[] {
    const options = [correctAnswer];
    const correctNum = parseInt(correctAnswer);
    
    if (!isNaN(correctNum)) {
      // Generate numeric distractors for integer math
      const distractors = new Set<string>();
      distractors.add(correctAnswer);
      
      // For negative numbers or larger ranges (Algebra I)
      if (correctNum < 0 || Math.abs(correctNum) > 10) {
        // Add distractors that are common mistakes
        distractors.add((correctNum + 1).toString());
        distractors.add((correctNum - 1).toString());
        distractors.add((-correctNum).toString()); // Sign error
        
        // Fill remaining with nearby values
        while (distractors.size < 4) {
          const offset = Math.floor(Math.random() * 10) - 5;
          distractors.add((correctNum + offset).toString());
        }
      } else {
        // Original logic for small positive numbers
        distractors.add((correctNum - 1).toString());
        distractors.add((correctNum + 1).toString());
        distractors.add((correctNum + 2).toString());
      }
      
      return Array.from(distractors).slice(0, 4);
    } else if (correctAnswer.includes('x') || correctAnswer.includes('(')) {
      // Algebraic expressions
      const algebraOptions: Record<string, string[]> = {
        '4x': ['4x', '3x', '5x', '4'],
        '(x+2)(x-2)': ['(x+2)(x-2)', '(x-2)²', 'x²-4', '(x+4)(x-4)'],
        '4': ['4', '3', '5', '7'],
        '25': ['25', '24', '26', '7'],
        '2': ['2', '3', '1', '0']
      };
      return algebraOptions[correctAnswer] || [correctAnswer, 'Option A', 'Option B', 'Option C'];
    } else {
      // Generate text distractors based on subject
      if (context.subject?.toLowerCase() === 'ela') {
        // ELA-specific word options
        if (correctAnswer === 'Correct' || correctAnswer === 'Joyful') {
          return ['Joyful', 'Sad', 'Angry', 'Tired'];
        } else {
          // Generic ELA options
          return ['Happy', 'Sad', 'Excited', 'Calm'];
        }
      } else {
        // Generic text options
        options.push('Incorrect', 'Maybe', 'Sometimes');
      }
    }
    
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  }

  private generateExplanation(context: GenerationContext, answer: string): string {
    return `The correct answer is ${answer} because it satisfies the given conditions.`;
  }

  private determineStatementTruth(statement: string, context: GenerationContext): boolean {
    // Handle Algebra I statements with known truth values
    const algebraStatements: Record<string, boolean> = {
      'The sum of two negative integers is always negative.': true,
      'The product of two negative integers is positive.': true,
      'Zero is neither positive nor negative.': true,
      'The absolute value of -5 is 5.': true,
      'When dividing integers, the quotient is always an integer.': false,
      'The additive inverse of 7 is -7.': true,
      'Subtracting a negative number is the same as adding a positive number.': true
    };
    
    if (statement in algebraStatements) {
      return algebraStatements[statement];
    }
    
    // Simple logic for other statements
    return Math.random() > 0.5;
  }

  private generateTrueFalseExplanation(context: GenerationContext, isTrue: boolean): string {
    return isTrue ? 
      'This statement is true based on scientific facts.' :
      'This statement is false. The correct information is...';
  }

  private generateCountValue(context: GenerationContext): number {
    const max = context.grade === 'PreK' ? 5 :
                context.grade === 'K' ? 10 :
                context.grade === '1' ? 15 : 20;
    return Math.floor(Math.random() * max) + 1;
  }

  private evaluateExpression(expression: string): number {
    // Safe evaluation for simple math expressions
    try {
      // Remove any non-numeric/operator characters
      const safe = expression.replace(/[^0-9+\-*/().\s]/g, '');
      // Use Function constructor for safe evaluation
      return Function('"use strict"; return (' + safe + ')')();
    } catch {
      return 0;
    }
  }

  private selectUnit(context: GenerationContext, variables: Record<string, any>): string {
    const units = ['meters', 'seconds', 'grams', 'degrees'];
    return units[Math.floor(Math.random() * units.length)];
  }

  private generateNumericExplanation(context: GenerationContext, answer: number): string {
    return `The calculation yields ${answer}.`;
  }

  private generateAcceptableAnswers(context: GenerationContext, variables: Record<string, any>): string[] {
    const base = 'went';
    return [base, 'goes', 'walked'];
  }

  private generateFillBlankExplanation(context: GenerationContext, answer: string): string {
    return `The word "${answer}" correctly completes the sentence.`;
  }

  private generateMatchingPairs(context: GenerationContext, variables: Record<string, any>): any[] {
    return [
      { leftId: 0, leftText: 'Item 1', rightId: 0, rightText: 'Match 1' },
      { leftId: 1, leftText: 'Item 2', rightId: 1, rightText: 'Match 2' },
      { leftId: 2, leftText: 'Item 3', rightId: 2, rightText: 'Match 3' }
    ];
  }

  private generateDistractor(context: GenerationContext): string {
    return 'Distractor item';
  }

  private generateOrderableItemsList(context: GenerationContext, variables: Record<string, any>): any[] {
    return [
      { text: 'First step', order: 1 },
      { text: 'Second step', order: 2 },
      { text: 'Third step', order: 3 }
    ];
  }

  private generateOrderingExplanation(context: GenerationContext, orderType: string): string {
    return `The items should be arranged in ${orderType} order.`;
  }

  private generateSampleAnswer(context: GenerationContext, variables: Record<string, any>): string {
    return `The concept of ${variables.concept} is important because...`;
  }

  private extractKeywords(text: string, context: GenerationContext): string[] {
    // Simple keyword extraction
    return ['concept', 'important', 'because'];
  }
}

// ============================================================================
// SUPPORTING CLASSES
// ============================================================================

class VisualGenerator {
  public generateVisual(question: Question, context: GenerationContext): Visual {
    // Generate career-appropriate visuals based on context
    const career = context.career?.toLowerCase() || '';
    const questionType = question.type;
    
    // Check if we have variables passed through context (for counting visuals)
    const variables = (context as any).variables;
    
    // Check if this is a counting-related question (by content or variables)
    const isCountingQuestion = (question.content && question.content.toLowerCase().includes('how many')) ||
                              (question.question && question.question.toLowerCase().includes('how many')) ||
                              (variables?.visualCount !== undefined && variables?.items !== undefined);
    
    // For multiple choice counting questions with career context
    if (questionType === 'multiple_choice' && isCountingQuestion && career) {
      const careerVisuals: Record<string, string> = {
        'athlete': '🏀',
        'doctor': '🩺',
        'teacher': '📚',
        'chef': '🍳'
      };
      
      const emoji = careerVisuals[career] || '🔴';
      const count = variables?.visualCount || Math.floor(Math.random() * 5) + 1; // Default 1-5 items
      
      return {
        type: 'emoji',
        content: Array(count).fill(emoji).join(' '),
        alt: `${count} ${variables?.items || 'items'}`
      };
    }
    
    // For true/false questions with career context, use appropriate emojis
    if (questionType === 'true_false' && career) {
      // If this is a counting true/false, use the actual count from variables
      if (variables?.visualCount !== undefined && variables?.items !== undefined) {
        const careerVisuals: Record<string, string> = {
          'athlete': '🏀',
          'doctor': '🩺',
          'teacher': '📚',
          'chef': '🍳'
        };
        
        const emoji = careerVisuals[career] || '🔴';
        const count = variables.visualCount;
        
        return {
          type: 'emoji',
          content: Array(count).fill(emoji).join(' '),
          alt: `${count} ${variables.items}`
        };
      }
      return this.generateCareerVisual(career, questionType, context);
    }
    
    // For counting questions, generate appropriate items
    if (questionType === 'counting') {
      return this.generateCountingVisualForCareer(career, context);
    }
    
    return {
      type: 'emoji',
      content: this.selectEmoji(question.type),
      alt: 'Visual representation'
    };
  }
  
  private generateCareerVisual(career: string, type: QuestionType, context: GenerationContext): Visual {
    // Generate career-specific visuals
    const careerVisuals: Record<string, string[]> = {
      'athlete': ['🏀', '⚽', '🎾', '🏈', '⚾', '🏐', '🥅', '🏆'],
      'doctor': ['🩺', '💊', '🌡️', '🩹', '💉', '🏥'],
      'teacher': ['📚', '✏️', '📝', '🎒', '📐', '🌍'],
      'chef': ['🍳', '🥘', '🍽️', '🥄', '👨‍🍳', '🔪']
    };
    
    const visuals = careerVisuals[career] || ['❓'];
    const selectedVisual = visuals[Math.floor(Math.random() * visuals.length)];
    
    // For true/false questions about counting, show multiple items
    if (type === 'true_false' && context.requireVisual) {
      const count = Math.floor(Math.random() * 3) + 1; // 1-3 items
      return {
        type: 'emoji',
        content: selectedVisual.repeat(count),
        alt: `${count} items for ${career}`
      };
    }
    
    return {
      type: 'emoji',
      content: selectedVisual,
      alt: `Visual for ${career}`
    };
  }
  
  private generateCountingVisualForCareer(career: string, context: GenerationContext): Visual {
    // Variety of items for each career to prevent repetition
    const careerItemSets: Record<string, string[]> = {
      'athlete': ['🏀', '⚽', '🎾', '🏈', '⚾', '🏐', '🥅', '🏆'],
      'doctor': ['🩺', '💊', '🌡️', '🩹', '💉', '🔬', '🏥', '👨‍⚕️'],
      'teacher': ['📚', '✏️', '📝', '🎒', '📐', '🌍', '📖', '🖍️'],
      'chef': ['🍳', '🥘', '🍽️', '🥄', '🔪', '👨‍🍳', '🍴', '🥗'],
      'firefighter': ['🚒', '🔥', '🧯', '👨‍🚒', '🚨', '⛑️', '💧', '🪜'],
      'police': ['🚔', '👮', '🚨', '📻', '🛡️', '⚖️', '🔦', '📡'],
      'artist': ['🎨', '🖌️', '✏️', '🖍️', '📐', '🎭', '🖼️', '🎪']
    };
    
    // Get items for this career or use default
    const items = careerItemSets[career.toLowerCase()] || ['⭐', '🔷', '🔶', '❤️', '💚'];
    
    // Use question index or random to select different items each time
    const questionIndex = context.questionIndex || Math.floor(Math.random() * 100);
    const emoji = items[questionIndex % items.length];
    const count = Math.floor(Math.random() * 5) + 1; // 1-5 items
    
    return {
      type: 'emoji',
      content: emoji + ' '.repeat(count > 1 ? 1 : 0) + emoji.repeat(count - 1),
      alt: `${count} items for counting`
    };
  }

  public generateCountingVisual(
    items: string,
    count: number,
    context: GenerationContext
  ): Visual {
    const emoji = this.getEmojiForItem(items, context);
    return {
      type: 'emoji',
      content: emoji.repeat(count),
      alt: `${count} ${items}`
    };
  }

  private selectEmoji(type: QuestionType): string {
    const emojis: Record<QuestionType, string> = {
      'multiple_choice': '📝',
      'true_false': '✓✗',
      'counting': '🔢',
      'numeric': '🔢',
      'fill_blank': '📝',
      'matching': '🔗',
      'ordering': '📊',
      'short_answer': '✍️'
    };
    return emojis[type] || '❓';
  }

  private getEmojiForItem(item: string, context?: GenerationContext): string {
    // Check career context first
    if (context?.career) {
      const career = context.career.toLowerCase();
      if (career === 'athlete' && item.includes('ball')) return '🏀';
      if (career === 'doctor' && item.includes('tool')) return '🩺';
    }
    
    const itemEmojis: Record<string, string> = {
      'basketballs': '🏀',
      'soccer balls': '⚽',
      'apples': '🍎',
      'stars': '⭐',
      'flowers': '🌸',
      'cars': '🚗',
      'birds': '🐦'
    };
    return itemEmojis[item] || '●';
  }
}

class HintGenerator {
  public generateHints(question: Question, context: GenerationContext): HintSystem {
    const hints = this.createProgressiveHints(question, context);
    
    return {
      progressive: hints,
      cost: this.calculateHintCosts(hints.length),
      customized: true
    };
  }

  private createProgressiveHints(question: Question, context: GenerationContext): string[] {
    const hints: string[] = [];
    
    // Level 1: General encouragement
    hints.push(`Think about what you know about ${context.skill}.`);
    
    // Level 2: Type-specific hint
    hints.push(this.getTypeSpecificHint(question));
    
    // Level 3: More specific guidance
    if (question.type === 'multiple_choice') {
      hints.push('Try eliminating obviously wrong answers first.');
    } else {
      hints.push('Break down the problem into smaller parts.');
    }
    
    return hints;
  }

  private getTypeSpecificHint(question: Question): string {
    switch (question.type) {
      case 'counting':
        return 'Count each item carefully, one by one.';
      case 'true_false':
        return 'Look for absolute words like "always" or "never".';
      case 'multiple_choice':
        return 'Read all options before choosing.';
      default:
        return 'Take your time and read carefully.';
    }
  }

  private calculateHintCosts(hintCount: number): number[] {
    const costs: number[] = [];
    for (let i = 0; i < hintCount; i++) {
      costs.push((i + 1) * 10); // 10, 20, 30 XP
    }
    return costs;
  }
}

class CareerIntegrator {
  public integrateCareer(question: Question, career: string): void {
    // Add career context to question
    question.careerContext = career;
    
    // Modify question text to include career reference
    const careerPhrases: Record<string, string> = {
      'doctor': 'Dr. Smith',
      'engineer': 'Engineer Alex',
      'teacher': 'Ms. Johnson',
      'scientist': 'Scientist Lee'
    };
    
    const phrase = careerPhrases[career.toLowerCase()] || career;
    
    // Add career reference if not already present
    if (question.question && !question.question.toLowerCase().includes(career.toLowerCase())) {
      question.realWorldConnection = `This skill is important for ${career}s.`;
    } else if (question.content && !question.content.toLowerCase().includes(career.toLowerCase())) {
      question.realWorldConnection = `This skill is important for ${career}s.`;
    }
  }
}

// Export singleton instance and getter function
export const questionTemplateEngine = QuestionTemplateEngine.getInstance();
export const getQuestionTemplateEngine = () => QuestionTemplateEngine.getInstance();