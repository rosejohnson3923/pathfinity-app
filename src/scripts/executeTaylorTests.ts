#!/usr/bin/env tsx
/**
 * Execute comprehensive question type tests for Taylor (Grade 10)
 * This script:
 * 1. Imports Grade 10 skills to database
 * 2. Runs question type tests for all subjects
 * 3. Analyzes results for True/False misdetection
 * 
 * Usage: npm run test:taylor:execute
 */

import { supabase } from '@/lib/supabase';
import Grade10SkillsImporter from '../services/Grade10SkillsImporter';
import QuestionTypeTestOrchestrator from '../services/QuestionTypeTestOrchestrator';
import AILearningJourneyService from '../services/AILearningJourneyService';
import { JustInTimeContentService } from '../services/content/JustInTimeContentService';

// Test configuration
const TEST_CONFIG = {
  student: {
    name: 'Taylor',
    grade: '10',
    id: 'taylor-test-10'
  },
  subjects: {
    core: ['Math', 'ELA', 'Science', 'Social Studies'],
    advanced: ['Algebra 1', 'Pre-calculus']
  },
  containers: ['learn', 'experience', 'discover'],
  questionTypes: [
    'multiple_choice',
    'true_false',
    'short_answer',
    'fill_blank',
    'matching',
    'sequencing',
    'numeric',
    'counting', // Should NOT appear for Grade 10
    'drawing',
    'coding',
    'true_false_w_image',
    'true_false_wo_image',
    'visual_pattern',
    'word_problem',
    'creative_writing'
  ]
};

async function setupTestEnvironment() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         TAYLOR GRADE 10 COMPREHENSIVE TEST SUITE           ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n📚 Phase 1: Setting up test environment...\n');

  // Step 1: Import Grade 10 skills
  console.log('Step 1: Importing Grade 10 skills...');
  const importer = new Grade10SkillsImporter();
  await importer.parseSkillsFile();
  
  const stats = importer.getStatistics();
  console.log('\n📊 Skills Statistics:');
  console.log(`  Total Skills: ${stats.totalSkills}`);
  for (const [subject, data] of Object.entries(stats.bySubject)) {
    console.log(`  ${subject}: ${data.count} skills across ${data.clusterCount} clusters`);
  }

  // Step 2: Import to database (optional - uncomment to actually import)
  // console.log('\nStep 2: Importing to database...');
  // await importer.importToDatabase();

  // Step 3: Get sample skills for testing
  const sampleSkills = importer.getSampleSkills();
  
  return { importer, sampleSkills };
}

async function runQuestionTypeTests(sampleSkills: Map<string, any[]>) {
  console.log('\n\n📝 Phase 2: Testing Question Type Detection...\n');

  const orchestrator = new QuestionTypeTestOrchestrator();
  await orchestrator.initializeTestRun();

  const testResults = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    trueFalseMisdetections: [],
    unexpectedCounting: []
  };

  // Test each subject
  for (const subject of TEST_CONFIG.subjects.core) {
    console.log(`\n🔬 Testing ${subject}:`);
    console.log('─'.repeat(50));

    const skills = sampleSkills.get(subject) || [];
    if (skills.length === 0) {
      console.log(`  ⚠️  No skills found for ${subject}`);
      continue;
    }

    // Test priority question types for Grade 10
    const priorityTypes = [
      'true_false',
      'true_false_wo_image',
      'multiple_choice',
      'short_answer',
      'word_problem'
    ];

    for (const questionType of priorityTypes) {
      for (const container of TEST_CONFIG.containers) {
        const skill = skills[0]; // Use first skill for testing
        const skillCode = `${skill.skillNumber}`;
        
        console.log(`  Testing: ${container} / ${questionType}`);
        
        const result = await orchestrator.executeTest(
          subject,
          container,
          questionType,
          skillCode
        );

        testResults.totalTests++;
        
        if (result.success) {
          testResults.passed++;
          
          // Check for True/False misdetection
          if (questionType.includes('true_false') && result.detectedType === 'counting') {
            testResults.trueFalseMisdetections.push({
              subject,
              container,
              expectedType: questionType,
              detectedType: result.detectedType,
              captureId: result.captureId
            });
            console.log(`    ❌ CRITICAL: True/False detected as counting!`);
          } else if (result.detectedType === questionType) {
            console.log(`    ✅ Correctly detected as ${questionType}`);
          } else {
            console.log(`    ⚠️  Type mismatch: expected ${questionType}, got ${result.detectedType}`);
          }
          
          // Check for unexpected counting (Grade 10 shouldn't have counting questions)
          if (result.detectedType === 'counting') {
            testResults.unexpectedCounting.push({
              subject,
              container,
              originalType: questionType,
              captureId: result.captureId
            });
          }
        } else {
          testResults.failed++;
          console.log(`    ❌ Test failed: ${result.error}`);
        }
      }
    }
  }

  return testResults;
}

