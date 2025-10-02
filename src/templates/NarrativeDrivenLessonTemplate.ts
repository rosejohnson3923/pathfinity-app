/**
 * Narrative-Driven Lesson Template
 *
 * ⚠️ USAGE: FOR PARENT/TEACHER APPROVAL DASHBOARDS ONLY
 *
 * Generates the magical, story-driven demonstrative lesson plans
 * that show parents EXACTLY how their child will learn through adventure
 *
 * Uses DemonstrativeMasterNarrativeGenerator for enhanced narratives
 */

import {
  demonstrativeNarrativeGenerator,
  EnhancedMasterNarrative
} from '../services/narrative/DemonstrativeMasterNarrativeGenerator';

// ============================================================================
// Type Definitions
// ============================================================================

export interface SkillReference {
  subject: 'Math' | 'ELA' | 'Science' | 'Social Studies';
  grade: number;
  cluster: string;
  skillNumber: string;
  skillName: string;
  standard: string; // e.g., "7.A.A.1"
}

export interface StudentInput {
  name: string;
  grade: number;
  date: Date;
}

export interface SkillSet {
  math: SkillReference;
  ela: SkillReference;
  science: SkillReference;
  social: SkillReference;
}

export interface NarrativeLessonPlan {
  header: {
    title: string;
    subtitle: string;
    sampleCareer: string;
    sampleCompanion: string;
    student: string;
    grade: number;
    date: string;
  };

  missionTitle: string;
  missionBriefing: string;

  act1: NarrativeAct;
  act2: NarrativeAct;
  act3: NarrativeAct;

  celebration: string;

  skillsVerification: {
    title: string;
    standards: SkillStandard[];
    magicExplanation: MagicMapping[];
    masteryTargets: MasteryTarget[];
  };

  parentGuarantee: {
    narrativeMagic: string;
    standardsCompliance: string;
    engagementArchitecture: string;
    personalizationPromise: string;
  };

  careerSwitcher: CareerOption[];
}

interface NarrativeAct {
  title: string;
  setting?: string;
  subjects: NarrativeSubject[];
  transition?: string;
}

interface NarrativeSubject {
  icon: string;
  subject: string;
  narrative: string;
  skillTag: string;
  immersion?: string;
}

interface SkillStandard {
  subject: string;
  grade: number;
  cluster: string;
  skillCode: string;
  standardName: string;
}

interface MagicMapping {
  narrative: string;
  skill: string;
}

interface MasteryTarget {
  skill: string;
  target: string;
}

interface CareerOption {
  career: string;
  emoji: string;
  teaser: string;
}

// ============================================================================
// Main Generator Class
// ============================================================================

export class NarrativeDrivenLessonGenerator {
  // Sample careers for demonstration - MUST match TestSelectLessonTemplate order
  private readonly DEMO_CAREERS = [
    { name: 'Marine Biologist', emoji: '🐋', setting: 'Coral Reef Research Station' },
    { name: 'Chef', emoji: '👨‍🍳', setting: 'Five-Star Restaurant Kitchen' },
    { name: 'Astronaut', emoji: '🚀', setting: 'International Space Station' },
    { name: 'Electrician', emoji: '⚡', setting: 'Industrial Power Plant' },
    { name: 'AI Doctor', emoji: '🤖', setting: 'Advanced Medical AI Center' }
  ];

  private readonly COMPANIONS = [
    { name: 'Sage', emoji: '🦉', personality: 'wise and thoughtful' },
    { name: 'Spark', emoji: '⚡', personality: 'energetic and encouraging' },
    { name: 'Finn', emoji: '🎯', personality: 'fun and adventurous' }
  ];

  /**
   * Generate a narrative-driven demonstrative lesson plan
   */
  async generateDemonstrativeLessonPlan(
    student: StudentInput,
    skills: SkillSet,
    careerIndex: number = 0
  ): Promise<NarrativeLessonPlan> {
    const career = this.DEMO_CAREERS[careerIndex % this.DEMO_CAREERS.length];
    const companion = this.COMPANIONS[Math.floor(Math.random() * this.COMPANIONS.length)];

    // Generate enhanced narrative
    const narrative = await demonstrativeNarrativeGenerator.generateQuickDemonstrative(
      student.name,
      student.grade.toString(),
      skills
    );

    return {
      header: this.generateHeader(student, career, companion),
      missionTitle: this.generateMissionTitle(career.name),
      missionBriefing: this.generateMissionBriefing(student.name, career, companion, narrative),
      act1: this.generateAct1(skills, career, narrative),
      act2: this.generateAct2(skills, career, narrative),
      act3: this.generateAct3(skills, career, narrative),
      celebration: this.generateCelebration(career.name),
      skillsVerification: this.generateSkillsVerification(skills, career),
      parentGuarantee: this.generateParentGuarantee(narrative),
      careerSwitcher: this.generateCareerOptions(skills)
    };
  }

