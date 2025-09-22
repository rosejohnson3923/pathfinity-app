/**
 * Smart Video Selector Service
 * Intelligently selects optimal educational videos based on multiple quality factors
 * Part of the Narrative-First Architecture - Phase 1.2
 */

import { YouTubeVideo } from './types';

export interface VideoSelectionCriteria {
  maxDuration?: number; // in seconds
  minDuration?: number; // in seconds
  preferAdFree?: boolean;
  minEducationalScore?: number;
  requiredChannels?: string[];
  excludeChannels?: string[];
  gradeLevel?: string; // K, 1, 2, 3, etc. for grade-specific weighting
}

export interface VideoScore {
  video: YouTubeVideo;
  totalScore: number;
  scores: {
    adFree: number;
    duration: number;
    educational: number;
    engagement: number;
    recency: number;
  };
  reasons: string[];
}

export class VideoSelector {
  // Default scoring weights
  private readonly DEFAULT_WEIGHTS = {
    EDUCATIONAL: 35,
    DURATION: 30,
    ENGAGEMENT: 20,
    AD_FREE: 10,
    RECENCY: 5
  };

  /**
   * Get grade-specific weights
   * For younger grades, community validation (engagement) matters as much as institutional trust
   */
  private getWeightsForGrade(gradeLevel?: string): typeof this.DEFAULT_WEIGHTS {
    if (!gradeLevel) return this.DEFAULT_WEIGHTS;

    const grade = gradeLevel.toUpperCase();

    // K-2: Parents/teachers have vetted popular content
    // Equal weight to trusted channels and community validation
    if (grade === 'K' || grade === '1' || grade === '2') {
      return {
        ENGAGEMENT: 30,     // Parent/teacher validated through views/likes
        EDUCATIONAL: 30,    // Trusted channels still important
        DURATION: 25,       // Critical for attention span
        AD_FREE: 10,        // We handle with Pathfinity intro
        RECENCY: 5          // Less important for foundational concepts
      };
    }

    // 3-5: Balance shifts slightly toward educational quality
    if (grade === '3' || grade === '4' || grade === '5') {
      return {
        EDUCATIONAL: 30,
        ENGAGEMENT: 25,
        DURATION: 30,
        AD_FREE: 10,
        RECENCY: 5
      };
    }

    // 6-8: Educational quality becomes more important
    if (grade === '6' || grade === '7' || grade === '8') {
      return {
        EDUCATIONAL: 35,
        DURATION: 30,
        ENGAGEMENT: 20,
        AD_FREE: 10,
        RECENCY: 5
      };
    }

    // High school and beyond: Original weights
    return this.DEFAULT_WEIGHTS;
  };

  // Ideal video characteristics
  private readonly IDEAL = {
    DURATION_MIN: 60,    // 1 minute minimum
    DURATION_MAX: 480,   // 8 minutes maximum (no mid-roll ads - critical!)
    DURATION_SWEET_SPOT: 180, // 3 minutes ideal for young learners
    MIN_VIEWS: 1000,     // Minimum credibility threshold
    DAYS_RECENT: 365     // Consider videos from last year as "recent"
  };

  /**
   * Select the single best video from a list
   */
  selectOptimalVideo(
    videos: YouTubeVideo[],
    criteria?: VideoSelectionCriteria
  ): YouTubeVideo | null {
    if (!videos || videos.length === 0) {
      return null;
    }

    const scoredVideos = this.scoreVideos(videos, criteria);
    const optimal = scoredVideos[0];

    console.log('Optimal video selected:', {
      title: optimal.video.title,
      score: optimal.totalScore,
      reasons: optimal.reasons
    });

    return optimal.video;
  }