async function analyzeResults(testResults: any) {
  console.log('\n\n📊 Phase 3: Analyzing Results...\n');
  console.log('═'.repeat(60));
  
  // Overall statistics
  console.log('📈 Test Statistics:');
  console.log(`  Total Tests: ${testResults.totalTests}`);
  console.log(`  Passed: ${testResults.passed} (${((testResults.passed / testResults.totalTests) * 100).toFixed(1)}%)`);
  console.log(`  Failed: ${testResults.failed} (${((testResults.failed / testResults.totalTests) * 100).toFixed(1)}%)`);

  // Critical issues
  if (testResults.trueFalseMisdetections.length > 0) {
    console.log('\n🚨 CRITICAL ISSUE: True/False Misdetections');
    console.log('─'.repeat(60));
    for (const issue of testResults.trueFalseMisdetections) {
      console.log(`  ${issue.subject} / ${issue.container}:`);
      console.log(`    Expected: ${issue.expectedType}`);
      console.log(`    Detected: ${issue.detectedType}`);
      console.log(`    Capture ID: ${issue.captureId}`);
    }
  }

  if (testResults.unexpectedCounting.length > 0) {
    console.log('\n⚠️  WARNING: Unexpected Counting Questions for Grade 10');
    console.log('─'.repeat(60));
    console.log('  Counting questions are typically for Grades 1-5');
    for (const issue of testResults.unexpectedCounting) {
      console.log(`  ${issue.subject} / ${issue.container}: ${issue.originalType} → counting`);
    }
  }

  // Database analysis
  console.log('\n\n📊 Database Analysis:');
  
  // Query for True/False misdetections
  const { data: misdetections } = await supabase
    .from('true_false_analysis')
    .select('*')
    .eq('grade', '10')
    .eq('initially_detected_as', 'counting');

  if (misdetections && misdetections.length > 0) {
    console.log(`\n  Found ${misdetections.length} True/False → Counting misdetections in database`);
    
    // Group by subject
    const bySubject = new Map<string, number>();
    for (const m of misdetections) {
      const count = bySubject.get(m.subject) || 0;
      bySubject.set(m.subject, count + 1);
    }
    
    console.log('\n  Misdetections by subject:');
    for (const [subject, count] of bySubject) {
      console.log(`    ${subject}: ${count}`);
    }
  }
}

async function generateRecommendations() {
  console.log('\n\n💡 Phase 4: Recommendations...\n');
  console.log('═'.repeat(60));
  
  console.log('Based on the test results, here are the critical fixes needed:');
  console.log('\n1. AILearningJourneyService.ts (Line ~700):');
  console.log('   BEFORE: Check visual + Math + grade ≤ 2 for counting');
  console.log('   AFTER:  Check "True or False:" pattern FIRST');
  console.log('\n2. Question Type Detection Priority:');
  console.log('   1st: True/False patterns');
  console.log('   2nd: Multiple choice (has options array)');
  console.log('   3rd: Other specific types');
  console.log('   LAST: Counting (only for grades 1-5)');
  console.log('\n3. Grade-Appropriate Question Types:');
  console.log('   Grade 10 should NOT receive:');
  console.log('   - Counting questions (for elementary grades)');
  console.log('   - Basic visual pattern matching');
  console.log('\n4. Database-Driven Solution:');
  console.log('   - Pre-generate content with validated types');
  console.log('   - Store type detection at generation time');
  console.log('   - Use type registry for validation');
}

async function main() {
  try {
    // Phase 1: Setup
    const { importer, sampleSkills } = await setupTestEnvironment();

    // Phase 2: Run tests
    const testResults = await runQuestionTypeTests(sampleSkills);

    // Phase 3: Analyze results
    await analyzeResults(testResults);

    // Phase 4: Generate recommendations
    await generateRecommendations();

    console.log('\n\n✅ Test suite execution complete!');
    console.log('═'.repeat(60));
    console.log('\n📝 Next Steps:');
    console.log('1. Review the misdetection analysis above');
    console.log('2. Apply fixes to AILearningJourneyService.ts');
    console.log('3. Re-run tests to verify fixes');
    console.log('4. Migrate to database-driven architecture');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run the test suite
if (require.main === module) {
  main().catch(console.error);
}

export default main;