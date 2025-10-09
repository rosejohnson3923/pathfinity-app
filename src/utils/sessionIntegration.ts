/**
 * Session Integration Utilities
 *
 * Helper functions for integrating session management with container components.
 * Provides wrapper functions for tracking container lifecycle and performance.
 *
 * Phase 4 Implementation
 */

import { SessionStateService } from '../services/session/SessionStateService';
import { RubricBasedJITService } from '../services/content/RubricBasedJITService';
import type { ContainerType, Subject } from '../types/SessionTypes';

/**
 * Container session tracker
 * Wraps container lifecycle with session tracking
 */
export class ContainerSessionTracker {
  private sessionService = SessionStateService.getInstance();
  private jitService = RubricBasedJITService.getInstance();

  private startTime: number = 0;
  private attempts: number = 0;

  /**
   * Initialize container session
   * Call this when container component mounts
   */
  async initializeContainer(
    sessionId: string,
    container: ContainerType,
    subject: Subject
  ): Promise<void> {
    console.log(`📍 Initializing container: ${container}-${subject}`);

    try {
      // Mark container as started in session
      await this.sessionService.startContainer(sessionId, container, subject);

      // Start timing
      this.startTime = Date.now();
      this.attempts = 0;

      console.log(`✅ Container initialized: ${container}-${subject}`);
    } catch (error) {
      console.error('❌ Failed to initialize container:', error);
      throw error;
    }
  }

  /**
   * Record attempt
   * Call this when student submits an answer
   */
  recordAttempt(): void {
    this.attempts++;
    console.log(`📝 Attempt recorded: ${this.attempts}`);
  }

  /**
   * Complete container session
   * Call this when container is completed
   */
  async completeContainer(
    sessionId: string,
    container: ContainerType,
    subject: Subject,
    score: number
  ): Promise<void> {
    console.log(`🏁 Completing container: ${container}-${subject}`);

    try {
      // Calculate time spent
      const timeSpent = Math.floor((Date.now() - this.startTime) / 1000); // seconds

      // Record completion in session
      await this.sessionService.completeContainer(
        sessionId,
        container,
        subject,
        score,
        this.attempts,
        timeSpent
      );

      // Record completion in rubric (for adaptive content)
      await this.jitService.recordContainerCompletion(
        sessionId,
        container,
        subject,
        {
          score,
          attempts: this.attempts,
          timeSpent,
          struggledQuestions: [] // Could be enhanced to track specific questions
        }
      );

      console.log(`✅ Container completed: ${container}-${subject}`, {
        score,
        attempts: this.attempts,
        timeSpent
      });

      // Reset tracker
      this.startTime = 0;
      this.attempts = 0;

    } catch (error) {
      console.error('❌ Failed to complete container:', error);
      throw error;
    }
  }

  /**
   * Get current session statistics
   */
  getCurrentStats(): { timeElapsed: number; attempts: number } {
    const timeElapsed = this.startTime > 0
      ? Math.floor((Date.now() - this.startTime) / 1000)
      : 0;

    return {
      timeElapsed,
      attempts: this.attempts
    };
  }
}

/**
 * Session initialization helper
 * Call this on app startup or login
 */
export async function initializeUserSession(
  sessionId: string,
  userId: string,
  resumeExisting: boolean = true
): Promise<void> {
  console.log('🚀 Initializing user session:', { sessionId, userId, resumeExisting });

  const sessionService = SessionStateService.getInstance();

  try {
    if (resumeExisting) {
      // Try to resume existing session
      await sessionService.resumeSession(sessionId, userId);
      console.log('✅ Session resumed');
    } else {
      // Create new session
      await sessionService.createSession(sessionId, userId);
      console.log('✅ Session created');
    }
  } catch (error) {
    console.error('❌ Failed to initialize session:', error);
    throw error;
  }
}

/**
 * Session cleanup helper
 * Call this on logout or session end
 */
export async function cleanupUserSession(sessionId: string): Promise<void> {
  console.log('🧹 Cleaning up session:', sessionId);

  const sessionService = SessionStateService.getInstance();

  try {
    await sessionService.endSession(sessionId);
    console.log('✅ Session ended');
  } catch (error) {
    console.error('❌ Failed to cleanup session:', error);
    throw error;
  }
}

/**
 * Device switch notification
 * Displays message when device switch is detected
 */
export function notifyDeviceSwitch(
  fromDevice: string,
  toDevice: string
): void {
  console.log(`🔄 Device switch detected: ${fromDevice} → ${toDevice}`);

  // Could trigger a UI notification here
  // Example: toast.info(`Switched from ${fromDevice} to ${toDevice}`)
}

/**
 * Check if rubrics need to be re-fetched after device switch
 * Returns true if sessionStorage cache was invalidated
 */
export function shouldRefetchRubrics(isDeviceSwitched: boolean): boolean {
  return isDeviceSwitched;
}

/**
 * Example integration with Learn container
 */
export async function integrateLearnContainer(
  sessionId: string,
  subject: Subject,
  onComplete: (score: number) => void
): Promise<void> {
  const tracker = new ContainerSessionTracker();

  // Initialize
  await tracker.initializeContainer(sessionId, 'LEARN', subject);

  // ... Student goes through Learn content ...
  // On each answer submission:
  // tracker.recordAttempt();

  // On completion:
  const finalScore = 85; // Example score
  await tracker.completeContainer(sessionId, 'LEARN', subject, finalScore);

  onComplete(finalScore);
}

/**
 * Example integration with Experience container
 */
export async function integrateExperienceContainer(
  sessionId: string,
  subject: Subject,
  onComplete: (score: number) => void
): Promise<void> {
  const tracker = new ContainerSessionTracker();

  await tracker.initializeContainer(sessionId, 'EXPERIENCE', subject);

  // ... Student goes through Experience scenarios ...

  const finalScore = 90;
  await tracker.completeContainer(sessionId, 'EXPERIENCE', subject, finalScore);

  onComplete(finalScore);
}

/**
 * Example integration with Discover container
 */
export async function integrateDiscoverContainer(
  sessionId: string,
  subject: Subject,
  onComplete: (score: number) => void
): Promise<void> {
  const tracker = new ContainerSessionTracker();

  await tracker.initializeContainer(sessionId, 'DISCOVER', subject);

  // ... Student explores Discovery stations ...

  const finalScore = 95;
  await tracker.completeContainer(sessionId, 'DISCOVER', subject, finalScore);

  onComplete(finalScore);
}
