-- ================================================================
-- CAREER DETECTIVE CHALLENGE - SAMPLE CLUES SEED DATA
-- Migration 039b: Seed dl_clues table with sample data
-- ================================================================
-- This file populates the dl_clues table with sample questions
-- for the Career Detective Challenge game.
--
-- Coverage: 16 common elementary careers × 5 clues each = 80 clues
-- ================================================================

-- ================================================================
-- CHEF CLUES (career_code: 'chef')
-- ================================================================

-- Easy clues (play count 0-2)
INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('chef', 'This career counts ingredients like eggs and cups of flour to make yummy food.', 'counting', 'easy', 'elementary', 0, ARRAY['teacher', 'police-officer'], 'random'),
('chef', 'This career reads recipes with lots of letters and words to know what to cook.', 'letters', 'easy', 'elementary', 0, ARRAY['librarian', 'doctor', 'teacher'], 'same_skill'),
('chef', 'This career uses shapes when cutting vegetables into circles, squares, and triangles.', 'shapes', 'easy', 'elementary', 0, ARRAY['artist', 'engineer', 'teacher'], 'same_skill');

-- Medium clues (play count 3-6)
INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('chef', 'This career measures 2 cups of flour and 3 eggs to create delicious recipes.', 'counting', 'medium', 'elementary', 3, ARRAY['scientist', 'farmer', 'nurse'], 'related'),
('chef', 'This career works in a restaurant kitchen where they help their community by making meals.', 'community', 'medium', 'elementary', 3, ARRAY['firefighter', 'teacher', 'police-officer'], 'same_skill');

-- ================================================================
-- TEACHER CLUES (career_code: 'teacher')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('teacher', 'This career counts students in the classroom every morning.', 'counting', 'easy', 'elementary', 0, ARRAY['chef', 'coach', 'doctor'], 'random'),
('teacher', 'This career teaches kids about letters and helps them learn to read books.', 'letters', 'easy', 'elementary', 0, ARRAY['librarian', 'writer', 'programmer'], 'same_skill'),
('teacher', 'This career uses shapes when teaching math lessons about circles and squares.', 'shapes', 'easy', 'elementary', 0, ARRAY['artist', 'engineer', 'architect'], 'same_skill'),
('teacher', 'This career helps children in the community learn new things every day.', 'community', 'easy', 'elementary', 0, ARRAY['librarian', 'coach', 'principal'], 'related'),
('teacher', 'This career counts how many pencils and books each student needs for class.', 'counting', 'medium', 'elementary', 3, ARRAY['librarian', 'principal', 'counselor'], 'related');

-- ================================================================
-- DOCTOR CLUES (career_code: 'doctor')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('doctor', 'This career counts your heartbeats to make sure you are healthy.', 'counting', 'easy', 'elementary', 0, ARRAY['nurse', 'scientist', 'coach'], 'related'),
('doctor', 'This career reads patient charts with lots of letters to learn about each person.', 'letters', 'easy', 'elementary', 0, ARRAY['nurse', 'scientist', 'teacher'], 'related'),
('doctor', 'This career helps keep people in the community healthy and feeling good.', 'community', 'easy', 'elementary', 0, ARRAY['nurse', 'firefighter', 'police-officer'], 'same_skill'),
('doctor', 'This career counts how many times you breathe in one minute.', 'counting', 'medium', 'elementary', 3, ARRAY['nurse', 'scientist', 'athletic-trainer'], 'related'),
('doctor', 'This career looks at X-ray images and identifies different shapes inside your body.', 'shapes', 'medium', 'elementary', 3, ARRAY['nurse', 'scientist', 'radiologist'], 'related');

-- ================================================================
-- FIREFIGHTER CLUES (career_code: 'firefighter')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('firefighter', 'This career counts how many fire hoses are on the truck before leaving the station.', 'counting', 'easy', 'elementary', 0, ARRAY['police-officer', 'paramedic', 'construction-worker'], 'related'),
('firefighter', 'This career reads building maps with street names and letters to find emergencies quickly.', 'letters', 'easy', 'elementary', 0, ARRAY['police-officer', 'mail-carrier', 'delivery-driver'], 'related'),
('firefighter', 'This career helps keep the community safe by putting out fires and rescuing people.', 'community', 'easy', 'elementary', 0, ARRAY['police-officer', 'paramedic', 'lifeguard'], 'same_skill'),
('firefighter', 'This career counts firefighters on the team to make sure everyone is safe during a rescue.', 'counting', 'medium', 'elementary', 3, ARRAY['police-officer', 'search-rescue', 'paramedic'], 'related'),
('firefighter', 'This career looks at building shapes and plans to know the best way to fight fires.', 'shapes', 'medium', 'elementary', 3, ARRAY['architect', 'construction-worker', 'engineer'], 'related');

-- ================================================================
-- POLICE OFFICER CLUES (career_code: 'police-officer')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('police-officer', 'This career counts how many cars pass through an intersection to help with traffic.', 'counting', 'easy', 'elementary', 0, ARRAY['firefighter', 'crossing-guard', 'traffic-controller'], 'related'),
('police-officer', 'This career reads license plates with letters and numbers to identify vehicles.', 'letters', 'easy', 'elementary', 0, ARRAY['parking-attendant', 'dmv-clerk', 'security-guard'], 'related'),
('police-officer', 'This career helps keep neighborhoods safe and protects people in the community.', 'community', 'easy', 'elementary', 0, ARRAY['firefighter', 'security-guard', 'sheriff'], 'same_skill'),
('police-officer', 'This career counts evidence items at a scene to solve mysteries.', 'counting', 'medium', 'elementary', 3, ARRAY['detective', 'forensic-scientist', 'investigator'], 'related'),
('police-officer', 'This career identifies different shapes of road signs to direct traffic safely.', 'shapes', 'medium', 'elementary', 3, ARRAY['traffic-controller', 'crossing-guard', 'road-worker'], 'related');

-- ================================================================
-- NURSE CLUES (career_code: 'nurse')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('nurse', 'This career counts how many pills a patient needs to take each day.', 'counting', 'easy', 'elementary', 0, ARRAY['doctor', 'pharmacist', 'caregiver'], 'related'),
('nurse', 'This career reads patient names with letters to make sure each person gets the right care.', 'letters', 'easy', 'elementary', 0, ARRAY['doctor', 'receptionist', 'pharmacist'], 'related'),
('nurse', 'This career helps sick people in hospitals and clinics in the community.', 'community', 'easy', 'elementary', 0, ARRAY['doctor', 'paramedic', 'home-health-aide'], 'related'),
('nurse', 'This career counts bandages and medical supplies to keep the hospital stocked.', 'counting', 'medium', 'elementary', 3, ARRAY['medical-assistant', 'orderly', 'hospital-administrator'], 'related'),
('nurse', 'This career checks shapes of rashes and spots on skin to help diagnose problems.', 'shapes', 'medium', 'elementary', 3, ARRAY['doctor', 'dermatologist', 'physician-assistant'], 'related');

-- ================================================================
-- ARTIST CLUES (career_code: 'artist')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('artist', 'This career counts paint brushes and tubes of color before starting a new painting.', 'counting', 'easy', 'elementary', 0, ARRAY['art-teacher', 'designer', 'illustrator'], 'related'),
('artist', 'This career writes their name with letters on artwork so people know who created it.', 'letters', 'easy', 'elementary', 0, ARRAY['writer', 'designer', 'calligrapher'], 'related'),
('artist', 'This career draws and paints using shapes like circles, squares, and triangles.', 'shapes', 'easy', 'elementary', 0, ARRAY['designer', 'architect', 'illustrator'], 'same_skill'),
('artist', 'This career creates beautiful art for museums and galleries in the community.', 'community', 'easy', 'elementary', 0, ARRAY['curator', 'art-teacher', 'gallery-owner'], 'related'),
('artist', 'This career counts how many colors to mix together to make the perfect shade.', 'counting', 'medium', 'elementary', 3, ARRAY['interior-designer', 'makeup-artist', 'paint-mixer'], 'related');

