// ================================================================
// CAREER DEPTH PROGRESSION TYPES
// Analytics-focused career engagement tracking system
// ================================================================

// Career progression levels within a single career path
export interface CareerLevel {
  id: string;
  name: string;
  description: string;
  requiredMastery: number;        // 0-100 score needed to unlock
  estimatedDuration: number;      // minutes
  unlocksBadges: string[];
  scenarios: CareerScenario[];
}

export interface CareerProgression {
  careerId: string;
  careerName: string;
  department: string;
  gradeLevel: string;
  
  // Progressive levels within this career
  levels: {
    beginner: CareerLevel;      // Required 4-hour completion
    intermediate: CareerLevel;  // First extension level
    advanced: CareerLevel;      // Second extension level  
    master: CareerLevel;        // Expert level
  };
  
  // Analytics metadata
  totalEstimatedTime: number;    // All levels combined
  popularityScore: number;       // Cross-student engagement data
  retentionRate: number;         // % who extend beyond required
}

// Individual student's career progression tracking
export interface StudentCareerJourney {
  studentId: string;
  careerId: string;
  startDate: Date;
  
  // Required completion (always completed)
  requiredCompletion: {
    completed: true;
    completionDate: Date;
    timeSpent: number;
    finalScore: number;
    masteryAchieved: boolean;
  };
  
  // Extension sessions (optional - key analytics data)
  extensionSessions: ExtensionSession[];
  
  // Current status
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'master';
  totalTimeSpent: number;
  overallMastery: number;
  
  // Career affinity indicators
  engagementMetrics: CareerEngagementMetrics;
}

export interface ExtensionSession {
  sessionId: string;
  level: 'intermediate' | 'advanced' | 'master';
  startTime: Date;
  endTime: Date;
  duration: number;
  
  // What they chose to do
  scenariosCompleted: string[];
  skillsReinforced: string[];
  challengesAttempted: number;
  
  // How they performed
  averageScore: number;
  masteryGained: number;
  badgesEarned: string[];
  
  // How they felt (inferred from behavior)
  engagementSignals: {
    voluntaryExtension: boolean;    // Did they choose to continue?
    timeExceededEstimate: boolean;  // Spent longer than expected?
    exploredAllOptions: boolean;    // Tried multiple scenarios?
    exitReason: 'completed' | 'tired' | 'bored' | 'excited_for_tomorrow' | 'parent_called';
  };
}

export interface CareerEngagementMetrics {
  // Interest signals
  voluntaryExtensionTime: number;      // Time spent beyond required
  extensionSessionCount: number;       // Number of times they extended
  averageSessionDuration: number;      // How long they typically play
  
  // Mastery progression
  skillsImprovedDuringExtension: string[];
  masteryGainRate: number;            // Points gained per minute
  challengeSeekingBehavior: number;   // How often they try harder tasks
  
  // Persistence indicators
  longestSingleSession: number;       // Max time in one sitting
  consecutiveDaysEngaged: number;     // Multi-day interest
  returnRate: number;                 // Likelihood to come back
  
  // Preference patterns
  favoriteScenarios: string[];        // Which scenarios they replay
  preferredDifficulty: 'easy' | 'medium' | 'hard';
  collaborationPreference: 'solo' | 'guided' | 'competitive';
  
  // Emotional engagement (inferred)
  frustrationTolerance: number;       // How they handle failures
  celebrationResponses: number;       // Engagement with success feedback
  explorationCuriosity: number;       // How much they explore options
}

// Career scenario with progression difficulty
export interface ProgressiveCareerScenario {
  scenarioId: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'master';
  title: string;
  description: string;
  
  // Skills application
  requiredSkills: string[];
  skillsReinforced: string[];
  newSkillsIntroduced: string[];
  
  // Difficulty progression
  complexity: number;                 // 1-10 scale
  prerequisites: string[];            // Other scenarios needed first
  estimatedDuration: number;
  
