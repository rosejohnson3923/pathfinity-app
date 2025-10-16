-- Career Challenge: Executive Decision Maker Database Schema
-- Phase 1: Foundation & Infrastructure
-- Created: 2025-01-15

-- ============================================
-- 1. COMPANY ROOMS TABLE
-- ============================================
-- Represents the 10 fictional companies players can join
CREATE TABLE IF NOT EXISTS cc_company_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL, -- e.g., 'MEDICORE', 'CLOUDPEAK'
    name VARCHAR(100) NOT NULL, -- e.g., 'MediCore Solutions'
    industry_id UUID REFERENCES cc_industries(id), -- Links to existing industry
    description TEXT,
    company_size VARCHAR(50), -- e.g., '5000 employees'
    revenue VARCHAR(50), -- e.g., '$2B revenue'
    headquarters VARCHAR(100), -- e.g., 'Boston, MA'
    known_for TEXT, -- e.g., 'Surgical robotics and AI diagnostics'
    color_scheme JSONB DEFAULT '{"primary": "#3B82F6", "secondary": "#1E40AF", "accent": "#60A5FA"}',
    logo_icon VARCHAR(10), -- emoji or icon identifier
    is_active BOOLEAN DEFAULT true,
    player_capacity INTEGER DEFAULT 8,
    difficulty_modifier DECIMAL(3,2) DEFAULT 1.0, -- Affects scoring
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for active rooms and quick lookups
CREATE INDEX idx_cc_company_rooms_active ON cc_company_rooms(is_active);
CREATE INDEX idx_cc_company_rooms_code ON cc_company_rooms(code);

-- ============================================
-- 2. BUSINESS SCENARIOS TABLE
-- ============================================
-- Stores all Crisis, Risk, and Opportunity scenarios
CREATE TABLE IF NOT EXISTS cc_business_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,

    -- Scenario categorization
    business_driver VARCHAR(50) NOT NULL, -- 'people', 'product', 'pricing', 'process', 'proceeds', 'profits'
    scenario_type VARCHAR(50) NOT NULL, -- 'crisis', 'risk', 'opportunity'
    specific_situation VARCHAR(100), -- e.g., 'talent_exodus', 'competitor_pricing', 'new_market'

    -- Optimal strategy
    optimal_executive VARCHAR(50) NOT NULL, -- 'CMO', 'COO', 'CFO', 'CTO', 'CHRO'
    optimal_rationale TEXT, -- Why this executive is best for this scenario

    -- Difficulty and scoring
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    base_points INTEGER DEFAULT 100,
    time_limit_seconds INTEGER DEFAULT 60,

    -- Industry/Company applicability
    company_room_id UUID REFERENCES cc_company_rooms(id), -- NULL means applicable to all
    industry_specific BOOLEAN DEFAULT false,

    -- Content flags
    is_tutorial BOOLEAN DEFAULT false,
    requires_unlock BOOLEAN DEFAULT false,
    unlock_criteria JSONB, -- e.g., {"min_level": 5, "completed_scenarios": ["uuid1", "uuid2"]}

    -- Executive pitches (what each C-Suite says about this scenario)
    executive_pitches JSONB DEFAULT '{}',
    /* Example:
    {
        "CMO": "This is a PR nightmare! We need to control the narrative.",
        "CFO": "The financial implications could destroy our quarter.",
        "CHRO": "Our people are our priority - they need reassurance.",
        "COO": "Operations must continue - we can't let this stop us.",
        "CTO": "Technology can solve this if we act fast."
    }
    */

    -- Metadata
    tags TEXT[], -- e.g., ['urgent', 'stakeholder_management', 'innovation']
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    CONSTRAINT chk_business_driver CHECK (business_driver IN ('people', 'product', 'pricing', 'process', 'proceeds', 'profits')),
    CONSTRAINT chk_scenario_type CHECK (scenario_type IN ('crisis', 'risk', 'opportunity'))
);

-- Indexes for efficient querying
CREATE INDEX idx_cc_scenarios_company ON cc_business_scenarios(company_room_id);
CREATE INDEX idx_cc_scenarios_type ON cc_business_scenarios(scenario_type);
CREATE INDEX idx_cc_scenarios_driver ON cc_business_scenarios(business_driver);
CREATE INDEX idx_cc_scenarios_composite ON cc_business_scenarios(company_room_id, scenario_type, business_driver);

