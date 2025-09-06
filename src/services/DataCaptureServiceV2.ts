import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DetectionEvent {
  question_text: string;
  detected_type: string;
  expected_type?: string;
  grade_level: string;
  subject: string;
  detection_method: string;
  confidence_score?: number;
  is_correct?: boolean;
  metadata?: any;
}

export interface ValidationEvent {
  question_id: string;
  question_type: string;
  user_answer: any;
  correct_answer: any;
  is_correct: boolean;
  grade_level: string;
  subject: string;
  validation_errors?: string[];
  metadata?: any;
}

export interface ContentGenerationEvent {
  student_id: string;
  grade_level: string;
  subject: string;
  skill_id: string;
  container_type: string;
  requested_type?: string;
  generated_type: string;
  generation_time_ms: number;
  ai_model: string;
  content_hash?: string;
  metadata?: any;
}

export class DataCaptureServiceV2 {
  private detectionBuffer: DetectionEvent[] = [];
  private validationBuffer: ValidationEvent[] = [];
  private generationBuffer: ContentGenerationEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private readonly BUFFER_SIZE = 10;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds

  constructor() {
    // Start periodic flush
    this.startPeriodicFlush();
  }

  private startPeriodicFlush() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    this.flushInterval = setInterval(() => {
      this.flushBuffers();
    }, this.FLUSH_INTERVAL);
  }

  async logDetectionEvent(event: DetectionEvent): Promise<void> {
    // Add timestamp
    const eventWithTime = {
      ...event,
      detected_at: new Date().toISOString(),
      session_id: this.getSessionId(),
    };

    this.detectionBuffer.push(eventWithTime);

    // Check if misdetection
    if (event.expected_type && event.expected_type !== event.detected_type) {
      console.warn(`⚠️ Type Misdetection: Expected ${event.expected_type}, got ${event.detected_type}`);
      await this.logMisdetection(eventWithTime);
    }

    // Flush if buffer is full
    if (this.detectionBuffer.length >= this.BUFFER_SIZE) {
      await this.flushDetectionBuffer();
    }
  }

  async logValidationEvent(event: ValidationEvent): Promise<void> {
    const eventWithTime = {
      ...event,
      validated_at: new Date().toISOString(),
      session_id: this.getSessionId(),
    };

    this.validationBuffer.push(eventWithTime);

    // Log to validation table immediately if incorrect
    if (!event.is_correct) {
      await this.logValidationError(eventWithTime);
    }

    if (this.validationBuffer.length >= this.BUFFER_SIZE) {
      await this.flushValidationBuffer();
    }
  }

  async logContentGeneration(event: ContentGenerationEvent): Promise<void> {
    const eventWithTime = {
      ...event,
      generated_at: new Date().toISOString(),
      session_id: this.getSessionId(),
    };

    this.generationBuffer.push(eventWithTime);

    // Store in database immediately for important events
    if (event.requested_type && event.requested_type !== event.generated_type) {
      await this.logGenerationMismatch(eventWithTime);
    }

    if (this.generationBuffer.length >= this.BUFFER_SIZE) {
      await this.flushGenerationBuffer();
    }
  }

  private async logMisdetection(event: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('type_detection_captures')
        .insert({
          analysis_run_id: this.getAnalysisRunId(),
          question_text: event.question_text,
          detected_type: event.detected_type,
          expected_type: event.expected_type,
          is_correct: false,
          confidence_score: event.confidence_score,
          grade_level: event.grade_level,
          subject: event.subject,
          metadata: event.metadata,
        });

      if (error) {
        console.error('Error logging misdetection:', error);
      }
    } catch (err) {
      console.error('Failed to log misdetection:', err);
    }
  }

  private async logValidationError(event: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('question_validation_log')
        .insert({
          question_type: event.question_type,
          validation_result: {
            is_correct: false,
            user_answer: event.user_answer,
            correct_answer: event.correct_answer,
            errors: event.validation_errors,
          },
          metadata: {
            grade_level: event.grade_level,
            subject: event.subject,
            session_id: event.session_id,
          },
          created_at: event.validated_at,
        });

      if (error) {
        console.error('Error logging validation error:', error);
      }
    } catch (err) {
      console.error('Failed to log validation error:', err);
    }
  }

  private async logGenerationMismatch(event: any): Promise<void> {
    try {
      console.warn(`⚠️ Generation Mismatch: Requested ${event.requested_type}, generated ${event.generated_type}`);
      
      // This would log to an appropriate table
      // For now, just console log
    } catch (err) {
      console.error('Failed to log generation mismatch:', err);
    }
  }

  private async flushDetectionBuffer(): Promise<void> {
    if (this.detectionBuffer.length === 0) return;

    const toFlush = [...this.detectionBuffer];
    this.detectionBuffer = [];

    try {
      // Batch insert detection events
      const { error } = await supabase
        .from('type_detection_captures')
        .insert(toFlush.map(event => ({
          analysis_run_id: this.getAnalysisRunId(),
          question_text: event.question_text,
          detected_type: event.detected_type,
          expected_type: event.expected_type,
          is_correct: event.detected_type === event.expected_type,
          confidence_score: event.confidence_score,
          grade_level: event.grade_level,
          subject: event.subject,
          metadata: event.metadata,
        })));

      if (error) {
        console.error('Error flushing detection buffer:', error);
        // Re-add to buffer on error
        this.detectionBuffer.unshift(...toFlush);
      }
    } catch (err) {
      console.error('Failed to flush detection buffer:', err);
      this.detectionBuffer.unshift(...toFlush);
    }
  }

  private async flushValidationBuffer(): Promise<void> {
    if (this.validationBuffer.length === 0) return;

    const toFlush = [...this.validationBuffer];
    this.validationBuffer = [];

    try {
      const { error } = await supabase
        .from('question_validation_log')
        .insert(toFlush.map(event => ({
          question_type: event.question_type,
          validation_result: {
            is_correct: event.is_correct,
            user_answer: event.user_answer,
            correct_answer: event.correct_answer,
            errors: event.validation_errors,
          },
          metadata: {
            grade_level: event.grade_level,
            subject: event.subject,
            session_id: event.session_id,
          },
        })));

      if (error) {
        console.error('Error flushing validation buffer:', error);
        this.validationBuffer.unshift(...toFlush);
      }
    } catch (err) {
      console.error('Failed to flush validation buffer:', err);
      this.validationBuffer.unshift(...toFlush);
    }
  }

  private async flushGenerationBuffer(): Promise<void> {
    if (this.generationBuffer.length === 0) return;

    const toFlush = [...this.generationBuffer];
    this.generationBuffer = [];

    try {
      const { error } = await supabase
        .from('ai_generated_content')
        .insert(toFlush.map(event => ({
          student_id: event.student_id,
          grade_level: event.grade_level,
          subject: event.subject,
          skill_id: event.skill_id,
          container_type: event.container_type,
          question_type: event.generated_type,
          content: {
            requested_type: event.requested_type,
            generation_time_ms: event.generation_time_ms,
            ai_model: event.ai_model,
          },
          metadata: event.metadata,
        })));

      if (error) {
        console.error('Error flushing generation buffer:', error);
        this.generationBuffer.unshift(...toFlush);
      }
    } catch (err) {
      console.error('Failed to flush generation buffer:', err);
      this.generationBuffer.unshift(...toFlush);
    }
  }

  async flushBuffers(): Promise<void> {
    await Promise.all([
      this.flushDetectionBuffer(),
      this.flushValidationBuffer(),
      this.flushGenerationBuffer(),
    ]);
  }

  private getSessionId(): string {
    // Get or create session ID
    let sessionId = sessionStorage.getItem('capture_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('capture_session_id', sessionId);
    }
    return sessionId;
  }

  private getAnalysisRunId(): string {
    // Get or create analysis run ID
    let runId = sessionStorage.getItem('analysis_run_id');
    if (!runId) {
      runId = `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analysis_run_id', runId);
    }
    return runId;
  }

  // Analytics methods
  async getDetectionAccuracy(grade?: string, subject?: string): Promise<number> {
    let query = supabase
      .from('type_detection_captures')
      .select('is_correct');

    if (grade) {
      query = query.eq('grade_level', grade);
    }
    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return 0;
    }

    const correct = data.filter(d => d.is_correct).length;
    return (correct / data.length) * 100;
  }

  async getMisdetectionPatterns(): Promise<any[]> {
    const { data, error } = await supabase
      .from('type_detection_captures')
      .select('*')
      .eq('is_correct', false)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching misdetection patterns:', error);
      return [];
    }

    return data || [];
  }

  async getValidationErrors(questionType?: string): Promise<any[]> {
    let query = supabase
      .from('question_validation_log')
      .select('*')
      .eq('validation_result->is_correct', false);

    if (questionType) {
      query = query.eq('question_type', questionType);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching validation errors:', error);
      return [];
    }

    return data || [];
  }

  // Cleanup
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    // Final flush
    this.flushBuffers();
  }
}

// Export singleton instance
export const dataCaptureServiceV2 = new DataCaptureServiceV2();