-- ================================================================
-- Create missing function: get_student_dl_play_count
-- Run this in Supabase SQL Editor to add the missing function
-- ================================================================

CREATE OR REPLACE FUNCTION get_student_dl_play_count(p_student_id UUID)
RETURNS INTEGER AS $$
DECLARE
  play_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO play_count
  FROM dl_games
  WHERE student_id = p_student_id
    AND status = 'completed';

  RETURN COALESCE(play_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Test the function (should return 0 for a test UUID)
SELECT get_student_dl_play_count('00000000-0000-0000-0000-000000000000'::UUID) as test_result;

-- ================================================================
-- After running, verify the function exists:
-- ================================================================
SELECT routine_name, routine_type, data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_student_dl_play_count';
