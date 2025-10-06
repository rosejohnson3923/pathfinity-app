# AILearningJourney & Container Integration Analysis

**Purpose**: Map how MasterNarrative enrichment flows through to student-facing Learn, Experience, and Discover containers.

**Created**: 2025-10-05
**Related Documents**:
- PART1_GENERATOR_ENRICHMENT.md (MasterNarrativeGenerator enhancement)
- PART2_LESSON_PLAN_PDF_PIPELINE.md (Lesson plan PDF generation)
- DEMO_VS_PRODUCTION_GAP_ANALYSIS.md (Demo vs Production comparison)

---

## 1. Executive Summary

### Critical Finding

The enrichment integration **already has infrastructure in place** but only uses BASIC MasterNarrative fields. Enrichment fields from `DemonstrativeMasterNarrativeGenerator` are **NOT** flowing through to student containers.

### Current Flow (INCOMPLETE)

```
MasterNarrativeGenerator (basic fields only)
  ↓
LessonPlanOrchestrator
  ↓
JustInTimeContentService (narrativeContext with 7 basic fields)
  ↓
AILearningJourneyService.getStorylineContext()
  ↓
PromptBuilder.buildPrompt() (basic narrative section)
  ↓
AI generates Learn/Experience/Discover content (MISSING ENRICHMENT)
```

### Required Flow (COMPLETE)

```
MasterNarrativeGenerator (+ 11 ENRICHMENT LAYERS)
  ↓
LessonPlanOrchestrator (pass enrichment)
  ↓
JustInTimeContentService (narrativeContext + ENRICHMENT FIELDS)
  ↓
AILearningJourneyService.getStorylineContext() (use enrichment)
  ↓
PromptBuilder.buildPrompt() (inject enrichment into prompts)
  ↓
AI generates ENRICHED Learn/Experience/Discover content
```

---

## 2. Current Integration Points

### 2.1 AILearningJourneyService

**File**: `/src/services/AILearningJourneyService.ts`

**Purpose**: Generates student-facing content for all three containers

**Methods**:
- `generateLearnContent()` (lines 268-654) - Learn container
- `generateExperienceContent()` (lines 958-1188) - Experience container
- `generateDiscoverContent()` (lines 1197-1339) - Discover container

**Key Integration Method**: `getStorylineContext()` (lines 161-201)

**Current Implementation**:
```typescript
private getStorylineContext(
  skillKey: string,
  skill: LearningSkill,
  career?: { name: string; description?: string },
  narrativeContext?: any  // From MasterNarrative
) {
  // Use MasterNarrative context if available
  const newContext = narrativeContext ? {
    // ONLY BASIC FIELDS USED
    scenario: narrativeContext.narrative || ...,
    character: career ? `a ${career.name}` : 'a professional',
    setting: narrativeContext.setting || ...,
    currentChallenge: narrativeContext.context || ...,
    careerConnection: narrativeContext.throughLine || ...,
    mission: narrativeContext.mission,
    companion: narrativeContext.companion,
    subjectContext: narrativeContext.subjectContext,
    timestamp: new Date()
  } : { /* fallback */ }
}
```

**Gap**: Enrichment fields (milestones, immersiveElements, realWorldApplications, etc.) are NOT used.

---

### 2.2 JustInTimeContentService

**File**: `/src/services/content/JustInTimeContentService.ts`

**Purpose**: Orchestrates just-in-time content generation with caching

**Key Interface**: `JITContentRequest` (lines 28-64)

**Current narrativeContext Structure** (lines 54-63):
```typescript
narrativeContext?: {
  setting?: string;          // ✓ Used
  context?: string;          // ✓ Used
  narrative?: string;        // ✓ Used
  mission?: string;          // ✓ Used
  throughLine?: string;      // ✓ Used
  companion?: any;           // ✓ Used
  subjectContext?: any;      // ✓ Used

  // MISSING ALL ENRICHMENT FIELDS:
  // ❌ milestones
  // ❌ immersiveElements
  // ❌ realWorldApplications
  // ❌ parentValue
  // ❌ qualityMarkers
  // ❌ personalizationExamples
  // ❌ companionInteractions
  // ❌ parentInsights
  // ❌ guarantees
};
```

**Gap**: Interface does NOT include enrichment fields.

---

### 2.3 PromptBuilder

**File**: `/src/services/ai-prompts/PromptBuilder.ts`

**Purpose**: Constructs AI prompts for content generation using hierarchical rules

