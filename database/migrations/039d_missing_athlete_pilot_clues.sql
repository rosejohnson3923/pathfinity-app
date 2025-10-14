-- ================================================================
-- DISCOVERED LIVE! - MISSING CLUES FOR ATHLETE & PILOT
-- Migration 039d: Add missing athlete and pilot clues
-- ================================================================
-- These careers were in 039b but may not have been inserted
-- Adding them here to complete the 24 careers needed for 5x5 grid
-- ================================================================

-- ================================================================
-- ATHLETE CLUES (career_code: 'athlete')
-- ================================================================
-- Note: These were in 039b but checking if they exist first

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('athlete', 'This career counts laps around the track during practice.', 'counting', 'easy', 'elementary', 0, ARRAY['coach', 'gym-teacher', 'personal-trainer'], 'related'),
('athlete', 'This career reads team uniforms with letters to know which player is which.', 'letters', 'easy', 'elementary', 0, ARRAY['coach', 'referee', 'sports-announcer'], 'related'),
('athlete', 'This career represents their community by playing sports and inspiring others.', 'community', 'easy', 'elementary', 0, ARRAY['coach', 'gym-teacher', 'sports-instructor'], 'related'),
('athlete', 'This career counts points and scores to see who wins the game.', 'counting', 'medium', 'elementary', 3, ARRAY['referee', 'scorekeeper', 'sports-announcer'], 'related'),
('athlete', 'This career practices with equipment that comes in different shapes like balls and bats.', 'shapes', 'medium', 'elementary', 3, ARRAY['coach', 'equipment-manager', 'sports-designer'], 'related')
ON CONFLICT (career_code, clue_text, grade_category) DO NOTHING;

-- ================================================================
-- PILOT CLUES (career_code: 'pilot')
-- ================================================================
-- Note: These were in 039b but checking if they exist first

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('pilot', 'This career counts passengers on the airplane before takeoff.', 'counting', 'easy', 'elementary', 0, ARRAY['flight-attendant', 'gate-agent', 'airline-manager'], 'related'),
('pilot', 'This career reads maps and airport codes with letters to know where to fly.', 'letters', 'easy', 'elementary', 0, ARRAY['navigator', 'air-traffic-controller', 'flight-dispatcher'], 'related'),
('pilot', 'This career flies people safely to different cities and helps connect communities.', 'community', 'easy', 'elementary', 0, ARRAY['flight-attendant', 'airline-worker', 'airport-manager'], 'related'),
('pilot', 'This career counts fuel levels and flight time to plan trips carefully.', 'counting', 'medium', 'elementary', 3, ARRAY['flight-engineer', 'airline-dispatcher', 'aviation-mechanic'], 'related'),
('pilot', 'This career looks at instrument dials and gauges that are different shapes.', 'shapes', 'medium', 'elementary', 3, ARRAY['flight-engineer', 'aircraft-mechanic', 'aviation-inspector'], 'related')
ON CONFLICT (career_code, clue_text, grade_category) DO NOTHING;

-- ================================================================
-- VERIFICATION QUERY
-- ================================================================
-- Run this to verify all 24 careers now have clues:

-- SELECT career_code, COUNT(*) as clue_count
-- FROM dl_clues
-- WHERE grade_category = 'elementary' AND is_active = true
-- GROUP BY career_code
-- ORDER BY career_code;

-- Expected result: 24 careers × 5 clues each = 120 total clues

-- ================================================================
-- SEED COMPLETE
-- ================================================================
