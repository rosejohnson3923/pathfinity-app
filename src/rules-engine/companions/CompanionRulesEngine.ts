/**
 * AI Companion Rules Engine
 * Manages behavior and evolution of the four core companions:
 * - Finn: The Friendly Guide
 * - Spark: The Creative Innovator  
 * - Harmony: The Supportive Friend
 * - Sage: The Wise Mentor
 * 
 * Companions persist throughout the learning journey and evolve with grade progression
 * and adapt their content based on the student"s chosen career path
 */

import { BaseRulesEngine, Rule, RuleContext, RuleResult } from "../core/BaseRulesEngine";

// ============================================================================
// COMPANION TYPE DEFINITIONS
// ============================================================================

export enum CompanionId {
  FINN = "finn",
  SPARK = "spark",
  HARMONY = "harmony",
  SAGE = "sage"
}

export interface CompanionContext extends RuleContext {
  companion: CompanionId;
  student: {
    id: string;
    grade?: string;
    learningStyle?: string;
    needsEmotionalSupport?: boolean;
    academicLevel?: string;
  };
  career?: {
    id: string;
    name: string;
  };
  currentActivity?: string;
  emotionalState?: string;
  recentPerformance?: number;
  sessionDuration?: number;
  notificationType?: "toast" | "chatbot";
  messageIntent?: string;
}

export interface CompanionProfile {
  id: CompanionId;
  name: string;
  personality: CompanionPersonality;
  visualStyle: CompanionVisualStyle;
  interactionStyle: InteractionStyle;
  specialties: string[];
  gradeAdaptations: Map<string, GradeAdaptation>;
  careerAdaptations: Map<string, CareerAdaptation>;
}

export interface CompanionPersonality {
  traits: string[];
  communicationStyle: string;
  encouragementStyle: string;
  teachingApproach: string;
  emotionalTone: string;
}

export interface CompanionVisualStyle {
  primaryColor: string;
  secondaryColor: string;
  iconSet: string;
  animationStyle: "energetic" | "calm" | "balanced" | "thoughtful";
  visualComplexity: "simple" | "moderate" | "detailed";
}

export interface InteractionStyle {
  greetingStyle: string;
  feedbackPositive: string[];
  feedbackCorrective: string[];
  hintStyle: string;
  celebrationStyle: string;
  motivationStyle: string;
}

export interface GradeAdaptation {
  grade: string;
  vocabularyLevel: "basic" | "intermediate" | "advanced";
  conceptComplexity: "concrete" | "mixed" | "abstract";
  interactionLength: "brief" | "moderate" | "detailed";
  supportLevel: "high" | "medium" | "low";
}

export interface CareerAdaptation {
  career: string;
  vocabulary: string[];
  metaphors: string[];
  examples: string[];
  encouragementPhrases: string[];
  successMessages: string[];
  toastNotifications: ToastNotificationTemplates;
  chatbotResponses: ChatbotResponseTemplates;
}

export interface ToastNotificationTemplates {
  welcome: string[];
  progress: string[];
  achievement: string[];
  reminder: string[];
  encouragement: string[];
}

export interface ChatbotResponseTemplates {
  greeting: string[];
  helpOffered: string[];
  conceptExplanation: string[];
  problemSolving: string[];
  celebration: string[];
}

// ============================================================================
// COMPANION RULES ENGINE
// ============================================================================

export class CompanionRulesEngine extends BaseRulesEngine<CompanionContext> {
  private companions: Map<CompanionId, CompanionProfile> = new Map();
  private activeCompanion: CompanionId | null = null;
  private careerTemplates: Map<string, CareerAdaptation> = new Map();

  constructor() {
    super("CompanionRulesEngine", {
      name: "Companion Rules Engine",
      description: "Manages AI companion behaviors and career adaptations"
    });
    
    this.initializeCareerTemplates();
    this.initializeCompanions();
  }

  /**
   * Register companion-specific rules
   */
  protected registerRules(): void {
    // Rule: Select companion based on student needs
    this.addRuleInternal({
      id: "select_companion",
      name: "Select Appropriate Companion",
      priority: 1,
      condition: (context) => !context.companion,
      action: (context) => this.selectCompanion(context)
    });

    // Rule: Apply career-specific adaptations
    this.addRuleInternal({
      id: "adapt_to_career",
      name: "Adapt to Career Context",
      priority: 2,
      condition: (context) => !!context.career,
      action: (context) => this.adaptToCareer(context)
    });

    // Rule: Adapt interaction to grade level
    this.addRuleInternal({
      id: "adapt_grade_level",
      name: "Adapt to Grade Level",
      priority: 3,
      condition: (context) => !!context.student.grade_level,
      action: (context) => this.adaptToGradeLevel(context)
    });

    // Rule: Generate toast notifications
    this.addRuleInternal({
      id: "generate_toast",
      name: "Generate Toast Notification",
      priority: 4,
      condition: (context) => context.notificationType === "toast",
      action: (context) => this.generateToastNotification(context)
    });

    // Rule: Generate chatbot responses
    this.addRuleInternal({
      id: "generate_chatbot",
      name: "Generate Chatbot Response",
      priority: 5,
      condition: (context) => context.notificationType === "chatbot",
      action: (context) => this.generateChatbotResponse(context)
    });

    // Rule: Adjust based on performance
    this.addRuleInternal({
      id: "performance_adjustment",
      name: "Adjust Based on Performance",
      priority: 6,
      condition: (context) => context.recentPerformance !== undefined,
      action: (context) => this.adjustForPerformance(context)
    });

    // Rule: Emotional state response
    this.addRuleInternal({
      id: "emotional_response",
      name: "Respond to Emotional State",
      priority: 7,
      condition: (context) => !!context.emotionalState,
      action: (context) => this.respondToEmotion(context)
    });

    // Rule: Session duration management
    this.addRuleInternal({
      id: "session_management",
      name: "Manage Session Duration",
      priority: 8,
      condition: (context) => (context.sessionDuration || 0) > 1800000, // 30 minutes
      action: (context) => this.manageLongSession(context)
    });
  }

  /**
   * Initialize career templates for all 15 careers
   */
  private initializeCareerTemplates(): void {
    const careers = [
      "Doctor", "Teacher", "Scientist", "Artist", "Chef", "Athlete",
      "Engineer", "Veterinarian", "Musician", "Writer", "Astronaut",
      "Police Officer", "Firefighter", "Pilot", "Architect"
    ];

    careers.forEach(career => {
      this.careerTemplates.set(career, this.createCareerTemplate(career));
    });
  }

