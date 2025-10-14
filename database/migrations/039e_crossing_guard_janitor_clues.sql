-- ================================================================
-- DISCOVERED LIVE! - CROSSING GUARD & JANITOR CLUES
-- Migration 039e: Final 2 careers for 5x5 bingo grid
-- ================================================================
-- This file adds clues for the final 2 elementary careers
-- to complete the 24 careers needed for 5x5 bingo grid
--
-- New careers: crossing-guard, janitor
-- Total careers with clues: 24 (complete!)
-- ================================================================

-- ================================================================
-- CROSSING GUARD CLUES (career_code: 'crossing-guard')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('crossing-guard', 'This career counts cars to know when it is safe for children to cross the street.', 'counting', 'easy', 'elementary', 0, ARRAY['police-officer', 'traffic-controller', 'safety-officer'], 'related'),
('crossing-guard', 'This career reads street signs with letters to help students cross at the right place.', 'letters', 'easy', 'elementary', 0, ARRAY['bus-driver', 'police-officer', 'traffic-officer'], 'related'),
('crossing-guard', 'This career keeps children in the community safe when walking to and from school.', 'community', 'easy', 'elementary', 0, ARRAY['police-officer', 'school-security', 'bus-driver'], 'same_skill'),
('crossing-guard', 'This career holds up a stop sign shaped like an octagon to help kids cross safely.', 'shapes', 'easy', 'elementary', 0, ARRAY['traffic-controller', 'police-officer', 'safety-officer'], 'same_skill'),
('crossing-guard', 'This career counts how many students cross the street during morning and afternoon times.', 'counting', 'medium', 'elementary', 3, ARRAY['school-monitor', 'attendance-clerk', 'bus-monitor'], 'related');

-- ================================================================
-- JANITOR CLUES (career_code: 'janitor')
-- ================================================================

INSERT INTO dl_clues (career_code, clue_text, skill_connection, difficulty, grade_category, min_play_count, distractor_careers, distractor_strategy) VALUES
('janitor', 'This career counts how many classrooms need to be cleaned each day.', 'counting', 'easy', 'elementary', 0, ARRAY['custodian', 'cleaner', 'maintenance-worker'], 'related'),
('janitor', 'This career reads labels with letters on cleaning supplies to use them safely.', 'letters', 'easy', 'elementary', 0, ARRAY['custodian', 'housekeeper', 'maintenance-worker'], 'related'),
('janitor', 'This career keeps schools and buildings clean and safe for everyone in the community.', 'community', 'easy', 'elementary', 0, ARRAY['custodian', 'maintenance-worker', 'facilities-manager'], 'same_skill'),
('janitor', 'This career uses tools and equipment that come in different shapes like mops and brooms.', 'shapes', 'easy', 'elementary', 0, ARRAY['custodian', 'cleaner', 'maintenance-worker'], 'related'),
('janitor', 'This career counts supplies like trash bags and paper towels to know what to reorder.', 'counting', 'medium', 'elementary', 3, ARRAY['custodian', 'supply-manager', 'facilities-coordinator'], 'related');

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
-- COMPLETE 24 CAREERS FOR 5x5 BINGO GRID
-- ================================================================
-- 1. chef             2. teacher          3. doctor           4. firefighter
-- 5. police-officer   6. nurse            7. artist           8. librarian
-- 9. scientist        10. engineer        11. farmer          12. coach
-- 13. veterinarian    14. musician        15. dentist         16. baker
-- 17. photographer    18. mail-carrier    19. park-ranger     20. writer
-- 21. bus-driver      22. dancer          23. crossing-guard  24. janitor
--
-- 5x5 Grid: 24 careers + 1 free space (center) = 25 squares total
-- ================================================================
