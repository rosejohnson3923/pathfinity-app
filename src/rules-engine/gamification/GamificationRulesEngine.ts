/**
 * Gamification Rules Engine
 * Manages progression, rewards, badges, and achievements
 */

import { BaseRulesEngine, Rule, RuleContext, RuleResult } from '../core/BaseRulesEngine';

// ============================================================================
// GAMIFICATION TYPE DEFINITIONS
// ============================================================================

export interface GamificationContext extends RuleContext {
  student: {
    id: string;
    grade?: string;
    level?: number;
    totalPoints?: number;
    currentStreak?: number;
    lastActivityDate?: Date;
  };
  activity: {
    type: 'lesson' | 'practice' | 'assessment' | 'exploration' | 'challenge';
    subject?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    duration?: number; // in milliseconds
    performance?: number; // 0-1 score
  };
  career?: {
    id: string;
    name: string;
  };
  achievement?: {
    type: string;
    value?: any;
  };
}

export interface ProgressionRules {
  points: PointRules;
  levels: LevelRules;
  streaks: StreakRules;
  multipliers: MultiplierRules;
}

export interface PointRules {
  base: {
    correctAnswer: number;
    firstTry: number;
    hint: number;
    retry: number;
  };
  bonus: {
    speed: number; // For quick completion
    accuracy: number; // For perfect score
    streak: number; // Per day in streak
    career: number; // Career-related bonus
  };
  penalties: {
    wrongAnswer: number;
    timeout: number;
    skip: number;
  };
}

export interface LevelRules {
  calculation: 'linear' | 'logarithmic' | 'exponential';
  thresholds: number[];
  rewards: Map<number, LevelReward>;
  titles: Map<number, string>;
}

export interface LevelReward {
  level: number;
  title: string;
  badge?: string;
  points?: number;
  unlock?: string[];
  companion?: string;
}

export interface StreakRules {
  minimum: number; // Minimum activities for streak
  window: number; // Hours to maintain streak
  rewards: Map<number, StreakReward>;
  recovery: {
    enabled: boolean;
    cost: number; // Points to recover streak
    maxDays: number;
  };
}

export interface StreakReward {
  days: number;
  points: number;
  badge?: string;
  multiplier?: number;
}

export interface MultiplierRules {
  base: number;
  max: number;
  factors: {
    streak: number;
    level: number;
    difficulty: number;
    career: number;
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skill' | 'career' | 'streak' | 'exploration' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: BadgeRequirement[];
  points: number;
  unlockedAt?: Date;
}

export interface BadgeRequirement {
  type: 'points' | 'level' | 'streak' | 'completion' | 'perfect' | 'career' | 'custom';
  value: any;
  description: string;
}

export interface CareerAchievement {
  career: string;
  achievements: {
    badges: Badge[];
    milestones: Milestone[];
    specialRewards: SpecialReward[];
  };
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  requirement: number;
  type: 'problems_solved' | 'days_practiced' | 'concepts_mastered';
  reward: {
    points: number;
    badge?: string;
    title?: string;
  };
}

export interface SpecialReward {
  id: string;
  name: string;
  type: 'avatar' | 'theme' | 'companion_outfit' | 'certificate';
  requirement: string;
  unlocked: boolean;
}

export interface Leaderboard {
  scope: 'class' | 'grade' | 'school' | 'global';
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  entries: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  points: number;
  level: number;
  badges: number;
  trend: 'up' | 'down' | 'stable';
}

// ============================================================================
// GAMIFICATION RULES ENGINE
// ============================================================================

export class GamificationRulesEngine extends BaseRulesEngine<GamificationContext> {
  private progressionRules: ProgressionRules;
  private badges: Map<string, Badge> = new Map();
  private careerAchievements: Map<string, CareerAchievement> = new Map();
  private studentProgress: Map<string, StudentProgress> = new Map();

  constructor() {
    super('GamificationRulesEngine', {
      name: 'Gamification Rules Engine',
      description: 'Manages progression, rewards, and achievements'
    });
    
    this.progressionRules = this.initializeProgressionRules();
    this.initializeBadges();
    this.initializeCareerAchievements();
  }

