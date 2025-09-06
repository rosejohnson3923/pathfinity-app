/**
 * Integration file to add data capture to existing services
 * WITHOUT modifying the original files
 */

import { DataCaptureService } from './DataCaptureService';

const captureService = DataCaptureService.getInstance();

/**
 * Intercept AILearningJourneyService
 */
export function interceptAILearningJourneyService() {
  const originalModule = require('./AILearningJourneyService');
  const service = originalModule.aiLearningJourneyService;
  
  if (!service._intercepted) {
    // Intercept generateLearnContent
    const originalGenerateLearn = service.generateLearnContent.bind(service);
    service.generateLearnContent = async function(skill: any, student: any, career: any) {
      const request = { skill, student, career };
      const startTime = Date.now();
      
      try {
        const response = await originalGenerateLearn(skill, student, career);
        
        // Capture the interaction
        captureService.captureAIInteraction(
          'AILearningJourneyService',
          'generateLearnContent',
          request,
          response,
          { processingTime: Date.now() - startTime }
        );
        
        return response;
      } catch (error) {
        captureService.captureAIInteraction(
          'AILearningJourneyService',
          'generateLearnContent',
          request,
          { error: error.message },
          { processingTime: Date.now() - startTime, hasError: true }
        );
        throw error;
      }
    };
    
    // Mark as intercepted to avoid double-wrapping
    service._intercepted = true;
    console.log('✅ Intercepted AILearningJourneyService');
  }
}

/**
 * Intercept type detection in AILearningJourneyService
 */
export function interceptTypeDetection() {
  const originalModule = require('./AILearningJourneyService');
  const service = originalModule.aiLearningJourneyService;
  
  // Find the type detection logic (around line 700-719)
  // We'll wrap the entire content generation to catch type detection
  if (!service._typeDetectionIntercepted) {
    const originalGenerate = service.generateLearnContent.bind(service);
    
    service.generateLearnContent = async function(skill: any, student: any, career: any) {
      const response = await originalGenerate(skill, student, career);
      
      // Check if type was auto-detected for assessment
      if (response?.assessment) {
        const question = response.assessment;
        const questionText = question.question || question.content || '';
        
        // Capture type detection
        captureService.captureTypeDetection(
          question,
          question.type,
          'AILearningJourneyService',
          'auto-detection',
          this.getDetectionRule(question, skill, student),
          1 // Detection order
        );
        
        // Special logging for true/false detected as counting
        if (questionText.match(/^true or false:?/i) && question.type === 'counting') {
          console.warn('⚠️ TRUE_FALSE → COUNTING detected in AILearningJourneyService');
          console.warn(`   Question: "${questionText.substring(0, 60)}..."`);
          console.warn(`   Grade: ${student.grade_level}, Subject: ${skill.subject}`);
        }
      }
      
      return response;
    };
    
    // Add helper method to determine detection rule
    service.getDetectionRule = function(question: any, skill: any, student: any) {
      if (question.visual && skill.subject === 'Math' && student.grade_level <= '2') {
        return 'visual + Math + grade≤2 → counting';
      }
      if (question.question?.includes('_____')) {
        return 'blank spaces → fill_blank';
      }
      if (question.options?.length === 2 && question.options.includes('True')) {
        return 'two options with True → true_false';
      }
      if (question.options?.length > 0) {
        return 'has options → multiple_choice';
      }
      return 'fallback → short_answer';
    };
    
    service._typeDetectionIntercepted = true;
    console.log('✅ Intercepted type detection in AILearningJourneyService');
  }
}

/**
 * Intercept QuestionValidator
 */
export function interceptQuestionValidator() {
  try {
    const validatorModule = require('./content/QuestionValidator');
    const validator = validatorModule.questionValidator;
    
    if (!validator._intercepted) {
      const originalValidate = validator.validateAnswer.bind(validator);
      
      validator.validateAnswer = function(question: any, userAnswer: any) {
        const result = originalValidate(question, userAnswer);
        
        // Capture validation
        captureService.captureValidation(
          question,
          userAnswer,
          result,
          'QuestionValidator'
        );
        
        return result;
      };
      
      validator._intercepted = true;
      console.log('✅ Intercepted QuestionValidator');
    }
  } catch (error) {
    console.log('⚠️ Could not intercept QuestionValidator:', error.message);
  }
}

/**
 * Intercept QuestionRenderer
 */
export function interceptQuestionRenderer() {
  try {
    // Since QuestionRenderer is a React component, we need to intercept differently
    // We'll add logging to the component's props
    const rendererModule = require('./content/QuestionRenderer');
    
    if (rendererModule.QuestionRenderer && !rendererModule._intercepted) {
      const OriginalRenderer = rendererModule.QuestionRenderer;
      
      rendererModule.QuestionRenderer = function(props: any) {
        // Capture what the renderer receives
        captureService.captureRendererInput(
          props.question,
          'QuestionRenderer'
        );
        
        // Log true/false rendering issues
        if (props.question?.type === 'counting') {
          const text = props.question?.content || props.question?.question || '';
          if (text.match(/^true or false:?/i)) {
            console.error('🔴 RENDERER: True/False question with type="counting"');
            console.error(`   Question: "${text.substring(0, 60)}..."`);
          }
        }
        
        return OriginalRenderer(props);
      };
      
      rendererModule._intercepted = true;
      console.log('✅ Intercepted QuestionRenderer');
    }
  } catch (error) {
    console.log('⚠️ Could not intercept QuestionRenderer:', error.message);
  }
}

/**
 * Intercept AIContentConverter
 */
export function interceptAIContentConverter() {
  try {
    const converterModule = require('./content/AIContentConverter');
    const converter = converterModule.AIContentConverter.getInstance();
    
    if (!converter._intercepted) {
      // Intercept convertToTrueFalse method
      const originalConvertTrueFalse = converter.convertToTrueFalse?.bind(converter);
      if (originalConvertTrueFalse) {
        converter.convertToTrueFalse = function(assessment: any) {
          const result = originalConvertTrueFalse(assessment);
          
          captureService.captureConvertedQuestion(
            assessment,
            result,
            'AIContentConverter.convertToTrueFalse'
          );
          
          return result;
        };
      }
      
      // Intercept general conversion
      const originalConvert = converter.convertAIResponse?.bind(converter);
      if (originalConvert) {
        converter.convertAIResponse = function(aiResponse: any, containerType: string) {
          const result = originalConvert(aiResponse, containerType);
          
          // Check for type changes
          if (result?.assessment) {
            captureService.captureConvertedQuestion(
              aiResponse.assessment,
              result.assessment,
              'AIContentConverter.convertAIResponse'
            );
          }
          
          return result;
        };
      }
      
      converter._intercepted = true;
      console.log('✅ Intercepted AIContentConverter');
    }
  } catch (error) {
    console.log('⚠️ Could not intercept AIContentConverter:', error.message);
  }
}

/**
 * Initialize all intercepts
 */
export function initializeDataCapture() {
  console.log('\n🔧 Initializing Data Capture Intercepts...');
  
  interceptAILearningJourneyService();
  interceptTypeDetection();
  interceptQuestionValidator();
  interceptQuestionRenderer();
  interceptAIContentConverter();
  
  console.log('✅ Data capture intercepts initialized\n');
}