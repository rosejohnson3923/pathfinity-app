-- ================================================================
-- DISCOVERED LIVE! - ADDITIONAL CAREER CLUES
-- Migration 039c: Add 8 more careers for 5x5 bingo grid
-- ================================================================
-- This file adds clues for 8 additional elementary careers
-- to support the 5x5 bingo grid (needs 24 unique careers + 1 free)
--
-- New careers: dentist, baker, photographer, mail-carrier,
--              park-ranger, writer, bus-driver, dancer
-- Total careers with clues: 24 (16 existing + 8 new)
-- ================================================================

-- ================================================================
-- DENTIST CLUES (career_code: 'dentist')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('dentist', 'This career counts how many teeth you have to make sure they are all healthy.', 'counting', 'easy', 'elementary', 0, ARRAY['doctor', 'nurse', 'orthodontist'], 'related'),
('dentist', 'This career reads charts with letters about which teeth need to be cleaned.', 'letters', 'easy', 'elementary', 0, ARRAY['doctor', 'hygienist', 'nurse'], 'related'),
('dentist', 'This career helps people in the community have healthy smiles and strong teeth.', 'community', 'easy', 'elementary', 0, ARRAY['doctor', 'orthodontist', 'hygienist'], 'related'),
('dentist', 'This career counts cavities to decide which teeth need fillings.', 'counting', 'medium', 'elementary', 3, ARRAY['dental-hygienist', 'orthodontist', 'oral-surgeon'], 'related'),
('dentist', 'This career looks at the shapes of teeth on X-rays to check for problems.', 'shapes', 'medium', 'elementary', 3, ARRAY['dental-hygienist', 'radiologist', 'doctor'], 'related');

-- ================================================================
-- BAKER CLUES (career_code: 'baker')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('baker', 'This career counts cups of flour and sugar to make delicious bread and cakes.', 'counting', 'easy', 'elementary', 0, ARRAY['chef', 'pastry-chef', 'cook'], 'related'),
('baker', 'This career reads recipes with lots of letters to know how to bake cookies and pies.', 'letters', 'easy', 'elementary', 0, ARRAY['chef', 'cook', 'pastry-chef'], 'related'),
('baker', 'This career makes different shapes of cookies like circles, stars, and hearts.', 'shapes', 'easy', 'elementary', 0, ARRAY['chef', 'pastry-chef', 'decorator'], 'same_skill'),
('baker', 'This career wakes up early to bake fresh bread for people in the community.', 'community', 'easy', 'elementary', 0, ARRAY['chef', 'grocer', 'food-worker'], 'related'),
('baker', 'This career counts how many minutes bread needs to bake in the oven.', 'counting', 'medium', 'elementary', 3, ARRAY['chef', 'pastry-chef', 'kitchen-manager'], 'related');

-- ================================================================
-- PHOTOGRAPHER CLUES (career_code: 'photographer')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('photographer', 'This career counts how many photos to take at a special event like a birthday.', 'counting', 'easy', 'elementary', 0, ARRAY['videographer', 'journalist', 'artist'], 'related'),
('photographer', 'This career writes file names with letters to organize and save pictures.', 'letters', 'easy', 'elementary', 0, ARRAY['journalist', 'editor', 'archivist'], 'related'),
('photographer', 'This career looks at shapes and angles to take the most beautiful pictures.', 'shapes', 'easy', 'elementary', 0, ARRAY['artist', 'designer', 'videographer'], 'same_skill'),
('photographer', 'This career captures important moments for families and communities.', 'community', 'easy', 'elementary', 0, ARRAY['journalist', 'videographer', 'event-planner'], 'related'),
('photographer', 'This career counts how many photos are needed for a school yearbook.', 'counting', 'medium', 'elementary', 3, ARRAY['yearbook-editor', 'graphic-designer', 'journalist'], 'related');

-- ================================================================
-- MAIL CARRIER CLUES (career_code: 'mail-carrier')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('mail-carrier', 'This career counts packages and letters to deliver to each house.', 'counting', 'easy', 'elementary', 0, ARRAY['delivery-driver', 'postal-worker', 'courier'], 'related'),
('mail-carrier', 'This career reads addresses with letters and numbers to deliver mail correctly.', 'letters', 'easy', 'elementary', 0, ARRAY['delivery-driver', 'postal-clerk', 'courier'], 'same_skill'),
('mail-carrier', 'This career brings mail to people in the community every day, rain or shine.', 'community', 'easy', 'elementary', 0, ARRAY['delivery-driver', 'postal-worker', 'courier'], 'same_skill'),
('mail-carrier', 'This career counts how many stops are on their delivery route each day.', 'counting', 'medium', 'elementary', 3, ARRAY['delivery-driver', 'route-planner', 'dispatcher'], 'related'),
('mail-carrier', 'This career recognizes the rectangular shapes of envelopes and square shapes of packages.', 'shapes', 'medium', 'elementary', 3, ARRAY['postal-clerk', 'package-handler', 'warehouse-worker'], 'related');

