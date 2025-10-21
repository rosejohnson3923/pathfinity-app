/**
 * CCM Victory Screen
 * End-game celebration and results for Career Challenge Multiplayer
 *
 * Features:
 * - Final rankings with medals
 * - Score breakdown (base + multipliers)
 * - XP earned display
 * - Leadership "6 C's" ratings
 * - Play Again button (returns to intermission)
 * - Celebration animations for top performers
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Star,
  Award,
  Play,
  TrendingUp,
  Zap,
  Users,
  Medal,
  Home
} from 'lucide-react';
import confetti from 'canvas-confetti';
import '../../design-system/index.css';

interface PlayerFinalResult {
  id: string;
  name: string;
  totalScore: number;
  rank: number;
  isCurrentUser: boolean;
  cSuiteChoice?: string;
  roundScores: number[];
  xpEarned: number;
  achievements: string[];
}

interface ScoreBreakdown {
  baseScore: number;
  synergyMultiplier: number;
  lensMultiplier: number;
  speedMultiplier: number;
  finalScore: number;
  breakdown: string;
}


interface CCMVictoryScreenProps {
  sessionId: string;
  roomName: string;
  gameNumber: number;
  playerResults: PlayerFinalResult[];
  userScoreBreakdown?: ScoreBreakdown;
  onPlayAgain: () => void; // Returns to intermission or lobby
  onReturnToLobby?: () => void;
}

export const CCMVictoryScreen: React.FC<CCMVictoryScreenProps> = ({
  sessionId,
  roomName,
  gameNumber,
  playerResults,
  userScoreBreakdown,
  onPlayAgain,
  onReturnToLobby
}) => {
  const currentUser = playerResults.find(p => p.isCurrentUser);
  const userRank = currentUser?.rank || playerResults.length;
  const [showXPAnimation, setShowXPAnimation] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'rankings' | 'achievements' | 'stats'>('rankings');

  // XP animation timer
  useEffect(() => {
    const timer = setTimeout(() => setShowXPAnimation(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Fire confetti for top 3 finishers
  useEffect(() => {
    if (userRank <= 3) {
      const colors = userRank === 1
        ? ['#FFD700', '#FFA500', '#FF6B6B'] // Gold theme
        : userRank === 2
        ? ['#C0C0C0', '#A8A8A8', '#9333ea'] // Silver theme
        : ['#CD7F32', '#ec4899', '#f59e0b']; // Bronze theme

      confetti({
        particleCount: userRank === 1 ? 200 : 150,
        spread: 100,
        origin: { y: 0.6 },
        colors
      });

      // Second burst for first place
      if (userRank === 1) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.7 },
            colors
          });
        }, 500);
      }
    }
  }, [userRank]);

  // Get rank display
  const getRankDisplay = (rank: number): string => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
  };

  const getRankColor = (rank: number): string => {
    if (rank === 1) return 'text-yellow-300';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'glass-text-muted';
  };

  const getRankIcon = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  // Get C-Suite display name
  const getCsuiteDisplay = (choice?: string): string => {
    if (!choice) return 'None';
    const labels: Record<string, string> = {
      ceo: 'CEO',
      cfo: 'CFO',
      cmo: 'CMO',
      cto: 'CTO',
      chro: 'CHRO',
      coo: 'COO'
    };
    return labels[choice] || choice.toUpperCase();
  };

  // Get C-Suite icon
  const getCSuiteIcon = (lens: string | null) => {
    const icons: Record<string, string> = {
      'ceo': '👔',
      'cfo': '💰',
      'cmo': '📢',
      'cto': '💻',
      'chro': '🤝',
      'coo': '⚙️'
    };
    return lens ? icons[lens] || '🎯' : '🎯';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 p-4">
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

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          className="glass-card text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="inline-block mb-4"
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            <Trophy className="w-20 h-20 glass-icon-accent mx-auto" />
          </motion.div>
          <h1 className="text-5xl font-bold glass-text-primary mb-2">
            Game Complete!
          </h1>
          <p className="glass-text-secondary text-xl mb-1">
            You finished {getRankDisplay(userRank)} place!
          </p>
          <p className="glass-text-tertiary text-sm">
            {roomName} • Game #{gameNumber}
          </p>
        </motion.div>

        {/* Score Summary Cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-4 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* XP Earned */}
          <motion.div
            className="glass-game text-center p-6"
            animate={{ scale: showXPAnimation ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5, repeat: showXPAnimation ? Infinity : 0, repeatDelay: 1 }}
          >
            <Star className="w-8 h-8 glass-icon-accent mx-auto mb-2" />
            <div className="text-3xl font-bold glass-text-primary mb-1">
              +{currentUser?.xpEarned.toLocaleString() || 0}
            </div>
            <div className="glass-text-tertiary text-sm">XP Earned</div>
          </motion.div>

          {/* Final Score */}
          <div className="glass-game text-center p-6">
            <Trophy className="w-8 h-8 glass-icon-primary mx-auto mb-2" />
            <div className="text-3xl font-bold glass-text-primary mb-1">
              {currentUser?.totalScore.toLocaleString() || 0}
            </div>
            <div className="glass-text-tertiary text-sm">Total Score</div>
          </div>

          {/* Perfect Rounds */}
          <div className="glass-game text-center p-6">
            <Award className="w-8 h-8 glass-icon-success mx-auto mb-2" />
            <div className="text-3xl font-bold glass-text-primary mb-1">
              {currentUser?.roundScores.filter(s => s === 130).length || 0}
            </div>
            <div className="glass-text-tertiary text-sm">Perfect Rounds</div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Score Breakdown */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 glass-icon-primary" />
              <h2 className="text-2xl font-bold glass-text-primary">Score Breakdown</h2>
            </div>

            <div className="space-y-3">
              <div className="glass-subtle p-3 rounded-lg flex justify-between items-center">
                <span className="glass-text-secondary">Base Score</span>
                <span className="glass-text-primary font-bold text-xl">
                  {userScoreBreakdown.baseScore}
                </span>
              </div>

              <div className="glass-subtle p-3 rounded-lg flex justify-between items-center">
                <span className="glass-text-secondary">Synergy Multiplier</span>
                <span className="glass-icon-success font-bold text-xl">
                  ×{userScoreBreakdown.synergyMultiplier.toFixed(1)}
                </span>
              </div>

              <div className="glass-subtle p-3 rounded-lg flex justify-between items-center">
                <span className="glass-text-secondary">Lens Multiplier</span>
                <span className="glass-icon-accent font-bold text-xl">
                  ×{userScoreBreakdown.lensMultiplier.toFixed(1)}
                </span>
              </div>

              <div className="glass-subtle p-3 rounded-lg flex justify-between items-center">
                <span className="glass-text-secondary">Speed Multiplier</span>
                <span className="glass-icon-warning font-bold text-xl">
                  ×{userScoreBreakdown.speedMultiplier.toFixed(1)}
                </span>
              </div>

              <div className="glass-game p-4 rounded-lg flex justify-between items-center border-t-2 border-white/20">
                <span className="glass-text-primary font-bold text-lg">Final Score</span>
                <span className="glass-icon-accent font-bold text-3xl">
                  {userScoreBreakdown.finalScore.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 glass-icon-accent" />
              <h2 className="text-2xl font-bold glass-text-primary">Achievements</h2>
            </div>

            <div className="space-y-2">
              {(currentUser?.achievements || []).map((achievement, index) => (
                <motion.div
                  key={achievement}
                  className="glass-subtle p-3 rounded-lg flex items-center gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                >
                  <Medal className="w-5 h-5 glass-icon-accent" />
                  <span className="glass-text-primary font-medium">{achievement}</span>
                </motion.div>
              ))}
              {(!currentUser?.achievements || currentUser.achievements.length === 0) && (
                <div className="glass-subtle p-4 rounded-lg text-center glass-text-tertiary">
                  Play more games to unlock achievements!
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Final Rankings */}
        <motion.div
          className="glass-card mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-8 h-8 glass-icon-accent" />
            <h2 className="text-2xl font-bold glass-text-primary">Final Rankings</h2>
          </div>

          <div className="space-y-3">
            {playerResults.map((player, index) => (
              <motion.div
                key={player.id}
                className={`glass-subtle p-4 rounded-lg ${
                  player.isCurrentUser ? 'ring-2 ring-yellow-400' : ''
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className="flex flex-col items-center">
                      <div className="text-3xl mb-1">
                        {getRankIcon(player.rank) || <Medal className="w-8 h-8 glass-text-muted" />}
                      </div>
                      <div className={`text-lg font-bold ${getRankColor(player.rank)}`}>
                        {getRankDisplay(player.rank)}
                      </div>
                    </div>

                    {/* Player Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="glass-text-primary font-bold text-lg">
                          {player.name}
                        </div>
                        {player.isCurrentUser && (
                          <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded-full font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="glass-text-tertiary text-sm flex items-center gap-3 mt-1">
                        <span>{getCSuiteIcon(player.cSuiteChoice)} {getCsuiteDisplay(player.cSuiteChoice)}</span>
                        <span>•</span>
                        <span className="text-green-600 font-semibold">+{player.xpEarned} XP</span>
                      </div>
                    </div>
                  </div>

                  {/* Score Display */}
                  <div className="text-right">
                    <div className="text-2xl font-bold glass-icon-accent flex items-center gap-1">
                      <Zap className="w-6 h-6" />
                      {player.totalScore.toLocaleString()}
                    </div>
                    <div className="glass-text-tertiary text-xs">points</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex gap-3"
        >
          {onReturnToLobby && (
            <motion.button
              onClick={onReturnToLobby}
              className="flex-1 glass-subtle hover:glass-hover glass-text-primary font-bold py-5 px-8 rounded-xl shadow-lg flex items-center justify-center gap-3 text-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home className="w-7 h-7" />
              Return to Lobby
            </motion.button>
          )}
          <motion.button
            onClick={onPlayAgain}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-5 px-8 rounded-xl shadow-lg flex items-center justify-center gap-3 text-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="w-7 h-7" fill="currentColor" />
            Play Again
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default CCMVictoryScreen;
