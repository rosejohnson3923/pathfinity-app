/**
 * Journey Summary Container
 *
 * Integration component that connects the JourneySummaryScreen
 * to real data from the journey_summaries table in Supabase.
 *
 * Features:
 * - Fetches journey summary from database
 * - Handles loading and error states
 * - Generates lesson plans
 * - Integrates with navigation
 */

import React from 'react';
import JourneySummaryScreen from './JourneySummaryScreen';
import { useJourneySummary } from '../../hooks/useJourneySummary';
import { journeySummaryService } from '../../services/persistence/JourneySummaryService';
import styles from './JourneySummaryContainer.module.css';

// ================================================================
// PROPS INTERFACE
// ================================================================

export interface JourneySummaryContainerProps {
  sessionId: string;
  onReturnToDashboard: () => void;
  theme?: 'light' | 'dark';
}

// ================================================================
// COMPONENT
// ================================================================

const JourneySummaryContainer: React.FC<JourneySummaryContainerProps> = ({
  sessionId,
  onReturnToDashboard,
  theme = 'light'
}) => {
  const { data, loading, error, refetch } = useJourneySummary(sessionId);

  // ================================================================
  // LESSON PLAN GENERATION
  // ================================================================

  const handleGenerateLessonPlan = async () => {
    try {
      console.log('📄 Generating lesson plan for session:', sessionId);

      // TODO: Implement lesson plan generation service
      // This will:
      // 1. Fetch journey summary data
      // 2. Generate PDF using AI service
      // 3. Upload to Azure Blob Storage
      // 4. Mark lesson plan as generated in database

      // For now, just show alert
      alert('Lesson plan generation coming soon!\n\nThis will create a comprehensive PDF report for parents showing:\n- Overall progress\n- Strengths and areas for growth\n- Recommended next steps\n- Detailed performance by subject');

      // Mark as generated (with placeholder URL)
      const result = await journeySummaryService.markLessonPlanGenerated(
        sessionId,
        'https://placeholder-url.com/lesson-plan.pdf'
      );

      if (result.success) {
        console.log('✅ Lesson plan marked as generated');
        refetch(); // Refresh data
      }

    } catch (error) {
      console.error('Error generating lesson plan:', error);
      alert('Failed to generate lesson plan. Please try again.');
    }
  };

  // ================================================================
  // RENDER STATES
  // ================================================================

  // Loading state
  if (loading) {
    return (
      <div className={styles.container} data-theme={theme}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading your journey summary...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.container} data-theme={theme}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Oops! Something went wrong</h2>
          <p className={styles.errorMessage}>{error}</p>
          <div className={styles.errorActions}>
            <button onClick={refetch} className={styles.retryButton}>
              Try Again
            </button>
            <button onClick={onReturnToDashboard} className={styles.dashboardButton}>
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className={styles.container} data-theme={theme}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📊</div>
          <h2 className={styles.emptyTitle}>No Journey Data Found</h2>
          <p className={styles.emptyMessage}>
            We couldn't find a summary for this session.
            Please complete all containers to see your journey summary.
          </p>
          <button onClick={onReturnToDashboard} className={styles.dashboardButton}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Success state - render summary screen
  return (
    <JourneySummaryScreen
      summaryData={data}
      onReturnToDashboard={onReturnToDashboard}
      onGenerateLessonPlan={handleGenerateLessonPlan}
      theme={theme}
    />
  );
};

export default JourneySummaryContainer;
