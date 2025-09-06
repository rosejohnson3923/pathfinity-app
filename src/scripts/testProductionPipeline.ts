#!/usr/bin/env node
/**
 * Test Production Pipeline
 * =========================
 * Tests the EXACT production flow with real data
 * Uses actual grade levels, careers, subjects, and skills
 */

// Load environment variables FIRST
import { config } from 'dotenv';
config();

import { perfectPipeline } from '../services/PerfectPipelineIntegration';
import { UserSelection, SystemContext } from '../services/PerfectPipelineIntegration';
import * as fs from 'fs';
import * as path from 'path';

// Real production test cases with actual data
const PRODUCTION_TEST_CASES = [
  // Kindergarten
  {
    user: { gradeLevel: 'K', career: 'Doctor' },
    system: { subject: 'Math', skillName: 'Counting to 10', skillId: 'MATH.K.CC.1' }
  },
  {
    user: { gradeLevel: 'K', career: 'Teacher' },
    system: { subject: 'ELA', skillName: 'Letter Recognition', skillId: 'ELA.K.RF.1' }
  },
  
  // Grade 1
  {
    user: { gradeLevel: '1', career: 'Veterinarian' },
    system: { subject: 'Science', skillName: 'Animal Habitats', skillId: 'SCI.1.LS.1' }
  },
  {
    user: { gradeLevel: '1', career: 'Police Officer' },
    system: { subject: 'Social Studies', skillName: 'Community Helpers', skillId: 'SS.1.CG.1' }
  },
  
  // Grade 2
  {
    user: { gradeLevel: '2', career: 'Builder' },
    system: { subject: 'Math', skillName: 'Addition within 100', skillId: 'MATH.2.NBT.5' }
  },
  
  // Grade 3
  {
    user: { gradeLevel: '3', career: 'Engineer' },
    system: { subject: 'Math', skillName: 'Multiplication Facts', skillId: 'MATH.3.OA.7' }
  },
  
  // Grade 4
  {
    user: { gradeLevel: '4', career: 'Architect' },
    system: { subject: 'Math', skillName: 'Area and Perimeter', skillId: 'MATH.4.MD.3' }
  },
  
  // Grade 5
  {
    user: { gradeLevel: '5', career: 'Scientist' },
    system: { subject: 'Science', skillName: 'Matter and Its Properties', skillId: 'SCI.5.PS.1' }
  },
  {
    user: { gradeLevel: '5', career: 'Accountant' },
    system: { subject: 'Math', skillName: 'Decimal Operations', skillId: 'MATH.5.NBT.7' }
  },
  
  // Grade 6
  {
    user: { gradeLevel: '6', career: 'Data Scientist' },
    system: { subject: 'Math', skillName: 'Ratios and Proportions', skillId: 'MATH.6.RP.1' }
  },
  
  // Grade 7
  {
    user: { gradeLevel: '7', career: 'Environmental Scientist' },
    system: { subject: 'Science', skillName: 'Ecosystems', skillId: 'SCI.7.LS.2' }
  },
  
  // Grade 8
  {
    user: { gradeLevel: '8', career: 'Lawyer' },
    system: { subject: 'Social Studies', skillName: 'US Constitution', skillId: 'SS.8.CG.3' }
  },
  
  // Grade 9
  {
    user: { gradeLevel: '9', career: 'Geneticist' },
    system: { subject: 'Science', skillName: 'DNA and Heredity', skillId: 'SCI.9.LS.3' }
  },
  
  // Grade 10
  {
    user: { gradeLevel: '10', career: 'Economist' },
    system: { subject: 'Math', skillName: 'Quadratic Functions', skillId: 'MATH.10.A.REI.4' }
  },
  
  // Grade 11-12
  {
    user: { gradeLevel: '11', career: 'Research Scientist' },
    system: { subject: 'Science', skillName: 'Chemical Reactions', skillId: 'SCI.11.PS.1' }
  }
];

interface TestResult {
  testCase: {
    user: UserSelection;
    system: SystemContext;
  };
  passed: boolean;
  questionType?: string;
  errors?: string[];
  feedback?: string;
}

class ProductionPipelineTester {
  private results: TestResult[] = [];
  
