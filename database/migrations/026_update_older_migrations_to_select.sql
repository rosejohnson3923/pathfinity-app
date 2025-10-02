-- ============================================================
-- Migration: Update older migration references to Select tier
-- Date: 2025-09-29
-- Description: Updates references in tables created by older migrations
--              that still reference 'basic' tier
-- Note: Run AFTER 025_basic_to_select_rebrand.sql
-- ============================================================

BEGIN;

-- 1. Update template_types table from migration 020
UPDATE template_types
SET
    template_type_code = REPLACE(template_type_code, 'BASIC_', 'SELECT_'),
    template_name = REPLACE(template_name, 'Basic ', 'Select '),
    description = REPLACE(description, 'basic tier', 'select tier')
WHERE template_type_code LIKE 'BASIC_%';

-- Update access_tier constraint in template_types
ALTER TABLE template_types
DROP CONSTRAINT IF EXISTS template_types_access_tier_check;

UPDATE template_types
SET access_tier = 'select'
WHERE access_tier = 'basic';

ALTER TABLE template_types
ADD CONSTRAINT template_types_access_tier_check
CHECK (access_tier IN ('select', 'premium'));

-- 2. Update lesson_template_components from migration 020
UPDATE lesson_template_components
SET template_type_code = REPLACE(template_type_code, 'BASIC_', 'SELECT_')
WHERE template_type_code LIKE 'BASIC_%';

-- 3. Update any analytics_access references to 'select'
ALTER TABLE tenants
DROP CONSTRAINT IF EXISTS tenants_analytics_access_check;

UPDATE tenants
SET analytics_access = 'select'
WHERE analytics_access = 'basic';

ALTER TABLE tenants
ADD CONSTRAINT tenants_analytics_access_check
CHECK (analytics_access IN ('select', 'advanced', 'full'));

-- 4. Update subscription_tiers descriptions
UPDATE subscription_tiers
SET
    tier_name = 'Select'
WHERE tier_code = 'select';

-- 5. Update lesson_archives if it has subscription_tier
DO $$
BEGIN
    IF EXISTS (
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'lesson_archives'
        AND column_name = 'access_tier'
    ) THEN
        UPDATE lesson_archives
        SET access_tier = 'select'
        WHERE access_tier = 'basic';
    END IF;
END $$;

-- 6. Create migration log entry
INSERT INTO migration_history (
    migration_name,
    migration_date,
    description,
    success
) VALUES (
    '026_update_older_migrations_to_select',
    NOW(),
    'Updated references in older migration tables from basic to select',
    true
) ON CONFLICT DO NOTHING;

-- Verification
DO $$
DECLARE
    remaining_basic INTEGER;
BEGIN
    -- Check template_types
    SELECT COUNT(*) INTO remaining_basic
    FROM template_types
    WHERE template_type_code LIKE '%BASIC%'
       OR access_tier = 'basic';

    IF remaining_basic > 0 THEN
        RAISE WARNING 'Still have % template_types with basic references', remaining_basic;
    ELSE
        RAISE NOTICE 'All template_types successfully updated to select';
    END IF;

    -- Check tenants analytics access
    SELECT COUNT(*) INTO remaining_basic
    FROM tenants
    WHERE analytics_access = 'basic';

    IF remaining_basic > 0 THEN
        RAISE WARNING 'Still have % tenants with basic analytics_access', remaining_basic;
    ELSE
        RAISE NOTICE 'All tenants analytics_access successfully updated';
    END IF;
END $$;

COMMIT;

-- ============================================================
-- Post-migration verification queries
-- ============================================================

/*
-- Check all template types
SELECT
    template_type_code,
    access_tier,
    template_name
FROM template_types
WHERE template_type_code LIKE '%SELECT%'
   OR template_type_code LIKE '%BASIC%'
ORDER BY template_type_code;

-- Check lesson template components
SELECT DISTINCT
    template_type_code,
    COUNT(*) as component_count
FROM lesson_template_components
GROUP BY template_type_code
ORDER BY template_type_code;

-- Check tenants analytics access
SELECT DISTINCT
    analytics_access,
    COUNT(*) as tenant_count
FROM tenants
GROUP BY analytics_access;
*/