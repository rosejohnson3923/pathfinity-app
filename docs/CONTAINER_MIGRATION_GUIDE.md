# Container Migration Guide
## Migrating to AIRulesEngine Architecture

### Overview
This guide explains how to migrate existing containers to use the new AIRulesEngine architecture, which fixes all diagnostic practice bugs and centralizes business logic.

---

## ✅ Fixed Bugs
1. **Correct answers marked wrong** - Fixed via type coercion in LearnAIRulesEngine
2. **ELA showing math questions** - Fixed via subject-specific rules
3. **Counting questions format** - Fixed via visual field requirement
4. **Questions changing before interaction** - Fixed via state locking

---

## 🔄 Migration Steps

### Step 1: Import Rules Engine Integration

Replace old imports:
```typescript
// OLD
import { validateAnswer } from '../../services/answerValidation';
import { questionGenerator } from '../../services/questionGenerator';

// NEW
import { 
  useLearnRules, 
  useCompanionRules, 
  useGamificationRules,
  useMasterOrchestration 
} from '../../rules-engine/integration/ContainerIntegration';
```

### Step 2: Initialize Rules Hooks

In your component:
```typescript
const learnRules = useLearnRules();
const companionRules = useCompanionRules();
const gamificationRules = useGamificationRules();
```

### Step 3: Replace Answer Validation

#### OLD WAY (Bug-prone):
```typescript
const isCorrect = answer === question.correct_answer || 
                 String(answer).toLowerCase() === String(question.correct_answer).toLowerCase();
```

#### NEW WAY (Bug-fixed):
```typescript
const validationResult = await learnRules.validateAnswer(
  question.type,
  answer,
  question.correct_answer,
  skill.subject,
  student.grade
);

const isCorrect = validationResult.isCorrect;
// validationResult also includes:
// - feedback: string
// - rulesApplied: object showing which rules were used
```

### Step 4: Replace Question Type Selection

#### OLD WAY:
```typescript
// Hardcoded logic scattered across components
const questionType = subject === 'math' ? 'numeric' : 'multiple_choice';
```

#### NEW WAY:
```typescript
const { type, allowedTypes, reason } = await learnRules.selectQuestionType(
  subject,
  grade,
  questionContext
);
// Automatically prevents ELA from using counting type
// Ensures math "How many" questions use counting with visual
```

### Step 5: Apply Career Context

#### OLD WAY:
```typescript
// Manual string replacement
question.question = question.question.replace('items', careerVocab[career]);
```

#### NEW WAY:
```typescript
const enhancedQuestion = await learnRules.applyCareerContext(
  question,
  career,
  subject,
  grade
);
// Automatically applies:
// - Career-specific vocabulary
// - Contextual scenarios
// - Visual theming
```

### Step 6: Get Companion Messages

#### OLD WAY:
```typescript
const message = companionMessages[character][trigger] || 'Keep going!';
```

#### NEW WAY:
```typescript
const { message, emotion, animation } = await companionRules.getCompanionMessage(
  companionId,
  career,
  triggerType,
  context
);
// Career-adapted messages with 15 career variations
```

### Step 7: Calculate XP

#### OLD WAY:
```typescript
const xp = isCorrect ? 10 : 0;
```

#### NEW WAY:
```typescript
const xp = await gamificationRules.calculateXP(action, {
  studentId,
  level,
  streak,
  firstTry
});
// Dynamic XP based on multiple factors
```

---

## 📦 Complete Example: AILearnContainer Migration

### Before (AILearnContainer.tsx):
```typescript
// Scattered validation logic
const isCorrect = answer === question.correct_answer;

// Hardcoded question types
const type = 'multiple_choice';

// Static companion messages
const message = 'Good job!';
```

