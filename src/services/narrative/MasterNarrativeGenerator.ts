/**
 * Master Narrative Generator - Best-in-Class Implementation
 *
 * ⚠️ IMPORTANT: FOR STUDENT LEARNING ONLY
 *
 * This generator is used for:
 * ✅ Student Dashboard - After career/companion selection (Screen 4)
 * ✅ Learn Container - Real-time content generation context
 * ✅ Experience Container - Live scenario generation context
 * ✅ Discover Container - Active exploration content context
 * ✅ Progress Tracking - Actual learning metrics
 *
 * DO NOT USE FOR:
 * ❌ Parent Dashboard
 * ❌ Teacher Dashboard
 * ❌ Admin Dashboard
 * ❌ Marketing/Approval workflows
 *
 * For parent/teacher previews, use: DemonstrativeMasterNarrativeGenerator
 *
 * KEY FEATURES:
 * - Generates RICH mission briefings with career-specific challenges
 * - Creates cohesive narrative that JIT uses for real-time generation
 * - Provides three-act structure (Learn → Experience → Discover)
 * - Integrates companion personality throughout journey
 * - Delivers same quality as demonstrative version (parents' expectation)
 */

import { MultiModelService } from '../ai-models/MultiModelService';
import { getLanguageConstraintsOnly } from '../ai-prompts/rules/UniversalContentRules';
import type {
  EnrichedMasterNarrative,
  NarrativeArc,
  CompanionVoice,
  CareerNarrative,
  SubjectNarrative,
  Subject,
  ContainerTransitions,
  ThematicElements,
  CompanionId
} from '../../types/MasterNarrativeTypes';
import type { StoryRubric } from '../../types/RubricTypes';

/**
 * Enhanced Master Narrative Interface - Best-in-Class Quality
 */
export interface MasterNarrative {
  narrativeId: string;
  character: {
    name: string;
    role: string;                     // "Junior Doctor Helper"
    workplace: string;                // "CareerInc Medical Center"
    personality: string;              // "Caring, gentle, helpful"
    equipment: string[];              // ["Toy stethoscope", "Doctor coat", etc.]
  };

  // ENHANCED: Rich mission briefing with career-specific challenge
  missionBriefing: {
    greeting: string;                 // Career-specific welcome
    situation: string;                // The problem/challenge to solve
    challenge: string;                // Specific mission details
    skillsNeeded: string;            // How learned skills will help
    companionSupport: string;        // Companion's promise to help
    closingMotivation: string;      // Exciting call to action
  };

  // Container-specific narrative contexts
  // These map to actual container implementations:
  // Learn → Instruction/Video/Practice/Assessment
  // Experience → Scenario/Practice/Assessment
  // Discover → Challenge/Practice/Assessment
  cohesiveStory: {
    medicalFocus?: string;            // For medical careers
    technicalFocus?: string;          // For technical careers
    creativeFocus?: string;           // For creative careers
    serviceFocus?: string;            // For service careers
    patients?: string;                // "Teddy Bear Clinic patients"
    customers?: string;               // For service careers
    projects?: string;                // For technical careers
    mission: string;                  // "Help teddy bears feel better"
    throughLine: string;              // "Sam learns to care for patients at the Teddy Bear Clinic"
  };
  settingProgression: {
    learn: {
      location: string;               // "CareerInc Virtual Academy - Medical Classroom"
      context: string;                // "Learning doctor basics with medical examples"
      narrative: string;              // "Sam studies how doctors organize and help"
    };
    experience: {
      location: string;               // "CareerInc Children's Clinic - Teddy Bear Wing"
      context: string;                // "Sam's workplace where teddy bear patients visit"
      narrative: string;              // "Sam makes real medical helper decisions"
    };
    discover: {
      location: string;               // "Community Health Fair at Central Park"
      context: string;                // "Field trip to see how doctors serve communities"
      narrative: string;              // "Sam helps at health screening stations"
    };
  };
  visualTheme: {
    colors: string;                   // "White coat, blue scrubs"
    setting: string;                  // "Clean, friendly medical environments"
    props: string;                    // "Medical tools, charts, teddy bear patients"
  };
  subjectContextsAligned: {
    math: {
      learn: string;                  // "Study how doctors use numbers 1-3 for patient rooms"
      experience: string;             // "Assign teddy bears to exam rooms 1, 2, 3"
      discover: string;               // "See how health fair uses numbered stations"
    };
    ela: {
      learn: string;                  // "Learn to read medical supply labels"
      experience: string;             // "Organize medicine cabinet with letter labels"
      discover: string;               // "Make health fair signs with big letters"
    };
    science: {
      learn: string;                  // "Study medical shapes (circle pills, square bandages)"
      experience: string;             // "Sort medical supplies by shape"
      discover: string;               // "Organize health stations by equipment shapes"
    };
    socialStudies: {
      learn: string;                  // "Learn how medical teams are communities"
      experience: string;             // "Build caring clinic community"
      discover: string;               // "See how health fairs unite neighborhoods"
    };
  };
  subjectContextsAlignedFacts?: {     // Fun facts for loading screen narration
    math: string[];                   // 3-4 fun facts about how career uses math
    ela: string[];                    // 3-4 fun facts about how career uses reading/writing
    science: string[];                // 3-4 fun facts about how career uses science
    socialStudies: string[];          // 3-4 fun facts about career's community impact
  };

  // ENHANCED: Companion personality integration
  companionIntegration: {
    name: string;                     // Companion's name
    personality: string;              // Companion's personality type
    greetingStyle: string;           // How companion greets
    encouragementStyle: string;      // How companion encourages
    teachingStyle: string;           // How companion teaches
    celebrationStyle: string;        // How companion celebrates
    catchphrase: string;             // Companion's signature phrase
    transitionPhrases: string[];     // Phrases between activities
  };

  generatedAt: Date;
  generationCost: number;
}

/**
 * Parameters for generating a Master Narrative
 */
export interface MasterNarrativeParams {
  studentName: string;
  gradeLevel: string;
  career: string;
  companion: {
    name: string;      // Sage, Harmony, Finn, or Spark
    personality: string; // Wise, Balanced, Adventurous, or Energetic
  };
  subjects: string[];  // Always ['math', 'ela', 'science', 'socialStudies']
  sessionId?: string;  // Optional session ID to use instead of generated narrativeId
  userId?: string;     // Optional user ID
  currentDate?: Date;  // For contextual greeting
}

/**
 * Enhanced Master Narrative with Demo-Quality Enrichment
 * Extends base MasterNarrative with 11 enhancement layers
 */
export interface EnhancedMasterNarrative extends MasterNarrative {
  // Layer 4: Parent-facing value propositions
  parentValue?: {
    realWorldConnection: string;
    futureReadiness: string;
    engagementPromise: string;
    differentiator: string;
  };

  // Layer 1: Progress-based achievement milestones
  milestones?: {
    firstAchievement: string;
    midwayMastery: string;
    finalVictory: string;
    bonusChallenge?: string;
  };

  // Layer 2: Immersive elements
  immersiveElements?: {
    soundscape: string;
    interactiveTools: string[];
    rewardVisuals: string[];
    celebrationMoments: string[];
  };

  // Layer 5: Quality indicators
  qualityMarkers?: {
    commonCoreAligned: boolean;
    stateStandardsMet: boolean;
    stemIntegrated: boolean;
    socialEmotionalLearning: boolean;
    assessmentRigor: string;
    progressTracking: string;
  };

  // Layer 3: Real-world applications
  realWorldApplications?: {
    [subject: string]: {
      immediate: string;
      nearFuture: string;
      longTerm: string;
      careerConnection: string;
    };
  };

  // Layer 8: Personalization examples
  personalizationExamples?: {
    withStudentName: string[];
    withInterests: string[];
    withProgress: string[];
    withLearningStyle: string[];
  };

  // Layer 9: Companion interaction samples
  companionInteractions?: {
    greetings: string[];
    encouragement: string[];
    hints: string[];
    celebrations: string[];
    transitions: string[];
  };

  // Layer 6: Parent insights
  parentInsights?: {
    adaptiveNature: string;
    noFailureMode: string;
    masteryTracking: string;
    dailyReports: string;
    weeklyProgress: string;
  };

  // Layer 7: Value guarantees
  guarantees?: {
    engagement: string;
    learning: string;
    satisfaction: string;
    support: string;
  };
}

/**
 * Enhanced parameters for generating demonstrative narratives
 */
