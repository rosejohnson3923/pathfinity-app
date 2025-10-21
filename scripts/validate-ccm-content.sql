-- =====================================================
-- CCM Content Validation Script
-- Verifies all content was seeded correctly
-- Created: October 18, 2025
-- =====================================================

\echo ''
\echo '========================================='
\echo 'CCM CONTENT VALIDATION'
\echo '========================================='
\echo ''

-- =====================================================
-- PART 1: Record Counts
-- =====================================================

\echo '1. RECORD COUNTS'
\echo '----------------------------------------'

SELECT
  'Challenge Cards' as table_name,
  COUNT(*) as total_records
FROM ccm_challenge_cards
UNION ALL
SELECT
  'Role Cards' as table_name,
  COUNT(*) as total_records
FROM ccm_role_cards
UNION ALL
SELECT
  'Synergy Cards' as table_name,
  COUNT(*) as total_records
FROM ccm_synergy_cards
UNION ALL
SELECT
  'Perpetual Rooms' as table_name,
  COUNT(*) as total_records
FROM ccm_perpetual_rooms
ORDER BY table_name;

\echo ''

-- =====================================================
-- PART 2: Challenge Cards Distribution
-- =====================================================

\echo '2. CHALLENGE CARDS BY CATEGORY'
\echo '----------------------------------------'

SELECT
  p_category as category,
  COUNT(*) as count,
  ROUND(AVG(CASE
    WHEN difficulty_level = 'easy' THEN 1
    WHEN difficulty_level = 'medium' THEN 2
    WHEN difficulty_level = 'hard' THEN 3
  END), 2) as avg_difficulty
FROM ccm_challenge_cards
WHERE is_active = true
GROUP BY p_category
ORDER BY p_category;

\echo ''

-- =====================================================
-- PART 3: Role Cards Distribution
-- =====================================================

\echo '3. ROLE CARDS BY C-SUITE ORGANIZATION'
\echo '----------------------------------------'

SELECT
  c_suite_org,
  COUNT(*) as count,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
FROM ccm_role_cards
GROUP BY c_suite_org
ORDER BY c_suite_org;

\echo ''

-- =====================================================
-- PART 4: Quality Ratings Analysis
-- =====================================================

\echo '4. ROLE CARD QUALITY RATINGS'
\echo '----------------------------------------'

SELECT
  c_suite_org,
  SUM(CASE WHEN quality_for_people = 'perfect' THEN 1 ELSE 0 END) as perfect_people,
  SUM(CASE WHEN quality_for_product = 'perfect' THEN 1 ELSE 0 END) as perfect_product,
  SUM(CASE WHEN quality_for_process = 'perfect' THEN 1 ELSE 0 END) as perfect_process,
  SUM(CASE WHEN quality_for_place = 'perfect' THEN 1 ELSE 0 END) as perfect_place,
  SUM(CASE WHEN quality_for_promotion = 'perfect' THEN 1 ELSE 0 END) as perfect_promotion,
  SUM(CASE WHEN quality_for_price = 'perfect' THEN 1 ELSE 0 END) as perfect_price
FROM ccm_role_cards
WHERE is_active = true
GROUP BY c_suite_org
ORDER BY c_suite_org;

\echo ''

-- =====================================================
-- PART 5: Synergy Cards
-- =====================================================

\echo '5. SYNERGY CARDS'
\echo '----------------------------------------'

SELECT
  display_name,
  tagline,
  display_order,
  is_active
FROM ccm_synergy_cards
ORDER BY display_order;

\echo ''

-- =====================================================
-- PART 6: Perpetual Rooms
-- =====================================================

\echo '6. PERPETUAL ROOMS'
\echo '----------------------------------------'

SELECT
  room_code,
  room_name,
  status,
  max_players_per_game,
  intermission_duration_seconds,
  theme_color,
  is_featured,
  feature_order
FROM ccm_perpetual_rooms
ORDER BY feature_order;

