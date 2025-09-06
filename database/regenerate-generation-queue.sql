-- Regenerate generation_queue with correct skill_ids from skills_master
-- This script clears failed/permanently_failed items and repopulates with correct data

-- First, let's see what's in the current queue
SELECT 
    status, 
    COUNT(*) as count,
    array_agg(DISTINCT error_message) as error_messages
FROM generation_queue
GROUP BY status;

-- Clear out failed items with skill not found errors
DELETE FROM generation_queue
WHERE status IN ('failed', 'permanently_failed')
AND error_message LIKE '%Skill not found%';

-- Clear any pending items with invalid skill_ids
DELETE FROM generation_queue
WHERE status = 'pending'
AND skill_id NOT IN (SELECT skill_id FROM skills_master WHERE skill_id IS NOT NULL);

-- Now repopulate the queue with correct skill_ids for all demo users
-- This uses the skills from skills_master with their actual skill_ids
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
SELECT 
    gen_random_uuid() as queue_id,
    u.user_id,
    'learn' as container_type,
    s.grade_level,
    s.subject,
    COALESCE(s.skill_id, gen_random_uuid()) as skill_id,  -- Generate if missing
    s.skill_number,
    'pending' as status,
    NOW() as created_at
FROM (
    -- Get all demo users
    SELECT user_id, grade_level
    FROM user_profiles
    WHERE is_demo_user = true
) u
CROSS JOIN (
    -- Get all skills for their grade
    SELECT DISTINCT 
        grade_level,
        subject,
        skill_id,
        skill_number,
        skill_name
    FROM skills_master
    WHERE skill_number IN ('A.1', 'A.2', 'A.3', 'B.1', 'B.2', 'B.3')  -- First few skills
) s
WHERE u.grade_level = s.grade_level
ON CONFLICT (user_id, container_type, skill_id) DO NOTHING;  -- Avoid duplicates

-- Add Experience container entries
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
SELECT 
    gen_random_uuid() as queue_id,
    u.user_id,
    'experience' as container_type,
    s.grade_level,
    s.subject,
    COALESCE(s.skill_id, gen_random_uuid()) as skill_id,
    s.skill_number,
    'pending' as status,
    NOW() as created_at
FROM (
    SELECT user_id, grade_level
    FROM user_profiles
    WHERE is_demo_user = true
) u
CROSS JOIN (
    SELECT DISTINCT 
        grade_level,
        subject,
        skill_id,
        skill_number,
        skill_name
    FROM skills_master
    WHERE skill_number IN ('A.1', 'A.2', 'A.3')  -- Just first cluster for experience
) s
WHERE u.grade_level = s.grade_level
ON CONFLICT (user_id, container_type, skill_id) DO NOTHING;

-- Add Discover container entries
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
SELECT 
    gen_random_uuid() as queue_id,
    u.user_id,
    'discover' as container_type,
    s.grade_level,
    s.subject,
    COALESCE(s.skill_id, gen_random_uuid()) as skill_id,
    s.skill_number,
    'pending' as status,
    NOW() as created_at
FROM (
    SELECT user_id, grade_level
    FROM user_profiles
    WHERE is_demo_user = true
) u
CROSS JOIN (
    SELECT DISTINCT 
        grade_level,
        subject,
        skill_id,
        skill_number,
        skill_name
    FROM skills_master
    WHERE skill_number IN ('A.1', 'A.2', 'A.3')  -- Just first cluster for discover
) s
WHERE u.grade_level = s.grade_level
ON CONFLICT (user_id, container_type, skill_id) DO NOTHING;

-- Verify the new queue status
SELECT 
    container_type,
    grade_level,
    subject,
    status,
    COUNT(*) as count
FROM generation_queue
GROUP BY container_type, grade_level, subject, status
ORDER BY container_type, grade_level, subject, status;

-- Check if there are any entries without valid skill_ids
SELECT COUNT(*) as invalid_skill_count
FROM generation_queue q
LEFT JOIN skills_master s ON q.skill_id = s.skill_id
WHERE s.skill_id IS NULL
AND q.status = 'pending';