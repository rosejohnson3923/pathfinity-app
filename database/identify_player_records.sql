-- ================================================================
-- IDENTIFY WHICH PLAYER RECORD BELONGS TO SAM
-- ================================================================

-- Show the executive session and ALL the game_session_players it's joining to
SELECT
    'PLAYER IDENTIFICATION' as analysis,
    es.id as executive_session_id,
    es.player_id as executive_session_player_id,
    es.total_score as game_score,
    gsp.id as game_session_player_id,
    gsp.player_id as game_session_player_player_id,
    gsp.display_name,
    gsp.current_score,
    gsp.is_active,
    CASE
        WHEN gsp.player_id = es.player_id::text THEN 'MATCH - This is Sam'
        ELSE 'NO MATCH - This is NOT Sam'
    END as player_match
FROM dd_executive_sessions es
LEFT JOIN dd_game_session_players gsp
    ON gsp.room_id = es.room_id
WHERE es.id = '03d54f47-03df-4b7e-a879-e31b7b362762'  -- Sam's latest game
ORDER BY gsp.display_name;

-- ================================================================
-- This will show:
-- - Which game_session_player record actually belongs to Sam
-- - Which records belong to AI players
-- - Whether our UPDATE is targeting the correct player
-- ================================================================
