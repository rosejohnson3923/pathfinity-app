/**
 * Career Match Lobby Component
 * Pre-game waiting room with auto-assignment (perpetual rooms)
 * Shows room info, participant list, and game settings
 */

import React, { useState, useEffect, useCallback } from 'react';
import styles from './CareerMatchLobby.module.css';
import CareerMatchRealtimeService from '@/services/CareerMatchRealtimeService';
import type {
  CMPerpetualRoom,
  CMGameSession,
  CMSessionParticipant,
  CareerMatchEvent,
} from '@/types/CareerMatchTypes';

interface CareerMatchLobbyProps {
  room: CMPerpetualRoom;
  session: CMGameSession;
  participants: CMSessionParticipant[];
  currentUserId: string;
  isHost: boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

const CareerMatchLobby: React.FC<CareerMatchLobbyProps> = ({
  room: initialRoom,
  session: initialSession,
  participants: initialParticipants,
  currentUserId,
  isHost,
  onStartGame,
  onLeaveRoom,
}) => {
  const [room, setRoom] = useState(initialRoom);
  const [session, setSession] = useState(initialSession);
  const [participants, setParticipants] = useState(initialParticipants);

  // ============================================================================
  // REALTIME SUBSCRIPTIONS
  // ============================================================================

  const handleRealtimeEvent = useCallback((event: CareerMatchEvent) => {
    console.log('[Lobby] Realtime event:', event);

    switch (event.type) {
      case 'player_joined':
        // Refresh participant list from parent
        break;

      case 'player_left':
        // Refresh participant list from parent
        break;

      case 'game_started':
        // Game has started, parent component should navigate to game
        break;
    }
  }, []);

  useEffect(() => {
    CareerMatchRealtimeService.subscribeToRoom(room.id, handleRealtimeEvent);

    return () => {
      // Only remove this component's callback, keep channels alive for GameBoard
      CareerMatchRealtimeService.unsubscribeFromRoom(room.id, handleRealtimeEvent);
    };
  }, [room.id, handleRealtimeEvent]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const handleStartClick = () => {
    if (participants.length < 1) {
      alert('Need at least 1 player to start');
      return;
    }
    onStartGame();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const difficultyInfo = {
    easy: { cards: 12, timeLimit: 'No limit', gridSize: '3×4' },
    medium: { cards: 20, timeLimit: '5 minutes', gridSize: '4×5' },
    hard: { cards: 30, timeLimit: '8 minutes', gridSize: '5×6' },
  };

  const info = difficultyInfo[room.difficulty];

  return (
    <div className={styles.lobbyContainer}>
      <div className={styles.lobbyCard}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Career Match</h1>
          <div className={styles.subtitle}>{room.room_name}</div>
          <div className={styles.roomInfo}>
            Game #{session.game_number} • {room.room_code}
          </div>
        </div>

        {/* Auto-Assignment Notice */}
        <div className={styles.autoAssignNotice}>
          <div className={styles.noticeIcon}>✨</div>
          <div className={styles.noticeText}>
            You've been automatically assigned to this room!
            {participants.length < room.max_players_per_game && (
              <> Waiting for more players...</>
            )}
          </div>
        </div>

        {/* Game Settings */}
        <div className={styles.settingsSection}>
          <h3>Game Settings</h3>
          <div className={styles.settingsGrid}>
            <div className={styles.settingItem}>
              <div className={styles.settingLabel}>Difficulty</div>
              <div className={styles.settingValue}>
                {room.difficulty.charAt(0).toUpperCase() + room.difficulty.slice(1)}
              </div>
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingLabel}>Cards</div>
              <div className={styles.settingValue}>{info.cards}</div>
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingLabel}>Grid</div>
              <div className={styles.settingValue}>{info.gridSize}</div>
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingLabel}>Time Limit</div>
              <div className={styles.settingValue}>{info.timeLimit}</div>
            </div>
          </div>
        </div>

        {/* Participants List */}
        <div className={styles.playersSection}>
          <h3>
            Participants ({participants.length}/{room.max_players_per_game})
          </h3>
          <div className={styles.playersList}>
            {participants.map((participant) => (
              <div
                key={participant.id}
                className={`${styles.playerItem} ${
                  participant.user_id === currentUserId ? styles.currentUser : ''
                }`}
              >
                <div className={styles.playerAvatar}>
                  👤
                </div>
                <div className={styles.playerInfo}>
                  <div className={styles.playerName}>
                    {participant.display_name}
                    {isHost && participant.user_id === currentUserId && (
                      <span className={styles.hostBadge}>HOST</span>
                    )}
                    {participant.user_id === currentUserId && (
                      <span className={styles.youBadge}>YOU</span>
                    )}
                  </div>
                  <div className={styles.playerStatus}>Ready</div>
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: room.max_players_per_game - participants.length }).map((_, i) => (
              <div key={`empty-${i}`} className={styles.emptySlot}>
                <div className={styles.emptyAvatar}>⏳</div>
                <div className={styles.emptyText}>Waiting for players...</div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actionsSection}>
          {isHost ? (
            <>
              <button
                className={styles.startButton}
                onClick={handleStartClick}
                disabled={participants.length < 1}
              >
                Start Game
              </button>
              {participants.length < 1 && (
                <div className={styles.startHint}>
                  Waiting for at least one player...
                </div>
              )}
              {participants.length >= 1 && participants.length < room.max_players_per_game && (
                <div className={styles.startHint}>
                  Additional players will join automatically
                </div>
              )}
            </>
          ) : (
            <div className={styles.waitingMessage}>
              Waiting for host to start the game...
            </div>
          )}

          <button className={styles.leaveButton} onClick={onLeaveRoom}>
            Leave Room
          </button>
        </div>

      </div>
    </div>
  );
};

export default CareerMatchLobby;