  /**
   * Create career-specific template
   */
  private createCareerTemplate(career: string): CareerAdaptation {
    const templates: Record<string, CareerAdaptation> = {
      "Doctor": {
        career: "Doctor",
        vocabulary: ["patient", "diagnosis", "treatment", "medicine", "health", "stethoscope", "healing"],
        metaphors: ["healing knowledge gaps", "diagnosing problems", "prescribing solutions"],
        examples: ["checking vital signs", "prescribing medicine", "performing surgery", "helping patients"],
        encouragementPhrases: [
          "You're healing your knowledge gaps!",
          "Great diagnosis of that problem!",
          "Your learning is the best medicine!",
          "Dr. Success is on call!"
        ],
        successMessages: [
          "Dr. Success is in the house!",
          "You've cured that challenge!",
          "Prescription for success: filled!",
          "Medical mastery achieved!"
        ],
        toastNotifications: {
          welcome: [
            "Time for your learning checkup!",
            "The doctor will see you now... for learning!",
            "Ready to heal some knowledge gaps?"
          ],
          progress: [
            "Your learning vital signs look great!",
            "Treatment plan is working perfectly!",
            "Recovery to mastery: 75% complete!"
          ],
          achievement: [
            "Diagnosis: You're a learning expert!",
            "Medical degree in {subject} earned!",
            "You've mastered the cure for confusion!"
          ],
          reminder: [
            "Time for your learning appointment!",
            "Don\'t forget your knowledge vitamins!",
            "Regular practice keeps the confusion away!"
          ],
          encouragement: [
            "Every doctor started as a student!",
            "Keep studying, future healer!",
            "Your dedication is the best medicine!"
          ]
        },
        chatbotResponses: {
          greeting: [
            "Hello, future doctor! How can I help you heal your learning today?",
            "Ready for your learning checkup?",
            "Let\'s diagnose what you need to learn!"
          ],
          helpOffered: [
            "Let me prescribe the perfect learning solution!",
            "I\'ll help you cure that confusion!",
            "Time to treat this learning challenge!"
          ],
          conceptExplanation: [
            "Think of it like how a doctor examines symptoms...",
            "Just like diagnosing a patient, we need to look at all the clues...",
            "Imagine you\'re treating this problem like a patient..."
          ],
          problemSolving: [
            "Let\'s examine this problem like a medical case!",
            "What symptoms (clues) do we see?",
            "Time to prescribe a solution!"
          ],
          celebration: [
            "Excellent diagnosis, Doctor!",
            "You've successfully treated that problem!",
            "Medical mastery achieved!"
          ]
        }
      },
      "Teacher": {
        career: "Teacher",
        vocabulary: ["student", "lesson", "classroom", "education", "learning", "knowledge", "curriculum"],
        metaphors: ["guiding minds", "inspiring learning", "shaping futures"],
        examples: ["creating lesson plans", "grading papers", "helping students", "explaining concepts"],
        encouragementPhrases: [
          "You're teaching yourself brilliantly!",
          "What a model student you are!",
          "Your learning sets a great example!",
          "A+ effort!"
        ],
        successMessages: [
          "Gold star performance!",
          "Top of the class!",
          "A+ achievement unlocked!",
          "Honor roll material!"
        ],
        toastNotifications: {
          welcome: [
            "Welcome to today\'s lesson!",
            "Class is in session!",
            "Ready to learn and grow?"
          ],
          progress: [
            "You're making the grade!",
            "Excellent classroom participation!",
            "Your homework is paying off!"
          ],
          achievement: [
            "Honor roll achievement!",
            "Teacher\'s pet status earned!",
            "Valedictorian of {subject}!"
          ],
          reminder: [
            "Don\'t forget your homework!",
            "Time for today's lesson!",
            "The bell is ringing for learning!"
          ],
          encouragement: [
            "Every teacher was once a student!",
            "Keep learning, future educator!",
            "Your dedication inspires others!"
          ]
        },
        chatbotResponses: {
          greeting: [
            "Welcome to class, future teacher!",
            "Ready for today\'s learning adventure?",
            "Let\'s make this a great lesson!"
          ],
          helpOffered: [
            "Let me help you understand this concept!",
            "I\'ll guide you through this lesson!",
            "Time to learn something amazing!"
          ],
          conceptExplanation: [
            "Imagine you\'re teaching this to a friend...",
            "Think of it like organizing a lesson plan...",
            "Just like in a classroom, we start with the basics..."
          ],
          problemSolving: [
            "Let\'s work through this step by step!",
            "What would a good teacher do here?",
            "Time to apply what we\'ve learned!"
          ],
          celebration: [
            "Gold star work!",
            "You've earned an A+!",
            "Outstanding student achievement!"
          ]
        }
      },
      "Scientist": {
        career: "Scientist",
        vocabulary: ["experiment", "hypothesis", "discovery", "research", "data", "observation", "analysis"],
        metaphors: ["discovering truth", "experimenting with ideas", "solving mysteries"],
        examples: ["conducting experiments", "analyzing data", "making discoveries", "testing hypotheses"],
        encouragementPhrases: [
          "Excellent hypothesis testing!",
          "Your experiments are working!",
          "Scientific method in action!",
          "Discovery imminent!"
        ],
        successMessages: [
          "Eureka! Discovery made!",
          "Hypothesis confirmed!",
          "Nobel Prize worthy!",
          "Scientific breakthrough!"
        ],
        toastNotifications: {
          welcome: [
            "Welcome to the learning lab!",
            "Ready to experiment with knowledge?",
            "Time for scientific discovery!"
          ],
          progress: [
            "Experiment progressing nicely!",
            "Data collection successful!",
            "Hypothesis looking good!"
          ],
          achievement: [
            "Scientific breakthrough!",
            "Discovery documented!",
            "Research complete!"
          ],
          reminder: [
            "Time for lab work!",
            "Don\'t forget to record observations!",
            "Daily experiments await!"
          ],
          encouragement: [
            "Every scientist started curious!",
            "Keep questioning, future researcher!",
            "Curiosity leads to discovery!"
          ]
        },
        chatbotResponses: {
          greeting: [
            "Welcome to the lab, future scientist!",
            "Ready to make discoveries?",
            "Let\'s experiment with learning!"
          ],
          helpOffered: [
            "Let\'s test this hypothesis together!",
            "I\'ll help you analyze this data!",
            "Time to apply the scientific method!"
          ],
          conceptExplanation: [
            "Let\'s observe this like a scientist would...",
            "Think of it as an experiment...",
            "What patterns do you notice?"
          ],
          problemSolving: [
            "What\'s our hypothesis?",
            "Let\'s test different solutions!",
            "Time to analyze the results!"
          ],
          celebration: [
            "Brilliant discovery!",
            "Hypothesis proven!",
            "Scientific success!"
          ]
        }
      },
      "Artist": {
        career: "Artist",
        vocabulary: ["canvas", "palette", "creativity", "expression", "composition", "technique", "masterpiece"],
        metaphors: ["painting with knowledge", "sculpting understanding", "creating masterpieces"],
        examples: ["mixing colors", "creating compositions", "expressing ideas", "developing style"],
        encouragementPhrases: [
          "You're painting a masterpiece of knowledge!",
          "Beautiful work of art!",
          "Your creativity is showing!",
          "Artistic genius at work!"
        ],
        successMessages: [
          "Masterpiece completed!",
          "Gallery-worthy performance!",
          "Artistic excellence achieved!",
          "Creative breakthrough!"
        ],
        toastNotifications: {
          welcome: [
            "Time to create learning art!",
            "Ready to paint with knowledge?",
            "Let\'s make a masterpiece!"
          ],
          progress: [
            "Your canvas is taking shape!",
            "Beautiful strokes of genius!",
            "Composition coming together!"
          ],
          achievement: [
            "Masterpiece achieved!",
            "Gallery exhibition ready!",
            "Artistic mastery unlocked!"
          ],
          reminder: [
            "Time to pick up your brush!",
            "Don\'t let your canvas stay blank!",
            "Daily practice makes perfect art!"
          ],
          encouragement: [
            "Every artist started with a single stroke!",
            "Keep creating, future artist!",
            "Your unique vision matters!"
          ]
        },
        chatbotResponses: {
          greeting: [
            "Welcome to the studio, future artist!",
            "Ready to create something beautiful?",
            "Let\'s paint with knowledge!"
          ],
          helpOffered: [
            "Let me help you mix these concepts!",
            "I\'ll guide your creative process!",
            "Time to express your understanding!"
          ],
          conceptExplanation: [
            "Think of it like mixing colors...",
            "Just like composing a painting...",
            "Imagine this as your canvas..."
          ],
          problemSolving: [
            "What\'s your creative vision?",
            "Let\'s sketch out a solution!",
            "Time to add the finishing touches!"
          ],
          celebration: [
            "Beautiful creation!",
            "Masterpiece complete!",
            "Artistic brilliance!"
          ]
        }
      },
      "Chef": {
        career: "Chef",
        vocabulary: ["recipe", "ingredients", "cooking", "flavor", "kitchen", "presentation", "cuisine"],
        metaphors: ["cooking up knowledge", "mixing ideas", "serving success"],
        examples: ["following recipes", "creating dishes", "plating beautifully", "combining flavors"],
        encouragementPhrases: [
          "You're cooking up greatness!",
          "Perfect recipe for success!",
          "Master chef in the making!",
          "Delicious progress!"
        ],
        successMessages: [
          "Five-star performance!",
          "Michelin star earned!",
          "Perfect dish served!",
          "Culinary excellence!"
        ],
        toastNotifications: {
          welcome: [
            "Welcome to the learning kitchen!",
            "Ready to cook up some knowledge?",
            "Time to prepare today's lesson!"
          ],
          progress: [
            "Recipe coming together nicely!",
            "Perfect temperature for learning!",
            "Almost ready to serve!"
          ],
          achievement: [
            "Master chef achievement!",
            "Five-star meal complete!",
            "Recipe perfected!"
          ],
          reminder: [
            "Time to check the oven!",
            "Don\'t let learning burn!",
            "Daily prep work needed!"
          ],
          encouragement: [
            "Every chef started with basics!",
            "Keep cooking, future chef!",
            "Practice makes perfect dishes!"
          ]
        },
        chatbotResponses: {
          greeting: [
            "Welcome to the kitchen, future chef!",
            "Ready to cook up some answers?",
            "Let\'s prepare a feast of knowledge!"
          ],
          helpOffered: [
            "Let me help you with this recipe!",
            "I\'ll guide you through the ingredients!",
            "Time to perfect this dish!"
          ],
          conceptExplanation: [
            "Think of it like following a recipe...",
            "Just like combining ingredients...",
            "Each step builds flavor, like learning!"
          ],
          problemSolving: [
            "What ingredients do we need?",
            "Let\'s follow the recipe step by step!",
            "Time to plate our solution!"
          ],
          celebration: [
            "Delicious success!",
            "Perfect execution, Chef!",
            "Bon appétit!"
          ]
        }
      },
      "Athlete": {
        career: "Athlete",
        vocabulary: ["training", "practice", "competition", "teamwork", "fitness", "goal", "championship"],
        metaphors: ["scoring goals", "winning the game", "training for success"],
        examples: ["practicing drills", "competing in tournaments", "working with teammates", "setting records"],
        encouragementPhrases: [
          "You're in the learning championship!",
          "Training your brain like a pro!",
          "Going for the gold in knowledge!",
          "Champion mindset!"
        ],
        successMessages: [
          "Championship performance!",
          "You scored the winning goal!",
          "Victory lap earned!",
          "Gold medal achievement!"
        ],
        toastNotifications: {
          welcome: [
            "Time to train your brain!",
            "Ready for mental gymnastics?",
            "Let\'s warm up those neurons!"
          ],
          progress: [
            "You're in the lead!",
            "Personal best in progress!",
            "Training is paying off!"
          ],
          achievement: [
            "Gold medal performance!",
            "New record set!",
            "Championship won!"
          ],
          reminder: [
            "Time for practice!",
            "Don\'t skip brain training!",
            "Champions practice daily!"
          ],
          encouragement: [
            "Every champion started as a beginner!",
            "Keep training, future champion!",
            "No pain, no brain gain!"
          ]
        },
        chatbotResponses: {
          greeting: [
            "Ready to train, future champion?",
            "Let\'s get warmed up for learning!",
            "Time to exercise that brain!"
          ],
          helpOffered: [
            "Let me coach you through this!",
            "I\'ll be your learning trainer!",
            "Time for some mental athletics!"
          ],
          conceptExplanation: [
            "Think of it like practicing a new sport move...",
            "Just like training for a game...",
            "Imagine this is a play in your sport..."
          ],
          problemSolving: [
            "Let\'s strategize like a team!",
            "What\'s our game plan here?",
            "Time to execute the play!"
          ],
          celebration: [
            "Champion-level performance!",
            "You've won the gold!",
            "MVP! MVP! MVP!"
          ]
        }
      },
      "Engineer": {
        career: "Engineer",
        vocabulary: ["design", "build", "solution", "structure", "system", "innovation", "blueprint"],
        metaphors: ["building knowledge", "engineering solutions", "constructing understanding"],
        examples: ["designing systems", "solving problems", "building structures", "creating blueprints"],
        encouragementPhrases: [
          "You're engineering success!",
          "Building brilliant solutions!",
          "Structural integrity: perfect!",
          "Innovation in progress!"
        ],
        successMessages: [
          "Engineering marvel complete!",
          "Blueprint executed perfectly!",
          "System operational!",
          "Design excellence achieved!"
        ],
        toastNotifications: {
          welcome: [
            "Time to engineer some solutions!",
            "Ready to build knowledge?",
            "Let\'s design your learning!"
          ],
          progress: [
            "Blueprint taking shape!",
            "Construction progressing well!",
            "Systems coming online!"
          ],
          achievement: [
            "Engineering masterpiece!",
            "Project completed successfully!",
            "Innovation achieved!"
          ],
          reminder: [
            "Time to check the blueprints!",
            "Don\'t forget to test your design!",
            "Daily building continues!"
          ],
          encouragement: [
            "Every engineer started with basics!",
            "Keep building, future engineer!",
            "Great structures take time!"
          ]
        },
        chatbotResponses: {
          greeting: [
            "Welcome to the workshop, future engineer!",
            "Ready to build something amazing?",
            "Let\'s engineer some solutions!"
          ],
          helpOffered: [
            "Let me help you design this solution!",
            "I\'ll guide you through the blueprint!",
            "Time to construct understanding!"
          ],
          conceptExplanation: [
            "Think of it like building a bridge...",
            "Just like designing a system...",
            "Each component connects like this..."
          ],
          problemSolving: [
            "What\'s our design approach?",
            "Let\'s build this step by step!",
            "Time to test our solution!"
          ],
          celebration: [
            "Perfectly engineered!",
            "Blueprint success!",
            "Innovation complete!"
          ]
        }
      },
      "Veterinarian": {
        career: "Veterinarian",
        vocabulary: ["animal", "care", "treatment", "wellness", "diagnosis", "compassion", "healing"],
        metaphors: ["caring for knowledge", "healing confusion", "nurturing understanding"],
        examples: ["examining animals", "providing treatment", "showing compassion", "preventing illness"],
        encouragementPhrases: [
          "You're caring for your learning!",
          "Compassionate problem-solving!",
          "Healing knowledge gaps with care!",
          "Animal-loving excellence!"
        ],
        successMessages: [
          "All patients happy and healthy!",
          "Veterinary excellence achieved!",
          "Perfect care provided!",
          "Healing success!"
        ],
        toastNotifications: {
          welcome: [
            "Time to care for your learning!",
            "Ready to help some knowledge animals?",
            "Let\'s practice compassionate learning!"
          ],
          progress: [
            "Your patients are improving!",
            "Treatment plan working well!",
            "Care level: excellent!"
          ],
          achievement: [
            "Veterinary mastery achieved!",
            "All learning pets healthy!",
            "Compassion award earned!"
          ],
          reminder: [
            "Time for patient rounds!",
            "Don\'t forget to check on progress!",
            "Daily care makes a difference!"
          ],
          encouragement: [
            "Every vet started with love for animals!",
            "Keep caring, future veterinarian!",
            "Compassion drives excellence!"
          ]
        },
        chatbotResponses: {
          greeting: [
            "Welcome to the clinic, future vet!",
            "Ready to help our learning patients?",
            "Let\'s provide some care!"
          ],
          helpOffered: [
            "Let me help you diagnose this!",
            "I\'ll assist with this treatment!",
            "Time to show compassionate care!"
          ],
          conceptExplanation: [
            "Think of it like caring for a patient...",
            "Just like examining an animal...",
            "Gentle understanding is key..."
          ],
          problemSolving: [
            "What symptoms do we observe?",
            "Let\'s provide the right treatment!",
            "Time for healing!"
          ],
          celebration: [
            "Perfect care provided!",
            "Happy and healthy!",
            "Veterinary success!"
          ]
        }
      },
      "Musician": {
        career: "Musician",
        vocabulary: ["melody", "rhythm", "harmony", "composition", "performance", "practice", "symphony"],
        metaphors: ["composing knowledge", "harmonizing ideas", "orchestrating success"],
        examples: ["practicing scales", "composing music", "performing concerts", "creating harmony"],
        encouragementPhrases: [
          "You're composing a masterpiece!",
          "Perfect rhythm of learning!",
          "Harmony in your understanding!",
          "Musical genius emerging!"
        ],
        successMessages: [
          "Standing ovation performance!",
          "Symphony complete!",
          "Perfect pitch achieved!",
          "Encore! Encore!"
        ],
        toastNotifications: {
          welcome: [
            "Time to compose some learning!",
            "Ready to make beautiful music?",
            "Let\'s practice your scales!"
          ],
          progress: [
            "Your melody is taking shape!",
            "Rhythm perfectly on beat!",
            "Harmony achieved!"
          ],
          achievement: [
            "Concert-ready performance!",
            "Symphony mastered!",
            "Musical excellence!"
          ],
          reminder: [
            "Time for daily practice!",
            "Don\'t forget your scales!",
            "Musicians practice every day!"
          ],
          encouragement: [
            "Every musician started with one note!",
            "Keep practicing, future musician!",
            "Music takes dedication!"
          ]
        },
        chatbotResponses: {
          greeting: [
            "Welcome to the concert hall, future musician!",
            "Ready to make some music?",
            "Let\'s compose learning together!"
          ],
          helpOffered: [
            "Let me help you find the right note!",
            "I\'ll guide you through this composition!",
            "Time to create harmony!"
          ],
          conceptExplanation: [
            "Think of it like learning a new song...",
            "Just like finding the right rhythm...",
            "Each part creates harmony..."
          ],
          problemSolving: [
            "What\'s our melody here?",
            "Let\'s find the right tempo!",
            "Time for the finale!"
          ],
          celebration: [
            "Bravo! Bravo!",
            "Perfect performance!",
            "Musical mastery!"
          ]
        }
      },
      "Writer": {
        career: "Writer",
        vocabulary: ["story", "character", "plot", "narrative", "chapter", "creativity", "manuscript"],
        metaphors: ["writing your story", "crafting narratives", "authoring success"],
        examples: ["crafting stories", "developing characters", "editing manuscripts", "publishing books"],
        encouragementPhrases: [
          "You're writing your success story!",
          "Beautiful chapter in progress!",
          "Plot developing perfectly!",
          "Bestseller in the making!"
        ],
        successMessages: [
          "Bestseller achieved!",
          "Chapter complete!",
          "Story masterfully told!",
          "Published and perfect!"
        ],
        toastNotifications: {
          welcome: [
            "Time to write your learning story!",
            "Ready to craft today's chapter?",
            "Let\'s create a narrative!"
          ],
          progress: [
            "Your story is unfolding beautifully!",
            "Plot developing nicely!",
            "Characters coming to life!"
          ],
          achievement: [
            "Manuscript complete!",
            "Bestseller status!",
            "Literary excellence!"
          ],
          reminder: [
            "Time to write today\'s pages!",
            "Don\'t leave your story unfinished!",
            "Daily writing makes great books!"
          ],
          encouragement: [
            "Every writer started with one word!",
            "Keep writing, future author!",
            "Your story matters!"
          ]
        },
        chatbotResponses: {
          greeting: [
            "Welcome to the library, future writer!",
            "Ready to craft your story?",
            "Let\'s write something amazing!"
          ],
          helpOffered: [
            "Let me help you develop this plot!",
            "I\'ll guide your narrative!",
            "Time to craft this chapter!"
          ],
          conceptExplanation: [
            "Think of it like developing a character...",
            "Just like building a plot...",
            "Each element tells part of the story..."
          ],
          problemSolving: [
            "What\'s our narrative here?",
            "Let\'s outline the solution!",
            "Time for the climax!"
          ],
          celebration: [
            "Perfectly written!",
            "Story complete!",
            "Literary success!"
          ]
        }
      },
      "Astronaut": {
        career: "Astronaut",
        vocabulary: ["space", "mission", "exploration", "rocket", "orbit", "discovery", "universe"],
        metaphors: ["exploring knowledge", "launching into learning", "discovering new worlds"],
        examples: ["space missions", "exploring planets", "conducting experiments", "spacewalking"],
        encouragementPhrases: [
          "You're reaching for the stars!",
          "Mission to knowledge: successful!",
          "Exploring new frontiers!",
          "Houston, we have excellence!"
        ],
        successMessages: [
          "Mission accomplished!",
          "Successfully landed on knowledge!",
          "Space exploration complete!",
          "One giant leap for learning!"
        ],
        toastNotifications: {
          welcome: [
            "Prepare for learning launch!",
            "Ready for your space mission?",
            "T-minus 10 to knowledge!"
          ],
          progress: [
            "Orbit achieved successfully!",
            "Mission progressing perfectly!",
            "Approaching destination!"
          ],
          achievement: [
            "Mission complete!",
            "New world discovered!",
            "Space pioneer status!"
          ],
          reminder: [
            "Time for mission briefing!",
            "Don\'t forget your space training!",
            "Daily missions await!"
          ],
          encouragement: [
            "Every astronaut started earthbound!",
            "Keep exploring, future astronaut!",
            "The universe awaits!"
          ]
        },
        chatbotResponses: {
          greeting: [
            "Welcome aboard, future astronaut!",
            "Ready for launch?",
            "Let\'s explore the learning universe!"
          ],
          helpOffered: [
            "Let me guide your mission!",
            "I\'ll be your mission control!",
            "Time for spacewalk assistance!"
          ],
          conceptExplanation: [
            "Think of it like navigating space...",
            "Just like plotting a course...",
            "Each discovery leads to another..."
          ],
          problemSolving: [
            "What\'s our mission objective?",
            "Let\'s calculate the trajectory!",
            "Time for landing!"
          ],
          celebration: [
            "Mission success!",
            "Perfect landing!",
            "Space excellence!"
          ]
        }
      },
      "Police Officer": {
        career: "Police Officer",
        vocabulary: ["protect", "serve", "justice", "safety", "investigation", "community", "duty"],
        metaphors: ["protecting knowledge", "serving understanding", "investigating problems"],
        examples: ["protecting community", "solving cases", "maintaining order", "helping citizens"],
        encouragementPhrases: [
          "You're protecting your progress!",
          "Serving excellence daily!",
          "Justice for confusion - solved!",
          "Safety in knowledge!"
        ],
        successMessages: [
          "Case closed successfully!",
          "Justice served!",
          "Community protected!",
          "Badge of honor earned!"
        ],
        toastNotifications: {
          welcome: [
            "Reporting for learning duty!",
            "Ready to protect and serve knowledge?",
            "Time for your patrol!"
          ],
          progress: [
            "Investigation progressing well!",
            "Case nearly solved!",
            "Order maintained!"
          ],
          achievement: [
            "Case solved!",
            "Badge of excellence!",
            "Community hero!"
          ],
          reminder: [
            "Time for duty!",
            "Don\'t forget your training!",
            "Daily patrol needed!"
          ],
          encouragement: [
            "Every officer started as a recruit!",
            "Keep serving, future officer!",
            "Protect and serve knowledge!"
          ]
        },
        chatbotResponses: {
          greeting: [
            "Reporting for duty, future officer!",
            "Ready to solve this case?",
            "Let\'s protect and serve learning!"
          ],
          helpOffered: [
            "Let me help investigate this!",
            "I\'ll assist with this case!",
            "Time to solve this mystery!"
          ],
          conceptExplanation: [
            "Think of it like solving a case...",
            "Just like gathering evidence...",
            "Each clue leads us closer..."
          ],
          problemSolving: [
            "What evidence do we have?",
            "Let\'s investigate thoroughly!",
            "Time to close this case!"
          ],
          celebration: [
            "Case solved!",
            "Justice achieved!",
            "Excellence in service!"
          ]
        }
      },
      "Firefighter": {
        career: "Firefighter",
        vocabulary: ["rescue", "brave", "emergency", "ladder", "hose", "safety", "hero"],
        metaphors: ["extinguishing confusion", "rescuing understanding", "brave learning"],
        examples: ["fighting fires", "rescuing people", "emergency response", "fire prevention"],
        encouragementPhrases: [
          "You're extinguishing confusion!",
          "Brave learning in action!",
          "Rescuing knowledge successfully!",
          "Hero-level progress!"
        ],
        successMessages: [
          "Fire of confusion extinguished!",
          "Rescue mission complete!",
          "Hero status achieved!",
          "Bravery rewarded!"
        ],
        toastNotifications: {
          welcome: [
            "Time for learning rescue!",
            "Ready to be brave with knowledge?",
            "Emergency: Time to learn!"
          ],
          progress: [
            "Fire under control!",
            "Rescue in progress!",
            "Safety achieved!"
          ],
          achievement: [
            "Mission accomplished!",
            "Hero badge earned!",
            "Fire conquered!"
          ],
          reminder: [
            "Time for training drills!",
            "Stay ready for learning!",
            "Heroes practice daily!"
          ],
          encouragement: [
            "Every firefighter started with courage!",
            "Keep being brave, future hero!",
            "Your courage inspires!"
          ]
        },
        chatbotResponses: {
          greeting: [
            "Ready for action, future firefighter!",
            "Time to be brave with learning!",
            "Let\'s rescue some knowledge!"
          ],
          helpOffered: [
            "Let me help with this rescue!",
            "I\'ll assist with the emergency!",
            "Time to be brave together!"
          ],
          conceptExplanation: [
            "Think of it like fighting a fire...",
            "Just like planning a rescue...",
            "Each action saves the day..."
          ],
          problemSolving: [
            "Where\'s the emergency?",
            "Let\'s tackle this bravely!",
            "Time for the rescue!"
          ],
          celebration: [
            "Mission complete!",
            "Heroic success!",
            "Bravery wins!"
          ]
        }
      },
      "Pilot": {
        career: "Pilot",
        vocabulary: ["flight", "navigation", "altitude", "cockpit", "landing", "takeoff", "destination"],
        metaphors: ["flying high", "navigating knowledge", "reaching new heights"],
        examples: ["flying planes", "navigating routes", "perfect landings", "weather planning"],
        encouragementPhrases: [
          "You're flying high with learning!",
          "Perfect altitude for success!",
          "Smooth flight to knowledge!",
          "Clear skies ahead!"
        ],
        successMessages: [
          "Perfect landing!",
          "Flight complete!",
          "Destination reached!",
          "Captain excellence!"
        ],
        toastNotifications: {
          welcome: [
            "Prepare for learning takeoff!",
            "Ready to fly high?",
            "Welcome aboard Flight Knowledge!"
          ],
          progress: [
            "Cruising altitude reached!",
            "Smooth flight in progress!",
            "Approaching destination!"
          ],
          achievement: [
            "Perfect landing achieved!",
            "Captain status earned!",
            "Flight mastery!"
          ],
          reminder: [
            "Time for pre-flight check!",
            "Don\'t miss your flight!",
            "Daily flights scheduled!"
          ],
          encouragement: [
            "Every pilot started on the ground!",
            "Keep flying, future captain!",
            "The sky\'s the limit!"
          ]
        },
        chatbotResponses: {
          greeting: [
            "Welcome to the cockpit, future pilot!",
            "Ready for takeoff?",
            "Let\'s navigate learning together!"
          ],
          helpOffered: [
            "Let me be your co-pilot!",
            "I\'ll help navigate this!",
            "Time for assisted flying!"
          ],
          conceptExplanation: [
            "Think of it like planning a flight...",
            "Just like checking instruments...",
            "Each step gets us closer to landing..."
          ],
          problemSolving: [
            "What\'s our flight plan?",
            "Let\'s check our navigation!",
            "Time for landing!"
          ],
          celebration: [
            "Perfect flight!",
            "Smooth landing!",
            "Aviation excellence!"
          ]
        }
      },
      "Architect": {
        career: "Architect",
        vocabulary: ["design", "blueprint", "structure", "foundation", "building", "space", "vision"],
        metaphors: ["designing success", "building knowledge", "creating foundations"],
        examples: ["drawing blueprints", "designing buildings", "planning spaces", "creating structures"],
        encouragementPhrases: [
          "You're architecting brilliance!",
          "Foundation solid as rock!",
          "Beautiful design emerging!",
          "Structural integrity: perfect!"
        ],
        successMessages: [
          "Architectural masterpiece!",
          "Blueprint realized!",
          "Building complete!",
          "Design perfection!"
        ],
        toastNotifications: {
          welcome: [
            "Time to design your learning!",
            "Ready to draw blueprints?",
            "Let\'s build knowledge!"
          ],
          progress: [
            "Structure taking shape!",
            "Foundation strong!",
            "Design coming together!"
          ],
          achievement: [
            "Masterpiece complete!",
            "Architectural excellence!",
            "Building finished!"
          ],
          reminder: [
            "Time to check blueprints!",
            "Don\'t forget your design!",
            "Daily building continues!"
          ],
          encouragement: [
            "Every architect started with a sketch!",
            "Keep designing, future architect!",
            "Your vision will become reality!"
          ]
        },
        chatbotResponses: {
          greeting: [
            "Welcome to the studio, future architect!",
            "Ready to design something amazing?",
            "Let\'s create blueprints for success!"
          ],
          helpOffered: [
            "Let me help with this design!",
            "I\'ll guide your blueprint!",
            "Time to build understanding!"
          ],
          conceptExplanation: [
            "Think of it like designing a building...",
            "Just like laying a foundation...",
            "Each element supports the structure..."
          ],
          problemSolving: [
            "What\'s our design vision?",
            "Let\'s draft the solution!",
            "Time to build!"
          ],
          celebration: [
            "Perfectly designed!",
            "Architectural success!",
            "Masterpiece built!"
          ]
        }
      }
    };

    return templates[career] || templates["Teacher"];
  }

