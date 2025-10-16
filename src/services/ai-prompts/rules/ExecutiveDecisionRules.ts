/**
 * Executive Decision Content Generation Rules
 * Age-appropriate content rules for the Executive Decision Maker game
 * Ensures business scenarios are educational and suitable for each grade level
 */

export interface ExecutiveContentRules {
  gradeLevel: string;
  scenarioComplexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  businessConcepts: string[];
  forbiddenTopics: string[];
  languageConstraints: {
    sentenceLength: string;
    vocabulary: string;
    technicalTerms: string;
  };
  scenarioTypes: {
    allowed: string[];
    examples: string[];
  };
  solutionGuidelines: {
    complexity: string;
    ethicalConsiderations: string[];
    realWorldConnection: string;
  };
}

export const EXECUTIVE_DECISION_RULES: Record<string, ExecutiveContentRules> = {
  // Elementary School (K-5, Ages 5-11)
  'elementary': {
    gradeLevel: 'K-5',
    scenarioComplexity: 'simple',
    businessConcepts: [
      'sharing', 'teamwork', 'helping', 'fairness', 'taking turns',
      'being kind', 'solving problems', 'making choices'
    ],
    forbiddenTopics: [
      'layoffs', 'bankruptcy', 'lawsuits', 'financial crisis',
      'workplace accidents', 'data breaches', 'hostile takeovers',
      'discrimination', 'harassment', 'violence', 'death'
    ],
    languageConstraints: {
      sentenceLength: '7-10 words per sentence',
      vocabulary: 'Simple, common words only',
      technicalTerms: 'None - use everyday language'
    },
    scenarioTypes: {
      allowed: ['helping', 'sharing', 'teamwork'],
      examples: [
        'The toy store needs more happy customers',
        'The pet shop ran out of dog food',
        'The ice cream truck needs a new song'
      ]
    },
    solutionGuidelines: {
      complexity: 'One-step solutions with clear cause-effect',
      ethicalConsiderations: ['Being nice', 'Sharing with others', 'Being fair'],
      realWorldConnection: 'Simple community helpers and local businesses'
    }
  },

  // Grades 1-2 (Ages 6-8)
  '1-2': {
    gradeLevel: '1-2',
    scenarioComplexity: 'simple',
    businessConcepts: [
      'customer service', 'making products', 'selling things', 'working together',
      'solving problems', 'being creative', 'helping community', 'being responsible'
    ],
    forbiddenTopics: [
      'layoffs', 'bankruptcy', 'lawsuits', 'financial crisis',
      'workplace injuries', 'cyber attacks', 'hostile takeovers',
      'discrimination', 'harassment', 'violence', 'substance abuse'
    ],
    languageConstraints: {
      sentenceLength: '5-8 words per sentence',
      vocabulary: 'Common words, simple business terms',
      technicalTerms: 'Very basic (customer, product, team)'
    },
    scenarioTypes: {
      allowed: ['customer happiness', 'product problems', 'team challenges'],
      examples: [
        'The bakery made too many cookies and needs to sell them',
        'The library computers are not working for students',
        'The park needs more fun activities for families'
      ]
    },
    solutionGuidelines: {
      complexity: 'Simple two-step solutions',
      ethicalConsiderations: ['Treating customers fairly', 'Being honest', 'Helping others'],
      realWorldConnection: 'Local businesses and community services'
    }
  },

  // Grades 3-5 (Ages 8-11)
  '3-5': {
    gradeLevel: '3-5',
    scenarioComplexity: 'moderate',
    businessConcepts: [
      'supply and demand', 'customer satisfaction', 'product quality',
      'teamwork and leadership', 'innovation', 'competition', 'marketing',
      'environmental responsibility', 'community impact'
    ],
    forbiddenTopics: [
      'mass layoffs', 'bankruptcy details', 'complex lawsuits',
      'severe workplace accidents', 'data breach details', 'corporate espionage',
      'discrimination cases', 'harassment', 'violence', 'addiction'
    ],
    languageConstraints: {
      sentenceLength: '8-12 words per sentence',
      vocabulary: 'Grade-appropriate with context clues',
      technicalTerms: 'Basic business terms with explanations'
    },
    scenarioTypes: {
      allowed: ['product launches', 'customer complaints', 'team conflicts', 'simple competition'],
      examples: [
        'A new competitor opened across the street with lower prices',
        'Customers are complaining about slow delivery times',
        'The team disagrees about which new product to make first'
      ]
    },
    solutionGuidelines: {
      complexity: 'Multi-step solutions with clear reasoning',
      ethicalConsiderations: [
        'Fair treatment of employees',
        'Honest advertising',
        'Environmental care',
        'Community responsibility'
      ],
      realWorldConnection: 'Regional businesses and basic global concepts'
    }
  },

  // Grades 6-8 (Ages 11-14)
  '6-8': {
    gradeLevel: '6-8',
    scenarioComplexity: 'complex',
    businessConcepts: [
      'market analysis', 'profit margins', 'employee satisfaction',
      'brand reputation', 'digital transformation', 'global markets',
      'sustainability', 'innovation strategies', 'risk management',
      'stakeholder interests', 'ethical decision-making'
    ],
    forbiddenTopics: [
      'graphic violence', 'explicit harassment details',
      'substance abuse details', 'mature financial crimes',
      'inappropriate content', 'extreme political scenarios'
    ],
    languageConstraints: {
      sentenceLength: '10-15 words per sentence',
      vocabulary: 'More complex with academic terms',
      technicalTerms: 'Industry-standard terms with context'
    },
    scenarioTypes: {
      allowed: [
        'market disruption', 'employee retention', 'product recalls',
        'international expansion', 'technology adoption', 'sustainability challenges'
      ],
      examples: [
        'A social media crisis threatens the company brand reputation',
        'Key employees are leaving for a competitor offering better benefits',
        'New environmental regulations require expensive factory upgrades'
      ]
    },
    solutionGuidelines: {
      complexity: 'Complex multi-faceted solutions',
      ethicalConsiderations: [
        'Stakeholder balance',
        'Long-term vs short-term thinking',
        'Corporate social responsibility',
        'Ethical leadership',
        'Diversity and inclusion'
      ],
      realWorldConnection: 'National and international business cases'
    }
  },

  // Grades 9-12 (Ages 14-18)
  '9-12': {
    gradeLevel: '9-12',
    scenarioComplexity: 'advanced',
    businessConcepts: [
      'strategic planning', 'financial analysis', 'merger and acquisition',
      'market disruption', 'digital innovation', 'global supply chains',
      'corporate governance', 'risk mitigation', 'change management',
      'leadership development', 'organizational culture', 'business ethics'
    ],
    forbiddenTopics: [
      'graphic content', 'explicit illegal activities',
      'inappropriate relationships', 'extreme violence'
    ],
    languageConstraints: {
      sentenceLength: 'Varied and sophisticated',
      vocabulary: 'Advanced business vocabulary',
      technicalTerms: 'Professional-level terminology'
    },
    scenarioTypes: {
      allowed: [
        'crisis management', 'strategic pivots', 'market disruption',
        'ethical dilemmas', 'global expansion', 'digital transformation',
        'merger decisions', 'innovation challenges'
      ],
      examples: [
        'A data breach exposed customer information requiring immediate response',
        'Disruptive technology threatens to make the core product obsolete',
        'Acquisition opportunity requires balancing growth with cultural fit'
      ]
    },
    solutionGuidelines: {
      complexity: 'Sophisticated multi-stakeholder solutions',
      ethicalConsiderations: [
        'Complex ethical frameworks',
        'Stakeholder theory',
        'Triple bottom line',
        'ESG considerations',
        'Global business ethics',
        'Leadership integrity'
      ],
      realWorldConnection: 'Real business case studies and current events'
    }
  },

  // Middle School (6-8, Ages 11-14) - Maps to 'middle' grade_category
  'middle': {
    gradeLevel: '6-8',
    scenarioComplexity: 'complex',
    businessConcepts: [
      'market analysis', 'profit margins', 'employee satisfaction',
      'brand reputation', 'digital transformation', 'global markets',
      'sustainability', 'innovation strategies', 'risk management',
      'stakeholder interests', 'ethical decision-making'
    ],
    forbiddenTopics: [
      'graphic violence', 'explicit harassment details',
      'substance abuse details', 'mature financial crimes',
      'inappropriate content', 'extreme political scenarios'
    ],
    languageConstraints: {
      sentenceLength: '10-15 words per sentence',
      vocabulary: 'More complex with academic terms',
      technicalTerms: 'Industry-standard terms with context'
    },
    scenarioTypes: {
      allowed: [
        'market disruption', 'employee retention', 'product recalls',
        'international expansion', 'technology adoption', 'sustainability challenges'
      ],
      examples: [
        'A social media crisis threatens the company brand reputation',
        'Key employees are leaving for a competitor offering better benefits',
        'New environmental regulations require expensive factory upgrades'
      ]
    },
    solutionGuidelines: {
      complexity: 'Complex multi-faceted solutions',
      ethicalConsiderations: [
        'Stakeholder balance',
        'Long-term vs short-term thinking',
        'Corporate social responsibility',
        'Ethical leadership',
        'Diversity and inclusion'
      ],
      realWorldConnection: 'National and international business cases'
    }
  },

  // High School (9-12, Ages 14-18) - Maps to 'high' grade_category
  'high': {
    gradeLevel: '9-12',
    scenarioComplexity: 'advanced',
    businessConcepts: [
      'strategic planning', 'financial analysis', 'merger and acquisition',
      'market disruption', 'digital innovation', 'global supply chains',
      'corporate governance', 'risk mitigation', 'change management',
      'leadership development', 'organizational culture', 'business ethics'
    ],
    forbiddenTopics: [
      'graphic content', 'explicit illegal activities',
      'inappropriate relationships', 'extreme violence'
    ],
    languageConstraints: {
      sentenceLength: 'Varied and sophisticated',
      vocabulary: 'Advanced business vocabulary',
      technicalTerms: 'Professional-level terminology'
    },
    scenarioTypes: {
      allowed: [
        'crisis management', 'strategic pivots', 'market disruption',
        'ethical dilemmas', 'global expansion', 'digital transformation',
        'merger decisions', 'innovation challenges'
      ],
      examples: [
        'A data breach exposed customer information requiring immediate response',
        'Disruptive technology threatens to make the core product obsolete',
        'Acquisition opportunity requires balancing growth with cultural fit'
      ]
    },
    solutionGuidelines: {
      complexity: 'Sophisticated multi-stakeholder solutions',
      ethicalConsiderations: [
        'Complex ethical frameworks',
        'Stakeholder theory',
        'Triple bottom line',
        'ESG considerations',
        'Global business ethics',
        'Leadership integrity'
      ],
      realWorldConnection: 'Real business case studies and current events'
    }
  }
};

