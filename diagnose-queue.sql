-- Diagnostic queries for generation_queue

-- 1. Show the actual table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'generation_queue'
ORDER BY ordinal_position;

-- 2. Show sample data from the queue (all columns)
SELECT * 
FROM generation_queue 
LIMIT 5;

-- 3. Count by status
SELECT 
    status, 
    COUNT(*) as count
FROM generation_queue
GROUP BY status;

-- 4. Count by subject
SELECT 
    subject,
    COUNT(*) as count
FROM generation_queue
GROUP BY subject
ORDER BY count DESC;

-- 5. Show if there are duplicates
SELECT 
    student_id,
    subject,
    skill_id,
    question_type,
    COUNT(*) as duplicate_count
FROM generation_queue
WHERE status = 'pending'
GROUP BY student_id, subject, skill_id, question_type
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 6. Reset any 'processing' items to 'pending' (simple version)
UPDATE generation_queue
SET status = 'pending'
WHERE status = 'processing';

-- 7. Delete ALL Algebra 1 items to stop the loop
DELETE FROM generation_queue
WHERE subject = 'Algebra 1';

-- 8. Show what's left
SELECT 
    subject,
    status,
    COUNT(*) as count
FROM generation_queue
GROUP BY subject, status
ORDER BY subject, status;