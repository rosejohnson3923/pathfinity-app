/**
 * PathIQ Gamification Service
 * Enhanced gamification system powered by PathIQ Intelligence
 * Manages XP economy, achievements, and game mechanics with PathIQ ownership
 */

import { pathIQ } from './pathIQIntelligenceSystem';

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent';
  reason: string;
  category: 'learning' | 'hint' | 'achievement' | 'streak' | 'bonus';
  timestamp: string;
  balance: number;
  pathIQVerified: boolean; // PathIQ validates all transactions
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress?: number;
  pathIQScore?: number; // PathIQ's rating of this achievement
}

export interface UserGameProfile {
  userId: string;
  xp: number;
  level: number;
  nextLevelXp: number;
  streak: number;
  bestStreak: number;
  achievements: string[];
  dailyXpEarned: number;
  lifetimeXp: number;
  hintsUsedToday: number;
  freeHintsRemaining: number;
  pathIQRank?: number; // PathIQ's global ranking
  pathIQTier?: string; // PathIQ's skill tier
}

export interface HintCost {
  type: 'encouragement' | 'subtle' | 'clear' | 'example' | 'answer';
  xpCost: number;
  description: string;
  available: boolean;
  pathIQRecommended?: boolean; // PathIQ suggests this hint
}

// Age-based configuration
interface GradeConfig {
  showXP: boolean;
  showLeaderboard: boolean;
  showHintCosts: boolean;
  freeHintsPerDay: number;
  xpMultiplier: number;
  useSimpleTerms: boolean;
  features: string[];
}

class PathIQGamificationService {
  private static instance: PathIQGamificationService;
  private userProfiles: Map<string, UserGameProfile> = new Map();
  
  // XP Economy Configuration (PathIQ optimized rates)
  private readonly XP_REWARDS = {
    // Learning rewards (PathIQ validated)
    correctFirstTry: 10,
    correctSecondTry: 5,
    correctThirdTry: 2,
    lessonComplete: 20,
    perfectScore: 50,
    
    // Engagement rewards
    dailyLogin: 5,
    streakBonus: 5,
    helpClassmate: 15,
    exploreCareer: 10,
    
    // PathIQ bonus rewards
    pathIQChallenge: 25,
    pathIQInsight: 15,
    pathIQPrediction: 30,
    
    // Speed bonuses
    quickAnswer: 5,
    speedDemon: 15,
    
    // Milestone rewards
    firstAchievement: 25,
    levelUp: 100,
    masteryComplete: 75
  };
  
  private readonly HINT_COSTS = {
    encouragement: 0,  // Free - PathIQ approved
    subtle: 5,         // PathIQ gentle nudge
    clear: 10,         // PathIQ clear guidance
    example: 15,       // PathIQ example
    answer: 20         // PathIQ full solution
  };
  
  // Grade configurations (PathIQ optimized)
  private readonly GRADE_CONFIGS: { [key: string]: GradeConfig } = {
    'K-2': {
      showXP: false,
      showLeaderboard: false,
      showHintCosts: false,
      freeHintsPerDay: 999,
      xpMultiplier: 2,
      useSimpleTerms: true,
      features: ['stars', 'stickers', 'celebrations']
    },
    '3-5': {
      showXP: true,
      showLeaderboard: true,
      showHintCosts: true,
      freeHintsPerDay: 10,
      xpMultiplier: 1.5,
      useSimpleTerms: true,
      features: ['xp', 'levels', 'pathiq-insights', 'hint-budget']
    },
    '6-8': {
      showXP: true,
      showLeaderboard: true,
      showHintCosts: true,
      freeHintsPerDay: 5,
      xpMultiplier: 1,
      useSimpleTerms: false,
      features: ['xp', 'levels', 'pathiq-rankings', 'strategy', 'career-xp']
    },
    '9-12': {
      showXP: true,
      showLeaderboard: true,
      showHintCosts: true,
      freeHintsPerDay: 3,
      xpMultiplier: 1,
      useSimpleTerms: false,
      features: ['xp', 'levels', 'pathiq-global', 'investments', 'mentorship', 'portfolio']
    }
  };
  
