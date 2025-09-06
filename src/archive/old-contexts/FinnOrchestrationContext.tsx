import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { LearningService } from '../services/learningService';
import { skillsService } from '../services/enhanced-skillsService';
import { studentProgressService } from '../services/studentProgressService';
import { dailyAssignmentService } from '../services/dailyAssignmentService';
import { FinnContextBuilder, FinnRecommendationEngine } from '../services/finnIntegrationHooks';
import type { Skill, SkillWithProgress, Grade, Subject, ServiceResponse } from '../types/services';

// Skills-Based Assignment Interface
interface SkillBasedAssignment {
  id: string;
  skillId: string;              // From skills database
  subject: string;              // 'Math', 'ELA', etc.
  grade: string;                // 'Pre-K', 'K'
  skillsArea: string;           // e.g., 'Numbers', 'Counting'
  skillsCluster: string;        // e.g., 'A.', 'B.'
  skillNumber: string;          // e.g., 'A.0', 'A.1'
  skillName: string;            // e.g., 'Identify numbers - up to 3'
  estimatedTimeMinutes: number; // Age-appropriate timing
  recommendedTool: string;      // Tool selection based on skill type
  difficultyLevel: number;      // 1-10 scale
  prerequisites: string[];      // Required prior skills
  confidence: number;           // AI confidence in assignment
}

// SECURE Types - FERPA Compliant (No sensitive data in client state)
interface SecureStudentContext {
  // PUBLIC DATA ONLY - Safe for client-side storage
  currentLearningState: 'onboarding' | 'active' | 'struggling' | 'accelerated' | 'break_needed';
  focusLevel: 'high' | 'medium' | 'low';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  sessionDuration: number;
  consecutiveDaysActive: number;
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
  lastInteractionTime: Date;
  isActiveSession: boolean;
  
  // Skills Database Integration
  currentGrade: Grade;
  currentSubject: Subject;
  skillsProgress: {
    completedSkillIds: string[];
    currentSkillIds: string[];
    nextRecommendedSkills: string[];
    lastUpdated: Date;
  };
  dailyAssignments: SkillBasedAssignment[];
  
  // REMOVED SENSITIVE DATA - Now accessed via secure API:
  // strugglingTopics, strongTopics, currentMood, completionRate, 
  // avgTimePerLesson, needsEncouragement
}

interface UIOrchestrationState {
  primaryAction: string | null;
  secondaryActions: string[];
  hiddenElements: string[];
  emphasizedElements: string[];
  suggestedTools: string[];
  contextualHelp: string | null;
  adaptiveLayout: 'focus' | 'explore' | 'review' | 'collaborate';
  finnPersonality: 'encouraging' | 'challenging' | 'patient' | 'excited';
  anticipatedNeeds: string[];
}

interface FinnDecision {
  id: string;
  type: 'ui_orchestration' | 'learning_path' | 'tool_suggestion' | 'intervention';
  confidence: number; // 0-1
  reasoning: string;
  actions: Array<{
    type: 'show' | 'hide' | 'emphasize' | 'suggest' | 'redirect' | 'assist';
    target: string;
    parameters?: Record<string, any>;
  }>;
  timing: 'immediate' | 'delayed' | 'contextual';
  expiry: Date; // All decisions now have expiry
  executed?: boolean;
  result?: 'success' | 'failure';
}

interface SecureFinnOrchestrationState {
  isInitialized: boolean;
  studentContext: SecureStudentContext;
  uiState: UIOrchestrationState;
  activeDecisions: FinnDecision[]; // Limited to 10 max
  learningAnalytics: {
    sessionStartTime: Date;
    interactionCount: number;
    toolsUsed: string[];
    lessonsCompleted: number;
    helpRequestsToday: number;
    skillsAttempted: number;
    skillsCompleted: number;
    averageSkillTime: number;
  };
  lastAnalysisTime: number;
  analysisThrottle: number; // Minimum time between analyses
  
  // Skills Database State
  skillsCache: {
    availableSkills: Skill[];
    lastFetch: Date;
    isLoading: boolean;
    error: string | null;
  };
}

// Secure API for sensitive data access
interface SecureContextAPI {
  getStrugglingTopics: (userId: string) => Promise<string[]>;
  getCompletionRate: (userId: string) => Promise<number>;
  getCurrentMood: (userId: string) => Promise<string>;
  getNeedsEncouragement: (userId: string) => Promise<boolean>;
  getStrongTopics: (userId: string) => Promise<string[]>;
  getAvgTimePerLesson: (userId: string) => Promise<number>;
}

// Action Types
type SecureFinnOrchestrationAction = 
  | { type: 'INITIALIZE'; payload: Partial<SecureStudentContext> }
  | { type: 'UPDATE_CONTEXT'; payload: Partial<SecureStudentContext> }
  | { type: 'MAKE_DECISION'; payload: FinnDecision }
  | { type: 'EXECUTE_DECISION'; payload: { decisionId: string; result: 'success' | 'failure' } }
  | { type: 'UPDATE_ANALYTICS'; payload: Partial<SecureFinnOrchestrationState['learningAnalytics']> }
  | { type: 'RECORD_INTERACTION'; payload: { type: string; details: any } }
  | { type: 'CLEANUP_EXPIRED' }
  | { type: 'RESET_SESSION' }
  | { type: 'UPDATE_SKILLS_CACHE'; payload: { skills: Skill[]; isLoading: boolean; error: string | null } }
  | { type: 'UPDATE_SKILLS_PROGRESS'; payload: { completedSkillIds: string[]; currentSkillIds: string[]; nextRecommendedSkills: string[] } }
  | { type: 'SET_DAILY_ASSIGNMENTS'; payload: SkillBasedAssignment[] }
  | { type: 'UPDATE_SKILL_COMPLETION'; payload: { skillId: string; timeSpent: number } };