  /**
   * Register gamification rules
   */
  protected registerRules(): void {
    // Rule: Calculate points for activity
    this.addRuleInternal({
      id: 'calculate_points',
      name: 'Calculate Activity Points',
      priority: 1,
      condition: (context) => !!context.activity,
      action: (context) => this.calculatePoints(context)
    });

    // Rule: Check level progression
    this.addRuleInternal({
      id: 'check_level',
      name: 'Check Level Progression',
      priority: 2,
      condition: (context) => context.student.totalPoints !== undefined,
      action: (context) => this.checkLevelProgression(context)
    });

    // Rule: Update streak
    this.addRuleInternal({
      id: 'update_streak',
      name: 'Update Learning Streak',
      priority: 3,
      condition: (context) => !!context.student.lastActivityDate,
      action: (context) => this.updateStreak(context)
    });

    // Rule: Apply multipliers
    this.addRuleInternal({
      id: 'apply_multipliers',
      name: 'Apply Point Multipliers',
      priority: 4,
      condition: (context) => true,
      action: (context) => this.applyMultipliers(context)
    });

    // Rule: Check badge eligibility
    this.addRuleInternal({
      id: 'check_badges',
      name: 'Check Badge Eligibility',
      priority: 5,
      condition: (context) => true,
      action: (context) => this.checkBadgeEligibility(context)
    });

    // Rule: Career-specific achievements
    this.addRuleInternal({
      id: 'career_achievements',
      name: 'Check Career Achievements',
      priority: 6,
      condition: (context) => !!context.career,
      action: (context) => this.checkCareerAchievements(context)
    });

    // Rule: Daily bonus
    this.addRuleInternal({
      id: 'daily_bonus',
      name: 'Apply Daily Bonus',
      priority: 7,
      condition: (context) => this.isFirstActivityToday(context),
      action: (context) => this.applyDailyBonus(context)
    });

    // Rule: Milestone rewards
    this.addRuleInternal({
      id: 'milestone_rewards',
      name: 'Check Milestone Rewards',
      priority: 8,
      condition: (context) => true,
      action: (context) => this.checkMilestones(context)
    });
  }

  /**
   * Initialize progression rules
   */
  private initializeProgressionRules(): ProgressionRules {
    return {
      points: {
        base: {
          correctAnswer: 10,
          firstTry: 5,
          hint: 2,
          retry: 3
        },
        bonus: {
          speed: 5,
          accuracy: 10,
          streak: 2,
          career: 3
        },
        penalties: {
          wrongAnswer: -2,
          timeout: -1,
          skip: -5
        }
      },
      levels: {
        calculation: 'logarithmic',
        thresholds: [
          0,     // Level 1
          100,   // Level 2
          250,   // Level 3
          500,   // Level 4
          1000,  // Level 5
          2000,  // Level 6
          3500,  // Level 7
          5500,  // Level 8
          8000,  // Level 9
          11000, // Level 10
          15000, // Level 11
          20000, // Level 12
          26000, // Level 13
          33000, // Level 14
          41000, // Level 15
          50000  // Level 16+
        ],
        rewards: this.createLevelRewards(),
        titles: this.createLevelTitles()
      },
      streaks: {
        minimum: 1,
        window: 36, // 36 hours
        rewards: this.createStreakRewards(),
        recovery: {
          enabled: true,
          cost: 50,
          maxDays: 3
        }
      },
      multipliers: {
        base: 1.0,
        max: 3.0,
        factors: {
          streak: 0.1,
          level: 0.05,
          difficulty: 0.2,
          career: 0.15
        }
      }
    };
  }