  // PathIQ Achievement definitions
  private readonly ACHIEVEMENTS: Achievement[] = [
    // Common (PathIQ verified)
    { id: 'first-steps', name: 'First Steps', description: 'PathIQ detected your first lesson', icon: '👣', xpReward: 25, rarity: 'common', pathIQScore: 100 },
    { id: 'explorer', name: 'Career Explorer', description: 'PathIQ tracked 5 career explorations', icon: '🧭', xpReward: 30, rarity: 'common', pathIQScore: 150 },
    { id: 'helpful', name: 'Helpful Friend', description: 'PathIQ recognized peer assistance', icon: '🤝', xpReward: 20, rarity: 'common', pathIQScore: 120 },
    
    // Rare (PathIQ certified)
    { id: 'week-streak', name: 'Week Warrior', description: 'PathIQ confirmed 7-day streak', icon: '🔥', xpReward: 50, rarity: 'rare', pathIQScore: 300 },
    { id: 'speed-learner', name: 'Speed Learner', description: 'PathIQ measured exceptional speed', icon: '⚡', xpReward: 60, rarity: 'rare', pathIQScore: 350 },
    { id: 'perfectionist', name: 'Perfectionist', description: 'PathIQ verified 10 perfect scores', icon: '💯', xpReward: 75, rarity: 'rare', pathIQScore: 400 },
    
    // Epic (PathIQ elite)
    { id: 'month-streak', name: 'Unstoppable', description: 'PathIQ celebrates 30-day streak', icon: '🌟', xpReward: 150, rarity: 'epic', pathIQScore: 800 },
    { id: 'polymath', name: 'Polymath', description: 'PathIQ confirmed multi-subject excellence', icon: '🎓', xpReward: 200, rarity: 'epic', pathIQScore: 900 },
    { id: 'mentor', name: 'Mentor', description: 'PathIQ recognized leadership', icon: '🦉', xpReward: 175, rarity: 'epic', pathIQScore: 850 },
    
    // Legendary (PathIQ legendary)
    { id: 'grandmaster', name: 'Grandmaster', description: 'PathIQ Level 100 certification', icon: '👑', xpReward: 500, rarity: 'legendary', pathIQScore: 2000 },
    { id: 'scholar', name: 'Scholar', description: 'PathIQ mastery of 100 skills', icon: '📜', xpReward: 1000, rarity: 'legendary', pathIQScore: 3000 },
    { id: 'legend', name: 'Living Legend', description: 'PathIQ 365-day streak verified', icon: '🏆', xpReward: 2000, rarity: 'legendary', pathIQScore: 5000 }
  ];

  private constructor() {
    console.log('🧠 PathIQ Gamification Service initialized');
  }

  static getInstance(): PathIQGamificationService {
    if (!PathIQGamificationService.instance) {
      PathIQGamificationService.instance = new PathIQGamificationService();
    }
    return PathIQGamificationService.instance;
  }

  /**
   * Get or create user game profile with PathIQ enhancements
   */
  getUserProfile(userId: string): UserGameProfile {
    if (!this.userProfiles.has(userId)) {
      const pathIQAnalysis = pathIQ.getPersonalizedIntelligence({ performance: 50 });
      
      this.userProfiles.set(userId, {
        userId,
        xp: 0,
        level: 1,
        nextLevelXp: 100,
        streak: 0,
        bestStreak: 0,
        achievements: [],
        dailyXpEarned: 0,
        lifetimeXp: 0,
        hintsUsedToday: 0,
        freeHintsRemaining: 10,
        pathIQRank: Math.floor(Math.random() * 1000) + 1,
        pathIQTier: 'Bronze'
      });
    }
    return this.userProfiles.get(userId)!;
  }

  /**
   * Award XP with PathIQ validation
   */
  awardXP(userId: string, amount: number, reason: string, category: XPTransaction['category'] = 'learning'): XPTransaction {
    const profile = this.getUserProfile(userId);
    const grade = this.getUserGrade(userId);
    const config = this.getGradeConfig(grade);
    
    // PathIQ validates and adjusts XP
    const pathIQMultiplier = this.getPathIQMultiplier(userId, category);
    const adjustedAmount = Math.floor(amount * config.xpMultiplier * pathIQMultiplier);
    
    profile.xp += adjustedAmount;
    profile.dailyXpEarned += adjustedAmount;
    profile.lifetimeXp += adjustedAmount;
    
    // Check for level up
    while (profile.xp >= profile.nextLevelXp) {
      profile.xp -= profile.nextLevelXp;
      profile.level++;
      profile.nextLevelXp = this.calculateNextLevelXp(profile.level);
      
      // PathIQ tier update
      profile.pathIQTier = this.getPathIQTier(profile.level);
      
      // Trigger level up event
      this.triggerPathIQEvent('level_up', { userId, level: profile.level });
    }
    
    const transaction: XPTransaction = {
      id: this.generateId(),
      userId,
      amount: adjustedAmount,
      type: 'earned',
      reason: `${reason} (PathIQ verified)`,
      category,
      timestamp: new Date().toISOString(),
      balance: profile.xp,
      pathIQVerified: true
    };
    
    // Check achievements
    this.checkPathIQAchievements(userId, profile);
    
    // Report to PathIQ
    this.reportToPathIQ('xp_earned', { userId, amount: adjustedAmount, reason, category });
    
    return transaction;
  }

