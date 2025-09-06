// ================================================================
// SERVICE UTILITIES
// Error handling, caching, and utility functions for services
// ================================================================

import type {
  ServiceResponse,
  ServiceError,
  CacheConfig,
  CacheEntry,
  CacheStats,
  BatchOperationResult,
  ValidationSchema
} from '../types/services';

// ================================================================
// ADVANCED CACHE MANAGER
// ================================================================

export class AdvancedCacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    total_operations: 0
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      enabled: true,
      ttl_seconds: 300, // 5 minutes default
      max_entries: 1000,
      key_prefix: 'pathfinity_cache',
      ...config
    };
  }

  /**
   * Set a cache entry
   */
  set<T>(key: string, data: T, customTtl?: number): void {
    if (!this.config.enabled) return;

    const fullKey = `${this.config.key_prefix}_${key}`;
    const ttl = (customTtl || this.config.ttl_seconds) * 1000; // Convert to milliseconds
    
    // Check if we need to evict entries
    if (this.cache.size >= this.config.max_entries) {
      this.evictOldest();
    }

    this.cache.set(fullKey, {
      data,
      timestamp: Date.now(),
      ttl,
      access_count: 0
    });

    this.stats.total_operations++;
  }

  /**
   * Get a cache entry
   */
  get<T>(key: string): T | null {
    if (!this.config.enabled) return null;

    const fullKey = `${this.config.key_prefix}_${key}`;
    const entry = this.cache.get(fullKey);
    
    this.stats.total_operations++;

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(fullKey);
      this.stats.misses++;
      return null;
    }

    // Update access count and timestamp for LRU
    entry.access_count++;
    entry.timestamp = Date.now();
    
    this.stats.hits++;
    return entry.data as T;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    const fullKey = `${this.config.key_prefix}_${key}`;
    return this.cache.delete(fullKey);
  }

  /**
   * Clear entries matching a pattern
   */
  invalidate(pattern: string): number {
    const regex = new RegExp(pattern);
    let deleted = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Evict oldest entries
   */
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by access count (LRU) and timestamp
    entries.sort(([, a], [, b]) => {
      if (a.access_count !== b.access_count) {
        return a.access_count - b.access_count;
      }
      return a.timestamp - b.timestamp;
    });

    // Remove oldest 10% of entries
    const toRemove = Math.max(1, Math.floor(entries.length * 0.1));
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
      this.stats.evictions++;
    }
  }

  /**
   * Clean expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const hitRate = this.stats.total_operations > 0 
      ? this.stats.hits / this.stats.total_operations 
      : 0;

    return {
      total_entries: this.cache.size,
      hit_rate: hitRate,
      miss_rate: 1 - hitRate,
      evictions: this.stats.evictions,
      memory_usage_bytes: this.estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    let estimate = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      estimate += key.length * 2; // String size estimation
      estimate += JSON.stringify(entry.data).length * 2; // Data size estimation
      estimate += 64; // Metadata overhead
    }

    return estimate;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0, total_operations: 0 };
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // If cache is disabled, clear it
    if (!this.config.enabled) {
      this.clear();
    }
  }
}

// ================================================================
// ERROR HANDLING UTILITIES
// ================================================================

export class ServiceErrorHandler {
  private static errorCodes = new Map<string, string[]>();

  /**
   * Register error suggestions for specific codes
   */
  static registerErrorSuggestions(code: string, suggestions: string[]): void {
    this.errorCodes.set(code, suggestions);
  }

  /**
   * Create a standardized service error
   */
  static createError(
    code: string,
    message: string,
    details?: any,
    customSuggestions?: string[]
  ): ServiceError {
    return {
      code,
      message,
      details: details || {},
      suggestions: customSuggestions || this.errorCodes.get(code) || [
        'Check the error details for more information',
        'Verify your inputs and try again',
        'Contact support if the problem persists'
      ]
    };
  }

  /**
   * Create a service response with error
   */
  static createErrorResponse<T>(
    error: ServiceError,
    startTime: number
  ): ServiceResponse<T> {
    return {
      success: false,
      error,
      metadata: {
        query_time_ms: Date.now() - startTime,
        cache_hit: false
      }
    };
  }

  /**
   * Create a successful service response
   */
  static createSuccessResponse<T>(
    data: T,
    startTime: number,
    metadata?: any
  ): ServiceResponse<T> {
    return {
      success: true,
      data,
      metadata: {
        query_time_ms: Date.now() - startTime,
        cache_hit: false,
        ...metadata
      }
    };
  }

  /**
   * Wrap async operations with error handling
   */
  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    errorCode: string,
    errorMessage: string
  ): Promise<ServiceResponse<T>> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      return this.createSuccessResponse(result, startTime);
    } catch (error) {
      const serviceError = this.createError(
        errorCode,
        errorMessage,
        error instanceof Error ? error.message : error
      );
      return this.createErrorResponse(serviceError, startTime);
    }
  }

  /**
   * Handle Supabase errors
   */
  static handleSupabaseError<T>(error: any, startTime: number): ServiceResponse<T> {
    const serviceError = this.createError(
      'DATABASE_ERROR',
      'Database operation failed',
      {
        supabaseError: error,
        code: error?.code,
        message: error?.message,
        details: error?.details
      }
    );
    return this.createErrorResponse(serviceError, startTime);
  }

  /**
   * Handle unknown errors
   */
  static handleUnknownError<T>(error: any, startTime: number): ServiceResponse<T> {
    const serviceError = this.createError(
      'UNKNOWN_ERROR',
      'An unexpected error occurred',
      {
        originalError: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      }
    );
    return this.createErrorResponse(serviceError, startTime);
  }
}

// ================================================================
// VALIDATION UTILITIES
// ================================================================

export class ValidationUtils {
  /**
   * Validate data against a schema
   */
  static validateData(data: any, schema: ValidationSchema): string[] {
    const errors: string[] = [];

    // Check required fields
    for (const field of schema.required_fields) {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        errors.push(`Required field '${field}' is missing`);
      }
    }

    // Check field types and constraints
    for (const [field, value] of Object.entries(data)) {
      if (value === null || value === undefined) continue;

      const expectedType = schema.field_types[field];
      if (expectedType) {
        if (!this.validateFieldType(value, expectedType)) {
          errors.push(`Field '${field}' has invalid type. Expected: ${expectedType}`);
        }
      }

      const constraints = schema.constraints[field];
      if (constraints) {
        const constraintErrors = this.validateConstraints(field, value, constraints);
        errors.push(...constraintErrors);
      }
    }

    return errors;
  }

  /**
   * Validate field type
   */
  private static validateFieldType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && !Array.isArray(value);
      case 'Grade':
        return ['Pre-K', 'K'].includes(value);
      case 'Subject':
        return ['Math', 'ELA', 'Science', 'SocialStudies'].includes(value);
      case 'ProgressStatus':
        return ['not_started', 'in_progress', 'completed', 'mastered'].includes(value);
      default:
        return true; // Unknown type, assume valid
    }
  }

  /**
   * Validate field constraints
   */
  private static validateConstraints(field: string, value: any, constraints: any): string[] {
    const errors: string[] = [];

    if (typeof value === 'number') {
      if (constraints.min !== undefined && value < constraints.min) {
        errors.push(`Field '${field}' must be at least ${constraints.min}`);
      }
      if (constraints.max !== undefined && value > constraints.max) {
        errors.push(`Field '${field}' must be at most ${constraints.max}`);
      }
    }

    if (typeof value === 'string') {
      if (constraints.min_length !== undefined && value.length < constraints.min_length) {
        errors.push(`Field '${field}' must be at least ${constraints.min_length} characters`);
      }
      if (constraints.max_length !== undefined && value.length > constraints.max_length) {
        errors.push(`Field '${field}' must be at most ${constraints.max_length} characters`);
      }
      if (constraints.pattern && !new RegExp(constraints.pattern).test(value)) {
        errors.push(`Field '${field}' does not match required pattern`);
      }
    }

    if (Array.isArray(value)) {
      if (constraints.min_length !== undefined && value.length < constraints.min_length) {
        errors.push(`Field '${field}' must have at least ${constraints.min_length} items`);
      }
      if (constraints.max_length !== undefined && value.length > constraints.max_length) {
        errors.push(`Field '${field}' must have at most ${constraints.max_length} items`);
      }
    }

    return errors;
  }
}

// ================================================================
// BATCH OPERATION UTILITIES
// ================================================================

