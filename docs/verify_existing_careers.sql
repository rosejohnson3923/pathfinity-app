-- ================================================================
-- Verify which careers exist in your database
-- Run this FIRST to see which career codes are available
-- ================================================================

SELECT career_code, career_name, is_active
FROM career_paths
WHERE career_code IN (
  'artist',
  'athlete',
  'chef',
  'coach',
  'doctor',
  'engineer',
  'farmer',
  'firefighter',
  'librarian',
  'musician',
  'nurse',
  'pilot',
  'police-officer',
  'scientist',
  'teacher',
  'veterinarian'
)
ORDER BY career_code;

-- This will show you which careers from the seed file actually exist
-- Copy the career_code values that appear in the results
