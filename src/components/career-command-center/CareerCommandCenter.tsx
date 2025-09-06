/**
 * Career Command Center
 * Main container for career-focused transition screens between Learn, Experience, and Discover
 * Features three adaptive panels that work for all grade levels
 */

import React, { useState, useEffect } from 'react';
import { HolographicMissionTable } from './HolographicMissionTable';
import { IntelligenceWall } from './IntelligenceWall';
import './CareerCommandCenter.css';

interface CareerCommandCenterProps {
  studentGrade: string;
  selectedCareer: string;
  containerTransition: 'learn-to-experience' | 'experience-to-discover' | 'discover-complete';
  onContinue: () => void;
  theme?: 'light' | 'dark';
}

export const CareerCommandCenter: React.FC<CareerCommandCenterProps> = ({
  studentGrade,
  selectedCareer,
  containerTransition,
  onContinue,
  theme = 'dark'
}) => {
  const [phase, setPhase] = useState<'entering' | 'active' | 'exiting'>('entering');
  const [timeRemaining, setTimeRemaining] = useState(15); // 15 second auto-advance

  // Determine grade level category
  const getGradeLevel = (): 'elementary' | 'middle' | 'high' => {
    const grade = studentGrade.toUpperCase();
    if (grade === 'K' || parseInt(grade) <= 5) return 'elementary';
    if (parseInt(grade) <= 8) return 'middle';
    return 'high';
  };

  const gradeLevel = getGradeLevel();

  // Auto-advance timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Entry animation
  useEffect(() => {
    setTimeout(() => setPhase('active'), 100);
  }, []);

  const handleContinue = () => {
    setPhase('exiting');
    setTimeout(() => onContinue(), 500);
  };

  // Get transition message based on container transition
  const getTransitionMessage = () => {
    switch (containerTransition) {
      case 'learn-to-experience':
        return {
          title: 'Great Learning!',
          subtitle: 'Ready to Experience Your Career',
          nextAction: 'Experience Activities'
        };
      case 'experience-to-discover':
        return {
          title: 'Excellent Experience!',
          subtitle: 'Time to Discover More',
          nextAction: 'Discovery Mode'
        };
      case 'discover-complete':
        return {
          title: 'Mission Complete!',
          subtitle: 'You\'ve Mastered Today\'s Skills',
          nextAction: 'Review Progress'
        };
      default:
        return {
          title: 'Continuing Journey',
          subtitle: 'Next Challenge Awaits',
          nextAction: 'Continue'
        };
    }
  };

  const transitionMessage = getTransitionMessage();

  return (
    <div className={`career-command-center ${theme} ${phase}`}>
      {/* Animated Background */}
      <div className="command-center-background">
        <div className="grid-overlay" />
        <div className="pulse-rings" />
      </div>

      {/* Main Content */}
      <div className="command-center-content">
        {/* Header */}
        <div className="command-center-header">
          <h1 className="transition-title">{transitionMessage.title}</h1>
          <h2 className="transition-subtitle">{transitionMessage.subtitle}</h2>
          <div className="career-badge">
            <span className="career-icon">💼</span>
            <span className="career-name">{selectedCareer}</span>
          </div>
        </div>

        {/* Holographic Mission Table */}
        <HolographicMissionTable
          career={selectedCareer}
          gradeLevel={gradeLevel}
          transitionType={containerTransition}
          nextAction={transitionMessage.nextAction}
        />

        {/* Intelligence Wall with Three Panels */}
        <IntelligenceWall
          career={selectedCareer}
          gradeLevel={gradeLevel}
          studentGrade={studentGrade}
        />

        {/* Continue Button and Timer */}
        <div className="command-center-footer">
          <button 
            className="continue-button"
            onClick={handleContinue}
          >
            <span className="button-text">Continue to {transitionMessage.nextAction}</span>
            <span className="button-arrow">→</span>
          </button>
          
          <div className="auto-advance-timer">
            <span className="timer-text">Auto-advancing in</span>
            <span className="timer-count">{timeRemaining}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerCommandCenter;