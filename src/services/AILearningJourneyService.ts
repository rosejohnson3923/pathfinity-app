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
import { getGradeCategory } from './ai-prompts/rules/SubjectRules';

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

export interface AIExperienceContent {
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
        id: career?.name?.toLowerCase() || 'general',
        name: career?.name || 'Professional',
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

    // REMOVED: Old inline prompt generation - now using PromptBuilder
    const availableTypes = GRADE_TYPE_MAP[student.grade_level] || GRADE_TYPE_MAP['3'];
    
    /* OLD PROMPT CODE REMOVED - Using PromptBuilder instead
    const typeExamples = availableTypes.map(type => {
      switch(type) {
        case 'counting':
          return `"counting": Visual counting (K-2 only, REQUIRES visual field)`;
        case 'true_false':
          return `"true_false": True/false question (always include visual field - use "❓" for text-only questions)`;
        case 'multiple_choice':
          return `"multiple_choice": 4 options with one correct answer`;
        case 'numeric':
          return `"numeric": Number-only answer`;
        case 'fill_blank':
          return `"fill_blank": Text completion with blank`;
        default:
          return '';
      }
    }).filter(Boolean).join('\n');

    // Add grade-specific instructions
    const isYoungLearner = student.grade_level === 'K' || student.grade_level === '1' || student.grade_level === '2';
    const typeInstructions = `

CRITICAL - QUESTION TYPE RULES:

You MUST use ONLY these exact types for grade ${student.grade_level}:
${typeExamples}

STRICT RULES BY SUBJECT:

MATH RULES:
1. "How many" questions for K-2 → type MUST be "counting" with visual
2. "How many" questions for 3+ → type MUST be "numeric"
3. Counting type MUST include visual field with emojis
4. Can use all types: counting, numeric, multiple_choice, true_false

ELA RULES:
1. NEVER use "counting" type - even if asking about quantity
2. Letter identification → "multiple_choice" with letter options
3. Phonics/rhyming → "multiple_choice" with word options
4. True/False for reading comprehension only
5. Never ask "How many letters" - ask "Which letter" instead

SCIENCE RULES:
1. NEVER use "counting" type
2. Use "true_false" for all true/false questions
3. For text-only: set visual="❓"
4. For visual support: use appropriate emojis
4. Use "multiple_choice" for categorization (Which animal lives in water?)
5. Observations → "multiple_choice" (What happens when ice melts?)
6. Never count objects - classify or describe them instead

SOCIAL STUDIES RULES:
1. NEVER use "counting" type
2. Community helpers → "multiple_choice" (Who helps when sick?)
3. Geography → "true_false" for all questions (visual="❓" for text-only)
4. Cultural topics → "multiple_choice" with descriptive options
5. Focus on relationships and roles, not quantities

GENERAL RULES:
1. ONLY use types from the approved list for the grade
2. Multiple choice MUST have exactly 4 options
3. True/False questions MUST start with "True or False:"
4. ALWAYS include visual field - use "❓" when no visual needed
5. true_false correct_answer MUST be boolean (true/false), NOT strings

CORRECT EXAMPLES (Even for "Counting to 3" skill, use VARIED types):

{
  "question": "True or False: The ${career?.name || 'doctor'} counted 3 tools.",
  "type": "true_false",  // ✅ Always use true_false
  "visual": "🔧🔧🔧",  // Visual support for the question
  "correct_answer": true,  // ✅ Boolean, not string!
  "hint": "Look at the visual and count",
  "explanation": "Yes! There are exactly 3 tools."
}

// Example of text-only true/false:
{
  "question": "True or False: Water freezes at 0 degrees Celsius.",
  "type": "true_false",
  "visual": "❓",  // ✅ Placeholder for text-only questions
  "correct_answer": true,  // ✅ Boolean value
  "hint": "Think about ice",
  "explanation": "Water freezes at 0°C or 32°F"
}

{
  "question": "How many ${career?.name === 'Doctor' ? 'stethoscopes' : career?.name === 'Athlete' ? 'basketballs' : 'tools'} do you see?",
  "type": "counting",  // ✅ CORRECT: counting type when asking "how many" with visual
  "visual": "${career?.name === 'Doctor' ? '🩺 🩺 🩺' : career?.name === 'Athlete' ? '🏀 🏀 🏀' : '🔧 🔧 🔧'}",
  "correct_answer": 3,  // ✅ Number, not string!
  "hint": "Count each one carefully",
  "explanation": "There are 3!"
}

{
  "question": "The ${career?.name || 'chef'} prepared 3 meals. How many meals is that?",
  "type": "multiple_choice",  // ✅ CORRECT: multiple_choice for counting practice
  "options": ["2 meals", "3 meals", "4 meals", "5 meals"],
  "correct_answer": 1,
  "hint": "Read the question carefully",
  "explanation": "The chef prepared 3 meals!"
}

ELA LETTER EXAMPLES (NEVER use counting for these!):

{
  "question": "Which letter does the ${career?.name || 'teacher'} need for the word 'CAT'?",
  "type": "multiple_choice",  // ✅ CORRECT: multiple_choice for letter identification
  "options": ["B", "C", "D", "E"],
  "correct_answer": 1,
  "hint": "Look at the first letter of CAT",
  "explanation": "The letter C starts the word CAT!"
}

{
  "question": "The ${career?.name || 'chef'} sees this letter on the menu: G. Which letter is it?",
  "type": "multiple_choice",  // ✅ CORRECT: NOT counting even though ELA
  "options": ["E", "F", "G", "H"],
  "correct_answer": 2,
  "hint": "Look carefully at the shape",
  "explanation": "That's the letter G!"
}

❌ WRONG for ELA: "How many letters are in the word DOG?" - Don't ask counting questions for ELA!
✅ RIGHT for ELA: "Which letter comes first: D, O, or G?" - Ask about letter identification
`;

    // CAREER-FIRST LEARNING PROMPT
    const careerContext = career ? `
CAREER CONTEXT (MOST IMPORTANT):
${student.display_name} wants to be a ${career.name}!
ALL content MUST show how a ${career.name} uses ${skill.skill_name} in their daily work.
- Every example must be about what a ${career.name} does
- Every practice question must relate to ${career.name} tasks
- Every visual should show ${career.name}-related scenarios
- Make ${student.display_name} feel like they're training to be a real ${career.name}!

CRITICAL - INDUSTRY-APPROPRIATE ITEMS ONLY:
You MUST use items that are ACTUALLY used in the ${career.name} profession/industry:
${career.name === 'Athlete' ? `
- ✅ CORRECT for Athletes: sports water bottles (NOT baby bottles!), basketballs, soccer balls, tennis balls, running shoes, jerseys, medals, trophies, cones, hurdles, weights
- ❌ WRONG for Athletes: baby bottles, feeding bottles, regular household items, non-sports items
- Use specific sports equipment and athletic gear ONLY
- When mentioning water, ALWAYS say "sports water bottles" or "sports drinks" - NEVER just "bottles"
` : career.name === 'Doctor' ? `
- ✅ CORRECT for Doctors: stethoscopes, medical charts, thermometers, bandages, medicine bottles, syringes, gloves
- ❌ WRONG for Doctors: unrelated tools, kitchen items
- Use actual medical equipment and healthcare items ONLY
` : career.name === 'Teacher' ? `
- ✅ CORRECT for Teachers: pencils, books, whiteboards, markers, notebooks, rulers, globes, computers
- ❌ WRONG for Teachers: unrelated professional tools
- Use actual classroom and educational items ONLY
` : career.name === 'Chef' ? `
- ✅ CORRECT for Chefs: pots, pans, chef knives, spatulas, ingredients, plates, recipes, aprons
- ❌ WRONG for Chefs: medical equipment, sports items
- Use actual kitchen and culinary items ONLY
` : `
- Use items that professionals in this field ACTUALLY use
- Avoid generic or unrelated items
- Be specific to the ${career.name} industry
`}

IMPORTANT: Every single item, scenario, and example MUST be authentic to what a real ${career.name} would encounter in their professional life!
` : '';

    // Adaptive instruction based on practice performance
    const adaptiveContext = practiceResults ? `
ADAPTIVE INSTRUCTION BASED ON PRACTICE:
The student just completed diagnostic practice with ${practiceResults.correct}/${practiceResults.total} correct.
${practiceResults.struggles.length > 0 ? `Areas of struggle: ${practiceResults.struggles.join(', ')}` : ''}
ADJUST INSTRUCTION ACCORDINGLY:
- If performance was weak (< 50%), focus on fundamentals and basics
- If performance was moderate (50-80%), balance review with new concepts  
- If performance was strong (> 80%), move quickly to advanced applications
- Address specific struggle areas directly in examples
` : '';

    const oldPrompt = `Create a comprehensive learning experience for ${student.display_name}, a ${student.grade_level} student.

STORYLINE CONTINUITY (Maintain this narrative thread):
Setting: ${storylineContext.setting}
Scenario: ${student.display_name} is ${storylineContext.scenario}
Current Challenge: ${storylineContext.currentChallenge}
Career Connection: ${storylineContext.careerConnection}

${careerContext}
${adaptiveContext}
SKILL TO TEACH: ${skill.skill_name}
SUBJECT: ${skill.subject}
STUDENT GRADE: ${student.grade_level}
STUDENT NAME: ${student.display_name}

SUBJECT-SPECIFIC REQUIREMENTS FOR ${skill.subject.toUpperCase()}:
${skill.subject === 'Math' ? `
Mathematics Content:
- Focus on numerical concepts, patterns, arithmetic, geometry, measurement
- Use counting, comparison, addition, subtraction appropriate for grade ${student.grade_level}
- Include visual representations of mathematical concepts
- Practice problems should involve calculations, number recognition, or pattern identification
${skill.skill_name.includes('up to 3') ? `

⚠️ CRITICAL NUMBER LIMIT FOR THIS SKILL: "up to 3" means MAXIMUM OF 3!
- ALL numbers in questions MUST be 3 or less (never 4, 5, 6, 7, etc.)
- ALL visual counts MUST show 3 items or fewer
- ALL answers MUST be 3 or less
- Examples: ✅ "2 water bottles", ✅ "3 basketballs", ❌ "5 trophies", ❌ "7 soccer balls"
- When creating visuals: ✅ "⚽⚽⚽" (3 items), ❌ "⚽⚽⚽⚽⚽" (5 items)` : ''}
` : skill.subject === 'ELA' ? `
English Language Arts Content:
- Focus on reading, writing, phonics, vocabulary, grammar
- Include letter recognition, word families, sentence structure for grade ${student.grade_level}
- Practice comprehension, spelling, and language usage
- Questions should test literacy skills like rhyming, alphabetical order, or word meanings
` : skill.subject === 'Science' ? `
Science Content:
- Focus on natural world, living things, physical properties, earth science
- Include observations, predictions, cause and effect for grade ${student.grade_level}
- Practice scientific thinking and basic concepts
- Questions should explore nature, animals, weather, materials, or simple experiments
` : skill.subject === 'Social Studies' ? `
Social Studies Content:
- Focus on community, geography, history, cultures, citizenship
- Include people, places, traditions appropriate for grade ${student.grade_level}
- Practice understanding society and relationships
- Questions should cover families, jobs, maps, holidays, or community helpers
` : `General ${skill.subject} content appropriate for grade ${student.grade_level}`}

IMPORTANT - NEW PHASE ORDER:
This follows Practice → Instruction → Assessment flow.
- Practice questions are DIAGNOSTIC (testing prior knowledge)
- Instruction should ADAPT based on practice performance
- Assessment questions must be DIFFERENT from practice questions

CRITICAL INSTRUCTION ABOUT QUESTION TYPES:
The skill name "${skill.skill_name}" describes WHAT to teach, NOT the question types to use.
Even if the skill is "Counting to 3", you should use VARIED question types:
- Some questions can be counting type (with visuals)
- Some should be true_false (e.g., "True or False: The doctor counted 3 tools")
- Some should be multiple_choice (e.g., "How many items did the chef prepare? a) 2 b) 3 c) 4 d) 5")
DO NOT make all questions the same type just because of the skill name!
${typeInstructions}
${career && (student.grade_level === 'K' || student.grade_level === '1' || student.grade_level === '2') ? `
KINDERGARTEN/EARLY ELEMENTARY REQUIREMENTS:
- Use VERY simple vocabulary (5-6 year old level)
- Keep numbers small (1-10 for K, 1-20 for grade 1-2)
- Use familiar, concrete objects
- Make career connections simple and fun
- Example for ${career.name === 'Doctor' ? 'Doctor' : career.name}:
  ${career.name === 'Doctor' ? 
    `- "Let's help people feel better by counting!"
     - "Count the happy faces after the doctor helps!"
     - "How many toys are in the doctor's waiting room?"` :
  career.name === 'Teacher' ?
    `- "Count the books on the teacher's desk!"
     - "How many friends are in our classroom?"
     - "Let's count the crayons we need!"` :
  career.name === 'Firefighter' ?
    `- "Count the fire trucks!"
     - "How many helpers does the firefighter need?"
     - "Let's count the safety hats!"` :
    `- "Count items that ${career.name}s use!"
     - "How many tools does a ${career.name} need?"
     - "Let's count together like a ${career.name}!"`}

VISUAL EMOJI GUIDANCE - USE INDUSTRY-APPROPRIATE EMOJIS ONLY:
${career.name === 'Athlete' ? `
For Athletes, use these emojis ONLY:
- Water: 💧 or 🥤 (sports drink), NEVER 🍼 (baby bottle)
- Balls: ⚽ 🏀 🏈 ⚾ 🎾 🏐 (specific sports balls)
- Equipment: 👟 (running shoes), 🏃 (runner), 🏅 (medal), 🏆 (trophy)
- Training: 🔴 (cones), 🏋️ (weights), 🎯 (target)
` : career.name === 'Doctor' ? `
For Doctors, use these emojis ONLY:
- Medical: 🩺 (stethoscope), 💊 (medicine), 🌡️ (thermometer), 🩹 (bandage)
- Healthcare: 🏥 (hospital), 🚑 (ambulance), 💉 (syringe)
` : career.name === 'Teacher' ? `
For Teachers, use these emojis ONLY:
- School: 📚 (books), ✏️ (pencil), 📝 (paper), 🎒 (backpack)
- Classroom: 🖊️ (pen), 📐 (ruler), 🌍 (globe), 💻 (computer)
` : career.name === 'Chef' ? `
For Chefs, use these emojis ONLY:
- Food: 🍳 (cooking), 🥘 (pot), 🍽️ (plate), 🥄 (spoon)
- Kitchen: 👨‍🍳 (chef), 🔪 (knife), 🧑‍🍳 (cook)
` : `Use profession-appropriate emojis ONLY`}
` : ''}

Generate a complete learning journey with:

1. PRACTICE PHASE (DIAGNOSTIC - Comes FIRST):
   - EXACTLY 5 diagnostic questions to test PRIOR KNOWLEDGE (MUST BE 5 QUESTIONS, NOT 3!)
   - These are exploratory questions to see what student already knows
   - Use ONLY these types: ${availableTypes.join(', ')}
   - Start simple and increase difficulty progressively
   - Mix different question types for variety
   - Questions should test understanding WITHOUT teaching first
   - CRITICAL: Questions MUST be specific to ${skill.subject}:
     ${skill.subject === 'Math' ? `
     * Math: Focus on numbers, counting, arithmetic, patterns, shapes, measurements
     * Example: "How many ${career ? career.name + ' tools' : 'objects'} do you see?"
     * Example: "What number comes after 5?"
     * Example: "Which shape has 3 sides?"` : 
     skill.subject === 'ELA' ? `
     * ELA: Focus on letters, words, reading, phonics, vocabulary, sentence structure
     * NEVER ask "How many letters" - instead ask "Which letter is this?" or "Find the letter X"
     * Example: "Which letter comes first in the alphabet: B or D?"
     * Example: "What rhymes with 'cat'?"
     * Example: "Which word means the same as 'happy'?"
     * Example: "Which letter is this: E, G, H, or J?" (for letter identification)` :
     skill.subject === 'Science' ? `
     * Science: Focus on nature, animals, weather, plants, body parts, basic physics
     * NEVER ask counting questions (not "How many legs does a spider have?")
     * Example: "True or False: Plants need water to grow"
     * Example: "Which animal lives in water: bird, fish, cat, or dog?"
     * Example: "What happens to ice when it gets warm: melts, freezes, grows, or flies?"` :
     skill.subject === 'Social Studies' ? `
     * Social Studies: Focus on community, family, jobs, maps, holidays, cultures
     * NEVER ask counting questions (not "How many people in a family?")
     * Example: "Who helps us when we're sick: doctor, baker, artist, or swimmer?"
     * Example: "True or False: The 4th of July is America's birthday"
     * Example: "Which is bigger: your house or your city?"`
     : `* General subject-appropriate questions for ${skill.subject}`}
   - Each question MUST include full practice support:
     * Pre-question context connecting to ${career ? `${career.name}` : 'real world'}
     * Encouraging message (since this is diagnostic)
     * 3 progressive hints (easy → medium → detailed)
     * Correct answer feedback with encouragement
     * Incorrect answer support (gentle, since they haven't learned it yet)
     * Teaching moment preview (what they'll learn next)

2. INSTRUCTION PHASE (ADAPTIVE - Based on practice performance):
   - Engaging title ${career ? `with ${student.display_name} as the ${career.name}` : ''}
   - Personal greeting: ${career ? `"Welcome, ${career.name} ${student.display_name}!"` : `"Welcome, ${student.display_name}!"`}
   - Clear concept explanation showing ${career ? `how you as a ${career.name} use ${skill.skill_name}` : `${skill.skill_name}`}
   - 3 step-by-step examples ${career ? `from a ${career.name}'s daily work` : 'with clear explanations'}
   ${practiceResults ? '- Focus on areas where student struggled in practice' : ''}
   ${practiceResults && practiceResults.correct < practiceResults.total * 0.5 ? '- Extra emphasis on fundamentals' : ''}
   ${practiceResults && practiceResults.correct >= practiceResults.total * 0.8 ? '- Can move quickly to advanced concepts' : ''}

3. ASSESSMENT PHASE (VALIDATION):
   - 1 comprehensive assessment question  
   - MUST BE DIFFERENT from practice questions
   - Tests understanding of what was taught in instruction
   - Include visual field with CAREER-APPROPRIATE emojis if it's a counting question
   - 4 multiple choice options
   - Detailed explanation
   - Encouraging success message
   - MUST use industry-appropriate items and scenarios ONLY

REQUIREMENTS:
- Use ${student.display_name}'s name throughout
- Grade ${student.grade_level} appropriate language:
  ${student.grade_level === 'K' ? '• Kindergarten: Very simple words, short sentences, basic concepts only' :
    student.grade_level === '1' ? '• Grade 1: Simple vocabulary, clear sentences, foundational concepts' :
    student.grade_level === '2' ? '• Grade 2: Basic vocabulary, straightforward explanations' :
    '• Age-appropriate vocabulary and complexity'}
- Include fun emojis and visual elements
- Keep explanations brief and clear
- Make it educational, fun, and achievable
- Ensure content builds understanding progressively
${student.grade_level === 'K' || student.grade_level === '1' || student.grade_level === '2' ? 
  '- IMPORTANT: Avoid complex medical/technical terms for young learners' : ''}

Return JSON following this exact structure:
{
  "title": "${career ? `${career.name} ${student.display_name} Masters ${skill.skill_name}` : `${student.display_name} Learns ${skill.skill_name}`}",
  "greeting": "${career ? `Welcome, ${career.name} ${student.display_name}! In your ${career.name === 'Chef' ? 'kitchen' : career.name === 'Artist' ? 'studio' : career.name === 'Doctor' ? 'clinic' : career.name === 'Engineer' ? 'workshop' : 'workspace'} today...` : `Welcome, ${student.display_name}! Today we're going to...`}",
  "concept": "${career ? `As a ${career.name}, you use ${skill.skill_name} to...` : `Clear explanation of ${skill.skill_name}`}",
  "examples": [
    {
      "question": "Example question",
      "answer": "Answer",
      "explanation": "Why this works",
      "visual": "Description of helpful visual"
    }
  ],
  "practice": [
    // CRITICAL: YOU MUST PROVIDE EXACTLY 5 PRACTICE QUESTIONS - NO MORE, NO LESS!
    // IF YOU PROVIDE FEWER THAN 5, THE SYSTEM WILL FAIL!
    {
      "question": "Practice question 1 text (vary types even for counting skills!)",
      "type": "MUST be one of: ${availableTypes.join(', ')} - MIX TYPES, don't use same for all!",
      "visual": "ALWAYS REQUIRED - use \"❓\" for text-only questions, appropriate emojis for visual questions",
      "options": ["A", "B", "C", "D"] (REQUIRED for multiple_choice, exactly 4),
      "correct_answer": "FORMAT BY TYPE:\n        - true_false: boolean (true or false, NOT strings)\n        - counting: number (3 not '3')\n        - numeric: number\n        - multiple_choice: index 0-3\n        - fill_blank: string",
      "hint": "Helpful hint",
      "explanation": "Learning explanation",
      "practiceSupport": {
        "preQuestionContext": "${career ? `As a ${career.name}, let's see what you already know about this` : `Let's see what you know about this skill`}",
        "connectionToLearn": "This connects to what you might already know...",
        "confidenceBuilder": "Let's explore this together, ${student.display_name}!",
        "hints": [
          {"level": 1, "hint": "First gentle hint", "visualCue": "What to look for"},
          {"level": 2, "hint": "More specific guidance", "example": "For example..."},
          {"level": 3, "hint": "Step-by-step help", "example": "Let me show you..."}
        ],
        "correctFeedback": {
          "immediate": "Great! You already understand this!",
          "careerConnection": "That's exactly how ${career ? `a ${career.name}` : 'professionals'} think about it!",
          "skillReinforcement": "You're ready to learn more about..."
        },
        "incorrectFeedback": {
          "immediate": "No worries! We'll learn this together!",
          "explanation": "Here's a hint about the answer...",
          "reteach": "We'll cover this in detail next...",
          "tryAgainPrompt": "Want to try another approach?"
        },
        "teachingMoment": {
          "conceptExplanation": "Soon you'll learn why this works...",
          "realWorldExample": "${career ? career.name + 's' : 'People'} use this skill when...",
          "commonMistakes": ["Many students think...", "A common confusion is..."]
        }
      }
    }
  ],
  "assessment": {
    "question": "Assessment question (e.g., 'How many flashlights does the Police Officer have?')",
    "type": "Question type (${availableTypes.join(' | ')})",
    "visual": "ALWAYS include - use \"❓\" for text-only, or appropriate emojis",
    "options": ["1", "2", "3", "4"] (REQUIRED for multiple_choice only),
    "correct_answer": "See FORMAT BY TYPE rules above",
    "explanation": "Detailed explanation",
    "success_message": "Great job, ${student.display_name}!"
  }
}`;*/

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
    console.log(`📚 Generating adaptive instruction based on practice performance`, {
      correct: practiceResults.correct,
      total: practiceResults.total,
      struggles: practiceResults.struggles
    });
    
    // Calculate performance level
    const performancePercentage = (practiceResults.correct / practiceResults.total) * 100;
    const performanceLevel = performancePercentage >= 80 ? 'advanced' : 
                           performancePercentage >= 60 ? 'intermediate' : 'foundational';
    
    const prompt = `Create an ADAPTIVE TEACHING LESSON for ${student.display_name}, a ${student.grade_level} student.

PRACTICE PERFORMANCE:
- Score: ${practiceResults.correct}/${practiceResults.total} (${performancePercentage.toFixed(0)}%)
- Performance Level: ${performanceLevel}
${practiceResults.struggles.length > 0 ? `- Areas needing focus: ${practiceResults.struggles.join(', ')}` : '- Strong understanding demonstrated'}

SKILL TO TEACH: ${skill.skill_name}
SUBJECT: ${skill.subject}
${career ? `CAREER CONTEXT: ${career.name}` : ''}

Based on the practice performance, create an INSTRUCTIONAL LESSON that:
${performanceLevel === 'advanced' ? 
  '- Acknowledges strong foundation and moves to advanced applications' :
  performanceLevel === 'intermediate' ?
  '- Reinforces concepts with focus on struggled areas' :
  '- Provides thorough foundational teaching with extra support'}

INSTRUCTION CONTENT NEEDED:

1. PERSONALIZED GREETING:
   - Acknowledge practice performance appropriately
   - Set expectations for what they'll learn
   - Use ${student.display_name}'s name
   ${career ? `- Reference how ${career.name}s use this skill` : ''}

2. CONCEPT EXPLANATION (NOT practice questions!):
   - Clear, grade ${student.grade_level} appropriate explanation of ${skill.skill_name}
   - Break down the concept into understandable parts
   ${performanceLevel === 'foundational' ? '- Extra emphasis on basics and fundamentals' : ''}
   ${performanceLevel === 'advanced' ? '- Include advanced insights and applications' : ''}
   ${practiceResults.struggles.length > 0 ? `- Special focus on: ${practiceResults.struggles.join(', ')}` : ''}
   ${career ? `- Show how ${career.name}s use this in their work` : ''}

3. TEACHING EXAMPLES (NOT quiz questions!):
   - 3 worked examples that TEACH the concept step-by-step
   - Each example should demonstrate a different aspect
   - Show the thinking process, not just answer
   ${performanceLevel === 'foundational' ? '- Start with very basic examples' : ''}
   ${performanceLevel === 'advanced' ? '- Include challenging applications' : ''}
   - Examples should BUILD understanding progressively

IMPORTANT:
- This is a TEACHING phase, not testing
- Examples should SHOW and EXPLAIN, not quiz
- Use "Let me show you..." not "Can you solve..."
- Examples format: "Here's how to..." with full explanation
- Make it feel like a friendly tutor explaining concepts

Return JSON:
{
  "title": "Mastering ${skill.skill_name}${career ? ` like a ${career.name}` : ''}",
  "greeting": "Hi ${student.display_name}! ${performanceLevel === 'advanced' ? 'Excellent work on the practice! You showed strong understanding. Let me teach you some advanced techniques...' : performanceLevel === 'intermediate' ? 'Good effort on the practice! Let me help you master the areas you found tricky...' : 'Thanks for trying the practice questions! Now let me teach you everything about this skill step by step...'}",
  "concept": "TEACHING explanation of ${skill.skill_name} (2-3 sentences explaining the concept clearly)",
  "examples": [
    {
      "question": "Example 1: Let me show you how to [specific aspect]",
      "answer": "The answer is [answer] because...",
      "explanation": "Here's the step-by-step thinking: First we... Then we... Finally we...",
      "visual": "Visual representation or helpful imagery"
    },
    {
      "question": "Example 2: Here's another way to think about [different aspect]",
      "answer": "We get [answer] by...",
      "explanation": "The key insight here is... Notice how... This means...",
      "visual": "Visual aid or mental model"
    },
    {
      "question": "Example 3: Let's apply this to ${career ? `a ${career.name} situation` : 'a real-world scenario'}",
      "answer": "The solution is [answer]",
      "explanation": "In this situation, we... The important thing to remember is...",
      "visual": "Practical visualization"
    }
  ]
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
  ): Promise<AIExperienceContent> {
    console.log(`🎯 Generating AI Experience content for ${skill.skill_number}: ${skill.skill_name}`, {
      career: career?.name || 'No career context'
    });

    // Get or create storyline context for continuity
    const skillKey = `${student.id}-${skill.skill_number}`;
    const storylineContext = this.getStorylineContext(skillKey, skill, career);

    // Experience is ALWAYS career-focused - use provided career or generate appropriate one
    const careerToUse = career?.name || this.getDefaultCareerForGrade(student.grade_level, skill.subject);
    
    const prompt = `Create an immersive FIRST-PERSON career experience for ${student.display_name}, a ${student.grade_level} student.

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

2. REAL-WORLD CONNECTIONS:
   - 3 situations written as "You encounter..." or "Your boss asks you to..."
   - Challenges written as "You need to figure out..."
   - Solutions written as "You decide to..."
   - Always use "you/your" not "${student.display_name}"

3. INTERACTIVE SIMULATION:
   - Setup: "You arrive at work and..."
   - Challenges: "What would YOU do?" scenarios
   - Options should be "I would..." choices
   - Outcomes: "You chose to... and this happened..."
   - Learning: "You learned that..."

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
  "character_context": "Welcome, ${careerToUse} ${student.display_name}! You're a professional ${careerToUse} who...",
  "career_introduction": "As ${careerToUse} ${student.display_name}, you use ${skill.skill_name} every day to...",
  "real_world_connections": [
    {
      "situation": "You encounter... (first-person situation)",
      "challenge": "You need to... (what YOU must solve)",
      "solution_approach": "You decide to... (how YOU approach it)",
      "learning_connection": "You use ${skill.skill_name} to..."
    }
  ],
  "interactive_simulation": {
    "setup": "You arrive at your ${careerToUse} job and...",
    "challenges": [
      {
        "description": "Your boss asks you to... What do you do?",
        "options": ["I would...", "I would...", "I would..."],
        "correct_choice": 0,
        "outcome": "You chose to... and it worked because...",
        "learning_point": "You learned that ${skill.skill_name} helps you..."
      }
    ],
    "conclusion": "Great job today! As a ${careerToUse}, you successfully..."
  }
}`;

    try {
      const response = await azureOpenAIService.generateWithModel(
        'gpt4o',
        prompt,
        'You are an expert career education specialist creating immersive professional experiences.',
        { temperature: 0.8, maxTokens: 3500, jsonMode: true }
      );

      const content = JSON.parse(response);
      console.log(`✅ Generated AI Experience content for ${skill.skill_number}`, {
        title: content.title,
        scenario: content.scenario?.substring(0, 100),
        character_context: content.character_context?.substring(0, 100),
        career_introduction: content.career_introduction?.substring(0, 100)
      });
      return content;

    } catch (error) {
      console.error(`❌ AI Experience content generation failed:`, error);
      return this.generateFallbackExperienceContent(skill, student);
    }
  }

  /**
   * Generate AI-powered Discover container content
   */
  async generateDiscoverContent(
    skill: LearningSkill,
    student: StudentProfile,
    career?: { name: string; description?: string }
  ): Promise<AIDiscoverContent> {
    console.log(`🔍 Generating AI Discover content for ${skill.skill_number}: ${skill.skill_name}`, {
      career: career?.name || 'No career context'
    });

    // Get or create storyline context for continuity
    const skillKey = `${student.id}-${skill.skill_number}`;
    const storylineContext = this.getStorylineContext(skillKey, skill, career);

    const careerContext = career ? `
