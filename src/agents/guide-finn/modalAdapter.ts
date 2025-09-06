/**
 * Guide Finn Modal Adapter
 * Provides navigation and orientation through modals
 */

import { BaseFinnModalAdapter, FinnAgentConfig } from '../base-modal-adapter';
import { ModalTypeEnum } from '../../ai-engine/types';

const GUIDE_CONFIG: FinnAgentConfig = {
  agentId: 'guide-finn',
  agentName: 'Guide Finn',
  defaultContainer: 'LEARN',
  supportedModalTypes: [
    ModalTypeEnum.SINGLE_SELECT,
    ModalTypeEnum.HOTSPOT,
    ModalTypeEnum.TIMELINE,
    ModalTypeEnum.MATRIX,
    ModalTypeEnum.HELP,
    ModalTypeEnum.ONBOARDING,
    ModalTypeEnum.TUTORIAL,
    ModalTypeEnum.ROADMAP
  ],
  personality: {
    tone: 'friendly',
    avatar: '/assets/agents/guide-finn.png',
    color: '#14B8A6' // Teal
  }
};

export class GuideFinnModalAdapter extends BaseFinnModalAdapter {
  private userJourney: any[] = [];
  private currentLocation: string = 'home';
  private visitedLocations: Set<string> = new Set();
  private learningPath: any = null;

  constructor() {
    super(GUIDE_CONFIG);
    this.initializeLearningPath();
  }

  /**
   * Initialize user's learning path
   */
  private initializeLearningPath(): void {
    this.learningPath = {
      currentLevel: 1,
      completedModules: [],
      nextMilestone: 'Complete Basic Skills',
      progress: 0,
      achievements: []
    };
  }

  /**
   * Generate navigation content
   */
  protected async generateContent(intent: any, modalType: ModalTypeEnum): Promise<any> {
    switch (modalType) {
      case ModalTypeEnum.SINGLE_SELECT:
        return this.generateNavigationMenuContent(intent);
      
      case ModalTypeEnum.HOTSPOT:
        return this.generateInteractiveMapContent(intent);
      
      case ModalTypeEnum.TIMELINE:
        return this.generateLearningPathContent(intent);
      
      case ModalTypeEnum.MATRIX:
        return this.generateProgressDashboardContent(intent);
      
      case ModalTypeEnum.HELP:
        return this.generateContextualHelpContent(intent);
      
      case ModalTypeEnum.ONBOARDING:
        return this.generateOnboardingContent(intent);
      
      case ModalTypeEnum.TUTORIAL:
        return this.generateTutorialContent(intent);
      
      case ModalTypeEnum.ROADMAP:
        return this.generateRoadmapContent(intent);
      
      default:
        return this.generateDefaultNavigationContent(intent);
    }
  }

  /**
   * Generate navigation menu content
   */
  private generateNavigationMenuContent(intent: any): any {
    const context = this.getCurrentContext();
    
    return {
      title: "🧭 Where would you like to go?",
      currentLocation: this.currentLocation,
      breadcrumb: this.getBreadcrumb(),
      options: this.getNavigationOptions(context),
      quickAccess: {
        recent: this.getRecentLocations(),
        favorites: this.getFavoriteLocations(),
        recommended: this.getRecommendedDestinations()
      },
      map: {
        showMiniMap: true,
        currentPosition: this.currentLocation,
        availablePaths: this.getAvailablePaths()
      },
      guidance: {
        hint: this.getNavigationHint(),
        nextStep: this.getSuggestedNextStep(),
        progress: this.learningPath.progress
      },
      shortcuts: this.getKeyboardShortcuts()
    };
  }

  /**
   * Generate interactive map content
   */
  private generateInteractiveMapContent(intent: any): any {
    return {
      title: "🗺️ Learning Journey Map",
      mapType: 'interactive',
      image: '/assets/maps/learning-journey.svg',
      hotspots: this.generateMapHotspots(),
      regions: [
        {
          id: 'basics',
          name: 'Foundation Valley',
          status: this.getRegionStatus('basics'),
          description: 'Master the fundamentals',
          color: '#10B981'
        },
        {
          id: 'intermediate',
          name: 'Skill Mountains',
          status: this.getRegionStatus('intermediate'),
          description: 'Build your expertise',
          color: '#3B82F6'
        },
        {
          id: 'advanced',
          name: 'Mastery Peaks',
          status: this.getRegionStatus('advanced'),
          description: 'Achieve excellence',
          color: '#8B5CF6'
        },
        {
          id: 'projects',
          name: 'Creation Islands',
          status: this.getRegionStatus('projects'),
          description: 'Apply your knowledge',
          color: '#F59E0B'
        }
      ],
      legend: {
        completed: { icon: '✅', label: 'Completed' },
        inProgress: { icon: '🔄', label: 'In Progress' },
        locked: { icon: '🔒', label: 'Locked' },
        available: { icon: '🔓', label: 'Available' }
      },
      navigation: {
        zoom: true,
        pan: true,
        fastTravel: this.getUnlockedFastTravelPoints()
      },
      playerStatus: {
        level: this.learningPath.currentLevel,
        experience: this.getExperiencePoints(),
        badges: this.getEarnedBadges()
      }
    };
  }

  /**
   * Generate learning path content
   */
  private generateLearningPathContent(intent: any): any {
    const pathway = this.getPersonalizedPathway();
    
    return {
      title: "📈 Your Learning Path",
      pathName: pathway.name,
      description: pathway.description,
      timeline: {
        current: this.getCurrentMilestone(),
        upcoming: this.getUpcomingMilestones(),
        completed: this.getCompletedMilestones(),
        estimated: this.getEstimatedCompletion()
      },
      modules: pathway.modules.map(module => ({
        id: module.id,
        name: module.name,
        status: this.getModuleStatus(module.id),
        duration: module.duration,
        difficulty: module.difficulty,
        prerequisites: module.prerequisites,
        skills: module.skills,
        locked: !this.isModuleUnlocked(module.id)
      })),
      progress: {
        overall: this.learningPath.progress,
        currentModule: this.getCurrentModuleProgress(),
        streak: this.getLearningStreak(),
        pace: this.getLearningPace()
      },
      adaptations: {
        suggestions: this.getPathAdaptations(),
        alternatives: this.getAlternativePaths(),
        skipOptions: this.getSkipOptions()
      },
      milestones: {
        next: this.learningPath.nextMilestone,
        rewards: this.getMilestoneRewards(),
        celebration: this.shouldCelebrate()
      }
    };
  }

  /**
   * Generate progress dashboard content
   */
  private generateProgressDashboardContent(intent: any): any {
    return {
      title: "📊 Progress Overview",
      layout: 'dashboard',
      matrix: {
        rows: ['Skills', 'Projects', 'Assessments', 'Activities'],
        columns: ['Completed', 'In Progress', 'Upcoming', 'Total'],
        data: this.getProgressMatrixData()
      },
      statistics: {
        totalTime: this.getTotalLearningTime(),
        sessionsCompleted: this.getSessionCount(),
        averageScore: this.getAverageScore(),
        improvement: this.getImprovementRate()
      },
      achievements: {
        recent: this.getRecentAchievements(),
        upcoming: this.getUpcomingAchievements(),
        rare: this.getRareAchievements()
      },
      skills: {
        mastered: this.getMasteredSkills(),
        developing: this.getDevelopingSkills(),
        recommended: this.getRecommendedSkills()
      },
      visualizations: {
        progressChart: this.generateProgressChart(),
        skillRadar: this.generateSkillRadar(),
        activityHeatmap: this.generateActivityHeatmap()
      },
      insights: this.generateLearningInsights(),
      recommendations: this.generatePersonalizedRecommendations()
    };
  }

  /**
   * Generate contextual help content
   */
  private generateContextualHelpContent(intent: any): any {
    const helpContext = this.identifyHelpContext(intent);
    
    return {
      title: "💡 Here to Help!",
      context: helpContext,
      helpType: this.determineHelpType(helpContext),
      solutions: {
        immediate: this.getImmediateSolutions(helpContext),
        stepByStep: this.getStepByStepGuide(helpContext),
        alternatives: this.getAlternativeApproaches(helpContext)
      },
      resources: {
        articles: this.getHelpArticles(helpContext),
        videos: this.getHelpVideos(helpContext),
        examples: this.getHelpExamples(helpContext)
      },
      navigation: {
        whereYouAre: this.currentLocation,
        howYouGotHere: this.getNavigationHistory(),
        whereToGoNext: this.getSuggestedDestinations()
      },
      troubleshooting: {
        commonIssues: this.getCommonIssues(helpContext),
        diagnostics: this.runDiagnostics(),
        fixes: this.getSuggestedFixes()
      },
      support: {
        selfHelp: true,
        peerHelp: this.isPeerHelpAvailable(),
        expertHelp: this.isExpertHelpAvailable(),
        contactOptions: this.getContactOptions()
      }
    };
  }

