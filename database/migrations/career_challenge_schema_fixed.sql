-- ================================================================
-- Discovered Live! Career Challenge Database Schema (FIXED)
-- ================================================================
-- This schema implements the complete data model for Career Challenge game mode
-- Fixed to work with existing Supabase auth schema
-- ================================================================

-- ================================================================
-- INDUSTRIES TABLE
-- Defines different industry contexts for challenges
-- ================================================================
CREATE TABLE IF NOT EXISTS cc_industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- 'esports', 'healthcare', 'construction'
    name VARCHAR(100) NOT NULL, -- 'Esports Organization', 'Healthcare Startup'
    description TEXT,
    icon VARCHAR(10), -- emoji or icon identifier
    color_scheme JSONB, -- {"primary": "#1e3a8a", "secondary": "#f59e0b"}

    -- Challenge configuration
    challenge_categories TEXT[], -- ['Management', 'Finance', 'Operations', 'Marketing']
    difficulty_levels TEXT[] DEFAULT ARRAY['easy', 'medium', 'hard'],

    -- Educational metadata
    grade_level_min VARCHAR(20) DEFAULT 'middle',
    grade_level_max VARCHAR(20) DEFAULT 'high',
    learning_objectives TEXT[],
    career_connections TEXT[], -- Related career codes from career_paths table

    -- Status and tracking
    is_active BOOLEAN DEFAULT true,
    is_premium BOOLEAN DEFAULT false,
    launch_date DATE,
    times_played INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2),

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID, -- Removed foreign key reference

    CONSTRAINT valid_grade_levels CHECK (
        grade_level_min IN ('elementary', 'middle', 'high') AND
        grade_level_max IN ('elementary', 'middle', 'high')
    )
);

CREATE INDEX idx_cc_industries_active ON cc_industries(is_active);
CREATE INDEX idx_cc_industries_code ON cc_industries(code);

-- ================================================================
-- CHALLENGES TABLE
-- Individual challenge cards with scenarios and requirements
-- ================================================================
CREATE TABLE IF NOT EXISTS cc_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id UUID REFERENCES cc_industries(id) ON DELETE CASCADE,

    -- Challenge content
    challenge_code VARCHAR(100) UNIQUE NOT NULL, -- 'esports_tournament_crisis_01'
    title VARCHAR(200) NOT NULL,
    scenario_text TEXT NOT NULL, -- The challenge description shown to players
    category VARCHAR(50) NOT NULL, -- 'Finance', 'Operations', 'Management'

    -- Difficulty and requirements
    difficulty VARCHAR(20) NOT NULL DEFAULT 'medium',
    min_roles_required INTEGER DEFAULT 1,
    max_roles_allowed INTEGER DEFAULT 5,
    time_pressure_level INTEGER DEFAULT 3, -- 1-5 scale

    -- Success criteria
    base_difficulty_score INTEGER DEFAULT 50, -- Points needed to succeed
    perfect_score INTEGER DEFAULT 100, -- Points for perfect solution
    failure_threshold INTEGER DEFAULT 25, -- Below this = failure

    -- Role requirements and bonuses
    required_roles TEXT[], -- Roles that MUST be present
    recommended_roles TEXT[], -- Roles that provide bonus
    restricted_roles TEXT[], -- Roles that cannot be used

    -- Educational content
    skill_connections TEXT[],
    learning_outcomes TEXT[],
    real_world_example TEXT,

    -- AI generation metadata
    ai_generated BOOLEAN DEFAULT false,
    ai_prompt_used TEXT,
    ai_model_version VARCHAR(50),
    human_reviewed BOOLEAN DEFAULT false,
    review_notes TEXT,

    -- Statistics
    times_presented INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    avg_team_size DECIMAL(3,1),
    avg_completion_time INTEGER, -- seconds

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_seasonal BOOLEAN DEFAULT false,
    available_from DATE,
    available_until DATE,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_difficulty CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    CONSTRAINT valid_score_thresholds CHECK (
        failure_threshold < base_difficulty_score AND
        base_difficulty_score <= perfect_score
    )
);