**Key Interface**: `PromptContext` (lines 61-95)

**Current narrativeContext Structure** (lines 86-94):
```typescript
narrativeContext?: {
  setting?: string;
  context?: string;
  narrative?: string;
  mission?: string;
  throughLine?: string;
  companion?: any;
  subjectContext?: any;

  // MISSING ENRICHMENT FIELDS
};
```

**Narrative Section in Prompt** (lines 142-160):
```typescript
const narrativeSection = context.narrativeContext ? `
========================================
NARRATIVE CONTEXT - MAINTAIN CONTINUITY
========================================
Setting: ${context.narrativeContext.setting}
Story: ${context.narrativeContext.narrative}
Mission: ${context.narrativeContext.mission}
Career Connection: ${context.narrativeContext.throughLine}
Context: ${context.narrativeContext.context}
Companion: ${context.narrativeContext.companion.name}
Personality: ${context.narrativeContext.companion.personality}

CRITICAL: All content must align with this narrative context!
========================================
` : '';
```

**Gap**: Prompt does NOT inject enrichment data into AI generation.

---

## 3. Enrichment Integration Strategy

### 3.1 Data Structure Updates

#### Update 1: JustInTimeContentService Interface

**File**: `/src/services/content/JustInTimeContentService.ts`
**Location**: Lines 54-63

**Current**:
```typescript
narrativeContext?: {
  setting?: string;
  context?: string;
  narrative?: string;
  mission?: string;
  throughLine?: string;
  companion?: any;
  subjectContext?: any;
};
```

**Enhanced**:
```typescript
narrativeContext?: {
  // Existing basic fields
  setting?: string;
  context?: string;
  narrative?: string;
  mission?: string;
  throughLine?: string;
  companion?: any;
  subjectContext?: any;

  // NEW: Enrichment Layer 1 - Progress Milestones
  milestones?: {
    firstAchievement: string;
    midwayMastery: string;
    finalVictory: string;
    bonusChallenge?: string;
  };

  // NEW: Enrichment Layer 2 - Immersive Elements
  immersiveElements?: {
    soundscape: string;
    interactiveTools: string[];
    rewardVisuals: string[];
    celebrationMoments: string[];
  };

  // NEW: Enrichment Layer 3 - Real-World Applications
  realWorldApplications?: {
    [subject: string]: {
      immediate: string;
      nearFuture: string;
      longTerm: string;
      careerConnection: string;
    };
  };

  // NEW: Enrichment Layer 4 - Parent Value Propositions
  parentValue?: {
    realWorldConnection: string;
    futureReadiness: string;
    engagementPromise: string;
    differentiator: string;
  };

  // NEW: Enrichment Layer 5 - Quality Markers
  qualityMarkers?: {
    commonCoreAligned: boolean;
    stateStandardsMet: boolean;
    stemIntegrated: boolean;
    socialEmotionalLearning: boolean;
    assessmentRigor: string;
    progressTracking: string;
  };

  // NEW: Enrichment Layer 8 - Personalization Examples
  personalizationExamples?: {
    withStudentName: string[];
    withInterests: string[];
    withProgress: string[];
    withLearningStyle: string[];
  };

  // NEW: Enrichment Layer 9 - Companion Interactions
  companionInteractions?: {
    greetings: string[];
    encouragement: string[];
    hints: string[];
    celebrations: string[];
    transitions: string[];
  };

  // NEW: Enrichment Layer 6 - Parent Insights
  parentInsights?: {
    adaptiveNature: string;
    noFailureMode: string;
    masteryTracking: string;
    dailyReports: string;
    weeklyProgress: string;
  };

  // NEW: Enrichment Layer 7 - Guarantees
  guarantees?: {
    engagement: string;
    learning: string;
    satisfaction: string;
    support: string;
  };
};
```

---

#### Update 2: PromptBuilder Interface

**File**: `/src/services/ai-prompts/PromptBuilder.ts`
**Location**: Lines 86-94

**Apply Same Enhancement** as above to `PromptContext.narrativeContext`.

---

### 3.2 Prompt Enhancement

#### Enhanced Narrative Section in PromptBuilder

**File**: `/src/services/ai-prompts/PromptBuilder.ts`
**Location**: Lines 142-160

**Current**:
```typescript
const narrativeSection = context.narrativeContext ? `
========================================
NARRATIVE CONTEXT - MAINTAIN CONTINUITY
========================================
Setting: ${context.narrativeContext.setting}
Story: ${context.narrativeContext.narrative}
Mission: ${context.narrativeContext.mission}
...
========================================
` : '';
```

**Enhanced**:
```typescript
const narrativeSection = context.narrativeContext ? `
========================================
NARRATIVE CONTEXT - MAINTAIN CONTINUITY
========================================

📍 SETTING & STORY
Setting: ${context.narrativeContext.setting || 'Not specified'}
Story: ${context.narrativeContext.narrative || 'Generic career exploration'}
Mission: ${context.narrativeContext.mission || 'Learn and apply skills'}
Career Connection: ${context.narrativeContext.throughLine || 'Professional skill application'}
Context: ${context.narrativeContext.context || 'Career-based learning'}

${context.narrativeContext.companion ? `
👥 COMPANION INTEGRATION
Name: ${context.narrativeContext.companion.name}
Personality: ${context.narrativeContext.companion.personality}
Teaching Style: ${context.narrativeContext.companion.teachingStyle}
Catchphrase: "${context.narrativeContext.companion.catchphrase}"
${context.narrativeContext.companionInteractions ? `
Sample Greetings: ${context.narrativeContext.companionInteractions.greetings?.join(', ')}
Sample Encouragement: ${context.narrativeContext.companionInteractions.encouragement?.join(', ')}
Sample Hints: ${context.narrativeContext.companionInteractions.hints?.join(', ')}
Sample Celebrations: ${context.narrativeContext.companionInteractions.celebrations?.join(', ')}
Transition Phrases: ${context.narrativeContext.companionInteractions.transitions?.join(', ')}

USE THESE COMPANION SAMPLES to maintain consistent voice!
` : ''}
` : ''}

${context.narrativeContext.milestones ? `
🎯 PROGRESS MILESTONES - Reference in Content
First Achievement: ${context.narrativeContext.milestones.firstAchievement}
Midway Mastery: ${context.narrativeContext.milestones.midwayMastery}
Final Victory: ${context.narrativeContext.milestones.finalVictory}
${context.narrativeContext.milestones.bonusChallenge ? `Bonus Challenge: ${context.narrativeContext.milestones.bonusChallenge}` : ''}

INSTRUCTION: Reference these milestones in encouragement and feedback!
` : ''}

${context.narrativeContext.immersiveElements ? `
🎨 IMMERSIVE ELEMENTS - Use in Descriptions
Soundscape: ${context.narrativeContext.immersiveElements.soundscape}
Interactive Tools: ${context.narrativeContext.immersiveElements.interactiveTools?.join(', ')}
Reward Visuals: ${context.narrativeContext.immersiveElements.rewardVisuals?.join(', ')}
Celebration Moments: ${context.narrativeContext.immersiveElements.celebrationMoments?.join(', ')}

INSTRUCTION: Weave these elements into scenarios and feedback!
` : ''}

${context.narrativeContext.realWorldApplications?.[context.subject] ? `
🌍 REAL-WORLD APPLICATIONS - ${context.subject.toUpperCase()}
Now (Immediate): ${context.narrativeContext.realWorldApplications[context.subject].immediate}
Soon (Near Future): ${context.narrativeContext.realWorldApplications[context.subject].nearFuture}
Future (Long-term): ${context.narrativeContext.realWorldApplications[context.subject].longTerm}
Career Connection: ${context.narrativeContext.realWorldApplications[context.subject].careerConnection}

INSTRUCTION: Reference these applications in learning explanations!
` : ''}

${context.narrativeContext.personalizationExamples ? `
🎯 PERSONALIZATION STYLE - Match This Tone
With Student Name: ${context.narrativeContext.personalizationExamples.withStudentName?.[0] || 'Not provided'}
With Interests: ${context.narrativeContext.personalizationExamples.withInterests?.[0] || 'Not provided'}
With Progress: ${context.narrativeContext.personalizationExamples.withProgress?.[0] || 'Not provided'}
With Learning Style: ${context.narrativeContext.personalizationExamples.withLearningStyle?.[0] || 'Not provided'}

INSTRUCTION: Use similar personalization patterns in your content!
` : ''}

CRITICAL REQUIREMENTS:
✓ All content MUST align with this narrative context
✓ Use companion's voice consistently
✓ Reference milestones for motivation
✓ Include immersive elements in descriptions
✓ Connect to real-world applications
✓ Maintain personalization tone

