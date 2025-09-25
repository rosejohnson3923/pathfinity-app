/**
 * Journey Sync Service
 * Handles synchronization between localStorage and Supabase database
 * Implements automatic syncing with conflict resolution
 */

import { learningJourneyService, LearningJourney } from './LearningJourneyService';
import { journeyDatabaseService } from './database/JourneyDatabaseService';
import { isDemoUser, getDemoUserType } from '../utils/demoUserDetection';
import { DEMO_USER_CONFIG } from '../types/demo.types';

export interface SyncStatus {
  lastSync: string | null;
  syncInProgress: boolean;
  pendingChanges: number;
  lastError: string | null;
}

export class JourneySyncService {
  private static instance: JourneySyncService;
  private syncInterval: NodeJS.Timeout | null = null;
  private syncQueue: Map<string, LearningJourney> = new Map();
  private isSyncing = false;
  private deviceId: string;
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second delay

  private constructor() {
    this.deviceId = this.getOrCreateDeviceId();
    this.setupOfflineHandling();
  }

  /**
   * Setup offline/online event handlers
   */
  private setupOfflineHandling(): void {
    // Handle online event
    window.addEventListener('online', () => {
      console.log('🌐 Back online - processing sync queue');
      this.processQueue();
    });

    // Handle offline event
    window.addEventListener('offline', () => {
      console.log('📵 Went offline - syncing paused');
    });
  }

  static getInstance(): JourneySyncService {
    if (!JourneySyncService.instance) {
      JourneySyncService.instance = new JourneySyncService();
    }
    return JourneySyncService.instance;
  }

