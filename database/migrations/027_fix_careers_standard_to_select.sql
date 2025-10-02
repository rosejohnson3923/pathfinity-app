-- Fix careers table tier naming: Change 'standard' to 'select'
-- This aligns with the rest of the database that uses 'select' tier
-- The careers table was created after the Basic->Select migration but incorrectly used 'standard'

-- Step 1: Drop the existing constraint on careers table
ALTER TABLE careers DROP CONSTRAINT IF EXISTS careers_tier_check;

-- Step 2: Update all 'standard' tier records to 'select'
UPDATE careers
SET tier = 'select'
WHERE tier = 'standard';

-- Step 3: Add the corrected constraint
ALTER TABLE careers
ADD CONSTRAINT careers_tier_check
CHECK (tier IN ('select', 'premium'));

-- Step 4: Verify the migration
DO $$
DECLARE
    select_count INTEGER;
    standard_count INTEGER;
    premium_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO select_count FROM careers WHERE tier = 'select';
    SELECT COUNT(*) INTO standard_count FROM careers WHERE tier = 'standard';
    SELECT COUNT(*) INTO premium_count FROM careers WHERE tier = 'premium';

    RAISE NOTICE '===================================';
    RAISE NOTICE 'Career Tier Migration Results:';
    RAISE NOTICE '===================================';
    RAISE NOTICE 'Careers with "select" tier: %', select_count;
    RAISE NOTICE 'Careers with "premium" tier: %', premium_count;
    RAISE NOTICE 'Careers with "standard" tier (should be 0): %', standard_count;

    IF standard_count > 0 THEN
        RAISE EXCEPTION 'Migration failed! Still have % careers with "standard" tier', standard_count;
    ELSE
        RAISE NOTICE '✓ Successfully migrated all careers to use "select" tier';
    END IF;
END $$;

-- Step 5: Add migration record
INSERT INTO migrations (
    version,
    name,
    description,
    executed_at
) VALUES (
    27,
    'fix_careers_standard_to_select',
    'Fixed careers table to use "select" tier instead of incorrectly used "standard"',
    NOW()
) ON CONFLICT (version) DO NOTHING;