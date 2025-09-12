/**
 * ScenarioTile Component
 * Displays scenario content with career context and visual elements
 */

import React from 'react';
import { useTheme } from '../../../hooks/useTheme';
import styles from './ScenarioTile.module.css';

export interface ScenarioTileProps {
  scenario: {
    description: string;
    visual?: string;
    careerContext: string;
    hint?: string;
  };
  scenarioNumber: number;
  totalScenarios: number;
  career: {
    id?: string;
    name: string;
    icon?: string;
  };
  skill: {
    id?: string;
    name: string;
    description?: string;
  };
  gradeLevel: string;
  isActive?: boolean;
  showHint?: boolean;
}

export const ScenarioTile: React.FC<ScenarioTileProps> = ({
  scenario,
  scenarioNumber,
  totalScenarios,
  career,
  skill,
  gradeLevel,
  isActive = true,
  showHint = false
}) => {
  const { theme } = useTheme();
  
  // Get grade-appropriate styling
  const getGradeStyles = () => {
    const baseClass = styles.scenarioTile;
    const gradeClass = getGradeClass(gradeLevel);
    const activeClass = isActive ? styles.active : styles.inactive;
    const themeClass = theme === 'dark' ? styles.dark : styles.light;
    
    return `${baseClass} ${gradeClass} ${activeClass} ${themeClass}`;
  };
  
  const getGradeClass = (grade: string) => {
    if (grade === 'K' || grade === '1' || grade === '2') {
      return styles.gradeK2; // Large text, lots of visuals
    } else if (grade === '3' || grade === '4' || grade === '5') {
      return styles.grade35; // Balanced text and visuals
    } else if (grade === '6' || grade === '7' || grade === '8') {
      return styles.grade68; // More text, some visuals
    } else {
      return styles.grade912; // Professional, mostly text
    }
  };
  
  // Parse visual content (could be emoji or description)
  const renderVisual = () => {
    if (!scenario.visual) return null;
    
    // Check if it's an emoji or series of emojis
    const isEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u.test(scenario.visual);
    
    if (isEmoji) {
      return (
        <div className={styles.visualEmoji}>
          {scenario.visual}
        </div>
      );
    }
    
    // Otherwise treat as description for an image placeholder
    return (
      <div className={styles.visualPlaceholder}>
        <span className={styles.visualIcon}>🖼️</span>
        <span className={styles.visualDescription}>{scenario.visual}</span>
      </div>
    );
  };
  
  return (
    <div className={getGradeStyles()}>
      {/* Header with scenario progress */}
      <div className={styles.header}>
        <div className={styles.progressIndicator}>
          <span className={styles.scenarioLabel}>Scenario</span>
          <span className={styles.scenarioNumber}>{scenarioNumber}</span>
          <span className={styles.scenarioOf}>of</span>
          <span className={styles.scenarioTotal}>{totalScenarios}</span>
        </div>
        
        <div className={styles.careerBadge}>
          <span className={styles.careerIcon}>{career.icon || '💼'}</span>
          <span className={styles.careerName}>{career.name}</span>
        </div>
      </div>
      
      {/* Main content area */}
      <div className={styles.content}>
        {/* Scenario description */}
        <div className={styles.description}>
          <p className={styles.descriptionText}>
            {scenario.description}
          </p>
        </div>
        
        {/* Visual element if present */}
        {scenario.visual && (
          <div className={styles.visualContainer}>
            {renderVisual()}
          </div>
        )}
        
        {/* Career context */}
        <div className={styles.careerContext}>
          <div className={styles.contextHeader}>
            <span className={styles.contextIcon}>🎯</span>
            <span className={styles.contextLabel}>How {career.name}s use {skill.name}:</span>
          </div>
          <p className={styles.contextText}>
            {scenario.careerContext}
          </p>
        </div>
        
        {/* Hint section (if enabled) */}
        {showHint && scenario.hint && (
          <div className={styles.hintSection}>
            <div className={styles.hintHeader}>
              <span className={styles.hintIcon}>💡</span>
              <span className={styles.hintLabel}>Hint:</span>
            </div>
            <p className={styles.hintText}>
              {scenario.hint}
            </p>
          </div>
        )}
      </div>
      
      {/* Progress dots at bottom */}
      <div className={styles.progressDots}>
        {Array.from({ length: totalScenarios }, (_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${
              i < scenarioNumber ? styles.dotCompleted :
              i === scenarioNumber - 1 ? styles.dotCurrent :
              styles.dotUpcoming
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Helper component for intro scenario
export const ScenarioIntroTile: React.FC<{
  title: string;
  welcome: string;
  companionMessage: string;
  howToUse: string;
  career: { name: string; icon?: string };
  skill: { name: string };
  gradeLevel: string;
}> = ({ title, welcome, companionMessage, howToUse, career, skill, gradeLevel }) => {
  const { theme } = useTheme();
  
  const getGradeClass = (grade: string) => {
    if (grade === 'K' || grade === '1' || grade === '2') {
      return styles.gradeK2;
    } else if (grade === '3' || grade === '4' || grade === '5') {
      return styles.grade35;
    } else if (grade === '6' || grade === '7' || grade === '8') {
      return styles.grade68;
    } else {
      return styles.grade912;
    }
  };
  
  return (
    <div className={`${styles.introTile} ${getGradeClass(gradeLevel)} ${theme === 'dark' ? styles.dark : ''}`}>
      <div className={styles.introHeader}>
        <h1 className={styles.introTitle}>{title}</h1>
        <div className={styles.introBadges}>
          <span className={styles.careerBadge}>
            {career.icon || '💼'} {career.name}
          </span>
          <span className={styles.skillBadge}>
            📚 {skill.name}
          </span>
        </div>
      </div>
      
      <div className={styles.introContent}>
        <div className={styles.welcomeSection}>
          <h2 className={styles.sectionTitle}>Welcome!</h2>
          <p className={styles.welcomeText}>{welcome}</p>
        </div>
        
        <div className={styles.companionSection}>
          <h2 className={styles.sectionTitle}>Your Guide Says:</h2>
          <p className={styles.companionText}>{companionMessage}</p>
        </div>
        
        <div className={styles.howToSection}>
          <h2 className={styles.sectionTitle}>How This Works:</h2>
          <p className={styles.howToText}>{howToUse}</p>
        </div>
      </div>
    </div>
  );
};