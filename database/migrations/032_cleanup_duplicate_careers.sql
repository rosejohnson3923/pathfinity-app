-- Cleanup duplicate careers and NULL grade_category issues

-- ============================================
-- STEP 1: Identify duplicate careers
-- ============================================

-- Show duplicates (same career_name but different records)
SELECT
    career_name,
    COUNT(*) as duplicate_count,
    STRING_AGG(DISTINCT grade_category::text, ', ') as categories,
    STRING_AGG(id::text, ', ') as ids
FROM career_paths
WHERE is_active = true
GROUP BY career_name
HAVING COUNT(*) > 1
ORDER BY career_name;

-- ============================================
-- STEP 2: Delete duplicates with NULL grade_category
-- ============================================

-- Keep the records WITH grade_category, delete the NULL ones when duplicates exist
DELETE FROM career_paths
WHERE id IN (
    SELECT cp1.id
    FROM career_paths cp1
    INNER JOIN career_paths cp2 ON cp1.career_name = cp2.career_name
        AND cp1.id != cp2.id
    WHERE cp1.grade_category IS NULL
        AND cp2.grade_category IS NOT NULL
        AND cp1.is_active = true
        AND cp2.is_active = true
);

-- ============================================
-- STEP 3: Fix remaining NULL grade_category records
-- ============================================

-- For any remaining records with NULL grade_category, set them to 'all'
UPDATE career_paths
SET grade_category = 'all',
    min_grade_level = COALESCE(min_grade_level, 'K'),
    max_grade_level = COALESCE(max_grade_level, '12')
WHERE grade_category IS NULL
  AND is_active = true;

-- ============================================
-- STEP 4: Verify cleanup
-- ============================================

-- Check for remaining duplicates
SELECT
    'Remaining duplicates:' as check_type,
    COUNT(*) as count
FROM (
    SELECT career_name
    FROM career_paths
    WHERE is_active = true
    GROUP BY career_name
    HAVING COUNT(*) > 1
) dup;

-- Check for NULL grade_category
SELECT
    'Records with NULL grade_category:' as check_type,
    COUNT(*) as count
FROM career_paths
WHERE grade_category IS NULL
  AND is_active = true;

-- Show the final progressive structure
SELECT
    grade_category,
    min_grade_level,
    COUNT(*) as career_count,
    COUNT(CASE WHEN access_tier = 'select' THEN 1 END) as select_careers,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_careers,
    STRING_AGG(career_name, ', ' ORDER BY career_name) as example_careers
FROM career_paths
WHERE is_active = true
GROUP BY grade_category, min_grade_level
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
        WHEN 'all' THEN 4
    END,
    CASE
        WHEN min_grade_level = 'K' THEN 0
        ELSE CAST(min_grade_level AS INTEGER)
    END;

-- ============================================
-- STEP 5: Final verification - Progressive career availability
-- ============================================

-- Show how many careers each grade level will see
WITH grade_levels AS (
    SELECT 'K' as grade, 0 as num
    UNION SELECT '1', 1 UNION SELECT '2', 2 UNION SELECT '3', 3
    UNION SELECT '4', 4 UNION SELECT '5', 5 UNION SELECT '6', 6
    UNION SELECT '7', 7 UNION SELECT '8', 8 UNION SELECT '9', 9
    UNION SELECT '10', 10 UNION SELECT '11', 11 UNION SELECT '12', 12
)
SELECT
    gl.grade,
    COUNT(DISTINCT cp.career_name) as unique_careers,
    COUNT(DISTINCT CASE WHEN cp.access_tier = 'select' THEN cp.career_name END) as select_careers,
    COUNT(DISTINCT CASE WHEN cp.access_tier = 'premium' THEN cp.career_name END) as premium_careers
FROM grade_levels gl
LEFT JOIN career_paths cp ON cp.min_grade_level_num <= gl.num
    AND cp.is_active = true
GROUP BY gl.grade, gl.num
ORDER BY gl.num;