/**
 * Session Types
 *
 * Defines session state structures for cross-device session management.
 * Enables students to switch devices mid-lesson (e.g., computer → tablet).
 *
 * Phase 4 Implementation
 */

import type { ContainerType, Subject } from './MasterNarrativeTypes';

/**
 * Device Information
 * Identifies the device being used
 */
export interface DeviceInfo {
  deviceId: string;           // Unique device identifier
  deviceType: 'desktop' | 'tablet' | 'mobile' | 'unknown';
  browser: string;            // Browser name/version
  os: string;                 // Operating system
  lastActiveAt: string;       // ISO timestamp of last activity
  ipAddress?: string;         // Optional IP address for security
}

/**
 * Session State
 * Tracks student progress and device state
 */
export interface SessionState {
  sessionId: string;
  userId: string;

  // Session metadata
  createdAt: string;
  lastUpdatedAt: string;
  expiresAt: string;          // Session expiration

  // Active device tracking
  activeDevice: DeviceInfo;
  deviceHistory: DeviceInfo[];

  // Progress tracking
  currentContainer: ContainerType | null;
  currentSubject: Subject | null;

  completedContainers: ContainerProgress[];

  // Session flags
  isActive: boolean;
  isPaused: boolean;
  needsSync: boolean;         // Indicates data needs sync from storage

  // Metadata
  version: string;
}

/**
 * Container Progress
 * Tracks completion of individual containers
 */
export interface ContainerProgress {
  container: ContainerType;
  subject: Subject;
  startedAt: string;
  completedAt: string | null;
  score: number | null;
  attempts: number;
  timeSpent: number;          // Seconds
  deviceUsed: string;         // Device ID that completed it
}

/**
 * Session Sync Request
 * Request to sync session state across devices
 */
export interface SessionSyncRequest {
  sessionId: string;
  deviceId: string;
  currentDevice: DeviceInfo;
}

/**
 * Session Sync Response
 * Response containing synchronized session state
 */
export interface SessionSyncResponse {
  sessionState: SessionState;
  rubricsCached: boolean;
  needsRubricFetch: boolean;
  conflictResolved: boolean;
  conflictDetails?: string;
}

/**
 * Device Switch Event
 * Triggered when user switches devices
 */
export interface DeviceSwitchEvent {
  sessionId: string;
  fromDevice: DeviceInfo;
  toDevice: DeviceInfo;
  switchedAt: string;
  reason: 'manual' | 'timeout' | 'error';
}

/**
 * Session Lock
 * Prevents concurrent access from multiple devices
 */
export interface SessionLock {
  sessionId: string;
  lockedBy: string;           // Device ID
  lockedAt: string;
  expiresAt: string;
  operation: string;          // What operation is locked
}
