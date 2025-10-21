-- ================================================================
-- FIX SESSION PLAYERS FOREIGN KEY CONSTRAINT
-- Migration 044: Allow cc_game_session_players to work with both game types
-- ================================================================
-- This migration removes the strict foreign key constraint to cc_game_sessions
-- and allows session_id to reference either cc_game_sessions or cc_executive_sessions
-- ================================================================

-- First, check if cc_executive_sessions table exists, if not create it
CREATE TABLE IF NOT EXISTS cc_executive_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES cc_company_rooms(id) ON DELETE CASCADE,
    player_id TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'in_progress',

    -- Scenario and selection
    scenario_id UUID,
    selected_executive VARCHAR(50),
    selected_solutions TEXT[],

    -- Scoring
    total_score INTEGER DEFAULT 0,
    six_cs_scores JSONB,
    time_spent_seconds INTEGER DEFAULT 0,

    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Constraint for status
    CONSTRAINT cc_executive_sessions_status_check
    CHECK (status IN ('lobby', 'in_progress', 'completed', 'abandoned'))
);

-- Create indexes for cc_executive_sessions
CREATE INDEX IF NOT EXISTS idx_cc_executive_sessions_room ON cc_executive_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_cc_executive_sessions_player ON cc_executive_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_cc_executive_sessions_status ON cc_executive_sessions(status);

-- Now drop the existing foreign key constraint on cc_game_session_players
ALTER TABLE cc_game_session_players
DROP CONSTRAINT IF EXISTS cc_game_session_players_session_id_fkey;

-- Make session_id nullable to allow flexibility
ALTER TABLE cc_game_session_players
ALTER COLUMN session_id DROP NOT NULL;

-- Add a check constraint to ensure session_id exists in at least one of the tables
-- (This is enforced at application level since PostgreSQL doesn't support multi-table FK)
COMMENT ON COLUMN cc_game_session_players.session_id IS
'Session ID - can reference either cc_game_sessions.id (Career Bingo) or cc_executive_sessions.id (Executive Decision). Application must ensure referential integrity.';

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
-- cc_game_session_players.session_id can now reference either table
-- Application code is responsible for maintaining referential integrity
-- ================================================================
