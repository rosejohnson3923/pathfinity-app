/**
 * DISCOVER Container-Specific Rules - Define the tone, context, and structure for the DISCOVER container
 * These rules shape the discover experience style
 */

import { ContainerRule } from './UniversalContainerRules';

export const DISCOVERCONTAINER_RULES: Record<string, ContainerRule> = {
  DISCOVER: {
    context: {
      career_integration: 'Exploration - discover how careers use this in surprising ways',
      focus: 'Pattern recognition and curiosity building',
      progression: 'Explore → Question → Connect'
    },
    tone: {
      instruction: 'Inquiry-based, wonder-inducing',
      encouragement: 'Celebrate curiosity and "what if" thinking',
      feedback: 'Focus on discoveries made, not just correctness'
    },
    structure: {
      examples: '3 career exploration scenarios (multiple-choice format)',
      practice: '2 discovery practice scenarios (multiple-choice format)',
      assessment: '1 challenge scenario (multiple-choice format)'
    },
    special_features: {
      what_if_scenarios: 'Pose "What would happen if..." questions',
      pattern_finding: 'Help identify patterns across examples',
      connection_making: 'Link to unexpected real-world applications',
      hypothesis_testing: 'Encourage predictions before revealing answers'
    }
  }
};

// Format container rules for AI prompt
export function formatDiscoverContainerRulesForPrompt(container: string, career?: string): string {
  const rules = DISCOVERCONTAINER_RULES[container];
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
export function getDiscoverContainerRequirements(container: string): {
  exampleCount: number;
  practiceCount: number;
  assessmentCount: number;
  requiresSupport: boolean;
  totalScenarios: number;
} {
  const rules = DISCOVERCONTAINER_RULES[container];
  if (!rules) {
    return {
      exampleCount: 3,
      practiceCount: 2,  // Changed from 5 to 2 for 3-2-1 structure
      assessmentCount: 1,
      requiresSupport: true,
      totalScenarios: 6  // 3 + 2 + 1 = 6 total scenarios
    };
  }

  // Parse counts from structure strings
  const exampleMatch = rules.structure.examples?.match(/(\d+)/);
  const practiceMatch = rules.structure.practice.match(/(\d+)/);
  const assessmentMatch = rules.structure.assessment.match(/(\d+)/);

  const exampleCount = exampleMatch ? parseInt(exampleMatch[1]) : 3;
  const practiceCount = practiceMatch ? parseInt(practiceMatch[1]) : 2;  // Changed default
  const assessmentCount = assessmentMatch ? parseInt(assessmentMatch[1]) : 1;

  return {
    exampleCount,
    practiceCount,
    assessmentCount,
    requiresSupport: container !== 'ASSESSMENT',
    totalScenarios: exampleCount + practiceCount + assessmentCount
  };
}

// Validate container-specific requirements
export function validateDiscoverContainerRules(
  content: any,
  container: string
): string[] {
  const errors: string[] = [];
  const requirements = getDiscoverContainerRequirements(container);
  
  // Check example count
  if (content.examples) {
    if (content.examples.length !== requirements.exampleCount) {
      errors.push(`${container} requires exactly ${requirements.exampleCount} examples, got ${content.examples.length}`);
    }
  }
  
  // Check practice count
  if (content.practice) {
    if (content.practice.length !== requirements.practiceCount) {
      errors.push(`${container} requires exactly ${requirements.practiceCount} practice questions, got ${content.practice.length}`);
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
export function getDiscoverContainerInstructions(
  container: string,
  career: string,
  studentName: string,
  gradeLevel: string
): string {
  const rules = DISCOVERCONTAINER_RULES[container];
  if (!rules) return '';

  const instructions: string[] = [];

  if (container === 'DISCOVER') {
    instructions.push(
      `Spark ${studentName}'s curiosity about how ${career}s use this skill.`,
      `Encourage exploration and "what if" thinking.`,
      `Help ${studentName} discover patterns and connections.`
    );
  } else {
    console.warn(`DiscoverContainerRules: Unexpected container type ${container}`);
  }

  return instructions.join('\n');
}

// Get DISCOVER-specific response format
export function getDiscoverResponseFormat(requirements: any, allowedTypes: string[]): string {
  return `
========================================
RESPONSE FORMAT (JSON) - DISCOVER 3-2-1 STRUCTURE
========================================
IMPORTANT: Return ALL 6 scenarios as a single "practice" array for the BentoDiscoverCardV2 UI.
All scenarios MUST be multiple_choice type with career exploration focus.

{
  "title": "Career Discovery: How ${requirements.career || 'Professionals'} Use ${requirements.subject || 'This Skill'}",
  "greeting": "Welcome message that sparks curiosity about careers",
  "exploration_theme": "Discover surprising ways ${requirements.career || 'professionals'} use ${requirements.skill || 'this skill'}!",

  "practice": [
    // ALL 6 SCENARIOS GO HERE (3 examples + 2 practice + 1 assessment)
    // Scenarios 1-3: EXAMPLE SCENARIOS (Career Exploration Focus)
    {
      "scenario_type": "example",  // Mark as example scenario
      "question": "Did you know ${requirements.career || 'professionals'} use ${requirements.subject || 'this'} to...? [Career-focused discovery question]",
      "type": "multiple_choice",  // MUST be multiple_choice
      "visual": "🔍" or appropriate emoji,
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,  // Index 0-3 of correct option
      "hint": "Think about how ${requirements.career || 'professionals'} might use this...",
      "explanation": "Wow! ${requirements.career || 'Professionals'} use this because...",
      "practiceSupport": {
        "preQuestionContext": "Let's explore how ${requirements.career || 'professionals'} use ${requirements.subject || 'this skill'} in surprising ways!",
        "connectionToLearn": "You already know [basic concept]. Now discover how ${requirements.career || 'professionals'} use it!",
        "confidenceBuilder": "Your curiosity will help you discover amazing connections!",
        "hints": [
          {
            "level": 1,
            "hint": "Look for the career connection...",
            "visualCue": "Focus on what ${requirements.career || 'professionals'} might need"
          },
          {
            "level": 2,
            "hint": "${requirements.career || 'Professionals'} use this when they...",
            "visualCue": "Think about their daily work",
            "example": "Like when they need to..."
          },
          {
            "level": 3,
            "hint": "The answer shows how ${requirements.career || 'professionals'} innovate...",
            "visualCue": "Look for the surprising application",
            "example": "They discovered they could use this to..."
          }
        ],
        "correctFeedback": {
          "immediate": "Amazing discovery! You found a career connection!",
          "careerConnection": "This is exactly how ${requirements.career || 'professionals'} use ${requirements.subject || 'this skill'}!",
          "skillReinforcement": "You're discovering real-world applications!"
        },
        "incorrectFeedback": {
          "immediate": "Interesting thought! Let's explore more...",
          "explanation": "Actually, ${requirements.career || 'professionals'} use it this way...",
          "reteach": "Let's discover together how this works...",
          "tryAgainPrompt": "Want to explore another possibility?"
        },
        "teachingMoment": {
          "conceptExplanation": "${requirements.career || 'Professionals'} discovered they could use ${requirements.subject || 'this'} to...",
          "realWorldExample": "In real life, ${requirements.career || 'they'} use this when...",
          "commonMistakes": ["People often don't realize ${requirements.career || 'professionals'} use this"]
        }
      }
    },
    // ... 2 more example scenarios (scenarios 2-3)

    // Scenarios 4-5: PRACTICE SCENARIOS (Discovery Application)
    {
      "scenario_type": "practice",  // Mark as practice scenario
      "question": "How might a ${requirements.career || 'professional'} use ${requirements.subject || 'this skill'} to solve [specific problem]?",
      "type": "multiple_choice",
      // ... same structure as above
    },
    // ... 1 more practice scenario (scenario 5)

    // Scenario 6: ASSESSMENT SCENARIO (Challenge)
    {
      "scenario_type": "assessment",  // Mark as assessment scenario
      "question": "Challenge: A ${requirements.career || 'professional'} needs to [complex situation]. How would they use ${requirements.subject || 'this skill'}?",
      "type": "multiple_choice",
      "visual": "🏆" or appropriate emoji,
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,  // Index of correct option
      "explanation": "Excellent! You discovered how ${requirements.career || 'professionals'} innovate with ${requirements.subject || 'this skill'}!",
      "success_message": "🎉 Amazing discovery, ${requirements.studentName || 'Explorer'}! You've uncovered how ${requirements.career || 'professionals'} use ${requirements.subject || 'this skill'} in surprising ways!",
      // No practiceSupport for assessment
    }
  ]
}

CRITICAL REQUIREMENTS:
1. ALL 6 scenarios go in the "practice" array (even though 3 are examples and 1 is assessment)
2. Every scenario MUST be type: "multiple_choice" (NO counting, NO true_false)
3. Every scenario MUST have exactly 4 options
4. correct_answer MUST be a number (0-3) indicating the index of the correct option
5. Focus on CAREER EXPLORATION - how professionals use the skill in surprising ways
6. Include scenario_type field to distinguish example/practice/assessment
7. Grade-appropriate language per universal rules
`;
}

// Get DISCOVER-specific quality checklist
export function getDiscoverQualityChecklist(): string {
  return `
========================================
FINAL QUALITY CHECK - DISCOVER 3-2-1
========================================
Before generating, verify:
✓ EXACTLY 6 scenarios total (3 examples + 2 practice + 1 assessment)
✓ ALL scenarios are type: "multiple_choice" (NO counting, NO true_false)
✓ ALL scenarios have exactly 4 options
✓ ALL scenarios focus on career exploration (how professionals use the skill)
✓ correct_answer is a number 0-3 (NOT a string, NOT the option text)
✓ Scenarios 1-3 marked as scenario_type: "example"
✓ Scenarios 4-5 marked as scenario_type: "practice"
✓ Scenario 6 marked as scenario_type: "assessment"
✓ Questions spark curiosity about career applications
✓ Examples show surprising professional uses
✓ Practice applies discoveries to new career situations
✓ Assessment challenges with complex career scenario
✓ All scenarios in single "practice" array for UI
✓ Language appropriate for grade level
✓ Career context in EVERY question
`;
}

// Get DISCOVER-specific reminders
export function getDiscoverReminders(subject: string, grade: string, careerName: string): string {
  return `Remember:
1. Focus on surprising ways ${careerName}s use ${subject} in the real world
2. Use "What if...?" and "Did you know...?" formats
3. Emphasize ${subject} concepts through career exploration
4. Show unexpected real-world connections and applications
5. Make ${subject} feel like an exciting exploration
6. Use grade ${grade} appropriate language while maintaining wonder`;
}

// Get DISCOVER-specific task instructions
export function getDiscoverTaskInstructions(
  studentName: string,
  career: string,
  subject: string,
  skillName: string,
  gradeLevel: string
): string {
  return `
========================================
YOUR TASK - CREATE 3-2-1 DISCOVERY EXPERIENCE
========================================
STRUCTURE: Exactly 6 multiple-choice scenarios in this order:
• 3 EXAMPLE scenarios - Introduce surprising career connections
• 2 PRACTICE scenarios - Apply the discoveries
• 1 ASSESSMENT scenario - Challenge with complex application

PRIMARY FOCUS: Career exploration - surprising ways ${career}s use ${subject}
SECONDARY FOCUS: ${subject} concepts and patterns
TERTIARY FOCUS: Specific skill application (${skillName})

For ALL 6 scenarios:
✓ MUST be type: "multiple_choice" (NO other types allowed)
✓ MUST have exactly 4 options labeled A, B, C, D
✓ MUST focus on how ${career}s use ${skillName} in surprising ways
✓ MUST include career context in every question
✓ correct_answer MUST be a number 0-3 (index of correct option)

SCENARIO PROGRESSION:
1-3. EXAMPLES: "Did you know ${career}s use ${subject} to..."
     - Introduce surprising career applications
     - Spark curiosity about professional use
     - Include scenario_type: "example"

4-5. PRACTICE: "How might a ${career} use this to..."
     - Apply discoveries to new situations
     - Explore career problem-solving
     - Include scenario_type: "practice"

6. ASSESSMENT: "Challenge: A ${career} needs to..."
     - Complex career scenario
     - Synthesize all discoveries
     - Include scenario_type: "assessment"
     - Include success_message with ${studentName}

ALL scenarios go in single "practice" array for UI compatibility.
Language must be appropriate for grade ${gradeLevel}.
`;
}

// Get DISCOVER-specific example structure
export function getDiscoverExampleStructure(career: string, subject: string): string {
  return `
========================================
EXAMPLE DISCOVERY STRUCTURE
========================================
{
  "question": "Did you know that ${career}s use ${subject} in surprising ways?",
  "discovery_prompt": "Let's explore how ${career}s use ${subject} to solve real problems!",
  "exploration": [
    "Discover how ${career}s use ${subject} patterns in their work",
    "What if you could use ${subject} like a ${career}?",
    "How do ${career}s use ${subject} to make new discoveries?"
  ],
  "subject_connection": "This ${subject} concept appears everywhere in ${career} work!",
  "career_innovation": "${career}s invented this ${subject} technique to advance their field",
  "wonder_moment": "You're discovering how ${subject} powers real-world innovation!"
}
`;
}

// DISCOVER-specific overrides for universal rules
export function getDiscoverOverrides(): {
  skipSubjectRules: boolean;
  useLanguageConstraintsOnly: boolean;
  algorithmicFocus: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
} {
  return {
    skipSubjectRules: false,  // DISCOVER needs subject rules (it's secondary focus)
    useLanguageConstraintsOnly: false,  // DISCOVER needs full universal rules
    algorithmicFocus: {
      primary: 'career_exploration',    // Surprising ways careers use the subject
      secondary: 'subject_specific',    // Subject concepts and patterns
      tertiary: 'skills_application'    // Specific skill being practiced
    }
  };
}