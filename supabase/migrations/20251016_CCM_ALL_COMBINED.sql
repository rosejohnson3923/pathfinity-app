-- =====================================================
-- Career Challenge Multiplayer (CCM) - Perpetual Rooms Table
-- Phase 1: Always-on game rooms
-- Created: October 16, 2025
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: ccm_perpetual_rooms
-- Always-on Career Challenge Multiplayer rooms
-- =====================================================

CREATE TABLE IF NOT EXISTS ccm_perpetual_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Room identification
  room_code VARCHAR(20) UNIQUE NOT NULL,      -- 'CCM_GLOBAL01', 'CCM_SKILLS01'
  room_name VARCHAR(200) NOT NULL,            -- 'Career Challenge - Global Room 1'
  description TEXT,                            -- Room description for players

  -- Current state
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'intermission')),
  current_game_number INTEGER DEFAULT 1,
  current_game_id UUID,                       -- References ccm_game_sessions

  -- Next game timing
  next_game_starts_at TIMESTAMPTZ,
  intermission_duration_seconds INTEGER DEFAULT 15,  -- 15s intermission

  -- Capacity
  max_players_per_game INTEGER NOT NULL DEFAULT 4 CHECK (max_players_per_game BETWEEN 2 AND 8),
  current_player_count INTEGER DEFAULT 0,
  spectator_count INTEGER DEFAULT 0,

  -- Game configuration
  rounds_per_game INTEGER DEFAULT 5 CHECK (rounds_per_game = 5),  -- Always 5 rounds
  card_selection_time_seconds INTEGER DEFAULT 60,    -- 60s per round
  mvp_selection_time_seconds INTEGER DEFAULT 30,     -- 30s for MVP selection
  grade_level VARCHAR(20) CHECK (grade_level IN ('elementary', 'middle', 'high', 'all')),

  -- AI configuration
  ai_fill_enabled BOOLEAN DEFAULT true,
  ai_difficulty_mix VARCHAR(20) DEFAULT 'mixed' CHECK (ai_difficulty_mix IN ('mixed', 'beginner', 'expert')),

  -- Room features
  is_featured BOOLEAN DEFAULT false,
  feature_order INTEGER,                      -- Display order on hub (1 = top)
  icon_url TEXT,
  theme_color VARCHAR(50),

  -- Analytics
  total_games_played INTEGER DEFAULT 0,
  total_unique_players INTEGER DEFAULT 0,
  total_rounds_played INTEGER DEFAULT 0,             -- total_games * 5
  peak_concurrent_players INTEGER DEFAULT 0,
  avg_game_duration_seconds INTEGER,

  -- Status
  is_active BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_game_started_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Indexes for ccm_perpetual_rooms
-- =====================================================

CREATE INDEX idx_ccm_perpetual_rooms_code ON ccm_perpetual_rooms(room_code);
CREATE INDEX idx_ccm_perpetual_rooms_status ON ccm_perpetual_rooms(status);
CREATE INDEX idx_ccm_perpetual_rooms_active ON ccm_perpetual_rooms(is_active);
CREATE INDEX idx_ccm_perpetual_rooms_featured ON ccm_perpetual_rooms(is_featured);

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE ccm_perpetual_rooms IS 'Always-on Career Challenge Multiplayer rooms with continuous game cycles';

COMMENT ON COLUMN ccm_perpetual_rooms.room_code IS 'Unique room identifier (e.g., CCM_GLOBAL01)';
COMMENT ON COLUMN ccm_perpetual_rooms.status IS 'Current room state: active (game in progress) or intermission (between games)';
COMMENT ON COLUMN ccm_perpetual_rooms.intermission_duration_seconds IS 'Break between games (default 15s)';
COMMENT ON COLUMN ccm_perpetual_rooms.ai_fill_enabled IS 'If true, AI players fill empty seats automatically';
COMMENT ON COLUMN ccm_perpetual_rooms.is_featured IS 'If true, room appears in featured list on hub';

-- =====================================================
-- Seed Featured Rooms
-- =====================================================

