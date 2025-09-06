"use strict";
/**
 * Question/Answer Type System - Core Definitions
 * Phase 1: Foundation Types
 *
 * This file defines the finite set of question types used throughout
 * the Pathfinity platform, ensuring consistency between AI generation
 * and UI rendering.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASIC_TYPE_IDS = exports.ALL_TYPE_IDS = exports.TYPE_DETECTION_PATTERNS = exports.GRADE_TYPE_MAP = exports.QUESTION_TYPES = exports.ValidationMethod = void 0;
exports.getTypesForGrade = getTypesForGrade;
exports.isTypeAppropriateForGrade = isTypeAppropriateForGrade;
exports.getUIComponent = getUIComponent;
exports.getValidationMethod = getValidationMethod;
var ValidationMethod;
(function (ValidationMethod) {
    ValidationMethod["EXACT_MATCH"] = "exact_match";
    ValidationMethod["NUMERIC_MATCH"] = "numeric_match";
    ValidationMethod["TEXT_MATCH"] = "text_match";
    ValidationMethod["PARTIAL_CREDIT"] = "partial_credit";
    ValidationMethod["KEYWORD_BASED"] = "keyword_based";
    ValidationMethod["RUBRIC_BASED"] = "rubric_based";
    ValidationMethod["CODE_EXECUTION"] = "code_execution";
    ValidationMethod["COMPOSITE"] = "composite";
})(ValidationMethod || (exports.ValidationMethod = ValidationMethod = {}));
// ============================================================================
// PHASE 1: BASIC QUESTION TYPES (K-5 Focus)
// ============================================================================
exports.QUESTION_TYPES = {
    // --------------------------------------------------------------------------
    // COUNTING - Visual counting for K-2
    // --------------------------------------------------------------------------
    COUNTING: {
        id: 'counting',
        displayName: 'Count Objects',
        category: 'basic',
        minGrade: 'K',
        maxGrade: '2',
        requiresRubric: false,
        aiComplexity: 'simple',
        uiComponent: 'CountingInput',
        validationMethod: ValidationMethod.NUMERIC_MATCH,
        requiredFields: ['question', 'visual', 'correct_answer'],
        optionalFields: ['hint', 'explanation'],
        careerContext: true,
        example: 'How many stethoscopes does the doctor have? 🩺🩺🩺'
    },
    // --------------------------------------------------------------------------
    // TRUE/FALSE - Binary choice for all grades
    // --------------------------------------------------------------------------
    TRUE_FALSE: {
        id: 'true_false',
        displayName: 'True or False',
        category: 'basic',
        minGrade: 'K',
        maxGrade: '12',
        requiresRubric: false,
        aiComplexity: 'simple',
        uiComponent: 'TrueFalseButtons',
        validationMethod: ValidationMethod.EXACT_MATCH,
        requiredFields: ['question', 'correct_answer'],
        optionalFields: ['visual', 'hint', 'explanation'],
        careerContext: true,
        example: 'True or False: Doctors help people stay healthy.'
    },
    // --------------------------------------------------------------------------
    // TRUE/FALSE WITH IMAGE - Binary choice with visual
    // --------------------------------------------------------------------------
    TRUE_FALSE_W_IMAGE: {
        id: 'true_false_w_image',
        displayName: 'True or False (with Image)',
        category: 'basic',
        minGrade: 'K',
        maxGrade: '12',
        requiresRubric: false,
        aiComplexity: 'simple',
        uiComponent: 'TrueFalseWithImage',
        validationMethod: ValidationMethod.EXACT_MATCH,
        requiredFields: ['question', 'correct_answer', 'visual'],
        optionalFields: ['hint', 'explanation'],
        careerContext: true,
        example: 'True or False: This picture shows a stethoscope.'
    },
    // --------------------------------------------------------------------------
    // TRUE/FALSE WITHOUT IMAGE - Binary choice text only
    // --------------------------------------------------------------------------
    TRUE_FALSE_WO_IMAGE: {
        id: 'true_false_wo_image',
        displayName: 'True or False (Text Only)',
        category: 'basic',
        minGrade: 'K',
        maxGrade: '12',
        requiresRubric: false,
        aiComplexity: 'simple',
        uiComponent: 'TrueFalseTextOnly',
        validationMethod: ValidationMethod.EXACT_MATCH,
        requiredFields: ['question', 'correct_answer'],
        optionalFields: ['hint', 'explanation'],
        careerContext: true,
        example: 'True or False: Doctors help people stay healthy.'
    },
    // --------------------------------------------------------------------------
    // MULTIPLE CHOICE - Single selection from options
    // --------------------------------------------------------------------------
    MULTIPLE_CHOICE: {
        id: 'multiple_choice',
        displayName: 'Multiple Choice',
        category: 'basic',
        minGrade: '1',
        maxGrade: '12',
        requiresRubric: false,
        aiComplexity: 'simple',
        uiComponent: 'MultipleChoiceInput',
        validationMethod: ValidationMethod.EXACT_MATCH,
        requiredFields: ['question', 'options', 'correct_answer'],
        optionalFields: ['visual', 'hint', 'explanation'],
        careerContext: true,
        example: 'What tool does a chef use to measure ingredients? a) Scale b) Hammer c) Stethoscope d) Telescope'
    },
    // --------------------------------------------------------------------------
    // NUMERIC - Number-only answers
    // --------------------------------------------------------------------------
    NUMERIC: {
        id: 'numeric',
        displayName: 'Numeric Answer',
        category: 'basic',
        minGrade: '1',
        maxGrade: '12',
        requiresRubric: false,
        aiComplexity: 'simple',
        uiComponent: 'NumericInput',
        validationMethod: ValidationMethod.NUMERIC_MATCH,
        requiredFields: ['question', 'correct_answer'],
        optionalFields: ['visual', 'hint', 'explanation', 'tolerance'],
        careerContext: true,
        example: 'If a baker needs 3 eggs for each cake and makes 4 cakes, how many eggs total?'
    },
    // --------------------------------------------------------------------------
    // FILL IN THE BLANK - Text completion
    // --------------------------------------------------------------------------
    FILL_BLANK: {
        id: 'fill_blank',
        displayName: 'Fill in the Blank',
        category: 'basic',
        minGrade: '2',
        maxGrade: '12',
        requiresRubric: false,
        aiComplexity: 'simple',
        uiComponent: 'TextInput',
        validationMethod: ValidationMethod.TEXT_MATCH,
        requiredFields: ['question', 'correct_answer'],
        optionalFields: ['visual', 'hint', 'explanation', 'acceptable_answers'],
        careerContext: true,
        example: 'A _______ uses a telescope to study stars. (astronomer)'
    }
};
// ============================================================================
// GRADE-BASED TYPE AVAILABILITY
// ============================================================================
exports.GRADE_TYPE_MAP = {
    'K': ['counting', 'true_false', 'true_false_w_image', 'true_false_wo_image'],
    '1': ['counting', 'true_false', 'true_false_w_image', 'true_false_wo_image', 'multiple_choice', 'numeric'],
    '2': ['counting', 'true_false', 'true_false_w_image', 'true_false_wo_image', 'multiple_choice', 'numeric', 'fill_blank'],
    '3': ['true_false', 'true_false_w_image', 'true_false_wo_image', 'multiple_choice', 'numeric', 'fill_blank'],
    '4': ['true_false', 'true_false_w_image', 'true_false_wo_image', 'multiple_choice', 'numeric', 'fill_blank'],
    '5': ['true_false', 'true_false_w_image', 'true_false_wo_image', 'multiple_choice', 'numeric', 'fill_blank'],
    '6': ['true_false', 'true_false_w_image', 'true_false_wo_image', 'multiple_choice', 'numeric', 'fill_blank'],
    '7': ['true_false', 'true_false_w_image', 'true_false_wo_image', 'multiple_choice', 'numeric', 'fill_blank'],
    '8': ['true_false', 'true_false_w_image', 'true_false_wo_image', 'multiple_choice', 'numeric', 'fill_blank'],
    '9': ['true_false', 'true_false_w_image', 'true_false_wo_image', 'multiple_choice', 'numeric', 'fill_blank'],
    '10': [
        'true_false', 'multiple_choice', 'numeric', 'fill_blank',
        'matching', 'ordering', 'short_answer', 'essay',
        'drag_drop', 'multi_select', 'slider', 'hotspot',
        'diagram_label', 'graph_plot', 'table_complete'
    ],
    '11': ['true_false', 'true_false_w_image', 'true_false_wo_image', 'multiple_choice', 'numeric', 'fill_blank'],
    '12': ['true_false', 'true_false_w_image', 'true_false_wo_image', 'multiple_choice', 'numeric', 'fill_blank']
};
exports.TYPE_DETECTION_PATTERNS = [
    // ABSOLUTE HIGHEST PRIORITY - True/False patterns must be checked first
    {
        pattern: /^true or false:?/i,
        type: 'true_false',
        priority: 0 // Priority 0 = highest priority
    },
    {
        pattern: /^t\/f:?/i,
        type: 'true_false',
        priority: 0 // Priority 0 = highest priority
    },
    // High priority - explicit counting indicators (but lower than true/false)
    {
        pattern: /^how many/i,
        type: 'counting',
        priority: 1,
        conditions: (q) => !!q.visual // Must have visual for counting
    },
    {
        pattern: /^count the/i,
        type: 'counting',
        priority: 1,
        conditions: (q) => !!q.visual
    },
    // Medium priority - contextual patterns
    {
        pattern: /^which of the following/i,
        type: 'multiple_choice',
        priority: 2,
        conditions: (q) => Array.isArray(q.options) && q.options.length >= 2
    },
    {
        pattern: /^select the correct/i,
        type: 'multiple_choice',
        priority: 2,
        conditions: (q) => Array.isArray(q.options) && q.options.length >= 2
    },
    {
        pattern: /_+/, // Contains blank spaces
        type: 'fill_blank',
        priority: 2
    },
    {
        pattern: /\[blank\]/i,
        type: 'fill_blank',
        priority: 2
    },
    // Lower priority - numeric patterns
    {
        pattern: /^what is \d+\s*[\+\-\*\/]/i,
        type: 'numeric',
        priority: 3
    },
    {
        pattern: /^calculate/i,
        type: 'numeric',
        priority: 3
    },
    {
        pattern: /^solve/i,
        type: 'numeric',
        priority: 3
    },
    {
        pattern: /how much|how many/i,
        type: 'numeric',
        priority: 3,
        conditions: (q) => !q.visual // If no visual, it's numeric not counting
    }
];
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Get available question types for a specific grade
 */
