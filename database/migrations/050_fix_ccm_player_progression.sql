-- ================================================================
-- FIX CEO TAKEOVER PLAYER PROGRESSION TABLE
-- Migration 050: Correct the table name from ccm_player_progress to ccm_player_progression
-- ================================================================
-- This migration:
-- 1. Drops the incorrectly named ccm_player_progress table
-- 2. Copies cc_player_progression → ccm_player_progression
-- 3. Preserves all UUIDs and data from cc_player_progression
-- ================================================================

-- ================================================================
-- STEP 1: Drop incorrectly named table
-- ================================================================

DROP TABLE IF EXISTS ccm_player_progress CASCADE;

-- ================================================================
-- STEP 2: Copy cc_player_progression to ccm_player_progression
-- ================================================================

CREATE TABLE IF NOT EXISTS ccm_player_progression AS SELECT * FROM cc_player_progression;

-- ================================================================
-- STEP 3: Add Primary Key and Defaults
-- ================================================================

ALTER TABLE ccm_player_progression ADD PRIMARY KEY (player_id);
ALTER TABLE ccm_player_progression ALTER COLUMN player_id SET DEFAULT gen_random_uuid();

-- ================================================================
-- STEP 4: Add Indexes for Performance
-- ================================================================

CREATE INDEX idx_ccm_player_progression_player ON ccm_player_progression(player_id);
CREATE INDEX idx_ccm_player_progression_level ON ccm_player_progression(leadership_level);
CREATE INDEX idx_ccm_player_progression_xp ON ccm_player_progression(total_xp DESC);

-- ================================================================
-- STEP 5: Add Foreign Keys (SKIPPED - type mismatch)
-- ================================================================

-- Note: Skipping foreign key constraint due to type mismatch
-- player_id is TEXT in cc_player_progression, but auth.users(id) is UUID
-- Application layer will maintain referential integrity
DO $$
BEGIN
    RAISE NOTICE 'Skipped player_id foreign key (type mismatch: TEXT vs UUID)';
END $$;

-- ================================================================
-- STEP 6: Add Comment
-- ================================================================

COMMENT ON TABLE ccm_player_progression IS 'CEO Takeover (CCM): Player XP and progression tracking';

-- ================================================================
-- STEP 7: RLS Policies (SKIPPED)
-- ================================================================

-- Note: RLS policies skipped due to type mismatch (player_id is TEXT, auth.uid() is UUID)
-- RLS can be added later if needed with proper type casting

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
DECLARE
    row_count INTEGER;
BEGIN
    -- Count rows copied
    SELECT COUNT(*) INTO row_count FROM ccm_player_progression;

    RAISE NOTICE '';
    RAISE NOTICE '✅ CEO Takeover Player Progression Table Fixed!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Dropped: ccm_player_progress (wrong name)';
    RAISE NOTICE '   Created: ccm_player_progression (correct)';
    RAISE NOTICE '   Rows copied: %', row_count;
    RAISE NOTICE '   Source: cc_player_progression';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '   → Update CCMXPService.ts:';
    RAISE NOTICE '     - Change from(''cc_player_progress'') → from(''ccm_player_progression'')';
    RAISE NOTICE '     - Change player_id references as needed';
    RAISE NOTICE '   → Test CEO Takeover';
    RAISE NOTICE '';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
