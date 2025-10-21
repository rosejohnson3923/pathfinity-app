-- ================================================================
-- ADD FOREIGN KEYS FOR CAREER BINGO TABLES
-- Migration 046: Add essential foreign keys for cb_* tables
-- ================================================================
-- These foreign keys enable Supabase join syntax and maintain referential integrity
-- ================================================================

-- ================================================================
-- STEP 1: Add Foreign Keys for cb_game_sessions
-- ================================================================

-- Link game sessions to perpetual rooms
ALTER TABLE cb_game_sessions
ADD CONSTRAINT cb_game_sessions_perpetual_room_id_fkey
FOREIGN KEY (perpetual_room_id)
REFERENCES cb_perpetual_rooms(id)
ON DELETE CASCADE;

-- ================================================================
-- STEP 2: Add Foreign Keys for cb_session_participants
-- ================================================================

-- Link participants to game sessions
ALTER TABLE cb_session_participants
ADD CONSTRAINT cb_session_participants_game_session_id_fkey
FOREIGN KEY (game_session_id)
REFERENCES cb_game_sessions(id)
ON DELETE CASCADE;

-- Link participants to perpetual rooms
ALTER TABLE cb_session_participants
ADD CONSTRAINT cb_session_participants_perpetual_room_id_fkey
FOREIGN KEY (perpetual_room_id)
REFERENCES cb_perpetual_rooms(id)
ON DELETE CASCADE;

-- Note: user_id can be NULL for AI players, so no FK constraint for that column

-- ================================================================
-- STEP 3: Add Foreign Keys for cb_spectators
-- ================================================================

-- Link spectators to perpetual rooms
ALTER TABLE cb_spectators
ADD CONSTRAINT cb_spectators_perpetual_room_id_fkey
FOREIGN KEY (perpetual_room_id)
REFERENCES cb_perpetual_rooms(id)
ON DELETE CASCADE;

-- Link spectators to current game session (optional)
ALTER TABLE cb_spectators
ADD CONSTRAINT cb_spectators_current_game_session_id_fkey
FOREIGN KEY (current_game_session_id)
REFERENCES cb_game_sessions(id)
ON DELETE SET NULL;

-- ================================================================
-- STEP 4: Add Foreign Keys for cb_click_events
-- ================================================================

-- Link click events to game sessions
ALTER TABLE cb_click_events
ADD CONSTRAINT cb_click_events_game_session_id_fkey
FOREIGN KEY (game_session_id)
REFERENCES cb_game_sessions(id)
ON DELETE CASCADE;

-- Link click events to participants
ALTER TABLE cb_click_events
ADD CONSTRAINT cb_click_events_participant_id_fkey
FOREIGN KEY (participant_id)
REFERENCES cb_session_participants(id)
ON DELETE CASCADE;

-- Link click events to clues
ALTER TABLE cb_click_events
ADD CONSTRAINT cb_click_events_clue_id_fkey
FOREIGN KEY (clue_id)
REFERENCES cb_clues(id)
ON DELETE SET NULL;

-- ================================================================
-- STEP 5: Add Foreign Keys for cb_games (single-player)
-- ================================================================

-- Note: student_id references student_profiles table
-- We'll add this constraint only if the column exists and references a valid table

DO $$
BEGIN
    -- Check if student_profiles table exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'student_profiles') THEN
        -- Add foreign key for student_id
        ALTER TABLE cb_games
        ADD CONSTRAINT cb_games_student_id_fkey
        FOREIGN KEY (student_id)
        REFERENCES student_profiles(id)
        ON DELETE CASCADE;

        RAISE NOTICE 'Added student_id foreign key to cb_games';
    ELSE
        RAISE NOTICE 'Skipped student_id foreign key (student_profiles table not found)';
    END IF;
END $$;

-- ================================================================
-- STEP 6: Add Foreign Keys for cb_answers
-- ================================================================

-- Link answers to games
ALTER TABLE cb_answers
ADD CONSTRAINT cb_answers_game_id_fkey
FOREIGN KEY (game_id)
REFERENCES cb_games(id)
ON DELETE CASCADE;

-- Link answers to clues
ALTER TABLE cb_answers
ADD CONSTRAINT cb_answers_clue_id_fkey
FOREIGN KEY (clue_id)
REFERENCES cb_clues(id)
ON DELETE SET NULL;

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    -- Count foreign key constraints on cb_* tables
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND constraint_type = 'FOREIGN KEY'
      AND table_name LIKE 'cb_%';

    RAISE NOTICE '';
    RAISE NOTICE '✅ Career Bingo Foreign Keys Added!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Created % foreign key constraints', fk_count;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Foreign Keys Created:';
    RAISE NOTICE '   ✓ cb_game_sessions → cb_perpetual_rooms';
    RAISE NOTICE '   ✓ cb_session_participants → cb_game_sessions';
    RAISE NOTICE '   ✓ cb_session_participants → cb_perpetual_rooms';
    RAISE NOTICE '   ✓ cb_spectators → cb_perpetual_rooms';
    RAISE NOTICE '   ✓ cb_spectators → cb_game_sessions';
    RAISE NOTICE '   ✓ cb_click_events → cb_game_sessions';
    RAISE NOTICE '   ✓ cb_click_events → cb_session_participants';
    RAISE NOTICE '   ✓ cb_click_events → cb_clues';
    RAISE NOTICE '   ✓ cb_answers → cb_games';
    RAISE NOTICE '   ✓ cb_answers → cb_clues';
    RAISE NOTICE '';
    RAISE NOTICE 'Now Supabase joins like cb_perpetual_rooms(*) will work!';
    RAISE NOTICE '';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
