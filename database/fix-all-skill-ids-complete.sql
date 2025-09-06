-- Comprehensive fix for all skill_id references across ALL tables
-- Handles both UUID and character varying data types

-- Step 1: First, check what we're dealing with
SELECT 
    'Current skill_id status' as report,
    (SELECT COUNT(*) FROM skills_master WHERE skill_id IS NULL) as null_skill_ids_in_master,
    (SELECT COUNT(DISTINCT skill_id) FROM skills_master) as unique_skills_in_master,
    (SELECT COUNT(*) FROM generation_queue WHERE status IN ('failed', 'permanently_failed')) as failed_queue_items;

-- Step 2: Ensure skills_master has skill_id populated (UUID type)
ALTER TABLE skills_master 
ADD COLUMN IF NOT EXISTS skill_id UUID DEFAULT gen_random_uuid();

UPDATE skills_master 
SET skill_id = gen_random_uuid()
WHERE skill_id IS NULL;

-- Step 3: Create a comprehensive mapping table
CREATE TEMP TABLE skill_mapping AS
SELECT 
    skill_id::text as skill_id_text,  -- For varchar columns
    skill_id as skill_id_uuid,        -- For UUID columns
    skill_number,
    grade_level,
    subject,
    skill_name,
    cluster
FROM skills_master;

-- Step 4: Fix generation_queue (character varying)
-- Clear failed entries with skill not found errors
DELETE FROM generation_queue
WHERE status IN ('failed', 'permanently_failed')
AND (error_message LIKE '%Skill not found%' OR error_message LIKE '%skill_id%');

-- Update existing entries to use correct skill_id based on skill_number
UPDATE generation_queue q
SET skill_id = sm.skill_id_text
FROM skill_mapping sm
WHERE q.skill_number = sm.skill_number
AND q.grade_level = sm.grade_level
AND q.subject = sm.subject
AND (q.skill_id IS NULL OR q.skill_id NOT IN (SELECT skill_id_text FROM skill_mapping));

-- Step 5: Fix content_cache_v2 (character varying)
UPDATE content_cache_v2 cc
SET skill_id = sm.skill_id_text
FROM skill_mapping sm
WHERE cc.skill_number = sm.skill_number
AND cc.grade_level = sm.grade_level
AND cc.subject = sm.subject
AND (cc.skill_id IS NULL OR cc.skill_id NOT IN (SELECT skill_id_text FROM skill_mapping));

-- Step 6: Fix generation_cache (character varying)
UPDATE generation_cache gc
SET skill_id = sm.skill_id_text
FROM skill_mapping sm
WHERE gc.skill_number = sm.skill_number
AND gc.grade_level = sm.grade_level
AND gc.subject = sm.subject
AND (gc.skill_id IS NULL OR gc.skill_id NOT IN (SELECT skill_id_text FROM skill_mapping));

-- Step 7: Fix daily_assignments (UUID)
-- First check if there's a skill_number column to use for matching
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'daily_assignments' 
        AND column_name = 'skill_number'
    ) THEN
        EXECUTE 'UPDATE daily_assignments da
        SET skill_id = sm.skill_id_uuid
        FROM skill_mapping sm
        WHERE da.skill_number = sm.skill_number
        AND da.grade_level = sm.grade_level
        AND da.subject = sm.subject';
    END IF;
END $$;

-- Step 8: Fix question_type_testing (UUID)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'question_type_testing' 
        AND column_name = 'skill_number'
    ) THEN
        EXECUTE 'UPDATE question_type_testing qt
        SET skill_id = sm.skill_id_uuid
        FROM skill_mapping sm
        WHERE qt.skill_number = sm.skill_number
        AND qt.grade_level = sm.grade_level
        AND qt.subject = sm.subject';
    END IF;
END $$;

-- Step 9: Fix student_skill_progress (UUID)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_skill_progress' 
        AND column_name = 'skill_number'
    ) THEN
        EXECUTE 'UPDATE student_skill_progress ssp
        SET skill_id = sm.skill_id_uuid
        FROM skill_mapping sm
        WHERE ssp.skill_number = sm.skill_number
        AND ssp.grade_level = sm.grade_level
        AND ssp.subject = sm.subject';
    END IF;
END $$;

-- Step 10: Repopulate generation_queue for all demo users
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
    gen_random_uuid()::text as queue_id,
    up.user_id,
    ct.container_type,
    sm.grade_level,
    sm.subject,
    sm.skill_id_text as skill_id,
    sm.skill_number,
    'pending' as status,
    CASE 
        WHEN sm.skill_number LIKE 'A.%' THEN 1
        WHEN sm.skill_number LIKE 'B.%' THEN 2
        ELSE 3
    END as priority,
    NOW() as created_at
FROM user_profiles up
CROSS JOIN (VALUES ('learn'), ('experience'), ('discover')) AS ct(container_type)
CROSS JOIN skill_mapping sm
WHERE up.is_demo_user = true
AND up.grade_level = sm.grade_level
AND sm.skill_number IN ('A.1', 'A.2', 'A.3', 'B.1', 'B.2', 'B.3', 'C.1', 'C.2', 'C.3')
ON CONFLICT (user_id, container_type, skill_id) DO UPDATE
SET status = 'pending',
    updated_at = NOW()
WHERE generation_queue.status IN ('failed', 'permanently_failed');

-- Step 11: Verification Report
WITH verification AS (
    SELECT 
        'generation_queue' as table_name,
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_records,
        COUNT(CASE WHEN status IN ('failed', 'permanently_failed') THEN 1 END) as failed_records,
        COUNT(CASE WHEN skill_id NOT IN (SELECT skill_id_text FROM skill_mapping) THEN 1 END) as orphaned_records
    FROM generation_queue
    
    UNION ALL
    
    SELECT 
        'content_cache_v2' as table_name,
        COUNT(*) as total_records,
        NULL as pending_records,
        NULL as failed_records,
        COUNT(CASE WHEN skill_id IS NOT NULL AND skill_id NOT IN (SELECT skill_id_text FROM skill_mapping) THEN 1 END) as orphaned_records
    FROM content_cache_v2
    
    UNION ALL
    
    SELECT 
        'generation_cache' as table_name,
        COUNT(*) as total_records,
        NULL as pending_records,
        NULL as failed_records,
        COUNT(CASE WHEN skill_id IS NOT NULL AND skill_id NOT IN (SELECT skill_id_text FROM skill_mapping) THEN 1 END) as orphaned_records
    FROM generation_cache
)
SELECT * FROM verification
ORDER BY table_name;

-- Step 12: Show sample of fixed generation_queue entries
SELECT 
    container_type,
    grade_level,
    subject,
    skill_number,
    skill_id,
    status,
    COUNT(*) as count
FROM generation_queue
WHERE status = 'pending'
GROUP BY container_type, grade_level, subject, skill_number, skill_id, status
ORDER BY grade_level, subject, skill_number
LIMIT 20;

-- Clean up
DROP TABLE IF EXISTS skill_mapping;