/**
 * YouTube Educational Service
 * Integrates with YouTube Data API v3 for educational video content
 */

import {
  YouTubeVideo,
  YouTubeTranscript,
  YouTubeSearchParams,
  YouTubeSearchResult
} from './types';
import { videoSelector } from './VideoSelector';
import { dualModeContent } from './DualModeContent';
import { SkillOptimizationService } from '../SkillOptimizationService';
import { azureYouTubeProxy } from './AzureYouTubeProxy';

export class YouTubeService {
  private apiKey: string;
  private baseUrl: string = 'https://www.googleapis.com/youtube/v3';
  private cache: Map<string, { data: any; expires: number }>;

  // Curated educational channels for K-12 quality content
  // Channel IDs mapped to channel names
  private readonly EDUCATIONAL_CHANNELS: Record<string, string> = {};

  constructor() {
    this.apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!this.apiKey) {
      console.warn('YouTube API key not found in environment variables');
    }
    this.cache = new Map();

    // Initialize educational channels with duplicate checking
    this.initializeEducationalChannels();
  }

  /**
   * Initialize educational channels with duplicate detection
   */
  private initializeEducationalChannels(): void {
    const channels = [
      // Early Childhood (K-2)
      { id: 'UCbxK6jzYms1iMkU9Kwvl0sA', name: 'PBS Kids' },
      { id: 'UCXwNkgpVtZJpYCO4yLMKzqA', name: 'Sesame Street' },
      { id: 'UC7Pq3Ko42YpkCB_Q4E981jw', name: 'Jack Hartmann Kids Music' },
      { id: 'UCe_vXdMrHHseZ_esYUskSBw', name: 'The Singing Walrus' },
      { id: 'UCoGN3n8Ao87NAq8dV4ruLHA', name: 'Super Simple Songs' },
      { id: 'UC5PYHgAzJ1wLEidB58SK6Xw', name: 'Cocomelon - Nursery Rhymes' },
      { id: 'UCq1xrpTXR-wMDFNj9cRqh0A', name: 'Numberblocks' },
      { id: 'UCvg_A5gMnIPLyB-TycM-GDQ', name: 'Alphablocks' },

      // Elementary (3-5)
      { id: 'UC4a-Gbdw7vOaccHmFo40b9g', name: 'Khan Academy Kids' },
      { id: 'UCNcH3g9yVAr0jBaoHQHSZsg', name: 'National Geographic Kids' },
      { id: 'UCsooa4yRKGN_zEE8iknghZA', name: 'TED-Ed' },
      { id: 'UC0sUzmZ0CHvVCVrpRfGKZfw', name: 'Free School' },
      { id: 'UCOuJHd0K4Y3Ni3Aq5XCrQHQ', name: 'Homeschool Pop' },

      // Upper Elementary/Middle School (6-8)
      { id: 'UCX6b17PVsYBQ0ip5gyeme-Q', name: 'CrashCourse Kids' },
      { id: 'UCZYTClx2T1of7BRZ86-8fow', name: 'SciShow Kids' },
      { id: 'UCtJVZjY6xsZUV-3fAWsBLQA', name: 'Peekaboo Kidz' },

      // General Educational (All Ages)
      { id: 'UCttFk7-kVP3hnoUccl6ghqw', name: 'Learning Mole' },
      { id: 'UCJkWoS4RsldA1coEIot5QGA', name: 'Smile and Learn - English' }
    ];

    // Add channels while checking for duplicates
    for (const channel of channels) {
      if (this.EDUCATIONAL_CHANNELS[channel.id]) {
        console.warn(`Duplicate channel ID detected: ${channel.id} (${channel.name}) already exists as ${this.EDUCATIONAL_CHANNELS[channel.id]}`);
      } else {
        this.EDUCATIONAL_CHANNELS[channel.id] = channel.name;
      }
    }

    console.log(`Initialized ${Object.keys(this.EDUCATIONAL_CHANNELS).length} educational channels`);
  }

  /**
   * Search for educational videos
   */
  async searchEducationalVideos(
    grade: string,
    subject: string,
    skill: string
  ): Promise<YouTubeSearchResult> {
    // Optimize the skill name for better YouTube search results
    const optimization = SkillOptimizationService.optimizeSkill(skill, subject, grade);

    console.log('🔍 YouTube Search Optimization:', {
      original: skill,
      optimized: optimization.youtube_search_terms,
      keyTerms: optimization.simplified_terms
    });

    // Use optimized search query
    const params: YouTubeSearchParams = {
      query: optimization.youtube_search_terms,
      maxDuration: 480, // 8 minutes to avoid mid-roll ads
      minDuration: 60,  // At least 1 minute for quality content
      safeSearch: 'strict',
      orderBy: 'relevance',
      limit: 25  // Get more results to filter from
    };

    const cacheKey = this.getCacheKey('search', params);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    // Try Azure proxy first if available
    if (import.meta.env.VITE_USE_AZURE_YOUTUBE_PROXY === 'true') {
      try {
        console.log('🔷 Attempting YouTube search through Azure proxy...');
        const azureResult = await azureYouTubeProxy.searchThroughAzure(params);
        this.setCache(cacheKey, azureResult, 3600000); // Cache for 1 hour
        return azureResult;
      } catch (error) {
        console.warn('Azure proxy failed, falling back to direct API:', error);
      }
    }

    try {
      const searchUrl = new URL(`${this.baseUrl}/search`);
      searchUrl.searchParams.append('key', this.apiKey);
      searchUrl.searchParams.append('part', 'snippet');
      searchUrl.searchParams.append('q', params.query);
      searchUrl.searchParams.append('type', 'video');
      // Don't use videoDuration filter here - we'll filter after getting details
      // This allows us to get 2-8 minute videos but exclude Shorts
      searchUrl.searchParams.append('safeSearch', params.safeSearch || 'strict');
      searchUrl.searchParams.append('order', params.orderBy || 'relevance');
      searchUrl.searchParams.append('maxResults', String(params.limit || 25));
      searchUrl.searchParams.append('videoEmbeddable', 'true');
      // Add relevanceLanguage to prefer English content
      searchUrl.searchParams.append('relevanceLanguage', 'en');

      // Note: YouTube API doesn't support multiple channelIds in one query
      // We'll search broadly and filter results instead

      console.log('YouTube API URL:', searchUrl.toString());

      const response = await fetch(searchUrl.toString());
      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube API Error:', errorText);
        throw new Error(`YouTube API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('YouTube API Response:', data);

      // Check if we got results
      if (!data.items || data.items.length === 0) {
        console.log('No videos found for query:', params.query);
        return {
          videos: [],
          totalCount: 0,
          nextPageToken: undefined
        };
      }

      // Get video details for scoring
      const videoIds = data.items.map((item: any) => item.id.videoId);
      console.log('Found video IDs:', videoIds);
      let videos = await this.getVideoDetails(videoIds);

      // Sort videos by educational score (highest first)
      videos.sort((a: any, b: any) => b.educationalScore - a.educationalScore);

      console.log('📊 Videos sorted by score:');
      videos.slice(0, 5).forEach((v: any, i: number) => {
        console.log(`  ${i + 1}. Score: ${v.educationalScore} - "${v.title}" (${v.duration}s, ${v.viewCount} views)`);
      });

      const result: YouTubeSearchResult = {
        videos,
        totalCount: data.pageInfo.totalResults,
        nextPageToken: data.nextPageToken
      };

      this.setCache(cacheKey, result, 3600); // Cache for 1 hour
      return result;
    } catch (error) {
      console.error('YouTube search failed:', error);
      throw error;
    }
  }

  /**
   * Get detailed video information including duration and statistics
   */
  async getVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
    if (videoIds.length === 0) return [];

    const detailsUrl = new URL(`${this.baseUrl}/videos`);
    detailsUrl.searchParams.append('key', this.apiKey);
    detailsUrl.searchParams.append('part', 'snippet,contentDetails,statistics');
    detailsUrl.searchParams.append('id', videoIds.join(','));

    console.log('Fetching video details from:', detailsUrl.toString());

    const response = await fetch(detailsUrl.toString());
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Video details API error:', errorText);
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Video details response:', data);

    return data.items
      .map((item: any) => {
        const duration = this.parseDuration(item.contentDetails.duration);
        const hasAds = this.detectAds(item, duration);

        const video = {
          id: item.id,
          title: item.snippet.title,
          channelId: item.snippet.channelId,
          channelTitle: item.snippet.channelTitle,
          duration,
          embedUrl: `https://www.youtube.com/embed/${item.id}`,
          thumbnailUrl: item.snippet.thumbnails.high.url,
          viewCount: parseInt(item.statistics?.viewCount || 0),
          likeCount: parseInt(item.statistics?.likeCount || 0),
          publishedAt: new Date(item.snippet.publishedAt),
          hasAds,
          hasTranscript: true, // Assume true, verify when fetching
          educationalScore: this.calculateEducationalScore(item, duration, hasAds),
          isShort: duration < 60 // Flag videos under 60 seconds as Shorts
        };

        console.log('Processed video:', video.title, 'Duration:', video.duration, 'Score:', video.educationalScore, 'IsShort:', video.isShort);
        return video;
      })
      .filter((video: any) => {
        // Exclude YouTube Shorts (under 60 seconds)
        if (video.duration < 60) {
          console.log('❌ Excluding Short:', video.title, 'Duration:', video.duration);
          return false;
        }

        // Exclude videos with very low view counts (likely low quality)
        if (video.viewCount < 100) {
          console.log('❌ Excluding low views:', video.title, 'Views:', video.viewCount);
          return false;
        }

        // Exclude videos with poor educational scores
        if (video.educationalScore < 20) {
          console.log('❌ Excluding low score:', video.title, 'Score:', video.educationalScore);
          return false;
        }

        return true;
      });
  }

  /**
   * Get transcript/captions for a video
   */
  async getTranscript(videoId: string): Promise<YouTubeTranscript[]> {
    const cacheKey = `transcript:${videoId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // YouTube doesn't provide transcripts via API directly
      // We'll need to use the timedtext API or a third-party service
      // For now, returning mock data - in production, use youtube-transcript or similar

      const mockTranscript: YouTubeTranscript[] = [
        {
          text: "Welcome to our lesson on counting.",
          start: 0,
          duration: 3
        },
        {
          text: "Today we'll learn how to count from 1 to 10.",
          start: 3,
          duration: 4
        },
        {
          text: "Let's start with the number 1.",
          start: 7,
          duration: 3
        }
      ];

      this.setCache(cacheKey, mockTranscript, 86400); // Cache for 24 hours
      return mockTranscript;
    } catch (error) {
      console.error(`Failed to fetch transcript for ${videoId}:`, error);
      return [];
    }
  }

  /**
   * Get dual-mode content for a video (video + text modes)
   */
  async getDualModeContent(
    video: YouTubeVideo,
    gradeLevel?: string
  ) {
    const transcript = await this.getTranscript(video.id);

    return dualModeContent.createDualModeExperience(
      video,
      transcript,
      {
        enhanceTranscript: true,
        includeKeyPoints: true,
        gradeLevel: gradeLevel || 'K',
        preferredMode: 'video' // Default to video for engagement
      }
    );
  }

  /**
   * Score video quality for educational purposes
   */
  async scoreVideoQuality(video: YouTubeVideo): Promise<number> {
    let score = 0;

    // Prioritize videos without ads (highest weight)
    if (!video.hasAds) {
      score += 100;
    }

    // Educational channel bonus
    if (Object.keys(this.EDUCATIONAL_CHANNELS).includes(video.channelId)) {
      score += 50;
    }

    // Optimal duration (2-8 minutes for kindergarten, longer ok for higher grades)
    if (video.duration >= 120 && video.duration <= 480) {
      score += 40;  // Best range for educational content
    } else if (video.duration >= 60 && video.duration < 120) {
      score += 10;  // Too short but acceptable
    } else if (video.duration < 60) {
      score -= 50;  // Heavily penalize Shorts
    }

    // Engagement metrics
    if (video.viewCount > 0) {
      score += Math.min(Math.log10(video.viewCount) * 5, 25);
    }

    // Like ratio
    if (video.likeCount > 0 && video.viewCount > 0) {
      const likeRatio = video.likeCount / video.viewCount;
      score += likeRatio * 100;
    }

    // Recency (newer content might be more relevant)
    const ageInDays = (Date.now() - video.publishedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays < 365) {
      score += 10;
    }

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Detect if a video likely has ads
   */
  detectAds(videoData: any, duration: number): boolean {
    // Videos under 8 minutes typically only have pre-roll ads
    // Videos over 8 minutes can have mid-roll ads
    // Non-monetized channels won't have ads

    const channelId = videoData.snippet.channelId;
    const isEducationalChannel = Object.keys(this.EDUCATIONAL_CHANNELS).includes(channelId);

    // Educational channels are less likely to have ads
    if (isEducationalChannel && duration < 480) {
      return false;
    }

    // Videos over 8 minutes likely have mid-roll ads
    if (duration > 480) {
      return true;
    }

    // Default assumption for short videos
    return duration > 60; // Very short videos rarely have ads
  }

  /**
   * Select the best video from search results using VideoSelector
   */
  async selectOptimalVideo(videos: YouTubeVideo[], gradeLevel?: string): Promise<YouTubeVideo | null> {
    if (videos.length === 0) return null;

    // Use VideoSelector for intelligent selection with grade-specific weights
    const optimal = videoSelector.selectOptimalVideo(videos, {
      maxDuration: 480, // 8 minutes max to avoid mid-roll ads
      preferAdFree: true,
      minEducationalScore: 30,
      gradeLevel: gradeLevel // Pass grade for appropriate weighting
    });

    return optimal;
  }

  /**
   * Get top N videos ranked by quality
   */
  async getTopVideos(videos: YouTubeVideo[], count: number = 5): Promise<YouTubeVideo[]> {
    return videoSelector.getTopVideos(videos, count);
  }

  /**
   * Filter videos to avoid mid-roll ads
   */
  async filterShortVideos(videos: YouTubeVideo[]): Promise<YouTubeVideo[]> {
    return videoSelector.filterByDuration(videos, 8); // 8 minutes max
  }

  /**
   * Parse ISO 8601 duration to seconds
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Calculate educational score for ranking
   * Prioritizes known educational channels and content quality
   */
  private calculateEducationalScore(item: any, duration: number, hasAds: boolean): number {
    let score = 0;

    // Known educational channel is most important
    if (Object.keys(this.EDUCATIONAL_CHANNELS).includes(item.snippet.channelId)) {
      score += 50;  // Highest weight - trusted sources
    }

    // Optimal duration for learning
    if (duration >= 120 && duration <= 480) score += 25;
    else if (duration >= 60 && duration < 120) score += 15;  // Short but viable

    // Engagement/credibility
    const viewCount = parseInt(item.statistics.viewCount || 0);
    if (viewCount > 100000) score += 15;
    else if (viewCount > 10000) score += 10;
    else if (viewCount > 1000) score += 5;

    // No ads is nice but not critical (we wrap with Pathfinity intro)
    if (!hasAds) score += 10;

    return score;
  }

  // Cache management
  private getCacheKey(type: string, params: any): string {
    return `${type}:${JSON.stringify(params)}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any, ttlSeconds: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlSeconds * 1000
    });
  }
}

// Export singleton instance
export const youTubeService = new YouTubeService();