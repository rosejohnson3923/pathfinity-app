/**
 * LEARN Container-Specific Rules - Define the tone, context, and structure for Learn container
 * These rules shape the learning experience style for LEARN and its embedded ASSESSMENT
 */

import { ContainerRule } from './UniversalContainerRules';

export const LEARNCONTAINER_RULES: Record<string, ContainerRule> = {
  LEARN: {
    context: {
      career_integration: 'Deep integration - show how professionals use this skill daily',
      focus: 'Skill mastery through guided practice',
      progression: 'Build from recognition → recall → application'
    },
    tone: {
      instruction: 'Clear, structured, educational',
      encouragement: 'Supportive with specific praise',
      feedback: 'Detailed explanations of why answers are correct/incorrect'
    },
    structure: {
      examples: '3 worked examples showing the concept in action',
      practice: '5 scaffolded questions with full practiceSupport',
      assessment: '1 culminating question testing mastery'
    },
    special_features: {
      career_stories: 'Include brief anecdotes of career using skill',
      real_world_math: 'Use career-specific scenarios and tools',
      visual_learning: 'Leverage visual representations when helpful',
      progressive_hints: 'Three levels of hints from gentle to explicit'
    }
  },

   ASSESSMENT: {
    context: {
      career_integration: 'Professional competency demonstration',
      focus: 'Accurate skill evaluation',
      progression: 'Demonstrate mastery across difficulty levels'
    },
    tone: {
      instruction: 'Clear, neutral, professional',
      encouragement: 'Confidence-building before questions',
      feedback: 'Constructive with clear next steps'
    },
    structure: {
      practice: '3-5 varied difficulty questions',
      assessment: 'Adaptive based on performance'
    },
    special_features: {
      no_hints: 'Assessment mode - no hints during questions',
      time_tracking: 'Can include time awareness',
      confidence_rating: 'Student can rate confidence per question',
      detailed_report: 'Comprehensive feedback after completion'
    }
  }
};

// Format container rules for AI prompt
export function formatLearnContainerRulesForPrompt(container: string, career?: string): string {
  const rules = LEARNCONTAINER_RULES[container];
  if (!rules) return '';
  
  let output = `
========================================
${container} CONTAINER APPROACH
========================================

CONTEXT:
  • Career Integration: ${rules.context.career_integration}
  • Learning Focus: ${rules.context.focus}`;
  
  if (rules.context.progression) {
    output += `
  • Progression: ${rules.context.progression}`;
  }
  
  output += `

TONE & STYLE:
  • Instruction: ${rules.tone.instruction}
  • Encouragement: ${rules.tone.encouragement}  
  • Feedback: ${rules.tone.feedback}

STRUCTURE REQUIREMENTS:`;
  
  if (rules.structure.examples) {
    output += `
  • Examples: ${rules.structure.examples}`;
  }
  output += `
  • Practice: ${rules.structure.practice}
  • Assessment: ${rules.structure.assessment}`;
  
  if (rules.special_features) {
    output += `

SPECIAL FEATURES FOR ${container}:`;
    Object.entries(rules.special_features).forEach(([feature, description]) => {
      output += `
  • ${feature.replace(/_/g, ' ').toUpperCase()}: ${description}`;
    });
  }
  
  if (career) {
    output += `

CAREER CONTEXT: ${career}
  • Use ${career}-specific scenarios and examples
  • Reference tools and situations ${career}s encounter
  • Show how ${career}s use this skill professionally`;
  }
  
  return output;
}

// Get container-specific requirements
export function getLearnContainerRequirements(container: string): {
  exampleCount: number;
  practiceCount: number;
  assessmentCount: number;
  requiresSupport: boolean;
} {
  const rules = LEARNCONTAINER_RULES[container];
  if (!rules) {
    return {
      exampleCount: 3,
      practiceCount: 5,
      assessmentCount: 1,
      requiresSupport: true
    };
  }
  
  // Parse counts from structure strings
  const exampleMatch = rules.structure.examples?.match(/(\d+)/);
  const practiceMatch = rules.structure.practice.match(/(\d+)/);
  const assessmentMatch = rules.structure.assessment.match(/(\d+)/);
  
  return {
    exampleCount: exampleMatch ? parseInt(exampleMatch[1]) : 3,
    practiceCount: practiceMatch ? parseInt(practiceMatch[1]) : 5,
    assessmentCount: assessmentMatch ? parseInt(assessmentMatch[1]) : 1,
    requiresSupport: container !== 'ASSESSMENT'
  };
}

// Validate container-specific requirements
export function validateLearnContainerRules(
  content: any,
  container: string
): string[] {
  const errors: string[] = [];
  const requirements = getLearnContainerRequirements(container);
  
  // Check example count
  if (content.examples) {
    if (content.examples.length !== requirements.exampleCount) {
      errors.push(`${container} requires exactly ${requirements.exampleCount} examples, got ${content.examples.length}`);
    }
  }
  
  // Check practice count
  if (content.practice) {
    if (content.practice.length !== requirements.practiceCount) {
      const errorMsg = `⚠️ CRITICAL: ${container} requires exactly ${requirements.practiceCount} practice questions, but AI returned only ${content.practice.length}`;
      errors.push(errorMsg);
      console.error(errorMsg);
      console.error('Practice questions received:', content.practice.map((q: any, i: number) => `${i+1}. ${q.question?.substring(0, 50)}...`));
    }
    
    // Check for practiceSupport in non-assessment containers
    if (requirements.requiresSupport) {
      content.practice.forEach((q: any, index: number) => {
        if (!q.practiceSupport) {
          errors.push(`Practice question ${index + 1} missing required practiceSupport structure`);
        }
      });
    }
  }
  
  // Check assessment count
  if (content.assessment) {
    const assessmentCount = Array.isArray(content.assessment) 
      ? content.assessment.length 
      : 1;
    if (assessmentCount !== requirements.assessmentCount) {
      errors.push(`${container} requires exactly ${requirements.assessmentCount} assessment question(s)`);
    }
  }
  
  return errors;
}

// Generate container-specific instructions
export function getLearnContainerInstructions(
  container: string,
  career: string,
  studentName: string,
  gradeLevel: string
): string {
  const rules = LEARNCONTAINER_RULES[container];
  if (!rules) return '';
  
  const instructions: string[] = [];
  
  switch (container) {
    case 'LEARN':
      instructions.push(
        `Create a structured learning experience where ${studentName} masters this skill step-by-step.`,
        `Show how a ${career} uses this skill in their daily work.`,
        `Build confidence through progressive practice with supportive feedback.`
      );
      break;

    case 'ASSESSMENT':
      // ASSESSMENT is part of the LEARN container flow
      instructions.push(
        `Evaluate ${studentName}'s mastery of this skill objectively.`,
        `Use varied question types appropriate for grade ${gradeLevel}.`,
        `Provide clear, constructive feedback for growth.`
      );
      break;

    default:
      // This file only handles LEARN and ASSESSMENT
      console.warn(`LearnContainerRules: Unexpected container type ${container}`);
      break;
  }
  
  return instructions.join('\n');
}

// Get LEARN-specific example structure for prompt building
export function getLearnExampleStructure(): string {
  return `
========================================
EXAMPLE PRACTICE QUESTION STRUCTURE
========================================
{
  "question": "True or False: [career-relevant statement]",
  "type": "true_false",
  "visual": "❓",
  "correct_answer": false,  // BOOLEAN, not string!
  "hint": "Think about what you learned...",
  "explanation": "The answer is false because...",
  "practiceSupport": {
    "preQuestionContext": "Let's see how [Career] uses this skill...",
    "connectionToLearn": "Remember when we discussed...",
    "confidenceBuilder": "You're doing great, [Name]!",
    "hints": [
      {
        "level": 1,
        "hint": "First, think about...",
        "visualCue": "Look for..."
      },
      {
        "level": 2,
        "hint": "The key is...",
        "example": "For instance..."
      },
      {
        "level": 3,
        "hint": "The answer is...",
        "example": "Here's why..."
      }
    ],
    "correctFeedback": {
      "immediate": "Excellent work!",
      "careerConnection": "Just like a [Career] would!",
      "skillReinforcement": "You're mastering this!"
    },
    "incorrectFeedback": {
      "immediate": "That's okay!",
      "explanation": "The correct answer is...",
      "reteach": "Let's review...",
      "tryAgainPrompt": "Want to try again?"
    },
    "teachingMoment": {
      "conceptExplanation": "This works because...",
      "realWorldExample": "[Career]s use this when...",
      "commonMistakes": ["Students often think..."]
    }
  }
}
`;
}

// Get LEARN-specific response format
export function getLearnResponseFormat(requirements: any, allowedTypes: string[]): string {
  // Generate explicit numbered practice questions to force exactly 5
  const practiceQuestionTemplates = [];
  for (let i = 1; i <= requirements.practiceCount; i++) {
    practiceQuestionTemplates.push(`
    { // PRACTICE QUESTION ${i} of ${requirements.practiceCount} - REQUIRED
      "question": "Practice question ${i} text - MUST BE DIFFERENT from other questions",
      "type": "One of: ${allowedTypes.join(', ')}",
      "visual": "REQUIRED - appropriate visual for question ${i}",
      "options": [/* if multiple_choice */],
      "correct_answer": "Format based on type",
      "hint": "Hint for question ${i}",
      "explanation": "Explanation for question ${i}",
      "practiceSupport": { /* COMPLETE structure */ }
    }${i < requirements.practiceCount ? ',' : ''}`);
  }

  return `
========================================
RESPONSE FORMAT (JSON)
========================================
IMPORTANT PRE-VALIDATION:
✗ If you generate < ${requirements.practiceCount} practice questions, YOUR RESPONSE WILL BE REJECTED
✗ If you generate > ${requirements.practiceCount} practice questions, YOUR RESPONSE WILL BE REJECTED
✓ You MUST generate EXACTLY ${requirements.practiceCount} practice questions

{
  "title": "Engaging title with career and skill",
  "greeting": "Personalized welcome using student name and career context",
  "concept": "Clear explanation of the concept and its career relevance",
  ${requirements.exampleCount > 0 ? `"examples": [
    // EXACTLY ${requirements.exampleCount} worked examples
    {
      "question": "Example question text",
      "answer": "The answer",
      "explanation": "Why this answer is correct",
      "visual": "Optional visual (\"❓\" if text-only)"
    }
  ],` : ''}
  "practice": [ // ARRAY MUST CONTAIN EXACTLY ${requirements.practiceCount} QUESTIONS${practiceQuestionTemplates.join('')}
  ],
  "assessment": {
    "question": "Final assessment question",
    "type": "Appropriate type from allowed list",
    "visual": "REQUIRED - Use appropriate emojis (shapes: ▲■●◆, warning signs: ⚠️🔺, objects: relevant emojis)",
    "options": [/* if multiple_choice */],
    "correct_answer": "Format based on type",
    "hint": "REQUIRED - Helpful hint for the assessment",
    "explanation": "Detailed explanation",
    "success_message": "Celebration with student name!"
  }
}
`;
}

// Get LEARN-specific quality checklist
export function getLearnQualityChecklist(): string {
  return `
========================================
FINAL QUALITY CHECK - LEARN
========================================
CRITICAL VALIDATION - COUNT YOUR PRACTICE QUESTIONS:
□ Count the practice questions in your response
□ If count ≠ 5, DO NOT SUBMIT - regenerate with exactly 5
□ Each practice question MUST be unique and different

Before generating, verify:
✓ EXACTLY 5 practice questions (count them: 1, 2, 3, 4, 5)
✓ All questions have ALL mandatory fields
✓ correct_answer format matches type EXACTLY
✓ visual field present in EVERY question with appropriate content:
  • Shape questions → SINGLE-SHAPE object in visual (🏀📦🔺), shape emojis in options (⭕⬜🔺▬)
  • Warning/sign questions → relevant emojis (⚠️🔺)
  • Counting questions → object emojis
  • Pure text questions → "❓" placeholder
✓ NO forbidden types used (e.g., counting for ELA)
✓ Practice questions have COMPLETE practiceSupport
✓ Career context integrated naturally
✓ Grade-appropriate language and complexity
✓ True/False uses boolean, not strings
✓ Multiple choice uses index (0-3), not text
`;
}

// Get LEARN-specific reminders
export function getLearnReminders(subject: string, grade: string): string {
  return `Remember:
1. ⚠️ CRITICAL: Generate EXACTLY 5 practice questions - not 3, not 4, EXACTLY 5!
2. EVERY question MUST have ALL mandatory fields
3. correct_answer format MUST match the question type
4. visual field is ALWAYS required:
   - For shape questions: SINGLE geometric shape only (🏀📦), NO complex/free-form (🚩☁️)
   - For warning signs: Use ⚠️ or 🔺
   - For counting: Use object emojis
   - ONLY use "❓" for pure text questions with no visual element
5. Practice questions MUST include complete practiceSupport structure
6. Use ONLY the allowed question types for ${subject} grade ${grade}
7. ${subject === 'ELA' ? 'NEVER use counting type for ELA' : ''}

FINAL CHECK: Count your practice questions → Must equal 5`;
}

// ELA-specific rules for letter recognition
export function getELALetterRules(grade: string, skillName: string): string {
  const gradeNum = grade === 'K' ? 0 : parseInt(grade);

  // Check if this is a letter recognition skill
  const isLetterSkill = skillName?.toLowerCase().includes('uppercase') ||
                       skillName?.toLowerCase().includes('lowercase') ||
                       skillName?.toLowerCase().includes('letter') ||
                       skillName?.toLowerCase().includes('capital') ||
                       skillName?.toLowerCase().includes('consonant') ||
                       skillName?.toLowerCase().includes('vowel');

  if (!isLetterSkill || gradeNum > 2) {
    return '';
  }

  return `
========================================
CRITICAL ELA LETTER RECOGNITION RULES
========================================

⚠️ ELA GRADE 1 - CONSONANTS AND VOWELS FOCUS:
If the skill is "Sort consonants and vowels", ALL questions MUST be about:
✅ Identifying vowels (A, E, I, O, U)
✅ Identifying consonants (all other letters)
✅ Questions like "Is the letter C a consonant or a vowel?"
✅ Questions like "Which letter in 'Game' is a vowel?"

❌ NEVER ask about numbers
❌ NEVER ask "Which number comes first: 1, 2, or 3?"
❌ NEVER include any Math content

For uppercase/lowercase letter questions:

1. WORD FORMATTING - CRITICAL:
   ⚠️ NEVER USE ALL UPPERCASE WORDS like "GAME" or "PLAY"
   ✅ ALWAYS use Title Case: "Game", "Play", "Team", "Book"

   - When teaching uppercase letters, use words with ONLY the first letter uppercase
   - CORRECT: "Game" (capital G, lowercase a-m-e)
   - CORRECT: "Play" (capital P, lowercase l-a-y)
   - INCORRECT: "GAME" (all capitals - NEVER DO THIS!)
   - INCORRECT: "PLAY" (all capitals - confusing!)
   - INCORRECT: "pLaY" (random capitals - wrong!)

   MANDATORY FORMAT:
   • "Find the uppercase letter in 'Game'." ✅ CORRECT
   • "Find the uppercase letter in 'GAME'." ❌ WRONG - confusing!
   • Example: "Coach writes 'Team' on the board. Which letter is uppercase?" (Answer: T)

2. ANSWER OPTIONS RULES:
   - For "Which letter is uppercase?" questions:
     * Provide SINGLE letters as options: ["P", "l", "a", "y"]
     * Only ONE should be uppercase (the correct answer)
     * Rest should be lowercase letters from the same word
   - For "Which letter is lowercase?" questions:
     * Most options lowercase: ["p", "l", "a", "y"]
     * Include only ONE uppercase as wrong answer

3. VISUAL CLARITY:
   - Show clear size difference: "Big P and little p"
   - Use positioning cues: "P stands tall, p hangs down"
   - Career examples: "Authors use capital letters to start sentences"

4. CORRECT QUESTION FORMATS:
   ✓ "Find the uppercase letter in 'Game'." → Answer: "G"
   ✓ "The Teacher writes 'Play' on the board. Which letter is uppercase?" → Answer: "P"
   ✓ "Find the capital letter in: Story" → Answer: "S"
   ✓ "Which word starts with an uppercase letter: cat or Cat?" → Answer: "Cat"

   ❌ NEVER USE THESE FORMATS:
   ✗ "Find the uppercase letter in 'GAME'." (Wrong - ALL CAPS confuses!)
   ✗ "Which letters are uppercase in PLAY?" (Wrong - multiple uppercase)
   ✗ "Find the capital in BOOK" (Wrong - should be 'Book')

5. PRACTICE PROGRESSION:
   - Start: Single letter identification: "Is P uppercase? Yes/No"
   - Middle: Find in words: "Which letter is capital in: Book"
   - Advanced: Writing rules: "Which word needs a capital: my name is sam / My name is Sam"

6. CONSONANT/VOWEL QUESTIONS - CRITICAL:
   - NEVER use true_false for "Is the letter 'C' a consonant or vowel?"
   - ALWAYS use multiple_choice with options: ["Consonant", "Vowel"]
   - Question format: "Is the letter 'C' a consonant or a vowel?"
   - Type: "multiple_choice"
   - Options: ["Consonant", "Vowel"]
   - Correct_answer: 0 (for consonant) or 1 (for vowel)
   - Example structure:
     {
       "question": "Is the letter 'E' a consonant or a vowel?",
       "type": "multiple_choice",
       "options": ["Consonant", "Vowel"],
       "correct_answer": 1,
       "explanation": "'E' is a vowel because it is one of A, E, I, O, U."
     }

REMEMBER:
- ⚠️ CRITICAL: Use Title Case ("Game", "Play", "Book") NEVER ALL CAPS ("GAME", "PLAY")
- Only the FIRST letter should be uppercase in demonstration words
- Each practice question about letters should have ONLY ONE uppercase letter
- Options should be single letters extracted from the Title Case word
- Example: "Find the uppercase in 'Game'" → options: ["G", "a", "m", "e"]
- Consonant/vowel questions MUST use multiple_choice, NOT true_false

FINAL CHECK FOR UPPERCASE QUESTIONS:
• If your word is "GAME" → Change it to "Game"
• If your word is "PLAY" → Change it to "Play"
• If your word is "TEAM" → Change it to "Team"
• NEVER write "Which letter in the word 'GAME' is a vowel?"
• ALWAYS write "Which letter in the word 'Game' is a vowel?"`;
}