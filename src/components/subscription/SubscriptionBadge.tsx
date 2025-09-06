import React from 'react';
import { SubscriptionTier } from '../../types/subscription';

interface SubscriptionBadgeProps {
  tier: SubscriptionTier;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SubscriptionBadge({ tier, size = 'md', className = '' }: SubscriptionBadgeProps) {
  const getBadgeColors = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'basic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'premium':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'enterprise':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-3 py-1.5 text-sm';
      default:
        return 'px-2.5 py-1 text-xs';
    }
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${getBadgeColors(tier)} ${getSizeClasses(size)} ${className}`}>
      <span className="capitalize">{tier}</span>
    </span>
  );
}