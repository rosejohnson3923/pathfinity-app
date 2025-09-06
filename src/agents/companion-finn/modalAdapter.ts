/**
 * Companion Finn Modal Adapter
 * Provides social and emotional support through modals
 */

import { BaseFinnModalAdapter, FinnAgentConfig } from '../base-modal-adapter';
import { ModalTypeEnum } from '../../ai-engine/types';

const COMPANION_CONFIG: FinnAgentConfig = {
  agentId: 'companion-finn',
  agentName: 'Companion Finn',
  defaultContainer: 'EXPERIENCE',
  supportedModalTypes: [
    ModalTypeEnum.SINGLE_SELECT,
    ModalTypeEnum.DISCUSSION,
    ModalTypeEnum.JOURNAL,
    ModalTypeEnum.REFLECTION,
    ModalTypeEnum.MOOD_CHECK,
    ModalTypeEnum.GOAL_SETTING,
    ModalTypeEnum.CELEBRATION,
    ModalTypeEnum.MINDFULNESS
  ],
  personality: {
    tone: 'warm',
    avatar: '/assets/agents/companion-finn.png',
    color: '#EC4899' // Pink
  }
};

export class CompanionFinnModalAdapter extends BaseFinnModalAdapter {
  private emotionalState: any = null;
  private socialConnections: Map<string, any> = new Map();
  private wellbeingHistory: any[] = [];
  private goals: Map<string, any> = new Map();

  constructor() {
    super(COMPANION_CONFIG);
    this.initializeWellbeingProfile();
  }

  /**
   * Initialize student's wellbeing profile
   */
  private initializeWellbeingProfile(): void {
    this.emotionalState = {
      current: 'neutral',
      history: [],
      triggers: new Map(),
      supportStrategies: []
    };
  }

  /**
   * Generate companion content
   */
  protected async generateContent(intent: any, modalType: ModalTypeEnum): Promise<any> {
    // Always check emotional state first
    this.assessEmotionalContext(intent);

    switch (modalType) {
      case ModalTypeEnum.SINGLE_SELECT:
        return this.generateCheckInContent(intent);
      
      case ModalTypeEnum.DISCUSSION:
        return this.generateSocialContent(intent);
      
      case ModalTypeEnum.JOURNAL:
        return this.generateJournalContent(intent);
      
      case ModalTypeEnum.REFLECTION:
        return this.generateReflectionContent(intent);
      
      case ModalTypeEnum.MOOD_CHECK:
        return this.generateMoodCheckContent(intent);
      
      case ModalTypeEnum.GOAL_SETTING:
        return this.generateGoalSettingContent(intent);
      
      case ModalTypeEnum.CELEBRATION:
        return this.generateCelebrationContent(intent);
      
      case ModalTypeEnum.MINDFULNESS:
        return this.generateMindfulnessContent(intent);
      
      default:
        return this.generateDefaultCompanionContent(intent);
    }
  }

  /**
   * Generate check-in content
   */
  private generateCheckInContent(intent: any): any {
    const timeOfDay = this.getTimeOfDay();
    const recentActivity = this.getRecentActivity();
    
    return {
      title: "💗 How are you feeling?",
      greeting: this.getPersonalizedGreeting(timeOfDay),
      question: "How has your day been so far?",
      options: [
        {
          id: 'great',
          content: '😊 Great!',
          emoji: '🌟',
          response: "That's wonderful! Let's keep the positive energy going!"
        },
        {
          id: 'good',
          content: '🙂 Pretty good',
          emoji: '👍',
          response: "Glad to hear things are going well!"
        },
        {
          id: 'okay',
          content: '😐 Okay',
          emoji: '💫',
          response: "Some days are like that. I'm here if you need support!"
        },
        {
          id: 'struggling',
          content: '😔 Not so great',
          emoji: '🤗',
          response: "I'm sorry you're having a tough time. Let's work through this together."
        },
        {
          id: 'needhelp',
          content: '😟 I need help',
          emoji: '💪',
          response: "I'm here for you. Let's figure out how to help you feel better."
        }
      ],
      followUp: {
        positive: this.getPositiveFollowUp(),
        neutral: this.getNeutralFollowUp(),
        supportive: this.getSupportiveFollowUp()
      },
      context: {
        lastCheckIn: this.getLastCheckIn(),
        recentMood: this.getRecentMoodTrend(),
        suggestion: this.getMoodBasedSuggestion()
      }
    };
  }

