/**
 * Azure YouTube Proxy Service
 * Routes YouTube API requests through Azure to avoid data center IP blocking
 * Leverages Azure AD integration for enhanced access
 */

import { YouTubeSearchParams, YouTubeSearchResult, YouTubeVideo } from './types';

interface AzureProxyConfig {
  functionUrl?: string;  // Azure Function URL for proxying requests
  useAzureAuth?: boolean;  // Use Azure AD authentication
  azureTenantId?: string;
  azureClientId?: string;
  fallbackToDirectApi?: boolean;  // Fallback to direct YouTube API if Azure fails
}

export class AzureYouTubeProxy {
  private config: AzureProxyConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config?: AzureProxyConfig) {
    this.config = {
      functionUrl: import.meta.env.VITE_AZURE_YOUTUBE_PROXY_URL || 'https://pathfinity-functions.azurewebsites.net/api/youtube-proxy',
      useAzureAuth: import.meta.env.VITE_USE_AZURE_YOUTUBE_AUTH === 'true',
      azureTenantId: import.meta.env.VITE_AZURE_TENANT_ID,
      azureClientId: import.meta.env.VITE_AZURE_CLIENT_ID,
      fallbackToDirectApi: true,
      ...config
    };
  }

  /**
   * Get Azure AD access token for YouTube access
   */
  private async getAzureAccessToken(): Promise<string | null> {
    // Check if token is still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.config.useAzureAuth) {
      return null;
    }

    try {
      // Use Microsoft Authentication Library (MSAL) for Azure AD auth
      // This would be implemented with @azure/msal-browser
      const msalConfig = {
        auth: {
          clientId: this.config.azureClientId!,
          authority: `https://login.microsoftonline.com/${this.config.azureTenantId}`,
          redirectUri: window.location.origin
        }
      };

      // For now, return null - full MSAL implementation would go here
      // In production, this would authenticate and get token for YouTube scope
      console.log('Azure AD authentication would be performed here');
      return null;
    } catch (error) {
      console.error('Failed to get Azure AD token:', error);
      return null;
    }
  }

  /**
   * Make YouTube API request through Azure Function
   * Azure Functions run on Microsoft IPs which aren't typically blocked by Google
   */
  async searchThroughAzure(params: YouTubeSearchParams): Promise<YouTubeSearchResult> {
    const azureToken = await this.getAzureAccessToken();

    try {
      const response = await fetch(this.config.functionUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(azureToken && { 'Authorization': `Bearer ${azureToken}` })
        },
        body: JSON.stringify({
          action: 'search',
          params: params,
          // Pass the YouTube API key securely through Azure Key Vault reference
          apiKeyVaultRef: 'youtube-api-key'
        })
      });

      if (!response.ok) {
        throw new Error(`Azure proxy failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result as YouTubeSearchResult;
    } catch (error) {
      console.error('Azure YouTube proxy error:', error);

      if (this.config.fallbackToDirectApi) {
        console.log('Falling back to direct YouTube API...');
        // Fallback logic would call the original YouTubeService here
        throw error;
      }

      throw error;
    }
  }

  /**
   * Get video details through Azure proxy
   */
  async getVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
    const azureToken = await this.getAzureAccessToken();

    try {
      const response = await fetch(this.config.functionUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(azureToken && { 'Authorization': `Bearer ${azureToken}` })
        },
        body: JSON.stringify({
          action: 'videos',
          videoIds: videoIds,
          apiKeyVaultRef: 'youtube-api-key'
        })
      });

      if (!response.ok) {
        throw new Error(`Azure proxy failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.videos as YouTubeVideo[];
    } catch (error) {
      console.error('Azure YouTube proxy error:', error);
      throw error;
    }
  }

  /**
   * Check if Azure proxy is available and configured
   */
  async checkAvailability(): Promise<boolean> {
    if (!this.config.functionUrl) {
      return false;
    }

    try {
      const response = await fetch(`${this.config.functionUrl}/health`, {
        method: 'GET'
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get quota status from Azure-managed API keys
   * Azure can manage multiple API keys and rotate them
   */
  async getQuotaStatus(): Promise<{
    available: boolean;
    remaining: number;
    total: number;
    resetTime: string;
  }> {
    try {
      const response = await fetch(`${this.config.functionUrl}/quota`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to get quota status');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get quota status:', error);
      return {
        available: false,
        remaining: 0,
        total: 10000,
        resetTime: 'Unknown'
      };
    }
  }
}

// Singleton instance
export const azureYouTubeProxy = new AzureYouTubeProxy();