CREATE INDEX idx_cc_challenges_industry ON cc_challenges(industry_id);
CREATE INDEX idx_cc_challenges_category ON cc_challenges(category);
CREATE INDEX idx_cc_challenges_difficulty ON cc_challenges(difficulty);
CREATE INDEX idx_cc_challenges_active ON cc_challenges(is_active);

-- ================================================================
-- ROLE CARDS TABLE
-- Defines all role cards available in the game
-- ================================================================
CREATE TABLE IF NOT EXISTS cc_role_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id UUID REFERENCES cc_industries(id) ON DELETE CASCADE,

    -- Role identification
    role_code VARCHAR(100) UNIQUE NOT NULL, -- 'esports_coach_01'
    role_name VARCHAR(100) NOT NULL, -- 'Head Coach'
    role_title VARCHAR(100), -- 'Strategic Team Leader'
    avatar_url TEXT,

    -- Card properties
    rarity VARCHAR(20) DEFAULT 'common', -- common, uncommon, rare, epic, legendary
    card_set VARCHAR(50), -- 'base', 'expansion_1', 'seasonal_2024'

    -- Power and abilities
    base_power INTEGER DEFAULT 5, -- 1-10 scale
    category_bonuses JSONB, -- {"Finance": 3, "Management": 7}
    special_abilities JSONB, -- [{"name": "Leadership", "effect": "+2 to all team members"}]

    -- Description and flavor
    description TEXT NOT NULL, -- What this role does
    flavor_text TEXT, -- Inspirational quote or context
    backstory TEXT, -- Character background for engagement

    -- Career information
    related_career_code VARCHAR(50), -- Links to career_paths table
    education_requirements TEXT[],
    key_skills TEXT[],
    salary_range VARCHAR(50), -- '$45,000 - $75,000'

    -- Synergies (calculated separately but cached here for performance)
    synergy_partners TEXT[], -- Other role_codes that combo well
    anti_synergy_partners TEXT[], -- Roles that conflict

    -- Collection stats
    total_copies_distributed INTEGER DEFAULT 0,
    times_played INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2),

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_collectible BOOLEAN DEFAULT true,
    unlock_requirements JSONB, -- {"level": 10, "achievements": ["first_win"]}

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_rarity CHECK (
        rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')
    ),
    CONSTRAINT valid_base_power CHECK (base_power BETWEEN 1 AND 10)
);

CREATE INDEX idx_cc_role_cards_industry ON cc_role_cards(industry_id);
CREATE INDEX idx_cc_role_cards_rarity ON cc_role_cards(rarity);
CREATE INDEX idx_cc_role_cards_code ON cc_role_cards(role_code);

-- ================================================================
-- SYNERGY DEFINITIONS TABLE
-- Defines bonus points when specific role combinations are used
-- ================================================================
CREATE TABLE IF NOT EXISTS cc_synergy_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id UUID REFERENCES cc_industries(id) ON DELETE CASCADE,

    -- Synergy identification
    synergy_name VARCHAR(100) NOT NULL, -- 'Dynamic Duo', 'Power Trio'
    synergy_type VARCHAR(50) DEFAULT 'additive', -- additive, multiplicative, special

    -- Required roles (store as role_codes for flexibility)
    required_roles TEXT[] NOT NULL, -- ['esports_coach_01', 'esports_analyst_01']
    optional_roles TEXT[], -- Additional roles that enhance the synergy

    -- Bonus effects
    power_bonus INTEGER DEFAULT 0, -- Flat power increase
    power_multiplier DECIMAL(3,2) DEFAULT 1.0, -- Multiplicative bonus
    category_bonuses JSONB, -- {"Finance": 5, "Operations": 3}
    special_effect TEXT, -- Description of any special effect

    -- Activation conditions
    min_challenge_difficulty VARCHAR(20), -- Only active on certain difficulties
    required_challenge_category VARCHAR(50), -- Only for specific categories
    activation_chance DECIMAL(3,2) DEFAULT 1.0, -- Probability of triggering

    -- Flavor and education
    description TEXT NOT NULL,
    explanation TEXT, -- Why these roles work well together
    real_world_example TEXT,

    -- Statistics
    times_activated INTEGER DEFAULT 0,
    success_rate_with_synergy DECIMAL(5,2),
    avg_bonus_contributed DECIMAL(5,2),

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_hidden BOOLEAN DEFAULT false, -- Players must discover it

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_synergy_type CHECK (
        synergy_type IN ('additive', 'multiplicative', 'special', 'conditional')
    ),
    CONSTRAINT required_roles_min CHECK (array_length(required_roles, 1) >= 2)
);

