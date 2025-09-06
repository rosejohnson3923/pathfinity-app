/**
 * Experience AI Rules Engine
 * Manages rules for the Experience container including interactive learning,
 * engagement mechanics, simulations, and hands-on activities
 */

import { BaseRulesEngine, Rule, RuleContext, RuleResult } from "../core/BaseRulesEngine";

// ============================================================================
// EXPERIENCE CONTEXT DEFINITIONS
// ============================================================================

export interface ExperienceContext extends RuleContext {
  student: {
    id: string;
    grade_level: string;
    engagementLevel?: "low" | "medium" | "high";
    interactionPreference?: "visual" | "auditory" | "kinesthetic";
    attentionSpan?: number; // in minutes
  };
  activity: {
    type: "simulation" | "game" | "interactive" | "experiment" | "project";
    subject: string;
    topic: string;
    duration?: number;
    complexity?: "simple" | "moderate" | "complex";
  };
  career?: {
    id: string;
    name: string;
  };
  companion?: {
    id: string;
    name: string;
  };
  theme?: "light" | "dark";
  interaction?: {
    type: string;
    userActions: string[];
    feedback?: string;
    score?: number;
  };
  environment?: {
    device: "desktop" | "tablet" | "mobile";
    inputMethod: "mouse" | "touch" | "keyboard";
    screenSize?: "small" | "medium" | "large";
  };
}

export interface EngagementRules {
  triggers: Map<string, EngagementTrigger>;
  rewards: EngagementReward[];
  feedback: FeedbackRules;
  pacing: PacingRules;
}

export interface EngagementTrigger {
  id: string;
  condition: string;
  action: string;
  priority: number;
  cooldown?: number; // seconds
}

export interface EngagementReward {
  type: "visual" | "audio" | "haptic" | "points" | "badge";
  trigger: string;
  value: any;
  frequency: "always" | "sometimes" | "rare";
}

export interface FeedbackRules {
  immediate: boolean;
  positive: string[];
  corrective: string[];
  hints: string[];
  celebratory: string[];
  timing: {
    min: number;
    max: number;
  };
}

export interface PacingRules {
  minActivityDuration: number;
  maxActivityDuration: number;
  breakInterval: number;
  difficultyRamp: "gradual" | "stepped" | "adaptive";
}

export interface InteractionRules {
  inputMethods: Map<string, InputMethodRule>;
  gestures: GestureRules;
  accessibility: AccessibilityRules;
}

export interface InputMethodRule {
  method: string;
  enabled: boolean;
  sensitivity: number;
  feedback: "visual" | "audio" | "haptic" | "all";
}

export interface GestureRules {
  drag: boolean;
  pinch: boolean;
  rotate: boolean;
  swipe: boolean;
  tap: boolean;
  doubleTap: boolean;
}

export interface AccessibilityRules {
  voiceControl: boolean;
  largeTargets: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
}

export interface SimulationRules {
  realism: "low" | "medium" | "high";
  physics: boolean;
  causeEffect: boolean;
  sandbox: boolean;
  guided: boolean;
  saveState: boolean;
}

export interface GameMechanics {
  scoreSystem: ScoreSystem;
  progression: ProgressionSystem;
  challenges: ChallengeSystem;
  collaboration: CollaborationRules;
}

export interface ScoreSystem {
  pointsPerAction: Map<string, number>;
  bonusConditions: Map<string, number>;
  penalties: Map<string, number>;
  leaderboard: boolean;
}

export interface ProgressionSystem {
  levels: number;
  unlockables: string[];
  achievements: string[];
  checkpoints: boolean;
}

export interface ChallengeSystem {
  daily: boolean;
  weekly: boolean;
  special: boolean;
  difficulty: "dynamic" | "fixed";
}

export interface CollaborationRules {
  multiplayer: boolean;
  turnBased: boolean;
  cooperative: boolean;
  competitive: boolean;
  roles: string[];
}

