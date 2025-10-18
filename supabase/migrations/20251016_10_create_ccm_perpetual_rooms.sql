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