-- ============================================
-- 3. SOLUTION CARDS TABLE
-- ============================================
-- Each scenario has 10 solutions (5 perfect, 5 imperfect)
CREATE TABLE IF NOT EXISTS cc_solution_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES cc_business_scenarios(id) ON DELETE CASCADE,

    -- Solution content
    content TEXT NOT NULL, -- The solution description
    detailed_explanation TEXT, -- Why this works or doesn't work

    -- Solution quality
    is_perfect BOOLEAN NOT NULL, -- true = correct solution, false = trap
    solution_rank INTEGER, -- 1-10, order within the scenario
    category VARCHAR(50), -- e.g., 'immediate_action', 'communication', 'strategic', 'financial'

    -- Leadership impact (how this choice affects 6 C's)
    leadership_impacts JSONB DEFAULT '{}',
    /* Example:
    {
        "character": 2,      -- Positive impact on character
        "competence": 3,     -- Shows strong competence
        "communication": 1,   -- Moderate communication
        "compassion": -1,    -- Lacks compassion
        "commitment": 2,      -- Shows commitment
        "confidence": 1       -- Displays confidence
    }
    */

    -- Educational content
    real_world_example TEXT, -- Example of when this was used in real business
    learning_point TEXT, -- Key takeaway from this solution

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_solution_rank CHECK (solution_rank BETWEEN 1 AND 10),
    CONSTRAINT unique_solution_rank UNIQUE(scenario_id, solution_rank)
);

-- Indexes for solution queries
CREATE INDEX idx_cc_solutions_scenario ON cc_solution_cards(scenario_id);
CREATE INDEX idx_cc_solutions_perfect ON cc_solution_cards(scenario_id, is_perfect);

-- ============================================
-- 4. LENS EFFECTS TABLE
-- ============================================
-- How each executive role perceives each solution
CREATE TABLE IF NOT EXISTS cc_lens_effects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solution_id UUID NOT NULL REFERENCES cc_solution_cards(id) ON DELETE CASCADE,
    executive_role VARCHAR(50) NOT NULL,

    -- Perception through this lens
    perceived_value INTEGER NOT NULL CHECK (perceived_value BETWEEN 1 AND 5), -- 1-5 stars
    lens_description TEXT NOT NULL, -- How this executive describes the solution

    -- Visual presentation
    emphasis_level VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    visual_indicators JSONB DEFAULT '{}',
    /* Example:
    {
        "badges": ["Cost Efficient", "Quick Win"],
        "warnings": ["Resource Intensive"],
        "color": "green"
    }
    */

    -- Bias effect
    distorts_perception BOOLEAN DEFAULT false, -- Does this lens hide the true nature?
    bias_type VARCHAR(50), -- e.g., 'financial_focus', 'people_blind', 'tech_solutionism'

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_executive_role CHECK (executive_role IN ('CMO', 'COO', 'CFO', 'CTO', 'CHRO')),
    CONSTRAINT chk_emphasis CHECK (emphasis_level IN ('low', 'medium', 'high')),
    CONSTRAINT unique_lens_effect UNIQUE(solution_id, executive_role)
);

-- Indexes for lens queries
CREATE INDEX idx_cc_lens_solution ON cc_lens_effects(solution_id);
CREATE INDEX idx_cc_lens_executive ON cc_lens_effects(executive_role);
CREATE INDEX idx_cc_lens_composite ON cc_lens_effects(solution_id, executive_role);

