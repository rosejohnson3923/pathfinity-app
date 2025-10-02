/**
 * Basic Lesson Template Generator
 * Automatically generates lesson plans and rubrics for Basic subscription
 * Based on skill numbers and subjects
 * Uses DemonstrativeMasterNarrativeGenerator for parent approval process
 */

import { StandardizedLessonPlan } from './StandardizedLessonPlan';
import { demonstrativeNarrativeGenerator, EnhancedMasterNarrative } from '../services/narrative/DemonstrativeMasterNarrativeGenerator';

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

export interface BasicLessonInput {
  student: {
    name: string;
    grade: number;
    currentDate: Date;
  };

  skills: {
    math: SkillReference;
    ela: SkillReference;
    science: SkillReference;
    social: SkillReference;
  };

  // Runtime choices (unknown at generation)
  career?: string;
  companion?: string;
}

export interface DemonstrativeLesson {
  header: LessonHeader;
  narrative: NarrativeStructure;
  activities: ActivitySet;
  assessment: AssessmentPlan;
  skillsVerification: SkillsTable;
  rubric: QualityRubric;
  guarantee: ParentGuarantee;
}

interface LessonHeader {
  title: string;
  date: Date;
  student: string;
  grade: number;
  duration: string;
  career: string;
  companion: string;
  subscriptionTier: 'BASIC';
  tagline?: string; // Value proposition from enhanced narrative
}

interface NarrativeStructure {
  missionBriefing: string;
  act1: Act;
  act2: Act;
  act3: Act;
  celebration: string;
}

interface Act {
  title: string;
  description: string;
  subjects: SubjectActivity[];
  duration: number; // minutes
}

interface SubjectActivity {
  subject: string;
  skillCode: string;
  narrative: string;
  careerContext: string;
  examples: string[];
}

// ============================================================================
// Grade 7 Skill Database
// ============================================================================

const GRADE_7_SKILLS = {
  math: {
    'A.A.1': {
      name: 'Understanding integers',
      concepts: ['positive numbers', 'negative numbers', 'zero', 'opposites'],
      careerContexts: {
        'Marine Biologist': 'ocean depths and temperatures',
        'Chef': 'freezer and oven temperatures',
        'Game Designer': 'player health and scores',
        'Architect': 'floor levels above and below ground',
        'Athlete': 'game scores and point differentials'
      }
    }
  },

  ela: {
    'A.A.1': {
      name: 'Determine the main idea of a passage',
      concepts: ['central theme', 'supporting details', 'key points', 'summary'],
      careerContexts: {
        'Marine Biologist': 'research articles about ocean life',
        'Chef': 'recipe instructions and food articles',
        'Game Designer': 'game design documents',
        'Architect': 'building specifications',
        'Athlete': 'playbooks and strategy guides'
      }
    }
  },

  science: {
    'A.A.1': {
      name: 'The process of scientific inquiry',
      concepts: ['observation', 'hypothesis', 'experiment', 'data', 'conclusion'],
      careerContexts: {
        'Marine Biologist': 'studying coral reef health',
        'Chef': 'experimenting with recipes',
        'Game Designer': 'testing game mechanics',
        'Architect': 'testing structural materials',
        'Athlete': 'analyzing performance data'
      }
    }
  },

  social: {
    'A.A.1': {
      name: 'Identify lines of latitude and longitude',
      concepts: ['coordinates', 'hemispheres', 'navigation', 'global positioning'],
      careerContexts: {
        'Marine Biologist': 'locating reef sites globally',
        'Chef': 'sourcing ingredients worldwide',
        'Game Designer': 'creating world maps',
        'Architect': 'planning international projects',
        'Athlete': 'traveling to competitions'
      }
    }
  }
};

// ============================================================================
// Basic Template Generator Class
// ============================================================================

export class BasicLessonTemplateGenerator {
  // Basic tier gets 5 carefully selected careers for demonstrative
  private readonly basicCareers = [
    'Doctor',      // Healthcare - high parent appeal
    'Teacher',     // Education - relatable
    'Chef',        // Culinary - practical
    'Scientist',   // STEM - future-focused
    'Artist'       // Creative - well-rounded
  ];

