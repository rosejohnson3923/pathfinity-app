-- ============================================
-- FIX 404 ERRORS - EXPOSE TABLES TO API
-- ============================================
-- Run this script to fix the 404 errors when accessing monitoring tables

-- 1. GRANT PROPER PERMISSIONS TO ANON ROLE
-- ============================================
-- The anon role (used by your VITE_SUPABASE_ANON_KEY) needs permissions

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions for monitoring tables
GRANT SELECT, INSERT, UPDATE ON TABLE error_logs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE performance_metrics TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE detection_performance_metrics TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE usage_analytics TO anon, authenticated;

-- Grant sequence permissions (for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 2. RECREATE RLS POLICIES WITH PERMISSIVE ACCESS
-- ============================================
-- First, drop any existing restrictive policies

-- For error_logs
DROP POLICY IF EXISTS "Allow authenticated users to insert error logs" ON error_logs;
DROP POLICY IF EXISTS "Allow users to view their own error logs" ON error_logs;
DROP POLICY IF EXISTS "Allow anon users to insert error logs" ON error_logs;
DROP POLICY IF EXISTS "Allow anon users to read error logs" ON error_logs;
DROP POLICY IF EXISTS "Allow all operations for everyone" ON error_logs;

-- For performance_metrics
DROP POLICY IF EXISTS "Allow authenticated users to insert metrics" ON performance_metrics;
DROP POLICY IF EXISTS "Allow authenticated users to read metrics" ON performance_metrics;
DROP POLICY IF EXISTS "Allow anon users to insert metrics" ON performance_metrics;
DROP POLICY IF EXISTS "Allow anon users to read metrics" ON performance_metrics;
DROP POLICY IF EXISTS "Allow all operations for everyone" ON performance_metrics;

-- For detection_performance_metrics
DROP POLICY IF EXISTS "Allow all users to insert detection metrics" ON detection_performance_metrics;
DROP POLICY IF EXISTS "Allow all users to update detection metrics" ON detection_performance_metrics;
DROP POLICY IF EXISTS "Allow all users to read detection metrics" ON detection_performance_metrics;
DROP POLICY IF EXISTS "Allow all operations for everyone" ON detection_performance_metrics;

-- For usage_analytics
DROP POLICY IF EXISTS "Allow all users to insert analytics" ON usage_analytics;
DROP POLICY IF EXISTS "Allow authenticated users to read analytics" ON usage_analytics;
DROP POLICY IF EXISTS "Allow all operations for everyone" ON usage_analytics;

-- 3. DISABLE RLS TEMPORARILY
-- ============================================
-- This ensures the tables are accessible while we debug
ALTER TABLE error_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE detection_performance_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics DISABLE ROW LEVEL SECURITY;

-- 4. TEST INSERT TO VERIFY ACCESS
-- ============================================
-- This will confirm the table is accessible
DO $$
BEGIN
    -- Test error_logs
    INSERT INTO error_logs (error_type, error_message, severity)
    VALUES ('api_test', 'Testing API access after fix', 'low');

    -- Test performance_metrics
    INSERT INTO performance_metrics (metric_type, metric_name, value)
    VALUES ('api_test', 'test_metric', 1.0);

    -- Test usage_analytics
    INSERT INTO usage_analytics (event_type, event_name)
    VALUES ('api_test', 'test_event');

    RAISE NOTICE 'Test inserts successful - tables are accessible';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error during test inserts: %', SQLERRM;
END $$;

-- 5. VERIFY API VISIBILITY
-- ============================================
-- Check that tables are in the public schema and should be visible to API
SELECT
    c.relname AS table_name,
    n.nspname AS schema_name,
    CASE
        WHEN n.nspname = 'public' THEN '✅ Should be API accessible'
        ELSE '❌ NOT API accessible'
    END as api_status,
    CASE
        WHEN c.relrowsecurity THEN '🔒 RLS Enabled'
        ELSE '🔓 RLS Disabled'
    END as rls_status,
    CASE
        WHEN has_table_privilege('anon', n.nspname||'.'||c.relname, 'INSERT') THEN '✅ INSERT'
        ELSE '❌ No INSERT'
    END as anon_insert,
    CASE
        WHEN has_table_privilege('anon', n.nspname||'.'||c.relname, 'SELECT') THEN '✅ SELECT'
        ELSE '❌ No SELECT'
    END as anon_select
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname IN ('error_logs', 'performance_metrics', 'detection_performance_metrics', 'usage_analytics')
    AND c.relkind = 'r'
ORDER BY c.relname;

-- 6. ALTERNATIVE: CREATE API FUNCTIONS
-- ============================================
-- If direct table access still doesn't work, use these functions

-- Function to insert error logs
CREATE OR REPLACE FUNCTION public.insert_error_log(
    p_error_type text,
    p_error_message text,
    p_severity text DEFAULT 'medium',
    p_stack_trace text DEFAULT NULL,
    p_context jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_error_id uuid;
BEGIN
    INSERT INTO error_logs (
        error_type,
        error_message,
        severity,
        stack_trace,
        context
    )
    VALUES (
        p_error_type,
        p_error_message,
        p_severity,
        p_stack_trace,
        p_context
    )
    RETURNING error_id INTO v_error_id;

    RETURN v_error_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.insert_error_log TO anon, authenticated;

-- Function to insert performance metrics
CREATE OR REPLACE FUNCTION public.insert_performance_metric(
    p_metric_type text,
    p_metric_name text,
    p_value numeric,
    p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_metric_id uuid;
BEGIN
    INSERT INTO performance_metrics (
        metric_type,
        metric_name,
        value,
        metadata
    )
    VALUES (
        p_metric_type,
        p_metric_name,
        p_value,
        p_metadata
    )
    RETURNING metric_id INTO v_metric_id;

    RETURN v_metric_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.insert_performance_metric TO anon, authenticated;

-- 7. FINAL STATUS CHECK
-- ============================================
SELECT
    'Monitoring Tables API Fix Applied' as status,
    NOW() as applied_at,
    current_user as applied_by;

-- ============================================
-- IMPORTANT NEXT STEPS:
-- ============================================
-- After running this script:
--
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to Settings > API
-- 3. Look for a "Reload Schema" or "Refresh Schema" button
-- 4. Click it to refresh the API schema cache
--
-- If there's no refresh button:
-- 1. Make a small change (like adding a test column)
-- 2. Then remove it
-- 3. This forces a schema refresh
--
-- Alternative force refresh:
-- ALTER TABLE error_logs ADD COLUMN temp_refresh boolean DEFAULT false;
-- ALTER TABLE error_logs DROP COLUMN temp_refresh;
-- ============================================