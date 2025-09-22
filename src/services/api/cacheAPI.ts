/**
 * Cache API Client
 * Communicates with backend API for Azure Storage operations
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

export class CacheAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    console.log(`📡 Cache API initialized: ${this.baseUrl}`);
  }

  /**
   * Store Master Narrative
   */
  async saveMasterNarrative(
    key: string,
    narrative: any,
    metadata: {
      studentId: string;
      gradeLevel: string;
      companion: string;
      careerId: string;
      subject: string;
    }
  ): Promise<{ success: boolean; blobName?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/cache/master-narrative`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          narrative,
          metadata
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Master Narrative saved to Azure: ${result.blobName}`);
      } else {
        console.error('❌ Failed to save Master Narrative:', result.error);
      }

      return result;
    } catch (error) {
      console.error('❌ API call failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retrieve Master Narrative
   */
  async getMasterNarrative(key: string): Promise<any | null> {
    try {
      const response = await fetch(`${this.baseUrl}/cache/master-narrative/${key}`);

      if (response.status === 404) {
        return null;
      }

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Master Narrative retrieved from Azure: ${result.blobName}`);
        return result.data;
      }

      return null;
    } catch (error) {
      console.error('❌ API call failed:', error);
      return null;
    }
  }

  /**
   * Store Micro Content
   */
  async saveMicroContent(
    key: string,
    content: any,
    containerType: 'learn' | 'experience' | 'discover',
    metadata: {
      studentId: string;
      gradeLevel: string;
      skillId: string;
      masterNarrativeKey: string;
    }
  ): Promise<{ success: boolean; blobName?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/cache/micro-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          content,
          containerType,
          metadata
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Micro Content saved to Azure: ${result.blobName}`);
      } else {
        console.error('❌ Failed to save Micro Content:', result.error);
      }

      return result;
    } catch (error) {
      console.error('❌ API call failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Retrieve Micro Content
   */
  async getMicroContent(
    key: string,
    containerType: 'learn' | 'experience' | 'discover'
  ): Promise<any | null> {
    try {
      const response = await fetch(`${this.baseUrl}/cache/micro-content/${containerType}/${key}`);

      if (response.status === 404) {
        return null;
      }

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Micro Content retrieved from Azure: ${result.blobName}`);
        return result.data;
      }

      return null;
    } catch (error) {
      console.error('❌ API call failed:', error);
      return null;
    }
  }

  /**
   * Save metrics
   */
  async saveMetrics(metrics: any): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/cache/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metrics)
      });

      console.log('📊 Metrics saved');
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/cache/stats`);
      const result = await response.json();

      if (result.success) {
        return result.stats;
      }

      return null;
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return null;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const result = await response.json();
      return result.status === 'healthy';
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }

  /**
   * Save audio file to Azure Storage
   */
  async saveAudioFile(
    key: string,
    audioData: ArrayBuffer,
    metadata?: any
  ): Promise<{ success: boolean; url?: string; blobName?: string; error?: string }> {
    try {
      console.log(`📤 Uploading audio: ${key}`);

      // Convert ArrayBuffer to base64 for transmission
      const base64 = btoa(String.fromCharCode(...new Uint8Array(audioData)));

      const response = await fetch(`${this.baseUrl}/tts/save-audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key,
          audioData: base64,
          metadata
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Audio uploaded: ${result.blobName}`);
      }

      return result;
    } catch (error: any) {
      console.error(`Failed to save audio ${key}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get audio file from Azure Storage
   */
  async getAudioFile(key: string): Promise<{ url: string; blobName: string } | null> {
    try {
      console.log(`📥 Retrieving audio: ${key}`);

      const response = await fetch(`${this.baseUrl}/tts/audio/${key}`);

      if (!response.ok) {
        console.log(`Audio not found: ${key}`);
        return null;
      }

      // The audio endpoint returns the actual audio data
      // We need to create a blob URL for it
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);

      return {
        url,
        blobName: key
      };

    } catch (error: any) {
      console.error(`Failed to get audio ${key}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const cacheAPI = new CacheAPI();