  private generateHeader(student: StudentInput, career: any, companion: any) {
    return {
      title: "TOMORROW'S LEARNING EXPERIENCE (SAMPLE)",
      subtitle: "This demonstrative lesson shows EXACTLY how your child will learn tomorrow - just with their chosen career!",
      sampleCareer: `${career.name} ${career.emoji}`,
      sampleCompanion: `${companion.name} ${companion.emoji}`,
      student: student.name,
      grade: student.grade,
      date: this.formatDate(student.date)
    };
  }

  private generateMissionTitle(career: string): string {
    const titles: Record<string, string> = {
      'Marine Biologist': 'THE OCEAN RESEARCH EXPEDITION',
      'Chef': 'THE MASTER CHEF CHALLENGE',
      'Astronaut': 'THE SPACE STATION MISSION',
      'Electrician': 'THE POWER GRID RESTORATION',
      'AI Doctor': 'THE AI-ASSISTED MEDICAL BREAKTHROUGH'
    };
    return titles[career] || 'THE CAREER ADVENTURE';
  }

  private generateMissionBriefing(
    studentName: string,
    career: any,
    companion: any,
    narrative: EnhancedMasterNarrative
  ): string {
    // Career-specific mission briefings with rich detail
    const missionBriefings: Record<string, string> = {
      'Marine Biologist': `Morning Briefing from ${companion.name}:\n` +
        `"Welcome to the Coral Reef Research Station, Marine Biologist ${studentName}!\n` +
        `We've discovered a mysterious temperature anomaly affecting the coral at coordinates 18°S, 147°E.\n` +
        `The reef's ecosystem is in danger! Your mission today requires mastering integers to track\n` +
        `temperature changes, analyzing research reports for clues, conducting scientific experiments,\n` +
        `and navigating precisely between reef zones. The ocean is counting on you!"`,

      'Astronaut': `Space Briefing from ${companion.name}:\n` +
        `"Welcome to the International Space Station, Astronaut ${studentName}!\n` +
        `Houston has detected an anomaly in our orbit trajectory at altitude +408km.\n` +
        `The station's systems need recalibration! Your mission requires calculating altitude\n` +
        `changes with integers, analyzing mission logs for patterns, conducting zero-gravity\n` +
        `experiments scientifically, and navigating using Earth coordinates. The crew depends on you!"`,

      'Chef': `Kitchen Briefing from ${companion.name}:\n` +
        `"Welcome to Le Magnifique Restaurant, Chef ${studentName}!\n` +
        `The famous food critic Antoine Delacroix arrives tonight, and we need a perfect menu.\n` +
        `Our signature dish requires precise temperature control! Your mission involves managing\n` +
        `freezer and oven temperatures with integers, finding the secret technique in our recipe\n` +
        `archives, experimenting with rising dough scientifically, and sourcing ingredients from\n` +
        `global coordinates. Let's earn that fifth star!"`,

      'Electrician': `Safety Briefing from ${companion.name}:\n` +
        `"Welcome to the Industrial Power Plant, Electrician ${studentName}!\n` +
        `Grid sector 7 has lost power after a storm - 10,000 homes are in the dark!\n` +
        `Voltage is reading -240V where it should be +240V. Your mission requires calculating\n` +
        `voltage differentials with integers, reading electrical schematics for the fault,\n` +
        `testing circuits scientifically while following safety protocols, and locating\n` +
        `damaged substations using grid coordinates. Let's restore the power safely!"`,

      'AI Doctor': `Medical AI Briefing from ${companion.name}:\n` +
        `"Welcome to the Advanced Medical AI Center, Dr. ${studentName}!\n` +
        `We have a complex case: patient vitals showing +15 heart rate variance and -8 oxygen levels.\n` +
        `Our AI diagnostic system needs your expertise! Your mission requires analyzing patient\n` +
        `data trends with integers, prompting AI for differential diagnoses, verifying AI\n` +
        `recommendations scientifically, and tracking outbreak patterns using global coordinates.\n` +
        `Together with AI, we'll solve this medical mystery!"`
    };

    // Add companion personality to the briefing
    const companionClosing: Record<string, string> = {
      'Sage': `\n\n🦉 ${companion.name} adjusts glasses thoughtfully: "Remember, every problem has a solution when we approach it wisely. I'll guide you through each challenge."`,
      'Spark': `\n\n⚡ ${companion.name} bounces excitedly: "This is going to be AMAZING! I can't wait to see what we discover together! Are you ready?!"`,
      'Finn': `\n\n🎯 ${companion.name} grins adventurously: "What an adventure! With your skills and my guidance, we'll ace this mission for sure!"`
    };

    const baseBriefing = missionBriefings[career.name] ||
      narrative.cohesiveStory.mission ||
      `Welcome to your ${career.name} adventure, ${studentName}! Today's mission awaits!`;

    return baseBriefing + (companionClosing[companion.name] || '');
  }

