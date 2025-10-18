-- =====================================================
-- Career Challenge Multiplayer (CCM) - Schema Verification
-- Run this to verify all CCM tables were created correctly
-- =====================================================

\echo '=================================================='
\echo 'CCM Schema Verification'
\echo '=================================================='
\echo ''

-- =====================================================
-- 1. Check All Tables Exist
-- =====================================================

\echo '1. Checking all CCM tables exist...'
\echo ''

SELECT
  table_name,
  CASE
    WHEN table_name = 'ccm_perpetual_rooms' THEN '✓ Core: Perpetual rooms'
    WHEN table_name = 'ccm_game_sessions' THEN '✓ Core: Game sessions'
    WHEN table_name = 'ccm_session_participants' THEN '✓ Core: Session participants'
    WHEN table_name = 'ccm_role_cards' THEN '✓ Content: Role cards'
    WHEN table_name = 'ccm_synergy_cards' THEN '✓ Content: Synergy cards'
    WHEN table_name = 'ccm_challenge_cards' THEN '✓ Content: Challenge cards'
    WHEN table_name = 'ccm_soft_skills_matrix' THEN '✓ Content: Soft skills matrix (TRADE SECRET)'
    WHEN table_name = 'ccm_round_plays' THEN '✓ Gameplay: Round plays'
    WHEN table_name = 'ccm_mvp_selections' THEN '✓ Gameplay: MVP selections'
    WHEN table_name = 'ccm_achievements' THEN '✓ Achievements: Definitions'
    WHEN table_name = 'ccm_player_achievements' THEN '✓ Achievements: Player progress'
    ELSE 'Unknown table'
  END as description
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'ccm_%'
ORDER BY table_name;

\echo ''

-- Count tables
SELECT
  COUNT(*) as total_ccm_tables,
  CASE
    WHEN COUNT(*) = 11 THEN '✓ All 11 CCM tables created'
    ELSE '✗ Expected 11 tables, found ' || COUNT(*)
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'ccm_%';

\echo ''

-- =====================================================
-- 2. Check Featured Rooms Seeded
-- =====================================================

\echo '2. Checking featured perpetual rooms...'
\echo ''

SELECT
  room_code,
  room_name,
  is_featured,
  feature_order
FROM ccm_perpetual_rooms
WHERE is_featured = true
ORDER BY feature_order;

\echo ''

-- =====================================================
-- 3. Check Row Level Security
-- =====================================================

\echo '3. Checking Row Level Security (RLS)...'
\echo ''

SELECT
  tablename,
  rowsecurity as rls_enabled,
  CASE
    WHEN rowsecurity = true THEN '✓ RLS enabled (protected)'
    ELSE '✗ RLS not enabled'
  END as status
FROM pg_tables
WHERE tablename IN ('ccm_soft_skills_matrix', 'ccm_player_achievements')
ORDER BY tablename;

\echo ''

-- =====================================================
-- 4. Check Indexes
-- =====================================================

\echo '4. Checking indexes...'
\echo ''

SELECT
  tablename,
  COUNT(*) as index_count
FROM pg_indexes
WHERE tablename LIKE 'ccm_%'
GROUP BY tablename
ORDER BY tablename;

\echo ''

SELECT
  COUNT(*) as total_indexes,
  CASE
    WHEN COUNT(*) >= 34 THEN '✓ All indexes created'
    ELSE '⚠ Expected 34+ indexes, found ' || COUNT(*)
  END as status
FROM pg_indexes
WHERE tablename LIKE 'ccm_%';

\echo ''

-- =====================================================
-- 5. Check Foreign Keys
-- =====================================================

\echo '5. Checking foreign key constraints...'
\echo ''

SELECT
  COUNT(*) as total_foreign_keys,
  CASE
    WHEN COUNT(*) >= 15 THEN '✓ All foreign keys created'
    ELSE '⚠ Expected 15+ foreign keys, found ' || COUNT(*)
  END as status
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
AND table_name LIKE 'ccm_%';

\echo ''

-- =====================================================
-- 6. Summary
-- =====================================================

\echo '=================================================='
\echo 'Verification Summary'
\echo '=================================================='
\echo ''

DO $$
DECLARE
  table_count INTEGER;
  index_count INTEGER;
  fk_count INTEGER;
  rls_count INTEGER;
  room_count INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name LIKE 'ccm_%';

  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE tablename LIKE 'ccm_%';

  -- Count foreign keys
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints
  WHERE constraint_type = 'FOREIGN KEY'
  AND table_name LIKE 'ccm_%';

  -- Count RLS enabled tables
  SELECT COUNT(*) INTO rls_count
  FROM pg_tables
  WHERE tablename LIKE 'ccm_%'
  AND rowsecurity = true;

  -- Count featured rooms
  SELECT COUNT(*) INTO room_count
  FROM ccm_perpetual_rooms
  WHERE is_featured = true;

  -- Display summary
  RAISE NOTICE 'Tables: % / 11', table_count;
  RAISE NOTICE 'Indexes: % / 34+', index_count;
  RAISE NOTICE 'Foreign Keys: % / 15+', fk_count;
  RAISE NOTICE 'RLS Enabled Tables: % / 2', rls_count;
  RAISE NOTICE 'Featured Rooms Seeded: % / 3', room_count;
  RAISE NOTICE '';

  IF table_count = 11 AND index_count >= 34 AND fk_count >= 15 AND rls_count = 2 AND room_count = 3 THEN
    RAISE NOTICE '✅ CCM SCHEMA VERIFICATION PASSED';
    RAISE NOTICE '✅ All tables, indexes, constraints, and rooms are in place';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Next steps:';
    RAISE NOTICE '  1. Generate content (50 Role cards, 5 Synergy cards, 30 Challenge cards)';
    RAISE NOTICE '  2. Populate soft skills matrix (🔒 TRADE SECRET - 250 combinations)';
    RAISE NOTICE '  3. Create 32 achievement definitions';
    RAISE NOTICE '  4. Build CCM services (room manager, game orchestrator)';
    RAISE NOTICE '  5. Create API endpoints';
    RAISE NOTICE '  6. Build UI components';
  ELSE
    RAISE WARNING '✗ CCM SCHEMA VERIFICATION FAILED';
    RAISE WARNING 'Some tables, indexes, or constraints are missing';
    RAISE WARNING 'Review migration logs and re-run migrations if needed';
  END IF;
END $$;

\echo ''
\echo '=================================================='
\echo 'End of Verification'
\echo '=================================================='