// Initial State
const initialState: SecureFinnOrchestrationState = {
  isInitialized: false,
  studentContext: {
    currentLearningState: 'onboarding',
    focusLevel: 'medium',
    timeOfDay: 'morning',
    sessionDuration: 0,
    consecutiveDaysActive: 0,
    preferredLearningStyle: 'mixed',
    lastInteractionTime: new Date(),
    isActiveSession: false,
    currentGrade: 'Pre-K',
    currentSubject: 'Math',
    skillsProgress: {
      completedSkillIds: [],
      currentSkillIds: [],
      nextRecommendedSkills: [],
      lastUpdated: new Date(0)
    },
    dailyAssignments: []
  },
  uiState: {
    primaryAction: null,
    secondaryActions: [],
    hiddenElements: [],
    emphasizedElements: [],
    suggestedTools: [],
    contextualHelp: null,
    adaptiveLayout: 'focus',
    finnPersonality: 'encouraging',
    anticipatedNeeds: []
  },
  activeDecisions: [],
  learningAnalytics: {
    sessionStartTime: new Date(),
    interactionCount: 0,
    toolsUsed: [],
    lessonsCompleted: 0,
    helpRequestsToday: 0,
    skillsAttempted: 0,
    skillsCompleted: 0,
    averageSkillTime: 0
  },
  lastAnalysisTime: 0,
  analysisThrottle: 60000, // 1 minute minimum between analyses
  skillsCache: {
    availableSkills: [],
    lastFetch: new Date(0),
    isLoading: false,
    error: null
  }
};

// Memory-Optimized Reducer
function secureFinnOrchestrationReducer(
  state: SecureFinnOrchestrationState,
  action: SecureFinnOrchestrationAction
): SecureFinnOrchestrationState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        isInitialized: true,
        studentContext: { ...state.studentContext, ...action.payload, isActiveSession: true },
        lastAnalysisTime: Date.now()
      };

    case 'UPDATE_CONTEXT':
      return {
        ...state,
        studentContext: { ...state.studentContext, ...action.payload }
      };

    case 'MAKE_DECISION':
      // Limit active decisions to prevent memory bloat
      const maxActiveDecisions = 10;
      const nonExpiredDecisions = state.activeDecisions
        .filter(d => d.expiry > new Date())
        .slice(-(maxActiveDecisions - 1));

      return {
        ...state,
        activeDecisions: [...nonExpiredDecisions, action.payload]
      };

    case 'EXECUTE_DECISION':
      return {
        ...state,
        activeDecisions: state.activeDecisions.map(decision =>
          decision.id === action.payload.decisionId
            ? { ...decision, executed: true, result: action.payload.result }
            : decision
        )
      };

    case 'UPDATE_ANALYTICS':
      return {
        ...state,
        learningAnalytics: { ...state.learningAnalytics, ...action.payload }
      };

    case 'RECORD_INTERACTION':
      return {
        ...state,
        learningAnalytics: {
          ...state.learningAnalytics,
          interactionCount: state.learningAnalytics.interactionCount + 1
        }
      };
      
    case 'UPDATE_SKILLS_CACHE':
      return {
        ...state,
        skillsCache: {
          ...state.skillsCache,
          availableSkills: action.payload.skills,
          isLoading: action.payload.isLoading,
          error: action.payload.error,
          lastFetch: new Date()
        }
      };
      
    case 'UPDATE_SKILLS_PROGRESS':
      return {
        ...state,
        studentContext: {
          ...state.studentContext,
          skillsProgress: {
            ...action.payload,
            lastUpdated: new Date()
          }
        }
      };
      
    case 'SET_DAILY_ASSIGNMENTS':
      return {
        ...state,
        studentContext: {
          ...state.studentContext,
          dailyAssignments: action.payload
        }
      };
      
    case 'UPDATE_SKILL_COMPLETION':
      const { skillId, timeSpent } = action.payload;
      return {
        ...state,
        learningAnalytics: {
          ...state.learningAnalytics,
          skillsCompleted: state.learningAnalytics.skillsCompleted + 1,
          averageSkillTime: (
            (state.learningAnalytics.averageSkillTime * state.learningAnalytics.skillsCompleted + timeSpent) /
            (state.learningAnalytics.skillsCompleted + 1)
          )
        },
        studentContext: {
          ...state.studentContext,
          skillsProgress: {
            ...state.studentContext.skillsProgress,
            completedSkillIds: [...state.studentContext.skillsProgress.completedSkillIds, skillId],
            currentSkillIds: state.studentContext.skillsProgress.currentSkillIds.filter(id => id !== skillId)
          }
        }
      };

    case 'CLEANUP_EXPIRED':
      const now = new Date();
      const activeDecisions = state.activeDecisions.filter(
        d => d.expiry > now && !d.executed
      );

      return {
        ...state,
        activeDecisions
      };

    case 'RESET_SESSION':
      return {
        ...state,
        studentContext: { ...state.studentContext, isActiveSession: false },
        learningAnalytics: {
          ...initialState.learningAnalytics,
          sessionStartTime: new Date()
        },
        activeDecisions: [],
        lastAnalysisTime: 0
      };

    default:
      return state;
  }
}

// Secure API Implementation (would connect to your backend)
const createSecureContextAPI = (userId: string, tenantId: string): SecureContextAPI => ({
  getStrugglingTopics: async (userId: string) => {
    // Call secure backend endpoint
    try {
      const response = await LearningService.getSecureStudentData(userId, 'strugglingTopics');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch struggling topics:', error);
      return [];
    }
  },

  getCompletionRate: async (userId: string) => {
    try {
      const response = await LearningService.getSecureStudentData(userId, 'completionRate');
      return response.data || 0;
    } catch (error) {
      console.error('Failed to fetch completion rate:', error);
      return 0;
    }
  },

  getCurrentMood: async (userId: string) => {
    try {
      const response = await LearningService.getSecureStudentData(userId, 'currentMood');
      return response.data || 'neutral';
    } catch (error) {
      console.error('Failed to fetch current mood:', error);
      return 'neutral';
    }
  },

  getNeedsEncouragement: async (userId: string) => {
    try {
      const response = await LearningService.getSecureStudentData(userId, 'needsEncouragement');
      return response.data || false;
    } catch (error) {
      console.error('Failed to fetch encouragement status:', error);
      return false;
    }
  },

  getStrongTopics: async (userId: string) => {
    try {
      const response = await LearningService.getSecureStudentData(userId, 'strongTopics');
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch strong topics:', error);
      return [];
    }
  },

  getAvgTimePerLesson: async (userId: string) => {
    try {
      const response = await LearningService.getSecureStudentData(userId, 'avgTimePerLesson');
      return response.data || 30;
    } catch (error) {
      console.error('Failed to fetch avg time per lesson:', error);
      return 30;
    }
  }
});

