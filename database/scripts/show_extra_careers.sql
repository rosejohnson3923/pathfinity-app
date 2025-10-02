-- Show the 10 extra careers that are in database but NOT in pathIQService.ts

CREATE TEMP TABLE IF NOT EXISTS careers_from_code (career_code TEXT);
TRUNCATE careers_from_code;

-- Insert all 69 unique careers from pathIQService.ts
INSERT INTO careers_from_code VALUES
    -- From KINDERGARTEN/ELEMENTARY/MIDDLE/HIGH arrays
    ('teacher'), ('doctor'), ('firefighter'), ('police-officer'),
    ('veterinarian'), ('chef'), ('artist'), ('librarian'), ('coach'),
    ('crossing-guard'), ('nurse'), ('dentist'), ('park-ranger'),
    ('bus-driver'), ('mail-carrier'), ('grocery-worker'), ('janitor'),
    ('cafeteria-worker'), ('musician'), ('programmer'), ('game-developer'),
    ('youtuber'), ('web-designer'), ('entrepreneur'), ('manager'),
    ('real-estate-agent'), ('bank-teller'), ('writer'), ('photographer'),
    ('graphic-designer'), ('journalist'), ('engineer'), ('scientist'),
    ('environmental-scientist'), ('electrician'), ('plumber'), ('carpenter'),
    ('athlete'), ('dancer'), ('lawyer'), ('social-worker'), ('ai-engineer'),
    ('data-scientist'), ('cybersecurity-specialist'), ('cloud-architect'),
    ('blockchain-developer'), ('robotics-engineer'), ('software-engineer'),
    ('aerospace-engineer'), ('biotech-researcher'), ('renewable-energy-engineer'),
    ('ux-designer'), ('architect'), ('app-developer'), ('ceo'),
    ('investment-banker'), ('marketing-director'), ('financial-analyst'),
    ('surgeon'), ('psychiatrist'), ('pharmacist'), ('mental-health-counselor'),
    ('social-media-strategist'), ('podcast-producer'), ('video-game-designer'),
    ('sustainability-consultant'), ('drone-operator'), ('space-industry-worker'),
    ('policy-advisor');

-- Show the 10 extra careers with all their details
SELECT
    cp.career_code,
    cp.career_name,
    cp.icon,
    cp.access_tier,
    cp.grade_category,
    cp.description,
    cp.created_at::timestamp as when_added
FROM career_paths cp
LEFT JOIN careers_from_code cfc ON cp.career_code = cfc.career_code
WHERE cfc.career_code IS NULL
ORDER BY cp.career_code;

DROP TABLE careers_from_code;