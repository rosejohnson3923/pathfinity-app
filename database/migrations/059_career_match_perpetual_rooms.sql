-- ================================================================
-- CAREER MATCH PERPETUAL ROOMS - DATABASE SCHEMA
-- Migration 059: Convert Career Match to Perpetual Room Architecture
-- ================================================================
-- This migration converts Career Match from manual room creation to
-- perpetual rooms that auto-assign players (like Career Bingo).
--
-- Changes:
-- - Drop old cm_rooms and cm_players tables (manual room system)
-- - Create cm_perpetual_rooms (always-on rooms)
-- - Create cm_game_sessions (games within rooms)
-- - Create cm_session_participants (players in each game)
-- - Keep cm_cards and cm_moves (game-specific data)
-- ================================================================

-- ================================================================
-- STEP 1: Drop old manual room tables
-- ================================================================

DROP TABLE IF EXISTS cm_moves CASCADE;
DROP TABLE IF EXISTS cm_cards CASCADE;
DROP TABLE IF EXISTS cm_players CASCADE;
DROP TABLE IF EXISTS cm_rooms CASCADE;

-- Drop old functions
DROP FUNCTION IF EXISTS cm_generate_room_code() CASCADE;
DROP FUNCTION IF EXISTS cm_initialize_cards(UUID, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS cm_process_card_flip(UUID, INTEGER, UUID) CASCADE;
DROP FUNCTION IF EXISTS cm_end_turn(UUID) CASCADE;

-- ================================================================
-- TABLE 1: cm_perpetual_rooms
-- Always-on rooms that run continuous Career Match games
-- ================================================================
CREATE TABLE IF NOT EXISTS cm_perpetual_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Room identification
  room_code VARCHAR(20) UNIQUE NOT NULL,          -- 'MATCH01', 'MATCH02', etc.
  room_name VARCHAR(200) NOT NULL,                -- 'Career Match - Room 1'
  difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),

  -- Current state
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'intermission', 'paused')),
  current_game_number INTEGER DEFAULT 1,
  current_game_id UUID,                           -- References cm_game_sessions

  -- Next game timing
  next_game_starts_at TIMESTAMPTZ,
  intermission_duration_seconds INTEGER DEFAULT 10,

  -- Capacity
  max_players_per_game INTEGER NOT NULL DEFAULT 6,
  current_player_count INTEGER DEFAULT 0,

  -- Game settings (based on difficulty)
  total_pairs INTEGER NOT NULL,                   -- 6 for easy, 10 for medium, 15 for hard
  grid_rows INTEGER NOT NULL,                     -- 3, 4, 5
  grid_cols INTEGER NOT NULL,                     -- 4, 5, 6
  turn_time_limit_seconds INTEGER DEFAULT 30,
  match_xp INTEGER DEFAULT 100,                   -- XP per match
  streak_bonus_xp INTEGER DEFAULT 50,             -- Bonus XP for 3+ streak

  -- AI configuration
  ai_fill_enabled BOOLEAN DEFAULT true,
  ai_difficulty_mix VARCHAR(20) DEFAULT 'mixed',  -- 'mixed', 'easy', 'medium', 'hard'

  -- Analytics
  total_games_played INTEGER DEFAULT 0,
  total_unique_players INTEGER DEFAULT 0,
  total_matches_made INTEGER DEFAULT 0,
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
CREATE INDEX idx_cm_perpetual_rooms_code ON cm_perpetual_rooms(room_code);
CREATE INDEX idx_cm_perpetual_rooms_difficulty ON cm_perpetual_rooms(difficulty);
CREATE INDEX idx_cm_perpetual_rooms_status ON cm_perpetual_rooms(status);
CREATE INDEX idx_cm_perpetual_rooms_active ON cm_perpetual_rooms(is_active) WHERE is_active = true;
CREATE INDEX idx_cm_perpetual_rooms_featured ON cm_perpetual_rooms(is_featured) WHERE is_featured = true;

