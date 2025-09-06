-- Comprehensive fix for all skill_id references across the database
-- This script updates all tables to use skill_number as the key for matching

-- Step 1: Ensure skills_master has skill_id populated
UPDATE skills_master 
SET skill_id = gen_random_uuid()
WHERE skill_id IS NULL;

-- Step 2: Create a mapping table for the fix
CREATE TEMP TABLE skill_mapping AS
SELECT 
    skill_id,
    skill_number,
    grade_level,
    subject,
    skill_name
FROM skills_master;

-- Step 3: Fix generation_queue
-- Delete entries with invalid skill_ids
DELETE FROM generation_queue
WHERE status IN ('failed', 'permanently_failed')
AND error_message LIKE '%Skill not found%';

-- Update pending entries to use correct skill_id based on skill_number and grade
UPDATE generation_queue q
SET skill_id = sm.skill_id
FROM skill_mapping sm
WHERE q.skill_number = sm.skill_number
AND q.grade_level = sm.grade_level
AND q.subject = sm.subject
AND q.status = 'pending';

-- Step 4: Fix user_skills table
UPDATE user_skills us
SET skill_id = sm.skill_id
FROM skill_mapping sm
WHERE us.skill_number = sm.skill_number
AND us.grade = sm.grade_level
AND us.subject = sm.subject
AND us.skill_id NOT IN (SELECT skill_id FROM skills_master);

-- Step 5: Fix user_skill_progress table
UPDATE user_skill_progress usp
SET skill_id = sm.skill_id
FROM skill_mapping sm
WHERE usp.skill_number = sm.skill_number
AND usp.grade_level = sm.grade_level
AND usp.subject = sm.subject
AND usp.skill_id NOT IN (SELECT skill_id FROM skills_master);

-- Step 6: Fix generated_content table
UPDATE generated_content gc
SET skill_id = sm.skill_id
FROM skill_mapping sm
WHERE gc.skill_number = sm.skill_number
AND gc.grade_level = sm.grade_level
AND gc.subject = sm.subject
AND gc.skill_id NOT IN (SELECT skill_id FROM skills_master);

-- Step 7: Fix content_generation_queue table if it exists
UPDATE content_generation_queue cgq
SET skill_id = sm.skill_id
FROM skill_mapping sm
WHERE cgq.skill_number = sm.skill_number
AND cgq.grade_level = sm.grade_level
AND cgq.subject = sm.subject
AND cgq.skill_id NOT IN (SELECT skill_id FROM skills_master);

-- Step 8: Clean up any remaining orphaned records
-- These are records where we can't match by skill_number
DELETE FROM generation_queue
WHERE skill_id NOT IN (SELECT skill_id FROM skills_master)
AND status = 'pending';

-- Step 9: Repopulate generation_queue for demo users with missing entries
INSERT INTO generation_queue (
    queue_id,
    user_id,
    container_type,
    grade_level,
    subject,
    skill_id,
    skill_number,
    status,
    created_at
)
SELECT DISTINCT
    gen_random_uuid() as queue_id,
    up.user_id,
    ct.container_type,
    sm.grade_level,
    sm.subject,
    sm.skill_id,
    sm.skill_number,
    'pending' as status,
    NOW() as created_at
FROM user_profiles up
CROSS JOIN (VALUES ('learn'), ('experience'), ('discover')) AS ct(container_type)
CROSS JOIN skill_mapping sm
WHERE up.is_demo_user = true
AND up.grade_level = sm.grade_level
AND sm.skill_number IN ('A.1', 'A.2', 'A.3', 'B.1', 'B.2', 'B.3')
ON CONFLICT (user_id, container_type, skill_id) DO NOTHING;

-- Step 10: Verify the fix
SELECT 
    'Final Check' as check_type,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'pending') as pending_queue_items,
    (SELECT COUNT(*) FROM generation_queue WHERE skill_id NOT IN (SELECT skill_id FROM skills_master)) as orphaned_queue_items,
    (SELECT COUNT(*) FROM user_skills WHERE skill_id NOT IN (SELECT skill_id FROM skills_master)) as orphaned_user_skills,
    (SELECT COUNT(*) FROM user_skill_progress WHERE skill_id NOT IN (SELECT skill_id FROM skills_master)) as orphaned_progress,
    (SELECT COUNT(*) FROM generated_content WHERE skill_id NOT IN (SELECT skill_id FROM skills_master)) as orphaned_content;

-- Clean up temp table
DROP TABLE IF EXISTS skill_mapping;