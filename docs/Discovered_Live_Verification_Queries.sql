-- ================================================================
-- DISCOVERED LIVE! - MIGRATION VERIFICATION QUERIES
-- ================================================================
-- Run these queries in Supabase SQL Editor after migration
-- to verify all database objects were created successfully
-- ================================================================

-- ================================================================
-- 1. VERIFY TABLES CREATED
-- ================================================================
-- Expected: 3 tables (dl_clues, dl_games, dl_answers)
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name LIKE 'dl_%'
ORDER BY table_name;

-- Expected Output:
-- table_name    | column_count
-- --------------+-------------
-- dl_answers    | 10
-- dl_clues      | 13
-- dl_games      | 21


-- ================================================================
-- 2. VERIFY FUNCTIONS CREATED
-- ================================================================
-- Expected: 3 functions
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%dl%'
ORDER BY routine_name;

-- Expected Output:
-- routine_name                  | routine_type
-- ------------------------------+-------------
-- get_student_dl_play_count     | FUNCTION
-- update_dl_clue_analytics      | FUNCTION
-- update_dl_game_total_xp       | FUNCTION


-- ================================================================
-- 3. VERIFY RLS POLICIES
-- ================================================================
-- Expected: 6 policies total
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename LIKE 'dl_%'
ORDER BY tablename, policyname;

-- Expected Output:
-- tablename   | policyname                      | cmd
-- ------------+---------------------------------+--------
-- dl_answers  | dl_answers_insert_policy        | INSERT
-- dl_answers  | dl_answers_select_policy        | SELECT
-- dl_clues    | dl_clues_select_policy          | SELECT
-- dl_games    | dl_games_insert_policy          | INSERT
-- dl_games    | dl_games_select_policy          | SELECT
-- dl_games    | dl_games_update_policy          | UPDATE


-- ================================================================
-- 4. VERIFY INDEXES CREATED
-- ================================================================
-- Expected: 9 indexes
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE tablename LIKE 'dl_%'
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- Expected Output:
-- tablename   | indexname
-- ------------+----------------------------------
-- dl_answers  | dl_answers_pkey
-- dl_answers  | idx_dl_answers_clue
-- dl_answers  | idx_dl_answers_game
-- dl_answers  | idx_dl_answers_student_via_game
-- dl_clues    | dl_clues_pkey
-- dl_clues    | idx_dl_clues_active
-- dl_clues    | idx_dl_clues_career
-- dl_clues    | idx_dl_clues_difficulty_grade
-- dl_clues    | idx_dl_clues_skill
-- dl_games    | dl_games_pkey
-- dl_games    | idx_dl_games_journey
-- dl_games    | idx_dl_games_started
-- dl_games    | idx_dl_games_status
-- dl_games    | idx_dl_games_student


-- ================================================================
-- 5. VERIFY TRIGGERS CREATED
-- ================================================================
-- Expected: 2 triggers
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE '%dl%'
ORDER BY trigger_name;

-- Expected Output:
-- trigger_name                      | event_object_table | action_timing | event_manipulation
-- ----------------------------------+--------------------+---------------+-------------------
-- trigger_update_dl_clue_analytics  | dl_answers         | AFTER         | INSERT
-- trigger_update_dl_game_total_xp   | dl_games           | BEFORE        | INSERT


-- ================================================================
-- 6. TEST FUNCTION: get_student_dl_play_count
-- ================================================================
-- Should return 0 for any UUID (no games exist yet)
SELECT get_student_dl_play_count('00000000-0000-0000-0000-000000000000');

-- Expected Output: 0


-- ================================================================
-- 7. VERIFY FOREIGN KEY CONSTRAINTS
-- ================================================================
-- Expected: 5 foreign key constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name LIKE 'dl_%'
ORDER BY tc.table_name, tc.constraint_name;

-- Expected Output:
-- table_name | constraint_name          | column_name         | foreign_table_name | foreign_column_name
-- -----------+--------------------------+---------------------+--------------------+--------------------
-- dl_answers | dl_answers_career_code_fkey | career_code         | career_paths       | career_code
-- dl_answers | dl_answers_clue_id_fkey     | clue_id             | dl_clues           | id
-- dl_answers | dl_answers_game_id_fkey     | game_id             | dl_games           | id
-- dl_clues   | dl_clues_career_code_fkey   | career_code         | career_paths       | career_code
-- dl_games   | dl_games_journey_summary_id_fkey | journey_summary_id  | journey_summaries  | id
-- dl_games   | dl_games_student_id_fkey    | student_id          | student_profiles   | id


-- ================================================================
-- 8. VERIFY GRANTS/PERMISSIONS
-- ================================================================
-- Expected: authenticated role has correct permissions
SELECT
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name LIKE 'dl_%'
  AND grantee = 'authenticated'
ORDER BY table_name, privilege_type;

-- Expected Output:
-- grantee        | table_name | privilege_type
-- ---------------+------------+---------------
-- authenticated  | dl_answers | INSERT
-- authenticated  | dl_answers | SELECT
-- authenticated  | dl_clues   | SELECT
-- authenticated  | dl_games   | INSERT
-- authenticated  | dl_games   | SELECT
-- authenticated  | dl_games   | UPDATE


-- ================================================================
-- 9. VIEW TABLE STRUCTURES
-- ================================================================

-- View dl_clues structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'dl_clues'
ORDER BY ordinal_position;

-- View dl_games structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'dl_games'
ORDER BY ordinal_position;

-- View dl_answers structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'dl_answers'
ORDER BY ordinal_position;


-- ================================================================
-- 10. QUICK HEALTH CHECK (Run this last)
-- ================================================================
-- This single query verifies the most critical elements
SELECT
  'Tables' as object_type,
  COUNT(*)::text as count,
  '3 expected' as expected
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'dl_%'

UNION ALL

SELECT
  'Functions',
  COUNT(*)::text,
  '3 expected'
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name LIKE '%dl%'

UNION ALL

SELECT
  'Policies',
  COUNT(*)::text,
  '6 expected'
FROM pg_policies
WHERE tablename LIKE 'dl_%'

UNION ALL

SELECT
  'Indexes',
  COUNT(*)::text,
  '14 expected'
FROM pg_indexes
WHERE tablename LIKE 'dl_%' AND schemaname = 'public'

UNION ALL

SELECT
  'Triggers',
  COUNT(*)::text,
  '2 expected'
FROM information_schema.triggers
WHERE trigger_name LIKE '%dl%';

-- Expected Output:
-- object_type | count | expected
-- ------------+-------+-------------
-- Tables      | 3     | 3 expected
-- Functions   | 3     | 3 expected
-- Policies    | 6     | 6 expected
-- Indexes     | 14    | 14 expected
-- Triggers    | 2     | 2 expected


-- ================================================================
-- ✅ ALL CHECKS PASSED?
-- ================================================================
-- If all queries above return expected results, your migration
-- was successful! You can now proceed to build the service layer.
--
-- Next steps:
-- 1. ✅ Database migration complete
-- 2. 🔜 Build DiscoveredLiveService.ts
-- 3. 🔜 Build UI components
-- 4. 🔜 Integrate with journey
-- ================================================================