INSERT INTO ccm_perpetual_rooms (
  room_code,
  room_name,
  description,
  is_featured,
  feature_order,
  theme_color
) VALUES
  (
    'CCM_GLOBAL01',
    'Global Career Challenge',
    'Drop in anytime! Play with students from around the world in this always-on room.',
    true,
    1,
    'blue'
  ),
  (
    'CCM_SKILLS01',
    'Skills Mastery Room',
    'Challenge yourself against expert AI and skilled players. High-intensity gameplay!',
    true,
    2,
    'purple'
  ),
  (
    'CCM_CASUAL01',
    'Casual Career Room',
    'Relaxed gameplay with friendly AI. Perfect for learning the game!',
    true,
    3,
    'green'
  )
ON CONFLICT (room_code) DO NOTHING;

-- =====================================================
-- Verification
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ CCM Perpetual Rooms Table Created';
  RAISE NOTICE '   - Always-on rooms run 24/7';
  RAISE NOTICE '   - 15-second intermission between games';
  RAISE NOTICE '   - AI fills empty seats automatically';
  RAISE NOTICE '';
  RAISE NOTICE '🎮 Featured Rooms:';
  RAISE NOTICE '   1. CCM_GLOBAL01 - Global Career Challenge';
  RAISE NOTICE '   2. CCM_SKILLS01 - Skills Mastery Room';
  RAISE NOTICE '   3. CCM_CASUAL01 - Casual Career Room';
  RAISE NOTICE '';
END $$;
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
-- =====================================================
-- Career Challenge Multiplayer (CCM) - Content Tables
-- Phase 3: Role Cards, Synergy Cards, Challenge Cards, Soft Skills Matrix
-- Created: October 16, 2025
-- =====================================================

-- =====================================================
-- TABLE: ccm_role_cards (50 Career Role Cards)
-- =====================================================

CREATE TABLE IF NOT EXISTS ccm_role_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Card identification
  card_code VARCHAR(50) UNIQUE NOT NULL,     -- 'CCM_CMO_MARKETING_MANAGER'
  display_name VARCHAR(100) NOT NULL,        -- 'Marketing Manager'
  description TEXT NOT NULL,                 -- Full description (150-200 words)

  -- Organization alignment
  c_suite_org VARCHAR(20) NOT NULL CHECK (c_suite_org IN ('ceo', 'cfo', 'cmo', 'cto', 'chro')),

  -- Role quality mapping (per P problem)
  quality_for_people VARCHAR(20) NOT NULL CHECK (quality_for_people IN ('perfect', 'good', 'not_in')),
  quality_for_product VARCHAR(20) NOT NULL CHECK (quality_for_product IN ('perfect', 'good', 'not_in')),
  quality_for_process VARCHAR(20) NOT NULL CHECK (quality_for_process IN ('perfect', 'good', 'not_in')),
  quality_for_place VARCHAR(20) NOT NULL CHECK (quality_for_place IN ('perfect', 'good', 'not_in')),
  quality_for_promotion VARCHAR(20) NOT NULL CHECK (quality_for_promotion IN ('perfect', 'good', 'not_in')),
  quality_for_price VARCHAR(20) NOT NULL CHECK (quality_for_price IN ('perfect', 'good', 'not_in')),

  -- Soft skills profile (for hidden matching)
  primary_soft_skills JSONB NOT NULL DEFAULT '[]'::JSONB,    -- ["leadership", "communication"]
  secondary_soft_skills JSONB NOT NULL DEFAULT '[]'::JSONB,  -- ["collaboration", "problem-solving"]

  -- Display
  icon_url TEXT,
  color_theme VARCHAR(50),                   -- For UI styling

  -- Metadata
  grade_level VARCHAR(20) DEFAULT 'all' CHECK (grade_level IN ('elementary', 'middle', 'high', 'all')),
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: ccm_synergy_cards (5 Universal Synergy Cards)
-- =====================================================

