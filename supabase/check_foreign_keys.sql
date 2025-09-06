-- Check for foreign key relationships involving skills_master
SELECT 
    'FOREIGN KEY CONSTRAINTS' as section,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'skills_master' OR ccu.table_name = 'skills_master');

-- Check for any tables that might reference skill IDs
SELECT 
    'POTENTIAL SKILL REFERENCES' as section,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE column_name ILIKE '%skill%' 
AND table_name != 'skills_master'
ORDER BY table_name, column_name;