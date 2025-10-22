-- ================================================================
-- CHECK PARTICIPANTS IN CURRENT GAME SESSION
-- ================================================================

-- Get current game session ID
SELECT
  'Current game info:' as info,
  id as session_id,
  game_number,
  status,
  total_participants,
  human_participants,
  ai_participants
FROM cb_game_sessions
WHERE perpetual_room_id = (SELECT id FROM cb_perpetual_rooms WHERE room_code = 'GLOBAL01')
  AND status = 'active'
ORDER BY game_number DESC
LIMIT 1;

-- Get participants in current session
SELECT
  'Session participants:' as info,
  id,
  participant_type,
  user_id,
  display_name,
  total_xp,
  correct_answers,
  bingos_won
FROM cb_session_participants
WHERE game_session_id = (
  SELECT id FROM cb_game_sessions
  WHERE perpetual_room_id = (SELECT id FROM cb_perpetual_rooms WHERE room_code = 'GLOBAL01')
    AND status = 'active'
  ORDER BY game_number DESC
  LIMIT 1
);
