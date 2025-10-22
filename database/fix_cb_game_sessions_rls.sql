-- ================================================================
-- ADD MISSING RLS POLICIES FOR cb_game_sessions
-- Allow INSERT and UPDATE for all users (including mock auth)
-- ================================================================

-- Show current policies
SELECT 'cb_game_sessions policies BEFORE:' as status;
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'cb_game_sessions';

-- Add INSERT policy - allow anyone to create game sessions
CREATE POLICY "cb_game_sessions_insert_policy" ON cb_game_sessions
  FOR INSERT
  WITH CHECK (true);

-- Add UPDATE policy - allow anyone to update game sessions
CREATE POLICY "cb_game_sessions_update_policy" ON cb_game_sessions
  FOR UPDATE
  USING (true);

-- Verify
SELECT 'cb_game_sessions policies AFTER:' as status;
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'cb_game_sessions'
ORDER BY cmd;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ cb_game_sessions INSERT and UPDATE policies created - allows all users';
END $$;
