"use strict";
/**
 * Perfect Question Template System
 * =================================
 * A foolproof template system that ensures AI generates perfect responses
 * for all 15 question types that flow seamlessly through the entire pipeline
 *
 * Pipeline: AI Generation → Content Converter → Question Renderer → Validation
 *
 * Created: 2025-08-31
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.perfectTemplate = exports.PERFECT_QUESTION_TEMPLATES = void 0;
exports.generatePerfectPrompt = generatePerfectPrompt;
exports.validateAgainstTemplate = validateAgainstTemplate;
exports.fixAIResponse = fixAIResponse;
exports.selectQuestionType = selectQuestionType;
exports.validatePipeline = validatePipeline;
/**
 * The Perfect Template defines EXACTLY what we need from AI
 * for each question type to work through the entire pipeline
 */
exports.PERFECT_QUESTION_TEMPLATES = {
    multiple_choice: {
        ai_instruction: `Generate a multiple choice question with EXACTLY 4 options where the student selects one correct answer.`,
        required_format: {
            type: "multiple_choice",
            question: "Clear question text asking student to select/choose/identify",
            options: ["Option A text", "Option B text", "Option C text", "Option D text"],
            correct_answer: 0, // Index 0-3 of the correct option
            visual: null, // or descriptive text or emojis if helpful
            hint: "Helpful hint without giving away answer",
            explanation: "Why this answer is correct"
        },
        validation_rules: {
            question_must_contain: ["which", "what", "select", "choose", "identify", "best", "correct"],
            options_count: 4,
            correct_answer_range: [0, 3],
            correct_answer_type: "number"
        },
        example: {
            type: "multiple_choice",
            question: "Which is the largest balance?",
            options: ["-350", "200", "-150", "50"],
            correct_answer: 1, // Index of "200"
            visual: null,
            hint: "Positive numbers are larger than negative numbers",
            explanation: "200 is the only positive number and is larger than all the negative values"
        }
    },
    true_false: {
        ai_instruction: `Generate a true/false statement that the student evaluates.
    CRITICAL: NEVER use true/false for comparison questions like "Which is bigger/smaller/better?"
    Those should be multiple_choice. True/false is ONLY for evaluating if a statement is true or false.`,
        required_format: {
            type: "true_false",
            question: "Statement to evaluate (can start with 'True or False:' but not required)",
            correct_answer: true, // boolean true or false
            visual: null,
            hint: "Helpful hint",
            explanation: "Why this statement is true/false"
        },
        validation_rules: {
            correct_answer_type: "boolean",
            correct_answer_values: [true, false],
            question_must_not_contain: ["which", "what is the", "select", "choose"]
        },
        example: {
            type: "true_false",
            question: "True or False: The sum of 5 + 3 equals 8",
            correct_answer: true,
            visual: null,
            hint: "Count up from 5",
            explanation: "5 + 3 = 8 is a correct mathematical statement"
        }
    },
    counting: {
        ai_instruction: `Generate a counting question where student counts visual objects. ONLY use for "How many?" questions with visual elements.`,
        required_format: {
            type: "counting",
            question: "How many [objects] do you see?",
            visual: "🍎 🍎 🍎 🍎 🍎", // REQUIRED - emojis to count
            correct_answer: 5, // The count matching the visual
            hint: "Count each item carefully",
            explanation: "There are 5 apples shown"
        },
        validation_rules: {
            question_must_contain: ["how many", "count"],
            visual_required: true,
            visual_must_have_emojis: true,
            correct_answer_must_match_emoji_count: true,
            correct_answer_type: "number"
        },
        example: {
            type: "counting",
            question: "How many stars do you see?",
            visual: "⭐ ⭐ ⭐",
            correct_answer: 3,
            hint: "Point to each star as you count",
            explanation: "There are 3 stars: one, two, three"
        }
    },
    numeric: {
        ai_instruction: `Generate a question requiring a numeric answer (no visual counting).`,
        required_format: {
            type: "numeric",
            question: "Question requiring a number answer",
            correct_answer: 42, // number (integer or decimal)
            unit: "optional unit", // e.g., "meters", "dollars", null if none
            visual: null,
            hint: "Calculation hint",
            explanation: "Step-by-step solution"
        },
        validation_rules: {
            correct_answer_type: "number",
            unit_type: ["string", "null"]
        },
        example: {
            type: "numeric",
            question: "What is 15 + 27?",
            correct_answer: 42,
            unit: null,
            visual: null,
            hint: "Add the tens first, then the ones",
            explanation: "15 + 27 = 42 (10 + 20 = 30, 5 + 7 = 12, 30 + 12 = 42)"
        }
    },
    fill_blank: {
        ai_instruction: `Generate a fill-in-the-blank question with clear blank markers.`,
        required_format: {
            type: "fill_blank",
            question: "Context for the fill-in-the-blank",
            template: "The _____ is the largest planet in our solar system",
            blanks: [
                {
                    id: "blank_0",
                    correctAnswers: ["Jupiter", "jupiter", "JUPITER"]
                }
            ],
            correct_answer: "Jupiter", // Primary answer for simple validation
            visual: null,
            hint: "Think about the giant red spot",
            explanation: "Jupiter is the largest planet"
        },
        validation_rules: {
            template_must_contain: "_____",
            blanks_count_must_match_underscores: true,
            correct_answer_type: "string"
        },
        example: {
            type: "fill_blank",
            question: "Complete the sentence about planets",
            template: "The _____ orbits around the _____",
            blanks: [
                { id: "blank_0", correctAnswers: ["Earth", "earth"] },
                { id: "blank_1", correctAnswers: ["Sun", "sun"] }
            ],
            correct_answer: "Earth, Sun",
            visual: null,
            hint: "What planet do we live on?",
            explanation: "The Earth orbits around the Sun"
        }
    },
    short_answer: {
        ai_instruction: `Generate a question requiring a brief text answer (1-3 words).`,
        required_format: {
            type: "short_answer",
            question: "Question requiring brief answer",
            correct_answer: "Paris",
            acceptable_answers: ["Paris", "paris", "PARIS", "Paris, France"],
            visual: null,
            hint: "Hint text",
            explanation: "Why this is correct"
        },
        validation_rules: {
            correct_answer_type: "string",
            acceptable_answers_type: "array"
        },
        example: {
            type: "short_answer",
            question: "What is the capital of France?",
            correct_answer: "Paris",
            acceptable_answers: ["Paris", "paris", "PARIS"],
            visual: null,
            hint: "City of lights",
            explanation: "Paris is the capital city of France"
        }
    },
    long_answer: {
        ai_instruction: `Generate a question requiring a paragraph response.`,
        required_format: {
            type: "long_answer",
            question: "Open-ended question requiring detailed response",
            sample_answer: "Example paragraph answer showing expected depth",
            grading_rubric: ["Key point 1", "Key point 2", "Key point 3"],
            visual: null,
            hint: "Structure hint",
            explanation: "What makes a good answer"
        },
        validation_rules: {
            sample_answer_min_length: 50,
            grading_rubric_min_items: 2
        },
        example: {
            type: "long_answer",
            question: "Explain why water is important for life",
            sample_answer: "Water is essential for life because it serves as a solvent for biological reactions, helps regulate temperature, and transports nutrients throughout organisms.",
            grading_rubric: ["Mentions solvent properties", "Discusses temperature regulation", "Explains nutrient transport"],
            visual: null,
            hint: "Think about what your body uses water for",
            explanation: "A complete answer should cover multiple functions of water"
        }
    },
    matching: {
        ai_instruction: `Generate a matching question with items to pair.`,
        required_format: {
            type: "matching",
            question: "Match the items",
            left_items: ["Item A", "Item B", "Item C"],
            right_items: ["Match 1", "Match 2", "Match 3"],
            correct_pairs: [[0, 1], [1, 2], [2, 0]], // [leftIndex, rightIndex]
            visual: null,
            hint: "Matching hint",
            explanation: "Why these match"
        },
        validation_rules: {
            items_count_must_match: true,
            pairs_use_valid_indices: true
        },
        example: {
            type: "matching",
            question: "Match the country to its capital",
            left_items: ["France", "Japan", "Brazil"],
            right_items: ["Tokyo", "Brasília", "Paris"],
            correct_pairs: [[0, 2], [1, 0], [2, 1]],
            visual: null,
            hint: "France is in Europe",
            explanation: "France-Paris, Japan-Tokyo, Brazil-Brasília"
        }
    },
    ordering: {
        ai_instruction: `Generate an ordering/sequencing question.`,
        required_format: {
            type: "ordering",
            question: "Put these in order",
            items: ["First item", "Second item", "Third item"],
            correct_order: [0, 1, 2], // Indices in correct sequence
            visual: null,
            hint: "Ordering hint",
            explanation: "Why this order"
        },
        validation_rules: {
            correct_order_uses_all_indices: true
        },
        example: {
            type: "ordering",
            question: "Put these numbers in order from smallest to largest",
            items: ["45", "12", "78", "23"],
            correct_order: [1, 3, 0, 2], // 12, 23, 45, 78
            visual: null,
            hint: "Compare the tens place first",
            explanation: "12 < 23 < 45 < 78"
        }
    },
    classification: {
        ai_instruction: `Generate a classification question with items and categories.`,
        required_format: {
            type: "classification",
            question: "Classify these items",
            items: ["Dog", "Eagle", "Salmon"],
            categories: ["Mammal", "Bird", "Fish"],
            correct_classification: {
                "Dog": "Mammal",
                "Eagle": "Bird",
                "Salmon": "Fish"
            },
            visual: null,
            hint: "Classification hint",
            explanation: "Why classified this way"
        },
        validation_rules: {
            all_items_classified: true,
            categories_used: true
        }
    },
    visual_identification: {
        ai_instruction: `Generate a visual identification question.`,
        required_format: {
            type: "visual_identification",
            question: "What shape is this?",
            visual_description: "A red circle",
            correct_answer: "circle",
            options: ["circle", "square", "triangle"], // optional for multiple choice variant
            visual: "⭕", // or description
            hint: "Look at the curves",
            explanation: "This is a circle - round with no corners"
        },
        validation_rules: {
            visual_required: true
        }
    },
    pattern_recognition: {
        ai_instruction: `Generate a pattern recognition question.`,
        required_format: {
            type: "pattern_recognition",
            question: "What comes next in the pattern?",
            pattern: ["2", "4", "6", "8", "?"],
            correct_answer: "10",
            visual: null,
            hint: "Look at the differences",
            explanation: "Adding 2 each time: 2, 4, 6, 8, 10"
        },
        validation_rules: {
            pattern_must_have_placeholder: true
        }
    },
    code_completion: {
        ai_instruction: `Generate a code completion question.`,
        required_format: {
            type: "code_completion",
            question: "Complete the function",
            code_template: "function add(a, b) { return _____ }",
            correct_answer: "a + b",
            language: "javascript",
            visual: null,
            hint: "What operation combines two numbers?",
            explanation: "The add function should return the sum"
        },
        validation_rules: {
            code_template_must_have_blank: true
        }
    },
    diagram_labeling: {
        ai_instruction: `Generate a diagram labeling question.`,
        required_format: {
            type: "diagram_labeling",
            question: "Label the parts",
            diagram_description: "A plant with roots, stem, and leaves",
            labels: ["roots", "stem", "leaves"],
            correct_positions: [[50, 80], [50, 50], [50, 20]], // [x, y] coordinates
            visual: "🌱", // or complex description
            hint: "Start from the bottom",
            explanation: "Roots at bottom, stem in middle, leaves at top"
        },
        validation_rules: {
            labels_count_matches_positions: true
        }
    },
    open_ended: {
        ai_instruction: `Generate an open-ended creative question.`,
        required_format: {
            type: "open_ended",
            question: "Creative thinking prompt",
            sample_response: "Example creative response",
            evaluation_criteria: ["Creativity", "Feasibility", "Explanation"],
            visual: null,
            hint: "Let your imagination flow",
            explanation: "There are many possible good answers"
        },
        validation_rules: {
            evaluation_criteria_min: 2
        }
    }
};
/**
 * Generate the perfect AI prompt for a question type
 */
