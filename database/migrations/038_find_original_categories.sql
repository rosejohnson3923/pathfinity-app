-- Find the original career_category values (lowercase = original)
-- These were used in Learn, Experience, Discover containers

-- ============================================
-- 1. Find all lowercase career_category values
-- ============================================
SELECT 'ORIGINAL LOWERCASE CATEGORIES:' as info;

SELECT DISTINCT
    career_category,
    COUNT(*) as career_count
FROM career_paths
WHERE career_category = LOWER(career_category)  -- lowercase means original
    AND is_active = true
GROUP BY career_category
ORDER BY career_category;

-- ============================================
-- 2. Show careers by original category
-- ============================================
SELECT 'CAREERS BY ORIGINAL CATEGORY:' as info;

-- Community careers (likely elementary)
SELECT 'community:' as category,
    COUNT(*) as count,
    STRING_AGG(career_name, ', ' ORDER BY career_name) as careers
FROM career_paths
WHERE career_category = 'community'
    AND is_active = true;

-- Healthcare careers
SELECT 'healthcare:' as category,
    COUNT(*) as count,
    STRING_AGG(career_name, ', ' ORDER BY career_name) as careers
FROM career_paths
WHERE career_category = 'healthcare'
    AND is_active = true;

-- Technology careers
SELECT 'technology:' as category,
    COUNT(*) as count,
    STRING_AGG(career_name, ', ' ORDER BY career_name) as careers
FROM career_paths
WHERE career_category = 'technology'
    AND is_active = true;

-- Arts careers
SELECT 'arts:' as category,
    COUNT(*) as count,
    STRING_AGG(career_name, ', ' ORDER BY career_name) as careers
FROM career_paths
WHERE career_category = 'arts'
    AND is_active = true;

-- Science careers
SELECT 'science:' as category,
    COUNT(*) as count,
    STRING_AGG(career_name, ', ' ORDER BY career_name) as careers
FROM career_paths
WHERE career_category = 'science'
    AND is_active = true;

-- ============================================
-- 3. Show all distinct career_category values
-- ============================================
SELECT 'ALL CAREER_CATEGORY VALUES:' as info;

SELECT
    career_category,
    CASE
        WHEN career_category = LOWER(career_category) THEN 'original (lowercase)'
        ELSE 'added later (mixed case)'
    END as type,
    COUNT(*) as count
FROM career_paths
WHERE is_active = true
GROUP BY career_category
ORDER BY
    CASE
        WHEN career_category = LOWER(career_category) THEN 0
        ELSE 1
    END,
    career_category;

-- ============================================
-- 4. Map original categories to grade levels
-- ============================================
SELECT 'ORIGINAL CATEGORY MAPPING:' as info;

SELECT
    career_category,
    MIN(min_grade_level) as min_grade,
    MAX(min_grade_level) as max_grade,
    COUNT(*) as career_count,
    COUNT(CASE WHEN access_tier = 'select' THEN 1 END) as select_count,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_count
FROM career_paths
WHERE career_category = LOWER(career_category)  -- original categories only
    AND is_active = true
GROUP BY career_category
ORDER BY career_category;

-- ============================================
-- 5. Check what the containers are using
-- ============================================
SELECT 'CONTAINER CATEGORY CHECK:' as info;

-- Show some examples from each original category
SELECT
    career_category,
    career_name,
    grade_category,
    min_grade_level,
    access_tier
FROM career_paths
WHERE career_category IN ('community', 'healthcare', 'technology', 'arts', 'science')
    AND is_active = true
ORDER BY career_category, career_name
LIMIT 30;