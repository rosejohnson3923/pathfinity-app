-- ================================================================
-- RESET specific game session: 39633072-2848-4787-9067-3993d10f20f0
-- ================================================================
-- This session has 9 matched cards from previous testing
-- Reset ALL cards to unmatched state
-- ================================================================

-- Reset all cards in this session to initial state
UPDATE cm_cards
SET
    match_state = NULL,
    is_matched = false,
    matched_by_participant_id = NULL,
    matched_at = NULL
WHERE game_session_id = '39633072-2848-4787-9067-3993d10f20f0';

-- Reset session state
UPDATE cm_game_sessions
SET
    pairs_remaining = 6,  -- Easy mode has 6 pairs (12 cards)
    first_card_flipped = NULL,
    second_card_flipped = NULL,
    current_turn_number = 1
WHERE id = '39633072-2848-4787-9067-3993d10f20f0';

-- Reset participant scores
UPDATE cm_session_participants
SET
    pairs_matched = 0,
    arcade_xp = 0,
    current_streak = 0,
    max_streak = 0
WHERE game_session_id = '39633072-2848-4787-9067-3993d10f20f0';

-- Verify
SELECT
    'Cards' as table_name,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE is_matched = true) as matched,
    COUNT(*) FILTER (WHERE match_state IS NULL) as null_state
FROM cm_cards
WHERE game_session_id = '39633072-2848-4787-9067-3993d10f20f0'
UNION ALL
SELECT
    'Session' as table_name,
    pairs_remaining as total,
    NULL as matched,
    NULL as null_state
FROM cm_game_sessions
WHERE id = '39633072-2848-4787-9067-3993d10f20f0';
