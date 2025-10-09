# Enriched Lesson Plan Integration - Implementation Plan

## Executive Summary

This plan details the integration of the enriched Master Narrative system with rubric-based JIT content generation and cross-device session management. The goal is to maintain story consistency across all containers while enabling adaptive, personalized learning that works seamlessly across devices.

---

## Architecture Overview

```
Login → Master Narrative Generation → Story Rubric + Data Rubrics → Azure Storage
                                                                          ↓
User Enters Container → JIT Fetches Rubric → AI Generates Content → Stores in Rubric
                                                                          ↓
Container Completes → Updates Performance → AdaptiveService Updates Next Container Rubric
                                                                          ↓
Session State in Backend DB ← → Azure Storage Rubrics ← → Cross-Device Access
```

---

## PHASE 1: Foundation - Master Narrative & Rubric System

**Goal**: Create the core rubric infrastructure that separates story from data structure.

### Tasks

#### 1.1 Define TypeScript Interfaces

**Files to Create**:
- `/src/types/MasterNarrativeTypes.ts`
- `/src/types/RubricTypes.ts`

**Interfaces Needed**:
```typescript
// MasterNarrativeTypes.ts
export interface EnrichedMasterNarrative {
  sessionId: string;
  userId: string;
  createdAt: string;
  career: string;
  companion: string;
  gradeLevel: string;

  masterNarrative: {
    greeting: string;
    introduction: string;
    mission: string;
    narrativeArc: NarrativeArc;
    companionVoice: CompanionVoice;
    careerNarrative: CareerNarrative;
    subjectNarratives: Record<Subject, SubjectNarrative>;
    containerTransitions: ContainerTransitions;
    thematicElements: ThematicElements;
  };

  version: string;
  generatedBy: string;
}

export interface NarrativeArc {
  premise: string;
  mission: string;
  stakes: string;
  resolution: string;
}

export interface CompanionVoice {
  companionId: "finn" | "sage" | "spark" | "harmony";
  greetingStyle: string;
  teachingVoice: string;
  encouragementStyle: string;
  transitionPhrasing: string;
}

export interface CareerNarrative {
  careerIdentity: string;
  workplaceSettings: {
    LEARN: string;
    EXPERIENCE: string;
    DISCOVER: string;
  };
  professionalRole: string;
  careerGoal: string;
}

export interface SubjectNarrative {
  careerStoryline: string;
  narrativeBridge: string;
  motivationalContext: string;
}

export interface ContainerTransitions {
  toLEARN: string;
  toEXPERIENCE: string;
  toDISCOVER: string;
  conclusion: string;
}

export interface ThematicElements {
  tone: string;
  vocabulary: string[];
  metaphors: string[];
  culturalContext: string;
}

// RubricTypes.ts
export interface StoryRubric {
  sessionId: string;
  sourceFile: string;
  storyContext: {
    narrativeArc: NarrativeArc;
    companionVoice: CompanionVoice;
    careerNarrative: CareerNarrative;
    subjectNarratives: Record<Subject, SubjectNarrative>;
    containerTransitions: ContainerTransitions;
  };
  usage: string;
}

export interface DataRubric {
  sessionId: string;
  container: "LEARN" | "EXPERIENCE" | "DISCOVER";
  subject: Subject;
  skill: SkillReference;

  storyContext: {
    narrativeSetup: string;
    careerContext: string;
    workplaceSetting: string;
    companionVoice: string;
  };

  dataRequirements: DataRequirements;
  jitPrompt: JITPrompt;
  adaptationData: AdaptationData | null;

  generatedContent: any | null;
  completedAt: string | null;
  performance: PerformanceData | null;
}

export interface LEARNDataRequirements {
  video: VideoStructure;
  practice: PracticeStructure;
  assessment: AssessmentStructure;
}

export interface EXPERIENCEDataRequirements {
  scenarios: {
    examples: { count: number; structure: ScenarioStructure };
    practice: { count: number; structure: ScenarioStructure };
    assessment: { count: number; structure: ScenarioStructure };
  };
}

export interface DISCOVERDataRequirements {
  unifiedScenario: UnifiedScenarioStructure;
  discoveryStations: { count: 4; structure: DiscoveryStationStructure };
}

export interface JITPrompt {
  systemPrompt: string;
  userPrompt: string;
  variables: Record<string, any>;
}

export interface AdaptationData {
  performanceFromPreviousContainer: {
    source: string;
    completedAt: string;
    struggled: boolean;
    score: number;
    attempts: number;
    timeSpent: number;
  } | null;
  adaptationRules: AdaptationRules | null;
  lastUpdated: string | null;
}

export interface PerformanceData {
  score: number;
  attempts: number;
  timeSpent: number;
  struggledQuestions: string[];
  completedAt: string;
}
```

**Dependencies**: None
**Estimated Time**: 4 hours
**Risk**: Low - Pure type definitions

---

#### 1.2 Update MasterNarrativeGenerator

**Files to Modify**:
- `/src/services/narrative/MasterNarrativeGenerator.ts`

**Changes**:
1. Update `generate()` method to return `EnrichedMasterNarrative`
2. Add story rubric derivation logic
3. Generate container-specific narrative prompts
4. Add subject narrative hooks for each subject

**Key Methods to Add**:
```typescript
class MasterNarrativeGenerator {

  async generateEnrichedNarrative(params: {
    career: string;
    companion: string;
    gradeLevel: string;
    userId: string;
    sessionId: string;
  }): Promise<EnrichedMasterNarrative> {
    // Generate full enriched master narrative
  }

  deriveStoryRubric(masterNarrative: EnrichedMasterNarrative): StoryRubric {
    // Extract story context from master narrative
  }

  private generateNarrativeArc(career: string, companion: string): NarrativeArc {
    // Create premise → mission → stakes → resolution
  }

  private generateCompanionVoice(companion: string): CompanionVoice {
    // Define companion's teaching style, voice, encouragement
  }

  private generateCareerNarrative(career: string): CareerNarrative {
    // Define career identity, workplace settings, role, goal
  }

  private generateSubjectNarratives(career: string, gradeLevel: string): Record<Subject, SubjectNarrative> {
    // Create narrative hooks for Math, ELA, Science, Social Studies
  }

  private generateContainerTransitions(career: string, companion: string): ContainerTransitions {
    // Create smooth transitions between LEARN, EXPERIENCE, DISCOVER
  }
}
```

**Dependencies**: Task 1.1 (Type definitions)
**Estimated Time**: 8 hours
**Risk**: Medium - Requires AI prompt engineering for quality narratives

