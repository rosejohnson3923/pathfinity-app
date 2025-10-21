-- ============================================
-- Add Middle School Companies to CCM
-- Updates grade_category to use: elementary, middle, high
-- Classifies existing companies by employee count
-- Creates 10 new middle school companies
-- ============================================

-- ============================================
-- 1. UPDATE DATA FIRST (before adding constraints)
-- ============================================

-- Update existing "other" companies to "high" (all have >1,000 employees)
UPDATE ccm_company_rooms
SET grade_category = 'high'
WHERE code IN (
    'TRENDFWD',      -- 15,000 employees
    'QUICKSERVE',    -- 50,000 employees
    'HORIZON',       -- 8,000 employees
    'SKYCONNECT',    -- 25,000 employees
    'GREENGRID',     -- 4,000 employees
    'CLOUDPEAK',     -- 3,000 employees
    'MEDICORE',      -- 5,000 employees
    'NEXTGEN',       -- 20,000 employees
    'PLAYFORGE',     -- 2,000 employees
    'BUILDRIGHT'     -- 10,000 employees
);

-- Elementary companies should already be 'elementary', but ensure it
UPDATE ccm_company_rooms
SET grade_category = 'elementary'
WHERE code LIKE '%_ELEM';

-- ============================================
-- 2. NOW ADD SCHEMA CONSTRAINTS (after data is correct)
-- ============================================

-- Drop old constraint
ALTER TABLE ccm_company_rooms DROP CONSTRAINT IF EXISTS ccm_company_rooms_grade_category_check;
ALTER TABLE ccm_business_scenarios DROP CONSTRAINT IF EXISTS ccm_business_scenarios_grade_category_check;

-- Add new constraint with elementary, middle, high
ALTER TABLE ccm_company_rooms
ADD CONSTRAINT ccm_company_rooms_grade_category_check
CHECK (grade_category IN ('elementary', 'middle', 'high'));

ALTER TABLE ccm_business_scenarios
ADD CONSTRAINT ccm_business_scenarios_grade_category_check
CHECK (grade_category IN ('elementary', 'middle', 'high'));

-- ============================================
-- 3. CREATE 10 NEW MIDDLE SCHOOL COMPANIES
-- ============================================
-- Small-to-medium businesses (<1,000 employees)
-- Relatable to middle school students (ages 11-14)

-- 1. BEANBUZZ - Local Coffee Shop Chain
INSERT INTO ccm_company_rooms (
    code, name, industry_id, description,
    company_size, company_age, company_values,
    revenue, headquarters, known_for,
    color_scheme, logo_icon, is_active, grade_category
) VALUES (
    'BEANBUZZ',
    'BeanBuzz Coffee',
    (SELECT id FROM cc_industries WHERE code = 'FOOD' LIMIT 1),
    'A growing chain of neighborhood coffee shops known for friendly service and community atmosphere',
    '350 employees',
    8,
    ARRAY['Community connection', 'Quality ingredients', 'Friendly service']::text[],
    '$12M revenue',
    'Portland, OR',
    'Cozy cafes and locally-roasted coffee',
    '{"primary": "#8B4513", "secondary": "#654321", "accent": "#D2691E"}'::jsonb,
    '☕',
    true,
    'middle'
);

-- 2. PAGECRAFT - Regional Bookstore Chain
INSERT INTO ccm_company_rooms (
    code, name, industry_id, description,
    company_size, company_age, company_values,
    revenue, headquarters, known_for,
    color_scheme, logo_icon, is_active, grade_category
) VALUES (
    'PAGECRAFT',
    'PageCraft Books',
    (SELECT id FROM cc_industries WHERE code = 'RETAIL' LIMIT 1),
    'Independent bookstore chain with cozy reading spaces and community events',
    '280 employees',
    12,
    ARRAY['Love of reading', 'Community gathering', 'Local authors']::text[],
    '$9M revenue',
    'Austin, TX',
    'Author events and book clubs',
    '{"primary": "#4A5568", "secondary": "#2D3748", "accent": "#718096"}'::jsonb,
    '📚',
    true,
    'middle'
);

