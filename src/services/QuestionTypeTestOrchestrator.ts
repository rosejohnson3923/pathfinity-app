/**
 * Question Type Test Orchestrator
 * 
 * Comprehensive testing framework for ALL 15 question types
 * Test User: Taylor (Grade 10)
 * Subjects: Math, ELA, Science, Social Studies, Algebra 1, Pre-calculus
 */

import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface TestConfiguration {
  studentName: string;
  studentGrade: string;
  subjects: string[];
  questionTypes: string[];
  containerTypes: string[];
}

interface QuestionTypeMapping {
  id: string;
  displayName: string;
  category: string;
  gradeRange: { min: string; max: string };
  suitableSubjects: string[];
  requiredFields: string[];
}

export class QuestionTypeTestOrchestrator {
  private config: TestConfiguration;
  private questionTypes: QuestionTypeMapping[];
  private testRunId: string;

  constructor() {
    // Taylor's test configuration
    this.config = {
      studentName: 'Taylor',
      studentGrade: '10',
      subjects: ['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Pre-calculus'],
      questionTypes: [
        'multiple_choice',
        'true_false',
        'short_answer',
        'fill_blank',
        'matching',
        'sequencing',
        'numeric',
        'counting',
        'drawing',
        'coding',
        'true_false_w_image',
        'true_false_wo_image',
        'visual_pattern',
        'word_problem',
        'creative_writing'
      ],
      containerTypes: ['learn', 'experience', 'discover']
    };

    this.questionTypes = this.getQuestionTypeDefinitions();
    this.testRunId = '';
  }

  private getQuestionTypeDefinitions(): QuestionTypeMapping[] {
    return [
      {
        id: 'multiple_choice',
        displayName: 'Multiple Choice',
        category: 'selection',
        gradeRange: { min: '1', max: '12' },
        suitableSubjects: ['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Pre-calculus'],
        requiredFields: ['question', 'options', 'correctAnswer']
      },
      {
        id: 'true_false',
        displayName: 'True/False',
        category: 'binary',
        gradeRange: { min: '1', max: '12' },
        suitableSubjects: ['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Pre-calculus'],
        requiredFields: ['question', 'correctAnswer']
      },
      {
        id: 'short_answer',
        displayName: 'Short Answer',
        category: 'text',
        gradeRange: { min: '3', max: '12' },
        suitableSubjects: ['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Pre-calculus'],
        requiredFields: ['question', 'correctAnswer']
      },
      {
        id: 'fill_blank',
        displayName: 'Fill in the Blank',
        category: 'completion',
        gradeRange: { min: '2', max: '12' },
        suitableSubjects: ['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Pre-calculus'],
        requiredFields: ['question', 'blanks', 'correctAnswers']
      },
      {
        id: 'matching',
        displayName: 'Matching',
        category: 'association',
        gradeRange: { min: '3', max: '12' },
        suitableSubjects: ['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Pre-calculus'],
        requiredFields: ['question', 'pairs']
      },
      {
        id: 'sequencing',
        displayName: 'Sequencing',
        category: 'ordering',
        gradeRange: { min: '4', max: '12' },
        suitableSubjects: ['Math', 'ELA', 'Science', 'Social Studies'],
        requiredFields: ['question', 'items', 'correctOrder']
      },
      {
        id: 'numeric',
        displayName: 'Numeric',
        category: 'calculation',
        gradeRange: { min: '5', max: '12' },
        suitableSubjects: ['Math', 'Science', 'Algebra 1', 'Pre-calculus'],
        requiredFields: ['question', 'correctAnswer', 'tolerance']
      },
      {
        id: 'counting',
        displayName: 'Counting',
        category: 'visual',
        gradeRange: { min: '1', max: '5' }, // NOT suitable for Grade 10
        suitableSubjects: ['Math'],
        requiredFields: ['question', 'visual', 'correctAnswer']
      },
      {
        id: 'drawing',
        displayName: 'Drawing',
        category: 'creative',
        gradeRange: { min: '1', max: '12' },
        suitableSubjects: ['Math', 'Science'],
        requiredFields: ['question', 'canvas']
      },
      {
        id: 'coding',
        displayName: 'Coding',
        category: 'programming',
        gradeRange: { min: '6', max: '12' },
        suitableSubjects: ['Math', 'Science'],
        requiredFields: ['question', 'starterCode', 'testCases']
      },
      {
        id: 'true_false_w_image',
        displayName: 'True/False with Image',
        category: 'binary',
        gradeRange: { min: '1', max: '12' },
        suitableSubjects: ['Math', 'Science', 'Social Studies'],
        requiredFields: ['question', 'image', 'correctAnswer']
      },
      {
        id: 'true_false_wo_image',
        displayName: 'True/False without Image',
        category: 'binary',
        gradeRange: { min: '1', max: '12' },
        suitableSubjects: ['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Pre-calculus'],
        requiredFields: ['question', 'correctAnswer']
      },
      {
        id: 'visual_pattern',
        displayName: 'Visual Pattern',
        category: 'pattern',
        gradeRange: { min: '3', max: '12' },
        suitableSubjects: ['Math', 'Algebra 1', 'Pre-calculus'],
        requiredFields: ['question', 'pattern', 'correctAnswer']
      },
      {
        id: 'word_problem',
        displayName: 'Word Problem',
        category: 'problem_solving',
        gradeRange: { min: '4', max: '12' },
        suitableSubjects: ['Math', 'Science', 'Algebra 1', 'Pre-calculus'],
        requiredFields: ['question', 'context', 'correctAnswer']
      },
      {
        id: 'creative_writing',
        displayName: 'Creative Writing',
        category: 'open_ended',
        gradeRange: { min: '6', max: '12' },
        suitableSubjects: ['ELA', 'Social Studies'],
        requiredFields: ['question', 'prompt', 'rubric']
      }
    ];
  }

