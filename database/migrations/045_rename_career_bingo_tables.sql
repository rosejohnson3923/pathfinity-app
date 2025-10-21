-- ================================================================
-- RENAME CAREER BINGO TABLES: dl_* → cb_*
-- Migration 045: Separate Career Bingo from Discovered Live namespace
-- ================================================================
-- This migration renames all Career Bingo tables from dl_* to cb_*
-- to clearly distinguish Career Bingo's database structure
-- ================================================================

-- Rename tables (preserves all data, indexes, and constraints)
ALTER TABLE IF EXISTS dl_clues RENAME TO cb_clues;
ALTER TABLE IF EXISTS dl_games RENAME TO cb_games;
ALTER TABLE IF EXISTS dl_answers RENAME TO cb_answers;
ALTER TABLE IF EXISTS dl_perpetual_rooms RENAME TO cb_perpetual_rooms;
ALTER TABLE IF EXISTS dl_game_sessions RENAME TO cb_game_sessions;
ALTER TABLE IF EXISTS dl_session_participants RENAME TO cb_session_participants;
ALTER TABLE IF EXISTS dl_spectators RENAME TO cb_spectators;
ALTER TABLE IF EXISTS dl_click_events RENAME TO cb_click_events;

-- Update foreign key constraint names for clarity
-- (Foreign keys are automatically updated when tables are renamed,
-- but we can rename the constraints themselves for clarity)

-- Update any sequences (auto-increment IDs are preserved automatically)

-- Add comments to document the renaming
COMMENT ON TABLE cb_clues IS 'Career Bingo: Career clues for bingo cards';
COMMENT ON TABLE cb_games IS 'Career Bingo: Game state and configuration';
COMMENT ON TABLE cb_answers IS 'Career Bingo: Player answers and submissions';
COMMENT ON TABLE cb_perpetual_rooms IS 'Career Bingo: Multiplayer game rooms';
COMMENT ON TABLE cb_game_sessions IS 'Career Bingo: Individual game sessions';
COMMENT ON TABLE cb_session_participants IS 'Career Bingo: Players in game sessions (live players + AI)';
COMMENT ON TABLE cb_spectators IS 'Career Bingo: Players watching games';
COMMENT ON TABLE cb_click_events IS 'Career Bingo: Click tracking for analytics';

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename LIKE 'cb_%';

    IF table_count >= 8 THEN
        RAISE NOTICE '✅ Successfully renamed % Career Bingo tables from dl_* to cb_*', table_count;
    ELSE
        RAISE NOTICE '⚠️ Warning: Only % cb_* tables found (expected 8)', table_count;
    END IF;
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
-- Career Bingo now uses cb_* namespace
-- Next steps: Update application code to use new table names
-- ================================================================
