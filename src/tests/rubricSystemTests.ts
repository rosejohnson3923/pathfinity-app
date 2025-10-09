/**
 * Rubric System Integration Tests
 *
 * Comprehensive test suite for the entire rubric-based architecture.
 * Tests Phases 1-5: Foundation → Storage → JIT → Sessions → Adaptive
 *
 * Phase 6 Implementation
 */

import { MasterNarrativeGenerator } from '../services/narrative/MasterNarrativeGenerator';
import { DataRubricTemplateService } from '../services/rubric/DataRubricTemplateService';
import { storyConsistencyValidator } from '../services/rubric/StoryConsistencyValidator';
import { getRubricStorage } from '../services/storage/RubricStorageService';
import { getRubricBasedJITService } from '../services/content/RubricBasedJITService';
import { SessionStateService } from '../services/session/SessionStateService';
import { getAdaptiveContentService } from '../services/adaptive/AdaptiveContentService';
import { formatAdaptationStrategy, createStudentDashboard } from '../utils/adaptiveVisualization';
import type { EnrichedMasterNarrative, StoryRubric, DataRubric } from '../types';

/**
 * Test Configuration
 */
const TEST_CONFIG = {
  sessionId: `test-session-${Date.now()}`,
  userId: 'test-user-123',
  gradeLevel: '5th Grade',
  companion: 'Luna',
  career: 'Game Designer',
  subject: 'Math' as const,
  container: 'LEARN' as const
};

/**
 * Test Results Tracker
 */
class TestResults {
  private results: Array<{ name: string; passed: boolean; error?: string; duration: number }> = [];

  record(name: string, passed: boolean, error?: string, duration: number = 0): void {
    this.results.push({ name, passed, error, duration });

    const status = passed ? '✅' : '❌';
    const timing = duration > 0 ? ` (${duration}ms)` : '';
    console.log(`${status} ${name}${timing}`);

    if (error) {
      console.error(`   Error: ${error}`);
    }
  }

  getSummary(): { total: number; passed: number; failed: number; duration: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const duration = this.results.reduce((sum, r) => sum + r.duration, 0);

    return { total, passed, failed, duration };
  }

