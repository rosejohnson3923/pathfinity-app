-- ================================================
-- Fix ALL NULL values in career_paths table
-- ================================================

-- 1. SHOW CURRENT STATE
SELECT
    '📊 NULL VALUES REPORT' as report,
    COUNT(*) as total_careers,
    COUNT(CASE WHEN icon IS NULL THEN 1 END) as null_icon,
    COUNT(CASE WHEN color IS NULL THEN 1 END) as null_color,
    COUNT(CASE WHEN grade_category IS NULL THEN 1 END) as null_grade_category,
    COUNT(CASE WHEN min_grade_level IS NULL THEN 1 END) as null_min_grade,
    COUNT(CASE WHEN max_grade_level IS NULL THEN 1 END) as null_max_grade,
    COUNT(CASE WHEN daily_tasks IS NULL OR array_length(daily_tasks, 1) IS NULL THEN 1 END) as null_daily_tasks,
    COUNT(CASE WHEN required_skills IS NULL OR array_length(required_skills, 1) IS NULL THEN 1 END) as null_required_skills,
    COUNT(CASE WHEN description IS NULL THEN 1 END) as null_description
FROM career_paths;

-- 2. FIX GRADE CATEGORY based on career patterns
UPDATE career_paths
SET grade_category = CASE
    -- Elementary careers (based on typical elementary careers)
    WHEN career_name ILIKE '%teacher%' AND career_name ILIKE '%elementary%' THEN 'elementary'
    WHEN career_name IN ('Firefighter', 'Police Officer', 'Nurse', 'Mail Carrier', 'Librarian', 'School Principal') THEN 'elementary'
    WHEN career_name ILIKE '%helper%' THEN 'elementary'

    -- High school careers (advanced/specialized)
    WHEN career_name ILIKE '%engineer%' THEN 'high'
    WHEN career_name ILIKE '%scientist%' THEN 'high'
    WHEN career_name ILIKE '%developer%' THEN 'high'
    WHEN career_name ILIKE '%analyst%' THEN 'high'
    WHEN career_name ILIKE '%designer%' AND career_name NOT ILIKE '%game%' THEN 'high'
    WHEN career_name ILIKE '%architect%' THEN 'high'
    WHEN career_name ILIKE '%lawyer%' THEN 'high'
    WHEN career_name ILIKE '%surgeon%' THEN 'high'
    WHEN career_name IN ('Investment Banker', 'Venture Capitalist', 'Hedge Fund Manager') THEN 'high'

    -- Middle school careers (everything else)
    ELSE 'middle'
END
WHERE grade_category IS NULL;

-- 3. FIX MIN/MAX GRADE LEVELS based on category
UPDATE career_paths
SET
    min_grade_level = CASE
        WHEN grade_category = 'elementary' THEN 'K'
        WHEN grade_category = 'middle' THEN '6'
        WHEN grade_category = 'high' THEN '9'
        ELSE 'K'
    END,
    max_grade_level = CASE
        WHEN grade_category = 'elementary' THEN '5'
        WHEN grade_category = 'middle' THEN '8'
        WHEN grade_category = 'high' THEN '12'
        ELSE '12'
    END
WHERE min_grade_level IS NULL OR max_grade_level IS NULL;

-- 4. FIX MISSING ICONS with appropriate defaults
UPDATE career_paths
SET icon = CASE
    -- Technology
    WHEN career_name ILIKE '%developer%' OR career_name ILIKE '%programmer%' THEN '💻'
    WHEN career_name ILIKE '%data%' THEN '📊'
    WHEN career_name ILIKE '%AI%' OR career_name ILIKE '%machine learning%' THEN '🤖'
    WHEN career_name ILIKE '%cyber%' THEN '🔒'

    -- Healthcare
    WHEN career_name ILIKE '%doctor%' OR career_name ILIKE '%surgeon%' THEN '👨‍⚕️'
    WHEN career_name ILIKE '%nurse%' THEN '👩‍⚕️'
    WHEN career_name ILIKE '%dentist%' THEN '🦷'
    WHEN career_name ILIKE '%vet%' THEN '🐾'

    -- Education
    WHEN career_name ILIKE '%teacher%' THEN '👨‍🏫'
    WHEN career_name ILIKE '%principal%' THEN '🏫'
    WHEN career_name ILIKE '%librarian%' THEN '📚'

    -- Creative
    WHEN career_name ILIKE '%artist%' THEN '🎨'
    WHEN career_name ILIKE '%music%' THEN '🎵'
    WHEN career_name ILIKE '%writer%' OR career_name ILIKE '%author%' THEN '✍️'
    WHEN career_name ILIKE '%photographer%' THEN '📸'
    WHEN career_name ILIKE '%chef%' OR career_name ILIKE '%baker%' THEN '👨‍🍳'

    -- Business
    WHEN career_name ILIKE '%CEO%' OR career_name ILIKE '%executive%' THEN '💼'
    WHEN career_name ILIKE '%entrepreneur%' THEN '🚀'
    WHEN career_name ILIKE '%banker%' OR career_name ILIKE '%finance%' THEN '🏦'
    WHEN career_name ILIKE '%lawyer%' OR career_name ILIKE '%attorney%' THEN '⚖️'

    -- Service
    WHEN career_name ILIKE '%police%' THEN '👮'
    WHEN career_name ILIKE '%firefighter%' THEN '🚒'
    WHEN career_name ILIKE '%pilot%' THEN '✈️'
    WHEN career_name ILIKE '%mail%' THEN '📬'

    -- Science
    WHEN career_name ILIKE '%scientist%' THEN '🔬'
    WHEN career_name ILIKE '%astronomer%' THEN '🔭'
    WHEN career_name ILIKE '%biologist%' THEN '🧬'
    WHEN career_name ILIKE '%chemist%' THEN '⚗️'

    -- Sports/Entertainment
    WHEN career_name ILIKE '%athlete%' OR career_name ILIKE '%player%' THEN '⚽'
    WHEN career_name ILIKE '%coach%' THEN '🏆'
    WHEN career_name ILIKE '%actor%' OR career_name ILIKE '%actress%' THEN '🎭'
    WHEN career_name ILIKE '%game%' THEN '🎮'

    -- Engineering/Construction
    WHEN career_name ILIKE '%engineer%' THEN '⚙️'
    WHEN career_name ILIKE '%architect%' THEN '🏗️'
    WHEN career_name ILIKE '%mechanic%' THEN '🔧'

    -- Default
    ELSE '💼'
