-- Verify Career Migration Results

-- 1. Check career distribution by tier
SELECT
    access_tier,
    COUNT(*) as count
FROM career_paths
GROUP BY access_tier
ORDER BY access_tier;

-- 2. Check careers by grade category
SELECT
    grade_category,
    access_tier,
    COUNT(*) as count
FROM career_paths
WHERE grade_category IS NOT NULL
GROUP BY grade_category, access_tier
ORDER BY grade_category, access_tier;

-- 3. List all careers with their tier assignments
SELECT
    career_code,
    career_name,
    access_tier,
    grade_category,
    min_grade_level,
    icon,
    salary_range
FROM career_paths
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
        ELSE 4
    END,
    access_tier,
    career_name;

-- 4. Check if premium fields were populated
SELECT
    career_code,
    career_name,
    CASE
        WHEN daily_tasks IS NOT NULL AND array_length(daily_tasks, 1) > 0 THEN '✓ Has daily tasks'
        ELSE '✗ No daily tasks'
    END as daily_tasks_status,
    CASE
        WHEN salary_range IS NOT NULL THEN '✓ Has salary'
        ELSE '✗ No salary'
    END as salary_status,
    CASE
        WHEN required_skills IS NOT NULL AND array_length(required_skills, 1) > 0 THEN '✓ Has skills'
        ELSE '✗ No skills'
    END as skills_status
FROM career_paths
WHERE access_tier IS NOT NULL
LIMIT 10;

-- 5. Summary
SELECT
    'Migration Summary' as report,
    (SELECT COUNT(*) FROM career_paths WHERE access_tier = 'basic') as basic_careers,
    (SELECT COUNT(*) FROM career_paths WHERE access_tier = 'premium') as premium_careers,
    (SELECT COUNT(*) FROM career_paths WHERE access_tier IS NOT NULL) as total_migrated,
    (SELECT COUNT(*) FROM career_paths WHERE access_tier IS NULL) as not_migrated;