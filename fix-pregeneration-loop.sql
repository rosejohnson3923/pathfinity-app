-- Fix PreGeneration infinite loop issues

-- 1. Add permanently_failed status to the enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'permanently_failed' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'queue_status')
  ) THEN
    ALTER TYPE queue_status ADD VALUE 'permanently_failed';
  END IF;
END $$;

-- 2. Update get_next_queue_item to exclude permanently_failed items
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
        AND q.status != 'permanently_failed'      -- Exclude permanently failed
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

-- 3. Mark existing failed items with high retry counts as permanently failed
UPDATE generation_queue 
SET status = 'permanently_failed'
WHERE status = 'failed' 
AND retry_count >= 3;

-- 4. Clean up any items with null skill_id
DELETE FROM generation_queue 
WHERE skill_id IS NULL OR skill_id = 'null';

-- 5. Add unique constraint to prevent duplicate queue items
ALTER TABLE generation_queue 
DROP CONSTRAINT IF EXISTS unique_queue_item;

ALTER TABLE generation_queue 
ADD CONSTRAINT unique_queue_item 
UNIQUE (student_id, grade_level, subject, skill_id, container_type, question_type);

-- 6. Check current queue status
SELECT 
    status, 
    COUNT(*) as count,
    MAX(retry_count) as max_retries
FROM generation_queue 
GROUP BY status
ORDER BY status;

-- 7. Check for problematic items
SELECT queue_id, student_id, skill_id, status, retry_count, error_message
FROM generation_queue
WHERE status IN ('failed', 'processing')
ORDER BY retry_count DESC
LIMIT 10;