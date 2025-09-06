/**
 * Modular Prompt Architecture
 * ============================
 * Instead of one master prompt, we use specialized prompt modules
 * that combine based on context
 */

export interface PromptContext {
  // User Context
  gradeLevel: string;
  career: string;
  
  // Academic Context
  subject: string;
  skillName: string;
  skillId: string;
  
  // Question Context
  questionType?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  
  // Learning Context
  previousMistakes?: string[];
  learningStyle?: string;
  interests?: string[];
}

/**
 * Prompt modules are specialized templates for different aspects
 */
export class ModularPromptSystem {
  
  /**
   * Grade-specific language and complexity templates
   */
  private gradeTemplates = {
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
      vocabulary: ['analyze', 'evaluate', 'determine', 'calculate', 'explain'],
      avoid: []
    }
  };
  
  /**
   * Career-specific context and examples
   */
  private careerTemplates = {
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
    },
    // High School Level Careers
    'Programmer': {
      context: 'software development and coding',
      examples: ['algorithms', 'functions', 'variables', 'databases', 'applications'],
      units: ['lines of code', 'functions', 'iterations', 'bytes'],
      scenarios: 'A programmer is developing..., When debugging code..., In the software project...'
    },
    'Lawyer': {
      context: 'legal practice and justice',
      examples: ['cases', 'evidence', 'contracts', 'arguments', 'precedents'],
      units: ['cases', 'documents', 'hours', 'claims'],
      scenarios: 'A lawyer is preparing..., In the courtroom..., When reviewing contracts...'
    },
    'Architect': {
      context: 'building design and planning',
      examples: ['blueprints', 'floor plans', 'materials', 'structures', 'specifications'],
      units: ['square feet', 'floors', 'rooms', 'materials'],
      scenarios: 'An architect is designing..., When planning a building..., For the construction project...'
    },
    'Entrepreneur': {
      context: 'business and innovation',
      examples: ['startups', 'products', 'markets', 'investments', 'revenue'],
      units: ['dollars', 'products', 'customers', 'shares'],
      scenarios: 'An entrepreneur is launching..., In the business plan..., When analyzing the market...'
    },
    'Journalist': {
      context: 'news and reporting',
      examples: ['articles', 'interviews', 'sources', 'headlines', 'deadlines'],
      units: ['words', 'articles', 'sources', 'pages'],
      scenarios: 'A journalist is investigating..., When writing the story..., During the interview...'
    },
    'Psychologist': {
      context: 'mental health and behavior',
      examples: ['patients', 'behaviors', 'therapies', 'assessments', 'studies'],
      units: ['sessions', 'patients', 'hours', 'responses'],
      scenarios: 'A psychologist is analyzing..., In the therapy session..., When conducting research...'
    },
    'Financial Analyst': {
      context: 'finance and investments',
      examples: ['portfolios', 'stocks', 'bonds', 'returns', 'markets'],
      units: ['dollars', 'shares', 'percentages', 'quarters'],
      scenarios: 'A financial analyst is evaluating..., When analyzing investments..., In the market report...'
    },
    'Environmental Scientist': {
      context: 'ecology and sustainability',
      examples: ['ecosystems', 'pollution', 'conservation', 'species', 'climate'],
      units: ['samples', 'species', 'acres', 'emissions'],
      scenarios: 'An environmental scientist is studying..., When measuring pollution..., In the field research...'
    },
    'Data Scientist': {
      context: 'data analysis and insights',
      examples: ['datasets', 'models', 'predictions', 'patterns', 'visualizations'],
      units: ['data points', 'gigabytes', 'models', 'predictions'],
      scenarios: 'A data scientist is analyzing..., When building models..., In the data pipeline...'
    },
    'Game Developer': {
      context: 'game design and development',
      examples: ['levels', 'characters', 'mechanics', 'graphics', 'gameplay'],
      units: ['frames per second', 'levels', 'players', 'assets'],
      scenarios: 'A game developer is creating..., When designing gameplay..., In the game engine...'
    }
  };
  
  /**
   * Subject-specific prompt templates
   */
  private subjectTemplates = {
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
    },
    'Algebra1': {
      focus: 'algebraic reasoning and linear relationships',
      questionStems: {
        'K-2': [], // Not applicable for K-2
        '3-5': [], // Not applicable for 3-5
        '6-8': ['Solve for x...', 'Simplify the expression...', 'Graph the equation...', 'Find the slope...'],
        '9-12': ['Factor the polynomial...', 'Solve the system...', 'Find the domain...', 'Determine the function...']
      },
      concepts: ['variables', 'equations', 'functions', 'graphs', 'polynomials', 'systems', 'inequalities']
    },
    'Precalculus': {
      focus: 'advanced algebra and trigonometry',
      questionStems: {
        'K-2': [], // Not applicable for K-2
        '3-5': [], // Not applicable for 3-5
        '6-8': [], // Not applicable for 6-8
        '9-12': ['Evaluate the limit...', 'Find the amplitude...', 'Solve the trigonometric equation...', 'Determine the asymptotes...', 'Graph the conic section...']
      },
      concepts: ['trigonometry', 'limits', 'sequences', 'series', 'vectors', 'matrices', 'conic sections', 'polar coordinates']
    }
  };
  
  /**
   * Skill-specific detailed templates
   */
  private skillTemplates = {
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
    },
    // Algebra 1 Skills
    'Linear Equations': {
      specificPrompt: 'Create a question about solving linear equations or systems.',
      mustInclude: ['variable(s)', 'equation setup'],
      examples: ['2x + 5 = 17', 'y = 3x - 4'],
      constraints: ['appropriate difficulty for grade level', 'clear solution path']
    },
    'Quadratic Functions': {
      specificPrompt: 'Create a question about quadratic functions, factoring, or graphing parabolas.',
      mustInclude: ['quadratic expression', 'specific task (factor, solve, graph)'],
      examples: ['x² + 5x + 6', 'vertex form', 'zeros of function'],
      constraints: ['standard form or vertex form', 'integer solutions when possible']
    },
    'Systems of Equations': {
      specificPrompt: 'Create a question about solving systems of linear equations.',
      mustInclude: ['two or more equations', 'two or more variables'],
      examples: ['substitution method', 'elimination method', 'graphical solution'],
      constraints: ['consistent system with unique solution', 'realistic context when applicable']
    },
    // Precalculus Skills
    'Trigonometric Functions': {
      specificPrompt: 'Create a question about trigonometric functions, identities, or equations.',
      mustInclude: ['trig function', 'angle measure or radian'],
      examples: ['sin(π/4)', 'cos²x + sin²x = 1', 'period and amplitude'],
      constraints: ['use standard angles when possible', 'specify degree or radian mode']
    },
    'Limits': {
      specificPrompt: 'Create a question about evaluating limits or understanding limit behavior.',
      mustInclude: ['limit notation', 'function approaching a value'],
      examples: ['lim(x→2) (x²-4)/(x-2)', 'limits at infinity', 'one-sided limits'],
      constraints: ['algebraically solvable', 'avoid requiring L\'Hôpital\'s rule']
    },
    'Conic Sections': {
      specificPrompt: 'Create a question about circles, ellipses, parabolas, or hyperbolas.',
      mustInclude: ['conic equation', 'geometric property'],
      examples: ['center and radius', 'foci', 'directrix', 'asymptotes'],
      constraints: ['standard or general form', 'clear geometric interpretation']
    }
  };
  
  /**
   * Question type specific formatting rules
   */
  private questionTypeTemplates = {
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
    },
    'fill_blank': {
      rules: [
        'MUST use exactly _____ (5 underscores) to indicate blank position',
        'The blank should replace a KEY WORD or ANSWER in the sentence',
        'correct_answer MUST be the exact word/phrase that fills the blank',
        'Keep sentences simple and focused on the skill',
        'Only ONE blank per question',
        'The question field MUST contain the _____ marker'
      ],
      structure: {
        type: 'fill_blank',
        question: 'Sentence with _____ for the blank',
        correct_answer: 'exact word or phrase to fill blank',
        explanation: 'why this answer is correct'
      },
      examples: [
        '{"type": "fill_blank", "question": "The capital of France is _____.", "correct_answer": "Paris"}',
        '{"type": "fill_blank", "question": "2 + 2 = _____.", "correct_answer": "4"}',
        '{"type": "fill_blank", "question": "Water freezes at _____ degrees Celsius.", "correct_answer": "0"}'
      ]
    }
  };
  
  /**
   * Assemble a complete prompt from modules
   */
  assemblePrompt(context: PromptContext): string {
    const parts: string[] = [];
    
    // Validate subject/grade combination
    const gradeNum = context.gradeLevel === 'K' ? 0 : parseInt(context.gradeLevel);
    const isHighSchoolMathSubject = context.subject === 'Algebra1' || context.subject === 'Precalculus';
    
    if (isHighSchoolMathSubject) {
      // Algebra1 is typically grades 8-10, Precalculus is typically grades 10-12
      if (context.subject === 'Algebra1' && gradeNum < 8) {
        // For lower grades, default to regular Math
        context.subject = 'Math';
      } else if (context.subject === 'Precalculus' && gradeNum < 10) {
        // For lower grades, default to Algebra1 or Math
        context.subject = gradeNum >= 8 ? 'Algebra1' : 'Math';
      }
    }
    
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
      const stems = subject.questionStems[gradeKey] || subject.questionStems['3-5'] || subject.questionStems['9-12'] || [];
      if (stems.length > 0) {
        parts.push(`- Appropriate question starters: ${stems.join(', ')}`);
      }
      if (subject.concepts) {
        parts.push(`- Key concepts: ${subject.concepts.join(', ')}`);
      }
    }
    
    // 4. Skill-specific requirements
    const skill = this.skillTemplates[context.skillName];
    if (skill) {
      parts.push(`\nSKILL: ${context.skillName}`);
      parts.push(`- ${skill.specificPrompt}`);
      parts.push(`- Must include: ${skill.mustInclude.join(', ')}`);
      parts.push(`- Constraints: ${skill.constraints.join('; ')}`);
    } else {
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
        
        // Extra emphasis for fill_blank
        if (context.questionType === 'fill_blank') {
          parts.push('\n⚠️ CRITICAL FOR FILL_BLANK:');
          parts.push('The question MUST contain _____ (5 underscores) where the answer goes');
          parts.push('Example: "The capital of France is _____." (Answer: Paris)');
          parts.push('DO NOT generate a regular question without the blank marker!');
        }
      }
    } else {
      // Auto-determine appropriate type based on grade and skill
      const gradeNum = parseInt(context.gradeLevel) || 0;
      
      // For high school, prefer multiple_choice or numeric for most subjects
      if (gradeNum >= 9) {
        parts.push('\nQUESTION TYPE GUIDANCE:');
        if (context.subject === 'Math') {
          parts.push('- Prefer multiple_choice or numeric for math problems');
          parts.push('- AVOID short_answer unless specifically testing written explanations');
        } else {
          parts.push('- Default to multiple_choice for assessment');
          parts.push('- Use true_false only for clear statements');
          parts.push('- AVOID short_answer/long_answer unless testing writing skills');
        }
      }
    }
    
    // 7. Final instructions
    parts.push('\nIMPORTANT REQUIREMENTS:');
    parts.push('1. The question MUST be appropriate for the grade level');
    parts.push('2. The question MUST test the specific skill mentioned');
    parts.push('3. Include career context where natural (don\'t force it)');
    parts.push('4. Ensure mathematical and factual accuracy');
    parts.push('5. Make the question engaging and relevant');
    parts.push('6. Generate your response in valid JSON format');
    
    // CRITICAL: Enforce valid question types only
    parts.push('\nVALID QUESTION TYPES ONLY:');
    parts.push('✅ ALLOWED: multiple_choice, true_false, counting, numeric, fill_blank, short_answer, long_answer, matching, ordering, classification, visual_identification, pattern_recognition, code_completion, diagram_labeling');
    parts.push('❌ NOT ALLOWED: open_ended, word_problem, single_answer, single_choice, or any other type');
    parts.push('DEFAULT TO multiple_choice if unsure!');
    
    return parts.join('\n');
  }
  
  private getGradeKey(grade: string): string {
    if (grade === 'K') return 'K';
    const gradeNum = parseInt(grade);
    if (gradeNum <= 2) return '1-2';
    if (gradeNum <= 5) return '3-5';
    if (gradeNum <= 8) return '6-8';
    return '9-12';
  }
  
  /**
   * Get a specialized prompt for edge cases
   */
  getEdgeCasePrompt(scenario: string): string {
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
      `,
      'high_school_math': `
        Create a high school math question.
        IMPORTANT: Use multiple_choice or numeric type.
        AVOID short_answer unless specifically asking for proof or derivation.
      `,
      'kindergarten_shapes': `
        Create a shape recognition question for kindergarten.
        Use multiple_choice, NOT counting.
        Keep language very simple.
      `
    };
    
    return edgeCasePrompts[scenario] || '';
  }
}

export const modularPromptSystem = new ModularPromptSystem();