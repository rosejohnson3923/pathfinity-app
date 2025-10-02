-- Finalize the consolidation of careers into career_paths
-- Run this after the mapping has been completed successfully

-- ============================================
-- STEP 1: Make the new column the primary reference
-- ============================================

-- Make base_career_path_id required (since all are now mapped)
ALTER TABLE career_path_progressions
    ALTER COLUMN base_career_path_id SET NOT NULL;

-- Drop the old foreign key constraint if it exists
ALTER TABLE career_path_progressions
    DROP CONSTRAINT IF EXISTS career_path_progressions_base_career_id_fkey;

-- Drop old unique constraint
ALTER TABLE career_path_progressions
    DROP CONSTRAINT IF EXISTS career_path_progressions_base_career_id_progression_type_key;

-- Add new unique constraint
ALTER TABLE career_path_progressions
    DROP CONSTRAINT IF EXISTS career_path_progressions_base_career_path_id_progression_type_key;

ALTER TABLE career_path_progressions
    ADD CONSTRAINT career_path_progressions_base_career_path_id_progression_type_key
    UNIQUE (base_career_path_id, progression_type);

-- ============================================
-- STEP 2: Clean up views
-- ============================================

-- Drop old view if it exists
DROP VIEW IF EXISTS career_progression_full;

-- Create new view using career_paths
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

-- ============================================
-- STEP 3: Final verification
-- ============================================

SELECT 'CONSOLIDATION COMPLETE!' as status;

-- Show the final state
SELECT
    'Total careers in career_paths' as metric,
    COUNT(*) as count
FROM career_paths
WHERE is_active = true
UNION ALL
SELECT
    'Select tier (with grade filtering!)' as metric,
    COUNT(*) as count
FROM career_paths
WHERE access_tier = 'select' AND is_active = true
UNION ALL
SELECT
    'Premium tier' as metric,
    COUNT(*) as count
FROM career_paths
WHERE access_tier = 'premium' AND is_active = true
UNION ALL
SELECT
    'Total progressions linked' as metric,
    COUNT(*) as count
FROM career_path_progressions
WHERE base_career_path_id IS NOT NULL;

-- Show grade categories available
SELECT
    grade_category,
    COUNT(*) as career_count,
    access_tier
FROM career_paths
WHERE is_active = true
  AND grade_category IS NOT NULL
GROUP BY grade_category, access_tier
ORDER BY grade_category, access_tier;

-- ============================================
-- STEP 4: Optional cleanup (run separately after verification)
-- ============================================

-- After you've verified everything works, you can run these:

/*
-- Drop the old career_id column
ALTER TABLE career_path_progressions
    DROP COLUMN IF EXISTS base_career_id CASCADE;

-- Drop the mapping table
DROP TABLE IF EXISTS career_id_mapping;

-- Finally, drop the careers table (BE VERY SURE before running this!)
-- DROP TABLE IF EXISTS careers CASCADE;

-- Add helpful comments
COMMENT ON TABLE career_paths IS 'Primary career information table with grade-level filtering and progression support';
COMMENT ON COLUMN career_paths.emoji IS 'Visual emoji for the career';
COMMENT ON COLUMN career_paths.field_id IS 'Links to career field categories';
COMMENT ON COLUMN career_paths.grade_category IS 'Age-appropriate grade level (elementary, middle, high, all)';
COMMENT ON COLUMN career_path_progressions.base_career_path_id IS 'Links to career_paths.id for base career';
*/