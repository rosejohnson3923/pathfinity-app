-- ================================================================
-- DISCOVERED LIVE! MULTIPLAYER - VALIDATION QUERIES
-- Run these queries to verify the migration was successful
-- ================================================================

-- 1. Verify all tables exist
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name LIKE 'dl_%'
ORDER BY table_name;

-- Expected output:
-- dl_answers
-- dl_click_events (NEW)
-- dl_clues
-- dl_game_sessions (NEW)
-- dl_games
-- dl_perpetual_rooms (NEW)
-- dl_session_participants (NEW)
-- dl_spectators (NEW)

-- ================================================================

-- 2. Verify perpetual rooms were created
SELECT
  room_code,
  room_name,
  theme_code,
  max_players_per_game,
  bingo_slots_per_game,
  status,
  is_featured,
  is_active
FROM dl_perpetual_rooms
ORDER BY room_code;

-- Expected: 5 rooms (GLOBAL01, GLOBAL02, GAME01, NURSE01, TEACH01)

-- ================================================================

-- 3. Check column details for dl_perpetual_rooms
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'dl_perpetual_rooms'
ORDER BY ordinal_position;

-- ================================================================

-- 4. Check column details for dl_game_sessions
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'dl_game_sessions'
ORDER BY ordinal_position;

-- ================================================================

-- 5. Check column details for dl_session_participants
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'dl_session_participants'
ORDER BY ordinal_position;

-- ================================================================

-- 6. Check column details for dl_spectators
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'dl_spectators'
ORDER BY ordinal_position;

-- ================================================================

-- 7. Check column details for dl_click_events
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'dl_click_events'
ORDER BY ordinal_position;

-- ================================================================

-- 8. Verify indexes exist
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename LIKE 'dl_%'
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- ================================================================

-- 9. Verify functions exist
SELECT
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%dl%'
  OR routine_name IN ('calculate_bingo_slots', 'update_room_stats_on_game_complete', 'update_room_participant_counts', 'update_spectator_counts')
ORDER BY routine_name;

-- Expected functions:
-- calculate_bingo_slots
-- get_student_dl_play_count
-- update_dl_clue_analytics
-- update_dl_game_total_xp
-- update_room_participant_counts
-- update_room_stats_on_game_complete
-- update_spectator_counts

-- ================================================================

-- 10. Verify triggers exist
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table LIKE 'dl_%'
ORDER BY event_object_table, trigger_name;

-- ================================================================

-- 11. Test calculate_bingo_slots function
SELECT
  player_count,
  calculate_bingo_slots(player_count) as bingo_slots
FROM (
  VALUES (2), (3), (4), (5), (6), (7), (8), (10), (12), (15)
) AS t(player_count);

-- Expected results:
-- 2 players = 2 slots
-- 3 players = 2 slots
-- 4 players = 2 slots
-- 5 players = 3 slots
-- 6 players = 3 slots
-- 7 players = 4 slots
-- 8 players = 4 slots
-- 10 players = 5 slots
-- 12 players = 6 slots
-- 15 players = 6 slots (capped at 6)

-- ================================================================

-- 12. Verify RLS policies
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
WHERE tablename LIKE 'dl_%'
ORDER BY tablename, policyname;

-- ================================================================

-- 13. Check foreign key constraints
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name LIKE 'dl_%'
ORDER BY tc.table_name, kcu.column_name;

-- ================================================================

-- 14. Verify grants (permissions)
SELECT
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name LIKE 'dl_%'
  AND grantee = 'authenticated'
ORDER BY table_name, privilege_type;

-- ================================================================

-- 15. Check that RLS is enabled on all DL tables
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'dl_%'
ORDER BY tablename;

-- All should show rowsecurity = true

-- ================================================================
-- VALIDATION COMPLETE
-- ================================================================
-- If all queries return expected results:
-- ✅ All tables created successfully
-- ✅ Initial rooms inserted
-- ✅ Functions and triggers working
-- ✅ RLS policies configured
-- ✅ Foreign keys established
-- ✅ Indexes created
-- ================================================================
