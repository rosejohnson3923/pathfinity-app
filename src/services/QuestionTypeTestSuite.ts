/**
 * QuestionTypeTestSuite - Systematic testing of true_false questions
 * Focus: Testing why "True or False:" questions are detected as counting
 */

import { DataCaptureService } from './DataCaptureService';
import { aiLearningJourneyService } from './AILearningJourneyService';
import { JustInTimeContentService } from './content/JustInTimeContentService';

export interface TestCase {
  name: string;
  grade: string;
  subject: string;
  skill: string;
  career?: string;
  expectedBehavior: {
    shouldStartWith?: string;
    shouldHaveFields: string[];
    correctAnswerFormat: 'boolean' | 'string' | 'number';
    expectedType: string;
    shouldHaveVisual?: boolean;
  };
}

export interface TestResult {
  testCase: TestCase;
  passed: boolean;
  issues: Issue[];
  capturedData: {
    aiResponse: any;
    detectedType: string;
    convertedQuestion: any;
    finalType: string;
  };
}

export interface Issue {
  stage: string;
  severity: 'critical' | 'warning' | 'info';
  expected: any;
  actual: any;
  description: string;
}

export interface TestSuiteResults {
  questionType: string;
  timestamp: Date;
  analysisRunId: number;
  testResults: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    criticalIssues: number;
  };
}

export class QuestionTypeTestSuite {
  private captureService = DataCaptureService.getInstance();
  private jitService = JustInTimeContentService.getInstance();
  
  /**
   * Test TRUE/FALSE questions across different grades and subjects
   */
  public async testTrueFalseQuestions(): Promise<TestSuiteResults> {
    console.log('\n🧪 Starting True/False Question Test Suite');
    console.log('=' .repeat(50));
    
    // Start analysis run
    const analysisRunId = await this.captureService.startAnalysisRun(
      'before_fix',
      'true_false',
      'Testing true_false detection across grades and subjects'
    );
    
    // Enable capturing
    this.captureService.setCapturing(true);
    
    // Define comprehensive test cases
    const testCases: TestCase[] = [
      // Kindergarten Math - Most problematic (visual + Math + grade ≤ 2)
      {
        name: 'K-Math-Counting-TrueFalse',
        grade: 'K',
        subject: 'Math',
        skill: 'counting',
        career: 'Chef',
        expectedBehavior: {
          shouldStartWith: 'True or False:',
          shouldHaveFields: ['question', 'type', 'correct_answer'],
          correctAnswerFormat: 'boolean',
          expectedType: 'true_false',
          shouldHaveVisual: true
        }
      },
      // Grade 1 Math - Also problematic
      {
        name: '1-Math-Addition-TrueFalse',
        grade: '1',
        subject: 'Math',
        skill: 'addition',
        career: 'Doctor',
        expectedBehavior: {
          shouldStartWith: 'True or False:',
          shouldHaveFields: ['question', 'type', 'correct_answer'],
          correctAnswerFormat: 'boolean',
          expectedType: 'true_false',
          shouldHaveVisual: true
        }
      },
      // Grade 2 Math - Edge of problematic range
      {
        name: '2-Math-Subtraction-TrueFalse',
        grade: '2',
        subject: 'Math',
        skill: 'subtraction',
        career: 'Teacher',
        expectedBehavior: {
          shouldStartWith: 'True or False:',
          shouldHaveFields: ['question', 'type', 'correct_answer'],
          correctAnswerFormat: 'boolean',
          expectedType: 'true_false',
          shouldHaveVisual: true
        }
      },
      // Grade 3 Math - Should work correctly
      {
        name: '3-Math-Multiplication-TrueFalse',
        grade: '3',
        subject: 'Math',
        skill: 'multiplication',
        career: 'Engineer',
        expectedBehavior: {
          shouldStartWith: 'True or False:',
          shouldHaveFields: ['question', 'type', 'correct_answer'],
          correctAnswerFormat: 'boolean',
          expectedType: 'true_false',
          shouldHaveVisual: false
        }
      },
      // Kindergarten ELA - Different subject
      {
        name: 'K-ELA-Letters-TrueFalse',
        grade: 'K',
        subject: 'ELA',
        skill: 'letter_recognition',
        career: 'Author',
        expectedBehavior: {
          shouldStartWith: 'True or False:',
          shouldHaveFields: ['question', 'type', 'correct_answer'],
          correctAnswerFormat: 'boolean',
          expectedType: 'true_false',
          shouldHaveVisual: false
        }
      },
      // Grade 7 Math - Higher grade
      {
        name: '7-Math-Algebra-TrueFalse',
        grade: '7',
        subject: 'Math',
        skill: 'algebra',
        career: 'Data Scientist',
        expectedBehavior: {
          shouldStartWith: 'True or False:',
          shouldHaveFields: ['question', 'type', 'correct_answer'],
          correctAnswerFormat: 'boolean',
          expectedType: 'true_false',
          shouldHaveVisual: false
        }
      }
    ];
    
    const results: TestResult[] = [];
    
    // Run each test case
    for (const testCase of testCases) {
      console.log(`\n📋 Testing: ${testCase.name}`);
      console.log(`   Grade: ${testCase.grade}, Subject: ${testCase.subject}, Skill: ${testCase.skill}`);
      
      const result = await this.runSingleTest(testCase);
      results.push(result);
      
      // Log immediate results
      if (result.passed) {
        console.log(`   ✅ PASSED`);
      } else {
        console.log(`   ❌ FAILED with ${result.issues.length} issues:`);
        result.issues.forEach(issue => {
          const icon = issue.severity === 'critical' ? '🔴' : 
                       issue.severity === 'warning' ? '🟡' : '🔵';
          console.log(`      ${icon} ${issue.stage}: ${issue.description}`);
        });
      }
    }
    
    // Flush any remaining captures
    await this.captureService.flushQueue();
    
    // Disable capturing
    this.captureService.setCapturing(false);
    
    // Generate summary
    const summary = {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      criticalIssues: results.reduce((sum, r) => 
        sum + r.issues.filter(i => i.severity === 'critical').length, 0
      )
    };
    
    console.log('\n' + '=' .repeat(50));
    console.log('📊 Test Suite Summary:');
    console.log(`   Total Tests: ${summary.total}`);
    console.log(`   ✅ Passed: ${summary.passed}`);
    console.log(`   ❌ Failed: ${summary.failed}`);
    console.log(`   🔴 Critical Issues: ${summary.criticalIssues}`);
    
    return {
      questionType: 'true_false',
      timestamp: new Date(),
      analysisRunId,
      testResults: results,
      summary
    };
  }
  
