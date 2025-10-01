/**
 * Lesson Plan Orchestrator
 * Connects all services to generate complete lesson plans
 */

import { StandardizedLessonPlan, LessonPlanGenerator } from '../../templates/StandardizedLessonPlan';
import { MasterNarrativeGenerator } from '../narrative/MasterNarrativeGenerator';
import { JustInTimeContentService } from '../content/JustInTimeContentService';
import { lessonArchive } from '../storage/LessonArchiveService';
import { generateUnifiedLessonPDF } from '../pdf/UnifiedLessonPlanPDFGenerator';
import { supabase } from '../../lib/supabase';

interface Student {
  id: string;
  name: string;
  gradeLevel: string;
  subscription: {
    tier: 'basic' | 'premium';
    boosters: string[];
    aiEnabled: boolean;
  };
}

interface CurriculumSkill {
  subject: 'Math' | 'ELA' | 'Science' | 'Social Studies';
  standardCode: string;
  objective: string;
  gradeLevel: string;
}

interface Career {
  career_code: string;
  career_name: string;
  icon: string;
  career_category: string;
  description: string;
}

export class LessonPlanOrchestrator {
  private narrativeGenerator: MasterNarrativeGenerator;
  private jitService: JustInTimeContentService;
  private lessonGenerator: LessonPlanGenerator;

  constructor() {
    this.narrativeGenerator = new MasterNarrativeGenerator();
    this.jitService = new JustInTimeContentService();
    this.lessonGenerator = new LessonPlanGenerator(
      this.narrativeGenerator,
      this.jitService
    );
  }

  /**
   * Generate unified daily lesson plan for all subjects
   */
  async generateDailyLessons(studentId: string, careerId?: string): Promise<{
    lesson: any; // Unified lesson plan
    archive: any;
  }> {
    // 1. Get student info
    const student = await this.getStudent(studentId);

    // 2. Get today's curriculum skills for ALL subjects
    const todaySkills = await this.getTodaysCurriculum(student.gradeLevel);

    // 3. Get student's selected career for today (example)
    const career = await this.getStudentCareerForToday(studentId, careerId);

    // 4. Determine template type based on subscription
    const templateType = this.determineTemplateType(student.subscription);

    // 5. Generate ONE unified lesson plan for ALL subjects
    try {
      const unifiedLesson = await this.generateUnifiedDailyLesson(
        student,
        career,
        todaySkills, // Pass all skills
        templateType
      );

      // Generate PDF (without Buffer for browser compatibility)
      const pdfData = await generateUnifiedLessonPDF(unifiedLesson);

      // For browser environment, just store the blob
      let archive = null;
      if (typeof window !== 'undefined') {
        // Browser environment - skip Buffer conversion
        archive = {
          lessonId: unifiedLesson.lessonId,
          pdfBlob: pdfData,
          jsonData: unifiedLesson
        };
      } else {
        // Node environment - use Buffer
        const pdfBuffer = pdfData as any;
        archive = await lessonArchive.archiveLessonPlan(unifiedLesson, pdfBuffer);
      }

      console.log(`✅ Generated unified daily lesson plan: ${unifiedLesson.lessonId}`);

      // 6. Notify parent (optional)
      await this.notifyParent(student, unifiedLesson);

      return { unifiedLesson, archive };
    } catch (error) {
      console.error('❌ Failed to generate unified lesson plan:', error);
      throw error;
    }
  }