  private generateAct1(
    skills: SkillSet,
    career: any,
    narrative: EnhancedMasterNarrative
  ): NarrativeAct {
    return {
      title: 'ACT 1: LEARN (The Research Briefing)',
      setting: career.setting,
      subjects: [
        {
          icon: '📊',
          subject: 'MATH',
          narrative: this.getMathNarrative(skills.math, career.name),
          skillTag: `[${skills.math.standard}]`,
          immersion: 'Interactive number line visualization'
        },
        {
          icon: '📖',
          subject: 'ELA',
          narrative: this.getELANarrative(skills.ela, career.name),
          skillTag: `[${skills.ela.standard}]`,
          immersion: 'Highlighted text analysis tools'
        },
        {
          icon: '🔬',
          subject: 'SCIENCE',
          narrative: this.getScienceNarrative(skills.science, career.name),
          skillTag: `[${skills.science.standard}]`,
          immersion: 'Virtual lab equipment'
        },
        {
          icon: '🌍',
          subject: 'SOCIAL',
          narrative: this.getSocialNarrative(skills.social, career.name),
          skillTag: `[${skills.social.standard}]`,
          immersion: 'Interactive 3D globe'
        }
      ],
      transition: narrative.companionInteractions?.transitions?.[0] ||
        'Sage whispers: "Each discovery brings you closer to solving the mystery..."'
    };
  }

  private generateAct2(
    skills: SkillSet,
    career: any,
    narrative: EnhancedMasterNarrative
  ): NarrativeAct {
    const challenges = this.getIntegratedChallenges(skills, career.name);

    return {
      title: 'ACT 2: EXPERIENCE (The Deep Dive)',
      setting: this.getAct2Setting(career.name),
      subjects: challenges.map(challenge => ({
        icon: challenge.icon,
        subject: challenge.skill,
        narrative: challenge.narrative,
        skillTag: `[${challenge.standard}]`
      })),
      transition: '*Interactive simulations bring the experience to life*'
    };
  }

  private generateAct3(
    skills: SkillSet,
    career: any,
    narrative: EnhancedMasterNarrative
  ): NarrativeAct {
    return {
      title: 'ACT 3: DISCOVER (Save the Day!)',
      setting: this.getPresentationSetting(career.name),
      subjects: [
        {
          icon: '📈',
          subject: 'Present',
          narrative: `Present to the ${this.getAuthorityFigure(career.name)}!`,
          skillTag: ''
        },
        {
          icon: '📊',
          subject: 'Math Data',
          narrative: `Show ${this.getMathPresentation(skills.math, career.name)}`,
          skillTag: `[${skills.math.standard}]`
        },
        {
          icon: '📝',
          subject: 'Written Report',
          narrative: `Share main findings from research`,
          skillTag: `[${skills.ela.standard}]`
        },
        {
          icon: '🔬',
          subject: 'Experiment Results',
          narrative: `Demonstrate your experiment results`,
          skillTag: `[${skills.science.standard}]`
        },
        {
          icon: '🗺️',
          subject: 'Location Analysis',
          narrative: `Map the affected locations`,
          skillTag: `[${skills.social.standard}]`
        }
      ]
    };
  }