// ============================================================================
// EXPERIENCE AI RULES ENGINE
// ============================================================================

export class ExperienceAIRulesEngine extends BaseRulesEngine<ExperienceContext> {
  private engagementRules: EngagementRules;
  private interactionRules: InteractionRules;
  private simulationRules: SimulationRules;
  private gameMechanics: GameMechanics;
  private sessionData: Map<string, SessionData> = new Map();

  constructor() {
    super("ExperienceAIRulesEngine", {
      name: "Experience AI Rules Engine",
      description: "Manages interactive and experiential learning rules"
    });
    
    this.engagementRules = this.initializeEngagementRules();
    this.interactionRules = this.initializeInteractionRules();
    this.simulationRules = this.initializeSimulationRules();
    this.gameMechanics = this.initializeGameMechanics();
  }

  /**
   * Register experience-specific rules
   */
  protected registerRules(): void {
    // Rule: Adapt to engagement level
    this.addRuleInternal({
      id: "adapt_engagement",
      name: "Adapt to Engagement Level",
      priority: 1,
      condition: (context) => !!context.student.engagementLevel,
      action: (context) => this.adaptEngagement(context)
    });

    // Rule: Apply interaction preferences
    this.addRuleInternal({
      id: "apply_interaction",
      name: "Apply Interaction Preferences",
      priority: 2,
      condition: (context) => !!context.student.interactionPreference,
      action: (context) => this.applyInteractionPreferences(context)
    });

    // Rule: Configure simulation
    this.addRuleInternal({
      id: "configure_simulation",
      name: "Configure Simulation Settings",
      priority: 3,
      condition: (context) => context.activity.type === "simulation",
      action: (context) => this.configureSimulation(context)
    });

    // Rule: Setup game mechanics
    this.addRuleInternal({
      id: "setup_game",
      name: "Setup Game Mechanics",
      priority: 4,
      condition: (context) => context.activity.type === "game",
      action: (context) => this.setupGameMechanics(context)
    });

    // Rule: Provide feedback
    this.addRuleInternal({
      id: "provide_feedback",
      name: "Provide Interactive Feedback",
      priority: 5,
      condition: (context) => !!context.interaction,
      action: (context) => this.provideFeedback(context)
    });

    // Rule: Manage pacing
    this.addRuleInternal({
      id: "manage_pacing",
      name: "Manage Activity Pacing",
      priority: 6,
      condition: (context) => !!context.activity.duration,
      action: (context) => this.managePacing(context)
    });

    // Rule: Apply career context
    this.addRuleInternal({
      id: "career_theming",
      name: "Apply Career Theming",
      priority: 7,
      condition: (context) => !!context.career,
      action: (context) => this.applyCareerTheming(context)
    });

    // Rule: Handle device adaptation
    this.addRuleInternal({
      id: "device_adaptation",
      name: "Adapt to Device Capabilities",
      priority: 8,
      condition: (context) => !!context.environment,
      action: (context) => this.adaptToDevice(context)
    });

    // Rule: Track progress
    this.addRuleInternal({
      id: "track_progress",
      name: "Track Experience Progress",
      priority: 9,
      condition: (context) => !!context.interaction,
      action: (context) => this.trackProgress(context)
    });

    // Rule: Generate rewards
    this.addRuleInternal({
      id: "generate_rewards",
      name: "Generate Engagement Rewards",
      priority: 10,
      condition: (context) => context.interaction?.score !== undefined,
      action: (context) => this.generateRewards(context)
    });
  }

