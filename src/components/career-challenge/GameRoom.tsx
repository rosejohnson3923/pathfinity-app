/**
 * Career Challenge Game Room
 * Main gameplay interface for multiplayer Career Challenge
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupabase } from '../../hooks/useSupabase';
import { CareerChallengeGameEngine } from '../../services/CareerChallengeGameEngine';
import {
  GameSession,
  Challenge,
  RoleCard,
  GamePhase,
  TurnPhase,
  VictoryCondition,
} from '../../types/CareerChallengeTypes';
import { ChallengeCard } from './ChallengeCard';
import { RoleCard as RoleCardComponent } from './RoleCard';
import {
  Trophy,
  Clock,
  Users,
  Shield,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
} from 'lucide-react';

interface GameRoomProps {
  roomCode: string;
  playerId: string;
  playerName: string;
  industryId: string;
  industryName: string;
  onLeave: () => void;
}

interface PlayerDisplay {
  playerId: string;
  displayName: string;
  score: number;
  isCurrentTurn: boolean;
  isReady: boolean;
  roleCards: number;
  streakCount: number;
}

export const GameRoom: React.FC<GameRoomProps> = ({
  roomCode,
  playerId,
  playerName,
  industryId,
  industryName,
  onLeave,
}) => {
  const supabase = useSupabase();
  const gameEngineRef = useRef<CareerChallengeGameEngine | null>(null);

  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>('waiting');
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('idle');
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(false);

  // Players
  const [players, setPlayers] = useState<PlayerDisplay[]>([]);
  const [myScore, setMyScore] = useState(0);

  // Challenges
  const [centerChallenges, setCenterChallenges] = useState<Challenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  // My cards
  const [myRoleCards, setMyRoleCards] = useState<RoleCard[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Set<string>>(new Set());

  // UI state
  const [turnTimer, setTurnTimer] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Initialize game engine
   */
  useEffect(() => {
    if (!supabase) return;

    const initializeGame = async () => {
      try {
        const engine = new CareerChallengeGameEngine(supabase);
        gameEngineRef.current = engine;

        // Create or join game session
        const gameState = await engine.createGameSession(
          playerId,
          industryId,
          roomCode,
          { type: 'score', target: 100 }
        );

        updateUIFromGameState(gameState);
      } catch (error) {
        console.error('Failed to initialize game:', error);
        setErrorMessage('Failed to initialize game');
      }
    };

    initializeGame();

    return () => {
      gameEngineRef.current?.cleanup();
    };
  }, [supabase, playerId, industryId, roomCode]);

  /**
   * Update UI from game state
   */
  const updateUIFromGameState = (gameState: any) => {
    if (!gameState) return;

    setGamePhase(gameState.phase);
    setTurnPhase(gameState.turnPhase);
    setCurrentTurn(gameState.currentTurn);
    setIsMyTurn(gameState.currentPlayerId === playerId);
    setCenterChallenges(gameState.centerChallenges || []);
    setActiveChallenge(gameState.activeChallenge || null);

    // Update players
    const playerList: PlayerDisplay[] = [];
    for (const [id, player] of gameState.players) {
      playerList.push({
        playerId: id,
        displayName: player.displayName,
        score: player.score,
        isCurrentTurn: id === gameState.currentPlayerId,
        isReady: player.isReady,
        roleCards: player.roleCards.length,
        streakCount: player.streakCount,
      });

      if (id === playerId) {
        setMyScore(player.score);
        setMyRoleCards(player.roleCards || []);
      }
    }
    setPlayers(playerList);
  };

  /**
   * Start the game (host only)
   */
  const handleStartGame = async () => {
    if (!gameEngineRef.current) return;

    try {
      await gameEngineRef.current.startGame();
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to start game');
    }
  };

  /**
   * Select a challenge
   */
  const handleSelectChallenge = async (challengeId: string) => {
    if (!gameEngineRef.current || !isMyTurn) return;

    try {
      setSelectedChallengeId(challengeId);
      await gameEngineRef.current.selectChallenge(playerId, challengeId);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to select challenge');
      setSelectedChallengeId(null);
    }
  };

  /**
   * Toggle role card selection
   */
  const toggleRoleCard = (roleCardId: string) => {
    const newSelection = new Set(selectedTeam);
    if (newSelection.has(roleCardId)) {
      newSelection.delete(roleCardId);
    } else {
      // Check max team size
      if (activeChallenge && newSelection.size >= activeChallenge.maxRolesAllowed) {
        setErrorMessage(`Maximum ${activeChallenge.maxRolesAllowed} roles allowed`);
        return;
      }
      newSelection.add(roleCardId);
    }
    setSelectedTeam(newSelection);
  };

  /**
   * Submit team for challenge
   */
  const handleSubmitTeam = async () => {
    if (!gameEngineRef.current || !isMyTurn || !activeChallenge) return;

    // Validate team size
    if (selectedTeam.size < activeChallenge.minRolesRequired) {
      setErrorMessage(`Minimum ${activeChallenge.minRolesRequired} roles required`);
      return;
    }

    try {
      const result = await gameEngineRef.current.submitTeam(
        playerId,
        Array.from(selectedTeam)
      );

      setLastResult(result);
      setSelectedTeam(new Set());

      // Show result animation
      setTimeout(() => {
        setLastResult(null);
      }, 5000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to submit team');
    }
  };

  /**
   * Render waiting room
   */
  const renderWaitingRoom = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {industryName} Challenge Room
        </h2>
        <p className="text-gray-600 dark:text-gray-400">Room Code: {roomCode}</p>
      </motion.div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Players ({players.length}/6)
        </h3>
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.playerId}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span className="font-medium">{player.displayName}</span>
              {player.isReady && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
          ))}
        </div>
      </div>

      {players.length >= 2 && players[0]?.playerId === playerId && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartGame}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg"
        >
          Start Game
        </motion.button>
      )}
    </div>
  );

  /**
   * Render game board
   */
  const renderGameBoard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Players & Scores */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Leaderboard
          </h3>
          <div className="space-y-2">
            {players
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div
                  key={player.playerId}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    player.isCurrentTurn
                      ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                    </span>
                    <div>
                      <p className="font-medium">{player.displayName}</p>
                      {player.streakCount > 0 && (
                        <p className="text-xs text-orange-500">
                          🔥 {player.streakCount} streak
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{player.score}</p>
                    <p className="text-xs text-gray-500">
                      {player.roleCards} cards
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Turn Timer */}
        {turnTimer !== null && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Turn Timer</span>
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${turnTimer <= 10 ? 'text-red-500' : 'text-gray-500'}`} />
                <span className={`text-2xl font-bold ${turnTimer <= 10 ? 'text-red-500' : ''}`}>
                  {turnTimer}s
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Center: Challenge Area */}
      <div className="space-y-6">
        {turnPhase === 'selecting_challenge' && isMyTurn && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Select a Challenge:</h3>
            <div className="space-y-3">
              {centerChallenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectChallenge(challenge.id)}
                  className={`cursor-pointer transition-all ${
                    selectedChallengeId === challenge.id
                      ? 'ring-2 ring-blue-500'
                      : ''
                  }`}
                >
                  <ChallengeCard
                    challenge={challenge}
                    industry={{ name: industryName } as any}
                    isRevealed={true}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeChallenge && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Active Challenge:</h3>
            <ChallengeCard
              challenge={activeChallenge}
              industry={{ name: industryName } as any}
              isRevealed={true}
            />
          </div>
        )}

        {/* Challenge Result */}
        <AnimatePresence>
          {lastResult && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`p-6 rounded-xl text-white ${
                lastResult.success
                  ? 'bg-gradient-to-r from-green-500 to-blue-500'
                  : 'bg-gradient-to-r from-red-500 to-orange-500'
              }`}
            >
              <div className="text-center space-y-2">
                {lastResult.success ? (
                  <CheckCircle className="w-16 h-16 mx-auto mb-2" />
                ) : (
                  <XCircle className="w-16 h-16 mx-auto mb-2" />
                )}
                <h3 className="text-2xl font-bold">
                  {lastResult.success ? 'Challenge Success!' : 'Challenge Failed'}
                </h3>
                <p className="text-3xl font-bold">+{lastResult.score} points</p>
                {lastResult.bonuses?.map((bonus: any, i: number) => (
                  <p key={i} className="text-sm">
                    {bonus.description}: +{bonus.value}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: My Role Cards */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-500" />
            My Role Cards
          </h3>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {myRoleCards.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => turnPhase === 'selecting_team' && toggleRoleCard(card.id)}
                className={`cursor-pointer transition-all ${
                  selectedTeam.has(card.id)
                    ? 'ring-2 ring-green-500'
                    : ''
                }`}
              >
                <RoleCardComponent roleCard={card} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Submit Team Button */}
        {turnPhase === 'selecting_team' && isMyTurn && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmitTeam}
            disabled={
              !activeChallenge ||
              selectedTeam.size < activeChallenge.minRolesRequired
            }
            className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all ${
              activeChallenge && selectedTeam.size >= activeChallenge.minRolesRequired
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit Team ({selectedTeam.size}/{activeChallenge?.maxRolesAllowed || 0})
          </motion.button>
        )}
      </div>
    </div>
  );

  /**
   * Render victory screen
   */
  const renderVictoryScreen = () => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full">
        <div className="text-center space-y-6">
          <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
          <h2 className="text-3xl font-bold">Game Complete!</h2>
          <div className="space-y-3">
            {players
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <div
                  key={player.playerId}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10'
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <span className="font-medium">{player.displayName}</span>
                  </div>
                  <span className="text-xl font-bold">{player.score}</span>
                </div>
              ))}
          </div>
          <button
            onClick={onLeave}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Career Challenge</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {industryName} • Room {roomCode} • Turn {currentTurn}
            </p>
          </div>
          <button
            onClick={onLeave}
            className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Leave Game
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            {errorMessage}
          </motion.div>
        )}

        {/* Game Content */}
        {gamePhase === 'waiting' && renderWaitingRoom()}
        {gamePhase === 'playing' && renderGameBoard()}
        {showVictoryScreen && renderVictoryScreen()}
      </div>
    </div>
  );
};