/**
 * Map grade_category to appropriate rule key
 * grade_category is the high-level category (elementary, middle, high)
 * This function returns the appropriate rules key
 */
export function mapGradeCategoryToRules(gradeCategory: string): string {
  const categoryMap: Record<string, string> = {
    'elementary': 'elementary',
    'middle': 'middle',
    'high': 'high'
  };
  return categoryMap[gradeCategory] || 'elementary';
}

/**
 * Map individual grade_level to grade_category
 * grade_level is the specific grade (K, 1, 2, 3, etc.)
 * Returns the appropriate grade_category (elementary, middle, high)
 */
export function mapGradeLevelToCategory(gradeLevel: string): string {
  const gradeNum = parseInt(gradeLevel);

  if (gradeLevel === 'K' || gradeNum <= 5) {
    return 'elementary';
  } else if (gradeNum <= 8) {
    return 'middle';
  } else {
    return 'high';
  }
}

/**
 * Get rules for a grade category
 */
export function getRulesForCategory(gradeCategory: string): ExecutiveContentRules {
  const rulesKey = mapGradeCategoryToRules(gradeCategory);
  return EXECUTIVE_DECISION_RULES[rulesKey] || EXECUTIVE_DECISION_RULES['elementary'];
}

/**
 * Get age-appropriate executive roles for a grade level
 */
