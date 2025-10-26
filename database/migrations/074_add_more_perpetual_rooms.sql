-- ================================================================
-- MIGRATION 074: Add More Perpetual Rooms
-- ================================================================
-- Add 2 additional rooms for each difficulty level
-- Current: 2 rooms per difficulty (6 total)
-- After: 4 rooms per difficulty (12 total)
-- ================================================================

-- Add more Easy rooms
INSERT INTO cm_perpetual_rooms (
  room_code,
  room_name,
  difficulty,
  max_players_per_game,
  total_pairs,
  grid_rows,
  grid_cols,
  turn_time_limit_seconds,
  match_xp,
  streak_bonus_xp,
  is_featured,
  ai_fill_enabled,
  ai_difficulty_mix
) VALUES
  -- Easy difficulty rooms (additional)
  (
    'MATCH07',
    'Career Match - Easy Room 3',
    'easy',
    6,
    6,   -- 6 pairs = 12 cards
    3,   -- 3 rows
    4,   -- 4 columns
    30,
    100,
    50,
    true,
    true,
    'mixed'
  ),
  (
    'MATCH08',
    'Career Match - Easy Room 4',
    'easy',
    6,
    6,
    3,
    4,
    30,
    100,
    50,
    true,
    true,
    'mixed'
  ),
  -- Medium difficulty rooms (additional)
  (
    'MATCH09',
    'Career Match - Medium Room 3',
    'medium',
    6,
    10,  -- 10 pairs = 20 cards
    4,   -- 4 rows
    5,   -- 5 columns
    30,
    100,
    50,
    true,
    true,
    'mixed'
  ),
  (
    'MATCH10',
    'Career Match - Medium Room 4',
    'medium',
    6,
    10,
    4,
    5,
    30,
    100,
    50,
    true,
    true,
    'mixed'
  ),
  -- Hard difficulty rooms (additional)
  (
    'MATCH11',
    'Career Match - Hard Room 3',
    'hard',
    6,
    15,  -- 15 pairs = 30 cards
    5,   -- 5 rows
    6,   -- 6 columns
    45,
    100,
    50,
    true,
    true,
    'mixed'
  ),
  (
    'MATCH12',
    'Career Match - Hard Room 4',
    'hard',
    6,
    15,
    5,
    6,
    45,
    100,
    50,
    true,
    true,
    'mixed'
  )
ON CONFLICT (room_code) DO NOTHING;

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
DECLARE
    room_count INTEGER;
    easy_rooms INTEGER;
    medium_rooms INTEGER;
    hard_rooms INTEGER;
BEGIN
    -- Count rooms by difficulty
    SELECT COUNT(*) INTO room_count FROM cm_perpetual_rooms;
    SELECT COUNT(*) INTO easy_rooms FROM cm_perpetual_rooms WHERE difficulty = 'easy';
    SELECT COUNT(*) INTO medium_rooms FROM cm_perpetual_rooms WHERE difficulty = 'medium';
    SELECT COUNT(*) INTO hard_rooms FROM cm_perpetual_rooms WHERE difficulty = 'hard';

    RAISE NOTICE '';
    RAISE NOTICE '✅ Migration 074: Added More Perpetual Rooms';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Total Rooms: %', room_count;
    RAISE NOTICE '   Easy Rooms: % (6 pairs, 3×4 grid)', easy_rooms;
    RAISE NOTICE '   Medium Rooms: % (10 pairs, 4×5 grid)', medium_rooms;
    RAISE NOTICE '   Hard Rooms: % (15 pairs, 5×6 grid)', hard_rooms;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
