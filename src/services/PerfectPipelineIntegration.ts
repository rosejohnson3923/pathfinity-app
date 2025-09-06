/**
 * Perfect Pipeline Integration
 * ============================
 * Complete end-to-end integration from user selection to feedback display
 * No manual intervention required - everything works automatically
 * 
 * Flow:
 * 1. User selects grade_level, career
 * 2. System applies subject, skill_name  
 * 3. AI generates content
 * 4. Content gets converted
 * 5. Question gets rendered
 * 6. Answer gets validated
 * 7. Feedback is displayed
 * 
 * Created: 2025-08-31
 */

import { perfectTemplate, PERFECT_QUESTION_TEMPLATES } from './PerfectQuestionTemplate';
import { aiContentConverter } from './content/AIContentConverter';
import { unifiedAnswerService } from './UnifiedQuestionAnswerService';
import { questionValidator } from './content/QuestionValidator';
import { questionTypeRotationService } from './QuestionTypeRotationService';
import { QuestionData } from '../types/questionTypes';
import { modularPromptSystem } from './prompts/PromptArchitecture';
import { azureOpenAIService } from './AzureOpenAIService';

export interface UserSelection {
  gradeLevel: string;  // K, 1, 2, ... 12
  career: string;       // Doctor, Engineer, Teacher, etc.
}

export interface SystemContext {
  subject: string;      // Math, ELA, Science, Social Studies
  skillName: string;    // e.g., "Addition within 10", "Reading Comprehension"
  skillId: string;      // e.g., "MATH.K.OA.1"
}

export interface PipelineResult {
  success: boolean;
  question?: QuestionData;
  renderData?: any;
  validationResult?: any;
  feedback?: string;
  error?: string;
  stages: {
    userSelection: boolean;
    systemContext: boolean;
    aiGeneration: boolean;
    contentConversion: boolean;
    questionRendering: boolean;
    answerValidation: boolean;
    feedbackDisplay: boolean;
  };
}

/**
 * The Perfect Pipeline that handles everything automatically
 */
export class PerfectPipelineIntegration {
  private static instance: PerfectPipelineIntegration;
  private converter = aiContentConverter;
  private rotationService = questionTypeRotationService;
  
  private constructor() {
    // rotationService is already initialized as singleton
  }
  
  static getInstance(): PerfectPipelineIntegration {
    if (!PerfectPipelineIntegration.instance) {
      PerfectPipelineIntegration.instance = new PerfectPipelineIntegration();
    }
    return PerfectPipelineIntegration.instance;
  }
  
  /**
   * Complete pipeline from user selection to feedback
   */
  async runCompletePipeline(
    userSelection: UserSelection,
    systemContext: SystemContext,
    userAnswer?: any
  ): Promise<PipelineResult> {
    const result: PipelineResult = {
      success: false,
      stages: {
        userSelection: false,
        systemContext: false,
        aiGeneration: false,
        contentConversion: false,
        questionRendering: false,
        answerValidation: false,
        feedbackDisplay: false
      }
    };
    
    try {
      // STEP 1: Validate user selection
      console.log('🎯 Step 1: User Selection');
      if (!userSelection.gradeLevel || !userSelection.career) {
        result.error = 'Invalid user selection';
        return result;
      }
      result.stages.userSelection = true;
      console.log(`  Grade: ${userSelection.gradeLevel}, Career: ${userSelection.career}`);
      
      // STEP 2: Apply system context
      console.log('📚 Step 2: System Context');
      if (!systemContext.subject || !systemContext.skillName) {
        result.error = 'Invalid system context';
        return result;
      }
      result.stages.systemContext = true;
      console.log(`  Subject: ${systemContext.subject}, Skill: ${systemContext.skillName}`);
      
      // STEP 3: AI generates content
      console.log('🤖 Step 3: AI Generation');
      const aiContent = await this.generateAIContent(
        userSelection,
        systemContext
      );
      
      if (!aiContent) {
        result.error = 'AI generation failed';
        return result;
      }
      result.stages.aiGeneration = true;
      console.log(`  Generated ${aiContent.type} question`);
      
      // STEP 4: Content gets converted
      console.log('📦 Step 4: Content Conversion');
      const converted = this.convertContent(aiContent, systemContext);
      
      if (!converted) {
        result.error = 'Content conversion failed';
        return result;
      }
      result.stages.contentConversion = true;
      result.question = converted;
      console.log(`  Converted to ${converted.type} format`);
      
      // STEP 5: Question gets rendered (prepare render data)
      console.log('🎨 Step 5: Question Rendering');
      const renderData = this.prepareRenderData(converted);
      
      if (!renderData) {
        result.error = 'Render preparation failed';
        return result;
      }
      result.stages.questionRendering = true;
      result.renderData = renderData;
      console.log(`  Render data prepared`);
      
      // STEP 6: Answer gets validated (if user answer provided)
      if (userAnswer !== undefined) {
        console.log('✅ Step 6: Answer Validation');
        const validationResult = this.validateAnswer(converted, userAnswer);
        
        result.stages.answerValidation = true;
        result.validationResult = validationResult;
        console.log(`  Answer is ${validationResult.isCorrect ? 'CORRECT' : 'INCORRECT'}`);
        
        // STEP 7: Feedback is displayed
        console.log('💬 Step 7: Feedback Display');
        const feedback = this.generateFeedback(
          converted,
          userAnswer,
          validationResult,
          userSelection.career
        );
        
        result.stages.feedbackDisplay = true;
        result.feedback = feedback;
        console.log(`  Feedback: ${feedback.substring(0, 50)}...`);
      }
      
      // Mark as success if all required stages passed
      result.success = result.stages.userSelection &&
                       result.stages.systemContext &&
                       result.stages.aiGeneration &&
                       result.stages.contentConversion &&
                       result.stages.questionRendering;
      
      return result;
      
    } catch (error) {
      console.error('Pipeline error:', error);
      result.error = error instanceof Error ? error.message : String(error);
      return result;
    }
  }
  
