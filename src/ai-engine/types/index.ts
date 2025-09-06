/**
 * Type Definitions for Content Pipeline
 * Central type repository for all pipeline components
 */

// ============ Modal Types ============
export enum ModalTypeEnum {
  // Assessment Modals
  FILL_BLANK = 'FillBlankModal',
  SINGLE_SELECT = 'SingleSelectModal',
  MULTI_SELECT = 'MultiSelectModal',
  DRAG_DROP = 'DragDropModal',
  SEQUENCE = 'SequenceModal',
  TRUE_FALSE = 'BinaryModal',
  MATCHING = 'MatchingModal',
  SHORT_ANSWER = 'ShortAnswerModal',
  ESSAY = 'EssayModal',
  DRAWING = 'DrawingModal',
  
  // Interactive Modals
  CODE_EDITOR = 'CodeEditorModal',
  MATH_INPUT = 'MathInputModal',
  GRAPH_CHART = 'GraphModal',
  TIMELINE = 'TimelineModal',
  HOTSPOT = 'HotspotModal',
  SLIDER = 'SliderModal',
  MATRIX = 'MatrixModal',
  SCENARIO = 'ScenarioModal',
  SIMULATION = 'SimulationModal',
  VOICE = 'VoiceModal',
  
  // Collaborative Modals
  PEER_REVIEW = 'PeerReviewModal',
  DISCUSSION = 'DiscussionModal',
  COLLAB_DOC = 'CollabDocModal',
  POLL = 'PollModal',
  BRAINSTORM = 'BrainstormModal',
  
  // Wellbeing Modals
  MOOD_CHECK = 'MoodCheckModal',
  JOURNAL = 'JournalModal',
  REFLECTION = 'ReflectionModal',
  GOAL_SETTING = 'GoalSettingModal',
  CELEBRATION = 'CelebrationModal',
  MINDFULNESS = 'MindfulnessModal',
  
  // Navigation Modals
  ONBOARDING = 'OnboardingModal',
  TUTORIAL = 'TutorialModal',
  ROADMAP = 'RoadmapModal',
  
  // Research/Content Creation
  CITATION = 'CitationModal',
  PROJECT = 'ProjectModal',
  
  // System Modals
  WIZARD = 'WizardModal',
  ALERT = 'AlertModal',
  HELP = 'HelpModal'
}

// ============ Content Types ============
export enum ContentTypeEnum {
  // Assessment Types
  FILL_BLANK = 'fill_blank',
  SINGLE_SELECT = 'single_select',
  MULTIPLE_SELECT = 'multiple_select',
  DRAG_DROP = 'drag_drop',
  SEQUENCE = 'sequence',
  TRUE_FALSE = 'true_false',
  MATCHING = 'matching',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  DRAWING = 'drawing',
  
  // Interactive Types
  CODE_EDITOR = 'code_editor',
  MATH_INPUT = 'math_input',
  GRAPH_CHART = 'graph_chart',
  TIMELINE = 'timeline',
  HOTSPOT = 'hotspot',
  SLIDER = 'slider',
  MATRIX = 'matrix',
  SCENARIO = 'scenario',
  SIMULATION = 'simulation',
  VOICE = 'voice',
  
  // Collaborative Types
  PEER_REVIEW = 'peer_review',
  DISCUSSION = 'discussion',
  COLLAB_DOC = 'collab_doc',
  POLL = 'poll',
  BRAINSTORM = 'brainstorm'
}

// ============ Container Types ============
export type ContainerType = 'LEARN' | 'EXPERIENCE' | 'DISCOVER';

// ============ Device Context ============
export interface DeviceContext {
  type: 'mobile' | 'tablet' | 'desktop';
  viewport: {
    width: number;
    height: number;
  };
  orientation: 'portrait' | 'landscape';
  touchEnabled: boolean;
  pixelRatio: number;
}

// ============ Student Profile ============
export interface StudentProfile {
  id: string;
  gradeLevel: string;
  readingLevel: number;
  preferences: {
    visualLearner: boolean;
    audioLearner: boolean;
    kinetheticLearner: boolean;
    darkMode: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
  accessibility?: {
    needsScreenReader: boolean;
    needsLargeText: boolean;
    needsHighContrast: boolean;
    needsReducedMotion: boolean;
    needsSimplified: boolean;
    needsDwellClick: boolean;
    prefersReducedMotion: boolean;
    visualAcuity: number;
  };
}

// ============ Content Request ============
export interface AIContentRequest {
  // Required fields
  contentType: ContentTypeEnum | string;
  studentId: string;
  sessionId: string;
  lessonId: string;
  
