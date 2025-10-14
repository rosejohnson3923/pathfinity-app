/**
 * Synced Timer Hook
 * React hook for using server-synchronized timers
 *
 * Features:
 * - Automatic clock sync on mount
 * - Server-authoritative countdown
 * - Smooth client-side interpolation
 * - Handles timer updates from server
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { serverAuthoritativeTimer } from '../services/ServerAuthoritativeTimer';
import { discoveredLiveRealtimeService } from '../services/DiscoveredLiveRealtimeService';

interface TimerState {
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
  endsAt: Date | null;
  questionNumber: number | null;
}

interface UseSyncedTimerOptions {
  roomId: string;
  sessionId: string;
  onTimerExpired?: () => void;
  syncOnMount?: boolean;
}

export function useSyncedTimer({
  roomId,
  sessionId,
  onTimerExpired,
  syncOnMount = true,
}: UseSyncedTimerOptions) {
  const [timerState, setTimerState] = useState<TimerState>({
    timeRemaining: 0,
    isActive: false,
    isPaused: false,
    endsAt: null,
    questionNumber: null,
  });

  const [clockSync, setClockSync] = useState({
    isSynced: false,
    offset: 0,
  });

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTimerExpiredRef = useRef<number | null>(null);

  /**
   * Sync clock with server
   */
  const syncClock = useCallback(async () => {
    try {
      const sync = await serverAuthoritativeTimer.syncClientClock();
      setClockSync({
        isSynced: true,
        offset: sync.offset,
      });
      console.log('✅ Clock synced with server');
    } catch (error) {
      console.error('Failed to sync clock:', error);
    }
  }, []);

  /**
   * Handle timer update from server
   */
  const handleTimerUpdate = useCallback(
    (event: any) => {
      const {
        questionNumber,
        remainingSeconds,
        endsAt,
        isPaused,
        serverTime,
      } = event.data;

      // Update timer state
      setTimerState({
        timeRemaining: remainingSeconds,
        isActive: remainingSeconds > 0,
        isPaused,
        endsAt: new Date(endsAt),
        questionNumber,
      });

      // Check if timer expired
      if (remainingSeconds === 0 && questionNumber !== lastTimerExpiredRef.current) {
        lastTimerExpiredRef.current = questionNumber;
        onTimerExpired?.();
      }
    },
    [onTimerExpired]
  );

  /**
   * Start local countdown (interpolation between server updates)
   */
  const startLocalCountdown = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setTimerState(prev => {
        if (!prev.isActive || prev.isPaused || !prev.endsAt) {
          return prev;
        }

        // Calculate remaining time using synced clock
        const remainingSeconds = serverAuthoritativeTimer.calculateTimeRemaining(
          prev.endsAt.toISOString()
        );

        // Check if expired
        if (remainingSeconds <= 0) {
          if (prev.questionNumber !== lastTimerExpiredRef.current) {
            lastTimerExpiredRef.current = prev.questionNumber;
            onTimerExpired?.();
          }
          return {
            ...prev,
            timeRemaining: 0,
            isActive: false,
          };
        }

        return {
          ...prev,
          timeRemaining: remainingSeconds,
        };
      });
    }, 100); // Update every 100ms for smooth countdown
  }, [onTimerExpired]);

  /**
   * Subscribe to timer updates from server
   */
  useEffect(() => {
    if (!roomId) return;

    const subscription = discoveredLiveRealtimeService.subscribeToRoom(roomId, {
      timer_update: handleTimerUpdate,
    });

    return () => {
      discoveredLiveRealtimeService.unsubscribeFromRoom(roomId);
    };
  }, [roomId, handleTimerUpdate]);

  /**
   * Sync clock on mount
   */
  useEffect(() => {
    if (syncOnMount) {
      syncClock();
    }
  }, [syncOnMount, syncClock]);

  /**
   * Start/stop local countdown based on timer state
   */
  useEffect(() => {
    if (timerState.isActive && !timerState.isPaused) {
      startLocalCountdown();
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [timerState.isActive, timerState.isPaused, startLocalCountdown]);

  /**
   * Manually sync with server
   */
  const manualSync = useCallback(async () => {
    await syncClock();
  }, [syncClock]);

  return {
    timeRemaining: timerState.timeRemaining,
    isActive: timerState.isActive,
    isPaused: timerState.isPaused,
    questionNumber: timerState.questionNumber,
    clockSync,
    manualSync,
  };
}

/**
 * Hook for getting server time
 */
export function useServerTime() {
  const [serverTime, setServerTime] = useState<Date>(new Date());
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    // Sync on mount
    const syncClock = async () => {
      await serverAuthoritativeTimer.syncClientClock();
      setIsSynced(true);
    };

    syncClock();

    // Update server time every second
    const interval = setInterval(() => {
      setServerTime(serverAuthoritativeTimer.getServerTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    serverTime,
    isSynced,
    getServerTime: () => serverAuthoritativeTimer.getServerTime(),
    calculateTimeRemaining: (endsAt: string) =>
      serverAuthoritativeTimer.calculateTimeRemaining(endsAt),
  };
}