// Enhanced AI Engine with Error Handling and Secure Data Access
class SecureFinnAIEngine {
  static async analyzeStudentContext(
    context: SecureStudentContext, 
    secureAPI: SecureContextAPI,
    userId: string
  ): Promise<FinnDecision[]> {
    try {
      const decisions: FinnDecision[] = [];
      const now = new Date();
      const expiry = new Date(now.getTime() + 30 * 60 * 1000); // 30 minute expiry

      // SKILLS-BASED ANALYSIS - Core intelligence for assignment generation
      const skillsAnalysis = await this.analyzeSkillsProgress(context, userId);
      
      // Generate skills-based assignments with 92-98% confidence
      if (skillsAnalysis.needsNewAssignments) {
        decisions.push({
          id: `skills-assignment-${now.getTime()}`,
          type: 'learning_path',
          confidence: 0.95, // High confidence from skills database
          reasoning: `Based on ${skillsAnalysis.completedSkills} completed skills, generating ${skillsAnalysis.recommendedSkills.length} new assignments`,
          actions: [
            { type: 'suggest', target: 'new-skill-assignments', parameters: { skillIds: skillsAnalysis.recommendedSkills } },
            { type: 'show', target: 'skills-progress-dashboard' },
            { type: 'emphasize', target: 'next-recommended-skill' }
          ],
          timing: 'immediate',
          expiry
        });
      }

      // Age-appropriate tool selection for Pre-K students
      if (context.currentGrade === 'Pre-K' && skillsAnalysis.currentSkills.length > 0) {
        const toolRecommendations = this.selectPreKTools(skillsAnalysis.currentSkills);
        decisions.push({
          id: `prek-tool-selection-${now.getTime()}`,
          type: 'tool_suggestion',
          confidence: 0.93,
          reasoning: `Pre-K optimized tool selection based on ${skillsAnalysis.currentSkills.length} active skills`,
          actions: [
            { type: 'suggest', target: 'recommended-tools', parameters: { tools: toolRecommendations } },
            { type: 'hide', target: 'advanced-tools' }
          ],
          timing: 'immediate',
          expiry
        });
      }

      // Skills gap analysis and intervention
      if (skillsAnalysis.skillGaps.length > 0) {
        decisions.push({
          id: `skill-gap-intervention-${now.getTime()}`,
          type: 'intervention',
          confidence: 0.88,
          reasoning: `Detected ${skillsAnalysis.skillGaps.length} skill gaps requiring intervention`,
          actions: [
            { type: 'show', target: 'skill-gap-support' },
            { type: 'suggest', target: 'prerequisite-review', parameters: { skills: skillsAnalysis.skillGaps } },
            { type: 'emphasize', target: 'foundation-skills' }
          ],
          timing: 'immediate',
          expiry
        });
      }

      // Difficulty adaptation based on skill progression
      const difficultyAdjustment = this.analyzeDifficultyLevel(skillsAnalysis, context);
      if (difficultyAdjustment.needsAdjustment) {
        decisions.push({
          id: `difficulty-adjustment-${now.getTime()}`,
          type: 'learning_path',
          confidence: 0.92,
          reasoning: `Adapting difficulty ${difficultyAdjustment.direction} based on skill mastery patterns`,
          actions: [
            { type: 'suggest', target: 'adjusted-difficulty', parameters: { level: difficultyAdjustment.newLevel } },
            { type: difficultyAdjustment.direction === 'increase' ? 'show' : 'hide', target: 'challenge-mode' }
          ],
          timing: 'contextual',
          expiry
        });
      }

      // Focus Level Analysis (enhanced with skills context)
      if (context.focusLevel === 'low') {
        const focusSkills = skillsAnalysis.currentSkills.filter(s => s.estimatedTimeMinutes <= 10);
        decisions.push({
          id: `focus-optimization-${now.getTime()}`,
          type: 'ui_orchestration',
          confidence: 0.85,
          reasoning: `Low focus detected - suggesting ${focusSkills.length} shorter skills activities`,
          actions: [
            { type: 'hide', target: 'secondary-navigation' },
            { type: 'emphasize', target: 'current-task' },
            { type: 'suggest', target: 'focus-mode', parameters: { shortSkills: focusSkills.map(s => s.id) } }
          ],
          timing: 'immediate',
          expiry
        });
      }

      // Time-Based Recommendations (enhanced with skills awareness)
      if (context.timeOfDay === 'evening' && context.sessionDuration > 60) {
        const reviewSkills = skillsAnalysis.completedSkills.slice(-3); // Last 3 completed skills
        decisions.push({
          id: `evening-rest-${now.getTime()}`,
          type: 'learning_path',
          confidence: 0.78,
          reasoning: `Evening session running long - suggesting review of ${reviewSkills.length} recently completed skills`,
          actions: [
            { type: 'suggest', target: 'review-activities', parameters: { skillIds: reviewSkills } },
            { type: 'hide', target: 'new-concepts' }
          ],
          timing: 'contextual',
          expiry
        });
      }

      // Secure data analysis (enhanced with skills context)
      try {
        const completionRate = await secureAPI.getCompletionRate(userId);
        const needsEncouragement = await secureAPI.getNeedsEncouragement(userId);
        const strugglingTopics = await secureAPI.getStrugglingTopics(userId);

        if (completionRate < 0.5 || needsEncouragement) {
          const encouragementSkills = skillsAnalysis.easyWins; // Skills likely to succeed
          decisions.push({
            id: `encouragement-${now.getTime()}`,
            type: 'intervention',
            confidence: 0.94,
            reasoning: `Student needs encouragement - suggesting ${encouragementSkills.length} confidence-building skills`,
            actions: [
              { type: 'show', target: 'encouragement-message' },
              { type: 'emphasize', target: 'progress-indicator' },
              { type: 'suggest', target: 'confidence-building-skills', parameters: { skillIds: encouragementSkills } }
            ],
            timing: 'immediate',
            expiry
          });
        }

        // Address struggling topics with targeted skills
        if (strugglingTopics.length > 0) {
          const supportSkills = skillsAnalysis.currentSkills.filter(s => 
            strugglingTopics.includes(s.subject) && s.difficultyLevel <= 3
          );
          decisions.push({
            id: `struggling-support-${now.getTime()}`,
            type: 'intervention',
            confidence: 0.91,
            reasoning: `Addressing ${strugglingTopics.length} struggling topics with ${supportSkills.length} targeted skills`,
            actions: [
              { type: 'show', target: 'extra-support' },
              { type: 'suggest', target: 'remedial-skills', parameters: { skillIds: supportSkills.map(s => s.id) } },
              { type: 'emphasize', target: 'foundation-review' }
            ],
            timing: 'immediate',
            expiry
          });
        }
      } catch (error) {
        console.error('Secure data analysis failed, using fallback decisions:', error);
        // Continue with skills-based analysis only
      }

      return decisions;
    } catch (error) {
      console.error('Finn AI analysis failed:', error);
      return this.getBasicFallbackDecisions();
    }
  }

