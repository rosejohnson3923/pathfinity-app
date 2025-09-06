-- Fix generation_queue based on actual table structure
-- Uses correct column names: student_id (not user_id), no skill_number column

-- Step 1: Current status
SELECT 
    'Current Status' as report,
    status,
    COUNT(*) as count,
    COUNT(DISTINCT student_id) as unique_students,
    COUNT(DISTINCT skill_id) as unique_skills
FROM generation_queue
GROUP BY status
ORDER BY status;

-- Step 2: Reset ALL stuck processing items (94 items)
UPDATE generation_queue
SET 
    status = 'pending',
    retry_count = COALESCE(retry_count, 0),
    error_message = NULL,
    started_at = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE status = 'processing';

-- Step 3: Show what errors the failed items have
SELECT 
    'Failed Items Errors' as report,
    error_message,
    COUNT(*) as count
FROM generation_queue
WHERE status = 'failed'
GROUP BY error_message
ORDER BY count DESC;

-- Step 4: Check which skill_ids are invalid
WITH valid_skills AS (
    SELECT DISTINCT skill_id::text as skill_id
    FROM skills_master
    WHERE skill_id IS NOT NULL
)
SELECT 
    'Invalid Skill IDs' as report,
    q.skill_id,
    COUNT(*) as count,
    array_agg(DISTINCT q.grade_level || '-' || q.subject) as grade_subjects
FROM generation_queue q
WHERE q.status = 'failed'
AND (
    q.skill_id IS NULL 
    OR q.skill_id NOT IN (SELECT skill_id FROM valid_skills)
    OR q.skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d'
)
GROUP BY q.skill_id
ORDER BY count DESC
LIMIT 10;

-- Step 5: Try to match failed items by grade/subject to find correct skill_id
-- Since we don't have skill_number, we'll assign first available skill for that grade/subject
UPDATE generation_queue q
SET 
    skill_id = s.skill_id::text,
    status = 'pending',
    error_message = NULL,
    retry_count = 0,
    updated_at = CURRENT_TIMESTAMP
FROM (
    -- Get first skill (A.1) for each grade/subject combination
    SELECT DISTINCT ON (grade_level, subject)
        skill_id,
        grade_level,
        subject,
        skill_number
    FROM skills_master
    WHERE skill_id IS NOT NULL
    ORDER BY grade_level, subject, skill_number
) s
WHERE q.status = 'failed'
AND q.grade_level = s.grade_level
AND q.subject = s.subject
AND (
    q.skill_id IS NULL 
    OR q.skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d'
    OR q.skill_id NOT IN (SELECT skill_id::text FROM skills_master WHERE skill_id IS NOT NULL)
);

-- Step 6: For any pending items with bad skill_ids, fix them too
UPDATE generation_queue q
SET skill_id = s.skill_id::text,
    updated_at = CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT ON (grade_level, subject)
        skill_id,
        grade_level,
        subject
    FROM skills_master
    WHERE skill_id IS NOT NULL
    ORDER BY grade_level, subject, skill_number
) s
WHERE q.status = 'pending'
AND q.grade_level = s.grade_level
AND q.subject = s.subject
AND (
    q.skill_id IS NULL 
    OR q.skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d'
    OR q.skill_id NOT IN (SELECT skill_id::text FROM skills_master WHERE skill_id IS NOT NULL)
);

-- Step 7: Any remaining failed items that can't be matched, delete them
DELETE FROM generation_queue
WHERE status = 'failed'
AND (grade_level, subject) NOT IN (
    SELECT DISTINCT grade_level, subject
    FROM skills_master
    WHERE skill_id IS NOT NULL
);

-- Step 8: Reset remaining failed items for retry (if they have valid grade/subject)
UPDATE generation_queue
SET 
    status = 'pending',
    retry_count = LEAST(COALESCE(retry_count, 0) + 1, max_retries),
    error_message = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE status = 'failed'
AND retry_count < max_retries;

-- Step 9: Mark as permanently failed if exceeded max retries
UPDATE generation_queue
SET status = 'permanently_failed'
WHERE status = 'failed'
AND retry_count >= max_retries;

-- Step 10: Final validation check
WITH skill_validation AS (
    SELECT 
        q.queue_id,
        q.status,
        q.skill_id as queue_skill_id,
        s.skill_id::text as master_skill_id,
        s.skill_number,
        CASE 
            WHEN s.skill_id IS NOT NULL THEN 'Valid'
            WHEN q.skill_id IS NULL THEN 'Missing'
            ELSE 'Invalid'
        END as validity
    FROM generation_queue q
    LEFT JOIN skills_master s ON q.skill_id = s.skill_id::text
    WHERE q.status IN ('pending', 'processing')
)
SELECT 
    'Validation Summary' as report,
    status,
    validity,
    COUNT(*) as count
FROM skill_validation
GROUP BY status, validity
ORDER BY status, validity;

-- Step 11: Final status summary
SELECT 
    'Final Summary' as report,
    status,
    COUNT(*) as total_items,
    COUNT(DISTINCT student_id) as unique_students,
    COUNT(DISTINCT grade_level || '-' || subject) as grade_subjects,
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

-- Step 12: Show sample of ready-to-process items
SELECT 
    'Ready Items Sample' as status,
    queue_id,
    student_id,
    container_type,
    grade_level,
    subject,
    LEFT(skill_id, 8) || '...' as skill_id,
    priority
FROM generation_queue
WHERE status = 'pending'
AND skill_id IS NOT NULL
AND skill_id IN (SELECT skill_id::text FROM skills_master WHERE skill_id IS NOT NULL)
ORDER BY priority ASC, created_at ASC
LIMIT 10;