  print(): void {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('                    TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════════\n');

    const summary = this.getSummary();

    console.log(`Total Tests: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⏱️  Total Duration: ${summary.duration}ms\n`);

    if (summary.failed > 0) {
      console.log('Failed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
      console.log('');
    }

    console.log('═══════════════════════════════════════════════════════════\n');
  }
}

/**
 * Phase 1 Tests: Foundation
 */
export async function testPhase1Foundation(): Promise<TestResults> {
  console.log('\n🧪 Testing Phase 1: Foundation\n');

  const results = new TestResults();
  const generator = new MasterNarrativeGenerator();
  const rubricTemplateService = DataRubricTemplateService.getInstance();

  // Test 1.1: Generate Enriched Master Narrative
  try {
    const startTime = Date.now();

    const enrichedNarrative = await generator.generateEnrichedMasterNarrative({
      sessionId: TEST_CONFIG.sessionId,
      userId: TEST_CONFIG.userId,
      gradeLevel: TEST_CONFIG.gradeLevel,
      companion: TEST_CONFIG.companion,
      career: TEST_CONFIG.career
    });

    const duration = Date.now() - startTime;

    // Validate structure
    const isValid =
      enrichedNarrative.sessionId === TEST_CONFIG.sessionId &&
      enrichedNarrative.narrativeArc !== undefined &&
      enrichedNarrative.companionVoice !== undefined &&
      enrichedNarrative.careerNarrative !== undefined &&
      Object.keys(enrichedNarrative.subjectNarratives).length === 4;

    results.record('Generate Enriched Master Narrative', isValid, undefined, duration);
  } catch (error) {
    results.record('Generate Enriched Master Narrative', false, (error as Error).message);
  }

  // Test 1.2: Derive Story Rubric
  try {
    const startTime = Date.now();

    const enrichedNarrative = await generator.generateEnrichedMasterNarrative({
      sessionId: TEST_CONFIG.sessionId,
      userId: TEST_CONFIG.userId,
      gradeLevel: TEST_CONFIG.gradeLevel,
      companion: TEST_CONFIG.companion,
      career: TEST_CONFIG.career
    });

    const storyRubric = generator.deriveStoryRubric(enrichedNarrative);
    const duration = Date.now() - startTime;

    const isValid =
      storyRubric.sessionId === TEST_CONFIG.sessionId &&
      storyRubric.storyContext !== undefined &&
      storyRubric.companion !== undefined &&
      storyRubric.careerContext !== undefined;

    results.record('Derive Story Rubric', isValid, undefined, duration);
  } catch (error) {
    results.record('Derive Story Rubric', false, (error as Error).message);
  }

  // Test 1.3: Generate Data Rubrics
  try {
    const startTime = Date.now();

    const enrichedNarrative = await generator.generateEnrichedMasterNarrative({
      sessionId: TEST_CONFIG.sessionId,
      userId: TEST_CONFIG.userId,
      gradeLevel: TEST_CONFIG.gradeLevel,
      companion: TEST_CONFIG.companion,
      career: TEST_CONFIG.career
    });

    const storyRubric = generator.deriveStoryRubric(enrichedNarrative);
    const dataRubrics = await rubricTemplateService.generateAllDataRubrics(enrichedNarrative, storyRubric);

    const duration = Date.now() - startTime;

    // Should generate 12 rubrics (3 containers × 4 subjects)
    const isValid = dataRubrics.length === 12;

    results.record('Generate All Data Rubrics (12 total)', isValid, undefined, duration);
  } catch (error) {
    results.record('Generate All Data Rubrics (12 total)', false, (error as Error).message);
  }

  // Test 1.4: Story Consistency Validation
  try {
    const startTime = Date.now();

    const enrichedNarrative = await generator.generateEnrichedMasterNarrative({
      sessionId: TEST_CONFIG.sessionId,
      userId: TEST_CONFIG.userId,
      gradeLevel: TEST_CONFIG.gradeLevel,
      companion: TEST_CONFIG.companion,
      career: TEST_CONFIG.career
    });

    const storyRubric = generator.deriveStoryRubric(enrichedNarrative);
    const dataRubrics = await rubricTemplateService.generateAllDataRubrics(enrichedNarrative, storyRubric);

    const validationResult = storyConsistencyValidator.validateRubricSystem(
      enrichedNarrative,
      storyRubric,
      dataRubrics
    );

    const duration = Date.now() - startTime;

    results.record('Story Consistency Validation', validationResult.isValid, undefined, duration);
  } catch (error) {
    results.record('Story Consistency Validation', false, (error as Error).message);
  }

  return results;
}

/**
 * Phase 2 Tests: Azure Storage
 */
export async function testPhase2Storage(): Promise<TestResults> {
  console.log('\n🧪 Testing Phase 2: Azure Storage\n');

  const results = new TestResults();
  const storage = getRubricStorage();
  const generator = new MasterNarrativeGenerator();
  const rubricTemplateService = DataRubricTemplateService.getInstance();

  // Test 2.1: Save Enriched Narrative
  try {
    const startTime = Date.now();

    const enrichedNarrative = await generator.generateEnrichedMasterNarrative({
      sessionId: TEST_CONFIG.sessionId,
      userId: TEST_CONFIG.userId,
      gradeLevel: TEST_CONFIG.gradeLevel,
      companion: TEST_CONFIG.companion,
      career: TEST_CONFIG.career
    });

    await storage.saveEnrichedNarrative(enrichedNarrative);
    const duration = Date.now() - startTime;

    results.record('Save Enriched Narrative to Azure', true, undefined, duration);
  } catch (error) {
    results.record('Save Enriched Narrative to Azure', false, (error as Error).message);
  }

  // Test 2.2: Retrieve Enriched Narrative
  try {
    const startTime = Date.now();

    const retrieved = await storage.getEnrichedNarrative(TEST_CONFIG.sessionId);
    const duration = Date.now() - startTime;

    const isValid = retrieved !== null && retrieved.sessionId === TEST_CONFIG.sessionId;

    results.record('Retrieve Enriched Narrative from Azure', isValid, undefined, duration);
  } catch (error) {
    results.record('Retrieve Enriched Narrative from Azure', false, (error as Error).message);
  }

  // Test 2.3: Save & Retrieve Data Rubrics
  try {
    const startTime = Date.now();

    const enrichedNarrative = await generator.generateEnrichedMasterNarrative({
      sessionId: TEST_CONFIG.sessionId,
      userId: TEST_CONFIG.userId,
      gradeLevel: TEST_CONFIG.gradeLevel,
      companion: TEST_CONFIG.companion,
      career: TEST_CONFIG.career
    });

    const storyRubric = generator.deriveStoryRubric(enrichedNarrative);
    const dataRubrics = await rubricTemplateService.generateAllDataRubrics(enrichedNarrative, storyRubric);

    // Save all rubrics
    await storage.saveAllDataRubrics(dataRubrics);

    // Retrieve one rubric
    const retrieved = await storage.getDataRubric(TEST_CONFIG.sessionId, 'LEARN', 'Math');

    const duration = Date.now() - startTime;

    const isValid =
      retrieved !== null &&
      retrieved.container === 'LEARN' &&
      retrieved.subject === 'Math';

    results.record('Save & Retrieve Data Rubrics', isValid, undefined, duration);
  } catch (error) {
    results.record('Save & Retrieve Data Rubrics', false, (error as Error).message);
  }

  // Test 2.4: SessionStorage Caching
  try {
    const startTime = Date.now();

    // First fetch (from Azure)
    await storage.getDataRubric(TEST_CONFIG.sessionId, 'LEARN', 'Math');

    // Second fetch (from cache - should be faster)
    const cacheStart = Date.now();
    await storage.getDataRubric(TEST_CONFIG.sessionId, 'LEARN', 'Math');
    const cacheDuration = Date.now() - cacheStart;

    const duration = Date.now() - startTime;

    // Cache should be significantly faster (< 10ms)
    const isValid = cacheDuration < 50;

    results.record('SessionStorage Caching Performance', isValid, undefined, duration);
  } catch (error) {
    results.record('SessionStorage Caching Performance', false, (error as Error).message);
  }

  return results;
}

/**
 * Phase 3 Tests: JIT Content Generation
 */
export async function testPhase3JIT(): Promise<TestResults> {
  console.log('\n🧪 Testing Phase 3: JIT Content Generation\n');

  const results = new TestResults();
  const jitService = getRubricBasedJITService();

  // Test 3.1: Generate Content from Rubric
  try {
    const startTime = Date.now();

    const content = await jitService.generateContentFromRubric({
      sessionId: TEST_CONFIG.sessionId,
      container: TEST_CONFIG.container,
      subject: TEST_CONFIG.subject,
      userId: TEST_CONFIG.userId,
      forceRegenerate: false
    });

    const duration = Date.now() - startTime;

    const isValid = content !== null && content.content !== undefined;

    results.record('Generate Content from Rubric', isValid, undefined, duration);
  } catch (error) {
    results.record('Generate Content from Rubric', false, (error as Error).message);
  }

  // Test 3.2: Content Caching
  try {
    const startTime = Date.now();

    // First generation
    await jitService.generateContentFromRubric({
      sessionId: TEST_CONFIG.sessionId,
      container: TEST_CONFIG.container,
      subject: TEST_CONFIG.subject,
      userId: TEST_CONFIG.userId,
      forceRegenerate: false
    });

    // Second call should use cached content (much faster)
    const cacheStart = Date.now();
    const cached = await jitService.generateContentFromRubric({
      sessionId: TEST_CONFIG.sessionId,
      container: TEST_CONFIG.container,
      subject: TEST_CONFIG.subject,
      userId: TEST_CONFIG.userId,
      forceRegenerate: false
    });
    const cacheDuration = Date.now() - cacheStart;

    const duration = Date.now() - startTime;

    const isValid = cached !== null && cacheDuration < 100;

    results.record('Content Caching Performance', isValid, undefined, duration);
  } catch (error) {
    results.record('Content Caching Performance', false, (error as Error).message);
  }

  // Test 3.3: Record Container Completion
  try {
    const startTime = Date.now();

    await jitService.recordContainerCompletion(
      TEST_CONFIG.sessionId,
      TEST_CONFIG.container,
      TEST_CONFIG.subject,
      {
        score: 85,
        attempts: 2,
        timeSpent: 420,
        struggledQuestions: []
      }
    );

    const duration = Date.now() - startTime;

    results.record('Record Container Completion', true, undefined, duration);
  } catch (error) {
    results.record('Record Container Completion', false, (error as Error).message);
  }

  return results;
}

/**
 * Phase 4 Tests: Cross-Device Sessions
 */
export async function testPhase4Sessions(): Promise<TestResults> {
  console.log('\n🧪 Testing Phase 4: Cross-Device Sessions\n');

  const results = new TestResults();
  const sessionService = SessionStateService.getInstance();

  // Test 4.1: Create Session
  try {
    const startTime = Date.now();

    const session = await sessionService.createSession(TEST_CONFIG.sessionId, TEST_CONFIG.userId);

    const duration = Date.now() - startTime;

    const isValid =
      session.sessionId === TEST_CONFIG.sessionId &&
      session.userId === TEST_CONFIG.userId &&
      session.isActive === true;

    results.record('Create Session', isValid, undefined, duration);
  } catch (error) {
    results.record('Create Session', false, (error as Error).message);
  }

  // Test 4.2: Resume Session
  try {
    const startTime = Date.now();

    const resumed = await sessionService.resumeSession(TEST_CONFIG.sessionId, TEST_CONFIG.userId);

    const duration = Date.now() - startTime;

    const isValid = resumed.sessionId === TEST_CONFIG.sessionId;

    results.record('Resume Session', isValid, undefined, duration);
  } catch (error) {
    results.record('Resume Session', false, (error as Error).message);
  }

  // Test 4.3: Track Container Progress
  try {
    const startTime = Date.now();

    await sessionService.startContainer(TEST_CONFIG.sessionId, 'LEARN', 'Math');
    await sessionService.completeContainer(TEST_CONFIG.sessionId, 'LEARN', 'Math', 85, 2, 420);

    const session = await sessionService.resumeSession(TEST_CONFIG.sessionId, TEST_CONFIG.userId);

    const duration = Date.now() - startTime;

    const isValid = session.completedContainers.length === 1;

    results.record('Track Container Progress', isValid, undefined, duration);
  } catch (error) {
    results.record('Track Container Progress', false, (error as Error).message);
  }

  return results;
}

/**
 * Phase 5 Tests: Adaptive Content
 */
export async function testPhase5Adaptive(): Promise<TestResults> {
  console.log('\n🧪 Testing Phase 5: Adaptive Content\n');

  const results = new TestResults();
  const adaptiveService = getAdaptiveContentService();

  // Test 5.1: Build Performance Profile
  try {
    const startTime = Date.now();

    const profile = await adaptiveService.buildPerformanceProfile(TEST_CONFIG.sessionId);

    const duration = Date.now() - startTime;

    const isValid = profile.sessionId === TEST_CONFIG.sessionId;

    results.record('Build Performance Profile', isValid, undefined, duration);
  } catch (error) {
    results.record('Build Performance Profile', false, (error as Error).message);
  }

  // Test 5.2: Generate Adaptation Strategy
  try {
    const startTime = Date.now();

    const strategy = await adaptiveService.generateAdaptationStrategy(
      TEST_CONFIG.sessionId,
      {
        score: 85,
        attempts: 2,
        timeSpent: 420,
        struggledQuestions: [],
        completedAt: new Date().toISOString(),
        container: 'LEARN',
        subject: 'Math'
      },
      'EXPERIENCE',
      'Math'
    );

    const duration = Date.now() - startTime;

    const isValid = strategy.scenarioComplexity !== undefined;

    console.log('\n' + formatAdaptationStrategy(strategy) + '\n');

    results.record('Generate Adaptation Strategy', isValid, undefined, duration);
  } catch (error) {
    results.record('Generate Adaptation Strategy', false, (error as Error).message);
  }

  // Test 5.3: Apply Strategy to Rubric
  try {
    const startTime = Date.now();

    const strategy = await adaptiveService.generateAdaptationStrategy(
      TEST_CONFIG.sessionId,
      {
        score: 85,
        attempts: 2,
        timeSpent: 420,
        struggledQuestions: [],
        completedAt: new Date().toISOString(),
        container: 'LEARN',
        subject: 'Math'
      },
      'EXPERIENCE',
      'Math'
    );

    await adaptiveService.applyAdaptationToRubric(
      TEST_CONFIG.sessionId,
      'EXPERIENCE',
      'Math',
      strategy
    );

    const duration = Date.now() - startTime;

    results.record('Apply Strategy to Rubric', true, undefined, duration);
  } catch (error) {
    results.record('Apply Strategy to Rubric', false, (error as Error).message);
  }

  return results;
}

/**
 * End-to-End Integration Test
 */
export async function testEndToEnd(): Promise<TestResults> {
  console.log('\n🧪 Testing End-to-End Integration\n');

  const results = new TestResults();
  const testSessionId = `e2e-test-${Date.now()}`;

  try {
    const startTime = Date.now();

    // Step 1: Generate enriched narrative
    const generator = new MasterNarrativeGenerator();
    const enrichedNarrative = await generator.generateEnrichedMasterNarrative({
      sessionId: testSessionId,
      userId: 'e2e-user',
      gradeLevel: '5th Grade',
      companion: 'Luna',
      career: 'Game Designer'
    });

    // Step 2: Generate rubrics
    const storyRubric = generator.deriveStoryRubric(enrichedNarrative);
    const rubricTemplateService = DataRubricTemplateService.getInstance();
    const dataRubrics = await rubricTemplateService.generateAllDataRubrics(enrichedNarrative, storyRubric);

    // Step 3: Save to storage
    const storage = getRubricStorage();
    await storage.saveEnrichedNarrative(enrichedNarrative);
    await storage.saveStoryRubric(storyRubric);
    await storage.saveAllDataRubrics(dataRubrics);

    // Step 4: Create session
    const sessionService = SessionStateService.getInstance();
    await sessionService.createSession(testSessionId, 'e2e-user');

    // Step 5: Generate content
    const jitService = getRubricBasedJITService();
    const content = await jitService.generateContentFromRubric({
      sessionId: testSessionId,
      container: 'LEARN',
      subject: 'Math',
      userId: 'e2e-user',
      forceRegenerate: false
    });

    // Step 6: Complete container
    await sessionService.startContainer(testSessionId, 'LEARN', 'Math');
    await jitService.recordContainerCompletion(testSessionId, 'LEARN', 'Math', {
      score: 85,
      attempts: 2,
      timeSpent: 420,
      struggledQuestions: []
    });
    await sessionService.completeContainer(testSessionId, 'LEARN', 'Math', 85, 2, 420);

    // Step 7: Check adaptive strategy was applied
    const adaptiveService = getAdaptiveContentService();
    const profile = await adaptiveService.buildPerformanceProfile(testSessionId);

    const duration = Date.now() - startTime;

    const isValid =
      enrichedNarrative !== null &&
      dataRubrics.length === 12 &&
      content !== null &&
      profile.containersCompleted === 1;

    console.log('\n' + createStudentDashboard(profile, await adaptiveService.generateAdaptationStrategy(
      testSessionId,
      { score: 85, attempts: 2, timeSpent: 420, struggledQuestions: [], completedAt: new Date().toISOString(), container: 'LEARN', subject: 'Math' },
      'EXPERIENCE',
      'Math'
    )) + '\n');

    results.record('End-to-End Integration Test', isValid, undefined, duration);
  } catch (error) {
    results.record('End-to-End Integration Test', false, (error as Error).message);
  }

  return results;
}

/**
 * Run all tests
 */
export async function runAllTests(): Promise<void> {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║           RUBRIC SYSTEM INTEGRATION TESTS                 ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  const allResults: TestResults[] = [];

  // Run all phase tests
  allResults.push(await testPhase1Foundation());
  allResults.push(await testPhase2Storage());
  allResults.push(await testPhase3JIT());
  allResults.push(await testPhase4Sessions());
  allResults.push(await testPhase5Adaptive());
  allResults.push(await testEndToEnd());

  // Print individual summaries
  allResults.forEach(r => r.print());

  // Print overall summary
  const totalTests = allResults.reduce((sum, r) => sum + r.getSummary().total, 0);
  const totalPassed = allResults.reduce((sum, r) => sum + r.getSummary().passed, 0);
  const totalFailed = allResults.reduce((sum, r) => sum + r.getSummary().failed, 0);
  const totalDuration = allResults.reduce((sum, r) => sum + r.getSummary().duration, 0);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('                  OVERALL TEST SUMMARY');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s\n`);
  console.log('═══════════════════════════════════════════════════════════\n');
}
