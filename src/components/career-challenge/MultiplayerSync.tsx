/**
 * Multiplayer Synchronization Component
 * Handles real-time updates and player state synchronization
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Wifi,
  WifiOff,
  UserPlus,
  UserMinus,
  Clock,
  Zap
} from 'lucide-react';
import { GameSessionPlayer, GameEvent } from '../../types/CareerChallengeTypes';
import { supabase } from '../../lib/supabase';

interface MultiplayerSyncProps {
  sessionId: string;
  currentPlayerId: string;
  players: GameSessionPlayer[];
  onPlayerJoin?: (player: GameSessionPlayer) => void;
  onPlayerLeave?: (playerId: string) => void;
  onGameEvent?: (event: GameEvent) => void;
}

export const MultiplayerSync: React.FC<MultiplayerSyncProps> = ({
  sessionId,
  currentPlayerId,
  players: initialPlayers,
  onPlayerJoin,
  onPlayerLeave,
  onGameEvent
}) => {
  const [players, setPlayers] = useState<GameSessionPlayer[]>(initialPlayers);
  const [isConnected, setIsConnected] = useState(true);
  const [recentEvents, setRecentEvents] = useState<GameEvent[]>([]);
  const [channel, setChannel] = useState<any>(null);

  // Setup real-time subscription
  useEffect(() => {
    if (!sessionId) return;

    const gameChannel = supabase.channel(`game:${sessionId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: currentPlayerId }
      }
    });

    // Handle presence changes
    gameChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = gameChannel.presenceState();
        handlePresenceSync(presenceState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        handlePlayerJoin(key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        handlePlayerLeave(key);
      })
      .on('broadcast', { event: 'game_event' }, ({ payload }) => {
        handleGameEvent(payload);
      })
      .on('broadcast', { event: 'player_action' }, ({ payload }) => {
        handlePlayerAction(payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          // Send our presence
          await gameChannel.track({
            playerId: currentPlayerId,
            online_at: new Date().toISOString(),
          });
        } else {
          setIsConnected(status === 'CHANNEL_ERROR' ? false : true);
        }
      });

    setChannel(gameChannel);

    return () => {
      gameChannel.unsubscribe();
    };
  }, [sessionId, currentPlayerId]);

  const handlePresenceSync = (presenceState: any) => {
    // Update player online status based on presence
    const onlinePlayerIds = Object.keys(presenceState);
    setPlayers(prev => prev.map(p => ({
      ...p,
      isOnline: onlinePlayerIds.includes(p.playerId)
    })));
  };

  const handlePlayerJoin = (playerId: string, presences: any) => {
    // Animate player joining
    const event: GameEvent = {
      type: 'player_joined',
      playerId,
      timestamp: new Date().toISOString(),
      data: { displayName: presences[0]?.displayName }
    };

    addRecentEvent(event);
    onPlayerJoin?.(presences[0]);
  };

  const handlePlayerLeave = (playerId: string) => {
    // Animate player leaving
    const event: GameEvent = {
      type: 'player_left',
      playerId,
      timestamp: new Date().toISOString()
    };

    addRecentEvent(event);
    onPlayerLeave?.(playerId);
  };

  const handleGameEvent = (event: GameEvent) => {
    addRecentEvent(event);
    onGameEvent?.(event);
  };

  const handlePlayerAction = (action: any) => {
    // Handle specific player actions (challenge attempts, etc.)
    console.log('Player action:', action);
  };

  const addRecentEvent = (event: GameEvent) => {
    setRecentEvents(prev => {
      const updated = [event, ...prev].slice(0, 5);
      return updated;
    });

    // Auto-remove events after 5 seconds
    setTimeout(() => {
      setRecentEvents(prev => prev.filter(e => e !== event));
    }, 5000);
  };

  const broadcastAction = async (action: any) => {
    if (!channel) return;

    await channel.send({
      type: 'broadcast',
      event: 'player_action',
      payload: {
        playerId: currentPlayerId,
        action,
        timestamp: new Date().toISOString()
      }
    });
  };

  return (
    <div className="fixed top-4 right-4 z-40 space-y-2">
      {/* Connection Status */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
          isConnected
            ? 'bg-green-500/10 text-green-400'
            : 'bg-red-500/10 text-red-400'
        }`}
      >
        {isConnected ? (
          <>
            <Wifi size={16} />
            <span className="text-sm">Connected</span>
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span className="text-sm">Reconnecting...</span>
          </>
        )}
      </motion.div>

      {/* Player Count */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm flex items-center gap-2"
      >
        <Users size={16} className="text-blue-400" />
        <span className="text-sm text-gray-300">
          {players.filter(p => p.isOnline).length} / {players.length} Online
        </span>
      </motion.div>

      {/* Recent Events */}
      <AnimatePresence mode="popLayout">
        {recentEvents.map((event, index) => (
          <motion.div
            key={`${event.timestamp}-${index}`}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30
            }}
            className="px-3 py-2 rounded-lg bg-white/5 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              {getEventIcon(event.type)}
              <span className="text-sm text-gray-300">
                {getEventMessage(event)}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Helper functions for event display
const getEventIcon = (type: string) => {
  switch (type) {
    case 'player_joined':
      return <UserPlus size={16} className="text-green-400" />;
    case 'player_left':
      return <UserMinus size={16} className="text-red-400" />;
    case 'turn_started':
      return <Clock size={16} className="text-blue-400" />;
    case 'challenge_completed':
      return <Zap size={16} className="text-yellow-400" />;
    default:
      return <Zap size={16} className="text-gray-400" />;
  }
};

const getEventMessage = (event: GameEvent): string => {
  switch (event.type) {
    case 'player_joined':
      return `${event.data?.displayName || 'Player'} joined`;
    case 'player_left':
      return `Player left`;
    case 'turn_started':
      return `${event.data?.playerName || 'Player'}'s turn`;
    case 'challenge_completed':
      return `Challenge completed!`;
    case 'challenge_failed':
      return `Challenge failed`;
    default:
      return 'Game event';
  }
};

export default MultiplayerSync;