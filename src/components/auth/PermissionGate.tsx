import React from 'react';
import { Permission } from '../../types/permissions';
import { usePermissions } from '../../hooks/usePermissions';
import { AlertTriangle, Lock } from 'lucide-react';

interface PermissionGateProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, requires ALL permissions; if false, requires ANY (default: false)
  fallback?: React.ReactNode;
  showFallback?: boolean; // Whether to show fallback UI or render nothing (default: false)
  children: React.ReactNode;
}

interface PermissionGuardProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  onDenied?: () => void;
  children: (props: { hasPermission: boolean; loading: boolean }) => React.ReactNode;
}

/**
 * PermissionGate - Conditionally renders children based on user permissions
 * 
 * @param permission - Single permission to check
 * @param permissions - Array of permissions to check
 * @param requireAll - If true, user must have ALL permissions. If false, user needs ANY permission
 * @param fallback - Custom fallback component when permission denied
 * @param showFallback - Whether to show fallback or render nothing when denied
 * @param children - Content to render when permission granted
 */
export function PermissionGate({
  permission,
  permissions = [],
  requireAll = false,
  fallback,
  showFallback = false,
  children
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  // Show loading state while permissions are being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Determine which permissions to check
  const permissionsToCheck = permission ? [permission] : permissions;
  
  if (permissionsToCheck.length === 0) {
    console.warn('PermissionGate: No permissions specified');
    return <>{children}</>;
  }

  // Check permissions
  let hasRequiredPermissions = false;
  
  if (permissionsToCheck.length === 1) {
    hasRequiredPermissions = hasPermission(permissionsToCheck[0]);
  } else {
    hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissionsToCheck)
      : hasAnyPermission(permissionsToCheck);
  }

  // Render children if permission granted
  if (hasRequiredPermissions) {
    return <>{children}</>;
  }

  // Handle permission denied
  if (!showFallback) {
    return null;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default fallback UI
  return (
    <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div className="text-center">
        <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Access Restricted
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          You don't have the necessary permissions to view this content. 
          Contact your administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
}

/**
 * PermissionGuard - Render prop pattern for more flexible permission checking
 * 
 * @param permission - Single permission to check  
 * @param permissions - Array of permissions to check
 * @param requireAll - If true, user must have ALL permissions
 * @param onDenied - Callback when permission is denied
 * @param children - Render function that receives permission state
 */
export function PermissionGuard({
  permission,
  permissions = [],
  requireAll = false,
  onDenied,
  children
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  // Determine which permissions to check
  const permissionsToCheck = permission ? [permission] : permissions;
  
  let hasRequiredPermissions = false;
  
  if (permissionsToCheck.length === 1) {
    hasRequiredPermissions = hasPermission(permissionsToCheck[0]);
  } else if (permissionsToCheck.length > 1) {
    hasRequiredPermissions = requireAll 
      ? hasAllPermissions(permissionsToCheck)
      : hasAnyPermission(permissionsToCheck);
  } else {
    hasRequiredPermissions = true; // No permissions specified = allow access
  }

  // Call onDenied callback if permission denied
  React.useEffect(() => {
    if (!loading && !hasRequiredPermissions && onDenied) {
      onDenied();
    }
  }, [loading, hasRequiredPermissions, onDenied]);

  return <>{children({ hasPermission: hasRequiredPermissions, loading })}</>;
}

// Higher-order component for permission-based rendering
export function withPermissions<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: Permission[],
  options: {
    requireAll?: boolean;
    fallback?: React.ComponentType;
    redirectTo?: string;
  } = {}
) {
  const { requireAll = false, fallback: FallbackComponent } = options;
  
  return function PermissionWrappedComponent(props: P) {
    return (
      <PermissionGate 
        permissions={requiredPermissions}
        requireAll={requireAll}
        showFallback={true}
        fallback={FallbackComponent ? <FallbackComponent /> : undefined}
      >
        <Component {...props} />
      </PermissionGate>
    );
  };
}

// Specialized components for common use cases
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate 
      permission="admin:dashboard" 
      fallback={fallback}
      showFallback={!!fallback}
    >
      {children}
    </PermissionGate>
  );
}

export function TeacherOrAbove({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate 
      permissions={['content:create', 'admin:dashboard']}
      requireAll={false}
      fallback={fallback}
      showFallback={!!fallback}
    >
      {children}
    </PermissionGate>
  );
}

export function ContentManagerOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate 
      permissions={['content:create', 'content:update', 'content:delete']}
      requireAll={true}
      fallback={fallback}
      showFallback={!!fallback}
    >
      {children}
    </PermissionGate>
  );
}

export function UserManagerOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <PermissionGate 
      permissions={['users:create', 'users:update', 'users:delete']}
      requireAll={false}
      fallback={fallback}
      showFallback={!!fallback}
    >
      {children}
    </PermissionGate>
  );
}