  /**
   * Generate social content
   */
  private generateSocialContent(intent: any): any {
    return {
      title: "👥 Connect & Share",
      prompt: "Let's practice social skills together!",
      scenario: this.generateSocialScenario(),
      discussion: {
        topic: "Working Together",
        starterQuestions: [
          "How do you like to work with others?",
          "What makes a good team member?",
          "How can we help each other succeed?",
          "What's your favorite way to collaborate?"
        ],
        roles: this.assignDiscussionRoles(),
        guidelines: [
          "Listen actively to others",
          "Share your thoughts kindly",
          "Respect different opinions",
          "Build on each other's ideas"
        ]
      },
      activities: {
        icebreaker: this.getIcebreaker(),
        teamChallenge: this.getTeamChallenge(),
        shareCelebration: this.getShareActivity()
      },
      skills: {
        focus: this.getSocialSkillFocus(),
        practice: this.getSocialPractice(),
        reflection: this.getSocialReflection()
      },
      connections: {
        peers: this.suggestPeerConnections(),
        groups: this.suggestGroups(),
        mentors: this.suggestMentors()
      }
    };
  }

  /**
   * Generate journal content
   */
  private generateJournalContent(intent: any): any {
    const prompt = this.generateJournalPrompt();
    
    return {
      title: "📔 My Journal",
      date: new Date().toLocaleDateString(),
      prompt: prompt,
      type: 'reflection',
      sections: [
        {
          name: 'Today\'s Thoughts',
          placeholder: 'What\'s on your mind today?',
          minLength: 50,
          private: true
        },
        {
          name: 'Gratitude',
          placeholder: 'What are you grateful for?',
          suggestions: this.getGratitudeSuggestions(),
          minItems: 3
        },
        {
          name: 'Challenges',
          placeholder: 'What challenges did you face?',
          supportPrompts: this.getChallengePrompts()
        },
        {
          name: 'Wins',
          placeholder: 'What went well today?',
          celebration: true
        }
      ],
      mood: {
        tracker: true,
        emotions: this.getEmotionOptions(),
        intensity: [1, 2, 3, 4, 5]
      },
      tools: {
        voiceToText: true,
        drawing: true,
        stickers: this.getJournalStickers(),
        backgrounds: this.getJournalBackgrounds()
      },
      privacy: {
        level: 'private',
        sharing: 'optional',
        encryption: true
      },
      prompts: {
        creative: this.getCreativePrompts(),
        reflective: this.getReflectivePrompts(),
        growth: this.getGrowthPrompts()
      }
    };
  }

  /**
   * Generate reflection content
   */
  private generateReflectionContent(intent: any): any {
    const topic = this.extractReflectionTopic(intent);
    
    return {
      title: "🌟 Reflection Time",
      topic: topic,
      guidedReflection: {
        introduction: this.getReflectionIntro(topic),
        questions: [
          "What did you learn today?",
          "How did you grow?",
          "What surprised you?",
          "What would you do differently?",
          "What are you proud of?"
        ],
        deeperThinking: [
          "How does this connect to other things you know?",
          "Why is this important to you?",
          "How will you use what you learned?",
          "What questions do you still have?"
        ]
      },
      tools: {
        mindMap: true,
        timeline: true,
        emotionWheel: true,
        growthChart: true
      },
      perspectives: {
        self: "How do I see this?",
        others: "How might others see this?",
        future: "How will I see this in the future?"
      },
      actionPlanning: {
        enabled: true,
        template: this.getActionTemplate(),
        goals: this.suggestReflectionGoals(topic)
      },
      sharing: {
        optional: true,
        formats: ['text', 'audio', 'video'],
        audience: ['private', 'teacher', 'class', 'family']
      }
    };
  }

