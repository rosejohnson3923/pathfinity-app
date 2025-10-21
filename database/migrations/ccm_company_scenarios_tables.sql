-- ============================================
-- CCM Multiplayer: Company & Scenarios Tables
-- Copied from Career Challenge (CC) and adapted for multiplayer
-- ============================================

-- ============================================
-- 1. CCM COMPANY ROOMS TABLE
-- ============================================
-- Represents fictional companies that host CCM multiplayer games
-- Each company has 5-6 challenges across different P categories
CREATE TABLE IF NOT EXISTS ccm_company_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'MEDICORE', 'CLOUDPEAK'
    name VARCHAR(100) NOT NULL, -- e.g., 'MediCore Solutions'
    industry_id UUID REFERENCES cc_industries(id), -- Links to existing industry table
    description TEXT,
    company_size VARCHAR(50), -- e.g., '5000 employees'
    revenue VARCHAR(50), -- e.g., '$2B revenue'
    headquarters VARCHAR(100), -- e.g., 'Boston, MA'
    known_for TEXT, -- e.g., 'Surgical robotics and AI diagnostics'
    color_scheme JSONB DEFAULT '{"primary": "#3B82F6", "secondary": "#1E40AF", "accent": "#60A5FA"}',
    logo_icon VARCHAR(10), -- emoji or icon identifier
    is_active BOOLEAN DEFAULT true,

    -- Grade level targeting
    grade_category TEXT DEFAULT 'other' CHECK (grade_category IN ('elementary', 'other')),
    company_age INTEGER, -- Age of company in years
    company_values TEXT[], -- Core values array

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for active rooms and quick lookups
CREATE INDEX idx_ccm_company_rooms_active ON ccm_company_rooms(is_active);
CREATE INDEX idx_ccm_company_rooms_code ON ccm_company_rooms(code);