  /**
   * Score and rank all videos
   */
  scoreVideos(
    videos: YouTubeVideo[],
    criteria?: VideoSelectionCriteria
  ): VideoScore[] {
    const scored = videos.map(video => this.scoreVideo(video, criteria));

    // Sort by total score (highest first)
    return scored.sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Calculate comprehensive score for a single video
   */
  private scoreVideo(
    video: YouTubeVideo,
    criteria?: VideoSelectionCriteria
  ): VideoScore {
    const scores = {
      adFree: this.scoreAdFree(video),
      duration: this.scoreDuration(video, criteria),
      educational: this.scoreEducational(video),
      engagement: this.scoreEngagement(video),
      recency: this.scoreRecency(video)
    };

    // Use grade-specific weights
    const weights = this.getWeightsForGrade(criteria?.gradeLevel);

    const totalScore =
      scores.adFree * weights.AD_FREE +
      scores.duration * weights.DURATION +
      scores.educational * weights.EDUCATIONAL +
      scores.engagement * weights.ENGAGEMENT +
      scores.recency * weights.RECENCY;

    const reasons = this.generateReasons(video, scores, criteria?.gradeLevel);

    return {
      video,
      totalScore: Math.round(totalScore),
      scores,
      reasons
    };
  }

  /**
   * Score based on ad presence (0-1)
   * Lower weight since Pathfinity intro replaces pre-roll ads
   */
  private scoreAdFree(video: YouTubeVideo): number {
    return video.hasAds ? 0 : 1;
  }

  /**
   * Score based on duration optimization (0-1)
   */
  private scoreDuration(
    video: YouTubeVideo,
    criteria?: VideoSelectionCriteria
  ): number {
    const duration = video.duration;

    // Apply custom criteria if provided
    if (criteria) {
      if (criteria.maxDuration && duration > criteria.maxDuration) {
        return 0;
      }
      if (criteria.minDuration && duration < criteria.minDuration) {
        return 0;
      }
    }

    // Too short - might lack substance
    if (duration < this.IDEAL.DURATION_MIN) {
      return 0.3;
    }

    // Too long - risk of mid-roll ads and attention loss
    if (duration > this.IDEAL.DURATION_MAX) {
      return 0.2;
    }

    // Calculate score based on proximity to sweet spot
    const sweetSpot = this.IDEAL.DURATION_SWEET_SPOT;
    const deviation = Math.abs(duration - sweetSpot);
    const maxDeviation = sweetSpot;

    return Math.max(0, 1 - (deviation / maxDeviation));
  }

  /**
   * Score based on educational quality (0-1)
   */
  private scoreEducational(video: YouTubeVideo): number {
    // Use the pre-calculated educational score if available
    if (video.educationalScore !== undefined) {
      return Math.min(100, video.educationalScore) / 100;
    }

    // Fallback: basic heuristics
    let score = 0.5; // baseline

    // Check for educational keywords in title
    const educationalKeywords = [
      'learn', 'education', 'teach', 'lesson', 'tutorial',
      'explain', 'how to', 'introduction', 'basics', 'fundamental',
      'kids', 'children', 'kindergarten', 'preschool', 'elementary'
    ];

    const titleLower = video.title.toLowerCase();
    const hasEducationalKeywords = educationalKeywords.some(
      keyword => titleLower.includes(keyword)
    );

    if (hasEducationalKeywords) {
      score += 0.3;
    }

    // Bonus for known educational channels
    const educationalChannels = [
      // K-2 focused
      'PBS Kids', 'Sesame Street', 'Jack Hartmann',
      'Singing Walrus', 'Super Simple Songs', 'Cocomelon',
      'Numberblocks', 'Alphablocks',
      // 3-5 focused
      'Khan Academy', 'National Geographic Kids', 'Homeschool Pop',
      // General educational
      'TED-Ed', 'Learning Mole', 'Smile and Learn',
      'Peekaboo Kidz', 'Free School'
    ];

    if (educationalChannels.some(channel =>
      video.channelTitle.toLowerCase().includes(channel.toLowerCase())
    )) {
      score += 0.2;
    }

    return Math.min(1, score);
  }

  /**
   * Score based on engagement metrics (0-1)
   */
  private scoreEngagement(video: YouTubeVideo): number {
    if (!video.viewCount || video.viewCount < this.IDEAL.MIN_VIEWS) {
      return 0.2; // Low credibility
    }

    // Calculate like ratio if available
    if (video.likeCount && video.viewCount) {
      const likeRatio = video.likeCount / video.viewCount;

      // Typical good videos have 3-5% like ratio
      if (likeRatio > 0.05) return 1.0;
      if (likeRatio > 0.03) return 0.8;
      if (likeRatio > 0.01) return 0.6;
      return 0.4;
    }

    // Fallback: score based on view count
    if (video.viewCount > 1000000) return 0.9;
    if (video.viewCount > 100000) return 0.7;
    if (video.viewCount > 10000) return 0.5;
    return 0.3;
  }

  /**
   * Score based on recency (0-1)
   */
  private scoreRecency(video: YouTubeVideo): number {
    if (!video.publishedAt) {
      return 0.5; // neutral if unknown
    }

    const now = new Date();
    const published = new Date(video.publishedAt);
    const daysAgo = (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24);

    if (daysAgo < 30) return 1.0;     // Very recent
    if (daysAgo < 90) return 0.9;     // Recent
    if (daysAgo < 180) return 0.8;    // Fairly recent
    if (daysAgo < 365) return 0.7;    // Within a year
    if (daysAgo < 730) return 0.5;    // Within 2 years
    return 0.3;                       // Older content
  }

  /**
   * Generate human-readable reasons for selection
   */
  private generateReasons(video: YouTubeVideo, scores: VideoScore['scores'], gradeLevel?: string): string[] {
    const reasons: string[] = [];

    // Priority reasons based on new weights
    if (scores.educational > 0.7) {
      reasons.push('High educational quality');
    }

    if (scores.duration > 0.8) {
      reasons.push(`Perfect duration (${Math.floor(video.duration / 60)} minutes) - no mid-roll ads`);
    } else if (video.duration <= this.IDEAL.DURATION_MAX) {
      reasons.push(`Good duration (${Math.floor(video.duration / 60)} minutes)`);
    }

    if (scores.engagement > 0.7) {
      reasons.push('Highly engaging content');
    }

    if (scores.adFree === 1) {
      reasons.push('Bonus: Ad-free');
    }

    if (scores.recency > 0.8) {
      reasons.push('Recently published');
    }

    // Add warnings only for critical issues
    if (video.duration > this.IDEAL.DURATION_MAX) {
      reasons.push('⚠️ Long duration - possible mid-roll ads');
    }

    // Note about Pathfinity wrapper handling pre-roll ads
    if (video.hasAds && video.duration <= this.IDEAL.DURATION_MAX) {
      reasons.push('✓ Pre-roll ads replaced by Pathfinity intro');
    }

    return reasons;
  }

  /**
   * Filter videos by specific criteria
   */
  filterVideos(
    videos: YouTubeVideo[],
    criteria: VideoSelectionCriteria
  ): YouTubeVideo[] {
    return videos.filter(video => {
      // Duration filters
      if (criteria.maxDuration && video.duration > criteria.maxDuration) {
        return false;
      }
      if (criteria.minDuration && video.duration < criteria.minDuration) {
        return false;
      }

      // Ad-free preference
      if (criteria.preferAdFree && video.hasAds) {
        // Don't exclude, just deprioritize (handled in scoring)
      }

      // Educational score threshold
      if (criteria.minEducationalScore &&
          video.educationalScore !== undefined &&
          video.educationalScore < criteria.minEducationalScore) {
        return false;
      }

      // Channel filters
      if (criteria.requiredChannels && criteria.requiredChannels.length > 0) {
        const inRequired = criteria.requiredChannels.some(
          channel => video.channelTitle.toLowerCase().includes(channel.toLowerCase())
        );
        if (!inRequired) return false;
      }

      if (criteria.excludeChannels && criteria.excludeChannels.length > 0) {
        const inExcluded = criteria.excludeChannels.some(
          channel => video.channelTitle.toLowerCase().includes(channel.toLowerCase())
        );
        if (inExcluded) return false;
      }

      return true;
    });
  }

  /**
   * Get top N videos by score
   */
  getTopVideos(
    videos: YouTubeVideo[],
    count: number = 5,
    criteria?: VideoSelectionCriteria
  ): YouTubeVideo[] {
    const scored = this.scoreVideos(videos, criteria);
    return scored.slice(0, count).map(s => s.video);
  }

  /**
   * Prioritize ad-free videos
   */
  prioritizeAdFree(videos: YouTubeVideo[]): YouTubeVideo[] {
    return videos.sort((a, b) => {
      // Ad-free videos first
      if (!a.hasAds && b.hasAds) return -1;
      if (a.hasAds && !b.hasAds) return 1;

      // Then by educational score
      const scoreA = a.educationalScore || 0;
      const scoreB = b.educationalScore || 0;
      return scoreB - scoreA;
    });
  }

  /**
   * Filter by duration to avoid mid-roll ads
   */
  filterByDuration(videos: YouTubeVideo[], maxMinutes: number = 8): YouTubeVideo[] {
    const maxSeconds = maxMinutes * 60;
    return videos.filter(video => video.duration <= maxSeconds);
  }
}

// Export singleton instance
export const videoSelector = new VideoSelector();