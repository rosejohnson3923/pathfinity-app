// ================================================================
// SKILL CATEGORY TO TOOL MAPPINGS
// Configuration for A.0 skill categories and their corresponding tools
// ================================================================

export interface SkillCategoryMapping {
  category: string;
  categoryName: string;
  description: string;
  subjects: string[];
  gradeRange: string[];
  primaryTools: string[];
  secondaryTools: string[];
  fallbackTools: string[];
  toolPreferences: {
    interactive: boolean;
    assessment: boolean;
    collaborative: boolean;
    visual: boolean;
    auditory: boolean;
    kinesthetic: boolean;
  };
  safetyRequirements: {
    coppaCompliant: boolean;
    ferpaCompliant: boolean;
    ageAppropriate: boolean;
    contentFiltered: boolean;
  };
  cognitiveLoad: 'low' | 'medium' | 'high';
  estimatedDuration: {
    min: number;
    max: number;
    optimal: number;
  };
}

export interface ToolCompatibilityMatrix {
  [toolId: string]: {
    supportedCategories: string[];
    optimalCategories: string[];
    subjects: string[];
    gradeRange: string[];
    efficacyScore: number;
    usageFrequency: number;
    lastUpdated: Date;
  };
}

export const SKILL_CATEGORY_MAPPINGS: SkillCategoryMapping[] = [
  // A.0 - Numbers and Counting
  {
    category: 'A.0',
    categoryName: 'Numbers and Counting',
    description: 'Fundamental number recognition, counting, and basic arithmetic operations',
    subjects: ['Math'],
    gradeRange: ['Pre-K', 'K', '1', '2'],
    primaryTools: ['counting-bears', 'number-line', 'basic-addition', 'counting-to-10'],
    secondaryTools: ['number-recognition', 'simple-patterns', 'place-value'],
    fallbackTools: ['MasterToolInterface', 'AlgebraTiles'],
    toolPreferences: {
      interactive: true,
      assessment: true,
      collaborative: false,
      visual: true,
      auditory: true,
      kinesthetic: true
    },
    safetyRequirements: {
      coppaCompliant: true,
      ferpaCompliant: true,
      ageAppropriate: true,
      contentFiltered: true
    },
    cognitiveLoad: 'low',
    estimatedDuration: {
      min: 5,
      max: 15,
      optimal: 10
    }
  },

  // B.0 - Shapes and Geometry
  {
    category: 'B.0',
    categoryName: 'Shapes and Geometry',
    description: 'Geometric shapes, spatial relationships, and visual-spatial reasoning',
    subjects: ['Math'],
    gradeRange: ['Pre-K', 'K', '1', '2', '3'],
    primaryTools: ['shape-sorter', 'pattern-blocks', '2d-shapes', '3d-shapes'],
    secondaryTools: ['geometry-builder', 'symmetry-explorer', 'tangram-puzzles'],
    fallbackTools: ['MasterToolInterface', 'GraphingCalculator'],
    toolPreferences: {
      interactive: true,
      assessment: true,
      collaborative: true,
      visual: true,
      auditory: false,
      kinesthetic: true
    },
    safetyRequirements: {
      coppaCompliant: true,
      ferpaCompliant: true,
      ageAppropriate: true,
      contentFiltered: true
    },
    cognitiveLoad: 'medium',
    estimatedDuration: {
      min: 10,
      max: 20,
      optimal: 15
    }
  },

  // C.0 - Reading and Phonics
  {
    category: 'C.0',
    categoryName: 'Reading and Phonics',
    description: 'Letter recognition, phonemic awareness, and early reading skills',
    subjects: ['ELA'],
    gradeRange: ['Pre-K', 'K', '1', '2'],
    primaryTools: ['letter-sounds', 'sight-words', 'phonics-blending', 'rhyme-time'],
    secondaryTools: ['reading-comprehension', 'word-families', 'alphabet-games'],
    fallbackTools: ['WritingStudio', 'BrandStudio'],
    toolPreferences: {
      interactive: true,
      assessment: true,
      collaborative: false,
      visual: true,
      auditory: true,
      kinesthetic: false
    },
    safetyRequirements: {
      coppaCompliant: true,
      ferpaCompliant: true,
      ageAppropriate: true,
      contentFiltered: true
    },
    cognitiveLoad: 'medium',
    estimatedDuration: {
      min: 8,
      max: 18,
      optimal: 12
    }
  },

  // D.0 - Science Exploration
  {
    category: 'D.0',
    categoryName: 'Science Exploration',
    description: 'Basic scientific concepts, observation skills, and natural phenomena',
    subjects: ['Science'],
    gradeRange: ['Pre-K', 'K', '1', '2', '3'],
    primaryTools: ['weather-watch', 'animal-habitats', 'plant-life-cycle', 'simple-machines'],
    secondaryTools: ['seasons-simulator', 'matter-states', 'magnets-exploration'],
    fallbackTools: ['VirtualLab', 'MasterToolInterface'],
    toolPreferences: {
      interactive: true,
      assessment: true,
      collaborative: true,
      visual: true,
      auditory: true,
      kinesthetic: true
    },
    safetyRequirements: {
      coppaCompliant: true,
      ferpaCompliant: true,
      ageAppropriate: true,
      contentFiltered: true
    },
    cognitiveLoad: 'medium',
    estimatedDuration: {
      min: 12,
      max: 25,
      optimal: 18
    }
  },

  // E.0 - Social Studies
  {
    category: 'E.0',
    categoryName: 'Social Studies',
    description: 'Community awareness, cultural understanding, and social skills',
    subjects: ['SocialStudies'],
    gradeRange: ['Pre-K', 'K', '1', '2', '3'],
    primaryTools: ['family-community', 'maps-directions', 'community-helpers', 'rules-safety'],
    secondaryTools: ['past-present', 'citizenship', 'cultures-exploration'],
    fallbackTools: ['BrandStudio', 'WritingStudio'],
    toolPreferences: {
      interactive: true,
      assessment: false,
      collaborative: true,
      visual: true,
      auditory: true,
      kinesthetic: false
    },
    safetyRequirements: {
      coppaCompliant: true,
      ferpaCompliant: true,
      ageAppropriate: true,
      contentFiltered: true
    },
    cognitiveLoad: 'low',
    estimatedDuration: {
      min: 10,
      max: 20,
      optimal: 15
    }
  },

  // F.0 - Creative Arts
  {
    category: 'F.0',
    categoryName: 'Creative Arts',
    description: 'Artistic expression, creativity, and fine motor skills development',
    subjects: ['Art', 'Music'],
    gradeRange: ['Pre-K', 'K', '1', '2', '3', '4'],
    primaryTools: ['digital-art-studio', 'music-maker', 'color-theory', 'rhythm-patterns'],
    secondaryTools: ['drawing-tools', 'sound-exploration', 'creative-stories'],
    fallbackTools: ['BrandStudio', 'WritingStudio'],
    toolPreferences: {
      interactive: true,
      assessment: false,
      collaborative: true,
      visual: true,
      auditory: true,
      kinesthetic: true
    },
    safetyRequirements: {
      coppaCompliant: true,
      ferpaCompliant: true,
      ageAppropriate: true,
      contentFiltered: true
    },
    cognitiveLoad: 'low',
    estimatedDuration: {
      min: 15,
      max: 30,
      optimal: 20
    }
  },

  // G.0 - Physical Development
  {
    category: 'G.0',
    categoryName: 'Physical Development',
    description: 'Motor skills, coordination, and physical health awareness',
    subjects: ['PE', 'Health'],
    gradeRange: ['Pre-K', 'K', '1', '2', '3'],
    primaryTools: ['movement-games', 'coordination-activities', 'healthy-habits', 'exercise-videos'],
    secondaryTools: ['balance-challenges', 'nutrition-explorer', 'body-awareness'],
    fallbackTools: ['BrandStudio', 'WritingStudio'],
    toolPreferences: {
      interactive: true,
      assessment: false,
      collaborative: true,
      visual: true,
      auditory: true,
      kinesthetic: true
    },
    safetyRequirements: {
      coppaCompliant: true,
      ferpaCompliant: true,
      ageAppropriate: true,
      contentFiltered: true
    },
    cognitiveLoad: 'low',
    estimatedDuration: {
      min: 10,
      max: 25,
      optimal: 15
    }
  },

  // H.0 - Language Development
  {
    category: 'H.0',
    categoryName: 'Language Development',
    description: 'Vocabulary building, communication skills, and language comprehension',
    subjects: ['ELA', 'ESL'],
    gradeRange: ['Pre-K', 'K', '1', '2', '3'],
    primaryTools: ['vocabulary-builder', 'conversation-practice', 'story-telling', 'language-games'],
    secondaryTools: ['pronunciation-helper', 'grammar-basics', 'listening-activities'],
    fallbackTools: ['WritingStudio', 'BrandStudio'],
    toolPreferences: {
      interactive: true,
      assessment: true,
      collaborative: true,
      visual: true,
      auditory: true,
      kinesthetic: false
    },
    safetyRequirements: {
      coppaCompliant: true,
      ferpaCompliant: true,
      ageAppropriate: true,
      contentFiltered: true
    },
    cognitiveLoad: 'medium',
    estimatedDuration: {
      min: 8,
      max: 18,
      optimal: 12
    }
  }
];

// Tool Compatibility Matrix
export const TOOL_COMPATIBILITY_MATRIX: ToolCompatibilityMatrix = {
  'counting-bears': {
    supportedCategories: ['A.0'],
    optimalCategories: ['A.0'],
    subjects: ['Math'],
    gradeRange: ['Pre-K', 'K'],
    efficacyScore: 0.92,
    usageFrequency: 850,
    lastUpdated: new Date('2024-01-15')
  },
  'shape-sorter': {
    supportedCategories: ['B.0'],
    optimalCategories: ['B.0'],
    subjects: ['Math'],
    gradeRange: ['Pre-K', 'K', '1'],
    efficacyScore: 0.88,
    usageFrequency: 720,
    lastUpdated: new Date('2024-01-20')
  },
  'letter-sounds': {
    supportedCategories: ['C.0', 'H.0'],
    optimalCategories: ['C.0'],
    subjects: ['ELA'],
    gradeRange: ['Pre-K', 'K', '1'],
    efficacyScore: 0.94,
    usageFrequency: 950,
    lastUpdated: new Date('2024-01-18')
  },
  'weather-watch': {
    supportedCategories: ['D.0'],
    optimalCategories: ['D.0'],
    subjects: ['Science'],
    gradeRange: ['Pre-K', 'K', '1', '2'],
    efficacyScore: 0.86,
    usageFrequency: 640,
    lastUpdated: new Date('2024-01-22')
  },
  'MasterToolInterface': {
    supportedCategories: ['A.0', 'B.0', 'C.0', 'D.0', 'E.0'],
    optimalCategories: ['A.0', 'B.0'],
    subjects: ['Math', 'Science'],
    gradeRange: ['Pre-K', 'K', '1', '2', '3', '4', '5'],
    efficacyScore: 0.82,
    usageFrequency: 1200,
    lastUpdated: new Date('2024-01-25')
  },
  'WritingStudio': {
    supportedCategories: ['C.0', 'H.0', 'E.0'],
    optimalCategories: ['C.0', 'H.0'],
    subjects: ['ELA', 'SocialStudies'],
    gradeRange: ['K', '1', '2', '3', '4', '5'],
    efficacyScore: 0.89,
    usageFrequency: 800,
    lastUpdated: new Date('2024-01-20')
  },
  'VirtualLab': {
    supportedCategories: ['D.0'],
    optimalCategories: ['D.0'],
    subjects: ['Science'],
    gradeRange: ['1', '2', '3', '4', '5'],
    efficacyScore: 0.91,
    usageFrequency: 680,
    lastUpdated: new Date('2024-01-24')
  },
  'BrandStudio': {
    supportedCategories: ['F.0', 'E.0', 'H.0'],
    optimalCategories: ['F.0'],
    subjects: ['Art', 'ELA', 'SocialStudies'],
    gradeRange: ['K', '1', '2', '3', '4', '5'],
    efficacyScore: 0.85,
    usageFrequency: 520,
    lastUpdated: new Date('2024-01-19')
  }
};

