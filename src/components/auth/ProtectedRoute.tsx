import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { isDemoUser } from '../../utils/demoUserDetection';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireTenant?: boolean;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, requireTenant = true, allowedRoles }: ProtectedRouteProps) {
  const { user, tenant, loading } = useAuthContext();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/app/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user.role || !allowedRoles.includes(user.role)) {
      return <Navigate to="/app/unauthorized" state={{ from: location }} replace />;
    }
  }

  // If tenant is required but not selected, redirect to login
  // Skip tenant requirement for demo users
  if (requireTenant && !tenant && !isDemoUser(user)) {
    console.log('🔍 ProtectedRoute: Redirecting to login for non-demo user');
    return <Navigate to="/app/login" state={{ from: location }} replace />;
  }

  // Log demo user bypass
  if (requireTenant && !tenant && isDemoUser(user)) {
    console.log('🎯 ProtectedRoute: Bypassing tenant selection for demo user:', user?.email);
  }

  // Render children if authenticated and tenant requirements are met
  return <>{children}</>;
}