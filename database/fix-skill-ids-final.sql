-- Final fix for skill_id issues - only working with existing tables
-- Tables to fix: content_cache_v2, daily_assignments, generation_cache, generation_queue, question_type_testing, student_skill_progress

-- Step 1: Check current state
SELECT 
    'Initial Check' as step,
    (SELECT COUNT(*) FROM generation_queue WHERE status IN ('failed', 'permanently_failed')) as failed_items,
    (SELECT COUNT(*) FROM generation_queue WHERE status = 'pending') as pending_items,
    (SELECT COUNT(*) FROM skills_master WHERE skill_id IS NULL) as null_skill_ids;

-- Step 2: Ensure skills_master has skill_id populated
ALTER TABLE skills_master 
ADD COLUMN IF NOT EXISTS skill_id UUID DEFAULT gen_random_uuid();

UPDATE skills_master 
SET skill_id = gen_random_uuid()
WHERE skill_id IS NULL;

-- Step 3: Create mapping table with both UUID and text versions
DROP TABLE IF EXISTS temp_skill_mapping;
CREATE TEMP TABLE temp_skill_mapping AS
SELECT 
    skill_id,
    skill_id::text as skill_id_text,
    skill_number,
    grade_level,
    subject,
    skill_name
FROM skills_master
WHERE skill_id IS NOT NULL;

-- Step 4: Clear failed queue items
DELETE FROM generation_queue
WHERE status IN ('failed', 'permanently_failed')
AND (error_message LIKE '%Skill not found%' OR error_message IS NULL);

-- Step 5: Fix generation_queue (varchar type)
-- First, nullify invalid skill_ids
UPDATE generation_queue
SET skill_id = NULL
WHERE skill_id IS NOT NULL
AND skill_id NOT IN (SELECT skill_id_text FROM temp_skill_mapping);

-- Then update with correct skill_ids based on skill_number, grade, and subject
UPDATE generation_queue q
SET skill_id = m.skill_id_text
FROM temp_skill_mapping m
WHERE q.skill_number = m.skill_number
AND q.grade_level = m.grade_level
AND q.subject = m.subject
AND q.skill_id IS NULL;

-- Step 6: Fix content_cache_v2 if it has matching columns
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'content_cache_v2' 
        AND column_name = 'skill_number'
    ) THEN
        UPDATE content_cache_v2 c
        SET skill_id = m.skill_id_text
        FROM temp_skill_mapping m
        WHERE c.skill_number = m.skill_number
        AND c.grade_level = m.grade_level
        AND c.subject = m.subject
        AND (c.skill_id IS NULL OR c.skill_id NOT IN (SELECT skill_id_text FROM temp_skill_mapping));
    END IF;
END $$;

-- Step 7: Fix generation_cache if it has matching columns  
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'generation_cache' 
        AND column_name = 'skill_number'
    ) THEN
        UPDATE generation_cache g
        SET skill_id = m.skill_id_text
        FROM temp_skill_mapping m
        WHERE g.skill_number = m.skill_number
        AND g.grade_level = m.grade_level
        AND g.subject = m.subject
        AND (g.skill_id IS NULL OR g.skill_id NOT IN (SELECT skill_id_text FROM temp_skill_mapping));
    END IF;
END $$;

-- Step 8: Populate generation_queue for demo users
INSERT INTO generation_queue (
    queue_id,
    user_id,
    container_type,
    grade_level,
    subject,
    skill_id,
    skill_number,
    status,
    created_at,
    priority
)
SELECT 
    gen_random_uuid()::text,
    up.user_id,
    ct.container_type,
    m.grade_level,
    m.subject,
    m.skill_id_text,
    m.skill_number,
    'pending',
    NOW(),
    CASE 
        WHEN m.skill_number LIKE 'A.%' THEN 1
        WHEN m.skill_number LIKE 'B.%' THEN 2
        WHEN m.skill_number LIKE 'C.%' THEN 3
        ELSE 4
    END
FROM user_profiles up
CROSS JOIN (VALUES ('learn'), ('experience'), ('discover')) ct(container_type)
CROSS JOIN temp_skill_mapping m
WHERE up.is_demo_user = true
AND up.grade_level = m.grade_level
AND m.skill_number IN ('A.1', 'A.2', 'A.3', 'B.1', 'B.2', 'B.3')
ON CONFLICT DO NOTHING;

-- Step 9: Verify the fix
SELECT 
    'Final Status' as report,
    container_type,
    status,
    COUNT(*) as count,
    COUNT(DISTINCT skill_id) as unique_skills
FROM generation_queue
GROUP BY container_type, status
ORDER BY container_type, status;

-- Step 10: Check for any remaining orphaned skill_ids
SELECT 
    'Orphaned Check' as check_type,
    COUNT(*) as orphaned_count
FROM generation_queue q
WHERE q.skill_id IS NOT NULL
AND q.skill_id NOT IN (SELECT skill_id_text FROM temp_skill_mapping);

-- Step 11: Show sample of fixed entries
SELECT 
    user_id,
    container_type,
    grade_level,
    subject,
    skill_number,
    LEFT(skill_id, 8) || '...' as skill_id_preview,
    status
FROM generation_queue
WHERE status = 'pending'
ORDER BY grade_level, subject, skill_number
LIMIT 10;

-- Clean up
DROP TABLE IF EXISTS temp_skill_mapping;