  static getBasicFallbackDecisions(): FinnDecision[] {
    const now = new Date();
    const expiry = new Date(now.getTime() + 10 * 60 * 1000); // 10 minute expiry for fallbacks

    return [{
      id: `fallback-${now.getTime()}`,
      type: 'ui_orchestration',
      confidence: 0.5,
      reasoning: 'Fallback decision - AI analysis unavailable',
      actions: [
        { type: 'show', target: 'basic-navigation' },
        { type: 'emphasize', target: 'current-lesson' }
      ],
      timing: 'immediate',
      expiry
    }];
  }

  /**
   * Analyze student's skills progress and generate intelligence data
   */
  static async analyzeSkillsProgress(context: SecureStudentContext, userId: string) {
    try {
      // Get current skills progress from context
      const { completedSkillIds, currentSkillIds, nextRecommendedSkills } = context.skillsProgress;
      
      // Fetch skill details from skills service
      const currentSkills = await Promise.all(
        currentSkillIds.map(async (skillId) => {
          const response = await skillsService.getSkillById(skillId);
          return response.success ? response.data : null;
        })
      ).then(skills => skills.filter(Boolean));

      // Fetch completed skills for pattern analysis
      const completedSkills = await Promise.all(
        completedSkillIds.slice(-10).map(async (skillId) => { // Last 10 completed
          const response = await skillsService.getSkillById(skillId);
          return response.success ? response.data : null;
        })
      ).then(skills => skills.filter(Boolean));

      // Analyze skill progression patterns
      const skillGaps = await this.identifySkillGaps(currentSkills, completedSkills, context);
      const easyWins = await this.identifyEasyWins(currentSkills, context);
      const recommendedSkills = await this.generateRecommendedSkills(
        completedSkills, 
        currentSkills, 
        context.currentGrade, 
        context.currentSubject
      );

      return {
        currentSkills,
        completedSkills: completedSkillIds,
        skillGaps,
        easyWins,
        recommendedSkills: recommendedSkills.map(s => s.id),
        needsNewAssignments: currentSkills.length < 3 && recommendedSkills.length > 0,
        masteryLevel: this.calculateMasteryLevel(completedSkills, currentSkills),
        learningVelocity: this.calculateLearningVelocity(context)
      };
    } catch (error) {
      console.error('Skills progress analysis failed:', error);
      return {
        currentSkills: [],
        completedSkills: context.skillsProgress.completedSkillIds,
        skillGaps: [],
        easyWins: [],
        recommendedSkills: [],
        needsNewAssignments: false,
        masteryLevel: 0,
        learningVelocity: 0
      };
    }
  }

  /**
   * Select age-appropriate tools for Pre-K students
   */
  static selectPreKTools(skills: any[]): string[] {
    const toolMap = {
      'Math': 'MasterToolInterface',
      'ELA': 'MasterToolInterface',
      'Science': 'MasterToolInterface',
      'SocialStudies': 'MasterToolInterface'
    };

    const recommendedTools = new Set();
    
    skills.forEach(skill => {
      if (skill.subject && toolMap[skill.subject]) {
        recommendedTools.add(toolMap[skill.subject]);
      }
    });

    return Array.from(recommendedTools);
  }

