import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { SubscriptionTier, isFeatureAvailable, subscriptionFeatures } from '../../types/subscription';

interface FeatureAvailabilityProps {
  featureId: string;
  currentTier: SubscriptionTier;
  showUpgrade?: boolean;
  onUpgrade?: () => void;
}

export function FeatureAvailability({ 
  featureId, 
  currentTier, 
  showUpgrade = true,
  onUpgrade 
}: FeatureAvailabilityProps) {
  const isAvailable = isFeatureAvailable(featureId, currentTier);
  const feature = subscriptionFeatures.find(f => f.id === featureId);

  if (isAvailable) {
    return null; // Don't show anything if the feature is available
  }

  // Find the lowest tier that has this feature
  const requiredTier = feature?.tiers[0] || 'premium';

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-amber-500" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">
            {feature?.name || 'Premium Feature'}
          </h3>
          <div className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            <p>
              This feature is not available on your current subscription plan.
              {` Upgrade to ${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} or higher to access this feature.`}
            </p>
          </div>
          {showUpgrade && onUpgrade && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onUpgrade}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Upgrade Subscription
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeatureList({ 
  tier, 
  compact = false 
}: { 
  tier: SubscriptionTier; 
  compact?: boolean;
}) {
  // Features based on actual Pathfinity implementation
  const features = [
    { id: 'core_learning', name: 'Personalized Learning Engine' },
    { id: 'ai_assistant', name: 'Finn AI Tutor & Assistant' },
    { id: 'basic_analytics', name: 'Student Progress Analytics' },
    { id: 'content_library', name: 'Multi-Subject Content Library' },
    { id: 'collab_projects', name: 'Collaborative Learning Tools' },
    { id: 'advanced_analytics', name: 'Advanced Teacher Analytics' },
    { id: 'adaptive_learning', name: 'Adaptive Learning Engine' },
    { id: 'career_pathways', name: 'Career Discovery & Pathways' },
    { id: 'sso_integration', name: 'SSO Integration' },
    { id: 'custom_branding', name: 'Custom School Branding' }
  ];

  return (
    <ul className={`space-y-${compact ? '1' : '2'}`}>
      {features.map((feature) => {
        const available = isFeatureAvailable(feature.id, tier);
        return (
          <li key={feature.id} className="flex items-center">
            {available ? (
              <Check className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-green-500 mr-2 flex-shrink-0`} />
            ) : (
              <X className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400 mr-2 flex-shrink-0`} />
            )}
            <span className={`${compact ? 'text-sm' : 'text-base'} ${available ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              {feature.name}
            </span>
          </li>
        );
      })}
    </ul>
  );
}