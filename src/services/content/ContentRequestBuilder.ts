/**
 * Content Request Builder
 * Builds structured, type-safe content requests for proactive AI generation
 */

import {
  Question,
  QuestionType,
  Grade,
  Subject,
  Difficulty,
  getAvailableTypesForGradeSubject
} from '../../types/questions';
import { questionTypeRegistry } from './QuestionTypeRegistry';
import { validationService, ValidationContext } from './ValidationService';

// ============================================================================
// INTERFACES
// ============================================================================

export interface ContentRequest {
  id: string;
  timestamp: Date;
  student: StudentContext;
  learning: LearningContext;
  requirements: ContentRequirements;
  constraints: ContentConstraints;
  metadata: RequestMetadata;
}

export interface StudentContext {
  id: string;
  name: string;
  grade: Grade;
  age?: number;
  performanceLevel: 'struggling' | 'on-track' | 'advanced';
  recentPerformance?: PerformanceMetrics;
  preferences: StudentPreferences;
}

export interface PerformanceMetrics {
  averageScore: number; // 0-1
  completionRate: number; // 0-1
  averageTimePerQuestion: number; // seconds
  strugglingAreas: string[];
  strongAreas: string[];
}

export interface StudentPreferences {
  visualLearner: boolean;
  preferredQuestionTypes?: QuestionType[];
  avoidQuestionTypes?: QuestionType[];
  needsAudioSupport: boolean;
  requiresSimplifiedLanguage: boolean;
}

export interface LearningContext {
  subject: Subject;
  skill: SkillContext;
  career: CareerContext;
  companion: CompanionContext;
  sessionType: 'learn' | 'practice' | 'assessment' | 'review';
  containerType: 'discover' | 'learn' | 'experience' | 'three-journey';
}

export interface SkillContext {
  id: string;
  name: string;
  description: string;
  learningObjectives: string[];
  prerequisiteSkills?: string[];
  relatedSkills?: string[];
}

export interface CareerContext {
  id: string;
  name: string;
  description: string;
  relevantSkills: string[];
  realWorldApplications: string[];
}

export interface CompanionContext {
  name: 'Finn' | 'Spark' | 'Sage' | 'Harmony';
  personality: string;
  teachingStyle: string;
  encouragementStyle: string;
}

export interface ContentRequirements {
  questionCount: QuestionDistribution;
  difficulty: DifficultyDistribution;
  questionTypes: TypeRequirements;
  visualRequirements: VisualRequirements;
  timeAllocation: TimeAllocation;
}

export interface QuestionDistribution {
  practice?: number;
  assessment?: number;
  review?: number;
  total: number;
}

export interface DifficultyDistribution {
  easy: number; // percentage 0-100
  medium: number;
  hard: number;
  advanced: number;
}

export interface TypeRequirements {
  required: QuestionType[];
  preferred: QuestionType[];
  forbidden: QuestionType[];
  distribution?: Record<QuestionType, number>;
}

export interface VisualRequirements {
  required: boolean;
  minimumCount: number;
  preferredTypes: ('emoji' | 'image' | 'icon' | 'svg' | 'video')[];
}

export interface TimeAllocation {
  totalMinutes: number;
  perQuestion?: number;
  mode: 'demo' | 'testing' | 'standard' | 'full';
}

export interface ContentConstraints {
  maxWordCount?: number;
  readingLevel?: 'below-grade' | 'at-grade' | 'above-grade';
  culturalConsiderations?: string[];
  accessibilityRequirements?: string[];
  avoidTopics?: string[];
}

export interface RequestMetadata {
  priority: 'low' | 'normal' | 'high' | 'urgent';
  source: 'system' | 'teacher' | 'adaptive' | 'student-requested';
  reason: string;
  sessionId: string;
  previousRequestId?: string;
  retryCount?: number;
}

export interface ContentResponse {
  requestId: string;
  questions: Question[];
  generationTime: number; // milliseconds
  confidence: number; // 0-1
  fallbackUsed: boolean;
  errors?: string[];
  warnings?: string[];
}

// ============================================================================
// CONTENT REQUEST BUILDER
// ============================================================================

export class ContentRequestBuilder {
  private static instance: ContentRequestBuilder;

