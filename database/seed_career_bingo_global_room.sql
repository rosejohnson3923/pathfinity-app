-- ================================================================
-- SEED CAREER BINGO GLOBAL ROOM
-- Creates GLOBAL01 room in cb_perpetual_rooms table
-- ================================================================

-- Insert GLOBAL01 room if it doesn't exist
INSERT INTO cb_perpetual_rooms (
  room_code,
  room_name,
  theme_code,
  max_players_per_game,
  bingo_slots_per_game,
  question_time_limit_seconds,
  questions_per_game,
  grade_level,
  is_featured,
  ai_fill_enabled,
  ai_difficulty_mix,
  status
) VALUES (
  'GLOBAL01',
  'All Careers - Room 1',
  'global',
  6,    -- 6 players (1 human + 5 AI)
  3,    -- 3 bingo slots available
  8,    -- 8 seconds per question
  20,   -- 20 questions per game
  'elementary',
  true,
  true,
  'mixed',
  'active'
)
ON CONFLICT (room_code) DO UPDATE SET
  room_name = EXCLUDED.room_name,
  max_players_per_game = EXCLUDED.max_players_per_game,
  bingo_slots_per_game = EXCLUDED.bingo_slots_per_game,
  question_time_limit_seconds = EXCLUDED.question_time_limit_seconds,
  questions_per_game = EXCLUDED.questions_per_game,
  is_active = true,
  updated_at = NOW();

-- Verify the room was created
SELECT
  room_code,
  room_name,
  status,
  max_players_per_game,
  bingo_slots_per_game,
  is_active
FROM cb_perpetual_rooms
WHERE room_code = 'GLOBAL01';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ GLOBAL01 room created/updated successfully in cb_perpetual_rooms';
END $$;