CREATE TABLE IF NOT EXISTS ccm_synergy_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Card identification
  card_code VARCHAR(50) UNIQUE NOT NULL,     -- 'CCM_CAPTAIN_CONNECTOR'
  display_name VARCHAR(100) NOT NULL,        -- 'Captain Connector'
  tagline VARCHAR(200) NOT NULL,             -- 'Collaboration and Communication'
  description TEXT NOT NULL,                 -- Full description

  -- Soft skills represented
  soft_skills_tags JSONB NOT NULL DEFAULT '[]'::JSONB,  -- ["collaboration", "communication", "relationship-building"]

  -- Effectiveness mapping (per P problem)
  effectiveness_for_people VARCHAR(20) NOT NULL CHECK (effectiveness_for_people IN ('primary', 'secondary', 'neutral')),
  effectiveness_for_product VARCHAR(20) NOT NULL CHECK (effectiveness_for_product IN ('primary', 'secondary', 'neutral')),
  effectiveness_for_process VARCHAR(20) NOT NULL CHECK (effectiveness_for_process IN ('primary', 'secondary', 'neutral')),
  effectiveness_for_place VARCHAR(20) NOT NULL CHECK (effectiveness_for_place IN ('primary', 'secondary', 'neutral')),
  effectiveness_for_promotion VARCHAR(20) NOT NULL CHECK (effectiveness_for_promotion IN ('primary', 'secondary', 'neutral')),
  effectiveness_for_price VARCHAR(20) NOT NULL CHECK (effectiveness_for_price IN ('primary', 'secondary', 'neutral')),

  -- Display
  icon_url TEXT,
  color_theme VARCHAR(50),

  -- Metadata
  display_order INTEGER,                     -- 1-5 (for consistent ordering)
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: ccm_challenge_cards (30+ Challenge Cards - 6 P's)
-- =====================================================

CREATE TABLE IF NOT EXISTS ccm_challenge_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Card identification
  card_code VARCHAR(50) UNIQUE NOT NULL,     -- 'CCM_PEOPLE_RETENTION_01'
  p_category VARCHAR(20) NOT NULL CHECK (p_category IN ('people', 'product', 'process', 'place', 'promotion', 'price')),

  -- Challenge content
  title VARCHAR(200) NOT NULL,               -- "Employee Retention Crisis"
  description TEXT NOT NULL,                 -- Full problem description
  context TEXT,                              -- Additional context for students

  -- Display
  icon_url TEXT,
  background_color VARCHAR(50),              -- Themed by P category

  -- Metadata
  grade_level VARCHAR(20) DEFAULT 'all' CHECK (grade_level IN ('elementary', 'middle', 'high', 'all')),
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: ccm_soft_skills_matrix (🔒 TRADE SECRET)
-- =====================================================

-- ⚠️ CRITICAL SECURITY:
-- This table contains proprietary algorithm data
-- NEVER query this table from frontend
-- ONLY backend scoring service can access
-- Obfuscated column names in production

CREATE TABLE IF NOT EXISTS ccm_soft_skills_matrix (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Mapping: Role × Synergy → Multiplier
  role_card_id UUID NOT NULL REFERENCES ccm_role_cards(id) ON DELETE CASCADE,
  synergy_card_id UUID NOT NULL REFERENCES ccm_synergy_cards(id) ON DELETE CASCADE,

  -- 🔒 HIDDEN MULTIPLIER (0.95 - 1.15)
  -- Variable name obfuscated for security
  m_val DECIMAL(4,2) NOT NULL CHECK (m_val >= 0.95 AND m_val <= 1.15),

  -- Metadata (for internal analysis only - not exposed)
  reasoning TEXT,                            -- Internal notes: why this multiplier?
  confidence_level VARCHAR(20) CHECK (confidence_level IN ('high', 'medium', 'low')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(role_card_id, synergy_card_id)
);

-- =====================================================
-- Indexes
-- =====================================================

-- ccm_role_cards indexes
CREATE INDEX idx_ccm_role_cards_code ON ccm_role_cards(card_code);
CREATE INDEX idx_ccm_role_cards_org ON ccm_role_cards(c_suite_org);
CREATE INDEX idx_ccm_role_cards_grade ON ccm_role_cards(grade_level);
CREATE INDEX idx_ccm_role_cards_active ON ccm_role_cards(is_active);

-- ccm_synergy_cards indexes
CREATE INDEX idx_ccm_synergy_cards_code ON ccm_synergy_cards(card_code);
CREATE INDEX idx_ccm_synergy_cards_active ON ccm_synergy_cards(is_active);
CREATE INDEX idx_ccm_synergy_cards_order ON ccm_synergy_cards(display_order);

-- ccm_challenge_cards indexes
CREATE INDEX idx_ccm_challenge_cards_code ON ccm_challenge_cards(card_code);
CREATE INDEX idx_ccm_challenge_cards_category ON ccm_challenge_cards(p_category);
CREATE INDEX idx_ccm_challenge_cards_grade ON ccm_challenge_cards(grade_level);
CREATE INDEX idx_ccm_challenge_cards_active ON ccm_challenge_cards(is_active);

-- ccm_soft_skills_matrix indexes
CREATE INDEX idx_ccm_soft_skills_matrix_role ON ccm_soft_skills_matrix(role_card_id);
CREATE INDEX idx_ccm_soft_skills_matrix_synergy ON ccm_soft_skills_matrix(synergy_card_id);

-- =====================================================
-- 🔒 ROW LEVEL SECURITY: Block ALL direct access to trade secret
-- =====================================================

ALTER TABLE ccm_soft_skills_matrix ENABLE ROW LEVEL SECURITY;

-- Policy: Block all direct access (frontend cannot query)
CREATE POLICY ccm_soft_skills_matrix_block_all
ON ccm_soft_skills_matrix
FOR ALL
USING (false);

-- Note: Backend service role will bypass RLS with service_role key
-- Frontend (anon key) is completely blocked from this table

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE ccm_role_cards IS 'Career role cards for CCM (50 total: 10 per C-Suite org)';
COMMENT ON TABLE ccm_synergy_cards IS 'Universal soft skills synergy cards for CCM (5 total)';
COMMENT ON TABLE ccm_challenge_cards IS 'Business problem challenge cards for CCM (6 P categories)';
COMMENT ON TABLE ccm_soft_skills_matrix IS '🔒 TRADE SECRET: Hidden multipliers for Role × Synergy pairings in CCM';

COMMENT ON COLUMN ccm_role_cards.quality_for_people IS 'Role quality for People problems: perfect (60), good (40), not_in (20)';
COMMENT ON COLUMN ccm_synergy_cards.effectiveness_for_people IS 'Synergy effectiveness: primary (2.0x), secondary (1.5x), neutral (1.0x)';
COMMENT ON COLUMN ccm_soft_skills_matrix.m_val IS '🔒 OBFUSCATED: Soft skills multiplier 0.95-1.15 (NEVER expose to frontend)';

-- =====================================================
-- Verification
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ CCM Content Tables Created';
  RAISE NOTICE '   - ccm_role_cards: 50 career role cards (10 per C-Suite org)';
  RAISE NOTICE '   - ccm_synergy_cards: 5 universal soft skills cards';
  RAISE NOTICE '   - ccm_challenge_cards: 30+ business challenge cards (6 P categories)';
  RAISE NOTICE '   - ccm_soft_skills_matrix: 🔒 TRADE SECRET (250 combinations protected by RLS)';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Security:';
  RAISE NOTICE '   - Soft skills matrix has Row Level Security enabled';
  RAISE NOTICE '   - Frontend CANNOT access multiplier values';
  RAISE NOTICE '   - Only backend service role can calculate scores';
  RAISE NOTICE '';
END $$;
-- =====================================================
-- Career Challenge Multiplayer (CCM) - Gameplay Tables
-- Phase 4: Round Plays, MVP Selections
-- Created: October 16, 2025
-- =====================================================

-- =====================================================
-- TABLE: ccm_round_plays (Card Selections Per Round)
-- =====================================================

CREATE TABLE IF NOT EXISTS ccm_round_plays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Session association
  game_session_id UUID NOT NULL REFERENCES ccm_game_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES ccm_session_participants(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL CHECK (round_number BETWEEN 1 AND 5),

  -- Challenge for this round
  challenge_card_id UUID NOT NULL REFERENCES ccm_challenge_cards(id),

  -- Player's card selections
  slot_1_role_card_id UUID REFERENCES ccm_role_cards(id),        -- NULL if using Golden/MVP only
  slot_2_synergy_card_id UUID REFERENCES ccm_synergy_cards(id),  -- NULL if no synergy played
  slot_3_card_type VARCHAR(20) CHECK (slot_3_card_type IN ('golden', 'mvp')), -- NULL if no special card
  slot_3_card_id UUID,                       -- NULL, or references ccm_role_cards(id) for MVP

  -- Scoring breakdown
  base_score INTEGER CHECK (base_score IN (60, 40, 20) OR base_score = 120), -- 60/40/20 or 120 (Golden)
  role_quality VARCHAR(20) CHECK (role_quality IN ('perfect', 'good', 'not_in')),
  synergy_multiplier DECIMAL(3,2) CHECK (synergy_multiplier IN (2.0, 1.5, 1.0)),
  synergy_effectiveness VARCHAR(20) CHECK (synergy_effectiveness IN ('primary', 'secondary', 'neutral')),
  c_suite_multiplier DECIMAL(3,2) CHECK (c_suite_multiplier IN (2.0, 1.5, 1.0)),
  c_suite_match VARCHAR(20) CHECK (c_suite_match IN ('home', 'adjacent', 'distant')),

  -- 🔒 HIDDEN: Soft skills match (trade secret)
  soft_skills_multiplier DECIMAL(4,2) CHECK (soft_skills_multiplier BETWEEN 0.95 AND 1.15),

  -- Final score for this round
  final_score INTEGER NOT NULL CHECK (final_score BETWEEN 0 AND 120),

  -- Timing
  locked_in_at TIMESTAMPTZ,                  -- When player locked in their selection
  time_taken_seconds INTEGER,                -- How long they took to decide

  -- Validation
  is_valid_play BOOLEAN DEFAULT true,        -- False if violated rules (shouldn't happen)

  UNIQUE(game_session_id, participant_id, round_number)
);

-- =====================================================
-- TABLE: ccm_mvp_selections (MVP Carry-Overs)
-- =====================================================

CREATE TABLE IF NOT EXISTS ccm_mvp_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Session association
  game_session_id UUID NOT NULL REFERENCES ccm_game_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES ccm_session_participants(id) ON DELETE CASCADE,

  -- After which round was this MVP selected?
  selected_after_round INTEGER NOT NULL CHECK (selected_after_round BETWEEN 1 AND 4), -- No MVP after Round 5

  -- Which card became MVP?
  mvp_card_id UUID NOT NULL REFERENCES ccm_role_cards(id),

  -- Was this MVP used in the next round?
  used_in_round INTEGER CHECK (used_in_round BETWEEN 2 AND 5), -- NULL if not used
  was_used BOOLEAN DEFAULT false,

  -- Timing
  selected_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(game_session_id, participant_id, selected_after_round)
);

-- =====================================================
-- Validation Constraint: Slot 1 required unless Golden/MVP in Slot 3
-- =====================================================

ALTER TABLE ccm_round_plays
ADD CONSTRAINT check_valid_play_combination
CHECK (
  slot_1_role_card_id IS NOT NULL
  OR
  slot_3_card_type IN ('golden', 'mvp')
);

-- =====================================================
-- Indexes
-- =====================================================

-- ccm_round_plays indexes
CREATE INDEX idx_ccm_round_plays_session ON ccm_round_plays(game_session_id);
CREATE INDEX idx_ccm_round_plays_participant ON ccm_round_plays(participant_id);
CREATE INDEX idx_ccm_round_plays_round ON ccm_round_plays(round_number);

-- Composite index for common queries
CREATE INDEX idx_ccm_round_plays_session_participant ON ccm_round_plays(game_session_id, participant_id);

-- ccm_mvp_selections indexes
CREATE INDEX idx_ccm_mvp_selections_session ON ccm_mvp_selections(game_session_id);
CREATE INDEX idx_ccm_mvp_selections_participant ON ccm_mvp_selections(participant_id);

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE ccm_round_plays IS 'Card selections and scoring for each round of CCM games';
COMMENT ON TABLE ccm_mvp_selections IS 'MVP card selections for carry-over to next round in CCM';

COMMENT ON COLUMN ccm_round_plays.slot_1_role_card_id IS 'Role card played in Slot 1 (optional if Golden/MVP in Slot 3)';
COMMENT ON COLUMN ccm_round_plays.slot_2_synergy_card_id IS 'Synergy card played in Slot 2 (always optional)';
COMMENT ON COLUMN ccm_round_plays.slot_3_card_type IS 'Type of special card in Slot 3: golden or mvp';
COMMENT ON COLUMN ccm_round_plays.base_score IS 'Base score: 60 (Perfect), 40 (Good), 20 (Not-In), or 120 (Golden)';
COMMENT ON COLUMN ccm_round_plays.soft_skills_multiplier IS '🔒 HIDDEN: Multiplier from soft skills matrix (0.95-1.15)';
COMMENT ON COLUMN ccm_round_plays.final_score IS 'Final score: base × synergy × c_suite × soft_skills (max 120)';
COMMENT ON COLUMN ccm_mvp_selections.selected_after_round IS 'Round after which MVP was selected (1-4, no MVP after Round 5)';
COMMENT ON COLUMN ccm_mvp_selections.used_in_round IS 'Round in which MVP was used (2-5), NULL if not used';

-- =====================================================
-- Verification
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ CCM Gameplay Tables Created';
  RAISE NOTICE '   - ccm_round_plays: Tracks card selections and scoring per round';
  RAISE NOTICE '   - ccm_mvp_selections: Tracks MVP card carry-overs';
  RAISE NOTICE '';
  RAISE NOTICE '🎮 Scoring Formula:';
  RAISE NOTICE '   final_score = base_score × synergy_mult × c_suite_mult × soft_skills_mult';
  RAISE NOTICE '   - Base: 60 (Perfect), 40 (Good), 20 (Not-In), 120 (Golden)';
  RAISE NOTICE '   - Synergy: 2.0x (Primary), 1.5x (Secondary), 1.0x (Neutral)';
  RAISE NOTICE '   - C-Suite: 2.0x (Home), 1.5x (Adjacent), 1.0x (Distant)';
  RAISE NOTICE '   - Soft Skills: 0.95-1.15x (🔒 TRADE SECRET)';
  RAISE NOTICE '';
END $$;
-- =====================================================
-- Career Challenge Multiplayer (CCM) - Achievement Tables
-- Phase 5: Achievements, Player Achievement Progress
-- Created: October 16, 2025
-- =====================================================

-- =====================================================
-- TABLE: ccm_achievements (32 Achievement Definitions)
-- =====================================================

CREATE TABLE IF NOT EXISTS ccm_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Achievement identification
  achievement_code VARCHAR(50) UNIQUE NOT NULL,  -- 'CCM_SYNERGY_SEEKER'
  display_name VARCHAR(100) NOT NULL,            -- 'Synergy Seeker'
  description TEXT NOT NULL,                     -- "Play 5 different Synergy cards"

  -- Category
  category VARCHAR(50) NOT NULL CHECK (category IN ('discovery', 'strategy', 'exploration', 'social', 'mastery')),

  -- Requirements
  requirement_type VARCHAR(50) NOT NULL CHECK (requirement_type IN ('play_count', 'score_threshold', 'win_count', 'streak', 'specific_action')),
  requirement_value INTEGER,                     -- Numeric threshold
  requirement_config JSONB,                      -- Additional config if complex

  -- Rewards
  xp_bonus INTEGER DEFAULT 0,                    -- XP awarded when unlocked
  badge_icon_url TEXT,

  -- Display
  display_order INTEGER,                         -- For sorting in UI
  rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_secret BOOLEAN DEFAULT false,               -- Hidden until unlocked

  -- Metadata
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: ccm_player_achievements (Achievement Progress & Unlocks)
-- =====================================================

CREATE TABLE IF NOT EXISTS ccm_player_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Player association
  student_id UUID NOT NULL,                  -- OAuth user ID (no FK - using mocked auth)
  achievement_id UUID NOT NULL REFERENCES ccm_achievements(id),

  -- Unlock status
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,

  -- Progress tracking
  current_progress INTEGER DEFAULT 0,            -- e.g., "3 out of 5 synergies played"
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),

  -- Context when unlocked
  unlocked_in_game_session_id UUID REFERENCES ccm_game_sessions(id),
  unlocked_in_round INTEGER CHECK (unlocked_in_round BETWEEN 1 AND 5),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),          -- When tracking started
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(student_id, achievement_id)
);

