/**
 * Test Runner for True/False Question Detection Analysis
 * 
 * This script will:
 * 1. Run tests BEFORE any fix to capture baseline
 * 2. Apply the fix
 * 3. Run tests AFTER the fix
 * 4. Compare results and generate report
 */

import { QuestionTypeTestSuite } from './src/services/QuestionTypeTestSuite';
import { DataCaptureService } from './src/services/DataCaptureService';
import { initializeDataCapture } from './src/services/DataCaptureIntegration';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

async function main() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     TRUE/FALSE QUESTION DETECTION ANALYSIS TOOL           ║');
  console.log('║     Identifying why "True or False:" → "counting"         ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);

  // Initialize data capture intercepts
  initializeDataCapture();
  
  const testSuite = new QuestionTypeTestSuite();
  const captureService = DataCaptureService.getInstance();
  
  // PHASE 1: BEFORE FIX
  console.log(`\n${colors.bright}${colors.yellow}═══════════════════════════════════════`);
  console.log('PHASE 1: CAPTURING BASELINE (BEFORE FIX)');
  console.log(`═══════════════════════════════════════${colors.reset}\n`);
  
  const beforeResults = await testSuite.testTrueFalseQuestions();
  
  // Show problematic patterns found
  console.log(`\n${colors.bright}${colors.red}🔍 PROBLEMATIC PATTERNS IDENTIFIED:${colors.reset}`);
  
  const criticalIssues = beforeResults.testResults
    .filter(r => r.issues.some(i => i.severity === 'critical'))
    .map(r => ({
      test: r.testCase.name,
      grade: r.testCase.grade,
      subject: r.testCase.subject,
      detectedAs: r.capturedData.detectedType,
      expectedAs: r.testCase.expectedBehavior.expectedType
    }));
  
  if (criticalIssues.length > 0) {
    console.log('\nCases where True/False was misdetected:');
    criticalIssues.forEach(issue => {
      console.log(`   ${colors.red}❌${colors.reset} ${issue.test}`);
      console.log(`      Grade: ${issue.grade}, Subject: ${issue.subject}`);
      console.log(`      Expected: '${issue.expectedAs}' → Got: '${issue.detectedAs}'`);
    });
    
    // Identify the pattern
    const k2MathIssues = criticalIssues.filter(i => 
      ['K', '1', '2'].includes(i.grade) && i.subject === 'Math'
    );
    
    if (k2MathIssues.length > 0) {
      console.log(`\n${colors.bright}${colors.yellow}⚠️  PATTERN DETECTED:${colors.reset}`);
      console.log('   True/False questions are being detected as "counting" when:');
      console.log('   1. Grade is K, 1, or 2');
      console.log('   2. Subject is Math');
      console.log('   3. Question has a visual field');
      console.log('\n   This happens in AILearningJourneyService lines 704-705:');
      console.log(`   ${colors.cyan}if (content.assessment.visual && skill.subject === 'Math' && student.grade_level <= '2') {`);
      console.log(`     content.assessment.type = 'counting';${colors.reset}`);
      console.log(`   ${colors.red}This check runs BEFORE checking for "True or False:" pattern!${colors.reset}`);
    }
  }
  
  // PHASE 2: APPLY FIX
  console.log(`\n${colors.bright}${colors.green}═══════════════════════════════════════`);
  console.log('PHASE 2: FIX TO APPLY');
  console.log(`═══════════════════════════════════════${colors.reset}\n`);
  
  console.log('The fix is to check for "True or False:" pattern FIRST:');
  console.log(`${colors.green}// Check for True/False FIRST before any other detection`);
  console.log(`const questionText = content.assessment.question || '';`);
  console.log(`if (questionText.match(/^true or false:?/i)) {`);
  console.log(`  content.assessment.type = 'true_false';`);
  console.log(`} else if (content.assessment.visual && skill.subject === 'Math' && student.grade_level <= '2') {`);
  console.log(`  content.assessment.type = 'counting';`);
  console.log(`}${colors.reset}`);
  
  console.log(`\n${colors.yellow}⚠️  NOTE: Fix must be applied manually to:`);
  console.log(`   src/services/AILearningJourneyService.ts (lines 702-719)${colors.reset}`);
  
  // Wait for user to apply fix
  console.log(`\n${colors.bright}Press ENTER after applying the fix to continue...${colors.reset}`);
  await waitForEnter();
  
  // PHASE 3: AFTER FIX
  console.log(`\n${colors.bright}${colors.blue}═══════════════════════════════════════`);
  console.log('PHASE 3: TESTING AFTER FIX');
  console.log(`═══════════════════════════════════════${colors.reset}\n`);
  
  const afterResults = await testSuite.testTrueFalseQuestions();
  
  // PHASE 4: COMPARISON
  console.log(`\n${colors.bright}${colors.magenta}═══════════════════════════════════════`);
  console.log('PHASE 4: COMPARING RESULTS');
  console.log(`═══════════════════════════════════════${colors.reset}\n`);
  
  const comparison = await testSuite.compareResults(beforeResults, afterResults);
  
  // Generate detailed report
  generateDetailedReport(beforeResults, afterResults, comparison);
  
  // Export data for database analysis
  console.log(`\n${colors.bright}${colors.cyan}📊 Exporting data for database analysis...${colors.reset}`);
  
  if (beforeResults.analysisRunId && afterResults.analysisRunId) {
    console.log(`   Before Fix: Analysis Run #${beforeResults.analysisRunId}`);
    console.log(`   After Fix:  Analysis Run #${afterResults.analysisRunId}`);
    console.log('\nYou can now query the database for detailed analysis:');
    console.log(`${colors.cyan}SELECT * FROM true_false_misdetections WHERE analysis_run_id = ${beforeResults.analysisRunId};${colors.reset}`);
  }
  
  console.log(`\n${colors.bright}${colors.green}✅ Analysis Complete!${colors.reset}\n`);
}

