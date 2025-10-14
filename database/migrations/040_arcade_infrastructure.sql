-- ================================================================
-- DISCOVERED LIVE! ARCADE - MODULAR GAME INFRASTRUCTURE
-- Migration 040: Create mechanic-based arcade system
-- ================================================================
-- This migration creates a flexible architecture that supports
-- multiple game types using shared tables and game engines.
--
-- Supported Game Mechanics:
--   1. BINGO - Grid-based pattern matching
--   2. RESOURCE_MANAGEMENT - Strategic resource allocation
--   3. DECISION_TREE - Branching narrative choices
--   4. SCENARIO_ROLEPLAY - Career immersion experiences
-- ================================================================

-- ================================================================
-- TABLE 1: game_mechanic_types
-- Defines base game mechanics (how games are played)
-- ================================================================
CREATE TABLE IF NOT EXISTS game_mechanic_types (
  mechanic_code TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('matching', 'strategy', 'narrative', 'simulation')),

  -- Mechanic configuration schema
  config_schema JSONB NOT NULL,

  -- Base scoring rules (can be overridden per game)
  base_scoring JSONB NOT NULL DEFAULT '{
    "correct_action": 10,
    "completion_bonus": 50,
    "time_bonus_enabled": true,
    "streak_multiplier": 1.5
  }'::jsonb,

  -- UI component for rendering
  component_name TEXT NOT NULL,

  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert core mechanic types
INSERT INTO game_mechanic_types (mechanic_code, display_name, description, category, config_schema, component_name) VALUES

-- BINGO Mechanic
('bingo', 'Bingo Grid', 'Grid-based pattern matching game', 'matching',
'{
  "grid_size": {"type": "object", "properties": {"rows": {"type": "integer"}, "cols": {"type": "integer"}}},
  "win_conditions": {"type": "array", "items": {"enum": ["row", "column", "diagonal", "full_card", "four_corners"]}},
  "center_free_space": {"type": "boolean"},
  "total_questions": {"type": "integer"},
  "time_per_question": {"type": "integer"}
}'::jsonb,
'BingoGameBoard'),

-- RESOURCE_MANAGEMENT Mechanic
('resource_management', 'Resource Manager', 'Strategic resource allocation and management', 'strategy',
'{
  "resources": {"type": "array", "items": {"type": "object", "properties": {
    "name": {"type": "string"},
    "starting_amount": {"type": "number"},
    "min": {"type": "number"},
    "max": {"type": "number"}
  }}},
  "total_rounds": {"type": "integer"},
  "time_per_round": {"type": "integer"},
  "success_threshold": {"type": "number"}
}'::jsonb,
'ResourceManagementBoard'),

-- DECISION_TREE Mechanic
('decision_tree', 'Decision Tree', 'Branching narrative with consequences', 'narrative',
'{
  "max_depth": {"type": "integer"},
  "branches_per_node": {"type": "integer"},
  "show_consequences": {"type": "boolean"},
  "allow_backtracking": {"type": "boolean"},
  "time_per_decision": {"type": "integer"}
}'::jsonb,
'DecisionTreeBoard'),

-- SCENARIO_ROLEPLAY Mechanic
('scenario_roleplay', 'Scenario Roleplay', 'Immersive career role-playing experience', 'simulation',
'{
  "scenario_type": {"type": "string", "enum": ["day_in_life", "crisis_response", "skill_challenge"]},
  "total_challenges": {"type": "integer"},
  "time_limit": {"type": "integer"},
  "performance_metrics": {"type": "array", "items": {"type": "string"}},
  "feedback_mode": {"type": "string", "enum": ["immediate", "end_of_scenario"]}
}'::jsonb,
'ScenarioRoleplayBoard');

