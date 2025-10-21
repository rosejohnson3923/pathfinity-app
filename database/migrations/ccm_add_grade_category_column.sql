-- ============================================
-- Add grade_category column to CCM tables
-- Run this BEFORE ccm_add_middle_school_companies.sql
-- ============================================

-- First, check if columns already exist (they might from the initial migration)
DO $$
BEGIN
    -- Drop old constraints if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'ccm_company_rooms' AND constraint_name LIKE '%grade_category%'
    ) THEN
        ALTER TABLE ccm_company_rooms DROP CONSTRAINT IF EXISTS ccm_company_rooms_grade_category_check;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'ccm_business_scenarios' AND constraint_name LIKE '%grade_category%'
    ) THEN
        ALTER TABLE ccm_business_scenarios DROP CONSTRAINT IF EXISTS ccm_business_scenarios_grade_category_check;
    END IF;
END $$;

-- Add columns if they don't exist (without constraints for now)
ALTER TABLE ccm_company_rooms
ADD COLUMN IF NOT EXISTS grade_category TEXT,
ADD COLUMN IF NOT EXISTS company_age INTEGER,
ADD COLUMN IF NOT EXISTS company_values TEXT[];

ALTER TABLE ccm_business_scenarios
ADD COLUMN IF NOT EXISTS grade_category TEXT;

-- Set default value of 'other' for existing rows
UPDATE ccm_company_rooms
SET grade_category = 'other'
WHERE grade_category IS NULL;

UPDATE ccm_business_scenarios
SET grade_category = 'other'
WHERE grade_category IS NULL;

-- Verify columns exist
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('ccm_company_rooms', 'ccm_business_scenarios')
    AND column_name = 'grade_category';