  // Basic tier uses Spark as primary companion
  private readonly BASIC_COMPANION = 'Spark';

  private readonly companions = [
    { name: 'Spark', personality: 'energetic and encouraging' },
    { name: 'Sage', personality: 'wise and thoughtful' },
    { name: 'Finn', personality: 'fun and adventurous' }
  ];

  /**
   * Generate a demonstrative lesson plan for parent preview
   */
  async generateDemonstrativeLesson(input: BasicLessonInput): Promise<DemonstrativeLesson> {
    // Select random career for Basic tier demonstration
    const sampleCareer = input.career || this.selectRandomCareer();
    const sampleCompanion = this.BASIC_COMPANION; // Always Spark for Basic

    // Generate enhanced demonstrative narrative
    const masterNarrative = await demonstrativeNarrativeGenerator.generateQuickDemonstrative(
      input.student.name,
      input.student.grade.toString(),
      input.skills
    );

    // For demonstrative, use the original mock methods with enhanced narrative
    return {
      header: this.generateEnhancedHeader(input, sampleCareer, sampleCompanion, masterNarrative),
      narrative: this.generateEnhancedNarrative(input.skills, sampleCareer, sampleCompanion, masterNarrative),
      activities: this.generateActivities(input.skills, sampleCareer),
      assessment: this.generateAssessment(input.skills),
      skillsVerification: this.generateEnhancedSkillsTable(input.skills, masterNarrative),
      rubric: this.generateEnhancedRubric(input.skills, masterNarrative),
      guarantee: this.generateEnhancedGuarantee(masterNarrative)
    };
  }

  /**
   * Generate enhanced header with narrative value props
   */
  private generateEnhancedHeader(
    input: BasicLessonInput,
    career: string,
    companion: string,
    narrative: EnhancedMasterNarrative
  ): LessonHeader {
    return {
      title: `🎯 ${input.student.name} Becomes a Junior ${career}!`,
      date: input.student.currentDate,
      student: input.student.name,
      grade: input.student.grade,
      duration: '2 hours of adventure-based learning',
      career: career,
      companion: companion,
      subscriptionTier: 'BASIC',
      tagline: narrative.parentValue?.engagementPromise || 'Where learning meets adventure'
    };
  }

  /**
   * Original header for fallback
   */
  private generateHeader(
    input: BasicLessonInput,
    career: string,
    companion: { name: string; personality: string }
  ): LessonHeader {
    return {
      title: `${career} Learning Adventure`,
      date: input.student.currentDate,
      student: input.student.name,
      grade: input.student.grade,
      duration: '2 hours',
      career: career,
      companion: companion.name,
      subscriptionTier: 'BASIC'
    };
  }

  /**
   * Generate enhanced narrative using AI structure
   */
  private generateEnhancedNarrative(
    skills: BasicLessonInput['skills'],
    career: string,
    companion: string,
    narrative: EnhancedMasterNarrative
  ): NarrativeStructure {
    const missionContext = this.getMissionContext(career);

    return {
      missionBriefing: narrative.cohesiveStory.mission ||
        `Welcome to ${missionContext.workplace}, Junior ${career}! Today's mission: ${missionContext.crisis}`,

      act1: {
        title: 'LEARN: Morning Mission at Virtual Academy',
        description: narrative.settingProgression.learn.narrative ||
          `Master the fundamentals at ${missionContext.workplace}`,
        subjects: this.mapSkillsToAct1Enhanced(skills, career, narrative),
        duration: 45
      },

      act2: {
        title: 'EXPERIENCE: Afternoon Adventure at Virtual Workplace',
        description: narrative.settingProgression.experience.narrative ||
          `Apply your skills to solve ${missionContext.challenge}`,
        subjects: this.mapSkillsToAct2Enhanced(skills, career, narrative),
        duration: 45
      },

      act3: {
        title: 'DISCOVER: Evening Exploration on Virtual Field Trip',
        description: narrative.settingProgression.discover.narrative ||
          `Share your findings with ${missionContext.authority}`,
        subjects: this.mapSkillsToAct3Enhanced(skills, career, narrative),
        duration: 30
      },

      celebration: narrative.milestones?.completion ||
        `Congratulations! You've earned your Junior ${career} certification! 🏆`
    };
  }

