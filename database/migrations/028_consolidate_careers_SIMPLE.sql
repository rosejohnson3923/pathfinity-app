-- Simple version of careers consolidation migration
-- Run these steps one at a time if the full migration has issues

-- ============================================
-- PART 1: Add missing columns to career_paths
-- ============================================

ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS emoji VARCHAR(10);

ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS field_id UUID REFERENCES career_fields(id);

-- ============================================
-- PART 2: Copy data from careers to career_paths
-- ============================================

-- Insert careers that don't exist in career_paths
INSERT INTO career_paths (
    career_code,
    career_name,
    emoji,
    career_category,
    description,
    access_tier,
    field_id,
    is_active
)
SELECT
    c.career_code,
    c.career_name,
    c.emoji,
    c.category,
    c.description,
    c.tier,  -- Should be 'select' or 'premium' after our previous fix
    c.field_id,
    c.is_active
FROM careers c
WHERE NOT EXISTS (
    SELECT 1 FROM career_paths cp
    WHERE cp.career_code = c.career_code
)
ON CONFLICT (career_code) DO NOTHING;

-- Update existing records with emoji and field_id
UPDATE career_paths cp
SET
    emoji = COALESCE(cp.emoji, c.emoji),
    field_id = COALESCE(cp.field_id, c.field_id)
FROM careers c
WHERE cp.career_code = c.career_code;

-- ============================================
-- PART 3: Create mapping for progressions
-- ============================================

-- Create mapping table
CREATE TEMP TABLE IF NOT EXISTS career_id_mapping AS
SELECT
    c.id as old_career_id,
    cp.id as new_career_path_id,
    c.career_code
FROM careers c
INNER JOIN career_paths cp ON c.career_code = cp.career_code;

-- ============================================
-- PART 4: Update progressions to use career_paths
-- ============================================

-- Add new column
ALTER TABLE career_path_progressions
    ADD COLUMN IF NOT EXISTS base_career_path_id UUID REFERENCES career_paths(id);

-- Populate it using the mapping
UPDATE career_path_progressions cpp
SET base_career_path_id = m.new_career_path_id
FROM career_id_mapping m
WHERE cpp.base_career_id = m.old_career_id;

-- ============================================
-- PART 5: Verify the migration
-- ============================================

-- Check results
SELECT
    'Careers in career_paths' as metric,
    COUNT(*) as count
FROM career_paths
WHERE is_active = true
UNION ALL
SELECT
    'Select tier careers' as metric,
    COUNT(*) as count
FROM career_paths
WHERE access_tier = 'select' AND is_active = true
UNION ALL
SELECT
    'Premium tier careers' as metric,
    COUNT(*) as count
FROM career_paths
WHERE access_tier = 'premium' AND is_active = true
UNION ALL
SELECT
    'Progressions migrated' as metric,
    COUNT(*) as count
FROM career_path_progressions
WHERE base_career_path_id IS NOT NULL
UNION ALL
SELECT
    'Progressions NOT migrated' as metric,
    COUNT(*) as count
FROM career_path_progressions
WHERE base_career_path_id IS NULL;

-- ============================================
-- PART 6: Switch to using the new column (if all progressions migrated)
-- ============================================

-- Only run this if all progressions have been migrated successfully:

/*
-- Make the new column required
ALTER TABLE career_path_progressions
    ALTER COLUMN base_career_path_id SET NOT NULL;

-- Drop old constraint
ALTER TABLE career_path_progressions
    DROP CONSTRAINT IF EXISTS career_path_progressions_base_career_id_fkey;

-- Add unique constraint on new columns
ALTER TABLE career_path_progressions
    DROP CONSTRAINT IF EXISTS career_path_progressions_base_career_id_progression_type_key;

ALTER TABLE career_path_progressions
    ADD CONSTRAINT career_path_progressions_base_career_path_id_progression_type_key
    UNIQUE (base_career_path_id, progression_type);
*/

-- ============================================
-- PART 7: Update or recreate views (optional)
-- ============================================

-- Drop and recreate the view if it exists
/*
DROP VIEW IF EXISTS career_progression_full;

CREATE VIEW career_progression_full AS
SELECT
    cp.id as career_path_id,
    cp.career_code,
    cp.career_name,
    cp.emoji,
    cp.career_category,
    cp.access_tier,
    cp.grade_category,
    cp.min_grade_level,
    cp.max_grade_level,
    cf.field_name,
    cpp.progression_type,
    cpp.enhanced_career_name,
    cpp.enhanced_description,
    cpp.additional_skills,
    bt.booster_name,
    bt.icon as booster_icon
FROM career_paths cp
LEFT JOIN career_fields cf ON cp.field_id = cf.id
LEFT JOIN career_path_progressions cpp ON cp.id = cpp.base_career_path_id
LEFT JOIN booster_types bt ON cpp.progression_type = bt.booster_code
WHERE cp.is_active = true
ORDER BY cf.display_order, cp.career_name, cpp.progression_type;
*/

-- ============================================
-- PART 8: Clean up (after verification)
-- ============================================

-- Only run after confirming everything works:
/*
-- Drop the old column
ALTER TABLE career_path_progressions
    DROP COLUMN IF EXISTS base_career_id CASCADE;

-- Drop the careers table
DROP TABLE IF EXISTS careers CASCADE;
*/