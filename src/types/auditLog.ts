export type AuditAction = 
  // User management actions
  | 'user:create' | 'user:update' | 'user:delete' | 'user:suspend' | 'user:activate' | 'user:login' | 'user:logout'
  // Content management actions
  | 'content:create' | 'content:update' | 'content:delete' | 'content:publish' | 'content:unpublish'
  // System administration actions
  | 'settings:update' | 'settings:reset' | 'system:backup' | 'system:restore' | 'system:maintenance'
  // Security actions
  | 'auth:login_failed' | 'auth:password_reset' | 'auth:2fa_enabled' | 'auth:2fa_disabled' | 'permission:grant' | 'permission:revoke'
  // Bulk operations
  | 'bulk:invite' | 'bulk:suspend' | 'bulk:activate' | 'bulk:delete' | 'bulk:export' | 'bulk:role_change'
  // Tenant management (Enterprise)
  | 'tenant:create' | 'tenant:update' | 'tenant:delete' | 'tenant:suspend' | 'tenant:activate'
  // Data operations
  | 'data:export' | 'data:import' | 'data:backup' | 'data:restore' | 'data:purge'
  // Integration actions
  | 'integration:enable' | 'integration:disable' | 'integration:configure' | 'api:key_create' | 'api:key_revoke';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AuditCategory = 'authentication' | 'authorization' | 'user_management' | 'content_management' | 'system_admin' | 'security' | 'data_handling' | 'integrations';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;
  actor: {
    id: string;
    email: string;
    name: string;
    role: string;
    ipAddress: string;
    userAgent: string;
  };
  target?: {
    type: 'user' | 'content' | 'tenant' | 'system' | 'integration';
    id: string;
    name?: string;
    email?: string;
  };
  details: {
    description: string;
    changes?: Record<string, { from: any; to: any }>;
    metadata?: Record<string, any>;
    bulkCount?: number;
    affectedItems?: string[];
  };
  outcome: 'success' | 'failure' | 'partial';
  errorMessage?: string;
  sessionId: string;
  tenantId?: string;
  compliance: {
    retention: number; // days to retain
    exportable: boolean;
    sensitive: boolean;
  };
}

export interface AuditLogFilters {
  actions?: AuditAction[];
  categories?: AuditCategory[];
  severities?: AuditSeverity[];
  actors?: string[]; // user IDs or emails
  targets?: string[]; // target IDs
  outcomes?: ('success' | 'failure' | 'partial')[];
  dateRange?: {
    start: string;
    end: string;
  };
  ipAddresses?: string[];
  search?: string;
}

export interface AuditLogSearchParams {
  page: number;
  limit: number;
  sortBy: keyof AuditLogEntry;
  sortOrder: 'asc' | 'desc';
  filters?: AuditLogFilters;
}

export interface AuditLogSummary {
  totalEntries: number;
  timeRange: {
    start: string;
    end: string;
  };
  topActions: Array<{
    action: AuditAction;
    count: number;
    percentage: number;
  }>;
  topActors: Array<{
    actorId: string;
    actorName: string;
    actorEmail: string;
    actionCount: number;
    lastActivity: string;
  }>;
  severityBreakdown: Record<AuditSeverity, number>;
  categoryBreakdown: Record<AuditCategory, number>;
  outcomeBreakdown: Record<'success' | 'failure' | 'partial', number>;
  activityTrend: Array<{
    date: string;
    totalActions: number;
    criticalActions: number;
    failedActions: number;
  }>;
  securityAlerts: Array<{
    type: 'multiple_failed_logins' | 'suspicious_activity' | 'privilege_escalation' | 'data_access_anomaly';
    count: number;
    lastOccurrence: string;
    severity: AuditSeverity;
  }>;
}

export interface AuditLogExportOptions {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  filters: AuditLogFilters;
  fields: (keyof AuditLogEntry)[];
  includeMetadata: boolean;
  includeSensitive: boolean; // requires special permissions
  dateRange: {
    start: string;
    end: string;
  };
}

