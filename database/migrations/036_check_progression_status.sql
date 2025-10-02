-- Check progression status and identify issues

-- ============================================
-- 1. Check for duplicate careers
-- ============================================
SELECT 'DUPLICATE CAREERS CHECK:' as section;

SELECT
    career_name,
    COUNT(*) as duplicate_count,
    STRING_AGG(DISTINCT grade_category::text, ', ') as categories,
    STRING_AGG(DISTINCT access_tier::text, ', ') as tiers,
    STRING_AGG(id::text, ', ') as ids
FROM career_paths
WHERE is_active = true
GROUP BY career_name
HAVING COUNT(*) > 1
ORDER BY career_name;

-- ============================================
-- 2. Show progression by grade
-- ============================================
SELECT 'PROGRESSION BY GRADE:' as section;

-- What Kindergarten sees (Elementary only, intra-category)
SELECT 'Kindergarten (Elementary Intra):' as grade_level,
    COUNT(*) as total,
    COUNT(CASE WHEN access_tier = 'select' THEN 1 END) as select_tier,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_tier
FROM career_paths
WHERE grade_category = 'elementary'
    AND min_grade_level_num <= 0
    AND is_active = true;

-- What Grade 2 sees (Elementary only, intra-category)
SELECT 'Grade 2 (Elementary Intra):' as grade_level,
    COUNT(*) as total,
    COUNT(CASE WHEN access_tier = 'select' THEN 1 END) as select_tier,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_tier
FROM career_paths
WHERE grade_category = 'elementary'
    AND min_grade_level_num <= 2
    AND is_active = true;

-- What Grade 4 sees (Elementary only, intra-category)
SELECT 'Grade 4 (Elementary Intra):' as grade_level,
    COUNT(*) as total,
    COUNT(CASE WHEN access_tier = 'select' THEN 1 END) as select_tier,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_tier
FROM career_paths
WHERE grade_category = 'elementary'
    AND min_grade_level_num <= 4
    AND is_active = true;

-- What Grade 6 sees (ALL Elementary + ALL Middle, inter-category)
SELECT 'Grade 6 (Elem + Middle Inter):' as grade_level,
    COUNT(*) as total,
    COUNT(CASE WHEN access_tier = 'select' THEN 1 END) as select_tier,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_tier
FROM career_paths
WHERE grade_category IN ('elementary', 'middle')
    AND is_active = true;

-- What Grade 9 sees (ALL careers, full inter-category)
SELECT 'Grade 9 (All Inter):' as grade_level,
    COUNT(*) as total,
    COUNT(CASE WHEN access_tier = 'select' THEN 1 END) as select_tier,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_tier
FROM career_paths
WHERE is_active = true;

-- ============================================
-- 3. Category distribution
-- ============================================
SELECT 'CATEGORY DISTRIBUTION:' as section;

SELECT
    grade_category,
    COUNT(*) as total_careers,
    COUNT(CASE WHEN access_tier = 'select' THEN 1 END) as select_tier,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_tier,
    STRING_AGG(DISTINCT min_grade_level::text, ', ') as unlock_grades
FROM career_paths
WHERE is_active = true
GROUP BY grade_category
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
        ELSE 4
    END;

-- ============================================
-- 4. Elementary intra-category breakdown
-- ============================================
SELECT 'ELEMENTARY INTRA-CATEGORY:' as section;

SELECT
    min_grade_level,
    COUNT(*) as careers_unlocked,
    COUNT(CASE WHEN access_tier = 'select' THEN 1 END) as select_tier,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_tier,
    STRING_AGG(career_name, ', ' ORDER BY career_name) as career_names
FROM career_paths
WHERE grade_category = 'elementary'
    AND is_active = true
GROUP BY min_grade_level
ORDER BY
    CASE min_grade_level
        WHEN 'K' THEN 0
        WHEN '1' THEN 1
        WHEN '2' THEN 2
        WHEN '3' THEN 3
        WHEN '4' THEN 4
        WHEN '5' THEN 5
        ELSE 99
    END;

-- ============================================
-- 5. Check Therapist specifically
-- ============================================
SELECT 'THERAPIST CHECK:' as section;

SELECT
    career_name,
    grade_category,
    min_grade_level,
    min_grade_level_num,
    access_tier,
    CASE
        WHEN grade_category = 'high' AND min_grade_level_num >= 9 THEN '✅ CORRECT - High School Only'
        ELSE '❌ WRONG - Will show in Elementary!'
    END as status
FROM career_paths
WHERE career_name = 'Therapist'
    AND is_active = true;

-- ============================================
-- 6. Kindergarten careers detail (Select tier)
-- ============================================
SELECT 'KINDERGARTEN SELECT CAREERS:' as section;

SELECT
    career_name,
    grade_category,
    min_grade_level,
    access_tier
FROM career_paths
WHERE grade_category = 'elementary'
    AND min_grade_level = 'K'
    AND access_tier = 'select'
    AND is_active = true
ORDER BY career_name;

-- ============================================
-- 7. Find careers with NULL or wrong category
-- ============================================
SELECT 'PROBLEMATIC CAREERS:' as section;

-- Careers with NULL grade_category
SELECT
    'NULL Category:' as issue,
    career_name,
    grade_category,
    min_grade_level,
    min_grade_level_num
FROM career_paths
WHERE grade_category IS NULL
    AND is_active = true
LIMIT 10;

-- Careers with NULL min_grade_level_num
SELECT
    'NULL Grade Num:' as issue,
    career_name,
    grade_category,
    min_grade_level,
    min_grade_level_num
FROM career_paths
WHERE min_grade_level_num IS NULL
    AND is_active = true
LIMIT 10;

-- Careers that might be in wrong category
SELECT
    'Possibly Wrong Category:' as issue,
    career_name,
    grade_category,
    min_grade_level,
    min_grade_level_num
FROM career_paths
WHERE is_active = true
    AND (
        -- Elementary careers with high grade requirements
        (grade_category = 'elementary' AND min_grade_level_num > 5)
        OR
        -- Middle careers starting too early or too late
        (grade_category = 'middle' AND (min_grade_level_num < 6 OR min_grade_level_num > 8))
        OR
        -- High school careers starting too early
        (grade_category = 'high' AND min_grade_level_num < 9)
    )
ORDER BY grade_category, career_name;