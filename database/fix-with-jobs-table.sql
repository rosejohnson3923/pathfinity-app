-- Fix generation_queue with generation_jobs foreign key constraint
-- Must handle generation_jobs table first before deleting from generation_queue

-- Step 1: Check the relationship between tables
SELECT 
    'Table Relationships' as report,
    'generation_jobs references generation_queue' as relationship,
    COUNT(*) as job_count
FROM generation_jobs;

-- Step 2: Show generation_jobs status
SELECT 
    'Generation Jobs Status' as report,
    gj.status as job_status,
    gq.status as queue_status,
    COUNT(*) as count
FROM generation_jobs gj
LEFT JOIN generation_queue gq ON gj.queue_id = gq.queue_id
GROUP BY gj.status, gq.status
ORDER BY count DESC;

-- Step 3: Check which queue items have associated jobs
SELECT 
    'Queue Items with Jobs' as report,
    gq.status,
    COUNT(DISTINCT gq.queue_id) as queue_items,
    COUNT(gj.job_id) as associated_jobs
FROM generation_queue gq
LEFT JOIN generation_jobs gj ON gq.queue_id = gj.queue_id
WHERE gq.status IN ('failed', 'processing')
GROUP BY gq.status;

-- Step 4: Clean up generation_jobs for failed queue items first
DELETE FROM generation_jobs
WHERE queue_id IN (
    SELECT queue_id 
    FROM generation_queue 
    WHERE status = 'failed'
    AND retry_count >= max_retries
    AND (
        skill_id IS NULL 
        OR skill_id NOT IN (SELECT skill_id::text FROM skills_master WHERE skill_id IS NOT NULL)
        OR skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d'
        OR LENGTH(skill_id) < 36  -- Not a valid UUID
    )
);

-- Step 5: Reset processing items to pending
UPDATE generation_queue
SET 
    status = 'pending',
    started_at = NULL,
    error_message = NULL,
    retry_count = COALESCE(retry_count, 0),
    updated_at = CURRENT_TIMESTAMP
WHERE status = 'processing';

-- Step 6: Fix skill_ids for all problematic entries
WITH valid_skills AS (
    SELECT DISTINCT ON (grade_level, subject)
        skill_id::text as skill_id,
        grade_level,
        subject,
        skill_number
    FROM skills_master
    WHERE skill_id IS NOT NULL
    ORDER BY grade_level, subject, skill_number
)
UPDATE generation_queue q
SET 
    skill_id = vs.skill_id,
    status = CASE 
        WHEN q.status = 'failed' THEN 'pending'
        ELSE q.status
    END,
    error_message = NULL,
    retry_count = 0,
    updated_at = CURRENT_TIMESTAMP
FROM valid_skills vs
WHERE q.grade_level = vs.grade_level
AND q.subject = vs.subject
AND (
    q.skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d'
    OR q.skill_id IS NULL
    OR q.skill_id NOT IN (SELECT skill_id::text FROM skills_master WHERE skill_id IS NOT NULL)
    OR LENGTH(q.skill_id) < 36
);

-- Step 7: Handle skill_numbers stored as skill_ids (like 'A.1')
UPDATE generation_queue q
SET skill_id = s.skill_id::text,
    status = 'pending',
    error_message = NULL,
    retry_count = 0,
    updated_at = CURRENT_TIMESTAMP
FROM skills_master s
WHERE q.skill_id = s.skill_number
AND q.grade_level = s.grade_level
AND q.subject = s.subject
AND s.skill_id IS NOT NULL;

-- Step 8: Fix Grade 10 Social Studies specifically
UPDATE generation_queue q
SET 
    skill_id = (
        SELECT skill_id::text 
        FROM skills_master 
        WHERE grade_level = '10' 
        AND subject = 'Social Studies' 
        AND skill_id IS NOT NULL
        ORDER BY skill_number 
        LIMIT 1
    ),
    status = 'pending',
    error_message = NULL,
    retry_count = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE grade_level = '10'
