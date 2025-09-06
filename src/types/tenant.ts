export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  status: TenantStatus;
  tier: SubscriptionTier;
  region: string;
  contactEmail: string;
  primaryContact: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    title?: string;
  };
  settings: TenantSettings;
  usage: TenantUsage;
  billing: TenantBilling;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export type TenantStatus = 'active' | 'suspended' | 'pending' | 'inactive' | 'archived';
export type SubscriptionTier = 'basic' | 'professional' | 'enterprise';

export interface TenantSettings {
  id: string;
  tenantId: string;
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    customCss?: string;
    showBranding: boolean;
  };
  features: {
    ssoEnabled: boolean;
    apiAccess: boolean;
    advancedReporting: boolean;
    whiteLabeling: boolean;
    customDomain: boolean;
    multiLanguage: boolean;
    advancedIntegrations: boolean;
  };
  limits: {
    maxUsers: number;
    maxStorage: number; // in bytes
    maxBandwidth: number; // in bytes per month
    maxCustomFields: number;
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      expirationDays: number;
    };
    sessionTimeout: number; // in minutes
    ipRestrictions: string[];
    twoFactorRequired: boolean;
    auditLogging: boolean;
  };
  integrations: {
    sisProvider?: string;
    sisConfig?: Record<string, any>;
    ssoProvider?: string;
    ssoConfig?: Record<string, any>;
    lmsProvider?: string;
    lmsConfig?: Record<string, any>;
  };
  updatedAt: string;
  updatedBy: string;
}

export interface TenantUsage {
  id: string;
  tenantId: string;
  period: string; // YYYY-MM
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  storage: {
    used: number; // in bytes
    limit: number; // in bytes
    percentage: number;
  };
  bandwidth: {
    used: number; // in bytes
    limit: number; // in bytes
    percentage: number;
  };
  requests: {
    api: number;
    web: number;
    total: number;
  };
  features: {
    reportsGenerated: number;
    integrationsUsed: string[];
    customFieldsUsed: number;
  };
  updatedAt: string;
}

export interface TenantBilling {
  id: string;
  tenantId: string;
  subscription: {
    tier: SubscriptionTier;
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    trialEnd?: string;
    cancelAtPeriodEnd: boolean;
  };
  pricing: {
    basePrice: number;
    userPrice: number;
    storagePrice: number; // per GB
    bandwidthPrice: number; // per GB
    currency: string;
  };
  currentBill: {
    subtotal: number;
    taxes: number;
    total: number;
    dueDate: string;
    status: 'paid' | 'pending' | 'overdue' | 'failed';
  };
  paymentMethod: {
    type: 'card' | 'bank' | 'invoice';
    last4?: string;
    brand?: string;
    expiresAt?: string;
  };
  invoices: TenantInvoice[];
  updatedAt: string;
}

export interface TenantInvoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void';
  dueDate: string;
  paidAt?: string;
  downloadUrl?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  createdAt: string;
}

export interface TenantFormData {
  name: string;
  domain: string;
  subdomain: string;
  contactEmail: string;
  primaryContact: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    title?: string;
  };
  tier: SubscriptionTier;
  region: string;
  settings?: Partial<TenantSettings>;
}

export interface TenantFilters {
  status?: TenantStatus[];
  tier?: SubscriptionTier[];
  region?: string[];
  search?: string;
}

export interface TenantSearchParams {
  page: number;
  limit: number;
  sortBy: keyof Tenant;
  sortOrder: 'asc' | 'desc';
  filters?: TenantFilters;
}

// Utility functions and constants
export const TENANT_STATUS_LABELS: Record<TenantStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
  pending: 'Pending Setup',
  inactive: 'Inactive',
  archived: 'Archived'
};

export const TENANT_STATUS_COLORS: Record<TenantStatus, string> = {
  active: 'green',
  suspended: 'red',
  pending: 'yellow',
  inactive: 'gray',
  archived: 'gray'
};