  /**
   * Generate onboarding content
   */
  private generateOnboardingContent(intent: any): any {
    const step = this.getCurrentOnboardingStep();
    
    return {
      title: "🎉 Welcome to Your Learning Journey!",
      step: step,
      totalSteps: 5,
      content: this.getOnboardingContent(step),
      interactive: {
        tryIt: this.getInteractiveTutorial(step),
        practice: this.getPracticeActivity(step),
        explore: this.getExplorationOptions(step)
      },
      personalization: {
        questions: this.getPersonalizationQuestions(step),
        preferences: this.collectPreferences(step),
        goals: this.setLearningGoals(step)
      },
      progress: {
        completed: this.getCompletedOnboardingSteps(),
        current: step,
        remaining: this.getRemainingOnboardingSteps()
      },
      tips: this.getOnboardingTips(step),
      skipOption: step > 1,
      celebration: step === 5
    };
  }

  /**
   * Generate tutorial content
   */
  private generateTutorialContent(intent: any): any {
    const feature = this.identifyFeatureToLearn(intent);
    
    return {
      title: `📖 How to Use ${feature}`,
      feature: feature,
      difficulty: this.getTutorialDifficulty(feature),
      steps: this.generateTutorialSteps(feature),
      interactive: {
        sandbox: this.provideSandbox(feature),
        guided: this.provideGuidedMode(feature),
        hints: this.provideTutorialHints(feature)
      },
      demonstration: {
        video: this.getTutorialVideo(feature),
        animation: this.getTutorialAnimation(feature),
        screenshots: this.getTutorialScreenshots(feature)
      },
      practice: {
        exercises: this.getTutorialExercises(feature),
        challenges: this.getTutorialChallenges(feature),
        validation: true
      },
      reference: {
        quickGuide: this.getQuickReference(feature),
        glossary: this.getFeatureGlossary(feature),
        faqs: this.getFeatureFAQs(feature)
      },
      completion: {
        badge: this.getTutorialBadge(feature),
        certificate: this.getTutorialCertificate(feature),
        unlocks: this.getFeatureUnlocks(feature)
      }
    };
  }

  /**
   * Generate roadmap content
   */
  private generateRoadmapContent(intent: any): any {
    const career = this.context.career || 'general';
    
    return {
      title: `🛤️ Your ${career} Learning Roadmap`,
      career: career,
      overview: this.getCareerOverview(career),
      stages: [
        {
          name: 'Foundation',
          duration: '3 months',
          skills: this.getFoundationSkills(career),
          projects: this.getFoundationProjects(career),
          status: this.getStageStatus('foundation')
        },
        {
          name: 'Development',
          duration: '6 months',
          skills: this.getDevelopmentSkills(career),
          projects: this.getDevelopmentProjects(career),
          status: this.getStageStatus('development')
        },
        {
          name: 'Specialization',
          duration: '6 months',
          skills: this.getSpecializationSkills(career),
          projects: this.getSpecializationProjects(career),
          status: this.getStageStatus('specialization')
        },
        {
          name: 'Mastery',
          duration: 'Ongoing',
          skills: this.getMasterySkills(career),
          projects: this.getMasteryProjects(career),
          status: this.getStageStatus('mastery')
        }
      ],
      currentPosition: this.getCurrentRoadmapPosition(),
      connections: this.getRoadmapConnections(),
      branches: this.getOptionalBranches(career),
      milestones: this.getCareerMilestones(career),
      resources: {
        courses: this.getRecommendedCourses(career),
        books: this.getRecommendedBooks(career),
        mentors: this.getAvailableMentors(career)
      },
      community: {
        peers: this.getPeersOnSamePath(),
        groups: this.getRelevantGroups(career),
        events: this.getUpcomingEvents(career)
      }
    };
  }