  private generateCelebration(career: string): string {
    return `CELEBRATION: "Junior ${career}" certification earned! 🏆`;
  }

  private generateSkillsVerification(skills: SkillSet, career: any) {
    return {
      title: '📊 SKILLS MASTERY VERIFICATION',
      standards: [
        this.formatStandard(skills.math),
        this.formatStandard(skills.ela),
        this.formatStandard(skills.science),
        this.formatStandard(skills.social)
      ],
      magicExplanation: [
        {
          narrative: this.getNarrativeElement(career.name, 'math'),
          skill: `Teaching ${skills.math.skillName}`
        },
        {
          narrative: this.getNarrativeElement(career.name, 'ela'),
          skill: `Finding ${skills.ela.skillName}`
        },
        {
          narrative: this.getNarrativeElement(career.name, 'science'),
          skill: `${skills.science.skillName}`
        },
        {
          narrative: this.getNarrativeElement(career.name, 'social'),
          skill: `${skills.social.skillName}`
        }
      ],
      masteryTargets: [
        {
          skill: `Math ${skills.math.standard}`,
          target: '80% accuracy plotting integers'
        },
        {
          skill: `ELA ${skills.ela.standard}`,
          target: 'Identify main idea + 3 supporting details'
        },
        {
          skill: `Science ${skills.science.standard}`,
          target: 'Complete all 6 inquiry steps'
        },
        {
          skill: `Social ${skills.social.standard}`,
          target: 'Navigate 3 coordinates correctly'
        }
      ]
    };
  }

  private generateParentGuarantee(narrative: EnhancedMasterNarrative) {
    return {
      narrativeMagic: narrative.parentValue?.engagementPromise ||
        "See how the mission creates urgency and purpose? Your child won't realize they're learning - they're on an adventure!",

      standardsCompliance: "Every skill tag maps to real Common Core standards. Full mastery guaranteed through career context.",

      engagementArchitecture: "Three acts maintain story momentum for 2+ hours. No worksheets, just adventure with hidden learning.",

      personalizationPromise: "Tomorrow YOUR child chooses their own career and companion. But they'll STILL master all required skills!"
    };
  }

  private generateCareerOptions(skills: SkillSet): CareerOption[] {
    return this.DEMO_CAREERS.map(career => ({
      career: career.name,
      emoji: career.emoji,
      teaser: this.generateCareerTeaser(career.name, skills)
    }));
  }

  // ============================================================================
  // Helper Methods for Narrative Content
  // ============================================================================

  private getMathNarrative(skill: SkillReference, career: string): string {
    const narratives: Record<string, Record<string, string>> = {
      'Marine Biologist': {
        'Understanding integers': "The reef's temperature varies from +15°C at surface to -20°C at depth. Plot these integers to find the safe zone for coral!"
      },
      'Basketball Coach': {
        'Understanding integers': "Track score differentials! Your team is +15 in the first quarter but -8 in the second. Calculate the momentum shift!"
      },
      'Chef': {
        'Understanding integers': "The freezer is at -18°C while the oven reaches +200°C. Calculate safe food temperatures using integers!"
      },
      'Game Designer': {
        'Understanding integers': "Player health ranges from -100 (game over) to +100 (full power). Design the perfect health system!"
      },
      'Architect': {
        'Understanding integers': "The basement extends -3 floors while the penthouse is at +45. Plan the elevator system using integers!"
      }
    };

    return narratives[career]?.[skill.skillName] ||
      `Master ${skill.skillName} through ${career} challenges!`;
  }

  private getELANarrative(skill: SkillReference, career: string): string {
    const narratives: Record<string, Record<string, string>> = {
      'Marine Biologist': {
        'Determine the main idea of a passage': "This marine biology article holds the key! What's the main idea about coral bleaching? Your team needs this intel!"
      },
      'Basketball Coach': {
        'Determine the main idea of a passage': "The championship playbook is complex! Find the main strategy in this game plan to lead your team to victory!"
      },
      'Chef': {
        'Determine the main idea of a passage': "This famous recipe has secrets! Identify the main technique that makes this dish extraordinary!"
      },
      'Game Designer': {
        'Determine the main idea of a passage': "The game design document is huge! Extract the main gameplay loop to build your masterpiece!"
      },
      'Architect': {
        'Determine the main idea of a passage': "The building codes are complex! Find the main safety requirement for your skyscraper design!"
      }
    };

    return narratives[career]?.[skill.skillName] ||
      `Practice ${skill.skillName} in ${career} contexts!`;
  }

