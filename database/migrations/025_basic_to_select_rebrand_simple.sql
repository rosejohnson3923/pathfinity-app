-- ============================================================
-- Migration: Rebrand "Basic" to "Select" Tier (Simplified)
-- Date: 2025-09-29
-- Description: Updates only existing tables from "basic" to "select"
-- ============================================================

-- Start transaction
BEGIN;

-- 1. Update career_paths table (if exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'career_paths'
    ) THEN
        -- Drop old constraint if exists
        ALTER TABLE career_paths
        DROP CONSTRAINT IF EXISTS career_paths_access_tier_check;

        -- Update the tier
        UPDATE career_paths
        SET access_tier = 'select'
        WHERE access_tier = 'basic';

        -- Add new constraint
        ALTER TABLE career_paths
        ADD CONSTRAINT career_paths_access_tier_check
        CHECK (access_tier IN ('select', 'premium'));

        RAISE NOTICE 'Updated career_paths table';
    END IF;
END $$;

-- 2. Update tenants table (if exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants'
        AND column_name = 'subscription_tier'
    ) THEN
        -- Update default value
        ALTER TABLE tenants
        ALTER COLUMN subscription_tier SET DEFAULT 'select'::text;

        -- Update existing rows
        UPDATE tenants
        SET subscription_tier = 'select'
        WHERE subscription_tier = 'basic';

        RAISE NOTICE 'Updated tenants table';
    END IF;
END $$;

-- 3. Update subscription_tiers table (if exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'subscription_tiers'
    ) THEN
        UPDATE subscription_tiers
        SET
            tier_code = 'select',
            tier_name = 'Select'
        WHERE tier_code = 'basic';

        RAISE NOTICE 'Updated subscription_tiers table';
    END IF;
END $$;

-- 4. Update any JSONB settings fields that might contain "basic" references
DO $$
BEGIN
    -- Update tenants settings if column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants'
        AND column_name = 'settings'
    ) THEN
        UPDATE tenants
        SET settings = jsonb_set(
            settings,
            '{subscription_tier}',
            '"select"'
        )
        WHERE settings->>'subscription_tier' = 'basic';

        RAISE NOTICE 'Updated tenants settings JSONB';
    END IF;
END $$;

-- 5. Create migration log entry (if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'migration_history'
    ) THEN
        INSERT INTO migration_history (
            migration_name,
            migration_date,
            description,
            success
        ) VALUES (
            '025_basic_to_select_rebrand_simple',
            NOW(),
            'Rebranded all "basic" tier references to "select" tier (simplified)',
            true
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Verification
DO $$
DECLARE
    basic_count INTEGER := 0;
    select_count INTEGER := 0;
BEGIN
    -- Check career_paths if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'career_paths'
    ) THEN
        SELECT COUNT(*) INTO basic_count
        FROM career_paths
        WHERE access_tier = 'basic';

        SELECT COUNT(*) INTO select_count
        FROM career_paths
        WHERE access_tier = 'select';

        RAISE NOTICE 'Career paths - Basic: %, Select: %', basic_count, select_count;
    END IF;

    -- Check subscription_tiers if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'subscription_tiers'
    ) THEN
        SELECT COUNT(*) INTO basic_count
        FROM subscription_tiers
        WHERE tier_code = 'basic';

        SELECT COUNT(*) INTO select_count
        FROM subscription_tiers
        WHERE tier_code = 'select';

        RAISE NOTICE 'Subscription tiers - Basic: %, Select: %', basic_count, select_count;
    END IF;

    -- Warn if any basic references remain
    IF basic_count > 0 THEN
        RAISE WARNING 'Found % remaining basic references!', basic_count;
    ELSE
        RAISE NOTICE 'Successfully migrated all basic references to select';
    END IF;
END $$;

COMMIT;

-- ============================================================
-- Post-migration verification queries (run manually)
-- ============================================================

/*
-- Check what tables actually exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('career_paths', 'tenants', 'subscription_tiers', 'lesson_plan_templates')
ORDER BY table_name;

-- Check career_paths distribution (if exists)
SELECT
    access_tier,
    COUNT(*) as count
FROM career_paths
GROUP BY access_tier;

-- Check subscription_tiers (if exists)
SELECT * FROM subscription_tiers
WHERE tier_code IN ('select', 'basic');

-- Check tenants subscription tier (if exists)
SELECT DISTINCT subscription_tier, COUNT(*)
FROM tenants
GROUP BY subscription_tier;
*/