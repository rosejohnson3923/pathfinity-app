/**
 * Session State Service
 *
 * Manages cross-device session state and synchronization.
 * Enables students to switch devices mid-lesson seamlessly.
 *
 * Use Case: Student starts on computer at home, switches to tablet for Science
 *
 * Phase 4 Implementation
 */

import type {
  SessionState,
  DeviceInfo,
  ContainerProgress,
  SessionSyncRequest,
  SessionSyncResponse,
  DeviceSwitchEvent,
  SessionLock
} from '../../types/SessionTypes';
import type { ContainerType, Subject } from '../../types/MasterNarrativeTypes';
import { getRubricStorage } from '../storage/RubricStorageService';
import { getAzureStorage } from '../storage/AzureStorageService';

/**
 * Session State Service
 * Handles session state management with cross-device support
 */
export class SessionStateService {
  private static instance: SessionStateService;
  private rubricStorage = getRubricStorage();
  private azureStorage: any;
  private isBrowser: boolean;
  private apiBaseUrl: string;

  // Local session cache
  private currentSession: SessionState | null = null;
  private currentDevice: DeviceInfo | null = null;

  // Session expiration (4 hours by default)
  private readonly SESSION_TTL_HOURS = 4;
  private readonly LOCK_TTL_SECONDS = 30;

  private constructor() {
    this.isBrowser = typeof window !== 'undefined';

    // API endpoint for browser-based operations
    // VITE_API_URL already includes /api, so remove it
    const apiUrl = this.isBrowser
      ? (import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3002/api')
      : '';

    // Remove /api from base URL since we'll add it in fetch calls
    this.apiBaseUrl = apiUrl.replace(/\/api$/, '');

    // Only initialize Azure SDK in Node.js environment
    if (this.isBrowser) {
      console.log('🌐 [SessionState] Running in browser, will use API endpoints');
      this.azureStorage = null;
    } else {
      this.azureStorage = getAzureStorage();
    }

    this.initializeDevice();
    this.setupHeartbeat();
  }

  public static getInstance(): SessionStateService {
    if (!SessionStateService.instance) {
      SessionStateService.instance = new SessionStateService();
    }
    return SessionStateService.instance;
  }

  // ========================================================================
  // SESSION INITIALIZATION
  // ========================================================================

  /**
   * Create new session
   * Called when student logs in or starts a new lesson
   */
  async createSession(
    sessionId: string,
    userId: string
  ): Promise<SessionState> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_TTL_HOURS * 60 * 60 * 1000);

    const sessionState: SessionState = {
      sessionId,
      userId,

      createdAt: now.toISOString(),
      lastUpdatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),

      activeDevice: this.currentDevice!,
      deviceHistory: [this.currentDevice!],

      currentContainer: null,
      currentSubject: null,

      completedContainers: [],

      isActive: true,
      isPaused: false,
      needsSync: false,

