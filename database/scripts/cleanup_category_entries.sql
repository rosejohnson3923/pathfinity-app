-- Cleanup script to remove category entries that aren't actual careers

-- First, let's verify these are the entries to remove
SELECT
    '🗑️ ENTRIES TO REMOVE (not actual careers)' as action,
    career_code,
    career_name,
    icon,
    grade_category,
    created_at
FROM career_paths
WHERE career_code IN (
    'architecture',
    'computer_science',
    'data_science',
    'education',
    'engineering',
    'finance',
    'law',
    'marketing',
    'medicine',
    'research'
)
ORDER BY career_code;

-- Remove these category entries (uncomment to execute)
/*
DELETE FROM career_paths
WHERE career_code IN (
    'architecture',
    'computer_science',
    'data_science',
    'education',
    'engineering',
    'finance',
    'law',
    'marketing',
    'medicine',
    'research'
);
*/

-- After cleanup, verify the results
SELECT
    '✅ AFTER CLEANUP' as status,
    COUNT(*) as total_careers,
    COUNT(CASE WHEN access_tier = 'basic' THEN 1 END) as basic_careers,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_careers,
    COUNT(CASE WHEN icon IS NULL THEN 1 END) as careers_without_icons
FROM career_paths;