-- Migration: 005_pre_generation_system.sql
-- Purpose: Create pre-generation queue and cache management system
-- Date: 2025-08-26

-- ================================================================
-- GENERATION QUEUE MANAGEMENT
-- ================================================================

-- Queue for pending content generation tasks
CREATE TABLE IF NOT EXISTS generation_queue (
    queue_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(100) NOT NULL,
    grade_level VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    skill_id VARCHAR(100),
    container_type VARCHAR(50) NOT NULL,
    question_type VARCHAR(50),
    priority INTEGER DEFAULT 50,
    status VARCHAR(20) DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    scheduled_for TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    CONSTRAINT valid_priority CHECK (priority BETWEEN 1 AND 100)
);

-- Indexes for queue processing
CREATE INDEX IF NOT EXISTS idx_queue_status_priority ON generation_queue(status, priority DESC, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_queue_student ON generation_queue(student_id, status);
CREATE INDEX IF NOT EXISTS idx_queue_processing ON generation_queue(status, started_at) WHERE status = 'processing';

-- ================================================================
-- CONTENT CACHE MANAGEMENT
-- ================================================================

-- Enhanced content cache with expiration and hit tracking
CREATE TABLE IF NOT EXISTS content_cache_v2 (
    cache_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(500) UNIQUE NOT NULL,
    student_id VARCHAR(100),
    grade_level VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    skill_id VARCHAR(100),
    container_type VARCHAR(50) NOT NULL,
    question_type VARCHAR(50),
    content JSONB NOT NULL,
    content_hash VARCHAR(64),
    hit_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    is_valid BOOLEAN DEFAULT true,
    generation_time_ms INTEGER,
    ai_model VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for cache lookups
CREATE INDEX IF NOT EXISTS idx_cache_key ON content_cache_v2(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_student ON content_cache_v2(student_id, subject, grade_level);
CREATE INDEX IF NOT EXISTS idx_cache_skill ON content_cache_v2(skill_id, container_type);
CREATE INDEX IF NOT EXISTS idx_cache_expiry ON content_cache_v2(expires_at) WHERE is_valid = true;
CREATE INDEX IF NOT EXISTS idx_cache_hits ON content_cache_v2(hit_count DESC);

-- ================================================================
-- GENERATION WORKERS AND JOBS
-- ================================================================

-- Track background worker status
CREATE TABLE IF NOT EXISTS generation_workers (
    worker_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_name VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'idle',
    current_job_id UUID,
    last_heartbeat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_processed INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    avg_processing_time_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_worker_status CHECK (status IN ('idle', 'busy', 'offline', 'error'))
);

-- Job execution history
CREATE TABLE IF NOT EXISTS generation_jobs (
    job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_id UUID REFERENCES generation_queue(queue_id),
    worker_id UUID REFERENCES generation_workers(worker_id),
    status VARCHAR(20) NOT NULL,
    processing_time_ms INTEGER,
    input_data JSONB,
    output_data JSONB,
    error_details TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT valid_job_status CHECK (status IN ('success', 'failure', 'timeout', 'cancelled'))
);

-- ================================================================
-- PREDICTIVE PRE-LOADING
-- ================================================================

-- Track user navigation patterns for predictive loading
CREATE TABLE IF NOT EXISTS navigation_patterns (
    pattern_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(100) NOT NULL,
    from_container VARCHAR(50),
    to_container VARCHAR(50),
    from_skill VARCHAR(100),
    to_skill VARCHAR(100),
    subject VARCHAR(100),
    frequency INTEGER DEFAULT 1,
    avg_time_between_ms INTEGER,
    last_occurrence TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_nav_student ON navigation_patterns(student_id, subject);
CREATE INDEX IF NOT EXISTS idx_nav_pattern ON navigation_patterns(from_container, to_container, frequency DESC);

-- Predictive pre-loading rules
CREATE TABLE IF NOT EXISTS preload_rules (
    rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(200) NOT NULL,
    trigger_container VARCHAR(50),
    trigger_action VARCHAR(100),
    preload_container VARCHAR(50),
    preload_count INTEGER DEFAULT 3,
    confidence_threshold DECIMAL(3,2) DEFAULT 0.7,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 50,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- CACHE WARMING CONFIGURATION
-- ================================================================

-- Define cache warming strategies per grade/subject
CREATE TABLE IF NOT EXISTS cache_warming_config (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_level VARCHAR(20),
    subject VARCHAR(100),
    container_type VARCHAR(50),
    question_types TEXT[], -- Array of question types to pre-generate
    skills_count INTEGER DEFAULT 5, -- Number of skills to pre-cache
    warming_schedule VARCHAR(50) DEFAULT 'on_login', -- on_login, daily, weekly
    last_warmed_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- PERFORMANCE METRICS
-- ================================================================

-- Track cache performance metrics
CREATE TABLE IF NOT EXISTS cache_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE DEFAULT CURRENT_DATE,
    metric_hour INTEGER DEFAULT EXTRACT(HOUR FROM CURRENT_TIMESTAMP),
    total_requests INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    cache_misses INTEGER DEFAULT 0,
    avg_hit_time_ms INTEGER,
    avg_miss_time_ms INTEGER,
    cache_size_mb DECIMAL(10,2),
    evictions_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, metric_hour)
);

-- ================================================================
-- STORED PROCEDURES
-- ================================================================

-- Function to add item to generation queue
CREATE OR REPLACE FUNCTION add_to_generation_queue(
    p_student_id VARCHAR,
    p_grade_level VARCHAR,
    p_subject VARCHAR,
    p_skill_id VARCHAR,
    p_container_type VARCHAR,
    p_question_type VARCHAR,
    p_priority INTEGER DEFAULT 50
) RETURNS UUID AS $$
DECLARE
    v_queue_id UUID;
BEGIN
    -- Check if similar item already exists in pending state
    SELECT queue_id INTO v_queue_id
    FROM generation_queue
    WHERE student_id = p_student_id
        AND grade_level = p_grade_level
        AND subject = p_subject
        AND skill_id = p_skill_id
        AND container_type = p_container_type
        AND question_type = p_question_type
        AND status = 'pending';
    
    IF v_queue_id IS NOT NULL THEN
        -- Update priority if higher
        UPDATE generation_queue 
        SET priority = GREATEST(priority, p_priority),
            updated_at = CURRENT_TIMESTAMP
        WHERE queue_id = v_queue_id;
        RETURN v_queue_id;
    END IF;
    
    -- Insert new queue item
    INSERT INTO generation_queue (
        student_id, grade_level, subject, skill_id,
        container_type, question_type, priority
    ) VALUES (
        p_student_id, p_grade_level, p_subject, p_skill_id,
        p_container_type, p_question_type, p_priority
    ) RETURNING queue_id INTO v_queue_id;
    
    RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get next item from queue
CREATE OR REPLACE FUNCTION get_next_queue_item(
    p_worker_id UUID
) RETURNS TABLE (
    queue_id UUID,
    student_id VARCHAR,
    grade_level VARCHAR,
    subject VARCHAR,
    skill_id VARCHAR,
    container_type VARCHAR,
    question_type VARCHAR,
    metadata JSONB
) AS $$
BEGIN
    -- Update worker status
    UPDATE generation_workers 
    SET status = 'busy', 
        last_heartbeat = CURRENT_TIMESTAMP
    WHERE worker_id = p_worker_id;
    
    -- Get and lock next item
    RETURN QUERY
    UPDATE generation_queue q
    SET status = 'processing',
        started_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE q.queue_id = (
        SELECT queue_id 
        FROM generation_queue
        WHERE status = 'pending'
            AND scheduled_for <= CURRENT_TIMESTAMP
        ORDER BY priority DESC, scheduled_for ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    RETURNING 
        q.queue_id, q.student_id, q.grade_level, 
        q.subject, q.skill_id, q.container_type, 
        q.question_type, q.metadata;
END;
$$ LANGUAGE plpgsql;

-- Function to check cache
CREATE OR REPLACE FUNCTION check_cache(
    p_cache_key VARCHAR
) RETURNS TABLE (
    cache_hit BOOLEAN,
    content JSONB,
    cache_id UUID
) AS $$
DECLARE
    v_cache_id UUID;
    v_content JSONB;
BEGIN
    -- Look for valid cache entry
    SELECT c.cache_id, c.content 
    INTO v_cache_id, v_content
    FROM content_cache_v2 c
    WHERE c.cache_key = p_cache_key
        AND c.is_valid = true
        AND c.expires_at > CURRENT_TIMESTAMP;
    
    IF v_cache_id IS NOT NULL THEN
        -- Update hit count and last accessed
        UPDATE content_cache_v2
        SET hit_count = hit_count + 1,
            last_accessed = CURRENT_TIMESTAMP
        WHERE cache_id = v_cache_id;
        
        RETURN QUERY SELECT true, v_content, v_cache_id;
    ELSE
        RETURN QUERY SELECT false, NULL::JSONB, NULL::UUID;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate cache metrics
CREATE OR REPLACE FUNCTION update_cache_metrics() RETURNS void AS $$
DECLARE
    v_total_size_mb DECIMAL(10,2);
BEGIN
    -- Calculate cache size
    SELECT SUM(pg_column_size(content)) / 1024.0 / 1024.0
    INTO v_total_size_mb
    FROM content_cache_v2
    WHERE is_valid = true;
    
    -- Update or insert metrics
    INSERT INTO cache_metrics (
        metric_date,
        metric_hour,
        cache_size_mb
    ) VALUES (
        CURRENT_DATE,
        EXTRACT(HOUR FROM CURRENT_TIMESTAMP),
        v_total_size_mb
    )
    ON CONFLICT (metric_date, metric_hour) 
    DO UPDATE SET 
        cache_size_mb = EXCLUDED.cache_size_mb,
        created_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to evict old cache entries
CREATE OR REPLACE FUNCTION evict_old_cache(
    p_days_old INTEGER DEFAULT 30
) RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Mark expired entries as invalid
    UPDATE content_cache_v2
    SET is_valid = false
    WHERE expires_at < CURRENT_TIMESTAMP
        OR created_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * p_days_old;
    
    -- Delete very old invalid entries
    DELETE FROM content_cache_v2
    WHERE is_valid = false
        AND created_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * (p_days_old * 2);
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Update metrics
    UPDATE cache_metrics
    SET evictions_count = evictions_count + v_deleted_count
    WHERE metric_date = CURRENT_DATE
        AND metric_hour = EXTRACT(HOUR FROM CURRENT_TIMESTAMP);
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_queue_timestamp
    BEFORE UPDATE ON generation_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cache_timestamp
    BEFORE UPDATE ON content_cache_v2
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ================================================================
-- INITIAL DATA
-- ================================================================

-- Insert default cache warming configurations
INSERT INTO cache_warming_config (grade_level, subject, container_type, question_types, skills_count, warming_schedule)
VALUES 
    ('10', 'Math', 'learn', ARRAY['multiple_choice', 'true_false', 'numeric'], 5, 'on_login'),
    ('10', 'ELA', 'learn', ARRAY['multiple_choice', 'true_false', 'short_answer'], 5, 'on_login'),
    ('10', 'Science', 'learn', ARRAY['multiple_choice', 'true_false', 'fill_blank'], 5, 'on_login'),
    ('10', 'Social Studies', 'learn', ARRAY['multiple_choice', 'true_false', 'short_answer'], 5, 'on_login'),
    ('10', 'Algebra 1', 'learn', ARRAY['multiple_choice', 'numeric', 'true_false'], 5, 'on_login'),
    ('10', 'Pre-calculus', 'learn', ARRAY['multiple_choice', 'numeric', 'true_false'], 5, 'on_login')
ON CONFLICT DO NOTHING;

-- Insert default preload rules
INSERT INTO preload_rules (rule_name, trigger_container, trigger_action, preload_container, preload_count, confidence_threshold)
VALUES 
    ('Preload Experience during Learn', 'learn', 'complete', 'experience', 3, 0.8),
    ('Preload Discover during Experience', 'experience', 'complete', 'discover', 3, 0.7),
    ('Preload next Learn skill', 'learn', 'complete', 'learn', 1, 0.9),
    ('Preload assessments', 'experience', 'start', 'experience', 5, 0.6)
ON CONFLICT DO NOTHING;

-- Create initial worker
INSERT INTO generation_workers (worker_name, status)
VALUES ('main_worker', 'idle')
ON CONFLICT (worker_name) DO NOTHING;

-- ================================================================
-- PERMISSIONS (if needed for your setup)
-- ================================================================

-- Grant necessary permissions to application role
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO your_app_role;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_role;