  /**
   * Get or create a unique device ID
   */
  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  /**
   * Start automatic sync process
   */
  startAutoSync(intervalMs: number = 30000): void {
    // Clear existing interval if any
    this.stopAutoSync();

    // Initial sync
    this.syncAll();

    // Set up recurring sync
    this.syncInterval = setInterval(() => {
      this.syncAll();
    }, intervalMs);

    console.log(`📡 Auto-sync started with ${intervalMs}ms interval`);
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('📡 Auto-sync stopped');
    }
  }

  /**
   * Queue a journey for syncing
   */
  queueForSync(userId: string, tenantId: string, gradeLevel: string): void {
    // Check demo user type and permissions
    const demoType = getDemoUserType({ id: userId });
    const config = DEMO_USER_CONFIG[demoType];

    // Skip sync for demo viewers (read-only)
    if (demoType === 'demo-viewer') {
      console.log(`👁️ Demo Viewer: Skipping sync for read-only user ${userId}`);
      return;
    }

    // Allow sync for demo students (with flags) and production users
    if (demoType === 'demo-student') {
      console.log(`🎓 Demo Student: Queueing sync with demo flags for ${userId}`);
    }

    const journey = learningJourneyService.getJourney(userId, tenantId, gradeLevel);
    if (journey) {
      const key = `${userId}_${tenantId}_${gradeLevel}`;
      this.syncQueue.set(key, journey);
      console.log(`📝 Queued journey for sync: ${key}`);

      // Trigger sync if not already in progress
      if (!this.isSyncing) {
        this.processQueue();
      }
    }
  }

  /**
   * Process sync queue
   */
  private async processQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.size === 0) {
      return;
    }

    this.isSyncing = true;

    try {
      const entries = Array.from(this.syncQueue.entries());

      for (const [key, journey] of entries) {
        const [userId, tenantId, gradeLevel] = key.split('_');

        try {
          await this.syncJourney(userId, tenantId, gradeLevel, journey);
          this.syncQueue.delete(key);
        } catch (error) {
          console.error(`Failed to sync journey ${key}:`, error);
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a single journey with retry logic
   */
  private async syncJourney(
    userId: string,
    tenantId: string,
    gradeLevel: string,
    localJourney: LearningJourney
  ): Promise<void> {
    // Check demo user type for permissions
    const demoType = getDemoUserType({ id: userId });
    const config = DEMO_USER_CONFIG[demoType];

    // Block sync for demo viewers
    if (!config.canWrite) {
      console.log(`🚫 Read-only user ${userId} cannot sync to database`);
      return;
    }

    // Log if demo student (data will be flagged in database service)
    if (demoType === 'demo-student') {
      console.log(`📝 Syncing demo student ${userId} with demo flags`);
    }

    const key = `${userId}_${tenantId}_${gradeLevel}`;
    const attempts = this.retryAttempts.get(key) || 0;

    try {
      // Check if we're offline
      if (!navigator.onLine) {
        console.log('📵 Offline - queueing sync for later');
        this.syncQueue.set(key, localJourney);
        return;
      }

      // Get database journey
      const { data: dbJourney, error: fetchError } = await journeyDatabaseService.getJourney(
        userId,
        tenantId,
        gradeLevel
      );

      if (fetchError) {
        throw new Error(`Failed to fetch journey: ${fetchError}`);
      }

      // Resolve conflicts (last write wins for now)
      const journeyToSave = this.resolveConflicts(localJourney, dbJourney);

      // Save to database
      const { error: saveError } = await journeyDatabaseService.saveJourney(
        journeyToSave,
        userId,
        tenantId,
        gradeLevel
      );

      if (saveError) {
        throw new Error(`Failed to save journey: ${saveError}`);
      }

      // Update sync metadata
      await journeyDatabaseService.updateSyncMetadata(userId, this.deviceId, {
        sync_version: (journeyToSave as any).sync_version || 1,
        conflicts: []
      });

      // Clear retry attempts on success
      this.retryAttempts.delete(key);

      console.log(`✅ Synced journey for user ${userId} in tenant ${tenantId}, grade ${gradeLevel}`);
    } catch (error) {
      console.error('Sync error:', error);

      // Implement exponential backoff retry
      if (attempts < this.maxRetries) {
        const newAttempts = attempts + 1;
        this.retryAttempts.set(key, newAttempts);

        const delay = this.retryDelay * Math.pow(2, attempts); // Exponential backoff
        console.log(`🔄 Retry ${newAttempts}/${this.maxRetries} in ${delay}ms for ${key}`);

        setTimeout(() => {
          this.syncJourney(userId, tenantId, gradeLevel, localJourney);
        }, delay);
      } else {
        console.error(`❌ Max retries reached for ${key}. Sync failed.`);
        this.retryAttempts.delete(key);
        localStorage.setItem('lastJourneySyncError', error.message || 'Unknown error');
      }
    }
  }

  /**
   * Resolve conflicts between local and database journeys
   */
  private resolveConflicts(
    local: LearningJourney,
    database: LearningJourney | null
  ): LearningJourney {
    // If no database version, use local
    if (!database) {
      return local;
    }

    // Compare last accessed dates
    const localDate = new Date(local.lastAccessedDate || 0).getTime();
    const dbDate = new Date(database.lastAccessedDate || 0).getTime();

    // Last write wins
    if (localDate >= dbDate) {
      return local;
    }

    // Database is newer - merge specific fields that should be kept from local
    return {
      ...database,
      // Keep local device-specific fields
      lastActiveDate: local.lastActiveDate || database.lastActiveDate,
      streakDays: Math.max(local.streakDays || 0, database.streakDays || 0),
      timeSpentMinutes: Math.max(
        local.timeSpentMinutes || 0,
        database.timeSpentMinutes || 0
      )
    };
  }

  /**
   * Sync all journeys for current user
   */
  async syncAll(): Promise<void> {
    if (this.isSyncing) {
      console.log('⏳ Sync already in progress, skipping...');
      return;
    }

    console.log('🔄 Starting full sync...');
    this.isSyncing = true;

    try {
      // Get all journeys from localStorage
      const allJourneys = this.getAllLocalJourneys();

      // Filter out demo viewers and process others
      const syncableJourneys = allJourneys.filter(({ userId }) => {
        const demoType = getDemoUserType({ id: userId });
        if (demoType === 'demo-viewer') {
          console.log(`👁️ Skipping sync for demo viewer ${userId}`);
          return false;
        }
        return true;
      });

      for (const { userId, tenantId, gradeLevel, journey } of syncableJourneys) {
        try {
          await this.syncJourney(userId, tenantId, gradeLevel, journey);
        } catch (error) {
          console.error(`Failed to sync journey for ${userId}:`, error);
        }
      }

      // Update last sync time
      localStorage.setItem('lastJourneySync', new Date().toISOString());
      console.log('✅ Full sync completed');
    } catch (error) {
      console.error('Full sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Get all journeys from localStorage
   */
  private getAllLocalJourneys(): Array<{
    userId: string;
    tenantId: string;
    gradeLevel: string;
    journey: LearningJourney;
  }> {
    const journeys: Array<{
      userId: string;
      tenantId: string;
      gradeLevel: string;
      journey: LearningJourney;
    }> = [];

    const prefix = 'learningJourney_';

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const parts = key.replace(prefix, '').split('_');

          // Handle different key formats
          let userId: string, tenantId: string, gradeLevel: string;

          if (parts.length === 3) {
            // New format: tenant_user_grade
            [tenantId, userId, gradeLevel] = parts;
          } else if (parts.length === 2) {
            // Tenant-aware format without grade
            [tenantId, userId] = parts;
            gradeLevel = 'K'; // Default grade
          } else if (parts.length === 1) {
            // Old format: just user
            userId = parts[0];
            tenantId = 'unknown';
            gradeLevel = 'K';
          } else {
            continue;
          }

          const stored = localStorage.getItem(key);
          if (stored) {
            const journey = JSON.parse(stored) as LearningJourney;
            journeys.push({ userId, tenantId, gradeLevel, journey });
          }
        } catch (error) {
          console.error(`Failed to parse journey from ${key}:`, error);
        }
      }
    }

    return journeys;
  }

  /**
   * Force sync a specific journey
   */
  async forceSync(
    userId: string,
    tenantId: string,
    gradeLevel: string
  ): Promise<{ success: boolean; error?: any }> {
    // Check permissions first
    const demoType = getDemoUserType({ id: userId });
    const config = DEMO_USER_CONFIG[demoType];

    if (!config.canWrite) {
      return {
        success: false,
        error: 'Read-only access - syncing not permitted for demo viewers'
      };
    }

    try {
      const journey = learningJourneyService.getJourney(userId, tenantId, gradeLevel);
      if (!journey) {
        return { success: false, error: 'No journey found' };
      }

      await this.syncJourney(userId, tenantId, gradeLevel, journey);
      return { success: true };
    } catch (error) {
      console.error('Force sync error:', error);
      return { success: false, error };
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    const lastSync = localStorage.getItem('lastJourneySync');
    const lastError = localStorage.getItem('lastJourneySyncError');

    return {
      lastSync,
      syncInProgress: this.isSyncing,
      pendingChanges: this.syncQueue.size,
      lastError
    };
  }

  /**
   * Clear sync queue
   */
  clearQueue(): void {
    this.syncQueue.clear();
    console.log('📭 Sync queue cleared');
  }

  /**
   * Pull latest data from database to localStorage
   */
  async pullFromDatabase(
    userId: string,
    tenantId: string,
    gradeLevel: string
  ): Promise<{ success: boolean; error?: any }> {
    // Check if demo user
    const demoType = getDemoUserType({ id: userId });

    // Demo users should not pull from database (they use local data)
    if (demoType !== 'production') {
      console.log(`🎭 Demo ${demoType}: Using local data only, not pulling from database`);
      return {
        success: false,
        error: 'Demo users use local data only'
      };
    }

    try {
      const { data: dbJourney, error } = await journeyDatabaseService.getJourney(
        userId,
        tenantId,
        gradeLevel
      );

      if (error) {
        return { success: false, error };
      }

      if (dbJourney) {
        // Save to localStorage
        learningJourneyService.saveJourney(userId, dbJourney, tenantId, gradeLevel);
        console.log(`⬇️ Pulled journey from database for ${userId}`);
        return { success: true };
      }

      return { success: false, error: 'No journey found in database' };
    } catch (error) {
      console.error('Pull error:', error);
      return { success: false, error };
    }
  }
}

// Export singleton instance
export const journeySyncService = JourneySyncService.getInstance();