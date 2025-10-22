-- ================================================================
-- DIAGNOSE SPECTATOR RECORDS
-- Check for duplicates and show all spectator data
-- ================================================================

-- Show ALL spectators
SELECT
  'All spectators:' as info,
  id,
  perpetual_room_id,
  user_id,
  display_name,
  started_spectating_at
FROM cb_spectators
ORDER BY perpetual_room_id, user_id, started_spectating_at DESC;

-- Check for duplicates by (room, user)
SELECT
  'Duplicates by room+user:' as info,
  perpetual_room_id,
  user_id,
  COUNT(*) as count
FROM cb_spectators
GROUP BY perpetual_room_id, user_id
HAVING COUNT(*) > 1;

-- Check for duplicates by id (shouldn't happen - id is primary key)
SELECT
  'Duplicates by id:' as info,
  id,
  COUNT(*) as count
FROM cb_spectators
GROUP BY id
HAVING COUNT(*) > 1;

-- Show room info
SELECT
  'Room info:' as info,
  id,
  room_code,
  room_name,
  current_game_id
FROM cb_perpetual_rooms
WHERE room_code = 'GLOBAL01';
