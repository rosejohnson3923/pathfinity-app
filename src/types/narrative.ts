/**
 * Narrative Types for the Narrative-First Architecture
 * These types define the structure of the Master Narrative that drives all content generation
 */

/**
 * Master Narrative - Generated once per student/career combination
 * This narrative provides cohesive context across all learning containers
 */
export interface MasterNarrative {
  narrativeId: string;
  character: CharacterProfile;
  journeyArc: JourneyArc;
  cohesiveStory: StoryElements;
  settingProgression: SettingMap;
  visualTheme: VisualTheme;
  subjectContextsAligned: SubjectContextMap;
  generatedAt: Date;
  generationCost: number;
}

/**
 * Character Profile - The student's persona in the narrative
 */
export interface CharacterProfile {
  name: string;                // Student's name
  role: string;                // e.g., "Junior Doctor Helper"
  workplace: string;           // e.g., "CareerInc Medical Center"
  personality: string;         // e.g., "caring, curious, helpful"
  equipment: string[];         // Career-specific tools
  gradeLevel: string;         // Student's grade
}

/**
 * Journey Arc - The progression through containers
 */
export interface JourneyArc {
  checkIn: string;            // Arrival at CareerInc Lobby
  learn: string;              // Virtual Academy phase
  experience: string;         // Virtual Workplace phase
  discover: string;           // Virtual Field Trip phase
}

/**
 * Story Elements - The cohesive narrative thread
 */
export interface StoryElements {
  focus: string;              // Main focus area for this career
  patients?: string;          // For medical careers
  customers?: string;         // For service careers
  projects?: string;          // For technical careers
  mission: string;            // What the student will accomplish
  throughLine: string;        // Connecting narrative thread
}

/**
 * Setting Map - Locations for each container
 */
export interface SettingMap {
  learn: SettingDetails;
  experience: SettingDetails;
  discover: SettingDetails;
}

export interface SettingDetails {
  location: string;           // Physical location in the narrative
  context: string;            // What happens here
  narrative: string;          // The story at this location
}

/**
 * Visual Theme - Consistent visual elements
 */
export interface VisualTheme {
  colors: string;             // Primary and secondary colors
  setting: string;            // Visual environment description
  props: string;              // Key visual elements
}

/**
 * Subject Context Map - How each subject relates to the career
 */
export interface SubjectContextMap {
  math: SubjectContext;
  ela: SubjectContext;
  science: SubjectContext;
  socialStudies: SubjectContext;
}

export interface SubjectContext {
  learn: string;              // How this subject is learned in context
  experience: string;         // How it's applied in the workplace
  discover: string;           // How it's seen in the community
}

/**
 * Parameters for generating a Master Narrative
 */
export interface MasterNarrativeParams {
  studentName: string;
  gradeLevel: string;
  career: string;
  subjects: string[];
}

/**
 * Learn Content generated from the Master Narrative
 */
export interface LearnContent {
  narrative: MasterNarrative;
  video?: EducationalVideo;
  practiceQuestions: NarrativeQuestion[];
  assessmentQuestion: NarrativeQuestion;
}

/**
 * Educational Video from YouTube
 */
export interface EducationalVideo {
  id: string;
  title: string;
  duration: number;           // In seconds
  channelTitle: string;
  thumbnail: string;
  score?: number;             // Quality score
}

/**
 * Question enhanced with narrative context
 */
export interface NarrativeQuestion {
  id?: string;
  type: 'multiple_choice' | 'true_false';  // Only valid types for K
  question: string;
  visual?: string;            // Career-themed visual context
  options?: string[];         // For multiple choice
  correct_answer: number | boolean;
  hint?: string;
  explanation?: string;
  characterMessage?: string;  // Message from the character
  narrativeContext?: string;  // How this relates to the career
  success_message?: string;   // For assessment questions
}

/**
 * Container types
 */
export type ContainerType = 'learn' | 'experience' | 'discover';

/**
 * Modal types within Learn container
 */
export type LearnModalType = 'instructional' | 'practice' | 'assessment' | 'loading';

/**
 * Practice Results
 */
export interface PracticeResults {
  answers: Answer[];
  totalCorrect: number;
  totalQuestions: number;
  completedAt: number;
}

/**
 * Assessment Results
 */
export interface AssessmentResults {
  questionId?: string;
  answer: any;
  isCorrect: boolean;
  skill: string;
  timestamp: number;
  narrative?: MasterNarrative;
}

/**
 * Individual Answer
 */
export interface Answer {
  questionId?: string;
  answer: any;
  isCorrect: boolean;
  timestamp: number;
}