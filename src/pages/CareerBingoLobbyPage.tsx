/**
 * Career Bingo - Multiplayer Lobby
 *
 * Setup page for Career Bingo multiplayer game
 * Players review rules before entering the live room
 *
 * Features:
 * - Game rules and instructions
 * - User career preview (center free space)
 * - Quick start button to join live room
 * - Real-time room status and countdown
 * - Integration with GameOrchestrator
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trophy, Zap, ArrowLeft, Grid3x3, Star, Clock, Users, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { MultiplayerGameRoom, GameSummaryData } from '../components/discovered-live/MultiplayerGameRoom';
import { BingoGameSummary } from '../components/discovered-live/BingoGameSummary';
import { perpetualRoomManager } from '../services/PerpetualRoomManager';
import { gameOrchestrator } from '../services/GameOrchestrator';
import type { PerpetualRoom, GameSession, SessionParticipant } from '../types/DiscoveredLiveMultiplayerTypes';
import '../design-system/index.css';

type LobbyState = 'rules' | 'joining' | 'waiting' | 'playing' | 'summary';

export const CareerBingoLobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [lobbyState, setLobbyState] = useState<LobbyState>('rules');
  const [room, setRoom] = useState<PerpetualRoom | null>(null);
  const [session, setSession] = useState<GameSession | null>(null);
  const [myParticipant, setMyParticipant] = useState<SessionParticipant | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [gameSummary, setGameSummary] = useState<GameSummaryData | null>(null);

  // Get user's career from sessionStorage (set during career selection)
  const getSessionCareer = () => {
    const storedCareer = sessionStorage.getItem('selectedCareer');
    console.log('🔍 CareerBingoLobby - Checking sessionStorage for selectedCareer:', storedCareer);

    if (storedCareer) {
      try {
        const parsed = JSON.parse(storedCareer);
        console.log('✅ CareerBingoLobby - Parsed career:', parsed);
        return { name: parsed.career || parsed.name || 'Teacher', code: parsed.careerId || parsed.id || 'teacher' };
      } catch {
        // If not JSON, treat as plain string
        console.log('⚠️ CareerBingoLobby - Not JSON, using as string:', storedCareer);
        return { name: storedCareer, code: storedCareer.toLowerCase().replace(/\s+/g, '-') };
      }
    }
    console.warn('❌ CareerBingoLobby - No career in sessionStorage, using fallback: Teacher');
    return { name: 'Teacher', code: 'teacher' }; // Default fallback
  };

  const userCareerData = getSessionCareer();
  const userCareer = userCareerData.name;
  const userCareerCode = userCareerData.code;
  console.log('👤 CareerBingoLobby - User career set to:', { userCareer, userCareerCode });
  const userName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Player';
  const userId = user?.id || ''; // Will be validated before use

  const handleBackToHub = () => {
    navigate('/discovered-live');
  };

  const handleGameComplete = (summaryData: GameSummaryData) => {
    console.log('🏁 [CareerBingoLobby] handleGameComplete called - showing summary');
    setGameSummary(summaryData);
    setLobbyState('summary');
  };

  const handlePlayAgain = () => {
    setGameSummary(null);
    setSession(null);
    setMyParticipant(null);
    setLobbyState('rules');
  };

  const handleReturnToHub = () => {
    navigate('/discovered-live');
  };

  /**
   * Join a room and start/wait for game
   */
  const handleJoinRoom = async () => {
    try {
      setLobbyState('joining');
      setError(null);

      // 0. Ensure user is authenticated
      if (!user?.id) {
        throw new Error('You must be logged in to play Career Bingo');
      }

      // 1. Get an active elementary room (GLOBAL01 for now)
      const roomCode = 'GLOBAL01';
      const fetchedRoom = await perpetualRoomManager.getRoomByCode(roomCode);

      if (!fetchedRoom) {
        throw new Error('Room not found');
      }

      setRoom(fetchedRoom);

      // 2. Check room status
      console.log('🎮 Room status:', fetchedRoom.status);
      console.log('📊 Room details:', {
        status: fetchedRoom.status,
        currentGameId: fetchedRoom.currentGameId,
        nextGameStartsAt: fetchedRoom.nextGameStartsAt,
        playerCount: fetchedRoom.currentPlayerCount
      });

      if (fetchedRoom.status === 'active') {
        console.log('⏰ Room is active - joining as spectator');
        // Game in progress - join as spectator
        await perpetualRoomManager.addSpectator(
          fetchedRoom.id,
          userId,
          userName
        );

        // Show waiting state with countdown
        setLobbyState('waiting');

        // Calculate countdown (time until next game)
        if (fetchedRoom.nextGameStartsAt) {
          const timeUntilNext = new Date(fetchedRoom.nextGameStartsAt).getTime() - Date.now();
          setCountdown(Math.max(0, Math.floor(timeUntilNext / 1000)));
        }

        // Poll for intermission -> starting
        pollForGameStart(fetchedRoom.id);

      } else if (fetchedRoom.status === 'intermission') {
        console.log('⏰ Room is in intermission - joining queue');
        // Join next game queue
        await perpetualRoomManager.addSpectator(
          fetchedRoom.id,
          userId,
          userName
        );

        setLobbyState('waiting');

        // Calculate countdown
        if (fetchedRoom.nextGameStartsAt) {
          const timeUntilNext = new Date(fetchedRoom.nextGameStartsAt).getTime() - Date.now();
          setCountdown(Math.max(0, Math.floor(timeUntilNext / 1000)));
        }

        // Poll for game start
        pollForGameStart(fetchedRoom.id);

      } else {
        console.log('🚀 Room is available - starting new game immediately');
        // Room not active - start a new game immediately (for testing)
        await startNewGame(fetchedRoom.id);
      }

    } catch (err) {
      console.error('Error joining room:', err);
      setError(err instanceof Error ? err.message : 'Failed to join room');
      setLobbyState('rules');
    }
  };

  /**
   * Start a new game session
   */
  const startNewGame = async (roomId: string) => {
    try {
      // 1. Start new game session (creates session + adds spectators as participants + AI fill)
      // Pass the user's career code and user ID to ensure proper participant creation
      const newSession = await perpetualRoomManager.startNewGame(roomId, userId, userCareerCode);
      setSession(newSession);

      // 2. Get my participant record
      const participants = await perpetualRoomManager.getSessionParticipants(newSession.id);
      const me = participants.find(p => p.studentId === userId);

      if (!me) {
        throw new Error('Failed to find participant record');
      }

      setMyParticipant(me);

      // 3. Start game loop (question cycling)
      console.log('🎮 [CareerBingoLobby] Starting game loop for session:', newSession.id);
      console.log('📊 [CareerBingoLobby] Session details:', {
        totalQuestions: newSession.totalQuestions,
        currentQuestionNumber: newSession.currentQuestionNumber,
        bingoSlotsTotal: newSession.bingoSlotsTotal,
        status: newSession.status
      });

      gameOrchestrator.startGameLoop(newSession.id).catch(err => {
        console.error('Error in game loop:', err);
      });

      // 4. Enter game room
      console.log('🚀 [CareerBingoLobby] Entering game room (lobbyState -> playing)');
      setLobbyState('playing');

    } catch (err) {
      console.error('Error starting game:', err);
      setError(err instanceof Error ? err.message : 'Failed to start game');
      setLobbyState('rules');
    }
  };

  /**
   * Poll for game start (check every second)
   */
  const pollForGameStart = (roomId: string) => {
    console.log('📡 Starting poll for game start...');

    const interval = setInterval(async () => {
      try {
        const updatedRoom = await perpetualRoomManager.getRoomByCode('GLOBAL01');

        if (!updatedRoom) {
          console.log('❌ Room not found, stopping poll');
          clearInterval(interval);
          return;
        }

        console.log('🔄 Poll tick - Room status:', updatedRoom.status, 'Player count:', updatedRoom.currentPlayerCount);

        // Update countdown
        if (updatedRoom.nextGameStartsAt) {
          const timeUntilNext = new Date(updatedRoom.nextGameStartsAt).getTime() - Date.now();
          const seconds = Math.max(0, Math.floor(timeUntilNext / 1000));
          setCountdown(seconds);

          // If countdown reached 0 and status is still intermission, start game
          if (seconds === 0 && updatedRoom.status === 'intermission') {
            console.log('⏰ Countdown reached 0, starting game!');
            clearInterval(interval);
            await startNewGame(updatedRoom.id);
          }
        } else {
          console.log('⚠️ No nextGameStartsAt set, starting game immediately');
          // No countdown set and not in active game - start immediately
          if (updatedRoom.status !== 'active') {
            clearInterval(interval);
            await startNewGame(updatedRoom.id);
          }
        }

        // If game started (by scheduler or another trigger), check if we can join it
        if (updatedRoom.status === 'active' && updatedRoom.currentGameId) {
          console.log('🎮 Game is active, checking if I am a participant...');

          // Try to join the active game
          try {
            const participants = await perpetualRoomManager.getSessionParticipants(updatedRoom.currentGameId);
            const me = participants.find(p => p.studentId === userId);

            if (me) {
              // User is already a participant - join the game
              console.log('✅ Found participant record, joining game');
              clearInterval(interval);

              setSession({
                id: updatedRoom.currentGameId,
                perpetualRoomId: updatedRoom.id,
                gameNumber: updatedRoom.currentGameNumber,
                status: 'active',
                bingoSlotsTotal: updatedRoom.bingoSlotsPerGame,
                bingoSlotsRemaining: updatedRoom.bingoSlotsPerGame,
                bingoWinners: [],
                currentQuestionNumber: 0,
                totalQuestions: updatedRoom.questionsPerGame,
                questionsAsked: [],
                startedAt: new Date().toISOString(),
                totalParticipants: updatedRoom.currentPlayerCount,
                humanParticipants: updatedRoom.currentPlayerCount,
                aiParticipants: 0,
              });
              setMyParticipant(me);

              // Ensure game loop is running
              if (!gameOrchestrator.isGameRunning(updatedRoom.currentGameId)) {
                console.log('🎮 Game loop not running, starting it now...');
                gameOrchestrator.startGameLoop(updatedRoom.currentGameId).catch(err => {
                  console.error('Error starting game loop:', err);
                });
              } else {
                console.log('✅ Game loop already running');
              }

              setLobbyState('playing');
            } else {
              // User is spectator - continue waiting (don't clear interval)
              console.log('⏰ Not a participant, staying in waiting room for next game');
            }
          } catch (err) {
            console.error('Error checking participation:', err);
          }
        }

      } catch (err) {
        console.error('Error polling for game start:', err);
      }
    }, 1000);

    // Cleanup on unmount
    return () => {
      console.log('🛑 Stopping poll');
      clearInterval(interval);
    };
  };

  // Countdown timer effect
  useEffect(() => {
    if (lobbyState === 'waiting' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => Math.max(0, prev - 1));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [lobbyState, countdown]);

  // If game has started, render the game room
  if (lobbyState === 'playing' && session && myParticipant) {
    return (
      <MultiplayerGameRoom
        sessionId={session.id}
        roomId={room?.id || ''}
        myParticipantId={myParticipant.id}
        myBingoCard={myParticipant.bingoCard}
        userName={userName}
        onComplete={handleGameComplete}
      />
    );
  }

  // If showing game summary
  if (lobbyState === 'summary' && gameSummary) {
    return (
      <BingoGameSummary
        playerResults={gameSummary.playerResults}
        totalQuestions={gameSummary.totalQuestions}
        userXPEarned={gameSummary.userXPEarned}
        userAccuracy={gameSummary.userAccuracy}
        userBingos={gameSummary.userBingos}
        userMaxStreak={gameSummary.userMaxStreak}
        onPlayAgain={handlePlayAgain}
        onReturnToHub={handleReturnToHub}
      />
    );
  }

  // If waiting for game to start
  if (lobbyState === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
        <motion.div
          className="glass-card max-w-md w-full text-center p-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Loader className="w-16 h-16 text-white mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Waiting for Next Game
          </h2>
          <p className="text-white/80 mb-6">
            {room?.currentPlayerCount || 0} players in room
          </p>

          {countdown > 0 && (
            <div className="glass-subtle p-6 mb-6">
              <div className="text-5xl font-bold text-white mb-2">{countdown}</div>
              <div className="text-white/70">seconds until next game</div>
            </div>
          )}

          <button
            onClick={handleBackToHub}
            className="glass-card-sm px-6 py-3 text-white hover:scale-105 transition-transform"
          >
            Cancel
          </button>
        </motion.div>
      </div>
    );
  }

  // If joining (loading state)
  if (lobbyState === 'joining') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <Loader className="w-12 h-12 text-white mx-auto mb-4 animate-spin" />
          <div className="text-white text-xl">Joining room...</div>
        </div>
      </div>
    );
  }

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
              {/* Back Button & Title */}
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={handleBackToHub}
                  className="glass-card-sm p-3 hover:scale-105 transition-transform"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </motion.button>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Grid3x3 className="w-8 h-8 text-yellow-300" />
                    Career Bingo
                  </h1>
                  <p className="text-white/80 text-sm">Multiplayer Setup</p>
                </div>
              </div>

              {/* User Info */}
              <div className="glass-card-sm flex items-center gap-3 px-4 py-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                  {userName[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-semibold">{userName}</div>
                  <div className="text-white/60 text-xs flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-300" />
                    {userCareer}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-8">
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
                <Trophy className="w-16 h-16 text-yellow-300 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-4xl font-bold text-white mb-2">
                Ready to Play Career Bingo?
              </h2>
              <p className="text-white/80 text-lg">
                Match career clues to complete your bingo card!
              </p>
            </div>

            {/* Game Info Grid */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="glass-game text-center p-6">
                <Clock className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">8s</div>
                <div className="text-white/70 text-sm">Per Question</div>
              </div>
              <div className="glass-game text-center p-6">
                <Grid3x3 className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">5×5</div>
                <div className="text-white/70 text-sm">Bingo Grid</div>
              </div>
              <div className="glass-game text-center p-6">
                <Trophy className="w-8 h-8 text-green-300 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white mb-1">+50</div>
                <div className="text-white/70 text-sm">XP per Bingo</div>
              </div>
            </div>

            {/* How to Play */}
            <div className="glass-subtle p-6 mb-8">
              <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
              <div className="space-y-3 text-white/90">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
                  <p>Answer career clues correctly to unlock squares on your bingo card (+10 XP)</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
                  <p>Complete 5 squares in a row, column, or diagonal for BINGO (+50 XP bonus)</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</span>
                  <p>Your career <span className="font-bold text-yellow-300">({userCareer})</span> is in the center as a FREE space ⭐</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</span>
                  <p>You have <span className="font-bold text-yellow-300">8 seconds</span> to answer each question - be quick!</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">5</span>
                  <p><span className="font-bold text-red-300">Warning:</span> Wrong answers cost you -5 XP and break your streak!</p>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">6</span>
                  <p>Compete against other live players to earn the most XP and win!</p>
                </div>
              </div>
            </div>

            {/* Your Career Preview */}
            <div className="glass-game-warning p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-3xl">
                  ⭐
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white mb-1">Your Career: {userCareer}</h4>
                  <p className="text-white/80 text-sm">
                    This will appear in the center of your bingo card as a FREE space!
                  </p>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <motion.button
              onClick={handleJoinRoom}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-6 px-8 rounded-xl shadow-lg text-xl flex items-center justify-center gap-3"
              whileHover={{ scale: 1.02, boxShadow: '0 20px 60px rgba(16, 185, 129, 0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-8 h-8" fill="currentColor" />
              Join Live Room
            </motion.button>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-game-warning p-4 mt-4"
              >
                <p className="text-white font-semibold">⚠️ {error}</p>
              </motion.div>
            )}
          </motion.div>

          {/* Tips Card */}
          <motion.div
            className="glass-subtle p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-300" />
              Pro Tips
            </h3>
            <ul className="space-y-2 text-white/80 text-sm">
              <li className="flex gap-2">
                <span>💡</span>
                <span>Focus on completing diagonals first - they're often easier to spot!</span>
              </li>
              <li className="flex gap-2">
                <span>⚡</span>
                <span>Answer quickly to build streaks and earn bonus XP</span>
              </li>
              <li className="flex gap-2">
                <span>🎯</span>
                <span>Your center FREE space gives you a strategic advantage</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CareerBingoLobbyPage;
