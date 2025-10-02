-- Cleanup duplicate careers and NULL grade_category issues
-- Fixed version that handles foreign key constraints

-- ============================================
-- STEP 1: Identify duplicate careers
-- ============================================

-- Show duplicates (same career_name but different records)
WITH duplicates AS (
    SELECT
        career_name,
        COUNT(*) as duplicate_count,
        STRING_AGG(DISTINCT grade_category::text, ', ') as categories,
        STRING_AGG(id::text, ', ') as ids
    FROM career_paths
    WHERE is_active = true
    GROUP BY career_name
    HAVING COUNT(*) > 1
)
SELECT * FROM duplicates ORDER BY career_name;

-- ============================================
-- STEP 2: Migrate progressions from duplicates to the keeper record
-- ============================================

-- For each duplicate pair, move progressions from the NULL grade_category record
-- to the record that has a proper grade_category
WITH duplicate_pairs AS (
    SELECT
        cp1.id as delete_id,
        cp2.id as keep_id,
        cp1.career_name
    FROM career_paths cp1
    INNER JOIN career_paths cp2 ON cp1.career_name = cp2.career_name
        AND cp1.id != cp2.id
    WHERE cp1.grade_category IS NULL
        AND cp2.grade_category IS NOT NULL
        AND cp1.is_active = true
        AND cp2.is_active = true
)
UPDATE career_path_progressions cpp
SET base_career_path_id = dp.keep_id
FROM duplicate_pairs dp
WHERE cpp.base_career_path_id = dp.delete_id
  AND NOT EXISTS (
    -- Don't create duplicates in progressions
    SELECT 1 FROM career_path_progressions cpp2
    WHERE cpp2.base_career_path_id = dp.keep_id
      AND cpp2.progression_type = cpp.progression_type
  );

-- Delete any duplicate progressions that couldn't be moved
DELETE FROM career_path_progressions
WHERE base_career_path_id IN (
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
-- STEP 3: Now safe to delete duplicate careers
-- ============================================

-- Delete the duplicates with NULL grade_category
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
-- STEP 4: Fix remaining NULL grade_category records
-- ============================================

-- For any remaining records with NULL grade_category, set them to 'all'
UPDATE career_paths
SET grade_category = 'all',
    min_grade_level = COALESCE(min_grade_level, 'K'),
    max_grade_level = COALESCE(max_grade_level, '12')
WHERE grade_category IS NULL
  AND is_active = true;

-- ============================================
-- STEP 5: Verify cleanup
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
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_careers
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
        WHEN min_grade_level ~ '^\d+$' THEN CAST(min_grade_level AS INTEGER)
        ELSE 999
    END;

-- ============================================
-- STEP 6: Final verification - Progressive career availability
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

-- Show sample careers at key grade transitions
SELECT
    'Sample careers by grade:' as info;

SELECT
    CASE
        WHEN min_grade_level_num = 0 THEN 'Kindergarten'
        WHEN min_grade_level_num = 2 THEN 'Grade 2'
        WHEN min_grade_level_num = 4 THEN 'Grade 4'
        WHEN min_grade_level_num = 6 THEN 'Grade 6'
        WHEN min_grade_level_num = 7 THEN 'Grade 7'
        WHEN min_grade_level_num = 9 THEN 'Grade 9'
        WHEN min_grade_level_num = 10 THEN 'Grade 10'
        WHEN min_grade_level_num = 11 THEN 'Grade 11'
        ELSE 'Other'
    END as unlocks_at,
    COUNT(*) as new_careers,
    STRING_AGG(career_name, ', ' ORDER BY career_name) as careers
FROM career_paths
WHERE is_active = true
  AND min_grade_level_num IN (0, 2, 4, 6, 7, 9, 10, 11)
GROUP BY min_grade_level_num
ORDER BY min_grade_level_num;