  // Experience design
  realWorldContext: string;
  challenges: Challenge[];
  successCriteria: SuccessCriteria;
  
  // Analytics tracking
  completionRate: number;             // % of students who finish
  averageAttempts: number;            // How many tries typically needed
  engagementScore: number;            // How much students like it
}

export interface Challenge {
  challengeId: string;
  type: 'problem-solving' | 'skill-application' | 'creative' | 'collaborative';
  description: string;
  difficulty: number;
  hints: string[];
  timeLimit?: number;
}

export interface SuccessCriteria {
  minimumScore: number;
  requiredCompletions: number;
  masteryIndicators: string[];
  badgeEligibility: string[];
}

// Aggregate analytics across all students
export interface CareerAnalytics {
  careerId: string;
  
  // Engagement patterns
  totalStudentsExposed: number;
  studentsWhoExtended: number;
  extensionRate: number;              // % who continue beyond required
  averageExtensionTime: number;
  
  // Performance patterns  
  averageRequiredCompletionTime: number;
  averageMasteryScore: number;
  dropOffPoints: string[];            // Where students typically stop
  
  // Interest indicators
  mostPopularScenarios: string[];
  leastEngagingScenarios: string[];
  optimalDifficultyProgression: number[];
  
  // Demographic insights
  gradeEngagementPatterns: { [grade: string]: number };
  genderEngagementDifferences: any;   // If tracking permitted
  timeOfDayPreferences: number[];
  
  // Predictive insights
  careerAffinityScore: number;        // Overall career interest predictor
  skillTransferEffectiveness: number; // How well skills apply to other areas
  longTermRetentionPrediction: number; // Likelihood of sustained interest
}

// Daily planning integration
export interface CareerExtensionPlanning {
  studentId: string;
  availableTime: number;              // Minutes available for extension
  
  // Recommendations based on previous behavior
  recommendedCareer: string;          // Which career to extend
  recommendedLevel: 'intermediate' | 'advanced' | 'master';
  recommendedScenarios: string[];
  
  // Predicted outcomes
  estimatedEngagement: number;        // How likely they are to enjoy
  estimatedMasteryGain: number;       // Learning benefit prediction
  estimatedDuration: number;          // How long they'll likely play
}

// Helper functions and utilities
export const CareerProgressionUtils = {
  
  // Calculate career affinity score
  calculateCareerAffinity: (journey: StudentCareerJourney): number => {
    const baseScore = journey.requiredCompletion.finalScore;
    const extensionBonus = journey.extensionSessions.length * 20;
    const timeBonus = Math.min(journey.voluntaryExtensionTime / 60, 30); // Max 30 points
    
    return Math.min(baseScore + extensionBonus + timeBonus, 100);
  },
  
  // Determine if student shows strong career interest
  hasStrongCareerInterest: (journey: StudentCareerJourney): boolean => {
    return (
      journey.extensionSessions.length >= 2 ||
      journey.engagementMetrics.voluntaryExtensionTime > 30 ||
      journey.engagementMetrics.returnRate > 0.7
    );
  },
  
  // Get next recommended level
  getNextLevel: (currentLevel: string, mastery: number): string | null => {
    const progressionMap = {
      'beginner': mastery >= 70 ? 'intermediate' : null,
      'intermediate': mastery >= 80 ? 'advanced' : null,
      'advanced': mastery >= 90 ? 'master' : null,
      'master': null
    };
    
    return progressionMap[currentLevel as keyof typeof progressionMap];
  },
  
  // Generate extension opportunity
  shouldOfferExtension: (
    journey: StudentCareerJourney,
    availableTime: number
  ): boolean => {
    const hasTime = availableTime >= 15; // Minimum 15 minutes
    const hasInterest = journey.requiredCompletion.finalScore >= 60;
    const notOverextended = journey.extensionSessions.length < 3; // Max 3 per day
    
    return hasTime && hasInterest && notOverextended;
  }
};

export default CareerProgressionUtils;