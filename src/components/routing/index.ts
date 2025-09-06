/**
 * Routing Exports
 * Central export for all container routing utilities
 */

export {
  ContainerRouter,
  useContainerVersion,
  withContainerMigration,
  MultiSubjectContainerAuto,
  AIThreeContainerJourneyAuto,
  AILearnContainerAuto,
  AIExperienceContainerAuto,
  AIDiscoverContainerAuto
} from './ContainerRouter';

// Re-export feature flags for convenience
export { 
  shouldUseV2Containers,
  updateFeatureFlags,
  useFeatureFlags,
  debugLog 
} from '../../config/featureFlags';