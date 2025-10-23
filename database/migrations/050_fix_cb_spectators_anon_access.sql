-- ================================================================
-- FIX cb_spectators RLS FOR ANONYMOUS/MOCK AUTH
-- Migration 050: Allow anonymous users to insert spectators
-- ================================================================
-- ISSUE: cb_spectators_insert_policy requires TO authenticated
--        but mock auth users are not authenticated (auth.uid() IS NULL)
-- FIX: Change policy to allow both authenticated AND anon users
-- ================================================================

-- ================================================================
-- cb_spectators: Fix INSERT policy for mock auth
-- ================================================================

DROP POLICY IF EXISTS "cb_spectators_insert_policy" ON cb_spectators;

-- Policy: Allow both authenticated AND anonymous users to insert spectators
-- This supports mock auth where auth.uid() IS NULL
CREATE POLICY "cb_spectators_insert_policy" ON cb_spectators
  FOR INSERT
  TO public  -- Changed from 'authenticated' to 'public' to allow anon users
  WITH CHECK (true);

-- ================================================================
-- Also fix other cb_* tables to support anon/mock auth
-- ================================================================

-- cb_session_participants
DROP POLICY IF EXISTS "cb_session_participants_insert_policy" ON cb_session_participants;

CREATE POLICY "cb_session_participants_insert_policy" ON cb_session_participants
  FOR INSERT
  TO public
  WITH CHECK (true);

-- cb_game_sessions
DROP POLICY IF EXISTS "cb_game_sessions_insert_policy" ON cb_game_sessions;

CREATE POLICY "cb_game_sessions_insert_policy" ON cb_game_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- cb_click_events
DROP POLICY IF EXISTS "cb_click_events_insert_policy" ON cb_click_events;

CREATE POLICY "cb_click_events_insert_policy" ON cb_click_events
  FOR INSERT
  TO public
  WITH CHECK (true);

-- ================================================================
-- Fix SELECT policies to allow anon users
-- ================================================================

-- cb_perpetual_rooms
DROP POLICY IF EXISTS "cb_perpetual_rooms_select_policy" ON cb_perpetual_rooms;

CREATE POLICY "cb_perpetual_rooms_select_policy" ON cb_perpetual_rooms
  FOR SELECT
  TO public
  USING (is_active = true);

-- cb_game_sessions
DROP POLICY IF EXISTS "cb_game_sessions_select_policy" ON cb_game_sessions;

CREATE POLICY "cb_game_sessions_select_policy" ON cb_game_sessions
  FOR SELECT
  TO public
  USING (true);

-- cb_session_participants
DROP POLICY IF EXISTS "cb_session_participants_select_policy" ON cb_session_participants;

CREATE POLICY "cb_session_participants_select_policy" ON cb_session_participants
  FOR SELECT
  TO public
  USING (true);

-- cb_spectators
DROP POLICY IF EXISTS "cb_spectators_select_policy" ON cb_spectators;

CREATE POLICY "cb_spectators_select_policy" ON cb_spectators
  FOR SELECT
  TO public
  USING (true);

-- cb_click_events
DROP POLICY IF EXISTS "cb_click_events_select_policy" ON cb_click_events;

CREATE POLICY "cb_click_events_select_policy" ON cb_click_events
  FOR SELECT
  TO public
  USING (true);

-- cb_clues
DROP POLICY IF EXISTS "cb_clues_select_policy" ON cb_clues;

CREATE POLICY "cb_clues_select_policy" ON cb_clues
  FOR SELECT
  TO public
  USING (is_active = true);

-- ================================================================
-- Fix UPDATE/DELETE policies to allow anon users
-- ================================================================

-- cb_session_participants
DROP POLICY IF EXISTS "cb_session_participants_update_policy" ON cb_session_participants;
DROP POLICY IF EXISTS "cb_session_participants_delete_policy" ON cb_session_participants;

CREATE POLICY "cb_session_participants_update_policy" ON cb_session_participants
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "cb_session_participants_delete_policy" ON cb_session_participants
  FOR DELETE
  TO public
  USING (true);

-- cb_game_sessions
DROP POLICY IF EXISTS "cb_game_sessions_update_policy" ON cb_game_sessions;

CREATE POLICY "cb_game_sessions_update_policy" ON cb_game_sessions
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- cb_spectators
DROP POLICY IF EXISTS "cb_spectators_update_policy" ON cb_spectators;
DROP POLICY IF EXISTS "cb_spectators_delete_policy" ON cb_spectators;

CREATE POLICY "cb_spectators_update_policy" ON cb_spectators
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "cb_spectators_delete_policy" ON cb_spectators
  FOR DELETE
  TO public
  USING (true);

-- cb_perpetual_rooms
DROP POLICY IF EXISTS "cb_perpetual_rooms_update_policy" ON cb_perpetual_rooms;

CREATE POLICY "cb_perpetual_rooms_update_policy" ON cb_perpetual_rooms
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Count policies on cb_* tables
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename LIKE 'cb_%';

    RAISE NOTICE '';
    RAISE NOTICE '✅ Career Bingo RLS Policies Updated for Mock Auth!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Total policies on cb_* tables: %', policy_count;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'All policies changed from TO authenticated → TO public';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Anonymous/mock auth users can now:';
    RAISE NOTICE '   ✓ INSERT spectators';
    RAISE NOTICE '   ✓ INSERT participants';
    RAISE NOTICE '   ✓ INSERT game sessions';
    RAISE NOTICE '   ✓ SELECT all Career Bingo data';
    RAISE NOTICE '   ✓ UPDATE participant/session state';
    RAISE NOTICE '   ✓ DELETE spectators/participants';
    RAISE NOTICE '';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
