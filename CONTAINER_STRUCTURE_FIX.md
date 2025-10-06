# Container Structure Fix - Experience & Discover

## Problem Identified ✅

The MasterNarrativeGenerator was describing **all three containers (Learn, Experience, Discover) as if they follow the same instructional structure**, when they actually have very different formats:

### Before Fix (Incorrect):
All containers described generically:
- **Learn**: "Sam studies how doctors organize and help"
- **Experience**: "Sam makes real doctor helper decisions"
- **Discover**: "Sam helps at health screening stations"

❌ **Problem**: Doesn't explain that Experience uses SCENARIOS and Discover uses EXPLORATION CHALLENGES

### Actual Implementation:
**Learn Container:**
- Instructional Video
- Practice Questions (5)
- Assessment (1)

**Experience Container (from Orchestrator.ts:649-667):**
- Scenario 1: "A Day as a Chef" - roleplay workplace tasks
- Scenario 2: "Chef's Problem Solving" - solve career challenge
- ❌ **NOT practice questions!**

**Discover Container (from Orchestrator.ts:670-687):**
- Challenge 1: "Chef Explorer" - Visit virtual location, find 3 ways chefs use skills
- Challenge 2: "Community Helper Hunt" - Observe chefs in community
- ❌ **NOT practice questions!**

## Fix Applied ✅

### 1. Updated settingProgression Structure

**MasterNarrativeGenerator.ts - Lines 366-387:**

```typescript
"settingProgression": {
  "learn": {
    "location": "CareerInc Virtual Academy - ${career} Classroom",
    "context": "Instructional content: Learning ${career} basics with [career] examples",
    "narrative": "${studentName} studies how ${career}s [core learning activity]",
    "structure": "Instructional Video → Practice Questions (5) → Assessment (1)"
  },
  "experience": {
    "location": "CareerInc [specific ${career} workplace]",
    "context": "Hands-on scenarios: ${studentName} roleplays being a ${career} and solves real problems",
    "narrative": "${studentName} works through two career scenarios",
    "structure": "Scenario 1: 'A Day as a ${career}' (roleplay workplace tasks) → Scenario 2: '${career}'s Problem Solving' (solve career challenge)",
    "scenarioTypes": "Roleplay simulations and problem-solving challenges, NOT practice questions"
  },
  "discover": {
    "location": "[Community location] for ${career}s",
    "context": "Exploration challenges: Find real-world applications and observe ${career}s in community",
    "narrative": "${studentName} explores how ${career}s use skills in real life",
    "structure": "Challenge 1: '${career} Explorer' (find 3 ways ${career}s use skills) → Challenge 2: 'Community Helper Hunt' (observe ${career}s in community)",
    "challengeTypes": "Exploration and observation activities, NOT practice questions"
  }
}
```

### 2. Updated subjectContextsAligned

**MasterNarrativeGenerator.ts - Lines 393-414:**

```typescript
"subjectContextsAligned": {
  "math": {
    "learn": "Watch instructional video and practice how ${career}s use [specific math skill for grade ${gradeLevel}]",
    "experience": "Roleplay: Use [math skill] as a ${career} in workplace scenarios",
    "discover": "Explore: Find 3 ways ${career}s use [math skill] in real community locations"
  },
  // ... same pattern for ela, science, socialStudies
}
```

### 3. Added Critical Container Type Explanation

**MasterNarrativeGenerator.ts - Lines 462-479:**

```
CRITICAL - UNDERSTAND THE THREE CONTAINER TYPES:

1. LEARN Container = Traditional Instruction
   - Instructional Video → Practice Questions (5) → Assessment (1)
   - Students WATCH and PRACTICE with questions
   - Example: "Watch video about counting, then answer 5 counting questions"

2. EXPERIENCE Container = Roleplay Scenarios (NOT practice questions!)
   - Scenario 1: "A Day as a ${career}" (roleplay workplace tasks)
   - Scenario 2: "${career}'s Problem Solving" (solve career-specific challenge)
   - Students IMAGINE and SOLVE as if they ARE the ${career}
   - Example: "Imagine you're a chef today and help 3 customers" (NOT multiple choice questions!)

3. DISCOVER Container = Exploration Challenges (NOT practice questions!)
   - Challenge 1: "${career} Explorer" (find 3 ways ${career}s use the skill in virtual location)
   - Challenge 2: "Community Helper Hunt" (observe ${career}s in real community)
   - Students EXPLORE and OBSERVE real-world applications
   - Example: "Visit virtual kitchen and find 3 ways chefs use counting" (NOT multiple choice questions!)
```

## What Changed

### Before (Generic descriptions):
```json
{
  "experience": {
    "context": "Sam's workplace where teddy bear patients visit",
    "narrative": "Sam makes real doctor helper decisions"
  },
  "discover": {
    "context": "Field trip to see how doctors serve communities",
    "narrative": "Sam helps at health screening stations"
  }
}
```

### After (Scenario & Exploration specific):
```json
{
  "experience": {
    "context": "Hands-on scenarios: Sam roleplays being a Doctor and solves real problems",
    "narrative": "Sam works through two career scenarios",
    "structure": "Scenario 1: 'A Day as a Doctor' → Scenario 2: 'Doctor's Problem Solving'"
  },
  "discover": {
    "context": "Exploration challenges: Find real-world applications and observe Doctors in community",
    "narrative": "Sam explores how Doctors use skills in real life",
    "structure": "Challenge 1: 'Doctor Explorer' → Challenge 2: 'Community Helper Hunt'"
  }
}
```