export function getAppropriateExecutives(gradeLevel: string): string[] {
  const gradeNum = parseInt(gradeLevel);

  if (gradeLevel === 'K' || gradeNum <= 2) {
    // Simplified roles for young students
    return ['Helper', 'Leader', 'Friend'];
  } else if (gradeNum <= 5) {
    // Basic executive roles with simple explanations
    return ['Marketing Helper (CMO)', 'Money Manager (CFO)', 'People Helper (CHRO)'];
  } else if (gradeNum <= 8) {
    // Standard executive roles with brief descriptions
    return ['CMO (Marketing)', 'CFO (Finance)', 'CHRO (People)', 'COO (Operations)', 'CTO (Technology)'];
  } else {
    // Full executive roles
    return ['CMO', 'CFO', 'CHRO', 'COO', 'CTO'];
  }
}

/**
 * Get appropriate scenario complexity for grade level
 */
export function getScenarioComplexity(gradeLevel: string): {
  timeLimit: number;
  solutionCount: number;
  difficultyRange: [number, number];
} {
  const gradeNum = parseInt(gradeLevel);

  if (gradeLevel === 'K' || gradeNum <= 2) {
    return {
      timeLimit: 120, // 2 minutes
      solutionCount: 3, // Choose from 3 solutions
      difficultyRange: [1, 2]
    };
  } else if (gradeNum <= 5) {
    return {
      timeLimit: 90, // 1.5 minutes
      solutionCount: 4, // Choose from 4 solutions
      difficultyRange: [2, 3]
    };
  } else if (gradeNum <= 8) {
    return {
      timeLimit: 60, // 1 minute
      solutionCount: 5, // Choose from 5 solutions
      difficultyRange: [3, 4]
    };
  } else {
    return {
      timeLimit: 45, // 45 seconds
      solutionCount: 5, // Choose from 5 solutions
      difficultyRange: [4, 5]
    };
  }
}

