# CLAUDE TROUBLESHOOTING GUIDE - COMPLETE SYSTEM
## FOR CLAUDE AI ASSISTANT USE ONLY
Generated: 2025-08-24 | Version: 2.0

---

## 🚨 CRITICAL RULES - NEVER VIOLATE THESE

### ARCHITECTURAL FOUNDATIONS - DO NOT DELETE OR BYPASS
1. **PROACTIVE Architecture**: System controls AI generation, NOT reactive to AI
2. **Continuous Learning Model**: No daily boundaries - perpetual skill progression
3. **Adaptive Journey System**: Dynamic skill clusters, real-time adaptation
4. **Type Safety**: ALWAYS use TypeScript discriminated unions - NEVER use `any` for questions
5. **Singleton Pattern**: ALL services use getInstance() - NEVER create new instances
6. **JIT Philosophy**: Generate content ONLY when needed, not upfront
7. **15 Question Types**: System supports exactly 15 types - don't reduce to 5 or add new ones
8. **Master Data Source**: skillsDataComplete.ts is the ONLY source for skills

### FILES YOU MUST NEVER DELETE
```
# PROACTIVE Content System
/src/services/content/QuestionTypes.ts          # Core type definitions
/src/services/content/QuestionFactory.ts        # Type-safe creation
/src/services/content/QuestionValidator.ts      # Validation with partial credit
/src/services/content/ContentGenerationPipeline.ts
/src/services/content/DailyLearningContextManager.ts
/src/services/content/JustInTimeContentService.ts

# Adaptive Journey System
/src/services/SkillClusterService.ts            # Dynamic skill loading
/src/services/AdaptiveJourneyOrchestrator.ts    # Journey management
/src/services/ContinuousJourneyIntegration.ts   # System bridge

# Data Sources
/src/data/skillsDataComplete.ts                 # Master skill database
/src/rules-engine/career/CareerProgressionSystem.ts
```

---

## 🔍 QUICK DIAGNOSIS FLOWCHART

```
User reports issue
    ↓
Is content wrong for student's grade level?
    YES → Check Section B: Grade Detection Issues ⚠️ CRITICAL
    NO ↓
    
Is it about journey/skills not loading?
    YES → Check Section H: Adaptive Journey Issues (NEW)
    NO ↓

Is it a TypeScript/compilation error?
    YES → Check Section A: Type Safety Issues
    NO ↓
    
Is it about questions not displaying?
    YES → Check Section C: Question Rendering Issues  
    NO ↓
    
Is it about wrong answers being marked correct/incorrect?
    YES → Check Section C: Validation Issues
    NO ↓
    
Is it about content not generating?
    YES → Check Section D: Generation Pipeline Issues
    NO ↓
    
Is it about performance/loading?
    YES → Check Section E: Performance Issues
    NO ↓
    
Is it about career/skill inconsistency?
    YES → Check Section F: Consistency Issues
    NO ↓

Is it about skill progression/clusters?
    YES → Check Section H: Adaptive Journey Issues (NEW)
    NO → Check Section G: General Debugging
```

---

## A. TYPE SAFETY ISSUES 🔴

### Symptom: "Type 'any[]' is not assignable to type 'Question[]'"
**Root Cause**: JIT service or container using `any[]` instead of `Question[]`

**Fix Location**: `/src/services/content/JustInTimeContentService.ts`
```typescript
// WRONG
export interface GeneratedContent {
  questions: any[];  // ❌ NEVER DO THIS
}

// CORRECT
import { Question } from './QuestionTypes';
export interface GeneratedContent {
  questions: Question[];  // ✅ ALWAYS DO THIS
}
```

### Symptom: "Property does not exist on type 'Question'"
**Root Cause**: Not using type guards before accessing specific properties

**Fix Location**: Component trying to access question properties
```typescript
// WRONG
if (question.options) {  // ❌ Question type doesn't guarantee options
  
// CORRECT
import { isMultipleChoice } from '../services/content/QuestionTypes';
if (isMultipleChoice(question)) {  // ✅ Type guard ensures options exist
  // Now TypeScript knows question.options exists
}
```

---

## B. GRADE DETECTION ISSUES 🎓 ⚠️ CRITICAL
*Note: This critical section was added 2025-08-25. Sections below have been renumbered.*

### THE PROBLEM: Wrong grade = Wrong content for EVERYTHING
**Impact**: Affects skill selection, content difficulty, career descriptions, question types, and UI language
**Date Discovered**: 2025-08-25
**Severity**: CRITICAL - This breaks the entire learning experience

