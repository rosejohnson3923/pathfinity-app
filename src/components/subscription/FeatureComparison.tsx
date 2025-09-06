import React from 'react';
import { Check, X } from 'lucide-react';
import { SubscriptionTier, subscriptionFeatures, subscriptionPlans } from '../../types/subscription';

interface FeatureComparisonProps {
  currentTier?: SubscriptionTier;
  onSelectPlan?: (tier: SubscriptionTier) => void;
}

export function FeatureComparison({ currentTier, onSelectPlan }: FeatureComparisonProps) {
  // Group features by category
  const featureCategories = [
    {
      name: 'Core Features',
      features: ['core_learning', 'ai_content_generation', 'ai_assistant', 'basic_analytics', 'content_library']
    },
    {
      name: 'Collaboration & Creativity',
      features: ['collab_projects', 'brand_studio', 'stream_live']
    },
    {
      name: 'Advanced Features',
      features: ['advanced_analytics']
    },
    {
      name: 'Enterprise Features',
      features: ['api_access', 'sso_integration', 'custom_branding', 'dedicated_support', 'advanced_security', 'virtual_reality']
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1"></div>
        {subscriptionPlans.map((plan) => (
          <div key={plan.tier} className="col-span-1 text-center">
            <h3 className={`text-lg font-bold text-${plan.color}-600 dark:text-${plan.color}-400`}>
              {plan.name}
            </h3>
            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              ${plan.price}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/user/mo</span>
            </p>
            {onSelectPlan && (
              <button
                onClick={() => onSelectPlan(plan.tier)}
                disabled={currentTier === plan.tier}
                className={`mt-4 w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                  currentTier === plan.tier
                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                    : `text-white bg-${plan.color}-600 hover:bg-${plan.color}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${plan.color}-500`
                }`}
              >
                {currentTier === plan.tier ? 'Current Plan' : 'Select Plan'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Feature comparison table */}
      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
        {featureCategories.map((category) => (
          <div key={category.name} className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{category.name}</h3>
            <div className="border-t border-gray-200 dark:border-gray-700">
              {category.features.map((featureId) => {
                const feature = subscriptionFeatures.find(f => f.id === featureId);
                if (!feature) return null;
                
                return (
                  <div key={featureId} className="grid grid-cols-4 gap-4 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="col-span-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {feature.name}
                          {feature.comingSoon && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                              Coming Soon
                            </span>
                          )}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                    
                    {subscriptionPlans.map((plan) => {
                      const isIncluded = feature.tiers.includes(plan.tier);
                      
                      return (
                        <div key={plan.tier} className="col-span-1 text-center">
                          {isIncluded ? (
                            <Check className={`mx-auto h-5 w-5 text-${plan.color}-500`} />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}