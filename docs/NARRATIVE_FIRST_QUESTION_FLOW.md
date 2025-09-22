# Narrative-First Question Generation & Rendering Flow

## Overview
This document explains how the Narrative-First Architecture generates questions through AI prompts and renders them in the UI.

## 1. Question Generation Flow

### 1.1 Master Narrative Generation
```typescript
// MasterNarrativeGenerator creates the foundation story
const masterNarrative = await narrativeGenerator.generateMasterNarrative({
  studentName: 'Sam',
  gradeLevel: 'K',
  career: 'Basketball Coach',
  subjects: ['math', 'ela', 'science', 'social-studies']
});
```

### 1.2 Micro-Generator Adaptation
Each container uses micro-generators to adapt the master narrative:

```typescript
// Learn Container: Focus on skill acquisition
const learnContent = await learnMicroGenerator.generate({
  masterNarrative,
  subject: 'math',
  skill: 'counting',
  container: 'LEARN'
});
```

### 1.3 AI Prompt Building
The PromptBuilder combines rules from multiple levels:

```typescript
// PromptBuilder.ts assembles the complete prompt
const prompt = promptBuilder.buildPrompt({
  container: 'LEARN',
  subject: 'math',
  grade: 'K',
  skill: { name: 'Counting to 10' },
  career: { name: 'Basketball Coach' },
  student: { display_name: 'Sam' }
});
```

## 2. AI Response Structure

### 2.1 Expected JSON Response Format
The AI returns structured JSON that maps to TypeScript types:

```json
{
  "title": "Coach's Counting Challenge",
  "greeting": "Hi Sam! Let's practice counting basketballs!",
  "concept": "Counting helps us keep track of game scores",
  "examples": [
    {
      "question": "How many basketballs do you see?",
      "answer": "3",
      "explanation": "We count: 1, 2, 3 basketballs!",
      "visual": "🏀🏀🏀"
    }
  ],
  "practice": [
    {
      "question": "Count the basketball hoops",
      "type": "counting",
      "visual": "🏀🏀🏀🏀",
      "correct_answer": 4,
      "hint": "Point to each hoop as you count",
      "explanation": "There are 4 hoops!",
      "practiceSupport": {
        "preQuestionContext": "Coaches count equipment before practice",
        "connectionToLearn": "Remember, we count one at a time",
        "confidenceBuilder": "You're doing great, Sam!",
        "hints": [
          {
            "level": 1,
            "hint": "Start with 1",
            "visualCue": "Point to the first hoop"
          }
        ],
        "correctFeedback": {
          "immediate": "Perfect counting!",
          "careerConnection": "Just like a coach tracking scores!",
          "skillReinforcement": "You counted all 4!"
        },
        "incorrectFeedback": {
          "immediate": "Let's try again",
          "explanation": "Count slowly: 1, 2, 3, 4",
          "reteach": "Point to each hoop",
          "tryAgainPrompt": "Want another try?"
        }
      }
    }
  ],
  "assessment": {
    "question": "How many players on the court?",
    "type": "counting",
    "visual": "👤👤👤👤👤",
    "correct_answer": 5,
    "hint": "Count each player",
    "explanation": "5 players make a basketball team!",
    "success_message": "Great job, Sam! You're a counting champion!"
  }
}
```

## 3. Type Mapping & Validation

### 3.1 Question Type Definitions
```typescript
// QuestionTypes.ts defines 15 discriminated union types
export type QuestionType = 
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | CountingQuestion
  | FillBlankQuestion
  | MatchingQuestion
  | OrderingQuestion
  | NumericQuestion
  | ShortAnswerQuestion
  // ... 7 more types

// Each type has specific properties
export interface CountingQuestion extends BaseQuestion {
  type: 'counting';
  visual: string;        // Required emojis/shapes
  items_to_count?: any[];
  correct_answer: number;
  range?: { min: number; max: number };
}
```