  /**
   * Generate unified daily lesson plan for all subjects
   */
  async generateUnifiedDailyLesson(
    student: Student,
    career: Career,
    allSkills: CurriculumSkill[],
    templateType: string
  ): Promise<any> {
    // Generate ONE master narrative for the entire day
    const masterNarrative = await this.narrativeGenerator.generateMasterNarrative({
      studentName: student.name,
      gradeLevel: student.gradeLevel,
      career: career.career_name,
      subjects: ['math', 'ela', 'science', 'socialStudies']
    });

    // Generate JIT content for each subject (with reduced examples)
    const subjectContents: any = {};

    for (const skill of allSkills) {
      const jitContent = await this.jitService.generateContainerContent({
        userId: student.id,
        container: 'experience',
        containerType: 'experience',
        subject: skill.subject as any,
        context: {
          skill: {
            name: skill.objective,
            skill_name: skill.objective,
            skill_number: skill.standardCode
          },
          student: {
            id: student.id,
            name: student.name,
            grade_level: student.gradeLevel
          },
          career: career.career_name,
          careerDescription: career.description,
          narrativeContext: masterNarrative.settingProgression?.experience ? {
            setting: masterNarrative.settingProgression.experience.location,
            context: masterNarrative.settingProgression.experience.context,
            narrative: masterNarrative.settingProgression.experience.narrative,
            mission: masterNarrative.cohesiveStory?.mission,
            throughLine: masterNarrative.cohesiveStory?.throughLine,
            companion: masterNarrative.companionIntegration
          } : undefined
        },
        timeConstraint: 10
      });

      // Store only 2 examples per subject (not 4)
      // Use the MAPPED questions that have the full description field preserved
      let challenges = [];
      let setup = '';

      // Use the questions array which has been properly mapped with description field
      if (jitContent.questions && jitContent.questions.length > 0) {
        challenges = jitContent.questions.slice(0, 2);
        setup = jitContent.instructions || jitContent.scenario || '';

        // Debug: Log the challenge structure
        console.log(`📝 ${skill.subject} challenges structure:`,
          challenges.map(c => ({
            hasDescription: !!c.description,
            descriptionPreview: c.description?.substring(0, 50) + '...',
            hasQuestion: !!c.question,
            hasSummary: !!c.challenge_summary
          }))
        );
      }

      // Also preserve the raw interactive_simulation for reference
      const interactiveSimulation = jitContent.interactive_simulation;

      subjectContents[skill.subject] = {
        skill: skill,
        setup: setup,
        challenges: challenges,
        interactive_simulation: interactiveSimulation  // Keep the full raw data for reference
      };
    }

    // Build the unified lesson plan structure
    const unifiedLesson = {
      lessonId: this.generateLessonId(),
      templateType: templateType as any,
      generatedAt: new Date(),

      student: {
        name: student.name,
        gradeLevel: student.gradeLevel,
        gradeCategory: this.getGradeCategory(student.gradeLevel)
      },

      career: {
        careerCode: career.career_code,
        careerName: career.career_name,
        icon: career.icon,
        category: career.career_category
      },

      // All subjects in one plan
      curriculum: {
        subjects: allSkills.map(skill => ({
          subject: skill.subject,
          standardCode: skill.standardCode,
          skillObjective: skill.objective,
          gradeStandard: `${student.gradeLevel}.${skill.subject}.${skill.standardCode}`
        }))
      },

      // Content structure expected by PDF generator
      content: {
        masterNarrative: masterNarrative,
        subjectContents: subjectContents
      },

      subscription: {
        tier: student.subscription.tier,
        applicationPath: this.getApplicationPath(templateType),
        knowledgeMode: this.getKnowledgeMode(templateType),
        enabledBoosters: student.subscription.boosters
      },

      pdfData: {
        filename: `${student.name}_Daily_Learning_${new Date().toISOString().split('T')[0]}.pdf`,
        layout: 'unified',
        includeParentGuide: true,
        includeAnswerKey: false
      }
    };

    return unifiedLesson;
  }

