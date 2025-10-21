-- ============================================
-- Sync Company Color Schemes to Industry Colors
-- Updates all companies to use their industry's color scheme
-- ============================================

-- Update all companies to inherit their industry's color_scheme
UPDATE ccm_company_rooms c
SET color_scheme = i.color_scheme
FROM ccm_industries i
WHERE c.industry_id = i.id
  AND c.industry_id IS NOT NULL;

-- ============================================
-- Verification
-- ============================================

DO $$
DECLARE
    rec RECORD;
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO updated_count
    FROM ccm_company_rooms
    WHERE industry_id IS NOT NULL;

    RAISE NOTICE '';
    RAISE NOTICE '✅ Company Color Schemes Updated';
    RAISE NOTICE '   - % companies now use industry colors', updated_count;
    RAISE NOTICE '';

    RAISE NOTICE 'Color Scheme by Industry:';
    FOR rec IN
        SELECT
            i.name as industry_name,
            i.color_scheme->>'primary' as primary_color,
            i.color_scheme->>'secondary' as secondary_color,
            COUNT(c.id) as company_count
        FROM ccm_industries i
        LEFT JOIN ccm_company_rooms c ON c.industry_id = i.id
        GROUP BY i.name, i.color_scheme, i.display_order
        ORDER BY i.display_order
    LOOP
        RAISE NOTICE '   - %: % (% companies)',
            rec.industry_name,
            rec.primary_color,
            rec.company_count;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '💡 All companies now match their industry color scheme';
    RAISE NOTICE '';
END $$;

-- Show sample of updated companies
SELECT
    c.name as company_name,
    i.name as industry_name,
    c.color_scheme->>'primary' as company_primary,
    i.color_scheme->>'primary' as industry_primary,
    CASE
        WHEN c.color_scheme->>'primary' = i.color_scheme->>'primary' THEN '✓ Match'
        ELSE '✗ Mismatch'
    END as color_match
FROM ccm_company_rooms c
LEFT JOIN ccm_industries i ON c.industry_id = i.id
ORDER BY i.name, c.name
LIMIT 20;
