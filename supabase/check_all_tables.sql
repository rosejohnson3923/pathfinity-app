-- Check all tables in the database
SELECT 
    'ALL TABLES' as section,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;