// ================================================================
// FINN ORCHESTRATION INTEGRATION HOOKS
// Service functions that connect skills database with AI orchestration
// ================================================================

import { skillsService } from './enhanced-skillsService';
import { studentProgressService } from './studentProgressService';
import { dailyAssignmentService } from './dailyAssignmentService';
import { 
  ServiceErrorHandler, 
  ValidationUtils, 
  PerformanceMonitor,
  globalCache 
} from './serviceUtils';
import type {
  ServiceResponse,
  FinnAssignmentContext,
  FinnRecommendation,
  StudentAnalytics,
  LearningPath,
  Grade,
  Subject,
  ToolName,
  Skill,
  ProgressSummary,
  GeneratedAssignments
} from '../types/services';

// ================================================================
// FINN CONTEXT BUILDER
// ================================================================

export class FinnContextBuilder {
  /**
   * Build comprehensive context for Finn AI from student data
   */
  static async buildStudentContext(
    studentId: string,
    targetGrade: Grade
  ): Promise<ServiceResponse<FinnAssignmentContext>> {
    const startTime = Date.now();
    const cacheKey = `finn_context_${studentId}_${targetGrade}`;

    try {
      // Check cache first
      const cached = globalCache.get<FinnAssignmentContext>(cacheKey);
      if (cached) {
        return ServiceErrorHandler.createSuccessResponse(cached, startTime, { cache_hit: true });
      }

      // Get student progress summary
      const progressResult = await studentProgressService.getProgressSummary(studentId, { grade: targetGrade });
      if (!progressResult.success) {
        throw new Error('Failed to fetch student progress for Finn context');
      }

      const progressSummaries = progressResult.data || [];

      // Get recent assignment history (last 14 days)
      const assignmentHistoryResult = await dailyAssignmentService.getAssignmentHistory(
        studentId,
        14,
        undefined,
        { page: 1, limit: 50 }
      );

      const recentAssignments = assignmentHistoryResult.success 
        ? assignmentHistoryResult.data?.items || []
        : [];

      // Calculate learning profile
      const learningProfile = this.calculateLearningProfile(progressSummaries, recentAssignments);
      
      // Calculate recent performance
      const recentPerformance = this.calculateRecentPerformance(progressSummaries, recentAssignments);
      
      // Generate learning goals
      const learningGoals = this.generateLearningGoals(progressSummaries, learningProfile);

      const context: FinnAssignmentContext = {
        student_profile: {
          grade: targetGrade,
          learning_preferences: learningProfile.strongest_subjects,
          average_session_time: learningProfile.preferred_learning_time,
          current_difficulty_comfort: learningProfile.optimal_difficulty_level
        },
        recent_performance: recentPerformance,
        learning_goals: learningGoals
      };

      // Cache the result for 10 minutes
      globalCache.set(cacheKey, context, 10 * 60 * 1000);

      return ServiceErrorHandler.createSuccessResponse(context, startTime);

    } catch (error) {
      const serviceError = ServiceErrorHandler.createError(
        'FINN_CONTEXT_BUILD_ERROR',
        'Failed to build Finn context for student',
        error instanceof Error ? error.message : error
      );
      return ServiceErrorHandler.createErrorResponse(serviceError, startTime);
    }
  }

