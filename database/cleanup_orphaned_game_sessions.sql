-- ================================================================
-- CLEANUP ORPHANED GAME SESSIONS FOR GLOBAL01
-- Delete game sessions that were created but never completed
-- ================================================================

-- Check current room state
SELECT
  'GLOBAL01 current state:' as info,
  room_code,
  current_game_number,
  current_game_id,
  status
FROM cb_perpetual_rooms
WHERE room_code = 'GLOBAL01';

-- Check for orphaned sessions (game_number > current_game_number)
SELECT
  'Orphaned game sessions:' as info,
  id,
  game_number,
  status,
  started_at,
  completed_at
FROM cb_game_sessions
WHERE perpetual_room_id = (SELECT id FROM cb_perpetual_rooms WHERE room_code = 'GLOBAL01')
  AND game_number > (SELECT current_game_number FROM cb_perpetual_rooms WHERE room_code = 'GLOBAL01')
ORDER BY game_number;

-- Delete orphaned sessions
DELETE FROM cb_game_sessions
WHERE perpetual_room_id = (SELECT id FROM cb_perpetual_rooms WHERE room_code = 'GLOBAL01')
  AND game_number > (SELECT current_game_number FROM cb_perpetual_rooms WHERE room_code = 'GLOBAL01');

-- Verify cleanup
SELECT
  'Remaining game sessions:' as info,
  COUNT(*) as total_sessions
FROM cb_game_sessions
WHERE perpetual_room_id = (SELECT id FROM cb_perpetual_rooms WHERE room_code = 'GLOBAL01');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Orphaned game sessions cleaned up for GLOBAL01';
END $$;
