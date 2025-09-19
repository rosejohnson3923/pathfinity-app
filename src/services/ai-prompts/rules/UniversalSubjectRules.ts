/**
 * Subject-Specific Rules - Override or extend universal rules for each subject
 * These rules handle subject-specific patterns and restrictions
 */

export interface SubjectRule {
  forbidden_types?: string[];
  allowed_types: Record<string, string[]>;
  patterns: Record<string, string | Record<string, string>>;
  visuals?: Record<string, string>;
  special_rules?: Record<string, string>;
  career_appropriate_emojis?: Record<string, string[]>;
}

export const SUBJECT_RULES: Record<string, SubjectRule> = {
  MATH: {
    allowed_types: {
      'K-2': ['counting', 'multiple_choice', 'true_false', 'numeric'],
      '3-5': ['numeric', 'multiple_choice', 'true_false', 'fill_blank'],
      '6-8': ['numeric', 'multiple_choice', 'true_false', 'fill_blank', 'short_answer'],
      '9-12': ['numeric', 'multiple_choice', 'true_false', 'fill_blank', 'short_answer', 'long_answer']
    },
    patterns: {
      how_many: {
        'K-2': 'MUST use "counting" type with visual emojis',
        '3+': 'MUST use "numeric" type (no visual required)'
      },
      word_problems: 'Use "multiple_choice" or "numeric"',
      equations: 'Use "fill_blank" for missing values or "numeric" for solutions',
      comparisons: 'Use "true_false" for >, <, = statements',
      patterns_sequences: 'Use "fill_blank" or "multiple_choice"'
    },
    visuals: {
      counting: 'REQUIRED - use SIMPLE, SINGLE emojis repeated (⚽⚽⚽ not 🧑‍🤝‍🧑)',
      counting_rules: 'NEVER use compound emojis. Use ⚽🏀🎾🟠⭐ etc. NOT 🧑‍🤝‍🧑👨‍👩‍👧',
      geometric: 'Use shape emojis (▲ ■ ● ◆) for geometry',
      other: 'OPTIONAL - use "❓" or null if not helpful'
    },
    career_appropriate_emojis: {
      Chef: ['🍎', '🍕', '🥐', '🍰', '🥕'],
      Doctor: ['💊', '🩺', '🌡️', '🏥', '💉'],
      Athlete: ['⚽', '🏀', '🎾', '🏈', '⚾'],
      Coach: ['⚽', '🏀', '🎾', '🟠', '⭐', '🏆'],
      Teacher: ['📚', '✏️', '📐', '🖊️', '📝'],
      Firefighter: ['🚒', '🔥', '💧', '🪜', '⛑️'],
      Entrepreneur: ['💰', '📊', '💡', '📈', '💼']
    }
  },

  ELA: {
    forbidden_types: ['counting'], // CRITICAL: NEVER use counting for ELA
    allowed_types: {
      'all': ['multiple_choice', 'true_false', 'fill_blank', 'short_answer'],
      'K-2': ['multiple_choice', 'true_false'],
      '3-5': ['multiple_choice', 'true_false', 'fill_blank', 'short_answer'],
      '6-8': ['multiple_choice', 'true_false', 'fill_blank', 'short_answer', 'long_answer'],
      '9-12': ['multiple_choice', 'true_false', 'fill_blank', 'short_answer', 'long_answer']
    },
    patterns: {
      letter_identification: 'MUST use "multiple_choice" with single letters as options',
      phonics: 'MUST use "multiple_choice" with word options',
      rhyming: 'Use "multiple_choice" with rhyming word sets',
      reading_comprehension: 'Use "true_false" for facts or "multiple_choice" for inference',
      vocabulary: 'Use "fill_blank" for context or "multiple_choice" for definitions',
      grammar: 'Use "multiple_choice" for correct form or "fill_blank" for application',
      writing_mechanics: 'Use "true_false" or "multiple_choice"',
      main_idea: 'Use "multiple_choice" with statement options or "true_false" for verification'
    },
    special_rules: {
      never_count: 'NEVER ask "How many letters/words" - ask "Which letter/word" instead',
      true_false_usage: 'Use true_false ONLY for factual statements about text',
      always_context: 'Provide sentence/paragraph context for vocabulary and grammar'
    },
    visuals: {
      default: 'Usually "❓" or null - text is the primary visual',
      picture_books: 'Can include descriptive emojis for story elements'
    }
  },

  SCIENCE: {
    forbidden_types: ['counting'],
    allowed_types: {
      'K-2': ['multiple_choice', 'true_false'],
      '3-5': ['multiple_choice', 'true_false', 'fill_blank'],
      '6-8': ['multiple_choice', 'true_false', 'fill_blank', 'short_answer'],
      '9-12': ['multiple_choice', 'true_false', 'fill_blank', 'short_answer', 'long_answer']
    },
    patterns: {
      observations: 'Use "multiple_choice" for what happens when...',
      facts: 'Use "true_false" for scientific facts',
      vocabulary: 'Use "fill_blank" or "multiple_choice" for terms',
      processes: 'Use "ordering" for sequences or "multiple_choice" for steps',
      predictions: 'Use "multiple_choice" for hypothesis selection',
      classification: 'Use "multiple_choice" for categorization',
      cause_effect: 'Use "multiple_choice" or "true_false"'
    },
    visuals: {
      phenomena: 'Include relevant emojis (☀️🌙 for day/night, 💧❄️ for water states)',
      living_things: 'Use nature emojis (🌱🌳🐛🦋 for life cycles)',
      weather: 'Use weather emojis (☁️⛈️🌈☀️)',
      text_facts: 'Use "❓" or null for abstract concepts'
    },
    career_appropriate_emojis: {
      Scientist: ['🔬', '🧪', '🔭', '🧬', '⚗️'],
      Doctor: ['🩺', '💊', '🦴', '🫀', '🧠'],
      Farmer: ['🌱', '🌾', '🚜', '🌽', '🥕'],
      Astronaut: ['🚀', '🌍', '🌙', '⭐', '🛸']
    }
  },

  SOCIAL_STUDIES: {
    forbidden_types: ['counting'],
    allowed_types: {
      'K-2': ['multiple_choice', 'true_false'],
      '3-5': ['multiple_choice', 'true_false', 'fill_blank'],
      '6-8': ['multiple_choice', 'true_false', 'fill_blank', 'short_answer'],
      '9-12': ['multiple_choice', 'true_false', 'fill_blank', 'short_answer', 'long_answer']
    },
    patterns: {
      geography: 'Use "true_false" for location facts or "multiple_choice" for identification',
      history: 'Use "multiple_choice" for events or "true_false" for facts',
      civics: 'Use "multiple_choice" for roles and responsibilities',
      culture: 'Use "multiple_choice" with descriptive cultural options',
      economics: 'Use "multiple_choice" or "true_false" for concepts',
      community_helpers: 'Use "multiple_choice" for who helps when'
    },
    visuals: {
      maps: 'Use directional emojis (⬆️➡️⬇️⬅️) or landmarks',
      culture: 'Use cultural emojis respectfully',
      community: 'Use building/role emojis (🏫🏥🏪👮)',
      abstract: 'Use "❓" or null for concepts'
    }
  }
};