  /**
   * Run a single test case
   */
  private async runSingleTest(testCase: TestCase): Promise<TestResult> {
    const issues: Issue[] = [];
    const capturedData: any = {
      aiResponse: null,
      detectedType: null,
      convertedQuestion: null,
      finalType: null
    };
    
    try {
      // Create student and skill objects
      const student = {
        id: `test-student-${testCase.grade}`,
        display_name: 'Test Student',
        grade_level: testCase.grade,
        interests: [testCase.career || 'learning'],
        learning_style: 'visual'
      };
      
      const skill = {
        skill_number: `${testCase.subject}.${testCase.skill}.1`,
        skill_name: testCase.skill,
        subject: testCase.subject,
        grade_level: testCase.grade
      };
      
      const career = testCase.career ? {
        name: testCase.career,
        description: `${testCase.career} professional`
      } : undefined;
      
      // Generate content - this triggers the AI service
      console.log(`   🤖 Generating content...`);
      const content = await aiLearningJourneyService.generateLearnContent(
        skill,
        student,
        career
      );
      
      capturedData.aiResponse = content;
      
      // Check the assessment question (most likely to be true/false)
      const assessmentQuestion = content.assessment;
      if (assessmentQuestion) {
        this.analyzeQuestion(assessmentQuestion, testCase, issues, capturedData, 'assessment');
      }
      
      // Check practice questions too
      if (content.practice && content.practice.length > 0) {
        // Look for any true/false in practice
        const trueFalseQuestions = content.practice.filter((q: any) => {
          const text = q.question || q.content || '';
          return text.toLowerCase().includes('true or false');
        });
        
        trueFalseQuestions.forEach((q: any, idx: number) => {
          this.analyzeQuestion(q, testCase, issues, capturedData, `practice_${idx}`);
        });
      }
      
    } catch (error) {
      issues.push({
        stage: 'generation',
        severity: 'critical',
        expected: 'Successful generation',
        actual: error.message,
        description: `Failed to generate content: ${error.message}`
      });
    }
    
    return {
      testCase,
      passed: issues.filter(i => i.severity === 'critical').length === 0,
      issues,
      capturedData
    };
  }
  
