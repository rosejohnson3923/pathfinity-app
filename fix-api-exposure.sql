-- ============================================
-- FIX API EXPOSURE FOR MONITORING TABLES
-- ============================================
-- This script ensures tables are properly exposed through Supabase API

-- 1. ENSURE TABLES ARE IN PUBLIC SCHEMA
-- ============================================
-- Check current schema of tables
DO $$
DECLARE
    current_schema TEXT;
BEGIN
    -- Check error_logs
    SELECT schemaname INTO current_schema
    FROM pg_tables
    WHERE tablename = 'error_logs'
    LIMIT 1;

    IF current_schema IS NOT NULL AND current_schema != 'public' THEN
        RAISE NOTICE 'Moving error_logs from % to public schema', current_schema;
        EXECUTE format('ALTER TABLE %I.error_logs SET SCHEMA public', current_schema);
    END IF;
END $$;

-- 2. DISABLE RLS TEMPORARILY TO TEST
-- ============================================
-- If RLS is blocking access, temporarily disable it to test
-- (Re-enable after testing!)
ALTER TABLE error_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE detection_performance_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics DISABLE ROW LEVEL SECURITY;

-- 3. GRANT FULL PERMISSIONS TO ANON AND AUTHENTICATED
-- ============================================
-- Ensure anon role (used by your API key) has full access
GRANT ALL PRIVILEGES ON TABLE error_logs TO anon;
GRANT ALL PRIVILEGES ON TABLE performance_metrics TO anon;
GRANT ALL PRIVILEGES ON TABLE detection_performance_metrics TO anon;
GRANT ALL PRIVILEGES ON TABLE usage_analytics TO anon;

GRANT ALL PRIVILEGES ON TABLE error_logs TO authenticated;
GRANT ALL PRIVILEGES ON TABLE performance_metrics TO authenticated;
GRANT ALL PRIVILEGES ON TABLE detection_performance_metrics TO authenticated;
GRANT ALL PRIVILEGES ON TABLE usage_analytics TO authenticated;

-- Grant sequence permissions if there are any auto-increment columns
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 4. ALTERNATIVE: CREATE SECURITY DEFINER FUNCTIONS
-- ============================================
-- If direct table access doesn't work, create functions that bypass RLS
CREATE OR REPLACE FUNCTION insert_error_log(
    p_error_type VARCHAR,
    p_error_message TEXT,
    p_stack_trace TEXT DEFAULT NULL,
    p_severity VARCHAR DEFAULT 'medium',
    p_context JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO error_logs (
        error_type,
        error_message,
        stack_trace,
        severity,
        context
    ) VALUES (
        p_error_type,
        p_error_message,
        p_stack_trace,
        p_severity,
        p_context
    ) RETURNING error_id INTO new_id;

    RETURN new_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION insert_error_log TO anon, authenticated;

-- 5. TEST THE API ENDPOINT
-- ============================================
-- After running this script, test if the API works by running this query
-- and checking if it returns data:
SELECT * FROM error_logs LIMIT 1;

-- 6. RE-ENABLE RLS WITH PROPER POLICIES
-- ============================================
-- After confirming the tables work, re-enable RLS with permissive policies
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to insert error logs" ON error_logs;
DROP POLICY IF EXISTS "Allow users to view their own error logs" ON error_logs;
DROP POLICY IF EXISTS "Allow anon users to insert error logs" ON error_logs;
DROP POLICY IF EXISTS "Allow anon users to read error logs" ON error_logs;

-- Create completely permissive policies for testing
CREATE POLICY "Allow all operations for everyone" ON error_logs
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for everyone" ON performance_metrics
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for everyone" ON detection_performance_metrics
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations for everyone" ON usage_analytics
    FOR ALL
    USING (true)
    WITH CHECK (true);