  /**
   * Calculate learning profile from progress data
   */
  private static calculateLearningProfile(
    progressSummaries: ProgressSummary[],
    recentAssignments: any[]
  ) {
    const subjectPerformance = new Map<Subject, number>();
    let totalTime = 0;
    let sessionCount = 0;
    
    // Calculate subject strengths from completion rates
    for (const summary of progressSummaries) {
      const performance = summary.total_skills > 0 
        ? (summary.completed_skills + summary.mastered_skills * 1.5) / summary.total_skills
        : 0;
      subjectPerformance.set(summary.subject, performance);
      totalTime += summary.total_time_minutes;
    }

    // Calculate average session time from recent assignments
    const sessionDates = new Set(recentAssignments.map(a => a.assignment_date));
    if (sessionDates.size > 0) {
      sessionCount = sessionDates.size;
      // Use recent assignment data if available
      const recentTotalTime = recentAssignments.reduce((sum, a) => sum + a.estimated_time_minutes, 0);
      if (recentTotalTime > 0) {
        totalTime = recentTotalTime;
      }
    }

    // Determine strongest subjects
    const sortedSubjects = Array.from(subjectPerformance.entries())
      .sort(([,a], [,b]) => b - a)
      .map(([subject]) => subject);

    const strongest_subjects = sortedSubjects.slice(0, 2).length > 0 
      ? sortedSubjects.slice(0, 2)
      : ['Math', 'ELA'];

    // Calculate preferred session time (average or default)
    const preferred_learning_time = sessionCount > 0 
      ? Math.round(totalTime / sessionCount)
      : 20; // Default 20 minutes

    // Calculate optimal difficulty level based on success rates
    const overallPerformance = Array.from(subjectPerformance.values());
    const avgPerformance = overallPerformance.length > 0
      ? overallPerformance.reduce((sum, p) => sum + p, 0) / overallPerformance.length
      : 0.5;

    let optimal_difficulty_level: number;
    if (avgPerformance > 0.8) {
      optimal_difficulty_level = 7; // Higher difficulty for high performers
    } else if (avgPerformance > 0.6) {
      optimal_difficulty_level = 5; // Medium difficulty
    } else {
      optimal_difficulty_level = 3; // Lower difficulty for struggling students
    }

    return {
      strongest_subjects,
      preferred_learning_time,
      optimal_difficulty_level
    };
  }

  /**
   * Calculate recent performance metrics
   */
  private static calculateRecentPerformance(
    progressSummaries: ProgressSummary[],
    recentAssignments: any[]
  ) {
    const lastWeekAssignments = recentAssignments.filter(a => {
      const assignmentDate = new Date(a.assignment_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return assignmentDate >= weekAgo;
    });

    const completedLastWeek = lastWeekAssignments.filter(a => a.status === 'completed').length;
    
    // Calculate average score from progress summaries
    const totalScores = progressSummaries.reduce((sum, s) => sum + s.average_score, 0);
    const average_score = progressSummaries.length > 0 
      ? totalScores / progressSummaries.length 
      : 0;

    // Identify struggling and mastered areas
    const struggling_areas: string[] = [];
    const mastered_areas: string[] = [];

    for (const summary of progressSummaries) {
      if (summary.completion_percentage < 30) {
        struggling_areas.push(`${summary.subject} (${summary.completion_percentage.toFixed(0)}% complete)`);
      }
      if (summary.mastery_percentage > 70) {
        mastered_areas.push(`${summary.subject} (${summary.mastery_percentage.toFixed(0)}% mastered)`);
      }
    }

    return {
      last_week_completions: completedLastWeek,
      average_score,
      struggling_areas,
      mastered_areas
    };
  }

  /**
   * Generate learning goals based on progress
   */
  private static generateLearningGoals(
    progressSummaries: ProgressSummary[],
    learningProfile: any
  ) {
    // Calculate realistic target based on current progress
    const avgCompletionRate = progressSummaries.length > 0
      ? progressSummaries.reduce((sum, s) => sum + s.completion_percentage, 0) / progressSummaries.length
      : 0;

    let target_skills_per_week: number;
    if (avgCompletionRate > 60) {
      target_skills_per_week = 8; // High performers
    } else if (avgCompletionRate > 30) {
      target_skills_per_week = 5; // Medium performers
    } else {
      target_skills_per_week = 3; // Beginning or struggling students
    }

    // Focus on subjects that need attention
    const focus_subjects = progressSummaries
      .filter(s => s.completion_percentage < 80) // Not yet complete
      .sort((a, b) => a.completion_percentage - b.completion_percentage) // Lowest first
      .slice(0, 2) // Top 2 priorities
      .map(s => s.subject);

    // Default to all subjects if no specific focus needed
    const final_focus_subjects = focus_subjects.length > 0 
      ? focus_subjects 
      : learningProfile.strongest_subjects;

    return {
      target_skills_per_week,
      focus_subjects: final_focus_subjects,
      upcoming_assessments: [] // Could be populated from external data
    };
  }
}

// ================================================================
// FINN RECOMMENDATION ENGINE
// ================================================================

export class FinnRecommendationEngine {
  /**
   * Generate AI-powered skill recommendations
   */
  static async generateRecommendations(
    studentId: string,
    context: FinnAssignmentContext,
    requestedMinutes: number = 20
  ): Promise<ServiceResponse<FinnRecommendation>> {
    const startTime = Date.now();

    try {
      // Get available skills for the student
      const availableSkillsPromises = context.learning_goals.focus_subjects.map(async (subject) => {
        const nextSkillsResult = await studentProgressService.getNextSkills(
          studentId,
          subject,
          context.student_profile.grade,
          { 
            limit: 10,
            difficulty_preference: 'adaptive'
          }
        );
        
        return {
          subject,
          skills: nextSkillsResult.success ? nextSkillsResult.data || [] : []
        };
      });

      const subjectSkills = await Promise.all(availableSkillsPromises);
      
      // Flatten all available skills
      const allAvailableSkills = subjectSkills.flatMap(s => s.skills);

      if (allAvailableSkills.length === 0) {
        return ServiceErrorHandler.createSuccessResponse({
          recommended_skills: [],
          reasoning: 'No available skills found for the student at this time.',
          confidence_score: 0,
          estimated_success_rate: 0,
          adaptive_adjustments: {
            difficulty_modifier: 0,
            time_allocation: {},
            tool_preferences: []
          }
        }, startTime);
      }

      // Apply intelligent skill selection
      const selectedSkills = this.selectOptimalSkills(
        allAvailableSkills,
        context,
        requestedMinutes
      );

      // Generate reasoning
      const reasoning = this.generateReasoningText(selectedSkills, context);

      // Calculate confidence and success rate
      const confidence_score = this.calculateConfidenceScore(selectedSkills, context);
      const estimated_success_rate = this.estimateSuccessRate(selectedSkills, context);

      // Generate adaptive adjustments
      const adaptive_adjustments = this.generateAdaptiveAdjustments(selectedSkills, context, requestedMinutes);

      const recommendation: FinnRecommendation = {
        recommended_skills: selectedSkills.map(skill => skill.id),
        reasoning,
        confidence_score,
        estimated_success_rate,
        adaptive_adjustments
      };

      return ServiceErrorHandler.createSuccessResponse(recommendation, startTime);

    } catch (error) {
      const serviceError = ServiceErrorHandler.createError(
        'FINN_RECOMMENDATION_ERROR',
        'Failed to generate Finn recommendations',
        error instanceof Error ? error.message : error
      );
      return ServiceErrorHandler.createErrorResponse(serviceError, startTime);
    }
  }

