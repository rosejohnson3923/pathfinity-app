-- =====================================================
-- Career Challenge Multiplayer (CCM) - Game Sessions & Participants
-- Phase 2: Individual games and players within perpetual rooms
-- Created: October 16, 2025
-- =====================================================

-- =====================================================
-- TABLE: ccm_game_sessions
-- Individual 5-round games within perpetual rooms
-- =====================================================

CREATE TABLE IF NOT EXISTS ccm_game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Room association
  perpetual_room_id UUID NOT NULL REFERENCES ccm_perpetual_rooms(id) ON DELETE CASCADE,
  game_number INTEGER NOT NULL,              -- 1, 2, 3, ... (within this room)

  -- Game state
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  current_round INTEGER DEFAULT 1 CHECK (current_round BETWEEN 1 AND 5),

  -- Round progression
  total_rounds INTEGER DEFAULT 5,
  rounds_completed INTEGER DEFAULT 0 CHECK (rounds_completed BETWEEN 0 AND 5),

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Participants
  total_participants INTEGER DEFAULT 0,
  human_participants INTEGER DEFAULT 0,
  ai_participants INTEGER DEFAULT 0,

  -- Game results
  winner_participant_id UUID,               -- References ccm_session_participants
  winning_score INTEGER,
  all_scores JSONB DEFAULT '[]'::JSONB,     -- Array of {participant_id, display_name, score, rank}

  UNIQUE(perpetual_room_id, game_number)
);

-- =====================================================
-- TABLE: ccm_session_participants
-- Players (human + AI) in each CCM game
-- =====================================================

CREATE TABLE IF NOT EXISTS ccm_session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Session association
  game_session_id UUID NOT NULL REFERENCES ccm_game_sessions(id) ON DELETE CASCADE,
  perpetual_room_id UUID NOT NULL REFERENCES ccm_perpetual_rooms(id),

  -- Participant type
  participant_type VARCHAR(20) NOT NULL CHECK (participant_type IN ('human', 'ai_agent')),
  student_id UUID,                           -- NULL for AI (OAuth user ID, no FK)
  display_name VARCHAR(100) NOT NULL,

  -- AI config (if AI)
  ai_difficulty VARCHAR(20) CHECK (ai_difficulty IN ('beginner', 'steady', 'skilled', 'expert')),
  ai_personality VARCHAR(50),                -- For behavioral variance

  -- Player's hand (references to card IDs)
  role_hand JSONB NOT NULL DEFAULT '[]'::JSONB,      -- Array of 10 role card IDs
  synergy_hand JSONB NOT NULL DEFAULT '[]'::JSONB,   -- Array of 5 synergy card IDs (always same 5)
  has_golden_card BOOLEAN DEFAULT true,               -- True until used
  golden_used_round INTEGER CHECK (golden_used_round BETWEEN 1 AND 5), -- Which round they used Golden
  mvp_card_id UUID,                                   -- Current MVP card (NULL in Round 1)

  -- C-Suite selection (Round 1)
  c_suite_choice VARCHAR(20) CHECK (c_suite_choice IN ('ceo', 'cfo', 'cmo', 'cto', 'chro')),

  -- Scoring
  total_score INTEGER DEFAULT 0 CHECK (total_score BETWEEN 0 AND 600),
  round_scores JSONB DEFAULT '[]'::JSONB,    -- Array of scores per round [120, 95, 110, 105, 120]

  -- XP earned (10:1 conversion)
  ccm_points_earned INTEGER DEFAULT 0,       -- Total CCM points (same as total_score)
  xp_earned INTEGER DEFAULT 0,               -- XP = ccm_points ÷ 10

  -- Final rank
  final_rank INTEGER,                        -- 1, 2, 3, 4...
  is_winner BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,
  disconnected_at TIMESTAMPTZ,

  -- Timing
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ
);

-- =====================================================
-- Indexes
-- =====================================================

-- ccm_game_sessions indexes
CREATE INDEX idx_ccm_sessions_room ON ccm_game_sessions(perpetual_room_id);
CREATE INDEX idx_ccm_sessions_status ON ccm_game_sessions(status);
CREATE INDEX idx_ccm_sessions_started ON ccm_game_sessions(started_at);

-- ccm_session_participants indexes
CREATE INDEX idx_ccm_session_parts_session ON ccm_session_participants(game_session_id);
CREATE INDEX idx_ccm_session_parts_student ON ccm_session_participants(student_id);
CREATE INDEX idx_ccm_session_parts_type ON ccm_session_participants(participant_type);

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE ccm_game_sessions IS 'Individual 5-round Career Challenge Multiplayer games within perpetual rooms';
COMMENT ON TABLE ccm_session_participants IS 'Players (human + AI) participating in CCM games';

COMMENT ON COLUMN ccm_session_participants.role_hand IS 'Array of 10 role card IDs dealt to player';
COMMENT ON COLUMN ccm_session_participants.synergy_hand IS 'Array of 5 synergy card IDs (universal set - all players get same 5)';
COMMENT ON COLUMN ccm_session_participants.c_suite_choice IS 'Player C-Suite lens choice from Round 1 (affects scoring multipliers)';
COMMENT ON COLUMN ccm_session_participants.xp_earned IS 'XP awarded: total_score ÷ 10 (10:1 conversion)';

-- =====================================================
-- Verification
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ CCM Game Sessions & Participants Tables Created';
  RAISE NOTICE '   - Game sessions track 5-round games';
  RAISE NOTICE '   - Participants can be human or AI';
  RAISE NOTICE '   - Each player gets 10 role cards + 5 synergy cards';
  RAISE NOTICE '   - XP awarded at 10:1 ratio (score ÷ 10)';
  RAISE NOTICE '';
END $$;
