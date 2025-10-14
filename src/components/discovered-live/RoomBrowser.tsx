/**
 * Room Browser Component
 * Lists available Discovered Live! multiplayer rooms
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, Trophy, Play, Eye } from 'lucide-react';
import { perpetualRoomManager } from '../../services/PerpetualRoomManager';
import type { PerpetualRoom } from '../../types/DiscoveredLiveMultiplayerTypes';

interface RoomBrowserProps {
  onRoomSelect: (roomCode: string) => void;
  featuredOnly?: boolean;
}

export const RoomBrowser: React.FC<RoomBrowserProps> = ({
  onRoomSelect,
  featuredOnly = true,
}) => {
  const [rooms, setRooms] = useState<PerpetualRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRooms();
  }, [featuredOnly]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedRooms = await perpetualRoomManager.getFeaturedRooms();
      setRooms(fetchedRooms);
    } catch (err) {
      console.error('Error loading rooms:', err);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={loadRooms}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Join a Live Room
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a room to join and compete with other players!
        </p>
      </div>

      {/* Room List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {rooms.map((room, index) => (
            <RoomCard
              key={room.id}
              room={room}
              onJoin={onRoomSelect}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No rooms available at the moment
          </p>
        </div>
      )}
    </div>
  );
};

interface RoomCardProps {
  room: PerpetualRoom;
  onJoin: (roomCode: string) => void;
  index: number;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onJoin, index }) => {
  const isActive = room.status === 'active';
  const isIntermission = room.status === 'intermission';

  // Calculate estimated wait time
  const getWaitTimeMessage = () => {
    if (isIntermission && room.nextGameStartsAt) {
      const now = new Date();
      const starts = new Date(room.nextGameStartsAt);
      const secondsUntilStart = Math.max(0, Math.floor((starts.getTime() - now.getTime()) / 1000));
      return `Next game in ${secondsUntilStart}s`;
    }

    if (isActive) {
      // Estimate based on average game duration
      const avgDuration = room.avgGameDurationSeconds || 300; // default 5 min
      return `~${Math.ceil(avgDuration / 60)} min wait`;
    }

    return 'Join now';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="relative"
    >
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
        {/* Status Indicator */}
        <div className="absolute top-4 right-4">
          {isActive && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-400 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              LIVE
            </div>
          )}
          {isIntermission && (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full text-xs font-semibold">
              <Clock className="w-3 h-3" />
              BREAK
            </div>
          )}
        </div>

        {/* Room Info */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {room.roomName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {room.roomCode}
          </p>
        </div>

        {/* Stats */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Users className="w-4 h-4" />
              Players
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {room.currentPlayerCount} / {room.maxPlayersPerGame}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Eye className="w-4 h-4" />
              Spectators
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {room.spectatorCount}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              Games Played
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {room.totalGamesPlayed}
            </span>
          </div>
        </div>

        {/* Game Number */}
        {isActive && (
          <div className="mb-4 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-center text-purple-700 dark:text-purple-300">
              Game #{room.currentGameNumber} in progress
            </p>
          </div>
        )}

        {/* Wait Time */}
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getWaitTimeMessage()}
          </p>
        </div>

        {/* Join Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onJoin(room.roomCode)}
          className={`
            w-full py-3 px-4 rounded-lg font-semibold text-white
            flex items-center justify-center gap-2
            transition-all duration-200
            ${
              isActive
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
            }
          `}
        >
          {isActive ? (
            <>
              <Eye className="w-5 h-5" />
              Join & Spectate
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Join Now!
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default RoomBrowser;