-- ================================================================
-- TABLE 2: arcade_games
-- Specific game instances (mechanic + content theme)
-- ================================================================
CREATE TABLE IF NOT EXISTS arcade_games (
  game_code TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,

  -- Link to mechanic
  mechanic_code TEXT NOT NULL REFERENCES game_mechanic_types(mechanic_code) ON DELETE CASCADE,

  -- Content configuration
  content_source TEXT NOT NULL, -- 'careers', 'skills', 'industries', etc.
  content_filters JSONB DEFAULT '{}'::jsonb,

  -- Game-specific configuration
  game_config JSONB NOT NULL,

  -- Targeting & availability
  grade_categories TEXT[] NOT NULL DEFAULT '{"elementary", "middle", "high"}',
  unlock_requirements JSONB DEFAULT '{}'::jsonb,

  -- Display
  thumbnail_url TEXT,
  cover_image_url TEXT,
  sort_order INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert initial games
INSERT INTO arcade_games (game_code, display_name, description, icon, mechanic_code, content_source, game_config, grade_categories) VALUES

-- Career Detective Bingo
('career_bingo', 'Career Detective Bingo', 'Match career clues to unlock your bingo card!', '🎯', 'bingo', 'careers',
'{
  "grid_size": {"rows": 5, "cols": 5},
  "win_conditions": ["row", "column", "diagonal"],
  "center_free_space": true,
  "user_career_in_center": true,
  "total_questions": 20,
  "time_per_question": 8
}'::jsonb,
'{"elementary", "middle", "high"}'),

-- Career Budget Challenge
('career_budget', 'Career Budget Challenge', 'Manage your career resources wisely to succeed!', '💰', 'resource_management', 'careers',
'{
  "resources": [
    {"name": "time", "starting_amount": 40, "min": 0, "max": 40, "unit": "hours/week"},
    {"name": "money", "starting_amount": 1000, "min": 0, "max": 5000, "unit": "dollars"},
    {"name": "energy", "starting_amount": 100, "min": 0, "max": 100, "unit": "points"}
  ],
  "total_rounds": 10,
  "time_per_round": 30,
  "success_threshold": 0.7
}'::jsonb,
'{"middle", "high"}'),

-- Career Path Explorer
('career_path_explorer', 'Career Path Explorer', 'Make decisions and discover where your choices lead!', '🛤️', 'decision_tree', 'careers',
'{
  "max_depth": 5,
  "branches_per_node": 3,
  "show_consequences": true,
  "allow_backtracking": false,
  "time_per_decision": 15
}'::jsonb,
'{"middle", "high"}'),

-- Day in the Life
('day_in_life', 'Day in the Life', 'Experience a real day in your dream career!', '👔', 'scenario_roleplay', 'careers',
'{
  "scenario_type": "day_in_life",
  "total_challenges": 8,
  "time_limit": 600,
  "performance_metrics": ["professionalism", "efficiency", "problem_solving", "teamwork"],
  "feedback_mode": "immediate"
}'::jsonb,
'{"middle", "high"}');

-- ================================================================
-- TABLE 3: game_content
-- Universal content pool for all games
-- ================================================================
CREATE TABLE IF NOT EXISTS game_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Content classification
  content_source TEXT NOT NULL, -- 'careers', 'skills', 'industries'
  content_type TEXT NOT NULL, -- 'clue', 'scenario', 'decision', 'challenge', 'resource_event'

  -- The actual content (flexible JSONB structure)
  content_data JSONB NOT NULL,

  -- Metadata
  subject_id TEXT, -- career_code, skill_code, etc.
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  grade_category TEXT CHECK (grade_category IN ('elementary', 'middle', 'high')),
  tags TEXT[],

  -- Usage analytics
  times_used INTEGER NOT NULL DEFAULT 0,
  times_correct INTEGER NOT NULL DEFAULT 0,
  avg_response_time_seconds FLOAT,
  avg_rating FLOAT,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_review BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for game_content
CREATE INDEX idx_game_content_source ON game_content(content_source);
CREATE INDEX idx_game_content_type ON game_content(content_type);
CREATE INDEX idx_game_content_subject ON game_content(subject_id);
CREATE INDEX idx_game_content_difficulty_grade ON game_content(difficulty, grade_category);
CREATE INDEX idx_game_content_active ON game_content(is_active) WHERE is_active = true;