  // Context fields
  career: string;
  gradeLevel: string;
  subject: string;
  difficulty: number;
  
  // Optional fields
  container?: ContainerType;
  deviceContext?: DeviceContext;
  studentProfile?: StudentProfile;
  agentId?: string;
  concepts?: string[];
  pointValue?: number;
  partialCredit?: boolean;
  rubric?: any;
  suggestedModalType?: ModalTypeEnum;
}

// ============ Content Volume Metrics ============
export interface ContentVolumeMetrics {
  text: {
    totalCharacters: number;
    wordCount: number;
    paragraphs: number;
    readingTime: number;
    complexity: 'simple' | 'moderate' | 'complex';
  };
  elements: {
    totalItems: number;
    visibleItems: number;
    itemsPerPage?: number;
    interactionPoints: number;
  };
  media: {
    images: number;
    videos: number;
    audioClips: number;
    totalSizeMB: number;
    largestAssetMB: number;
  };
  complexity: {
    score: number;
    factors: string[];
    cognitiveLoad: 'low' | 'medium' | 'high';
  };
}

// ============ Dimensional Hints ============
export interface DimensionalHints {
  recommended: {
    width: number | string;
    height: number | string;
    aspectRatio?: string;
  };
  constraints: {
    minWidth: number;
    maxWidth: number | string;
    minHeight: number;
    maxHeight: number | string;
    maintainAspectRatio: boolean;
  };
  responsive: {
    breakpoints: ResponsiveBreakpoint[];
    mobileFullScreen: boolean;
    reflow: string;
  };
  overflow: {
    predicted: boolean;
    strategy: OverflowStrategy;
    threshold: any;
    fallback: OverflowStrategy;
  };
  contentFit: {
    optimal: boolean;
    adjustments: any[];
    warnings: string[];
  };
}

// ============ Responsive Breakpoint ============
export interface ResponsiveBreakpoint {
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  viewport: {
    minWidth: number;
    maxWidth?: number;
  };
  dimensions: {
    width: number | string;
    height: number | string;
    maxWidth?: number;
    maxHeight?: number | string;
  };
  adjustments: {
    padding: number;
    fontSize: number;
    spacing: number;
    layout?: string;
  };
}

// ============ Overflow Strategy ============
export type OverflowStrategy = 
  | 'none'
  | 'scroll'
  | 'paginate'
  | 'accordion'
  | 'tabs'
  | 'horizontal-scroll';

// ============ UI Compliance ============
export interface UICompliance {
  container: ContainerType;
  theme: {
    colorScheme?: any;
    gradients?: any;
    darkModeSupport: boolean;
    contrastCompliant: boolean;
  };
  typography: {
    baseSize: number;
    scale?: any;
    lineHeight: number;
    responsive: boolean;
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    containerSpecific?: any;
  };
  accessibility: {
    level: 'A' | 'AA' | 'AAA';
    touchOptimized: boolean;
    keyboardNavigable: boolean;
    screenReaderReady: boolean;
    focusManagement: boolean;
  };
}

// ============ AI Content Response V2 ============
export interface AIContentResponseV2 {
  // Core fields
  contentId: string;
  modalType: ModalTypeEnum;
  contentType: ContentTypeEnum | string;
  version: string;
  timestamp: string;
  
  // Optional error field
  error?: {
    code: string;
    message: string;
    fallback?: boolean;
  };
  
  // Content payload
  content: {
    data: any;
    metadata: any;
    validation: any;
    display: any;
    volume: ContentVolumeMetrics | any;
  };
  
  // Dimensional intelligence
  dimensions: DimensionalHints;
  
  // UI compliance
  uiCompliance: UICompliance;
  
  // Context
  context: {
    studentId: string;
    sessionId: string;
    lessonId: string;
    career: string;
    gradeLevel: string;
    subject: string;
    difficulty: number;
    generatedBy: string;
    device: DeviceContext;
  };
  