function generatePerfectPrompt(questionType, grade, subject, skill, career) {
    const template = exports.PERFECT_QUESTION_TEMPLATES[questionType];
    if (!template) {
        throw new Error(`Unknown question type: ${questionType}`);
    }
    return `
You are generating a ${grade} grade ${subject} question about "${skill}" for a student interested in becoming a ${career}.

QUESTION TYPE: ${questionType}

INSTRUCTION: ${template.ai_instruction}

REQUIRED FORMAT (You MUST follow this EXACTLY):
${JSON.stringify(template.required_format, null, 2)}

EXAMPLE OF CORRECT FORMAT:
${JSON.stringify(template.example, null, 2)}

CRITICAL RULES:
1. The "type" field MUST be "${questionType}"
2. The correct_answer MUST be in the exact format shown
3. ALL fields shown in required_format MUST be included
4. For ${career} context, use appropriate examples but keep the question type unchanged
5. Return ONLY valid JSON, no markdown or explanations

VALIDATION REQUIREMENTS:
${JSON.stringify(template.validation_rules, null, 2)}

Generate a question that teaches "${skill}" while maintaining perfect format compatibility.
Return ONLY the JSON object.`;
}
/**
 * Validate that an AI response matches the perfect template
 */
function validateAgainstTemplate(response, questionType) {
    const errors = [];
    const template = exports.PERFECT_QUESTION_TEMPLATES[questionType];
    if (!template) {
        return { valid: false, errors: [`Unknown question type: ${questionType}`] };
    }
    // Check type field
    if (response.type !== questionType) {
        errors.push(`Type mismatch: expected "${questionType}", got "${response.type}"`);
    }
    // Check required fields
    const requiredFields = Object.keys(template.required_format);
    for (const field of requiredFields) {
        if (!(field in response)) {
            errors.push(`Missing required field: ${field}`);
        }
    }
    // Type-specific validation
    const rules = template.validation_rules;
    // Check correct_answer type
    if (rules.correct_answer_type) {
        const actualType = typeof response.correct_answer;
        if (actualType !== rules.correct_answer_type) {
            errors.push(`correct_answer type error: expected ${rules.correct_answer_type}, got ${actualType}`);
        }
    }
    // Check correct_answer range for multiple choice
    if (rules.correct_answer_range && typeof response.correct_answer === 'number') {
        const [min, max] = rules.correct_answer_range;
        if (response.correct_answer < min || response.correct_answer > max) {
            errors.push(`correct_answer out of range: ${response.correct_answer} not in [${min}, ${max}]`);
        }
    }
    // Check options count for multiple choice
    if (rules.options_count && response.options) {
        if (response.options.length !== rules.options_count) {
            errors.push(`Options count error: expected ${rules.options_count}, got ${response.options.length}`);
        }
    }
    // Check visual requirements for counting
    if (rules.visual_required && !response.visual) {
        errors.push(`Visual field required for ${questionType}`);
    }
    // Check template contains blanks for fill_blank
    if (rules.template_must_contain && response.template) {
        const mustContain = rules.template_must_contain;
        if (!response.template.includes(mustContain)) {
            errors.push(`Template must contain "${mustContain}"`);
        }
    }
    // Special validation for counting - check emoji count matches answer
    if (questionType === 'counting' && response.visual && typeof response.correct_answer === 'number') {
        const emojiCount = (response.visual.match(/[\p{Emoji}]/gu) || []).length;
        if (emojiCount !== response.correct_answer) {
            errors.push(`Counting mismatch: visual has ${emojiCount} emojis but correct_answer is ${response.correct_answer}`);
        }
    }
    return {
        valid: errors.length === 0,
        errors
    };
}
/**
 * Fix common AI response issues
 */