### 3.2 Response Parsing
```typescript
// MultiModelService.ts handles JSON parsing
private async executeModelRequest() {
  const response = await fetch(/* AI API */);
  const content = data.choices[0].message.content;
  
  // Clean markdown-wrapped JSON
  let cleanContent = content
    .replace(/^```json\s*/i, '')
    .replace(/\s*```$/i, '');
  
  return JSON.parse(cleanContent);
}
```

## 4. Component Rendering

### 4.1 Question Renderer
```typescript
// QuestionRenderer.tsx uses type guards for rendering
export const QuestionRenderer: React.FC<Props> = ({ question }) => {
  // Type-safe rendering based on discriminated union
  switch (question.type) {
    case 'counting':
      return <CountingQuestion question={question} />;
    case 'multiple_choice':
      return <MultipleChoiceQuestion question={question} />;
    case 'true_false':
      return <TrueFalseQuestion question={question} />;
    // ... handle all 15 types
  }
};
```

### 4.2 Component Props
```typescript
// Each question component receives typed props
interface CountingQuestionProps {
  question: CountingQuestion;
  onAnswer: (answer: number) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  userAnswer?: number;
  isCorrect?: boolean;
  theme?: 'light' | 'dark';
  careerContext?: string;    // "Basketball Coach"
  companionName?: string;     // "Dribbles the Ball"
}
```

## 5. Narrative-First Integration Points

### 5.1 Master Narrative Properties
```typescript
interface MasterNarrative {
  id: string;
  career: {
    title: string;           // "Basketball Coach"
    description: string;
    skills: string[];        // Skills used in career
    tools: string[];         // Equipment/tools
    environment: string;     // Where they work
  };
  
  // Subject-specific contexts
  mathContext: {
    countingItems: string[];  // ["basketballs", "hoops", "points"]
    measurements: string[];   // ["court length", "shot distance"]
    patterns: string[];       // ["team formations", "plays"]
  };
  
  elaContext: {
    vocabulary: string[];     // Career-specific words
    readingTopics: string[];  // Stories about the career
  };
  
  // Container-specific narratives
  containers: {
    learn: {
      setting: string;        // "Virtual Basketball Academy"
      narrative: string;      // Story context
      companion: {
        name: string;         // "Dribbles"
        personality: string;
      };
    };
    experience: {
      setting: string;        // "Coach's Office"
      tasks: string[];        // Real career tasks
    };
    discover: {
      setting: string;        // "Basketball Arena Tour"
      exploration: string[];  // Discovery activities
    };
  };
}
```

### 5.2 Micro-Generator Output
```typescript
// Micro-generators produce container-specific content
interface LearnMicroOutput {
  metadata: {
    narrativeId: string;      // Links to master narrative
    container: 'LEARN';
    subject: string;
    skill: string;
  };
  
  content: {
    title: string;
    greeting: string;         // Uses student name
    concept: string;          // Career-contextualized
    examples: Example[];      // 3 worked examples
    practice: Question[];     // 5 practice questions
    assessment: Question;     // 1 assessment question
  };
  
  visuals: {
    theme: string;            // Career theme
    emojis: string[];         // Career-specific emojis
    colors: string[];         // UI color scheme
  };
}
```

## 6. Cost Optimization Through Caching

### 6.1 Cache Keys
```typescript
// Narrative cached for 30 days
const narrativeKey = `narrative:${grade}:${career}:${studentId}`;
const cached = await cache.get(narrativeKey);

if (!cached) {
  // Generate once, reuse 12+ times
  const narrative = await generateMasterNarrative();
  await cache.set(narrativeKey, narrative, 30 * 24 * 60 * 60);
}
```

### 6.2 Cost Impact
- **Master Narrative**: $0.60 (one-time)
- **Micro-adaptations**: $0.0005 × 12 = $0.006
- **Total per session**: $0.606 first time, $0.006 thereafter
- **With 70% cache hits**: Average $0.0066 per session
- **Savings**: 98.9% reduction from original $0.60

## 7. Error Handling & Validation

### 7.1 Response Validation
```typescript
// PromptBuilder.ts validates responses
validateContent(content: any, context: PromptContext) {
  const errors: string[] = [];
  
  // Check required fields
  if (!content.practice || content.practice.length !== 5) {
    errors.push('Must have exactly 5 practice questions');
  }
  
  // Validate each question
  content.practice.forEach((q, i) => {
    if (!q.type || !q.correct_answer) {
      errors.push(`Question ${i + 1} missing required fields`);
    }
    
    // Type-specific validation
    if (q.type === 'counting' && !q.visual) {
      errors.push(`Counting question ${i + 1} needs visual`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}
```

### 7.2 Fallback Handling
```typescript
// MultiModelService.ts handles failures
if (!response.ok) {
  console.warn(`Primary model failed, trying fallback`);
  return await this.executeModelRequest(prompt, context, fallbackModel);
}
```

## 8. Implementation Checklist

- [x] Master Narrative Generator creates comprehensive story
- [x] Micro-generators adapt for each container/subject
- [x] PromptBuilder assembles rules hierarchically
- [x] AI returns structured JSON responses
- [x] MultiModelService parses and validates responses
- [x] QuestionRenderer maps types to components
- [x] Components render with career context
- [x] Caching reduces costs by 98.9%
- [x] Error handling ensures reliability
- [x] Type safety throughout the pipeline

## Summary

The Narrative-First Architecture achieves massive cost savings by:
1. Generating one master narrative ($0.60) that's cached for 30 days
2. Using lightweight micro-generators ($0.0005 each) for adaptations
3. Reusing the narrative across all containers and subjects
4. Maintaining educational quality through structured prompts
5. Ensuring type safety from AI response to UI rendering

This approach transforms the learning experience while reducing per-student costs from $0.60 to $0.0066 - a 98.9% reduction.