// ================================================================
// MAPPING UTILITIES
// ================================================================

export class SkillCategoryMappingService {
  
  /**
   * Get tool recommendations for a specific skill category
   */
  static getToolsForCategory(
    category: string,
    gradeLevel: string,
    preferences?: {
      interactive?: boolean;
      assessment?: boolean;
      collaborative?: boolean;
      maxResults?: number;
    }
  ): string[] {
    const mapping = SKILL_CATEGORY_MAPPINGS.find(m => m.category === category);
    if (!mapping) return [];

    // Check if grade level is supported
    if (!mapping.gradeRange.includes(gradeLevel)) {
      return mapping.fallbackTools;
    }

    let tools = [...mapping.primaryTools];
    
    // Add secondary tools if preferences allow
    if (preferences?.interactive && mapping.toolPreferences.interactive) {
      tools.push(...mapping.secondaryTools);
    }
    
    // Filter by compatibility matrix
    tools = tools.filter(toolId => {
      const compatibility = TOOL_COMPATIBILITY_MATRIX[toolId];
      return compatibility && 
             compatibility.supportedCategories.includes(category) &&
             compatibility.gradeRange.includes(gradeLevel);
    });

    // Sort by efficacy score
    tools.sort((a, b) => {
      const scoreA = TOOL_COMPATIBILITY_MATRIX[a]?.efficacyScore || 0;
      const scoreB = TOOL_COMPATIBILITY_MATRIX[b]?.efficacyScore || 0;
      return scoreB - scoreA;
    });

    // Limit results
    if (preferences?.maxResults) {
      tools = tools.slice(0, preferences.maxResults);
    }

    return tools;
  }

