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
  AIExperienceContent,
  AIDiscoverContent
} from '../../services/AILearningJourneyService';