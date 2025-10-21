-- Quick fix for existing AI players not showing in leaderboard
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Update all AI participants to ensure is_active = true
UPDATE cb_session_participants
SET is_active = true
WHERE participant_type = 'ai_agent'
  AND (is_active IS NULL OR is_active = false);

-- Show results
SELECT
  'AI players updated' as status,
  COUNT(*) as updated_count
FROM cb_session_participants
WHERE participant_type = 'ai_agent'
  AND is_active = true;
