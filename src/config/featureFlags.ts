/**
 * Feature Flags Configuration
 * Controls rollout of V2 containers and rules engine features
 */

export interface FeatureFlags {
  useV2Containers: boolean;
  useRulesEngine: boolean;
  enableJourneyMetrics: boolean;
  enableCuriosityTracking: boolean;
  enableEngagementMonitoring: boolean;
  enableCareerProgression: boolean;
  debugMode: boolean;
}

// Default feature flags
const defaultFlags: FeatureFlags = {
  useV2Containers: true, // Enable V2 containers by default
  useRulesEngine: true, // Enable rules engine
  enableJourneyMetrics: true, // Track journey metrics
  enableCuriosityTracking: true, // Track curiosity in Discover
  enableEngagementMonitoring: true, // Monitor engagement in Experience
  enableCareerProgression: true, // Enable career progression system
  debugMode: false // Debug logging
};

// Override with environment variables if available
const getFeatureFlags = (): FeatureFlags => {
  if (typeof window !== 'undefined') {
    // Check for feature flag overrides in localStorage
    const storedFlags = localStorage.getItem('pathfinity_feature_flags');
    if (storedFlags) {
      try {
        const parsedFlags = JSON.parse(storedFlags);
        return { ...defaultFlags, ...parsedFlags };
      } catch (e) {
        console.error('Failed to parse feature flags:', e);
      }
    }
    
    // Check for URL parameters
    const params = new URLSearchParams(window.location.search);
    const urlFlags: Partial<FeatureFlags> = {};
    
    if (params.has('v2')) {
      urlFlags.useV2Containers = params.get('v2') === 'true';
    }
    if (params.has('rules')) {
      urlFlags.useRulesEngine = params.get('rules') === 'true';
    }
    if (params.has('debug')) {
      urlFlags.debugMode = params.get('debug') === 'true';
    }
    
    return { ...defaultFlags, ...urlFlags };
  }
  
  // Server-side or test environment
  return {
    ...defaultFlags,
    // Override with environment variables
    useV2Containers: process.env.USE_V2_CONTAINERS === 'true' || defaultFlags.useV2Containers,
    useRulesEngine: process.env.USE_RULES_ENGINE === 'true' || defaultFlags.useRulesEngine,
    debugMode: process.env.DEBUG_MODE === 'true' || defaultFlags.debugMode
  };
};

// Export singleton instance
export const featureFlags = getFeatureFlags();

// Helper function to update feature flags at runtime
export const updateFeatureFlags = (updates: Partial<FeatureFlags>) => {
  if (typeof window !== 'undefined') {
    const currentFlags = getFeatureFlags();
    const newFlags = { ...currentFlags, ...updates };
    localStorage.setItem('pathfinity_feature_flags', JSON.stringify(newFlags));
    
    // Reload to apply changes
    if (updates.useV2Containers !== undefined || updates.useRulesEngine !== undefined) {
      console.log('🔄 Feature flags updated. Reloading to apply changes...');
      window.location.reload();
    }
  }
};

// Helper function to check if V2 containers should be used
export const shouldUseV2Containers = (): boolean => {
  return featureFlags.useV2Containers && featureFlags.useRulesEngine;
};

// Helper function for debug logging
export const debugLog = (message: string, data?: any) => {
  if (featureFlags.debugMode) {
    console.log(`[DEBUG] ${message}`, data || '');
  }
};

// Feature flag React hook
export const useFeatureFlags = () => {
  return featureFlags;
};

// Export for testing
export const resetFeatureFlags = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pathfinity_feature_flags');
  }
};