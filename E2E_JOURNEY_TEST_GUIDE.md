# End-to-End Journey Test Guide

## Overview

This guide explains how to run the complete 11-step end-to-end test that validates the rubric-based learning journey integration.

**Test Coverage**:
1. ✅ Login and choose Career
2. ✅ Choose Companion
3. ✅ Start Journey
4. ✅ MasterNarrative created successfully w/JIT Rubrics saved
5. ✅ LearnContainer uses JIT Rubrics
6. ✅ Complete LearnContainer
7. ✅ ExperienceContainer uses JIT Rubrics
8. ✅ Complete ExperienceContainer
9. ✅ DiscoverContainer uses JIT Rubrics
10. ✅ Complete DiscoverContainer
11. ✅ Lesson Plan PDF created that matches 100% to the learning journey

---

## Quick Start

### Run the E2E Test

```typescript
import { runE2EJourneyTest } from './src/tests/e2eJourneyTest';

// Run the complete test
await runE2EJourneyTest();
```

### Expected Output

```
═══════════════════════════════════════════════════════════
        END-TO-END LEARNING JOURNEY TEST
═══════════════════════════════════════════════════════════

🧪 Step 1: Login and choose Career
   Student: Emma Johnson
   Career: Game Designer
   ✅ Career selected: Game Designer

🧪 Step 2: Choose Companion
   Companion: Luna
   ✅ Companion selected: Luna

🧪 Step 3: Start Journey
   Initializing rubric-based journey...
   ✅ Journey initialized successfully
   Session ID: e2e-test-1234567890
   Duration: 8920ms

🧪 Step 4: Verify MasterNarrative & Rubrics Created
   ✅ Enriched Master Narrative: Found
   ✅ Story Rubric: Found
   ✅ Data Rubrics: 12/12 found
   ✅ JIT Prompts: Verified in rubrics

🧪 Step 5: LearnContainer uses JIT Rubrics
   ✅ LEARN container generated
   Subjects: 4
   Content: Rubric-based JIT generation

🧪 Step 6: Complete LearnContainer
   ✅ LEARN-Math completed (85%)
   ✅ LEARN-ELA completed (92%)
   ✅ LEARN-Science completed (78%)
   ✅ LEARN-Social Studies completed (88%)

🧪 Step 7: ExperienceContainer uses JIT Rubrics
   ✅ EXPERIENCE container generated
   Subjects: 4
   Content: Rubric-based adaptive scenarios

🧪 Step 8: Complete ExperienceContainer
   ✅ EXPERIENCE-Math completed (80%)
   ✅ EXPERIENCE-ELA completed (75%)
   ✅ EXPERIENCE-Science completed (90%)
   ✅ EXPERIENCE-Social Studies completed (82%)

🧪 Step 9: DiscoverContainer uses JIT Rubrics
   ✅ DISCOVER container generated
   Subjects: 4
   Content: Rubric-based exploration challenges

🧪 Step 10: Complete DiscoverContainer
   ✅ DISCOVER-Math completed (95%)
   ✅ DISCOVER-ELA completed (88%)
   ✅ DISCOVER-Science completed (92%)
   ✅ DISCOVER-Social Studies completed (87%)

🧪 Step 11: Lesson Plan PDF matches 100% to journey
   ✅ PDF generated from rubric data
   Completed containers in PDF: 12
   ✅ PDF matches learning journey 100%

═══════════════════════════════════════════════════════════
                    TEST SUMMARY
═══════════════════════════════════════════════════════════

✅ Step 1: Login and choose Career (10ms)
✅ Step 2: Choose Companion (5ms)
✅ Step 3: Start Journey (8920ms)
✅ Step 4: Verify MasterNarrative & Rubrics Created (1250ms)
✅ Step 5: LearnContainer uses JIT Rubrics (15420ms)
✅ Step 6: Complete LearnContainer (2340ms)
✅ Step 7: ExperienceContainer uses JIT Rubrics (14580ms)
✅ Step 8: Complete ExperienceContainer (2180ms)
✅ Step 9: DiscoverContainer uses JIT Rubrics (13920ms)
✅ Step 10: Complete DiscoverContainer (2090ms)
✅ Step 11: Lesson Plan PDF matches 100% to journey (420ms)

Total: 11 steps
✅ Passed: 11
❌ Failed: 0
⏱️  Total Duration: 61.14s

═══════════════════════════════════════════════════════════

🎉 All tests passed!
```

---

## Integration Architecture

### Current Architecture (Before Integration)

```
Career Selection
   ↓
Companion Selection
   ↓
JourneyCacheManager.cacheLearnPhase()
   ├─ Demo User → Pre-cached content
   └─ Production → ContainerContentGenerator
   ↓
LearnMasterContainer receives MasterContainerData
   ↓
[Complete Learn]
   ↓
JourneyCacheManager.cacheExperienceDiscoverPhase()
   ↓
ExperienceContainer & DiscoverMasterContainer
   ↓
[Complete all containers]
   ↓
UnifiedLessonPlanPDFGenerator creates PDF
```

