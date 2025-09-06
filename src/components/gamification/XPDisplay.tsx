/**
 * XP Display Component
 * Shows current XP, level, and progress for grades 3+
 */

import React from 'react';
import styles from './XPDisplay.module.css';

interface XPDisplayProps {
  xp: number;
  level: number;
  nextLevelXp: number;
  showXP: boolean;
  theme?: string;
}

export const XPDisplay: React.FC<XPDisplayProps> = ({
  xp,
  level,
  nextLevelXp,
  showXP,
  theme = 'light'
}) => {
  // Don't show for K-2 grades
  if (!showXP) return null;

  const progressPercentage = (xp / nextLevelXp) * 100;

  return (
    <div className={styles.xpDisplay} data-theme={theme}>
      {/* Level Badge */}
      <div className={styles.levelSection}>
        <div className={styles.levelInfo}>
          <div className={styles.levelBadge}>
            {level}
          </div>
          <span className={styles.levelText}>
            Level {level}
          </span>
        </div>
        <div className={styles.xpAmount}>
          {xp} XP
        </div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className={styles.progressText}>
          <span>{xp} XP</span>
          <span>{nextLevelXp} XP</span>
        </div>
      </div>
    </div>
  );
};