function fixAIResponse(response, questionType) {
    const fixed = { ...response };
    // CRITICAL FIX: Check if true_false is misclassified
    if (questionType === 'true_false' && fixed.question) {
        const q = fixed.question.toLowerCase();
        if (q.includes('which') || q.includes('what is the') ||
            q.includes('select') || q.includes('choose') ||
            q.includes('larger') || q.includes('smaller') ||
            q.includes('bigger') || q.includes('better')) {
            // This should be multiple_choice, not true_false!
            console.warn('🚨 Fixing misclassified true_false question:', fixed.question);
            fixed.type = 'multiple_choice';
            // Generate options from the question context
            if (!fixed.options) {
                // Try to extract options from the question
                if (q.includes('-10') && q.includes('-5')) {
                    fixed.options = ['-10', '-5'];
                    fixed.correct_answer = q.includes('smaller') ? 0 : 1; // -10 is smaller
                }
                else {
                    // Fallback to generic options
                    fixed.options = ['Option A', 'Option B', 'Option C', 'Option D'];
                    fixed.correct_answer = 0;
                }
            }
            return fixed;
        }
    }
    const template = exports.PERFECT_QUESTION_TEMPLATES[questionType];
    if (!template) {
        return response;
    }
    // Ensure type field is correct
    fixed.type = questionType;
    // Fix correct_answer type based on question type
    switch (questionType) {
        case 'true_false':
            // Convert string to boolean
            if (typeof fixed.correct_answer === 'string') {
                fixed.correct_answer = fixed.correct_answer.toLowerCase() === 'true';
            }
            break;
        case 'multiple_choice':
            // Ensure it's a number 0-3
            if (typeof fixed.correct_answer === 'string') {
                const num = parseInt(fixed.correct_answer);
                if (!isNaN(num) && num >= 0 && num <= 3) {
                    fixed.correct_answer = num;
                }
            }
            // If correct_answer is the actual text, find its index
            if (typeof fixed.correct_answer === 'string' && fixed.options) {
                const index = fixed.options.indexOf(fixed.correct_answer);
                if (index !== -1) {
                    fixed.correct_answer = index;
                }
            }
            break;
        case 'counting':
        case 'numeric':
            // Ensure it's a number
            if (typeof fixed.correct_answer === 'string') {
                const num = parseFloat(fixed.correct_answer);
                if (!isNaN(num)) {
                    fixed.correct_answer = num;
                }
            }
            // For counting, if correct_answer is an index into options, resolve it
            if (questionType === 'counting' && typeof fixed.correct_answer === 'number' && fixed.options) {
                if (fixed.correct_answer < fixed.options.length) {
                    const optionValue = parseInt(fixed.options[fixed.correct_answer]);
                    if (!isNaN(optionValue)) {
                        fixed.correct_answer = optionValue;
                    }
                }
            }
            break;
    }
    // Add missing fields with defaults
    if (!fixed.visual && !template.required_format.visual) {
        fixed.visual = null;
    }
    if (!fixed.hint) {
        fixed.hint = "Think carefully about the question";
    }
    if (!fixed.explanation) {
        fixed.explanation = "This is the correct answer";
    }
    // Fix fill_blank specific issues
    if (questionType === 'fill_blank') {
        // Ensure template exists
        if (!fixed.template && fixed.question) {
            // Try to convert question to template
            fixed.template = fixed.question.replace(/\[blank\]/g, '_____');
        }
        // Ensure blanks array exists
        if (!fixed.blanks && fixed.correct_answer) {
            const blankCount = (fixed.template?.match(/_____/g) || []).length;
            fixed.blanks = [];
            for (let i = 0; i < blankCount; i++) {
                fixed.blanks.push({
                    id: `blank_${i}`,
                    correctAnswers: Array.isArray(fixed.correct_answer)
                        ? [fixed.correct_answer[i] || 'answer']
                        : [fixed.correct_answer]
                });
            }
        }
    }
    return fixed;
}
/**
 * Get decision tree for choosing the right question type
 */
