-- ============================================
-- Add Financial Services and Energy Industries
-- Update incorrectly categorized companies
-- ============================================

-- Add Financial Services industry
INSERT INTO ccm_industries (code, name, description, icon, color_scheme, display_order)
VALUES (
    'FINANCIAL',
    'Financial Services',
    'Banks, financial institutions, and money management services',
    '💰',
    '{"primary": "#059669", "secondary": "#047857"}'::jsonb,
    13
) ON CONFLICT (code) DO NOTHING;

-- Add Energy industry
INSERT INTO ccm_industries (code, name, description, icon, color_scheme, display_order)
VALUES (
    'ENERGY',
    'Energy',
    'Renewable energy, power generation, and sustainability services',
    '⚡',
    '{"primary": "#84CC16", "secondary": "#65A30D"}'::jsonb,
    14
) ON CONFLICT (code) DO NOTHING;

-- ============================================
-- Update Financial Services Companies
-- ============================================

-- Money Helpers Bank
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'FINANCIAL' LIMIT 1)
WHERE code IN ('MONEYHELPERS', 'MONEYHELPERSBANK', 'MONEY_HELPERS', 'MONEYHELPERS_ELEM');

-- Horizon Financial
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'FINANCIAL' LIMIT 1)
WHERE code IN ('HORIZON', 'HORIZONFINANCIAL', 'HORIZON_ELEM');

-- ============================================
-- Update Energy Companies
-- ============================================

-- Green Power Team
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'ENERGY' LIMIT 1)
WHERE code IN ('GREENPOWERTEAM', 'GREENPOWER', 'GREEN_POWER', 'GREENPOWERTEAM_ELEM');

-- GreenGrid Energy
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'ENERGY' LIMIT 1)
WHERE code IN ('GREENGRID', 'GREENGRIDENERGY', 'GREENGRID_ELEM');

-- ============================================
-- Verification
-- ============================================

DO $$
DECLARE
    total_industries INTEGER;
    rec RECORD;
BEGIN
    SELECT COUNT(*) INTO total_industries FROM ccm_industries;

    RAISE NOTICE '';
    RAISE NOTICE '✅ New Industries Added';
    RAISE NOTICE '   - Financial Services (💰)';
    RAISE NOTICE '   - Energy (⚡)';
    RAISE NOTICE '';
    RAISE NOTICE 'Total industries: %', total_industries;
    RAISE NOTICE '';

    RAISE NOTICE 'Updated Companies:';
    RAISE NOTICE '   Financial Services:';
    FOR rec IN
        SELECT code, name
        FROM ccm_company_rooms
        WHERE industry_id = (SELECT id FROM ccm_industries WHERE code = 'FINANCIAL' LIMIT 1)
        ORDER BY code
    LOOP
        RAISE NOTICE '      - % (%)', rec.code, rec.name;
    END LOOP;

    RAISE NOTICE '   Energy:';
    FOR rec IN
        SELECT code, name
        FROM ccm_company_rooms
        WHERE industry_id = (SELECT id FROM ccm_industries WHERE code = 'ENERGY' LIMIT 1)
        ORDER BY code
    LOOP
        RAISE NOTICE '      - % (%)', rec.code, rec.name;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'Full Industry Distribution:';
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
END $$;
