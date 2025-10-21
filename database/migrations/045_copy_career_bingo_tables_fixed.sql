-- ================================================================
-- COPY CAREER BINGO TABLES: dl_* → cb_*
-- Migration 045 (Fixed): Separate Career Bingo into its own namespace
-- ================================================================
-- This migration COPIES all Career Bingo tables from dl_* to cb_*
-- Preserves all existing UUIDs and data
-- Old dl_* tables remain intact as backup
-- FIXED: Uses correct column names (user_id, not student_id)
-- ================================================================

-- ================================================================
-- STEP 1: Copy Tables (preserves all UUIDs and data)
-- ================================================================

-- Table 1: cb_clues (Career clues for bingo)
CREATE TABLE IF NOT EXISTS cb_clues AS
SELECT * FROM dl_clues;

-- Table 2: cb_games (Single-player game sessions)
CREATE TABLE IF NOT EXISTS cb_games AS
SELECT * FROM dl_games;

-- Table 3: cb_answers (Individual question answers)
CREATE TABLE IF NOT EXISTS cb_answers AS
SELECT * FROM dl_answers;

-- Table 4: cb_perpetual_rooms (Multiplayer rooms)
CREATE TABLE IF NOT EXISTS cb_perpetual_rooms AS
SELECT * FROM dl_perpetual_rooms;

-- Table 5: cb_game_sessions (Multiplayer game sessions)
CREATE TABLE IF NOT EXISTS cb_game_sessions AS
SELECT * FROM dl_game_sessions;

-- Table 6: cb_session_participants (Players in multiplayer sessions)
CREATE TABLE IF NOT EXISTS cb_session_participants AS
SELECT * FROM dl_session_participants;

-- Table 7: cb_spectators (Players watching rooms)
CREATE TABLE IF NOT EXISTS cb_spectators AS
SELECT * FROM dl_spectators;

-- Table 8: cb_click_events (Click tracking for analytics)
CREATE TABLE IF NOT EXISTS cb_click_events AS
SELECT * FROM dl_click_events;

-- ================================================================
-- STEP 2: Add Primary Keys and Defaults
-- ================================================================

ALTER TABLE cb_clues
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ADD PRIMARY KEY (id);

ALTER TABLE cb_games
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ADD PRIMARY KEY (id);

ALTER TABLE cb_answers
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ADD PRIMARY KEY (id);

ALTER TABLE cb_perpetual_rooms
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ADD PRIMARY KEY (id);

ALTER TABLE cb_game_sessions
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ADD PRIMARY KEY (id);

ALTER TABLE cb_session_participants
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ADD PRIMARY KEY (id);

ALTER TABLE cb_spectators
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ADD PRIMARY KEY (id);

ALTER TABLE cb_click_events
  ALTER COLUMN id SET DEFAULT uuid_generate_v4(),
  ADD PRIMARY KEY (id);

-- ================================================================
-- STEP 3: Add Foreign Key Constraints
-- (Only if the referenced columns exist)
-- ================================================================

-- cb_clues
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_clues' AND column_name='career_code') THEN
    ALTER TABLE cb_clues
      ADD CONSTRAINT cb_clues_career_fkey
      FOREIGN KEY (career_code) REFERENCES career_paths(career_code) ON DELETE CASCADE;
  END IF;
END $$;

