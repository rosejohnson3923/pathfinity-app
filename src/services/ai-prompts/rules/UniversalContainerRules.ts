/**
 * Universal Container Rules - Shared interface for all container-specific rules
 * This file only contains the common interface used by all container rule files
 * Container-specific implementations are in:
 * - LearnContainerRules.ts (LEARN and ASSESSMENT)
 * - ExperienceContainerRules.ts (EXPERIENCE)
 * - DiscoverContainerRules.ts (DISCOVER)
 */

export interface ContainerRule {
  context: {
    career_integration: string;
    focus: string;
    progression?: string;
  };
  tone: {
    instruction: string;
    encouragement: string;
    feedback: string;
  };
  structure: {
    examples?: string;
    practice: string;
    assessment: string;
  };
  special_features?: Record<string, string>;
}