  /**
   * Generate mood check content
   */
  private generateMoodCheckContent(intent: any): any {
    return {
      title: "🌈 Mood Check-In",
      greeting: "Let's see how you're doing!",
      visualization: 'emotion-wheel',
      emotions: {
        primary: [
          { name: 'Happy', color: '#FFD700', emoji: '😊' },
          { name: 'Sad', color: '#4169E1', emoji: '😢' },
          { name: 'Angry', color: '#FF4500', emoji: '😠' },
          { name: 'Scared', color: '#9370DB', emoji: '😨' },
          { name: 'Excited', color: '#FF69B4', emoji: '🤩' },
          { name: 'Calm', color: '#20B2AA', emoji: '😌' }
        ],
        secondary: this.getSecondaryEmotions(),
        intensity: {
          scale: [1, 2, 3, 4, 5],
          labels: ['A little', 'Somewhat', 'Moderate', 'Very', 'Extremely']
        }
      },
      triggers: {
        prompt: "What made you feel this way?",
        options: this.getCommonTriggers(),
        custom: true
      },
      coping: {
        strategies: this.getCopingStrategies(),
        activities: this.getSoothingActivities(),
        resources: this.getSupportResources()
      },
      tracking: {
        history: this.getMoodHistory(),
        patterns: this.identifyMoodPatterns(),
        insights: this.generateMoodInsights()
      },
      support: {
        immediate: this.needsImmediateSupport(),
        resources: this.getSupportContacts(),
        activities: this.getMoodBoostingActivities()
      }
    };
  }

  /**
   * Generate goal setting content
   */
  private generateGoalSettingContent(intent: any): any {
    return {
      title: "🎯 My Goals",
      introduction: "Let's set some goals together!",
      goalTypes: [
        { type: 'learning', icon: '📚', description: 'Academic goals' },
        { type: 'personal', icon: '🌱', description: 'Personal growth' },
        { type: 'social', icon: '👥', description: 'Friendship & social' },
        { type: 'creative', icon: '🎨', description: 'Creative expression' },
        { type: 'health', icon: '💪', description: 'Health & wellness' }
      ],
      framework: {
        method: 'SMART',
        components: {
          specific: 'What exactly do you want to achieve?',
          measurable: 'How will you know when you\'ve reached it?',
          achievable: 'Is this goal realistic for you?',
          relevant: 'Why is this important to you?',
          timebound: 'When do you want to achieve this?'
        }
      },
      planning: {
        steps: this.generateActionSteps(),
        milestones: this.createMilestones(),
        obstacles: this.identifyPotentialObstacles(),
        support: this.identifySupport()
      },
      visualization: {
        enabled: true,
        tools: ['vision board', 'progress tracker', 'milestone map'],
        celebration: this.planCelebrations()
      },
      tracking: {
        checkIns: 'weekly',
        progress: this.getProgressVisualization(),
        adjustments: true,
        reflection: true
      },
      motivation: {
        quotes: this.getMotivationalQuotes(),
        rewards: this.suggestRewards(),
        accountability: this.setupAccountability()
      }
    };
  }

  /**
   * Generate celebration content
   */
  private generateCelebrationContent(intent: any): any {
    const achievement = this.identifyAchievement(intent);
    
    return {
      title: "🎉 Celebration Time!",
      achievement: achievement,
      message: this.getCelebrationMessage(achievement),
      animation: 'confetti',
      effects: {
        sound: '/sounds/celebration.mp3',
        visual: 'fireworks',
        duration: 5000
      },
      recognition: {
        badge: this.generateBadge(achievement),
        certificate: this.generateCertificate(achievement),
        points: this.awardPoints(achievement)
      },
      sharing: {
        enabled: true,
        platforms: ['class', 'family', 'portfolio'],
        message: this.generateShareMessage(achievement)
      },
      reflection: {
        prompt: "How does this achievement make you feel?",
        questions: [
          "What helped you succeed?",
          "Who supported you?",
          "What did you learn?",
          "What's next?"
        ]
      },
      next: {
        suggestion: this.suggestNextChallenge(achievement),
        goals: this.suggestNewGoals(achievement),
        encouragement: this.getEncouragementMessage()
      },
      memories: {
        snapshot: true,
        journal: true,
        portfolio: true,
        timestamp: new Date()
      }
    };
  }

  /**
   * Generate mindfulness content
   */
  private generateMindfulnessContent(intent: any): any {
    const activity = this.selectMindfulnessActivity();
    
    return {
      title: "🧘 Mindful Moment",
      activity: activity,
      duration: this.getMindfulnessDuration(),
      guidance: {
        introduction: this.getMindfulnessIntro(activity),
        steps: this.getMindfulnessSteps(activity),
        audio: this.getMindfulnessAudio(activity)
      },
      exercises: {
        breathing: {
          pattern: '4-7-8',
          visual: 'expanding-circle',
          instructions: [
            "Breathe in for 4 counts",
            "Hold for 7 counts",
            "Breathe out for 8 counts",
            "Repeat 3 times"
          ]
        },
        bodySccan: {
          areas: ['head', 'shoulders', 'arms', 'chest', 'belly', 'legs', 'feet'],
          duration: 60,
          guidance: 'audio'
        },
        visualization: {
          scene: this.getVisualizationScene(),
          sensory: ['sight', 'sound', 'smell', 'touch'],
          narrative: this.getVisualizationNarrative()
        },
        gratitude: {
          prompts: this.getGratitudePrompts(),
          sharing: 'optional',
          journal: true
        }
      },
      environment: {
        background: this.getMindfulBackground(),
        music: this.getMindfulMusic(),
        timer: true,
        doNotDisturb: true
      },
      completion: {
        reflection: "How do you feel now?",
        mood: this.postMindfulnessMood(),
        badge: 'mindful-moment',
        streak: this.updateMindfulnessStreak()
      }
    };
  }

  /**
   * Generate default companion content
   */
  private generateDefaultCompanionContent(intent: any): any {
    return {
      title: "💖 Your Learning Companion",
      greeting: this.getWarmGreeting(),
      question: "What would you like to explore together?",
      options: [
        {
          id: 'checkin',
          content: '🌈 Daily Check-In',
          description: 'Share how you\'re feeling'
        },
        {
          id: 'journal',
          content: '📔 Write in Journal',
          description: 'Express your thoughts'
        },
        {
          id: 'goals',
          content: '🎯 Set Goals',
          description: 'Plan your success'
        },
        {
          id: 'mindful',
          content: '🧘 Mindful Moment',
          description: 'Take a calming break'
        },
        {
          id: 'celebrate',
          content: '🎉 Celebrate Wins',
          description: 'Recognize your achievements'
        },
        {
          id: 'connect',
          content: '👥 Connect with Others',
          description: 'Build friendships'
        }
      ],
      status: {
        mood: this.getCurrentMood(),
        energy: this.getEnergyLevel(),
        streak: this.getCheckInStreak(),
        recentWin: this.getRecentAchievement()
      },
      suggestions: this.getPersonalizedSuggestions(),
      encouragement: this.getDailyEncouragement()
    };
  }

  // Helper methods
  private assessEmotionalContext(intent: any): void {
    const input = intent.originalInput.toLowerCase();
    const emotionalIndicators = {
      positive: ['happy', 'excited', 'great', 'awesome', 'wonderful'],
      negative: ['sad', 'angry', 'upset', 'frustrated', 'worried'],
      neutral: ['okay', 'fine', 'alright']
    };
    
    for (const [emotion, indicators] of Object.entries(emotionalIndicators)) {
      if (indicators.some(indicator => input.includes(indicator))) {
        this.emotionalState.current = emotion;
        break;
      }
    }
  }

  private getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  private getPersonalizedGreeting(timeOfDay: string): string {
    const greetings = {
      morning: "Good morning, sunshine! ☀️",
      afternoon: "Hey there! Hope your day is going well! 🌟",
      evening: "Good evening! How was your day? 🌙"
    };
    return greetings[timeOfDay] || "Hello, friend! 💖";
  }

