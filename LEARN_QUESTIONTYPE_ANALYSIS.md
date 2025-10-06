# LEARN Container QuestionType Analysis

## Problem Summary

The NEW enriched generator is creating LEARN activities as **scenario-based challenges** instead of **QuestionType-based practice questions**. The LEARN container should use QuestionTypes for practice and assessment, NOT scenarios.

## OLD vs NEW Comparison

### OLD (Demonstrative - DemoLessonContent.ts) ✅ CORRECT FORMAT

**Data Structure:**
```typescript
interface LessonActivity {
  setup: string;                // Contextual introduction
  activities: string[];         // 3 simple practice tasks per role
  challenge: string;
  hint: string;
  questions?: string[];         // Assessment questions
  answers?: string[];           // Correct answers
  learningOutcome: string;
}
```

**Example from Kitchen Helper (Select Tier) - Math:**
```
Setup: "Welcome to CareerInc Chef Center! You're Sam's kitchen helper today..."

Activities (Practice):
1. "The recipe needs 3 bowls. Count them!"
2. "Put 2 apples in the basket for the pie"
3. "Set the table with 1 plate for the taste tester"

Hint: "Count with me: 1 egg, 2 eggs, 3 eggs. The cake needs 3 eggs!"

Questions (Assessment):
1. "Point to the number 3 on the recipe card"
2. "Show me 2 spoons from the drawer"
3. "Count the strawberries: how many do you see?"

Answers: ["3", "2 spoons", "3 strawberries"]
```

**PDF Display - ALL 4 ROLES shown:**
- Kitchen Helper (Select tier)
- Little Chef (Premium tier)
- Bakery Helper (Booster tier)
- AI Kitchen Friend (AIFirst tier)

**Role Naming:** "Kitchen Helper" (not "Junior Chef Helper")

**Activity Count:** 3 activities per role × 4 roles = 12 total activities shown

---

### NEW (Current Enriched Generator) ❌ INCORRECT FORMAT

**What's Being Generated:**
```typescript
subjectContents[skill.subject] = {
  skill: skill,
  setup: setup,
  challenges: challenges,  // ← These are scenario narratives, NOT QuestionTypes!
  interactive_simulation: interactiveSimulation
};
```

**Example from Sam_Daily_Plan_Chef_NEW.pdf - Math:**
```
Role: "Junior Chef Helper" (doubled "Junior")

Challenges (2 only):
1. "Count the apples" (simple description)
2. "Set the plates" (simple description)

Activity Count: 2 challenges per subject
```

**What's Wrong:**
1. ❌ Activities are scenario descriptions, not QuestionTypes
2. ❌ Role name: "Junior Chef Helper" instead of "Kitchen Helper"
3. ❌ Only 2 challenges instead of 3 practice + assessment questions
4. ❌ Only shows current role instead of all 4 roles
5. ❌ No QuestionType structure (type, question, correct_answer, options, etc.)

---

## What QuestionTypes Should Look Like

### From questionTypes.ts

**Available Question Types for Kindergarten:**
- `counting` - Visual counting (requires `visual` field with emojis)
- `true_false` - Binary choice
- `true_false_w_image` - With visual
- `true_false_wo_image` - Text only

**QuestionData Structure:**
```typescript
interface QuestionData {
  id?: string;
  type: string;                           // 'counting', 'true_false', 'multiple_choice', etc.
  question: string;                       // "How many bowls does the chef need?"
  visual?: string;                        // "🥣 🥣 🥣" (for counting type)
  options?: string[];                     // For multiple_choice
  correct_answer: string | number | boolean;  // "3" or 3 or "true"
  hint?: string;                          // "Count with me: 1, 2, 3"
  explanation?: string;
  career_context?: string;                // "Chef"
  difficulty?: 'easy' | 'medium' | 'hard';
  points?: number;
}
```

**Example - Kindergarten Chef Math (Counting):**
```typescript
{
  type: 'counting',
  question: 'How many bowls does the chef need for the recipe?',
  visual: '🥣 🥣 🥣',
  correct_answer: 3,
  hint: 'Count with me: 1 bowl, 2 bowls, 3 bowls!',
  explanation: 'The recipe needs 3 bowls.',
  career_context: 'Chef',
  difficulty: 'easy'
}
```

