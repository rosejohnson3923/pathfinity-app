/**
 * Experience Container Configuration
 * Controls which implementation to use
 */

// Set to true to use the new clean implementation
// Set to false to use the old BentoExperienceCardV2
export const USE_CLEAN_EXPERIENCE = true; // ENABLED FOR TESTING

// Feature flag for gradual rollout
export const getExperienceComponent = () => {
  if (USE_CLEAN_EXPERIENCE) {
    return import('../components/experience/ExperienceCard');
  }
  return import('../components/bento/BentoExperienceCardV2');
};

// For testing specific grade levels with new implementation
export const GRADE_LEVEL_OVERRIDES = {
  'K': USE_CLEAN_EXPERIENCE,  // Test with Kindergarten first
  '1': false,
  '2': false,
  '3': false,
  '4': false,
  '5': false,
  '6': false,
  '7': false,
  '8': false,
  '9': false,
  '10': false,
  '11': false,
  '12': false
};

export const shouldUseCleanExperience = (gradeLevel?: string) => {
  if (gradeLevel && GRADE_LEVEL_OVERRIDES[gradeLevel] !== undefined) {
    return GRADE_LEVEL_OVERRIDES[gradeLevel];
  }
  return USE_CLEAN_EXPERIENCE;
};