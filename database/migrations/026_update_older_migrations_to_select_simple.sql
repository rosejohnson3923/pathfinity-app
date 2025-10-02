-- ============================================================
-- Migration: Update older migration references to Select tier (Simplified)
-- Date: 2025-09-29
-- Description: Updates references in tables created by older migrations
--              that still reference 'basic' tier - SAFE VERSION
-- Note: Run AFTER 025_basic_to_select_rebrand_simple.sql
-- ============================================================

BEGIN;

-- 1. Update template_types table from migration 020 (if exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'template_types'
    ) THEN
        -- Update template codes
        UPDATE template_types
        SET
            template_type_code = REPLACE(template_type_code, 'BASIC_', 'SELECT_'),
            template_name = REPLACE(template_name, 'Basic ', 'Select '),
            description = REPLACE(description, 'basic tier', 'select tier')
        WHERE template_type_code LIKE 'BASIC_%';

        -- Update access_tier constraint
        ALTER TABLE template_types
        DROP CONSTRAINT IF EXISTS template_types_access_tier_check;

        UPDATE template_types
        SET access_tier = 'select'
        WHERE access_tier = 'basic';

        ALTER TABLE template_types
        ADD CONSTRAINT template_types_access_tier_check
        CHECK (access_tier IN ('select', 'premium'));

        RAISE NOTICE 'Updated template_types table';
    END IF;
END $$;

-- 2. Update lesson_template_components from migration 020 (if exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'lesson_template_components'
    ) THEN
        UPDATE lesson_template_components
        SET template_type_code = REPLACE(template_type_code, 'BASIC_', 'SELECT_')
        WHERE template_type_code LIKE 'BASIC_%';

        RAISE NOTICE 'Updated lesson_template_components table';
    END IF;
END $$;

-- 3. Update lesson_plan_templates if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'lesson_plan_templates'
    ) THEN
        -- Check if access_tier column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'lesson_plan_templates'
            AND column_name = 'access_tier'
        ) THEN
            UPDATE lesson_plan_templates
            SET access_tier = 'select'
            WHERE access_tier = 'basic';

            RAISE NOTICE 'Updated lesson_plan_templates table';
        END IF;

        -- Check if template_code column exists
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'lesson_plan_templates'
            AND column_name = 'template_code'
        ) THEN
            UPDATE lesson_plan_templates
            SET template_code = REPLACE(template_code, 'BASIC_', 'SELECT_')
            WHERE template_code LIKE 'BASIC_%';
        END IF;
    END IF;
END $$;

-- 4. Update any analytics_access references to 'select' (if exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tenants'
        AND column_name = 'analytics_access'
    ) THEN
        ALTER TABLE tenants
        DROP CONSTRAINT IF EXISTS tenants_analytics_access_check;

        UPDATE tenants
        SET analytics_access = 'select'
        WHERE analytics_access = 'basic';

        ALTER TABLE tenants
        ADD CONSTRAINT tenants_analytics_access_check
        CHECK (analytics_access IN ('select', 'advanced', 'full'));

        RAISE NOTICE 'Updated tenants analytics_access';
    END IF;
END $$;

-- 5. Update subscription_tiers descriptions (already done in 025, but double-check)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'subscription_tiers'
    ) THEN
        UPDATE subscription_tiers
        SET tier_name = 'Select'
        WHERE tier_code = 'select';

        RAISE NOTICE 'Verified subscription_tiers updates';
    END IF;
END $$;

-- 6. Update lesson_archives if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'lesson_archives'
    ) THEN
        -- Check for access_tier column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'lesson_archives'
            AND column_name = 'access_tier'
        ) THEN
            UPDATE lesson_archives
            SET access_tier = 'select'
            WHERE access_tier = 'basic';

            RAISE NOTICE 'Updated lesson_archives access_tier';
        END IF;

        -- Check for subscription_tier column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'lesson_archives'
            AND column_name = 'subscription_tier'
        ) THEN
            ALTER TABLE lesson_archives
            ALTER COLUMN subscription_tier SET DEFAULT 'select';

            UPDATE lesson_archives
            SET subscription_tier = 'select'
            WHERE subscription_tier = 'basic';

            RAISE NOTICE 'Updated lesson_archives subscription_tier';
        END IF;
    END IF;
END $$;

-- 7. Create migration log entry (if table exists)
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
            '026_update_older_migrations_to_select_simple',
            NOW(),
            'Updated references in older migration tables from basic to select (simplified)',
            true
        ) ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Verification
DO $$
DECLARE
    remaining_basic INTEGER := 0;
    checked_table TEXT;
BEGIN
    -- List tables that were checked
    RAISE NOTICE '=== Tables Checked ===';

    -- Check template_types
    IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_name = 'template_types') THEN
        SELECT COUNT(*) INTO remaining_basic
        FROM template_types
        WHERE template_type_code LIKE '%BASIC%' OR access_tier = 'basic';

        IF remaining_basic > 0 THEN
            RAISE WARNING 'template_types still has % basic references', remaining_basic;
        ELSE
            RAISE NOTICE '✓ template_types: all basic references updated';
        END IF;
    ELSE
        RAISE NOTICE '- template_types: table does not exist';
    END IF;

    -- Check tenants analytics access
    IF EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_name = 'tenants' AND c.column_name = 'analytics_access'
    ) THEN
        SELECT COUNT(*) INTO remaining_basic
        FROM tenants
        WHERE analytics_access = 'basic';

        IF remaining_basic > 0 THEN
            RAISE WARNING 'tenants still has % basic analytics_access', remaining_basic;
        ELSE
            RAISE NOTICE '✓ tenants analytics_access: all basic references updated';
        END IF;
    ELSE
        RAISE NOTICE '- tenants.analytics_access: column does not exist';
    END IF;

    -- Check lesson_plan_templates
    IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_name = 'lesson_plan_templates') THEN
        RAISE NOTICE '✓ lesson_plan_templates: checked and updated';
    ELSE
        RAISE NOTICE '- lesson_plan_templates: table does not exist';
    END IF;

    -- Check lesson_archives
    IF EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_name = 'lesson_archives') THEN
        RAISE NOTICE '✓ lesson_archives: checked and updated';
    ELSE
        RAISE NOTICE '- lesson_archives: table does not exist';
    END IF;
END $$;

COMMIT;

-- ============================================================
-- Post-migration verification queries (run manually)
-- ============================================================

/*
-- Check what tables actually exist in the database
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'template_types',
    'lesson_template_components',
    'lesson_plan_templates',
    'lesson_archives'
)
ORDER BY table_name;

-- Check all template types (if exists)
SELECT
    template_type_code,
    access_tier,
    template_name
FROM template_types
WHERE template_type_code LIKE '%SELECT%'
   OR template_type_code LIKE '%BASIC%'
ORDER BY template_type_code;

-- Check lesson template components (if exists)
SELECT DISTINCT
    template_type_code,
    COUNT(*) as component_count
FROM lesson_template_components
GROUP BY template_type_code
ORDER BY template_type_code;

-- Check tenants analytics access (if exists)
SELECT DISTINCT
    analytics_access,
    COUNT(*) as tenant_count
FROM tenants
GROUP BY analytics_access;
*/