-- ================================================================
-- PARK RANGER CLUES (career_code: 'park-ranger')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('park-ranger', 'This career counts how many visitors come to the park each day.', 'counting', 'easy', 'elementary', 0, ARRAY['tour-guide', 'wildlife-officer', 'forest-ranger'], 'related'),
('park-ranger', 'This career reads trail signs with letters to help people find their way.', 'letters', 'easy', 'elementary', 0, ARRAY['tour-guide', 'naturalist', 'trail-guide'], 'related'),
('park-ranger', 'This career protects nature and keeps parks safe for the community to enjoy.', 'community', 'easy', 'elementary', 0, ARRAY['conservation-officer', 'wildlife-officer', 'environmental-worker'], 'same_skill'),
('park-ranger', 'This career counts different kinds of trees and animals in the forest.', 'counting', 'medium', 'elementary', 3, ARRAY['biologist', 'wildlife-biologist', 'naturalist'], 'related'),
('park-ranger', 'This career identifies leaf shapes to teach visitors about different plants.', 'shapes', 'medium', 'elementary', 3, ARRAY['botanist', 'naturalist', 'environmental-educator'], 'related');

-- ================================================================
-- WRITER CLUES (career_code: 'writer')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('writer', 'This career counts how many words are in a story they are writing.', 'counting', 'easy', 'elementary', 0, ARRAY['author', 'journalist', 'editor'], 'related'),
('writer', 'This career uses letters to create stories, poems, and books for people to read.', 'letters', 'easy', 'elementary', 0, ARRAY['author', 'poet', 'journalist'], 'same_skill'),
('writer', 'This career shares stories that entertain and teach people in the community.', 'community', 'easy', 'elementary', 0, ARRAY['author', 'librarian', 'teacher'], 'related'),
('writer', 'This career counts pages to make sure their book is the right length.', 'counting', 'medium', 'elementary', 3, ARRAY['editor', 'publisher', 'novelist'], 'related'),
('writer', 'This career organizes their ideas using different shapes like circles for brainstorming.', 'shapes', 'medium', 'elementary', 3, ARRAY['editor', 'content-creator', 'journalist'], 'related');

-- ================================================================
-- BUS DRIVER CLUES (career_code: 'bus-driver')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('bus-driver', 'This career counts students getting on and off the bus to make sure everyone is safe.', 'counting', 'easy', 'elementary', 0, ARRAY['school-bus-driver', 'transit-driver', 'teacher'], 'related'),
('bus-driver', 'This career reads street signs with letters to follow the correct route.', 'letters', 'easy', 'elementary', 0, ARRAY['taxi-driver', 'delivery-driver', 'truck-driver'], 'same_skill'),
('bus-driver', 'This career safely drives children to school and helps the community every day.', 'community', 'easy', 'elementary', 0, ARRAY['school-bus-driver', 'crossing-guard', 'teacher'], 'same_skill'),
('bus-driver', 'This career counts how many stops they make on their route each morning.', 'counting', 'medium', 'elementary', 3, ARRAY['transit-driver', 'route-planner', 'dispatcher'], 'related'),
('bus-driver', 'This career watches for traffic signs in different shapes like circles and triangles.', 'shapes', 'medium', 'elementary', 3, ARRAY['driving-instructor', 'traffic-controller', 'safety-officer'], 'related');

-- ================================================================
-- DANCER CLUES (career_code: 'dancer')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('dancer', 'This career counts beats in music to know when to move and turn.', 'counting', 'easy', 'elementary', 0, ARRAY['choreographer', 'dance-teacher', 'performer'], 'related'),
('dancer', 'This career learns dance steps that are named with letters like A, B, and C.', 'letters', 'easy', 'elementary', 0, ARRAY['choreographer', 'dance-teacher', 'instructor'], 'related'),
('dancer', 'This career performs beautiful dances to entertain and inspire the community.', 'community', 'easy', 'elementary', 0, ARRAY['performer', 'actor', 'entertainer'], 'related'),
('dancer', 'This career counts how many spins and leaps are in each dance routine.', 'counting', 'medium', 'elementary', 3, ARRAY['choreographer', 'ballet-dancer', 'dance-instructor'], 'related'),
('dancer', 'This career creates patterns and shapes with their body movements on stage.', 'shapes', 'medium', 'elementary', 3, ARRAY['choreographer', 'performer', 'movement-artist'], 'related');

-- ================================================================
-- SEED COMPLETE
-- ================================================================
-- Total new clues added: 40 (8 careers × 5 clues each)
-- Combined with 039b: 120 total clues (24 careers × 5 clues each)
--
-- All careers now available for 5x5 bingo grid:
-- 1. chef             2. teacher          3. doctor           4. firefighter
-- 5. police-officer   6. nurse            7. athlete          8. artist
-- 9. librarian        10. scientist       11. engineer        12. farmer
-- 13. coach           14. veterinarian    15. musician        16. pilot
-- 17. dentist         18. baker           19. photographer    20. mail-carrier
-- 21. park-ranger     22. writer          23. bus-driver      24. dancer
--
-- 5x5 Grid: 24 careers + 1 free space (center) = 25 squares total
-- ================================================================
