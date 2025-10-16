-- ================================================================
-- CAREER CHALLENGE COMPLETE VALIDATION SCRIPT
-- Run this to check if everything is properly set up
-- ================================================================

-- Clear previous results
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'CAREER CHALLENGE VALIDATION REPORT';
    RAISE NOTICE 'Generated: %', NOW();
    RAISE NOTICE '================================================================';
    RAISE NOTICE '';
END $$;

-- ================================================================
-- SECTION 1: TABLE EXISTENCE CHECK
-- ================================================================
DO $$
DECLARE
    table_count INTEGER := 0;
    missing_tables TEXT := '';
    existing_tables TEXT := '';
BEGIN
    RAISE NOTICE '📊 SECTION 1: TABLE VALIDATION';
    RAISE NOTICE '--------------------------------';

    -- Check each required table
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_industries') THEN
        table_count := table_count + 1;
        existing_tables := existing_tables || 'cc_industries, ';
    ELSE
        missing_tables := missing_tables || 'cc_industries, ';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_challenges') THEN
        table_count := table_count + 1;
        existing_tables := existing_tables || 'cc_challenges, ';
    ELSE
        missing_tables := missing_tables || 'cc_challenges, ';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_role_cards') THEN
        table_count := table_count + 1;
        existing_tables := existing_tables || 'cc_role_cards, ';
    ELSE
        missing_tables := missing_tables || 'cc_role_cards, ';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_synergies') THEN
        table_count := table_count + 1;
        existing_tables := existing_tables || 'cc_synergies, ';
    ELSE
        missing_tables := missing_tables || 'cc_synergies, ';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_player_collections') THEN
        table_count := table_count + 1;
        existing_tables := existing_tables || 'cc_player_collections, ';
    ELSE
        missing_tables := missing_tables || 'cc_player_collections, ';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_game_sessions') THEN
        table_count := table_count + 1;
        existing_tables := existing_tables || 'cc_game_sessions, ';
    ELSE
        missing_tables := missing_tables || 'cc_game_sessions, ';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_challenge_progress') THEN
        table_count := table_count + 1;
        existing_tables := existing_tables || 'cc_challenge_progress, ';
    ELSE
        missing_tables := missing_tables || 'cc_challenge_progress, ';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_trading_market') THEN
        table_count := table_count + 1;
        existing_tables := existing_tables || 'cc_trading_market, ';
    ELSE
        missing_tables := missing_tables || 'cc_trading_market, ';
    END IF;

    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_daily_challenges') THEN
        table_count := table_count + 1;
        existing_tables := existing_tables || 'cc_daily_challenges, ';
    ELSE
        missing_tables := missing_tables || 'cc_daily_challenges, ';
    END IF;

    -- Report results
    RAISE NOTICE 'Tables Found: %/9', table_count;

    IF table_count = 9 THEN
        RAISE NOTICE '✅ ALL TABLES EXIST!';
    ELSE
        RAISE NOTICE '❌ MISSING TABLES: %', TRIM(TRAILING ', ' FROM missing_tables);
        RAISE NOTICE '✅ Existing tables: %', TRIM(TRAILING ', ' FROM existing_tables);
    END IF;

    RAISE NOTICE '';
END $$;

-- ================================================================
-- SECTION 2: DATA VALIDATION
-- ================================================================
DO $$
DECLARE
    industry_count INTEGER;
    challenge_count INTEGER;
    role_count INTEGER;
    synergy_count INTEGER;
    daily_challenge_count INTEGER;
    rec RECORD;
BEGIN
    RAISE NOTICE '📈 SECTION 2: DATA VALIDATION';
    RAISE NOTICE '--------------------------------';

    -- Count industries
    SELECT COUNT(*) INTO industry_count FROM cc_industries;
    IF industry_count > 0 THEN
        RAISE NOTICE '✅ Industries: % found', industry_count;
        FOR rec IN SELECT code, name FROM cc_industries LIMIT 5 LOOP
            RAISE NOTICE '   - % (%)', rec.name, rec.code;
        END LOOP;
    ELSE
        RAISE NOTICE '❌ No industries found';
    END IF;

    -- Count challenges
    SELECT COUNT(*) INTO challenge_count FROM cc_challenges;
    IF challenge_count > 0 THEN
        RAISE NOTICE '✅ Challenges: % found', challenge_count;
    ELSE
        RAISE NOTICE '❌ No challenges found';
    END IF;

    -- Count role cards
    SELECT COUNT(*) INTO role_count FROM cc_role_cards;
    IF role_count > 0 THEN
        RAISE NOTICE '✅ Role Cards: % found', role_count;
    ELSE
        RAISE NOTICE '❌ No role cards found';
    END IF;

    -- Count synergies
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'cc_synergies') THEN
        SELECT COUNT(*) INTO synergy_count FROM cc_synergies;
        IF synergy_count > 0 THEN
            RAISE NOTICE '✅ Synergies: % found', synergy_count;
        ELSE
            RAISE NOTICE '⚠️  No synergies defined (optional but recommended)';
        END IF;
    ELSE
        RAISE NOTICE '❌ Synergies table missing';
    END IF;

    -- Count daily challenges
    SELECT COUNT(*) INTO daily_challenge_count FROM cc_daily_challenges;
    IF daily_challenge_count > 0 THEN
        RAISE NOTICE '✅ Daily Challenges: % found', daily_challenge_count;
    ELSE
        RAISE NOTICE '⚠️  No daily challenges (optional)';
    END IF;

    RAISE NOTICE '';