### After (AILearnContainerV2.tsx):
```typescript
export const AILearnContainerV2 = () => {
  // Initialize rules
  const learnRules = useLearnRules();
  const companionRules = useCompanionRules();
  
  // Validate with rules engine
  const handleAnswer = async (answer) => {
    const result = await learnRules.validateAnswer(
      question.type,
      answer,
      question.correct_answer,
      subject,
      grade
    );
    
    // Get dynamic companion message
    const companion = await companionRules.getCompanionMessage(
      character,
      career,
      result.isCorrect ? 'correct' : 'incorrect',
      { grade, attempts }
    );
    
    setCompanionMessage(companion.message);
  };
};
```

---

## 🎯 MultiSubjectContainer Migration

### Key Changes Needed:

1. **Import Integration Module**
```typescript
import { useLearnRules, useMasterOrchestration } from '../../rules-engine/integration/ContainerIntegration';
```

2. **Replace Validation in handleAnswerSubmit**
```typescript
// Line ~450 in MultiSubjectContainer.tsx
const validationResult = await learnRules.validateAnswer(
  currentQuestion.type,
  selectedAnswer,
  currentQuestion.correct_answer,
  currentSubject,
  userProfile.grade
);
```

3. **Use Rules for Question Selection**
```typescript
// When generating questions
const { type } = await learnRules.selectQuestionType(
  subject,
  grade,
  { type: 'diagnostic' }
);
```

4. **Apply Career Context**
```typescript
// Enhance questions with career context
questions = await Promise.all(
  questions.map(q => learnRules.applyCareerContext(q, career, subject, grade))
);
```

---

## 🧪 Testing the Migration

### Test Checklist:
- [ ] Counting questions accept both string and number answers
- [ ] ELA never shows counting type questions
- [ ] Math "How many" questions have visual field
- [ ] Questions don't change after generation
- [ ] Career context appears in questions
- [ ] Companion messages vary by career
- [ ] XP calculations are dynamic
- [ ] Theme rules apply correctly

### Validation Commands:
```typescript
// Test answer validation
console.log(await learnRules.validateAnswer('counting', '5', 5, 'math', 'K'));
// Should return: { isCorrect: true, ... }

// Test question type selection
console.log(await learnRules.selectQuestionType('ela', '2'));
// Should never include 'counting' in allowedTypes

// Test diagnostic fixes status
console.log(containerIntegration.getDiagnosticFixesStatus());
// Should show all fixes as true
```

---

## 🚀 Deployment Strategy

### Phase 1: Parallel Deployment
1. Deploy AILearnContainerV2 alongside AILearnContainer
2. Use feature flag to control which version loads
3. A/B test with subset of users

### Phase 2: Gradual Migration
1. Monitor error rates and user feedback
2. Fix any edge cases discovered
3. Increase percentage of users on V2

### Phase 3: Complete Migration
1. Update all containers to use rules engine
2. Remove old validation code
3. Archive legacy components

---

## 📊 Success Metrics

Monitor these metrics post-migration:

1. **Bug Reduction**
   - Correct answer validation errors: Should drop to 0
   - Wrong question type errors: Should drop to 0
   
2. **Performance**
   - Answer validation time: < 50ms
   - Question generation time: < 200ms
   
3. **User Experience**
   - Completion rates: Should increase
   - User frustration reports: Should decrease

---

## 🆘 Troubleshooting

### Common Issues:

**Issue**: Rules engine not found
**Solution**: Ensure all engines are imported from integration module

**Issue**: Validation always returns false
**Solution**: Check that question type is correctly set

**Issue**: Career context not applying
**Solution**: Verify career object has id and name properties

**Issue**: XP not calculating
**Solution**: Ensure gamification context includes required fields

---

## 📚 Additional Resources

- [AIRulesEngine Architecture](./AIRulesEngine-Architecture.md)
- [Implementation Plan](./AIRulesEngine-Implementation-Plan-v2.md)
- [Phase 3 Validation](./PHASE3_VALIDATION.md)
- [API Documentation](./API_DOCUMENTATION.md)

---

**Migration Support**: Contact the development team for assistance with migration issues.