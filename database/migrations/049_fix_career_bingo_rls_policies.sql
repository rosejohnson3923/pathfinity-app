-- ================================================================
-- FIX CAREER BINGO RLS POLICIES
-- Migration 049: Replace restrictive policies with server-permissive ones
-- ================================================================
-- ISSUE: Migration 048 created policies that only allow users to update
--        their OWN records, blocking server operations for AI players
-- FIX: Drop restrictive policies and create permissive server policies
-- ================================================================

-- ================================================================
-- cb_session_participants: Drop old restrictive policies
-- ================================================================

DROP POLICY IF EXISTS "cb_session_participants_update_policy" ON cb_session_participants;
DROP POLICY IF EXISTS "cb_session_participants_insert_policy" ON cb_session_participants;
DROP POLICY IF EXISTS "cb_session_participants_delete_policy" ON cb_session_participants;

-- ================================================================
-- cb_session_participants: Create permissive server policies
-- ================================================================

-- Policy: Server can INSERT new participants (both human and AI)
CREATE POLICY "cb_session_participants_insert_policy" ON cb_session_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow all inserts from authenticated context

-- Policy: Server can UPDATE any participant (for AI moves, scoring, etc.)
CREATE POLICY "cb_session_participants_update_policy" ON cb_session_participants
  FOR UPDATE
  TO authenticated
  USING (true)        -- Allow updating any row
  WITH CHECK (true);  -- Allow any values

-- Policy: Server can DELETE participants (cleanup)
CREATE POLICY "cb_session_participants_delete_policy" ON cb_session_participants
  FOR DELETE
  TO authenticated
  USING (true); -- Allow deleting any row

-- ================================================================
-- cb_game_sessions: Add missing policies
-- ================================================================

DROP POLICY IF EXISTS "cb_game_sessions_insert_policy" ON cb_game_sessions;
DROP POLICY IF EXISTS "cb_game_sessions_update_policy" ON cb_game_sessions;

-- Policy: Server can INSERT new game sessions
CREATE POLICY "cb_game_sessions_insert_policy" ON cb_game_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Server can UPDATE game sessions (question number, status, etc.)
CREATE POLICY "cb_game_sessions_update_policy" ON cb_game_sessions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ================================================================
-- cb_spectators: Fix restrictive policies
-- ================================================================

DROP POLICY IF EXISTS "cb_spectators_insert_policy" ON cb_spectators;
DROP POLICY IF EXISTS "cb_spectators_update_policy" ON cb_spectators;
DROP POLICY IF EXISTS "cb_spectators_delete_policy" ON cb_spectators;

-- Policy: Server can INSERT spectators (mock auth support)
CREATE POLICY "cb_spectators_insert_policy" ON cb_spectators
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Server can UPDATE spectator status
CREATE POLICY "cb_spectators_update_policy" ON cb_spectators
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Server can DELETE spectators
CREATE POLICY "cb_spectators_delete_policy" ON cb_spectators
  FOR DELETE
  TO authenticated
  USING (true);

-- ================================================================
-- cb_click_events: Fix restrictive policy
-- ================================================================

DROP POLICY IF EXISTS "cb_click_events_insert_policy" ON cb_click_events;

-- Policy: Server can INSERT click events for any participant
CREATE POLICY "cb_click_events_insert_policy" ON cb_click_events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ================================================================
-- cb_perpetual_rooms: Add missing UPDATE policy
-- ================================================================

DROP POLICY IF EXISTS "cb_perpetual_rooms_update_policy" ON cb_perpetual_rooms;

-- Policy: Server can UPDATE room state (player counts, game IDs, etc.)
CREATE POLICY "cb_perpetual_rooms_update_policy" ON cb_perpetual_rooms
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Count policies on cb_* tables
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename LIKE 'cb_%';

    RAISE NOTICE '';
    RAISE NOTICE '✅ Career Bingo RLS Policies Fixed!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Total policies on cb_* tables: %', policy_count;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Fixed Policies:';
    RAISE NOTICE '   ✓ cb_session_participants: INSERT, UPDATE, DELETE (permissive)';
    RAISE NOTICE '   ✓ cb_game_sessions: INSERT, UPDATE (permissive)';
    RAISE NOTICE '   ✓ cb_spectators: INSERT, UPDATE, DELETE (permissive)';
    RAISE NOTICE '   ✓ cb_click_events: INSERT (permissive)';
    RAISE NOTICE '   ✓ cb_perpetual_rooms: UPDATE (permissive)';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Server can now update ALL participants (human + AI)!';
    RAISE NOTICE '🎯 UPDATE operations will persist to database!';
    RAISE NOTICE '🎯 Bingo detection should now work!';
    RAISE NOTICE '';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