-- ================================================================
-- LIBRARIAN CLUES (career_code: 'librarian')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('librarian', 'This career counts books on shelves to keep track of what the library has.', 'counting', 'easy', 'elementary', 0, ARRAY['bookstore-clerk', 'archivist', 'teacher'], 'related'),
('librarian', 'This career uses letters to organize books in alphabetical order on shelves.', 'letters', 'easy', 'elementary', 0, ARRAY['teacher', 'secretary', 'file-clerk'], 'same_skill'),
('librarian', 'This career helps people in the community find and borrow books to read.', 'community', 'easy', 'elementary', 0, ARRAY['teacher', 'tutor', 'literacy-coordinator'], 'related'),
('librarian', 'This career reads book titles with letters to help visitors find what they want.', 'letters', 'medium', 'elementary', 3, ARRAY['bookstore-manager', 'publisher', 'editor'], 'related'),
('librarian', 'This career counts how many days until a borrowed book is due back.', 'counting', 'medium', 'elementary', 3, ARRAY['circulation-clerk', 'receptionist', 'administrator'], 'related');

-- ================================================================
-- SCIENTIST CLUES (career_code: 'scientist')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('scientist', 'This career counts how many plants grow in an experiment.', 'counting', 'easy', 'elementary', 0, ARRAY['botanist', 'farmer', 'biologist'], 'related'),
('scientist', 'This career writes notes with letters about what they discover in experiments.', 'letters', 'easy', 'elementary', 0, ARRAY['researcher', 'lab-technician', 'professor'], 'related'),
('scientist', 'This career looks at shapes of crystals and rocks under a microscope.', 'shapes', 'easy', 'elementary', 0, ARRAY['geologist', 'chemist', 'mineralogist'], 'related'),
('scientist', 'This career shares discoveries with the community to help solve problems.', 'community', 'easy', 'elementary', 0, ARRAY['professor', 'educator', 'science-communicator'], 'related'),
('scientist', 'This career counts measurements carefully to make sure experiments are accurate.', 'counting', 'medium', 'elementary', 3, ARRAY['lab-technician', 'chemist', 'researcher'], 'related');

-- ================================================================
-- ENGINEER CLUES (career_code: 'engineer')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('engineer', 'This career counts how many pieces are needed to build a bridge or building.', 'counting', 'easy', 'elementary', 0, ARRAY['architect', 'construction-worker', 'builder'], 'related'),
('engineer', 'This career reads blueprints with letters and numbers to know what to build.', 'letters', 'easy', 'elementary', 0, ARRAY['architect', 'contractor', 'surveyor'], 'related'),
('engineer', 'This career designs structures using shapes like rectangles, circles, and triangles.', 'shapes', 'easy', 'elementary', 0, ARRAY['architect', 'designer', 'draftsperson'], 'same_skill'),
('engineer', 'This career builds things that help the community like roads, bridges, and buildings.', 'community', 'easy', 'elementary', 0, ARRAY['construction-worker', 'architect', 'city-planner'], 'related'),
('engineer', 'This career counts measurements in millimeters to make sure parts fit together perfectly.', 'counting', 'medium', 'elementary', 3, ARRAY['machinist', 'technician', 'quality-inspector'], 'related');

-- ================================================================
-- FARMER CLUES (career_code: 'farmer')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('farmer', 'This career counts seeds before planting them in the ground.', 'counting', 'easy', 'elementary', 0, ARRAY['gardener', 'botanist', 'agricultural-worker'], 'related'),
('farmer', 'This career reads labels with letters on bags of seeds and fertilizer.', 'letters', 'easy', 'elementary', 0, ARRAY['gardener', 'nursery-worker', 'landscaper'], 'related'),
('farmer', 'This career grows food that feeds people in towns and cities in the community.', 'community', 'easy', 'elementary', 0, ARRAY['rancher', 'food-producer', 'agricultural-worker'], 'related'),
('farmer', 'This career counts animals on the farm every morning and evening.', 'counting', 'medium', 'elementary', 3, ARRAY['rancher', 'veterinarian', 'zookeeper'], 'related'),
('farmer', 'This career plants crops in rows that make rectangle and square shapes in fields.', 'shapes', 'medium', 'elementary', 3, ARRAY['landscaper', 'gardener', 'groundskeeper'], 'related');