-- Comments
COMMENT ON TABLE cm_perpetual_rooms IS 'Perpetual rooms that run continuous Career Match games';
COMMENT ON COLUMN cm_perpetual_rooms.room_code IS 'Unique room identifier (e.g., MATCH01)';
COMMENT ON COLUMN cm_perpetual_rooms.total_pairs IS 'Number of card pairs in the game (based on difficulty)';
COMMENT ON COLUMN cm_perpetual_rooms.ai_fill_enabled IS 'Whether to fill empty slots with AI players';

-- ================================================================
-- TABLE 2: cm_game_sessions
-- Individual game sessions within a perpetual room
-- ================================================================
CREATE TABLE IF NOT EXISTS cm_game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Room association
  perpetual_room_id UUID NOT NULL REFERENCES cm_perpetual_rooms(id) ON DELETE CASCADE,
  game_number INTEGER NOT NULL,                   -- Sequential number within room (1, 2, 3...)

  -- Game state
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),

  -- Match tracking
  total_pairs INTEGER NOT NULL,                   -- Total pairs to match
  pairs_remaining INTEGER NOT NULL,               -- Pairs still unmatched
  winners JSONB DEFAULT '[]',                     -- Array of {participant_id, pairs_matched, xp_earned, rank}

  -- Turn tracking
  current_turn_player_id UUID,                    -- Which participant's turn
  current_turn_number INTEGER DEFAULT 1,
  first_card_flipped INTEGER,                     -- Position of first flipped card (NULL = no card flipped)
  first_card_flipped_at TIMESTAMPTZ,              -- When first card was flipped

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Statistics
  total_participants INTEGER DEFAULT 0,
  human_participants INTEGER DEFAULT 0,
  ai_participants INTEGER DEFAULT 0,
  total_turns INTEGER DEFAULT 0,

  UNIQUE(perpetual_room_id, game_number)
);

-- Indexes
CREATE INDEX idx_cm_sessions_room ON cm_game_sessions(perpetual_room_id);
CREATE INDEX idx_cm_sessions_status ON cm_game_sessions(status);
CREATE INDEX idx_cm_sessions_started ON cm_game_sessions(started_at DESC);

-- Comments
COMMENT ON TABLE cm_game_sessions IS 'Individual game sessions within perpetual rooms';
COMMENT ON COLUMN cm_game_sessions.game_number IS 'Sequential game number within the room';
COMMENT ON COLUMN cm_game_sessions.winners IS 'JSON array of winners with final scores';
COMMENT ON COLUMN cm_game_sessions.first_card_flipped IS 'Position of first card in current turn (NULL if no card flipped)';

-- ================================================================
-- TABLE 3: cm_session_participants
-- Players in each game session (humans and AI)
-- ================================================================
CREATE TABLE IF NOT EXISTS cm_session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Session association
  game_session_id UUID NOT NULL REFERENCES cm_game_sessions(id) ON DELETE CASCADE,
  perpetual_room_id UUID NOT NULL REFERENCES cm_perpetual_rooms(id),

  -- Participant type
  participant_type VARCHAR(20) NOT NULL CHECK (participant_type IN ('human', 'ai_agent')),
  user_id UUID REFERENCES auth.users(id),         -- NULL for AI
  display_name VARCHAR(100) NOT NULL,

  -- AI config (if AI)
  ai_difficulty VARCHAR(20),                      -- 'easy', 'medium', 'hard', 'expert'
  ai_personality VARCHAR(50),                     -- 'QuickBot', 'SteadyBot', 'ThinkBot'

  -- Game state
  is_active_turn BOOLEAN DEFAULT false,           -- Is it this player's turn?
  turn_started_at TIMESTAMPTZ,                    -- When their turn started

  -- Scoring
  pairs_matched INTEGER DEFAULT 0,                -- How many pairs found
  total_xp INTEGER DEFAULT 0,                     -- Total XP earned
  arcade_xp INTEGER DEFAULT 0,                    -- Arcade XP (10:1 conversion to total_xp)
  current_streak INTEGER DEFAULT 0,               -- Current consecutive matches
  max_streak INTEGER DEFAULT 0,                   -- Longest streak
  turns_taken INTEGER DEFAULT 0,                  -- Total turns taken

  -- Status
  is_active BOOLEAN DEFAULT true,
  connection_status VARCHAR(20) DEFAULT 'connected',  -- 'connected', 'disconnected'

  -- Timing
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_cm_session_parts_session ON cm_session_participants(game_session_id);
CREATE INDEX idx_cm_session_parts_user ON cm_session_participants(user_id);
CREATE INDEX idx_cm_session_parts_type ON cm_session_participants(participant_type);
CREATE INDEX idx_cm_session_parts_active ON cm_session_participants(is_active) WHERE is_active = true;
CREATE INDEX idx_cm_session_parts_active_turn ON cm_session_participants(is_active_turn) WHERE is_active_turn = true;

