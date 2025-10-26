/**
 * Career Match - Lobby Page
 * Main entry point for Career Match multiplayer game
 *
 * Flow:
 * 1. Menu (difficulty selection)
 * 2. Lobby (waiting for players)
 * 3. Game (playing)
 * 4. Summary (game complete)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import CareerMatchLobby from '../components/career-match/CareerMatchLobby';
import CareerMatchGameBoard from '../components/career-match/CareerMatchGameBoard';
import CareerMatchGameSummary from '../components/career-match/CareerMatchGameSummary';
import CareerMatchService from '../services/CareerMatchService';
import CareerMatchRealtimeService from '../services/CareerMatchRealtimeService';
import '../design-system/index.css'; // Import glass design tokens
import type {
  CMPerpetualRoom,
  CMGameSession,
  CMSessionParticipant,
  CareerMatchDifficulty,
  CareerMatchEvent,
} from '../types/CareerMatchTypes';

type PageState = 'menu' | 'lobby' | 'playing' | 'summary';

export const CareerMatchLobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [pageState, setPageState] = useState<PageState>('menu');
  const [room, setRoom] = useState<CMPerpetualRoom | null>(null);
  const [session, setSession] = useState<CMGameSession | null>(null);
  const [participants, setParticipants] = useState<CMSessionParticipant[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Get player display name from user object (matches Executive Decision Room logic)
   */
  const getPlayerDisplayName = (): string => {
    if (!user) return 'Player';

    // Try to get name from full_name and convert to "First L." format
    if (user.full_name) {
      const nameParts = user.full_name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        return `${nameParts[0]} ${nameParts[nameParts.length - 1].charAt(0)}.`;
      }
      return nameParts[0];
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.email) {
      // Use email username as fallback
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    return 'Player';
  };

  // ============================================================================
  // MENU ACTIONS
  // ============================================================================

  const handleJoinGame = async (difficulty?: CareerMatchDifficulty) => {
    console.log('[CareerMatchTestPage] handleJoinGame called:', { user, difficulty });

    if (!user?.id) {
      console.error('[CareerMatchTestPage] No user ID:', user);
      setError('You must be logged in to play');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[CareerMatchTestPage] Calling joinGame...');
      // Auto-assign to available room
      const result = await CareerMatchService.joinGame({
        userId: user.id,
        displayName: getPlayerDisplayName(),
        difficulty
      });
      console.log('[CareerMatchTestPage] joinGame result:', result);

      setRoom(result.room);
      setSession(result.session);
      setParticipants(result.allParticipants);
      setIsHost(result.isHost);
      setPageState('lobby');

      // Don't subscribe here - Lobby component will handle subscriptions
    } catch (err: any) {
      setError(err.message || 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // LOBBY ACTIONS
  // ============================================================================

  const handleStartGame = async () => {
    if (!session) return;

    try {
      setLoading(true);
      setError(null);

      await CareerMatchService.startGameSession(session.id);

      // Unsubscribe test page callback - GameBoard will handle game events
      if (room) {
        CareerMatchRealtimeService.unsubscribeFromRoom(room.id, handleRealtimeEvent);
      }

      setPageState('playing');
    } catch (err: any) {
      setError(err.message || 'Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = () => {
    if (room) {
      CareerMatchRealtimeService.unsubscribeFromRoom(room.id);
    }
    setRoom(null);
    setSession(null);
    setParticipants([]);
    setIsHost(false);
    // Return to Discovered Live arcade instead of menu
    navigate('/discovered-live');
  };

  // ============================================================================
  // GAME ACTIONS
  // ============================================================================

  const handleGameEnd = async () => {
    setPageState('summary');

    // Fetch final game results
    if (session) {
      try {
        const finalParticipants = await CareerMatchService.getSessionParticipants(session.id);
        setParticipants(finalParticipants);
      } catch (err) {
        console.error('Failed to fetch final results:', err);
      }
    }
  };

  // ============================================================================
  // REALTIME EVENT HANDLING
  // ============================================================================

  const handleRealtimeEvent = (event: CareerMatchEvent) => {
    console.log('[CareerMatchTestPage] Realtime event:', event);

    switch (event.type) {
      case 'player_joined':
        // Refresh participants list
        if (session) {
          CareerMatchService.getSessionParticipants(session.id).then(setParticipants);
        }
        break;

      case 'player_left':
        // Refresh participants list
        if (session) {
          CareerMatchService.getSessionParticipants(session.id).then(setParticipants);
        }
        break;

      case 'game_started':
        // Unsubscribe test page callback - GameBoard will handle game events
        if (room) {
          CareerMatchRealtimeService.unsubscribeFromRoom(room.id, handleRealtimeEvent);
        }
        setPageState('playing');
        break;

      case 'game_ended':
        setPageState('summary');
        break;
    }
  };

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      if (room) {
        CareerMatchRealtimeService.unsubscribeFromRoom(room.id);
      }
    };
  }, [room]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-white/80 mb-6">Please log in to play Career Match</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all hover:scale-105"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // MENU STATE
  if (pageState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center p-4">
        <div className="glass-card max-w-lg w-full text-center p-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎴 Career Match</h1>
          <p className="text-white/80 text-lg mb-2">Memory Matching Game</p>
          <p className="text-white/70 text-sm mb-8">
            Select a difficulty level to join a game. You'll be automatically placed in the next available room!
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg mb-4">Select Difficulty</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => handleJoinGame('easy')}
                disabled={loading}
                className="glass-game p-4 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-bold text-lg">Easy</div>
                <div className="text-xs text-white/70">12 cards</div>
                <div className="text-xs text-white/70">(3×4)</div>
              </button>
              <button
                onClick={() => handleJoinGame('medium')}
                disabled={loading}
                className="glass-game p-4 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-bold text-lg">Medium</div>
                <div className="text-xs text-white/70">20 cards</div>
                <div className="text-xs text-white/70">(4×5)</div>
              </button>
              <button
                onClick={() => handleJoinGame('hard')}
                disabled={loading}
                className="glass-game p-4 text-white hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-bold text-lg">Hard</div>
                <div className="text-xs text-white/70">30 cards</div>
                <div className="text-xs text-white/70">(5×6)</div>
              </button>
            </div>
          </div>

          <div className="text-white/60 text-sm font-semibold my-4">OR</div>

          <button
            onClick={() => handleJoinGame()}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {loading ? 'Finding Room...' : 'Quick Play (Any Difficulty)'}
          </button>
          <p className="text-white/60 text-xs mb-6">
            Join any available room regardless of difficulty
          </p>

          <button
            onClick={() => navigate('/discovered-live')}
            className="glass-card-sm px-6 py-3 text-white hover:scale-105 transition-transform w-full"
          >
            ← Back to Arcade
          </button>
        </div>
      </div>
    );
  }

  // LOBBY STATE
  if (pageState === 'lobby' && room && session) {
    return (
      <CareerMatchLobby
        room={room}
        session={session}
        participants={participants}
        currentUserId={user.id}
        isHost={isHost}
        onStartGame={handleStartGame}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  // PLAYING STATE
  if (pageState === 'playing' && session) {
    return (
      <CareerMatchGameBoard
        sessionId={session.id}
        currentUserId={user.id}
        onGameEnd={handleGameEnd}
      />
    );
  }

  // SUMMARY STATE
  if (pageState === 'summary' && session && room) {
    // Transform participants into player results format
    const totalPairs = room.difficulty === 'easy' ? 6 : room.difficulty === 'medium' ? 10 : 15;

    const playerResults = participants
      .sort((a, b) => b.arcade_xp - a.arcade_xp) // Sort by XP (highest first)
      .map((p, index) => ({
        id: p.id,
        name: p.player_name,
        xp: p.arcade_xp,
        pairsMatched: p.pairs_matched,
        totalPairs: totalPairs,
        maxStreak: p.max_streak,
        isCurrentUser: p.user_id === user?.id,
        rank: index + 1,
      }));

    const currentUserData = participants.find(p => p.user_id === user?.id);

    return (
      <CareerMatchGameSummary
        playerResults={playerResults}
        totalPairs={totalPairs}
        userXPEarned={currentUserData?.arcade_xp || 0}
        userPairsMatched={currentUserData?.pairs_matched || 0}
        userMaxStreak={currentUserData?.max_streak || 0}
        onPlayAgain={() => {
          setPageState('menu');
          setRoom(null);
          setSession(null);
          setParticipants([]);
        }}
        onReturnToArcade={() => navigate('/discovered-live')}
      />
    );
  }

  return null;
};

export default CareerMatchLobbyPage;
