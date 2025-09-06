// ================================================================
// EXCEL IMPORT TYPES
// TypeScript interfaces for importing skills data from Excel
// ================================================================

// Excel File Configuration
export interface ExcelImportConfig {
  filePath: string;
  fallbackPaths: string[];
  targetTabs: string[];
  batchSize: number;
  dryRun: boolean;
  verbose: boolean;
}

// Excel Row Data Structure (as read from Excel)
export interface ExcelSkillRow {
  Subject?: string;
  Grade?: string;
  SkillsArea?: string;
  SkillsCluster?: string;
  SkillNumber?: string;
  SkillName?: string;
  SkillDescription?: string;
  [key: string]: any; // Allow for additional columns
}

// Processed Skill Data (after validation and transformation)
export interface ProcessedSkillData {
  subject: 'Math' | 'ELA' | 'Science' | 'SocialStudies';
  grade: 'Pre-K' | 'K';
  skills_area: string;
  skills_cluster: string;
  skill_number: string;
  skill_name: string;
  skill_description?: string;
  difficulty_level: number;
  estimated_time_minutes: number;
  prerequisites?: string[];
}

// Tab Information
export interface TabInfo {
  name: string;
  subject: string;
  grade: string;
  rowCount: number;
  validRows: number;
  errors: string[];
}

// Import Statistics
export interface ImportStats {
  totalTabs: number;
  processedTabs: number;
  totalRows: number;
  validRows: number;
  insertedRows: number;
  skippedRows: number;
  errors: number;
  duplicates: number;
  processingTime: number;
}

// Import Result for a single tab
export interface TabImportResult {
  tabName: string;
  success: boolean;
  rowsProcessed: number;
  rowsInserted: number;
  rowsSkipped: number;
  errors: ImportError[];
  processingTime: number;
}

// Import Error
export interface ImportError {
  type: 'VALIDATION' | 'DATABASE' | 'FILE' | 'PARSE';
  message: string;
  row?: number;
  data?: any;
  details?: Record<string, any>;
}

// Command Line Options
export interface ImportOptions {
  file?: string;
  tabs?: string;
  allPrekK?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
  batchSize?: number;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
}

// Excel Column Mapping
export interface ColumnMapping {
  subject: string;
  grade: string;
  skillsArea: string;
  skillsCluster: string;
  skillNumber: string;
  skillName: string;
  skillDescription?: string;
}

// Default column mappings for different Excel formats
export const DEFAULT_COLUMN_MAPPINGS: Record<string, ColumnMapping> = {
  standard: {
    subject: 'Subject',
    grade: 'Grade',
    skillsArea: 'SkillsArea',
    skillsCluster: 'SkillCluster', // Note: Excel uses SkillCluster not SkillsCluster
    skillNumber: 'SkillNumber',
    skillName: 'SkillName',
    skillDescription: 'SkillDescription'
  },
  pathfinity: {
    subject: 'Subject',
    grade: 'Grade',
    skillsArea: 'SkillsArea',
    skillsCluster: 'SkillCluster', // Real Excel file format
    skillNumber: 'SkillNumber',
    skillName: 'SkillName',
    skillDescription: 'SkillDescription'
  },
  alternative: {
    subject: 'A',
    grade: 'B',
    skillsArea: 'C',
    skillsCluster: 'D',
    skillNumber: 'E',
    skillName: 'F',
    skillDescription: 'G'
  }
};

// Tab Name Parsing Configuration
export interface TabConfig {
  pattern: RegExp;
  subjectMap: Record<string, string>;
  gradeMap: Record<string, string>;
}

export const TAB_CONFIGURATIONS: Record<string, TabConfig> = {
  standard: {
    pattern: /^([A-Za-z]+)_([A-Za-z-]+)$/,
    subjectMap: {
      'Math': 'Math',
      'ELA': 'ELA',
      'Science': 'Science',
      'SocialStudies': 'SocialStudies',
      'SS': 'SocialStudies'
    },
    gradeMap: {
      'PreK': 'Pre-K',
      'Pre-K': 'Pre-K',
      'K': 'K',
      'Kindergarten': 'K'
    }
  }
};

