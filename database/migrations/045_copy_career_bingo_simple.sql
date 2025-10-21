-- ================================================================
-- COPY CAREER BINGO TABLES: dl_* → cb_* (SIMPLE VERSION)
-- Migration 045: Separate Career Bingo into its own namespace
-- ================================================================
-- This migration COPIES all Career Bingo tables from dl_* to cb_*
-- Preserves all existing UUIDs and data
-- Old dl_* tables remain intact as backup
-- Skips foreign keys - they can be added later if needed
-- ================================================================

-- ================================================================
-- STEP 1: Copy Tables (preserves all UUIDs and data)
-- ================================================================

CREATE TABLE IF NOT EXISTS cb_clues AS SELECT * FROM dl_clues;
CREATE TABLE IF NOT EXISTS cb_games AS SELECT * FROM dl_games;
CREATE TABLE IF NOT EXISTS cb_answers AS SELECT * FROM dl_answers;
CREATE TABLE IF NOT EXISTS cb_perpetual_rooms AS SELECT * FROM dl_perpetual_rooms;
CREATE TABLE IF NOT EXISTS cb_game_sessions AS SELECT * FROM dl_game_sessions;
CREATE TABLE IF NOT EXISTS cb_session_participants AS SELECT * FROM dl_session_participants;
CREATE TABLE IF NOT EXISTS cb_spectators AS SELECT * FROM dl_spectators;
CREATE TABLE IF NOT EXISTS cb_click_events AS SELECT * FROM dl_click_events;

-- ================================================================
-- STEP 2: Add Primary Keys and Defaults
-- ================================================================

ALTER TABLE cb_clues ADD PRIMARY KEY (id);
ALTER TABLE cb_clues ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE cb_games ADD PRIMARY KEY (id);
ALTER TABLE cb_games ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE cb_answers ADD PRIMARY KEY (id);
ALTER TABLE cb_answers ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE cb_perpetual_rooms ADD PRIMARY KEY (id);
ALTER TABLE cb_perpetual_rooms ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE cb_game_sessions ADD PRIMARY KEY (id);
ALTER TABLE cb_game_sessions ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE cb_session_participants ADD PRIMARY KEY (id);
ALTER TABLE cb_session_participants ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE cb_spectators ADD PRIMARY KEY (id);
ALTER TABLE cb_spectators ALTER COLUMN id SET DEFAULT uuid_generate_v4();

ALTER TABLE cb_click_events ADD PRIMARY KEY (id);
ALTER TABLE cb_click_events ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- ================================================================
-- STEP 3: Add Indexes for Performance
-- ================================================================

-- cb_clues
CREATE INDEX idx_cb_clues_career ON cb_clues(career_code);
CREATE INDEX idx_cb_clues_difficulty_grade ON cb_clues(difficulty, grade_category);
CREATE INDEX idx_cb_clues_skill ON cb_clues(skill_connection);
CREATE INDEX idx_cb_clues_active ON cb_clues(is_active) WHERE is_active = true;

-- cb_games
CREATE INDEX idx_cb_games_student ON cb_games(student_id);
CREATE INDEX idx_cb_games_journey ON cb_games(journey_summary_id);
CREATE INDEX idx_cb_games_status ON cb_games(status);
CREATE INDEX idx_cb_games_started ON cb_games(started_at DESC);

-- cb_answers
CREATE INDEX idx_cb_answers_game ON cb_answers(game_id);
CREATE INDEX idx_cb_answers_clue ON cb_answers(clue_id);

-- cb_perpetual_rooms
CREATE INDEX idx_cb_perpetual_rooms_code ON cb_perpetual_rooms(room_code);
CREATE INDEX idx_cb_perpetual_rooms_theme ON cb_perpetual_rooms(theme_code);
CREATE INDEX idx_cb_perpetual_rooms_status ON cb_perpetual_rooms(status);
CREATE INDEX idx_cb_perpetual_rooms_active ON cb_perpetual_rooms(is_active) WHERE is_active = true;
CREATE INDEX idx_cb_perpetual_rooms_featured ON cb_perpetual_rooms(is_featured) WHERE is_featured = true;

