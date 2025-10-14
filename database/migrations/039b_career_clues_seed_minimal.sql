-- ================================================================
-- DISCOVERED LIVE! - MINIMAL SAMPLE CLUES
-- ================================================================
-- This is a minimal seed file with only the most common careers
-- Run docs/verify_existing_careers.sql FIRST to check which careers exist
-- Then update this file to use only those career codes
-- ================================================================

-- ================================================================
-- STEP 1: Verify these career codes exist in your database
-- Run this query first:
--
-- SELECT career_code, career_name
-- FROM career_paths
-- WHERE career_code IN ('teacher', 'doctor', 'nurse', 'chef', 'firefighter', 'police-officer')
-- AND is_active = true;
--
-- Only proceed if you see results!
-- ================================================================

-- ================================================================
-- TEACHER CLUES (most likely to exist)
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('teacher', 'This career counts students in the classroom every morning.', 'counting', 'easy', 'elementary', 0, ARRAY['coach', 'principal'], 'random'),
('teacher', 'This career teaches kids about letters and helps them learn to read books.', 'letters', 'easy', 'elementary', 0, ARRAY['librarian', 'tutor'], 'related'),
('teacher', 'This career uses shapes when teaching math lessons about circles and squares.', 'shapes', 'easy', 'elementary', 0, ARRAY['math-tutor', 'principal'], 'related'),
('teacher', 'This career helps children in the community learn new things every day.', 'community', 'easy', 'elementary', 0, ARRAY['librarian', 'coach'], 'related'),
('teacher', 'This career counts how many pencils and books each student needs for class.', 'counting', 'medium', 'elementary', 3, ARRAY['librarian', 'principal'], 'related');

-- ================================================================
-- DOCTOR CLUES
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('doctor', 'This career counts your heartbeats to make sure you are healthy.', 'counting', 'easy', 'elementary', 0, ARRAY['nurse', 'dentist'], 'related'),
('doctor', 'This career reads patient charts with lots of letters to learn about each person.', 'letters', 'easy', 'elementary', 0, ARRAY['nurse', 'pharmacist'], 'related'),
('doctor', 'This career helps keep people in the community healthy and feeling good.', 'community', 'easy', 'elementary', 0, ARRAY['nurse', 'paramedic'], 'related'),
('doctor', 'This career counts how many times you breathe in one minute.', 'counting', 'medium', 'elementary', 3, ARRAY['nurse', 'respiratory-therapist'], 'related'),
('doctor', 'This career looks at X-ray images and identifies different shapes inside your body.', 'shapes', 'medium', 'elementary', 3, ARRAY['nurse', 'radiologist'], 'related');

-- ================================================================
-- NURSE CLUES
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('nurse', 'This career counts how many pills a patient needs to take each day.', 'counting', 'easy', 'elementary', 0, ARRAY['doctor', 'pharmacist'], 'related'),
('nurse', 'This career reads patient names with letters to make sure each person gets the right care.', 'letters', 'easy', 'elementary', 0, ARRAY['doctor', 'receptionist'], 'related'),
('nurse', 'This career helps sick people in hospitals and clinics in the community.', 'community', 'easy', 'elementary', 0, ARRAY['doctor', 'paramedic'], 'related'),
('nurse', 'This career counts bandages and medical supplies to keep the hospital stocked.', 'counting', 'medium', 'elementary', 3, ARRAY['medical-assistant', 'doctor'], 'related'),
('nurse', 'This career checks shapes of rashes and spots on skin to help diagnose problems.', 'shapes', 'medium', 'elementary', 3, ARRAY['doctor', 'dermatologist'], 'related');

-- ================================================================
-- OPTIONAL: Add more careers below if they exist in your database
-- Copy/paste sections from 039b_career_clues_seed.sql.backup
-- ================================================================

-- Example: If 'chef' exists, uncomment these:
/*
INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('chef', 'This career counts ingredients like eggs and cups of flour to make yummy food.', 'counting', 'easy', 'elementary', 0, ARRAY['teacher', 'baker'], 'random'),
('chef', 'This career reads recipes with lots of letters and words to know what to cook.', 'letters', 'easy', 'elementary', 0, ARRAY['librarian', 'teacher'], 'related'),
('chef', 'This career uses shapes when cutting vegetables into circles, squares, and triangles.', 'shapes', 'easy', 'elementary', 0, ARRAY['artist', 'teacher'], 'related');
*/

-- ================================================================
-- SEED COMPLETE - 15 clues (3 careers × 5 clues each)
-- This is enough to test the game!
-- ================================================================
