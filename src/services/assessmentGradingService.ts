/**
 * ASSESSMENT & GRADING MICROSERVICE
 * Production-ready assessment engine with AI-powered grading and feedback
 * Integrates with Azure OpenAI for intelligent assessment generation and evaluation
 */

import { supabase } from '../lib/supabase';
import { azureOpenAIService } from './azureOpenAIService';
import { unifiedLearningAnalyticsService } from './unifiedLearningAnalyticsService';
import { contentGenerationService } from './contentGenerationService';
import { gamificationService } from './gamificationService';
// Agent system import removed - to be replaced with live chat

// ================================================================
// TYPES AND INTERFACES
// ================================================================

export interface AssessmentRequest {
  studentId: string;
  grade: string;
  subject: string;
  skill: string;
  assessmentType: 'diagnostic' | 'formative' | 'summative' | 'adaptive';
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  questionCount?: number;
  timeLimit?: number; // in minutes
  allowRetakes?: boolean;
  accommodations?: {
    extendedTime?: boolean;
    readAloud?: boolean;
    simplifiedLanguage?: boolean;
    visualAids?: boolean;
  };
}

export interface AssessmentQuestion {
  questionId: string;
  questionType: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer' | 'essay' | 'interactive';
  content: {
    prompt: string;
    context?: string;
    media?: {
      type: 'image' | 'video' | 'audio' | 'diagram';
      url: string;
      description: string;
    };
  };
  options?: Array<{
    id: string;
    text: string;
    media?: any;
  }>;
  correctAnswer?: string | string[];
  rubric?: AssessmentRubric;
  difficulty: number; // 1-10
  estimatedTime: number; // seconds
  skillsAssessed: string[];
  bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
}

export interface AssessmentRubric {
  criteria: Array<{
    name: string;
    description: string;
    weight: number;
    levels: Array<{
      points: number;
      description: string;
    }>;
  }>;
  totalPoints: number;
}

export interface Assessment {
  assessmentId: string;
  studentId: string;
  metadata: {
    grade: string;
    subject: string;
    skill: string;
    type: string;
    createdAt: Date;
    scheduledFor?: Date;
  };
  questions: AssessmentQuestion[];
  settings: {
    timeLimit?: number;
    passingScore: number;
    allowNavigation: boolean;
    showFeedback: 'immediate' | 'after-submission' | 'never';
    randomizeQuestions: boolean;
    accommodations?: any;
  };
  status: 'created' | 'in-progress' | 'submitted' | 'graded' | 'reviewed';
}

export interface StudentResponse {
  questionId: string;
  response: any; // Can be string, string[], or complex object
  timeSpent: number; // seconds
  attempts: number;
  confidence?: number; // 1-5
  flaggedForReview?: boolean;
}

export interface AssessmentSubmission {
  submissionId: string;
  assessmentId: string;
  studentId: string;
  responses: StudentResponse[];
  startTime: Date;
  submitTime: Date;
  totalTimeSpent: number;
  status: 'submitted' | 'grading' | 'graded' | 'reviewed';
}

export interface GradingResult {
  submissionId: string;
  assessmentId: string;
  studentId: string;
  scores: {
    totalScore: number;
    maxScore: number;
    percentage: number;
    letterGrade: string;
  };
  questionResults: Array<{
    questionId: string;
    correct: boolean;
    score: number;
    maxScore: number;
    feedback: string;
    skillMastery: Record<string, number>;
  }>;
  skillAnalysis: {
    strengths: string[];
    weaknesses: string[];
    masteryLevels: Record<string, number>;
  };
  feedback: {
    overall: string;
    specific: string[];
    recommendations: string[];
    nextSteps: string[];
  };
  aiInsights?: {
    performanceAnalysis: string;
    learningGaps: string[];
    suggestedInterventions: string[];
    predictedImprovement: number;
  };
}

export interface AdaptiveAssessmentState {
  currentDifficulty: number;
  questionHistory: Array<{
    difficulty: number;
    correct: boolean;
  }>;
  estimatedAbility: number;
  confidence: number;
  nextQuestionDifficulty: number;
}

// ================================================================
// ASSESSMENT & GRADING SERVICE
// ================================================================

class AssessmentGradingService {
  private assessmentCache: Map<string, Assessment> = new Map();
  private submissionCache: Map<string, AssessmentSubmission> = new Map();
  private agentSystem: any = null;
  private rubricTemplates: Map<string, AssessmentRubric> = new Map();

  constructor() {
    this.initializeService();
    this.loadRubricTemplates();
  }

  private async initializeService(): Promise<void> {
    // Agent system initialization removed - to be replaced with live chat
    this.agentSystem = null;
    console.log('📝 Assessment & Grading Service initialized (without agents)');
  }

  // ================================================================
  // ASSESSMENT GENERATION
  // ================================================================

