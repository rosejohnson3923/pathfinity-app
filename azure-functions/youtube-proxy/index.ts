/**
 * Azure Function: YouTube API Proxy
 * Proxies YouTube Data API requests to avoid data center IP blocking
 * Deployed to Azure Functions for reliable YouTube access
 */

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

interface ProxyRequest {
  action: 'search' | 'videos' | 'channels';
  params?: any;
  videoIds?: string[];
  apiKeyVaultRef?: string;
}

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log('YouTube Proxy Function triggered');

  // CORS headers for browser access
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    context.res = {
      status: 200,
      headers
    };
    return;
  }

  try {
    const requestBody: ProxyRequest = req.body;

    // Get YouTube API key from Azure Key Vault
    const apiKey = await getYouTubeApiKey(requestBody.apiKeyVaultRef || 'youtube-api-key');

    if (!apiKey) {
      throw new Error('YouTube API key not found in Key Vault');
    }

    let result: any;

    switch (requestBody.action) {
      case 'search':
        result = await searchYouTube(apiKey, requestBody.params);
        break;

      case 'videos':
        result = await getVideoDetails(apiKey, requestBody.videoIds || []);
        break;

      case 'channels':
        result = await getChannelDetails(apiKey, requestBody.params);
        break;

      default:
        throw new Error(`Unknown action: ${requestBody.action}`);
    }

    // Log successful request for monitoring
    context.log(`YouTube API request successful: ${requestBody.action}`);

    context.res = {
      status: 200,
      headers,
      body: result
    };
  } catch (error: any) {
    context.log.error('YouTube proxy error:', error);

    context.res = {
      status: 500,
      headers,
      body: {
        error: error.message || 'Internal server error',
        timestamp: new Date().toISOString()
      }
    };
  }
};

/**
 * Get YouTube API key from Azure Key Vault
 */
async function getYouTubeApiKey(secretName: string): Promise<string | null> {
  try {
    const keyVaultName = process.env.KEY_VAULT_NAME || 'pathfinity-kv-2823';
    const vaultUrl = `https://${keyVaultName}.vault.azure.net`;

    const credential = new DefaultAzureCredential();
    const client = new SecretClient(vaultUrl, credential);

    const secret = await client.getSecret(secretName);
    return secret.value || null;
  } catch (error) {
    console.error('Failed to retrieve API key from Key Vault:', error);
    // Fallback to environment variable if Key Vault fails
    return process.env.YOUTUBE_API_KEY || null;
  }
}

/**
 * Search YouTube through the API
 */
async function searchYouTube(apiKey: string, params: any): Promise<any> {
  const baseUrl = 'https://www.googleapis.com/youtube/v3/search';

  const searchParams = new URLSearchParams({
    key: apiKey,
    part: 'snippet',
    q: params.query,
    type: 'video',
    maxResults: String(params.limit || 10),
    safeSearch: params.safeSearch || 'strict',
    order: params.orderBy || 'relevance',
    videoEmbeddable: 'true',
    videoDuration: params.maxDuration > 240 ? 'medium' : 'short'
  });

  const response = await fetch(`${baseUrl}?${searchParams}`);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`YouTube API error: ${error}`);
  }

  const data = await response.json();

  // Get video details for duration and other metadata
  if (data.items && data.items.length > 0) {
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const videoDetails = await getVideoDetails(apiKey, videoIds.split(','));

    // Combine search results with video details
    const videos = data.items.map((item: any) => {
      const details = videoDetails.videos.find((v: any) => v.id === item.id.videoId);
      return {
        ...item,
        ...details
      };
    });

    return {
      videos,
      totalResults: data.pageInfo.totalResults,
      resultsPerPage: data.pageInfo.resultsPerPage
    };
  }

  return {
    videos: [],
    totalResults: 0,
    resultsPerPage: 0
  };
}

/**
 * Get video details including duration
 */
async function getVideoDetails(apiKey: string, videoIds: string[]): Promise<any> {
  const baseUrl = 'https://www.googleapis.com/youtube/v3/videos';

  const params = new URLSearchParams({
    key: apiKey,
    part: 'contentDetails,statistics,snippet',
    id: videoIds.join(',')
  });

  const response = await fetch(`${baseUrl}?${params}`);

  if (!response.ok) {
    throw new Error('Failed to fetch video details');
  }

  const data = await response.json();

  // Parse and format video data
  const videos = data.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails?.medium?.url,
    duration: parseDuration(item.contentDetails.duration),
    viewCount: parseInt(item.statistics.viewCount || '0'),
    likeCount: parseInt(item.statistics.likeCount || '0'),
    embedUrl: `https://www.youtube.com/embed/${item.id}`,
    hasAds: checkForAds(item)
  }));

  return { videos };
}

/**
 * Get channel details
 */
async function getChannelDetails(apiKey: string, params: any): Promise<any> {
  const baseUrl = 'https://www.googleapis.com/youtube/v3/channels';

  const searchParams = new URLSearchParams({
    key: apiKey,
    part: 'snippet,statistics',
    id: params.channelIds || '',
    forUsername: params.username || ''
  });

  const response = await fetch(`${baseUrl}?${searchParams}`);

  if (!response.ok) {
    throw new Error('Failed to fetch channel details');
  }

  return await response.json();
}

/**
 * Parse ISO 8601 duration to seconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Check if video likely has ads based on duration and channel
 */
function checkForAds(video: any): boolean {
  const duration = parseDuration(video.contentDetails.duration);

  // Videos over 8 minutes can have mid-roll ads
  if (duration > 480) {
    return true;
  }

  // Some channels are known to have ads even on short videos
  // This would be expanded with a list of commercial channels
  return false;
}

export default httpTrigger;