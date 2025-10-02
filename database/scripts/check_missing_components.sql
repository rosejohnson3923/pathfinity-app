-- Check which specific components are missing

-- 1. Check which columns exist in career_paths
SELECT
    'Checking career_paths columns:' as check_type;
SELECT
    column_name,
    CASE
        WHEN column_name IN ('access_tier', 'min_grade_level', 'grade_category') THEN '✓ FOUND'
        ELSE '✗ MISSING'
    END as status
FROM (
    VALUES
        ('access_tier'),
        ('min_grade_level'),
        ('max_grade_level'),
        ('grade_category'),
        ('daily_tasks'),
        ('salary_range')
) AS expected(column_name)
LEFT JOIN information_schema.columns c
    ON c.table_name = 'career_paths'
    AND c.column_name = expected.column_name
ORDER BY column_name;

-- 2. Check which tables exist
SELECT
    'Checking tables:' as check_type;
SELECT
    table_name,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables t
            WHERE t.table_name = expected.table_name
            AND t.table_schema = 'public'
        ) THEN '✓ EXISTS'
        ELSE '✗ MISSING'
    END as status
FROM (
    VALUES
        ('subscription_tiers'),
        ('tenant_subscriptions'),
        ('career_access_events'),
        ('premium_conversion_funnel')
) AS expected(table_name)
ORDER BY table_name;

-- 3. Check which views exist
SELECT
    'Checking views:' as check_type;
SELECT
    view_name,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_views v
            WHERE v.viewname = expected.view_name
            AND v.schemaname = 'public'
        ) THEN '✓ EXISTS'
        ELSE '✗ MISSING'
    END as status
FROM (
    VALUES
        ('premium_conversion_metrics'),
        ('high_value_premium_careers'),
        ('subscription_metrics')
) AS expected(view_name)
ORDER BY view_name;

-- 4. List actual columns in career_paths that were added
SELECT
    'Actual career_paths columns:' as check_type;
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'career_paths'
AND column_name LIKE '%tier%'
   OR column_name LIKE '%grade%'
   OR column_name LIKE '%premium%'
   OR column_name LIKE '%daily%'
   OR column_name LIKE '%salary%'
   OR column_name LIKE '%skill%'
ORDER BY column_name;

-- 5. List actual tables created
SELECT
    'Actual tables in database:' as check_type;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND (table_name LIKE '%subscription%'
     OR table_name LIKE '%premium%'
     OR table_name LIKE '%tier%'
     OR table_name LIKE '%access%')
ORDER BY table_name;