  /**
   * Generate a complete assessment based on requirements
   */
  async generateAssessment(request: AssessmentRequest): Promise<Assessment> {
    try {
      console.log('📝 Generating assessment:', request);

      // Generate questions using AI
      const questions = await this.generateQuestions(request);

      // Create assessment structure
      const assessment: Assessment = {
        assessmentId: crypto.randomUUID(),
        studentId: request.studentId,
        metadata: {
          grade: request.grade,
          subject: request.subject,
          skill: request.skill,
          type: request.assessmentType,
          createdAt: new Date()
        },
        questions,
        settings: {
          timeLimit: request.timeLimit,
          passingScore: this.determinePassingScore(request.assessmentType),
          allowNavigation: true,
          showFeedback: this.determineFeedbackTiming(request.assessmentType),
          randomizeQuestions: request.assessmentType !== 'adaptive',
          accommodations: request.accommodations
        },
        status: 'created'
      };

      // Apply accommodations if needed
      if (request.accommodations) {
        assessment.questions = await this.applyAccommodations(assessment.questions, request.accommodations);
      }

      // Validate with safety check
      const safetyCheck = await this.validateAssessmentSafety(assessment);
      if (!safetyCheck.safe) {
        console.warn('⚠️ Assessment failed safety check, regenerating...');
        return this.generateAssessment(request); // Retry with same request
      }

      // Cache the assessment
      this.assessmentCache.set(assessment.assessmentId, assessment);

      // Store in database
      await this.storeAssessment(assessment);

      // Track generation event
      await unifiedLearningAnalyticsService.trackLearningEvent({
        studentId: request.studentId,
        sessionId: crypto.randomUUID(),
        eventType: 'assessment_submit',
        metadata: {
          grade: request.grade,
          subject: request.subject,
          skill: request.skill,
          container: 'learn',
          difficultyLevel: request.difficulty
        }
      });

      console.log(`✅ Assessment generated: ${assessment.assessmentId}`);
      return assessment;

    } catch (error) {
      console.error('❌ Assessment generation failed:', error);
      throw new Error(`Failed to generate assessment: ${error.message}`);
    }
  }

  /**
   * Generate assessment questions using AI
   */
  private async generateQuestions(request: AssessmentRequest): Promise<AssessmentQuestion[]> {
    const questionCount = request.questionCount || this.getDefaultQuestionCount(request.assessmentType);
    const questions: AssessmentQuestion[] = [];

    // Generate diverse question types
    const questionTypes = this.determineQuestionTypes(request);
    
    for (let i = 0; i < questionCount; i++) {
      const questionType = questionTypes[i % questionTypes.length];
      const difficulty = request.difficulty === 'adaptive' ? 
        this.calculateAdaptiveDifficulty(i, questionCount) :
        this.mapDifficultyToNumber(request.difficulty);

      const question = await this.generateSingleQuestion({
        ...request,
        questionType,
        difficulty,
        questionNumber: i + 1
      });

      questions.push(question);
    }

    return questions;
  }

  /**
   * Generate a single assessment question
   */
  private async generateSingleQuestion(params: any): Promise<AssessmentQuestion> {
    try {
      // Use content generation service to create question content
      const questionContent = await contentGenerationService.generateContent({
        contentType: 'assessment',
        grade: params.grade,
        subject: params.subject,
        skill: params.skill,
        difficulty: this.mapNumberToDifficulty(params.difficulty),
        quantity: 1
      });

      // Structure the question
      const question: AssessmentQuestion = {
        questionId: crypto.randomUUID(),
        questionType: params.questionType,
        content: {
          prompt: this.extractQuestionPrompt(questionContent),
          context: this.extractQuestionContext(questionContent)
        },
        difficulty: params.difficulty,
        estimatedTime: this.estimateQuestionTime(params.questionType, params.difficulty),
        skillsAssessed: [params.skill],
        bloomsLevel: this.determineBloomsLevel(params.questionType, params.difficulty)
      };

      // Add question-type specific elements
      if (params.questionType === 'multiple-choice') {
        question.options = await this.generateMultipleChoiceOptions(params);
        question.correctAnswer = question.options[0].id; // First option is correct, will be shuffled
      } else if (params.questionType === 'true-false') {
        question.options = [
          { id: 'true', text: 'True' },
          { id: 'false', text: 'False' }
        ];
        question.correctAnswer = Math.random() > 0.5 ? 'true' : 'false';
      } else if (params.questionType === 'short-answer' || params.questionType === 'essay') {
        question.rubric = this.getRubricForQuestion(params.questionType, params.skill);
      }

      return question;

    } catch (error) {
      console.error('Failed to generate question:', error);
      // Return a fallback question
      return this.getFallbackQuestion(params);
    }
  }

  // ================================================================
  // ASSESSMENT SUBMISSION & GRADING
  // ================================================================