-- ================================================================
-- TABLE 4: game_sessions
-- Universal game session tracking
-- ================================================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Game identification
  game_code TEXT NOT NULL REFERENCES arcade_games(game_code) ON DELETE CASCADE,
  mechanic_code TEXT NOT NULL REFERENCES game_mechanic_types(mechanic_code) ON DELETE CASCADE,

  -- Player
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  journey_summary_id UUID REFERENCES journey_summaries(id) ON DELETE SET NULL,

  -- Configuration snapshot (what was used for this session)
  session_config JSONB NOT NULL,

  -- Game state (mechanic-specific, stored as JSONB)
  game_state JSONB NOT NULL,

  -- Progress tracking
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress',
  current_round INTEGER NOT NULL DEFAULT 0,
  total_rounds INTEGER NOT NULL,
  content_shown UUID[] DEFAULT '{}', -- Array of game_content.id

  -- Scoring
  correct_count INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  base_xp INTEGER NOT NULL DEFAULT 0,
  bonus_xp INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,

  -- Performance metrics
  current_streak INTEGER NOT NULL DEFAULT 0,
  max_streak INTEGER NOT NULL DEFAULT 0,
  performance_data JSONB DEFAULT '{}'::jsonb, -- Mechanic-specific metrics

  -- Achievements
  achievements JSONB DEFAULT '[]'::jsonb,

  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_elapsed_seconds INTEGER,

  -- Play count for this specific game
  user_game_play_count INTEGER NOT NULL DEFAULT 1
);

-- Indexes for game_sessions
CREATE INDEX idx_game_sessions_student ON game_sessions(student_id);
CREATE INDEX idx_game_sessions_game ON game_sessions(game_code);
CREATE INDEX idx_game_sessions_journey ON game_sessions(journey_summary_id);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_game_sessions_started ON game_sessions(started_at DESC);

-- ================================================================
-- TABLE 5: game_interactions
-- Universal interaction/response tracking
-- ================================================================
CREATE TABLE IF NOT EXISTS game_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Session reference
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,

  -- Content reference (nullable for mechanic-generated interactions)
  content_id UUID REFERENCES game_content(id) ON DELETE SET NULL,
  round_number INTEGER NOT NULL,

  -- Interaction type (mechanic-specific)
  interaction_type TEXT NOT NULL, -- 'answer', 'decision', 'allocation', 'action'

  -- Interaction data (flexible JSONB)
  interaction_data JSONB NOT NULL,

  -- Outcome
  is_correct BOOLEAN,
  is_optimal BOOLEAN, -- For strategy games
  xp_earned INTEGER NOT NULL DEFAULT 0,

  -- Feedback
  feedback_text TEXT,
  feedback_data JSONB,

  -- Timing
  response_time_seconds FLOAT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for game_interactions
CREATE INDEX idx_game_interactions_session ON game_interactions(session_id);
CREATE INDEX idx_game_interactions_content ON game_interactions(content_id);
CREATE INDEX idx_game_interactions_round ON game_interactions(session_id, round_number);

-- ================================================================
-- TABLE 6: game_leaderboards
-- Cross-game leaderboard tracking
-- ================================================================
CREATE TABLE IF NOT EXISTS game_leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Scope
  game_code TEXT REFERENCES arcade_games(game_code) ON DELETE CASCADE,
  mechanic_code TEXT REFERENCES game_mechanic_types(mechanic_code) ON DELETE CASCADE,
  leaderboard_type TEXT NOT NULL CHECK (leaderboard_type IN ('daily', 'weekly', 'monthly', 'all_time', 'grade_level')),

  -- Player
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  student_grade_level TEXT,

  -- Stats
  total_xp INTEGER NOT NULL DEFAULT 0,
  games_played INTEGER NOT NULL DEFAULT 0,
  games_completed INTEGER NOT NULL DEFAULT 0,
  avg_score FLOAT,
  best_score INTEGER,

  -- Rankings
  rank INTEGER,
  percentile FLOAT,

  -- Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for leaderboards
CREATE INDEX idx_leaderboards_game ON game_leaderboards(game_code, leaderboard_type);
CREATE INDEX idx_leaderboards_student ON game_leaderboards(student_id);
CREATE INDEX idx_leaderboards_rank ON game_leaderboards(leaderboard_type, rank);

-- ================================================================
-- FUNCTIONS & TRIGGERS
-- ================================================================

