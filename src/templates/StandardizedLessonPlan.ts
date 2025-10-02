/**
 * Standardized Lesson Plan Template
 * Integrates with existing Narrative and JIT content systems
 * Generates PDFs and renders through existing Learn > Video > Practice > Assessment flow
 */

export interface StandardizedLessonPlan {
  // Metadata
  lessonId: string;
  templateType: LessonTemplateType;
  generatedAt: Date;

  // Student & Career Context
  student: {
    name: string;
    gradeLevel: string;
    gradeCategory: 'elementary' | 'middle' | 'high';
  };

  career: {
    careerCode: string;
    careerName: string;
    icon: string;
    category: string;
  };

  // Curriculum Alignment
  curriculum: {
    subject: 'Math' | 'ELA' | 'Science' | 'Social Studies';
    standardCode: string; // e.g., "A.1"
    skillObjective: string; // e.g., "Identify numbers - up to 3"
    gradeStandard: string; // e.g., "K.Math.A.1"
  };

  // Subscription Configuration
  subscription: {
    tier: 'basic' | 'premium';
    applicationPath: 'standard' | 'trade_skill' | 'corporate' | 'entrepreneur';
    knowledgeMode: 'standard' | 'ai_first';
    enabledBoosters: string[];
  };

  // Lesson Content (integrates with existing systems)
  content: {
    // Maps to NarrativeLearnContainer
    narrativeContext: {
      title: string;
      introduction: string;
      careerConnection: string;
      skillIntegration: string;
      masterNarrative: string; // From MasterNarrativeGenerator
    };

    // Maps to InstructionalVideoComponent
    video: {
      title: string;
      duration: number;
      videoUrl?: string;
      fallbackContent?: string;
      transcript: string;
    };

    // Maps to JustInTimeContentService
    practice: {
      activityType: string;
      instructions: string;
      materials: string[];
      jitContent: any; // From JustInTimeContentService
      interactionData: any;
    };

    // Assessment
    assessment: {
      questions: AssessmentQuestion[];
      passingScore: number;
      rubric: AssessmentRubric;
    };

    // Experience Scenarios (JIT)
    experienceScenarios: {
      scenarioId: string;
      jitTrigger: string;
      content: any; // From JustInTimeContentService
    }[];

    // Discover Challenges (JIT)
    discoverChallenges: {
      challengeId: string;
      jitTrigger: string;
      content: any; // From JustInTimeContentService
    }[];
  };

  // Template-Specific Enhancements
  enhancements: {
    // Trade/Skill Specific
    tradeElements?: {
      tools: string[];
      techniques: string[];
      safetyNotes: string[];
      certificationAlignment: string;
    };

    // Corporate Specific
    corporateElements?: {
      professionalSkills: string[];
      officeTools: string[];
      businessEtiquette: string[];
      industryTerms: string[];
    };

    // Entrepreneur Specific
    entrepreneurElements?: {
      businessConcepts: string[];
      innovationPrompts: string[];
      problemSolving: string[];
      startupSkills: string[];
    };

    // AI-First Enhancements
    aiElements?: {
      aiTools: string[];
      prompts: string[];
      safetyLevel: 'elementary' | 'middle' | 'high';
      parentControls: boolean;
    };
  };

  // PDF Generation Data
  pdfData: {
    filename: string;
    layout: 'standard' | 'worksheet' | 'activity';
    includeParentGuide: boolean;
    includeAnswerKey: boolean;
  };
}

export type LessonTemplateType =
  | 'SELECT_STANDARD'
  | 'SELECT_STANDARD_AI'
  | 'PREMIUM_STANDARD'
  | 'PREMIUM_STANDARD_AI'
  | 'PREMIUM_TRADE'
  | 'PREMIUM_TRADE_AI'
  | 'PREMIUM_CORPORATE'
  | 'PREMIUM_CORPORATE_AI'
  | 'PREMIUM_ENTREPRENEUR'
  | 'PREMIUM_ENTREPRENEUR_AI';

