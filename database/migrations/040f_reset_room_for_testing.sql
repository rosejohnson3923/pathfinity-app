-- ================================================================
-- Reset GLOBAL01 room for testing
-- Migration 040f: Clean up stuck state
-- ================================================================

-- Clear all spectators
DELETE FROM dl_spectators WHERE perpetual_room_id IN (
  SELECT id FROM dl_perpetual_rooms WHERE room_code = 'GLOBAL01'
);

-- Reset GLOBAL01 room to clean state
UPDATE dl_perpetual_rooms
SET
  status = 'intermission',
  current_game_id = NULL,
  current_player_count = 0,
  spectator_count = 0,
  next_game_starts_at = NULL
WHERE room_code = 'GLOBAL01';

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