-- ============================================
-- 2. CCM BUSINESS SCENARIOS (CHALLENGE CARDS)
-- ============================================
-- Stores all business challenges for CCM multiplayer games
-- Each scenario is linked to a company and maps to one of the 6 P's
CREATE TABLE IF NOT EXISTS ccm_business_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    context TEXT, -- Educational context about this type of challenge

    -- Scenario categorization (6 P's)
    business_driver VARCHAR(50) NOT NULL, -- 'people', 'product', 'process', 'place', 'promotion', 'price'
    p_category VARCHAR(50) NOT NULL, -- Same as business_driver (for consistency with CCM naming)

    -- Difficulty and scoring
    difficulty_level VARCHAR(20) NOT NULL, -- 'easy', 'medium', 'hard'
    base_points INTEGER DEFAULT 100,
    grade_level VARCHAR(20) DEFAULT 'all', -- 'all', 'middle', 'high', 'college'

    -- Company association
    company_room_id UUID NOT NULL REFERENCES ccm_company_rooms(id) ON DELETE CASCADE,

    -- Grade level (must match company's grade_category)
    grade_category TEXT DEFAULT 'other' CHECK (grade_category IN ('elementary', 'other')),

    -- C-Suite Executive Pitches (Round 1 selection context)
    -- Each executive makes their case for why they're best suited to handle challenges
    executive_pitches JSONB DEFAULT '{}',
    /* Example:
    {
        "ceo": "As CEO of MediCore, I oversee all strategic decisions. My people-focused leadership and financial acumen position me to guide us through any challenge.",
        "cfo": "I manage MediCore's finances and pricing strategy. With visibility into costs, margins, and revenue streams, I can make data-driven decisions.",
        "cmo": "I built MediCore's brand and marketing strategy. I understand our customers, market positioning, and promotional channels.",
        "cto": "I lead MediCore's technology innovation. From product development to process automation, I leverage tech to solve problems.",
        "chro": "I oversee MediCore's 5,000 employees. People are our greatest asset, and I ensure we attract, develop, and retain top talent.",
        "coo": "I run MediCore's operations across all locations. I optimize processes, manage distribution, and ensure operational excellence."
    }
    */

    -- C-Suite Lens Multipliers (which lenses get bonuses for this P category)
    lens_multipliers JSONB DEFAULT '{}',
    /* Example for a "people" challenge:
    {
        "ceo": 1.25,    // CEO gets 25% bonus on people challenges
        "chro": 1.30,   // CHRO gets 30% bonus on people challenges
        "others": 1.0   // Others get no bonus
    }
    */

    -- Content flags
    is_active BOOLEAN DEFAULT true,
    is_tutorial BOOLEAN DEFAULT false,

    -- Metadata
    tags TEXT[], -- e.g., ['urgent', 'customer_facing', 'financial']
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_ccm_business_driver CHECK (business_driver IN ('people', 'product', 'process', 'place', 'promotion', 'price')),
    CONSTRAINT chk_ccm_p_category CHECK (p_category IN ('people', 'product', 'process', 'place', 'promotion', 'price')),
    CONSTRAINT chk_ccm_difficulty CHECK (difficulty_level IN ('easy', 'medium', 'hard'))
);

-- Indexes for efficient querying
CREATE INDEX idx_ccm_scenarios_company ON ccm_business_scenarios(company_room_id);
CREATE INDEX idx_ccm_scenarios_p_category ON ccm_business_scenarios(p_category);
CREATE INDEX idx_ccm_scenarios_active ON ccm_business_scenarios(is_active);
CREATE INDEX idx_ccm_scenarios_composite ON ccm_business_scenarios(company_room_id, p_category, is_active);

-- ============================================
-- 3. TRIGGERS FOR TIMESTAMP UPDATES
-- ============================================

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ccm_company_rooms_updated_at
BEFORE UPDATE ON ccm_company_rooms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ccm_business_scenarios_updated_at
BEFORE UPDATE ON ccm_business_scenarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. SEED DATA - COPY FROM CC TABLES
-- ============================================
-- Copy all 20 company rooms from Career Challenge
-- - 10 "other" grade level (middle/high school) companies
-- - 10 "elementary" grade level companies (kid-friendly versions)

INSERT INTO ccm_company_rooms (code, name, industry_id, description, company_size, revenue, headquarters, known_for, logo_icon, color_scheme, grade_category, company_age, company_values)
SELECT code, name, industry_id, description, company_size, revenue, headquarters, known_for, logo_icon, color_scheme, grade_category, company_age, company_values
FROM cc_company_rooms
WHERE is_active = true
ON CONFLICT (code) DO NOTHING;

-- This will copy all 20 companies:
-- Middle/High School: TRENDFWD, QUICKSERVE, HORIZON, SKYCONNECT, GREENGRID, CLOUDPEAK, MEDICORE, NEXTGEN, PLAYFORGE, BUILDRIGHT
-- Elementary: TRENDFWD_ELEM, QUICKSERVE_ELEM, HORIZON_ELEM, SKYCONNECT_ELEM, GREENGRID_ELEM, CLOUDPEAK_ELEM, MEDICORE_ELEM, NEXTGEN_ELEM, PLAYFORGE_ELEM, BUILDRIGHT_ELEM

-- Note: Business scenarios will be created separately with CCM-specific content
-- We don't copy cc_business_scenarios because CCM uses simplified challenge cards

-- ============================================
-- 5. HELPER QUERIES
-- ============================================

-- Get all challenges for a specific company and P category
COMMENT ON TABLE ccm_business_scenarios IS
'Business challenges for CCM multiplayer. Each challenge is linked to a company and represents one of the 6 P categories (people, product, process, place, promotion, price). Executive pitches help players choose their C-Suite lens in Round 1.';

COMMENT ON COLUMN ccm_business_scenarios.executive_pitches IS
'JSONB object containing each C-Suite executive''s pitch for why they are best suited to handle challenges at this company. Used in Round 1 to help players make informed lens selections.';

COMMENT ON COLUMN ccm_business_scenarios.lens_multipliers IS
'JSONB object defining which C-Suite lenses get score multipliers for this P category. Example: CHRO gets 1.30x on people challenges, CEO gets 1.25x.';

-- ============================================
-- 6. PERMISSIONS
-- ============================================

-- Grant appropriate permissions
GRANT SELECT ON ccm_company_rooms TO authenticated;
GRANT SELECT ON ccm_business_scenarios TO authenticated;

-- Public can view company rooms (for lobby display)
GRANT SELECT ON ccm_company_rooms TO anon;

-- ============================================
-- END OF MIGRATION
-- ============================================
