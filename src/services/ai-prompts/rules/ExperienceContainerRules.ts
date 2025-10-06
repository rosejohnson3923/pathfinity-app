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
YOUR TASK - CREATE NARRATIVE WORKPLACE SCENARIOS
========================================
🎯 PRIMARY OBJECTIVE: Continue the storyline from the LEARN container

${studentName} just learned "${skillName}" in the LEARN container.
Now create NARRATIVE WORKPLACE SCENARIOS that show how ${studentName} uses this newly learned skill to make good workday decisions as a ${career}.

CRITICAL REQUIREMENTS:
✓ NARRATIVE FORMAT: Tell a story about ${studentName}'s workday as a ${career}
✓ SKILL APPLICATION: Show how the newly learned skill (${skillName}) helps make professional decisions
✓ WORKDAY DECISIONS: Each scenario is a realistic workplace situation requiring decision-making
✓ STORY CONTINUITY: Continue the narrative established in the Master Narrative
✓ REALISTIC CHOICES: Options represent authentic professional actions a ${career} would take

Create realistic workplace scenarios where ${studentName}:
• Experiences a typical workday situation as a ${career}
• Faces a decision that ${career}s encounter in real work
• Uses the newly learned skill (${skillName}) to make the right choice
• Sees the outcome of making good professional decisions

TONE: Narrative storytelling that immerses ${studentName} in the ${career} workplace
FORMAT: Story-based scenarios with realistic decision choices
FOCUS: How newly learned skills help make good workday decisions

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
  "title": "A Day in the Life: [Career] Uses [Skill]",
  "scenario": "NARRATIVE INTRODUCTION: Tell the story of the workday. Set the scene. Describe what's happening at work. Make it feel like a real professional situation.",
  "scenario_summary": "Brief summary of the workday story",
  "character_context": "Establish the professional role and connection to the newly learned skill",
  "career_introduction": "How this career uses the newly learned skill in their work",
  "real_world_connections": [],
  "interactive_simulation": {
    "setup": "NARRATIVE SETUP: Describe arriving at work, the workplace environment, and what needs to be done today. Connect to the Master Narrative.",
    "challenges": [
      // Create ${requirements.practiceCount} NARRATIVE workplace decision scenarios
      {
        "description": "NARRATIVE CHALLENGE: Tell the story of this workplace situation. What's happening? What decision needs to be made? How does the newly learned skill help?",
        "challenge_summary": "Brief summary of the workplace decision",
        "options": [
          "I would [realistic professional action using the skill]",
          "I would [another realistic professional action]",
          "I would [third realistic professional action]",
          "I would [fourth realistic professional action]"
        ],
        "correct_choice": 0, // Index of best professional decision (0-3)
        "hint": "Think about how the skill you just learned helps make this decision...",
        "outcome": "NARRATIVE OUTCOME: What happens as a result of making this good decision. Tell the story.",
        "learning_point": "How the newly learned skill helped make the right workday decision"
      }
    ],
    "conclusion": "NARRATIVE CONCLUSION: Wrap up the workday story. Celebrate using the newly learned skill professionally."
  }
}

CRITICAL REQUIREMENTS:
✓ NARRATIVE FORMAT: Each challenge tells a story about a workday situation
✓ SKILL CONNECTION: Every challenge shows how the newly learned skill helps make decisions
✓ REALISTIC WORKPLACE: Authentic situations the career faces in real work
✓ STORY CONTINUITY: Connect to the Master Narrative established in LEARN
✓ PROFESSIONAL DECISIONS: Options are realistic actions professionals take
✓ NO ACADEMIC EXERCISES: This is workplace storytelling, not practice problems
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
✓ NARRATIVE FORMAT: Each scenario tells a workday story with realistic workplace situations
✓ SKILL CONNECTION: Every scenario shows how the NEWLY LEARNED SKILL helps make workday decisions
✓ WORKDAY DECISIONS: Authentic professional situations requiring decision-making
✓ STORY CONTINUITY: Connects to Master Narrative established in LEARN container
✓ Options represent realistic professional actions the career would take
✓ Language is grade-appropriate and engaging
✓ Scenarios create narrative immersion in the workplace
✓ correct_answer is an index (0-3) representing the best professional decision
✓ Each scenario has NARRATIVE OUTCOME showing result of good decision
✓ Each scenario has learning_point connecting skill to professional success
✓ NO academic exercises, counting tasks, or practice problems
✓ Focus on narrative storytelling and workplace decision-making
✓ Shows HOW the newly learned skill makes professionals successful
`;
}

// Get EXPERIENCE-specific reminders
export function getExperienceReminders(careerName: string, grade: string): string {
  return `Remember:
1. NARRATIVE STORYTELLING: Tell the story of a ${careerName}'s workday - NOT academic exercises
2. NEWLY LEARNED SKILLS: Show how the skill just learned in LEARN helps make good workday decisions
3. WORKDAY DECISIONS: Create realistic workplace situations requiring professional judgment
4. STORY CONTINUITY: Connect to the Master Narrative established in the LEARN container
5. Use age-appropriate language for grade ${grade} while maintaining professional context
6. Make scenarios immersive and story-based with narrative outcomes
7. Options should be realistic professional actions a ${careerName} would take
8. Focus on HOW the newly learned skill leads to professional success`;
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