  /**
   * Create level rewards
   */
  private createLevelRewards(): Map<number, LevelReward> {
    const rewards = new Map<number, LevelReward>();
    
    rewards.set(2, {
      level: 2,
      title: 'Beginner',
      badge: 'first_level',
      points: 50
    });
    
    rewards.set(5, {
      level: 5,
      title: 'Explorer',
      badge: 'explorer',
      points: 100,
      unlock: ['bonus_hints']
    });
    
    rewards.set(10, {
      level: 10,
      title: 'Achiever',
      badge: 'achiever',
      points: 250,
      unlock: ['challenge_mode'],
      companion: 'special_outfit'
    });
    
    rewards.set(15, {
      level: 15,
      title: 'Master',
      badge: 'master',
      points: 500,
      unlock: ['expert_challenges', 'custom_avatar']
    });
    
    rewards.set(20, {
      level: 20,
      title: 'Legend',
      badge: 'legend',
      points: 1000,
      unlock: ['all_features'],
      companion: 'legendary_companion'
    });

    return rewards;
  }

  /**
   * Create level titles
   */
  private createLevelTitles(): Map<number, string> {
    const titles = new Map<number, string>();
    
    titles.set(1, 'Novice Learner');
    titles.set(2, 'Beginner');
    titles.set(3, 'Student');
    titles.set(4, 'Apprentice');
    titles.set(5, 'Explorer');
    titles.set(6, 'Adventurer');
    titles.set(7, 'Scholar');
    titles.set(8, 'Expert');
    titles.set(9, 'Specialist');
    titles.set(10, 'Achiever');
    titles.set(11, 'Champion');
    titles.set(12, 'Elite');
    titles.set(13, 'Master');
    titles.set(14, 'Grandmaster');
    titles.set(15, 'Sage');
    titles.set(16, 'Legend');
    titles.set(17, 'Mythic');
    titles.set(18, 'Immortal');
    titles.set(19, 'Transcendent');
    titles.set(20, 'Ultimate Master');

    return titles;
  }

  /**
   * Create streak rewards
   */
  private createStreakRewards(): Map<number, StreakReward> {
    const rewards = new Map<number, StreakReward>();
    
    rewards.set(3, { days: 3, points: 30, badge: 'streak_3' });
    rewards.set(7, { days: 7, points: 100, badge: 'week_warrior', multiplier: 1.1 });
    rewards.set(14, { days: 14, points: 250, badge: 'fortnight_fighter', multiplier: 1.2 });
    rewards.set(30, { days: 30, points: 500, badge: 'monthly_master', multiplier: 1.3 });
    rewards.set(60, { days: 60, points: 1000, badge: 'dedicated', multiplier: 1.4 });
    rewards.set(100, { days: 100, points: 2000, badge: 'centurion', multiplier: 1.5 });
    rewards.set(365, { days: 365, points: 5000, badge: 'year_champion', multiplier: 2.0 });

    return rewards;
  }

