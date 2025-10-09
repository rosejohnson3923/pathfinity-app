/**
 * JOURNEY SUMMARY SCREEN
 * Shows comprehensive summary after completing all containers (LEARN → EXPERIENCE → DISCOVER)
 * This data will also be used to generate the final lesson plan for parents
 */

import React, { useState } from 'react';
import { Trophy, Star, Target, Clock, Award, BookOpen, Briefcase, Compass, ChevronRight, Download, CheckCircle } from 'lucide-react';
import styles from './JourneySummaryScreen.module.css';

interface ContainerSummary {
  container: 'LEARN' | 'EXPERIENCE' | 'DISCOVER';
  subject: string;
  skillName: string;
  skillId: string;
  completed: boolean;
  score: number;
  questionsAttempted: number;
  questionsCorrect: number;
  timeSpent: number; // in seconds
  xpEarned: number;
  attempts: number;
}

interface JourneySummaryData {
  studentName: string;
  gradeLevel: string;
  career: {
    id: string;
    name: string;
    icon: string;
  };
  companion: {
    id: string;
    name: string;
  };
  sessionId: string;
  startTime: string;
  endTime: string;
  totalTimeSpent: number; // in seconds
  totalXPEarned: number;
  containerProgress: {
    LEARN: ContainerSummary[];
    EXPERIENCE: ContainerSummary[];
    DISCOVER: ContainerSummary[];
  };
  overallScore: number; // percentage
  skillsMastered: number;
  totalSkillsAttempted: number;
}

interface JourneySummaryScreenProps {
  summaryData: JourneySummaryData;
  onReturnToDashboard: () => void;
  onGenerateLessonPlan?: () => void;
  theme?: 'light' | 'dark';
}

const JourneySummaryScreen: React.FC<JourneySummaryScreenProps> = ({
  summaryData,
  onReturnToDashboard,
  onGenerateLessonPlan,
  theme = 'light'
}) => {
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const containerIcons = {
    LEARN: BookOpen,
    EXPERIENCE: Briefcase,
    DISCOVER: Compass
  };

  const containerColors = {
    LEARN: 'var(--blue-500)',
    EXPERIENCE: 'var(--purple-500)',
    DISCOVER: 'var(--orange-500)'
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleGenerateLessonPlan = async () => {
    setGeneratingPlan(true);
    try {
      if (onGenerateLessonPlan) {
        await onGenerateLessonPlan();
      }
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className={styles.summaryContainer} data-theme={theme}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.celebrationIcon}>
          <Trophy size={64} />
        </div>
        <h1 className={styles.title}>
          Journey Complete, {summaryData.studentName}!
        </h1>
        <p className={styles.subtitle}>
          You've mastered {summaryData.skillsMastered} skills as a {summaryData.career.name}
        </p>
      </div>

      {/* Overall Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: 'var(--purple-500)' }}>
            <Star size={32} />
          </div>
          <div className={styles.statValue}>{summaryData.totalXPEarned.toLocaleString()}</div>
          <div className={styles.statLabel}>XP Earned</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: 'var(--green-500)' }}>
            <Target size={32} />
          </div>
          <div className={styles.statValue}>{summaryData.overallScore}%</div>
          <div className={styles.statLabel}>Average Score</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: 'var(--blue-500)' }}>
            <Clock size={32} />
          </div>
          <div className={styles.statValue}>{formatTime(summaryData.totalTimeSpent)}</div>
          <div className={styles.statLabel}>Time Spent</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: 'var(--orange-500)' }}>
            <Award size={32} />
          </div>
          <div className={styles.statValue}>{summaryData.skillsMastered}/{summaryData.totalSkillsAttempted}</div>
          <div className={styles.statLabel}>Skills Mastered</div>
        </div>
      </div>

      {/* Container-by-Container Progress */}
      <div className={styles.containersSection}>
        <h2 className={styles.sectionTitle}>Your Learning Journey</h2>

        {(['LEARN', 'EXPERIENCE', 'DISCOVER'] as const).map((containerType, index) => {
          const ContainerIcon = containerIcons[containerType];
          const containerData = summaryData.containerProgress[containerType];

          if (!containerData || containerData.length === 0) return null;

          const containerTotalXP = containerData.reduce((sum, subject) => sum + subject.xpEarned, 0);
          const containerAvgScore = Math.round(
            containerData.reduce((sum, subject) => sum + subject.score, 0) / containerData.length
          );

          return (
            <div key={containerType} className={styles.containerCard}>
              <div className={styles.containerHeader}>
                <div
                  className={styles.containerIconWrapper}
                  style={{ backgroundColor: containerColors[containerType] }}
                >
                  <ContainerIcon size={28} color="white" />
                </div>
                <div className={styles.containerInfo}>
                  <h3 className={styles.containerName}>{containerType}</h3>
                  <p className={styles.containerStats}>
                    {containerAvgScore}% Average · {containerTotalXP} XP
                  </p>
                </div>
                <div className={styles.containerNumber}>{index + 1}</div>
              </div>

              {/* Subject Progress Within Container */}
              <div className={styles.subjectsList}>
                {containerData.map((subject, subjectIndex) => (
                  <div key={`${containerType}-${subject.subject}-${subjectIndex}`} className={styles.subjectRow}>
                    <div className={styles.subjectLeft}>
                      <CheckCircle
                        size={20}
                        className={styles.checkIcon}
                        style={{ color: subject.completed ? 'var(--green-500)' : 'var(--gray-400)' }}
                      />
                      <div className={styles.subjectDetails}>
                        <span className={styles.subjectName}>{subject.subject}</span>
                        <span className={styles.skillName}>{subject.skillName}</span>
                      </div>
                    </div>

                    <div className={styles.subjectRight}>
                      <div className={styles.subjectMetric}>
                        <span className={styles.metricValue}>{subject.score}%</span>
                        <span className={styles.metricLabel}>Score</span>
                      </div>
                      <div className={styles.subjectMetric}>
                        <span className={styles.metricValue}>{subject.questionsCorrect}/{subject.questionsAttempted}</span>
                        <span className={styles.metricLabel}>Correct</span>
                      </div>
                      <div className={styles.subjectMetric}>
                        <span className={styles.metricValue}>{subject.xpEarned}</span>
                        <span className={styles.metricLabel}>XP</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className={styles.actionsSection}>
        {onGenerateLessonPlan && (
          <button
            onClick={handleGenerateLessonPlan}
            disabled={generatingPlan}
            className={styles.lessonPlanButton}
          >
            <Download size={20} />
            {generatingPlan ? 'Generating Lesson Plan...' : 'Generate Lesson Plan for Parent'}
          </button>
        )}

        <button
          onClick={onReturnToDashboard}
          className={styles.dashboardButton}
        >
          Return to Dashboard
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default JourneySummaryScreen;
