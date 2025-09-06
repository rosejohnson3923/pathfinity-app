import React, { useState } from 'react';
import { SubscriptionTier, getPlanByTier } from '../../types/subscription';
import { SubscriptionInfo } from './SubscriptionInfo';
import { PricingPlans } from './PricingPlans';
import { UpgradeModal } from './UpgradeModal';
import { useSubscription } from '../../hooks/useSubscription';
import { CreditCard, Download, Users, Calendar, Settings, AlertTriangle, Database } from 'lucide-react';

export function SubscriptionSettings() {
  const { 
    tier, 
    usersCount, 
    storageUsed, 
    renewalDate, 
    upgradeSubscription 
  } = useSubscription();
  
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleUpgrade = async (newTier: SubscriptionTier) => {
    try {
      setIsLoading(true);
      await upgradeSubscription(newTier);
      // Success message would be shown here
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      // Error message would be shown here
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Settings</h2>
        <div className="flex space-x-3">
          <button 
            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
            onClick={() => {}}
          >
            <Download className="h-4 w-4" />
            <span>Invoices</span>
          </button>
          {tier !== 'enterprise' && (
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setIsUpgradeModalOpen(true)}
            >
              Upgrade Plan
            </button>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'billing'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Billing & Payment
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'usage'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Usage & Limits
          </button>
        </nav>
      </div>
      
      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            <SubscriptionInfo
              tier={tier}
              usersCount={usersCount}
              storageUsed={storageUsed}
              renewalDate={renewalDate}
              onUpgrade={() => setIsUpgradeModalOpen(true)}
            />
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Available Plans</h3>
              </div>
              <div className="p-6">
                <PricingPlans 
                  currentTier={tier} 
                  onSelectPlan={(newTier) => {
                    if (newTier !== tier) {
                      setIsUpgradeModalOpen(true);
                    }
                  }}
                />
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'billing' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Billing Information</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Payment Method */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Payment Method</h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-start space-x-4">
                    <CreditCard className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">Visa ending in 4242</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Expires 12/2025</p>
                      <div className="mt-2">
                        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                          Update payment method
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Billing Address */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Billing Address</h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white">Riverside Elementary School</p>
                    <p className="text-gray-600 dark:text-gray-400">123 Education Lane</p>
                    <p className="text-gray-600 dark:text-gray-400">Riverside, CA 92501</p>
                    <p className="text-gray-600 dark:text-gray-400">United States</p>
                    <div className="mt-2">
                      <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                        Update billing address
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Recent Invoices */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Recent Invoices</h4>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Invoice
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            June 1, 2025
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            $1,200.00
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Paid
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                              Download
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            May 1, 2025
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            $1,200.00
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Paid
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                              Download
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            April 1, 2025
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            $1,200.00
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Paid
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                              Download
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'usage' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Usage & Limits</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* User Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    User Accounts
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {usersCount} / {getPlanByTier(tier)?.maxUsers || 100} users
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (usersCount / (getPlanByTier(tier)?.maxUsers || 100)) * 100)}%` }}
                  ></div>
                </div>
                {usersCount > (getPlanByTier(tier)?.maxUsers || 100) * 0.9 && (
                  <div className="mt-2 flex items-start space-x-2 text-sm text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>You're approaching your user limit. Consider upgrading your plan.</p>
                  </div>
                )}
              </div>
              
              {/* Storage Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Storage
                  </h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {storageUsed} GB / {getPlanByTier(tier)?.maxStorage || 50} GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (storageUsed / (getPlanByTier(tier)?.maxStorage || 50)) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Feature Usage */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Feature Usage</h4>
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-900 dark:text-white font-medium">AI Assistant Usage</p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        1,245 / Unlimited queries
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      AI assistant queries used this billing cycle
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-900 dark:text-white font-medium">Live Sessions</p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        12 hours / 20 hours
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: '60%' }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Live streaming hours used this month
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-900 dark:text-white font-medium">API Requests</p>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {tier === 'enterprise' ? '45,678 / Unlimited' : 'Not Available'}
                      </span>
                    </div>
                    {tier !== 'enterprise' && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        API access is only available on Enterprise plans
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
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