/**
 * PromptTemplateLibrary
 * 
 * Manages structured prompt templates for AI content generation that ensure
 * career and skill consistency across all content.
 */

import { QuestionType, Grade, Subject, Skill, Career } from '../../types';
import { DailyLearningContext } from './DailyLearningContextManager';
import { SkillAdaptation } from './SkillAdaptationService';

/**
 * Prompt template structure
 */
export interface PromptTemplate {
  id: string;
  type: QuestionType;
  subject: Subject;
  gradeLevel: Grade;
  template: string;
  requiredVariables: string[];
  constraints: string[];
  examples: PromptExample[];
  successRate?: number;
  lastUsed?: Date;
}

/**
 * Example for prompt template
 */
export interface PromptExample {
  input: Record<string, any>;
  expectedOutput: string;
  explanation?: string;
}

/**
 * Prompt building context
 */
export interface PromptContext {
  questionType: QuestionType;
  subject: Subject;
  grade: Grade;
  skill: Skill;
  career: Career;
  companion: { name: string; personality: string };
  targetNumber?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  additionalContext?: Record<string, any>;
}

/**
 * Validation result for prompts
 */
export interface PromptValidationResult {
  valid: boolean;
  missingVariables: string[];
  errors: string[];
  warnings: string[];
}

/**
 * Effectiveness metrics for prompts
 */
export interface EffectivenessScore {
  successRate: number;
  averageQuality: number;
  consistencyScore: number;
  usageCount: number;
}

/**
 * Library of prompt templates for AI content generation
 */
export class PromptTemplateLibrary {
  private static instance: PromptTemplateLibrary;
  private templates: Map<string, PromptTemplate> = new Map();
  private effectivenessTracking: Map<string, EffectivenessScore> = new Map();