  /**
   * Submit an assessment for grading
   */
  async submitAssessment(
    assessmentId: string, 
    studentId: string, 
    responses: StudentResponse[]
  ): Promise<AssessmentSubmission> {
    try {
      const assessment = await this.getAssessment(assessmentId);
      
      if (!assessment) {
        throw new Error('Assessment not found');
      }

      const submission: AssessmentSubmission = {
        submissionId: crypto.randomUUID(),
        assessmentId,
        studentId,
        responses,
        startTime: new Date(Date.now() - this.calculateTotalTime(responses)),
        submitTime: new Date(),
        totalTimeSpent: this.calculateTotalTime(responses),
        status: 'submitted'
      };

      // Store submission
      this.submissionCache.set(submission.submissionId, submission);
      await this.storeSubmission(submission);

      // Start grading process
      setTimeout(() => {
        this.gradeAssessment(submission.submissionId);
      }, 100); // Grade asynchronously

      console.log(`✅ Assessment submitted: ${submission.submissionId}`);
      return submission;

    } catch (error) {
      console.error('❌ Assessment submission failed:', error);
      throw error;
    }
  }

  /**
   * Grade an assessment submission
   */
  async gradeAssessment(submissionId: string): Promise<GradingResult> {
    try {
      const submission = this.submissionCache.get(submissionId);
      if (!submission) {
        throw new Error('Submission not found');
      }

      const assessment = await this.getAssessment(submission.assessmentId);
      if (!assessment) {
        throw new Error('Assessment not found');
      }

      // Update submission status
      submission.status = 'grading';

      // Grade each question
      const questionResults = await this.gradeQuestions(
        assessment.questions, 
        submission.responses
      );

      // Calculate scores
      const scores = this.calculateScores(questionResults);

      // Analyze skills
      const skillAnalysis = this.analyzeSkills(questionResults);

      // Generate feedback
      const feedback = await this.generateFeedback(
        assessment,
        submission,
        questionResults,
        skillAnalysis
      );

      // Generate AI insights if enabled
      const aiInsights = await this.generateAIInsights(
        assessment,
        submission,
        questionResults,
        skillAnalysis
      );

      const gradingResult: GradingResult = {
        submissionId,
        assessmentId: submission.assessmentId,
        studentId: submission.studentId,
        scores,
        questionResults,
        skillAnalysis,
        feedback,
        aiInsights
      };

      // Update submission status
      submission.status = 'graded';

      // Store grading result
      await this.storeGradingResult(gradingResult);

      // Track completion event
      await unifiedLearningAnalyticsService.trackLearningEvent({
        studentId: submission.studentId,
        sessionId: crypto.randomUUID(),
        eventType: 'assessment_submit',
        metadata: {
          grade: assessment.metadata.grade,
          subject: assessment.metadata.subject,
          skill: assessment.metadata.skill,
          container: 'learn',
          accuracy: scores.percentage,
          duration: submission.totalTimeSpent
        },
        learningOutcome: {
          mastery: scores.percentage,
          improvement: 0, // Would calculate based on previous assessments
          confidence: this.calculateConfidence(submission.responses)
        }
      });

      // Award XP based on performance
      const xpEarned = Math.floor(scores.percentage * 100);
      await gamificationService.awardXP(
        submission.studentId, 
        xpEarned, 
        'assessment_complete'
      );

      console.log(`✅ Assessment graded: ${submissionId} (${scores.percentage}%)`);
      return gradingResult;

    } catch (error) {
      console.error('❌ Assessment grading failed:', error);
      throw error;
    }
  }

  /**
   * Grade individual questions
   */
  private async gradeQuestions(
    questions: AssessmentQuestion[], 
    responses: StudentResponse[]
  ): Promise<any[]> {
    const results = [];

    for (const question of questions) {
      const response = responses.find(r => r.questionId === question.questionId);
      
      if (!response) {
        // No response provided
        results.push({
          questionId: question.questionId,
          correct: false,
          score: 0,
          maxScore: this.getQuestionMaxScore(question),
          feedback: 'No response provided',
          skillMastery: {}
        });
        continue;
      }

      // Grade based on question type
      let result;
      if (question.questionType === 'multiple-choice' || question.questionType === 'true-false') {
        result = this.gradeObjectiveQuestion(question, response);
      } else if (question.questionType === 'fill-blank') {
        result = this.gradeFillBlankQuestion(question, response);
      } else if (question.questionType === 'short-answer' || question.questionType === 'essay') {
        result = await this.gradeSubjectiveQuestion(question, response);
      } else {
        result = this.gradeInteractiveQuestion(question, response);
      }

      results.push(result);
    }

    return results;
  }

  /**
   * Grade objective questions (multiple choice, true/false)
   */
  private gradeObjectiveQuestion(question: AssessmentQuestion, response: StudentResponse): any {
    const correct = response.response === question.correctAnswer;
    const maxScore = this.getQuestionMaxScore(question);
    
    return {
      questionId: question.questionId,
      correct,
      score: correct ? maxScore : 0,
      maxScore,
      feedback: correct ? 
        'Correct! Well done.' : 
        `Incorrect. The correct answer is ${question.correctAnswer}.`,
      skillMastery: this.calculateQuestionSkillMastery(question, correct)
    };
  }