  /**
   * Generate a single lesson plan (keeping for backwards compatibility)
   */
  async generateSingleLesson(
    student: Student,
    career: Career,
    skill: CurriculumSkill,
    templateType: string
  ): Promise<StandardizedLessonPlan> {
    // Generate master narrative
    const masterNarrative = await this.narrativeGenerator.generateMasterNarrative({
      studentName: student.name,
      gradeLevel: student.gradeLevel,
      career: career.career_name,
      subjects: ['math', 'ela', 'science', 'socialStudies']
    });

    // Generate JIT content for practice and scenarios
    const jitContent = await this.jitService.generateContainerContent({
      userId: student.id,
      container: 'experience',
      containerType: 'experience',
      subject: skill.subject as any,
      context: {
        skill: {
          name: skill.objective,
          skill_name: skill.objective,
          skill_number: skill.standardCode
        },
        student: {
          id: student.id,
          name: student.name,
          grade_level: student.gradeLevel
        },
        career: career.career_name,
        careerDescription: career.description,
        // Pass narrative context from MasterNarrative to JIT
        narrativeContext: masterNarrative.settingProgression?.experience ? {
          setting: masterNarrative.settingProgression.experience.location,
          context: masterNarrative.settingProgression.experience.context,
          narrative: masterNarrative.settingProgression.experience.narrative,
          mission: masterNarrative.cohesiveStory?.mission,
          throughLine: masterNarrative.cohesiveStory?.throughLine,
          companion: masterNarrative.companionIntegration
        } : undefined
      }
    });

    // Build the complete lesson plan
    const lessonPlan: StandardizedLessonPlan = {
      lessonId: this.generateLessonId(),
      templateType: templateType as any,
      generatedAt: new Date(),

      student: {
        name: student.name,
        gradeLevel: student.gradeLevel,
        gradeCategory: this.getGradeCategory(student.gradeLevel)
      },

      career: {
        careerCode: career.career_code,
        careerName: career.career_name,
        icon: career.icon,
        category: career.career_category
      },

      curriculum: {
        subject: skill.subject,
        standardCode: skill.standardCode,
        skillObjective: skill.objective,
        gradeStandard: `${student.gradeLevel}.${skill.subject}.${skill.standardCode}`
      },

      subscription: {
        tier: student.subscription.tier,
        applicationPath: this.getApplicationPath(templateType),
        knowledgeMode: student.subscription.aiEnabled ? 'ai_first' : 'standard',
        enabledBoosters: student.subscription.boosters
      },

      content: {
        narrativeContext: {
          title: this.generateTitle(career, skill),
          introduction: masterNarrative.missionBriefing?.greeting || `Welcome to ${career.career_name} training!`,
          careerConnection: `${career.career_name}s use ${skill.objective} to ${career.description}`,
          skillIntegration: masterNarrative.cohesiveStory.throughLine,
          masterNarrative: JSON.stringify(masterNarrative)
        },

        video: {
          title: `${career.career_name}: ${skill.objective} in Action`,
          duration: this.getVideoDuration(student.gradeLevel),
          videoUrl: undefined, // Will be populated by video service
          fallbackContent: `Watch how ${career.career_name}s use ${skill.objective}`,
          transcript: this.generateVideoTranscript(career, skill)
        },

        practice: {
          activityType: this.getActivityType(templateType),
          instructions: jitContent?.instructions || `Help ${career.career_name} Sam complete tasks using ${skill.objective}`,
          materials: this.getMaterials(templateType),
          jitContent: jitContent || {},
          interactionData: {}
        },

        assessment: {
          questions: jitContent?.questions || this.generateAssessmentQuestions(career, skill, student.gradeLevel),
          passingScore: 70,
          rubric: this.generateRubric()
        },

        experienceScenarios: this.generateExperienceScenarios(career, skill),
        discoverChallenges: this.generateDiscoverChallenges(career, skill)
      },

      enhancements: this.generateEnhancements(templateType, career, skill),

      pdfData: {
        filename: this.generatePDFFilename(student, career, skill),
        layout: 'standard',
        includeParentGuide: true,
        includeAnswerKey: true
      }
    };

    return lessonPlan;
  }

  // Helper methods

  private async getStudent(studentId: string): Promise<Student> {
    // In real implementation, fetch from Supabase
    // For now, return mock data
    return {
      id: studentId,
      name: 'Sam',
      gradeLevel: 'K',
      subscription: {
        tier: 'basic',
        boosters: [],
        aiEnabled: false
      }
    };
  }

  private async getTodaysCurriculum(gradeLevel: string): Promise<CurriculumSkill[]> {
    // In real implementation, fetch from curriculum service
    // For now, return sample skills
    return [
      {
        subject: 'Math',
        standardCode: 'A.1',
        objective: 'Identify numbers - up to 3',
        gradeLevel
      },
      {
        subject: 'ELA',
        standardCode: 'A.1',
        objective: 'Find the letter in the alphabet: uppercase',
        gradeLevel
      },
      {
        subject: 'Science',
        standardCode: 'A.1',
        objective: 'Classify objects by two-dimensional shape',
        gradeLevel
      },
      {
        subject: 'Social Studies',
        standardCode: 'A.1',
        objective: 'What is a community?',
        gradeLevel
      }
    ];
  }