### Root Cause: Field Name Confusion
The system uses **`grade_level`** but many components incorrectly check **`grade`** (which doesn't exist!)

### ❌ WRONG Field Names (These DON'T EXIST):
```typescript
profile?.grade           // ❌ DOES NOT EXIST
student.grade           // ❌ DOES NOT EXIST
user.grade             // ❌ DOES NOT EXIST
```

### ✅ CORRECT Field Names:
```typescript
profile?.grade_level    // ✅ From useStudentProfile hook
student.grade_level    // ✅ In StudentProfile interface
(user as any)?.grade_level  // ✅ From auth data (needs cast)
```

### The Correct Grade Detection Chain:
```typescript
// ALWAYS use this pattern for grade detection:
const studentGrade = profile?.grade_level || (user as any)?.grade_level || 'K';
```

### Files That MUST Use grade_level:
1. **StudentDashboard.tsx**
   - Line ~42: Creating studentProfile
   - Line ~63: Creating learningSkill
   - Line ~330: Passing to AICharacterProvider

2. **All Container Files**
   - MultiSubjectContainerV2.tsx
   - AILearnContainerV2-UNIFIED.tsx
   - AIExperienceContainerV2.tsx
   - AIDiscoverContainerV2.tsx

3. **Modal Files**
   - IntroductionModal.tsx
   - CareerChoiceModal.tsx
   - DashboardModal.tsx

### Common Symptoms of Grade Detection Failure:
1. **Kindergarten content for Grade 7+ students**
   - "Cook yummy food" instead of "Design culinary experiences"
   - "Help heal boo-boos" instead of "Perform medical procedures"

2. **Wrong skill selection**
   - Getting counting skills when should have algebra
   - Simple addition when should have complex equations

3. **Career cards flashing or showing wrong grades**
   - PathIQ returns K careers for Grade 7 students
   - Only 7-10 careers shown instead of full grade-appropriate set

4. **Question types too simple**
   - Only multiple choice when should have complex types
   - Missing visual questions for higher grades

### The Grade Mapping (MEMORIZE THIS):
```javascript
function getGradeKey(grade: string): string {
  if (grade === 'K' || grade === '1' || grade === '2') return 'Kindergarten';
  if (grade === '3' || grade === '4' || grade === '5' || grade === '6') return 'Grade 3';
  if (grade === '7' || grade === '8' || grade === '9') return 'Grade 7';
  if (grade === '10' || grade === '11' || grade === '12') return 'Grade 10';
  return 'Kindergarten';  // Default fallback
}
```

### Quick Fix Checklist:
- [ ] Search entire codebase for `profile?.grade` → Replace with `profile?.grade_level`
- [ ] Search for `student.grade` → Replace with `student.grade_level`
- [ ] Search for `user.grade` → Replace with `(user as any).grade_level`
- [ ] Check all dependency arrays include correct field
- [ ] Verify StudentProfile interface uses `grade_level`
- [ ] Test with Sam (K), Jordan (7), and Taylor (10)

### Testing Commands:
```bash
# Quick grep to find wrong field usage:
grep -r "profile?.grade[^_]" src/
grep -r "student\.grade[^_]" src/
grep -r "user\.grade[^_]" src/

# Find all grade detection points:
grep -r "grade_level" src/ --include="*.tsx" --include="*.ts"
```

### Prevention:
1. **NEVER** create a field called `grade` - always use `grade_level`
2. **ALWAYS** cast user object when accessing grade: `(user as any)?.grade_level`
3. **DOCUMENT** grade source in comments where grade is detected
4. **TEST** with all three demo users before committing

---

## C. QUESTION RENDERING ISSUES 🎨

### Symptom: Questions show as JSON or don't render
**Check These Files IN ORDER**:

1. **First Check**: `/src/services/content/QuestionRenderer.tsx`
   - Verify all 15 question types have render cases
   - Look for the type in the main switch statement
   ```typescript
   switch (question.type) {
     case 'multiple_choice': return <MultipleChoiceRenderer ...
     case 'true_false': return <TrueFalseRenderer ...
     // ... should have 15 cases total
   ```

2. **Second Check**: Container using QuestionRenderer
   - Verify importing QuestionRenderer
   - Check renderQuestion function exists

### Symptom: Visual elements show text descriptions instead of actual icons/letters
**Root Cause**: The `visual` field contains text like `"🏆 (trophy with 'G')"` being incorrectly treated as counting visuals

**Fix Location**: `/src/components/ai-containers/VisualRenderer.tsx`
```typescript
// PROBLEM: Letter visuals were being treated as counting visuals
// SOLUTION: Detect letter visual pattern and render specially
const letterVisualMatch = visual && typeof visual === 'string' && 
  visual.match(/([^\s]+)\s*\([^)]*with\s*['"]([A-Z])['"][^)]*\)/);
const isLetterVisual = !!letterVisualMatch;

// Exclude letter visuals from counting visual detection
const isCountingVisual = !isImageUrl && !isLetterVisual && visual && typeof visual === 'string' && ...
```

### Symptom: Cannot enter answer in assessment input box for true/false questions
**Root Cause**: New question types `true_false_w_image` and `true_false_wo_image` not handled in assessment section

**Fix Location**: `/src/components/ai-containers/AILearnContainerV2.tsx` line ~811
```typescript
// ADD handling for true_false variants:
{(content.assessment.type === 'true_false' || 
  content.assessment.type === 'true_false_w_image' || 
  content.assessment.type === 'true_false_wo_image') && (
  <div className={questionStyles.trueFalseOptions}>
    <button onClick={() => setAssessmentAnswer('true')}>✓ True</button>
    <button onClick={() => setAssessmentAnswer('false')}>✗ False</button>
  </div>
)}
```

### Symptom: Numeric answers marked wrong when they should be correct ⚠️ CRITICAL
**Root Cause**: Fallback validation in AILearnContainerV2-UNIFIED.tsx doesn't handle numeric type, falls through to generic case that always returns false

**Fix Location**: `/src/components/ai-containers/AILearnContainerV2-UNIFIED.tsx` line ~460
```typescript
// WRONG - Numeric questions fall through to generic case
} else if (convertedQuestion.type === 'true_false') {
  // true_false validation
} else {
  // Generic fallback - ALWAYS RETURNS FALSE!
  validationResult = { isCorrect: false, ... }
}

// CORRECT - Add specific numeric handling
} else if (convertedQuestion.type === 'true_false') {
  // true_false validation
} else if (convertedQuestion.type === 'numeric') {
  const numQuestion = convertedQuestion as any;
  const tolerance = numQuestion.tolerance || 0.01;
  const userAnswer = parseFloat(answer);
  const correctAnswer = parseFloat(numQuestion.correctAnswer);
  const isCorrect = Math.abs(userAnswer - correctAnswer) <= tolerance;
  validationResult = {
    isCorrect: isCorrect,
    score: isCorrect ? 1 : 0,
    feedback: isCorrect ? 'Correct!' : `Not quite. The answer is ${numQuestion.correctAnswer}`,
    partialCredit: 0
  };
} else {
  // Generic fallback for truly unknown types
}
```

**Why This Happens**: The JIT validator might fail, triggering fallback validation. Without numeric handling in fallback, all numeric answers are marked wrong.

### Symptom: Assessment questions have `type: undefined`
**Root Cause**: AI-generated assessment questions missing type field

**Fix Location**: `/src/services/AILearningJourneyService.ts`
- Assessment questions need type detection logic
- Should infer type from question structure (e.g., if has options → multiple_choice)

### Symptom: True/False buttons showing light theme in dark mode ⚠️ CRITICAL BUG
**Root Cause**: Incorrect destructuring of `useTheme()` hook return value
**Date Discovered**: 2025-08-25

**THE BUG**:
```typescript
// WRONG - useTheme() returns a string, not an object!
const { theme } = useTheme();  // ❌ This makes theme = undefined
```

**THE FIX**:
```typescript
// CORRECT - useTheme() returns the theme string directly
const theme = useTheme();  // ✅ theme = 'dark' or 'light'
```

**Files That Had This Bug**:
- `/src/components/ai-containers/AILearnContainerV2.tsx`
- `/src/components/ai-containers/AILearnContainerV2-UNIFIED.tsx`
- `/src/components/ai-containers/AIExperienceContainerV2-JIT.tsx`
- `/src/components/ai-containers/AILearnContainerV2-JIT.tsx`
- `/src/components/ai-containers/AIThreeContainerJourneyV2.tsx`
- `/src/components/metrics/LearningAdaptationListener.tsx`

**Why This Happened**:
- The `useTheme()` hook was refactored to return just a string instead of an object
- Code was not updated to match the new return type
- TypeScript didn't catch it because destructuring undefined gives undefined (no type error)

**How to Check**:
```typescript
// Add this debug line to verify theme is working:
console.warn('Theme value:', theme, typeof theme);
// Should log: "Theme value: dark string" or "Theme value: light string"
// If it logs: "Theme value: undefined undefined" - you have the bug
```

**Prevention**:
- Always check what hooks actually return before destructuring
- Add explicit return types to hooks: `export const useTheme = (): Theme => {`
- Consider using `useThemeContext()` which returns an object if you need destructuring

### Symptom: Only 5 question types work (multiple_choice, true_false, short_answer, fill_blank, matching)
**Root Cause**: Container using OLD validation code instead of QuestionValidator

**Fix Location**: `/src/components/ai-containers/AI[Learn|Experience|Discover]ContainerV2-JIT.tsx`
```typescript
// WRONG - Old switch statement
switch(question.type) {
  case 'multiple_choice': // ❌ Only handles 5 types
  
// CORRECT - Use QuestionValidator
import { questionValidator } from '../../services/content/QuestionValidator';
const result = questionValidator.validateAnswer(question, answer); // ✅ Handles all 15 types
```

### Symptom: "No validation rules for type: true_false_wo_image" warning in console
**Root Cause**: LearnAIRulesEngine doesn't have validation rules for new true_false variants

**Fix Location**: `/src/rules-engine/learn/LearnAIRulesEngine.ts` line ~610
```typescript
// ADD validation rules for new types:
case 'true_false_w_image':
case 'true_false_wo_image':
  return userAnswer === question.correct_answer;
```

---

## C. VALIDATION ISSUES ✅

### Symptom: Answers marked wrong when they should be right
**Debug Path**:

1. **Check validation call**: Container's validateAnswer function
   ```typescript
   // Must use QuestionValidator, not custom logic
   const result = questionValidator.validateAnswer(question, answer);
   ```

2. **Check answer format**: What's being passed as answer?
   ```typescript
   console.log('[DEBUG] Question type:', question.type);
   console.log('[DEBUG] Answer being validated:', answer);
   ```

3. **Check QuestionValidator**: `/src/services/content/QuestionValidator.ts`
   - Find the validation logic for that question type
   - Line ~200-600 has type-specific validation

### Symptom: ELA questions show "The correct answer is undefined" when wrong
**Root Cause**: AIContentConverter not properly matching correct_answer string values with options

**Issue Details**:
- AI service returns correct_answer as actual value (e.g., "Joyful", "True") not index
- AIContentConverter was using simple indexOf() which failed on case/whitespace differences
- No option was marked as correct, leading to "undefined" in feedback

**Fix Location**: `/src/services/content/AIContentConverter.ts`

**For Multiple Choice** (lines 326-370):
```typescript
// WRONG - Simple indexOf fails on minor differences
const correctIndex = options.indexOf(String(correctAnswer));

// CORRECT - Robust matching with fallbacks
let correctIndex = -1;
for (let i = 0; i < options.length; i++) {
  const optionText = String(options[i]).trim();
  const answerText = String(correctAnswer).trim();
  
  // Try exact match first
  if (optionText === answerText) {
    correctIndex = i;
    break;
  }
  
  // Try case-insensitive match
  if (optionText.toLowerCase() === answerText.toLowerCase()) {
    correctIndex = i;
    break;
  }
}
```

**For True/False** (lines 420-490):
```typescript
// WRONG - Only checking lowercase "true"
correctAnswer = assessment.correct_answer.toLowerCase() === 'true';

// CORRECT - Handle various formats
const answerStr = String(assessment.correct_answer).trim().toLowerCase();
correctAnswer = answerStr === 'true' || answerStr === 't' || 
                answerStr === 'yes' || answerStr === '1';
```

**Prevention**:
- Always normalize strings before comparison (trim, lowercase)
- Add logging when no correct answer is found
- Ensure validator shows meaningful feedback, not raw values

### Symptom: Partial credit not working
**Fix Location**: `/src/services/content/QuestionValidator.ts`
- Check `calculatePartialCredit()` method
- Verify container is using `result.partialCredit` from ValidationResult

---

## D. GENERATION PIPELINE ISSUES ⚙️

### Symptom: No content generates / Loading forever
**Debug Order**:

1. **Check JIT Service Cache**: 
   ```typescript
   // In container or JIT service
   console.log('[JIT] Cache stats:', jitService.getCacheStats());
   ```

2. **Check Daily Context**: `/src/services/content/DailyLearningContextManager.ts`
   ```typescript
   const context = dailyContextManager.getCurrentContext();
   console.log('[Context] Current:', context);
   // If null, context was never created
   ```

3. **Check Pipeline**: `/src/services/content/ContentGenerationPipeline.ts`
   - Add logging at line ~106 to see if pipeline is called
   - Check if error is thrown around line ~120

### Symptom: "No daily context available" error
**Fix**: Context must be created at session start
```typescript
// In main App or login flow
import { DailyLearningContextManager } from './services/content/DailyLearningContextManager';
const contextManager = DailyLearningContextManager.getInstance();
contextManager.createDailyContext(studentProfile);
```

### Symptom: PreGenerationService get_next_queue_item returns 400 errors ⚠️ NEW
**Root Cause**: Database function missing or has wrong signature. Table structure doesn't match function expectations.

**Debug Steps**:
1. Check if function exists: `SELECT proname FROM pg_proc WHERE proname = 'get_next_queue_item'`
2. Check table columns: `SELECT column_name FROM information_schema.columns WHERE table_name = 'generation_queue'`
3. Common issue: Function expects `worker_id` column that doesn't exist

**Fix**: Create simplified function matching actual table structure
```sql
CREATE OR REPLACE FUNCTION get_next_queue_item(p_worker_id UUID)
RETURNS TABLE (
    queue_id UUID,
    student_id VARCHAR,
    grade_level VARCHAR,
    subject VARCHAR,
    skill_id VARCHAR,
    container_type VARCHAR,
    question_type VARCHAR
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE generation_queue gq
    SET 
        status = 'processing',
        started_at = NOW()
    WHERE gq.queue_id = (
        SELECT q.queue_id
        FROM generation_queue q
        WHERE q.status = 'pending'
        ORDER BY q.priority DESC, q.created_at ASC
        LIMIT 1
    )
    RETURNING 
        gq.queue_id,
        gq.student_id,
        gq.grade_level,
        gq.subject,
        gq.skill_id,
        gq.container_type,
        gq.question_type;
END;
$$;
```

### Symptom: PreGeneration creates infinite loop for one subject
**Root Cause**: Mismatch between cache_warming_config subject names and actual skills table subject names

**Example**: Grade 10 has "Algebra 1" in skills_master_v2 but config might have "Math"
**Check**: 
```sql
-- See what's in config
SELECT * FROM cache_warming_config WHERE grade_level = '10';
-- See what subjects exist in skills
SELECT DISTINCT subject FROM skills_master_v2 WHERE grade_level = '10';
```

**Fix**: Update cache_warming_config to match actual subject names

---

## E. PERFORMANCE ISSUES 🚀

### Symptom: Slow content generation (>500ms)
**Check Cache Layers** (in order):

1. **Memory Cache**: `/src/services/content/JustInTimeContentService.ts` line ~650
2. **Session Cache**: `/src/services/content/SessionStateManager.ts` 
3. **Check cache key generation**: May be too unique, preventing hits

### Symptom: Cache not working (0% hit rate)
**Debug**:
```typescript
// Add to JIT service
console.log('[Cache] Key generated:', this.getCacheKey(request));
console.log('[Cache] Memory cache size:', this.memoryCache.size);
console.log('[Cache] Session cache:', sessionManager.getProgress(userId));
```

---

## F. CONSISTENCY ISSUES 🎯

### Symptom: Different careers/skills showing across subjects
**Root Cause**: Daily context being recreated instead of reused

**Check**:
1. `/src/services/content/DailyLearningContextManager.ts`
   - Verify `currentContext` is stored and reused
   - Check `isContextValid()` isn't incorrectly invalidating

2. `/src/services/content/ConsistencyValidator.ts`
   - Check if enforceConsistency() is being called
   - Verify corrections are being applied

### Symptom: Skills not adapting to subject
**Fix Location**: `/src/services/content/SkillAdaptationService.ts`
- Check `adaptSkillToSubject()` method
- Verify subject-specific descriptions are generated

---

## G. GENERAL DEBUGGING 🔧

### Component Hierarchy
```
App.tsx
  └─> Student Login/Selection
      └─> DailyLearningContextManager.createDailyContext()
          └─> Container Component (Learn/Experience/Discover)
              ├─> JustInTimeContentService.generateContainerContent()
              │   └─> ContentGenerationPipeline.generateContent()
              │       ├─> QuestionFactory.create[Type]()
              │       ├─> QuestionValidator.validateStructure()
              │       └─> ConsistencyValidator.enforceConsistency()
              ├─> QuestionRenderer.renderQuestion()
              └─> QuestionValidator.validateAnswer()
```

### Service Initialization Order
1. DailyLearningContextManager (singleton)
2. SessionStateManager (singleton)
3. JustInTimeContentService (singleton)
4. PerformanceTracker (singleton)
5. ContentGenerationPipeline (singleton)

### Key Integration Points
| From | To | Method | Purpose |
|------|-----|--------|---------|
| Container | JIT Service | generateContainerContent() | Get questions |
| JIT Service | Pipeline | generateContent() | Create if not cached |
| Pipeline | Factory | create[Type]() | Build questions |
| Pipeline | Validator | validateQuestionStructure() | Ensure valid |
| Container | Validator | validateAnswer() | Check answers |
| Container | Renderer | renderQuestion() | Display questions |

---

## 📊 PERFORMANCE BENCHMARKS

If performance degrades, these are the targets:
- Content generation: <500ms (with cold cache)
- Cache hit rate: >60% after warmup
- Validation: <50ms per question
- Render: <100ms per question
- Session save: <100ms

---

## 🛠️ COMMON FIXES

### Fix 1: Container Not Using New System
```typescript
// In AI[Container]V2-JIT.tsx
import { questionValidator } from '../../services/content/QuestionValidator';
import { QuestionRenderer } from '../../services/content/QuestionRenderer';

// Replace old switch with:
const result = questionValidator.validateAnswer(question, answer);
```

### Fix 2: Type Safety Errors
```typescript
// In any file using questions
import { Question } from '../services/content/QuestionTypes';
// Change any[] to Question[]
```

### Fix 3: Missing Daily Context
```typescript
// In App.tsx or after login
const contextManager = DailyLearningContextManager.getInstance();
contextManager.createDailyContext(studentProfile);
```

### Fix 4: Questions Not Rendering
```typescript
// In container
import { QuestionRenderer } from '../../services/content/QuestionRenderer';
// Use: <QuestionRenderer question={question} onAnswer={...} />
```

---

## H. ADAPTIVE JOURNEY ISSUES 🚀 (NEW)

### Symptom: "No skills loading for student" 
**Root Cause**: Journey not initialized
**Fix Location**: Student login or dashboard
```typescript
// Initialize journey for new student
import { continuousJourneyIntegration } from './services/ContinuousJourneyIntegration';
const journey = await continuousJourneyIntegration.initializeStudentJourney(
  studentId, studentName, gradeLevel, careerPreference
);
```

### Symptom: "Skills not progressing to next cluster"
**Root Cause**: Mastery threshold not met
**Debug Path**:
```typescript
const journey = adaptiveJourneyOrchestrator.getJourney(studentId);
const cluster = journey.activeSkillClusters[subject];
console.log('[Journey] Skills mastered:', cluster.progress.skillsMastered.length);
console.log('[Journey] Threshold:', cluster.cluster.masteryThreshold);
// Must master 80% of skills to advance
```

### Symptom: "Grade 1 skills not found"
**Status**: ✅ FIXED - Grade 1 added to skillsDataComplete.ts
**Stats**: 349 Math, 253 ELA, 82 Science, 63 Social Studies skills

### Symptom: "Career level not advancing"
**Root Cause**: Total mastery milestone not reached
**Milestones**:
- Explorer → Apprentice: 25 skills
- Apprentice → Practitioner: 75 skills  
- Practitioner → Specialist: 150 skills
- Specialist → Expert: 300 skills

**Debug**:
```typescript
const stats = continuousJourneyIntegration.getJourneyStats(studentId);
console.log('[Career] Total mastered:', stats.totalSkillsMastered);
console.log('[Career] Current level:', stats.careerLevel);
```

### Symptom: "Diagnostic assessment not running"
**Fix Location**: Journey initialization
```typescript
// Check if diagnostic needed
const journey = adaptiveJourneyOrchestrator.getJourney(studentId);
if (journey.diagnosticHistory.length === 0) {
  // Run diagnostic for each subject
  const diagnosticSkills = continuousJourneyIntegration.getDiagnosticSkills(journey);
}
```

### Symptom: "multiSubjectAssignments not working with new system"
**Root Cause**: Legacy format incompatible with continuous model
**Fix**: Convert to continuous assignment
```typescript
const continuousAssignment = continuousJourneyIntegration.convertToContinuousAssignment(
  legacyAssignment,
  journey
);
```

### Symptom: "Adaptive score not changing"
**Debug Path**:
```typescript
// Check performance updates
const journey = adaptiveJourneyOrchestrator.getJourney(studentId);
console.log('[Adaptive] Current score:', journey.continuousProgress.adaptiveScore);
// Score increases with mastery (+10), decreases with struggles (-5)
```

### Symptom: "Skills from wrong grade level"
**Root Cause**: Grade normalization issue
**Fix Location**: `/src/services/SkillClusterService.ts`
```typescript
// Check grade normalization
const normalizedGrade = this.normalizeGradeLevel(gradeLevel);
// Should map: K→Kindergarten, 1→Grade 1, 3→Grade 3, 7→Grade 7, 10→Grade 10
```

---

## I. CAREER SELECTION ISSUES 🚀

### Symptom: "CareerChoiceModal shows wrong grade careers"
**Root Cause**: Modal not receiving user/profile context on initial render
**Fix Location**: DashboardModal and CareerChoiceModal
```typescript
// CareerChoiceModal.tsx - Accept props
interface CareerChoiceModalProps {
  user?: any;
  profile?: any;
}

// DashboardModal.tsx - Pass props
<CareerChoiceModal
  user={user}
  profile={profile}
/>
```

### Symptom: "IntroductionModal crashes with 'Cannot read properties of undefined'"
**Root Cause**: PathIQ returning categories instead of careers for some grades
**Fix Location**: pathIQService.ts
```typescript
// Ensure all grades return careers, not categories
const GRADE_CATEGORIES = {
  'K': 'all', '1': 'all', '2': 'all',  // All use 'all' now
  '3': 'all', '4': 'all', '5': 'all',
  '6': 'all', '7': 'all', '8': 'all',
  '9': 'all', '10': 'all', '11': 'all', '12': 'all'
};
```

### Symptom: "Wrong number of careers for grade level"
**Root Cause**: PathIQ not implementing 3+1 system correctly
**Fix**: Implement getThreeCareersFromThreeCategories method
- 3 careers from 3 different categories (random selection)
- Plus "More Careers" option showing all available for grade
- K: 7 careers, Grade 7: 48 careers, Grade 10: 79+ careers

---

## J. GRADE 10 MAPPING ISSUES 📚

### Symptom: "Grade 10 shows 0 available skills for Math"
**Root Cause**: Grade 10 has Algebra I/Pre-Calculus, not standard Math
**Fix Location**: SkillClusterService.ts
```typescript
private mapSubjectForGrade(subject: string, gradeLevel: string): string {
  if (normalizedGrade === 'Grade 10') {
    const subjectMap = {
      'Math': 'Algebra I',
      'Mathematics': 'Algebra I',
      'Advanced Math': 'Pre-Calculus'
    };
    return subjectMap[subject] || subject;
  }
  return subject;
}
```

### Symptom: "Kindergarten questions showing for Grade 10"
**Root Cause**: No Algebra I templates in QuestionTemplateEngine
**Fix**: Add high school math templates
```typescript
{
  id: 'mc-algebra1-integers',
  gradeRange: ['9', '12'],
  subjects: ['Algebra I', 'Math', 'Mathematics'],
  // Template implementation
}
```

---

## 🏗️ N. VALIDATION ARCHITECTURE - CRITICAL

### The ONE Validation Path Rule
**CRITICAL**: There must be ONLY ONE validation path for questions. Multiple validation paths create circular breaking patterns.

**Current Architecture**:
- **QuestionValidator.ts** - The ONLY source of truth for validation
- **AIContentConverter.ts** - Converts AI content to proper Question objects
- **AILearnContainerV2-UNIFIED.tsx** - Uses ONLY QuestionValidator.validateAnswer()

**NEVER DO THIS**:
```typescript
// BAD - Multiple validation paths
try {
  result = questionValidator.validateAnswer(question, answer);
} catch {
  // Fallback validation - THIS IS WRONG!
  if (question.type === 'true_false') {
    // Manual validation logic - CAUSES CONFLICTS!
  }
}
```

**ALWAYS DO THIS**:
```typescript
// GOOD - Single validation path
try {
  result = questionValidator.validateAnswer(question, answer);
} catch (error) {
  // Log the error for debugging
  console.error('Validation failed:', error);
  // Return error state, don't try alternate validation
  result = { isCorrect: false, feedback: 'Validation error' };
}
```

**If QuestionValidator fails**: Fix the root cause, don't add fallback validation!
- Check AIContentConverter is creating proper Question objects
- Ensure Question objects have all required properties
- Fix type guards if needed

---

## 🚫 WHAT NOT TO DO

1. **NEVER** replace Question[] with any[]
2. **NEVER** create new service instances (always use getInstance())
3. **NEVER** bypass the ConsistencyValidator
4. **NEVER** generate all content upfront (violates JIT principle)
5. **NEVER** modify skillsDataComplete.ts (master source)
6. **NEVER** reduce to only 5 question types
7. **NEVER** remove type guards before accessing question properties
8. **NEVER** use custom validation instead of QuestionValidator
9. **NEVER** use daily assignments instead of continuous journeys
10. **NEVER** bypass adaptive score calculations
11. **NEVER** manually advance career levels (automatic based on mastery)
12. **NEVER** load all skill clusters at once (violates JIT principle)

---

## 📝 LOGGING FOR DEBUGGING

Add these logs to trace issues:

```typescript
// Generation flow
console.log('[Pipeline] Generating content for:', request);
console.log('[Factory] Creating question type:', type);
console.log('[Validator] Validating structure:', question.type);
console.log('[Consistency] Checking alignment:', context.selectedCareer);

// Validation flow  
console.log('[Validate] Question type:', question.type);
console.log('[Validate] User answer:', answer);
console.log('[Validate] Result:', result);

// Cache flow
console.log('[Cache] Key:', key);
console.log('[Cache] Hit/Miss:', cached ? 'HIT' : 'MISS');
console.log('[Cache] Stats:', this.getCacheStats());

// Performance
console.log('[Perf] Generation time:', endTime - startTime);
console.log('[Perf] Cache hit rate:', stats.hitRate);

// Journey flow (NEW)
console.log('[Journey] Student ID:', studentId);
console.log('[Journey] Current cluster:', cluster.categoryId);
console.log('[Journey] Skills mastered:', progress.skillsMastered.length);
console.log('[Journey] Adaptive score:', journey.continuousProgress.adaptiveScore);
console.log('[Journey] Career level:', journey.careerContext.currentLevel);

// Skill cluster flow (NEW)
console.log('[Cluster] Loading:', `${gradeLevel}-${subject}-${categoryPrefix}`);
console.log('[Cluster] Skills found:', cluster.skills.length);
console.log('[Cluster] Mastery threshold:', cluster.masteryThreshold);

// Career progression (NEW)
console.log('[Career] Total mastered:', journey.continuousProgress.totalSkillsMastered);
console.log('[Career] Current level:', journey.careerContext.currentLevel);
console.log('[Career] Next milestone:', nextMilestone);
```

---

## 🔄 SYSTEM RESET

If system is completely broken:

1. Verify all files in "FILES YOU MUST NEVER DELETE" exist
2. Check git status for accidental deletions
3. Ensure singleton pattern in all services:
   ```typescript
   private static instance: ServiceName;
   public static getInstance(): ServiceName {
     if (!ServiceName.instance) {
       ServiceName.instance = new ServiceName();
     }
     return ServiceName.instance;
   }
   ```
4. Verify containers import from V2-JIT versions:
   - AILearnContainerV2-JIT.tsx
   - AIExperienceContainerV2-JIT.tsx  
   - AIDiscoverContainerV2-JIT.tsx

---

## 📞 WHEN TO ESCALATE

If you encounter:
1. Architecture changes that violate CRITICAL RULES
2. Requests to remove type safety
3. Requests to bypass JIT generation
4. Issues not covered in this guide

**Action**: Refer back to original implementation plan in previous conversation and this troubleshooting guide before making changes.

---

## 🎯 K. PATHIQ AND CAREER SELECTION ISSUES

### K.1 IntroductionModal Career/Category Display Error
**Problem**: Grade 3-8 students get "Cannot read properties of undefined (reading '0')" error at IntroductionModal.tsx line 509.

**Root Cause**: PathIQ service returns different data structures based on grade:
- Grades K-2, 9-12: Returns career objects with `matchReasons` array
- Grades 3-8: Returns category objects without `matchReasons` array

**Quick Fix Applied**: Modified IntroductionModal to handle both formats:
```javascript
// Detect if object is category or career
const isCategory = career.category && !career.careerId;
const displayName = isCategory ? career.category.name : career.name;
// Show appropriate description
isCategory ? career.category.description : career.matchReasons[0]
```

### K.2 PathIQ Grade Grouping Issues
**Current Problems**:
1. Career pools don't match intended grade groupings (PreK-2, 3-5, 6-8, 9-12)
2. Grade 3-5 incorrectly returns categories instead of careers
3. Selection doesn't ensure 3 careers from 3 different categories

**Correct Grade Groupings Should Be**:
- **Early Elementary (PreK-2)**: Community helpers, basic careers
- **Elementary (3-5)**: Add Engineer, Scientist, Business Owner
- **Middle School (6-8)**: Add Programmer, Entrepreneur, etc.
- **High School (9-12)**: Add CEO, Data Scientist, etc.

**Files Involved**:
- `/src/screens/modal-first/IntroductionModal.tsx` - Display logic
- `/src/services/pathIQService.ts` - Career selection logic

---

## 🔢 L. NUMERIC AND INPUT QUESTION ISSUES

### L.1 Numeric Question Validation Failure
**Problem**: Numeric questions marking correct answers as incorrect

**Root Cause**: Missing numeric type handling in fallback validation (AILearnContainerV2-UNIFIED.tsx)

**Fix Location**: AILearnContainerV2-UNIFIED.tsx, lines ~650-660
```typescript
} else if (convertedQuestion.type === 'numeric') {
  const numQuestion = convertedQuestion as any;
  const tolerance = numQuestion.tolerance || 0.01;
  const userAnswer = parseFloat(answer);
  const correctAnswer = parseFloat(numQuestion.correctAnswer);
  const isCorrect = Math.abs(userAnswer - correctAnswer) <= tolerance;
  validationResult = {
    isCorrect: isCorrect,
    score: isCorrect ? 1 : 0,
    feedback: isCorrect ? 'Correct!' : `Not quite. The answer is ${numQuestion.correctAnswer}`,
    partialCredit: 0
  };
}
```

### L.2 Counting Question Missing Submit Button
**Problem**: Counting questions don't show submit button in practice mode

**Root Cause**: Submit button only shows when `practiceAnswers[idx] !== undefined`, but counting questions may have null/undefined initial state

**Fix Location**: AILearnContainerV2-UNIFIED.tsx, lines ~945-957
```typescript
{/* Submit button for practice questions - show for input-based types even if answer is undefined */}
{(practiceAnswers[idx] !== undefined || 
  ['counting', 'numeric', 'short_answer', 'fill_blank', 'long_answer', 'open_ended'].includes(questionObj.type)) && 
 practiceResults[idx] === undefined && (
  <div className={practiceStyles.practiceSubmit}>
    <button 
      className={`${buttonStyles.primary} ${buttonStyles.small}`}
      onClick={() => handlePracticeAnswer(idx, practiceAnswers[idx] ?? 0)}
    >
      Submit Answer
    </button>
  </div>
)}
```

---

## 🚀 M. PREGENERATION SYSTEM ISSUES

### M.1 PreGeneration Database Errors (400/404)
**Problem**: get_next_queue_item function returning 400 errors

**Root Cause**: Column name ambiguity and missing columns in database

**Fix**: Created proper migration 007_pregeneration_system.sql with:
- generation_queue table
- generation_workers table  
- generation_cache table
- Proper functions with unambiguous column references

### M.2 PreGeneration Triggering on Login
**Problem**: Cache warming starts immediately on login instead of when needed

**Better Practice**: Move PreGeneration initialization to LearnContainer

**Fix Location**: 
- Remove from Login.tsx (~line 146)
- Add to AILearnContainerV2-UNIFIED.tsx in main useEffect:
```typescript
// Initialize PreGeneration cache warming when entering Learn container
if (student?.id && student?.grade_level) {
  console.log('🔥 Initiating cache warming for student:', student.id);
  preGenerationService.warmCacheForStudent(student.id, student.grade_level).catch(err => {
    console.error('Cache warming failed:', err);
  });
  preGenerationService.startBackgroundProcessing();
}
```

---

END OF TROUBLESHOOTING GUIDE FOR CLAUDE