-- ============================================
-- MONITORING TABLES CREATION SCRIPT FOR SUPABASE
-- ============================================
-- Run this script in Supabase SQL Editor to create the necessary monitoring tables
-- This will fix the 404 errors when the MonitoringService tries to log data

-- ============================================
-- 1. ERROR LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS error_logs (
    error_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    context JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(200),
    session_id VARCHAR(200),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_errors_timestamp ON error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_errors_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_errors_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_errors_user ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_errors_resolved ON error_logs(resolved);

-- Enable RLS
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for error_logs
CREATE POLICY "Allow authenticated users to insert error logs"
    ON error_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow users to view their own error logs"
    ON error_logs FOR SELECT
    TO authenticated
    USING (user_id = auth.uid()::text OR user_id IS NULL);

CREATE POLICY "Allow anon users to insert error logs"
    ON error_logs FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow anon users to read error logs (for monitoring dashboard in development)
CREATE POLICY "Allow anon users to read error logs"
    ON error_logs FOR SELECT
    TO anon
    USING (true);

-- ============================================
-- 2. PERFORMANCE METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS performance_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type VARCHAR(100) NOT NULL,
    metric_name VARCHAR(200) NOT NULL,
    value NUMERIC,
    unit VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(200),
    session_id VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_perf_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_perf_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_perf_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_perf_user ON performance_metrics(user_id);

-- Enable RLS
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for performance_metrics
CREATE POLICY "Allow authenticated users to insert metrics"
    ON performance_metrics FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read metrics"
    ON performance_metrics FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow anon users to insert metrics"
    ON performance_metrics FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anon users to read metrics"
    ON performance_metrics FOR SELECT
    TO anon
    USING (true);

-- ============================================
-- 3. DETECTION PERFORMANCE METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS detection_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    metric_hour INTEGER CHECK (metric_hour >= 0 AND metric_hour <= 23),
    question_type VARCHAR(100) NOT NULL,
    avg_detection_time_ms NUMERIC,
    total_detections INTEGER DEFAULT 0,
    success_rate NUMERIC CHECK (success_rate >= 0 AND success_rate <= 100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, metric_hour, question_type)
);

-- Create indexes for detection metrics
CREATE INDEX IF NOT EXISTS idx_detection_date ON detection_performance_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_detection_type ON detection_performance_metrics(question_type);
CREATE INDEX IF NOT EXISTS idx_detection_hour ON detection_performance_metrics(metric_hour);

-- Enable RLS
ALTER TABLE detection_performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for detection_performance_metrics
CREATE POLICY "Allow all users to insert detection metrics"
    ON detection_performance_metrics FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow all users to update detection metrics"
    ON detection_performance_metrics FOR UPDATE
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all users to read detection metrics"
    ON detection_performance_metrics FOR SELECT
    USING (true);

-- ============================================
-- 4. USAGE ANALYTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS usage_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    event_name VARCHAR(200) NOT NULL,
    event_data JSONB DEFAULT '{}',
    user_id VARCHAR(200),
    session_id VARCHAR(200),
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for usage analytics
CREATE INDEX IF NOT EXISTS idx_usage_timestamp ON usage_analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_usage_type ON usage_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_name ON usage_analytics(event_name);
CREATE INDEX IF NOT EXISTS idx_usage_user ON usage_analytics(user_id);

-- Enable RLS
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usage_analytics
CREATE POLICY "Allow all users to insert analytics"
    ON usage_analytics FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read analytics"
    ON usage_analytics FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- 5. ADD COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE error_logs IS 'Stores application error logs for monitoring and debugging';
COMMENT ON TABLE performance_metrics IS 'Stores performance metrics for application monitoring';
COMMENT ON TABLE detection_performance_metrics IS 'Stores aggregated detection performance metrics by hour';
COMMENT ON TABLE usage_analytics IS 'Stores user interaction and usage analytics events';

-- ============================================
-- 6. GRANT PERMISSIONS TO SERVICE ROLE (Optional)
-- ============================================
-- If you want to allow service role full access (for admin dashboards)
GRANT ALL ON error_logs TO service_role;
GRANT ALL ON performance_metrics TO service_role;
GRANT ALL ON detection_performance_metrics TO service_role;
GRANT ALL ON usage_analytics TO service_role;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- After running this script, you can verify the tables were created:
/*
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('error_logs', 'performance_metrics', 'detection_performance_metrics', 'usage_analytics');
*/

-- Check RLS policies:
/*
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('error_logs', 'performance_metrics', 'detection_performance_metrics', 'usage_analytics');
*/