  private async getStudentCareerForToday(studentId: string, careerId?: string): Promise<Career> {
    // Map career IDs to career objects
    const careerMap: Record<string, Career> = {
      'chef': {
        career_code: 'ELEM_CHEF',
        career_name: 'Chef',
        icon: '👨‍🍳',
        career_category: 'Culinary Arts',
        description: 'create delicious meals and new recipes'
      },
      'marine_biologist': {
        career_code: 'ELEM_MARINE_BIO',
        career_name: 'Marine Biologist',
        icon: '🐋',
        career_category: 'Science',
        description: 'explore ocean depths and marine ecosystems'
      },
      'astronaut': {
        career_code: 'ELEM_ASTRONAUT',
        career_name: 'Astronaut',
        icon: '🚀',
        career_category: 'Space',
        description: 'journey through space exploration'
      },
      'archaeologist': {
        career_code: 'ELEM_ARCHAEOLOGIST',
        career_name: 'Archaeologist',
        icon: '🏺',
        career_category: 'History',
        description: 'discover ancient history'
      },
      'game_designer': {
        career_code: 'ELEM_GAME_DESIGNER',
        career_name: 'Game Designer',
        icon: '🎮',
        career_category: 'Technology',
        description: 'create digital worlds'
      },
      'electrician': {
        career_code: 'ELEM_ELECTRICIAN',
        career_name: 'Electrician',
        icon: '⚡',
        career_category: 'Trades',
        description: 'electrical systems mastery'
      },
      'plumber': {
        career_code: 'ELEM_PLUMBER',
        career_name: 'Plumber',
        icon: '🔧',
        career_category: 'Trades',
        description: 'water systems expert'
      },
      'carpenter': {
        career_code: 'ELEM_CARPENTER',
        career_name: 'Carpenter',
        icon: '🪵',
        career_category: 'Trades',
        description: 'wood crafting professional'
      },
      'ai_doctor': {
        career_code: 'ELEM_AI_DOCTOR',
        career_name: 'AI Doctor',
        icon: '🤖',
        career_category: 'AI-Enhanced',
        description: 'medicine with AI assistance'
      },
      'ai_engineer': {
        career_code: 'ELEM_AI_ENGINEER',
        career_name: 'AI Engineer',
        icon: '🧠',
        career_category: 'AI-Enhanced',
        description: 'build AI systems'
      },
      'prompt_designer': {
        career_code: 'ELEM_PROMPT_DESIGNER',
        career_name: 'Prompt Designer',
        icon: '💭',
        career_category: 'AI-Enhanced',
        description: 'AI communication expert'
      }
    };

    // If careerId provided, use it; otherwise default to chef
    const selectedCareerId = careerId || 'chef';

    // Return the selected career or default to chef if not found
    return careerMap[selectedCareerId] || careerMap['chef'];
  }

  private determineTemplateType(subscription: any): string {
    let templateType = subscription.tier === 'basic' ? 'BASIC' : 'PREMIUM';

    // Add application path
    if (subscription.boosters.includes('trade_skill')) {
      templateType += '_TRADE';
    } else if (subscription.boosters.includes('corporate')) {
      templateType += '_CORPORATE';
    } else if (subscription.boosters.includes('entrepreneur')) {
      templateType += '_ENTREPRENEUR';
    } else {
      templateType += '_STANDARD';
    }

    // Add AI if enabled
    if (subscription.aiEnabled) {
      templateType += '_AI';
    }

    return templateType;
  }

  private generateLessonId(): string {
    return `LP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getGradeCategory(gradeLevel: string): 'elementary' | 'middle' | 'high' {
    const grade = gradeLevel.toUpperCase();
    if (['K', '1', '2', '3', '4', '5'].includes(grade)) return 'elementary';
    if (['6', '7', '8'].includes(grade)) return 'middle';
    return 'high';
  }

  private getApplicationPath(templateType: string): any {
    if (templateType.includes('TRADE')) return 'trade_skill';
    if (templateType.includes('CORPORATE')) return 'corporate';
    if (templateType.includes('ENTREPRENEUR')) return 'entrepreneur';
    return 'standard';
  }

  private getKnowledgeMode(templateType: string): 'standard' | 'ai_first' {
    return templateType.includes('AI') ? 'ai_first' : 'standard';
  }

  private generateTitle(career: Career, skill: CurriculumSkill): string {
    return `${career.career_name}'s ${skill.objective} Adventure`;
  }

  private generateIntroduction(career: Career, skill: CurriculumSkill, templateType: string): string {
    return `Today, you'll learn how ${career.career_name}s use ${skill.objective} in their exciting work!`;
  }

  private getVideoDuration(gradeLevel: string): number {
    const category = this.getGradeCategory(gradeLevel);
    return category === 'elementary' ? 180 : category === 'middle' ? 300 : 420;
  }

  private generateVideoTranscript(career: Career, skill: CurriculumSkill): string {
    return `[Video showing ${career.career_name}s using ${skill.objective} in real-world scenarios]`;
  }

  private getActivityType(templateType: string): string {
    if (templateType.includes('TRADE')) return 'hands_on';
    if (templateType.includes('CORPORATE')) return 'professional';
    if (templateType.includes('ENTREPRENEUR')) return 'innovation';
    return 'exploration';
  }

  private getMaterials(templateType: string): string[] {
    const base = ['Device or tablet', 'Worksheet (optional)'];
    if (templateType.includes('TRADE')) {
      return [...base, 'Practice materials', 'Safety equipment (if applicable)'];
    }
    return base;
  }

  private generateAssessmentQuestions(career: Career, skill: CurriculumSkill, gradeLevel: string): any[] {
    // Generate grade-appropriate questions
    return [
      {
        questionId: 'Q1',
        questionType: 'multiple_choice',
        question: `How do ${career.career_name}s use ${skill.objective}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        explanation: `${career.career_name}s need ${skill.objective} for their work`,
        careerContext: career.career_name,
        skillAlignment: skill.objective
      },
      {
        questionId: 'Q2',
        questionType: 'true_false',
        question: `${career.career_name}s use ${skill.objective} every day.`,
        correctAnswer: true,
        explanation: 'This skill is essential for their work',
        careerContext: career.career_name,
        skillAlignment: skill.objective
      }
    ];
  }

  private generateRubric(): any {
    return {
      mastery: { score: 90, description: 'Shows exceptional understanding' },
      proficient: { score: 80, description: 'Demonstrates solid grasp' },
      developing: { score: 70, description: 'Shows growing understanding' },
      beginning: { score: 60, description: 'Beginning to understand' }
    };
  }

  private generateExperienceScenarios(career: Career, skill: CurriculumSkill): any[] {
    return [
      {
        scenarioId: 'EXP_1',
        title: `A Day as a ${career.career_name}`,
        content: `Imagine you're a ${career.career_name} today! You need to ${skill.objective} to help your customers. Let's practice by organizing your workspace and helping three customers with their needs.`,
        careerFocus: career.career_name,
        skillApplication: skill.objective,
        duration: 10
      },
      {
        scenarioId: 'EXP_2',
        title: `${career.career_name}'s Problem Solving`,
        content: `Oh no! A ${career.career_name} has a challenge that needs ${skill.objective}. Can you help solve it? Work through the problem step by step using what you've learned.`,
        careerFocus: career.career_name,
        skillApplication: skill.objective,
        duration: 10
      }
    ];
  }

  private generateDiscoverChallenges(career: Career, skill: CurriculumSkill): any[] {
    return [
      {
        challengeId: 'DISC_1',
        title: `${career.career_name} Explorer`,
        content: `Visit a virtual ${career.career_category} location and find 3 ways that ${career.career_name}s use ${skill.objective}. Draw or write about what you discovered!`,
        explorationFocus: 'Real-world application',
        careerConnection: career.career_name
      },
      {
        challengeId: 'DISC_2',
        title: 'Community Helper Hunt',
        content: `Look for ${career.career_name}s in your community this week. When you see one, think about how they might be using ${skill.objective} in their work.`,
        explorationFocus: 'Community awareness',
        careerConnection: career.career_name
      }
    ];
  }

  private generateEnhancements(templateType: string, career: Career, skill: CurriculumSkill): any {
    const enhancements: any = {};

    if (templateType.includes('AI')) {
      enhancements.aiElements = {
        aiTools: ['Spark AI Assistant'],
        prompts: [
          `Help me understand how ${career.career_name}s use ${skill.objective}`,
          `Show me examples of ${skill.objective}`
        ],
        safetyLevel: 'elementary',
        parentControls: true
      };
    }

    return enhancements;
  }

  private generatePDFFilename(student: Student, career: Career, skill: CurriculumSkill): string {
    const date = new Date().toISOString().split('T')[0];
    const safe = (str: string) => str.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${safe(student.name)}_${safe(career.career_name)}_${safe(skill.subject)}_${date}.pdf`;
  }

  private async notifyParent(student: Student, lessons: StandardizedLessonPlan[]): Promise<void> {
    console.log(`📧 Notifying parent about ${lessons.length} lessons for ${student.name}`);
    // In real implementation, send email or notification
  }
}

// Export singleton instance
export const lessonOrchestrator = new LessonPlanOrchestrator();