export interface AssessmentQuestion {
  questionId: string;
  questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'visual';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  hint?: string;  // Added hint from AI generation
  outcome?: string;  // Added outcome for correct answer
  learningPoint?: string;  // Added specific learning point
  careerContext: string;
  skillAlignment: string;
}

export interface AssessmentRubric {
  mastery: { score: number; description: string };
  proficient: { score: number; description: string };
  developing: { score: number; description: string };
  beginning: { score: number; description: string };
}

/**
 * Template Generator Class
 * Creates lesson plans by combining curriculum, career, and subscription data
 */
export class LessonPlanGenerator {
  constructor(
    private narrativeGenerator: any, // MasterNarrativeGenerator
    private jitService: any, // JustInTimeContentService
  ) {}

  /**
   * Generate a complete lesson plan
   */
  async generateLessonPlan(
    student: any,
    career: any,
    curriculumSkill: any,
    subscription: any,
    templateType: LessonTemplateType
  ): Promise<StandardizedLessonPlan> {

    // Generate base lesson structure
    const lesson: StandardizedLessonPlan = {
      lessonId: this.generateLessonId(),
      templateType,
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
        subject: curriculumSkill.subject,
        standardCode: curriculumSkill.standardCode,
        skillObjective: curriculumSkill.objective,
        gradeStandard: `${student.gradeLevel}.${curriculumSkill.subject}.${curriculumSkill.standardCode}`
      },

      subscription: {
        tier: subscription.tier,
        applicationPath: this.getApplicationPath(templateType),
        knowledgeMode: this.getKnowledgeMode(templateType),
        enabledBoosters: subscription.boosters || []
      },

      content: await this.generateContent(
        career,
        curriculumSkill,
        templateType,
        student.gradeLevel
      ),

      enhancements: this.generateEnhancements(templateType, career, curriculumSkill),

      pdfData: {
        filename: this.generatePDFFilename(student, career, curriculumSkill),
        layout: 'standard',
        includeParentGuide: true,
        includeAnswerKey: true
      }
    };