  /**
   * Select optimal skills based on context and constraints
   */
  private static selectOptimalSkills(
    availableSkills: Skill[],
    context: FinnAssignmentContext,
    requestedMinutes: number
  ): Skill[] {
    // Score each skill based on multiple factors
    const scoredSkills = availableSkills.map(skill => {
      let score = 0;

      // Subject preference bonus
      if (context.student_profile.learning_preferences.includes(skill.subject)) {
        score += 20;
      }

      // Difficulty alignment
      const difficultyDiff = Math.abs(skill.difficulty_level - context.student_profile.current_difficulty_comfort);
      score += Math.max(0, 10 - difficultyDiff * 2);

      // Time preference alignment
      const timeDiff = Math.abs(skill.estimated_time_minutes - (requestedMinutes / 3));
      score += Math.max(0, 10 - timeDiff);

      // Struggling area priority
      const subjectInStrugglingAreas = context.recent_performance.struggling_areas.some(area => 
        area.toLowerCase().includes(skill.subject.toLowerCase())
      );
      if (subjectInStrugglingAreas) {
        score += 15;
      }

      // Skills area variety (prefer different areas)
      score += 5; // Base variety score

      return { skill, score };
    });

    // Sort by score and select top skills within time constraint
    scoredSkills.sort((a, b) => b.score - a.score);

    const selectedSkills: Skill[] = [];
    let totalTime = 0;

    for (const { skill } of scoredSkills) {
      if (totalTime + skill.estimated_time_minutes <= requestedMinutes * 1.2) { // Allow 20% buffer
        selectedSkills.push(skill);
        totalTime += skill.estimated_time_minutes;
        
        // Limit to reasonable number of skills
        if (selectedSkills.length >= 4) break;
      }
    }

    // Ensure at least one skill if possible
    if (selectedSkills.length === 0 && scoredSkills.length > 0) {
      selectedSkills.push(scoredSkills[0].skill);
    }

    return selectedSkills;
  }