export const SUBSCRIPTION_TIER_LABELS: Record<SubscriptionTier, string> = {
  basic: 'Basic',
  professional: 'Professional',
  enterprise: 'Enterprise'
};

export const SUBSCRIPTION_TIER_COLORS: Record<SubscriptionTier, string> = {
  basic: 'blue',
  professional: 'purple',
  enterprise: 'indigo'
};

export const REGIONS = [
  { code: 'us-east-1', name: 'US East (N. Virginia)', flag: '🇺🇸' },
  { code: 'us-west-2', name: 'US West (Oregon)', flag: '🇺🇸' },
  { code: 'eu-west-1', name: 'Europe (Ireland)', flag: '🇪🇺' },
  { code: 'eu-central-1', name: 'Europe (Frankfurt)', flag: '🇪🇺' },
  { code: 'ap-southeast-1', name: 'Asia Pacific (Singapore)', flag: '🌏' },
  { code: 'ap-northeast-1', name: 'Asia Pacific (Tokyo)', flag: '🇯🇵' }
];

export const DEFAULT_TENANT_LIMITS: Record<SubscriptionTier, TenantSettings['limits']> = {
  basic: {
    maxUsers: 100,
    maxStorage: 5 * 1024 * 1024 * 1024, // 5GB
    maxBandwidth: 50 * 1024 * 1024 * 1024, // 50GB
    maxCustomFields: 10
  },
  professional: {
    maxUsers: 500,
    maxStorage: 50 * 1024 * 1024 * 1024, // 50GB
    maxBandwidth: 200 * 1024 * 1024 * 1024, // 200GB
    maxCustomFields: 50
  },
  enterprise: {
    maxUsers: -1, // unlimited
    maxStorage: 500 * 1024 * 1024 * 1024, // 500GB
    maxBandwidth: 1000 * 1024 * 1024 * 1024, // 1TB
    maxCustomFields: -1 // unlimited
  }
};

export const DEFAULT_TENANT_FEATURES: Record<SubscriptionTier, TenantSettings['features']> = {
  basic: {
    ssoEnabled: false,
    apiAccess: false,
    advancedReporting: false,
    whiteLabeling: false,
    customDomain: false,
    multiLanguage: false,
    advancedIntegrations: false
  },
  professional: {
    ssoEnabled: true,
    apiAccess: true,
    advancedReporting: true,
    whiteLabeling: false,
    customDomain: true,
    multiLanguage: true,
    advancedIntegrations: false
  },
  enterprise: {
    ssoEnabled: true,
    apiAccess: true,
    advancedReporting: true,
    whiteLabeling: true,
    customDomain: true,
    multiLanguage: true,
    advancedIntegrations: true
  }
};

export const TIER_PRICING: Record<SubscriptionTier, { base: number; perUser: number; storage: number; bandwidth: number }> = {
  basic: {
    base: 29,
    perUser: 5,
    storage: 0.50, // per GB
    bandwidth: 0.10 // per GB
  },
  professional: {
    base: 99,
    perUser: 8,
    storage: 0.40,
    bandwidth: 0.08
  },
  enterprise: {
    base: 299,
    perUser: 12,
    storage: 0.30,
    bandwidth: 0.05
  }
};

// Helper functions
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const calculateUsagePercentage = (used: number, limit: number): number => {
  if (limit === -1) return 0; // unlimited
  return Math.min((used / limit) * 100, 100);
};

export const getTenantStatusBadge = (status: TenantStatus) => {
  const color = TENANT_STATUS_COLORS[status];
  const label = TENANT_STATUS_LABELS[status];
  
  return {
    color,
    label,
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
      color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
      color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }`
  };
};

export const getTierBadge = (tier: SubscriptionTier) => {
  const color = SUBSCRIPTION_TIER_COLORS[tier];
  const label = SUBSCRIPTION_TIER_LABELS[tier];
  
  return {
    color,
    label,
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
      color === 'purple' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    }`
  };
};