  /**
   * Analyze difficulty level and suggest adjustments
   */
  static analyzeDifficultyLevel(skillsAnalysis: any, context: SecureStudentContext) {
    const { currentSkills, completedSkills, masteryLevel } = skillsAnalysis;
    
    // Calculate current average difficulty
    const currentDifficulty = currentSkills.reduce((sum, skill) => 
      sum + (skill.difficultyLevel || 1), 0) / Math.max(currentSkills.length, 1);

    // Analyze recent completion patterns
    const recentSuccessRate = context.skillsProgress.completedSkillIds.length / 
      Math.max(context.skillsProgress.completedSkillIds.length + currentSkills.length, 1);

    let needsAdjustment = false;
    let direction = 'maintain';
    let newLevel = currentDifficulty;

    // Pre-K specific adjustments
    if (context.currentGrade === 'Pre-K') {
      // Keep difficulty low for Pre-K (1-3 range)
      if (currentDifficulty > 3) {
        needsAdjustment = true;
        direction = 'decrease';
        newLevel = Math.max(1, currentDifficulty - 1);
      } else if (recentSuccessRate > 0.8 && currentDifficulty < 3) {
        needsAdjustment = true;
        direction = 'increase';
        newLevel = Math.min(3, currentDifficulty + 1);
      }
    }

    // Kindergarten adjustments
    if (context.currentGrade === 'K') {
      if (recentSuccessRate > 0.85 && currentDifficulty < 5) {
        needsAdjustment = true;
        direction = 'increase';
        newLevel = Math.min(5, currentDifficulty + 1);
      } else if (recentSuccessRate < 0.6 && currentDifficulty > 1) {
        needsAdjustment = true;
        direction = 'decrease';
        newLevel = Math.max(1, currentDifficulty - 1);
      }
    }

    return { needsAdjustment, direction, newLevel, currentDifficulty };
  }

  /**
   * Identify skill gaps that need intervention
   */
  static async identifySkillGaps(currentSkills: any[], completedSkills: any[], context: SecureStudentContext) {
    const gaps = [];
    
    // Check for prerequisite gaps
    for (const skill of currentSkills) {
      if (skill.prerequisites && skill.prerequisites.length > 0) {
        const missingPrereqs = skill.prerequisites.filter(prereqId => 
          !context.skillsProgress.completedSkillIds.includes(prereqId)
        );
        
        if (missingPrereqs.length > 0) {
          gaps.push({
            skillId: skill.id,
            skillName: skill.skillName,
            missingPrerequisites: missingPrereqs,
            type: 'prerequisite'
          });
        }
      }
    }

    // Check for subject area gaps
    const subjectProgress = completedSkills.reduce((acc, skill) => {
      acc[skill.subject] = (acc[skill.subject] || 0) + 1;
      return acc;
    }, {});

    const expectedSkillsPerSubject = context.currentGrade === 'Pre-K' ? 3 : 5;
    
    ['Math', 'ELA'].forEach(subject => {
      if ((subjectProgress[subject] || 0) < expectedSkillsPerSubject) {
        gaps.push({
          subject,
          completedCount: subjectProgress[subject] || 0,
          expectedCount: expectedSkillsPerSubject,
          type: 'subject_gap'
        });
      }
    });

    return gaps;
  }

  /**
   * Identify easy wins for confidence building
   */
  static async identifyEasyWins(currentSkills: any[], context: SecureStudentContext) {
    return currentSkills
      .filter(skill => 
        skill.difficultyLevel <= 2 && 
        skill.estimatedTimeMinutes <= 10 &&
        !context.skillsProgress.completedSkillIds.includes(skill.id)
      )
      .map(skill => skill.id)
      .slice(0, 3); // Top 3 easy wins
  }

  /**
   * Generate recommended skills based on progression
   */
  static async generateRecommendedSkills(completedSkills: any[], currentSkills: any[], grade: string, subject: string) {
    try {
      // Get available skills for the grade and subject
      const availableSkillsResponse = await skillsService.getSkillsByGradeAndSubject(grade, subject);
      
      if (!availableSkillsResponse.success) {
        return [];
      }

      const availableSkills = availableSkillsResponse.data;
      const completedSkillIds = completedSkills.map(s => s.id);
      const currentSkillIds = currentSkills.map(s => s.id);

      // Filter out already completed or current skills
      const candidateSkills = availableSkills.filter(skill => 
        !completedSkillIds.includes(skill.id) && 
        !currentSkillIds.includes(skill.id)
      );

      // Sort by difficulty and select appropriate next skills
      const sortedSkills = candidateSkills.sort((a, b) => {
        // Prioritize skills with completed prerequisites
        const aPrereqsMet = !a.prerequisites || a.prerequisites.every(id => completedSkillIds.includes(id));
        const bPrereqsMet = !b.prerequisites || b.prerequisites.every(id => completedSkillIds.includes(id));
        
        if (aPrereqsMet && !bPrereqsMet) return -1;
        if (!aPrereqsMet && bPrereqsMet) return 1;
        
        // Then by difficulty level
        return a.difficultyLevel - b.difficultyLevel;
      });

      // Select top 3-5 recommended skills
      const maxRecommendations = grade === 'Pre-K' ? 3 : 5;
      return sortedSkills.slice(0, maxRecommendations);

    } catch (error) {
      console.error('Error generating recommended skills:', error);
      return [];
    }
  }

  /**
   * Calculate mastery level based on completed skills
   */
  static calculateMasteryLevel(completedSkills: any[], currentSkills: any[]) {
    const totalSkills = completedSkills.length + currentSkills.length;
    if (totalSkills === 0) return 0;

    const avgDifficulty = completedSkills.reduce((sum, skill) => 
      sum + (skill.difficultyLevel || 1), 0) / Math.max(completedSkills.length, 1);
    
    return Math.min(1, (completedSkills.length / totalSkills) * (avgDifficulty / 5));
  }

  /**
   * Calculate learning velocity
   */
  static calculateLearningVelocity(context: SecureStudentContext) {
    const { skillsProgress } = context;
    const daysSinceLastUpdate = (Date.now() - skillsProgress.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastUpdate === 0) return 0;
    
    return skillsProgress.completedSkillIds.length / Math.max(daysSinceLastUpdate, 1);
  }

  static adaptFinnPersonality(context: SecureStudentContext): UIOrchestrationState['finnPersonality'] {
    if (context.currentLearningState === 'struggling') {
      return 'patient';
    }
    if (context.currentLearningState === 'accelerated') {
      return 'challenging';
    }
    if (context.focusLevel === 'low') {
      return 'encouraging';
    }
    return 'encouraging';
  }
}