-- Function: Auto-calculate total XP
CREATE OR REPLACE FUNCTION calculate_session_total_xp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_xp := NEW.base_xp + NEW.bonus_xp;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_session_xp
  BEFORE INSERT OR UPDATE OF base_xp, bonus_xp
  ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_session_total_xp();

-- Function: Update content usage analytics
CREATE OR REPLACE FUNCTION update_content_analytics()
RETURNS TRIGGER AS $$
DECLARE
  current_times_used INTEGER;
BEGIN
  -- Get current usage count
  SELECT times_used INTO current_times_used
  FROM game_content
  WHERE id = NEW.content_id;

  -- Update times_used
  UPDATE game_content
  SET times_used = times_used + 1,
      updated_at = NOW()
  WHERE id = NEW.content_id;

  -- If correct, update times_correct
  IF NEW.is_correct THEN
    UPDATE game_content
    SET times_correct = times_correct + 1
    WHERE id = NEW.content_id;
  END IF;

  -- Update avg_response_time
  IF NEW.response_time_seconds IS NOT NULL THEN
    UPDATE game_content
    SET avg_response_time_seconds = (
      COALESCE(avg_response_time_seconds * current_times_used, 0) + NEW.response_time_seconds
    ) / (current_times_used + 1)
    WHERE id = NEW.content_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_content_analytics
  AFTER INSERT ON game_interactions
  FOR EACH ROW
  WHEN (NEW.content_id IS NOT NULL)
  EXECUTE FUNCTION update_content_analytics();

-- Function: Get student's play count for a specific game
CREATE OR REPLACE FUNCTION get_student_game_play_count(
  p_student_id UUID,
  p_game_code TEXT
)
RETURNS INTEGER AS $$
DECLARE
  play_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO play_count
  FROM game_sessions
  WHERE student_id = p_student_id
    AND game_code = p_game_code
    AND status = 'completed';

  RETURN COALESCE(play_count, 0);
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE game_mechanic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE arcade_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_leaderboards ENABLE ROW LEVEL SECURITY;

-- Policies: Public read access to game catalog
CREATE POLICY "game_mechanics_public_read" ON game_mechanic_types
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "arcade_games_public_read" ON arcade_games
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "game_content_public_read" ON game_content
  FOR SELECT TO authenticated USING (is_active = true);

-- Policies: Students can manage their own sessions
CREATE POLICY "sessions_own_select" ON game_sessions
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "sessions_own_insert" ON game_sessions
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "sessions_own_update" ON game_sessions
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid());

-- Policies: Students can manage their own interactions
CREATE POLICY "interactions_own_select" ON game_interactions
  FOR SELECT TO authenticated
  USING (session_id IN (SELECT id FROM game_sessions WHERE student_id = auth.uid()));

CREATE POLICY "interactions_own_insert" ON game_interactions
  FOR INSERT TO authenticated
  WITH CHECK (session_id IN (SELECT id FROM game_sessions WHERE student_id = auth.uid()));

-- Policies: Leaderboards readable by all
CREATE POLICY "leaderboards_public_read" ON game_leaderboards
  FOR SELECT TO authenticated USING (true);

-- ================================================================
-- GRANTS
-- ================================================================

GRANT SELECT ON game_mechanic_types TO authenticated;
GRANT SELECT ON arcade_games TO authenticated;
GRANT SELECT ON game_content TO authenticated;
GRANT SELECT, INSERT, UPDATE ON game_sessions TO authenticated;
GRANT SELECT, INSERT ON game_interactions TO authenticated;
GRANT SELECT ON game_leaderboards TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON TABLE game_mechanic_types IS 'Base game mechanics (bingo, resource_management, etc.)';
COMMENT ON TABLE arcade_games IS 'Specific game instances combining mechanics with content themes';
COMMENT ON TABLE game_content IS 'Universal content pool for all games';
COMMENT ON TABLE game_sessions IS 'Individual game play sessions';
COMMENT ON TABLE game_interactions IS 'Player actions and responses within games';
COMMENT ON TABLE game_leaderboards IS 'Cross-game leaderboard rankings';

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
-- Next steps:
--   1. Migrate existing dl_clues to game_content
--   2. Migrate existing dl_games to game_sessions
--   3. Build game engine classes
--   4. Update UI components
-- ================================================================
