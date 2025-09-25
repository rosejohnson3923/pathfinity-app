/**
 * Learning Journey Service
 * Manages user-specific career and companion selections with proper isolation
 * Prevents cross-user contamination while maintaining persistence across sessions
 */

export interface LearningJourney {
  // Existing fields
  career: string | null;
  careerData?: any;
  careerSelectedDate?: string;
  companion: string | null;
  companionSelectedDate?: string;
  lastAccessedDate: string;

  // PHASE 0: Required context (completed)
  user_id?: string;
  tenant_id?: string;
  grade_level?: string;  // Using underscore to match database
  school_year?: string;

  // PHASE 1: Progress tracking
  completionPercentage?: number;
  skillsCompleted?: number;
  skillsTotal?: number;
  advancedEarly?: boolean;
  lastSkillCompleted?: string;
  lastSkillCompletedDate?: string;
  currentUnit?: string;
  currentLesson?: string;
  timeSpentMinutes?: number;
  streakDays?: number;
  lastActiveDate?: string;
}

// Parent Override Interface for Phase 1
export interface ParentOverride {
  student_id: string;
  from_grade: string;
  to_grade: string;
  completion_at_override: number;
  override_date: string;
  parent_id: string;
  reason?: string;
  skills_incomplete?: string[];  // Skills that need remediation
}

// Sync metadata for cross-device support
export interface SyncMetadata {
  device_id?: string;
  last_sync?: string;
  sync_version?: number;
  conflicts?: any[];
}

class LearningJourneyService {
  private readonly STORAGE_PREFIX = 'learningJourney';

