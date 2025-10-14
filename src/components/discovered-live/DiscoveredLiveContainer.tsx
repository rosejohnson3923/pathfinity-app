/**
 * Discovered Live! - Main Container
 * Orchestrates game flow and manages state between all screens
 *
 * Game Flow:
 * 1. Intro Screen -> Player starts game
 * 2. Question Screen -> Answer clue
 * 3. (Optional) Career Card Screen -> Show progress only when new bingo achieved
 * 4. Repeat 2-3 until all questions answered
 * 5. Results Screen -> Show final stats and celebration
 *
 * State Management:
 * - Current screen
 * - Game data from service
 * - Question data
 * - Career details cache
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { discoveredLiveService } from '../../services/DiscoveredLiveService';
import type {
  DiscoveredLiveGame,
  QuestionData,
  AnswerSubmission,
  GameSummary,
  CareerOption
} from '../../types/DiscoveredLiveTypes';

import DiscoveredLiveIntro from './DiscoveredLiveIntro';
import DiscoveredLiveQuestion from './DiscoveredLiveQuestion';
import DiscoveredLiveBingoGrid from './DiscoveredLiveBingoGrid';
import DiscoveredLiveResults from './DiscoveredLiveResults';

type GameScreen = 'intro' | 'question' | 'bingo-grid' | 'results';

interface DiscoveredLiveContainerProps {
  studentId: string;
  studentName: string;
  journeySummaryId?: string;
  gradeCategory: 'elementary' | 'middle' | 'high';
  userCareerCode?: string;
  onComplete: () => void;
}

export const DiscoveredLiveContainer: React.FC<DiscoveredLiveContainerProps> = ({
  studentId,
  studentName,
  journeySummaryId,
  gradeCategory,
  userCareerCode,
  onComplete
}) => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('intro');
  const [game, setGame] = useState<DiscoveredLiveGame | null>(null);
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [gameSummary, setGameSummary] = useState<GameSummary | null>(null);
  const [careerDetailsCache, setCareerDetailsCache] = useState<Map<string, CareerOption>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize game when component mounts
  useEffect(() => {
    initializeGame();
  }, []);

  /**
   * Initialize a new game
   */
  const initializeGame = async () => {
    setLoading(true);
    setError(null);

    try {
      const newGame = await discoveredLiveService.initializeGame({
        studentId,
        journeySummaryId,
        gradeCategory,
        userCareerCode
      });

      setGame(newGame);
      setCurrentScreen('intro');
    } catch (err) {
      console.error('Failed to initialize game:', err);
      setError('Failed to start game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle start button click from intro screen
   */
  const handleStartGame = async () => {
    if (!game) return;

    setLoading(true);
    try {
      const nextQuestion = await discoveredLiveService.getNextQuestion(game.id);
      if (nextQuestion) {
        setQuestionData(nextQuestion);
        setCurrentScreen('question');
      } else {
        setError('No questions available');
      }
    } catch (err) {
      console.error('Failed to load question:', err);
      setError('Failed to load question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle answer submission from question screen
   */
  const handleAnswerSubmit = async (selectedIndex: number, responseTime: number) => {
    if (!game || !questionData) return;

    setLoading(true);
    try {
      // Submit answer
      const submission: AnswerSubmission = {
        gameId: game.id,
        clueId: questionData.clue.id,
        questionNumber: questionData.questionNumber,
        selectedOptionIndex: selectedIndex,
        responseTimeSeconds: responseTime,
        options: questionData.options // Pass the exact options shown to user
      };

      const result = await discoveredLiveService.submitAnswer(submission);

      // Update game state - fetch latest from DB
      const updatedGame = await discoveredLiveService.getGame(game.id);
      if (updatedGame) {
        console.log('Fetched updated game:', {
          questionIndex: updatedGame.currentQuestionIndex,
          unlockedCount: updatedGame.unlockedSquares.length,
          unlocked: updatedGame.unlockedSquares
        });

        // Update state with latest game data
        setGame(updatedGame);

        // Check if new bingo was achieved - show Career Card if so
        const hasNewBingo = result.newAchievements.length > 0;

        if (hasNewBingo) {
          // Cache career details for bingo grid
          await cacheCareerDetails(updatedGame.bingoGrid.careers.flat());

          // Small delay to ensure state updates complete
          await new Promise(resolve => setTimeout(resolve, 50));
          setCurrentScreen('bingo-grid');
        } else if (result.gameCompleted) {
          // Game completed without new bingo - go straight to results
          const summary = await discoveredLiveService.getGameSummary(game.id);
          if (summary) {
            setGameSummary(summary);
            setCurrentScreen('results');
          }
        } else {
          // No bingo and game not complete - load next question
          loadNextQuestion();
        }
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle continue from bingo grid screen
   */
  const handleContinueFromGrid = async () => {
    if (!game) return;

    // Check if game is completed
    if (game.currentQuestionIndex >= game.totalQuestions) {
      // Game is complete, show results
      const summary = await discoveredLiveService.getGameSummary(game.id);
      if (summary) {
        setGameSummary(summary);
        setCurrentScreen('results');
      }
    } else {
      // Game not complete, load next question
      loadNextQuestion();
    }
  };

  /**
   * Load next question
   */
  const loadNextQuestion = async () => {
    if (!game) return;

    setLoading(true);
    try {
      const nextQuestion = await discoveredLiveService.getNextQuestion(game.id);
      if (nextQuestion) {
        setQuestionData(nextQuestion);
        setCurrentScreen('question');
      } else {
        // No more questions, show results
        const summary = await discoveredLiveService.getGameSummary(game.id);
        if (summary) {
          setGameSummary(summary);
          setCurrentScreen('results');
        }
      }
    } catch (err) {
      console.error('Failed to load next question:', err);
      setError('Failed to load next question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cache career details for bingo grid display
   */
  const cacheCareerDetails = async (careerCodes: string[]) => {
    const newCache = new Map(careerDetailsCache);

    for (const code of careerCodes) {
      if (!newCache.has(code)) {
        try {
          const details = await discoveredLiveService['getCareerDetails'](code);
          if (details) {
            newCache.set(code, details);
          }
        } catch (err) {
          console.error(`Failed to load career details for ${code}:`, err);
        }
      }
    }

    setCareerDetailsCache(newCache);
  };

  /**
   * Handle results screen completion
   */
  const handleResultsComplete = () => {
    onComplete();
  };

  // Show loading state
  if (loading && !game) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  // Show error state
  if (error && !game) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md mx-4">
          <h3 className="text-xl font-bold text-red-600 mb-4">Error</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={initializeGame}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render current screen
  return (
    <AnimatePresence mode="wait">
      {currentScreen === 'intro' && game && (
        <DiscoveredLiveIntro
          key="intro"
          bingoGrid={game.bingoGrid}
          studentName={studentName}
          onStart={handleStartGame}
        />
      )}

      {currentScreen === 'question' && game && questionData && (
        <DiscoveredLiveQuestion
          key={`question-${questionData.questionNumber}`}
          questionData={questionData}
          totalQuestions={game.totalQuestions}
          currentStreak={game.currentStreak}
          unlockedSquares={game.unlockedSquares}
          onAnswerSubmit={handleAnswerSubmit}
        />
      )}

      {currentScreen === 'bingo-grid' && game && (
        <DiscoveredLiveBingoGrid
          key={`bingo-grid-${game.currentQuestionIndex}`}
          bingoGrid={game.bingoGrid}
          unlockedSquares={game.unlockedSquares}
          completedRows={game.completedRows}
          completedColumns={game.completedColumns}
          completedDiagonals={game.completedDiagonals}
          careerDetails={careerDetailsCache}
          currentQuestionIndex={game.currentQuestionIndex}
          totalQuestions={game.totalQuestions}
          currentXP={game.totalXp}
          currentStreak={game.currentStreak}
          onContinue={handleContinueFromGrid}
        />
      )}

      {currentScreen === 'results' && gameSummary && (
        <DiscoveredLiveResults
          key="results"
          studentName={studentName}
          summary={gameSummary}
          onComplete={handleResultsComplete}
        />
      )}
    </AnimatePresence>
  );
};

export default DiscoveredLiveContainer;
