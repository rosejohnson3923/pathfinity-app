import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy,
  Users,
  Zap,
  Lock,
  Unlock,
  CheckCircle,
  GameController2,
  TrendingUp,
  Timer,
  Star,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { journeyTrackerService } from '../services/journeyTracker';
import { careerChallengeService } from '../services/CareerChallengeService';

interface ContainerStatus {
  name: string;
  status: 'locked' | 'unlocked' | 'completed';
  progress: number;
  totalSteps: number;
  isActive: boolean;
}

interface FeaturedGame {
  id: string;
  name: string;
  tagline: string;
  rating: 'E' | 'E10+' | 'T';
  playerCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  xpRange: string;
  timeEstimate: string;
  icon: React.ReactNode;
}

const StudentDashboardRedesigned: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [containers, setContainers] = useState<ContainerStatus[]>([]);
  const [playerStats, setPlayerStats] = useState({
    totalXP: 0,
    leaderboardRank: 0,
    currentStreak: 0,
  });
  const [onlinePlayerCounts, setOnlinePlayerCounts] = useState({
    careerChallenge: 0,
    bingoCareers: 0,
  });
  const [isDiscoveredLiveUnlocked, setIsDiscoveredLiveUnlocked] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    // Load container progress
    const progress = await journeyTrackerService.getUserProgress(user.id);
    const containerData: ContainerStatus[] = [
      {
        name: 'LEARN',
        status: progress.learnCompleted ? 'completed' : progress.currentContainer === 'learn' ? 'unlocked' : 'locked',
        progress: progress.learnProgress,
        totalSteps: 5,
        isActive: progress.currentContainer === 'learn',
      },
      {
        name: 'EXPERIENCE',
        status: progress.experienceCompleted ? 'completed' : progress.currentContainer === 'experience' ? 'unlocked' : 'locked',
        progress: progress.experienceProgress,
        totalSteps: 6,
        isActive: progress.currentContainer === 'experience',
      },
      {
        name: 'DISCOVER',
        status: progress.discoverCompleted ? 'completed' : progress.currentContainer === 'discover' ? 'unlocked' : 'locked',
        progress: progress.discoverProgress,
        totalSteps: 8,
        isActive: progress.currentContainer === 'discover',
      },
    ];
    setContainers(containerData);

    // Check if Discovered Live! is unlocked (all containers completed or override for testing)
    const allCompleted = containerData.every(c => c.status === 'completed');
    setIsDiscoveredLiveUnlocked(allCompleted || true); // Set to true for testing

    // Load player stats
    const playerProgress = await careerChallengeService.getPlayerProgress(user.id);
    if (playerProgress) {
      setPlayerStats({
        totalXP: playerProgress.totalXp,
        leaderboardRank: 42, // This would come from a leaderboard service
        currentStreak: playerProgress.currentWinStreak,
      });
    }

    // Simulate online player counts (would be real-time in production)
    setOnlinePlayerCounts({
      careerChallenge: Math.floor(Math.random() * 500) + 100,
      bingoCareers: Math.floor(Math.random() * 300) + 50,
    });
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'E':
        return 'bg-green-500';
      case 'E10+':
        return 'bg-blue-500';
      case 'T':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRatingDescription = (rating: string) => {
    switch (rating) {
      case 'E':
        return 'Everyone - All Ages';
      case 'E10+':
        return 'Everyone 10+';
      case 'T':
        return 'Teen (13+)';
      default:
        return '';
    }
  };

  const handleContainerClick = (container: ContainerStatus) => {
    if (container.status === 'unlocked' || container.status === 'completed') {
      navigate(`/journey/${container.name.toLowerCase()}`);
    }
  };

  const handleGameClick = (gameId: string) => {
    switch (gameId) {
      case 'career-challenge':
        navigate('/discovered-live/career-challenge-multiplayer');
        break;
      case 'bingo-careers':
        navigate('/bingo-careers');
        break;
      default:
        navigate('/arcade');
    }
  };

  const featuredGames: FeaturedGame[] = [
    {
      id: 'career-challenge',
      name: 'Career Challenge',
      tagline: 'Be the CEO - Make Critical Decisions',
      rating: 'T',
      playerCount: onlinePlayerCounts.careerChallenge,
      isNew: true,
      isFeatured: true,
      xpRange: '100-500 XP',
      timeEstimate: '10-15 min',
      icon: <Trophy className="w-6 h-6" />,
    },
    {
      id: 'bingo-careers',
      name: 'Bingo Careers',
      tagline: 'Quick Fun Career Matching',
      rating: 'E',
      playerCount: onlinePlayerCounts.bingoCareers,
      xpRange: '50-100 XP',
      timeEstimate: '5 min',
      icon: <GameController2 className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.username}!</h1>
          <p className="text-gray-300">Continue your career journey and compete with others</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Educational Journey */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-purple-400" />
                Your Learning Journey
              </h2>

              <div className="space-y-4">
                {containers.map((container, index) => (
                  <motion.div
                    key={container.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleContainerClick(container)}
                    className={`relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      container.status === 'locked'
                        ? 'bg-gray-800/50 border-gray-600 opacity-50 cursor-not-allowed'
                        : container.status === 'completed'
                        ? 'bg-green-900/30 border-green-500 hover:bg-green-900/50'
                        : 'bg-purple-900/30 border-purple-500 hover:bg-purple-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {container.status === 'locked' && <Lock className="w-5 h-5 mr-2" />}
                        {container.status === 'unlocked' && <Unlock className="w-5 h-5 mr-2 text-purple-400" />}
                        {container.status === 'completed' && <CheckCircle className="w-5 h-5 mr-2 text-green-400" />}
                        <h3 className="text-lg font-semibold">{container.name}</h3>
                        {container.isActive && (
                          <span className="ml-2 px-2 py-1 bg-purple-500 text-xs rounded-full animate-pulse">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-400">
                        {container.progress}/{container.totalSteps} steps
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(container.progress / container.totalSteps) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Journey Stats */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-purple-400">
                      {containers.filter(c => c.status === 'completed').length}/3
                    </p>
                    <p className="text-xs text-gray-400">Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-pink-400">
                      {containers.reduce((sum, c) => sum + c.progress, 0)}
                    </p>
                    <p className="text-xs text-gray-400">Total Steps</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-400">
                      {Math.round((containers.reduce((sum, c) => sum + c.progress, 0) /
                        containers.reduce((sum, c) => sum + c.totalSteps, 0)) * 100)}%
                    </p>
                    <p className="text-xs text-gray-400">Progress</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Discovered Live! */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-gradient-to-br from-orange-900/50 to-red-900/50 backdrop-blur-sm rounded-xl p-6 border-2 ${
                isDiscoveredLiveUnlocked ? 'border-orange-500' : 'border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center">
                  <GameController2 className="w-6 h-6 mr-2 text-orange-400" />
                  Discovered Live!
                </h2>
                {!isDiscoveredLiveUnlocked && (
                  <span className="flex items-center text-sm text-gray-400">
                    <Lock className="w-4 h-4 mr-1" />
                    Complete all containers to unlock
                  </span>
                )}
              </div>

              {/* Featured Games */}
              <div className="space-y-4">
                {featuredGames.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isDiscoveredLiveUnlocked ? 1 : 0.5, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => isDiscoveredLiveUnlocked && handleGameClick(game.id)}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      isDiscoveredLiveUnlocked
                        ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl'
                        : 'cursor-not-allowed opacity-75'
                    } ${
                      game.isFeatured
                        ? 'bg-gradient-to-r from-orange-900/50 to-red-900/50 border-orange-500'
                        : 'bg-gray-800/50 border-gray-600'
                    }`}
                  >
                    {game.isNew && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        NEW
                      </span>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          {game.icon}
                          <h3 className="text-lg font-bold ml-2">{game.name}</h3>
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded ${getRatingColor(game.rating)} text-white`}>
                            {game.rating}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">{game.tagline}</p>

                        {/* Game Stats */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center text-green-400">
                            <Users className="w-3 h-3 mr-1" />
                            {game.playerCount} online
                          </div>
                          <div className="flex items-center text-purple-400">
                            <Zap className="w-3 h-3 mr-1" />
                            {game.xpRange}
                          </div>
                          <div className="flex items-center text-blue-400">
                            <Timer className="w-3 h-3 mr-1" />
                            {game.timeEstimate}
                          </div>
                        </div>
                      </div>

                      {isDiscoveredLiveUnlocked && (
                        <ChevronRight className="w-6 h-6 text-gray-400 ml-4" />
                      )}
                    </div>

                    {/* Rating Description on Hover */}
                    <div className="absolute bottom-full left-4 mb-2 hidden group-hover:block">
                      <div className="bg-gray-900 text-white text-xs rounded px-2 py-1">
                        {getRatingDescription(game.rating)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-sm font-semibold mb-3 text-gray-400">Your Gaming Stats</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                    <p className="text-lg font-bold">{playerStats.totalXP.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Total XP</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-400" />
                    <p className="text-lg font-bold">#{playerStats.leaderboardRank}</p>
                    <p className="text-xs text-gray-400">Rank</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <Star className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                    <p className="text-lg font-bold">{playerStats.currentStreak}</p>
                    <p className="text-xs text-gray-400">Day Streak</p>
                  </div>
                </div>
              </div>

              {/* Browse All Games Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/arcade')}
                disabled={!isDiscoveredLiveUnlocked}
                className={`w-full mt-4 py-3 rounded-lg font-semibold transition-all ${
                  isDiscoveredLiveUnlocked
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                    : 'bg-gray-700 cursor-not-allowed opacity-50'
                }`}
              >
                Browse All Games
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardRedesigned;