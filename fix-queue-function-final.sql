-- Fix get_next_queue_item to work with actual table structure

-- Drop the old version
DROP FUNCTION IF EXISTS get_next_queue_item(UUID);

-- Create a working version that matches the actual table columns
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
    -- Simple version - just get the next pending item
    -- Don't try to update worker_id since that column doesn't exist
    RETURN QUERY
    UPDATE generation_queue
    SET 
        status = 'processing',
        started_at = NOW()
    WHERE queue_id = (
        SELECT q.queue_id
        FROM generation_queue q
        WHERE q.status = 'pending'
        ORDER BY q.priority DESC, q.created_at ASC
        LIMIT 1
    )
    RETURNING 
        generation_queue.queue_id,
        generation_queue.student_id,
        generation_queue.grade_level,
        generation_queue.subject,
        generation_queue.skill_id,
        generation_queue.container_type,
        generation_queue.question_type;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_next_queue_item TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_queue_item TO anon;

-- Test it
SELECT * FROM get_next_queue_item('03ed8a52-ebf5-45ef-af7c-ae2d1514e9b2'::uuid);