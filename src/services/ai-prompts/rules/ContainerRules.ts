/**
 * Container-Specific Rules - Define the tone, context, and structure for each container type
 * These rules shape the learning experience style
 */

export interface ContainerRule {
  context: {
    career_integration: string;
    focus: string;
    progression?: string;
  };
  tone: {
    instruction: string;
    encouragement: string;
    feedback: string;
  };
  structure: {
    examples?: string;
    practice: string;
    assessment: string;
  };
  special_features?: Record<string, string>;
}

export const CONTAINER_RULES: Record<string, ContainerRule> = {
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
      examples: '3 intriguing examples that spark questions',
      practice: '5 exploration questions encouraging investigation',
      assessment: '1 open-ended challenge to apply discoveries'
    },
    special_features: {
      what_if_scenarios: 'Pose "What would happen if..." questions',
      pattern_finding: 'Help identify patterns across examples',
      connection_making: 'Link to unexpected real-world applications',
      hypothesis_testing: 'Encourage predictions before revealing answers'
    }
  },

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
export function formatContainerRulesForPrompt(container: string, career?: string): string {
  const rules = CONTAINER_RULES[container];
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
export function getContainerRequirements(container: string): {
  exampleCount: number;
  practiceCount: number;
  assessmentCount: number;
  requiresSupport: boolean;
} {
  const rules = CONTAINER_RULES[container];
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
export function validateContainerRules(
  content: any,
  container: string
): string[] {
  const errors: string[] = [];
  const requirements = getContainerRequirements(container);
  
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
export function getContainerInstructions(
  container: string,
  career: string,
  studentName: string,
  gradeLevel: string
): string {
  const rules = CONTAINER_RULES[container];
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
      
    case 'DISCOVER':
      instructions.push(
        `Spark ${studentName}'s curiosity about how ${career}s use this skill.`,
        `Encourage exploration and "what if" thinking.`,
        `Help ${studentName} discover patterns and connections.`
      );
      break;
      
    case 'EXPERIENCE':
      instructions.push(
        `Let ${studentName} experience being a ${career} using this skill.`,
        `Create hands-on activities that simulate real ${career} tasks.`,
        `Encourage creativity and problem-solving.`
      );
      break;
      
    case 'ASSESSMENT':
      instructions.push(
        `Evaluate ${studentName}'s mastery of this skill objectively.`,
        `Use varied question types appropriate for grade ${gradeLevel}.`,
        `Provide clear, constructive feedback for growth.`
      );
      break;
  }
  
  return instructions.join('\n');
}