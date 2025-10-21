-- ================================================================
-- FIX AI PLAYER is_active VALUES
-- Migration 041: Update existing AI players to have is_active = true
-- ================================================================
-- This migration fixes AI players that were created before the
-- is_active field was properly set in the code. The schema has
-- DEFAULT true, but existing records may not have this value.
-- ================================================================

-- Update all AI participants to ensure is_active is true
UPDATE dl_session_participants
SET is_active = true
WHERE participant_type = 'ai_agent'
  AND (is_active IS NULL OR is_active = false);

-- Verify the fix
SELECT
  participant_type,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE is_active = true) as active_count,
  COUNT(*) FILTER (WHERE is_active IS NULL OR is_active = false) as inactive_count
FROM dl_session_participants
GROUP BY participant_type;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
-- This ensures all AI players appear in leaderboard queries that
-- filter by is_active = true
-- ================================================================