-- ============================================
-- 5. LEADERSHIP SCORES TABLE
-- ============================================
-- Tracks 6 C's scores for each game round
CREATE TABLE IF NOT EXISTS cc_leadership_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES users(id),
    session_id UUID NOT NULL REFERENCES cc_game_sessions(id),
    round_number INTEGER NOT NULL,
    scenario_id UUID REFERENCES cc_business_scenarios(id),

    -- Executive choice
    selected_executive VARCHAR(50) NOT NULL,
    was_optimal BOOLEAN NOT NULL,

    -- Solution selections
    selected_solution_ids UUID[], -- Array of solution IDs chosen
    perfect_solutions_count INTEGER DEFAULT 0,

    -- 6 C's Scores (1-5 scale)
    character_score INTEGER CHECK (character_score BETWEEN 1 AND 5),
    competence_score INTEGER CHECK (competence_score BETWEEN 1 AND 5),
    communication_score INTEGER CHECK (communication_score BETWEEN 1 AND 5),
    compassion_score INTEGER CHECK (compassion_score BETWEEN 1 AND 5),
    commitment_score INTEGER CHECK (commitment_score BETWEEN 1 AND 5),
    confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 5),

    -- Overall scoring
    base_score INTEGER DEFAULT 0,
    lens_multiplier DECIMAL(3,2) DEFAULT 1.0,
    speed_bonus INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,

    -- Timing
    decision_time_seconds INTEGER,
    completed_at TIMESTAMPTZ DEFAULT NOW(),

    -- Feedback and insights
    leadership_feedback JSONB DEFAULT '{}',
    /* Example:
    {
        "strengths": ["Strong ethical stance", "Quick decision making"],
        "improvements": ["Consider human impact", "Gather more data"],
        "real_world_parallel": "Similar to Johnson & Johnson Tylenol crisis response"
    }
    */

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for leadership queries
CREATE INDEX idx_cc_leadership_player ON cc_leadership_scores(player_id);
CREATE INDEX idx_cc_leadership_session ON cc_leadership_scores(session_id);
CREATE INDEX idx_cc_leadership_composite ON cc_leadership_scores(player_id, session_id, round_number);

-- ============================================
-- 6. PLAYER PROGRESSION TABLE
-- ============================================
-- Tracks overall player progress and achievements
CREATE TABLE IF NOT EXISTS cc_player_progression (
    player_id UUID PRIMARY KEY REFERENCES users(id),

    -- Experience and level
    total_xp INTEGER DEFAULT 0,
    leadership_level VARCHAR(50) DEFAULT 'Bronze CEO',
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,

    -- Game statistics
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    perfect_rounds INTEGER DEFAULT 0,
    total_scenarios_completed INTEGER DEFAULT 0,

    -- Scenario type performance
    crisis_scenarios_completed INTEGER DEFAULT 0,
    risk_scenarios_completed INTEGER DEFAULT 0,
    opportunity_scenarios_completed INTEGER DEFAULT 0,

    -- Company/Industry experience
    company_experience JSONB DEFAULT '{}',
    /* Example:
    {
        "MEDICORE": {"games": 15, "avg_score": 850, "best_score": 1200},
        "CLOUDPEAK": {"games": 8, "avg_score": 720, "best_score": 980}
    }
    */

    -- 6 C's Averages (rolling average of last 20 games)
    avg_character DECIMAL(3,2) DEFAULT 3.0,
    avg_competence DECIMAL(3,2) DEFAULT 3.0,
    avg_communication DECIMAL(3,2) DEFAULT 3.0,
    avg_compassion DECIMAL(3,2) DEFAULT 3.0,
    avg_commitment DECIMAL(3,2) DEFAULT 3.0,
    avg_confidence DECIMAL(3,2) DEFAULT 3.0,

    -- Specializations and badges
    specialization_badges TEXT[],
    /* Examples:
    ['Crisis Expert', 'People First Leader', 'Strategic Thinker', 'Industry Veteran: Healthcare']
    */

    achievements_unlocked JSONB DEFAULT '[]',
    /* Example:
    [
        {"id": "first_win", "unlocked_at": "2025-01-15", "name": "First Victory"},
        {"id": "perfect_round", "unlocked_at": "2025-01-16", "name": "Perfect Decision"}
    ]
    */

    -- Career insights
    career_insights JSONB DEFAULT '{}',
    /* Example:
    {
        "recommended_paths": ["Chief Operations Officer", "Management Consultant"],
        "leadership_style": "Servant Leadership",
        "strengths": ["Crisis Management", "People Development"],
        "development_areas": ["Financial Acumen", "Strategic Planning"]
    }
    */

    -- Preferences
    preferred_scenario_type VARCHAR(50),
    preferred_company_room VARCHAR(20),
    preferred_executive VARCHAR(50),

    -- Metadata
    first_game_at TIMESTAMPTZ,
    last_game_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_leadership_level CHECK (
        leadership_level IN ('Bronze CEO', 'Silver CEO', 'Gold CEO', 'Platinum CEO', 'Diamond CEO')
    )
);