  private getScienceNarrative(skill: SkillReference, career: string): string {
    const narratives: Record<string, Record<string, string>> = {
      'Marine Biologist': {
        'The process of scientific inquiry': "Use scientific inquiry to discover why coral at -5°C is dying. Form a hypothesis and design your test!"
      },
      'Basketball Coach': {
        'The process of scientific inquiry': "Apply scientific method to improve free throws! Hypothesize, test different angles, and analyze results!"
      },
      'Chef': {
        'The process of scientific inquiry': "Why does bread rise? Use scientific inquiry to perfect your recipe through controlled experiments!"
      },
      'Game Designer': {
        'The process of scientific inquiry': "Test game mechanics scientifically! Form hypotheses about player behavior and validate through data!"
      },
      'Architect': {
        'The process of scientific inquiry': "Which materials are strongest? Use scientific inquiry to test building materials for your design!"
      }
    };

    return narratives[career]?.[skill.skillName] ||
      `Explore ${skill.skillName} as a ${career}!`;
  }

  private getSocialNarrative(skill: SkillReference, career: string): string {
    const narratives: Record<string, Record<string, string>> = {
      'Marine Biologist': {
        'Identify lines of latitude and longitude': "Plot coordinates 18°S, 147°E for the Great Barrier Reef. Your submarine needs precise navigation!"
      },
      'Basketball Coach': {
        'Identify lines of latitude and longitude': "Scout players worldwide! Use coordinates to locate talent from 40°N, 74°W (New York) to 35°S, 149°E (Australia)!"
      },
      'Chef': {
        'Identify lines of latitude and longitude': "Source ingredients globally! Navigate to 43°N, 2°E (French truffles) and 20°S, 57°E (vanilla from Mauritius)!"
      },
      'Game Designer': {
        'Identify lines of latitude and longitude': "Design a world map! Place game locations using real coordinates from 51°N (London) to 35°S (Sydney)!"
      },
      'Architect': {
        'Identify lines of latitude and longitude': "Plan international projects! Locate building sites from 40°N, 116°E (Beijing) to 41°N, 2°E (Barcelona)!"
      }
    };

    return narratives[career]?.[skill.skillName] ||
      `Master ${skill.skillName} through ${career} exploration!`;
  }

  private getIntegratedChallenges(skills: SkillSet, career: string) {
    const challengeMap: Record<string, any> = {
      'Marine Biologist': {
        title: 'The Coral Crisis',
        challenges: [
          { icon: '🌡️', skill: 'Math', narrative: 'Calculate temperature changes as you dive', standard: skills.math.standard },
          { icon: '📝', skill: 'ELA', narrative: 'Document observations in your research log', standard: skills.ela.standard },
          { icon: '🔬', skill: 'Science', narrative: 'Test your hypothesis with coral samples', standard: skills.science.standard },
          { icon: '🧭', skill: 'Social', narrative: 'Navigate between reef coordinates', standard: skills.social.standard }
        ]
      },
      'Basketball Coach': {
        title: 'The Championship Game',
        challenges: [
          { icon: '📊', skill: 'Math', narrative: 'Track score differentials and statistics', standard: skills.math.standard },
          { icon: '📋', skill: 'ELA', narrative: 'Write motivational plays for the team', standard: skills.ela.standard },
          { icon: '🎯', skill: 'Science', narrative: 'Analyze shot angles and trajectories', standard: skills.science.standard },
          { icon: '🗺️', skill: 'Social', narrative: 'Scout opponents from different regions', standard: skills.social.standard }
        ]
      }
      // Add more careers as needed
    };

    const challenge = challengeMap[career] || {
      title: 'The Integrated Challenge',
      challenges: [
        { icon: '📊', skill: 'Math', narrative: `Apply ${skills.math.skillName}`, standard: skills.math.standard },
        { icon: '📝', skill: 'ELA', narrative: `Use ${skills.ela.skillName}`, standard: skills.ela.standard },
        { icon: '🔬', skill: 'Science', narrative: `Practice ${skills.science.skillName}`, standard: skills.science.standard },
        { icon: '🗺️', skill: 'Social', narrative: `Master ${skills.social.skillName}`, standard: skills.social.standard }
      ]
    };

    return challenge.challenges;
  }

