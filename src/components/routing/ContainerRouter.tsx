/**
 * Container Router
 * Manages routing between V1 and V2 containers based on feature flags
 */

import React from 'react';
import { shouldUseV2Containers, debugLog } from '../../config/featureFlags';

// V1 Containers
import { MultiSubjectContainer } from '../ai-containers/MultiSubjectContainer';
import { AIThreeContainerJourney } from '../ai-containers/AIThreeContainerJourney';
import { AILearnContainer } from '../ai-containers/AILearnContainer';
import { AIExperienceContainer } from '../ai-containers/AIExperienceContainer';
import { AIDiscoverContainer } from '../ai-containers/AIDiscoverContainer';

// V2-UNIFIED Containers (Best of V2 + V2-JIT + Adaptive Journey)
import { MultiSubjectContainerV2UNIFIED as MultiSubjectContainerV2 } from '../ai-containers/MultiSubjectContainerV2-UNIFIED';
import { AIThreeContainerJourneyV2 } from '../ai-containers/AIThreeContainerJourneyV2';
import { AILearnContainerV2UNIFIED as AILearnContainerV2 } from '../ai-containers/AILearnContainerV2-UNIFIED';
import { AIExperienceContainerV2UNIFIED as AIExperienceContainerV2 } from '../ai-containers/AIExperienceContainerV2-UNIFIED';
import { AIDiscoverContainerV2UNIFIED as AIDiscoverContainerV2 } from '../ai-containers/AIDiscoverContainerV2-UNIFIED';

// ================================================================
// CONTAINER ROUTER COMPONENT
// ================================================================

interface ContainerRouterProps {
  containerType: 'journey' | 'multi-subject' | 'learn' | 'experience' | 'discover';
  [key: string]: any; // Allow passing through all other props
}

export const ContainerRouter: React.FC<ContainerRouterProps> = ({
  containerType,
  ...props
}) => {
  const useV2 = shouldUseV2Containers();
  
  // Log routing decision
  debugLog(`Container Router: Using ${useV2 ? 'V2' : 'V1'} containers for ${containerType}`);
  
  // Route to appropriate container based on type and feature flag
  switch (containerType) {
    case 'journey':
      return useV2 ? (
        <AIThreeContainerJourneyV2 {...props} />
      ) : (
        <AIThreeContainerJourney {...props} />
      );
      
    case 'multi-subject':
      return useV2 ? (
        <MultiSubjectContainerV2 {...props} />
      ) : (
        <MultiSubjectContainer {...props} />
      );
      
    case 'learn':
      return useV2 ? (
        <AILearnContainerV2 {...props} />
      ) : (
        <AILearnContainer {...props} />
      );
      
    case 'experience':
      return useV2 ? (
        <AIExperienceContainerV2 {...props} />
      ) : (
        <AIExperienceContainer {...props} />
      );
      
    case 'discover':
      return useV2 ? (
        <AIDiscoverContainerV2 {...props} />
      ) : (
        <AIDiscoverContainer {...props} />
      );
      
    default:
      console.warn(`Unknown container type: ${containerType}`);
      return null;
  }
};

// ================================================================
// HOOK FOR CONTAINER VERSION
// ================================================================

export const useContainerVersion = () => {
  const useV2 = shouldUseV2Containers();
  return {
    version: useV2 ? 'v2' : 'v1',
    isV2: useV2,
    hasRulesEngine: useV2,
  };
};

// ================================================================
// HIGHER ORDER COMPONENT FOR MIGRATION
// ================================================================

export function withContainerMigration<P extends object>(
  V1Component: React.ComponentType<P>,
  V2Component: React.ComponentType<P>
): React.ComponentType<P> {
  return (props: P) => {
    const useV2 = shouldUseV2Containers();
    const Component = useV2 ? V2Component : V1Component;
    
    debugLog(`Using ${useV2 ? 'V2' : 'V1'} version of ${V1Component.name || 'Component'}`);
    
    return <Component {...props} />;
  };
}

// ================================================================
// EXPORT CONVENIENCE WRAPPERS
// ================================================================

// Multi-Subject Container with automatic version selection
export const MultiSubjectContainerAuto = withContainerMigration(
  MultiSubjectContainer,
  MultiSubjectContainerV2
);

// Journey Container with automatic version selection
export const AIThreeContainerJourneyAuto = withContainerMigration(
  AIThreeContainerJourney,
  AIThreeContainerJourneyV2
);

// Learn Container with automatic version selection
export const AILearnContainerAuto = withContainerMigration(
  AILearnContainer,
  AILearnContainerV2
);

// Experience Container with automatic version selection
export const AIExperienceContainerAuto = withContainerMigration(
  AIExperienceContainer,
  AIExperienceContainerV2
);

// Discover Container with automatic version selection
export const AIDiscoverContainerAuto = withContainerMigration(
  AIDiscoverContainer,
  AIDiscoverContainerV2
);