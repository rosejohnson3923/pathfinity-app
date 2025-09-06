# Hierarchical Rules System - Implementation Plan

## Overview
Refactor the AI prompt generation to use a three-tier hierarchical rule system that eliminates redundancy and ensures consistency across all subjects and containers.

## Current Problems
1. **Repetitive Rules**: Same rules repeated for each subject
2. **Missing Fields**: ELA true_false questions missing `correct_answer` 
3. **Inconsistent Formatting**: Different rules structure per subject
4. **Maintenance Burden**: Changes need to be made in multiple places
5. **AI Confusion**: Mixed instructions causing format errors

## Proposed Architecture

### 1. File Structure Changes

```
src/services/ai-prompts/
├── rules/
│   ├── UniversalRules.ts        # Core rules for ALL questions
│   ├── SubjectRules.ts          # Subject-specific overrides
│   └── ContainerRules.ts        # Container-specific additions
├── templates/
│   ├── QuestionTemplate.ts      # JSON structure templates
│   └── ResponseTemplate.ts      # Expected response format
└── PromptBuilder.ts             # Combines rules into final prompt
```

### 2. Universal Rules (UniversalRules.ts)

```typescript
export const UNIVERSAL_RULES = {
  // CRITICAL: Rules that MUST apply to every single question
  MANDATORY_FIELDS: {
    all_questions: [
      'question',      // The question text
      'type',         // Question type (from approved list)
      'visual',       // ALWAYS required (use "❓" for text-only, null accepted)
      'correct_answer', // ALWAYS required (format varies by type)
      'hint',         // Helpful hint for students
      'explanation'   // Why this answer is correct
    ],
    practice_specific: [
      'practiceSupport'  // REQUIRED: Detailed gamified support structure
    ],
    assessment_specific: [
      'success_message'  // Celebration message
    ]
  },
  
  // GAMIFIED PRACTICE SUPPORT STRUCTURE (Required for practice questions)
  PRACTICE_SUPPORT_STRUCTURE: {
    preQuestionContext: 'string - Sets career/skill context before question',
    connectionToLearn: 'string - Connects to prior knowledge',
    confidenceBuilder: 'string - Personal encouragement using student name',
    hints: {
      description: 'Array of 3 progressive hints',
      structure: [
        { level: 1, hint: 'Gentle nudge', visualCue: 'What to look for' },
        { level: 2, hint: 'More specific', example: 'Concrete example' },
        { level: 3, hint: 'Step-by-step', example: 'Complete walkthrough' }
      ]
    },
    correctFeedback: {
      immediate: 'string - Instant positive reinforcement',
      careerConnection: 'string - Links success to career skills',
      skillReinforcement: 'string - Bridges to next learning'
    },
    incorrectFeedback: {
      immediate: 'string - Supportive response',
      explanation: 'string - Clear explanation of correct answer',
      reteach: 'string - What we\'ll review',
      tryAgainPrompt: 'string - Encourage retry'
    },
    teachingMoment: {
      conceptExplanation: 'string - Deep understanding of concept',
      realWorldExample: 'string - Career-specific application',
      commonMistakes: 'array - List of typical errors to avoid'
    }
  },

  // Format rules by question type
  ANSWER_FORMATS: {
    true_false: {
      format: 'boolean',
      example: 'true or false (NOT "true" or "false" strings)',
      validation: 'Must be boolean value'
    },
    multiple_choice: {
      format: 'number',
      example: '0, 1, 2, or 3 (index of correct option)',
      validation: 'Must be 0-3 for array index'
    },
    counting: {
      format: 'number',
      example: '5 (the count)',
      validation: 'Must be positive integer'
    },
    numeric: {
      format: 'number',
      example: '42',
      validation: 'Must be number'
    },
    fill_blank: {
      format: 'string',
      example: '"answer"',
      validation: 'Must be string'
    },
    short_answer: {
      format: 'string',
      example: '"The answer text"',
      validation: 'Must be string'
    }
  },

  // Visual field rules
  VISUAL_RULES: {
    placeholder: '❓',
    usage: {
      text_only: 'Use "❓" when no visual support needed',
      with_visual: 'Use appropriate emojis or description',
      counting: 'REQUIRED - use repeated emojis matching count'
    }
  },

  // Structure rules
  STRUCTURE_RULES: {
    practice_count: 'EXACTLY 5 practice questions',
    assessment_count: 'EXACTLY 1 assessment question',
    type_variety: 'Use at least 2 different question types in practice',
    difficulty_progression: 'Start simple, increase complexity'
  }
};
```

