/**
 * Leaderboard Service
 * Gamification system showing top skills, careers, and achievements
 * Uses mock data to demonstrate value and encourage exploration
 */

import { pathIQService } from './pathIQService';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  change?: number; // Position change from last week
  details?: string;
}

interface SkillLeaderboard {
  skill: string;
  subject: string;
  totalLearners: number;
  topPerformers: LeaderboardEntry[];
  averageScore: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface CareerLeaderboard {
  careerId: string;
  careerName: string;
  careerIcon: string;
  category: string;
  totalExplorers: number;
  growthRate: number; // Percentage growth this week
  topExplorers: LeaderboardEntry[];
  averageEngagement: number;
}

interface SchoolLeaderboard {
  schoolId: string;
  schoolName: string;
  totalStudents: number;
  averageScore: number;
  topSkills: string[];
  topCareers: string[];
}

interface AchievementLeaderboard {
  achievementId: string;
  achievementName: string;
  achievementIcon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedBy: number; // Number of students
  recentUnlocks: LeaderboardEntry[];
}

class LeaderboardService {
  private static instance: LeaderboardService;
  private readonly STORAGE_KEY = 'pathfinity_leaderboards';
  private readonly MOCK_NAMES = [
    'Alex Chen', 'Sam Johnson', 'Maya Patel', 'Jordan Smith', 'Emma Wilson',
    'Liam Brown', 'Sofia Garcia', 'Noah Martinez', 'Ava Robinson', 'Oliver Lee',
    'Isabella Jones', 'Ethan Davis', 'Mia Anderson', 'Lucas Taylor', 'Charlotte White',
    'Mason Thomas', 'Amelia Jackson', 'Logan Harris', 'Harper Martin', 'Elijah Thompson'
  ];

  private readonly MOCK_SCHOOLS = [
    'Riverside Elementary', 'Oakwood Middle School', 'Central High', 'Westside Academy',
    'Northview Elementary', 'Eastdale Middle', 'Southpark High', 'Valley View School'
  ];

  private constructor() {
    this.initializeMockData();
  }

