-- ================================================================
-- DROP ARCHIVED TABLES: _archived_dl_* and _archived_cc_*
-- Migration 056: Remove deprecated tables after successful decoupling
-- ================================================================
-- This migration permanently deletes all archived tables:
-- - _archived_dl_* tables (old Career Bingo tables) - 8 tables
-- - _archived_cc_* tables (old Decision Desk tables) - 20 tables
--
-- PREREQUISITE: All games working with new table structure
-- - Career Bingo uses cb_* tables ✅
-- - CEO Takeover uses ccm_* tables ✅
-- - The Decision Desk uses dd_* tables ✅
-- ================================================================

-- ================================================================
-- PRE-DELETION VERIFICATION
-- ================================================================
DO $$
DECLARE
    archived_dl_count INTEGER;
    archived_cc_count INTEGER;
BEGIN
    -- Count archived DL tables
    SELECT COUNT(*) INTO archived_dl_count
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE '_archived_dl_%';

    -- Count archived CC tables
    SELECT COUNT(*) INTO archived_cc_count
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE '_archived_cc_%';

    RAISE NOTICE '';
    RAISE NOTICE '📋 PRE-DELETION INVENTORY';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   _archived_dl_* tables (Career Bingo): %', archived_dl_count;
    RAISE NOTICE '   _archived_cc_* tables (Decision Desk): %', archived_cc_count;
    RAISE NOTICE '   Total to delete: %', archived_dl_count + archived_cc_count;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
END $$;

-- ================================================================
-- DROP CAREER BINGO ARCHIVED TABLES (_archived_dl_*)
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '🗑️  Dropping Career Bingo archived tables...';

    -- Drop tables in correct order (respecting dependencies)
    DROP TABLE IF EXISTS _archived_dl_click_events CASCADE;
    DROP TABLE IF EXISTS _archived_dl_spectators CASCADE;
    DROP TABLE IF EXISTS _archived_dl_session_participants CASCADE;
    DROP TABLE IF EXISTS _archived_dl_game_sessions CASCADE;
    DROP TABLE IF EXISTS _archived_dl_perpetual_rooms CASCADE;
    DROP TABLE IF EXISTS _archived_dl_answers CASCADE;
    DROP TABLE IF EXISTS _archived_dl_games CASCADE;
    DROP TABLE IF EXISTS _archived_dl_clues CASCADE;

    RAISE NOTICE '✅ Career Bingo archived tables dropped (8 tables)';
END $$;

-- ================================================================
-- DROP DECISION DESK ARCHIVED TABLES (_archived_cc_*)
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '🗑️  Dropping Decision Desk archived tables...';

    -- Drop tables in correct order (respecting dependencies)
    DROP TABLE IF EXISTS _archived_cc_ai_content_cache CASCADE;
    DROP TABLE IF EXISTS _archived_cc_trading_market CASCADE;
    DROP TABLE IF EXISTS _archived_cc_trading_post CASCADE;
    DROP TABLE IF EXISTS _archived_cc_daily_challenges CASCADE;
    DROP TABLE IF EXISTS _archived_cc_room_messages CASCADE;
    DROP TABLE IF EXISTS _archived_cc_executive_stats CASCADE;
    DROP TABLE IF EXISTS _archived_cc_scenario_company_map CASCADE;
    DROP TABLE IF EXISTS _archived_cc_leadership_scores CASCADE;
    DROP TABLE IF EXISTS _archived_cc_lens_effects CASCADE;
    DROP TABLE IF EXISTS _archived_cc_solution_cards CASCADE;
    DROP TABLE IF EXISTS _archived_cc_business_scenarios CASCADE;
    DROP TABLE IF EXISTS _archived_cc_company_rooms CASCADE;
    DROP TABLE IF EXISTS _archived_cc_challenge_progress CASCADE;
    DROP TABLE IF EXISTS _archived_cc_game_session_players CASCADE;
    DROP TABLE IF EXISTS _archived_cc_executive_sessions CASCADE;
    DROP TABLE IF EXISTS _archived_cc_game_sessions CASCADE;
    DROP TABLE IF EXISTS _archived_cc_challenge_sessions CASCADE;
    DROP TABLE IF EXISTS _archived_cc_player_progress CASCADE;
    DROP TABLE IF EXISTS _archived_cc_player_progression CASCADE;
    DROP TABLE IF EXISTS _archived_cc_player_collections CASCADE;
    DROP TABLE IF EXISTS _archived_cc_synergies CASCADE;
    DROP TABLE IF EXISTS _archived_cc_role_cards CASCADE;
    DROP TABLE IF EXISTS _archived_cc_challenges CASCADE;
    DROP TABLE IF EXISTS _archived_cc_industries CASCADE;

    RAISE NOTICE '✅ Decision Desk archived tables dropped (20 tables)';
END $$;

-- ================================================================
-- POST-DELETION VERIFICATION
-- ================================================================
DO $$
DECLARE
    remaining_dl_count INTEGER;
    remaining_cc_count INTEGER;
    total_remaining INTEGER;
BEGIN
    -- Count remaining archived DL tables
    SELECT COUNT(*) INTO remaining_dl_count
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE '_archived_dl_%';

    -- Count remaining archived CC tables
    SELECT COUNT(*) INTO remaining_cc_count
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE '_archived_cc_%';

    total_remaining := remaining_dl_count + remaining_cc_count;

    RAISE NOTICE '';
    RAISE NOTICE '✅ DELETION COMPLETE';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Remaining _archived_dl_* tables: %', remaining_dl_count;
    RAISE NOTICE '   Remaining _archived_cc_* tables: %', remaining_cc_count;
    RAISE NOTICE '   Total remaining archived tables: %', total_remaining;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';

    IF total_remaining > 0 THEN
        RAISE WARNING 'Some archived tables still exist! Run this query to see them:';
        RAISE WARNING 'SELECT tablename FROM pg_tables WHERE schemaname = ''public'' AND (tablename LIKE ''_archived_dl_%%'' OR tablename LIKE ''_archived_cc_%%'');';
    ELSE
        RAISE NOTICE '🎉 SUCCESS! All 28 archived tables have been deleted.';
        RAISE NOTICE '';
        RAISE NOTICE 'Active game tables:';
        RAISE NOTICE '   ✅ Career Bingo: cb_* tables';
        RAISE NOTICE '   ✅ CEO Takeover: ccm_* tables';
        RAISE NOTICE '   ✅ The Decision Desk: dd_* tables';
        RAISE NOTICE '';
    END IF;
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================

-- Database cleanup complete!
-- All games now using their dedicated table namespaces:
-- - cb_*  = Career Bingo
-- - ccm_* = CEO Takeover (Career Challenge Multiplayer)
-- - dd_*  = The Decision Desk
