/**
 * TEACHER ANALYTICS PAGE
 * Main page for AI-powered teacher analytics dashboard
 */

import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import TeacherAnalyticsDashboard from '../components/analytics/TeacherAnalyticsDashboard';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

const TeacherAnalyticsPage: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Only allow educators and admins to access analytics
  if (!user || !['educator', 'school_admin', 'district_admin', 'product_admin'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => navigate('/app/dashboard')}
            variant="ghost"
            className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Teacher Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            AI-powered insights to enhance your teaching effectiveness
          </p>
        </div>
        
        <TeacherAnalyticsDashboard 
          teacherId={user.role === 'educator' ? user.id : undefined}
        />
      </div>
    </div>
  );
};

export default TeacherAnalyticsPage;