CREATE INDEX idx_cc_synergies_industry ON cc_synergy_definitions(industry_id);
CREATE INDEX idx_cc_synergies_active ON cc_synergy_definitions(is_active);

-- ================================================================
-- PLAYER COLLECTIONS TABLE
-- Tracks which role cards each player owns
-- Using TEXT for player_id to be flexible with auth systems
-- ================================================================
CREATE TABLE IF NOT EXISTS cc_player_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id TEXT NOT NULL, -- Can be UUID string or any identifier
    role_card_id UUID REFERENCES cc_role_cards(id) ON DELETE CASCADE,

    -- Collection details
    quantity INTEGER DEFAULT 1,
    first_acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acquisition_method VARCHAR(50), -- 'earned', 'traded', 'purchased', 'gifted'

    -- Card experience
    times_used INTEGER DEFAULT 0,
    wins_with_card INTEGER DEFAULT 0,
    favorite_position INTEGER, -- Order in player's preferred team

    -- Trading status
    is_tradeable BOOLEAN DEFAULT true,
    is_favorite BOOLEAN DEFAULT false,
    trade_locked_until TIMESTAMP WITH TIME ZONE,

    -- Customization
    custom_nickname VARCHAR(50),
    card_level INTEGER DEFAULT 1, -- If implementing card leveling
    card_experience INTEGER DEFAULT 0,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_player_card UNIQUE(player_id, role_card_id),
    CONSTRAINT valid_quantity CHECK (quantity >= 0)
);

CREATE INDEX idx_cc_collections_player ON cc_player_collections(player_id);
CREATE INDEX idx_cc_collections_card ON cc_player_collections(role_card_id);

-- ================================================================
-- CHALLENGE SESSIONS TABLE
-- Tracks individual challenge attempts and outcomes
-- ================================================================
CREATE TABLE IF NOT EXISTS cc_challenge_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_session_id UUID, -- References dl_game_sessions if part of multiplayer
    room_id UUID, -- References dl_perpetual_rooms

    -- Challenge details
    challenge_id UUID REFERENCES cc_challenges(id),
    challenge_number INTEGER, -- Which challenge in the sequence

    -- Participants
    participants JSONB NOT NULL, -- Array of player objects with their deployed roles
    /* Structure:
    [
        {
            "player_id": "string",
            "display_name": "string",
            "deployed_roles": ["role_code_1", "role_code_2"],
            "is_ai": false
        }
    ]
    */

    -- Team composition
    team_composition JSONB, -- Detailed team setup with positions
    total_team_power INTEGER,
    synergies_activated TEXT[],
    total_synergy_bonus INTEGER,

    -- Challenge resolution
    challenge_difficulty_score INTEGER,
    final_team_score INTEGER,
    outcome VARCHAR(20) NOT NULL, -- 'success', 'failure', 'perfect', 'abandoned'
    outcome_margin INTEGER, -- How much they won/lost by

    -- Rewards
    xp_awarded JSONB, -- XP per player
    cards_awarded JSONB, -- New cards earned
    achievements_unlocked TEXT[],

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER,

    -- Statistics
    turns_taken INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_outcome CHECK (
        outcome IN ('success', 'failure', 'perfect', 'abandoned', 'in_progress')
    )
);

