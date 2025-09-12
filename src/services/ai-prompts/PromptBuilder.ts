/**
 * PromptBuilder - Combines hierarchical rules to generate consistent AI prompts
 * This centralizes prompt generation and ensures all rules are applied
 */

import { 
  UNIVERSAL_RULES, 
  formatUniversalRulesForPrompt,
  validateQuestionStructure 
} from './rules/UniversalRules';

import {
  SUBJECT_RULES,
  formatSubjectRulesForPrompt,
  getAllowedTypes,
  validateSubjectRules
} from './rules/SubjectRules';

import {
  CONTAINER_RULES,
  formatContainerRulesForPrompt,
  getContainerRequirements,
  getContainerInstructions,
  validateContainerRules
} from './rules/ContainerRules';

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
    const requirements = getContainerRequirements(container);
    
    // Build the complete prompt
    const prompt = `
You are an expert educational content creator specializing in personalized, gamified learning experiences.

${this.getSystemContext(student, career, skill, companion)}

${formatUniversalRulesForPrompt(grade)}

${formatSubjectRulesForPrompt(subject, grade)}

${formatContainerRulesForPrompt(container, career.name)}

${this.getTaskInstructions(context)}

${this.getResponseFormat(container, requirements, allowedTypes)}

${this.getExampleStructure(container)}

${this.getQualityChecklist()}

Remember:
1. EVERY question MUST have ALL mandatory fields
2. correct_answer format MUST match the question type
3. visual field is ALWAYS required:
   - For shape questions: Use shape emojis (▲ ■ ● ◆)
   - For warning signs: Use ⚠️ or 🔺
   - For counting: Use object emojis
   - ONLY use "❓" for pure text questions with no visual element
4. Practice questions MUST include complete practiceSupport structure
5. Use ONLY the allowed question types for ${subject} grade ${grade}
6. ${subject === 'ELA' ? 'NEVER use counting type for ELA' : ''}

Generate the content now:
`;
    
    return prompt;
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
    const { container, student, career } = context;
    const instructions = getContainerInstructions(
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
  
  /**
   * Get the expected response format
   */
  private getResponseFormat(
    container: string,
    requirements: any,
    allowedTypes: string[]
  ): string {
    return `
========================================
RESPONSE FORMAT (JSON)
========================================
{
  "title": "Engaging title with career and skill",
  "greeting": "Personalized welcome using student name and career context",
  "concept": "Clear explanation of the concept and its career relevance",
  ${requirements.exampleCount > 0 ? `"examples": [
    // EXACTLY ${requirements.exampleCount} worked examples
    {
      "question": "Example question text",
      "answer": "The answer",
      "explanation": "Why this answer is correct",
      "visual": "Optional visual ("❓" if text-only)"
    }
  ],` : ''}
  "practice": [
    // EXACTLY ${requirements.practiceCount} practice questions
    {
      "question": "Practice question text",
      "type": "One of: ${allowedTypes.join(', ')}",
      "visual": "REQUIRED - For shapes use emojis (▲ ■ ● ◆), for objects use relevant emojis, use \\"❓\\" ONLY for pure text questions",
      "options": ["A", "B", "C", "D"] // ONLY for multiple_choice
      "correct_answer": "Format based on type (see universal rules)",
      "hint": "Single helpful hint",
      "explanation": "Clear explanation",
      ${container !== 'ASSESSMENT' ? `"practiceSupport": {
        // COMPLETE STRUCTURE REQUIRED (see template)
        "preQuestionContext": "...",
        "connectionToLearn": "...",
        "confidenceBuilder": "...",
        "hints": [/* 3 progressive hints */],
        "correctFeedback": {/* all fields */},
        "incorrectFeedback": {/* all fields */},
        "teachingMoment": {/* all fields */}
      }` : ''}
    }
  ],
  "assessment": {
    "question": "Final assessment question",
    "type": "Appropriate type from allowed list",
    "visual": "REQUIRED - Use appropriate emojis (shapes: ▲■●◆, warning signs: ⚠️🔺, objects: relevant emojis)",
    "options": [/* if multiple_choice */],
    "correct_answer": "Format based on type",
    "explanation": "Detailed explanation",
    "success_message": "Celebration with student name!"
  }
}
`;
  }
  
  /**
   * Provide a concrete example structure
   */
  private getExampleStructure(container: string): string {
    if (container === 'LEARN') {
      return `
========================================
EXAMPLE PRACTICE QUESTION STRUCTURE
========================================
{
  "question": "True or False: [career-relevant statement]",
  "type": "true_false",
  "visual": "❓",
  "correct_answer": false,  // BOOLEAN, not string!
  "hint": "Think about what you learned...",
  "explanation": "The answer is false because...",
  "practiceSupport": {
    "preQuestionContext": "Let's see how [Career] uses this skill...",
    "connectionToLearn": "Remember when we discussed...",
    "confidenceBuilder": "You're doing great, [Name]!",
    "hints": [
      {
        "level": 1,
        "hint": "First, think about...",
        "visualCue": "Look for..."
      },
      {
        "level": 2,
        "hint": "The key is...",
        "example": "For instance..."
      },
      {
        "level": 3,
        "hint": "The answer is...",
        "example": "Here's why..."
      }
    ],
    "correctFeedback": {
      "immediate": "Excellent work!",
      "careerConnection": "Just like a [Career] would!",
      "skillReinforcement": "You're mastering this!"
    },
    "incorrectFeedback": {
      "immediate": "That's okay!",
      "explanation": "The correct answer is...",
      "reteach": "Let's review...",
      "tryAgainPrompt": "Want to try again?"
    },
    "teachingMoment": {
      "conceptExplanation": "This works because...",
      "realWorldExample": "[Career]s use this when...",
      "commonMistakes": ["Students often think..."]
    }
  }
}
`;
    }
    return '';
  }
  
  /**
   * Quality checklist reminder
   */
  private getQualityChecklist(): string {
    return `
========================================
FINAL QUALITY CHECK
========================================
Before generating, verify:
✓ All questions have ALL mandatory fields
✓ correct_answer format matches type EXACTLY
✓ visual field present in EVERY question with appropriate content:
  • Shape questions → shape emojis (▲■●◆)
  • Warning/sign questions → relevant emojis (⚠️🔺)
  • Counting questions → object emojis
  • Pure text questions → "❓" placeholder
✓ NO forbidden types used (e.g., counting for ELA)
✓ Practice questions have COMPLETE practiceSupport
✓ Career context integrated naturally
✓ Grade-appropriate language and complexity
✓ Exactly the required number of questions
✓ True/False uses boolean, not strings
✓ Multiple choice uses index (0-3), not text
`;
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
    
    // Validate container requirements
    const containerErrors = validateContainerRules(content, context.container);
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
    const rules = UNIVERSAL_RULES.ANSWER_FORMATS[questionType as keyof typeof UNIVERSAL_RULES.ANSWER_FORMATS];
    
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