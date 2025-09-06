-- Migration 007: Pre-Generation System Tables and Functions
-- Creates the infrastructure for background content pre-generation

-- 1. Generation Workers Table
CREATE TABLE IF NOT EXISTS generation_workers (
    worker_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_name VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'idle' CHECK (status IN ('idle', 'processing', 'error', 'offline')),
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    current_queue_item UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default worker
INSERT INTO generation_workers (worker_name, status)
VALUES ('main_worker', 'idle')
ON CONFLICT (worker_name) DO NOTHING;

-- 2. Generation Queue Table
CREATE TABLE IF NOT EXISTS generation_queue (
    queue_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id VARCHAR(255) NOT NULL,
    grade_level VARCHAR(10) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    skill_id VARCHAR(255),
    container_type VARCHAR(50),
    question_type VARCHAR(50),
    priority INTEGER DEFAULT 50,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    worker_id UUID REFERENCES generation_workers(worker_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    retry_count INTEGER DEFAULT 0,
    error_details TEXT
);

-- Index for efficient queue processing
CREATE INDEX idx_generation_queue_status_priority ON generation_queue(status, priority DESC);
CREATE INDEX idx_generation_queue_student ON generation_queue(student_id, grade_level);

-- 3. Generation Cache Table
CREATE TABLE IF NOT EXISTS generation_cache (
    cache_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key VARCHAR(500) UNIQUE NOT NULL,
    student_id VARCHAR(255),
    grade_level VARCHAR(10),
    subject VARCHAR(100),
    skill_id VARCHAR(255),
    container_type VARCHAR(50),
    question_type VARCHAR(50),
    content JSONB NOT NULL,
    generation_time_ms INTEGER,
    hit_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cache lookups
CREATE INDEX idx_generation_cache_key ON generation_cache(cache_key);
CREATE INDEX idx_generation_cache_expires ON generation_cache(expires_at);

-- 4. Generation Jobs Log Table
CREATE TABLE IF NOT EXISTS generation_jobs (
    job_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    queue_id UUID REFERENCES generation_queue(queue_id),
    worker_id UUID REFERENCES generation_workers(worker_id),
    status VARCHAR(50) NOT NULL,
    processing_time_ms INTEGER,
    error_details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Cache Warming Configuration Table
CREATE TABLE IF NOT EXISTS cache_warming_config (
    config_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    grade_level VARCHAR(10) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    container_type VARCHAR(50) DEFAULT 'learn',
    question_types TEXT[], -- Array of question types to pre-generate
    skills_count INTEGER DEFAULT 5, -- Number of skills to warm per subject
    is_active BOOLEAN DEFAULT true,
    last_warmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(grade_level, subject, container_type)
);

-- Insert default cache warming configs for Grade 10
INSERT INTO cache_warming_config (grade_level, subject, question_types, skills_count)
VALUES 
    ('10', 'Math', ARRAY['multiple_choice', 'numeric', 'word_problem'], 5),
    ('10', 'Science', ARRAY['multiple_choice', 'true_false', 'fill_blank'], 5),
    ('10', 'ELA', ARRAY['multiple_choice', 'short_answer', 'essay'], 5),
    ('10', 'Social Studies', ARRAY['multiple_choice', 'true_false', 'matching'], 5)
ON CONFLICT DO NOTHING;

-- 6. Function to add items to generation queue
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS add_to_generation_queue(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INTEGER);

CREATE OR REPLACE FUNCTION add_to_generation_queue(
    p_student_id VARCHAR,
    p_grade_level VARCHAR,
    p_subject VARCHAR,
    p_skill_id VARCHAR DEFAULT NULL,
    p_container_type VARCHAR DEFAULT 'learn',
    p_question_type VARCHAR DEFAULT NULL,
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
        AND (skill_id = p_skill_id OR (skill_id IS NULL AND p_skill_id IS NULL))
        AND container_type = p_container_type
        AND (question_type = p_question_type OR (question_type IS NULL AND p_question_type IS NULL))
        AND status = 'pending';
    
    IF v_queue_id IS NOT NULL THEN
        -- Update priority if new one is higher
        UPDATE generation_queue 
        SET priority = GREATEST(priority, p_priority)
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

-- 7. Function to get next queue item for processing
-- Drop existing function if it exists with different signature
DROP FUNCTION IF EXISTS get_next_queue_item(UUID);

CREATE OR REPLACE FUNCTION get_next_queue_item(p_worker_id UUID)
RETURNS TABLE (
    queue_id UUID,
    student_id VARCHAR,
    grade_level VARCHAR,
    subject VARCHAR,
    skill_id VARCHAR,
    container_type VARCHAR,
    question_type VARCHAR
) AS $$
BEGIN
    -- Update worker status
    UPDATE generation_workers
    SET status = 'processing',
        last_heartbeat = NOW()
    WHERE worker_id = p_worker_id;
    
    -- Get and lock next item
    RETURN QUERY
    WITH next_item AS (
        SELECT q.queue_id
        FROM generation_queue q
        WHERE q.status = 'pending'
            AND q.retry_count < 3
        ORDER BY q.priority DESC, q.created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED
    )
    UPDATE generation_queue q
    SET status = 'processing',
        worker_id = p_worker_id,
        processed_at = NOW()
    FROM next_item
    WHERE q.queue_id = next_item.queue_id
    RETURNING 
        q.queue_id,
        q.student_id,
        q.grade_level,
        q.subject,
        q.skill_id,
        q.container_type,
        q.question_type;
END;
$$ LANGUAGE plpgsql;

-- 8. Function to check cache
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS check_cache(VARCHAR);

CREATE OR REPLACE FUNCTION check_cache(
    p_cache_key VARCHAR
) RETURNS JSONB AS $$
DECLARE
    v_content JSONB;
BEGIN
    -- Get cached content and update access info
    UPDATE generation_cache
    SET hit_count = hit_count + 1,
        last_accessed = NOW()
    WHERE cache_key = p_cache_key
        AND expires_at > NOW()
    RETURNING content INTO v_content;
    
    RETURN v_content;
END;
$$ LANGUAGE plpgsql;

-- 9. Function to store in cache
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS store_in_cache(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, JSONB, INTEGER);

CREATE OR REPLACE FUNCTION store_in_cache(
    p_cache_key VARCHAR,
    p_student_id VARCHAR,
    p_grade_level VARCHAR,
    p_subject VARCHAR,
    p_skill_id VARCHAR,
    p_container_type VARCHAR,
    p_question_type VARCHAR,
    p_content JSONB,
    p_generation_time_ms INTEGER DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO generation_cache (
        cache_key, student_id, grade_level, subject,
        skill_id, container_type, question_type,
        content, generation_time_ms
    ) VALUES (
        p_cache_key, p_student_id, p_grade_level, p_subject,
        p_skill_id, p_container_type, p_question_type,
        p_content, p_generation_time_ms
    )
    ON CONFLICT (cache_key) DO UPDATE
    SET content = EXCLUDED.content,
        generation_time_ms = EXCLUDED.generation_time_ms,
        last_accessed = NOW(),
        hit_count = generation_cache.hit_count + 1;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 10. Cleanup function for expired cache
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS cleanup_expired_cache();

CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM generation_cache
    WHERE expires_at < NOW()
    OR last_accessed < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust based on your user setup)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;