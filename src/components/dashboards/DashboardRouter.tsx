import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
// Use the new modal-first Student Dashboard
import { StudentDashboard } from '../../screens/modal-migration/StudentDashboard';
import { TeacherDashboard } from './TeacherDashboard';
import { AdminDashboard } from './AdminDashboard';
import { SubscriptionPage } from '../../pages/SubscriptionPage';
import { Unauthorized } from '../auth/Unauthorized';

export function DashboardRouter() {
  const { user, loading, tenant } = useAuthContext();
  const path = window.location.pathname;

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
    return <Navigate to="/app/login" replace />;
  }

  // Check if we're on the subscription page
  if (path.includes('/subscription')) {
    // Only admins can access subscription page
    if (user.role === 'school_admin' || user.role === 'district_admin' || user.role === 'product_admin') {
      return <SubscriptionPage />;
    } else {
      return <Unauthorized />;
    }
  }

  // Route to the appropriate dashboard based on user role
  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'educator':
    case 'parent':
      return <TeacherDashboard />;
    case 'school_admin':
    case 'district_admin':
    case 'product_admin':
      return <AdminDashboard />;
    default:
      return <Unauthorized />;
  }
}