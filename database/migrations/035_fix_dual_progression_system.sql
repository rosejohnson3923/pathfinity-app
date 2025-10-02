-- Fix career progression with proper inter/intra category logic
-- Elementary has intra-category progression (K, 2, 4)
-- Middle and High have NO intra-category progression

-- ============================================
-- STEP 1: Set all careers to reasonable defaults
-- ============================================

UPDATE career_paths
SET
    grade_category = COALESCE(grade_category, 'high'),
    min_grade_level = COALESCE(min_grade_level, '9'),
    max_grade_level = '12'  -- Max is always 12 since careers never disappear
WHERE is_active = true;

-- ============================================
-- STEP 2: Assign careers to proper categories
-- ============================================

-- ELEMENTARY careers (simple, familiar to young children)
UPDATE career_paths
SET
    grade_category = 'elementary',
    min_grade_level = 'K'  -- Will be adjusted for intra-progression
WHERE career_name IN (
    'Teacher', 'Police Officer', 'Firefighter', 'Doctor',
    'Nurse', 'Veterinarian', 'Chef', 'Baker',
    'Artist', 'Musician', 'Singer', 'Dancer',
    'Athlete', 'Coach', 'Farmer', 'Librarian',
    'Pilot', 'Train Conductor', 'Bus Driver', 'Mail Carrier',
    'Zookeeper', 'Park Ranger', 'Photographer', 'Writer',
    'Actor', 'Painter', 'Dentist', 'Construction Worker'
) AND is_active = true;

-- MIDDLE SCHOOL careers (more complex, career exploration)
UPDATE career_paths
SET
    grade_category = 'middle',
    min_grade_level = '6'  -- ALL available at grade 6
WHERE career_name IN (
    'Engineer', 'Scientist', 'Architect', 'Game Designer',
    'Web Developer', 'Graphic Designer', 'YouTuber', 'Animator',
    'Journalist', 'Video Editor', 'Fashion Designer', 'Interior Designer',
    'Environmental Scientist', 'Marine Biologist', 'Archaeologist',
    'Mechanic', 'Electrician', 'Plumber', 'Carpenter',
    'Real Estate Agent', 'Bank Teller', 'Accountant', 'Marketing Manager',
    'Social Media Manager', 'Podcaster', 'Radio Host', 'TV Producer',
    'Translator', 'Tour Guide', 'Hotel Manager', 'Event Planner'
) AND is_active = true;

-- HIGH SCHOOL careers (specialized, complex, require mature understanding)
UPDATE career_paths
SET
    grade_category = 'high',
    min_grade_level = '9'  -- ALL available at grade 9
WHERE career_name IN (
    'Software Engineer', 'Data Scientist', 'AI Specialist',
    'Cybersecurity Expert', 'Blockchain Developer', 'Machine Learning Engineer',
    'Lawyer', 'Judge', 'Surgeon', 'Psychiatrist', 'Therapist',
    'Pharmacist', 'Research Scientist', 'Investment Banker',
    'Financial Analyst', 'CEO', 'Entrepreneur', 'Management Consultant',
    'Product Manager', 'UX Designer', 'Film Director', 'Sound Engineer',
    'Aerospace Engineer', 'Biomedical Engineer', 'Chemical Engineer',
    'Nuclear Engineer', 'Robotics Engineer', 'Quantum Computing Researcher',
    'Counselor', 'Social Worker', 'Psychologist', 'Urban Planner',
    'Economist', 'Policy Analyst', 'Diplomat', 'Philosopher'
) AND is_active = true;

-- ============================================
-- STEP 3: Set INTRA-category progression for ELEMENTARY ONLY
-- ============================================

-- Elementary Wave 1: Kindergarten (most basic, familiar careers)
UPDATE career_paths
SET min_grade_level = 'K'
WHERE grade_category = 'elementary'
AND career_name IN (
    'Teacher', 'Police Officer', 'Firefighter', 'Doctor',
    'Chef', 'Artist', 'Farmer', 'Athlete'
) AND is_active = true;

-- Elementary Wave 2: Grade 2 (slightly more complex)
UPDATE career_paths
SET min_grade_level = '2'
WHERE grade_category = 'elementary'
AND career_name IN (
    'Nurse', 'Veterinarian', 'Baker', 'Musician',
    'Singer', 'Dancer', 'Coach', 'Librarian'
) AND is_active = true;

-- Elementary Wave 3: Grade 4 (upper elementary)
UPDATE career_paths
SET min_grade_level = '4'
WHERE grade_category = 'elementary'
AND career_name IN (
    'Pilot', 'Train Conductor', 'Bus Driver', 'Mail Carrier',
    'Zookeeper', 'Park Ranger', 'Photographer', 'Writer',
    'Actor', 'Painter', 'Dentist', 'Construction Worker'
) AND is_active = true;

-- ============================================
-- STEP 4: Ensure Therapist is HIGH SCHOOL
-- ============================================

UPDATE career_paths
SET
    grade_category = 'high',
    min_grade_level = '9',
    max_grade_level = '12'
WHERE career_name = 'Therapist'
  AND is_active = true;

-- ============================================
-- STEP 5: Verify the distribution
-- ============================================

-- Check what each grade level will see
WITH grade_analysis AS (
    SELECT
        0 as grade_num, 'K' as grade_label,
        COUNT(*) as careers_available
    FROM career_paths
    WHERE grade_category = 'elementary'
      AND min_grade_level_num <= 0
      AND is_active = true

    UNION ALL

    SELECT
        2 as grade_num, '2' as grade_label,
        COUNT(*) as careers_available
    FROM career_paths
    WHERE grade_category = 'elementary'
      AND min_grade_level_num <= 2
      AND is_active = true

    UNION ALL

    SELECT
        4 as grade_num, '4' as grade_label,
        COUNT(*) as careers_available
    FROM career_paths
    WHERE grade_category = 'elementary'
      AND min_grade_level_num <= 4
      AND is_active = true

    UNION ALL

    SELECT
        6 as grade_num, '6' as grade_label,
        COUNT(*) as careers_available
    FROM career_paths
    WHERE grade_category IN ('elementary', 'middle')
      AND is_active = true

    UNION ALL

    SELECT
        9 as grade_num, '9' as grade_label,
        COUNT(*) as careers_available
    FROM career_paths
    WHERE is_active = true  -- See ALL careers
)
SELECT * FROM grade_analysis ORDER BY grade_num;

-- Check category distribution
SELECT
    grade_category,
    COUNT(*) as total_careers,
    COUNT(CASE WHEN access_tier = 'select' THEN 1 END) as select_tier,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_tier,
    STRING_AGG(DISTINCT min_grade_level, ', ' ORDER BY min_grade_level) as unlock_grades
FROM career_paths
WHERE is_active = true
GROUP BY grade_category
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
        ELSE 4
    END;

-- Verify Therapist
SELECT
    'Therapist Check:' as info,
    career_name,
    grade_category,
    min_grade_level,
    access_tier
FROM career_paths
WHERE career_name = 'Therapist'
  AND is_active = true;

-- Show K-Select careers (should be ~8)
SELECT
    'Kindergarten Select Tier:' as info,
    COUNT(*) as count,
    STRING_AGG(career_name, ', ' ORDER BY career_name) as careers
FROM career_paths
WHERE grade_category = 'elementary'
  AND min_grade_level = 'K'
  AND access_tier = 'select'
  AND is_active = true;