/**
 * DLCC (Discovered Live! Career Challenge) Page
 * Main page wrapper for the Executive Decision Maker game within Discovered Live! arcade
 * (Replaces deprecated card-based Career Challenge)
 */

import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ExecutiveDecisionIntegration } from '../components/discovered-live/ExecutiveDecisionIntegration';
import { mapGradeLevelToCategory } from '../services/ai-prompts/rules/ExecutiveDecisionRules';

export const CareerChallengePage: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Get user info
  const studentId = user?.user_id || 'demo-user';
  const studentName = user?.full_name || user?.email?.split('@')[0] || 'Player';

  // Get grade category from user's grade level
  let gradeCategory: 'elementary' | 'middle' | 'high' | undefined = undefined;
  if (user?.grade_level) {
    gradeCategory = mapGradeLevelToCategory(user.grade_level) as 'elementary' | 'middle' | 'high';
    console.log('🎓 User grade level (CareerChallengePage):', user.grade_level, '→ Category:', gradeCategory);
  }

  const handleExit = () => {
    // Return to Discovered Live! arcade
    navigate('/discovered-live');
  };

  return (
    <ExecutiveDecisionIntegration
      studentId={studentId}
      studentName={studentName}
      gradeCategory={gradeCategory}
      onExit={handleExit}
    />
  );
};

export default CareerChallengePage;