-- ================================================================
-- FIND SAM'S SCORES - Where is the score coming from?
-- ================================================================

-- Sam's player_id from the table: d472ea4d-4174-432f-a273-ea213f2ebae4

-- 1. Check dd_executive_sessions (game sessions) for Sam's scores
SELECT
    'dd_executive_sessions (GAME SCORES)' as source_table,
    id as session_id,
    room_id,
    player_id,
    status,
    total_score,
    base_score,
    lens_multiplier,
    speed_bonus,
    created_at,
    completed_at
FROM dd_executive_sessions
WHERE player_id = 'd472ea4d-4174-432f-a273-ea213f2ebae4'
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check dd_game_session_players (lobby/leaderboard) for Sam's scores
SELECT
    'dd_game_session_players (LOBBY/LEADERBOARD)' as source_table,
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
WHERE player_id = 'd472ea4d-4174-432f-a273-ea213f2ebae4'
ORDER BY joined_at DESC;

-- 3. Show the mismatch - where scores exist vs where they should be
SELECT
    'SCORE LOCATION ANALYSIS' as analysis_type,
    es.id as executive_session_id,
    es.total_score as score_in_executive_sessions,
    gsp.id as game_session_player_id,
    gsp.current_score as score_in_game_session_players,
    es.room_id,
    es.status as session_status,
    CASE
        WHEN es.total_score IS NOT NULL AND gsp.current_score IS NULL THEN 'Score exists in dd_executive_sessions but NOT in dd_game_session_players'
        WHEN es.total_score IS NULL AND gsp.current_score IS NOT NULL THEN 'Score exists in dd_game_session_players but NOT in dd_executive_sessions'
        WHEN es.total_score IS NOT NULL AND gsp.current_score IS NOT NULL THEN 'Score exists in BOTH tables'
        ELSE 'Score missing from BOTH tables'
    END as score_location,
    es.completed_at
FROM dd_executive_sessions es
LEFT JOIN dd_game_session_players gsp
    ON gsp.player_id = es.player_id::text
    AND gsp.room_id = es.room_id
WHERE es.player_id = 'd472ea4d-4174-432f-a273-ea213f2ebae4'
    AND es.status = 'completed'
ORDER BY es.completed_at DESC
LIMIT 10;

-- 4. Check RLS policies on dd_game_session_players
SELECT
    'RLS POLICIES ON dd_game_session_players' as policy_info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'dd_game_session_players';

-- 5. Check if RLS is enabled
SELECT
    'RLS STATUS' as check_type,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'dd_game_session_players';

-- ================================================================
-- SUMMARY
-- ================================================================
-- This will show:
-- 1. Scores in dd_executive_sessions (where they ARE being written)
-- 2. Scores in dd_game_session_players (where they SHOULD be for leaderboard)
-- 3. Analysis of where scores exist vs where they're missing
-- 4. RLS policies that might be blocking the UPDATE
-- 5. Whether RLS is enabled on the table
-- ================================================================
