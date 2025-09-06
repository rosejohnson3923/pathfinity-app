/**
 * Universal Rules - Core rules that apply to ALL questions across all subjects and containers
 * These rules ensure consistency and prevent missing fields like the ELA true_false issue
 */

export interface PracticeSupportStructure {
  preQuestionContext: string;
  connectionToLearn: string;
  confidenceBuilder: string;
  hints: Array<{
    level: number;
    hint: string;
    visualCue: string;
    example?: string;
  }>;
  correctFeedback: {
    immediate: string;
    careerConnection: string;
    skillReinforcement: string;
  };
  incorrectFeedback: {
    immediate: string;
    explanation: string;
    reteach: string;
    tryAgainPrompt: string;
  };
  teachingMoment: {
    conceptExplanation: string;
    realWorldExample: string;
    commonMistakes: string[];
  };
}

export const UNIVERSAL_RULES = {
  // Types that are FORBIDDEN and must never be used
  FORBIDDEN_TYPES: [
    'ordering',      // NOT SUPPORTED - use multiple_choice instead
    'matching',      // NOT SUPPORTED
    'essay',         // NOT SUPPORTED
    'drag_drop',     // NOT SUPPORTED
    'drawing'        // NOT SUPPORTED
  ],
  
  // Fields that MUST be present in every question
  MANDATORY_FIELDS: {
    all_questions: [
      'question',       // The question text
      'type',          // Question type from approved list
      'visual',        // ALWAYS required ("❓" for text-only, null, or actual visual)
      'correct_answer', // ALWAYS required (format varies by type)
      'hint',          // Single-line hint for students
      'explanation'    // Why this answer is correct
    ],
    practice_specific: [
      'practiceSupport' // Required for gamification
    ],
    assessment_specific: [
      'success_message' // Celebration message with student name
    ]
  },

  // Answer format specifications by question type
  ANSWER_FORMATS: {
    true_false: {
      format: 'boolean',
      example: 'true or false (NOT string "true" or "false")',
      validation: 'Must be boolean: true or false',
      aiInstruction: 'Use boolean true/false, not strings'
    },
    multiple_choice: {
      format: 'number',
      example: '0, 1, 2, or 3 (index of correct option in array)',
      validation: 'Must be number 0-3',
      aiInstruction: 'Use array index (0-3), not the option text'
    },
    counting: {
      format: 'number',
      example: '5 (the actual count)',
      validation: 'Must be positive integer',
      aiInstruction: 'Use number, not string'
    },
    numeric: {
      format: 'number',
      example: '42 or 3.14',
      validation: 'Must be number (int or float)',
      aiInstruction: 'Use number, not string'
    },
    fill_blank: {
      format: 'string',
      example: '"answer text"',
      validation: 'Must be string',
      aiInstruction: 'Use string for the blank answer'
    },
    short_answer: {
      format: 'string',
      example: '"The answer text"',
      validation: 'Must be string',
      aiInstruction: 'Use string for answer'
    },
    long_answer: {
      format: 'string',
      example: '"Detailed answer text..."',
      validation: 'Must be string',
      aiInstruction: 'Not auto-validated, rubric-based'
    },
    matching: {
      format: 'object',
      example: '{"A": "1", "B": "3", "C": "2"}',
      validation: 'Must be object mapping',
      aiInstruction: 'Map left items to right items'
    },
    ordering: {
      format: 'array',
      example: '[0, 2, 1, 3] (correct order indices)',
      validation: 'Must be array of indices',
      aiInstruction: 'Array of indices in correct order'
    }
  },

  // Visual field specifications
  VISUAL_RULES: {
    placeholder: '❓',
    null_allowed: true,
    usage: {
      text_only: 'Use "❓" or null when no visual support needed',
      with_visual: 'Use appropriate emojis or description',
      counting: 'REQUIRED - use repeated emojis matching count (e.g., "🍎🍎🍎" for 3)'
    },
    formats: {
      emoji: 'Direct emoji characters (e.g., "🍎🍎🍎")',
      description: 'Text description for complex visuals',
      null: 'null for no visual',
      placeholder: '"❓" to explicitly indicate text-only'
    }
  },

  // Structure requirements
  STRUCTURE_RULES: {
    practice: {
      count: 'EXACTLY 5 questions',
      variety: 'Use at least 2 different question types',
      progression: 'Start simple, increase complexity',
      support: 'MUST include full practiceSupport structure'
    },
    assessment: {
      count: 'EXACTLY 1 question',
      difficulty: 'Should test mastery of skill',
      no_support: 'No practiceSupport (assessment only)'
    },
    examples: {
      count: 'EXACTLY 3 worked examples',
      structure: 'question, answer, explanation, visual (optional)'
    }
  },

  // Gamification structure template
  PRACTICE_SUPPORT_TEMPLATE: {
    preQuestionContext: 'Sets the career/skill context before question',
    connectionToLearn: 'Connects to prior knowledge or examples',
    confidenceBuilder: 'Personal encouragement using student\'s name',
    hints: [
      {
        level: 1,
        hint: 'Gentle nudge in right direction',
        visualCue: 'What to look for or focus on'
      },
      {
        level: 2,
        hint: 'More specific guidance',
        example: 'Concrete example or comparison'
      },
      {
        level: 3,
        hint: 'Step-by-step walkthrough',
        example: 'Complete solution path'
      }
    ],
    correctFeedback: {
      immediate: 'Instant celebration and validation',
      careerConnection: 'Link success to career skills',
      skillReinforcement: 'Bridge to next learning step'
    },
    incorrectFeedback: {
      immediate: 'Supportive, non-judgmental response',
      explanation: 'Clear explanation of correct answer',
      reteach: 'What concept we\'ll review together',
      tryAgainPrompt: 'Encouraging prompt to retry'
    },
    teachingMoment: {
      conceptExplanation: 'Deeper understanding of the concept',
      realWorldExample: 'How career professionals use this',
      commonMistakes: ['List of', 'typical errors', 'to avoid']
    }
  },

  // Quality checks
  QUALITY_REQUIREMENTS: {
    language: {
      grade_appropriate: 'Match vocabulary to grade level',
      clear_concise: 'Avoid ambiguity and wordiness',
      positive_tone: 'Encouraging and supportive'
    },
    content: {
      accuracy: 'Factually correct information',
      relevance: 'Directly related to skill',
      engagement: 'Interesting and relatable'
    },
    career_integration: {
      authentic: 'Real career applications',
      age_appropriate: 'Suitable career examples for grade',
      consistent: 'Same career throughout session'
    }
  },

  // Error prevention rules
  ERROR_PREVENTION: {
    common_mistakes: {
      true_false_strings: 'NEVER use "true"/"false" strings for true_false type',
      missing_visual: 'ALWAYS include visual field (use "❓" or null if none)',
      missing_correct_answer: 'EVERY question MUST have correct_answer',
      wrong_index: 'multiple_choice uses 0-3, not 1-4',
      counting_no_visual: 'counting type REQUIRES visual with emojis'
    },
    validation_checks: [
      'All mandatory fields present',
      'correct_answer format matches type',
      'visual field included (even if "❓" or null)',
      'practiceSupport complete for practice questions',
      'options array has exactly 4 items for multiple_choice'
    ]
  }
};