  /**
   * Initialize engagement rules
   */
  private initializeEngagementRules(): EngagementRules {
    const triggers = new Map<string, EngagementTrigger>([
      ["achievement", {
        id: "achievement",
        condition: "score > 80",
        action: "celebrate",
        priority: 1,
        cooldown: 5
      }],
      ["struggle", {
        id: "struggle",
        condition: "failures > 3",
        action: "provide_hint",
        priority: 2,
        cooldown: 10
      }],
      ["idle", {
        id: "idle",
        condition: "no_action > 30s",
        action: "prompt_action",
        priority: 3,
        cooldown: 30
      }],
      ["progress", {
        id: "progress",
        condition: "milestone_reached",
        action: "reward",
        priority: 1,
        cooldown: 0
      }]
    ]);

    const rewards: EngagementReward[] = [
      {
        type: "visual",
        trigger: "achievement",
        value: "confetti_animation",
        frequency: "always"
      },
      {
        type: "audio",
        trigger: "achievement",
        value: "success_sound",
        frequency: "always"
      },
      {
        type: "points",
        trigger: "progress",
        value: 10,
        frequency: "always"
      },
      {
        type: "badge",
        trigger: "mastery",
        value: "experience_badge",
        frequency: "sometimes"
      }
    ];

    return {
      triggers,
      rewards,
      feedback: {
        immediate: true,
        positive: [
          "Excellent work!",
          "You're getting it!",
          "Keep going!",
          "Amazing discovery!"
        ],
        corrective: [
          "Try a different approach",
          "Think about it this way...",
          "Let's explore another option"
        ],
        hints: [
          "Look closely at...",
          "What if you tried...",
          "Remember that..."
        ],
        celebratory: [
          "Fantastic!",
          "You did it!",
          "Brilliant!",
          "Outstanding!"
        ],
        timing: {
          min: 0,
          max: 2000 // milliseconds
        }
      },
      pacing: {
        minActivityDuration: 120, // 2 minutes
        maxActivityDuration: 900, // 15 minutes
        breakInterval: 600, // 10 minutes
        difficultyRamp: "adaptive"
      }
    };
  }

  /**
   * Initialize interaction rules
   */
  private initializeInteractionRules(): InteractionRules {
    const inputMethods = new Map<string, InputMethodRule>([
      ["mouse", {
        method: "mouse",
        enabled: true,
        sensitivity: 1.0,
        feedback: "visual"
      }],
      ["touch", {
        method: "touch",
        enabled: true,
        sensitivity: 0.8,
        feedback: "all"
      }],
      ["keyboard", {
        method: "keyboard",
        enabled: true,
        sensitivity: 1.0,
        feedback: "audio"
      }],
      ["voice", {
        method: "voice",
        enabled: false,
        sensitivity: 0.7,
        feedback: "audio"
      }]
    ]);

    return {
      inputMethods,
      gestures: {
        drag: true,
        pinch: true,
        rotate: true,
        swipe: true,
        tap: true,
        doubleTap: true
      },
      accessibility: {
        voiceControl: false,
        largeTargets: false,
        highContrast: false,
        reducedMotion: false,
        screenReader: true
      }
    };
  }

  /**
   * Initialize simulation rules
   */
  private initializeSimulationRules(): SimulationRules {
    return {
      realism: "medium",
      physics: true,
      causeEffect: true,
      sandbox: true,
      guided: true,
      saveState: true
    };
  }

  /**
   * Initialize game mechanics
   */
  private initializeGameMechanics(): GameMechanics {
    const pointsPerAction = new Map<string, number>([
      ["correct_answer", 10],
      ["exploration", 5],
      ["collaboration", 15],
      ["creativity", 20],
      ["speed_bonus", 5]
    ]);

    const bonusConditions = new Map<string, number>([
      ["perfect_score", 50],
      ["no_hints", 20],
      ["first_try", 30],
      ["helping_peer", 25]
    ]);

    const penalties = new Map<string, number>([
      ["wrong_answer", -2],
      ["timeout", -5],
      ["skip", -10]
    ]);

    return {
      scoreSystem: {
        pointsPerAction,
        bonusConditions,
        penalties,
        leaderboard: true
      },
      progression: {
        levels: 10,
        unlockables: [
          "advanced_tools",
          "special_simulations",
          "bonus_experiments",
          "multiplayer_mode"
        ],
        achievements: [
          "first_experiment",
          "master_scientist",
          "creative_solution",
          "team_player"
        ],
        checkpoints: true
      },
      challenges: {
        daily: true,
        weekly: true,
        special: true,
        difficulty: "dynamic"
      },
      collaboration: {
        multiplayer: true,
        turnBased: false,
        cooperative: true,
        competitive: false,
        roles: ["leader", "researcher", "builder", "tester"]
      }
    };
  }