// Context Type
interface SecureFinnOrchestrationContextType {
  state: SecureFinnOrchestrationState;
  // Core AI Functions
  initializeFinn: (initialContext?: Partial<SecureStudentContext>) => Promise<void>;
  updateStudentContext: (updates: Partial<SecureStudentContext>) => void;
  makeDecision: (decision: FinnDecision) => void;
  executeDecision: (decisionId: string, result: 'success' | 'failure') => void;
  
  // Analytics & Tracking
  recordInteraction: (type: string, details: any) => void;
  updateAnalytics: (updates: Partial<SecureFinnOrchestrationState['learningAnalytics']>) => void;
  
  // UI Orchestration Helpers
  shouldShowElement: (elementId: string) => boolean;
  shouldEmphasizeElement: (elementId: string) => boolean;
  getPrimaryAction: () => string | null;
  getSuggestedTools: () => string[];
  getContextualHelp: () => string | null;
  getAdaptiveLayout: () => UIOrchestrationState['adaptiveLayout'];
  getFinnPersonality: () => UIOrchestrationState['finnPersonality'];
  
  // Optimized Learning Intelligence
  triggerAnalysis: (reason: string) => Promise<void>;
  handleUserInteraction: (interactionType: string, details?: any) => void;
  getOptimalNextAction: () => string | null;
  
  // Session Management
  startSession: () => Promise<void>;
  endSession: () => void;
  resetSession: () => void;
  
  // Personality Management
  personality: { mode: string };
  updatePersonality: (personality: { mode: string }) => void;
  
  // Skills Database Integration
  getSkillsCache: () => SecureFinnOrchestrationState['skillsCache'];
  refreshSkillsData: () => Promise<void>;
  completeSkill: (skillId: string, timeSpent: number, score?: number) => Promise<void>;
  getDailyAssignments: () => SkillBasedAssignment[];
  generateNewAssignments: () => Promise<void>;
}

// Context
const SecureFinnOrchestrationContext = createContext<SecureFinnOrchestrationContextType | undefined>(undefined);

