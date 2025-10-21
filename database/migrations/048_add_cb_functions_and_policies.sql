-- ================================================================
-- ADD FUNCTIONS, TRIGGERS, AND POLICIES FOR CAREER BINGO (cb_*)
-- Migration 048: Recreate database functions and RLS for cb_* tables
-- ================================================================
-- This migration creates cb_* versions of all functions, triggers, and RLS policies
-- that existed for dl_* tables
-- ================================================================

-- ================================================================
-- FUNCTION 1: Update game total_xp automatically
-- ================================================================
CREATE OR REPLACE FUNCTION update_cb_game_total_xp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_xp := NEW.base_xp_earned + NEW.bingo_bonus_xp + NEW.streak_bonus_xp;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate total XP
CREATE TRIGGER trigger_update_cb_game_total_xp
  BEFORE INSERT OR UPDATE OF base_xp_earned, bingo_bonus_xp, streak_bonus_xp
  ON cb_games
  FOR EACH ROW
  EXECUTE FUNCTION update_cb_game_total_xp();

-- ================================================================
-- FUNCTION 2: Update clue analytics when shown/answered
-- ================================================================
CREATE OR REPLACE FUNCTION update_cb_clue_analytics()
RETURNS TRIGGER AS $$
DECLARE
  current_times_shown INTEGER;
BEGIN
  -- Get current times_shown value
  SELECT times_shown INTO current_times_shown
  FROM cb_clues
  WHERE id = NEW.clue_id;

  -- Update times_shown
  UPDATE cb_clues
  SET
    times_shown = times_shown + 1,
    updated_at = NOW()
  WHERE id = NEW.clue_id;

  -- If correct, update times_correct
  IF NEW.is_correct THEN
    UPDATE cb_clues
    SET times_correct = times_correct + 1
    WHERE id = NEW.clue_id;
  END IF;

  -- Update avg_response_time
  IF NEW.response_time_seconds IS NOT NULL THEN
    UPDATE cb_clues
    SET avg_response_time_seconds = (
      COALESCE(avg_response_time_seconds * current_times_shown, 0) + NEW.response_time_seconds
    ) / (current_times_shown + 1)
    WHERE id = NEW.clue_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics
CREATE TRIGGER trigger_update_cb_clue_analytics
  AFTER INSERT ON cb_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_cb_clue_analytics();

-- ================================================================
-- FUNCTION 3: Get student's play count (for difficulty scaling)
-- ================================================================
CREATE OR REPLACE FUNCTION get_student_cb_play_count(p_student_id UUID)
RETURNS INTEGER AS $$
DECLARE
  play_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO play_count
  FROM cb_games
  WHERE student_id = p_student_id
    AND status = 'completed';

  RETURN COALESCE(play_count, 0);
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- ROW LEVEL SECURITY (RLS) - Enable on all tables
-- ================================================================

ALTER TABLE cb_clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE cb_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE cb_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cb_perpetual_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE cb_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cb_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE cb_spectators ENABLE ROW LEVEL SECURITY;
ALTER TABLE cb_click_events ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS POLICIES - Single Player Tables
-- ================================================================

-- Policy: cb_clues are readable by all authenticated users
CREATE POLICY "cb_clues_select_policy" ON cb_clues
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Students can only view their own games
CREATE POLICY "cb_games_select_policy" ON cb_games
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Policy: Students can insert their own games
CREATE POLICY "cb_games_insert_policy" ON cb_games
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Policy: Students can update their own games
CREATE POLICY "cb_games_update_policy" ON cb_games
  FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid());

-- Policy: Students can view answers from their own games
CREATE POLICY "cb_answers_select_policy" ON cb_answers
  FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT id FROM cb_games WHERE student_id = auth.uid()
    )
  );

-- Policy: Students can insert answers to their own games
CREATE POLICY "cb_answers_insert_policy" ON cb_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    game_id IN (
      SELECT id FROM cb_games WHERE student_id = auth.uid()
    )
  );

-- ================================================================
-- RLS POLICIES - Multiplayer Tables
-- ================================================================

-- Policy: Perpetual rooms are viewable by all authenticated users
CREATE POLICY "cb_perpetual_rooms_select_policy" ON cb_perpetual_rooms
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Game sessions are viewable by all authenticated users
CREATE POLICY "cb_game_sessions_select_policy" ON cb_game_sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Session participants viewable by all authenticated users
CREATE POLICY "cb_session_participants_select_policy" ON cb_session_participants
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can update their own participant record
CREATE POLICY "cb_session_participants_update_policy" ON cb_session_participants
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL); -- Allow NULL for AI players

-- Policy: Spectators viewable by all authenticated users
CREATE POLICY "cb_spectators_select_policy" ON cb_spectators
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can insert themselves as spectators
CREATE POLICY "cb_spectators_insert_policy" ON cb_spectators
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own spectator record
CREATE POLICY "cb_spectators_update_policy" ON cb_spectators
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can delete their own spectator record
CREATE POLICY "cb_spectators_delete_policy" ON cb_spectators
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Click events viewable by all authenticated users
CREATE POLICY "cb_click_events_select_policy" ON cb_click_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can insert their own click events
CREATE POLICY "cb_click_events_insert_policy" ON cb_click_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    participant_id IN (
      SELECT id FROM cb_session_participants WHERE user_id = auth.uid()
    )
  );

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
DECLARE
    function_count INTEGER;
    trigger_count INTEGER;
    policy_count INTEGER;
BEGIN
    -- Count functions
    SELECT COUNT(*) INTO function_count
    FROM pg_proc
    WHERE proname LIKE '%cb_%';

    -- Count triggers
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger
    WHERE tgname LIKE '%cb_%';

    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename LIKE 'cb_%';

    RAISE NOTICE '';
    RAISE NOTICE '✅ Career Bingo Functions, Triggers & Policies Created!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Functions: %', function_count;
    RAISE NOTICE '   Triggers: %', trigger_count;
    RAISE NOTICE '   RLS Policies: %', policy_count;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Functions Created:';
    RAISE NOTICE '   ✓ update_cb_game_total_xp()';
    RAISE NOTICE '   ✓ update_cb_clue_analytics()';
    RAISE NOTICE '   ✓ get_student_cb_play_count()';
    RAISE NOTICE '';
    RAISE NOTICE 'Triggers Created:';
    RAISE NOTICE '   ✓ trigger_update_cb_game_total_xp (on cb_games)';
    RAISE NOTICE '   ✓ trigger_update_cb_clue_analytics (on cb_answers)';
    RAISE NOTICE '';
    RAISE NOTICE 'RLS Enabled on all cb_* tables';
    RAISE NOTICE '';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
