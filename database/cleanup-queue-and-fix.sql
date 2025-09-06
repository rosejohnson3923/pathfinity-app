-- Clean up generation_queue and fix all issues
-- Addresses: 172 failed items, 125 stuck in processing, skill_id mismatches

-- Step 1: Show current errors
SELECT 
    'Current Errors' as report,
    status,
    error_message,
    COUNT(*) as count
FROM generation_queue
WHERE status IN ('failed', 'processing')
GROUP BY status, error_message
ORDER BY count DESC;

-- Step 2: Create skill mapping table
DROP TABLE IF EXISTS temp_skill_mapping;
CREATE TEMP TABLE temp_skill_mapping AS
SELECT 
    skill_id,
    skill_id::text as skill_id_text,
    skill_number,
    grade_level,
    subject,
    skill_name
FROM skills_master;

-- Step 3: Reset stuck "processing" items (they've been processing too long)
UPDATE generation_queue
SET status = 'pending',
    retry_count = COALESCE(retry_count, 0),
    updated_at = NOW()
WHERE status = 'processing'
AND (
    updated_at < NOW() - INTERVAL '1 hour'  -- Stuck for more than an hour
    OR updated_at IS NULL
);

-- Step 4: Fix failed items with skill not found errors
UPDATE generation_queue q
SET 
    skill_id = m.skill_id_text,
    status = 'pending',
    error_message = NULL,
    retry_count = 0,
    updated_at = NOW()
FROM temp_skill_mapping m
WHERE q.status = 'failed'
AND q.skill_number = m.skill_number
AND q.grade_level = m.grade_level
AND q.subject = m.subject
AND (
    q.error_message LIKE '%Skill not found%'
    OR q.error_message LIKE '%skill_id%'
    OR q.skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d'
);

-- Step 5: Fix any remaining failed items that can be matched
UPDATE generation_queue q
SET 
    skill_id = m.skill_id_text,
    status = 'pending',
    error_message = NULL,
    retry_count = 0,
    updated_at = NOW()
FROM temp_skill_mapping m
WHERE q.status = 'failed'
AND q.skill_number = m.skill_number
AND q.grade_level = m.grade_level
AND q.subject = m.subject;

-- Step 6: For items still in processing, update their skill_ids if needed
UPDATE generation_queue q
SET skill_id = m.skill_id_text
FROM temp_skill_mapping m
WHERE q.status = 'processing'
AND q.skill_number = m.skill_number
AND q.grade_level = m.grade_level
AND q.subject = m.subject
AND (
    q.skill_id IS NULL 
    OR q.skill_id NOT IN (SELECT skill_id_text FROM temp_skill_mapping)
);

-- Step 7: Delete permanently failed items that can't be fixed
-- (items with no matching skill in skills_master)
DELETE FROM generation_queue
WHERE status = 'failed'
AND skill_number NOT IN (
    SELECT DISTINCT skill_number 
    FROM skills_master 
    WHERE skill_number IS NOT NULL
);

-- Step 8: Reset any remaining processing items to pending
UPDATE generation_queue
SET status = 'pending',
    updated_at = NOW()
WHERE status = 'processing';

-- Step 9: Ensure all pending items have valid skill_ids
UPDATE generation_queue q
SET skill_id = m.skill_id_text
FROM temp_skill_mapping m
WHERE q.status = 'pending'
AND q.skill_number = m.skill_number
AND q.grade_level = m.grade_level
AND q.subject = m.subject
AND (
    q.skill_id IS NULL 
    OR q.skill_id NOT IN (SELECT skill_id_text FROM temp_skill_mapping)
);

-- Step 10: Add any missing high-priority entries for demo users
INSERT INTO generation_queue (
    queue_id,
    user_id,
    container_type,
    grade_level,
    subject,
    skill_id,
    skill_number,
    status,
    priority,
    created_at
)
SELECT DISTINCT
    COALESCE(gen_random_uuid()::text, md5(random()::text || clock_timestamp()::text)),
    up.user_id,
    'learn',  -- Priority on learn container
    m.grade_level,
    m.subject,
    m.skill_id_text,
    m.skill_number,
    'pending',
    1,  -- High priority
    NOW()
FROM user_profiles up
CROSS JOIN temp_skill_mapping m
WHERE up.is_demo_user = true
AND up.grade_level = m.grade_level
AND m.skill_number = 'A.1'  -- Just the very first skill
AND NOT EXISTS (
    SELECT 1 FROM generation_queue q
    WHERE q.user_id = up.user_id
    AND q.container_type = 'learn'
    AND q.skill_number = 'A.1'
    AND q.grade_level = m.grade_level
    AND q.subject = m.subject
)
ORDER BY up.user_id, m.subject;

-- Step 11: Summary report
SELECT 
    'Final Status Summary' as report,
    status,
    COUNT(*) as total_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT skill_id) as unique_skills,
    COUNT(DISTINCT container_type) as containers,
    MIN(created_at) as oldest_entry,
    MAX(updated_at) as newest_update
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

-- Step 12: Detailed pending items check
SELECT 
    'Pending Items by Grade/Subject' as report,
    grade_level,
    subject,
    container_type,
    COUNT(*) as count,
    array_agg(DISTINCT skill_number ORDER BY skill_number LIMIT 5) as sample_skills
FROM generation_queue
WHERE status = 'pending'
GROUP BY grade_level, subject, container_type
ORDER BY grade_level, subject, container_type;

-- Step 13: Verify no orphaned skill_ids remain
SELECT 
    'Orphaned Skills Check' as check,
    COUNT(*) as orphaned_count
FROM generation_queue q
WHERE q.status IN ('pending', 'processing')
AND q.skill_id NOT IN (
    SELECT skill_id::text 
    FROM skills_master 
    WHERE skill_id IS NOT NULL
);

-- Step 14: Show sample ready-to-process items
SELECT 
    queue_id,
    user_id,
    container_type,
    grade_level,
    subject,
    skill_number,
    LEFT(skill_id, 8) || '...' as skill_id_preview,
    status,
    priority
FROM generation_queue
WHERE status = 'pending'
ORDER BY priority, created_at
LIMIT 10;

-- Clean up
DROP TABLE IF EXISTS temp_skill_mapping;