// Grade level mapping helper
export function getGradeCategory(grade: string): string {
  const gradeNum = parseInt(grade);
  if (grade === 'K' || gradeNum <= 2) return 'K-2';
  if (gradeNum <= 5) return '3-5';
  if (gradeNum <= 8) return '6-8';
  if (gradeNum <= 12) return '9-12';
  return '9-12'; // Default for any higher
}

// Get allowed types for subject and grade
export function getAllowedTypes(subject: string, grade: string): string[] {
  const subjectRules = SUBJECT_RULES[subject];
  if (!subjectRules) return [];
  
  const gradeCategory = getGradeCategory(grade);
  
  // Check for specific grade category first
  if (subjectRules.allowed_types[gradeCategory]) {
    return subjectRules.allowed_types[gradeCategory];
  }
  
  // Fall back to 'all' if exists
  if (subjectRules.allowed_types['all']) {
    return subjectRules.allowed_types['all'];
  }
  
  // Combine all grade levels if no specific match
  const allTypes = new Set<string>();
  Object.values(subjectRules.allowed_types).forEach(types => {
    if (Array.isArray(types)) {
      types.forEach(type => allTypes.add(type));
    }
  });
  
  // Remove forbidden types
  if (subjectRules.forbidden_types) {
    subjectRules.forbidden_types.forEach(type => allTypes.delete(type));
  }
  
  return Array.from(allTypes);
}

