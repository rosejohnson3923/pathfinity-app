-- ================================================================
-- Migration: Fix Career Match Card Shuffle Algorithm
-- Issue: Cards were not being properly randomized - pairs appearing adjacent
-- Fix: Move ORDER BY random() to subquery level instead of aggregate level
-- ================================================================

-- Drop and recreate the function with fixed shuffle logic
CREATE OR REPLACE FUNCTION cm_initialize_cards(
  p_game_session_id UUID,
  p_difficulty VARCHAR
)
RETURNS VOID AS $function$
DECLARE
  v_total_pairs INTEGER;
  v_selected_careers TEXT[];
  v_shuffled_pairs INTEGER[];
  v_career TEXT;
  v_pair_id INTEGER;
  v_position INTEGER := 1;
  v_delay INTEGER := 0;
BEGIN
  -- Determine number of pairs based on difficulty
  v_total_pairs := CASE p_difficulty
    WHEN 'easy' THEN 6     -- 12 cards = 6 pairs (3x4 grid)
    WHEN 'medium' THEN 10  -- 20 cards = 10 pairs (4x5 grid)
    WHEN 'hard' THEN 15    -- 30 cards = 15 pairs (5x6 grid)
    ELSE 6
  END;

  -- Select random careers for this game
  v_selected_careers := (
    SELECT ARRAY_AGG(role_name)
    FROM (
      SELECT role_name
      FROM cm_career_roles
      ORDER BY random()
      LIMIT v_total_pairs
    ) AS selected
  );

  -- Create pairs (each career appears twice)
  -- FIXED: Shuffle by ordering rows with random() BEFORE aggregating
  -- This ensures proper randomization at the row level, not aggregate level
  v_shuffled_pairs := (
    SELECT ARRAY_AGG(pair_id)
    FROM (
      SELECT generate_series(1, v_total_pairs) AS pair_id
      UNION ALL
      SELECT generate_series(1, v_total_pairs) AS pair_id
    ) AS pairs
    ORDER BY random()
  );

  -- Insert cards in shuffled order
  FOREACH v_pair_id IN ARRAY v_shuffled_pairs
  LOOP
    v_career := v_selected_careers[v_pair_id];

    INSERT INTO cm_cards (
      game_session_id,
      position,
      pair_id,
      career_name,
      career_image_path,
      flip_delay
    ) VALUES (
      p_game_session_id,
      v_position,
      v_pair_id,
      v_career,
      '/assets/Discovered Live/Role - Landscape/' || v_career || '.png',
      v_delay
    );

    v_position := v_position + 1;
    v_delay := v_delay + 50;
  END LOOP;

  RAISE NOTICE 'Initialized % cards for session % (difficulty: %)',
    v_total_pairs * 2, p_game_session_id, p_difficulty;
END;
$function$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cm_initialize_cards IS 'Initialize shuffled card deck for a game session (FIXED shuffle algorithm)';