  /**
   * Original narrative for fallback
   */
  private generateNarrative(
    skills: BasicLessonInput['skills'],
    career: string,
    companion: { name: string; personality: string }
  ): NarrativeStructure {
    const missionContext = this.getMissionContext(career);

    return {
      missionBriefing: `Welcome to ${missionContext.workplace}, ${career} ${skills.math.grade}th grader! ` +
        `${companion.name} here, and we have an important mission today. ${missionContext.crisis} ` +
        `We'll need all your skills to succeed!`,

      act1: {
        title: 'LEARN: The Training Mission',
        description: `Master the fundamentals at ${missionContext.workplace}`,
        subjects: this.mapSkillsToAct1(skills, career),
        duration: 45
      },

      act2: {
        title: 'EXPERIENCE: The Field Work',
        description: `Apply your skills to solve ${missionContext.challenge}`,
        subjects: this.mapSkillsToAct2(skills, career),
        duration: 45
      },

      act3: {
        title: 'DISCOVER: The Presentation',
        description: `Share your findings with ${missionContext.authority}`,
        subjects: this.mapSkillsToAct3(skills, career),
        duration: 30
      },

      celebration: `Congratulations! You've earned your Junior ${career} certification! 🏆`
    };
  }

  /**
   * Map skills to Act 1 activities
   */
  private mapSkillsToAct1(
    skills: BasicLessonInput['skills'],
    career: string
  ): SubjectActivity[] {
    return [
      {
        subject: 'Math',
        skillCode: `${skills.math.grade}.${skills.math.cluster}.${skills.math.skillNumber}`,
        narrative: `Let's understand ${skills.math.skillName.toLowerCase()}`,
        careerContext: this.getCareerContext('math', skills.math.skillNumber, career),
        examples: this.getExamples('math', skills.math.skillNumber, career)
      },
      {
        subject: 'ELA',
        skillCode: `${skills.ela.grade}.${skills.ela.cluster}.${skills.ela.skillNumber}`,
        narrative: `Practice ${skills.ela.skillName.toLowerCase()}`,
        careerContext: this.getCareerContext('ela', skills.ela.skillNumber, career),
        examples: this.getExamples('ela', skills.ela.skillNumber, career)
      },
      {
        subject: 'Science',
        skillCode: `${skills.science.grade}.${skills.science.cluster}.${skills.science.skillNumber}`,
        narrative: `Explore ${skills.science.skillName.toLowerCase()}`,
        careerContext: this.getCareerContext('science', skills.science.skillNumber, career),
        examples: this.getExamples('science', skills.science.skillNumber, career)
      },
      {
        subject: 'Social Studies',
        skillCode: `${skills.social.grade}.${skills.social.cluster}.${skills.social.skillNumber}`,
        narrative: `Discover ${skills.social.skillName.toLowerCase()}`,
        careerContext: this.getCareerContext('social', skills.social.skillNumber, career),
        examples: this.getExamples('social', skills.social.skillNumber, career)
      }
    ];
  }

  /**
   * Generate activities section
   */
  private generateActivities(
    skills: BasicLessonInput['skills'],
    career: string
  ): ActivitySet {
    return {
      math: this.generateMathActivities(skills.math, career),
      ela: this.generateELAActivities(skills.ela, career),
      science: this.generateScienceActivities(skills.science, career),
      social: this.generateSocialActivities(skills.social, career)
    };
  }

  /**
   * Generate assessment questions
   */
  private generateAssessment(skills: BasicLessonInput['skills']): AssessmentPlan {
    return {
      math: this.generateMathAssessment(skills.math),
      ela: this.generateELAAssessment(skills.ela),
      science: this.generateScienceAssessment(skills.science),
      social: this.generateSocialAssessment(skills.social),

      passingCriteria: {
        overall: 70,
        perSubject: 60,
        attempts: 3,
        hintsAvailable: true
      }
    };
  }

