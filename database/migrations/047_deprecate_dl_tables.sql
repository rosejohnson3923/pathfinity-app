-- ================================================================
-- DEPRECATE OLD CAREER BINGO TABLES: dl_* → _archived_dl_*
-- Migration 047: Rename old tables to catch unknown dependencies
-- ================================================================
-- This migration renames dl_* tables to _archived_dl_*
-- Any code still using dl_* will fail immediately, alerting us to hidden dependencies
-- Tables remain in database for safety - can be dropped later once verified unused
-- ================================================================

-- ================================================================
-- STEP 1: Rename all dl_* tables to _archived_dl_*
-- ================================================================

-- Core game tables
ALTER TABLE IF EXISTS dl_clues RENAME TO _archived_dl_clues;
ALTER TABLE IF EXISTS dl_games RENAME TO _archived_dl_games;
ALTER TABLE IF EXISTS dl_answers RENAME TO _archived_dl_answers;

-- Multiplayer tables
ALTER TABLE IF EXISTS dl_perpetual_rooms RENAME TO _archived_dl_perpetual_rooms;
ALTER TABLE IF EXISTS dl_game_sessions RENAME TO _archived_dl_game_sessions;
ALTER TABLE IF EXISTS dl_session_participants RENAME TO _archived_dl_session_participants;
ALTER TABLE IF EXISTS dl_spectators RENAME TO _archived_dl_spectators;
ALTER TABLE IF EXISTS dl_click_events RENAME TO _archived_dl_click_events;

-- ================================================================
-- STEP 2: Add comments marking them as deprecated
-- ================================================================

COMMENT ON TABLE _archived_dl_clues IS 'DEPRECATED: Use cb_clues instead. Career Bingo has migrated to cb_* tables.';
COMMENT ON TABLE _archived_dl_games IS 'DEPRECATED: Use cb_games instead. Career Bingo has migrated to cb_* tables.';
COMMENT ON TABLE _archived_dl_answers IS 'DEPRECATED: Use cb_answers instead. Career Bingo has migrated to cb_* tables.';
COMMENT ON TABLE _archived_dl_perpetual_rooms IS 'DEPRECATED: Use cb_perpetual_rooms instead. Career Bingo has migrated to cb_* tables.';
COMMENT ON TABLE _archived_dl_game_sessions IS 'DEPRECATED: Use cb_game_sessions instead. Career Bingo has migrated to cb_* tables.';
COMMENT ON TABLE _archived_dl_session_participants IS 'DEPRECATED: Use cb_session_participants instead. Career Bingo has migrated to cb_* tables.';
COMMENT ON TABLE _archived_dl_spectators IS 'DEPRECATED: Use cb_spectators instead. Career Bingo has migrated to cb_* tables.';
COMMENT ON TABLE _archived_dl_click_events IS 'DEPRECATED: Use cb_click_events instead. Career Bingo has migrated to cb_* tables.';

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
DECLARE
    archived_count INTEGER;
    dl_count INTEGER;
    total_archived_rows INTEGER := 0;
    table_row_count INTEGER;
BEGIN
    -- Count archived tables
    SELECT COUNT(*) INTO archived_count
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE '_archived_dl_%';

    -- Check for remaining dl_* tables
    SELECT COUNT(*) INTO dl_count
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'dl_%';

    -- Count total archived rows
    SELECT COUNT(*) INTO table_row_count FROM _archived_dl_clues;
    total_archived_rows := total_archived_rows + table_row_count;

    SELECT COUNT(*) INTO table_row_count FROM _archived_dl_games;
    total_archived_rows := total_archived_rows + table_row_count;

    SELECT COUNT(*) INTO table_row_count FROM _archived_dl_session_participants;
    total_archived_rows := total_archived_rows + table_row_count;

    RAISE NOTICE '';
    RAISE NOTICE '✅ DL Tables Deprecated!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Renamed % dl_* tables to _archived_dl_*', archived_count;
    RAISE NOTICE '   Remaining dl_* tables: %', dl_count;
    RAISE NOTICE '   Archived rows preserved: %', total_archived_rows;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'What This Means:';
    RAISE NOTICE '   ⚠️  Any code using dl_* tables will now FAIL';
    RAISE NOTICE '   ✓  This alerts us to unknown dependencies';
    RAISE NOTICE '   ✓  Data still safe in _archived_dl_* tables';
    RAISE NOTICE '   ✓  All code should use cb_* tables';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '   1. Monitor application for errors';
    RAISE NOTICE '   2. Fix any code still referencing dl_*';
    RAISE NOTICE '   3. After verification period, drop _archived_* tables';
    RAISE NOTICE '';
    IF dl_count > 0 THEN
        RAISE NOTICE '⚠️  WARNING: % dl_* tables still exist (not renamed)', dl_count;
        RAISE NOTICE '   Run this query to see them:';
        RAISE NOTICE '   SELECT tablename FROM pg_tables WHERE schemaname = ''public'' AND tablename LIKE ''dl_%%'';';
    END IF;
    RAISE NOTICE '';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================

-- To rollback (if needed):
-- ALTER TABLE _archived_dl_clues RENAME TO dl_clues;
-- ALTER TABLE _archived_dl_games RENAME TO dl_games;
-- ALTER TABLE _archived_dl_answers RENAME TO dl_answers;
-- ALTER TABLE _archived_dl_perpetual_rooms RENAME TO dl_perpetual_rooms;
-- ALTER TABLE _archived_dl_game_sessions RENAME TO dl_game_sessions;
-- ALTER TABLE _archived_dl_session_participants RENAME TO dl_session_participants;
-- ALTER TABLE _archived_dl_spectators RENAME TO dl_spectators;
-- ALTER TABLE _archived_dl_click_events RENAME TO dl_click_events;

-- To permanently delete (after verification):
-- DROP TABLE _archived_dl_click_events CASCADE;
-- DROP TABLE _archived_dl_spectators CASCADE;
-- DROP TABLE _archived_dl_session_participants CASCADE;
-- DROP TABLE _archived_dl_game_sessions CASCADE;
-- DROP TABLE _archived_dl_perpetual_rooms CASCADE;
-- DROP TABLE _archived_dl_answers CASCADE;
-- DROP TABLE _archived_dl_games CASCADE;
-- DROP TABLE _archived_dl_clues CASCADE;
