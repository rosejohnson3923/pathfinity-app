/**
 * Enhanced Game Room for DLCC (Discovered Live! Career Challenge)
 * Integrates all UI components for a complete gameplay experience
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { CareerChallengeGameEngine } from '../../services/CareerChallengeGameEngine';
import { careerChallengeService } from '../../services/CareerChallengeService';
import {
  GameSession,
  Challenge,
  RoleCard,
  GamePhase,
  TurnPhase,
  VictoryCondition,
  Industry
} from '../../types/CareerChallengeTypes';

// Import our new components
import ChallengeSelectionPanel from './ChallengeSelectionPanel';
import TeamBuildingPanel from './TeamBuildingPanel';
import VictoryScreen from './VictoryScreen';
import GameLobby from './GameLobby';
import MultiplayerSync from './MultiplayerSync';

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
  ArrowLeft,
  Sparkles,
  Crown,
  Play,
  Timer,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';

interface EnhancedGameRoomProps {
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
  isConnected: boolean;
  roleCards: number;
  streakCount: number;
  challengesCompleted: number;
  avatar?: string;
}

export const EnhancedGameRoom: React.FC<EnhancedGameRoomProps> = ({
  roomCode,
  playerId,
  playerName,
  industryId,
  industryName,
  onLeave,
}) => {
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const gameEngineRef = useRef<CareerChallengeGameEngine | null>(null);
  const serviceRef = useRef<typeof careerChallengeService | null>(null);

  // Game state
  const [gamePhase, setGamePhase] = useState<GamePhase>('waiting');
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('idle');
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [isHost, setIsHost] = useState(false);

  // Industry data
  const [industry, setIndustry] = useState<Industry | null>(null);

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
  const [victoryData, setVictoryData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());

  /**
   * Initialize game engine and services
   */
  useEffect(() => {
    const initializeGame = async () => {
      try {
        // Get Supabase client
        const client = await supabase();
        setSupabaseClient(client);

        // Initialize services
        await careerChallengeService.initialize();
        const service = careerChallengeService;
        serviceRef.current = service;

        // Load industry data
        const industries = await service.getIndustries();
        const currentIndustry = industries.find(i => i.id === industryId);
        if (currentIndustry) {
          setIndustry(currentIndustry);
        }

        // Initialize game engine
        const engine = new CareerChallengeGameEngine(client);
        gameEngineRef.current = engine;

        // Find existing session by room code
        const sessions = await service.getActiveSessions();
        const existingSession = sessions.find(s => s.room_code === roomCode);

        if (existingSession) {
          // Join existing session
          const gameState = await engine.joinGameSession(
            existingSession.id,
            playerId,
            playerName
          );

          setIsHost(existingSession.host_player_id === playerId);
          updateUIFromGameState(gameState);
          setConnectionStatus('connected');
        } else {
          // This shouldn't happen - session should already exist
          throw new Error('Game session not found. Please return to lobby and create a new room.');
        }
      } catch (error) {
        console.error('Failed to initialize game:', error);
        setErrorMessage('Failed to initialize game');
        setConnectionStatus('disconnected');
      }
    };

    initializeGame();

    return () => {
      gameEngineRef.current?.cleanup();
    };
  }, [playerId, industryId, roomCode]);

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
        isConnected: player.isActive,
        roleCards: player.roleCards.length,
        streakCount: player.streakCount,
        challengesCompleted: player.completedChallenges?.length || 0,
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
    if (!gameEngineRef.current || !isHost) return;

    try {
      await gameEngineRef.current.startGame();
      setGameStartTime(Date.now());
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to start game');
    }
  };

  /**
   * Mark player as ready
   */
  const handleReady = async () => {
    // Would implement ready state toggle
    console.log('Player ready');
  };

  /**
   * Select a challenge
   */
  const handleSelectChallenge = async (challengeId: string) => {
    if (!gameEngineRef.current || !isMyTurn) return;

    try {
      setSelectedChallengeId(challengeId);
      await gameEngineRef.current.selectChallenge(playerId, challengeId);
      setTurnPhase('selecting_team');
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

      // Check for victory
      if (result.gameCompleted) {
        prepareVictoryScreen();
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to submit team');
    }
  };

  /**
   * Prepare victory screen data
   */
  const prepareVictoryScreen = () => {
    const playerResults = players.map((p, index) => ({
      playerId: p.playerId,
      displayName: p.displayName,
      score: p.score,
      rank: index + 1,
      challengesCompleted: p.challengesCompleted,
      maxStreak: p.streakCount,
      roleCardsUsed: 0, // Would track this
      synergiesActivated: 0, // Would track this
      perfectChallenges: 0, // Would track this
    })).sort((a, b) => b.score - a.score);

    setVictoryData({
      playerResults,
      gameStats: {
        totalTurns: currentTurn,
        gameDuration: Date.now() - gameStartTime,
        totalChallengesAttempted: currentTurn,
        industryName,
      }
    });

    setShowVictoryScreen(true);
  };

  /**
   * Handle play again
   */
  const handlePlayAgain = async () => {
    // Reset game state and create new session
    setShowVictoryScreen(false);
    setVictoryData(null);
    setGamePhase('waiting');
    // Would reinitialize game
  };

  /**
   * Handle player ready state
   */
  const handlePlayerReady = (playerIdReady: string) => {
    setPlayers(prev => prev.map(p =>
      p.playerId === playerIdReady
        ? { ...p, isReady: !p.isReady }
        : p
    ));
  };

  /**
   * Render game board
   */
  const renderGameBoard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Players & Scores */}
      <div className="space-y-4">
        {/* Leaderboard */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Leaderboard
          </h3>
          <div className="space-y-2">
            {players
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <motion.div
                  key={player.playerId}
                  layout
                  className={`
                    flex items-center justify-between p-3 rounded-lg transition-all
                    ${player.isCurrentTurn
                      ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 ring-2 ring-purple-500'
                      : player.playerId === playerId
                      ? 'bg-purple-50 dark:bg-purple-900/20'
                      : 'bg-gray-50 dark:bg-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{player.displayName}</p>
                        {player.isCurrentTurn && (
                          <Activity className="w-4 h-4 text-purple-600 animate-pulse" />
                        )}
                      </div>
                      {player.streakCount > 0 && (
                        <p className="text-xs text-orange-500 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {player.streakCount} streak
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{player.score}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Shield className="w-3 h-3" />
                      {player.roleCards}
                    </div>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>

        {/* Game Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Turn</span>
            <span className="font-bold text-lg">{currentTurn}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Room</span>
            <span className="font-mono font-bold">{roomCode}</span>
          </div>
          {turnTimer !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Timer</span>
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${turnTimer <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
                <span className={`text-xl font-bold ${turnTimer <= 10 ? 'text-red-500' : ''}`}>
                  {turnTimer}s
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Challenge Area */}
      <div className="space-y-6">
        {/* Turn Indicator */}
        {isMyTurn && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-xl text-center font-bold text-lg shadow-lg"
          >
            🎯 Your Turn!
          </motion.div>
        )}

        {/* Challenge Selection Phase */}
        {turnPhase === 'selecting_challenge' && (
          <ChallengeSelectionPanel
            challenges={centerChallenges}
            isMyTurn={isMyTurn}
            onSelectChallenge={handleSelectChallenge}
            selectedChallengeId={selectedChallengeId}
            industryColorScheme={industry?.color_scheme}
          />
        )}

        {/* Active Challenge Display */}
        {activeChallenge && turnPhase !== 'selecting_challenge' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold">{activeChallenge.title}</h3>
              <span className={`
                px-3 py-1 rounded-lg text-sm font-medium
                ${activeChallenge.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                  activeChallenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  activeChallenge.difficulty === 'hard' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'}
              `}>
                {activeChallenge.difficulty}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {activeChallenge.scenarioText}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{activeChallenge.minRolesRequired}-{activeChallenge.maxRolesAllowed} roles</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span>{activeChallenge.basePoints} pts</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Challenge Result */}
        <AnimatePresence>
          {lastResult && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`
                p-6 rounded-xl text-white shadow-xl
                ${lastResult.success
                  ? 'bg-gradient-to-r from-green-500 to-blue-500'
                  : 'bg-gradient-to-r from-red-500 to-orange-500'
                }
              `}
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
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="text-sm"
                  >
                    {bonus.description}: +{bonus.value}
                  </motion.p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Team Building */}
      <div className="space-y-4">
        {turnPhase === 'selecting_team' ? (
          <TeamBuildingPanel
            myRoleCards={myRoleCards}
            activeChallenge={activeChallenge}
            selectedTeam={selectedTeam}
            isMyTurn={isMyTurn}
            onToggleCard={toggleRoleCard}
            onSubmitTeam={handleSubmitTeam}
            industryColorScheme={industry?.color_scheme}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              My Role Cards ({myRoleCards.length})
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {myRoleCards.map((card) => (
                <motion.div
                  key={card.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-gradient-to-br from-purple-500 to-blue-500 text-white p-4 rounded-xl shadow-lg"
                >
                  <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                    {card.rarity}
                  </p>
                  <p className="font-bold text-sm mt-1 mb-2 line-clamp-2">
                    {card.roleName}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      <span className="font-bold">{card.basePower}</span>
                    </div>
                    <Star className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onLeave}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                DLCC: {industryName}
              </h1>
              <p className="text-purple-200">
                Room {roomCode} • Turn {currentTurn}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className={`
              flex items-center gap-2 px-3 py-1 rounded-lg
              ${connectionStatus === 'connected' ? 'bg-green-500/20 text-green-300' :
                connectionStatus === 'connecting' ? 'bg-yellow-500/20 text-yellow-300' :
                'bg-red-500/20 text-red-300'}
            `}>
              {connectionStatus === 'connected' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span className="text-sm font-medium capitalize">{connectionStatus}</span>
            </div>

            {/* Score Display */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <p className="text-xs text-purple-200">Your Score</p>
              <p className="text-2xl font-bold text-white">{myScore}</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              {errorMessage}
              <button
                onClick={() => setErrorMessage(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Content */}
        {gamePhase === 'waiting' && (
          <GameLobby
            sessionId={gameEngineRef.current?.getGameState()?.sessionId || ''}
            roomCode={roomCode}
            hostId={isHost ? playerId : players[0]?.playerId || playerId}
            currentPlayerId={playerId}
            industryName={industryName}
            maxPlayers={6}
            minPlayers={2}
            players={players.map(p => ({
              playerId: p.playerId,
              displayName: p.displayName,
              isReady: p.isReady,
              isOnline: p.isConnected,
              joinedAt: new Date().toISOString(),
            }))}
            onStartGame={handleStartGame}
            onPlayerReady={handlePlayerReady}
          />
        )}
        {gamePhase === 'playing' && renderGameBoard()}

        {/* Victory Screen */}
        {showVictoryScreen && victoryData && (
          <VictoryScreen
            playerResults={victoryData.playerResults}
            currentPlayerId={playerId}
            gameStats={victoryData.gameStats}
            onPlayAgain={handlePlayAgain}
            onReturnToLobby={onLeave}
          />
        )}

        {/* Multiplayer Synchronization */}
        {gamePhase === 'playing' && (
          <MultiplayerSync
            sessionId={gameEngineRef.current?.getGameState()?.sessionId || ''}
            currentPlayerId={playerId}
            players={players.map(p => ({
              playerId: p.playerId,
              displayName: p.displayName,
              isReady: p.isReady,
              isOnline: p.isConnected,
              joinedAt: new Date().toISOString(),
            }))}
            onPlayerJoin={(player) => {
              setPlayers(prev => [...prev, {
                playerId: player.playerId,
                displayName: player.displayName,
                score: 0,
                isCurrentTurn: false,
                isReady: false,
                isConnected: true,
                roleCards: 0,
                streakCount: 0,
                challengesCompleted: 0,
              }]);
            }}
            onPlayerLeave={(leavingPlayerId) => {
              setPlayers(prev => prev.filter(p => p.playerId !== leavingPlayerId));
            }}
            onGameEvent={(event) => {
              console.log('Game event:', event);
              // Handle game events
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedGameRoom;