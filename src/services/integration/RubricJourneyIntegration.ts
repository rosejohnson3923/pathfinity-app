/**
 * Rubric Journey Integration Service
 *
 * Connects the rubric-based architecture (Phases 1-6) with the existing learning journey UI.
 * Provides seamless integration for:
 * - Career/Companion selection → Enriched Master Narrative
 * - Container content generation → JIT Rubric-based content
 * - Session management → Cross-device progress tracking
 * - Adaptive content → Performance-based difficulty
 * - PDF generation → Rubric-aligned lesson plans
 *
 * Integration Layer between:
 * - Frontend: LearnMasterContainer, ExperienceContainer, DiscoverMasterContainer
 * - Backend: Rubric System (Phases 1-6)
 */

import { MasterNarrativeGenerator } from '../narrative/MasterNarrativeGenerator';
import { DataRubricTemplateService } from '../rubric/DataRubricTemplateService';
import { getRubricStorage } from '../storage/RubricStorageService';
import { getRubricBasedJITService } from '../content/RubricBasedJITService';
import { SessionStateService } from '../session/SessionStateService';
import { getAdaptiveContentService } from '../adaptive/AdaptiveContentService';
import type { MasterContainerData, SubjectCard, AssignmentCard } from '../../utils/JourneyCacheManager';
import type { MultiSubjectAssignment, Skill } from '../../types/LearningTypes';
import type { ContainerType, Subject } from '../../types/MasterNarrativeTypes';
import type { SkillReference } from '../../types/RubricTypes';

/**
 * Journey Initialization Parameters
 */
export interface JourneyInitParams {
  sessionId: string;
  userId: string;
  studentName: string;
  gradeLevel: string;
  companion: string; // 'Sage', 'Luna', 'Spark', etc.
  career: string; // 'Chef', 'Game Designer', etc.
  assignment: MultiSubjectAssignment;
}

/**
 * Journey State
 * Tracks current progress through the learning journey
 */
export interface JourneyState {
  sessionId: string;
  initialized: boolean;
  enrichedNarrativeGenerated: boolean;
  rubricsGenerated: boolean;
  currentContainer: ContainerType | null;
  currentSubject: Subject | null;
  completedContainers: Array<{ container: ContainerType; subject: Subject }>;
}

/**
 * Rubric Journey Integration Service
 * Main integration layer for rubric-based learning journey
 */
export class RubricJourneyIntegration {
  private static instance: RubricJourneyIntegration;

  private narrativeGenerator = new MasterNarrativeGenerator();
  private rubricTemplateService = new DataRubricTemplateService();
  private rubricStorage = getRubricStorage();
  private jitService = getRubricBasedJITService();
  private sessionService = SessionStateService.getInstance();
  private adaptiveService = getAdaptiveContentService();

  private journeyStates: Map<string, JourneyState> = new Map();

  private constructor() {}

  public static getInstance(): RubricJourneyIntegration {
    if (!RubricJourneyIntegration.instance) {
      RubricJourneyIntegration.instance = new RubricJourneyIntegration();
    }
    return RubricJourneyIntegration.instance;
  }

  // ========================================================================
  // JOURNEY INITIALIZATION (Step 1-4 from test plan)
  // ========================================================================

