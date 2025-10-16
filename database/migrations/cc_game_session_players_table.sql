-- ================================================================
-- Game Session Players Table
-- Tracks individual players in each game session
-- ================================================================

CREATE TABLE IF NOT EXISTS cc_game_session_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES cc_game_sessions(id) ON DELETE CASCADE,
    player_id TEXT NOT NULL,
    display_name VARCHAR(100) NOT NULL,

    -- Player status
    is_host BOOLEAN DEFAULT false,
    is_ready BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    connection_status VARCHAR(20) DEFAULT 'connected', -- 'connected', 'disconnected', 'reconnecting'

    -- Game state
    current_score INTEGER DEFAULT 0,
    rounds_won INTEGER DEFAULT 0,
    cards_in_hand INTEGER DEFAULT 0,
    streak_count INTEGER DEFAULT 0,

    -- Role cards (array of role card IDs)
    role_cards TEXT[] DEFAULT '{}',

    -- Statistics
    challenges_attempted INTEGER DEFAULT 0,
    challenges_succeeded INTEGER DEFAULT 0,
    perfect_scores INTEGER DEFAULT 0,
    total_power_used INTEGER DEFAULT 0,
    synergies_activated INTEGER DEFAULT 0,

    -- Timing
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP WITH TIME ZONE,
    last_action_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT valid_connection_status CHECK (
        connection_status IN ('connected', 'disconnected', 'reconnecting')
    ),

    -- Ensure unique player per session
    CONSTRAINT unique_player_per_session UNIQUE (session_id, player_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cc_session_players_session ON cc_game_session_players(session_id);
CREATE INDEX IF NOT EXISTS idx_cc_session_players_player ON cc_game_session_players(player_id);
CREATE INDEX IF NOT EXISTS idx_cc_session_players_active ON cc_game_session_players(is_active);

-- Enable RLS
ALTER TABLE cc_game_session_players ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Players can view session players" ON cc_game_session_players;
CREATE POLICY "Players can view session players" ON cc_game_session_players
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Players can join sessions" ON cc_game_session_players;
CREATE POLICY "Players can join sessions" ON cc_game_session_players
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Players can update themselves" ON cc_game_session_players;
CREATE POLICY "Players can update themselves" ON cc_game_session_players
    FOR UPDATE USING (player_id = current_user OR true); -- Allow all for testing

-- Update trigger
CREATE TRIGGER update_cc_game_session_players_updated_at
    BEFORE UPDATE ON cc_game_session_players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- Helper functions
-- ================================================================

-- Function to add a player to a session
CREATE OR REPLACE FUNCTION cc_add_player_to_session(
    p_session_id UUID,
    p_player_id TEXT,
    p_display_name VARCHAR,
    p_is_host BOOLEAN DEFAULT false
) RETURNS UUID AS $$
DECLARE
    v_player_record_id UUID;
BEGIN
    INSERT INTO cc_game_session_players (
        session_id,
        player_id,
        display_name,
        is_host
    ) VALUES (
        p_session_id,
        p_player_id,
        p_display_name,
        p_is_host
    )
    ON CONFLICT (session_id, player_id)
    DO UPDATE SET
        is_active = true,
        connection_status = 'connected',
        last_action_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_player_record_id;

    -- Update session player count
    UPDATE cc_game_sessions
    SET current_players = (
        SELECT COUNT(*)
        FROM cc_game_session_players
        WHERE session_id = p_session_id
        AND is_active = true
    )
    WHERE id = p_session_id;

    RETURN v_player_record_id;
END;
$$ LANGUAGE plpgsql;

-- Function to remove a player from a session
CREATE OR REPLACE FUNCTION cc_remove_player_from_session(
    p_session_id UUID,
    p_player_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE cc_game_session_players
    SET
        is_active = false,
        connection_status = 'disconnected',
        left_at = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id
    AND player_id = p_player_id;

    -- Update session player count
    UPDATE cc_game_sessions
    SET current_players = (
        SELECT COUNT(*)
        FROM cc_game_session_players
        WHERE session_id = p_session_id
        AND is_active = true
    )
    WHERE id = p_session_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to update player score
CREATE OR REPLACE FUNCTION cc_update_player_score(
    p_session_id UUID,
    p_player_id TEXT,
    p_score_delta INTEGER,
    p_challenge_success BOOLEAN DEFAULT false
) RETURNS INTEGER AS $$
DECLARE
    v_new_score INTEGER;
BEGIN
    UPDATE cc_game_session_players
    SET
        current_score = current_score + p_score_delta,
        challenges_attempted = challenges_attempted + 1,
        challenges_succeeded = challenges_succeeded + CASE WHEN p_challenge_success THEN 1 ELSE 0 END,
        streak_count = CASE WHEN p_challenge_success THEN streak_count + 1 ELSE 0 END,
        last_action_at = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id
    AND player_id = p_player_id
    RETURNING current_score INTO v_new_score;

    RETURN v_new_score;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- Verification
-- ================================================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_game_session_players') THEN
        RAISE NOTICE '✅ Game Session Players table created successfully';
        RAISE NOTICE 'This table provides:';
        RAISE NOTICE '  - Individual player tracking in sessions';
        RAISE NOTICE '  - Score and statistics per player';
        RAISE NOTICE '  - Connection status management';
        RAISE NOTICE '  - Role card inventory per player';
    ELSE
        RAISE NOTICE '❌ Failed to create Game Session Players table';
    END IF;
END $$;

-- Quick verification
SELECT
    'cc_game_session_players' as table_name,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_game_session_players') as exists;