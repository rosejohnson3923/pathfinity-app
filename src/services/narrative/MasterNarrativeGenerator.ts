/**
 * Master Narrative Generator - Phase 1 Implementation
 * Generates comprehensive career-based narratives that span all subjects and containers
 * Based on the MASTER RUBRIC structure (Sam K Doctor example)
 */

import { MultiModelService } from '../ai-models/MultiModelService';

/**
 * Master Narrative Interface - Matches our MASTER RUBRIC exactly
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
  journeyArc: {
    checkIn: string;                  // "Sam arrives at CareerInc Lobby as Junior Doctor Helper"
    learn: string;                    // "Virtual Academy - Medical Helper Basics"
    experience: string;               // "Virtual Workplace - CareerInc Children's Clinic"
    discover: string;                 // "Virtual Field Trip - Community Health Fair"
  };
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
  subjects: string[];  // Always ['math', 'ela', 'science', 'socialStudies']
}

/**
 * Master Narrative Generator Service
 */
export class MasterNarrativeGenerator {
  private aiService: MultiModelService;

  constructor() {
    this.aiService = new MultiModelService();
  }

  /**
   * Generate a complete Master Narrative in real-time
   * Phase 1: No caching, direct AI call every time
   */
  async generateMasterNarrative(params: MasterNarrativeParams): Promise<MasterNarrative> {
    console.log('🎭 Generating Master Narrative for:', params);

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
      console.log(`✅ Master Narrative generated in ${generationTime}ms`);

      // Parse and validate the response
      const narrative = this.parseAndValidateNarrative(response, params);

      // Log if fun facts are present
      if (narrative.subjectContextsAlignedFacts) {
        console.log('🎉 Fun facts included in Master Narrative:', {
          math: narrative.subjectContextsAlignedFacts.math?.length || 0,
          ela: narrative.subjectContextsAlignedFacts.ela?.length || 0,
          science: narrative.subjectContextsAlignedFacts.science?.length || 0,
          socialStudies: narrative.subjectContextsAlignedFacts.socialStudies?.length || 0
        });
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
        console.log('🔄 Using mock narrative for development');
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
    "role": "Junior ${career} Helper",
    "workplace": "CareerInc ${career} Center",
    "personality": "[3-4 positive traits appropriate for the career]",
    "equipment": ["List 4 career-specific tools/items"]
  },
  "journeyArc": {
    "checkIn": "${studentName} arrives at CareerInc Lobby as Junior ${career} Helper",
    "learn": "Virtual Academy - ${career} Helper Basics",
    "experience": "Virtual Workplace - CareerInc ${career} [specific workplace]",
    "discover": "Virtual Field Trip - [Community location for ${career}]"
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
      "context": "Learning ${career} basics with [career] examples",
      "narrative": "${studentName} studies how ${career}s [core learning activity]"
    },
    "experience": {
      "location": "CareerInc [specific ${career} workplace]",
      "context": "${studentName}'s workplace where [work activity happens]",
      "narrative": "${studentName} makes real ${career} helper decisions"
    },
    "discover": {
      "location": "[Community location] for ${career}s",
      "context": "Field trip to see how ${career}s serve communities",
      "narrative": "${studentName} helps at [community activity]"
    }
  },
  "visualTheme": {
    "colors": "[Primary colors associated with ${career}]",
    "setting": "[Visual environment description]",
    "props": "[Key visual elements and tools]"
  },
  "subjectContextsAligned": {
    "math": {
      "learn": "Study how ${career}s use [specific math skill for grade ${gradeLevel}]",
      "experience": "[Apply math skill] as a ${career} helper",
      "discover": "See how [math skill] helps ${career}s in the community"
    },
    "ela": {
      "learn": "Learn to [ELA skill] like ${career}s do",
      "experience": "[Apply ELA skill] in ${career} work",
      "discover": "[Use ELA skill] to help the community"
    },
    "science": {
      "learn": "Study [science concept] that ${career}s use",
      "experience": "[Apply science] as a ${career} helper",
      "discover": "Explore how ${career}s use [science] in real life"
    },
    "socialStudies": {
      "learn": "Learn how ${career}s build communities",
      "experience": "Build [workplace] community as a ${career}",
      "discover": "See how ${career}s serve and unite communities"
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
  }
}

REQUIREMENTS for Grade ${gradeLevel}:
${this.getGradeSpecificRequirements(gradeLevel)}

IMPORTANT:
- Use age-appropriate language
- Create engaging, cohesive story that connects all subjects
- Ensure all subject contexts relate to actual ${career} work
- Include specific, concrete examples
- Make the career aspirational but accessible
- Use "CareerInc" branding consistently
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
      console.log('Raw AI response:', response);

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
        console.log('Generated narrativeId:', narrative.narrativeId);
      }

      // Validate required fields
      const required = [
        'character',
        'journeyArc',
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
    const { studentName, gradeLevel, career } = params;

    // Generate career-specific mock data
    const careerData = this.getCareerMockData(career);

    return {
      narrativeId: `narr_${studentName.toLowerCase()}_${career.toLowerCase().replace(/\s+/g, '_')}_${gradeLevel.toLowerCase()}_${Date.now()}`,
      character: {
        name: studentName,
        role: `Junior ${career} Helper`,
        workplace: `CareerInc ${career} Center`,
        personality: careerData.personality,
        equipment: careerData.equipment
      },
      journeyArc: {
        checkIn: `${studentName} arrives at CareerInc Lobby as Junior ${career} Helper`,
        learn: `Virtual Academy - ${career} Helper Basics`,
        experience: `Virtual Workplace - CareerInc ${careerData.workplace}`,
        discover: `Virtual Field Trip - ${careerData.fieldTrip}`
      },
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
      console.log(`Creating generic mock data for unknown career: ${career}`);
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
   * Test method to generate narratives for different careers
   */
  async testGeneration(): Promise<void> {
    const testCareers = ['Doctor', 'Teacher', 'Chef', 'Scientist', 'Artist'];

    for (const career of testCareers) {
      console.log(`\n🧪 Testing generation for: ${career}`);

      const narrative = await this.generateMasterNarrative({
        studentName: 'Sam',
        gradeLevel: 'K',
        career,
        subjects: ['math', 'ela', 'science', 'socialStudies']
      });

      console.log(`✅ Generated narrative for ${career}:`);
      console.log(`   - Role: ${narrative.character.role}`);
      console.log(`   - Workplace: ${narrative.character.workplace}`);
      console.log(`   - Mission: ${narrative.cohesiveStory.mission}`);
      console.log(`   - Cost: $${narrative.generationCost}`);
    }
  }
}

// Export singleton instance
export const masterNarrativeGenerator = new MasterNarrativeGenerator();