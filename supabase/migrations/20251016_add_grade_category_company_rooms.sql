-- Add grade_category field to cc_company_rooms table
-- This allows us to have separate complete records for different grade levels

-- Add the grade_category column
ALTER TABLE cc_company_rooms
ADD COLUMN IF NOT EXISTS grade_category TEXT DEFAULT 'other' CHECK (grade_category IN ('elementary', 'other'));

-- Add comment explaining the column
COMMENT ON COLUMN cc_company_rooms.grade_category IS 'Target grade level: elementary (K-5) or other (6-12)';

-- Update existing rooms to be 'other' (middle/high school)
UPDATE cc_company_rooms
SET grade_category = 'other'
WHERE grade_category IS NULL;

-- Populate company_age and company_values for 'other' grade category rooms
UPDATE cc_company_rooms SET company_age = 12, company_values = ARRAY['Innovation in retail', 'Sustainable fashion', 'Customer experience']::text[] WHERE code = 'TRENDFWD';
UPDATE cc_company_rooms SET company_age = 15, company_values = ARRAY['Speed of service', 'Quality consistency', 'Technology integration']::text[] WHERE code = 'QUICKSERVE';
UPDATE cc_company_rooms SET company_age = 8, company_values = ARRAY['Digital-first banking', 'Financial inclusion', 'User experience']::text[] WHERE code = 'HORIZON';
UPDATE cc_company_rooms SET company_age = 25, company_values = ARRAY['Safety first', 'Global connectivity', 'Affordable travel']::text[] WHERE code = 'SKYCONNECT';
UPDATE cc_company_rooms SET company_age = 10, company_values = ARRAY['Renewable energy', 'Environmental stewardship', 'Community impact']::text[] WHERE code = 'GREENGRID';
UPDATE cc_company_rooms SET company_age = 7, company_values = ARRAY['Scalable infrastructure', 'Developer experience', 'Enterprise security']::text[] WHERE code = 'CLOUDPEAK';
UPDATE cc_company_rooms SET company_age = 18, company_values = ARRAY['Medical innovation', 'Patient outcomes', 'Healthcare technology']::text[] WHERE code = 'MEDICORE';
UPDATE cc_company_rooms SET company_age = 20, company_values = ARRAY['Network reliability', '5G leadership', 'Customer connectivity']::text[] WHERE code = 'NEXTGEN';
UPDATE cc_company_rooms SET company_age = 12, company_values = ARRAY['Creative excellence', 'Player engagement', 'Esports innovation']::text[] WHERE code = 'PLAYFORGE';
UPDATE cc_company_rooms SET company_age = 22, company_values = ARRAY['Sustainable building', 'Safety standards', 'Project excellence']::text[] WHERE code = 'BUILDRIGHT';

-- Remove elementary_name column as it's no longer needed (we use separate records now)
ALTER TABLE cc_company_rooms DROP COLUMN IF EXISTS elementary_name;

-- Delete any existing elementary records to start fresh
DELETE FROM cc_company_rooms WHERE code LIKE '%_ELEM';

-- Create elementary versions of existing company rooms
-- These have age-appropriate names, descriptions, and all other fields

-- Fashion Friends Store (elementary version of TrendForward)
INSERT INTO cc_company_rooms (
  code, name, industry_id, description, company_size, company_age, company_values,
  revenue, headquarters, known_for, color_scheme, logo_icon, is_active,
  player_capacity, difficulty_modifier, grade_category
)
SELECT
  code || '_ELEM',
  'Fashion Friends Store',
  industry_id,
  'A fun clothing store where kids can find cool outfits and help families shop',
  '500 helpers',
  5,
  ARRAY['Being kind to customers', 'Making shopping fun', 'Helping families']::text[],
  '$10 million',
  'Portland, Oregon',
  'Colorful clothes and friendly store helpers',
  color_scheme,
  logo_icon,
  is_active,
  player_capacity,
  difficulty_modifier,
  'elementary'
FROM cc_company_rooms
WHERE name = 'TrendForward' AND grade_category = 'other'
LIMIT 1;

