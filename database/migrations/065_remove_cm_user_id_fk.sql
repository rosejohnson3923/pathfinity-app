-- ================================================================
-- REMOVE CAREER MATCH USER_ID FOREIGN KEY
-- Migration 065: Remove FK constraint to match Career Bingo architecture
-- ================================================================
-- Career Bingo does NOT have a FK on user_id because:
-- 1. user_id can be NULL for AI players
-- 2. No referential integrity needed (user_id is just a label)
-- This matches Career Bingo's approach from migration 046
-- ================================================================

-- Drop the foreign key constraint entirely
ALTER TABLE cm_session_participants
  DROP CONSTRAINT IF EXISTS cm_session_participants_user_id_fkey;

-- Verification
DO $$
DECLARE
    fk_exists BOOLEAN;
BEGIN
    -- Check if FK constraint still exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE table_name = 'cm_session_participants'
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name = 'cm_session_participants_user_id_fkey'
    ) INTO fk_exists;

    RAISE NOTICE '';
    RAISE NOTICE '✅ Career Match user_id FK Removed!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   cm_session_participants.user_id:';
    IF fk_exists THEN
        RAISE NOTICE '     ❌ FK constraint still exists!';
    ELSE
        RAISE NOTICE '     ✅ No FK constraint (matches Career Bingo)';
    END IF;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   user_id can now be:';
    RAISE NOTICE '     - Auth user ID for human players';
    RAISE NOTICE '     - NULL for AI players';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
