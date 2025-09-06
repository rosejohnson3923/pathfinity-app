/**
 * CONTENT STRUCTURE DEFINITIONS
 * 
 * Defines the structure and schemas for all content types
 * used throughout the application
 */

import { Question } from './QuestionTypes';

// ================================================================
// LEARNING CONTENT STRUCTURES
// ================================================================

export interface LearningContent {
  id: string;
  type: 'lesson' | 'practice' | 'assessment' | 'review';
  title: string;
  description: string;
  objectives: LearningObjective[];
  sections: ContentSection[];
  questions: Question[];
  estimatedTime: number; // in minutes
  metadata: ContentMetadata;
}

export interface LearningObjective {
  id: string;
  description: string;
  bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  measurable: boolean;
  assessmentCriteria?: string;
}

export interface ContentSection {
  id: string;
  type: 'introduction' | 'explanation' | 'example' | 'activity' | 'summary';
  title: string;
  content: string;
  media?: MediaContent[];
  interactiveElements?: InteractiveElement[];
  order: number;
}

export interface MediaContent {
  id: string;
  type: 'image' | 'video' | 'audio' | 'animation' | 'diagram';
  url: string;
  alt?: string;
  caption?: string;
  duration?: number; // for video/audio in seconds
  thumbnailUrl?: string;
}

export interface InteractiveElement {
  id: string;
  type: 'simulation' | 'drag-drop' | 'clickable-area' | 'slider' | 'calculator';
  config: any; // Type-specific configuration
  instructions: string;
}

export interface ContentMetadata {
  author?: string;
  createdAt: number;
  updatedAt?: number;
  version: string;
  tags: string[];
  subject: string;
  grade: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  accessibility?: AccessibilityFeatures;
}

export interface AccessibilityFeatures {
  hasAudioDescription: boolean;
  hasClosedCaptions: boolean;
  hasTranscript: boolean;
  hasSignLanguage: boolean;
  readingLevel?: string;
  altTextComplete: boolean;
}

// ================================================================
// CONTAINER-SPECIFIC STRUCTURES
// ================================================================

// Learn Container Structure
export interface LearnContainerContent {
  introduction: IntroductionPhase;
  instruction: InstructionPhase;
  practice: PracticePhase;
  assessment: AssessmentPhase;
  summary: SummaryPhase;
}

export interface IntroductionPhase {
  hook: string;
  objectives: string[];
  priorKnowledge?: string[];
  duration: number;
}

export interface InstructionPhase {
  concepts: Concept[];
  examples: Example[];
  demonstrations?: Demonstration[];
  duration: number;
}

export interface Concept {
  id: string;
  name: string;
  definition: string;
  explanation: string;
  visualAid?: MediaContent;
  relatedConcepts?: string[];
}

export interface Example {
  id: string;
  title: string;
  problem: string;
  solution: string;
  steps?: string[];
  explanation: string;
}

export interface Demonstration {
  id: string;
  title: string;
  type: 'video' | 'animation' | 'step-by-step';
  content: MediaContent | string[];
  narration?: string;
}

export interface PracticePhase {
  questions: Question[];
  scaffolding: 'high' | 'medium' | 'low';
  feedback: 'immediate' | 'delayed' | 'end-of-practice';
  allowRetry: boolean;
  duration: number;
}

export interface AssessmentPhase {
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
  allowReview: boolean;
  showResults: 'immediate' | 'after-submission' | 'never';
}

export interface SummaryPhase {
  keyTakeaways: string[];
  nextSteps?: string[];
  additionalResources?: Resource[];
  reflection?: string[];
}

// Experience Container Structure
export interface ExperienceContainerContent {
  scenario: Scenario;
  challenges: Challenge[];
  tools: ProfessionalTool[];
  reflection: ReflectionActivity;
}

export interface Scenario {
  id: string;
  title: string;
  context: string;
  role: string;
  goal: string;
  constraints?: string[];
  background?: string;
  stakeholders?: Stakeholder[];
}

export interface Stakeholder {
  name: string;
  role: string;
  expectations: string;
}

export interface Challenge {
  id: string;
  type: 'problem-solving' | 'decision-making' | 'creative' | 'analytical';
  description: string;
  context: string;
  question: Question;
  realWorldConnection: string;
  hints?: string[];
  expertSolution?: string;
}

export interface ProfessionalTool {
  id: string;
  name: string;
  category: string;
  description: string;
  useCase: string;
  tutorial?: MediaContent;
  practiceActivity?: InteractiveElement;
}

export interface ReflectionActivity {
  prompts: string[];
  selfAssessment?: SelfAssessmentItem[];
  peerReview?: boolean;
  journalEntry?: boolean;
}

export interface SelfAssessmentItem {
  criterion: string;
  scale: 'numeric' | 'descriptive';
  options: string[] | number[];
}

// Discover Container Structure
export interface DiscoverContainerContent {
  explorationTopic: ExplorationTopic;
  discoveryPaths: DiscoveryPath[];
  resources: Resource[];
  portfolio: PortfolioActivity;
}

export interface ExplorationTopic {
  id: string;
  title: string;
  bigIdea: string;
  essentialQuestions: string[];
  connections: ConnectionPoint[];
}

export interface ConnectionPoint {
  field: string;
  description: string;
  example?: string;
}

export interface DiscoveryPath {
  id: string;
  name: string;
  type: 'guided' | 'semi-guided' | 'independent';
  description: string;
  activities: DiscoveryActivity[];
  milestones: Milestone[];
}

