-- ================================================================
-- FIX cb_spectators INSERT POLICY FOR MOCK AUTH
-- Allow INSERT when auth.uid() is NULL (mock auth users)
-- ================================================================

-- Show current policy
SELECT 'cb_spectators INSERT policy BEFORE:' as status;
SELECT
  policyname,
  cmd,
  with_check::text
FROM pg_policies
WHERE tablename = 'cb_spectators'
  AND cmd = 'INSERT';

-- Drop and recreate INSERT policy to allow mock auth
DROP POLICY IF EXISTS "cb_spectators_insert_policy" ON cb_spectators;

-- New policy: Allow inserts for authenticated users OR when auth is NULL (mock auth)
CREATE POLICY "cb_spectators_insert_policy" ON cb_spectators
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR auth.uid() IS NULL);

-- Verify
SELECT 'cb_spectators INSERT policy AFTER:' as status;
SELECT
  policyname,
  cmd,
  with_check::text
FROM pg_policies
WHERE tablename = 'cb_spectators'
  AND cmd = 'INSERT';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ cb_spectators INSERT policy now allows mock auth users (auth.uid() IS NULL)';
END $$;
