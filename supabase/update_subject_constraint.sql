-- ================================================================
-- UPDATE SUBJECT CONSTRAINT TO INCLUDE ALGEBRA1 AND PRECALCULUS
-- Run this in Supabase Dashboard > SQL Editor
-- ================================================================

-- Drop the existing subject constraint
ALTER TABLE skills_master DROP CONSTRAINT IF EXISTS skills_master_subject_check;

-- Add new constraint including Algebra1 and Precalculus
ALTER TABLE skills_master ADD CONSTRAINT skills_master_subject_check 
CHECK (subject IN ('Math', 'ELA', 'Science', 'SocialStudies', 'Algebra1', 'Precalculus'));

-- Verify the constraint was updated
SELECT 
    'SUBJECT CONSTRAINT UPDATED' as status,
    cc.constraint_name,
    cc.check_clause
FROM information_schema.check_constraints cc
JOIN information_schema.table_constraints tc 
    ON cc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'skills_master' 
AND cc.constraint_name = 'skills_master_subject_check';