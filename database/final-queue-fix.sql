-- Final comprehensive fix for generation_queue
-- Works with exact table structure: student_id, no skill_number column

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

-- Step 2: Show the problematic skill_id entries
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

-- Step 3: Reset ALL processing items to pending
UPDATE generation_queue
SET 
    status = 'pending',
    started_at = NULL,
    error_message = NULL,
    retry_count = COALESCE(retry_count, 0),
    updated_at = CURRENT_TIMESTAMP
WHERE status = 'processing';

-- Step 4: Get valid skill_ids for each grade/subject from skills_master
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

-- Step 5: Specifically fix Grade 10 Social Studies (the main problem area)
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

-- Step 6: Handle any remaining failed items
UPDATE generation_queue
SET 
    status = 'pending',
    retry_count = LEAST(COALESCE(retry_count, 0) + 1, max_retries),
    error_message = NULL,
    started_at = NULL,
    updated_at = CURRENT_TIMESTAMP
WHERE status = 'failed'
AND retry_count < max_retries;

-- Step 7: Mark as permanently_failed if exceeded retries
UPDATE generation_queue
SET status = 'permanently_failed'
WHERE status = 'failed'
AND retry_count >= max_retries;

-- Step 8: Delete entries for grade/subject combos that don't exist in skills_master
DELETE FROM generation_queue
WHERE (grade_level, subject) NOT IN (
    SELECT DISTINCT grade_level, subject
    FROM skills_master
    WHERE skill_id IS NOT NULL
)
AND status IN ('failed', 'permanently_failed');

-- Step 9: Verification - check all pending items have valid skill_ids
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
            ELSE 'Invalid'
        END as skill_validity
    FROM generation_queue q
    LEFT JOIN skills_master s ON q.skill_id = s.skill_id::text
    WHERE q.status = 'pending'
)
SELECT 
    'Pending Items Validation' as report,
    skill_validity,
    COUNT(*) as count
FROM validation
GROUP BY skill_validity;

-- Step 10: Final summary
SELECT 
    'Final Summary' as report,
    status,
    COUNT(*) as total_items,
    COUNT(DISTINCT student_id) as unique_students,
    COUNT(DISTINCT container_type) as container_types,
    COUNT(DISTINCT grade_level || '-' || subject) as grade_subjects,
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

-- Step 11: Show sample of fixed items ready to process
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
ORDER BY priority ASC, created_at ASC
LIMIT 10;

-- Step 12: Specifically show Grade 10 Social Studies items (to verify fix)
SELECT 
    'Grade 10 Social Studies Check' as report,
    status,
    container_type,
    question_type,
    LEFT(skill_id, 8) || '...' as skill_id,
    COUNT(*) as count
FROM generation_queue
WHERE grade_level = '10'
AND subject = 'Social Studies'
GROUP BY status, container_type, question_type, skill_id
ORDER BY status, container_type;