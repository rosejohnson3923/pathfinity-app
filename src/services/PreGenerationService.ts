import { createClient } from '@supabase/supabase-js';
import { AILearningJourneyService } from './AILearningJourneyService';
import { staticDataService } from './StaticDataService';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface QueueItem {
  queue_id: string;
  student_id: string;
  grade_level: string;
  subject: string;
  skill_id: string;
  container_type: string;
  question_type?: string;
  priority: number;
  metadata?: any;
}

export interface CacheEntry {
  cache_id: string;
  cache_key: string;
  content: any;
  hit_count: number;
  expires_at: string;
}

export interface PreloadStrategy {
  trigger_container: string;
  preload_container: string;
  preload_count: number;
  confidence_threshold: number;
}

export class PreGenerationService {
  private aiService: AILearningJourneyService;
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private readonly PROCESSING_INTERVAL = 5000; // 5 seconds
  private readonly CACHE_KEY_PREFIX = 'content_v1';
  private warmingInProgress = new Set<string>(); // Track warming operations

  constructor() {
    this.aiService = new AILearningJourneyService();
  }

  // Generate cache key for content
  private generateCacheKey(params: {
    student_id: string;
    grade_level: string;
    subject: string;
    skill_id: string;
    container_type: string;
    question_type?: string;
  }): string {
    const parts = [
      this.CACHE_KEY_PREFIX,
      params.student_id,
      params.grade_level,
      params.subject,
      params.skill_id,
      params.container_type,
      params.question_type || 'auto'
    ];
    return parts.join(':');
  }

  // Add item to generation queue
  async addToQueue(params: {
    student_id: string;
    grade_level: string;
    subject: string;
    skill_id: string;
    container_type: string;
    question_type?: string;
    priority?: number;
  }): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('add_to_generation_queue', {
        p_student_id: params.student_id,
        p_grade_level: params.grade_level,
        p_subject: params.subject,
        p_skill_id: params.skill_id,
        p_container_type: params.container_type,
        p_question_type: params.question_type || null,
        p_priority: params.priority || 50
      });

      if (error) {
        console.error('Error adding to queue:', error);
        return null;
      }

