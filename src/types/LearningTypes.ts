// ================================================================
// LEARNING TYPES FOR THREE-CONTAINER PROGRESSIVE MASTERY
// Detailed tracking across Learn → Experience → Discover
// ================================================================

// Base skill definition
export interface Skill {
  skill_number: string;   // e.g., "A.1"
  skill_name: string;     // e.g., "Count to 10"
  subject: string;        // e.g., "Math"
  gradeLevel: string;     // e.g., "Kindergarten"
  difficulty: number;     // 1-5 scale
}

// Detailed assessment results (replaces simple boolean)
export interface AssessmentResults {
  skill_number: string;
  subject: string;        // Subject area (Math, ELA, Science, etc.)
  completed: true;        // Always true - student must attempt
  correct: boolean;       // Whether they got it right
  score: number;          // 0-100 percentage
  attempts: number;       // Number of attempts made
  timeSpent: number;      // Milliseconds spent
  selectedAnswer?: string; // What they chose
  correctAnswer: string;  // What was correct
  struggledWith?: string[]; // Specific areas of difficulty
  timestamp: Date;
  context: 'learn' | 'experience' | 'discover'; // Which container
}

// Multi-subject assignment structure
export interface MultiSubjectAssignment {
  id: string;
  type: 'single-subject' | 'multi-subject';
  title: string;
  description: string;
  duration: string;       // e.g., "45 min"
  gradeLevel: string;
  
  skills: Skill[];        // Can be 1 or multiple skills
  careerContext?: string; // Optional career theme
  
  // Finn's daily plan metadata
  planId?: string;
  assignedDate?: Date;
  priority: 'required' | 'recommended' | 'enrichment';
}

// Progress through all three containers
export interface SkillMasteryJourney {
  skill_number: string;
  studentId: string;
  assignmentId: string;
  
  attempts: {
    learn?: AssessmentResults;
    experience?: AssessmentResults;
    discover?: AssessmentResults;
  };
  
  // Mastery analysis
  masteryAchieved: boolean;           // True if correct in ANY context
  firstCorrectContext?: 'learn' | 'experience' | 'discover';
  preferredContext?: 'abstract' | 'applied' | 'narrative';
  totalAttempts: number;
  finalScore: number;                 // Best score across contexts
}

// Daily time budget tracking (flexible 4-hour target system)
export interface DailyTimeBudget {
  studentId: string;
  date: string;  // YYYY-MM-DD format
  
  // 4-hour target budget (flexible upward for struggling students)
  baselineBudget: {
    targetMinutes: number;          // Target: 240 (4 hours) - not a hard limit
    usedMinutes: number;            // Actual time spent on baseline curriculum
    curriculumComplete: boolean;    // Has required curriculum been completed?
    overTargetMinutes: number;      // Time beyond 4-hour target (struggle indicator)
  };
  
  // Time spent across containers (baseline curriculum only)
  containerTime: {
    learn: number;                  // Minutes in Learn container
    experience: number;             // Minutes in Experience container
    discover: number;               // Minutes in Discover container
  };
  
  // Time spent by subject (baseline curriculum only)
  subjectTime: {
    [subject: string]: number;      // Minutes per subject
  };
  
  // Session tracking (baseline curriculum)
  sessions: LearningSession[];
  
  // Voluntary extension sessions (beyond completed curriculum)
  extensions: ExtensionSession[];
  
  // Daily completion analysis
  curriculumStatus: {
    completed: boolean;             // Has required curriculum been completed?
    completionTime: number;         // Total minutes to complete curriculum
    onTarget: boolean;              // Completed within 4-hour target?
    struggledSubjects: string[];    // Subjects that took longer than expected
    efficientSubjects: string[];    // Subjects completed faster than expected
  };
  
  // Total time including extensions
  totalTimeSpent: number;          // Baseline + voluntary extensions
  
  // Performance analytics
  performance: {
    efficiencyScore: number;        // How well baseline time was used (0-100)
    engagementScore: number;        // How engaged student was (0-100)
    paceScore: number;             // How close to 4-hour target (0-100, 100 = exactly 4h)
    struggledAreas: string[];       // Skills/subjects where student needed extra time
    strengthAreas: string[];        // Skills/subjects completed efficiently
  };
}

// Individual learning session within a day
export interface LearningSession {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;              // Minutes
  
  // What was accomplished
  container: 'learn' | 'experience' | 'discover';
  assignmentId: string;
  skillsCompleted: string[];
  
  // Performance metrics
  skillsAttempted: number;
  skillsMastered: number;
  averageScore: number;
  
  // Session quality indicators
  focusScore: number;           // How focused was the student (0-100)
  struggledAreas: string[];
  breakthroughMoments: string[];
}

// Extension session beyond 4-hour baseline
export interface ExtensionSession {
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;             // Minutes
  
  // What they chose to extend
  extensionType: 'career-depth' | 'subject-mastery' | 'creative-project' | 'collaborative';
  careerId?: string;            // If career-depth extension
  subjectFocus?: string;        // If subject-mastery extension
  
  // Voluntary engagement indicators
  studentInitiated: boolean;    // Did student ask to continue?
  parentEncouraged: boolean;    // Was parent involved in decision?
  teacherSuggested: boolean;    // Did teacher recommend extension?
  
  // Performance during extension
  engagementLevel: 'low' | 'medium' | 'high' | 'exceptional';
  masteryGained: number;        // Skills improved during extension
  creativityScore: number;      // For creative extensions
  
  // Exit reason
  exitReason: 'completed' | 'tired' | 'parent-called' | 'bored' | 'excited-for-tomorrow';
}

// Learning intelligence about student patterns
export interface StudentLearningProfile {
  studentId: string;
  lastUpdated: Date;
  
  // Overall learning patterns
  learningPatterns: {
    bestContext: 'abstract' | 'applied' | 'narrative';
    needsRealWorld: boolean;          // Better with career context
    needsStoryContext: boolean;       // Better with narrative
    abstractFirst: boolean;           // Traditional learners
    
    // Success rates by context
    learnSuccessRate: number;         // % correct on first try
    experienceBreakthroughRate: number; // % who get it in Experience
    discoverBreakthroughRate: number; // % who get it in Discover
  };
  
  // Subject-specific insights
  subjectPreferences: {
    [subject: string]: {
      preferredContext: 'abstract' | 'applied' | 'narrative';
      averageAttempts: number;
      strengthAreas: string[];
      challengeAreas: string[];
    };
  };
  
  // Time management patterns
  timeManagement: {
    optimalSessionLength: number;     // Minutes per session
    bestTimeOfDay: 'morning' | 'afternoon' | 'evening';
    attentionSpan: number;           // Average focus time in minutes
    breaksNeeded: boolean;           // Does student need regular breaks?
    averageDaily4HourCompletion: number; // % of days they complete 4-hour baseline
  };
  
  // Extension behavior patterns
  extensionBehavior: {
    likelyToExtend: boolean;         // Does student often continue past 4 hours?
    preferredExtensionType: 'career-depth' | 'subject-mastery' | 'creative-project' | 'collaborative';
    averageExtensionTime: number;    // Average minutes in extension sessions
    extensionSuccessRate: number;    // How often extensions are productive
  };
  
  // Skill-specific tracking
  skillHistory: {
    [skillCode: string]: SkillMasteryJourney;
  };
  
  // XP and points earned during journey
  xpData?: {
    totalXP: number;
    containerXP: {
      learn: number;
      experience: number;
      discover: number;
    };
    subjectXP: {
      [subject: string]: number;
    };
  };
}

// Results passed between containers
export interface ContainerHandoff {
  assignmentId: string;
  studentId: string;
  completedSkills: AssessmentResults[];
  
  // Skills that need reinforcement
  skillsNeedingMastery: Skill[];
  
  // Context for next container
  studentStrengths: string[];
  recommendedApproach: 'visual' | 'narrative' | 'hands-on' | 'traditional';
  timeSpent: number;
  
  // Career context from Experience Container
  selectedCareer?: {
    careerId: string;
    careerName: string;
    department: string;
  };
  
  // Metadata
  containerSource: 'learn' | 'experience';
  timestamp: Date;
}

// Career context for Experience container
export interface CareerScenario {
  careerId: string;
  careerName: string;
  department: string;
  gradeAppropriate: boolean;
  
  // Skills this career can reinforce
  applicableSkills: Skill[];
  
  // Scenario details
  scenario: {
    title: string;
    description: string;
    realWorldContext: string;
    tasks: CareerTask[];
  };
  
  // Difficulty adjustment
  adaptedForStudent: boolean;
  difficultyLevel: number;
}

export interface CareerTask {
  taskId: string;
  skillCode: string;
  description: string;
  context: string;           // How this skill applies in this career
  visualSupport?: string;    // Description of visual aids needed
  interactiveElements?: string[];
}

// Narrative context for Discover container
export interface NarrativeScenario {
  storyId: string;
  title: string;
  theme: string;
  gradeLevel: string;
  
  // Skills embedded in story
  embeddedSkills: Skill[];
  
  // Story structure
  narrative: {
    introduction: string;
    mainStory: string;
    climax: string;
    resolution: string;
  };
  
  // Interactive questions embedded in story
  storyQuestions: {
    skillCode: string;
    storyContext: string;     // How question fits in narrative
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    storyTransition: string;  // How story continues after answer
  }[];
}

// Daily learning plan from Finn
export interface DailyLearningPlan {
  planId: string;
  studentId: string;
  date: string;
  
  // Assigned work
  assignments: MultiSubjectAssignment[];
  
  // Learning objectives
  objectives: {
    primary: Skill[];        // Core skills for today
    secondary: Skill[];      // Bonus/enrichment
    review: Skill[];         // Skills to reinforce
  };
  
  // Completion tracking
  progress: {
    assigned: number;
    completed: number;
    mastered: number;
    needsReview: number;
  };
  
  // Adaptive elements
  suggestedCareerTheme?: string;
  recommendedFlow: 'traditional' | 'career-first' | 'story-based';
}

// Export helper functions
export const LearningUtils = {
  // Calculate if student achieved mastery in any context
  checkMastery: (journey: SkillMasteryJourney): boolean => {
    return Object.values(journey.attempts).some(attempt => 
      attempt?.correct === true
    );
  },
  
  // Determine best learning context for student
  getBestContext: (profile: StudentLearningProfile): 'abstract' | 'applied' | 'narrative' => {
    const { learningPatterns } = profile;
    
    if (learningPatterns.experienceBreakthroughRate > 0.7) return 'applied';
    if (learningPatterns.discoverBreakthroughRate > 0.7) return 'narrative';
    return 'abstract';
  },
  
  // Generate recommendations for next learning approach
  getRecommendations: (profile: StudentLearningProfile, skill: Skill): string[] => {
    const recommendations: string[] = [];
    
    if (profile.learningPatterns.needsRealWorld) {
      recommendations.push('Present in career context');
    }
    if (profile.learningPatterns.needsStoryContext) {
      recommendations.push('Embed in narrative');
    }
    if (profile.subjectPreferences[skill.subject]?.challengeAreas.length > 0) {
      recommendations.push('Provide extra visual support');
    }
    
    return recommendations;
  }
};