  /**
   * Initialize badges
   */
  private initializeBadges(): void {
    // Skill badges
    this.badges.set('first_correct', {
      id: 'first_correct',
      name: 'First Step',
      description: 'Answer your first question correctly',
      icon: '🎯',
      category: 'skill',
      rarity: 'common',
      requirements: [{ type: 'completion', value: 1, description: 'Answer 1 question correctly' }],
      points: 10
    });

    this.badges.set('perfect_10', {
      id: 'perfect_10',
      name: 'Perfect Ten',
      description: 'Get 10 questions right in a row',
      icon: '💯',
      category: 'skill',
      rarity: 'uncommon',
      requirements: [{ type: 'perfect', value: 10, description: '10 correct in a row' }],
      points: 50
    });

    this.badges.set('speed_demon', {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete a lesson in under 5 minutes',
      icon: '⚡',
      category: 'skill',
      rarity: 'uncommon',
      requirements: [{ type: 'custom', value: { time: 300000 }, description: 'Finish in 5 minutes' }],
      points: 30
    });

    // Career badges (one per career)
    const careers = [
      'Doctor', 'Teacher', 'Scientist', 'Artist', 'Chef', 'Athlete',
      'Engineer', 'Veterinarian', 'Musician', 'Writer', 'Astronaut',
      'Police Officer', 'Firefighter', 'Pilot', 'Architect'
    ];

    careers.forEach(career => {
      this.badges.set(`${career.toLowerCase()}_beginner`, {
        id: `${career.toLowerCase()}_beginner`,
        name: `Future ${career}`,
        description: `Complete 10 ${career}-themed lessons`,
        icon: this.getCareerIcon(career),
        category: 'career',
        rarity: 'common',
        requirements: [{ 
          type: 'career', 
          value: { career, count: 10 }, 
          description: `10 ${career} lessons` 
        }],
        points: 25
      });

      this.badges.set(`${career.toLowerCase()}_expert`, {
        id: `${career.toLowerCase()}_expert`,
        name: `${career} Expert`,
        description: `Master 50 ${career}-themed challenges`,
        icon: this.getCareerIcon(career),
        category: 'career',
        rarity: 'rare',
        requirements: [{ 
          type: 'career', 
          value: { career, count: 50 }, 
          description: `50 ${career} challenges` 
        }],
        points: 100
      });
    });

    // Streak badges
    this.badges.set('streak_3', {
      id: 'streak_3',
      name: 'Getting Started',
      description: '3-day learning streak',
      icon: '🔥',
      category: 'streak',
      rarity: 'common',
      requirements: [{ type: 'streak', value: 3, description: '3 consecutive days' }],
      points: 30
    });

    this.badges.set('week_warrior', {
      id: 'week_warrior',
      name: 'Week Warrior',
      description: '7-day learning streak',
      icon: '🔥🔥',
      category: 'streak',
      rarity: 'uncommon',
      requirements: [{ type: 'streak', value: 7, description: '7 consecutive days' }],
      points: 100
    });

    // Exploration badges
    this.badges.set('curious_mind', {
      id: 'curious_mind',
      name: 'Curious Mind',
      description: 'Try all 4 learning modes',
      icon: '🔍',
      category: 'exploration',
      rarity: 'common',
      requirements: [{ type: 'custom', value: { modes: 4 }, description: 'Try all modes' }],
      points: 40
    });

    // Special badges
    this.badges.set('night_owl', {
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Complete lessons after 9 PM',
      icon: '🦉',
      category: 'special',
      rarity: 'uncommon',
      requirements: [{ type: 'custom', value: { time: 'night' }, description: 'Study at night' }],
      points: 20
    });

    this.badges.set('early_bird', {
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Complete lessons before 7 AM',
      icon: '🐦',
      category: 'special',
      rarity: 'uncommon',
      requirements: [{ type: 'custom', value: { time: 'morning' }, description: 'Study early' }],
      points: 20
    });
  }

  /**
   * Get career icon
   */
  private getCareerIcon(career: string): string {
    const icons: Record<string, string> = {
      'Doctor': '👨‍⚕️',
      'Teacher': '👨‍🏫',
      'Scientist': '👨‍🔬',
      'Artist': '👨‍🎨',
      'Chef': '👨‍🍳',
      'Athlete': '🏃',
      'Engineer': '👷',
      'Veterinarian': '🐾',
      'Musician': '🎵',
      'Writer': '✍️',
      'Astronaut': '👨‍🚀',
      'Police Officer': '👮',
      'Firefighter': '👨‍🚒',
      'Pilot': '👨‍✈️',
      'Architect': '🏗️'
    };
    return icons[career] || '🎯';
  }

  /**
   * Initialize career achievements
   */
  private initializeCareerAchievements(): void {
    const careers = [
      'Doctor', 'Teacher', 'Scientist', 'Artist', 'Chef', 'Athlete',
      'Engineer', 'Veterinarian', 'Musician', 'Writer', 'Astronaut',
      'Police Officer', 'Firefighter', 'Pilot', 'Architect'
    ];

    careers.forEach(career => {
      const achievements: CareerAchievement = {
        career,
        achievements: {
          badges: [
            this.badges.get(`${career.toLowerCase()}_beginner`)!,
            this.badges.get(`${career.toLowerCase()}_expert`)!
          ],
          milestones: this.createCareerMilestones(career),
          specialRewards: this.createCareerSpecialRewards(career)
        }
      };
      
      this.careerAchievements.set(career, achievements);
    });
  }

  /**
   * Create career-specific milestones
   */
  private createCareerMilestones(career: string): Milestone[] {
    return [
      {
        id: `${career.toLowerCase()}_10`,
        name: `${career} Apprentice`,
        description: `Solve 10 ${career}-themed problems`,
        requirement: 10,
        type: 'problems_solved',
        reward: { points: 50 }
      },
      {
        id: `${career.toLowerCase()}_50`,
        name: `${career} Professional`,
        description: `Solve 50 ${career}-themed problems`,
        requirement: 50,
        type: 'problems_solved',
        reward: { points: 200, badge: `${career.toLowerCase()}_pro` }
      },
      {
        id: `${career.toLowerCase()}_100`,
        name: `${career} Master`,
        description: `Solve 100 ${career}-themed problems`,
        requirement: 100,
        type: 'problems_solved',
        reward: { points: 500, badge: `${career.toLowerCase()}_master`, title: `Master ${career}` }
      }
    ];
  }

  /**
   * Create career special rewards
   */
  private createCareerSpecialRewards(career: string): SpecialReward[] {
    return [
      {
        id: `${career.toLowerCase()}_avatar`,
        name: `${career} Avatar`,
        type: 'avatar',
        requirement: `Complete ${career} mastery`,
        unlocked: false
      },
      {
        id: `${career.toLowerCase()}_theme`,
        name: `${career} Theme`,
        type: 'theme',
        requirement: `Reach level 10 in ${career} path`,
        unlocked: false
      },
      {
        id: `${career.toLowerCase()}_certificate`,
        name: `${career} Excellence Certificate`,
        type: 'certificate',
        requirement: `Complete all ${career} achievements`,
        unlocked: false
      }
    ];
  }

  // Rule action methods

  private calculatePoints(context: GamificationContext): RuleResult {
    const { activity } = context;
    let points = 0;

    // Base points
    if (activity.performance !== undefined) {
      if (activity.performance >= 0.9) {
        points += this.progressionRules.points.base.correctAnswer;
        points += this.progressionRules.points.bonus.accuracy;
      } else if (activity.performance >= 0.7) {
        points += this.progressionRules.points.base.correctAnswer;
      } else if (activity.performance >= 0.5) {
        points += this.progressionRules.points.base.retry;
      } else {
        points += this.progressionRules.points.penalties.wrongAnswer;
      }
    }

    // Speed bonus
    if (activity.duration && activity.duration < 300000) { // Under 5 minutes
      points += this.progressionRules.points.bonus.speed;
    }

    // Difficulty bonus
    if (activity.difficulty === 'hard') {
      points *= 1.5;
    } else if (activity.difficulty === 'medium') {
      points *= 1.2;
    }

    // Career bonus
    if (context.career) {
      points += this.progressionRules.points.bonus.career;
    }

    return {
      success: true,
      data: {
        points: Math.max(0, Math.round(points)),
        breakdown: {
          base: this.progressionRules.points.base.correctAnswer,
          performance: activity.performance,
          difficulty: activity.difficulty,
          career: context.career?.name
        }
      }
    };
  }

  private checkLevelProgression(context: GamificationContext): RuleResult {
    const { totalPoints = 0, level = 1 } = context.student;
    const thresholds = this.progressionRules.levels.thresholds;
    
    let newLevel = 1;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (totalPoints >= thresholds[i]) {
        newLevel = i + 1;
        break;
      }
    }

    const leveledUp = newLevel > level;
    const reward = leveledUp ? this.progressionRules.levels.rewards.get(newLevel) : null;

    return {
      success: true,
      data: {
        currentLevel: level,
        newLevel,
        leveledUp,
        currentPoints: totalPoints,
        nextLevelPoints: thresholds[newLevel] || thresholds[thresholds.length - 1],
        progress: ((totalPoints - thresholds[newLevel - 1]) / 
                  (thresholds[newLevel] - thresholds[newLevel - 1])) * 100,
        reward,
        title: this.progressionRules.levels.titles.get(newLevel)
      }
    };
  }

