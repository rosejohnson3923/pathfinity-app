export type SubscriptionTier = 'select' | 'premium' | 'enterprise';

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  tiers: SubscriptionTier[];
  comingSoon?: boolean;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  description: string;
  features: string[]; // IDs of features included
  maxUsers: number;
  maxStorage: number; // in GB
  price: number; // monthly price in USD
  color: string;
  recommended?: boolean;
}

// Feature definitions with tier availability
export const subscriptionFeatures: SubscriptionFeature[] = [
  {
    id: 'core_learning',
    name: 'Core Learning Platform',
    description: 'Personalized learning paths, assessments, and progress tracking',
    tiers: ['select', 'premium', 'enterprise']
  },
  {
    id: 'ai_assistant',
    name: 'AI Learning Assistant',
    description: 'AI-powered learning guide and homework helper',
    tiers: ['select', 'premium', 'enterprise']
  },
  {
    id: 'select_analytics',
    name: 'Select Analytics',
    description: 'Student progress and performance metrics',
    tiers: ['select', 'premium', 'enterprise']
  },
  {
    id: 'content_library',
    name: 'Content Library',
    description: 'Access to educational resources and materials',
    tiers: ['select', 'premium', 'enterprise']
  },
  {
    id: 'collab_projects',
    name: 'Collaborative Projects',
    description: 'Team-based learning and project management',
    tiers: ['premium', 'enterprise']
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Detailed insights, custom reports, and predictive analytics',
    tiers: ['premium', 'enterprise']
  },
  {
    id: 'adaptive_learning',
    name: 'Adaptive Learning Engine',
    description: 'AI-powered real-time personalization that adapts to student needs',
    tiers: ['premium', 'enterprise']
  },
  {
    id: 'career_pathways',
    name: 'Career Discovery & Pathways',
    description: 'Career exploration tools with skill-based learning paths',
    tiers: ['premium', 'enterprise']
  },
  {
    id: 'api_access',
    name: 'API Access',
    description: 'Programmatic access to platform data and services',
    tiers: ['enterprise']
  },
  {
    id: 'sso_integration',
    name: 'SSO Integration',
    description: 'Single sign-on with existing identity providers',
    tiers: ['enterprise']
  },
  {
    id: 'custom_branding',
    name: 'Custom Branding',
    description: 'White-label solution with custom domain and branding',
    tiers: ['enterprise']
  },
  {
    id: 'dedicated_support',
    name: 'Dedicated Support',
    description: '24/7 priority support with dedicated account manager',
    tiers: ['enterprise']
  },
  {
    id: 'advanced_security',
    name: 'Advanced Security',
    description: 'Enhanced security features and compliance controls',
    tiers: ['enterprise']
  },
  {
    id: 'ai_content_generation',
    name: 'AI Content Generation',
    description: 'Generate educational content with AI assistance',
    tiers: ['premium', 'enterprise']
  },
  {
    id: 'virtual_reality',
    name: 'Virtual Reality Learning',
    description: 'Immersive VR educational experiences',
    tiers: ['enterprise'],
    comingSoon: true
  }
];

// Subscription plan definitions
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    tier: 'select',
    name: 'Select',
    description: 'Essential learning tools for small organizations',
    features: ['core_learning', 'ai_assistant', 'select_analytics', 'content_library'],
    maxUsers: 100,
    maxStorage: 50,
    price: 5, // per user per month
    color: 'blue'
  },
  {
    tier: 'premium',
    name: 'Premium',
    description: 'Advanced features for growing educational institutions',
    features: [
      'core_learning', 'ai_assistant', 'select_analytics', 'content_library',
      'collab_projects', 'advanced_analytics', 'adaptive_learning', 'career_pathways',
      'ai_content_generation'
    ],
    maxUsers: 500,
    maxStorage: 250,
    price: 12, // per user per month
    color: 'purple',
    recommended: true
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    description: 'Comprehensive solution for large organizations with custom needs',
    features: [
      'core_learning', 'ai_assistant', 'select_analytics', 'content_library',
      'collab_projects', 'advanced_analytics', 'adaptive_learning', 'career_pathways',
      'api_access', 'sso_integration', 'custom_branding', 'dedicated_support',
      'advanced_security', 'ai_content_generation', 'virtual_reality'
    ],
    maxUsers: 5000,
    maxStorage: 1000,
    price: 20, // per user per month
    color: 'indigo'
  }
];

// Helper function to get features for a specific tier
export const getFeaturesForTier = (tier: SubscriptionTier): SubscriptionFeature[] => {
  return subscriptionFeatures.filter(feature => feature.tiers.includes(tier));
};

// Helper function to get a subscription plan by tier
export const getPlanByTier = (tier: SubscriptionTier): SubscriptionPlan | undefined => {
  return subscriptionPlans.find(plan => plan.tier === tier);
};

// Helper function to check if a feature is available for a tier
export const isFeatureAvailable = (featureId: string, tier: SubscriptionTier): boolean => {
  const feature = subscriptionFeatures.find(f => f.id === featureId);
  return feature ? feature.tiers.includes(tier) : false;
};