/**
 * FeedbackTile Component
 * Displays user feedback, scores, and progress within scenarios
 */

import React from 'react';
import styles from './FeedbackTile.module.css';

export interface FeedbackTileProps {
  feedback: {
    type: 'success' | 'partial' | 'incorrect' | 'hint' | 'progress';
    message: string;
    score?: number;
    maxScore?: number;
    details?: string[];
  };
  companion?: {
    message: string;
    emotion?: 'happy' | 'encouraging' | 'thinking' | 'celebrating';
  };
  showAnimation?: boolean;
  gradeLevel?: string;
}

export const FeedbackTile: React.FC<FeedbackTileProps> = ({
  feedback,
  companion,
  showAnimation = true,
  gradeLevel = '6'
}) => {
  // Determine grade category for age-appropriate styling
  const getGradeCategory = () => {
    if (['K', '1', '2'].includes(gradeLevel)) return styles.gradeK2;
    if (['3', '4', '5'].includes(gradeLevel)) return styles.grade35;
    if (['6', '7', '8'].includes(gradeLevel)) return styles.grade68;
    return styles.grade912;
  };

  // Get feedback icon based on type
  const getFeedbackIcon = () => {
    switch (feedback.type) {
      case 'success': return '✅';
      case 'partial': return '🔶';
      case 'incorrect': return '❌';
      case 'hint': return '💡';
      case 'progress': return '📊';
      default: return '📝';
    }
  };

  // Get feedback style variant
  const getFeedbackStyle = () => {
    switch (feedback.type) {
      case 'success': return styles.feedbackSuccess;
      case 'partial': return styles.feedbackPartial;
      case 'incorrect': return styles.feedbackIncorrect;
      case 'hint': return styles.feedbackHint;
      case 'progress': return styles.feedbackProgress;
      default: return '';
    }
  };

  // Calculate percentage for score display
  const scorePercentage = feedback.score && feedback.maxScore 
    ? Math.round((feedback.score / feedback.maxScore) * 100)
    : null;

  return (
    <div 
      className={`${styles.feedbackTile} ${getFeedbackStyle()} ${getGradeCategory()} ${showAnimation ? styles.animated : ''}`}
    >
      {/* Header with icon and type */}
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <span className={styles.icon}>{getFeedbackIcon()}</span>
        </div>
        <div className={styles.typeLabel}>
          {feedback.type === 'success' && 'Great Job!'}
          {feedback.type === 'partial' && 'Good Try!'}
          {feedback.type === 'incorrect' && 'Try Again'}
          {feedback.type === 'hint' && 'Helpful Hint'}
          {feedback.type === 'progress' && 'Your Progress'}
        </div>
      </div>

      {/* Main message */}
      <div className={styles.messageSection}>
        <p className={styles.message}>{feedback.message}</p>
      </div>

      {/* Score display if provided */}
      {feedback.score !== undefined && feedback.maxScore !== undefined && (
        <div className={styles.scoreSection}>
          <div className={styles.scoreBar}>
            <div 
              className={styles.scoreProgress}
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
          <div className={styles.scoreText}>
            <span className={styles.scoreValue}>{feedback.score}</span>
            <span className={styles.scoreSeparator}>/</span>
            <span className={styles.scoreMax}>{feedback.maxScore}</span>
            {scorePercentage !== null && (
              <span className={styles.scorePercentage}>({scorePercentage}%)</span>
            )}
          </div>
        </div>
      )}

      {/* Details list if provided */}
      {feedback.details && feedback.details.length > 0 && (
        <div className={styles.detailsSection}>
          <ul className={styles.detailsList}>
            {feedback.details.map((detail, index) => (
              <li key={index} className={styles.detailItem}>
                <span className={styles.detailBullet}>•</span>
                <span className={styles.detailText}>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Companion encouragement if provided */}
      {companion && (
        <div className={styles.companionSection}>
          <div className={styles.companionBubble}>
            <span className={styles.companionEmoji}>
              {companion.emotion === 'happy' && '😊'}
              {companion.emotion === 'encouraging' && '💪'}
              {companion.emotion === 'thinking' && '🤔'}
              {companion.emotion === 'celebrating' && '🎉'}
              {!companion.emotion && '🗨️'}
            </span>
            <p className={styles.companionMessage}>{companion.message}</p>
          </div>
        </div>
      )}

      {/* Visual celebration for success */}
      {feedback.type === 'success' && showAnimation && (
        <div className={styles.celebrationOverlay}>
          <span className={styles.celebrationEmoji}>🌟</span>
          <span className={styles.celebrationEmoji}>⭐</span>
          <span className={styles.celebrationEmoji}>✨</span>
        </div>
      )}
    </div>
  );
};