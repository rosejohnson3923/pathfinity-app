-- ================================================================
-- Career Challenge Test Data Cleanup Script
-- Run this to clean up test sessions and allow fresh testing
-- ================================================================

-- Show current test sessions
SELECT
    'Current Test Sessions' as info,
    COUNT(*) as count,
    STRING_AGG(room_code, ', ') as room_codes
FROM cc_game_sessions
WHERE room_code LIKE 'TEST%' OR room_code LIKE 'STRESS%';

-- Clean up old test sessions (older than 1 hour)
DELETE FROM cc_game_sessions
WHERE (room_code LIKE 'TEST%' OR room_code LIKE 'STRESS%')
AND created_at < NOW() - INTERVAL '1 hour';

-- Or if you want to clean ALL test sessions:
-- DELETE FROM cc_game_sessions WHERE room_code LIKE 'TEST%' OR room_code LIKE 'STRESS%';

-- Show remaining sessions
SELECT
    room_code,
    status,
    created_at,
    host_player_id
FROM cc_game_sessions
ORDER BY created_at DESC
LIMIT 10;

-- Verify cleanup
DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_count
    FROM cc_game_sessions
    WHERE room_code LIKE 'TEST%';

    IF remaining_count = 0 THEN
        RAISE NOTICE '✅ All test sessions cleaned up';
    ELSE
        RAISE NOTICE '⚠️  % test sessions still exist', remaining_count;
        RAISE NOTICE 'Run: DELETE FROM cc_game_sessions WHERE room_code LIKE ''TEST%'';';
    END IF;
END $$;