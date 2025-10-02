/**
 * Basic Lesson Template Generator V2
 *
 * ⚠️ USAGE: FOR PARENT/TEACHER APPROVAL ONLY
 *
 * This template is used in:
 * ✅ Parent Dashboard - Show lesson plan previews
 * ✅ Teacher Dashboard - Review curriculum methodology
 * ✅ Admin Approval - Content review workflows
 * ✅ Sales/Marketing - Demonstrate Basic tier value
 *
 * DO NOT USE FOR:
 * ❌ Student learning containers
 * ❌ Actual lesson delivery
 * ❌ Real-time content generation
 *
 * For actual student lessons, use: StandardizedLessonPlan with MasterNarrativeGenerator
 *
 * SUBSCRIPTION TIER: BASIC
 * - 5 curated careers (Doctor, Teacher, Chef, Scientist, Artist)
 * - Spark companion
 * - Standard narrative depth
 *
 * Creates demonstrative lesson plans for Basic subscription tier
 * Shows parents EXACTLY what their child will experience
 * Uses DemonstrativeMasterNarrativeGenerator for enhanced showcasing
 */

import { StandardizedLessonPlan } from './StandardizedLessonPlan';
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

  // For demonstrative, we provide sample career
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
  tagline: string; // Value proposition from enhanced narrative
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
  immersion?: string; // Enhanced narrative element
}

interface SubjectActivity {
  subject: string;
  skillCode: string;
  narrative: string;
  careerContext: string;
  examples: string[];
  realWorldConnection?: string; // From enhanced narrative
}

interface ActivitySet {
  learn: ActivitySummary;
  experience: ActivitySummary;
  discover: ActivitySummary;
  total: TotalSummary;
}

interface ActivitySummary {
  description: string;
  questionCount: number;
  duration: number;
  format: string;
  engagement?: string;
}

interface TotalSummary {
  questions: number;
  duration: number;
  engagement: string;
}

interface AssessmentPlan {
  overview: string;
  subjects: SubjectAssessment[];
  totalTime: string;
  passingScore: string;
  retakePolicy: string;
  parentVisibility: string;
}

interface SubjectAssessment {
  subject: string;
  skill: string;
  questionCount: number;
  questionTypes: string[];
  sampleQuestions: string[];
  adaptiveRules: string;
}

interface SkillsTable {
  headers: string[];
  rows: SkillRow[];
  footnote: string;
}

interface SkillRow {
  subject: string;
  standard: string;
  skill: string;
  objective: string;
  mastery: string;
  realWorld: string;
}

interface QualityRubric {
  masteryLevels: {
    expert: MasteryLevel;
    proficient: MasteryLevel;
    developing: MasteryLevel;
    beginning: MasteryLevel;
  };
  assessmentCriteria: any;
  engagementMetrics: any;
  adaptiveFeatures: any;
}

interface MasteryLevel {
  score: string;
  description: string;
  reward: string;
}

interface ParentGuarantee {
  title: string;
  narrativeMagic: {
    promise: string;
    delivery: string;
    differentiation: string;
  };
  standardsCompliance: {
    commonCore: string;
    stateStandards: string;
    assessment: string;
  };
  personalization: {
    adaptive: string;
    learning: string;
    support: string;
  };
  basicLimitations: {
    careers: string;
    companion: string;
    content: string;
  };
  upgradeOptions: {
    premium: string;
    boosters: string;
    satisfaction: string;
  };
}

// ============================================================================
// Main Generator Class
// ============================================================================

export class BasicLessonTemplateGenerator {
  // Basic tier gets 5 carefully selected careers for demonstrative purposes
  private readonly BASIC_CAREERS = [
    'Doctor',      // Healthcare - high parent appeal
    'Teacher',     // Education - relatable and valuable
    'Chef',        // Culinary - practical life skills
    'Scientist',   // STEM - future-focused
    'Artist'       // Creative - well-rounded education
  ];

  // Basic tier uses Spark as the primary companion
  private readonly BASIC_COMPANION = 'Spark';

  /**
   * Generate demonstrative lesson plan using enhanced narrative
   * Shows parents exactly what their child will experience
   */
  async generateDemonstrativeLesson(
    input: BasicLessonInput
  ): Promise<DemonstrativeLesson> {
    const career = input.career || this.selectRandomCareer();
    const companion = this.BASIC_COMPANION;

    // Generate enhanced demonstrative narrative
    const narrative = await demonstrativeNarrativeGenerator.generateQuickDemonstrative(
      input.student.name,
      input.student.grade.toString(),
      input.skills
    );

    // Transform to lesson plan format
    return {
      header: this.generateHeader(input, career, companion, narrative),
      narrative: this.generateNarrative(input.skills, career, narrative),
      activities: this.generateActivities(narrative),
      assessment: this.generateAssessment(input.skills, narrative),
      skillsVerification: this.generateSkillsTable(input.skills, narrative),
      rubric: this.generateRubric(input.skills, narrative),
      guarantee: this.generateGuarantee(narrative)
    };
  }

