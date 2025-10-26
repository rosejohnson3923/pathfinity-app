-- ================================================================
-- RECREATE cm_cards AND cm_moves TABLES
-- Run this to restore the dropped tables
-- ================================================================

-- TABLE: cm_cards
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
-- TABLE: cm_moves
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
-- DISABLE RLS (as per migration 062)
-- ================================================================
ALTER TABLE cm_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE cm_moves DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- ENABLE REALTIME (as per migration 067)
-- ================================================================
ALTER TABLE cm_cards REPLICA IDENTITY FULL;
ALTER TABLE cm_moves REPLICA IDENTITY FULL;