CREATE INDEX idx_cc_sessions_challenge ON cc_challenge_sessions(challenge_id);
CREATE INDEX idx_cc_sessions_game ON cc_challenge_sessions(game_session_id);
CREATE INDEX idx_cc_sessions_outcome ON cc_challenge_sessions(outcome);
CREATE INDEX idx_cc_sessions_created ON cc_challenge_sessions(created_at);

-- ================================================================
-- PLAYER PROGRESS TABLE
-- Tracks overall Career Challenge progress and stats
-- ================================================================
CREATE TABLE IF NOT EXISTS cc_player_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id TEXT NOT NULL UNIQUE, -- Flexible player identifier

    -- Overall statistics
    total_challenges_attempted INTEGER DEFAULT 0,
    total_challenges_succeeded INTEGER DEFAULT 0,
    total_challenges_perfect INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2),

    -- Collection stats
    total_cards_collected INTEGER DEFAULT 0,
    unique_cards_collected INTEGER DEFAULT 0,
    rarest_card_rarity VARCHAR(20),
    favorite_industry_id UUID REFERENCES cc_industries(id),

    -- Experience and level
    total_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    xp_to_next_level INTEGER DEFAULT 100,
    prestige_level INTEGER DEFAULT 0,

    -- Achievements and unlocks
    achievements_earned TEXT[],
    industries_unlocked TEXT[],
    special_cards_unlocked TEXT[],
    titles_earned TEXT[],

    -- Gameplay preferences
    preferred_team_size INTEGER,
    favorite_role_cards TEXT[], -- Top 5 most used
    preferred_difficulty VARCHAR(20),
    avg_session_length INTEGER, -- seconds

    -- Social stats
    trades_completed INTEGER DEFAULT 0,
    gifts_sent INTEGER DEFAULT 0,
    gifts_received INTEGER DEFAULT 0,
    friend_challenges_won INTEGER DEFAULT 0,

    -- Streaks and records
    current_win_streak INTEGER DEFAULT 0,
    best_win_streak INTEGER DEFAULT 0,
    fastest_challenge_time INTEGER, -- seconds
    highest_team_power INTEGER,

    -- Last activity
    last_played_at TIMESTAMP WITH TIME ZONE,
    last_challenge_id UUID REFERENCES cc_challenges(id),
    last_industry_played UUID REFERENCES cc_industries(id),

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cc_progress_player ON cc_player_progress(player_id);
CREATE INDEX idx_cc_progress_level ON cc_player_progress(current_level);
CREATE INDEX idx_cc_progress_xp ON cc_player_progress(total_xp);

-- ================================================================
-- TRADING POST TABLE
-- Manages card trading between players
-- ================================================================
CREATE TABLE IF NOT EXISTS cc_trading_post (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Trade participants (using TEXT for flexibility)
    offering_player_id TEXT NOT NULL,
    receiving_player_id TEXT, -- NULL for open trades

    -- Trade contents
    offered_cards JSONB NOT NULL, -- [{"card_id": "uuid", "quantity": 1}]
    requested_cards JSONB, -- Can be specific cards or rarity requirements

    -- Trade details
    trade_type VARCHAR(20) DEFAULT 'exchange', -- exchange, gift, auction
    trade_status VARCHAR(20) DEFAULT 'open',
    message TEXT,

    -- Timing
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,

    -- Audit
    cancelled_by TEXT,
    cancellation_reason VARCHAR(50),

    CONSTRAINT valid_trade_type CHECK (
        trade_type IN ('exchange', 'gift', 'auction', 'quest_reward')
    ),
    CONSTRAINT valid_trade_status CHECK (
        trade_status IN ('open', 'pending', 'completed', 'cancelled', 'expired')
    )
);

CREATE INDEX idx_cc_trading_offering ON cc_trading_post(offering_player_id);
CREATE INDEX idx_cc_trading_receiving ON cc_trading_post(receiving_player_id);
CREATE INDEX idx_cc_trading_status ON cc_trading_post(trade_status);

