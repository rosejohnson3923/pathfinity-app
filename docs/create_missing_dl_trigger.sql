-- ================================================================
-- Create missing trigger: trigger_update_dl_clue_analytics
-- Run this in Supabase SQL Editor to add the missing trigger
-- ================================================================

-- Create the trigger (function already exists)
CREATE TRIGGER trigger_update_dl_clue_analytics
  AFTER INSERT ON dl_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_dl_clue_analytics();

-- ================================================================
-- VERIFICATION QUERY
-- ================================================================
-- After running, verify both triggers exist:
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE '%dl%'
ORDER BY event_object_table, trigger_name;

-- Expected output:
-- trigger_name                      | event_object_table | action_timing | event_manipulation
-- ----------------------------------+--------------------+---------------+-------------------
-- trigger_update_dl_clue_analytics  | dl_answers         | AFTER         | INSERT
-- trigger_update_dl_game_total_xp   | dl_games           | BEFORE        | INSERT
-- trigger_update_dl_game_total_xp   | dl_games           | BEFORE        | UPDATE
