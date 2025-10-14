-- ================================================================
-- DISCOVERED LIVE! GAME - DATABASE SCHEMA
-- Migration 039: Create tables for Discovered Live! game
-- ================================================================
-- This migration creates the database schema for Discovered Live! -
-- an interactive bingo-style game where students match career clues
-- to careers, unlocking a bingo grid.
-- ================================================================

-- ================================================================
-- TABLE 1: dl_clues
-- Stores career clues (questions) for the Discovered Live! game
-- ================================================================
CREATE TABLE IF NOT EXISTS dl_clues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Career association
  career_code TEXT NOT NULL REFERENCES career_paths(career_code) ON DELETE CASCADE,

  -- Clue content
  clue_text TEXT NOT NULL,
  skill_connection TEXT NOT NULL, -- e.g., 'counting', 'letters', 'shapes', 'community'

  -- Difficulty & targeting
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
  grade_category TEXT NOT NULL CHECK (grade_category IN ('elementary', 'middle', 'high')),
  min_play_count INTEGER NOT NULL DEFAULT 0, -- Show clue after X playthroughs

  -- Distractor configuration (wrong answer options)
  distractor_careers TEXT[], -- Array of career_codes to use as wrong answers
  distractor_strategy TEXT DEFAULT 'related' CHECK (distractor_strategy IN ('random', 'related', 'same_skill')),

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Analytics (updated as game is played)
  times_shown INTEGER NOT NULL DEFAULT 0,
  times_correct INTEGER NOT NULL DEFAULT 0,
  avg_response_time_seconds FLOAT
);

-- Indexes for efficient queries
CREATE INDEX idx_dl_clues_career ON dl_clues(career_code);
CREATE INDEX idx_dl_clues_difficulty_grade ON dl_clues(difficulty, grade_category);
CREATE INDEX idx_dl_clues_skill ON dl_clues(skill_connection);
CREATE INDEX idx_dl_clues_active ON dl_clues(is_active) WHERE is_active = true;

-- Comments
COMMENT ON TABLE dl_clues IS 'Career clues (questions) for Discovered Live! game';
COMMENT ON COLUMN dl_clues.clue_text IS 'The clue text shown to students (e.g., "This career counts ingredients")';
COMMENT ON COLUMN dl_clues.skill_connection IS 'Which skill this clue references (counting, letters, shapes, etc.)';
COMMENT ON COLUMN dl_clues.min_play_count IS 'Clue only shown after student has played X times (for progressive difficulty)';
COMMENT ON COLUMN dl_clues.distractor_careers IS 'Suggested career codes to use as wrong answer options';

-- ================================================================
-- TABLE 2: dl_games
-- Tracks individual game sessions
-- ================================================================
CREATE TABLE IF NOT EXISTS dl_games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Player & journey
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  journey_summary_id UUID REFERENCES journey_summaries(id) ON DELETE SET NULL,

  -- Game configuration
  bingo_grid JSONB NOT NULL, -- 4x4 grid: {careers: [[career_code]], user_career_position: {row, col}}
  total_questions INTEGER NOT NULL DEFAULT 12,

  -- Game state
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress',
  current_question_index INTEGER NOT NULL DEFAULT 0,
  questions_asked JSONB NOT NULL DEFAULT '[]', -- Array of clue IDs that have been shown

  -- Progress tracking
  correct_answers INTEGER NOT NULL DEFAULT 0,
  incorrect_answers INTEGER NOT NULL DEFAULT 0,
  unlocked_squares JSONB NOT NULL DEFAULT '[]', -- Array of {row: X, col: Y} positions
  completed_rows INTEGER[] NOT NULL DEFAULT '{}',
  completed_columns INTEGER[] NOT NULL DEFAULT '{}',
  completed_diagonals INTEGER[] NOT NULL DEFAULT '{}',

  -- Scoring
  base_xp_earned INTEGER NOT NULL DEFAULT 0, -- XP from correct answers (10 XP each)
  bingo_bonus_xp INTEGER NOT NULL DEFAULT 0, -- XP from completing rows/columns
  streak_bonus_xp INTEGER NOT NULL DEFAULT 0, -- XP from answer streaks
  total_xp INTEGER NOT NULL DEFAULT 0,

  -- Performance tracking
  current_streak INTEGER NOT NULL DEFAULT 0,
  max_streak INTEGER NOT NULL DEFAULT 0,
  avg_response_time_seconds FLOAT,

  -- Timestamps
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_elapsed_seconds INTEGER,

  -- User's play count (for difficulty scaling)
  user_play_count INTEGER NOT NULL DEFAULT 1
);

-- Indexes
CREATE INDEX idx_dl_games_student ON dl_games(student_id);
CREATE INDEX idx_dl_games_journey ON dl_games(journey_summary_id);
CREATE INDEX idx_dl_games_status ON dl_games(status);
CREATE INDEX idx_dl_games_started ON dl_games(started_at DESC);

-- Comments
COMMENT ON TABLE dl_games IS 'Individual Discovered Live! game sessions';
COMMENT ON COLUMN dl_games.bingo_grid IS 'JSON: 4x4 grid of career codes and user career position';
COMMENT ON COLUMN dl_games.unlocked_squares IS 'JSON array of {row, col} positions that have been unlocked';
COMMENT ON COLUMN dl_games.user_play_count IS 'How many times this student has played (used for difficulty scaling)';

