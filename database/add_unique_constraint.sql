-- ================================================================
-- ADD UNIQUE INDEX TO PREVENT DUPLICATE PLAYERS
-- ================================================================

-- Drop old constraint if it exists
ALTER TABLE dd_game_session_players
DROP CONSTRAINT IF EXISTS unique_player_per_room_active;

-- Create partial unique index (only for active players)
DROP INDEX IF EXISTS idx_unique_player_per_room_active;

CREATE UNIQUE INDEX idx_unique_player_per_room_active
ON dd_game_session_players (room_id, player_id)
WHERE is_active = true;

-- Verify it was created
SELECT
    'INDEX CREATED' as status,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'dd_game_session_players'
    AND indexname = 'idx_unique_player_per_room_active';
