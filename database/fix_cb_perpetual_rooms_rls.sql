-- ================================================================
-- FIX ROW LEVEL SECURITY FOR cb_perpetual_rooms
-- Allow public/anon access to view active rooms
-- ================================================================

-- Check current RLS status
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'cb_perpetual_rooms';

-- Check existing policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'cb_perpetual_rooms';

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "cb_perpetual_rooms_select_policy" ON cb_perpetual_rooms;

-- Create new policy allowing both authenticated and anon users to view active rooms
CREATE POLICY "cb_perpetual_rooms_select_policy" ON cb_perpetual_rooms
  FOR SELECT
  USING (is_active = true);

-- Verify policy was created
SELECT
  policyname,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'cb_perpetual_rooms';

-- Test query to verify access
SELECT
  room_code,
  room_name,
  is_active
FROM cb_perpetual_rooms
WHERE room_code = 'GLOBAL01';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policy updated for cb_perpetual_rooms - now accessible to all users';
END $$;