  // Rule action methods

  private adaptEngagement(context: ExperienceContext): RuleResult {
    const { engagementLevel } = context.student;
    const adaptations: any = {
      level: engagementLevel
    };

    switch (engagementLevel) {
      case "low":
        adaptations.strategy = "increase_interactivity";
        adaptations.rewards = "frequent";
        adaptations.feedback = "immediate_positive";
        adaptations.difficulty = "reduced";
        adaptations.visuals = "enhanced";
        break;
      
      case "medium":
        adaptations.strategy = "maintain_momentum";
        adaptations.rewards = "balanced";
        adaptations.feedback = "timely";
        adaptations.difficulty = "appropriate";
        adaptations.visuals = "standard";
        break;
      
      case "high":
        adaptations.strategy = "provide_challenges";
        adaptations.rewards = "achievement_based";
        adaptations.feedback = "strategic";
        adaptations.difficulty = "increased";
        adaptations.visuals = "optional";
        break;
    }

    return {
      success: true,
      data: adaptations
    };
  }

  private applyInteractionPreferences(context: ExperienceContext): RuleResult {
    const { interactionPreference } = context.student;
    const preferences: any = {
      preference: interactionPreference
    };

    switch (interactionPreference) {
      case "visual":
        preferences.emphasis = "graphics_animations";
        preferences.controls = "point_and_click";
        preferences.feedback = "visual_cues";
        preferences.instructions = "illustrated";
        break;
      
      case "auditory":
        preferences.emphasis = "sound_narration";
        preferences.controls = "voice_commands";
        preferences.feedback = "audio_cues";
        preferences.instructions = "spoken";
        break;
      
      case "kinesthetic":
        preferences.emphasis = "hands_on_manipulation";
        preferences.controls = "drag_drop_gestures";
        preferences.feedback = "haptic_response";
        preferences.instructions = "interactive_tutorial";
        break;
    }

    // Apply to interaction rules
    if (interactionPreference === "kinesthetic") {
      this.interactionRules.gestures.drag = true;
      this.interactionRules.gestures.rotate = true;
    }

    return {
      success: true,
      data: preferences
    };
  }

  private configureSimulation(context: ExperienceContext): RuleResult {
    const { grade_level } = context.student;
    const { complexity } = context.activity;
    
    const config: any = {
      ...this.simulationRules
    };

    // Adjust realism based on grade
    const gradeNum = grade_level === "K" ? 0 : parseInt(grade_level);
    if (gradeNum <= 2) {
      config.realism = "low";
      config.physics = false;
      config.guided = true;
    } else if (gradeNum <= 5) {
      config.realism = "medium";
      config.physics = true;
      config.guided = true;
    } else {
      config.realism = "high";
      config.physics = true;
      config.guided = false;
    }

    // Adjust based on complexity
    if (complexity === "simple") {
      config.sandbox = false;
      config.causeEffect = true;
    } else if (complexity === "complex") {
      config.sandbox = true;
      config.causeEffect = true;
      config.saveState = true;
    }

    return {
      success: true,
      data: {
        simulation: config,
        grade_level,
        complexity
      }
    };
  }

