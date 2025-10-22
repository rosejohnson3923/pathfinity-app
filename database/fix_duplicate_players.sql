-- ================================================================
-- FIX DUPLICATE PLAYER RECORDS IN dd_game_session_players
-- ================================================================

-- STEP 1: Identify all duplicate player records per room
SELECT
    'DUPLICATES PER ROOM' as analysis,
    room_id,
    player_id,
    COUNT(*) as record_count,
    STRING_AGG(display_name, ', ') as display_names,
    STRING_AGG(id::text, ', ') as record_ids
FROM dd_game_session_players
WHERE is_active = true
GROUP BY room_id, player_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- STEP 2: For each duplicate, keep the ONE with the best display_name
-- This will show which records to KEEP vs DELETE
WITH ranked_players AS (
    SELECT
        id,
        room_id,
        player_id,
        display_name,
        current_score,
        joined_at,
        ROW_NUMBER() OVER (
            PARTITION BY room_id, player_id
            ORDER BY
                -- Prefer records with actual names over "Player"
                CASE WHEN display_name != 'Player' THEN 1 ELSE 2 END,
                -- Then prefer earliest joined
                joined_at ASC
        ) as row_num
    FROM dd_game_session_players
    WHERE is_active = true
)
SELECT
    'KEEP vs DELETE' as action,
    CASE WHEN row_num = 1 THEN 'KEEP' ELSE 'DELETE' END as action_type,
    id,
    player_id,
    display_name,
    current_score,
    joined_at
FROM ranked_players
WHERE (room_id, player_id) IN (
    SELECT room_id, player_id
    FROM dd_game_session_players
    WHERE is_active = true
    GROUP BY room_id, player_id
    HAVING COUNT(*) > 1
)
ORDER BY player_id, row_num;

-- ================================================================
-- MANUAL CLEANUP (RUN AFTER REVIEWING ABOVE RESULTS)
-- ================================================================

-- STEP 3: Delete duplicate records (keeping the one with best display_name)
-- UNCOMMENT TO EXECUTE:
/*
WITH ranked_players AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY room_id, player_id
            ORDER BY
                CASE WHEN display_name != 'Player' THEN 1 ELSE 2 END,
                joined_at ASC
        ) as row_num
    FROM dd_game_session_players
    WHERE is_active = true
)
DELETE FROM dd_game_session_players
WHERE id IN (
    SELECT id
    FROM ranked_players
    WHERE row_num > 1
);
*/

-- STEP 4: Add unique constraint to prevent future duplicates
-- UNCOMMENT TO EXECUTE:
/*
ALTER TABLE dd_game_session_players
DROP CONSTRAINT IF EXISTS unique_player_per_room_active;

ALTER TABLE dd_game_session_players
ADD CONSTRAINT unique_player_per_room_active
UNIQUE (room_id, player_id, is_active)
WHERE is_active = true;
*/

-- ================================================================
-- VERIFICATION
-- ================================================================

-- Check if duplicates still exist after cleanup
SELECT
    'VERIFICATION' as check,
    room_id,
    player_id,
    COUNT(*) as record_count
FROM dd_game_session_players
WHERE is_active = true
GROUP BY room_id, player_id
HAVING COUNT(*) > 1;

-- ================================================================
-- INSTRUCTIONS:
-- 1. Run STEP 1 & 2 to review duplicates
-- 2. Verify which records will be kept vs deleted
-- 3. Uncomment and run STEP 3 to delete duplicates
-- 4. Uncomment and run STEP 4 to prevent future duplicates
-- 5. Run VERIFICATION to confirm cleanup
-- ================================================================
