"use strict";
/**
 * QUESTION TYPE SYSTEM - PHASE 1 FOUNDATION
 *
 * This file defines the complete type-safe question system with:
 * - BaseQuestion interface for common properties
 * - 15 discriminated union types for specific question formats
 * - Type guards for runtime validation
 * - Proper TypeScript type safety
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMultipleChoice = isMultipleChoice;
exports.isTrueFalse = isTrueFalse;
exports.isFillBlank = isFillBlank;
exports.isNumeric = isNumeric;
exports.isShortAnswer = isShortAnswer;
exports.isLongAnswer = isLongAnswer;
exports.isMatching = isMatching;
exports.isOrdering = isOrdering;
exports.isClassification = isClassification;
exports.isVisualIdentification = isVisualIdentification;
exports.isCounting = isCounting;
exports.isPatternRecognition = isPatternRecognition;
exports.isCodeCompletion = isCodeCompletion;
exports.isDiagramLabeling = isDiagramLabeling;
exports.isOpenEnded = isOpenEnded;
exports.adjustDifficultyForGrade = adjustDifficultyForGrade;
exports.validateQuestion = validateQuestion;
// ================================================================
// TYPE GUARDS
// ================================================================
function isMultipleChoice(question) {
    return question.type === 'multiple_choice';
}
function isTrueFalse(question) {
    return question.type === 'true_false';
}
function isFillBlank(question) {
    return question.type === 'fill_blank';
}
function isNumeric(question) {
    return question.type === 'numeric';
}
function isShortAnswer(question) {
    return question.type === 'short_answer';
}
function isLongAnswer(question) {
    return question.type === 'long_answer';
}
function isMatching(question) {
    return question.type === 'matching';
}
function isOrdering(question) {
    return question.type === 'ordering';
}
function isClassification(question) {
    return question.type === 'classification';
}
function isVisualIdentification(question) {
    return question.type === 'visual_identification';
}
function isCounting(question) {
    return question.type === 'counting';
}
function isPatternRecognition(question) {
    return question.type === 'pattern_recognition';
}
function isCodeCompletion(question) {
    return question.type === 'code_completion';
}
function isDiagramLabeling(question) {
    return question.type === 'diagram_labeling';
}
function isOpenEnded(question) {
    return question.type === 'open_ended';
}
// ================================================================
// QUESTION DIFFICULTY HELPERS
// ================================================================
function adjustDifficultyForGrade(question, gradeLevel) {
    const gradeNum = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);
    // Adjust difficulty based on grade
    if (gradeNum <= 2) {
        return { ...question, difficulty: 'easy' };
    }
    else if (gradeNum <= 5) {
        return { ...question, difficulty: 'medium' };
    }
    else {
        return { ...question, difficulty: 'hard' };
    }
}
// ================================================================
// QUESTION VALIDATION HELPERS
// ================================================================
function validateQuestion(question) {
    // Basic validation
    if (!question || typeof question !== 'object')
        return false;
    if (!question.id || !question.type || !question.content)
        return false;
    if (!question.difficulty || !['easy', 'medium', 'hard'].includes(question.difficulty))
        return false;
    if (typeof question.points !== 'number' || question.points < 0)
        return false;
    // Type-specific validation
    switch (question.type) {
        case 'multiple_choice':
            return validateMultipleChoice(question);
        case 'true_false':
            return validateTrueFalse(question);
        case 'fill_blank':
            return validateFillBlank(question);
        case 'numeric':
            return validateNumeric(question);
        case 'counting':
            return validateCounting(question);
        // Add more specific validators as needed
        default:
            return true; // Basic validation passed
    }
}
function validateMultipleChoice(q) {
    return Array.isArray(q.options) &&
        q.options.length >= 2 &&
        q.options.some((o) => o.isCorrect === true);
}
function validateTrueFalse(q) {
    return typeof q.correctAnswer === 'boolean' &&
        typeof q.statement === 'string';
}
function validateFillBlank(q) {
    return Array.isArray(q.blanks) &&
        q.blanks.length > 0 &&
        typeof q.template === 'string';
}
function validateNumeric(q) {
    return typeof q.correctAnswer === 'number';
}
function validateCounting(q) {
    return typeof q.correctCount === 'number' &&
        typeof q.countWhat === 'string';
}
// ================================================================
// EXPORT SUMMARY
// ================================================================
exports.default = {
    // Type Guards
    isMultipleChoice,
    isTrueFalse,
    isFillBlank,
    isNumeric,
    isShortAnswer,
    isLongAnswer,
    isMatching,
    isOrdering,
    isClassification,
    isVisualIdentification,
    isCounting,
    isPatternRecognition,
    isCodeCompletion,
    isDiagramLabeling,
    isOpenEnded,
    // Helpers
    adjustDifficultyForGrade,
    validateQuestion
};