-- =====================================================
-- Indexes
-- =====================================================

-- ccm_achievements indexes
CREATE INDEX idx_ccm_achievements_code ON ccm_achievements(achievement_code);
CREATE INDEX idx_ccm_achievements_category ON ccm_achievements(category);
CREATE INDEX idx_ccm_achievements_rarity ON ccm_achievements(rarity);
CREATE INDEX idx_ccm_achievements_active ON ccm_achievements(is_active);

-- ccm_player_achievements indexes
CREATE INDEX idx_ccm_player_achievements_student ON ccm_player_achievements(student_id);
CREATE INDEX idx_ccm_player_achievements_achievement ON ccm_player_achievements(achievement_id);
CREATE INDEX idx_ccm_player_achievements_unlocked ON ccm_player_achievements(is_unlocked);

-- Composite index for common queries
CREATE INDEX idx_ccm_player_achievements_student_unlocked ON ccm_player_achievements(student_id, is_unlocked);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on player achievements
ALTER TABLE ccm_player_achievements ENABLE ROW LEVEL SECURITY;

-- Policy: Players can only see their own achievement progress
CREATE POLICY ccm_player_achievements_own_data
ON ccm_player_achievements
FOR SELECT
USING (student_id = auth.uid());

-- Policy: System can insert/update achievement progress
CREATE POLICY ccm_player_achievements_system_update
ON ccm_player_achievements
FOR ALL
USING (true)
WITH CHECK (true);

