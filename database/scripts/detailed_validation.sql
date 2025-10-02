-- Detailed Career Validation

-- 1. Distribution by grade level
SELECT
    grade_category,
    COUNT(*) as total,
    COUNT(CASE WHEN access_tier = 'basic' THEN 1 END) as basic,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium,
    ROUND(100.0 * COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) / COUNT(*), 1) as premium_percentage
FROM career_paths
WHERE access_tier IS NOT NULL
GROUP BY grade_category
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
        ELSE 4
    END;

-- 2. List some premium careers by grade
SELECT
    grade_category,
    array_agg(career_name || ' ' || icon ORDER BY career_name) as premium_careers
FROM career_paths
WHERE access_tier = 'premium'
GROUP BY grade_category
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
        ELSE 4
    END;

-- 3. Data quality check
SELECT
    'Data Quality' as check_type,
    COUNT(*) as total_careers,
    COUNT(icon) as with_icon,
    COUNT(color) as with_color,
    COUNT(description) as with_description,
    COUNT(CASE WHEN array_length(required_skills, 1) > 0 THEN 1 END) as with_skills,
    COUNT(CASE WHEN array_length(daily_tasks, 1) > 0 THEN 1 END) as with_tasks
FROM career_paths
WHERE access_tier IS NOT NULL;

-- 4. Sample of careers with complete data
SELECT
    career_name,
    icon,
    access_tier,
    grade_category,
    CASE
        WHEN description IS NOT NULL
            AND array_length(required_skills, 1) > 0
            AND icon IS NOT NULL
        THEN '✅ Complete'
        ELSE '⚠️ Partial'
    END as data_status
FROM career_paths
WHERE access_tier IS NOT NULL
ORDER BY
    CASE
        WHEN description IS NOT NULL
            AND array_length(required_skills, 1) > 0
        THEN 0
        ELSE 1
    END,
    career_name
LIMIT 20;