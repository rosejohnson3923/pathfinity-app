/**
 * ProgressTile Component
 * Displays overall progress through scenarios and skills
 */

import React, { useState, useEffect, useRef } from 'react';
import styles from './ProgressTile.module.css';

export interface ProgressTileProps {
  progress: {
    currentScenario: number;
    totalScenarios: number;
    completedScenarios: number;
    currentSkill?: {
      name: string;
      subject: string;
      progress: number; // 0-100
    };
    overallProgress?: {
      completedSkills: number;
      totalSkills: number;
      streak?: number;
      badges?: string[];
    };
  };
  display?: 'minimal' | 'detailed' | 'full';
  showMilestones?: boolean;
  gradeLevel?: string;
}

export const ProgressTile: React.FC<ProgressTileProps> = ({
  progress,
  display = 'detailed',
  showMilestones = true,
  gradeLevel = '6'
}) => {
  // Track previous values for animations
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevCompletedRef = useRef(progress.completedScenarios);
  
  // Determine grade category for age-appropriate styling
  const getGradeCategory = () => {
    if (['K', '1', '2'].includes(gradeLevel)) return styles.gradeK2;
    if (['3', '4', '5'].includes(gradeLevel)) return styles.grade35;
    if (['6', '7', '8'].includes(gradeLevel)) return styles.grade68;
    return styles.grade912;
  };

  // Calculate percentages
  const scenarioProgress = Math.round((progress.completedScenarios / progress.totalScenarios) * 100);
  const overallSkillProgress = progress.overallProgress 
    ? Math.round((progress.overallProgress.completedSkills / progress.overallProgress.totalSkills) * 100)
    : 0;
  
  // Animate progress changes
  useEffect(() => {
    // Check if we completed a new scenario
    if (progress.completedScenarios > prevCompletedRef.current) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
      prevCompletedRef.current = progress.completedScenarios;
    }
    
    // Animate progress bar
    const targetProgress = scenarioProgress;
    const duration = 800; // ms
    const steps = 30;
    const increment = (targetProgress - animatedProgress) / steps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < steps) {
        setAnimatedProgress(prev => prev + increment);
        currentStep++;
      } else {
        setAnimatedProgress(targetProgress);
        clearInterval(interval);
      }
    }, duration / steps);
    
    return () => clearInterval(interval);
  }, [scenarioProgress, progress.completedScenarios]);

  // Get milestone message
  const getMilestoneMessage = () => {
    if (scenarioProgress === 100) return "🎉 All scenarios complete!";
    if (scenarioProgress >= 75) return "🌟 Almost there!";
    if (scenarioProgress >= 50) return "⭐ Halfway done!";
    if (scenarioProgress >= 25) return "💫 Great start!";
    return "🚀 Let's begin!";
  };

  // Render minimal display
  if (display === 'minimal') {
    return (
      <div className={`${styles.progressTile} ${styles.minimal} ${getGradeCategory()}`}>
        <div className={styles.minimalBar}>
          <div 
            className={styles.minimalProgress}
            style={{ width: `${scenarioProgress}%` }}
          />
        </div>
        <span className={styles.minimalText}>
          {progress.completedScenarios}/{progress.totalScenarios}
        </span>
      </div>
    );
  }

  return (
    <div className={`${styles.progressTile} ${styles[display]} ${getGradeCategory()}`}>
      {/* Header */}
      <div className={styles.header}>
        {progress.overallProgress?.streak && progress.overallProgress.streak > 0 && (
          <div className={styles.streak}>
            <span className={styles.streakIcon}>🔥</span>
            <span className={styles.streakNumber}>{progress.overallProgress.streak}</span>
            <span className={styles.streakLabel}>day streak!</span>
          </div>
        )}
      </div>

      {/* Current Scenario Progress */}
      <div className={styles.scenarioSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionIcon}>📍</span>
          <span className={styles.sectionTitle}>Current Scenario</span>
          <span className={styles.sectionValue}>
            {progress.currentScenario} of {progress.totalScenarios}
          </span>
        </div>
        
        <div className={`${styles.progressBar} ${showCelebration ? styles.celebrating : ''}`}>
          <div 
            className={styles.progressFill}
            style={{ width: `${animatedProgress}%` }}
          >
            <span className={styles.progressPercentage}>{Math.round(animatedProgress)}%</span>
          </div>
        </div>

        {/* Scenario dots */}
        <div className={styles.scenarioDots}>
          {Array.from({ length: progress.totalScenarios }, (_, index) => (
            <div
              key={index}
              className={`${styles.dot} ${
                index < progress.completedScenarios
                  ? styles.dotCompleted
                  : index === progress.completedScenarios
                  ? styles.dotCurrent
                  : styles.dotUpcoming
              }`}
            >
              {index < progress.completedScenarios && '✓'}
              {index === progress.completedScenarios && (
                <span className={styles.dotPulse} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Skill Progress (if detailed or full) */}
      {progress.currentSkill && display !== 'minimal' && (
        <div className={styles.skillSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📚</span>
            <span className={styles.sectionTitle}>{progress.currentSkill.subject}</span>
          </div>
          <div className={styles.skillName}>{progress.currentSkill.name}</div>
          <div className={styles.skillBar}>
            <div 
              className={styles.skillProgress}
              style={{ width: `${progress.currentSkill.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Overall Progress (if full display) */}
      {progress.overallProgress && display === 'full' && (
        <div className={styles.overallSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🎯</span>
            <span className={styles.sectionTitle}>Daily Progress</span>
          </div>
          
          <div className={styles.overallStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{progress.overallProgress.completedSkills}</span>
              <span className={styles.statLabel}>Skills Complete</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>{progress.overallProgress.totalSkills}</span>
              <span className={styles.statLabel}>Total Skills</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statValue}>{overallSkillProgress}%</span>
              <span className={styles.statLabel}>Complete</span>
            </div>
          </div>

          {/* Badges (if any) */}
          {progress.overallProgress.badges && progress.overallProgress.badges.length > 0 && (
            <div className={styles.badgesSection}>
              <div className={styles.badgesHeader}>
                <span className={styles.badgesIcon}>🏆</span>
                <span className={styles.badgesTitle}>Earned Badges</span>
              </div>
              <div className={styles.badgesList}>
                {progress.overallProgress.badges.map((badge, index) => (
                  <div key={index} className={styles.badge}>
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Milestone message */}
      {showMilestones && (
        <div className={styles.milestone}>
          <span className={styles.milestoneMessage}>{getMilestoneMessage()}</span>
        </div>
      )}
    </div>
  );
};