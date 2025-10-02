/**
 * Basic Lesson Template V3 - Narrative-Driven Format
 *
 * ⚠️ DEMONSTRATIVE PURPOSES ONLY
 * This template generates the magical, story-driven demonstrative lesson plans
 * that show parents EXACTLY how their child will learn through adventure
 *
 * Uses NarrativeDrivenLessonTemplate for the enhanced narrative format
 * Designed for parent/teacher approval before students choose careers
 */

import {
  narrativeLessonGenerator,
  NarrativeLessonPlan,
  StudentInput,
  SkillSet,
  SkillReference
} from './NarrativeDrivenLessonTemplate';

// ============================================================================
// Type Definitions - Matching user's exact format
// ============================================================================

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
  careerIndex?: number; // Optional career index for specific career selection
}

export interface DemonstrativeLesson {
  header: {
    title: string;
    subtitle: string;
    student: string;
    grade: number;
    date: Date;
    career: string;
    companion: string;
    duration: string;
    subscriptionTier: string;
  };

  narrative: {
    missionBriefing: string;
    act1: Act;
    act2: Act;
    act3: Act;
    celebration: string;
  };

  skillsVerification: {
    headers: string[];
    rows: SkillRow[];
    footnote: string;
  };

  rubric: {
    title: string;
    masteryLevels: {
      expert: MasteryLevel;
      proficient: MasteryLevel;
      developing: MasteryLevel;
      beginning: MasteryLevel;
    };
    alignmentNote: string;
  };

  guarantee: {
    title: string;
    narrativeMagic: {
      promise: string;
    };
    standardsCompliance: {
      promise: string;
    };
    personalization: {
      promise: string;
    };
    basicLimitations: {
      careers: string;
      companions: string;
      multimedia: string;
      adaptiveFeatures: string;
    };
    upgradeOptions: {
      premium: string;
      boosters: string;
      ultimate: string;
    };
  };
}

interface Act {
  title: string;
  description: string;
  duration: number;
  subjects?: SubjectActivity[];
}

interface SubjectActivity {
  subject: string;
  skillCode: string;
  narrative: string;
  careerContext: string;
  examples: string[];
}

interface SkillRow {
  subject: string;
  standard: string;
  skill: string;
  objective: string;
  mastery: string;
  realWorld: string;
}

interface MasteryLevel {
  description: string;
  criteria: string[];
}

// ============================================================================
// Main Generator Class - Using Narrative-Driven Approach
// ============================================================================

export class BasicLessonTemplateV3Generator {
  /**
   * Generate demonstrative lesson using the narrative-driven format
   * This is what parents see BEFORE their child chooses a career
   */
  async generateDemonstrativeLesson(input: BasicLessonInput): Promise<DemonstrativeLesson> {
    // Convert input to narrative generator format
    const studentInput: StudentInput = {
      name: input.student.name,
      grade: input.student.grade,
      date: input.student.currentDate
    };

    const skills: SkillSet = input.skills;

    // Use the provided career index or default to 0
    const careerIndex = input.careerIndex ?? 0;

    // Generate the narrative-driven lesson
    const narrativeLesson = await narrativeLessonGenerator.generateDemonstrativeLessonPlan(
      studentInput,
      skills,
      careerIndex
    );

    // Transform to the exact format expected by TestBasicLessonTemplate
    return this.transformToExpectedFormat(narrativeLesson, input);
  }

  /**
   * Transform narrative lesson to match expected format
   */
  private transformToExpectedFormat(
    narrativeLesson: NarrativeLessonPlan,
    input: BasicLessonInput
  ): DemonstrativeLesson {
    return {
      header: {
        title: narrativeLesson.header.title,
        subtitle: narrativeLesson.header.subtitle,
        student: narrativeLesson.header.student,
        grade: narrativeLesson.header.grade,
        date: input.student.currentDate,
        career: narrativeLesson.header.sampleCareer.split(' ')[0], // Remove emoji
        companion: narrativeLesson.header.sampleCompanion.split(' ')[0], // Remove emoji
        duration: '2 hours of magical learning',
        subscriptionTier: 'BASIC'
      },

      narrative: {
        missionBriefing: narrativeLesson.missionBriefing,

        act1: this.transformAct(narrativeLesson.act1, 'learn'),
        act2: this.transformAct(narrativeLesson.act2, 'experience'),
        act3: this.transformAct(narrativeLesson.act3, 'discover'),

        celebration: narrativeLesson.celebration
      },

      skillsVerification: {
        headers: ['Subject', 'Standard', 'Skill', 'Learning Objective', 'Mastery Target', 'Real-World Application'],
        rows: narrativeLesson.skillsVerification.standards.map((std, i) => ({
          subject: std.subject,
          standard: `${std.grade}.${std.cluster}.${std.skillCode}`,
          skill: std.standardName,
          objective: narrativeLesson.skillsVerification.magicExplanation[i]?.skill || `Master ${std.standardName}`,
          mastery: narrativeLesson.skillsVerification.masteryTargets[i]?.target || '80% accuracy',
          realWorld: narrativeLesson.skillsVerification.magicExplanation[i]?.narrative || 'Real-world application'
        })),
        footnote: '✨ All skills magically align with Common Core standards through career adventures!'
      },

      rubric: {
        title: 'Mastery Levels & Success Criteria',
        masteryLevels: {
          expert: {
            description: 'Complete mastery with creative application',
            criteria: [
              'Answers 90-100% of questions correctly',
              'Applies skills to new career scenarios independently',
              'Helps companion solve complex problems',
              'Earns special career certification'
            ]
          },
          proficient: {
            description: 'Strong understanding with confident application',
            criteria: [
              'Answers 70-89% of questions correctly',
              'Successfully completes career missions',
              'Uses hints effectively when needed',
              'Progresses through all three acts smoothly'
            ]
          },
          developing: {
            description: 'Building skills with companion support',
            criteria: [
              'Answers 50-69% of questions correctly',
              'Completes missions with companion guidance',
              'Benefits from repeated practice opportunities',
              'Shows improvement throughout the adventure'
            ]
          },
          beginning: {
            description: 'Starting the learning journey',
            criteria: [
              'Answers below 50% correctly',
              'Receives maximum companion support',
              'Content automatically adapts to easier level',
              'Focus on engagement and confidence building'
            ]
          }
        },
        alignmentNote: 'Every adventure aligns perfectly with grade-level standards while feeling like pure fun!'
      },

      guarantee: {
        title: '🌟 THE PATHFINITY PARENT GUARANTEE',

        narrativeMagic: {
          promise: narrativeLesson.parentGuarantee.narrativeMagic
        },

        standardsCompliance: {
          promise: narrativeLesson.parentGuarantee.standardsCompliance
        },

        personalization: {
          promise: narrativeLesson.parentGuarantee.personalizationPromise
        },

        basicLimitations: {
          careers: 'Grade-appropriate selection',
          companions: 'Spark companion included',
          multimedia: 'Standard visuals and audio',
          adaptiveFeatures: 'Core adaptive features'
        },

        upgradeOptions: {
          premium: 'Access complete library of 200+ careers across all grades',
          boosters: 'Add specialized career skills beyond academics',
          ultimate: 'Future-ready education with AI integration'
        }
      }
    };
  }

  /**
   * Transform narrative act to expected format
   */
  private transformAct(narrativeAct: any, phase: string): Act {
    const phaseDescriptions = {
      learn: 'Master fundamentals through career-focused lessons',
      experience: 'Apply skills in real career scenarios',
      discover: 'Present findings and save the day!'
    };

    const phaseDurations = {
      learn: 40,
      experience: 40,
      discover: 40
    };

    return {
      title: narrativeAct.title,
      description: phaseDescriptions[phase] || narrativeAct.setting || '',
      duration: phaseDurations[phase] || 40,
      subjects: narrativeAct.subjects?.map(subj => ({
        subject: subj.subject,
        skillCode: subj.skillTag || subj.skillCode || '',
        narrative: subj.narrative,
        careerContext: subj.immersion || `Apply ${subj.subject} skills in career context`,
        examples: this.generateExamples(phase, subj.subject)
      }))
    };
  }

  /**
   * Generate examples for each phase
   */
  private generateExamples(phase: string, subject: string): string[] {
    const exampleMap = {
      learn: [
        `Interactive ${subject} lesson with visual aids`,
        'Career-themed practice problems',
        'Companion-guided exploration'
      ],
      experience: [
        `Hands-on ${subject} challenge`,
        'Real career scenario application',
        'Problem-solving with companion support'
      ],
      discover: [
        `Present ${subject} findings`,
        'Share discoveries with the community',
        'Celebrate mastery achievement'
      ]
    };

    return exampleMap[phase] || ['Engaging career-based activity'];
  }
}

// Export singleton instance
export const basicLessonTemplateV3 = new BasicLessonTemplateV3Generator();