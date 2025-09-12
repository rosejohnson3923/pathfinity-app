/**
 * CompletionLayout Component
 * Grade-specific layout for completion/celebration screens
 */

import React from 'react';
import { CompanionTile } from '../tiles/CompanionTile';
import { FeedbackTile } from '../tiles/FeedbackTile';
import { ProgressTile } from '../tiles/ProgressTile';
import { AchievementTile } from '../tiles/AchievementTile';
import { getGradeLayout, getLayoutPreset } from './gradeLayouts';
import styles from '../BentoExperienceCard.module.css';

interface CompletionLayoutProps {
  gradeLevel: string;
  studentName: string;
  companion: {
    id: 'finn' | 'sage' | 'spark' | 'harmony';
    name: string;
    personality: string;
  };
  challengeData: {
    subject: string;
    skill: {
      name: string;
      description: string;
    };
    scenarios: any[];
  };
  career: {
    name: string;
    icon: string;
  };
  achievements: string[];
  totalXP: number;
  correctAnswers: number;
  totalQuestions: number;
  currentChallengeIndex: number;
  totalChallenges: number;
  onContinue: () => void;
  theme?: 'light' | 'dark';
}

export const CompletionLayout: React.FC<CompletionLayoutProps> = ({
  gradeLevel,
  studentName,
  companion,
  challengeData,
  career,
  achievements,
  totalXP,
  correctAnswers,
  totalQuestions,
  currentChallengeIndex,
  totalChallenges,
  onContinue,
  theme = 'light'
}) => {
  const layout = getGradeLayout(gradeLevel);
  const preset = getLayoutPreset('completion', gradeLevel);
  const successRate = Math.round((correctAnswers / totalQuestions) * 100);

  // Grade-specific celebration messages
  const getCelebrationMessage = () => {
    const messages = {
      'finn': {
        'K-2': `WOW ${studentName}! You did AMAZING! 🎉🎉🎉`,
        '3-5': `Awesome job ${studentName}! You crushed it! 🎉`,
        '6-8': `Great work ${studentName}! You nailed that challenge!`,
        '9-12': `Well done ${studentName}! Solid performance!`
      },
      'sage': {
        'K-2': `Wonderful work, ${studentName}! You learned so much! 🦉`,
        '3-5': `Excellent progress, ${studentName}. Your understanding has grown.`,
        '6-8': `Impressive work, ${studentName}. You've mastered these concepts.`,
        '9-12': `Outstanding analysis, ${studentName}. Well executed.`
      },
      'spark': {
        'K-2': `SUPER DUPER AMAZING ${studentName}! ⚡⚡⚡`,
        '3-5': `INCREDIBLE ENERGY ${studentName}! You're ON FIRE! ⚡`,
        '6-8': `EXPLOSIVE performance ${studentName}! Keep that energy!`,
        '9-12': `Powerful work ${studentName}! Great momentum!`
      },
      'harmony': {
        'K-2': `Beautiful work, dear ${studentName} 🌸 So proud of you!`,
        '3-5': `Wonderful journey, ${studentName} 🌸 You did beautifully.`,
        '6-8': `Graceful completion, ${studentName}. Well balanced work.`,
        '9-12': `Elegant solutions, ${studentName}. Thoughtfully done.`
      }
    };

    const gradeKey = ['K', '1', '2'].includes(gradeLevel) ? 'K-2' :
                    ['3', '4', '5'].includes(gradeLevel) ? '3-5' :
                    ['6', '7', '8'].includes(gradeLevel) ? '6-8' : '9-12';
    
    return messages[companion.id]?.[gradeKey] || `Great job ${studentName}!`;
  };

  // K-2: Big celebration with visuals
  if (['K', '1', '2'].includes(gradeLevel)) {
    return (
      <div className={`${styles.completionLayout} ${styles.k2CompletionLayout}`}>
        {/* Giant Celebration Header */}
        <div className={styles.giantCelebration}>
          <div className={styles.celebrationEmojis}>
            🎉 🌟 🏆 🌟 🎉
          </div>
          <h1 className={styles.bigTitle}>
            You Did It!
          </h1>
          <div className={styles.subjectBadge}>
            {challengeData.subject === 'Math' && '🔢'}
            {challengeData.subject === 'ELA' && '📚'}
            {challengeData.subject === 'Science' && '🔬'}
            {challengeData.subject === 'Social Studies' && '🌍'}
            <span>{challengeData.subject} Complete!</span>
          </div>
        </div>

        {/* Happy Companion */}
        <div className={styles.celebratingCompanion}>
          <CompanionTile
            companion={companion}
            message={getCelebrationMessage()}
            emotion="celebrating"
            size="large"
            position="inline"
            showConfetti={true}
          />
        </div>

        {/* Visual Achievements */}
        <div className={styles.visualAchievements}>
          <AchievementTile
            type="badge"
            value={`${challengeData.skill.name} Star!`}
            gradeLevel={gradeLevel}
            showAnimation={true}
            celebrationType="stars"
            additionalInfo={{
              totalXP: totalXP,
              streak: challengeData.scenarios.length,
              milestone: "Super Learner!"
            }}
          />
        </div>

        {/* Simple Stats with Stars */}
        <div className={styles.starStats}>
          {[...Array(Math.min(5, Math.ceil(successRate / 20)))].map((_, i) => (
            <span key={i} className={styles.star}>⭐</span>
          ))}
          <p>You got {correctAnswers} right!</p>
        </div>

        {/* Big Continue Button */}
        <div className={styles.bigContinueSection}>
          <button 
            className={`${styles.continueButton} ${styles.extraLarge} ${styles.rainbow}`}
            onClick={onContinue}
            style={{ minHeight: '64px', fontSize: '24px' }}
          >
            {currentChallengeIndex < totalChallenges - 1 
              ? 'Next Adventure! 🚀' 
              : 'All Done! 🏆'}
          </button>
        </div>
      </div>
    );
  }

  // 3-5: Balanced celebration with clear achievements
  if (['3', '4', '5'].includes(gradeLevel)) {
    return (
      <div className={`${styles.completionLayout} ${styles.grade35CompletionLayout}`}>
        {/* Celebration Header */}
        <div className={styles.celebrationHeader}>
          <h1>🎉 Challenge Complete! 🎉</h1>
          <p>{challengeData.subject}: {challengeData.skill.name}</p>
        </div>

        {/* Progress Summary */}
        <div className={styles.progressSummary}>
          <ProgressTile
            progress={{
              currentScenario: challengeData.scenarios.length,
              totalScenarios: challengeData.scenarios.length,
              completedScenarios: challengeData.scenarios.length,
              currentSkill: {
                name: challengeData.skill.name,
                subject: challengeData.subject,
                progress: 100
              },
              overallProgress: {
                completedSkills: currentChallengeIndex + 1,
                totalSkills: totalChallenges,
                badges: achievements
              }
            }}
            display="full"
            showMilestones={true}
            gradeLevel={gradeLevel}
          />
        </div>

        {/* Companion Celebration */}
        <div className={styles.companionCelebration}>
          <CompanionTile
            companion={companion}
            message={`${getCelebrationMessage()} You mastered ${challengeData.skill.name} like a true ${career.name}!`}
            emotion="celebrating"
            size="medium"
            position="inline"
          />
        </div>

        {/* Achievement Cards */}
        <div className={styles.achievementCards}>
          <AchievementTile
            type="badge"
            value={`${challengeData.skill.name} Master`}
            gradeLevel={gradeLevel}
            showAnimation={true}
            additionalInfo={{
              totalXP: totalXP,
              streak: challengeData.scenarios.length,
              milestone: `${challengeData.subject} Champion`
            }}
          />
        </div>

        {/* Success Stats */}
        <div className={styles.successStats}>
          <FeedbackTile
            feedback={{
              type: 'success',
              message: `Outstanding work!`,
              score: correctAnswers * 10,
              maxScore: totalQuestions * 10,
              details: [
                `Completed ${challengeData.scenarios.length} scenarios`,
                `${successRate}% accuracy`,
                `Earned ${totalXP} XP`,
                `Learned how ${career.name}s use ${challengeData.skill.name}`
              ]
            }}
            showAnimation={true}
            gradeLevel={gradeLevel}
          />
        </div>

        {/* Action Section */}
        <div className={styles.actionSection}>
          <button 
            className={`${styles.continueButton} ${styles.large}`}
            onClick={onContinue}
            style={{ minHeight: '48px', fontSize: '18px' }}
          >
            {currentChallengeIndex < totalChallenges - 1 
              ? 'Next Challenge →' 
              : 'Complete Experience 🏆'}
          </button>
        </div>
      </div>
    );
  }

  // 6-8: Structured completion with detailed stats
  if (['6', '7', '8'].includes(gradeLevel)) {
    return (
      <div className={`${styles.completionLayout} ${styles.grade68CompletionLayout}`}>
        {/* Header */}
        <div className={styles.completionHeader}>
          <h2>Challenge Complete</h2>
          <p className={styles.challengeTitle}>
            {challengeData.subject}: {challengeData.skill.name}
          </p>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Accuracy</span>
            <span className={styles.statValue}>{successRate}%</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>XP Earned</span>
            <span className={styles.statValue}>{totalXP}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Scenarios</span>
            <span className={styles.statValue}>{correctAnswers}/{totalQuestions}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Career Path</span>
            <span className={styles.statValue}>{career.name}</span>
          </div>
        </div>

        {/* Progress Overview */}
        <div className={styles.progressOverview}>
          <ProgressTile
            progress={{
              currentScenario: challengeData.scenarios.length,
              totalScenarios: challengeData.scenarios.length,
              completedScenarios: challengeData.scenarios.length,
              currentSkill: {
                name: challengeData.skill.name,
                subject: challengeData.subject,
                progress: 100
              },
              overallProgress: {
                completedSkills: currentChallengeIndex + 1,
                totalSkills: totalChallenges
              }
            }}
            display="detailed"
            showMilestones={true}
            gradeLevel={gradeLevel}
          />
        </div>

        {/* Achievement Display */}
        <div className={styles.achievementSection}>
          <AchievementTile
            type="summary"
            value={`${challengeData.skill.name} Complete`}
            gradeLevel={gradeLevel}
            showAnimation={false}
            additionalInfo={{
              totalXP: totalXP,
              accuracy: successRate,
              timeSpent: challengeData.scenarios.length * 2
            }}
          />
        </div>

        {/* Companion Message */}
        <div className={styles.companionMessage}>
          <CompanionTile
            companion={companion}
            message={getCelebrationMessage()}
            emotion="satisfied"
            size="small"
            position="inline"
          />
        </div>

        {/* Action Bar */}
        <div className={styles.actionBar}>
          <button 
            className={styles.continueButton}
            onClick={onContinue}
            style={{ minHeight: '44px', fontSize: '16px' }}
          >
            {currentChallengeIndex < totalChallenges - 1 
              ? 'Continue to Next Challenge' 
              : 'Complete Learning Journey'}
          </button>
        </div>
      </div>
    );
  }

  // 9-12: Professional completion summary
  return (
    <div className={`${styles.completionLayout} ${styles.grade912CompletionLayout}`}>
      {/* Professional Header */}
      <div className={styles.professionalCompletionHeader}>
        <h3>Module Complete</h3>
        <p className={styles.moduleInfo}>
          {challengeData.subject} / {challengeData.skill.name}
        </p>
      </div>

      {/* Performance Metrics */}
      <div className={styles.performanceMetrics}>
        <table className={styles.metricsTable}>
          <tbody>
            <tr>
              <td>Completion Rate</td>
              <td className={styles.metricValue}>100%</td>
            </tr>
            <tr>
              <td>Accuracy</td>
              <td className={styles.metricValue}>{successRate}%</td>
            </tr>
            <tr>
              <td>Questions Answered</td>
              <td className={styles.metricValue}>{correctAnswers}/{totalQuestions}</td>
            </tr>
            <tr>
              <td>Experience Points</td>
              <td className={styles.metricValue}>{totalXP} XP</td>
            </tr>
            <tr>
              <td>Career Application</td>
              <td className={styles.metricValue}>{career.name}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Progress Indicator */}
      <div className={styles.overallProgress}>
        <div className={styles.progressLabel}>
          Overall Progress: {currentChallengeIndex + 1} of {totalChallenges} modules
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${((currentChallengeIndex + 1) / totalChallenges) * 100}%` }}
          />
        </div>
      </div>

      {/* Professional Action */}
      <div className={styles.professionalActions}>
        <button 
          className={styles.continueButtonProfessional}
          onClick={onContinue}
          style={{ minHeight: '40px', fontSize: '14px' }}
        >
          {currentChallengeIndex < totalChallenges - 1 
            ? 'Next Module' 
            : 'Complete'}
        </button>
      </div>
    </div>
  );
};

export default CompletionLayout;