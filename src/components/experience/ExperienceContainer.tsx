/**
 * ExperienceContainer Wrapper
 * Integrates the clean ExperienceCard with the existing system
 */

import React from 'react';
import { ExperienceCard } from './ExperienceCard';

// For compatibility with existing imports
export const BentoExperienceCardV3 = ExperienceCard;

// Default export for clean imports
export default ExperienceCard;

// Re-export for named imports
export { ExperienceCard };