-- 3. ACTIVELIFE - Recreation Center Chain
INSERT INTO ccm_company_rooms (
    code, name, industry_id, description,
    company_size, company_age, company_values,
    revenue, headquarters, known_for,
    color_scheme, logo_icon, is_active, grade_category
) VALUES (
    'ACTIVELIFE',
    'ActiveLife Recreation',
    (SELECT id FROM cc_industries WHERE code = 'HEALTH' LIMIT 1),
    'Community recreation centers offering sports, fitness, and youth programs',
    '520 employees',
    15,
    ARRAY['Healthy living', 'Community wellness', 'Youth development']::text[],
    '$18M revenue',
    'Denver, CO',
    'Family-friendly fitness and sports programs',
    '{"primary": "#10B981", "secondary": "#059669", "accent": "#34D399"}'::jsonb,
    '🏃',
    true,
    'middle'
);

-- 4. PAWPARADISE - Pet Supply Store Chain
INSERT INTO ccm_company_rooms (
    code, name, industry_id, description,
    company_size, company_age, company_values,
    revenue, headquarters, known_for,
    color_scheme, logo_icon, is_active, grade_category
) VALUES (
    'PAWPARADISE',
    'Paw Paradise',
    (SELECT id FROM cc_industries WHERE code = 'RETAIL' LIMIT 1),
    'Regional pet supply stores with grooming services and adoption events',
    '420 employees',
    10,
    ARRAY['Pet welfare', 'Customer education', 'Community support']::text[],
    '$14M revenue',
    'Seattle, WA',
    'Natural pet products and expert advice',
    '{"primary": "#F59E0B", "secondary": "#D97706", "accent": "#FBBF24"}'::jsonb,
    '🐾',
    true,
    'middle'
);

-- 5. SLICECITY - Regional Pizza Chain
INSERT INTO ccm_company_rooms (
    code, name, industry_id, description,
    company_size, company_age, company_values,
    revenue, headquarters, known_for,
    color_scheme, logo_icon, is_active, grade_category
) VALUES (
    'SLICECITY',
    'Slice City Pizza',
    (SELECT id FROM cc_industries WHERE code = 'FOOD' LIMIT 1),
    'Fast-casual pizza restaurants with fresh ingredients and community fundraisers',
    '650 employees',
    9,
    ARRAY['Fresh ingredients', 'Community support', 'Fast service']::text[],
    '$22M revenue',
    'Chicago, IL',
    'New York style pizza and school fundraisers',
    '{"primary": "#EF4444", "secondary": "#DC2626", "accent": "#F87171"}'::jsonb,
    '🍕',
    true,
    'middle'
);

-- 6. FITFUSION - Fitness Studio Chain
INSERT INTO ccm_company_rooms (
    code, name, industry_id, description,
    company_size, company_age, company_values,
    revenue, headquarters, known_for,
    color_scheme, logo_icon, is_active, grade_category
) VALUES (
    'FITFUSION',
    'FitFusion Studios',
    (SELECT id FROM cc_industries WHERE code = 'HEALTH' LIMIT 1),
    'Boutique fitness studios offering yoga, cycling, and strength training classes',
    '380 employees',
    6,
    ARRAY['Personal attention', 'Results-focused', 'Supportive community']::text[],
    '$11M revenue',
    'San Diego, CA',
    'Small class sizes and energetic instructors',
    '{"primary": "#8B5CF6", "secondary": "#7C3AED", "accent": "#A78BFA"}'::jsonb,
    '💪',
    true,
    'middle'
);

-- 7. ARTBOX - Art Supply Store Chain
INSERT INTO ccm_company_rooms (
    code, name, industry_id, description,
    company_size, company_age, company_values,
    revenue, headquarters, known_for,
    color_scheme, logo_icon, is_active, grade_category
) VALUES (
    'ARTBOX',
    'ArtBox Creative',
    (SELECT id FROM cc_industries WHERE code = 'RETAIL' LIMIT 1),
    'Creative supply stores offering art materials and free workshops',
    '290 employees',
    11,
    ARRAY['Creative expression', 'Arts education', 'Community workshops']::text[],
    '$10M revenue',
    'Nashville, TN',
    'Weekend art classes and project inspiration',
    '{"primary": "#EC4899", "secondary": "#DB2777", "accent": "#F472B6"}'::jsonb,
    '🎨',
    true,
    'middle'
);

