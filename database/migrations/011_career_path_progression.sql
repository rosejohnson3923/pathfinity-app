-- Career Path Progression System
-- Maps how careers progress through subscription tiers and booster enhancements

-- ============================================
-- 1. BASE CAREERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS careers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_code VARCHAR(50) UNIQUE NOT NULL,
    career_name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10),
    category VARCHAR(50) NOT NULL, -- Healthcare, Technology, Arts, etc.
    description TEXT,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('standard', 'premium')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CAREER PATH PROGRESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS career_path_progressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_career_id UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
    progression_type VARCHAR(50) NOT NULL CHECK (progression_type IN (
        'boost_trade',
        'boost_corporate',
        'boost_business',
        'boost_ai_first'
    )),
    enhanced_career_name VARCHAR(200) NOT NULL,
    enhanced_description TEXT,
    additional_skills JSONB DEFAULT '[]'::jsonb, -- Array of additional skills
    learning_outcomes JSONB DEFAULT '[]'::jsonb, -- Array of learning outcomes
    certification_path TEXT, -- Optional certification information
    real_world_application TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(base_career_id, progression_type)
);

-- ============================================
-- 3. BOOSTER TYPE DEFINITIONS
-- ============================================
CREATE TABLE IF NOT EXISTS booster_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booster_code VARCHAR(50) UNIQUE NOT NULL,
    booster_name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    description TEXT,
    skills_framework JSONB DEFAULT '{}'::jsonb, -- Common skills for this booster
    price_tier INTEGER, -- For ordering/pricing
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. CAREER FIELD GROUPINGS (for logical presentation)
-- ============================================
CREATE TABLE IF NOT EXISTS career_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field_name VARCHAR(100) NOT NULL,
    field_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add field relationship to careers
ALTER TABLE careers ADD COLUMN IF NOT EXISTS field_id UUID REFERENCES career_fields(id);

-- ============================================
-- 5. CAREER PREREQUISITES (for progression logic)
-- ============================================
CREATE TABLE IF NOT EXISTS career_prerequisites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_id UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
    prerequisite_career_id UUID REFERENCES careers(id) ON DELETE SET NULL,
    prerequisite_type VARCHAR(50) DEFAULT 'recommended', -- required, recommended, related
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_careers_tier ON careers(tier);
CREATE INDEX idx_careers_category ON careers(category);
CREATE INDEX idx_careers_field ON careers(field_id);
CREATE INDEX idx_career_progressions_base ON career_path_progressions(base_career_id);
CREATE INDEX idx_career_progressions_type ON career_path_progressions(progression_type);

-- ============================================
-- INITIAL DATA: BOOSTER TYPES
-- ============================================
INSERT INTO booster_types (booster_code, booster_name, icon, description, skills_framework) VALUES
    ('boost_trade', 'Trade Skills', '🔧', 'Hands-on technical expertise and certifications',
     '{"core_skills": ["equipment_mastery", "safety_protocols", "tool_proficiency", "maintenance", "troubleshooting"]}'::jsonb),

    ('boost_corporate', 'Corporate Leadership', '💼', 'Management and team leadership skills',
     '{"core_skills": ["team_management", "project_planning", "strategic_thinking", "communication", "budgeting"]}'::jsonb),

    ('boost_business', 'Business Entrepreneurship', '🚀', 'Business ownership and entrepreneurial skills',
     '{"core_skills": ["business_planning", "financial_management", "marketing", "customer_relations", "scaling"]}'::jsonb),

    ('boost_ai_first', 'AI Integration', '🤖', 'AI-powered tools and future workflows',
     '{"core_skills": ["prompt_engineering", "ai_tools", "automation", "data_analysis", "machine_learning_basics"]}'::jsonb)
ON CONFLICT (booster_code) DO NOTHING;

-- ============================================
-- INITIAL DATA: CAREER FIELDS
-- ============================================
INSERT INTO career_fields (field_code, field_name, description, display_order) VALUES
    ('healthcare', 'Healthcare', 'Medical and health-related careers', 1),
    ('technology', 'Technology', 'Computer science and IT careers', 2),
    ('culinary', 'Culinary Arts', 'Food service and cooking careers', 3),
    ('arts', 'Arts & Creative', 'Creative and artistic careers', 4),
    ('science', 'Science', 'Scientific research and exploration', 5),
    ('education', 'Education', 'Teaching and training careers', 6),
    ('business', 'Business', 'Commerce and management careers', 7),
    ('trades', 'Skilled Trades', 'Technical and manual skill careers', 8),
    ('public_service', 'Public Service', 'Government and community service', 9),
    ('sports', 'Sports & Fitness', 'Athletic and wellness careers', 10)
