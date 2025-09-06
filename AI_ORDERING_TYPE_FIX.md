# AI Ordering Type and Grade Category Fix

## Issues Fixed

### 1. AI Using Unsupported 'ordering' Type
**Problem:** AI was generating questions with type='ordering' which is not supported by our system.

**Solution:** Added FORBIDDEN_TYPES to UniversalRules.ts:
```typescript
FORBIDDEN_TYPES: [
  'ordering',      // NOT SUPPORTED - use multiple_choice instead
  'matching',      // NOT SUPPORTED
  'essay',         // NOT SUPPORTED
  'drag_drop',     // NOT SUPPORTED
  'drawing'        // NOT SUPPORTED
]
```

The prompt now explicitly tells AI:
- ❌ NEVER use these forbidden types
- If you need ordering, use multiple_choice with ordered options instead

### 2. ReferenceError: isYoungLearner is not defined
**Problem:** Code at line 871 referenced `isYoungLearner` which was defined in the now-commented old prompt code.

**Solution:** Replaced with proper grade category system:
```typescript
// Before (broken):
if (isYoungLearner && skill.subject === 'Math' && content.examples) {

// After (fixed):
const gradeCategory = getGradeCategory(student.grade_level);
if (gradeCategory === 'K-2' && skill.subject === 'Math' && content.examples) {
```

This aligns with our hierarchical rules system that uses grade categories:
- K-2 (Kindergarten through Grade 2)
- 3-5 (Grades 3-5)
- 6-8 (Middle school)
- 9-12 (High school)

## Files Modified

1. `/src/services/ai-prompts/rules/UniversalRules.ts`
   - Added FORBIDDEN_TYPES array
   - Updated formatUniversalRulesForPrompt() to include forbidden types warning

2. `/src/services/AILearningJourneyService.ts`
   - Imported getGradeCategory from SubjectRules
   - Replaced isYoungLearner with proper grade category check

## Testing

After these fixes:
1. ✅ AI should not generate 'ordering' type questions
2. ✅ No more ReferenceError for isYoungLearner
3. ✅ Grade-appropriate visual requirements work correctly
4. ✅ PromptBuilder includes forbidden type warnings

## Console Messages to Verify

Look for:
```
🚀 USING NEW PROMPT BUILDER - Length: 9000+ characters
📋 Prompt validation: {
  hasMandatoryFields: true,
  hasCorrectAnswer: true,
  hasPracticeSupport: true,
  hasVisualField: true,
  hasQualityCheck: true
}
```

And NO errors about:
- "Unknown question type: ordering"
- "ReferenceError: isYoungLearner is not defined"

## Remaining Issue

The practice questions may still show placeholder text like "Let's practice..." instead of actual questions. This appears to be a fallback mechanism when AI generation fails and needs separate investigation.