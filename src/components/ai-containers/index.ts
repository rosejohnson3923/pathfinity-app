/**
 * AI-FIRST CONTAINERS INDEX
 * Exports all AI-first container components built from scratch
 */

export { default as AILearnContainer } from './AILearnContainer';
export { default as AIExperienceContainer } from './AIExperienceContainer'; 
export { default as AIDiscoverContainer } from './AIDiscoverContainer';

// Re-export types from the service
export type {
  StudentProfile,
  LearningSkill,
  AILearnContent,
  AIExperienceContentLegacy,
  AIDiscoverContent
} from '../../services/AILearningJourneyService';