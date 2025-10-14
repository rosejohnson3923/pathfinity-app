-- Verify all 3 Discovered Live functions exist

-- Method 1: Direct function check
SELECT
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_dl_game_total_xp',
    'update_dl_clue_analytics',
    'get_student_dl_play_count'
  )
ORDER BY routine_name;

-- Method 2: Test the function directly (should return 0 for a test UUID)
SELECT get_student_dl_play_count('00000000-0000-0000-0000-000000000000'::UUID) as test_result;

-- Method 3: Check RLS Policies (expecting 6 total)
SELECT
  tablename,
  policyname,
  cmd,
  CASE
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as has_condition
FROM pg_policies
WHERE tablename LIKE 'dl_%'
ORDER BY tablename, policyname;