CAREER FOCUS: ${career.name}
Frame all discoveries around how YOU as a ${career.name} innovate and explore with ${skill.skill_name}
` : '';

    const prompt = `Create a FIRST-PERSON exploration and discovery experience for ${student.display_name}, a ${student.grade_level} student.

STORYLINE CONTINUITY (Conclude this journey):
Setting: ${storylineContext.setting}
Journey So Far: ${student.display_name} has been ${storylineContext.scenario}
Final Discovery: ${storylineContext.currentChallenge}
Real-World Impact: ${storylineContext.careerConnection}
${careerContext}
SKILL TO EXPLORE: ${skill.skill_name}
SUBJECT: ${skill.subject}
STUDENT: ${student.display_name} (Grade ${student.grade_level})
${skill.skill_name.includes('up to 3') ? `

⚠️ CRITICAL NUMBER LIMIT: This skill specifies "up to 3" - ALL numbers MUST be 3 or less!
- Never use numbers greater than 3 in any discovery activity
- All counting explorations must involve 3 items or fewer
- Examples: ✅ "You discover 2 patterns", ✅ "You find 3 clues", ❌ "You explore 5 options"` : ''}

CRITICAL: Write everything in SECOND PERSON ("You discover...", "You explore...", "Your investigation...")
The student is actively discovering - they're the explorer, the scientist, the innovator!

