-- ================================================================
-- GENERATION WORKERS TABLE
-- ================================================================
-- This table manages background content generation workers
-- ================================================================

-- Drop if exists for clean setup
DROP TABLE IF EXISTS generation_workers CASCADE;

-- Create generation_workers table
CREATE TABLE generation_workers (
    worker_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'idle' 
        CHECK (status IN ('idle', 'busy', 'offline', 'error')),
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    current_task_id UUID,
    tasks_completed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for quick worker lookup
CREATE INDEX idx_worker_status ON generation_workers(status);
CREATE INDEX idx_worker_name ON generation_workers(worker_name);

-- Insert default main worker
INSERT INTO generation_workers (worker_name, status) 
VALUES ('main_worker', 'idle');

-- Grant permissions for authenticated users
GRANT SELECT, UPDATE ON generation_workers TO authenticated;
GRANT SELECT ON generation_workers TO anon;

-- Create a simple heartbeat function
CREATE OR REPLACE FUNCTION update_worker_heartbeat(p_worker_name VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE generation_workers
    SET last_heartbeat = NOW(),
        updated_at = NOW()
    WHERE worker_name = p_worker_name;
END;
$$ LANGUAGE plpgsql;

-- Show what we created
SELECT 
    'Generation Workers Table Created' as status,
    COUNT(*) as workers_count
FROM generation_workers;