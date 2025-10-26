-- ================================================================
-- Simple Fix: Update cm_initialize_cards to use cm_career_roles table
-- This fixes the card shuffle to work with the career roles table
-- Run this directly in Supabase SQL Editor
-- ================================================================

DROP FUNCTION IF EXISTS cm_initialize_cards(UUID, VARCHAR);

CREATE FUNCTION cm_initialize_cards(
  p_game_session_id UUID,
  p_difficulty VARCHAR
)
RETURNS VOID
LANGUAGE plpgsql
AS
$$
DECLARE
  v_total_pairs INTEGER;
  v_selected_careers TEXT[];
  v_shuffled_pairs INTEGER[];
  v_career TEXT;
  v_pair_id INTEGER;
  v_position INTEGER := 1;
  v_delay INTEGER := 0;
BEGIN
  v_total_pairs := CASE p_difficulty
    WHEN 'easy' THEN 6
    WHEN 'medium' THEN 10
    WHEN 'hard' THEN 15
    ELSE 6
  END;

  v_selected_careers := (
    SELECT ARRAY_AGG(career_name)
    FROM (
      SELECT career_name
      FROM cm_career_roles
      WHERE is_active = true
      ORDER BY random()
      LIMIT v_total_pairs
    ) AS selected
  );

  v_shuffled_pairs := (
    SELECT ARRAY_AGG(pair_id)
    FROM (
      SELECT generate_series(1, v_total_pairs) AS pair_id
      UNION ALL
      SELECT generate_series(1, v_total_pairs) AS pair_id
    ) AS pairs
    ORDER BY random()
  );

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

  RAISE NOTICE 'Initialized % cards for session %', v_total_pairs * 2, p_game_session_id;
END;
$$;

COMMENT ON FUNCTION cm_initialize_cards IS 'Initialize shuffled card deck using cm_career_roles table';
