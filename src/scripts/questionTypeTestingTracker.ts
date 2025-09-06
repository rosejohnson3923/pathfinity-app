/**
 * Question Type Testing Tracker
 * =============================
 * Tracks testing progress for all 15 question types
 */

interface TestResult {
  type: string;
  subject: string;
  skill?: string;  // Added skill tracking
  container?: string;  // Added container tracking
  status: 'not_tested' | 'passed' | 'failed' | 'issues';
  notes?: string;
  timestamp?: string;
}

class QuestionTypeTestingTracker {
  private static instance: QuestionTypeTestingTracker;
  private results: Map<string, TestResult> = new Map();
  
  // All 15 question types
  private readonly ALL_TYPES = [
    'multiple_choice',
    'true_false',
    'fill_blank',
    'numeric',
    'matching',
    'ordering',
    'short_answer',
    'essay',
    'drag_drop',
    'multi_select',
    'slider',
    'hotspot',
    'diagram_label',
    'graph_plot',
    'table_complete'
  ];

  private constructor() {
    this.loadResults();
  }

  static getInstance(): QuestionTypeTestingTracker {
    if (!QuestionTypeTestingTracker.instance) {
      QuestionTypeTestingTracker.instance = new QuestionTypeTestingTracker();
    }
    return QuestionTypeTestingTracker.instance;
  }

  /**
   * Record a test result
   */
  recordTest(
    type: string, 
    subject: string, 
    passed: boolean, 
    skill?: string,
    container?: string,
    notes?: string
  ) {
    const key = `${type}-${subject}-${skill || 'unknown'}-${container || 'learn'}`;
    this.results.set(key, {
      type,
      subject,
      skill,
      container,
      status: passed ? 'passed' : 'failed',
      notes,
      timestamp: new Date().toISOString()
    });
    this.saveResults();
    this.printProgress();
  }

  /**
   * Get current testing progress
   */
  getProgress(): {
    total: number;
    tested: number;
    passed: number;
    failed: number;
    remaining: string[];
  } {
    const tested = new Set<string>();
    let passed = 0;
    let failed = 0;

    for (const [key, result] of this.results.entries()) {
      tested.add(result.type);
      if (result.status === 'passed') passed++;
      if (result.status === 'failed') failed++;
    }

    const remaining = this.ALL_TYPES.filter(type => !tested.has(type));

    return {
      total: this.ALL_TYPES.length,
      tested: tested.size,
      passed,
      failed,
      remaining
    };
  }

  /**
   * Print progress to console
   */
  printProgress() {
    const progress = this.getProgress();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 QUESTION TYPE TESTING PROGRESS');
    console.log('='.repeat(50));
    
    console.log(`\n✅ Tested: ${progress.tested}/${progress.total} types`);
    console.log(`   Passed: ${progress.passed}`);
    console.log(`   Failed: ${progress.failed}`);
    
    console.log('\n📋 Status by Type:');
    for (const type of this.ALL_TYPES) {
      const results = Array.from(this.results.values()).filter(r => r.type === type);
      if (results.length > 0) {
        const passed = results.filter(r => r.status === 'passed').length;
        const failed = results.filter(r => r.status === 'failed').length;
        console.log(`   ${type}: ✅ ${passed} passed, ❌ ${failed} failed`);
      } else {
        console.log(`   ${type}: ⏳ Not tested yet`);
      }
    }
    
    if (progress.remaining.length > 0) {
      console.log('\n🎯 Next to test:');
      progress.remaining.slice(0, 5).forEach(type => {
        console.log(`   - ${type}`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
  }

  /**
   * Save results to localStorage
   */
  private saveResults() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = Array.from(this.results.entries());
      localStorage.setItem('questionTypeTestResults', JSON.stringify(data));
    }
  }

  /**
   * Load results from localStorage
   */
  private loadResults() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('questionTypeTestResults');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.results = new Map(data);
        } catch (e) {
          console.error('Failed to load test results:', e);
        }
      }
    }
  }

  /**
   * Reset all results
   */
  reset() {
    this.results.clear();
    this.saveResults();
    console.log('🔄 Test results reset');
  }

  /**
   * Get detailed report
   */
  getDetailedReport() {
    const report: any = {
      summary: this.getProgress(),
      byType: {},
      bySubject: {}
    };

    // Group by type
    for (const type of this.ALL_TYPES) {
      const typeResults = Array.from(this.results.values()).filter(r => r.type === type);
      report.byType[type] = typeResults;
    }

    // Group by subject
    const subjects = new Set(Array.from(this.results.values()).map(r => r.subject));
    for (const subject of subjects) {
      const subjectResults = Array.from(this.results.values()).filter(r => r.subject === subject);
      report.bySubject[subject] = subjectResults;
    }

    return report;
  }
}

// Export for use in console
if (typeof window !== 'undefined') {
  (window as any).testTracker = QuestionTypeTestingTracker.getInstance();
  (window as any).recordTest = (
    type: string, 
    subject: string, 
    passed: boolean, 
    skill?: string,
    container?: string,
    notes?: string
  ) => {
    QuestionTypeTestingTracker.getInstance().recordTest(type, subject, passed, skill, container, notes);
  };
  (window as any).testProgress = () => {
    QuestionTypeTestingTracker.getInstance().printProgress();
  };
  (window as any).resetTests = () => {
    QuestionTypeTestingTracker.getInstance().reset();
  };
  
  console.log('🎯 Question Type Testing Tracker Loaded!');
  console.log('   Commands:');
  console.log('   - recordTest("multiple_choice", "Math", true, "A.1", "learn")');
  console.log('   - testProgress()');
  console.log('   - resetTests()');
  console.log('   - testTracker.getDetailedReport()');
}

export default QuestionTypeTestingTracker.getInstance();