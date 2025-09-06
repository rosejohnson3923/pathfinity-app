-- Add skill_id to skills_master and fix all references
-- This script handles the case where skills_master doesn't have skill_id column

-- Step 1: Check if skill_id column exists in skills_master
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'skills_master' 
        AND column_name = 'skill_id'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE skills_master ADD COLUMN skill_id UUID DEFAULT gen_random_uuid();
        RAISE NOTICE 'Added skill_id column to skills_master table';
    ELSE
        RAISE NOTICE 'skill_id column already exists in skills_master table';
    END IF;
END $$;

-- Step 2: Populate skill_id for any rows that have NULL
UPDATE skills_master 
SET skill_id = gen_random_uuid()
WHERE skill_id IS NULL;

-- Step 3: Make skill_id NOT NULL and add index for performance
ALTER TABLE skills_master ALTER COLUMN skill_id SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_skills_master_skill_id ON skills_master(skill_id);
CREATE INDEX IF NOT EXISTS idx_skills_master_lookup ON skills_master(grade_level, subject, skill_number);

-- Step 4: Check current state of generation_queue
SELECT 
    'Generation Queue Status' as report_type,
    status,
    COUNT(*) as count,
    COUNT(DISTINCT error_message) as unique_errors
FROM generation_queue
GROUP BY status;

-- Step 5: Create mapping table
DROP TABLE IF EXISTS temp_skill_fix;
CREATE TEMP TABLE temp_skill_fix AS
SELECT 
    skill_id,
    skill_id::text as skill_id_text,
    skill_number,
    grade_level,
    subject,
    skill_name
FROM skills_master;

-- Step 6: Show what skill_ids we have in skills_master
SELECT 
    'Skills Master Summary' as report_type,
    grade_level,
    subject,
    COUNT(*) as skill_count,
    COUNT(DISTINCT LEFT(skill_number, 1)) as cluster_count,
    array_agg(skill_number ORDER BY skill_number LIMIT 5) as sample_skill_numbers
FROM skills_master
GROUP BY grade_level, subject
ORDER BY grade_level, subject;

-- Step 7: Clear out failed generation_queue entries
DELETE FROM generation_queue
WHERE status IN ('failed', 'permanently_failed')
AND (
    error_message LIKE '%Skill not found%' 
    OR error_message LIKE '%skill_id%'
    OR error_message IS NULL
);

-- Step 8: Fix generation_queue skill_ids
-- First, check what columns generation_queue has
SELECT 
    'Generation Queue Columns' as info,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'generation_queue'
AND column_name IN ('skill_id', 'skill_number', 'grade_level', 'subject')
ORDER BY column_name;

-- Step 9: Update generation_queue with correct skill_ids
UPDATE generation_queue q
SET skill_id = f.skill_id_text,
    status = 'pending',
    updated_at = NOW()
FROM temp_skill_fix f
WHERE q.skill_number = f.skill_number
AND q.grade_level = f.grade_level
AND q.subject = f.subject
AND (
    q.skill_id IS NULL 
    OR q.skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d'  -- The problematic ID
    OR q.skill_id NOT IN (SELECT skill_id_text FROM temp_skill_fix)
);

-- Step 10: For any remaining items without matches, try to match by skill_number alone
UPDATE generation_queue q
SET skill_id = f.skill_id_text,
    grade_level = f.grade_level,
    subject = f.subject,
    status = 'pending',
    updated_at = NOW()
FROM temp_skill_fix f
WHERE q.skill_number = f.skill_number
AND q.skill_id IS NULL;

-- Step 11: Populate missing queue entries for demo users
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
    COALESCE(gen_random_uuid()::text, 'queue_' || md5(random()::text || clock_timestamp()::text)),
    up.user_id,
    ct.container_type,
    f.grade_level,
    f.subject,
    f.skill_id_text,
    f.skill_number,
    'pending',
    NOW(),
    CASE 
        WHEN f.skill_number LIKE 'A.%' THEN 1
        WHEN f.skill_number LIKE 'B.%' THEN 2
        WHEN f.skill_number LIKE 'C.%' THEN 3
        ELSE 4
    END
FROM user_profiles up
CROSS JOIN (VALUES ('learn'), ('experience'), ('discover')) ct(container_type)
CROSS JOIN temp_skill_fix f
WHERE up.is_demo_user = true
AND up.grade_level = f.grade_level
AND f.skill_number IN ('A.1', 'A.2', 'A.3')  -- Start with first cluster only
ON CONFLICT DO NOTHING;

-- Step 12: Final verification
SELECT 
    'Final Queue Status' as report,
    container_type,
    grade_level,
    status,
    COUNT(*) as count
FROM generation_queue
GROUP BY container_type, grade_level, status
ORDER BY container_type, grade_level, status;

-- Step 13: Check for any remaining problematic entries
SELECT 
    'Problematic Entries Check' as check_type,
    COUNT(*) as count
FROM generation_queue q
WHERE q.skill_id IS NOT NULL
AND q.skill_id NOT IN (SELECT skill_id_text FROM temp_skill_fix)
AND q.status = 'pending';

-- Step 14: Show sample of fixed entries
SELECT 
    queue_id,
    user_id,
    container_type,
    grade_level,
    subject,
    skill_number,
    LEFT(skill_id, 8) || '...' as skill_id_preview,
    status
FROM generation_queue
WHERE status = 'pending'
ORDER BY created_at DESC
LIMIT 10;

-- Clean up
DROP TABLE IF EXISTS temp_skill_fix;