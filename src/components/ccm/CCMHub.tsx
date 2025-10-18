/**
 * CCM (Career Challenge Multiplayer) Hub
 * Perpetual room browser and join interface
 *
 * Key differences from CC:
 * - Perpetual rooms (always-on) instead of player-created rooms
 * - No "create room" option
 * - Shows game status (active/intermission)
 * - Queue system for joining during active games
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ccmService } from '../../services/CCMService';
import {
  Users,
  Clock,
  Play,
  Trophy,
  ArrowLeft,
  Zap,
  Globe,
  Star,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface PerpetualRoom {
  id: string;
  roomCode: string;
  roomName: string;
  description: string;
  status: 'active' | 'intermission';
  currentPlayerCount: number;
  maxPlayersPerGame: number;
  currentGameNumber: number;
  nextGameStartsAt?: string;
  themeColor: string;
  difficultyRange: string;
  totalGamesPlayed: number;
}

interface CCMHubProps {
  playerId: string;
  playerName: string;
  onBack: () => void;
  onJoinRoom: (roomId: string, roomCode: string) => void;
}

export const CCMHub: React.FC<CCMHubProps> = ({
  playerId,
  playerName,
  onBack,
  onJoinRoom
}) => {
  const [rooms, setRooms] = useState<PerpetualRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<PerpetualRoom | null>(null);
  const [joining, setJoining] = useState(false);

  // Load featured perpetual rooms
  useEffect(() => {
    loadRooms();

    // Refresh room status every 5 seconds
    const interval = setInterval(loadRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadRooms = async () => {
    try {
      await ccmService.initialize();
      const featuredRooms = await ccmService.getFeaturedRooms();

      setRooms(featuredRooms.map(room => ({
        id: room.id,
        roomCode: room.room_code,
        roomName: room.room_name,
        description: room.description || 'Multiplayer career challenge',
        status: room.status,
        currentPlayerCount: room.current_player_count || 0,
        maxPlayersPerGame: room.max_players_per_game || 8,
        currentGameNumber: room.current_game_number || 1,
        nextGameStartsAt: room.next_game_starts_at,
        themeColor: room.theme_color || 'blue',
        difficultyRange: room.difficulty_range || 'All Levels',
        totalGamesPlayed: room.total_games_played || 0,
      })));

      setLoading(false);
    } catch (err) {
      console.error('Failed to load rooms:', err);
      setError('Failed to load rooms');
      setLoading(false);
    }
  };

  const handleJoinRoom = async (room: PerpetualRoom) => {
    setJoining(true);
    setError(null);

    try {
      const result = await ccmService.joinRoom(room.id, playerId, playerName);

      if (result.success) {
        onJoinRoom(room.id, room.roomCode);
      } else {
        setError(result.message || 'Failed to join room');
      }
    } catch (err: any) {
      console.error('Error joining room:', err);
      setError(err.message || 'Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  // Get color scheme for room
  const getColorScheme = (color: string) => {
    const schemes: Record<string, string> = {
      blue: 'from-blue-600 to-indigo-600',
      purple: 'from-purple-600 to-pink-600',
      green: 'from-green-600 to-emerald-600',
      orange: 'from-orange-600 to-red-600',
    };
    return schemes[color] || schemes.blue;
  };

  // Get icon for room
  const getRoomIcon = (roomCode: string) => {
    if (roomCode.includes('GLOBAL')) return Globe;
    if (roomCode.includes('SKILL')) return TrendingUp;
    if (roomCode.includes('CASUAL')) return Star;
    return Trophy;
  };

  // Calculate countdown for intermission
  const getCountdown = (nextGameStartsAt: string | undefined) => {
    if (!nextGameStartsAt) return null;

    const now = new Date().getTime();
    const target = new Date(nextGameStartsAt).getTime();
    const diff = Math.max(0, target - now);
    const seconds = Math.floor(diff / 1000);

    return seconds;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                Career Challenge Multiplayer
                <span className="px-3 py-1 bg-green-500/20 rounded-lg border border-green-500/50 text-green-300 text-sm font-medium">
                  24/7 LIVE
                </span>
              </h1>
              <p className="text-purple-200">Join perpetual rooms • Drop-in anytime</p>
            </div>
          </div>

          <div className="text-white/80 text-right">
            <p className="text-sm">Playing as</p>
            <p className="font-semibold">{playerName}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-white text-xl">Loading rooms...</div>
          </div>
        ) : (
          <>
            {/* Info Banner */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium">Perpetual Room System</p>
                  <p className="text-white/70 text-sm mt-1">
                    Games run continuously with 15-second intermissions. Join during intermission to play immediately,
                    or queue up during an active game to join the next one!
                  </p>
                </div>
              </div>
            </div>

            {/* Room List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Featured Rooms ({rooms.length})
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room, index) => {
                  const IconComponent = getRoomIcon(room.roomCode);
                  const countdown = getCountdown(room.nextGameStartsAt);

                  return (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:scale-[1.02] transition-all duration-200 relative"
                    >
                      {/* Status Badge - Top Right */}
                      <div className="absolute top-4 right-4">
                        {room.status === 'intermission' ? (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-500 text-white animate-pulse">
                            OPEN
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-orange-500 text-white">
                            ACTIVE
                          </span>
                        )}
                      </div>

                      {/* Room Icon */}
                      <div className="flex items-center justify-center mb-4">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${getColorScheme(room.themeColor)} flex items-center justify-center shadow-lg`}>
                          <IconComponent className="w-10 h-10 text-white" />
                        </div>
                      </div>

                      {/* Room Name */}
                      <h4 className="text-2xl font-bold text-center mb-2">
                        {room.roomName}
                      </h4>

                      {/* Room Code */}
                      <div className="flex justify-center mb-2">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
                          {room.roomCode}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4 min-h-[3rem]">
                        {room.description}
                      </p>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-gray-100 dark:bg-gray-700 text-center py-2 px-1 rounded-lg">
                          <Users className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                          <div className="text-gray-600 dark:text-gray-400 font-semibold text-xs">
                            {room.currentPlayerCount}/{room.maxPlayersPerGame}
                          </div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 text-center py-2 px-1 rounded-lg">
                          <Trophy className="w-4 h-4 text-yellow-500 mx-auto mb-1" />
                          <div className="text-gray-600 dark:text-gray-400 font-semibold text-xs">
                            Game #{room.currentGameNumber}
                          </div>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 text-center py-2 px-1 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-green-500 mx-auto mb-1" />
                          <div className="text-gray-600 dark:text-gray-400 font-semibold text-xs">
                            {room.totalGamesPlayed} played
                          </div>
                        </div>
                      </div>

                      {/* Status Info */}
                      {room.status === 'intermission' && countdown !== null && (
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Next game in {countdown}s
                        </p>
                      )}

                      {/* Join Button */}
                      {room.currentPlayerCount >= room.maxPlayersPerGame ? (
                        <div className="w-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 text-center py-3 px-6 rounded-xl font-bold cursor-not-allowed">
                          Room Full
                        </div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleJoinRoom(room)}
                          disabled={joining}
                          className={`w-full font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 ${
                            room.status === 'intermission'
                              ? `bg-gradient-to-r ${getColorScheme(room.themeColor)} text-white`
                              : 'bg-white/10 text-white border border-white/30'
                          }`}
                        >
                          {room.status === 'intermission' ? (
                            <>
                              <Play className="w-5 h-5" fill="currentColor" />
                              Join Now
                            </>
                          ) : (
                            <>
                              <Clock className="w-5 h-5" />
                              Queue Up
                            </>
                          )}
                        </motion.button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CCMHub;
