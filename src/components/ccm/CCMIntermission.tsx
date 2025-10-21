/**
 * CCM Intermission Screen
 * 15-second lobby between perpetual room games
 *
 * Features:
 * - Countdown timer until next game
 * - Previous game summary
 * - "Stay" or "Leave" options
 * - AI player fill indicators
 * - Automatic transition to next game
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Trophy,
  Star,
  Users,
  Play,
  ArrowLeft,
  Bot,
  Zap,
  Medal
} from 'lucide-react';
import { ccmRealtimeService } from '../../services/CCMRealtimeService';
import type { CCMEvent } from '../../services/CCMRealtimeService';
import '../../design-system/index.css';

interface PreviousGameResult {
  playerName: string;
  score: number;
  rank: number;
  isCurrentUser: boolean;
}

interface CCMIntermissionProps {
  roomId: string;
  playerId: string;
  playerName: string;
  roomName: string;
  roomCode: string;
  gameNumber: number;
  previousGameResults: PreviousGameResult[];
  currentPlayerCount: number;
  maxPlayers: number;
  countdownSeconds: number;
  onStay: () => void;
  onLeave: () => void;
}

export const CCMIntermission: React.FC<CCMIntermissionProps> = ({
  roomId,
  playerId,
  playerName,
  roomName,
  roomCode,
  gameNumber,
  previousGameResults,
  currentPlayerCount,
  maxPlayers,
  countdownSeconds: initialCountdown,
  onStay,
  onLeave
}) => {
  const [countdown, setCountdown] = useState(initialCountdown);
  const [staying, setStaying] = useState(true);

  /**
   * Handle leaving the room
   */
  const handleLeaveRoom = async () => {
    setStaying(false);

    try {
      const response = await fetch(`/api/ccm/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      });

      const result = await response.json();
      if (result.success) {
        console.log('Left room successfully:', result.message);

        // Broadcast player left (already done by API, but doing it here too for immediate feedback)
        await ccmRealtimeService.broadcastPlayerLeft(
          roomId,
          playerId,
          playerName,
          currentPlayerCount - 1
        );
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    } finally {
      onLeave();
    }
  };

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-start next game when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && staying) {
      onStay();
    }
  }, [countdown, staying, onStay]);

  /**
   * Subscribe to real-time room events
   */
  useEffect(() => {
    const subscribeToRoom = async () => {
      try {
        console.log(`[CCMIntermission] Subscribing to room ${roomId}`);

        // Subscribe to room with event handlers
        await ccmRealtimeService.subscribeToRoom(roomId, {
          player_joined: (event: CCMEvent) => {
            console.log('[CCMIntermission] Player joined:', event.data);
            // Note: Parent component should update player count
            // We could emit an event to parent or refetch room status
          },

          player_left: (event: CCMEvent) => {
            console.log('[CCMIntermission] Player left:', event.data);
            const { displayName, remainingPlayers } = event.data;
            // Show notification
            console.log(`${displayName} left. ${remainingPlayers} players remaining.`);
          },

          game_started: (event: CCMEvent) => {
            console.log('[CCMIntermission] Game started:', event.data);
            // Auto-transition to game if staying
            if (staying) {
              onStay();
            }
          },

          room_status_changed: (event: CCMEvent) => {
            console.log('[CCMIntermission] Room status changed:', event.data);
            // Room might have gone dormant or changed state
          },
        });

        // Track presence
        await ccmRealtimeService.trackPresence(roomId, playerId, {
          player_name: playerName,
          status: 'intermission',
          online_at: new Date().toISOString()
        });

        console.log(`[CCMIntermission] Successfully subscribed to room ${roomId}`);
      } catch (error) {
        console.error('[CCMIntermission] Error subscribing to room:', error);
      }
    };

    subscribeToRoom();

    // Cleanup on unmount
    return () => {
      console.log(`[CCMIntermission] Unsubscribing from room ${roomId}`);
      ccmRealtimeService.unsubscribeFromRoom(roomId);
    };
  }, [roomId, playerId, staying]);


  // Calculate how many AI players will fill
  const humanPlayers = currentPlayerCount;
  const aiPlayersNeeded = Math.max(0, 4 - humanPlayers); // Minimum 4 players per game

  // Get rank display and color
  const getRankDisplay = (rank: number): string => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
  };

  const getRankColor = (rank: number): string => {
    if (rank === 1) return 'glass-icon-accent';
    if (rank === 2) return 'glass-text-secondary';
    if (rank === 3) return 'glass-icon-warning';
    return 'glass-text-muted';
  };

  const getRankIcon = (rank: number): string => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 p-6 flex items-center justify-center">
      {/* Main Content */}
      <div className="max-w-4xl w-full">

        {/* Room Header */}
        <motion.div
          className="glass-card text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold glass-text-primary mb-2">
            {roomName}
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm glass-text-tertiary">
            <span className="px-3 py-1 glass-subtle rounded-lg font-mono">
              {roomCode}
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              Game #{gameNumber}
            </span>
          </div>
        </motion.div>

        {/* Countdown Timer */}
        <motion.div
          className="glass-game text-center mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Clock className="w-6 h-6 glass-icon-primary" />
            <h2 className="text-xl font-bold glass-text-primary">
              Next Game Starting In
            </h2>
          </div>

          <motion.div
            className="text-8xl font-bold glass-icon-accent mb-2"
            key={countdown}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {countdown}
          </motion.div>

          <p className="glass-text-tertiary">seconds</p>
        </motion.div>

        {/* Player Count & AI Fill Info */}
        <motion.div
          className="glass-card mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 glass-icon-primary" />
              <div>
                <div className="font-bold glass-text-primary text-lg">
                  {humanPlayers} Human Player{humanPlayers !== 1 ? 's' : ''}
                </div>
                <div className="glass-text-tertiary text-sm">
                  {maxPlayers - humanPlayers} slot{maxPlayers - humanPlayers !== 1 ? 's' : ''} available
                </div>
              </div>
            </div>

            {aiPlayersNeeded > 0 && (
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6 glass-icon-success" />
                <div>
                  <div className="font-bold glass-text-primary text-lg">
                    +{aiPlayersNeeded} AI Player{aiPlayersNeeded !== 1 ? 's' : ''}
                  </div>
                  <div className="glass-text-tertiary text-sm">
                    Filling to minimum
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Player dots visualization */}
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/10 dark:border-white/5">
            {Array.from({ length: maxPlayers }).map((_, i) => (
              <motion.div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < humanPlayers
                    ? 'bg-blue-500'
                    : i < humanPlayers + aiPlayersNeeded
                    ? 'bg-green-500'
                    : 'bg-white/20 dark:bg-white/10'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-2 text-xs glass-text-tertiary">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Human
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              AI
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-white/20 dark:bg-white/10" />
              Empty
            </div>
          </div>
        </motion.div>

        {/* Previous Game Results */}
        {previousGameResults.length > 0 && (
          <motion.div
            className="glass-card mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 glass-icon-accent" />
              <h3 className="text-xl font-bold glass-text-primary">
                Previous Game Results
              </h3>
            </div>

            <div className="space-y-2">
              {previousGameResults.slice(0, 5).map((result, index) => (
                <motion.div
                  key={index}
                  className={`glass-subtle p-3 rounded-lg flex items-center justify-between ${
                    result.isCurrentUser ? 'ring-2 ring-yellow-400' : ''
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-2xl ${getRankColor(result.rank)}`}>
                      {getRankIcon(result.rank) || <Medal className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold glass-text-primary">
                          {result.playerName}
                        </span>
                        {result.isCurrentUser && (
                          <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className={`text-sm ${getRankColor(result.rank)}`}>
                        {getRankDisplay(result.rank)} Place
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 glass-icon-accent font-bold text-xl">
                    <Star className="w-5 h-5" />
                    {result.score.toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          className="grid md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            onClick={onStay}
            disabled={!staying}
            className={`font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg transition-all ${
              staying
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                : 'glass-subtle glass-text-muted cursor-not-allowed'
            }`}
            whileHover={staying ? { scale: 1.02 } : {}}
            whileTap={staying ? { scale: 0.98 } : {}}
          >
            <Play className="w-6 h-6" fill="currentColor" />
            {staying ? 'Ready to Play' : 'Leaving...'}
          </motion.button>

          <motion.button
            onClick={handleLeaveRoom}
            disabled={!staying}
            className="glass-card hover:scale-[1.02] transition-transform font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg glass-text-primary"
            whileHover={staying ? { scale: 1.02 } : {}}
            whileTap={staying ? { scale: 0.98 } : {}}
          >
            <ArrowLeft className="w-6 h-6" />
            Leave Room
          </motion.button>
        </motion.div>

        {/* Auto-start indicator */}
        {staying && countdown > 0 && (
          <motion.div
            className="text-center mt-4 glass-text-tertiary text-sm flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Zap className="w-4 h-4" />
            Game will start automatically when timer reaches zero
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CCMIntermission;