  private setupGameMechanics(context: ExperienceContext): RuleResult {
    const mechanics = { ...this.gameMechanics };
    const { grade_level } = context.student;
    
    // Adjust for grade level
    const gradeNum = grade_level === "K" ? 0 : parseInt(grade_level);
    
    if (gradeNum <= 2) {
      // Simplify for younger students
      mechanics.scoreSystem.leaderboard = false;
      mechanics.collaboration.competitive = false;
      mechanics.progression.levels = 5;
      mechanics.challenges.difficulty = "fixed";
    } else if (gradeNum <= 5) {
      // Moderate complexity
      mechanics.collaboration.competitive = true;
      mechanics.progression.levels = 10;
    } else {
      // Full complexity
      mechanics.collaboration.multiplayer = true;
      mechanics.collaboration.roles = ["leader", "researcher", "builder", "tester", "analyst"];
      mechanics.progression.levels = 20;
    }

    return {
      success: true,
      data: {
        mechanics,
        configured: true
      }
    };
  }

  private provideFeedback(context: ExperienceContext): RuleResult {
    const { interaction } = context;
    if (!interaction) {
      return { success: false, error: "No interaction data" };
    }

    const feedbackRules = this.engagementRules.feedback;
    let feedbackType: "positive" | "corrective" | "hint" | "celebratory" = "positive";
    let message = "";

    // Determine feedback type based on score
    if (interaction.score !== undefined) {
      if (interaction.score >= 90) {
        feedbackType = "celebratory";
        message = feedbackRules.celebratory[Math.floor(Math.random() * feedbackRules.celebratory.length)];
      } else if (interaction.score >= 70) {
        feedbackType = "positive";
        message = feedbackRules.positive[Math.floor(Math.random() * feedbackRules.positive.length)];
      } else if (interaction.score >= 50) {
        feedbackType = "corrective";
        message = feedbackRules.corrective[Math.floor(Math.random() * feedbackRules.corrective.length)];
      } else {
        feedbackType = "hint";
        message = feedbackRules.hints[Math.floor(Math.random() * feedbackRules.hints.length)];
      }
    }

    // Apply timing
    const delay = feedbackRules.immediate ? 0 : 
                 Math.random() * (feedbackRules.timing.max - feedbackRules.timing.min) + feedbackRules.timing.min;

    return {
      success: true,
      data: {
        feedback: message,
        type: feedbackType,
        delay,
        score: interaction.score
      }
    };
  }

  private managePacing(context: ExperienceContext): RuleResult {
    const { duration = 0 } = context.activity;
    const pacing = this.engagementRules.pacing;
    const recommendations: string[] = [];

    if (duration < pacing.minActivityDuration) {
      recommendations.push("Activity too short, add more content");
    } else if (duration > pacing.maxActivityDuration) {
      recommendations.push("Activity too long, consider breaking into parts");
    }

    // Check if break is needed
    const session = this.getOrCreateSession(context.student.id);
    const timeSinceBreak = Date.now() - session.lastBreak.getTime();
    
    if (timeSinceBreak > pacing.breakInterval * 1000) {
      recommendations.push("Time for a break!");
      session.lastBreak = new Date();
    }

    // Difficulty ramping
    let nextDifficulty = context.activity.complexity;
    if (pacing.difficultyRamp === "adaptive") {
      if (session.successRate > 0.8) {
        nextDifficulty = "complex";
      } else if (session.successRate < 0.5) {
        nextDifficulty = "simple";
      }
    }

    return {
      success: true,
      data: {
        duration,
        recommendations,
        nextDifficulty,
        breakNeeded: recommendations.includes("Time for a break!")
      }
    };
  }