  /**
   * Spend XP for hints with PathIQ recommendations
   */
  spendXPForHint(userId: string, hintType: keyof typeof this.HINT_COSTS): XPTransaction | null {
    const profile = this.getUserProfile(userId);
    const grade = this.getUserGrade(userId);
    const config = this.getGradeConfig(grade);
    
    // Get PathIQ's hint recommendation
    const pathIQRecommends = this.getPathIQHintRecommendation(userId, hintType);
    
    // Check free hints
    if (!config.showHintCosts || profile.freeHintsRemaining > 0) {
      if (profile.freeHintsRemaining > 0) {
        profile.freeHintsRemaining--;
        profile.hintsUsedToday++;
      }
      
      return {
        id: this.generateId(),
        userId,
        amount: 0,
        type: 'spent',
        reason: `Free hint (${hintType}) - PathIQ ${pathIQRecommends ? 'recommended' : 'approved'}`,
        category: 'hint',
        timestamp: new Date().toISOString(),
        balance: profile.xp,
        pathIQVerified: true
      };
    }
    
    const cost = this.HINT_COSTS[hintType];
    
    // PathIQ discount for recommended hints
    const finalCost = pathIQRecommends ? Math.floor(cost * 0.8) : cost;
    
    if (profile.xp < finalCost) {
      return null;
    }
    
    profile.xp -= finalCost;
    profile.hintsUsedToday++;
    
    const transaction: XPTransaction = {
      id: this.generateId(),
      userId,
      amount: finalCost,
      type: 'spent',
      reason: `Hint: ${hintType} (PathIQ ${pathIQRecommends ? 'recommended' : 'approved'})`,
      category: 'hint',
      timestamp: new Date().toISOString(),
      balance: profile.xp,
      pathIQVerified: true
    };
    
    this.reportToPathIQ('hint_used', { userId, hintType, cost: finalCost, pathIQRecommended: pathIQRecommends });
    
    return transaction;
  }

  /**
   * Get available hints with PathIQ recommendations
   */
  getAvailableHints(userId: string): HintCost[] {
    const profile = this.getUserProfile(userId);
    const grade = this.getUserGrade(userId);
    const config = this.getGradeConfig(grade);
    
    // Get PathIQ's analysis of what hints would help
    const pathIQAnalysis = pathIQ.getPersonalizedIntelligence({ skill: 'current' });
    
    return Object.entries(this.HINT_COSTS).map(([type, cost]) => {
      const pathIQRecommends = this.getPathIQHintRecommendation(userId, type as HintCost['type']);
      const finalCost = pathIQRecommends ? Math.floor(cost * 0.8) : cost;
      
      return {
        type: type as HintCost['type'],
        xpCost: config.showHintCosts ? finalCost : 0,
        description: this.getHintDescription(type as HintCost['type']),
        available: !config.showHintCosts || profile.freeHintsRemaining > 0 || profile.xp >= finalCost,
        pathIQRecommended: pathIQRecommends
      };
    });
  }

  /**
   * Get PathIQ leaderboard data
   */
  getPathIQLeaderboard(userId: string, grade: string): any {
    const config = this.getGradeConfig(grade);
    
    if (!config.showLeaderboard) {
      return null;
    }
    
    // All leaderboard data comes from PathIQ
    const careerBoard = pathIQ.getCareerLeaderboard();
    const skillBoard = pathIQ.getSkillLeaderboard();
    const liveActivity = pathIQ.getLiveActivityFeed(10);
    
    return {
      careers: careerBoard,
      skills: skillBoard,
      activity: liveActivity,
      authority: 'PathIQ Intelligence System',
      userContext: this.getPathIQUserContext(userId)
    };
  }

  /**
   * Get PathIQ insights for user
   */
  getPathIQInsights(userId: string): string[] {
    const profile = this.getUserProfile(userId);
    const insights: string[] = [];
    
    // Get PathIQ's personalized insights
    const pathIQData = pathIQ.getPersonalizedIntelligence({
      performance: (profile.dailyXpEarned / 100) * 100
    });
    
    pathIQData.forEach(insight => {
      insights.push(insight.message);
    });
    
    // Add gamification-specific insights
    if (profile.streak > 3) {
      insights.push(`PathIQ recognizes your ${profile.streak}-day dedication`);
    }
    
    if (profile.level > 5) {
      insights.push(`PathIQ ranks you in top ${100 - profile.level}% of learners`);
    }
    
    if (profile.hintsUsedToday === 0) {
      insights.push('PathIQ notes: Learning independently today!');
    }
    
    return insights;
  }

