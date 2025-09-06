/**
 * Unit Tests for GamificationRulesEngine
 * Tests XP, achievements, rewards, and progression
 */

import { gamificationRulesEngine, GamificationContext } from '../gamification/GamificationRulesEngine';

describe('GamificationRulesEngine', () => {
  // ============================================================================
  // XP CALCULATION TESTS
  // ============================================================================
  
  describe('XP Calculation', () => {
    it('should calculate XP for correct answers', async () => {
      const context: GamificationContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        action: {
          type: 'question_answered',
          result: 'correct',
          difficulty: 'medium',
          timeSpent: 30
        },
        student: {
          grade: '3',
          level: 5,
          currentXP: 100
        }
      };
      
      const results = await gamificationRulesEngine.execute(context);
      const xpResult = results.find(r => r.data?.xp);
      
      expect(xpResult).toBeDefined();
      expect(xpResult?.data?.xp).toBeGreaterThan(0);
      expect(xpResult?.data?.totalXP).toBe(100 + xpResult?.data?.xp);
    });
    
    it('should give bonus XP for streaks', async () => {
      const baseContext: GamificationContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        action: {
          type: 'question_answered',
          result: 'correct',
          difficulty: 'easy'
        },
        student: {
          grade: '2',
          level: 3,
          currentXP: 50
        }
      };
      
      // No streak
      const noStreakResults = await gamificationRulesEngine.execute(baseContext);
      const baseXP = noStreakResults.find(r => r.data?.xp)?.data?.xp || 0;
      
      // With streak
      const streakContext = {
        ...baseContext,
        action: {
          ...baseContext.action,
          streak: 5
        }
      };
      
      const streakResults = await gamificationRulesEngine.execute(streakContext);
      const streakXP = streakResults.find(r => r.data?.xp)?.data?.xp || 0;
      
      expect(streakXP).toBeGreaterThan(baseXP);
    });
    
    it('should scale XP by difficulty', async () => {
      const difficulties = ['easy', 'medium', 'hard'];
      const xpValues: number[] = [];
      
      for (const difficulty of difficulties) {
        const context: GamificationContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          action: {
            type: 'question_answered',
            result: 'correct',
            difficulty: difficulty as any
          },
          student: {
            grade: '5',
            level: 10
          }
        };
        
        const results = await gamificationRulesEngine.execute(context);
        const xp = results.find(r => r.data?.xp)?.data?.xp || 0;
        xpValues.push(xp);
      }
      
      // XP should increase with difficulty
      expect(xpValues[0]).toBeLessThan(xpValues[1]); // easy < medium
      expect(xpValues[1]).toBeLessThan(xpValues[2]); // medium < hard
    });
  });
  
  // ============================================================================
  // ACHIEVEMENT TESTS
  // ============================================================================
  
  describe('Achievements', () => {
    it('should unlock first correct answer achievement', async () => {
      const context: GamificationContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        action: {
          type: 'question_answered',
          result: 'correct',
          firstCorrect: true
        },
        student: {
          grade: 'K',
          level: 1
        }
      };
      
      const results = await gamificationRulesEngine.execute(context);
      const achievementResult = results.find(r => r.data?.achievement);
      
      expect(achievementResult).toBeDefined();
      expect(achievementResult?.data?.achievement).toBeDefined();
      expect(achievementResult?.data?.achievement.name).toContain('First');
    });
    
    it('should unlock streak achievements', async () => {
      const streakMilestones = [3, 5, 10, 20];
      
      for (const streak of streakMilestones) {
        const context: GamificationContext = {
          userId: `test-user-${streak}`,
          timestamp: new Date(),
          metadata: {},
          action: {
            type: 'streak_milestone',
            streak
          },
          student: {
            grade: '4',
            level: 8
          }
        };
        
        const results = await gamificationRulesEngine.execute(context);
        const achievementResult = results.find(r => r.data?.achievement);
        
        expect(achievementResult).toBeDefined();
        expect(achievementResult?.data?.achievement.name).toContain('Streak');
      }
    });
    
    it('should unlock subject mastery achievements', async () => {
      const context: GamificationContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        action: {
          type: 'subject_mastery',
          subject: 'math',
          masteryLevel: 100
        },
        student: {
          grade: '6',
          level: 15
        }
      };
      
      const results = await gamificationRulesEngine.execute(context);
      const achievementResult = results.find(r => r.data?.achievement);
      
      expect(achievementResult).toBeDefined();
      expect(achievementResult?.data?.achievement.name).toContain('Math');
      expect(achievementResult?.data?.achievement.name).toContain('Master');
    });
    
    it('should track achievement progress', async () => {
      const context: GamificationContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        action: {
          type: 'progress_check',
          achievementId: 'math_problems_100'
        },
        student: {
          grade: '3',
          level: 5,
          stats: {
            mathProblemsCompleted: 75
          }
        }
      };
      
      const results = await gamificationRulesEngine.execute(context);
      const progressResult = results.find(r => r.data?.achievementProgress);
      
      expect(progressResult).toBeDefined();
      expect(progressResult?.data?.achievementProgress.current).toBe(75);
      expect(progressResult?.data?.achievementProgress.required).toBe(100);
      expect(progressResult?.data?.achievementProgress.percentage).toBe(75);
    });
  });
  
  // ============================================================================
  // LEVEL PROGRESSION TESTS
  // ============================================================================
  
  describe('Level Progression', () => {
    it('should calculate XP required for next level', async () => {
      const levels = [1, 5, 10, 20];
      const xpRequirements: number[] = [];
      
      for (const level of levels) {
        const context: GamificationContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          action: {
            type: 'level_check'
          },
          student: {
            grade: '5',
            level,
            currentXP: 0
          }
        };
        
        const results = await gamificationRulesEngine.execute(context);
        const levelResult = results.find(r => r.data?.levelInfo);
        
        expect(levelResult).toBeDefined();
        xpRequirements.push(levelResult?.data?.levelInfo.xpToNextLevel || 0);
      }
      
      // XP requirements should increase with level
      for (let i = 1; i < xpRequirements.length; i++) {
        expect(xpRequirements[i]).toBeGreaterThan(xpRequirements[i - 1]);
      }
    });
    
    it('should trigger level up when XP threshold reached', async () => {
      const context: GamificationContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        action: {
          type: 'xp_gained',
          xpAmount: 100
        },
        student: {
          grade: '4',
          level: 5,
          currentXP: 950 // Close to level up at 1000
        }
      };
      
      const results = await gamificationRulesEngine.execute(context);
      const levelUpResult = results.find(r => r.data?.levelUp);
      
      expect(levelUpResult).toBeDefined();
      expect(levelUpResult?.data?.levelUp).toBe(true);
      expect(levelUpResult?.data?.newLevel).toBe(6);
    });
  });
  
  // ============================================================================
  // REWARDS TESTS
  // ============================================================================
  
  describe('Rewards', () => {
    it('should grant coins for activities', async () => {
      const activities = [
        { type: 'question_answered', coins: 10 },
        { type: 'skill_completed', coins: 50 },
        { type: 'achievement_unlocked', coins: 100 }
      ];
      
      for (const activity of activities) {
        const context: GamificationContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          action: {
            type: activity.type as any,
            result: 'success'
          },
          student: {
            grade: '3',
            level: 7,
            coins: 0
          }
        };
        
        const results = await gamificationRulesEngine.execute(context);
        const coinsResult = results.find(r => r.data?.coins);
        
        expect(coinsResult).toBeDefined();
        expect(coinsResult?.data?.coins).toBeGreaterThanOrEqual(activity.coins);
      }
    });
    
    it('should unlock badges at milestones', async () => {
      const context: GamificationContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        action: {
          type: 'milestone_reached',
          milestone: 'completed_100_questions'
        },
        student: {
          grade: '5',
          level: 12
        }
      };
      
      const results = await gamificationRulesEngine.execute(context);
      const badgeResult = results.find(r => r.data?.badge);
      
      expect(badgeResult).toBeDefined();
      expect(badgeResult?.data?.badge.name).toBeDefined();
      expect(badgeResult?.data?.badge.tier).toBeDefined();
    });
  });
  
  // ============================================================================
  // LEADERBOARD TESTS
  // ============================================================================
  
  describe('Leaderboard', () => {
    it('should calculate leaderboard position', async () => {
      const context: GamificationContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        action: {
          type: 'leaderboard_update'
        },
        student: {
          grade: '4',
          level: 10,
          currentXP: 5000,
          weeklyXP: 500
        }
      };
      
      const results = await gamificationRulesEngine.execute(context);
      const leaderboardResult = results.find(r => r.data?.leaderboard);
      
      expect(leaderboardResult).toBeDefined();
      expect(leaderboardResult?.data?.leaderboard.position).toBeDefined();
      expect(leaderboardResult?.data?.leaderboard.totalPlayers).toBeDefined();
    });
  });
  
  // ============================================================================
  // PUBLIC METHOD TESTS
  // ============================================================================
  
  describe('Public Methods', () => {
    it('should calculate XP for action', async () => {
      const xp = await gamificationRulesEngine.calculateXP('question_correct', {
        difficulty: 'hard',
        timeSpent: 45,
        streak: 3
      });
      
      expect(xp).toBeGreaterThan(0);
      expect(xp).toBeLessThanOrEqual(200); // Max XP cap
    });
    
    it('should check achievements', async () => {
      const achievements = await gamificationRulesEngine.checkAchievements(
        'test-user',
        'streak_milestone',
        { streak: 10 }
      );
      
      expect(achievements).toBeInstanceOf(Array);
      if (achievements.length > 0) {
        expect(achievements[0]).toHaveProperty('id');
        expect(achievements[0]).toHaveProperty('name');
        expect(achievements[0]).toHaveProperty('description');
      }
    });
    
    it('should get user stats', () => {
      const stats = gamificationRulesEngine.getUserStats('test-user');
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('level');
      expect(stats).toHaveProperty('xp');
      expect(stats).toHaveProperty('achievements');
      expect(stats).toHaveProperty('coins');
    });
    
    it('should get level info', () => {
      const levelInfo = gamificationRulesEngine.getLevelInfo(10);
      
      expect(levelInfo).toBeDefined();
      expect(levelInfo.level).toBe(10);
      expect(levelInfo.xpRequired).toBeDefined();
      expect(levelInfo.xpToNext).toBeDefined();
      expect(levelInfo.perks).toBeInstanceOf(Array);
    });
  });
  
  // ============================================================================
  // DAILY CHALLENGES TESTS
  // ============================================================================
  
  describe('Daily Challenges', () => {
    it('should generate daily challenges', async () => {
      const context: GamificationContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        action: {
          type: 'get_daily_challenges'
        },
        student: {
          grade: '3',
          level: 5
        }
      };
      
      const results = await gamificationRulesEngine.execute(context);
      const challengesResult = results.find(r => r.data?.dailyChallenges);
      
      expect(challengesResult).toBeDefined();
      expect(challengesResult?.data?.dailyChallenges).toBeInstanceOf(Array);
      expect(challengesResult?.data?.dailyChallenges.length).toBeGreaterThan(0);
      
      const challenge = challengesResult?.data?.dailyChallenges[0];
      expect(challenge).toHaveProperty('id');
      expect(challenge).toHaveProperty('description');
      expect(challenge).toHaveProperty('xpReward');
      expect(challenge).toHaveProperty('progress');
    });
    
    it('should track daily challenge progress', async () => {
      const context: GamificationContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        action: {
          type: 'challenge_progress',
          challengeId: 'daily_math_10',
          increment: 1
        },
        student: {
          grade: '4',
          level: 8,
          dailyProgress: {
            'daily_math_10': 5
          }
        }
      };
      
      const results = await gamificationRulesEngine.execute(context);
      const progressResult = results.find(r => r.data?.challengeProgress);
      
      expect(progressResult).toBeDefined();
      expect(progressResult?.data?.challengeProgress.current).toBe(6);
      expect(progressResult?.data?.challengeProgress.completed).toBe(false);
    });
  });
  
  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================
  
  describe('Performance', () => {
    it('should execute rules within 40ms', async () => {
      const context: GamificationContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        action: {
          type: 'complex_action',
          result: 'correct',
          difficulty: 'hard',
          streak: 10,
          timeSpent: 60
        },
        student: {
          grade: '7',
          level: 20,
          currentXP: 10000,
          achievements: ['math_master', 'streak_hero'],
          coins: 5000
        }
      };
      
      const startTime = Date.now();
      await gamificationRulesEngine.execute(context);
      const executionTime = Date.now() - startTime;
      
      expect(executionTime).toBeLessThan(40);
    });
    
    it('should handle concurrent XP calculations', async () => {
      const promises = [];
      
      for (let i = 0; i < 20; i++) {
        const context: GamificationContext = {
          userId: `user-${i}`,
          timestamp: new Date(),
          metadata: {},
          action: {
            type: 'question_answered',
            result: 'correct',
            difficulty: ['easy', 'medium', 'hard'][i % 3] as any
          },
          student: {
            grade: String(i % 12 + 1),
            level: i + 1
          }
        };
        
        promises.push(gamificationRulesEngine.execute(context));
      }
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(20);
      results.forEach(result => {
        expect(result).toBeDefined();
        const xpResult = result.find(r => r.data?.xp);
        expect(xpResult?.data?.xp).toBeGreaterThan(0);
      });
    });
  });
});

// ============================================================================
// MOCK DATA HELPERS
// ============================================================================

function createMockContext(overrides?: Partial<GamificationContext>): GamificationContext {
  return {
    userId: 'test-user',
    timestamp: new Date(),
    metadata: {},
    action: {
      type: 'question_answered',
      result: 'correct'
    },
    student: {
      grade: '3',
      level: 5
    },
    ...overrides
  };
}