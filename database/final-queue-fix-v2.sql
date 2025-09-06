-- Final comprehensive fix for generation_queue (v2)
-- Handles check constraint that doesn't allow 'permanently_failed'

-- Step 1: Show current state
SELECT 
    'Current State' as report,
    status,
    COUNT(*) as count,
    COUNT(DISTINCT student_id) as students,
    COUNT(DISTINCT grade_level || '-' || subject) as grade_subjects
FROM generation_queue
GROUP BY status
ORDER BY status;

-- Step 2: Check what statuses are allowed by the constraint
SELECT 
    'Check Constraint Info' as report,
    constraint_name,
    check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'valid_status';

-- Step 3: Show the problematic skill_id entries
SELECT 
    'Problematic Skills' as report,
    skill_id,
    grade_level,
    subject,
    container_type,
    status,
    COUNT(*) as count
FROM generation_queue
WHERE skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d'
   OR skill_id IS NULL
   OR skill_id NOT IN (SELECT skill_id::text FROM skills_master WHERE skill_id IS NOT NULL)
GROUP BY skill_id, grade_level, subject, container_type, status
ORDER BY count DESC;

-- Step 4: Reset ALL processing items to pending
UPDATE generation_queue
SET 
    status = 'pending',
    started_at = NULL,
    error_message = NULL,
    retry_count = COALESCE(retry_count, 0),
    updated_at = CURRENT_TIMESTAMP
WHERE status = 'processing';

-- Step 5: Get valid skill_ids for each grade/subject from skills_master
-- We'll use the first skill (alphabetically) for each grade/subject combo
WITH valid_skills AS (
    SELECT DISTINCT ON (grade_level, subject)
        skill_id::text as skill_id,
        grade_level,
        subject,
        skill_number,
        skill_name
    FROM skills_master
    WHERE skill_id IS NOT NULL
    ORDER BY grade_level, subject, skill_number
)
-- Update all entries with bad skill_ids
UPDATE generation_queue q
SET 
    skill_id = vs.skill_id,
    status = CASE 
        WHEN q.status = 'failed' THEN 'pending'
        ELSE q.status
    END,
    error_message = CASE 
        WHEN q.status = 'failed' THEN NULL
        ELSE q.error_message
    END,
    retry_count = CASE 
        WHEN q.status = 'failed' THEN 0
        ELSE q.retry_count
    END,
    updated_at = CURRENT_TIMESTAMP
FROM valid_skills vs
WHERE q.grade_level = vs.grade_level
AND q.subject = vs.subject
AND (
    q.skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d'
    OR q.skill_id IS NULL
    OR q.skill_id NOT IN (SELECT skill_id::text FROM skills_master WHERE skill_id IS NOT NULL)
);

-- Step 6: Specifically fix Grade 10 Social Studies (the main problem area)
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
    status = CASE 
        WHEN status IN ('failed', 'processing') THEN 'pending'
        ELSE status
    END,
    error_message = NULL,
    retry_count = 0,
    started_at = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE grade_level = '10'
AND subject = 'Social Studies'
AND (
    skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d'
    OR skill_id IS NULL
    OR skill_id NOT IN (SELECT skill_id::text FROM skills_master WHERE skill_id IS NOT NULL)
);

-- Step 7: Handle any remaining failed items
-- If they've exceeded max retries, just delete them instead of marking permanently_failed
DELETE FROM generation_queue
WHERE status = 'failed'
AND retry_count >= max_retries
AND (
    skill_id IS NULL 
    OR skill_id NOT IN (SELECT skill_id::text FROM skills_master WHERE skill_id IS NOT NULL)
);

-- Step 8: Reset failed items that can be retried
UPDATE generation_queue
SET 
    status = 'pending',
    retry_count = LEAST(COALESCE(retry_count, 0) + 1, max_retries - 1),
    error_message = NULL,
    started_at = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE status = 'failed'
AND retry_count < max_retries;

-- Step 9: Delete entries for grade/subject combos that don't exist in skills_master
DELETE FROM generation_queue
WHERE (grade_level, subject) NOT IN (
    SELECT DISTINCT grade_level, subject
    FROM skills_master
    WHERE skill_id IS NOT NULL
)
AND status = 'failed';

-- Step 10: Handle entries with skill_id as skill_number (like 'A.1' in the error)
-- These need to be converted to actual UUIDs
UPDATE generation_queue q
SET skill_id = s.skill_id::text
FROM skills_master s
WHERE q.skill_id = s.skill_number
AND q.grade_level = s.grade_level
AND q.subject = s.subject
AND s.skill_id IS NOT NULL;

-- Step 11: Fix Algebra 1 entries specifically (from the error message)
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
AND q.skill_id = 'A.1';

-- Step 12: Verification - check all pending items have valid skill_ids
WITH validation AS (
    SELECT 
        q.queue_id,
        q.skill_id as queue_skill_id,
        q.grade_level,
        q.subject,
        q.status,
        CASE 
            WHEN s.skill_id IS NOT NULL THEN 'Valid'
            WHEN q.skill_id IS NULL THEN 'Missing'
            WHEN LENGTH(q.skill_id) < 36 THEN 'Not UUID (possibly skill_number)'
            ELSE 'Invalid UUID'
        END as skill_validity
    FROM generation_queue q
    LEFT JOIN skills_master s ON q.skill_id = s.skill_id::text
    WHERE q.status IN ('pending', 'failed')
)
SELECT 
    'Skill Validation' as report,
    status,
    skill_validity,
    COUNT(*) as count
FROM validation
GROUP BY status, skill_validity
ORDER BY status, skill_validity;

-- Step 13: Final summary
SELECT 
    'Final Summary' as report,
    status,
    COUNT(*) as total_items,
    COUNT(DISTINCT student_id) as unique_students,
    COUNT(DISTINCT container_type) as container_types,
    COUNT(DISTINCT grade_level || '-' || subject) as grade_subjects,
    COUNT(CASE WHEN skill_id IS NULL THEN 1 END) as null_skills,
    COUNT(CASE WHEN skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d' THEN 1 END) as bad_skills,
    COUNT(CASE WHEN LENGTH(skill_id) < 36 THEN 1 END) as non_uuid_skills
FROM generation_queue
GROUP BY status
ORDER BY 
    CASE status 
        WHEN 'pending' THEN 1
        WHEN 'processing' THEN 2
        WHEN 'completed' THEN 3
        WHEN 'failed' THEN 4
        ELSE 5
    END;

-- Step 14: Show sample of fixed items ready to process
SELECT 
    'Ready to Process' as status,
    queue_id,
    student_id,
    container_type,
    grade_level,
    subject,
    question_type,
    LEFT(skill_id, 8) || '...' as skill_id,
    priority
FROM generation_queue
WHERE status = 'pending'
AND skill_id IS NOT NULL
AND LENGTH(skill_id) >= 36  -- Valid UUID length
ORDER BY priority ASC, created_at ASC
LIMIT 10;

-- Step 15: Show any remaining problematic entries
SELECT 
    'Remaining Problems' as report,
    status,
    grade_level,
    subject,
    skill_id,
    error_message,
    retry_count,
    COUNT(*) as count
FROM generation_queue
WHERE status = 'failed'
   OR skill_id IS NULL
   OR LENGTH(skill_id) < 36
   OR skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d'
GROUP BY status, grade_level, subject, skill_id, error_message, retry_count
ORDER BY count DESC
LIMIT 20;