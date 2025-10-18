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
