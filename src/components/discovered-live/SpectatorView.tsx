/**
 * Spectator View Component
 * Allows users to watch ongoing games before joining the next one
 *
 * Features:
 * - Watch all players' cards simultaneously
 * - Live leaderboard updates
 * - Current question display
 * - "Join Next Game" toggle
 * - Time until next game countdown
 * - Seamless transition from spectator to player
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Trophy,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  Zap,
  Target,
  Crown,
  Bot,
  UserPlus,
  UserX,
} from 'lucide-react';
import type {
  RoomState,
  SessionParticipant,
  CurrentQuestion,
  GridPosition,
  CompletedLines,
} from '../../types/DiscoveredLiveMultiplayerTypes';
import { careerContentService } from '../../services/careerContentService';

export interface SpectatorViewProps {
  roomState: RoomState;
  studentId: string;
  onLeaveRoom: () => void;
  onToggleJoinNext?: (willJoin: boolean) => void;
  willJoinNextGame?: boolean;
}

/**
 * SpectatorView Component
 */
export const SpectatorView: React.FC<SpectatorViewProps> = ({
  roomState,
  studentId,
  onLeaveRoom,
  onToggleJoinNext,
  willJoinNextGame = false,
}) => {
  const [timeUntilNextGame, setTimeUntilNextGame] = useState<number>(0);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);

  // Calculate time until next game
  useEffect(() => {
    if (!roomState.room.nextGameStartsAt) return;

    const updateCountdown = () => {
      const now = new Date();
      const nextGame = new Date(roomState.room.nextGameStartsAt!);
      const seconds = Math.max(0, Math.floor((nextGame.getTime() - now.getTime()) / 1000));
      setTimeUntilNextGame(seconds);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [roomState.room.nextGameStartsAt]);

  // Auto-select first participant if none selected
  useEffect(() => {
    if (!selectedParticipant && roomState.participants.length > 0) {
      setSelectedParticipant(roomState.participants[0].id);
    }
  }, [selectedParticipant, roomState.participants]);

  /**
   * Get career display info
   */
  const getCareerDisplay = (careerCode: string): { icon: string; name: string } => {
    const careerNames: Record<string, string> = {
      'game-tester': 'Game Tester',
      'programmer': 'Programmer',
      'web-designer': 'Web Designer',
      'nurse': 'Nurse',
      'doctor': 'Doctor',
      'paramedic': 'Paramedic',
      'teacher': 'Teacher',
      'principal': 'Principal',
      'librarian': 'Librarian',
      'chef': 'Chef',
      'baker': 'Baker',
      'restaurant-owner': 'Restaurant Owner',
      'artist': 'Artist',
      'musician': 'Musician',
      'dancer': 'Dancer',
      'athlete': 'Athlete',
      'coach': 'Coach',
      'referee': 'Referee',
      'scientist': 'Scientist',
      'engineer': 'Engineer',
      'researcher': 'Researcher',
      'veterinarian': 'Veterinarian',
      'zoologist': 'Zoologist',
      'marine-biologist': 'Marine Biologist',
      'pilot': 'Pilot',
      'astronaut': 'Astronaut',
      'air-traffic-controller': 'Air Traffic Controller',
    };

    const careerName = careerNames[careerCode] || careerCode
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const careerData = careerContentService.getEnrichedCareerData(careerName, roomState.room.gradeLevel);

    return {
      icon: careerData?.icon || '💼',
      name: careerName,
    };
  };

  /**
   * Check if square is unlocked
   */
  const isUnlocked = (participant: SessionParticipant, row: number, col: number): boolean => {
    return participant.unlockedSquares.some(sq => sq.row === row && sq.col === col);
  };

  /**
   * Check if square is in completed line
   */
  const isInCompletedLine = (
    completedLines: CompletedLines,
    row: number,
    col: number
  ): boolean => {
    if (completedLines.rows.includes(row)) return true;
    if (completedLines.columns.includes(col)) return true;
    if (completedLines.diagonals.includes(0) && row === col) return true;
    if (completedLines.diagonals.includes(1) && row + col === 4) return true;
    return false;
  };

  /**
   * Get leaderboard sorted by XP
   */
  const getLeaderboard = () => {
    return [...roomState.participants].sort((a, b) => b.totalXp - a.totalXp);
  };

  const selectedParticipantData = roomState.participants.find(p => p.id === selectedParticipant);
  const leaderboard = getLeaderboard();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            {/* Room Info */}
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-white text-sm font-medium uppercase tracking-wide">
                  Spectating
                </p>
                <p className="text-white text-2xl font-black">
                  {roomState.room.roomName}
                </p>
                <p className="text-white/80 text-sm">
                  {roomState.participants.length} players in game
                </p>
              </div>
            </div>

            {/* Join Next Game Toggle */}
            <div className="flex items-center gap-4">
              {roomState.room.status === 'active' && roomState.currentSession && (
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                  <p className="text-white text-xs font-medium mb-1">Game in Progress</p>
                  <p className="text-white text-lg font-bold">
                    Question {roomState.currentSession.currentQuestionNumber} / {roomState.currentSession.totalQuestions}
                  </p>
                </div>
              )}

              {roomState.room.status === 'intermission' && timeUntilNextGame > 0 && (
                <motion.div
                  animate={{ scale: timeUntilNextGame <= 3 ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: timeUntilNextGame <= 3 ? Infinity : 0 }}
                  className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3"
                >
                  <p className="text-white text-xs font-medium mb-1">Next Game Starts In</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-300" />
                    <p className="text-white text-2xl font-black">{timeUntilNextGame}s</p>
                  </div>
                </motion.div>
              )}

              <button
                onClick={() => onToggleJoinNext?.(!willJoinNextGame)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white
                  transition-all duration-300 shadow-lg hover:scale-105
                  ${willJoinNextGame
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-gray-600 hover:bg-gray-700'
                  }
                `}
              >
                {willJoinNextGame ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Joining Next Game</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Join Next Game</span>
                  </>
                )}
              </button>

              <button
                onClick={onLeaveRoom}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-lg hover:scale-105"
              >
                <UserX className="w-5 h-5" />
                <span>Leave Room</span>
              </button>
            </div>
          </div>

          {/* Current Question Display */}
          {roomState.currentQuestion && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t-2 border-white/30"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center shadow-xl">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-purple-600 uppercase">Q</p>
                    <p className="text-xl font-black text-purple-600 leading-none">
                      {roomState.currentQuestion.questionNumber}
                    </p>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-white text-lg font-bold mb-1">
                    {roomState.currentQuestion.clue.clueText}
                  </p>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 w-fit">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <p className="text-white text-sm font-medium">
                      {roomState.currentQuestion.clue.skillConnection}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Leaderboard */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                Live Leaderboard
              </h2>
            </div>

            <div className="space-y-2">
              {leaderboard.map((participant, index) => {
                const rank = index + 1;
                const isSelected = participant.id === selectedParticipant;

                return (
                  <motion.button
                    key={participant.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedParticipant(participant.id)}
                    className={`
                      w-full p-3 rounded-lg border-2 transition-all text-left
                      ${isSelected
                        ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-500'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Badge */}
                      <div className={`
                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm
                        ${rank === 1 ? 'bg-yellow-400 text-yellow-900' : ''}
                        ${rank === 2 ? 'bg-gray-300 text-gray-700' : ''}
                        ${rank === 3 ? 'bg-orange-400 text-orange-900' : ''}
                        ${rank > 3 ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300' : ''}
                      `}>
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {participant.displayName}
                          </p>
                          {/* AI players appear as regular players - no badge shown */}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              {participant.totalXp}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400">
                              {participant.bingosWon}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3 text-orange-500" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              {participant.currentStreak}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Crown for leader */}
                      {rank === 1 && participant.totalXp > 0 && (
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Crown className="w-5 h-5 text-yellow-500" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Bingo Slots Status */}
            {roomState.currentSession && (
              <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Bingo Slots: {roomState.currentSession.bingoSlotsRemaining} / {roomState.currentSession.bingoSlotsTotal} remaining
                </p>
                <div className="flex gap-1">
                  {[...Array(roomState.currentSession.bingoSlotsTotal)].map((_, i) => {
                    const isFilled = i >= roomState.currentSession!.bingoSlotsRemaining;
                    return (
                      <div
                        key={i}
                        className={`
                          flex-1 h-2 rounded-full
                          ${isFilled ? 'bg-yellow-400' : 'bg-gray-200 dark:bg-gray-600'}
                        `}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Selected Player's Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          {selectedParticipantData ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              {/* Player Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${selectedParticipantData.participantType === 'ai_agent'
                      ? 'bg-gradient-to-br from-blue-400 to-cyan-400'
                      : 'bg-gradient-to-br from-purple-400 to-pink-400'
                    }
                  `}>
                    {selectedParticipantData.participantType === 'ai_agent' ? (
                      <Bot className="w-6 h-6 text-white" />
                    ) : (
                      <Users className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-black text-gray-900 dark:text-white">
                        {selectedParticipantData.displayName}
                      </p>
                      {/* AI players appear as regular players - no badge shown */}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Rank #{leaderboard.findIndex(p => p.id === selectedParticipantData.id) + 1} • {selectedParticipantData.unlockedSquares.length}/25 unlocked
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">XP</p>
                    </div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                      {selectedParticipantData.totalXp}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Bingos</p>
                    </div>
                    <p className="text-2xl font-black text-yellow-600 dark:text-yellow-400">
                      {selectedParticipantData.bingosWon}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target className="w-4 h-4 text-orange-500" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Streak</p>
                    </div>
                    <p className="text-2xl font-black text-orange-600 dark:text-orange-400">
                      {selectedParticipantData.currentStreak}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bingo Card Grid */}
              <div className="grid grid-cols-5 gap-2">
                {selectedParticipantData.bingoCard.careers.map((row, rowIndex) =>
                  row.map((careerCode, colIndex) => {
                    const unlocked = isUnlocked(selectedParticipantData, rowIndex, colIndex);
                    const inCompletedLine = isInCompletedLine(
                      selectedParticipantData.completedLines,
                      rowIndex,
                      colIndex
                    );
                    const isCenter = rowIndex === 2 && colIndex === 2;
                    const career = getCareerDisplay(careerCode);

                    return (
                      <motion.div
                        key={`${rowIndex}-${colIndex}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: (rowIndex * 5 + colIndex) * 0.02 }}
                        className={`
                          aspect-square rounded-lg flex flex-col items-center justify-center p-2
                          transition-all duration-300 relative overflow-hidden
                          ${isCenter
                            ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 border-4 border-yellow-300'
                            : unlocked
                              ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-3 border-green-300'
                              : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600'
                          }
                          ${inCompletedLine && unlocked
                            ? 'ring-4 ring-yellow-400 dark:ring-yellow-500 shadow-lg shadow-yellow-400/60'
                            : ''
                          }
                        `}
                      >
                        {isCenter ? (
                          <div className="text-center">
                            <Sparkles className="w-6 h-6 text-white mx-auto mb-1" />
                            <p className="text-white text-[8px] font-black uppercase">
                              Question
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="text-2xl mb-1">{career.icon}</div>
                            <p className={`text-[8px] font-bold text-center leading-tight ${
                              unlocked ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {career.name}
                            </p>

                            {unlocked && (
                              <div className="absolute top-0 right-0 bg-green-500 rounded-full p-1">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                            )}

                            {inCompletedLine && unlocked && (
                              <div className="absolute bottom-0 right-0 bg-yellow-400 rounded-full p-1">
                                <Trophy className="w-2 h-2 text-yellow-900" />
                              </div>
                            )}
                          </>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Player Stats Footer */}
              <div className="mt-6 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Correct</p>
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedParticipantData.correctAnswers}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Incorrect</p>
                    <div className="flex items-center justify-center gap-1">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedParticipantData.incorrectAnswers}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Accuracy</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedParticipantData.correctAnswers + selectedParticipantData.incorrectAnswers > 0
                        ? Math.round(
                            (selectedParticipantData.correctAnswers /
                              (selectedParticipantData.correctAnswers + selectedParticipantData.incorrectAnswers)) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Max Streak</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {selectedParticipantData.maxStreak}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
              <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Select a player from the leaderboard to view their card
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Spectator Count Footer */}
      <div className="max-w-7xl mx-auto mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-gray-500" />
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-bold">{roomState.spectators.length}</span> spectator{roomState.spectators.length !== 1 ? 's' : ''} watching
              </p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {willJoinNextGame
                ? '✓ You will join the next game'
                : 'Toggle "Join Next Game" to participate'}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SpectatorView;
