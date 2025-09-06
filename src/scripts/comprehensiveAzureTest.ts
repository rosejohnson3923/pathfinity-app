/**
 * Comprehensive Azure OpenAI Integration Test
 * ============================================
 * Tests multiple careers, skills, and edge cases to validate real accuracy
 */

import { perfectPipeline } from '../services/PerfectPipelineIntegration';
import { UserSelection, SystemContext } from '../services/PerfectPipelineIntegration';
import * as fs from 'fs';

// Comprehensive test cases covering edge cases
const TEST_SCENARIOS = [
  // K-2: Basic concepts with different careers
  {
    user: { gradeLevel: 'K', career: 'Doctor' },
    system: { subject: 'Math', skillName: 'Counting to 10', skillId: 'MATH.K.CC.1' }
  },
  {
    user: { gradeLevel: 'K', career: 'Chef' },
    system: { subject: 'Math', skillName: 'Counting to 10', skillId: 'MATH.K.CC.1' }
  },
  {
    user: { gradeLevel: '1', career: 'Teacher' },
    system: { subject: 'ELA', skillName: 'Letter Recognition', skillId: 'ELA.1.RF.1' }
  },
  {
    user: { gradeLevel: '1', career: 'Artist' },
    system: { subject: 'Math', skillName: 'Addition within 20', skillId: 'MATH.1.OA.1' }
  },
  {
    user: { gradeLevel: '2', career: 'Builder' },
    system: { subject: 'Math', skillName: 'Addition within 100', skillId: 'MATH.2.NBT.5' }
  },
  
  // 3-5: Intermediate with comparisons and negative numbers
  {
    user: { gradeLevel: '3', career: 'Engineer' },
    system: { subject: 'Math', skillName: 'Comparing numbers including negatives', skillId: 'MATH.3.NBT.1' }
  },
  {
    user: { gradeLevel: '4', career: 'Scientist' },
    system: { subject: 'Math', skillName: 'Which is larger or smaller comparisons', skillId: 'MATH.4.NBT.2' }
  },
  {
    user: { gradeLevel: '5', career: 'Accountant' },
    system: { subject: 'Math', skillName: 'Comparing positive and negative numbers', skillId: 'MATH.5.NBT.3' }
  },
  {
    user: { gradeLevel: '5', career: 'Data Scientist' },
    system: { subject: 'Math', skillName: 'Decimal comparisons', skillId: 'MATH.5.NBT.3b' }
  },
  
  // 6-8: Complex concepts
  {
    user: { gradeLevel: '6', career: 'Architect' },
    system: { subject: 'Math', skillName: 'Ratios and Proportions', skillId: 'MATH.6.RP.1' }
  },
  {
    user: { gradeLevel: '7', career: 'Environmental Scientist' },
    system: { subject: 'Science', skillName: 'Ecosystems', skillId: 'SCI.7.LS.2' }
  },
  {
    user: { gradeLevel: '8', career: 'Lawyer' },
    system: { subject: 'Social Studies', skillName: 'US Constitution', skillId: 'SS.8.CG.3' }
  },
  
  // 9-12: Advanced
  {
    user: { gradeLevel: '9', career: 'Geneticist' },
    system: { subject: 'Science', skillName: 'DNA and Heredity', skillId: 'SCI.9.LS.3' }
  },
  {
    user: { gradeLevel: '10', career: 'Economist' },
    system: { subject: 'Math', skillName: 'Quadratic Functions', skillId: 'MATH.10.A.REI.4' }
  },
  {
    user: { gradeLevel: '11', career: 'Research Scientist' },
    system: { subject: 'Science', skillName: 'Chemical Reactions', skillId: 'SCI.11.PS.1' }
  },
  
  // Edge cases - Multiple runs of comparison questions
  {
    user: { gradeLevel: '3', career: 'Teacher' },
    system: { subject: 'Math', skillName: 'Which number is smaller', skillId: 'MATH.3.COMP.1' }
  },
  {
    user: { gradeLevel: '4', career: 'Engineer' },
    system: { subject: 'Math', skillName: 'Which fraction is larger', skillId: 'MATH.4.NF.2' }
  },
  {
    user: { gradeLevel: '5', career: 'Banker' },
    system: { subject: 'Math', skillName: 'Compare negative decimals', skillId: 'MATH.5.NBT.4' }
  }
];

// Different answer attempts for testing
const ANSWER_ATTEMPTS = [
  { type: 'correct', description: 'Correct answer' },
  { type: 'incorrect', description: 'Wrong answer' },
  { type: 'edge', description: 'Edge case answer' }
];