-- ================================================================
-- DAILY CHALLENGES TABLE
-- Special challenges that rotate daily/weekly
-- ================================================================
CREATE TABLE IF NOT EXISTS cc_daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES cc_challenges(id),

    -- Schedule
    active_date DATE NOT NULL,
    challenge_type VARCHAR(20) DEFAULT 'daily', -- daily, weekly, special

    -- Bonus rewards
    bonus_xp INTEGER DEFAULT 0,
    bonus_cards TEXT[], -- Role card codes to award
    special_reward_description TEXT,

    -- Participation
    times_attempted INTEGER DEFAULT 0,
    times_completed INTEGER DEFAULT 0,
    unique_players INTEGER DEFAULT 0,

    -- Leaderboard
    leaderboard JSONB, -- Top players for this challenge

    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_daily_challenge UNIQUE(active_date, challenge_type),
    CONSTRAINT valid_challenge_type CHECK (
        challenge_type IN ('daily', 'weekly', 'weekend', 'special', 'seasonal')
    )
);

CREATE INDEX idx_cc_daily_date ON cc_daily_challenges(active_date);
CREATE INDEX idx_cc_daily_type ON cc_daily_challenges(challenge_type);

-- ================================================================
-- SAMPLE DATA FOR TESTING
-- ================================================================

-- Insert sample industry: Esports Organization
INSERT INTO cc_industries (code, name, description, icon, challenge_categories, color_scheme)
VALUES (
    'esports',
    'Esports Organization',
    'Manage a professional gaming organization with players, coaches, and sponsors',
    '🎮',
    ARRAY['Management', 'Finance', 'Marketing', 'Operations', 'Technology'],
    '{"primary": "#6366f1", "secondary": "#8b5cf6"}'::jsonb
) ON CONFLICT (code) DO NOTHING;

-- Insert sample industry: Healthcare Startup
INSERT INTO cc_industries (code, name, description, icon, challenge_categories, color_scheme)
VALUES (
    'healthcare',
    'Healthcare Startup',
    'Navigate the challenges of running an innovative healthcare company',
    '🏥',
    ARRAY['Research', 'Compliance', 'Finance', 'Patient Care', 'Technology'],
    '{"primary": "#059669", "secondary": "#0891b2"}'::jsonb
) ON CONFLICT (code) DO NOTHING;

-- Insert sample industry: Construction Firm
INSERT INTO cc_industries (code, name, description, icon, challenge_categories, color_scheme)
VALUES (
    'construction',
    'Construction Firm',
    'Build and manage large-scale construction projects',
    '🏗️',
    ARRAY['Safety', 'Project Management', 'Finance', 'Operations', 'Compliance'],
    '{"primary": "#ea580c", "secondary": "#dc2626"}'::jsonb
) ON CONFLICT (code) DO NOTHING;

-- Sample challenges for each industry
INSERT INTO cc_challenges (
    industry_id,
    challenge_code,
    title,
    scenario_text,
    category,
    difficulty,
    base_difficulty_score,
    perfect_score,
    failure_threshold,
    required_roles,
    recommended_roles,
    min_roles_required,
    max_roles_allowed
)
SELECT
    id,
    'esports_sponsor_crisis_01',
    'Sponsor Withdrawal Crisis',
    'Your main sponsor is threatening to withdraw funding due to a player controversy on social media. You have 48 hours to manage the crisis, retain the sponsor, and maintain team morale. The sponsor represents 40% of your annual budget.',
    'Management',
    'hard',
    75,
    100,
    40,
    ARRAY['manager'],
    ARRAY['coach', 'analyst', 'social_media_manager', 'player_rep'],
    2,
    5
FROM cc_industries WHERE code = 'esports'
ON CONFLICT (challenge_code) DO NOTHING;

