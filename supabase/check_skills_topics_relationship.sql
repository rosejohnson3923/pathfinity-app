-- Check if skills_topics table exists and its relationship to skills_master
SELECT 
    'SKILLS_TOPICS SCHEMA' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'skills_topics'
ORDER BY ordinal_position;

-- Check if skills_topics has any data
SELECT 
    'SKILLS_TOPICS COUNT' as section,
    COUNT(*) as count
FROM skills_topics;

-- Check if skills_topics references skills_master
SELECT 
    'SKILLS_TOPICS SAMPLE' as section,
    *
FROM skills_topics 
LIMIT 5;