// Action definitions with metadata
export const AUDIT_ACTION_DEFINITIONS: Record<AuditAction, {
  label: string;
  description: string;
  category: AuditCategory;
  defaultSeverity: AuditSeverity;
  retentionDays: number;
  sensitive: boolean;
  requiresTarget: boolean;
}> = {
  // User management
  'user:create': {
    label: 'User Created',
    description: 'A new user account was created',
    category: 'user_management',
    defaultSeverity: 'low',
    retentionDays: 2555, // 7 years
    sensitive: false,
    requiresTarget: true
  },
  'user:update': {
    label: 'User Updated',
    description: 'User account information was modified',
    category: 'user_management',
    defaultSeverity: 'low',
    retentionDays: 2555,
    sensitive: false,
    requiresTarget: true
  },
  'user:delete': {
    label: 'User Deleted',
    description: 'User account was permanently deleted',
    category: 'user_management',
    defaultSeverity: 'high',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: true
  },
  'user:suspend': {
    label: 'User Suspended',
    description: 'User account was suspended',
    category: 'user_management',
    defaultSeverity: 'medium',
    retentionDays: 2555,
    sensitive: false,
    requiresTarget: true
  },
  'user:activate': {
    label: 'User Activated',
    description: 'User account was activated or reactivated',
    category: 'user_management',
    defaultSeverity: 'low',
    retentionDays: 2555,
    sensitive: false,
    requiresTarget: true
  },
  'user:login': {
    label: 'User Login',
    description: 'User successfully logged in',
    category: 'authentication',
    defaultSeverity: 'low',
    retentionDays: 90,
    sensitive: false,
    requiresTarget: false
  },
  'user:logout': {
    label: 'User Logout',
    description: 'User logged out',
    category: 'authentication',
    defaultSeverity: 'low',
    retentionDays: 90,
    sensitive: false,
    requiresTarget: false
  },

  // Content management
  'content:create': {
    label: 'Content Created',
    description: 'New content was created',
    category: 'content_management',
    defaultSeverity: 'low',
    retentionDays: 1095, // 3 years
    sensitive: false,
    requiresTarget: true
  },
  'content:update': {
    label: 'Content Updated',
    description: 'Content was modified',
    category: 'content_management',
    defaultSeverity: 'low',
    retentionDays: 1095,
    sensitive: false,
    requiresTarget: true
  },
  'content:delete': {
    label: 'Content Deleted',
    description: 'Content was deleted',
    category: 'content_management',
    defaultSeverity: 'medium',
    retentionDays: 1095,
    sensitive: false,
    requiresTarget: true
  },
  'content:publish': {
    label: 'Content Published',
    description: 'Content was published',
    category: 'content_management',
    defaultSeverity: 'low',
    retentionDays: 1095,
    sensitive: false,
    requiresTarget: true
  },
  'content:unpublish': {
    label: 'Content Unpublished',
    description: 'Content was unpublished',
    category: 'content_management',
    defaultSeverity: 'low',
    retentionDays: 1095,
    sensitive: false,
    requiresTarget: true
  },

  // System administration
  'settings:update': {
    label: 'Settings Updated',
    description: 'System settings were modified',
    category: 'system_admin',
    defaultSeverity: 'medium',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: false
  },
  'settings:reset': {
    label: 'Settings Reset',
    description: 'System settings were reset to defaults',
    category: 'system_admin',
    defaultSeverity: 'high',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: false
  },
  'system:backup': {
    label: 'System Backup',
    description: 'System backup was initiated',
    category: 'system_admin',
    defaultSeverity: 'low',
    retentionDays: 365,
    sensitive: false,
    requiresTarget: false
  },
  'system:restore': {
    label: 'System Restore',
    description: 'System was restored from backup',
    category: 'system_admin',
    defaultSeverity: 'critical',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: false
  },
  'system:maintenance': {
    label: 'Maintenance Mode',
    description: 'System maintenance mode was toggled',
    category: 'system_admin',
    defaultSeverity: 'medium',
    retentionDays: 365,
    sensitive: false,
    requiresTarget: false
  },

  // Security actions  
  'auth:login_failed': {
    label: 'Login Failed',
    description: 'Failed login attempt',
    category: 'security',
    defaultSeverity: 'medium',
    retentionDays: 365,
    sensitive: false,
    requiresTarget: false
  },
  'auth:password_reset': {
    label: 'Password Reset',
    description: 'Password was reset',
    category: 'security',
    defaultSeverity: 'medium',
    retentionDays: 365,
    sensitive: true,
    requiresTarget: true
  },
  'auth:2fa_enabled': {
    label: '2FA Enabled',
    description: 'Two-factor authentication was enabled',
    category: 'security',
    defaultSeverity: 'low',
    retentionDays: 365,
    sensitive: false,
    requiresTarget: true
  },
  'auth:2fa_disabled': {
    label: '2FA Disabled',
    description: 'Two-factor authentication was disabled',
    category: 'security',
    defaultSeverity: 'medium',
    retentionDays: 365,
    sensitive: true,
    requiresTarget: true
  },
  'permission:grant': {
    label: 'Permission Granted',
    description: 'Permissions were granted to a user',
    category: 'authorization',
    defaultSeverity: 'medium',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: true
  },
  'permission:revoke': {
    label: 'Permission Revoked',
    description: 'Permissions were revoked from a user',
    category: 'authorization',
    defaultSeverity: 'medium',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: true
  },

  // Bulk operations
  'bulk:invite': {
    label: 'Bulk Invite',
    description: 'Bulk user invitation was performed',
    category: 'user_management',
    defaultSeverity: 'medium',
    retentionDays: 2555,
    sensitive: false,
    requiresTarget: false
  },
  'bulk:suspend': {
    label: 'Bulk Suspend',
    description: 'Multiple users were suspended',
    category: 'user_management',
    defaultSeverity: 'high',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: false
  },
  'bulk:activate': {
    label: 'Bulk Activate',
    description: 'Multiple users were activated',
    category: 'user_management',
    defaultSeverity: 'medium',
    retentionDays: 2555,
    sensitive: false,
    requiresTarget: false
  },
  'bulk:delete': {
    label: 'Bulk Delete',
    description: 'Multiple users were deleted',
    category: 'user_management',
    defaultSeverity: 'critical',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: false
  },
  'bulk:export': {
    label: 'Bulk Export',
    description: 'User data was exported',
    category: 'data_handling',
    defaultSeverity: 'high',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: false
  },
  'bulk:role_change': {
    label: 'Bulk Role Change',
    description: 'Multiple user roles were changed',
    category: 'authorization',
    defaultSeverity: 'high',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: false
  },

  // Tenant management
  'tenant:create': {
    label: 'Tenant Created',
    description: 'New tenant organization was created',
    category: 'system_admin',
    defaultSeverity: 'medium',
    retentionDays: 2555,
    sensitive: false,
    requiresTarget: true
  },
  'tenant:update': {
    label: 'Tenant Updated',
    description: 'Tenant organization was modified',
    category: 'system_admin',
    defaultSeverity: 'medium',
    retentionDays: 2555,
    sensitive: false,
    requiresTarget: true
  },
  'tenant:delete': {
    label: 'Tenant Deleted',
    description: 'Tenant organization was deleted',
    category: 'system_admin',
    defaultSeverity: 'critical',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: true
  },
  'tenant:suspend': {
    label: 'Tenant Suspended',
    description: 'Tenant organization was suspended',
    category: 'system_admin',
    defaultSeverity: 'high',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: true
  },
  'tenant:activate': {
    label: 'Tenant Activated',
    description: 'Tenant organization was activated',
    category: 'system_admin',
    defaultSeverity: 'medium',
    retentionDays: 2555,
    sensitive: false,
    requiresTarget: true
  },

  // Data operations
  'data:export': {
    label: 'Data Export',
    description: 'Data was exported from the system',
    category: 'data_handling',
    defaultSeverity: 'high',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: false
  },
  'data:import': {
    label: 'Data Import',
    description: 'Data was imported into the system',
    category: 'data_handling',
    defaultSeverity: 'high',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: false
  },
  'data:backup': {
    label: 'Data Backup',
    description: 'Data backup was performed',
    category: 'data_handling',
    defaultSeverity: 'low',
    retentionDays: 365,
    sensitive: false,
    requiresTarget: false
  },
  'data:restore': {
    label: 'Data Restore',
    description: 'Data was restored from backup',
    category: 'data_handling',
    defaultSeverity: 'critical',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: false
  },
  'data:purge': {
    label: 'Data Purge',
    description: 'Data was permanently purged',
    category: 'data_handling',
    defaultSeverity: 'critical',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: false
  },

  // Integration actions
  'integration:enable': {
    label: 'Integration Enabled',
    description: 'System integration was enabled',
    category: 'integrations',
    defaultSeverity: 'medium',
    retentionDays: 1095,
    sensitive: false,
    requiresTarget: true
  },
  'integration:disable': {
    label: 'Integration Disabled',
    description: 'System integration was disabled',
    category: 'integrations',
    defaultSeverity: 'medium',
    retentionDays: 1095,
    sensitive: false,
    requiresTarget: true
  },
  'integration:configure': {
    label: 'Integration Configured',
    description: 'System integration was configured',
    category: 'integrations',
    defaultSeverity: 'medium',
    retentionDays: 1095,
    sensitive: true,
    requiresTarget: true
  },
  'api:key_create': {
    label: 'API Key Created',
    description: 'New API key was created',
    category: 'security',
    defaultSeverity: 'medium',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: false
  },
  'api:key_revoke': {
    label: 'API Key Revoked',
    description: 'API key was revoked',
    category: 'security',
    defaultSeverity: 'medium',
    retentionDays: 2555,
    sensitive: true,
    requiresTarget: false
  }
};

