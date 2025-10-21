/**
 * Discovered Live! Arcade - Main Game Hub
 *
 * Central arcade lobby with two game categories:
 * 1. Quick Play - Fast-paced games (5-10 min) like Career Bingo
 * 2. Challenge Rooms - Strategy games (20-30 min) like ECG Challenge Cards
 *
 * Features:
 * - Browse games by category
 * - View player stats and leaderboards
 * - Real-time room status
 * - Career progression tracking
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, Trophy, Zap, Crown, ArrowLeft, Grid3x3, Gamepad2, Star, TrendingUp, Clock, Target, Sparkles, Info, X, Building2, Brain, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useThemeContext } from '../contexts/ThemeContext';
import '../design-system/index.css';

type GameCategory = 'quick_play' | 'challenge';

interface GameCardData {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  playerCount: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'available' | 'coming_soon';
  route: string;
  category: GameCategory;
  badge?: string; // e.g., "NEW", "HOT", "LIVE"
}

interface GameCardProps {
  game: GameCardData;
  index: number;
  onPlay: (game: GameCardData) => void;
  onShowRules?: (game: GameCardData) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, index, onPlay, onShowRules }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass-card group relative ${
        game.status === 'coming_soon' ? 'opacity-60' : 'hover:scale-[1.02]'
      } transition-all duration-200`}
    >
      {/* Badge */}
      {game.badge && (
        <div className="absolute top-4 right-4 z-10">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
            game.badge === 'LIVE'
              ? 'bg-green-500 text-white animate-pulse'
              : game.badge === 'NEW'
              ? 'bg-purple-500 text-white'
              : 'bg-orange-500 text-white'
          }`}>
            {game.badge}
          </span>
        </div>
      )}

      {/* Game Icon */}
      <div className="flex items-center justify-center mb-4">
        <div className={`glass-game p-6 rounded-2xl ${
          game.status === 'available'
            ? 'glass-icon-primary'
            : 'glass-text-muted'
        }`}>
          {game.icon}
        </div>
      </div>

      {/* Game Info */}
      <h4 className="text-2xl font-bold glass-text-primary mb-2 text-center">
        {game.name}
      </h4>
      <p className={`glass-text-secondary mb-4 min-h-[3rem] ${
        game.category === 'challenge' ? 'text-justify' : 'text-center'
      }`}>
        {game.description}
      </p>

      {/* Game Details */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="glass-subtle text-center py-2 px-1">
          <div className="glass-text-secondary font-semibold text-xs">{game.playerCount}</div>
        </div>
        <div className="glass-subtle text-center py-2 px-1">
          <div className="glass-text-secondary font-semibold text-xs">{game.duration}</div>
        </div>
        <div className="glass-subtle text-center py-2 px-1">
          <div className={`font-semibold text-xs ${
            game.difficulty === 'Easy' ? 'glass-icon-success' :
            game.difficulty === 'Medium' ? 'glass-icon-accent' :
            'glass-icon-warning'
          }`}>
            {game.difficulty}
          </div>
        </div>
      </div>

      {/* Play Button */}
      {game.status === 'available' ? (
        <div className="space-y-2">
          <motion.button
            onClick={() => onPlay(game)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-5 h-5" fill="currentColor" />
            Play Now
          </motion.button>

          {/* Show Rules button for Career Bingo and Career Challenge MP */}
          {(game.id === 'career-bingo' || game.id === 'career-challenge-multiplayer') && onShowRules && (
            <button
              onClick={() => onShowRules(game)}
              className="w-full glass-subtle hover:glass-hover text-center py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 glass-text-secondary transition-all"
            >
              <Info className="w-4 h-4" />
              <span className="text-sm">How to Play</span>
            </button>
          )}
        </div>
      ) : (
        <div className="w-full glass-subtle text-center py-3 px-6 rounded-xl glass-text-muted font-bold">
          Coming Soon
        </div>
      )}
    </motion.div>
  );
};

export const DiscoveredLivePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { theme } = useThemeContext();

  // State for rules modal
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [selectedGameForRules, setSelectedGameForRules] = useState<GameCardData | null>(null);

  // Get user info
  const userName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Player';

  // Get user's career from sessionStorage (set during career selection)
  const getSessionCareer = () => {
    const storedCareer = sessionStorage.getItem('selectedCareer');
    if (storedCareer) {
      try {
        const parsed = JSON.parse(storedCareer);
        return parsed.career || parsed.name || 'Explorer';
      } catch {
        // If not JSON, treat as plain string
        return storedCareer;
      }
    }
    return 'Explorer'; // Default fallback
  };

  const userCareer = getSessionCareer();

  // Available games in Discovered Live! Arcade
  const games: GameCardData[] = [
    // ===== QUICK PLAY GAMES (5-10 min) =====
    {
      id: 'career-bingo',
      name: 'Career Bingo',
      description: 'Match career clues to complete your bingo card in this fast-paced multiplayer game!',
      icon: <Grid3x3 className="w-12 h-12" />,
      playerCount: '2-6 players',
      duration: '5-10 min',
      difficulty: 'Easy',
      status: 'available',
      route: '/discovered-live/career-bingo',
      category: 'quick_play',
      badge: 'LIVE'
    },
    {
      id: 'career-trivia',
      name: 'Career Trivia',
      description: 'Test your knowledge in rapid-fire career questions against the clock!',
      icon: <Zap className="w-12 h-12" />,
      playerCount: '2-8 players',
      duration: '10-15 min',
      difficulty: 'Medium',
      status: 'coming_soon',
      route: '',
      category: 'quick_play'
    },
    {
      id: 'speed-match',
      name: 'Speed Match',
      description: 'Quick reflexes win! Match careers to industries in record time!',
      icon: <Clock className="w-12 h-12" />,
      playerCount: '2-6 players',
      duration: '5-8 min',
      difficulty: 'Easy',
      status: 'coming_soon',
      route: '',
      category: 'quick_play'
    },

    // ===== CHALLENGE ROOMS (20-30 min) =====
    {
      id: 'career-challenge-multiplayer',
      name: 'CEO Takeover',
      description: 'Choose from 30 companies, solve real business challenges across the 6 P\'s of Business. Select the optimal C-Suite lens for strategic scoring!',
      icon: <Users className="w-12 h-12" />,
      playerCount: '2-4 players',
      duration: '6 rounds',
      difficulty: 'Medium',
      status: 'available',
      route: '/discovered-live/career-challenge-multiplayer',
      category: 'challenge',
      badge: 'LIVE'
    },
    {
      id: 'career-challenge',
      name: 'Company Rescue',
      description: 'Become a strategic business consultant! Fix failing businesses, guide epic turnarounds, and power up your entrepreneurial skills',
      icon: <Target className="w-12 h-12" />,
      playerCount: '2-6 players',
      duration: '20-30 min',
      difficulty: 'Hard',
      status: 'available',
      route: '/discovered-live/career-challenge',
      category: 'challenge',
      badge: 'NEW'
    },
    {
      id: 'skill-showdown',
      name: 'Skill Showdown',
      description: 'Deep-dive into careers with strategic skill demonstrations and teamwork!',
      icon: <Trophy className="w-12 h-12" />,
      playerCount: '2-4 players',
      duration: '25-35 min',
      difficulty: 'Hard',
      status: 'coming_soon',
      route: '',
      category: 'challenge'
    },
    {
      id: 'career-quest',
      name: 'Career Quest',
      description: 'Embark on an epic journey exploring career pathways and making strategic choices!',
      icon: <Sparkles className="w-12 h-12" />,
      playerCount: '2-6 players',
      duration: '30-40 min',
      difficulty: 'Medium',
      status: 'coming_soon',
      route: '',
      category: 'challenge'
    }
  ];

  // Filter games by category
  const quickPlayGames = games.filter(g => g.category === 'quick_play');
  const challengeGames = games.filter(g => g.category === 'challenge');

  const handlePlayGame = (game: GameCardData) => {
    if (game.status === 'available') {
      navigate(game.route);
    }
  };

  const handleShowRules = (game: GameCardData) => {
    setSelectedGameForRules(game);
    setShowRulesModal(true);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg%3E%3Cpolygon fill='%23ffffff' opacity='0.3' points='30 0 45 15 30 30 15 15'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="glass-panel">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              {/* Logo & Title */}
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={handleBackToDashboard}
                  className="glass-card-sm p-3 hover:scale-105 transition-transform"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-5 h-5 glass-icon-primary" />
                </motion.button>
                <div>
                  <h1 className="text-3xl font-bold glass-text-primary flex items-center gap-3">
                    <Crown className="w-8 h-8 glass-icon-accent" />
                    Discovered Live!
                  </h1>
                  <p className="glass-text-secondary text-sm">Career Bingo • Multiplayer</p>
                </div>
              </div>

              {/* User Info */}
              <div className="glass-card-sm flex items-center gap-3 px-4 py-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                  {userName[0].toUpperCase()}
                </div>
                <div>
                  <div className="glass-text-primary font-semibold">{userName}</div>
                  <div className="glass-text-tertiary text-xs">{userCareer}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="glass-card mb-8">
          <div className="text-center">
            <motion.div
              className="inline-block"
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <Gamepad2 className="w-20 h-20 glass-icon-accent mx-auto mb-4" />
            </motion.div>
            <h2 className="text-4xl font-bold glass-text-primary mb-2">
              Welcome to Discovered Live!
            </h2>
            <p className="glass-text-secondary text-lg">
              Compete, learn, and level up your career knowledge
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="glass-game text-center p-6">
            <Trophy className="w-8 h-8 glass-icon-accent mx-auto mb-2" />
            <div className="text-2xl font-bold glass-text-primary mb-1">0</div>
            <div className="glass-text-tertiary text-sm">Games Played</div>
          </div>
          <div className="glass-game text-center p-6">
            <Zap className="w-8 h-8 glass-icon-primary mx-auto mb-2" />
            <div className="text-2xl font-bold glass-text-primary mb-1">0</div>
            <div className="glass-text-tertiary text-sm">Total XP</div>
          </div>
          <div className="glass-game text-center p-6">
            <Star className="w-8 h-8 glass-icon-primary mx-auto mb-2" />
            <div className="text-2xl font-bold glass-text-primary mb-1">-</div>
            <div className="glass-text-tertiary text-sm">Rank</div>
          </div>
          <div className="glass-game text-center p-6">
            <TrendingUp className="w-8 h-8 glass-icon-success mx-auto mb-2" />
            <div className="text-2xl font-bold glass-text-primary mb-1">0%</div>
            <div className="glass-text-tertiary text-sm">Win Rate</div>
          </div>
        </div>

        {/* Quick Play Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-8 h-8 glass-icon-accent" />
            <div>
              <h3 className="text-3xl font-bold glass-text-primary">Quick Play</h3>
              <p className="glass-text-tertiary text-sm">Fast-paced games • 5-10 minutes • Jump in anytime</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickPlayGames.map((game, index) => (
              <GameCard key={game.id} game={game} index={index} onPlay={handlePlayGame} onShowRules={handleShowRules} />
            ))}
          </div>
        </div>

        {/* Challenge Rooms Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8 glass-icon-primary" />
            <div>
              <h3 className="text-3xl font-bold glass-text-primary">Challenge Rooms</h3>
              <p className="glass-text-tertiary text-sm">Strategy & teamwork • 20-40 minutes • Deep learning</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challengeGames.map((game, index) => (
              <GameCard key={game.id} game={game} index={index} onPlay={handlePlayGame} onShowRules={handleShowRules} />
            ))}
          </div>
        </div>
      </div>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRulesModal && selectedGameForRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRulesModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6 sticky top-0 glass-card z-10 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-3xl font-bold glass-text-primary flex items-center gap-3">
                    {selectedGameForRules.icon}
                    {selectedGameForRules.name}
                  </h2>
                  <p className="glass-text-tertiary text-sm mt-1">How to Play</p>
                </div>
                <button
                  onClick={() => {
                    setShowRulesModal(false);
                    setSelectedGameForRules(null);
                  }}
                  className="glass-card-sm p-2 hover:scale-110 transition-transform"
                >
                  <X className="w-6 h-6 glass-icon-primary" />
                </button>
              </div>

              {/* Career Bingo Rules */}
              {selectedGameForRules.id === 'career-bingo' && (
                <>
                  {/* Game Overview */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 glass-icon-accent" />
                      <h3 className="text-xl font-bold glass-text-primary">Game Overview</h3>
                    </div>
                    <p className="glass-text-secondary leading-relaxed">
                      Answer career clues to fill your <span className="font-bold glass-text-primary">5×5 bingo card</span>! Each correct answer unlocks a career square. Complete 5 squares in a row, column, or diagonal to score <span className="font-bold glass-text-primary">BINGO</span> and earn bonus XP!
                    </p>
                  </div>

                  {/* Game Flow */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Play className="w-5 h-5 glass-icon-primary" />
                      <h3 className="text-xl font-bold glass-text-primary">How to Play</h3>
                    </div>

                    <div className="space-y-3">
                      {/* Step 1 */}
                      <div className="glass-subtle p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            1
                          </div>
                          <div>
                            <h4 className="font-bold glass-text-primary mb-1 flex items-center gap-2">
                              <Grid3x3 className="w-4 h-4" />
                              Your Bingo Card
                            </h4>
                            <p className="glass-text-secondary text-sm">
                              You'll receive a <span className="font-bold">5×5 bingo card</span> with 25 career squares. Your selected career appears in the <span className="font-bold text-yellow-400">center as a FREE space</span> to give you a head start!
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="glass-subtle p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            2
                          </div>
                          <div>
                            <h4 className="font-bold glass-text-primary mb-1 flex items-center gap-2">
                              <Brain className="w-4 h-4" />
                              Answer Career Clues
                            </h4>
                            <p className="glass-text-secondary text-sm">
                              Each question presents a career clue. Read carefully and select the correct career from the multiple choice options. You have <span className="font-bold text-yellow-400">8 seconds</span> to answer each question!
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="glass-subtle p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            3
                          </div>
                          <div>
                            <h4 className="font-bold glass-text-primary mb-1 flex items-center gap-2">
                              <Star className="w-4 h-4" />
                              Unlock Career Squares
                            </h4>
                            <p className="glass-text-secondary text-sm">
                              When you answer correctly, that career will be <span className="font-bold text-green-400">marked on your bingo card</span> if it appears in any of your 25 squares. Each unlocked square earns you <span className="font-bold text-blue-400">+10 XP</span>!
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="glass-subtle p-4 rounded-lg border-2 border-yellow-500/30">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            4
                          </div>
                          <div>
                            <h4 className="font-bold glass-text-primary mb-1 flex items-center gap-2">
                              <Trophy className="w-4 h-4" />
                              Score BINGO!
                            </h4>
                            <p className="glass-text-secondary text-sm">
                              Complete <span className="font-bold text-yellow-400">5 squares in a row</span> (horizontal, vertical, or diagonal) to score <span className="font-bold text-yellow-400">BINGO</span> and earn a <span className="font-bold text-green-400">+50 XP bonus</span>! You can score multiple BINGOs in one game!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scoring */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 glass-icon-accent" />
                      <h3 className="text-xl font-bold glass-text-primary">Scoring System</h3>
                    </div>

                    <div className="glass-subtle p-4 rounded-lg space-y-3">
                      <div className="glass-game p-3 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="glass-text-secondary">Correct Answer:</span>
                          <span className="font-bold text-green-500">+10 XP</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="glass-text-secondary">Wrong Answer:</span>
                          <span className="font-bold text-red-500">-5 XP</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="glass-text-secondary">BINGO Bonus:</span>
                          <span className="font-bold text-yellow-500">+50 XP</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="glass-text-secondary">Answer Streak Bonus:</span>
                          <span className="font-bold text-blue-500">+Extra XP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Important Tips */}
                  <div className="mb-6">
                    <div className="glass-accent p-4 rounded-lg border-l-4 border-red-500">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-red-300 mb-1">⚠️ Important</h4>
                          <p className="glass-text-secondary text-sm">
                            Wrong answers not only cost you <span className="font-bold text-red-300">-5 XP</span>, but also <span className="font-bold text-red-300">break your answer streak</span>! Stay focused and think carefully before answering.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Winning */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className="w-5 h-5 glass-icon-accent" />
                      <h3 className="text-xl font-bold glass-text-primary">Winning</h3>
                    </div>
                    <p className="glass-text-secondary text-sm">
                      The player with the <span className="font-bold glass-text-primary">highest total XP</span> at the end of the game wins! Maximize your score by answering correctly, maintaining streaks, and scoring multiple BINGOs!
                    </p>
                  </div>

                  {/* Pro Tips */}
                  <div className="glass-accent p-4 rounded-lg">
                    <h4 className="font-bold glass-text-primary mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 glass-icon-accent" />
                      Pro Tips
                    </h4>
                    <ul className="space-y-1.5 text-sm glass-text-secondary">
                      <li>• Focus on completing diagonals first - they're often easier to spot!</li>
                      <li>• Answer quickly to build streaks and earn bonus XP</li>
                      <li>• Your center FREE space gives you a strategic advantage for completing BINGOs</li>
                      <li>• Read each career clue carefully - rushing leads to mistakes!</li>
                      <li>• Watch the leaderboard to see how you stack up against other players</li>
                    </ul>
                  </div>

                  {/* Play Button */}
                  <motion.button
                    onClick={() => {
                      setShowRulesModal(false);
                      setSelectedGameForRules(null);
                      navigate(selectedGameForRules.route);
                    }}
                    className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Play className="w-5 h-5" fill="currentColor" />
                    Ready to Play!
                  </motion.button>
                </>
              )}

              {/* CEO Takeover Rules */}
              {selectedGameForRules.id === 'career-challenge-multiplayer' && (
                <>
                  {/* Game Overview */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 glass-icon-accent" />
                      <h3 className="text-xl font-bold glass-text-primary">Game Overview</h3>
                    </div>
                    <p className="glass-text-secondary leading-relaxed">
                      Choose from <span className="font-bold glass-text-primary">30 real companies</span> across different industries and solve business challenges through the lens of a C-Suite executive! Strategic thinking and the right perspective can multiply your score!
                    </p>
                  </div>

              {/* Game Flow */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Play className="w-5 h-5 glass-icon-primary" />
                  <h3 className="text-xl font-bold glass-text-primary">Game Flow</h3>
                </div>

                <div className="space-y-3">
                  {/* Step 1 */}
                  <div className="glass-subtle p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-bold glass-text-primary mb-1 flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          Choose Your Company
                        </h4>
                        <p className="glass-text-secondary text-sm">
                          Select from 30 companies (10 elementary, 10 middle school, 10 high school levels). Each company has 6 unique business challenges across the 6 P categories.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="glass-subtle p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-bold glass-text-primary mb-1 flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          Round 1: Select Your C-Suite Lens
                        </h4>
                        <p className="glass-text-secondary text-sm mb-2">
                          Choose which executive perspective you'll use for the entire game:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="glass-game p-2 rounded">👔 <span className="font-semibold">CEO</span> - Strategy & Leadership</div>
                          <div className="glass-game p-2 rounded">💰 <span className="font-semibold">CFO</span> - Finance & Numbers</div>
                          <div className="glass-game p-2 rounded">📢 <span className="font-semibold">CMO</span> - Marketing & Brand</div>
                          <div className="glass-game p-2 rounded">💻 <span className="font-semibold">CTO</span> - Technology & Innovation</div>
                          <div className="glass-game p-2 rounded">🤝 <span className="font-semibold">CHRO</span> - People & Culture</div>
                          <div className="glass-game p-2 rounded">⚙️ <span className="font-semibold">COO</span> - Operations & Process</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="glass-subtle p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-bold glass-text-primary mb-1 flex items-center gap-2">
                          <Trophy className="w-4 h-4" />
                          Round 2: Receive Random MVP Card
                        </h4>
                        <p className="glass-text-secondary text-sm">
                          At the start of Round 2, you'll receive a <span className="font-bold text-yellow-400">random MVP card</span> from your role card hand. This card provides a <span className="font-bold">+10 bonus</span> when used, but can only be played once per game!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="glass-subtle p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h4 className="font-bold glass-text-primary mb-1 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Rounds 2-6: Solve Business Challenges
                        </h4>
                        <p className="glass-text-secondary text-sm mb-2">
                          Face one challenge from each of the <span className="font-bold">6 P Categories</span>:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="glass-game p-2 rounded">👥 <span className="font-semibold">People</span></div>
                          <div className="glass-game p-2 rounded">📦 <span className="font-semibold">Product</span></div>
                          <div className="glass-game p-2 rounded">⚙️ <span className="font-semibold">Process</span></div>
                          <div className="glass-game p-2 rounded">📍 <span className="font-semibold">Place</span></div>
                          <div className="glass-game p-2 rounded">📢 <span className="font-semibold">Promotion</span></div>
                          <div className="glass-game p-2 rounded">💰 <span className="font-semibold">Price</span></div>
                        </div>
                        <p className="glass-text-tertiary text-xs mt-2 italic">
                          5 of 6 P categories are randomly selected each game
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="glass-subtle p-4 rounded-lg border-2 border-purple-500/30">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        5
                      </div>
                      <div>
                        <h4 className="font-bold glass-text-primary mb-1 flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Bonus Play: Strategic MVP Swaps
                        </h4>
                        <p className="glass-text-secondary text-sm mb-2">
                          After completing Rounds 2, 3, and 4, you'll have a <span className="font-bold text-purple-400">Bonus Play</span> opportunity:
                        </p>
                        <div className="glass-game p-3 rounded-lg space-y-2 text-xs">
                          <div className="flex items-start gap-2">
                            <span className="text-green-400">✓</span>
                            <span className="glass-text-secondary"><span className="font-bold">Keep</span> your current MVP card (play it safe)</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-purple-400">⟳</span>
                            <span className="glass-text-secondary"><span className="font-bold">Swap</span> for a different role card from your hand (strategic risk)</span>
                          </div>
                        </div>
                        <p className="glass-text-tertiary text-xs mt-2 italic">
                          Choose wisely! Your final MVP card determines your +10 bonus play.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scoring */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 glass-icon-accent" />
                  <h3 className="text-xl font-bold glass-text-primary">Scoring System</h3>
                </div>

                <div className="glass-subtle p-4 rounded-lg space-y-3">
                  <div>
                    <h4 className="font-semibold glass-text-primary mb-2">Lens Multipliers</h4>
                    <p className="glass-text-secondary text-sm mb-2">
                      Your chosen C-Suite lens affects your score based on the challenge category:
                    </p>
                    <div className="glass-game p-3 rounded-lg space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="glass-text-secondary">Perfect Match:</span>
                        <span className="font-bold text-green-500">+30% Bonus (1.30x)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="glass-text-secondary">Strong Match:</span>
                        <span className="font-bold text-blue-500">+25% Bonus (1.25x)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="glass-text-secondary">Good Match:</span>
                        <span className="font-bold text-purple-500">+15-20% Bonus (1.15-1.20x)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="glass-text-secondary">Neutral Match:</span>
                        <span className="font-bold glass-text-muted">No Bonus (1.0x)</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-game p-3 rounded-lg">
                    <p className="glass-text-primary text-sm font-semibold mb-1">Example:</p>
                    <p className="glass-text-secondary text-xs">
                      CHRO gets <span className="font-bold text-green-500">1.30x</span> on <span className="font-bold">People</span> challenges, but only <span className="font-bold">1.0x</span> on <span className="font-bold">Price</span> challenges.
                    </p>
                  </div>
                </div>
              </div>

              {/* Special Cards */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 glass-icon-accent" />
                  <h3 className="text-xl font-bold glass-text-primary">Special Cards</h3>
                </div>

                <div className="space-y-3">
                  {/* MVP Card */}
                  <div className="glass-subtle p-4 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex items-start gap-3">
                      <Trophy className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold glass-text-primary mb-1">MVP Card (+10 Bonus)</h4>
                        <p className="glass-text-secondary text-sm">
                          Randomly assigned in Round 2 from your hand. Provides <span className="font-bold text-yellow-400">+10 bonus points</span> when used. Can be swapped during Bonus Play phases. <span className="font-bold">One-time use only!</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Golden Card */}
                  <div className="glass-subtle p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold glass-text-primary mb-1">Golden Card (130 Points)</h4>
                        <p className="glass-text-secondary text-sm">
                          A powerful AI companion card worth <span className="font-bold text-blue-400">130 points</span>. Available from Round 2. <span className="font-bold">One-time use only!</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Round 5 Restriction */}
                  <div className="glass-accent p-4 rounded-lg border-l-4 border-red-500">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-red-300 mb-1">⚠️ Round 5 Restriction</h4>
                        <p className="glass-text-secondary text-sm">
                          In Round 5, you can use <span className="font-bold text-red-300">EITHER</span> your MVP card <span className="font-bold text-red-300">OR</span> your Golden card, but <span className="font-bold text-red-300">NOT BOTH</span>! Choose your strategy wisely!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Winning */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 glass-icon-accent" />
                  <h3 className="text-xl font-bold glass-text-primary">Winning</h3>
                </div>
                <p className="glass-text-secondary text-sm">
                  After 6 rounds, the player with the <span className="font-bold glass-text-primary">highest total score</span> wins! Strategic lens selection, smart use of special cards, and understanding the company's challenges are key to victory.
                </p>
              </div>

              {/* Quick Tips */}
              <div className="glass-accent p-4 rounded-lg">
                <h4 className="font-bold glass-text-primary mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 glass-icon-accent" />
                  Pro Tips
                </h4>
                <ul className="space-y-1.5 text-sm glass-text-secondary">
                  <li>• Choose a lens that matches your strategic thinking style</li>
                  <li>• Read each challenge carefully to understand the business context</li>
                  <li>• Consider how your executive would view each problem</li>
                  <li>• Use Bonus Play wisely - swap your MVP if you have a better role card for upcoming challenges</li>
                  <li>• Save your special cards (MVP or Golden) for high-scoring opportunities</li>
                  <li>• Different companies have different challenge difficulties based on grade level</li>
                </ul>
              </div>

              {/* Play Button */}
              <motion.button
                onClick={() => {
                  setShowRulesModal(false);
                  setSelectedGameForRules(null);
                  navigate('/discovered-live/career-challenge-multiplayer');
                }}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play className="w-5 h-5" fill="currentColor" />
                Ready to Play!
              </motion.button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiscoveredLivePage;