ON CONFLICT (field_code) DO NOTHING;

-- ============================================
-- SAMPLE DATA: STANDARD CAREERS
-- ============================================
INSERT INTO careers (career_code, career_name, emoji, category, description, tier, field_id) VALUES
    -- Healthcare Field
    ('std_doctor', 'Doctor', '👨‍⚕️', 'Healthcare', 'Diagnose and treat patients', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('std_nurse', 'Nurse', '👩‍⚕️', 'Healthcare', 'Care for patients and assist doctors', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),

    -- Technology Field
    ('std_programmer', 'Programmer', '💻', 'Technology', 'Write code and build software', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),

    -- Culinary Field
    ('std_chef', 'Chef', '👨‍🍳', 'Culinary', 'Create delicious meals', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'culinary')),

    -- Arts Field
    ('std_artist', 'Artist', '🎨', 'Arts', 'Create visual art', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('std_musician', 'Musician', '🎵', 'Arts', 'Create and perform music', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),

    -- Education Field
    ('std_teacher', 'Teacher', '👩‍🏫', 'Education', 'Educate and inspire students', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'education')),

    -- Science Field
    ('std_scientist', 'Scientist', '🔬', 'Science', 'Conduct research and experiments', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'science'))
ON CONFLICT (career_code) DO NOTHING;

-- ============================================
-- SAMPLE DATA: PREMIUM CAREERS
-- ============================================
INSERT INTO careers (career_code, career_name, emoji, category, description, tier, field_id) VALUES
    -- Healthcare Specializations
    ('prm_surgeon', 'Surgeon', '🏥', 'Healthcare', 'Perform surgical procedures', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('prm_pediatrician', 'Pediatrician', '👶', 'Healthcare', 'Specialize in children health', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('prm_psychiatrist', 'Psychiatrist', '🧠', 'Healthcare', 'Mental health specialist', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),

    -- Technology Specializations
    ('prm_software_architect', 'Software Architect', '🏗️', 'Technology', 'Design complex systems', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_data_scientist', 'Data Scientist', '📊', 'Technology', 'Analyze complex data', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_cybersecurity', 'Cybersecurity Expert', '🔐', 'Technology', 'Protect digital systems', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),

    -- Culinary Specializations
    ('prm_pastry_chef', 'Pastry Chef', '🍰', 'Culinary', 'Specialize in desserts', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'culinary')),
    ('prm_executive_chef', 'Executive Chef', '👨‍🍳', 'Culinary', 'Lead restaurant kitchens', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'culinary')),

    -- More Premium Careers
    ('prm_astronaut', 'Astronaut', '🚀', 'Science', 'Explore space', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_marine_biologist', 'Marine Biologist', '🐋', 'Science', 'Study ocean life', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_game_designer', 'Game Designer', '🎮', 'Technology', 'Create video games', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_architect', 'Architect', '🏛️', 'Design', 'Design buildings', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts'))
ON CONFLICT (career_code) DO NOTHING;

-- ============================================
-- SAMPLE DATA: CAREER PROGRESSIONS
-- ============================================
-- Doctor Progressions
INSERT INTO career_path_progressions (base_career_id, progression_type, enhanced_career_name, enhanced_description, additional_skills)
SELECT
    id,
    'boost_trade',
    'Doctor + Medical Equipment Specialist',
    'Master advanced medical equipment and surgical tools',
    '["surgical_robotics", "diagnostic_equipment", "medical_device_maintenance"]'::jsonb
FROM careers WHERE career_code = 'std_doctor';

INSERT INTO career_path_progressions (base_career_id, progression_type, enhanced_career_name, enhanced_description, additional_skills)
SELECT
    id,
    'boost_corporate',
    'Medical Director',
    'Lead medical departments and healthcare teams',
    '["department_management", "policy_development", "staff_training"]'::jsonb