  private applyCareerTheming(context: ExperienceContext): RuleResult {
    if (!context.career) {
      return { success: false, error: "No career context" };
    }

    const careerThemes: Record<string, any> = {
      "Doctor": {
        simulation: "medical_procedures",
        tools: ["stethoscope", "thermometer", "x-ray"],
        scenarios: ["patient_diagnosis", "emergency_room", "surgery"],
        visuals: { color: "#10B981", icon: "🏥" }
      },
      "Scientist": {
        simulation: "laboratory_experiments",
        tools: ["microscope", "beaker", "bunsen_burner"],
        scenarios: ["chemical_reaction", "biology_lab", "physics_experiment"],
        visuals: { color: "#6366F1", icon: "🔬" }
      },
      "Engineer": {
        simulation: "building_structures",
        tools: ["blueprint", "calculator", "3d_printer"],
        scenarios: ["bridge_design", "robot_building", "circuit_creation"],
        visuals: { color: "#F59E0B", icon: "⚙️" }
      },
      "Artist": {
        simulation: "creative_studio",
        tools: ["paintbrush", "palette", "canvas"],
        scenarios: ["painting", "sculpture", "digital_art"],
        visuals: { color: "#EC4899", icon: "🎨" }
      },
      "Chef": {
        simulation: "kitchen_cooking",
        tools: ["knife", "pan", "oven"],
        scenarios: ["recipe_following", "ingredient_mixing", "plating"],
        visuals: { color: "#EF4444", icon: "👨‍🍳" }
      }
      // Add more careers as needed
    };

    const theme = careerThemes[context.career.name] || careerThemes["Scientist"];

    return {
      success: true,
      data: {
        career: context.career.name,
        theme,
        applied: true
      }
    };
  }

  private adaptToDevice(context: ExperienceContext): RuleResult {
    const { environment } = context;
    if (!environment) {
      return { success: false, error: "No environment data" };
    }

    const adaptations: any = {
      device: environment.device,
      inputMethod: environment.inputMethod
    };

    // Device-specific adaptations
    switch (environment.device) {
      case "mobile":
        adaptations.interface = "touch_optimized";
        adaptations.layout = "vertical";
        adaptations.controls = "large_buttons";
        this.interactionRules.gestures.tap = true;
        this.interactionRules.gestures.swipe = true;
        this.interactionRules.accessibility.largeTargets = true;
        break;
      
      case "tablet":
        adaptations.interface = "hybrid";
        adaptations.layout = "adaptive";
        adaptations.controls = "medium_buttons";
        this.interactionRules.gestures.drag = true;
        this.interactionRules.gestures.pinch = true;
        break;
      
      case "desktop":
        adaptations.interface = "full_featured";
        adaptations.layout = "horizontal";
        adaptations.controls = "standard";
        this.interactionRules.inputMethods.get("keyboard")!.enabled = true;
        this.interactionRules.inputMethods.get("mouse")!.enabled = true;
        break;
    }

    // Screen size adaptations
    if (environment.screenSize === "small") {
      adaptations.contentDensity = "minimal";
      adaptations.fontSize = "large";
    } else if (environment.screenSize === "large") {
      adaptations.contentDensity = "full";
      adaptations.fontSize = "standard";
    }

    return {
      success: true,
      data: adaptations
    };
  }

  private trackProgress(context: ExperienceContext): RuleResult {
    const session = this.getOrCreateSession(context.student.id);
    
    // Update session data
    if (context.interaction) {
      session.interactions++;
      
      if (context.interaction.score !== undefined) {
        session.totalScore += context.interaction.score;
        if (context.interaction.score >= 70) {
          session.successes++;
        }
      }
      
      session.successRate = session.interactions > 0 ? 
                           session.successes / session.interactions : 0;
    }

    // Track activity completion
    if (context.activity) {
      session.activitiesCompleted.add(`${context.activity.type}_${context.activity.topic}`);
    }

    return {
      success: true,
      data: {
        session: {
          interactions: session.interactions,
          successRate: session.successRate,
          totalScore: session.totalScore,
          activitiesCompleted: session.activitiesCompleted.size
        }
      }
    };
  }