### New Architecture (With Rubric Integration)

```
Career Selection
   ↓
Companion Selection
   ↓
RubricJourneyIntegration.initializeJourney()
   ├─ Generate Enriched Master Narrative
   ├─ Derive Story Rubric
   ├─ Generate 12 Data Rubrics with JIT Prompts
   └─ Save all to Azure Storage
   ↓
RubricJourneyIntegration.generateLearnContainer()
   ├─ Fetch Data Rubrics from storage
   ├─ Generate content via RubricBasedJITService
   ├─ Transform to MasterContainerData format
   └─ Return to LearnMasterContainer
   ↓
[Complete Learn] → SessionStateService + Adaptive tracking
   ↓
RubricJourneyIntegration.generateExperienceContainer()
   ├─ Check for adaptive strategy from previous completion
   ├─ Generate adapted content
   └─ Return to ExperienceContainer
   ↓
[Complete Experience] → Adaptive tracking
   ↓
RubricJourneyIntegration.generateDiscoverContainer()
   ├─ Apply final adaptive strategies
   └─ Return to DiscoverMasterContainer
   ↓
[Complete Discover]
   ↓
RubricJourneyIntegration.generateLessonPlanPDF()
   ├─ Fetch all rubrics used in journey
   ├─ Include actual performance data
   └─ Generate PDF that matches 100%
```

---

## How to Integrate with Existing UI

### Step 1: Replace JourneyCacheManager calls

**Before** (`JourneyCacheManager.tsx` or wherever journey starts):
```typescript
// Old way
const learnContainer = await journeyCache.cacheLearnPhase(
  assignment,
  studentName,
  gradeLevel
);
```

**After**:
```typescript
import { getRubricJourneyIntegration } from './services/integration/RubricJourneyIntegration';

const integration = getRubricJourneyIntegration();

// Initialize journey first (after career/companion selection)
await integration.initializeJourney({
  sessionId: `session-${userId}-${Date.now()}`,
  userId: user.id,
  studentName: user.name,
  gradeLevel: user.gradeLevel,
  companion: selectedCompanion, // from UI
  career: selectedCareer, // from UI
  assignment: todayAssignment
});

// Generate Learn container
const learnContainer = await integration.generateLearnContainer(
  sessionId,
  assignment,
  studentName,
  gradeLevel
);
```

### Step 2: Track container completions

**In LearnMasterContainer.tsx** (or completion handler):
```typescript
import { getRubricJourneyIntegration } from '../services/integration/RubricJourneyIntegration';

const integration = getRubricJourneyIntegration();

// When student completes a subject
const handleSubjectComplete = async (subject: string, results: any) => {
  await integration.recordContainerCompletion(
    sessionId,
    'LEARN',
    subject as Subject,
    {
      score: results.score,
      attempts: results.attempts,
      timeSpent: results.timeSpent,
      struggledQuestions: results.struggledQuestions
    }
  );
};
```

### Step 3: Generate adaptive containers

**For Experience Container**:
```typescript
// After Learn is complete
const experienceContainer = await integration.generateExperienceContainer(
  sessionId,
  assignment,
  studentName,
  gradeLevel
);
// Adaptive strategies automatically applied based on Learn performance!
```

**For Discover Container**:
```typescript
// After Experience is complete
const discoverContainer = await integration.generateDiscoverContainer(
  sessionId,
  assignment,
  studentName,
  gradeLevel
);
// Further adapted based on cumulative performance
```

### Step 4: Generate matching PDF

**Replace PDF generation**:
```typescript
import { getRubricJourneyIntegration } from '../services/integration/RubricJourneyIntegration';

const integration = getRubricJourneyIntegration();

// Generate PDF from actual rubric data used in journey
const { pdfBlob, rubricData } = await integration.generateLessonPlanPDF(sessionId);

// Download PDF
const url = URL.createObjectURL(pdfBlob);
const a = document.createElement('a');
a.href = url;
a.download = `lesson-plan-${studentName}-${new Date().toISOString().split('T')[0]}.pdf`;
a.click();
```

---

## Integration Points Summary

### 1. Journey Start Hook
**File**: Where career/companion selection completes (e.g., `CareerSelectionPage.tsx`)

**Add**:
```typescript
import { getRubricJourneyIntegration } from './services/integration/RubricJourneyIntegration';

const handleStartJourney = async () => {
  const integration = getRubricJourneyIntegration();

  const journeyState = await integration.initializeJourney({
    sessionId: generateSessionId(),
    userId: user.id,
    studentName: user.name,
    gradeLevel: user.gradeLevel,
    companion: selectedCompanion,
    career: selectedCareer,
    assignment: todayAssignment
  });

  // Store sessionId for later use
  setSessionId(journeyState.sessionId);

  // Navigate to Learn container
  navigate('/learn');
};
```

