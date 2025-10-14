-- ================================================================
-- Fix user_id columns in Discovered Live multiplayer tables
-- Migration 040d: Rename student_id to user_id
-- ================================================================
-- The tables were incorrectly using student_id referencing student_profiles
-- when they should use user_id referencing auth.users (auth.uid())
-- ================================================================

-- ================================================================
-- TABLE: dl_spectators
-- ================================================================

-- Drop existing policies that reference student_id
DROP POLICY IF EXISTS "spectators_insert_policy" ON dl_spectators;
DROP POLICY IF EXISTS "spectators_delete_policy" ON dl_spectators;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_spectators_student;

-- Drop foreign key constraint
ALTER TABLE dl_spectators DROP CONSTRAINT IF EXISTS dl_spectators_student_id_fkey;

-- Drop unique constraint
ALTER TABLE dl_spectators DROP CONSTRAINT IF EXISTS dl_spectators_perpetual_room_id_student_id_key;

-- Rename column
ALTER TABLE dl_spectators RENAME COLUMN student_id TO user_id;

-- Add new foreign key (references auth.users)
ALTER TABLE dl_spectators
  ADD CONSTRAINT dl_spectators_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add new unique constraint
ALTER TABLE dl_spectators
  ADD CONSTRAINT dl_spectators_perpetual_room_id_user_id_key
  UNIQUE (perpetual_room_id, user_id);

-- Add new index
CREATE INDEX idx_spectators_user ON dl_spectators(user_id);

-- Recreate policies with user_id
CREATE POLICY "spectators_insert_policy" ON dl_spectators
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "spectators_delete_policy" ON dl_spectators
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ================================================================
-- TABLE: dl_session_participants
-- ================================================================

-- Drop existing policies that reference student_id
DROP POLICY IF EXISTS "click_events_select_policy" ON dl_click_events;
DROP POLICY IF EXISTS "click_events_insert_policy" ON dl_click_events;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_session_parts_student;

-- Drop foreign key constraint
ALTER TABLE dl_session_participants DROP CONSTRAINT IF EXISTS dl_session_participants_student_id_fkey;

-- Rename column
ALTER TABLE dl_session_participants RENAME COLUMN student_id TO user_id;

-- Add new foreign key (references auth.users, nullable for AI agents)
ALTER TABLE dl_session_participants
  ADD CONSTRAINT dl_session_participants_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add new index
CREATE INDEX idx_session_parts_user ON dl_session_participants(user_id);

-- Recreate policies with user_id
CREATE POLICY "click_events_select_policy" ON dl_click_events
  FOR SELECT
  TO authenticated
  USING (
    participant_id IN (
      SELECT id FROM dl_session_participants
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "click_events_insert_policy" ON dl_click_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    participant_id IN (
      SELECT id FROM dl_session_participants
      WHERE user_id = auth.uid()
    )
  );

-- ================================================================
-- UPDATE TRIGGER FUNCTIONS
-- ================================================================

-- Update spectator count function (no changes needed, uses dynamic column names)
-- Update participant count function (no changes needed, uses dynamic column names)

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON COLUMN dl_spectators.user_id IS 'User ID from auth.users (auth.uid())';
COMMENT ON COLUMN dl_session_participants.user_id IS 'User ID from auth.users (NULL for AI agents)';

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
