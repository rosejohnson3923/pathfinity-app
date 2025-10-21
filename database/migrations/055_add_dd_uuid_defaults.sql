-- ================================================================
-- ADD UUID DEFAULT VALUES FOR DECISION DESK TABLES
-- Migration 055: Add gen_random_uuid() defaults for id columns
-- ================================================================
-- When tables were copied with CREATE TABLE AS SELECT, default values
-- were not copied. This migration adds them back.
-- ================================================================

-- ================================================================
-- STEP 1: Add UUID defaults to all dd_* table id columns
-- ================================================================

DO $$
BEGIN
    -- Core tables
    ALTER TABLE dd_industries
        ALTER COLUMN id SET DEFAULT gen_random_uuid();

    ALTER TABLE dd_challenges
        ALTER COLUMN id SET DEFAULT gen_random_uuid();

    ALTER TABLE dd_role_cards
        ALTER COLUMN id SET DEFAULT gen_random_uuid();

    ALTER TABLE dd_synergies
        ALTER COLUMN id SET DEFAULT gen_random_uuid();

    -- Session tables
    ALTER TABLE dd_game_sessions
        ALTER COLUMN id SET DEFAULT gen_random_uuid();

    ALTER TABLE dd_executive_sessions
        ALTER COLUMN id SET DEFAULT gen_random_uuid();

    ALTER TABLE dd_game_session_players
        ALTER COLUMN id SET DEFAULT gen_random_uuid();

    -- Executive Decision tables
    ALTER TABLE dd_company_rooms
        ALTER COLUMN id SET DEFAULT gen_random_uuid();

    ALTER TABLE dd_business_scenarios
        ALTER COLUMN id SET DEFAULT gen_random_uuid();

    ALTER TABLE dd_solution_cards
        ALTER COLUMN id SET DEFAULT gen_random_uuid();

    ALTER TABLE dd_lens_effects
        ALTER COLUMN id SET DEFAULT gen_random_uuid();

    ALTER TABLE dd_leadership_scores
        ALTER COLUMN id SET DEFAULT gen_random_uuid();

    -- Other tables
    ALTER TABLE dd_daily_challenges
        ALTER COLUMN id SET DEFAULT gen_random_uuid();

    ALTER TABLE dd_ai_content_cache
        ALTER COLUMN id SET DEFAULT gen_random_uuid();

    RAISE NOTICE 'UUID defaults added to all dd_* table id columns';
END $$;

-- ================================================================
-- STEP 2: Add timestamp defaults if needed
-- ================================================================

DO $$
BEGIN
    -- Add created_at defaults where they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'dd_executive_sessions' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE dd_executive_sessions
            ALTER COLUMN created_at SET DEFAULT NOW();
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'dd_game_sessions' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE dd_game_sessions
            ALTER COLUMN created_at SET DEFAULT NOW();
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'dd_game_session_players' AND column_name = 'joined_at'
    ) THEN
        ALTER TABLE dd_game_session_players
            ALTER COLUMN joined_at SET DEFAULT NOW();
    END IF;

    RAISE NOTICE 'Timestamp defaults added where applicable';
END $$;

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
DECLARE
    default_count INTEGER;
BEGIN
    -- Count columns with uuid defaults
    SELECT COUNT(*) INTO default_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name LIKE 'dd_%'
      AND column_name = 'id'
      AND column_default LIKE '%gen_random_uuid%';

    RAISE NOTICE '';
    RAISE NOTICE '✅ Decision Desk UUID Defaults Added!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Tables with UUID defaults: %', default_count;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Now INSERT statements without id will auto-generate UUIDs!';
    RAISE NOTICE '';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