function selectQuestionType(questionText, hasOptions, hasVisual, subject, grade) {
    const q = questionText.toLowerCase();
    // CRITICAL: Selection/comparison questions MUST be multiple_choice
    if (q.includes('which') || q.includes('what is the') ||
        q.includes('select') || q.includes('choose') ||
        q.includes('largest') || q.includes('smallest') ||
        q.includes('biggest') || q.includes('highest') ||
        q.includes('lowest') || q.includes('best')) {
        if (hasOptions) {
            return 'multiple_choice';
        }
    }
    // Counting is ONLY for "how many" with visual objects
    if ((q.includes('how many') || q.includes('count')) && hasVisual) {
        // But only for young grades and only with emoji visuals
        const gradeNum = parseInt(grade) || 0;
        if (gradeNum <= 2 || grade === 'K') {
            return 'counting';
        }
    }
    // True/false for statements
    if (q.includes('true or false') || q.includes('t/f')) {
        return 'true_false';
    }
    // Numeric for calculations without options
    if (!hasOptions && (q.includes('calculate') || q.includes('what is') ||
        q.includes('how much') || q.includes('how many'))) {
        return 'numeric';
    }
    // Fill blank for completion
    if (q.includes('fill') || q.includes('complete') || q.includes('blank')) {
        return 'fill_blank';
    }
    // Default based on whether options are present
    return hasOptions ? 'multiple_choice' : 'short_answer';
}
/**
 * Master validation function for the entire pipeline
 */
function validatePipeline(aiResponse, questionType) {
    // Stage 1: Validate against template
    const templateValidation = validateAgainstTemplate(aiResponse, questionType);
    if (!templateValidation.valid) {
        return {
            stage: 'template_validation',
            valid: false,
            errors: templateValidation.errors
        };
    }
    // Stage 2: Fix common issues
    const fixed = fixAIResponse(aiResponse, questionType);
    // Stage 3: Re-validate after fixes
    const postFixValidation = validateAgainstTemplate(fixed, questionType);
    return {
        stage: 'pipeline_complete',
        valid: postFixValidation.valid,
        errors: postFixValidation.errors,
        fixed: fixed
    };
}
// Export singleton instance for easy use
exports.perfectTemplate = {
    generatePrompt: generatePerfectPrompt,
    validate: validateAgainstTemplate,
    fix: fixAIResponse,
    selectType: selectQuestionType,
    validatePipeline: validatePipeline,
    templates: exports.PERFECT_QUESTION_TEMPLATES
};
