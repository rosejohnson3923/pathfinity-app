/**
 * DailyLearningContextManager
 * 
 * Manages the daily learning context to ensure career and skill consistency
 * across all subjects and containers throughout the day.
 * 
 * CRITICAL: Career + Skill MUST be consistent across ALL subjects and containers
 */

import { Skill, Career, Subject, StudentProfile, Grade } from '../../types';

/**
 * Immutable daily learning context
 * This context is created once at the start of the day and remains constant
 */
export interface DailyLearningContext {
  readonly studentId: string;
  readonly date: string;
  readonly primarySkill: Skill;
  readonly career: Career;
  readonly companion: {
    id: string;
    name: string;
    personality: string;
  };
  readonly subjects: Subject[];
  readonly grade: Grade;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly sessionId: string;
}

/**
 * Container-specific context derived from daily context
 */
export interface ContainerContext {
  dailyContext: DailyLearningContext;
  containerId: string;
  containerType: 'learn' | 'experience' | 'discover';
  subject: Subject;
  skillAdaptation: string;
  careerScenario: string;
  timeAllocation: number; // minutes
}

/**
 * Subject-adapted skill with career context
 */
export interface SubjectAdaptedSkill {
  originalSkill: Skill;
  subject: Subject;
  adaptedDescription: string;
  learningObjectives: string[];
  careerConnection: string;
  practiceContext: string;
  assessmentFocus: string;
}

/**
 * Singleton manager for daily learning context
 */
export class DailyLearningContextManager {
  private static instance: DailyLearningContextManager;
  private currentContext: DailyLearningContext | null = null;
  private readonly STORAGE_KEY = 'pathfinity_daily_context';
  private readonly CONTEXT_EXPIRY_HOURS = 12; // Context expires after 12 hours

