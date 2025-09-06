-- ================================================================
-- ADD GRADE 10 TO SKILLS MASTER CONSTRAINT
-- Migration: 20250714_add_grade_10_constraint.sql
-- Description: Update skills_master table to include grade 10
-- ================================================================

-- Drop the existing grade constraint
ALTER TABLE skills_master DROP CONSTRAINT IF EXISTS skills_master_grade_check;

-- Add new constraint including grade 10
ALTER TABLE skills_master ADD CONSTRAINT skills_master_grade_check 
CHECK (grade IN ('Pre-K', 'K', '1', '3', '7', '10', 'Algebra1', 'Precalculus'));

-- Log the change
SELECT 'Skills master grade constraint updated to include grade 10' as migration_status;

-- Verify the constraint exists
SELECT 
    constraint_name, 
    check_clause 
FROM information_schema.check_constraints 
WHERE table_name = 'skills_master' 
AND constraint_name = 'skills_master_grade_check';