INSERT INTO cc_challenges (
    industry_id,
    challenge_code,
    title,
    scenario_text,
    category,
    difficulty,
    base_difficulty_score,
    perfect_score,
    failure_threshold,
    recommended_roles,
    min_roles_required,
    max_roles_allowed
)
SELECT
    id,
    'healthcare_fda_approval_01',
    'FDA Approval Fast Track',
    'Your breakthrough medical device needs FDA approval within 6 months to beat competitors to market. Navigate regulatory requirements, clinical trials, and documentation while managing limited resources.',
    'Compliance',
    'expert',
    85,
    120,
    50,
    ARRAY['compliance_officer', 'researcher', 'clinical_lead', 'regulatory_expert'],
    3,
    6
FROM cc_industries WHERE code = 'healthcare'
ON CONFLICT (challenge_code) DO NOTHING;

INSERT INTO cc_challenges (
    industry_id,
    challenge_code,
    title,
    scenario_text,
    category,
    difficulty,
    base_difficulty_score,
    perfect_score,
    failure_threshold,
    recommended_roles,
    min_roles_required,
    max_roles_allowed
)
SELECT
    id,
    'construction_safety_incident_01',
    'Safety Violation Response',
    'An OSHA inspection has found multiple safety violations on your biggest project site. You must implement corrections, retrain workers, and prevent work stoppage while maintaining client confidence.',
    'Safety',
    'medium',
    60,
    85,
    30,
    ARRAY['safety_inspector', 'foreman', 'project_manager', 'trainer'],
    2,
    4
FROM cc_industries WHERE code = 'construction'
ON CONFLICT (challenge_code) DO NOTHING;

-- Sample role cards for each industry
-- Esports roles
INSERT INTO cc_role_cards (
    industry_id,
    role_code,
    role_name,
    role_title,
    rarity,
    base_power,
    category_bonuses,
    description,
    related_career_code
)
SELECT
    id,
    'esports_coach_01',
    'Head Coach',
    'Strategic Team Leader',
    'rare',
    7,
    '{"Management": 8, "Operations": 6, "Technology": 3}'::jsonb,
    'Leads the team strategy and player development. Excellent at managing personalities and tactical preparation.',
    'esports_coach'
FROM cc_industries WHERE code = 'esports'
ON CONFLICT (role_code) DO NOTHING;

INSERT INTO cc_role_cards (
    industry_id,
    role_code,
    role_name,
    role_title,
    rarity,
    base_power,
    category_bonuses,
    description,
    related_career_code
)
SELECT
    id,
    'esports_analyst_01',
    'Performance Analyst',
    'Data Strategist',
    'uncommon',
    5,
    '{"Technology": 7, "Operations": 5, "Management": 2}'::jsonb,
    'Analyzes gameplay data to identify strengths, weaknesses, and opportunities for improvement.',
    'data_analyst'
FROM cc_industries WHERE code = 'esports'
ON CONFLICT (role_code) DO NOTHING;

INSERT INTO cc_role_cards (
    industry_id,
    role_code,
    role_name,
    role_title,
    rarity,
    base_power,
    category_bonuses,
    description
)
SELECT
    id,
    'esports_manager_01',
    'Team Manager',
    'Operations Director',
    'uncommon',
    6,
    '{"Management": 7, "Finance": 5, "Marketing": 4}'::jsonb,
    'Handles day-to-day operations, sponsor relations, and team logistics.'
FROM cc_industries WHERE code = 'esports'
ON CONFLICT (role_code) DO NOTHING;

-- Healthcare roles
INSERT INTO cc_role_cards (
    industry_id,
    role_code,
    role_name,
    role_title,
    rarity,
    base_power,
    category_bonuses,
    description
)
SELECT
    id,
    'healthcare_researcher_01',
    'Lead Researcher',
    'Scientific Director',
    'epic',
    8,
    '{"Research": 9, "Technology": 6, "Compliance": 4}'::jsonb,
    'Drives innovation through rigorous research and clinical trials.'
FROM cc_industries WHERE code = 'healthcare'
ON CONFLICT (role_code) DO NOTHING;