// Helper function to generate the rules text for AI prompt
export function formatUniversalRulesForPrompt(): string {
  return `
========================================
UNIVERSAL RULES (APPLY TO ALL QUESTIONS)
========================================

❌ FORBIDDEN TYPES (NEVER USE THESE):
${UNIVERSAL_RULES.FORBIDDEN_TYPES.map(t => `  ✗ ${t}`).join('\n')}

If you need to ask about ordering, use multiple_choice with ordered options instead.

MANDATORY FIELDS - Every question MUST include:
${UNIVERSAL_RULES.MANDATORY_FIELDS.all_questions.map(f => `  ✓ ${f}`).join('\n')}

Practice questions additionally REQUIRE:
  ✓ practiceSupport (full gamification structure)

Assessment questions additionally REQUIRE:
  ✓ success_message (personalized celebration)

CORRECT_ANSWER FORMAT BY TYPE (CRITICAL):
${Object.entries(UNIVERSAL_RULES.ANSWER_FORMATS).map(([type, rules]) => 
  `  ${type}: ${rules.format} - ${rules.example}`
).join('\n')}

VISUAL FIELD RULES:
  • ALWAYS include visual field
  • Use "${UNIVERSAL_RULES.VISUAL_RULES.placeholder}" or null for text-only questions  
  • Use appropriate emojis for visual questions
  • Counting MUST have visual (e.g., "🍎🍎🍎" for count of 3)

PRACTICE SUPPORT STRUCTURE (Required for all practice questions):
${JSON.stringify(UNIVERSAL_RULES.PRACTICE_SUPPORT_TEMPLATE, null, 2)}

COMMON MISTAKES TO AVOID:
${Object.values(UNIVERSAL_RULES.ERROR_PREVENTION.common_mistakes).map(m => `  ✗ ${m}`).join('\n')}

STRUCTURE REQUIREMENTS:
  • Practice: EXACTLY 5 questions with variety
  • Assessment: EXACTLY 1 question
  • Examples: EXACTLY 3 worked examples
`;
}

// Type guards for validation
export function validateQuestionStructure(question: any): string[] {
  const errors: string[] = [];
  
  // Check mandatory fields
  for (const field of UNIVERSAL_RULES.MANDATORY_FIELDS.all_questions) {
    if (!(field in question)) {
      errors.push(`Missing mandatory field: ${field}`);
    }
  }
  
  // Validate correct_answer format
  if (question.type && question.correct_answer !== undefined) {
    const format = UNIVERSAL_RULES.ANSWER_FORMATS[question.type as keyof typeof UNIVERSAL_RULES.ANSWER_FORMATS];
    if (format) {
      const answerType = typeof question.correct_answer;
      if (format.format === 'boolean' && answerType !== 'boolean') {
        errors.push(`true_false correct_answer must be boolean, got ${answerType}`);
      } else if (format.format === 'number' && answerType !== 'number') {
        errors.push(`${question.type} correct_answer must be number, got ${answerType}`);
      } else if (format.format === 'string' && answerType !== 'string') {
        errors.push(`${question.type} correct_answer must be string, got ${answerType}`);
      }
    }
  }
  
  return errors;
}