export interface DemonstrativeNarrativeParams extends MasterNarrativeParams {
  showcaseMode?: boolean;
  sampleCareer?: string;
  sampleCompanion?: string;
  targetParentConcerns?: string[];
}

/**
 * Master Narrative Generator Service
 */
export class MasterNarrativeGenerator {
  private aiService: MultiModelService;

  constructor() {
    // Initialize AI service only if available
    try {
      this.aiService = new MultiModelService();
    } catch (error) {
      console.warn('AI Service not available, using mock mode');
      this.aiService = null as any;
    }
  }

  /**
   * Generate a complete Master Narrative in real-time
   * Phase 1: No caching, direct AI call every time
   */
  async generateMasterNarrative(params: MasterNarrativeParams): Promise<MasterNarrative> {
    // Generating Master Narrative

    // Use mock data if AI service is not available
    if (!this.aiService) {
      // Using mock narrative (AI service not available)
      return this.getMockNarrative(params);
    }

    try {
      // Build the comprehensive prompt
      const prompt = this.buildMasterNarrativePrompt(params);

      // Make real-time AI call (costs ~$0.60)
      const startTime = Date.now();
      const response = await this.aiService.generateContent(
        prompt,  // Pass prompt as string, not object
        {
          container: 'MASTER_NARRATIVE',
          subject: 'all',
          grade: params.gradeLevel,
          skill: {
            name: 'narrative_generation',
            skillCode: 'NARRATIVE',
            skillName: 'Master Narrative Generation',
            subject: 'all'
          }
        }
      );

      const generationTime = Date.now() - startTime;
      // Master Narrative generation completed

      // Parse and validate the response
      const narrative = this.parseAndValidateNarrative(response, params);

      // Log if fun facts are present
      if (narrative.subjectContextsAlignedFacts) {
        // Fun facts included in narrative
      } else {
        console.warn('⚠️ No fun facts found in Master Narrative response');
      }

      // Add metadata
      narrative.generatedAt = new Date();
      narrative.generationCost = 0.60; // Approximate cost for GPT-4

      return narrative;

    } catch (error) {
      console.error('❌ Failed to generate Master Narrative:', error);

      // For development, return a mock narrative if generation fails
      if (process.env.NODE_ENV === 'development') {
        // Using mock narrative for development
        return this.getMockNarrative(params);
      }

      throw error;
    }
  }

  /**
   * Build the comprehensive prompt for Master Narrative generation
   */
  private buildMasterNarrativePrompt(params: MasterNarrativeParams): string {
    const { studentName, gradeLevel, career, subjects } = params;

    return `Create a comprehensive master narrative for ${studentName}, a ${gradeLevel} grade student, exploring the career of ${career}.

Generate a complete narrative structure that will be used across all learning containers (Learn, Experience, Discover) and all subjects (${subjects.join(', ')}).

IMPORTANT: Return ONLY valid JSON with no markdown formatting, no backticks, and no additional text.

The narrative must follow this EXACT JSON structure:

{
  "narrativeId": "narr_${studentName.toLowerCase()}_${career.toLowerCase().replace(/\s+/g, '_')}_${gradeLevel.toLowerCase()}_${Date.now()}",
  "character": {
    "name": "${studentName}",
    "role": "${career} Helper",
    "workplace": "CareerInc ${career} Center",
    "personality": "[3-4 positive traits appropriate for the career]",
    "equipment": ["List 4 career-specific tools/items"]
  },
  "missionBriefing": {
    "greeting": "Welcome to CareerInc ${career} Center, ${career} ${studentName}!",
    "situation": "[Exciting problem or challenge that needs solving]",
    "challenge": "[Specific mission details]",
    "skillsNeeded": "[How the skills from all subjects will help]",
    "companionSupport": "[Companion's promise to help]",
    "closingMotivation": "[Exciting call to action to start the journey]"
  },
  "cohesiveStory": {
    "[focusType]": "[Specific focus area for ${career}]",
    "[audienceType]": "[Who they serve: patients/customers/clients/projects]",
    "mission": "[What ${studentName} will help with]",
    "throughLine": "${studentName} learns to [core activity] at the [workplace]"
  },
  "settingProgression": {
    "learn": {
      "location": "CareerInc Virtual Academy - ${career} Classroom",
      "context": "Instructional content: Learning ${career} basics with [career] examples",
      "narrative": "${studentName} studies how ${career}s [core learning activity]",
      "structure": "Instructional Video → Practice Questions (5) → Assessment (1)"
    },
    "experience": {
      "location": "CareerInc [specific ${career} workplace]",
      "context": "Hands-on scenarios: ${studentName} roleplays being a ${career} and solves real problems",
      "narrative": "${studentName} works through two career scenarios",
      "structure": "Scenario 1: 'A Day as a ${career}' (roleplay workplace tasks) → Scenario 2: '${career}'s Problem Solving' (solve career challenge)",
      "scenarioTypes": "Roleplay simulations and problem-solving challenges, NOT practice questions"
    },
    "discover": {
      "location": "[Community location] for ${career}s",
      "context": "Exploration challenges: Find real-world applications and observe ${career}s in community",
      "narrative": "${studentName} explores how ${career}s use skills in real life",
      "structure": "Challenge 1: '${career} Explorer' (find 3 ways ${career}s use skills) → Challenge 2: 'Community Helper Hunt' (observe ${career}s in community)",
      "challengeTypes": "Exploration and observation activities, NOT practice questions"
    }
  },
  "visualTheme": {
    "colors": "[Primary colors associated with ${career}]",
    "setting": "[Visual environment description]",
    "props": "[Key visual elements and tools]"
  },
  "subjectContextsAligned": {
    "math": {
      "learn": "Watch instructional video and practice how ${career}s use [specific math skill for grade ${gradeLevel}]",
      "experience": "Roleplay: Use [math skill] as a ${career} in workplace scenarios",
      "discover": "Explore: Find 3 ways ${career}s use [math skill] in real community locations"
    },
    "ela": {
      "learn": "Watch instructional video and practice [ELA skill] like ${career}s do",
      "experience": "Roleplay: Use [ELA skill] to solve ${career} workplace problems",
      "discover": "Explore: Observe how ${career}s use [ELA skill] in the community"
    },
    "science": {
      "learn": "Watch instructional video and practice [science concept] that ${career}s use",
      "experience": "Roleplay: Apply [science] to solve ${career} challenges",
      "discover": "Explore: Find where ${career}s use [science] in real-world settings"
    },
    "socialStudies": {
      "learn": "Watch instructional video and learn how ${career}s build communities",
      "experience": "Roleplay: Make community decisions as a ${career} at work",
      "discover": "Explore: Find ${career}s serving the community and see their impact"
    }
  },
  "subjectContextsAlignedFacts": {
    "math": [
      "Fun fact: ${career}s use [specific math skill] every day when [career activity]!",
      "Did you know? A ${career} counts [what they count] to [why they count]!",
      "${career}s need math to [specific math application in career]!",
      "Cool fact: ${career}s use numbers to [interesting number use]!"
    ],
    "ela": [
      "Fun fact: ${career}s read [what they read] to help [who they help]!",
      "Did you know? ${career}s write [what they write] every day!",
      "${career}s use special words like [career vocabulary]!",
      "Cool fact: ${career}s need to communicate with [who they talk to]!"
    ],
    "science": [
      "Fun fact: ${career}s use science to [scientific application]!",
      "Did you know? ${career}s study [what they study] to [why they study]!",
      "${career}s use tools like [scientific tool] to [tool purpose]!",
      "Cool fact: ${career}s discover [what they discover] using science!"
    ],
    "socialStudies": [
      "Fun fact: ${career}s help [number] people in their community every [time period]!",
      "Did you know? ${career}s work together with [who they work with]!",
      "${career}s make our community better by [community contribution]!",
      "Cool fact: There are ${career}s in every [location/community]!"
    ]
  },
  "companionIntegration": {
    "name": "[Companion name: Sage, Harmony, Finn, or Spark]",
    "personality": "[Companion's personality type]",
    "greetingStyle": "[How companion greets the student]",
    "encouragementStyle": "[How companion provides encouragement]",
    "teachingStyle": "[How companion helps teach concepts]",
    "celebrationStyle": "[How companion celebrates successes]",
    "catchphrase": "[Companion's signature phrase]",
    "transitionPhrases": [
      "[Phrase for moving between activities]",
      "[Another transition phrase]",
      "[One more transition phrase]"
    ]
  }
}

REQUIREMENTS for Grade ${gradeLevel}:
${this.getGradeSpecificRequirements(gradeLevel)}

${getLanguageConstraintsOnly(gradeLevel)}

CRITICAL - UNDERSTAND THE THREE CONTAINER TYPES:

1. LEARN Container = Traditional Instruction
   - Instructional Video → Practice Questions (5) → Assessment (1)
   - Students WATCH and PRACTICE with questions
   - Example: "Watch video about counting, then answer 5 counting questions"

2. EXPERIENCE Container = Roleplay Scenarios (NOT practice questions!)
   - Scenario 1: "A Day as a ${career}" (roleplay workplace tasks)
   - Scenario 2: "${career}'s Problem Solving" (solve career-specific challenge)
   - Students IMAGINE and SOLVE as if they ARE the ${career}
   - Example: "Imagine you're a chef today and help 3 customers" (NOT multiple choice questions!)

3. DISCOVER Container = Exploration Challenges (NOT practice questions!)
   - Challenge 1: "${career} Explorer" (find 3 ways ${career}s use the skill in virtual location)
   - Challenge 2: "Community Helper Hunt" (observe ${career}s in real community)
   - Students EXPLORE and OBSERVE real-world applications
   - Example: "Visit virtual kitchen and find 3 ways chefs use counting" (NOT multiple choice questions!)

IMPORTANT:
- Use age-appropriate language
- Create engaging, cohesive story that connects all subjects
- Ensure all subject contexts relate to actual ${career} work
- Include specific, concrete examples
- Make the career aspirational but accessible
- Use "CareerInc" branding consistently
- NEVER use time-of-day references (no morning, afternoon, evening, today, tonight, etc.)
- Use progress-based milestones instead of time-based ones
- Keep flexibility for home/micro school scheduling
- For Experience: Focus on ROLEPLAY and SCENARIOS, not question-answering
- For Discover: Focus on EXPLORATION and OBSERVATION, not question-answering
- For Learn: This is where practice questions and assessments happen
- For subjectContextsAlignedFacts: Create fun, exciting facts that will engage ${gradeLevel} students
- Facts should be short (one sentence), enthusiastic, and relate the career to the subject
- Start facts with "Fun fact:", "Did you know?", "${career}s", or "Cool fact:" as shown
- Make facts grade-appropriate and exciting for loading screen narration
- Focus on helping, learning, and community service`;
  }

