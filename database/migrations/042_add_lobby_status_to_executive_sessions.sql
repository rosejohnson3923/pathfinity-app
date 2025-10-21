-- ================================================================
-- ADD LOBBY STATUS TO cc_executive_sessions
-- Migration 042: Support lobby/waiting state for sessions
-- ================================================================
-- This migration adds 'lobby' as a valid status for executive sessions
-- to support the session-based architecture where each player gets
-- their own session instance when joining a room.
-- ================================================================

-- Add 'lobby' to the status check constraint
-- First, drop the existing constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'cc_executive_sessions_status_check'
    ) THEN
        ALTER TABLE cc_executive_sessions
        DROP CONSTRAINT cc_executive_sessions_status_check;
    END IF;
END $$;

-- Add the new constraint with 'lobby' status
ALTER TABLE cc_executive_sessions
ADD CONSTRAINT cc_executive_sessions_status_check
CHECK (status IN ('lobby', 'in_progress', 'completed', 'abandoned'));

-- Comment explaining the statuses
COMMENT ON COLUMN cc_executive_sessions.status IS
'Session status: lobby (waiting in room), in_progress (actively playing), completed (finished), abandoned (left before completing)';

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
-- Sessions can now be created in "lobby" status when players join rooms
-- This enables session-scoped leaderboards and player instances
-- ================================================================
