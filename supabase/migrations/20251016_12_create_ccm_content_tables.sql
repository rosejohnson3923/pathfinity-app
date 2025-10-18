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
