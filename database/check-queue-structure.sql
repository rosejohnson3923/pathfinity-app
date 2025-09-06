-- Check the actual structure of generation_queue table

-- Step 1: Show all columns in generation_queue
SELECT 
    'Generation Queue Columns' as report,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'generation_queue'
ORDER BY ordinal_position;

-- Step 2: Show sample data to understand what we have
SELECT 
    'Sample Queue Data' as report,
    *
FROM generation_queue
LIMIT 5;

-- Step 3: Check if we can identify skills by skill_id alone
SELECT 
    'Skill ID Matching Check' as report,
    q.skill_id as queue_skill_id,
    s.skill_id::text as master_skill_id,
    s.skill_number,
    s.grade_level,
    s.subject,
    q.status,
    q.error_message
FROM generation_queue q
LEFT JOIN skills_master s ON q.skill_id = s.skill_id::text
WHERE q.status IN ('failed', 'processing')
LIMIT 10;

-- Step 4: Count how many items have valid vs invalid skill_ids
SELECT 
    'Skill ID Validity' as report,
    status,
    COUNT(*) as total,
    COUNT(CASE WHEN skill_id IN (SELECT skill_id::text FROM skills_master) THEN 1 END) as valid_skill_id,
    COUNT(CASE WHEN skill_id NOT IN (SELECT skill_id::text FROM skills_master) THEN 1 END) as invalid_skill_id,
    COUNT(CASE WHEN skill_id IS NULL THEN 1 END) as null_skill_id
FROM generation_queue
GROUP BY status;

-- Step 5: Show the problematic skill_id that keeps appearing
SELECT 
    'Problematic Skill IDs' as report,
    skill_id,
    COUNT(*) as count,
    array_agg(DISTINCT status) as statuses
FROM generation_queue
WHERE skill_id = 'd9515a13-b9be-4bb1-9cf3-a928f813e55d'
   OR skill_id NOT IN (SELECT skill_id::text FROM skills_master WHERE skill_id IS NOT NULL)
   OR skill_id IS NULL
GROUP BY skill_id
ORDER BY count DESC
LIMIT 10;