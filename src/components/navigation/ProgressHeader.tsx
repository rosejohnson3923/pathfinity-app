/**
 * Comprehensive Progress Header Component
 * Unified header for all containers with progress tracking, navigation, and theme controls
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { themeService } from '../../services/themeService';
import { ChevronLeft, LogOut, Sun, Moon, BookOpen, Beaker, Globe, Calculator, Settings } from 'lucide-react';
import styles from './ProgressHeader.module.css';

interface ProgressHeaderProps {
  // Content Information
  title?: string;
  subtitle?: string;
  career?: string;
  skill?: string;
  subject?: string;
  containerType?: 'LEARN' | 'DISCOVER' | 'EXPERIENCE';
  
  // Progress Tracking
  progress?: number; // 0-100
  currentPhase?: string;
  totalPhases?: number;
  currentSubjectIndex?: number;
  totalSubjects?: number;
  
  // Multi-Subject Support (for MultiSubjectContainer)
  subjects?: {
    name: string;
    code: string;
    icon?: React.ReactNode;
    completed?: boolean;
    active?: boolean;
  }[];
  onSubjectChange?: (subjectCode: string) => void;
  
  // Navigation
  showBackButton?: boolean;
  backPath?: string;
  onBack?: () => void;
  
  // Theme Toggle
  showThemeToggle?: boolean; // Only show in StudentDashboard
  
  // Testing/Dev Features
  showSkipButton?: boolean;
  onSkip?: () => void;
  
  // Display Options
  hideOnLoading?: boolean;
  isLoading?: boolean;
  variant?: 'default' | 'minimal' | 'subjects';
  
  // Settings
  onSettingsClick?: () => void;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  title,
  subtitle,
  career,
  skill,
  subject,
  containerType,
  progress = 0,
  currentPhase,
  totalPhases,
  currentSubjectIndex,
  totalSubjects = 4,
  subjects,
  onSubjectChange,
  showBackButton = true,
  backPath = '/student-dashboard',
  onBack,
  showThemeToggle = false,
  showSkipButton = false,
  onSkip,
  hideOnLoading = true,
  isLoading = false,
  variant = 'default',
  onSettingsClick
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuthContext();
  const { theme } = useTheme();
  const [isThemeChanging, setIsThemeChanging] = useState(false);

  // Don't show header during loading if hideOnLoading is true
  if (hideOnLoading && isLoading) {
    return null;
  }

  // Determine if we're in the dashboard
  const isInDashboard = location.pathname === '/student-dashboard' || 
                       location.pathname === '/dashboard';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(backPath);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleThemeToggle = () => {
    if (!showThemeToggle || !isInDashboard) return;
    
    setIsThemeChanging(true);
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    themeService.setTheme(newTheme, 'ProgressHeader');
    
    setTimeout(() => setIsThemeChanging(false), 300);
  };

  const getSubjectIcon = (subjectCode: string) => {
    switch(subjectCode.toLowerCase()) {
      case 'math':
        return <Calculator className={styles.subjectIcon} />;
      case 'ela':
      case 'english':
        return <BookOpen className={styles.subjectIcon} />;
      case 'science':
        return <Beaker className={styles.subjectIcon} />;
      case 'social_studies':
      case 'social':
        return <Globe className={styles.subjectIcon} />;
      default:
        return null;
    }
  };

  // Render subject tabs for MultiSubjectContainer
  const renderSubjectTabs = () => {
    if (!subjects || subjects.length === 0) return null;

    return (
      <div className={styles.subjectTabs}>
        {subjects.map((subj) => (
          <button
            key={subj.code}
            className={`${styles.subjectTab} ${subj.active ? styles.active : ''} ${subj.completed ? styles.completed : ''}`}
            onClick={() => onSubjectChange?.(subj.code)}
            disabled={subj.completed}
          >
            {subj.icon || getSubjectIcon(subj.code)}
            <span className={styles.subjectName}>{subj.name}</span>
            {subj.completed && (
              <span className={styles.checkmark}>✓</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  // Render progress bar
  const renderProgressBar = () => {
    if (variant === 'subjects' || progress === undefined) return null;

    return (
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
        {currentPhase && (
          <span className={styles.phaseText}>
            {currentPhase} {totalPhases && `(${Math.ceil(progress / (100 / totalPhases))}/${totalPhases})`}
          </span>
        )}
      </div>
    );
  };

  return (
    <header className={`${styles.progressHeader} ${styles[variant]}`} data-theme={theme}>
      <div className={styles.headerContent}>
        {/* Left Section: Navigation */}
        <div className={styles.leftSection}>
          {showBackButton && (
            <button
              className={styles.backButton}
              onClick={handleBack}
              aria-label="Back to dashboard"
            >
              <ChevronLeft />
              <span className={styles.backText}>Back</span>
            </button>
          )}
        </div>

        {/* Center Section: Title and Progress */}
        <div className={styles.centerSection}>
          {/* Container Type Badge */}
          {containerType && (
            <div className={styles.containerBadge}>
              <span className={styles.containerLabel}>{containerType}</span>
            </div>
          )}
          
          {/* Main Content Area */}
          <div className={styles.headerContent}>
            {/* Skill Info Only - Subject shown in tabs */}
            <div className={styles.learningInfo}>
              {skill && (
                <div className={styles.skillSection}>
                  <span className={styles.infoLabel}>Skill:</span>
                  <span className={styles.skillName}>{skill}</span>
                </div>
              )}
              
              {/* Progress Indicator for Multi-Subject */}
              {currentSubjectIndex !== undefined && totalSubjects && (
                <div className={styles.progressIndicator}>
                  <span className={styles.progressText}>
                    {currentSubjectIndex + 1} of {totalSubjects} subjects
                  </span>
                </div>
              )}
            </div>
            
            {/* Subject Tabs for variant="subjects" */}
            {variant === 'subjects' && subjects && (
              <div className={styles.subjectTabsContainer}>
                {renderSubjectTabs()}
              </div>
            )}
            
            {/* Progress Bar */}
            {renderProgressBar()}
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className={styles.rightSection}>
          {/* Theme Toggle - Only visible in dashboard */}
          {showThemeToggle && isInDashboard && (
            <button
              className={`${styles.themeToggle} ${isThemeChanging ? styles.changing : ''}`}
              onClick={handleThemeToggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className={styles.icon} />
              ) : (
                <Moon className={styles.icon} />
              )}
            </button>
          )}

          {/* Skip Button (Dev/Testing) */}
          {showSkipButton && onSkip && (
            <button
              className={styles.skipButton}
              onClick={onSkip}
              aria-label="Skip to next section"
            >
              Skip →
            </button>
          )}

          {/* Settings Button */}
          <button
            className={styles.settingsButton}
            onClick={() => {
              // If onSettingsClick is provided, use it; otherwise try to navigate to dashboard with settings
              if (onSettingsClick) {
                onSettingsClick();
              } else {
                // Navigate to dashboard and open settings
                navigate('/student-dashboard', { state: { openSettings: true } });
              }
            }}
            aria-label="Settings"
            title="Settings"
          >
            <Settings className={styles.icon} />
          </button>

          {/* Logout Button */}
          <button
            className={styles.logoutButton}
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className={styles.icon} />
            <span className={styles.logoutText}>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default ProgressHeader;