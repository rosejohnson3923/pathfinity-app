/**
 * PromptBuilder - Combines hierarchical rules to generate consistent AI prompts
 * This centralizes prompt generation and ensures all rules are applied
 */

import {
  UNIVERSALCONTENT_RULES,
  formatUniversalRulesForPrompt,
  getLanguageConstraintsOnly,
  validateQuestionStructure
} from './rules/UniversalContentRules';

import {
  UNIVERSALSUBJECT_RULES,
  formatSubjectRulesForPrompt,
  getAllowedTypes,
  validateSubjectRules
} from './rules/UniversalSubjectRules';

import {
  LEARNCONTAINER_RULES,
  formatLearnContainerRulesForPrompt,
  getLearnContainerRequirements,
  getLearnContainerInstructions,
  validateLearnContainerRules,
  getLearnExampleStructure,
  getLearnResponseFormat,
  getLearnQualityChecklist,
  getLearnReminders,
  getELALetterRules
} from './rules/LearnContainerRules';

import {
  EXPERIENCECONTAINER_RULES,
  formatExperienceContainerRulesForPrompt,
  getExperienceContainerRequirements,
  getExperienceContainerInstructions,
  validateExperienceContainerRules,
  getExperienceTaskInstructions,
  getExperienceResponseFormat,
  getExperienceExampleStructure,
  getExperienceQualityChecklist,
  getExperienceReminders,
  getExperienceOverrides
} from './rules/ExperienceContainerRules';

import {
  DISCOVERCONTAINER_RULES,
  formatDiscoverContainerRulesForPrompt,
  getDiscoverContainerRequirements,
  getDiscoverContainerInstructions,
  validateDiscoverContainerRules,
  getDiscoverTaskInstructions,
  getDiscoverResponseFormat,
  getDiscoverQualityChecklist,
  getDiscoverReminders,
  getDiscoverExampleStructure,
  getDiscoverOverrides
} from './rules/DiscoverContainerRules';

export interface PromptContext {
  container: 'LEARN' | 'DISCOVER' | 'EXPERIENCE' | 'ASSESSMENT';
  subject: string;
  grade: string;
  skill: {
    id: string;
    name: string;
    description?: string;
    subject: string;
  };
  career: {
    id: string;
    name: string;
    description?: string;
  };
  student: {
    id: string;
    display_name: string;
    grade_level: string;
  };
  companion?: {
    name: string;
    personality?: string;
  };
  // Narrative context from MasterNarrative
  narrativeContext?: {
    setting?: string;
    context?: string;
    narrative?: string;
    mission?: string;
    throughLine?: string;
    companion?: any;
    subjectContext?: any;
  };
}

export class PromptBuilder {
  private static instance: PromptBuilder;
  
  private constructor() {}
  
  static getInstance(): PromptBuilder {
    if (!PromptBuilder.instance) {
      PromptBuilder.instance = new PromptBuilder();
    }
    return PromptBuilder.instance;
  }
  
