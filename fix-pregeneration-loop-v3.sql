-- Fix PreGeneration infinite loop issues (handling foreign keys)

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

-- 2. Mark existing failed items with high retry counts as permanently failed
UPDATE generation_queue 
SET status = 'permanently_failed'
WHERE status = 'failed' 
AND retry_count >= 3;

-- 3. Clean up items with null skill_id (mark as permanently_failed instead of deleting)
UPDATE generation_queue 
SET status = 'permanently_failed',
    error_message = 'Invalid skill_id: null'
WHERE (skill_id IS NULL OR skill_id = 'null')
AND status != 'permanently_failed';

-- 4. Clean up old processing items that might be stuck
UPDATE generation_queue
SET status = 'failed', 
    retry_count = COALESCE(retry_count, 0) + 1,
    error_message = 'Processing timeout - stuck for more than 10 minutes'
WHERE status = 'processing'
AND started_at < NOW() - INTERVAL '10 minutes';

-- 5. Add unique constraint to prevent duplicate queue items (if not exists)
-- First, remove any existing duplicates by keeping only the oldest one
DELETE FROM generation_queue a
USING generation_queue b
WHERE a.queue_id > b.queue_id  -- Delete newer duplicates
AND a.student_id = b.student_id
AND a.grade_level = b.grade_level
AND a.subject = b.subject
AND a.skill_id = b.skill_id
AND a.container_type = b.container_type
AND COALESCE(a.question_type, '') = COALESCE(b.question_type, '')
AND a.status IN ('pending', 'failed');  -- Only remove pending/failed duplicates

-- Now add the constraint if it doesn't exist
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
EXCEPTION
    WHEN unique_violation THEN
        -- If constraint fails due to existing duplicates, just skip
        RAISE NOTICE 'Unique constraint not added due to existing duplicates';
END $$;

-- 6. Clean up orphaned generation_jobs (where queue item no longer exists)
DELETE FROM generation_jobs
WHERE queue_id NOT IN (SELECT queue_id FROM generation_queue);

-- 7. Show current queue status
SELECT 
    status, 
    COUNT(*) as count,
    MAX(retry_count) as max_retries,
    COUNT(CASE WHEN skill_id IS NULL OR skill_id = 'null' THEN 1 END) as null_skills
FROM generation_queue 
GROUP BY status
ORDER BY status;

-- 8. Show problematic items
SELECT 
    queue_id, 
    student_id, 
    subject,
    skill_id, 
    status, 
    retry_count, 
    LEFT(error_message, 50) as error_msg
FROM generation_queue
WHERE status IN ('failed', 'processing')
OR skill_id IS NULL 
OR skill_id = 'null'
ORDER BY retry_count DESC NULLS LAST
LIMIT 10;

-- 9. Show final summary
SELECT 
    'Queue Status Summary' as info,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'pending') as pending,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'processing') as processing,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'failed' AND retry_count < 3) as retriable_failed,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'completed') as completed,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'permanently_failed' OR (status = 'failed' AND retry_count >= 3)) as permanently_failed;

-- 10. Clean up cache warming config to prevent future null skill issues
UPDATE cache_warming_config
SET is_active = false
WHERE grade_level IS NULL 
OR subject IS NULL
OR skills_count <= 0;

-- Show active cache warming configs
SELECT grade_level, subject, skills_count, question_types, is_active
FROM cache_warming_config
WHERE is_active = true
ORDER BY grade_level, subject;