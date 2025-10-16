-- Check which Career Challenge tables exist
SELECT
    expected.table_name as expected_table,
    CASE
        WHEN actual.table_name IS NOT NULL THEN '✅ EXISTS'
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

-- Show all cc_ tables that DO exist
SELECT
    'Existing CC Tables:' as info;

SELECT
    table_name,
    '✅ Created Successfully' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'cc_%'
ORDER BY table_name;

-- Summary
SELECT
    '═══════════════════════' as separator;

SELECT
    'Summary:' as info,
    COUNT(*) as tables_found,
    '9 tables expected' as expected,
    CASE
        WHEN COUNT(*) = 9 THEN '✅ ALL TABLES CREATED SUCCESSFULLY!'
        ELSE '⚠️ Table count mismatch - check details above'
    END as result
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'cc_%';