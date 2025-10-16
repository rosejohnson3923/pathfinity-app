-- Check which Career Challenge tables exist
SELECT
    table_name,
    CASE
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (
    VALUES
        ('cc_industries'),
        ('cc_challenges'),
        ('cc_role_cards'),
        ('cc_synergy_definitions'),
        ('cc_player_collections'),
        ('cc_challenge_sessions'),
        ('cc_player_progress'),
        ('cc_trading_post'),
        ('cc_daily_challenges')
) AS expected(table_name)
LEFT JOIN information_schema.tables actual
    ON actual.table_name = expected.table_name
    AND actual.table_schema = 'public'
ORDER BY expected.table_name;

-- Alternative: Show all cc_ tables that DO exist
SELECT
    'Existing CC Tables:' as info;

SELECT
    table_name,
    '✅' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'cc_%'
ORDER BY table_name;

-- Count check
SELECT
    'Expected: 9 tables' as expectation,
    'Found: ' || COUNT(*) || ' tables' as reality
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'cc_%';