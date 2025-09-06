# Correct Answer CamelCase Fix

## Problem Identified
The "correct answer is not available" message was appearing because of a naming mismatch between the AI response and the converter code.

### Root Cause
- AI was sending `correctAnswer` (camelCase) in some responses
- Converter was looking for `correct_answer` (snake_case) 
- This caused `correctIndex` to be -1, making all options have `isCorrect: false`

### Console Evidence
```javascript
// What we were seeing:
{
  correct_answer: undefined,        // ❌ Not found (snake_case)
  correctAnswer: 0,                 // ✅ Actually exists (camelCase)
  correctIndex: -1,                 // ❌ Failed to find match
  foundMatch: false
}
```

## Solution Applied

Modified `AIContentConverter.ts` to check BOTH naming conventions:

### For Multiple Choice Questions:
```typescript
// Before (broken):
if (typeof assessment.correct_answer === 'number') {

// After (fixed):
const rawCorrectAnswer = assessment.correct_answer !== undefined 
  ? assessment.correct_answer 
  : assessment.correctAnswer;  // Check both!

if (typeof rawCorrectAnswer === 'number') {
```

### For True/False Questions:
Applied the same fix to handle both `correct_answer` and `correctAnswer`.

## Files Modified
- `/src/services/content/AIContentConverter.ts`
  - Added dual field checking for both snake_case and camelCase
  - Enhanced debug logging to show both fields
  - Applied fix to both `toMultipleChoiceQuestion` and `toTrueFalseQuestion`

## Expected Results

### Before Fix:
- `correctOption: undefined`
- All options showing `isCorrect: false`
- "The correct answer is not available" message

### After Fix:
- Correct option properly identified
- One option has `isCorrect: true`
- Correct answer displays properly

## Debug Logging
The converter now logs both fields to help identify issues:
```javascript
console.log('🔍 MULTIPLE CHOICE RAW INPUT:', {
  correct_answer: assessment.correct_answer,    // Check snake_case
  correctAnswer: assessment.correctAnswer,      // Check camelCase
  // ... rest of debug info
});
```

## Why This Happened
The inconsistency likely occurred because:
1. Different parts of the codebase use different naming conventions
2. AI responses may vary between snake_case and camelCase
3. The converter wasn't resilient to handle both formats

## Prevention
This fix makes the converter resilient to both naming conventions, preventing future issues regardless of which format the AI or other services use.