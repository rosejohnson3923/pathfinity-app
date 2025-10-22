-- ================================================================
-- FIX ROW LEVEL SECURITY FOR cb_spectators AND cb_session_participants
-- Remove "TO authenticated" restriction to allow all users (like cb_perpetual_rooms)
-- ================================================================

-- ================================================================
-- FIX cb_spectators POLICIES
-- ================================================================

-- Check current policies
SELECT 'cb_spectators policies BEFORE:' as status;
SELECT
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'cb_spectators';

-- Drop existing policies
DROP POLICY IF EXISTS "cb_spectators_select_policy" ON cb_spectators;
DROP POLICY IF EXISTS "cb_spectators_insert_policy" ON cb_spectators;
DROP POLICY IF EXISTS "cb_spectators_update_policy" ON cb_spectators;
DROP POLICY IF EXISTS "cb_spectators_delete_policy" ON cb_spectators;

-- Create corrected policies without "TO authenticated" restriction

-- Policy: Spectators viewable by all users
CREATE POLICY "cb_spectators_select_policy" ON cb_spectators
  FOR SELECT
  USING (true);

-- Policy: Users can insert themselves as spectators
CREATE POLICY "cb_spectators_insert_policy" ON cb_spectators
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own spectator record
CREATE POLICY "cb_spectators_update_policy" ON cb_spectators
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can delete their own spectator record
CREATE POLICY "cb_spectators_delete_policy" ON cb_spectators
  FOR DELETE
  USING (user_id = auth.uid());

-- ================================================================
-- FIX cb_session_participants POLICIES
-- ================================================================

-- Check current policies
SELECT 'cb_session_participants policies BEFORE:' as status;
SELECT
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'cb_session_participants';

-- Drop existing policies
DROP POLICY IF EXISTS "cb_session_participants_select_policy" ON cb_session_participants;
DROP POLICY IF EXISTS "cb_session_participants_update_policy" ON cb_session_participants;

-- Create corrected policies without "TO authenticated" restriction

-- Policy: Session participants viewable by all users
CREATE POLICY "cb_session_participants_select_policy" ON cb_session_participants
  FOR SELECT
  USING (true);

-- Policy: Users can update their own participant record
CREATE POLICY "cb_session_participants_update_policy" ON cb_session_participants
  FOR UPDATE
  USING (user_id = auth.uid() OR user_id IS NULL); -- Allow NULL for AI players

-- ================================================================
-- VERIFY
-- ================================================================

SELECT 'cb_spectators policies AFTER:' as status;
SELECT
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'cb_spectators';

SELECT 'cb_session_participants policies AFTER:' as status;
SELECT
  policyname,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'cb_session_participants';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies fixed for cb_spectators and cb_session_participants - removed TO authenticated restriction';
END $$;
