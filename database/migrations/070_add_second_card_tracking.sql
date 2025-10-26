-- Migration: Add Second Card Tracking for Visual State Machine
-- Purpose: Track both cards in a turn so all players can see both flips before match/mismatch

ALTER TABLE cm_game_sessions
ADD COLUMN IF NOT EXISTS second_card_flipped INTEGER DEFAULT NULL;

COMMENT ON COLUMN cm_game_sessions.second_card_flipped IS 'Position of second card flipped in current turn (null if only one card flipped)';

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_cm_sessions_card_tracking
ON cm_game_sessions(first_card_flipped, second_card_flipped)
WHERE first_card_flipped IS NOT NULL OR second_card_flipped IS NOT NULL;
