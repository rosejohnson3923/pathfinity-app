/**
 * Bento Dashboard Component
 * Modern grid-based dashboard with interactive tiles using visual hierarchy system
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/shared/components/BentoGrid.module.css';
import { pathIQGamification } from '../../services/pathIQGamificationService';
import { supabase } from '../../lib/supabase';
import { careerProgressionSystem } from '../../rules-engine/career/CareerProgressionSystem';
import { BentoTile } from '../shared/BentoTile';
import { ThemeMode, GradeLevel } from '../../styles/visualHierarchy';
import { useLeaderboard } from '../../hooks/useLeaderboard';

interface CareerProgress {
  careerId: string;
  careerName: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  skillsLearned: string[];
  milestones: string[];
  exposureLevel: 'explorer' | 'apprentice' | 'practitioner' | 'specialist' | 'expert';
}

interface BentoDashboardProps {
  profile: any;
  userId?: string;
  onStartLearning: () => void;
  onSelectCareer: () => void;
  onSelectCompanion: () => void;
  onCompanionChat?: () => void;
  theme?: string;
  gradeLevel?: string;
}

export const BentoDashboard: React.FC<BentoDashboardProps> = ({
  profile,
  userId,
  onStartLearning,
  onSelectCareer,
  onSelectCompanion,
  onCompanionChat,
  theme = 'light',
  gradeLevel = 'K'
}) => {
  const navigate = useNavigate();
  const [hoveredTile, setHoveredTile] = useState<string | null>(null);
  const [animateValue, setAnimateValue] = useState<{ [key: string]: number }>({});
  const [gamificationProfile, setGamificationProfile] = useState<any>(null);
  const [dailyProgress, setDailyProgress] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [careerProgress, setCareerProgress] = useState<CareerProgress | null>(null);

  // Feature flag for real leaderboard data
  // Toggle VITE_USE_REAL_LEADERBOARD in .env to switch between mock and real data
  // false = mock data (default, safe for testing)
  // true = real data from Supabase PathIQ profiles
  const useRealLeaderboard = import.meta.env.VITE_USE_REAL_LEADERBOARD === 'true';

  // Log leaderboard mode for debugging
  useEffect(() => {
    console.log(`🏆 Leaderboard Mode: ${useRealLeaderboard ? 'REAL DATA' : 'MOCK DATA'}`);
  }, [useRealLeaderboard]);

  // Fetch real leaderboard data (only when feature flag is enabled)
  const { data: realLeaderboardData, loading: leaderboardLoading, currentUserPosition } = useLeaderboard({
    gradeLevel: gradeLevel,
    limit: 5
  });

  // Mock leaderboard data for testing/gradual rollout
  const mockLeaderboardData = {
    players: [
      { userId: 'mock-1', rank: 1, displayName: 'Swift Explorer #1', xp: 1250, level: 5, streakDays: 7, isCurrentUser: false },
      { userId: profile?.id || 'current', rank: 2, displayName: 'You', xp: animateValue.xp || 980, level: animateValue.level || 4, streakDays: animateValue.streak || 3, isCurrentUser: true },
      { userId: 'mock-3', rank: 3, displayName: 'Bright Scholar #3', xp: 920, level: 4, streakDays: 5, isCurrentUser: false },
      { userId: 'mock-4', rank: 4, displayName: 'Clever Thinker #4', xp: 850, level: 4, streakDays: 2, isCurrentUser: false },
      { userId: 'mock-5', rank: 5, displayName: 'Bold Achiever #5', xp: 780, level: 3, streakDays: 4, isCurrentUser: false }
    ],
    totalPlayers: 25,
    currentUserRank: 2,
    currentUserXP: animateValue.xp || 980,
    lastUpdated: new Date().toISOString(),
    gradeLevel: gradeLevel,
    tenantId: 'mock-tenant'
  };

  const mockUserPosition = {
    rank: 2,
    xp: animateValue.xp || 980,
    level: animateValue.level || 4,
    percentile: 92
  };

  // Use real or mock data based on feature flag
  const leaderboardData = useRealLeaderboard ? realLeaderboardData : mockLeaderboardData;
  const userPosition = useRealLeaderboard ? currentUserPosition : mockUserPosition;

  // Determine grade category for age-appropriate UI
  const getGradeCategory = (grade: string): 'elementary' | 'middle' | 'high' => {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    if (gradeNum <= 5) return 'elementary';  // K-5
    if (gradeNum <= 8) return 'middle';       // 6-8
    return 'high';                            // 9-12
  };
  
  const gradeCategory = getGradeCategory(gradeLevel);

  // Load real gamification data
  useEffect(() => {
    if (userId) {
      // Get real gamification profile
      const gameProfile = pathIQGamification.getUserProfile(userId);
      setGamificationProfile(gameProfile);
      
      // Get real achievements from the user profile
      const userProfile = pathIQGamification.getUserProfile(userId);
      // The achievements in the profile are just IDs, we need to map them to display format
      const achievementsList = userProfile.achievements || [];
      setAchievements(achievementsList.map((achievementId: string) => ({
        id: achievementId,
        name: achievementId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        icon: achievementId === 'first-steps' ? '🏆' : 
              achievementId === 'week-streak' ? '🔥' : 
              achievementId === 'grandmaster' ? '👑' : '⭐',
        earned: true
      })));
      
      // Calculate daily progress from today's sessions
      loadProgressData(userId);
      
      // Initialize career progression
      if (profile?.selectedCareer) {
        const careerValue = typeof profile.selectedCareer === 'object' ? profile.selectedCareer.name : profile.selectedCareer;
        initializeCareerProgress(careerValue);
      }
    }
  }, [userId, profile?.selectedCareer]);
  
  // Initialize career progression
  const initializeCareerProgress = async (careerName: string) => {
    try {
      // Get exposure level based on grade
      const exposureLevel = careerProgressionSystem.getExposureLevelForGrade(gradeLevel);
      
      // Load or create career progress from database
      const supabaseClient = await supabase();
      const { data: careerData } = await supabaseClient
        .from('career_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('career_name', careerName)
        .single();
      
      if (careerData) {
        setCareerProgress({
          careerId: careerData.career_id,
          careerName: careerData.career_name,
          level: careerData.level || 1,
          xp: careerData.xp || 0,
          nextLevelXp: (careerData.level || 1) * 100,
          skillsLearned: careerData.skills_learned || [],
          milestones: careerData.milestones || [],
          exposureLevel: exposureLevel
        });
      } else {
        // Create new career progress
        const newCareerProgress: CareerProgress = {
          careerId: careerName.toLowerCase().replace(/\s+/g, '_'),
          careerName: careerName,
          level: 1,
          xp: 0,
          nextLevelXp: 100,
          skillsLearned: [],
          milestones: [],
          exposureLevel: exposureLevel
        };
        setCareerProgress(newCareerProgress);
      }
    } catch (error) {
      console.log('Career progress initialization:', error);
      // Set default career progress even if database fails
      const exposureLevel = careerProgressionSystem.getExposureLevelForGrade(gradeLevel);
      setCareerProgress({
        careerId: careerName.toLowerCase().replace(/\s+/g, '_'),
        careerName: careerName,
        level: 1,
        xp: 0,
        nextLevelXp: 100,
        skillsLearned: [],
        milestones: ['Started career journey'],
        exposureLevel: exposureLevel
      });
    }
  };
  
  // Load progress data from database
  const loadProgressData = async (userId: string) => {
    try {
      // Get today's learning sessions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const supabaseClient = await supabase();
      // Updated query for new session schema
      const { data: sessions } = await supabaseClient
        .from('learning_sessions')
        .select('total_time_spent, subjects_completed, average_score')
        .eq('user_id', userId)
        .gte('created_at', today.toISOString());
      
      if (sessions && sessions.length > 0) {
        // Estimate based on subjects completed (10 questions per subject)
        const totalQuestions = sessions.reduce((acc, s) => acc + (s.subjects_completed || 0) * 10, 0);
        const correctQuestions = sessions.reduce((acc, s) => {
          const score = s.average_score || 0;
          const questions = (s.subjects_completed || 0) * 10;
          return acc + Math.round(questions * score / 100);
        }, 0);
        const dailyProg = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;
        setDailyProgress(Math.min(dailyProg, 100));
      }
      
      // Get weekly progress
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { data: weekSessions } = await supabaseClient
        .from('learning_sessions')
        .select('total_time_spent')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString());
      
      if (weekSessions) {
        // Assuming 7 hours is the weekly goal
        // total_time_spent is in seconds, convert to minutes
        const totalMinutes = weekSessions.reduce((acc, s) => acc + ((s.total_time_spent || 0) / 60), 0);
        const weeklyProg = Math.round((totalMinutes / (7 * 60)) * 100);
        setWeeklyProgress(Math.min(weeklyProg, 100));
      }
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  // Animate stat values on mount
  useEffect(() => {
    const stats = {
      xp: gamificationProfile?.xp || profile?.totalPoints || 0,
      level: gamificationProfile?.level || profile?.level || 1,
      badges: achievements.length || profile?.badgesEarned || 0,
      streak: gamificationProfile?.streak || profile?.learningStreak || 0
    };

    // Animate each stat from 0 to actual value
    Object.entries(stats).forEach(([key, targetValue]) => {
      let currentValue = 0;
      const increment = targetValue / 20;
      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
          currentValue = targetValue;
          clearInterval(timer);
        }
        setAnimateValue(prev => ({ ...prev, [key]: Math.floor(currentValue) }));
      }, 50);
    });
  }, [profile]);

  // Fill in missing achievements if needed
  const allAchievements = [
    ...achievements,
    ...(achievements.length < 6 ? [
      { id: 'math_master', name: 'Math Master', earned: false, icon: '🔢' },
      { id: 'reading_rocket', name: 'Reading Rocket', earned: false, icon: '📚' },
      { id: 'science_star', name: 'Science Star', earned: false, icon: '🔬' },
      { id: 'history_hero', name: 'History Hero', earned: false, icon: '🏛️' },
      { id: 'perfect_week', name: 'Perfect Week', earned: false, icon: '⭐' },
      { id: 'speed_learner', name: 'Speed Learner', earned: false, icon: '⚡' }
    ].slice(achievements.length) : [])
  ];

  const progressData = {
    daily: dailyProgress || 0,
    weekly: weeklyProgress || 0,
    skills: 60 // TODO: Calculate from actual skills mastery
  };

  // Elementary Dashboard (K-5): Big, friendly, colorful with 2x3 grid
  const renderElementaryDashboard = () => {
    const themeMode: ThemeMode = theme as ThemeMode;
    const gradeLevelType: GradeLevel = 'elementary';
    
    return (
      <div className={`${styles.bentoContainer} ${styles.elementary}`} data-theme={theme} 
        style={{ 
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'auto auto auto',
          gap: '20px'
        }}>
        
        {/* PRIMARY TILE - Learning Journey (100% prominence) */}
        <BentoTile
          hierarchy="PRIMARY"
          containerType="learn"
          gradeLevel={gradeLevelType}
          theme={themeMode}
          title="Start Today's Learning Journey"
          subtitle="Continue where you left off"
          emoji="🚀"
          gridSpan={2}
          onClick={onStartLearning}
          actionButton={{
            label: 'Continue →',
            onClick: onStartLearning,
            variant: 'primary'
          }}
        >
          {/* Progress Bar Content */}
          <div style={{ marginTop: '20px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.3)',
              height: '12px',
              borderRadius: '6px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${progressData.daily}%`,
                background: 'linear-gradient(90deg, #ffd700, #ffed4e)',
                height: '100%',
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                transition: 'width 0.5s ease'
              }} />
            </div>
            <p style={{ 
              marginTop: '12px', 
              fontSize: '16px', 
              color: 'rgba(255, 255, 255, 0.95)',
              fontWeight: '500'
            }}>
              {progressData.daily}% of today's goal completed
            </p>
            <span style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '14px',
              display: 'block',
              marginTop: '8px'
            }}>
              Next: {profile?.nextSkill || 'Math Foundations'}
            </span>
          </div>
        </BentoTile>

        {/* SECONDARY TILE - Career (70% prominence) */}
        <BentoTile
          hierarchy="SECONDARY"
          containerType="learn"
          gradeLevel={gradeLevelType}
          theme={themeMode}
          title="My Dream Job"
          subtitle={careerProgress?.careerName || (typeof profile?.selectedCareer === 'object' ? profile?.selectedCareer?.name : profile?.selectedCareer) || 'Choose your career'}
          emoji={(() => {
            const careerEmojis: Record<string, string> = {
              'Chef': '👨‍🍳',
              'Artist': '🎨',
              'Doctor': '👨‍⚕️',
              'Engineer': '👷',
              'Scientist': '🔬',
              'Teacher': '👨‍🏫',
              'Musician': '🎵',
              'Athlete': '⚽',
              'Writer': '✍️',
              'Designer': '🎨',
              'Firefighter': '🚒',
              'Police Officer': '👮',
              'Astronaut': '🚀',
              'Pilot': '✈️',
              'Nurse': '👩‍⚕️',
              'Veterinarian': '🐕',
              'Explorer': '🧭'
            };
            const careerName = careerProgress?.careerName || (typeof profile?.selectedCareer === 'object' ? profile?.selectedCareer?.name : profile?.selectedCareer) || '';
            return careerEmojis[careerName] || '💼';
          })()}
          onClick={onSelectCareer}
          actionButton={{
            label: careerProgress ? 'Continue Journey →' : 
                   profile?.selectedCareer ? 'View Progress →' : 'Explore Careers →',
            onClick: onSelectCareer,
            variant: 'primary'
          }}
        >
          {/* Career Progress Content */}
          {careerProgress && (
            <div>
              <div style={{ 
                fontSize: '12px', 
                color: theme === 'dark' ? '#a0a0a0' : '#666', 
                marginBottom: '8px' 
              }}>
                {careerProgress.level && (
                  <span style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: '600',
                    marginRight: '8px'
                  }}>Lvl {careerProgress.level}</span>
                )}
                {careerProgress.exposureLevel === 'explorer' ? '🔍 Explorer' :
                 careerProgress.exposureLevel === 'apprentice' ? '🎓 Apprentice' :
                 careerProgress.exposureLevel === 'practitioner' ? '⚡ Practitioner' : '🌟 Specialist'}
              </div>
              <div style={{ 
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0', 
                borderRadius: '8px', 
                height: '8px',
                overflow: 'hidden',
                marginBottom: '4px'
              }}>
                <div style={{ 
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  height: '100%',
                  width: `${Math.min(100, (careerProgress.xp / careerProgress.nextLevelXp) * 100)}%`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ fontSize: '11px', color: theme === 'dark' ? '#808080' : '#999' }}>
                {careerProgress.xp} / {careerProgress.nextLevelXp} Career XP
              </div>
              {careerProgress.skillsLearned.length > 0 && (
                <div style={{ marginTop: '8px', fontSize: '11px' }}>
                  <span style={{ color: '#667eea' }}>
                    🎯 {careerProgress.skillsLearned.length} skills learned
                  </span>
                </div>
              )}
            </div>
          )}
        </BentoTile>

        {/* SECONDARY TILE #2 - AI Companion (70% prominence - equal to Career) */}
        <BentoTile
          hierarchy="SECONDARY"
          containerType="learn"
          gradeLevel={gradeLevelType}
          theme={themeMode}
          title="My AI Friend"
          subtitle={profile?.selectedCompanion 
            ? `${profile.selectedCompanion} is ready to help!` 
            : 'Choose your learning companion'}
          avatarUrl={profile?.selectedCompanion 
            ? `/images/companions/${profile.selectedCompanion.toLowerCase()}-${theme}.png`
            : undefined}
          emoji="🤖"
          onClick={onSelectCompanion}
          actionButton={{
            label: profile?.selectedCompanion ? 'Talk →' : 'Meet →',
            onClick: profile?.selectedCompanion && onCompanionChat 
              ? onCompanionChat 
              : onSelectCompanion,
            variant: 'primary'
          }}
        >
          {profile?.selectedCompanion && (
            <p style={{
              fontSize: '12px',
              color: theme === 'dark' ? '#a0a0a0' : '#666',
              marginTop: '8px'
            }}>
              Click to chat or get help anytime
            </p>
          )}
        </BentoTile>

        {/* AMBIENT TILE - Progress Tracker (30% prominence) */}
        <BentoTile
          hierarchy="AMBIENT"
          containerType="learn"
          gradeLevel={gradeLevelType}
          theme={themeMode}
          title="Progress & Achievements"
          gridSpan={2}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
            {/* Points Section - 2/3 width */}
            <div style={{ flex: '2 1 0%' }}>
              <h4 style={{ 
                fontSize: '12px', 
                fontWeight: '500', 
                textTransform: 'uppercase',
                opacity: 0.6,
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                Progress
              </h4>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>⚡</span>
                  <span style={{ fontSize: '18px', fontWeight: '600' }}>{animateValue.xp || 0}</span>
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>XP</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🔥</span>
                  <span style={{ fontSize: '18px', fontWeight: '600' }}>{animateValue.streak || 0}</span>
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>days</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🏆</span>
                  <span style={{ fontSize: '18px', fontWeight: '600' }}>{animateValue.level || 1}</span>
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>level</span>
                </div>
              </div>
              {/* Progress bar to next level */}
              <div style={{ marginTop: '12px' }}>
                <div style={{ 
                  height: '4px', 
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    height: '100%',
                    width: `${(animateValue.xp % 100) || 0}%`,
                    background: 'linear-gradient(90deg, #667eea, #764ba2)',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <p style={{ fontSize: '10px', marginTop: '4px', opacity: 0.5 }}>
                  {100 - (animateValue.xp % 100) || 100} XP to next level
                </p>
              </div>
            </div>
            
            {/* Badges Section - 1/3 width */}
            <div style={{ 
              flex: '1 1 0%',
              paddingLeft: '20px',
              borderLeft: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
              minWidth: '100px'
            }}>
              <h4 style={{ 
                fontSize: '12px', 
                fontWeight: '500', 
                textTransform: 'uppercase',
                opacity: 0.6,
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                Recent Badges
              </h4>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {allAchievements.filter(a => a.earned).slice(0, 4).map((achievement, i) => (
                  <div 
                    key={achievement.id}
                    style={{ 
                      width: '24px', 
                      height: '24px',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '6px',
                      transition: 'transform 0.2s ease',
                      cursor: 'pointer'
                    }}
                    title={achievement.name}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {achievement.icon}
                  </div>
                ))}
                {animateValue.badges > 4 && (
                  <div 
                    style={{ 
                      width: '24px', 
                      height: '24px',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '6px',
                      fontWeight: '600',
                      opacity: 0.6
                    }}
                    title={`${animateValue.badges - 4} more badges`}
                  >
                    +{animateValue.badges - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        </BentoTile>
      </div>
    );
  };
  
  // Middle School Dashboard (6-8): Balanced with more features
  const renderMiddleSchoolDashboard = () => {
    const themeMode: ThemeMode = theme as ThemeMode;
    const gradeLevelType: GradeLevel = 'middle';
    
    return (
      <div className={`${styles.bentoContainer} ${styles.middle}`} data-theme={theme}>
      {/* Grid Areas from CSS: 4x3 grid
          "learn learn stats badges"
          "career companion stats achievements"  
          "progress progress social social" */}
      
        {/* PRIMARY - Learning Tile (100% prominence) - spans 2 columns */}
        <div style={{ gridArea: 'learn' }}>
          <BentoTile
            hierarchy="PRIMARY"
            containerType="learn"
            gradeLevel={gradeLevelType}
            theme={themeMode}
            title="Today's Learning Path"
            subtitle="Continue your journey"
            emoji="📚"
            onClick={onStartLearning}
            actionButton={{
              label: 'Continue →',
              onClick: onStartLearning,
              variant: 'primary'
            }}
          >
            <div style={{ marginTop: '12px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                height: '8px',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${progressData.daily}%`,
                  background: 'white',
                  height: '100%',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <p style={{ 
                marginTop: '8px', 
                fontSize: '14px', 
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                {progressData.daily}% completed today
              </p>
              <span style={{ 
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                Next: {profile?.nextSkill || 'Algebra Basics'}
              </span>
            </div>
          </BentoTile>
        </div>

        {/* TERTIARY - Stats Tile (40% prominence) - spans 2 rows */}
        <div style={{ gridArea: 'stats', gridRow: 'span 2' }}>
          <BentoTile
            hierarchy="TERTIARY"
            containerType="learn"
            gradeLevel={gradeLevelType}
            theme={themeMode}
            title="Your Progress"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '1.25rem' }}>⚡</span>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>{animateValue.xp || 0}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>Total XP</div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '1.25rem' }}>🏆</span>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>{animateValue.level || 1}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>Level</div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '1.25rem' }}>🔥</span>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>{animateValue.streak || 0}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>Day Streak</div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '1.25rem' }}>🎯</span>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>{animateValue.badges || 0}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>Badges Earned</div>
                </div>
              </div>
            </div>
          </BentoTile>
        </div>

        {/* TERTIARY - Badges Tile (40% prominence) */}
        <div style={{ gridArea: 'badges' }}>
          <BentoTile
            hierarchy="TERTIARY"
            containerType="learn"
            gradeLevel={gradeLevelType}
            theme={themeMode}
            title="Recent Badges"
          >
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              marginTop: '8px'
            }}>
              {allAchievements.slice(0, 6).map(achievement => (
                <div 
                  key={achievement.id}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    background: achievement.earned 
                      ? 'linear-gradient(135deg, #ffd700, #ffed4e)'
                      : theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    boxShadow: achievement.earned ? '0 2px 6px rgba(255, 215, 0, 0.3)' : 'none',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer'
                  }}
                  title={achievement.name}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(10deg) scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0) scale(1)'}
                >
                  {achievement.icon}
                </div>
              ))}
            </div>
          </BentoTile>
        </div>

        {/* SECONDARY - Career Tile (70% prominence) */}
        <div style={{ gridArea: 'career' }}>
          <BentoTile
            hierarchy="SECONDARY"
            containerType="learn"
            gradeLevel={gradeLevelType}
            theme={themeMode}
            title="Career Path"
            subtitle={profile?.selectedCareer ? `Exploring: ${typeof profile.selectedCareer === 'object' ? profile.selectedCareer.name : profile.selectedCareer}` : 'Discover careers'}
            emoji="💼"
            onClick={onSelectCareer}
            actionButton={{
              label: profile?.selectedCareer ? 'Change →' : 'Explore →',
              onClick: onSelectCareer,
              variant: 'primary'
            }}
          />
        </div>

        {/* SECONDARY - Companion Tile (70% prominence) */}
        <div style={{ gridArea: 'companion' }}>
          <BentoTile
            hierarchy="SECONDARY"
            containerType="learn"
            gradeLevel={gradeLevelType}
            theme={themeMode}
            title="AI Helper"
            subtitle={profile?.selectedCompanion ? `With ${profile.selectedCompanion}` : 'Choose helper'}
            emoji="🤖"
            onClick={onSelectCompanion}
            actionButton={{
              label: profile?.selectedCompanion ? 'Chat →' : 'Select →',
              onClick: profile?.selectedCompanion && onCompanionChat ? onCompanionChat : onSelectCompanion,
              variant: 'primary'
            }}
          />
        </div>

        {/* TERTIARY - Achievements Tile (40% prominence) */}
        <div style={{ gridArea: 'achievements' }}>
          <BentoTile
            hierarchy="TERTIARY"
            containerType="learn"
            gradeLevel={gradeLevelType}
            theme={themeMode}
            title="Next Goal"
            emoji="🎯"
          >
            <div style={{ marginTop: '8px' }}>
              <p style={{ fontWeight: 600, margin: 0, fontSize: '14px' }}>Week Warrior</p>
              <p style={{ fontSize: '11px', opacity: 0.8, margin: '4px 0' }}>
                5 days in a row
              </p>
              <div style={{ 
                width: '100%', 
                height: '4px',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                borderRadius: '2px',
                overflow: 'hidden',
                marginTop: '8px'
              }}>
                <div style={{ 
                  width: '60%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #667eea, #764ba2)',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          </BentoTile>
        </div>

        {/* AMBIENT - Progress Overview (30% prominence) - spans 2 columns */}
        <div style={{ gridArea: 'progress' }}>
          <BentoTile
            hierarchy="AMBIENT"
            containerType="learn"
            gradeLevel={gradeLevelType}
            theme={themeMode}
            title="Weekly Progress"
            gridSpan={2}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '8px' }}>
              <div>
                <p style={{ fontSize: '11px', opacity: 0.7, marginBottom: '6px' }}>Today</p>
                <div style={{
                  height: '4px',
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progressData.daily}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #667eea, #764ba2)'
                  }} />
                </div>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>{progressData.daily}%</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', opacity: 0.7, marginBottom: '6px' }}>This Week</p>
                <div style={{
                  height: '4px',
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progressData.weekly}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #667eea, #764ba2)'
                  }} />
                </div>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>{progressData.weekly}%</p>
              </div>
              <div>
                <p style={{ fontSize: '11px', opacity: 0.7, marginBottom: '6px' }}>Skills</p>
                <div style={{
                  height: '4px',
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progressData.skills}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #667eea, #764ba2)'
                  }} />
                </div>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>{progressData.skills}%</p>
              </div>
            </div>
          </BentoTile>
        </div>

        {/* AMBIENT - Social Leaderboard (30% prominence) - spans 2 columns */}
        <div style={{ gridArea: 'social' }}>
          <BentoTile
            hierarchy="AMBIENT"
            containerType="learn"
            gradeLevel={gradeLevelType}
            theme={themeMode}
            title="Class Leaderboard"
            gridSpan={2}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  fontSize: '1.75rem',
                  fontWeight: 'bold',
                  color: '#667eea'
                }}>
                  #{userPosition?.rank || profile?.classRank || '—'}
                </span>
                <p style={{ fontSize: '11px', opacity: 0.7 }}>Your Rank</p>
              </div>
              <div>
                {useRealLeaderboard && leaderboardLoading ? (
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>Loading...</div>
                ) : leaderboardData?.players && leaderboardData.players.length > 0 ? (
                  <>
                    {leaderboardData.players.slice(0, 3).map((player, index) => (
                      <div
                        key={player.userId}
                        style={{
                          fontSize: '11px',
                          marginBottom: '4px',
                          fontWeight: player.isCurrentUser ? 'bold' : 'normal',
                          color: player.isCurrentUser ? '#667eea' : 'inherit'
                        }}
                      >
                        <span>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {player.isCurrentUser ? 'You' : player.displayName}
                        </span>
                        <span style={{ float: 'right' }}>{player.xp} XP</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{ fontSize: '11px', opacity: 0.7 }}>No leaderboard data yet</div>
                )}
              </div>
            </div>
          </BentoTile>
        </div>
      </div>
    );
  };
  
  // High School Dashboard (9-12): Advanced with 4x4 grid
  const renderHighSchoolDashboard = () => {
    const themeMode: ThemeMode = theme as ThemeMode;
    const gradeLevelType: GradeLevel = 'high';
    
    return (
      <div className={`${styles.bentoContainer} ${styles.high}`} data-theme={theme}>
        {/* Grid Areas: 4x4 grid for high school
            "learn learn stats gpa"
            "career companion rank badges"  
            "progress progress achievements achievements"
            "schedule schedule resources social" */}
        
        {/* PRIMARY - Learning Tile (100% prominence) - spans 2 columns */}
        <div style={{ gridArea: 'learn' }}>
          <BentoTile
            hierarchy="PRIMARY"
            containerType="learn"
            gradeLevel={gradeLevelType}
            theme={themeMode}
            title="Continue Learning"
            subtitle={profile?.nextSkill || 'Advanced Chemistry'}
            emoji="📚"
            onClick={onStartLearning}
            actionButton={{
              label: 'Continue →',
              onClick: onStartLearning,
              variant: 'primary'
            }}
          >
            <div style={{ marginTop: '8px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                height: '6px',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${progressData.daily}%`,
                  background: 'white',
                  height: '100%',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <p style={{ 
                fontSize: '11px', 
                marginTop: '4px', 
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                {progressData.daily}% of today's goal
              </p>
            </div>
          </BentoTile>
        </div>

        {/* TERTIARY - Stats Tile (40% prominence) */}
        <div style={{ gridArea: 'stats' }}>
          <BentoTile
            hierarchy="TERTIARY"
            containerType="learn"
            gradeLevel={gradeLevelType}
            theme={themeMode}
            title="Quick Stats"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>XP:</span>
                <strong>{animateValue.xp || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Level:</span>
                <strong>{animateValue.level || 1}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span>Streak:</span>
                <strong>{animateValue.streak || 0}🔥</strong>
              </div>
            </div>
          </BentoTile>
        </div>

        {/* TERTIARY - GPA Tile (40% prominence) */}
        <div style={{ gridArea: 'gpa' }}>
          <BentoTile
            hierarchy="TERTIARY"
            containerType="learn"
            gradeLevel={gradeLevelType}
            theme={themeMode}
            title="GPA"
          >
            <div style={{ fontSize: '1.5rem', marginTop: '4px', fontWeight: 'bold', color: '#667eea' }}>3.8</div>
            <p style={{ fontSize: '10px', opacity: 0.7 }}>Semester Average</p>
          </BentoTile>
        </div>

        {/* SECONDARY - Career Tile (70% prominence) */}
        <div style={{ gridArea: 'career' }}>
          <BentoTile
            hierarchy="SECONDARY"
            containerType="learn"
            gradeLevel={gradeLevelType}
            theme={themeMode}
            title="Career Path"
            subtitle={(typeof profile?.selectedCareer === 'object' ? profile?.selectedCareer?.name : profile?.selectedCareer) || 'Choose Path'}
            emoji="💼"
            onClick={onSelectCareer}
            actionButton={{
              label: profile?.selectedCareer ? 'View' : 'Select',
              onClick: onSelectCareer,
              variant: 'primary'
            }}
          />
        </div>

        {/* SECONDARY - Companion Tile (70% prominence) */}
        <div style={{ gridArea: 'companion' }}>
          <BentoTile
            hierarchy="SECONDARY"
            containerType="learn"
            gradeLevel={gradeLevelType}
            theme={themeMode}
            title="AI Guide"
            subtitle={profile?.selectedCompanion || 'Choose AI'}
            emoji="🤖"
            onClick={onSelectCompanion}
            actionButton={{
              label: profile?.selectedCompanion ? 'Chat' : 'Select',
              onClick: profile?.selectedCompanion && onCompanionChat ? onCompanionChat : onSelectCompanion,
              variant: 'primary'
            }}
          />
        </div>

        {/* TERTIARY - Class Rank Tile (40% prominence) */}
        <div style={{ gridArea: 'rank' }}>
          <BentoTile
            hierarchy="TERTIARY"
            containerType="learn"
            gradeLevel={gradeLevelType}
            theme={themeMode}
            title="Class Rank"
          >
            <div style={{ fontSize: '1.25rem', marginTop: '4px', fontWeight: 'bold', color: '#667eea' }}>
              #{profile?.classRank || 12}
            </div>
            <p style={{ fontSize: '10px', opacity: 0.7 }}>of {profile?.classSize || 245}</p>
          </BentoTile>
        </div>

        {/* TERTIARY - Badges Tile (40% prominence) */}
        <div style={{ gridArea: 'badges' }}>
          <BentoTile
            hierarchy="TERTIARY"
            containerType="learn"
            gradeLevel={gradeLevelType}
            theme={themeMode}
            title="Badges"
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px', marginTop: '4px' }}>
              {allAchievements.slice(0, 6).map((a, i) => (
                <div 
                  key={i}
                  style={{ 
                    width: '20px', 
                    height: '20px', 
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: a.earned 
                      ? 'linear-gradient(135deg, #ffd700, #ffed4e)'
                      : theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '4px',
                    boxShadow: a.earned ? '0 1px 4px rgba(255, 215, 0, 0.3)' : 'none'
                  }}
                  title={a.name}
                >
                  {a.icon}
                </div>
              ))}
            </div>
          </BentoTile>
        </div>

      {/* Row 3: Progress (2 cols), Achievements (2 cols) */}
      {/* Progress Overview - spans 2 columns */}
      <div className={`${styles.bentoTile} ${styles.bentoTileProgress}`} style={{ gridArea: 'progress' }}>
        <h4 className={styles.tileTitle}>Progress Tracking</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
          <div>
            <p style={{ fontSize: '11px', opacity: 0.7 }}>Daily</p>
            <div className={styles.progressBar} style={{ height: '4px' }}>
              <div className={styles.progressFill} style={{ width: `${progressData.daily}%` }} />
            </div>
            <p style={{ fontSize: '12px', marginTop: '2px' }}>{progressData.daily}%</p>
          </div>
          <div>
            <p style={{ fontSize: '11px', opacity: 0.7 }}>Weekly</p>
            <div className={styles.progressBar} style={{ height: '4px' }}>
              <div className={styles.progressFill} style={{ width: `${progressData.weekly}%` }} />
            </div>
            <p style={{ fontSize: '12px', marginTop: '2px' }}>{progressData.weekly}%</p>
          </div>
        </div>
      </div>

      {/* Achievements - spans 2 columns */}
      <div className={`${styles.bentoTile}`} style={{ gridArea: 'achievements' }}>
        <h4 className={styles.tileTitle}>Recent Achievements</h4>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
          {allAchievements.filter(a => a.earned).slice(0, 3).map((a, i) => (
            <div 
              key={i}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                padding: '4px 8px',
                background: 'rgba(255, 215, 0, 0.2)',
                borderRadius: '12px',
                fontSize: '12px'
              }}
            >
              <span>{a.icon}</span>
              <span>{a.name}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '11px', opacity: 0.7, marginTop: '8px' }}>
          Next: {allAchievements.find(a => !a.earned)?.name}
        </p>
      </div>

      {/* Row 4: Schedule (2 cols), Resources, Social */}
      {/* Schedule - spans 2 columns */}
      <div className={`${styles.bentoTile}`} style={{ gridArea: 'schedule' }}>
        <h4 className={styles.tileTitle}>Today's Schedule</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>📐 AP Calculus</span>
            <span style={{ opacity: 0.7 }}>8:00 AM</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>🔬 Chemistry</span>
            <span style={{ opacity: 0.7 }}>9:30 AM</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>📖 English Lit</span>
            <span style={{ opacity: 0.7 }}>11:00 AM</span>
          </div>
        </div>
      </div>

      {/* Resources Tile */}
      <div className={`${styles.bentoTile} ${styles.bentoTileSmall}`} style={{ gridArea: 'resources' }}>
        <h4 className={styles.tileTitle}>Resources</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
          <button style={{ fontSize: '11px', padding: '4px', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            📝 Study Guides
          </button>
          <button style={{ fontSize: '11px', padding: '4px', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            📊 Grade Report
          </button>
        </div>
      </div>

      {/* Social/Leaderboard */}
      <div className={`${styles.bentoTile} ${styles.bentoTileSmall}`} style={{ gridArea: 'social' }}>
        <h4 className={styles.tileTitle}>Leaderboard</h4>
        <div style={{ fontSize: '12px', marginTop: '8px' }}>
          {useRealLeaderboard && leaderboardLoading ? (
            <div style={{ opacity: 0.7 }}>Loading...</div>
          ) : leaderboardData?.players && leaderboardData.players.length > 0 ? (
            <>
              {leaderboardData.players.slice(0, 3).map((player, index) => (
                <div
                  key={player.userId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                    fontWeight: player.isCurrentUser ? 'bold' : 'normal',
                    color: player.isCurrentUser ? 'var(--color-primary)' : 'inherit'
                  }}
                >
                  <span>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'} {player.isCurrentUser ? 'You' : player.displayName}
                  </span>
                  <span>{player.xp}</span>
                </div>
              ))}
            </>
          ) : (
            <div style={{ opacity: 0.7 }}>No leaderboard data yet</div>
          )}
        </div>
      </div>
      </div>
    );
  };
  
  // Return the appropriate dashboard based on grade category
  switch (gradeCategory) {
    case 'elementary':
      return renderElementaryDashboard();
    case 'middle':
      return renderMiddleSchoolDashboard();
    case 'high':
      return renderHighSchoolDashboard();
    default:
      return renderElementaryDashboard();
  }
};

export default BentoDashboard;