### 3. Subject Rules (SubjectRules.ts)

```typescript
export const SUBJECT_RULES = {
  MATH: {
    // What types are allowed/preferred
    ALLOWED_TYPES: {
      'K-2': ['counting', 'multiple_choice', 'true_false', 'numeric'],
      '3-5': ['numeric', 'multiple_choice', 'true_false', 'fill_blank'],
      '6-8': ['numeric', 'multiple_choice', 'true_false', 'fill_blank', 'short_answer'],
      '9-12': ['all types allowed']
    },
    
    // Subject-specific patterns
    PATTERNS: {
      how_many: {
        'K-2': 'MUST use "counting" type with visual emojis',
        '3+': 'MUST use "numeric" type'
      },
      word_problems: 'Use multiple_choice or numeric',
      equations: 'Use fill_blank or numeric'
    },
    
    // Visual requirements
    VISUALS: {
      counting: 'REQUIRED - use career-appropriate emojis',
      other: 'OPTIONAL - use "❓" if not needed'
    }
  },

  ELA: {
    // Strict type restrictions
    FORBIDDEN_TYPES: ['counting'],  // NEVER use counting for ELA
    
    ALLOWED_TYPES: {
      all_grades: ['multiple_choice', 'true_false', 'fill_blank', 'short_answer']
    },
    
    PATTERNS: {
      letter_identification: 'MUST use multiple_choice',
      phonics: 'MUST use multiple_choice',
      reading_comprehension: 'Can use true_false or multiple_choice',
      vocabulary: 'Use fill_blank or multiple_choice',
      grammar: 'Use multiple_choice or fill_blank'
    },
    
    SPECIAL_RULES: {
      never_count: 'NEVER ask "How many letters" - ask "Which letter" instead',
      true_false: 'Use for comprehension facts only'
    }
  },

  SCIENCE: {
    FORBIDDEN_TYPES: ['counting'],
    
    PATTERNS: {
      observations: 'Use multiple_choice',
      facts: 'Use true_false',
      vocabulary: 'Use fill_blank or multiple_choice',
      processes: 'Use ordering or multiple_choice'
    },
    
    VISUALS: {
      phenomena: 'Include relevant emojis (🌡️, 💧, 🌱, etc.)',
      text_facts: 'Use "❓" placeholder'
    }
  },

  SOCIAL_STUDIES: {
    FORBIDDEN_TYPES: ['counting'],
    
    PATTERNS: {
      geography: 'Use true_false or multiple_choice',
      history: 'Use multiple_choice or true_false',
      civics: 'Use multiple_choice',
      culture: 'Use multiple_choice with descriptive options'
    }
  }
};
```

### 4. Container Rules (ContainerRules.ts)

```typescript
export const CONTAINER_RULES = {
  LEARN: {
    CONTEXT: {
      career_integration: 'Include career context in questions',
      real_world: 'Connect to real-world applications',
      progression: 'Build from simple recall to application'
    },
    
    TONE: {
      instruction: 'Clear and educational',
      encouragement: 'Supportive and positive',
      feedback: 'Detailed explanations'
    },
    
    STRUCTURE: {
      examples: '3 worked examples showing concept',
      practice: '5 practice questions with full support',
      assessment: '1 culminating assessment'
    }
  },

  DISCOVER: {
    CONTEXT: {
      exploration: 'Focus on "what if" scenarios',
      curiosity: 'Encourage investigation',
      patterns: 'Help identify patterns and relationships'
    },
    
    TONE: {
      wonder: 'Spark curiosity',
      open_ended: 'Allow for exploration',
      discovery: 'Celebrate "aha" moments'
    }
  },

  EXPERIENCE: {
    CONTEXT: {
      hands_on: 'Simulate real activities',
      practical: 'Focus on doing and creating',
      project_based: 'Build toward a goal'
    },
    
    TONE: {
      active: 'Action-oriented language',
      creative: 'Encourage creativity',
      collaborative: 'Suggest sharing or teamwork'
    }
  }
};
```