---

#### 1.3 Create Data Rubric Template Service

**Files to Create**:
- `/src/services/rubrics/DataRubricTemplateService.ts`

**Purpose**: Generate initial Data Rubrics for all containers based on Master Narrative

**Key Methods**:
```typescript
class DataRubricTemplateService {

  createInitialDataRubrics(
    masterNarrative: EnrichedMasterNarrative,
    gradeLevel: string
  ): DataRubric[] {
    // Create 12 rubrics: 3 containers × 4 subjects
  }

  createLEARNRubric(
    masterNarrative: EnrichedMasterNarrative,
    subject: Subject,
    skill: SkillReference
  ): DataRubric {
    // Extract story context from Master Narrative
    // Define data requirements for LEARN
    // Create JIT prompt template
  }

  createEXPERIENCERubric(
    masterNarrative: EnrichedMasterNarrative,
    subject: Subject,
    skill: SkillReference
  ): DataRubric {
    // Extract story context
    // Define data requirements for EXPERIENCE
    // Create JIT prompt template with adaptation placeholders
  }

  createDISCOVERRubric(
    masterNarrative: EnrichedMasterNarrative,
    skill: SkillReference
  ): DataRubric {
    // DISCOVER has unified scenario across all 4 subjects
    // Extract story context
    // Define 4-station structure
    // Create JIT prompt template with cumulative adaptation
  }

  private deriveStoryContextForContainer(
    masterNarrative: EnrichedMasterNarrative,
    container: string,
    subject: Subject
  ): StoryContext {
    return {
      narrativeSetup: masterNarrative.containerTransitions[`to${container}`],
      careerContext: masterNarrative.subjectNarratives[subject].careerStoryline,
      workplaceSetting: masterNarrative.careerNarrative.workplaceSettings[container],
      companionVoice: masterNarrative.companionVoice.teachingVoice
    };
  }

  private buildJITPrompt(
    storyContext: StoryContext,
    dataRequirements: DataRequirements,
    adaptationData: AdaptationData | null
  ): JITPrompt {
    // Construct AI prompt that uses story context + data structure + adaptation rules
  }
}
```

**Dependencies**: Task 1.1, 1.2
**Estimated Time**: 12 hours
**Risk**: High - Critical for maintaining story/data alignment

---

#### 1.4 Create Story Consistency Validator

**Files to Create**:
- `/src/services/validation/StoryConsistencyValidator.ts`

**Purpose**: Validate that story told = story experienced = story documented

**Key Methods**:
```typescript
class StoryConsistencyValidator {

  validateInterRubricAlignment(
    masterNarrative: EnrichedMasterNarrative,
    dataRubrics: DataRubric[]
  ): ValidationResult {
    // Check that story context in Data Rubrics matches Master Narrative
  }

  validateIntraRubricConsistency(dataRubric: DataRubric): ValidationResult {
    // Check that description ↔ question ↔ hint ↔ explanation align
  }

  validateGeneratedContent(
    generatedContent: any,
    dataRubric: DataRubric
  ): ValidationResult {
    // Check that JIT-generated content follows data requirements
    // Check that story elements are present
  }

  validateLessonPlanStory(lessonPlan: any): ValidationResult {
    // Final validation: Story flows through entire lesson plan
    // Narrative arc is complete
    // Companion voice is consistent
    // Career context maintained
  }
}
```

**Dependencies**: Task 1.1, 1.2, 1.3
**Estimated Time**: 6 hours
**Risk**: Low - Validation logic, no generation

---

### Phase 1 Deliverables

✅ **Type system** for Master Narrative and Rubrics
✅ **Enhanced Master Narrative Generator** with story rubric derivation
✅ **Data Rubric Template Service** for creating initial rubrics
✅ **Story Consistency Validator** for quality assurance

**Total Estimated Time**: 30 hours
**Critical Path**: 1.1 → 1.2 → 1.3 → 1.4

---

## PHASE 2: Azure Storage Integration

**Goal**: Store and retrieve rubrics from Azure Blob Storage with caching.

### Tasks

#### 2.1 Setup Azure Storage Container

**Manual Setup**:
1. Create Azure Storage Account (if not exists)
2. Create Blob Container: `pathfinity-lesson-rubrics`
3. Configure CORS for web access
4. Set up access keys in environment variables

**Environment Variables**:
```env
AZURE_STORAGE_ACCOUNT_NAME=pathfinity
AZURE_STORAGE_ACCOUNT_KEY=<key>
AZURE_STORAGE_CONNECTION_STRING=<connection-string>
```

**Dependencies**: None
**Estimated Time**: 2 hours (setup + testing)
**Risk**: Low - Infrastructure task

---

#### 2.2 Create Azure Storage Service

**Files to Create**:
- `/src/services/storage/AzureBlobStorageService.ts`

**Key Methods**:
```typescript
class AzureBlobStorageService {
  private containerClient: ContainerClient;

  constructor() {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!
    );
    this.containerClient = blobServiceClient.getContainerClient('pathfinity-lesson-rubrics');
  }

  async uploadJSON(blobPath: string, data: any): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobPath);
    const jsonString = JSON.stringify(data, null, 2);
    await blockBlobClient.upload(jsonString, jsonString.length, {
      blobHTTPHeaders: { blobContentType: 'application/json' }
    });
  }

  async downloadJSON<T>(blobPath: string): Promise<T> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobPath);
    const downloadResponse = await blockBlobClient.download(0);
    const downloaded = await this.streamToBuffer(downloadResponse.readableStreamBody!);
    return JSON.parse(downloaded.toString());
  }

  async exists(blobPath: string): Promise<boolean> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobPath);
    return await blockBlobClient.exists();
  }

  async delete(blobPath: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobPath);
    await blockBlobClient.delete();
  }

  async listBlobs(prefix: string): Promise<string[]> {
    const blobs: string[] = [];
    for await (const blob of this.containerClient.listBlobsFlat({ prefix })) {
      blobs.push(blob.name);
    }
    return blobs;
  }

  private async streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      readableStream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      readableStream.on('end', () => resolve(Buffer.concat(chunks)));
      readableStream.on('error', reject);
    });
  }
}
```

**Dependencies**: Task 2.1
**Estimated Time**: 4 hours
**Risk**: Low - Standard Azure SDK usage

---

#### 2.3 Create Rubric Storage Service

**Files to Create**:
- `/src/services/rubrics/RubricStorageService.ts`

**Purpose**: High-level interface for rubric storage with caching

