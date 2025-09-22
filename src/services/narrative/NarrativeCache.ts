/**
 * Narrative Cache System
 * Stores and retrieves generated narratives for massive cost savings
 * Key innovation: Generate once, reuse thousands of times
 * Part of the Narrative-First Architecture - Phase 2
 */

import {
  MasterNarrative,
  NarrativeGenerationParams,
  CachedNarrative
} from './NarrativeSchema';
import { masterNarrativeGenerator } from './MasterNarrativeGenerator';

interface CacheStats {
  totalNarratives: number;
  totalHits: number;
  hitRate: number;
  costSavings: number;
  popularNarratives: Array<{
    key: string;
    hits: number;
    career: string;
    skill: string;
  }>;
}

export class NarrativeCache {
  private cache: Map<string, CachedNarrative>;
  private readonly TTL_DAYS = 30; // Narratives valid for 30 days
  private readonly MAX_CACHE_SIZE = 10000; // Maximum narratives to store

  // Cost tracking for ROI demonstration
  private generationCost = 0.005; // $0.005 per generation (500 tokens @ GPT-4o-mini)
  private retrievalCost = 0.00001; // Essentially free
  private totalGenerations = 0;
  private totalRetrievals = 0;

  constructor() {
    this.cache = new Map();

    // In production, this would use Redis or similar
    // For now, using in-memory cache
    this.initializeCache();
  }

  /**
   * Get or generate a narrative
   * This is the main entry point - handles cache hits and misses
   */
  async getNarrative(params: NarrativeGenerationParams): Promise<MasterNarrative> {
    const cacheKey = this.generateCacheKey(params);

    // Check cache first
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      console.log(`Cache HIT for ${cacheKey}. Saved $${this.generationCost}`);
      this.totalRetrievals++;
      return cached;
    }

    // Cache miss - generate new narrative
    console.log(`Cache MISS for ${cacheKey}. Generating new narrative...`);
    const narrative = await this.generateAndCache(params);
    this.totalGenerations++;

