# AI Content Generation Redesign: Proactive Architecture

## Current Problems with Reactive Approach

1. **No Control**: We ask AI to generate content and hope it follows our guidelines
2. **Inconsistent Types**: AI returns different types than requested
3. **Validation Nightmares**: We try to guess what type AI meant to send
4. **Grade Misalignment**: AI doesn't consistently respect grade-level appropriateness

## New Proactive Architecture

### 1. Question Type Matrix by Grade/Subject

```typescript
// Define exactly what types are appropriate for each grade/subject combination
const QUESTION_TYPE_MATRIX = {
  'K': {
    'Math': {
      primary: ['counting', 'multiple_choice'],
      secondary: ['true_false_with_visual'],
      forbidden: ['numeric', 'fill_blank', 'essay']
    },
    'ELA': {
      primary: ['multiple_choice', 'true_false_with_visual'],
      secondary: ['matching'],
      forbidden: ['counting', 'numeric', 'essay']
    },
    'Science': {
      primary: ['multiple_choice', 'true_false_with_visual'],
      secondary: ['matching'],
      forbidden: ['counting', 'numeric', 'essay']
    }
  },
  '1-2': {
    'Math': {
      primary: ['counting', 'numeric', 'multiple_choice'],
      secondary: ['true_false', 'matching'],
      forbidden: ['essay', 'formula']
    },
    'ELA': {
      primary: ['multiple_choice', 'fill_blank_simple'],
      secondary: ['true_false', 'matching'],
      forbidden: ['counting', 'essay']
    }
  },
  '3-5': {
    'Math': {
      primary: ['numeric', 'multiple_choice', 'word_problem'],
      secondary: ['true_false', 'fill_blank'],
      forbidden: ['counting'] // Too basic
    },
    'ELA': {
      primary: ['multiple_choice', 'fill_blank', 'short_answer'],
      secondary: ['true_false', 'matching', 'ordering'],
      forbidden: ['counting', 'numeric']
    }
  },
  '6-8': {
    'Math': {
      primary: ['numeric', 'formula', 'word_problem', 'multiple_choice'],
      secondary: ['true_false', 'graph_interpretation'],
      forbidden: ['counting']
    },
    'ELA': {
      primary: ['multiple_choice', 'short_answer', 'essay'],
      secondary: ['fill_blank', 'ordering', 'matching'],
      forbidden: ['counting', 'numeric']
    }
  }
};
```

### 2. Content Request Specification

Instead of asking AI to generate whatever it wants, we specify EXACTLY what we want:

```typescript
interface ContentGenerationRequest {
  skill: Skill;
  student: StudentProfile;
  career: Career;
  
  // EXPLICIT requirements
  requirements: {
    practice: {
      total: 5,
      distribution: {
        'multiple_choice': 2,
        'true_false': 1,
        'counting': 2  // For K-2 Math only
      }
    },
    assessment: {
      total: 1,
      type: 'multiple_choice' // Specific type for assessment
    }
  };
  
  // Visual requirements
  visualRequirements: {
    counting: 'required',      // Must have visuals
    true_false: 'optional',    // Can have visuals
    multiple_choice: 'none'    // No visuals needed
  };
}
```

### 3. Template-Based Generation

Create specific templates for each question type and have AI fill them:

```typescript
class QuestionTemplateEngine {
  generateCountingQuestion(context: Context): CountingQuestion {
    // We create the structure
    const template: CountingQuestion = {
      type: 'counting',
      question: '', // AI fills this
      visual: '',   // AI fills this with emojis/symbols
      correct_answer: 0, // AI fills this
      hint: '',     // AI fills this
      explanation: '' // AI fills this
    };
    
    // Send to AI with specific instructions
    const prompt = `
      Generate a counting question for ${context.skill} with ${context.career} context.
      
      REQUIREMENTS:
      - Question must ask "How many..."
      - Visual must use exactly ${context.targetNumber} emoji objects
      - Objects must relate to ${context.career}
      - Answer must be ${context.targetNumber}
      
      Fill this template:
      {
        "question": [Create a question about counting ${context.targetNumber} items related to ${context.career}],
        "visual": [Use exactly ${context.targetNumber} relevant emojis],
        "correct_answer": ${context.targetNumber},
        "hint": [Give a helpful counting tip],
        "explanation": [Explain why the answer is ${context.targetNumber}]
      }
    `;
    
    return aiService.fillTemplate(template, prompt);
  }
  
  generateMultipleChoiceQuestion(context: Context): MultipleChoiceQuestion {
    const template: MultipleChoiceQuestion = {
      type: 'multiple_choice',
      question: '',
      options: ['', '', '', ''], // Always 4 options
      correct_answer: 0, // Index of correct option
      hint: '',
      explanation: ''
    };
    
    // Similar specific prompt for multiple choice
    return aiService.fillTemplate(template, prompt);
  }
}
```

