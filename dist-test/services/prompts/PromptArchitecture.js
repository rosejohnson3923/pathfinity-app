"use strict";
/**
 * Modular Prompt Architecture
 * ============================
 * Instead of one master prompt, we use specialized prompt modules
 * that combine based on context
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.modularPromptSystem = exports.ModularPromptSystem = void 0;
/**
 * Prompt modules are specialized templates for different aspects
 */
class ModularPromptSystem {
    constructor() {
        /**
         * Grade-specific language and complexity templates
         */
        this.gradeTemplates = {
            'K': {
                language: 'Use very simple words. Short sentences. Focus on basic concepts.',
                complexity: 'Single-step problems only. Use visual aids and emojis.',
                vocabulary: ['see', 'count', 'find', 'look', 'choose'],
                avoid: ['calculate', 'analyze', 'determine', 'evaluate']
            },
            '1-2': {
                language: 'Use simple, clear language. One idea per sentence.',
                complexity: 'One or two-step problems. Concrete examples.',
                vocabulary: ['add', 'take away', 'group', 'sort', 'compare'],
                avoid: ['compute', 'derive', 'formulate']
            },
            '3-5': {
                language: 'Use grade-appropriate vocabulary. Clear instructions.',
                complexity: 'Multi-step problems allowed. Some abstraction.',
                vocabulary: ['multiply', 'divide', 'explain', 'describe', 'solve'],
                avoid: ['hypothesize', 'extrapolate']
            },
            '6-8': {
                language: 'More complex sentence structures. Academic vocabulary.',
                complexity: 'Abstract thinking. Multiple concepts.',
                vocabulary: ['analyze', 'compare', 'evaluate', 'calculate', 'determine'],
                avoid: []
            },
            '9-12': {
                language: 'Advanced vocabulary. Complex reasoning.',
                complexity: 'Abstract and theoretical concepts. Real-world applications.',
                vocabulary: ['synthesize', 'hypothesize', 'derive', 'critique', 'formulate'],
                avoid: []
            }
        };
        /**
         * Career-specific context and examples
         */
        this.careerTemplates = {
            'Doctor': {
                context: 'medical and health',
                examples: ['patients', 'medicine', 'health', 'diagnosis', 'treatment'],
                units: ['doses', 'heartbeats', 'appointments', 'vitamins'],
                scenarios: 'A doctor needs to..., In the hospital..., When treating patients...'
            },
            'Chef': {
                context: 'cooking and food preparation',
                examples: ['ingredients', 'recipes', 'dishes', 'servings', 'portions'],
                units: ['cups', 'tablespoons', 'servings', 'ingredients'],
                scenarios: 'A chef is preparing..., In the kitchen..., When making a recipe...'
            },
            'Engineer': {
                context: 'building and problem-solving',
                examples: ['bridges', 'buildings', 'machines', 'designs', 'blueprints'],
                units: ['meters', 'kilograms', 'newtons', 'watts'],
                scenarios: 'An engineer is designing..., When building..., To solve the problem...'
            },
            'Teacher': {
                context: 'education and learning',
                examples: ['students', 'lessons', 'books', 'classrooms', 'assignments'],
                units: ['students', 'books', 'pages', 'lessons'],
                scenarios: 'A teacher has..., In the classroom..., When teaching...'
            },
            'Athlete': {
                context: 'sports and fitness',
                examples: ['games', 'points', 'teams', 'practice', 'competitions'],
                units: ['points', 'yards', 'minutes', 'goals'],
                scenarios: 'An athlete is training..., During the game..., In practice...'
            },
            'Artist': {
                context: 'creativity and design',
                examples: ['paintings', 'colors', 'brushes', 'canvas', 'galleries'],
                units: ['colors', 'brushstrokes', 'paintings', 'exhibits'],
                scenarios: 'An artist is creating..., In the studio..., When designing...'
            },
            'Scientist': {
                context: 'research and experiments',
                examples: ['experiments', 'data', 'hypotheses', 'observations', 'results'],
                units: ['samples', 'measurements', 'trials', 'variables'],
                scenarios: 'A scientist is testing..., In the lab..., When conducting research...'
            }
        };
        /**
         * Subject-specific prompt templates
         */
        this.subjectTemplates = {
            'Math': {
                focus: 'numerical reasoning and problem-solving',
                questionStems: {
                    'K-2': ['How many...', 'Count the...', 'Which has more...', 'Add these...'],
                    '3-5': ['Calculate...', 'Find the...', 'Solve for...', 'What is the...'],
                    '6-8': ['Determine...', 'If x equals...', 'Graph the...', 'Find the rate...'],
                    '9-12': ['Derive...', 'Prove that...', 'Optimize...', 'Integrate...']
                },
                concepts: ['numbers', 'operations', 'patterns', 'measurement', 'geometry']
            },
            'ELA': {
                focus: 'language, reading, and communication',
                questionStems: {
                    'K-2': ['What letter...', 'Find the word...', 'Which sound...', 'Read this...'],
                    '3-5': ['What is the main idea...', 'Identify the...', 'Write a...', 'Explain why...'],
                    '6-8': ['Analyze the...', 'Compare these...', 'What theme...', 'Cite evidence...'],
                    '9-12': ['Critique the...', 'Synthesize...', 'Evaluate the author\'s...', 'Construct an argument...']
                },
                concepts: ['reading', 'writing', 'grammar', 'vocabulary', 'comprehension']
            },
            'Science': {
                focus: 'scientific inquiry and natural phenomena',
                questionStems: {
                    'K-2': ['What do you see...', 'Is this living...', 'What happens when...', 'Observe the...'],
                    '3-5': ['Predict what...', 'Classify these...', 'Measure the...', 'What causes...'],
                    '6-8': ['Form a hypothesis...', 'Design an experiment...', 'Analyze the data...', 'Explain the process...'],
                    '9-12': ['Evaluate the theory...', 'Model the...', 'Critique the methodology...', 'Propose a solution...']
                },
                concepts: ['observation', 'hypothesis', 'experiment', 'data', 'conclusion']
            },
            'Social Studies': {
                focus: 'society, history, and human interaction',
                questionStems: {
                    'K-2': ['Who helps...', 'Where is...', 'What holiday...', 'Name the...'],
                    '3-5': ['Locate on the map...', 'When did...', 'Why did people...', 'Compare how...'],
                    '6-8': ['Analyze the cause...', 'What were the effects...', 'Evaluate the decision...', 'Trace the development...'],
                    '9-12': ['Assess the impact...', 'Synthesize multiple perspectives...', 'Critique the policy...', 'Predict the consequences...']
                },
                concepts: ['community', 'culture', 'government', 'geography', 'history']
            }
        };
        /**
         * Skill-specific detailed templates
         */
        this.skillTemplates = {
            'Counting to 10': {
                specificPrompt: 'Create a counting question with objects to count between 1 and 10.',
                mustInclude: ['visual elements', 'countable objects'],
                examples: ['stars', 'apples', 'cars', 'flowers'],
                constraints: ['use emojis for visual representation', 'clear distinct objects']
            },
            'Letter Recognition': {
                specificPrompt: 'Create a question about identifying or distinguishing letters.',
                mustInclude: ['specific letters', 'visual or contextual clues'],
                examples: ['Which letter comes after B?', 'Find the letter that makes the /m/ sound'],
                constraints: ['focus on one or two letters at a time', 'use familiar words as examples']
            },
            'Addition within 20': {
                specificPrompt: 'Create an addition problem with sum no greater than 20.',
                mustInclude: ['two addends', 'clear operation'],
                examples: ['7 + 8', '13 + 6', '9 + 9'],
                constraints: ['single-digit or teen numbers only', 'no negative numbers']
            },
            'Comparing Numbers': {
                specificPrompt: 'Create a comparison question using greater than, less than, or equal.',
                mustInclude: ['two or more numbers to compare', 'comparison language'],
                examples: ['Which is larger: 45 or 54?', 'Order these from smallest to largest'],
                constraints: ['use age-appropriate numbers', 'clear comparison criteria']
            },
            'Fractions': {
                specificPrompt: 'Create a question about fractions (parts of a whole or comparison).',
                mustInclude: ['visual or contextual representation', 'fraction notation'],
                examples: ['1/2 of a pizza', '3/4 vs 2/3'],
                constraints: ['use familiar contexts', 'visual aids when possible']
            }
        };
        /**
         * Question type specific formatting rules
         */
        this.questionTypeTemplates = {
            'multiple_choice': {
                rules: [
                    'MUST have exactly 4 options',
                    'MUST have only ONE correct answer',
                    'Distractors should be plausible but clearly wrong',
                    'For "which" questions, options should be comparable items'
                ],
                structure: {
                    question: 'Clear question ending with ?',
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    correct_answer: 'index of correct option (0-3)'
                }
            },
            'true_false': {
                rules: [
                    'MUST be a statement that is definitively true or false',
                    'NEVER use for "which" or comparison questions',
                    'NEVER use for selection questions',
                    'Statement should be clear and unambiguous'
                ],
                structure: {
                    question: 'Statement to evaluate (can start with True or False:)',
                    correct_answer: 'boolean (true or false)'
                }
            },
            'counting': {
                rules: [
                    'ONLY for "how many" questions with visual objects',
                    'MUST include emoji or visual representation',
                    'Objects must be clearly countable',
                    'Answer must match the visual count exactly'
                ],
                structure: {
                    question: 'How many [objects] do you see?',
                    visual: 'emoji representation',
                    correct_answer: 'number matching visual count'
                }
            }
        };
    }
    /**
     * Assemble a complete prompt from modules
     */
    assemblePrompt(context) {
        const parts = [];
        // 1. Base instruction
        parts.push('Generate an educational question with the following specifications:\n');
        // 2. Grade-appropriate language
        const gradeKey = this.getGradeKey(context.gradeLevel);
        const gradeInfo = this.gradeTemplates[gradeKey];
        parts.push(`\nGRADE LEVEL ${context.gradeLevel} REQUIREMENTS:`);
        parts.push(`- Language: ${gradeInfo.language}`);
        parts.push(`- Complexity: ${gradeInfo.complexity}`);
        parts.push(`- Use words like: ${gradeInfo.vocabulary.join(', ')}`);
        if (gradeInfo.avoid.length > 0) {
            parts.push(`- Avoid words like: ${gradeInfo.avoid.join(', ')}`);
        }
        // 3. Subject context
        const subject = this.subjectTemplates[context.subject];
        if (subject) {
            parts.push(`\nSUBJECT (${context.subject}):`);
            parts.push(`- Focus: ${subject.focus}`);
            const stems = subject.questionStems[gradeKey] || subject.questionStems['3-5'];
            parts.push(`- Appropriate question starters: ${stems.join(', ')}`);
        }
        // 4. Skill-specific requirements
        const skill = this.skillTemplates[context.skillName];
        if (skill) {
            parts.push(`\nSKILL: ${context.skillName}`);
            parts.push(`- ${skill.specificPrompt}`);
            parts.push(`- Must include: ${skill.mustInclude.join(', ')}`);
            parts.push(`- Constraints: ${skill.constraints.join('; ')}`);
        }
        else {
            parts.push(`\nSKILL: ${context.skillName}`);
            parts.push(`- Create a question that directly tests this skill`);
            parts.push(`- Ensure the question is relevant and appropriate`);
        }
        // 5. Career context
        const career = this.careerTemplates[context.career];
        if (career) {
            parts.push(`\nCAREER CONTEXT (${context.career}):`);
            parts.push(`- Use ${career.context} context when possible`);
            parts.push(`- Examples to use: ${career.examples.slice(0, 3).join(', ')}`);
            parts.push(`- Scenario starters: ${career.scenarios}`);
        }
        // 6. Question type requirements
        if (context.questionType) {
            const typeRules = this.questionTypeTemplates[context.questionType];
            if (typeRules) {
                parts.push(`\nQUESTION TYPE: ${context.questionType}`);
                parts.push('Rules:');
                typeRules.rules.forEach(rule => parts.push(`  - ${rule}`));
                parts.push(`\nRequired Format:`);
                parts.push(JSON.stringify(typeRules.structure, null, 2));
            }
        }
        // 7. Final instructions
        parts.push('\nIMPORTANT REQUIREMENTS:');
        parts.push('1. The question MUST be appropriate for the grade level');
        parts.push('2. The question MUST test the specific skill mentioned');
        parts.push('3. Include career context where natural (don\'t force it)');
        parts.push('4. Ensure mathematical and factual accuracy');
        parts.push('5. Make the question engaging and relevant');
        return parts.join('\n');
    }
    getGradeKey(grade) {
        if (grade === 'K')
            return 'K';
        const gradeNum = parseInt(grade);
        if (gradeNum <= 2)
            return '1-2';
        if (gradeNum <= 5)
            return '3-5';
        if (gradeNum <= 8)
            return '6-8';
        return '9-12';
    }
    /**
     * Get a specialized prompt for edge cases
     */
    getEdgeCasePrompt(scenario) {
        const edgeCasePrompts = {
            'negative_number_comparison': `
        Create a comparison question with negative numbers.
        IMPORTANT: This should be a multiple_choice question, NOT true/false.
        Example: "Which number is smaller: -10 or -5?"
        The question should have clear options to choose from.
      `,
            'fraction_comparison': `
        Create a fraction comparison question.
        IMPORTANT: This should be multiple_choice with fraction options.
        Include visual representations if helpful.
      `,
            'which_question': `
        Create a question that starts with "Which".
        CRITICAL: This MUST be multiple_choice, NEVER true/false.
        Provide distinct options to choose from.
      `
        };
        return edgeCasePrompts[scenario] || '';
    }
}
exports.ModularPromptSystem = ModularPromptSystem;
exports.modularPromptSystem = new ModularPromptSystem();
