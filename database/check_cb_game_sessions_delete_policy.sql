-- ================================================================
-- CHECK cb_game_sessions DELETE POLICY
-- ================================================================

SELECT
  'cb_game_sessions policies:' as info,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'cb_game_sessions'
ORDER BY cmd;