END $$;

-- ================================================================
-- SECTION 3: RELATIONSHIP VALIDATION
-- ================================================================
DO $$
DECLARE
    orphan_challenges INTEGER;
    orphan_roles INTEGER;
    orphan_synergies INTEGER;
BEGIN
    RAISE NOTICE '🔗 SECTION 3: RELATIONSHIP VALIDATION';
    RAISE NOTICE '--------------------------------';

    -- Check for orphaned challenges
    SELECT COUNT(*) INTO orphan_challenges
    FROM cc_challenges c
    WHERE NOT EXISTS (SELECT 1 FROM cc_industries i WHERE i.id = c.industry_id);

    IF orphan_challenges = 0 THEN
        RAISE NOTICE '✅ All challenges linked to industries';
    ELSE
        RAISE NOTICE '❌ Found % orphaned challenges', orphan_challenges;
    END IF;

    -- Check for orphaned role cards
    SELECT COUNT(*) INTO orphan_roles
    FROM cc_role_cards r
    WHERE NOT EXISTS (SELECT 1 FROM cc_industries i WHERE i.id = r.industry_id);

    IF orphan_roles = 0 THEN
        RAISE NOTICE '✅ All role cards linked to industries';
    ELSE
        RAISE NOTICE '❌ Found % orphaned role cards', orphan_roles;
    END IF;

    -- Check synergies if table exists
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'cc_synergies') THEN
        SELECT COUNT(*) INTO orphan_synergies
        FROM cc_synergies s
        WHERE NOT EXISTS (SELECT 1 FROM cc_industries i WHERE i.id = s.industry_id);

        IF orphan_synergies = 0 THEN
            RAISE NOTICE '✅ All synergies linked to industries';
        ELSE
            RAISE NOTICE '❌ Found % orphaned synergies', orphan_synergies;
        END IF;
    END IF;

    RAISE NOTICE '';
END $$;

-- ================================================================
-- SECTION 4: INDEX VALIDATION
-- ================================================================
DO $$
DECLARE
    index_count INTEGER;
    missing_indexes TEXT := '';
BEGIN
    RAISE NOTICE '⚡ SECTION 4: PERFORMANCE (INDEXES)';
    RAISE NOTICE '--------------------------------';

    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_cc_%';

    RAISE NOTICE 'Found % Career Challenge indexes', index_count;

    -- Check critical indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cc_challenges_industry') THEN
        missing_indexes := missing_indexes || 'idx_cc_challenges_industry, ';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cc_role_cards_industry') THEN
        missing_indexes := missing_indexes || 'idx_cc_role_cards_industry, ';
    END IF;

    IF missing_indexes = '' THEN
        RAISE NOTICE '✅ Critical indexes exist';
    ELSE
        RAISE NOTICE '⚠️  Missing indexes: %', TRIM(TRAILING ', ' FROM missing_indexes);
    END IF;

    RAISE NOTICE '';
END $$;

-- ================================================================
-- SECTION 5: RLS POLICY CHECK
-- ================================================================
DO $$
DECLARE
    rls_enabled_count INTEGER;
BEGIN
    RAISE NOTICE '🔒 SECTION 5: SECURITY (RLS)';
    RAISE NOTICE '--------------------------------';

    SELECT COUNT(*) INTO rls_enabled_count
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
    AND t.tablename LIKE 'cc_%'
    AND c.relrowsecurity = true;

    RAISE NOTICE 'RLS enabled on %/9 tables', rls_enabled_count;

    IF rls_enabled_count < 9 THEN
        RAISE NOTICE '⚠️  Some tables lack RLS. Consider enabling for security.';
    ELSE
        RAISE NOTICE '✅ All tables have RLS enabled';
    END IF;

    RAISE NOTICE '';
END $$;

-- ================================================================
-- SECTION 6: GAME READINESS CHECK
-- ================================================================
DO $$
DECLARE
    can_play_esports BOOLEAN := false;
    can_play_healthcare BOOLEAN := false;
    can_play_construction BOOLEAN := false;
    esports_challenges INTEGER;
    esports_roles INTEGER;
