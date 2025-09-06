-- Fix PreGeneration infinite loop issues (without enum type)

-- 1. Update get_next_queue_item to exclude permanently_failed items and limit retries
DROP FUNCTION IF EXISTS get_next_queue_item(UUID);

CREATE OR REPLACE FUNCTION get_next_queue_item(p_worker_id UUID)
RETURNS TABLE (
    queue_id UUID,
    student_id VARCHAR,
    grade_level VARCHAR,
    subject VARCHAR,
    skill_id VARCHAR,
    container_type VARCHAR,
    question_type VARCHAR,
    retry_count INT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE generation_queue
    SET 
        status = 'processing',
        started_at = NOW()
    WHERE generation_queue.queue_id = (
        SELECT q.queue_id
        FROM generation_queue q
        WHERE q.status IN ('pending', 'failed')  -- Include failed for retry
        AND q.status != 'permanently_failed'      -- Exclude permanently failed (as string)
        AND (q.retry_count IS NULL OR q.retry_count < 3)  -- Max 3 retries
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
        generation_queue.question_type,
        generation_queue.retry_count;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_next_queue_item TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_queue_item TO anon;

-- 2. Mark existing failed items with high retry counts as permanently failed
UPDATE generation_queue 
SET status = 'permanently_failed'
WHERE status = 'failed' 
AND retry_count >= 3;

-- 3. Clean up any items with null skill_id
DELETE FROM generation_queue 
WHERE skill_id IS NULL OR skill_id = 'null';

-- 4. Add unique constraint to prevent duplicate queue items (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_queue_item'
    ) THEN
        ALTER TABLE generation_queue 
        ADD CONSTRAINT unique_queue_item 
        UNIQUE (student_id, grade_level, subject, skill_id, container_type, question_type);
    END IF;
END $$;

-- 5. Check current queue status
SELECT 
    status, 
    COUNT(*) as count,
    MAX(retry_count) as max_retries
FROM generation_queue 
GROUP BY status
ORDER BY status;

-- 6. Check for problematic items
SELECT queue_id, student_id, skill_id, status, retry_count, error_message
FROM generation_queue
WHERE status IN ('failed', 'processing')
ORDER BY retry_count DESC
LIMIT 10;

-- 7. Clean up old processing items that might be stuck
UPDATE generation_queue
SET status = 'failed', 
    retry_count = COALESCE(retry_count, 0) + 1
WHERE status = 'processing'
AND started_at < NOW() - INTERVAL '10 minutes';

-- 8. Show final summary
SELECT 
    'Queue Status Summary' as info,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'pending') as pending,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'processing') as processing,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'failed') as failed,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'completed') as completed,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'permanently_failed') as permanently_failed;