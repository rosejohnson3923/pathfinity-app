-- Check the progressive career unlock system
-- The system uses min_grade_level_num to progressively unlock careers

-- Check distribution of min_grade_level_num values
SELECT
    min_grade_level_num,
    COUNT(*) as career_count,
    STRING_AGG(career_name, ', ' ORDER BY career_name) as example_careers
FROM career_paths
WHERE is_active = true
GROUP BY min_grade_level_num
ORDER BY min_grade_level_num;

-- Check how many careers each grade level would see
WITH grade_levels AS (
    SELECT 0 as grade_num, 'K' as grade_label
    UNION ALL SELECT 1, '1'
    UNION ALL SELECT 2, '2'
    UNION ALL SELECT 3, '3'
    UNION ALL SELECT 4, '4'
    UNION ALL SELECT 5, '5'
    UNION ALL SELECT 6, '6'
    UNION ALL SELECT 7, '7'
    UNION ALL SELECT 8, '8'
    UNION ALL SELECT 9, '9'
    UNION ALL SELECT 10, '10'
    UNION ALL SELECT 11, '11'
    UNION ALL SELECT 12, '12'
)
SELECT
    gl.grade_label,
    gl.grade_num,
    COUNT(cp.*) as careers_available,
    COUNT(CASE WHEN cp.access_tier = 'select' THEN 1 END) as select_careers,
    COUNT(CASE WHEN cp.access_tier = 'premium' THEN 1 END) as premium_careers
FROM grade_levels gl
LEFT JOIN career_paths cp ON cp.min_grade_level_num <= gl.grade_num
    AND cp.is_active = true
GROUP BY gl.grade_label, gl.grade_num
ORDER BY gl.grade_num;

-- Show careers that unlock at each grade (not cumulative)
SELECT
    min_grade_level_num as unlocks_at_grade,
    grade_category,
    access_tier,
    COUNT(*) as new_careers,
    STRING_AGG(career_name, ', ' ORDER BY career_name) as careers
FROM career_paths
WHERE is_active = true
  AND min_grade_level_num IS NOT NULL
GROUP BY min_grade_level_num, grade_category, access_tier
ORDER BY min_grade_level_num, grade_category, access_tier;

-- Check if min_grade_level_num = 0 for all (which would break progression)
SELECT
    CASE
        WHEN min_grade_level_num = 0 THEN 'All at Kindergarten (NO PROGRESSION!)'
        WHEN min_grade_level_num IS NULL THEN 'NULL (undefined)'
        ELSE 'Has progression value'
    END as status,
    COUNT(*) as count
FROM career_paths
WHERE is_active = true
GROUP BY
    CASE
        WHEN min_grade_level_num = 0 THEN 'All at Kindergarten (NO PROGRESSION!)'
        WHEN min_grade_level_num IS NULL THEN 'NULL (undefined)'
        ELSE 'Has progression value'
    END;