  static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  /**
   * Initialize mock data for demonstration
   */
  private initializeMockData(): void {
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (!existing) {
      const mockData = this.generateMockLeaderboards();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockData));
    }
  }

  /**
   * Generate comprehensive mock leaderboard data
   */
  private generateMockLeaderboards(gradeLevel?: string) {
    const data = {
      lastUpdated: new Date().toISOString(),
      skills: this.generateSkillLeaderboards(),
      careers: this.generateCareerLeaderboards(gradeLevel),
      schools: this.generateSchoolLeaderboards(),
      achievements: this.generateAchievementLeaderboards(),
      weekly: this.generateWeeklyHighlights(),
      trending: this.generateTrendingData(gradeLevel)
    };
    return data;
  }

  /**
   * Generate skill leaderboards with mock data
   */
  private generateSkillLeaderboards(): SkillLeaderboard[] {
    const skills = [
      { skill: 'Counting to 10', subject: 'Math', difficulty: 'easy' as const, baseScore: 95 },
      { skill: 'Addition', subject: 'Math', difficulty: 'medium' as const, baseScore: 88 },
      { skill: 'Letter Recognition', subject: 'ELA', difficulty: 'easy' as const, baseScore: 92 },
      { skill: 'Reading Comprehension', subject: 'ELA', difficulty: 'hard' as const, baseScore: 78 },
      { skill: 'States of Matter', subject: 'Science', difficulty: 'medium' as const, baseScore: 85 },
      { skill: 'Community Helpers', subject: 'Social Studies', difficulty: 'easy' as const, baseScore: 90 }
    ];

    return skills.map(skill => ({
      skill: skill.skill,
      subject: skill.subject,
      totalLearners: Math.floor(Math.random() * 500) + 100,
      topPerformers: this.generateTopPerformers(5, skill.baseScore),
      averageScore: skill.baseScore - Math.random() * 10,
      difficulty: skill.difficulty
    }));
  }

  /**
   * Generate career leaderboards with mock data (grade-aware)
   */
  private generateCareerLeaderboards(gradeLevel?: string): CareerLeaderboard[] {
    // Default to Kindergarten if no grade provided
    const grade = gradeLevel || 'K';
    
    // Get grade-appropriate careers from PathIQ
    const careerSelection = pathIQService.getCareerSelections('mock-user', grade);
    
    // Use recommended careers and passion careers for leaderboard
    const allCareers = [
      ...careerSelection.recommended.map((c: any) => ({
        id: c.careerId,
        name: c.name,
        icon: c.icon,
        category: this.mapToCategory(c.careerId),
        baseEngagement: 80 + Math.random() * 20
      })),
      ...careerSelection.passionCareers.slice(0, 5).map((c: any) => ({
        id: c.careerId,
        name: c.name,
        icon: c.icon,
        category: this.mapToCategory(c.careerId),
        baseEngagement: 75 + Math.random() * 20
      }))
    ];

    return allCareers.map(career => ({
      careerId: career.id,
      careerName: career.name,
      careerIcon: career.icon,
      category: career.category,
      totalExplorers: Math.floor(Math.random() * 300) + 50,
      growthRate: Math.floor(Math.random() * 40) - 10, // -10% to +30%
      topExplorers: this.generateTopPerformers(3, career.baseEngagement),
      averageEngagement: career.baseEngagement - Math.random() * 5
    }));
  }
  
  /**
   * Map career ID to category for display
   */
  private mapToCategory(careerId: string): string {
    const categoryMap: Record<string, string> = {
      'teacher': 'Education',
      'doctor': 'Healthcare',
      'nurse': 'Healthcare',
      'firefighter': 'Safety',
      'police-officer': 'Safety',
      'chef': 'Hospitality',
      'artist': 'Creative',
      'musician': 'Creative',
      'scientist': 'STEM',
      'veterinarian': 'Animal Care',
      'librarian': 'Education',
      'pilot': 'Transportation',
      'farmer': 'Agriculture',
      'architect': 'Design',
      'engineer': 'STEM'
    };
    return categoryMap[careerId] || 'General';
  }

  /**
   * Generate school leaderboards
   */
  private generateSchoolLeaderboards(): SchoolLeaderboard[] {
    return this.MOCK_SCHOOLS.slice(0, 5).map(school => ({
      schoolId: school.toLowerCase().replace(/\s/g, '-'),
      schoolName: school,
      totalStudents: Math.floor(Math.random() * 500) + 100,
      averageScore: Math.floor(Math.random() * 20) + 75,
      topSkills: ['Math', 'Reading', 'Science'].sort(() => Math.random() - 0.5).slice(0, 2),
      topCareers: ['Doctor', 'Teacher', 'Engineer'].sort(() => Math.random() - 0.5).slice(0, 2)
    }));
  }

  /**
   * Generate achievement leaderboards
   */
  private generateAchievementLeaderboards(): AchievementLeaderboard[] {
    const achievements = [
      { id: 'first-career', name: 'Career Explorer', icon: '🎯', rarity: 'common' as const },
      { id: 'streak-7', name: '7-Day Streak', icon: '🔥', rarity: 'rare' as const },
      { id: 'perfect-week', name: 'Perfect Week', icon: '⭐', rarity: 'epic' as const },
      { id: 'master-learner', name: 'Master Learner', icon: '🏆', rarity: 'legendary' as const },
      { id: 'speed-demon', name: 'Speed Demon', icon: '⚡', rarity: 'rare' as const },
      { id: 'helper', name: 'Helpful Friend', icon: '🤝', rarity: 'common' as const }
    ];

    return achievements.map(achievement => ({
      achievementId: achievement.id,
      achievementName: achievement.name,
      achievementIcon: achievement.icon,
      rarity: achievement.rarity,
      unlockedBy: achievement.rarity === 'common' ? Math.floor(Math.random() * 200) + 100 :
                  achievement.rarity === 'rare' ? Math.floor(Math.random() * 100) + 20 :
                  achievement.rarity === 'epic' ? Math.floor(Math.random() * 30) + 5 :
                  Math.floor(Math.random() * 10) + 1,
      recentUnlocks: this.generateTopPerformers(3, 100)
    }));
  }

  /**
   * Generate weekly highlights
   */
  private generateWeeklyHighlights() {
    return {
      mostImprovedStudent: this.MOCK_NAMES[Math.floor(Math.random() * this.MOCK_NAMES.length)],
      fastestLearner: this.MOCK_NAMES[Math.floor(Math.random() * this.MOCK_NAMES.length)],
      mostCareersExplored: this.MOCK_NAMES[Math.floor(Math.random() * this.MOCK_NAMES.length)],
      longestStreak: Math.floor(Math.random() * 20) + 5,
      totalSkillsLearned: Math.floor(Math.random() * 1000) + 500,
      totalCareersExplored: Math.floor(Math.random() * 500) + 200
    };
  }

  /**
   * Generate trending data (grade-aware)
   */
  private generateTrendingData(gradeLevel?: string) {
    // Get grade-appropriate trending career
    const grade = gradeLevel || 'K';
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    
    // Different trending careers by grade level
    const trendingByGrade = {
      'K': { name: 'Community Helper', growth: '+25%', icon: '🤝' },
      '1': { name: 'Teacher', growth: '+30%', icon: '👨‍🏫' },
      '2': { name: 'Veterinarian', growth: '+35%', icon: '🐾' },
      '3': { name: 'Artist', growth: '+28%', icon: '🎨' },
      '4': { name: 'Scientist', growth: '+32%', icon: '🔬' },
      '5': { name: 'Engineer', growth: '+38%', icon: '⚙️' },
      '6': { name: 'Game Designer', growth: '+42%', icon: '🎮' },
      '7': { name: 'Robotics Engineer', growth: '+45%', icon: '🤖' },
      '8': { name: 'AI Specialist', growth: '+48%', icon: '🧠' }
    };
    
    const hottestCareer = trendingByGrade[grade] || trendingByGrade['K'];
    
    return {
      hottestCareer,
      risingSkill: { name: 'Critical Thinking', growth: '+32%', subject: 'General' },
      topChallenge: { name: 'Math Marathon', participants: 234 },
      communityGoal: { 
        name: 'Explore 1000 Careers', 
        current: 823, 
        target: 1000,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  }

  /**
   * Generate top performers with mock data
   */
  private generateTopPerformers(count: number, baseScore: number): LeaderboardEntry[] {
    const performers: LeaderboardEntry[] = [];
    const usedNames = new Set<string>();
    
    for (let i = 0; i < count; i++) {
      let name;
      do {
        name = this.MOCK_NAMES[Math.floor(Math.random() * this.MOCK_NAMES.length)];
      } while (usedNames.has(name));
      
      usedNames.add(name);
      
      performers.push({
        id: `user-${Math.random().toString(36).substr(2, 9)}`,
        name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        score: Math.floor(baseScore - (i * 2) + (Math.random() * 5)),
        trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
        change: Math.floor(Math.random() * 5) - 2,
        details: this.generatePerformerDetails()
      });
    }
    
    return performers;
  }

  /**
   * Generate performer details
   */
  private generatePerformerDetails(): string {
    const details = [
      'Completed in record time!',
      'Perfect score on first try',
      '5-day streak',
      'Helped 3 classmates',
      'Mastered all challenges',
      'Quick learner',
      'Great problem solver',
      'Creative thinker'
    ];
    return details[Math.floor(Math.random() * details.length)];
  }

  /**
   * Get top skills leaderboard
   */
  getTopSkills(limit: number = 5): SkillLeaderboard[] {
    const data = this.getLeaderboardData();
    return data.skills
      .sort((a, b) => b.totalLearners - a.totalLearners)
      .slice(0, limit);
  }

  /**
   * Get top careers leaderboard (grade-aware)
   */
  getTopCareers(limit: number = 5, gradeLevel?: string): CareerLeaderboard[] {
    const data = this.getLeaderboardData(gradeLevel);
    return data.careers
      .sort((a, b) => b.totalExplorers - a.totalExplorers)
      .slice(0, limit);
  }

  /**
   * Get trending careers (highest growth, grade-aware)
   */
  getTrendingCareers(limit: number = 3, gradeLevel?: string): CareerLeaderboard[] {
    const data = this.getLeaderboardData(gradeLevel);
    return data.careers
      .filter(c => c.growthRate > 0)
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, limit);
  }

  /**
   * Get school rankings
   */
  getSchoolRankings(): SchoolLeaderboard[] {
    const data = this.getLeaderboardData();
    return data.schools.sort((a, b) => b.averageScore - a.averageScore);
  }

  /**
   * Get recent achievements
   */
  getRecentAchievements(limit: number = 5): AchievementLeaderboard[] {
    const data = this.getLeaderboardData();
    return data.achievements.slice(0, limit);
  }

  /**
   * Get weekly highlights
   */
  getWeeklyHighlights() {
    const data = this.getLeaderboardData();
    return data.weekly;
  }

  /**
   * Get trending data
   */
  getTrendingData() {
    const data = this.getLeaderboardData();
    return data.trending;
  }

  /**
   * Get user's position in leaderboard
   */
  getUserPosition(userId: string, leaderboardType: 'skills' | 'careers' | 'achievements'): {
    position: number;
    percentile: number;
    nearbyUsers: LeaderboardEntry[];
  } {
    // Mock implementation - in production, this would query real data
    const position = Math.floor(Math.random() * 100) + 1;
    const totalUsers = 500;
    const percentile = Math.round((1 - position / totalUsers) * 100);
    
    return {
      position,
      percentile,
      nearbyUsers: this.generateTopPerformers(5, 85)
    };
  }

  /**
   * Add user achievement (for real-time updates)
   */
  addUserAchievement(userId: string, achievementId: string, score: number): void {
    const data = this.getLeaderboardData();
    
    // Find achievement and add user to recent unlocks
    const achievement = data.achievements.find(a => a.achievementId === achievementId);
    if (achievement) {
      achievement.unlockedBy++;
      achievement.recentUnlocks.unshift({
        id: userId,
        name: 'You',
        score,
        trend: 'up',
        change: 0,
        details: 'Just unlocked!'
      });
      achievement.recentUnlocks = achievement.recentUnlocks.slice(0, 5);
    }
    
    this.saveLeaderboardData(data);
  }

  /**
   * Update user progress
   */
  updateUserProgress(userId: string, skillId: string, score: number): void {
    const data = this.getLeaderboardData();
    
    // Update skill leaderboard
    const skill = data.skills.find(s => s.skill === skillId);
    if (skill) {
      skill.totalLearners++;
      // Update average score
      skill.averageScore = (skill.averageScore * (skill.totalLearners - 1) + score) / skill.totalLearners;
      
      // Check if user makes it to top performers
      if (score > skill.topPerformers[skill.topPerformers.length - 1]?.score || skill.topPerformers.length < 5) {
        skill.topPerformers.push({
          id: userId,
          name: 'You',
          score,
          trend: 'up',
          change: 0,
          details: 'New high score!'
        });
        skill.topPerformers.sort((a, b) => b.score - a.score);
        skill.topPerformers = skill.topPerformers.slice(0, 5);
      }
    }
    
    this.saveLeaderboardData(data);
  }

  /**
   * Get personalized insights for a user
   */
  getPersonalizedInsights(userId: string): string[] {
    const insights: string[] = [];
    const data = this.getLeaderboardData();
    
    // Compare to trending
    insights.push(`The hottest career right now is ${data.trending.hottestCareer.name} with ${data.trending.hottestCareer.growth} growth!`);
    insights.push(`${data.trending.risingSkill.name} is the fastest growing skill this week`);
    
    // Community goal
    const goalProgress = Math.round((data.trending.communityGoal.current / data.trending.communityGoal.target) * 100);
    insights.push(`Help us reach our community goal: ${goalProgress}% complete!`);
    
    // Random motivational
    const motivational = [
      'You\'re in the top 20% of learners this week!',
      'Your learning speed is 30% faster than average',
      'You\'ve explored more careers than 75% of students',
      'Keep going! You\'re just 2 skills away from a new achievement'
    ];
    insights.push(motivational[Math.floor(Math.random() * motivational.length)]);
    
    return insights;
  }

  /**
   * Get class comparison data (for teachers)
   */
  getClassComparison(classId: string): {
    classRank: number;
    totalClasses: number;
    strengths: string[];
    improvements: string[];
    topStudent: string;
  } {
    return {
      classRank: Math.floor(Math.random() * 10) + 1,
      totalClasses: 25,
      strengths: ['Math Problem Solving', 'Career Exploration', 'Team Collaboration'],
      improvements: ['Reading Speed', 'Science Concepts'],
      topStudent: this.MOCK_NAMES[Math.floor(Math.random() * this.MOCK_NAMES.length)]
    };
  }

  /**
   * Get leaderboard data from storage (grade-aware)
   */
  private getLeaderboardData(gradeLevel?: string): any {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    // If grade level is provided, regenerate with grade-appropriate data
    if (gradeLevel) {
      return this.generateMockLeaderboards(gradeLevel);
    }
    return stored ? JSON.parse(stored) : this.generateMockLeaderboards();
  }

  /**
   * Save leaderboard data to storage
   */
  private saveLeaderboardData(data: any): void {
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Refresh leaderboard data (simulate real-time updates)
   */
  refreshLeaderboards(): void {
    const newData = this.generateMockLeaderboards();
    this.saveLeaderboardData(newData);
  }
}

export const leaderboardService = LeaderboardService.getInstance();
export type { LeaderboardEntry, SkillLeaderboard, CareerLeaderboard, SchoolLeaderboard, AchievementLeaderboard };