========================================
` : '';
```

---

### 3.3 AILearningJourneyService Updates

#### Enhanced getStorylineContext Method

**File**: `/src/services/AILearningJourneyService.ts`
**Location**: Lines 161-201

**Current**:
```typescript
private getStorylineContext(
  skillKey: string,
  skill: LearningSkill,
  career?: { name: string; description?: string },
  narrativeContext?: any
) {
  const newContext = narrativeContext ? {
    scenario: narrativeContext.narrative || ...,
    character: career ? `a ${career.name}` : 'a professional',
    setting: narrativeContext.setting || ...,
    currentChallenge: narrativeContext.context || ...,
    careerConnection: narrativeContext.throughLine || ...,
    mission: narrativeContext.mission,
    companion: narrativeContext.companion,
    subjectContext: narrativeContext.subjectContext,
    timestamp: new Date()
  } : { /* fallback */ }
}
```

**Enhanced**:
```typescript
private getStorylineContext(
  skillKey: string,
  skill: LearningSkill,
  career?: { name: string; description?: string },
  narrativeContext?: any
) {
  const newContext = narrativeContext ? {
    // Existing basic fields
    scenario: narrativeContext.narrative || `helping in a ${career?.name || 'professional'} environment`,
    character: career ? `a ${career.name}` : 'a professional',
    setting: narrativeContext.setting || this.getCareerSetting(career?.name),
    currentChallenge: narrativeContext.context || `applying ${skill.skill_name} skills`,
    careerConnection: narrativeContext.throughLine || ...,
    mission: narrativeContext.mission,
    companion: narrativeContext.companion,
    subjectContext: narrativeContext.subjectContext,

    // NEW: Enrichment fields
    milestones: narrativeContext.milestones,
    immersiveElements: narrativeContext.immersiveElements,
    realWorldApplications: narrativeContext.realWorldApplications,
    parentValue: narrativeContext.parentValue,
    qualityMarkers: narrativeContext.qualityMarkers,
    personalizationExamples: narrativeContext.personalizationExamples,
    companionInteractions: narrativeContext.companionInteractions,
    parentInsights: narrativeContext.parentInsights,
    guarantees: narrativeContext.guarantees,

    timestamp: new Date()
  } : { /* fallback */ }

  this.storylineContext.set(skillKey, newContext);
  console.log(narrativeContext ? '🎯 Using ENRICHED MasterNarrative context:' : '📖 Created generic context:', newContext);
  return newContext;
}
```

---

## 4. Integration Flow for Each Container

### 4.1 Learn Container

**Flow**:
1. Student enters Learn container
2. `AILearnContainerV2-UNIFIED.tsx` requests content
3. `JustInTimeContentService.generateContainerContent()` called
4. `AILearningJourneyService.generateLearnContent()` invoked
5. `getStorylineContext()` extracts enrichment from narrativeContext
6. `PromptBuilder.buildPrompt()` injects enrichment into AI prompt
7. AI generates enriched Learn content using:
   - Milestones for motivation ("You're on your way to: {firstAchievement}")
   - Companion interactions for consistent voice
   - Real-world applications for explanations
   - Personalization examples for tone
   - Immersive elements for descriptions

**Content Enrichment**:
- **Greeting**: Uses companionInteractions.greetings
- **Concept Explanation**: References realWorldApplications
- **Examples**: Incorporate immersiveElements
- **Practice Questions**: Use personalizationExamples tone
- **Feedback**: Reference milestones and companion encouragement

---

### 4.2 Experience Container

**Flow**:
1. Student enters Experience container
2. `AIExperienceContainerV2-UNIFIED.tsx` requests content
3. `JustInTimeContentService.generateContainerContent()` called
4. `AILearningJourneyService.generateExperienceContent()` invoked
5. `getStorylineContext()` extracts enrichment
6. `PromptBuilder.buildPrompt()` injects enrichment
7. AI generates enriched Experience scenarios using:
   - Milestones as career achievement goals
   - Immersive elements (soundscape, interactive tools) in scenario descriptions
   - Real-world applications as challenge context
   - Companion interactions for hints and celebrations

**Content Enrichment**:
- **Scenario Setup**: Use immersiveElements.soundscape to set the scene
- **Character Context**: Reference milestones as career goals
- **Challenges**: Connect to realWorldApplications.careerConnection
- **Outcomes**: Use companionInteractions.celebrations
- **Learning Points**: Reference real-world applications

