/**
 * Azure Blob Storage Service
 * Handles all interactions with Azure Blob Storage for audio files
 */

import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';

interface AudioMetadata {
  narrativeId: string;
  studentId: string;
  gradeLevel: string;
  companion: string;
  contentType: 'narration' | 'effect' | 'music';
  duration?: number;
  createdAt: string;
}

export class AzureStorageService {
  private blobServiceClient: BlobServiceClient;
  private accountName: string = 'pathfinitystorage';
  private containerNames = {
    // Audio containers
    narration: 'audio-narration',
    effects: 'audio-effects',
    music: 'audio-music',
    cache: 'audio-cache',
    // Content containers
    masterNarratives: 'master-narratives',
    microLearn: 'micro-content-learn',
    microExperience: 'micro-content-experience',
    microDiscover: 'micro-content-discover',
    metrics: 'content-metrics'
  };

  constructor(connectionString?: string) {
    // This service is only for Node.js scripts, not for browser
    if (typeof window !== 'undefined') {
      console.warn('AzureStorageService should not be used in browser');
      // Create a dummy client to prevent crashes
      this.blobServiceClient = {} as any;
      return;
    }

    // Use connection string if provided
    if (connectionString) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    } else {
      // For production with managed identity
      const accountUrl = `https://${this.accountName}.blob.core.windows.net`;
      this.blobServiceClient = new BlobServiceClient(accountUrl);
    }
  }

  /**
   * Get or create a container
   */
  private async getContainerClient(containerType: keyof typeof this.containerNames): Promise<ContainerClient> {
    const containerName = this.containerNames[containerType];
    const containerClient = this.blobServiceClient.getContainerClient(containerName);

    // Ensure container exists
    await containerClient.createIfNotExists({
      access: 'private'
    });

    return containerClient;
  }

  /**
   * Generate a unique blob name for audio files
   */
  private generateBlobName(metadata: AudioMetadata): string {
    const { narrativeId, studentId, gradeLevel, companion, contentType } = metadata;
    const timestamp = Date.now();
    const sanitizedCompanion = companion.toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Format: grade/companion/narrativeId/studentId_timestamp.mp3
    return `${gradeLevel}/${sanitizedCompanion}/${narrativeId}/${studentId}_${timestamp}.mp3`;
  }

  /**
   * Upload audio file to Azure Blob Storage
   */
  async uploadAudio(
    audioBuffer: Buffer,
    metadata: AudioMetadata
  ): Promise<{ url: string; blobName: string }> {
    try {
      const containerClient = await this.getContainerClient('narration');
      const blobName = this.generateBlobName(metadata);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Upload with metadata
      await blockBlobClient.upload(audioBuffer, audioBuffer.length, {
        blobHTTPHeaders: {
          blobContentType: 'audio/mpeg',
          blobCacheControl: 'public, max-age=31536000' // Cache for 1 year
        },
        metadata: {
          narrativeId: metadata.narrativeId,
          studentId: metadata.studentId,
          gradeLevel: metadata.gradeLevel,
          companion: metadata.companion,
          createdAt: metadata.createdAt
        }
      });

      // Generate SAS URL (valid for 1 year)
      const url = await this.generateSasUrl(blockBlobClient);

      console.log(`✅ Audio uploaded: ${blobName}`);
      return { url, blobName };
    } catch (error) {
      console.error('❌ Audio upload failed:', error);
      throw error;
    }
  }

  /**
   * Generate SAS URL for secure access
   */
  private async generateSasUrl(blobClient: BlockBlobClient): Promise<string> {
    // In production, use managed identity or key vault
    // This is a placeholder for SAS generation
    const url = blobClient.url;

    // TODO: Implement proper SAS token generation
    // const sasToken = generateBlobSASQueryParameters({...});
    // return `${url}?${sasToken}`;

    return url;
  }

  /**
   * Check if audio exists in storage
   */
  async audioExists(narrativeId: string, studentId: string, companion: string): Promise<string | null> {
    try {
      const containerClient = await this.getContainerClient('narration');

      // List blobs with prefix matching
      const prefix = `*/${companion.toLowerCase()}/${narrativeId}/${studentId}_`;

      for await (const blob of containerClient.listBlobsFlat({ prefix })) {
        if (blob.name.includes(studentId)) {
          const blobClient = containerClient.getBlobClient(blob.name);
          return blobClient.url;
        }
      }

      return null;
    } catch (error) {
      console.error('Error checking audio existence:', error);
      return null;
    }
  }

  /**
   * Delete old audio files (cleanup)
   */
  async cleanupOldAudio(daysOld: number = 90): Promise<number> {
    let deletedCount = 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    try {
      const containerClient = await this.getContainerClient('narration');

      for await (const blob of containerClient.listBlobsFlat()) {
        if (blob.properties.lastModified && blob.properties.lastModified < cutoffDate) {
          await containerClient.deleteBlob(blob.name);
          deletedCount++;
        }
      }

      console.log(`🧹 Cleaned up ${deletedCount} old audio files`);
      return deletedCount;
    } catch (error) {
      console.error('Cleanup failed:', error);
      return deletedCount;
    }
  }

  /**
   * Get storage metrics
   */
  async getStorageMetrics(): Promise<{
    totalFiles: number;
    totalSize: number;
    byCompanion: Record<string, number>;
    byGrade: Record<string, number>;
  }> {
    const metrics = {
      totalFiles: 0,
      totalSize: 0,
      byCompanion: {} as Record<string, number>,
      byGrade: {} as Record<string, number>
    };

    try {
      const containerClient = await this.getContainerClient('narration');

      for await (const blob of containerClient.listBlobsFlat()) {
        metrics.totalFiles++;
        metrics.totalSize += blob.properties.contentLength || 0;

        // Parse blob name for categorization
        const parts = blob.name.split('/');
        if (parts.length >= 2) {
          const grade = parts[0];
          const companion = parts[1];

          metrics.byGrade[grade] = (metrics.byGrade[grade] || 0) + 1;
          metrics.byCompanion[companion] = (metrics.byCompanion[companion] || 0) + 1;
        }
      }

      return metrics;
    } catch (error) {
      console.error('Failed to get metrics:', error);
      return metrics;
    }
  }

  /**
   * Upload Master Narrative JSON to Azure Blob Storage
   */
  async uploadMasterNarrative(
    narrativeKey: string,
    narrative: any,
    metadata: {
      studentId: string;
      gradeLevel: string;
      companion: string;
      careerId: string;
      subject: string;
    }
  ): Promise<{ url: string; blobName: string }> {
    try {
      const containerClient = await this.getContainerClient('masterNarratives');
      const blobName = `${metadata.gradeLevel}/${metadata.companion}/${narrativeKey}.json`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const content = JSON.stringify(narrative, null, 2);
      const buffer = Buffer.from(content);

      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
          blobContentType: 'application/json',
          blobCacheControl: 'public, max-age=2592000' // Cache for 30 days
        },
        metadata: {
          studentId: metadata.studentId,
          gradeLevel: metadata.gradeLevel,
          companion: metadata.companion,
          careerId: metadata.careerId,
          subject: metadata.subject,
          createdAt: new Date().toISOString()
        }
      });

      const url = blockBlobClient.url;
      console.log(`✅ Master Narrative uploaded: ${blobName}`);
      console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB`);
      return { url, blobName };
    } catch (error) {
      console.error('❌ Master Narrative upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload Micro Content JSON to Azure Blob Storage
   */
  async uploadMicroContent(
    contentKey: string,
    content: any,
    containerType: 'learn' | 'experience' | 'discover',
    metadata: {
      studentId: string;
      gradeLevel: string;
      skillId: string;
      masterNarrativeKey: string;
    }
  ): Promise<{ url: string; blobName: string }> {
    try {
      const containerMap = {
        learn: 'microLearn',
        experience: 'microExperience',
        discover: 'microDiscover'
      } as const;

      const containerClient = await this.getContainerClient(containerMap[containerType]);
      const blobName = `${metadata.gradeLevel}/${metadata.skillId}/${contentKey}.json`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const contentStr = JSON.stringify(content, null, 2);
      const buffer = Buffer.from(contentStr);

      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
          blobContentType: 'application/json',
          blobCacheControl: 'public, max-age=604800' // Cache for 7 days
        },
        metadata: {
          studentId: metadata.studentId,
          gradeLevel: metadata.gradeLevel,
          skillId: metadata.skillId,
          masterNarrativeKey: metadata.masterNarrativeKey,
          containerType,
          createdAt: new Date().toISOString()
        }
      });

      const url = blockBlobClient.url;
      console.log(`✅ Micro Content (${containerType}) uploaded: ${blobName}`);
      console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB`);
      return { url, blobName };
    } catch (error) {
      console.error(`❌ Micro Content upload failed:`, error);
      throw error;
    }
  }

  /**
   * Retrieve Master Narrative from Azure Blob Storage
   */
  async getMasterNarrative(narrativeKey: string): Promise<any | null> {
    try {
      const containerClient = await this.getContainerClient('masterNarratives');

      // Search for the narrative
      for await (const blob of containerClient.listBlobsFlat()) {
        if (blob.name.includes(narrativeKey)) {
          const blobClient = containerClient.getBlobClient(blob.name);
          const downloadResponse = await blobClient.download();
          const content = await this.streamToBuffer(downloadResponse.readableStreamBody!);

          console.log(`✅ Master Narrative retrieved: ${blob.name}`);
          return JSON.parse(content.toString());
        }
      }

      return null;
    } catch (error) {
      console.error('Error retrieving Master Narrative:', error);
      return null;
    }
  }

  /**
   * Retrieve Micro Content from Azure Blob Storage
   */
  async getMicroContent(
    contentKey: string,
    containerType: 'learn' | 'experience' | 'discover'
  ): Promise<any | null> {
    try {
      const containerMap = {
        learn: 'microLearn',
        experience: 'microExperience',
        discover: 'microDiscover'
      } as const;

      const containerClient = await this.getContainerClient(containerMap[containerType]);

      // Search for the content
      for await (const blob of containerClient.listBlobsFlat()) {
        if (blob.name.includes(contentKey)) {
          const blobClient = containerClient.getBlobClient(blob.name);
          const downloadResponse = await blobClient.download();
          const content = await this.streamToBuffer(downloadResponse.readableStreamBody!);

          console.log(`✅ Micro Content (${containerType}) retrieved: ${blob.name}`);
          return JSON.parse(content.toString());
        }
      }

      return null;
    } catch (error) {
      console.error('Error retrieving Micro Content:', error);
      return null;
    }
  }

  /**
   * Helper function to convert stream to buffer
   */
  private async streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      readableStream.on('data', (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on('error', reject);
    });
  }

  /**
   * Save usage metrics to Azure Blob Storage
   */
  async saveMetrics(metrics: any): Promise<void> {
    try {
      const containerClient = await this.getContainerClient('metrics');
      const date = new Date().toISOString().split('T')[0];
      const blobName = `metrics/${date}/metrics-${Date.now()}.json`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const content = JSON.stringify(metrics, null, 2);
      const buffer = Buffer.from(content);

      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
          blobContentType: 'application/json'
        }
      });

      console.log(`📊 Metrics saved: ${blobName}`);
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  /**
   * Test connection to Azure Storage
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing Azure Storage connection...');

      // Try to list containers
      const containers = [];
      for await (const container of this.blobServiceClient.listContainers()) {
        containers.push(container.name);
      }

      console.log(`✅ Connected! Found ${containers.length} containers:`, containers);

      // Ensure required containers exist
      for (const containerType of Object.keys(this.containerNames) as Array<keyof typeof this.containerNames>) {
        await this.getContainerClient(containerType);
        console.log(`✅ Container ready: ${this.containerNames[containerType]}`);
      }

      return true;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }
}

// Singleton instance
let storageInstance: AzureStorageService | null = null;

export const getAzureStorage = (connectionString?: string): AzureStorageService => {
  if (!storageInstance) {
    storageInstance = new AzureStorageService(connectionString);
  }
  return storageInstance;
};