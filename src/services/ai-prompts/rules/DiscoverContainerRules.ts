/**
 * DISCOVER Container-Specific Rules - Define the tone, context, and structure for the DISCOVER container
 * These rules shape the discover experience style
 */

import { ContainerRule } from './UniversalContainerRules';

export const DISCOVERCONTAINER_RULES: Record<string, ContainerRule> = {
  DISCOVER: {
    context: {
      career_integration: 'Hands-on discovery stations where students practice skills in career context',
      focus: 'Apply newly learned skills through career-themed discovery activities',
      progression: 'Setup → Discover → Practice Skills'
    },
    tone: {
      instruction: 'Activity-based, hands-on, career-immersive',
      encouragement: 'Celebrate skill application in career context',
      feedback: 'Focus on how skills help in real career situations'
    },
    structure: {
      examples: 'N/A - Not used in discovery stations',
      practice: '4 subject-specific discovery stations (Math, ELA, Science, Social Studies)',
      assessment: 'N/A - Each station is hands-on practice'
    },
    special_features: {
      discovery_stations: 'Create themed stations within career scenario (e.g., Recipe Creation Station)',
      skill_application: 'Each station practices the ACTUAL skill learned in LEARN for that subject',
      career_scenario: 'Unified career scenario ties all 4 stations together (e.g., cooking competition)',
      question_variety: 'Use appropriate question types for each skill (counting, letter ID, shape classification, etc.)'
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
  discoveryStations: number;
} {
  const rules = DISCOVERCONTAINER_RULES[container];
  if (!rules) {
    return {
      exampleCount: 0,  // Not used in discovery stations
      practiceCount: 4,  // 4 subject-specific discovery stations
      assessmentCount: 0,  // Not used - each station is practice
      requiresSupport: true,
      totalScenarios: 4,  // 4 discovery stations (Math, ELA, Science, Social Studies)
      discoveryStations: 4
    };
  }

  // Parse counts from structure strings
  const practiceMatch = rules.structure.practice.match(/(\d+)/);
  const practiceCount = practiceMatch ? parseInt(practiceMatch[1]) : 4;

  return {
    exampleCount: 0,  // Not used
    practiceCount,  // 4 discovery stations
    assessmentCount: 0,  // Not used
    requiresSupport: container !== 'ASSESSMENT',
    totalScenarios: practiceCount,  // 4 total stations
    discoveryStations: practiceCount  // 4 discovery stations
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
RESPONSE FORMAT (JSON) - DISCOVERY STATIONS
========================================
IMPORTANT: Create 4 discovery stations (one per subject) within a unified career scenario.
Return as "discovery_paths" array with 4 stations.

{
  "title": "${requirements.career || 'Career'} Discovery Challenge: [Scenario Name]",
  "greeting": "Welcome to the [scenario name]! Today you'll use all your skills as a ${requirements.career || 'professional'}!",
  "exploration_theme": "Practice your skills through exciting ${requirements.career || 'career'} discovery activities!",

  "discovery_paths": [
    // STATION 1: MATH DISCOVERY
    {
      "title": "[Creative Math Station Name]",
      "icon": "➕" or appropriate symbol (will be stripped in PDF),
      "description": "Explore how ${requirements.career || 'professionals'} use [Math skill] in this station",
      "subject": "Math",
      "skill": "[Actual Math skill from LEARN]",
      "activities": [
        {
          "type": "[appropriate for math skill - counting, numeric, multiple_choice with numbers]",
          "title": "[Station Activity Name]",
          "description": "Activity description: What ${requirements.studentName || 'the student'} is doing as a ${requirements.career || 'professional'}. IMPORTANT: Numbers mentioned here MUST match the correct_answer exactly.",
          "interactive_element": "Description of hands-on element",
          "question": "[Actual question that practices the Math skill]",
          "options": [/* If multiple_choice/counting: 4 options that practice the skill */],
          "correct_answer": 0, // Index or value depending on type
          "hint": "CRITICAL: Hint must directly reference the correct_answer value. For counting questions, count up to the exact correct_answer (e.g., if correct_answer is 3, hint should count '1, 2, 3'). For multiple_choice, guide toward the correct option.",
          "explanation": "Why this answer is correct and how ${requirements.career || 'professionals'} use this skill. Must confirm the correct_answer value.",
          "learning_objective": "What student learns about using this skill as a ${requirements.career || 'professional'}"
        }
      ]
    },

    // STATION 2: ELA DISCOVERY
    {
      "title": "[Creative ELA Station Name]",
      "icon": "📖" or appropriate symbol,
      "description": "Explore how ${requirements.career || 'professionals'} use [ELA skill] in this station",
      "subject": "ELA",
      "skill": "[Actual ELA skill from LEARN]",
      "activities": [
        {
          "type": "[appropriate for ELA skill - multiple_choice with letters, fill_blank, etc.]",
          "title": "[Station Activity Name]",
          "description": "Activity description: What ${requirements.studentName || 'the student'} is doing. IMPORTANT: Any specifics mentioned here MUST align with the question and correct_answer.",
          "interactive_element": "Description of hands-on element",
          "question": "[Actual question that practices the ELA skill]",
          "options": [/* Options that practice the ELA skill */],
          "correct_answer": 0,
          "hint": "CRITICAL: Hint must guide toward the correct_answer. For letter identification, reference the specific letter. For word tasks, provide contextual clues that lead to the correct option.",
          "explanation": "Why this answer is correct. Must confirm the correct_answer.",
          "learning_objective": "What student learns"
        }
      ]
    },

    // STATION 3: SCIENCE DISCOVERY
    {
      "title": "[Creative Science Station Name]",
      "icon": "🔬" or appropriate symbol,
      "description": "Explore how ${requirements.career || 'professionals'} use [Science skill] in this station",
      "subject": "Science",
      "skill": "[Actual Science skill from LEARN]",
      "activities": [
        {
          "type": "[appropriate for science skill - shape classification → multiple_choice with shapes]",
          "title": "[Station Activity Name]",
          "description": "Activity description: What ${requirements.studentName || 'the student'} is doing. IMPORTANT: Any specifics mentioned here MUST align with the question and correct_answer.",
          "interactive_element": "Description of hands-on element",
          "question": "[Actual question that practices the Science skill]",
          "options": [/* Options that practice the Science skill */],
          "correct_answer": 0,
          "hint": "CRITICAL: Hint must guide toward the correct_answer. For shape classification, reference the specific shape or characteristic. For science concepts, provide clues that lead to the correct option.",
          "explanation": "Why this answer is correct. Must confirm the correct_answer.",
          "learning_objective": "What student learns"
        }
      ]
    },

    // STATION 4: SOCIAL STUDIES DISCOVERY
    {
      "title": "[Creative Social Studies Station Name]",
      "icon": "🌍" or appropriate symbol,
      "description": "Explore how ${requirements.career || 'professionals'} use [Social Studies skill] in this station",
      "subject": "Social Studies",
      "skill": "[Actual Social Studies skill from LEARN]",
      "activities": [
        {
          "type": "[appropriate for social studies skill]",
          "title": "[Station Activity Name]",
          "description": "Activity description: What ${requirements.studentName || 'the student'} is doing. IMPORTANT: Any specifics mentioned here MUST align with the question and correct_answer.",
          "interactive_element": "Description of hands-on element",
          "question": "[Actual question that practices the Social Studies skill]",
          "options": [/* Options that practice the Social Studies skill */],
          "correct_answer": 0,
          "hint": "CRITICAL: Hint must guide toward the correct_answer. For social studies concepts, provide contextual clues that lead to the correct option. Reference specific details from the question.",
          "explanation": "Why this answer is correct. Must confirm the correct_answer.",
          "learning_objective": "What student learns"
        }
      ]
    }
  ]
}

CRITICAL REQUIREMENTS:
1. Create EXACTLY 4 discovery stations (one per subject: Math, ELA, Science, Social Studies)
2. Each station in "discovery_paths" array with subject-specific activities
3. Activities MUST use appropriate question types for the skill (NOT all multiple_choice)
4. Create ONE unified career scenario that ties all 4 stations together
5. Each activity practices the ACTUAL skill learned in that subject's LEARN container
6. Activities are HANDS-ON tasks, not abstract "Did you know?" questions
7. correct_answer format depends on question type (index for MC, value for counting, etc.)
8. Show how ${requirements.career || 'professionals'} use academic skills in surprising/creative ways
9. Grade-appropriate language per universal rules
10. All 4 stations are part of the same career event/challenge

CONSISTENCY REQUIREMENTS (CRITICAL):
⚠️ DESCRIPTION ↔ QUESTION ↔ HINT ↔ EXPLANATION MUST ALL ALIGN ⚠️
• If description mentions "3 strawberries", question must show 3 strawberries, correct_answer must be 3, hint must count to 3, explanation must confirm 3
• If description mentions a specific letter, question must ask about that letter, hint must reference it
• If description mentions a shape, question must show that shape, hint must describe it
• NEVER have mismatched numbers/letters/shapes between description and question
• Hint MUST count/reference the exact correct_answer value
• Explanation MUST confirm the correct_answer value
`;
}

// Get DISCOVER-specific quality checklist
export function getDiscoverQualityChecklist(): string {
  return `
========================================
FINAL QUALITY CHECK - DISCOVERY STATIONS
========================================
Before generating, verify:
✓ EXACTLY 4 discovery stations (one per subject: Math, ELA, Science, Social Studies)
✓ All 4 stations in "discovery_paths" array
✓ Each station has subject label (Math, ELA, Science, Social Studies)
✓ Each station has creative name related to career
✓ Each station practices the ACTUAL SKILL learned in that subject's LEARN container
✓ Question types MATCH the skill being practiced (NOT all multiple_choice)
✓ ONE unified career scenario ties all 4 stations together
✓ Activities are HANDS-ON tasks (NOT abstract "Did you know?" questions)
✓ Each activity has: type, title, description, question, options (if applicable), correct_answer, hint, explanation
✓ correct_answer format matches question type (index for MC, value for counting, etc.)
✓ Activities show how professionals use academic skills in career context
✓ Language appropriate for grade level
✓ Each station shows SURPRISING/CREATIVE ways career uses the skill
✓ All 4 stations are part of the same career event/challenge

CONSISTENCY CHECKS (CRITICAL):
✓ Description numbers/letters/shapes MATCH the question
✓ Hint counts/references the EXACT correct_answer value
✓ Explanation confirms the correct_answer value
✓ NO mismatches between description setup and actual question
✓ For counting: if question shows 3 items, description mentions 3, hint counts to 3, explanation confirms 3
✓ For letter ID: if question asks about 'E', description/hint/explanation all reference 'E'
✓ For shapes: if question shows circles, description/hint/explanation all reference circles
`;
}

// Get DISCOVER-specific reminders
export function getDiscoverReminders(subject: string, grade: string, careerName: string): string {
  return `Remember:
1. CREATE 4 STATIONS: One for each subject (Math, ELA, Science, Social Studies)
2. UNIFIED SCENARIO: All 4 stations are part of one career event/challenge
3. HANDS-ON ACTIVITIES: Each station is an actual task, NOT "Did you know?" questions
4. SKILL-SPECIFIC: Practice the ACTUAL skill learned in each subject's LEARN container
5. APPROPRIATE QUESTION TYPES: Match question type to skill (counting for math, letter ID for ELA, etc.)
6. CAREER CONTEXT: Activities are things ${careerName}s actually do
7. DISCOVERY ELEMENT: Show SURPRISING/CREATIVE ways ${careerName}s use academic skills
8. Use grade ${grade} appropriate language while maintaining hands-on, activity-based tone`;
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
YOUR TASK - CREATE 4 DISCOVERY STATIONS
========================================
🎯 PRIMARY OBJECTIVE: Create hands-on discovery activities within a career scenario

${studentName} completed LEARN containers for all 4 subjects (Math, ELA, Science, Social Studies).
Now create 4 DISCOVERY STATIONS where ${studentName} practices these skills as a ${career} in an exciting career scenario!

UNIFIED CAREER SCENARIO:
Create ONE career scenario (e.g., "Chef ${studentName} enters a cooking competition") that ties all 4 discovery stations together.

STRUCTURE: Create EXACTLY 4 discovery stations (one per subject):

STATION 1: MATH DISCOVERY
• Station Name: Creative name related to career (e.g., "Recipe Creation Station")
• Subject: Math
• Skill Being Practiced: [The actual Math skill from LEARN]
• Activity: Hands-on task where ${studentName} uses the Math skill as a ${career}
• Question Type: MUST match the skill (counting → counting type, number identification → multiple_choice with numbers, etc.)
• NOT "Did you know?" - Create an actual activity/task

STATION 2: ELA DISCOVERY
• Station Name: Creative name related to career (e.g., "Speed Prep Challenge")
• Subject: ELA
• Skill Being Practiced: [The actual ELA skill from LEARN]
• Activity: Hands-on task where ${studentName} uses the ELA skill as a ${career}
• Question Type: MUST match the skill (letter identification → letter-based multiple_choice, etc.)

STATION 3: SCIENCE DISCOVERY
• Station Name: Creative name related to career (e.g., "Mini Dish Artistry")
• Subject: Science
• Skill Being Practiced: [The actual Science skill from LEARN]
• Activity: Hands-on task where ${studentName} uses the Science skill as a ${career}
• Question Type: MUST match the skill (shape classification → shape-based multiple_choice, etc.)

STATION 4: SOCIAL STUDIES DISCOVERY
• Station Name: Creative name related to career
• Subject: Social Studies
• Skill Being Practiced: [The actual Social Studies skill from LEARN]
• Activity: Hands-on task where ${studentName} uses the Social Studies skill as a ${career}
• Question Type: MUST match the skill

CRITICAL REQUIREMENTS:
✓ UNIFIED SCENARIO: All 4 stations are part of one career event (competition, project day, etc.)
✓ HANDS-ON ACTIVITIES: Each station is an actual task, NOT abstract "Did you know?" questions
✓ SKILL-SPECIFIC: Practice the ACTUAL skill learned in each subject's LEARN container
✓ APPROPRIATE QUESTION TYPES: Use question types that match the skill (NOT all multiple_choice)
✓ CAREER CONTEXT: Activities are things ${career}s actually do
✓ DISCOVERY ELEMENT: Show how ${career}s use these academic skills in surprising/creative ways

⚠️ CONSISTENCY REQUIREMENT (MOST CRITICAL) ⚠️:
You MUST ensure that description, question, hint, and explanation are internally consistent:

EXAMPLE OF CORRECT CONSISTENCY (Math counting):
• Description: "The Chef needs 3 eggs for the recipe"
• Question: "How many eggs are there? 🥚🥚🥚"
• Correct Answer: 3
• Hint: "Let's count together: 1, 2, 3!"
• Explanation: "Chefs count ingredients. Here, there were 3 eggs."
→ ALL fields reference the SAME number (3)

EXAMPLE OF INCORRECT (MISMATCH):
• Description: "The Chef needs 3 strawberries" ← Says 3
• Question: "How many strawberries? 🍓🍓" ← Shows 2
• Correct Answer: 2
• Hint: "Count: 1, 2" ← Counts to 2
→ MISMATCH between description (3) and question/answer (2) - DO NOT DO THIS!

Before finalizing each activity:
1. Check: Does description number match question visual count?
2. Check: Does hint count/reference the correct_answer exactly?
3. Check: Does explanation confirm the correct_answer?
4. If ANY mismatch, revise until ALL fields align perfectly

TONE: Hands-on, activity-based, career-immersive
FOCUS: Practicing skills through career-themed discovery activities

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