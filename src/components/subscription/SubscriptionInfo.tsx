import React, { useState } from 'react';
import { SubscriptionTier, getPlanByTier } from '../../types/subscription';
import { SubscriptionBadge } from './SubscriptionBadge';
import { FeatureList } from './FeatureAvailability';
import { UpgradeModal } from './UpgradeModal';
import { ArrowRight, Users, Database, Calendar } from 'lucide-react';

interface SubscriptionInfoProps {
  tier: SubscriptionTier;
  usersCount: number;
  storageUsed: number;
  renewalDate: string;
  onUpgrade?: (tier: SubscriptionTier) => Promise<void>;
}

export function SubscriptionInfo({ 
  tier, 
  usersCount, 
  storageUsed, 
  renewalDate,
  onUpgrade 
}: SubscriptionInfoProps) {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  const plan = getPlanByTier(tier);
  
  if (!plan) return null;
  
  const usersPercentage = Math.min(100, Math.round((usersCount / plan.maxUsers) * 100));
  const storagePercentage = Math.min(100, Math.round((storageUsed / plan.maxStorage) * 100));
  
  const handleUpgradeClick = () => {
    if (tier !== 'enterprise') {
      setIsUpgradeModalOpen(true);
    }
  };
  
  const handleUpgradeConfirm = async (newTier: SubscriptionTier) => {
    if (onUpgrade) {
      await onUpgrade(newTier);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Subscription Information</h3>
        {tier !== 'enterprise' && (
          <button
            onClick={handleUpgradeClick}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center"
          >
            Upgrade Plan
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        )}
      </div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
            <div className="flex items-center mt-1">
              <p className="text-xl font-bold text-gray-900 dark:text-white capitalize mr-2">{plan.name}</p>
              <SubscriptionBadge tier={tier} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{plan.description}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Users
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {usersCount.toLocaleString()} / {plan.maxUsers.toLocaleString()}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full ${
                    usersPercentage > 90 ? 'bg-red-600' : 'bg-blue-600'
                  }`} 
                  style={{ width: `${usersPercentage}%` }}
                ></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Database className="h-4 w-4 mr-1" />
                Storage
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {storageUsed} GB / {plan.maxStorage} GB
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full ${
                    storagePercentage > 90 ? 'bg-red-600' : 'bg-blue-600'
                  }`} 
                  style={{ width: `${storagePercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Renewal Date
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{renewalDate}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-renewal enabled</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Included Features:</p>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <FeatureList tier={tier} compact={true} />
          </div>
        </div>
      </div>
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentTier={tier}
        onUpgrade={handleUpgradeConfirm}
      />
    </div>
  );
}