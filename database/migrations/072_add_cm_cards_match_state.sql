-- ================================================================
-- MIGRATION 072: Add match_state column to cm_cards
-- ================================================================
-- Adds a state machine field to track card match progression:
--   NULL/'' → Card is face-down (unflipped)
--   'M1'    → Card is flipped (waiting or unmatched)
--   'M2'    → Match detected (waiting to show checkmark)
--   'M3'    → Match persisted (show green checkmark in UI)
--
-- This separates UI state (match_state) from game logic (is_matched):
--   - match_state: Controls visual display and animations
--   - is_matched: Controls validation (prevents re-clicking matched cards)
-- ================================================================

-- Add match_state column
ALTER TABLE cm_cards
ADD COLUMN IF NOT EXISTS match_state VARCHAR(2) DEFAULT NULL
CHECK (match_state IS NULL OR match_state IN ('M1', 'M2', 'M3'));

-- Add index for querying by match state
CREATE INDEX IF NOT EXISTS idx_cm_cards_match_state
ON cm_cards(game_session_id, match_state)
WHERE match_state IS NOT NULL;

-- Add comment
COMMENT ON COLUMN cm_cards.match_state IS 'UI state machine: NULL=face-down, M1=flipped, M2=match-detected, M3=match-persisted';

-- Verification
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Migration 072: cm_cards.match_state added';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   State machine: NULL → M1 → M2 → M3';
    RAISE NOTICE '   NULL: Face-down (initial state)';
    RAISE NOTICE '   M1:   Flipped (waiting or unmatched)';
    RAISE NOTICE '   M2:   Match detected (waiting to persist)';
    RAISE NOTICE '   M3:   Match persisted (show checkmark)';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
