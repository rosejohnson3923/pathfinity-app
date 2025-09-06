import React, { useState } from 'react';
import { Header } from '../components/Header';
import { SubscriptionSettings } from '../components/subscription/SubscriptionSettings';
import { FeatureComparison } from '../components/subscription/FeatureComparison';
import { UpgradeModal } from '../components/subscription/UpgradeModal';
import { useSubscription } from '../hooks/useSubscription';
import { SubscriptionTier } from '../types/subscription';

export function SubscriptionPage() {
  const { tier, upgradeSubscription } = useSubscription();
  const [activeTab, setActiveTab] = useState('settings');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  const handleUpgrade = async (newTier: SubscriptionTier) => {
    try {
      await upgradeSubscription(newTier);
      setIsUpgradeModalOpen(false);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header showBackButton={true} backButtonDestination="/dashboard" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription</h1>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Subscription Settings
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'compare'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Compare Plans
            </button>
          </nav>
        </div>
        
        {/* Content */}
        <div>
          {activeTab === 'settings' && (
            <SubscriptionSettings />
          )}
          
          {activeTab === 'compare' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Plan Comparison</h2>
              <FeatureComparison 
                currentTier={tier} 
                onSelectPlan={(newTier) => {
                  if (newTier !== tier) {
                    setIsUpgradeModalOpen(true);
                  }
                }}
              />
            </div>
          )}
        </div>
      </main>
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentTier={tier}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}