\echo ''

-- =====================================================
-- PART 7: Sample Data Quality Check
-- =====================================================

\echo '7. SAMPLE CHALLENGE CARDS (First 3)'
\echo '----------------------------------------'

SELECT
  card_code,
  p_category,
  title,
  difficulty_level,
  grade_level
FROM ccm_challenge_cards
WHERE is_active = true
ORDER BY p_category, card_code
LIMIT 3;

\echo ''

\echo '8. SAMPLE ROLE CARDS (First 3 per C-Suite)'
\echo '----------------------------------------'

WITH ranked_roles AS (
  SELECT
    card_code,
    display_name,
    c_suite_org,
    grade_level,
    ROW_NUMBER() OVER (PARTITION BY c_suite_org ORDER BY card_code) as rn
  FROM ccm_role_cards
  WHERE is_active = true
)
SELECT
  c_suite_org,
  card_code,
  display_name,
  grade_level
FROM ranked_roles
WHERE rn <= 2
ORDER BY c_suite_org, rn;

\echo ''

-- =====================================================
-- PART 8: Data Integrity Checks
-- =====================================================

\echo '9. DATA INTEGRITY CHECKS'
\echo '----------------------------------------'

-- Check for NULL required fields
SELECT
  'Challenge Cards with NULL titles' as check_name,
  COUNT(*) as issue_count
FROM ccm_challenge_cards
WHERE title IS NULL OR title = ''
UNION ALL
SELECT
  'Role Cards with NULL names' as check_name,
  COUNT(*) as issue_count
FROM ccm_role_cards
WHERE display_name IS NULL OR display_name = ''
UNION ALL
SELECT
  'Synergy Cards with NULL names' as check_name,
  COUNT(*) as issue_count
FROM ccm_synergy_cards
WHERE display_name IS NULL OR display_name = ''
UNION ALL
SELECT
  'Rooms with NULL codes' as check_name,
  COUNT(*) as issue_count
FROM ccm_perpetual_rooms
WHERE room_code IS NULL OR room_code = '';

\echo ''

-- =====================================================
-- PART 9: JSON Field Validation
-- =====================================================

\echo '10. JSON FIELDS VALIDATION'
\echo '----------------------------------------'

-- Check primary_soft_skills JSON arrays are valid
SELECT
  'Role Cards with valid soft skills JSON' as check_name,
  COUNT(*) as valid_count,
  (SELECT COUNT(*) FROM ccm_role_cards) as total_count
FROM ccm_role_cards
WHERE jsonb_typeof(primary_soft_skills::jsonb) = 'array';

\echo ''

SELECT
  'Synergy Cards with valid tags JSON' as check_name,
  COUNT(*) as valid_count,
  (SELECT COUNT(*) FROM ccm_synergy_cards) as total_count
FROM ccm_synergy_cards
WHERE jsonb_typeof(soft_skills_tags::jsonb) = 'array';

\echo ''

-- =====================================================
-- PART 10: Summary Statistics
-- =====================================================

\echo '11. SUMMARY STATISTICS'
\echo '----------------------------------------'

DO $$
DECLARE
  challenge_count INT;
  role_count INT;
  synergy_count INT;
  room_count INT;
  people_count INT;
  product_count INT;
  process_count INT;
  place_count INT;
  promotion_count INT;
  price_count INT;
  ceo_count INT;
  cfo_count INT;
  cmo_count INT;
  cto_count INT;
  chro_count INT;
