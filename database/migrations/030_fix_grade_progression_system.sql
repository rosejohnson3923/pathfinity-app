-- Fix min_grade_level_num and max_grade_level_num for proper career progression
-- This ensures careers progressively unlock as students advance through grades

-- ============================================
-- STEP 1: First, fix the grade_category to min/max mapping
-- ============================================

-- Set proper min/max values based on grade_category
UPDATE career_paths
SET
    min_grade_level = CASE grade_category
        WHEN 'elementary' THEN 'K'
        WHEN 'middle' THEN '6'
        WHEN 'high' THEN '9'
        WHEN 'all' THEN 'K'
        ELSE 'K'
    END,
    max_grade_level = CASE grade_category
        WHEN 'elementary' THEN '5'
        WHEN 'middle' THEN '8'
        WHEN 'high' THEN '12'
        WHEN 'all' THEN '12'
        ELSE '12'
    END,
    min_grade_level_num = CASE grade_category
        WHEN 'elementary' THEN 0
        WHEN 'middle' THEN 6
        WHEN 'high' THEN 9
        WHEN 'all' THEN 0
        ELSE 0
    END,
    max_grade_level_num = CASE grade_category
        WHEN 'elementary' THEN 5
        WHEN 'middle' THEN 8
        WHEN 'high' THEN 12
        WHEN 'all' THEN 12
        ELSE 12
    END
WHERE is_active = true;

-- ============================================
-- STEP 2: Create progressive unlocking within elementary
-- ============================================

-- Simple careers available from Kindergarten
UPDATE career_paths
SET min_grade_level_num = 0,
    min_grade_level = 'K'
WHERE grade_category = 'elementary'
  AND career_name IN (
    'Teacher', 'Artist', 'Musician', 'Chef', 'Baker',
    'Police Officer', 'Firefighter', 'Farmer', 'Athlete',
    'Librarian', 'Zoo Keeper', 'Pet Groomer', 'Mail Carrier'
  );

-- Careers that unlock in Grade 2
UPDATE career_paths
SET min_grade_level_num = 2,
    min_grade_level = '2'
WHERE grade_category = 'elementary'
  AND career_name IN (
    'Nurse', 'Veterinarian', 'Dentist', 'Coach', 'Park Ranger',
    'Photographer', 'Author', 'Journalist', 'Actor'
  );

-- Careers that unlock in Grade 4
UPDATE career_paths
SET min_grade_level_num = 4,
    min_grade_level = '4'
WHERE grade_category = 'elementary'
  AND career_name IN (
    'Scientist', 'Biologist', 'Environmentalist', 'Marine Life Specialist',
    'Game Designer', 'YouTuber', 'Social Media Manager'
  );

-- ============================================
-- STEP 3: Progressive unlocking within middle school
-- ============================================

-- Basic middle school careers at Grade 6
UPDATE career_paths
SET min_grade_level_num = 6,
    min_grade_level = '6'
WHERE grade_category = 'middle'
  AND career_name IN (
    'Programmer', 'Web Designer', 'Graphic Designer',
    'Accountant', 'Marketing Specialist', 'Sales Manager',
    'Mechanic', 'Electrician', 'Plumber', 'Carpenter'
  );

-- More complex careers at Grade 7
UPDATE career_paths
SET min_grade_level_num = 7,
    min_grade_level = '7'
WHERE grade_category = 'middle'
  AND career_name IN (
    'Engineer', 'Architect', 'Interior Designer',
    'Pharmacist', 'Physical Therapist', 'Nutritionist',
    'Business Analyst', 'Project Manager'
  );

-- ============================================
-- STEP 4: Progressive unlocking within high school
-- ============================================

-- Entry high school careers at Grade 9
UPDATE career_paths
SET min_grade_level_num = 9,
    min_grade_level = '9'
WHERE grade_category = 'high'
  AND career_name IN (
    'Doctor', 'Lawyer', 'Psychologist', 'Software Developer',
    'Data Analyst', 'Financial Advisor', 'Real Estate Agent',
    'Pilot', 'Air Traffic Controller'
  );

-- Advanced careers at Grade 10
UPDATE career_paths
SET min_grade_level_num = 10,
    min_grade_level = '10'
WHERE grade_category = 'high'
  AND career_name IN (
    'Surgeon', 'Anesthesiologist', 'Psychiatrist',
    'Software Architect', 'Data Scientist', 'AI Specialist',
    'Investment Banker', 'CEO', 'Entrepreneur'
  );

-- Most complex careers at Grade 11
UPDATE career_paths
SET min_grade_level_num = 11,
    min_grade_level = '11'
WHERE grade_category = 'high'
  AND career_name IN (
    'Neurosurgeon', 'Cardiologist', 'Oncologist',
    'Astronaut', 'Quantum Physicist', 'Biotechnology Researcher',
    'Diplomat', 'Supreme Court Justice', 'Senator'
  );

-- ============================================
-- STEP 5: Handle special cases
-- ============================================

-- Careers marked as 'all' should be available from K but show appropriate content
UPDATE career_paths
SET min_grade_level_num = 0,
    min_grade_level = 'K',
    max_grade_level_num = 12,
    max_grade_level = '12'
WHERE grade_category = 'all';

-- ============================================
-- STEP 6: Verify the progression
-- ============================================

-- Show how many careers unlock at each grade
SELECT
    'Grade progression after fix:' as info;

SELECT
    min_grade_level_num as unlocks_at_grade,
    COUNT(*) as new_careers,
    COUNT(CASE WHEN access_tier = 'select' THEN 1 END) as select_tier,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_tier
FROM career_paths
WHERE is_active = true
GROUP BY min_grade_level_num
ORDER BY min_grade_level_num;

-- Show cumulative careers by grade
WITH grade_levels AS (
    SELECT 0 as g UNION SELECT 2 UNION SELECT 4 UNION SELECT 6
    UNION SELECT 7 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11
)
SELECT
    g as grade,
    COUNT(*) as total_available,
    COUNT(CASE WHEN cp.access_tier = 'select' THEN 1 END) as select_careers,
    COUNT(CASE WHEN cp.access_tier = 'premium' THEN 1 END) as premium_careers
FROM grade_levels
LEFT JOIN career_paths cp ON cp.min_grade_level_num <= g AND cp.is_active = true
GROUP BY g
ORDER BY g;

-- ============================================
-- STEP 7: Add comments
-- ============================================

COMMENT ON COLUMN career_paths.min_grade_level_num IS 'Minimum grade level (numeric) when career becomes available - enables progressive unlocking';
COMMENT ON COLUMN career_paths.max_grade_level_num IS 'Maximum grade level (numeric) for career relevance - typically end of grade category';
COMMENT ON COLUMN career_paths.min_grade_level IS 'Minimum grade level (string) - K, 1, 2, etc. Matches min_grade_level_num';
COMMENT ON COLUMN career_paths.max_grade_level IS 'Maximum grade level (string) - matches max_grade_level_num';