  private updateStreak(context: GamificationContext): RuleResult {
    const { currentStreak = 0, lastActivityDate } = context.student;
    
    if (!lastActivityDate) {
      return {
        success: true,
        data: { streak: 1, message: 'Streak started!' }
      };
    }

    const lastActivity = new Date(lastActivityDate);
    const now = new Date();
    const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    let newStreak = currentStreak;
    let streakStatus = 'maintained';

    if (hoursSinceLastActivity <= this.progressionRules.streaks.window) {
      // Within window - continue streak
      newStreak = currentStreak + 1;
      streakStatus = 'extended';
    } else if (hoursSinceLastActivity <= this.progressionRules.streaks.window + 24) {
      // Grace period - can recover
      newStreak = currentStreak;
      streakStatus = 'recovered';
    } else {
      // Streak broken
      newStreak = 1;
      streakStatus = 'reset';
    }

    // Check for streak rewards
    const reward = this.progressionRules.streaks.rewards.get(newStreak);

    return {
      success: true,
      data: {
        previousStreak: currentStreak,
        currentStreak: newStreak,
        status: streakStatus,
        reward,
        nextMilestone: this.getNextStreakMilestone(newStreak)
      }
    };
  }

  private applyMultipliers(context: GamificationContext): RuleResult {
    let multiplier = this.progressionRules.multipliers.base;
    const factors = this.progressionRules.multipliers.factors;

    // Streak multiplier
    if (context.student.currentStreak) {
      multiplier += Math.min(context.student.currentStreak * factors.streak, 0.5);
    }

    // Level multiplier
    if (context.student.level) {
      multiplier += Math.min(context.student.level * factors.level, 0.5);
    }

    // Difficulty multiplier
    if (context.activity?.difficulty === 'hard') {
      multiplier += factors.difficulty;
    } else if (context.activity?.difficulty === 'medium') {
      multiplier += factors.difficulty * 0.5;
    }

    // Career multiplier
    if (context.career) {
      multiplier += factors.career;
    }

    // Cap at max multiplier
    multiplier = Math.min(multiplier, this.progressionRules.multipliers.max);

    return {
      success: true,
      data: {
        multiplier,
        factors: {
          streak: context.student.currentStreak,
          level: context.student.level,
          difficulty: context.activity?.difficulty,
          career: context.career?.name
        }
      }
    };
  }

  private checkBadgeEligibility(context: GamificationContext): RuleResult {
    const eligibleBadges: Badge[] = [];
    const progress = this.getStudentProgress(context.student.id);

    this.badges.forEach(badge => {
      if (badge.unlockedAt) return; // Already unlocked

      const eligible = this.checkBadgeRequirements(badge, context, progress);
      if (eligible) {
        eligibleBadges.push(badge);
        badge.unlockedAt = new Date();
      }
    });

    return {
      success: true,
      data: {
        newBadges: eligibleBadges,
        totalBadges: Array.from(this.badges.values()).filter(b => b.unlockedAt).length,
        points: eligibleBadges.reduce((sum, b) => sum + b.points, 0)
      }
    };
  }

  private checkCareerAchievements(context: GamificationContext): RuleResult {
    if (!context.career) {
      return { success: false, error: 'No career specified' };
    }

    const achievements = this.careerAchievements.get(context.career.name);
    if (!achievements) {
      return { success: false, error: `No achievements for career: ${context.career.name}` };
    }

    const progress = this.getStudentProgress(context.student.id);
    const careerProgress = progress.careerProgress.get(context.career.name) || {
      problemsSolved: 0,
      lessonsCompleted: 0,
      perfectScores: 0
    };

    // Update progress
    if (context.activity?.type === 'lesson') {
      careerProgress.lessonsCompleted++;
    }
    if (context.activity?.performance === 1) {
      careerProgress.perfectScores++;
    }
    careerProgress.problemsSolved++;

    // Check milestones
    const achievedMilestones = achievements.achievements.milestones.filter(m => 
      careerProgress.problemsSolved >= m.requirement
    );

    return {
      success: true,
      data: {
        career: context.career.name,
        progress: careerProgress,
        milestones: achievedMilestones,
        nextMilestone: achievements.achievements.milestones.find(m => 
          careerProgress.problemsSolved < m.requirement
        )
      }
    };
  }

