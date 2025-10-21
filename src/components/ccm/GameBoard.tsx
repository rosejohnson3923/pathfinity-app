/**
 * CCM Game Board Component
 *
 * Displays the main game board with:
 * - Challenge card in the center
 * - Players arranged in cardinal directions (optimized for 4 players)
 * - Player status indicators (waiting, selecting, locked in)
 * - Round timer
 * - Score display
 *
 * Layout:
 * - 3x3 CSS Grid layout for precise cardinal positioning
 * - Each player at true north, east, south, west positions
 * - Current player is highlighted with yellow ring
 * - Optimized for exactly 4 players
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ChallengeCard } from './ChallengeCard';
import { Check, Clock, User, Zap, Crown } from 'lucide-react';
import '../../design-system/index.css';

interface PlayerStatus {
  id: string;
  name: string;
  score: number;
  hasPlayed: boolean;
  isCurrentUser: boolean;
  cSuiteChoice?: string;
  rank?: number;
  avatar?: string;
  selectedRoleCard?: string;
  selectedSpecialCard?: 'golden' | 'mvp' | null;
}

interface GameBoardProps {
  challengeCard?: {
    id: string;
    cardCode: string;
    pCategory: 'people' | 'product' | 'process' | 'place' | 'promotion' | 'price';
    title: string;
    description: string;
    context: string;
    difficultyLevel: 'easy' | 'medium' | 'hard';
    gradeLevel: string;
  };
  players: PlayerStatus[];
  currentRound: number;
  totalRounds: number;
  timeRemaining?: number;
  showTimer?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  challengeCard,
  players,
  currentRound,
  totalRounds,
  timeRemaining,
  showTimer = false
}) => {
  // Get C-Suite icon
  const getCSuiteIcon = (choice?: string) => {
    const icons: Record<string, string> = {
      'ceo': '👔',
      'cfo': '💰',
      'cmo': '📢',
      'cto': '💻',
      'chro': '🤝',
      'coo': '⚙️'
    };
    return choice ? icons[choice] || '🎯' : '🎯';
  };

  // Get C-Suite color
  const getCSuiteColor = (choice?: string): string => {
    const colors: Record<string, string> = {
      'ceo': 'border-purple-500 bg-purple-500/20',
      'cfo': 'border-green-500 bg-green-500/20',
      'cmo': 'border-orange-500 bg-orange-500/20',
      'cto': 'border-blue-500 bg-blue-500/20',
      'chro': 'border-pink-500 bg-pink-500/20',
      'coo': 'border-teal-500 bg-teal-500/20'
    };
    return choice ? colors[choice] || 'border-gray-500 bg-gray-500/20' : 'border-gray-500 bg-gray-500/20';
  };

  // Helper function to render a player card
  const renderPlayerCard = (player: PlayerStatus, cSuiteColor: string) => (
    <motion.div
      className={`
        glass-card p-2 md:p-3 rounded-lg shadow-lg w-[140px] md:w-[160px]
        border-2 ${cSuiteColor}
        ${player.isCurrentUser ? 'ring-2 md:ring-3 ring-yellow-400 ring-offset-1' : ''}
        ${player.hasPlayed ? 'bg-green-500/10' : ''}
        ${!player.hasPlayed ? 'ring-4 ring-blue-400 ring-offset-2 shadow-[0_0_30px_rgba(59,130,246,0.6)] animate-pulse' : ''}
      `}
      whileHover={{ scale: 1.05 }}
      animate={!player.hasPlayed ? {
        boxShadow: [
          '0 0 20px rgba(59, 130, 246, 0.4)',
          '0 0 40px rgba(59, 130, 246, 0.8)',
          '0 0 20px rgba(59, 130, 246, 0.4)',
        ],
      } : {}}
      transition={{
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      {/* Player Header */}
      <div className="flex items-center gap-1.5 mb-1.5">
        {/* Avatar */}
        <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-base md:text-lg border-2 ${cSuiteColor}`}>
          {player.avatar || <User className="w-4 h-4 md:w-5 md:h-5 glass-text-muted" />}
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-0.5">
            <p className="glass-text-primary font-bold text-xs md:text-sm truncate">
              {player.name}
            </p>
            {player.isCurrentUser && (
              <span className="text-[9px] md:text-[10px] bg-yellow-400 text-black px-1 py-0.5 rounded font-bold">
                YOU
              </span>
            )}
            {player.rank === 1 && (
              <Crown className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" fill="currentColor" />
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <span className="text-sm md:text-base">{getCSuiteIcon(player.cSuiteChoice)}</span>
            <span className="glass-text-tertiary text-[9px] md:text-[10px]">
              {player.cSuiteChoice?.toUpperCase() || 'NONE'}
            </span>
          </div>
        </div>
      </div>

      {/* Score Display */}
      <div className="glass-subtle rounded p-1.5 mb-1.5">
        <div className="flex items-center justify-between">
          <span className="glass-text-secondary text-[9px] md:text-[10px]">Score</span>
          <div className="flex items-center gap-0.5">
            <Zap className="w-3 h-3 md:w-3.5 md:h-3.5 glass-icon-accent" />
            <span className="glass-text-primary font-bold text-sm md:text-base">
              {player.score}
            </span>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex flex-col items-center gap-1">
        {player.hasPlayed ? (
          <>
            <div className="flex items-center gap-1 text-green-500 font-semibold text-[10px] md:text-xs">
              <Check className="w-3 h-3 md:w-4 md:h-4" />
              <span>Locked!</span>
            </div>
            {/* Show what they selected */}
            {player.selectedSpecialCard === 'golden' && (
              <div className="glass-subtle rounded px-1 py-0.5 text-[9px]">
                <span className="mr-0.5">⭐</span>
                <span className="glass-text-primary font-semibold">Golden</span>
              </div>
            )}
            {player.selectedSpecialCard === 'mvp' && (
              <div className="glass-subtle rounded px-1 py-0.5 text-[9px]">
                <span className="mr-0.5">🏆</span>
                <span className="glass-text-primary font-semibold">MVP</span>
              </div>
            )}
            {player.selectedRoleCard && (
              <div className="glass-subtle rounded px-1 py-0.5 text-[9px] text-center max-w-[110px]">
                <span className="glass-text-primary font-semibold line-clamp-1">{player.selectedRoleCard}</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 animate-pulse">
            <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-blue-500 flex items-center justify-center">
              <Clock className="w-3 h-3 md:w-4 md:h-4 text-white animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            <div className="text-blue-500 font-bold text-[10px] md:text-xs">
              Selecting...
            </div>
          </div>
        )}
      </div>

      {/* Rank Badge (if available) */}
      {player.rank && (
        <div className="absolute -top-1.5 -right-1.5">
          <div className={`
            w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center font-bold text-[10px] md:text-xs shadow-lg
            ${player.rank === 1 ? 'bg-yellow-400 text-black' : ''}
            ${player.rank === 2 ? 'bg-gray-300 text-black' : ''}
            ${player.rank === 3 ? 'bg-orange-400 text-black' : ''}
            ${player.rank > 3 ? 'bg-gray-600 text-white' : ''}
          `}>
            #{player.rank}
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="relative w-full h-full min-h-[700px] md:min-h-[800px] flex items-center justify-center p-4 md:p-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent" />
      </div>

      {/* Game Board Grid Container - 3x3 grid for cardinal positioning */}
      <div className="relative w-full max-w-5xl md:max-w-6xl mx-auto">
        {/* Status Summary (Top Left for better visibility) */}
        <div className="absolute top-2 md:top-4 left-2 md:left-4 glass-card p-2 md:p-3 rounded-lg shadow-lg z-30">
          <div className="text-[10px] md:text-xs glass-text-tertiary mb-0.5 md:mb-1 font-medium">Players Ready</div>
          <div className="text-xl md:text-2xl font-bold glass-text-primary">
            {players.filter(p => p.hasPlayed).length} / {players.length}
          </div>
        </div>

        <div className="grid grid-cols-3 grid-rows-3 gap-6 md:gap-12 items-center justify-items-center" style={{ minHeight: '600px' }}>

          {/* Row 1 Column 2: Top Player */}
          <div className="col-start-2 col-span-1 row-start-1 row-span-1 flex items-end justify-center">
            {players[0] && (() => {
              const player = players[0];
              const cSuiteColor = getCSuiteColor(player.cSuiteChoice);
              return (
                <motion.div
                  key={player.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0 * 0.1 }}
                  className="z-10"
                >
                  {renderPlayerCard(player, cSuiteColor)}
                </motion.div>
              );
            })()}
          </div>

          {/* Row 2 Column 1: Left Player */}
          <div className="col-start-1 col-span-1 row-start-2 row-span-1 flex items-center justify-end">
            {players[3] && (() => {
              const player = players[3];
              const cSuiteColor = getCSuiteColor(player.cSuiteChoice);
              return (
                <motion.div
                  key={player.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 3 * 0.1 }}
                  className="z-10"
                >
                  {renderPlayerCard(player, cSuiteColor)}
                </motion.div>
              );
            })()}
          </div>

          {/* Row 2 Column 2: Center Circular Timer */}
          <div className="col-start-2 col-span-1 row-start-2 row-span-1 flex items-center justify-center relative z-20">
            <div className="relative">
              {/* Circular Timer */}
              <motion.div
                className="relative w-40 h-40 md:w-48 md:h-48"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Outer Glow Ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-xl" />

                {/* Main Circle */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="8"
                  />

                  {/* Animated Progress Circle */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={timeRemaining !== undefined ? (2 * Math.PI * 45) * (1 - timeRemaining / 60) : 0}
                    style={{
                      transition: 'stroke-dashoffset 1s linear'
                    }}
                  />

                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={timeRemaining && timeRemaining <= 10 ? "#ef4444" : "#3b82f6"} />
                      <stop offset="100%" stopColor={timeRemaining && timeRemaining <= 10 ? "#dc2626" : "#8b5cf6"} />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Timer Display */}
                  {showTimer && timeRemaining !== undefined && (
                    <motion.div
                      className={`flex flex-col items-center ${timeRemaining <= 10 ? 'animate-pulse' : ''}`}
                      key={timeRemaining}
                      initial={{ scale: 1.2, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Clock className={`w-8 h-8 md:w-10 md:h-10 mb-2 ${timeRemaining <= 10 ? 'text-red-500' : 'glass-icon-accent'}`} />
                      <span className={`text-4xl md:text-5xl font-bold ${timeRemaining <= 10 ? 'text-red-500' : 'glass-text-primary'}`}>
                        {timeRemaining}
                      </span>
                      <span className="glass-text-secondary text-xs md:text-sm mt-1">seconds</span>
                    </motion.div>
                  )}

                  {/* Round Info */}
                  {!showTimer && (
                    <div className="text-center">
                      <div className="glass-text-primary font-bold text-2xl md:text-3xl mb-1">
                        Round {currentRound}
                      </div>
                      <div className="glass-text-secondary text-sm md:text-base">
                        of {totalRounds}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Row 2 Column 3: Right Player */}
          <div className="col-start-3 col-span-1 row-start-2 row-span-1 flex items-center justify-start">
            {players[1] && (() => {
              const player = players[1];
              const cSuiteColor = getCSuiteColor(player.cSuiteChoice);
              return (
                <motion.div
                  key={player.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1 * 0.1 }}
                  className="z-10"
                >
                  {renderPlayerCard(player, cSuiteColor)}
                </motion.div>
              );
            })()}
          </div>

          {/* Row 3 Column 2: Bottom Player */}
          <div className="col-start-2 col-span-1 row-start-3 row-span-1 flex items-start justify-center">
            {players[2] && (() => {
              const player = players[2];
              const cSuiteColor = getCSuiteColor(player.cSuiteChoice);
              return (
                <motion.div
                  key={player.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 2 * 0.1 }}
                  className="z-10"
                >
                  {renderPlayerCard(player, cSuiteColor)}
                </motion.div>
              );
            })()}
          </div>

        </div>
      </div>
    </div>
  );
};

// Compact version for mobile or smaller screens
export const GameBoardCompact: React.FC<GameBoardProps> = ({
  challengeCard,
  players,
  currentRound,
  totalRounds
}) => {
  const currentUser = players.find(p => p.isCurrentUser);

  return (
    <div className="space-y-4">
      {/* Round Info */}
      <div className="glass-card p-3 rounded-lg text-center">
        <div className="glass-text-primary font-bold text-lg">
          Round {currentRound} / {totalRounds}
        </div>
      </div>

      {/* Challenge Card */}
      <div className="flex justify-center">
        <ChallengeCard
          cardData={challengeCard}
          size="medium"
          showContext={false}
        />
      </div>

      {/* Current User Status */}
      {currentUser && (
        <div className="glass-game p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="glass-text-secondary text-sm">Your Score</div>
              <div className="glass-text-primary font-bold text-2xl">{currentUser.score}</div>
            </div>
            <div>
              {currentUser.hasPlayed ? (
                <div className="flex items-center gap-2 text-green-500 font-semibold">
                  <Check className="w-6 h-6" />
                  <span>Locked In!</span>
                </div>
              ) : (
                <div className="glass-text-tertiary italic">Selecting...</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Other Players List */}
      <div className="glass-card p-3 rounded-lg">
        <div className="glass-text-secondary text-sm mb-2">Other Players</div>
        <div className="space-y-2">
          {players.filter(p => !p.isCurrentUser).map(player => (
            <div
              key={player.id}
              className="glass-subtle p-2 rounded flex justify-between items-center"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{getCSuiteIcon(player.cSuiteChoice)}</span>
                <span className="glass-text-primary font-medium text-sm">{player.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="glass-text-primary font-bold">{player.score}</span>
                {player.hasPlayed && <Check className="w-5 h-5 text-green-500" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function for other components
const getCSuiteIcon = (choice?: string) => {
  const icons: Record<string, string> = {
    'ceo': '👔',
    'cfo': '💰',
    'cmo': '📢',
    'cto': '💻',
    'chro': '🤝',
    'coo': '⚙️'
  };
  return choice ? icons[choice] || '🎯' : '🎯';
};

export default GameBoard;
