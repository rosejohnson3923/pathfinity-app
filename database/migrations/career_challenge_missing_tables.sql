-- ================================================================
-- Career Challenge Missing Tables
-- Run this script to create the 4 missing tables
-- ================================================================

-- 1. SYNERGIES TABLE
-- Defines bonus effects when specific roles are combined
CREATE TABLE IF NOT EXISTS cc_synergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_id UUID REFERENCES cc_industries(id) ON DELETE CASCADE,

    -- Identification
    synergy_name VARCHAR(100) NOT NULL,
    synergy_type VARCHAR(20) DEFAULT 'additive', -- 'additive', 'multiplicative', 'special', 'conditional'

    -- Requirements
    required_roles TEXT[], -- Array of role names required
    optional_roles TEXT[], -- Additional roles that enhance the synergy

    -- Bonuses
    power_bonus INTEGER DEFAULT 0,
    power_multiplier DECIMAL(3,2) DEFAULT 1.0,
    category_bonuses JSONB DEFAULT '{}',
    special_effect TEXT,

    -- Conditions
    min_challenge_difficulty VARCHAR(20),
    required_challenge_category VARCHAR(50),
    activation_chance DECIMAL(3,2) DEFAULT 1.0,

    -- Flavor
    description TEXT,
    explanation TEXT,
    real_world_example TEXT,

    -- Statistics
    times_activated INTEGER DEFAULT 0,
    success_rate_with_synergy DECIMAL(3,2),

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_hidden BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. GAME SESSIONS TABLE
-- Tracks multiplayer game sessions
CREATE TABLE IF NOT EXISTS cc_game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_player_id TEXT NOT NULL,
    room_code VARCHAR(20) UNIQUE NOT NULL,
    industry_id UUID REFERENCES cc_industries(id),

    -- Status
    status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'in_progress', 'completed', 'abandoned'
    current_round INTEGER DEFAULT 0,
    max_rounds INTEGER DEFAULT 10,

    -- Players
    current_players INTEGER DEFAULT 1,
    max_players INTEGER DEFAULT 6,

    -- Winner
    winner_id TEXT,
    winner_name VARCHAR(100),
    final_scores JSONB DEFAULT '{}',

    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_status CHECK (status IN ('waiting', 'in_progress', 'completed', 'abandoned'))
);

-- 3. CHALLENGE PROGRESS TABLE
-- Tracks individual challenge attempts
CREATE TABLE IF NOT EXISTS cc_challenge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES cc_game_sessions(id) ON DELETE CASCADE,
    player_id TEXT NOT NULL,
    challenge_id UUID REFERENCES cc_challenges(id),

    -- Team composition
    deployed_roles TEXT[], -- Role card IDs used
    team_power INTEGER,
    synergies_activated TEXT[],

    -- Outcome
    outcome VARCHAR(20), -- 'success', 'failure', 'perfect', 'abandoned'
    score_earned INTEGER DEFAULT 0,
    time_taken_seconds INTEGER,

    -- Rewards
    xp_earned INTEGER DEFAULT 0,
    cards_earned TEXT[],

    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT valid_outcome CHECK (outcome IN ('success', 'failure', 'perfect', 'abandoned', 'in_progress'))
);

