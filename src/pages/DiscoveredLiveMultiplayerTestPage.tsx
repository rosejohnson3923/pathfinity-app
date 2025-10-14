/**
 * Discovered Live! Multiplayer Test Page
 * Test environment for 1 human vs 3 AI bots scenario
 *
 * Features:
 * - Complete game flow testing
 * - Real-time UI updates
 * - All multiplayer components integrated
 * - Mock game orchestration
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Home, RefreshCw } from 'lucide-react';
import { MultiplayerCard } from '../components/discovered-live/MultiplayerCard';
import { PlayerStatusBar } from '../components/discovered-live/PlayerStatusBar';
import { QuestionTimer } from '../components/discovered-live/QuestionTimer';
import type {
  BingoGrid,
  GridPosition,
  CompletedLines,
  CurrentQuestion,
  SessionParticipant,
  ParticipantStatus,
} from '../types/DiscoveredLiveMultiplayerTypes';
import type { CareerClue } from '../types/DiscoveredLiveTypes';

/**
 * DiscoveredLiveMultiplayerTestPage
 */
const DiscoveredLiveMultiplayerTestPage: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [myCard, setMyCard] = useState<BingoGrid | null>(null);
  const [unlockedSquares, setUnlockedSquares] = useState<GridPosition[]>([]);
  const [completedLines, setCompletedLines] = useState<CompletedLines>({
    rows: [],
    columns: [],
    diagonals: [],
  });
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [participantStatuses, setParticipantStatuses] = useState<ParticipantStatus[]>([]);
  const [bingoSlotsRemaining, setBingoSlotsRemaining] = useState(2);
  const [questionNumber, setQuestionNumber] = useState(0);

  // Mock career codes for testing
  const mockCareers = [
    'game-tester', 'programmer', 'web-designer', 'nurse', 'doctor',
    'paramedic', 'teacher', 'principal', 'librarian', 'chef',
    'baker', 'artist', 'musician', 'dancer', 'athlete',
    'coach', 'scientist', 'engineer', 'veterinarian', 'pilot',
    'astronaut', 'firefighter', 'police-officer', 'lawyer', 'architect',
  ];

  // Mock clues for testing
  const mockClues: Partial<CareerClue>[] = [
    {
      id: '1',
      careerCode: 'game-tester',
      clueText: 'I play video games all day to find bugs and glitches',
      skillConnection: 'Problem-solving and attention to detail',
      difficulty: 'easy',
    },
    {
      id: '2',
      careerCode: 'nurse',
      clueText: 'I help doctors care for patients and give medicine',
      skillConnection: 'Healthcare and compassion',
      difficulty: 'easy',
    },
    {
      id: '3',
      careerCode: 'chef',
      clueText: 'I create delicious meals in a restaurant kitchen',
      skillConnection: 'Creativity and culinary arts',
      difficulty: 'medium',
    },
    {
      id: '4',
      careerCode: 'astronaut',
      clueText: 'I travel to space and conduct scientific experiments',
      skillConnection: 'Science and exploration',
      difficulty: 'hard',
    },
    {
      id: '5',
      careerCode: 'teacher',
      clueText: 'I help students learn new subjects every day',
      skillConnection: 'Education and communication',
      difficulty: 'easy',
    },
  ];

  /**
   * Generate random bingo card
   */
  const generateBingoCard = (): BingoGrid => {
    const shuffled = [...mockCareers].sort(() => Math.random() - 0.5);
    const careers: string[][] = [];

    for (let i = 0; i < 5; i++) {
      careers.push(shuffled.slice(i * 5, (i + 1) * 5));
    }

    return {
      careers,
      userCareerPosition: { row: 2, col: 2 },
    };
  };

  /**
   * Initialize game
   */
  const startGame = () => {
    // Generate player's card
    const playerCard = generateBingoCard();
    setMyCard(playerCard);

    // Create mock participants (1 human + 3 AI bots)
    const mockParticipants: SessionParticipant[] = [
      {
        id: 'player-1',
        gameSessionId: 'session-1',
        perpetualRoomId: 'room-1',
        participantType: 'human',
        studentId: 'student-123',
        displayName: 'You',
        bingoCard: playerCard,
        unlockedSquares: [],
        completedLines: { rows: [], columns: [], diagonals: [] },
        bingosWon: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        totalXp: 0,
        currentStreak: 0,
        maxStreak: 0,
        isActive: true,
        connectionStatus: 'connected',
        joinedAt: new Date().toISOString(),
      },
      {
        id: 'bot-1',
        gameSessionId: 'session-1',
        perpetualRoomId: 'room-1',
        participantType: 'ai_agent',
        displayName: 'QuickBot',
        aiDifficulty: 'easy',
        aiPersonality: 'QuickBot',
        bingoCard: generateBingoCard(),
        unlockedSquares: [],
        completedLines: { rows: [], columns: [], diagonals: [] },
        bingosWon: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        totalXp: 0,
        currentStreak: 0,
        maxStreak: 0,
        isActive: true,
        connectionStatus: 'connected',
        joinedAt: new Date().toISOString(),
      },
      {
        id: 'bot-2',
        gameSessionId: 'session-1',
        perpetualRoomId: 'room-1',
        participantType: 'ai_agent',
        displayName: 'SteadyBot',
        aiDifficulty: 'medium',
        aiPersonality: 'SteadyBot',
        bingoCard: generateBingoCard(),
        unlockedSquares: [],
        completedLines: { rows: [], columns: [], diagonals: [] },
        bingosWon: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        totalXp: 0,
        currentStreak: 0,
        maxStreak: 0,
        isActive: true,
        connectionStatus: 'connected',
        joinedAt: new Date().toISOString(),
      },
      {
        id: 'bot-3',
        gameSessionId: 'session-1',
        perpetualRoomId: 'room-1',
        participantType: 'ai_agent',
        displayName: 'ThinkBot',
        aiDifficulty: 'hard',
        aiPersonality: 'ThinkBot',
        bingoCard: generateBingoCard(),
        unlockedSquares: [],
        completedLines: { rows: [], columns: [], diagonals: [] },
        bingosWon: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        totalXp: 0,
        currentStreak: 0,
        maxStreak: 0,
        isActive: true,
        connectionStatus: 'connected',
        joinedAt: new Date().toISOString(),
      },
    ];

    setParticipants(mockParticipants);
    setGameStarted(true);
    setQuestionNumber(0);
    setUnlockedSquares([]);
    setCompletedLines({ rows: [], columns: [], diagonals: [] });
    setBingoSlotsRemaining(2);

    // Start first question after delay
    setTimeout(() => {
      askNextQuestion();
    }, 2000);
  };

  /**
   * Ask next question
   */
  const askNextQuestion = () => {
    const nextNum = questionNumber + 1;
    setQuestionNumber(nextNum);

    const clue = mockClues[(nextNum - 1) % mockClues.length];
    const newQuestion: CurrentQuestion = {
      questionNumber: nextNum,
      clue: clue as CareerClue,
      correctCareerCode: clue.careerCode!,
      startedAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 10000).toISOString(),
      timeRemainingSeconds: 10,
    };

    setCurrentQuestion(newQuestion);
    setTimeRemaining(10);

    // Reset statuses
    setParticipantStatuses([]);

    // Simulate AI answers after random delays
    simulateAIAnswers(newQuestion);
  };

  /**
   * Simulate AI bot answers
   */
  const simulateAIAnswers = (question: CurrentQuestion) => {
    participants.forEach((p, index) => {
      if (p.participantType === 'ai_agent') {
        const delay = p.aiDifficulty === 'easy' ? 2000 + Math.random() * 2000 :
                       p.aiDifficulty === 'medium' ? 4000 + Math.random() * 2000 :
                       6000 + Math.random() * 2000;

        setTimeout(() => {
          const isCorrect = Math.random() > (p.aiDifficulty === 'easy' ? 0.4 :
                                             p.aiDifficulty === 'medium' ? 0.25 : 0.1);

          setParticipantStatuses(prev => [
            ...prev.filter(s => s.participantId !== p.id),
            {
              participantId: p.id,
              displayName: p.displayName,
              isAI: true,
              hasAnswered: true,
              isCorrect,
              responseTime: delay / 1000,
              currentXp: p.totalXp,
              bingosWon: p.bingosWon,
              currentStreak: p.currentStreak,
              connectionStatus: 'connected',
            },
          ]);

          if (isCorrect) {
            // Update participant stats
            setParticipants(prev =>
              prev.map(part =>
                part.id === p.id
                  ? {
                      ...part,
                      correctAnswers: part.correctAnswers + 1,
                      totalXp: part.totalXp + 10,
                      currentStreak: part.currentStreak + 1,
                    }
                  : part
              )
            );
          }
        }, delay);
      }
    });
  };

  /**
   * Timer countdown
   */
  useEffect(() => {
    if (!currentQuestion || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - move to next question
          setTimeout(() => {
            if (questionNumber < 5) {
              askNextQuestion();
            } else {
              endGame();
            }
          }, 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, timeRemaining]);

  /**
   * Handle player square click
   */
  const handleSquareClick = (row: number, col: number) => {
    if (!myCard || !currentQuestion) return;

    const clickedCareer = myCard.careers[row][col];
    const isCorrect = clickedCareer === currentQuestion.correctCareerCode;

    // Update player status
    setParticipantStatuses(prev => [
      ...prev.filter(s => s.participantId !== 'player-1'),
      {
        participantId: 'player-1',
        displayName: 'You',
        isAI: false,
        hasAnswered: true,
        isCorrect,
        responseTime: 10 - timeRemaining,
        currentXp: participants[0].totalXp,
        bingosWon: participants[0].bingosWon,
        currentStreak: participants[0].currentStreak,
        connectionStatus: 'connected',
      },
    ]);

    if (isCorrect) {
      // Unlock square
      setUnlockedSquares(prev => [...prev, { row, col }]);

      // Update player stats
      setParticipants(prev =>
        prev.map(p =>
          p.id === 'player-1'
            ? {
                ...p,
                correctAnswers: p.correctAnswers + 1,
                totalXp: p.totalXp + 10 + (10 - timeRemaining), // Speed bonus
                currentStreak: p.currentStreak + 1,
                maxStreak: Math.max(p.maxStreak, p.currentStreak + 1),
              }
            : p
        )
      );

      // Check for bingos
      checkForBingos([...unlockedSquares, { row, col }]);

      // Show feedback via global window callback
      if ((window as any).__multiplayerCardFeedback) {
        (window as any).__multiplayerCardFeedback(row, col, true);
      }
    } else {
      // Incorrect - break streak
      setParticipants(prev =>
        prev.map(p =>
          p.id === 'player-1'
            ? {
                ...p,
                incorrectAnswers: p.incorrectAnswers + 1,
                currentStreak: 0,
              }
            : p
        )
      );

      // Show feedback
      if ((window as any).__multiplayerCardFeedback) {
        (window as any).__multiplayerCardFeedback(row, col, false);
      }
    }

    // Move to next question after delay
    setTimeout(() => {
      if (questionNumber < 5) {
        askNextQuestion();
      } else {
        endGame();
      }
    }, 2000);
  };

  /**
   * Check for completed bingos
   */
  const checkForBingos = (squares: GridPosition[]) => {
    const newLines: CompletedLines = { rows: [], columns: [], diagonals: [] };

    // Check rows
    for (let row = 0; row < 5; row++) {
      if (squares.filter(s => s.row === row).length === 5) {
        newLines.rows.push(row);
      }
    }

    // Check columns
    for (let col = 0; col < 5; col++) {
      if (squares.filter(s => s.col === col).length === 5) {
        newLines.columns.push(col);
      }
    }

    // Check diagonals
    const diagonal1 = squares.filter(s => s.row === s.col).length === 5;
    const diagonal2 = squares.filter(s => s.row + s.col === 4).length === 5;

    if (diagonal1) newLines.diagonals.push(0);
    if (diagonal2) newLines.diagonals.push(1);

    setCompletedLines(newLines);

    // Award bingo bonus
    const totalBingos = newLines.rows.length + newLines.columns.length + newLines.diagonals.length;
    if (totalBingos > participants[0].bingosWon) {
      setParticipants(prev =>
        prev.map(p =>
          p.id === 'player-1'
            ? {
                ...p,
                bingosWon: totalBingos,
                totalXp: p.totalXp + 50, // Bingo bonus
              }
            : p
        )
      );
      setBingoSlotsRemaining(prev => Math.max(0, prev - 1));
    }
  };

  /**
   * End game
   */
  const endGame = () => {
    setCurrentQuestion(null);
    setGameStarted(false);
  };

  /**
   * Reset game
   */
  const resetGame = () => {
    setGameStarted(false);
    setMyCard(null);
    setUnlockedSquares([]);
    setCompletedLines({ rows: [], columns: [], diagonals: [] });
    setCurrentQuestion(null);
    setParticipants([]);
    setParticipantStatuses([]);
    setQuestionNumber(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
              Discovered Live! Multiplayer Test
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              1 Human vs 3 AI Bots • Full Game Flow Testing
            </p>
          </div>
          <button
            onClick={() => (window.location.href = '/')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <Home className="w-5 h-5" />
            Home
          </button>
        </div>

        {!gameStarted ? (
          /* Start Screen */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-2xl text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Play?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Test the multiplayer experience with 3 AI opponents of varying difficulties
              </p>

              <button
                onClick={startGame}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-xl hover:from-purple-700 hover:to-pink-700 transition shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <Play className="w-6 h-6" />
                Start Game
              </button>
            </div>
          </motion.div>
        ) : (
          /* Game Screen */
          <div className="space-y-6">
            {/* Player Status Bar */}
            <PlayerStatusBar
              participants={participants}
              participantStatuses={participantStatuses}
              currentParticipantId="player-1"
              bingoSlotsRemaining={bingoSlotsRemaining}
              bingoSlotsTotal={2}
            />

            {/* Main Game Area */}
            <div className="grid lg:grid-cols-[1fr_auto] gap-6">
              {/* Bingo Card */}
              <div>
                {myCard && (
                  <MultiplayerCard
                    myCard={myCard}
                    unlockedSquares={unlockedSquares}
                    completedLines={completedLines}
                    currentQuestion={currentQuestion}
                    onSquareClick={handleSquareClick}
                    disabled={!currentQuestion || timeRemaining === 0}
                    timeRemaining={timeRemaining}
                    gradeLevel="5"
                  />
                )}
              </div>

              {/* Timer Sidebar */}
              {currentQuestion && (
                <div className="flex flex-col items-center gap-4">
                  <QuestionTimer
                    timeRemaining={timeRemaining}
                    totalTime={10}
                    size="large"
                    showProgress={true}
                  />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl font-bold hover:bg-gray-700 transition shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                Reset Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoveredLiveMultiplayerTestPage;
