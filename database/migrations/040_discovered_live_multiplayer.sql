-- ================================================================
-- DISCOVERED LIVE! MULTIPLAYER - DATABASE SCHEMA
-- Migration 040: Perpetual Rooms & Multiplayer Infrastructure
-- ================================================================
-- This migration extends Discovered Live! with multiplayer features:
-- - Perpetual rooms that run games 24/7
-- - Game sessions within rooms
-- - Click-to-answer mechanics
-- - AI agent support
-- - Spectator mode
-- ================================================================

-- ================================================================
-- TABLE 1: dl_perpetual_rooms
-- Always-on rooms that run continuous games
-- ================================================================
CREATE TABLE IF NOT EXISTS dl_perpetual_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Room identification
  room_code VARCHAR(20) UNIQUE NOT NULL,          -- 'GLOBAL01', 'GAME01', 'NURSE01'
  room_name VARCHAR(200) NOT NULL,                -- 'All Careers - Room 1'
  theme_code VARCHAR(100),                        -- 'global', 'game-tester', 'nurse', etc.

  -- Current state
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'intermission', 'paused')),
  current_game_number INTEGER DEFAULT 1,
  current_game_id UUID,                           -- References dl_game_sessions

  -- Next game timing
  next_game_starts_at TIMESTAMPTZ,
  intermission_duration_seconds INTEGER DEFAULT 10,

  -- Capacity
  max_players_per_game INTEGER NOT NULL DEFAULT 4,
  current_player_count INTEGER DEFAULT 0,
  spectator_count INTEGER DEFAULT 0,

  -- Game settings
  bingo_slots_per_game INTEGER NOT NULL,          -- How many bingos available per game
  question_time_limit_seconds INTEGER NOT NULL DEFAULT 15,
  questions_per_game INTEGER DEFAULT 20,
  grade_level VARCHAR(20) DEFAULT 'elementary',

  -- AI configuration
  ai_fill_enabled BOOLEAN DEFAULT true,
  ai_difficulty_mix VARCHAR(20) DEFAULT 'mixed',  -- 'mixed', 'easy', 'medium', 'hard'

  -- Analytics
  total_games_played INTEGER DEFAULT 0,
  total_unique_players INTEGER DEFAULT 0,
  total_bingos_won INTEGER DEFAULT 0,
  peak_concurrent_players INTEGER DEFAULT 0,
  avg_game_duration_seconds INTEGER,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_game_started_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_perpetual_rooms_code ON dl_perpetual_rooms(room_code);
CREATE INDEX idx_perpetual_rooms_theme ON dl_perpetual_rooms(theme_code);
CREATE INDEX idx_perpetual_rooms_status ON dl_perpetual_rooms(status);
CREATE INDEX idx_perpetual_rooms_active ON dl_perpetual_rooms(is_active) WHERE is_active = true;
CREATE INDEX idx_perpetual_rooms_featured ON dl_perpetual_rooms(is_featured) WHERE is_featured = true;

-- Comments
COMMENT ON TABLE dl_perpetual_rooms IS 'Perpetual rooms that run continuous Discovered Live! games';
COMMENT ON COLUMN dl_perpetual_rooms.room_code IS 'Unique room identifier (e.g., GLOBAL01)';
COMMENT ON COLUMN dl_perpetual_rooms.bingo_slots_per_game IS 'Number of bingos available per game (calculated from max_players)';
COMMENT ON COLUMN dl_perpetual_rooms.ai_fill_enabled IS 'Whether to fill empty slots with AI agents';

-- ================================================================
-- TABLE 2: dl_game_sessions
-- Individual game sessions within a perpetual room
-- ================================================================
CREATE TABLE IF NOT EXISTS dl_game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Room association
  perpetual_room_id UUID NOT NULL REFERENCES dl_perpetual_rooms(id) ON DELETE CASCADE,
  game_number INTEGER NOT NULL,                   -- Sequential number within room (1, 2, 3...)

  -- Game state
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),

  -- Bingo configuration
  bingo_slots_total INTEGER NOT NULL,
  bingo_slots_remaining INTEGER NOT NULL,
  bingo_winners JSONB DEFAULT '[]',               -- Array of {participantId, bingoNumber, timestamp, type, index}

  -- Question sequence
  current_question_number INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 20,
  questions_asked JSONB DEFAULT '[]',             -- Array of clue IDs already asked

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Statistics
  total_participants INTEGER DEFAULT 0,
  human_participants INTEGER DEFAULT 0,
  ai_participants INTEGER DEFAULT 0,

  UNIQUE(perpetual_room_id, game_number)
);

-- Indexes
CREATE INDEX idx_sessions_room ON dl_game_sessions(perpetual_room_id);
CREATE INDEX idx_sessions_status ON dl_game_sessions(status);
CREATE INDEX idx_sessions_started ON dl_game_sessions(started_at DESC);

-- Comments
COMMENT ON TABLE dl_game_sessions IS 'Individual game sessions within perpetual rooms';
COMMENT ON COLUMN dl_game_sessions.game_number IS 'Sequential game number within the room';
COMMENT ON COLUMN dl_game_sessions.bingo_winners IS 'JSON array of bingo winners with details';

-- ================================================================
-- TABLE 3: dl_session_participants
-- Players in each game session (humans and AI)
-- ================================================================
CREATE TABLE IF NOT EXISTS dl_session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Session association
  game_session_id UUID NOT NULL REFERENCES dl_game_sessions(id) ON DELETE CASCADE,
  perpetual_room_id UUID NOT NULL REFERENCES dl_perpetual_rooms(id),

  -- Participant type
  participant_type VARCHAR(20) NOT NULL CHECK (participant_type IN ('human', 'ai_agent')),
  student_id UUID REFERENCES student_profiles(id),    -- NULL for AI
  display_name VARCHAR(100) NOT NULL,

  -- AI config (if AI)
  ai_difficulty VARCHAR(20),                      -- 'easy', 'medium', 'hard', 'expert'
  ai_personality VARCHAR(50),                     -- 'QuickBot', 'SteadyBot', 'ThinkBot'

  -- Game state (unique card per player)
  bingo_card JSONB NOT NULL,                      -- {careers: [[...]], userCareerPosition: {row, col}}
  unlocked_squares JSONB DEFAULT '[]',            -- Array of {row, col}
  completed_lines JSONB DEFAULT '{}',             -- {rows: [], columns: [], diagonals: []}

  -- Scoring
  bingos_won INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  connection_status VARCHAR(20) DEFAULT 'connected',  -- 'connected', 'disconnected', 'spectating'

  -- Timing
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_session_parts_session ON dl_session_participants(game_session_id);
CREATE INDEX idx_session_parts_student ON dl_session_participants(student_id);
CREATE INDEX idx_session_parts_type ON dl_session_participants(participant_type);
CREATE INDEX idx_session_parts_active ON dl_session_participants(is_active) WHERE is_active = true;

-- Comments
COMMENT ON TABLE dl_session_participants IS 'Players in each game session (humans and AI agents)';
COMMENT ON COLUMN dl_session_participants.bingo_card IS 'Each player has a unique scrambled 5x5 bingo card';
COMMENT ON COLUMN dl_session_participants.ai_difficulty IS 'AI agent difficulty level';

-- ================================================================
-- TABLE 4: dl_spectators
-- Users currently watching a room (waiting for next game)
-- ================================================================
CREATE TABLE IF NOT EXISTS dl_spectators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Room association
  perpetual_room_id UUID NOT NULL REFERENCES dl_perpetual_rooms(id) ON DELETE CASCADE,
  current_game_session_id UUID REFERENCES dl_game_sessions(id),

  -- Student info
  student_id UUID NOT NULL REFERENCES student_profiles(id),
  display_name VARCHAR(100) NOT NULL,

  -- Status
  will_join_next_game BOOLEAN DEFAULT true,

  -- Timestamps
  started_spectating_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(perpetual_room_id, student_id)
);

-- Indexes
CREATE INDEX idx_spectators_room ON dl_spectators(perpetual_room_id);
CREATE INDEX idx_spectators_student ON dl_spectators(student_id);

-- Comments
COMMENT ON TABLE dl_spectators IS 'Users currently spectating a room, waiting for next game';
COMMENT ON COLUMN dl_spectators.will_join_next_game IS 'Whether spectator will join the next game automatically';

-- ================================================================
-- TABLE 5: dl_click_events
-- Track individual click events for analytics
-- ================================================================
CREATE TABLE IF NOT EXISTS dl_click_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Session references
  game_session_id UUID NOT NULL REFERENCES dl_game_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES dl_session_participants(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  clue_id UUID NOT NULL REFERENCES dl_clues(id),

  -- Click details
  clicked_career_code VARCHAR(100) NOT NULL,
  clicked_position JSONB NOT NULL,                -- {row: number, col: number}
  correct_career_code VARCHAR(100) NOT NULL,
  is_correct BOOLEAN NOT NULL,

  -- Timing
  question_started_at TIMESTAMPTZ NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  response_time_seconds NUMERIC(6,2),

  -- Result
  unlocked_position JSONB,                        -- Only if correct: {row, col}
  bingo_achieved BOOLEAN DEFAULT false,
  bingo_number INTEGER,                           -- Which bingo slot (1, 2, 3...)
  bingo_type VARCHAR(20),                         -- 'row', 'column', 'diagonal'
  bingo_index INTEGER,                            -- Which row/column/diagonal

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dl_clicks_session ON dl_click_events(game_session_id);
CREATE INDEX idx_dl_clicks_participant ON dl_click_events(participant_id);
CREATE INDEX idx_dl_clicks_correct ON dl_click_events(is_correct);
CREATE INDEX idx_dl_clicks_bingo ON dl_click_events(bingo_achieved) WHERE bingo_achieved = true;
CREATE INDEX idx_dl_clicks_clue ON dl_click_events(clue_id);

-- Comments
COMMENT ON TABLE dl_click_events IS 'Individual click events in multiplayer games for analytics';
COMMENT ON COLUMN dl_click_events.clicked_position IS 'Position on player''s unique card that was clicked';
COMMENT ON COLUMN dl_click_events.response_time_seconds IS 'Time from question start to click';

-- ================================================================
-- FUNCTION: Calculate bingo slots based on player count
-- ================================================================
CREATE OR REPLACE FUNCTION calculate_bingo_slots(player_count INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Base: Half the players can win, rounded up
  -- Min 2 bingos, Max 6 bingos
  RETURN GREATEST(2, LEAST(6, CEIL(player_count / 2.0)));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_bingo_slots IS 'Calculate number of bingo slots based on player count';

-- ================================================================
-- FUNCTION: Update room statistics on game completion
-- ================================================================
CREATE OR REPLACE FUNCTION update_room_stats_on_game_complete()
RETURNS TRIGGER AS $$
DECLARE
  room_id UUID;
  game_duration INTEGER;
  total_bingos INTEGER;
BEGIN
  -- Only process on game completion
  IF NEW.status != 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  room_id := NEW.perpetual_room_id;
  game_duration := NEW.duration_seconds;

  -- Count bingos in this game
  SELECT COUNT(*) INTO total_bingos
  FROM jsonb_array_elements(NEW.bingo_winners);

  -- Update room statistics
  UPDATE dl_perpetual_rooms
  SET
    total_games_played = total_games_played + 1,
    total_bingos_won = total_bingos_won + total_bingos,
    avg_game_duration_seconds = COALESCE(
      (avg_game_duration_seconds * total_games_played + game_duration) / (total_games_played + 1),
      game_duration
    ),
    updated_at = NOW()
  WHERE id = room_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_update_room_stats
  AFTER UPDATE OF status ON dl_game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_room_stats_on_game_complete();

COMMENT ON FUNCTION update_room_stats_on_game_complete IS 'Update perpetual room statistics when a game completes';

-- ================================================================
-- FUNCTION: Update room participant counts
-- ================================================================
CREATE OR REPLACE FUNCTION update_room_participant_counts()
RETURNS TRIGGER AS $$
DECLARE
  room_id UUID;
  human_count INTEGER;
  ai_count INTEGER;
BEGIN
  -- Determine room_id based on operation
  IF TG_OP = 'DELETE' THEN
    room_id := OLD.perpetual_room_id;
  ELSE
    room_id := NEW.perpetual_room_id;
  END IF;

  -- Get current game session for this room
  SELECT current_game_id INTO room_id
  FROM dl_perpetual_rooms
  WHERE id = room_id;

  -- Count active participants
  SELECT
    COUNT(*) FILTER (WHERE participant_type = 'human'),
    COUNT(*) FILTER (WHERE participant_type = 'ai_agent')
  INTO human_count, ai_count
  FROM dl_session_participants
  WHERE game_session_id = room_id
    AND is_active = true;

  -- Update room counts
  UPDATE dl_perpetual_rooms
  SET
    current_player_count = human_count + ai_count,
    updated_at = NOW()
  WHERE current_game_id = room_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_room_counts_insert
  AFTER INSERT ON dl_session_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_room_participant_counts();

CREATE TRIGGER trigger_update_room_counts_update
  AFTER UPDATE OF is_active ON dl_session_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_room_participant_counts();

CREATE TRIGGER trigger_update_room_counts_delete
  AFTER DELETE ON dl_session_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_room_participant_counts();

COMMENT ON FUNCTION update_room_participant_counts IS 'Update room player counts when participants join/leave';

-- ================================================================
-- FUNCTION: Update spectator counts
-- ================================================================
CREATE OR REPLACE FUNCTION update_spectator_counts()
RETURNS TRIGGER AS $$
DECLARE
  room_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    room_id := OLD.perpetual_room_id;
  ELSE
    room_id := NEW.perpetual_room_id;
  END IF;

  -- Count spectators for this room
  UPDATE dl_perpetual_rooms
  SET
    spectator_count = (
      SELECT COUNT(*)
      FROM dl_spectators
      WHERE perpetual_room_id = room_id
    ),
    updated_at = NOW()
  WHERE id = room_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trigger_update_spectator_counts_insert
  AFTER INSERT ON dl_spectators
  FOR EACH ROW
  EXECUTE FUNCTION update_spectator_counts();

CREATE TRIGGER trigger_update_spectator_counts_delete
  AFTER DELETE ON dl_spectators
  FOR EACH ROW
  EXECUTE FUNCTION update_spectator_counts();

COMMENT ON FUNCTION update_spectator_counts IS 'Update room spectator counts when spectators join/leave';

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Enable RLS on all new tables
ALTER TABLE dl_perpetual_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE dl_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dl_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE dl_spectators ENABLE ROW LEVEL SECURITY;
ALTER TABLE dl_click_events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active rooms
CREATE POLICY "perpetual_rooms_select_policy" ON dl_perpetual_rooms
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Anyone can view game sessions
CREATE POLICY "game_sessions_select_policy" ON dl_game_sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Anyone can view session participants
CREATE POLICY "session_participants_select_policy" ON dl_session_participants
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can view spectators in their room
CREATE POLICY "spectators_select_policy" ON dl_spectators
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can insert themselves as spectators
CREATE POLICY "spectators_insert_policy" ON dl_spectators
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Policy: Users can delete their own spectator records
CREATE POLICY "spectators_delete_policy" ON dl_spectators
  FOR DELETE
  TO authenticated
  USING (student_id = auth.uid());

-- Policy: Users can view click events in their sessions
CREATE POLICY "click_events_select_policy" ON dl_click_events
  FOR SELECT
  TO authenticated
  USING (
    participant_id IN (
      SELECT id FROM dl_session_participants
      WHERE student_id = auth.uid()
    )
  );

-- Policy: Users can insert their own click events
CREATE POLICY "click_events_insert_policy" ON dl_click_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    participant_id IN (
      SELECT id FROM dl_session_participants
      WHERE student_id = auth.uid()
    )
  );

-- ================================================================
-- GRANTS
-- ================================================================

-- Grant appropriate permissions
GRANT SELECT ON dl_perpetual_rooms TO authenticated;
GRANT SELECT ON dl_game_sessions TO authenticated;
GRANT SELECT ON dl_session_participants TO authenticated;
GRANT SELECT, INSERT, DELETE ON dl_spectators TO authenticated;
GRANT SELECT, INSERT ON dl_click_events TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ================================================================
-- INITIAL DATA: Create featured rooms
-- ================================================================

-- Insert featured perpetual rooms
INSERT INTO dl_perpetual_rooms (
  room_code,
  room_name,
  theme_code,
  max_players_per_game,
  bingo_slots_per_game,
  question_time_limit_seconds,
  questions_per_game,
  grade_level,
  is_featured,
  ai_fill_enabled,
  ai_difficulty_mix
) VALUES
  -- Global rooms
  (
    'GLOBAL01',
    'All Careers - Room 1',
    'global',
    4,
    2,  -- 4 players = 2 bingo slots
    15,
    20,
    'elementary',
    true,
    true,
    'mixed'
  ),
  (
    'GLOBAL02',
    'All Careers - Room 2',
    'global',
    6,
    3,  -- 6 players = 3 bingo slots
    12,
    20,
    'elementary',
    true,
    true,
    'mixed'
  ),
  -- Career-specific rooms
  (
    'GAME01',
    'Game Tester Deep Dive',
    'game-tester',
    4,
    2,
    10,
    20,
    'middle,high',
    true,
    true,
    'mixed'
  ),
  (
    'NURSE01',
    'Nursing Deep Dive',
    'nurse',
    4,
    2,
    12,
    20,
    'all',
    true,
    true,
    'mixed'
  ),
  (
    'TEACH01',
    'Teaching Deep Dive',
    'teacher',
    4,
    2,
    12,
    20,
    'all',
    true,
    true,
    'mixed'
  )
ON CONFLICT (room_code) DO NOTHING;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
-- Tables created:
--   1. dl_perpetual_rooms (always-on rooms)
--   2. dl_game_sessions (games within rooms)
--   3. dl_session_participants (players in each game)
--   4. dl_spectators (users watching rooms)
--   5. dl_click_events (click tracking)
--
-- Functions created:
--   1. calculate_bingo_slots() - Calculate bingo slots from player count
--   2. update_room_stats_on_game_complete() - Update room statistics
--   3. update_room_participant_counts() - Update player counts
--   4. update_spectator_counts() - Update spectator counts
--
-- Next steps:
--   1. Build PerpetualRoomManager service
--   2. Build AIAgentService
--   3. Implement WebSocket real-time sync
--   4. Build multiplayer UI components
-- ================================================================