  private applyDailyBonus(context: GamificationContext): RuleResult {
    const bonusPoints = 20;
    const consecutiveDays = context.student.currentStreak || 1;
    const totalBonus = bonusPoints * Math.min(consecutiveDays, 7); // Cap at 7x

    return {
      success: true,
      data: {
        dailyBonus: totalBonus,
        consecutiveDays,
        message: `Welcome back! Daily bonus: ${totalBonus} points!`
      }
    };
  }

  private checkMilestones(context: GamificationContext): RuleResult {
    const milestones: any[] = [];

    // Check various milestone types
    const totalPoints = context.student.totalPoints || 0;
    const pointMilestones = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000];
    
    for (const milestone of pointMilestones) {
      if (totalPoints >= milestone && totalPoints - (context.data?.points || 0) < milestone) {
        milestones.push({
          type: 'points',
          value: milestone,
          reward: milestone / 10,
          message: `Milestone: ${milestone.toLocaleString()} points!`
        });
      }
    }

    return {
      success: true,
      data: {
        milestones,
        totalRewards: milestones.reduce((sum, m) => sum + m.reward, 0)
      }
    };
  }

  // Helper methods

  private isFirstActivityToday(context: GamificationContext): boolean {
    if (!context.student.lastActivityDate) return true;
    
    const last = new Date(context.student.lastActivityDate);
    const now = new Date();
    
    return last.toDateString() !== now.toDateString();
  }

  private getNextStreakMilestone(currentStreak: number): number {
    const milestones = Array.from(this.progressionRules.streaks.rewards.keys()).sort((a, b) => a - b);
    return milestones.find(m => m > currentStreak) || milestones[milestones.length - 1];
  }

  private checkBadgeRequirements(badge: Badge, context: GamificationContext, progress: StudentProgress): boolean {
    return badge.requirements.every(req => {
      switch (req.type) {
        case 'points':
          return (context.student.totalPoints || 0) >= req.value;
        case 'level':
          return (context.student.level || 1) >= req.value;
        case 'streak':
          return (context.student.currentStreak || 0) >= req.value;
        case 'completion':
          return progress.totalCompleted >= req.value;
        case 'perfect':
          return progress.perfectScores >= req.value;
        case 'career':
          return context.career?.name === req.value.career && 
                 progress.careerProgress.get(req.value.career)?.lessonsCompleted >= req.value.count;
        default:
          return false;
      }
    });
  }

  private getStudentProgress(studentId: string): StudentProgress {
    let progress = this.studentProgress.get(studentId);
    if (!progress) {
      progress = {
        studentId,
        totalCompleted: 0,
        perfectScores: 0,
        careerProgress: new Map()
      };
      this.studentProgress.set(studentId, progress);
    }
    return progress;
  }

  // Public methods

  public getStudentStats(studentId: string): any {
    const progress = this.getStudentProgress(studentId);
    const unlockedBadges = Array.from(this.badges.values()).filter(b => b.unlockedAt);
    
    return {
      progress,
      badges: {
        total: this.badges.size,
        unlocked: unlockedBadges.length,
        points: unlockedBadges.reduce((sum, b) => sum + b.points, 0)
      }
    };
  }

  public getLeaderboard(scope: string, period: string): Leaderboard {
    // This would typically fetch from a database
    return {
      scope: scope as any,
      period: period as any,
      entries: []
    };
  }
}

// Helper interface
interface StudentProgress {
  studentId: string;
  totalCompleted: number;
  perfectScores: number;
  careerProgress: Map<string, any>;
}

// Export singleton instance
export const gamificationRulesEngine = new GamificationRulesEngine();