  private constructor() {
    this.initializeTemplates();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PromptTemplateLibrary {
    if (!PromptTemplateLibrary.instance) {
      PromptTemplateLibrary.instance = new PromptTemplateLibrary();
    }
    return PromptTemplateLibrary.instance;
  }

  /**
   * Initialize default templates
   */
  private initializeTemplates(): void {
    // Math templates
    this.registerMathTemplates();
    
    // ELA templates
    this.registerELATemplates();
    
    // Science templates
    this.registerScienceTemplates();
    
    // Social Studies templates
    this.registerSocialStudiesTemplates();
  }

  /**
   * Register math prompt templates
   */
  private registerMathTemplates(): void {
    // Counting template for K-2
    this.templates.set('math-counting-k2', {
      id: 'math-counting-k2',
      type: 'counting',
      subject: 'Math',
      gradeLevel: 'K',
      template: `
Generate a counting question for a {grade} grade student learning {skillName}.

CONTEXT:
- Student is aspiring to be a {careerTitle}
- Today's skill focus: {skillName} - {skillDescription}
- Companion {companionName} is helping with {companionPersonality} personality

REQUIREMENTS:
1. The question MUST involve counting objects related to {careerTitle} work
2. Use EXACTLY {targetNumber} objects (between 1-10 for grade {grade})
3. Objects must be: items that a {careerTitle} would use or encounter
4. Language must be simple, clear, and appropriate for grade {grade}
5. Include visual representation using emojis

STRUCTURE (respond with ONLY valid JSON):
{
  "type": "counting",
  "question": "How many [objects] does the {careerTitle} need to [action related to skill]?",
  "visual": "[exactly {targetNumber} relevant emojis]",
  "correct_answer": {targetNumber},
  "hint": "{companionName} says: 'Let's use {skillName} to count each [object] carefully!'",
  "explanation": "Great job! You counted {targetNumber} [objects]. {careerTitle}s use {skillName} when [career context]!",
  "careerConnection": "This is how {careerTitle}s use counting in their work",
  "skillPractice": "You practiced {skillName} by [specific action]"
}

FORBIDDEN:
- Abstract concepts inappropriate for grade {grade}
- Numbers above 10 for K-2 grades
- Complex sentences with multiple clauses
- Non-visual questions
- Generic content without career/skill context`,
      requiredVariables: [
        'grade', 'skillName', 'skillDescription', 'careerTitle',
        'companionName', 'companionPersonality', 'targetNumber'
      ],
      constraints: [
        'Must reference career explicitly',
        'Must focus on skill',
        'Must include companion voice',
        'Must be grade-appropriate'
      ],
      examples: [{
        input: {
          grade: 'K',
          skillName: 'Problem Solving',
          careerTitle: 'Game Developer',
          targetNumber: 5
        },
        expectedOutput: '{"question": "How many game controllers does the Game Developer need to test?", ...}'
      }]
    });

    // Multiple choice template for all grades
    this.templates.set('math-multiple-choice-all', {
      id: 'math-multiple-choice-all',
      type: 'multiple_choice',
      subject: 'Math',
      gradeLevel: '3',
      template: `
Generate a multiple choice math question for grade {grade} practicing {skillName}.

CONTEXT:
- Career focus: {careerTitle} - {careerDescription}
- Skill focus: {skillName} - applying it to mathematical problems
- {companionName} guides with {companionPersonality} personality

REQUIREMENTS:
1. Create a math problem that a {careerTitle} would solve
2. Apply {skillName} to reach the solution
3. Provide exactly 4 options with one correct answer
4. Include plausible distractors based on common mistakes
5. Grade {grade} appropriate complexity

STRUCTURE (respond with ONLY valid JSON):
{
  "type": "multiple_choice",
  "question": "[Math problem involving {careerTitle} scenario and requiring {skillName}]",
  "options": [
    "[Correct answer]",
    "[Plausible distractor 1]",
    "[Plausible distractor 2]",
    "[Plausible distractor 3]"
  ],
  "correct_answer": 0,
  "hint": "{companionName} suggests: 'Use {skillName} to break down this problem step by step'",
  "explanation": "The answer is [correct] because [explain using {skillName} and {careerTitle} context]",
  "careerConnection": "{careerTitle}s solve problems like this when [specific scenario]",
  "skillPractice": "You used {skillName} by [specific application]",
  "workSpace": "[Show step-by-step solution process]"
}`,
      requiredVariables: [
        'grade', 'skillName', 'careerTitle', 'careerDescription',
        'companionName', 'companionPersonality'
      ],
      constraints: [
        'Math problem must be authentic to career',
        'Must require skill to solve',
        'Options must be plausible'
      ],
      examples: []
    });

    // Numeric template
    this.templates.set('math-numeric-all', {
      id: 'math-numeric-all',
      type: 'numeric',
      subject: 'Math',
      gradeLevel: '3',
      template: `
Generate a numeric answer math question for grade {grade} practicing {skillName}.

CONTEXT:
- {careerTitle} career scenario
- Focus on {skillName} application
- {companionName} provides {companionPersonality} guidance

REQUIREMENTS:
1. Create a realistic {careerTitle} math problem
2. Solution must require {skillName}
3. Answer must be a specific number
4. Include units if applicable
5. Grade {grade} appropriate

STRUCTURE (respond with ONLY valid JSON):
{
  "type": "numeric",
  "question": "[Problem where {careerTitle} needs to calculate something using {skillName}]",
  "correct_answer": [number],
  "unit": "[unit if applicable, empty string if not]",
  "acceptableRange": {
    "min": [number - tolerance],
    "max": [number + tolerance]
  },
  "hint": "{companionName} says: 'Apply {skillName} to find the exact answer'",
  "explanation": "The answer is [number] [unit] because [explain calculation]",
  "careerConnection": "{careerTitle}s calculate this for [specific purpose]",
  "skillPractice": "You demonstrated {skillName} through [specific action]",
  "workSpace": "[Area for calculations]"
}`,
      requiredVariables: ['grade', 'skillName', 'careerTitle', 'companionName', 'companionPersonality'],
      constraints: ['Answer must be numeric', 'Must show work process'],
      examples: []
    });
  }

  /**
   * Register ELA prompt templates
   */
  private registerELATemplates(): void {
    // Fill in the blank template
    this.templates.set('ela-fill-blank-all', {
      id: 'ela-fill-blank-all',
      type: 'fill_blank',
      subject: 'ELA',
      gradeLevel: '3',
      template: `
Generate a fill-in-the-blank question for grade {grade} ELA practicing {skillName}.

CONTEXT:
- {careerTitle} communication scenario
- Practicing {skillName} through language
- {companionName} helps with {companionPersonality} approach

REQUIREMENTS:
1. Create a sentence/paragraph about {careerTitle} work
2. Missing word(s) should require {skillName} to identify
3. Context clues must be present
4. Grade {grade} appropriate vocabulary

STRUCTURE (respond with ONLY valid JSON):
{
  "type": "fill_blank",
  "question": "Complete the sentence about {careerTitle} work:",
  "text": "[Text with _____ for blanks, using {careerTitle} context]",
  "blanks": [
    {
      "position": 0,
      "correct_answer": "[word/phrase]",
      "acceptable_answers": ["[alternative1]", "[alternative2]"],
      "hint": "Think about {skillName} to find this word"
    }
  ],
  "hint": "{companionName} says: 'Use {skillName} and context clues to find the missing word'",
  "explanation": "The word is '[answer]' because [explain using {skillName}]",
  "careerConnection": "{careerTitle}s use precise language when [scenario]",
  "skillPractice": "You applied {skillName} to understand context"
}`,
      requiredVariables: ['grade', 'skillName', 'careerTitle', 'companionName', 'companionPersonality'],
      constraints: ['Context must provide clues', 'Career relevance required'],
      examples: []
    });

    // Short answer template
    this.templates.set('ela-short-answer-upper', {
      id: 'ela-short-answer-upper',
      type: 'short_answer',
      subject: 'ELA',
      gradeLevel: '6',
      template: `
Generate a short answer question for grade {grade} ELA practicing {skillName}.

CONTEXT:
- {careerTitle} writing scenario
- Developing {skillName} through composition
- {companionName} guides with {companionPersonality} style

REQUIREMENTS:
1. Prompt about {careerTitle} communication task
2. Requires {skillName} to formulate response
3. 2-3 sentence answer expected
4. Grade {grade} appropriate

STRUCTURE (respond with ONLY valid JSON):
{
  "type": "short_answer",
  "question": "[Question about how {careerTitle} would communicate using {skillName}]",
  "rubric": {
    "excellent": "[Criteria for excellent answer using {skillName}]",
    "good": "[Criteria for good answer]",
    "needs_improvement": "[Criteria for basic answer]"
  },
  "sample_answer": "[Example 2-3 sentence response]",
  "hint": "{companionName} suggests: 'Think about how {careerTitle}s use {skillName} in writing'",
  "careerConnection": "{careerTitle}s write like this when [specific situation]",
  "skillPractice": "You're developing {skillName} through clear writing",
  "keywords": ["[key term 1]", "[key term 2]", "[key term 3]"]
}`,
      requiredVariables: ['grade', 'skillName', 'careerTitle', 'companionName', 'companionPersonality'],
      constraints: ['Open-ended but focused', 'Career-relevant scenario'],
      examples: []
    });
  }

  /**
   * Register Science prompt templates
   */
  private registerScienceTemplates(): void {
    // True/False template
    this.templates.set('science-true-false-all', {
      id: 'science-true-false-all',
      type: 'true_false',
      subject: 'Science',
      gradeLevel: '3',
      template: `
Generate a true/false science question for grade {grade} practicing {skillName}.

CONTEXT:
- {careerTitle} scientific application
- Using {skillName} to evaluate statements
- {companionName} encourages with {companionPersonality} approach

REQUIREMENTS:
1. Statement about science concept relevant to {careerTitle}
2. Requires {skillName} to evaluate truth
3. Clear, unambiguous statement
4. Grade {grade} appropriate concept

STRUCTURE (respond with ONLY valid JSON):
{
  "type": "true_false",
  "question": "Is this statement about {careerTitle} work true or false?",
  "statement": "[Scientific statement involving {careerTitle} and requiring {skillName} to evaluate]",
  "correct_answer": [true or false],
  "hint": "{companionName} says: 'Use {skillName} to think about whether this makes scientific sense'",
  "explanation": "This is [true/false] because [scientific explanation using {skillName}]",
  "careerConnection": "{careerTitle}s need to know this because [specific application]",
  "skillPractice": "You used {skillName} to evaluate scientific information",
  "visual": "[Optional emoji representation if helpful]"
}`,
      requiredVariables: ['grade', 'skillName', 'careerTitle', 'companionName', 'companionPersonality'],
      constraints: ['Scientifically accurate', 'Career-relevant'],
      examples: []
    });

    // Matching template
    this.templates.set('science-matching-all', {
      id: 'science-matching-all',
      type: 'matching',
      subject: 'Science',
      gradeLevel: '4',
      template: `
Generate a matching question for grade {grade} science practicing {skillName}.

CONTEXT:
- {careerTitle} scientific knowledge
- Applying {skillName} to make connections
- {companionName} helps with {companionPersonality} guidance

REQUIREMENTS:
1. Items related to {careerTitle} science work
2. Requires {skillName} to match correctly
3. 3-5 pairs for grade {grade}
4. Clear, distinct items

STRUCTURE (respond with ONLY valid JSON):
{
  "type": "matching",
  "question": "Match the science concepts that {careerTitle}s use:",
  "leftColumn": {
    "title": "[Column title]",
    "items": ["[Item 1]", "[Item 2]", "[Item 3]"]
  },
  "rightColumn": {
    "title": "[Column title]",
    "items": ["[Match 1]", "[Match 2]", "[Match 3]"]
  },
  "correct_matches": [[0,0], [1,1], [2,2]],
  "hint": "{companionName} says: 'Use {skillName} to find the connections'",
  "explanation": "These match because [explain using {skillName} and science]",
  "careerConnection": "{careerTitle}s match these concepts when [scenario]",
  "skillPractice": "You applied {skillName} to identify relationships"
}`,
      requiredVariables: ['grade', 'skillName', 'careerTitle', 'companionName', 'companionPersonality'],
      constraints: ['Logical connections', 'Career relevance'],
      examples: []
    });
  }

  /**
   * Register Social Studies prompt templates
   */
  private registerSocialStudiesTemplates(): void {
    // Ordering template
    this.templates.set('social-ordering-all', {
      id: 'social-ordering-all',
      type: 'ordering',
      subject: 'Social Studies',
      gradeLevel: '4',
      template: `
Generate an ordering question for grade {grade} social studies practicing {skillName}.

CONTEXT:
- {careerTitle} historical/social context
- Using {skillName} to sequence events
- {companionName} guides with {companionPersonality} style

REQUIREMENTS:
1. Events/items relevant to {careerTitle} impact on society
2. Requires {skillName} to order correctly
3. 3-5 items for grade {grade}
4. Clear sequence logic

STRUCTURE (respond with ONLY valid JSON):
{
  "type": "ordering",
  "question": "Put these {careerTitle} contributions in order using {skillName}:",
  "items": [
    "[Item/event 1]",
    "[Item/event 2]",
    "[Item/event 3]",
    "[Item/event 4]"
  ],
  "correct_order": [0, 1, 2, 3],
  "order_type": "[chronological/importance/size/etc]",
  "hint": "{companionName} says: 'Apply {skillName} to find the pattern'",
  "explanation": "The correct order is [explain using {skillName}]",
  "careerConnection": "{careerTitle}s understand this sequence for [reason]",
  "skillPractice": "You used {skillName} to organize information"
}`,
      requiredVariables: ['grade', 'skillName', 'careerTitle', 'companionName', 'companionPersonality'],
      constraints: ['Logical sequence', 'Cultural relevance'],
      examples: []
    });
  }

  /**
   * Get template for specific criteria
   */
  public getTemplate(
    type: QuestionType,
    subject: Subject,
    grade: Grade
  ): PromptTemplate | null {
    // Find best matching template
    const templateKey = this.findBestTemplate(type, subject, grade);
    return templateKey ? this.templates.get(templateKey) || null : null;
  }

  /**
   * Get career context template
   */
  public getCareerTemplate(career: Career): string {
    return `
CAREER CONTEXT:
- Title: {careerTitle}
- Description: {careerDescription}
- Key Skills: {careerSkills}
- Daily Tasks: {careerTasks}
- Tools Used: {careerTools}

All content MUST reference how {careerTitle}s use this knowledge in their work.
Include specific examples of {careerTitle} applications.
Connect learning to real {careerTitle} scenarios.`;
  }

  /**
   * Get skill focus template
   */
  public getSkillTemplate(skill: Skill): string {
    return `
SKILL FOCUS:
- Skill Name: {skillName}
- Description: {skillDescription}
- Category: {skillCategory}
- Learning Objectives: {skillObjectives}

All content MUST help students practice {skillName}.
Questions should require {skillName} to solve.
Feedback should reinforce how {skillName} was used.`;
  }

  /**
   * Build complete prompt from template
   */
  public buildPrompt(
    template: PromptTemplate,
    context: PromptContext
  ): string {
    let prompt = template.template;

    // Replace variables
    const variables: Record<string, any> = {
      grade: context.grade,
      skillName: context.skill.name,
      skillDescription: context.skill.description,
      careerTitle: context.career.title,
      careerDescription: context.career.description,
      careerSkills: context.career.skills.join(', '),
      companionName: context.companion.name,
      companionPersonality: context.companion.personality,
      targetNumber: context.targetNumber || 5,
      ...context.additionalContext
    };

    // Replace all variables in template
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      prompt = prompt.replace(regex, String(value));
    });

