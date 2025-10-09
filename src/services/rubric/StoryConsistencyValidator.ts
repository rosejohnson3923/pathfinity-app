/**
 * Story Consistency Validator
 *
 * Validates rubric alignment and consistency:
 * - Inter-Rubric Alignment: Story Rubric ↔ Data Rubrics
 * - Intra-Rubric Consistency: Within each Data Rubric
 *
 * Ensures: Story told in Master Narrative = Story experienced in Containers = Story documented in Lesson Plan
 *
 * Phase 1.4 Implementation
 */

import type {
  StoryRubric,
  DataRubric,
  ValidationResult
} from '../../types/RubricTypes';
import type {
  EnrichedMasterNarrative,
  Subject,
  ContainerType
} from '../../types/MasterNarrativeTypes';

/**
 * Story Consistency Validator
 * Validates alignment between Master Narrative, Story Rubric, and Data Rubrics
 */
export class StoryConsistencyValidator {

  /**
   * Validate complete rubric system
   * Checks Master Narrative → Story Rubric → Data Rubrics alignment
   *
   * @param enrichedNarrative - The enriched master narrative
   * @param storyRubric - The story rubric
   * @param dataRubrics - All data rubrics for the session
   * @returns Validation result with errors and warnings
   */
  validateRubricSystem(
    enrichedNarrative: EnrichedMasterNarrative,
    storyRubric: StoryRubric,
    dataRubrics: DataRubric[]
  ): ValidationResult {
    console.log('🔍 Validating rubric system consistency...');

    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validate Master Narrative → Story Rubric alignment
    const masterToStoryResult = this.validateMasterToStoryAlignment(enrichedNarrative, storyRubric);
    errors.push(...masterToStoryResult.errors);
    warnings.push(...masterToStoryResult.warnings);

    // 2. Validate Story Rubric → Data Rubrics alignment (inter-rubric)
    const storyToDataResult = this.validateStoryToDataAlignment(storyRubric, dataRubrics);
    errors.push(...storyToDataResult.errors);
    warnings.push(...storyToDataResult.warnings);

    // 3. Validate each Data Rubric internally (intra-rubric)
    for (const dataRubric of dataRubrics) {
      const intraResult = this.validateIntraRubricConsistency(dataRubric);
      errors.push(...intraResult.errors);
      warnings.push(...intraResult.warnings);
    }

    // 4. Validate completeness (all container/subject combinations present)
    const completenessResult = this.validateCompleteness(dataRubrics);
    errors.push(...completenessResult.errors);
    warnings.push(...completenessResult.warnings);

    const isValid = errors.length === 0;

    console.log(isValid
      ? '✅ Rubric system validation passed'
      : `❌ Rubric system validation failed with ${errors.length} errors`
    );

    return {
      isValid,
      errors,
      warnings
    };
  }

