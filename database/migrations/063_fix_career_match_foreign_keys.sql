-- ================================================================
-- FIX CAREER MATCH FOREIGN KEY CONSTRAINTS
-- Migration 063: Change user_id to reference student_profiles
-- ================================================================
-- The issue: user_id references auth.users(id), but should reference
-- student_profiles(id) to match Career Bingo architecture
-- ================================================================

-- Drop the incorrect foreign key constraint
ALTER TABLE cm_session_participants
  DROP CONSTRAINT IF EXISTS cm_session_participants_user_id_fkey;

-- Add the correct foreign key constraint
ALTER TABLE cm_session_participants
  ADD CONSTRAINT cm_session_participants_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES student_profiles(id)
  ON DELETE SET NULL;

-- Verification
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Career Match Foreign Keys Fixed!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   cm_session_participants.user_id now references:';
    RAISE NOTICE '     student_profiles(id) ✅';
    RAISE NOTICE '   (was: auth.users(id) ❌)';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
