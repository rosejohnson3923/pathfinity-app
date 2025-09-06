"use strict";
/**
 * QUESTION VALIDATOR - COMPREHENSIVE VALIDATION SERVICE
 *
 * Validates questions and answers with:
 * - Type-specific validation rules
 * - Answer correctness checking
 * - Partial credit calculation
 * - Error reporting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionValidator = exports.QuestionValidator = void 0;
const QuestionTypes_1 = require("./QuestionTypes");
// ================================================================
// QUESTION VALIDATOR CLASS
// ================================================================
class QuestionValidator {
    constructor() { }
    static getInstance() {
        if (!QuestionValidator.instance) {
            QuestionValidator.instance = new QuestionValidator();
        }
        return QuestionValidator.instance;
    }
    // ================================================================
    // QUESTION STRUCTURE VALIDATION
    // ================================================================
    validateQuestionStructure(question) {
        const errors = [];
        const warnings = [];
        // Basic validation
        if (!question) {
            return { isValid: false, errors: ['Question is null or undefined'] };
        }
        if (!question.id)
            errors.push('Question missing ID');
        if (!question.type)
            errors.push('Question missing type');
        if (!question.content)
            errors.push('Question missing content');
        if (!question.topic)
            warnings.push('Question missing topic');
        if (!question.difficulty)
            errors.push('Question missing difficulty');
        if (typeof question.points !== 'number')
            errors.push('Question missing or invalid points');
        // Validate difficulty
        if (question.difficulty && !['easy', 'medium', 'hard'].includes(question.difficulty)) {
            errors.push(`Invalid difficulty: ${question.difficulty}`);
        }
        // Type-specific validation
        if (question.type && errors.length === 0) {
            const typeErrors = this.validateQuestionTypeSpecific(question);
            errors.push(...typeErrors);
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings: warnings.length > 0 ? warnings : undefined
        };
    }
    validateQuestionTypeSpecific(question) {
        const errors = [];
        switch (question.type) {
            case 'multiple_choice':
                if (!Array.isArray(question.options)) {
                    errors.push('Multiple choice missing options array');
                }
                else {
                    if (question.options.length < 2) {
                        errors.push('Multiple choice needs at least 2 options');
                    }
                    const correctOptions = question.options.filter((o) => o.isCorrect);
                    if (correctOptions.length === 0) {
                        errors.push('Multiple choice needs at least one correct option');
                    }
                    if (!question.allowMultiple && correctOptions.length > 1) {
                        errors.push('Multiple choice has multiple correct options but allowMultiple is false');
                    }
                }
                break;
            case 'true_false':
                if (typeof question.correctAnswer !== 'boolean') {
                    errors.push('True/false missing or invalid correctAnswer');
                }
                if (!question.statement) {
                    errors.push('True/false missing statement');
                }
                break;
            case 'fill_blank':
                if (!Array.isArray(question.blanks)) {
                    errors.push('Fill blank missing blanks array');
                }
                else if (question.blanks.length === 0) {
                    errors.push('Fill blank needs at least one blank');
                }
                if (!question.template) {
                    errors.push('Fill blank missing template');
                }
                break;
            case 'numeric':
                if (typeof question.correctAnswer !== 'number') {
                    errors.push('Numeric question missing or invalid correctAnswer');
                }
                break;
            case 'counting':
                if (typeof question.correctCount !== 'number') {
                    errors.push('Counting question missing or invalid correctCount');
                }
                if (!question.countWhat) {
                    errors.push('Counting question missing countWhat');
                }
                break;
            case 'matching':
                if (!Array.isArray(question.leftColumn) || !Array.isArray(question.rightColumn)) {
                    errors.push('Matching question missing columns');
                }
                if (!Array.isArray(question.correctPairs)) {
                    errors.push('Matching question missing correctPairs');
                }
                break;
            case 'ordering':
                if (!Array.isArray(question.items)) {
                    errors.push('Ordering question missing items');
                }
                if (!question.orderType) {
                    errors.push('Ordering question missing orderType');
                }
                break;
            case 'classification':
                if (!Array.isArray(question.categories)) {
                    errors.push('Classification question missing categories');
                }
                if (!Array.isArray(question.items)) {
                    errors.push('Classification question missing items');
                }
                break;
        }
        return errors;
    }
    // ================================================================
    // ANSWER VALIDATION
    // ================================================================
    validateAnswer(question, userAnswer) {
        // Route to specific validator based on question type
        if ((0, QuestionTypes_1.isMultipleChoice)(question)) {
            return this.validateMultipleChoiceAnswer(question, userAnswer);
        }
        if ((0, QuestionTypes_1.isTrueFalse)(question)) {
            return this.validateTrueFalseAnswer(question, userAnswer);
        }
        if ((0, QuestionTypes_1.isFillBlank)(question)) {
            return this.validateFillBlankAnswer(question, userAnswer);
        }
        if ((0, QuestionTypes_1.isNumeric)(question)) {
            return this.validateNumericAnswer(question, userAnswer);
        }
        if ((0, QuestionTypes_1.isShortAnswer)(question)) {
            return this.validateShortAnswer(question, userAnswer);
        }
        if ((0, QuestionTypes_1.isLongAnswer)(question)) {
            return this.validateLongAnswer(question, userAnswer);
        }
        if ((0, QuestionTypes_1.isMatching)(question)) {
            return this.validateMatchingAnswer(question, userAnswer);
        }
        if ((0, QuestionTypes_1.isOrdering)(question)) {
            return this.validateOrderingAnswer(question, userAnswer);
        }
        if ((0, QuestionTypes_1.isClassification)(question)) {
            return this.validateClassificationAnswer(question, userAnswer);
        }
        if ((0, QuestionTypes_1.isVisualIdentification)(question)) {
            return this.validateVisualIdentificationAnswer(question, userAnswer);
        }
        if ((0, QuestionTypes_1.isCounting)(question)) {
            return this.validateCountingAnswer(question, userAnswer);
        }
        if ((0, QuestionTypes_1.isPatternRecognition)(question)) {
            return this.validatePatternRecognitionAnswer(question, userAnswer);
        }
        if ((0, QuestionTypes_1.isCodeCompletion)(question)) {
            return this.validateCodeCompletionAnswer(question, userAnswer);
        }
        if ((0, QuestionTypes_1.isDiagramLabeling)(question)) {
            return this.validateDiagramLabelingAnswer(question, userAnswer);
        }
        if ((0, QuestionTypes_1.isOpenEnded)(question)) {
            return this.validateOpenEndedAnswer(question, userAnswer);
        }
        return {
            isValid: false,
            score: 0,
            maxScore: question.points || 0,
            errors: ['Unknown question type']
        };
    }
    // ================================================================
    // SPECIFIC ANSWER VALIDATORS
    // ================================================================
    validateMultipleChoiceAnswer(question, userAnswer) {
        // Handle various answer formats
        let userAnswers;
        if (Array.isArray(userAnswer)) {
            userAnswers = userAnswer.map(a => String(a));
        }
        else if (typeof userAnswer === 'number') {
            // Handle index-based answers (legacy format)
            if (userAnswer >= 0 && userAnswer < question.options.length) {
                userAnswers = [question.options[userAnswer].id];
            }
            else {
                userAnswers = [String(userAnswer)];
            }
        }
        else {
            // Check if answer is an option ID or the option text itself
            const answerStr = String(userAnswer);
            const matchingOption = question.options.find(opt => opt.id === answerStr || opt.text === answerStr);
            userAnswers = matchingOption ? [matchingOption.id] : [answerStr];
        }
        const correctOptionIds = question.options
            .filter(opt => opt.isCorrect)
            .map(opt => opt.id);
        if (!question.allowMultiple && userAnswers.length > 1) {
            return {
                isValid: false,
                isCorrect: false,
                score: 0,
                maxScore: question.points,
                feedback: 'Only one answer allowed',
                errors: ['Multiple answers provided for single-choice question']
            };
        }
        // Check if question has a correct answer defined
        if (correctOptionIds.length === 0) {
            console.error('⚠️ Question has no correct answer defined:', {
                questionId: question.id,
                options: question.options
            });
            // Find the correct option text to show
            const correctOption = question.options.find(opt => opt.isCorrect);
            const correctText = correctOption ? correctOption.text : 'not defined';
            return {
                isValid: true,
                isCorrect: false,
                score: 0,
                maxScore: question.points,
                feedback: `Question validation error - correct answer: ${correctText}`
            };
        }
        const correctAnswers = userAnswers.filter(id => correctOptionIds.includes(id));
        const incorrectAnswers = userAnswers.filter(id => !correctOptionIds.includes(id));
        const isCorrect = correctAnswers.length === correctOptionIds.length &&
            incorrectAnswers.length === 0;
        const score = isCorrect ? question.points :
            (correctAnswers.length / correctOptionIds.length) * question.points * 0.5;
        // Get the correct answer text for feedback
        const correctOptionTexts = question.options
            .filter(opt => opt.isCorrect)
            .map(opt => opt.text)
            .join(', ');
        return {
            isValid: true,
            isCorrect,
            score: Math.round(score),
            maxScore: question.points,
            feedback: isCorrect ? 'Correct!' :
                `Incorrect. The correct answer is ${correctOptionTexts}`
        };
    }
    validateTrueFalseAnswer(question, userAnswer) {
        let answer;
        if (typeof userAnswer === 'boolean') {
            answer = userAnswer;
        }
        else if (typeof userAnswer === 'string') {
            // Handle various string formats
            const normalized = userAnswer.toLowerCase().trim();
            answer = normalized === 'true' || normalized === 't' || normalized === 'yes' || normalized === '1';
        }
        else if (typeof userAnswer === 'number') {
            // 0 = false, 1 = true (or any non-zero = true)  
            answer = userAnswer !== 0;
        }
        else {
            answer = false;
        }
        // Debug logging for True/False validation
        console.log('🔍 TrueFalse Validation in QuestionValidator:', {
            statement: question.statement || question.content,
            userAnswer,
            userAnswerType: typeof userAnswer,
            normalizedAnswer: answer,
            correctAnswer: question.correctAnswer,
            correctAnswerType: typeof question.correctAnswer,
            willMatch: answer === question.correctAnswer
        });
        const isCorrect = answer === question.correctAnswer;
        return {
            isValid: true,
            isCorrect,
            score: isCorrect ? question.points : 0,
            maxScore: question.points,
            feedback: isCorrect ? 'Correct!' :
                `Incorrect. The answer is ${question.correctAnswer ? 'True' : 'False'}`
        };
    }
    validateFillBlankAnswer(question, userAnswers) {
        const answers = Array.isArray(userAnswers) ?
            userAnswers :
            question.blanks.map(b => userAnswers[b.id]);
        let correctCount = 0;
        const details = [];
        question.blanks.forEach((blank, index) => {
            const userAnswer = answers[index] || '';
            const isCorrect = blank.correctAnswers.some(correct => {
                if (blank.caseSensitive) {
                    return userAnswer === correct;
                }
                return userAnswer.toLowerCase() === correct.toLowerCase();
            });
            if (isCorrect) {
                correctCount++;
                details.push(`Blank ${index + 1}: Correct`);
            }
            else {
                details.push(`Blank ${index + 1}: Incorrect`);
            }
        });
        const score = (correctCount / question.blanks.length) * question.points;
        return {
            isValid: true,
            isCorrect: correctCount === question.blanks.length,
            score: Math.round(score),
            maxScore: question.points,
            feedback: `${correctCount} of ${question.blanks.length} blanks correct`,
            partialCredit: {
                earned: correctCount,
                possible: question.blanks.length,
                details
            }
        };
    }
    validateNumericAnswer(question, userAnswer) {
        // More flexible parsing of numeric answers
        let answer;
        if (typeof userAnswer === 'string') {
            // Remove any non-numeric characters except decimal point and minus
            const cleaned = userAnswer.replace(/[^0-9.-]/g, '');
            answer = parseFloat(cleaned);
        }
        else {
            answer = userAnswer;
        }
        if (isNaN(answer)) {
            return {
                isValid: false,
                isCorrect: false,
                score: 0,
                maxScore: question.points,
                feedback: 'Please enter a valid number',
                errors: ['Answer is not a valid number']
            };
        }
        const tolerance = question.tolerance || 0.01;
        const difference = Math.abs(answer - question.correctAnswer);
        const isCorrect = difference <= tolerance;
        return {
            isValid: true,
            isCorrect,
            score: isCorrect ? question.points : 0,
            maxScore: question.points,
            feedback: isCorrect ? 'Correct!' :
                `Incorrect. Expected ${question.correctAnswer}${question.unit ? ' ' + question.unit : ''}`
        };
    }
    validateShortAnswer(question, userAnswer) {
        if (!userAnswer || userAnswer.trim().length === 0) {
            return {
                isValid: false,
                isCorrect: false,
                score: 0,
                maxScore: question.points,
                feedback: 'No answer provided'
            };
        }
        const normalizedAnswer = question.caseSensitive ?
            userAnswer.trim() :
            userAnswer.toLowerCase().trim();
        const isExactMatch = question.acceptableAnswers.some(acceptable => {
            const normalized = question.caseSensitive ?
                acceptable.trim() :
                acceptable.toLowerCase().trim();
            return normalized === normalizedAnswer;
        });
        // Check for keywords if not exact match
        let keywordScore = 0;
        if (!isExactMatch && question.keywords) {
            const foundKeywords = question.keywords.filter(keyword => normalizedAnswer.includes(keyword.toLowerCase()));
            keywordScore = (foundKeywords.length / question.keywords.length) * question.points * 0.5;
        }
        const score = isExactMatch ? question.points : keywordScore;
        return {
            isValid: true,
            isCorrect: isExactMatch,
            score: Math.round(score),
            maxScore: question.points,
            feedback: isExactMatch ? 'Correct!' :
                keywordScore > 0 ? 'Partial credit for keywords' :
                    'Incorrect answer'
        };
    }
    validateLongAnswer(question, userAnswer) {
        const wordCount = userAnswer.split(/\s+/).filter(w => w.length > 0).length;
        if (question.minWords && wordCount < question.minWords) {
            return {
                isValid: false,
                isCorrect: false,
                score: 0,
                maxScore: question.points,
                feedback: `Answer too short. Minimum ${question.minWords} words required.`,
                errors: [`Word count ${wordCount} is below minimum ${question.minWords}`]
            };
        }
        if (question.maxWords && wordCount > question.maxWords) {
            return {
                isValid: false,
                isCorrect: false,
                score: 0,
                maxScore: question.points,
                feedback: `Answer too long. Maximum ${question.maxWords} words allowed.`,
                errors: [`Word count ${wordCount} exceeds maximum ${question.maxWords}`]
            };
        }
        // For long answers, we can't auto-grade completely
        // Return partial score based on requirements met
        let score = question.points * 0.5; // Base score for attempting
        if (question.requiredElements) {
            const foundElements = question.requiredElements.filter(element => userAnswer.toLowerCase().includes(element.toLowerCase()));
            score += (foundElements.length / question.requiredElements.length) *
                (question.points * 0.5);
        }
        return {
            isValid: true,
            isCorrect: false, // Long answers need manual review
            score: Math.round(score),
            maxScore: question.points,
            feedback: 'Answer submitted. Manual review required for full grading.'
        };
    }
    validateMatchingAnswer(question, userAnswer) {
        let correctMatches = 0;
        const details = [];
        question.correctPairs.forEach(correctPair => {
            const found = userAnswer.find(pair => pair.leftId === correctPair.leftId &&
                pair.rightId === correctPair.rightId);
            if (found) {
                correctMatches++;
                details.push(`${correctPair.leftId} → ${correctPair.rightId}: Correct`);
            }
            else {
                details.push(`${correctPair.leftId} → ${correctPair.rightId}: Incorrect`);
            }
        });
        const score = question.allowPartialCredit ?
            (correctMatches / question.correctPairs.length) * question.points :
            correctMatches === question.correctPairs.length ? question.points : 0;
        return {
            isValid: true,
            isCorrect: correctMatches === question.correctPairs.length,
            score: Math.round(score),
            maxScore: question.points,
            feedback: `${correctMatches} of ${question.correctPairs.length} matches correct`,
            partialCredit: {
                earned: correctMatches,
                possible: question.correctPairs.length,
                details
            }
        };
    }
    validateOrderingAnswer(question, userAnswer) {
        let correctPositions = 0;
        const details = [];
        question.items.forEach(item => {
            const userPosition = userAnswer.indexOf(item.id);
            if (userPosition === item.correctPosition - 1) { // Positions are 1-indexed
                correctPositions++;
                details.push(`${item.text}: Correct position`);
            }
            else {
                details.push(`${item.text}: Wrong position`);
            }
        });
        const score = question.allowPartialCredit ?
            (correctPositions / question.items.length) * question.points :
            correctPositions === question.items.length ? question.points : 0;
        return {
            isValid: true,
            isCorrect: correctPositions === question.items.length,
            score: Math.round(score),
            maxScore: question.points,
            feedback: `${correctPositions} of ${question.items.length} items in correct position`,
            partialCredit: {
                earned: correctPositions,
                possible: question.items.length,
                details
            }
        };
    }
    validateClassificationAnswer(question, userAnswer) {
        let correctClassifications = 0;
        const details = [];
        question.items.forEach(item => {
            const userChoice = userAnswer.find(a => a.itemId === item.id);
            if (userChoice && userChoice.categoryId === item.correctCategoryId) {
                correctClassifications++;
                details.push(`${item.text}: Correctly classified`);
            }
            else {
                details.push(`${item.text}: Incorrectly classified`);
            }
        });
        const score = (correctClassifications / question.items.length) * question.points;
        return {
            isValid: true,
            isCorrect: correctClassifications === question.items.length,
            score: Math.round(score),
            maxScore: question.points,
            feedback: `${correctClassifications} of ${question.items.length} items correctly classified`,
            partialCredit: {
                earned: correctClassifications,
                possible: question.items.length,
                details
            }
        };
    }
    validateVisualIdentificationAnswer(question, userAnswer) {
        const correctSelections = userAnswer.filter(id => question.correctAreaIds.includes(id));
        const incorrectSelections = userAnswer.filter(id => !question.correctAreaIds.includes(id));
        const isCorrect = correctSelections.length === question.correctAreaIds.length &&
            incorrectSelections.length === 0;
        const score = isCorrect ? question.points :
            (correctSelections.length / question.correctAreaIds.length) *
                question.points * 0.7;
        return {
            isValid: true,
            isCorrect,
            score: Math.round(score),
            maxScore: question.points,
            feedback: isCorrect ? 'All areas correctly identified!' :
                `${correctSelections.length} of ${question.correctAreaIds.length} areas correct`
        };
    }
    validateCountingAnswer(question, userAnswer) {
        // More flexible parsing of numeric answers
        let answer;
        if (typeof userAnswer === 'string') {
            // Remove any non-numeric characters except decimal point
            const cleaned = userAnswer.replace(/[^0-9.-]/g, '');
            answer = parseInt(cleaned);
        }
        else {
            answer = Math.floor(userAnswer); // Ensure whole number for counting
        }
        if (isNaN(answer)) {
            return {
                isValid: false,
                isCorrect: false,
                score: 0,
                maxScore: question.points,
                feedback: 'Please enter a valid number',
                errors: ['Answer is not a valid number']
            };
        }
        const isCorrect = answer === question.correctCount;
        // Provide more helpful feedback
        let feedback;
        if (isCorrect) {
            feedback = 'Correct count!';
        }
        else if (Math.abs(answer - question.correctCount) === 1) {
            feedback = `Very close! There are ${question.correctCount} ${question.countWhat || 'items'}`;
        }
        else {
            feedback = `Incorrect. There are ${question.correctCount} ${question.countWhat || 'items'}`;
        }
        return {
            isValid: true,
            isCorrect,
            score: isCorrect ? question.points : 0,
            maxScore: question.points,
            feedback
        };
    }
    validatePatternRecognitionAnswer(question, userAnswer) {
        const isCorrect = userAnswer === question.correctAnswer;
        return {
            isValid: true,
            isCorrect,
            score: isCorrect ? question.points : 0,
            maxScore: question.points,
            feedback: isCorrect ? 'Pattern correctly identified!' :
                `Incorrect. The correct answer is ${question.correctAnswer}`
        };
    }
    validateCodeCompletionAnswer(question, userAnswer) {
        let correctBlanks = 0;
        const details = [];
        question.blanks.forEach(blank => {
            const userCode = userAnswer[blank.id] || '';
            const isCorrect = userCode.trim() === blank.correctCode.trim() ||
                (blank.alternatives &&
                    blank.alternatives.some(alt => userCode.trim() === alt.trim()));
            if (isCorrect) {
                correctBlanks++;
                details.push(`Line ${blank.lineNumber}: Correct`);
            }
            else {
                details.push(`Line ${blank.lineNumber}: Incorrect`);
            }
        });
        const score = (correctBlanks / question.blanks.length) * question.points;
        return {
            isValid: true,
            isCorrect: correctBlanks === question.blanks.length,
            score: Math.round(score),
            maxScore: question.points,
            feedback: `${correctBlanks} of ${question.blanks.length} code blanks correct`,
            partialCredit: {
                earned: correctBlanks,
                possible: question.blanks.length,
                details
            }
        };
    }
    validateDiagramLabelingAnswer(question, userAnswer) {
        let correctLabels = 0;
        const details = [];
        question.labelPoints.forEach(point => {
            const userLabel = userAnswer.find(a => a.pointId === point.id);
            if (userLabel) {
                const isCorrect = userLabel.label === point.correctLabel ||
                    (point.acceptableLabels &&
                        point.acceptableLabels.includes(userLabel.label));
                if (isCorrect) {
                    correctLabels++;
                    details.push(`Point ${point.id}: Correctly labeled`);
                }
                else {
                    details.push(`Point ${point.id}: Incorrect label`);
                }
            }
            else {
                details.push(`Point ${point.id}: Not labeled`);
            }
        });
        const score = (correctLabels / question.labelPoints.length) * question.points;
        return {
            isValid: true,
            isCorrect: correctLabels === question.labelPoints.length,
            score: Math.round(score),
            maxScore: question.points,
            feedback: `${correctLabels} of ${question.labelPoints.length} points correctly labeled`,
            partialCredit: {
                earned: correctLabels,
                possible: question.labelPoints.length,
                details
            }
        };
    }
    validateOpenEndedAnswer(question, userAnswer) {
        // Open-ended questions can't be auto-graded
        // Just validate that an answer was provided
        const hasAnswer = userAnswer && userAnswer.trim().length > 0;
        return {
            isValid: hasAnswer,
            isCorrect: false, // Requires manual review
            score: hasAnswer ? question.points * 0.1 : 0, // Small participation score
            maxScore: question.points,
            feedback: hasAnswer ?
                'Answer submitted. Manual review required.' :
                'No answer provided',
            errors: hasAnswer ? undefined : ['No answer provided']
        };
    }
    // ================================================================
    // BATCH VALIDATION
    // ================================================================
    validateAnswerSet(questions, userAnswers) {
        const results = new Map();
        let totalScore = 0;
        let maxScore = 0;
        questions.forEach(question => {
            const userAnswer = userAnswers[question.id];
            const result = this.validateAnswer(question, userAnswer);
            results.set(question.id, result);
            totalScore += result.score;
            maxScore += result.maxScore;
        });
        return {
            totalScore,
            maxScore,
            percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
            results
        };
    }
}
exports.QuestionValidator = QuestionValidator;
// ================================================================
// EXPORT SINGLETON INSTANCE
// ================================================================
exports.questionValidator = QuestionValidator.getInstance();