INSERT INTO cc_role_cards (
    industry_id,
    role_code,
    role_name,
    role_title,
    rarity,
    base_power,
    category_bonuses,
    description
)
SELECT
    id,
    'healthcare_compliance_01',
    'Compliance Officer',
    'Regulatory Expert',
    'rare',
    6,
    '{"Compliance": 9, "Finance": 3, "Research": 4}'::jsonb,
    'Ensures all operations meet regulatory requirements and industry standards.'
FROM cc_industries WHERE code = 'healthcare'
ON CONFLICT (role_code) DO NOTHING;

-- Construction roles
INSERT INTO cc_role_cards (
    industry_id,
    role_code,
    role_name,
    role_title,
    rarity,
    base_power,
    category_bonuses,
    description
)
SELECT
    id,
    'construction_foreman_01',
    'Site Foreman',
    'Construction Leader',
    'common',
    5,
    '{"Operations": 7, "Safety": 5, "Project Management": 6}'::jsonb,
    'Oversees daily construction activities and coordinates work crews.'
FROM cc_industries WHERE code = 'construction'
ON CONFLICT (role_code) DO NOTHING;

INSERT INTO cc_role_cards (
    industry_id,
    role_code,
    role_name,
    role_title,
    rarity,
    base_power,
    category_bonuses,
    description
)
SELECT
    id,
    'construction_safety_01',
    'Safety Inspector',
    'OSHA Specialist',
    'uncommon',
    6,
    '{"Safety": 9, "Compliance": 7, "Operations": 3}'::jsonb,
    'Ensures workplace safety and OSHA compliance on all job sites.'
FROM cc_industries WHERE code = 'construction'
ON CONFLICT (role_code) DO NOTHING;

-- Sample synergy definitions
INSERT INTO cc_synergy_definitions (
    industry_id,
    synergy_name,
    required_roles,
    power_bonus,
    description,
    explanation
)
SELECT
    id,
    'Strategic Duo',
    ARRAY['esports_coach_01', 'esports_analyst_01'],
    15,
    'Coach and Analyst working together create unbeatable strategies',
    'The combination of leadership and data analysis leads to informed decisions and better team performance'
FROM cc_industries WHERE code = 'esports'
ON CONFLICT DO NOTHING;

INSERT INTO cc_synergy_definitions (
    industry_id,
    synergy_name,
    required_roles,
    power_bonus,
    category_bonuses,
    description,
    explanation
)
SELECT
    id,
    'Management Trinity',
    ARRAY['esports_coach_01', 'esports_analyst_01', 'esports_manager_01'],
    25,
    '{"Management": 10, "Operations": 8}'::jsonb,
    'Complete leadership team provides comprehensive organizational control',
    'With strategic, analytical, and operational leadership aligned, the organization runs at peak efficiency'
FROM cc_industries WHERE code = 'esports'
ON CONFLICT DO NOTHING;

INSERT INTO cc_synergy_definitions (
    industry_id,
    synergy_name,
    required_roles,
    power_bonus,
    description,
    explanation
)
SELECT
    id,
    'Research Breakthrough',
    ARRAY['healthcare_researcher_01', 'healthcare_compliance_01'],
    20,
    'Researcher and Compliance Officer ensure innovation meets regulations',
    'Combining scientific innovation with regulatory expertise accelerates time to market'
FROM cc_industries WHERE code = 'healthcare'
ON CONFLICT DO NOTHING;

INSERT INTO cc_synergy_definitions (
    industry_id,
    synergy_name,
    required_roles,
    power_bonus,
    description,
    explanation
)
SELECT
    id,
    'Safety First',
    ARRAY['construction_foreman_01', 'construction_safety_01'],
    18,
    'Foreman and Safety Inspector create accident-free worksites',
    'Proactive safety management prevents incidents and keeps projects on schedule'
FROM cc_industries WHERE code = 'construction'
ON CONFLICT DO NOTHING;

