-- Fix for career progression mapping
-- Run this to properly link progressions to career_paths table

-- First, check what we have
SELECT 'Current state check:';

SELECT
    'Careers table count' as metric,
    COUNT(*) as count
FROM careers
UNION ALL
SELECT
    'Career_paths table count' as metric,
    COUNT(*) as count
FROM career_paths
UNION ALL
SELECT
    'Progressions with base_career_id' as metric,
    COUNT(*) as count
FROM career_path_progressions
WHERE base_career_id IS NOT NULL
UNION ALL
SELECT
    'Progressions with base_career_path_id' as metric,
    COUNT(*) as count
FROM career_path_progressions
WHERE base_career_path_id IS NOT NULL;

-- Create the mapping (not as TEMP so it persists)
DROP TABLE IF EXISTS career_id_mapping;
CREATE TABLE career_id_mapping AS
SELECT
    c.id as old_career_id,
    cp.id as new_career_path_id,
    c.career_code,
    c.career_name
FROM careers c
INNER JOIN career_paths cp ON c.career_code = cp.career_code;

-- Check the mapping
SELECT 'Mapping created for careers:' as info, COUNT(*) as count
FROM career_id_mapping;

-- Add the new column if it doesn't exist
ALTER TABLE career_path_progressions
    ADD COLUMN IF NOT EXISTS base_career_path_id UUID REFERENCES career_paths(id);

-- Update progressions using the mapping
UPDATE career_path_progressions cpp
SET base_career_path_id = m.new_career_path_id
FROM career_id_mapping m
WHERE cpp.base_career_id = m.old_career_id
  AND cpp.base_career_path_id IS NULL;

-- Verify the update
SELECT
    'Progressions successfully mapped' as metric,
    COUNT(*) as count
FROM career_path_progressions
WHERE base_career_path_id IS NOT NULL
UNION ALL
SELECT
    'Progressions NOT mapped' as metric,
    COUNT(*) as count
FROM career_path_progressions
WHERE base_career_path_id IS NULL AND base_career_id IS NOT NULL;

-- Show sample of mapped progressions
SELECT
    m.career_name,
    cpp.progression_type,
    cpp.enhanced_career_name,
    CASE WHEN cpp.base_career_path_id IS NOT NULL THEN 'Mapped' ELSE 'Not Mapped' END as status
FROM career_path_progressions cpp
JOIN career_id_mapping m ON cpp.base_career_id = m.old_career_id
LIMIT 10;

-- Clean up the mapping table (optional)
-- DROP TABLE IF EXISTS career_id_mapping;