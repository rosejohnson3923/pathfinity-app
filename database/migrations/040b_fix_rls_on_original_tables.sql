-- ================================================================
-- DISCOVERED LIVE! - FIX RLS ON ORIGINAL TABLES
-- Migration 040b: Ensure RLS is enabled on all DL tables
-- ================================================================
-- This ensures that the original tables from migration 039
-- have RLS properly enabled (they may have been disabled)
-- ================================================================

-- Re-enable RLS on original tables
ALTER TABLE dl_clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE dl_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE dl_answers ENABLE ROW LEVEL SECURITY;

-- Verify all DL tables have RLS enabled
DO $$
DECLARE
  tbl RECORD;
  rls_status BOOLEAN;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename LIKE 'dl_%'
  LOOP
    SELECT rowsecurity INTO rls_status
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = tbl.tablename;

    RAISE NOTICE 'Table %: RLS = %', tbl.tablename, rls_status;

    IF NOT rls_status THEN
      RAISE EXCEPTION 'RLS is not enabled on table: %', tbl.tablename;
    END IF;
  END LOOP;

  RAISE NOTICE 'All DL tables have RLS enabled ✓';
END $$;

-- ================================================================
-- VERIFICATION COMPLETE
-- ================================================================
-- Expected output: All tables should show RLS = true
-- ================================================================
