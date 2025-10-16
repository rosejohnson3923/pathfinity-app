-- ================================================================
-- Career Challenge Schema Validation Script
-- ================================================================
-- Run this script to validate that all tables and data were created correctly
-- ================================================================

-- 1. Check all tables exist
SELECT
    'Tables Created' as test_category,
    COUNT(*) as tables_found,
    CASE
        WHEN COUNT(*) = 10 THEN '✅ PASS'
        ELSE '❌ FAIL - Expected 10 tables'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'cc_industries',
    'cc_challenges',
    'cc_role_cards',
    'cc_synergy_definitions',
    'cc_player_collections',
    'cc_challenge_sessions',
    'cc_player_progress',
    'cc_trading_post',
    'cc_daily_challenges'
);

-- 2. Check Industries were inserted
SELECT
    'Industries' as test_category,
    COUNT(*) as count,
    CASE
        WHEN COUNT(*) >= 3 THEN '✅ PASS - ' || COUNT(*) || ' industries found'
        ELSE '❌ FAIL - Expected at least 3 industries'
    END as status
FROM cc_industries;

-- 3. List all industries
SELECT
    '  - Industry' as item,
    code,
    name,
    icon,
    array_length(challenge_categories, 1) as categories_count
FROM cc_industries
ORDER BY code;

-- 4. Check Challenges were inserted
SELECT
    'Challenges' as test_category,
    COUNT(*) as count,
    CASE
        WHEN COUNT(*) >= 3 THEN '✅ PASS - ' || COUNT(*) || ' challenges found'
        ELSE '❌ FAIL - Expected at least 3 challenges'
    END as status
FROM cc_challenges;

-- 5. List challenges by industry
SELECT
    '  - Challenge' as item,
    i.name as industry,
    c.title,
    c.category,
    c.difficulty,
    c.base_difficulty_score as score_required
FROM cc_challenges c
JOIN cc_industries i ON c.industry_id = i.id
ORDER BY i.name, c.challenge_code;

-- 6. Check Role Cards were inserted
SELECT
    'Role Cards' as test_category,
    COUNT(*) as count,
    CASE
        WHEN COUNT(*) >= 7 THEN '✅ PASS - ' || COUNT(*) || ' role cards found'
        ELSE '❌ FAIL - Expected at least 7 role cards'
    END as status
FROM cc_role_cards;

-- 7. List role cards by industry and rarity
SELECT
    '  - Role' as item,
    i.name as industry,
    r.role_name,
    r.rarity,
    r.base_power as power,
    COALESCE(r.category_bonuses::text, '{}') as bonuses
FROM cc_role_cards r
JOIN cc_industries i ON r.industry_id = i.id
ORDER BY i.name, r.rarity DESC, r.role_name;

-- 8. Check Synergies were created
SELECT
    'Synergies' as test_category,
    COUNT(*) as count,
    CASE
        WHEN COUNT(*) >= 4 THEN '✅ PASS - ' || COUNT(*) || ' synergies found'
        ELSE '❌ FAIL - Expected at least 4 synergies'
    END as status
FROM cc_synergy_definitions;

-- 9. List all synergies
SELECT
    '  - Synergy' as item,
    i.name as industry,
    s.synergy_name,
    array_to_string(s.required_roles, ' + ') as requires,
    s.power_bonus as bonus
FROM cc_synergy_definitions s
JOIN cc_industries i ON s.industry_id = i.id
ORDER BY i.name, s.synergy_name;

-- 10. Test the helper functions
SELECT
    'Helper Functions' as test_category,
    'cc_calculate_team_power' as function_name,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_proc WHERE proname = 'cc_calculate_team_power'
        ) THEN '✅ PASS - Function exists'
        ELSE '❌ FAIL - Function missing'
    END as status;

SELECT
    'Helper Functions' as test_category,
    'cc_evaluate_challenge' as function_name,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM pg_proc WHERE proname = 'cc_evaluate_challenge'
        ) THEN '✅ PASS - Function exists'
        ELSE '❌ FAIL - Function missing'
    END as status;

-- 11. Test team power calculation
WITH test_team AS (
    SELECT
        ARRAY['esports_coach_01', 'esports_analyst_01'] as team_roles
)
SELECT
    'Power Calculation' as test_category,
    'Team: Coach + Analyst' as test_case,
    (SELECT * FROM cc_calculate_team_power(team_roles, NULL)) as result,
    CASE
        WHEN (SELECT total_power FROM cc_calculate_team_power(team_roles, NULL)) > 0
        THEN '✅ PASS - Power calculated'
        ELSE '❌ FAIL - No power calculated'
    END as status
FROM test_team;

-- 12. Check indexes were created
SELECT
    'Indexes' as test_category,
    COUNT(*) as index_count,
    CASE
        WHEN COUNT(*) >= 15 THEN '✅ PASS - ' || COUNT(*) || ' indexes found'
        ELSE '⚠️ WARN - Found ' || COUNT(*) || ' indexes, expected at least 15'
    END as status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename LIKE 'cc_%';

-- 13. Check constraints
SELECT
    'Constraints' as test_category,
    COUNT(*) as constraint_count,
    CASE
        WHEN COUNT(*) >= 10 THEN '✅ PASS - ' || COUNT(*) || ' constraints found'
        ELSE '⚠️ WARN - Found ' || COUNT(*) || ' constraints, expected at least 10'
    END as status
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name LIKE 'cc_%'
AND constraint_type IN ('CHECK', 'UNIQUE', 'PRIMARY KEY', 'FOREIGN KEY');

-- 14. Check RLS is enabled
SELECT
    'Row Level Security' as test_category,
    COUNT(*) as rls_enabled_tables,
    CASE
        WHEN COUNT(*) >= 6 THEN '✅ PASS - RLS enabled on ' || COUNT(*) || ' tables'
        ELSE '⚠️ WARN - RLS only enabled on ' || COUNT(*) || ' tables'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'cc_%'
AND rowsecurity = true;

-- 15. Summary Report
SELECT
    '==================' as separator,
    'VALIDATION SUMMARY' as report,
    '==================' as separator2;

SELECT
    'Schema Validation Complete' as summary,
    CURRENT_TIMESTAMP as validated_at,
    current_database() as database_name,
    current_user as validated_by;

-- 16. Quick data summary
SELECT
    'Data Summary:' as summary,
    (SELECT COUNT(*) FROM cc_industries) || ' Industries, ' ||
    (SELECT COUNT(*) FROM cc_challenges) || ' Challenges, ' ||
    (SELECT COUNT(*) FROM cc_role_cards) || ' Role Cards, ' ||
    (SELECT COUNT(*) FROM cc_synergy_definitions) || ' Synergies' as counts;

-- ================================================================
-- END OF VALIDATION
-- ================================================================