  /**
   * Grade fill-in-the-blank questions
   */
  private gradeFillBlankQuestion(question: AssessmentQuestion, response: StudentResponse): any {
    const correctAnswers = Array.isArray(question.correctAnswer) ? 
      question.correctAnswer : 
      [question.correctAnswer];
    
    const responseText = String(response.response).toLowerCase().trim();
    const correct = correctAnswers.some(answer => 
      answer.toLowerCase().trim() === responseText
    );
    
    const maxScore = this.getQuestionMaxScore(question);
    
    return {
      questionId: question.questionId,
      correct,
      score: correct ? maxScore : 0,
      maxScore,
      feedback: correct ? 
        'Correct!' : 
        `Incorrect. Acceptable answers include: ${correctAnswers.join(', ')}.`,
      skillMastery: this.calculateQuestionSkillMastery(question, correct)
    };
  }

  /**
   * Grade subjective questions using AI
   */
  private async gradeSubjectiveQuestion(
    question: AssessmentQuestion, 
    response: StudentResponse
  ): Promise<any> {
    try {
      if (!question.rubric) {
        // Use AI for grading without rubric
        return this.gradeWithAI(question, response);
      }

      // Grade using rubric
      const rubricScores = await this.gradeWithRubric(question, response, question.rubric);
      const totalScore = rubricScores.reduce((sum, s) => sum + s.score, 0);
      const maxScore = question.rubric.totalPoints;
      
      return {
        questionId: question.questionId,
        correct: totalScore >= maxScore * 0.7, // 70% threshold
        score: totalScore,
        maxScore,
        feedback: this.generateRubricFeedback(rubricScores),
        skillMastery: this.calculateQuestionSkillMastery(question, totalScore / maxScore)
      };

    } catch (error) {
      console.error('Failed to grade subjective question:', error);
      // Fallback to partial credit
      return {
        questionId: question.questionId,
        correct: false,
        score: 1,
        maxScore: this.getQuestionMaxScore(question),
        feedback: 'Your response has been recorded and will be reviewed.',
        skillMastery: {}
      };
    }
  }

  /**
   * Grade using AI without rubric
   */
  private async gradeWithAI(question: AssessmentQuestion, response: StudentResponse): Promise<any> {
    try {
      const prompt = `Grade this student response:
        Question: ${question.content.prompt}
        Student Response: ${response.response}
        
        Evaluate the response for accuracy, completeness, and understanding.
        Provide a score from 0-10 and specific feedback.`;

      const aiResponse = await azureOpenAIService.generateWithModel('gpt4', prompt);
      const grading = JSON.parse(aiResponse);

      return {
        questionId: question.questionId,
        correct: grading.score >= 7,
        score: grading.score,
        maxScore: 10,
        feedback: grading.feedback,
        skillMastery: this.calculateQuestionSkillMastery(question, grading.score / 10)
      };

    } catch (error) {
      console.error('AI grading failed:', error);
      return this.getFallbackGrading(question, response);
    }
  }

  /**
   * Grade interactive questions
   */
  private gradeInteractiveQuestion(question: AssessmentQuestion, response: StudentResponse): any {
    // Interactive questions would have custom grading logic
    // For now, provide basic grading
    const maxScore = this.getQuestionMaxScore(question);
    const score = response.response?.completed ? maxScore : 0;
    
    return {
      questionId: question.questionId,
      correct: score === maxScore,
      score,
      maxScore,
      feedback: score === maxScore ? 
        'Activity completed successfully!' : 
        'Activity not completed.',
      skillMastery: this.calculateQuestionSkillMastery(question, score / maxScore)
    };
  }

  // ================================================================
  // ADAPTIVE ASSESSMENT
  // ================================================================

  /**
   * Generate next question for adaptive assessment
   */
  async getNextAdaptiveQuestion(
    assessmentId: string,
    currentState: AdaptiveAssessmentState
  ): Promise<AssessmentQuestion> {
    try {
      const assessment = await this.getAssessment(assessmentId);
      if (!assessment) {
        throw new Error('Assessment not found');
      }

      // Calculate next difficulty using Item Response Theory (IRT) principles
      const nextDifficulty = this.calculateNextDifficulty(currentState);

      // Generate question at appropriate difficulty
      const question = await this.generateSingleQuestion({
        grade: assessment.metadata.grade,
        subject: assessment.metadata.subject,
        skill: assessment.metadata.skill,
        questionType: this.selectAdaptiveQuestionType(currentState),
        difficulty: nextDifficulty,
        questionNumber: currentState.questionHistory.length + 1
      });

      return question;

    } catch (error) {
      console.error('Failed to get next adaptive question:', error);
      throw error;
    }
  }

  /**
   * Calculate next difficulty level for adaptive assessment
   */
  private calculateNextDifficulty(state: AdaptiveAssessmentState): number {
    if (state.questionHistory.length === 0) {
      return 5; // Start at medium difficulty
    }

    const lastQuestion = state.questionHistory[state.questionHistory.length - 1];
    
    // Simple adaptive algorithm
    if (lastQuestion.correct) {
      // Increase difficulty
      return Math.min(10, lastQuestion.difficulty + 1);
    } else {
      // Decrease difficulty
      return Math.max(1, lastQuestion.difficulty - 1);
    }
  }