  /**
   * Generate default navigation content
   */
  private generateDefaultNavigationContent(intent: any): any {
    return {
      title: "🧭 Your Learning Navigator",
      greeting: this.getPersonalizedGreeting(),
      question: "How can I guide you today?",
      options: [
        {
          id: 'explore',
          content: '🗺️ Explore Learning Map',
          description: 'See your entire learning journey'
        },
        {
          id: 'next',
          content: '➡️ What\'s Next?',
          description: 'Continue your learning path'
        },
        {
          id: 'progress',
          content: '📊 Check Progress',
          description: 'View your achievements and stats'
        },
        {
          id: 'help',
          content: '💡 Get Help',
          description: 'Find answers and support'
        },
        {
          id: 'customize',
          content: '⚙️ Customize Path',
          description: 'Adjust your learning journey'
        }
      ],
      quickStats: {
        level: this.learningPath.currentLevel,
        progress: `${this.learningPath.progress}%`,
        streak: this.getLearningStreak(),
        nextMilestone: this.learningPath.nextMilestone
      },
      suggestions: this.getDailySuggestions(),
      notifications: this.getPendingNotifications()
    };
  }

  // Helper methods
  private getCurrentContext(): string {
    // Determine current learning context
    return this.currentLocation;
  }

  private getBreadcrumb(): string[] {
    return this.userJourney.slice(-5).map(item => item.location);
  }

  private getNavigationOptions(context: string): any[] {
    return [
      { id: 'learn', content: '📚 Learning Modules', available: true },
      { id: 'practice', content: '✏️ Practice Areas', available: true },
      { id: 'projects', content: '🚀 Projects', available: this.learningPath.currentLevel >= 2 },
      { id: 'community', content: '👥 Community', available: true },
      { id: 'achievements', content: '🏆 Achievements', available: true }
    ];
  }

  private getRecentLocations(): string[] {
    return Array.from(this.visitedLocations).slice(-5);
  }

  private getFavoriteLocations(): string[] {
    // Get user's favorite locations
    return ['Dashboard', 'My Projects', 'Learning Path'];
  }

  private getRecommendedDestinations(): string[] {
    return ['Next Lesson', 'Skill Practice', 'Review Quiz'];
  }

  private getAvailablePaths(): any[] {
    return [
      { from: this.currentLocation, to: 'next-lesson', distance: 1 },
      { from: this.currentLocation, to: 'practice', distance: 2 },
      { from: this.currentLocation, to: 'assessment', distance: 3 }
    ];
  }

  private getNavigationHint(): string {
    return "You're making great progress! Consider reviewing the last topic before moving forward.";
  }

  private getSuggestedNextStep(): string {
    return "Complete the practice exercise to reinforce your learning";
  }

  private generateMapHotspots(): any[] {
    return [
      {
        id: 'start',
        x: 100,
        y: 400,
        label: 'Start Here',
        status: 'completed'
      },
      {
        id: 'current',
        x: 300,
        y: 300,
        label: 'You Are Here',
        status: 'current',
        glow: true
      },
      {
        id: 'next',
        x: 500,
        y: 200,
        label: 'Next Goal',
        status: 'available'
      }
    ];
  }

  private getCurrentOnboardingStep(): number {
    // Get from user state
    return 1;
  }

  private getLearningStreak(): number {
    // Calculate consecutive days of learning
    return 7;
  }

  private getPersonalizedGreeting(): string {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const streak = this.getLearningStreak();
    
    if (streak > 5) {
      return `${timeGreeting}! Amazing ${streak}-day streak! 🔥`;
    }
    return `${timeGreeting}! Ready to explore and learn?`;
  }

  /**
   * Track navigation
   */
  public navigateTo(location: string): void {
    this.userJourney.push({
      location,
      timestamp: new Date(),
      from: this.currentLocation
    });
    this.visitedLocations.add(location);
    this.currentLocation = location;
  }

  /**
   * Update learning progress
   */
  public updateProgress(moduleId: string, progress: number): void {
    if (!this.learningPath.completedModules.includes(moduleId) && progress === 100) {
      this.learningPath.completedModules.push(moduleId);
      this.learningPath.currentLevel = Math.floor(this.learningPath.completedModules.length / 5) + 1;
    }
    this.learningPath.progress = Math.min(100, this.learningPath.progress + progress / 10);
  }
}

// Singleton instance
export const guideFinn = new GuideFinnModalAdapter();

// Add missing modal types
declare module '../../ai-engine/types' {
  export enum ModalTypeEnum {
    ONBOARDING = 'OnboardingModal',
    TUTORIAL = 'TutorialModal',
    ROADMAP = 'RoadmapModal'
  }
}