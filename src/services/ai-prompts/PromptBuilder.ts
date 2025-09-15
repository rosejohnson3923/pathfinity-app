/**
 * PromptBuilder - Combines hierarchical rules to generate consistent AI prompts
 * This centralizes prompt generation and ensures all rules are applied
 */

import {
  UNIVERSALCONTENT_RULES,
  formatUniversalRulesForPrompt,
  getLanguageConstraintsOnly,
  validateQuestionStructure
} from './rules/UniversalContentRules';

import {
  UNIVERSALSUBJECT_RULES,
  formatSubjectRulesForPrompt,
  getAllowedTypes,
  validateSubjectRules
} from './rules/UniversalSubjectRules';

import {
  LEARNCONTAINER_RULES,
  formatLearnContainerRulesForPrompt,
  getLearnContainerRequirements,
  getLearnContainerInstructions,
  validateLearnContainerRules,
  getLearnExampleStructure,
  getLearnResponseFormat,
  getLearnQualityChecklist,
  getLearnReminders
} from './rules/LearnContainerRules';

import {
  EXPERIENCECONTAINER_RULES,
  formatExperienceContainerRulesForPrompt,
  getExperienceContainerRequirements,
  getExperienceContainerInstructions,
  validateExperienceContainerRules,
  getExperienceTaskInstructions,
  getExperienceResponseFormat,
  getExperienceExampleStructure,
  getExperienceQualityChecklist,
  getExperienceReminders,
  getExperienceOverrides
} from './rules/ExperienceContainerRules';

import {
  DISCOVERCONTAINER_RULES,
  formatDiscoverContainerRulesForPrompt,
  getDiscoverContainerRequirements,
  getDiscoverContainerInstructions,
  validateDiscoverContainerRules,
  getDiscoverTaskInstructions,
  getDiscoverResponseFormat,
  getDiscoverQualityChecklist,
  getDiscoverReminders,
  getDiscoverExampleStructure,
  getDiscoverOverrides
} from './rules/DiscoverContainerRules';

export interface PromptContext {
  container: 'LEARN' | 'DISCOVER' | 'EXPERIENCE' | 'ASSESSMENT';
  subject: string;
  grade: string;
  skill: {
    id: string;
    name: string;
    description?: string;
    subject: string;
  };
  career: {
    id: string;
    name: string;
    description?: string;
  };
  student: {
    id: string;
    display_name: string;
    grade_level: string;
  };
  companion?: {
    name: string;
    personality?: string;
  };
}

export class PromptBuilder {
  private static instance: PromptBuilder;
  
  private constructor() {}
  
  static getInstance(): PromptBuilder {
    if (!PromptBuilder.instance) {
      PromptBuilder.instance = new PromptBuilder();
    }
    return PromptBuilder.instance;
  }
  
  /**
   * Build a complete prompt combining all rule levels
   */
  buildPrompt(context: PromptContext): string {
    const { container, subject, grade, skill, career, student, companion } = context;

    // Get allowed types for this subject/grade
    const allowedTypes = getAllowedTypes(subject, grade);

    // Get container-specific requirements and overrides
    const requirements = this.getContainerRequirements(container);
    const overrides = this.getContainerOverrides(container);

    // Build the complete prompt based on container type
    const prompt = `
You are an expert educational content creator specializing in personalized, gamified learning experiences.

${this.getSystemContext(student, career, skill, companion)}

${overrides.useLanguageConstraintsOnly ? getLanguageConstraintsOnly(grade) : formatUniversalRulesForPrompt(grade)}

${overrides.skipSubjectRules ? '' : formatSubjectRulesForPrompt(subject, grade)}

${this.getContainerRules(container, career.name)}

${this.getTaskInstructions(context)}

${this.getResponseFormat(container, requirements, allowedTypes, context)}

${this.getExampleStructure(container, career.name, subject)}

${this.getQualityChecklist(container)}

${this.getContainerReminders(container, subject, grade, career.name)}

Generate the content now:
`;

    return prompt;
  }
  
