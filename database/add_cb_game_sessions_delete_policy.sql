-- ================================================================
-- ADD DELETE POLICY FOR cb_game_sessions
-- Allows cleanup of orphaned sessions
-- ================================================================

-- Show current policies
SELECT 'cb_game_sessions policies BEFORE:' as status;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'cb_game_sessions' ORDER BY cmd;

-- Add DELETE policy
CREATE POLICY "cb_game_sessions_delete_policy" ON cb_game_sessions
  FOR DELETE
  USING (true);

-- Verify
SELECT 'cb_game_sessions policies AFTER:' as status;
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'cb_game_sessions' ORDER BY cmd;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ cb_game_sessions DELETE policy created - allows cleanup of orphaned sessions';
END $$;
