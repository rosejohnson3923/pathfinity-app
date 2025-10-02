-- ================================================
-- Validate Career Migration Results
-- ================================================

-- 1. SUMMARY: Total careers by tier
SELECT
    '📊 CAREER SUMMARY' as report_section,
    COUNT(*) as total_careers,
    COUNT(CASE WHEN access_tier = 'basic' THEN 1 END) as basic_careers,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_careers,
    COUNT(CASE WHEN access_tier IS NULL THEN 1 END) as no_tier_assigned
FROM career_paths;

-- 2. BREAKDOWN BY GRADE CATEGORY AND TIER
SELECT
    '📚 BY GRADE LEVEL' as report_section,
    COALESCE(grade_category, 'UNASSIGNED') as grade_level,
    access_tier,
    COUNT(*) as career_count
FROM career_paths
GROUP BY grade_category, access_tier
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
        ELSE 4
    END,
    access_tier DESC;

-- 3. LIST ALL CAREERS WITH DETAILS
SELECT
    '🎯 ALL CAREERS' as report_section,
    career_code,
    career_name,
    access_tier,
    grade_category,
    icon,
    color,
    CASE
        WHEN description IS NOT NULL THEN '✓'
        ELSE '✗'
    END as has_description,
    CASE
        WHEN daily_tasks IS NOT NULL AND array_length(daily_tasks, 1) > 0 THEN '✓'
        ELSE '✗'
    END as has_tasks,
    CASE
        WHEN required_skills IS NOT NULL AND array_length(required_skills, 1) > 0 THEN '✓'
        ELSE '✗'
    END as has_skills
FROM career_paths
ORDER BY
    access_tier DESC,
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
        ELSE 4
    END,
    career_name;

-- 4. PREMIUM CAREERS LIST
SELECT
    '💎 PREMIUM CAREERS' as report_section,
    career_code,
    career_name,
    grade_category,
    icon
FROM career_paths
WHERE access_tier = 'premium'
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
        ELSE 4
    END,
    career_name;

-- 5. BASIC CAREERS LIST
SELECT
    '📖 BASIC CAREERS' as report_section,
    career_code,
    career_name,
    grade_category,
    icon
FROM career_paths
WHERE access_tier = 'basic'
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
        ELSE 4
    END,
    career_name;

-- 6. DATA COMPLETENESS CHECK
SELECT
    '✅ DATA COMPLETENESS' as report_section,
    COUNT(*) as total,
    COUNT(career_code) as has_code,
    COUNT(career_name) as has_name,
    COUNT(icon) as has_icon,
    COUNT(color) as has_color,
    COUNT(description) as has_description,
    COUNT(CASE WHEN array_length(daily_tasks, 1) > 0 THEN 1 END) as has_tasks,
    COUNT(CASE WHEN array_length(required_skills, 1) > 0 THEN 1 END) as has_skills,
    COUNT(access_tier) as has_tier,
    COUNT(grade_category) as has_grade_category
FROM career_paths;

-- 7. CHECK FOR DUPLICATES
SELECT
    '🔍 DUPLICATE CHECK' as report_section,
    career_code,
    COUNT(*) as duplicate_count
FROM career_paths
GROUP BY career_code
HAVING COUNT(*) > 1;

-- 8. CAREERS WITHOUT TIER ASSIGNMENT (if any)
SELECT
    '⚠️ CAREERS WITHOUT TIER' as report_section,
    career_code,
    career_name,
    grade_category
FROM career_paths
WHERE access_tier IS NULL
ORDER BY career_name;

-- 9. SAMPLE PREMIUM CAREERS WITH FULL DATA
SELECT
    '🌟 SAMPLE PREMIUM CAREERS WITH DETAILS' as report_section,
    career_code,
    career_name,
    grade_category,
    icon,
    description,
    array_to_string(required_skills, ', ') as skills,
    array_to_string(daily_tasks, ' | ') as tasks
FROM career_paths
WHERE access_tier = 'premium'
    AND description IS NOT NULL
LIMIT 5;

-- 10. FINAL VALIDATION
SELECT
    '✨ FINAL VALIDATION' as report_section,
    CASE
        WHEN (SELECT COUNT(*) FROM career_paths WHERE access_tier IS NOT NULL) >= 70
        THEN '✅ Migration Successful: ' || (SELECT COUNT(*) FROM career_paths WHERE access_tier IS NOT NULL) || ' careers with tiers'
        ELSE '⚠️ Migration Incomplete: Only ' || (SELECT COUNT(*) FROM career_paths WHERE access_tier IS NOT NULL) || ' careers with tiers'
    END as status,
    CASE
        WHEN (SELECT COUNT(*) FROM career_paths WHERE access_tier = 'premium') >= 20
        THEN '✅ Premium tier populated: ' || (SELECT COUNT(*) FROM career_paths WHERE access_tier = 'premium') || ' premium careers'
        ELSE '⚠️ Low premium count: Only ' || (SELECT COUNT(*) FROM career_paths WHERE access_tier = 'premium') || ' premium careers'
    END as premium_status;