  /**
   * Get current school year (Aug-Jul format)
   */
  private getCurrentSchoolYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // School year starts in August (month 7)
    if (month >= 7) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  }

  /**
   * Get the storage key for a specific user with tenant context
   * Backward compatible: tries new format first, falls back to old
   */
  private getUserKey(userId: string, tenantId?: string, grade_level?: string): string {
    // New format with full context
    if (tenantId && grade_level) {
      return `${this.STORAGE_PREFIX}_${tenantId}_${userId}_${grade_level}`;
    }
    // Tenant-aware format (minimum viable)
    if (tenantId) {
      return `${this.STORAGE_PREFIX}_${tenantId}_${userId}`;
    }
    // Old format for backward compatibility
    return `${this.STORAGE_PREFIX}_${userId}`;
  }

  /**
   * Save a user's learning journey with tenant and grade context
   */
  saveJourney(
    userId: string,
    journey: Partial<LearningJourney>,
    tenantId?: string,
    grade_level?: string
  ): void {
    if (!userId) {
      console.warn('Cannot save journey without user ID');
      return;
    }

    // Get existing journey with new context
    const existingJourney = this.getJourney(userId, tenantId, grade_level);
    const updatedJourney: LearningJourney = {
      ...existingJourney,
      ...journey,
      user_id: userId,
      tenant_id: tenantId,
      grade_level,
      school_year: this.getCurrentSchoolYear(),
      lastAccessedDate: new Date().toISOString()
    };

    try {
      const key = this.getUserKey(userId, tenantId, grade_level);
      localStorage.setItem(key, JSON.stringify(updatedJourney));
      console.log(`✅ Saved learning journey for user ${userId} in tenant ${tenantId}:`, updatedJourney);
    } catch (error) {
      console.error('Failed to save learning journey:', error);
    }
  }

  /**
   * Get a user's learning journey with tenant context
   * Tries new format first, falls back to old format for migration
   */
  getJourney(userId: string, tenantId?: string, grade_level?: string): LearningJourney | null {
    if (!userId) {
      console.warn('Cannot get journey without user ID');
      return null;
    }

    try {
      // Try new format first
      let key = this.getUserKey(userId, tenantId, grade_level);
      let stored = localStorage.getItem(key);

      // If not found and we have tenant, try without grade
      if (!stored && tenantId && grade_level) {
        key = this.getUserKey(userId, tenantId);
        stored = localStorage.getItem(key);
      }

      // If still not found, try old format for backward compatibility
      if (!stored) {
        const oldKey = this.getUserKey(userId);
        stored = localStorage.getItem(oldKey);

        // If found in old format and we have new context, migrate it
        if (stored && tenantId) {
          console.log(`🔄 Migrating journey for user ${userId} to tenant-aware format`);
          const journey = JSON.parse(stored) as LearningJourney;

          // Directly save to new format without calling saveJourney to avoid infinite loop
          const updatedJourney: LearningJourney = {
            ...journey,
            user_id: userId,
            tenant_id: tenantId,
            grade_level,
            school_year: this.getCurrentSchoolYear(),
            lastAccessedDate: journey.lastAccessedDate || new Date().toISOString()
          };

          const newKey = this.getUserKey(userId, tenantId, grade_level);
          localStorage.setItem(newKey, JSON.stringify(updatedJourney));
          console.log(`✅ Migrated journey to new format for user ${userId} in tenant ${tenantId}`);

          // Remove old format
          localStorage.removeItem(oldKey);
        }
      }

      if (stored) {
        const journey = JSON.parse(stored) as LearningJourney;
        console.log(`📚 Retrieved learning journey for user ${userId} in tenant ${tenantId}:`, journey);
        return journey;
      }
    } catch (error) {
      console.error('Failed to retrieve learning journey:', error);
    }

    return null;
  }

  /**
   * Update only the career selection
   */
  saveCareer(userId: string, career: string, careerData?: any, tenantId?: string, grade_level?: string): void {
    this.saveJourney(userId, {
      career,
      careerData,
      careerSelectedDate: new Date().toISOString()
    }, tenantId, grade_level);
  }

  /**
   * Update only the companion selection
   */
  saveCompanion(userId: string, companion: string, tenantId?: string, grade_level?: string): void {
    this.saveJourney(userId, {
      companion,
      companionSelectedDate: new Date().toISOString()
    }, tenantId, grade_level);
  }

  /**
   * Clear a user's journey (for starting fresh)
   * Clears all formats to ensure complete removal
   */
  clearJourney(userId: string, tenantId?: string, grade_level?: string): void {
    if (!userId) {
      console.warn('Cannot clear journey without user ID');
      return;
    }

    try {
      // Clear new format if context provided
      if (tenantId) {
        const newKey = this.getUserKey(userId, tenantId, grade_level);
        localStorage.removeItem(newKey);

        // Also try without grade
        if (grade_level) {
          const tenantKey = this.getUserKey(userId, tenantId);
          localStorage.removeItem(tenantKey);
        }
      }

      // Always clear old format for complete cleanup
      const oldKey = this.getUserKey(userId);
      localStorage.removeItem(oldKey);

      console.log(`🗑️ Cleared learning journey for user ${userId} in tenant ${tenantId || 'all'}`);
    } catch (error) {
      console.error('Failed to clear learning journey:', error);
    }
  }

  /**
   * Check if user has a saved journey from a previous session
   */
  hasExistingJourney(userId: string, tenantId?: string, grade_level?: string): boolean {
    const journey = this.getJourney(userId, tenantId, grade_level);
    return !!(journey?.career && journey?.companion);
  }

  /**
   * Get journey age in days
   */
  getJourneyAge(userId: string, tenantId?: string, grade_level?: string): number {
    const journey = this.getJourney(userId, tenantId, grade_level);
    if (!journey?.lastAccessedDate) return 0;

    const lastAccess = new Date(journey.lastAccessedDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastAccess.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Clean up old journeys (optional maintenance)
   */
  cleanupOldJourneys(daysToKeep: number = 30): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.STORAGE_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const journey = JSON.parse(stored) as LearningJourney;
            const lastAccess = new Date(journey.lastAccessedDate);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - lastAccess.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > daysToKeep) {
              keysToRemove.push(key);
            }
          }
        } catch (error) {
          console.error(`Failed to check journey ${key}:`, error);
        }
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🧹 Cleaned up old journey: ${key}`);
    });
  }

  /**
   * Migrate old non-user-specific selections to user-specific
   * This helps transition existing users
   */
  migrateOldSelections(userId: string, tenantId?: string, grade_level?: string): void {
    if (!userId) return;

    // Check if user already has migrated data
    if (this.hasExistingJourney(userId, tenantId, grade_level)) return;

    // Check for old sessionStorage values (non-user-specific)
    const oldCompanion = sessionStorage.getItem('selectedCompanion');
    const oldCareer = sessionStorage.getItem('selectedCareer');

    if (oldCompanion || oldCareer) {
      console.log(`🔄 Migrating old selections for user ${userId} in tenant ${tenantId}`);

      this.saveJourney(userId, {
        career: oldCareer,
        companion: oldCompanion,
        lastAccessedDate: new Date().toISOString()
      }, tenantId, grade_level);

      // Clear old non-user-specific values
      sessionStorage.removeItem('selectedCompanion');
      sessionStorage.removeItem('selectedCareer');
    }
  }

  /**
   * PHASE 1: Progress Tracking Methods
   */

  /**
   * Update skill progress for a user
   */
  updateSkillProgress(
    userId: string,
    skillId: string,
    completed: boolean,
    tenantId?: string,
    grade_level?: string
  ): void {
    const journey = this.getJourney(userId, tenantId, grade_level);
    if (!journey) return;

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Update streak
    let streakDays = journey.streakDays || 0;
    if (journey.lastActiveDate) {
      const lastActive = new Date(journey.lastActiveDate);
      const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        streakDays += 1;
      } else if (daysDiff > 1) {
        streakDays = 1; // Reset streak
      }
      // If same day (daysDiff === 0), keep current streak
    } else {
      streakDays = 1;
    }

    // Update progress
    const updates: Partial<LearningJourney> = {
      lastSkillCompleted: skillId,
      lastSkillCompletedDate: now.toISOString(),
      lastActiveDate: today,
      streakDays
    };

    if (completed) {
      updates.skillsCompleted = (journey.skillsCompleted || 0) + 1;

      // Recalculate completion percentage if we know total skills
      if (journey.skillsTotal && journey.skillsTotal > 0) {
        updates.completionPercentage = ((updates.skillsCompleted || 0) / journey.skillsTotal) * 100;
      }
    }

    this.saveJourney(userId, updates, tenantId, grade_level);
  }

  /**
   * Update time spent learning
   */
  updateTimeSpent(
    userId: string,
    minutes: number,
    tenantId?: string,
    grade_level?: string
  ): void {
    const journey = this.getJourney(userId, tenantId, grade_level);
    if (!journey) return;

    this.saveJourney(userId, {
      timeSpentMinutes: (journey.timeSpentMinutes || 0) + minutes,
      lastActiveDate: new Date().toISOString().split('T')[0]
    }, tenantId, grade_level);
  }

  /**
   * Set current learning context
   */
  setCurrentContext(
    userId: string,
    unit: string,
    lesson: string,
    tenantId?: string,
    grade_level?: string
  ): void {
    this.saveJourney(userId, {
      currentUnit: unit,
      currentLesson: lesson
    }, tenantId, grade_level);
  }

  /**
   * Handle parent override for grade advancement
   */
  saveParentOverride(override: ParentOverride, tenantId?: string): void {
    const key = `parentOverride_${override.student_id}_${override.override_date}`;
    try {
      localStorage.setItem(key, JSON.stringify(override));
      console.log(`👨‍👩‍👧 Saved parent override for student ${override.student_id}`);

      // Mark journey as advanced early in the new grade
      this.saveJourney(override.student_id, {
        advancedEarly: true,
        grade_level: override.to_grade
      }, tenantId, override.to_grade);
    } catch (error) {
      console.error('Failed to save parent override:', error);
    }
  }

  /**
   * Get parent overrides for a student
   */
  getParentOverrides(studentId: string): ParentOverride[] {
    const overrides: ParentOverride[] = [];
    const prefix = `parentOverride_${studentId}_`;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            overrides.push(JSON.parse(stored) as ParentOverride);
          }
        } catch (error) {
          console.error(`Failed to parse override ${key}:`, error);
        }
      }
    }

    return overrides.sort((a, b) =>
      new Date(b.override_date).getTime() - new Date(a.override_date).getTime()
    );
  }

  /**
   * Calculate days in current streak
   */
  getStreakDays(userId: string, tenantId?: string, grade_level?: string): number {
    const journey = this.getJourney(userId, tenantId, grade_level);
    if (!journey || !journey.lastActiveDate) return 0;

    const lastActive = new Date(journey.lastActiveDate + 'T00:00:00'); // Parse as date only
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastActive.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    // If last active was today or yesterday, return streak
    if (daysDiff <= 1) {
      return journey.streakDays || 1;
    }

    // Streak is broken
    return 0;
  }

  /**
   * Get sync metadata for cross-device support
   */
  getSyncMetadata(userId: string): SyncMetadata {
    const key = `syncMetadata_${userId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        return JSON.parse(stored) as SyncMetadata;
      } catch (error) {
        console.error('Failed to parse sync metadata:', error);
      }
    }

    // Return default metadata
    return {
      device_id: this.getDeviceId(),
      last_sync: new Date().toISOString(),
      sync_version: 1,
      conflicts: []
    };
  }

  /**
   * Update sync metadata
   */
  updateSyncMetadata(userId: string, metadata: Partial<SyncMetadata>): void {
    const current = this.getSyncMetadata(userId);
    const updated = {
      ...current,
      ...metadata,
      last_sync: new Date().toISOString()
    };

    const key = `syncMetadata_${userId}`;
    localStorage.setItem(key, JSON.stringify(updated));
  }

  /**
   * Get or generate device ID for sync
   */
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }
}

// Export singleton instance
export const learningJourneyService = new LearningJourneyService();

// Also export the type for use in components
export default learningJourneyService;