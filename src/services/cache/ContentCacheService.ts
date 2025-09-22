/**
 * Content Cache Service
 * Manages caching for Master Narratives and Micro Content
 * Implements multi-layer caching: Memory → Session Storage → Database
 */

import { MasterNarrative } from '../narrative/MasterNarrativeGenerator';
import { LearnContainerContent } from '../micro-generators/LearnMicroGenerator';
import { ExperienceContainerContent } from '../micro-generators/ExperienceMicroGenerator';
import { DiscoverContainerContent } from '../micro-generators/DiscoverMicroGenerator';

type ContainerContent = LearnContainerContent | ExperienceContainerContent | DiscoverContainerContent;

interface CacheKey {
  student_id: string;
  grade_level: string;
  selected_character: string;  // companion
  career_id: string;
  subject: string;
  skill_id?: string;
  container_type?: 'learn' | 'experience' | 'discover';
}

interface CachedMasterNarrative {
  key: string;
  narrative: MasterNarrative;
  created_at: string;
  expires_at: string;
  hit_count: number;
}

interface CachedMicroContent {
  key: string;
  master_narrative_key: string;
  content: ContainerContent;
  container_type: 'learn' | 'experience' | 'discover';
  created_at: string;
  expires_at: string;
}

export class ContentCacheService {
  // Memory cache (fastest, limited size)
  private memoryCache = new Map<string, CachedMasterNarrative | CachedMicroContent>();
  private readonly MEMORY_CACHE_SIZE = 100;
  private readonly MASTER_NARRATIVE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly MICRO_CONTENT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Generate cache key for Master Narrative
   */
  private getMasterNarrativeKey(params: Omit<CacheKey, 'skill_id' | 'container_type'>): string {
    return `mn_${params.student_id}_${params.grade_level}_${params.selected_character}_${params.career_id}_${params.subject}`;
  }

  /**
   * Generate cache key for Micro Content
   */
  private getMicroContentKey(params: CacheKey): string {
    return `mc_${params.student_id}_${params.grade_level}_${params.skill_id}_${params.container_type}`;
  }

  /**
   * Get Master Narrative from cache
   */
  async getMasterNarrative(params: Omit<CacheKey, 'skill_id' | 'container_type'>): Promise<MasterNarrative | null> {
    const key = this.getMasterNarrativeKey(params);

    // 1. Check memory cache
    const memoryHit = this.memoryCache.get(key) as CachedMasterNarrative;
    if (memoryHit && new Date(memoryHit.expires_at) > new Date()) {
      console.log(`✅ Master Narrative cache hit (memory): ${key}`);
      memoryHit.hit_count++;
      return memoryHit.narrative;
    }

    // 2. Check session storage
    if (typeof window !== 'undefined') {
      const sessionData = sessionStorage.getItem(key);
      if (sessionData) {
        const cached: CachedMasterNarrative = JSON.parse(sessionData);
        if (new Date(cached.expires_at) > new Date()) {
          console.log(`✅ Master Narrative cache hit (session): ${key}`);

          // Promote to memory cache
          this.addToMemoryCache(key, cached);
          return cached.narrative;
        }
      }
    }

    // 3. Check database (would be implemented with your database)
    const dbNarrative = await this.fetchFromDatabase(key, 'master_narrative');
    if (dbNarrative) {
      console.log(`✅ Master Narrative cache hit (database): ${key}`);

      // Promote to memory and session cache
      const cached = dbNarrative as CachedMasterNarrative;
      this.addToMemoryCache(key, cached);
      this.addToSessionStorage(key, cached);
      return cached.narrative;
    }

    console.log(`❌ Master Narrative cache miss: ${key}`);
    return null;
  }

  /**
   * Cache Master Narrative
   */
  async cacheMasterNarrative(
    params: Omit<CacheKey, 'skill_id' | 'container_type'>,
    narrative: MasterNarrative
  ): Promise<void> {
    const key = this.getMasterNarrativeKey(params);
    const cached: CachedMasterNarrative = {
      key,
      narrative,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + this.MASTER_NARRATIVE_TTL).toISOString(),
      hit_count: 0
    };

    // Save to all cache layers
    this.addToMemoryCache(key, cached);
    this.addToSessionStorage(key, cached);
    await this.saveToDatabase(key, cached, 'master_narrative');

