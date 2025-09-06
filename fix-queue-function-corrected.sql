-- Fix get_next_queue_item with proper column references

-- Drop the old version
DROP FUNCTION IF EXISTS get_next_queue_item(UUID);

-- Create a working version with unambiguous column references
CREATE OR REPLACE FUNCTION get_next_queue_item(p_worker_id UUID)
RETURNS TABLE (
    queue_id UUID,
    student_id VARCHAR,
    grade_level VARCHAR,
    subject VARCHAR,
    skill_id VARCHAR,
    container_type VARCHAR,
    question_type VARCHAR
) 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Use table alias to avoid ambiguity
    RETURN QUERY
    UPDATE generation_queue gq
    SET 
        status = 'processing',
        started_at = NOW()
    WHERE gq.queue_id = (
        SELECT q.queue_id
        FROM generation_queue q
        WHERE q.status = 'pending'
        ORDER BY q.priority DESC, q.created_at ASC
        LIMIT 1
    )
    RETURNING 
        gq.queue_id,
        gq.student_id,
        gq.grade_level,
        gq.subject,
        gq.skill_id,
        gq.container_type,
        gq.question_type;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_next_queue_item TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_queue_item TO anon;

-- Test it
SELECT * FROM get_next_queue_item('03ed8a52-ebf5-45ef-af7c-ae2d1514e9b2'::uuid);

-- Check if any items were marked as processing
SELECT queue_id, subject, question_type, status, started_at 
FROM generation_queue 
WHERE status = 'processing'
LIMIT 5;