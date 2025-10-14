/**
 * Connection Monitoring Hook
 * React hook for monitoring and handling player connections
 *
 * Features:
 * - Automatic heartbeat/ping to server
 * - Connection status tracking
 * - Reconnection handling
 * - Missed event syncing
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { disconnectionHandler } from '../services/DisconnectionHandler';
import type { SessionParticipant } from '../types/DiscoveredLiveMultiplayerTypes';

interface UseConnectionMonitoringOptions {
  participantId: string;
  enabled?: boolean;
  pingIntervalMs?: number;
  onReconnected?: (syncedState: SessionParticipant | null) => void;
  onDisconnected?: () => void;
}

interface ConnectionStatus {
  isConnected: boolean;
  isReconnecting: boolean;
  lastPingAt: Date | null;
  reconnectAttempts: number;
}

export function useConnectionMonitoring({
  participantId,
  enabled = true,
  pingIntervalMs = 5000,
  onReconnected,
  onDisconnected,
}: UseConnectionMonitoringOptions) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: true,
    isReconnecting: false,
    lastPingAt: null,
    reconnectAttempts: 0,
  });

  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  /**
   * Send ping to server
   */
  const sendPing = useCallback(async () => {
    if (!enabled || isUnmountedRef.current) return;

    try {
      await disconnectionHandler.receivePing(participantId);

      setConnectionStatus(prev => ({
        ...prev,
        isConnected: true,
        isReconnecting: false,
        lastPingAt: new Date(),
        reconnectAttempts: 0,
      }));
    } catch (error) {
      console.error('Failed to send ping:', error);
      handleDisconnection();
    }
  }, [participantId, enabled]);

  /**
   * Handle disconnection
   */
  const handleDisconnection = useCallback(() => {
    if (isUnmountedRef.current) return;

    setConnectionStatus(prev => ({
      ...prev,
      isConnected: false,
    }));

    onDisconnected?.();

    // Attempt reconnection
    attemptReconnection();
  }, [onDisconnected]);

  /**
   * Attempt to reconnect
   */
  const attemptReconnection = useCallback(async () => {
    if (isUnmountedRef.current) return;

    setConnectionStatus(prev => ({
      ...prev,
      isReconnecting: true,
      reconnectAttempts: prev.reconnectAttempts + 1,
    }));

    try {
      // Send ping to trigger reconnection
      await disconnectionHandler.receivePing(participantId);

      // Sync missed state
      const syncedState = await disconnectionHandler.syncParticipantState(participantId);

      setConnectionStatus(prev => ({
        ...prev,
        isConnected: true,
        isReconnecting: false,
        lastPingAt: new Date(),
        reconnectAttempts: 0,
      }));

      onReconnected?.(syncedState);
    } catch (error) {
      console.error('Reconnection failed:', error);

      // Retry with exponential backoff
      const retryDelay = Math.min(1000 * Math.pow(2, connectionStatus.reconnectAttempts), 30000);

      reconnectTimeoutRef.current = setTimeout(() => {
        attemptReconnection();
      }, retryDelay);
    }
  }, [participantId, connectionStatus.reconnectAttempts, onReconnected]);

  /**
   * Manually trigger reconnection
   */
  const manualReconnect = useCallback(() => {
    attemptReconnection();
  }, [attemptReconnection]);

  /**
   * Start ping interval
   */
  useEffect(() => {
    if (!enabled) return;

    // Register participant
    disconnectionHandler.registerParticipant(participantId);

    // Send initial ping
    sendPing();

    // Start ping interval
    pingIntervalRef.current = setInterval(sendPing, pingIntervalMs);

    return () => {
      isUnmountedRef.current = true;

      // Clear intervals
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Unregister participant
      disconnectionHandler.unregisterParticipant(participantId);
    };
  }, [participantId, enabled, pingIntervalMs, sendPing]);

  /**
   * Monitor for disconnection from server side
   */
  useEffect(() => {
    if (!enabled) return;

    const checkInterval = setInterval(() => {
      const status = disconnectionHandler.getConnectionStatus(participantId);

      if (status.isDisconnected && connectionStatus.isConnected) {
        handleDisconnection();
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(checkInterval);
  }, [participantId, enabled, connectionStatus.isConnected, handleDisconnection]);

  return {
    connectionStatus,
    manualReconnect,
    sendPing,
  };
}

/**
 * Hook for monitoring multiple participants' connection status
 * (Useful for displaying connection status of all players)
 */
export function useParticipantsConnectionStatus(participantIds: string[]) {
  const [statuses, setStatuses] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    const updateStatuses = () => {
      const newStatuses = new Map<string, boolean>();

      participantIds.forEach(id => {
        const status = disconnectionHandler.getConnectionStatus(id);
        newStatuses.set(id, !status.isDisconnected);
      });

      setStatuses(newStatuses);
    };

    updateStatuses();
    const interval = setInterval(updateStatuses, 2000);

    return () => clearInterval(interval);
  }, [participantIds]);

  return statuses;
}