  /**
   * Initialize the four core companions
   */
  private initializeCompanions(): void {
    // FINN - The Friendly Guide
    this.companions.set(CompanionId.FINN, {
      id: CompanionId.FINN,
      name: "Finn",
      personality: {
        traits: ["friendly", "encouraging", "patient", "playful"],
        communicationStyle: "warm and approachable",
        encouragementStyle: "cheerful and supportive",
        teachingApproach: "step-by-step guidance",
        emotionalTone: "optimistic and upbeat"
      },
      visualStyle: {
        primaryColor: "#4ADE80",
        secondaryColor: "#22C55E",
        iconSet: "friendly_animals",
        animationStyle: "energetic",
        visualComplexity: "simple"
      },
      interactionStyle: {
        greetingStyle: "Hey there, friend!",
        feedbackPositive: [
          "Great job, buddy!",
          "You're doing amazing!",
          "Keep up the fantastic work!"
        ],
        feedbackCorrective: [
          "Let\'s try that again together!",
          "Almost there, let me help!",
          "Good effort! Here\'s a hint..."
        ],
        hintStyle: "playful and encouraging",
        celebrationStyle: "enthusiastic with confetti",
        motivationStyle: "You can do this, I believe in you!"
      },
      specialties: ["building confidence", "making learning fun", "social skills"],
      gradeAdaptations: this.createGradeAdaptations(),
      careerAdaptations: this.createCompanionCareerAdaptations("finn")
    });

    // SPARK - The Creative Innovator
    this.companions.set(CompanionId.SPARK, {
      id: CompanionId.SPARK,
      name: "Spark",
      personality: {
        traits: ["creative", "curious", "innovative", "energetic"],
        communicationStyle: "enthusiastic and imaginative",
        encouragementStyle: "inspiring creativity",
        teachingApproach: "exploration and discovery",
        emotionalTone: "excited and wonder-filled"
      },
      visualStyle: {
        primaryColor: "#F59E0B",
        secondaryColor: "#FBBF24",
        iconSet: "creative_elements",
        animationStyle: "energetic",
        visualComplexity: "moderate"
      },
      interactionStyle: {
        greetingStyle: "Ready for an adventure?",
        feedbackPositive: [
          "Brilliant thinking!",
          "What a creative solution!",
          "You're full of great ideas!"
        ],
        feedbackCorrective: [
          "Let\'s think outside the box!",
          "What if we try a different approach?",
          "Every mistake is a chance to learn!"
        ],
        hintStyle: "creative problem-solving",
        celebrationStyle: "fireworks and sparkles",
        motivationStyle: "Let your creativity shine!"
      },
      specialties: ["creative thinking", "problem-solving", "STEAM subjects"],
      gradeAdaptations: this.createGradeAdaptations(),
      careerAdaptations: this.createCompanionCareerAdaptations("spark")
    });

    // HARMONY - The Supportive Friend
    this.companions.set(CompanionId.HARMONY, {
      id: CompanionId.HARMONY,
      name: "Harmony",
      personality: {
        traits: ["empathetic", "supportive", "calm", "understanding"],
        communicationStyle: "gentle and reassuring",
        encouragementStyle: "emotional support and validation",
        teachingApproach: "patient and adaptive",
        emotionalTone: "peaceful and caring"
      },
      visualStyle: {
        primaryColor: "#A78BFA",
        secondaryColor: "#C084FC",
        iconSet: "nature_harmony",
        animationStyle: "calm",
        visualComplexity: "moderate"
      },
      interactionStyle: {
        greetingStyle: "Welcome back, I\'m here for you!",
        feedbackPositive: [
          "You should be proud!",
          "Your hard work is paying off!",
          "You're making wonderful progress!"
        ],
        feedbackCorrective: [
          "It\'s okay, we all make mistakes!",
          "Take your time, there\'s no rush!",
          "You're learning, and that's what matters!"
        ],
        hintStyle: "gentle and supportive",
        celebrationStyle: "peaceful nature animations",
        motivationStyle: "Believe in yourself!"
      },
      specialties: ["emotional intelligence", "mindfulness", "social-emotional learning"],
      gradeAdaptations: this.createGradeAdaptations(),
      careerAdaptations: this.createCompanionCareerAdaptations("harmony")
    });

    // SAGE - The Wise Mentor
    this.companions.set(CompanionId.SAGE, {
      id: CompanionId.SAGE,
      name: "Sage",
      personality: {
        traits: ["wise", "knowledgeable", "thoughtful", "analytical"],
        communicationStyle: "clear and informative",
        encouragementStyle: "intellectual recognition",
        teachingApproach: "conceptual understanding",
        emotionalTone: "calm and scholarly"
      },
      visualStyle: {
        primaryColor: "#3B82F6",
        secondaryColor: "#60A5FA",
        iconSet: "academic_symbols",
        animationStyle: "thoughtful",
        visualComplexity: "detailed"
      },
      interactionStyle: {
        greetingStyle: "Welcome, young scholar!",
        feedbackPositive: [
          "Excellent reasoning!",
          "Your understanding is impressive!",
          "Well-thought-out answer!"
        ],
        feedbackCorrective: [
          "Let\'s examine this more closely.",
          "Consider this perspective...",
          "Think about the underlying concept."
        ],
        hintStyle: "analytical and educational",
        celebrationStyle: "scholarly achievements",
        motivationStyle: "Knowledge is power!"
      },
      specialties: ["critical thinking", "advanced concepts", "academic excellence"],
      gradeAdaptations: this.createGradeAdaptations(),
      careerAdaptations: this.createCompanionCareerAdaptations("sage")
    });
  }