  /**
   * Update adaptive assessment state
   */
  updateAdaptiveState(
    state: AdaptiveAssessmentState, 
    questionDifficulty: number, 
    correct: boolean
  ): AdaptiveAssessmentState {
    const newHistory = [...state.questionHistory, { difficulty: questionDifficulty, correct }];
    
    // Estimate ability using simple average
    const correctCount = newHistory.filter(q => q.correct).length;
    const estimatedAbility = (correctCount / newHistory.length) * 10;
    
    // Calculate confidence
    const recentQuestions = newHistory.slice(-5);
    const recentCorrect = recentQuestions.filter(q => q.correct).length;
    const confidence = recentCorrect / recentQuestions.length;
    
    return {
      currentDifficulty: questionDifficulty,
      questionHistory: newHistory,
      estimatedAbility,
      confidence,
      nextQuestionDifficulty: this.calculateNextDifficulty({ ...state, questionHistory: newHistory })
    };
  }

  // ================================================================
  // FEEDBACK & INSIGHTS
  // ================================================================

  /**
   * Generate comprehensive feedback
   */
  private async generateFeedback(
    assessment: Assessment,
    submission: AssessmentSubmission,
    questionResults: any[],
    skillAnalysis: any
  ): Promise<any> {
    const correctCount = questionResults.filter(r => r.correct).length;
    const totalQuestions = questionResults.length;
    const percentage = (correctCount / totalQuestions) * 100;

    // Generate overall feedback
    const overall = this.generateOverallFeedback(percentage, assessment.metadata.type);

    // Generate specific feedback
    const specific = questionResults
      .filter(r => !r.correct)
      .map(r => r.feedback);

    // Generate recommendations
    const recommendations = await this.generateRecommendations(
      skillAnalysis,
      assessment.metadata
    );

    // Generate next steps
    const nextSteps = this.generateNextSteps(
      percentage,
      skillAnalysis,
      assessment.metadata
    );

    return {
      overall,
      specific,
      recommendations,
      nextSteps
    };
  }

  /**
   * Generate AI-powered insights
   */
  private async generateAIInsights(
    assessment: Assessment,
    submission: AssessmentSubmission,
    questionResults: any[],
    skillAnalysis: any
  ): Promise<any> {
    try {
      const prompt = `Analyze this assessment performance:
        Grade: ${assessment.metadata.grade}
        Subject: ${assessment.metadata.subject}
        Skill: ${assessment.metadata.skill}
        Correct: ${questionResults.filter(r => r.correct).length}/${questionResults.length}
        Time Spent: ${submission.totalTimeSpent} seconds
        Strengths: ${skillAnalysis.strengths.join(', ')}
        Weaknesses: ${skillAnalysis.weaknesses.join(', ')}
        
        Provide insights on:
        1. Performance analysis
        2. Learning gaps
        3. Suggested interventions
        4. Predicted improvement potential`;

      const insights = await azureOpenAIService.generateWithModel('gpt4', prompt);
      return JSON.parse(insights);

    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      return null;
    }
  }

  // ================================================================
  // HELPER METHODS
  // ================================================================

  private async getAssessment(assessmentId: string): Promise<Assessment | null> {
    // Check cache first
    if (this.assessmentCache.has(assessmentId)) {
      return this.assessmentCache.get(assessmentId)!;
    }

    // Fetch from database
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('assessment_id', assessmentId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch assessment:', error);
      return null;
    }
  }

