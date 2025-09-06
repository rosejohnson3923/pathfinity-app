-- Migration to fix column names in skills_master_v2 table
-- Standardizing to use 'grade_level' instead of 'grade' to match codebase convention

-- Rename 'grade' column to 'grade_level' if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'skills_master_v2' 
        AND column_name = 'grade'
    ) THEN
        ALTER TABLE skills_master_v2 
        RENAME COLUMN grade TO grade_level;
        
        RAISE NOTICE 'Column renamed from grade to grade_level';
    ELSE
        RAISE NOTICE 'Column grade does not exist or already renamed';
    END IF;
END $$;

-- Update any constraints that reference the old column name
DO $$
BEGIN
    -- Update unique constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'skills_master_v2_subject_grade_skill_number_key'
    ) THEN
        ALTER TABLE skills_master_v2 
        DROP CONSTRAINT IF EXISTS skills_master_v2_subject_grade_skill_number_key;
        
        ALTER TABLE skills_master_v2 
        ADD CONSTRAINT skills_master_v2_subject_grade_level_skill_number_key 
        UNIQUE (subject, grade_level, skill_number);
        
        RAISE NOTICE 'Unique constraint updated';
    END IF;
END $$;

-- Create index on grade_level for performance
CREATE INDEX IF NOT EXISTS idx_skills_master_v2_grade_level 
ON skills_master_v2(grade_level);

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'skills_master_v2' 
AND column_name IN ('grade', 'grade_level');