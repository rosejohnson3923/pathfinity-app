import React, { useState, useEffect } from 'react';
import { leaderboardService } from '../../services/leaderboardService';
import { learningMetricsService } from '../../services/learningMetricsService';
import { pathIQGamification } from '../../services/pathIQGamificationService';
import { pathIQ } from '../../services/pathIQIntelligenceSystem';
import styles from './GamificationSidebar.module.css';

interface GamificationSidebarProps {
  position?: 'left' | 'right';
  currentSkill?: string;
  currentCareer?: string;
  userId: string;
  gradeLevel?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  recentXPEarned?: number;
  recentXPSource?: string;
}

interface LiveActivity {
  id: string;
  type: 'skill_mastered' | 'career_chosen' | 'achievement' | 'streak' | 'level_up';
  user: string;
  content: string;
  icon: string;
  timestamp: Date;
  isNew?: boolean;
}

interface UserStats {
  xp: number;
  level: number;
  nextLevelXp: number;
  rank: number;
  totalUsers: number;
  todayXp: number;
  streak: number;
}

export const GamificationSidebar: React.FC<GamificationSidebarProps> = ({
  position = 'right',
  currentSkill,
  currentCareer,
  userId,
  gradeLevel,
  isCollapsed = false,
  onToggleCollapse,
  recentXPEarned,
  recentXPSource
}) => {
  // Get user profile from PathIQ Gamification Service
  const userProfile = pathIQGamification.getUserProfile(userId);

  const [userStats, setUserStats] = useState<UserStats>({
    xp: userProfile.xp,
    level: userProfile.level,
    nextLevelXp: userProfile.nextLevelXp,
    rank: userProfile.pathIQRank || 42,
    totalUsers: 523,
    todayXp: userProfile.dailyXpEarned,
    streak: userProfile.streak
  });

  // Immediately add recent XP to display (before next service update)
  const displayXP = userStats.xp + (recentXPEarned || 0);
  const displayTodayXP = userStats.todayXp + (recentXPEarned || 0);

  const [liveActivities, setLiveActivities] = useState<LiveActivity[]>([]);
  const [careerTrends, setCareerTrends] = useState<any[]>([]);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [pathIQInsights, setPathIQInsights] = useState<string[]>([]);

  // Update user stats from PathIQ
  useEffect(() => {
    const interval = setInterval(() => {
      const profile = pathIQGamification.getUserProfile(userId);
      setUserStats({
        xp: profile.xp,
        level: profile.level,
        nextLevelXp: profile.nextLevelXp,
        rank: profile.pathIQRank || 42,
        totalUsers: 523,
        todayXp: profile.dailyXpEarned,
        streak: profile.streak
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  // Get PathIQ Live Activity Feed
  useEffect(() => {
    const generateLiveActivity = (): LiveActivity => {
      const activities = [
        {
          type: 'skill_mastered' as const,
          icon: '🎯',
          templates: [
            '{user} just mastered {skill}!',
            '{user} achieved 100% on {skill}',
            '{user} completed {skill} in record time!'
          ]
        },
        {
          type: 'career_chosen' as const,
          icon: '💼',
          templates: [
            '{user} is exploring {career}',
            '{user} just started their {career} journey',
            '{user} chose {career} as their dream job!'
          ]
        },
        {
          type: 'achievement' as const,
          icon: '🏆',
          templates: [
            '{user} unlocked {achievement}!',
            '{user} earned the {achievement} badge',
            'Wow! {user} just got {achievement}'
          ]
        },
        {
          type: 'streak' as const,
          icon: '🔥',
          templates: [
            '{user} is on a {days}-day streak!',
            '{user} hasn\'t missed a day in {days} days',
            'Amazing! {user} hit a {days}-day streak'
          ]
        },
        {
          type: 'level_up' as const,
          icon: '⭐',
          templates: [
            '{user} reached Level {level}!',
            '{user} just leveled up to {level}',
            'Congrats! {user} is now Level {level}'
          ]
        }
      ];

      const activityType = activities[Math.floor(Math.random() * activities.length)];
      const template = activityType.templates[Math.floor(Math.random() * activityType.templates.length)];
      
      const names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William'];
      const skills = ['Counting', 'Addition', 'Reading', 'Science Basics', 'Geography'];
      
      // Get grade-appropriate careers for live activity
      // Use gradeLevel from props, or default to '3' if not provided
      const effectiveGradeLevel = gradeLevel || '3';
      const gradeAppropriateCareerOptions = leaderboardService.getTopCareers(5, effectiveGradeLevel);
      const careers = gradeAppropriateCareerOptions.length > 0 
        ? gradeAppropriateCareerOptions.map(c => c.careerName)
        : ['Explorer', 'Scientist', 'Artist'];
      
      const achievements = ['Quick Learner', 'Perfect Score', 'Helper', 'Explorer'];
      
      let content = template
        .replace('{user}', names[Math.floor(Math.random() * names.length)])
        .replace('{skill}', skills[Math.floor(Math.random() * skills.length)])
        .replace('{career}', careers[Math.floor(Math.random() * careers.length)])
        .replace('{achievement}', achievements[Math.floor(Math.random() * achievements.length)])
        .replace('{days}', String(Math.floor(Math.random() * 10) + 3))
        .replace('{level}', String(Math.floor(Math.random() * 5) + 5));

      return {
        id: Math.random().toString(36).substr(2, 9),
        type: activityType.type,
        user: content.split(' ')[0],
        content,
        icon: activityType.icon,
        timestamp: new Date(),
        isNew: true
      };
    };

    // Get initial activities from PathIQ
    const pathIQActivities = pathIQ.getLiveActivityFeed(5);
    const initialActivities: LiveActivity[] = pathIQActivities.map((activity, i) => ({
      id: activity.id,
      type: 'achievement' as const,
      user: 'PathIQ',
      content: activity.message,
      icon: activity.icon,
      timestamp: new Date(activity.timestamp),
      isNew: false
    }));
    setLiveActivities(initialActivities);

    // Add new activity every 3-8 seconds
    const interval = setInterval(() => {
      const newActivity = generateLiveActivity();
      setLiveActivities(prev => {
        const updated = [newActivity, ...prev].slice(0, 10);
        return updated;
      });
      
      // Remove "new" flag after animation
      setTimeout(() => {
        setLiveActivities(prev => 
          prev.map(a => a.id === newActivity.id ? { ...a, isNew: false } : a)
        );
      }, 3000);
    }, Math.random() * 5000 + 3000);

    return () => clearInterval(interval);
  }, [gradeLevel]);

  // Get grade-appropriate career trends from leaderboard service
  useEffect(() => {
    // Get grade-appropriate trending careers from leaderboard service
    const trendingCareers = leaderboardService.getTrendingCareers(3, gradeLevel);
    
    // Map to the format expected by the UI
    const trends = trendingCareers.map(career => ({
      careerId: career.careerId,
      careerName: career.careerName,
      careerIcon: career.careerIcon,
      growthRate: career.growthRate
    }));
    
    setCareerTrends(trends);
  }, [currentCareer, gradeLevel]);

  // Get PathIQ Insights and motivational messages
  useEffect(() => {
    const updateInsights = () => {
      const insights = pathIQGamification.getPathIQInsights(userId);
      setPathIQInsights(insights);
      if (insights.length > 0) {
        setMotivationalMessage(insights[Math.floor(Math.random() * insights.length)]);
      }
    };
    
    updateInsights();
    const interval = setInterval(updateInsights, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  // Handle PathIQ events
  useEffect(() => {
    const handlePathIQEvent = (event: CustomEvent) => {
      const { detail } = event;
      if (detail.event === 'level_up' && detail.data.userId === userId) {
        // Show level up animation
        console.log('Level up!', detail.data.level);
      }
    };
    
    window.addEventListener('pathiq-event', handlePathIQEvent as EventListener);
    return () => window.removeEventListener('pathiq-event', handlePathIQEvent as EventListener);
  }, [userId]);

  const xpProgress = (displayXP / userStats.nextLevelXp) * 100;

  if (isCollapsed) {
    return (
      <div className={`${styles.gamificationSidebar} ${styles.gamificationSidebarCollapsed} ${position === 'left' ? styles.gamificationSidebarLeft : styles.gamificationSidebarRight}`}>
        <button className={styles.toggleButton} onClick={onToggleCollapse}>
          <span className={styles.icon}>🎮</span>
          <span className={styles.pathIQBadge}>{userStats.level}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.gamificationSidebar} ${position === 'left' ? styles.gamificationSidebarLeft : styles.gamificationSidebarRight}`}>
      <button className={styles.toggleButton} onClick={onToggleCollapse}>
        {position === 'right' ? '→' : '←'}
      </button>
      
      {/* User Stats Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h3>PathIQ Gaming</h3>
          <span className={styles.pathIQBadge}>Level {userStats.level}</span>
        </div>

        {/* Recent XP Celebration Banner */}
        {recentXPEarned !== undefined && recentXPEarned > 0 && (
          <div className={styles.celebrationBanner}>
            <div className={styles.celebrationContent}>
              <span className={styles.celebrationIcon}>🎉</span>
              <div className={styles.celebrationText}>
                <span className={styles.celebrationTitle}>{recentXPSource} Complete!</span>
                <span className={styles.celebrationXP}>+{recentXPEarned} XP Earned</span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.userStats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{displayXP}</span>
            <span className={styles.statLabel}>Total XP</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{userStats.streak}</span>
            <span className={styles.statLabel}>Day Streak</span>
          </div>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressText}>
            <span>{displayXP} / {userStats.nextLevelXp} XP</span>
            <span>+{displayTodayXP} today</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${xpProgress}%` }} />
          </div>
        </div>

      </div>

      {/* Career Trends */}
      {careerTrends.length > 0 && (
        <div className={styles.careerTrends}>
          <h3 className={styles.sectionTitle}>🚀 Trending Careers</h3>
          <div className={styles.trendsList}>
            {careerTrends.map((career, index) => (
              <div key={career.careerId} className={styles.trendItem}>
                <div className={styles.trendInfo}>
                  <span className={styles.trendIcon}>{career.careerIcon}</span>
                  <span className={styles.trendName}>{career.careerName}</span>
                </div>
                <span className={`${styles.trendBadge} ${career.growthRate < 0 ? styles.trendBadgeDown : ''}`}>
                  {career.growthRate > 0 ? '+' : ''}{career.growthRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Activity Feed */}
      <div className={styles.content}>
        <div className={styles.activityFeed}>
          <h3 className={styles.sectionTitle}>
            {liveActivities.length > 0 && <span className={styles.newIndicator}></span>}
            Live Activity
          </h3>
          <div className={styles.activityList}>
            {liveActivities.map(activity => (
              <div 
                key={activity.id} 
                className={styles.activityItem}
              >
                <span className={styles.activityIcon}>{activity.icon}</span>
                <div className={styles.activityContent}>
                  <span className={styles.activityText}>{activity.content}</span>
                  <span className={styles.activityTime}>
                    {getTimeAgo(activity.timestamp)}
                  </span>
                </div>
                {activity.isNew && <span className={styles.newIndicator}></span>}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

// Helper function for time ago
function getTimeAgo(timestamp: Date): string {
  const seconds = Math.floor((new Date().getTime() - timestamp.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 120) return '1 min ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
  return `${Math.floor(seconds / 3600)} hours ago`;
}

export default GamificationSidebar;