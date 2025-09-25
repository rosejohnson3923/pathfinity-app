-- Migration Setup Script
-- Creates the schema_migrations table for tracking applied migrations
-- Run this BEFORE running any other migrations

-- Create schema_migrations table if it doesn't exist
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  description TEXT,
  checksum VARCHAR(64),
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  execution_time_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_schema_migrations_executed_at
  ON schema_migrations(executed_at DESC);

-- Insert initial migration record
INSERT INTO schema_migrations (version, description, checksum)
VALUES ('000_setup_migrations', 'Initial migration tracking setup', 'initial')
ON CONFLICT (version) DO NOTHING;

-- Create a helper function to check if a migration has been run
CREATE OR REPLACE FUNCTION migration_exists(migration_version VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM schema_migrations
    WHERE version = migration_version
    AND success = true
  );
END;
$$ LANGUAGE plpgsql;

-- Create a helper function to record migration execution
CREATE OR REPLACE FUNCTION record_migration(
  p_version VARCHAR,
  p_description TEXT,
  p_checksum VARCHAR DEFAULT NULL,
  p_execution_time_ms INTEGER DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO schema_migrations (
    version,
    description,
    checksum,
    execution_time_ms,
    success,
    error_message
  )
  VALUES (
    p_version,
    p_description,
    p_checksum,
    p_execution_time_ms,
    p_success,
    p_error_message
  )
  ON CONFLICT (version) DO UPDATE
  SET
    description = EXCLUDED.description,
    checksum = EXCLUDED.checksum,
    executed_at = CURRENT_TIMESTAMP,
    execution_time_ms = EXCLUDED.execution_time_ms,
    success = EXCLUDED.success,
    error_message = EXCLUDED.error_message;
END;
$$ LANGUAGE plpgsql;

-- Output success message
DO $$
BEGIN
  RAISE NOTICE 'Schema migrations table setup complete';
END $$;