### 5. Prompt Builder (PromptBuilder.ts)

```typescript
export class PromptBuilder {
  buildPrompt(
    container: string,
    subject: string,
    grade: string,
    skill: any,
    career: any,
    student: any
  ): string {
    // 1. Start with universal rules
    let rulesSection = this.formatUniversalRules();
    
    // 2. Add subject-specific rules
    rulesSection += this.formatSubjectRules(subject, grade);
    
    // 3. Add container-specific rules
    rulesSection += this.formatContainerRules(container);
    
    // 4. Build complete prompt
    return `
You are an expert educational content creator.

${rulesSection}

TASK: Generate a ${container} learning experience for:
- Student: ${student.display_name} (Grade ${grade})
- Subject: ${subject}
- Skill: ${skill.name}
- Career Context: ${career.name}

${this.getResponseTemplate()}
`;
  }
  
  private formatUniversalRules(): string {
    return `
===== UNIVERSAL RULES (APPLY TO ALL QUESTIONS) =====

MANDATORY FIELDS - Every question MUST have:
${UNIVERSAL_RULES.MANDATORY_FIELDS.all_questions.map(f => `  - ${f}`).join('\n')}

ANSWER FORMAT BY TYPE:
${Object.entries(UNIVERSAL_RULES.ANSWER_FORMATS).map(([type, rules]) => 
  `  ${type}: ${rules.format} (e.g., ${rules.example})`
).join('\n')}

VISUAL FIELD RULES:
- ALWAYS include visual field
- Use "${UNIVERSAL_RULES.VISUAL_RULES.placeholder}" for text-only questions
- Use appropriate emojis for visual questions

CRITICAL: 
- true_false MUST have correct_answer as boolean (true/false)
- multiple_choice MUST have correct_answer as index (0-3)
- ALL questions MUST include ALL mandatory fields
`;
  }
  
  private formatSubjectRules(subject: string, grade: string): string {
    const rules = SUBJECT_RULES[subject];
    if (!rules) return '';
    
    return `
===== ${subject} SPECIFIC RULES =====

${rules.FORBIDDEN_TYPES ? `NEVER use these types: ${rules.FORBIDDEN_TYPES.join(', ')}` : ''}

Allowed types for grade ${grade}:
${this.getAllowedTypes(rules, grade)}

Pattern rules:
${this.getPatternRules(rules, grade)}
`;
  }
  
  private formatContainerRules(container: string): string {
    const rules = CONTAINER_RULES[container];
    if (!rules) return '';
    
    return `
===== ${container} CONTAINER RULES =====

Context: ${Object.values(rules.CONTEXT).join(', ')}
Tone: ${Object.values(rules.TONE).join(', ')}
${rules.STRUCTURE ? `Structure: ${JSON.stringify(rules.STRUCTURE)}` : ''}
`;
  }
}
```

### 6. Changes to AILearningJourneyService.ts

```typescript
// BEFORE: Inline rules mixed with prompt
private async generateLearnContent() {
  const prompt = `
    [200+ lines of mixed rules and instructions]
  `;
}

// AFTER: Clean separation
private async generateLearnContent() {
  const promptBuilder = new PromptBuilder();
  const prompt = promptBuilder.buildPrompt(
    'LEARN',
    skill.subject,
    student.grade_level,
    skill,
    career,
    student
  );
  
  // Much cleaner and maintainable!
}
```

## Implementation Steps

### Phase 1: Create Rule Files
1. Create `src/services/ai-prompts/` directory
2. Implement `UniversalRules.ts` with mandatory fields
3. Implement `SubjectRules.ts` with subject-specific rules
4. Implement `ContainerRules.ts` with container variations

### Phase 2: Build Prompt Builder
1. Create `PromptBuilder.ts` class
2. Implement rule merging logic
3. Add grade-appropriate filtering
4. Create response template formatter

