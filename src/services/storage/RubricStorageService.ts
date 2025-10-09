/**
 * Rubric Storage Service
 *
 * Handles storage and retrieval of rubrics in Azure Blob Storage.
 * Provides granular access to individual rubrics with sessionStorage caching.
 *
 * Storage Structure:
 * - story-rubrics/{sessionId}/story-rubric.json
 * - data-rubrics/{sessionId}/{container}-{subject}.json
 * - master-narratives/{sessionId}/enriched-narrative.json
 *
 * Phase 2 Implementation (Task 2.3)
 */

import { getAzureStorage, AzureStorageService } from './AzureStorageService';
import type {
  StoryRubric,
  DataRubric
} from '../../types/RubricTypes';
import type {
  EnrichedMasterNarrative,
  ContainerType,
  Subject
} from '../../types/MasterNarrativeTypes';

/**
 * Rubric Storage Service
 * Manages rubric storage in Azure Blob Storage with sessionStorage caching
 * Automatically uses API endpoints when running in browser
 */
export class RubricStorageService {
  private azureStorage: AzureStorageService | null;
  private useSessionStorage: boolean;
  private isBrowser: boolean;
  private apiBaseUrl: string;

  constructor(connectionString?: string) {
    this.isBrowser = typeof window !== 'undefined';
    this.useSessionStorage = this.isBrowser && typeof sessionStorage !== 'undefined';

    // API endpoint for browser-based operations
    // Support both Vite (VITE_) and CRA (REACT_APP_) prefixes
    // VITE_API_URL already includes /api, so use it as-is
    const apiUrl = this.isBrowser
      ? (import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3002/api')
      : '';

    // Remove /api from base URL since we'll add it in fetch calls
    this.apiBaseUrl = apiUrl.replace(/\/api$/, '');

    // Only initialize Azure SDK in Node.js environment
    if (this.isBrowser) {
      console.log('🌐 [RubricStorage] Running in browser, will use API endpoints');
      this.azureStorage = null;
    } else {
      this.azureStorage = getAzureStorage(connectionString);
    }
  }

  // ========================================================================
  // ENRICHED MASTER NARRATIVE STORAGE
  // ========================================================================

  /**
   * Save Enriched Master Narrative to Azure Storage
   * Storage path: enriched-narratives/{sessionId}.json
   */
  async saveEnrichedNarrative(
    enrichedNarrative: EnrichedMasterNarrative
  ): Promise<{ url: string; blobName: string }> {
    console.log(`💾 Saving Enriched Master Narrative: ${enrichedNarrative.sessionId}`);

    try {
      let result: { url: string; blobName: string };

      if (this.isBrowser) {
        // Use API endpoint in browser
        const response = await fetch(`${this.apiBaseUrl}/api/rubrics/enriched-narrative`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enrichedNarrative })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save via API');
        }

        const data = await response.json();
        result = { url: data.url, blobName: data.blobName };
      } else {
        // Use Azure SDK in Node.js
        const blobPath = `${enrichedNarrative.sessionId}.json`;
        result = await this.azureStorage!.uploadJSON(
          'enrichedNarratives',
          blobPath,
          enrichedNarrative,
          {
            sessionId: enrichedNarrative.sessionId,
            userId: enrichedNarrative.userId,
            gradeLevel: enrichedNarrative.gradeLevel,
            companion: enrichedNarrative.companion,
            career: enrichedNarrative.career
          }
        );
      }

      // Cache in sessionStorage if available
      if (this.useSessionStorage) {
        this.cacheInSessionStorage(
          `enriched-narrative:${enrichedNarrative.sessionId}`,
          enrichedNarrative
        );
      }

      console.log(`✅ Enriched Master Narrative saved: ${result.blobName}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to save Enriched Master Narrative:', error);
      throw error;
    }
  }

  /**
   * Retrieve Enriched Master Narrative from Azure Storage
   * Checks sessionStorage cache first, then Azure
   */
  async getEnrichedNarrative(
    sessionId: string
  ): Promise<EnrichedMasterNarrative | null> {
    console.log(`🔍 Retrieving Enriched Master Narrative: ${sessionId}`);

    // Check sessionStorage cache first
    if (this.useSessionStorage) {
      const cached = this.getFromSessionStorage<EnrichedMasterNarrative>(
        `enriched-narrative:${sessionId}`
      );
      if (cached) {
        console.log('✅ Retrieved from sessionStorage cache');
        return cached;
      }
    }

    // Fetch from Azure Storage
    try {
      let narrative: EnrichedMasterNarrative | null = null;

      if (this.isBrowser) {
        // Use API endpoint in browser
        const response = await fetch(`${this.apiBaseUrl}/api/rubrics/enriched-narrative/${sessionId}`);

        if (response.ok) {
          const data = await response.json();
          narrative = data.data;
        } else if (response.status === 404) {
          console.warn(`⚠️ Enriched Master Narrative not found: ${sessionId}`);
          return null;
        } else {
          throw new Error('Failed to retrieve via API');
        }
      } else {
        // Use Azure SDK in Node.js
        const blobPath = `${sessionId}.json`;
        narrative = await this.azureStorage!.getJSON('enrichedNarratives', blobPath);
      }

      if (narrative) {
        // Cache in sessionStorage
        if (this.useSessionStorage) {
          this.cacheInSessionStorage(
            `enriched-narrative:${sessionId}`,
            narrative
          );
        }
        console.log('✅ Retrieved from Azure Storage');
        return narrative;
      }

      console.warn(`⚠️ Enriched Master Narrative not found: ${sessionId}`);
      return null;
    } catch (error) {
      console.error('❌ Failed to retrieve Enriched Master Narrative:', error);
      return null;
    }
  }

  // ========================================================================
  // STORY RUBRIC STORAGE
  // ========================================================================

  /**
   * Save Story Rubric to Azure Storage
   * Storage path: story-rubrics/{sessionId}.json
   */
  async saveStoryRubric(
    storyRubric: StoryRubric
  ): Promise<{ url: string; blobName: string }> {
    console.log(`💾 Saving Story Rubric: ${storyRubric.sessionId}`);

    try {
      let result: { url: string; blobName: string };

      if (this.isBrowser) {
        // Use API endpoint in browser
        const response = await fetch(`${this.apiBaseUrl}/api/rubrics/story-rubric`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ storyRubric })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save via API');
        }

        const data = await response.json();
        result = { url: data.url, blobName: data.blobName };
      } else {
        // Use Azure SDK in Node.js
        const blobPath = `${storyRubric.sessionId}.json`;
        result = await this.azureStorage!.uploadJSON(
          'storyRubrics',
          blobPath,
          storyRubric,
          {
            sessionId: storyRubric.sessionId
          }
        );
      }

      // Cache in sessionStorage
      if (this.useSessionStorage) {
        this.cacheInSessionStorage(
          `story-rubric:${storyRubric.sessionId}`,
          storyRubric
        );
      }

      console.log(`✅ Story Rubric saved: ${result.blobName}`);
      return result;
    } catch (error) {
      console.error('❌ Failed to save Story Rubric:', error);
      throw error;
    }
  }

  /**
   * Retrieve Story Rubric from Azure Storage
   * Checks sessionStorage cache first, then Azure
   */
  async getStoryRubric(
    sessionId: string
  ): Promise<StoryRubric | null> {
    console.log(`🔍 Retrieving Story Rubric: ${sessionId}`);

    // Check sessionStorage cache first
    if (this.useSessionStorage) {
      const cached = this.getFromSessionStorage<StoryRubric>(
        `story-rubric:${sessionId}`
      );
      if (cached) {
        console.log('✅ Retrieved from sessionStorage cache');
        return cached;
      }
    }

    // Fetch from Azure Storage
    try {
      let rubric: StoryRubric | null = null;

      if (this.isBrowser) {
        // Use API endpoint in browser
        const response = await fetch(`${this.apiBaseUrl}/api/rubrics/story-rubric/${sessionId}`);

        if (response.ok) {
          const data = await response.json();
          rubric = data.data;
        } else if (response.status === 404) {
          console.warn(`⚠️ Story Rubric not found: ${sessionId}`);
          return null;
        } else {
          throw new Error('Failed to retrieve via API');
        }
      } else {
        // Use Azure SDK in Node.js
        const blobPath = `${sessionId}.json`;
        rubric = await this.azureStorage!.getJSON('storyRubrics', blobPath);
      }

      if (rubric) {
        // Cache in sessionStorage
        if (this.useSessionStorage) {
          this.cacheInSessionStorage(
            `story-rubric:${sessionId}`,
            rubric
          );
        }
        console.log('✅ Retrieved from Azure Storage');
        return rubric;
      }

      console.warn(`⚠️ Story Rubric not found: ${sessionId}`);
      return null;
    } catch (error) {
      console.error('❌ Failed to retrieve Story Rubric:', error);
      return null;
    }
  }

  // ========================================================================
  // DATA RUBRIC STORAGE
  // ========================================================================

  /**
   * Save single Data Rubric to Azure Storage
   * Storage path: data-rubrics/{sessionId}/{container}-{subject}.json
   */
  async saveDataRubric(
    dataRubric: DataRubric
  ): Promise<{ url: string; blobName: string }> {
    const rubricId = `${dataRubric.container}-${dataRubric.subject}`;
    console.log(`💾 Saving Data Rubric: ${dataRubric.sessionId}/${rubricId}`);

    try {
      let result: { url: string; blobName: string };

      if (this.isBrowser) {
        // Use API endpoint in browser
        const response = await fetch(`${this.apiBaseUrl}/api/rubrics/data-rubric`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataRubric })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save via API');
        }

        const data = await response.json();
        result = { url: data.url, blobName: data.blobName };
      } else {
        // Use Azure SDK in Node.js
        const blobPath = `${dataRubric.sessionId}/${rubricId}.json`;
        result = await this.azureStorage!.uploadJSON(
          'dataRubrics',
          blobPath,
          dataRubric,
          {
            sessionId: dataRubric.sessionId,
            container: dataRubric.container,
            subject: dataRubric.subject,
            skillId: dataRubric.skill.id,
            gradeLevel: dataRubric.skill.gradeLevel
          }
        );
      }

      // Cache in sessionStorage
      if (this.useSessionStorage) {
        this.cacheInSessionStorage(
          `data-rubric:${dataRubric.sessionId}:${rubricId}`,
          dataRubric
        );
      }

      console.log(`✅ Data Rubric saved: ${result.blobName}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to save Data Rubric ${rubricId}:`, error);
      throw error;
    }
  }

  /**
   * Save all Data Rubrics for a session
   * Batch operation for efficiency
   */
  async saveAllDataRubrics(
    dataRubrics: DataRubric[]
  ): Promise<void> {
    console.log(`💾 Saving ${dataRubrics.length} Data Rubrics...`);

    try {
      if (this.isBrowser) {
        // Use batch API endpoint in browser
        const response = await fetch(`${this.apiBaseUrl}/api/rubrics/data-rubrics/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dataRubrics })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to save batch via API');
        }

        // Cache all in sessionStorage
        if (this.useSessionStorage) {
          dataRubrics.forEach(rubric => {
            const rubricId = `${rubric.container}-${rubric.subject}`;
            this.cacheInSessionStorage(
              `data-rubric:${rubric.sessionId}:${rubricId}`,
              rubric
            );
          });
        }
      } else {
        // Use Azure SDK in Node.js - save all in parallel
        await Promise.all(
          dataRubrics.map(rubric => this.saveDataRubric(rubric))
        );
      }

      console.log(`✅ All ${dataRubrics.length} Data Rubrics saved`);
    } catch (error) {
      console.error('❌ Failed to save Data Rubrics:', error);
      throw error;
    }
  }

  /**
   * Retrieve single Data Rubric from Azure Storage
   * Checks sessionStorage cache first, then Azure
   */
  async getDataRubric(
    sessionId: string,
    container: ContainerType,
    subject: Subject
  ): Promise<DataRubric | null> {
    const rubricId = `${container}-${subject}`;
    console.log(`🔍 Retrieving Data Rubric: ${sessionId}/${rubricId}`);

    // Check sessionStorage cache first
    if (this.useSessionStorage) {
      const cached = this.getFromSessionStorage<DataRubric>(
        `data-rubric:${sessionId}:${rubricId}`
      );
      if (cached) {
        console.log('✅ Retrieved from sessionStorage cache');
        return cached;
      }
    }

    // Fetch from Azure Storage
    try {
      let rubric: DataRubric | null = null;

      if (this.isBrowser) {
        // Use API endpoint in browser
        const response = await fetch(
          `${this.apiBaseUrl}/api/rubrics/data-rubric/${sessionId}/${container}/${subject}`
        );

        if (response.ok) {
          const data = await response.json();
          rubric = data.data;
        } else if (response.status === 404) {
          console.warn(`⚠️ Data Rubric not found: ${sessionId}/${rubricId}`);
          return null;
        } else {
          throw new Error('Failed to retrieve via API');
        }
      } else {
        // Use Azure SDK in Node.js
        const blobPath = `${sessionId}/${rubricId}.json`;
        rubric = await this.azureStorage!.getJSON('dataRubrics', blobPath);
      }

      if (rubric) {
        // Cache in sessionStorage
        if (this.useSessionStorage) {
          this.cacheInSessionStorage(
            `data-rubric:${sessionId}:${rubricId}`,
            rubric
          );
        }
        console.log('✅ Retrieved from Azure Storage');
        return rubric;
      }

      console.warn(`⚠️ Data Rubric not found: ${sessionId}/${rubricId}`);
      return null;
    } catch (error) {
      console.error(`❌ Failed to retrieve Data Rubric ${rubricId}:`, error);
      return null;
    }
  }

  /**
   * Retrieve all Data Rubrics for a session
   * Returns all 12 rubrics (3 containers × 4 subjects)
   */
  async getAllDataRubrics(
    sessionId: string
  ): Promise<DataRubric[]> {
    console.log(`🔍 Retrieving all Data Rubrics for session: ${sessionId}`);

    let rubrics: DataRubric[] = [];

    if (this.isBrowser) {
      // Use batch API endpoint in browser
      try {
        const response = await fetch(`${this.apiBaseUrl}/api/rubrics/data-rubrics/${sessionId}`);

        if (response.ok) {
          const data = await response.json();
          rubrics = data.data;

          // Cache all in sessionStorage
          if (this.useSessionStorage) {
            rubrics.forEach(rubric => {
              const rubricId = `${rubric.container}-${rubric.subject}`;
              this.cacheInSessionStorage(
                `data-rubric:${sessionId}:${rubricId}`,
                rubric
              );
            });
          }
        } else if (response.status !== 404) {
          throw new Error('Failed to retrieve batch via API');
        }
      } catch (error) {
        console.error('❌ Failed to retrieve Data Rubrics batch:', error);
      }
    } else {
      // Use Azure SDK in Node.js - fetch all in parallel
      const containers: ContainerType[] = ['LEARN', 'EXPERIENCE', 'DISCOVER'];
      const subjects: Subject[] = ['Math', 'ELA', 'Science', 'Social Studies'];

      const promises = containers.flatMap(container =>
        subjects.map(subject =>
          this.getDataRubric(sessionId, container, subject)
        )
      );

      const results = await Promise.all(promises);

      // Filter out nulls and return valid rubrics
      for (const rubric of results) {
        if (rubric) {
          rubrics.push(rubric);
        }
      }
    }

    console.log(`✅ Retrieved ${rubrics.length} Data Rubrics`);

    return rubrics;
  }

  /**
   * Update Data Rubric (for adaptive content)
   * Updates existing rubric with new data (e.g., performance, adaptation)
   */
  async updateDataRubric(
    dataRubric: DataRubric
  ): Promise<{ url: string; blobName: string }> {
    const rubricId = `${dataRubric.container}-${dataRubric.subject}`;
    console.log(`🔄 Updating Data Rubric: ${dataRubric.sessionId}/${rubricId}`);

    let result: { url: string; blobName: string };

    if (this.isBrowser) {
      // Use PUT API endpoint in browser
      const response = await fetch(`${this.apiBaseUrl}/api/rubrics/data-rubric`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataRubric })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update via API');
      }

      const data = await response.json();
      result = { url: data.url, blobName: data.blobName };
    } else {
      // Use Azure SDK in Node.js (overwrites existing)
      result = await this.saveDataRubric(dataRubric);
    }

    // Update cache
    if (this.useSessionStorage) {
      this.cacheInSessionStorage(
        `data-rubric:${dataRubric.sessionId}:${rubricId}`,
        dataRubric
      );
    }

    console.log(`✅ Data Rubric updated: ${rubricId}`);
    return result;
  }

  // ========================================================================
  // SESSION STORAGE CACHE HELPERS
  // ========================================================================

  /**
   * Cache data in sessionStorage
   * Only works in browser environment
   */
  private cacheInSessionStorage<T>(key: string, data: T): void {
    if (!this.useSessionStorage) return;

    try {
      sessionStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to cache in sessionStorage:', error);
    }
  }

  /**
   * Retrieve data from sessionStorage cache
   */
  private getFromSessionStorage<T>(key: string): T | null {
    if (!this.useSessionStorage) return null;

    try {
      const item = sessionStorage.getItem(key);
      if (item) {
        return JSON.parse(item);
      }
      return null;
    } catch (error) {
      console.warn('Failed to retrieve from sessionStorage:', error);
      return null;
    }
  }

  /**
   * Clear all rubric cache for a session
   * Useful when session ends or user logs out
   */
  clearSessionCache(sessionId: string): void {
    if (!this.useSessionStorage) return;

    console.log(`🧹 Clearing session cache: ${sessionId}`);

    try {
      // Clear enriched narrative
      sessionStorage.removeItem(`enriched-narrative:${sessionId}`);

      // Clear story rubric
      sessionStorage.removeItem(`story-rubric:${sessionId}`);

      // Clear all data rubrics
      const containers: ContainerType[] = ['LEARN', 'EXPERIENCE', 'DISCOVER'];
      const subjects: Subject[] = ['Math', 'ELA', 'Science', 'Social Studies'];

      for (const container of containers) {
        for (const subject of subjects) {
          const rubricId = `${container}-${subject}`;
          sessionStorage.removeItem(`data-rubric:${sessionId}:${rubricId}`);
        }
      }

      console.log('✅ Session cache cleared');
    } catch (error) {
      console.warn('Failed to clear session cache:', error);
    }
  }

  // ========================================================================
  // TEST & DEBUG UTILITIES
  // ========================================================================

  /**
   * Test connection to Azure Storage
   */
  async testConnection(): Promise<boolean> {
    if (this.isBrowser) {
      // Use API endpoint in browser
      try {
        const response = await fetch(`${this.apiBaseUrl}/api/rubrics/test-connection`, {
          method: 'POST'
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Azure Storage connection test successful:', data);
          return true;
        }
        return false;
      } catch (error) {
        console.error('❌ Connection test failed:', error);
        return false;
      }
    } else {
      // Use Azure SDK in Node.js
      return await this.azureStorage!.testConnection();
    }
  }

  /**
   * Get storage metrics for rubrics
   */
  async getMetrics(): Promise<{
    enrichedNarratives: number;
    storyRubrics: number;
    dataRubrics: number;
  }> {
    console.log('📊 Gathering rubric storage metrics...');

    // This would require iterating through Azure Storage
    // For now, return placeholder
    return {
      enrichedNarratives: 0,
      storyRubrics: 0,
      dataRubrics: 0
    };
  }
}

// Singleton instance
let rubricStorageInstance: RubricStorageService | null = null;

export const getRubricStorage = (connectionString?: string): RubricStorageService => {
  if (!rubricStorageInstance) {
    rubricStorageInstance = new RubricStorageService(connectionString);
  }
  return rubricStorageInstance;
};