BEGIN
    RAISE NOTICE '🎮 SECTION 6: GAME READINESS';
    RAISE NOTICE '--------------------------------';

    -- Check Esports readiness
    SELECT COUNT(*) INTO esports_challenges
    FROM cc_challenges c
    JOIN cc_industries i ON i.id = c.industry_id
    WHERE i.code = 'esports';

    SELECT COUNT(*) INTO esports_roles
    FROM cc_role_cards r
    JOIN cc_industries i ON i.id = r.industry_id
    WHERE i.code = 'esports';

    IF esports_challenges > 0 AND esports_roles >= 3 THEN
        can_play_esports := true;
        RAISE NOTICE '✅ Esports: READY (% challenges, % roles)', esports_challenges, esports_roles;
    ELSE
        RAISE NOTICE '❌ Esports: NOT READY (% challenges, % roles)', esports_challenges, esports_roles;
    END IF;

    -- Quick check other industries
    RAISE NOTICE '';
    RAISE NOTICE 'Minimum requirements for play:';
    RAISE NOTICE '  - At least 1 industry with:';
    RAISE NOTICE '    • 1+ challenges';
    RAISE NOTICE '    • 3+ role cards';
    RAISE NOTICE '  - cc_game_sessions table (for multiplayer)';

    RAISE NOTICE '';
END $$;

-- ================================================================
-- FINAL SUMMARY
-- ================================================================
DO $$
DECLARE
    table_count INTEGER;
    ready_status TEXT;
BEGIN
    RAISE NOTICE '================================================================';
    RAISE NOTICE '📋 FINAL SUMMARY';
    RAISE NOTICE '================================================================';

    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN (
        'cc_industries', 'cc_challenges', 'cc_role_cards',
        'cc_synergies', 'cc_player_collections', 'cc_game_sessions',
        'cc_challenge_progress', 'cc_trading_market', 'cc_daily_challenges'
    );

    IF table_count = 9 THEN
        ready_status := '✅ READY FOR TESTING';
    ELSIF table_count >= 5 THEN
        ready_status := '⚠️  PARTIALLY READY (missing some tables)';
    ELSE
        ready_status := '❌ NOT READY (missing critical tables)';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE 'Status: %', ready_status;
    RAISE NOTICE 'Tables: %/9', table_count;
    RAISE NOTICE '';

    IF table_count < 9 THEN
        RAISE NOTICE 'To fix missing tables, run:';
        RAISE NOTICE '  career_challenge_safe_migration.sql';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'END OF VALIDATION REPORT';
    RAISE NOTICE '================================================================';
END $$;

-- ================================================================
-- DETAILED TABLE STATUS (Visual Output)
-- ================================================================
SELECT
    'Table Status' as category,
    COUNT(*) FILTER (WHERE exists) as found,
    COUNT(*) FILTER (WHERE NOT exists) as missing,
    COUNT(*) as total
FROM (
    SELECT
        table_name,
        EXISTS (
            SELECT FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename = table_name
        ) as exists
    FROM (VALUES
        ('cc_industries'),
        ('cc_challenges'),
        ('cc_role_cards'),
        ('cc_synergies'),
        ('cc_player_collections'),
        ('cc_game_sessions'),
        ('cc_challenge_progress'),
        ('cc_trading_market'),
        ('cc_daily_challenges')
    ) AS required(table_name)
) t

UNION ALL

SELECT
    'Data Status' as category,
    CASE
        WHEN COUNT(*) > 0 THEN COUNT(*)
        ELSE 0
    END as found,
    CASE
        WHEN COUNT(*) = 0 THEN 1
        ELSE 0
    END as missing,
    1 as total
FROM cc_industries

UNION ALL

SELECT
    'Game Ready' as category,
    CASE
        WHEN (
            SELECT COUNT(*) FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename IN ('cc_industries', 'cc_challenges', 'cc_role_cards')
        ) = 3 THEN 1 ELSE 0
    END as found,
    CASE
        WHEN (
            SELECT COUNT(*) FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename IN ('cc_industries', 'cc_challenges', 'cc_role_cards')
        ) < 3 THEN 1 ELSE 0
    END as missing,
    1 as total;

-- ================================================================
-- QUICK FIX GENERATOR
-- ================================================================
SELECT
    CASE
        WHEN NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_synergies')
        THEN 'Run: CREATE TABLE cc_synergies (see migration script)'
        WHEN NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_game_sessions')
        THEN 'Run: CREATE TABLE cc_game_sessions (see migration script)'
        WHEN NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_challenge_progress')
        THEN 'Run: CREATE TABLE cc_challenge_progress (see migration script)'
        WHEN NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_trading_market')
        THEN 'Run: CREATE TABLE cc_trading_market (see migration script)'
        ELSE '✅ All tables exist!'
    END as next_action;