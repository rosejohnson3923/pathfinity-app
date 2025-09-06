/**
 * DataCaptureService - Captures raw data at every stage for analysis
 * Focus: Understanding why true_false questions are detected as counting
 */

interface CaptureData {
  table: string;
  data: any;
  timestamp: Date;
}

interface StageCaptures {
  stage1_ai_request: any;
  stage2_ai_response: any;
  stage3_type_detected: string | null;
  stage4_converted: any;
  stage5_rendered: any;
  stage6_validation_input: any;
  stage7_validation_result: any;
}

export class DataCaptureService {
  private static instance: DataCaptureService;
  private captureQueue: CaptureData[] = [];
  private currentSessionId: string;
  private currentCaptureId: number | null = null;
  private currentAnalysisRunId: number | null = null;
  private interceptors: Map<string, Function[]> = new Map();
  private stageCaptures: StageCaptures = this.resetStageCaptures();
  
  // Flag to enable/disable capturing
  private captureEnabled: boolean = false;
  
  private constructor() {
    this.currentSessionId = `session-${Date.now()}`;
    this.setupAutoFlush();
  }

  public static getInstance(): DataCaptureService {
    if (!DataCaptureService.instance) {
      DataCaptureService.instance = new DataCaptureService();
    }
    return DataCaptureService.instance;
  }

  /**
   * Enable or disable data capture
   */
  public setCapturing(enabled: boolean) {
    this.captureEnabled = enabled;
    if (enabled) {
      console.log('📊 Data capture ENABLED - Recording all true_false detection events');
    } else {
      console.log('📊 Data capture DISABLED');
    }
  }

