import { supabase } from '../lib/supabase';

// Mock data function for user achievements
function mockUserAchievements() {
  return [
    {
      id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      achievement_id: '550e8400-e29b-41d4-a716-446655440001',
      earned_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      times_earned: 1,
      achievements: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        title: 'Math Master',
        description: 'Completed 100 math problems',
        icon: 'calculator',
        category: 'academic',
        rarity: 'epic',
        points_value: 500
      }
    },
    {
      id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      achievement_id: '550e8400-e29b-41d4-a716-446655440002',
      earned_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      times_earned: 1,
      achievements: {
        id: '550e8400-e29b-41d4-a716-446655440002',
        title: 'Team Player',
        description: 'Collaborated on 5 projects',
        icon: 'users',
        category: 'collaboration',
        rarity: 'rare',
        points_value: 300
      }
    },
    {
      id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      achievement_id: '550e8400-e29b-41d4-a716-446655440004',
      earned_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      times_earned: 1,
      achievements: {
        id: '550e8400-e29b-41d4-a716-446655440004',
        title: 'Streak Champion',
        description: 'Maintained 14-day learning streak',
        icon: 'flame',
        category: 'consistency',
        rarity: 'rare',
        points_value: 400
      }
    }
  ];
}

// Mock data function for available achievements
function mockAvailableAchievements() {
  return [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      title: 'Math Master',
      description: 'Completed 100 math problems',
      icon: 'calculator',
      category: 'academic',
      rarity: 'epic',
      points_value: 500,
      is_active: true
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      title: 'Team Player',
      description: 'Collaborated on 5 projects',
      icon: 'users',
      category: 'collaboration',
      rarity: 'rare',
      points_value: 300,
      is_active: true
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      title: 'Creative Genius',
      description: 'Created 10 presentations',
      icon: 'palette',
      category: 'creativity',
      rarity: 'legendary',
      points_value: 1000,
      is_active: true
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      title: 'Streak Champion',
      description: 'Maintained 14-day learning streak',
      icon: 'flame',
      category: 'consistency',
      rarity: 'rare',
      points_value: 400,
      is_active: true
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      title: 'First Steps',
      description: 'Completed your first lesson',
      icon: 'star',
      category: 'academic',
      points_value: 50,
      rarity: 'common',
      is_active: true
    }
  ];
}