function getTypesForGrade(grade) {
    const availableTypeIds = exports.GRADE_TYPE_MAP[grade] || [];
    return availableTypeIds
        .map(id => exports.QUESTION_TYPES[id.toUpperCase()])
        .filter(Boolean);
}
/**
 * Check if a question type is appropriate for a grade
 */
function isTypeAppropriateForGrade(typeId, grade) {
    const availableTypes = exports.GRADE_TYPE_MAP[grade] || [];
    return availableTypes.includes(typeId.toLowerCase());
}
/**
 * Get the UI component for a question type
 */
function getUIComponent(typeId) {
    const type = exports.QUESTION_TYPES[typeId.toUpperCase()];
    return type?.uiComponent || 'UnknownQuestionType';
}
/**
 * Get validation method for a question type
 */
function getValidationMethod(typeId) {
    const type = exports.QUESTION_TYPES[typeId.toUpperCase()];
    return type?.validationMethod || ValidationMethod.EXACT_MATCH;
}
// ============================================================================
// EXPORT ALL TYPES
// ============================================================================
exports.ALL_TYPE_IDS = Object.keys(exports.QUESTION_TYPES).map(k => exports.QUESTION_TYPES[k].id);
exports.BASIC_TYPE_IDS = Object.values(exports.QUESTION_TYPES)
    .filter(t => t.category === 'basic')
    .map(t => t.id);
exports.default = exports.QUESTION_TYPES;