-- Yummy Food Place (elementary version of QuickServe Global)
INSERT INTO cc_company_rooms (
  code, name, industry_id, description, company_size, company_age, company_values,
  revenue, headquarters, known_for, color_scheme, logo_icon, is_active,
  player_capacity, difficulty_modifier, grade_category
)
SELECT
  code || '_ELEM',
  'Yummy Food Place',
  industry_id,
  'A happy restaurant where people get tasty meals quickly',
  '1,000 helpers',
  8,
  ARRAY['Making yummy food', 'Being fast and friendly', 'Keeping everyone safe']::text[],
  '$50 million',
  'Chicago, Illinois',
  'Quick tasty meals and happy customers',
  color_scheme,
  logo_icon,
  is_active,
  player_capacity,
  difficulty_modifier,
  'elementary'
FROM cc_company_rooms
WHERE name = 'QuickServe Global' AND grade_category = 'other'
LIMIT 1;

-- Money Helpers Bank (elementary version of Horizon Financial)
INSERT INTO cc_company_rooms (
  code, name, industry_id, description, company_size, company_age, company_values,
  revenue, headquarters, known_for, color_scheme, logo_icon, is_active,
  player_capacity, difficulty_modifier, grade_category
)
SELECT
  code || '_ELEM',
  'Money Helpers Bank',
  industry_id,
  'A friendly bank that helps people save money and keep it safe',
  '300 helpers',
  3,
  ARRAY['Keeping money safe', 'Helping people save', 'Being honest and fair']::text[],
  '$5 million',
  'Seattle, Washington',
  'Easy-to-use money app and helpful bank staff',
  color_scheme,
  logo_icon,
  is_active,
  player_capacity,
  difficulty_modifier,
  'elementary'
FROM cc_company_rooms
WHERE name = 'Horizon Financial' AND grade_category = 'other'
LIMIT 1;

-- Sky Friends Airlines (elementary version of SkyConnect Airlines)
INSERT INTO cc_company_rooms (
  code, name, industry_id, description, company_size, company_age, company_values,
  revenue, headquarters, known_for, color_scheme, logo_icon, is_active,
  player_capacity, difficulty_modifier, grade_category
)
SELECT
  code || '_ELEM',
  'Sky Friends Airlines',
  industry_id,
  'A fun airplane company that helps people fly to visit family and friends',
  '2,000 helpers',
  10,
  ARRAY['Keeping passengers safe', 'Flying on time', 'Being helpful and kind']::text[],
  '$30 million',
  'Atlanta, Georgia',
  'Friendly flight crew and fun snacks',
  color_scheme,
  logo_icon,
  is_active,
  player_capacity,
  difficulty_modifier,
  'elementary'
FROM cc_company_rooms
WHERE name = 'SkyConnect Airlines' AND grade_category = 'other'
LIMIT 1;

-- Green Power Team (elementary version of GreenGrid Energy)
INSERT INTO cc_company_rooms (
  code, name, industry_id, description, company_size, company_age, company_values,
  revenue, headquarters, known_for, color_scheme, logo_icon, is_active,
  player_capacity, difficulty_modifier, grade_category
)
SELECT
  code || '_ELEM',
  'Green Power Team',
  industry_id,
  'A company that makes electricity from sunshine and wind to help the Earth',
  '400 helpers',
  6,
  ARRAY['Protecting nature', 'Using clean energy', 'Helping communities']::text[],
  '$20 million',
  'Denver, Colorado',
  'Big windmills and solar panels',
  color_scheme,
  logo_icon,
  is_active,
  player_capacity,
  difficulty_modifier,
  'elementary'
FROM cc_company_rooms
WHERE name = 'GreenGrid Energy' AND grade_category = 'other'
LIMIT 1;

-- Cloud Computer Helpers (elementary version of CloudPeak Systems)
INSERT INTO cc_company_rooms (
  code, name, industry_id, description, company_size, company_age, company_values,
  revenue, headquarters, known_for, color_scheme, logo_icon, is_active,
  player_capacity, difficulty_modifier, grade_category
)
SELECT
  code || '_ELEM',
  'Cloud Computer Helpers',
  industry_id,
  'A tech company that helps businesses store their computer stuff safely online',
  '300 helpers',
  4,
  ARRAY['Keeping data safe', 'Making tech easy to use', 'Helping businesses grow']::text[],
  '$8 million',
  'San Francisco, California',
  'Easy computer programs and helpful support team',
  color_scheme,
  logo_icon,
  is_active,
  player_capacity,
  difficulty_modifier,
  'elementary'
