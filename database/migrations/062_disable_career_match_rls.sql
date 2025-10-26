-- ================================================================
-- DISABLE RLS FOR CAREER MATCH TABLES (FOR TESTING)
-- Migration 062: Temporarily disable RLS to allow testing
-- ================================================================
-- NOTE: This is for development/testing only
-- In production, proper RLS policies should be implemented
-- ================================================================

-- Disable RLS on all Career Match tables
ALTER TABLE cm_perpetual_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE cm_game_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE cm_session_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE cm_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE cm_moves DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users
GRANT ALL ON cm_perpetual_rooms TO authenticated;
GRANT ALL ON cm_game_sessions TO authenticated;
GRANT ALL ON cm_session_participants TO authenticated;
GRANT ALL ON cm_cards TO authenticated;
GRANT ALL ON cm_moves TO authenticated;

-- Also grant to anon for public access
GRANT SELECT ON cm_perpetual_rooms TO anon;
GRANT SELECT ON cm_game_sessions TO anon;
GRANT SELECT ON cm_session_participants TO anon;
GRANT SELECT ON cm_cards TO anon;

-- Verification
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Career Match RLS DISABLED (Testing Mode)';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   All Career Match tables: RLS OFF';
    RAISE NOTICE '   Full access granted to authenticated users';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   ⚠️  Re-enable RLS for production!';
    RAISE NOTICE '';
END $$;
