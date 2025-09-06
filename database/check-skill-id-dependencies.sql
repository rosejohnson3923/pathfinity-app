-- Check all tables that reference skill_id to ensure consistency
-- This script identifies all tables with skill_id columns and their relationships

-- 1. Find all tables with skill_id column
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE column_name = 'skill_id'
AND table_schema = 'public'
ORDER BY table_name;

-- 2. Check user_skills table
SELECT 
    'user_skills' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT skill_id) as unique_skills,
    COUNT(CASE WHEN skill_id NOT IN (SELECT skill_id FROM skills_master WHERE skill_id IS NOT NULL) THEN 1 END) as orphaned_skills
FROM user_skills;

-- 3. Check user_skill_progress table
SELECT 
    'user_skill_progress' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT skill_id) as unique_skills,
    COUNT(CASE WHEN skill_id NOT IN (SELECT skill_id FROM skills_master WHERE skill_id IS NOT NULL) THEN 1 END) as orphaned_skills
FROM user_skill_progress;

-- 4. Check generated_content table
SELECT 
    'generated_content' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT skill_id) as unique_skills,
    COUNT(CASE WHEN skill_id NOT IN (SELECT skill_id FROM skills_master WHERE skill_id IS NOT NULL) THEN 1 END) as orphaned_skills
FROM generated_content;

-- 5. Check content_generation_queue table
SELECT 
    'content_generation_queue' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT skill_id) as unique_skills,
    COUNT(CASE WHEN skill_id NOT IN (SELECT skill_id FROM skills_master WHERE skill_id IS NOT NULL) THEN 1 END) as orphaned_skills
FROM content_generation_queue;

-- 6. Check skill_prerequisites table if it exists
SELECT 
    'skill_prerequisites' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT skill_id) as unique_skills,
    COUNT(DISTINCT prerequisite_skill_id) as unique_prerequisites,
    COUNT(CASE WHEN skill_id NOT IN (SELECT skill_id FROM skills_master WHERE skill_id IS NOT NULL) THEN 1 END) as orphaned_skills,
    COUNT(CASE WHEN prerequisite_skill_id NOT IN (SELECT skill_id FROM skills_master WHERE skill_id IS NOT NULL) THEN 1 END) as orphaned_prerequisites
FROM skill_prerequisites;

-- 7. Check skill_assessments table if it exists
SELECT 
    'skill_assessments' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT skill_id) as unique_skills,
    COUNT(CASE WHEN skill_id NOT IN (SELECT skill_id FROM skills_master WHERE skill_id IS NOT NULL) THEN 1 END) as orphaned_skills
FROM skill_assessments;

-- 8. Find all foreign key constraints referencing skill_id
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND ccu.column_name = 'skill_id'
ORDER BY tc.table_name;

-- 9. Summary of all skill_id issues
WITH skill_id_issues AS (
    SELECT 'generation_queue' as table_name, skill_id 
    FROM generation_queue 
    WHERE skill_id NOT IN (SELECT skill_id FROM skills_master WHERE skill_id IS NOT NULL)
    UNION ALL
    SELECT 'user_skills' as table_name, skill_id 
    FROM user_skills 
    WHERE skill_id NOT IN (SELECT skill_id FROM skills_master WHERE skill_id IS NOT NULL)
    UNION ALL
    SELECT 'user_skill_progress' as table_name, skill_id 
    FROM user_skill_progress 
    WHERE skill_id NOT IN (SELECT skill_id FROM skills_master WHERE skill_id IS NOT NULL)
    UNION ALL
    SELECT 'generated_content' as table_name, skill_id 
    FROM generated_content 
    WHERE skill_id NOT IN (SELECT skill_id FROM skills_master WHERE skill_id IS NOT NULL)
)
SELECT 
    table_name,
    COUNT(*) as orphaned_records,
    array_agg(DISTINCT skill_id) as sample_orphaned_ids
FROM skill_id_issues
GROUP BY table_name
ORDER BY orphaned_records DESC;