async function runComprehensiveTest() {
  console.log('🚀 COMPREHENSIVE AZURE OPENAI INTEGRATION TEST');
  console.log('=' .repeat(60));
  console.log(`Testing ${TEST_SCENARIOS.length} scenarios with real AI generation\n`);
  
  const results: any[] = [];
  let passCount = 0;
  let failCount = 0;
  const failureDetails: any[] = [];
  
  // Test each scenario
  for (let i = 0; i < TEST_SCENARIOS.length; i++) {
    const scenario = TEST_SCENARIOS[i];
    console.log(`\n[${i + 1}/${TEST_SCENARIOS.length}] Testing:`);
    console.log(`  Grade: ${scenario.user.gradeLevel}, Career: ${scenario.user.career}`);
    console.log(`  Subject: ${scenario.system.subject}, Skill: ${scenario.system.skillName}`);
    
    try {
      // Run the pipeline WITH Azure AI
      const result = await perfectPipeline.runCompletePipeline(
        scenario.user,
        scenario.system,
        'test_answer' // Provide a test answer
      );
      
      // Check for specific issues
      const issues: string[] = [];
      
      // Check if "which" question became true_false
      if (result.question) {
        const q = result.question.content?.toLowerCase() || '';
        const type = result.question.type;
        
        if ((q.includes('which') || q.includes('what is the') || 
             q.includes('larger') || q.includes('smaller')) && 
            type === 'true_false') {
          issues.push('❌ "Which" question misclassified as true_false');
        }
        
        // Check for other issues
        if (!result.stages.aiGeneration) {
          issues.push('❌ AI generation failed');
        }
        if (!result.stages.contentConversion) {
          issues.push('❌ Content conversion failed');
        }
        if (!result.stages.finalValidation) {
          issues.push('❌ Final validation failed');
        }
      }
      
      if (issues.length === 0 && result.success) {
        console.log(`  ✅ PASSED - Type: ${result.question?.type}`);
        passCount++;
      } else {
        console.log(`  ❌ FAILED - Issues: ${issues.join(', ')}`);
        failCount++;
        failureDetails.push({
          scenario,
          issues,
          result
        });
      }
      
      results.push({
        scenario,
        success: issues.length === 0 && result.success,
        issues,
        questionType: result.question?.type,
        question: result.question?.content
      });
      
    } catch (error) {
      console.log(`  ❌ ERROR: ${error}`);
      failCount++;
      results.push({
        scenario,
        success: false,
        error: String(error)
      });
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Run consistency test - same skill multiple times
  console.log('\n\n📊 CONSISTENCY TEST');
  console.log('=' .repeat(60));
  console.log('Running same skill 5 times to check consistency...\n');
  
  const consistencyTest = {
    user: { gradeLevel: '5', career: 'Engineer' },
    system: { subject: 'Math', skillName: 'Which number is smaller', skillId: 'MATH.5.COMP.1' }
  };
  
  const consistencyResults: any[] = [];
  for (let i = 0; i < 5; i++) {
    console.log(`Run ${i + 1}/5:`);
    const result = await perfectPipeline.runCompletePipeline(
      consistencyTest.user,
      consistencyTest.system
    );
    
    const type = result.question?.type;
    console.log(`  Type: ${type}, Question: ${result.question?.content?.substring(0, 50)}...`);
    consistencyResults.push({
      run: i + 1,
      type,
      question: result.question?.content
    });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Check consistency
  const types = consistencyResults.map(r => r.type);
  const allSameType = types.every(t => t === types[0]);
  const allCorrectType = types.every(t => t === 'multiple_choice');
  
  console.log(`\nConsistency: ${allSameType ? '✅' : '❌'} All same type`);
  console.log(`Correctness: ${allCorrectType ? '✅' : '❌'} All multiple_choice (expected for "which" questions)`);
  
  // Final Report
  console.log('\n\n' + '=' .repeat(60));
  console.log('FINAL COMPREHENSIVE TEST REPORT');
  console.log('=' .repeat(60));
  console.log(`Total Scenarios Tested: ${TEST_SCENARIOS.length}`);
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`Success Rate: ${((passCount / TEST_SCENARIOS.length) * 100).toFixed(1)}%`);
  
  if (failureDetails.length > 0) {
    console.log('\n❌ FAILURE DETAILS:');
    failureDetails.forEach((fail, i) => {
      console.log(`\n${i + 1}. ${fail.scenario.system.skillName} (${fail.scenario.user.career})`);
      console.log(`   Issues: ${fail.issues.join(', ')}`);
    });
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: TEST_SCENARIOS.length,
      passed: passCount,
      failed: failCount,
      successRate: ((passCount / TEST_SCENARIOS.length) * 100).toFixed(1) + '%'
    },
    results,
    consistencyTest: {
      results: consistencyResults,
      allSameType,
      allCorrectType
    },
    failures: failureDetails
  };
  
  fs.writeFileSync(
    'comprehensive-azure-test-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Detailed report saved to: comprehensive-azure-test-report.json');
  
  // Return success only if we achieve > 95% accuracy
  const actualSuccessRate = (passCount / TEST_SCENARIOS.length) * 100;
  if (actualSuccessRate < 95) {
    console.log(`\n⚠️  WARNING: Success rate ${actualSuccessRate.toFixed(1)}% is below 95% threshold`);
    console.log('The system is NOT ready for production use.');
  } else {
    console.log(`\n✅ Success rate ${actualSuccessRate.toFixed(1)}% meets production threshold`);
  }
}

// Run the test
runComprehensiveTest().catch(console.error);