  /**
   * Build a complete prompt combining all rule levels
   */
  buildPrompt(context: PromptContext): string {
    const { container, subject, grade, skill, career, student, companion } = context;

    // Get allowed types for this subject/grade
    const allowedTypes = getAllowedTypes(subject, grade);

    // Get container-specific requirements and overrides
    const requirements = this.getContainerRequirements(container);
    const overrides = this.getContainerOverrides(container);

    // Add pre-generation validation for ELA
    const preValidation = skill.subject === 'ELA' ? `
⚠️⚠️⚠️ STOP AND READ - CRITICAL VALIDATION ⚠️⚠️⚠️

You are about to generate content for:
- Subject: ELA (English Language Arts)
- Skill: ${skill.name}
- Grade: ${grade}

BEFORE YOU GENERATE ANYTHING, CONFIRM:
✓ You will ONLY ask about letters, vowels, and consonants
✓ You will NEVER ask "Which number comes first: 1, 2, or 3?"
✓ You will use Title Case words like "Game" not "GAME"
✓ Example question: "Is the letter E a consonant or a vowel?"

If you generate ANY Math content for this ELA lesson, the entire response will be REJECTED.

⚠️⚠️⚠️ END CRITICAL VALIDATION ⚠️⚠️⚠️
` : '';

    // Add narrative context if available
    const narrativeSection = context.narrativeContext ? `
========================================
NARRATIVE CONTEXT - MAINTAIN CONTINUITY
========================================
${context.narrativeContext.setting ? `Setting: ${context.narrativeContext.setting}` : ''}
${context.narrativeContext.narrative ? `Story: ${context.narrativeContext.narrative}` : ''}
${context.narrativeContext.mission ? `Mission: ${context.narrativeContext.mission}` : ''}
${context.narrativeContext.throughLine ? `Career Connection: ${context.narrativeContext.throughLine}` : ''}
${context.narrativeContext.context ? `Context: ${context.narrativeContext.context}` : ''}
${context.narrativeContext.companion ? `
Companion: ${context.narrativeContext.companion.name || 'AI Assistant'}
Personality: ${context.narrativeContext.companion.personality || ''}
Teaching Style: ${context.narrativeContext.companion.teachingStyle || ''}
` : ''}

CRITICAL: All content must align with this narrative context!
========================================
` : '';

    // Build the complete prompt based on container type
    const prompt = `
You are an expert educational content creator specializing in personalized, gamified learning experiences.

${preValidation}

${narrativeSection}

${this.getSystemContext(student, career, skill, companion)}

${overrides.useLanguageConstraintsOnly ? getLanguageConstraintsOnly(grade) : formatUniversalRulesForPrompt(grade)}

${overrides.skipSubjectRules ? '' : formatSubjectRulesForPrompt(subject, grade)}

${this.getContainerRules(container, career.name)}

${subject === 'ELA' && (container === 'LEARN' || container === 'ASSESSMENT') ? getELALetterRules(grade, skill.name) : ''}

${subject === 'MATH' && ['K', '1', '2'].includes(grade) ? this.getCountingQuestionRules(career.name) : ''}

${this.getTaskInstructions(context)}

${this.getResponseFormat(container, requirements, allowedTypes, context)}

${this.getExampleStructure(container, career.name, subject)}

${this.getQualityChecklist(container)}

${this.getContainerReminders(container, subject, grade, career.name)}

${skill.subject === 'ELA' ? `
⚠️ FINAL REMINDER BEFORE GENERATING:
- This is ELA about "${skill.name}"
- ONLY generate questions about letters/vowels/consonants
- Use "Game" not "GAME", "Play" not "PLAY"
- NO MATH QUESTIONS ALLOWED
` : ''}

Generate the content now:
`;

    return prompt;
  }
  
  /**
   * Get container-specific requirements
   */
  private getContainerRequirements(container: string): any {
    switch (container) {
      case 'LEARN':
      case 'ASSESSMENT':
        return getLearnContainerRequirements(container);
      case 'EXPERIENCE':
        return getExperienceContainerRequirements(container);
      case 'DISCOVER':
        return getDiscoverContainerRequirements(container);
      default:
        return { exampleCount: 3, practiceCount: 5, assessmentCount: 1, requiresSupport: true };
    }
  }

  /**
   * Get container-specific overrides
   */
  private getContainerOverrides(container: string): any {
    switch (container) {
      case 'EXPERIENCE':
        return getExperienceOverrides();
      case 'DISCOVER':
        return getDiscoverOverrides();
      case 'LEARN':
      case 'ASSESSMENT':
      default:
        return { skipSubjectRules: false, useLanguageConstraintsOnly: false };
    }
  }

  /**
   * Get container-specific rules
   */
  private getContainerRules(container: string, careerName: string): string {
    switch (container) {
      case 'LEARN':
      case 'ASSESSMENT':
        return formatLearnContainerRulesForPrompt(container, careerName);
      case 'EXPERIENCE':
        return formatExperienceContainerRulesForPrompt(container, careerName);
      case 'DISCOVER':
        return formatDiscoverContainerRulesForPrompt(container, careerName);
      default:
        return '';
    }
  }

  /**
   * Get container-specific reminders
   */
  private getContainerReminders(container: string, subject: string, grade: string, careerName: string): string {
    switch (container) {
      case 'LEARN':
      case 'ASSESSMENT':
        return getLearnReminders(subject, grade);
      case 'EXPERIENCE':
        return getExperienceReminders(careerName, grade);
      case 'DISCOVER':
        return getDiscoverReminders(subject, grade, careerName);
      default:
        return '';
    }
  }

  /**
   * Build system context section
   */
  private getSystemContext(
    student: any,
    career: any,
    skill: any,
    companion?: any
  ): string {
    return `
========================================
LEARNING CONTEXT
========================================
Student: ${student.display_name} (Grade ${student.grade_level})
Career Context: ${career.name}
Skill: ${skill.name}
Subject: ${skill.subject}
${companion ? `AI Companion: ${companion.name}` : ''}

Your task is to create an engaging, career-integrated learning experience that helps ${student.display_name} master "${skill.name}" while seeing how ${career.name}s use this skill professionally.

⚠️ CRITICAL SUBJECT ISOLATION - MANDATORY:
• You are teaching ${skill.subject} ONLY - NO EXCEPTIONS!
• NEVER mix subjects - this is a CRITICAL ERROR

${skill.subject === 'ELA' ? `
🔴 ELA SPECIFIC - ABSOLUTELY FORBIDDEN:
  ❌ NEVER ask "Which number comes first: 1, 2, or 3?"
  ❌ NEVER use Math counting questions
  ❌ NEVER use numeric ordering
  ✅ ONLY focus on: letters, vowels, consonants, words, sentences
  ✅ Example: "Is the letter E a consonant or a vowel?"
  ✅ Example: "Which letter in 'Game' is uppercase?"
` : ''}

${skill.subject === 'MATH' ? `
🔴 MATH SPECIFIC - ABSOLUTELY FORBIDDEN:
  ❌ NEVER ask about consonants and vowels
  ❌ NEVER ask about letter identification
  ✅ ONLY focus on: numbers, counting, operations, patterns
` : ''}

ENFORCEMENT:
• If teaching ${skill.subject}, ALL questions MUST be about ${skill.subject}
• Topic: "${skill.name}" - stay focused on this specific skill
• Any cross-subject content will cause COMPLETE FAILURE
`;
  }
  
  /**
   * Get specific task instructions based on container
   */
  private getTaskInstructions(context: PromptContext): string {
    const { container, student, career, skill, subject } = context;

    switch (container) {
      case 'EXPERIENCE':
        return getExperienceTaskInstructions(
          student.display_name,
          career.name,
          skill.name,
          student.grade_level
        );

      case 'DISCOVER':
        return getDiscoverTaskInstructions(
          student.display_name,
          career.name,
          subject,
          skill.name,
          student.grade_level
        );

      case 'LEARN':
      case 'ASSESSMENT':
      default:
        const instructions = getLearnContainerInstructions(
          container,
          career.name,
          student.display_name,
          student.grade_level
        );
        return `
========================================
YOUR TASK
========================================
${instructions}

Create content that:
• Is appropriate for grade ${student.grade_level}
• Integrates ${career.name} context naturally
• Follows all universal, subject, and container rules
• Maintains consistent formatting and structure
• Provides supportive, encouraging feedback
`;
    }
  }
  
  /**
   * Get the expected response format
   */
  private getResponseFormat(
    container: string,
    requirements: any,
    allowedTypes: string[],
    context?: PromptContext
  ): string {
    switch (container) {
      case 'EXPERIENCE':
        return getExperienceResponseFormat(requirements);

      case 'DISCOVER':
        // Add context to requirements for Discover
        const discoverRequirements = {
          ...requirements,
          career: context?.career?.name,
          subject: context?.subject,
          skill: context?.skill?.name,
          studentName: context?.student?.display_name
        };
        return getDiscoverResponseFormat(discoverRequirements, allowedTypes);

      case 'LEARN':
      case 'ASSESSMENT':
        return getLearnResponseFormat(requirements, allowedTypes);

      default:
        // Fallback to basic format
        return getLearnResponseFormat(requirements, allowedTypes);
    }
  }
  
