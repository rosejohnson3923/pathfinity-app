-- Fix min_grade_level and max_grade_level for proper career progression
-- Note: min_grade_level_num and max_grade_level_num are GENERATED columns that auto-calculate from the string versions

-- ============================================
-- STEP 1: Fix the base grade_category to min/max mapping
-- ============================================

-- Set proper min/max STRING values based on grade_category
-- The _num versions will auto-calculate from these
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
    END
WHERE is_active = true;

-- ============================================
-- STEP 2: Create progressive unlocking within elementary
-- ============================================

-- Simple careers available from Kindergarten
UPDATE career_paths
SET min_grade_level = 'K'
WHERE grade_category = 'elementary'
  AND career_name IN (
    'Teacher', 'Artist', 'Musician', 'Chef', 'Baker',
    'Police Officer', 'Firefighter', 'Farmer', 'Athlete',
    'Librarian', 'Zoo Keeper', 'Pet Groomer', 'Mail Carrier'
  );

-- Careers that unlock in Grade 2
UPDATE career_paths
SET min_grade_level = '2'
WHERE grade_category = 'elementary'
  AND career_name IN (
    'Nurse', 'Veterinarian', 'Dentist', 'Coach', 'Park Ranger',
    'Photographer', 'Author', 'Journalist', 'Actor'
  );

-- Careers that unlock in Grade 4
UPDATE career_paths
SET min_grade_level = '4'
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
SET min_grade_level = '6'
WHERE grade_category = 'middle'
  AND career_name IN (
    'Programmer', 'Web Designer', 'Graphic Designer',
    'Accountant', 'Marketing Specialist', 'Sales Manager',
    'Mechanic', 'Electrician', 'Plumber', 'Carpenter'
  );

-- More complex careers at Grade 7
UPDATE career_paths
SET min_grade_level = '7'
WHERE grade_category = 'middle'
  AND career_name IN (
    'Engineer', 'Architect', 'Interior Designer',
    'Pharmacist', 'Physical Therapist', 'Nutritionist',
    'Business Analyst', 'Project Manager'
  );

-- Advanced middle school careers stay at Grade 6 if not specified
UPDATE career_paths
SET min_grade_level = '6'
WHERE grade_category = 'middle'
  AND min_grade_level IS NULL;

-- ============================================
-- STEP 4: Progressive unlocking within high school
-- ============================================

-- Entry high school careers at Grade 9
UPDATE career_paths
SET min_grade_level = '9'
WHERE grade_category = 'high'
  AND career_name IN (
    'Doctor', 'Lawyer', 'Psychologist', 'Software Developer',
    'Data Analyst', 'Financial Advisor', 'Real Estate Agent',
    'Pilot', 'Air Traffic Controller'
  );

-- Advanced careers at Grade 10
UPDATE career_paths
SET min_grade_level = '10'
WHERE grade_category = 'high'
  AND career_name IN (
    'Surgeon', 'Anesthesiologist', 'Psychiatrist',
    'Software Architect', 'Data Scientist', 'AI Specialist',
    'Investment Banker', 'CEO', 'Entrepreneur'
  );

-- Most complex careers at Grade 11
UPDATE career_paths
SET min_grade_level = '11'
WHERE grade_category = 'high'
  AND career_name IN (
    'Neurosurgeon', 'Cardiologist', 'Oncologist',
    'Astronaut', 'Quantum Physicist', 'Biotechnology Researcher',
    'Diplomat', 'Supreme Court Justice', 'Senator'
  );

-- Default high school careers to Grade 9 if not set
UPDATE career_paths
SET min_grade_level = '9'
WHERE grade_category = 'high'
  AND min_grade_level IS NULL;

-- ============================================
-- STEP 5: Handle special cases and defaults
-- ============================================

-- Careers marked as 'all' should be available from K
UPDATE career_paths
SET min_grade_level = 'K',
    max_grade_level = '12'
WHERE grade_category = 'all';

-- Fix any remaining NULL min_grade_level based on category
UPDATE career_paths
SET min_grade_level = CASE
    WHEN grade_category = 'elementary' THEN 'K'
    WHEN grade_category = 'middle' THEN '6'
    WHEN grade_category = 'high' THEN '9'
    ELSE 'K'
END
WHERE min_grade_level IS NULL;

-- Fix any remaining NULL max_grade_level based on category
UPDATE career_paths
SET max_grade_level = CASE
    WHEN grade_category = 'elementary' THEN '5'
    WHEN grade_category = 'middle' THEN '8'
    WHEN grade_category = 'high' THEN '12'
    ELSE '12'
END
WHERE max_grade_level IS NULL;

-- ============================================
-- STEP 6: Verify the progression
-- ============================================

-- Show how many careers unlock at each grade (using the auto-calculated _num columns)
SELECT
    'Grade progression after fix:' as info;

SELECT
    min_grade_level as grade,
    min_grade_level_num as grade_num,
    COUNT(*) as new_careers,
    COUNT(CASE WHEN access_tier = 'select' THEN 1 END) as select_tier,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_tier
FROM career_paths
WHERE is_active = true
GROUP BY min_grade_level, min_grade_level_num
ORDER BY min_grade_level_num;

-- Show cumulative careers by grade
WITH grade_levels AS (
    SELECT 'K' as grade, 0 as num
    UNION SELECT '2', 2
    UNION SELECT '4', 4
    UNION SELECT '6', 6
    UNION SELECT '7', 7
    UNION SELECT '9', 9
    UNION SELECT '10', 10
    UNION SELECT '11', 11
    UNION SELECT '12', 12
)
SELECT
    grade,
    COUNT(cp.*) as total_available,
    COUNT(CASE WHEN cp.access_tier = 'select' THEN 1 END) as select_careers,
    COUNT(CASE WHEN cp.access_tier = 'premium' THEN 1 END) as premium_careers
FROM grade_levels gl
LEFT JOIN career_paths cp ON cp.min_grade_level_num <= gl.num AND cp.is_active = true
GROUP BY gl.grade, gl.num
ORDER BY gl.num;

-- Sample some careers to verify the changes
SELECT
    career_name,
    grade_category,
    min_grade_level,
    max_grade_level,
    min_grade_level_num,
    max_grade_level_num,
    access_tier
FROM career_paths
WHERE career_name IN ('Teacher', 'Nurse', 'Scientist', 'Programmer', 'Engineer', 'Doctor', 'Surgeon', 'Astronaut')
ORDER BY min_grade_level_num, career_name;