/**
 * Multiplayer Card Component
 * Displays the player's unique 5×5 bingo grid for Discovered Live! multiplayer games
 *
 * Features:
 * - Shows 5×5 grid of careers with icons
 * - Displays current question in center square (2,2)
 * - Click handling for player answers
 * - Visual feedback: correct (green glow + confetti), incorrect (red shake), unlocked (green border)
 * - Bingo line highlighting (gold border)
 * - Disabled state during question transitions
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, Trophy } from 'lucide-react';
import type {
  BingoGrid,
  GridPosition,
  CompletedLines,
  CurrentQuestion
} from '../../types/DiscoveredLiveMultiplayerTypes';
import { careerContentService } from '../../services/careerContentService';

export interface MultiplayerCardProps {
  myCard: BingoGrid;
  unlockedSquares: GridPosition[];
  completedLines: CompletedLines;
  currentQuestion: CurrentQuestion | null;
  onSquareClick: (row: number, col: number) => void;
  disabled: boolean;
  timeRemaining: number;
  gradeLevel?: string;
}

interface SquareFeedback {
  row: number;
  col: number;
  type: 'correct' | 'incorrect';
  timestamp: number;
}

/**
 * MultiplayerCard Component
 */
export const MultiplayerCard: React.FC<MultiplayerCardProps> = ({
  myCard,
  unlockedSquares,
  completedLines,
  currentQuestion,
  onSquareClick,
  disabled,
  timeRemaining,
  gradeLevel = '5',
}) => {
  const [feedback, setFeedback] = useState<SquareFeedback | null>(null);
  const [confetti, setConfetti] = useState<GridPosition | null>(null);

  // Clear feedback after animation
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Clear confetti after animation
  useEffect(() => {
    if (confetti) {
      const timer = setTimeout(() => setConfetti(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [confetti]);

  /**
   * Check if square is unlocked
   */
  const isUnlocked = (row: number, col: number): boolean => {
    return unlockedSquares.some(sq => sq.row === row && sq.col === col);
  };

  /**
   * Check if square is in a completed line
   */
  const isInCompletedLine = (row: number, col: number): boolean => {
    // Check rows
    if (completedLines.rows.includes(row)) return true;

    // Check columns
    if (completedLines.columns.includes(col)) return true;

    // Check diagonals
    // Diagonal 0: top-left to bottom-right (0,0) (1,1) (2,2) (3,3) (4,4)
    if (completedLines.diagonals.includes(0) && row === col) return true;

    // Diagonal 1: top-right to bottom-left (0,4) (1,3) (2,2) (3,1) (4,0)
    if (completedLines.diagonals.includes(1) && row + col === 4) return true;

    return false;
  };

  /**
   * Check if square is the center (where question displays)
   */
  const isCenterSquare = (row: number, col: number): boolean => {
    return row === 2 && col === 2;
  };

  /**
   * Handle square click
   */
  const handleSquareClick = (row: number, col: number) => {
    if (disabled || !currentQuestion || isCenterSquare(row, col)) return;

    // Don't allow clicking already unlocked squares
    if (isUnlocked(row, col)) return;

    // Trigger click callback
    onSquareClick(row, col);
  };

  /**
   * Trigger feedback animation (called from parent after processing click)
   */
  const showFeedback = (row: number, col: number, isCorrect: boolean) => {
    setFeedback({ row, col, type: isCorrect ? 'correct' : 'incorrect', timestamp: Date.now() });
    if (isCorrect) {
      setConfetti({ row, col });
    }
  };

  // Expose showFeedback via ref or callback prop (parent needs to call this)
  useEffect(() => {
    // Store reference to showFeedback for parent to access
    (window as any).__multiplayerCardFeedback = showFeedback;
    return () => {
      delete (window as any).__multiplayerCardFeedback;
    };
  }, []);

  /**
   * Get career icon and name
   */
  const getCareerDisplay = (careerCode: string): { icon: string; name: string; color: string } => {
    // Map career codes to names (this should come from database, but fallback for now)
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

    // Get career content
    const careerData = careerContentService.getEnrichedCareerData(careerName, gradeLevel);

    return {
      icon: careerData?.icon || '💼',
      name: careerName,
      color: careerData?.color || '#6B7280',
    };
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Header Stats Bar */}
      <div className="mb-4 flex items-center justify-between px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-xs text-white/80 font-medium">Your Card</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-xs text-white/80">Unlocked</p>
            <p className="text-lg font-bold text-white">{unlockedSquares.length}/25</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <p className="text-xs text-white/80">Bingos</p>
            <p className="text-lg font-bold text-yellow-300">
              {completedLines.rows.length + completedLines.columns.length + completedLines.diagonals.length}
            </p>
          </div>
        </div>
        {currentQuestion && (
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
            <p className="text-white font-bold text-lg">Question {currentQuestion.questionNumber}</p>
          </div>
        )}
      </div>

      {/* Grid Container - Inspired by vibrant bingo card designs */}
      <div className="grid grid-cols-5 gap-3 p-6 bg-gradient-to-br from-white via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 backdrop-blur-sm rounded-b-2xl rounded-t-none shadow-2xl border-4 border-purple-300 dark:border-purple-700 relative overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500 rounded-full blur-3xl" />
        </div>

        {myCard.careers.map((row, rowIndex) =>
          row.map((careerCode, colIndex) => {
            const unlocked = isUnlocked(rowIndex, colIndex);
            const inCompletedLine = isInCompletedLine(rowIndex, colIndex);
            const isCenter = isCenterSquare(rowIndex, colIndex);
            const isFeedbackSquare = feedback?.row === rowIndex && feedback?.col === colIndex;
            const isConfettiSquare = confetti?.row === rowIndex && confetti?.col === colIndex;

            const career = getCareerDisplay(careerCode);

            return (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                whileHover={!disabled && !isCenter && !unlocked ? { scale: 1.08 } : {}}
                whileTap={!disabled && !isCenter && !unlocked ? { scale: 0.92 } : {}}
                animate={
                  isFeedbackSquare && feedback?.type === 'incorrect'
                    ? {
                        x: [-10, 10, -10, 10, 0],
                        transition: { duration: 0.5 },
                      }
                    : {}
                }
                className="relative aspect-square z-10"
              >
                {/* Center Square - Question Display - Inspired by "GREAT DAUB" style */}
                {isCenter ? (
                  <motion.div
                    animate={{ scale: currentQuestion ? [1, 1.05, 1] : 1 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-full h-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-xl flex flex-col items-center justify-center p-3 shadow-2xl border-4 border-yellow-300 relative overflow-hidden"
                  >
                    {/* Pulsing glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent animate-pulse" />

                    <Sparkles className="w-8 h-8 text-white mb-1 relative z-10 drop-shadow-lg" />
                    <p className="text-white text-[10px] font-black text-center relative z-10 drop-shadow-md uppercase tracking-wide">
                      Question
                    </p>
                    {currentQuestion && (
                      <div className="mt-1 bg-white/30 backdrop-blur-sm rounded-full px-3 py-1 relative z-10">
                        <p className="text-white font-black text-sm drop-shadow-md">
                          #{currentQuestion.questionNumber}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* Regular Career Square - Inspired by numbered ball/dauber style */
                  <button
                    onClick={() => handleSquareClick(rowIndex, colIndex)}
                    disabled={disabled || unlocked || !currentQuestion}
                    className={`
                      w-full h-full rounded-xl flex flex-col items-center justify-center p-3
                      transition-all duration-300 relative overflow-hidden
                      shadow-lg hover:shadow-xl
                      ${unlocked
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-4 border-green-300 cursor-default transform scale-105'
                        : 'bg-white dark:bg-gray-800 border-3 border-gray-300 dark:border-gray-600'
                      }
                      ${!disabled && !unlocked && currentQuestion
                        ? 'hover:bg-gradient-to-br hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/40 dark:hover:to-pink-900/40 hover:border-purple-400 cursor-pointer hover:-translate-y-1'
                        : 'cursor-not-allowed opacity-60'
                      }
                      ${inCompletedLine && unlocked
                        ? 'ring-4 ring-yellow-400 dark:ring-yellow-500 shadow-2xl shadow-yellow-400/60 animate-pulse'
                        : ''
                      }
                      ${isFeedbackSquare && feedback?.type === 'correct'
                        ? 'ring-4 ring-green-500 shadow-2xl shadow-green-500/60'
                        : ''
                      }
                      ${isFeedbackSquare && feedback?.type === 'incorrect'
                        ? 'ring-4 ring-red-500 shadow-2xl shadow-red-500/60'
                        : ''
                      }
                    `}
                  >
                    {/* Career Icon */}
                    <div className={`text-3xl mb-1 relative z-10 transition-transform ${unlocked ? 'scale-110' : ''}`}>
                      {career.icon}
                    </div>

                    {/* Career Name */}
                    <p className={`text-[10px] font-bold text-center leading-tight relative z-10 ${
                      unlocked
                        ? 'text-white drop-shadow-md'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {career.name}
                    </p>

                    {/* Dauber/Star Overlay for Unlocked - Inspired by skills-based bingo style */}
                    {unlocked && (
                      <>
                        {/* Large Star Dauber Effect */}
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          {/* Glowing background circle */}
                          <div className="absolute w-16 h-16 bg-yellow-300 rounded-full blur-md opacity-50" />

                          {/* Star shape */}
                          <svg
                            className="w-20 h-20 text-yellow-400 drop-shadow-2xl"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>

                          {/* Checkmark in center of star */}
                          <div className="absolute">
                            <Check className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={4} />
                          </div>
                        </motion.div>

                        {/* Shine effect */}
                        <motion.div
                          initial={{ x: '-100%' }}
                          animate={{ x: '200%' }}
                          transition={{ duration: 1.5, delay: 0.2 }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
                        />
                      </>
                    )}

                    {/* Incorrect Indicator */}
                    {isFeedbackSquare && feedback?.type === 'incorrect' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center bg-red-500/20"
                      >
                        <X className="w-12 h-12 text-red-600 dark:text-red-400" />
                      </motion.div>
                    )}

                    {/* Bingo Trophy */}
                    {inCompletedLine && unlocked && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="absolute bottom-1 right-1 bg-yellow-400 rounded-full p-1"
                      >
                        <Trophy className="w-3 h-3 text-yellow-900" />
                      </motion.div>
                    )}

                    {/* Confetti Animation */}
                    <AnimatePresence>
                      {isConfettiSquare && (
                        <motion.div
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 2 }}
                          className="absolute inset-0 pointer-events-none"
                        >
                          {[...Array(20)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{
                                x: '50%',
                                y: '50%',
                                scale: 1,
                                opacity: 1,
                              }}
                              animate={{
                                x: `${50 + (Math.random() - 0.5) * 200}%`,
                                y: `${50 + (Math.random() - 0.5) * 200}%`,
                                scale: 0,
                                opacity: 0,
                              }}
                              transition={{
                                duration: 1 + Math.random(),
                                ease: 'easeOut',
                              }}
                              className="absolute w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'][i % 5],
                              }}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Question Display Below Grid - Inspired by vibrant multiplayer displays */}
      {currentQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="mt-6 relative"
        >
          {/* Glowing background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-2xl blur-xl opacity-30 animate-pulse" />

          <div className="relative p-6 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl shadow-2xl border-4 border-white/30">
            <div className="flex items-start gap-4">
              {/* Question Number Badge */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex-shrink-0 bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl border-4 border-yellow-300"
              >
                <div className="text-center">
                  <p className="text-[10px] font-bold text-purple-600 uppercase">Q</p>
                  <p className="text-xl font-black text-purple-600 leading-none">
                    {currentQuestion.questionNumber}
                  </p>
                </div>
              </motion.div>

              {/* Question Text */}
              <div className="flex-1">
                <p className="text-xl font-black text-white mb-3 drop-shadow-lg leading-tight">
                  {currentQuestion.clue.clueText}
                </p>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 w-fit">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <p className="text-sm font-bold text-white">
                    {currentQuestion.clue.skillConnection}
                  </p>
                </div>
              </div>

              {/* Timer Display */}
              <div className="flex-shrink-0">
                <motion.div
                  animate={
                    timeRemaining <= 2
                      ? { scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }
                      : {}
                  }
                  transition={{ duration: 0.5, repeat: timeRemaining <= 2 ? Infinity : 0 }}
                  className={`
                    relative text-4xl font-black rounded-2xl px-5 py-3 shadow-2xl border-4
                    ${timeRemaining > 5
                      ? 'bg-green-500 text-white border-green-300'
                      : ''
                    }
                    ${timeRemaining <= 5 && timeRemaining > 2
                      ? 'bg-yellow-500 text-white border-yellow-300'
                      : ''
                    }
                    ${timeRemaining <= 2
                      ? 'bg-red-500 text-white border-red-300'
                      : ''
                    }
                  `}
                >
                  {/* Timer glow */}
                  {timeRemaining <= 2 && (
                    <div className="absolute inset-0 bg-red-400 rounded-2xl blur-lg animate-pulse -z-10" />
                  )}

                  <div className="text-center">
                    <p className="text-sm font-bold opacity-80">TIME</p>
                    <p className="text-5xl leading-none">{timeRemaining}</p>
                    <p className="text-xs font-bold opacity-80">SEC</p>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Progress indicator */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: currentQuestion.clue.difficulty === 'easy' ? 10 : currentQuestion.clue.difficulty === 'medium' ? 15 : 20, ease: 'linear' }}
              className="absolute bottom-0 left-0 right-0 h-2 bg-white/50 rounded-b-2xl origin-left"
            />
          </div>
        </motion.div>
      )}

      {/* Waiting for Question */}
      {!currentQuestion && !disabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-center"
        >
          <p className="text-gray-600 dark:text-gray-400">
            Waiting for next question...
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default MultiplayerCard;
