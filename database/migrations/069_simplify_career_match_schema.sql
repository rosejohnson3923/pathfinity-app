-- Migration: Simplify Career Match Schema for Clean 4-State Architecture
-- Remove complex timing logic, setTimeout workarounds, and race condition bandaids
-- Cards only track: is_matched (persisted state)
-- Session only tracks: first_card_flipped (temporary state)

-- ============================================================================
-- STEP 1: Clean up cm_game_sessions table
-- ============================================================================

-- Remove timing-related columns we don't need
ALTER TABLE cm_game_sessions
DROP COLUMN IF EXISTS first_card_flipped_at,
DROP COLUMN IF EXISTS reveal_phase_until;

-- first_card_flipped stays - just tracks position number during turn

COMMENT ON COLUMN cm_game_sessions.first_card_flipped IS 'Position of first card flipped in current turn (null if no card flipped yet)';

-- ============================================================================
-- STEP 2: Simplify cm_cards table
-- ============================================================================

-- Remove is_revealed column - this is now frontend-only state
-- Frontend determines visual state from: is_matched + current flip positions
ALTER TABLE cm_cards
DROP COLUMN IF EXISTS is_revealed;

-- Cards only need to track if they're permanently matched
COMMENT ON COLUMN cm_cards.is_matched IS 'TRUE if card has been successfully matched (permanent state)';

-- ============================================================================
-- STEP 3: Update indexes for performance
-- ============================================================================

-- Add index on game_session_id + is_matched for quick queries
CREATE INDEX IF NOT EXISTS idx_cm_cards_session_matched
ON cm_cards(game_session_id, is_matched);

-- ============================================================================
-- COMPLETE
-- ============================================================================

-- Schema is now clean and simple:
-- - Cards track ONLY permanent match state
-- - Session tracks ONLY temporary first-flip state
-- - Frontend controls all visual timing via 4-state state machine
