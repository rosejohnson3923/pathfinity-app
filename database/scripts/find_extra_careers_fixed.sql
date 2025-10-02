-- Find careers in database that are NOT in pathIQService.ts
-- Create a temporary table with all careers from the code

CREATE TEMP TABLE IF NOT EXISTS careers_from_code (career_code TEXT);
TRUNCATE careers_from_code;

-- Insert all 69 unique careers from pathIQService.ts
INSERT INTO careers_from_code VALUES
    -- KINDERGARTEN (7)
    ('teacher'), ('doctor'), ('firefighter'), ('police-officer'),
    ('veterinarian'), ('chef'), ('artist'),

    -- ELEMENTARY unique additions
    ('librarian'), ('coach'), ('crossing-guard'), ('nurse'), ('dentist'),
    ('park-ranger'), ('bus-driver'), ('mail-carrier'), ('grocery-worker'),
    ('janitor'), ('cafeteria-worker'), ('musician'),

    -- MIDDLE_SCHOOL unique additions
    ('programmer'), ('game-developer'), ('youtuber'), ('web-designer'),
    ('entrepreneur'), ('manager'), ('real-estate-agent'), ('bank-teller'),
    ('writer'), ('photographer'), ('graphic-designer'), ('journalist'),
    ('engineer'), ('scientist'), ('environmental-scientist'), ('electrician'),
    ('plumber'), ('carpenter'), ('athlete'), ('dancer'), ('lawyer'), ('social-worker'),

    -- HIGH_SCHOOL unique additions
    ('ai-engineer'), ('data-scientist'), ('cybersecurity-specialist'),
    ('cloud-architect'), ('blockchain-developer'), ('robotics-engineer'),
    ('software-engineer'), ('aerospace-engineer'), ('biotech-researcher'),
    ('renewable-energy-engineer'), ('ux-designer'), ('architect'),
    ('app-developer'), ('ceo'), ('investment-banker'), ('marketing-director'),
    ('financial-analyst'), ('surgeon'), ('psychiatrist'), ('pharmacist'),
    ('mental-health-counselor'), ('social-media-strategist'),
    ('podcast-producer'), ('video-game-designer'), ('sustainability-consultant'),
    ('drone-operator'), ('space-industry-worker'), ('policy-advisor');

-- Find EXTRA careers (in DB but not in code)
SELECT
    '🔴 EXTRA IN DATABASE (not in pathIQService.ts)' as status,
    cp.career_code,
    cp.career_name,
    cp.icon,
    cp.access_tier,
    cp.grade_category,
    cp.created_at::date as added_date
FROM career_paths cp
LEFT JOIN careers_from_code cfc ON cp.career_code = cfc.career_code
WHERE cfc.career_code IS NULL
ORDER BY cp.career_code;

-- Find MISSING careers (in code but not in DB)
SELECT
    '⚠️ MISSING FROM DATABASE (exists in pathIQService.ts)' as status,
    cfc.career_code
FROM careers_from_code cfc
LEFT JOIN career_paths cp ON cfc.career_code = cp.career_code
WHERE cp.career_code IS NULL
ORDER BY cfc.career_code;

-- Summary
SELECT
    '📊 SUMMARY' as report,
    (SELECT COUNT(*) FROM career_paths) as careers_in_database,
    (SELECT COUNT(*) FROM careers_from_code) as expected_from_code,
    (SELECT COUNT(*)
     FROM career_paths cp
     LEFT JOIN careers_from_code cfc ON cp.career_code = cfc.career_code
     WHERE cfc.career_code IS NULL) as extra_careers,
    (SELECT COUNT(*)
     FROM careers_from_code cfc
     LEFT JOIN career_paths cp ON cfc.career_code = cp.career_code
     WHERE cp.career_code IS NULL) as missing_careers;

-- Clean up
DROP TABLE IF EXISTS careers_from_code;