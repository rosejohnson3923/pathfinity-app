-- Consolidate careers table into career_paths table
-- This migration merges the careers table data into career_paths and updates all references

-- ============================================
-- STEP 1: Add missing columns to career_paths
-- ============================================

-- Add emoji column if it doesn't exist
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS emoji VARCHAR(10);

-- Add field_id to link to career_fields
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS field_id UUID REFERENCES career_fields(id);

-- Note: career_paths already has these equivalents:
-- careers.tier → career_paths.access_tier (already renamed to 'select')
-- careers.category → career_paths.career_category
-- careers.is_active → career_paths.is_active
-- careers.created_at → career_paths.created_at
-- careers.updated_at → career_paths.updated_at

-- ============================================
-- STEP 2: Migrate data from careers to career_paths
-- ============================================

-- First, insert any careers that don't exist in career_paths
INSERT INTO career_paths (
    career_code,
    career_name,
    emoji,
    career_category,
    description,
    access_tier,
    field_id,
    is_active,
    created_at,
    updated_at
)
SELECT
    c.career_code,
    c.career_name,
    c.emoji,
    c.category as career_category,
    c.description,
    c.tier as access_tier,  -- This should already be 'select' or 'premium' after our fix
    c.field_id,
    c.is_active,
    c.created_at,
    c.updated_at
FROM careers c
WHERE NOT EXISTS (
    SELECT 1 FROM career_paths cp
    WHERE cp.career_code = c.career_code
);

-- Update existing career_paths records with emoji and field_id from careers table
UPDATE career_paths cp
SET
    emoji = c.emoji,
    field_id = c.field_id
FROM careers c
WHERE cp.career_code = c.career_code
  AND (cp.emoji IS NULL OR cp.field_id IS NULL);

-- ============================================
-- STEP 3: Create mapping table for progressions migration
-- ============================================

-- Create temporary mapping of careers.id to career_paths.id
CREATE TEMP TABLE career_id_mapping AS
SELECT
    c.id as old_career_id,
    cp.id as new_career_path_id,
    c.career_code
FROM careers c
INNER JOIN career_paths cp ON c.career_code = cp.career_code;

-- ============================================
-- STEP 4: Update career_path_progressions to reference career_paths
-- ============================================

-- First, add a new column to reference career_paths
ALTER TABLE career_path_progressions
    ADD COLUMN IF NOT EXISTS career_path_id UUID REFERENCES career_paths(id);

-- Populate the new column using the mapping
UPDATE career_path_progressions cpp
SET career_path_id = m.new_career_path_id
FROM career_id_mapping m
WHERE cpp.base_career_id = m.old_career_id;

-- ============================================
-- STEP 5: Switch foreign key reference
-- ============================================

-- Drop the old foreign key constraint
ALTER TABLE career_path_progressions
    DROP CONSTRAINT IF EXISTS career_path_progressions_base_career_id_fkey;

-- Make career_path_id the primary reference
ALTER TABLE career_path_progressions
    ALTER COLUMN career_path_id SET NOT NULL;

-- Rename columns for clarity
ALTER TABLE career_path_progressions
    RENAME COLUMN base_career_id TO old_career_id;
ALTER TABLE career_path_progressions
    RENAME COLUMN career_path_id TO base_career_path_id;

-- Add new foreign key constraint
ALTER TABLE career_path_progressions
    ADD CONSTRAINT career_path_progressions_base_career_path_id_fkey
    FOREIGN KEY (base_career_path_id) REFERENCES career_paths(id) ON DELETE CASCADE;

-- Update unique constraint
ALTER TABLE career_path_progressions
    DROP CONSTRAINT IF EXISTS career_path_progressions_base_career_id_progression_type_key;
ALTER TABLE career_path_progressions
    ADD CONSTRAINT career_path_progressions_base_career_path_id_progression_type_key
    UNIQUE (base_career_path_id, progression_type);

-- ============================================
-- STEP 6: Update views and functions
-- ============================================

-- Drop the existing view first
DROP VIEW IF EXISTS career_progression_full;

-- Recreate the career_progression_full view with new column names
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

-- Update the helper function
CREATE OR REPLACE FUNCTION get_career_with_progressions(p_career_path_id UUID)
RETURNS TABLE (
    career_path_id UUID,
    career_name VARCHAR,
    access_tier VARCHAR,
    field_name VARCHAR,
    progressions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cp.id,
        cp.career_name,
        cp.access_tier,
        cf.field_name,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'type', cpp.progression_type,
                    'enhanced_name', cpp.enhanced_career_name,
                    'description', cpp.enhanced_description,
                    'skills', cpp.additional_skills
                ) ORDER BY cpp.progression_type
            ) FILTER (WHERE cpp.id IS NOT NULL),
            '[]'::jsonb
        ) as progressions
    FROM career_paths cp
    LEFT JOIN career_fields cf ON cp.field_id = cf.id
    LEFT JOIN career_path_progressions cpp ON cp.id = cpp.base_career_path_id
    WHERE cp.id = p_career_path_id
    GROUP BY cp.id, cp.career_name, cp.access_tier, cf.field_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 7: Verify migration and clean up
-- ============================================

-- Verify all progressions have been migrated
DO $$
DECLARE
    unmigrated_count INTEGER;
    total_careers INTEGER;
    total_progressions INTEGER;
BEGIN
    -- Check for unmigrated progressions
    SELECT COUNT(*) INTO unmigrated_count
    FROM career_path_progressions
    WHERE base_career_path_id IS NULL;

    -- Count totals
    SELECT COUNT(*) INTO total_careers FROM career_paths WHERE is_active = true;
    SELECT COUNT(*) INTO total_progressions FROM career_path_progressions;

    RAISE NOTICE '===================================';
    RAISE NOTICE 'Migration Results:';
    RAISE NOTICE '===================================';
    RAISE NOTICE 'Total careers in career_paths: %', total_careers;
    RAISE NOTICE 'Total progressions: %', total_progressions;
    RAISE NOTICE 'Unmigrated progressions: %', unmigrated_count;

    IF unmigrated_count > 0 THEN
        RAISE EXCEPTION 'Migration incomplete! % progressions could not be migrated', unmigrated_count;
    ELSE
        RAISE NOTICE '✓ All progressions successfully migrated';
    END IF;
END $$;

-- ============================================
-- STEP 8: Drop the old careers table (commented out for safety)
-- ============================================
-- Uncomment these lines after verifying the migration worked correctly:

-- Drop the old column from career_path_progressions
-- ALTER TABLE career_path_progressions DROP COLUMN IF EXISTS old_career_id;

-- Drop the careers table
-- DROP TABLE IF EXISTS careers CASCADE;

-- Add comment to indicate consolidation
COMMENT ON TABLE career_paths IS 'Consolidated career information table - combines former careers and career_paths tables';
COMMENT ON COLUMN career_paths.emoji IS 'Career emoji icon (migrated from careers table)';
COMMENT ON COLUMN career_paths.field_id IS 'Reference to career field category (migrated from careers table)';
COMMENT ON COLUMN career_paths.access_tier IS 'Subscription tier: select or premium (formerly tier in careers table)';

-- Final verification query
SELECT
    'Career Paths' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT career_code) as unique_careers,
    COUNT(CASE WHEN access_tier = 'select' THEN 1 END) as select_careers,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_careers
FROM career_paths
WHERE is_active = true;