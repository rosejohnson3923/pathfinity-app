-- ================================================================
-- FIX cb_clues SELECT POLICY FOR MOCK AUTH
-- Change from {authenticated} to {public}
-- ================================================================

-- Show current policy
SELECT 'cb_clues policy BEFORE:' as status;
SELECT
  policyname,
  cmd,
  roles,
  qual::text as using_clause
FROM pg_policies
WHERE tablename = 'cb_clues';

-- Drop and recreate policy for public access
DROP POLICY IF EXISTS "cb_clues_select_policy" ON cb_clues;

CREATE POLICY "cb_clues_select_policy" ON cb_clues
  FOR SELECT
  USING (is_active = true);

-- Verify
SELECT 'cb_clues policy AFTER:' as status;
SELECT
  policyname,
  cmd,
  roles,
  qual::text as using_clause
FROM pg_policies
WHERE tablename = 'cb_clues';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ cb_clues SELECT policy now allows all users (public)';
END $$;