### 4. Validation Before Acceptance

```typescript
class ContentValidator {
  validateGeneratedContent(
    requested: ContentGenerationRequest,
    received: AIResponse
  ): ValidationResult {
    // Check that we got what we asked for
    for (const [type, count] of Object.entries(requested.requirements.practice.distribution)) {
      const actualCount = received.practice.filter(q => q.type === type).length;
      if (actualCount !== count) {
        return {
          valid: false,
          error: `Requested ${count} ${type} questions but got ${actualCount}`
        };
      }
    }
    
    // Validate each question structure
    for (const question of received.practice) {
      if (!this.validateQuestionStructure(question)) {
        return {
          valid: false,
          error: `Invalid structure for ${question.type} question`
        };
      }
    }
    
    return { valid: true };
  }
}
```

### 5. Fallback Content System

```typescript
class FallbackContentProvider {
  // If AI fails to deliver proper content, use pre-built templates
  private contentBank = {
    'K-Math-counting': [
      {
        type: 'counting',
        question: 'How many {objects} do you see?',
        visual: '{emoji_repeated}',
        correct_answer: '{number}',
        hint: 'Count each {object} carefully!',
        explanation: 'There are {number} {objects}!'
      }
    ],
    'K-Math-multiple_choice': [
      {
        type: 'multiple_choice',
        question: 'Which group has {number} {objects}?',
        options: [/* generated based on number */],
        correct_answer: 0,
        hint: 'Count the {objects} in each group',
        explanation: 'The first group has exactly {number} {objects}'
      }
    ]
  };
  
  generateFallbackContent(
    skill: Skill,
    career: Career,
    requirements: ContentRequirements
  ): Content {
    // Use templates and fill in career/skill context
    // This ensures we ALWAYS have valid content
  }
}
```

## Implementation Plan

### Phase 1: Define the Matrix
1. Create comprehensive grade/subject/type matrix
2. Define which types are appropriate for each combination
3. Set rules for visual requirements

### Phase 2: Request Specification
1. Build request objects that specify exactly what we want
2. Include counts, types, and constraints
3. Never leave it up to AI to decide

### Phase 3: Template Engine
1. Create templates for each question type
2. Have AI fill in the content, not create the structure
3. Ensure consistent format every time

### Phase 4: Validation Layer
1. Validate before accepting any AI content
2. Retry with more specific instructions if validation fails
3. Fall back to template content if AI consistently fails

### Phase 5: Monitoring & Improvement
1. Track which requests succeed/fail
2. Refine prompts based on success rates
3. Build up fallback content library

## Benefits of Proactive Approach

1. **Predictable Output**: We know exactly what we'll get
2. **Grade-Appropriate**: Types are pre-selected for grade level
3. **Easier Validation**: Structure is known in advance
4. **Better Error Handling**: Can detect and correct issues immediately
5. **Consistent UX**: Students get appropriate question types every time

## Example: Generating Content for K-Math Counting Skill

### Old Reactive Way:
```javascript
// Send vague request
const content = await ai.generate({
  skill: 'Counting to 5',
  grade: 'K',
  instructions: 'Generate some practice questions'
});
// Hope we get counting questions back
// Try to figure out what type each question is
// Attempt to validate and render
```

### New Proactive Way:
```javascript
// Specify exactly what we want
const request = {
  skill: { name: 'Counting to 5', subject: 'Math', grade: 'K' },
  requirements: {
    practice: {
      total: 5,
      distribution: {
        'counting': 3,      // 3 visual counting questions
        'multiple_choice': 1, // 1 "which group has X" question
        'true_false': 1     // 1 "this group has X items" question
      }
    }
  },
  visualRequirements: {
    'counting': 'required',
    'multiple_choice': 'optional',
    'true_false': 'required'
  }
};

// Generate with templates
const content = await contentEngine.generateStructuredContent(request);

// Validate we got what we asked for
const validation = validator.validate(request, content);
if (!validation.valid) {
  // Use fallback content
  content = fallbackProvider.generate(request);
}

// Render with confidence - we know exactly what we have
renderer.renderQuestions(content);
```

## Next Steps

1. Review and refine the question type matrix
2. Build the template engine
3. Create fallback content library
4. Implement validation layer
5. Test with real grade/subject combinations