  /**
   * Provide a concrete example structure
   */
  private getExampleStructure(container: string, careerName: string, subject: string): string {
    switch (container) {
      case 'EXPERIENCE':
        return getExperienceExampleStructure();

      case 'DISCOVER':
        return getDiscoverExampleStructure(careerName, subject);

      case 'LEARN':
      case 'ASSESSMENT':
        return getLearnExampleStructure();

      default:
        return ``;
    }
  }
  
  /**
   * Quality checklist reminder
   */
  private getQualityChecklist(container?: string): string {
    switch (container) {
      case 'EXPERIENCE':
        return getExperienceQualityChecklist();

      case 'DISCOVER':
        return getDiscoverQualityChecklist();

      case 'LEARN':
      case 'ASSESSMENT':
        return getLearnQualityChecklist();

      default:
        // This should never be reached since all containers have their own checklists
        console.warn(`No quality checklist found for container: ${container}`);
        return '';
    }
  }
  
  /**
   * Validate generated content against all rules
   */
  validateContent(content: any, context: PromptContext): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate container requirements based on container type
    let containerErrors: string[] = [];
    switch (context.container) {
      case 'LEARN':
      case 'ASSESSMENT':
        containerErrors = validateLearnContainerRules(content, context.container);
        break;
      case 'EXPERIENCE':
        containerErrors = validateExperienceContainerRules(content, context.container);
        break;
      case 'DISCOVER':
        containerErrors = validateDiscoverContainerRules(content, context.container);
        break;
    }
    errors.push(...containerErrors);
    
    // Validate each practice question
    if (content.practice && Array.isArray(content.practice)) {
      content.practice.forEach((question: any, index: number) => {
        // Universal validation
        const universalErrors = validateQuestionStructure(question);
        errors.push(...universalErrors.map(e => `Practice ${index + 1}: ${e}`));
        
        // Subject validation
        const subjectErrors = validateSubjectRules(question, context.subject, context.grade);
        errors.push(...subjectErrors.map(e => `Practice ${index + 1}: ${e}`));
        
        // Check practiceSupport
        if (context.container !== 'ASSESSMENT' && !question.practiceSupport) {
          errors.push(`Practice ${index + 1}: Missing required practiceSupport structure`);
        }
      });
    }
    