-- Comments
COMMENT ON TABLE cm_session_participants IS 'Players in each game session (humans and AI players)';
COMMENT ON COLUMN cm_session_participants.is_active_turn IS 'Whether it is currently this player''s turn';
COMMENT ON COLUMN cm_session_participants.ai_difficulty IS 'AI player difficulty level';
COMMENT ON COLUMN cm_session_participants.arcade_xp IS 'Arcade XP earned (10:1 conversion to PathIQ XP)';

-- ================================================================
-- TABLE 4: cm_cards
-- Card positions and states for each game session
-- ================================================================
CREATE TABLE IF NOT EXISTS cm_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Session association
  game_session_id UUID NOT NULL REFERENCES cm_game_sessions(id) ON DELETE CASCADE,

  -- Card identification
  position INTEGER NOT NULL,                      -- 0-based position in grid
  pair_id INTEGER NOT NULL,                       -- Which pair (1-15)
  career_name VARCHAR(200) NOT NULL,
  career_image_path TEXT NOT NULL,

  -- Card state
  is_revealed BOOLEAN DEFAULT false,              -- Currently face-up
  is_matched BOOLEAN DEFAULT false,               -- Permanently matched
  matched_by_participant_id UUID REFERENCES cm_session_participants(id),
  matched_at TIMESTAMPTZ,

  -- Animation
  flip_delay INTEGER DEFAULT 0,                   -- Stagger animation (ms)

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(game_session_id, position)
);

-- Indexes
CREATE INDEX idx_cm_cards_session ON cm_cards(game_session_id);
CREATE INDEX idx_cm_cards_pair ON cm_cards(pair_id);
CREATE INDEX idx_cm_cards_matched ON cm_cards(is_matched);

-- Comments
COMMENT ON TABLE cm_cards IS 'Card positions and states for each game session';
COMMENT ON COLUMN cm_cards.position IS 'Position in grid (0-based index)';
COMMENT ON COLUMN cm_cards.pair_id IS 'Which pair this card belongs to (1-15)';

-- ================================================================
-- TABLE 5: cm_moves
-- Individual card flip moves for analytics
-- ================================================================
CREATE TABLE IF NOT EXISTS cm_moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Session references
  game_session_id UUID NOT NULL REFERENCES cm_game_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES cm_session_participants(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cm_cards(id) ON DELETE CASCADE,

  -- Move details
  turn_number INTEGER NOT NULL,
  flip_number INTEGER NOT NULL CHECK (flip_number IN (1, 2)),  -- First or second flip in turn
  position INTEGER NOT NULL,                      -- Position clicked
  career_name VARCHAR(200) NOT NULL,
  pair_id INTEGER NOT NULL,

  -- Result (only known after second flip)
  is_match BOOLEAN,                               -- NULL until second flip
  xp_earned INTEGER DEFAULT 0,
  streak_count INTEGER,

  -- Timing
  flipped_at TIMESTAMPTZ DEFAULT NOW(),
  response_time_seconds NUMERIC(6,2)
);

-- Indexes
CREATE INDEX idx_cm_moves_session ON cm_moves(game_session_id);
CREATE INDEX idx_cm_moves_participant ON cm_moves(participant_id);
CREATE INDEX idx_cm_moves_card ON cm_moves(card_id);
CREATE INDEX idx_cm_moves_turn ON cm_moves(turn_number);
CREATE INDEX idx_cm_moves_match ON cm_moves(is_match) WHERE is_match = true;

-- Comments
COMMENT ON TABLE cm_moves IS 'Individual card flip moves for analytics';
COMMENT ON COLUMN cm_moves.flip_number IS '1 for first card in turn, 2 for second card';
COMMENT ON COLUMN cm_moves.is_match IS 'NULL until second flip, then true/false';

-- ================================================================
-- FUNCTION: Initialize cards for a game session
-- ================================================================
CREATE OR REPLACE FUNCTION cm_initialize_cards(
  p_game_session_id UUID,
  p_difficulty VARCHAR(10)
)
RETURNS VOID AS $$
DECLARE
  v_total_pairs INTEGER;
  v_careers TEXT[];
  v_selected_careers TEXT[];
  v_shuffled_pairs INTEGER[];
  v_pair_id INTEGER;
  v_position INTEGER := 0;
  v_career TEXT;
  v_delay INTEGER := 0;
BEGIN
  -- Determine number of pairs based on difficulty
  v_total_pairs := CASE p_difficulty
    WHEN 'easy' THEN 6
    WHEN 'medium' THEN 10
    WHEN 'hard' THEN 15
    ELSE 6
  END;

  -- All 50 careers available
  v_careers := ARRAY[
    '3D Artist', 'Accountant', 'Auditor', 'Broadcast Engineer', 'Camera Operator',
    'Civil Engineer', 'Coach', 'Composer', 'Conductor', 'Content Writer',
    'Costume Designer', 'Data Scientist', 'Dentist', 'Educator', 'Electrician',
    'Engineer', 'Event Planner', 'Fashion Buyer', 'Financial Analyst', 'Fitness Trainer',
    'Geologist', 'Graphic Designer', 'IT Specialist', 'Interior Designer', 'Judge',
    'Makeup Artist', 'Marketing Manager', 'Mechanical Engineer', 'Music Producer', 'Nurse',
    'Nutritionist', 'Operations Manager', 'Paramedic', 'Pastry Chef', 'Pharmacist',
    'Photographer', 'Physical Therapist', 'Pilot', 'Plumber', 'Politician',
    'Producer', 'Public Relations Specialist', 'Radiologic Technologist', 'Real Estate Agent', 'Researcher',
    'Set Designer', 'Software Engineer', 'Talent Scout', 'UX Designer', 'Veterinarian'
  ];

  -- Randomly select careers for this game
  v_selected_careers := (
    SELECT ARRAY_AGG(career ORDER BY random())
    FROM (
      SELECT unnest(v_careers) AS career
      ORDER BY random()
      LIMIT v_total_pairs
    ) AS selected
  );

  -- Create pairs (each career appears twice)
  -- First, create array of pair IDs: [1,1,2,2,3,3,...,n,n]
  -- Shuffle by ordering rows with random() before aggregating
  v_shuffled_pairs := (
    SELECT ARRAY_AGG(pair_id)
    FROM (
      SELECT generate_series(1, v_total_pairs) AS pair_id
      UNION ALL
      SELECT generate_series(1, v_total_pairs) AS pair_id
    ) AS pairs
    ORDER BY random()
  );

  -- Insert cards in shuffled order
  FOREACH v_pair_id IN ARRAY v_shuffled_pairs
  LOOP
    v_career := v_selected_careers[v_pair_id];

    INSERT INTO cm_cards (
      game_session_id,
      position,
      pair_id,
      career_name,
      career_image_path,
      flip_delay
    ) VALUES (
      p_game_session_id,
      v_position,
      v_pair_id,
      v_career,
      '/assets/Discovered Live/Role - Landscape/' || v_career || '.png',
      v_delay
    );

    v_position := v_position + 1;
    v_delay := v_delay + 50;  -- Stagger flip animations by 50ms
  END LOOP;

  RAISE NOTICE 'Initialized % cards for session % (difficulty: %)',
    v_total_pairs * 2, p_game_session_id, p_difficulty;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cm_initialize_cards IS 'Initialize shuffled card deck for a game session';

-- ================================================================
-- FUNCTION: Update room statistics on game completion
-- ================================================================
CREATE OR REPLACE FUNCTION cm_update_room_stats_on_game_complete()
RETURNS TRIGGER AS $$
DECLARE
  room_id UUID;
  game_duration INTEGER;
  total_matches INTEGER;
BEGIN
  -- Only process on game completion
  IF NEW.status != 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  room_id := NEW.perpetual_room_id;
  game_duration := NEW.duration_seconds;
  total_matches := NEW.total_pairs;  -- All pairs were matched

  -- Update room statistics
  UPDATE cm_perpetual_rooms
  SET
    total_games_played = total_games_played + 1,
    total_matches_made = total_matches_made + total_matches,
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
CREATE TRIGGER trigger_cm_update_room_stats
  AFTER UPDATE OF status ON cm_game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION cm_update_room_stats_on_game_complete();

COMMENT ON FUNCTION cm_update_room_stats_on_game_complete IS 'Update perpetual room statistics when a game completes';

-- ================================================================
-- FUNCTION: Update room participant counts
-- ================================================================
CREATE OR REPLACE FUNCTION cm_update_room_participant_counts()
RETURNS TRIGGER AS $$
DECLARE
  room_id UUID;
  session_id UUID;
  human_count INTEGER;
  ai_count INTEGER;
BEGIN
  -- Determine room_id and session_id based on operation
  IF TG_OP = 'DELETE' THEN
    room_id := OLD.perpetual_room_id;
    session_id := OLD.game_session_id;
  ELSE
    room_id := NEW.perpetual_room_id;
    session_id := NEW.game_session_id;
  END IF;

  -- Count active participants in current session
  SELECT
    COUNT(*) FILTER (WHERE participant_type = 'human'),
    COUNT(*) FILTER (WHERE participant_type = 'ai_agent')
  INTO human_count, ai_count
  FROM cm_session_participants
  WHERE game_session_id = session_id
    AND is_active = true;

  -- Update session counts
  UPDATE cm_game_sessions
  SET
    total_participants = human_count + ai_count,
    human_participants = human_count,
    ai_participants = ai_count
  WHERE id = session_id;

  -- Update room counts
  UPDATE cm_perpetual_rooms
  SET
    current_player_count = human_count + ai_count,
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
CREATE TRIGGER trigger_cm_update_room_counts_insert
  AFTER INSERT ON cm_session_participants
  FOR EACH ROW
  EXECUTE FUNCTION cm_update_room_participant_counts();

CREATE TRIGGER trigger_cm_update_room_counts_update
  AFTER UPDATE OF is_active ON cm_session_participants
  FOR EACH ROW
  EXECUTE FUNCTION cm_update_room_participant_counts();

CREATE TRIGGER trigger_cm_update_room_counts_delete
  AFTER DELETE ON cm_session_participants
  FOR EACH ROW
  EXECUTE FUNCTION cm_update_room_participant_counts();