  /**
   * Create grade adaptations
   */
  private createGradeAdaptations(): Map<string, GradeAdaptation> {
    const adaptations = new Map<string, GradeAdaptation>();
    
    ["K", "1", "2"].forEach(grade => {
      adaptations.set(grade, {
        grade,
        vocabularyLevel: "basic",
        conceptComplexity: "concrete",
        interactionLength: "brief",
        supportLevel: "high"
      });
    });

    ["3", "4", "5"].forEach(grade => {
      adaptations.set(grade, {
        grade,
        vocabularyLevel: "intermediate",
        conceptComplexity: "mixed",
        interactionLength: "moderate",
        supportLevel: "medium"
      });
    });

    ["6", "7", "8", "9", "10", "11", "12"].forEach(grade => {
      adaptations.set(grade, {
        grade,
        vocabularyLevel: "advanced",
        conceptComplexity: "abstract",
        interactionLength: "detailed",
        supportLevel: "low"
      });
    });

    return adaptations;
  }

  /**
   * Create companion-specific career adaptations
   */
  private createCompanionCareerAdaptations(companionType: string): Map<string, CareerAdaptation> {
    const adaptations = new Map<string, CareerAdaptation>();
    
    this.careerTemplates.forEach((template, career) => {
      const adapted = { ...template };
      
      // Modify based on companion personality
      if (companionType === "finn") {
        adapted.toastNotifications.welcome = adapted.toastNotifications.welcome.map(
          msg => `Hey friend! ${msg}`
        );
        adapted.chatbotResponses.greeting = adapted.chatbotResponses.greeting.map(
          msg => `${msg} Let"s have fun learning!`
        );
      } else if (companionType === "spark") {
        adapted.toastNotifications.welcome = adapted.toastNotifications.welcome.map(
          msg => `✨ ${msg} ✨`
        );
        adapted.chatbotResponses.celebration = adapted.chatbotResponses.celebration.map(
          msg => `${msg} How creative!`
        );
      } else if (companionType === "harmony") {
        adapted.toastNotifications.encouragement = adapted.toastNotifications.encouragement.map(
          msg => `${msg} You're doing great.`
        );
        adapted.chatbotResponses.helpOffered = adapted.chatbotResponses.helpOffered.map(
          msg => `${msg} No pressure!`
        );
      } else if (companionType === "sage") {
        adapted.toastNotifications.achievement = adapted.toastNotifications.achievement.map(
          msg => `Scholar, ${msg}`
        );
        adapted.chatbotResponses.conceptExplanation = adapted.chatbotResponses.conceptExplanation.map(
          msg => `${msg} Let"s analyze further.`
        );
      }
      
      adaptations.set(career, adapted);
    });

    return adaptations;
  }

