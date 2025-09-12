/**
 * AchievementTile Component
 * Displays XP, badges, streaks, and other gamification elements
 * Grade-appropriate celebration animations
 */

import React, { useState, useEffect } from 'react';
import styles from './AchievementTile.module.css';

export interface AchievementTileProps {
  type: 'xp' | 'badge' | 'streak' | 'milestone' | 'level' | 'complete';
  value?: number | string;
  title?: string;
  description?: string;
  icon?: string;
  showAnimation?: boolean;
  size?: 'small' | 'medium' | 'large';
  gradeLevel?: string;
  celebration?: 'confetti' | 'stars' | 'sparkle' | 'bounce';
  onAnimationComplete?: () => void;
}

export const AchievementTile: React.FC<AchievementTileProps> = ({
  type,
  value,
  title,
  description,
  icon,
  showAnimation = true,
  size = 'medium',
  gradeLevel = '6',
  celebration = 'stars',
  onAnimationComplete
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  
  // Animate number counting for XP
  useEffect(() => {
    if (type === 'xp' && typeof value === 'number' && showAnimation) {
      setIsAnimating(true);
      let current = 0;
      const increment = Math.ceil(value / 20);
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
          setIsAnimating(false);
          if (onAnimationComplete) {
            setTimeout(onAnimationComplete, 500);
          }
        } else {
          setDisplayValue(current);
        }
      }, 50);
      
      return () => clearInterval(interval);
    } else if (typeof value === 'number') {
      setDisplayValue(value);
    }
  }, [value, type, showAnimation]);
  
  // Get grade-specific styles
  const getGradeStyles = () => {
    if (['K', '1', '2'].includes(gradeLevel)) return styles.gradeK2;
    if (['3', '4', '5'].includes(gradeLevel)) return styles.grade35;
    if (['6', '7', '8'].includes(gradeLevel)) return styles.grade68;
    return styles.grade912;
  };
  
  // Get achievement icon
  const getAchievementIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'xp':
        return '⭐';
      case 'badge':
        return '🏆';
      case 'streak':
        return '🔥';
      case 'milestone':
        return '🎯';
      case 'level':
        return '📈';
      case 'complete':
        return '✅';
      default:
        return '🌟';
    }
  };
  
  // Get achievement title
  const getAchievementTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'xp':
        return 'XP Earned!';
      case 'badge':
        return 'New Badge!';
      case 'streak':
        return 'Streak!';
      case 'milestone':
        return 'Milestone!';
      case 'level':
        return 'Level Up!';
      case 'complete':
        return 'Complete!';
      default:
        return 'Achievement!';
    }
  };
  
  // Get achievement description
  const getAchievementDescription = () => {
    if (description) return description;
    
    switch (type) {
      case 'xp':
        return `You earned ${value} experience points!`;
      case 'badge':
        return `You unlocked the ${value} badge!`;
      case 'streak':
        return `${value} day learning streak!`;
      case 'milestone':
        return `You reached ${value}!`;
      case 'level':
        return `You're now level ${value}!`;
      case 'complete':
        return 'Challenge completed successfully!';
      default:
        return 'Great achievement!';
    }
  };
  
  // Render celebration particles
  const renderCelebration = () => {
    if (!showAnimation || !isAnimating) return null;
    
    switch (celebration) {
      case 'confetti':
        return (
          <div className={styles.celebrationOverlay}>
            {[...Array(10)].map((_, i) => (
              <span key={i} className={`${styles.confetti} ${styles[`confetti${i}`]}`}>
                {['🎊', '🎉', '✨'][i % 3]}
              </span>
            ))}
          </div>
        );
      case 'stars':
        return (
          <div className={styles.celebrationOverlay}>
            {[...Array(8)].map((_, i) => (
              <span key={i} className={`${styles.star} ${styles[`star${i}`]}`}>
                ⭐
              </span>
            ))}
          </div>
        );
      case 'sparkle':
        return (
          <div className={styles.celebrationOverlay}>
            {[...Array(12)].map((_, i) => (
              <span key={i} className={`${styles.sparkle} ${styles[`sparkle${i}`]}`}>
                ✨
              </span>
            ))}
          </div>
        );
      case 'bounce':
        return null; // Bounce is applied to the main element
      default:
        return null;
    }
  };
  
  // Render XP tile
  const renderXPTile = () => (
    <div className={`${styles.xpTile} ${showAnimation ? styles.animateIn : ''}`}>
      <div className={styles.xpIcon}>{getAchievementIcon()}</div>
      <div className={styles.xpValue}>
        {type === 'xp' && showAnimation ? (
          <>+{displayValue}</>
        ) : (
          <>+{value}</>
        )}
      </div>
      <div className={styles.xpLabel}>XP</div>
    </div>
  );
  
  // Render badge tile
  const renderBadgeTile = () => (
    <div className={`${styles.badgeTile} ${showAnimation ? styles.animateIn : ''}`}>
      <div className={styles.badgeIcon}>{getAchievementIcon()}</div>
      <div className={styles.badgeName}>{value || 'Achievement'}</div>
      <div className={styles.badgeDescription}>{getAchievementDescription()}</div>
    </div>
  );
  
  // Render streak tile
  const renderStreakTile = () => (
    <div className={`${styles.streakTile} ${showAnimation ? styles.animateIn : ''}`}>
      <div className={styles.streakIcon}>{getAchievementIcon()}</div>
      <div className={styles.streakValue}>{value}</div>
      <div className={styles.streakLabel}>Day Streak!</div>
    </div>
  );
  
  // Render milestone tile
  const renderMilestoneTile = () => (
    <div className={`${styles.milestoneTile} ${showAnimation ? styles.animateIn : ''}`}>
      <div className={styles.milestoneHeader}>
        <span className={styles.milestoneIcon}>{getAchievementIcon()}</span>
        <span className={styles.milestoneTitle}>{getAchievementTitle()}</span>
      </div>
      <div className={styles.milestoneContent}>
        <p className={styles.milestoneDescription}>{getAchievementDescription()}</p>
      </div>
    </div>
  );
  
  // Render level up tile
  const renderLevelTile = () => (
    <div className={`${styles.levelTile} ${showAnimation ? styles.animateIn : ''}`}>
      <div className={styles.levelUpAnimation}>
        <div className={styles.levelIcon}>{getAchievementIcon()}</div>
        <div className={styles.levelText}>LEVEL UP!</div>
      </div>
      <div className={styles.levelValue}>Level {value}</div>
      <div className={styles.levelMessage}>Amazing progress!</div>
    </div>
  );
  
  // Render completion tile
  const renderCompleteTile = () => (
    <div className={`${styles.completeTile} ${showAnimation ? styles.animateIn : ''}`}>
      <div className={styles.completeIcon}>{getAchievementIcon()}</div>
      <div className={styles.completeTitle}>{getAchievementTitle()}</div>
      <div className={styles.completeMessage}>{getAchievementDescription()}</div>
      {value && (
        <div className={styles.completeStats}>
          <span className={styles.statLabel}>Score:</span>
          <span className={styles.statValue}>{value}</span>
        </div>
      )}
    </div>
  );
  
  // Render appropriate tile type
  const renderTile = () => {
    switch (type) {
      case 'xp':
        return renderXPTile();
      case 'badge':
        return renderBadgeTile();
      case 'streak':
        return renderStreakTile();
      case 'milestone':
        return renderMilestoneTile();
      case 'level':
        return renderLevelTile();
      case 'complete':
        return renderCompleteTile();
      default:
        return renderBadgeTile();
    }
  };
  
  return (
    <div 
      className={`
        ${styles.achievementTile} 
        ${styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`]}
        ${getGradeStyles()}
        ${styles[`type${type.charAt(0).toUpperCase() + type.slice(1)}`]}
        ${celebration === 'bounce' && showAnimation ? styles.bounce : ''}
      `}
    >
      {renderTile()}
      {renderCelebration()}
    </div>
  );
};

// Helper component for displaying multiple achievements
export const AchievementList: React.FC<{
  achievements: Array<{
    type: AchievementTileProps['type'];
    value?: number | string;
    title?: string;
  }>;
  gradeLevel?: string;
}> = ({ achievements, gradeLevel }) => {
  return (
    <div className={styles.achievementList}>
      {achievements.map((achievement, index) => (
        <AchievementTile
          key={index}
          type={achievement.type}
          value={achievement.value}
          title={achievement.title}
          size="small"
          gradeLevel={gradeLevel}
          showAnimation={true}
        />
      ))}
    </div>
  );
};