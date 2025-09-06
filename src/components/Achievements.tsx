import React, { useState, useEffect } from 'react';
import { Calculator, Users, Palette, Flame, Trophy, Award, Star, Target } from 'lucide-react';
import { GamificationService } from '../services/gamificationService';
import { useAuthContext } from '../contexts/AuthContext';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  points_value: number;
}

const iconMap = {
  calculator: Calculator,
  users: Users,
  palette: Palette,
  flame: Flame,
  award: Award,
  star: Star,
  target: Target,
  trophy: Trophy
};

const rarityColors = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-500',
  epic: 'from-purple-400 to-purple-500',
  legendary: 'from-yellow-400 to-yellow-500'
};

export function Achievements() {
  const { user, tenant } = useAuthContext();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Default mock achievements
      const mockAchievements: Achievement[] = [
        { 
          id: '1', 
          title: 'Math Master', 
          description: 'Completed 100 math problems', 
          icon: 'calculator', 
          earned: true, 
          earnedDate: '2024-01-15', 
          rarity: 'epic', 
          category: 'academic', 
          points_value: 100 
        },
        { 
            id: '2', 
            title: 'Team Player', 
            description: 'Collaborated on 5 projects', 
            icon: 'users', 
            earned: true, 
            earnedDate: '2024-01-10', 
            rarity: 'rare', 
            category: 'collaboration', 
            points_value: 50 
          },
          { 
            id: '3', 
            title: 'Creative Genius', 
            description: 'Created 10 presentations', 
            icon: 'palette', 
            earned: false, 
            rarity: 'legendary', 
            category: 'creativity', 
            points_value: 200 
          },
          { 
            id: '4', 
            title: 'Streak Champion', 
            description: 'Maintained 14-day learning streak', 
            icon: 'flame', 
            earned: true, 
            earnedDate: '2024-01-12', 
            rarity: 'rare', 
            category: 'consistency', 
            points_value: 75 
          }
        ];
      
      // Try to get real data if user and tenant are available
      if (user?.id && tenant?.id) {
        console.log('Fetching achievements for user:', user.id, 'tenant:', tenant.id);
        try {
          const [userAchievements, availableAchievements] = await Promise.allSettled([
            GamificationService.getUserAchievements(user.id, tenant.id),
            GamificationService.getAvailableAchievements(tenant.id)
          ]);

          // Safely extract data from settled promises
          const userAchievementsData = userAchievements.status === 'fulfilled' ? userAchievements.value : null;
          const availableAchievementsData = availableAchievements.status === 'fulfilled' ? availableAchievements.value : null;

          // Combine earned and available achievements with safe data access
          const allAchievements: Achievement[] = [];

          console.log('Available achievements:', availableAchievementsData);
          console.log('User achievements:', userAchievementsData);

          if (Array.isArray(availableAchievementsData) && availableAchievementsData.length > 0) {
            availableAchievementsData.forEach((achievement) => {
              if (achievement?.id) {
                const userAchievement = Array.isArray(userAchievementsData)
                  ? userAchievementsData.find(ua => ua?.achievement_id === achievement.id || ua?.achievements?.id === achievement.id)
                  : null;

                allAchievements.push({
                  id: achievement.id,
                  title: achievement.title || 'Unknown Achievement',
                  description: achievement.description || 'No description available',
                  icon: achievement.icon || 'trophy',
                  earned: Boolean(userAchievement),
                  earnedDate: userAchievement?.earned_at,
                  rarity: (achievement.rarity as 'common' | 'rare' | 'epic' | 'legendary') || 'common',
                  category: achievement.category || 'general',
                  points_value: Math.max(0, achievement.points_value || 0)
                });
              }
            });
          }
          
          if (allAchievements.length > 0) {
            setAchievements(allAchievements);
            setLoading(false);
            return;
          }
        } catch (apiError: any) {
          console.error('API error, falling back to mock data:', apiError?.message || apiError);
          // Continue to use mock data
        }
      }
      
      setAchievements(mockAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
      setError('Failed to load achievements');
      
      // Fallback to mock data on error
      const fallbackAchievements: Achievement[] = [
        { 
          id: '1', 
          title: 'Getting Started', 
          description: 'Welcome to your learning journey', 
          icon: 'star', 
          earned: true, 
          earnedDate: new Date().toISOString(), 
          rarity: 'common', 
          category: 'general', 
          points_value: 10 
        }
      ];
      setAchievements(fallbackAchievements);
    } finally {
      setLoading(false);
    }
  };

  const formatEarnedDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || Trophy;
  };

  const getRarityColor = (rarity: string) => {
    return rarityColors[rarity as keyof typeof rarityColors] || rarityColors.common;
  };

  const earnedAchievements = achievements.filter(a => a.earned);
  const nextAchievement = achievements.find(a => !a.earned);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Achievements</span>
          </h2>
          <div className="h-4 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && achievements.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Achievements</span>
          </h2>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <button 
            onClick={loadAchievements}
            className="mt-2 text-sm text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span>Achievements</span>
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {earnedAchievements.length} earned
        </span>
      </div>

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {earnedAchievements.map((achievement) => {
            const IconComponent = getIconComponent(achievement.icon);
            const rarityColor = getRarityColor(achievement.rarity);
            
            return (
              <div
                key={achievement.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${rarityColor} opacity-5`}></div>
                <div className="relative flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${rarityColor} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate" title={achievement.title}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={achievement.description}>
                      {achievement.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Earned {formatEarnedDate(achievement.earnedDate)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Next Achievement */}
      {nextAchievement && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-700 dark:text-gray-300 truncate" title={`Next: ${nextAchievement.title}`}>
                Next: {nextAchievement.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={nextAchievement.description}>
                {nextAchievement.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No achievements state */}
      {achievements.length === 0 && !loading && (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Achievements Yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Start learning to earn your first achievement!</p>
        </div>
      )}
    </div>
  );
}