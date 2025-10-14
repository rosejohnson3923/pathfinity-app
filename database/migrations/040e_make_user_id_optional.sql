-- ================================================================
-- Make user_id optional for mock auth testing
-- Migration 040e: Remove foreign key constraints temporarily
-- ================================================================
-- This allows the app to work with mock auth during development
-- In production, these constraints should be re-enabled
-- ================================================================

-- ================================================================
-- TABLE: dl_spectators
-- ================================================================

-- Drop foreign key constraint
ALTER TABLE dl_spectators DROP CONSTRAINT IF EXISTS dl_spectators_user_id_fkey;

-- Make user_id nullable
ALTER TABLE dl_spectators ALTER COLUMN user_id DROP NOT NULL;

-- Add comment
COMMENT ON COLUMN dl_spectators.user_id IS 'User ID (nullable for mock auth during development)';

-- ================================================================
-- TABLE: dl_session_participants
-- ================================================================

-- Drop foreign key constraint
ALTER TABLE dl_session_participants DROP CONSTRAINT IF EXISTS dl_session_participants_user_id_fkey;

-- user_id is already nullable, just update comment
COMMENT ON COLUMN dl_session_participants.user_id IS 'User ID (NULL for AI agents or mock auth)';

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
-- Changes:
-- 1. Removed dl_spectators.user_id foreign key constraint
-- 2. Made dl_spectators.user_id nullable
--
-- Note: In production, these constraints should be re-enabled
-- after implementing proper Supabase authentication
-- ================================================================