Design a discovery journey where the student explores as a ${career ? career.name : 'curious explorer'}:

1. EXPLORATION THEME:
   - "You're investigating how ${career ? `${career.name}s` : 'professionals'} use ${skill.skill_name}..."
   - Questions written as "What would YOU discover if...?"
   - "Your mission is to explore..."

2. DISCOVERY PATHS:
   - 3 paths written as "You can explore..."
   - Activities written as "You will..." or "Your task is..."
   - Instructions as "You need to..." or "Try to..."
   - Outcomes as "You discovered that..."

3. CONNECTIONS:
   - "You learned earlier that..."
   - "As a ${career ? career.name : 'professional'}, you used this when..."
   - "Next, you might want to explore..."

REQUIREMENTS:
- ALWAYS use second person ("You explore", "You discover", "Your investigation")
- NEVER use third person ("${student.display_name} explores", "${student.display_name} discovers")
- Age-appropriate discovery for grade ${student.grade_level}
- Make the student feel they ARE the explorer/innovator
- Show how THEY discover new uses for ${skill.skill_name}

Return JSON:
{
  "title": "${career ? `${career.name} ${student.display_name}'s` : `${student.display_name}'s`} ${skill.skill_name} Discovery",
  "exploration_theme": "Welcome, ${career ? `${career.name} ${student.display_name}` : `Explorer ${student.display_name}`}! You're on a mission to discover how ${career ? `you as a ${career.name}` : 'professionals'} innovate with ${skill.skill_name}...",
  "curiosity_questions": [
    "What would you discover if...?",
    "How could you use ${skill.skill_name} to...?",
    "What happens when you...?"
  ],
  "discovery_paths": [
    {
      "path_name": "Your Research Path",
      "description": "You will investigate...",
      "activities": [
        {
          "activity_type": "research",
          "title": "Your Investigation",
          "instructions": "You need to... (what YOU should do)",
          "expected_outcome": "You will discover..."
        }
      ],
      "reflection_questions": [
        "What did you discover about...?",
        "How could you use this in your ${career ? career.name : ''} work?"
      ]
    }
  ],
  "connections": {
    "to_learn": "You learned that ${skill.skill_name} helps you...",
    "to_experience": "As a ${career ? career.name : 'professional'}, you used this to...",
    "to_future_learning": "Next, you might want to explore..."
  }
}`;

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

  private generateFallbackExperienceContent(skill: LearningSkill, student: StudentProfile): AIExperienceContent {
    const careers = {
      'Math': 'Engineer',
      'Science': 'Scientist',
      'ELA': 'Writer',
      'Social Studies': 'Community Leader'
    };
    
    const skillName = skill?.skill_name || 'this skill';
    const subject = skill?.subject || 'learning';
    const career = careers[subject as keyof typeof careers] || 'Professional';
    
    return {
      title: `Your Day as a ${career}`,
      scenario: `You are a ${career} starting your workday!`,
      character_context: `Welcome! You're a professional ${career} who uses ${skillName} every day.`,
      career_introduction: `As a ${career}, you use ${skillName} to solve important problems and help people.`,
      real_world_connections: [
        {
          situation: `You encounter a challenge that requires ${skillName}`,
          challenge: 'You need to solve this professional problem',
          solution_approach: 'You decide to approach it this way',
          learning_connection: `You use ${skillName} to complete the task`
        }
      ],
      interactive_simulation: {
        setup: `You arrive at your ${career} job and your boss has a task for you!`,
        challenges: [
          {
            description: 'Your boss asks you to handle this challenge. What do you do?',
            options: ['I would try approach A', 'I would try approach B', 'I would try approach C'],
            correct_choice: 0,
            outcome: 'You chose the best approach! Your solution worked perfectly.',
            learning_point: `You successfully used ${skillName} like a real ${career}!`
          }
        ],
        conclusion: `Amazing work today! You're thinking and working like a true ${career}.`
      }
    };
  }

  private generateFallbackDiscoverContent(skill: LearningSkill, student: StudentProfile, career?: any): AIDiscoverContent {
    const skillName = skill?.skill_name || 'this concept';
    const studentName = student?.display_name || 'Explorer';
    const subject = skill?.subject || 'learning';
    const careerName = career?.name || this.getDefaultCareerForGrade(student.grade_level, subject);
    
    return {
      title: `${careerName} ${studentName}'s ${skillName} Discovery`,
      exploration_theme: `Welcome, ${careerName} ${studentName}! You're on a mission to discover how you as a ${careerName} can innovate with ${skillName}!`,
      curiosity_questions: [
        `Where could you find ${skillName} in your world?`,
        `How could you use ${skillName} in new ways?`,
        `What would you create with ${skillName}?`
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