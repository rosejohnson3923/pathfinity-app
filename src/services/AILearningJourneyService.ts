/**
 * AI LEARNING JOURNEY SERVICE
 * Generates complete learning experiences for all 3 containers using AI
 */

import { azureOpenAIService } from './azureOpenAIService';
import { questionTypeValidator } from './questionTypeValidator';
import { ALL_TYPE_IDS, GRADE_TYPE_MAP } from '../types/questionTypes';
import { QuestionType } from './content/QuestionTypes';
import { staticDataService } from './StaticDataService';
import { dataCaptureServiceV2 } from './DataCaptureServiceV2';
import { FillBlankGeneratorService } from './FillBlankGeneratorService';
import { promptBuilder, PromptContext } from './ai-prompts/PromptBuilder';
import { getGradeCategory } from './ai-prompts/rules/UniversalSubjectRules';

// ================================================================
// TYPE DEFINITIONS
// ================================================================

export interface StudentProfile {
  id: string;
  display_name: string;
  grade_level: string;
  interests?: string[];
  learning_style?: string;
}

export interface LearningSkill {
  skill_number: string;
  skill_name: string;
  subject: string;
  grade_level: string;
}

export interface AILearnContent {
  title: string;
  greeting: string;
  concept: string;
  examples: Array<{
    question: string;
    answer: string;
    explanation: string;
    visual?: string;
  }>;
  practice: Array<{
    question: string;
    type: QuestionType;
    options?: string[];
    correct_answer: string | number;
    hint: string;
    explanation: string;
    // Practice Support Fields
    practiceSupport?: {
      preQuestionContext?: string;       // Career context before question
      connectionToLearn?: string;         // Reference what was learned
      confidenceBuilder?: string;         // Encouraging message
      hints?: Array<{                    // Progressive hints
        level: 1 | 2 | 3;
        hint: string;
        visualCue?: string;
        example?: string;
      }>;
      correctFeedback?: {
        immediate: string;
        careerConnection: string;
        skillReinforcement: string;
      };
      incorrectFeedback?: {
        immediate: string;
        explanation: string;
        reteach?: string;
        tryAgainPrompt?: string;
      };
      teachingMoment?: {
        conceptExplanation: string;
        realWorldExample: string;
        commonMistakes?: string[];
      };
    };
  }>;
  assessment: {
    question: string;
    type: QuestionType;
    visual?: string;  // Visual representation for counting questions
    options: string[];
    correct_answer: number | string;
    explanation: string;
    success_message: string;
  };
}

// Legacy single-challenge interface (deprecated)
export interface AIExperienceContentLegacy {
  title: string;
  scenario: string;
  character_context: string;
  career_introduction: string;
  real_world_connections: Array<{
    situation: string;
    challenge: string;
    solution_approach: string;
    learning_connection: string;
  }>;
  interactive_simulation: {
    setup: string;
    challenges: Array<{
      description: string;
      options: string[];
      correct_choice: number;
      outcome: string;
      learning_point: string;
    }>;
    conclusion: string;
  };
}

// Note: The multi-challenge interfaces were removed as they were not integrated.
// The system uses AIExperienceContentLegacy for the Experience container.

export interface AIDiscoverContent {
  title: string;
  exploration_theme: string;
  curiosity_questions: string[];
  discovery_paths: Array<{
    path_name: string;
    description: string;
    activities: Array<{
      activity_type: 'research' | 'experiment' | 'create' | 'explore';
      title: string;
      instructions: string;
      expected_outcome: string;
    }>;
    reflection_questions: string[];
  }>;
  connections: {
    to_learn: string;
    to_experience: string;
    to_future_learning: string;
  };
}

// ================================================================
// AI LEARNING JOURNEY SERVICE
// ================================================================

export class AILearningJourneyService {
  // Storyline continuity cache to maintain narrative across containers
  private storylineContext: Map<string, {
    scenario: string;
    character: string;
    setting: string;
    currentChallenge: string;
    careerConnection: string;
    timestamp: Date;
  }> = new Map();

  /**
   * Get or create storyline context for skill
   */
  private getStorylineContext(
    skillKey: string,
    skill: LearningSkill,
    career?: { name: string; description?: string }
  ) {
    const existingContext = this.storylineContext.get(skillKey);
    
    // Use existing context if recent (within 30 minutes)
    if (existingContext && 
        (new Date().getTime() - existingContext.timestamp.getTime()) < 30 * 60 * 1000) {
      console.log('📚 Using existing storyline context for continuity');
      return existingContext;
    }

    // Create new context
    const newContext = {
      scenario: `helping in a ${career?.name || 'professional'} environment`,
      character: career ? `a ${career.name}` : 'a professional',
      setting: this.getCareerSetting(career?.name),
      currentChallenge: `applying ${skill.skill_name} skills`,
      careerConnection: career ? `how ${career.name}s use ${skill.skill_name}` : `using ${skill.skill_name} professionally`,
      timestamp: new Date()
    };
    
    this.storylineContext.set(skillKey, newContext);
    console.log('📖 Created new storyline context:', newContext);
    return newContext;
  }

  private getCareerSetting(careerName?: string): string {
    const settings: Record<string, string> = {
      'Doctor': 'a modern hospital',
      'Engineer': 'an innovation lab',
      'Teacher': 'a vibrant classroom',
      'Chef': 'a busy restaurant kitchen',
      'Artist': 'a creative studio',
      'Scientist': 'a research laboratory',
      'Developer': 'a tech workspace',
      'Musician': 'a recording studio',
      'Athlete': 'a training facility',
      'Writer': 'a cozy writing space'
    };
    return settings[careerName || ''] || 'a professional workspace';
  }

  /**
   * Generate AI-powered Learn container content
   * Now follows Practice → Instruction → Assessment flow
   */
  async generateLearnContent(
    skill: LearningSkill,
    student: StudentProfile,
    career?: { name: string; description?: string },
    practiceResults?: { correct: number; total: number; struggles: string[] }
  ): Promise<AILearnContent> {
    console.log(`🤖 Generating AI Learn content using PromptBuilder for ${skill.skill_number}: ${skill.skill_name}`, {
      career: career?.name || 'No career context',
      adaptiveMode: practiceResults ? 'Yes' : 'No',
      practicePerformance: practiceResults
    });

    // Get or create storyline context for continuity
    const skillKey = `${student.id}-${skill.skill_number}`;
    const storylineContext = this.getStorylineContext(skillKey, skill, career);

    // Build context for PromptBuilder
    const context: PromptContext = {
      container: 'LEARN',
      subject: skill.subject || 'Math',
      grade: student.grade_level || 'K',
      skill: {
        id: skill.skill_number,
        name: skill.skill_name,
        description: skill.skill_description,
        subject: skill.subject || 'Math'
      },
      career: {
        id: (typeof career?.name === 'string' ? career.name : career?.title || career?.id || 'general').toLowerCase(),
        name: typeof career?.name === 'string' ? career.name : career?.title || career?.name || 'Professional',
        description: career?.description
      },
      student: {
        id: student.id,
        display_name: student.display_name || student.name || 'Student',
        grade_level: student.grade_level || 'K'
      }
    };

    // Generate prompt using hierarchical rules
    const prompt = promptBuilder.buildPrompt(context);
    
    console.log('🚀 USING NEW PROMPT BUILDER - Length:', prompt.length, 'characters');
    
    // Debug: Log key sections of the prompt
    const promptChecks = {
      hasMandatoryFields: prompt.includes('MANDATORY FIELDS'),
      hasCorrectAnswer: prompt.includes('correct_answer'),
      hasPracticeSupport: prompt.includes('practiceSupport'),
      hasVisualField: prompt.includes('visual'),
      hasQualityCheck: prompt.includes('FINAL QUALITY CHECK')
    };
    console.log('📋 Prompt validation:', promptChecks);

    // Add storyline context if exists to the PromptBuilder prompt
    const enhancedPrompt = storylineContext.currentChapter ? 
      `${prompt}\n\nCONTINUITY: Continue from where we left off: "${storylineContext.previousSummary}"` :
      prompt;

    // All prompt generation now handled by PromptBuilder

    try {
      // Use the new hierarchical prompt from PromptBuilder
      const response = await azureOpenAIService.generateWithModel(
        'gpt4o',
        enhancedPrompt,
        'You are an expert educational content creator specializing in personalized, gamified learning experiences.',
        { temperature: 0.7, maxTokens: 4000, jsonMode: true }
      );

      // Clean and parse JSON response
      let content;
      try {
        // Remove any potential BOM or invisible characters
        const cleanedResponse = response
          .replace(/^\uFEFF/, '') // Remove BOM
          .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove zero-width characters
          .trim();
        
        // Try to extract JSON if it's wrapped in markdown
        let jsonStr = cleanedResponse;
        if (cleanedResponse.includes('```json')) {
          const match = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/);
          if (match) {
            jsonStr = match[1];
          }
        } else if (cleanedResponse.includes('```')) {
          const match = cleanedResponse.match(/```\s*([\s\S]*?)\s*```/);
          if (match) {
            jsonStr = match[1];
          }
        }
        
        content = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError);
        console.log('Raw response:', response.substring(0, 500));
        
        // Try to fix common JSON issues
        try {
          let fixedResponse = response
            .replace(/,\s*}/g, '}') // Remove trailing commas
            .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/(\w+):/g, '"$1":') // Add quotes to unquoted keys
            .replace(/:\s*undefined/g, ': null') // Replace undefined with null
            .replace(/\n/g, ' '); // Remove newlines that might break JSON
          
