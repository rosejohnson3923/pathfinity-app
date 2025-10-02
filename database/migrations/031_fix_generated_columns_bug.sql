-- Fix the GENERATED columns bug where NULL values default to 12
-- This is causing data integrity issues

-- ============================================
-- STEP 1: Drop the broken GENERATED columns
-- ============================================

ALTER TABLE career_paths
    DROP COLUMN IF EXISTS min_grade_level_num CASCADE,
    DROP COLUMN IF EXISTS max_grade_level_num CASCADE;

-- ============================================
-- STEP 2: Recreate them with proper NULL handling
-- ============================================

ALTER TABLE career_paths
    ADD COLUMN min_grade_level_num INTEGER GENERATED ALWAYS AS (
        CASE
            WHEN min_grade_level IS NULL THEN NULL
            WHEN min_grade_level = 'K' THEN 0
            WHEN min_grade_level = '1' THEN 1
            WHEN min_grade_level = '2' THEN 2
            WHEN min_grade_level = '3' THEN 3
            WHEN min_grade_level = '4' THEN 4
            WHEN min_grade_level = '5' THEN 5
            WHEN min_grade_level = '6' THEN 6
            WHEN min_grade_level = '7' THEN 7
            WHEN min_grade_level = '8' THEN 8
            WHEN min_grade_level = '9' THEN 9
            WHEN min_grade_level = '10' THEN 10
            WHEN min_grade_level = '11' THEN 11
            WHEN min_grade_level = '12' THEN 12
            ELSE NULL  -- Changed from 12 to NULL!
        END
    ) STORED;

ALTER TABLE career_paths
    ADD COLUMN max_grade_level_num INTEGER GENERATED ALWAYS AS (
        CASE
            WHEN max_grade_level IS NULL THEN NULL
            WHEN max_grade_level = 'K' THEN 0
            WHEN max_grade_level = '1' THEN 1
            WHEN max_grade_level = '2' THEN 2
            WHEN max_grade_level = '3' THEN 3
            WHEN max_grade_level = '4' THEN 4
            WHEN max_grade_level = '5' THEN 5
            WHEN max_grade_level = '6' THEN 6
            WHEN max_grade_level = '7' THEN 7
            WHEN max_grade_level = '8' THEN 8
            WHEN max_grade_level = '9' THEN 9
            WHEN max_grade_level = '10' THEN 10
            WHEN max_grade_level = '11' THEN 11
            WHEN max_grade_level = '12' THEN 12
            ELSE NULL  -- Changed from 12 to NULL!
        END
    ) STORED;

-- ============================================
-- STEP 3: Verify the fix
-- ============================================

-- Check that NULL values now properly map to NULL
SELECT
    'NULL handling test:' as test;

SELECT
    COUNT(*) as total_rows,
    COUNT(CASE WHEN min_grade_level IS NULL AND min_grade_level_num IS NULL THEN 1 END) as min_null_correct,
    COUNT(CASE WHEN min_grade_level IS NULL AND min_grade_level_num IS NOT NULL THEN 1 END) as min_null_broken,
    COUNT(CASE WHEN max_grade_level IS NULL AND max_grade_level_num IS NULL THEN 1 END) as max_null_correct,
    COUNT(CASE WHEN max_grade_level IS NULL AND max_grade_level_num IS NOT NULL THEN 1 END) as max_null_broken
FROM career_paths;

-- Show some examples to verify sync
SELECT
    career_name,
    min_grade_level,
    min_grade_level_num,
    max_grade_level,
    max_grade_level_num,
    CASE
        WHEN (min_grade_level IS NULL) = (min_grade_level_num IS NULL)
         AND (max_grade_level IS NULL) = (max_grade_level_num IS NULL)
        THEN '✓ Synced'
        ELSE '✗ BROKEN'
    END as status
FROM career_paths
LIMIT 20;

-- ============================================
-- STEP 4: Recreate any indexes that were dropped
-- ============================================

CREATE INDEX IF NOT EXISTS idx_career_paths_tier_grade
    ON career_paths(access_tier, min_grade_level_num);

-- ============================================
-- STEP 5: Add comment warnings
-- ============================================

COMMENT ON COLUMN career_paths.min_grade_level_num IS 'Auto-generated from min_grade_level. NULL when source is NULL.';
COMMENT ON COLUMN career_paths.max_grade_level_num IS 'Auto-generated from max_grade_level. NULL when source is NULL.';