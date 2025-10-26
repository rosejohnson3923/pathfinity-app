-- ================================================================
-- RENAME 'HUMAN' TO 'USER' TERMINOLOGY
-- Migration 066: Update participant_type and column names
-- ================================================================
-- Changes:
-- 1. participant_type: 'human' → 'user'
-- 2. human_participants → user_participants
-- ================================================================

-- Update existing participant_type values from 'human' to 'user'
UPDATE cm_session_participants
SET participant_type = 'user'
WHERE participant_type = 'human';

-- Rename column in cm_game_sessions
ALTER TABLE cm_game_sessions
  RENAME COLUMN human_participants TO user_participants;

-- Rename column in cm_perpetual_rooms (if it exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'cm_perpetual_rooms'
        AND column_name = 'human_participants'
    ) THEN
        ALTER TABLE cm_perpetual_rooms
          RENAME COLUMN human_participants TO user_participants;
    END IF;
END $$;

-- Update CHECK constraint on participant_type (if it exists)
-- Note: We'll recreate the constraint with the new value
DO $$
BEGIN
    -- Drop old constraint if it exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.constraint_column_usage
        WHERE table_name = 'cm_session_participants'
        AND constraint_name LIKE '%participant_type%'
    ) THEN
        ALTER TABLE cm_session_participants
          DROP CONSTRAINT IF EXISTS cm_session_participants_participant_type_check;
    END IF;

    -- Add new constraint
    ALTER TABLE cm_session_participants
      ADD CONSTRAINT cm_session_participants_participant_type_check
      CHECK (participant_type IN ('user', 'ai_agent'));
END $$;

-- Verification
DO $$
DECLARE
    user_count INTEGER;
    ai_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count
    FROM cm_session_participants
    WHERE participant_type = 'user';

    SELECT COUNT(*) INTO ai_count
    FROM cm_session_participants
    WHERE participant_type = 'ai_agent';

    RAISE NOTICE '';
    RAISE NOTICE '✅ Terminology Updated: human → user';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   User participants: %', user_count;
    RAISE NOTICE '   AI participants: %', ai_count;
    RAISE NOTICE '   Column renamed: human_participants → user_participants';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
