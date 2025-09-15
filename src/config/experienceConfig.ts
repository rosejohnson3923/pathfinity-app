/**
 * Experience Container Configuration
 * Simplified after consolidating to BentoExperienceCardV2
 */

// Always use BentoExperienceCardV2 (contains the working ExperienceCard code)
export const getExperienceComponent = () => {
  return import('../components/bento/BentoExperienceCardV2');
};