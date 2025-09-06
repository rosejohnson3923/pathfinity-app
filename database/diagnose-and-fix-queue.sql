-- Diagnose and fix remaining queue issues

-- Step 1: Show what errors we're dealing with
SELECT 
    'Error Analysis' as report,
    status,
    error_message,
    COUNT(*) as count
FROM generation_queue
WHERE status IN ('failed', 'processing')
GROUP BY status, error_message
ORDER BY count DESC;

-- Step 2: Check how long processing items have been stuck
SELECT 
    'Stuck Processing Items' as report,
    queue_id,
    user_id,
    container_type,
    skill_number,
    created_at,
    updated_at,
    NOW() - COALESCE(updated_at, created_at) as stuck_duration
FROM generation_queue
WHERE status = 'processing'
ORDER BY stuck_duration DESC
LIMIT 10;

-- Step 3: Force reset ALL processing items (they're clearly stuck)
UPDATE generation_queue
SET 
    status = 'pending',
    retry_count = 0,
    error_message = NULL,
    updated_at = NOW()
WHERE status = 'processing';

-- Step 4: Check what's wrong with failed items
SELECT 
    'Failed Items Analysis' as report,
    q.skill_number,
    q.grade_level,
    q.subject,
    q.skill_id,
    q.error_message,
    CASE 
        WHEN s.skill_id IS NULL THEN 'Skill not in master'
        WHEN q.skill_id IS NULL THEN 'No skill_id'
        WHEN q.skill_id != s.skill_id::text THEN 'Mismatched skill_id'
        ELSE 'Other issue'
    END as issue_type,
    COUNT(*) as count
FROM generation_queue q
LEFT JOIN skills_master s 
    ON q.skill_number = s.skill_number 
    AND q.grade_level = s.grade_level 
    AND q.subject = s.subject
WHERE q.status = 'failed'
GROUP BY q.skill_number, q.grade_level, q.subject, q.skill_id, q.error_message, s.skill_id
ORDER BY count DESC
LIMIT 20;

-- Step 5: Fix all failed items that have matching skills
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
AND q.subject = s.subject
AND s.skill_id IS NOT NULL;

-- Step 6: For failed items without exact matches, try matching by skill_number only
UPDATE generation_queue q
SET 
    skill_id = s.skill_id::text,
    grade_level = s.grade_level,
    subject = s.subject,
    status = 'pending',
    error_message = NULL,
    retry_count = 0,
    updated_at = NOW()
FROM (
    SELECT DISTINCT ON (skill_number)
        skill_id,
        skill_number,
        grade_level,
        subject
    FROM skills_master
    ORDER BY skill_number, grade_level
) s
WHERE q.status = 'failed'
AND q.skill_number = s.skill_number
AND NOT EXISTS (
    SELECT 1 FROM skills_master sm
    WHERE sm.skill_number = q.skill_number
    AND sm.grade_level = q.grade_level
    AND sm.subject = q.subject
);

-- Step 7: Delete permanently failed items that can't be fixed
-- (no matching skill_number at all)
DELETE FROM generation_queue
WHERE status = 'failed'
AND skill_number NOT IN (
    SELECT DISTINCT skill_number 
    FROM skills_master 
    WHERE skill_number IS NOT NULL
);

-- Step 8: Update all items to fix the problematic skill_id
UPDATE generation_queue q
SET skill_id = s.skill_id::text
FROM skills_master s
WHERE q.skill_number = s.skill_number
AND q.grade_level = s.grade_level
AND q.subject = s.subject
AND (
    q.skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d'
    OR q.skill_id NOT IN (
        SELECT DISTINCT skill_id::text 
        FROM skills_master 
        WHERE skill_id IS NOT NULL
    )
);

-- Step 9: Final cleanup - any remaining failed items become pending for retry
UPDATE generation_queue
SET 
    status = 'pending',
    retry_count = LEAST(COALESCE(retry_count, 0) + 1, 3),
    updated_at = NOW()
WHERE status = 'failed'
AND retry_count < 3;

-- Step 10: Mark as permanently failed if retried too many times
UPDATE generation_queue
SET status = 'permanently_failed'
WHERE status = 'failed'
AND retry_count >= 3;

-- Step 11: Final status report
SELECT 
    'Final Status' as report,
    status,
    COUNT(*) as count,
    COUNT(DISTINCT user_id) as users,
    COUNT(DISTINCT skill_id) as unique_skills,
    COUNT(CASE WHEN skill_id IS NULL THEN 1 END) as null_skills,
    COUNT(CASE WHEN skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d' THEN 1 END) as bad_skills
FROM generation_queue
GROUP BY status
ORDER BY 
    CASE status 
        WHEN 'pending' THEN 1
        WHEN 'processing' THEN 2
        WHEN 'completed' THEN 3
        WHEN 'failed' THEN 4
        WHEN 'permanently_failed' THEN 5
        ELSE 6
    END;

-- Step 12: Verify all pending items are ready
SELECT 
    'Pending Items Check' as report,
    container_type,
    grade_level,
    subject,
    COUNT(*) as count,
    COUNT(CASE WHEN skill_id IS NULL THEN 1 END) as missing_skill_id,
    array_agg(DISTINCT skill_number ORDER BY skill_number LIMIT 3) as sample_skills
FROM generation_queue
WHERE status = 'pending'
GROUP BY container_type, grade_level, subject
HAVING COUNT(CASE WHEN skill_id IS NULL THEN 1 END) > 0
ORDER BY missing_skill_id DESC;

-- Step 13: If everything looks good, show sample ready items
SELECT 
    'Ready to Process' as status,
    queue_id,
    container_type,
    grade_level || ' ' || subject as grade_subject,
    skill_number,
    LEFT(skill_id, 8) || '...' as skill_id
FROM generation_queue
WHERE status = 'pending'
AND skill_id IS NOT NULL
ORDER BY priority, created_at
LIMIT 10;