-- ================================================================
-- CHECK: Current card states for debugging
-- ================================================================

SELECT
    c.position,
    c.career_name,
    c.match_state,
    c.is_matched,
    c.matched_by_participant_id
FROM cm_cards c
WHERE c.game_session_id = '39633072-2848-4787-9067-3993d10f20f0'
ORDER BY c.position;

-- Show match_state distribution
SELECT
    match_state,
    COUNT(*) as count
FROM cm_cards
WHERE game_session_id = '39633072-2848-4787-9067-3993d10f20f0'
GROUP BY match_state
ORDER BY match_state NULLS FIRST;