  /**
   * Generate human-readable reasoning for recommendations
   */
  private static generateReasoningText(skills: Skill[], context: FinnAssignmentContext): string {
    if (skills.length === 0) {
      return 'No suitable skills found at this time.';
    }

    const subjects = new Set(skills.map(s => s.subject));
    const subjectNames = Array.from(subjects).join(' and ');
    
    let reasoning = `Recommended ${skills.length} skill${skills.length > 1 ? 's' : ''} in ${subjectNames}. `;

    // Add context-specific reasoning
    if (context.recent_performance.struggling_areas.length > 0) {
      reasoning += `Focusing on areas where you need more practice. `;
    }

    if (context.recent_performance.last_week_completions > context.learning_goals.target_skills_per_week) {
      reasoning += `You're doing great this week! These skills will help maintain your momentum. `;
    } else {
      reasoning += `These skills are chosen to help you reach your weekly learning goals. `;
    }

    const avgDifficulty = skills.reduce((sum, s) => sum + s.difficulty_level, 0) / skills.length;
    if (avgDifficulty > context.student_profile.current_difficulty_comfort + 1) {
      reasoning += `Slightly challenging to help you grow. `;
    } else if (avgDifficulty < context.student_profile.current_difficulty_comfort - 1) {
      reasoning += `Building confidence with appropriate difficulty level. `;
    }

    return reasoning.trim();
  }

  /**
   * Calculate confidence score for recommendations
   */
  private static calculateConfidenceScore(skills: Skill[], context: FinnAssignmentContext): number {
    if (skills.length === 0) return 0;

    let confidence = 0.5; // Base confidence

    // Boost confidence if skills align with preferences
    const preferredSubjects = context.student_profile.learning_preferences;
    const alignmentRatio = skills.filter(s => preferredSubjects.includes(s.subject)).length / skills.length;
    confidence += alignmentRatio * 0.3;

    // Boost confidence if difficulty is appropriate
    const avgDifficulty = skills.reduce((sum, s) => sum + s.difficulty_level, 0) / skills.length;
    const difficultyAlignment = Math.max(0, 1 - Math.abs(avgDifficulty - context.student_profile.current_difficulty_comfort) / 5);
    confidence += difficultyAlignment * 0.2;

    return Math.min(1, confidence);
  }

  /**
   * Estimate success rate for recommendations
   */
  private static estimateSuccessRate(skills: Skill[], context: FinnAssignmentContext): number {
    if (skills.length === 0) return 0;

    let baseRate = context.recent_performance.average_score || 0.7;

    // Adjust based on difficulty alignment
    const avgDifficulty = skills.reduce((sum, s) => sum + s.difficulty_level, 0) / skills.length;
    const difficultyFactor = context.student_profile.current_difficulty_comfort / avgDifficulty;
    
    if (difficultyFactor > 1.2) {
      baseRate += 0.1; // Easier skills
    } else if (difficultyFactor < 0.8) {
      baseRate -= 0.15; // Harder skills
    }

    // Adjust based on recent performance
    if (context.recent_performance.last_week_completions >= context.learning_goals.target_skills_per_week) {
      baseRate += 0.05; // Student is on track
    }

    return Math.max(0.1, Math.min(0.95, baseRate));
  }

