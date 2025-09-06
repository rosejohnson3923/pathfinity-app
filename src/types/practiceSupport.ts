/**
 * Practice Phase Support System Types
 * Comprehensive AI Companion support for practice questions
 */

// ============================================================================
// CORE INTERFACES
// ============================================================================

export interface PracticeQuestionSupport {
  questionId: number;
  question: string;
  type: string;
  companionSupport: CompanionSupport;
  teachingMoments: TeachingMoments;
  masteryIndicators: MasteryIndicators;
}

export interface CompanionSupport {
  preQuestion: PreQuestionSupport;
  hints: HintLevel[];
  feedback: FeedbackTypes;
  duringQuestion: DuringQuestionSupport;
  postQuestion: PostQuestionSupport;
}

export interface PreQuestionSupport {
  contextSetup: string;           // Explain how career uses this skill
  connectionToLearn: string;      // Reference what was just learned
  confidenceBuilder: string;      // Encouraging message
  readQuestion: boolean;          // Should read question aloud
  visualHighlight?: string;       // What to highlight visually
}

export interface HintLevel {
  level: 1 | 2 | 3;
  trigger: HintTrigger;
  hint: string;
  visualCue?: string;
  example?: string;
  scaffolding?: string[];
}

export interface HintTrigger {
  type: 'time' | 'attempts' | 'request';
  value: number;  // seconds for time, count for attempts
  condition?: string;
}

export interface DuringQuestionSupport {
  monitoringInterval: number;     // How often to check (seconds)
  encouragementTriggers: {
    afterSeconds: number;
    message: string;
  }[];
  visualSupport: {
    highlightKey: boolean;
    showCareerContext: boolean;
    animateHints: boolean;
  };
}

export interface FeedbackTypes {
  correct: CorrectFeedback;
  incorrect: IncorrectFeedback;
  partial?: PartialFeedback;
}

export interface CorrectFeedback {
  immediate: string;              // Celebration message
  explanation: string;            // Why it's correct
  careerConnection: string;       // How career uses this
  skillReinforcement: string;     // What skill demonstrated
  masteryMessage?: string;        // If showing mastery
}

export interface IncorrectFeedback {
  immediate: string;              // Encouragement
  explanation: string;            // Correct approach
  reteach: string;               // Different explanation
  tryAgainPrompt?: string;       // Specific guidance
  showCorrectAnswer: boolean;    // After max attempts
}

export interface PartialFeedback {
  message: string;
  whatWasRight: string;
  whatToImprove: string;
  hint: string;
}

export interface PostQuestionSupport {
  transitionMessage: string;      // Between questions
  skillSummary: string;          // What was learned
  nextQuestionPrep?: string;      // Prepare for next
  celebrateMilestone?: string;    // If milestone reached
}

export interface TeachingMoments {
  conceptExplanation: string;
  visualAids?: VisualAid[];
  memoryHooks?: string[];
  commonMistakes?: string[];
  realWorldExample: string;
}

export interface VisualAid {
  type: 'diagram' | 'animation' | 'example' | 'comparison';
  content: string;
  description: string;
}

export interface MasteryIndicators {
  quickCorrect: boolean;         // Answered quickly and correctly
  usedHintSucceeded: boolean;    // Used hints effectively
  multipleAttempts: number;      // How many tries
  timeToAnswer: number;          // Seconds taken
  confidenceLevel: 'low' | 'medium' | 'high';
}

// ============================================================================
// STRUGGLE DETECTION
// ============================================================================

export interface StruggleIndicators {
  questionId: number;
  timeOnQuestion: number;         // Seconds
  attemptCount: number;
  hintsUsed: number;
  hintsRequested: boolean;
  backtracking: boolean;          // Changed answer multiple times
  pauseDuration: number;          // Longest pause
}

export interface AdaptiveHelp {
  currentLevel: 'none' | 'minimal' | 'moderate' | 'maximum';
  triggeredBy: string[];
  actionsToken: AdaptiveAction[];
}

export interface AdaptiveAction {
  type: 'hint' | 'reteach' | 'example' | 'scaffold' | 'encourage';
  content: string;
  timing: 'immediate' | 'delayed';
  priority: 'low' | 'medium' | 'high';
}

// ============================================================================
// MASTERY TRACKING
// ============================================================================

export interface MasteryProfile {
  studentId: string;
  skillId: string;
  questionType: string;
  attempts: MasteryAttempt[];
  currentLevel: MasteryLevel;
  trends: MasteryTrends;
}

export interface MasteryAttempt {
  timestamp: Date;
  questionId: number;
  success: boolean;
  timeToAnswer: number;
  hintsUsed: number;
  attemptCount: number;
  struggledWith?: string[];
}

export interface MasteryLevel {
  level: 'struggling' | 'developing' | 'proficient' | 'mastering';
  confidence: number;  // 0-100
  consistency: number; // 0-100
  speed: 'slow' | 'moderate' | 'fast';
}

export interface MasteryTrends {
  improving: boolean;
  struggledAreas: string[];
  strongAreas: string[];
  recommendedFocus: string[];
}

// ============================================================================
// GRADE-SPECIFIC CONFIGURATIONS
// ============================================================================

export interface GradeConfiguration {
  grade: string;
  autoReadQuestions: boolean;
  hintTiming: number[];           // Seconds for each hint level
  maxAttempts: number;
  visualSupport: 'maximum' | 'moderate' | 'minimal';
  vocabularyLevel: 'simple' | 'intermediate' | 'advanced';
  encouragementStyle: 'enthusiastic' | 'supportive' | 'professional';
}