  /**
   * Get container-specific requirements
   */
  private getContainerRequirements(container: string): any {
    switch (container) {
      case 'LEARN':
      case 'ASSESSMENT':
        return getLearnContainerRequirements(container);
      case 'EXPERIENCE':
        return getExperienceContainerRequirements(container);
      case 'DISCOVER':
        return getDiscoverContainerRequirements(container);
      default:
        return { exampleCount: 3, practiceCount: 5, assessmentCount: 1, requiresSupport: true };
    }
  }

  /**
   * Get container-specific overrides
   */
  private getContainerOverrides(container: string): any {
    switch (container) {
      case 'EXPERIENCE':
        return getExperienceOverrides();
      case 'DISCOVER':
        return getDiscoverOverrides();
      case 'LEARN':
      case 'ASSESSMENT':
      default:
        return { skipSubjectRules: false, useLanguageConstraintsOnly: false };
    }
  }

  /**
   * Get container-specific rules
   */
  private getContainerRules(container: string, careerName: string): string {
    switch (container) {
      case 'LEARN':
      case 'ASSESSMENT':
        return formatLearnContainerRulesForPrompt(container, careerName);
      case 'EXPERIENCE':
        return formatExperienceContainerRulesForPrompt(container, careerName);
      case 'DISCOVER':
        return formatDiscoverContainerRulesForPrompt(container, careerName);
      default:
        return '';
    }
  }

  /**
   * Get container-specific reminders
   */
  private getContainerReminders(container: string, subject: string, grade: string, careerName: string): string {
    switch (container) {
      case 'LEARN':
      case 'ASSESSMENT':
        return getLearnReminders(subject, grade);
      case 'EXPERIENCE':
        return getExperienceReminders(careerName, grade);
      case 'DISCOVER':
        return getDiscoverReminders(subject, grade, careerName);
      default:
        return '';
    }
  }

  /**
   * Build system context section
   */
  private getSystemContext(
    student: any,
    career: any,
    skill: any,
    companion?: any
  ): string {
    return `
========================================
LEARNING CONTEXT
========================================
Student: ${student.display_name} (Grade ${student.grade_level})
Career Context: ${career.name}
Skill: ${skill.name}
Subject: ${skill.subject}
${companion ? `AI Companion: ${companion.name}` : ''}

Your task is to create an engaging, career-integrated learning experience that helps ${student.display_name} master "${skill.name}" while seeing how ${career.name}s use this skill professionally.
`;
  }
  
  /**
   * Get specific task instructions based on container
   */
  private getTaskInstructions(context: PromptContext): string {
    const { container, student, career, skill, subject } = context;

    switch (container) {
      case 'EXPERIENCE':
        return getExperienceTaskInstructions(
          student.display_name,
          career.name,
          skill.name,
          student.grade_level
        );

      case 'DISCOVER':
        return getDiscoverTaskInstructions(
          student.display_name,
          career.name,
          subject,
          skill.name,
          student.grade_level
        );

      case 'LEARN':
      case 'ASSESSMENT':
      default:
        const instructions = getLearnContainerInstructions(
          container,
          career.name,
          student.display_name,
          student.grade_level
        );
        return `
========================================
YOUR TASK
========================================
${instructions}

Create content that:
• Is appropriate for grade ${student.grade_level}
• Integrates ${career.name} context naturally
• Follows all universal, subject, and container rules
• Maintains consistent formatting and structure
• Provides supportive, encouraging feedback
`;
    }
  }
  
  /**
   * Get the expected response format
   */
  private getResponseFormat(
    container: string,
    requirements: any,
    allowedTypes: string[],
    context?: PromptContext
  ): string {
    switch (container) {
      case 'EXPERIENCE':
        return getExperienceResponseFormat(requirements);

      case 'DISCOVER':
        // Add context to requirements for Discover
        const discoverRequirements = {
          ...requirements,
          career: context?.career?.name,
          subject: context?.subject,
          skill: context?.skill?.name,
          studentName: context?.student?.display_name
        };
        return getDiscoverResponseFormat(discoverRequirements, allowedTypes);

      case 'LEARN':
      case 'ASSESSMENT':
        return getLearnResponseFormat(requirements, allowedTypes);

      default:
        // Fallback to basic format
        return getLearnResponseFormat(requirements, allowedTypes);
    }
  }
  