    return narrative;
  }

  /**
   * Generate cache key from parameters
   */
  private generateCacheKey(params: NarrativeGenerationParams): string {
    const { career, grade, subject, skill } = params;
    // Normalize to ensure consistent keys
    return `${career}_${grade}_${subject}_${skill}`
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }

  /**
   * Retrieve from cache if valid
   */
  private getFromCache(key: string): MasterNarrative | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check expiration
    if (new Date() > cached.expiresAt) {
      console.log(`Narrative expired for ${key}`);
      this.cache.delete(key);
      return null;
    }

    // Update access metadata
    cached.hits++;
    cached.lastAccessed = new Date();
    cached.popularityScore = this.calculatePopularityScore(cached);

    return cached.narrative;
  }

  /**
   * Generate new narrative and cache it
   */
  private async generateAndCache(
    params: NarrativeGenerationParams
  ): Promise<MasterNarrative> {
    const narrative = await masterNarrativeGenerator.generate(params);
    const cacheKey = this.generateCacheKey(params);

    // Ensure cache size limit
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictLeastPopular();
    }

    // Cache the narrative
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.TTL_DAYS);

    const cachedNarrative: CachedNarrative = {
      narrative,
      cacheKey,
      hits: 0,
      lastAccessed: new Date(),
      expiresAt,
      popularityScore: 0
    };

    this.cache.set(cacheKey, cachedNarrative);

    return narrative;
  }

  /**
   * Calculate popularity score for cache prioritization
   */
  private calculatePopularityScore(cached: CachedNarrative): number {
    const daysSinceCreation =
      (Date.now() - cached.narrative.generatedAt.getTime()) / (1000 * 60 * 60 * 24);

    // Score based on: frequency of use, recency, and age
    const frequencyScore = cached.hits * 10;
    const recencyScore = 100 / (daysSinceCreation + 1);

    return frequencyScore + recencyScore;
  }

  /**
   * Evict least popular narrative when cache is full
   */
  private evictLeastPopular(): void {
    let leastPopular: { key: string; score: number } | null = null;

    for (const [key, cached] of this.cache.entries()) {
      const score = this.calculatePopularityScore(cached);

      if (!leastPopular || score < leastPopular.score) {
        leastPopular = { key, score };
      }
    }

    if (leastPopular) {
      console.log(`Evicting least popular narrative: ${leastPopular.key}`);
      this.cache.delete(leastPopular.key);
    }
  }

  /**
   * Pre-generate narratives for popular combinations
   */
  async pregeneratePopularPaths(): Promise<void> {
    const popularCombinations = [
      // Kindergarten essentials
      { career: 'Marine Biologist', grade: 'K', subject: 'Math', skill: 'Counting to 10' },
      { career: 'Doctor', grade: 'K', subject: 'Math', skill: 'Counting to 10' },
      { career: 'Astronaut', grade: 'K', subject: 'Math', skill: 'Counting to 10' },
      { career: 'Teacher', grade: 'K', subject: 'Math', skill: 'Counting to 10' },
      { career: 'Veterinarian', grade: 'K', subject: 'Math', skill: 'Counting to 10' },

      // Grade 1 popular paths
      { career: 'Marine Biologist', grade: '1', subject: 'Math', skill: 'Addition to 20' },
      { career: 'Engineer', grade: '1', subject: 'Math', skill: 'Addition to 20' },
      { career: 'Chef', grade: '1', subject: 'Math', skill: 'Addition to 20' },

      // Grade 2 foundations
      { career: 'Scientist', grade: '2', subject: 'Math', skill: 'Subtraction' },
      { career: 'Architect', grade: '2', subject: 'Math', skill: 'Shapes and Geometry' },
    ];

    console.log(`Pre-generating ${popularCombinations.length} popular narratives...`);

    for (const params of popularCombinations) {
      const key = this.generateCacheKey(params);

      // Skip if already cached
      if (this.cache.has(key)) {
        continue;
      }

      try {
        await this.getNarrative(params);
        console.log(`Pre-generated: ${params.career} - ${params.grade} - ${params.skill}`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to pre-generate ${key}:`, error);
      }
    }
  }

  /**
   * Initialize cache with any saved narratives
   */
  private initializeCache(): void {
    // In production, load from persistent storage
    // For now, start with empty cache
    console.log('Narrative cache initialized');

    // Pre-generate popular paths in background
    setTimeout(() => {
      this.pregeneratePopularPaths().catch(console.error);
    }, 1000);
  }

  /**
   * Get cache statistics for monitoring
   */
  getStats(): CacheStats {
    const popularNarratives = Array.from(this.cache.entries())
      .sort((a, b) => b[1].hits - a[1].hits)
      .slice(0, 10)
      .map(([key, cached]) => ({
        key,
        hits: cached.hits,
        career: cached.narrative.career.title,
        skill: cached.narrative.skill
      }));

    const totalHits = this.totalRetrievals;
    const totalAttempts = this.totalGenerations + this.totalRetrievals;
    const hitRate = totalAttempts > 0 ? (totalHits / totalAttempts) : 0;

    // Calculate cost savings
    const generationsCost = this.totalGenerations * this.generationCost;
    const retrievalsCost = this.totalRetrievals * this.retrievalCost;
    const withoutCacheCost = totalAttempts * this.generationCost;
    const costSavings = withoutCacheCost - (generationsCost + retrievalsCost);

    return {
      totalNarratives: this.cache.size,
      totalHits,
      hitRate: Math.round(hitRate * 100) / 100,
      costSavings: Math.round(costSavings * 100) / 100,
      popularNarratives
    };
  }

  /**
   * Clear expired narratives
   */
  cleanupExpired(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired narratives`);
    }
  }

  /**
   * Warm up cache for specific grade/career combination
   */
  async warmupForClassroom(grade: string, careers: string[]): Promise<void> {
    const subjects = ['Math', 'Reading', 'Science'];
    const commonSkills: { [key: string]: string[] } = {
      'K': ['Counting to 10', 'Letter Recognition', 'Colors and Shapes'],
      '1': ['Addition to 20', 'Sight Words', 'Living Things'],
      '2': ['Subtraction', 'Reading Comprehension', 'Weather'],
      '3': ['Multiplication', 'Main Idea', 'Solar System'],
      '4': ['Division', 'Context Clues', 'Ecosystems'],
      '5': ['Fractions', 'Text Structure', 'Matter']
    };

    const skills = commonSkills[grade] || commonSkills['3'];

    for (const career of careers) {
      for (const subject of subjects) {
        for (const skill of skills) {
          const params: NarrativeGenerationParams = {
            career,
            grade,
            subject,
            skill
          };

          await this.getNarrative(params);
        }
      }
    }
  }
}

// Export singleton instance
export const narrativeCache = new NarrativeCache();