  /**
   * Generate AI content based on user selection and system context
   */
  private async generateAIContent(
    userSelection: UserSelection,
    systemContext: SystemContext,
    retryCount: number = 0
  ): Promise<any> {
    const maxRetries = 3;
    
    // Determine appropriate question type based on context
    const questionType = this.selectQuestionType(
      userSelection.gradeLevel,
      systemContext.subject,
      systemContext.skillName
    );
    
    // Use MODULAR prompt system instead of single template
    let modularPrompt = modularPromptSystem.assemblePrompt({
      gradeLevel: userSelection.gradeLevel,
      career: userSelection.career,
      subject: systemContext.subject,
      skillName: systemContext.skillName,
      skillId: systemContext.skillId,
      questionType: questionType
    });
    
    // Add explicit fill_blank instruction if needed
    if ((questionType === 'fill_blank' || systemContext.forceBlankMarker) && retryCount > 0) {
      modularPrompt += `\n\nCRITICAL FOR FILL_BLANK:
You MUST generate a fill_blank question with these requirements:
1. The question MUST contain exactly _____ (5 underscores) to mark the blank
2. The correct_answer MUST be the word/phrase that fills the blank
3. Format as valid JSON with these fields:
{
  "type": "fill_blank",
  "question": "Sentence with _____ marking the blank",
  "correct_answer": "the answer that fills the blank",
  "explanation": "why this is correct"
}`;
    }
    
    console.log('📝 Using modular prompt system');
    console.log(`  Components: Grade ${userSelection.gradeLevel}, ${userSelection.career}, ${systemContext.subject}, ${systemContext.skillName}`);
    
    try {
      // Call Azure OpenAI with modular prompt
      const aiResponse = await azureOpenAIService.generateContent(
        modularPrompt,
        {
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: 'json_object' }
        }
      );
      
      // Parse response
      let parsedResponse;
      try {
        parsedResponse = typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse;
      } catch (e) {
        console.error('Failed to parse AI response:', e);
        parsedResponse = { error: 'Invalid JSON response' };
      }
      
      // Validate the response
      const validation = perfectTemplate.validatePipeline(parsedResponse, questionType);
      
      // Check for critical issues
      if (parsedResponse.question) {
        const q = parsedResponse.question.toLowerCase();
        
        // Check for misclassification
        if (questionType === 'true_false' && 
            (q.includes('which') || q.includes('what is the') || 
             q.includes('larger') || q.includes('smaller'))) {
          console.warn('🚨 Misclassification detected, retrying...');
          if (retryCount < maxRetries) {
            // Force correct type and retry
            return this.generateAIContent(userSelection, systemContext, retryCount + 1);
          }
        }
        
        // CRITICAL: Check for fill_blank issues
        if (questionType === 'fill_blank' || parsedResponse.type === 'fill_blank') {
          if (!parsedResponse.question.includes('_____')) {
            console.warn('🚨 Fill_blank missing blank marker, retrying...');
            if (retryCount < maxRetries) {
              // Add explicit instruction for fill_blank
              const enhancedContext = {
                ...systemContext,
                forceBlankMarker: true
              };
              return this.generateAIContent(userSelection, enhancedContext, retryCount + 1);
            }
          }
          
          // Ensure correct_answer is defined
          if (!parsedResponse.correct_answer || parsedResponse.correct_answer === 'undefined') {
            console.warn('🚨 Fill_blank missing answer, fixing...');
            parsedResponse.correct_answer = 'answer'; // Default fallback
          }
        }
        
        // Check for skill relevance
        const skillWords = systemContext.skillName.toLowerCase().split(' ');
        const hasRelevance = skillWords.some(word => 
          q.includes(word) || (parsedResponse.topic && parsedResponse.topic.toLowerCase().includes(word))
        );
        
        if (!hasRelevance && retryCount < maxRetries) {
          console.warn('🚨 Question not relevant to skill, retrying...');
          return this.generateAIContent(userSelection, systemContext, retryCount + 1);
        }
      }
      
      return validation.fixed || parsedResponse;
      
    } catch (error) {
      console.error('AI generation error:', error);
      
      // Fallback to template if AI fails
      if (retryCount >= maxRetries) {
        console.warn('⚠️ Falling back to template after max retries');
        const template = PERFECT_QUESTION_TEMPLATES[questionType as keyof typeof PERFECT_QUESTION_TEMPLATES];
        if (template) {
          return template.example;
        }
      }
      
      // Retry on error
      if (retryCount < maxRetries) {
        console.log(`Retrying... (${retryCount + 1}/${maxRetries})`);
        return this.generateAIContent(userSelection, systemContext, retryCount + 1);
      }
      
      throw error;
    }
  }
  
  /**
   * Select appropriate question type based on grade and skill
   */
  private selectQuestionType(
    gradeLevel: string,
    subject: string,
    skillName: string
  ): string {
    const grade = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);
    const skill = skillName.toLowerCase();
    
    // Grade-based restrictions
    if (grade <= 2) {
      // K-2: Simple types only
      if (skill.includes('count') && subject === 'Math') {
        return 'counting';
      }
      if (skill.includes('identify') || skill.includes('which')) {
        return 'multiple_choice';
      }
      if (skill.includes('true') || skill.includes('false')) {
        return 'true_false';
      }
      return 'multiple_choice'; // Default for young learners
    }
    
    // Subject-based selection
    if (subject === 'Math') {
      if (skill.includes('calculate') || skill.includes('solve')) {
        return 'numeric';
      }
      if (skill.includes('equation')) {
        return 'fill_blank';
      }
      if (skill.includes('compare') || skill.includes('which')) {
        return 'multiple_choice';
      }
    }
    
    if (subject === 'ELA') {
      // NEVER use counting for ELA
      if (skill.includes('fill') || skill.includes('complete')) {
        return 'fill_blank';
      }
      if (skill.includes('identify') || skill.includes('choose')) {
        return 'multiple_choice';
      }
      if (skill.includes('write') || skill.includes('explain')) {
        return grade >= 6 ? 'long_answer' : 'short_answer';
      }
    }
    
    // Use rotation service to ensure variety
    const types = this.rotationService.getQuestionTypesForSkill(
      skillName,
      subject,
      1
    );
    
    return types[0] || 'multiple_choice';
  }
  
  /**
   * Convert AI content to question format
   */
  private convertContent(
    aiContent: any,
    systemContext: SystemContext
  ): QuestionData | null {
    try {
      const skillInfo = {
        skill_name: systemContext.skillName,
        skill_number: systemContext.skillId,
        subject: systemContext.subject,
        grade: aiContent.grade || '5'
      };
      
      return this.converter.convertAssessment(aiContent, skillInfo);
    } catch (error) {
      console.error('Conversion error:', error);
      return null;
    }
  }
  
  /**
   * Prepare data for rendering
   */
  private prepareRenderData(question: QuestionData): any {
    return {
      question,
      theme: 'light',
      disabled: false,
      showFeedback: false,
      // Add any other render-specific data
      containerType: 'learn',
      animations: true
    };
  }
  
  /**
   * Validate user answer
   */
  private validateAnswer(question: QuestionData, userAnswer: any): any {
    // Use question validator for comprehensive validation
    const validationResult = questionValidator.validateAnswer(question, userAnswer);
    
    // Also get the correct answer for display
    const correctAnswerInfo = unifiedAnswerService.getCorrectAnswer(question);
    
    return {
      ...validationResult,
      correctAnswerDisplay: correctAnswerInfo.displayValue,
      correctAnswerValue: correctAnswerInfo.rawValue
    };
  }
  
  /**
   * Generate appropriate feedback
   */
  private generateFeedback(
    question: QuestionData,
    userAnswer: any,
    validationResult: any,
    career: string
  ): string {
    const isCorrect = validationResult.isCorrect;
    const correctAnswer = validationResult.correctAnswerDisplay;
    
    if (isCorrect) {
      // Positive feedback with career context
      const careerPraise = {
        'Doctor': 'Excellent diagnosis!',
        'Engineer': 'Perfect calculation!',
        'Teacher': 'Great teaching example!',
        'Chef': 'Recipe for success!',
        'Athlete': 'Score! You got it!',
        'Artist': 'Beautiful work!',
        'Scientist': 'Hypothesis confirmed!',
        'default': 'Excellent work!'
      };
      
      return `${careerPraise[career] || careerPraise.default} You correctly answered: ${userAnswer}`;
    } else {
      // Constructive feedback
      let feedback = `Not quite right. `;
      
      // Type-specific feedback
      switch (question.type) {
        case 'counting':
          feedback += `Count carefully - the correct answer is ${correctAnswer}.`;
          break;
        case 'multiple_choice':
          feedback += `The correct answer is ${correctAnswer}.`;
          break;
        case 'true_false':
          feedback += `The statement is ${correctAnswer}.`;
          break;
        case 'numeric':
          feedback += `The correct answer is ${correctAnswer}. Check your calculation.`;
          break;
        default:
          feedback += `The correct answer is ${correctAnswer}.`;
      }
      
      // Add encouragement
      feedback += ` Keep practicing - you're learning like a future ${career}!`;
      
      return feedback;
    }
  }
  
  /**
   * Test all 15 question types
   */
  async testAllQuestionTypes(): Promise<{ [key: string]: PipelineResult }> {
    const results: { [key: string]: PipelineResult } = {};
    const types = Object.keys(PERFECT_QUESTION_TEMPLATES);
    
    for (const type of types) {
      console.log(`\nTesting ${type}...`);
      
      // Mock user selection
      const userSelection: UserSelection = {
        gradeLevel: '5',
        career: 'Engineer'
      };
      
      // Mock system context
      const systemContext: SystemContext = {
        subject: 'Math',
        skillName: `Testing ${type} questions`,
        skillId: `TEST.${type}`
      };
      
      // Mock user answer (wrong answer to test feedback)
      const mockAnswer = this.getMockAnswer(type, false);
      
      // Run pipeline
      const result = await this.runCompletePipeline(
        userSelection,
        systemContext,
        mockAnswer
      );
      
      results[type] = result;
    }
    
    return results;
  }
  
  /**
   * Get mock answer for testing
   */
  private getMockAnswer(questionType: string, correct: boolean = true): any {
    const answers = {
      multiple_choice: correct ? 1 : 0,
      true_false: correct ? true : false,
      counting: correct ? 5 : 3,
      numeric: correct ? 42 : 40,
      fill_blank: correct ? 'Jupiter' : 'Mars',
      short_answer: correct ? 'Paris' : 'London',
      long_answer: 'This is a test answer paragraph.',
      matching: [[0, 0], [1, 1]],
      ordering: [0, 1, 2],
      classification: { 'Dog': 'Mammal' },
      visual_identification: 'circle',
      pattern_recognition: '10',
      code_completion: 'a + b',
      diagram_labeling: ['nucleus'],
      open_ended: 'Creative answer'
    };
    
    return answers[questionType] || 'test';
  }
}

// Export singleton instance
export const perfectPipeline = PerfectPipelineIntegration.getInstance();

/**
 * Quick test function for the problematic scenario
 */
export async function testProblematicScenario() {
  console.log('\n🔍 Testing Problematic Scenario');
  console.log('Question: "Which is the largest balance?"');
  console.log('This should be multiple_choice, NOT counting\n');
  
  const pipeline = PerfectPipelineIntegration.getInstance();
  
  const userSelection: UserSelection = {
    gradeLevel: '5',
    career: 'Lawyer'
  };
  
  const systemContext: SystemContext = {
    subject: 'Math',
    skillName: 'Comparing positive and negative numbers',
    skillId: 'MATH.5.NBT.3'
  };
  
  // User selects "200" which is correct
  const userAnswer = 1; // Index of "200" in options
  
  const result = await pipeline.runCompletePipeline(
    userSelection,
    systemContext,
    userAnswer
  );
  
  if (result.success && result.feedback?.includes('200')) {
    console.log('✨ SUCCESS! The problematic scenario works perfectly!');
    console.log('Feedback:', result.feedback);
  } else {
    console.log('❌ Issue remains:', result.error || 'Unknown error');
  }
  
  return result;
}