  private constructor() {
    // Restore context on initialization
    this.restoreContext();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DailyLearningContextManager {
    if (!DailyLearningContextManager.instance) {
      DailyLearningContextManager.instance = new DailyLearningContextManager();
    }
    return DailyLearningContextManager.instance;
  }

  /**
   * Create a new daily learning context
   */
  public createDailyContext(student: StudentProfile): DailyLearningContext {
    // Generate session ID
    const sessionId = this.generateSessionId(student.id);
    
    // Create immutable context
    const context: DailyLearningContext = Object.freeze({
      studentId: student.id,
      date: new Date().toISOString().split('T')[0],
      primarySkill: student.currentSkill || this.selectDailySkill(student),
      career: student.selectedCareer || this.selectDailyCareer(student),
      companion: {
        id: student.companion?.id || 'finn',
        name: student.companion?.name || 'Finn',
        personality: student.companion?.personality || 'encouraging'
      },
      subjects: student.enrolledSubjects || ['Math', 'ELA', 'Science', 'Social Studies'],
      grade: student.grade,
      startTime: new Date(),
      sessionId
    });

    // Store context
    this.currentContext = context;
    this.persistContext();

    console.log('[DailyLearningContext] Created:', {
      skill: context.primarySkill.name,
      career: context.career.title,
      companion: context.companion.name,
      subjects: context.subjects
    });

    return context;
  }

  /**
   * Get current context or restore from storage
   */
  public getCurrentContext(): DailyLearningContext | null {
    if (!this.currentContext) {
      this.restoreContext();
    }

    // Validate context hasn't expired
    if (this.currentContext && this.isContextExpired(this.currentContext)) {
      console.log('[DailyLearningContext] Context expired, clearing');
      this.clearContext();
      return null;
    }

    return this.currentContext;
  }

  /**
   * Validate that content maintains context consistency
   */
  public validateContextConsistency(content: any): boolean {
    if (!this.currentContext) {
      console.warn('[DailyLearningContext] No context to validate against');
      return false;
    }

    const validations = {
      hasCareerReference: this.validateCareerReference(content),
      hasSkillFocus: this.validateSkillFocus(content),
      hasCompanionVoice: this.validateCompanionVoice(content),
      isGradeAppropriate: this.validateGradeAppropriateness(content)
    };

    const isConsistent = Object.values(validations).every(v => v);

    if (!isConsistent) {
      console.warn('[DailyLearningContext] Consistency validation failed:', validations);
    }

    return isConsistent;
  }

  /**
   * Adapt skill to specific subject while maintaining career context
   */
  public adaptSkillToSubject(subject: Subject): SubjectAdaptedSkill {
    if (!this.currentContext) {
      throw new Error('No daily context available for skill adaptation');
    }

    const { primarySkill, career } = this.currentContext;

    // Generate subject-specific adaptation
    const adaptation = this.generateSkillAdaptation(primarySkill, subject, career);

    console.log('[DailyLearningContext] Skill adapted for', subject, ':', adaptation.adaptedDescription);

    return adaptation;
  }

  /**
   * Get context for specific container
   */
  public getContextForContainer(
    containerId: string,
    containerType: 'learn' | 'experience' | 'discover',
    subject: Subject
  ): ContainerContext {
    const dailyContext = this.getCurrentContext();
    if (!dailyContext) {
      throw new Error('No daily context available for container');
    }

    const skillAdaptation = this.adaptSkillToSubject(subject);
    
    return {
      dailyContext,
      containerId,
      containerType,
      subject,
      skillAdaptation: skillAdaptation.adaptedDescription,
      careerScenario: this.generateCareerScenario(dailyContext.career, subject, containerType),
      timeAllocation: this.calculateTimeAllocation(containerType, subject)
    };
  }

  /**
   * Persist context to storage
   */
  private persistContext(): void {
    if (!this.currentContext) return;

    try {
      const serialized = JSON.stringify({
        context: this.currentContext,
        timestamp: Date.now()
      });
      
      sessionStorage.setItem(this.STORAGE_KEY, serialized);
      
      // Also store in localStorage for longer persistence
      localStorage.setItem(this.STORAGE_KEY, serialized);
      
      console.log('[DailyLearningContext] Context persisted');
    } catch (error) {
      console.error('[DailyLearningContext] Failed to persist context:', error);
    }
  }

  /**
   * Restore context from storage
   */
  private restoreContext(): DailyLearningContext | null {
    try {
      // Try sessionStorage first, then localStorage
      const serialized = sessionStorage.getItem(this.STORAGE_KEY) || 
                        localStorage.getItem(this.STORAGE_KEY);
      
      if (!serialized) return null;

      const { context, timestamp } = JSON.parse(serialized);
      
      // Check if context is from today
      const contextDate = new Date(context.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (contextDate.toDateString() !== today.toDateString()) {
        console.log('[DailyLearningContext] Context from different day, clearing');
        this.clearContext();
        return null;
      }

      // Restore immutable context
      this.currentContext = Object.freeze(context);
      
      console.log('[DailyLearningContext] Context restored:', {
        skill: context.primarySkill.name,
        career: context.career.title
      });

      return this.currentContext;
    } catch (error) {
      console.error('[DailyLearningContext] Failed to restore context:', error);
      return null;
    }
  }

  /**
   * Clear stored context
   */
  public clearContext(): void {
    this.currentContext = null;
    sessionStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('[DailyLearningContext] Context cleared');
  }

  /**
   * Check if context has expired
   */
  private isContextExpired(context: DailyLearningContext): boolean {
    const startTime = new Date(context.startTime);
    const now = new Date();
    const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    
    return hoursElapsed > this.CONTEXT_EXPIRY_HOURS;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(studentId: string): string {
    const date = new Date().toISOString().split('T')[0];
    const random = Math.random().toString(36).substr(2, 9);
    return `${studentId}-${date}-${random}`;
  }

  /**
   * Select daily skill if not provided
   */
  private selectDailySkill(student: StudentProfile): Skill {
    // Implementation would select from student's skill progression
    return {
      id: 'problem-solving',
      name: 'Problem Solving',
      description: 'Breaking down complex problems into manageable steps',
      category: 'cognitive',
      level: 1
    };
  }

  /**
   * Select daily career if not provided
   */
  private selectDailyCareer(student: StudentProfile): Career {
    // Implementation would select from student's career interests
    return {
      id: 'game-developer',
      title: 'Game Developer',
      description: 'Create engaging video games and interactive experiences',
      skills: ['problem-solving', 'creativity', 'programming'],
      education: 'Computer Science degree or bootcamp',
      salary: '$70,000 - $120,000'
    };
  }

  /**
   * Generate skill adaptation for subject
   */
  private generateSkillAdaptation(
    skill: Skill,
    subject: Subject,
    career: Career
  ): SubjectAdaptedSkill {
    // Subject-specific adaptation mappings
    const adaptations: Record<Subject, () => SubjectAdaptedSkill> = {
      'Math': () => ({
        originalSkill: skill,
        subject,
        adaptedDescription: `Use ${skill.name} to solve mathematical challenges in ${career.title} work`,
        learningObjectives: [
          `Apply ${skill.name} to numerical problems`,
          `Connect math concepts to ${career.title} applications`,
          `Develop computational thinking for ${career.title}`
        ],
        careerConnection: `${career.title}s use math for game physics, scoring systems, and algorithm optimization`,
        practiceContext: `Practice ${skill.name} through game-related math problems`,
        assessmentFocus: `Demonstrate ${skill.name} in mathematical contexts relevant to ${career.title}`
      }),

      'ELA': () => ({
        originalSkill: skill,
        subject,
        adaptedDescription: `Apply ${skill.name} to communication and documentation in ${career.title}`,
        learningObjectives: [
          `Use ${skill.name} in written communication`,
          `Create clear documentation using ${skill.name}`,
          `Tell stories that demonstrate ${skill.name}`
        ],
        careerConnection: `${career.title}s write game narratives, documentation, and user guides`,
        practiceContext: `Practice ${skill.name} through game story writing and documentation`,
        assessmentFocus: `Show ${skill.name} through clear written communication about games`
      }),

      'Science': () => ({
        originalSkill: skill,
        subject,
        adaptedDescription: `Apply ${skill.name} to scientific concepts in ${career.title} projects`,
        learningObjectives: [
          `Use ${skill.name} in scientific inquiry`,
          `Apply physics concepts to ${career.title} work`,
          `Optimize performance using ${skill.name}`
        ],
        careerConnection: `${career.title}s use science for game physics, graphics, and optimization`,
        practiceContext: `Explore ${skill.name} through game physics and mechanics`,
        assessmentFocus: `Demonstrate ${skill.name} in scientific problem-solving for games`
      }),

      'Social Studies': () => ({
        originalSkill: skill,
        subject,
        adaptedDescription: `Use ${skill.name} to understand social impact of ${career.title} work`,
        learningObjectives: [
          `Apply ${skill.name} to social challenges`,
          `Understand cultural context in ${career.title}`,
          `Create inclusive experiences using ${skill.name}`
        ],
        careerConnection: `${career.title}s create games that reflect diverse cultures and solve social problems`,
        practiceContext: `Practice ${skill.name} through game design for social good`,
        assessmentFocus: `Show ${skill.name} in creating culturally aware game concepts`
      })
    };

    return adaptations[subject] ? adaptations[subject]() : this.getDefaultAdaptation(skill, subject, career);
  }

  /**
   * Get default adaptation if subject not mapped
   */
  private getDefaultAdaptation(skill: Skill, subject: Subject, career: Career): SubjectAdaptedSkill {
    return {
      originalSkill: skill,
      subject,
      adaptedDescription: `Apply ${skill.name} in ${subject} related to ${career.title}`,
      learningObjectives: [`Use ${skill.name} in ${subject} contexts`],
      careerConnection: `${career.title}s use ${subject} skills daily`,
      practiceContext: `Practice ${skill.name} in ${subject}`,
      assessmentFocus: `Demonstrate ${skill.name} mastery`
    };
  }

  /**
   * Generate career scenario for container
   */
  private generateCareerScenario(
    career: Career,
    subject: Subject,
    containerType: 'learn' | 'experience' | 'discover'
  ): string {
    const scenarios = {
      learn: `Learn how ${career.title}s use ${subject} skills in their daily work`,
      experience: `Experience a day in the life of a ${career.title} using ${subject}`,
      discover: `Discover new ways ${career.title}s apply ${subject} concepts`
    };

    return scenarios[containerType];
  }

  /**
   * Calculate time allocation for container
   */
  private calculateTimeAllocation(
    containerType: 'learn' | 'experience' | 'discover',
    subject: Subject
  ): number {
    // Default allocations (can be customized)
    const allocations = {
      learn: 15,
      experience: 10,
      discover: 5
    };

    return allocations[containerType];
  }

  /**
   * Validate career reference in content
   */
  private validateCareerReference(content: any): boolean {
    if (!this.currentContext) return false;
    
    const careerTerms = [
      this.currentContext.career.title.toLowerCase(),
      ...this.currentContext.career.skills
    ];

    const contentStr = JSON.stringify(content).toLowerCase();
    return careerTerms.some(term => contentStr.includes(term));
  }

  /**
   * Validate skill focus in content
   */
  private validateSkillFocus(content: any): boolean {
    if (!this.currentContext) return false;
    
    const skillTerms = [
      this.currentContext.primarySkill.name.toLowerCase(),
      this.currentContext.primarySkill.description.toLowerCase()
    ];

    const contentStr = JSON.stringify(content).toLowerCase();
    return skillTerms.some(term => contentStr.includes(term));
  }

  /**
   * Validate companion voice in content
   */
  private validateCompanionVoice(content: any): boolean {
    // Check if content maintains companion personality
    return true; // Simplified for now
  }

  /**
   * Validate grade appropriateness
   */
  private validateGradeAppropriateness(content: any): boolean {
    // Check if content matches grade level
    return true; // Simplified for now
  }
}

// Export singleton instance getter
export const getDailyLearningContext = () => DailyLearningContextManager.getInstance();