  /**
   * Generate skills verification table
   */
  private generateSkillsTable(skills: BasicLessonInput['skills']): SkillsTable {
    return {
      headers: ['Subject', 'Grade', 'Cluster', 'Skill Code', 'Standard Name'],
      rows: [
        ['Math', skills.math.grade.toString(), skills.math.cluster, skills.math.skillNumber, skills.math.skillName],
        ['ELA', skills.ela.grade.toString(), skills.ela.cluster, skills.ela.skillNumber, skills.ela.skillName],
        ['Science', skills.science.grade.toString(), skills.science.cluster, skills.science.skillNumber, skills.science.skillName],
        ['Social Studies', skills.social.grade.toString(), skills.social.cluster, skills.social.skillNumber, skills.social.skillName]
      ],

      mappingExplanation: {
        title: 'HOW THE MAGIC WORKS:',
        mappings: [
          `"${this.getCareerContext('math', 'A.1', 'dynamic')}" → Teaching ${skills.math.skillName}`,
          `"${this.getCareerContext('ela', 'A.1', 'dynamic')}" → Teaching ${skills.ela.skillName}`,
          `"${this.getCareerContext('science', 'A.1', 'dynamic')}" → Teaching ${skills.science.skillName}`,
          `"${this.getCareerContext('social', 'A.1', 'dynamic')}" → Teaching ${skills.social.skillName}`
        ]
      }
    };
  }

  /**
   * Generate quality rubric
   */
  private generateRubric(skills: BasicLessonInput['skills']): QualityRubric {
    return {
      skillMastery: {
        math: {
          target: '80% accuracy',
          mastery: this.getMasteryLevel(skills.math),
          assessment: '3 questions, problem-solving required'
        },
        ela: {
          target: 'Main idea + 3 details',
          mastery: this.getMasteryLevel(skills.ela),
          assessment: 'Passage analysis with comprehension'
        },
        science: {
          target: 'Complete inquiry cycle',
          mastery: this.getMasteryLevel(skills.science),
          assessment: 'Design and explain experiment'
        },
        social: {
          target: '3 coordinates correctly',
          mastery: this.getMasteryLevel(skills.social),
          assessment: 'Navigate and identify locations'
        }
      },

      engagementMetrics: {
        narrativeCoherence: 'All activities connected through career story',
        interactionFrequency: 'Activity every 3-5 minutes',
        difficultyProgression: 'Scaffolded from simple to complex',
        funFactor: 'Gamified with rewards and celebrations'
      },

      parentVisibility: {
        dailyReports: 'Detailed performance by skill',
        weeklyProgress: 'Trend analysis and projections',
        recommendations: 'Personalized improvement suggestions',
        celebrations: 'Achievements and milestones'
      }
    };
  }

