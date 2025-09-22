/**
 * YouTube Quota Manager
 * Manages multiple API keys and tracks quota usage
 * Supports Azure AD integration for enterprise YouTube access
 */

interface ApiKeyConfig {
  key: string;
  source: 'direct' | 'azure' | 'esposure';
  dailyQuota: number;
  usedQuota: number;
  resetTime: Date;
  priority: number;  // Lower number = higher priority
  enabled: boolean;
}

export class YouTubeQuotaManager {
  private apiKeys: Map<string, ApiKeyConfig>;
  private currentKeyIndex: number = 0;

  constructor() {
    this.apiKeys = new Map();
    this.initializeApiKeys();
  }

  /**
   * Initialize API keys from environment and configuration
   */
  private initializeApiKeys(): void {
    // Primary API key
    const primaryKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (primaryKey) {
      this.apiKeys.set('primary', {
        key: primaryKey,
        source: 'direct',
        dailyQuota: 10000,
        usedQuota: this.getStoredUsage('primary'),
        resetTime: this.getResetTime(),
        priority: 1,
        enabled: true
      });
    }

    // Esposure.gg API key (if configured)
    const esposureKey = import.meta.env.VITE_YOUTUBE_ESPOSURE_API_KEY;
    if (esposureKey) {
      this.apiKeys.set('esposure', {
        key: esposureKey,
        source: 'esposure',
        dailyQuota: 10000,
        usedQuota: this.getStoredUsage('esposure'),
        resetTime: this.getResetTime(),
        priority: 2,
        enabled: true
      });
    }

    // Azure-managed API key (accessed through Azure Function)
    if (import.meta.env.VITE_USE_AZURE_YOUTUBE_PROXY === 'true') {
      this.apiKeys.set('azure', {
        key: 'azure-proxy', // Placeholder, actual key is in Azure Key Vault
        source: 'azure',
        dailyQuota: 10000,
        usedQuota: this.getStoredUsage('azure'),
        resetTime: this.getResetTime(),
        priority: 0, // Highest priority to avoid IP blocking
        enabled: true
      });
    }

    console.log(`📊 YouTube Quota Manager initialized with ${this.apiKeys.size} API key(s)`);
  }

  /**
   * Get the next available API key based on quota and priority
   */
  getNextAvailableKey(): { key: string; source: string } | null {
    // Sort keys by priority
    const sortedKeys = Array.from(this.apiKeys.entries())
      .filter(([_, config]) => config.enabled)
      .sort((a, b) => a[1].priority - b[1].priority);

    // Check each key for available quota
    for (const [id, config] of sortedKeys) {
      if (this.hasQuotaAvailable(config)) {
        return { key: config.key, source: config.source };
      }
    }

    // All keys exhausted
    console.error('⚠️ All YouTube API keys have exhausted their quota');
    return null;
  }

  /**
   * Check if a key has quota available
   */
  private hasQuotaAvailable(config: ApiKeyConfig): boolean {
    // Reset quota if past reset time
    if (new Date() > config.resetTime) {
      config.usedQuota = 0;
      config.resetTime = this.getResetTime();
      this.saveUsage(config);
    }

    // Reserve 100 units as buffer
    return config.usedQuota < (config.dailyQuota - 100);
  }

  /**
   * Record API usage for quota tracking
   */
  recordUsage(source: string, units: number): void {
    const keyConfig = Array.from(this.apiKeys.values())
      .find(config => config.source === source);

    if (keyConfig) {
      keyConfig.usedQuota += units;
      this.saveUsage(keyConfig);

      console.log(`📈 YouTube API usage: ${source} - ${keyConfig.usedQuota}/${keyConfig.dailyQuota} units used`);

      // Warn if approaching limit
      const percentUsed = (keyConfig.usedQuota / keyConfig.dailyQuota) * 100;
      if (percentUsed > 80) {
        console.warn(`⚠️ YouTube API key "${source}" is at ${percentUsed.toFixed(1)}% of daily quota`);
      }
    }
  }

  /**
   * Get stored usage from localStorage
   */
  private getStoredUsage(keyId: string): number {
    const storageKey = `youtube_quota_${keyId}_${this.getDateKey()}`;
    const stored = localStorage.getItem(storageKey);
    return stored ? parseInt(stored, 10) : 0;
  }

  /**
   * Save usage to localStorage
   */
  private saveUsage(config: ApiKeyConfig): void {
    const keyId = Array.from(this.apiKeys.entries())
      .find(([_, c]) => c === config)?.[0];

    if (keyId) {
      const storageKey = `youtube_quota_${keyId}_${this.getDateKey()}`;
      localStorage.setItem(storageKey, config.usedQuota.toString());
    }
  }

  /**
   * Get date key for quota tracking (YYYY-MM-DD in PT)
   */
  private getDateKey(): string {
    const now = new Date();
    // Convert to Pacific Time for YouTube quota reset
    const ptOffset = -8; // PST offset
    const ptTime = new Date(now.getTime() + (ptOffset * 60 * 60 * 1000));
    return ptTime.toISOString().split('T')[0];
  }

  /**
   * Get next quota reset time (midnight PT)
   */
  private getResetTime(): Date {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Adjust for Pacific Time
    const ptOffset = -8 * 60 * 60 * 1000;
    return new Date(tomorrow.getTime() + ptOffset);
  }

  /**
   * Get quota status for all keys
   */
  getQuotaStatus(): Array<{
    id: string;
    source: string;
    used: number;
    total: number;
    percentUsed: number;
    available: boolean;
  }> {
    return Array.from(this.apiKeys.entries()).map(([id, config]) => ({
      id,
      source: config.source,
      used: config.usedQuota,
      total: config.dailyQuota,
      percentUsed: (config.usedQuota / config.dailyQuota) * 100,
      available: this.hasQuotaAvailable(config)
    }));
  }

  /**
   * Manually switch to a specific API key source
   */
  switchToSource(source: 'direct' | 'azure' | 'esposure'): boolean {
    const config = Array.from(this.apiKeys.values())
      .find(c => c.source === source);

    if (config && config.enabled) {
      // Temporarily increase priority
      config.priority = -1;
      console.log(`🔄 Switched to YouTube API source: ${source}`);
      return true;
    }

    return false;
  }

  /**
   * Check if Azure proxy should be used based on conditions
   */
  shouldUseAzureProxy(): boolean {
    // Use Azure if:
    // 1. It's configured and enabled
    const azureConfig = Array.from(this.apiKeys.values())
      .find(c => c.source === 'azure');

    if (!azureConfig || !azureConfig.enabled) {
      return false;
    }

    // 2. Direct API keys are exhausted or close to limit
    const directKeys = Array.from(this.apiKeys.values())
      .filter(c => c.source === 'direct' || c.source === 'esposure');

    const allDirectExhausted = directKeys.every(config => {
      const percentUsed = (config.usedQuota / config.dailyQuota) * 100;
      return percentUsed > 70; // Switch to Azure at 70% usage
    });

    if (allDirectExhausted) {
      console.log('🔷 Switching to Azure proxy due to quota constraints');
      return true;
    }

    // 3. We're in a known Azure/data center environment
    const isAzureEnvironment = window.location.hostname.includes('azure') ||
                               window.location.hostname.includes('azurewebsites');

    if (isAzureEnvironment) {
      console.log('🔷 Using Azure proxy in Azure environment');
      return true;
    }

    return false;
  }
}

// Singleton instance
export const youTubeQuotaManager = new YouTubeQuotaManager();