          // Check if response seems truncated (doesn't end with proper closing)
          const lastChar = fixedResponse.trim().slice(-1);
          if (lastChar !== '}' && lastChar !== ']') {
            console.warn('⚠️ Response appears truncated, attempting to close JSON structure');
            
            // Count opening and closing braces/brackets
            const openBraces = (fixedResponse.match(/{/g) || []).length;
            const closeBraces = (fixedResponse.match(/}/g) || []).length;
            const openBrackets = (fixedResponse.match(/\[/g) || []).length;
            const closeBrackets = (fixedResponse.match(/]/g) || []).length;
            
            // Add missing closing brackets/braces
            const missingBrackets = ']'.repeat(Math.max(0, openBrackets - closeBrackets));
            const missingBraces = '}'.repeat(Math.max(0, openBraces - closeBraces));
            
            // Close any incomplete strings
            if ((fixedResponse.match(/"/g) || []).length % 2 !== 0) {
              fixedResponse += '"';
            }
            
            // Close incomplete arrays/objects
            fixedResponse += missingBrackets + missingBraces;
          }
          
          content = JSON.parse(fixedResponse);
          console.log('✅ Fixed JSON parsing issues');
        } catch (fixError) {
          console.error('❌ Could not fix JSON:', fixError);
          console.log('Attempting to use fallback content due to parsing failure');
          throw parseError;
        }
      }
      
      // Validate content using hierarchical rules
      const validation = promptBuilder.validateContent(content, context);
      if (!validation.valid) {
        console.error('❌ Content validation failed:', validation.errors);
        // Log but continue - we'll fix issues in conversion
      }
      
      // Ensure we have exactly 5 practice questions
      if (!content.practice || content.practice.length === 0) {
        console.warn('⚠️ No practice questions returned, generating defaults');
        content.practice = this.generateDefaultPracticeQuestions(skill, student, career);
      } else if (content.practice.length < 5) {
        console.warn(`⚠️ AI returned only ${content.practice.length} practice questions, expected 5`);
        // Generate additional questions to reach 5
        while (content.practice.length < 5) {
          const questionNum = content.practice.length + 1;
          const defaultQuestion = this.generateSingleDefaultQuestion(
            skill, 
            student, 
            career, 
            questionNum
          );
          content.practice.push(defaultQuestion);
        }
        console.log(`📝 Padded practice questions to ${content.practice.length}`);
      }
      
      // Use our comprehensive validator for all questions
      if (content.practice) {
        content.practice = content.practice.map((q, index) => {
          console.log(`🔍 Validating practice question ${index + 1}:`, {
            type: q.type,
            question: q.question?.substring(0, 50)
          });
          
          // CRITICAL FIX: Ensure correct_answer is ALWAYS present
          console.log(`📋 Question ${index + 1} correct_answer check:`, {
            has_correct_answer: 'correct_answer' in q,
            correct_answer_value: q.correct_answer,
            correct_answer_type: typeof q.correct_answer,
            is_undefined: q.correct_answer === undefined,
            is_null: q.correct_answer === null
          });
          
          if (!q.correct_answer && q.correct_answer !== 0 && q.correct_answer !== false) {
            console.error(`🚨 Question ${index + 1} missing correct_answer!`);
            // Add default based on type
            if (q.type === 'true_false') {
              q.correct_answer = true; // Default to true
              console.warn('⚠️ Defaulting true_false to true');
            } else if (q.type === 'multiple_choice' && q.options) {
              q.correct_answer = 0; // Default to first option
              console.warn('⚠️ Defaulting multiple_choice to index 0');
            } else if (q.type === 'counting') {
              q.correct_answer = 3; // Default count
              console.warn('⚠️ Defaulting counting to 3');
            } else if (q.type === 'numeric') {
              q.correct_answer = 0; // Default number
              console.warn('⚠️ Defaulting numeric to 0');
            } else {
              q.correct_answer = 'answer'; // Default string
              console.warn('⚠️ Defaulting to string "answer"');
            }
          }
          
          // Validate and correct the question
          const validation = questionTypeValidator.validate(q, student.grade_level);
          
          if (!validation.valid) {
            console.warn(`❌ Question ${index + 1} validation failed:`, validation.errors);
          }
          
          if (validation.correctedType) {
            console.log(`🔧 Corrected type from ${q.type} to ${validation.correctedType}`);
            q.type = validation.correctedType;
          }
          
          // Apply additional corrections based on validation
          if (validation.suggestions) {
            console.log(`💡 Suggestions for question ${index + 1}:`, validation.suggestions);
          }
          
          // Apply type-specific fixes
          let corrected = questionTypeValidator.applyCorrections(q, student.grade_level);
          
          // Process fill_blank questions with FillBlankGeneratorService
          if (corrected.type === 'fill_blank' && corrected.question) {
            const fillBlankService = FillBlankGeneratorService.getInstance();
            
            // If the question doesn't have blanks yet, create them
            if (!corrected.question.includes('_____') && !corrected.question.includes('{{blank}}')) {
              console.log('🔧 Processing fill_blank with FillBlankGeneratorService:', corrected.question.substring(0, 100));
              
              try {
                const processed = fillBlankService.generateFillBlank(corrected.question, corrected.hint);
                
                // Update the question with the processed version
                corrected.question = processed.question;
                corrected.template = processed.template;
                corrected.blanks = processed.blanks;
                
                // Generate answer options from the blanked words
                if (!corrected.options || corrected.options.length === 0) {
                  const blankWords = processed.blanks.map(b => b.correctAnswers[0]);
                  // Add the correct answer and some distractors
                  corrected.options = fillBlankService.generateOptions(blankWords[0], corrected.question);
                }
                
                console.log('✅ Fill_blank processed:', {
                  original: q.question?.substring(0, 50),
                  processed: corrected.question.substring(0, 50),
                  answer: processed.correct_answer,
                  options: corrected.options
                });
              } catch (error) {
                console.error('❌ Fill_blank processing failed:', error);
              }
            }
          }
          
          return corrected;
        });
        
        // Log validation summary
        const validationSummary = questionTypeValidator.validateBatch(
          content.practice, 
          student.grade_level
        );
        console.log('📊 Practice Questions Validation Summary:', validationSummary.summary);
      }
      
      // Validate assessment question too
      if (content.assessment) {
        // CRITICAL FIX: Ensure assessment has hint field
        if (!content.assessment.hint) {
          console.warn('⚠️ Assessment missing hint field, adding default');
          content.assessment.hint = `Think about ${skill.name} and how it applies to this problem.`;
        }
        
        // CRITICAL FIX: Ensure assessment has correct_answer
        if (!content.assessment.correct_answer && content.assessment.correct_answer !== 0 && content.assessment.correct_answer !== false) {
          console.error('🚨 Assessment missing correct_answer!');
          // Add default based on type
          if (content.assessment.type === 'true_false') {
            content.assessment.correct_answer = true;
            console.warn('⚠️ Defaulting assessment true_false to true');
          } else if (content.assessment.type === 'multiple_choice' && content.assessment.options) {
            content.assessment.correct_answer = 0;
            console.warn('⚠️ Defaulting assessment multiple_choice to index 0');
          } else if (content.assessment.type === 'counting') {
            content.assessment.correct_answer = 3;
            console.warn('⚠️ Defaulting assessment counting to 3');
          } else {
            content.assessment.correct_answer = 'answer';
            console.warn('⚠️ Defaulting assessment to string "answer"');
          }
        }
        
        // If type is not set, try to detect it using database-driven detection
        if (!content.assessment.type) {
          // Use StaticDataService for database-driven detection
          const detectedType = await staticDataService.detectQuestionType(
            content.assessment.question,
            student.grade_level,
            skill.subject
          );
          
          content.assessment.type = detectedType;
          console.log(`🔍 Database-detected assessment type: ${content.assessment.type}`);
          
          // Log detection event
          await dataCaptureServiceV2.logDetectionEvent({
            question_text: content.assessment.question,
            detected_type: detectedType,
            expected_type: requestedQuestionType,
            grade_level: student.grade_level,
            subject: skill.subject,
            detection_method: 'database_rules',
            confidence_score: 0.95,
            is_correct: requestedQuestionType ? detectedType === requestedQuestionType : true,
            metadata: {
              container_type: containerType,
              skill_number: skill.skill_number,
            }
          });
        }
        
        const assessmentValidation = questionTypeValidator.validate(
          content.assessment, 
          student.grade_level
        );
        
        if (!assessmentValidation.valid) {
          console.warn('❌ Assessment validation failed:', assessmentValidation.errors);
        }
        
        if (assessmentValidation.correctedType) {
          console.log(`🔧 Corrected assessment type from ${content.assessment.type} to ${assessmentValidation.correctedType}`);
          content.assessment.type = assessmentValidation.correctedType;
        }
        
        // Apply type-specific corrections
        const correctedAssessment = questionTypeValidator.applyCorrections(
          content.assessment,
          student.grade_level
        );
        content.assessment = correctedAssessment;
      }
        
      // Also check examples for visuals (K-2 grades need visuals for counting)
      const gradeCategory = getGradeCategory(student.grade_level);
      if (gradeCategory === 'K-2' && skill.subject === 'Math' && content.examples) {
        content.examples = content.examples.map(ex => {
          if (ex.question.toLowerCase().includes('count') || 
              ex.question.toLowerCase().includes('how many')) {
            if (!ex.visual || ex.visual === 'Simple diagram or illustration') {
              const count = parseInt(ex.answer) || 3;
              ex.visual = '🔴 '.repeat(count);
            }
          }
          return ex;
        });
      }
      
      console.log(`✅ Generated AI Learn content for ${skill.skill_number}`, {
        title: content.title,
        greeting: content.greeting?.substring(0, 100),
        concept: content.concept?.substring(0, 100),
        practiceQuestionTypes: content.practice?.map(q => ({ 
          type: q.type, 
          hasVisual: !!q.visual,
          question: q.question.substring(0, 50) 
        }))
      });
      
