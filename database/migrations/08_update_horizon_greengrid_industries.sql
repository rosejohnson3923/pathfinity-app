-- ============================================
-- Update HORIZON and GREENGRID to Correct Industries
-- HORIZON → Financial Services
-- GREENGRID → Energy
-- ============================================

-- Update HORIZON companies to Financial Services
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'FINANCIAL' LIMIT 1)
WHERE code IN ('HORIZON', 'HORIZON_ELEM');

-- Update GREENGRID companies to Energy
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'ENERGY' LIMIT 1)
WHERE code IN ('GREENGRID', 'GREENGRID_ELEM');

-- ============================================
-- Verification
-- ============================================

DO $$
DECLARE
    rec RECORD;
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count FROM ccm_company_rooms WHERE industry_id IS NULL;

    RAISE NOTICE '';
    RAISE NOTICE '✅ Companies Updated';
    RAISE NOTICE '';

    RAISE NOTICE 'Financial Services Companies:';
    FOR rec IN
        SELECT code, name
        FROM ccm_company_rooms
        WHERE industry_id = (SELECT id FROM ccm_industries WHERE code = 'FINANCIAL' LIMIT 1)
        ORDER BY code
    LOOP
        RAISE NOTICE '   - % (%)', rec.code, rec.name;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'Energy Companies:';
    FOR rec IN
        SELECT code, name
        FROM ccm_company_rooms
        WHERE industry_id = (SELECT id FROM ccm_industries WHERE code = 'ENERGY' LIMIT 1)
        ORDER BY code
    LOOP
        RAISE NOTICE '   - % (%)', rec.code, rec.name;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'Companies still NULL: %', null_count;
    RAISE NOTICE '';

    IF null_count = 0 THEN
        RAISE NOTICE '🎉 All companies successfully mapped to industries!';
        RAISE NOTICE '';
        RAISE NOTICE 'Final Industry Distribution:';
        FOR rec IN
            SELECT
                i.name as industry_name,
                COUNT(c.id) as company_count
            FROM ccm_industries i
            LEFT JOIN ccm_company_rooms c ON c.industry_id = i.id
            GROUP BY i.name, i.display_order
            ORDER BY i.display_order
        LOOP
            RAISE NOTICE '   - %: % companies', rec.industry_name, rec.company_count;
        END LOOP;
        RAISE NOTICE '';
    END IF;
END $$;
