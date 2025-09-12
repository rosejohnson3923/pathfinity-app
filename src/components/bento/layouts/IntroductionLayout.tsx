/**
 * IntroductionLayout Component
 * Grade-specific layout for introduction screens
 */

import React from 'react';
import { CompanionTile } from '../tiles/CompanionTile';
import { ProgressTile } from '../tiles/ProgressTile';
import { getGradeLayout, getLayoutPreset } from './gradeLayouts';
import styles from '../BentoExperienceCard.module.css';

interface IntroductionLayoutProps {
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
  progress: {
    currentScenario: number;
    totalScenarios: number;
    currentSkill?: {
      name: string;
      subject: string;
      progress: number;
    };
    overallProgress?: {
      completedSkills: number;
      totalSkills: number;
    };
  };
  onStart: () => void;
  theme?: 'light' | 'dark';
}

export const IntroductionLayout: React.FC<IntroductionLayoutProps> = ({
  gradeLevel,
  studentName,
  companion,
  challengeData,
  career,
  progress,
  onStart,
  theme = 'light'
}) => {
  const layout = getGradeLayout(gradeLevel);
  const preset = getLayoutPreset('introduction', gradeLevel);
  const gradeCategory = ['K', '1', '2'].includes(gradeLevel) ? 'elementary' :
                       ['3', '4', '5'].includes(gradeLevel) ? 'elementary' :
                       ['6', '7', '8'].includes(gradeLevel) ? 'middle' : 'high';

  // Grade-specific companion greetings
  const getCompanionGreeting = () => {
    const greetings = {
      'finn': {
        'K-2': `Hey ${studentName}! 🎉 Let's play with ${challengeData.subject}! It's gonna be super fun!`,
        '3-5': `Hey ${studentName}! 🎉 Ready for an awesome ${challengeData.subject} adventure?`,
        '6-8': `What's up ${studentName}! Ready to tackle some ${challengeData.subject} challenges?`,
        '9-12': `Hey ${studentName}, let's explore ${challengeData.subject} together!`
      },
      'sage': {
        'K-2': `Hello ${studentName}. Let's learn about ${challengeData.subject} together, step by step.`,
        '3-5': `Greetings, ${studentName}. Let's explore ${challengeData.subject} with wisdom.`,
        '6-8': `Welcome, ${studentName}. Ready to deepen your ${challengeData.subject} knowledge?`,
        '9-12': `Greetings, ${studentName}. Let's approach ${challengeData.subject} with analytical thinking.`
      },
      'spark': {
        'K-2': `WOW ${studentName}! ⚡ ${challengeData.subject} time! Let's GO GO GO!`,
        '3-5': `AMAZING ${studentName}! ⚡ Time for SUPER ${challengeData.subject} action!`,
        '6-8': `YES ${studentName}! ⚡ Let's ENERGIZE this ${challengeData.subject} challenge!`,
        '9-12': `Let's GO ${studentName}! Time to power through ${challengeData.subject}!`
      },
      'harmony': {
        'K-2': `Hello dear ${studentName} 🌸 Let's gently explore ${challengeData.subject} together.`,
        '3-5': `Welcome ${studentName} 🌸 Let's peacefully discover ${challengeData.subject}.`,
        '6-8': `Hello ${studentName} 🌸 Ready for a calm ${challengeData.subject} journey?`,
        '9-12': `Welcome ${studentName}. Let's approach ${challengeData.subject} with balance and grace.`
      }
    };

    const gradeKey = ['K', '1', '2'].includes(gradeLevel) ? 'K-2' :
                    ['3', '4', '5'].includes(gradeLevel) ? '3-5' :
                    ['6', '7', '8'].includes(gradeLevel) ? '6-8' : '9-12';
    
    return greetings[companion.id]?.[gradeKey] || `Welcome ${studentName}!`;
  };

  // K-2: Large visual layout with big companion
  if (['K', '1', '2'].includes(gradeLevel)) {
    return (
      <div className={`${styles.introLayout} ${styles.k2Layout}`}>
        {/* Big Companion Section */}
        <div className={styles.heroCompanion}>
          <CompanionTile
            companion={companion}
            message={getCompanionGreeting()}
            emotion="happy"
            size="large"
            position="inline"
          />
        </div>

        {/* Simple Progress */}
        <div className={styles.simpleProgress}>
          <ProgressTile
            progress={progress}
            display="simple"
            showMilestones={false}
            gradeLevel={gradeLevel}
          />
        </div>

        {/* Big Start Button */}
        <div className={styles.bigActionSection}>
          <button 
            className={`${styles.startButton} ${styles.extraLarge}`}
            onClick={onStart}
            style={{ minHeight: '64px', fontSize: '24px' }}
          >
            Let's Play! 🎮
          </button>
        </div>

        {/* Visual Skill Preview */}
        <div className={styles.visualSkillPreview}>
          <div className={styles.skillIcon}>
            {challengeData.subject === 'Math' && '🔢'}
            {challengeData.subject === 'ELA' && '📚'}
            {challengeData.subject === 'Science' && '🔬'}
            {challengeData.subject === 'Social Studies' && '🌍'}
          </div>
          <h2>{challengeData.skill.name}</h2>
        </div>
      </div>
    );
  }

  // 3-5: Balanced layout with clear sections
  if (['3', '4', '5'].includes(gradeLevel)) {
    return (
      <div className={`${styles.introLayout} ${styles.grade35Layout}`}>
        {/* Progress Section */}
        <div className={styles.progressSection}>
          <ProgressTile
            progress={progress}
            display="detailed"
            showMilestones={true}
            gradeLevel={gradeLevel}
          />
        </div>

        {/* Companion Welcome */}
        <div className={styles.companionSection}>
          <CompanionTile
            companion={companion}
            message={getCompanionGreeting()}
            emotion="happy"
            size="medium"
            position="inline"
          />
        </div>

        {/* Skill Information */}
        <div className={styles.skillInfoSection}>
          <h2>{challengeData.skill.name}</h2>
          <p>{challengeData.skill.description}</p>
          <div className={styles.careerConnection}>
            <span className={styles.careerIcon}>{career.icon}</span>
            <span>Like a {career.name}!</span>
          </div>
        </div>

        {/* Action Button */}
        <div className={styles.actionSection}>
          <button 
            className={`${styles.startButton} ${styles.large}`}
            onClick={onStart}
            style={{ minHeight: '48px', fontSize: '18px' }}
          >
            Start Challenge →
          </button>
        </div>
      </div>
    );
  }

  // 6-8: More structured layout
  if (['6', '7', '8'].includes(gradeLevel)) {
    return (
      <div className={`${styles.introLayout} ${styles.grade68Layout}`}>
        {/* Header with Progress */}
        <div className={styles.headerSection}>
          <ProgressTile
            progress={progress}
            display="compact"
            showMilestones={true}
            gradeLevel={gradeLevel}
          />
        </div>

        {/* Main Content Grid */}
        <div className={styles.contentGrid}>
          {/* Companion Panel */}
          <div className={styles.companionPanel}>
            <CompanionTile
              companion={companion}
              message={getCompanionGreeting()}
              emotion="thinking"
              size="small"
              position="corner"
            />
          </div>

          {/* Challenge Details */}
          <div className={styles.challengeDetails}>
            <h2>{challengeData.subject}: {challengeData.skill.name}</h2>
            <p className={styles.skillDescription}>{challengeData.skill.description}</p>
            <div className={styles.scenarioCount}>
              {challengeData.scenarios.length} scenarios to complete
            </div>
            <div className={styles.careerRelevance}>
              <strong>Career Connection:</strong> {career.name}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className={styles.actionBar}>
          <button 
            className={styles.startButton}
            onClick={onStart}
            style={{ minHeight: '44px', fontSize: '16px' }}
          >
            Begin Challenge
          </button>
        </div>
      </div>
    );
  }

  // 9-12: Professional layout
  return (
    <div className={`${styles.introLayout} ${styles.grade912Layout}`}>
      {/* Compact Header */}
      <div className={styles.professionalHeader}>
        <ProgressTile
          progress={progress}
          display="minimal"
          showMilestones={false}
          gradeLevel={gradeLevel}
        />
      </div>

      {/* Content Area */}
      <div className={styles.professionalContent}>
        <div className={styles.challengeOverview}>
          <h2>{challengeData.skill.name}</h2>
          <p className={styles.subjectTag}>{challengeData.subject}</p>
          <p className={styles.description}>{challengeData.skill.description}</p>
        </div>

        <div className={styles.challengeMetrics}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Scenarios:</span>
            <span className={styles.metricValue}>{challengeData.scenarios.length}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Career Path:</span>
            <span className={styles.metricValue}>{career.name}</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Estimated Time:</span>
            <span className={styles.metricValue}>{challengeData.scenarios.length * 2} min</span>
          </div>
        </div>

        {/* Subtle Companion */}
        {companion && (
          <div className={styles.companionMinimal}>
            <CompanionTile
              companion={companion}
              message={`Ready when you are, ${studentName}.`}
              emotion="neutral"
              size="small"
              position="corner"
            />
          </div>
        )}
      </div>

      {/* Professional Action */}
      <div className={styles.professionalAction}>
        <button 
          className={styles.startButtonProfessional}
          onClick={onStart}
          style={{ minHeight: '40px', fontSize: '14px' }}
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default IntroductionLayout;