  private getAct2Setting(career: string): string {
    const settings: Record<string, string> = {
      'Marine Biologist': 'Your submarine descends into the blue...',
      'Basketball Coach': 'The arena lights dim as practice begins...',
      'Chef': 'The kitchen heats up as service approaches...',
      'Game Designer': 'The code compiles as your game takes shape...',
      'Architect': 'The blueprints unfold on your drafting table...'
    };
    return settings[career] || 'The adventure intensifies...';
  }

  private getPresentationSetting(career: string): string {
    const settings: Record<string, string> = {
      'Marine Biologist': 'Ocean Conservation Board Meeting',
      'Basketball Coach': 'Team Strategy Session',
      'Chef': 'Restaurant Critics Table',
      'Game Designer': 'Publisher Pitch Meeting',
      'Architect': 'Client Presentation'
    };
    return settings[career] || 'Final Presentation';
  }

  private getAuthorityFigure(career: string): string {
    const authorities: Record<string, string> = {
      'Marine Biologist': 'Ocean Conservation Board',
      'Basketball Coach': 'Team Owners',
      'Chef': 'Restaurant Critics',
      'Game Designer': 'Game Publishers',
      'Architect': 'Building Commission'
    };
    return authorities[career] || 'Expert Panel';
  }

  private getMathPresentation(skill: SkillReference, career: string): string {
    const presentations: Record<string, string> = {
      'Marine Biologist': 'temperature data with integers',
      'Basketball Coach': 'score statistics with integers',
      'Chef': 'temperature charts with integers',
      'Game Designer': 'health system with integers',
      'Architect': 'floor levels with integers'
    };
    return presentations[career] || `${skill.skillName} analysis`;
  }

  private formatStandard(skill: SkillReference): SkillStandard {
    return {
      subject: skill.subject,
      grade: skill.grade,
      cluster: skill.cluster,
      skillCode: skill.skillNumber,
      standardName: skill.skillName
    };
  }

  private getNarrativeElement(career: string, subject: string): string {
    const elements: Record<string, Record<string, string>> = {
      'Marine Biologist': {
        'math': 'Ocean temperatures',
        'ela': 'Research journals',
        'science': 'Coral experiments',
        'social': 'Reef navigation'
      },
      'Basketball Coach': {
        'math': 'Score tracking',
        'ela': 'Playbook analysis',
        'science': 'Shot mechanics',
        'social': 'Global scouting'
      }
      // Add more as needed
    };
    return elements[career]?.[subject] || `${career} ${subject} skills`;
  }

  private generateCareerTeaser(career: string, skills: SkillSet): string {
    const teasers: Record<string, string> = {
      'Marine Biologist': `Explore ocean depths while mastering ${skills.math.skillName} through temperature analysis!`,
      'Basketball Coach': `Lead your team to victory using ${skills.math.skillName} to track game statistics!`,
      'Chef': `Create culinary masterpieces while learning ${skills.math.skillName} through kitchen temperatures!`,
      'Game Designer': `Build epic games using ${skills.math.skillName} for player health systems!`,
      'Architect': `Design skyscrapers while mastering ${skills.math.skillName} through floor planning!`
    };
    return teasers[career] || `Master all skills as a ${career}!`;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Switch to a different career while keeping same skills
   */
  switchCareer(currentLesson: NarrativeLessonPlan, newCareerIndex: number): string {
    const newCareer = this.DEMO_CAREERS[newCareerIndex];
    return `"${newCareer.name} ${currentLesson.header.student}! ` +
      `Your mission involves the same skills but in a completely different adventure! ` +
      `SAME SKILLS: Math ${currentLesson.skillsVerification.standards[0].skillCode}, ` +
      `ELA, Science, Social | NEW STORY: ${this.generateMissionTitle(newCareer.name)}!"`;
  }
}

// Export singleton instance
export const narrativeLessonGenerator = new NarrativeDrivenLessonGenerator();