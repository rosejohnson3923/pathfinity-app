/**
 * Mock API for data capture - stores in memory/JSON for testing
 * In production, this would connect to PostgreSQL
 */

import * as fs from 'fs';
import * as path from 'path';

interface AnalysisRun {
  id: number;
  run_timestamp: Date;
  run_type: string;
  question_type_focus: string;
  fix_description?: string;
  git_commit_hash?: string;
}

interface CaptureData {
  table: string;
  data: any;
  timestamp: Date;
}

class DataCaptureMockAPI {
  private analysisRuns: AnalysisRun[] = [];
  private captures: Map<string, any[]> = new Map();
  private nextRunId = 1;
  private dataDir = path.join(process.cwd(), 'capture-data');
  
  constructor() {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // Load existing data if available
    this.loadData();
  }
  
  /**
   * Create a new analysis run
   */
  createAnalysisRun(runData: Partial<AnalysisRun>): AnalysisRun {
    const run: AnalysisRun = {
      id: this.nextRunId++,
      run_timestamp: new Date(),
      run_type: runData.run_type || 'test',
      question_type_focus: runData.question_type_focus || 'unknown',
      fix_description: runData.fix_description,
      git_commit_hash: runData.git_commit_hash || this.getGitCommit()
    };
    
    this.analysisRuns.push(run);
    this.saveData();
    
    console.log(`📝 Created Analysis Run #${run.id} (${run.run_type})`);
    return run;
  }
  
  /**
   * Store captured data
   */
  storeCaptures(captures: CaptureData[]) {
    captures.forEach(capture => {
      const tableData = this.captures.get(capture.table) || [];
      tableData.push({
        ...capture.data,
        _captured_at: capture.timestamp
      });
      this.captures.set(capture.table, tableData);
    });
    
    this.saveData();
    console.log(`💾 Stored ${captures.length} captures`);
  }
  
  /**
   * Get analysis run data
   */
  getAnalysisRun(id: number): AnalysisRun | undefined {
    return this.analysisRuns.find(run => run.id === id);
  }
  
  /**
   * Get captures for a specific table
   */
  getCaptures(table: string, filters?: any): any[] {
    const tableData = this.captures.get(table) || [];
    
    if (!filters) return tableData;
    
    // Apply filters
    return tableData.filter(row => {
      for (const key in filters) {
        if (row[key] !== filters[key]) return false;
      }
      return true;
    });
  }
  
  /**
   * Query true/false misdetections
   */
  getTrueFalseMisdetections(analysisRunId?: number): any[] {
    const captures = this.getCaptures('true_false_analysis');
    
    return captures.filter(c => 
      c.question_starts_with_true_false === true &&
      c.initially_detected_as !== 'true_false' &&
      (!analysisRunId || c.analysis_run_id === analysisRunId)
    );
  }
  
  /**
   * Export analysis run data
   */
  exportAnalysisRun(id: number): any {
    const run = this.getAnalysisRun(id);
    if (!run) return null;
    
    const allCaptures: any = {};
    this.captures.forEach((data, table) => {
      const runData = data.filter(d => d.analysis_run_id === id);
      if (runData.length > 0) {
        allCaptures[table] = runData;
      }
    });
    
    return {
      run,
      captures: allCaptures,
      summary: {
        totalCaptures: Object.values(allCaptures).reduce((sum: number, arr: any[]) => sum + arr.length, 0),
        tables: Object.keys(allCaptures)
      }
    };
  }
  
  /**
   * Save data to JSON files
   */
  private saveData() {
    // Save analysis runs
    fs.writeFileSync(
      path.join(this.dataDir, 'analysis_runs.json'),
      JSON.stringify(this.analysisRuns, null, 2)
    );
    
    // Save captures
    const capturesObj: any = {};
    this.captures.forEach((data, table) => {
      capturesObj[table] = data;
    });
    
    fs.writeFileSync(
      path.join(this.dataDir, 'captures.json'),
      JSON.stringify(capturesObj, null, 2)
    );
    
    // Create a summary file for easy viewing
    const summary = {
      lastUpdated: new Date().toISOString(),
      analysisRuns: this.analysisRuns.length,
      tables: Array.from(this.captures.keys()),
      trueFalseMisdetections: this.getTrueFalseMisdetections().length
    };
    
    fs.writeFileSync(
      path.join(this.dataDir, 'summary.json'),
      JSON.stringify(summary, null, 2)
    );
  }
  