// Format subject rules for AI prompt
export function formatSubjectRulesForPrompt(subject: string, grade: string): string {
  const rules = SUBJECT_RULES[subject];
  if (!rules) return '';
  
  const gradeCategory = getGradeCategory(grade);
  const allowedTypes = getAllowedTypes(subject, grade);
  
  let output = `
========================================
${subject} SPECIFIC RULES (Grade ${grade})
========================================
`;
  
  if (rules.forbidden_types && rules.forbidden_types.length > 0) {
    output += `
FORBIDDEN TYPES (NEVER USE):
${rules.forbidden_types.map(t => `  ✗ ${t}`).join('\n')}
`;
  }
  
  output += `
ALLOWED TYPES FOR GRADE ${grade}:
${allowedTypes.map(t => `  ✓ ${t}`).join('\n')}
`;
  
  output += `
PATTERN RULES:`;
  
  Object.entries(rules.patterns).forEach(([pattern, rule]) => {
    if (typeof rule === 'string') {
      output += `
  • ${pattern}: ${rule}`;
    } else {
      // Handle grade-specific patterns
      const gradeRule = rule[gradeCategory] || rule['3+'] || 'Use appropriate type';
      output += `
  • ${pattern}: ${gradeRule}`;
    }
  });
  
  if (rules.special_rules) {
    output += `

SPECIAL RULES:`;
    Object.entries(rules.special_rules).forEach(([key, rule]) => {
      output += `
  ! ${rule}`;
    });
  }
  
  if (rules.visuals) {
    output += `

VISUAL GUIDELINES:`;
    Object.entries(rules.visuals).forEach(([key, guide]) => {
      output += `
  • ${key}: ${guide}`;
    });
  }
  
  if (rules.career_appropriate_emojis) {
    output += `

CAREER-APPROPRIATE VISUAL OPTIONS:`;
    Object.entries(rules.career_appropriate_emojis).forEach(([career, emojis]) => {
      output += `
  • ${career}: ${emojis.join(' ')}`;
    });
  }
  
  return output;
}

// Validate question against subject rules
export function validateSubjectRules(question: any, subject: string, grade: string): string[] {
  const errors: string[] = [];
  const rules = SUBJECT_RULES[subject];
  
  if (!rules) return errors;
  
  // Check forbidden types
  if (rules.forbidden_types && rules.forbidden_types.includes(question.type)) {
    errors.push(`Type "${question.type}" is forbidden for ${subject}`);
  }
  
  // Check allowed types
  const allowedTypes = getAllowedTypes(subject, grade);
  if (allowedTypes.length > 0 && !allowedTypes.includes(question.type)) {
    errors.push(`Type "${question.type}" not allowed for ${subject} grade ${grade}`);
  }
  
  // Special validation for ELA
  if (subject === 'ELA' && question.type === 'counting') {
    errors.push('CRITICAL: counting type is NEVER allowed for ELA');
  }
  
  // Check for required visuals (Math counting)
  if (subject === 'MATH' && question.type === 'counting' && !question.visual) {
    errors.push('Counting questions MUST have visual field with emojis');
  }
  
  return errors;
}