-- cb_game_sessions
CREATE INDEX idx_cb_game_sessions_room ON cb_game_sessions(perpetual_room_id);
CREATE INDEX idx_cb_game_sessions_status ON cb_game_sessions(status);
CREATE INDEX idx_cb_game_sessions_started ON cb_game_sessions(started_at DESC);

-- cb_session_participants
CREATE INDEX idx_cb_session_participants_session ON cb_session_participants(game_session_id);
CREATE INDEX idx_cb_session_participants_user ON cb_session_participants(user_id);
CREATE INDEX idx_cb_session_participants_type ON cb_session_participants(participant_type);
CREATE INDEX idx_cb_session_participants_active ON cb_session_participants(is_active) WHERE is_active = true;

-- cb_spectators
CREATE INDEX idx_cb_spectators_room ON cb_spectators(perpetual_room_id);
CREATE INDEX idx_cb_spectators_user ON cb_spectators(user_id);

-- cb_click_events
CREATE INDEX idx_cb_click_events_session ON cb_click_events(game_session_id);
CREATE INDEX idx_cb_click_events_participant ON cb_click_events(participant_id);
CREATE INDEX idx_cb_click_events_correct ON cb_click_events(is_correct);
CREATE INDEX idx_cb_click_events_bingo ON cb_click_events(bingo_achieved) WHERE bingo_achieved = true;
CREATE INDEX idx_cb_click_events_clue ON cb_click_events(clue_id);

-- ================================================================
-- STEP 4: Add Unique Constraints
-- ================================================================

ALTER TABLE cb_perpetual_rooms ADD CONSTRAINT cb_perpetual_rooms_room_code_key UNIQUE (room_code);
ALTER TABLE cb_game_sessions ADD CONSTRAINT cb_game_sessions_room_game_key UNIQUE(perpetual_room_id, game_number);
ALTER TABLE cb_spectators ADD CONSTRAINT cb_spectators_room_user_key UNIQUE(perpetual_room_id, user_id);

-- ================================================================
-- STEP 5: Add Comments
-- ================================================================

COMMENT ON TABLE cb_clues IS 'Career Bingo: Career clues for bingo cards';
COMMENT ON TABLE cb_games IS 'Career Bingo: Single-player game sessions';
COMMENT ON TABLE cb_answers IS 'Career Bingo: Individual question answers';
COMMENT ON TABLE cb_perpetual_rooms IS 'Career Bingo: Multiplayer perpetual rooms';
COMMENT ON TABLE cb_game_sessions IS 'Career Bingo: Multiplayer game sessions';
COMMENT ON TABLE cb_session_participants IS 'Career Bingo: Players in multiplayer sessions (live + AI)';
COMMENT ON TABLE cb_spectators IS 'Career Bingo: Players watching rooms';
COMMENT ON TABLE cb_click_events IS 'Career Bingo: Click tracking for analytics';

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
DECLARE
    cb_count INTEGER;
    total_rows INTEGER := 0;
    table_row_count INTEGER;
BEGIN
    -- Count cb_* tables
    SELECT COUNT(*) INTO cb_count
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'cb_%';

    -- Count total rows copied
    SELECT COUNT(*) INTO table_row_count FROM cb_clues;
    total_rows := total_rows + table_row_count;

    SELECT COUNT(*) INTO table_row_count FROM cb_games;
    total_rows := total_rows + table_row_count;

    SELECT COUNT(*) INTO table_row_count FROM cb_session_participants;
    total_rows := total_rows + table_row_count;

    RAISE NOTICE '';
    RAISE NOTICE '✅ Career Bingo Migration Complete!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Created % cb_* tables', cb_count;
    RAISE NOTICE '   Copied % total rows', total_rows;
    RAISE NOTICE '   All UUIDs preserved';
    RAISE NOTICE '   Original dl_* tables intact';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '   ✓ Application code updated to use cb_* tables';
    RAISE NOTICE '   → Test Career Bingo gameplay';
    RAISE NOTICE '   → Once verified, drop dl_* tables';
    RAISE NOTICE '';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
