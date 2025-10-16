-- ================================================================
-- Career Challenge Schema Validation Script (CORRECTED)
-- ================================================================
-- Run this script to validate that all tables and data were created correctly
-- ================================================================

-- 1. Check all tables exist (CORRECTED - expecting 9 tables)
SELECT
    'Tables Created' as test_category,
    COUNT(*) as tables_found,
    CASE
        WHEN COUNT(*) = 9 THEN '✅ PASS - All 9 tables created'
        ELSE '❌ FAIL - Expected 9 tables, found ' || COUNT(*)
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

-- 2. List all Career Challenge tables
SELECT
    'Career Challenge Tables' as category,
    table_name,
    '✅' as exists
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'cc_%'
ORDER BY table_name;

-- 3. Check Industries
SELECT
    'Industries' as test_category,
    COUNT(*) as count,
    CASE
        WHEN COUNT(*) >= 3 THEN '✅ PASS - ' || COUNT(*) || ' industries found'
        ELSE '❌ FAIL - Expected at least 3 industries'
    END as status
FROM cc_industries;

-- 4. Industries detail
SELECT
    'Industry Detail' as category,
    code,
    name,
    icon,
    array_length(challenge_categories, 1) as categories,
    CASE WHEN is_active THEN '✅ Active' ELSE '❌ Inactive' END as status
FROM cc_industries
ORDER BY code;

-- 5. Check Challenges
SELECT
    'Challenges' as test_category,
    COUNT(*) as count,
    string_agg(DISTINCT difficulty, ', ') as difficulties,
    CASE
        WHEN COUNT(*) >= 3 THEN '✅ PASS - ' || COUNT(*) || ' challenges found'
        ELSE '❌ FAIL - Expected at least 3 challenges'
    END as status
FROM cc_challenges;

-- 6. Challenges by industry
SELECT
    i.name as industry,
    COUNT(c.id) as challenge_count,
    string_agg(c.title, ', ') as challenges
FROM cc_industries i
LEFT JOIN cc_challenges c ON c.industry_id = i.id
GROUP BY i.name
ORDER BY i.name;

-- 7. Check Role Cards
SELECT
    'Role Cards' as test_category,
    COUNT(*) as total_cards,
    COUNT(DISTINCT industry_id) as industries_with_cards,
    string_agg(DISTINCT rarity, ', ' ORDER BY rarity) as rarities,
    CASE
        WHEN COUNT(*) >= 7 THEN '✅ PASS - ' || COUNT(*) || ' role cards found'
        ELSE '❌ FAIL - Expected at least 7 role cards'
    END as status
FROM cc_role_cards;

-- 8. Role cards by industry and rarity
SELECT
    i.name as industry,
    r.rarity,
    COUNT(*) as count,
    string_agg(r.role_name, ', ') as roles
FROM cc_industries i
JOIN cc_role_cards r ON r.industry_id = i.id
GROUP BY i.name, r.rarity
ORDER BY i.name,
    CASE r.rarity
        WHEN 'mythic' THEN 1
        WHEN 'legendary' THEN 2
        WHEN 'epic' THEN 3
        WHEN 'rare' THEN 4
        WHEN 'uncommon' THEN 5
        WHEN 'common' THEN 6
    END;

-- 9. Check Synergies
SELECT
    'Synergies' as test_category,
    COUNT(*) as count,
    SUM(power_bonus) as total_bonus_power,
    CASE
        WHEN COUNT(*) >= 4 THEN '✅ PASS - ' || COUNT(*) || ' synergies found'
        ELSE '❌ FAIL - Expected at least 4 synergies'
    END as status
FROM cc_synergy_definitions;

-- 10. Synergies detail
SELECT
    i.name as industry,
    s.synergy_name,
    array_length(s.required_roles, 1) as roles_required,
    s.power_bonus,
    CASE WHEN s.is_hidden THEN '🔒 Hidden' ELSE '👁️ Visible' END as visibility
FROM cc_synergy_definitions s
JOIN cc_industries i ON s.industry_id = i.id
ORDER BY i.name, s.synergy_name;

-- 11. Test team power calculation with known roles
WITH test_calculation AS (
    SELECT * FROM cc_calculate_team_power(
        ARRAY['esports_coach_01', 'esports_analyst_01'],
        NULL
    )
)
SELECT
    'Team Power Function' as test_category,
    total_power,
    synergy_bonus,
    CASE
        WHEN total_power > 0 THEN '✅ PASS - Power calculation working'
        ELSE '❌ FAIL - Power calculation not working'
    END as status
FROM test_calculation;

-- 12. Test challenge evaluation function
WITH test_eval AS (
    SELECT
        cc_evaluate_challenge(100, c.id) as result,
        c.title,
        c.base_difficulty_score,
        c.perfect_score
    FROM cc_challenges c
    LIMIT 1
)
SELECT
    'Challenge Evaluation Function' as test_category,
    title as tested_challenge,
    result as evaluation_result,
    CASE
        WHEN result IN ('success', 'perfect', 'failure') THEN '✅ PASS - Evaluation working'
        ELSE '❌ FAIL - Evaluation not working'
    END as status
FROM test_eval;

-- 13. Database objects summary
SELECT
    'Database Objects Summary' as category,
    'Tables: ' || (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'cc_%') ||
    ', Functions: ' || (SELECT COUNT(*) FROM pg_proc WHERE proname LIKE 'cc_%') ||
    ', Indexes: ' || (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename LIKE 'cc_%') ||
    ', Triggers: ' || (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public' AND event_object_table LIKE 'cc_%')
    as counts;

-- 14. Data Summary
SELECT
    'Data Summary' as category,
    (SELECT COUNT(*) FROM cc_industries) || ' Industries' as industries,
    (SELECT COUNT(*) FROM cc_challenges) || ' Challenges' as challenges,
    (SELECT COUNT(*) FROM cc_role_cards) || ' Role Cards' as role_cards,
    (SELECT COUNT(*) FROM cc_synergy_definitions) || ' Synergies' as synergies;

-- 15. Final validation status
WITH validation_checks AS (
    SELECT
        (SELECT COUNT(*) = 9 FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'cc_%') as tables_ok,
        (SELECT COUNT(*) >= 3 FROM cc_industries) as industries_ok,
        (SELECT COUNT(*) >= 3 FROM cc_challenges) as challenges_ok,
        (SELECT COUNT(*) >= 7 FROM cc_role_cards) as role_cards_ok,
        (SELECT COUNT(*) >= 4 FROM cc_synergy_definitions) as synergies_ok,
        (SELECT COUNT(*) >= 2 FROM pg_proc WHERE proname LIKE 'cc_%') as functions_ok
)
SELECT
    '═══════════════════════' as separator,
    CASE
        WHEN tables_ok AND industries_ok AND challenges_ok AND role_cards_ok AND synergies_ok AND functions_ok
        THEN '✅ VALIDATION PASSED - Career Challenge is ready!'
        ELSE '⚠️ VALIDATION INCOMPLETE - Check details above'
    END as final_status,
    '═══════════════════════' as separator2
FROM validation_checks;

-- ================================================================
-- END OF VALIDATION
-- ================================================================