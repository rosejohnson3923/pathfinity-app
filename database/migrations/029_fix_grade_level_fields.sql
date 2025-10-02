-- Fix grade level field corruption in career_paths
-- The min_grade_level, max_grade_level, min_grade_level_num, max_grade_level_num fields are corrupted
-- We should ONLY use grade_category which has proper values

-- ============================================
-- STEP 1: Verify grade_category is populated
-- ============================================

-- Check if we have grade_category values
SELECT
    'Careers with grade_category' as check_name,
    COUNT(*) as count,
    COUNT(*) * 100.0 / (SELECT COUNT(*) FROM career_paths) as percentage
FROM career_paths
WHERE grade_category IS NOT NULL;

-- ============================================
-- STEP 2: Fix any missing grade_category values
-- ============================================

-- Set default grade_category for careers that don't have it
-- Based on the career complexity, assign appropriate grade levels
UPDATE career_paths
SET grade_category = CASE
    -- Simple, foundational careers for elementary
    WHEN career_name IN ('Teacher', 'Artist', 'Chef', 'Baker', 'Musician',
                         'Police Officer', 'Firefighter', 'Athlete', 'Coach',
                         'Farmer', 'Librarian', 'Nurse', 'Veterinarian')
    THEN 'elementary'

    -- More complex careers for middle school
    WHEN career_name IN ('Programmer', 'Web Designer', 'Photographer', 'Writer',
                         'Scientist', 'Biologist', 'Accountant', 'Salesperson',
                         'Mechanic', 'Carpenter', 'Plumber', 'Electrician',
                         'IT Support', 'Game Tester', 'Pharmacist', 'Therapist')
    THEN 'middle'

    -- Advanced/specialized careers for high school
    WHEN career_name IN ('Surgeon', 'Psychiatrist', 'Software Architect', 'Data Scientist',
                         'CEO', 'Investment Banker', 'Entrepreneur', 'Judge',
                         'Diplomat', 'FBI Agent', 'Astronaut', 'Marine Biologist',
                         'Film Director', 'Fashion Designer', 'Architect')
    THEN 'high'

    -- Default to 'all' for careers that work at any level
    ELSE 'all'
END
WHERE grade_category IS NULL;

-- ============================================
-- STEP 3: Drop the corrupted columns (optional - commented for safety)
-- ============================================

-- These columns are completely unreliable and should not be used
-- Uncomment to remove them after verifying grade_category works

/*
ALTER TABLE career_paths
    DROP COLUMN IF EXISTS min_grade_level,
    DROP COLUMN IF EXISTS max_grade_level,
    DROP COLUMN IF EXISTS min_grade_level_num,
    DROP COLUMN IF EXISTS max_grade_level_num;
*/

-- ============================================
-- STEP 4: Add constraint to ensure grade_category is always set
-- ============================================

-- Make grade_category required with a default
ALTER TABLE career_paths
    ALTER COLUMN grade_category SET DEFAULT 'all';

-- Add NOT NULL constraint (after setting values above)
ALTER TABLE career_paths
    ALTER COLUMN grade_category SET NOT NULL;

-- ============================================
-- STEP 5: Verify the fix
-- ============================================

-- Show the distribution after fix
SELECT
    grade_category,
    access_tier,
    COUNT(*) as career_count
FROM career_paths
WHERE is_active = true
GROUP BY grade_category, access_tier
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
        WHEN 'all' THEN 4
    END,
    access_tier;

-- Show some examples
SELECT
    career_name,
    grade_category,
    access_tier,
    career_category
FROM career_paths
WHERE is_active = true
ORDER BY grade_category, career_name
LIMIT 20;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN career_paths.grade_category IS 'Grade level appropriateness: elementary (K-5), middle (6-8), high (9-12), or all';

-- Add warning comments on bad columns (if not dropped)
COMMENT ON COLUMN career_paths.min_grade_level IS 'DEPRECATED - DO NOT USE - Data is corrupted. Use grade_category instead';
COMMENT ON COLUMN career_paths.max_grade_level IS 'DEPRECATED - DO NOT USE - Data is corrupted. Use grade_category instead';
COMMENT ON COLUMN career_paths.min_grade_level_num IS 'DEPRECATED - DO NOT USE - Data is corrupted. Use grade_category instead';
COMMENT ON COLUMN career_paths.max_grade_level_num IS 'DEPRECATED - DO NOT USE - Data is corrupted. Use grade_category instead';