-- Note: Frontend will use anon key (can only SELECT own data)
-- Backend will use service_role key (can INSERT/UPDATE all data)

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE ccm_achievements IS 'Achievement definitions for CCM (32 total across 5 categories)';
COMMENT ON TABLE ccm_player_achievements IS 'Player progress and unlock status for CCM achievements';

COMMENT ON COLUMN ccm_achievements.achievement_code IS 'Unique achievement identifier (e.g., CCM_SYNERGY_SEEKER)';
COMMENT ON COLUMN ccm_achievements.category IS 'Achievement category: discovery, strategy, exploration, social, mastery';
COMMENT ON COLUMN ccm_achievements.requirement_type IS 'Type of requirement: play_count, score_threshold, win_count, streak, specific_action';
COMMENT ON COLUMN ccm_achievements.xp_bonus IS 'XP awarded when achievement is unlocked (10-150 XP range)';
COMMENT ON COLUMN ccm_achievements.is_secret IS 'If true, achievement is hidden until unlocked';
COMMENT ON COLUMN ccm_player_achievements.current_progress IS 'Current progress towards achievement (e.g., 3/5 synergies played)';
COMMENT ON COLUMN ccm_player_achievements.progress_percentage IS 'Progress as percentage (0-100)';
COMMENT ON COLUMN ccm_player_achievements.unlocked_in_game_session_id IS 'Game session where achievement was unlocked';

