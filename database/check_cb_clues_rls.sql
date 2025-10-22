-- ================================================================
-- CHECK cb_clues RLS POLICIES
-- ================================================================

-- Check if RLS is enabled
SELECT
  'RLS enabled:' as info,
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'cb_clues';

-- Check existing policies
SELECT
  'cb_clues policies:' as info,
  policyname,
  cmd,
  roles,
  qual::text as using_clause
FROM pg_policies
WHERE tablename = 'cb_clues';