FROM careers WHERE career_code = 'std_doctor';

INSERT INTO career_path_progressions (base_career_id, progression_type, enhanced_career_name, enhanced_description, additional_skills)
SELECT
    id,
    'boost_business',
    'Medical Practice Owner',
    'Run your own medical clinic or practice',
    '["practice_management", "patient_acquisition", "medical_billing"]'::jsonb
FROM careers WHERE career_code = 'std_doctor';

INSERT INTO career_path_progressions (base_career_id, progression_type, enhanced_career_name, enhanced_description, additional_skills)
SELECT
    id,
    'boost_ai_first',
    'AI-Enhanced Diagnostician',
    'Use AI tools for advanced diagnosis and treatment',
    '["ai_diagnosis_tools", "predictive_analytics", "telemedicine"]'::jsonb
FROM careers WHERE career_code = 'std_doctor';

-- Programmer Progressions
INSERT INTO career_path_progressions (base_career_id, progression_type, enhanced_career_name, enhanced_description, additional_skills)
SELECT
    id,
    'boost_trade',
    'Full-Stack Developer',
    'Master all layers of software development',
    '["frontend_frameworks", "backend_systems", "database_management", "devops"]'::jsonb
FROM careers WHERE career_code = 'std_programmer';

INSERT INTO career_path_progressions (base_career_id, progression_type, enhanced_career_name, enhanced_description, additional_skills)
SELECT
    id,
    'boost_corporate',
    'Tech Team Lead',
    'Lead development teams and technical projects',
    '["agile_management", "code_review", "architecture_decisions", "mentoring"]'::jsonb
FROM careers WHERE career_code = 'std_programmer';

INSERT INTO career_path_progressions (base_career_id, progression_type, enhanced_career_name, enhanced_description, additional_skills)
SELECT
    id,
    'boost_business',
    'Tech Startup Founder',
    'Launch and scale technology companies',
    '["product_development", "fundraising", "market_analysis", "scaling_systems"]'::jsonb
FROM careers WHERE career_code = 'std_programmer';

INSERT INTO career_path_progressions (base_career_id, progression_type, enhanced_career_name, enhanced_description, additional_skills)
SELECT
    id,
    'boost_ai_first',
    'AI/ML Engineer',
    'Build intelligent systems and AI applications',
    '["machine_learning", "neural_networks", "nlp", "computer_vision"]'::jsonb
FROM careers WHERE career_code = 'std_programmer';

-- ============================================
-- VIEWS FOR EASY QUERYING
-- ============================================
CREATE OR REPLACE VIEW career_progression_full AS
SELECT
    c.id as career_id,
    c.career_code,
    c.career_name,
    c.emoji,
    c.category,
    c.tier,
    cf.field_name,
    cpp.progression_type,
    cpp.enhanced_career_name,
    cpp.enhanced_description,
    cpp.additional_skills,
    bt.booster_name,
    bt.icon as booster_icon
FROM careers c
LEFT JOIN career_fields cf ON c.field_id = cf.id
LEFT JOIN career_path_progressions cpp ON c.id = cpp.base_career_id
LEFT JOIN booster_types bt ON cpp.progression_type = bt.booster_code
WHERE c.is_active = true
ORDER BY cf.display_order, c.career_name, cpp.progression_type;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION get_career_with_progressions(p_career_id UUID)
RETURNS TABLE (
    career_id UUID,
    career_name VARCHAR,
    tier VARCHAR,
    field_name VARCHAR,
    progressions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.career_name,
        c.tier,
        cf.field_name,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'type', cpp.progression_type,
                    'enhanced_name', cpp.enhanced_career_name,
                    'description', cpp.enhanced_description,
                    'skills', cpp.additional_skills
                ) ORDER BY cpp.progression_type
            ) FILTER (WHERE cpp.id IS NOT NULL),
            '[]'::jsonb
        ) as progressions
    FROM careers c
    LEFT JOIN career_fields cf ON c.field_id = cf.id
    LEFT JOIN career_path_progressions cpp ON c.id = cpp.base_career_id
    WHERE c.id = p_career_id
    GROUP BY c.id, c.career_name, c.tier, cf.field_name;
END;
$$ LANGUAGE plpgsql;