  /**
   * Load existing data
   */
  private loadData() {
    try {
      // Load analysis runs
      const runsPath = path.join(this.dataDir, 'analysis_runs.json');
      if (fs.existsSync(runsPath)) {
        this.analysisRuns = JSON.parse(fs.readFileSync(runsPath, 'utf-8'));
        this.nextRunId = Math.max(...this.analysisRuns.map(r => r.id), 0) + 1;
      }
      
      // Load captures
      const capturesPath = path.join(this.dataDir, 'captures.json');
      if (fs.existsSync(capturesPath)) {
        const capturesObj = JSON.parse(fs.readFileSync(capturesPath, 'utf-8'));
        for (const table in capturesObj) {
          this.captures.set(table, capturesObj[table]);
        }
      }
      
      console.log(`📂 Loaded existing data: ${this.analysisRuns.length} runs, ${this.captures.size} tables`);
    } catch (error) {
      console.log('📂 No existing data found, starting fresh');
    }
  }
  
  /**
   * Get current git commit
   */
  private getGitCommit(): string {
    try {
      const { execSync } = require('child_process');
      return execSync('git rev-parse HEAD').toString().trim().substring(0, 7);
    } catch {
      return 'unknown';
    }
  }
  
  /**
   * Generate analysis report
   */
  generateReport(beforeRunId: number, afterRunId: number): string {
    const beforeData = this.exportAnalysisRun(beforeRunId);
    const afterData = this.exportAnalysisRun(afterRunId);
    
    if (!beforeData || !afterData) {
      return 'Missing analysis run data';
    }
    
    const report: string[] = [];
    report.push('TRUE/FALSE DETECTION ANALYSIS REPORT');
    report.push('=' .repeat(50));
    report.push('');
    
    // Before summary
    report.push('BEFORE FIX:');
    const beforeMisdetections = (beforeData.captures.true_false_analysis || [])
      .filter((c: any) => c.question_starts_with_true_false && c.initially_detected_as !== 'true_false');
    report.push(`  True/False misdetections: ${beforeMisdetections.length}`);
    
    // After summary  
    report.push('');
    report.push('AFTER FIX:');
    const afterMisdetections = (afterData.captures.true_false_analysis || [])
      .filter((c: any) => c.question_starts_with_true_false && c.initially_detected_as !== 'true_false');
    report.push(`  True/False misdetections: ${afterMisdetections.length}`);
    
    // Improvement
    report.push('');
    report.push('IMPROVEMENT:');
    const fixed = beforeMisdetections.length - afterMisdetections.length;
    const improvement = beforeMisdetections.length > 0 ? 
      ((fixed / beforeMisdetections.length) * 100).toFixed(1) : '0';
    report.push(`  Issues fixed: ${fixed}`);
    report.push(`  Improvement: ${improvement}%`);
    
    // Details of remaining issues
    if (afterMisdetections.length > 0) {
      report.push('');
      report.push('REMAINING ISSUES:');
      afterMisdetections.forEach((m: any) => {
        report.push(`  - Grade ${m.grade}, ${m.subject}: detected as ${m.initially_detected_as}`);
        report.push(`    Reason: ${m.misdetection_reason}`);
      });
    }
    
    return report.join('\n');
  }
}

// Export singleton instance
export const mockAPI = new DataCaptureMockAPI();

// Mock Express endpoints for testing
export const mockEndpoints = {
  '/api/analysis-runs': {
    POST: (req: any) => {
      return { 
        status: 200, 
        body: mockAPI.createAnalysisRun(req.body) 
      };
    }
  },
  
  '/api/data-capture': {
    POST: (req: any) => {
      mockAPI.storeCaptures(req.body);
      return { 
        status: 200, 
        body: { success: true, count: req.body.length } 
      };
    }
  },
  
  '/api/analysis-runs/:id/export': {
    GET: (req: any) => {
      const data = mockAPI.exportAnalysisRun(parseInt(req.params.id));
      return { 
        status: data ? 200 : 404, 
        body: data || { error: 'Analysis run not found' } 
      };
    }
  },
  
  '/api/report/:beforeId/:afterId': {
    GET: (req: any) => {
      const report = mockAPI.generateReport(
        parseInt(req.params.beforeId),
        parseInt(req.params.afterId)
      );
      return { 
        status: 200, 
        body: { report } 
      };
    }
  }
};