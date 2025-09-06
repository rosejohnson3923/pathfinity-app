/**
 * PathIQ Integration Service
 * Central orchestrator that connects PathIQ Intelligence with all platform services
 * This service ensures PathIQ data flows throughout the entire application
 */

import { pathIQ } from './pathIQIntelligenceSystem';
import { pathIQGamification } from './pathIQGamificationService';
import { pathIQService } from './pathIQService';
import { learningMetricsService } from './learningMetricsService';
import { ageProvisioning } from './ageProvisioningService';
import { leaderboardService } from './leaderboardService';
import { GamificationService } from './gamificationService';

export interface PathIQIntegrationEvent {
  type: 'skill_completed' | 'career_explored' | 'achievement_unlocked' | 
        'level_up' | 'streak_updated' | 'hint_used' | 'lesson_started' | 
        'assessment_completed' | 'career_selected';
  userId: string;
  data: any;
  timestamp: string;
  pathIQProcessed: boolean;
}

export interface PathIQUserContext {
  userId: string;
  grade: string;
  schoolType: 'family' | 'microschool' | 'private' | 'district';
  currentSkill?: string;
  currentCareer?: string;
  sessionStartTime: Date;
  lastActivity: Date;
}

class PathIQIntegrationService {
  private static instance: PathIQIntegrationService;
  private userContexts: Map<string, PathIQUserContext> = new Map();
  private eventQueue: PathIQIntegrationEvent[] = [];
  private isProcessing = false;
  
  private constructor() {
    console.log('🔗 PathIQ Integration Service initialized');
    this.startEventProcessor();
    this.initializeServiceConnections();
  }

  static getInstance(): PathIQIntegrationService {
    if (!PathIQIntegrationService.instance) {
      PathIQIntegrationService.instance = new PathIQIntegrationService();
    }
    return PathIQIntegrationService.instance;
  }

  /**
   * Initialize connections between services
   */
  private initializeServiceConnections() {
    // Listen for PathIQ events
    window.addEventListener('pathiq-event', this.handlePathIQEvent.bind(this) as EventListener);
    
    // Set up periodic intelligence updates
    setInterval(() => this.broadcastIntelligenceUpdate(), 30000);
    
    // Set up user activity monitoring
    setInterval(() => this.checkUserActivity(), 60000);
  }

  /**
   * Start processing queued events
   */
  private startEventProcessor() {
    setInterval(() => {
      if (!this.isProcessing && this.eventQueue.length > 0) {
        this.processEventQueue();
      }
    }, 1000);
  }

