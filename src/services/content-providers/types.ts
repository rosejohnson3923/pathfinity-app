/**
 * Content Provider Types
 * Shared types for external content providers (YouTube, etc.)
 */

// YouTube specific types
export interface YouTubeVideo {
  id: string;
  title: string;
  channelId: string;
  channelTitle: string;
  duration: number; // seconds
  embedUrl: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  publishedAt: Date;
  hasAds: boolean;
  hasTranscript: boolean;
  educationalScore?: number;
}

export interface YouTubeTranscript {
  text: string;
  start: number; // seconds
  duration: number; // seconds
}

export interface YouTubeSearchParams {
  query: string;
  channelIds?: string[];
  maxDuration?: number; // seconds
  minDuration?: number;
  safeSearch?: 'none' | 'moderate' | 'strict';
  orderBy?: 'relevance' | 'viewCount' | 'rating' | 'date';
  limit?: number;
}

export interface YouTubeSearchResult {
  videos: YouTubeVideo[];
  totalCount: number;
  nextPageToken?: string;
}

// Pathfinity transformation types
export interface PathfinityInstruction {
  narrative: {
    intro: string;
    outro: string;
  };
  core: {
    objectives: string[];
    vocabulary: PathfinityTerm[];
    content: PathfinityContent[];
    examples: PathfinityExample[];
  };
  practice: PathfinityPractice[];
  resources: PathfinityResource[];
}

export interface PathfinityContent {
  type: 'text' | 'video' | 'interactive' | 'image';
  content: any;
  metadata: {
    source: 'youtube' | 'pathfinity' | 'other';
    sourceId?: string;
    duration?: number;
  };
}

export interface PathfinityTerm {
  term: string;
  definition: string;
  careerContext: string; // How this term relates to the career
}

export interface PathfinityExample {
  setup: string; // Career-contextualized problem setup
  problem: string;
  solution: string;
  explanation: string;
  careerApplication: string; // How this applies to the career
}

export interface PathfinityPractice {
  id: string;
  narrative: string; // Career context for the question
  question: string;
  type: string;
  choices?: string[];
  correctAnswer: string | number;
  feedback: {
    correct: string;
    incorrect: string;
    hint: string;
  };
}

export interface PathfinityResource {
  type: 'reference' | 'tool' | 'exploration';
  title: string;
  description: string;
  url: string;
  careerRelevance: string;
}

export interface PathfinityVideo {
  narrative: {
    intro: string; // "Sam needs to understand ocean currents..."
    outro: string; // "Now Sam can track turtle migrations!"
  };
  video: {
    embedUrl: string;
    thumbnailUrl: string;
    duration: number;
    transcript?: string;
  };
  followUp: {
    discussion: string;
    application: string;
  };
}

// Cache types
export interface CachedContent {
  key: string;
  content: any;
  timestamp: Date;
  expiresAt: Date;
  source: 'youtube' | 'generated' | 'static';
  accessCount: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  forceRefresh?: boolean;
  preload?: boolean;
}