-- ================================================================
-- FIX SKILLS MASTER GRADE CONSTRAINT
-- Migration: 20250713_fix_skills_master_grade_constraint.sql
-- Description: Update skills_master table to allow all required grades
-- ================================================================

-- Drop the existing restrictive grade constraint
ALTER TABLE skills_master DROP CONSTRAINT IF EXISTS skills_master_grade_check;

-- Add new constraint allowing all required grades
ALTER TABLE skills_master ADD CONSTRAINT skills_master_grade_check 
CHECK (grade IN ('Pre-K', 'K', '1', '3', '7', '10', 'Algebra1', 'Precalculus'));

-- Log the change
SELECT 'Skills master grade constraint updated to allow: Pre-K, K, 1, 3, 7, 10, Algebra1, Precalculus' as migration_status;

-- Verify the constraint exists
SELECT 
    constraint_name, 
    check_clause 
FROM information_schema.check_constraints 
WHERE table_name = 'skills_master' 
AND constraint_name = 'skills_master_grade_check';