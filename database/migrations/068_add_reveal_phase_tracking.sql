-- Migration: Add reveal phase tracking to Career Match
-- This prevents players from flipping cards while mismatched cards are being shown

-- Add reveal_phase_until timestamp to track when cards are in reveal phase
ALTER TABLE cm_game_sessions
ADD COLUMN reveal_phase_until TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN cm_game_sessions.reveal_phase_until IS 'Timestamp until which cards are in reveal phase (players cannot flip during this time)';