  /**
   * Initialize Rubric-Based Journey
   * Called after career/companion selection, before containers start
   *
   * Replaces traditional upfront content generation with rubric-based approach
   */
  async initializeJourney(params: JourneyInitParams): Promise<JourneyState> {
    try {
      // Step 1: Create session
      await this.sessionService.createSession(params.sessionId, params.userId);

      // Step 2: Generate Enriched Master Narrative

      // Extract career name if it's an object (handles both string and object)
      const careerName = typeof params.career === 'string'
        ? params.career
        : (params.career as any)?.name || (params.career as any)?.title || 'Unknown';

      // Extract unique subjects from assignment skills
      const subjects = params.assignment?.skills && params.assignment.skills.length > 0
        ? Array.from(new Set(params.assignment.skills.map(skill => skill.subject.toLowerCase())))
        : ['math', 'ela', 'science', 'socialStudies'];

      // Extract companion name if it's an object (handles both string and object)
      const companionName = typeof params.companion === 'string'
        ? params.companion
        : (params.companion as any)?.id || (params.companion as any)?.name || 'Finn';

      // Map companion name to personality
      const companionPersonalities: Record<string, string> = {
        'sage': 'Wise and thoughtful',
        'harmony': 'Balanced and supportive',
        'finn': 'Adventurous and brave',
        'spark': 'Energetic and enthusiastic'
      };
      const companionKey = companionName.toLowerCase();
      const companionPersonality = companionPersonalities[companionKey] || 'Wise and thoughtful';

      const enrichedNarrative = await this.narrativeGenerator.generateEnrichedMasterNarrative({
        studentName: params.studentName,
        gradeLevel: params.gradeLevel,
        career: careerName,
        companion: {
          name: companionName,
          personality: companionPersonality
        },
        subjects: subjects,
        sessionId: params.sessionId,
        userId: params.userId
      });

      // Step 3: Derive Story Rubric
      const storyRubric = this.narrativeGenerator.deriveStoryRubric(enrichedNarrative);

      // Step 4: Build skills map for all subjects
      const gradeCode = params.gradeLevel === 'Kindergarten' || params.gradeLevel === 'K' ? 'K' : params.gradeLevel;
      const skillsMap: Record<Subject, SkillReference> = this.buildSkillsMap(params.assignment, gradeCode);

      // Step 5: Generate 12 Data Rubrics with JIT prompts
      const dataRubrics = await this.rubricTemplateService.generateAllDataRubrics(
        enrichedNarrative,
        storyRubric,
        skillsMap
      );

      // Step 6: Save all rubrics to Azure Storage
      await this.rubricStorage.saveEnrichedNarrative(enrichedNarrative);
      await this.rubricStorage.saveStoryRubric(storyRubric);
      await this.rubricStorage.saveAllDataRubrics(dataRubrics);

      // Step 7: Initialize journey state
      const journeyState: JourneyState = {
        sessionId: params.sessionId,
        initialized: true,
        enrichedNarrativeGenerated: true,
        rubricsGenerated: true,
        currentContainer: null,
        currentSubject: null,
        completedContainers: []
      };

      this.journeyStates.set(params.sessionId, journeyState);

      return journeyState;

    } catch (error) {
      console.error(`❌ [Rubric Journey] Failed to initialize journey:`, error);
      throw error;
    }
  }

  // ========================================================================
  // CONTAINER CONTENT GENERATION (Steps 5, 7, 9 from test plan)
  // ========================================================================

  /**
   * Generate Learn Container Content
   * Uses JIT Rubrics instead of traditional content generation
   *
   * Returns MasterContainerData compatible with LearnMasterContainer.tsx
   */
  async generateLearnContainer(
    sessionId: string,
    assignment: MultiSubjectAssignment,
    studentName: string,
    gradeLevel: string
  ): Promise<MasterContainerData> {
    const subjectCards: SubjectCard[] = [];

    // Generate content for each subject
    const subjects: Subject[] = ['Math', 'ELA', 'Science', 'Social Studies'];

    for (const subject of subjects) {

      // Generate content from rubric
      const content = await this.jitService.generateContentFromRubric({
        sessionId,
        container: 'LEARN',
        subject,
        userId: sessionId,
        forceRegenerate: false
      });

      if (!content) {
        console.error(`❌ Failed to generate LEARN-${subject}`);
        continue;
      }

      // Transform rubric-based content to AssignmentCard format
      const assignmentCard = this.transformLearnContentToAssignment(
        content.content,
        subject,
        assignment
      );

      subjectCards.push({
        subject,
        assignments: [assignmentCard]
      });
    }

    const masterContainerData: MasterContainerData = {
      containerType: 'learn',
      subjectCards,
      metadata: {
        studentName,
        gradeLevel,
        totalAssignments: subjectCards.length,
        estimatedDuration: '45-60 minutes'
      }
    };

    return masterContainerData;
  }