export interface DiscoveryActivity {
  id: string;
  type: 'research' | 'experiment' | 'create' | 'analyze' | 'explore';
  title: string;
  instructions: string;
  resources?: Resource[];
  deliverable?: string;
  rubric?: RubricItem[];
}

export interface Milestone {
  id: string;
  title: string;
  criteria: string[];
  reward?: Reward;
}

export interface Reward {
  type: 'badge' | 'points' | 'unlock' | 'certificate';
  value: any;
  description: string;
}

export interface Resource {
  id: string;
  type: 'article' | 'video' | 'website' | 'book' | 'tool' | 'dataset';
  title: string;
  url?: string;
  description: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number;
  tags?: string[];
}

export interface PortfolioActivity {
  instructions: string;
  artifacts: PortfolioArtifact[];
  showcase: boolean;
  reflection: string[];
}

export interface PortfolioArtifact {
  id: string;
  type: 'document' | 'presentation' | 'code' | 'media' | 'other';
  title: string;
  description: string;
  criteria: RubricItem[];
}

export interface RubricItem {
  criterion: string;
  weight: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  score: number;
  description: string;
}

// ================================================================
// GAMIFICATION STRUCTURES
// ================================================================

export interface GamificationElements {
  points: PointSystem;
  badges: Badge[];
  levels: Level[];
  leaderboard?: LeaderboardConfig;
  achievements: Achievement[];
}

export interface PointSystem {
  currency: string; // e.g., "XP", "Stars", "Coins"
  actions: PointAction[];
  multipliers?: Multiplier[];
}

export interface PointAction {
  action: string;
  points: number;
  limit?: number; // max times per day
}

export interface Multiplier {
  condition: string;
  factor: number;
  duration?: number; // in minutes
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string[];
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface Level {
  number: number;
  name: string;
  minPoints: number;
  rewards?: Reward[];
  unlocks?: string[]; // Feature or content IDs
}

export interface LeaderboardConfig {
  scope: 'class' | 'grade' | 'school' | 'global';
  resetPeriod: 'daily' | 'weekly' | 'monthly' | 'never';
  displayCount: number;
  anonymize: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'progress' | 'mastery' | 'streak' | 'exploration' | 'collaboration';
  target: number;
  reward?: Reward;
}

// ================================================================
// CAREER INTEGRATION STRUCTURES
// ================================================================

export interface CareerContent {
  career: Career;
  skills: CareerSkill[];
  dayInLife?: DayInLife;
  tools: string[];
  projects: CareerProject[];
}

export interface Career {
  id: string;
  name: string;
  category: string;
  description: string;
  educationRequired: string[];
  averageSalary?: string;
  jobOutlook?: string;
  workEnvironment?: string[];
}

export interface CareerSkill {
  name: string;
  importance: 'essential' | 'important' | 'helpful';
  description: string;
  howUsed: string;
}

export interface DayInLife {
  morning?: string;
  afternoon?: string;
  challenges?: string[];
  rewards?: string[];
  quote?: string;
}

export interface CareerProject {
  id: string;
  title: string;
  description: string;
  duration: string;
  skills: string[];
  outcome: string;
}

// ================================================================
// COMPANION STRUCTURES
// ================================================================

export interface CompanionContent {
  character: CompanionCharacter;
  dialogue: DialogueSet;
  reactions: ReactionSet;
  personalityTraits: PersonalityTrait[];
}

export interface CompanionCharacter {
  id: string;
  name: string;
  avatar: string;
  voice?: string;
  backstory?: string;
  expertise?: string[];
}

export interface DialogueSet {
  greetings: string[];
  encouragement: string[];
  hints: string[];
  corrections: string[];
  celebrations: string[];
  farewells: string[];
}

export interface ReactionSet {
  success: CompanionReaction[];
  struggle: CompanionReaction[];
  timeout: CompanionReaction[];
  achievement: CompanionReaction[];
}

export interface CompanionReaction {
  trigger: string;
  emotion: string;
  message: string;
  animation?: string;
}

export interface PersonalityTrait {
  trait: string;
  strength: number; // 0-100
  expressions: string[];
}

// ================================================================
// EXPORT HELPERS
// ================================================================

export function createDefaultLearningContent(): LearningContent {
  return {
    id: `content_${Date.now()}`,
    type: 'lesson',
    title: '',
    description: '',
    objectives: [],
    sections: [],
    questions: [],
    estimatedTime: 0,
    metadata: {
      createdAt: Date.now(),
      version: '1.0.0',
      tags: [],
      subject: '',
      grade: '',
      difficulty: 'medium',
      language: 'en'
    }
  };
}

export function createDefaultLearnContainer(): LearnContainerContent {
  return {
    introduction: {
      hook: '',
      objectives: [],
      duration: 2
    },
    instruction: {
      concepts: [],
      examples: [],
      duration: 10
    },
    practice: {
      questions: [],
      scaffolding: 'medium',
      feedback: 'immediate',
      allowRetry: true,
      duration: 10
    },
    assessment: {
      questions: [],
      passingScore: 70,
      allowReview: true,
      showResults: 'after-submission'
    },
    summary: {
      keyTakeaways: []
    }
  };
}

export default {
  LearningContent,
  LearnContainerContent,
  ExperienceContainerContent,
  DiscoverContainerContent,
  GamificationElements,
  CareerContent,
  CompanionContent,
  createDefaultLearningContent,
  createDefaultLearnContainer
};