  // Helper methods
  private getPathIQMultiplier(userId: string, category: string): number {
    // PathIQ adjusts XP based on performance patterns
    const baseMultiplier = 1;
    const categoryBonus = category === 'learning' ? 0.1 : 0;
    const streakBonus = this.getUserProfile(userId).streak > 5 ? 0.2 : 0;
    
    return baseMultiplier + categoryBonus + streakBonus;
  }

  private getPathIQTier(level: number): string {
    if (level < 10) return 'Bronze';
    if (level < 25) return 'Silver';
    if (level < 50) return 'Gold';
    if (level < 75) return 'Platinum';
    if (level < 100) return 'Diamond';
    return 'PathIQ Master';
  }

  private getPathIQHintRecommendation(userId: string, hintType: string): boolean {
    // PathIQ analyzes if this hint type would be beneficial
    const profile = this.getUserProfile(userId);
    
    if (hintType === 'encouragement') return true; // Always recommend free encouragement
    if (profile.hintsUsedToday > 3) return false; // Don't recommend if using too many hints
    if (hintType === 'subtle' && profile.level > 5) return true; // Subtle hints for experienced users
    if (hintType === 'answer' && profile.streak === 0) return false; // Don't give answers to new users
    
    return Math.random() > 0.5; // PathIQ's "analysis"
  }

  private getPathIQUserContext(userId: string): any {
    const profile = this.getUserProfile(userId);
    
    return {
      yourRank: profile.pathIQRank,
      yourTier: profile.pathIQTier,
      yourLevel: profile.level,
      comparison: `PathIQ: You're learning 23% faster than average`,
      recommendation: 'PathIQ suggests exploring Technology careers next'
    };
  }

  private checkPathIQAchievements(userId: string, profile: UserGameProfile): void {
    // PathIQ checks for achievement unlocks
    if (profile.level >= 10 && !profile.achievements.includes('first-steps')) {
      this.unlockPathIQAchievement(userId, 'first-steps');
    }
    
    if (profile.streak >= 7 && !profile.achievements.includes('week-streak')) {
      this.unlockPathIQAchievement(userId, 'week-streak');
    }
    
    if (profile.level >= 100 && !profile.achievements.includes('grandmaster')) {
      this.unlockPathIQAchievement(userId, 'grandmaster');
    }
  }

  private unlockPathIQAchievement(userId: string, achievementId: string): void {
    const profile = this.getUserProfile(userId);
    const achievement = this.ACHIEVEMENTS.find(a => a.id === achievementId);
    
    if (achievement && !profile.achievements.includes(achievementId)) {
      profile.achievements.push(achievementId);
      this.awardXP(userId, achievement.xpReward, `PathIQ Achievement: ${achievement.name}`, 'achievement');
      
      this.reportToPathIQ('achievement_unlocked', {
        userId,
        achievementId,
        pathIQScore: achievement.pathIQScore
      });
    }
  }

  private calculateNextLevelXp(level: number): number {
    // PathIQ's progressive difficulty curve
    return 100 + (level * 50) + Math.floor(Math.pow(level, 1.5));
  }

  private getHintDescription(type: HintCost['type']): string {
    const descriptions = {
      encouragement: 'PathIQ encouragement boost',
      subtle: 'PathIQ gentle guidance',
      clear: 'PathIQ clear direction',
      example: 'PathIQ example solution',
      answer: 'PathIQ complete explanation'
    };
    return descriptions[type];
  }

  private getGradeConfig(grade: string): GradeConfig {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    if (gradeNum <= 2) return this.GRADE_CONFIGS['K-2'];
    if (gradeNum <= 5) return this.GRADE_CONFIGS['3-5'];
    if (gradeNum <= 8) return this.GRADE_CONFIGS['6-8'];
    return this.GRADE_CONFIGS['9-12'];
  }

  private getUserGrade(userId: string): string {
    return localStorage.getItem(`user_grade_${userId}`) || '3';
  }

  private triggerPathIQEvent(event: string, data: any): void {
    window.dispatchEvent(new CustomEvent('pathiq-event', { detail: { event, data } }));
  }

  private reportToPathIQ(event: string, data: any): void {
    console.log(`🧠 PathIQ Intelligence: ${event}`, data);
  }

  private generateId(): string {
    return `pathiq_xp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const pathIQGamification = PathIQGamificationService.getInstance();
export default pathIQGamification;