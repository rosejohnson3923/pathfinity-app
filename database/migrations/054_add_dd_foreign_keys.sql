-- ================================================================
-- ADD FOREIGN KEYS FOR DECISION DESK TABLES
-- Migration 054: Add essential foreign keys for dd_* tables
-- ================================================================
-- These foreign keys enable Supabase join syntax and maintain referential integrity
-- ================================================================

-- ================================================================
-- STEP 1: Add Primary Keys
-- ================================================================

DO $$
BEGIN
    -- Core tables
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dd_industries_pkey') THEN
        ALTER TABLE dd_industries ADD PRIMARY KEY (id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dd_challenges_pkey') THEN
        ALTER TABLE dd_challenges ADD PRIMARY KEY (id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dd_role_cards_pkey') THEN
        ALTER TABLE dd_role_cards ADD PRIMARY KEY (id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dd_synergies_pkey') THEN
        ALTER TABLE dd_synergies ADD PRIMARY KEY (id);
    END IF;

    -- Session tables
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dd_game_sessions_pkey') THEN
        ALTER TABLE dd_game_sessions ADD PRIMARY KEY (id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dd_executive_sessions_pkey') THEN
        ALTER TABLE dd_executive_sessions ADD PRIMARY KEY (id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dd_game_session_players_pkey') THEN
        ALTER TABLE dd_game_session_players ADD PRIMARY KEY (id);
    END IF;

    -- Executive Decision tables
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dd_company_rooms_pkey') THEN
        ALTER TABLE dd_company_rooms ADD PRIMARY KEY (id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dd_business_scenarios_pkey') THEN
        ALTER TABLE dd_business_scenarios ADD PRIMARY KEY (id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dd_solution_cards_pkey') THEN
        ALTER TABLE dd_solution_cards ADD PRIMARY KEY (id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dd_lens_effects_pkey') THEN
        ALTER TABLE dd_lens_effects ADD PRIMARY KEY (id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dd_leadership_scores_pkey') THEN
        ALTER TABLE dd_leadership_scores ADD PRIMARY KEY (id);
    END IF;

    -- Other tables
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dd_daily_challenges_pkey') THEN
        ALTER TABLE dd_daily_challenges ADD PRIMARY KEY (id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dd_ai_content_cache_pkey') THEN
        ALTER TABLE dd_ai_content_cache ADD PRIMARY KEY (id);
    END IF;

    RAISE NOTICE 'Primary keys added to dd_* tables';
END $$;

-- ================================================================
-- STEP 2: Add Foreign Keys for Company Rooms
-- ================================================================

-- Link company rooms to industries
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'dd_company_rooms_industry_id_fkey'
    ) THEN
        ALTER TABLE dd_company_rooms
        ADD CONSTRAINT dd_company_rooms_industry_id_fkey
        FOREIGN KEY (industry_id)
        REFERENCES dd_industries(id);

        RAISE NOTICE 'Added foreign key: dd_company_rooms -> dd_industries';
    END IF;
END $$;

-- ================================================================
-- STEP 3: Add Foreign Keys for Challenges
-- ================================================================

-- Link challenges to industries
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'dd_challenges_industry_id_fkey'
    ) THEN
        ALTER TABLE dd_challenges
        ADD CONSTRAINT dd_challenges_industry_id_fkey
        FOREIGN KEY (industry_id)
        REFERENCES dd_industries(id);

        RAISE NOTICE 'Added foreign key: dd_challenges -> dd_industries';
    END IF;
END $$;

-- ================================================================
-- STEP 4: Add Foreign Keys for Role Cards
-- ================================================================

-- Link role cards to industries (if column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'dd_role_cards' AND column_name = 'industry_id'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'dd_role_cards_industry_id_fkey'
        ) THEN
            ALTER TABLE dd_role_cards
            ADD CONSTRAINT dd_role_cards_industry_id_fkey
            FOREIGN KEY (industry_id)
            REFERENCES dd_industries(id);

            RAISE NOTICE 'Added foreign key: dd_role_cards -> dd_industries';
        END IF;
    END IF;
END $$;

-- ================================================================
-- STEP 5: Add Foreign Keys for Game Sessions
-- ================================================================

-- Link executive sessions to company rooms
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'dd_executive_sessions_room_id_fkey'
    ) THEN
        ALTER TABLE dd_executive_sessions
        ADD CONSTRAINT dd_executive_sessions_room_id_fkey
        FOREIGN KEY (room_id)
        REFERENCES dd_company_rooms(id)
        ON DELETE CASCADE;

        RAISE NOTICE 'Added foreign key: dd_executive_sessions -> dd_company_rooms';
    END IF;
END $$;

-- ================================================================
-- STEP 6: Add Foreign Keys for Session Players
-- ================================================================

-- Link game session players to executive sessions
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'dd_game_session_players' AND column_name = 'executive_session_id'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'dd_game_session_players_executive_session_id_fkey'
        ) THEN
            ALTER TABLE dd_game_session_players
            ADD CONSTRAINT dd_game_session_players_executive_session_id_fkey
            FOREIGN KEY (executive_session_id)
            REFERENCES dd_executive_sessions(id)
            ON DELETE CASCADE;

            RAISE NOTICE 'Added foreign key: dd_game_session_players -> dd_executive_sessions';
        END IF;
    END IF;
END $$;

-- Link game session players to game sessions (if column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'dd_game_session_players' AND column_name = 'game_session_id'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'dd_game_session_players_game_session_id_fkey'
        ) THEN
            ALTER TABLE dd_game_session_players
            ADD CONSTRAINT dd_game_session_players_game_session_id_fkey
            FOREIGN KEY (game_session_id)
            REFERENCES dd_game_sessions(id)
            ON DELETE CASCADE;

            RAISE NOTICE 'Added foreign key: dd_game_session_players -> dd_game_sessions';
        END IF;
    END IF;
END $$;

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    -- Count foreign key constraints on dd_* tables
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND constraint_type = 'FOREIGN KEY'
      AND table_name LIKE 'dd_%';

    RAISE NOTICE '';
    RAISE NOTICE '✅ Decision Desk Foreign Keys Added!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Total foreign keys on dd_* tables: %', fk_count;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Key Relationships Created:';
    RAISE NOTICE '   ✓ dd_company_rooms → dd_industries';
    RAISE NOTICE '   ✓ dd_challenges → dd_industries';
    RAISE NOTICE '   ✓ dd_executive_sessions → dd_company_rooms';
    RAISE NOTICE '   ✓ dd_game_session_players → dd_executive_sessions';
    RAISE NOTICE '';
    RAISE NOTICE 'Now Supabase joins like dd_industries(*) will work!';
    RAISE NOTICE '';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