    return lesson;
  }

  /**
   * Generate content sections using existing services
   */
  private async generateContent(
    career: any,
    skill: any,
    templateType: LessonTemplateType,
    gradeLevel: string
  ) {
    // Use MasterNarrativeGenerator for narrative
    const masterNarrative = await this.narrativeGenerator.generate({
      career,
      skill,
      templateType,
      gradeLevel
    });

    // Use JustInTimeContentService for practice/scenarios
    const jitContent = await this.jitService.generateContent({
      context: 'lesson_plan',
      career,
      skill,
      templateType
    });

    return {
      narrativeContext: {
        title: this.generateTitle(career, skill),
        introduction: this.generateIntroduction(career, skill, templateType),
        careerConnection: this.generateCareerConnection(career, skill),
        skillIntegration: this.generateSkillIntegration(skill, career),
        masterNarrative
      },

      video: {
        title: `${career.career_name}: ${skill.objective}`,
        duration: this.getVideoDuration(gradeLevel),
        videoUrl: undefined, // Will be populated by video service
        fallbackContent: this.generateVideoFallback(career, skill),
        transcript: this.generateVideoTranscript(career, skill, templateType)
      },

      practice: {
        activityType: this.getActivityType(templateType),
        instructions: this.generateInstructions(career, skill, templateType),
        materials: this.getMaterials(templateType, career),
        jitContent: jitContent.practice,
        interactionData: {}
      },

      assessment: {
        questions: this.generateAssessmentQuestions(career, skill, gradeLevel),
        passingScore: 70,
        rubric: this.generateRubric()
      },

      experienceScenarios: jitContent.scenarios || [],
      discoverChallenges: jitContent.challenges || []
    };
  }

  /**
   * Generate template-specific enhancements
   */
  private generateEnhancements(
    templateType: LessonTemplateType,
    career: any,
    skill: any
  ) {
    const enhancements: any = {};

    if (templateType.includes('TRADE')) {
      enhancements.tradeElements = {
        tools: this.getTradeTools(career),
        techniques: this.getTradeTechniques(career, skill),
        safetyNotes: this.getSafetyNotes(career),
        certificationAlignment: this.getCertificationAlignment(career)
      };
    }

    if (templateType.includes('CORPORATE')) {
      enhancements.corporateElements = {
        professionalSkills: this.getCorporateSkills(career),
        officeTools: this.getOfficeTools(career),
        businessEtiquette: this.getBusinessEtiquette(),
        industryTerms: this.getIndustryTerms(career)
      };
    }

    if (templateType.includes('ENTREPRENEUR')) {
      enhancements.entrepreneurElements = {
        businessConcepts: this.getBusinessConcepts(skill),
        innovationPrompts: this.getInnovationPrompts(career, skill),
        problemSolving: this.getProblemSolvingPrompts(career),
        startupSkills: this.getStartupSkills()
      };
    }

    if (templateType.includes('AI')) {
      enhancements.aiElements = {
        aiTools: this.getAITools(templateType),
        prompts: this.getAIPrompts(career, skill),
        safetyLevel: this.getAISafetyLevel(templateType),
        parentControls: true
      };
    }

    return enhancements;
  }

  // Helper methods

  private generateLessonId(): string {
    return `LESSON_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getGradeCategory(gradeLevel: string): 'elementary' | 'middle' | 'high' {
    const grade = gradeLevel.toUpperCase();
    if (['K', '1', '2', '3', '4', '5'].includes(grade)) return 'elementary';
    if (['6', '7', '8'].includes(grade)) return 'middle';
    return 'high';
  }

  private getApplicationPath(templateType: LessonTemplateType): any {
    if (templateType.includes('TRADE')) return 'trade_skill';
    if (templateType.includes('CORPORATE')) return 'corporate';
    if (templateType.includes('ENTREPRENEUR')) return 'entrepreneur';
    return 'standard';
  }

  private getKnowledgeMode(templateType: LessonTemplateType): 'standard' | 'ai_first' {
    return templateType.includes('AI') ? 'ai_first' : 'standard';
  }

  private generateTitle(career: any, skill: any): string {
    return `${career.career_name}: Mastering ${skill.objective}`;
  }

  private generateIntroduction(career: any, skill: any, templateType: LessonTemplateType): string {
    const approach = this.getApplicationPath(templateType);
    const intro = `Today, you'll explore how ${career.career_name}s use ${skill.objective} in their work.`;

    const approachText = {
      'trade_skill': ' You\'ll learn hands-on techniques used by professionals.',
      'corporate': ' You\'ll discover how this skill applies in office settings.',
      'entrepreneur': ' You\'ll see how business owners use this skill to succeed.',
      'standard': ''
    };

    return intro + (approachText[approach] || '');
  }

  private generateCareerConnection(career: any, skill: any): string {
    return `${career.career_name}s use ${skill.objective} every day to ${career.description}`;
  }

  private generateSkillIntegration(skill: any, career: any): string {
    return `By practicing ${skill.objective} like a real ${career.career_name}, you'll master this important skill.`;
  }

  private getVideoDuration(gradeLevel: string): number {
    const category = this.getGradeCategory(gradeLevel);
    return category === 'elementary' ? 180 : category === 'middle' ? 300 : 420;
  }

  private generateVideoFallback(career: any, skill: any): string {
    return `Watch how ${career.career_name}s use ${skill.objective} in their daily work.`;
  }

  private generateVideoTranscript(career: any, skill: any, templateType: LessonTemplateType): string {
    // This would be generated by AI based on template type
    return `[Video transcript for ${career.career_name} demonstrating ${skill.objective}]`;
  }

  private getActivityType(templateType: LessonTemplateType): string {
    if (templateType.includes('TRADE')) return 'hands_on';
    if (templateType.includes('CORPORATE')) return 'professional_simulation';
    if (templateType.includes('ENTREPRENEUR')) return 'innovation_challenge';
    return 'exploration';
  }

  private generateInstructions(career: any, skill: any, templateType: LessonTemplateType): string {
    return `Complete the ${career.career_name} challenge using ${skill.objective}`;
  }

  private getMaterials(templateType: LessonTemplateType, career: any): string[] {
    const baseMaterials = ['Computer or tablet', 'Worksheet'];
    if (templateType.includes('TRADE')) {
      return [...baseMaterials, 'Practice materials', 'Safety equipment'];
    }
    return baseMaterials;
  }

  private generateAssessmentQuestions(career: any, skill: any, gradeLevel: string): AssessmentQuestion[] {
    // This would generate grade-appropriate questions
    return [
      {
        questionId: 'Q1',
        questionType: 'multiple_choice',
        question: `How do ${career.career_name}s use ${skill.objective}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        explanation: `${career.career_name}s need this skill to succeed.`,
        careerContext: career.career_name,
        skillAlignment: skill.objective
      }
    ];
  }

  private generateRubric(): AssessmentRubric {
    return {
      mastery: { score: 90, description: 'Shows exceptional understanding and application' },
      proficient: { score: 80, description: 'Demonstrates solid understanding' },
      developing: { score: 70, description: 'Shows growing understanding' },
      beginning: { score: 60, description: 'Beginning to understand concepts' }
    };
  }

  private generatePDFFilename(student: any, career: any, skill: any): string {
    const date = new Date().toISOString().split('T')[0];
    return `${student.name}_${career.career_code}_${skill.standardCode}_${date}.pdf`;
  }

  // Template-specific helper methods would follow...
  private getTradeTools(career: any): string[] {
    // Return trade-specific tools based on career
    return [];
  }

  private getTradeTechniques(career: any, skill: any): string[] {
    return [];
  }

  private getSafetyNotes(career: any): string[] {
    return ['Always follow safety guidelines', 'Wear appropriate protective equipment'];
  }

  private getCertificationAlignment(career: any): string {
    return 'Aligns with industry certification standards';
  }

  private getCorporateSkills(career: any): string[] {
    return ['Professional communication', 'Time management', 'Teamwork'];
  }

  private getOfficeTools(career: any): string[] {
    return ['Email', 'Spreadsheets', 'Presentations'];
  }

  private getBusinessEtiquette(): string[] {
    return ['Professional greeting', 'Appropriate dress', 'Meeting behavior'];
  }

  private getIndustryTerms(career: any): string[] {
    return [];
  }

  private getBusinessConcepts(skill: any): string[] {
    return ['Value proposition', 'Customer needs', 'Problem solving'];
  }

  private getInnovationPrompts(career: any, skill: any): string[] {
    return [`How could ${career.career_name}s use ${skill.objective} in a new way?`];
  }

  private getProblemSolvingPrompts(career: any): string[] {
    return ['What problem does this solve?', 'Who would benefit?'];
  }

  private getStartupSkills(): string[] {
    return ['Idea generation', 'Basic budgeting', 'Customer focus'];
  }

  private getAITools(templateType: LessonTemplateType): string[] {
    return ['Pathfinity AI Assistant', 'Safe Image Generator'];
  }

  private getAIPrompts(career: any, skill: any): string[] {
    return [
      `Help me understand how ${career.career_name}s use ${skill.objective}`,
      `Show me examples of ${skill.objective} in ${career.career_name} work`
    ];
  }

  private getAISafetyLevel(templateType: LessonTemplateType): 'elementary' | 'middle' | 'high' {
    // Determine based on grade level in template
    return 'elementary';
  }
}