  /**
   * Select random career for demonstration
   */
  private selectRandomCareer(): string {
    return this.BASIC_CAREERS[Math.floor(Math.random() * this.BASIC_CAREERS.length)];
  }

  /**
   * Generate enhanced header with value proposition
   */
  private generateHeader(
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
      career,
      companion,
      subscriptionTier: 'BASIC',
      tagline: narrative.parentValue?.engagementPromise ||
        'Where education meets adventure - learning that doesn\'t feel like learning!'
    };
  }

  /**
   * Generate three-act narrative structure with enhanced elements
   */
  private generateNarrative(
    skills: BasicLessonInput['skills'],
    career: string,
    narrative: EnhancedMasterNarrative
  ): NarrativeStructure {
    return {
      missionBriefing: narrative.cohesiveStory.mission ||
        `Today's mission: Become a Junior ${career} and help solve real-world problems!`,

      act1: {
        title: '🌅 Morning Mission: Learn at Virtual Academy',
        description: narrative.settingProgression.learn.narrative ||
          'Master the fundamentals in an engaging virtual classroom',
        subjects: this.mapSubjectsToAct('learn', skills, career, narrative),
        duration: 40,
        immersion: narrative.immersiveElements?.soundscape
      },

      act2: {
        title: '☀️ Afternoon Adventure: Experience at Virtual Workplace',
        description: narrative.settingProgression.experience.narrative ||
          'Apply your skills in real career scenarios',
        subjects: this.mapSubjectsToAct('experience', skills, career, narrative),
        duration: 40,
        immersion: 'Interactive tools and real-world challenges'
      },

      act3: {
        title: '🌙 Evening Exploration: Discover on Virtual Field Trip',
        description: narrative.settingProgression.discover.narrative ||
          'See how your skills impact the community',
        subjects: this.mapSubjectsToAct('discover', skills, career, narrative),
        duration: 40,
        immersion: 'Community connections and celebrations'
      },

      celebration: narrative.milestones?.completion ||
        `🏆 Congratulations! You've earned your Junior ${career} Certificate!`
    };
  }

  /**
   * Map subjects to act with enhanced narrative context
   */
  private mapSubjectsToAct(
    container: 'learn' | 'experience' | 'discover',
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
        narrative: narrative.subjectContextsAligned?.[subjectKey]?.[container] ||
          `Learn ${skill.skillName} through ${career} activities`,
        careerContext: `As a ${career}, you'll use ${skill.skillName} to solve problems`,
        examples: this.getExamplesForContainer(container, skill, career),
        realWorldConnection: narrative.realWorldApplications?.[subjectKey]?.immediate ||
          `Apply ${skill.skillName} in everyday life`
      };
    });
  }

  /**
   * Get examples based on container type
   */
  private getExamplesForContainer(
    container: string,
    skill: SkillReference,
    career: string
  ): string[] {
    switch (container) {
      case 'learn':
        return [
          `Interactive ${skill.skillName} lesson`,
          `${career}-themed practice problems`,
          `Visual aids and demonstrations`
        ];
      case 'experience':
        return [
          `Hands-on ${career} scenarios`,
          `Apply ${skill.skillName} to solve problems`,
          `Make real ${career} decisions`
        ];
      case 'discover':
        return [
          `Explore how ${career}s use ${skill.skillName}`,
          `Community impact activities`,
          `Share your discoveries`
        ];
      default:
        return ['Engaging activities'];
    }
  }

  /**
   * Generate activity summary
   */
  private generateActivities(narrative: EnhancedMasterNarrative): ActivitySet {
    return {
      learn: {
        description: 'Foundation building at Virtual Academy',
        questionCount: 12, // 3 per subject
        duration: 40,
        format: 'Interactive lessons with immediate feedback',
        engagement: narrative.companionInteractions?.greetings?.[0] ||
          'Spark guides you through each concept'
      },
      experience: {
        description: 'Apply skills at Virtual Workplace',
        questionCount: 8, // 2 per subject
        duration: 40,
        format: 'Real-world scenarios and problem-solving',
        engagement: 'Hands-on practice with career tools'
      },
      discover: {
        description: 'Explore connections on Virtual Field Trip',
        questionCount: 8, // 2 per subject
        duration: 40,
        format: 'Discovery-based learning and exploration',
        engagement: 'See your impact on the community'
      },
      total: {
        questions: 28,
        duration: 120,
        engagement: 'Continuous interaction with adaptive AI companion'
      }
    };
  }

  /**
   * Generate assessment plan with transparency
   */
  private generateAssessment(
    skills: BasicLessonInput['skills'],
    narrative: EnhancedMasterNarrative
  ): AssessmentPlan {
    const subjects = ['math', 'ela', 'science', 'social'];

    return {
      overview: narrative.parentInsights?.adaptiveNature ||
        'Adaptive assessments that adjust to your child\'s pace',
      subjects: subjects.map(subject => ({
        subject: subject.toUpperCase(),
        skill: skills[subject].skillName,
        questionCount: 3,
        questionTypes: ['Multiple Choice', 'True/False', 'Visual Matching'],
        sampleQuestions: [
          `Identify the correct ${skills[subject].skillName} concept`,
          `Apply ${skills[subject].skillName} to solve a problem`,
          `Demonstrate understanding through selection`
        ],
        adaptiveRules: 'Questions adjust based on performance'
      })),
      totalTime: '20 minutes',
      passingScore: '70%',
      retakePolicy: 'Unlimited attempts with different questions',
      parentVisibility: 'Real-time progress dashboard with detailed insights'
    };
  }

  /**
   * Generate skills verification table
   */
  private generateSkillsTable(
    skills: BasicLessonInput['skills'],
    narrative: EnhancedMasterNarrative
  ): SkillsTable {
    const subjects = ['math', 'ela', 'science', 'social'];

    return {
      headers: ['Subject', 'Standard', 'Skill', 'Objective', 'Mastery', 'Real-World Use'],
      rows: subjects.map(subject => {
        const skill = skills[subject];
        const subjectKey = subject === 'social' ? 'socialStudies' : subject;

        return {
          subject: subject.toUpperCase(),
          standard: skill.standard,
          skill: skill.skillName,
          objective: `Master ${skill.skillName} through career exploration`,
          mastery: this.getMasteryTarget(skill),
          realWorld: narrative.realWorldApplications?.[subjectKey]?.immediate ||
            'Immediate real-world application'
        };
      }),
      footnote: '✓ All skills align with Common Core and state standards'
    };
  }

  /**
   * Get mastery target for skill
   */
  private getMasteryTarget(skill: SkillReference): string {
    if (skill.grade <= 2) {
      return '80% accuracy with visual aids';
    } else if (skill.grade <= 5) {
      return '75% accuracy with minimal hints';
    } else {
      return '70% accuracy independently';
    }
  }

  /**
   * Generate quality rubric with adaptive features
   */
  private generateRubric(
    skills: BasicLessonInput['skills'],
    narrative: EnhancedMasterNarrative
  ): QualityRubric {
    return {
      masteryLevels: {
        expert: {
          score: '90-100%',
          description: 'Complete understanding with independent application',
          reward: narrative.milestones?.completion || 'Excellence Certificate'
        },
        proficient: {
          score: '70-89%',
          description: 'Solid understanding with minimal support',
          reward: 'Progress Badge'
        },
        developing: {
          score: '50-69%',
          description: 'Building understanding with guidance',
          reward: 'Participation Star'
        },
        beginning: {
          score: 'Below 50%',
          description: 'Starting the journey with full support',
          reward: 'Encouragement and adapted content'
        }
      },
      assessmentCriteria: {
        accuracy: 'Correct answers across all subjects',
        speed: 'Time to complete activities',
        independence: 'Hints and support needed',
        retention: 'Recall of previous concepts'
      },
      engagementMetrics: {
        timeOnTask: 'Target: 25 minutes per subject',
        completionRate: 'Target: 80% of activities',
        accuracyGoal: 'Target: 70% or higher',
        interactionRate: 'Continuous engagement expected'
      },
      adaptiveFeatures: narrative.parentInsights || {
        adaptiveNature: 'AI adjusts difficulty in real-time',
        noFailureMode: 'Every attempt is a learning opportunity',
        masteryTracking: 'Clear visualization of progress',
        dailyReports: 'Evening summary of achievements',
        weeklyProgress: 'Comprehensive improvement analysis'
      }
    };
  }

  /**
   * Generate parent guarantee with value propositions
   */
  private generateGuarantee(narrative: EnhancedMasterNarrative): ParentGuarantee {
    return {
      title: '🌟 THE PATHFINITY PROMISE FOR BASIC',

      narrativeMagic: {
        promise: narrative.parentValue?.engagementPromise ||
          'Learning disguised as adventure - they won\'t want to stop!',
        delivery: 'Every lesson connects to real careers your child can aspire to',
        differentiation: narrative.parentValue?.differentiator ||
          'Unlike worksheets and videos, this is active, personalized learning'
      },

      standardsCompliance: {
        commonCore: '✓ 100% Common Core aligned',
        stateStandards: '✓ Exceeds all state requirements',
        assessment: '✓ Built-in progress tracking and reporting'
      },

      personalization: {
        adaptive: narrative.guarantees?.engagement ||
          'If not engaged in 5 minutes, content adapts automatically',
        learning: narrative.guarantees?.learning ||
          'Measurable skill improvement or your money back',
        support: narrative.guarantees?.support ||
          'Daily parent reports and 24/7 support'
      },

      basicLimitations: {
        careers: 'Basic tier includes 5 premium careers',
        companion: 'Spark, our energetic AI companion',
        content: 'Full narrative depth with standard features'
      },

      upgradeOptions: {
        premium: '🚀 Premium: Unlock 50+ careers and advanced narratives',
        boosters: '⚡ Boosters: Add Trade, Corporate, Entrepreneur, or AI paths',
        satisfaction: narrative.guarantees?.satisfaction ||
          '30-day money-back guarantee - no questions asked'
      }
    };
  }
}

// Export singleton instance
export const basicLessonTemplateV2 = new BasicLessonTemplateGenerator();