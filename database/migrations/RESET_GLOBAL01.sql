-- ================================================================
-- RESET GLOBAL01 Room - Run this before each test
-- ================================================================

-- 1. Delete all click events for GLOBAL01 sessions
DELETE FROM dl_click_events
WHERE game_session_id IN (
  SELECT id FROM dl_game_sessions
  WHERE perpetual_room_id IN (
    SELECT id FROM dl_perpetual_rooms WHERE room_code = 'GLOBAL01'
  )
);

-- 2. Delete all session participants
DELETE FROM dl_session_participants
WHERE perpetual_room_id IN (
  SELECT id FROM dl_perpetual_rooms WHERE room_code = 'GLOBAL01'
);

-- 3. Delete all game sessions
DELETE FROM dl_game_sessions
WHERE perpetual_room_id IN (
  SELECT id FROM dl_perpetual_rooms WHERE room_code = 'GLOBAL01'
);

-- 4. Delete all spectators
DELETE FROM dl_spectators
WHERE perpetual_room_id IN (
  SELECT id FROM dl_perpetual_rooms WHERE room_code = 'GLOBAL01'
);

-- 5. Reset the room to clean state
UPDATE dl_perpetual_rooms
SET
  status = 'intermission',
  current_game_id = NULL,
  current_game_number = 0,
  current_player_count = 0,
  spectator_count = 0,
  next_game_starts_at = NULL
WHERE room_code = 'GLOBAL01';

-- ================================================================
-- RESET COMPLETE - Ready for testing
-- ================================================================
SELECT 'GLOBAL01 room reset successfully!' as message;