---

### 4.3 Discover Container

**Flow**:
1. Student enters Discover container
2. `AIDiscoverContainerV2-UNIFIED.tsx` requests content
3. `JustInTimeContentService.generateContainerContent()` called
4. `AILearningJourneyService.generateDiscoverContent()` invoked
5. `getStorylineContext()` extracts enrichment
6. `PromptBuilder.buildPrompt()` injects enrichment
7. AI generates enriched Discover explorations using:
   - Milestones as discovery milestones
   - Immersive elements as field trip descriptions
   - Real-world applications as exploration themes
   - Companion as exploration guide

**Content Enrichment**:
- **Exploration Theme**: Connect to realWorldApplications
- **Curiosity Questions**: Reference realWorldApplications (immediate, near, long-term)
- **Discovery Paths**: Use immersiveElements as exploration tools
- **Activities**: Companion guides with companionInteractions
- **Reflections**: Connect back to milestones

---

## 5. Implementation Checklist

### Phase 1: Data Structure Updates (Day 1)

- [ ] **Task 1.1**: Update `JITContentRequest.narrativeContext` interface
  - File: `/src/services/content/JustInTimeContentService.ts`
  - Lines: 54-63
  - Add all 9 enrichment field types

- [ ] **Task 1.2**: Update `PromptContext.narrativeContext` interface
  - File: `/src/services/ai-prompts/PromptBuilder.ts`
  - Lines: 86-94
  - Mirror JITContentRequest changes

- [ ] **Task 1.3**: Update TypeScript types for enrichment
  - Create shared interface for enriched narrative context
  - Import in both files

---

### Phase 2: Prompt Enhancement (Days 2-3)

- [ ] **Task 2.1**: Enhance narrative section in PromptBuilder
  - File: `/src/services/ai-prompts/PromptBuilder.ts`
  - Lines: 142-160
  - Add sections for milestones, immersive elements, real-world apps, etc.

- [ ] **Task 2.2**: Add container-specific enrichment prompts
  - Learn: Focus on milestones + real-world apps
  - Experience: Focus on immersive elements + soundscape
  - Discover: Focus on exploration themes + companion guide

- [ ] **Task 2.3**: Test prompt generation
  - Generate sample prompts with enrichment
  - Verify all fields are included
  - Test with missing enrichment (should degrade gracefully)

---

### Phase 3: AILearningJourneyService Integration (Days 4-5)

- [ ] **Task 3.1**: Update `getStorylineContext()` method
  - File: `/src/services/AILearningJourneyService.ts`
  - Lines: 161-201
  - Add enrichment fields to context object

- [ ] **Task 3.2**: Pass enrichment to PromptBuilder
  - Ensure context.narrativeContext includes enrichment
  - Verify data flows through to buildPrompt()

- [ ] **Task 3.3**: Update fallback logic
  - Ensure fallbacks work when enrichment is missing
  - Test with basic narratives (no enrichment)

---

### Phase 4: LessonPlanOrchestrator Updates (Day 6)

- [ ] **Task 4.1**: Pass enriched narrative to JustInTimeContentService
  - File: `/src/services/orchestration/LessonPlanOrchestrator.ts`
  - Ensure `generateMasterNarrative()` returns enrichment
  - Include enrichment in `generateContainerContent()` calls

- [ ] **Task 4.2**: Test orchestration flow
  - Generate lesson with enrichment
  - Verify enrichment reaches AILearningJourneyService
  - Check console logs for enrichment data

---

### Phase 5: Container Testing (Days 7-9)

- [ ] **Task 5.1**: Test Learn Container
  - Load Learn container with enriched narrative
  - Verify AI-generated content uses enrichment
  - Check for milestone references, companion voice, real-world apps

- [ ] **Task 5.2**: Test Experience Container
  - Load Experience container with enriched narrative
  - Verify scenario descriptions include immersive elements
  - Check soundscape references, interactive tools

- [ ] **Task 5.3**: Test Discover Container
  - Load Discover container with enriched narrative
  - Verify exploration themes connect to real-world apps
  - Check companion guidance, discovery milestones

---

### Phase 6: Validation & Testing (Days 10-12)

- [ ] **Task 6.1**: End-to-end integration test
  - Generate enriched MasterNarrative (Demo quality)
  - Flow through all containers (Learn → Experience → Discover)
  - Verify enrichment appears in AI-generated content

