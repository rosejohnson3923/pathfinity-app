/**
 * Game Lobby Component
 * Waiting room for players before game starts
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Copy,
  Check,
  Play,
  Clock,
  Crown,
  Loader2,
  UserCheck
} from 'lucide-react';
import { GameSessionPlayer } from '../../types/CareerChallengeTypes';
import { supabase } from '../../lib/supabase';

interface GameLobbyProps {
  sessionId: string;
  roomCode: string;
  hostId: string;
  currentPlayerId: string;
  industryName: string;
  maxPlayers: number;
  minPlayers: number;
  players: GameSessionPlayer[];
  onStartGame: () => void;
  onPlayerReady: (playerId: string) => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  sessionId,
  roomCode,
  hostId,
  currentPlayerId,
  industryName,
  maxPlayers,
  minPlayers,
  players,
  onStartGame,
  onPlayerReady
}) => {
  const [copied, setCopied] = useState(false);
  const [readyPlayers, setReadyPlayers] = useState<Set<string>>(new Set());
  const [countdown, setCountdown] = useState<number | null>(null);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const channelRef = useRef<any>(null);
  const isHost = currentPlayerId === hostId;
  const canStart = players.length >= minPlayers && readyPlayers.size === players.length;

  useEffect(() => {
    // Initialize supabase client and setup subscription
    const setupSubscriptions = async () => {
      const client = await supabase();
      setSupabaseClient(client);

      // Setup subscription for ready states
      const channel = client.channel(`lobby:${sessionId}`)
        .on('broadcast', { event: 'player_ready' }, ({ payload }: any) => {
          setReadyPlayers(prev => new Set(prev).add(payload.playerId));
        })
        .on('broadcast', { event: 'game_starting' }, ({ payload }: any) => {
          startCountdown();
        })
        .subscribe();

      channelRef.current = channel;
    };

    setupSubscriptions();

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [sessionId]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReady = async () => {
    const newReadyState = !readyPlayers.has(currentPlayerId);

    if (newReadyState) {
      setReadyPlayers(prev => new Set(prev).add(currentPlayerId));
    } else {
      setReadyPlayers(prev => {
        const updated = new Set(prev);
        updated.delete(currentPlayerId);
        return updated;
      });
    }

    // Broadcast ready state
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'player_ready',
        payload: { playerId: currentPlayerId, isReady: newReadyState }
      });
    }

    onPlayerReady(currentPlayerId);
  };

  const startCountdown = () => {
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStartGame = async () => {
    if (!isHost || !canStart) return;

    // Broadcast game starting
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'game_starting',
        payload: { startedBy: currentPlayerId }
      });
    }

    startCountdown();
    setTimeout(() => {
      onStartGame();
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Game Lobby</h1>
          <p className="text-blue-200">{industryName} Challenge</p>
        </motion.div>

        {/* Room Code */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-200 mb-1">Room Code</p>
              <p className="text-3xl font-bold text-white tracking-wider">
                {roomCode}
              </p>
            </div>
            <button
              onClick={copyRoomCode}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg
                       flex items-center gap-2 text-blue-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={20} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={20} />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Players List */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Users size={24} />
              Players ({players.length}/{maxPlayers})
            </h2>
            {players.length < minPlayers && (
              <p className="text-sm text-yellow-400">
                Need {minPlayers - players.length} more player(s)
              </p>
            )}
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {players.map((player, index) => (
                <motion.div
                  key={player.playerId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {player.playerId === hostId && (
                      <Crown size={20} className="text-yellow-400" />
                    )}
                    <span className="text-white font-medium">
                      {player.displayName}
                      {player.playerId === currentPlayerId && ' (You)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {readyPlayers.has(player.playerId) ? (
                      <span className="flex items-center gap-1 text-green-400">
                        <UserCheck size={18} />
                        Ready
                      </span>
                    ) : (
                      <span className="text-gray-400">Waiting...</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty slots */}
            {Array.from({ length: maxPlayers - players.length }).map((_, index) => (
              <motion.div
                key={`empty-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center justify-center p-3 border-2 border-dashed
                         border-white/20 rounded-lg"
              >
                <span className="text-gray-500">Waiting for player...</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-4"
        >
          {!isHost && (
            <button
              onClick={handleReady}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all
                       flex items-center justify-center gap-2 ${
                readyPlayers.has(currentPlayerId)
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {readyPlayers.has(currentPlayerId) ? (
                <>
                  <UserCheck size={20} />
                  Ready!
                </>
              ) : (
                <>
                  <Clock size={20} />
                  Click when Ready
                </>
              )}
            </button>
          )}

          {isHost && (
            <button
              onClick={handleStartGame}
              disabled={!canStart}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all
                       flex items-center justify-center gap-2 ${
                canStart
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canStart ? (
                <>
                  <Play size={20} />
                  Start Game
                </>
              ) : players.length < minPlayers ? (
                <>
                  <Users size={20} />
                  Waiting for Players...
                </>
              ) : (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Waiting for Ready...
                </>
              )}
            </button>
          )}
        </motion.div>

        {/* Countdown Overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50
                       flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="text-center"
              >
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-8xl font-bold text-white mb-4"
                >
                  {countdown}
                </motion.div>
                <p className="text-2xl text-blue-200">Game Starting...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GameLobby;