  /**
   * Validate Master Narrative → Story Rubric alignment
   * Ensures story context is correctly extracted
   */
  private validateMasterToStoryAlignment(
    enrichedNarrative: EnrichedMasterNarrative,
    storyRubric: StoryRubric
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check session ID matches
    if (enrichedNarrative.sessionId !== storyRubric.sessionId) {
      errors.push(`Session ID mismatch: Master Narrative (${enrichedNarrative.sessionId}) vs Story Rubric (${storyRubric.sessionId})`);
    }

    // Check narrative arc is present
    if (!storyRubric.storyContext.narrativeArc) {
      errors.push('Story Rubric missing narrativeArc');
    } else {
      // Verify narrative arc components
      const arc = storyRubric.storyContext.narrativeArc;
      if (!arc.premise) errors.push('Narrative arc missing premise');
      if (!arc.mission) errors.push('Narrative arc missing mission');
      if (!arc.stakes) errors.push('Narrative arc missing stakes');
      if (!arc.resolution) errors.push('Narrative arc missing resolution');
    }

    // Check companion voice is present
    if (!storyRubric.storyContext.companionVoice) {
      errors.push('Story Rubric missing companionVoice');
    } else {
      const voice = storyRubric.storyContext.companionVoice;
      if (!voice.greetingStyle) warnings.push('Companion voice missing greetingStyle');
      if (!voice.teachingVoice) warnings.push('Companion voice missing teachingVoice');
      if (!voice.encouragementStyle) warnings.push('Companion voice missing encouragementStyle');
    }

    // Check career narrative is present
    if (!storyRubric.storyContext.careerNarrative) {
      errors.push('Story Rubric missing careerNarrative');
    } else {
      const career = storyRubric.storyContext.careerNarrative;
      if (!career.workplaceSettings.LEARN) errors.push('Career narrative missing LEARN workplace setting');
      if (!career.workplaceSettings.EXPERIENCE) errors.push('Career narrative missing EXPERIENCE workplace setting');
      if (!career.workplaceSettings.DISCOVER) errors.push('Career narrative missing DISCOVER workplace setting');
    }

    // Check all subject narratives are present
    const subjects: Subject[] = ['Math', 'ELA', 'Science', 'Social Studies'];
    for (const subject of subjects) {
      if (!storyRubric.storyContext.subjectNarratives[subject]) {
        errors.push(`Story Rubric missing narrative for ${subject}`);
      }
    }

    // Check container transitions are present
    if (!storyRubric.storyContext.containerTransitions) {
      errors.push('Story Rubric missing containerTransitions');
    } else {
      const transitions = storyRubric.storyContext.containerTransitions;
      if (!transitions.toLEARN) errors.push('Missing transition to LEARN');
      if (!transitions.toEXPERIENCE) errors.push('Missing transition to EXPERIENCE');
      if (!transitions.toDISCOVER) errors.push('Missing transition to DISCOVER');
      if (!transitions.conclusion) errors.push('Missing conclusion transition');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate Story Rubric → Data Rubrics alignment (Inter-Rubric)
   * Ensures story context flows from Story Rubric to Data Rubrics
   */
  private validateStoryToDataAlignment(
    storyRubric: StoryRubric,
    dataRubrics: DataRubric[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const dataRubric of dataRubrics) {
      const rubricId = `${dataRubric.container}-${dataRubric.subject}`;

      // Check session ID matches
      if (dataRubric.sessionId !== storyRubric.sessionId) {
        errors.push(`${rubricId}: Session ID mismatch with Story Rubric`);
      }

      // Validate story context is populated
      if (!dataRubric.storyContext) {
        errors.push(`${rubricId}: Missing storyContext`);
        continue;
      }

      const { storyContext } = dataRubric;

      // Check narrative setup is present
      if (!storyContext.narrativeSetup) {
        errors.push(`${rubricId}: Missing narrativeSetup in storyContext`);
      }

      // Check career context is present
      if (!storyContext.careerContext) {
        errors.push(`${rubricId}: Missing careerContext in storyContext`);
      }

      // Check workplace setting is present
      if (!storyContext.workplaceSetting) {
        errors.push(`${rubricId}: Missing workplaceSetting in storyContext`);
      } else {
        // Verify workplace setting matches container
        const expectedSetting = storyRubric.storyContext.careerNarrative.workplaceSettings[dataRubric.container];
        if (storyContext.workplaceSetting !== expectedSetting) {
          warnings.push(`${rubricId}: Workplace setting doesn't match Story Rubric (expected: ${expectedSetting}, got: ${storyContext.workplaceSetting})`);
        }
      }

      // Check companion voice is present
      if (!storyContext.companionVoice) {
        errors.push(`${rubricId}: Missing companionVoice in storyContext`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate Intra-Rubric Consistency
   * Ensures internal consistency within each Data Rubric
   */
  private validateIntraRubricConsistency(
    dataRubric: DataRubric
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const rubricId = `${dataRubric.container}-${dataRubric.subject}`;

    // Validate skill reference
    if (!dataRubric.skill) {
      errors.push(`${rubricId}: Missing skill reference`);
    } else {
      if (!dataRubric.skill.id) errors.push(`${rubricId}: Skill missing id`);
      if (!dataRubric.skill.name) errors.push(`${rubricId}: Skill missing name`);
      if (!dataRubric.skill.description) warnings.push(`${rubricId}: Skill missing description`);
      if (!dataRubric.skill.gradeLevel) errors.push(`${rubricId}: Skill missing gradeLevel`);
    }

    // Validate data requirements match container type
    if (!dataRubric.dataRequirements) {
      errors.push(`${rubricId}: Missing dataRequirements`);
    } else {
      if (dataRubric.dataRequirements.containerType !== dataRubric.container) {
        errors.push(`${rubricId}: Data requirements containerType (${dataRubric.dataRequirements.containerType}) doesn't match rubric container (${dataRubric.container})`);
      }
    }

    // Validate JIT prompt
    if (!dataRubric.jitPrompt) {
      errors.push(`${rubricId}: Missing jitPrompt`);
    } else {
      if (!dataRubric.jitPrompt.systemPrompt) errors.push(`${rubricId}: JIT prompt missing systemPrompt`);
      if (!dataRubric.jitPrompt.userPrompt) errors.push(`${rubricId}: JIT prompt missing userPrompt`);
      if (!dataRubric.jitPrompt.variables) warnings.push(`${rubricId}: JIT prompt missing variables`);

      // Check prompt references skill
      const promptText = `${dataRubric.jitPrompt.systemPrompt} ${dataRubric.jitPrompt.userPrompt}`.toLowerCase();
      if (dataRubric.skill && !promptText.includes(dataRubric.skill.name.toLowerCase())) {
        warnings.push(`${rubricId}: JIT prompt doesn't mention skill name "${dataRubric.skill.name}"`);
      }
    }

    // Validate adaptation data for EXPERIENCE and DISCOVER
    if (dataRubric.container === 'EXPERIENCE' || dataRubric.container === 'DISCOVER') {
      if (!dataRubric.adaptationData) {
        warnings.push(`${rubricId}: ${dataRubric.container} container should have adaptationData structure (can be null initially)`);
      }
    }

    // Validate initial state (generatedContent should be null)
    if (dataRubric.generatedContent !== null) {
      warnings.push(`${rubricId}: generatedContent should be null initially (will be populated by JIT)`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate Completeness
   * Ensures all required container/subject combinations are present
   */
  private validateCompleteness(
    dataRubrics: DataRubric[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const containers: ContainerType[] = ['LEARN', 'EXPERIENCE', 'DISCOVER'];
    const subjects: Subject[] = ['Math', 'ELA', 'Science', 'Social Studies'];

    // Check we have exactly 12 rubrics (3 containers × 4 subjects)
    const expectedCount = containers.length * subjects.length;
    if (dataRubrics.length !== expectedCount) {
      errors.push(`Expected ${expectedCount} Data Rubrics, found ${dataRubrics.length}`);
    }

    // Check each container/subject combination exists
    for (const container of containers) {
      for (const subject of subjects) {
        const rubric = dataRubrics.find(
          r => r.container === container && r.subject === subject
        );

        if (!rubric) {
          errors.push(`Missing Data Rubric for ${container}-${subject}`);
        }
      }
    }

    // Check for duplicates
    const seen = new Set<string>();
    for (const rubric of dataRubrics) {
      const key = `${rubric.container}-${rubric.subject}`;
      if (seen.has(key)) {
        errors.push(`Duplicate Data Rubric for ${key}`);
      }
      seen.add(key);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate Generated Content
   * Validates content after JIT generation (called post-generation)
   *
   * @param dataRubric - Data rubric with generated content
   * @returns Validation result
   */
  validateGeneratedContent(
    dataRubric: DataRubric
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const rubricId = `${dataRubric.container}-${dataRubric.subject}`;

    if (!dataRubric.generatedContent) {
      errors.push(`${rubricId}: No generated content to validate`);
      return { isValid: false, errors, warnings };
    }

    // Container-specific validation
    switch (dataRubric.container) {
      case 'LEARN':
        return this.validateLEARNContent(dataRubric, errors, warnings);
      case 'EXPERIENCE':
        return this.validateEXPERIENCEContent(dataRubric, errors, warnings);
      case 'DISCOVER':
        return this.validateDISCOVERContent(dataRubric, errors, warnings);
      default:
        errors.push(`${rubricId}: Unknown container type`);
        return { isValid: false, errors, warnings };
    }
  }

  /**
   * Validate LEARN container generated content
   */
  private validateLEARNContent(
    dataRubric: DataRubric,
    errors: string[],
    warnings: string[]
  ): ValidationResult {
    const rubricId = `${dataRubric.container}-${dataRubric.subject}`;
    const content = dataRubric.generatedContent;

    // Check video exists
    if (!content.video) {
      warnings.push(`${rubricId}: No video generated (fallback message should be present)`);
    }

    // Check practice questions
    if (!content.practice || !Array.isArray(content.practice)) {
      errors.push(`${rubricId}: Practice questions missing or not an array`);
    } else if (content.practice.length !== 3) {
      errors.push(`${rubricId}: Expected 3 practice questions, got ${content.practice.length}`);
    }

    // Check assessment question
    if (!content.assessment || !Array.isArray(content.assessment)) {
      errors.push(`${rubricId}: Assessment question missing or not an array`);
    } else if (content.assessment.length !== 1) {
      errors.push(`${rubricId}: Expected 1 assessment question, got ${content.assessment.length}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate EXPERIENCE container generated content
   */
  private validateEXPERIENCEContent(
    dataRubric: DataRubric,
    errors: string[],
    warnings: string[]
  ): ValidationResult {
    const rubricId = `${dataRubric.container}-${dataRubric.subject}`;
    const content = dataRubric.generatedContent;

    // Check example scenarios
    if (!content.scenarios?.examples || !Array.isArray(content.scenarios.examples)) {
      errors.push(`${rubricId}: Example scenarios missing`);
    } else if (content.scenarios.examples.length !== 3) {
      errors.push(`${rubricId}: Expected 3 example scenarios, got ${content.scenarios.examples.length}`);
    }

    // Check practice scenarios
    if (!content.scenarios?.practice || !Array.isArray(content.scenarios.practice)) {
      errors.push(`${rubricId}: Practice scenarios missing`);
    } else if (content.scenarios.practice.length !== 2) {
      errors.push(`${rubricId}: Expected 2 practice scenarios, got ${content.scenarios.practice.length}`);
    }

    // Check assessment scenario
    if (!content.scenarios?.assessment || !Array.isArray(content.scenarios.assessment)) {
      errors.push(`${rubricId}: Assessment scenario missing`);
    } else if (content.scenarios.assessment.length !== 1) {
      errors.push(`${rubricId}: Expected 1 assessment scenario, got ${content.scenarios.assessment.length}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate DISCOVER container generated content
   */
  private validateDISCOVERContent(
    dataRubric: DataRubric,
    errors: string[],
    warnings: string[]
  ): ValidationResult {
    const rubricId = `${dataRubric.container}-${dataRubric.subject}`;
    const content = dataRubric.generatedContent;

    // Check unified scenario
    if (!content.unifiedScenario) {
      errors.push(`${rubricId}: Unified scenario missing`);
    }

    // Check discovery stations
    if (!content.discoveryStations || !Array.isArray(content.discoveryStations)) {
      errors.push(`${rubricId}: Discovery stations missing`);
    } else if (content.discoveryStations.length !== 4) {
      errors.push(`${rubricId}: Expected 4 discovery stations, got ${content.discoveryStations.length}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Export singleton instance
export const storyConsistencyValidator = new StoryConsistencyValidator();
