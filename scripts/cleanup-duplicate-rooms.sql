-- =====================================================
-- CCM Duplicate Rooms Cleanup Script
-- Removes old rooms from original migration
-- Keeps newly seeded rooms with updated configs
-- =====================================================

\echo ''
\echo '========================================='
\echo 'CCM DUPLICATE ROOMS CLEANUP'
\echo '========================================='
\echo ''

-- Show current rooms before cleanup
\echo 'BEFORE CLEANUP:'
\echo '----------------------------------------'
SELECT
  room_code,
  room_name,
  max_players_per_game,
  theme_color,
  feature_order
FROM ccm_perpetual_rooms
ORDER BY feature_order, room_code;

\echo ''
\echo 'Removing old rooms...'
\echo ''

-- Delete the original 3 rooms from migration
-- (Keep the new ones with underscore format: CCM_GLOBAL_01)
DELETE FROM ccm_perpetual_rooms
WHERE room_code IN (
  'CCM_GLOBAL01',    -- Old: Global Career Challenge
  'CCM_SKILLS01',    -- Old: Skills Mastery Room
  'CCM_CASUAL01'     -- Old: Casual Career Room
);

\echo ''
\echo 'AFTER CLEANUP:'
\echo '----------------------------------------'
SELECT
  room_code,
  room_name,
  max_players_per_game,
  intermission_duration_seconds,
  theme_color,
  is_featured,
  feature_order
FROM ccm_perpetual_rooms
ORDER BY feature_order;

\echo ''
\echo '========================================='
\echo '✅ CLEANUP COMPLETE'
\echo '========================================='
\echo ''
\echo 'Remaining Rooms:'
\echo '  1. CCM_GLOBAL_01 - Global CEO Challenge (Purple, 8 players)'
\echo '  2. CCM_SKILL_BUILDER_01 - Skills Development Arena (Blue, 8 players)'
\echo '  3. CCM_RAPID_FIRE_01 - Rapid Fire Decisions (Orange, 6 players)'
\echo '  4. CCM_TEAM_COLLAB_01 - Team Collaboration Hub (Green, 8 players)'
\echo ''
