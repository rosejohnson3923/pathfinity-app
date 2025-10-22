-- ================================================================
-- FIX cb_spectators UPDATE POLICY FOR MOCK AUTH
-- Allow updates when auth.uid() is NULL (mock auth users)
-- ================================================================

-- Show current UPDATE policy
SELECT 'UPDATE policy BEFORE:' as status;
SELECT
  policyname,
  cmd,
  qual::text as using_clause,
  with_check::text
FROM pg_policies
WHERE tablename = 'cb_spectators'
  AND cmd = 'UPDATE';

-- Drop and recreate UPDATE policy to allow mock auth
DROP POLICY IF EXISTS "cb_spectators_update_policy" ON cb_spectators;

-- New policy: Allow updates for authenticated users OR when auth is NULL (mock auth)
CREATE POLICY "cb_spectators_update_policy" ON cb_spectators
  FOR UPDATE
  USING (user_id = auth.uid() OR auth.uid() IS NULL);

-- Also fix DELETE policy for consistency
DROP POLICY IF EXISTS "cb_spectators_delete_policy" ON cb_spectators;

CREATE POLICY "cb_spectators_delete_policy" ON cb_spectators
  FOR DELETE
  USING (user_id = auth.uid() OR auth.uid() IS NULL);

-- Verify
SELECT 'UPDATE policy AFTER:' as status;
SELECT
  policyname,
  cmd,
  qual::text as using_clause,
  with_check::text
FROM pg_policies
WHERE tablename = 'cb_spectators'
  AND cmd IN ('UPDATE', 'DELETE');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ cb_spectators UPDATE and DELETE policies now allow mock auth users (auth.uid() IS NULL)';
END $$;
