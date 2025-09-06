-- Check the current state of the generation queue

-- 1. First, let's see what columns actually exist in the table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'generation_queue'
ORDER BY ordinal_position;

-- 2. See how many items are in each status
SELECT 
    status, 
    subject,
    COUNT(*) as count,
    MIN(created_at) as oldest,
    MAX(created_at) as newest
FROM generation_queue
GROUP BY status, subject
ORDER BY status, subject;

-- 3. Check all items regardless of status
SELECT 
    queue_id,
    student_id,
    subject,
    status,
    created_at,
    retry_count
FROM generation_queue
ORDER BY created_at DESC
LIMIT 20;

-- 4. Check worker status
SELECT * FROM generation_workers;

-- 5. Reset ALL items to pending (since we don't have processed_at column)
UPDATE generation_queue
SET 
    status = 'pending',
    worker_id = NULL
WHERE status = 'processing';

-- 6. Clear duplicate pending items for Algebra 1 (keep only one of each type)
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

-- 7. Show what's left in the queue
SELECT 
    subject,
    status,
    COUNT(*) as count
FROM generation_queue
GROUP BY subject, status
ORDER BY subject, status;

-- 8. Show a sample of pending items
SELECT 
    queue_id,
    subject,
    skill_id,
    question_type,
    status
FROM generation_queue
WHERE status = 'pending'
LIMIT 10;