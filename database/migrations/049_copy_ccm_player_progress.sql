-- ================================================================
-- CREATE CEO TAKEOVER PLAYER PROGRESS TABLE: ccm_player_progress
-- Migration 049: Separate CEO Takeover from Executive Decision
-- ================================================================
-- This migration CREATES ccm_player_progress as a fresh table
-- Note: cc_player_progress has been deprecated/renamed
-- This gives CEO Takeover its own independent player progress tracking
-- ================================================================

-- ================================================================
-- STEP 1: Create Table (fresh start for CEO Takeover)
-- ================================================================
-- Note: cc_player_progress has been deprecated/renamed
-- We create a fresh ccm_player_progress table for CEO Takeover

CREATE TABLE IF NOT EXISTS ccm_player_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,

    -- Overall statistics
    total_challenges_attempted INTEGER DEFAULT 0,
    total_challenges_succeeded INTEGER DEFAULT 0,
    total_challenges_perfect INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2),

    -- Collection stats
    total_cards_collected INTEGER DEFAULT 0,
    unique_cards_collected INTEGER DEFAULT 0,
    rarest_card_rarity VARCHAR(20),
    favorite_industry_id UUID,

    -- Experience and level
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    xp_to_next_level INTEGER DEFAULT 100,
    prestige_level INTEGER DEFAULT 0,

    -- Achievements and unlocks
    achievements_earned TEXT[],
    industries_unlocked TEXT[],
    special_cards_unlocked TEXT[],
    titles_earned TEXT[],

    -- Gameplay preferences
    preferred_team_size INTEGER,
    favorite_role_cards TEXT[], -- Top 5 most used

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- STEP 2: Add Indexes for Performance
-- ================================================================

CREATE INDEX idx_ccm_player_progress_user ON ccm_player_progress(user_id);
CREATE INDEX idx_ccm_player_progress_level ON ccm_player_progress(level);
CREATE INDEX idx_ccm_player_progress_xp ON ccm_player_progress(total_xp DESC);

-- ================================================================
-- STEP 3: Add Foreign Keys (if needed)
-- ================================================================

-- Note: user_id references auth.users
DO $$
BEGIN
    -- Add foreign key for user_id if auth.users table exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
        ALTER TABLE ccm_player_progress
        ADD CONSTRAINT ccm_player_progress_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;

        RAISE NOTICE 'Added user_id foreign key to ccm_player_progress';
    ELSE
        RAISE NOTICE 'Skipped user_id foreign key (auth.users table not found)';
    END IF;
END $$;

-- ================================================================
-- STEP 4: Add Comment
-- ================================================================

COMMENT ON TABLE ccm_player_progress IS 'CEO Takeover (CCM): Player XP and progression tracking';

-- ================================================================
-- STEP 5: Enable RLS
-- ================================================================

ALTER TABLE ccm_player_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own progress
CREATE POLICY "ccm_player_progress_select_policy" ON ccm_player_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can insert their own progress
CREATE POLICY "ccm_player_progress_insert_policy" ON ccm_player_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own progress
CREATE POLICY "ccm_player_progress_update_policy" ON ccm_player_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ CEO Takeover Player Progress Table Created!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Table: ccm_player_progress';
    RAISE NOTICE '   Status: Fresh table created';
    RAISE NOTICE '   Source: New schema (cc_player_progress deprecated)';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Features:';
    RAISE NOTICE '   ✓ XP and level tracking';
    RAISE NOTICE '   ✓ Challenge statistics';
    RAISE NOTICE '   ✓ Card collection tracking';
    RAISE NOTICE '   ✓ Achievements and unlocks';
    RAISE NOTICE '   ✓ RLS policies enabled';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '   → Update CCMXPService.ts to use ccm_player_progress';
    RAISE NOTICE '   → Test CEO Takeover';
    RAISE NOTICE '   → CEO Takeover will be fully independent!';
    RAISE NOTICE '';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