COMMENT ON FUNCTION cm_update_room_participant_counts IS 'Update room player counts when participants join/leave';

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Enable RLS on all new tables
ALTER TABLE cm_perpetual_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE cm_game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cm_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE cm_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cm_moves ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active rooms
CREATE POLICY "cm_perpetual_rooms_select_policy" ON cm_perpetual_rooms
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Anyone can view game sessions
CREATE POLICY "cm_game_sessions_select_policy" ON cm_game_sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Anyone can view session participants
CREATE POLICY "cm_session_participants_select_policy" ON cm_session_participants
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Anyone can view cards in their sessions
CREATE POLICY "cm_cards_select_policy" ON cm_cards
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Users can view moves in their sessions
CREATE POLICY "cm_moves_select_policy" ON cm_moves
  FOR SELECT
  TO authenticated
  USING (
    participant_id IN (
      SELECT id FROM cm_session_participants
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert their own moves
CREATE POLICY "cm_moves_insert_policy" ON cm_moves
  FOR INSERT
  TO authenticated
  WITH CHECK (
    participant_id IN (
      SELECT id FROM cm_session_participants
      WHERE user_id = auth.uid()
    )
  );

-- ================================================================
-- GRANTS
-- ================================================================

-- Grant appropriate permissions
GRANT SELECT ON cm_perpetual_rooms TO authenticated;
GRANT SELECT ON cm_game_sessions TO authenticated;
GRANT SELECT ON cm_session_participants TO authenticated;
GRANT SELECT ON cm_cards TO authenticated;
GRANT SELECT, INSERT ON cm_moves TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ================================================================
-- INITIAL DATA: Create featured rooms
-- ================================================================

-- Insert featured perpetual rooms
INSERT INTO cm_perpetual_rooms (
  room_code,
  room_name,
  difficulty,
  max_players_per_game,
  total_pairs,
  grid_rows,
  grid_cols,
  turn_time_limit_seconds,
  match_xp,
  streak_bonus_xp,
  is_featured,
  ai_fill_enabled,
  ai_difficulty_mix
) VALUES
  -- Easy difficulty rooms
  (
    'MATCH01',
    'Career Match - Easy Room 1',
    'easy',
    6,
    6,   -- 6 pairs = 12 cards
    3,   -- 3 rows
    4,   -- 4 columns
    30,
    100,
    50,
    true,
    true,
    'mixed'
  ),
  (
    'MATCH02',
    'Career Match - Easy Room 2',
    'easy',
    6,
    6,
    3,
    4,
    30,
    100,
    50,
    true,
    true,
    'mixed'
  ),
  -- Medium difficulty rooms
  (
    'MATCH03',
    'Career Match - Medium Room 1',
    'medium',
    6,
    10,  -- 10 pairs = 20 cards
    4,   -- 4 rows
    5,   -- 5 columns
    30,
    100,
    50,
    true,
    true,
    'mixed'
  ),
  (
    'MATCH04',
    'Career Match - Medium Room 2',
    'medium',
    6,
    10,
    4,
    5,
    30,
    100,
    50,
    true,
    true,
    'mixed'
  ),
  -- Hard difficulty rooms
  (
    'MATCH05',
    'Career Match - Hard Room 1',
    'hard',
    6,
    15,  -- 15 pairs = 30 cards
    5,   -- 5 rows
    6,   -- 6 columns
    45,
    100,
    50,
    true,
    true,
    'mixed'
  ),
  (
    'MATCH06',
    'Career Match - Hard Room 2',
    'hard',
    6,
    15,
    5,
    6,
    45,
    100,
    50,
    true,
    true,
    'mixed'
  )
ON CONFLICT (room_code) DO NOTHING;

-- ================================================================
-- VERIFICATION
-- ================================================================
DO $$
DECLARE
    room_count INTEGER;
    easy_rooms INTEGER;
    medium_rooms INTEGER;
    hard_rooms INTEGER;
BEGIN
    -- Count rooms by difficulty
    SELECT COUNT(*) INTO room_count FROM cm_perpetual_rooms;
    SELECT COUNT(*) INTO easy_rooms FROM cm_perpetual_rooms WHERE difficulty = 'easy';
    SELECT COUNT(*) INTO medium_rooms FROM cm_perpetual_rooms WHERE difficulty = 'medium';
    SELECT COUNT(*) INTO hard_rooms FROM cm_perpetual_rooms WHERE difficulty = 'hard';

    RAISE NOTICE '';
    RAISE NOTICE '✅ Career Match Perpetual Rooms Migration Complete!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Total Rooms: %', room_count;
    RAISE NOTICE '   Easy Rooms: % (6 pairs, 3×4 grid)', easy_rooms;
    RAISE NOTICE '   Medium Rooms: % (10 pairs, 4×5 grid)', medium_rooms;
    RAISE NOTICE '   Hard Rooms: % (15 pairs, 5×6 grid)', hard_rooms;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables Created:';
    RAISE NOTICE '   ✓ cm_perpetual_rooms (always-on rooms)';
    RAISE NOTICE '   ✓ cm_game_sessions (games within rooms)';
    RAISE NOTICE '   ✓ cm_session_participants (players)';
    RAISE NOTICE '   ✓ cm_cards (card positions/states)';
    RAISE NOTICE '   ✓ cm_moves (move tracking)';
    RAISE NOTICE '';
    RAISE NOTICE 'Functions Created:';
    RAISE NOTICE '   ✓ cm_initialize_cards()';
    RAISE NOTICE '   ✓ cm_update_room_stats_on_game_complete()';
    RAISE NOTICE '   ✓ cm_update_room_participant_counts()';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '   → Refactor CareerMatchService to use perpetual rooms';
    RAISE NOTICE '   → Update CareerMatchTypes with new interfaces';
    RAISE NOTICE '   → Update lobby and test page UI';
    RAISE NOTICE '';
END $$;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