END
WHERE icon IS NULL;

-- 5. FIX MISSING COLORS with category-appropriate defaults
UPDATE career_paths
SET color = CASE
    WHEN grade_category = 'elementary' THEN
        CASE
            WHEN access_tier = 'premium' THEN '#9333EA'  -- Purple for premium
            ELSE '#3B82F6'  -- Blue for basic elementary
        END
    WHEN grade_category = 'middle' THEN
        CASE
            WHEN access_tier = 'premium' THEN '#DC2626'  -- Red for premium
            ELSE '#10B981'  -- Green for basic middle
        END
    WHEN grade_category = 'high' THEN
        CASE
            WHEN access_tier = 'premium' THEN '#EA580C'  -- Orange for premium
            ELSE '#6366F1'  -- Indigo for basic high
        END
    ELSE '#6B7280'  -- Gray default
END
WHERE color IS NULL;

-- 6. ADD DEFAULT DAILY TASKS
UPDATE career_paths
SET daily_tasks = ARRAY[
    'Explore this career through interactive activities',
    'Learn about the skills needed for this profession',
    'Complete hands-on projects related to this field'
]
WHERE daily_tasks IS NULL OR array_length(daily_tasks, 1) IS NULL;

-- 7. ADD DEFAULT REQUIRED SKILLS
UPDATE career_paths
SET required_skills = CASE
    WHEN grade_category = 'elementary' THEN
        ARRAY['Reading', 'Writing', 'Basic Math', 'Teamwork', 'Listening']
    WHEN grade_category = 'middle' THEN
        ARRAY['Problem Solving', 'Critical Thinking', 'Communication', 'Creativity', 'Technology Skills']
    WHEN grade_category = 'high' THEN
        ARRAY['Advanced Analysis', 'Leadership', 'Project Management', 'Digital Literacy', 'Collaboration']
    ELSE
        ARRAY['Communication', 'Problem Solving', 'Teamwork']
END
WHERE required_skills IS NULL OR array_length(required_skills, 1) IS NULL;

-- 8. ADD DEFAULT DESCRIPTIONS
UPDATE career_paths
SET description = 'Explore the exciting world of ' || career_name || ' through interactive learning experiences designed for your grade level.'
WHERE description IS NULL;

-- 9. VERIFY THE FIXES
SELECT
    '✅ AFTER FIX' as report,
    COUNT(*) as total_careers,
    COUNT(CASE WHEN icon IS NULL THEN 1 END) as null_icon,
    COUNT(CASE WHEN color IS NULL THEN 1 END) as null_color,
    COUNT(CASE WHEN grade_category IS NULL THEN 1 END) as null_grade_category,
    COUNT(CASE WHEN min_grade_level IS NULL THEN 1 END) as null_min_grade,
    COUNT(CASE WHEN max_grade_level IS NULL THEN 1 END) as null_max_grade,
    COUNT(CASE WHEN daily_tasks IS NULL OR array_length(daily_tasks, 1) IS NULL THEN 1 END) as null_daily_tasks,
    COUNT(CASE WHEN required_skills IS NULL OR array_length(required_skills, 1) IS NULL THEN 1 END) as null_required_skills,
    COUNT(CASE WHEN description IS NULL THEN 1 END) as null_description
FROM career_paths;

-- 10. SHOW SAMPLE OF FIXED DATA
SELECT
    career_code,
    career_name,
    icon,
    color,
    grade_category,
    access_tier,
    min_grade_level,
    max_grade_level
FROM career_paths
LIMIT 20;