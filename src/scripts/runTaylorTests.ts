/**
 * Script to run comprehensive tests for Taylor (Grade 10)
 * Tests all 15 question types across all subjects
 * 
 * Usage: npm run test:taylor
 */

import QuestionTypeTestOrchestrator from '../services/QuestionTypeTestOrchestrator';

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  TAYLOR (GRADE 10) COMPREHENSIVE QUESTION TYPE TEST SUITE  ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();
  console.log('Test Configuration:');
  console.log('  Student: Taylor');
  console.log('  Grade: 10');
  console.log('  Subjects: Math, ELA, Science, Social Studies, Algebra 1, Pre-calculus');
  console.log('  Question Types: All 15 types');
  console.log('  Containers: Learn, Experience, Discover');
  console.log();

  const orchestrator = new QuestionTypeTestOrchestrator();

  try {
    // Run the complete test suite
    await orchestrator.runCompleteSuite();

    // Get and display analysis results
    await orchestrator.getTestResultsSummary();

  } catch (error) {
    console.error('Test suite failed with error:', error);
    process.exit(1);
  }

  console.log('\n✅ Test suite execution complete');
  process.exit(0);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export default main;