**Example - Kindergarten Chef Math (True/False with Visual):**
```typescript
{
  type: 'true_false_w_image',
  question: 'True or False: This picture shows 2 apples.',
  visual: '🍎 🍎',
  correct_answer: 'true',
  hint: 'Count the apples you see!',
  career_context: 'Chef'
}
```

---

## Root Cause Analysis

### Current Flow (WRONG):
```
LessonPlanOrchestrator.generateUnifiedDailyLesson()
  ↓
  for each skill {
    jitService.generateContainerContent({
      container: 'experience',        ← WRONG! Should be 'learn' for LEARN content
      containerType: 'experience'
    })
  }
  ↓
  JIT returns scenarios/challenges (NOT QuestionTypes)
  ↓
  subjectContents[subject] = {
    challenges: challenges  ← Scenario narratives, not QuestionTypes
  }
```

**Problem:** Orchestrator calls JIT with `container: 'experience'` for ALL content, even LEARN container content.

### Correct Flow (SHOULD BE):
```
LessonPlanOrchestrator.generateUnifiedDailyLesson()
  ↓
  for each skill {
    // LEARN Container: Generate QuestionTypes
    practiceQuestions = jitService.generateContainerContent({
      container: 'learn',             ← Use 'learn' for LEARN content
      containerType: 'learn'
    })

    // EXPERIENCE Container: Generate scenarios
    experienceScenarios = jitService.generateContainerContent({
      container: 'experience',
      containerType: 'experience'
    })

    // DISCOVER Container: Generate challenges
    discoverChallenges = jitService.generateContainerContent({
      container: 'discover',
      containerType: 'discover'
    })
  }
  ↓
  subjectContents[subject] = {
    skill: skill,
    practiceQuestions: QuestionData[],     // 5 practice QuestionTypes
    assessmentQuestion: QuestionData,      // 1 assessment QuestionType
    experienceScenarios: Scenario[],       // 2 roleplay scenarios
    discoverChallenges: Challenge[]        // 2 exploration challenges
  }
```

---

## File References

### 1. **questionTypes.ts** (`/src/types/questionTypes.ts`)
- Defines all QuestionType interfaces
- GRADE_TYPE_MAP: Maps grades to allowed question types
- K grade: counting, true_false, true_false_w_image, true_false_wo_image

### 2. **questionTypeValidator.ts** (`/src/services/questionTypeValidator.ts`)
- Validates AI-generated questions match QuestionType format
- Auto-corrects question types if AI generates wrong format
- Ensures required fields are present

### 3. **DemoLessonContent.ts** (`/src/data/DemoLessonContent.ts`)
- Contains OLD demonstrative lesson structure
- Shows correct format: setup + activities (3) + questions + answers
- Role structure: Kitchen Helper, Little Chef, Bakery Helper, AI Kitchen Friend

### 4. **LessonPlanOrchestrator.ts** (`/src/services/orchestration/LessonPlanOrchestrator.ts`)
- **Line 133-167**: Calls JIT with container='experience' (WRONG for LEARN)
- **Line 193-198**: Stores in `challenges` array (should be separate arrays for practice/scenarios/challenges)
- **Line 380**: Uses `jitContent?.questions` for assessment (should be using QuestionTypes)

### 5. **JustInTimeContentService.ts** (`/src/services/content/JustInTimeContentService.ts`)
- **Line 825-830**: Converts AI practice to Question format when containerType='learn'
- **Line 1211-1216**: getBaseQuestionCount: learn=5, experience=3, discover=2
- **Line 1367-1372**: buildInstructions: Different templates for each container type

### 6. **UnifiedLessonPlanPDFGenerator.tsx** (`/src/services/pdf/UnifiedLessonPlanPDFGenerator.tsx`)
- **Lines 553-572**: Maps over `challenges` array expecting role groups
- Expects structure: `{isRoleGroup: true, roleName: "Kitchen Helper", activities: string[], hint: string}`
- Currently receiving scenario descriptions instead

---

## Required Changes

### Priority 1: Fix LessonPlanOrchestrator

**File:** `/src/services/orchestration/LessonPlanOrchestrator.ts`

**Change generateUnifiedDailyLesson() method (Lines 114-263):**