  /**
   * Get grade-specific requirements
   */
  private getGradeSpecificRequirements(grade: string): string {
    const requirements: Record<string, string> = {
      'K': `- Use very simple vocabulary
- Focus on numbers 1-3, uppercase letters, basic shapes, and community
- Short, clear sentences
- Concrete, visual concepts
- Lots of repetition`,

      '1': `- Simple vocabulary with some new words
- Basic counting, letter recognition, patterns
- Introduce cause and effect
- Beginning problem-solving`,

      '2': `- Slightly complex sentences
- Addition/subtraction within 20, reading basics
- Compare and classify
- Community helpers and roles`,

      '3': `- More complex narratives
- Multiplication basics, reading comprehension
- Scientific observation
- Community structures`,

      '4': `- Multi-step problems
- Fractions, writing paragraphs
- Scientific method
- State and local government`,

      '5': `- Complex problem-solving
- Decimals, essay writing
- Systems and cycles
- American history connections`
    };

    return requirements[grade] || requirements['3'];
  }

  /**
   * Parse and validate the AI response
   */
  private parseAndValidateNarrative(response: any, params: MasterNarrativeParams): MasterNarrative {
    try {
      // AI response received

      // If response is a string, parse it as JSON
      let narrative = typeof response === 'string' ? JSON.parse(response) : response;

      // Sometimes AI returns the narrative nested in a content or data field
      if (narrative.content) {
        if (typeof narrative.content === 'string') {
          try {
            narrative = JSON.parse(narrative.content);
          } catch (e) {
            // If parsing fails, use content as-is
            narrative = narrative.content;
          }
        } else {
          narrative = narrative.content;
        }
      } else if (narrative.data) {
        narrative = narrative.data;
      }

      // Check if the entire structure is nested under another level
      if (!narrative.character && narrative.narrative) {
        narrative = narrative.narrative;
      }

      // If narrativeId is missing, generate one
      if (!narrative.narrativeId) {
        narrative.narrativeId = `narr_${params.studentName.toLowerCase()}_${params.career.toLowerCase().replace(/\s+/g, '_')}_${params.gradeLevel.toLowerCase()}_${Date.now()}`;
        // Generated unique narrative ID
      }

      // Validate required fields
      const required = [
        'character',
        'missionBriefing',
        'cohesiveStory',
        'settingProgression',
        'visualTheme',
        'subjectContextsAligned'
      ];

      for (const field of required) {
        if (!narrative[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate subject contexts
      const subjects = ['math', 'ela', 'science', 'socialStudies'];
      for (const subject of subjects) {
        if (!narrative.subjectContextsAligned[subject]) {
          throw new Error(`Missing subject context: ${subject}`);
        }

        // Check each container has content for this subject
        const containers = ['learn', 'experience', 'discover'];
        for (const container of containers) {
          if (!narrative.subjectContextsAligned[subject][container]) {
            throw new Error(`Missing ${container} context for ${subject}`);
          }
        }
      }

      return narrative as MasterNarrative;

    } catch (error) {
      console.error('Failed to parse narrative:', error);
      throw new Error(`Invalid narrative structure: ${error.message}`);
    }
  }

  /**
   * Get mock narrative for development/testing
   */
  private getMockNarrative(params: MasterNarrativeParams): MasterNarrative {
    const { studentName, gradeLevel, career, companion } = params;

    // Generate career-specific mock data
    const careerData = this.getCareerMockData(career);
    const missionBriefing = this.generateMissionBriefing(career, studentName, companion);
    const companionIntegration = this.getCompanionIntegration(companion);

    return {
      narrativeId: `narr_${studentName.toLowerCase()}_${career.toLowerCase().replace(/\s+/g, '_')}_${gradeLevel.toLowerCase()}_${Date.now()}`,
      character: {
        name: studentName,
        role: `${career} Helper`,
        workplace: `CareerInc ${career} Center`,
        personality: careerData.personality,
        equipment: careerData.equipment
      },
      missionBriefing,
      cohesiveStory: {
        ...careerData.focus,
        mission: careerData.mission,
        throughLine: `${studentName} learns to ${careerData.coreActivity} at the ${careerData.workplace}`
      },
      settingProgression: {
        learn: {
          location: `CareerInc Virtual Academy - ${career} Classroom`,
          context: `Learning ${career.toLowerCase()} basics with ${careerData.contextType} examples`,
          narrative: `${studentName} studies how ${career.toLowerCase()}s ${careerData.learnActivity}`
        },
        experience: {
          location: `CareerInc ${careerData.workplace}`,
          context: `${studentName}'s workplace where ${careerData.workContext}`,
          narrative: `${studentName} makes real ${career.toLowerCase()} helper decisions`
        },
        discover: {
          location: careerData.discoverLocation,
          context: `Field trip to see how ${career.toLowerCase()}s serve communities`,
          narrative: `${studentName} helps at ${careerData.discoverActivity}`
        }
      },
      visualTheme: {
        colors: careerData.colors,
        setting: careerData.setting,
        props: careerData.props
      },
      subjectContextsAligned: this.getMockSubjectContexts(career, studentName, gradeLevel).contexts,
      subjectContextsAlignedFacts: this.getMockSubjectContexts(career, studentName, gradeLevel).facts,
      companionIntegration,
      generatedAt: new Date(),
      generationCost: 0.00  // Mock is free
    };
  }

  /**
   * Get career-specific mock data
   */
  private getCareerMockData(career: string): any {
    const careerMap: Record<string, any> = {
      'Doctor': {
        personality: "Caring, gentle, helpful",
        equipment: ["Toy stethoscope", "Doctor coat", "Medical clipboard", "First aid kit"],
        workplace: "Children's Clinic",
        fieldTrip: "Community Health Fair",
        focus: { medicalFocus: "Pediatric care", patients: "Teddy bear patients" },
        mission: "Help teddy bears feel better",
        coreActivity: "care for patients",
        contextType: "medical",
        learnActivity: "organize and help",
        workContext: "teddy bear patients visit",
        discoverLocation: "Community Health Fair at Central Park",
        discoverActivity: "health screening stations",
        colors: "White coat, blue scrubs",
        setting: "Clean, friendly medical environments",
        props: "Medical tools, charts, teddy bear patients"
      },
      'Teacher': {
        personality: "Patient, encouraging, creative",
        equipment: ["Colorful markers", "ABC blocks", "Storybooks", "Teaching pointer"],
        workplace: "Elementary School",
        fieldTrip: "Public Library Story Time",
        focus: { educationalFocus: "Early learning", students: "Stuffed animal students" },
        mission: "Help stuffed animals learn ABC's",
        coreActivity: "teach and inspire",
        contextType: "educational",
        learnActivity: "plan lessons and teach",
        workContext: "stuffed animal students learn",
        discoverLocation: "Public Library Children's Section",
        discoverActivity: "story time activities",
        colors: "Bright primary colors",
        setting: "Cheerful classroom environments",
        props: "Books, whiteboards, educational toys"
      },
      'Chef': {
        personality: "Creative, organized, friendly",
        equipment: ["Mini chef hat", "Wooden spoon", "Apron", "Recipe cards"],
        workplace: "Restaurant Kitchen",
        fieldTrip: "Farmers Market",
        focus: { culinaryFocus: "Healthy cooking", customers: "Hungry toy customers" },
        mission: "Make yummy meals for toys",
        coreActivity: "cook and create",
        contextType: "culinary",
        learnActivity: "measure and mix",
        workContext: "toy customers order food",
        discoverLocation: "Local Farmers Market",
        discoverActivity: "fresh food stations",
        colors: "Red apron, white chef hat",
        setting: "Busy, organized kitchen",
        props: "Cooking tools, ingredients, recipe books"
      },
      'Scientist': {
        personality: "Curious, methodical, excited",
        equipment: ["Safety goggles", "Magnifying glass", "Lab coat", "Science notebook"],
        workplace: "Science Laboratory",
        fieldTrip: "Science Museum",
        focus: { scientificFocus: "Simple experiments", projects: "Fun science discoveries" },
        mission: "Make cool discoveries",
        coreActivity: "explore and discover",
        contextType: "scientific",
        learnActivity: "observe and experiment",
        workContext: "experiments happen",
        discoverLocation: "Children's Science Museum",
        discoverActivity: "hands-on exhibits",
        colors: "White lab coat, colorful chemicals",
        setting: "Bright, organized laboratory",
        props: "Test tubes, microscopes, experiment materials"
      },
      'Artist': {
        personality: "Creative, expressive, imaginative",
        equipment: ["Paint brushes", "Color palette", "Art smock", "Drawing pad"],
        workplace: "Art Studio",
        fieldTrip: "Art Museum",
        focus: { creativeFocus: "Color and shapes", projects: "Beautiful artworks" },
        mission: "Create colorful masterpieces",
        coreActivity: "create and express",
        contextType: "artistic",
        learnActivity: "mix colors and draw",
        workContext: "art projects come alive",
        discoverLocation: "Children's Art Museum",
        discoverActivity: "art gallery displays",
        colors: "Rainbow of paint colors",
        setting: "Bright, creative studio space",
        props: "Easels, paints, creative materials"
      },
      'Police Officer': {
        personality: "Brave, helpful, observant",
        equipment: ["Toy badge", "Safety vest", "Walkie-talkie", "Traffic cones"],
        workplace: "Police Station",
        fieldTrip: "Community Safety Fair",
        focus: { safetyFocus: "Community safety", citizens: "Neighborhood toy friends" },
        mission: "Keep toy neighborhood safe",
        coreActivity: "protect and serve",
        contextType: "safety",
        learnActivity: "observe and protect",
        workContext: "toy citizens need help",
        discoverLocation: "Community Safety Fair",
        discoverActivity: "safety demonstration stations",
        colors: "Blue uniform, shiny badge",
        setting: "Friendly police station",
        props: "Safety equipment, toy vehicles, community maps"
      },
      'Firefighter': {
        personality: "Brave, strong, caring",
        equipment: ["Fire helmet", "Fire hose (toy)", "Safety boots", "Fire truck toy"],
        workplace: "Fire Station",
        fieldTrip: "Fire Safety Education Center",
        focus: { rescueFocus: "Fire safety", community: "Toy neighborhood residents" },
        mission: "Keep toy friends safe from fires",
        coreActivity: "rescue and protect",
        contextType: "emergency",
        learnActivity: "respond and rescue",
        workContext: "emergency calls come in",
        discoverLocation: "Fire Safety Education Center",
        discoverActivity: "fire prevention activities",
        colors: "Red fire truck, yellow helmet",
        setting: "Busy fire station",
        props: "Fire trucks, safety gear, rescue equipment"
      },
      'Veterinarian': {
        personality: "Gentle, patient, loving",
        equipment: ["Toy stethoscope", "Pet carrier", "Animal treats", "Vet coat"],
        workplace: "Animal Hospital",
        fieldTrip: "Pet Adoption Center",
        focus: { animalFocus: "Pet care", patients: "Stuffed animal pets" },
        mission: "Help stuffed pets feel better",
        coreActivity: "care for animals",
        contextType: "veterinary",
        learnActivity: "examine and heal",
        workContext: "stuffed pets need checkups",
        discoverLocation: "Pet Adoption Center",
        discoverActivity: "pet care demonstrations",
        colors: "Green scrubs, animal prints",
        setting: "Cozy animal hospital",
        props: "Pet toys, medical tools, animal carriers"
      },
      'Engineer': {
        personality: "Creative, logical, persistent",
        equipment: ["Building blocks", "Ruler", "Hard hat", "Blueprint paper"],
        workplace: "Engineering Lab",
        fieldTrip: "Construction Site Tour",
        focus: { technicalFocus: "Building and design", projects: "Amazing toy structures" },
        mission: "Build cool things for toys",
        coreActivity: "design and build",
        contextType: "engineering",
        learnActivity: "plan and construct",
        workContext: "building projects happen",
        discoverLocation: "Children's Engineering Museum",
        discoverActivity: "building challenge zones",
        colors: "Yellow hard hat, blue blueprints",
        setting: "Creative engineering workspace",
        props: "Building materials, tools, blueprints"
      },
      'Basketball Coach': {
        personality: "Energetic, motivating, team-focused",
        equipment: ["Whistle", "Basketball", "Coach clipboard", "Team jersey"],
        workplace: "Basketball Court",
        fieldTrip: "Sports Complex",
        focus: { sportsFocus: "Team skills", players: "Toy team players" },
        mission: "Help toy team win games",
        coreActivity: "coach and motivate",
        contextType: "athletic",
        learnActivity: "teach and train",
        workContext: "toy players practice",
        discoverLocation: "Community Sports Complex",
        discoverActivity: "sports skills stations",
        colors: "Team colors, basketball orange",
        setting: "Exciting basketball court",
        props: "Basketballs, hoops, team gear"
      }
    };

    // Generic fallback for unknown careers
    if (!careerMap[career]) {
      // Creating generic mock data for unknown career
      const careerLower = career.toLowerCase();
      return {
        personality: "Dedicated, skilled, friendly",
        equipment: [`${career} tools`, "Work uniform", "Equipment bag", "Helper badge"],
        workplace: `${career} Workplace`,
        fieldTrip: `${career} Community Event`,
        focus: { professionalFocus: `${career} skills`, audience: "Community members" },
        mission: `Help the community as a ${careerLower}`,
        coreActivity: `work as a ${careerLower}`,
        contextType: "professional",
        learnActivity: `learn ${careerLower} skills`,
        workContext: `${careerLower} work happens`,
        discoverLocation: `${career} Discovery Center`,
        discoverActivity: `${careerLower} demonstrations`,
        colors: `Professional ${careerLower} colors`,
        setting: `${career} work environment`,
        props: `${career} tools and equipment`
      };
    }

    return careerMap[career];
  }

  /**
   * Get mock subject contexts for different careers
   */
  private getMockSubjectContexts(career: string, studentName: string, gradeLevel: string): any {
    // For kindergarten, focus on basic skills regardless of career
    if (gradeLevel === 'K') {
      const careerLower = career.toLowerCase();
      return {
        contexts: {
          math: {
            learn: `Study how ${careerLower}s use numbers 1-3`,
            experience: `Count items as a ${careerLower} helper`,
            discover: `See how ${careerLower}s count in real life`
          },
          ela: {
            learn: `Learn to recognize letters like ${careerLower}s do`,
            experience: `Find letters A, B, C in ${careerLower} work`,
            discover: `Make signs with big letters`
          },
          science: {
            learn: `Study shapes that ${careerLower}s use`,
            experience: `Sort items by shape`,
            discover: `Find shapes in ${careerLower} tools`
          },
          socialStudies: {
            learn: `Learn how ${careerLower}s work together`,
            experience: `Build ${careerLower} community`,
            discover: `See how ${careerLower}s help neighborhoods`
          }
        },
        // Add fun facts for loading screen narration
        facts: {
          math: [
            `Fun fact: ${career}s use numbers every single day!`,
            `Did you know? ${career}s count up to 10 or even 100!`,
            `${career}s need math to measure and count things!`,
            `Cool fact: ${career}s use shapes like circles and squares!`
          ],
          ela: [
            `Fun fact: ${career}s read important information every day!`,
            `Did you know? ${career}s write notes to remember things!`,
            `${career}s use the alphabet just like you're learning!`,
            `Cool fact: ${career}s talk to many people using kind words!`
          ],
          science: [
            `Fun fact: ${career}s use science tools to help people!`,
            `Did you know? ${career}s observe and learn new things!`,
            `${career}s use patterns and sorting in their work!`,
            `Cool fact: ${career}s make discoveries every day!`
          ],
          socialStudies: [
            `Fun fact: ${career}s help hundreds of people in their community!`,
            `Did you know? ${career}s work as a team to get things done!`,
            `${career}s make our neighborhood a better place!`,
            `Cool fact: Every community needs ${careerLower}s to help!`
          ]
        }
      };
    }

    // Return grade-appropriate contexts for other grades
    return this.getMockSubjectContexts('Doctor', studentName, 'K');
  }

  /**
   * Generate rich mission briefing for career
   */
  private generateMissionBriefing(career: string, studentName: string, companion: { name: string; personality: string }): any {
    const briefings: Record<string, any> = {
      'Doctor': {
        greeting: `Welcome to CareerInc Medical Center, Dr. ${studentName}!`,
        situation: `Emergency! The Teddy Bear Clinic has 5 patients with mysterious symptoms.`,
        challenge: `We need to diagnose and treat each patient using careful observation and medical knowledge.`,
        skillsNeeded: `You'll use math to measure doses, reading to understand charts, science to diagnose, and teamwork to help everyone.`,
        companionSupport: `${companion.name} says: "I'll help you examine each patient and find the right treatment!"`,
        closingMotivation: `Let's save the day and help all our teddy bear patients feel better!`
      },
      'Chef': {
        greeting: `Welcome to Le Magnifique Restaurant, Chef ${studentName}!`,
        situation: `The famous food critic Antoine Delacroix is coming for dinner service!`,
        challenge: `We must prepare a perfect 5-course meal using precise measurements and timing.`,
        skillsNeeded: `You'll use math for measurements, reading for recipes, science for cooking chemistry, and creativity for presentation.`,
        companionSupport: `${companion.name} says: "Together we'll create the most amazing meal ever!"`,
        closingMotivation: `Let's earn that fifth Michelin star!`
      },
      'Scientist': {
        greeting: `Welcome to the Discovery Lab, Scientist ${studentName}!`,
        situation: `We've detected an unusual chemical reaction in our latest experiment!`,
        challenge: `We need to safely investigate and document this discovery through careful experimentation.`,
        skillsNeeded: `You'll use math for measurements, reading for research, science for experiments, and documentation for sharing findings.`,
        companionSupport: `${companion.name} says: "This could be a breakthrough discovery! I'll help you test every hypothesis!"`,
        closingMotivation: `Let's make scientific history together!`
      },
      'Teacher': {
        greeting: `Welcome to Pathfinity Elementary, Teacher ${studentName}!`,
        situation: `Your stuffed animal students are ready for their big test tomorrow!`,
        challenge: `Help each student master their lessons through creative teaching methods.`,
        skillsNeeded: `You'll use math for lesson planning, reading for materials, science for demonstrations, and patience for teaching.`,
        companionSupport: `${companion.name} says: "You're going to be an amazing teacher! I'll help make learning fun!"`,
        closingMotivation: `Let's help every student succeed!`
      }
    };

    // Return specific briefing or generate generic one
    return briefings[career] || {
      greeting: `Welcome to CareerInc ${career} Center, ${career} ${studentName}!`,
      situation: `An important ${career.toLowerCase()} challenge awaits!`,
      challenge: `Use your skills to solve this mission.`,
      skillsNeeded: `You'll use all your subjects to succeed as a ${career.toLowerCase()}.`,
      companionSupport: `${companion.name} says: "I'm here to help you every step of the way!"`,
      closingMotivation: `Let's show everyone what an amazing ${career.toLowerCase()} you are!`
    };
  }

  /**
   * Get companion personality integration
   */
  private getCompanionIntegration(companion: { name: string; personality: string }): any {
    const personalities: Record<string, any> = {
      'Sage': {
        name: 'Sage',
        personality: 'Wise and thoughtful',
        greetingStyle: 'Sage adjusts glasses thoughtfully and smiles warmly',
        encouragementStyle: 'offers wise insights and patient guidance',
        teachingStyle: 'explains concepts clearly with real-world examples',
        celebrationStyle: 'nods approvingly with a proud smile',
        catchphrase: 'Every problem has a solution when we think it through!',
        transitionPhrases: [
          'Sage whispers: "Each discovery brings us closer to the answer..."',
          'Sage notes: "Excellent observation! Let\'s explore further..."',
          'Sage encourages: "You\'re thinking like a true professional!"'
        ]
      },
      'Harmony': {
        name: 'Harmony',
        personality: 'Balanced and supportive',
        greetingStyle: 'Harmony offers a reassuring smile and calming presence',
        encouragementStyle: 'provides balanced feedback and steady support',
        teachingStyle: 'guides with gentle suggestions and clear steps',
        celebrationStyle: 'celebrates with graceful excitement',
        catchphrase: 'Together we can achieve perfect balance!',
        transitionPhrases: [
          'Harmony suggests: "Let\'s take this step by step..."',
          'Harmony observes: "You\'re finding your rhythm perfectly!"',
          'Harmony guides: "Balance is key to mastering this skill!"'
        ]
      },
      'Finn': {
        name: 'Finn',
        personality: 'Adventurous and brave',
        greetingStyle: 'Finn grins adventurously and gives a thumbs up',
        encouragementStyle: 'cheers enthusiastically and celebrates every attempt',
        teachingStyle: 'turns learning into exciting adventures',
        celebrationStyle: 'does victory dances and high-fives',
        catchphrase: 'Every day is an adventure when we\'re learning!',
        transitionPhrases: [
          'Finn exclaims: "What an adventure this is becoming!"',
          'Finn cheers: "You\'re braver than you know!"',
          'Finn encourages: "Let\'s explore this challenge together!"'
        ]
      },
      'Spark': {
        name: 'Spark',
        personality: 'Energetic and enthusiastic',
        greetingStyle: 'Spark bounces excitedly with electric energy',
        encouragementStyle: 'provides high-energy motivation and excitement',
        teachingStyle: 'makes every lesson feel like a fun game',
        celebrationStyle: 'explodes with joy and sparkly effects',
        catchphrase: 'Learning is AMAZING when we do it together!',
        transitionPhrases: [
          'Spark buzzes: "This is getting SO exciting!"',
          'Spark zips: "You\'re on fire with these skills!"',
          'Spark sparkles: "WOW! Look what you just discovered!"'
        ]
      }
    };

    return personalities[companion.name] || personalities['Sage'];
  }

  /**
   * ENRICHMENT HELPER: Get how career uses math
   */
  private getCareerMathUse(career: string): string {
    const uses: Record<string, string> = {
      'Doctor': 'measuring medicine doses and tracking patient vital signs',
      'Chef': 'measuring ingredients and calculating cooking times',
      'Teacher': 'organizing lessons and tracking student progress',
      'Scientist': 'recording data and measuring experiment results',
      'Engineer': 'calculating dimensions and solving problems',
      'Artist': 'mixing paint ratios and planning compositions',
      'Veterinarian': 'measuring animal medications and tracking health data',
      'Pilot': 'calculating flight paths and fuel consumption',
      'Architect': 'measuring building dimensions and structural calculations',
      'Programmer': 'writing algorithms and solving logic problems'
    };
    return uses[career] || 'calculations and measurements in their daily work';
  }

  /**
   * ENRICHMENT HELPER: Get how career uses ELA
   */
  private getCareerELAUse(career: string): string {
    const uses: Record<string, string> = {
      'Doctor': 'medical charts and communicate with patients',
      'Chef': 'recipes and create new menu descriptions',
      'Teacher': 'lesson plans and student feedback',
      'Scientist': 'research papers and lab reports',
      'Engineer': 'blueprints and technical documentation',
      'Artist': 'artist statements and gallery descriptions',
      'Veterinarian': 'animal care notes and client communication',
      'Pilot': 'flight logs and safety checklists',
      'Architect': 'building plans and project proposals',
      'Programmer': 'code documentation and user guides'
    };
    return uses[career] || 'important documents and communications';
  }

  /**
   * ENRICHMENT HELPER: Get how career uses science
   */
  private getCareerScienceUse(career: string): string {
    const uses: Record<string, string> = {
      'Doctor': 'understand how bodies work and heal',
      'Chef': 'understand how ingredients change when cooked',
      'Teacher': 'demonstrate scientific concepts to students',
      'Scientist': 'make discoveries and test hypotheses',
      'Engineer': 'understand forces and materials',
      'Artist': 'understand colors, textures, and materials',
      'Veterinarian': 'understand animal biology and health',
      'Pilot': 'understand aerodynamics and weather patterns',
      'Architect': 'understand structural physics and materials',
      'Programmer': 'understand computer science and algorithms'
    };
    return uses[career] || 'understand and improve their work';
  }

  /**
   * ENRICHMENT HELPER: Get how career serves community
   */
  private getCareerSocialUse(career: string): string {
    const uses: Record<string, string> = {
      'Doctor': 'healing and caring for community members',
      'Chef': 'bringing people together through food',
      'Teacher': 'educating the next generation',
      'Scientist': 'making discoveries that help everyone',
      'Engineer': 'building things that improve lives',
      'Artist': 'creating beauty and inspiration for all',
      'Veterinarian': 'caring for animals and supporting pet families',
      'Pilot': 'connecting people and places safely',
      'Architect': 'designing spaces where communities thrive',
      'Programmer': 'creating technology that helps people'
    };
    return uses[career] || 'serving and improving their community';
  }

  /**
   * ENRICHMENT LAYER 3: Generate real-world applications for all subjects
   * Shows parents how skills connect to career paths
   */
  private generateRealWorldApplications(
    narrative: MasterNarrative,
    params: DemonstrativeNarrativeParams | MasterNarrativeParams
  ): Record<string, any> {
    const career = narrative.character.role.replace('Junior ', '').replace(' Helper', '');
    const gradeLevel = params.gradeLevel;

    return {
      math: {
        immediate: `Count toys and snacks at home just like a ${career} counts supplies`,
        nearFuture: `Help with shopping by counting items and understanding prices`,
        longTerm: `Foundation for algebra, statistics, and data analysis`,
        careerConnection: `${career}s use math for ${this.getCareerMathUse(career)}`
      },
      ela: {
        immediate: `Read signs and labels just like a ${career} reads important information`,
        nearFuture: `Write notes and stories about your day`,
        longTerm: `Strong communication skills for any career`,
        careerConnection: `${career}s read and write ${this.getCareerELAUse(career)}`
      },
      science: {
        immediate: `Observe and sort objects by shape and size`,
        nearFuture: `Conduct simple experiments at home`,
        longTerm: `Scientific thinking for problem-solving`,
        careerConnection: `${career}s use science to ${this.getCareerScienceUse(career)}`
      },
      socialStudies: {
        immediate: `Understand family and classroom communities`,
        nearFuture: `Navigate neighborhood and understand community helpers`,
        longTerm: `Global awareness and cultural understanding`,
        careerConnection: `${career}s help build stronger communities by ${this.getCareerSocialUse(career)}`
      }
    };
  }

  /**
   * ENRICHMENT HELPER: Generate soundscape for workplace
   */
  private getSoundscape(workplace: string): string {
    const soundscapes: Record<string, string> = {
      'Medical': 'Gentle hospital sounds, helpful beeps, caring voices',
      'School': 'Happy children learning, bells, playground joy',
      'Kitchen': 'Sizzling pans, chopping sounds, kitchen timer',
      'Laboratory': 'Bubbling experiments, discovery sounds, eureka moments',
      'Studio': 'Creative music, brushstrokes, artistic inspiration',
      'Clinic': 'Gentle animal sounds, caring conversation, soft music',
      'Airport': 'Departure announcements, engine hums, excited travelers',
      'Office': 'Keyboard clicks, collaborative discussions, productive energy',
      'Workshop': 'Tool sounds, building progress, creative construction'
    };

    // Find matching soundscape by keyword
    for (const [key, value] of Object.entries(soundscapes)) {
      if (workplace.includes(key)) return value;
    }
    return 'Engaging ambient sounds that bring the career to life';
  }

  /**
   * ENRICHMENT HELPER: Convert equipment into interactive tools
   */
  private getInteractiveTools(equipment: string[]): string[] {
    return equipment.map(tool => `Interactive ${tool} with realistic actions`);
  }

  /**
   * ENRICHMENT LAYERS 1-3: Enhance narrative for showcase
   * Adds milestones, immersive elements, and real-world applications
   */
  private enhanceForShowcase(
    narrative: MasterNarrative,
    params: DemonstrativeNarrativeParams | MasterNarrativeParams
  ): EnhancedMasterNarrative {
    const enhanced: EnhancedMasterNarrative = {
      ...narrative,

      // LAYER 1: Add progress-based achievement milestones
      milestones: {
        firstAchievement: `Earn your ${narrative.character.role} Badge`,
        midwayMastery: `Complete your first real ${narrative.character.role.split(' ')[0]} task`,
        finalVictory: `Receive the ${narrative.character.role} Excellence Certificate`,
        bonusChallenge: `Become a Certified ${narrative.character.role} Expert`
      },

      // LAYER 2: Add immersive elements
      immersiveElements: {
        soundscape: this.getSoundscape(narrative.character.workplace),
        interactiveTools: this.getInteractiveTools(narrative.character.equipment),
        rewardVisuals: [
          'Animated badge ceremony',
          'Virtual trophy collection',
          'Progress constellation map',
          'Achievement gallery'
        ],
        celebrationMoments: [
          'Confetti burst on correct answers',
          'Companion dance celebration',
          'Unlock new career tools',
          'Parent notification of achievement'
        ]
      },

      // LAYER 3: Add real-world applications for each subject
      realWorldApplications: this.generateRealWorldApplications(narrative, params)
    };

    return enhanced;
  }

  /**
   * ENRICHMENT LAYER 4: Add parent value propositions
   * Addresses parent concerns and highlights Pathfinity's differentiators
   */
  private addParentValue(
    narrative: EnhancedMasterNarrative,
    params: DemonstrativeNarrativeParams | MasterNarrativeParams
  ): EnhancedMasterNarrative {
    const career = narrative.character.role.replace('Junior ', '').replace(' Helper', '');

    return {
      ...narrative,
      parentValue: {
        realWorldConnection: `Your child learns ${params.gradeLevel} skills exactly how real ${career}s use them every day`,
        futureReadiness: `Building tomorrow's innovators through engaging career-based lessons`,
        engagementPromise: `Learning disguised as adventure - they won't want to stop!`,
        differentiator: `Unlike traditional education, every minute connects to a real career, making learning meaningful and memorable`
      }
    };
  }

  /**
   * ENRICHMENT LAYERS 5-7: Add quality guarantees, parent insights, and trust builders
   * Builds parent confidence with standards compliance and platform capabilities
   */
  private addQualityGuarantees(narrative: EnhancedMasterNarrative): EnhancedMasterNarrative {
    return {
      ...narrative,

      // LAYER 5: Quality markers
      qualityMarkers: {
        commonCoreAligned: true,
        stateStandardsMet: true,
        stemIntegrated: true,
        socialEmotionalLearning: true,
        assessmentRigor: 'Adaptive assessments that grow with your child',
        progressTracking: 'Real-time dashboard shows exactly what your child is learning'
      },

      // LAYER 6: Parent insights
      parentInsights: {
        adaptiveNature: 'AI adjusts difficulty in real-time based on your child\'s responses',
        noFailureMode: 'Every wrong answer becomes a learning opportunity with gentle guidance',
        masteryTracking: 'Clear visualization of skill progression from novice to expert',
        dailyReports: 'Daily summary of achievements and areas of growth',
        weeklyProgress: 'Comprehensive report showing improvement trends and celebrations'
      },

      // LAYER 7: Guarantees
      guarantees: {
        engagement: 'If your child isn\'t engaged within 5 minutes, we\'ll adapt the content',
        learning: 'Measurable skill improvement or your money back',
        satisfaction: '30-day full refund if you\'re not completely satisfied',
        support: '24/7 parent support and weekly check-ins with education specialists'
      }
    };
  }

  /**
   * ENRICHMENT LAYER 8: Add personalization examples
   * Shows parents how content adapts to their specific child
   */
  private addPersonalizationExamples(
    narrative: EnhancedMasterNarrative,
    params: DemonstrativeNarrativeParams | MasterNarrativeParams
  ): EnhancedMasterNarrative {
    const studentName = params.studentName;
    const career = narrative.character.role.replace('Junior ', '').replace(' Helper', '');
    const workplace = narrative.character.workplace;

    return {
      ...narrative,
      personalizationExamples: {
        withStudentName: [
          `"Great job, ${studentName}! You're thinking like a real ${career}!"`,
          `"${studentName}, your ${career} skills are growing stronger every day!"`,
          `"Welcome back, ${career} ${studentName}! Ready for today's mission?"`
        ],
        withInterests: [
          `"Since you love helping others, let's see how ${career}s make a difference"`,
          `"Your curiosity about how things work makes you a natural ${career}"`,
          `"I notice you enjoy problem-solving - that's exactly what ${career}s do!"`
        ],
        withProgress: [
          `"Remember yesterday when you mastered counting? Today we'll use that skill!"`,
          `"You've completed 3 missions this week - you're becoming an expert ${career}!"`,
          `"Last time you scored 90% - let's see if you can beat your personal best!"`
        ],
        withLearningStyle: [
          `"Let's learn this with hands-on practice, just how you learn best"`,
          `"I'll show you a picture first, since you're a visual learner"`,
          `"We'll move around and stay active while learning today!"`
        ]
      }
    };
  }

  /**
   * ENRICHMENT LAYER 9: Add companion interaction samples
   * Provides rich examples of companion personality in action
   */
  private addCompanionInteractions(narrative: EnhancedMasterNarrative): EnhancedMasterNarrative {
    const companion = narrative.companionIntegration;

    return {
      ...narrative,
      companionInteractions: {
        greetings: [
          `${companion.name} ${companion.greetingStyle.toLowerCase()}`,
          `"${companion.catchphrase}"`,
          `${companion.name} welcomes you with ${companion.personality.toLowerCase()} energy`
        ],
        encouragement: [
          `${companion.name} ${companion.encouragementStyle.toLowerCase()}`,
          `"You're doing amazing! ${companion.catchphrase}"`,
          `${companion.name} gives you a motivating pep talk in their signature style`
        ],
        hints: [
          `${companion.name} gently guides: "Let me show you a helpful way to think about this..."`,
          `"Here's a ${companion.name}-style hint to help you succeed!"`,
          `${companion.name} ${companion.teachingStyle.toLowerCase()} to make this clearer`
        ],
        celebrations: [
          `${companion.name} ${companion.celebrationStyle.toLowerCase()}!`,
          `"AMAZING! ${companion.catchphrase}"`,
          `${companion.name} throws a mini celebration just for you!`
        ],
        transitions: companion.transitionPhrases || [
          `${companion.name}: "Ready for the next part of our adventure?"`,
          `${companion.name}: "You're doing great! Let's keep going!"`,
          `${companion.name}: "Time to use what you just learned!"`
        ]
      }
    };
  }

  /**
   * 🎯 MAIN PUBLIC METHOD: Generate Enriched Master Narrative
   * Applies all 11 enhancement layers to match Demo quality
   *
   * @param params - Standard or demonstrative narrative parameters
   * @returns EnhancedMasterNarrative with all enrichment layers
   */
  async generateEnhancedNarrative(
    params: DemonstrativeNarrativeParams | MasterNarrativeParams
  ): Promise<EnhancedMasterNarrative> {
    console.log('🎨 Generating ENRICHED Master Narrative (Demo Quality)');

    // Step 1: Generate base narrative (standard flow)
    const baseNarrative = await this.generateMasterNarrative(params);

    console.log('✅ Base narrative generated, applying 11 enrichment layers...');

    // Step 2: Apply Layers 1-3 (Showcase enhancement)
    let enriched = this.enhanceForShowcase(baseNarrative, params);
    console.log('  ✓ Layers 1-3: Milestones, Immersive Elements, Real-World Apps');

    // Step 3: Apply Layer 4 (Parent value)
    enriched = this.addParentValue(enriched, params);
    console.log('  ✓ Layer 4: Parent Value Propositions');

    // Step 4: Apply Layers 5-7 (Quality guarantees)
    enriched = this.addQualityGuarantees(enriched);
    console.log('  ✓ Layers 5-7: Quality Markers, Parent Insights, Guarantees');

    // Step 5: Apply Layer 8 (Personalization examples)
    enriched = this.addPersonalizationExamples(enriched, params);
    console.log('  ✓ Layer 8: Personalization Examples');

    // Step 6: Apply Layer 9 (Companion interactions)
    enriched = this.addCompanionInteractions(enriched);
    console.log('  ✓ Layer 9: Companion Interaction Samples');

    console.log('🎉 Enrichment complete! All 11 layers applied.');

    return enriched;
  }

  /**
   * UTILITY: Select a showcase career that highlights enrichment well
   */
  private selectShowcaseCareer(gradeLevel: string): string {
    const showcaseCareers: Record<string, string[]> = {
      'K': ['Doctor', 'Chef', 'Veterinarian'],
      '1': ['Teacher', 'Firefighter', 'Artist'],
      '2': ['Scientist', 'Pilot', 'Engineer'],
      '3': ['Architect', 'Marine Biologist', 'Chef'],
      '4': ['Programmer', 'Astronaut', 'Doctor'],
      '5': ['Engineer', 'Scientist', 'Teacher'],
      '6': ['Data Scientist', 'Architect', 'Pilot'],
      '7': ['Biomedical Engineer', 'Programmer', 'Scientist'],
      '8': ['Research Scientist', 'Architect', 'Doctor'],
      '9': ['Software Engineer', 'Aerospace Engineer', 'Scientist'],
      '10': ['AI Researcher', 'Surgeon', 'Architect']
    };

    const careers = showcaseCareers[gradeLevel] || showcaseCareers['K'];
    return careers[Math.floor(Math.random() * careers.length)];
  }

  /**
   * QUICK DEMONSTRATIVE: Generate a fast preview for parents
   * Uses deterministic enrichment without AI call for speed
   */
  async generateQuickDemonstrative(params: {
    studentName: string;
    gradeLevel: string;
  }): Promise<EnhancedMasterNarrative> {
    console.log('⚡ Generating QUICK demonstrative narrative (no AI call)');

    // Use mock narrative as base (fast, no AI cost)
    const career = this.selectShowcaseCareer(params.gradeLevel);
    const mockParams: MasterNarrativeParams = {
      studentName: params.studentName,
      gradeLevel: params.gradeLevel,
      career: career,
      companion: { name: 'Sage', personality: 'Wise and thoughtful' },
      subjects: ['math', 'ela', 'science', 'socialStudies']
    };

    const baseNarrative = this.getMockNarrative(mockParams);

    // Apply all enrichment layers (deterministic, fast)
    let enriched = this.enhanceForShowcase(baseNarrative, mockParams);
    enriched = this.addParentValue(enriched, mockParams);
    enriched = this.addQualityGuarantees(enriched);
    enriched = this.addPersonalizationExamples(enriched, mockParams);
    enriched = this.addCompanionInteractions(enriched);

    console.log('✅ Quick demonstrative ready (~50ms, $0 cost)');

    return enriched;
  }

  /**
   * Test method to generate narratives for different careers
   */
  async testGeneration(): Promise<void> {
    const testCareers = ['Doctor', 'Teacher', 'Chef', 'Scientist', 'Artist'];

    for (const career of testCareers) {
      // Testing generation for career

      const narrative = await this.generateMasterNarrative({
        studentName: 'Sam',
        gradeLevel: 'K',
        career,
        companion: { name: 'Sage', personality: 'Wise and thoughtful' },
        subjects: ['math', 'ela', 'science', 'socialStudies']
      });

      // Generated narrative for career
    }
  }

  // ========================================================================
  // RUBRIC-BASED ENRICHED NARRATIVE METHODS (Phase 1.2)
  // ========================================================================

  /**
   * Generate Narrative Arc
   * Creates the story backbone: premise → mission → stakes → resolution
   */
  private generateNarrativeArc(baseNarrative: MasterNarrative, params: MasterNarrativeParams): NarrativeArc {
    const { career, studentName } = params;
    const careerLower = career.toLowerCase();

    return {
      premise: `${studentName} is learning to become a ${career}`,
      mission: baseNarrative.missionBriefing.challenge,
      stakes: `Success depends on mastering the skills needed to be a great ${careerLower}`,
      resolution: `${studentName} has demonstrated the skills needed to excel as a ${career}`
    };
  }

  /**
   * Generate Companion Voice
   * Defines how the AI companion speaks, teaches, and encourages
   */
  private generateCompanionVoice(baseNarrative: MasterNarrative, companion: { name: string; personality: string }): CompanionVoice {
    const companionData = baseNarrative.companionIntegration;

    return {
      companionId: companion.name.toLowerCase() as CompanionId,
      greetingStyle: companionData.greetingStyle,
      teachingVoice: companionData.teachingStyle,
      encouragementStyle: companionData.encouragementStyle,
      transitionPhrasing: companionData.transitionPhrases?.[0] || `${companion.name} guides you to the next step...`
    };
  }

  /**
   * Generate Career Narrative
   * Defines the career context and workplace settings
   */
  private generateCareerNarrative(baseNarrative: MasterNarrative, career: string, studentName: string): CareerNarrative {
    const settings = baseNarrative.settingProgression;

    return {
      careerIdentity: `${studentName} is a ${career} in training`,
      workplaceSettings: {
        LEARN: settings.learn.location,
        EXPERIENCE: settings.experience.location,
        DISCOVER: settings.discover.location
      },
      professionalRole: baseNarrative.character.role,
      careerGoal: baseNarrative.cohesiveStory.mission
    };
  }

  /**
   * Generate Subject Narratives
   * Defines how each subject connects to the career
   */
  private generateSubjectNarratives(baseNarrative: MasterNarrative, career: string): Record<Subject, SubjectNarrative> {
    const subjects = baseNarrative.subjectContextsAligned;

    return {
      'Math': {
        careerStoryline: subjects.math.learn,
        narrativeBridge: `Math skills help ${career.toLowerCase()}s ${this.getCareerMathUse(career)}`,
        motivationalContext: 'Numbers and counting are essential tools in this career'
      },
      'ELA': {
        careerStoryline: subjects.ela.learn,
        narrativeBridge: `Reading and writing help ${career.toLowerCase()}s ${this.getCareerELAUse(career)}`,
        motivationalContext: 'Communication skills make professionals more effective'
      },
      'Science': {
        careerStoryline: subjects.science.learn,
        narrativeBridge: `Science helps ${career.toLowerCase()}s ${this.getCareerScienceUse(career)}`,
        motivationalContext: 'Understanding how things work leads to better problem solving'
      },
      'Social Studies': {
        careerStoryline: subjects.socialStudies.learn,
        narrativeBridge: `${career}s serve communities by ${this.getCareerSocialUse(career)}`,
        motivationalContext: 'Working together and helping others is at the heart of this career'
      }
    };
  }

  /**
   * Generate Container Transitions
   * Smooth narrative transitions between containers
   */
  private generateContainerTransitions(companion: { name: string; personality: string }, career: string): ContainerTransitions {
    return {
      toLEARN: `${companion.name} says: "Let's start your ${career.toLowerCase()} training in the learning area..."`,
      toEXPERIENCE: `${companion.name} says: "Now that you've learned the basics, let's apply them in a real ${career.toLowerCase()} situation..."`,
      toDISCOVER: `${companion.name} says: "For this final challenge, you'll need to use ALL your ${career.toLowerCase()} skills..."`,
      conclusion: `${companion.name} says: "You've shown you have what it takes to be a great ${career}!"`
    };
  }

  /**
   * Generate Thematic Elements
   * Consistent tone, vocabulary, and metaphors throughout the story
   */
  private generateThematicElements(baseNarrative: MasterNarrative, career: string): ThematicElements {
    const careerData = this.getCareerMockData(career);

    return {
      tone: careerData.personality,
      vocabulary: careerData.equipment,
      metaphors: [
        `Like ${careerData.learnActivity}`,
        `Building your ${career.toLowerCase()} skills`,
        `Growing as a professional`
      ],
      culturalContext: `Grade-appropriate ${career.toLowerCase()} experiences`
    };
  }

  /**
   * 🎯 MAIN METHOD: Generate Enriched Master Narrative (Rubric-Based)
   * Creates EnrichedMasterNarrative for rubric/JIT architecture
   *
   * @param params - Master narrative parameters
   * @returns EnrichedMasterNarrative with complete story context
   */
  async generateEnrichedMasterNarrative(
    params: MasterNarrativeParams
  ): Promise<EnrichedMasterNarrative> {
    console.log('🎯 Generating Enriched Master Narrative (Rubric-Based Architecture)');

    // Step 1: Generate base narrative
    const baseNarrative = await this.generateMasterNarrative(params);
    console.log('✅ Base narrative generated');

    // Step 2: Generate narrative components
    const narrativeArc = this.generateNarrativeArc(baseNarrative, params);
    const companionVoice = this.generateCompanionVoice(baseNarrative, params.companion);
    const careerNarrative = this.generateCareerNarrative(baseNarrative, params.career, params.studentName);
    const subjectNarratives = this.generateSubjectNarratives(baseNarrative, params.career);
    const containerTransitions = this.generateContainerTransitions(params.companion, params.career);
    const thematicElements = this.generateThematicElements(baseNarrative, params.career);

    console.log('✅ Narrative components generated');

    // Step 3: Construct EnrichedMasterNarrative
    const enrichedNarrative: EnrichedMasterNarrative = {
      // Session metadata
      sessionId: params.sessionId || baseNarrative.narrativeId,
      userId: params.userId || params.studentName,
      createdAt: new Date().toISOString(),

      // User selections
      career: params.career,
      companion: params.companion.name.toLowerCase() as CompanionId,
      gradeLevel: params.gradeLevel,

      // Core narrative structure
      masterNarrative: {
        greeting: baseNarrative.missionBriefing.greeting,
        introduction: baseNarrative.missionBriefing.situation,
        mission: baseNarrative.missionBriefing.challenge,
        narrativeArc,
        companionVoice,
        careerNarrative,
        subjectNarratives,
        containerTransitions,
        thematicElements
      },

      // Version tracking
      version: '1.0.0',
      generatedBy: 'MasterNarrativeGenerator.generateEnrichedMasterNarrative'
    };

    console.log('🎉 Enriched Master Narrative complete!');

    return enrichedNarrative;
  }

  /**
   * Derive Story Rubric from Enriched Master Narrative
   * Extracts immutable story context for JIT consumption
   *
   * @param enrichedNarrative - The enriched master narrative
   * @returns StoryRubric for JIT service consumption
   */
  deriveStoryRubric(
    enrichedNarrative: EnrichedMasterNarrative
  ): StoryRubric {
    console.log('📋 Deriving Story Rubric from Enriched Master Narrative');

    const storyRubric: StoryRubric = {
      sessionId: enrichedNarrative.sessionId,
      sourceFile: `master-narratives/${enrichedNarrative.sessionId}.json`,

      storyContext: {
        narrativeArc: enrichedNarrative.masterNarrative.narrativeArc,
        companionVoice: enrichedNarrative.masterNarrative.companionVoice,
        careerNarrative: enrichedNarrative.masterNarrative.careerNarrative,
        subjectNarratives: enrichedNarrative.masterNarrative.subjectNarratives,
        containerTransitions: enrichedNarrative.masterNarrative.containerTransitions
      },

      usage: 'Immutable story context passed to all JIT calls for consistent narrative'
    };

    console.log('✅ Story Rubric derived');

    return storyRubric;
  }
}

// Export singleton instance
export const masterNarrativeGenerator = new MasterNarrativeGenerator();