  /**
   * Generate adaptive adjustments for the session
   */
  private static generateAdaptiveAdjustments(
    skills: Skill[],
    context: FinnAssignmentContext,
    requestedMinutes: number
  ) {
    const subjects = new Set(skills.map(s => s.subject));
    
    // Calculate difficulty modifier
    const avgDifficulty = skills.reduce((sum, s) => sum + s.difficulty_level, 0) / skills.length;
    const difficulty_modifier = avgDifficulty - context.student_profile.current_difficulty_comfort;

    // Allocate time by subject
    const time_allocation: Record<Subject, number> = {} as Record<Subject, number>;
    for (const subject of subjects) {
      const subjectSkills = skills.filter(s => s.subject === subject);
      const subjectTime = subjectSkills.reduce((sum, s) => sum + s.estimated_time_minutes, 0);
      time_allocation[subject] = subjectTime;
    }

    // Determine tool preferences based on subjects
    const tool_preferences: ToolName[] = [];
    if (subjects.has('Math')) tool_preferences.push('MasterToolInterface');
    if (subjects.has('Science')) tool_preferences.push('MasterToolInterface');
    if (subjects.has('ELA') || subjects.has('SocialStudies')) tool_preferences.push('MasterToolInterface');

    return {
      difficulty_modifier,
      time_allocation,
      tool_preferences
    };
  }
}

// ================================================================
// LEARNING ANALYTICS INTEGRATION
// ================================================================

export class LearningAnalyticsHooks {
  /**
   * Generate comprehensive student analytics for Finn
   */
  static async generateStudentAnalytics(
    studentId: string,
    grade: Grade
  ): Promise<ServiceResponse<StudentAnalytics>> {
    const startTime = Date.now();

    try {
      // Get progress summaries
      const progressResult = await studentProgressService.getProgressSummary(studentId, { grade });
      if (!progressResult.success) {
        throw new Error('Failed to fetch progress data');
      }

      const progressSummaries = progressResult.data || [];

      // Get assignment history (last 30 days)
      const assignmentResult = await dailyAssignmentService.getAssignmentHistory(
        studentId,
        30,
        undefined,
        { page: 1, limit: 100 }
      );

      const assignments = assignmentResult.success ? assignmentResult.data?.items || [] : [];

      // Build analytics
      const learning_profile = this.buildLearningProfile(progressSummaries, assignments);
      const progress_trends = this.buildProgressTrends(progressSummaries, assignments);
      const recommendations = this.buildRecommendations(progressSummaries, assignments, learning_profile);

      const analytics: StudentAnalytics = {
        student_id: studentId,
        learning_profile,
        progress_trends,
        recommendations
      };

      return ServiceErrorHandler.createSuccessResponse(analytics, startTime);

    } catch (error) {
      const serviceError = ServiceErrorHandler.createError(
        'ANALYTICS_GENERATION_ERROR',
        'Failed to generate student analytics',
        error instanceof Error ? error.message : error
      );
      return ServiceErrorHandler.createErrorResponse(serviceError, startTime);
    }
  }

  /**
   * Build learning profile section
   */
  private static buildLearningProfile(progressSummaries: ProgressSummary[], assignments: any[]) {
    // Calculate strongest subjects
    const subjectPerformance = progressSummaries.map(summary => ({
      subject: summary.subject,
      score: (summary.completion_percentage + summary.mastery_percentage) / 2
    }));
    
    const strongest_subjects = subjectPerformance
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(s => s.subject);

    // Calculate preferred learning time
    const sessionDates = new Set(assignments.map(a => a.assignment_date));
    const sessionsThisMonth = sessionDates.size;
    const totalMinutes = assignments.reduce((sum, a) => sum + a.estimated_time_minutes, 0);
    const preferred_learning_time = sessionsThisMonth > 0 ? Math.round(totalMinutes / sessionsThisMonth) : 20;

    // Calculate optimal difficulty
    const avgScore = progressSummaries.reduce((sum, s) => sum + s.average_score, 0) / Math.max(1, progressSummaries.length);
    const optimal_difficulty_level = Math.max(1, Math.min(10, Math.round(avgScore * 10)));

    // Identify learning patterns
    const learning_patterns: string[] = [];
    
    if (avgScore > 0.8) learning_patterns.push('High achiever');
    if (preferred_learning_time < 15) learning_patterns.push('Prefers short sessions');
    if (preferred_learning_time > 30) learning_patterns.push('Enjoys longer sessions');
    if (strongest_subjects.length > 0) learning_patterns.push(`Strong in ${strongest_subjects.join(' and ')}`);

    return {
      strongest_subjects,
      preferred_learning_time,
      optimal_difficulty_level,
      learning_patterns
    };
  }

  /**
   * Build progress trends section
   */
  private static buildProgressTrends(progressSummaries: ProgressSummary[], assignments: any[]) {
    // Calculate skills per week
    const weeksOfData = Math.max(1, Math.ceil(assignments.length / 7));
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;
    const skills_per_week = completedAssignments / weeksOfData;

    // Build score trend (simplified - would need historical data for real trends)
    const average_score_trend = progressSummaries.map(s => s.average_score);

    // Time efficiency (simplified)
    const time_efficiency_trend = [0.8, 0.85, 0.9]; // Placeholder - would calculate from actual timing data

    // Subject preferences based on completion rates
    const subject_preferences: Record<Subject, number> = {} as Record<Subject, number>;
    for (const summary of progressSummaries) {
      subject_preferences[summary.subject] = summary.completion_percentage / 100;
    }

    return {
      skills_per_week,
      average_score_trend,
      time_efficiency_trend,
      subject_preferences
    };
  }

