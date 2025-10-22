-- ================================================================
-- CHECK ACTUAL COLUMNS IN cb_spectators AND cb_session_participants
-- ================================================================

-- Check cb_spectators columns
SELECT
  'cb_spectators columns:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'cb_spectators'
ORDER BY ordinal_position;

-- Check cb_session_participants columns
SELECT
  'cb_session_participants columns:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'cb_session_participants'
ORDER BY ordinal_position;

-- Check existing RLS policies
SELECT
  'cb_spectators policies:' as info,
  policyname,
  cmd,
  qual::text,
  with_check::text
FROM pg_policies
WHERE tablename = 'cb_spectators';

SELECT
  'cb_session_participants policies:' as info,
  policyname,
  cmd,
  qual::text,
  with_check::text
FROM pg_policies
WHERE tablename = 'cb_session_participants';