/**
 * Generate age-appropriate prompts for AI content generation
 * Accepts either grade_category (elementary, middle, high) or grade_level (K, 1, 2, etc.)
 */
export function getAgeAppropriatePrompt(gradeLevelOrCategory: string): string {
  // Check if it's a grade_category or grade_level
  let rules: ExecutiveContentRules;
  if (['elementary', 'middle', 'high'].includes(gradeLevelOrCategory)) {
    // It's a grade_category
    rules = getRulesForCategory(gradeLevelOrCategory);
  } else {
    // It's a grade_level, map to category first
    const category = mapGradeLevelToCategory(gradeLevelOrCategory);
    rules = getRulesForCategory(category);
  }

  return `
GRADE LEVEL: ${rules.gradeLevel}
AGE-APPROPRIATE CONTENT REQUIREMENTS:

LANGUAGE CONSTRAINTS:
• Sentence Length: ${rules.languageConstraints.sentenceLength}
• Vocabulary: ${rules.languageConstraints.vocabulary}
• Technical Terms: ${rules.languageConstraints.technicalTerms}

ALLOWED BUSINESS CONCEPTS:
${rules.businessConcepts.map(c => `• ${c}`).join('\n')}

FORBIDDEN TOPICS (NEVER INCLUDE):
${rules.forbiddenTopics.map(t => `• ❌ ${t}`).join('\n')}

SCENARIO GUIDELINES:
• Complexity: ${rules.scenarioComplexity}
• Allowed Types: ${rules.scenarioTypes.allowed.join(', ')}

ETHICAL CONSIDERATIONS:
${rules.solutionGuidelines.ethicalConsiderations.map(e => `• ${e}`).join('\n')}

REAL-WORLD CONNECTION:
${rules.solutionGuidelines.realWorldConnection}

IMPORTANT: All content must be educational, positive, and appropriate for students aged ${getAgeRange(gradeLevelOrCategory)}.
Focus on learning business concepts through constructive problem-solving.
Avoid any scenarios that could be frightening, inappropriate, or overly complex for this age group.
`;
}