  // Rule action methods

  private selectCompanion(context: CompanionContext): RuleResult {
    const { student } = context;
    let selectedCompanion: CompanionId;
    
    if (student.grade_level && ["K", "1", "2"].includes(student.grade_level)) {
      selectedCompanion = CompanionId.FINN;
    } else if (student.learningStyle === "creative") {
      selectedCompanion = CompanionId.SPARK;
    } else if (student.needsEmotionalSupport) {
      selectedCompanion = CompanionId.HARMONY;
    } else if (student.academicLevel === "advanced") {
      selectedCompanion = CompanionId.SAGE;
    } else {
      selectedCompanion = CompanionId.FINN;
    }

    return {
      success: true,
      data: {
        companion: selectedCompanion,
        profile: this.companions.get(selectedCompanion)
      }
    };
  }

  private adaptToCareer(context: CompanionContext): RuleResult {
    const companion = this.companions.get(context.companion);
    if (!companion || !context.career) {
      return { success: false, error: "Missing companion or career" };
    }

    const careerAdaptation = companion.careerAdaptations.get(context.career.name);
    if (!careerAdaptation) {
      return { success: false, error: `No adaptation for career: ${context.career.name}` };
    }

    return {
      success: true,
      data: {
        vocabulary: careerAdaptation.vocabulary,
        metaphors: careerAdaptation.metaphors,
        templates: {
          toast: careerAdaptation.toastNotifications,
          chatbot: careerAdaptation.chatbotResponses
        }
      }
    };
  }

  private adaptToGradeLevel(context: CompanionContext): RuleResult {
    const companion = this.companions.get(context.companion);
    if (!companion) {
      return { success: false, error: "Companion not found" };
    }

    const adaptation = companion.gradeAdaptations.get(context.student.grade_level || "3");
    
    return {
      success: true,
      data: {
        vocabularyLevel: adaptation?.vocabularyLevel || "intermediate",
        supportLevel: adaptation?.supportLevel || "medium",
        interactionLength: adaptation?.interactionLength || "moderate"
      }
    };
  }

  private generateToastNotification(context: CompanionContext): RuleResult {
    const companion = this.companions.get(context.companion);
    if (!companion || !context.career) {
      return { success: false, error: "Missing companion or career" };
    }

    const careerAdaptation = companion.careerAdaptations.get(context.career.name);
    if (!careerAdaptation) {
      return { success: false, error: `No adaptation for career: ${context.career.name}` };
    }

    const messageIntent = context.messageIntent || "welcome";
    const templates = careerAdaptation.toastNotifications[
      messageIntent as keyof ToastNotificationTemplates
    ] || careerAdaptation.toastNotifications.welcome;

    const message = templates[Math.floor(Math.random() * templates.length)];

    return {
      success: true,
      data: {
        message,
        companion: companion.name,
        visualStyle: companion.visualStyle,
        career: context.career.name
      }
    };
  }