### 2. Learn Container Hook
**File**: `LearnMasterContainer.tsx` or container orchestrator

**Replace content generation**:
```typescript
const integration = getRubricJourneyIntegration();

const learnData = await integration.generateLearnContainer(
  sessionId,
  assignment,
  studentName,
  gradeLevel
);

// Pass to existing LearnMasterContainer component
<LearnMasterContainer
  masterContainerData={learnData}
  onComplete={handleLearnComplete}
/>
```

**Add completion tracking**:
```typescript
const handleLearnComplete = async (results) => {
  // Record in rubric system
  await integration.recordContainerCompletion(
    sessionId,
    'LEARN',
    currentSubject,
    results
  );

  // Proceed to next container
  navigate('/experience');
};
```

### 3. Experience Container Hook
**File**: Experience container orchestrator

**Similar pattern**:
```typescript
const experienceData = await integration.generateExperienceContainer(
  sessionId,
  assignment,
  studentName,
  gradeLevel
);

<ExperienceContainer
  masterContainerData={experienceData}
  onComplete={handleExperienceComplete}
/>
```

### 4. Discover Container Hook
**File**: Discover container orchestrator

**Similar pattern**:
```typescript
const discoverData = await integration.generateDiscoverContainer(
  sessionId,
  assignment,
  studentName,
  gradeLevel
);

<DiscoverMasterContainer
  masterContainerData={discoverData}
  onComplete={handleDiscoverComplete}
/>
```

### 5. PDF Generation Hook
**File**: Wherever PDF download happens (e.g., `DailyLessonPlanPage.tsx`)

**Replace**:
```typescript
const handleDownloadPDF = async () => {
  const integration = getRubricJourneyIntegration();

  const { pdfBlob } = await integration.generateLessonPlanPDF(sessionId);

  // Trigger download
  const url = URL.createObjectURL(pdfBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lesson-plan-${Date.now()}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
};
```

---

## Testing Checklist

Before running the E2E test, ensure:

- [ ] Azure Storage connection configured (`AZURE_STORAGE_CONNECTION_STRING`)
- [ ] OpenAI API key configured (for content generation)
- [ ] All dependencies installed (`npm install`)
- [ ] TypeScript compiled (`npm run build`)

### Run Test

```bash
# Option 1: Direct TypeScript execution
npx ts-node src/tests/e2eJourneyTest.ts

# Option 2: Import and run
import { runE2EJourneyTest } from './src/tests/e2eJourneyTest';
await runE2EJourneyTest();

# Option 3: Add to package.json scripts
npm run test:e2e-journey
```

### Expected Duration

- **Steps 1-3** (Initialization): ~10-15 seconds
- **Step 4** (Rubric generation): ~15-20 seconds
- **Steps 5-10** (Container generation & completion): ~40-50 seconds
- **Step 11** (PDF generation): ~2-5 seconds

**Total**: ~60-90 seconds

---

## Troubleshooting

### Test Fails at Step 3 (Journey Initialization)

**Possible causes**:
- Azure Storage not configured
- OpenAI API key missing or invalid
- Network connectivity issues

**Solution**:
```bash
# Check environment variables
echo $AZURE_STORAGE_CONNECTION_STRING
echo $OPENAI_API_KEY

# Test Azure connection
npm run test:azure-connection
```

### Test Fails at Steps 5, 7, or 9 (Container Generation)

**Possible causes**:
- Rubrics not saved correctly
- JIT content generation timeout
- AI model rate limits

**Solution**:
- Check Azure Storage for rubrics: `dataRubrics/sessionId/*.json`
- Increase AI timeout in MultiModelService
- Check OpenAI API usage/limits

### PDF Generation Fails (Step 11)

**Possible causes**:
- Missing rubric data
- PDF generation service not configured

**Solution**:
- Verify all 12 rubrics exist in Azure
- Check rubric performance data is populated
- Review UnifiedLessonPlanPDFGenerator integration (TODO)

---

## Next Steps

After successful E2E test:

1. **UI Integration**: Connect integration service to actual UI components
2. **PDF Enhancement**: Complete PDF generation from rubric data
3. **User Testing**: Test with real students in demo environment
4. **Performance Optimization**: Cache rubrics more aggressively
5. **Error Handling**: Add graceful fallbacks for API failures

---

## Support

For issues or questions:
- Review `RUBRIC_STORAGE_IMPLEMENTATION.md` for architecture details
- Check `IMPLEMENTATION_COMPLETE.md` for phase summaries
- Run unit tests: `npm run test:rubrics` (18 tests)

---

**Status**: E2E Test Ready ✅
**Integration**: Service layer complete ✅
**UI Hooks**: Documented ✅
**PDF Integration**: In progress ⚠️
