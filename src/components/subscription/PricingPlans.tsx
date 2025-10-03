import React from 'react';
import { Check, X } from 'lucide-react';
import { SubscriptionTier, subscriptionPlans, subscriptionFeatures } from '../../types/subscription';

interface PricingPlansProps {
  currentTier?: SubscriptionTier;
  onSelectPlan?: (tier: SubscriptionTier) => void;
  showCurrentPlanOnly?: boolean;
}

export function PricingPlans({ 
  currentTier, 
  onSelectPlan,
  showCurrentPlanOnly = false
}: PricingPlansProps) {
  // Filter plans if needed
  const plans = showCurrentPlanOnly && currentTier 
    ? subscriptionPlans.filter(plan => plan.tier === currentTier)
    : subscriptionPlans;

  return (
    <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-6">
      {plans.map((plan) => (
        <div 
          key={plan.tier}
          className={`relative flex flex-col rounded-2xl border p-6 shadow-sm transition-all ${
            plan.recommended 
              ? 'border-purple-200 dark:border-purple-800 shadow-purple-100 dark:shadow-purple-900/20' 
              : 'border-gray-200 dark:border-gray-700'
          } ${
            currentTier === plan.tier 
              ? 'ring-2 ring-blue-500 dark:ring-blue-400' 
              : ''
          }`}
        >
          {plan.recommended && (
            <div className="absolute -top-5 inset-x-0 flex justify-center">
              <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                Recommended
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">{plan.description}</p>
            
            <p className="mt-4">
              <span className="text-2xl font-semibold text-gray-900 dark:text-white">Enterprise Pricing</span>
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Contact our sales team for custom pricing</p>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">What's included:</h4>
              <ul className="mt-2 space-y-3">
                {/* Show key features */}
                {plan.features.slice(0, 6).map((featureId) => {
                  const feature = subscriptionFeatures.find(f => f.id === featureId);
                  if (!feature) return null;
                  
                  return (
                    <li key={featureId} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">{feature.name}</p>
                    </li>
                  );
                })}
                
                {/* Show feature count if there are more */}
                {plan.features.length > 6 && (
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      And {plan.features.length - 6} more features
                    </p>
                  </li>
                )}
              </ul>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Users</h4>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Up to {plan.maxUsers.toLocaleString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Storage</h4>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{plan.maxStorage} GB</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              onClick={() => window.open('mailto:sales@pathfinity.com?subject=Enterprise Plan Inquiry', '_blank')}
              className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                currentTier === plan.tier ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {currentTier === plan.tier ? 'Current Plan - Contact Sales' : 'Contact Sales'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}