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
import { motion } from 'framer-motion';
import { Play, Users, Trophy, Zap, Crown, ArrowLeft, Grid3x3, Gamepad2, Star, TrendingUp, Clock, Target, Sparkles } from 'lucide-react';
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
}

const GameCard: React.FC<GameCardProps> = ({ game, index, onPlay }) => {
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
      <p className="glass-text-secondary text-center mb-4 min-h-[3rem]">
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
        <motion.button
          onClick={() => onPlay(game)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Play className="w-5 h-5" fill="currentColor" />
          Play Now
        </motion.button>
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
      name: 'Career Challenge MP',
      description: 'Drop into 24/7 perpetual rooms! Play 5-round games with continuous matchmaking!',
      icon: <Users className="w-12 h-12" />,
      playerCount: '2-8 players',
      duration: '5 rounds',
      difficulty: 'Medium',
      status: 'available',
      route: '/discovered-live/career-challenge-multiplayer',
      category: 'challenge',
      badge: 'LIVE'
    },
    {
      id: 'career-challenge',
      name: 'Career Challenge',
      description: 'Strategic career exploration through challenge cards and skill building activities!',
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
              <GameCard key={game.id} game={game} index={index} onPlay={handlePlayGame} />
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
              <GameCard key={game.id} game={game} index={index} onPlay={handlePlayGame} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveredLivePage;
