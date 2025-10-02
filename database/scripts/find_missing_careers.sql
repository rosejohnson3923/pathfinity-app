-- Check what careers are in the database
CREATE TEMP TABLE careers_in_db AS
SELECT DISTINCT career_code
FROM career_paths
WHERE career_code IS NOT NULL
ORDER BY career_code;

-- List of all careers that should exist based on pathIQService.ts
CREATE TEMP TABLE expected_careers (career_code TEXT);
INSERT INTO expected_careers VALUES
-- KINDERGARTEN_CAREERS
('teacher'),
('doctor'),
('firefighter'),
('police-officer'),
('veterinarian'),
('chef'),
('artist'),

-- ELEMENTARY_CAREERS
('librarian'),
('coach'),
('crossing-guard'),
('nurse'),
('dentist'),
('park-ranger'),
('bus-driver'),
('mail-carrier'),
('grocery-worker'),
('janitor'),
('cafeteria-worker'),
('musician'),

-- MIDDLE_SCHOOL_CAREERS
('programmer'),
('game-developer'),
('youtuber'),
('web-designer'),
('entrepreneur'),
('manager'),
('real-estate-agent'),
('bank-teller'),
('writer'),
('photographer'),
('graphic-designer'),
('journalist'),
('engineer'),
('scientist'),
('environmental-scientist'),
('electrician'),
('plumber'),
('carpenter'),
('athlete'),
('dancer'),
('lawyer'),
('social-worker'),

-- HIGH_SCHOOL_CAREERS (need to check what's actually in the file)
('ai-engineer'),
('data-scientist'),
('cybersecurity-specialist'),
('cloud-architect'),
('blockchain-developer'),
('robotics-engineer'),
('software-engineer'),
('aerospace-engineer'),
('biotech-researcher'),
('renewable-energy-engineer'),
('ux-designer'),
('architect'),
('app-developer'),
('ceo'),
('investment-banker'),
('marketing-director'),
('financial-analyst'),
('surgeon'),
('psychiatrist'),
('pharmacist'),
('mental-health-counselor'),
('social-media-strategist'),
('podcast-producer'),
('video-game-designer'),
('sustainability-consultant'),
('drone-operator'),
('space-industry-worker'),
('policy-advisor');

-- Find missing careers
SELECT
    'MISSING FROM DATABASE' as status,
    e.career_code
FROM expected_careers e
LEFT JOIN careers_in_db d ON e.career_code = d.career_code
WHERE d.career_code IS NULL
ORDER BY e.career_code;

-- Count comparison
SELECT
    'Summary' as report,
    (SELECT COUNT(*) FROM expected_careers) as expected_count,
    (SELECT COUNT(*) FROM careers_in_db) as actual_count,
    (SELECT COUNT(*) FROM expected_careers e LEFT JOIN careers_in_db d ON e.career_code = d.career_code WHERE d.career_code IS NULL) as missing_count;