-- Indexes for progression queries
CREATE INDEX idx_cc_progression_xp ON cc_player_progression(total_xp DESC);
CREATE INDEX idx_cc_progression_level ON cc_player_progression(leadership_level);
CREATE INDEX idx_cc_progression_updated ON cc_player_progression(updated_at DESC);

-- ============================================
-- 7. SCENARIO-COMPANY MAPPING TABLE
-- ============================================
-- Maps which scenarios are available in which company rooms
CREATE TABLE IF NOT EXISTS cc_scenario_company_map (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES cc_business_scenarios(id) ON DELETE CASCADE,
    company_room_id UUID NOT NULL REFERENCES cc_company_rooms(id) ON DELETE CASCADE,

    -- Customization for this company
    industry_specific_title VARCHAR(255), -- Override title for this industry
    industry_specific_description TEXT, -- Override description for this industry
    custom_executive_pitches JSONB, -- Industry-specific executive arguments

    -- Availability
    is_active BOOLEAN DEFAULT true,
    unlock_requirements JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_scenario_company UNIQUE(scenario_id, company_room_id)
);

-- Indexes for mapping queries
CREATE INDEX idx_cc_scenario_map_scenario ON cc_scenario_company_map(scenario_id);
CREATE INDEX idx_cc_scenario_map_company ON cc_scenario_company_map(company_room_id);
CREATE INDEX idx_cc_scenario_map_active ON cc_scenario_company_map(company_room_id, is_active);

-- ============================================
-- 8. DAILY CHALLENGES TABLE (Modified)
-- ============================================
-- Special daily scenarios with bonus rewards
CREATE TABLE IF NOT EXISTS cc_daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_date DATE NOT NULL UNIQUE,
    scenario_id UUID NOT NULL REFERENCES cc_business_scenarios(id),
    company_room_id UUID REFERENCES cc_company_rooms(id),

    -- Special modifiers for daily challenge
    bonus_multiplier DECIMAL(3,2) DEFAULT 1.5,
    special_rules JSONB DEFAULT '{}',
    /* Example:
    {
        "time_limit": 30,
        "no_lens_hints": true,
        "all_solutions_visible": false
    }
    */

    -- Rewards
    xp_reward INTEGER DEFAULT 500,
    badge_reward VARCHAR(100),

    -- Participation tracking
    total_attempts INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    average_score INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for daily challenge lookups
CREATE INDEX idx_cc_daily_date ON cc_daily_challenges(challenge_date DESC);

-- ============================================
-- 9. ALTER EXISTING TABLES
-- ============================================

-- Modify cc_game_sessions to support new game mode
ALTER TABLE cc_game_sessions
ADD COLUMN IF NOT EXISTS scenario_id UUID REFERENCES cc_business_scenarios(id),
ADD COLUMN IF NOT EXISTS scenario_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS company_room_id UUID REFERENCES cc_company_rooms(id),
ADD COLUMN IF NOT EXISTS game_mode VARCHAR(50) DEFAULT 'mixed'; -- 'mixed', 'crisis_only', 'opportunity_only', 'risk_only'

-- Modify cc_game_session_players for new tracking
ALTER TABLE cc_game_session_players
ADD COLUMN IF NOT EXISTS selected_executive VARCHAR(50),
ADD COLUMN IF NOT EXISTS leadership_scores JSONB,
ADD COLUMN IF NOT EXISTS solution_selections UUID[],
ADD COLUMN IF NOT EXISTS round_scores JSONB DEFAULT '[]'; -- Array of round-by-round scores

-- ============================================
-- 10. HELPER FUNCTIONS
-- ============================================

