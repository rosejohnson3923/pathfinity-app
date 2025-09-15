/**
 * EXPERIENCE Container-Specific Rules - Define the tone, context, and structure for Experience container
 * These rules shape the experience learning style
 */

import { ContainerRule } from './UniversalContainerRules';

export const EXPERIENCECONTAINER_RULES: Record<string, ContainerRule> = {
  EXPERIENCE: {
    context: {
      career_integration: 'Hands-on simulation of career tasks',
      focus: 'Learning by doing and creating',
      progression: 'Try → Build → Create'
    },
    tone: {
      instruction: 'Action-oriented, project-based',
      encouragement: 'Celebrate effort and creativity',
      feedback: 'Focus on process and problem-solving approach'
    },
    structure: {
      examples: '3 demonstrations of skill in action',
      practice: '5 hands-on activities building toward project',
      assessment: '1 creative application of learned skills'
    },
    special_features: {
      simulations: 'Recreate career scenarios students can work through',
      mini_projects: 'Build something using the skill',
      creative_challenges: 'Open-ended problems with multiple solutions',
      collaboration_prompts: 'Suggest sharing or working with others'
    }
  }
};

// Format container rules for AI prompt
export function formatExperienceContainerRulesForPrompt(container: string, career?: string): string {
  const rules = EXPERIENCECONTAINER_RULES[container];
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
export function getExperienceContainerRequirements(container: string): {
  exampleCount: number;
  practiceCount: number;
  assessmentCount: number;
  requiresSupport: boolean;
} {
  const rules = EXPERIENCECONTAINER_RULES[container];
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
export function validateExperienceContainerRules(
  content: any,
  container: string
): string[] {
  const errors: string[] = [];
  const requirements = getExperienceContainerRequirements(container);
  
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
export function getExperienceContainerInstructions(
  container: string,
  career: string,
  studentName: string,
  gradeLevel: string
): string {
  const rules = EXPERIENCECONTAINER_RULES[container];
  if (!rules) return '';

  const instructions: string[] = [];

  if (container === 'EXPERIENCE') {
    instructions.push(
      `Let ${studentName} experience being a ${career} using this skill.`,
      `Create hands-on activities that simulate real ${career} tasks.`,
      `Encourage creativity and problem-solving.`
    );
  } else {
    console.warn(`ExperienceContainerRules: Unexpected container type ${container}`);
  }

  return instructions.join('\n');
}

// Get EXPERIENCE-specific task instructions
export function getExperienceTaskInstructions(
  studentName: string,
  career: string,
  skillName: string,
  gradeLevel: string
): string {
  return `
========================================
YOUR TASK - CREATE CAREER SCENARIOS
========================================
Let ${studentName} experience being a ${career} using this skill.
Create hands-on activities that simulate real ${career} tasks.
Encourage creativity and problem-solving.

Create realistic workplace scenarios where ${studentName} can:
• Experience what it's like to be a ${career}
• Make decisions that ${career}s face daily
• Learn how ${career}s use ${skillName} in their work
• Practice professional decision-making

DO NOT create counting exercises or math problems!
Instead, create story-based scenarios with realistic choices.

Language must be appropriate for grade ${gradeLevel}.
`;
}

// Get EXPERIENCE-specific response format
export function getExperienceResponseFormat(requirements: any): string {
  return `
========================================
RESPONSE FORMAT FOR EXPERIENCE (JSON)
========================================
{
  "title": "Engaging scenario title with career context",
  "introduction": "Set the scene - describe the work situation",
  "challenges": [
    // Create ${requirements.practiceCount} realistic career scenarios
    {
      "scenario": "A specific situation this professional faces",
      "question": "What would you do?",
      "options": [
        "First realistic action",
        "Second realistic action",
        "Third realistic action",
        "Fourth realistic action"
      ],
      "correct_answer": 0, // Index of best option (0-3)
      "explanation": "Why this is the best professional choice",
      "outcome": "What happens when you choose correctly",
      "learning_point": "Key professional insight gained"
    }
  ],
  "conclusion": "Wrap up the experience and celebrate learning"
}

IMPORTANT: Create workplace scenarios, NOT counting or math problems!
`;
}

// Get EXPERIENCE-specific example structure
export function getExperienceExampleStructure(): string {
  return `
========================================
EXAMPLE SCENARIO STRUCTURE
========================================
{
  "scenario": "You're a Teacher preparing your classroom for the first day of school. You have 30 students coming and need to organize your supplies.",
  "question": "What should you do first?",
  "options": [
    "Count how many desks you have and arrange them in groups",
    "Create a welcome sign for the door",
    "Check your class list to learn student names",
    "Organize your teaching materials by subject"
  ],
  "correct_answer": 0,
  "explanation": "Teachers always ensure they have enough seating arranged properly before decorating or organizing other materials.",
  "outcome": "Great choice! You arranged 30 desks in 6 groups of 5, perfect for collaborative learning!",
  "learning_point": "Teachers use counting and grouping skills every day to organize their classrooms effectively."
}
`;
}

// Get EXPERIENCE-specific quality checklist
export function getExperienceQualityChecklist(): string {
  return `
========================================
FINAL QUALITY CHECK - EXPERIENCE
========================================
Before generating, verify:
✓ ALL scenarios are workplace situations, NOT counting exercises
✓ Each scenario shows how the career uses skills professionally
✓ Options represent realistic professional choices
✓ Language is grade-appropriate and engaging
✓ Scenarios tell a story and create immersion
✓ correct_answer is an index (0-3)
✓ Each scenario has outcome and learning_point
✓ NO math problems or counting tasks
✓ Focus on decision-making and problem-solving
`;
}

// Get EXPERIENCE-specific reminders
export function getExperienceReminders(careerName: string, grade: string): string {
  return `Remember:
1. Focus on creating engaging career scenarios, NOT counting or math problems
2. Create situational challenges that show how ${careerName}s work
3. Use age-appropriate language for grade ${grade}
4. Make scenarios relatable and story-based
5. Options should be realistic actions a ${careerName} might take`;
}

// EXPERIENCE-specific overrides for universal rules
export function getExperienceOverrides(): {
  skipSubjectRules: boolean;
  useLanguageConstraintsOnly: boolean;
  algorithmicFocus: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
} {
  return {
    skipSubjectRules: true,  // EXPERIENCE doesn't need subject-specific rules
    useLanguageConstraintsOnly: true,  // Only apply language constraints, not full universal rules
    algorithmicFocus: {
      primary: 'career_simulation',     // Being the career professional
      secondary: 'skills_application',  // Using the specific skill in work
      tertiary: 'subject_specific'       // Subject is least important
    }
  };
}