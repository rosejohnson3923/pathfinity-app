/**
 * Universal Content Rules - Core rules that apply to ALL questions across all subjects and containers
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

export const UNIVERSALCONTENT_RULES = {
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
      example: '0, 1, 2, or 3 (index of correct option in RANDOMIZED array)',
      validation: 'Must be number 0-3',
      aiInstruction: 'CRITICAL: Randomize options array, then use index (0-3) of correct answer in randomized position'
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
      aiInstruction: 'CRITICAL: Provide COMPLETE sentence with NO blanks. System will auto-blank. Example: "A coach ensuring player safety is similar to government maintaining order" NOT "A coach ensuring player safety is similar to government _____"'
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
      counting: 'REQUIRED - use repeated emojis matching count (e.g., "🍎🍎🍎" for 3)',
      shape_identification: 'REQUIRED - object emoji in visual field (e.g., "🥅" for soccer goal)'
    },
    formats: {
      emoji: 'Direct emoji characters (e.g., "🍎🍎🍎")',
      description: 'Text description for complex visuals',
      null: 'null for no visual',
      placeholder: '"❓" to explicitly indicate text-only'
    },

    // CRITICAL COUNTING QUESTION RULES
    COUNTING_RULES: {
      visual_placement: 'ALWAYS put counting emojis in the visual field ONLY',
      question_format: [
        '✅ CORRECT: question: "How many items are there?", visual: "🏀👕👕"',
        '✅ CORRECT: question: "Count the objects above", visual: "🍎🍎🍎"',
        '✅ CORRECT: question: "How many does Coach have?", visual: "⚽⚽⚽⚽"',
        '❌ WRONG: question: "Coach sees 🏀👕👕. How many items are there?", visual: "🏀👕👕"',
        '❌ WRONG: question: "Count these: 🍎🍎🍎", visual: "🍎🍎🍎"'
      ],
      key_principle: 'NEVER duplicate counting emojis in both question text AND visual field',
      instructions: [
        '1. Place ALL counting emojis in the visual field',
        '2. Reference them generically in the question ("How many items/objects/things")',
        '3. Or reference them by context ("How many does [Career] have?")',
        '4. NEVER put the actual emojis in the question text itself'
      ],
      examples: {
        good: {
          question: 'How many sports items does Coach have?',
          visual: '⚽🏀🏈',
          correct_answer: 3
        },
        bad: {
          question: 'Coach has ⚽🏀🏈. How many items?',
          visual: '⚽🏀🏈',
          issue: 'Emojis appear in both question and visual - confusing!'
        }
      }
    }
  },

  // Shape Question Specific Rules (for K-2 grades)
  SHAPE_QUESTION_RULES: {
    identification: {
      visual: 'Show SINGLE-SHAPE objects only (see approved list below)',
      options: 'Use ONLY basic shape emojis: ⭕ ⬜ 🔺 ▬',

      // APPROVED single-shape objects for visual field
      APPROVED_OBJECTS: {
        circles: ['🏀', '⚽', '🎾', '🟠', '🔵', '🟢', '⭕'],
        squares: ['📦', '🎁', '⬜', '◼️', '🟦', '📺'],
        triangles: ['🔺', '⚠️', '📐', '🔻'],
        rectangles: ['📱', '🚪', '📋', '▬', '🟩']
      },

      // FORBIDDEN complex/multi-shape/free-form objects
      FORBIDDEN_OBJECTS: [
        '🚩 (flag - has pole + triangle)',
        '🥅 (goal - complex structure)',
        '🏠 (house - multiple shapes)',
        '⛺ (tent - complex)',
        '🎪 (circus tent - complex)',
        '🚗 (car - multiple shapes)',
        '✉️ (envelope - complex)',
        '⏰ (clock - circle + details)',
        '☁️ (cloud - free-form shape)',
        '🌊 (wave - free-form)',
        '🔥 (fire - free-form)',
        '💭 (thought bubble - free-form)',
        '🗨️ (speech bubble - complex)',
        '⚡ (lightning - free-form)',
        '🌟 (sparkle - complex star)',
        'ANY emoji that is not a clear, single geometric shape'
      ],

      // Basic shapes ONLY for kindergarten
      BASIC_SHAPES_ONLY: {
        allowed: ['circle', 'square', 'triangle', 'rectangle'],
        not_for_K: ['diamond', 'star', 'heart', 'oval', 'hexagon']
      },

      example_CORRECT: {
        question: 'What shape is this ball?',
        visual: '🏀',
        options: ['⭕', '⬜', '🔺', '▬'],
        correct_answer: 0,
        explanation: 'A basketball is a circle when we look at it'
      },

      example_WRONG: {
        question: 'What shape is the flag?',
        visual: '🚩',
        reason: 'FLAG IS NOT A SINGLE SHAPE - has pole and triangular flag part'
      }
    },

    matching: {
      instruction: 'Match simple shape to simple shape'
    },

    CRITICAL_RULES: [
      'ONLY use objects that are CLEARLY one geometric shape',
      'NEVER use complex objects with multiple shapes',
      'NEVER use free-form or organic shapes (clouds, flames, waves)',
      'NEVER use objects that combine shapes (flag = pole + triangle)',
      'For K grade: stick to circle, square, triangle, rectangle ONLY',
      'Options must ALWAYS be exactly [⭕, ⬜, 🔺, ▬] in randomized order',
      'Test: Is this a SINGLE, CLEAR, GEOMETRIC shape? If unsure, dont use it',
      'When in doubt, use the pure shape emoji itself (⭕ not 🏀)'
    ]
  },

  // Structure requirements
  STRUCTURE_RULES: {
    practice: {
      count: 'EXACTLY 5 questions - MANDATORY: Generate all 5 practice questions numbered 1-5',
      variety: 'Use at least 2 different question types',
      progression: 'Start simple, increase complexity',
      support: 'MUST include full practiceSupport structure',
      randomization: 'ALL multiple_choice options MUST be randomized',
      validation: '⚠️ RESPONSE REJECTED if practice array.length !== 5',
      enforcement: [
        'Practice array MUST contain exactly 5 elements',
        'Do NOT stop at 3 or 4 questions',
        'Generate ALL 5 questions before completing response',
        'Count your practice questions: 1, 2, 3, 4, 5',
        'If you have fewer than 5, add more until you have 5'
      ]
    },
    assessment: {
      count: 'EXACTLY 1 question',
      difficulty: 'Should test mastery of skill',
      no_support: 'No practiceSupport (assessment only)',
      randomization: 'ALL multiple_choice options MUST be randomized',
      mandatory_fields: 'MUST include: question, type, visual, correct_answer, hint, explanation, success_message',
      question_format: [
        '⚠️ MUST be an actual QUESTION, not a statement',
        '✅ CORRECT: "Which letter in the word \'Game\' is uppercase?"',
        '✅ CORRECT: "Is the letter E a consonant or a vowel?"',
        '✅ CORRECT: "How many items does the coach have?"',
        '❌ WRONG: "Show what you\'ve learned about consonants and vowels!"',
        '❌ WRONG: "Let\'s test your knowledge!"',
        '❌ WRONG: "Time to demonstrate your skills!"'
      ]
    },
    examples: {
      count: 'EXACTLY 3 worked examples',
      structure: 'question, answer, explanation, visual (optional)',
      randomization: 'ALL multiple_choice options MUST be randomized'
    }
  },

  // Option randomization requirements
  RANDOMIZATION_RULES: {
    multiple_choice: {
      required: true,
      instruction: 'ALWAYS randomize the order of options',
      process: [
        '1. Create your 4 options with the correct answer',
        '2. Randomize/shuffle the order of all options',
        '3. Set correct_answer to the NEW index position (0-3) of the correct option',
        '4. Never present options in sequential, alphabetical, or predictable order'
      ],
      example: {
        before: 'options: ["2", "4", "6", "8"], correct_answer: 2 (for "6")',
        after: 'options: ["6", "2", "8", "4"], correct_answer: 0 (for "6" in new position)'
      },
      validation: 'Options must appear in random order, not sequential or alphabetical'
    },
    applies_to: ['practice', 'assessment', 'examples', 'all question sets']
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
      missing_hint_in_assessment: 'Assessment MUST have hint field (not just practice)',
      wrong_index: 'multiple_choice uses 0-3, not 1-4',
      counting_no_visual: 'counting type REQUIRES visual with emojis',
      sequential_options: 'NEVER present multiple_choice options in sequential order (1,2,3,4)',
      alphabetical_options: 'NEVER present multiple_choice options in alphabetical order',
      unrandomized_options: 'ALWAYS randomize multiple_choice options before setting correct_answer index'
    },
    validation_checks: [
      'All mandatory fields present',
      'correct_answer format matches type',
      'visual field included (even if "❓" or null)',
      'practiceSupport complete for practice questions',
      'options array has exactly 4 items for multiple_choice'
    ]
  },

  // Grade-specific language constraints
  LANGUAGE_CONSTRAINTS: {
    K: {
      sentence_length: '3-5 words per sentence',
      vocabulary: 'Simple, common words only',
      instructions: 'One-step directions',
      examples: [
        'The cat is big.',
        'Count the red apples.',
        'Which shape is blue?'
      ],
      avoid: [
        'Complex sentences',
        'Multiple clauses',
        'Abstract concepts',
        'Compound instructions'
      ]
    },
    '1-2': {
      sentence_length: '5-8 words per sentence',
      vocabulary: 'Common words, simple concepts',
      instructions: 'Clear, single-step directions',
      examples: [
        'The big dog runs very fast.',
        'Add these two numbers together.',
        'Find all the triangles in the picture.'
      ]
    },
    '3-5': {
      sentence_length: '8-12 words per sentence',
      vocabulary: 'Grade-appropriate vocabulary with context clues',
      instructions: 'Can include two-step directions',
      examples: [
        'Scientists use tools to measure weather patterns every day.',
        'First, count the objects, then write the total number.',
        'Compare these two fractions and choose the larger one.'
      ]
    },
    '6-8': {
      sentence_length: '10-15 words per sentence',
      vocabulary: 'More complex vocabulary with academic terms',
      instructions: 'Multi-step processes with logical sequences',
      examples: [
        'Analyze the data in the graph to identify patterns and trends.',
        'Calculate the area of the rectangle, then find its perimeter.',
        'Evaluate how this historical event influenced modern society.'
      ]
    },
    '9-12': {
      sentence_length: 'Varied sentence structure',
      vocabulary: 'Advanced vocabulary and technical terms',
      instructions: 'Complex, multi-faceted tasks',
      examples: [
        'Synthesize information from multiple sources to develop a comprehensive understanding.',
        'Apply the quadratic formula to solve for x in the given equation.',
        'Critically evaluate the author\'s argument and identify potential biases.'
      ]
    }
  }
};

// Helper function to get ONLY language constraints for a grade
export function getLanguageConstraintsOnly(grade?: string): string {
  if (!grade) return '';

  const gradeNum = parseInt(grade);
  let constraintKey = '';

  if (grade === 'K' || grade === 'k' || grade === '0') {
    constraintKey = 'K';
  } else if (gradeNum >= 1 && gradeNum <= 2) {
    constraintKey = '1-2';
  } else if (gradeNum >= 3 && gradeNum <= 5) {
    constraintKey = '3-5';
  } else if (gradeNum >= 6 && gradeNum <= 8) {
    constraintKey = '6-8';
  } else if (gradeNum >= 9 && gradeNum <= 12) {
    constraintKey = '9-12';
  }

  if (constraintKey && UNIVERSALCONTENT_RULES.LANGUAGE_CONSTRAINTS[constraintKey]) {
    const constraints = UNIVERSALCONTENT_RULES.LANGUAGE_CONSTRAINTS[constraintKey];
    return `
LANGUAGE REQUIREMENTS FOR GRADE ${grade}:
  • Sentence Length: ${constraints.sentence_length}
  • Vocabulary: ${constraints.vocabulary}
  • Instructions: ${constraints.instructions}

  Good Examples:
${constraints.examples.map(e => `    "${e}"`).join('\n')}

  AVOID:
${constraints.avoid ? constraints.avoid.map(a => `    ✗ ${a}`).join('\n') : '    ✗ Overly complex language'}`;
  }

  return '';
}

// Helper function to generate the rules text for AI prompt
export function formatUniversalRulesForPrompt(grade?: string): string {
  // Determine which language constraints to apply
  let languageSection = '';
  if (grade) {
    const gradeNum = parseInt(grade);
    let constraintKey = '';
    
    if (grade === 'K' || grade === 'k' || grade === '0') {
      constraintKey = 'K';
    } else if (gradeNum >= 1 && gradeNum <= 2) {
      constraintKey = '1-2';
    } else if (gradeNum >= 3 && gradeNum <= 5) {
      constraintKey = '3-5';
    } else if (gradeNum >= 6 && gradeNum <= 8) {
      constraintKey = '6-8';
    } else if (gradeNum >= 9 && gradeNum <= 12) {
      constraintKey = '9-12';
    }
    
    if (constraintKey && UNIVERSALCONTENT_RULES.LANGUAGE_CONSTRAINTS[constraintKey]) {
      const constraints = UNIVERSALCONTENT_RULES.LANGUAGE_CONSTRAINTS[constraintKey];
      languageSection = `

LANGUAGE REQUIREMENTS FOR GRADE ${grade}:
  • Sentence Length: ${constraints.sentence_length}
  • Vocabulary: ${constraints.vocabulary}
  • Instructions: ${constraints.instructions}
  
  Good Examples:
${constraints.examples.map(e => `    "${e}"`).join('\n')}
  
  AVOID:
${constraints.avoid ? constraints.avoid.map(a => `    ✗ ${a}`).join('\n') : '    ✗ Overly complex language'}
`;
    }
  }
  
  return `
========================================
UNIVERSAL RULES (APPLY TO ALL QUESTIONS)
========================================

❌ FORBIDDEN TYPES (NEVER USE THESE):
${UNIVERSALCONTENT_RULES.FORBIDDEN_TYPES.map(t => `  ✗ ${t}`).join('\n')}

If you need to ask about ordering, use multiple_choice with ordered options instead.

MANDATORY FIELDS - Every question MUST include:
${UNIVERSALCONTENT_RULES.MANDATORY_FIELDS.all_questions.map(f => `  ✓ ${f}`).join('\n')}

Practice questions additionally REQUIRE:
  ✓ practiceSupport (full gamification structure)

Assessment questions additionally REQUIRE:
  ✓ success_message (personalized celebration)
  ✓ hint (MANDATORY - same as practice questions)
  ✓ MUST be an actual QUESTION (not "Show what you've learned...")

CORRECT_ANSWER FORMAT BY TYPE (CRITICAL):
${Object.entries(UNIVERSALCONTENT_RULES.ANSWER_FORMATS).map(([type, rules]) =>
  `  ${type}: ${rules.format} - ${rules.example}`
).join('\n')}

📝 FILL_BLANK SPECIFIC RULES (CRITICAL):
  1. PROVIDE COMPLETE STATEMENTS - NOT QUESTIONS!
     ✓ CORRECT: "A coach makes rules to help the team work well together"
     ✗ WRONG: "Why is teamwork important in a community?"
     ✗ WRONG: "What does a coach use to help the team?"

  2. MUST BE A STATEMENT, NEVER A QUESTION:
     ⚠️ NEVER end with a question mark (?)
     ⚠️ NEVER start with "Why", "What", "How", "When", "Where"
     ⚠️ ALWAYS use declarative sentences that state facts

  3. PROVIDE COMPLETE SENTENCES - NO BLANKS!
     ✓ CORRECT: "question": "A coach makes rules to help the team work well together"
     ✗ WRONG: "question": "A coach makes _____ to help the team work well together"

  4. ONE BLANK ONLY RULE (CRITICAL):
     ⚠️ The system will create exactly ONE blank from your sentence
     ⚠️ Your correct_answer must be a SINGLE WORD that will be blanked
     ⚠️ NEVER provide sentences expecting multiple blanks

  5. SENTENCE REQUIREMENTS:
     • Must be a STATEMENT, not a question
     • Must contain at least 8-10 words minimum
     • Must have ONE key concept word that will be blanked
     • Should have clear subject-verb-object structure
     • correct_answer should be ONE meaningful word (not articles/prepositions)
     • correct_answer must be a SINGLE WORD that appears in the sentence

  6. GOOD FILL_BLANK EXAMPLES (ALL STATEMENTS):
     • Sentence: "The coach develops strategic plays to help the team win"
       correct_answer: "strategic" (ONE word that will be blanked)
     • Sentence: "A coach makes rules to help the team work well together"
       correct_answer: "rules" (ONE word that will be blanked)
     • Sentence: "Teamwork is important in a community for helping each other"
       correct_answer: "community" (ONE word that will be blanked)

  7. BAD FILL_BLANK EXAMPLES:
     ✗ "Why is teamwork important in a community?" (QUESTION - not allowed!)
     ✗ "What does a coach do?" (QUESTION - not allowed!)
     ✗ "Coaches are leaders" (too short, no context)
     ✗ correct_answer: "players fair" (TWO words - system needs ONE)

⚠️ RANDOMIZATION REQUIREMENT (CRITICAL FOR ALL CONTAINERS):
For ALL multiple_choice questions across ALL containers (Learn, Discover, Experience, Assessment):
  ✓ MUST randomize/shuffle the order of options
  ✓ MUST update correct_answer to the NEW index after randomization
  ✓ NEVER present options in sequential order (1,2,3,4)
  ✓ NEVER present options in alphabetical order
  ✓ NEVER use predictable patterns

Example of CORRECT randomization:
  Original: options: ["2", "4", "6", "8"], correct_answer: 2 (for "6")
  Randomized: options: ["8", "2", "6", "4"], correct_answer: 2 (for "6" in position 2)

Example of INCORRECT (sequential):
  ✗ options: ["1", "2", "3", "4"]
  ✗ options: ["A", "B", "C", "D"]

VISUAL FIELD RULES:
  • ALWAYS include visual field
  • Use "${UNIVERSALCONTENT_RULES.VISUAL_RULES.placeholder}" or null for text-only questions
  • Use appropriate emojis for visual questions
  • Counting MUST have visual (e.g., "🍎🍎🍎" for count of 3)
  • Shape identification: Object in visual field (e.g., "🥅"), shapes in options

🔷 SHAPE QUESTION RULES (CRITICAL FOR K-2):

⚠️ SINGLE-SHAPE OBJECTS ONLY:
  ✓ APPROVED objects for visual field:
    • Circles: 🏀 ⚽ 🎾 🟠 🔵 ⭕
    • Squares: 📦 🎁 ⬜ ◼️ 🟦
    • Triangles: 🔺 ⚠️ 📐 🔻
    • Rectangles: 📱 🚪 📋 ▬ 🟩

  ❌ FORBIDDEN objects (DO NOT USE):
    • 🚩 (flag - has pole + triangle)
    • 🥅 (goal - complex structure)
    • 🏠 (house - multiple shapes)
    • ⛺ (tent - complex)
    • ☁️ (cloud - free-form, not geometric)
    • 🌊 (wave - free-form)
    • 🔥 (fire - free-form)
    • ⚡ (lightning - free-form)
    • Any object with multiple shapes
    • Any free-form or organic shapes
    • Any object that isn't CLEARLY one basic shape

  KINDERGARTEN RULES:
    • Options MUST be: [⭕, ⬜, 🔺, ▬]
    • Use ONLY: circle, square, triangle, rectangle
    • NO diamonds, stars, hearts, ovals for K grade

  ✅ CORRECT Example:
    question: "What shape is this ball?"
    visual: "🏀"
    options: ["⭕", "⬜", "🔺", "▬"]
    correct_answer: 0

  ❌ WRONG Example:
    question: "What shape is the flag?"
    visual: "🚩"  ← NO! Flag has multiple shapes!

PRACTICE SUPPORT STRUCTURE (Required for all practice questions):
${JSON.stringify(UNIVERSALCONTENT_RULES.PRACTICE_SUPPORT_TEMPLATE, null, 2)}

COMMON MISTAKES TO AVOID:
${Object.values(UNIVERSALCONTENT_RULES.ERROR_PREVENTION.common_mistakes).map(m => `  ✗ ${m}`).join('\n')}

STRUCTURE REQUIREMENTS:
  • Practice: EXACTLY 5 questions (MANDATORY - count them: 1, 2, 3, 4, 5)
  • Assessment: EXACTLY 1 question (MUST include hint field)
  • Examples: EXACTLY 3 worked examples

⚠️ CRITICAL REQUIREMENT:
  The "practice" array MUST contain exactly 5 question objects.
  Do NOT submit with fewer than 5 practice questions.
  Count them before submitting: Question 1 ✓ Question 2 ✓ Question 3 ✓ Question 4 ✓ Question 5 ✓
${languageSection}`;
}

// Type guards for validation
export function validateQuestionStructure(question: any): string[] {
  const errors: string[] = [];
  
  // Check mandatory fields
  for (const field of UNIVERSALCONTENT_RULES.MANDATORY_FIELDS.all_questions) {
    if (!(field in question)) {
      errors.push(`Missing mandatory field: ${field}`);
    }
  }
  
  // Validate correct_answer format
  if (question.type && question.correct_answer !== undefined) {
    const format = UNIVERSALCONTENT_RULES.ANSWER_FORMATS[question.type as keyof typeof UNIVERSALCONTENT_RULES.ANSWER_FORMATS];
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