```typescript
// Generate JIT content for each subject (CURRENT - WRONG)
for (const skill of allSkills) {
  const jitContent = await this.jitService.generateContainerContent({
    container: 'experience',  // ❌ WRONG
    containerType: 'experience',
    // ...
  });

  subjectContents[skill.subject] = {
    challenges: challenges  // ❌ Mixing LEARN/EXPERIENCE/DISCOVER
  };
}
```

**Should be:**

```typescript
// Generate SEPARATE content for LEARN, EXPERIENCE, DISCOVER
for (const skill of allSkills) {
  // 1. LEARN Container: Practice Questions (QuestionTypes)
  const learnContent = await this.jitService.generateContainerContent({
    userId: student.id,
    container: 'learn',        // ✅ Use 'learn'
    containerType: 'learn',
    subject: skill.subject,
    context: { /* same context */ },
    timeConstraint: 10
  });

  // 2. EXPERIENCE Container: Roleplay Scenarios
  const experienceContent = await this.jitService.generateContainerContent({
    userId: student.id,
    container: 'experience',
    containerType: 'experience',
    subject: skill.subject,
    context: { /* same context */ },
    timeConstraint: 10
  });

  // 3. DISCOVER Container: Exploration Challenges
  const discoverContent = await this.jitService.generateContainerContent({
    userId: student.id,
    container: 'discover',
    containerType: 'discover',
    subject: skill.subject,
    context: { /* same context */ },
    timeConstraint: 10
  });

  // Extract QuestionTypes from LEARN content
  const practiceQuestions: QuestionData[] = learnContent.questions?.slice(0, 5) || [];
  const assessmentQuestion: QuestionData = learnContent.questions?.[5] || null;

  // Extract scenarios from EXPERIENCE content
  const experienceScenarios = experienceContent.questions?.slice(0, 2) || [];

  // Extract challenges from DISCOVER content
  const discoverChallenges = discoverContent.questions?.slice(0, 2) || [];

  subjectContents[skill.subject] = {
    skill: skill,
    setup: learnContent.instructions || '',

    // LEARN: QuestionTypes
    practiceQuestions: practiceQuestions,
    assessmentQuestion: assessmentQuestion,

    // EXPERIENCE: Scenarios
    experienceScenarios: experienceScenarios,

    // DISCOVER: Challenges
    discoverChallenges: discoverChallenges,

    // Keep raw data for reference
    interactive_simulation: {
      learn: learnContent,
      experience: experienceContent,
      discover: discoverContent
    }
  };
}
```

### Priority 2: Fix Role Naming

**Issue:** "Junior Chef Helper" instead of "Kitchen Helper"

**Location:** Need to find where "Junior" prefix is being added twice

**Tiers should map to:**
- Select → "Kitchen Helper" (NOT "Junior Chef Helper")
- Premium → "Little Chef"
- Booster → "Bakery Helper"
- AIFirst → "AI Kitchen Friend"

### Priority 3: Update PDF Generator

**File:** `/src/services/pdf/UnifiedLessonPlanPDFGenerator.tsx`

**Current (expects challenges array):**
```typescript
{lessonPlan.content.subjectContents.Math.challenges.map((roleGroup, roleIdx) =>
  roleGroup.isRoleGroup ? (
    // Render role group with activities
  )
)}
```

**Should use QuestionTypes:**
```typescript
{/* Practice Questions (QuestionTypes) */}
{lessonPlan.content.subjectContents.Math.practiceQuestions?.map((question, idx) => (
  <QuestionRenderer
    key={idx}
    questionData={question}
    showAnswer={false}
  />
))}

{/* Assessment Question */}
{lessonPlan.content.subjectContents.Math.assessmentQuestion && (
  <QuestionRenderer
    questionData={lessonPlan.content.subjectContents.Math.assessmentQuestion}
    showAnswer={true}
    isAssessment={true}
  />
)}
```

### Priority 4: Update Test Page

**File:** `/src/components/TestUnifiedLessonWithCareerSelector.tsx`

**Current (Lines 320-343):**
```typescript
// Extract activities from orchestrator's challenges structure
let liveActivities: string[] = [];
if (content.challenges && Array.isArray(content.challenges)) {
  liveActivities = content.challenges.map((challenge: any) => {
    return challenge.description || challenge.question || 'Challenge activity';
  });
}
```

