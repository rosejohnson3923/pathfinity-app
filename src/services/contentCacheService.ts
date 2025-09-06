/**
 * Content Cache Service
 * Caches AI-generated content to reduce load times
 * Uses memory cache with TTL and localStorage fallback
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ContentCacheService {
  private static instance: ContentCacheService;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of entries
  private readonly STORAGE_KEY = 'pathfinity_content_cache';
  
  static getInstance(): ContentCacheService {
    if (!ContentCacheService.instance) {
      ContentCacheService.instance = new ContentCacheService();
      ContentCacheService.instance.loadFromStorage();
    }
    return ContentCacheService.instance;
  }
  
  /**
   * Generate a cache key from parameters
   */
  private generateKey(params: {
    type: 'learn' | 'experience' | 'discover';
    skillId: string;
    studentId: string;
    phase?: string;
    careerId?: string;
  }): string {
    return `${params.type}_${params.skillId}_${params.studentId}_${params.phase || 'all'}_${params.careerId || 'default'}`;
  }
  
  /**
   * Set content in cache
   */
  set<T>(
    params: {
      type: 'learn' | 'experience' | 'discover';
      skillId: string;
      studentId: string;
      phase?: string;
      careerId?: string;
    },
    data: T,
    ttl: number = this.DEFAULT_TTL
  ): void {
    const key = this.generateKey(params);
    
    // Check cache size and evict oldest if needed
    if (this.memoryCache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    this.memoryCache.set(key, entry);
    this.saveToStorage();
    
    console.log(`📦 Cached content for ${key}`);
  }
  
  /**
   * Get content from cache
   */
  get<T>(params: {
    type: 'learn' | 'experience' | 'discover';
    skillId: string;
    studentId: string;
    phase?: string;
    careerId?: string;
  }): T | null {
    const key = this.generateKey(params);
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      console.log(`📦 Cache miss for ${key}`);
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      console.log(`📦 Cache expired for ${key}`);
      this.memoryCache.delete(key);
      this.saveToStorage();
      return null;
    }
    
    console.log(`📦 Cache hit for ${key} (age: ${Math.round((Date.now() - entry.timestamp) / 1000)}s)`);
    return entry.data as T;
  }
  
  /**
   * Check if cache has valid entry
   */
  has(params: {
    type: 'learn' | 'experience' | 'discover';
    skillId: string;
    studentId: string;
    phase?: string;
    careerId?: string;
  }): boolean {
    return this.get(params) !== null;
  }
  
  /**
   * Clear specific cache entry
   */
  clear(params: {
    type: 'learn' | 'experience' | 'discover';
    skillId: string;
    studentId: string;
    phase?: string;
    careerId?: string;
  }): void {
    const key = this.generateKey(params);
    this.memoryCache.delete(key);
    this.saveToStorage();
    console.log(`📦 Cleared cache for ${key}`);
  }
  
  /**
   * Clear all cache entries for a student
   */
  clearStudent(studentId: string): void {
    const keysToDelete: string[] = [];
    
    this.memoryCache.forEach((_, key) => {
      if (key.includes(studentId)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.memoryCache.delete(key));
    this.saveToStorage();
    console.log(`📦 Cleared ${keysToDelete.length} cache entries for student ${studentId}`);
  }
  
  /**
   * Clear all cache
   */
  clearAll(): void {
    this.memoryCache.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('📦 Cleared all cache');
  }
  
  /**
   * Evict oldest cache entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    this.memoryCache.forEach((entry, key) => {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    });
    
    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
      console.log(`📦 Evicted oldest cache entry: ${oldestKey}`);
    }
  }
  
  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const cacheData: Record<string, CacheEntry<any>> = {};
      
      // Only save recent entries to localStorage
      this.memoryCache.forEach((entry, key) => {
        // Only save entries less than 10 minutes old
        if (Date.now() - entry.timestamp < 10 * 60 * 1000) {
          cacheData[key] = entry;
        }
      });
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('📦 Failed to save cache to localStorage:', error);
    }
  }
  
  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;
      
      const cacheData = JSON.parse(stored);
      let loaded = 0;
      
      Object.entries(cacheData).forEach(([key, entry]) => {
        const cacheEntry = entry as CacheEntry<any>;
        
        // Only load entries that haven't expired
        if (Date.now() - cacheEntry.timestamp < cacheEntry.ttl) {
          this.memoryCache.set(key, cacheEntry);
          loaded++;
        }
      });
      
      console.log(`📦 Loaded ${loaded} cache entries from storage`);
    } catch (error) {
      console.warn('📦 Failed to load cache from localStorage:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats(): {
    entries: number;
    totalSize: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    let oldestTime = Date.now();
    let newestTime = 0;
    let totalSize = 0;
    
    this.memoryCache.forEach(entry => {
      if (entry.timestamp < oldestTime) oldestTime = entry.timestamp;
      if (entry.timestamp > newestTime) newestTime = entry.timestamp;
      
      // Rough estimate of size
      totalSize += JSON.stringify(entry.data).length;
    });
    
    return {
      entries: this.memoryCache.size,
      totalSize,
      oldestEntry: oldestTime,
      newestEntry: newestTime
    };
  }
}

export const contentCacheService = ContentCacheService.getInstance();