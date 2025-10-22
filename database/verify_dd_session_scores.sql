-- ================================================================
-- VERIFY DD_GAME_SESSION_PLAYERS SCORES
-- Script to check if scores are being written to the database
-- ================================================================

-- 1. Check table structure to confirm columns exist
SELECT
    'TABLE STRUCTURE' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'dd_game_session_players'
    AND column_name IN ('current_score', 'last_action_at', 'last_active_at', 'room_id', 'session_id', 'player_id')
ORDER BY ordinal_position;

-- 2. Show all active players in dd_game_session_players with their scores
SELECT
    'ACTIVE PLAYERS' as check_type,
    id,
    session_id,
    room_id,
    player_id,
    display_name,
    current_score,
    is_active,
    last_action_at,
    joined_at
FROM dd_game_session_players
WHERE is_active = true
ORDER BY current_score DESC NULLS LAST, display_name;

-- 3. Show completed game sessions with scores
SELECT
    'COMPLETED SESSIONS' as check_type,
    id,
    room_id,
    player_id,
    status,
    total_score,
    completed_at,
    created_at
FROM dd_executive_sessions
WHERE status = 'completed'
ORDER BY completed_at DESC
LIMIT 10;

-- 4. Join sessions with players to see the mismatch
SELECT
    'SESSION vs PLAYER SCORES' as check_type,
    es.id as session_id,
    es.room_id,
    es.player_id,
    es.total_score as session_score,
    gsp.current_score as player_score,
    gsp.display_name,
    gsp.is_active,
    es.status as session_status,
    es.completed_at
FROM dd_executive_sessions es
LEFT JOIN dd_game_session_players gsp
    ON gsp.player_id = es.player_id::text
    AND gsp.room_id = es.room_id
    AND gsp.is_active = true
WHERE es.status = 'completed'
ORDER BY es.completed_at DESC
LIMIT 10;

-- 5. Count mismatches between session scores and player scores
SELECT
    'SCORE MISMATCHES' as check_type,
    COUNT(*) as total_completed_sessions,
    COUNT(CASE WHEN gsp.id IS NULL THEN 1 END) as missing_player_records,
    COUNT(CASE WHEN es.total_score != COALESCE(gsp.current_score, 0) THEN 1 END) as score_mismatches,
    COUNT(CASE WHEN es.total_score = gsp.current_score THEN 1 END) as score_matches
FROM dd_executive_sessions es
LEFT JOIN dd_game_session_players gsp
    ON gsp.player_id = es.player_id::text
    AND gsp.room_id = es.room_id
    AND gsp.is_active = true
WHERE es.status = 'completed'
    AND es.completed_at > NOW() - INTERVAL '1 day';

-- 6. Show recent updates to dd_game_session_players
SELECT
    'RECENT UPDATES' as check_type,
    id,
    player_id,
    display_name,
    current_score,
    last_action_at,
    joined_at
FROM dd_game_session_players
WHERE is_active = true
ORDER BY joined_at DESC
LIMIT 10;

-- ================================================================
-- SUMMARY
-- ================================================================
-- Expected Results:
-- 1. TABLE STRUCTURE should show current_score, last_action_at, room_id exist
-- 2. ACTIVE PLAYERS should show non-zero current_score values
-- 3. COMPLETED SESSIONS should show total_score values
-- 4. SESSION vs PLAYER SCORES should show matching scores
-- 5. SCORE MISMATCHES should show mostly matches
-- 6. RECENT UPDATES should show updated_at timestamps after game completion
-- ================================================================
