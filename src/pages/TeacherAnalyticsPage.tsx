/**
 * TEACHER ANALYTICS PAGE
 * Main page for AI-powered teacher analytics dashboard
 */

import React, { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import TeacherAnalyticsDashboard from '../components/analytics/TeacherAnalyticsDashboard';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import '../design-system/tokens/colors.css';
import '../design-system/tokens/spacing.css';
import '../design-system/tokens/borders.css';
import '../design-system/tokens/typography.css';
import '../design-system/tokens/shadows.css';
import '../design-system/tokens/dashboard.css';

const TeacherAnalyticsPage: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [isBackHovered, setIsBackHovered] = useState(false);

  // Only allow educators and admins to access analytics
  if (!user || !['educator', 'school_admin', 'district_admin', 'product_admin'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--dashboard-bg-primary)'
    }}>
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: 'var(--space-4) var(--space-4) var(--space-8)'
      }}>
        {/* Header with Back Button */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <button
            onClick={() => navigate('/app/dashboard')}
            onMouseEnter={() => setIsBackHovered(true)}
            onMouseLeave={() => setIsBackHovered(false)}
            style={{
              marginBottom: 'var(--space-4)',
              color: isBackHovered ? 'var(--dashboard-text-primary)' : 'var(--dashboard-text-secondary)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2)',
              transition: 'color 0.2s ease'
            }}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
            Back to Dashboard
          </button>
          <h1 style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--dashboard-text-primary)'
          }}>
            Teacher Analytics
          </h1>
          <p style={{
            color: 'var(--dashboard-text-secondary)',
            marginTop: 'var(--space-2)',
            fontSize: 'var(--text-base)'
          }}>
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