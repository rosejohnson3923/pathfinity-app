-- ================================================================
-- MIGRATION VERIFICATION SCRIPT
-- Run this to verify migrations 005, 006, 007 completed successfully
-- ================================================================

\echo '================================================================'
\echo 'VERIFYING DATABASE MIGRATIONS'
\echo '================================================================'
\echo ''

-- ================================================================
-- 1. CHECK TABLES EXIST
-- ================================================================
\echo '1. Checking tables exist...'
\echo ''

SELECT
  table_name,
  CASE
    WHEN table_name = 'container_sessions' THEN '✓ Container sessions tracking'
    WHEN table_name = 'pathiq_profiles' THEN '✓ PathIQ profiles'
    WHEN table_name = 'xp_transactions' THEN '✓ XP transaction log'
    WHEN table_name = 'journey_summaries' THEN '✓ Journey summaries'
  END AS description
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'container_sessions',
    'pathiq_profiles',
    'xp_transactions',
    'journey_summaries'
  )
ORDER BY table_name;

\echo ''
\echo 'Expected: 4 tables'
\echo ''

-- ================================================================
-- 2. CHECK INDEXES CREATED
-- ================================================================
\echo '2. Checking indexes...'
\echo ''

SELECT
  tablename,
  COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'container_sessions',
    'pathiq_profiles',
    'xp_transactions',
    'journey_summaries'
  )
GROUP BY tablename
ORDER BY tablename;

\echo ''
\echo 'Expected: 20+ total indexes across all tables'
\echo ''

-- ================================================================
-- 3. CHECK FUNCTIONS CREATED
-- ================================================================
\echo '3. Checking functions...'
\echo ''

SELECT
  routine_name,
  CASE
    WHEN routine_name = 'award_xp' THEN '✓ Award XP to users'
    WHEN routine_name = 'spend_xp' THEN '✓ Spend XP (hints)'
    WHEN routine_name = 'get_leaderboard' THEN '✓ Get leaderboard rankings'
    WHEN routine_name = 'get_user_container_average' THEN '✓ Calculate container average'
    WHEN routine_name = 'get_session_total_xp' THEN '✓ Get session XP total'
    WHEN routine_name = 'get_container_subject_breakdown' THEN '✓ Get subject breakdown'
    WHEN routine_name = 'upsert_journey_summary' THEN '✓ Create/update journey'
    WHEN routine_name = 'update_container_progress' THEN '✓ Update container progress'
    WHEN routine_name = 'get_journey_summary_detailed' THEN '✓ Get detailed summary'
    WHEN routine_name = 'mark_lesson_plan_generated' THEN '✓ Mark lesson plan done'
    WHEN routine_name = 'calculate_journey_metrics' THEN '✓ Calculate metrics'
    WHEN routine_name = 'reset_daily_xp' THEN '✓ Reset daily XP'
    WHEN routine_name = 'calculate_streak' THEN '✓ Calculate streaks'
  END AS description
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'award_xp',
    'spend_xp',
    'get_leaderboard',
    'get_user_container_average',
    'get_session_total_xp',
    'get_container_subject_breakdown',
    'upsert_journey_summary',
    'update_container_progress',
    'get_journey_summary_detailed',
    'mark_lesson_plan_generated',
    'calculate_journey_metrics',
    'reset_daily_xp',
    'calculate_streak'
  )
ORDER BY routine_name;

\echo ''
\echo 'Expected: 13 functions'
\echo ''

-- ================================================================
-- 4. CHECK VIEWS CREATED
-- ================================================================
\echo '4. Checking views...'
\echo ''

SELECT
  table_name as view_name,
  CASE
    WHEN table_name = 'container_performance_analytics' THEN '✓ Container performance'
    WHEN table_name = 'pathiq_leaderboard_view' THEN '✓ Leaderboard view'
    WHEN table_name = 'xp_analytics_view' THEN '✓ XP analytics'
    WHEN table_name = 'journey_completion_analytics' THEN '✓ Journey completion'
    WHEN table_name = 'lesson_plan_analytics' THEN '✓ Lesson plan analytics'
  END AS description
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'container_performance_analytics',
    'pathiq_leaderboard_view',
    'xp_analytics_view',
    'journey_completion_analytics',
    'lesson_plan_analytics'
  )
ORDER BY table_name;

\echo ''
\echo 'Expected: 5 views'
\echo ''

-- ================================================================
-- 5. CHECK TRIGGERS CREATED
-- ================================================================
\echo '5. Checking triggers...'
\echo ''

SELECT
  event_object_table as table_name,
  trigger_name,
  event_manipulation as fires_on
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN (
    'container_sessions',
    'pathiq_profiles',
    'journey_summaries'
  )