  /**
   * Start a new analysis run
   */
  public async startAnalysisRun(
    runType: 'before_fix' | 'after_fix',
    questionTypeFocus: string,
    fixDescription?: string
  ): Promise<number> {
    const response = await fetch('/api/analysis-runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        run_type: runType,
        question_type_focus: questionTypeFocus,
        fix_description: fixDescription,
        git_commit_hash: await this.getGitCommitHash()
      })
    });
    
    const result = await response.json();
    this.currentAnalysisRunId = result.id;
    console.log(`🏃 Started analysis run #${result.id} for ${questionTypeFocus} (${runType})`);
    return result.id;
  }

  /**
   * Capture raw AI request/response
   */
  public captureAIInteraction(
    service: string,
    method: string,
    request: any,
    response: any,
    context?: any
  ): number | null {
    if (!this.captureEnabled) return null;

    const capture = {
      analysis_run_id: this.currentAnalysisRunId,
      session_id: this.currentSessionId,
      source_service: service,
      source_method: method,
      raw_request: request,
      raw_response: response,
      raw_context: context,
      
      // Extract key fields for easier querying
      requested_grade: request?.student?.grade_level || request?.grade,
      requested_subject: request?.subject,
      requested_skill: request?.skill?.skill_name || request?.skill?.name,
      requested_container_type: request?.containerType,
      requested_career: request?.career?.name || request?.career,
      requested_character: request?.character || request?.selectedCharacter,
      
      capture_timestamp: new Date()
    };

    this.queueCapture('raw_data_captures', capture);
    
    // Store for stage tracking
    this.stageCaptures.stage1_ai_request = request;
    this.stageCaptures.stage2_ai_response = response;
    
    // Analyze if this is a true_false that might be misdetected
    this.analyzeTrueFalseResponse(response, capture);
    
    return this.currentCaptureId;
  }

  /**
   * Capture type detection event - CRITICAL for true_false issue
   */
  public captureTypeDetection(
    input: any,
    detectedType: string,
    service: string,
    method: string,
    ruleUsed?: string,
    detectionOrder?: number
  ) {
    if (!this.captureEnabled) return;

    const inputText = typeof input === 'string' ? input : 
                      input?.question || input?.content || '';
    
    const capture = {
      capture_id: this.currentCaptureId,
      input_text: inputText,
      input_object: typeof input === 'object' ? input : null,
      detection_service: service,
      detection_method: method,
      detection_order: detectionOrder,
      detected_type: detectedType,
      detection_rule_used: ruleUsed,
      timestamp: new Date()
    };

    this.queueCapture('type_detection_captures', capture);
    
    // Store for stage tracking
    this.stageCaptures.stage3_type_detected = detectedType;
    
    // Check if this is a true_false being detected as something else
    if (inputText.toLowerCase().includes('true or false') && detectedType !== 'true_false') {
      console.warn(`⚠️ TRUE_FALSE MISDETECTION: "${inputText.substring(0, 50)}..." detected as ${detectedType}`);
      this.captureTrueFalseMisdetection(input, detectedType, service);
    }
  }

  /**
   * Capture question after conversion
   */
  public captureConvertedQuestion(
    originalQuestion: any,
    convertedQuestion: any,
    converterService: string
  ) {
    if (!this.captureEnabled) return;

    this.stageCaptures.stage4_converted = convertedQuestion;
    
    // Check if type changed during conversion
    if (originalQuestion?.type !== convertedQuestion?.type) {
      console.warn(`🔄 Type changed during conversion: ${originalQuestion?.type} → ${convertedQuestion?.type}`);
    }
  }

  /**
   * Capture what the renderer receives
   */
  public captureRendererInput(question: any, rendererComponent: string) {
    if (!this.captureEnabled) return;

    this.stageCaptures.stage5_rendered = {
      question,
      renderer: rendererComponent,
      timestamp: new Date()
    };
  }

  /**
   * Capture validation input/output
   */
  public captureValidation(
    question: any,
    userAnswer: any,
    validationResult: any,
    validator: string
  ) {
    if (!this.captureEnabled) return;

    this.stageCaptures.stage6_validation_input = {
      question,
      userAnswer
    };
    
    this.stageCaptures.stage7_validation_result = {
      ...validationResult,
      validator
    };
    
    // Save complete stage analysis
    this.saveStageAnalysis();
  }

  /**
   * Analyze true_false specific issues
   */
  private analyzeTrueFalseResponse(response: any, captureInfo: any) {
    // Check all questions in the response
    const questions = [
      ...(response?.practice || []),
      ...(response?.assessment ? [response.assessment] : []),
      ...(response?.questions || [])
    ];
    
    questions.forEach((question, index) => {
      const questionText = question?.question || question?.content || '';
      const startsWithTrueFalse = questionText.match(/^true or false:?/i);
      
      if (startsWithTrueFalse) {
        const analysis = {
          capture_id: this.currentCaptureId,
          question_starts_with_true_false: true,
          question_text: questionText,
          has_visual_field: 'visual' in question,
          visual_content: question?.visual,
          grade: captureInfo.requested_grade,
          subject: captureInfo.requested_subject,
          initially_detected_as: question?.type,
          correct_answer_field_name: 'correct_answer' in question ? 'correct_answer' : 
                                     'correctAnswer' in question ? 'correctAnswer' : null,
          correct_answer_type: typeof (question?.correct_answer || question?.correctAnswer),
          correct_answer_value: String(question?.correct_answer || question?.correctAnswer || '')
        };
        
        this.queueCapture('true_false_analysis', analysis);
        
        if (question?.type !== 'true_false') {
          console.log(`🔍 Found True/False question marked as ${question?.type}:`);
          console.log(`   Question: "${questionText.substring(0, 60)}..."`);
          console.log(`   Grade: ${captureInfo.requested_grade}, Subject: ${captureInfo.requested_subject}`);
        }
      }
    });
  }

  /**
   * Capture specific true_false misdetection
   */
  private captureTrueFalseMisdetection(
    input: any,
    detectedAs: string,
    service: string
  ) {
    const misdetection = {
      capture_id: this.currentCaptureId,
      question_text: input?.question || input?.content || input,
      initially_detected_as: detectedAs,
      misdetection_reason: this.inferMisdetectionReason(input, detectedAs),
      detection_service_path: [service],
      timestamp: new Date()
    };
    
    this.queueCapture('true_false_analysis', misdetection);
  }

  /**
   * Infer why a true_false was misdetected
   */
  private inferMisdetectionReason(input: any, detectedAs: string): string {
    const reasons = [];
    
    if (detectedAs === 'counting') {
      if (input?.visual) {
        reasons.push('Has visual field (counting detection triggered)');
      }
      if (input?.question?.includes('count')) {
        reasons.push('Contains word "count" in question');
      }
      const grade = input?.grade || input?.grade_level;
      if (grade && ['K', '1', '2'].includes(grade)) {
        reasons.push(`Grade ${grade} triggers counting detection`);
      }
      if (input?.subject === 'Math') {
        reasons.push('Math subject triggers counting detection');
      }
    }
    
    return reasons.join('; ') || 'Unknown reason';
  }

  /**
   * Save complete stage analysis
   */
  private saveStageAnalysis() {
    if (!this.captureEnabled) return;
    
    const analysis = {
      analysis_run_id: this.currentAnalysisRunId,
      capture_id: this.currentCaptureId,
      ...this.stageCaptures,
      
      // Detect issues
      type_mismatch: this.detectTypeMismatch(),
      field_missing: this.detectMissingFields(),
      unexpected_transformation: this.detectUnexpectedTransformation()
    };
    
    this.queueCapture('question_type_analysis', analysis);
    
    // Reset for next question
    this.stageCaptures = this.resetStageCaptures();
  }

  private detectTypeMismatch(): boolean {
    const types = [
      this.stageCaptures.stage2_ai_response?.type,
      this.stageCaptures.stage3_type_detected,
      this.stageCaptures.stage4_converted?.type,
      this.stageCaptures.stage5_rendered?.question?.type
    ].filter(t => t);
    
    return new Set(types).size > 1;
  }

  private detectMissingFields(): string[] {
    const missing = [];
    const question = this.stageCaptures.stage2_ai_response;
    
    if (!question) return ['no_question'];
    
    if (!('type' in question)) missing.push('type');
    if (!('question' in question) && !('content' in question)) missing.push('question_or_content');
    if (!('correct_answer' in question) && !('correctAnswer' in question)) missing.push('correct_answer');
    
    return missing;
  }

  private detectUnexpectedTransformation(): string | null {
    const original = this.stageCaptures.stage2_ai_response;
    const converted = this.stageCaptures.stage4_converted;
    
    if (!original || !converted) return null;
    
    if (original.type !== converted.type) {
      return `Type changed: ${original.type} → ${converted.type}`;
    }
    
    if (original.question !== converted.content && original.content !== converted.content) {
      return 'Question text transformed';
    }
    
    return null;
  }

  private resetStageCaptures(): StageCaptures {
    return {
      stage1_ai_request: null,
      stage2_ai_response: null,
      stage3_type_detected: null,
      stage4_converted: null,
      stage5_rendered: null,
      stage6_validation_input: null,
      stage7_validation_result: null
    };
  }

  /**
   * Queue capture for batch sending
   */
  private queueCapture(table: string, data: any) {
    this.captureQueue.push({
      table,
      data,
      timestamp: new Date()
    });
    
    // Auto-flush if queue is large
    if (this.captureQueue.length >= 10) {
      this.flushQueue();
    }
  }

  /**
   * Flush queued captures to database
   */
  public async flushQueue() {
    if (this.captureQueue.length === 0) return;
    
    const batch = [...this.captureQueue];
    this.captureQueue = [];
    
    try {
      const response = await fetch('/api/data-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batch)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send captures: ${response.statusText}`);
      }
      
      console.log(`📤 Flushed ${batch.length} captures to database`);
    } catch (error) {
      console.error('Failed to send capture data:', error);
      // Re-queue on failure
      this.captureQueue = [...batch, ...this.captureQueue];
    }
  }

  /**
   * Setup auto-flush timer
   */
  private setupAutoFlush() {
    setInterval(() => {
      if (this.captureQueue.length > 0) {
        this.flushQueue();
      }
    }, 5000); // Flush every 5 seconds
  }

  /**
   * Get git commit hash for tracking
   */
  private async getGitCommitHash(): Promise<string> {
    try {
      const response = await fetch('/api/git-status');
      const data = await response.json();
      return data.commitHash || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Export captured data for analysis
   */
  public async exportCaptures(analysisRunId: number): Promise<any> {
    const response = await fetch(`/api/analysis-runs/${analysisRunId}/export`);
    return response.json();
  }
}