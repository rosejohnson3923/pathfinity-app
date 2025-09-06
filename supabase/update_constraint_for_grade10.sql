-- ================================================================
-- ADD GRADE 10 TO SKILLS MASTER CONSTRAINT
-- Run this in Supabase Dashboard > SQL Editor
-- ================================================================

-- Drop the existing grade constraint
ALTER TABLE skills_master DROP CONSTRAINT IF EXISTS skills_master_grade_check;

-- Add new constraint including grade 10
ALTER TABLE skills_master ADD CONSTRAINT skills_master_grade_check 
CHECK (grade IN ('Pre-K', 'K', '1', '3', '7', '10', 'Algebra1', 'Precalculus'));

-- Verify the constraint was updated
SELECT 
    'CONSTRAINT UPDATED' as status,
    cc.constraint_name,
    cc.check_clause
FROM information_schema.check_constraints cc
JOIN information_schema.table_constraints tc 
    ON cc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'skills_master' 
AND cc.constraint_name = 'skills_master_grade_check';