  /**
   * Analyze a single question against expected behavior
   */
  private analyzeQuestion(
    question: any,
    testCase: TestCase,
    issues: Issue[],
    capturedData: any,
    questionPhase: string
  ) {
    const expected = testCase.expectedBehavior;
    const questionText = question.question || question.content || '';
    
    // Store detected type
    capturedData.detectedType = question.type;
    capturedData.finalType = question.type;
    
    // Check 1: Question starts with "True or False:"
    if (expected.shouldStartWith) {
      const startsCorrectly = questionText.toLowerCase().startsWith(expected.shouldStartWith.toLowerCase());
      if (!startsCorrectly) {
        issues.push({
          stage: `${questionPhase}_content`,
          severity: 'warning',
          expected: `Start with "${expected.shouldStartWith}"`,
          actual: questionText.substring(0, 50),
          description: `Question doesn't start with expected pattern`
        });
      }
    }
    
    // Check 2: Type detection - CRITICAL for our issue
    if (question.type !== expected.expectedType) {
      issues.push({
        stage: `${questionPhase}_type_detection`,
        severity: 'critical',
        expected: expected.expectedType,
        actual: question.type,
        description: `Type detected as '${question.type}' instead of '${expected.expectedType}'`
      });
      
      // Try to determine why it was misdetected
      if (question.type === 'counting' && expected.expectedType === 'true_false') {
        const reasons = [];
        if (question.visual) reasons.push('has visual field');
        if (testCase.subject === 'Math') reasons.push('Math subject');
        if (['K', '1', '2'].includes(testCase.grade)) reasons.push(`grade ${testCase.grade}`);
        
        issues.push({
          stage: `${questionPhase}_misdetection_reason`,
          severity: 'info',
          expected: 'true_false detection',
          actual: 'counting detection triggered',
          description: `Likely triggered by: ${reasons.join(', ')}`
        });
      }
    }
    
    // Check 3: Required fields
    for (const field of expected.shouldHaveFields) {
      if (!(field in question)) {
        issues.push({
          stage: `${questionPhase}_structure`,
          severity: 'warning',
          expected: `Has field '${field}'`,
          actual: 'Field missing',
          description: `Required field '${field}' is missing`
        });
      }
    }
    
    // Check 4: Correct answer format
    const correctAnswerField = question.correct_answer !== undefined ? 'correct_answer' :
                               question.correctAnswer !== undefined ? 'correctAnswer' : null;
    
    if (correctAnswerField) {
      const correctAnswer = question[correctAnswerField];
      const actualType = typeof correctAnswer;
      
      if (actualType !== expected.correctAnswerFormat) {
        issues.push({
          stage: `${questionPhase}_answer_format`,
          severity: 'warning',
          expected: `${expected.correctAnswerFormat} type`,
          actual: `${actualType} type`,
          description: `Correct answer is ${actualType} (${correctAnswer}) instead of ${expected.correctAnswerFormat}`
        });
      }
    }
    
    // Check 5: Visual field (for K-2 Math)
    if (expected.shouldHaveVisual !== undefined) {
      const hasVisual = 'visual' in question;
      if (hasVisual !== expected.shouldHaveVisual) {
        issues.push({
          stage: `${questionPhase}_visual`,
          severity: 'info',
          expected: expected.shouldHaveVisual ? 'Has visual' : 'No visual',
          actual: hasVisual ? 'Has visual' : 'No visual',
          description: `Visual field ${hasVisual ? 'present' : 'missing'} (expected: ${expected.shouldHaveVisual})`
        });
      }
    }
    
    // Log the actual question for debugging
    if (questionText.toLowerCase().includes('true or false')) {
      console.log(`   📝 True/False question found:`);
      console.log(`      Text: "${questionText.substring(0, 60)}..."`);
      console.log(`      Detected Type: ${question.type}`);
      console.log(`      Has Visual: ${'visual' in question}`);
    }
  }
  
