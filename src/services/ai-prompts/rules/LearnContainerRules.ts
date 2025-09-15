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
  return `
========================================
RESPONSE FORMAT (JSON)
========================================
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
  "practice": [
    // EXACTLY ${requirements.practiceCount} practice questions
    {
      "question": "Practice question text",
      "type": "One of: ${allowedTypes.join(', ')}",
      "visual": "REQUIRED - For shapes use emojis (▲ ■ ● ◆), for objects use relevant emojis, use \"❓\" ONLY for pure text questions",
      "options": ["A", "B", "C", "D"], // ONLY for multiple_choice
      "correct_answer": "Format based on type (see universal rules)",
      "hint": "Single helpful hint",
      "explanation": "Clear explanation",
      "practiceSupport": {
        // COMPLETE STRUCTURE REQUIRED (see template)
        "preQuestionContext": "...",
        "connectionToLearn": "...",
        "confidenceBuilder": "...",
        "hints": [/* 3 progressive hints */],
        "correctFeedback": {/* all fields */},
        "incorrectFeedback": {/* all fields */},
        "teachingMoment": {/* all fields */}
      }
    }
  ],
  "assessment": {
    "question": "Final assessment question",
    "type": "Appropriate type from allowed list",
    "visual": "REQUIRED - Use appropriate emojis (shapes: ▲■●◆, warning signs: ⚠️🔺, objects: relevant emojis)",
    "options": [/* if multiple_choice */],
    "correct_answer": "Format based on type",
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
Before generating, verify:
✓ All questions have ALL mandatory fields
✓ correct_answer format matches type EXACTLY
✓ visual field present in EVERY question with appropriate content:
  • Shape questions → shape emojis (▲■●◆)
  • Warning/sign questions → relevant emojis (⚠️🔺)
  • Counting questions → object emojis
  • Pure text questions → "❓" placeholder
✓ NO forbidden types used (e.g., counting for ELA)
✓ Practice questions have COMPLETE practiceSupport
✓ Career context integrated naturally
✓ Grade-appropriate language and complexity
✓ Exactly the required number of questions
✓ True/False uses boolean, not strings
✓ Multiple choice uses index (0-3), not text
`;
}

// Get LEARN-specific reminders
export function getLearnReminders(subject: string, grade: string): string {
  return `Remember:
1. EVERY question MUST have ALL mandatory fields
2. correct_answer format MUST match the question type
3. visual field is ALWAYS required:
   - For shape questions: Use shape emojis (▲ ■ ● ◆)
   - For warning signs: Use ⚠️ or 🔺
   - For counting: Use object emojis
   - ONLY use "❓" for pure text questions with no visual element
4. Practice questions MUST include complete practiceSupport structure
5. Use ONLY the allowed question types for ${subject} grade ${grade}
6. ${subject === 'ELA' ? 'NEVER use counting type for ELA' : ''}`;
}