export class BatchOperationUtils {
  /**
   * Execute operations in batches
   */
  static async executeBatch<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    batchSize: number = 10,
    onProgress?: (current: number, total: number) => void
  ): Promise<BatchOperationResult<R>> {
    const startTime = Date.now();
    const successful: R[] = [];
    const failed: Array<{ item: T; error: ServiceError }> = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (item) => {
        try {
          const result = await operation(item);
          return { success: true, result, item };
        } catch (error) {
          return { 
            success: false, 
            error: ServiceErrorHandler.createError(
              'BATCH_OPERATION_ERROR',
              `Failed to process item: ${error instanceof Error ? error.message : 'Unknown error'}`,
              { item, originalError: error }
            ),
            item 
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      for (const result of batchResults) {
        if (result.success) {
          successful.push(result.result);
        } else {
          failed.push({ item: result.item, error: result.error });
        }
      }

      // Report progress
      if (onProgress) {
        onProgress(Math.min(i + batchSize, items.length), items.length);
      }
    }

    return {
      success: failed.length === 0,
      successful_operations: successful,
      failed_operations: failed,
      total_processed: items.length,
      processing_time_ms: Date.now() - startTime
    };
  }

  /**
   * Execute operations with retry logic
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError!;
  }
}

// ================================================================
// PERFORMANCE MONITORING
// ================================================================

export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();

  /**
   * Record a performance metric
   */
  static recordMetric(operation: string, durationMs: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const operationMetrics = this.metrics.get(operation)!;
    operationMetrics.push(durationMs);
    
    // Keep only last 100 measurements
    if (operationMetrics.length > 100) {
      operationMetrics.shift();
    }
  }

  /**
   * Get performance statistics for an operation
   */
  static getStats(operation: string): {
    avg: number;
    min: number;
    max: number;
    count: number;
    p95: number;
  } | null {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) return null;

    const sorted = [...metrics].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      avg: sum / count,
      min: sorted[0],
      max: sorted[count - 1],
      count,
      p95: sorted[Math.floor(count * 0.95)]
    };
  }

  /**
   * Wrapper to automatically measure function performance
   */
  static measure<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    return fn().finally(() => {
      this.recordMetric(operation, Date.now() - startTime);
    });
  }

  /**
   * Get all performance metrics
   */
  static getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const operation of this.metrics.keys()) {
      stats[operation] = this.getStats(operation);
    }
    
    return stats;
  }

  /**
   * Clear all metrics
   */
  static clear(): void {
    this.metrics.clear();
  }
}

// ================================================================
// RATE LIMITING
// ================================================================

export class RateLimiter {
  private requests = new Map<string, number[]>();
  
  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}

  /**
   * Check if request is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requestTimes = this.requests.get(key)!;
    
    // Remove old requests outside the window
    while (requestTimes.length > 0 && requestTimes[0] < windowStart) {
      requestTimes.shift();
    }
    
    // Check if under limit
    if (requestTimes.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    requestTimes.push(now);
    return true;
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      return this.maxRequests;
    }
    
    const requestTimes = this.requests.get(key)!;
    const validRequests = requestTimes.filter(time => time >= windowStart);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  /**
   * Clear rate limit data for a key
   */
  clear(key: string): void {
    this.requests.delete(key);
  }
}

// ================================================================
// EXPORTS
// ================================================================

// Create default instances
export const globalCache = new AdvancedCacheManager();
export const globalRateLimiter = new RateLimiter();

// Register common error suggestions
ServiceErrorHandler.registerErrorSuggestions('VALIDATION_ERROR', [
  'Check that all required fields are provided',
  'Verify field types and formats',
  'Review the validation requirements'
]);

ServiceErrorHandler.registerErrorSuggestions('DATABASE_ERROR', [
  'Check your database connection',
  'Verify the data exists and is accessible',
  'Try the operation again'
]);

ServiceErrorHandler.registerErrorSuggestions('PERMISSION_ERROR', [
  'Verify you have the required permissions',
  'Check your authentication status',
  'Contact an administrator if needed'
]);

ServiceErrorHandler.registerErrorSuggestions('RATE_LIMIT_ERROR', [
  'Wait before making more requests',
  'Consider reducing request frequency',
  'Contact support if you need higher limits'
]);

// Note: Classes are already exported with 'export class' declarations above