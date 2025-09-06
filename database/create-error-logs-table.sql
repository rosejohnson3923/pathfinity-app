-- Create error_logs table if it doesn't exist
-- This fixes the 404 error when trying to log errors

CREATE TABLE IF NOT EXISTS error_logs (
    error_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    context JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(200),
    session_id VARCHAR(200),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_errors_timestamp ON error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_errors_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_errors_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_errors_user ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_errors_resolved ON error_logs(resolved);

-- Grant necessary permissions
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert error logs
CREATE POLICY "Allow authenticated users to insert error logs" 
    ON error_logs FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

-- Allow authenticated users to view their own error logs
CREATE POLICY "Allow users to view their own error logs" 
    ON error_logs FOR SELECT 
    TO authenticated 
    USING (user_id = auth.uid()::text OR user_id IS NULL);

-- Allow anon users to insert error logs (for unauthenticated error tracking)
CREATE POLICY "Allow anon users to insert error logs" 
    ON error_logs FOR INSERT 
    TO anon 
    WITH CHECK (true);

COMMENT ON TABLE error_logs IS 'Stores application error logs for monitoring and debugging';
COMMENT ON COLUMN error_logs.severity IS 'Error severity: low, medium, high, critical';
COMMENT ON COLUMN error_logs.resolved IS 'Whether the error has been resolved';