  private getWarmGreeting(): string {
    const greetings = [
      "Hey there, amazing human! 💫",
      "So glad you're here! 🌟",
      "Welcome back, friend! 💖",
      "Ready for something wonderful? ✨"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  private getCurrentMood(): string {
    return this.emotionalState.current || 'neutral';
  }

  private getEnergyLevel(): number {
    // Calculate based on recent activity and time of day
    return 75; // placeholder
  }

  private getCheckInStreak(): number {
    // Calculate consecutive check-ins
    return 5; // placeholder
  }

  private getRecentAchievement(): string {
    return "Completed Math Challenge! 🏆";
  }

  private getPersonalizedSuggestions(): string[] {
    const mood = this.emotionalState.current;
    if (mood === 'positive') {
      return [
        "Your energy is great - try a creative project!",
        "Share your positivity with a friend!",
        "Set a new exciting goal!"
      ];
    } else if (mood === 'negative') {
      return [
        "Try a mindfulness exercise to feel better",
        "Write in your journal about your feelings",
        "Take a break with something you enjoy"
      ];
    }
    return [
      "Check in with how you're feeling",
      "Set a small goal for today",
      "Connect with a friend or classmate"
    ];
  }

  private getDailyEncouragement(): string {
    const encouragements = [
      "You're capable of amazing things! 🌟",
      "Every day is a new opportunity to grow! 🌱",
      "Your kindness makes the world better! 💖",
      "Believe in yourself - I believe in you! 💪",
      "You're exactly where you need to be! ✨"
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  private generateJournalPrompt(): string {
    const prompts = [
      "What made you smile today?",
      "Describe a moment when you felt proud",
      "What's something new you learned?",
      "Who made a difference in your day?",
      "What are you looking forward to?"
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  private getGratitudeSuggestions(): string[] {
    return [
      "A person who helped you",
      "Something beautiful you saw",
      "A skill you're developing",
      "A moment of peace",
      "Something that made you laugh"
    ];
  }

  private getEmotionOptions(): string[] {
    return ['Happy', 'Calm', 'Excited', 'Worried', 'Sad', 'Frustrated', 'Proud', 'Curious'];
  }

  private getMoodHistory(): any[] {
    return this.wellbeingHistory.slice(-7); // Last 7 days
  }

  private identifyMoodPatterns(): any {
    return {
      trend: 'improving',
      triggers: ['morning', 'after_lunch'],
      bestTime: 'afternoon'
    };
  }

  private generateMoodInsights(): string[] {
    return [
      "You tend to feel most energetic in the afternoon",
      "Physical activity helps boost your mood",
      "You feel calmer after journaling"
    ];
  }

  private getMotivationalQuotes(): string[] {
    return [
      "Small steps lead to big changes",
      "You are stronger than you think",
      "Progress, not perfection",
      "Every expert was once a beginner",
      "Your potential is endless"
    ];
  }

  /**
   * Track wellbeing
   */
  public trackWellbeing(mood: string, energy: number): void {
    this.wellbeingHistory.push({
      date: new Date(),
      mood,
      energy,
      context: this.getCurrentContext()
    });
    
    // Keep only last 30 days
    if (this.wellbeingHistory.length > 30) {
      this.wellbeingHistory.shift();
    }
  }

  /**
   * Set and track goals
   */
  public setGoal(goal: any): void {
    const goalId = `goal-${Date.now()}`;
    this.goals.set(goalId, {
      ...goal,
      created: new Date(),
      status: 'active',
      progress: 0
    });
  }

  /**
   * Celebrate achievement
   */
  public celebrateAchievement(achievement: string): void {
    this.addToHistory('system', `Celebrating: ${achievement}`);
    // Trigger celebration modal
  }

  private getCurrentContext(): any {
    return {
      timeOfDay: this.getTimeOfDay(),
      recentActivity: this.getRecentActivity(),
      socialContext: this.getSocialContext()
    };
  }

  private getRecentActivity(): string {
    // Get from activity tracker
    return 'completed_lesson';
  }

  private getSocialContext(): string {
    // Determine if in group or individual mode
    return 'individual';
  }
}

// Singleton instance
export const companionFinn = new CompanionFinnModalAdapter();

// Add missing modal types
declare module '../../ai-engine/types' {
  export enum ModalTypeEnum {
    JOURNAL = 'JournalModal',
    REFLECTION = 'ReflectionModal',
    MOOD_CHECK = 'MoodCheckModal',
    GOAL_SETTING = 'GoalSettingModal',
    CELEBRATION = 'CelebrationModal',
    MINDFULNESS = 'MindfulnessModal'
  }
}