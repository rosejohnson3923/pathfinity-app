-- ================================================================
-- FIX cb_game_sessions SELECT POLICY
-- Change from {authenticated} to {public} for mock auth support
-- ================================================================

-- Drop and recreate SELECT policy for public access
DROP POLICY IF EXISTS "cb_game_sessions_select_policy" ON cb_game_sessions;

CREATE POLICY "cb_game_sessions_select_policy" ON cb_game_sessions
  FOR SELECT
  USING (true);

-- Verify
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'cb_game_sessions'
  AND cmd = 'SELECT';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ cb_game_sessions SELECT policy now allows all users (public)';
END $$;