      version: '1.0.0'
    };

    // Save to Azure Storage
    await this.saveSessionState(sessionState);

    // Cache locally
    this.currentSession = sessionState;

    return sessionState;
  }

  /**
   * Resume existing session
   * Called when student returns or switches devices
   */
  async resumeSession(
    sessionId: string,
    userId: string
  ): Promise<SessionState> {
    console.log(`📱 [Session] Resuming session: ${sessionId}`);

    // Fetch session state from Azure Storage
    const sessionState = await this.loadSessionState(sessionId);

    if (!sessionState) {
      console.warn(`⚠️ [Session] Session not found, creating new: ${sessionId}`);
      return await this.createSession(sessionId, userId);
    }

    // Check if session expired
    if (this.isSessionExpired(sessionState)) {
      console.warn(`⚠️ [Session] Session expired, creating new: ${sessionId}`);
      return await this.createSession(sessionId, userId);
    }

    // Check if different device
    const isDifferentDevice = sessionState.activeDevice.deviceId !== this.currentDevice!.deviceId;

    if (isDifferentDevice) {
      console.log(`🔄 [Session] Device switch detected: ${sessionState.activeDevice.deviceType} → ${this.currentDevice!.deviceType}`);
      await this.handleDeviceSwitch(sessionState);
    }

    // Update last active time
    sessionState.lastUpdatedAt = new Date().toISOString();
    sessionState.activeDevice.lastActiveAt = new Date().toISOString();
    sessionState.isActive = true;

    // Save updated state
    await this.saveSessionState(sessionState);

    // Cache locally
    this.currentSession = sessionState;

    console.log(`✅ [Session] Session resumed on ${this.currentDevice!.deviceType}`);

    return sessionState;
  }

  // ========================================================================
  // DEVICE MANAGEMENT
  // ========================================================================

  /**
   * Initialize current device information
   */
  private initializeDevice(): void {
    if (typeof window === 'undefined') {
      // Server-side: create minimal device info
      this.currentDevice = {
        deviceId: 'server',
        deviceType: 'unknown',
        browser: 'server',
        os: 'server',
        lastActiveAt: new Date().toISOString()
      };
      return;
    }

    // Generate or retrieve device ID from localStorage
    let deviceId = localStorage.getItem('pathfinity-device-id');
    if (!deviceId) {
      deviceId = this.generateDeviceId();
      localStorage.setItem('pathfinity-device-id', deviceId);
    }

    // Detect device type
    const deviceType = this.detectDeviceType();

    // Detect browser
    const browser = this.detectBrowser();

    // Detect OS
    const os = this.detectOS();

    this.currentDevice = {
      deviceId,
      deviceType,
      browser,
      os,
      lastActiveAt: new Date().toISOString()
    };
  }

  /**
   * Generate unique device ID
   */
  private generateDeviceId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `device_${timestamp}_${random}`;
  }

  /**
   * Detect device type from user agent
   */
  private detectDeviceType(): 'desktop' | 'tablet' | 'mobile' | 'unknown' {
    if (typeof window === 'undefined') return 'unknown';

    const ua = navigator.userAgent.toLowerCase();

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }

    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }

    return 'desktop';
  }

  /**
   * Detect browser
   */
  private detectBrowser(): string {
    if (typeof window === 'undefined') return 'unknown';

    const ua = navigator.userAgent;

    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';

    return 'Unknown';
  }

  /**
   * Detect OS
   */
  private detectOS(): string {
    if (typeof window === 'undefined') return 'unknown';

    const ua = navigator.userAgent;

    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';

    return 'Unknown';
  }

  /**
   * Handle device switch
   */
  private async handleDeviceSwitch(sessionState: SessionState): Promise<void> {
    const switchEvent: DeviceSwitchEvent = {
      sessionId: sessionState.sessionId,
      fromDevice: sessionState.activeDevice,
      toDevice: this.currentDevice!,
      switchedAt: new Date().toISOString(),
      reason: 'manual'
    };

    console.log(`🔄 [Session] Device switch:`, switchEvent);

    // Update device history
    if (!sessionState.deviceHistory.find(d => d.deviceId === this.currentDevice!.deviceId)) {
      sessionState.deviceHistory.push(this.currentDevice!);
    }

    // Update active device
    sessionState.activeDevice = this.currentDevice!;

    // Mark for sync
    sessionState.needsSync = true;

    // Clear local cache to force re-fetch
    if (typeof window !== 'undefined' && window.sessionStorage) {
      this.rubricStorage.clearSessionCache(sessionState.sessionId);
    }
  }

  // ========================================================================
  // PROGRESS TRACKING
  // ========================================================================

  /**
   * Start container
   * Called when student enters a container
   */
  async startContainer(
    sessionId: string,
    container: ContainerType,
    subject: Subject
  ): Promise<void> {
    console.log(`▶️ [Session] Starting container: ${container}-${subject}`);

    const sessionState = this.currentSession;

    if (!sessionState || sessionState.sessionId !== sessionId) {
      console.error(`❌ [Session] Session mismatch or not loaded`);
      return;
    }

    // Update current container
    sessionState.currentContainer = container;
    sessionState.currentSubject = subject;
    sessionState.lastUpdatedAt = new Date().toISOString();

    // Check if already started
    const existing = sessionState.completedContainers.find(
      c => c.container === container && c.subject === subject
    );

    if (!existing) {
      // Add to progress tracking
      const progress: ContainerProgress = {
        container,
        subject,
        startedAt: new Date().toISOString(),
        completedAt: null,
        score: null,
        attempts: 0,
        timeSpent: 0,
        deviceUsed: this.currentDevice!.deviceId
      };

      sessionState.completedContainers.push(progress);
    }

    // Save state
    await this.saveSessionState(sessionState);

    console.log(`✅ [Session] Container started on ${this.currentDevice!.deviceType}`);
  }

  /**
   * Complete container
   * Called when student finishes a container
   */
  async completeContainer(
    sessionId: string,
    container: ContainerType,
    subject: Subject,
    score: number,
    attempts: number,
    timeSpent: number
  ): Promise<void> {
    console.log(`✅ [Session] Completing container: ${container}-${subject} (score: ${score})`);

    const sessionState = this.currentSession;

    if (!sessionState || sessionState.sessionId !== sessionId) {
      console.error(`❌ [Session] Session mismatch or not loaded`);
      return;
    }

    // Find progress entry
    const progress = sessionState.completedContainers.find(
      c => c.container === container && c.subject === subject
    );

    if (progress) {
      progress.completedAt = new Date().toISOString();
      progress.score = score;
      progress.attempts = attempts;
      progress.timeSpent = timeSpent;
      progress.deviceUsed = this.currentDevice!.deviceId;
    }

    // Clear current container
    sessionState.currentContainer = null;
    sessionState.currentSubject = null;
    sessionState.lastUpdatedAt = new Date().toISOString();

    // Save state
    await this.saveSessionState(sessionState);

    console.log(`✅ [Session] Container completed`);
  }

  // ========================================================================
  // SESSION SYNCHRONIZATION
  // ========================================================================

  /**
   * Sync session state across devices
   * Ensures rubrics and progress are up-to-date
   */
  async syncSession(request: SessionSyncRequest): Promise<SessionSyncResponse> {
    console.log(`🔄 [Session] Syncing session: ${request.sessionId}`);

    // Load latest session state from Azure
    const sessionState = await this.loadSessionState(request.sessionId);

    if (!sessionState) {
      throw new Error(`Session not found: ${request.sessionId}`);
    }

    // Check if rubrics are cached in browser
    const rubricsCached = this.areRubricsCached(sessionState.sessionId);

    // Determine if rubrics need to be fetched
    const needsRubricFetch = !rubricsCached || sessionState.needsSync;

    // Update device info
    sessionState.activeDevice = request.currentDevice;
    sessionState.lastUpdatedAt = new Date().toISOString();
    sessionState.needsSync = false;

    // Save updated state
    await this.saveSessionState(sessionState);

    // Cache locally
    this.currentSession = sessionState;

    return {
      sessionState,
      rubricsCached,
      needsRubricFetch,
      conflictResolved: false
    };
  }

  /**
   * Check if rubrics are cached locally
   */
  private areRubricsCached(sessionId: string): boolean {
    if (typeof window === 'undefined' || !window.sessionStorage) {
      return false;
    }

    // Check if story rubric exists in cache
    const storyRubricKey = `story-rubric:${sessionId}`;
    return sessionStorage.getItem(storyRubricKey) !== null;
  }

  // ========================================================================
  // SESSION LOCKING
  // ========================================================================

  /**
   * Acquire session lock
   * Prevents concurrent modifications from multiple devices
   */
  async acquireLock(
    sessionId: string,
    operation: string
  ): Promise<SessionLock | null> {
    console.log(`🔒 [Session] Acquiring lock for: ${operation}`);

    const lockKey = `session-lock:${sessionId}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.LOCK_TTL_SECONDS * 1000);

    const lock: SessionLock = {
      sessionId,
      lockedBy: this.currentDevice!.deviceId,
      lockedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      operation
    };

    // In a real implementation, this would use a distributed lock
    // For now, we'll use Azure Storage with optimistic concurrency

    try {
      await this.azureStorage.uploadJSON(
        'dataRubrics', // Using existing container
        lockKey,
        lock,
        {
          lockType: 'session',
          operation
        }
      );

      console.log(`✅ [Session] Lock acquired`);
      return lock;
    } catch (error) {
      console.warn(`⚠️ [Session] Failed to acquire lock:`, error);
      return null;
    }
  }

  /**
   * Release session lock
   */
  async releaseLock(sessionId: string): Promise<void> {
    console.log(`🔓 [Session] Releasing lock for: ${sessionId}`);

    // In real implementation, delete the lock from storage
    // For now, we'll just log it
    console.log(`✅ [Session] Lock released`);
  }

  // ========================================================================
  // STORAGE OPERATIONS
  // ========================================================================

  /**
   * Save session state to Azure Storage
   */
  private async saveSessionState(sessionState: SessionState): Promise<void> {
    try {
      if (this.isBrowser) {
        // Use API endpoint in browser
        const response = await fetch(`${this.apiBaseUrl}/api/rubrics/session-state`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionState })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save session state via API');
        }
      } else {
        // Use Azure SDK in Node.js
        const blobPath = `${sessionState.sessionId}-state.json`;

        await this.azureStorage.uploadJSON(
          'dataRubrics', // Reusing existing container
          `sessions/${blobPath}`,
          sessionState,
          {
            sessionId: sessionState.sessionId,
            userId: sessionState.userId,
            activeDevice: sessionState.activeDevice.deviceId
          }
        );
      }
    } catch (error) {
      console.error(`❌ [Session] Failed to save state:`, error);
      throw error;
    }
  }

  /**
   * Load session state from Azure Storage
   */
  private async loadSessionState(sessionId: string): Promise<SessionState | null> {
    try {
      let sessionState: SessionState | null = null;

      if (this.isBrowser) {
        // Use API endpoint in browser
        const response = await fetch(`${this.apiBaseUrl}/api/rubrics/session-state/${sessionId}`);

        if (response.ok) {
          const data = await response.json();
          sessionState = data.data;
        } else if (response.status === 404) {
          return null;
        } else {
          throw new Error('Failed to load session state via API');
        }
      } else {
        // Use Azure SDK in Node.js
        const blobPath = `sessions/${sessionId}-state.json`;
        sessionState = await this.azureStorage.getJSON('dataRubrics', blobPath);
      }

      return sessionState;
    } catch (error) {
      console.error(`❌ [Session] Failed to load state:`, error);
      return null;
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Check if session is expired
   */
  private isSessionExpired(sessionState: SessionState): boolean {
    const expiresAt = new Date(sessionState.expiresAt);
    return new Date() > expiresAt;
  }

  /**
   * Get current session
   */
  getCurrentSession(): SessionState | null {
    return this.currentSession;
  }

  /**
   * Get current device
   */
  getCurrentDevice(): DeviceInfo | null {
    return this.currentDevice;
  }

  /**
   * Pause session
   */
  async pauseSession(sessionId: string): Promise<void> {
    if (!this.currentSession || this.currentSession.sessionId !== sessionId) {
      return;
    }

    this.currentSession.isPaused = true;
    this.currentSession.isActive = false;
    this.currentSession.lastUpdatedAt = new Date().toISOString();

    await this.saveSessionState(this.currentSession);

    console.log(`⏸️ [Session] Session paused`);
  }

  /**
   * End session
   */
  async endSession(sessionId: string): Promise<void> {
    if (!this.currentSession || this.currentSession.sessionId !== sessionId) {
      return;
    }

    this.currentSession.isActive = false;
    this.currentSession.lastUpdatedAt = new Date().toISOString();

    await this.saveSessionState(this.currentSession);

    // Clear local cache
    this.currentSession = null;

    console.log(`🛑 [Session] Session ended`);
  }

  /**
   * Setup heartbeat to keep session alive
   */
  private setupHeartbeat(): void {
    if (typeof window === 'undefined') return;

    // Update session every 60 seconds
    setInterval(async () => {
      if (this.currentSession && this.currentSession.isActive) {
        this.currentSession.lastUpdatedAt = new Date().toISOString();
        this.currentSession.activeDevice.lastActiveAt = new Date().toISOString();

        await this.saveSessionState(this.currentSession);
      }
    }, 60000); // 60 seconds
  }

  /**
   * Get session progress summary
   */
  getProgressSummary(sessionState: SessionState): {
    totalContainers: number;
    completedContainers: number;
    averageScore: number;
    totalTimeSpent: number;
  } {
    const completed = sessionState.completedContainers.filter(c => c.completedAt !== null);

    const totalScore = completed.reduce((sum, c) => sum + (c.score || 0), 0);
    const averageScore = completed.length > 0 ? totalScore / completed.length : 0;

    const totalTimeSpent = completed.reduce((sum, c) => sum + c.timeSpent, 0);

    return {
      totalContainers: sessionState.completedContainers.length,
      completedContainers: completed.length,
      averageScore: Math.round(averageScore),
      totalTimeSpent
    };
  }
}

// Export singleton instance getter
export const getSessionStateService = () => SessionStateService.getInstance();
