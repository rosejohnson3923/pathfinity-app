/**
 * Career Match Game Board Component
 * Main game grid with cards, leaderboard, and turn indicator
 * Integrates with MasterSoundSystem for audio feedback
 */

import React, { useState, useEffect, useCallback } from 'react';
import styles from './CareerMatchGameBoard.module.css';
import CareerMatchCard from './CareerMatchCard';
import CareerMatchService from '@/services/CareerMatchService';
import CareerMatchRealtimeService from '@/services/CareerMatchRealtimeService';
import { masterSoundSystem } from '@/services/MasterSoundSystem';
import careerMatchAIOrchestrator from '@/services/CareerMatchAIOrchestrator';
import { GRID_LAYOUTS } from '@/types/CareerMatchTypes';
import type {
  CareerMatchRoomState,
  CareerMatchCardState,
  CareerMatchPlayerState,
  CareerMatchEvent,
} from '@/types/CareerMatchTypes';

interface CareerMatchGameBoardProps {
  sessionId: string;
  currentUserId: string;
  onGameEnd?: () => void;
}

const CareerMatchGameBoard: React.FC<CareerMatchGameBoardProps> = ({
  sessionId,
  currentUserId,
  onGameEnd,
}) => {
  const [roomState, setRoomState] = useState<CareerMatchRoomState | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFlipTime, setLastFlipTime] = useState<number>(0);

  // ============================================================================
  // 4-STATE VISUAL STATE MACHINE
  // ============================================================================
  // Tracks which cards are currently flipped (temporary visual state)
  // Cards can be: unflipped, flipped, persist-flipped (matched), persist-unflipped
  const [flippedPositions, setFlippedPositions] = useState<number[]>([]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    const initialize = async () => {
      await loadGameState(); // This sets roomId
      // Don't call subscribeToRealtime here - it will be called after roomId is set
    };

    initialize();

    // Start game session with background music
    masterSoundSystem.startGameSession('career-match');

    // Start AI orchestrator
    careerMatchAIOrchestrator.startMonitoring(sessionId);

    return () => {
      masterSoundSystem.endGameSession();
      careerMatchAIOrchestrator.stopMonitoring(sessionId);
    };
  }, [sessionId]);

  const loadGameState = async () => {
    console.log('[GameBoard] 🔄 loadGameState() called');
    try {
      setIsLoading(true);
      const state = await CareerMatchService.getGameState({
        game_session_id: sessionId
      });
      console.log('[GameBoard] ✅ Got game state:', {
        sessionStatus: state.session.status,
        currentTurnPlayerId: state.session.current_turn_player_id,
        participants: state.participants.map(p => ({
          id: p.id,
          name: p.display_name,
          isActiveTurn: p.is_active_turn,
          type: p.participant_type
        })),
        cards: state.cards.map(c => ({
          position: c.position,
          isMatched: c.is_matched,
          careerName: c.career_name
        }))
      });

      // Convert to client-side state
      const cards: CareerMatchCardState[] = state.cards.map((card, index) => ({
        id: card.id,
        room_id: state.room.id,
        position: card.position,
        career_name: card.career_name,
        career_image_path: card.career_image_path,
        pair_id: card.pair_id,
        match_state: card.match_state || null, // M1/M2/M3 state machine
        is_matched: card.is_matched,
        matched_by_player_id: card.matched_by_participant_id,
        matched_at: card.matched_at,
        is_flipping: false,
        flip_delay: index * 50, // Stagger card entrance animations
      }));

      // Map participants to player state
      const players: CareerMatchPlayerState[] = state.participants.map((participant, index) => ({
        id: participant.id,
        room_id: state.room.id,
        user_id: participant.user_id || '',
        display_name: participant.display_name,
        is_ai: participant.participant_type === 'ai_agent',
        matches_found: participant.pairs_matched,
        xp_earned: participant.arcade_xp,
        is_active_turn: participant.is_active_turn,
        joined_at: participant.created_at || new Date().toISOString(),
        is_current_user: participant.user_id === currentUserId,
        rank: index + 1, // Will be recalculated based on matches
      }));

      // Sort players by matches found (descending)
      players.sort((a, b) => b.matches_found - a.matches_found);
      players.forEach((player, index) => {
        player.rank = index + 1;
      });

      const currentPlayer = players.find(p => p.is_active_turn);
      const isUserTurn = currentPlayer?.user_id === currentUserId;

      // Build room state from session and room data
      setRoomState({
        id: state.room.id,
        room_code: state.room.room_code,
        status: state.session.status as 'waiting' | 'active' | 'completed',
        difficulty: state.room.difficulty,
        max_players: state.room.max_players_per_game,
        current_players: state.session.total_participants,
        total_pairs: state.room.total_pairs,
        pairs_remaining: state.session.pairs_remaining,
        current_turn_player_id: state.session.current_turn_player_id || '',
        current_turn_number: state.session.current_turn_number,
        first_card_flipped: state.session.first_card_flipped,
        grid_rows: state.room.grid_rows,
        grid_cols: state.room.grid_cols,
        created_at: state.session.created_at || new Date().toISOString(),
        started_at: state.session.started_at,
        completed_at: state.session.completed_at,
        players,
        cards,
        time_remaining: null, // Career Match doesn't have time limits like Career Bingo
        is_user_turn: isUserTurn,
      } as any);

      // Store roomId for realtime subscriptions
      setRoomId(state.room.id);

      // Preload all card images before showing the game
      await preloadCardImages(cards);

      setIsLoading(false);

      console.log('[GameBoard] ✅ State updated:', {
        currentPlayer: players.find(p => p.is_active_turn)?.display_name,
        isUserTurn: isUserTurn,
        matched: cards.filter(c => c.is_matched).length
      });
    } catch (err: any) {
      console.error('[GameBoard] ❌ loadGameState() error:', err);
      setError(err.message || 'Failed to load game state');
      setIsLoading(false);
    }
  };

  /**
   * Preload all card images to ensure they render correctly when flipped
   */
  const preloadCardImages = async (cards: CareerMatchCardState[]): Promise<void> => {
    console.log('[GameBoard] 🖼️ Preloading card images...');

    // Get unique image paths
    const uniqueImages = [...new Set(cards.map(c => c.career_image_path))];

    // Create promises for each image
    const imagePromises = uniqueImages.map((src) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          console.log('[GameBoard] ✅ Loaded image:', src);
          resolve();
        };
        img.onerror = () => {
          console.warn('[GameBoard] ⚠️ Failed to load image:', src);
          resolve(); // Don't reject - continue even if some images fail
        };
        img.src = src;
      });
    });

    // Wait for all images to load (or fail)
    await Promise.all(imagePromises);
    setImagesLoaded(true);
    console.log('[GameBoard] ✅ All images preloaded');
  };

  const calculateTimeRemaining = (room: any): number | null => {
    if (!room.time_limit_seconds || !room.started_at) return null;

    const elapsed = (Date.now() - new Date(room.started_at).getTime()) / 1000;
    const remaining = room.time_limit_seconds - elapsed;

    return Math.max(0, Math.floor(remaining));
  };

  // ============================================================================
  // REALTIME SUBSCRIPTIONS
  // ============================================================================

  // Subscribe to realtime once roomId is available
  useEffect(() => {
    if (roomId) {
      console.log('[GameBoard] 📡 Subscribing to realtime for room:', roomId, 'session:', sessionId);
      CareerMatchRealtimeService.subscribeToRoom(roomId, handleRealtimeEvent, sessionId);

      return () => {
        console.log('[GameBoard] 📡 Unsubscribing from realtime for room:', roomId);
        CareerMatchRealtimeService.unsubscribeFromRoom(roomId);
      };
    }
  }, [roomId, sessionId]);

  const subscribeToRealtime = () => {
    if (!roomId) {
      console.warn('[GameBoard] ⚠️ Cannot subscribe - roomId is null');
      return;
    }
    CareerMatchRealtimeService.subscribeToRoom(roomId, handleRealtimeEvent);
  };

  const unsubscribeFromRealtime = () => {
    CareerMatchRealtimeService.unsubscribeFromRoom(roomId);
  };

  const handleRealtimeEvent = useCallback((event: CareerMatchEvent) => {
    console.log('[CareerMatch] Realtime event:', event);

    switch (event.type) {
      case 'card_flipped':
        handleCardFlippedEvent(event.data);
        break;

      case 'match_detected':
        handleMatchDetectedEvent(event.data);
        break;

      case 'match_found':
        handleMatchFoundEvent(event.data);
        break;

      case 'no_match':
        handleNoMatchEvent(event.data);
        break;

      case 'card_reset':
        handleCardResetEvent(event.data);
        break;

      case 'turn_changed':
        handleTurnChangedEvent(event.data);
        break;

      case 'game_ended':
        handleGameEndedEvent(event.data);
        break;

      case 'streak_bonus':
        handleStreakBonusEvent(event.data);
        break;

      case 'time_warning':
        handleTimeWarningEvent(event.data);
        break;

      case 'player_stats_updated':
        handlePlayerStatsUpdatedEvent(event.data);
        break;
    }
  }, [roomId, currentUserId]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleCardFlippedEvent = (data: any) => {
    console.log('[GameBoard] handleCardFlippedEvent:', data);

    // Play flip sound
    masterSoundSystem.playCardFlip();

    // Update card state to M1 (flipped) in roomState
    if (data.position !== undefined && data.match_state) {
      setRoomState((prevState) => {
        if (!prevState) return prevState;

        return {
          ...prevState,
          cards: prevState.cards.map(c =>
            c.position === data.position
              ? {
                  ...c,
                  match_state: data.match_state,  // Set to M1 (flipped)
                }
              : c
          )
        };
      });
    }
  };

  const handleMatchDetectedEvent = (data: any) => {
    console.log('[GameBoard] handleMatchDetectedEvent:', data);

    // Update card state to M2 (match detected, waiting to persist) in roomState
    if (data.position !== undefined && data.match_state) {
      setRoomState((prevState) => {
        if (!prevState) return prevState;

        return {
          ...prevState,
          cards: prevState.cards.map(c =>
            c.position === data.position
              ? {
                  ...c,
                  match_state: data.match_state,  // Set to M2 (match detected)
                }
              : c
          )
        };
      });
    }
  };

  const handleMatchFoundEvent = (data: any) => {
    // Only trigger celebration and sound when FIRST M3 event arrives
    // (both cards will fire M3 events, but we only want one celebration)
    const isFirstM3 = roomState?.cards.filter(c => c.match_state === 'M3').length === 0;

    if (isFirstM3) {
      // Play success sound
      masterSoundSystem.playMatchSuccess();

      // Show match celebration
      showMatchCelebration(data.career_name, data.player_name, data.xp_earned);
    }

    // Update card to M3 state (show checkmark)
    if (data.position !== undefined) {
      setRoomState((prevState) => {
        if (!prevState) return prevState;

        return {
          ...prevState,
          cards: prevState.cards.map(c =>
            c.position === data.position
              ? {
                  ...c,
                  match_state: 'M3',
                  is_matched: true,
                  matched_at: new Date().toISOString()
                }
              : c
          )
        };
      });
    }

    // No need to clear flipped positions - cards stay visible via match_state
  };

  const handleNoMatchEvent = (data: any) => {
    // Play mismatch sound
    masterSoundSystem.playCardMismatch();

    // Cards are showing - after 5s reset visual state (increased for debugging)
    setTimeout(() => {
      setFlippedPositions([]);
      // NO loadGameState() - turn_changed event will fire separately
      // and update the turn indicator
    }, 5000);
  };

  const handleCardResetEvent = (data: any) => {
    console.log('[GameBoard] handleCardResetEvent:', data);

    // Update card state to NULL (face-down) in roomState
    if (data.position !== undefined) {
      setRoomState((prevState) => {
        if (!prevState) return prevState;

        return {
          ...prevState,
          cards: prevState.cards.map(c =>
            c.position === data.position
              ? {
                  ...c,
                  match_state: null,  // Reset to face-down
                }
              : c
          )
        };
      });
    }
  };

  const handleTurnChangedEvent = (data: any) => {
    // Play turn change sound
    masterSoundSystem.playTurnChange();

    // Update turn indicator in real-time without full reload using functional update
    setRoomState((prevState) => {
      if (!prevState) return prevState;

      return {
        ...prevState,
        current_turn_player_id: data.next_player_id,
        current_turn_number: data.turn_number,
        is_user_turn: prevState.players.find(p => p.id === data.next_player_id)?.is_current_user || false,
        players: prevState.players.map(p => ({
          ...p,
          is_active_turn: p.id === data.next_player_id
        }))
      };
    });
  };

  const handleGameEndedEvent = (data: any) => {
    // Play game complete sound
    masterSoundSystem.playGameComplete();
    masterSoundSystem.stopBackgroundMusic();

    // Show game complete notification
    console.log('🎉 Game Complete! All pairs matched!');

    // Add 3-second delay to let users see the completed board
    setTimeout(() => {
      // Navigate to completion screen
      if (onGameEnd) {
        onGameEnd();
      }
    }, 3000); // 3 seconds to view completed board
  };

  const handleStreakBonusEvent = (data: any) => {
    // Play streak bonus sound (use celebration sound)
    masterSoundSystem.playBingoCelebration();

    // Show streak notification
    showStreakNotification(data.player_name, data.streak_count, data.bonus_xp);
  };

  const handleTimeWarningEvent = (data: any) => {
    // Play time warning sound
    masterSoundSystem.playTimerWarning();

    // Show time warning notification
    showTimeWarning(data.seconds_remaining);
  };

  const handlePlayerStatsUpdatedEvent = (data: any) => {
    console.log('[GameBoard] Player stats updated:', data);

    // Update player stats in leaderboard
    setRoomState((prevState) => {
      if (!prevState) return prevState;

      return {
        ...prevState,
        players: prevState.players.map(player => {
          if (player.id === data.participant_id) {
            return {
              ...player,
              matches_found: data.pairs_matched,
              total_xp: data.total_xp,
              arcade_xp: data.arcade_xp,
              consecutive_matches: data.current_streak,
            };
          }
          return player;
        }).sort((a, b) => {
          // Re-sort leaderboard by matches_found (descending)
          if (b.matches_found !== a.matches_found) {
            return b.matches_found - a.matches_found;
          }
          // Tie-breaker: total XP
          return b.total_xp - a.total_xp;
        }).map((player, index) => ({
          ...player,
          rank: index + 1, // Update ranks after sorting
        })),
      };
    });
  };

  // ============================================================================
  // CARD FLIP LOGIC
  // ============================================================================

  const handleCardFlip = async (position: number) => {
    console.log('[GameBoard] 🎯 User clicked card at position:', position);

    if (!roomState || !roomState.is_user_turn || !roomId) {
      console.log('[GameBoard] ⛔ Click blocked - not user turn');
      return;
    }

    // Prevent double-clicking
    const now = Date.now();
    if (now - lastFlipTime < 300) {
      console.log('[GameBoard] ⛔ Click blocked - too fast');
      return;
    }
    setLastFlipTime(now);

    // Get current user's participant ID for proper validation
    const currentUserParticipant = roomState?.players.find(p => p.user_id === currentUserId);
    if (!currentUserParticipant) {
      console.error('[GameBoard] Current user participant not found');
      return;
    }

    try {
      console.log('[GameBoard] 🎴 Flipping card...');
      await CareerMatchService.flipCard({
        game_session_id: sessionId,
        position,
        userId: currentUserId,
        participantId: currentUserParticipant.id, // IMPORTANT: Pass participant ID for turn validation
      });

      // NO OPTIMISTIC UPDATES!
      // Database updates trigger postgres_changes events automatically
      // ALL clients (including this one) receive updates via realtime subscriptions
      // This ensures perfect synchronization - everyone sees the same thing at the same time
    } catch (err: any) {
      console.error('[CareerMatch] Card flip error:', err);
      setError(err.message || 'Failed to flip card');
    }
  };

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  const showMatchCelebration = (careerName: string, playerName: string, xp: number) => {
    // TODO: Implement match celebration overlay
    console.log(`✨ ${playerName} matched ${careerName}! +${xp} XP`);
  };

  const showStreakNotification = (playerName: string, streak: number, bonusXp: number) => {
    // TODO: Implement streak notification
    console.log(`🔥 ${playerName} has a ${streak}-match streak! +${bonusXp} bonus XP`);
  };

  const showTimeWarning = (secondsRemaining: number) => {
    // TODO: Implement time warning notification
    console.log(`⏱️ Only ${secondsRemaining} seconds left!`);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading game...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
        <button onClick={() => loadGameState()}>Retry</button>
      </div>
    );
  }

  if (!roomState) {
    return <div className={styles.error}>Game not found</div>;
  }

  const gridLayout = GRID_LAYOUTS[roomState.difficulty];
  const currentPlayer = roomState.players.find(p => p.is_active_turn);

  return (
    <div className={styles.gameBoardContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Career Match</h1>
        <div className={styles.difficulty}>
          {roomState.difficulty.charAt(0).toUpperCase() + roomState.difficulty.slice(1)} Mode
        </div>
        {roomState.time_remaining !== null && (
          <div className={`${styles.timer} ${roomState.time_remaining <= 60 ? styles.timerWarning : ''}`}>
            ⏱️ {Math.floor(roomState.time_remaining / 60)}:{String(roomState.time_remaining % 60).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Main Game Area */}
      <div className={styles.mainContent}>
        {/* Leaderboard Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.leaderboard}>
            <h3>Leaderboard</h3>
            {roomState.players.map((player, index) => (
              <div
                key={player.id}
                className={`${styles.playerEntry} ${
                  player.is_active_turn ? styles.activeTurn : ''
                } ${player.is_current_user ? styles.currentUser : ''}`}
              >
                <div className={styles.rank}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div className={styles.playerName}>
                  {player.display_name}
                </div>
                <div className={styles.matches}>{player.matches_found} matches</div>
                {player.consecutive_matches >= 3 && (
                  <div className={styles.streak}>🔥 {player.consecutive_matches}</div>
                )}
              </div>
            ))}
          </div>

          {/* Turn Indicator */}
          <div className={styles.turnIndicator}>
            {currentPlayer && (
              <>
                <div className={styles.turnLabel}>Current Turn:</div>
                <div className={styles.currentPlayerName}>
                  {currentPlayer.display_name}
                  {currentPlayer.is_current_user && <span className={styles.youTag}> (YOU)</span>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Card Grid */}
        <div className={styles.cardGridContainer}>
          <div
            className={styles.cardGrid}
            style={{
              gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
              gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
            }}
          >
            {roomState.cards.map((card) => {
              // NEW: Use match_state to determine visual state
              // M1, M2, M3 = show card face (flipped)
              // NULL = show card back (face-down)
              const isFlipped = card.match_state !== null;
              const showMatchedOverlay = card.match_state === 'M3';

              // DEBUG: Log card flip state
              if (isFlipped) {
                console.log(`[Card ${card.position}] FLIPPED:`, {
                  position: card.position,
                  matchState: card.match_state,
                  isFlipped,
                  showMatchedOverlay,
                  careerName: card.career_name,
                  imagePath: card.career_image_path,
                });
              }

              return (
                <CareerMatchCard
                  key={card.id}
                  card={card}
                  onFlip={handleCardFlip}
                  disabled={!roomState.is_user_turn || card.is_matched}
                  size="medium"
                  isFlipped={isFlipped}
                  showMatchedOverlay={showMatchedOverlay}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerMatchGameBoard;
