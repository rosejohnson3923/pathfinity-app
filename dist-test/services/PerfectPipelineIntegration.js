"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.perfectPipeline = exports.PerfectPipelineIntegration = void 0;
exports.testProblematicScenario = testProblematicScenario;
const PerfectQuestionTemplate_1 = require("./PerfectQuestionTemplate");
const AIContentConverter_1 = require("./content/AIContentConverter");
const UnifiedQuestionAnswerService_1 = require("./UnifiedQuestionAnswerService");
const QuestionValidator_1 = require("./content/QuestionValidator");
const QuestionTypeRotationService_1 = require("./QuestionTypeRotationService");
const PromptArchitecture_1 = require("./prompts/PromptArchitecture");
const AzureOpenAIService_1 = require("./AzureOpenAIService");
/**
 * The Perfect Pipeline that handles everything automatically
 */
class PerfectPipelineIntegration {
    constructor() {
        this.converter = AIContentConverter_1.aiContentConverter;
        this.rotationService = QuestionTypeRotationService_1.questionTypeRotationService;
        // rotationService is already initialized as singleton
    }
    static getInstance() {
        if (!PerfectPipelineIntegration.instance) {
            PerfectPipelineIntegration.instance = new PerfectPipelineIntegration();
        }
        return PerfectPipelineIntegration.instance;
    }
    /**
     * Complete pipeline from user selection to feedback
     */
    async runCompletePipeline(userSelection, systemContext, userAnswer) {
        const result = {
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
            const aiContent = await this.generateAIContent(userSelection, systemContext);
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
                const feedback = this.generateFeedback(converted, userAnswer, validationResult, userSelection.career);
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
        }
        catch (error) {
            console.error('Pipeline error:', error);
            result.error = error instanceof Error ? error.message : String(error);
            return result;
        }
    }
    /**
     * Generate AI content based on user selection and system context
     */
    async generateAIContent(userSelection, systemContext, retryCount = 0) {
        const maxRetries = 3;
        // Determine appropriate question type based on context
        const questionType = this.selectQuestionType(userSelection.gradeLevel, systemContext.subject, systemContext.skillName);
        // Use MODULAR prompt system instead of single template
        const modularPrompt = PromptArchitecture_1.modularPromptSystem.assemblePrompt({
            gradeLevel: userSelection.gradeLevel,
            career: userSelection.career,
            subject: systemContext.subject,
            skillName: systemContext.skillName,
            skillId: systemContext.skillId,
            questionType: questionType
        });
        console.log('📝 Using modular prompt system');
        console.log(`  Components: Grade ${userSelection.gradeLevel}, ${userSelection.career}, ${systemContext.subject}, ${systemContext.skillName}`);
        try {
            // Call Azure OpenAI with modular prompt
            const aiResponse = await AzureOpenAIService_1.azureOpenAIService.generateContent(modularPrompt, {
                temperature: 0.7,
                max_tokens: 500,
                response_format: { type: 'json_object' }
            });
            // Parse response
            let parsedResponse;
            try {
                parsedResponse = typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse;
            }
            catch (e) {
                console.error('Failed to parse AI response:', e);
                parsedResponse = { error: 'Invalid JSON response' };
            }
            // Validate the response
            const validation = PerfectQuestionTemplate_1.perfectTemplate.validatePipeline(parsedResponse, questionType);
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
                // Check for skill relevance
                const skillWords = systemContext.skillName.toLowerCase().split(' ');
                const hasRelevance = skillWords.some(word => q.includes(word) || (parsedResponse.topic && parsedResponse.topic.toLowerCase().includes(word)));
                if (!hasRelevance && retryCount < maxRetries) {
                    console.warn('🚨 Question not relevant to skill, retrying...');
                    return this.generateAIContent(userSelection, systemContext, retryCount + 1);
                }
            }
            return validation.fixed || parsedResponse;
        }
        catch (error) {
            console.error('AI generation error:', error);
            // Fallback to template if AI fails
            if (retryCount >= maxRetries) {
                console.warn('⚠️ Falling back to template after max retries');
                const template = PerfectQuestionTemplate_1.PERFECT_QUESTION_TEMPLATES[questionType];
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
    selectQuestionType(gradeLevel, subject, skillName) {
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
        const types = this.rotationService.getQuestionTypesForSkill(skillName, subject, 1);
        return types[0] || 'multiple_choice';
    }
    /**
     * Convert AI content to question format
     */
    convertContent(aiContent, systemContext) {
        try {
            const skillInfo = {
                skill_name: systemContext.skillName,
                skill_number: systemContext.skillId,
                subject: systemContext.subject,
                grade: aiContent.grade || '5'
            };
            return this.converter.convertAssessment(aiContent, skillInfo);
        }
        catch (error) {
            console.error('Conversion error:', error);
            return null;
        }
    }
    /**
     * Prepare data for rendering
     */
    prepareRenderData(question) {
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
    validateAnswer(question, userAnswer) {
        // Use question validator for comprehensive validation
        const validationResult = QuestionValidator_1.questionValidator.validateAnswer(question, userAnswer);
        // Also get the correct answer for display
        const correctAnswerInfo = UnifiedQuestionAnswerService_1.unifiedAnswerService.getCorrectAnswer(question);
        return {
            ...validationResult,
            correctAnswerDisplay: correctAnswerInfo.displayValue,
            correctAnswerValue: correctAnswerInfo.rawValue
        };
    }
    /**
     * Generate appropriate feedback
     */
    generateFeedback(question, userAnswer, validationResult, career) {
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
        }
        else {
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
    async testAllQuestionTypes() {
        const results = {};
        const types = Object.keys(PerfectQuestionTemplate_1.PERFECT_QUESTION_TEMPLATES);
        for (const type of types) {
            console.log(`\nTesting ${type}...`);
            // Mock user selection
            const userSelection = {
                gradeLevel: '5',
                career: 'Engineer'
            };
            // Mock system context
            const systemContext = {
                subject: 'Math',
                skillName: `Testing ${type} questions`,
                skillId: `TEST.${type}`
            };
            // Mock user answer (wrong answer to test feedback)
            const mockAnswer = this.getMockAnswer(type, false);
            // Run pipeline
            const result = await this.runCompletePipeline(userSelection, systemContext, mockAnswer);
            results[type] = result;
        }
        return results;
    }
    /**
     * Get mock answer for testing
     */
    getMockAnswer(questionType, correct = true) {
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
exports.PerfectPipelineIntegration = PerfectPipelineIntegration;
// Export singleton instance
exports.perfectPipeline = PerfectPipelineIntegration.getInstance();
/**
 * Quick test function for the problematic scenario
 */
async function testProblematicScenario() {
    console.log('\n🔍 Testing Problematic Scenario');
    console.log('Question: "Which is the largest balance?"');
    console.log('This should be multiple_choice, NOT counting\n');
    const pipeline = PerfectPipelineIntegration.getInstance();
    const userSelection = {
        gradeLevel: '5',
        career: 'Lawyer'
    };
    const systemContext = {
        subject: 'Math',
        skillName: 'Comparing positive and negative numbers',
        skillId: 'MATH.5.NBT.3'
    };
    // User selects "200" which is correct
    const userAnswer = 1; // Index of "200" in options
    const result = await pipeline.runCompletePipeline(userSelection, systemContext, userAnswer);
    if (result.success && result.feedback?.includes('200')) {
        console.log('✨ SUCCESS! The problematic scenario works perfectly!');
        console.log('Feedback:', result.feedback);
    }
    else {
        console.log('❌ Issue remains:', result.error || 'Unknown error');
    }
    return result;
}
