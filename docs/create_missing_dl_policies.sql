-- ================================================================
-- Create missing RLS policies for Discovered Live! tables
-- Run this in Supabase SQL Editor to add security policies
-- ================================================================

-- Enable RLS on all tables (should already be enabled, but just in case)
ALTER TABLE dl_clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE dl_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE dl_answers ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- POLICY 1: dl_clues - SELECT (all authenticated users can view active clues)
-- ================================================================
CREATE POLICY "dl_clues_select_policy" ON dl_clues
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- ================================================================
-- POLICY 2: dl_games - SELECT (students can only view their own games)
-- ================================================================
CREATE POLICY "dl_games_select_policy" ON dl_games
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- ================================================================
-- POLICY 3: dl_games - INSERT (students can create their own games)
-- ================================================================
CREATE POLICY "dl_games_insert_policy" ON dl_games
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- ================================================================
-- POLICY 4: dl_games - UPDATE (students can update their own games)
-- ================================================================
CREATE POLICY "dl_games_update_policy" ON dl_games
  FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid());

-- ================================================================
-- POLICY 5: dl_answers - SELECT (students can view answers from their own games)
-- ================================================================
CREATE POLICY "dl_answers_select_policy" ON dl_answers
  FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT id FROM dl_games WHERE student_id = auth.uid()
    )
  );

-- ================================================================
-- POLICY 6: dl_answers - INSERT (students can insert answers to their own games)
-- ================================================================
CREATE POLICY "dl_answers_insert_policy" ON dl_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    game_id IN (
      SELECT id FROM dl_games WHERE student_id = auth.uid()
    )
  );

-- ================================================================
-- GRANTS (ensure permissions are set)
-- ================================================================
GRANT SELECT ON dl_clues TO authenticated;
GRANT SELECT, INSERT, UPDATE ON dl_games TO authenticated;
GRANT SELECT, INSERT ON dl_answers TO authenticated;

-- ================================================================
-- VERIFICATION QUERY
-- ================================================================
-- After running, verify all 6 policies were created:
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename LIKE 'dl_%'
ORDER BY tablename, policyname;

-- Expected output:
-- dl_answers | dl_answers_insert_policy | INSERT
-- dl_answers | dl_answers_select_policy | SELECT
-- dl_clues   | dl_clues_select_policy   | SELECT
-- dl_games   | dl_games_insert_policy   | INSERT
-- dl_games   | dl_games_select_policy   | SELECT
-- dl_games   | dl_games_update_policy   | UPDATE