- [ ] **Task 6.2**: Comparison test (Demo vs Production)
  - Generate lesson with DemonstrativeMasterNarrativeGenerator
  - Generate lesson with enriched MasterNarrativeGenerator
  - Compare AI-generated content quality
  - Verify equivalence

- [ ] **Task 6.3**: Regression testing
  - Test with missing enrichment fields (should degrade gracefully)
  - Test with partial enrichment
  - Test with all enrichment fields present

---

## 6. Key Implementation Details

### 6.1 Graceful Degradation

**Critical Requirement**: System must work with OR without enrichment.

**Implementation**:
```typescript
// In PromptBuilder
const narrativeSection = context.narrativeContext ? `
${context.narrativeContext.milestones ? `
🎯 PROGRESS MILESTONES
...
` : ''}  // Only include if present
` : '';  // Entire section optional
```

**Rationale**: Existing production systems without enrichment must continue working.

---

### 6.2 Enrichment Priority

**High Priority** (Always include if available):
1. Milestones - Motivational markers
2. Real-world applications - Learning context
3. Companion interactions - Voice consistency

**Medium Priority** (Include when relevant):
4. Immersive elements - Experience/Discover containers
5. Personalization examples - Tone setting

**Low Priority** (Optional metadata):
6. Quality markers - Not used in content generation
7. Parent insights - Parent-facing only
8. Guarantees - Parent-facing only

---

### 6.3 Container-Specific Enrichment

**Learn Container** - Focus on:
- Milestones (motivation)
- Real-world applications (context)
- Companion interactions (voice)
- Personalization examples (tone)

**Experience Container** - Focus on:
- Immersive elements (soundscape, tools)
- Milestones (career achievements)
- Real-world applications (scenarios)
- Companion interactions (hints, celebrations)

**Discover Container** - Focus on:
- Real-world applications (exploration themes)
- Immersive elements (field trip descriptions)
- Companion interactions (guidance)
- Milestones (discovery goals)

---

## 7. Testing Strategy

### 7.1 Unit Tests

**PromptBuilder Tests**:
```typescript
describe('PromptBuilder with Enrichment', () => {
  test('includes milestones section when provided', () => {
    const context = {
      ...baseContext,
      narrativeContext: {
        milestones: {
          firstAchievement: 'Earn Junior Badge',
          midwayMastery: 'Complete first task',
          finalVictory: 'Certificate'
        }
      }
    };
    const prompt = promptBuilder.buildPrompt(context);
    expect(prompt).toContain('PROGRESS MILESTONES');
    expect(prompt).toContain('Earn Junior Badge');
  });

  test('gracefully handles missing enrichment', () => {
    const context = {
      ...baseContext,
      narrativeContext: {
        setting: 'Hospital',
        // No enrichment fields
      }
    };
    const prompt = promptBuilder.buildPrompt(context);
    expect(prompt).toContain('Setting: Hospital');
    expect(prompt).not.toContain('PROGRESS MILESTONES');
  });
});
```

---

### 7.2 Integration Tests

**AILearningJourneyService Tests**:
```typescript
describe('AILearningJourneyService with Enrichment', () => {
  test('generateLearnContent uses enriched narrative', async () => {
    const skill = { skill_number: 'K.M.1', skill_name: 'Count to 3' };
    const student = { id: '1', display_name: 'Sam', grade_level: 'K' };
    const career = {
      name: 'Doctor',
      narrativeContext: {
        milestones: { firstAchievement: 'Junior Doctor Badge' },
        realWorldApplications: {
          math: {
            immediate: 'Count bandages',
            nearFuture: 'Count patients',
            longTerm: 'Medical calculations',
            careerConnection: 'Doctors count medicine doses'
          }
        }
      }
    };

    const content = await aiLearningJourneyService.generateLearnContent(
      skill,
      student,
      career
    );

    // Verify enrichment influenced content
    expect(content.greeting).toContain('Doctor');
    expect(content.concept).toContain('count');
  });
});
```

---

### 7.3 End-to-End Tests

