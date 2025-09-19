-- ============================================
-- DIAGNOSTIC SCRIPT FOR MONITORING TABLES
-- ============================================
-- Run this in Supabase SQL Editor to diagnose why the tables return 404

-- 1. CHECK IF TABLES EXIST AND IN WHICH SCHEMA
-- ============================================
SELECT
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables
WHERE tablename IN ('error_logs', 'performance_metrics', 'detection_performance_metrics', 'usage_analytics')
ORDER BY schemaname, tablename;

-- 2. CHECK IF TABLES ARE IN PUBLIC SCHEMA (Required for API access)
-- ============================================
SELECT
    'error_logs exists in public schema' as check,
    EXISTS(SELECT 1 FROM information_schema.tables
           WHERE table_schema = 'public' AND table_name = 'error_logs') as result
UNION ALL
SELECT
    'performance_metrics exists in public schema',
    EXISTS(SELECT 1 FROM information_schema.tables
           WHERE table_schema = 'public' AND table_name = 'performance_metrics')
UNION ALL
SELECT
    'detection_performance_metrics exists in public schema',
    EXISTS(SELECT 1 FROM information_schema.tables
           WHERE table_schema = 'public' AND table_name = 'detection_performance_metrics')
UNION ALL
SELECT
    'usage_analytics exists in public schema',
    EXISTS(SELECT 1 FROM information_schema.tables
           WHERE table_schema = 'public' AND table_name = 'usage_analytics');

-- 3. CHECK RLS POLICIES
-- ============================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('error_logs', 'performance_metrics', 'detection_performance_metrics', 'usage_analytics')
ORDER BY tablename, policyname;

-- 4. CHECK IF RLS IS ENABLED
-- ============================================
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('error_logs', 'performance_metrics', 'detection_performance_metrics', 'usage_analytics');

-- 5. CHECK COLUMN PERMISSIONS FOR ANON ROLE
-- ============================================
SELECT
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('error_logs', 'performance_metrics', 'detection_performance_metrics', 'usage_analytics')
    AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

-- 6. TEST DIRECT INSERT (This will help identify permission issues)
-- ============================================
-- Try to insert a test record
INSERT INTO error_logs (
    error_type,
    error_message,
    severity,
    context
) VALUES (
    'test_error',
    'Test error message to verify table access',
    'low',
    '{"test": true}'::jsonb
) RETURNING error_id;

-- 7. CHECK IF SUPABASE REALTIME IS BLOCKING ACCESS
-- ============================================
SELECT
    schemaname,
    tablename,
    publication
FROM pg_publication_tables
WHERE tablename IN ('error_logs', 'performance_metrics', 'detection_performance_metrics', 'usage_analytics');

-- 8. VERIFY API IS ENABLED FOR THESE TABLES
-- ============================================
-- Check if tables are exposed through PostgREST
SELECT
    n.nspname as schema,
    c.relname as table_name,
    CASE
        WHEN n.nspname = 'public' THEN 'Should be accessible via API'
        ELSE 'Not accessible via API (not in public schema)'
    END as api_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname IN ('error_logs', 'performance_metrics', 'detection_performance_metrics', 'usage_analytics')
    AND c.relkind = 'r';

-- 9. FIX: IF TABLES ARE NOT IN PUBLIC SCHEMA
-- ============================================
-- If any tables are not in the public schema, you'll need to move them:
-- Example (uncomment and modify as needed):
-- ALTER TABLE other_schema.error_logs SET SCHEMA public;

-- 10. FIX: GRANT PROPER PERMISSIONS
-- ============================================
-- Make sure anon and authenticated roles have proper permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Specific grants for our monitoring tables
GRANT SELECT, INSERT ON error_logs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON performance_metrics TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON detection_performance_metrics TO anon, authenticated;
GRANT SELECT, INSERT ON usage_analytics TO anon, authenticated;