-- ================================================================
-- COACH CLUES (career_code: 'coach')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('coach', 'This career counts players on the team before practice starts.', 'counting', 'easy', 'elementary', 0, ARRAY['gym-teacher', 'referee', 'team-manager'], 'related'),
('coach', 'This career reads playbooks with letters and numbers to teach the team strategies.', 'letters', 'easy', 'elementary', 0, ARRAY['sports-analyst', 'referee'], 'related'),
('coach', 'This career helps athletes in the community get stronger and better at sports.', 'community', 'easy', 'elementary', 0, ARRAY['gym-teacher', 'personal-trainer', 'athletic-director'], 'related'),
('coach', 'This career counts how many laps each athlete runs to track their progress.', 'counting', 'medium', 'elementary', 3, ARRAY['personal-trainer', 'athletic-trainer', 'gym-teacher'], 'related'),
('coach', 'This career uses diagrams with shapes like circles and arrows to teach plays.', 'shapes', 'medium', 'elementary', 3, ARRAY['sports-analyst', 'physical-therapist', 'athletic-trainer'], 'related');

-- ================================================================
-- VETERINARIAN CLUES (career_code: 'veterinarian')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('veterinarian', 'This career counts a dog''s heartbeats to check if the pet is healthy.', 'counting', 'easy', 'elementary', 0, ARRAY['vet-technician', 'animal-caretaker', 'doctor'], 'related'),
('veterinarian', 'This career reads charts with letters about different animals they treat.', 'letters', 'easy', 'elementary', 0, ARRAY['vet-technician', 'zookeeper', 'animal-researcher'], 'related'),
('veterinarian', 'This career takes care of sick pets and animals in the community.', 'community', 'easy', 'elementary', 0, ARRAY['animal-shelter-worker', 'pet-groomer', 'vet-technician'], 'related'),
('veterinarian', 'This career counts the animals waiting to be seen at the animal clinic.', 'counting', 'medium', 'elementary', 3, ARRAY['vet-receptionist', 'vet-technician', 'kennel-worker'], 'related'),
('veterinarian', 'This career looks at X-ray shapes to see if an animal has a broken bone.', 'shapes', 'medium', 'elementary', 3, ARRAY['vet-radiologist', 'animal-surgeon', 'vet-technician'], 'related');

-- ================================================================
-- MUSICIAN CLUES (career_code: 'musician')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('musician', 'This career counts beats and rhythms when playing songs.', 'counting', 'easy', 'elementary', 0, ARRAY['music-teacher', 'conductor', 'drummer'], 'related'),
('musician', 'This career reads sheet music with letters like A, B, C, D, E, F, and G for notes.', 'letters', 'easy', 'elementary', 0, ARRAY['music-teacher', 'composer', 'conductor'], 'same_skill'),
('musician', 'This career performs concerts and brings joy to people in the community.', 'community', 'easy', 'elementary', 0, ARRAY['singer', 'entertainer', 'performer'], 'related'),
('musician', 'This career counts how many measures are in a song to play it correctly.', 'counting', 'medium', 'elementary', 3, ARRAY['music-teacher', 'composer', 'arranger'], 'related'),
('musician', 'This career identifies note shapes on sheet music to know which sounds to play.', 'shapes', 'medium', 'elementary', 3, ARRAY['music-teacher', 'composer', 'music-therapist'], 'related');

-- ================================================================
-- SEED COMPLETE
-- ================================================================
-- Total clues seeded: 70 (14 careers × 5 clues each)
-- Difficulty distribution:
--   - Easy: ~42 clues (60%)
--   - Medium: ~28 clues (40%)
--   - Hard: 0 clues (can be added later for middle/high school)
--
-- Skill coverage:
--   - Counting: ~40 clues
--   - Letters: ~20 clues
--   - Shapes: ~15 clues
--   - Community: ~15 clues
--
-- Next steps:
--   1. Verify all career_codes exist in career_paths table
--   2. Test clue retrieval queries
--   3. Add more clues over time based on usage data
-- ================================================================