**Complete Flow Test**:
```typescript
describe('Complete Enrichment Flow', () => {
  test('enrichment flows from MasterNarrative to container content', async () => {
    // 1. Generate enriched narrative
    const enrichedNarrative = await masterNarrativeGenerator.generateEnhancedNarrative({
      studentName: 'Zara',
      gradeLevel: 'K',
      career: 'Doctor',
      subjects: ['math']
    });

    expect(enrichedNarrative.milestones).toBeDefined();
    expect(enrichedNarrative.realWorldApplications).toBeDefined();

    // 2. Generate container content with enrichment
    const learnContent = await jitContentService.generateContainerContent({
      userId: 'test-user',
      container: 'learn',
      containerType: 'learn',
      subject: 'Math',
      context: {
        narrativeContext: enrichedNarrative  // Pass full enrichment
      }
    });

    // 3. Verify enrichment influenced AI generation
    expect(learnContent).toBeDefined();
    // Content should reference real-world applications, milestones, etc.
  });
});
```

---

## 8. Success Criteria

### 8.1 Functional Criteria

✅ **Enrichment Data Flows**:
- MasterNarrative enrichment reaches AILearningJourneyService
- PromptBuilder includes enrichment in AI prompts
- AI-generated content reflects enrichment

✅ **Container Parity**:
- Learn container uses enrichment appropriately
- Experience container uses enrichment appropriately
- Discover container uses enrichment appropriately

✅ **Graceful Degradation**:
- System works without enrichment
- System works with partial enrichment
- No errors when enrichment is missing

---

### 8.2 Quality Criteria

✅ **Demo vs Production Equivalence**:
- Production containers match Demo quality
- AI-generated content is equally rich
- Student experience is equivalent

✅ **Narrative Consistency**:
- Companion voice is consistent across containers
- Milestones are referenced appropriately
- Real-world applications are woven into content

✅ **Performance**:
- Enrichment adds <100ms to prompt construction
- No additional AI costs (enrichment is in prompt, not separate call)
- Cache performance is maintained

---

## 9. Rollout Strategy

### Phase 1: Demo Users (Week 1)
- Enable enrichment for demo users only
- Monitor AI-generated content quality
- Collect feedback on enrichment effectiveness

### Phase 2: Pilot Group (Week 2)
- Enable for small group of production users
- A/B test enriched vs non-enriched content
- Measure engagement metrics

### Phase 3: Full Rollout (Week 3)
- Enable for all users
- Monitor system performance
- Track customer satisfaction

---

## Appendix A: File Reference Index

### Core Integration Files

**Services**:
- `/src/services/AILearningJourneyService.ts` - Container content generation
- `/src/services/content/JustInTimeContentService.ts` - Orchestration & caching
- `/src/services/ai-prompts/PromptBuilder.ts` - AI prompt construction

**Containers (Active)**:
- `/src/components/ai-containers/AILearnContainerV2-UNIFIED.tsx`
- `/src/components/ai-containers/AIExperienceContainerV2-UNIFIED.tsx`
- `/src/components/ai-containers/AIDiscoverContainerV2-UNIFIED.tsx`

**Rules Engines**:
- `/src/rules-engine/containers/LearnAIRulesEngine.ts`
- `/src/rules-engine/containers/ExperienceAIRulesEngine.ts`
- `/src/rules-engine/containers/DiscoverAIRulesEngine.ts`

---

## Appendix B: Enrichment Field Mapping

### MasterNarrative → Container Content

| Enrichment Field | Learn | Experience | Discover | Priority |
|-----------------|-------|------------|----------|----------|
| milestones | ✅ Motivation | ✅ Career goals | ✅ Discovery markers | HIGH |
| immersiveElements | ⚪ Context | ✅ Soundscape | ✅ Field trip descriptions | MEDIUM |
| realWorldApplications | ✅ Explanations | ✅ Scenarios | ✅ Exploration themes | HIGH |
| parentValue | ❌ Not used | ❌ Not used | ❌ Not used | N/A |
| qualityMarkers | ❌ Not used | ❌ Not used | ❌ Not used | N/A |
| personalizationExamples | ✅ Tone | ⚪ Voice | ⚪ Voice | MEDIUM |
| companionInteractions | ✅ Voice | ✅ Hints/celebrations | ✅ Guidance | HIGH |
| parentInsights | ❌ Not used | ❌ Not used | ❌ Not used | N/A |
| guarantees | ❌ Not used | ❌ Not used | ❌ Not used | N/A |

**Legend**:
- ✅ Actively used
- ⚪ Optionally used
- ❌ Not used in student containers (parent-facing only)

---

**End of Document**

**Next Steps**:
1. Implement Phase 1 data structure updates
2. Enhance PromptBuilder narrative section
3. Update AILearningJourneyService
4. Test enrichment flow end-to-end
5. Compare Demo vs Production output quality
