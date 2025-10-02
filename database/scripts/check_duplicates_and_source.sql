-- Check for duplicate career codes
SELECT
    career_code,
    COUNT(*) as count,
    array_agg(career_name) as names,
    array_agg(created_at) as created_times
FROM career_paths
GROUP BY career_code
HAVING COUNT(*) > 1
ORDER BY count DESC, career_code;

-- Check when careers were created to see different migration batches
SELECT
    DATE(created_at) as migration_date,
    TO_CHAR(created_at, 'HH24:MI:SS') as time,
    COUNT(*) as careers_added,
    array_agg(career_name ORDER BY career_name) as career_names
FROM career_paths
GROUP BY DATE(created_at), TO_CHAR(created_at, 'HH24:MI:SS')
ORDER BY migration_date, time;

-- Show all careers with their creation timestamps
SELECT
    career_code,
    career_name,
    access_tier,
    created_at,
    updated_at
FROM career_paths
ORDER BY created_at, career_code
LIMIT 20;

-- Count total unique career codes
SELECT
    COUNT(DISTINCT career_code) as unique_careers,
    COUNT(*) as total_rows
FROM career_paths;