  /**
   * Generate Experience Container Content
   * Uses JIT Rubrics for scenario-based learning
   */
  async generateExperienceContainer(
    sessionId: string,
    assignment: MultiSubjectAssignment,
    studentName: string,
    gradeLevel: string
  ): Promise<MasterContainerData> {

    const subjectCards: SubjectCard[] = [];
    const subjects: Subject[] = ['Math', 'ELA', 'Science', 'Social Studies'];

    for (const subject of subjects) {
      console.log(`\n   🎪 Generating EXPERIENCE-${subject}...`);

      const content = await this.jitService.generateContentFromRubric({
        sessionId,
        container: 'EXPERIENCE',
        subject,
        userId: sessionId,
        forceRegenerate: false
      });

      if (!content) {
        console.error(`❌ Failed to generate EXPERIENCE-${subject}`);
        continue;
      }

      const assignmentCard = this.transformExperienceContentToAssignment(
        content.content,
        subject,
        assignment
      );

      subjectCards.push({
        subject,
        assignments: [assignmentCard]
      });
    }

    const masterContainerData: MasterContainerData = {
      containerType: 'experience',
      subjectCards,
      metadata: {
        studentName,
        gradeLevel,
        totalAssignments: subjectCards.length,
        estimatedDuration: '60-75 minutes'
      }
    };

    return masterContainerData;
  }

  /**
   * Generate Discover Container Content
   * Uses JIT Rubrics for exploration challenges
   */
  async generateDiscoverContainer(
    sessionId: string,
    assignment: MultiSubjectAssignment,
    studentName: string,
    gradeLevel: string
  ): Promise<MasterContainerData> {
    const subjectCards: SubjectCard[] = [];
    const subjects: Subject[] = ['Math', 'ELA', 'Science', 'Social Studies'];

    for (const subject of subjects) {

      const content = await this.jitService.generateContentFromRubric({
        sessionId,
        container: 'DISCOVER',
        subject,
        userId: sessionId,
        forceRegenerate: false
      });

      if (!content) {
        console.error(`❌ Failed to generate DISCOVER-${subject}`);
        continue;
      }

      const assignmentCard = this.transformDiscoverContentToAssignment(
        content.content,
        subject,
        assignment
      );

      subjectCards.push({
        subject,
        assignments: [assignmentCard]
      });
    }

    const masterContainerData: MasterContainerData = {
      containerType: 'discover',
      subjectCards,
      metadata: {
        studentName,
        gradeLevel,
        totalAssignments: subjectCards.length,
        estimatedDuration: '75-90 minutes'
      }
    };

    return masterContainerData;
  }

  // ========================================================================
  // CONTAINER COMPLETION TRACKING (Steps 6, 8, 10 from test plan)
  // ========================================================================

  /**
   * Record Container Completion
   * Tracks progress and triggers adaptive content
   */
  async recordContainerCompletion(
    sessionId: string,
    container: ContainerType,
    subject: Subject,
    performanceData: {
      score: number;
      attempts: number;
      timeSpent: number;
      struggledQuestions?: string[];
    }
  ): Promise<void> {
    try {
      // Update session state
      await this.sessionService.completeContainer(
        sessionId,
        container,
        subject,
        performanceData.score,
        performanceData.attempts,
        performanceData.timeSpent
      );

      // Record in JIT service (triggers adaptive content for next container)
      await this.jitService.recordContainerCompletion(
        sessionId,
        container,
        subject,
        {
          score: performanceData.score,
          attempts: performanceData.attempts,
          timeSpent: performanceData.timeSpent,
          struggledQuestions: performanceData.struggledQuestions || []
        }
      );

      // Update journey state
      const journeyState = this.journeyStates.get(sessionId);
      if (journeyState) {
        journeyState.completedContainers.push({ container, subject });
        this.journeyStates.set(sessionId, journeyState);
      }

    } catch (error) {
      console.error(`❌ [Rubric Journey] Failed to record completion:`, error);
      throw error;
    }
  }

  // ========================================================================
  // CONTENT TRANSFORMATION HELPERS
  // ========================================================================

  /**
   * Transform LEARN rubric content to AssignmentCard format
   */
  private transformLearnContentToAssignment(
    content: any,
    subject: string,
    assignment: MultiSubjectAssignment
  ): AssignmentCard {
    // Find matching skill from assignment (handle both old and new format)
    let skill;

    if (assignment.subjects && Array.isArray(assignment.subjects)) {
      // New format: has subjects array
      skill = assignment.subjects.find(s => s.subject === subject)?.skill;
    } else if (assignment.skills && Array.isArray(assignment.skills)) {
      // Has skills array directly
      skill = assignment.skills.find(s => s.subject === subject);
    }

    // Fallback skill if not found
    if (!skill) {
      skill = {
        skill_number: 'A.1',
        skill_name: 'Foundational Skills',
        skill_description: `Core ${subject} concepts`,
        subject: subject as any,
        grade_level: assignment.grade_level || (assignment as any).gradeLevel || 'K'
      };
    }

    return {
      id: `learn-${subject.toLowerCase()}-${Date.now()}`,
      title: `Learn ${subject}`,
      skill,
      steps: {
        instruction: {
          type: 'video' as const,
          videoUrl: content.video?.url || null,
          fallbackMessage: content.fallbackMessage || 'Video instruction',
          duration: 300
        },
        practice: {
          questions: content.practice || [],
          type: 'interactive' as const
        },
        assessment: {
          questions: content.assessment || [],
          passingScore: 70
        }
      }
    };
  }

  /**
   * Transform EXPERIENCE rubric content to AssignmentCard format
   */
  private transformExperienceContentToAssignment(
    content: any,
    subject: string,
    assignment: MultiSubjectAssignment
  ): AssignmentCard {
    // Find matching skill from assignment (handle both old and new format)
    let skill;

    if (assignment.subjects && Array.isArray(assignment.subjects)) {
      // New format: has subjects array
      skill = assignment.subjects.find(s => s.subject === subject)?.skill;
    } else if (assignment.skills && Array.isArray(assignment.skills)) {
      // Has skills array directly
      skill = assignment.skills.find(s => s.subject === subject);
    }

    // Fallback skill if not found
    if (!skill) {
      skill = {
        skill_number: '5.NBT.1',
        skill_name: 'Sample skill',
        skill_description: 'Sample description',
        subject: subject as any,
        grade_level: assignment.grade_level || (assignment as any).gradeLevel || '5th Grade'
      };
    }

    return {
      id: `experience-${subject.toLowerCase()}-${Date.now()}`,
      title: `Experience ${subject}`,
      skill,
      steps: {
        instruction: {
          type: 'scenario' as const,
          description: content.scenarios?.context || 'Scenario-based learning',
          duration: 600
        },
        practice: {
          scenarios: content.scenarios?.practice || [],
          type: 'scenario-based' as const
        },
        assessment: {
          scenarios: content.scenarios?.assessment || [],
          passingScore: 70
        }
      }
    };
  }

  /**
   * Transform DISCOVER rubric content to AssignmentCard format
   */
  private transformDiscoverContentToAssignment(
    content: any,
    subject: string,
    assignment: MultiSubjectAssignment
  ): AssignmentCard {
    // Find matching skill from assignment (handle both old and new format)
    let skill;

    if (assignment.subjects && Array.isArray(assignment.subjects)) {
      // New format: has subjects array
      skill = assignment.subjects.find(s => s.subject === subject)?.skill;
    } else if (assignment.skills && Array.isArray(assignment.skills)) {
      // Has skills array directly
      skill = assignment.skills.find(s => s.subject === subject);
    }

    // Fallback skill if not found
    if (!skill) {
      skill = {
        skill_number: '5.NBT.1',
        skill_name: 'Sample skill',
        skill_description: 'Sample description',
        subject: subject as any,
        grade_level: assignment.grade_level || (assignment as any).gradeLevel || '5th Grade'
      };
    }

    return {
      id: `discover-${subject.toLowerCase()}-${Date.now()}`,
      title: `Discover ${subject}`,
      skill,
      steps: {
        instruction: {
          type: 'challenge' as const,
          description: content.unifiedScenario || 'Discovery challenge',
          duration: 900
        },
        practice: {
          stations: content.discoveryStations || [],
          type: 'exploration' as const
        },
        assessment: {
          finalChallenge: content.discoveryStations?.[3] || {},
          passingScore: 70
        }
      }
    };
  }

  // ========================================================================
  // PDF GENERATION INTEGRATION (Step 11 from test plan)
  // ========================================================================