      return content;

    } catch (error) {
      console.error(`❌ AI Learn content generation failed:`, error);
      return this.generateFallbackLearnContent(skill, student, career);
    }
  }

  /**
   * Generate diagnostic practice questions (Phase 1 of new flow)
   * These test prior knowledge before instruction
   */
  async generateDiagnosticPractice(
    skill: LearningSkill,
    student: StudentProfile,
    career?: { name: string; description?: string }
  ): Promise<AILearnContent['practice']> {
    console.log(`🔍 Generating diagnostic practice for ${skill.skill_number}: ${skill.skill_name}`);
    
    // Use the main generator but request only practice questions
    const fullContent = await this.generateLearnContent(skill, student, career);
    return fullContent.practice;
  }

  /**
   * Generate adaptive instruction based on practice results (Phase 2)
   */
  async generateAdaptiveInstruction(
    skill: LearningSkill,
    student: StudentProfile,
    practiceResults: { correct: number; total: number; struggles: string[] },
    career?: { name: string; description?: string }
  ): Promise<Pick<AILearnContent, 'title' | 'greeting' | 'concept' | 'examples'>> {
    console.log(`📚 Generating adaptive instruction using PromptBuilder based on practice performance`, {
      correct: practiceResults.correct,
      total: practiceResults.total,
      struggles: practiceResults.struggles
    });
    
    // Build context for PromptBuilder
    const context: PromptContext = {
      container: 'LEARN',
      subject: skill.subject || 'Math',
      grade: student.grade_level || 'K',
      skill: {
        id: skill.skill_number,
        name: skill.skill_name,
        description: skill.skill_description,
        subject: skill.subject || 'Math'
      },
      career: {
        id: (career?.name || 'general').toLowerCase(),
        name: career?.name || 'Professional',
        description: career?.description
      },
      student: {
        id: student.id,
        display_name: student.display_name || 'Student',
        grade_level: student.grade_level || 'K'
      }
    };
    
    // Generate base prompt using PromptBuilder
    const basePrompt = promptBuilder.buildPrompt(context);
    
    // Calculate performance level
    const performancePercentage = (practiceResults.correct / practiceResults.total) * 100;
    const performanceLevel = performancePercentage >= 80 ? 'advanced' : 
                           performancePercentage >= 60 ? 'intermediate' : 'foundational';
    
    // Add adaptive context to the prompt
    const prompt = `${basePrompt}

ADAPTIVE INSTRUCTION MODE:
This is Phase 2 - Generate ONLY the instruction content (title, greeting, concept, examples).
DO NOT generate practice questions or assessment.

PRACTICE PERFORMANCE:
- Score: ${practiceResults.correct}/${practiceResults.total} (${performancePercentage.toFixed(0)}%)
- Performance Level: ${performanceLevel}
${practiceResults.struggles.length > 0 ? `- Areas needing focus: ${practiceResults.struggles.join(', ')}` : '- Strong understanding demonstrated'}

ADJUST INSTRUCTION BASED ON PERFORMANCE:
${performanceLevel === 'advanced' ? 
  '- Acknowledge strong foundation and move to advanced applications' :
  performanceLevel === 'intermediate' ?
  '- Reinforce concepts with focus on struggled areas' :
  '- Provide thorough foundational teaching with extra support'}

Return ONLY these fields:
{
  "title": "Adaptive title based on performance",
  "greeting": "Personalized greeting acknowledging practice results",
  "concept": "Clear explanation adjusted to performance level",
  "examples": [/* 3 teaching examples tailored to performance */]
}`;
    try {
      console.log('🤖 Calling Azure OpenAI for adaptive instruction...');
      const response = await azureOpenAIService.generateWithModel(
        'gpt4o',
        prompt,
        'You are an expert educational tutor who creates personalized teaching content.',
        {
          maxTokens: 2000,
          temperature: 0.7,
          jsonMode: true
        }
      );

      const content = JSON.parse(response);
      console.log('✅ Generated adaptive instruction successfully');
      
      return {
        title: content.title,
        greeting: content.greeting,
        concept: content.concept,
        examples: content.examples
      };
    } catch (error) {
      console.error('❌ Failed to generate adaptive instruction:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      
      // Generate better fallback instruction content based on performance
      const performancePercentage = (practiceResults.correct / practiceResults.total) * 100;
      const performanceLevel = performancePercentage >= 80 ? 'advanced' : 
                             performancePercentage >= 60 ? 'intermediate' : 'foundational';
      
      const careerContext = career ? ` like a ${career.name}` : '';
      const greetingMessage = performanceLevel === 'advanced' 
        ? `Excellent work on the practice! You got ${practiceResults.correct} out of ${practiceResults.total} correct. Let me show you some advanced techniques.`
        : performanceLevel === 'intermediate'
        ? `Good effort! You got ${practiceResults.correct} out of ${practiceResults.total} correct. Let's strengthen your understanding.`
        : `Thanks for trying! You got ${practiceResults.correct} out of ${practiceResults.total} correct. Let me teach you step by step.`;
      
      // Create skill-specific examples based on subject
      const subjectExamples = this.generateSubjectSpecificExamples(skill, student, career);
      
      return {
        title: `Mastering ${skill.skill_name}${careerContext}`,
        greeting: `Hi ${student.display_name}! ${greetingMessage}`,
        concept: `${skill.skill_name} is a key ${skill.subject} skill. ${career ? `${career.name}s use this skill every day to solve real problems.` : 'This skill helps you understand and solve problems.'} Let me show you exactly how it works.`,
        examples: subjectExamples
      };
    }
  }

  /**
   * Generate subject-specific teaching examples
   */
  private generateSubjectSpecificExamples(
    skill: LearningSkill, 
    student: StudentProfile, 
    career?: { name: string }
  ): any[] {
    const careerContext = career?.name || 'Professional';
    
    // Create examples based on subject and grade level
    if (skill.subject === 'Math') {
      if (student.grade_level === 'K' || student.grade_level === '1' || student.grade_level === '2') {
        return [
          {
            question: `Let's count together! If you have 3 apples 🍎🍎🍎 and get 2 more 🍎🍎, how many do you have?`,
            answer: "5 apples total",
            explanation: "First we had 3, then we added 2 more. When we count them all: 1, 2, 3, 4, 5!",
            visual: "🍎🍎🍎 + 🍎🍎 = 🍎🍎🍎🍎🍎"
          },
          {
            question: `${career ? `A ${careerContext} needs to` : 'You need to'} share 6 cookies 🍪 equally with 2 friends. How many does each get?`,
            answer: "Each person gets 2 cookies",
            explanation: "We divide 6 cookies into 3 equal groups (you and 2 friends). 6 ÷ 3 = 2",
            visual: "🍪🍪 | 🍪🍪 | 🍪🍪"
          },
          {
            question: "What number comes after 7?",
            answer: "8 comes after 7",
            explanation: "When we count up: 5, 6, 7, 8, 9, 10. So 8 is the next number!",
            visual: "Number sequence: 7️⃣ ➡️ 8️⃣"
          }
        ];
      } else {
        return [
          {
            question: `Example 1: ${career ? `A ${careerContext} calculates` : 'Calculate'} 24 × 3`,
            answer: "72",
            explanation: "Break it down: 20 × 3 = 60, and 4 × 3 = 12. Then 60 + 12 = 72",
            visual: "24 × 3 = (20 × 3) + (4 × 3) = 60 + 12 = 72"
          },
          {
            question: `Example 2: Find the pattern: 2, 5, 8, 11, ?`,
            answer: "14",
            explanation: "Each number increases by 3. So 11 + 3 = 14",
            visual: "2 (+3)→ 5 (+3)→ 8 (+3)→ 11 (+3)→ 14"
          },
          {
            question: `Example 3: ${career ? `A ${careerContext} needs` : 'You need'} to find 25% of 80`,
            answer: "20",
            explanation: "25% is the same as 1/4. So 80 ÷ 4 = 20",
            visual: "25% = 1/4, so 80 ÷ 4 = 20"
          }
        ];
      }
    } else if (skill.subject === 'ELA') {
      if (student.grade_level === 'K' || student.grade_level === '1' || student.grade_level === '2') {
        return [
          {
            question: "Let's learn about rhyming! What rhymes with 'cat'?",
            answer: "Words like 'hat', 'bat', 'mat' rhyme with 'cat'",
            explanation: "Rhyming words sound the same at the end. They all end with the '-at' sound!",
            visual: "🐱 cat → 🎩 hat, 🦇 bat, 🚪 mat"
          },
          {
            question: "Which word starts with the same sound as 'sun'? Snake, moon, or tree?",
            answer: "Snake starts with the same 's' sound",
            explanation: "Both 'sun' and 'snake' start with the 'sss' sound we make like a snake!",
            visual: "☀️ Sun, 🐍 Snake - both start with 'S'!"
          },
          {
            question: `${career ? `A ${careerContext} writes` : 'Complete'} this sentence: The dog is ___. (big/pig)`,
            answer: "The dog is big",
            explanation: "'Big' describes the size of the dog. 'Pig' is an animal, not a description!",
            visual: "🐕 The dog is big (not 🐷 pig!)"
          }
        ];
      } else {
        return [
          {
            question: `Identify the main idea: '${career ? careerContext + 's' : 'Scientists'} study climate change to protect Earth.'`,
            answer: "The main idea is about studying climate change",
            explanation: "The sentence tells us WHO (scientists) does WHAT (study climate) and WHY (protect Earth)",
            visual: "Subject → Action → Purpose"
          },
          {
            question: "Which word is the adjective: 'The brilliant scientist made a discovery'?",
            answer: "'Brilliant' is the adjective",
            explanation: "Adjectives describe nouns. 'Brilliant' describes the scientist",
            visual: "The [adjective] brilliant → [noun] scientist"
          },
          {
            question: "What type of sentence is this: 'Watch out for that car!'",
            answer: "It's an exclamatory sentence",
            explanation: "The exclamation mark and warning tone make it exclamatory - it shows strong emotion",
            visual: "! = strong emotion or warning"
          }
        ];
      }
    } else if (skill.subject === 'Science') {
      return [
        {
          question: `${career ? `A ${careerContext} observes` : 'Observe'}: What happens when ice melts?`,
          answer: "Ice turns into water",
          explanation: "When ice gets warm, it changes from solid to liquid. This is called melting!",
          visual: "🧊 (solid) + heat → 💧 (liquid)"
        },
        {
          question: "Why do we see our shadow on a sunny day?",
          answer: "Our body blocks the sunlight",
          explanation: "Light travels in straight lines. When we stand in sunlight, our body blocks some light, creating a shadow",
          visual: "☀️ → 🧍 → shadow"
        },
        {
          question: `${career ? `${careerContext}s know that` : 'Remember:'} plants need these 3 things to grow`,
          answer: "Water, sunlight, and air",
          explanation: "Plants use sunlight for energy, water for nutrients, and air (CO2) to make food",
          visual: "🌱 needs: 💧 + ☀️ + 💨"
        }
      ];
    } else { // Social Studies
      return [
        {
          question: `${career ? `${careerContext}s understand` : 'Learn about'} community helpers. Who keeps us safe?`,
          answer: "Police officers, firefighters, and doctors",
          explanation: "These community helpers work to protect and help people every day",
          visual: "👮 Police, 👨‍🚒 Firefighter, 👩‍⚕️ Doctor"
        },
        {
          question: "What are the three branches of government?",
          answer: "Legislative, Executive, and Judicial",
          explanation: "Legislative makes laws, Executive enforces laws, Judicial interprets laws",
          visual: "📜 Make laws → ✓ Enforce → ⚖️ Judge"
        },
        {
          question: `Why do ${career ? careerContext + 's' : 'people'} pay taxes?`,
          answer: "To fund public services",
          explanation: "Taxes pay for schools, roads, police, firefighters, and other services we all use",
          visual: "💰 Taxes → 🏫🚒🏥 Public Services"
        }
      ];
    }
  }

  /**
   * Generate final assessment (Phase 3)
   * Different from practice questions
   */
  async generateFinalAssessment(
    skill: LearningSkill,
    student: StudentProfile,
    career?: { name: string; description?: string }
  ): Promise<AILearnContent['assessment']> {
    console.log(`✅ Generating final assessment for ${skill.skill_number}`);
    
    const fullContent = await this.generateLearnContent(skill, student, career);
    return fullContent.assessment;
  }

  /**
   * Generate AI-powered Experience container content
   */
  async generateExperienceContent(
    skill: LearningSkill,
    student: StudentProfile,
    career?: { name: string; description?: string }
  ): Promise<AIExperienceContentLegacy> {
    console.log(`🎯 Generating AI Experience content using PromptBuilder for ${skill.skill_number}: ${skill.skill_name}`, {
      career: career?.name || 'No career context'
    });

    // Get or create storyline context for continuity
    const skillKey = `${student.id}-${skill.skill_number}`;
    const storylineContext = this.getStorylineContext(skillKey, skill, career);

    // Experience is ALWAYS career-focused - use provided career or generate appropriate one
    const careerToUse = career?.name || this.getDefaultCareerForGrade(student.grade_level, skill.subject);
    
    // Determine number of challenges based on grade level for Experience
    // This MUST match the frontend's getScenarioCount() function
    const gradeNum = student.grade_level === 'K' ? 0 : parseInt(student.grade_level);
    let challengeCount = 2; // Default

    // Align with frontend expectations - same for ALL subjects
    if (gradeNum <= 2) {
      challengeCount = 4; // K-2: 4 challenges for all subjects
    } else if (gradeNum <= 5) {
      challengeCount = 3; // 3-5: 3 challenges
    } else if (gradeNum <= 8) {
      challengeCount = 3; // 6-8: 3 challenges
    } else {
      challengeCount = 2; // 9-12: 2 challenges
    }
    
    // Build context for PromptBuilder
    const context: PromptContext = {
      container: 'EXPERIENCE',
      subject: skill.subject || 'Math',
      grade: student.grade_level || 'K',
      skill: {
        id: skill.skill_number,
        name: skill.skill_name,
        description: skill.skill_description,
        subject: skill.subject || 'Math'
      },
      career: {
        id: careerToUse.toLowerCase(),
        name: careerToUse,
        description: career?.description
      },
      student: {
        id: student.id,
        display_name: student.display_name || 'Student',
        grade_level: student.grade_level || 'K'
      }
    };
    
    // Generate base prompt using PromptBuilder
    const basePrompt = promptBuilder.buildPrompt(context);
    
    const prompt = `${basePrompt}

EXPERIENCE CONTAINER SPECIFIC:
Create an immersive FIRST-PERSON career experience for ${student.display_name}, a ${student.grade_level} student.

STORYLINE CONTINUITY (Continue this narrative):
Setting: ${storylineContext.setting}
Ongoing Story: ${student.display_name} is ${storylineContext.scenario}
Current Focus: ${storylineContext.currentChallenge}
Career Application: ${storylineContext.careerConnection}

CAREER: ${careerToUse} (THIS IS THE FOCUS!)
SKILL TO APPLY: ${skill.skill_name}
SUBJECT: ${skill.subject}
STUDENT: ${student.display_name} (Grade ${student.grade_level})
${skill.skill_name.includes('up to 3') ? `
⚠️ CRITICAL NUMBER LIMIT: This skill specifies "up to 3" - ALL numbers MUST be 3 or less!
- Never use numbers greater than 3 in any scenario
- All counting scenarios must involve 3 items or fewer
- Examples: ✅ "You count 2 patients", ✅ "You have 3 recipes", ❌ "You see 5 items"` : ''}

CRITICAL: Write everything in SECOND PERSON ("You are...", "You need to...", "Your task is...")
The student IS the professional - they're not watching someone else, they ARE doing the job!

Create a ${careerToUse} experience where the student IS the ${careerToUse}:

1. CAREER SCENARIO:
   - Start with "You are a ${careerToUse}..." 
   - "Your job today is to..."
   - "As a ${careerToUse}, you use ${skill.skill_name} to..."
   - Make it personal and immersive

2. INTERACTIVE SIMULATION (EXACTLY ${challengeCount} CHALLENGES):
   - Setup: "You arrive at work and..."
   - Create EXACTLY ${challengeCount} challenge scenarios
   - Each challenge should be progressively more complex
   - Options should be "I would..." choices
   - Outcomes: "You chose to... and this happened..."
   - Learning: "You learned that..."

⚠️ CRITICAL REQUIREMENT: You MUST generate EXACTLY ${challengeCount} challenges!
   - The challenges array MUST contain EXACTLY ${challengeCount} items
   - Not ${challengeCount - 1}, not ${challengeCount + 1}, but EXACTLY ${challengeCount}
   - Count them: Challenge 1, Challenge 2${challengeCount >= 3 ? ', Challenge 3' : ''}${challengeCount >= 4 ? ', Challenge 4' : ''}

REQUIREMENTS:
- ALWAYS use second person ("You are", "You do", "Your task")
- NEVER use third person ("${student.display_name} is", "${student.display_name} does")
- Age-appropriate career exposure for grade ${student.grade_level}
- Make the student feel they ARE the professional
- Show how THEY use ${skill.skill_name} in THEIR job

Return JSON:
{
  "title": "${careerToUse} ${student.display_name}'s Day at Work",
  "scenario": "You are ${careerToUse} ${student.display_name}, working on... (immersive scenario)",
  "scenario_summary": "Brief 3-5 word action phrase for Mission Tile (e.g., 'Help patients today', 'Design new buildings', 'Solve tech problems')",
  "character_context": "Welcome, ${careerToUse} ${student.display_name}! You're a professional ${careerToUse} who...",
  "career_introduction": "As ${careerToUse} ${student.display_name}, you use ${skill.skill_name} every day to..."
  "real_world_connections": [],
  "interactive_simulation": {
    "setup": "You arrive at your ${careerToUse} job and...",
    "challenges": [
      // ⚠️ MUST HAVE EXACTLY ${challengeCount} CHALLENGE OBJECTS IN THIS ARRAY
      {
        "description": "Challenge 1: Your coworker asks you to... What do you do?",
        "challenge_summary": "Brief 2-4 word action (e.g., 'Distribute equipment', 'Organize team', 'Count supplies')",
        "options": ["I would...", "I would...", "I would..."],
        "correct_choice": 0,
        "hint": "Think about how ${skill.skill_name} can help you solve this...",
        "outcome": "You chose to... and it worked because...",
        "learning_point": "You learned that ${skill.skill_name} helps you..."
      },
      ${challengeCount >= 2 ? `{
        "description": "Challenge 2: Next situation...",
        "challenge_summary": "Brief 2-4 word action",
        "options": ["I would...", "I would...", "I would..."],
        "correct_choice": 1,
        "hint": "Remember what you learned...",
        "outcome": "Great choice because...",
        "learning_point": "This shows that..."
      }${challengeCount > 2 ? ',' : ''}` : ''}
      ${challengeCount >= 3 ? `{
        "description": "Challenge 3: Another task...",
        "challenge_summary": "Brief 2-4 word action",
        "options": ["I would...", "I would...", "I would..."],
        "correct_choice": 0,
        "hint": "Apply your ${skill.skill_name} skills...",
        "outcome": "Excellent work...",
        "learning_point": "You discovered..."
      }${challengeCount > 3 ? ',' : ''}` : ''}
      ${challengeCount >= 4 ? `{
        "description": "Challenge 4: Final challenge...",
        "challenge_summary": "Brief 2-4 word action",
        "options": ["I would...", "I would...", "I would..."],
        "correct_choice": 2,
        "hint": "Use everything you learned...",
        "outcome": "Perfect solution...",
        "learning_point": "You mastered..."
      }` : ''}
    ],
    "conclusion": "Great job today! As a ${careerToUse}, you successfully completed ${challengeCount} challenges!"
  }
}

REMEMBER:
- real_world_connections should be an EMPTY array []
- challenges array must have EXACTLY ${challengeCount} items

FINAL CHECK before returning JSON:
✓ Count the challenges in your array: Must be EXACTLY ${challengeCount}
✓ For grade ${student.grade_level} in ${skill.subject}, you need ${challengeCount} challenges
✓ Not 3 if it should be 4, not 2 if it should be 3 - EXACTLY ${challengeCount}`;

    try {
      const response = await azureOpenAIService.generateWithModel(
        'gpt4o',
        prompt,
        'You are an expert career education specialist creating immersive professional experiences.',
        { temperature: 0.8, maxTokens: 3500, jsonMode: true }
      );

      const content = JSON.parse(response);

      // Ensure we have exactly the expected number of challenges
      if (content.interactive_simulation?.challenges) {
        const actualCount = content.interactive_simulation.challenges.length;
        if (actualCount < challengeCount) {
          console.warn(`⚠️ AI returned ${actualCount} challenges but expected ${challengeCount}. Padding with additional challenges.`);

          // Pad with additional challenges
          while (content.interactive_simulation.challenges.length < challengeCount) {
            const challengeNum = content.interactive_simulation.challenges.length + 1;

            content.interactive_simulation.challenges.push({
              description: `Challenge ${challengeNum}: As a ${careerToUse}, you need to apply your ${skill.skill_name} skills. What's your approach?`,
              options: [
                `Use ${skill.skill_name} to solve this systematically`,
                `Apply what you learned in the previous challenge`,
                `Try a different ${skill.skill_name} strategy`
              ],
              correct_choice: 0,
              hint: `Remember how ${careerToUse}s use ${skill.skill_name} in their work`,
              outcome: `Great job! You successfully applied ${skill.skill_name} as a ${careerToUse} would.`,
              learning_point: `This shows how ${skill.skill_name} is essential for ${careerToUse}s in real situations.`
            });
          }

          console.log(`✅ Padded challenges array to ${challengeCount} items`);
        } else if (actualCount > challengeCount) {
          console.warn(`⚠️ AI returned ${actualCount} challenges but expected ${challengeCount}. Trimming excess.`);
          content.interactive_simulation.challenges = content.interactive_simulation.challenges.slice(0, challengeCount);
        }
      }

      console.log(`✅ Generated AI Experience content for ${skill.skill_number}`, {
        title: content.title,
        scenario: content.scenario?.substring(0, 100),
        character_context: content.character_context?.substring(0, 100),
        career_introduction: content.career_introduction?.substring(0, 100),
        challengeCount: content.interactive_simulation?.challenges?.length || 0
      });
      return content;

    } catch (error) {
      console.error(`❌ AI Experience content generation failed:`, error);
      return this.generateFallbackExperienceContent(skill, student);
    }
  }

  // Removed: generateMultiChallengeExperienceContent and generateFallbackMultiChallengeContent methods
  // These methods were not integrated into production. 
  // The system uses generateExperienceContent() for single-skill generation.

  /**
   * Generate AI-powered Discover container content
   */
  async generateDiscoverContent(
    skill: LearningSkill,
    student: StudentProfile,
    career?: { name: string; description?: string }
  ): Promise<AIDiscoverContent> {
    console.log(`🔍 Generating AI Discover content using PromptBuilder for ${skill.skill_number}: ${skill.skill_name}`, {
      career: career?.name || 'No career context'
    });

    // Get or create storyline context for continuity
    const skillKey = `${student.id}-${skill.skill_number}`;
    const storylineContext = this.getStorylineContext(skillKey, skill, career);
    
    // Build context for PromptBuilder
    const context: PromptContext = {
      container: 'DISCOVER',
      subject: skill.subject || 'Math',
      grade: student.grade_level || 'K',
      skill: {
        id: skill.skill_number,
        name: skill.skill_name,
        description: skill.skill_description,
        subject: skill.subject || 'Math'
      },
      career: {
        id: (career?.name || 'explorer').toLowerCase(),
        name: career?.name || 'Explorer',
        description: career?.description
      },
      student: {
        id: student.id,
        display_name: student.display_name || 'Student',
        grade_level: student.grade_level || 'K'
      }
    };
    
    // Generate base prompt using PromptBuilder
    const basePrompt = promptBuilder.buildPrompt(context);

    // Map career to event - matching CAREER_EVENTS from BentoDiscoverCardV2
    const careerEvents: Record<string, string> = {
      'chef': 'Cooking Competition',
      'coach': 'Championship Game',
      'veterinarian': 'Pet Clinic Open House',
      'astronaut': 'Space Camp',
      'teacher': 'Science Fair',
      'engineer': 'STEM Showcase',
      'programmer': 'Hackathon',
      'architect': 'Building Tour',
      'park-ranger': 'Nature Festival',
      'farmer': 'Harvest Festival',
      'pilot': 'Air Show'
    };

    const careerKey = career?.name?.toLowerCase().replace(/\s+/g, '-') || 'default';
    const careerEvent = careerEvents[careerKey] || 'Career Day';

    const careerContext = career ? `
CAREER EVENT SETTING: ${careerEvent}
You are attending a special ${careerEvent} where ${career.name}s showcase their skills!
This is a field trip event, NOT at Career Inc headquarters.
Frame all discoveries around what you'll see and do at the ${careerEvent}.
` : '';

    // Enhanced prompt with discovery-specific requirements
    const prompt = `${basePrompt}

FIELD TRIP EVENT:
Setting: ${careerEvent} - An exciting field trip where ${career?.name || 'professionals'} showcase their work
Discovery Focus: How ${career?.name || 'professionals'} use ${skill.skill_name} at the ${careerEvent}
Interactive Elements: Hands-on activities and demonstrations at the event

${skill.skill_name.includes('up to 3') ? `
⚠️ NUMBER LIMIT: This skill specifies "up to 3" - ALL numbers MUST be 3 or less!` : ''}

${careerContext}

REQUIRED DISCOVER CONTENT STRUCTURE:
{
  "title": "Field Trip: ${skill.skill_name} at the ${careerEvent}",
  "exploration_theme": "Discover how ${career?.name || 'professionals'} use ${skill.skill_name} at the ${careerEvent}!",
  "greeting": "Welcome to the ${careerEvent}, ${career?.name || 'Explorer'}!",
  "curiosity_questions": [
    // Generate 3-4 wonder questions about the skill at the event
    "How do ${career?.name || 'professionals'} use ${skill.skill_name} at the ${careerEvent}?",
    "What surprising ways will you see ${skill.skill_name} in action today?",
    // Add 1-2 more contextual questions
  ],
  "discovery_paths": [
    {
      "title": "Path name related to the event",
      "icon": "emoji",
      "description": "Brief description",
      "preview": "What you'll discover",
      "activities": [
        {
          "type": "exploration",
          "title": "Activity title",
          "description": "Activity description at the ${careerEvent}",
          "interactive_element": "Hands-on element",
          "learning_objective": "What you'll learn"
        }
      ]
    }
    // Generate 2-3 discovery paths
  ],
  "practice": [
    // Your existing 6 scenarios following the 3-2-1 structure
  ],
  "reflection_questions": [
    "What was the most surprising discovery at the ${careerEvent}?",
    "How will you use what you learned today?"
  ]
}

Generate the complete JSON response with ALL required fields.`;

    try {
      const response = await azureOpenAIService.generateWithModel(
        'gpt4o',
        prompt,
        'You are an expert in inquiry-based learning and discovery education.',
        { temperature: 0.8, maxTokens: 3500, jsonMode: true }
      );

      const content = JSON.parse(response);
      console.log(`✅ Generated AI Discover content for ${skill.skill_number}`, {
        title: content.title,
        exploration_theme: content.exploration_theme?.substring(0, 100),
        curiosity_questions: content.curiosity_questions?.length,
        discovery_paths: content.discovery_paths?.length
      });
      return content;

    } catch (error) {
      console.error(`❌ AI Discover content generation failed:`, error);
      return this.generateFallbackDiscoverContent(skill, student, career);
    }
  }

  // ================================================================
  // HELPER METHODS
  // ================================================================

  /**
   * Get scenario count based on grade level and complexity
   * K-2: 4 scenarios (simple, more practice)
   * 3-5: 3 scenarios (moderate complexity)
   * 6-8: 3 scenarios (deeper exploration)
   * 9-12: 2 scenarios (complex, comprehensive)
   */
  private getScenarioCount(gradeLevel: string): number {
    const grade = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);
    
    if (grade <= 2) return 4;  // K-2: More scenarios, simpler each
    if (grade <= 5) return 3;  // 3-5: Balanced
    if (grade <= 8) return 3;  // 6-8: Deeper scenarios
    return 2;                   // 9-12: Fewer but more complex
  }

  private getDefaultCareerForGrade(grade: string, subject: string): string {
    // Age-appropriate default careers by grade and subject
    const careerMap: Record<string, Record<string, string>> = {
      'K': { 'Math': 'Doctor', 'Science': 'Scientist', 'ELA': 'Teacher', 'Social Studies': 'Community Helper' },
      '1': { 'Math': 'Store Owner', 'Science': 'Veterinarian', 'ELA': 'Author', 'Social Studies': 'Police Officer' },
      '2': { 'Math': 'Builder', 'Science': 'Park Ranger', 'ELA': 'Journalist', 'Social Studies': 'Firefighter' },
      '3': { 'Math': 'Engineer', 'Science': 'Marine Biologist', 'ELA': 'Librarian', 'Social Studies': 'Mayor' },
      '4': { 'Math': 'Architect', 'Science': 'Astronomer', 'ELA': 'Editor', 'Social Studies': 'Historian' },
      '5': { 'Math': 'Accountant', 'Science': 'Chemist', 'ELA': 'Translator', 'Social Studies': 'Archaeologist' },
      '6': { 'Math': 'Data Scientist', 'Science': 'Biologist', 'ELA': 'Screenwriter', 'Social Studies': 'Diplomat' },
      '7': { 'Math': 'Financial Analyst', 'Science': 'Environmental Scientist', 'ELA': 'Poet', 'Social Studies': 'Lawyer' },
      '8': { 'Math': 'Statistician', 'Science': 'Physicist', 'ELA': 'Publisher', 'Social Studies': 'Senator' },
      '9': { 'Math': 'Cryptographer', 'Science': 'Geneticist', 'ELA': 'Literary Agent', 'Social Studies': 'Ambassador' },
      '10': { 'Math': 'Economist', 'Science': 'Neurologist', 'ELA': 'Content Strategist', 'Social Studies': 'Policy Analyst' },
      '11': { 'Math': 'Actuary', 'Science': 'Research Scientist', 'ELA': 'Communications Director', 'Social Studies': 'Campaign Manager' },
      '12': { 'Math': 'Quantitative Analyst', 'Science': 'Biomedical Engineer', 'ELA': 'Public Relations Manager', 'Social Studies': 'Political Scientist' }
    };
    
    return careerMap[grade]?.[subject] || 'Professional';
  }

  // ================================================================
  // FALLBACK CONTENT GENERATORS
  // ================================================================

  private generateFallbackLearnContent(skill: LearningSkill, student: StudentProfile, career?: any): AILearnContent {
    const skillName = skill?.skill_name || 'this concept';
    const studentName = student?.display_name || 'student';
    const subject = skill?.subject || 'learning';
    const skillNameLower = skillName?.toLowerCase() || '';
    const careerName = career?.name || this.getDefaultCareerForGrade(student.grade_level, subject);
    
    return {
      title: `${careerName} ${studentName} Masters ${skillName}`,
      greeting: `Welcome, ${careerName} ${studentName}! In your workspace today, let's explore ${skillName} together.`,
      concept: `As a ${careerName}, you use ${skillName} in ${subject} to solve real-world problems every day.`,
      examples: [
        {
          question: `Here's how we use ${skillName}`,
          answer: 'Example answer',
          explanation: 'This shows the basic concept in action.',
          visual: 'Simple diagram or illustration'
        }
      ],
      practice: [
        {
          question: `Which number comes first: 1, 2, or 3?`,
          type: 'multiple_choice',
          options: ['1', '2', '3', 'None'],
          correct_answer: 0,
          hint: 'Think about counting order!',
          explanation: 'The number 1 comes first when counting.'
        },
        {
          question: `How many dots do you see? ••`,
          type: 'counting',
          visual: '••',
          correct_answer: 2,
          hint: 'Count each dot carefully!',
          explanation: 'There are 2 dots.'
        },
        {
          question: `Is this correct? 1 + 1 = 2`,
          type: 'true_false',
          correct_answer: true,
          hint: 'Add the numbers together!',
          explanation: 'Yes, 1 + 1 equals 2.'
        },
        {
          question: `What number comes after 2?`,
          type: 'multiple_choice',
          options: ['1', '2', '3', '4'],
          correct_answer: 2,
          hint: 'Think about counting up!',
          explanation: 'The number 3 comes after 2.'
        },
        {
          question: `Count the stars: ⭐⭐⭐`,
          type: 'counting',
          visual: '⭐⭐⭐',
          correct_answer: 3,
          hint: 'Count each star!',
          explanation: 'There are 3 stars.'
        }
      ],
      assessment: {
        question: `Show what you've learned about ${skillName}!`,
        visual: skillNameLower.includes('count') ? '🎯 🎯 🎯' : undefined,
        options: skillNameLower.includes('count') ? ['1', '2', '3', '4'] : ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'],
        correct_answer: skillNameLower.includes('count') ? 2 : 0,
        hint: `Remember what you learned about ${skillName}!`,
        explanation: `Great work understanding ${skillName}!`,
        success_message: `Excellent job, ${studentName}!`
      }
    };
  }

  private generateFallbackExperienceContent(skill: LearningSkill, student: StudentProfile): AIExperienceContentLegacy {
    const careers = {
      'Math': 'Engineer',
      'Science': 'Scientist',
      'ELA': 'Writer',
      'Social Studies': 'Community Leader'
    };

    const skillName = skill?.skill_name || 'this skill';
    const subject = skill?.subject || 'learning';
    const career = careers[subject as keyof typeof careers] || 'Professional';

    // Determine number of challenges based on grade level for Experience (same logic as main method)
    // This MUST match the frontend's getScenarioCount() function
    const gradeNum = student.grade_level === 'K' ? 0 : parseInt(student.grade_level);
    let challengeCount = 2; // Default

    // Align with frontend expectations - same for ALL subjects
    if (gradeNum <= 2) {
      challengeCount = 4; // K-2: 4 challenges for all subjects
    } else if (gradeNum <= 5) {
      challengeCount = 3; // 3-5: 3 challenges
    } else if (gradeNum <= 8) {
      challengeCount = 3; // 6-8: 3 challenges
    } else {
      challengeCount = 2; // 9-12: 2 challenges
    }

    // Generate the appropriate number of challenges
    const challenges = [];
    for (let i = 1; i <= challengeCount; i++) {
      challenges.push({
        description: `Challenge ${i}: Your coworker needs help with a ${skillName} task. What's your approach?`,
        options: [
          `Use ${skillName} method A`,
          `Apply ${skillName} technique B`,
          `Try ${skillName} strategy C`
        ],
        correct_choice: i % 3, // Vary the correct answer
        hint: `Think about how ${career}s use ${skillName} in their work`,
        outcome: `Great choice! Your ${skillName} solution worked perfectly.`,
        learning_point: `You successfully used ${skillName} like a real ${career}!`
      });
    }

    return {
      title: `Your Day as a ${career}`,
      scenario: `You are a ${career} starting your workday!`,
      character_context: `Welcome! You're a professional ${career} who uses ${skillName} every day.`,
      career_introduction: `As a ${career}, you use ${skillName} to solve important problems and help people.`,
      real_world_connections: [], // Removed - no longer needed
      interactive_simulation: {
        setup: `You arrive at your ${career} job and your team has ${challengeCount} tasks for you!`,
        challenges: challenges,
        conclusion: `Amazing work today! You completed all ${challengeCount} challenges. You're thinking and working like a true ${career}.`
      }
    };
  }

  private generateFallbackDiscoverContent(skill: LearningSkill, student: StudentProfile, career?: any): AIDiscoverContent {
    const skillName = skill?.skill_name || 'this concept';
    const studentName = student?.display_name || 'Explorer';
    const subject = skill?.subject || 'learning';
    const careerName = career?.name || this.getDefaultCareerForGrade(student.grade_level, subject);

    // Map career to event
    const careerEvents: Record<string, string> = {
      'chef': 'Cooking Competition',
      'coach': 'Championship Game',
      'veterinarian': 'Pet Clinic Open House',
      'astronaut': 'Space Camp',
      'teacher': 'Science Fair'
    };
    const careerKey = careerName?.toLowerCase().replace(/\s+/g, '-') || 'default';
    const careerEvent = careerEvents[careerKey] || 'Career Day';

    return {
      title: `Field Trip: ${skillName} at the ${careerEvent}`,
      greeting: `Welcome to the ${careerEvent}, ${careerName} ${studentName}!`,
      exploration_theme: `Discover how ${careerName}s use ${skillName} at the ${careerEvent}!`,
      curiosity_questions: [
        `How do ${careerName}s use ${skillName} at the ${careerEvent}?`,
        `What surprising ways will you see ${skillName} in action today?`,
        `Where could you find ${skillName} at this event?`
      ],
      // Add practice array with 6 discovery scenarios
      practice: [
        {
          scenario_type: 'example',
          question: `At the ${careerEvent}, how many items does the ${careerName} need?`,
          type: 'multiple_choice',
          visual: '🔍',
          options: ['1 item', '2 items', '3 items', '4 items'],
          correct_answer: 2,
          hint: `Think about what ${careerName}s use at the ${careerEvent}!`,
          explanation: `${careerName}s often use 3 items at the ${careerEvent}!`,
          practiceSupport: {
            preQuestionContext: `Let's discover how ${careerName}s work at the ${careerEvent}!`,
            teachingMoment: {
              conceptExplanation: `${careerName}s use ${skillName} in their daily work!`
            }
          }
        },
        {
          scenario_type: 'example',
          question: `Which tool helps ${careerName}s at the ${careerEvent}?`,
          type: 'multiple_choice',
          visual: '⚡',
          options: ['Tool A', 'Tool B', 'Tool C', 'Tool D'],
          correct_answer: 1,
          hint: `What would ${careerName}s need most?`,
          explanation: `Tool B is perfect for ${careerName}s at events!`
        },
        {
          scenario_type: 'example',
          question: `How do ${careerName}s organize at the ${careerEvent}?`,
          type: 'multiple_choice',
          visual: '🎯',
          options: ['In groups of 1', 'In groups of 2', 'In groups of 3', 'In groups of 5'],
          correct_answer: 2,
          hint: 'Think about our number focus!',
          explanation: `Groups of 3 work perfectly at the ${careerEvent}!`
        },
        {
          scenario_type: 'practice',
          question: `${careerName} ${studentName} needs to count supplies. How many do you see? 🎈🎈🎈`,
          type: 'multiple_choice',
          visual: '🎈🎈🎈',
          options: ['1 supply', '2 supplies', '3 supplies', '4 supplies'],
          correct_answer: 2,
          hint: 'Count each balloon!',
          explanation: `Great counting! There are 3 supplies!`
        },
        {
          scenario_type: 'practice',
          question: `At the ${careerEvent}, which number helps ${careerName}s most?`,
          type: 'multiple_choice',
          visual: '🌟',
          options: ['0', '1', '2', '3'],
          correct_answer: 3,
          hint: 'What\'s our biggest number?',
          explanation: `3 is the perfect number for ${careerName}s!`
        },
        {
          scenario_type: 'assessment',
          question: `Final Challenge: How many helpers does ${careerName} ${studentName} need? 👥👥`,
          type: 'multiple_choice',
          visual: '🏆',
          options: ['No helpers', '1 helper', '2 helpers', '4 helpers'],
          correct_answer: 2,
          hint: 'Count the helper symbols!',
          explanation: `Perfect! 2 helpers makes a team of 3 with you!`,
          success_message: `Amazing discovery, ${studentName}! You understand how ${careerName}s use numbers!`
        }
      ],
      discovery_paths: [
        {
          path_name: 'Your Research Path',
          description: `You will investigate how ${skillName} appears in different places`,
          activities: [
            {
              activity_type: 'research',
              title: `Your ${skillName} Hunt`,
              instructions: `You need to find 3 places where ${skillName} is used`,
              expected_outcome: `You'll discover how common ${skillName} really is!`
            }
          ],
          reflection_questions: [
            `What was the most surprising thing you discovered?`,
            `How will you use ${skillName} differently now?`
          ]
        }
      ],
      connections: {
        to_learn: `You learned that ${skillName} helps you solve problems`,
        to_experience: `As a professional, you used ${skillName} to complete tasks`,
        to_future_learning: `Next, you might want to explore advanced ${skillName} techniques!`
      }
    };
  }

  // Helper method to generate default practice questions
  private generateDefaultPracticeQuestions(
    skill: LearningSkill, 
    student: StudentProfile, 
    career: any
  ): any[] {
    const questions = [];
    for (let i = 1; i <= 5; i++) {
      questions.push(this.generateSingleDefaultQuestion(skill, student, career, i));
    }
    return questions;
  }

  // Helper method to generate a single default question
  private generateSingleDefaultQuestion(
    skill: LearningSkill,
    student: StudentProfile,
    career: any,
    questionNum: number
  ): any {
    const gradeNum = student.grade_level === 'K' ? 0 : parseInt(student.grade_level);
    const isElementary = gradeNum <= 5;
    const careerName = career?.name || 'Professional';
    
    // Vary question types based on question number
    const questionTypes = isElementary ? 
      ['counting', 'true_false', 'multiple_choice', 'counting', 'true_false'] :
      ['multiple_choice', 'true_false', 'numeric', 'fill_blank', 'multiple_choice'];
    
    const questionType = questionTypes[questionNum - 1] || 'multiple_choice';
    
    // Generate appropriate question based on type
    switch (questionType) {
      case 'counting':
        return {
          question: `How many items does ${careerName} ${student?.display_name || 'Student'} see?`,
          type: 'counting',
          visual: '🔢'.repeat(Math.min(questionNum, 5)),
          correct_answer: Math.min(questionNum, 5),
          hint: `Count each item carefully!`,
          options: []
        };
      
      case 'true_false':
        return {
          question: `${careerName}s use ${skill?.skill_name || skill?.name || 'skills'} in their work. Is this true?`,
          type: 'true_false',
          correct_answer: true,
          hint: `Think about how ${careerName}s work`,
          options: ['True', 'False']
        };
      
      case 'multiple_choice':
        return {
          question: `Which shows ${skill?.skill_name || skill?.name || 'the concept'} correctly?`,
          type: 'multiple_choice',
          visual: '❓',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct_answer: 0,
          hint: `Look for the ${skill?.skill_name || skill?.name || 'correct'} pattern`,
          explanation: 'Option A is correct'
        };
      
      case 'numeric':
        return {
          question: `What number comes after ${questionNum}?`,
          type: 'numeric',
          visual: '🔢',
          correct_answer: questionNum + 1,
          hint: `Add one to ${questionNum}`,
          options: []
        };
      
      case 'fill_blank':
        return {
          question: `Complete: ${careerName}s use _____ to help people.`,
          type: 'fill_blank',
          visual: '✏️',
          correct_answer: skill?.skill_name || skill?.name || 'skills',
          hint: `Think about ${skill?.skill_name || skill?.name || 'the skill'}`,
          options: []
        };
      
      default:
        return {
          question: `Practice ${skill?.skill_name || skill?.name || 'question'}: Question ${questionNum}`,
          type: 'multiple_choice',
          visual: '❓',
          options: ['A', 'B', 'C', 'D'],
          correct_answer: 0,
          hint: `Think about ${skill?.skill_name || skill?.name || 'the answer'}`,
          explanation: 'Choose the best answer'
        };
    }
  }
}

// Export singleton instance
export const aiLearningJourneyService = new AILearningJourneyService();

// Export types
export type {
  StudentProfile,
  LearningSkill,
  AILearnContent,
  AIExperienceContent,
  AIDiscoverContent
};