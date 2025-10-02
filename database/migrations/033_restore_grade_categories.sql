-- Restore grade_category assignments and fix grade progression
-- This ensures careers are properly categorized by educational level

-- ============================================
-- STEP 1: Assign grade_category based on career complexity
-- ============================================

UPDATE career_paths
SET grade_category = CASE
    -- Elementary careers (K-5): Simple, foundational careers kids understand
    WHEN career_name IN (
        'Teacher', 'Artist', 'Chef', 'Baker', 'Musician',
        'Police Officer', 'Firefighter', 'Athlete', 'Coach',
        'Farmer', 'Librarian', 'Nurse', 'Veterinarian',
        'Photographer', 'Writer', 'Actor', 'Singer',
        'Dancer', 'Painter', 'Zookeeper', 'Park Ranger',
        'Mail Carrier', 'Bus Driver', 'Train Conductor',
        'Pilot', 'Flight Attendant', 'Dentist', 'Doctor'
    ) THEN 'elementary'

    -- Middle school careers (6-8): More complex, introducing specialization
    WHEN career_name IN (
        'Scientist', 'Engineer', 'Architect', 'Graphic Designer',
        'Web Developer', 'Game Designer', 'Animator', 'Video Editor',
        'Journalist', 'Radio Host', 'TV Producer', 'Fashion Designer',
        'Interior Designer', 'Mechanic', 'Electrician', 'Plumber',
        'Carpenter', 'Construction Worker', 'Real Estate Agent',
        'Bank Teller', 'Accountant', 'Marketing Manager',
        'Social Media Manager', 'YouTuber', 'Podcaster',
        'Environmental Scientist', 'Marine Biologist', 'Archaeologist',
        'Historian', 'Translator', 'Tour Guide', 'Hotel Manager'
    ) THEN 'middle'

    -- High school careers (9-12): Complex, specialized, require advanced thinking
    WHEN career_name IN (
        'Software Engineer', 'Data Scientist', 'AI Specialist',
        'Cybersecurity Expert', 'Blockchain Developer', 'Machine Learning Engineer',
        'Surgeon', 'Psychiatrist', 'Pharmacist', 'Research Scientist',
        'Lawyer', 'Judge', 'Investment Banker', 'Financial Analyst',
        'CEO', 'Entrepreneur', 'Management Consultant', 'Product Manager',
        'UX Designer', 'Film Director', 'Sound Engineer', 'Special Effects Artist',
        'Aerospace Engineer', 'Biomedical Engineer', 'Chemical Engineer',
        'Nuclear Engineer', 'Robotics Engineer', 'Quantum Computing Researcher',
        'Therapist', 'Counselor', 'Social Worker', 'Psychologist',
        'Urban Planner', 'Economist', 'Policy Analyst', 'Diplomat'
    ) THEN 'high'

    -- Default to 'all' for careers that span multiple levels
    ELSE 'all'
END
WHERE is_active = true;

-- ============================================
-- STEP 2: Set proper min/max grade levels based on category
-- ============================================

UPDATE career_paths
SET
    min_grade_level = CASE grade_category
        WHEN 'elementary' THEN 'K'
        WHEN 'middle' THEN '6'
        WHEN 'high' THEN '9'
        WHEN 'all' THEN 'K'
        ELSE COALESCE(min_grade_level, 'K')
    END,
    max_grade_level = CASE grade_category
        WHEN 'elementary' THEN '5'
        WHEN 'middle' THEN '8'
        WHEN 'high' THEN '12'
        WHEN 'all' THEN '12'
        ELSE COALESCE(max_grade_level, '12')
    END
WHERE is_active = true
  AND (min_grade_level IS NULL OR grade_category IS NOT NULL);

-- ============================================
-- STEP 3: Progressive unlocking adjustments
-- Some careers should unlock earlier within their category
-- ============================================

-- Early elementary careers (Kindergarten)
UPDATE career_paths
SET min_grade_level = 'K'
WHERE career_name IN (
    'Teacher', 'Police Officer', 'Firefighter', 'Doctor',
    'Chef', 'Artist', 'Musician', 'Athlete'
)
AND is_active = true;

-- Grade 2 careers (still elementary but slightly more complex)
UPDATE career_paths
SET min_grade_level = '2'
WHERE career_name IN (
    'Veterinarian', 'Nurse', 'Librarian', 'Farmer',
    'Baker', 'Photographer', 'Writer', 'Actor'
)
AND is_active = true;

-- Grade 4 careers (upper elementary)
UPDATE career_paths
SET min_grade_level = '4'
WHERE career_name IN (
    'Scientist', 'Engineer', 'Architect', 'Pilot',
    'Zookeeper', 'Park Ranger', 'Dentist'
)
AND is_active = true;

-- Early middle school (Grade 6)
UPDATE career_paths
SET min_grade_level = '6'
WHERE career_name IN (
    'Game Designer', 'Web Developer', 'Graphic Designer',
    'Journalist', 'YouTuber', 'Environmental Scientist'
)
AND is_active = true;

-- Grade 7 careers
UPDATE career_paths
SET min_grade_level = '7'
WHERE career_name IN (
    'Marine Biologist', 'Archaeologist', 'Social Media Manager',
    'Video Editor', 'Fashion Designer', 'Interior Designer'
)
AND is_active = true;

-- High school entry (Grade 9)
UPDATE career_paths
SET min_grade_level = '9'
WHERE career_name IN (
    'Software Engineer', 'Data Scientist', 'Lawyer',
    'Investment Banker', 'Surgeon', 'Therapist'
)
AND is_active = true;

-- Grade 10 careers (more specialized)
UPDATE career_paths
SET min_grade_level = '10'
WHERE career_name IN (
    'AI Specialist', 'Cybersecurity Expert', 'Product Manager',
    'UX Designer', 'Aerospace Engineer', 'Psychiatrist'
)
AND is_active = true;

-- Grade 11 careers (highly specialized)
UPDATE career_paths
SET min_grade_level = '11'
WHERE career_name IN (
    'Blockchain Developer', 'Machine Learning Engineer',
    'Quantum Computing Researcher', 'Nuclear Engineer'
)
AND is_active = true;

-- ============================================
-- STEP 4: Ensure Therapist is correctly categorized
-- ============================================

UPDATE career_paths
SET
    grade_category = 'high',
    min_grade_level = '9',
    max_grade_level = '12'
WHERE career_name = 'Therapist'
  AND is_active = true;

-- ============================================
-- STEP 5: Verify the fix
-- ============================================

-- Check distribution by grade category
SELECT
    grade_category,
    COUNT(*) as total_careers,
    COUNT(CASE WHEN access_tier = 'select' THEN 1 END) as select_careers,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_careers
FROM career_paths
WHERE is_active = true
GROUP BY grade_category
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
        WHEN 'all' THEN 4
    END;

-- Check Therapist specifically
SELECT
    'Therapist Check:' as info,
    career_name,
    grade_category,
    min_grade_level,
    min_grade_level_num,
    access_tier
FROM career_paths
WHERE career_name = 'Therapist'
  AND is_active = true;

-- Show careers available at Kindergarten (Select tier only)
SELECT
    'Kindergarten Select Careers:' as info,
    COUNT(*) as total,
    STRING_AGG(career_name, ', ' ORDER BY career_name) as careers
FROM career_paths
WHERE access_tier = 'select'
  AND min_grade_level_num <= 0
  AND is_active = true;

-- Distribution by grade level
WITH grade_levels AS (
    SELECT 'K' as grade, 0 as num
    UNION SELECT '1', 1 UNION SELECT '2', 2 UNION SELECT '3', 3
    UNION SELECT '4', 4 UNION SELECT '5', 5 UNION SELECT '6', 6
    UNION SELECT '7', 7 UNION SELECT '8', 8 UNION SELECT '9', 9
    UNION SELECT '10', 10 UNION SELECT '11', 11 UNION SELECT '12', 12
)
SELECT
    gl.grade,
    COUNT(DISTINCT cp.career_name) as total_careers,
    COUNT(DISTINCT CASE WHEN cp.min_grade_level_num = gl.num THEN cp.career_name END) as new_at_grade
FROM grade_levels gl
LEFT JOIN career_paths cp ON cp.min_grade_level_num <= gl.num
    AND cp.is_active = true
GROUP BY gl.grade, gl.num
ORDER BY gl.num;