    // Validate assessment
    if (content.assessment) {
      const assessmentErrors = validateQuestionStructure(content.assessment);
      errors.push(...assessmentErrors.map(e => `Assessment: ${e}`));
      
      const subjectErrors = validateSubjectRules(content.assessment, context.subject, context.grade);
      errors.push(...subjectErrors.map(e => `Assessment: ${e}`));
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Get counting question rules for K-2 Math with career-appropriate emojis
   */
  private getCountingQuestionRules(careerName?: string): string {
    // Career-specific emoji mappings
    const careerEmojiMap: Record<string, string> = {
      // Sports & Fitness
      'Coach': '⚽🏀🏈🎾🏐⚾🥎🏏🏸🏓🏒🏑🥍🥊🤺⛹️🤸🏋️👕🏆🥇🥈🥉🏅📣', // Note: No whistle emoji exists, use 📣 (megaphone) for coach communication
      'Athletic Trainer': '⚽🏀🏈🎾💪🦵🦶🏃🤸⛹️🩹🧊💊🏥',
      'Sports Referee': '⚽🏀🏈⚾🏐📣🚩🟨🟥✋👁️📋📊',

      // Medical & Healthcare
      'Doctor': '🩺💊💉🏥🔬🧪🩹🌡️🏥📋🧬🦴🫀🫁',
      'Nurse': '🩺💊💉🏥🩹🌡️📋🧴💊🏥',
      'Veterinarian': '🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🩺💉',

      // Creative Arts
      'Artist': '🎨🖌️🖍️✏️📐🖼️🎭🖊️📏📐',
      'Musician': '🎵🎶🎼🎹🎸🥁🎷🎺🎻🪕🎤🎧',
      'Chef': '🍳🥘🍲🥗🍕🍔🍟🌮🌯🥙🧆🍜🍱🥡🔪🥄',

      // Technology
      'Video Game Designer': '🎮🕹️💻🖥️🖱️⌨️🎯👾🤖🏆💎⚔️🛡️',
      'Computer Programmer': '💻🖥️⌨️🖱️💾💿📀🖨️📱⚙️🔧🔨',

      // Education
      'Teacher': '📚📖📝✏️📏📐🖍️🎨🔤🔢🧮🗂️',
      'Librarian': '📚📖📕📗📘📙📓📔📑🔖📰🗞️',

      // Science & Research
      'Scientist': '🔬🧪🧫🦠💉🧬🔭🌡️⚗️🥽📊📈',
      'Astronaut': '🚀🛸🌌🌍🌎🌏🌙⭐🪐☄️🛰️👨‍🚀',
      'Marine Biologist': '🐠🐟🐡🦈🐙🦑🦐🦞🦀🐚🐋🐬',
      'Archeologist': '🏺⚱️🗿🦴🦖🔍🗺️⛏️🏛️📜',
      'Geologist': '⛰️🌋🪨💎⛏️🔍🗺️🌍📊📈',

      // Business & Finance
      'Entrepreneur': '💼💰💳📊📈💡🏢🤝📱💻',
      'Accountant': '💰💵💴💶💷📊📈📉🧮💳',
      'Financial Advisor': '💰📊📈💳🏦💵📑📋💼🤝',
      'Real Estate Agent': '🏠🏡🏢🏘️🔑📋🤝💼📐📏',

      // Transportation & Logistics
      'Pilot': '✈️🛩️🛫🛬🌍🗺️📡🎛️👨‍✈️👩‍✈️',
      'Truck Driver': '🚚🚛📦📋🗺️⛽🛣️🚦⚠️🔧',
      'Ship Captain': '🚢⛴️⚓🌊🗺️📡🧭⛵🌅🐋',

      // Law & Public Service
      'Lawyer': '⚖️📚📋🏛️💼📝✍️🤝👔📑',
      'Police Officer': '👮🚔🚨📋🔦🚓⚖️🛡️📻🚁',
      'Firefighter': '🚒🔥🧯👨‍🚒🪜🚨💧🏢⛑️🆘',
      'Judge': '⚖️🔨📚🏛️📋👨‍⚖️👩‍⚖️📝✍️⚡',

      // Agriculture & Environment
      'Farmer': '🌾🌽🥕🥔🍅🚜🐄🐖🐓🌻',
      'Gardener': '🌻🌷🌹🌺🌸🌿🍀🌱🌲🌳',
      'Environmental Scientist': '🌍🌱🌳💧🌊♻️📊📈🔬🧪',
      'Park Ranger': '🌲🏞️🦌🐻🗺️🥾⛺🔥🎒📷',

      // Construction & Trades
      'Construction Worker': '👷🏗️🧱🔨🪛⚒️🪜📐📏🚧',
      'Electrician': '💡🔌⚡🔋🪛🔧📐⚠️👷💻',
      'Plumber': '🔧🚰💧🚿🛁🪠🔩👷📐⚠️',
      'Carpenter': '🪵🔨🪛📐📏🪚🗜️👷🏠🚪',

      // Media & Entertainment
      'Actor': '🎭🎬🎥📺🎪🌟👔👗💄🎤',
      'Director': '🎬🎥📹🎞️📽️🎪📢📋✂️🌟',
      'Photographer': '📷📸📹🖼️💡🎨🌅🌄🏞️📐',
      'Journalist': '📰🗞️📝✍️📻📺🎤📹💻🗂️',

      // Service Industry
      'Barber': '✂️💈👔🪒🧴💇‍♂️💇‍♀️🪑📋💵',
      'Beautician': '💄💅💇‍♀️✂️🧴💆‍♀️👗💍📋💵',
      'Hotel Manager': '🏨🔑🛎️🛏️🍽️📋💼🤝📞💳',
      'Travel Agent': '✈️🏖️🗺️🎫🏨🚢📋💼🌍📞',

      // Default fallback emojis for any career
      'default': '⭐📦🎁🎈🎯🔵🔴🟡🟢🟣🟠⚫⚪'
    };

    // Get career-appropriate emojis
    const careerEmojis = careerEmojiMap[careerName || ''] || careerEmojiMap['default'];

    return `
========================================
🔴🔴🔴 STOP - CRITICAL COUNTING QUESTION RULES 🔴🔴🔴
========================================

⛔⛔⛔ ABSOLUTE PROHIBITION ⛔⛔⛔
THE QUESTION TEXT MUST NEVER CONTAIN ANY EMOJIS!
THE QUESTION TEXT MUST NEVER CONTAIN ANY EMOJIS!
THE QUESTION TEXT MUST NEVER CONTAIN ANY EMOJIS!

ALL EMOJIS GO IN THE 'visual' FIELD ONLY!

🚫 COMPLETELY FORBIDDEN - WILL FAIL VALIDATION:
{
  "question": "How many basketballs are there? 🏀🏀🏀",  ← WRONG! Has emojis!
  "visual": "🏀🏀🏀"
}

✅ ONLY CORRECT FORMAT:
{
  "question": "How many basketballs are there?",  ← RIGHT! No emojis in text!
  "visual": "🏀🏀🏀"  ← Emojis ONLY here!
}

========================================
MANDATORY COUNTING QUESTION STRUCTURE
========================================

1. question field: PURE TEXT ONLY - NO EMOJIS EVER!
2. visual field: ALL EMOJIS GO HERE AND ONLY HERE!
3. correct_answer: The count number

🎯 CAREER-APPROPRIATE EMOJI SELECTION:
${careerName ? `For ${careerName}, use ONLY these emojis IN THE VISUAL FIELD: ${careerEmojis}` : 'Use generic counting objects: ⭐📦🎁🎈🎯'}

========================================
✅ CORRECT EXAMPLES FOR ${careerName || 'ANY CAREER'}
========================================

EXAMPLE 1:
{
  "question": "How many sports balls are on the field?",
  "visual": "⚽🏀🏈",
  "correct_answer": 3
}

EXAMPLE 2:
{
  "question": "Count the items above",
  "visual": "🏆🏆",
  "correct_answer": 2
}

EXAMPLE 3:
{
  "question": "How many ${careerName === 'Coach' ? 'uniforms' : 'items'} does ${careerName || 'the professional'} need?",
  "visual": "${careerName === 'Coach' ? '👕👕👕👕' : '⭐⭐⭐⭐'}",
  "correct_answer": 4
}

========================================
❌ NEVER GENERATE THESE WRONG FORMATS
========================================

WRONG 1 - Emojis in question text:
{
  "question": "How many are there? 🏀🏀🏀",  ← EMOJIS IN QUESTION = WRONG!
  "visual": "🏀🏀🏀"
}

WRONG 2 - Emojis embedded in sentence:
{
  "question": "The coach sees 🏀🏀. How many?",  ← EMOJIS IN QUESTION = WRONG!
  "visual": "🏀🏀"
}

WRONG 3 - Any emoji anywhere in question:
{
  "question": "Count these items: ⚽⚽⚽",  ← EMOJIS IN QUESTION = WRONG!
  "visual": "⚽⚽⚽"
}

========================================
FINAL REMINDER - THIS IS CRITICAL
========================================

Before generating EACH counting question, verify:
☐ Question text has ZERO emojis (not a single one!)
☐ Visual field contains ALL the emojis
☐ Question refers to items generically or by career context
☐ Emojis in visual field match the career (${careerName || 'generic'})

If you put ANY emoji in the question text, the entire response will be REJECTED!`;
  }

  /**
   * Generate a simplified prompt for quick testing
   */
  buildSimplePrompt(
    subject: string,
    grade: string,
    questionType: string,
    includeSupport: boolean = true
  ): string {
    const rules = UNIVERSALCONTENT_RULES.ANSWER_FORMATS[questionType as keyof typeof UNIVERSALCONTENT_RULES.ANSWER_FORMATS];

    return `
Generate a ${questionType} question for ${subject}, grade ${grade}.

MANDATORY FIELDS:
- question
- type: "${questionType}"
- visual: (use "❓" for text-only)
- correct_answer: ${rules?.format || 'appropriate format'}
- hint
- explanation
${includeSupport ? '- practiceSupport (full structure)' : ''}

correct_answer format: ${rules?.aiInstruction || 'see rules'}

Generate now in JSON format:
`;
  }
}

// Export singleton instance
export const promptBuilder = PromptBuilder.getInstance();