BEGIN
  SELECT COUNT(*) INTO challenge_count FROM ccm_challenge_cards WHERE is_active = true;
  SELECT COUNT(*) INTO role_count FROM ccm_role_cards WHERE is_active = true;
  SELECT COUNT(*) INTO synergy_count FROM ccm_synergy_cards WHERE is_active = true;
  SELECT COUNT(*) INTO room_count FROM ccm_perpetual_rooms WHERE is_active = true;

  SELECT COUNT(*) INTO people_count FROM ccm_challenge_cards WHERE p_category = 'people' AND is_active = true;
  SELECT COUNT(*) INTO product_count FROM ccm_challenge_cards WHERE p_category = 'product' AND is_active = true;
  SELECT COUNT(*) INTO process_count FROM ccm_challenge_cards WHERE p_category = 'process' AND is_active = true;
  SELECT COUNT(*) INTO place_count FROM ccm_challenge_cards WHERE p_category = 'place' AND is_active = true;
  SELECT COUNT(*) INTO promotion_count FROM ccm_challenge_cards WHERE p_category = 'promotion' AND is_active = true;
  SELECT COUNT(*) INTO price_count FROM ccm_challenge_cards WHERE p_category = 'price' AND is_active = true;

  SELECT COUNT(*) INTO ceo_count FROM ccm_role_cards WHERE c_suite_org = 'ceo' AND is_active = true;
  SELECT COUNT(*) INTO cfo_count FROM ccm_role_cards WHERE c_suite_org = 'cfo' AND is_active = true;
  SELECT COUNT(*) INTO cmo_count FROM ccm_role_cards WHERE c_suite_org = 'cmo' AND is_active = true;
  SELECT COUNT(*) INTO cto_count FROM ccm_role_cards WHERE c_suite_org = 'cto' AND is_active = true;
  SELECT COUNT(*) INTO chro_count FROM ccm_role_cards WHERE c_suite_org = 'chro' AND is_active = true;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ CCM CONTENT VALIDATION COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 TOTAL COUNTS:';
  RAISE NOTICE '   - Challenge Cards: %', challenge_count;
  RAISE NOTICE '   - Role Cards: %', role_count;
  RAISE NOTICE '   - Synergy Cards: %', synergy_count;
  RAISE NOTICE '   - Perpetual Rooms: %', room_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 CHALLENGE DISTRIBUTION:';
  RAISE NOTICE '   - People: %', people_count;
  RAISE NOTICE '   - Product: %', product_count;
  RAISE NOTICE '   - Process: %', process_count;
  RAISE NOTICE '   - Place: %', place_count;
  RAISE NOTICE '   - Promotion: %', promotion_count;
  RAISE NOTICE '   - Price: %', price_count;
  RAISE NOTICE '';
  RAISE NOTICE '👔 ROLE DISTRIBUTION:';
  RAISE NOTICE '   - CEO: %', ceo_count;
  RAISE NOTICE '   - CFO: %', cfo_count;
  RAISE NOTICE '   - CMO: %', cmo_count;
  RAISE NOTICE '   - CTO: %', cto_count;
  RAISE NOTICE '   - CHRO: %', chro_count;
  RAISE NOTICE '';

  -- Validation checks
  IF challenge_count = 30 AND role_count = 50 AND synergy_count = 5 AND room_count = 4 THEN
    RAISE NOTICE '✅ All content counts match expected values!';
  ELSE
    RAISE NOTICE '⚠️  Warning: Content counts do not match expected values';
    RAISE NOTICE '   Expected: 30 challenges, 50 roles, 5 synergies, 4 rooms';
  END IF;

  IF people_count = 5 AND product_count = 5 AND process_count = 5 AND
     place_count = 5 AND promotion_count = 5 AND price_count = 5 THEN
    RAISE NOTICE '✅ Challenge distribution is balanced (5 per category)';
  ELSE
    RAISE NOTICE '⚠️  Warning: Challenge distribution is not balanced';
  END IF;

  IF ceo_count = 10 AND cfo_count = 10 AND cmo_count = 10 AND
     cto_count = 10 AND chro_count = 10 THEN
    RAISE NOTICE '✅ Role distribution is balanced (10 per C-Suite org)';
  ELSE
    RAISE NOTICE '⚠️  Warning: Role distribution is not balanced';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '🎮 Ready to play CCM!';
  RAISE NOTICE '';
END $$;