  /**
   * Generate Lesson Plan PDF from Rubric Data
   * Ensures 100% match between learning journey and PDF
   */
  async generateLessonPlanPDF(sessionId: string): Promise<{
    pdfBlob: Blob;
    rubricData: any;
  }> {
    try {
      // Fetch all rubrics used in the journey
      const enrichedNarrative = await this.rubricStorage.getEnrichedNarrative(sessionId);
      const storyRubric = await this.rubricStorage.getStoryRubric(sessionId);
      const dataRubrics = await this.rubricStorage.getAllDataRubrics(sessionId);

      if (!enrichedNarrative || !storyRubric || dataRubrics.length === 0) {
        throw new Error('Rubric data not found for session');
      }

      // Build PDF data from rubrics
      const pdfData = {
        sessionId,
        narrative: enrichedNarrative,
        story: storyRubric,
        containers: {
          LEARN: dataRubrics.filter(r => r.container === 'LEARN'),
          EXPERIENCE: dataRubrics.filter(r => r.container === 'EXPERIENCE'),
          DISCOVER: dataRubrics.filter(r => r.container === 'DISCOVER')
        },
        performance: dataRubrics.filter(r => r.performance !== null)
      };

      // TODO: Integrate with UnifiedLessonPlanPDFGenerator
      // For now, return placeholder
      const pdfBlob = new Blob(['PDF placeholder'], { type: 'application/pdf' });

      return { pdfBlob, rubricData: pdfData };

    } catch (error) {
      console.error(`❌ [Rubric Journey] Failed to generate PDF:`, error);
      throw error;
    }
  }

  // ========================================================================
  // HELPER METHODS
  // ========================================================================

  /**
   * Get journey state
   */
  getJourneyState(sessionId: string): JourneyState | null {
    return this.journeyStates.get(sessionId) || null;
  }

  /**
   * Clear journey state (for testing)
   */
  clearJourneyState(sessionId: string): void {
    this.journeyStates.delete(sessionId);
  }

  /**
   * Build skills map from assignment or create default skills
   */
  private buildSkillsMap(assignment: MultiSubjectAssignment | undefined, gradeLevel: string): Record<Subject, SkillReference> {
    const subjects: Subject[] = ['Math', 'ELA', 'Science', 'Social Studies'];
    const skillsMap: Record<string, SkillReference> = {};

    // If assignment has skills, use them
    if (assignment?.skills && assignment.skills.length > 0) {
      for (const skill of assignment.skills) {
        const subject = this.normalizeSubject(skill.subject);
        if (subject && !skillsMap[subject]) {
          skillsMap[subject] = {
            id: `${gradeLevel}.${subject}.${skill.skill_number}`,
            name: skill.skill_name,
            subject: subject,
            skillNumber: skill.skill_number,
            description: skill.skill_name,
            gradeLevel: gradeLevel
          };
        }
      }
    }

    // Fill in missing subjects with default skills
    for (const subject of subjects) {
      if (!skillsMap[subject]) {
        skillsMap[subject] = this.createDefaultSkill(subject, gradeLevel);
      }
    }

    return skillsMap as Record<Subject, SkillReference>;
  }

  /**
   * Normalize subject name to match Subject type
   */
  private normalizeSubject(subject: string): Subject | null {
    const normalized = subject.toLowerCase();
    if (normalized === 'math') return 'Math';
    if (normalized === 'ela' || normalized === 'english') return 'ELA';
    if (normalized === 'science') return 'Science';
    if (normalized === 'social studies' || normalized === 'socialstudies') return 'Social Studies';
    return null;
  }

  /**
   * Create default skill for a subject
   */
  private createDefaultSkill(subject: Subject, gradeLevel: string): SkillReference {
    const defaultSkills: Record<Subject, { number: string; name: string; description: string }> = {
      'Math': {
        number: 'A.1',
        name: 'Foundational Math Skills',
        description: 'Core mathematical concepts and problem-solving'
      },
      'ELA': {
        number: 'A.1',
        name: 'Reading and Comprehension',
        description: 'Reading fluency and understanding texts'
      },
      'Science': {
        number: 'A.1',
        name: 'Scientific Inquiry',
        description: 'Observation, prediction, and investigation'
      },
      'Social Studies': {
        number: 'A.1',
        name: 'Community and Culture',
        description: 'Understanding people, places, and communities'
      }
    };

    const defaultSkill = defaultSkills[subject];
    return {
      id: `${gradeLevel}.${subject}.${defaultSkill.number}`,
      name: defaultSkill.name,
      subject: subject,
      skillNumber: defaultSkill.number,
      description: defaultSkill.description,
      gradeLevel: gradeLevel
    };
  }
}

// Export singleton instance getter
export const getRubricJourneyIntegration = () => RubricJourneyIntegration.getInstance();
