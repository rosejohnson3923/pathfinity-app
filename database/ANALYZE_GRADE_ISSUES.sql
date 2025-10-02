-- Analyze grade level field issues in career_paths table

-- Check the mess with grade level fields
SELECT
    'Total careers' as metric,
    COUNT(*) as count
FROM career_paths
UNION ALL
SELECT
    'Has grade_category' as metric,
    COUNT(*) as count
FROM career_paths
WHERE grade_category IS NOT NULL
UNION ALL
SELECT
    'min_grade = K, max_grade = NULL' as metric,
    COUNT(*) as count
FROM career_paths
WHERE min_grade_level = 'K' AND max_grade_level IS NULL
UNION ALL
SELECT
    'min_grade_num = 0' as metric,
    COUNT(*) as count
FROM career_paths
WHERE min_grade_level_num = 0
UNION ALL
SELECT
    'max_grade_num = 12' as metric,
    COUNT(*) as count
FROM career_paths
WHERE max_grade_level_num = 12;

-- Show sample of the problematic data
SELECT
    career_name,
    grade_category,
    min_grade_level,
    max_grade_level,
    min_grade_level_num,
    max_grade_level_num,
    access_tier
FROM career_paths
LIMIT 10;

-- Check grade_category distribution (this seems more reliable)
SELECT
    grade_category,
    access_tier,
    COUNT(*) as count
FROM career_paths
WHERE grade_category IS NOT NULL
GROUP BY grade_category, access_tier
ORDER BY grade_category, access_tier;

-- The problem: min/max grade level fields are garbage
-- The solution: Use ONLY grade_category field which has proper values