  /**
   * Provide a concrete example structure
   */
  private getExampleStructure(container: string, careerName: string, subject: string): string {
    switch (container) {
      case 'EXPERIENCE':
        return getExperienceExampleStructure();

      case 'DISCOVER':
        return getDiscoverExampleStructure(careerName, subject);

      case 'LEARN':
      case 'ASSESSMENT':
        return getLearnExampleStructure();

      default:
        return ``;
    }
  }
  
  /**
   * Quality checklist reminder
   */
  private getQualityChecklist(container?: string): string {
    switch (container) {
      case 'EXPERIENCE':
        return getExperienceQualityChecklist();

      case 'DISCOVER':
        return getDiscoverQualityChecklist();

      case 'LEARN':
      case 'ASSESSMENT':
        return getLearnQualityChecklist();

      default:
        // This should never be reached since all containers have their own checklists
        console.warn(`No quality checklist found for container: ${container}`);
        return '';
    }
  }
  
  /**
   * Validate generated content against all rules
   */
  validateContent(content: any, context: PromptContext): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate container requirements based on container type
    let containerErrors: string[] = [];
    switch (context.container) {
      case 'LEARN':
      case 'ASSESSMENT':
        containerErrors = validateLearnContainerRules(content, context.container);
        break;
      case 'EXPERIENCE':
        containerErrors = validateExperienceContainerRules(content, context.container);
        break;
      case 'DISCOVER':
        containerErrors = validateDiscoverContainerRules(content, context.container);
        break;
    }
    errors.push(...containerErrors);
    
    // Validate each practice question
    if (content.practice && Array.isArray(content.practice)) {
      content.practice.forEach((question: any, index: number) => {
        // Universal validation
        const universalErrors = validateQuestionStructure(question);
        errors.push(...universalErrors.map(e => `Practice ${index + 1}: ${e}`));
        
        // Subject validation
        const subjectErrors = validateSubjectRules(question, context.subject, context.grade);
        errors.push(...subjectErrors.map(e => `Practice ${index + 1}: ${e}`));
        
        // Check practiceSupport
        if (context.container !== 'ASSESSMENT' && !question.practiceSupport) {
          errors.push(`Practice ${index + 1}: Missing required practiceSupport structure`);
        }
      });
    }
    
    // Validate assessment
    if (content.assessment) {
      const assessmentErrors = validateQuestionStructure(content.assessment);
      errors.push(...assessmentErrors.map(e => `Assessment: ${e}`));
      
      const subjectErrors = validateSubjectRules(content.assessment, context.subject, context.grade);
      errors.push(...subjectErrors.map(e => `Assessment: ${e}`));
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Generate a simplified prompt for quick testing
   */
  buildSimplePrompt(
    subject: string,
    grade: string,
    questionType: string,
    includeSupport: boolean = true
  ): string {
    const rules = UNIVERSALCONTENT_RULES.ANSWER_FORMATS[questionType as keyof typeof UNIVERSALCONTENT_RULES.ANSWER_FORMATS];

    return `
Generate a ${questionType} question for ${subject}, grade ${grade}.

MANDATORY FIELDS:
- question
- type: "${questionType}"
- visual: (use "❓" for text-only)
- correct_answer: ${rules?.format || 'appropriate format'}
- hint
- explanation
${includeSupport ? '- practiceSupport (full structure)' : ''}

correct_answer format: ${rules?.aiInstruction || 'see rules'}

Generate now in JSON format:
`;
  }
}

// Export singleton instance
export const promptBuilder = PromptBuilder.getInstance();