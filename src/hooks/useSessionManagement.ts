/**
 * Session Management Hook
 *
 * React hook for managing cross-device session state.
 * Provides session lifecycle, progress tracking, and device switching.
 *
 * Phase 4 Implementation
 */

import { useEffect, useState, useCallback } from 'react';
import { SessionStateService } from '../services/session/SessionStateService';
import type { SessionState, ContainerType, Subject } from '../types/SessionTypes';

interface UseSessionManagementOptions {
  sessionId: string;
  userId: string;
  autoResume?: boolean;
}

interface UseSessionManagementResult {
  sessionState: SessionState | null;
  isLoading: boolean;
  error: string | null;

  // Session lifecycle
  createSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  endSession: () => Promise<void>;

  // Progress tracking
  startContainer: (container: ContainerType, subject: Subject) => Promise<void>;
  completeContainer: (
    container: ContainerType,
    subject: Subject,
    score: number,
    attempts: number,
    timeSpent: number
  ) => Promise<void>;

  // Device switching
  isDeviceSwitched: boolean;
}

/**
 * Hook for managing session state across devices
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { sessionState, startContainer, completeContainer } = useSessionManagement({
 *     sessionId: currentSession.id,
 *     userId: user.id,
 *     autoResume: true
 *   });
 *
 *   const handleStartLearn = async () => {
 *     await startContainer('LEARN', 'Math');
 *   };
 *
 *   return <div>Current: {sessionState?.currentContainer}</div>;
 * }
 * ```
 */
export function useSessionManagement({
  sessionId,
  userId,
  autoResume = true
}: UseSessionManagementOptions): UseSessionManagementResult {
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeviceSwitched, setIsDeviceSwitched] = useState<boolean>(false);

  const sessionService = SessionStateService.getInstance();

  /**
   * Create new session
   */
  const createSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const newSession = await sessionService.createSession(sessionId, userId);
      setSessionState(newSession);
      setIsDeviceSwitched(false);

      console.log('✅ Session created:', sessionId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMsg);
      console.error('❌ Session creation failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, userId, sessionService]);

  /**
   * Resume existing session (potentially from different device)
   */
  const resumeSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const resumedSession = await sessionService.resumeSession(sessionId, userId);
      setSessionState(resumedSession);

      // Check if device switched
      const deviceId = sessionService['deviceInfo']?.deviceId;
      const switched = resumedSession.activeDevice.deviceId !== deviceId;
      setIsDeviceSwitched(switched);

      if (switched) {
        console.log('🔄 Device switch detected:', {
          from: resumedSession.deviceHistory[resumedSession.deviceHistory.length - 2]?.deviceType,
          to: resumedSession.activeDevice.deviceType
        });
      }

      console.log('✅ Session resumed:', sessionId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to resume session';
      setError(errorMsg);
      console.error('❌ Session resume failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, userId, sessionService]);

  /**
   * End session
   */
  const endSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await sessionService.endSession(sessionId);
      setSessionState(null);
      setIsDeviceSwitched(false);

      console.log('✅ Session ended:', sessionId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to end session';
      setError(errorMsg);
      console.error('❌ Session end failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, sessionService]);

  /**
   * Start a container
   */
  const startContainer = useCallback(async (
    container: ContainerType,
    subject: Subject
  ) => {
    try {
      await sessionService.startContainer(sessionId, container, subject);

      // Refresh session state
      const updatedSession = await sessionService.resumeSession(sessionId, userId);
      setSessionState(updatedSession);

      console.log(`✅ Started ${container}-${subject}`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start container';
      setError(errorMsg);
      console.error('❌ Start container failed:', err);
    }
  }, [sessionId, userId, sessionService]);

  /**
   * Complete a container with performance data
   */
  const completeContainer = useCallback(async (
    container: ContainerType,
    subject: Subject,
    score: number,
    attempts: number,
    timeSpent: number
  ) => {
    try {
      await sessionService.completeContainer(
        sessionId,
        container,
        subject,
        score,
        attempts,
        timeSpent
      );

      // Refresh session state
      const updatedSession = await sessionService.resumeSession(sessionId, userId);
      setSessionState(updatedSession);

      console.log(`✅ Completed ${container}-${subject}:`, { score, attempts, timeSpent });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to complete container';
      setError(errorMsg);
      console.error('❌ Complete container failed:', err);
    }
  }, [sessionId, userId, sessionService]);

  /**
   * Auto-resume session on mount
   */
  useEffect(() => {
    if (autoResume && sessionId && userId) {
      resumeSession();
    }
  }, [autoResume, sessionId, userId, resumeSession]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Optionally pause session on unmount
      // sessionService.pauseSession(sessionId);
    };
  }, [sessionId]);

  return {
    sessionState,
    isLoading,
    error,
    createSession,
    resumeSession,
    endSession,
    startContainer,
    completeContainer,
    isDeviceSwitched
  };
}
