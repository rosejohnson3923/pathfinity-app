-- ============================================
-- CCM CHALLENGE VERIFICATION QUERIES
-- Run these to verify all 180 challenges loaded correctly
-- ============================================

-- 1. Total challenge count (should be 180)
SELECT
    COUNT(*) as total_challenges,
    '180 expected' as expected
FROM ccm_business_scenarios;

-- 2. Challenges by grade category (should be 60 each)
SELECT
    grade_category,
    COUNT(*) as challenge_count,
    '60 expected per grade' as expected
FROM ccm_business_scenarios
GROUP BY grade_category
ORDER BY grade_category;

-- 3. Challenges by P category (should be 30 each)
SELECT
    p_category,
    COUNT(*) as challenge_count,
    '30 expected per category' as expected
FROM ccm_business_scenarios
GROUP BY p_category
ORDER BY p_category;

-- 4. Challenges per company (should be 6 each for 30 companies = 180 total)
SELECT
    cr.grade_category,
    cr.code,
    cr.name,
    COUNT(bs.id) as challenge_count,
    '6 expected' as expected
FROM ccm_company_rooms cr
LEFT JOIN ccm_business_scenarios bs ON cr.id = bs.company_room_id
GROUP BY cr.grade_category, cr.code, cr.name
ORDER BY cr.grade_category, cr.code;

-- 5. Verify P category distribution per company (each company should have all 6 P's)
SELECT
    cr.code,
    cr.name,
    COUNT(DISTINCT bs.p_category) as unique_p_categories,
    ARRAY_AGG(DISTINCT bs.p_category ORDER BY bs.p_category) as p_categories,
    '6 expected (all P categories)' as expected
FROM ccm_company_rooms cr
LEFT JOIN ccm_business_scenarios bs ON cr.id = bs.company_room_id
GROUP BY cr.code, cr.name
ORDER BY cr.code;

-- 6. Sample challenges from each grade level
SELECT
    grade_category,
    title,
    p_category,
    difficulty_level
FROM ccm_business_scenarios
WHERE id IN (
    SELECT id
    FROM ccm_business_scenarios
    WHERE grade_category = 'elementary'
    LIMIT 1
)
UNION ALL
SELECT
    grade_category,
    title,
    p_category,
    difficulty_level
FROM ccm_business_scenarios
WHERE id IN (
    SELECT id
    FROM ccm_business_scenarios
    WHERE grade_category = 'middle'
    LIMIT 1
)
UNION ALL
SELECT
    grade_category,
    title,
    p_category,
    difficulty_level
FROM ccm_business_scenarios
WHERE id IN (
    SELECT id
    FROM ccm_business_scenarios
    WHERE grade_category = 'high'
    LIMIT 1
);

-- 7. Verify all challenges have executive pitches (should have all 6 executives)
SELECT
    title,
    grade_category,
    jsonb_object_keys(executive_pitches) as executive_role,
    LENGTH(executive_pitches->>jsonb_object_keys(executive_pitches)) as pitch_length
FROM ccm_business_scenarios
LIMIT 10;

-- 8. Verify lens multipliers exist
SELECT
    p_category,
    COUNT(*) as challenge_count,
    COUNT(CASE WHEN lens_multipliers IS NOT NULL AND jsonb_typeof(lens_multipliers) = 'object' THEN 1 END) as with_multipliers
FROM ccm_business_scenarios
GROUP BY p_category
ORDER BY p_category;

-- 9. Quick summary
SELECT
    '✅ Total Challenges' as metric,
    COUNT(*)::text as value,
    '180' as expected
FROM ccm_business_scenarios
UNION ALL
SELECT
    '✅ Companies with Challenges' as metric,
    COUNT(DISTINCT company_room_id)::text as value,
    '30' as expected
FROM ccm_business_scenarios
UNION ALL
SELECT
    '✅ Grade Categories' as metric,
    COUNT(DISTINCT grade_category)::text as value,
    '3 (elementary, middle, high)' as expected
FROM ccm_business_scenarios
UNION ALL
SELECT
    '✅ P Categories' as metric,
    COUNT(DISTINCT p_category)::text as value,
    '6 (people, product, process, place, promotion, price)' as expected
FROM ccm_business_scenarios;
