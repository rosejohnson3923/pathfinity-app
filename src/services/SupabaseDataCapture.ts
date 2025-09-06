/**
 * Supabase Data Capture Service
 * Connects to Supabase for persistent storage of question type analysis
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export interface AnalysisRun {
  id?: number;
  run_timestamp?: Date;
  run_type: 'before_fix' | 'after_fix';
  question_type_focus: string;
  fix_description?: string;
  git_commit_hash?: string;
}

export interface RawDataCapture {
  id?: number;
  capture_timestamp?: Date;
  analysis_run_id?: number;
  session_id: string;
  user_id?: string;
  requested_grade?: string;
  requested_subject?: string;
  requested_skill?: string;
  requested_container_type?: string;
  requested_career?: string;
  requested_character?: string;
  source_service: string;
  source_method: string;
  raw_request: any;
  raw_response: any;
  raw_context?: any;
  has_error?: boolean;
  error_message?: string;
  processing_time_ms?: number;
}

export interface QuestionTypeAnalysis {
  id?: number;
  analysis_run_id?: number;
  capture_id?: number;
  question_type: string;
  test_grade: string;
  test_subject: string;
  test_skill: string;
  test_container?: string;
  stage_1_ai_request?: any;
  stage_2_ai_response?: any;
  stage_3_type_detected?: string;
  stage_4_converted_question?: any;
  stage_5_rendered_question?: any;
  stage_6_validation_input?: any;
  stage_7_validation_result?: any;
  question_text?: string;
  detected_type_by_ai?: string;
  detected_type_by_validator?: string;
  detected_type_by_converter?: string;
  final_type_used?: string;
  type_mismatch?: boolean;
  field_missing?: string[];
  unexpected_transformation?: string;
}

export interface TrueFalseAnalysis {
  id?: number;
  capture_id?: number;
  question_starts_with_true_false: boolean;
  question_text: string;
  has_visual_field: boolean;
  visual_content?: string;
  grade: string;
  subject: string;
  initially_detected_as?: string;
  finally_rendered_as?: string;
  misdetection_reason?: string;
  detection_service_path?: string[];
  correct_answer_field_name?: string;
  correct_answer_type?: string;
  correct_answer_value?: string;
}

export class SupabaseDataCapture {
  private static instance: SupabaseDataCapture;
  private supabase: SupabaseClient;
  private currentAnalysisRunId: number | null = null;
  private captureQueue: any[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }
    
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    this.startAutoFlush();
    
    console.log('✅ Connected to Supabase for data capture');
  }
  
  public static getInstance(): SupabaseDataCapture {
    if (!SupabaseDataCapture.instance) {
      SupabaseDataCapture.instance = new SupabaseDataCapture();
    }
    return SupabaseDataCapture.instance;
  }
  
  /**
   * Create or get an analysis run
   */
  public async startAnalysisRun(
    runType: 'before_fix' | 'after_fix',
    questionTypeFocus: string,
    fixDescription?: string
  ): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from('analysis_runs')
        .insert({
          run_type: runType,
          question_type_focus: questionTypeFocus,
          fix_description: fixDescription,
          git_commit_hash: await this.getGitCommitHash()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      this.currentAnalysisRunId = data.id;
      console.log(`🏃 Started Supabase analysis run #${data.id} for ${questionTypeFocus} (${runType})`);
      
      return data.id;
    } catch (error) {
      console.error('Failed to create analysis run:', error);
      throw error;
    }
  }
  
  /**
   * Capture raw data
   */
  public async captureRawData(capture: RawDataCapture): Promise<number | null> {
    try {
      capture.analysis_run_id = this.currentAnalysisRunId || undefined;
      
      const { data, error } = await this.supabase
        .from('raw_data_captures')
        .insert(capture)
        .select()
        .single();
      
      if (error) throw error;
      
      return data.id;
    } catch (error) {
      console.error('Failed to capture raw data:', error);
      return null;
    }
  }
  
  /**
   * Capture question type analysis
   */
  public async captureQuestionAnalysis(analysis: QuestionTypeAnalysis): Promise<void> {
    try {
      analysis.analysis_run_id = this.currentAnalysisRunId || undefined;
      
      // Queue for batch insert
      this.captureQueue.push({
        table: 'question_type_analysis',
        data: analysis
      });
      
      // Auto-flush if queue is large
      if (this.captureQueue.length >= 10) {
        await this.flushQueue();
      }
    } catch (error) {
      console.error('Failed to capture question analysis:', error);
    }
  }
  
  /**
   * Capture true/false specific analysis
   */
  public async captureTrueFalseAnalysis(analysis: TrueFalseAnalysis): Promise<void> {
    try {
      // Queue for batch insert
      this.captureQueue.push({
        table: 'true_false_analysis',
        data: analysis
      });
      
      // Log misdetections immediately
      if (analysis.question_starts_with_true_false && 
          analysis.initially_detected_as !== 'true_false') {
        console.warn(`⚠️ TRUE_FALSE MISDETECTION captured in Supabase:`);
        console.warn(`   Grade: ${analysis.grade}, Subject: ${analysis.subject}`);
        console.warn(`   Detected as: ${analysis.initially_detected_as}`);
        console.warn(`   Reason: ${analysis.misdetection_reason}`);
      }
      
      // Auto-flush if queue is large
      if (this.captureQueue.length >= 10) {
        await this.flushQueue();
      }
    } catch (error) {
      console.error('Failed to capture true/false analysis:', error);
    }
  }
  
  /**
   * Batch insert queued data
   */
  public async flushQueue(): Promise<void> {
    if (this.captureQueue.length === 0) return;
    
    const batch = [...this.captureQueue];
    this.captureQueue = [];
    
    // Group by table
    const grouped = batch.reduce((acc, item) => {
      if (!acc[item.table]) acc[item.table] = [];
      acc[item.table].push(item.data);
      return acc;
    }, {} as Record<string, any[]>);
    
    // Insert each table's data
    for (const [table, data] of Object.entries(grouped)) {
      try {
        const { error } = await this.supabase
          .from(table)
          .insert(data);
        
        if (error) throw error;
        
        console.log(`📤 Flushed ${data.length} records to Supabase table: ${table}`);
      } catch (error) {
        console.error(`Failed to flush to ${table}:`, error);
        // Re-queue on failure
        data.forEach(d => this.captureQueue.push({ table, data: d }));
      }
    }
  }
  
  /**
   * Query true/false misdetections
   */
  public async getTrueFalseMisdetections(analysisRunId?: number): Promise<TrueFalseAnalysis[]> {
    try {
      let query = this.supabase
        .from('true_false_analysis')
        .select('*')
        .eq('question_starts_with_true_false', true)
        .neq('initially_detected_as', 'true_false');
      
      if (analysisRunId) {
        // Join with raw_data_captures to filter by analysis_run_id
        query = query.eq('capture_id.analysis_run_id', analysisRunId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to query misdetections:', error);
      return [];
    }
  }
  
  /**
   * Get analysis comparison
   */
  public async compareAnalysisRuns(
    beforeRunId: number,
    afterRunId: number
  ): Promise<ComparisonReport> {
    try {
      // Get misdetections for both runs
      const [beforeMisdetections, afterMisdetections] = await Promise.all([
        this.getTrueFalseMisdetections(beforeRunId),
        this.getTrueFalseMisdetections(afterRunId)
      ]);
      
      // Get all question analyses for both runs
      const { data: beforeQuestions } = await this.supabase
        .from('question_type_analysis')
        .select('*')
        .eq('analysis_run_id', beforeRunId);
      
      const { data: afterQuestions } = await this.supabase
        .from('question_type_analysis')
        .select('*')
        .eq('analysis_run_id', afterRunId);
      
      const report: ComparisonReport = {
        beforeRunId,
        afterRunId,
        timestamp: new Date(),
        trueFalseMisdetections: {
          before: beforeMisdetections.length,
          after: afterMisdetections.length,
          fixed: beforeMisdetections.length - afterMisdetections.length
        },
        typeMatches: {
          before: (beforeQuestions || []).filter(q => !q.type_mismatch).length,
          after: (afterQuestions || []).filter(q => !q.type_mismatch).length
        },
        byGradeSubject: this.groupByGradeSubject(beforeMisdetections, afterMisdetections)
      };
      
      return report;
    } catch (error) {
      console.error('Failed to compare analysis runs:', error);
      throw error;
    }
  }
  
  /**
   * Group misdetections by grade and subject
   */
  private groupByGradeSubject(
    before: TrueFalseAnalysis[],
    after: TrueFalseAnalysis[]
  ): Record<string, { before: number; after: number }> {
    const result: Record<string, { before: number; after: number }> = {};
    
    // Count before
    before.forEach(item => {
      const key = `${item.grade}-${item.subject}`;
      if (!result[key]) result[key] = { before: 0, after: 0 };
      result[key].before++;
    });
    
    // Count after
    after.forEach(item => {
      const key = `${item.grade}-${item.subject}`;
      if (!result[key]) result[key] = { before: 0, after: 0 };
      result[key].after++;
    });
    
    return result;
  }
  
  /**
   * Get detailed analysis for a specific test case
   */
  public async getTestCaseAnalysis(
    analysisRunId: number,
    grade: string,
    subject: string,
    skill: string
  ): Promise<QuestionTypeAnalysis[]> {
    try {
      const { data, error } = await this.supabase
        .from('question_type_analysis')
        .select('*')
        .eq('analysis_run_id', analysisRunId)
        .eq('test_grade', grade)
        .eq('test_subject', subject)
        .eq('test_skill', skill);
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Failed to get test case analysis:', error);
      return [];
    }
  }
  
  /**
   * Generate analysis summary
   */
  public async generateSummary(analysisRunId: number): Promise<AnalysisSummary> {
    try {
      // Get all data for this run
      const [misdetections, questions, run] = await Promise.all([
        this.getTrueFalseMisdetections(analysisRunId),
        this.supabase
          .from('question_type_analysis')
          .select('*')
          .eq('analysis_run_id', analysisRunId),
        this.supabase
          .from('analysis_runs')
          .select('*')
          .eq('id', analysisRunId)
          .single()
      ]);
      
      const summary: AnalysisSummary = {
        runId: analysisRunId,
        runType: run.data?.run_type,
        timestamp: run.data?.run_timestamp,
        questionTypeFocus: run.data?.question_type_focus,
        statistics: {
          totalQuestions: questions.data?.length || 0,
          trueFalseMisdetections: misdetections.length,
          typeMismatches: questions.data?.filter(q => q.type_mismatch).length || 0,
          criticalIssues: this.countCriticalIssues(questions.data || [])
        },
        topIssues: this.identifyTopIssues(misdetections),
        affectedGrades: [...new Set(misdetections.map(m => m.grade))],
        affectedSubjects: [...new Set(misdetections.map(m => m.subject))]
      };
      
      return summary;
    } catch (error) {
      console.error('Failed to generate summary:', error);
      throw error;
    }
  }
  
  private countCriticalIssues(questions: QuestionTypeAnalysis[]): number {
    return questions.filter(q => 
      q.type_mismatch || 
      (q.field_missing && q.field_missing.length > 0)
    ).length;
  }
  
  private identifyTopIssues(misdetections: TrueFalseAnalysis[]): string[] {
    const issues = new Set<string>();
    
    misdetections.forEach(m => {
      if (m.misdetection_reason) {
        issues.add(m.misdetection_reason);
      }
    });
    
    return Array.from(issues).slice(0, 5);
  }
  
  /**
   * Start auto-flush timer
   */
  private startAutoFlush() {
    this.flushInterval = setInterval(() => {
      if (this.captureQueue.length > 0) {
        this.flushQueue();
      }
    }, 5000); // Flush every 5 seconds
  }
  
  /**
   * Clean up
   */
  public async cleanup() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flushQueue();
  }
  
  /**
   * Get git commit hash
   */
  private async getGitCommitHash(): Promise<string> {
    try {
      const { execSync } = require('child_process');
      return execSync('git rev-parse HEAD').toString().trim().substring(0, 7);
    } catch {
      return 'unknown';
    }
  }
}

// Type definitions
interface ComparisonReport {
  beforeRunId: number;
  afterRunId: number;
  timestamp: Date;
  trueFalseMisdetections: {
    before: number;
    after: number;
    fixed: number;
  };
  typeMatches: {
    before: number;
    after: number;
  };
  byGradeSubject: Record<string, { before: number; after: number }>;
}

interface AnalysisSummary {
  runId: number;
  runType?: string;
  timestamp?: Date;
  questionTypeFocus?: string;
  statistics: {
    totalQuestions: number;
    trueFalseMisdetections: number;
    typeMismatches: number;
    criticalIssues: number;
  };
  topIssues: string[];
  affectedGrades: string[];
  affectedSubjects: string[];
}