  /**
   * Initialize test run
   */
  async initializeTestRun(): Promise<string> {
    const { data, error } = await supabase
      .from('test_scenarios')
      .insert({
        test_name: `Taylor Grade 10 - All Question Types - ${new Date().toISOString()}`,
        student_name: this.config.studentName,
        grade: this.config.studentGrade,
        subjects: this.config.subjects,
        question_types_to_test: this.config.questionTypes,
        containers_to_test: this.config.containerTypes,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        total_tests: this.config.subjects.length * this.config.questionTypes.length * this.config.containerTypes.length
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to initialize test run:', error);
      throw error;
    }

    this.testRunId = data.id;
    console.log(`Test run initialized: ${this.testRunId}`);
    return this.testRunId;
  }

  /**
   * Determine if a question type is suitable for Grade 10 and subject
   * NOTE: We're testing ALL question types regardless of suitability
   * This method now just tracks what WOULD be suitable
   */
  isQuestionTypeSuitable(questionType: string, subject: string): boolean {
    // For testing purposes, we test EVERYTHING
    // This just helps us track what would normally be suitable
    const qt = this.questionTypes.find(q => q.id === questionType);
    if (!qt) return true; // Test unknown types too

    const grade = parseInt(this.config.studentGrade);
    const minGrade = parseInt(qt.gradeRange.min);
    const maxGrade = parseInt(qt.gradeRange.max);

    // We still track suitability for reporting, but test everything
    const gradeSuitable = grade >= minGrade && grade <= maxGrade;
    const subjectSuitable = qt.suitableSubjects.includes(subject);
    
    return gradeSuitable && subjectSuitable;
  }

  /**
   * Generate test matrix for Taylor
   * Tests ALL question types regardless of suitability
   */
  generateTestMatrix(): Array<{
    subject: string;
    container: string;
    questionType: string;
    suitable: boolean;
    reason?: string;
  }> {
    const matrix = [];

    for (const subject of this.config.subjects) {
      for (const container of this.config.containerTypes) {
        for (const questionType of this.config.questionTypes) {
          const suitable = this.isQuestionTypeSuitable(questionType, subject);
          matrix.push({
            subject,
            container,
            questionType,
            suitable,
            reason: !suitable ? this.getUnsuitableReason(questionType, subject) : undefined
          });
        }
      }
    }

    return matrix;
  }

  private getUnsuitableReason(questionType: string, subject: string): string {
    const qt = this.questionTypes.find(q => q.id === questionType);
    if (!qt) return 'Unknown question type';

    const grade = parseInt(this.config.studentGrade);
    const minGrade = parseInt(qt.gradeRange.min);
    const maxGrade = parseInt(qt.gradeRange.max);

    if (grade < minGrade) {
      return `Grade 10 is above the maximum grade ${qt.gradeRange.max} for ${qt.displayName}`;
    }
    if (grade > maxGrade) {
      return `Grade 10 is below the minimum grade ${qt.gradeRange.min} for ${qt.displayName}`;
    }
    if (!qt.suitableSubjects.includes(subject)) {
      return `${qt.displayName} is not suitable for ${subject}`;
    }
    return 'Unknown reason';
  }

  /**
   * Execute comprehensive test for a specific combination
   */
  async executeTest(subject: string, container: string, questionType: string, skillCode: string): Promise<{
    success: boolean;
    captureId?: string;
    error?: string;
    detectedType?: string;
    validationResult?: any;
  }> {
    try {
      // Step 1: Create AI request
      const aiRequest = {
        grade: this.config.studentGrade,
        subject,
        skillCode,
        container,
        questionType,
        studentName: this.config.studentName
      };

      // Step 2: Capture raw request
      const { data: captureData, error: captureError } = await supabase
        .from('raw_data_captures')
        .insert({
          session_id: this.testRunId,
          requested_grade: this.config.studentGrade,
          requested_subject: subject,
          requested_skill: skillCode,
          requested_container_type: container,
          source_service: 'QuestionTypeTestOrchestrator',
          source_method: 'executeTest',
          raw_request: aiRequest,
          raw_context: {
            expectedQuestionType: questionType,
            testConfiguration: this.config
          }
        })
        .select('id')
        .single();

      if (captureError) {
        console.error('Failed to capture test data:', captureError);
        return { success: false, error: captureError.message };
      }

      // Step 3: Simulate AI response (in production, this would call actual AI service)
      const aiResponse = await this.simulateAIResponse(subject, container, questionType, skillCode);

      // Step 4: Update capture with response
      await supabase
        .from('raw_data_captures')
        .update({
          raw_response: aiResponse,
          processing_time_ms: Math.floor(Math.random() * 1000) + 500
        })
        .eq('id', captureData.id);

      // Step 5: Detect question type from response
      const detectedType = this.detectQuestionType(aiResponse);

      // Step 6: Validate question structure
      const validationResult = await this.validateQuestionStructure(aiResponse, detectedType);

      // Step 7: Record type detection
      await supabase
        .from('type_detection_captures')
        .insert({
          capture_id: captureData.id,
          input_object: aiResponse,
          detection_service: 'QuestionTypeTestOrchestrator',
          detection_method: 'detectQuestionType',
          detected_type: detectedType,
          confidence_score: validationResult.confidence || 0.5
        });

      // Step 8: Check for True/False specific issues
      if (questionType === 'true_false' || detectedType === 'true_false' || detectedType === 'counting') {
        await this.analyzeTrueFalseIssue(captureData.id, aiResponse, questionType, detectedType);
      }

      return {
        success: true,
        captureId: captureData.id,
        detectedType,
        validationResult
      };

    } catch (error) {
      console.error('Test execution failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Detect question type from AI response
   * CRITICAL: Check True/False FIRST before counting
   */
  private detectQuestionType(response: any): string {
    const question = response.question || response.text || '';
    
    // PRIORITY 1: Check for True/False patterns FIRST
    if (question.toLowerCase().includes('true or false') || 
        question.toLowerCase().includes('true/false') ||
        question.toLowerCase().startsWith('is this true') ||
        question.toLowerCase().startsWith('is it true')) {
      return 'true_false';
    }

    // Check for other specific patterns
    if (response.options && Array.isArray(response.options)) {
      return 'multiple_choice';
    }

    if (response.blanks || question.includes('___')) {
      return 'fill_blank';
    }

    if (response.pairs && Array.isArray(response.pairs)) {
      return 'matching';
    }

    if (response.items && response.correctOrder) {
      return 'sequencing';
    }

    // PRIORITY LAST: Check for counting (should be low priority for Grade 10)
    if (response.visual && typeof response.correctAnswer === 'number') {
      return 'counting';
    }

    if (response.starterCode && response.testCases) {
      return 'coding';
    }

    if (response.prompt && response.rubric) {
      return 'creative_writing';
    }

    // Default fallback
    return 'short_answer';
  }

  /**
   * Validate question structure
   */
  private async validateQuestionStructure(question: any, questionType: string): Promise<any> {
    const qt = this.questionTypes.find(q => q.id === questionType);
    if (!qt) {
      return { isValid: false, error: 'Unknown question type' };
    }

    const missingFields = [];
    for (const field of qt.requiredFields) {
      if (!(field in question)) {
        missingFields.push(field);
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
      confidence: missingFields.length === 0 ? 1.0 : 0.5 - (missingFields.length * 0.1)
    };
  }

  /**
   * Analyze True/False detection issues
   */
  private async analyzeTrueFalseIssue(
    captureId: string, 
    response: any, 
    expectedType: string, 
    detectedType: string
  ): Promise<void> {
    const question = response.question || response.text || '';
    const startsWithTrueFalse = question.toLowerCase().startsWith('true or false') || 
                                 question.toLowerCase().startsWith('true/false');

    await supabase
      .from('true_false_analysis')
      .insert({
        capture_id: captureId,
        question_starts_with_true_false: startsWithTrueFalse,
        question_text: question,
        has_visual_field: 'visual' in response,
        visual_content: response.visual ? JSON.stringify(response.visual) : null,
        grade: this.config.studentGrade,
        subject: response.subject,
        initially_detected_as: detectedType,
        finally_rendered_as: expectedType,
        misdetection_reason: detectedType !== expectedType ? 
          `Expected ${expectedType} but detected ${detectedType}` : null,
        correct_answer_field_name: 'correctAnswer',
        correct_answer_type: typeof response.correctAnswer,
        correct_answer_value: String(response.correctAnswer)
      });
  }

  /**
   * Simulate AI response for testing
   */
  private async simulateAIResponse(
    subject: string, 
    container: string, 
    questionType: string, 
    skillCode: string
  ): Promise<any> {
    // Generate appropriate response based on question type
    const baseResponse = {
      subject,
      container,
      skillCode,
      grade: this.config.studentGrade
    };

    switch (questionType) {
      case 'true_false':
      case 'true_false_wo_image':
        return {
          ...baseResponse,
          type: 'true_false',
          question: `True or False: ${this.generateQuestionText(subject, skillCode)}`,
          correctAnswer: Math.random() > 0.5,
          explanation: 'This statement is evaluated based on mathematical principles.'
        };

      case 'true_false_w_image':
        return {
          ...baseResponse,
          type: 'true_false',
          question: `True or False: The diagram shows ${this.generateQuestionText(subject, skillCode)}`,
          image: 'https://example.com/image.png',
          correctAnswer: Math.random() > 0.5,
          explanation: 'Analyze the visual representation to determine the answer.'
        };

      case 'multiple_choice':
        return {
          ...baseResponse,
          type: 'multiple_choice',
          question: this.generateQuestionText(subject, skillCode),
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: Math.floor(Math.random() * 4)
        };

      case 'counting':
        return {
          ...baseResponse,
          type: 'counting',
          question: `Count the number of ${this.generateCountingContext(subject)}`,
          visual: { objects: ['item1', 'item2', 'item3'] },
          correctAnswer: 3
        };

      case 'numeric':
        return {
          ...baseResponse,
          type: 'numeric',
          question: `Calculate: ${this.generateNumericProblem(subject)}`,
          correctAnswer: 42,
          tolerance: 0.01
        };

      case 'word_problem':
        return {
          ...baseResponse,
          type: 'word_problem',
          question: this.generateWordProblem(subject, skillCode),
          context: 'A real-world scenario involving mathematical concepts',
          correctAnswer: '42 units'
        };

      case 'coding':
        return {
          ...baseResponse,
          type: 'coding',
          question: `Write a function to ${this.generateCodingTask(subject)}`,
          starterCode: 'def solve():\n    pass',
          testCases: [
            { input: '5', output: '25' },
            { input: '10', output: '100' }
          ]
        };

      case 'creative_writing':
        return {
          ...baseResponse,
          type: 'creative_writing',
          question: 'Write a short essay about the topic',
          prompt: this.generateWritingPrompt(subject, skillCode),
          rubric: {
            clarity: 25,
            content: 25,
            grammar: 25,
            creativity: 25
          }
        };

      default:
        return {
          ...baseResponse,
          type: 'short_answer',
          question: this.generateQuestionText(subject, skillCode),
          correctAnswer: 'Sample answer for the question'
        };
    }
  }

  private generateQuestionText(subject: string, skillCode: string): string {
    const templates = {
      'Math': `What is the solution to the ${skillCode} problem?`,
      'ELA': `Analyze the literary device in ${skillCode}`,
      'Science': `Explain the scientific concept of ${skillCode}`,
      'Social Studies': `Describe the historical significance of ${skillCode}`,
      'Algebra 1': `Solve for x in the ${skillCode} equation`,
      'Pre-calculus': `Find the limit of the ${skillCode} function`
    };
    return templates[subject] || `Answer the question about ${skillCode}`;
  }

  private generateCountingContext(subject: string): string {
    return subject === 'Math' ? 'geometric shapes' : 'elements';
  }

  private generateNumericProblem(subject: string): string {
    const problems = {
      'Math': '(3x + 5) when x = 12',
      'Algebra 1': 'x² - 5x + 6 when x = 3',
      'Pre-calculus': 'lim(x→0) sin(x)/x',
      'Science': 'force when mass = 10kg and acceleration = 4m/s²'
    };
    return problems[subject] || '7 × 6';
  }

  private generateWordProblem(subject: string, skillCode: string): string {
    return `A train travels at 60 mph for 2 hours, then at 80 mph for 3 hours. What is the total distance traveled? This problem relates to ${skillCode} in ${subject}.`;
  }

  private generateCodingTask(subject: string): string {
    return subject === 'Math' ? 'calculate the factorial of n' : 'process scientific data';
  }

  private generateWritingPrompt(subject: string, skillCode: string): string {
    const prompts = {
      'ELA': `Analyze the theme of ${skillCode} in modern literature`,
      'Social Studies': `Discuss the impact of ${skillCode} on society`
    };
    return prompts[subject] || `Write about ${skillCode}`;
  }

  /**
   * Run complete test suite for Taylor
   */
  async runCompleteSuite(): Promise<void> {
    console.log('Starting comprehensive test suite for Taylor (Grade 10)');
    console.log('=' .repeat(60));

    try {
      // Initialize test run
      await this.initializeTestRun();

      // Generate test matrix
      const matrix = this.generateTestMatrix();
      const suitableTests = matrix.filter(m => m.suitable);
      const unsuitableTests = matrix.filter(m => !m.suitable);

      console.log(`Total test combinations: ${matrix.length}`);
      console.log(`Typically suitable for Grade 10: ${suitableTests.length}`);
      console.log(`Typically NOT suitable for Grade 10: ${unsuitableTests.length}`);
      console.log('-'.repeat(60));

      // Log what would normally be unsuitable (but we're testing anyway!)
      console.log('\nQuestion types we\'re testing that are typically not for Grade 10:');
      const unsuitableByType = new Map<string, Set<string>>();
      for (const test of unsuitableTests) {
        if (!unsuitableByType.has(test.questionType)) {
          unsuitableByType.set(test.questionType, new Set());
        }
        unsuitableByType.get(test.questionType)!.add(test.reason || '');
      }
      
      for (const [type, reasons] of unsuitableByType) {
        console.log(`  - ${type}: ${Array.from(reasons).join(', ')} [WILL TEST ANYWAY]`);
      }

      // Run ALL tests (both suitable and unsuitable)
      console.log('\n' + '='.repeat(60));
      console.log('Running ALL test combinations (suitable + unsuitable)...');
      console.log('Testing EVERY question type to stress test the system!');
      console.log('='.repeat(60));

      let passedTests = 0;
      let failedTests = 0;
      const results = [];

      // Use a sample skill for testing (in production, would iterate through actual skills)
      const sampleSkill = 'MATH_10_ALG_001'; // Sample skill code

      // TEST EVERYTHING - both suitable and unsuitable
      for (const test of matrix) {
        console.log(`\nTesting: ${test.subject} / ${test.container} / ${test.questionType}`);
        if (!test.suitable) {
          console.log(`  📝 Note: This type is typically not for Grade 10 - testing anyway!`);
        }
        
        const result = await this.executeTest(
          test.subject,
          test.container,
          test.questionType,
          sampleSkill
        );

        results.push({
          ...test,
          ...result
        });

        if (result.success) {
          passedTests++;
          console.log(`  ✓ Success - Detected as: ${result.detectedType}`);
          if (result.detectedType !== test.questionType) {
            console.log(`  ⚠ Type mismatch: Expected ${test.questionType}, got ${result.detectedType}`);
            
            // Special attention to critical misdetections
            if (test.questionType === 'true_false' && result.detectedType === 'counting') {
              console.log(`  🚨 CRITICAL: True/False detected as counting!`);
            }
            if (test.questionType === 'counting' && result.detectedType !== 'counting') {
              console.log(`  🔍 Counting question detected as: ${result.detectedType}`);
            }
          }
        } else {
          failedTests++;
          console.log(`  ✗ Failed: ${result.error}`);
        }
      }

      // Update test scenario with results
      await supabase
        .from('test_scenarios')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          passed_tests: passedTests,
          failed_tests: failedTests,
          test_results: results
        })
        .eq('id', this.testRunId);

      // Generate summary
      console.log('\n' + '='.repeat(60));
      console.log('TEST SUITE SUMMARY');
      console.log('='.repeat(60));
      console.log(`Total tests run: ${matrix.length} (ALL question types tested)`);
      console.log(`Passed: ${passedTests}`);
      console.log(`Failed: ${failedTests}`);
      console.log(`Success rate: ${((passedTests / matrix.length) * 100).toFixed(2)}%`);
      console.log('\nBreakdown:');
      console.log(`  Suitable types tested: ${suitableTests.length}`);
      console.log(`  Unsuitable types tested: ${unsuitableTests.length} (for comprehensive testing)`);

      // Check for True/False misdetection
      const trueFalseTests = results.filter(r => 
        r.questionType === 'true_false' || 
        r.questionType === 'true_false_w_image' || 
        r.questionType === 'true_false_wo_image'
      );
      
      const misdetectedTrueFalse = trueFalseTests.filter(r => 
        r.detectedType === 'counting'
      );

      if (misdetectedTrueFalse.length > 0) {
        console.log('\n⚠️  CRITICAL ISSUE DETECTED:');
        console.log(`${misdetectedTrueFalse.length} True/False questions detected as counting!`);
        for (const m of misdetectedTrueFalse) {
          console.log(`  - ${m.subject} / ${m.container}: ${m.questionType} → ${m.detectedType}`);
        }
      }

      console.log('\n' + '='.repeat(60));
      console.log('Test suite complete. Results stored in database.');
      console.log(`Test Run ID: ${this.testRunId}`);

    } catch (error) {
      console.error('Test suite failed:', error);
      
      // Update test scenario as failed
      if (this.testRunId) {
        await supabase
          .from('test_scenarios')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString()
          })
          .eq('id', this.testRunId);
      }
    }
  }

  /**
   * Get test results summary
   */
  async getTestResultsSummary(): Promise<void> {
    const { data: misdetections } = await supabase
      .from('true_false_misdetections')
      .select('*')
      .eq('grade', '10');

    const { data: detectionIssues } = await supabase
      .from('detection_order_issues')
      .select('*')
      .eq('requested_grade', '10');

    console.log('\n' + '='.repeat(60));
    console.log('TRUE/FALSE MISDETECTION ANALYSIS');
    console.log('='.repeat(60));

    if (misdetections && misdetections.length > 0) {
      console.log(`Found ${misdetections.length} True/False misdetections for Grade 10:`);
      for (const m of misdetections) {
        console.log(`\n  Subject: ${m.subject}`);
        console.log(`  Question: ${m.question_text?.substring(0, 50)}...`);
        console.log(`  Detected as: ${m.initially_detected_as}`);
        console.log(`  Reason: ${m.misdetection_reason}`);
      }
    } else {
      console.log('No True/False misdetections found for Grade 10');
    }

    if (detectionIssues && detectionIssues.length > 0) {
      console.log('\n' + '-'.repeat(60));
      console.log('DETECTION ORDER ISSUES:');
      for (const d of detectionIssues) {
        console.log(`  Rule: ${d.detection_rule_used}`);
        console.log(`  Order: ${d.detection_order}`);
        console.log(`  Type: ${d.detected_type}`);
      }
    }
  }
}

// Export for use in other modules
export default QuestionTypeTestOrchestrator;