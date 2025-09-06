-- Simple direct fix for generation_queue issues
-- This is a standalone script that doesn't depend on temp tables from other scripts

-- Step 1: Show current state
SELECT 
    'Current Queue State' as report,
    status,
    COUNT(*) as count,
    COUNT(DISTINCT error_message) as unique_errors
FROM generation_queue
GROUP BY status
ORDER BY status;

-- Step 2: Reset all stuck processing items to pending
UPDATE generation_queue
SET status = 'pending',
    updated_at = NOW()
WHERE status = 'processing';

-- Step 3: Fix failed items by matching with skills_master
UPDATE generation_queue q
SET 
    skill_id = s.skill_id::text,
    status = 'pending',
    error_message = NULL,
    retry_count = 0,
    updated_at = NOW()
FROM skills_master s
WHERE q.status = 'failed'
AND q.skill_number = s.skill_number
AND q.grade_level = s.grade_level
AND q.subject = s.subject;

-- Step 4: Delete any failed items that can't be matched
DELETE FROM generation_queue
WHERE status = 'failed'
AND skill_number NOT IN (
    SELECT skill_number FROM skills_master
);

-- Step 5: Update all pending items to ensure they have valid skill_ids
UPDATE generation_queue q
SET skill_id = s.skill_id::text
FROM skills_master s
WHERE q.skill_number = s.skill_number
AND q.grade_level = s.grade_level
AND q.subject = s.subject
AND (
    q.skill_id IS NULL 
    OR q.skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d'
    OR LENGTH(q.skill_id) < 36  -- Invalid UUID format
);

-- Step 6: Final state check
SELECT 
    'Final Queue State' as report,
    status,
    COUNT(*) as count,
    COUNT(CASE WHEN skill_id IS NULL THEN 1 END) as null_skill_ids,
    COUNT(CASE WHEN skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d' THEN 1 END) as bad_skill_ids
FROM generation_queue
GROUP BY status
ORDER BY status;

-- Step 7: Show sample of ready items
SELECT 
    queue_id,
    container_type,
    grade_level,
    subject,
    skill_number,
    LEFT(skill_id, 8) || '...' as skill_id,
    status
FROM generation_queue
WHERE status = 'pending'
LIMIT 10;