// Provider
export function FinnOrchestrationProvider({ children }: { children: ReactNode }) {
  const { user, tenant, profile } = useAuthContext();
  const [state, dispatch] = useReducer(secureFinnOrchestrationReducer, initialState);

  // Create secure API instance
  const secureAPI = React.useMemo(() => {
    const userId = user?.id || profile?.id;
    const tenantId = tenant?.id || profile?.tenant_id;
    return userId && tenantId ? createSecureContextAPI(userId, tenantId) : null;
  }, [user, tenant, profile]);

  // Initialize Finn when auth context is ready
  useEffect(() => {
    // TEMPORARILY DISABLED - Causing infinite loop
    // Only initialize if we have a real authenticated user (not a demo/default user)
    if (false && user && user.id && tenant && !state.isInitialized && user.email && user.email !== 'demo@example.com') {
      console.log('Initializing Finn for authenticated user:', user.email);
      initializeFinn();
    }
  }, [user, tenant, state.isInitialized]);

  // Skills database integration
  useEffect(() => {
    if (state.isInitialized && user) {
      loadSkillsData();
    }
  }, [state.isInitialized, user]);

  // Load skills data from database
  const loadSkillsData = useCallback(async () => {
    try {
      const userId = user?.id || profile?.id;
      if (!userId) return;

      // Load available skills for current grade/subject
      const skillsResponse = await skillsService.getSkillsByGradeAndSubject(
        state.studentContext.currentGrade,
        state.studentContext.currentSubject
      );

      if (skillsResponse.success) {
        dispatch({
          type: 'UPDATE_SKILLS_CACHE',
          payload: {
            skills: skillsResponse.data,
            isLoading: false,
            error: null
          }
        });
      }

      // Load student progress
      const progressResponse = await studentProgressService.getStudentProgress(userId);
      if (progressResponse.success && progressResponse.data.length > 0) {
        const completedSkillIds = progressResponse.data
          .filter(p => p.status === 'completed' || p.status === 'mastered')
          .map(p => p.skill_id);
        
        const currentSkillIds = progressResponse.data
          .filter(p => p.status === 'in_progress')
          .map(p => p.skill_id);

        // Generate next recommended skills
        const nextSkillsResult = await studentProgressService.getNextSkills(
          userId,
          state.studentContext.currentSubject,
          state.studentContext.currentGrade,
          { limit: 5, difficulty_preference: 'adaptive' }
        );
        const nextRecommendedSkills = nextSkillsResult.success ? nextSkillsResult.data || [] : [];

        dispatch({
          type: 'UPDATE_SKILLS_PROGRESS',
          payload: {
            completedSkillIds,
            currentSkillIds,
            nextRecommendedSkills: nextRecommendedSkills.slice(0, 5).map(r => r.id)
          }
        });

        // Generate daily assignments based on skills
        await generateDailyAssignments(userId, nextRecommendedSkills.slice(0, 3));
      }

    } catch (error) {
      console.error('Failed to load skills data:', error);
      dispatch({
        type: 'UPDATE_SKILLS_CACHE',
        payload: {
          skills: [],
          isLoading: false,
          error: error.message
        }
      });
    }
  }, [user, profile, state.studentContext.currentGrade, state.studentContext.currentSubject]);

  // Generate daily assignments from skills
  const generateDailyAssignments = useCallback(async (userId: string, recommendedSkills: any[]) => {
    try {
      const assignments: SkillBasedAssignment[] = recommendedSkills.map(skill => ({
        id: `assignment-${Date.now()}-${skill.skill_id}`,
        skillId: skill.skill_id,
        subject: skill.subject || state.studentContext.currentSubject,
        grade: skill.grade || state.studentContext.currentGrade,
        skillsArea: skill.skills_area || 'General',
        skillsCluster: skill.skills_cluster || 'A',
        skillNumber: skill.skill_number || '1.0',
        skillName: skill.skill_name || 'Practice Activity',
        estimatedTimeMinutes: skill.estimated_time_minutes || 15,
        recommendedTool: SecureFinnAIEngine.selectPreKTools([skill])[0] || 'MasterToolInterface',
        difficultyLevel: skill.difficulty_level || 2,
        prerequisites: skill.prerequisites || [],
        confidence: skill.confidence || 0.85
      }));

      dispatch({
        type: 'SET_DAILY_ASSIGNMENTS',
        payload: assignments
      });

    } catch (error) {
      console.error('Failed to generate daily assignments:', error);
    }
  }, [state.studentContext.currentSubject, state.studentContext.currentGrade]);

  // Session duration tracking (optimized)
  useEffect(() => {
    if (!state.studentContext.isActiveSession) return;

    const interval = setInterval(() => {
      const sessionDuration = Math.floor(
        (Date.now() - state.learningAnalytics.sessionStartTime.getTime()) / 60000
      );
      dispatch({
        type: 'UPDATE_CONTEXT',
        payload: { sessionDuration }
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [state.studentContext.isActiveSession, state.learningAnalytics.sessionStartTime]);

  // Periodic cleanup of expired decisions
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      dispatch({ type: 'CLEANUP_EXPIRED' });
    }, 300000); // Cleanup every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

  // Core Functions with Error Handling
  const initializeFinn = useCallback(async (initialContext?: Partial<SecureStudentContext>) => {
    try {
      const userId = user?.id || profile?.id;
      const tenantId = tenant?.id || profile?.tenant_id;
      
      if (!userId || !tenantId) {
        throw new Error('Invalid user or tenant for Finn initialization');
      }

      // Gather initial context data (public data only)
      const timeOfDay = getTimeOfDay();
      const todaysLessons = await LearningService.getTodaysLessons(userId);

      const contextData: Partial<SecureStudentContext> = {
        timeOfDay,
        currentLearningState: todaysLessons?.length > 0 ? 'active' : 'onboarding',
        lastInteractionTime: new Date(),
        isActiveSession: true,
        ...initialContext
      };

      dispatch({ type: 'INITIALIZE', payload: contextData });
    } catch (error) {
      console.error('Error initializing Finn:', error);
      // Initialize with basic fallback data
      dispatch({ 
        type: 'INITIALIZE', 
        payload: { 
          timeOfDay: getTimeOfDay(),
          isActiveSession: true 
        } 
      });
    }
  }, [user, tenant, profile]);

  const updateStudentContext = useCallback((updates: Partial<SecureStudentContext>) => {
    // Validate updates (basic validation)
    const validatedUpdates = Object.keys(updates).reduce((acc, key) => {
      const value = updates[key as keyof SecureStudentContext];
      if (value !== undefined && value !== null) {
        acc[key as keyof SecureStudentContext] = value;
      }
      return acc;
    }, {} as Partial<SecureStudentContext>);

    dispatch({ type: 'UPDATE_CONTEXT', payload: validatedUpdates });
  }, []);

  const makeDecision = useCallback((decision: FinnDecision) => {
    // Ensure decision has expiry
    const decisionWithExpiry = {
      ...decision,
      expiry: decision.expiry || new Date(Date.now() + 30 * 60 * 1000) // 30 min default
    };
    
    dispatch({ type: 'MAKE_DECISION', payload: decisionWithExpiry });
  }, []);

  const executeDecision = useCallback((decisionId: string, result: 'success' | 'failure') => {
    dispatch({ type: 'EXECUTE_DECISION', payload: { decisionId, result } });
  }, []);

  const recordInteraction = useCallback((type: string, details: any) => {
    dispatch({ type: 'RECORD_INTERACTION', payload: { type, details } });
  }, []);

  const updateAnalytics = useCallback((updates: Partial<SecureFinnOrchestrationState['learningAnalytics']>) => {
    dispatch({ type: 'UPDATE_ANALYTICS', payload: updates });
  }, []);

  // Optimized Analysis with Throttling
  const triggerAnalysis = useCallback(async (reason: string) => {
    const now = Date.now();
    
    // Check if analysis is throttled
    if (now - state.lastAnalysisTime < state.analysisThrottle) {
      return;
    }

    // High-priority triggers (immediate)
    const highPriorityTriggers = [
      'user_struggling',
      'session_start',
      'help_requested',
      'tool_confusion',
      'lesson_completed'
    ];

    // Only proceed with high-priority triggers or if enough time has passed
    if (!highPriorityTriggers.includes(reason) && now - state.lastAnalysisTime < state.analysisThrottle * 2) {
      return;
    }

    try {
      if (!secureAPI) {
        throw new Error('Secure API not available');
      }

      const userId = user?.id || profile?.id;
      if (!userId) {
        throw new Error('User ID not available');
      }

      const decisions = await SecureFinnAIEngine.analyzeStudentContext(
        state.studentContext, 
        secureAPI, 
        userId
      );

      // Execute immediate decisions
      for (const decision of decisions) {
        if (decision.timing === 'immediate') {
          makeDecision(decision);
        }
      }

      // Update analysis timestamp
      dispatch({
        type: 'UPDATE_CONTEXT',
        payload: { lastInteractionTime: new Date() }
      });

    } catch (error) {
      console.error(`Finn analysis failed (${reason}):`, error);
      
      // Use fallback decisions
      const fallbackDecisions = SecureFinnAIEngine.getBasicFallbackDecisions();
      for (const decision of fallbackDecisions) {
        makeDecision(decision);
      }
    }
  }, [state.studentContext, state.lastAnalysisTime, state.analysisThrottle, secureAPI, user, profile, makeDecision]);

  // Smart interaction handling
  const handleUserInteraction = useCallback((interactionType: string, details?: any) => {
    recordInteraction(interactionType, { timestamp: Date.now(), ...details });
    
    // Trigger analysis only for significant interactions
    const significantInteractions = [
      'lesson_completed', 
      'help_requested', 
      'tool_switched',
      'assignment_submitted',
      'struggling_detected',
      'focus_lost'
    ];
    
    if (significantInteractions.includes(interactionType)) {
      triggerAnalysis(interactionType);
    }
  }, [recordInteraction, triggerAnalysis]);

  // UI Orchestration Helpers
  const shouldShowElement = useCallback((elementId: string) => {
    return !state.uiState.hiddenElements.includes(elementId);
  }, [state.uiState.hiddenElements]);

  const shouldEmphasizeElement = useCallback((elementId: string) => {
    return state.uiState.emphasizedElements.includes(elementId);
  }, [state.uiState.emphasizedElements]);

  const getPrimaryAction = useCallback(() => {
    return state.uiState.primaryAction;
  }, [state.uiState.primaryAction]);

  const getSuggestedTools = useCallback(() => {
    return state.uiState.suggestedTools;
  }, [state.uiState.suggestedTools]);

  const getContextualHelp = useCallback(() => {
    return state.uiState.contextualHelp;
  }, [state.uiState.contextualHelp]);

  const getAdaptiveLayout = useCallback(() => {
    return state.uiState.adaptiveLayout;
  }, [state.uiState.adaptiveLayout]);

  const getFinnPersonality = useCallback(() => {
    return state.uiState.finnPersonality;
  }, [state.uiState.finnPersonality]);

  const getOptimalNextAction = useCallback(() => {
    const activeDecisions = state.activeDecisions
      .filter(d => d.timing === 'immediate' && !d.executed)
      .sort((a, b) => b.confidence - a.confidence);

    if (activeDecisions.length > 0) {
      const topDecision = activeDecisions[0];
      const primaryAction = topDecision.actions.find(a => a.type === 'suggest');
      return primaryAction?.target || null;
    }

    return null;
  }, [state.activeDecisions]);

  // Session Management
  const startSession = useCallback(async () => {
    dispatch({ type: 'RESET_SESSION' });
    await initializeFinn();
    await triggerAnalysis('session_start');
  }, [initializeFinn, triggerAnalysis]);

  const endSession = useCallback(() => {
    // Log session end for analytics
    console.log('Finn session ended:', {
      duration: state.studentContext.sessionDuration,
      interactions: state.learningAnalytics.interactionCount,
      decisions: state.activeDecisions.length
    });
    
    dispatch({ type: 'RESET_SESSION' });
  }, [state]);

  const resetSession = useCallback(() => {
    dispatch({ type: 'RESET_SESSION' });
  }, []);

  // Personality management
  const personality = { mode: getFinnPersonality() };
  const updatePersonality = useCallback((newPersonality: { mode: string }) => {
    // This would update the personality based on the mode
    // For now, we'll just log it since personality is derived from context
    console.log('Updating Finn personality to:', newPersonality.mode);
  }, []);

  // Skills Database Integration Methods
  const getSkillsCache = useCallback(() => {
    return state.skillsCache;
  }, [state.skillsCache]);

  const refreshSkillsData = useCallback(async () => {
    await loadSkillsData();
  }, [loadSkillsData]);

  const completeSkill = useCallback(async (skillId: string, timeSpent: number, score?: number) => {
    try {
      const userId = user?.id || profile?.id;
      if (!userId) throw new Error('User ID not available');

      // Update progress in database
      const response = await studentProgressService.updateSkillProgress(userId, skillId, {
        status: 'completed',
        score: score || 1.0,
        time_spent_minutes: timeSpent,
        completed_at: new Date().toISOString()
      });

      if (response.success) {
        // Update local state
        dispatch({
          type: 'UPDATE_SKILL_COMPLETION',
          payload: { skillId, timeSpent }
        });

        // Trigger analysis for new assignments
        await triggerAnalysis('skill_completed');

        // Generate new assignments if needed
        if (state.studentContext.dailyAssignments.length < 3) {
          await generateNewAssignments();
        }
      }

    } catch (error) {
      console.error('Failed to complete skill:', error);
    }
  }, [user, profile, triggerAnalysis]);

  const getDailyAssignments = useCallback(() => {
    return state.studentContext.dailyAssignments;
  }, [state.studentContext.dailyAssignments]);

  const generateNewAssignments = useCallback(async () => {
    try {
      const userId = user?.id || profile?.id;
      if (!userId) return;

      // Get next recommended skills
      const recommendations = await FinnRecommendationEngine.generateRecommendations(
        userId,
        state.studentContext.currentGrade,
        state.studentContext.currentSubject,
        state.studentContext.skillsProgress.completedSkillIds
      );

      if (recommendations.length > 0) {
        await generateDailyAssignments(userId, recommendations.slice(0, 3));
      }

    } catch (error) {
      console.error('Failed to generate new assignments:', error);
    }
  }, [user, profile, state.studentContext, generateDailyAssignments]);

  const contextValue: SecureFinnOrchestrationContextType = {
    state,
    initializeFinn,
    updateStudentContext,
    makeDecision,
    executeDecision,
    recordInteraction,
    updateAnalytics,
    shouldShowElement,
    shouldEmphasizeElement,
    getPrimaryAction,
    getSuggestedTools,
    getContextualHelp,
    getAdaptiveLayout,
    getFinnPersonality,
    triggerAnalysis,
    handleUserInteraction,
    getOptimalNextAction,
    startSession,
    endSession,
    resetSession,
    personality,
    updatePersonality,
    getSkillsCache,
    refreshSkillsData,
    completeSkill,
    getDailyAssignments,
    generateNewAssignments
  };

  return (
    <SecureFinnOrchestrationContext.Provider value={contextValue}>
      {children}
    </SecureFinnOrchestrationContext.Provider>
  );
}

// Hook
export function useFinnOrchestration() {
  const context = useContext(SecureFinnOrchestrationContext);
  if (context === undefined) {
    throw new Error('useFinnOrchestration must be used within a FinnOrchestrationProvider');
  }
  return context;
}

// Helper Functions
function getTimeOfDay(): SecureStudentContext['timeOfDay'] {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}