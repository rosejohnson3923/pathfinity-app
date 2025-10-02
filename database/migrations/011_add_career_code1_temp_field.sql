-- Migration 011: Add temporary career_code1 field for CSV import
-- This allows us to import new career codes without foreign key constraint conflicts

BEGIN;

-- Add temporary field for new career codes
ALTER TABLE career_paths ADD COLUMN IF NOT EXISTS career_code1 TEXT;

-- Add comment for documentation
COMMENT ON COLUMN career_paths.career_code1 IS 'Temporary field for importing standardized career codes from CSV';

COMMIT;