  /**
   * Generate parent guarantee
   */
  private generateGuarantee(): ParentGuarantee {
    return {
      title: 'PATHFINITY QUALITY GUARANTEE',

      narrativeMagic: {
        promise: 'Every lesson creates an engaging story',
        delivery: 'Your child won\'t realize they\'re learning standards',
        proof: 'See the sample above - math becomes adventure!'
      },

      standardsCompliance: {
        promise: '100% Common Core alignment',
        delivery: 'Every skill code maps to state standards',
        proof: 'Verify at www.corestandards.org'
      },

      personalization: {
        promise: 'Adapts to your child\'s choices',
        delivery: 'Career and companion selected daily',
        proof: 'Same standards, infinite variety'
      },

      basicLimitations: {
        careers: 5,
        companions: 3,
        adaptiveFeatures: 'Limited',
        multimedia: 'Text-based primarily'
      },

      upgradeOptions: {
        premium: '+45 careers, video content, real data',
        boosters: 'Trade skills, corporate, entrepreneur, AI',
        ultimate: 'Everything unlocked, maximum engagement'
      }
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private selectRandomCareer(): string {
    return this.basicCareers[Math.floor(Math.random() * this.basicCareers.length)];
  }

  private selectRandomCompanion(): { name: string; personality: string } {
    return this.companions[Math.floor(Math.random() * this.companions.length)];
  }

  private getMissionContext(career: string): any {
    const contexts = {
      'Marine Biologist': {
        workplace: 'Coral Reef Research Station',
        crisis: 'The reef ecosystem needs urgent documentation!',
        challenge: 'the coral crisis',
        authority: 'Ocean Conservation Board'
      },
      'Chef': {
        workplace: 'Five-Star Restaurant Kitchen',
        crisis: 'The food critic arrives in 2 hours!',
        challenge: 'the perfect menu',
        authority: 'Head Chef'
      },
      'Game Designer': {
        workplace: 'Game Development Studio',
        crisis: 'The game launch is tomorrow!',
        challenge: 'the final bugs',
        authority: 'Publishing Team'
      },
      'Architect': {
        workplace: 'Architecture Firm',
        crisis: 'The city needs your building design!',
        challenge: 'the structural challenge',
        authority: 'City Planning Board'
      },
      'Athlete': {
        workplace: 'Training Center',
        crisis: 'The championship is this week!',
        challenge: 'the winning strategy',
        authority: 'Team Coach'
      }
    };

    return contexts[career] || contexts['Game Designer'];
  }

  private getCareerContext(subject: string, skillNumber: string, career: string): string {
    if (career === 'dynamic') {
      return `Career-specific ${subject} application`;
    }

    const subjectKey = subject.toLowerCase().replace(' studies', '');
    const skill = GRADE_7_SKILLS[subjectKey]?.[skillNumber];

    if (!skill) return `${career} ${subject} skills`;

    return skill.careerContexts[career] || `${career} ${subject} application`;
  }

  private getExamples(subject: string, skillNumber: string, career: string): string[] {
    const examples = {
      'Marine Biologist': {
        math: ['Ocean depth: -200m', 'Surface temp: +25°C', 'Deep water: -5°C'],
        ela: ['Read research journal', 'Find key findings', 'Summarize data'],
        science: ['Observe coral bleaching', 'Form hypothesis', 'Test water samples'],
        social: ['Plot reef at 18°S, 147°E', 'Navigate to sites', 'Map ocean regions']
      },
      'Chef': {
        math: ['Freezer: -18°C', 'Oven: +200°C', 'Room temp: +22°C'],
        ela: ['Read recipe cards', 'Find main steps', 'Follow instructions'],
        science: ['Test ingredient reactions', 'Observe cooking changes', 'Record results'],
        social: ['Source ingredients globally', 'Map food origins', 'Track shipments']
      }
      // ... other careers
    };

    const subjectKey = subject.toLowerCase().replace(' studies', '');
    return examples[career]?.[subjectKey] || ['Example 1', 'Example 2', 'Example 3'];
  }

  private generateMathActivities(skill: SkillReference, career: string): any {
    return {
      warmup: `Identify positive and negative numbers in ${career} context`,
      practice: `Plot ${career}-related integers on number line`,
      application: `Solve real ${career} integer problems`,
      challenge: `Calculate temperature/depth/score changes`
    };
  }

  private generateELAActivities(skill: SkillReference, career: string): any {
    return {
      reading: `${career} article about current research`,
      identification: 'Find and highlight main idea',
      support: 'Locate 3 supporting details',
      summary: 'Write 2-sentence summary'
    };
  }

  private generateScienceActivities(skill: SkillReference, career: string): any {
    return {
      observe: `Notice problem in ${career} scenario`,
      hypothesize: 'Form testable prediction',
      experiment: 'Design investigation steps',
      conclude: 'Analyze results and report'
    };
  }

  private generateSocialActivities(skill: SkillReference, career: string): any {
    return {
      locate: `Find ${career} locations on map`,
      navigate: 'Plot coordinates accurately',
      analyze: 'Identify hemispheres and regions',
      apply: 'Plan route between locations'
    };
  }

  private generateMathAssessment(skill: SkillReference): any {
    return [
      {
        type: 'multiple_choice',
        question: 'Which number is smallest?',
        options: ['-20', '-5', '0', '+10'],
        correct: 0
      },
      {
        type: 'number_line',
        question: 'Plot: -3, 0, +5',
        evaluation: 'relative_position'
      },
      {
        type: 'calculation',
        question: 'Change from +15 to -5?',
        answer: -20
      }
    ];
  }

  private generateELAAssessment(skill: SkillReference): any {
    return [
      {
        type: 'reading_comprehension',
        passage: '[Career-specific passage]',
        question: 'What is the main idea?',
        requiresSupport: true
      }
    ];
  }

  private generateScienceAssessment(skill: SkillReference): any {
    return [
      {
        type: 'inquiry_steps',
        question: 'Order the scientific method',
        steps: ['Observe', 'Hypothesis', 'Experiment', 'Conclude'],
        requiresExplanation: true
      }
    ];
  }

  private generateSocialAssessment(skill: SkillReference): any {
    return [
      {
        type: 'coordinate_plotting',
        question: 'Locate 18°S, 147°E',
        requiresHemisphere: true
      }
    ];
  }

  private getMasteryLevel(skill: SkillReference): any {
    return {
      developing: `Beginning to understand ${skill.skillName}`,
      proficient: `Can apply ${skill.skillName} with support`,
      mastery: `Independently demonstrates ${skill.skillName}`
    };
  }

  private mapSkillsToAct2(skills: BasicLessonInput['skills'], career: string): SubjectActivity[] {
    // Act 2 focuses on application
    return this.mapSkillsToAct1(skills, career).map(activity => ({
      ...activity,
      narrative: activity.narrative.replace('understand', 'apply').replace('Practice', 'Use'),
      examples: activity.examples.map(ex => `Apply: ${ex}`)
    }));
  }

  private mapSkillsToAct3(skills: BasicLessonInput['skills'], career: string): SubjectActivity[] {
    // Act 3 focuses on synthesis and presentation
    return this.mapSkillsToAct1(skills, career).map(activity => ({
      ...activity,
      narrative: activity.narrative.replace('understand', 'demonstrate').replace('Practice', 'Present'),
      examples: [`Present your ${activity.subject.toLowerCase()} findings`]
    }));
  }
}

// ============================================================================
// Type Exports for Other Components
// ============================================================================

export interface ActivitySet {
  math: any;
  ela: any;
  science: any;
  social: any;
}

export interface AssessmentPlan {
  math: any;
  ela: any;
  science: any;
  social: any;
  passingCriteria: any;
}

export interface SkillsTable {
  headers: string[];
  rows: string[][];
  mappingExplanation: any;
}

export interface QualityRubric {
  skillMastery: any;
  engagementMetrics: any;
  parentVisibility: any;
}

export interface ParentGuarantee {
  title: string;
  narrativeMagic: any;
  standardsCompliance: any;
  personalization: any;
  basicLimitations: any;
  upgradeOptions: any;
}

  /**
   * Map skills to Act 1 with enhanced narrative
   */
  private mapSkillsToAct1Enhanced(
    skills: BasicLessonInput['skills'],
    career: string,
    narrative: EnhancedMasterNarrative
  ): SubjectActivity[] {
    const subjects = ['math', 'ela', 'science', 'social'];
    return subjects.map(subject => {
      const skill = skills[subject];
      const subjectKey = subject === 'social' ? 'socialStudies' : subject;

      return {
        subject: subject.toUpperCase(),
        skillCode: skill.standard,
        narrative: narrative.subjectContextsAligned[subjectKey].learn,
        careerContext: `As a ${career}, you'll ${narrative.subjectContextsAligned[subjectKey].learn}`,
        examples: this.getExamplesForSkill(skill, career)
      };
    });
  }

  /**
   * Map skills to Act 2 with enhanced narrative
   */
  private mapSkillsToAct2Enhanced(
    skills: BasicLessonInput['skills'],
    career: string,
    narrative: EnhancedMasterNarrative
  ): SubjectActivity[] {
    const subjects = ['math', 'ela', 'science', 'social'];
    return subjects.map(subject => {
      const skill = skills[subject];
      const subjectKey = subject === 'social' ? 'socialStudies' : subject;

      return {
        subject: subject.toUpperCase(),
        skillCode: skill.standard,
        narrative: narrative.subjectContextsAligned[subjectKey].experience,
        careerContext: `Apply ${skill.skillName} in real ${career} work`,
        examples: ['Hands-on practice', 'Real scenarios', 'Problem solving']
      };
    });
  }

  /**
   * Map skills to Act 3 with enhanced narrative
   */
  private mapSkillsToAct3Enhanced(
    skills: BasicLessonInput['skills'],
    career: string,
    narrative: EnhancedMasterNarrative
  ): SubjectActivity[] {
    const subjects = ['math', 'ela', 'science', 'social'];
    return subjects.map(subject => {
      const skill = skills[subject];
      const subjectKey = subject === 'social' ? 'socialStudies' : subject;

      return {
        subject: subject.toUpperCase(),
        skillCode: skill.standard,
        narrative: narrative.subjectContextsAligned[subjectKey].discover,
        careerContext: `Discover how ${career}s use ${skill.skillName} in the community`,
        examples: ['Field exploration', 'Community connections', 'Real-world application']
      };
    });
  }

  /**
   * Generate enhanced skills verification table
   */
  private generateEnhancedSkillsTable(
    skills: BasicLessonInput['skills'],
    narrative: EnhancedMasterNarrative
  ): SkillsTable {
    const rows = [];
    const subjects = ['math', 'ela', 'science', 'social'];

    for (const subject of subjects) {
      const skill = skills[subject];
      const subjectKey = subject === 'social' ? 'socialStudies' : subject;

      rows.push({
        subject: subject.toUpperCase(),
        standard: skill.standard,
        skill: skill.skillName,
        objective: `Master ${skill.skillName} through career exploration`,
        mastery: this.getMasteryIndicator(skill),
        realWorld: narrative.realWorldApplications?.[subjectKey]?.immediate ||
          'Real-world application'
      });
    }

    return {
      headers: ['Subject', 'Standard', 'Skill', 'Learning Objective', 'Mastery', 'Real-World Use'],
      rows,
      footnote: '✓ All skills align with Common Core and state standards'
    };
  }

  /**
   * Generate enhanced rubric with AI insights
   */
  private generateEnhancedRubric(
    skills: BasicLessonInput['skills'],
    narrative: EnhancedMasterNarrative
  ): QualityRubric {
    return {
      skillMastery: {
        math: this.getRubricForSkill(skills.math),
        ela: this.getRubricForSkill(skills.ela),
        science: this.getRubricForSkill(skills.science),
        social: this.getRubricForSkill(skills.social)
      },
      engagementMetrics: {
        timeOnTask: 'Target: 25 minutes per subject',
        completionRate: 'Target: 80% of activities',
        accuracyGoal: 'Target: 70% or higher',
        adaptiveNature: narrative.parentInsights?.adaptiveNature ||
          'AI adjusts to child\'s pace'
      },
      parentVisibility: {
        dailyReports: narrative.parentInsights?.dailyReports ||
          'Evening achievement summary',
        weeklyProgress: narrative.parentInsights?.weeklyProgress ||
          'Comprehensive improvement reports',
        masteryTracking: narrative.parentInsights?.masteryTracking ||
          'Clear progress visualization'
      }
    };
  }

  /**
   * Generate enhanced guarantee with narrative promises
   */
  private generateEnhancedGuarantee(narrative: EnhancedMasterNarrative): ParentGuarantee {
    return {
      title: '🌟 THE PATHFINITY PROMISE',

      narrativeMagic: {
        promise: narrative.parentValue?.engagementPromise ||
          'Learning disguised as adventure',
        delivery: 'Every lesson connects to real careers',
        differentiation: narrative.parentValue?.differentiator ||
          'Unlike traditional learning, every minute has meaning'
      },

      standardsCompliance: {
        commonCore: '✓ 100% Common Core aligned',
        stateStandards: '✓ Meets all state requirements',
        assessment: '✓ Built-in progress tracking'
      },

      personalization: {
        adaptive: narrative.guarantees?.engagement ||
          'If not engaged in 5 minutes, we adapt',
        learning: narrative.guarantees?.learning ||
          'Measurable skill improvement',
        support: narrative.guarantees?.support ||
          'Daily parent reports'
      },

      basicLimitations: {
        careers: 'Basic tier: 5 curated careers',
        companion: 'Basic tier: Spark companion only',
        content: 'Standard narrative depth'
      },

      upgradeOptions: {
        premium: 'Unlock 50+ careers and deeper narratives',
        boosters: 'Add specialized learning paths',
        satisfaction: narrative.guarantees?.satisfaction ||
          '30-day money-back guarantee'
      }
    };
  }
}

// Export singleton instance
export const basicLessonTemplate = new BasicLessonTemplateGenerator();