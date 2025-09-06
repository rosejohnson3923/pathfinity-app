/**
 * Shared Navigation Header for AI Containers
 * Provides back navigation and logout functionality
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { companionVoiceoverService } from '../../services/companionVoiceoverService';
import { voiceManagerService } from '../../services/voiceManagerService';
import styles from '../../styles/shared/components/ContainerNavigationHeader.module.css';

interface ContainerNavigationHeaderProps {
  onBack: () => void;
  title?: string;
  theme?: 'light' | 'dark';
  progress?: number; // 0-100
  currentSubject?: string;
  subjects?: Array<{ name: string; icon: string; active?: boolean }>;
  score?: number;
  // New structured title props
  career?: string;
  skill?: string;
  subject?: string;
  // Testing navigation
  onSkipToExperience?: () => void;
}

export const ContainerNavigationHeader: React.FC<ContainerNavigationHeaderProps> = ({
  onBack,
  title = 'Learning Activity',
  theme = 'light',
  progress,
  currentSubject,
  subjects,
  score,
  career,
  skill,
  subject,
  onSkipToExperience
}) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      // Stop all speech immediately when logging out
      companionVoiceoverService.stopCurrent();
      voiceManagerService.stopSpeaking();
      
      // Clear any beforeunload handlers that might cause confirmation dialogs
      window.onbeforeunload = null;
      await signOut();
      navigate('/app/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate even if logout fails
      navigate('/app/login');
    }
  };

  // Get default subject icons if not provided
  const getSubjectIcon = (subject: string) => {
    const icons: Record<string, string> = {
      'Math': '🔢',
      'ELA': '📚',
      'Science': '🔬',
      'Social Studies': '🌍'
    };
    return icons[subject] || '📖';
  };

  return (
    <div 
      className={styles.containerNavHeader}
      data-theme={theme}
    >
      {/* Left Section */}
      <div className={styles.leftSection}>
        <button
          onClick={onBack}
          className={styles.backButton}
        >
          <span className={styles.backIcon}>←</span>
          <span>Back to Lobby</span>
        </button>
        
        {/* Use structured title if career/skill provided, otherwise use title string */}
        {(career || skill) ? (
          <div className={styles.structuredTitle}>
            {career && (
              <div className={styles.titleCareer}>
                <span className={styles.titleLabel}>Exploring</span>
                <span className={styles.titleValue}>{career}</span>
              </div>
            )}
            {skill && (
              <div className={styles.titleSkill}>
                <span className={styles.titleLabel}>through</span>
                <span className={styles.titleValue}>{skill}</span>
              </div>
            )}
            {subject && (
              <div className={styles.titleSubject}>
                <span className={styles.titleValue}>{subject} Foundations</span>
              </div>
            )}
          </div>
        ) : (
          <h3 className={styles.title}>
            {title}
          </h3>
        )}
      </div>

      {/* Center Section - Progress & Subjects */}
      {(progress !== undefined || subjects) && (
        <div className={styles.centerSection}>
          {progress !== undefined && (
            <div className={styles.progressInfo}>
              <span className={styles.progressLabel}>Progress:</span>
              <span className={styles.progressValue}>{Math.round(progress)}%</span>
            </div>
          )}
          
          {subjects && subjects.length > 0 && (
            <div className={styles.subjectPills}>
              {subjects.map((subject, index) => (
                <div 
                  key={index}
                  className={`${styles.subjectPill} ${subject.active ? styles.active : ''}`}
                >
                  <span className={styles.subjectIcon}>
                    {subject.icon || getSubjectIcon(subject.name)}
                  </span>
                  <span className={styles.subjectName}>{subject.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Right Section */}
      <div className={styles.rightSection}>
        {score !== undefined && (
          <div className={styles.scoreDisplay}>
            <span className={styles.scoreLabel}>Score:</span>
            <span className={styles.scoreValue}>{score}</span>
          </div>
        )}
        
        {onSkipToExperience && (
          <button
            onClick={onSkipToExperience}
            className={styles.skipButton}
            title="Skip to Experience (Testing)"
          >
            <span>⏭️</span>
            <span>Skip to Experience</span>
          </button>
        )}
        
        <button
          onClick={handleLogout}
          className={styles.logoutButton}
        >
          <span>🚪</span>
          <span>Log Out</span>
        </button>
      </div>
      
      {/* Progress Bar (visual indicator at bottom) */}
      {progress !== undefined && (
        <div 
          className={styles.progressBarFill}
          style={{ width: `${progress}%` }}
        />
      )}
    </div>
  );
};