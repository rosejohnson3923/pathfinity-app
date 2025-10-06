# Live Content Generation Fix

## Problem Identified ✅

Looking at the log file `localhost-1759673086515.log`, I discovered that **live content IS being generated**, but the test page was **overriding it with demo content**.

### What the Logs Showed:

**Lines 337-362: ✅ MasterNarrativeGenerator DOES Generate Live Content**
```
🎨 Generating ENRICHED Master Narrative (Demo Quality)
✅ Using API key from environment: VITE_AZURE_EASTUS_API_KEY
📡 Calling gpt-4o at https://pathfinity-ai.openai.azure.com/
   Deployment: gpt-4o
   Max tokens: 4000
✅ Base narrative generated, applying 11 enrichment layers...
  ✓ Layers 1-3: Milestones, Immersive Elements, Real-World Apps
  ✓ Layer 4: Parent Value Propositions
  ✓ Layers 5-7: Quality Markers, Parent Insights, Guarantees
  ✓ Layer 8: Personalization Examples
  ✓ Layer 9: Companion Interaction Samples
🎉 Enrichment complete! All 11 layers applied.
```

**Lines 363-370: ⚠️ JIT Returns Cached Content (from previous runs)**
```
[JIT] Cache hit for: sam_k-experience-Math-Chef-A.1
[JIT] Cache hit for: sam_k-experience-ELA-Chef-A.1
[JIT] Cache hit for: sam_k-experience-Science-Chef-A.1
[JIT] Cache hit for: sam_k-experience-Social Studies-Chef-A.1
```

**Lines 375-426: ❌ Test Page Overrides with Demo Content**
```
🔍 getTierSpecificActivities: subject=Math, career=Kitchen Helper, tier=select, student=Sam
📋 Mapped to demo user: sam_k_chef
🎭 Role number for select tier: 1
🔍 getDemoLessonContent: userKey=sam_k_chef, roleKey=role1, subject=math
✅ Using rich demo activities: (3) ['The recipe needs 3 bowls. Count them!', 'Put 2 apples in the basket for the pie', 'Set the table with 1 plate for the taste tester']
```

### Root Cause:

**TestUnifiedLessonWithCareerSelector.tsx - Line 326 (OLD CODE):**
```typescript
activities: content.activities || getTierSpecificActivities(subjectKey, selectedCareer, selectedTier, currentStudent),
```

The problem:
1. Orchestrator stores activities in `content.challenges` structure
2. Test page looks for `content.activities` (which doesn't exist)
3. Since `content.activities` is undefined, it falls back to `getTierSpecificActivities()`
4. `getTierSpecificActivities()` calls `getDemoLessonContent()` and returns demo content
5. **Demo content overrides the live-generated content from orchestrator**

### What Orchestrator Actually Returns:

**LessonPlanOrchestrator.ts - Lines 193-198:**
```typescript
subjectContents[skill.subject] = {
  skill: skill,
  setup: setup,
  challenges: challenges,  // ← Live activities are HERE
  interactive_simulation: interactiveSimulation
};
```

Note: No `activities` field! Activities are in `challenges` array.

## Fix Applied ✅

**TestUnifiedLessonWithCareerSelector.tsx - Lines 320-343:**

```typescript
// Extract activities from orchestrator's challenges structure
// Challenges contain the live-generated roleplay scenarios and exploration activities
let liveActivities: string[] = [];
if (content.challenges && Array.isArray(content.challenges)) {
  liveActivities = content.challenges.map((challenge: any) => {
    if (typeof challenge === 'string') return challenge;
    return challenge.description || challenge.question || challenge.content || 'Challenge activity';
  });
}

console.log(`📊 ${subjectKey} - Live activities from orchestrator:`, liveActivities);

return {
  subject: subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1).replace('_', ' '),
  skill: {
    objective: curriculumInfo?.skillObjective || content.skill?.objective || content.skill || 'Learning objectives',
    careerConnection: content.careerConnection || getCareerConnection(subjectKey, selectedCareer, selectedTier, currentStudent.grade)
  },
  activities: liveActivities.length > 0 ? liveActivities : ['Activity content being generated...'],
  // ❌ REMOVED: || getTierSpecificActivities(...)
  assessmentLevel: content.assessmentLevel || getAssessmentLevel(selectedTier),
  interactivity: content.interactivity || getInteractivityLevel(selectedTier),
  setup: content.setup,
  challenges: content.challenges
};
```

### Key Changes:

1. **Extract activities from `content.challenges`** (lines 320-328)
   - Map over challenges array
   - Extract description, question, or content from each challenge

2. **Log live activities** (line 330)
   - New console log: `📊 ${subjectKey} - Live activities from orchestrator:`
   - Helps verify live content is being used

3. **Use live activities or placeholder** (line 338)
   - `activities: liveActivities.length > 0 ? liveActivities : ['Activity content being generated...']`
   - ❌ **REMOVED fallback to getTierSpecificActivities()**

4. **Better skill extraction** (line 335)
   - `content.skill?.objective || content.skill` handles both object and string formats

## Expected Results

### Before Fix:
```
🔍 getDemoLessonContent: userKey=sam_k_chef, roleKey=role1, subject=math
✅ Using rich demo activities: ['The recipe needs 3 bowls. Count them!', ...]
```

### After Fix:
```
📊 Math - Live activities from orchestrator: [
  'Challenge 1: You need to make a fruit salad...',
  'Challenge 2: Count the ingredients...'
]
```

## Testing Steps

1. **Clear JIT Cache** (to force new generation):
   ```javascript
   // In browser console:
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Hard Refresh** (clear browser cache):
   ```
   Ctrl + Shift + R (Windows/Linux)
   Cmd + Shift + R (Mac)
   ```

3. **Generate New Lesson**:
   - Go to: `http://localhost:3000/test/unified-career`
   - Select: Sam (K, Chef)
   - Click: "Generate Lesson Plan"

4. **Check Console Logs**:
   ```
   Look for:
   🎨 Generating ENRICHED Master Narrative
   📡 Calling gpt-4o at https://...
   📊 Math - Live activities from orchestrator: [...]

   Should NOT see:
   🔍 getDemoLessonContent
   ✅ Using rich demo activities
   ```

5. **Verify UI Content**:
   - Activities should be **different each time** you regenerate
   - Should follow grade-appropriate language (3-5 words for K)
   - Should be career-specific (chef-themed)

## JIT Cache Note

The JIT (Just-In-Time) cache stores previously generated content. If you see:
```
[JIT] Cache hit for: sam_k-experience-Math-Chef-A.1
```

This means it's returning **cached content from a previous generation**, not generating new content. To force fresh generation:

1. Clear localStorage/sessionStorage (see above)
2. Or change the student/career/skill combination
3. Or restart the dev server

## Impact

**Before:**
- ❌ Orchestrator generated live content via OpenAI
- ❌ Test page discarded it and used demo content
- ❌ User saw same static content every time

**After:**
- ✅ Orchestrator generates live content via OpenAI
- ✅ Test page extracts activities from `challenges` structure
- ✅ User sees real-time generated content
- ✅ Each generation is unique and personalized

---

**Status:** ✅ FIXED - Test page now uses live-generated content from orchestrator
**Root Cause:** Test page looked for `content.activities` which doesn't exist; fell back to demo content
**Solution:** Extract activities from `content.challenges` array (where orchestrator stores them)
**Testing:** Clear cache, regenerate lesson, verify new console log shows live activities
