-- ============================================
-- Update CCM Company Rooms with Grade Categories
-- Ensures all 20 companies have proper grade_category set
-- ============================================

-- Update all "other" (middle/high school) companies
UPDATE ccm_company_rooms
SET grade_category = 'other'
WHERE code IN (
    'TRENDFWD',
    'QUICKSERVE',
    'HORIZON',
    'SKYCONNECT',
    'GREENGRID',
    'CLOUDPEAK',
    'MEDICORE',
    'NEXTGEN',
    'PLAYFORGE',
    'BUILDRIGHT'
);

-- Update all "elementary" companies
UPDATE ccm_company_rooms
SET grade_category = 'elementary'
WHERE code IN (
    'TRENDFWD_ELEM',
    'QUICKSERVE_ELEM',
    'HORIZON_ELEM',
    'SKYCONNECT_ELEM',
    'GREENGRID_ELEM',
    'CLOUDPEAK_ELEM',
    'MEDICORE_ELEM',
    'NEXTGEN_ELEM',
    'PLAYFORGE_ELEM',
    'BUILDRIGHT_ELEM'
);

-- Verify the update
SELECT
    grade_category,
    COUNT(*) as company_count,
    ARRAY_AGG(code ORDER BY code) as companies
FROM ccm_company_rooms
GROUP BY grade_category
ORDER BY grade_category;

-- Expected result:
-- grade_category | company_count | companies
-- ---------------+---------------+-----------
-- elementary     | 10            | [BUILDRIGHT_ELEM, CLOUDPEAK_ELEM, ...]
-- other          | 10            | [BUILDRIGHT, CLOUDPEAK, ...]

COMMENT ON COLUMN ccm_company_rooms.grade_category IS
'Target grade level: "elementary" for K-5 kid-friendly companies, "other" for middle/high school (6-12) companies. This determines age-appropriate challenge content and language complexity.';

-- ============================================
-- Add Index and Constraint
-- ============================================

-- Add index for efficient querying by grade category
CREATE INDEX IF NOT EXISTS idx_ccm_company_rooms_grade ON ccm_company_rooms(grade_category);

-- Add index for scenarios by grade category
CREATE INDEX IF NOT EXISTS idx_ccm_scenarios_grade ON ccm_business_scenarios(grade_category);

-- Add composite index for company + grade queries
CREATE INDEX IF NOT EXISTS idx_ccm_scenarios_company_grade ON ccm_business_scenarios(company_room_id, grade_category);

-- ============================================
-- Add Constraint Function
-- ============================================
-- Ensure scenarios match their company's grade_category

CREATE OR REPLACE FUNCTION check_scenario_grade_matches_company()
RETURNS TRIGGER AS $$
DECLARE
    company_grade TEXT;
BEGIN
    -- Get the grade_category of the company
    SELECT grade_category INTO company_grade
    FROM ccm_company_rooms
    WHERE id = NEW.company_room_id;

    -- Check if scenario grade matches company grade
    IF NEW.grade_category != company_grade THEN
        RAISE EXCEPTION 'Scenario grade_category (%) must match company grade_category (%)',
            NEW.grade_category, company_grade;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to enforce grade matching
DROP TRIGGER IF EXISTS enforce_scenario_grade_match ON ccm_business_scenarios;
CREATE TRIGGER enforce_scenario_grade_match
    BEFORE INSERT OR UPDATE ON ccm_business_scenarios
    FOR EACH ROW
    EXECUTE FUNCTION check_scenario_grade_matches_company();

COMMENT ON FUNCTION check_scenario_grade_matches_company() IS
'Ensures that business scenarios always match their company''s grade_category (elementary scenarios for elementary companies, other scenarios for other companies).';
