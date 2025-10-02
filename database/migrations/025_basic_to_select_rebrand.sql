-- ============================================================
-- Migration: Rebrand "Basic" to "Select" Tier
-- Date: 2025-09-29
-- Description: Updates all references from "basic" to "select"
--              across the database to reflect new branding
-- ============================================================

-- Start transaction
BEGIN;

-- 1. Update career_paths table
ALTER TABLE career_paths
DROP CONSTRAINT IF EXISTS career_paths_access_tier_check;

UPDATE career_paths
SET access_tier = 'select'
WHERE access_tier = 'basic';

ALTER TABLE career_paths
ADD CONSTRAINT career_paths_access_tier_check
CHECK (access_tier IN ('select', 'premium'));

-- 2. Update tenants table default subscription tier
ALTER TABLE tenants
ALTER COLUMN subscription_tier SET DEFAULT 'select'::text;

UPDATE tenants
SET subscription_tier = 'select'
WHERE subscription_tier = 'basic';

-- 3. Update subscription_tiers table
UPDATE subscription_tiers
SET
    tier_code = 'select',
    tier_name = 'Select'
WHERE tier_code = 'basic';

-- 4. Update user_subscription_history table (if exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'user_subscription_history'
    ) THEN
        UPDATE user_subscription_history
        SET subscription_tier = 'select'
        WHERE subscription_tier = 'basic';
    END IF;
END $$;

-- 5. Update lesson_templates table
ALTER TABLE lesson_templates
DROP CONSTRAINT IF EXISTS lesson_templates_access_tier_check;

UPDATE lesson_templates
SET access_tier = 'select'
WHERE access_tier = 'basic';

ALTER TABLE lesson_templates
ADD CONSTRAINT lesson_templates_access_tier_check
CHECK (access_tier IN ('select', 'premium'));

-- 6. Update template_code values in lesson_templates
UPDATE lesson_templates
SET template_code = 'SELECT_STANDARD'
WHERE template_code = 'BASIC_STANDARD';

UPDATE lesson_templates
SET template_code = 'SELECT_STANDARD_AI'
WHERE template_code = 'BASIC_STANDARD_AI';

-- 7. Update lesson_template_components
UPDATE lesson_template_components
SET template_code = 'SELECT_STANDARD'
WHERE template_code = 'BASIC_STANDARD';

UPDATE lesson_template_components
SET template_code = 'SELECT_STANDARD_AI'
WHERE template_code = 'BASIC_STANDARD_AI';

-- 8. Update lesson_archives table if subscription_tier column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'lesson_archives'
        AND column_name = 'subscription_tier'
    ) THEN
        ALTER TABLE lesson_archives
        ALTER COLUMN subscription_tier SET DEFAULT 'select';

        UPDATE lesson_archives
        SET subscription_tier = 'select'
        WHERE subscription_tier = 'basic';
    END IF;
END $$;

-- 9. Update any JSONB fields that might contain "basic" references
-- Update settings in tenants table if they contain subscription tier info
UPDATE tenants
SET settings = jsonb_set(
    settings,
    '{subscription_tier}',
    '"select"'
)
WHERE settings->>'subscription_tier' = 'basic';

-- 10. Update lesson template metadata
UPDATE lesson_template_components
SET metadata = jsonb_set(
    metadata,
    '{basic_terms}',
    metadata->'select_terms'
)
WHERE metadata ? 'basic_terms';

-- 11. Create a migration log entry
INSERT INTO migration_history (
    migration_name,
    migration_date,
    description,
    success
) VALUES (
    '025_basic_to_select_rebrand',
    NOW(),
    'Rebranded all "basic" tier references to "select" tier',
    true
) ON CONFLICT DO NOTHING;

-- 12. Add comment to tables for documentation
COMMENT ON COLUMN career_paths.access_tier IS 'Access tier: select (grade-appropriate selection) or premium (full library access)';
COMMENT ON COLUMN tenants.subscription_tier IS 'Subscription tier: select, premium, or enterprise';
COMMENT ON COLUMN lesson_templates.access_tier IS 'Access tier: select or premium';

-- Verification queries
DO $$
DECLARE
    basic_count INTEGER;
    select_count INTEGER;
BEGIN
    -- Check for any remaining "basic" references
    SELECT COUNT(*) INTO basic_count
    FROM career_paths
    WHERE access_tier = 'basic';

    SELECT COUNT(*) INTO select_count
    FROM career_paths
    WHERE access_tier = 'select';

    RAISE NOTICE 'Career paths - Basic: %, Select: %', basic_count, select_count;

    -- Check subscription tiers
    SELECT COUNT(*) INTO basic_count
    FROM subscription_tiers
    WHERE tier_code = 'basic';

    SELECT COUNT(*) INTO select_count
    FROM subscription_tiers
    WHERE tier_code = 'select';

    RAISE NOTICE 'Subscription tiers - Basic: %, Select: %', basic_count, select_count;
END $$;

COMMIT;

-- ============================================================
-- Post-migration verification
-- ============================================================

-- Run these queries to verify the migration:
/*
-- 1. Check career_paths distribution
SELECT
    access_tier,
    school_level,
    COUNT(*) as count
FROM career_paths
GROUP BY access_tier, school_level
ORDER BY school_level, access_tier;

-- 2. Check subscription_tiers
SELECT * FROM subscription_tiers WHERE tier_code IN ('select', 'basic');

-- 3. Check lesson_templates
SELECT
    template_code,
    access_tier,
    COUNT(*) as count
FROM lesson_templates
GROUP BY template_code, access_tier
ORDER BY template_code;

-- 4. Check tenants default
SELECT
    column_name,
    column_default
FROM information_schema.columns
WHERE table_name = 'tenants'
AND column_name = 'subscription_tier';
*/