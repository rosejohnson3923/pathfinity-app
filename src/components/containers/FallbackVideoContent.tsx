/**
 * Fallback content component when YouTube videos are not available
 * Provides alternative learning materials and instructions
 */

import React from 'react';
import { BookOpen, AlertCircle, Search, RefreshCw, ChevronRight } from 'lucide-react';
import styles from './FallbackVideoContent.module.css';

interface FallbackVideoContentProps {
  skillName: string;
  gradeLevel: string;
  subject: string;
  onRetry: () => void;
  onSkipToQuestions: () => void;
}

export const FallbackVideoContent: React.FC<FallbackVideoContentProps> = ({
  skillName,
  gradeLevel,
  subject,
  onRetry,
  onSkipToQuestions
}) => {
  // Generate alternative learning suggestions based on the skill
  const getAlternativeLearning = () => {
    const suggestions = [];

    // Math-specific suggestions
    if (subject === 'Math') {
      suggestions.push({
        icon: '📝',
        title: 'Practice with Examples',
        description: `Try working through ${skillName.toLowerCase()} problems on paper`
      });
      suggestions.push({
        icon: '🎲',
        title: 'Use Manipulatives',
        description: 'Use objects like blocks or coins to visualize the concepts'
      });
    }

    // ELA-specific suggestions
    if (subject === 'ELA' || subject === 'English') {
      suggestions.push({
        icon: '📖',
        title: 'Read a Passage',
        description: `Practice ${skillName.toLowerCase()} with a book or article`
      });
      suggestions.push({
        icon: '✍️',
        title: 'Write Examples',
        description: 'Create your own examples to better understand the concept'
      });
    }

    // Science-specific suggestions
    if (subject === 'Science') {
      suggestions.push({
        icon: '🔬',
        title: 'Observe and Explore',
        description: `Look for real-world examples of ${skillName.toLowerCase()}`
      });
      suggestions.push({
        icon: '📊',
        title: 'Draw Diagrams',
        description: 'Create visual representations to understand the concept'
      });
    }

    // General suggestions for all subjects
    suggestions.push({
      icon: '👥',
      title: 'Ask for Help',
      description: 'Discuss this topic with a teacher, parent, or friend'
    });

    return suggestions;
  };

  const alternatives = getAlternativeLearning();

  return (
    <div className={styles.fallbackContainer}>
      {/* Header Alert */}
      <div className={styles.alertBox}>
        <div className={styles.alertIcon}>
          <AlertCircle className={styles.icon} />
        </div>
        <div className={styles.alertContent}>
          <h3 className={styles.alertTitle}>Videos Temporarily Unavailable</h3>
          <p className={styles.alertMessage}>
            We couldn't load videos for "{skillName}" right now, but don't worry!
            You can still learn this skill.
          </p>
        </div>
      </div>

      {/* Alternative Learning Section */}
      <div className={styles.alternativesSection}>
        <h4 className={styles.sectionTitle}>
          <BookOpen className={styles.titleIcon} />
          Alternative Ways to Learn
        </h4>

        <div className={styles.alternativeGrid}>
          {alternatives.map((alt, index) => (
            <div key={index} className={styles.alternativeCard}>
              <div className={styles.alternativeIcon}>{alt.icon}</div>
              <div className={styles.alternativeContent}>
                <h5 className={styles.alternativeTitle}>{alt.title}</h5>
                <p className={styles.alternativeDescription}>{alt.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className={styles.tipsSection}>
        <h4 className={styles.tipsTitle}>Quick Learning Tips</h4>
        <ul className={styles.tipsList}>
          <li>Break down the skill into smaller parts</li>
          <li>Practice with simple examples first</li>
          <li>Review what you already know about {subject}</li>
          <li>Take notes as you learn</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button
          onClick={onRetry}
          className={styles.retryButton}
        >
          <RefreshCw className={styles.buttonIcon} />
          Try Loading Videos Again
        </button>

        <button
          onClick={onSkipToQuestions}
          className={styles.continueButton}
        >
          Continue to Practice Questions
          <ChevronRight className={styles.buttonIcon} />
        </button>
      </div>

      {/* Helpful Resources */}
      <div className={styles.resourcesNote}>
        <Search className={styles.noteIcon} />
        <p className={styles.noteText}>
          You can also search for "{skillName} {gradeLevel} grade" on educational websites
          or ask your teacher for additional resources.
        </p>
      </div>
    </div>
  );
};

export default FallbackVideoContent;