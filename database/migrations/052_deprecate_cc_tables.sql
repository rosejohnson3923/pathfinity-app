-- ================================================================
-- DEPRECATE OLD CC TABLES: cc_* → _archived_cc_*
-- Migration 052: Rename old tables to catch unknown dependencies
-- ================================================================
-- This migration renames cc_* tables to _archived_cc_*
-- Any code still using cc_* will fail immediately, alerting us to hidden dependencies
-- Tables remain in database for safety - can be dropped later once verified unused
-- ================================================================

-- ================================================================
-- STEP 1: Rename all cc_* tables to _archived_cc_*
-- ================================================================

-- Core game tables
ALTER TABLE IF EXISTS cc_industries RENAME TO _archived_cc_industries;
ALTER TABLE IF EXISTS cc_challenges RENAME TO _archived_cc_challenges;
ALTER TABLE IF EXISTS cc_role_cards RENAME TO _archived_cc_role_cards;
ALTER TABLE IF EXISTS cc_synergies RENAME TO _archived_cc_synergies;

-- Player progression and collections
ALTER TABLE IF EXISTS cc_player_collections RENAME TO _archived_cc_player_collections;
ALTER TABLE IF EXISTS cc_player_progression RENAME TO _archived_cc_player_progression;
ALTER TABLE IF EXISTS cc_player_progress RENAME TO _archived_cc_player_progress;

-- Game sessions
ALTER TABLE IF EXISTS cc_challenge_sessions RENAME TO _archived_cc_challenge_sessions;
ALTER TABLE IF EXISTS cc_game_sessions RENAME TO _archived_cc_game_sessions;
ALTER TABLE IF EXISTS cc_executive_sessions RENAME TO _archived_cc_executive_sessions;
ALTER TABLE IF EXISTS cc_game_session_players RENAME TO _archived_cc_game_session_players;
ALTER TABLE IF EXISTS cc_challenge_progress RENAME TO _archived_cc_challenge_progress;

-- Executive Decision specific tables
ALTER TABLE IF EXISTS cc_company_rooms RENAME TO _archived_cc_company_rooms;
ALTER TABLE IF EXISTS cc_business_scenarios RENAME TO _archived_cc_business_scenarios;
ALTER TABLE IF EXISTS cc_solution_cards RENAME TO _archived_cc_solution_cards;
ALTER TABLE IF EXISTS cc_lens_effects RENAME TO _archived_cc_lens_effects;
ALTER TABLE IF EXISTS cc_leadership_scores RENAME TO _archived_cc_leadership_scores;
ALTER TABLE IF EXISTS cc_scenario_company_map RENAME TO _archived_cc_scenario_company_map;
ALTER TABLE IF EXISTS cc_executive_stats RENAME TO _archived_cc_executive_stats;
ALTER TABLE IF EXISTS cc_room_messages RENAME TO _archived_cc_room_messages;

-- Daily challenges and trading
ALTER TABLE IF EXISTS cc_daily_challenges RENAME TO _archived_cc_daily_challenges;
ALTER TABLE IF EXISTS cc_trading_post RENAME TO _archived_cc_trading_post;
ALTER TABLE IF EXISTS cc_trading_market RENAME TO _archived_cc_trading_market;

-- AI content cache
ALTER TABLE IF EXISTS cc_ai_content_cache RENAME TO _archived_cc_ai_content_cache;

-- ================================================================
-- STEP 2: Add comments marking them as deprecated
-- ================================================================

COMMENT ON TABLE _archived_cc_industries IS 'DEPRECATED: Use dd_industries instead. The Decision Desk has migrated to dd_* tables.';
COMMENT ON TABLE _archived_cc_challenges IS 'DEPRECATED: Use dd_challenges instead. The Decision Desk has migrated to dd_* tables.';
COMMENT ON TABLE _archived_cc_role_cards IS 'DEPRECATED: Use dd_role_cards instead. The Decision Desk has migrated to dd_* tables.';
COMMENT ON TABLE _archived_cc_synergies IS 'DEPRECATED: Use dd_synergies instead. The Decision Desk has migrated to dd_* tables.';
COMMENT ON TABLE _archived_cc_player_progression IS 'DEPRECATED: Use dd_player_progression instead. The Decision Desk has migrated to dd_* tables.';
COMMENT ON TABLE _archived_cc_game_sessions IS 'DEPRECATED: Use dd_game_sessions instead. The Decision Desk has migrated to dd_* tables.';
COMMENT ON TABLE _archived_cc_executive_sessions IS 'DEPRECATED: Use dd_executive_sessions instead. The Decision Desk has migrated to dd_* tables.';
COMMENT ON TABLE _archived_cc_game_session_players IS 'DEPRECATED: Use dd_game_session_players instead. The Decision Desk has migrated to dd_* tables.';
COMMENT ON TABLE _archived_cc_company_rooms IS 'DEPRECATED: Use dd_company_rooms instead. The Decision Desk has migrated to dd_* tables.';
COMMENT ON TABLE _archived_cc_business_scenarios IS 'DEPRECATED: Use dd_business_scenarios instead. The Decision Desk has migrated to dd_* tables.';
COMMENT ON TABLE _archived_cc_solution_cards IS 'DEPRECATED: Use dd_solution_cards instead. The Decision Desk has migrated to dd_* tables.';
COMMENT ON TABLE _archived_cc_lens_effects IS 'DEPRECATED: Use dd_lens_effects instead. The Decision Desk has migrated to dd_* tables.';
COMMENT ON TABLE _archived_cc_leadership_scores IS 'DEPRECATED: Use dd_leadership_scores instead. The Decision Desk has migrated to dd_* tables.';
COMMENT ON TABLE _archived_cc_daily_challenges IS 'DEPRECATED: Use dd_daily_challenges instead. The Decision Desk has migrated to dd_* tables.';
COMMENT ON TABLE _archived_cc_trading_market IS 'DEPRECATED: Use dd_trading_market instead. The Decision Desk has migrated to dd_* tables.';
COMMENT ON TABLE _archived_cc_ai_content_cache IS 'DEPRECATED: Use dd_ai_content_cache instead. The Decision Desk has migrated to dd_* tables.';

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
DECLARE
    archived_count INTEGER;
    cc_count INTEGER;
    total_archived_rows INTEGER := 0;
    table_row_count INTEGER;
BEGIN
    -- Count archived tables
    SELECT COUNT(*) INTO archived_count
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE '_archived_cc_%';

    -- Check for remaining cc_* tables
    SELECT COUNT(*) INTO cc_count
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'cc_%' AND tablename NOT LIKE 'ccm_%';

    -- Count total archived rows (sample from key tables)
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = '_archived_cc_industries') THEN
        SELECT COUNT(*) INTO table_row_count FROM _archived_cc_industries;
        total_archived_rows := total_archived_rows + table_row_count;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = '_archived_cc_challenges') THEN
        SELECT COUNT(*) INTO table_row_count FROM _archived_cc_challenges;
        total_archived_rows := total_archived_rows + table_row_count;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = '_archived_cc_company_rooms') THEN
        SELECT COUNT(*) INTO table_row_count FROM _archived_cc_company_rooms;
        total_archived_rows := total_archived_rows + table_row_count;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '✅ CC Tables Deprecated!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Renamed % cc_* tables to _archived_cc_*', archived_count;
    RAISE NOTICE '   Remaining cc_* tables (non-ccm): %', cc_count;
    RAISE NOTICE '   Archived rows (sample): %', total_archived_rows;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'What This Means:';
    RAISE NOTICE '   ⚠️  Any code using cc_* tables will now FAIL';
    RAISE NOTICE '   ✓  This alerts us to unknown dependencies';
    RAISE NOTICE '   ✓  Data still safe in _archived_cc_* tables';
    RAISE NOTICE '   ✓  All code should use dd_* tables (Decision Desk)';
    RAISE NOTICE '   ✓  All code should use ccm_* tables (CEO Takeover)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '   1. Test The Decision Desk';
    RAISE NOTICE '   2. Monitor application for errors';
    RAISE NOTICE '   3. Fix any code still referencing cc_*';
    RAISE NOTICE '   4. After verification period, drop _archived_* tables';
    RAISE NOTICE '';
    IF cc_count > 0 THEN
        RAISE NOTICE '⚠️  WARNING: % cc_* tables still exist (not renamed)', cc_count;
        RAISE NOTICE '   Run this query to see them:';
        RAISE NOTICE '   SELECT tablename FROM pg_tables WHERE schemaname = ''public'' AND tablename LIKE ''cc_%%'' AND tablename NOT LIKE ''ccm_%%'';';
    END IF;
    RAISE NOTICE '';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================

-- To rollback (if needed):
-- ALTER TABLE _archived_cc_industries RENAME TO cc_industries;
-- ALTER TABLE _archived_cc_challenges RENAME TO cc_challenges;
-- ALTER TABLE _archived_cc_role_cards RENAME TO cc_role_cards;
-- ALTER TABLE _archived_cc_synergies RENAME TO cc_synergies;
-- ALTER TABLE _archived_cc_player_progression RENAME TO cc_player_progression;
-- ALTER TABLE _archived_cc_game_sessions RENAME TO cc_game_sessions;
-- ALTER TABLE _archived_cc_executive_sessions RENAME TO cc_executive_sessions;
-- ALTER TABLE _archived_cc_game_session_players RENAME TO cc_game_session_players;
-- ALTER TABLE _archived_cc_company_rooms RENAME TO cc_company_rooms;
-- ALTER TABLE _archived_cc_business_scenarios RENAME TO cc_business_scenarios;
-- ALTER TABLE _archived_cc_solution_cards RENAME TO cc_solution_cards;
-- ALTER TABLE _archived_cc_lens_effects RENAME TO cc_lens_effects;
-- ALTER TABLE _archived_cc_leadership_scores RENAME TO cc_leadership_scores;
-- ALTER TABLE _archived_cc_daily_challenges RENAME TO cc_daily_challenges;
-- ALTER TABLE _archived_cc_trading_market RENAME TO cc_trading_market;
-- ALTER TABLE _archived_cc_ai_content_cache RENAME TO cc_ai_content_cache;

-- To permanently delete (after verification):
-- DROP TABLE _archived_cc_ai_content_cache CASCADE;
-- DROP TABLE _archived_cc_trading_market CASCADE;
-- DROP TABLE _archived_cc_daily_challenges CASCADE;
-- DROP TABLE _archived_cc_leadership_scores CASCADE;
-- DROP TABLE _archived_cc_lens_effects CASCADE;
-- DROP TABLE _archived_cc_solution_cards CASCADE;
-- DROP TABLE _archived_cc_business_scenarios CASCADE;
-- DROP TABLE _archived_cc_company_rooms CASCADE;
-- DROP TABLE _archived_cc_game_session_players CASCADE;
-- DROP TABLE _archived_cc_executive_sessions CASCADE;
-- DROP TABLE _archived_cc_game_sessions CASCADE;
-- DROP TABLE _archived_cc_player_progression CASCADE;
-- DROP TABLE _archived_cc_synergies CASCADE;
-- DROP TABLE _archived_cc_role_cards CASCADE;
-- DROP TABLE _archived_cc_challenges CASCADE;
-- DROP TABLE _archived_cc_industries CASCADE;