**Should use QuestionTypes:**
```typescript
// Extract practice questions from LEARN content
let practiceQuestions: QuestionData[] = [];
if (content.practiceQuestions && Array.isArray(content.practiceQuestions)) {
  practiceQuestions = content.practiceQuestions;
}

return {
  subject: subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1).replace('_', ' '),
  skill: {
    objective: curriculumInfo?.skillObjective || content.skill?.objective || 'Learning objectives',
    careerConnection: content.careerConnection || getCareerConnection(...)
  },
  practiceQuestions: practiceQuestions,  // QuestionData[]
  assessmentQuestion: content.assessmentQuestion,  // QuestionData
  // NOTE: Test page intentionally doesn't show Experience/Discover (per user)
  assessmentLevel: content.assessmentLevel || getAssessmentLevel(selectedTier),
  interactivity: content.interactivity || getInteractivityLevel(selectedTier)
};
```

---

## Expected Results

### After Fixes:

**LEARN Container (Math - Kitchen Helper role):**
```typescript
{
  practiceQuestions: [
    {
      type: 'counting',
      question: 'How many bowls does the chef need?',
      visual: '🥣 🥣 🥣',
      correct_answer: 3,
      hint: 'Count with me: 1 bowl, 2 bowls, 3 bowls!'
    },
    {
      type: 'counting',
      question: 'How many apples for the pie?',
      visual: '🍎 🍎',
      correct_answer: 2
    },
    {
      type: 'true_false_w_image',
      question: 'True or False: This shows 1 plate.',
      visual: '🍽️',
      correct_answer: 'true'
    },
    // ... 2 more practice questions
  ],
  assessmentQuestion: {
    type: 'counting',
    question: 'Count the strawberries. How many do you see?',
    visual: '🍓 🍓 🍓',
    correct_answer: 3
  }
}
```

**EXPERIENCE Container:**
```typescript
{
  experienceScenarios: [
    {
      scenarioId: 'EXP_1',
      title: 'A Day as a Chef',
      content: 'Imagine you\'re a Chef today! Help organize workspace and serve 3 customers.'
    },
    {
      scenarioId: 'EXP_2',
      title: 'Chef\'s Problem Solving',
      content: 'Oh no! The chef needs help with a counting challenge...'
    }
  ]
}
```

**DISCOVER Container:**
```typescript
{
  discoverChallenges: [
    {
      challengeId: 'DISC_1',
      title: 'Chef Explorer',
      content: 'Visit virtual kitchen and find 3 ways chefs use counting'
    },
    {
      challengeId: 'DISC_2',
      title: 'Community Helper Hunt',
      content: 'Look for chefs in your community this week'
    }
  ]
}
```

---

## Testing Checklist

After implementing fixes:

1. ✅ Clear JIT cache: `localStorage.clear()` and `sessionStorage.clear()`
2. ✅ Generate new lesson for Sam (K, Chef, Select tier)
3. ✅ Verify console logs show:
   - `[JIT] Generating for container: learn` (not experience)
   - `📊 Math - Practice questions from orchestrator: [5 QuestionData objects]`
   - QuestionData objects have `type`, `question`, `correct_answer` fields
4. ✅ Download PDF and verify:
   - Role name: "Kitchen Helper" (not "Junior Chef Helper")
   - Math section shows 5 practice QuestionTypes + 1 assessment
   - Each question has proper format (counting with visuals, true/false, etc.)
   - Grade-appropriate language (K = 3-5 words per sentence)
5. ✅ Test page displays QuestionTypes properly (if implemented)

---

## Summary

**The Core Issue:**
LEARN container is generating scenario narratives instead of QuestionType-based practice questions.

**The Fix:**
1. Call JIT with `container: 'learn'` for LEARN content
2. Separate generation for LEARN (questions), EXPERIENCE (scenarios), DISCOVER (challenges)
3. Store in separate arrays: `practiceQuestions[]`, `experienceScenarios[]`, `discoverChallenges[]`
4. Use QuestionData interface with proper types: counting, true_false, multiple_choice, etc.
5. Fix role naming: "Kitchen Helper" not "Junior Chef Helper"

**Files to Modify:**
1. `/src/services/orchestration/LessonPlanOrchestrator.ts` (Priority 1)
2. `/src/services/pdf/UnifiedLessonPlanPDFGenerator.tsx` (Priority 3)
3. `/src/components/TestUnifiedLessonWithCareerSelector.tsx` (Priority 4)
4. Find and fix role naming source (Priority 2)