  // Evaluation
  evaluation: {
    scoringMethod: string;
    pointValue: number;
    partialCredit: boolean;
    rubric?: any;
    feedback?: any;
    estimatedTime: {
      minimum: number;
      optimal: number;
      maximum: number;
    };
  };
  
  // Performance
  performance: {
    preloadAssets: string[];
    estimatedLoadTime: number;
    cacheStrategy: 'aggressive' | 'normal' | 'none';
    rendering?: any;
  };
}

// ============ Legacy Support ============
export interface AIContentResponse extends AIContentResponseV2 {}

// ============ Standardized Content ============
export interface StandardizedContent {
  modalType: ModalTypeEnum;
  data: any;
  metadata?: any;
  display?: any;
}

// ============ Content Data ============
export interface ContentData {
  [key: string]: any;
}

// ============ Validation Error ============
export class ValidationError extends Error {
  public errors: any[];
  
  constructor(message: string, errors: any[]) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// ============ Scoring Methods ============
export enum ScoringMethodEnum {
  EXACT = 'exact',
  PARTIAL = 'partial',
  RUBRIC = 'rubric',
  MANUAL = 'manual',
  AUTOMATIC = 'automatic'
}

// ============ Grade Levels ============
export type GradeLevel = 'K-2' | '3-5' | '6-8' | '9-12';

// ============ Color Schemes ============
export interface ColorScheme {
  primary: string;
  secondary: string;
  accent?: string;
  background?: string;
  text?: string;
}

// ============ Gradient Definitions ============
export type GradientDefinition = string;

// ============ Typography Scale ============
export interface TypographyScale {
  sm: number;
  base: number;
  lg: number;
  xl: number;
  '2xl'?: number;
  '3xl'?: number;
}

// ============ Container Branding ============
export interface ContainerBranding {
  gradient: string;
  buttonPrimary?: string;
  buttonSecondary?: string;
  focus?: string;
}

// ============ Rubric ============
export interface Rubric {
  criteria: RubricCriteria[];
  totalPoints: number;
}

export interface RubricCriteria {
  name: string;
  description: string;
  points: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  score: number;
  description: string;
}

// ============ Feedback Configuration ============
export interface FeedbackConfiguration {
  immediate: boolean;
  detailed: boolean;
  hints: boolean;
  positive?: boolean;
  corrective?: boolean;
}

// ============ Display Configuration ============
export interface DisplayConfiguration {
  layout?: string;
  theme?: any;
  fontSize?: number;
  spacing?: number;
  animations?: boolean;
  [key: string]: any;
}

// ============ Validation Rules ============
export interface ValidationRules {
  required: boolean;
  validators?: any[];
  errorMessages?: { [key: string]: string };
  [key: string]: any;
}

// ============ Content Metadata ============
export interface ContentMetadata {
  generatedBy?: string;
  difficulty?: number;
  concepts?: string[];
  estimatedTime?: number;
  [key: string]: any;
}

// ============ Media Content ============
export interface MediaContent {
  url: string;
  type: 'image' | 'video' | 'audio';
  alt?: string;
  caption?: string;
  duration?: number;
  size?: number;
}

// ============ Size Adjustment ============
export interface SizeAdjustment {
  type: string;
  reason: string;
  value?: any;
}

// ============ Content Threshold ============
export interface ContentThreshold {
  vertical?: number;
  horizontal?: number;
  items?: number;
  itemsPerPage?: number;
  words?: number;
}

// ============ Reflow Strategy ============
export type ReflowStrategy = 'vertical' | 'horizontal' | 'tabs' | 'adaptive';

// ============ Accessibility Configuration ============
export interface AccessibilityConfig {
  ariaLabels?: { [key: string]: string };
  ariaDescriptions?: { [key: string]: string };
  altText?: { [key: string]: string };
  keyboardShortcuts?: { [key: string]: string };
  screenReaderInstructions?: string;
}

// ============ Localization Configuration ============
export interface LocalizationConfig {
  language: string;
  region?: string;
  dateFormat?: string;
  numberFormat?: string;
  currency?: string;
  translations?: { [key: string]: string };
}

// Export all types
// export * from './modal-types'; // TODO: Create this file if needed
// export * from './content-types'; // TODO: Create this file if needed
// export * from './response-types'; // TODO: Create this file if needed