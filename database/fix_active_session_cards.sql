-- ================================================================
-- FIX: Reset cards for ACTIVE game sessions
-- ================================================================
-- This fixes cards that are stuck in M3 state for active games
-- Completed games should keep their M3 cards as-is
-- ================================================================

-- Show current state
SELECT
    gs.id as session_id,
    gs.status,
    COUNT(*) as total_cards,
    COUNT(*) FILTER (WHERE c.match_state = 'M3') as m3_cards,
    COUNT(*) FILTER (WHERE c.match_state IS NULL) as null_cards,
    COUNT(*) FILTER (WHERE c.is_matched = true) as matched_cards
FROM cm_game_sessions gs
LEFT JOIN cm_cards c ON c.game_session_id = gs.id
WHERE gs.status = 'active'
GROUP BY gs.id, gs.status;

-- Reset cards for ACTIVE sessions to initial state (NULL)
-- Keep matched cards, but reset their state based on is_matched flag
UPDATE cm_cards c
SET match_state = CASE
    WHEN c.is_matched = true THEN 'M3'
    ELSE NULL
END
FROM cm_game_sessions gs
WHERE c.game_session_id = gs.id
  AND gs.status = 'active';

-- Verify after fix
SELECT
    gs.id as session_id,
    gs.status,
    COUNT(*) as total_cards,
    COUNT(*) FILTER (WHERE c.match_state = 'M3') as m3_cards,
    COUNT(*) FILTER (WHERE c.match_state IS NULL) as null_cards,
    COUNT(*) FILTER (WHERE c.is_matched = true) as matched_cards
FROM cm_game_sessions gs
LEFT JOIN cm_cards c ON c.game_session_id = gs.id
WHERE gs.status = 'active'
GROUP BY gs.id, gs.status;