  /**
   * Process queued events
   */
  private async processEventQueue() {
    this.isProcessing = true;
    
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        await this.processEvent(event);
      }
    }
    
    this.isProcessing = false;
  }

  /**
   * Process a single event through PathIQ
   */
  private async processEvent(event: PathIQIntegrationEvent) {
    const context = this.userContexts.get(event.userId);
    if (!context) return;
    
    // Get age-appropriate configuration
    const provision = ageProvisioning.getProvisioningConfig(
      context.grade as any,
      context.schoolType
    );
    
    // Process based on event type
    switch (event.type) {
      case 'skill_completed':
        await this.handleSkillCompleted(event, context, provision);
        break;
      
      case 'career_explored':
        await this.handleCareerExplored(event, context, provision);
        break;
      
      case 'achievement_unlocked':
        await this.handleAchievementUnlocked(event, context, provision);
        break;
      
      case 'level_up':
        await this.handleLevelUp(event, context, provision);
        break;
      
      case 'streak_updated':
        await this.handleStreakUpdated(event, context, provision);
        break;
      
      case 'hint_used':
        await this.handleHintUsed(event, context, provision);
        break;
      
      case 'lesson_started':
        await this.handleLessonStarted(event, context, provision);
        break;
      
      case 'assessment_completed':
        await this.handleAssessmentCompleted(event, context, provision);
        break;
      
      case 'career_selected':
        await this.handleCareerSelected(event, context, provision);
        break;
    }
    
    // Mark as processed
    event.pathIQProcessed = true;
    
    // Update last activity
    context.lastActivity = new Date();
  }

  /**
   * Handle PathIQ system events
   */
  private handlePathIQEvent(event: CustomEvent) {
    const { detail } = event;
    console.log('PathIQ Event:', detail);
    
    // Broadcast to relevant services
    this.broadcastToServices(detail);
  }

  /**
   * Initialize user session with PathIQ
   */
  initializeUser(userId: string, grade: string, schoolType: PathIQUserContext['schoolType'] = 'private') {
    const context: PathIQUserContext = {
      userId,
      grade,
      schoolType,
      sessionStartTime: new Date(),
      lastActivity: new Date()
    };
    
    this.userContexts.set(userId, context);
    
    // Initialize user in all services
    pathIQGamification.getUserProfile(userId);
    
    // Get initial intelligence
    const intelligence = pathIQ.getIntelligence();
    
    // Get provisioning config
    const provision = ageProvisioning.getProvisioningConfig(grade as any, schoolType);
    
    // Log session start
    console.log(`🎯 PathIQ Session initialized for user ${userId}`, {
      grade,
      schoolType,
      features: {
        xp: provision.showXP,
        leaderboard: provision.showLeaderboard,
        careers: provision.showCareerExploration
      }
    });
    
    return {
      context,
      intelligence,
      provision
    };
  }

  /**
   * Track user action and process through PathIQ
   */
  trackAction(userId: string, action: string, data: any = {}) {
    const event: PathIQIntegrationEvent = {
      type: this.mapActionToEventType(action),
      userId,
      data: {
        action,
        ...data
      },
      timestamp: new Date().toISOString(),
      pathIQProcessed: false
    };
    
    this.eventQueue.push(event);
    
    // Update metrics
    if (data.skill) {
      learningMetricsService.recordAttempt(
        userId,
        data.skill,
        data.subject || 'general',
        data.correct || false,
        data.timeSpent || 0,
        data.hintsUsed || 0
      );
    }
  }

  /**
   * Get comprehensive PathIQ dashboard data
   */
  getDashboardData(userId: string) {
    const context = this.userContexts.get(userId);
    if (!context) {
      return null;
    }
    
    const provision = ageProvisioning.getProvisioningConfig(
      context.grade as any,
      context.schoolType
    );
    
    // Get all PathIQ data
    const intelligence = pathIQ.getIntelligence();
    const profile = pathIQGamification.getUserProfile(userId);
    const leaderboard = pathIQGamification.getPathIQLeaderboard(userId, context.grade);
    const insights = pathIQGamification.getPathIQInsights(userId);
    const careers = pathIQService.getCareerSelections(context.grade);
    const analytics = pathIQService.getPathIQAnalytics(userId);
    
    return {
      user: {
        profile,
        context,
        provision
      },
      pathiq: {
        intelligence,
        insights,
        authority: 'PathIQ Intelligence System'
      },
      gamification: {
        leaderboard: provision.showLeaderboard ? leaderboard : null,
        xp: provision.showXP ? profile.xp : null,
        level: provision.showXP ? profile.level : null,
        streak: provision.showStreaks ? profile.streak : null,
        achievements: provision.showAchievements ? profile.achievements : []
      },
      careers: provision.showCareerExploration ? careers : [],
      analytics: provision.showAdvancedMetrics ? analytics : null,
      terminology: provision.terminology
    };
  }

  /**
   * Get age-appropriate hint
   */
  getHint(userId: string, hintType: 'encouragement' | 'subtle' | 'clear' | 'example' | 'answer') {
    const context = this.userContexts.get(userId);
    if (!context) return null;
    
    const provision = ageProvisioning.getProvisioningConfig(
      context.grade as any,
      context.schoolType
    );
    
    // Check if hints are available
    if (provision.hintAvailability === 'unlimited') {
      // Free hint
      return {
        hint: this.generateHint(hintType, context),
        cost: 0,
        source: 'PathIQ Helper'
      };
    }
    
    // Try to spend XP for hint
    const transaction = pathIQGamification.spendXPForHint(userId, hintType);
    
    if (transaction) {
      return {
        hint: this.generateHint(hintType, context),
        cost: transaction.amount,
        source: 'PathIQ Intelligence'
      };
    }
    
    return null;
  }

  // Event Handlers
  private async handleSkillCompleted(event: PathIQIntegrationEvent, context: PathIQUserContext, provision: any) {
    const { skill, score, timeSpent } = event.data;
    
    // Award XP if enabled
    if (provision.showXP) {
      const xpAmount = score >= 80 ? 10 : 5;
      pathIQGamification.awardXP(event.userId, xpAmount, `Completed ${skill}`, 'learning');
    }
    
    // Track in PathIQ
    pathIQService.trackSkillMastery(event.userId, skill, score);
    
    // Update metrics
    learningMetricsService.updateMastery(event.userId, skill, 'general');
  }

  private async handleCareerExplored(event: PathIQIntegrationEvent, context: PathIQUserContext, provision: any) {
    const { careerId, timeSpent } = event.data;
    
    // Award XP for exploration
    if (provision.showXP) {
      pathIQGamification.awardXP(event.userId, 10, `Explored ${careerId}`, 'learning');
    }
    
    // Track career interest
    pathIQService.trackCareerInterest(event.userId, careerId);
  }

  private async handleAchievementUnlocked(event: PathIQIntegrationEvent, context: PathIQUserContext, provision: any) {
    const { achievementId, achievementName } = event.data;
    
    // Record achievement
    if (provision.showAchievements) {
      console.log(`🏆 Achievement Unlocked: ${achievementName}`);
    }
  }

  private async handleLevelUp(event: PathIQIntegrationEvent, context: PathIQUserContext, provision: any) {
    const { newLevel } = event.data;
    
    // Celebrate level up
    if (provision.showXP) {
      console.log(`⭐ Level Up! Now level ${newLevel}`);
    }
  }

  private async handleStreakUpdated(event: PathIQIntegrationEvent, context: PathIQUserContext, provision: any) {
    const { streak } = event.data;
    
    // Update streak display
    if (provision.showStreaks) {
      const terminology = provision.terminology;
      console.log(`🔥 ${terminology.streak}: ${streak} days`);
    }
  }

  private async handleHintUsed(event: PathIQIntegrationEvent, context: PathIQUserContext, provision: any) {
    const { hintType, cost } = event.data;
    
    // Track hint usage
    this.trackAction(event.userId, 'hint_used', { hintType, cost });
  }

  private async handleLessonStarted(event: PathIQIntegrationEvent, context: PathIQUserContext, provision: any) {
    const { lessonId, skill } = event.data;
    
    // Update current skill
    context.currentSkill = skill;
    
    // Initialize lesson metrics
    learningMetricsService.startSession(event.userId);
  }

  private async handleAssessmentCompleted(event: PathIQIntegrationEvent, context: PathIQUserContext, provision: any) {
    const { score, questions, correctAnswers } = event.data;
    
    // Award XP based on performance
    if (provision.showXP) {
      const xpAmount = Math.floor((correctAnswers / questions) * 50);
      pathIQGamification.awardXP(event.userId, xpAmount, 'Assessment completed', 'learning');
    }
  }

  private async handleCareerSelected(event: PathIQIntegrationEvent, context: PathIQUserContext, provision: any) {
    const { careerId } = event.data;
    
    // Update current career
    context.currentCareer = careerId;
    
    // Track selection
    pathIQService.trackCareerSelection(event.userId, careerId);
  }

  // Helper Methods
  private mapActionToEventType(action: string): PathIQIntegrationEvent['type'] {
    const mapping: Record<string, PathIQIntegrationEvent['type']> = {
      'complete_skill': 'skill_completed',
      'explore_career': 'career_explored',
      'unlock_achievement': 'achievement_unlocked',
      'level_up': 'level_up',
      'update_streak': 'streak_updated',
      'use_hint': 'hint_used',
      'start_lesson': 'lesson_started',
      'complete_assessment': 'assessment_completed',
      'select_career': 'career_selected'
    };
    
    return mapping[action] || 'skill_completed';
  }

  private generateHint(type: string, context: PathIQUserContext): string {
    const hints: Record<string, string[]> = {
      encouragement: [
        "You're doing great! Keep going!",
        "Almost there! You can do it!",
        "Great effort! Try once more!"
      ],
      subtle: [
        "Think about what you learned earlier",
        "Look at the pattern carefully",
        "Remember the examples we practiced"
      ],
      clear: [
        "Start by identifying the key information",
        "Break the problem into smaller steps",
        "Use the method we learned in the lesson"
      ],
      example: [
        "Here's a similar problem: 2+2=4",
        "Like this example: cat -> c-a-t",
        "Follow this pattern: 2, 4, 6, ..."
      ],
      answer: [
        "The answer is revealed by PathIQ",
        "PathIQ solution provided",
        "Complete solution from PathIQ"
      ]
    };
    
    const hintList = hints[type] || hints.encouragement;
    return hintList[Math.floor(Math.random() * hintList.length)];
  }

  private broadcastIntelligenceUpdate() {
    const intelligence = pathIQ.getIntelligence();
    
    // Broadcast to all active users
    this.userContexts.forEach((context, userId) => {
      const provision = ageProvisioning.getProvisioningConfig(
        context.grade as any,
        context.schoolType
      );
      
      if (provision.showPathIQInsights) {
        window.dispatchEvent(new CustomEvent('pathiq-intelligence-update', {
          detail: {
            userId,
            intelligence,
            timestamp: new Date().toISOString()
          }
        }));
      }
    });
  }

  private broadcastToServices(data: any) {
    // Broadcast to all integrated services
    console.log('Broadcasting PathIQ data to services:', data);
  }

  private checkUserActivity() {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes
    
    this.userContexts.forEach((context, userId) => {
      const timeSinceActivity = now.getTime() - context.lastActivity.getTime();
      
      if (timeSinceActivity > inactiveThreshold) {
        // User is inactive
        learningMetricsService.endSession(userId);
      }
    });
  }
}

// Export singleton instance
export const pathIQIntegration = PathIQIntegrationService.getInstance();

// Export types
export type { PathIQIntegrationService };

export default pathIQIntegration;