-- 8. SCOOPSHOP - Regional Ice Cream Chain
INSERT INTO ccm_company_rooms (
    code, name, industry_id, description,
    company_size, company_age, company_values,
    revenue, headquarters, known_for,
    color_scheme, logo_icon, is_active, grade_category
) VALUES (
    'SCOOPSHOP',
    'The Scoop Shop',
    (SELECT id FROM cc_industries WHERE code = 'FOOD' LIMIT 1),
    'Artisan ice cream shops with creative flavors and birthday party events',
    '310 employees',
    7,
    ARRAY['Handcrafted quality', 'Fun flavors', 'Family memories']::text[],
    '$8M revenue',
    'Burlington, VT',
    'Unique flavors and ice cream socials',
    '{"primary": "#06B6D4", "secondary": "#0891B2", "accent": "#22D3EE"}'::jsonb,
    '🍦',
    true,
    'middle'
);

-- 9. QUESTGAMES - Game & Hobby Shop Chain
INSERT INTO ccm_company_rooms (
    code, name, industry_id, description,
    company_size, company_age, company_values,
    revenue, headquarters, known_for,
    color_scheme, logo_icon, is_active, grade_category
) VALUES (
    'QUESTGAMES',
    'Quest Games & Hobbies',
    (SELECT id FROM cc_industries WHERE code = 'RETAIL' LIMIT 1),
    'Specialty stores for board games, card games, and hobby supplies with game nights',
    '240 employees',
    13,
    ARRAY['Gaming community', 'Strategic thinking', 'Social connection']::text[],
    '$7M revenue',
    'Madison, WI',
    'Weekly game tournaments and demo events',
    '{"primary": "#6366F1", "secondary": "#4F46E5", "accent": "#818CF8"}'::jsonb,
    '🎲',
    true,
    'middle'
);

-- 10. TRAILBOUND - Outdoor Gear Store Chain
INSERT INTO ccm_company_rooms (
    code, name, industry_id, description,
    company_size, company_age, company_values,
    revenue, headquarters, known_for,
    color_scheme, logo_icon, is_active, grade_category
) VALUES (
    'TRAILBOUND',
    'TrailBound Outfitters',
    (SELECT id FROM cc_industries WHERE code = 'RETAIL' LIMIT 1),
    'Regional outdoor and camping gear stores with expert staff and trail guides',
    '470 employees',
    14,
    ARRAY['Outdoor adventure', 'Environmental respect', 'Expert guidance']::text[],
    '$16M revenue',
    'Boulder, CO',
    'Gear rentals and guided hiking trips',
    '{"primary": "#14B8A6", "secondary": "#0D9488", "accent": "#2DD4BF"}'::jsonb,
    '⛰️',
    true,
    'middle'
);

-- ============================================
-- 4. VERIFY RESULTS
-- ============================================

-- Show distribution of companies by grade category
SELECT
    grade_category,
    COUNT(*) as company_count,
    MIN(company_size) as smallest_size,
    MAX(company_size) as largest_size
FROM ccm_company_rooms
WHERE is_active = true
GROUP BY grade_category
ORDER BY grade_category;

-- Expected result:
-- grade_category | company_count | smallest_size | largest_size
-- ---------------+---------------+---------------+-------------
-- elementary     | 10            | 200 helpers   | 2,000 helpers
-- middle         | 10            | 240 employees | 650 employees
-- high           | 10            | 2,000 employees | 50,000 employees

-- List all companies by category
SELECT
    grade_category,
    code,
    name,
    company_size
FROM ccm_company_rooms
WHERE is_active = true
ORDER BY grade_category, code;

-- ============================================
-- 5. UPDATE INDEXES
-- ============================================

-- Recreate index to include new middle category
DROP INDEX IF EXISTS idx_ccm_company_rooms_grade;
CREATE INDEX idx_ccm_company_rooms_grade ON ccm_company_rooms(grade_category) WHERE is_active = true;

-- ============================================
-- COMPLETE!
-- ============================================
-- We now have 30 companies:
-- - 10 Elementary (kid-friendly)
-- - 10 Middle School (small-medium businesses, <1,000 employees)
-- - 10 High School (large corporations, >1,000 employees)