AND subject = 'Social Studies'
AND (skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d' OR skill_id IS NULL);

-- Step 9: Fix Algebra 1 entries (converting 'A.1' to proper UUID)
UPDATE generation_queue q
SET 
    skill_id = (
        SELECT skill_id::text 
        FROM skills_master 
        WHERE grade_level = q.grade_level
        AND subject = 'Algebra 1'
        AND skill_number = 'A.1'
        AND skill_id IS NOT NULL
        LIMIT 1
    ),
    status = 'pending',
    error_message = NULL,
    retry_count = 0,
    updated_at = CURRENT_TIMESTAMP
WHERE q.subject = 'Algebra 1'
AND (q.skill_id = 'A.1' OR LENGTH(q.skill_id) < 36);

-- Step 10: Now delete unfixable queue items (after cleaning jobs)
-- First delete their jobs
DELETE FROM generation_jobs
WHERE queue_id IN (
    SELECT queue_id 
    FROM generation_queue 
    WHERE status = 'failed'
    AND retry_count >= max_retries
    AND skill_id IS NULL
);

-- Then delete the queue items
DELETE FROM generation_queue
WHERE status = 'failed'
AND retry_count >= max_retries
AND skill_id IS NULL;

-- Step 11: Reset remaining failed items
UPDATE generation_queue
SET 
    status = 'pending',
    retry_count = LEAST(COALESCE(retry_count, 0) + 1, max_retries - 1),
    error_message = NULL,
    started_at = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE status = 'failed'
AND skill_id IS NOT NULL
AND skill_id IN (SELECT skill_id::text FROM skills_master WHERE skill_id IS NOT NULL);

-- Step 12: Validation check
WITH validation AS (
    SELECT 
        q.queue_id,
        q.skill_id,
        q.grade_level,
        q.subject,
        q.status,
        CASE 
            WHEN s.skill_id IS NOT NULL THEN 'Valid'
            WHEN q.skill_id IS NULL THEN 'Missing'
            WHEN LENGTH(q.skill_id) < 36 THEN 'Not UUID'
            ELSE 'Invalid'
        END as validity,
        EXISTS(SELECT 1 FROM generation_jobs gj WHERE gj.queue_id = q.queue_id) as has_jobs
    FROM generation_queue q
    LEFT JOIN skills_master s ON q.skill_id = s.skill_id::text
    WHERE q.status IN ('pending', 'failed')
)
SELECT 
    'Validation Report' as report,
    status,
    validity,
    has_jobs,
    COUNT(*) as count
FROM validation
GROUP BY status, validity, has_jobs
ORDER BY status, validity;

-- Step 13: Final summary
SELECT 
    'Final Queue Summary' as report,
    gq.status,
    COUNT(DISTINCT gq.queue_id) as queue_items,
    COUNT(DISTINCT gq.student_id) as students,
    COUNT(DISTINCT gj.job_id) as associated_jobs,
    COUNT(CASE WHEN gq.skill_id IS NULL THEN 1 END) as null_skills,
    COUNT(CASE WHEN LENGTH(gq.skill_id) < 36 THEN 1 END) as invalid_skills
FROM generation_queue gq
LEFT JOIN generation_jobs gj ON gq.queue_id = gj.queue_id
GROUP BY gq.status
ORDER BY 
    CASE gq.status 
        WHEN 'pending' THEN 1
        WHEN 'processing' THEN 2
        WHEN 'completed' THEN 3
        WHEN 'failed' THEN 4
        ELSE 5
    END;

-- Step 14: Show sample ready items
SELECT 
    'Sample Ready Items' as report,
    gq.queue_id,
    gq.student_id,
    gq.container_type,
    gq.grade_level,
    gq.subject,
    LEFT(gq.skill_id, 8) || '...' as skill_id,
    gq.priority,
    EXISTS(SELECT 1 FROM generation_jobs gj WHERE gj.queue_id = gq.queue_id) as has_job
FROM generation_queue gq
WHERE gq.status = 'pending'
AND gq.skill_id IS NOT NULL
AND LENGTH(gq.skill_id) >= 36
ORDER BY gq.priority ASC, gq.created_at ASC
LIMIT 10;