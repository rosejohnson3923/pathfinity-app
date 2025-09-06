export type Permission = 
  // User Management
  | 'users:create'
  | 'users:read'
  | 'users:update'
  | 'users:delete'
  | 'users:suspend'
  | 'users:export'
  | 'users:bulk_actions'
  
  // Content Management
  | 'content:create'
  | 'content:read'
  | 'content:update'
  | 'content:delete'
  | 'content:publish'
  | 'content:moderate'
  | 'content:export'
  
  // Reports & Analytics
  | 'reports:view'
  | 'reports:export'
  | 'reports:advanced'
  | 'analytics:view'
  | 'analytics:export'
  
  // Settings
  | 'settings:school'
  | 'settings:notifications'
  | 'settings:system'
  | 'settings:security'
  
  // Admin Functions
  | 'admin:dashboard'
  | 'admin:tenant_management'
  | 'admin:system_logs'
  | 'admin:user_impersonation'
  
  // Audit & Security
  | 'audit:view'
  | 'audit:export'
  | 'audit:manage_retention'
  
  // Subscription & Billing
  | 'subscription:view'
  | 'subscription:manage'
  | 'billing:view'
  | 'billing:manage';

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  hierarchyLevel: number; // Higher numbers = more privileged
  isSystemRole: boolean; // Cannot be deleted/modified
}

export interface UserPermissions {
  userId: string;
  roleId: string;
  permissions: Permission[];
  customPermissions?: Permission[]; // Individual permission overrides
  restrictedPermissions?: Permission[]; // Permissions explicitly denied
}

// Predefined system roles
export const SYSTEM_ROLES: RoleDefinition[] = [
  {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Full system access across all tenants and functions',
    hierarchyLevel: 100,
    isSystemRole: true,
    permissions: [
      'users:create', 'users:read', 'users:update', 'users:delete', 'users:suspend', 'users:export', 'users:bulk_actions',
      'content:create', 'content:read', 'content:update', 'content:delete', 'content:publish', 'content:moderate', 'content:export',
      'reports:view', 'reports:export', 'reports:advanced', 'analytics:view', 'analytics:export',
      'settings:school', 'settings:notifications', 'settings:system', 'settings:security',
      'admin:dashboard', 'admin:tenant_management', 'admin:system_logs', 'admin:user_impersonation',
      'audit:view', 'audit:export', 'audit:manage_retention',
      'subscription:view', 'subscription:manage', 'billing:view', 'billing:manage'
    ]
  },
  {
    id: 'school_admin',
    name: 'School Administrator',
    description: 'Full administrative access within school/tenant',
    hierarchyLevel: 80,
    isSystemRole: true,
    permissions: [
      'users:create', 'users:read', 'users:update', 'users:delete', 'users:suspend', 'users:export', 'users:bulk_actions',
      'content:create', 'content:read', 'content:update', 'content:delete', 'content:publish', 'content:moderate', 'content:export',
      'reports:view', 'reports:export', 'reports:advanced', 'analytics:view', 'analytics:export',
      'settings:school', 'settings:notifications', 'settings:system',
      'admin:dashboard', 'audit:view', 'audit:export', 'subscription:view', 'billing:view'
    ]
  },
  {
    id: 'district_admin',
    name: 'District Administrator',
    description: 'Full administrative access across all schools in district',
    hierarchyLevel: 85,
    isSystemRole: true,
    permissions: [
      'users:create', 'users:read', 'users:update', 'users:delete', 'users:suspend', 'users:export', 'users:bulk_actions',
      'content:create', 'content:read', 'content:update', 'content:delete', 'content:publish', 'content:moderate', 'content:export',
      'reports:view', 'reports:export', 'reports:advanced', 'analytics:view', 'analytics:export',
      'settings:school', 'settings:notifications', 'settings:system', 'settings:security',
      'admin:dashboard', 'admin:tenant_management', 'audit:view', 'audit:export', 'audit:manage_retention',
      'subscription:view', 'subscription:manage', 'billing:view', 'billing:manage'
    ]
  },
  {
    id: 'principal',
    name: 'Principal',
    description: 'School leadership with oversight and reporting capabilities',
    hierarchyLevel: 70,
    isSystemRole: true,
    permissions: [
      'users:read', 'users:update', 'users:suspend', 'users:export',
      'content:read', 'content:update', 'content:publish', 'content:moderate', 'content:export',
      'reports:view', 'reports:export', 'reports:advanced', 'analytics:view', 'analytics:export',
      'settings:school', 'settings:notifications',
      'admin:dashboard', 'audit:view', 'subscription:view'
    ]
  },
  {
    id: 'department_head',
    name: 'Department Head',
    description: 'Department oversight with content and user management',
    hierarchyLevel: 60,
    isSystemRole: true,
    permissions: [
      'users:read', 'users:update', 'users:export',
      'content:create', 'content:read', 'content:update', 'content:delete', 'content:publish', 'content:export',
      'reports:view', 'reports:export', 'analytics:view',
      'settings:notifications',
      'admin:dashboard'
    ]
  },
  {
    id: 'teacher',
    name: 'Teacher',
    description: 'Classroom teacher with content creation and student management',
    hierarchyLevel: 40,
    isSystemRole: true,
    permissions: [
      'users:read',
      'content:create', 'content:read', 'content:update', 'content:delete', 'content:export',
      'reports:view', 'analytics:view',
      'settings:notifications'
    ]
  },
  {
    id: 'support_staff',
    name: 'Support Staff',
    description: 'Support personnel with limited administrative access',
    hierarchyLevel: 30,
    isSystemRole: true,
    permissions: [
      'users:read',
      'content:read',
      'reports:view',
      'settings:notifications'
    ]
  },
  {
    id: 'student',
    name: 'Student',
    description: 'Student access to learning content and personal data',
    hierarchyLevel: 10,
    isSystemRole: true,
    permissions: [
      'content:read'
    ]
  },
  {
    id: 'parent',
    name: 'Parent/Guardian',
    description: 'Parent access to student progress and school information',
    hierarchyLevel: 15,
    isSystemRole: true,
    permissions: [
      'content:read',
      'reports:view'
    ]
  }
];

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  'User Management': [
    'users:create', 'users:read', 'users:update', 'users:delete', 
    'users:suspend', 'users:export', 'users:bulk_actions'
  ],
  'Content Management': [
    'content:create', 'content:read', 'content:update', 'content:delete',
    'content:publish', 'content:moderate', 'content:export'
  ],
  'Reports & Analytics': [
    'reports:view', 'reports:export', 'reports:advanced',
    'analytics:view', 'analytics:export'
  ],
  'Settings': [
    'settings:school', 'settings:notifications', 'settings:system', 'settings:security'
  ],
  'Administration': [
    'admin:dashboard', 'admin:tenant_management', 'admin:system_logs', 'admin:user_impersonation'
  ],
  'Subscription & Billing': [
    'subscription:view', 'subscription:manage', 'billing:view', 'billing:manage'
  ]
} as const;

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  // User Management
  'users:create': 'Create new user accounts',
  'users:read': 'View user information and lists',
  'users:update': 'Edit user profiles and settings',
  'users:delete': 'Delete user accounts',
  'users:suspend': 'Suspend or activate user accounts',
  'users:export': 'Export user data and reports',
  'users:bulk_actions': 'Perform bulk operations on multiple users',
  
  // Content Management
  'content:create': 'Create new educational content',
  'content:read': 'View and access content library',
  'content:update': 'Edit existing content',
  'content:delete': 'Delete content items',
  'content:publish': 'Publish or unpublish content',
  'content:moderate': 'Review and approve content',
  'content:export': 'Export content and metadata',
  
  // Reports & Analytics
  'reports:view': 'View standard reports',
  'reports:export': 'Export report data',
  'reports:advanced': 'Access advanced reporting features',
  'analytics:view': 'View analytics dashboards',
  'analytics:export': 'Export analytics data',
  
  // Settings
  'settings:school': 'Manage school information and preferences',
  'settings:notifications': 'Configure notification settings',
  'settings:system': 'Access system-level settings',
  'settings:security': 'Manage security and access settings',
  
  // Admin Functions
  'admin:dashboard': 'Access administrative dashboard',
  'admin:tenant_management': 'Manage multiple schools/tenants',
  'admin:system_logs': 'View system logs and audit trails',
  'admin:user_impersonation': 'Log in as other users for support',
  
  // Subscription & Billing
  'subscription:view': 'View subscription information',
  'subscription:manage': 'Upgrade/downgrade subscriptions',
  'billing:view': 'View billing information',
  'billing:manage': 'Manage billing and payment methods'
};

// Utility functions
export function getRoleById(roleId: string): RoleDefinition | undefined {
  return SYSTEM_ROLES.find(role => role.id === roleId);
}

export function hasPermission(userPermissions: UserPermissions, permission: Permission): boolean {
  // Check if permission is explicitly denied
  if (userPermissions.restrictedPermissions?.includes(permission)) {
    return false;
  }
  
  // Check custom permissions first
  if (userPermissions.customPermissions?.includes(permission)) {
    return true;
  }
  
  // Check role permissions
  return userPermissions.permissions.includes(permission);
}

export function hasAnyPermission(userPermissions: UserPermissions, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userPermissions, permission));
}

export function hasAllPermissions(userPermissions: UserPermissions, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userPermissions, permission));
}

export function canAccessAdminDashboard(userPermissions: UserPermissions): boolean {
  return hasPermission(userPermissions, 'admin:dashboard');
}

export function getPermissionsByGroup(groupName: keyof typeof PERMISSION_GROUPS): Permission[] {
  return [...PERMISSION_GROUPS[groupName]];
}

export function getUserHierarchyLevel(userPermissions: UserPermissions): number {
  const role = getRoleById(userPermissions.roleId);
  return role?.hierarchyLevel || 0;
}

export function canManageUser(managerPermissions: UserPermissions, targetUserPermissions: UserPermissions): boolean {
  // Can only manage users with lower hierarchy level
  const managerLevel = getUserHierarchyLevel(managerPermissions);
  const targetLevel = getUserHierarchyLevel(targetUserPermissions);
  
  return managerLevel > targetLevel && hasPermission(managerPermissions, 'users:update');
}