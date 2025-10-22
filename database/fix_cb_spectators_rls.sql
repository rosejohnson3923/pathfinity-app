-- ================================================================
-- FIX ROW LEVEL SECURITY FOR cb_spectators AND cb_session_participants
-- Correct column name from user_id to student_id
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

-- Create corrected policies using student_id instead of user_id

-- Policy: Spectators viewable by all users
CREATE POLICY "cb_spectators_select_policy" ON cb_spectators
  FOR SELECT
  USING (true);

-- Policy: Users can insert themselves as spectators
CREATE POLICY "cb_spectators_insert_policy" ON cb_spectators
  FOR INSERT
  WITH CHECK (student_id = auth.uid());

-- Policy: Users can update their own spectator record
CREATE POLICY "cb_spectators_update_policy" ON cb_spectators
  FOR UPDATE
  USING (student_id = auth.uid());

-- Policy: Users can delete their own spectator record
CREATE POLICY "cb_spectators_delete_policy" ON cb_spectators
  FOR DELETE
  USING (student_id = auth.uid());

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

-- Drop existing policy
DROP POLICY IF EXISTS "cb_session_participants_update_policy" ON cb_session_participants;

-- Create corrected policy using student_id instead of user_id
CREATE POLICY "cb_session_participants_update_policy" ON cb_session_participants
  FOR UPDATE
  USING (student_id = auth.uid() OR student_id IS NULL); -- Allow NULL for AI players

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
  RAISE NOTICE '✅ RLS policies fixed for cb_spectators and cb_session_participants - using student_id column';
END $$;