export const GRADE_CONFIGS: Record<string, GradeConfiguration> = {
  'K-2': {
    grade: 'K-2',
    autoReadQuestions: true,
    hintTiming: [10, 20, 30],
    maxAttempts: 3,
    visualSupport: 'maximum',
    vocabularyLevel: 'simple',
    encouragementStyle: 'enthusiastic'
  },
  '3-5': {
    grade: '3-5',
    autoReadQuestions: true,
    hintTiming: [15, 30, 45],
    maxAttempts: 3,
    visualSupport: 'moderate',
    vocabularyLevel: 'intermediate',
    encouragementStyle: 'supportive'
  },
  '6-8': {
    grade: '6-8',
    autoReadQuestions: false,
    hintTiming: [20, 40, 60],
    maxAttempts: 2,
    visualSupport: 'moderate',
    vocabularyLevel: 'intermediate',
    encouragementStyle: 'supportive'
  },
  '9-12': {
    grade: '9-12',
    autoReadQuestions: false,
    hintTiming: [30, 60, 90],
    maxAttempts: 2,
    visualSupport: 'minimal',
    vocabularyLevel: 'advanced',
    encouragementStyle: 'professional'
  }
};

// ============================================================================
// COMPANION SCRIPTS
// ============================================================================

export interface CompanionScripts {
  phaseIntro: Record<string, string>;
  navigationIntro: Record<string, string>;
  questionTransitions: Record<string, string[]>;
  encouragement: Record<string, string[]>;
  celebration: Record<string, string[]>;
  support: Record<string, string[]>;
}

export const COMPANION_PRACTICE_SCRIPTS: CompanionScripts = {
  phaseIntro: {
    'K-2': "Great job learning! Now let's practice together. I'll help you with each question!",
    '3-5': "Time to practice what we learned! Let's work through these questions together.",
    '6-8': "Let's apply what you've learned. I'm here if you need help.",
    '9-12': "Practice time. These questions will reinforce the concepts we covered."
  },
  
  navigationIntro: {
    'K-2': "After you answer, click the big green arrow to go to the next question!",
    '3-5': "Answer each question, then click Next. You can go back if you need to.",
    '6-8': "Navigate through the questions using the Next button.",
    '9-12': "Complete all practice questions at your own pace."
  },
  
  questionTransitions: [
    "Here's the first question!",
    "Great! On to question two.",
    "You're doing well! Question three.",
    "Almost there! Question four.",
    "Last one! You've got this!"
  ],
  
  encouragement: {
    'K-2': [
      "You're doing amazing!",
      "Keep going, superstar!",
      "I believe in you!",
      "You've got this!"
    ],
    '3-5': [
      "You're making great progress!",
      "Keep up the good work!",
      "You're learning so well!",
      "Nice thinking!"
    ],
    '6-8': [
      "Good progress!",
      "You're getting it!",
      "Keep working through it.",
      "Strong effort!"
    ],
    '9-12': [
      "Well done.",
      "Good analysis.",
      "Solid work.",
      "Keep it up."
    ]
  },
  
  celebration: {
    'K-2': [
      "AMAZING! You did it!",
      "WOW! Perfect!",
      "You're a STAR!",
      "Fantastic job!"
    ],
    '3-5': [
      "Excellent work!",
      "You nailed it!",
      "Great job!",
      "Perfect answer!"
    ],
    '6-8': [
      "Correct! Well done.",
      "Exactly right!",
      "Good job!",
      "Nice work!"
    ],
    '9-12': [
      "Correct.",
      "Well done.",
      "Good work.",
      "Accurate."
    ]
  },
  
  support: {
    'K-2': [
      "It's okay! Let's try again!",
      "Good try! Let me help you.",
      "No worries! Learning is fun!",
      "Let's figure this out together!"
    ],
    '3-5': [
      "Not quite, but good effort!",
      "Let's think about this differently.",
      "Close! Try again.",
      "Let me give you a hint."
    ],
    '6-8': [
      "Not quite right. Consider this...",
      "Think about it from this angle.",
      "Review the concept and try again.",
      "Let's break this down."
    ],
    '9-12': [
      "Incorrect. Review the concept.",
      "Consider another approach.",
      "Think through the problem again.",
      "Analyze what went wrong."
    ]
  }
};

// ============================================================================
// PRACTICE PHASE STATES
// ============================================================================

export interface PracticePhaseState {
  currentQuestion: number;
  totalQuestions: number;
  questionsAnswered: Record<number, boolean>;
  struggledQuestions: number[];
  masteredQuestions: number[];
  hintsUsedCount: Record<number, number>;
  timePerQuestion: Record<number, number>;
  attemptsPerQuestion: Record<number, number>;
  overallProgress: number;  // 0-100
  readyForAssessment: boolean;
}

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export function getGradeConfig(grade: string): GradeConfiguration {
  if (grade === 'K' || grade === '1' || grade === '2') {
    return GRADE_CONFIGS['K-2'];
  } else if (grade === '3' || grade === '4' || grade === '5') {
    return GRADE_CONFIGS['3-5'];
  } else if (grade === '6' || grade === '7' || grade === '8') {
    return GRADE_CONFIGS['6-8'];
  } else {
    return GRADE_CONFIGS['9-12'];
  }
}

export function getGradeBand(grade: string): string {
  const gradeNum = grade === 'K' ? 0 : parseInt(grade);
  if (gradeNum <= 2) return 'K-2';
  if (gradeNum <= 5) return '3-5';
  if (gradeNum <= 8) return '6-8';
  return '9-12';
}

export function shouldAutoRead(grade: string): boolean {
  const config = getGradeConfig(grade);
  return config.autoReadQuestions;
}

export function getHintTiming(grade: string): number[] {
  const config = getGradeConfig(grade);
  return config.hintTiming;
}