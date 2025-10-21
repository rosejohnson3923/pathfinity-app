-- ================================================================
-- ADD ROOM_ID TO cc_game_session_players
-- Migration 043: Support room-based queries on session players
-- ================================================================
-- This migration adds room_id column to cc_game_session_players
-- to enable efficient querying of players by room without joining
-- through the sessions table.
-- ================================================================

-- Add room_id column to cc_game_session_players
ALTER TABLE cc_game_session_players
ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES cc_company_rooms(id) ON DELETE CASCADE;

-- Create index for room_id lookups
CREATE INDEX IF NOT EXISTS idx_cc_session_players_room ON cc_game_session_players(room_id);

-- Backfill room_id from cc_executive_sessions for existing records
UPDATE cc_game_session_players gsp
SET room_id = es.room_id
FROM cc_executive_sessions es
WHERE gsp.session_id = es.id
  AND gsp.room_id IS NULL;

-- Add comment explaining the column
COMMENT ON COLUMN cc_game_session_players.room_id IS
'Denormalized room_id for efficient querying. Should match the room_id of the associated session.';

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
-- cc_game_session_players now has room_id column
-- Existing data has been backfilled
-- ================================================================
