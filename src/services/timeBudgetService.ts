// ================================================================
// TIME BUDGET SERVICE
// Manages 4-hour daily learning budget and extension sessions
// ================================================================

import { 
  DailyTimeBudget, 
  LearningSession, 
  ExtensionSession,
  AssessmentResults 
} from '../types/LearningTypes';

export class TimeBudgetService {
  private static instance: TimeBudgetService;
  private budgetCache = new Map<string, DailyTimeBudget>();

  static getInstance(): TimeBudgetService {
    if (!TimeBudgetService.instance) {
      TimeBudgetService.instance = new TimeBudgetService();
    }
    return TimeBudgetService.instance;
  }

  // ================================================================
  // DAILY BUDGET MANAGEMENT
  // ================================================================

  /**
   * Initialize or get today's time budget for a student
   */
  async getTodaysBudget(studentId: string): Promise<DailyTimeBudget> {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `${studentId}-${today}`;
    
    // Check cache first
    if (this.budgetCache.has(cacheKey)) {
      return this.budgetCache.get(cacheKey)!;
    }

    // Try to load from storage/database
    const stored = this.loadBudgetFromStorage(studentId, today);
    if (stored) {
      this.budgetCache.set(cacheKey, stored);
      return stored;
    }

    // Create new budget for today
    const newBudget = this.createNewDailyBudget(studentId, today);
    this.budgetCache.set(cacheKey, newBudget);
    this.saveBudgetToStorage(newBudget);
    
    return newBudget;
  }

  /**
   * Create a new daily budget (240 minute target, flexible completion)
   */
  private createNewDailyBudget(studentId: string, date: string): DailyTimeBudget {
    return {
      studentId,
      date,
      baselineBudget: {
        targetMinutes: 240,     // 4-hour target (not limit)
        usedMinutes: 0,
        curriculumComplete: false,
        overTargetMinutes: 0
      },
      containerTime: {
        learn: 0,
        experience: 0,
        discover: 0
      },
      subjectTime: {},
      sessions: [],
      extensions: [],
      curriculumStatus: {
        completed: false,
        completionTime: 0,
        onTarget: false,
        struggledSubjects: [],
        efficientSubjects: []
      },
      totalTimeSpent: 0,
      performance: {
        efficiencyScore: 100,
        engagementScore: 100,
        paceScore: 100,
        struggledAreas: [],
        strengthAreas: []
      }
    };
  }

  // ================================================================
  // SESSION TRACKING
  // ================================================================

  /**
   * Start a new learning session
   */
  async startSession(
    studentId: string,
    container: 'learn' | 'experience' | 'discover',
    assignmentId: string
  ): Promise<{ sessionId: string; budget: DailyTimeBudget }> {
    const budget = await this.getTodaysBudget(studentId);
    
    const session: LearningSession = {
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      duration: 0,
      container,
      assignmentId,
      skillsCompleted: [],
      skillsAttempted: 0,
      skillsMastered: 0,
      averageScore: 0,
      focusScore: 100,
      struggledAreas: [],
      breakthroughMoments: []
    };

    budget.sessions.push(session);
    this.updateBudgetCache(budget);
    
    console.log(`📚 Started ${container} session: ${session.sessionId}`);
    
    return { sessionId: session.sessionId, budget };
  }

  /**
   * Update session with skill completion
   */
  async updateSession(
    studentId: string,
    sessionId: string,
    results: AssessmentResults
  ): Promise<DailyTimeBudget> {
    const budget = await this.getTodaysBudget(studentId);
    const session = budget.sessions.find(s => s.sessionId === sessionId);
    
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Update session metrics
    session.skillsCompleted.push(results.skillCode);
    session.skillsAttempted++;
    
    if (results.correct) {
      session.skillsMastered++;
      session.breakthroughMoments.push(`Mastered ${results.skillCode}`);
    } else {
      session.struggledAreas.push(results.skillCode);
    }

    // Update average score
    const totalScore = session.averageScore * (session.skillsAttempted - 1) + results.score;
    session.averageScore = totalScore / session.skillsAttempted;

    // Update focus score based on time spent vs expected
    const expectedTime = 10; // Expected 10 minutes per skill
    const actualTime = results.timeSpent / (1000 * 60); // Convert to minutes
    
    if (actualTime > expectedTime * 2) {
      session.focusScore = Math.max(0, session.focusScore - 10); // Struggled with focus
    } else if (actualTime < expectedTime * 0.5) {
      session.focusScore = Math.min(100, session.focusScore + 5); // Very focused
    }

    this.updateBudgetCache(budget);
    return budget;
  }