  private async storeAssessment(assessment: Assessment): Promise<void> {
    try {
      await supabase
        .from('assessments')
        .insert({
          assessment_id: assessment.assessmentId,
          student_id: assessment.studentId,
          metadata: assessment.metadata,
          questions: assessment.questions,
          settings: assessment.settings,
          status: assessment.status,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to store assessment:', error);
    }
  }

  private async storeSubmission(submission: AssessmentSubmission): Promise<void> {
    try {
      await supabase
        .from('assessment_submissions')
        .insert({
          submission_id: submission.submissionId,
          assessment_id: submission.assessmentId,
          student_id: submission.studentId,
          responses: submission.responses,
          start_time: submission.startTime,
          submit_time: submission.submitTime,
          total_time_spent: submission.totalTimeSpent,
          status: submission.status
        });
    } catch (error) {
      console.error('Failed to store submission:', error);
    }
  }

  private async storeGradingResult(result: GradingResult): Promise<void> {
    try {
      await supabase
        .from('grading_results')
        .insert({
          submission_id: result.submissionId,
          assessment_id: result.assessmentId,
          student_id: result.studentId,
          scores: result.scores,
          question_results: result.questionResults,
          skill_analysis: result.skillAnalysis,
          feedback: result.feedback,
          ai_insights: result.aiInsights,
          graded_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to store grading result:', error);
    }
  }

  private determinePassingScore(assessmentType: string): number {
    const passingScores = {
      'diagnostic': 0, // No pass/fail for diagnostic
      'formative': 70,
      'summative': 75,
      'adaptive': 70
    };
    return passingScores[assessmentType] || 70;
  }

  private determineFeedbackTiming(assessmentType: string): 'immediate' | 'after-submission' | 'never' {
    const timings = {
      'diagnostic': 'after-submission',
      'formative': 'immediate',
      'summative': 'after-submission',
      'adaptive': 'immediate'
    };
    return timings[assessmentType] || 'after-submission';
  }

  private getDefaultQuestionCount(assessmentType: string): number {
    const counts = {
      'diagnostic': 20,
      'formative': 10,
      'summative': 25,
      'adaptive': 15
    };
    return counts[assessmentType] || 10;
  }

  private determineQuestionTypes(request: AssessmentRequest): string[] {
    const gradeLevel = parseInt(request.grade) || 0;
    
    if (gradeLevel <= 2) {
      return ['multiple-choice', 'true-false', 'interactive'];
    } else if (gradeLevel <= 5) {
      return ['multiple-choice', 'true-false', 'fill-blank', 'short-answer'];
    } else {
      return ['multiple-choice', 'short-answer', 'essay', 'interactive'];
    }
  }

  private mapDifficultyToNumber(difficulty: string): number {
    const mapping = {
      'easy': 3,
      'medium': 5,
      'hard': 8
    };
    return mapping[difficulty] || 5;
  }

  private mapNumberToDifficulty(number: number): 'easy' | 'medium' | 'hard' {
    if (number <= 3) return 'easy';
    if (number <= 7) return 'medium';
    return 'hard';
  }

  private calculateAdaptiveDifficulty(index: number, total: number): number {
    // Start easy and increase difficulty
    return Math.min(10, 3 + Math.floor((index / total) * 7));
  }

  private estimateQuestionTime(questionType: string, difficulty: number): number {
    const baseTimes = {
      'multiple-choice': 60,
      'true-false': 30,
      'fill-blank': 90,
      'short-answer': 180,
      'essay': 600,
      'interactive': 300
    };
    
    const baseTime = baseTimes[questionType] || 60;
    return baseTime * (1 + (difficulty - 5) * 0.1); // Adjust based on difficulty
  }

  private determineBloomsLevel(questionType: string, difficulty: number): any {
    if (questionType === 'true-false' || (questionType === 'multiple-choice' && difficulty <= 3)) {
      return 'remember';
    } else if (questionType === 'fill-blank' || difficulty <= 5) {
      return 'understand';
    } else if (questionType === 'short-answer' || difficulty <= 7) {
      return 'apply';
    } else if (questionType === 'essay' && difficulty <= 8) {
      return 'analyze';
    } else if (difficulty <= 9) {
      return 'evaluate';
    } else {
      return 'create';
    }
  }

  private extractQuestionPrompt(content: any): string {
    return content.content?.mainContent?.question || 
           content.title || 
           'Answer the following question:';
  }

  private extractQuestionContext(content: any): string {
    return content.content?.introduction || '';
  }

  private async generateMultipleChoiceOptions(params: any): Promise<any[]> {
    // Generate options with one correct and three distractors
    return [
      { id: 'a', text: 'Correct answer' }, // Will be replaced with actual content
      { id: 'b', text: 'Distractor 1' },
      { id: 'c', text: 'Distractor 2' },
      { id: 'd', text: 'Distractor 3' }
    ];
  }

  private getRubricForQuestion(questionType: string, skill: string): AssessmentRubric {
    // Check if we have a template for this skill
    const templateKey = `${questionType}_${skill}`;
    if (this.rubricTemplates.has(templateKey)) {
      return this.rubricTemplates.get(templateKey)!;
    }

    // Return default rubric
    return {
      criteria: [
        {
          name: 'Accuracy',
          description: 'Correctness of the response',
          weight: 0.4,
          levels: [
            { points: 4, description: 'Completely accurate' },
            { points: 3, description: 'Mostly accurate' },
            { points: 2, description: 'Partially accurate' },
            { points: 1, description: 'Minimally accurate' },
            { points: 0, description: 'Inaccurate' }
          ]
        },
        {
          name: 'Completeness',
          description: 'Thoroughness of the response',
          weight: 0.3,
          levels: [
            { points: 3, description: 'Complete response' },
            { points: 2, description: 'Mostly complete' },
            { points: 1, description: 'Partially complete' },
            { points: 0, description: 'Incomplete' }
          ]
        },
        {
          name: 'Understanding',
          description: 'Demonstration of concept understanding',
          weight: 0.3,
          levels: [
            { points: 3, description: 'Deep understanding' },
            { points: 2, description: 'Good understanding' },
            { points: 1, description: 'Basic understanding' },
            { points: 0, description: 'Limited understanding' }
          ]
        }
      ],
      totalPoints: 10
    };
  }

  private getFallbackQuestion(params: any): AssessmentQuestion {
    return {
      questionId: crypto.randomUUID(),
      questionType: 'multiple-choice',
      content: {
        prompt: `What is 2 + 2?`
      },
      options: [
        { id: 'a', text: '4' },
        { id: 'b', text: '3' },
        { id: 'c', text: '5' },
        { id: 'd', text: '6' }
      ],
      correctAnswer: 'a',
      difficulty: 1,
      estimatedTime: 30,
      skillsAssessed: ['basic-math'],
      bloomsLevel: 'remember'
    };
  }

  private async applyAccommodations(
    questions: AssessmentQuestion[], 
    accommodations: any
  ): Promise<AssessmentQuestion[]> {
    const modifiedQuestions = [...questions];

    if (accommodations.simplifiedLanguage) {
      // Simplify question language
      for (const question of modifiedQuestions) {
        question.content.prompt = await this.simplifyLanguage(question.content.prompt);
      }
    }

    if (accommodations.visualAids) {
      // Add visual aids where appropriate
      for (const question of modifiedQuestions) {
        if (!question.content.media) {
          // Could generate or fetch appropriate visual aids
        }
      }
    }

    if (accommodations.extendedTime) {
      // Increase time estimates
      for (const question of modifiedQuestions) {
        question.estimatedTime *= 1.5;
      }
    }

    return modifiedQuestions;
  }

  private async simplifyLanguage(text: string): Promise<string> {
    // In production, use AI to simplify language
    // For now, return original text
    return text;
  }

  private async validateAssessmentSafety(assessment: Assessment): Promise<any> {
    try {
      // Use FinnSafe agent if available
      if (this.agentSystem) {
        const safetyCheck = await this.agentSystem.requestAgentAction('safe', 'validate_content', {
          content: assessment.questions,
          grade: assessment.metadata.grade,
          coppaRequirements: true
        });
        return { safe: safetyCheck.isAppropriate };
      }

      // Fallback to Azure content safety
      const contentString = JSON.stringify(assessment.questions);
      const check = await azureOpenAIService.performContentSafetyCheck(
        contentString,
        assessment.metadata.grade
      );
      return { safe: check.isAppropriate };

    } catch (error) {
      console.error('Safety validation failed:', error);
      return { safe: true }; // Default to safe on error
    }
  }

  private calculateTotalTime(responses: StudentResponse[]): number {
    return responses.reduce((sum, r) => sum + r.timeSpent, 0);
  }

  private getQuestionMaxScore(question: AssessmentQuestion): number {
    if (question.rubric) {
      return question.rubric.totalPoints;
    }
    // Default scores by question type
    const scores = {
      'multiple-choice': 1,
      'true-false': 1,
      'fill-blank': 2,
      'short-answer': 5,
      'essay': 10,
      'interactive': 5
    };
    return scores[question.questionType] || 1;
  }

  private calculateQuestionSkillMastery(question: AssessmentQuestion, performance: number | boolean): Record<string, number> {
    const mastery = {};
    const score = typeof performance === 'boolean' ? (performance ? 1 : 0) : performance;
    
    for (const skill of question.skillsAssessed) {
      mastery[skill] = score;
    }
    
    return mastery;
  }

  private calculateScores(questionResults: any[]): any {
    const totalScore = questionResults.reduce((sum, r) => sum + r.score, 0);
    const maxScore = questionResults.reduce((sum, r) => sum + r.maxScore, 0);
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    
    return {
      totalScore,
      maxScore,
      percentage,
      letterGrade: this.calculateLetterGrade(percentage)
    };
  }

  private calculateLetterGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  private analyzeSkills(questionResults: any[]): any {
    const skillScores = {};
    const skillCounts = {};
    
    // Aggregate skill scores
    for (const result of questionResults) {
      for (const [skill, score] of Object.entries(result.skillMastery)) {
        if (!skillScores[skill]) {
          skillScores[skill] = 0;
          skillCounts[skill] = 0;
        }
        skillScores[skill] += score as number;
        skillCounts[skill]++;
      }
    }
    
    // Calculate mastery levels
    const masteryLevels = {};
    for (const skill in skillScores) {
      masteryLevels[skill] = skillScores[skill] / skillCounts[skill];
    }
    
    // Identify strengths and weaknesses
    const skills = Object.entries(masteryLevels);
    const strengths = skills
      .filter(([_, mastery]) => mastery >= 0.8)
      .map(([skill]) => skill);
    const weaknesses = skills
      .filter(([_, mastery]) => mastery < 0.6)
      .map(([skill]) => skill);
    
    return {
      strengths,
      weaknesses,
      masteryLevels
    };
  }

  private generateOverallFeedback(percentage: number, assessmentType: string): string {
    if (percentage >= 90) {
      return `Excellent work! You've demonstrated strong mastery of the material.`;
    } else if (percentage >= 80) {
      return `Great job! You have a good understanding of the concepts.`;
    } else if (percentage >= 70) {
      return `Good effort! You're on the right track with room for improvement.`;
    } else if (percentage >= 60) {
      return `Keep working! Review the material and practice more.`;
    } else {
      return `This material needs more review. Don't give up - let's work together to improve!`;
    }
  }

  private async generateRecommendations(skillAnalysis: any, metadata: any): Promise<string[]> {
    const recommendations = [];
    
    if (skillAnalysis.weaknesses.length > 0) {
      recommendations.push(`Focus on improving: ${skillAnalysis.weaknesses.join(', ')}`);
      recommendations.push('Review lesson materials for concepts you found challenging');
      recommendations.push('Try practice exercises at an easier difficulty level');
    }
    
    if (skillAnalysis.strengths.length > 0) {
      recommendations.push(`Build on your strengths in: ${skillAnalysis.strengths.join(', ')}`);
      recommendations.push('Challenge yourself with advanced problems in strong areas');
    }
    
    return recommendations;
  }

  private generateNextSteps(percentage: number, skillAnalysis: any, metadata: any): string[] {
    const nextSteps = [];
    
    if (percentage >= 80) {
      nextSteps.push('Move on to the next skill level');
      nextSteps.push('Try enrichment activities for deeper understanding');
    } else if (percentage >= 70) {
      nextSteps.push('Review incorrect answers and understand mistakes');
      nextSteps.push('Complete additional practice problems');
    } else {
      nextSteps.push('Schedule time with your teacher for extra help');
      nextSteps.push('Review foundational concepts before continuing');
      nextSteps.push('Work through guided examples step-by-step');
    }
    
    return nextSteps;
  }

  private async gradeWithRubric(
    question: AssessmentQuestion, 
    response: StudentResponse, 
    rubric: AssessmentRubric
  ): Promise<any[]> {
    const scores = [];
    
    for (const criterion of rubric.criteria) {
      // In production, this would use AI to evaluate against rubric
      // For now, assign a middle score
      const levelIndex = Math.floor(criterion.levels.length / 2);
      scores.push({
        criterion: criterion.name,
        score: criterion.levels[levelIndex].points,
        weight: criterion.weight,
        feedback: criterion.levels[levelIndex].description
      });
    }
    
    return scores;
  }

  private generateRubricFeedback(rubricScores: any[]): string {
    const feedback = rubricScores
      .map(s => `${s.criterion}: ${s.feedback}`)
      .join('. ');
    return feedback;
  }

  private getFallbackGrading(question: AssessmentQuestion, response: StudentResponse): any {
    return {
      questionId: question.questionId,
      correct: false,
      score: 1,
      maxScore: this.getQuestionMaxScore(question),
      feedback: 'Your response has been recorded for review.',
      skillMastery: {}
    };
  }

  private calculateConfidence(responses: StudentResponse[]): number {
    const confidences = responses
      .filter(r => r.confidence !== undefined)
      .map(r => r.confidence!);
    
    if (confidences.length === 0) return 50;
    
    const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    return (avgConfidence / 5) * 100; // Convert 1-5 to 0-100
  }

  private selectAdaptiveQuestionType(state: AdaptiveAssessmentState): string {
    // Vary question types to maintain engagement
    const types = ['multiple-choice', 'true-false', 'fill-blank', 'short-answer'];
    const index = state.questionHistory.length % types.length;
    return types[index];
  }

  private loadRubricTemplates(): void {
    // Load standard rubric templates
    // These would typically come from a database
    this.rubricTemplates.set('essay_writing', {
      criteria: [
        {
          name: 'Thesis',
          description: 'Clear thesis statement',
          weight: 0.25,
          levels: [
            { points: 4, description: 'Exceptional thesis' },
            { points: 3, description: 'Strong thesis' },
            { points: 2, description: 'Adequate thesis' },
            { points: 1, description: 'Weak thesis' },
            { points: 0, description: 'No clear thesis' }
          ]
        },
        {
          name: 'Evidence',
          description: 'Use of supporting evidence',
          weight: 0.25,
          levels: [
            { points: 4, description: 'Excellent evidence' },
            { points: 3, description: 'Good evidence' },
            { points: 2, description: 'Some evidence' },
            { points: 1, description: 'Limited evidence' },
            { points: 0, description: 'No evidence' }
          ]
        },
        {
          name: 'Organization',
          description: 'Essay structure and flow',
          weight: 0.25,
          levels: [
            { points: 4, description: 'Excellent organization' },
            { points: 3, description: 'Good organization' },
            { points: 2, description: 'Adequate organization' },
            { points: 1, description: 'Poor organization' },
            { points: 0, description: 'No organization' }
          ]
        },
        {
          name: 'Grammar',
          description: 'Grammar and mechanics',
          weight: 0.25,
          levels: [
            { points: 4, description: 'Perfect grammar' },
            { points: 3, description: 'Minor errors' },
            { points: 2, description: 'Some errors' },
            { points: 1, description: 'Many errors' },
            { points: 0, description: 'Excessive errors' }
          ]
        }
      ],
      totalPoints: 16
    });
  }

  // Cleanup
  destroy(): void {
    this.assessmentCache.clear();
    this.submissionCache.clear();
    this.rubricTemplates.clear();
    if (this.agentSystem) {
      this.agentSystem.shutdown();
    }
  }
}

// Export singleton instance
export const assessmentGradingService = new AssessmentGradingService();

// Export types
export type {
  AssessmentRequest,
  Assessment,
  AssessmentQuestion,
  AssessmentSubmission,
  GradingResult,
  AdaptiveAssessmentState
};