  /**
   * Test a single production scenario
   */
  async testScenario(
    userSelection: UserSelection,
    systemContext: SystemContext,
    index: number
  ): Promise<TestResult> {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Test ${index + 1}: ${systemContext.subject} - Grade ${userSelection.gradeLevel}`);
    console.log(`Career: ${userSelection.career}, Skill: ${systemContext.skillName}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      // Run the EXACT production pipeline
      const result = await perfectPipeline.runCompletePipeline(
        userSelection,
        systemContext,
        'test_answer' // Provide a test answer to test validation
      );
      
      if (result.success) {
        console.log(`✅ SUCCESS: ${result.question?.type} question generated and validated`);
        console.log(`   Question: ${result.question?.content?.substring(0, 80)}...`);
        console.log(`   Feedback: ${result.feedback?.substring(0, 80)}...`);
        
        return {
          testCase: { user: userSelection, system: systemContext },
          passed: true,
          questionType: result.question?.type,
          feedback: result.feedback
        };
      } else {
        console.log(`❌ FAILED: ${result.error}`);
        const errors: string[] = [];
        
        // Check which stages failed
        Object.entries(result.stages).forEach(([stage, success]) => {
          if (!success) {
            errors.push(`Stage '${stage}' failed`);
          }
        });
        
        return {
          testCase: { user: userSelection, system: systemContext },
          passed: false,
          errors
        };
      }
    } catch (error) {
      console.error(`💥 Fatal error:`, error);
      return {
        testCase: { user: userSelection, system: systemContext },
        passed: false,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }
  
  /**
   * Test all production scenarios
   */
  async testAllScenarios(): Promise<void> {
    console.log('🚀 PRODUCTION PIPELINE TESTER');
    console.log('Testing real production scenarios with actual grade/career/subject/skill combinations\n');
    
    for (let i = 0; i < PRODUCTION_TEST_CASES.length; i++) {
      const testCase = PRODUCTION_TEST_CASES[i];
      const result = await this.testScenario(
        testCase.user,
        testCase.system,
        i
      );
      this.results.push(result);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.generateReport();
  }
  
  /**
   * Test specific grade level
   */
  async testGradeLevel(grade: string): Promise<void> {
    const testCases = PRODUCTION_TEST_CASES.filter(tc => tc.user.gradeLevel === grade);
    
    if (testCases.length === 0) {
      console.log(`No test cases found for grade ${grade}`);
      return;
    }
    
    console.log(`Testing ${testCases.length} scenarios for grade ${grade}\n`);
    
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const result = await this.testScenario(
        testCase.user,
        testCase.system,
        i
      );
      this.results.push(result);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.generateReport();
  }
  
  /**
   * Generate final report
   */
  private generateReport(): void {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    
    console.log('\n' + '='.repeat(60));
    console.log('PRODUCTION PIPELINE REPORT');
    console.log('='.repeat(60));
    console.log(`Total Scenarios Tested: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    // Grade breakdown
    const gradeStats = new Map<string, { passed: number; total: number }>();
    this.results.forEach(r => {
      const grade = r.testCase.user.gradeLevel;
      if (!gradeStats.has(grade)) {
        gradeStats.set(grade, { passed: 0, total: 0 });
      }
      const stats = gradeStats.get(grade)!;
      stats.total++;
      if (r.passed) stats.passed++;
    });
    
    console.log('\nSuccess by Grade:');
    Array.from(gradeStats.entries())
      .sort((a, b) => {
        const gradeA = a[0] === 'K' ? 0 : parseInt(a[0]);
        const gradeB = b[0] === 'K' ? 0 : parseInt(b[0]);
        return gradeA - gradeB;
      })
      .forEach(([grade, stats]) => {
        const percentage = ((stats.passed / stats.total) * 100).toFixed(0);
        console.log(`  Grade ${grade}: ${stats.passed}/${stats.total} (${percentage}%)`);
      });
    
    // Subject breakdown
    const subjectStats = new Map<string, { passed: number; total: number }>();
    this.results.forEach(r => {
      const subject = r.testCase.system.subject;
      if (!subjectStats.has(subject)) {
        subjectStats.set(subject, { passed: 0, total: 0 });
      }
      const stats = subjectStats.get(subject)!;
      stats.total++;
      if (r.passed) stats.passed++;
    });
    
    console.log('\nSuccess by Subject:');
    subjectStats.forEach((stats, subject) => {
      const percentage = ((stats.passed / stats.total) * 100).toFixed(0);
      console.log(`  ${subject}: ${stats.passed}/${stats.total} (${percentage}%)`);
    });
    
    // Question type distribution
    const typeStats = new Map<string, number>();
    this.results.filter(r => r.passed).forEach(r => {
      const type = r.questionType || 'unknown';
      typeStats.set(type, (typeStats.get(type) || 0) + 1);
    });
    
    console.log('\nQuestion Types Generated:');
    typeStats.forEach((count, type) => {
      console.log(`  ${type}: ${count}`);
    });
    
    // Failed scenarios details
    const failedResults = this.results.filter(r => !r.passed);
    if (failedResults.length > 0) {
      console.log('\nFailed Scenarios:');
      failedResults.forEach(r => {
        console.log(`  Grade ${r.testCase.user.gradeLevel} - ${r.testCase.system.subject} - ${r.testCase.system.skillName}:`);
        r.errors?.forEach(err => console.log(`    - ${err}`));
      });
    }
    
    // Save detailed report
    const reportPath = path.join(process.cwd(), 'production-pipeline-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
    // Success criteria check
    console.log('\n' + '='.repeat(60));
    if (passed === total) {
      console.log('🎉 100% SUCCESS! All production scenarios passed!');
    } else {
      console.log(`⚠️  ${failed} scenarios failed. 100% accuracy not achieved.`);
    }
    console.log('='.repeat(60));
  }
}

// Main execution
async function main() {
  const tester = new ProductionPipelineTester();
  const args = process.argv.slice(2);
  
  if (args[0] === 'all') {
    await tester.testAllScenarios();
  } else if (args[0]) {
    // Test specific grade
    await tester.testGradeLevel(args[0]);
  } else {
    console.log('Usage:');
    console.log('  npm run test:production all    # Test all scenarios');
    console.log('  npm run test:production K      # Test Kindergarten');
    console.log('  npm run test:production 5      # Test Grade 5');
    console.log('  npm run test:production 10     # Test Grade 10');
  }
}

main().catch(console.error);