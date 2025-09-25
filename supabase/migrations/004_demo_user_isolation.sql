-- ============================================
-- DEMO USER ISOLATION MIGRATION
-- Adds is_demo flags and isolation mechanisms
-- ============================================

-- Add is_demo column to all relevant tables
ALTER TABLE learning_journeys
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS demo_type VARCHAR(20);

ALTER TABLE grade_progression_tracking
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS demo_type VARCHAR(20);

ALTER TABLE skill_authority_tracking
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS demo_type VARCHAR(20);

ALTER TABLE remediation_queue
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS demo_type VARCHAR(20);

ALTER TABLE journey_sync_metadata
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS demo_type VARCHAR(20);

ALTER TABLE parent_override_audit
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS demo_type VARCHAR(20);

-- Add analytics event table if not exists
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  is_demo BOOLEAN DEFAULT FALSE,
  demo_type VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(255),
  metadata JSONB
);

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_demo_journeys ON learning_journeys(is_demo);
CREATE INDEX IF NOT EXISTS idx_demo_grade_prog ON grade_progression_tracking(is_demo);
CREATE INDEX IF NOT EXISTS idx_demo_skills ON skill_authority_tracking(is_demo);
CREATE INDEX IF NOT EXISTS idx_demo_remediation ON remediation_queue(is_demo);
CREATE INDEX IF NOT EXISTS idx_demo_analytics ON analytics_events(is_demo);
CREATE INDEX IF NOT EXISTS idx_demo_sync ON journey_sync_metadata(is_demo);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_demo_user_journeys
ON learning_journeys(user_id, is_demo)
WHERE is_demo = FALSE;

CREATE INDEX IF NOT EXISTS idx_demo_tenant_analytics
ON analytics_events(tenant_id, is_demo)
WHERE is_demo = FALSE;

-- Create views that exclude demo data
CREATE OR REPLACE VIEW production_journeys AS
SELECT * FROM learning_journeys
WHERE is_demo = FALSE OR is_demo IS NULL;

CREATE OR REPLACE VIEW production_grade_progression AS
SELECT * FROM grade_progression_tracking
WHERE is_demo = FALSE OR is_demo IS NULL;

CREATE OR REPLACE VIEW production_skills AS
SELECT * FROM skill_authority_tracking
WHERE is_demo = FALSE OR is_demo IS NULL;

CREATE OR REPLACE VIEW production_analytics AS
SELECT * FROM analytics_events
WHERE is_demo = FALSE OR is_demo IS NULL;

-- Create views for demo data only (for testing/monitoring)
CREATE OR REPLACE VIEW demo_journeys AS
SELECT * FROM learning_journeys
WHERE is_demo = TRUE;

CREATE OR REPLACE VIEW demo_analytics AS
SELECT * FROM analytics_events
WHERE is_demo = TRUE;

-- Function to clean up old demo data (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_demo_data()
RETURNS void AS $$
BEGIN
  DELETE FROM learning_journeys
  WHERE is_demo = TRUE
  AND created_at < NOW() - INTERVAL '7 days';

  DELETE FROM grade_progression_tracking
  WHERE is_demo = TRUE
  AND started_date < NOW() - INTERVAL '7 days';

  DELETE FROM skill_authority_tracking
  WHERE is_demo = TRUE
  AND completed_date < NOW() - INTERVAL '7 days';

  DELETE FROM analytics_events
  WHERE is_demo = TRUE
  AND created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean demo data weekly
-- (Note: This requires pg_cron extension or external scheduler)
-- SELECT cron.schedule('cleanup-demo-data', '0 2 * * 0', 'SELECT cleanup_old_demo_data()');

-- Add comments for documentation
COMMENT ON COLUMN learning_journeys.is_demo IS 'Flag indicating if this is demo data';
COMMENT ON COLUMN learning_journeys.demo_type IS 'Type of demo user: demo-student or demo-viewer';
COMMENT ON VIEW production_journeys IS 'Production data view excluding all demo records';
COMMENT ON VIEW demo_journeys IS 'Demo data view for testing and monitoring';
COMMENT ON FUNCTION cleanup_old_demo_data() IS 'Removes demo data older than 7 days to prevent database bloat';