  /**
   * Compare before and after results
   */
  public async compareResults(
    beforeResults: TestSuiteResults,
    afterResults: TestSuiteResults
  ): Promise<ComparisonReport> {
    const report: ComparisonReport = {
      questionType: 'true_false',
      timestamp: new Date(),
      improvements: [],
      regressions: [],
      unchanged: [],
      summary: {
        totalTests: beforeResults.testResults.length,
        improved: 0,
        regressed: 0,
        unchanged: 0
      }
    };
    
    // Compare each test case
    for (let i = 0; i < beforeResults.testResults.length; i++) {
      const before = beforeResults.testResults[i];
      const after = afterResults.testResults[i];
      
      if (!after) continue;
      
      const comparison = {
        testCase: before.testCase.name,
        grade: before.testCase.grade,
        subject: before.testCase.subject,
        before: {
          passed: before.passed,
          issues: before.issues.length,
          criticalIssues: before.issues.filter(i => i.severity === 'critical').length,
          detectedType: before.capturedData.detectedType
        },
        after: {
          passed: after.passed,
          issues: after.issues.length,
          criticalIssues: after.issues.filter(i => i.severity === 'critical').length,
          detectedType: after.capturedData.detectedType
        }
      };
      
      // Determine status
      if (!before.passed && after.passed) {
        report.improvements.push(comparison);
        report.summary.improved++;
      } else if (before.passed && !after.passed) {
        report.regressions.push(comparison);
        report.summary.regressed++;
      } else if (before.issues.length > after.issues.length) {
        report.improvements.push(comparison);
        report.summary.improved++;
      } else if (before.issues.length < after.issues.length) {
        report.regressions.push(comparison);
        report.summary.regressed++;
      } else {
        report.unchanged.push(comparison);
        report.summary.unchanged++;
      }
    }
    
    // Print comparison report
    console.log('\n' + '=' .repeat(50));
    console.log('📈 COMPARISON REPORT: True/False Questions');
    console.log('=' .repeat(50));
    
    if (report.improvements.length > 0) {
      console.log('\n✅ IMPROVEMENTS:');
      report.improvements.forEach(imp => {
        console.log(`   ${imp.testCase} (${imp.grade} ${imp.subject}):`);
        console.log(`      Before: ${imp.before.detectedType} (${imp.before.criticalIssues} critical issues)`);
        console.log(`      After:  ${imp.after.detectedType} (${imp.after.criticalIssues} critical issues)`);
      });
    }
    
    if (report.regressions.length > 0) {
      console.log('\n❌ REGRESSIONS:');
      report.regressions.forEach(reg => {
        console.log(`   ${reg.testCase} (${reg.grade} ${reg.subject}):`);
        console.log(`      Before: ${reg.before.detectedType} (${reg.before.criticalIssues} critical issues)`);
        console.log(`      After:  ${reg.after.detectedType} (${reg.after.criticalIssues} critical issues)`);
      });
    }
    
    console.log('\n📊 SUMMARY:');
    console.log(`   Total Tests: ${report.summary.totalTests}`);
    console.log(`   ✅ Improved: ${report.summary.improved}`);
    console.log(`   ❌ Regressed: ${report.summary.regressed}`);
    console.log(`   ➖ Unchanged: ${report.summary.unchanged}`);
    
    return report;
  }
}

interface ComparisonReport {
  questionType: string;
  timestamp: Date;
  improvements: any[];
  regressions: any[];
  unchanged: any[];
  summary: {
    totalTests: number;
    improved: number;
    regressed: number;
    unchanged: number;
  };
}