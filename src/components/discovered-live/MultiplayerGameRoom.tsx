/**
 * Multiplayer Game Room - Career Bingo (Real Database Version)
 *
 * Main game room component for live multiplayer Career Bingo
 * Connected to real Supabase database and WebSocket events
 *
 * Features:
 * - 5×5 bingo grid with unique card per player
 * - Timer-based questions (8 seconds)
 * - Server-side click validation via GameOrchestrator
 * - Real-time leaderboard via WebSocket
 * - Bingo detection with slot system
 * - XP rewards and celebration animations
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, ArrowLeft } from 'lucide-react';
import { BingoGrid } from './BingoGrid';
import { QuestionDisplayCard } from './QuestionDisplayCard';
import { PlayerLeaderboardCard } from './PlayerLeaderboardCard';
import { discoveredLiveRealtimeService } from '../../services/DiscoveredLiveRealtimeService';
import { gameOrchestrator } from '../../services/GameOrchestrator';
import { perpetualRoomManager } from '../../services/PerpetualRoomManager';
import { supabase } from '../../lib/supabase';
import type { GridPosition, CareerClue } from '../../types/DiscoveredLiveMultiplayerTypes';
import '../../design-system/index.css';

interface Player {
  id: string;
  name: string;
  xp: number;
  correct: number;
  streak: number;
  bingos: number;
  isAI: boolean;
  isCurrentUser?: boolean;
}

interface GameState {
  sessionId: string;
  roomId: string;
  myParticipantId: string;
  grid: string[][]; // 5×5 grid of career codes
  unlocked: GridPosition[]; // Unlocked squares
  players: Player[];
  questionNumber: number;
  timer: number;
  currentClue?: CareerClue;
  running: boolean;
  completedLines: string[]; // e.g., ['row-0', 'col-2', 'diag-1']
  userAnswered: boolean;
}

export interface GameSummaryData {
  playerResults: {
    id: string;
    name: string;
    xp: number;
    correct: number;
    total: number;
    bingos: number;
    streak: number;
    isCurrentUser: boolean;
    rank: number;
  }[];
  totalQuestions: number;
  userXPEarned: number;
  userAccuracy: number;
  userBingos: number;
  userMaxStreak: number;
}

interface MultiplayerGameRoomProps {
  sessionId: string;
  roomId: string;
  myParticipantId: string;
  myBingoCard: { careers: string[][] }; // From database
  userName: string;
  onComplete: (summaryData: GameSummaryData) => void;
  onLeave?: () => void; // Optional handler for leaving mid-game
}

export const MultiplayerGameRoom: React.FC<MultiplayerGameRoomProps> = ({
  sessionId,
  roomId,
  myParticipantId,
  myBingoCard,
  userName,
  onComplete,
  onLeave
}) => {
  const [game, setGame] = useState<GameState | null>(null);
  const [showBingoAnimation, setShowBingoAnimation] = useState(false);
  const [careerDetails, setCareerDetails] = useState<Map<string, { careerName: string; icon: string; }>>(new Map());
  const gameRef = useRef<GameState | null>(null);

  // XP notification state
  const [showXPNotification, setShowXPNotification] = useState(false);
  const [lastXPAwarded, setLastXPAwarded] = useState(0);
  const [xpNotificationType, setXPNotificationType] = useState<'success' | 'error'>('success');

  // Initialize game on mount
  useEffect(() => {
    initializeGame();

    return () => {
      // Cleanup: unsubscribe from room events
      discoveredLiveRealtimeService.unsubscribeFromRoom(roomId);
    };
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // Timer countdown effect
  useEffect(() => {
    if (!game || !game.currentClue || game.timer <= 0 || game.userAnswered) {
      return;
    }

    const interval = setInterval(() => {
      setGame(prev => {
        if (!prev || !prev.currentClue || prev.userAnswered) return prev;

        const newTimer = Math.max(0, prev.timer - 1);
        return { ...prev, timer: newTimer };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [game?.currentClue, game?.timer, game?.userAnswered]);

  /**
   * Initialize game state from database
   */
  const initializeGame = async () => {
    try {
      console.log('🎮 [MultiplayerGameRoom] Initializing game...', {
        sessionId,
        roomId,
        myParticipantId
      });

      // Subscribe to WebSocket events for this room
      await discoveredLiveRealtimeService.subscribeToRoom(roomId, {
        question_started: handleQuestionAsked,
        player_correct: handlePlayerClicked,
        player_incorrect: handlePlayerClicked,
        bingo_achieved: handleBingoClaimed,
        game_completed: handleGameEnded,
        participant_joined: handlePlayerJoined,
        participant_left: handlePlayerLeft,
      });

      // Initialize game state
      const initialState: GameState = {
        sessionId,
        roomId,
        myParticipantId,
        grid: myBingoCard.careers,
        unlocked: [{ row: 2, col: 2 }], // Pre-unlock center square (FREE space)
        players: [], // Will be populated from database
        questionNumber: 0,
        timer: 8,
        running: true,
        completedLines: [],
        userAnswered: false,
      };

      console.log('📊 [MultiplayerGameRoom] Initial game state created');

      setGame(initialState);
      gameRef.current = initialState;

      // Fetch career details for the grid
      await loadCareerDetails(myBingoCard.careers);

      // Fetch initial participant data
      await loadParticipants();

      // Fetch current game state (question, timer, etc.)
      await loadCurrentGameState();
    } catch (error) {
      console.error('Error initializing game:', error);
    }
  };

  /**
   * Load current game state from database (for joining mid-game)
   */
  const loadCurrentGameState = async () => {
    try {
      const client = await supabase();

      // Get current session state
      const { data: session, error } = await client
        .from('cb_game_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error || !session) {
        console.error('Error fetching session state:', error);
        return;
      }

      // Get current participant state (unlocked squares)
      const { data: participant } = await client
        .from('cb_session_participants')
        .select('unlocked_squares')
        .eq('id', myParticipantId)
        .single();

      if (participant && participant.unlocked_squares) {
        setGame(prev => prev ? {
          ...prev,
          unlocked: participant.unlocked_squares as GridPosition[],
          questionNumber: session.current_question_number || 0,
        } : null);
      }

      console.log('📊 Loaded current game state');
    } catch (error) {
      console.error('Error loading game state:', error);
    }
  };

  /**
   * Load career details (names and icons) from database
   */
  const loadCareerDetails = async (grid: string[][]) => {
    try {
      const client = await supabase();

      // Get unique career codes from grid
      const careerCodes = [...new Set(grid.flat())];

      // Fetch career details from database
      const { data, error } = await client
        .from('career_paths')
        .select('career_code, career_name, icon')
        .in('career_code', careerCodes);

      if (error) {
        console.error('Error fetching career details:', error);
        return;
      }

      if (data) {
        const detailsMap = new Map<string, { careerName: string; icon: string; }>();
        data.forEach(career => {
          detailsMap.set(career.career_code, {
            careerName: career.career_name,
            icon: career.icon || '💼'
          });
        });
        setCareerDetails(detailsMap);
        console.log(`📊 Loaded ${detailsMap.size} career details for bingo grid`);
      }
    } catch (error) {
      console.error('Error loading career details:', error);
    }
  };

  /**
   * Load all participants for leaderboard
   */
  const loadParticipants = async () => {
    try {
      const participants = await perpetualRoomManager.getSessionParticipants(sessionId);

      const players: Player[] = participants.map(p => ({
        id: p.id,
        name: p.displayName,
        xp: p.totalXp,
        correct: p.correctAnswers,
        streak: p.currentStreak,
        bingos: p.bingosWon,
        isAI: p.participantType === 'ai_agent',
        isCurrentUser: p.id === myParticipantId,
      }));

      setGame(prev => prev ? { ...prev, players } : null);
      console.log(`👥 Loaded ${players.length} participants for leaderboard`);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  // ============================================================
  // WEBSOCKET EVENT HANDLERS
  // ============================================================

  /**
   * Handle new question from WebSocket
   */
  const handleQuestionAsked = (event: any) => {
    const payload = event.data;
    console.log('❓ Received question:', payload);

    // Create CareerClue object from the payload
    const clue: CareerClue = {
      id: '', // Not provided in broadcast
      careerCode: payload.correctCareerCode,
      clueText: payload.clueText,
      skillConnection: payload.skillConnection,
      difficulty: 'medium',
      gradeCategory: 'elementary',
      minPlayCount: 0,
      distractorCareers: [],
      distractorStrategy: 'balanced',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      timesShown: 0,
      timesCorrect: 0,
      avgResponseTimeSeconds: 0,
    };

    setGame(prev => prev ? {
      ...prev,
      questionNumber: payload.questionNumber,
      currentClue: clue,
      timer: payload.timeLimitSeconds,
      userAnswered: false,
    } : null);
  };

  /**
   * Handle player click event from WebSocket
   */
  const handlePlayerClicked = (event: any) => {
    const payload = event.data;
    console.log('👆 Player clicked:', payload);

    const g = gameRef.current;
    if (!g) return;

    // Update player stats in leaderboard
    setGame(prev => {
      if (!prev) return null;

      const updatedPlayers = [...prev.players];
      const playerIndex = updatedPlayers.findIndex(p => p.id === payload.participantId);

      if (playerIndex !== -1) {
        updatedPlayers[playerIndex] = {
          ...updatedPlayers[playerIndex],
          xp: payload.xpEarned ? updatedPlayers[playerIndex].xp + payload.xpEarned : updatedPlayers[playerIndex].xp,
          streak: payload.newStreak || updatedPlayers[playerIndex].streak,
          correct: updatedPlayers[playerIndex].correct + (payload.isCorrect ? 1 : 0),
        };
      }

      // If it's the current user's click, update unlocked squares
      let newUnlocked = prev.unlocked;
      if (payload.participantId === myParticipantId && payload.unlockedPosition) {
        newUnlocked = [...prev.unlocked, payload.unlockedPosition];
      }

      return {
        ...prev,
        players: updatedPlayers,
        unlocked: newUnlocked,
        userAnswered: payload.participantId === myParticipantId ? true : prev.userAnswered,
      };
    });
  };

  /**
   * Handle bingo claim event from WebSocket
   */
  const handleBingoClaimed = (event: any) => {
    const payload = event.data;
    console.log('🎉 Bingo achieved:', payload);

    const g = gameRef.current;
    if (!g) return;

    // Update player bingos in leaderboard
    setGame(prev => {
      if (!prev) return null;

      const updatedPlayers = [...prev.players];
      const playerIndex = updatedPlayers.findIndex(p => p.id === payload.participantId);

      if (playerIndex !== -1) {
        updatedPlayers[playerIndex] = {
          ...updatedPlayers[playerIndex],
          bingos: updatedPlayers[playerIndex].bingos + 1,
          xp: updatedPlayers[playerIndex].xp + (payload.xpBonus || 0),
        };
      }

      // If it's the current user, show celebration
      if (payload.participantId === myParticipantId) {
        setShowBingoAnimation(true);
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#9333ea', '#ec4899', '#14b8a6', '#f59e0b']
        });
        setTimeout(() => setShowBingoAnimation(false), 3000);

        return {
          ...prev,
          players: updatedPlayers,
          completedLines: [...prev.completedLines, payload.bingoType],
        };
      }

      return {
        ...prev,
        players: updatedPlayers,
      };
    });
  };

  /**
   * Handle game end event from WebSocket
   */
  const handleGameEnded = (event: any) => {
    const payload = event.data;
    console.log('🏁 [MultiplayerGameRoom] Game ended event received:', payload);
    console.log('📊 [MultiplayerGameRoom] Current game state:', game);

    setGame(prev => prev ? { ...prev, running: false } : null);

    // Final confetti
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });

    console.log('⏰ [MultiplayerGameRoom] Will call onComplete() in 3 seconds');

    // Prepare summary data
    setTimeout(() => {
      const g = gameRef.current;
      if (!g) {
        console.error('❌ No game state available for summary');
        onComplete({
          playerResults: [],
          totalQuestions: 20,
          userXPEarned: 0,
          userAccuracy: 0,
          userBingos: 0,
          userMaxStreak: 0
        });
        return;
      }

      // Sort players by XP (descending) and assign ranks
      const sortedPlayers = [...g.players].sort((a, b) => b.xp - a.xp);
      const playerResults = sortedPlayers.map((player, index) => ({
        id: player.id,
        name: player.name,
        xp: player.xp,
        correct: player.correct,
        total: g.questionNumber, // Total questions asked
        bingos: player.bingos,
        streak: player.streak,
        isCurrentUser: player.isCurrentUser || false,
        rank: index + 1
      }));

      // Get current user stats
      const currentUser = g.players.find(p => p.isCurrentUser);
      const userCorrect = currentUser?.correct || 0;
      const userAccuracy = g.questionNumber > 0 ? Math.round((userCorrect / g.questionNumber) * 100) : 0;

      const summaryData: GameSummaryData = {
        playerResults,
        totalQuestions: g.questionNumber,
        userXPEarned: currentUser?.xp || 0,
        userAccuracy,
        userBingos: currentUser?.bingos || 0,
        userMaxStreak: currentUser?.streak || 0
      };

      console.log('📊 [MultiplayerGameRoom] Summary data prepared:', summaryData);
      console.log('👋 [MultiplayerGameRoom] Calling onComplete() with summary');
      onComplete(summaryData);
    }, 3000);
  };

  /**
   * Handle player join event from WebSocket
   */
  const handlePlayerJoined = (event: any) => {
    const payload = event.data;
    console.log('👋 Player joined:', payload);

    setGame(prev => {
      if (!prev) return null;

      const newPlayer: Player = {
        id: payload.participantId,
        name: payload.displayName,
        xp: 0,
        correct: 0,
        streak: 0,
        bingos: 0,
        isAI: payload.isAI,
        isCurrentUser: payload.participantId === myParticipantId,
      };

      return {
        ...prev,
        players: [...prev.players, newPlayer],
      };
    });
  };

  /**
   * Handle player leave event from WebSocket
   */
  const handlePlayerLeft = (event: any) => {
    const payload = event.data;
    console.log('👋 Player left:', payload);

    setGame(prev => {
      if (!prev) return null;

      return {
        ...prev,
        players: prev.players.filter(p => p.id !== payload.participantId),
      };
    });
  };

  // ============================================================
  // USER INTERACTION HANDLERS
  // ============================================================

  /**
   * Handle square click - validates and sends to GameOrchestrator
   * Users can click any correct career throughout the game, not just during active questions
   */
  const handleSquareClick = async (row: number, col: number) => {
    const g = gameRef.current;
    if (!g || !g.running) return;

    const position: GridPosition = { row, col };
    const clickedCareer = g.grid[row][col];

    // Check if this square is already unlocked
    const isAlreadyUnlocked = g.unlocked.some(pos => pos.row === row && pos.col === col);
    if (isAlreadyUnlocked) {
      console.log('ℹ️ Square already unlocked');
      return;
    }

    // If there's no current question, users can't click
    if (!g.currentClue) {
      console.log('⏳ Waiting for next question...');
      return;
    }

    try {
      // Calculate response time (time since question was asked)
      const responseTime = Math.max(0, 8 - g.timer);

      // Send click to GameOrchestrator for validation
      const result = await gameOrchestrator.processClick(
        sessionId,
        myParticipantId,
        position,
        g.currentClue,
        responseTime
      );

      // Show immediate feedback with XP notification
      if (result.isCorrect) {
        // Success feedback with floating XP notification
        console.log('✅ Correct answer!');

        const xpEarned = result.xpEarned || 10;
        setLastXPAwarded(xpEarned);
        setXPNotificationType('success');
        setShowXPNotification(true);
        setTimeout(() => setShowXPNotification(false), 2000);

        // Mark this question as answered for current user
        setGame(prev => prev ? { ...prev, userAnswered: true } : null);
      } else {
        // Error feedback with floating XP notification - user can try again with a different square
        console.log('❌ Incorrect answer - try another square');

        setLastXPAwarded(-5);
        setXPNotificationType('error');
        setShowXPNotification(true);
        setTimeout(() => setShowXPNotification(false), 2000);
      }
    } catch (error) {
      console.error('Error processing click:', error);
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <div className="text-white text-xl">Loading game...</div>
        </div>
      </div>
    );
  }

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
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-panel mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onLeave && (
                <motion.button
                  onClick={onLeave}
                  className="glass-card-sm p-3 hover:scale-105 transition-transform"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Leave game and return to lobby"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </motion.button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-300" />
                  Career Bingo
                </h1>
                <p className="text-white/60 text-sm">
                  Question {game.questionNumber}/20
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <div className="glass-card-sm px-4 py-2 text-center">
                <div className="text-yellow-300 font-bold text-xl">
                  {game.players.find(p => p.isCurrentUser)?.xp || 0}
                </div>
                <div className="text-white/60 text-xs">XP</div>
              </div>
              <div className="glass-card-sm px-4 py-2 text-center">
                <div className="text-green-300 font-bold text-xl">
                  {game.players.find(p => p.isCurrentUser)?.bingos || 0}
                </div>
                <div className="text-white/60 text-xs">Bingos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Column - Question & Bingo Grid */}
          <div className="flex-1 space-y-4 min-w-[500px]">
            {/* Question Display */}
            {game.currentClue && (
              <QuestionDisplayCard
                questionNumber={game.questionNumber}
                totalQuestions={20}
                questionText={game.currentClue.clueText}
                timer={game.timer}
                maxTimer={8}
              />
            )}

            {/* Bingo Grid */}
            <BingoGrid
              grid={game.grid}
              unlocked={game.unlocked}
              onSquareClick={handleSquareClick}
              disabled={!game.running}
              careerDetails={careerDetails}
            />
          </div>

          {/* Right Column - Leaderboard */}
          <div className="lg:w-72 lg:max-w-[280px] flex-shrink-0">
            <PlayerLeaderboardCard players={game.players} />
          </div>
        </div>
      </div>

      {/* Bingo Celebration Animation */}
      <AnimatePresence>
        {showBingoAnimation && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-modal p-12 text-center pointer-events-auto"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring' }}
            >
              <div className="text-8xl mb-4">🎉</div>
              <h2 className="text-5xl font-bold text-white mb-2">BINGO!</h2>
              <p className="text-2xl text-white/90">+50 XP Bonus!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating XP Notification */}
      {showXPNotification && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '16px 32px',
          backgroundColor: xpNotificationType === 'success' ? 'rgba(72, 187, 120, 0.95)' : 'rgba(239, 68, 68, 0.95)',
          color: 'white',
          borderRadius: '12px',
          fontSize: '24px',
          fontWeight: 'bold',
          zIndex: 10000,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          animation: 'xpPop 0.5s ease-out',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '4px' }}>{xpNotificationType === 'success' ? '⭐' : '❌'}</div>
          <div>{xpNotificationType === 'success' ? '+' : ''}{lastXPAwarded} XP</div>
        </div>
      )}
    </div>
  );
};

export default MultiplayerGameRoom;