  /**
   * Get category information
   */
  static getCategoryInfo(category: string): SkillCategoryMapping | null {
    return SKILL_CATEGORY_MAPPINGS.find(m => m.category === category) || null;
  }

  /**
   * Get all supported categories
   */
  static getAllCategories(): string[] {
    return SKILL_CATEGORY_MAPPINGS.map(m => m.category);
  }

  /**
   * Get categories for a specific subject
   */
  static getCategoriesForSubject(subject: string): string[] {
    return SKILL_CATEGORY_MAPPINGS
      .filter(m => m.subjects.includes(subject))
      .map(m => m.category);
  }

  /**
   * Get categories for a specific grade level
   */
  static getCategoriesForGrade(gradeLevel: string): string[] {
    return SKILL_CATEGORY_MAPPINGS
      .filter(m => m.gradeRange.includes(gradeLevel))
      .map(m => m.category);
  }

  /**
   * Get optimal tool for a specific category and context
   */
  static getOptimalTool(
    category: string,
    gradeLevel: string,
    subject: string,
    context?: {
      timeAvailable?: number;
      studentPreferences?: any;
      assessmentNeeded?: boolean;
    }
  ): string | null {
    const mapping = this.getCategoryInfo(category);
    if (!mapping) return null;

    // Check time constraints
    if (context?.timeAvailable && context.timeAvailable < mapping.estimatedDuration.min) {
      return null;
    }

    const tools = this.getToolsForCategory(category, gradeLevel, {
      assessment: context?.assessmentNeeded,
      maxResults: 1
    });

    return tools.length > 0 ? tools[0] : null;
  }

  /**
   * Get tool effectiveness score for a category
   */
  static getToolEffectiveness(toolId: string, category: string): number {
    const compatibility = TOOL_COMPATIBILITY_MATRIX[toolId];
    if (!compatibility) return 0;

    const isOptimal = compatibility.optimalCategories.includes(category);
    const isSupported = compatibility.supportedCategories.includes(category);

    if (isOptimal) return compatibility.efficacyScore;
    if (isSupported) return compatibility.efficacyScore * 0.8;
    return 0;
  }

  /**
   * Update tool usage frequency
   */
  static updateToolUsage(toolId: string): void {
    if (TOOL_COMPATIBILITY_MATRIX[toolId]) {
      TOOL_COMPATIBILITY_MATRIX[toolId].usageFrequency++;
      TOOL_COMPATIBILITY_MATRIX[toolId].lastUpdated = new Date();
    }
  }

  /**
   * Get mapping statistics
   */
  static getMappingStats(): {
    totalCategories: number;
    totalTools: number;
    averageToolsPerCategory: number;
    categoriesBySubject: Record<string, number>;
    toolsByGrade: Record<string, number>;
  } {
    const totalCategories = SKILL_CATEGORY_MAPPINGS.length;
    const totalTools = Object.keys(TOOL_COMPATIBILITY_MATRIX).length;
    const averageToolsPerCategory = totalTools / totalCategories;

    const categoriesBySubject: Record<string, number> = {};
    const toolsByGrade: Record<string, number> = {};

    SKILL_CATEGORY_MAPPINGS.forEach(mapping => {
      mapping.subjects.forEach(subject => {
        categoriesBySubject[subject] = (categoriesBySubject[subject] || 0) + 1;
      });

      mapping.gradeRange.forEach(grade => {
        toolsByGrade[grade] = (toolsByGrade[grade] || 0) + mapping.primaryTools.length;
      });
    });

    return {
      totalCategories,
      totalTools,
      averageToolsPerCategory,
      categoriesBySubject,
      toolsByGrade
    };
  }
}

// Export default mappings
export default {
  mappings: SKILL_CATEGORY_MAPPINGS,
  compatibility: TOOL_COMPATIBILITY_MATRIX,
  service: SkillCategoryMappingService
};