  private constructor() {}

  public static getInstance(): ContentRequestBuilder {
    if (!ContentRequestBuilder.instance) {
      ContentRequestBuilder.instance = new ContentRequestBuilder();
    }
    return ContentRequestBuilder.instance;
  }

  // ============================================================================
  // MAIN BUILDER METHODS
  // ============================================================================

  public buildRequest(
    skill: SkillContext,
    student: StudentContext,
    career: CareerContext,
    mode: TimeAllocation['mode'],
    sessionType: LearningContext['sessionType'] = 'learn'
  ): ContentRequest {
    const requestId = this.generateRequestId();
    
    // Build learning context
    const learningContext = this.buildLearningContext(
      skill,
      career,
      student,
      sessionType
    );

    // Build requirements based on mode and session type
    const requirements = this.buildRequirements(
      student,
      learningContext,
      mode,
      sessionType
    );

    // Build constraints based on student context
    const constraints = this.buildConstraints(student);

    // Build metadata
    const metadata = this.buildMetadata(sessionType);

    return {
      id: requestId,
      timestamp: new Date(),
      student,
      learning: learningContext,
      requirements,
      constraints,
      metadata
    };
  }

  public specifyRequirements(
    practice: number,
    assessment: number,
    review: number = 0
  ): ContentRequirements {
    const total = practice + assessment + review;
    
    // Calculate question type distribution
    const availableTypes = this.getAvailableTypes();
    const typeDistribution = this.calculateTypeDistribution(
      total,
      availableTypes
    );

    // Calculate difficulty distribution based on counts
    const difficultyDist = this.calculateDifficultyDistribution(
      practice,
      assessment,
      review
    );

    return {
      questionCount: {
        practice,
        assessment,
        review,
        total
      },
      difficulty: difficultyDist,
      questionTypes: {
        required: [],
        preferred: availableTypes,
        forbidden: [],
        distribution: typeDistribution
      },
      visualRequirements: {
        required: false,
        minimumCount: Math.ceil(total * 0.3), // 30% should have visuals
        preferredTypes: ['emoji', 'image', 'svg']
      },
      timeAllocation: {
        totalMinutes: this.estimateTotalTime(total),
        mode: 'standard'
      }
    };
  }

  // ============================================================================
  // BUILDER METHODS FOR SPECIFIC CONTEXTS
  // ============================================================================

  public buildPracticeRequest(
    skill: SkillContext,
    student: StudentContext,
    career: CareerContext,
    questionCount: number = 5
  ): ContentRequest {
    const request = this.buildRequest(
      skill,
      student,
      career,
      'standard',
      'practice'
    );

    // Adjust for practice
    request.requirements.questionCount = {
      practice: questionCount,
      assessment: 0,
      review: 0,
      total: questionCount
    };

    // Easier difficulty for practice
    request.requirements.difficulty = {
      easy: 40,
      medium: 40,
      hard: 20,
      advanced: 0
    };

    // Allow hints for practice
    request.metadata.reason = 'Practice session with scaffolding support';

    return request;
  }

  public buildAssessmentRequest(
    skill: SkillContext,
    student: StudentContext,
    career: CareerContext,
    questionCount: number = 10
  ): ContentRequest {
    const request = this.buildRequest(
      skill,
      student,
      career,
      'standard',
      'assessment'
    );

    // Adjust for assessment
    request.requirements.questionCount = {
      practice: 0,
      assessment: questionCount,
      review: 0,
      total: questionCount
    };

    // Balanced difficulty for assessment
    request.requirements.difficulty = {
      easy: 25,
      medium: 50,
      hard: 25,
      advanced: 0
    };

    // No hints for assessment
    request.metadata.reason = 'Formal assessment without assistance';

    return request;
  }