/**
 * Get age range for grade level or category
 */
function getAgeRange(gradeLevelOrCategory: string): string {
  const ranges: Record<string, string> = {
    'elementary': '5-11 years old',
    'middle': '11-14 years old',
    'high': '14-18 years old',
    'K': '5-6 years old',
    '1-2': '6-8 years old',
    '3-5': '8-11 years old',
    '6-8': '11-14 years old',
    '9-12': '14-18 years old'
  };

  // Check if it's a direct match
  if (ranges[gradeLevelOrCategory]) {
    return ranges[gradeLevelOrCategory];
  }

  // Check if it's included in a range
  for (const [grade, range] of Object.entries(ranges)) {
    if (grade.includes(gradeLevelOrCategory)) {
      return range;
    }
  }

  return '5-11 years old'; // Default to elementary
}

/**
 * Validate content for age-appropriateness
 * Accepts either grade_category (elementary, middle, high) or grade_level (K, 1, 2, etc.)
 */
export function validateContentForAge(content: any, gradeLevelOrCategory: string): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Get appropriate rules
  let rules: ExecutiveContentRules;
  if (['elementary', 'middle', 'high'].includes(gradeLevelOrCategory)) {
    rules = getRulesForCategory(gradeLevelOrCategory);
  } else {
    const category = mapGradeLevelToCategory(gradeLevelOrCategory);
    rules = getRulesForCategory(category);
  }

  // Check for forbidden topics
  const contentStr = JSON.stringify(content).toLowerCase();
  for (const forbidden of rules.forbiddenTopics) {
    if (contentStr.includes(forbidden.toLowerCase())) {
      issues.push(`Content contains forbidden topic: ${forbidden}`);
    }
  }

  // Check sentence complexity (rough check)
  if (content.description) {
    const sentences = content.description.split(/[.!?]+/);
    const avgWords = sentences.reduce((sum, s) => sum + s.trim().split(' ').length, 0) / sentences.length;

    const maxWords = parseInt(rules.languageConstraints.sentenceLength.split('-')[1]) || 15;
    if (avgWords > maxWords * 1.5) {
      issues.push(`Sentences too complex for ${rules.gradeLevel}`);
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Get simplified 6 C's descriptions for younger grades
 * Accepts either grade_category (elementary, middle, high) or grade_level (K, 1, 2, etc.)
 */
export function getSimplified6Cs(gradeLevelOrCategory: string): Record<string, string> {
  // Map to category if needed
  let category = gradeLevelOrCategory;
  if (!['elementary', 'middle', 'high'].includes(gradeLevelOrCategory)) {
    category = mapGradeLevelToCategory(gradeLevelOrCategory);
  }

  // Provide simplified descriptions for elementary
  if (category === 'elementary') {
    return {
      character: 'Making Right Choices',
      competence: 'Being Good at Things',
      communication: 'Explaining Ideas Well',
      compassion: 'Caring About Others',
      commitment: 'Sticking With It',
      confidence: 'Trusting Yourself'
    };
  } else {
    // Middle and high school use standard terminology
    return {
      character: 'Character',
      competence: 'Competence',
      communication: 'Communication',
      compassion: 'Compassion',
      commitment: 'Commitment',
      confidence: 'Confidence'
    };
  }
}

export default EXECUTIVE_DECISION_RULES;