/**
 * Player Status Bar Component
 * Displays live status of all participants in a Discovered Live! multiplayer game
 *
 * Features:
 * - Shows all players (human + AI) in the current game
 * - Real-time status updates (answered, correct, incorrect, waiting)
 * - Displays current XP, bingos won, and streak for each player
 * - Highlights current user
 * - Shows bingo slots remaining
 * - Animated status indicators
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, Zap, Target, Crown, Check, X, Clock, Bot } from 'lucide-react';
import type {
  SessionParticipant,
  ParticipantStatus,
} from '../../types/DiscoveredLiveMultiplayerTypes';

export interface PlayerStatusBarProps {
  participants: SessionParticipant[];
  participantStatuses: ParticipantStatus[];
  currentParticipantId: string;
  bingoSlotsRemaining: number;
  bingoSlotsTotal: number;
}

/**
 * PlayerStatusBar Component
 */
export const PlayerStatusBar: React.FC<PlayerStatusBarProps> = ({
  participants,
  participantStatuses,
  currentParticipantId,
  bingoSlotsRemaining,
  bingoSlotsTotal,
}) => {
  /**
   * Get status for a participant
   */
  const getParticipantStatus = (participantId: string): ParticipantStatus | undefined => {
    return participantStatuses.find(s => s.participantId === participantId);
  };

  /**
   * Get rank position based on XP
   */
  const getRankPosition = (participantId: string): number => {
    const sorted = [...participants].sort((a, b) => b.totalXp - a.totalXp);
    return sorted.findIndex(p => p.id === participantId) + 1;
  };

  /**
   * Get status indicator
   */
  const getStatusIndicator = (status?: ParticipantStatus) => {
    if (!status) {
      return { icon: Clock, color: 'gray', label: 'Waiting' };
    }

    if (status.hasAnswered && status.isCorrect) {
      return { icon: Check, color: 'green', label: 'Correct!' };
    }

    if (status.hasAnswered && !status.isCorrect) {
      return { icon: X, color: 'red', label: 'Incorrect' };
    }

    return { icon: Clock, color: 'yellow', label: 'Thinking...' };
  };

  return (
    <div className="w-full">
      {/* Bingo Slots Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-xl p-4 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-white drop-shadow-lg" />
            <div>
              <p className="text-white text-sm font-bold uppercase tracking-wide">
                Bingo Slots
              </p>
              <p className="text-white/90 text-xs">
                {bingoSlotsRemaining} of {bingoSlotsTotal} remaining
              </p>
            </div>
          </div>

          {/* Visual Slots Indicator */}
          <div className="flex gap-2">
            {[...Array(bingoSlotsTotal)].map((_, i) => {
              const isFilled = i >= bingoSlotsRemaining;
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center border-2
                    ${isFilled
                      ? 'bg-yellow-300 border-yellow-500'
                      : 'bg-white/30 border-white/50'
                    }
                  `}
                >
                  {isFilled ? (
                    <Trophy className="w-5 h-5 text-yellow-700" />
                  ) : (
                    <span className="text-white font-bold text-sm">{i + 1}</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Players Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AnimatePresence>
          {participants.map((participant, index) => {
            const status = getParticipantStatus(participant.id);
            const statusInfo = getStatusIndicator(status);
            const isCurrentUser = participant.id === currentParticipantId;
            const rank = getRankPosition(participant.id);
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative rounded-xl p-4 shadow-lg border-2 transition-all
                  ${isCurrentUser
                    ? 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 border-purple-500 ring-4 ring-purple-300 dark:ring-purple-700'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }
                `}
              >
                {/* Current User Badge */}
                {isCurrentUser && (
                  <div className="absolute -top-2 -right-2 bg-purple-600 text-white rounded-full px-3 py-1 text-xs font-bold shadow-lg z-10">
                    YOU
                  </div>
                )}

                {/* Rank Badge */}
                {rank === 1 && participant.totalXp > 0 && (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-2 -left-2 bg-yellow-400 rounded-full p-2 shadow-lg z-10"
                  >
                    <Crown className="w-4 h-4 text-yellow-900" />
                  </motion.div>
                )}

                {/* Player Info */}
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar/Icon */}
                  <div className={`
                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                    ${participant.participantType === 'ai_agent'
                      ? 'bg-gradient-to-br from-blue-400 to-cyan-400'
                      : 'bg-gradient-to-br from-purple-400 to-pink-400'
                    }
                  `}>
                    {participant.participantType === 'ai_agent' ? (
                      <Bot className="w-6 h-6 text-white" />
                    ) : (
                      <Users className="w-6 h-6 text-white" />
                    )}
                  </div>

                  {/* Name and Status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <p className={`text-sm font-bold truncate ${
                        isCurrentUser
                          ? 'text-purple-900 dark:text-purple-100'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {participant.displayName}
                      </p>
                      {participant.participantType === 'ai_agent' && (
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold uppercase">
                          Bot
                        </span>
                      )}
                    </div>

                    {/* Rank */}
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                      Rank #{rank}
                    </p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {/* XP */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Zap className="w-3 h-3 text-yellow-500" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">XP</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {participant.totalXp}
                    </p>
                  </div>

                  {/* Bingos */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Trophy className="w-3 h-3 text-yellow-500" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Bingos</p>
                    </div>
                    <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                      {participant.bingosWon}
                    </p>
                  </div>

                  {/* Streak */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target className="w-3 h-3 text-orange-500" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Streak</p>
                    </div>
                    <p className={`text-lg font-bold ${
                      participant.currentStreak >= 3
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {participant.currentStreak}
                    </p>
                  </div>
                </div>

                {/* Current Status Indicator */}
                <div className={`
                  flex items-center justify-center gap-2 py-2 rounded-lg
                  ${statusInfo.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                  ${statusInfo.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' : ''}
                  ${statusInfo.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 animate-pulse' : ''}
                  ${statusInfo.color === 'gray' ? 'bg-gray-100 dark:bg-gray-700' : ''}
                `}>
                  <StatusIcon className={`
                    w-4 h-4
                    ${statusInfo.color === 'green' ? 'text-green-600 dark:text-green-400' : ''}
                    ${statusInfo.color === 'red' ? 'text-red-600 dark:text-red-400' : ''}
                    ${statusInfo.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' : ''}
                    ${statusInfo.color === 'gray' ? 'text-gray-600 dark:text-gray-400' : ''}
                  `} />
                  <p className={`
                    text-xs font-bold
                    ${statusInfo.color === 'green' ? 'text-green-700 dark:text-green-300' : ''}
                    ${statusInfo.color === 'red' ? 'text-red-700 dark:text-red-300' : ''}
                    ${statusInfo.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-300' : ''}
                    ${statusInfo.color === 'gray' ? 'text-gray-700 dark:text-gray-300' : ''}
                  `}>
                    {statusInfo.label}
                  </p>
                  {status?.responseTime && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      {status.responseTime.toFixed(1)}s
                    </span>
                  )}
                </div>

                {/* Accuracy Badge */}
                {participant.correctAnswers + participant.incorrectAnswers > 0 && (
                  <div className="mt-2 text-center">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">
                      Accuracy: {Math.round((participant.correctAnswers / (participant.correctAnswers + participant.incorrectAnswers)) * 100)}%
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlayerStatusBar;
