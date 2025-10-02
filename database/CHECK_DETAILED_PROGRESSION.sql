-- Detailed check of the progression system

-- 1. See the actual distribution of min_grade_level_num
SELECT
    min_grade_level_num,
    grade_category,
    COUNT(*) as count,
    STRING_AGG(career_name, ', ' ORDER BY career_name LIMIT 5) as example_careers
FROM career_paths
WHERE is_active = true
GROUP BY min_grade_level_num, grade_category
ORDER BY min_grade_level_num, grade_category;

-- 2. Check careers that have min_grade_level_num = 0 (available from K)
SELECT
    career_name,
    grade_category,
    access_tier,
    min_grade_level,
    min_grade_level_num
FROM career_paths
WHERE min_grade_level_num = 0
  AND is_active = true
ORDER BY grade_category, career_name
LIMIT 20;

-- 3. Check careers with proper progression (min_grade_level_num > 0)
SELECT
    career_name,
    grade_category,
    min_grade_level_num,
    access_tier
FROM career_paths
WHERE min_grade_level_num > 0
  AND is_active = true
ORDER BY min_grade_level_num, career_name
LIMIT 20;

-- 4. See how many careers a student would see at each grade
SELECT
    grade_num,
    CASE grade_num
        WHEN 0 THEN 'K'
        ELSE CAST(grade_num AS VARCHAR)
    END as grade,
    COUNT(*) as total_careers
FROM (
    SELECT 0 as grade_num UNION ALL
    SELECT 3 UNION ALL
    SELECT 6 UNION ALL
    SELECT 9 UNION ALL
    SELECT 12
) grades
CROSS JOIN LATERAL (
    SELECT * FROM career_paths
    WHERE is_active = true
      AND (min_grade_level_num IS NULL OR min_grade_level_num <= grades.grade_num)
) cp
GROUP BY grade_num
ORDER BY grade_num;