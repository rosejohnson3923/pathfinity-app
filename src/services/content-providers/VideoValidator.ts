/**
 * Video Validator Service
 * Validates YouTube videos for playability and educational quality
 * Prevents showing broken or restricted videos to users
 */

export interface VideoValidationResult {
  isPlayable: boolean;
  reason?: string;
  warnings?: string[];
  alternativeAction?: 'skip' | 'retry' | 'use_backup';
}

export class VideoValidator {
  private blacklistedVideos: Set<string> = new Set();
  private validatedCache: Map<string, VideoValidationResult> = new Map();

  constructor() {
    // Load any previously blacklisted videos from localStorage
    this.loadBlacklist();
  }

  /**
   * Validate a video before showing it to users
   */
  async validateVideo(videoId: string): Promise<VideoValidationResult> {
    // Check cache first
    if (this.validatedCache.has(videoId)) {
      return this.validatedCache.get(videoId)!;
    }

    // Check blacklist
    if (this.blacklistedVideos.has(videoId)) {
      return {
        isPlayable: false,
        reason: 'Video previously failed validation',
        alternativeAction: 'skip'
      };
    }

    try {
      // Method 1: Check YouTube oEmbed endpoint (doesn't require API key)
      const oembedResult = await this.checkOembed(videoId);
      if (!oembedResult.isPlayable) {
        this.addToBlacklist(videoId);
        this.validatedCache.set(videoId, oembedResult);
        return oembedResult;
      }

      // Method 2: Check video availability via YouTube API
      const apiResult = await this.checkViaAPI(videoId);
      if (!apiResult.isPlayable) {
        this.addToBlacklist(videoId);
        this.validatedCache.set(videoId, apiResult);
        return apiResult;
      }

      // Method 3: Check for region/embed restrictions
      const restrictionResult = await this.checkRestrictions(videoId);

      // Cache successful validation
      this.validatedCache.set(videoId, restrictionResult);
      return restrictionResult;

    } catch (error) {
      console.error(`Video validation failed for ${videoId}:`, error);
      return {
        isPlayable: false,
        reason: 'Validation error occurred',
        alternativeAction: 'retry'
      };
    }
  }

  /**
   * Check video using YouTube oEmbed endpoint (no API key required)
   */
  private async checkOembed(videoId: string): Promise<VideoValidationResult> {
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return {
            isPlayable: false,
            reason: 'Video not found or private',
            alternativeAction: 'skip'
          };
        }
        if (response.status === 401) {
          return {
            isPlayable: false,
            reason: 'Video is private or unlisted',
            alternativeAction: 'skip'
          };
        }
      }

      const data = await response.json();

      // Check if it's embeddable
      if (data.provider_name !== 'YouTube') {
        return {
          isPlayable: false,
          reason: 'Not a valid YouTube video',
          alternativeAction: 'skip'
        };
      }

      return {
        isPlayable: true
      };

    } catch (error) {
      console.warn(`oEmbed check failed for ${videoId}:`, error);
      // Don't fail completely if oEmbed check fails
      return { isPlayable: true, warnings: ['oEmbed check failed'] };
    }
  }

  /**
   * Check video details via YouTube Data API
   */
  private async checkViaAPI(videoId: string): Promise<VideoValidationResult> {
    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) {
        return { isPlayable: true, warnings: ['API key not available'] };
      }

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=status,contentDetails&key=${apiKey}`
      );

      if (!response.ok) {
        return {
          isPlayable: false,
          reason: 'Failed to fetch video details',
          alternativeAction: 'retry'
        };
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return {
          isPlayable: false,
          reason: 'Video not found',
          alternativeAction: 'skip'
        };
      }

      const video = data.items[0];
      const status = video.status;
      const contentDetails = video.contentDetails;

      // Check upload status
      if (status.uploadStatus !== 'processed') {
        return {
          isPlayable: false,
          reason: `Video upload status: ${status.uploadStatus}`,
          alternativeAction: 'skip'
        };
      }

      // Check privacy status
      if (status.privacyStatus === 'private') {
        return {
          isPlayable: false,
          reason: 'Video is private',
          alternativeAction: 'skip'
        };
      }

      // Check if embeddable
      if (status.embeddable === false) {
        return {
          isPlayable: false,
          reason: 'Video embedding is disabled',
          alternativeAction: 'skip'
        };
      }

      // Check for age restrictions
      if (contentDetails.contentRating?.ytRating === 'ytAgeRestricted') {
        return {
          isPlayable: false,
          reason: 'Video is age-restricted',
          alternativeAction: 'skip'
        };
      }

      // Check license
      if (status.license === 'creativeCommon' && status.publicStatsViewable === false) {
        return {
          isPlayable: false,
          reason: 'Video has restrictive license',
          alternativeAction: 'skip'
        };
      }

      return {
        isPlayable: true
      };

    } catch (error) {
      console.warn(`API check failed for ${videoId}:`, error);
      return { isPlayable: true, warnings: ['API check failed'] };
    }
  }

  /**
   * Check for region and embed restrictions
   */
  private async checkRestrictions(videoId: string): Promise<VideoValidationResult> {
    const warnings: string[] = [];

    // Check if video is available in user's region
    try {
      // This would need geolocation API or user settings
      const userRegion = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // For now, we'll just warn about potential region restrictions
      if (userRegion && !userRegion.includes('America')) {
        warnings.push('Video may have region restrictions outside US');
      }
    } catch (error) {
      console.warn('Could not check region restrictions:', error);
    }

    return {
      isPlayable: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Test video embed directly
   */
  async testEmbed(videoId: string): Promise<boolean> {
    return new Promise((resolve) => {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0`;

      let timeoutId: NodeJS.Timeout;

      const cleanup = () => {
        clearTimeout(timeoutId);
        iframe.remove();
      };

      iframe.onload = () => {
        cleanup();
        resolve(true);
      };

      iframe.onerror = () => {
        cleanup();
        this.addToBlacklist(videoId);
        resolve(false);
      };

      // Timeout after 5 seconds
      timeoutId = setTimeout(() => {
        cleanup();
        resolve(false);
      }, 5000);

      document.body.appendChild(iframe);
    });
  }

  /**
   * Add video to blacklist
   */
  private addToBlacklist(videoId: string): void {
    this.blacklistedVideos.add(videoId);
    this.saveBlacklist();
    console.warn(`Video ${videoId} added to blacklist`);
  }

  /**
   * Save blacklist to localStorage
   */
  private saveBlacklist(): void {
    try {
      const blacklistArray = Array.from(this.blacklistedVideos);
      localStorage.setItem('pathfinity_video_blacklist', JSON.stringify(blacklistArray));
    } catch (error) {
      console.error('Failed to save video blacklist:', error);
    }
  }

  /**
   * Load blacklist from localStorage
   */
  private loadBlacklist(): void {
    try {
      const stored = localStorage.getItem('pathfinity_video_blacklist');
      if (stored) {
        const blacklistArray = JSON.parse(stored);
        this.blacklistedVideos = new Set(blacklistArray);
        console.log(`Loaded ${this.blacklistedVideos.size} blacklisted videos`);
      }
    } catch (error) {
      console.error('Failed to load video blacklist:', error);
    }
  }

  /**
   * Clear blacklist (for admin use)
   */
  clearBlacklist(): void {
    this.blacklistedVideos.clear();
    this.validatedCache.clear();
    localStorage.removeItem('pathfinity_video_blacklist');
    console.log('Video blacklist cleared');
  }

  /**
   * Get blacklist statistics
   */
  getStats(): { blacklisted: number; cached: number } {
    return {
      blacklisted: this.blacklistedVideos.size,
      cached: this.validatedCache.size
    };
  }
}

// Export singleton instance
export const videoValidator = new VideoValidator();