import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { 
  Permission, 
  UserPermissions, 
  RoleDefinition, 
  SYSTEM_ROLES,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessAdminDashboard,
  getUserHierarchyLevel,
  canManageUser,
  getRoleById
} from '../types/permissions';

interface UsePermissionsResult {
  userPermissions: UserPermissions | null;
  currentRole: RoleDefinition | null;
  loading: boolean;
  error: string | null;
  
  // Permission checking functions
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  canAccessAdminDashboard: () => boolean;
  canManageUser: (targetUserPermissions: UserPermissions) => boolean;
  
  // Role and hierarchy functions
  getCurrentRole: () => RoleDefinition | null;
  getHierarchyLevel: () => number;
  isHigherRoleThan: (otherRoleId: string) => boolean;
  
  // Permission management (for admin users)
  updateUserPermissions: (userId: string, permissions: Partial<UserPermissions>) => Promise<void>;
  assignRole: (userId: string, roleId: string) => Promise<void>;
}

// Mock user permissions data - in real app this would come from API
const MOCK_USER_PERMISSIONS: Record<string, UserPermissions> = {
  'principal@plainviewisd.edu': {
    userId: 'principal',
    roleId: 'principal',
    permissions: getRoleById('principal')?.permissions || []
  },
  'admin@plainviewisd.edu': {
    userId: 'admin',
    roleId: 'school_admin', 
    permissions: getRoleById('school_admin')?.permissions || []
  },
  'superintendent@plainviewisd.edu': {
    userId: 'superintendent',
    roleId: 'district_admin',
    permissions: getRoleById('district_admin')?.permissions || []
  },
  'teacher@plainviewisd.edu': {
    userId: 'teacher',
    roleId: 'teacher',
    permissions: getRoleById('teacher')?.permissions || []
  },
  'brenda.sea@oceanview.plainviewisd.edu': {
    userId: 'teacher1',
    roleId: 'teacher',
    permissions: getRoleById('teacher')?.permissions || []
  },
  'student@plainviewisd.edu': {
    userId: 'student',
    roleId: 'student',
    permissions: getRoleById('student')?.permissions || []
  }
};

export function usePermissions(): UsePermissionsResult {
  const { user } = useAuthContext();
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user permissions when user changes
  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!user?.email) {
        setUserPermissions(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Get permissions for current user
        const permissions = MOCK_USER_PERMISSIONS[user.email];
        
        if (permissions) {
          setUserPermissions(permissions);
        } else {
          // Default to student role if no specific permissions found
          const defaultPermissions: UserPermissions = {
            userId: user.id || 'unknown',
            roleId: 'student',
            permissions: getRoleById('student')?.permissions || []
          };
          setUserPermissions(defaultPermissions);
        }
      } catch (err) {
        console.error('Error loading user permissions:', err);
        setError('Failed to load user permissions');
      } finally {
        setLoading(false);
      }
    };

    loadUserPermissions();
  }, [user]);

  const currentRole = userPermissions ? getRoleById(userPermissions.roleId) : null;

  // Permission checking functions
  const checkPermission = useCallback((permission: Permission): boolean => {
    if (!userPermissions) return false;
    return hasPermission(userPermissions, permission);
  }, [userPermissions]);

  const checkAnyPermission = useCallback((permissions: Permission[]): boolean => {
    if (!userPermissions) return false;
    return hasAnyPermission(userPermissions, permissions);
  }, [userPermissions]);

  const checkAllPermissions = useCallback((permissions: Permission[]): boolean => {
    if (!userPermissions) return false;
    return hasAllPermissions(userPermissions, permissions);
  }, [userPermissions]);

  const checkCanAccessAdmin = useCallback((): boolean => {
    if (!userPermissions) return false;
    return canAccessAdminDashboard(userPermissions);
  }, [userPermissions]);

  const checkCanManageUser = useCallback((targetUserPermissions: UserPermissions): boolean => {
    if (!userPermissions) return false;
    return canManageUser(userPermissions, targetUserPermissions);
  }, [userPermissions]);

  // Role and hierarchy functions
  const getCurrentRole = useCallback((): RoleDefinition | null => {
    return currentRole;
  }, [currentRole]);

  const getHierarchyLevel = useCallback((): number => {
    if (!userPermissions) return 0;
    return getUserHierarchyLevel(userPermissions);
  }, [userPermissions]);

  const isHigherRoleThan = useCallback((otherRoleId: string): boolean => {
    if (!userPermissions) return false;
    
    const currentLevel = getUserHierarchyLevel(userPermissions);
    const otherRole = getRoleById(otherRoleId);
    const otherLevel = otherRole?.hierarchyLevel || 0;
    
    return currentLevel > otherLevel;
  }, [userPermissions]);

  // Permission management functions (for admin users)
  const updateUserPermissions = useCallback(async (
    userId: string, 
    permissions: Partial<UserPermissions>
  ): Promise<void> => {
    if (!userPermissions || !hasPermission(userPermissions, 'users:update')) {
      throw new Error('Insufficient permissions to update user permissions');
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, this would make an API call to update permissions
      console.log('Updating user permissions:', { userId, permissions });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update permissions';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userPermissions]);

  const assignRole = useCallback(async (userId: string, roleId: string): Promise<void> => {
    if (!userPermissions || !hasPermission(userPermissions, 'users:update')) {
      throw new Error('Insufficient permissions to assign roles');
    }

    const targetRole = getRoleById(roleId);
    if (!targetRole) {
      throw new Error('Invalid role ID');
    }

    // Check if user can assign this role (must be higher hierarchy)
    const currentLevel = getUserHierarchyLevel(userPermissions);
    const targetLevel = targetRole.hierarchyLevel;
    
    if (currentLevel <= targetLevel) {
      throw new Error('Cannot assign role with equal or higher privileges');
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, this would make an API call to assign role
      console.log('Assigning role:', { userId, roleId });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign role';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userPermissions]);

  return {
    userPermissions,
    currentRole,
    loading,
    error,
    
    // Permission checking functions
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    canAccessAdminDashboard: checkCanAccessAdmin,
    canManageUser: checkCanManageUser,
    
    // Role and hierarchy functions
    getCurrentRole,
    getHierarchyLevel,
    isHigherRoleThan,
    
    // Permission management
    updateUserPermissions,
    assignRole
  };
}

// Convenience hook for checking a single permission
export function usePermission(permission: Permission): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

// Convenience hook for checking multiple permissions
export function usePermissions_AnyOf(permissions: Permission[]): boolean {
  const { hasAnyPermission } = usePermissions();
  return hasAnyPermission(permissions);
}

export function usePermissions_AllOf(permissions: Permission[]): boolean {
  const { hasAllPermissions } = usePermissions();
  return hasAllPermissions(permissions);
}