**Key Methods**:
```typescript
class RubricStorageService {
  private azureStorage: AzureBlobStorageService;
  private cachePrefix = 'rubric_cache_';

  constructor() {
    this.azureStorage = new AzureBlobStorageService();
  }

  // ===== Master Narrative =====

  async storeMasterNarrative(
    userId: string,
    sessionId: string,
    masterNarrative: EnrichedMasterNarrative
  ): Promise<void> {
    const blobPath = `${userId}/${sessionId}/master-narrative.json`;
    await this.azureStorage.uploadJSON(blobPath, masterNarrative);

    // Cache in sessionStorage
    const cacheKey = `${this.cachePrefix}master_${sessionId}`;
    sessionStorage.setItem(cacheKey, JSON.stringify(masterNarrative));
  }

  async getMasterNarrative(
    userId: string,
    sessionId: string
  ): Promise<EnrichedMasterNarrative> {
    // Check cache first
    const cacheKey = `${this.cachePrefix}master_${sessionId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from Azure
    const blobPath = `${userId}/${sessionId}/master-narrative.json`;
    const masterNarrative = await this.azureStorage.downloadJSON<EnrichedMasterNarrative>(blobPath);

    // Cache it
    sessionStorage.setItem(cacheKey, JSON.stringify(masterNarrative));

    return masterNarrative;
  }

  // ===== Story Rubric =====

  async storeStoryRubric(
    userId: string,
    sessionId: string,
    storyRubric: StoryRubric
  ): Promise<void> {
    const blobPath = `${userId}/${sessionId}/story-rubric.json`;
    await this.azureStorage.uploadJSON(blobPath, storyRubric);
  }

  async getStoryRubric(
    userId: string,
    sessionId: string
  ): Promise<StoryRubric> {
    const blobPath = `${userId}/${sessionId}/story-rubric.json`;
    return await this.azureStorage.downloadJSON<StoryRubric>(blobPath);
  }

  // ===== Data Rubrics =====

  async storeDataRubric(
    userId: string,
    sessionId: string,
    container: string,
    subject: string,
    dataRubric: DataRubric
  ): Promise<void> {
    const blobPath = `${userId}/${sessionId}/data-rubrics/${container}/${subject}.json`;
    await this.azureStorage.uploadJSON(blobPath, dataRubric);

    // Cache in sessionStorage
    const cacheKey = `${this.cachePrefix}${sessionId}_${container}_${subject}`;
    sessionStorage.setItem(cacheKey, JSON.stringify(dataRubric));
  }

  async getDataRubric(
    userId: string,
    sessionId: string,
    container: string,
    subject: string
  ): Promise<DataRubric> {
    // Check cache first
    const cacheKey = `${this.cachePrefix}${sessionId}_${container}_${subject}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from Azure
    const blobPath = `${userId}/${sessionId}/data-rubrics/${container}/${subject}.json`;
    const dataRubric = await this.azureStorage.downloadJSON<DataRubric>(blobPath);

    // Cache it
    sessionStorage.setItem(cacheKey, JSON.stringify(dataRubric));

    return dataRubric;
  }

  async updateDataRubricContent(
    userId: string,
    sessionId: string,
    container: string,
    subject: string,
    generatedContent: any
  ): Promise<void> {
    // Fetch current rubric
    const dataRubric = await this.getDataRubric(userId, sessionId, container, subject);

    // Update with generated content
    dataRubric.generatedContent = generatedContent;

    // Save back
    await this.storeDataRubric(userId, sessionId, container, subject, dataRubric);
  }

  async updateDataRubricPerformance(
    userId: string,
    sessionId: string,
    container: string,
    subject: string,
    performance: PerformanceData
  ): Promise<void> {
    // Fetch current rubric
    const dataRubric = await this.getDataRubric(userId, sessionId, container, subject);

    // Update performance
    dataRubric.performance = performance;
    dataRubric.completedAt = new Date().toISOString();

    // Save back
    await this.storeDataRubric(userId, sessionId, container, subject, dataRubric);
  }

  // ===== Batch Operations =====

  async storeAllDataRubrics(
    userId: string,
    sessionId: string,
    dataRubrics: DataRubric[]
  ): Promise<void> {
    // Store all rubrics in parallel
    await Promise.all(
      dataRubrics.map(rubric =>
        this.storeDataRubric(userId, sessionId, rubric.container, rubric.subject, rubric)
      )
    );
  }

  // ===== Cache Management =====

  clearCache(sessionId: string): void {
    // Clear all cached rubrics for this session
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(this.cachePrefix) && key.includes(sessionId)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
  }
}
```

**Dependencies**: Task 2.2
**Estimated Time**: 6 hours
**Risk**: Low - Wrapper around Azure service

---

#### 2.4 Update NarrativeContext to Use Storage

**Files to Modify**:
- `/src/contexts/NarrativeContext.tsx`

**Changes**:
1. Import `RubricStorageService`
2. After generating Master Narrative, store in Azure Storage
3. Store Story Rubric
4. Create and store initial Data Rubrics

**Key Code Changes**:
```typescript
const generateNarrative = useCallback(async (params) => {
  setNarrativeLoading(true);

  try {
    // 1. Generate enriched Master Narrative
    const masterNarrative = await masterNarrativeGenerator.generateEnrichedNarrative({
      career: params.career,
      companion: params.companion,
      gradeLevel: params.gradeLevel,
      userId: params.userId,
      sessionId: params.sessionId || generateSessionId()
    });

    // 2. Store Master Narrative in Azure Storage
    await rubricStorage.storeMasterNarrative(
      params.userId,
      masterNarrative.sessionId,
      masterNarrative
    );

    // 3. Derive and store Story Rubric
    const storyRubric = masterNarrativeGenerator.deriveStoryRubric(masterNarrative);
    await rubricStorage.storeStoryRubric(
      params.userId,
      masterNarrative.sessionId,
      storyRubric
    );

    // 4. Create initial Data Rubrics for all containers
    const dataRubrics = await dataRubricTemplateService.createInitialDataRubrics(
      masterNarrative,
      params.gradeLevel
    );

    // 5. Store all Data Rubrics in Azure Storage
    await rubricStorage.storeAllDataRubrics(
      params.userId,
      masterNarrative.sessionId,
      dataRubrics
    );

    setMasterNarrative(masterNarrative);
    setNarrativeLoading(false);

    return masterNarrative;

  } catch (error) {
    console.error('Failed to generate and store narrative:', error);
    setNarrativeError('Failed to generate narrative');
    setNarrativeLoading(false);
  }
}, []);
```

**Dependencies**: Task 2.3, Phase 1 tasks
**Estimated Time**: 4 hours
**Risk**: Low - Integration work

---

### Phase 2 Deliverables

✅ **Azure Storage Container** set up and configured
✅ **Azure Blob Storage Service** for low-level operations
✅ **Rubric Storage Service** with caching layer
✅ **NarrativeContext integration** to store rubrics at login

**Total Estimated Time**: 16 hours
**Critical Path**: 2.1 → 2.2 → 2.3 → 2.4

---

## PHASE 3: JIT Service Rubric Consumption

**Goal**: Update JIT service to fetch and use rubrics for content generation.

### Tasks

#### 3.1 Create Enhanced JIT Content Service

**Files to Create**:
- `/src/services/content/JITContentServiceV2.ts` (new version with rubric support)

**Key Methods**:
```typescript
class JITContentServiceV2 {
  private rubricStorage: RubricStorageService;
  private aiService: AzureOpenAIService;
  private validator: StoryConsistencyValidator;

  async generateContent(
    userId: string,
    sessionId: string,
    container: "LEARN" | "EXPERIENCE" | "DISCOVER",
    subject: Subject
  ): Promise<any> {

    console.log(`🎨 Generating ${container}-${subject} content using rubric...`);

    try {
      // 1. Fetch Data Rubric from Azure Storage (with cache)
      const dataRubric = await this.rubricStorage.getDataRubric(
        userId,
        sessionId,
        container,
        subject
      );

      // 2. Check if content already generated
      if (dataRubric.generatedContent) {
        console.log('✅ Content already generated, returning cached');
        return dataRubric.generatedContent;
      }

      // 3. Generate content using rubric's JIT prompt
      const content = await this.aiService.generateWithPrompt(
        dataRubric.jitPrompt.systemPrompt,
        dataRubric.jitPrompt.userPrompt,
        dataRubric.jitPrompt.variables
      );

      // 4. Validate generated content
      const validation = this.validator.validateGeneratedContent(content, dataRubric);
      if (!validation.isValid) {
        console.error('❌ Generated content failed validation:', validation.errors);
        throw new Error('Generated content does not meet requirements');
      }

      // 5. Store generated content in rubric
      await this.rubricStorage.updateDataRubricContent(
        userId,
        sessionId,
        container,
        subject,
        content
      );

      console.log(`✅ ${container}-${subject} content generated and stored`);

      return content;

    } catch (error) {
      console.error(`❌ JIT generation failed for ${container}-${subject}:`, error);

      // Fallback: Regenerate rubric from Master Narrative and retry
      return await this.fallbackGeneration(userId, sessionId, container, subject);
    }
  }

  private async fallbackGeneration(
    userId: string,
    sessionId: string,
    container: string,
    subject: Subject
  ): Promise<any> {
    console.log('🔄 Attempting fallback generation using Master Narrative...');

    // 1. Fetch Master Narrative (source of truth)
    const masterNarrative = await this.rubricStorage.getMasterNarrative(userId, sessionId);

    // 2. Regenerate Data Rubric from Master Narrative
    const dataRubric = await this.regenerateDataRubric(
      masterNarrative,
      container,
      subject
    );

    // 3. Try generation again with fresh rubric
    const content = await this.aiService.generateWithPrompt(
      dataRubric.jitPrompt.systemPrompt,
      dataRubric.jitPrompt.userPrompt,
      dataRubric.jitPrompt.variables
    );

    // 4. Store both rubric and content
    await this.rubricStorage.storeDataRubric(userId, sessionId, container, subject, dataRubric);
    await this.rubricStorage.updateDataRubricContent(userId, sessionId, container, subject, content);

    return content;
  }

  async recordPerformance(
    userId: string,
    sessionId: string,
    container: string,
    subject: Subject,
    performance: PerformanceData
  ): Promise<void> {
    // Store performance data in rubric
    await this.rubricStorage.updateDataRubricPerformance(
      userId,
      sessionId,
      container,
      subject,
      performance
    );

    console.log(`📊 Performance recorded for ${container}-${subject}`);
  }
}
```

**Dependencies**: Phase 2 complete
**Estimated Time**: 8 hours
**Risk**: Medium - Core generation logic

---

#### 3.2 Update Container Components to Use JIT V2

**Files to Modify**:
- `/src/components/ai-containers/AILearnContainerV2-UNIFIED.tsx`
- `/src/components/ai-containers/AIExperienceContainerV2-UNIFIED.tsx`
- `/src/components/ai-containers/AIDiscoverContainerV2-UNIFIED.tsx`

**Changes**:
1. Replace old JIT calls with `JITContentServiceV2`
2. Pass `sessionId` to JIT service
3. Remove duplicate content generation logic
4. Use rubric-generated content directly

**Example (LEARN Container)**:
```typescript
// AILearnContainerV2-UNIFIED.tsx

const [content, setContent] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadContent() {
    const sessionId = sessionManager.getCurrentSessionId();

    // Fetch content using JIT V2 (rubric-based)
    const generatedContent = await jitServiceV2.generateContent(
      student.id,
      sessionId,
      "LEARN",
      currentSubject
    );

    setContent(generatedContent);
    setLoading(false);
  }

  loadContent();
}, [currentSubject]);

// When container completes, record performance
const handleComplete = async (performance: PerformanceData) => {
  const sessionId = sessionManager.getCurrentSessionId();

  await jitServiceV2.recordPerformance(
    student.id,
    sessionId,
    "LEARN",
    currentSubject,
    performance
  );

  // Move to next subject
  onComplete();
};
```

**Dependencies**: Task 3.1
**Estimated Time**: 6 hours (2 hours per container × 3 containers)
**Risk**: Low - Straightforward integration

---

#### 3.3 Add Loading Screens with Fun Facts

**Files to Modify**:
- `/src/components/ai-containers/EnhancedLoadingScreen.tsx`

**Changes**:
1. Show loading screen during JIT generation
2. Display career-specific fun facts
3. Show progress: "Generating your Math lesson..."

**Key Enhancement**:
```typescript
interface EnhancedLoadingScreenProps {
  container: string;
  subject: string;
  career: string;
  companion: string;
}

export const EnhancedLoadingScreen: React.FC<EnhancedLoadingScreenProps> = ({
  container,
  subject,
  career,
  companion
}) => {

  const [currentFunFact, setCurrentFunFact] = useState(0);

  const funFacts = getFunFactsForCareer(career, subject);

  useEffect(() => {
    // Rotate fun facts every 5 seconds
    const interval = setInterval(() => {
      setCurrentFunFact(prev => (prev + 1) % funFacts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [funFacts.length]);

  return (
    <div className="loading-screen">
      <div className="loading-animation">
        {/* Animated spinner or character animation */}
      </div>

      <h2>Preparing your {container} lesson...</h2>
      <p>Subject: {subject}</p>

      <div className="fun-fact-card">
        <h3>Did you know?</h3>
        <p>{funFacts[currentFunFact]}</p>
      </div>

      <div className="progress-bar">
        {/* Show generation progress */}
      </div>
    </div>
  );
};
```

**Dependencies**: Task 3.2
**Estimated Time**: 4 hours
**Risk**: Low - UI enhancement

---

### Phase 3 Deliverables

✅ **JIT Content Service V2** with rubric consumption
✅ **Container components updated** to use JIT V2
✅ **Enhanced loading screens** with fun facts
✅ **Performance recording** system

**Total Estimated Time**: 18 hours
**Critical Path**: 3.1 → 3.2 → 3.3

---

## PHASE 4: Cross-Device Session Management

**Goal**: Enable seamless session resumption across devices.

### Tasks

#### 4.1 Update Session Schema in Database

**Files to Modify**:
- Database schema (Supabase migration or similar)
- `/src/services/content/SessionLearningContextManager.ts`

**New Fields to Add**:
```sql
ALTER TABLE learning_sessions ADD COLUMN IF NOT EXISTS device_info JSONB;
ALTER TABLE learning_sessions ADD COLUMN IF NOT EXISTS last_active_device TEXT;
ALTER TABLE learning_sessions ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP;
ALTER TABLE learning_sessions ADD COLUMN IF NOT EXISTS session_version INTEGER DEFAULT 1;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity
  ON learning_sessions(user_id, last_activity_at DESC);
```

**Session Schema Update**:
```typescript
interface SessionState {
  // ... existing fields ...

  devices: {
    currentActiveDevice: string;
    lastActiveDeviceId: string;
    lastActivityAt: Date;
  };

  storage: {
    masterNarrativePath: string;
    storyRubricPath: string;
    dataRubricsBasePath: string;
  };

  version: number;
}
```

**Dependencies**: None (infrastructure)
**Estimated Time**: 3 hours
**Risk**: Low - Schema changes

---

#### 4.2 Add Device Tracking to SessionManager

**Files to Modify**:
- `/src/services/content/SessionLearningContextManager.ts`

**New Methods**:
```typescript
class SessionLearningContextManager {

  async updateActiveDevice(
    userId: string,
    sessionId: string,
    deviceId: string
  ): Promise<void> {
    await this.supabase
      .from('learning_sessions')
      .update({
        last_active_device: deviceId,
        last_activity_at: new Date().toISOString()
      })
      .eq('session_id', sessionId)
      .eq('user_id', userId);
  }

  async checkForActiveDevices(
    userId: string,
    sessionId: string
  ): Promise<{
    hasActiveDevice: boolean;
    deviceId: string | null;
    lastActivityAt: Date | null;
  }> {
    const { data } = await this.supabase
      .from('learning_sessions')
      .select('last_active_device, last_activity_at')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .single();

    if (!data) {
      return { hasActiveDevice: false, deviceId: null, lastActivityAt: null };
    }

    const lastActivity = new Date(data.last_activity_at);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    return {
      hasActiveDevice: lastActivity > fiveMinutesAgo,
      deviceId: data.last_active_device,
      lastActivityAt: lastActivity
    };
  }

  generateDeviceId(): string {
    // Generate unique device identifier
    // Could use browser fingerprint, or simple UUID
    const existingId = localStorage.getItem('pathfinity_device_id');
    if (existingId) return existingId;

    const newId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('pathfinity_device_id', newId);
    return newId;
  }
}
```

**Dependencies**: Task 4.1
**Estimated Time**: 4 hours
**Risk**: Low - CRUD operations

---

#### 4.3 Add Cross-Device Resume Logic to Dashboard

**Files to Modify**:
- `/src/screens/modal-migration/StudentDashboard.tsx`

**Changes**:
1. Check for active session on different device
2. Show resume modal with device warning
3. Handle "Continue Here" vs "Go Back" actions

**Key Code**:
```typescript
// StudentDashboard.tsx

useEffect(() => {
  async function loadOrResumeSession() {
    const deviceId = sessionManager.generateDeviceId();
    const session = await sessionManager.loadSession(userId);

    if (session) {
      // Check if another device is active
      const activeDeviceCheck = await sessionManager.checkForActiveDevices(
        userId,
        session.sessionId
      );

      if (activeDeviceCheck.hasActiveDevice && activeDeviceCheck.deviceId !== deviceId) {
        // Show device switch modal
        setShowDeviceSwitchModal(true);
        setDeviceSwitchInfo({
          previousDevice: activeDeviceCheck.deviceId,
          lastActivity: activeDeviceCheck.lastActivityAt,
          session: session
        });
      } else {
        // No other device active, resume normally
        await sessionManager.updateActiveDevice(userId, session.sessionId, deviceId);
        resumeSession(session);
      }
    } else {
      // No session, show onboarding
      setCurrentView('introduction');
    }
  }

  loadOrResumeSession();
}, [userId]);

const handleContinueOnThisDevice = async () => {
  const deviceId = sessionManager.generateDeviceId();
  await sessionManager.updateActiveDevice(
    userId,
    deviceSwitchInfo.session.sessionId,
    deviceId
  );

  setShowDeviceSwitchModal(false);
  resumeSession(deviceSwitchInfo.session);
};

const handleGoBack = () => {
  setShowDeviceSwitchModal(false);
  // User decides not to continue, stay at login
};
```

**Dependencies**: Task 4.2
**Estimated Time**: 5 hours
**Risk**: Medium - Complex UX flow

---

#### 4.4 Create Device Switch Modal

**Files to Create**:
- `/src/components/modals/DeviceSwitchModal.tsx`

**Component**:
```typescript
interface DeviceSwitchModalProps {
  previousDevice: string;
  lastActivity: Date;
  onContinueHere: () => void;
  onGoBack: () => void;
}

export const DeviceSwitchModal: React.FC<DeviceSwitchModalProps> = ({
  previousDevice,
  lastActivity,
  onContinueHere,
  onGoBack
}) => {

  const timeAgo = formatDistanceToNow(lastActivity);

  return (
    <Modal>
      <h2>Continue on this device?</h2>

      <p>
        You were recently active on <strong>{previousDevice}</strong> ({timeAgo} ago).
      </p>

      <p>
        Would you like to continue your lesson on this device?
      </p>

      <div className="modal-actions">
        <button onClick={onContinueHere} className="primary">
          Continue Here
        </button>

        <button onClick={onGoBack} className="secondary">
          Go Back
        </button>
      </div>

      <div className="info-box">
        <p>
          💡 Your progress is saved and will sync across all your devices.
        </p>
      </div>
    </Modal>
  );
};
```

**Dependencies**: Task 4.3
**Estimated Time**: 3 hours
**Risk**: Low - UI component

---

#### 4.5 Add Activity Heartbeat

**Files to Modify**:
- `/src/screens/modal-migration/StudentDashboard.tsx`
- `/src/components/ai-containers/MultiSubjectContainerV2-UNIFIED.tsx`

**Purpose**: Keep "last_activity_at" updated so other devices know this one is active

**Implementation**:
```typescript
// Add to StudentDashboard.tsx

useEffect(() => {
  const deviceId = sessionManager.generateDeviceId();
  const sessionId = sessionManager.getCurrentSessionId();

  if (!sessionId) return;

  // Send heartbeat every 30 seconds
  const heartbeatInterval = setInterval(async () => {
    await sessionManager.updateActiveDevice(user.id, sessionId, deviceId);
  }, 30 * 1000);

  return () => clearInterval(heartbeatInterval);
}, [user.id]);
```

**Dependencies**: Task 4.2
**Estimated Time**: 2 hours
**Risk**: Low - Background task

---

### Phase 4 Deliverables

✅ **Updated session schema** with device tracking
✅ **Device tracking methods** in SessionManager
✅ **Cross-device resume logic** in Dashboard
✅ **Device switch modal** for UX
✅ **Activity heartbeat** for real-time device tracking

**Total Estimated Time**: 17 hours
**Critical Path**: 4.1 → 4.2 → 4.3 → 4.4 (4.5 parallel)

---

## PHASE 5: Adaptive Container System

**Goal**: Update next container's rubric based on current container performance.

### Tasks

#### 5.1 Create Adaptive Service

**Files to Create**:
- `/src/services/adaptation/AdaptiveContainerService.ts`

**Key Methods**:
```typescript
class AdaptiveContainerService {
  private rubricStorage: RubricStorageService;

  async updateNextContainerRubric(
    userId: string,
    sessionId: string,
    completedContainer: string,
    completedSubject: Subject,
    performance: PerformanceData
  ): Promise<void> {

    console.log(`🎯 Adapting next container based on ${completedContainer}-${completedSubject} performance`);

    // Determine next container
    const nextContainer = this.getNextContainer(completedContainer);
    if (!nextContainer) {
      console.log('No next container (DISCOVER was last)');
      return;
    }

    // 1. Fetch next container's Data Rubric
    const nextRubric = await this.rubricStorage.getDataRubric(
      userId,
      sessionId,
      nextContainer,
      completedSubject
    );

    // 2. Analyze performance and determine adaptation rules
    const struggled = this.determineIfStruggled(performance);
    const adaptationRules = this.getAdaptationRules(struggled, completedContainer, nextContainer);

    // 3. Update rubric's adaptation data
    nextRubric.adaptationData = {
      performanceFromPreviousContainer: {
        source: `${completedContainer}-${completedSubject}`,
        completedAt: new Date().toISOString(),
        struggled: struggled,
        score: performance.score,
        attempts: performance.attempts,
        timeSpent: performance.timeSpent
      },
      adaptationRules: adaptationRules,
      lastUpdated: new Date().toISOString()
    };

    // 4. Enhance JIT prompt with adaptation context
    nextRubric.jitPrompt = this.enhancePromptWithAdaptation(
      nextRubric.jitPrompt,
      nextRubric.adaptationData
    );

    // 5. Save updated rubric
    await this.rubricStorage.storeDataRubric(
      userId,
      sessionId,
      nextContainer,
      completedSubject,
      nextRubric
    );

    console.log(`✅ ${nextContainer}-${completedSubject} rubric updated with adaptation rules`);
  }

  private determineIfStruggled(performance: PerformanceData): boolean {
    // Multiple indicators of struggle
    return (
      performance.score < 70 ||
      performance.attempts > 2 ||
      performance.struggledQuestions.length > 1
    );
  }

  private getAdaptationRules(
    struggled: boolean,
    fromContainer: string,
    toContainer: string
  ): AdaptationRules {

    if (fromContainer === 'LEARN' && toContainer === 'EXPERIENCE') {
      if (struggled) {
        return {
          scenarioComplexity: 'simplified',
          supportLevel: 'high-guidance',
          skillApplicationFocus: 'reinforcement',
          hintAvailability: 'always-available',
          encouragementFrequency: 'frequent'
        };
      } else {
        return {
          scenarioComplexity: 'standard',
          supportLevel: 'moderate-guidance',
          skillApplicationFocus: 'application',
          hintAvailability: 'on-demand',
          encouragementFrequency: 'standard'
        };
      }
    }

    if (fromContainer === 'EXPERIENCE' && toContainer === 'DISCOVER') {
      if (struggled) {
        return {
          activityComplexity: 'basic-practice',
          hintLevel: 'detailed-guidance',
          stationConnection: 'direct-skill-application',
          explorationDepth: 'surface-level'
        };
      } else {
        return {
          activityComplexity: 'creative-challenge',
          hintLevel: 'minimal-guidance',
          stationConnection: 'surprising-applications',
          explorationDepth: 'deep-exploration'
        };
      }
    }

    // Default: no adaptation
    return {};
  }

  private enhancePromptWithAdaptation(
    originalPrompt: JITPrompt,
    adaptationData: AdaptationData
  ): JITPrompt {

    if (!adaptationData || !adaptationData.adaptationRules) {
      return originalPrompt;
    }

    // Inject adaptation context into prompt
    const adaptationContext = `
ADAPTATION CONTEXT:
Previous container performance:
- Score: ${adaptationData.performanceFromPreviousContainer?.score}%
- Struggled: ${adaptationData.performanceFromPreviousContainer?.struggled ? 'Yes' : 'No'}
- Attempts: ${adaptationData.performanceFromPreviousContainer?.attempts}

Adaptation Rules:
${Object.entries(adaptationData.adaptationRules)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}

IMPORTANT: Adjust content generation based on these rules.
`;

    return {
      ...originalPrompt,
      userPrompt: originalPrompt.userPrompt + '\n\n' + adaptationContext
    };
  }

  private getNextContainer(current: string): string | null {
    const sequence = ['LEARN', 'EXPERIENCE', 'DISCOVER'];
    const currentIndex = sequence.indexOf(current);
    if (currentIndex === -1 || currentIndex === sequence.length - 1) {
      return null;
    }
    return sequence[currentIndex + 1];
  }
}
```

**Dependencies**: Phase 3 complete
**Estimated Time**: 10 hours
**Risk**: High - Core adaptation logic

---

#### 5.2 Integrate AdaptiveService into Containers

**Files to Modify**:
- `/src/components/ai-containers/AILearnContainerV2-UNIFIED.tsx`
- `/src/components/ai-containers/AIExperienceContainerV2-UNIFIED.tsx`

**Changes**: Call AdaptiveService after container completes

**Example**:
```typescript
// AILearnContainerV2-UNIFIED.tsx

const handleComplete = async (performance: PerformanceData) => {
  const sessionId = sessionManager.getCurrentSessionId();

  // 1. Record performance in current rubric
  await jitServiceV2.recordPerformance(
    student.id,
    sessionId,
    "LEARN",
    currentSubject,
    performance
  );

  // 2. Update next container (EXPERIENCE) rubric with adaptation
  await adaptiveService.updateNextContainerRubric(
    student.id,
    sessionId,
    "LEARN",
    currentSubject,
    performance
  );

  // 3. Move to next subject
  onComplete();
};
```

**Dependencies**: Task 5.1
**Estimated Time**: 4 hours
**Risk**: Low - Integration

---

#### 5.3 Add Adaptation Feedback UI

**Files to Create**:
- `/src/components/feedback/AdaptationFeedbackBanner.tsx`

**Purpose**: Show user that content is being personalized

**Component**:
```typescript
interface AdaptationFeedbackBannerProps {
  adaptationType: 'easier' | 'harder' | 'reinforcement';
  previousPerformance: string;
}

export const AdaptationFeedbackBanner: React.FC<AdaptationFeedbackBannerProps> = ({
  adaptationType,
  previousPerformance
}) => {

  const messages = {
    easier: "We've adjusted the next activities to help you build confidence!",
    harder: "Great job! We're adding more challenging activities for you!",
    reinforcement: "Let's practice what you learned with some real-world scenarios!"
  };

  const icons = {
    easier: "🎯",
    harder: "🚀",
    reinforcement: "💪"
  };

  return (
    <div className="adaptation-banner">
      <span className="icon">{icons[adaptationType]}</span>
      <div className="content">
        <strong>Personalized for you</strong>
        <p>{messages[adaptationType]}</p>
      </div>
    </div>
  );
};
```

**Dependencies**: Task 5.2
**Estimated Time**: 3 hours
**Risk**: Low - UI component

---

### Phase 5 Deliverables

✅ **Adaptive Container Service** for dynamic content adjustment
✅ **Integration in containers** to trigger adaptation
✅ **Adaptation feedback UI** to show personalization
✅ **Performance-based rubric updates**

**Total Estimated Time**: 17 hours
**Critical Path**: 5.1 → 5.2 → 5.3

---

## PHASE 6: Testing & Validation

**Goal**: Comprehensive testing of story consistency and cross-device functionality.

### Tasks

#### 6.1 Create Integration Tests

**Files to Create**:
- `/src/tests/integration/rubric-system.test.ts`
- `/src/tests/integration/cross-device.test.ts`
- `/src/tests/integration/story-consistency.test.ts`

**Test Scenarios**:

**Rubric System Tests**:
```typescript
describe('Rubric System Integration', () => {

  test('Master Narrative generates and stores successfully', async () => {
    // Test full flow: generate → store → retrieve
  });

  test('Data Rubrics derived correctly from Master Narrative', async () => {
    // Test that story context matches
  });

  test('JIT uses rubric to generate content', async () => {
    // Test JIT fetch → generate → validate
  });

  test('Generated content validates against rubric', async () => {
    // Test validation catches mismatches
  });

  test('Fallback generation uses Master Narrative', async () => {
    // Test error recovery
  });
});
```

**Cross-Device Tests**:
```typescript
describe('Cross-Device Session Management', () => {

  test('Session resumes on different device', async () => {
    // Simulate: Computer completes LEARN-Math → Tablet resumes to LEARN-ELA
  });

  test('Generated content available on new device', async () => {
    // Test Azure Storage content accessible cross-device
  });

  test('Device switch warning appears', async () => {
    // Test concurrent device detection
  });

  test('Performance syncs across devices', async () => {
    // Test progress tracking cross-device
  });
});
```

**Story Consistency Tests**:
```typescript
describe('Story Consistency Validation', () => {

  test('Companion voice consistent across containers', async () => {
    // Generate LEARN, EXPERIENCE, DISCOVER → validate companion voice matches
  });

  test('Career context maintained throughout', async () => {
    // Validate career narrative thread continuous
  });

  test('Subject narratives connect properly', async () => {
    // Test Math → ELA → Science → Social Studies narrative hooks
  });

  test('Container transitions flow smoothly', async () => {
    // Test LEARN → EXPERIENCE → DISCOVER transitions
  });
});
```

**Dependencies**: All previous phases
**Estimated Time**: 12 hours
**Risk**: Medium - Complex integration testing

---

#### 6.2 Manual Testing Scenarios

**Test Plan Document**:

**Scenario 1: New User Onboarding**
1. New user logs in
2. Selects Career: Chef, Companion: Finn
3. Master Narrative generates
4. Verify rubrics stored in Azure Storage
5. Enter LEARN-Math
6. Verify content generates from rubric
7. Complete LEARN-Math
8. Verify EXPERIENCE-Math rubric updated with performance

**Scenario 2: Cross-Device Resume**
1. User completes LEARN-Math on Computer
2. Switch to Tablet mid-LEARN-ELA
3. Verify device switch modal appears
4. Continue on Tablet
5. Verify progress synced (Math complete, ELA in progress)
6. Complete ELA on Tablet
7. Return to Computer
8. Verify Computer shows updated progress

**Scenario 3: Adaptive Content**
1. User struggles in LEARN-Math (score < 70%)
2. Complete LEARN-Math
3. Enter EXPERIENCE-Math
4. Verify content is simplified (adaptation)
5. User aces EXPERIENCE-Math (score 100%)
6. Complete all EXPERIENCE subjects
7. Enter DISCOVER
8. Verify content is challenging (adaptation)

**Scenario 4: Story Consistency**
1. Complete full lesson: LEARN → EXPERIENCE → DISCOVER
2. Generate lesson plan PDF
3. Validate:
   - Companion voice identical throughout
   - Career context maintained
   - Narrative arc complete
   - Subject connections present

**Dependencies**: Task 6.1
**Estimated Time**: 8 hours
**Risk**: Low - Manual testing

---

#### 6.3 Performance & Load Testing

**Tools**:
- Azure Application Insights
- Custom logging

**Tests**:
1. **Storage Performance**
   - Measure rubric fetch times
   - Test cache hit rates
   - Monitor Azure Storage latency

2. **JIT Generation Times**
   - Baseline: Time to generate content with rubrics
   - Compare to old JIT system
   - Target: < 10 seconds per generation

3. **Cross-Device Sync Speed**
   - Measure time for progress to sync
   - Test heartbeat frequency impact

4. **Concurrent Users**
   - Simulate 100 concurrent sessions
   - Monitor Azure Storage throttling
   - Test session management under load

**Dependencies**: Task 6.2
**Estimated Time**: 6 hours
**Risk**: Low - Performance metrics

---

#### 6.4 User Acceptance Testing (UAT)

**Participants**:
- 5-10 beta users (students)
- 2-3 parents
- 2-3 teachers

**Focus Areas**:
1. **Story Quality**
   - Does narrative feel cohesive?
   - Is companion voice consistent?
   - Does career context make sense?

2. **Cross-Device Experience**
   - Is device switching smooth?
   - Does progress sync properly?
   - Are warnings clear?

3. **Adaptive Content**
   - Do users notice personalization?
   - Is difficulty appropriate?
   - Does adaptation help learning?

4. **Performance**
   - Are load times acceptable?
   - Any lag or delays?
   - Fun facts engaging during loading?

**Dependencies**: Task 6.3
**Estimated Time**: 1 week (asynchronous)
**Risk**: Medium - Depends on user availability

---

### Phase 6 Deliverables

✅ **Integration test suite** for rubric system
✅ **Manual testing plan** executed
✅ **Performance benchmarks** established
✅ **UAT feedback** collected and addressed
✅ **Story consistency validation** passed

**Total Estimated Time**: 26 hours + 1 week UAT
**Critical Path**: 6.1 → 6.2 → 6.3 → 6.4

---

## TOTAL PROJECT TIMELINE

### Time Estimates by Phase

| Phase | Description | Hours | Days (8hr) |
|-------|-------------|-------|------------|
| 1 | Foundation - Master Narrative & Rubrics | 30 | 3.75 |
| 2 | Azure Storage Integration | 16 | 2 |
| 3 | JIT Service Rubric Consumption | 18 | 2.25 |
| 4 | Cross-Device Session Management | 17 | 2.125 |
| 5 | Adaptive Container System | 17 | 2.125 |
| 6 | Testing & Validation | 26 | 3.25 |
| **TOTAL** | | **124 hours** | **15.5 days** |

### Critical Path
```
Phase 1 → Phase 2 → Phase 3 → Phase 5
                 ↘ Phase 4 ↗
                       ↓
                    Phase 6
```

### Parallel Work Opportunities

**Can be done in parallel**:
- Phase 4 (Cross-Device) can start after Phase 2
- Phase 5 (Adaptive) requires Phase 3 but not Phase 4
- Some Phase 6 tests can start during Phase 5

**Optimized Timeline**: ~12 days with parallel work

---

## RISK ASSESSMENT

### High-Risk Items

1. **Task 1.3: Data Rubric Template Service**
   - **Risk**: Story/data alignment is complex
   - **Mitigation**: Extensive validation, multiple reviews

2. **Task 5.1: Adaptive Service**
   - **Risk**: Adaptation logic may not improve learning
   - **Mitigation**: Start with simple rules, iterate based on data

3. **Azure Storage at Scale**
   - **Risk**: Storage costs or performance issues
   - **Mitigation**: Monitor usage, implement caching aggressively

### Medium-Risk Items

1. **Master Narrative Quality**
   - **Risk**: AI-generated narratives may not be coherent
   - **Mitigation**: Extensive prompt engineering, human review

2. **Cross-Device UX**
   - **Risk**: Device switching may confuse users
   - **Mitigation**: Clear messaging, simple flows, user testing

3. **JIT Generation Time**
   - **Risk**: Users may perceive delays
   - **Mitigation**: Engaging loading screens, fun facts, progress indicators

---

## SUCCESS CRITERIA

### Technical
✅ Master Narrative generates in < 10 seconds
✅ Rubrics stored successfully in Azure Storage
✅ JIT content generation uses rubrics
✅ Generated content validates against rubric requirements
✅ Cross-device session resume works within 2 seconds
✅ Adaptive rubric updates trigger correctly

### Story Quality
✅ Companion voice consistent across all containers (validated)
✅ Career context maintained throughout lesson (validated)
✅ Narrative arc complete: premise → mission → resolution (validated)
✅ Subject narratives connect smoothly (validated)

### User Experience
✅ No perceived delays (< 10 sec loading with fun facts)
✅ Cross-device switching is seamless
✅ Users notice and appreciate adaptive content
✅ 90%+ user satisfaction with story coherence

### Performance
✅ Cache hit rate > 80% for rubrics
✅ Azure Storage latency < 200ms
✅ Support 1000+ concurrent sessions

---

## ROLLOUT STRATEGY

### Phase 1: Internal Testing (Week 1-2)
- Development team tests all flows
- Fix critical bugs
- Validate story consistency

### Phase 2: Beta Users (Week 3)
- 5-10 beta users across different grades
- Monitor Azure Storage usage
- Collect feedback on story quality

### Phase 3: Gradual Rollout (Week 4)
- 10% of users
- Monitor performance metrics
- A/B test: old JIT vs new rubric system

### Phase 4: Full Rollout (Week 5)
- 100% of users
- Monitor for issues
- Collect user feedback

### Rollback Plan
- Feature flag: `USE_RUBRIC_SYSTEM`
- Can instantly revert to old JIT system
- Keep old code for 2 weeks after full rollout

---

## NEXT STEPS

1. **Review this plan** with stakeholders
2. **Prioritize** any additional features or changes
3. **Assign tasks** to team members
4. **Set up project tracking** (Jira, GitHub Projects, etc.)
5. **Begin Phase 1** with type definitions

---

**Document Version**: 1.0
**Created**: 2025-01-06
**Author**: Claude (AI Assistant)
**Status**: Ready for Review
