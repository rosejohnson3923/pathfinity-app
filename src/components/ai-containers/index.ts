/**
 * AI-FIRST CONTAINERS INDEX
 * Exports all AI-first container components built from scratch
 */

export { default as AILearnContainer } from './AILearnContainer';
// export { default as AIExperienceContainer } from './AIExperienceContainer'; // OBSOLETE - use AIExperienceContainerV2-UNIFIED
export { AIExperienceContainerV2UNIFIED as AIExperienceContainer } from './AIExperienceContainerV2-UNIFIED';
export { default as AIDiscoverContainer } from './AIDiscoverContainer';

// Re-export types from the service
export type {
  StudentProfile,
  LearningSkill,
  AILearnContent,
  AIExperienceContentLegacy,
  AIDiscoverContent
} from '../../services/AILearningJourneyService';