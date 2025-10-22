-- ================================================================
-- COMPREHENSIVE RLS FIX FOR CAREER BINGO MULTIPLAYER TABLES
-- Add missing INSERT/UPDATE/DELETE policies for all users
-- ================================================================

-- ================================================================
-- cb_game_sessions - Game session records
-- ================================================================

SELECT 'cb_game_sessions policies BEFORE:' as status;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'cb_game_sessions';

-- Add INSERT policy
DROP POLICY IF EXISTS "cb_game_sessions_insert_policy" ON cb_game_sessions;
CREATE POLICY "cb_game_sessions_insert_policy" ON cb_game_sessions
  FOR INSERT
  WITH CHECK (true);

-- Add UPDATE policy
DROP POLICY IF EXISTS "cb_game_sessions_update_policy" ON cb_game_sessions;
CREATE POLICY "cb_game_sessions_update_policy" ON cb_game_sessions
  FOR UPDATE
  USING (true);

-- ================================================================
-- cb_session_participants - Players in game sessions
-- ================================================================

SELECT 'cb_session_participants policies BEFORE:' as status;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'cb_session_participants';

-- Add INSERT policy
DROP POLICY IF EXISTS "cb_session_participants_insert_policy" ON cb_session_participants;
CREATE POLICY "cb_session_participants_insert_policy" ON cb_session_participants
  FOR INSERT
  WITH CHECK (true);

-- Add DELETE policy
DROP POLICY IF EXISTS "cb_session_participants_delete_policy" ON cb_session_participants;
CREATE POLICY "cb_session_participants_delete_policy" ON cb_session_participants
  FOR DELETE
  USING (true);

-- ================================================================
-- cb_answers - Player answers to clues
-- ================================================================

SELECT 'cb_answers policies BEFORE:' as status;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'cb_answers';

-- Drop restrictive policies from migration 048
DROP POLICY IF EXISTS "cb_answers_select_policy" ON cb_answers;
DROP POLICY IF EXISTS "cb_answers_insert_policy" ON cb_answers;

-- Add open policies for multiplayer
CREATE POLICY "cb_answers_select_policy" ON cb_answers
  FOR SELECT
  USING (true);

CREATE POLICY "cb_answers_insert_policy" ON cb_answers
  FOR INSERT
  WITH CHECK (true);

-- ================================================================
-- VERIFY ALL POLICIES
-- ================================================================

SELECT 'cb_game_sessions policies AFTER:' as status;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'cb_game_sessions' ORDER BY cmd;

SELECT 'cb_session_participants policies AFTER:' as status;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'cb_session_participants' ORDER BY cmd;

SELECT 'cb_answers policies AFTER:' as status;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'cb_answers' ORDER BY cmd;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ All Career Bingo multiplayer RLS policies fixed';
  RAISE NOTICE '   - cb_game_sessions: INSERT, UPDATE, SELECT allowed';
  RAISE NOTICE '   - cb_session_participants: INSERT, UPDATE, DELETE, SELECT allowed';
  RAISE NOTICE '   - cb_answers: INSERT, SELECT allowed';
END $$;
