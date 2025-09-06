import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { SubscriptionBadge } from './SubscriptionBadge';
import { ArrowRight, X } from 'lucide-react';

interface SubscriptionBannerProps {
  onUpgrade?: () => void;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export function SubscriptionBanner({ 
  onUpgrade, 
  onDismiss,
  showDismiss = true
}: SubscriptionBannerProps) {
  const { tier } = useSubscription();
  
  // Don't show for enterprise users
  if (tier === 'enterprise') {
    return null;
  }
  
  const getBannerContent = () => {
    switch (tier) {
      case 'basic':
        return {
          title: 'Upgrade to Premium',
          message: 'Unlock advanced features like collaborative projects, BRAND Studio, and STREAM Live.',
          cta: 'Upgrade Now',
          color: 'from-purple-600 to-indigo-600'
        };
      case 'premium':
        return {
          title: 'Upgrade to Enterprise',
          message: 'Get SSO integration, custom branding, API access, and dedicated support.',
          cta: 'Contact Sales',
          color: 'from-indigo-600 to-blue-600'
        };
      default:
        return null;
    }
  };
  
  const content = getBannerContent();
  if (!content) return null;
  
  return (
    <div className={`relative rounded-lg bg-gradient-to-r ${content.color} p-4 shadow-md`}>
      {showDismiss && onDismiss && (
        <button 
          onClick={onDismiss}
          className="absolute top-2 right-2 text-white/80 hover:text-white"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="mr-4">
            <SubscriptionBadge tier={tier} size="lg" className="bg-white/20 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{content.title}</h3>
            <p className="text-white/90 text-sm">{content.message}</p>
          </div>
        </div>
        
        <button
          onClick={onUpgrade}
          className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 font-medium"
        >
          <span>{content.cta}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}