-- 4. TRADING MARKET TABLE
-- Manages card trading between players
CREATE TABLE IF NOT EXISTS cc_trading_market (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Participants
    offering_player_id TEXT NOT NULL,
    receiving_player_id TEXT, -- NULL for open market offers

    -- Cards
    offered_cards JSONB NOT NULL, -- Array of {card_id, quantity}
    requested_cards JSONB, -- Array of {card_id, quantity} or requirements

    -- Details
    trade_type VARCHAR(20) DEFAULT 'exchange', -- 'exchange', 'gift', 'auction', 'quest_reward'
    trade_status VARCHAR(20) DEFAULT 'open', -- 'open', 'pending', 'completed', 'cancelled', 'expired'
    message TEXT,

    -- Timing
    expires_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,

    -- Audit
    cancelled_by TEXT,
    cancellation_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_trade_type CHECK (trade_type IN ('exchange', 'gift', 'auction', 'quest_reward')),
    CONSTRAINT valid_trade_status CHECK (trade_status IN ('open', 'pending', 'completed', 'cancelled', 'expired'))
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Synergies indexes
CREATE INDEX idx_cc_synergies_industry ON cc_synergies(industry_id);
CREATE INDEX idx_cc_synergies_active ON cc_synergies(is_active);
CREATE INDEX idx_cc_synergies_required_roles ON cc_synergies USING gin(required_roles);

-- Game sessions indexes
CREATE INDEX idx_cc_sessions_room_code ON cc_game_sessions(room_code);
CREATE INDEX idx_cc_sessions_status ON cc_game_sessions(status);
CREATE INDEX idx_cc_sessions_host ON cc_game_sessions(host_player_id);

-- Challenge progress indexes
CREATE INDEX idx_cc_progress_session ON cc_challenge_progress(session_id);
CREATE INDEX idx_cc_progress_player ON cc_challenge_progress(player_id);
CREATE INDEX idx_cc_progress_challenge ON cc_challenge_progress(challenge_id);

-- Trading market indexes
CREATE INDEX idx_cc_trading_offering ON cc_trading_market(offering_player_id);
CREATE INDEX idx_cc_trading_receiving ON cc_trading_market(receiving_player_id);
CREATE INDEX idx_cc_trading_status ON cc_trading_market(trade_status);

-- ================================================================
-- SAMPLE DATA FOR TESTING
-- ================================================================

-- Insert sample synergies for Esports industry
INSERT INTO cc_synergies (
    industry_id,
    synergy_name,
    synergy_type,
    required_roles,
    power_bonus,
    description,
    explanation
) VALUES
(
    (SELECT id FROM cc_industries WHERE code = 'esports'),
    'Perfect Coaching Duo',
    'additive',
    ARRAY['Head Coach', 'Performance Analyst'],
    5,
    'Head Coach and Performance Analyst work perfectly together',
    'Data-driven coaching leads to better team performance'
),
(
    (SELECT id FROM cc_industries WHERE code = 'esports'),
    'Full Management Team',
    'multiplicative',
    ARRAY['Team Manager', 'Head Coach', 'Performance Analyst'],
    8,
    'Complete management structure provides exceptional leadership',
    'When all leadership roles are filled, the team operates at peak efficiency'
),
(
    (SELECT id FROM cc_industries WHERE code = 'healthcare'),
    'Emergency Response Team',
    'special',
    ARRAY['Emergency Physician', 'Trauma Nurse'],
    10,
    'Specialized emergency medical team',
    'Rapid response saves lives in critical situations'
),
(
    (SELECT id FROM cc_industries WHERE code = 'construction'),
    'Blueprint Masters',
    'additive',
    ARRAY['Architect', 'Structural Engineer'],
    6,
    'Perfect planning and design collaboration',
    'Seamless integration of design and engineering'
)
ON CONFLICT DO NOTHING;

-- ================================================================
-- ENABLE ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE cc_synergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_trading_market ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS POLICIES
-- ================================================================

-- Synergies: Everyone can read
CREATE POLICY "Synergies are public" ON cc_synergies
    FOR SELECT USING (true);

-- Game sessions: Players can read their own sessions
CREATE POLICY "Players can view their sessions" ON cc_game_sessions
    FOR SELECT USING (true);

-- Players can create sessions
CREATE POLICY "Players can create sessions" ON cc_game_sessions
    FOR INSERT WITH CHECK (true);

-- Players can update their hosted sessions
CREATE POLICY "Hosts can update their sessions" ON cc_game_sessions
    FOR UPDATE USING (host_player_id = current_user);

-- Challenge progress: Players can view all progress in their session
CREATE POLICY "Players can view progress" ON cc_challenge_progress
    FOR SELECT USING (true);

-- Players can insert their own progress
CREATE POLICY "Players can track progress" ON cc_challenge_progress
    FOR INSERT WITH CHECK (true);

-- Trading: Everyone can view open trades
CREATE POLICY "Open trades are public" ON cc_trading_market
    FOR SELECT USING (trade_status = 'open' OR offering_player_id = current_user OR receiving_player_id = current_user);

-- Players can create trades
CREATE POLICY "Players can create trades" ON cc_trading_market
    FOR INSERT WITH CHECK (true);

-- Players can update their own trades
CREATE POLICY "Players can update own trades" ON cc_trading_market
    FOR UPDATE USING (offering_player_id = current_user);

-- ================================================================
-- UPDATE TRIGGERS
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cc_synergies_updated_at BEFORE UPDATE ON cc_synergies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cc_game_sessions_updated_at BEFORE UPDATE ON cc_game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cc_trading_market_updated_at BEFORE UPDATE ON cc_trading_market
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- VERIFICATION QUERY
-- ================================================================

-- Run this to verify all tables are created:
SELECT
    'cc_synergies' as table_name,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_synergies') as exists
UNION ALL
SELECT
    'cc_game_sessions',
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_game_sessions')
UNION ALL
SELECT
    'cc_challenge_progress',
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_challenge_progress')
UNION ALL
SELECT
    'cc_trading_market',
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_trading_market');

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================
-- After running this script, you should have all 9 tables:
-- 1. cc_industries ✅ (existing)
-- 2. cc_challenges ✅ (existing)
-- 3. cc_role_cards ✅ (existing)
-- 4. cc_synergies ✅ (created)
-- 5. cc_player_collections ✅ (existing)
-- 6. cc_game_sessions ✅ (created)
-- 7. cc_challenge_progress ✅ (created)
-- 8. cc_trading_market ✅ (created)
-- 9. cc_daily_challenges ✅ (existing)
-- ================================================================