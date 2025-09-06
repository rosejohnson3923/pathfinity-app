-- Fix PreGeneration Functions Only
-- This script only creates/replaces the missing functions

-- 1. Function to add items to generation queue
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

-- 2. Function to get next queue item for processing (THE MISSING ONE!)
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

-- 3. Function to check cache
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

-- 4. Function to store in cache
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

-- 5. Cleanup function for expired cache
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION add_to_generation_queue TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_queue_item TO authenticated;
GRANT EXECUTE ON FUNCTION check_cache TO authenticated;
GRANT EXECUTE ON FUNCTION store_in_cache TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_cache TO authenticated;

-- Test that the main function exists
SELECT 'Testing get_next_queue_item function...' as status;
SELECT proname, pronargs FROM pg_proc WHERE proname = 'get_next_queue_item';