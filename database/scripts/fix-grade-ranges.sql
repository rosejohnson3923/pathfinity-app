-- ================================================
-- Fix grade level ranges to be appropriate
-- ================================================

-- Fix elementary careers (should be K-5)
UPDATE career_paths
SET
    min_grade_level = 'K',
    max_grade_level = '5'
WHERE grade_category = 'elementary';

-- Fix middle school careers (should be 6-8)
UPDATE career_paths
SET
    min_grade_level = '6',
    max_grade_level = '8'
WHERE grade_category = 'middle';

-- Fix high school careers (should be 9-12)
UPDATE career_paths
SET
    min_grade_level = '9',
    max_grade_level = '12'
WHERE grade_category = 'high';

-- Verify the fix
SELECT
    grade_category,
    access_tier,
    COUNT(*) as count,
    MIN(min_grade_level) as min_grade,
    MAX(max_grade_level) as max_grade
FROM career_paths
GROUP BY grade_category, access_tier
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
    END,
    access_tier;

-- Show a few examples from each category
SELECT
    career_code,
    career_name,
    grade_category,
    min_grade_level,
    max_grade_level,
    access_tier
FROM career_paths
WHERE grade_category = 'elementary'
LIMIT 5;

SELECT
    career_code,
    career_name,
    grade_category,
    min_grade_level,
    max_grade_level,
    access_tier
FROM career_paths
WHERE grade_category = 'middle'
LIMIT 5;

SELECT
    career_code,
    career_name,
    grade_category,
    min_grade_level,
    max_grade_level,
    access_tier
FROM career_paths
WHERE grade_category = 'high'
LIMIT 5;