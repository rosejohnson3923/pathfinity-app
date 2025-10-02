-- ================================================
-- Validation Queries for Premium System Migration
-- ================================================
-- Run these queries in Supabase SQL Editor to verify the migration

-- 1. CHECK NEW COLUMNS IN career_paths TABLE
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'career_paths'
AND column_name IN (
    'access_tier', 'min_grade_level', 'max_grade_level',
    'grade_category', 'daily_tasks', 'salary_range',
    'premium_selections', 'basic_selections',
    'min_grade_level_num', 'max_grade_level_num'
)
ORDER BY column_name;

-- 2. CHECK NEW TABLES EXIST
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'subscription_tiers',
    'tenant_subscriptions',
    'career_access_events',
    'premium_conversion_funnel'
)
ORDER BY table_name;

-- 3. VERIFY DEFAULT SUBSCRIPTION TIERS WERE INSERTED
SELECT
    tier_code,
    tier_name,
    monthly_price,
    annual_price,
    includes_premium_careers
FROM subscription_tiers
ORDER BY monthly_price;

-- Expected output:
-- basic        | Basic         | 0      | 0       | false
-- premium      | Premium       | 49.00  | 490.00  | true
-- premium_plus | Premium Plus  | 99.00  | 990.00  | true
-- enterprise   | Enterprise    | 499.00 | 4990.00 | true

-- 4. CHECK INDEXES WERE CREATED
SELECT
    indexname,
    tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (
    'idx_career_paths_tier_grade',
    'idx_career_paths_premium',
    'idx_tenant_subscriptions_active',
    'unique_active_subscription_per_tenant'
)
ORDER BY indexname;

-- 5. VERIFY ANALYTICS VIEWS EXIST
SELECT
    viewname
FROM pg_views
WHERE schemaname = 'public'
AND viewname IN (
    'premium_conversion_metrics',
    'high_value_premium_careers',
    'subscription_metrics'
)
ORDER BY viewname;

-- 6. TEST GENERATED COLUMNS (should return numeric values)
SELECT
    career_code,
    min_grade_level,
    min_grade_level_num,
    max_grade_level,
    max_grade_level_num
FROM career_paths
LIMIT 5;

-- 7. CHECK UNIQUE CONSTRAINT ON ACTIVE SUBSCRIPTIONS
-- This should succeed (first insert)
INSERT INTO tenant_subscriptions (
    tenant_id,
    tier_id,
    status,
    current_period_start,
    current_period_end
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM subscription_tiers WHERE tier_code = 'basic'),
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days'
) RETURNING id, tenant_id, status;

-- Save the tenant_id from above for the next test

-- 8. TEST CONSTRAINT (this should fail with duplicate key error)
-- Replace 'YOUR_TENANT_ID' with the tenant_id from query 7
/*
INSERT INTO tenant_subscriptions (
    tenant_id,
    tier_id,
    status,
    current_period_start,
    current_period_end
) VALUES (
    'YOUR_TENANT_ID',  -- Use the same tenant_id from above
    (SELECT id FROM subscription_tiers WHERE tier_code = 'premium'),
    'active',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days'
);
-- Expected: ERROR: duplicate key value violates unique constraint
*/

-- 9. SUMMARY CHECK - Count all new components
SELECT
    'New Columns in career_paths' as component,
    COUNT(*) as count
FROM information_schema.columns
WHERE table_name = 'career_paths'
AND column_name IN (
    'access_tier', 'min_grade_level', 'max_grade_level',
    'grade_category', 'daily_tasks', 'salary_range'
)
UNION ALL
SELECT
    'New Tables Created' as component,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'subscription_tiers', 'tenant_subscriptions',
    'career_access_events', 'premium_conversion_funnel'
)
UNION ALL
SELECT
    'Subscription Tiers Loaded' as component,
    COUNT(*) as count
FROM subscription_tiers
UNION ALL
SELECT
    'Indexes Created' as component,
    COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%career%'
   OR indexname LIKE 'idx_%tenant%'
   OR indexname LIKE 'unique_active%'
UNION ALL
SELECT
    'Views Created' as component,
    COUNT(*) as count
FROM pg_views
WHERE schemaname = 'public'
AND (viewname LIKE '%premium%' OR viewname LIKE '%subscription%');

-- 10. CLEAN UP TEST DATA (optional)
-- DELETE FROM tenant_subscriptions WHERE tenant_id = 'YOUR_TENANT_ID';