  private generateRewards(context: ExperienceContext): RuleResult {
    const rewards: any[] = [];
    const { interaction } = context;
    
    if (!interaction || interaction.score === undefined) {
      return { success: false, error: "No score data" };
    }

    // Check engagement triggers
    this.engagementRules.triggers.forEach((trigger, key) => {
      let conditionMet = false;
      
      switch (key) {
        case "achievement":
          conditionMet = interaction.score > 80;
          break;
        case "progress":
          conditionMet = interaction.score >= 70;
          break;
      }
      
      if (conditionMet) {
        // Find matching rewards
        const matchingRewards = this.engagementRules.rewards.filter(r => r.trigger === key);
        matchingRewards.forEach(reward => {
          if (reward.frequency === "always" || 
              (reward.frequency === "sometimes" && Math.random() > 0.5) ||
              (reward.frequency === "rare" && Math.random() > 0.9)) {
            rewards.push({
              type: reward.type,
              value: reward.value,
              trigger: key
            });
          }
        });
      }
    });

    // Calculate points
    const points = this.calculatePoints(context);
    if (points > 0) {
      rewards.push({
        type: "points",
        value: points,
        trigger: "activity_completion"
      });
    }

    return {
      success: true,
      data: {
        rewards,
        totalPoints: points
      }
    };
  }

  // Helper methods

  private getOrCreateSession(studentId: string): SessionData {
    let session = this.sessionData.get(studentId);
    
    if (!session) {
      session = {
        studentId,
        startTime: new Date(),
        lastBreak: new Date(),
        interactions: 0,
        successes: 0,
        successRate: 0,
        totalScore: 0,
        activitiesCompleted: new Set()
      };
      this.sessionData.set(studentId, session);
    }
    
    return session;
  }

  private calculatePoints(context: ExperienceContext): number {
    let points = 0;
    const scoreSystem = this.gameMechanics.scoreSystem;
    
    if (context.interaction) {
      // Base points
      if (context.interaction.score && context.interaction.score >= 70) {
        points += scoreSystem.pointsPerAction.get("correct_answer") || 0;
      }
      
      // Action points
      context.interaction.userActions.forEach(action => {
        points += scoreSystem.pointsPerAction.get(action) || 0;
      });
      
      // Bonus conditions
      if (context.interaction.score === 100) {
        points += scoreSystem.bonusConditions.get("perfect_score") || 0;
      }
    }
    
    return Math.max(0, points);
  }

  // Public methods

  public getEngagementMetrics(studentId: string): any {
    const session = this.sessionData.get(studentId);
    if (!session) {
      return null;
    }
    
    return {
      sessionDuration: Date.now() - session.startTime.getTime(),
      interactions: session.interactions,
      successRate: session.successRate,
      totalScore: session.totalScore,
      activitiesCompleted: Array.from(session.activitiesCompleted)
    };
  }

  public getRecommendedActivity(context: ExperienceContext): any {
    const { grade_level, engagementLevel, interactionPreference } = context.student;
    
    // Activity recommendations based on profile
    const recommendations: any = {
      type: engagementLevel === "low" ? "game" : 
            engagementLevel === "high" ? "simulation" : "interactive",
      complexity: this.getComplexityForGrade(grade),
      duration: this.engagementRules.pacing.minActivityDuration,
      features: []
    };
    
    if (interactionPreference === "visual") {
      recommendations.features.push("rich_graphics", "animations");
    } else if (interactionPreference === "kinesthetic") {
      recommendations.features.push("drag_drop", "manipulation");
    }
    
    return recommendations;
  }

  private getComplexityForGrade(grade_level: string): "simple" | "moderate" | "complex" {
    const gradeNum = grade_level === "K" ? 0 : parseInt(grade_level);
    if (gradeNum <= 2) return "simple";
    if (gradeNum <= 5) return "moderate";
    return "complex";
  }
}

// Helper interface
interface SessionData {
  studentId: string;
  startTime: Date;
  lastBreak: Date;
  interactions: number;
  successes: number;
  successRate: number;
  totalScore: number;
  activitiesCompleted: Set<string>;
}

// Export singleton instance
export const experienceAIRulesEngine = new ExperienceAIRulesEngine();