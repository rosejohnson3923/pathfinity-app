import React, { useState } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { SubscriptionTier, subscriptionPlans, SubscriptionPlan } from '../../types/subscription';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: SubscriptionTier;
  onUpgrade: (tier: SubscriptionTier) => void;
}

export function UpgradeModal({ isOpen, onClose, currentTier, onUpgrade }: UpgradeModalProps) {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(
    currentTier === 'basic' ? 'premium' : 'enterprise'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    onUpgrade(selectedTier);
    setIsProcessing(false);
    onClose();
  };

  // Filter out plans that are lower than or equal to current tier
  const availablePlans = subscriptionPlans.filter(plan => {
    if (currentTier === 'basic') return plan.tier !== 'basic';
    if (currentTier === 'premium') return plan.tier === 'enterprise';
    return false; // If already enterprise, no upgrade options
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white dark:bg-gray-800 rounded-md text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span className="sr-only">Close</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Upgrade Your Subscription
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Select a plan to upgrade your subscription and access more features.
                </p>
                
                <div className="mt-6 space-y-4">
                  {availablePlans.map((plan) => (
                    <PlanCard
                      key={plan.tier}
                      plan={plan}
                      isSelected={selectedTier === plan.tier}
                      onSelect={() => setSelectedTier(plan.tier)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={isProcessing}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Upgrade Now'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PlanCardProps {
  plan: SubscriptionPlan;
  isSelected: boolean;
  onSelect: () => void;
}

function PlanCard({ plan, isSelected, onSelect }: PlanCardProps) {
  const getBgColor = () => {
    if (isSelected) {
      switch (plan.tier) {
        case 'premium':
          return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20';
        case 'enterprise':
          return 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20';
        default:
          return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      }
    }
    return 'border-gray-300 dark:border-gray-600';
  };

  return (
    <div 
      className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${getBgColor()}`}
      onClick={onSelect}
    >
      {plan.recommended && (
        <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2">
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Recommended
          </span>
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${plan.price}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">per user/month</p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Max Users</p>
          <p className="font-medium text-gray-900 dark:text-white">{plan.maxUsers.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Storage</p>
          <p className="font-medium text-gray-900 dark:text-white">{plan.maxStorage} GB</p>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Features:</p>
        <ul className="space-y-1">
          {plan.features.slice(0, 5).map((featureId) => {
            const feature = subscriptionPlans.find(p => p.tier === 'enterprise')?.features.includes(featureId);
            return (
              <li key={featureId} className="flex items-center text-sm">
                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">
                  {featureId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </li>
            );
          })}
          {plan.features.length > 5 && (
            <li className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
              <span>And {plan.features.length - 5} more features</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </li>
          )}
        </ul>
      </div>
      
      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
      )}
    </div>
  );
}