### Phase 3: Integration
1. Update `AILearningJourneyService.ts` to use PromptBuilder
2. Remove inline rules from existing prompts
3. Test with all subjects and grades
4. Verify ELA true_false now includes correct_answer

### Phase 4: Extend to Other Services
1. Apply to `generateDiscoverContent()`
2. Apply to `generateExperienceContent()`
3. Apply to `generateAssessmentContent()`

## Benefits

1. **DRY Principle**: Rules defined once, used everywhere
2. **Maintainability**: Change rules in one place
3. **Consistency**: Universal rules ensure all required fields
4. **Debugging**: Clear rule hierarchy makes issues obvious
5. **Extensibility**: Easy to add new subjects/containers
6. **Type Safety**: TypeScript interfaces for all rules
7. **Testing**: Can unit test each rule set independently

## Example: How This Fixes ELA True/False

**Current Problem**: ELA true_false missing `correct_answer`

**How Hierarchical Rules Fix It**:
1. Universal rule MANDATES `correct_answer` for ALL questions
2. Universal rule specifies format: boolean for true_false
3. Subject rule (ELA) can't override mandatory fields
4. Result: ELA true_false MUST include `correct_answer: true/false`

## Example: Complete Question Structure

```json
{
  "question": "True or False: The main idea is always in the first sentence.",
  "type": "true_false",
  "visual": "❓",
  "correct_answer": false,
  "hint": "Think about different paragraph structures.",
  "explanation": "The main idea can appear anywhere in a paragraph.",
  "practiceSupport": {
    "preQuestionContext": "Corporate Lawyers analyze documents to find main ideas quickly.",
    "connectionToLearn": "You've seen main ideas in different places before.",
    "confidenceBuilder": "You're doing great, Taylor!",
    "hints": [
      {
        "level": 1,
        "hint": "Where have you seen main ideas before?",
        "visualCue": "Think about topic sentences."
      },
      {
        "level": 2,
        "hint": "Sometimes the main idea comes at the end.",
        "example": "Like a conclusion that summarizes."
      },
      {
        "level": 3,
        "hint": "The answer is False.",
        "example": "Main ideas can be anywhere - beginning, middle, or end."
      }
    ],
    "correctFeedback": {
      "immediate": "Excellent! You understand document structure.",
      "careerConnection": "Corporate Lawyers know to scan entire documents!",
      "skillReinforcement": "Let's explore more complex texts."
    },
    "incorrectFeedback": {
      "immediate": "That's okay! This is a common misconception.",
      "explanation": "Main ideas can appear anywhere in a paragraph.",
      "reteach": "We'll practice identifying main ideas in different positions.",
      "tryAgainPrompt": "Want to reconsider?"
    },
    "teachingMoment": {
      "conceptExplanation": "Main ideas are the central point, regardless of position.",
      "realWorldExample": "Lawyers scan entire contracts to find key clauses.",
      "commonMistakes": ["Assuming first sentence is always the main idea"]
    }
  }
}

## Migration Strategy

1. **Parallel Implementation**: Build new system alongside old
2. **A/B Testing**: Test with select grade/subject combinations
3. **Gradual Rollout**: Start with one container (LEARN)
4. **Monitor**: Track AI response quality metrics
5. **Full Migration**: Once validated, remove old system

## Success Metrics

- ✅ No validation errors for missing fields
- ✅ Consistent answer formats across subjects
- ✅ Reduced prompt size (remove duplication)
- ✅ Faster development of new features
- ✅ Improved AI response quality
- ✅ Easier debugging and maintenance

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| AI confusion with new format | Extensive testing with all grade/subject combos |
| Breaking existing functionality | Parallel implementation, gradual rollout |
| Complex rule interactions | Clear hierarchy, comprehensive logging |
| Performance impact | Rules cached, built once per request |

## Timeline

- Day 1-2: Create rule files and PromptBuilder
- Day 3: Integrate with LEARN container
- Day 4: Test all subject/grade combinations
- Day 5: Fix issues, optimize
- Day 6-7: Extend to other containers
- Day 8: Full deployment

## Next Steps

1. Review and approve this plan
2. Create the directory structure
3. Implement UniversalRules first (fixes immediate issue)
4. Build incrementally with testing at each step