    console.log(`💾 Master Narrative cached: ${key}`);
    console.log(`   Size: ${JSON.stringify(narrative).length} bytes`);
    console.log(`   Expires: ${cached.expires_at}`);
  }

  /**
   * Get Micro Content from cache
   */
  async getMicroContent(params: CacheKey): Promise<ContainerContent | null> {
    if (!params.skill_id || !params.container_type) return null;

    const key = this.getMicroContentKey(params);

    // 1. Check memory cache
    const memoryHit = this.memoryCache.get(key) as CachedMicroContent;
    if (memoryHit && new Date(memoryHit.expires_at) > new Date()) {
      console.log(`✅ Micro Content cache hit (memory): ${key}`);
      return memoryHit.content;
    }

    // 2. Check session storage
    if (typeof window !== 'undefined') {
      const sessionData = sessionStorage.getItem(key);
      if (sessionData) {
        const cached: CachedMicroContent = JSON.parse(sessionData);
        if (new Date(cached.expires_at) > new Date()) {
          console.log(`✅ Micro Content cache hit (session): ${key}`);

          // Promote to memory cache
          this.addToMemoryCache(key, cached);
          return cached.content;
        }
      }
    }

    // 3. Check database
    const dbContent = await this.fetchFromDatabase(key, 'micro_content');
    if (dbContent) {
      console.log(`✅ Micro Content cache hit (database): ${key}`);

      const cached = dbContent as CachedMicroContent;
      this.addToMemoryCache(key, cached);
      this.addToSessionStorage(key, cached);
      return cached.content;
    }

    console.log(`❌ Micro Content cache miss: ${key}`);
    return null;
  }

  /**
   * Cache Micro Content
   */
  async cacheMicroContent(
    params: CacheKey,
    content: ContainerContent,
    masterNarrativeKey: string
  ): Promise<void> {
    if (!params.skill_id || !params.container_type) return;

    const key = this.getMicroContentKey(params);
    const cached: CachedMicroContent = {
      key,
      master_narrative_key: masterNarrativeKey,
      content,
      container_type: params.container_type,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + this.MICRO_CONTENT_TTL).toISOString()
    };

    // Save to all cache layers
    this.addToMemoryCache(key, cached);
    this.addToSessionStorage(key, cached);
    await this.saveToDatabase(key, cached, 'micro_content');

    console.log(`💾 Micro Content cached: ${key}`);
    console.log(`   Type: ${params.container_type}`);
    console.log(`   Size: ${JSON.stringify(content).length} bytes`);
  }

  /**
   * Add to memory cache with LRU eviction
   */
  private addToMemoryCache(key: string, value: any): void {
    // Evict oldest if cache is full
    if (this.memoryCache.size >= this.MEMORY_CACHE_SIZE) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
      console.log(`🗑️ Evicted from memory cache: ${firstKey}`);
    }

    this.memoryCache.set(key, value);
  }

  /**
   * Add to session storage
   */
  private addToSessionStorage(key: string, value: any): void {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Session storage might be full
      console.warn('Session storage full, clearing old entries');
      this.clearOldSessionStorage();
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (e2) {
        console.error('Failed to save to session storage:', e2);
      }
    }
  }

  /**
   * Clear old entries from session storage
   */
  private clearOldSessionStorage(): void {
    if (typeof window === 'undefined') return;

    const now = new Date();
    const keys = Object.keys(sessionStorage);

    for (const key of keys) {
      if (key.startsWith('mn_') || key.startsWith('mc_')) {
        try {
          const data = JSON.parse(sessionStorage.getItem(key) || '{}');
          if (data.expires_at && new Date(data.expires_at) < now) {
            sessionStorage.removeItem(key);
            console.log(`🗑️ Removed expired from session: ${key}`);
          }
        } catch (e) {
          // Invalid data, remove it
          sessionStorage.removeItem(key);
        }
      }
    }
  }

  /**
   * Database operations (placeholder - implement with your database)
   */
  private async fetchFromDatabase(key: string, type: 'master_narrative' | 'micro_content'): Promise<any> {
    // TODO: Implement database fetch
    // This would query your PostgreSQL/Supabase database
    console.log(`📊 Would fetch ${type} from database: ${key}`);
    return null;
  }

  private async saveToDatabase(key: string, value: any, type: 'master_narrative' | 'micro_content'): Promise<void> {
    // TODO: Implement database save
    // This would save to your PostgreSQL/Supabase database
    console.log(`📊 Would save ${type} to database: ${key}`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    memorySize: number;
    sessionSize: number;
    hitRates: { memory: number; session: number; database: number };
  } {
    const sessionSize = typeof window !== 'undefined'
      ? Object.keys(sessionStorage).filter(k => k.startsWith('mn_') || k.startsWith('mc_')).length
      : 0;

    return {
      memorySize: this.memoryCache.size,
      sessionSize,
      hitRates: {
        memory: 0,  // Would track actual hit rates
        session: 0,
        database: 0
      }
    };
  }

  /**
   * Clear all caches (for testing/debugging)
   */
  clearAllCaches(): void {
    this.memoryCache.clear();

    if (typeof window !== 'undefined') {
      const keys = Object.keys(sessionStorage);
      for (const key of keys) {
        if (key.startsWith('mn_') || key.startsWith('mc_')) {
          sessionStorage.removeItem(key);
        }
      }
    }

    console.log('🗑️ All caches cleared');
  }
}

// Singleton instance
export const contentCache = new ContentCacheService();