      console.log(`📋 Added to generation queue: ${data}`);
      return data;
    } catch (err) {
      console.error('Failed to add to queue:', err);
      return null;
    }
  }

  // Check cache for existing content
  async checkCache(params: {
    student_id: string;
    grade_level: string;
    subject: string;
    skill_id: string;
    container_type: string;
    question_type?: string;
  }): Promise<any | null> {
    const cacheKey = this.generateCacheKey(params);

    try {
      const { data, error } = await supabase.rpc('check_cache', {
        p_cache_key: cacheKey
      });

      if (error || !data || !data.length || !data[0].cache_hit) {
        return null;
      }

      console.log(`✅ Cache hit for: ${cacheKey}`);
      return data[0].content;
    } catch (err) {
      console.error('Cache check failed:', err);
      return null;
    }
  }

  // Store content in cache
  async storeInCache(params: {
    student_id: string;
    grade_level: string;
    subject: string;
    skill_id: string;
    container_type: string;
    question_type?: string;
    content: any;
    generation_time_ms: number;
    ai_model: string;
  }): Promise<boolean> {
    const cacheKey = this.generateCacheKey(params);

    try {
      const { error } = await supabase.from('content_cache_v2').insert({
        cache_key: cacheKey,
        student_id: params.student_id,
        grade_level: params.grade_level,
        subject: params.subject,
        skill_id: params.skill_id,
        container_type: params.container_type,
        question_type: params.question_type,
        content: params.content,
        generation_time_ms: params.generation_time_ms,
        ai_model: params.ai_model,
        content_hash: this.generateContentHash(params.content)
      });

      if (error) {
        console.error('Error storing in cache:', error);
        return false;
      }

      console.log(`💾 Stored in cache: ${cacheKey}`);
      return true;
    } catch (err) {
      console.error('Failed to store in cache:', err);
      return false;
    }
  }

  // Generate content hash for deduplication
  private generateContentHash(content: any): string {
    const str = JSON.stringify(content);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  // Process queue items (worker function)
  async processQueue(): Promise<void> {
    // Disabled: generation_workers table not available
    return;
    
    if (this.isProcessing) {
      console.log('⏳ Queue processing already in progress');
      return;
    }

    this.isProcessing = true;

    try {
      // Get worker ID (simplified - in production, use proper worker management)
      const { data: workers } = await supabase
        .from('generation_workers')
        .select('worker_id')
        .eq('worker_name', 'main_worker')
        .single();

      if (!workers) {
        console.error('No worker available');
        return;
      }

      const workerId = workers.worker_id;

      // Get next queue item
      const { data: queueItem, error } = await supabase.rpc('get_next_queue_item', {
        p_worker_id: workerId
      });

      if (error || !queueItem || queueItem.length === 0) {
        // No items in queue - this is expected when queue is empty
        return;
      }

      const item = queueItem[0];
      console.log(`🔄 Processing queue item: ${item.queue_id}`);

      const startTime = Date.now();

      try {
        // Get skill details
        const skills = await staticDataService.getSkills(item.grade_level, item.subject);
        const skill = skills.find(s => s.skill_id === item.skill_id);

        if (!skill) {
          throw new Error(`Skill not found: ${item.skill_id}`);
        }

        // Generate content
        const content = await this.aiService.generateLearnContent(
          { 
            id: item.student_id, 
            display_name: `Student ${item.student_id}`,
            grade_level: item.grade_level 
          },
          {
            skill_number: skill.skill_number,
            skill_name: skill.skill_description,
            subject: item.subject,
            grade_level: item.grade_level
          },
          item.question_type
        );

        const generationTime = Date.now() - startTime;

        // Store in cache
        await this.storeInCache({
          student_id: item.student_id,
          grade_level: item.grade_level,
          subject: item.subject,
          skill_id: item.skill_id,
          container_type: item.container_type,
          question_type: item.question_type,
          content,
          generation_time_ms: generationTime,
          ai_model: 'gpt-4o'
        });

        // Mark queue item as completed
        await supabase
          .from('generation_queue')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('queue_id', item.queue_id);

        // Log job completion
        await supabase.from('generation_jobs').insert({
          queue_id: item.queue_id,
          worker_id: workerId,
          status: 'success',
          processing_time_ms: generationTime,
          input_data: item,
          output_data: { cache_key: this.generateCacheKey(item) }
        });

        console.log(`✅ Completed queue item in ${generationTime}ms`);

      } catch (err) {
        console.error(`Failed to process queue item: ${err.message}`);

        // Check retry count
        const maxRetries = 3;
        const newRetryCount = (item.retry_count || 0) + 1;
        
        // Mark as failed or permanently failed based on retry count
        await supabase
          .from('generation_queue')
          .update({
            status: newRetryCount >= maxRetries ? 'permanently_failed' : 'failed',
            error_message: err.message,
            retry_count: newRetryCount
          })
          .eq('queue_id', item.queue_id);

        // Log job failure
        await supabase.from('generation_jobs').insert({
          queue_id: item.queue_id,
          worker_id: workerId,
          status: 'failure',
          processing_time_ms: Date.now() - startTime,
          error_details: err.message
        });
      }

    } finally {
      this.isProcessing = false;

      // Update worker status
      const { data: workers } = await supabase
        .from('generation_workers')
        .select('worker_id')
        .eq('worker_name', 'main_worker')
        .single();

      if (workers) {
        await supabase
          .from('generation_workers')
          .update({
            status: 'idle',
            last_heartbeat: new Date().toISOString()
          })
          .eq('worker_id', workers.worker_id);
      }
    }
  }

  // Start background processing
  startBackgroundProcessing(): void {
    if (this.processingInterval) {
      console.log('Background processing already running');
      return;
    }

    console.log('🚀 Starting background pre-generation processing');
    
    this.processingInterval = setInterval(() => {
      this.processQueue().catch(err => {
        console.error('Queue processing error:', err);
      });
    }, this.PROCESSING_INTERVAL);

    // Process immediately
    this.processQueue();
  }

  // Stop background processing
  stopBackgroundProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('🛑 Stopped background pre-generation processing');
    }
  }

  // Predictive pre-loading based on user navigation
  async predictivePreload(params: {
    student_id: string;
    current_container: string;
    current_skill: string;
    subject: string;
    grade_level: string;
  }): Promise<void> {
    try {
      // Get preload rules
      const { data: rules } = await supabase
        .from('preload_rules')
        .select('*')
        .eq('trigger_container', params.current_container)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (!rules || rules.length === 0) {
        return;
      }

      for (const rule of rules) {
        // Get next skills to preload
        const skills = await staticDataService.getSkills(params.grade_level, params.subject);
        const currentIndex = skills.findIndex(s => s.skill_id === params.current_skill);
        
        if (currentIndex === -1) continue;

        const nextSkills = skills.slice(currentIndex + 1, currentIndex + 1 + rule.preload_count);

        for (const skill of nextSkills) {
          // Add to queue with high priority
          await this.addToQueue({
            student_id: params.student_id,
            grade_level: params.grade_level,
            subject: params.subject,
            skill_id: skill.skill_id,
            container_type: rule.preload_container,
            priority: 80 // High priority for predictive loading
          });
        }

        console.log(`🔮 Predictively queued ${nextSkills.length} items for ${rule.preload_container}`);
      }

      // Track navigation pattern
      await supabase.from('navigation_patterns').insert({
        student_id: params.student_id,
        from_container: params.current_container,
        from_skill: params.current_skill,
        subject: params.subject
      }).on('conflict', '(student_id, from_container, from_skill)').do('update', {
        frequency: supabase.raw('navigation_patterns.frequency + 1'),
        last_occurrence: new Date().toISOString()
      });

    } catch (err) {
      console.error('Predictive preload failed:', err);
    }
  }

  // Cache warming on user login
  async warmCacheForStudent(student_id: string, grade_level: string): Promise<void> {
    const warmingKey = `${student_id}:${grade_level}`;
    
    // Check if already warming for this student
    if (this.warmingInProgress.has(warmingKey)) {
      console.log(`⏳ Cache warming already in progress for ${warmingKey}`);
      return;
    }
    
    try {
      this.warmingInProgress.add(warmingKey);
      console.log(`🔥 Warming cache for student ${student_id} (Grade ${grade_level})`);

      // Get warming configuration
      const { data: configs } = await supabase
        .from('cache_warming_config')
        .select('*')
        .eq('grade_level', grade_level)
        .eq('is_active', true);

      if (!configs || configs.length === 0) {
        return;
      }

      let totalQueued = 0;

      for (const config of configs) {
        // Get random skills for this subject
        const skills = await staticDataService.getSkills(grade_level, config.subject);
        const randomSkills = skills
          .sort(() => Math.random() - 0.5)
          .slice(0, config.skills_count);

        for (const skill of randomSkills) {
          // Skip if skill doesn't have a valid skill_id
          if (!skill || !skill.skill_id) {
            console.warn(`Skipping skill with null/undefined skill_id:`, skill);
            continue;
          }
          
          for (const questionType of (config.question_types || [])) {
            await this.addToQueue({
              student_id,
              grade_level,
              subject: config.subject,
              skill_id: skill.skill_id,
              container_type: config.container_type,
              question_type: questionType,
              priority: 30 // Lower priority for cache warming
            });
            totalQueued++;
          }
        }
      }

      console.log(`📦 Queued ${totalQueued} items for cache warming`);

      // Update last warmed timestamp
      await supabase
        .from('cache_warming_config')
        .update({ last_warmed_at: new Date().toISOString() })
        .eq('grade_level', grade_level);

    } catch (err) {
      console.error('Cache warming failed:', err);
    } finally {
      // Remove from tracking set after completion
      this.warmingInProgress.delete(warmingKey);
    }
  }

  // Get cache metrics
  async getCacheMetrics(): Promise<any> {
    try {
      const { data: metrics } = await supabase
        .from('cache_metrics')
        .select('*')
        .eq('metric_date', new Date().toISOString().split('T')[0])
        .single();

      if (!metrics) {
        return {
          hit_rate: 0,
          avg_hit_time_ms: 0,
          avg_miss_time_ms: 0,
          cache_size_mb: 0
        };
      }

      const hitRate = metrics.cache_hits / (metrics.total_requests || 1) * 100;

      return {
        hit_rate: hitRate.toFixed(2),
        avg_hit_time_ms: metrics.avg_hit_time_ms || 0,
        avg_miss_time_ms: metrics.avg_miss_time_ms || 0,
        cache_size_mb: metrics.cache_size_mb || 0,
        total_requests: metrics.total_requests || 0,
        cache_hits: metrics.cache_hits || 0,
        cache_misses: metrics.cache_misses || 0
      };
    } catch (err) {
      console.error('Failed to get cache metrics:', err);
      return null;
    }
  }

  // Evict old cache entries
  async evictOldCache(daysOld: number = 30): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('evict_old_cache', {
        p_days_old: daysOld
      });

      if (error) {
        console.error('Cache eviction error:', error);
        return 0;
      }

      console.log(`🗑️ Evicted ${data} old cache entries`);
      return data;
    } catch (err) {
      console.error('Failed to evict cache:', err);
      return 0;
    }
  }

  // Get queue status
  async getQueueStatus(): Promise<any> {
    try {
      const { data: queueStats } = await supabase
        .from('generation_queue')
        .select('status', { count: 'exact' })
        .group('status');

      const stats = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        total: 0
      };

      for (const stat of (queueStats || [])) {
        stats[stat.status] = stat.count;
        stats.total += stat.count;
      }

      return stats;
    } catch (err) {
      console.error('Failed to get queue status:', err);
      return null;
    }
  }
}

// Export singleton instance
export const preGenerationService = new PreGenerationService();