ORDER BY event_object_table, trigger_name;

\echo ''
\echo 'Expected: 5+ triggers'
\echo ''

-- ================================================================
-- 6. CHECK RLS ENABLED
-- ================================================================
\echo '6. Checking Row Level Security (RLS)...'
\echo ''

SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'container_sessions',
    'pathiq_profiles',
    'xp_transactions',
    'journey_summaries'
  )
ORDER BY tablename;

\echo ''
\echo 'Expected: All tables should show rls_enabled = true'
\echo ''

-- ================================================================
-- 7. CHECK RLS POLICIES
-- ================================================================
\echo '7. Checking RLS policies...'
\echo ''

SELECT
  tablename,
  policyname,
  cmd as command_type
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'container_sessions',
    'pathiq_profiles',
    'xp_transactions',
    'journey_summaries'
  )
ORDER BY tablename, policyname;

\echo ''
\echo 'Expected: Multiple policies per table (SELECT, INSERT, UPDATE)'
\echo ''

-- ================================================================
-- 8. CHECK TABLE CONSTRAINTS
-- ================================================================
\echo '8. Checking table constraints...'
\echo ''

SELECT
  tc.table_name,
  tc.constraint_type,
  COUNT(*) as constraint_count
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
  AND tc.table_name IN (
    'container_sessions',
    'pathiq_profiles',
    'xp_transactions',
    'journey_summaries'
  )
GROUP BY tc.table_name, tc.constraint_type
ORDER BY tc.table_name, tc.constraint_type;

\echo ''
\echo 'Expected: PRIMARY KEY, CHECK, UNIQUE constraints'
\echo ''

-- ================================================================
-- 9. SAMPLE DATA TEST (Optional - only if you want to test)
-- ================================================================
\echo '9. Testing sample data insertion (optional)...'
\echo 'Skipping - uncomment below to test'
\echo ''

/*
-- Uncomment to test data insertion
BEGIN;

-- Test PathIQ profile creation
INSERT INTO pathiq_profiles (
  user_id, tenant_id, xp, level, grade_level, career, companion
) VALUES (
  gen_random_uuid(), 'test-tenant', 100, 2, 'K', 'chef', 'finn'
) RETURNING id, user_id, xp, level;

-- Test container session
INSERT INTO container_sessions (
  user_id, tenant_id, session_id,
  container, subject, skill_id, skill_name, grade_level,
  questions_attempted, questions_correct, score, time_spent, xp_earned
) VALUES (
  (SELECT user_id FROM pathiq_profiles WHERE tenant_id = 'test-tenant' LIMIT 1),
  'test-tenant', 'test-session-123',
  'LEARN', 'Math', 'K.Math.A.1', 'Counting', 'K',
  5, 4, 80, 180, 25
) RETURNING id, container, subject, score;

-- Test journey summary
SELECT upsert_journey_summary(
  (SELECT user_id FROM pathiq_profiles WHERE tenant_id = 'test-tenant' LIMIT 1),
  'test-tenant',
  'test-session-123',
  'Test Student',
  'K',
  'chef',
  'Chef',
  'finn',
  'Finn'
);

-- Show results
SELECT
  'PathIQ Profiles' as table_name,
  COUNT(*) as test_rows
FROM pathiq_profiles WHERE tenant_id = 'test-tenant'
UNION ALL
SELECT
  'Container Sessions',
  COUNT(*)
FROM container_sessions WHERE tenant_id = 'test-tenant'
UNION ALL
SELECT
  'Journey Summaries',
  COUNT(*)
FROM journey_summaries WHERE tenant_id = 'test-tenant';

-- Rollback test data
ROLLBACK;

\echo 'Test data rolled back (no permanent changes)'
\echo ''
*/

-- ================================================================
-- 10. SUMMARY
-- ================================================================
\echo ''
\echo '================================================================'
\echo 'VERIFICATION SUMMARY'
\echo '================================================================'
\echo ''
\echo 'Review the output above. All checks should show:'
\echo '  ✓ 4 tables created'
\echo '  ✓ 20+ indexes created'
\echo '  ✓ 13 functions created'
\echo '  ✓ 5 views created'
\echo '  ✓ 5+ triggers created'
\echo '  ✓ RLS enabled on all tables'
\echo '  ✓ Multiple RLS policies per table'
\echo '  ✓ Constraints (PRIMARY KEY, CHECK, UNIQUE)'
\echo ''
\echo 'If any items are missing, re-run the corresponding migration:'
\echo '  - 005_container_sessions_tracking.sql'
\echo '  - 006_pathiq_profiles_persistence.sql'
\echo '  - 007_journey_summaries.sql'
\echo ''
\echo '================================================================'