## Expected Results

### For Kindergarten Sam (Chef):

**Learn Container:**
- ✅ "Watch video. Chef counts items." (instructional)
- ✅ Practice question: "How many apples?" (multiple choice)
- ✅ Assessment question: "Count the pots." (assessment)

**Experience Container:**
- ✅ Scenario 1: "A Day as a Chef - Help chef cook soup. Count items." (roleplay)
- ✅ Scenario 2: "Chef's Problem - Chef needs help. Count missing items." (problem solving)
- ❌ NOT: Multiple choice questions

**Discover Container:**
- ✅ Challenge 1: "Chef Explorer - Find 3 ways chefs count in kitchen." (exploration)
- ✅ Challenge 2: "Community Helper Hunt - Look for chefs this week." (observation)
- ❌ NOT: Multiple choice questions

## Verification Steps

1. **Generate new lesson** (clear cache first):
   ```
   http://localhost:3000/test/unified-career
   Select: Sam (K, Chef)
   Click: Generate Lesson Plan
   ```

2. **Check console for new narrative**:
   ```
   Look for: "🎨 Generating ENRICHED Master Narrative"
   Should see: Updated context descriptions
   ```

3. **Inspect generated narrative** (in console):
   ```javascript
   // Experience should say:
   context: "Hands-on scenarios: Sam roleplays being a Chef and solves real problems"

   // Discover should say:
   context: "Exploration challenges: Find real-world applications and observe Chefs in community"
   ```

4. **Check subjectContents structure**:
   ```javascript
   subjectContents['math'] = {
     // Learn: Video + questions
     // Experience: experienceScenarios (2 scenarios)
     // Discover: discoverChallenges (2 challenges)
   }
   ```

## Technical Details

### Files Modified:
1. **MasterNarrativeGenerator.ts**
   - Lines 366-387: Updated settingProgression with structure details
   - Lines 393-414: Updated subjectContextsAligned to clarify container types
   - Lines 462-479: Added CRITICAL section explaining container differences
   - Lines 491-493: Added specific instructions for each container type

### How It Works:

1. **AI Prompt Enhancement**: The prompt now explicitly tells the AI that:
   - Learn = Video + Questions
   - Experience = Scenarios (roleplay, problem-solving)
   - Discover = Challenges (exploration, observation)

2. **Narrative Context**: The `context` field now starts with:
   - "Instructional content:" for Learn
   - "Hands-on scenarios:" for Experience
   - "Exploration challenges:" for Discover

3. **Structure Documentation**: Added `structure` field to show exact flow:
   - Learn: "Instructional Video → Practice Questions (5) → Assessment (1)"
   - Experience: "Scenario 1: 'A Day as a Chef' → Scenario 2: 'Chef's Problem Solving'"
   - Discover: "Challenge 1: 'Chef Explorer' → Challenge 2: 'Community Helper Hunt'"

### Integration with Orchestrator:

The orchestrator (LessonPlanOrchestrator.ts) already generates:
- **Line 385**: `experienceScenarios: this.generateExperienceScenarios(career, skill)`
- **Line 386**: `discoverChallenges: this.generateDiscoverChallenges(career, skill)`

These are stored in `subjectContents[subject]` and used by:
- PDF Generator (to display scenarios/challenges)
- UI (to show appropriate content for each container)

## Container Rules Alignment

The AI prompt container rules should also be updated to reflect this (future work):

**ExperienceContainerRules.ts** (Current - needs review):
```typescript
structure: {
  examples: '3 demonstrations of skill in action',
  practice: '5 hands-on activities building toward project',  // ❌ Says "practice"
  assessment: '1 creative application of learned skills'
}
```

**Should be** (to match actual implementation):
```typescript
structure: {
  scenario1: 'A Day as a [Career] - roleplay workplace tasks',
  scenario2: '[Career]\'s Problem Solving - solve career challenge'
}
```

**DiscoverContainerRules.ts** (Current - needs review):
```typescript
structure: {
  examples: '3 career exploration scenarios (multiple-choice format)',  // ❌ Says "multiple-choice"
  practice: '2 discovery practice scenarios (multiple-choice format)',
  assessment: '1 challenge scenario (multiple-choice format)'
}
```

**Should be** (to match actual implementation):
```typescript
structure: {
  challenge1: '[Career] Explorer - find 3 ways career uses skill in virtual location',
  challenge2: 'Community Helper Hunt - observe career professionals in community'
}
```

## Impact

**Before:** MasterNarrativeGenerator described all containers as similar learning activities
- ❌ "Sam makes real doctor helper decisions" (vague)
- ❌ "Sam helps at health screening stations" (unclear format)

**After:** Clear differentiation of container types
- ✅ "Hands-on scenarios: Sam roleplays being a Doctor and solves real problems"
- ✅ "Exploration challenges: Find real-world applications and observe Doctors in community"
- ✅ AI understands Experience = scenarios, NOT questions
- ✅ AI understands Discover = exploration, NOT questions

---

**Status:** ✅ FIXED - MasterNarrativeGenerator now correctly describes Experience (scenarios) and Discover (challenges) containers
**Testing:** Ready for validation with all 4 demo users
**Documentation:** Updated in this file
**Next Step:** Consider updating ExperienceContainerRules.ts and DiscoverContainerRules.ts to match actual implementation