-- Function to calculate 6 C's average
CREATE OR REPLACE FUNCTION calculate_six_cs_average(player_uuid UUID)
RETURNS TABLE(
    character_avg DECIMAL(3,2),
    competence_avg DECIMAL(3,2),
    communication_avg DECIMAL(3,2),
    compassion_avg DECIMAL(3,2),
    commitment_avg DECIMAL(3,2),
    confidence_avg DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROUND(AVG(character_score)::DECIMAL, 2),
        ROUND(AVG(competence_score)::DECIMAL, 2),
        ROUND(AVG(communication_score)::DECIMAL, 2),
        ROUND(AVG(compassion_score)::DECIMAL, 2),
        ROUND(AVG(commitment_score)::DECIMAL, 2),
        ROUND(AVG(confidence_score)::DECIMAL, 2)
    FROM (
        SELECT * FROM cc_leadership_scores
        WHERE player_id = player_uuid
        ORDER BY created_at DESC
        LIMIT 20
    ) recent_scores;
END;
$$ LANGUAGE plpgsql;

-- Function to get player's rank in company room
CREATE OR REPLACE FUNCTION get_player_company_rank(
    player_uuid UUID,
    company_code VARCHAR(20)
)
RETURNS INTEGER AS $$
DECLARE
    player_rank INTEGER;
BEGIN
    WITH company_scores AS (
        SELECT
            pp.player_id,
            (pp.company_experience->company_code->>'avg_score')::INTEGER as avg_score
        FROM cc_player_progression pp
        WHERE pp.company_experience ? company_code
    ),
    ranked_players AS (
        SELECT
            player_id,
            RANK() OVER (ORDER BY avg_score DESC) as rank
        FROM company_scores
    )
    SELECT rank INTO player_rank
    FROM ranked_players
    WHERE player_id = player_uuid;

    RETURN COALESCE(player_rank, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. TRIGGERS
-- ============================================

-- Trigger to update player progression after each game
CREATE OR REPLACE FUNCTION update_player_progression()
RETURNS TRIGGER AS $$
BEGIN
    -- Update player progression stats
    UPDATE cc_player_progression
    SET
        total_xp = total_xp + NEW.total_score,
        games_played = games_played + 1,
        last_game_at = NOW(),
        updated_at = NOW()
    WHERE player_id = NEW.player_id;

    -- Update 6 C's averages
    UPDATE cc_player_progression pp
    SET
        avg_character = subq.character_avg,
        avg_competence = subq.competence_avg,
        avg_communication = subq.communication_avg,
        avg_compassion = subq.compassion_avg,
        avg_commitment = subq.commitment_avg,
        avg_confidence = subq.confidence_avg
    FROM (
        SELECT * FROM calculate_six_cs_average(NEW.player_id)
    ) subq
    WHERE pp.player_id = NEW.player_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_progression
AFTER INSERT ON cc_leadership_scores
FOR EACH ROW
EXECUTE FUNCTION update_player_progression();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cc_company_rooms_updated_at BEFORE UPDATE ON cc_company_rooms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cc_business_scenarios_updated_at BEFORE UPDATE ON cc_business_scenarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cc_solution_cards_updated_at BEFORE UPDATE ON cc_solution_cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 12. INITIAL DATA - 10 COMPANY ROOMS
-- ============================================

INSERT INTO cc_company_rooms (code, name, industry_id, description, company_size, revenue, headquarters, known_for, logo_icon, color_scheme) VALUES
('MEDICORE', 'MediCore Solutions',
    (SELECT id FROM cc_industries WHERE code = 'HEALTH' LIMIT 1),
    'Mid-size medical device manufacturer specializing in cutting-edge healthcare technology',
    '5,000 employees', '$2B revenue', 'Boston, MA',
    'Surgical robotics and AI diagnostics',
    '🏥', '{"primary": "#0EA5E9", "secondary": "#0284C7", "accent": "#7DD3FC"}'),

('CLOUDPEAK', 'CloudPeak Systems',
    (SELECT id FROM cc_industries WHERE code = 'TECH' LIMIT 1),
    'B2B SaaS platform company providing enterprise cloud solutions',
    '3,000 employees', '$800M ARR', 'San Francisco, CA',
    'Cloud infrastructure and DevOps tools',
    '💻', '{"primary": "#8B5CF6", "secondary": "#7C3AED", "accent": "#C4B5FD"}'),

('TRENDFWD', 'TrendForward',
    (SELECT id FROM cc_industries WHERE code = 'RETAIL' LIMIT 1),
    'Omnichannel retail leader combining fashion with sustainability',
    '15,000 employees', '$5B revenue', 'New York, NY',
    'Fast fashion with sustainability focus',
    '🏪', '{"primary": "#F97316", "secondary": "#EA580C", "accent": "#FDBA74"}'),

('HORIZON', 'Horizon Financial',
    (SELECT id FROM cc_industries WHERE code = 'FINANCE' LIMIT 1),
    'Digital-first banking for the modern generation',
    '8,000 employees', '$100B assets', 'Charlotte, NC',
    'Mobile-first banking for millennials',
    '🏦', '{"primary": "#10B981", "secondary": "#059669", "accent": "#6EE7B7"}'),

('QUICKSERVE', 'QuickServe Global',
    (SELECT id FROM cc_industries WHERE code = 'FOOD' LIMIT 1),
    'Tech-enabled quick service restaurant chain',
    '50,000 employees', '2,000 locations', 'Chicago, IL',
    'Tech-enabled fast casual dining',
    '🍔', '{"primary": "#EF4444", "secondary": "#DC2626", "accent": "#FCA5A5"}'),

('SKYCONNECT', 'SkyConnect Airlines',
    (SELECT id FROM cc_industries WHERE code = 'TRANSPORT' LIMIT 1),
    'International airline focusing on affordable global connectivity',
    '25,000 employees', '300 aircraft', 'Atlanta, GA',
    'Low-cost international routes',
    '✈️', '{"primary": "#06B6D4", "secondary": "#0891B2", "accent": "#67E8F9"}'),

('GREENGRID', 'GreenGrid Energy',
    (SELECT id FROM cc_industries WHERE code = 'ENERGY' LIMIT 1),
    'Renewable energy provider leading the clean energy transition',
    '4,000 employees', '$3B revenue', 'Denver, CO',
    'Solar and wind farm operations',
    '⚡', '{"primary": "#84CC16", "secondary": "#65A30D", "accent": "#BEF264"}'),

('NEXTGEN', 'NextGen Mobile',
    (SELECT id FROM cc_industries WHERE code = 'TELECOM' LIMIT 1),
    'Telecommunications leader in 5G and IoT innovation',
    '20,000 employees', '$15B revenue', 'Dallas, TX',
    '5G infrastructure and IoT solutions',
    '📱', '{"primary": "#0EA5E9", "secondary": "#0284C7", "accent": "#7DD3FC"}'),

('PLAYFORGE', 'PlayForge Entertainment',
    (SELECT id FROM cc_industries WHERE code = 'GAMING' LIMIT 1),
    'AAA game developer and esports pioneer',
    '2,000 employees', '$1B revenue', 'Los Angeles, CA',
    'AAA game titles and esports',
    '🎮', '{"primary": "#A855F7", "secondary": "#9333EA", "accent": "#D8B4FE"}'),

('BUILDRIGHT', 'BuildRight Construction',
    (SELECT id FROM cc_industries WHERE code = 'CONSTRUCT' LIMIT 1),
    'Commercial construction leader in sustainable development',
    '10,000 employees', '$4B revenue', 'Houston, TX',
    'Sustainable commercial developments',
    '🏗️', '{"primary": "#F97316", "secondary": "#EA580C", "accent": "#FDBA74"}')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- 13. PERMISSIONS
-- ============================================

-- Grant appropriate permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON cc_leadership_scores TO authenticated;
GRANT INSERT, UPDATE ON cc_player_progression TO authenticated;
GRANT UPDATE ON cc_daily_challenges TO authenticated;

-- Enable RLS on sensitive tables
ALTER TABLE cc_leadership_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_player_progression ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own leadership scores"
ON cc_leadership_scores FOR SELECT
USING (auth.uid() = player_id);

CREATE POLICY "Users can insert their own leadership scores"
ON cc_leadership_scores FOR INSERT
WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can view their own progression"
ON cc_player_progression FOR SELECT
USING (auth.uid() = player_id);

CREATE POLICY "Users can update their own progression"
ON cc_player_progression FOR UPDATE
USING (auth.uid() = player_id);

-- ============================================
-- END OF SCHEMA
-- ============================================