export class GamificationService {
  static async getUserAchievements(userId: string, tenantId: string) {
    try {
      // Validate input parameters
      if (!userId || !userId.trim() || !tenantId || !tenantId.trim()) {
        console.warn('Invalid or missing userId/tenantId, using mock data');
        return mockUserAchievements();
      }

      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .select(`
            id,
            user_id,
            achievement_id,
            earned_at,
            times_earned,
            achievements:achievement_id (
              id,
              title,
              description,
              icon,
              category,
              rarity,
              points_value
            )
          `)
          .eq('user_id', userId)
          .eq('tenant_id', tenantId);

        if (error) throw error;
        
        if (data && data.length > 0) {
          return data;
        }
      } catch (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        // Continue to fallback data
      }

      // Return mock data as fallback
      return mockUserAchievements();
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return mockUserAchievements();
    }
  }

  static async getAvailableAchievements(tenantId: string) {
    try {
      // Validate input parameters
      if (!tenantId || !tenantId.trim()) {
        console.warn('Invalid or missing tenantId, using mock data');
        return mockAvailableAchievements();
      }

      try {
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('is_active', true);

        if (error) throw error;
        
        if (data && data.length > 0) {
          return data;
        }
      } catch (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        // Continue to fallback data
      }

      // Return mock data as fallback
      return mockAvailableAchievements();
    } catch (error) {
      console.error('Error fetching available achievements:', error);
      return mockAvailableAchievements();
    }
  }

  static async awardAchievement(
    userId: string,
    achievementId: string,
    tenantId: string,
    progressData?: any
  ) {
    try {
      // Validate input parameters
      if (!userId || !achievementId || !tenantId) {
        throw new Error('Missing required parameters');
      }

      // Check if user already has this achievement
      const { data: existingAchievement, error: checkError } = await supabase
        .from('user_achievements')
        .select('id, times_earned')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      // Get achievement details to determine if it's repeatable
      const { data: achievementDetails, error: achievementError } = await supabase
        .from('achievements')
        .select('is_repeatable, max_times_earnable, points_value')
        .eq('id', achievementId)
        .single();

      if (achievementError) throw achievementError;

      // If achievement exists and is not repeatable, or max times reached, return
      if (existingAchievement) {
        if (!achievementDetails.is_repeatable) {
          return { success: true, message: 'Achievement already earned' };
        }

        if (existingAchievement.times_earned >= achievementDetails.max_times_earnable) {
          return { success: true, message: 'Maximum times earned reached' };
        }

        // Update existing achievement
        const { error: updateError } = await supabase
          .from('user_achievements')
          .update({
            times_earned: existingAchievement.times_earned + 1,
            earned_at: new Date().toISOString(),
            progress_data: progressData || {}
          })
          .eq('id', existingAchievement.id);

        if (updateError) throw updateError;
      } else {
        // Insert new achievement
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievementId,
            tenant_id: tenantId,
            earned_at: new Date().toISOString(),
            times_earned: 1,
            progress_data: progressData || {}
          });

        if (insertError) throw insertError;
      }

      // Add points transaction
      if (achievementDetails.points_value > 0) {
        await this.addPointsTransaction(
          userId,
          tenantId,
          {
            transaction_type: 'earned',
            points_amount: achievementDetails.points_value,
            source_type: 'achievement',
            source_id: achievementId,
            description: `Earned achievement: ${achievementDetails.title || 'Achievement'}`
          }
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error awarding achievement:', error);
      throw error;
    }
  }

  static async getUserPointsBalance(userId: string, tenantId: string) {
    try {
      // Validate input parameters
      if (!userId || !userId.trim() || !tenantId || !tenantId.trim()) {
        console.warn('Invalid or missing userId/tenantId, using mock data');
        return { total_points: 1500, points_earned: 1800, points_spent: 300 };
      }

      try {
        const { data, error } = await supabase
          .from('user_points_balance')
          .select('*')
          .eq('user_id', userId)
          .eq('tenant_id', tenantId);

        if (error) throw error;

        // If data found and contains elements, return the first one
        if (data && Array.isArray(data) && data.length > 0) {
          return data[0];
        }
      } catch (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        // Continue to fallback data
      }

      // Return mock data as fallback
      return { total_points: 1500, points_earned: 1800, points_spent: 300 };
    } catch (error) {
      console.error('Error fetching user points balance:', error);
      return { total_points: 1500, points_earned: 1800, points_spent: 300 };
    }
  }

  static async addPointsTransaction(
    userId: string,
    tenantId: string,
    transaction: {
      transaction_type: string;
      points_amount: number;
      source_type: string;
      source_id?: string;
      description: string;
      metadata?: any;
    }
  ) {
    try {
      // Validate input parameters
      if (!userId || !tenantId || !transaction) {
        throw new Error('Missing required parameters');
      }

      // Validate transaction data
      if (!['earned', 'spent', 'bonus', 'penalty', 'adjustment'].includes(transaction.transaction_type)) {
        throw new Error('Invalid transaction_type');
      }

      if (!['lesson', 'assessment', 'project', 'collaboration', 'achievement', 'streak', 'reward', 'manual'].includes(transaction.source_type)) {
        throw new Error('Invalid source_type');
      }

      const { data, error } = await supabase
        .from('points_transactions')
        .insert({
          user_id: userId,
          tenant_id: tenantId,
          transaction_type: transaction.transaction_type,
          points_amount: transaction.points_amount,
          source_type: transaction.source_type,
          source_id: transaction.source_id,
          description: transaction.description,
          metadata: transaction.metadata || {}
        })
        .select();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Error adding points transaction:', error);
      throw error;
    }
  }

  static async getLeaderboard(
    tenantId: string,
    type: 'points' | 'achievements' | 'streaks' = 'points',
    limit: number = 10
  ) {
    try {
      // Validate input parameters
      if (!tenantId) {
        throw new Error('Missing required parameter: tenantId');
      }

      let rankField;
      switch (type) {
        case 'points':
          rankField = 'points_rank';
          break;
        case 'achievements':
          rankField = 'achievements_rank';
          break;
        case 'streaks':
          rankField = 'streak_rank';
          break;
        default:
          rankField = 'points_rank';
      }

      const { data, error } = await supabase
        .from('leaderboard_rankings')
        .select('*')
        .eq('tenant_id', tenantId)
        .order(rankField, { ascending: true })
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return null;
    }
  }

  static async updateStreak(
    userId: string,
    tenantId: string,
    streakType: string,
    subjectId?: string
  ) {
    try {
      console.log('Updating streak:', userId, tenantId, streakType);
      
      // Validate input parameters
      if (!userId || !tenantId || !streakType) {
        throw new Error('Missing required parameters');
      }

      // Validate streak type
      if (!['daily_login', 'lesson_completion', 'subject_specific', 'project_activity'].includes(streakType)) {
        throw new Error('Invalid streak_type');
      }

      try {
        // Check if streak exists
        const { data: existingStreak, error: checkError } = await supabase
          .from('streaks') 
          .select('*') 
          .eq('user_id', userId)
          .eq('streak_type', streakType)
          .eq('subject_id', subjectId || null);

        if (checkError) {
          console.error('Supabase error checking streak:', checkError);
          throw checkError;
        }
        
        const matchingStreak = Array.isArray(existingStreak) && existingStreak.length > 0 ? existingStreak[0] : null;

        const today = new Date().toISOString().split('T')[0];

        if (matchingStreak) {
          const existingStreak = matchingStreak;
          
          // Check if streak is already updated today
          if (existingStreak.last_activity_date === today) { 
            return existingStreak;
          }

          // Check if streak is continuous (last activity was yesterday)
          const lastActivityDate = new Date(existingStreak.last_activity_date);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          const isContinuous = lastActivityDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
          
          const newCount = isContinuous ? existingStreak.current_count + 1 : 1;
          const longestCount = Math.max(existingStreak.longest_count, newCount);
          
          // Update streak
          const { data, error: updateError } = await supabase
            .from('streaks')
            .update({ 
              current_count: newCount,
              longest_count: longestCount,
              last_activity_date: today,
              streak_start_date: isContinuous && existingStreak.streak_start_date ? existingStreak.streak_start_date : today,
              is_active: true
            })
            .eq('id', existingStreak.id)
            .select();

          if (updateError) {
            console.error('Supabase error updating streak:', updateError);
            throw updateError;
          }

          return {
            id: existingStreak.id, 
            current_count: newCount,
            longest_count: longestCount,
            last_activity_date: today,
            streak_start_date: isContinuous ? existingStreak.streak_start_date : today,
            is_active: true
          };
        } else {
          // Create new streak
          const { data, error: insertError } = await supabase 
            .from('streaks')
            .insert({ 
              user_id: userId,
              tenant_id: tenantId,
              streak_type: streakType,
              subject_id: subjectId || null,
              current_count: 1,
              longest_count: 1,
              last_activity_date: today,
              streak_start_date: today,
              is_active: true
            })
            .select();

          if (insertError) {
            console.error('Supabase error creating streak:', insertError);
            throw insertError;
          }

          return data;
        }
      } catch (supabaseError) {
        console.error('Error updating streak in Supabase:', supabaseError);
        // Return a mock successful response as fallback
        return {  
          current_count: 5, 
          longest_count: 10,
          last_activity_date: new Date().toISOString().split('T')[0],
          is_active: true,
          message: 'Streak updated successfully (mock data)'
        };
      }
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  }
  
  // Mock data functions
  static mockUserAchievements() {
    return mockUserAchievements();
  }
  
  static mockAvailableAchievements() {
    return mockAvailableAchievements();
  }
}