  public buildDemoRequest(
    skill: SkillContext,
    student: StudentContext,
    career: CareerContext
  ): ContentRequest {
    const request = this.buildRequest(
      skill,
      student,
      career,
      'demo',
      'learn'
    );

    // Demo mode: 2-3 questions max
    request.requirements.questionCount = {
      practice: 2,
      assessment: 1,
      review: 0,
      total: 3
    };

    // Easy difficulty for demo
    request.requirements.difficulty = {
      easy: 60,
      medium: 40,
      hard: 0,
      advanced: 0
    };

    // Require visuals for engagement
    request.requirements.visualRequirements.required = true;
    request.requirements.visualRequirements.minimumCount = 2;

    // Short time limit
    request.requirements.timeAllocation = {
      totalMinutes: 2,
      mode: 'demo'
    };

    request.metadata.priority = 'high';
    request.metadata.reason = 'Demo mode - quick engaging experience';

    return request;
  }

  public buildAdaptiveRequest(
    skill: SkillContext,
    student: StudentContext,
    career: CareerContext,
    performance: PerformanceMetrics
  ): ContentRequest {
    const request = this.buildRequest(
      skill,
      student,
      career,
      'standard',
      'learn'
    );

    // Adapt difficulty based on performance
    if (performance.averageScore < 0.5) {
      // Struggling - easier questions
      request.requirements.difficulty = {
        easy: 50,
        medium: 35,
        hard: 15,
        advanced: 0
      };
      request.requirements.questionCount.total = 4; // Fewer questions
    } else if (performance.averageScore > 0.8) {
      // Excelling - harder questions
      request.requirements.difficulty = {
        easy: 10,
        medium: 40,
        hard: 35,
        advanced: 15
      };
      request.requirements.questionCount.total = 8; // More questions
    }

    // Avoid types where student struggles
    if (performance.strugglingAreas.length > 0) {
      const strugglingTypes = this.mapAreasToTypes(performance.strugglingAreas);
      request.requirements.questionTypes.forbidden = strugglingTypes;
    }

    request.metadata.source = 'adaptive';
    request.metadata.reason = `Adaptive generation based on ${Math.round(performance.averageScore * 100)}% performance`;

    return request;
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  public validateRequest(request: ContentRequest): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate student context
    if (!request.student.id) {
      errors.push('Student ID is required');
    }

    if (!request.student.grade) {
      errors.push('Student grade is required');
    }

    // Validate learning context
    if (!request.learning.skill.id) {
      errors.push('Skill ID is required');
    }

    if (!request.learning.career.id) {
      errors.push('Career ID is required');
    }

    // Validate requirements
    const total = request.requirements.questionCount.total;
    const summed = (request.requirements.questionCount.practice || 0) +
                   (request.requirements.questionCount.assessment || 0) +
                   (request.requirements.questionCount.review || 0);

    if (summed !== total) {
      warnings.push(`Question counts don't sum to total: ${summed} != ${total}`);
    }

    // Validate difficulty distribution
    const diffSum = request.requirements.difficulty.easy +
                   request.requirements.difficulty.medium +
                   request.requirements.difficulty.hard +
                   request.requirements.difficulty.advanced;

    if (Math.abs(diffSum - 100) > 1) {
      errors.push(`Difficulty distribution must sum to 100%, got ${diffSum}%`);
    }

    // Validate question types for grade/subject
    const availableTypes = getAvailableTypesForGradeSubject(
      request.student.grade,
      request.learning.subject
    );

    request.requirements.questionTypes.required.forEach(type => {
      if (!availableTypes.includes(type)) {
        errors.push(`Question type ${type} not available for ${request.student.grade} ${request.learning.subject}`);
      }
    });

    // Validate time allocation
    if (request.requirements.timeAllocation.totalMinutes <= 0) {
      errors.push('Total time must be positive');
    }

    // Check mode-based constraints
    if (request.requirements.timeAllocation.mode === 'demo' && total > 5) {
      warnings.push('Demo mode should have 5 or fewer questions');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private generateRequestId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `req_${timestamp}_${random}`;
  }

  private buildLearningContext(
    skill: SkillContext,
    career: CareerContext,
    student: StudentContext,
    sessionType: LearningContext['sessionType']
  ): LearningContext {
    // Determine subject based on skill
    const subject = this.inferSubjectFromSkill(skill);
    
    // Select companion based on student preferences
    const companion = this.selectCompanion(student);

    // Determine container type based on session
    const containerType = this.mapSessionToContainer(sessionType);

    return {
      subject,
      skill,
      career,
      companion,
      sessionType,
      containerType
    };
  }

  private buildRequirements(
    student: StudentContext,
    learning: LearningContext,
    mode: TimeAllocation['mode'],
    sessionType: LearningContext['sessionType']
  ): ContentRequirements {
    // Get available question types
    const availableTypes = getAvailableTypesForGradeSubject(
      student.grade,
      learning.subject
    );

    // Calculate question counts based on mode
    const questionCount = this.calculateQuestionCount(mode, sessionType);

    // Calculate difficulty based on student performance
    const difficulty = this.calculateDifficulty(student, sessionType);

    // Determine visual requirements
    const visualReqs = this.determineVisualRequirements(student.grade);

    // Calculate time allocation
    const timeAllocation = this.calculateTimeAllocation(
      mode,
      questionCount.total
    );

    return {
      questionCount,
      difficulty,
      questionTypes: {
        required: this.getRequiredTypes(student.grade, learning.subject),
        preferred: availableTypes,
        forbidden: student.preferences?.avoidQuestionTypes || [],
        distribution: questionTypeRegistry.calculateDistribution(
          student.grade,
          learning.subject,
          questionCount.total,
          sessionType === 'practice' ? 'practice' : 'balanced'
        )
      },
      visualRequirements: visualReqs,
      timeAllocation
    };
  }

  private buildConstraints(student: StudentContext): ContentConstraints {
    const constraints: ContentConstraints = {};

    // Set reading level based on performance
    if (student.performanceLevel === 'struggling') {
      constraints.readingLevel = 'below-grade';
      constraints.maxWordCount = 50;
    } else if (student.performanceLevel === 'advanced') {
      constraints.readingLevel = 'above-grade';
    } else {
      constraints.readingLevel = 'at-grade';
    }

    // Add accessibility requirements
    if (student.preferences?.needsAudioSupport) {
      constraints.accessibilityRequirements = ['audio-support'];
    }

    if (student.preferences?.requiresSimplifiedLanguage) {
      constraints.accessibilityRequirements = [
        ...(constraints.accessibilityRequirements || []),
        'simplified-language'
      ];
    }

    return constraints;
  }

  private buildMetadata(sessionType: LearningContext['sessionType']): RequestMetadata {
    return {
      priority: sessionType === 'assessment' ? 'high' : 'normal',
      source: 'system',
      reason: `${sessionType} content generation`,
      sessionId: this.generateSessionId(),
      retryCount: 0
    };
  }

  private inferSubjectFromSkill(skill: SkillContext): Subject {
    // Simple inference based on skill name/description
    const skillLower = skill.name.toLowerCase();
    
    if (skillLower.includes('math') || skillLower.includes('number') || 
        skillLower.includes('count') || skillLower.includes('calculat')) {
      return 'Math';
    }
    
    if (skillLower.includes('read') || skillLower.includes('writ') || 
        skillLower.includes('grammar') || skillLower.includes('vocabulary')) {
      return 'ELA';
    }
    
    if (skillLower.includes('science') || skillLower.includes('experiment') || 
        skillLower.includes('nature') || skillLower.includes('biology')) {
      return 'Science';
    }
    
    if (skillLower.includes('history') || skillLower.includes('geography') || 
        skillLower.includes('social') || skillLower.includes('civic')) {
      return 'Social Studies';
    }

    // Default to Math if can't infer
    return 'Math';
  }

  private selectCompanion(student: StudentContext): CompanionContext {
    // Select based on student performance level
    if (student.performanceLevel === 'struggling') {
      return {
        name: 'Finn',
        personality: 'Patient and encouraging',
        teachingStyle: 'Step-by-step guidance',
        encouragementStyle: 'Celebrates small wins'
      };
    }
    
    if (student.performanceLevel === 'advanced') {
      return {
        name: 'Sage',
        personality: 'Wise and challenging',
        teachingStyle: 'Deep exploration',
        encouragementStyle: 'Intellectual curiosity'
      };
    }

    // Default companions for on-track students
    const companions: CompanionContext[] = [
      {
        name: 'Spark',
        personality: 'Energetic and fun',
        teachingStyle: 'Interactive and playful',
        encouragementStyle: 'High energy praise'
      },
      {
        name: 'Harmony',
        personality: 'Calm and supportive',
        teachingStyle: 'Balanced and rhythmic',
        encouragementStyle: 'Peaceful affirmation'
      }
    ];

    return companions[Math.floor(Math.random() * companions.length)];
  }

  private mapSessionToContainer(
    sessionType: LearningContext['sessionType']
  ): LearningContext['containerType'] {
    switch (sessionType) {
      case 'learn':
        return 'learn';
      case 'practice':
        return 'experience';
      case 'assessment':
        return 'three-journey';
      case 'review':
        return 'discover';
      default:
        return 'learn';
    }
  }

  private calculateQuestionCount(
    mode: TimeAllocation['mode'],
    sessionType: LearningContext['sessionType']
  ): QuestionDistribution {
    const counts: Record<TimeAllocation['mode'], QuestionDistribution> = {
      demo: {
        practice: sessionType === 'practice' ? 2 : 1,
        assessment: sessionType === 'assessment' ? 2 : 1,
        review: 0,
        total: 3
      },
      testing: {
        practice: sessionType === 'practice' ? 4 : 2,
        assessment: sessionType === 'assessment' ? 4 : 2,
        review: sessionType === 'review' ? 2 : 0,
        total: 6
      },
      standard: {
        practice: sessionType === 'practice' ? 8 : 4,
        assessment: sessionType === 'assessment' ? 8 : 3,
        review: sessionType === 'review' ? 5 : 2,
        total: 12
      },
      full: {
        practice: sessionType === 'practice' ? 12 : 6,
        assessment: sessionType === 'assessment' ? 12 : 5,
        review: sessionType === 'review' ? 8 : 3,
        total: 20
      }
    };

    return counts[mode];
  }

  private calculateDifficulty(
    student: StudentContext,
    sessionType: LearningContext['sessionType']
  ): DifficultyDistribution {
    // Base distribution
    let distribution = {
      easy: 25,
      medium: 50,
      hard: 25,
      advanced: 0
    };

    // Adjust based on performance level
    if (student.performanceLevel === 'struggling') {
      distribution = {
        easy: 50,
        medium: 35,
        hard: 15,
        advanced: 0
      };
    } else if (student.performanceLevel === 'advanced') {
      distribution = {
        easy: 10,
        medium: 40,
        hard: 35,
        advanced: 15
      };
    }

    // Adjust based on session type
    if (sessionType === 'practice') {
      // Easier for practice
      distribution.easy += 10;
      distribution.hard -= 10;
    } else if (sessionType === 'assessment') {
      // Balanced for assessment
      distribution = {
        easy: 25,
        medium: 50,
        hard: 25,
        advanced: 0
      };
    }

    return distribution;
  }

  private calculateDifficultyDistribution(
    practice: number,
    assessment: number,
    review: number
  ): DifficultyDistribution {
    const total = practice + assessment + review;
    
    if (total === 0) {
      return { easy: 25, medium: 50, hard: 25, advanced: 0 };
    }

    // Practice is easier
    const practiceWeight = practice / total;
    const assessmentWeight = assessment / total;
    const reviewWeight = review / total;

    return {
      easy: Math.round(40 * practiceWeight + 20 * assessmentWeight + 30 * reviewWeight),
      medium: Math.round(40 * practiceWeight + 50 * assessmentWeight + 50 * reviewWeight),
      hard: Math.round(20 * practiceWeight + 30 * assessmentWeight + 20 * reviewWeight),
      advanced: 0
    };
  }

  private determineVisualRequirements(grade: Grade): VisualRequirements {
    // Younger grades need more visuals
    const gradeIndex = ['PreK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].indexOf(grade);
    
    if (gradeIndex <= 2) { // PreK-1
      return {
        required: true,
        minimumCount: 3,
        preferredTypes: ['emoji', 'image']
      };
    } else if (gradeIndex <= 5) { // 2-4
      return {
        required: false,
        minimumCount: 2,
        preferredTypes: ['emoji', 'image', 'svg']
      };
    } else {
      return {
        required: false,
        minimumCount: 1,
        preferredTypes: ['svg', 'image', 'video']
      };
    }
  }

  private calculateTimeAllocation(
    mode: TimeAllocation['mode'],
    questionCount: number
  ): TimeAllocation {
    const timePerMode: Record<TimeAllocation['mode'], number> = {
      demo: 2,
      testing: 5,
      standard: 15,
      full: 20
    };

    return {
      totalMinutes: timePerMode[mode],
      perQuestion: Math.round((timePerMode[mode] * 60) / questionCount), // seconds
      mode
    };
  }

  private getRequiredTypes(grade: Grade, subject: Subject): QuestionType[] {
    // Certain types are essential for certain grade/subject combinations
    if (grade === 'PreK' || grade === 'K') {
      if (subject === 'Math') return ['counting'];
      return ['multiple_choice'];
    }

    if (subject === 'Math' && ['1', '2', '3'].includes(grade)) {
      return ['numeric', 'counting'];
    }

    if (subject === 'ELA' && ['3', '4', '5'].includes(grade)) {
      return ['fill_blank'];
    }

    return []; // No specific requirements
  }

  private calculateTypeDistribution(
    total: number,
    availableTypes: QuestionType[]
  ): Record<QuestionType, number> {
    const distribution: Record<QuestionType, number> = {} as any;
    
    if (availableTypes.length === 0) return distribution;

    const baseCount = Math.floor(total / availableTypes.length);
    const remainder = total % availableTypes.length;

    availableTypes.forEach((type, index) => {
      distribution[type] = baseCount + (index < remainder ? 1 : 0);
    });

    return distribution;
  }

  private getAvailableTypes(): QuestionType[] {
    return [
      'multiple_choice',
      'true_false',
      'counting',
      'numeric',
      'fill_blank',
      'matching',
      'ordering',
      'short_answer'
    ];
  }

  private estimateTotalTime(questionCount: number): number {
    // Average 45 seconds per question
    return Math.round((questionCount * 45) / 60); // minutes
  }

  private mapAreasToTypes(areas: string[]): QuestionType[] {
    const typeMap: Record<string, QuestionType> = {
      'counting': 'counting',
      'calculation': 'numeric',
      'vocabulary': 'fill_blank',
      'comprehension': 'short_answer',
      'matching': 'matching',
      'sequencing': 'ordering'
    };

    return areas
      .map(area => typeMap[area.toLowerCase()])
      .filter(type => type !== undefined);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================================================
  // BULK REQUEST METHODS
  // ============================================================================

  public buildMultiSubjectRequest(
    skills: SkillContext[],
    student: StudentContext,
    career: CareerContext,
    mode: TimeAllocation['mode']
  ): ContentRequest[] {
    return skills.map(skill => 
      this.buildRequest(skill, student, career, mode, 'learn')
    );
  }

  public buildDailyPlan(
    student: StudentContext,
    career: CareerContext,
    subjects: Subject[]
  ): ContentRequest[] {
    const requests: ContentRequest[] = [];
    const mode: TimeAllocation['mode'] = 'standard';

    subjects.forEach(subject => {
      // Morning: Learn
      requests.push(this.buildRequest(
        this.createSkillForSubject(subject, 'morning'),
        student,
        career,
        mode,
        'learn'
      ));

      // Afternoon: Practice
      requests.push(this.buildRequest(
        this.createSkillForSubject(subject, 'afternoon'),
        student,
        career,
        mode,
        'practice'
      ));

      // End of day: Assessment
      requests.push(this.buildRequest(
        this.createSkillForSubject(subject, 'evening'),
        student,
        career,
        mode,
        'assessment'
      ));
    });

    return requests;
  }

  private createSkillForSubject(subject: Subject, timeOfDay: string): SkillContext {
    return {
      id: `skill_${subject}_${timeOfDay}`,
      name: `${subject} Skills`,
      description: `Core ${subject} skills for ${timeOfDay} session`,
      learningObjectives: [
        `Master ${subject} concepts`,
        `Apply knowledge in practice`,
        `Demonstrate understanding`
      ]
    };
  }
}

// Export singleton instance and getter function
export const contentRequestBuilder = ContentRequestBuilder.getInstance();
export const getContentRequestBuilder = () => ContentRequestBuilder.getInstance();