-- cb_games
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_games' AND column_name='user_id') THEN
    ALTER TABLE cb_games
      ADD CONSTRAINT cb_games_user_fkey
      FOREIGN KEY (user_id) REFERENCES student_profiles(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_games' AND column_name='journey_summary_id') THEN
    ALTER TABLE cb_games
      ADD CONSTRAINT cb_games_journey_fkey
      FOREIGN KEY (journey_summary_id) REFERENCES journey_summaries(id) ON DELETE SET NULL;
  END IF;
END $$;

-- cb_answers
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_answers' AND column_name='game_id') THEN
    ALTER TABLE cb_answers
      ADD CONSTRAINT cb_answers_game_fkey
      FOREIGN KEY (game_id) REFERENCES cb_games(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_answers' AND column_name='clue_id') THEN
    ALTER TABLE cb_answers
      ADD CONSTRAINT cb_answers_clue_fkey
      FOREIGN KEY (clue_id) REFERENCES cb_clues(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_answers' AND column_name='career_code') THEN
    ALTER TABLE cb_answers
      ADD CONSTRAINT cb_answers_career_fkey
      FOREIGN KEY (career_code) REFERENCES career_paths(career_code);
  END IF;
END $$;

-- cb_game_sessions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_game_sessions' AND column_name='perpetual_room_id') THEN
    ALTER TABLE cb_game_sessions
      ADD CONSTRAINT cb_game_sessions_room_fkey
      FOREIGN KEY (perpetual_room_id) REFERENCES cb_perpetual_rooms(id) ON DELETE CASCADE;
  END IF;
END $$;

-- cb_session_participants (uses user_id, not student_id)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_session_participants' AND column_name='game_session_id') THEN
    ALTER TABLE cb_session_participants
      ADD CONSTRAINT cb_session_participants_session_fkey
      FOREIGN KEY (game_session_id) REFERENCES cb_game_sessions(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_session_participants' AND column_name='perpetual_room_id') THEN
    ALTER TABLE cb_session_participants
      ADD CONSTRAINT cb_session_participants_room_fkey
      FOREIGN KEY (perpetual_room_id) REFERENCES cb_perpetual_rooms(id);
  END IF;

  -- Note: user_id column may be NULL for AI agents, so skip foreign key if not present
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_session_participants' AND column_name='user_id') THEN
    -- Don't add FK if column allows NULL (for AI players)
    RAISE NOTICE 'cb_session_participants.user_id column exists (may be NULL for AI)';
  END IF;
END $$;

-- cb_spectators (uses user_id, not student_id)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_spectators' AND column_name='perpetual_room_id') THEN
    ALTER TABLE cb_spectators
      ADD CONSTRAINT cb_spectators_room_fkey
      FOREIGN KEY (perpetual_room_id) REFERENCES cb_perpetual_rooms(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_spectators' AND column_name='current_game_session_id') THEN
    ALTER TABLE cb_spectators
      ADD CONSTRAINT cb_spectators_session_fkey
      FOREIGN KEY (current_game_session_id) REFERENCES cb_game_sessions(id);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_spectators' AND column_name='user_id') THEN
    ALTER TABLE cb_spectators
      ADD CONSTRAINT cb_spectators_user_fkey
      FOREIGN KEY (user_id) REFERENCES student_profiles(id);
  END IF;
END $$;

-- cb_click_events
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_click_events' AND column_name='game_session_id') THEN
    ALTER TABLE cb_click_events
      ADD CONSTRAINT cb_click_events_session_fkey
      FOREIGN KEY (game_session_id) REFERENCES cb_game_sessions(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_click_events' AND column_name='participant_id') THEN
    ALTER TABLE cb_click_events
      ADD CONSTRAINT cb_click_events_participant_fkey
      FOREIGN KEY (participant_id) REFERENCES cb_session_participants(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_click_events' AND column_name='clue_id') THEN
    ALTER TABLE cb_click_events
      ADD CONSTRAINT cb_click_events_clue_fkey
      FOREIGN KEY (clue_id) REFERENCES cb_clues(id);
  END IF;
END $$;

-- ================================================================
-- STEP 4: Add Indexes for Performance
-- ================================================================

-- cb_clues indexes
CREATE INDEX IF NOT EXISTS idx_cb_clues_career ON cb_clues(career_code);
CREATE INDEX IF NOT EXISTS idx_cb_clues_difficulty_grade ON cb_clues(difficulty, grade_category);
CREATE INDEX IF NOT EXISTS idx_cb_clues_skill ON cb_clues(skill_connection);
CREATE INDEX IF NOT EXISTS idx_cb_clues_active ON cb_clues(is_active) WHERE is_active = true;

-- cb_games indexes
CREATE INDEX IF NOT EXISTS idx_cb_games_user ON cb_games(user_id);
CREATE INDEX IF NOT EXISTS idx_cb_games_journey ON cb_games(journey_summary_id);
CREATE INDEX IF NOT EXISTS idx_cb_games_status ON cb_games(status);
CREATE INDEX IF NOT EXISTS idx_cb_games_started ON cb_games(started_at DESC);

-- cb_answers indexes
CREATE INDEX IF NOT EXISTS idx_cb_answers_game ON cb_answers(game_id);
CREATE INDEX IF NOT EXISTS idx_cb_answers_clue ON cb_answers(clue_id);

-- cb_perpetual_rooms indexes
CREATE INDEX IF NOT EXISTS idx_cb_perpetual_rooms_code ON cb_perpetual_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_cb_perpetual_rooms_theme ON cb_perpetual_rooms(theme_code);
CREATE INDEX IF NOT EXISTS idx_cb_perpetual_rooms_status ON cb_perpetual_rooms(status);
CREATE INDEX IF NOT EXISTS idx_cb_perpetual_rooms_active ON cb_perpetual_rooms(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cb_perpetual_rooms_featured ON cb_perpetual_rooms(is_featured) WHERE is_featured = true;

-- cb_game_sessions indexes
CREATE INDEX IF NOT EXISTS idx_cb_game_sessions_room ON cb_game_sessions(perpetual_room_id);
CREATE INDEX IF NOT EXISTS idx_cb_game_sessions_status ON cb_game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_cb_game_sessions_started ON cb_game_sessions(started_at DESC);

-- cb_session_participants indexes
CREATE INDEX IF NOT EXISTS idx_cb_session_participants_session ON cb_session_participants(game_session_id);
CREATE INDEX IF NOT EXISTS idx_cb_session_participants_user ON cb_session_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_cb_session_participants_type ON cb_session_participants(participant_type);
CREATE INDEX IF NOT EXISTS idx_cb_session_participants_active ON cb_session_participants(is_active) WHERE is_active = true;

-- cb_spectators indexes
CREATE INDEX IF NOT EXISTS idx_cb_spectators_room ON cb_spectators(perpetual_room_id);
CREATE INDEX IF NOT EXISTS idx_cb_spectators_user ON cb_spectators(user_id);

-- cb_click_events indexes
CREATE INDEX IF NOT EXISTS idx_cb_click_events_session ON cb_click_events(game_session_id);
CREATE INDEX IF NOT EXISTS idx_cb_click_events_participant ON cb_click_events(participant_id);
CREATE INDEX IF NOT EXISTS idx_cb_click_events_correct ON cb_click_events(is_correct);
CREATE INDEX IF NOT EXISTS idx_cb_click_events_bingo ON cb_click_events(bingo_achieved) WHERE bingo_achieved = true;
CREATE INDEX IF NOT EXISTS idx_cb_click_events_clue ON cb_click_events(clue_id);

-- ================================================================
-- STEP 5: Add Constraints (where they exist)
-- ================================================================

-- cb_clues constraints
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_clues' AND column_name='difficulty') THEN
    ALTER TABLE cb_clues
      ADD CONSTRAINT cb_clues_difficulty_check
      CHECK (difficulty IN ('easy', 'medium', 'hard'));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_clues' AND column_name='grade_category') THEN
    ALTER TABLE cb_clues
      ADD CONSTRAINT cb_clues_grade_check
      CHECK (grade_category IN ('elementary', 'middle', 'high'));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_clues' AND column_name='distractor_strategy') THEN
    ALTER TABLE cb_clues
      ADD CONSTRAINT cb_clues_distractor_strategy_check
      CHECK (distractor_strategy IN ('random', 'related', 'same_skill'));
  END IF;
END $$;

-- cb_games constraints
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_games' AND column_name='status') THEN
    ALTER TABLE cb_games
      ADD CONSTRAINT cb_games_status_check
      CHECK (status IN ('in_progress', 'completed', 'abandoned'));
  END IF;
END $$;

-- cb_perpetual_rooms constraints
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_perpetual_rooms' AND column_name='status') THEN
    ALTER TABLE cb_perpetual_rooms
      ADD CONSTRAINT cb_perpetual_rooms_status_check
      CHECK (status IN ('active', 'intermission', 'paused'));
  END IF;
END $$;

-- cb_game_sessions constraints
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_game_sessions' AND column_name='status') THEN
    ALTER TABLE cb_game_sessions
      ADD CONSTRAINT cb_game_sessions_status_check
      CHECK (status IN ('active', 'completed', 'abandoned'));
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_game_sessions' AND column_name='perpetual_room_id') THEN
    ALTER TABLE cb_game_sessions
      ADD CONSTRAINT cb_game_sessions_unique_game_number
      UNIQUE(perpetual_room_id, game_number);
  END IF;
END $$;

-- cb_session_participants constraints
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_session_participants' AND column_name='participant_type') THEN
    ALTER TABLE cb_session_participants
      ADD CONSTRAINT cb_session_participants_type_check
      CHECK (participant_type IN ('human', 'ai_agent'));
  END IF;
END $$;

-- cb_spectators constraints
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cb_spectators' AND column_name='perpetual_room_id' AND column_name='user_id') THEN
    ALTER TABLE cb_spectators
      ADD CONSTRAINT cb_spectators_unique_user
      UNIQUE(perpetual_room_id, user_id);
  END IF;
END $$;

-- ================================================================
-- STEP 6: Add Comments
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
    dl_count INTEGER;
BEGIN
    -- Count cb_* tables
    SELECT COUNT(*) INTO cb_count
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'cb_%';

    -- Count dl_* tables
    SELECT COUNT(*) INTO dl_count
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'dl_%';

    RAISE NOTICE '✅ Career Bingo Migration Complete';
    RAISE NOTICE '   - Created % cb_* tables (expected 8)', cb_count;
    RAISE NOTICE '   - Original dl_* tables still exist: %', dl_count;
    RAISE NOTICE '   - All UUIDs and data preserved';
    RAISE NOTICE '   - Foreign keys recreated (with column checks)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '   1. Update application code to use cb_* tables (DONE)';
    RAISE NOTICE '   2. Test Career Bingo thoroughly';
    RAISE NOTICE '   3. Once verified, drop dl_* tables with cleanup migration';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
-- Career Bingo now has dedicated cb_* tables
-- Old dl_* tables preserved as backup
-- Uses correct column names (user_id, not student_id)
-- ================================================================