  private generateChatbotResponse(context: CompanionContext): RuleResult {
    const companion = this.companions.get(context.companion);
    if (!companion || !context.career) {
      return { success: false, error: "Missing companion or career" };
    }

    const careerAdaptation = companion.careerAdaptations.get(context.career.name);
    if (!careerAdaptation) {
      return { success: false, error: `No adaptation for career: ${context.career.name}` };
    }

    const messageIntent = context.messageIntent || "greeting";
    const templates = careerAdaptation.chatbotResponses[
      messageIntent as keyof ChatbotResponseTemplates
    ] || careerAdaptation.chatbotResponses.greeting;

    const response = templates[Math.floor(Math.random() * templates.length)];
    const personalizedResponse = `${response} ${companion.interactionStyle.motivationStyle}`;

    return {
      success: true,
      data: {
        message: personalizedResponse,
        companion: companion.name,
        personality: companion.personality,
        career: context.career.name
      }
    };
  }

  private adjustForPerformance(context: CompanionContext): RuleResult {
    const { recentPerformance = 0.5 } = context;
    const companion = this.companions.get(context.companion);
    
    if (!companion) {
      return { success: false, error: "Companion not found" };
    }

    let feedback: string;
    let supportLevel: string;

    if (recentPerformance >= 0.8) {
      feedback = companion.interactionStyle.feedbackPositive[0];
      supportLevel = "minimal";
    } else if (recentPerformance >= 0.6) {
      feedback = companion.interactionStyle.feedbackPositive[1];
      supportLevel = "moderate";
    } else if (recentPerformance >= 0.4) {
      feedback = companion.interactionStyle.feedbackCorrective[0];
      supportLevel = "high";
    } else {
      feedback = companion.interactionStyle.feedbackCorrective[1];
      supportLevel = "maximum";
    }

    return {
      success: true,
      data: {
        feedback,
        supportLevel,
        showHints: recentPerformance < 0.6,
        simplifyContent: recentPerformance < 0.4
      }
    };
  }