FROM cc_company_rooms
WHERE name = 'CloudPeak Systems' AND grade_category = 'other'
LIMIT 1;

-- Happy Health Helpers (elementary version of MediCore Solutions)
INSERT INTO cc_company_rooms (
  code, name, industry_id, description, company_size, company_age, company_values,
  revenue, headquarters, known_for, color_scheme, logo_icon, is_active,
  player_capacity, difficulty_modifier, grade_category
)
SELECT
  code || '_ELEM',
  'Happy Health Helpers',
  industry_id,
  'A company that makes special tools to help doctors take care of sick people',
  '500 helpers',
  7,
  ARRAY['Helping people feel better', 'Making safe medical tools', 'Working with doctors']::text[],
  '$15 million',
  'Boston, Massachusetts',
  'Cool robots that help doctors and friendly scientists',
  color_scheme,
  logo_icon,
  is_active,
  player_capacity,
  difficulty_modifier,
  'elementary'
FROM cc_company_rooms
WHERE name = 'MediCore Solutions' AND grade_category = 'other'
LIMIT 1;

-- Phone Friends (elementary version of NextGen Mobile)
INSERT INTO cc_company_rooms (
  code, name, industry_id, description, company_size, company_age, company_values,
  revenue, headquarters, known_for, color_scheme, logo_icon, is_active,
  player_capacity, difficulty_modifier, grade_category
)
SELECT
  code || '_ELEM',
  'Phone Friends',
  industry_id,
  'A phone company that helps people talk and send messages to each other',
  '2,000 helpers',
  12,
  ARRAY['Connecting families', 'Making calls clear', 'Keeping phones working']::text[],
  '$40 million',
  'Dallas, Texas',
  'Fast internet and friendly customer service',
  color_scheme,
  logo_icon,
  is_active,
  player_capacity,
  difficulty_modifier,
  'elementary'
FROM cc_company_rooms
WHERE name = 'NextGen Mobile' AND grade_category = 'other'
LIMIT 1;

-- Fun Game Makers (elementary version of PlayForge Entertainment)
INSERT INTO cc_company_rooms (
  code, name, industry_id, description, company_size, company_age, company_values,
  revenue, headquarters, known_for, color_scheme, logo_icon, is_active,
  player_capacity, difficulty_modifier, grade_category
)
SELECT
  code || '_ELEM',
  'Fun Game Makers',
  industry_id,
  'A creative company that designs and builds fun video games for everyone',
  '200 helpers',
  5,
  ARRAY['Making fun games', 'Being creative', 'Making players happy']::text[],
  '$10 million',
  'Los Angeles, California',
  'Cool adventure games and fun characters',
  color_scheme,
  logo_icon,
  is_active,
  player_capacity,
  difficulty_modifier,
  'elementary'
FROM cc_company_rooms
WHERE name = 'PlayForge Entertainment' AND grade_category = 'other'
LIMIT 1;

-- Building Helpers (elementary version of BuildRight Construction)
INSERT INTO cc_company_rooms (
  code, name, industry_id, description, company_size, company_age, company_values,
  revenue, headquarters, known_for, color_scheme, logo_icon, is_active,
  player_capacity, difficulty_modifier, grade_category
)
SELECT
  code || '_ELEM',
  'Building Helpers',
  industry_id,
  'A construction company that builds schools, stores, and offices for communities',
  '1,000 helpers',
  9,
  ARRAY['Building safely', 'Protecting the environment', 'Making strong buildings']::text[],
  '$35 million',
  'Houston, Texas',
  'Big cranes and hardworking construction crews',
  color_scheme,
  logo_icon,
  is_active,
  player_capacity,
  difficulty_modifier,
  'elementary'
FROM cc_company_rooms
WHERE name = 'BuildRight Construction' AND grade_category = 'other'
LIMIT 1;
