-- Fix PreGeneration infinite loop issues (using existing status values)

-- 1. First, let's see what status values are allowed
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'generation_queue'::regclass 
AND contype = 'c';

-- 2. Update get_next_queue_item to exclude high retry count items
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
        AND (q.retry_count IS NULL OR q.retry_count < 3)  -- Max 3 retries
        AND q.skill_id IS NOT NULL  -- Must have valid skill_id
        AND q.skill_id != 'null'    -- Not string 'null'
        ORDER BY q.priority DESC, q.created_at ASC
        LIMIT 1
        FOR UPDATE SKIP LOCKED  -- Prevent race conditions
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

-- 3. Mark items with null skill_id as failed with max retries (won't be picked up again)
UPDATE generation_queue 
SET status = 'failed',
    retry_count = 99,  -- High number to prevent retries
    error_message = 'Invalid skill_id: null - will not retry'
WHERE (skill_id IS NULL OR skill_id = 'null')
AND status != 'completed';

-- 4. Mark high retry items as failed but won't be retried
UPDATE generation_queue 
SET retry_count = 99,  -- High number to prevent retries
    error_message = COALESCE(error_message, '') || ' - Max retries exceeded'
WHERE status = 'failed' 
AND retry_count >= 3;

-- 5. Clean up old processing items that might be stuck
UPDATE generation_queue
SET status = 'failed', 
    retry_count = COALESCE(retry_count, 0) + 1,
    error_message = 'Processing timeout - stuck for more than 10 minutes'
WHERE status = 'processing'
AND started_at < NOW() - INTERVAL '10 minutes';

-- 6. Remove duplicate pending items (keep oldest)
DELETE FROM generation_queue a
USING generation_queue b
WHERE a.queue_id > b.queue_id  -- Delete newer duplicates
AND a.student_id = b.student_id
AND a.grade_level = b.grade_level
AND a.subject = b.subject
AND a.skill_id = b.skill_id
AND a.container_type IS NOT DISTINCT FROM b.container_type
AND a.question_type IS NOT DISTINCT FROM b.question_type
AND a.status = 'pending'
AND b.status = 'pending';

-- 7. Clean up orphaned generation_jobs
DELETE FROM generation_jobs
WHERE queue_id NOT IN (SELECT queue_id FROM generation_queue);

-- 8. Show current queue status
SELECT 
    status, 
    COUNT(*) as total,
    COUNT(CASE WHEN retry_count < 3 OR retry_count IS NULL THEN 1 END) as retriable,
    COUNT(CASE WHEN retry_count >= 3 THEN 1 END) as max_retries,
    COUNT(CASE WHEN skill_id IS NULL OR skill_id = 'null' THEN 1 END) as null_skills
FROM generation_queue 
GROUP BY status
ORDER BY status;

-- 9. Show items that won't be processed
SELECT 
    COUNT(*) as unprocessable_items,
    'These items have null skill_id or exceeded retry limit' as reason
FROM generation_queue
WHERE (skill_id IS NULL OR skill_id = 'null' OR retry_count >= 3)
AND status != 'completed';

-- 10. Clear the queue of unprocessable items (optional - uncomment to run)
-- DELETE FROM generation_queue
-- WHERE (skill_id IS NULL OR skill_id = 'null' OR retry_count >= 3)
-- AND status = 'failed';

-- 11. Show next items that will be processed
SELECT 
    queue_id,
    student_id,
    subject,
    skill_id,
    question_type,
    retry_count,
    priority
FROM generation_queue
WHERE status IN ('pending', 'failed')
AND (retry_count IS NULL OR retry_count < 3)
AND skill_id IS NOT NULL
AND skill_id != 'null'
ORDER BY priority DESC, created_at ASC
LIMIT 5;

-- 12. Summary
SELECT 
    'Queue Summary' as info,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'pending' AND (retry_count IS NULL OR retry_count < 3)) as pending_processable,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'processing') as currently_processing,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'failed' AND retry_count < 3) as failed_retriable,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'failed' AND retry_count >= 3) as failed_permanent,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'completed') as completed;