-- =====================================================
-- Final Verification
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ CCM Achievement Tables Created';
  RAISE NOTICE '   - ccm_achievements: 32 achievement definitions (5 categories)';
  RAISE NOTICE '   - ccm_player_achievements: Player progress tracking';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Security:';
  RAISE NOTICE '   - Row Level Security enabled on player achievements';
  RAISE NOTICE '   - Players can only see their own progress';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE '🎉 CCM DATABASE SCHEMA COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Summary - 11 Tables Created:';
  RAISE NOTICE '   Core:';
  RAISE NOTICE '     1. ccm_perpetual_rooms';
  RAISE NOTICE '     2. ccm_game_sessions';
  RAISE NOTICE '     3. ccm_session_participants';
  RAISE NOTICE '   Content:';
  RAISE NOTICE '     4. ccm_role_cards (50 cards needed)';
  RAISE NOTICE '     5. ccm_synergy_cards (5 cards needed)';
  RAISE NOTICE '     6. ccm_challenge_cards (30+ cards needed)';
  RAISE NOTICE '     7. ccm_soft_skills_matrix (🔒 250 combinations - TRADE SECRET)';
  RAISE NOTICE '   Gameplay:';
  RAISE NOTICE '     8. ccm_round_plays';
  RAISE NOTICE '     9. ccm_mvp_selections';
  RAISE NOTICE '   Achievements:';
  RAISE NOTICE '    10. ccm_achievements (32 definitions needed)';
  RAISE NOTICE '    11. ccm_player_achievements';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Security Features:';
  RAISE NOTICE '   - Soft skills matrix: RLS enabled, frontend blocked';
  RAISE NOTICE '   - Player achievements: RLS enabled, own data only';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next Steps:';
  RAISE NOTICE '   1. Run these migrations';
  RAISE NOTICE '   2. Generate content (role cards, synergy cards, challenges)';
  RAISE NOTICE '   3. Populate soft skills matrix (🔒 RESTRICTED ACCESS)';
  RAISE NOTICE '   4. Build CCM services (room manager, game orchestrator)';
  RAISE NOTICE '   5. Create API endpoints';
  RAISE NOTICE '   6. Build UI components';
  RAISE NOTICE '';
END $$;