-- ================================================================
-- TABLE 3: dl_answers
-- Tracks individual question answers within games
-- ================================================================
CREATE TABLE IF NOT EXISTS dl_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Game reference
  game_id UUID NOT NULL REFERENCES dl_games(id) ON DELETE CASCADE,

  -- Question details
  clue_id UUID NOT NULL REFERENCES dl_clues(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  career_code TEXT NOT NULL REFERENCES career_paths(career_code),

  -- Answer tracking
  options_shown JSONB NOT NULL, -- Array of 4 career codes shown as options
  correct_option_index INTEGER NOT NULL,
  student_answer_index INTEGER,
  is_correct BOOLEAN NOT NULL,

  -- Timing
  response_time_seconds FLOAT,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Result (if correct, which square was unlocked)
  unlocked_position JSONB -- {row: X, col: Y}
);

-- Indexes
CREATE INDEX idx_dl_answers_game ON dl_answers(game_id);
CREATE INDEX idx_dl_answers_clue ON dl_answers(clue_id);
CREATE INDEX idx_dl_answers_student_via_game ON dl_answers(game_id);

-- Comments
COMMENT ON TABLE dl_answers IS 'Individual answers within Discovered Live! games';
COMMENT ON COLUMN dl_answers.options_shown IS 'JSON array of 4 career codes that were shown as options';
COMMENT ON COLUMN dl_answers.unlocked_position IS 'If correct, which bingo square was unlocked: {row: X, col: Y}';

-- ================================================================
-- FUNCTION: Update game total_xp automatically
-- ================================================================
CREATE OR REPLACE FUNCTION update_dl_game_total_xp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_xp := NEW.base_xp_earned + NEW.bingo_bonus_xp + NEW.streak_bonus_xp;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate total XP
CREATE TRIGGER trigger_update_dl_game_total_xp
  BEFORE INSERT OR UPDATE OF base_xp_earned, bingo_bonus_xp, streak_bonus_xp
  ON dl_games
  FOR EACH ROW
  EXECUTE FUNCTION update_dl_game_total_xp();

-- ================================================================
-- FUNCTION: Update clue analytics when shown/answered
-- ================================================================
CREATE OR REPLACE FUNCTION update_dl_clue_analytics()
RETURNS TRIGGER AS $$
DECLARE
  current_times_shown INTEGER;
BEGIN
  -- Get current times_shown value
  SELECT times_shown INTO current_times_shown
  FROM dl_clues
  WHERE id = NEW.clue_id;

  -- Update times_shown
  UPDATE dl_clues
  SET
    times_shown = times_shown + 1,
    updated_at = NOW()
  WHERE id = NEW.clue_id;

  -- If correct, update times_correct
  IF NEW.is_correct THEN
    UPDATE dl_clues
    SET times_correct = times_correct + 1
    WHERE id = NEW.clue_id;
  END IF;

  -- Update avg_response_time
  IF NEW.response_time_seconds IS NOT NULL THEN
    UPDATE dl_clues
    SET avg_response_time_seconds = (
      COALESCE(avg_response_time_seconds * current_times_shown, 0) + NEW.response_time_seconds
    ) / (current_times_shown + 1)
    WHERE id = NEW.clue_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update analytics
CREATE TRIGGER trigger_update_dl_clue_analytics
  AFTER INSERT ON dl_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_dl_clue_analytics();

-- ================================================================
-- FUNCTION: Get student's play count
-- Used to determine difficulty level
-- ================================================================
CREATE OR REPLACE FUNCTION get_student_dl_play_count(p_student_id UUID)
RETURNS INTEGER AS $$
DECLARE
  play_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO play_count
  FROM dl_games
  WHERE student_id = p_student_id
    AND status = 'completed';

  RETURN COALESCE(play_count, 0);
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE dl_clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE dl_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE dl_answers ENABLE ROW LEVEL SECURITY;

-- Policy: dl_clues are readable by all authenticated users
CREATE POLICY "dl_clues_select_policy" ON dl_clues
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Students can only view their own games
CREATE POLICY "dl_games_select_policy" ON dl_games
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Policy: Students can insert their own games
CREATE POLICY "dl_games_insert_policy" ON dl_games
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Policy: Students can update their own games
CREATE POLICY "dl_games_update_policy" ON dl_games
  FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid());

-- Policy: Students can view answers from their own games
CREATE POLICY "dl_answers_select_policy" ON dl_answers
  FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT id FROM dl_games WHERE student_id = auth.uid()
    )
  );

-- Policy: Students can insert answers to their own games
CREATE POLICY "dl_answers_insert_policy" ON dl_answers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    game_id IN (
      SELECT id FROM dl_games WHERE student_id = auth.uid()
    )
  );

-- ================================================================
-- GRANTS
-- ================================================================

-- Grant appropriate permissions
GRANT SELECT ON dl_clues TO authenticated;
GRANT SELECT, INSERT, UPDATE ON dl_games TO authenticated;
GRANT SELECT, INSERT ON dl_answers TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
-- Tables created:
--   1. dl_clues (question bank)
--   2. dl_games (game sessions)
--   3. dl_answers (individual answers)
--
-- Next steps:
--   1. Run seed file: 039b_dl_clues_seed.sql
--   2. Test game creation and answer submission
--   3. Verify RLS policies work correctly
-- ================================================================
