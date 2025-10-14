-- ================================================================
-- DISCOVERED LIVE! - DISABLE RLS FOR TESTING
-- Migration 040c: Disable RLS on all DL tables for easier testing
-- ================================================================
-- This disables Row Level Security on all DL tables to match
-- the existing configuration and avoid access issues during testing.
-- RLS can be re-enabled later for production.
-- ================================================================

-- Disable RLS on new multiplayer tables
ALTER TABLE dl_perpetual_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE dl_game_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE dl_session_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE dl_spectators DISABLE ROW LEVEL SECURITY;
ALTER TABLE dl_click_events DISABLE ROW LEVEL SECURITY;

-- Drop the RLS policies (they won't be enforced anyway, but cleaner to remove them)
DROP POLICY IF EXISTS "perpetual_rooms_select_policy" ON dl_perpetual_rooms;
DROP POLICY IF EXISTS "game_sessions_select_policy" ON dl_game_sessions;
DROP POLICY IF EXISTS "session_participants_select_policy" ON dl_session_participants;
DROP POLICY IF EXISTS "spectators_select_policy" ON dl_spectators;
DROP POLICY IF EXISTS "spectators_insert_policy" ON dl_spectators;
DROP POLICY IF EXISTS "spectators_delete_policy" ON dl_spectators;
DROP POLICY IF EXISTS "click_events_select_policy" ON dl_click_events;
DROP POLICY IF EXISTS "click_events_insert_policy" ON dl_click_events;

-- Verify all DL tables have RLS disabled
DO $$
DECLARE
  tbl RECORD;
  rls_status BOOLEAN;
BEGIN
  RAISE NOTICE '=== RLS Status for all DL tables ===';

  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename LIKE 'dl_%'
    ORDER BY tablename
  LOOP
    SELECT rowsecurity INTO rls_status
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = tbl.tablename;

    RAISE NOTICE 'Table %: RLS = %', tbl.tablename, rls_status;
  END LOOP;

  RAISE NOTICE '=== All DL tables should show RLS = false ===';
END $$;

-- ================================================================
-- VERIFICATION COMPLETE
-- ================================================================
-- Expected output: All dl_* tables should show RLS = false
-- This allows full access during development and testing
-- ================================================================

-- IMPORTANT: Re-enable RLS before production deployment!
-- See migration 040d_enable_rls_for_production.sql when ready
