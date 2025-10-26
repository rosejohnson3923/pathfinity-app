-- ================================================================
-- FORCE FIX CAREER MATCH FOREIGN KEY CONSTRAINTS
-- Migration 064: Forcefully fix user_id foreign key
-- ================================================================

-- Drop ALL constraints on user_id column
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    FOR constraint_record IN
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'cm_session_participants'
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name LIKE '%user_id%'
    LOOP
        EXECUTE 'ALTER TABLE cm_session_participants DROP CONSTRAINT IF EXISTS ' || constraint_record.constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
    END LOOP;
END $$;

-- Add the correct foreign key constraint
ALTER TABLE cm_session_participants
  ADD CONSTRAINT cm_session_participants_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES student_profiles(id)
  ON DELETE SET NULL;

-- Verification
DO $$
DECLARE
    fk_table TEXT;
BEGIN
    SELECT ccu.table_name INTO fk_table
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'cm_session_participants'
      AND kcu.column_name = 'user_id';

    RAISE NOTICE '';
    RAISE NOTICE '✅ Career Match Foreign Keys FORCEFULLY Fixed!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   cm_session_participants.user_id now references:';
    RAISE NOTICE '     % ✅', fk_table;
    RAISE NOTICE '   (should be: student_profiles)';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