// Difficulty Level Estimation Rules
export interface DifficultyRule {
  grade: string;
  baseLevel: number;
  skillNumberMultiplier: number;
  keywordAdjustments: Record<string, number>;
}

export const DIFFICULTY_RULES: Record<string, DifficultyRule> = {
  'Pre-K': {
    grade: 'Pre-K',
    baseLevel: 1,
    skillNumberMultiplier: 0.5,
    keywordAdjustments: {
      'identify': 1,
      'count': 2,
      'compare': 3,
      'solve': 4,
      'understand': 2,
      'recognize': 1,
      'demonstrate': 3
    }
  },
  'K': {
    grade: 'K',
    baseLevel: 3,
    skillNumberMultiplier: 0.7,
    keywordAdjustments: {
      'identify': 1,
      'count': 2,
      'add': 3,
      'subtract': 4,
      'solve': 4,
      'understand': 3,
      'analyze': 5,
      'create': 4
    }
  }
};

// Time Estimation Rules
export interface TimeRule {
  grade: string;
  baseMinutes: number;
  difficultyMultiplier: number;
  subjectAdjustments: Record<string, number>;
}

export const TIME_ESTIMATION_RULES: Record<string, TimeRule> = {
  'Pre-K': {
    grade: 'Pre-K',
    baseMinutes: 10,
    difficultyMultiplier: 3,
    subjectAdjustments: {
      'Math': 1.0,
      'ELA': 1.2,
      'Science': 1.1,
      'SocialStudies': 0.9
    }
  },
  'K': {
    grade: 'K',
    baseMinutes: 15,
    difficultyMultiplier: 4,
    subjectAdjustments: {
      'Math': 1.0,
      'ELA': 1.3,
      'Science': 1.2,
      'SocialStudies': 1.0
    }
  }
};

// Validation Rules
export interface ValidationRule {
  field: keyof ProcessedSkillData;
  required: boolean;
  validator: (value: any) => boolean;
  errorMessage: string;
}

export const VALIDATION_RULES: ValidationRule[] = [
  {
    field: 'subject',
    required: true,
    validator: (value) => ['Math', 'ELA', 'Science', 'SocialStudies'].includes(value),
    errorMessage: 'Subject must be one of: Math, ELA, Science, SocialStudies'
  },
  {
    field: 'grade',
    required: true,
    validator: (value) => ['Pre-K', 'K'].includes(value),
    errorMessage: 'Grade must be Pre-K or K'
  },
  {
    field: 'skill_name',
    required: true,
    validator: (value) => typeof value === 'string' && value.trim().length > 0,
    errorMessage: 'Skill name is required and cannot be empty'
  },
  {
    field: 'skills_area',
    required: true,
    validator: (value) => typeof value === 'string' && value.trim().length > 0,
    errorMessage: 'Skills area is required and cannot be empty'
  },
  {
    field: 'skill_number',
    required: true,
    validator: (value) => typeof value === 'string' && value.trim().length > 0,
    errorMessage: 'Skill number is required and cannot be empty'
  },
  {
    field: 'difficulty_level',
    required: true,
    validator: (value) => Number.isInteger(value) && value >= 1 && value <= 10,
    errorMessage: 'Difficulty level must be an integer between 1 and 10'
  },
  {
    field: 'estimated_time_minutes',
    required: true,
    validator: (value) => Number.isInteger(value) && value > 0,
    errorMessage: 'Estimated time must be a positive integer'
  }
];

// Import Progress Callback
export type ProgressCallback = (progress: {
  stage: string;
  current: number;
  total: number;
  message: string;
}) => void;

// Logger Interface
export interface ImportLogger {
  error: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  debug: (message: string, data?: any) => void;
  progress: (message: string) => void;
}

// Final Import Report
export interface ImportReport {
  success: boolean;
  stats: ImportStats;
  tabResults: TabImportResult[];
  errors: ImportError[];
  summary: {
    message: string;
    recommendations: string[];
  };
}