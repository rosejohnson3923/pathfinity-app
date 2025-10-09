/**
 * Rubric Types
 *
 * Defines the rubric structures that separate story from data.
 * Story Rubric = narrative context
 * Data Rubric = structure + prompts for JIT generation
 */

import type {
  Subject,
  ContainerType,
  CompanionId,
  NarrativeArc,
  CompanionVoice,
  CareerNarrative,
  SubjectNarrative,
  ContainerTransitions
} from './MasterNarrativeTypes';

/**
 * Story Rubric
 * Extracted from Master Narrative, provides story context to all JIT calls
 */
export interface StoryRubric {
  sessionId: string;
  sourceFile: string;  // Path to master-narrative.json

  storyContext: {
    narrativeArc: NarrativeArc;
    companionVoice: CompanionVoice;
    careerNarrative: CareerNarrative;
    subjectNarratives: Record<Subject, SubjectNarrative>;
    containerTransitions: ContainerTransitions;
  };

  usage: string;
}

/**
 * Data Rubric
 * Defines what data JIT must generate and how to generate it
 */
export interface DataRubric {
  // Identification
  sessionId: string;
  container: ContainerType;
  subject: Subject;
  skill: SkillReference;

  // Story context for this container/subject
  storyContext: StoryContext;

  // Data structure requirements
  dataRequirements: DataRequirements;

  // JIT prompt for generation
  jitPrompt: JITPrompt;

  // Adaptation data (null for LEARN, populated for EXPERIENCE/DISCOVER)
  adaptationData: AdaptationData | null;

  // Generated content (null until JIT generates)
  generatedContent: any | null;

  // Completion metadata
  completedAt: string | null;
  performance: PerformanceData | null;
}

/**
 * Skill Reference
 * Points to the skill being taught/practiced
 */
export interface SkillReference {
  id: string;              // "K.Math.A.1"
  name: string;            // "Count to 3"
  subject: Subject;
  skillNumber: string;     // "A.1"
  description: string;     // "Count objects up to 3"
  gradeLevel: string;      // "K"
}

/**
 * Story Context
 * The narrative framing for this specific container/subject
 */
export interface StoryContext {
  narrativeSetup: string;      // How this container begins in the story
  careerContext: string;       // How this subject appears in the career
  workplaceSetting: string;    // Where this takes place
  companionVoice: string;      // How companion speaks in this context
}

/**
 * Data Requirements
 * Union type for different container requirements
 */
export type DataRequirements =
  | LEARNDataRequirements
  | EXPERIENCEDataRequirements
  | DISCOVERDataRequirements;

/**
 * LEARN Container Data Requirements
 */
export interface LEARNDataRequirements {
  containerType: 'LEARN';

  video: {
    required: boolean;
    structure: VideoStructure;
  };

  practice: {
    count: number;  // 3 questions
    structure: QuestionStructure;
  };

  assessment: {
    count: number;  // 1 question
    structure: QuestionStructure;
  };
}

/**
 * EXPERIENCE Container Data Requirements
 */
export interface EXPERIENCEDataRequirements {
  containerType: 'EXPERIENCE';

  scenarios: {
    examples: {
      count: number;  // 3 scenarios
      structure: ScenarioStructure;
    };
    practice: {
      count: number;  // 2 scenarios
      structure: ScenarioStructure;
    };
    assessment: {
      count: number;  // 1 scenario
      structure: ScenarioStructure;
    };
  };
}

/**
 * DISCOVER Container Data Requirements
 */
export interface DISCOVERDataRequirements {
  containerType: 'DISCOVER';

  unifiedScenario: {
    required: boolean;
    structure: UnifiedScenarioStructure;
  };

  discoveryStations: {
    count: number;  // 4 stations (one per subject)
    structure: DiscoveryStationStructure;
  };
}

/**
 * Video Structure (for LEARN)
 */
export interface VideoStructure {
  title: 'string';
  videoUrl: 'string | null';
  videoId: 'string | null';
  duration: 'number';
  thumbnailUrl: 'string';
  channelTitle: 'string';
  fallbackMessage: 'string';
}

/**
 * Question Structure (for LEARN practice/assessment)
 */
export interface QuestionStructure {
  type: "'counting' | 'multiple_choice' | 'true_false' | 'fill_blank'";
  question: 'string';
  visual: 'string (emoji or description)';
  options: 'string[] (if multiple_choice)';
  correct_answer: 'number | string';
  hint: 'string';
  explanation: 'string';
  practiceSupport?: 'PracticeSupportStructure (only for practice, not assessment)';
}

/**
 * Scenario Structure (for EXPERIENCE)
 */
export interface ScenarioStructure {
  scenarioType: "'example' | 'practice' | 'assessment'";
  title: 'string';
  narrativeSetup: 'string';
  situation: 'string';
  decision: 'string';
  options: 'string[] (4 options)';
  correct_answer: 'number (index)';
  explanation: 'string';
  consequences: {
    chosen: 'string';
    alternative: 'string';
  };
  practiceSupport?: 'PracticeSupportStructure (not for assessment)';
}

/**
 * Unified Scenario Structure (for DISCOVER)
 */
export interface UnifiedScenarioStructure {
  title: 'string';
  narrativeSetup: 'string';
  challenge: 'string';
  careerConnection: 'string';
}

/**
 * Discovery Station Structure (for DISCOVER)
 */
export interface DiscoveryStationStructure {
  subject: 'Subject';
  stationTitle: 'string';
  question: 'string';
  options: 'string[]';
  correct_answer: 'number';
  explanation: 'string';
  hint: 'string';
  activity: {
    type: 'string';
    description: 'string';
    prompt: 'string';
    supportingData: 'string';
  };
}

/**
 * JIT Prompt
 * The prompt template for AI generation
 */
export interface JITPrompt {
  systemPrompt: string;
  userPrompt: string;
  variables: Record<string, any>;
}

/**
 * Adaptation Data
 * Performance-based context for next container
 */
export interface AdaptationData {
  performanceFromPreviousContainer: {
    source: string;            // "LEARN-Math"
    completedAt: string;
    struggled: boolean;
    score: number;
    attempts: number;
    timeSpent: number;
  } | null;

  adaptationRules: AdaptationRules | null;
  lastUpdated: string | null;
}

/**
 * Adaptation Rules
 * How to adjust content based on performance
 */
export interface AdaptationRules {
  // LEARN → EXPERIENCE
  scenarioComplexity?: 'simplified' | 'standard' | 'advanced';
  supportLevel?: 'high-guidance' | 'moderate-guidance' | 'minimal-guidance';
  skillApplicationFocus?: 'reinforcement' | 'application' | 'creative-application';
  hintAvailability?: 'always-available' | 'on-demand' | 'minimal';
  encouragementFrequency?: 'frequent' | 'standard' | 'minimal';

  // EXPERIENCE → DISCOVER
  activityComplexity?: 'basic-practice' | 'standard' | 'creative-challenge';
  hintLevel?: 'detailed-guidance' | 'moderate-guidance' | 'minimal-guidance';
  stationConnection?: 'direct-skill-application' | 'scaffolded-discovery' | 'surprising-applications';
  explorationDepth?: 'surface-level' | 'moderate' | 'deep-exploration';
}

/**
 * Performance Data
 * Captured when container completes
 */
export interface PerformanceData {
  score: number;              // 0-100
  attempts: number;           // Number of attempts
  timeSpent: number;          // Seconds
  struggledQuestions: string[]; // IDs of questions where user struggled
  completedAt: string;        // ISO timestamp
}

/**
 * Validation Result
 * Returned by StoryConsistencyValidator
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