  /**
   * End a learning session and update curriculum completion
   */
  async endSession(
    studentId: string, 
    sessionId: string,
    isCurriculumComplete: boolean = false
  ): Promise<DailyTimeBudget> {
    const budget = await this.getTodaysBudget(studentId);
    const session = budget.sessions.find(s => s.sessionId === sessionId);
    
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Calculate session duration
    session.endTime = new Date();
    session.duration = Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60));

    // Update budget totals (baseline curriculum only)
    budget.containerTime[session.container] += session.duration;
    budget.baselineBudget.usedMinutes += session.duration;
    budget.totalTimeSpent += session.duration;

    // Calculate over-target time
    if (budget.baselineBudget.usedMinutes > budget.baselineBudget.targetMinutes) {
      budget.baselineBudget.overTargetMinutes = budget.baselineBudget.usedMinutes - budget.baselineBudget.targetMinutes;
    }

    // Update subject time (would need subject passed in or derived from assignment)
    
    // Check if curriculum is complete (not based on time, but on actual completion)
    if (isCurriculumComplete || budget.baselineBudget.curriculumComplete) {
      budget.baselineBudget.curriculumComplete = true;
      budget.curriculumStatus.completed = true;
      budget.curriculumStatus.completionTime = budget.baselineBudget.usedMinutes;
      budget.curriculumStatus.onTarget = budget.baselineBudget.usedMinutes <= budget.baselineBudget.targetMinutes;
      
      // Analyze performance vs target
      this.analyzeCurriculumCompletion(budget);
      
      console.log(`🎯 ${studentId} completed curriculum in ${budget.baselineBudget.usedMinutes} minutes (target: ${budget.baselineBudget.targetMinutes})`);
      
      if (!budget.curriculumStatus.onTarget) {
        console.log(`⚠️ Student needed ${budget.baselineBudget.overTargetMinutes} extra minutes - potential struggle areas detected`);
      }
    }

    // Update performance scores
    budget.performance.efficiencyScore = this.calculateEfficiencyScore(budget);
    budget.performance.engagementScore = this.calculateEngagementScore(budget);
    budget.performance.paceScore = this.calculatePaceScore(budget);

    this.updateBudgetCache(budget);
    this.saveBudgetToStorage(budget);
    
    console.log(`📊 Session ended: ${session.duration} minutes, Total baseline time: ${budget.baselineBudget.usedMinutes} minutes`);
    
    return budget;
  }

  // ================================================================
  // EXTENSION SESSION MANAGEMENT
  // ================================================================

  /**
   * Start an extension session beyond 4-hour baseline
   */
  async startExtensionSession(
    studentId: string,
    extensionType: 'career-depth' | 'subject-mastery' | 'creative-project' | 'collaborative',
    options: {
      careerId?: string;
      subjectFocus?: string;
      studentInitiated?: boolean;
      parentEncouraged?: boolean;
      teacherSuggested?: boolean;
    } = {}
  ): Promise<{ sessionId: string; budget: DailyTimeBudget }> {
    const budget = await this.getTodaysBudget(studentId);
    
    if (!budget.baselineComplete) {
      console.warn(`⚠️ Starting extension before baseline complete. Remaining: ${budget.baselineBudget.remainingMinutes} minutes`);
    }

    const extension: ExtensionSession = {
      sessionId: `ext-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      duration: 0,
      extensionType,
      careerId: options.careerId,
      subjectFocus: options.subjectFocus,
      studentInitiated: options.studentInitiated || false,
      parentEncouraged: options.parentEncouraged || false,
      teacherSuggested: options.teacherSuggested || false,
      engagementLevel: 'medium',
      masteryGained: 0,
      creativityScore: 50,
      exitReason: 'completed'
    };

    budget.extensions.push(extension);
    this.updateBudgetCache(budget);
    
    console.log(`🚀 Started extension session: ${extensionType} - ${extension.sessionId}`);
    
    return { sessionId: extension.sessionId, budget };
  }

  /**
   * End an extension session
   */
  async endExtensionSession(
    studentId: string,
    sessionId: string,
    exitReason: 'completed' | 'tired' | 'parent-called' | 'bored' | 'excited-for-tomorrow',
    metrics: {
      engagementLevel?: 'low' | 'medium' | 'high' | 'exceptional';
      masteryGained?: number;
      creativityScore?: number;
    } = {}
  ): Promise<DailyTimeBudget> {
    const budget = await this.getTodaysBudget(studentId);
    const extension = budget.extensions.find(e => e.sessionId === sessionId);
    
    if (!extension) {
      throw new Error(`Extension session ${sessionId} not found`);
    }

    // Calculate extension duration
    extension.endTime = new Date();
    extension.duration = Math.round((extension.endTime.getTime() - extension.startTime.getTime()) / (1000 * 60));
    extension.exitReason = exitReason;
    
    // Update metrics
    extension.engagementLevel = metrics.engagementLevel || 'medium';
    extension.masteryGained = metrics.masteryGained || 0;
    extension.creativityScore = metrics.creativityScore || 50;

    // Update budget totals
    budget.totalTimeSpent += extension.duration;

    this.updateBudgetCache(budget);
    this.saveBudgetToStorage(budget);
    
    console.log(`🏁 Extension session ended: ${extension.duration} minutes, Exit: ${exitReason}`);
    
    return budget;
  }

  // ================================================================
  // ANALYTICS AND INSIGHTS
  // ================================================================

  /**
   * Calculate efficiency score based on time usage
   */
  private calculateEfficiencyScore(budget: DailyTimeBudget): number {
    if (budget.sessions.length === 0) return 100;

    const totalAttempted = budget.sessions.reduce((sum, s) => sum + s.skillsAttempted, 0);
    const totalMastered = budget.sessions.reduce((sum, s) => sum + s.skillsMastered, 0);
    const avgFocus = budget.sessions.reduce((sum, s) => sum + s.focusScore, 0) / budget.sessions.length;
    
    const masteryRate = totalAttempted > 0 ? (totalMastered / totalAttempted) * 100 : 100;
    
    // Combine mastery rate and focus score
    return Math.round((masteryRate * 0.7) + (avgFocus * 0.3));
  }

  /**
   * Calculate engagement score
   */
  private calculateEngagementScore(budget: DailyTimeBudget): number {
    if (budget.sessions.length === 0) return 100;

    const avgSessionLength = budget.sessions.reduce((sum, s) => sum + s.duration, 0) / budget.sessions.length;
    const breakthroughCount = budget.sessions.reduce((sum, s) => sum + s.breakthroughMoments.length, 0);
    const extensionBonus = budget.extensions.length * 10; // Bonus for voluntary extensions
    
    // Base score from session length (optimal is 15-20 minutes)
    let lengthScore = 100;
    if (avgSessionLength < 5) lengthScore = 50; // Too short
    else if (avgSessionLength > 30) lengthScore = 70; // Too long
    
    const engagementScore = Math.min(100, lengthScore + (breakthroughCount * 5) + extensionBonus);
    return Math.round(engagementScore);
  }

  /**
   * Analyze curriculum completion performance vs target
   */
  private analyzeCurriculumCompletion(budget: DailyTimeBudget): void {
    const targetMinutes = budget.baselineBudget.targetMinutes;
    const actualMinutes = budget.baselineBudget.usedMinutes;
    const overTarget = actualMinutes > targetMinutes;
    
    if (overTarget) {
      // Student took longer than target - analyze struggle areas
      const extraTime = actualMinutes - targetMinutes;
      
      // Identify which containers took longer than expected
      const expectedContainerTime = targetMinutes / 3; // Rough split across 3 containers
      
      if (budget.containerTime.learn > expectedContainerTime * 1.5) {
        budget.performance.struggledAreas.push('Abstract Learning');
        budget.curriculumStatus.struggledSubjects.push('Learn Container');
      }
      
      if (budget.containerTime.experience > expectedContainerTime * 1.5) {
        budget.performance.struggledAreas.push('Applied Learning');
        budget.curriculumStatus.struggledSubjects.push('Experience Container');
      }
      
      if (budget.containerTime.discover > expectedContainerTime * 1.5) {
        budget.performance.struggledAreas.push('Narrative Learning');
        budget.curriculumStatus.struggledSubjects.push('Discover Container');
      }
      
      console.log(`📊 Struggle analysis: Student needed ${extraTime} extra minutes`);
      console.log(`🔍 Struggled areas: ${budget.performance.struggledAreas.join(', ')}`);
    } else {
      // Student completed ahead of schedule - identify strengths
      const savedTime = targetMinutes - actualMinutes;
      
      if (budget.containerTime.learn < targetMinutes * 0.25) {
        budget.performance.strengthAreas.push('Quick Abstract Learning');
        budget.curriculumStatus.efficientSubjects.push('Learn Container');
      }
      
      if (budget.containerTime.experience < targetMinutes * 0.25) {
        budget.performance.strengthAreas.push('Efficient Applied Learning');
        budget.curriculumStatus.efficientSubjects.push('Experience Container');
      }
      
      if (budget.containerTime.discover < targetMinutes * 0.25) {
        budget.performance.strengthAreas.push('Fast Narrative Learning');
        budget.curriculumStatus.efficientSubjects.push('Discover Container');
      }
      
      console.log(`⚡ Efficiency analysis: Student finished ${savedTime} minutes early`);
      console.log(`💪 Strength areas: ${budget.performance.strengthAreas.join(', ')}`);
    }
  }

  /**
   * Calculate pace score (how close to 4-hour target)
   */
  private calculatePaceScore(budget: DailyTimeBudget): number {
    if (!budget.curriculumStatus.completed) return 100;
    
    const target = budget.baselineBudget.targetMinutes;
    const actual = budget.baselineBudget.usedMinutes;
    
    // Perfect score for completing exactly on target
    if (actual === target) return 100;
    
    // Calculate variance from target
    const variance = Math.abs(actual - target);
    const maxVariance = target * 0.5; // 50% variance = 0 score
    
    const score = Math.max(0, 100 - (variance / maxVariance) * 100);
    return Math.round(score);
  }

  /**
   * Check if student should be offered extension opportunity
   */
  shouldOfferExtension(budget: DailyTimeBudget): {
    shouldOffer: boolean;
    recommendedType: 'career-depth' | 'subject-mastery' | 'creative-project' | 'collaborative';
    reason: string;
  } {
    // Must complete curriculum first (not based on time)
    if (!budget.baselineBudget.curriculumComplete) {
      return {
        shouldOffer: false,
        recommendedType: 'career-depth',
        reason: 'Required curriculum not yet complete'
      };
    }

    // Check engagement indicators
    const highEngagement = budget.engagementScore >= 80;
    const recentBreakthroughs = budget.sessions.slice(-2).some(s => s.breakthroughMoments.length > 0);
    const goodFocus = budget.sessions.reduce((sum, s) => sum + s.focusScore, 0) / budget.sessions.length >= 70;

    if (highEngagement && recentBreakthroughs && goodFocus) {
      // Determine best extension type based on recent performance
      const mathSkills = budget.sessions.filter(s => s.skillsCompleted.some(skill => skill.includes('CC') || skill.includes('NF')));
      const experienceTime = budget.containerTime.experience;
      
      let recommendedType: 'career-depth' | 'subject-mastery' | 'creative-project' | 'collaborative' = 'career-depth';
      
      if (experienceTime > budget.containerTime.learn) {
        recommendedType = 'career-depth'; // They like applied learning
      } else if (mathSkills.length > 0) {
        recommendedType = 'subject-mastery'; // Strong in a subject
      } else {
        recommendedType = 'creative-project'; // Try something different
      }

      return {
        shouldOffer: true,
        recommendedType,
        reason: 'Student showing high engagement and recent success'
      };
    }

    return {
      shouldOffer: false,
      recommendedType: 'career-depth',
      reason: 'Student may benefit from completing today and returning tomorrow'
    };
  }

  // ================================================================
  // PERSISTENCE HELPERS
  // ================================================================

  private updateBudgetCache(budget: DailyTimeBudget): void {
    const cacheKey = `${budget.studentId}-${budget.date}`;
    this.budgetCache.set(cacheKey, budget);
  }

  private loadBudgetFromStorage(studentId: string, date: string): DailyTimeBudget | null {
    // In a real implementation, this would load from database or localStorage
    // For now, return null to always create fresh budgets
    const stored = localStorage.getItem(`time-budget-${studentId}-${date}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        parsed.sessions.forEach((session: any) => {
          session.startTime = new Date(session.startTime);
          if (session.endTime) session.endTime = new Date(session.endTime);
        });
        parsed.extensions.forEach((ext: any) => {
          ext.startTime = new Date(ext.startTime);
          if (ext.endTime) ext.endTime = new Date(ext.endTime);
        });
        return parsed;
      } catch (error) {
        console.error('Error parsing stored budget:', error);
      }
    }
    return null;
  }

  private saveBudgetToStorage(budget: DailyTimeBudget): void {
    const cacheKey = `time-budget-${budget.studentId}-${budget.date}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(budget));
    } catch (error) {
      console.error('Error saving budget to storage:', error);
    }
  }

  /**
   * Get time budget summary for display
   */
  getBudgetSummary(budget: DailyTimeBudget): {
    progressPercentage: number;
    timeRemaining: string;
    canExtend: boolean;
    nextMilestone: string;
  } {
    const targetProgress = Math.round((budget.baselineBudget.usedMinutes / budget.baselineBudget.targetMinutes) * 100);
    const isOverTarget = budget.baselineBudget.usedMinutes > budget.baselineBudget.targetMinutes;
    const isComplete = budget.baselineBudget.curriculumComplete;
    
    // Time display depends on completion status
    let timeRemaining = '';
    if (!isComplete) {
      if (isOverTarget) {
        timeRemaining = `+${budget.baselineBudget.overTargetMinutes}m over target`;
      } else {
        const remaining = budget.baselineBudget.targetMinutes - budget.baselineBudget.usedMinutes;
        const hours = Math.floor(remaining / 60);
        const minutes = remaining % 60;
        timeRemaining = hours > 0 ? `${hours}h ${minutes}m to target` : `${minutes}m to target`;
      }
    } else {
      const totalTime = budget.baselineBudget.usedMinutes;
      const hours = Math.floor(totalTime / 60);
      const minutes = totalTime % 60;
      timeRemaining = hours > 0 ? `Completed in ${hours}h ${minutes}m` : `Completed in ${minutes}m`;
    }
    
    const canExtend = isComplete;
    
    let nextMilestone = '';
    if (!isComplete) {
      if (isOverTarget) {
        nextMilestone = 'Learning takes time - you\'re doing great! Keep going until mastery.';
      } else if (targetProgress >= 80) {
        nextMilestone = 'Almost there! You\'re so close to completing your curriculum.';
      } else if (targetProgress >= 50) {
        nextMilestone = 'Great progress! You\'re more than halfway to your target.';
      } else {
        nextMilestone = 'Excellent start! Keep building momentum.';
      }
    } else {
      if (isOverTarget) {
        nextMilestone = '🎯 Curriculum complete! Took extra time but that shows dedication to mastery.';
      } else {
        nextMilestone = '🎉 Curriculum complete on target! Want to continue learning?';
      }
    }

    return {
      progressPercentage: Math.min(100, targetProgress),
      timeRemaining,
      canExtend,
      nextMilestone
    };
  }
}

export const timeBudgetService = TimeBudgetService.getInstance();