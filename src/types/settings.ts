export interface SchoolSettings {
  id: string;
  name: string;
  district: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  logo?: string;
  timezone: string;
  locale: string;
  academicYear: {
    startDate: string;
    endDate: string;
  };
  gradeLevels: string[];
  updatedAt: string;
  updatedBy: string;
}

export interface NotificationSettings {
  id: string;
  emailNotifications: {
    enabled: boolean;
    newUsers: boolean;
    contentUpdates: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
    maintenanceNotices: boolean;
  };
  smsNotifications: {
    enabled: boolean;
    emergencyAlerts: boolean;
    importantUpdates: boolean;
  };
  inAppNotifications: {
    enabled: boolean;
    contentPublished: boolean;
    userActivities: boolean;
    systemMessages: boolean;
  };
  digestFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  updatedAt: string;
  updatedBy: string;
}

export interface SystemSettings {
  id: string;
  maintenance: {
    enabled: boolean;
    message: string;
    scheduledStart?: string;
    scheduledEnd?: string;
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
    maxLoginAttempts: number;
    lockoutDuration: number; // in minutes
    twoFactorRequired: boolean;
  };
  backup: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    retention: number; // in days
    lastBackup?: string;
  };
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug';
    retention: number; // in days
    auditTrail: boolean;
  };
  performance: {
    cacheEnabled: boolean;
    cacheDuration: number; // in minutes
    compressionEnabled: boolean;
    cdnEnabled: boolean;
  };
  integrations: {
    sisEnabled: boolean;
    sisProvider?: string;
    ssoEnabled: boolean;
    ssoProvider?: string;
    lmsEnabled: boolean;
    lmsProvider?: string;
  };
  updatedAt: string;
  updatedBy: string;
}

export interface AppearanceSettings {
  id: string;
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  favicon?: string;
  customCss?: string;
  branding: {
    showBranding: boolean;
    customFooter?: string;
    customHeader?: string;
  };
  dashboard: {
    defaultView: 'overview' | 'users' | 'content' | 'reports';
    showQuickActions: boolean;
    showRecentActivity: boolean;
    itemsPerPage: number;
  };
  updatedAt: string;
  updatedBy: string;
}

export interface PrivacySettings {
  id: string;
  dataRetention: {
    userDataDays: number;
    logDataDays: number;
    backupDataDays: number;
    inactiveUserDays: number;
  };
  privacy: {
    allowAnalytics: boolean;
    allowCookies: boolean;
    shareUsageData: boolean;
    allowThirdPartyIntegrations: boolean;
  };
  compliance: {
    ferpaCompliant: boolean;
    coppaCompliant: boolean;
    gdprCompliant: boolean;
    privacyNoticeUrl?: string;
    termsOfServiceUrl?: string;
  };
  updatedAt: string;
  updatedBy: string;
}

export type SettingsSection = 'school' | 'notifications' | 'system' | 'appearance' | 'privacy';

export interface SettingsFormData {
  school?: Partial<SchoolSettings>;
  notifications?: Partial<NotificationSettings>;
  system?: Partial<SystemSettings>;
  appearance?: Partial<AppearanceSettings>;
  privacy?: Partial<PrivacySettings>;
}

export interface SettingsValidationErrors {
  school?: Partial<Record<keyof SchoolSettings, string>>;
  notifications?: Partial<Record<keyof NotificationSettings, string>>;
  system?: Partial<Record<keyof SystemSettings, string>>;
  appearance?: Partial<Record<keyof AppearanceSettings, string>>;
  privacy?: Partial<Record<keyof PrivacySettings, string>>;
}

// Utility types and constants
export const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' }
];

export const STATE_OPTIONS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const GRADE_LEVEL_OPTIONS = [
  'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade',
  '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade',
  '11th Grade', '12th Grade'
];

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  id: 'default',
  name: 'Ocean View Middle School',
  district: 'Plainview ISD',
  address: '1234 Ocean View Dr',
  city: 'Plainview',
  state: 'TX',
  zipCode: '79072',
  phone: '(806) 296-6382',
  email: 'info@oceanview.plainviewisd.edu',
  website: 'https://oceanview.plainviewisd.edu',
  timezone: 'America/Chicago',
  locale: 'en-US',
  academicYear: {
    startDate: '2024-08-15',
    endDate: '2025-05-30'
  },
  gradeLevels: ['6th Grade', '7th Grade', '8th Grade'],
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  id: 'default',
  emailNotifications: {
    enabled: true,
    newUsers: true,
    contentUpdates: true,
    systemAlerts: true,
    weeklyReports: true,
    maintenanceNotices: true
  },
  smsNotifications: {
    enabled: false,
    emergencyAlerts: true,
    importantUpdates: false
  },
  inAppNotifications: {
    enabled: true,
    contentPublished: true,
    userActivities: true,
    systemMessages: true
  },
  digestFrequency: 'weekly',
  quietHours: {
    enabled: true,
    startTime: '22:00',
    endTime: '07:00'
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  id: 'default',
  maintenance: {
    enabled: false,
    message: 'System maintenance in progress. Please check back later.'
  },
  security: {
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      expirationDays: 90
    },
    sessionTimeout: 480, // 8 hours
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    twoFactorRequired: false
  },
  backup: {
    enabled: true,
    frequency: 'daily',
    retention: 30,
    lastBackup: new Date(Date.now() - 86400000).toISOString() // Yesterday
  },
  logging: {
    level: 'info',
    retention: 90,
    auditTrail: true
  },
  performance: {
    cacheEnabled: true,
    cacheDuration: 60,
    compressionEnabled: true,
    cdnEnabled: false
  },
  integrations: {
    sisEnabled: false,
    ssoEnabled: false,
    lmsEnabled: false
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  id: 'default',
  theme: 'auto',
  primaryColor: '#3B82F6',
  secondaryColor: '#6B7280',
  logo: 'https://pathfinity.edu/assets/logo.png',
  favicon: 'https://pathfinity.edu/assets/favicon.ico',
  customCss: '',
  branding: {
    showBranding: true,
    customHeader: '',
    customFooter: ''
  },
  dashboard: {
    defaultView: 'overview',
    showQuickActions: true,
    showRecentActivity: true,
    itemsPerPage: 25
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  id: 'default',
  dataRetention: {
    userDataDays: 2555, // ~7 years for educational records
    logDataDays: 365, // 1 year for system logs
    backupDataDays: 1095, // 3 years for backups
    inactiveUserDays: 730 // 2 years for inactive users
  },
  privacy: {
    allowAnalytics: true,
    allowCookies: true,
    shareUsageData: false,
    allowThirdPartyIntegrations: true
  },
  compliance: {
    ferpaCompliant: true,
    coppaCompliant: true,
    gdprCompliant: false,
    privacyNoticeUrl: 'https://oceanview.plainviewisd.edu/privacy',
    termsOfServiceUrl: 'https://oceanview.plainviewisd.edu/terms'
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};