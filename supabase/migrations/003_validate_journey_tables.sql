-- =====================================================
-- VALIDATION QUERIES FOR LEARNING JOURNEY TABLES
-- Run these to confirm the migration was successful
-- =====================================================

-- 1. CHECK ALL TABLES EXIST
-- Expected: 6 rows (one for each table)
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'learning_journeys',
    'grade_progression_tracking',
    'skill_authority_tracking',
    'remediation_queue',
    'journey_sync_metadata',
    'parent_override_audit'
  )
ORDER BY table_name;

-- 2. CHECK ALL VIEWS EXIST
-- Expected: 3 rows (one for each analytics view)
SELECT table_name as view_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'career_analytics',
    'companion_analytics',
    'grade_progression_analytics'
  )
ORDER BY table_name;

-- 3. CHECK FUNCTIONS EXIST
-- Expected: 3 rows (update_updated_at, calculate_streak_days, process_parent_override)
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_updated_at_column',
    'calculate_streak_days',
    'process_parent_override'
  )
ORDER BY routine_name;

-- 4. CHECK INDEXES ARE CREATED
-- Expected: Multiple rows showing all custom indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'learning_journeys',
    'grade_progression_tracking',
    'skill_authority_tracking',
    'remediation_queue',
    'journey_sync_metadata',
    'parent_override_audit'
  )
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 5. CHECK TRIGGERS ARE CREATED
-- Expected: 5 rows (one trigger per table with updated_at)
SELECT
  event_object_table as table_name,
  trigger_name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'update_%_updated_at'
ORDER BY event_object_table;

-- 6. CHECK CONSTRAINTS ARE CREATED
-- Expected: Multiple unique constraints
SELECT
  table_name,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
  AND constraint_type IN ('UNIQUE', 'PRIMARY KEY', 'CHECK')
  AND table_name IN (
    'learning_journeys',
    'grade_progression_tracking',
    'skill_authority_tracking',
    'remediation_queue',
    'journey_sync_metadata',
    'parent_override_audit'
  )
ORDER BY table_name, constraint_name;

-- 7. CHECK RLS STATUS
-- Shows which tables have RLS enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'learning_journeys',
    'grade_progression_tracking',
    'skill_authority_tracking',
    'remediation_queue',
    'journey_sync_metadata',
    'parent_override_audit'
  )
ORDER BY tablename;

-- 8. CHECK RLS POLICIES (if any)
-- Shows all RLS policies on our tables
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'learning_journeys',
    'grade_progression_tracking',
    'skill_authority_tracking',
    'remediation_queue',
    'journey_sync_metadata',
    'parent_override_audit'
  )
ORDER BY tablename, policyname;

-- =====================================================
-- TEST DATA INSERTION (Optional)
-- Uncomment to test that tables work correctly
-- =====================================================

/*
-- Test inserting a learning journey
INSERT INTO learning_journeys (
  user_id,
  tenant_id,
  grade_level,
  school_year,
  career,
  companion,
  skills_total
) VALUES (
  gen_random_uuid(),  -- or use a real user_id
  'test-school-001',
  '5',
  '2024-2025',
  'Engineer',
  'pat',
  50
) RETURNING *;

-- Test the parent override function
SELECT process_parent_override(
  gen_random_uuid()::UUID,  -- student_id
  gen_random_uuid()::UUID,  -- parent_id
  'test-school-001',         -- tenant_id
  '5',                       -- from_grade
  '6',                       -- to_grade
  75.5,                      -- completion_percentage
  'Student is ready for advanced material'
);

-- Test the streak calculation function
SELECT calculate_streak_days(
  gen_random_uuid()::UUID,  -- user_id (use a real one if testing)
  'test-school-001',         -- tenant_id
  '5'                        -- grade_level
);

-- Query the analytics views
SELECT * FROM career_analytics LIMIT 5;
SELECT * FROM companion_analytics LIMIT 5;
SELECT * FROM grade_progression_analytics LIMIT 5;
*/

-- =====================================================
-- SUMMARY CHECK - Run this for a quick overview
-- =====================================================
SELECT
  'Tables' as object_type,
  COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'learning_journeys',
    'grade_progression_tracking',
    'skill_authority_tracking',
    'remediation_queue',
    'journey_sync_metadata',
    'parent_override_audit'
  )
UNION ALL
SELECT
  'Views' as object_type,
  COUNT(*) as count
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'career_analytics',
    'companion_analytics',
    'grade_progression_analytics'
  )
UNION ALL
SELECT
  'Functions' as object_type,
  COUNT(*) as count
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_updated_at_column',
    'calculate_streak_days',
    'process_parent_override'
  )
UNION ALL
SELECT
  'Triggers' as object_type,
  COUNT(*) as count
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'update_%_updated_at';

-- Expected Result:
-- Tables: 6
-- Views: 3
-- Functions: 3
-- Triggers: 5