    return prompt;
  }

  /**
   * Inject career context into prompt
   */
  public injectCareerContext(prompt: string, career: Career): string {
    const careerSection = `
REMEMBER - CAREER CONSISTENCY:
Every question must relate to ${career.title} work.
Use ${career.title} scenarios and examples.
Mention tools/concepts ${career.title}s use.
Show how this learning helps become a ${career.title}.

`;
    return careerSection + prompt;
  }

  /**
   * Inject skill focus into prompt
   */
  public injectSkillFocus(prompt: string, skill: Skill): string {
    const skillSection = `
REMEMBER - SKILL FOCUS:
The primary learning objective is ${skill.name}.
Questions must require ${skill.name} to solve.
Hints should guide students to use ${skill.name}.
Explanations should highlight how ${skill.name} was applied.

`;
    return skillSection + prompt;
  }

  /**
   * Build prompt with full context
   */
  public buildContextualPrompt(
    context: DailyLearningContext,
    questionType: QuestionType,
    subject: Subject,
    adaptation: SkillAdaptation
  ): string {
    // Get base template
    const template = this.getTemplate(questionType, subject, context.grade);
    if (!template) {
      throw new Error(`No template found for ${questionType} in ${subject} for grade ${context.grade}`);
    }

    // Build prompt context
    const promptContext: PromptContext = {
      questionType,
      subject,
      grade: context.grade,
      skill: context.primarySkill,
      career: context.career,
      companion: context.companion,
      additionalContext: {
        adaptedDescription: adaptation.adaptedDescription,
        practiceContext: adaptation.practiceContext,
        careerConnection: adaptation.careerConnection
      }
    };

    // Build base prompt
    let prompt = this.buildPrompt(template, promptContext);

    // Inject career and skill emphasis
    prompt = this.injectCareerContext(prompt, context.career);
    prompt = this.injectSkillFocus(prompt, context.primarySkill);

    // Add adaptation context
    prompt += `
SUBJECT ADAPTATION:
${adaptation.adaptedDescription}
Practice Context: ${adaptation.practiceContext}
Career Connection: ${adaptation.careerConnection}
`;

    return prompt;
  }

  /**
   * Validate prompt completeness
   */
  public validatePrompt(prompt: string): PromptValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingVariables: string[] = [];

    // Check for unreplaced variables
    const variablePattern = /{(\w+)}/g;
    let match;
    while ((match = variablePattern.exec(prompt)) !== null) {
      missingVariables.push(match[1]);
    }

    if (missingVariables.length > 0) {
      errors.push(`Unreplaced variables found: ${missingVariables.join(', ')}`);
    }

    // Check for required sections
    const requiredSections = ['CONTEXT:', 'REQUIREMENTS:', 'STRUCTURE'];
    requiredSections.forEach(section => {
      if (!prompt.includes(section)) {
        warnings.push(`Missing section: ${section}`);
      }
    });

    // Check for career and skill mentions
    if (!prompt.toLowerCase().includes('career')) {
      errors.push('Prompt must reference career context');
    }

    if (!prompt.toLowerCase().includes('skill')) {
      errors.push('Prompt must reference skill focus');
    }

    return {
      valid: errors.length === 0,
      missingVariables,
      errors,
      warnings
    };
  }

  /**
   * Test prompt effectiveness
   */
  public testPromptEffectiveness(prompt: string): EffectivenessScore {
    // Get or create tracking for this prompt
    const promptHash = this.hashPrompt(prompt);
    
    if (!this.effectivenessTracking.has(promptHash)) {
      this.effectivenessTracking.set(promptHash, {
        successRate: 0,
        averageQuality: 0,
        consistencyScore: 0,
        usageCount: 0
      });
    }

    return this.effectivenessTracking.get(promptHash)!;
  }

  /**
   * Track prompt success
   */
  public trackPromptSuccess(
    templateId: string,
    success: boolean,
    quality: number = 0
  ): void {
    const template = this.templates.get(templateId);
    if (!template) return;

    // Update template metrics
    const currentRate = template.successRate || 0;
    const usageCount = this.getTemplateUsageCount(templateId);
    
    template.successRate = (currentRate * usageCount + (success ? 100 : 0)) / (usageCount + 1);
    template.lastUsed = new Date();

    // Update effectiveness tracking
    const effectiveness = this.effectivenessTracking.get(templateId) || {
      successRate: 0,
      averageQuality: 0,
      consistencyScore: 0,
      usageCount: 0
    };

    effectiveness.usageCount++;
    effectiveness.successRate = template.successRate;
    effectiveness.averageQuality = (effectiveness.averageQuality * (effectiveness.usageCount - 1) + quality) / effectiveness.usageCount;

    this.effectivenessTracking.set(templateId, effectiveness);
  }

  /**
   * Get prompt effectiveness metrics
   */
  public getPromptEffectiveness(templateId: string): EffectivenessScore {
    return this.effectivenessTracking.get(templateId) || {
      successRate: 0,
      averageQuality: 0,
      consistencyScore: 0,
      usageCount: 0
    };
  }

  /**
   * Register custom template
   */
  public registerTemplate(template: PromptTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get all templates for subject
   */
  public getTemplatesForSubject(subject: Subject): PromptTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.subject === subject);
  }

  /**
   * Find best matching template
   */
  private findBestTemplate(
    type: QuestionType,
    subject: Subject,
    grade: Grade
  ): string | null {
    // Try exact match first
    let key = `${subject.toLowerCase()}-${type}-${grade}`.toLowerCase();
    if (this.templates.has(key)) return key;

    // Try grade range match
    const gradeNum = this.gradeToNumber(grade);
    
    // K-2
    if (gradeNum <= 2) {
      key = `${subject.toLowerCase()}-${type}-k2`;
      if (this.templates.has(key)) return key;
    }
    
    // Upper grades
    if (gradeNum >= 6) {
      key = `${subject.toLowerCase()}-${type}-upper`;
      if (this.templates.has(key)) return key;
    }

    // Try generic match
    key = `${subject.toLowerCase()}-${type}-all`;
    if (this.templates.has(key)) return key;

    return null;
  }

  /**
   * Convert grade to number
   */
  private gradeToNumber(grade: Grade): number {
    const gradeMap: Record<string, number> = {
      'K': 0, '1': 1, '2': 2, '3': 3, '4': 4,
      '5': 5, '6': 6, '7': 7, '8': 8
    };
    return gradeMap[grade] || 3;
  }

  /**
   * Hash prompt for tracking
   */
  private hashPrompt(prompt: string): string {
    // Simple hash for demo - would use proper hashing in production
    return prompt.substring(0, 50).replace(/\s+/g, '-');
  }

  /**
   * Get template usage count
   */
  private getTemplateUsageCount(templateId: string): number {
    const effectiveness = this.effectivenessTracking.get(templateId);
    return effectiveness ? effectiveness.usageCount : 0;
  }

  /**
   * Export templates for backup
   */
  public exportTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Import templates from backup
   */
  public importTemplates(templates: PromptTemplate[]): void {
    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }
}

// Export singleton instance getter
export const getPromptTemplateLibrary = () => PromptTemplateLibrary.getInstance();