  private respondToEmotion(context: CompanionContext): RuleResult {
    const companion = this.companions.get(context.companion);
    if (!companion) {
      return { success: false, error: "Companion not found" };
    }

    const emotionalResponses: Record<string, any> = {
      frustrated: {
        message: "Let\'s take a break and come back to this!",
        action: "suggest_break",
        switchTo: CompanionId.HARMONY
      },
      bored: {
        message: "Let\'s try something more exciting!",
        action: "increase_engagement",
        switchTo: CompanionId.SPARK
      },
      confused: {
        message: "Let me explain this differently.",
        action: "simplify_explanation",
        switchTo: CompanionId.SAGE
      },
      happy: {
        message: companion.interactionStyle.celebrationStyle,
        action: "celebrate",
        switchTo: null
      }
    };

    const response = emotionalResponses[context.emotionalState || "neutral"] || {
      message: companion.interactionStyle.motivationStyle,
      action: "continue",
      switchTo: null
    };

    return {
      success: true,
      data: response
    };
  }

  private manageLongSession(context: CompanionContext): RuleResult {
    const companion = this.companions.get(context.companion);
    if (!companion) {
      return { success: false, error: "Companion not found" };
    }

    return {
      success: true,
      data: {
        message: "You've been working hard! Time for a quick break?",
        action: "suggest_break",
        breakActivities: ["stretch", "mindfulness", "quick_game", "water_break"]
      }
    };
  }

  // Public methods

  public getCompanion(id: CompanionId): CompanionProfile | undefined {
    return this.companions.get(id);
  }

  public getAvailableCompanions(): CompanionProfile[] {
    return Array.from(this.companions.values());
  }

  public getCareerMessage(
    companionId: CompanionId,
    career: string,
    messageType: "toast" | "chatbot",
    intent: string
  ): string {
    const companion = this.companions.get(companionId);
    if (!companion) return "Let\'s learn together!";

    const careerAdaptation = companion.careerAdaptations.get(career);
    if (!careerAdaptation) return companion.interactionStyle.greetingStyle;

    if (messageType === "toast") {
      const templates = careerAdaptation.toastNotifications[
        intent as keyof ToastNotificationTemplates
      ] || careerAdaptation.toastNotifications.welcome;
      return templates[Math.floor(Math.random() * templates.length)];
    } else {
      const templates = careerAdaptation.chatbotResponses[
        intent as keyof ChatbotResponseTemplates
      ] || careerAdaptation.chatbotResponses.greeting;
      return templates[Math.floor(Math.random() * templates.length)];
    }
  }
}

// Export singleton instance
export const companionRulesEngine = new CompanionRulesEngine();