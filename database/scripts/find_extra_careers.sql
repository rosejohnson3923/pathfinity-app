-- Find careers in database that are NOT in pathIQService.ts
-- Based on the 69 unique careers we found in the code

-- List of all 69 careers from pathIQService.ts
WITH careers_in_code AS (
    SELECT unnest(ARRAY[
        -- KINDERGARTEN (7)
        'teacher', 'doctor', 'firefighter', 'police-officer',
        'veterinarian', 'chef', 'artist',

        -- ELEMENTARY (adds 12 more unique)
        'librarian', 'coach', 'crossing-guard', 'nurse', 'dentist',
        'park-ranger', 'bus-driver', 'mail-carrier', 'grocery-worker',
        'janitor', 'cafeteria-worker', 'musician',

        -- MIDDLE_SCHOOL (adds more unique)
        'programmer', 'game-developer', 'youtuber', 'web-designer',
        'entrepreneur', 'manager', 'real-estate-agent', 'bank-teller',
        'writer', 'photographer', 'graphic-designer', 'journalist',
        'engineer', 'scientist', 'environmental-scientist', 'electrician',
        'plumber', 'carpenter', 'athlete', 'dancer', 'lawyer', 'social-worker',

        -- HIGH_SCHOOL (adds more unique)
        'ai-engineer', 'data-scientist', 'cybersecurity-specialist',
        'cloud-architect', 'blockchain-developer', 'robotics-engineer',
        'software-engineer', 'aerospace-engineer', 'biotech-researcher',
        'renewable-energy-engineer', 'ux-designer', 'architect',
        'app-developer', 'ceo', 'investment-banker', 'marketing-director',
        'financial-analyst', 'surgeon', 'psychiatrist', 'pharmacist',
        'mental-health-counselor', 'social-media-strategist',
        'podcast-producer', 'video-game-designer', 'sustainability-consultant',
        'drone-operator', 'space-industry-worker', 'policy-advisor'
    ]) AS career_code
)
SELECT
    'EXTRA CAREERS IN DATABASE' as status,
    cp.career_code,
    cp.career_name,
    cp.access_tier,
    cp.grade_category,
    cp.created_at
FROM career_paths cp
LEFT JOIN careers_in_code cic ON cp.career_code = cic.career_code
WHERE cic.career_code IS NULL
ORDER BY cp.created_at, cp.career_code;

-- Count summary
SELECT
    'SUMMARY' as report,
    (SELECT COUNT(*) FROM career_paths) as total_in_database,
    (SELECT COUNT(*) FROM careers_in_code) as expected_from_code,
    (SELECT COUNT(*)
     FROM career_paths cp
     LEFT JOIN careers_in_code cic ON cp.career_code = cic.career_code
     WHERE cic.career_code IS NULL) as extra_in_database;

-- Also check if any careers from code are MISSING from database
WITH careers_in_code AS (
    SELECT unnest(ARRAY[
        'teacher', 'doctor', 'firefighter', 'police-officer',
        'veterinarian', 'chef', 'artist', 'librarian', 'coach',
        'crossing-guard', 'nurse', 'dentist', 'park-ranger',
        'bus-driver', 'mail-carrier', 'grocery-worker', 'janitor',
        'cafeteria-worker', 'musician', 'programmer', 'game-developer',
        'youtuber', 'web-designer', 'entrepreneur', 'manager',
        'real-estate-agent', 'bank-teller', 'writer', 'photographer',
        'graphic-designer', 'journalist', 'engineer', 'scientist',
        'environmental-scientist', 'electrician', 'plumber', 'carpenter',
        'athlete', 'dancer', 'lawyer', 'social-worker', 'ai-engineer',
        'data-scientist', 'cybersecurity-specialist', 'cloud-architect',
        'blockchain-developer', 'robotics-engineer', 'software-engineer',
        'aerospace-engineer', 'biotech-researcher', 'renewable-energy-engineer',
        'ux-designer', 'architect', 'app-developer', 'ceo',
        'investment-banker', 'marketing-director', 'financial-analyst',
        'surgeon', 'psychiatrist', 'pharmacist', 'mental-health-counselor',
        'social-media-strategist', 'podcast-producer', 'video-game-designer',
        'sustainability-consultant', 'drone-operator', 'space-industry-worker',
        'policy-advisor'
    ]) AS career_code
)
SELECT
    'MISSING FROM DATABASE' as status,
    cic.career_code
FROM careers_in_code cic
LEFT JOIN career_paths cp ON cic.career_code = cp.career_code
WHERE cp.career_code IS NULL;