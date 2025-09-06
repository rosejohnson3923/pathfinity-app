-- Check the current state of the generation queue

-- 1. See how many items are in each status
SELECT 
    status, 
    subject,
    COUNT(*) as count,
    MIN(created_at) as oldest,
    MAX(created_at) as newest
FROM generation_queue
GROUP BY status, subject
ORDER BY status, subject;

-- 2. Check if there are stuck 'processing' items
SELECT 
    queue_id,
    student_id,
    subject,
    status,
    created_at,
    processed_at,
    retry_count
FROM generation_queue
WHERE status = 'processing'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Reset stuck items back to pending
UPDATE generation_queue
SET 
    status = 'pending',
    worker_id = NULL,
    processed_at = NULL
WHERE status = 'processing'
    AND processed_at < NOW() - INTERVAL '5 minutes';

-- 4. Check worker status
SELECT * FROM generation_workers;

-- 5. Clear duplicate pending items for Algebra 1 (keep only one of each type)
WITH duplicates AS (
    SELECT 
        queue_id,
        ROW_NUMBER() OVER (
            PARTITION BY student_id, grade_level, subject, skill_id, container_type, question_type
            ORDER BY created_at DESC
        ) as rn
    FROM generation_queue
    WHERE status = 'pending'
        AND subject = 'Algebra 1'
)
DELETE FROM generation_queue
WHERE queue_id IN (
    SELECT queue_id 
    FROM duplicates 
    WHERE rn > 1
);

-- 6. Show remaining pending items
SELECT 
    subject,
    COUNT(*) as pending_count
FROM generation_queue
WHERE status = 'pending'
GROUP BY subject;