-- ================================================================
-- HELPER FUNCTIONS
-- ================================================================

-- Function to calculate team power including synergies
CREATE OR REPLACE FUNCTION cc_calculate_team_power(
    p_role_cards TEXT[],
    p_challenge_id UUID
) RETURNS TABLE (
    total_power INTEGER,
    synergies_activated TEXT[],
    synergy_bonus INTEGER
) AS $$
DECLARE
    v_total_power INTEGER := 0;
    v_synergies TEXT[] := '{}';
    v_synergy_bonus INTEGER := 0;
BEGIN
    -- Calculate base power from role cards
    SELECT COALESCE(SUM(base_power), 0)
    INTO v_total_power
    FROM cc_role_cards
    WHERE role_code = ANY(p_role_cards);

    -- Check for synergies
    WITH applicable_synergies AS (
        SELECT
            s.synergy_name,
            s.power_bonus
        FROM cc_synergy_definitions s
        WHERE s.is_active = true
        AND s.required_roles <@ p_role_cards
    )
    SELECT
        array_agg(synergy_name),
        COALESCE(SUM(power_bonus), 0)
    INTO v_synergies, v_synergy_bonus
    FROM applicable_synergies;

    RETURN QUERY SELECT
        v_total_power + v_synergy_bonus,
        COALESCE(v_synergies, '{}'),
        v_synergy_bonus;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a challenge is completed successfully
CREATE OR REPLACE FUNCTION cc_evaluate_challenge(
    p_team_power INTEGER,
    p_challenge_id UUID
) RETURNS VARCHAR AS $$
DECLARE
    v_difficulty_score INTEGER;
    v_perfect_score INTEGER;
    v_failure_threshold INTEGER;
BEGIN
    SELECT
        base_difficulty_score,
        perfect_score,
        failure_threshold
    INTO v_difficulty_score, v_perfect_score, v_failure_threshold
    FROM cc_challenges
    WHERE id = p_challenge_id;

    IF p_team_power >= v_perfect_score THEN
        RETURN 'perfect';
    ELSIF p_team_power >= v_difficulty_score THEN
        RETURN 'success';
    ELSIF p_team_power >= v_failure_threshold THEN
        RETURN 'failure';
    ELSE
        RETURN 'failure';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cc_industries_updated_at BEFORE UPDATE ON cc_industries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cc_challenges_updated_at BEFORE UPDATE ON cc_challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cc_role_cards_updated_at BEFORE UPDATE ON cc_role_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- PERMISSIONS (adjust based on your Supabase RLS policies)
-- ================================================================

-- Enable Row Level Security
ALTER TABLE cc_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_role_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_player_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_challenge_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_player_progress ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (customize based on your needs)
CREATE POLICY "Industries are viewable by everyone" ON cc_industries
    FOR SELECT USING (true);

CREATE POLICY "Challenges are viewable by everyone" ON cc_challenges
    FOR SELECT USING (true);

CREATE POLICY "Role cards are viewable by everyone" ON cc_role_cards
    FOR SELECT USING (true);

-- For player-specific tables, you'll need to adjust based on your auth setup
-- These are examples that would work with Supabase Auth:
-- CREATE POLICY "Players can view their own collections" ON cc_player_collections
--     FOR SELECT USING (auth.uid()::text = player_id);

-- CREATE POLICY "Players can view their own progress" ON cc_player_progress
--     FOR SELECT USING (auth.uid()::text = player_id);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Additional performance indexes
CREATE INDEX idx_cc_sessions_participants ON cc_challenge_sessions USING GIN (participants);
CREATE INDEX idx_cc_collections_quantity ON cc_player_collections(quantity) WHERE quantity > 0;
CREATE INDEX idx_cc_role_cards_related_career ON cc_role_cards(related_career_code);
CREATE INDEX idx_cc_synergies_required_roles ON cc_synergy_definitions USING GIN (required_roles);

-- ================================================================
-- END OF SCHEMA
-- ================================================================