  /**
   * Build recommendations section
   */
  private static buildRecommendations(
    progressSummaries: ProgressSummary[],
    assignments: any[],
    learningProfile: any
  ) {
    // Identify next focus areas
    const next_focus_areas = progressSummaries
      .filter(s => s.completion_percentage < 70)
      .sort((a, b) => a.completion_percentage - b.completion_percentage)
      .slice(0, 3)
      .map(s => `${s.subject} skills`);

    // Suggest tools based on subjects
    const suggested_tools: ToolName[] = [];
    const subjects = progressSummaries.map(s => s.subject);
    
    if (subjects.includes('Math')) suggested_tools.push('MasterToolInterface');
    if (subjects.includes('Science')) suggested_tools.push('MasterToolInterface');
    if (subjects.includes('ELA')) suggested_tools.push('MasterToolInterface');

    // Optimal session length
    const optimal_session_length = learningProfile.preferred_learning_time;

    // Challenge level adjustment
    const avgCompletion = progressSummaries.reduce((sum, s) => sum + s.completion_percentage, 0) / Math.max(1, progressSummaries.length);
    let challenge_level_adjustment = 0;
    
    if (avgCompletion > 80) challenge_level_adjustment = 1; // Increase challenge
    else if (avgCompletion < 40) challenge_level_adjustment = -1; // Decrease challenge

    return {
      next_focus_areas,
      suggested_tools,
      optimal_session_length,
      challenge_level_adjustment
    };
  }
}

// ================================================================
// INTELLIGENT ASSIGNMENT GENERATION
// ================================================================

export class IntelligentAssignmentGenerator {
  /**
   * Generate assignments using Finn context and recommendations
   */
  static async generateIntelligentAssignments(
    studentId: string,
    grade: Grade,
    requestedMinutes: number = 20,
    targetDate?: string
  ): Promise<ServiceResponse<GeneratedAssignments>> {
    const startTime = Date.now();

    try {
      // Build Finn context
      const contextResult = await FinnContextBuilder.buildStudentContext(studentId, grade);
      if (!contextResult.success || !contextResult.data) {
        throw new Error('Failed to build Finn context');
      }

      const context = contextResult.data;

      // Get Finn recommendations
      const recommendationResult = await FinnRecommendationEngine.generateRecommendations(
        studentId,
        context,
        requestedMinutes
      );

      if (!recommendationResult.success || !recommendationResult.data) {
        throw new Error('Failed to get Finn recommendations');
      }

      const recommendation = recommendationResult.data;

      // Generate assignments using the daily assignment service with Finn context
      const assignmentConfig = {
        student_id: studentId,
        target_date: targetDate || new Date().toISOString().split('T')[0],
        total_minutes: requestedMinutes,
        preferred_subjects: context.learning_goals.focus_subjects,
        difficulty_preference: 'adaptive' as const
      };

      const assignmentResult = await dailyAssignmentService.generateDailyAssignments(
        assignmentConfig,
        context
      );

      if (!assignmentResult.success) {
        throw new Error('Failed to generate assignments');
      }

      // Enhance the result with Finn insights
      const enhancedResult = assignmentResult.data!;
      enhancedResult.recommendations = [
        ...enhancedResult.recommendations,
        `Finn AI Insight: ${recommendation.reasoning}`,
        `Confidence Level: ${Math.round(recommendation.confidence_score * 100)}%`,
        `Expected Success Rate: ${Math.round(recommendation.estimated_success_rate * 100)}%`
      ];

      return ServiceErrorHandler.createSuccessResponse(enhancedResult, startTime);

    } catch (error) {
      const serviceError = ServiceErrorHandler.createError(
        'INTELLIGENT_ASSIGNMENT_ERROR',
        'Failed to generate intelligent assignments',
        error instanceof Error ? error.message : error
      );
      return ServiceErrorHandler.createErrorResponse(serviceError, startTime);
    }
  }
}

// Note: Classes are already exported with 'export class' declarations above

// Performance monitoring registration
PerformanceMonitor.recordMetric('finn_context_build', 0);
PerformanceMonitor.recordMetric('finn_recommendations', 0);
PerformanceMonitor.recordMetric('learning_analytics', 0);
PerformanceMonitor.recordMetric('intelligent_assignments', 0);