export const AUDIT_SEVERITY_COLORS: Record<AuditSeverity, { backgroundColor: string; color: string }> = {
  low: { backgroundColor: '#f3f4f6', color: '#4b5563' },
  medium: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  high: { backgroundColor: '#fed7aa', color: '#c2410c' },
  critical: { backgroundColor: '#fee2e2', color: '#991b1b' }
};

export const AUDIT_CATEGORY_COLORS: Record<AuditCategory, { backgroundColor: string; color: string }> = {
  authentication: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
  authorization: { backgroundColor: '#e9d5ff', color: '#7c3aed' },
  user_management: { backgroundColor: '#d1fae5', color: '#065f46' },
  content_management: { backgroundColor: '#e0e7ff', color: '#4338ca' },
  system_admin: { backgroundColor: '#fee2e2', color: '#991b1b' },
  security: { backgroundColor: '#fef3c7', color: '#92400e' },
  data_handling: { backgroundColor: '#fce7f3', color: '#9f1239' },
  integrations: { backgroundColor: '#ccfbf1', color: '#115e59' }
};

// Utility functions
export const getAuditActionLabel = (action: AuditAction): string => {
  return AUDIT_ACTION_DEFINITIONS[action]?.label || action;
};

export const getAuditActionDescription = (action: AuditAction): string => {
  return AUDIT_ACTION_DEFINITIONS[action]?.description || '';
};

export const getAuditActionSeverity = (action: AuditAction): AuditSeverity => {
  return AUDIT_ACTION_DEFINITIONS[action]?.defaultSeverity || 'low';
};

export const getAuditActionCategory = (action: AuditAction): AuditCategory => {
  return AUDIT_ACTION_DEFINITIONS[action]?.category || 'system_admin';
};

export const formatAuditTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString();
};

export const getRetentionPeriod = (action: AuditAction): number => {
  return AUDIT_ACTION_DEFINITIONS[action]?.retentionDays || 365;
};

export const isSensitiveAction = (action: AuditAction): boolean => {
  return AUDIT_ACTION_DEFINITIONS[action]?.sensitive || false;
};