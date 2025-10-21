-- ============================================
-- Fix Final Four Companies with NULL industry_id
-- Direct update for ARTBOX, FITFUSION, QUESTGAMES, TRAILBOUND
-- ============================================

-- Update ARTBOX to Retail
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'RETAIL' LIMIT 1)
WHERE code = 'ARTBOX';

-- Update FITFUSION to Health & Wellness
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'HEALTH' LIMIT 1)
WHERE code = 'FITFUSION';

-- Update QUESTGAMES to Entertainment
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'ENTERTAINMENT' LIMIT 1)
WHERE code = 'QUESTGAMES';

-- Update TRAILBOUND to Retail
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'RETAIL' LIMIT 1)
WHERE code = 'TRAILBOUND';

-- Verification
DO $$
DECLARE
    null_count INTEGER;
    rec RECORD;
BEGIN
    SELECT COUNT(*) INTO null_count FROM ccm_company_rooms WHERE industry_id IS NULL;

    RAISE NOTICE '';
    RAISE NOTICE '✅ Final Four Companies Updated';
    RAISE NOTICE '   - ARTBOX → Retail';
    RAISE NOTICE '   - FITFUSION → Health & Wellness';
    RAISE NOTICE '   - QUESTGAMES → Entertainment';
    RAISE NOTICE '   - TRAILBOUND → Retail';
    RAISE NOTICE '';
    RAISE NOTICE 'Companies still NULL: %', null_count;
    RAISE NOTICE '';

    IF null_count > 0 THEN
        RAISE NOTICE '⚠️  Remaining unmapped companies:';
        FOR rec IN
            SELECT code, name
            FROM ccm_company_rooms
            WHERE industry_id IS NULL
            ORDER BY code
        LOOP
            RAISE NOTICE '   - % (%)', rec.code, rec.name;
        END LOOP;
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '🎉 All companies now have industry assignments!';
        RAISE NOTICE '';

        -- Show final distribution
        RAISE NOTICE 'Final Industry Distribution:';
        FOR rec IN
            SELECT
                i.name as industry_name,
                COUNT(c.id) as company_count
            FROM ccm_industries i
            LEFT JOIN ccm_company_rooms c ON c.industry_id = i.id
            GROUP BY i.name
            ORDER BY i.name
        LOOP
            RAISE NOTICE '   - %: % companies', rec.industry_name, rec.company_count;
        END LOOP;
        RAISE NOTICE '';
    END IF;
END $$;