function generateDetailedReport(before: any, after: any, comparison: any) {
  console.log(`\n${colors.bright}═══════════════════════════════════════`);
  console.log('📋 DETAILED COMPARISON REPORT');
  console.log(`═══════════════════════════════════════${colors.reset}\n`);
  
  // Success metrics
  const beforeCritical = before.summary.criticalIssues;
  const afterCritical = after.summary.criticalIssues;
  const improvement = beforeCritical - afterCritical;
  const improvementPercent = beforeCritical > 0 ? 
    ((improvement / beforeCritical) * 100).toFixed(1) : '0';
  
  console.log('📈 IMPROVEMENT METRICS:');
  console.log(`   Critical Issues Before: ${beforeCritical}`);
  console.log(`   Critical Issues After:  ${afterCritical}`);
  console.log(`   Issues Fixed: ${improvement}`);
  console.log(`   Improvement: ${improvementPercent}%`);
  
  // Test by test comparison
  console.log('\n📊 TEST-BY-TEST COMPARISON:');
  console.log('─'.repeat(60));
  
  before.testResults.forEach((beforeTest: any, idx: number) => {
    const afterTest = after.testResults[idx];
    const testName = beforeTest.testCase.name;
    
    const beforeType = beforeTest.capturedData.detectedType;
    const afterType = afterTest.capturedData.detectedType;
    const expected = beforeTest.testCase.expectedBehavior.expectedType;
    
    const beforeCorrect = beforeType === expected;
    const afterCorrect = afterType === expected;
    
    let status = '';
    let statusColor = '';
    
    if (!beforeCorrect && afterCorrect) {
      status = '✅ FIXED';
      statusColor = colors.green;
    } else if (beforeCorrect && !afterCorrect) {
      status = '❌ REGRESSED';
      statusColor = colors.red;
    } else if (beforeCorrect && afterCorrect) {
      status = '✓ OK';
      statusColor = colors.green;
    } else {
      status = '⚠️  STILL BROKEN';
      statusColor = colors.yellow;
    }
    
    console.log(`\n${testName}:`);
    console.log(`   Before: ${beforeType} ${beforeCorrect ? '✓' : '✗'}`);
    console.log(`   After:  ${afterType} ${afterCorrect ? '✓' : '✗'}`);
    console.log(`   ${statusColor}${status}${colors.reset}`);
  });
  
  console.log('\n' + '─'.repeat(60));
}

function waitForEnter(): Promise<void> {
  return new Promise((resolve) => {
    process.stdin.once('data', () => {
      resolve();
    });
  });
}

// Run the analysis
main().catch(error => {
  console.error(`${colors.red}Error running analysis:${colors.reset}`, error);
  process.exit(1);
});