-- ================================================================
-- COPY THE DECISION DESK TABLES: cc_* → dd_*
-- Migration 051: Separate The Decision Desk from shared cc_* namespace
-- ================================================================
-- This migration COPIES all Decision Desk tables from cc_* to dd_*
-- Preserves all existing UUIDs and data
-- Old cc_* tables remain intact as backup (will be archived later)
-- ================================================================

-- ================================================================
-- STEP 1: Copy All Tables (preserves all UUIDs and data)
-- ================================================================

-- Core game tables
CREATE TABLE IF NOT EXISTS dd_industries AS SELECT * FROM cc_industries;
CREATE TABLE IF NOT EXISTS dd_challenges AS SELECT * FROM cc_challenges;
CREATE TABLE IF NOT EXISTS dd_role_cards AS SELECT * FROM cc_role_cards;
CREATE TABLE IF NOT EXISTS dd_synergies AS SELECT * FROM cc_synergies;

-- Player progression and collections (conditional - may not exist)
DO $$
BEGIN
    -- Copy cc_player_progression if it exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cc_player_progression') THEN
        CREATE TABLE IF NOT EXISTS dd_player_progression AS SELECT * FROM cc_player_progression;
        RAISE NOTICE 'Copied cc_player_progression → dd_player_progression';
    ELSE
        RAISE NOTICE 'Skipped cc_player_progression (table does not exist)';
    END IF;

    -- Copy cc_player_collections if it exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cc_player_collections') THEN
        CREATE TABLE IF NOT EXISTS dd_player_collections AS SELECT * FROM cc_player_collections;
        RAISE NOTICE 'Copied cc_player_collections → dd_player_collections';
    ELSE
        RAISE NOTICE 'Skipped cc_player_collections (table does not exist)';
    END IF;
END $$;

-- Game sessions
CREATE TABLE IF NOT EXISTS dd_game_sessions AS SELECT * FROM cc_game_sessions;
CREATE TABLE IF NOT EXISTS dd_executive_sessions AS SELECT * FROM cc_executive_sessions;
CREATE TABLE IF NOT EXISTS dd_game_session_players AS SELECT * FROM cc_game_session_players;

-- Copy cc_challenge_sessions if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cc_challenge_sessions') THEN
        CREATE TABLE IF NOT EXISTS dd_challenge_sessions AS SELECT * FROM cc_challenge_sessions;
        RAISE NOTICE 'Copied cc_challenge_sessions → dd_challenge_sessions';
    ELSE
        RAISE NOTICE 'Skipped cc_challenge_sessions (table does not exist)';
    END IF;
END $$;

-- If cc_challenge_progress exists, copy it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cc_challenge_progress') THEN
        CREATE TABLE IF NOT EXISTS dd_challenge_progress AS SELECT * FROM cc_challenge_progress;
        RAISE NOTICE 'Copied cc_challenge_progress → dd_challenge_progress';
    ELSE
        RAISE NOTICE 'Skipped cc_challenge_progress (table does not exist)';
    END IF;
END $$;

-- Executive Decision specific tables
CREATE TABLE IF NOT EXISTS dd_company_rooms AS SELECT * FROM cc_company_rooms;
CREATE TABLE IF NOT EXISTS dd_business_scenarios AS SELECT * FROM cc_business_scenarios;
CREATE TABLE IF NOT EXISTS dd_solution_cards AS SELECT * FROM cc_solution_cards;
CREATE TABLE IF NOT EXISTS dd_lens_effects AS SELECT * FROM cc_lens_effects;
CREATE TABLE IF NOT EXISTS dd_leadership_scores AS SELECT * FROM cc_leadership_scores;
CREATE TABLE IF NOT EXISTS dd_scenario_company_map AS SELECT * FROM cc_scenario_company_map;

-- If cc_executive_stats exists, copy it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cc_executive_stats') THEN
        CREATE TABLE IF NOT EXISTS dd_executive_stats AS SELECT * FROM cc_executive_stats;
        RAISE NOTICE 'Copied cc_executive_stats → dd_executive_stats';
    ELSE
        RAISE NOTICE 'Skipped cc_executive_stats (table does not exist)';
    END IF;
END $$;

-- If cc_room_messages exists, copy it
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cc_room_messages') THEN
        CREATE TABLE IF NOT EXISTS dd_room_messages AS SELECT * FROM cc_room_messages;
        RAISE NOTICE 'Copied cc_room_messages → dd_room_messages';
    ELSE
        RAISE NOTICE 'Skipped cc_room_messages (table does not exist)';
    END IF;
END $$;

-- Daily challenges and trading
CREATE TABLE IF NOT EXISTS dd_daily_challenges AS SELECT * FROM cc_daily_challenges;
CREATE TABLE IF NOT EXISTS dd_trading_market AS SELECT * FROM cc_trading_market;

-- AI content cache
CREATE TABLE IF NOT EXISTS dd_ai_content_cache AS SELECT * FROM cc_ai_content_cache;

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
DECLARE
    dd_count INTEGER;
    total_rows INTEGER := 0;
    table_row_count INTEGER;
BEGIN
    -- Count dd_* tables
    SELECT COUNT(*) INTO dd_count
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'dd_%';

    -- Count total rows copied (sample from key tables)
    SELECT COUNT(*) INTO table_row_count FROM dd_industries;
    total_rows := total_rows + table_row_count;

    SELECT COUNT(*) INTO table_row_count FROM dd_challenges;
    total_rows := total_rows + table_row_count;

    SELECT COUNT(*) INTO table_row_count FROM dd_company_rooms;
    total_rows := total_rows + table_row_count;

    SELECT COUNT(*) INTO table_row_count FROM dd_business_scenarios;
    total_rows := total_rows + table_row_count;

    RAISE NOTICE '';
    RAISE NOTICE '✅ The Decision Desk Tables Copied!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Created % dd_* tables', dd_count;
    RAISE NOTICE '   Sample rows: %', total_rows;
    RAISE NOTICE '   All UUIDs preserved';
    RAISE NOTICE '   Original cc_* tables intact';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables Copied:';
    RAISE NOTICE '   Core: industries, challenges, role_cards, synergies';
    RAISE NOTICE '   Sessions: game_sessions, executive_sessions, players';
    RAISE NOTICE '   Executive: company_rooms, scenarios, solutions, lens_effects';
    RAISE NOTICE '   Progress: player_progression, player_collections';
    RAISE NOTICE '   Other: daily_challenges, trading, AI cache';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '   → Add primary keys and indexes (Migration 052)';
    RAISE NOTICE '   → Add foreign keys (Migration 053)';
    RAISE NOTICE '   → Update Decision Desk code to use dd_* tables';
    RAISE NOTICE '   → Deprecate cc_* tables';
    RAISE NOTICE '';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
