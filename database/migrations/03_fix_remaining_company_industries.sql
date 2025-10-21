-- ============================================
-- Fix Remaining Company Industry Mappings
-- Updates companies that were missed in the initial migration
-- ============================================

-- First, let's see which companies currently have NULL or incorrect industry_id
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== Companies Currently Unmapped or in General ===';
END $$;

SELECT code, name,
    COALESCE((SELECT name FROM ccm_industries WHERE id = industry_id), 'NULL') as current_industry
FROM ccm_company_rooms
WHERE industry_id IS NULL
   OR industry_id = (SELECT id FROM ccm_industries WHERE code = 'GENERAL' LIMIT 1)
ORDER BY code;

-- ============================================
-- Food & Beverage Companies
-- ============================================

UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'FOOD' LIMIT 1)
WHERE code IN (
    'BEANBUZZ',          -- Coffee shop chain
    'QUICKSERVE',        -- Fast food chain
    'SLICECITY',         -- Slice City Pizza
    'SCOOPSHOP',         -- The Scoop Shop (ice cream)
    'SLICECITY_ELEM',    -- Elementary version
    'SCOOPSHOP_ELEM'     -- Elementary version
);

-- ============================================
-- Retail Companies
-- ============================================

UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'RETAIL' LIMIT 1)
WHERE code IN (
    'PAGECRAFT',         -- Bookstore chain
    'PAWPARADISE',       -- Pet supply stores
    'STYLEVAULT',        -- Fashion retail
    'TRENDFWD',          -- Fashion retail
    'ARTBOX',            -- ArtBox Creative (art supplies)
    'TRAILBOUND',        -- TrailBound Outfitters (outdoor gear)
    'TRENDFWD_ELEM',     -- Elementary version
    'PAGECRAFT_ELEM',    -- Elementary version
    'PAWPARADISE_ELEM',  -- Elementary version
    'STYLEVAULT_ELEM',   -- Elementary version
    'ARTBOX_ELEM',       -- Elementary version
    'TRAILBOUND_ELEM'    -- Elementary version
);

-- ============================================
-- Health & Wellness Companies
-- ============================================

UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'HEALTH' LIMIT 1)
WHERE code IN (
    'ACTIVELIFE',        -- Recreation centers
    'FITFUSION',         -- FitFusion Studios (fitness)
    'ACTIVELIFE_ELEM',   -- Elementary version
    'FITFUSION_ELEM'     -- Elementary version
);

-- ============================================
-- Entertainment Companies
-- ============================================

UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'ENTERTAINMENT' LIMIT 1)
WHERE code IN (
    'PIXELQUEST',        -- Gaming arcade
    'PLAYFORGE',         -- Game studio
    'QUESTGAMES',        -- Quest Games & Hobbies
    'PLAYFORGE_ELEM',    -- Elementary version
    'PIXELQUEST_ELEM',   -- Elementary version
    'QUESTGAMES_ELEM'    -- Elementary version
);

-- ============================================
-- Transportation Companies
-- ============================================

UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'TRANSPORTATION' LIMIT 1)
WHERE code IN (
    'WHEELIE',           -- Bike share service
    'WHEELIE_ELEM'       -- Elementary version
);

-- ============================================
-- Technology Companies
-- ============================================

UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'TECHNOLOGY' LIMIT 1)
WHERE code IN (
    'APPCRAFT',          -- App development
    'SKYCONNECT',        -- Telecom
    'CLOUDPEAK',         -- Cloud services
    'NEXTGEN',           -- Tech startup
    'APPCRAFT_ELEM',     -- Elementary version
    'SKYCONNECT_ELEM',   -- Elementary version
    'CLOUDPEAK_ELEM',    -- Elementary version
    'NEXTGEN_ELEM'       -- Elementary version
);

-- ============================================
-- Fashion Companies
-- ============================================

UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'FASHION' LIMIT 1)
WHERE code IN (
    'TREADSMART',        -- Shoe store
    'TREADSMART_ELEM'    -- Elementary version
);

-- ============================================
-- Education Companies
-- ============================================

UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'EDUCATION' LIMIT 1)
WHERE code IN (
    'SKILLSPROUT',       -- Learning center
    'SKILLSPROUT_ELEM'   -- Elementary version
);

-- ============================================
-- Hospitality Companies
-- ============================================

UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'HOSPITALITY' LIMIT 1)
WHERE code IN (
    'HORIZON',           -- Hotel chain
    'HORIZON_ELEM'       -- Elementary version
);

-- ============================================
-- Professional Services Companies
-- ============================================

UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'SERVICES' LIMIT 1)
WHERE code IN (
    'GREENGRID',         -- Sustainability consulting
    'GREENGRID_ELEM'     -- Elementary version
);

-- ============================================
-- Healthcare Companies
-- ============================================

UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'HEALTHCARE' LIMIT 1)
WHERE code IN (
    'MEDICORE',          -- Medical device company
    'MEDICORE_ELEM'      -- Elementary version
);

-- ============================================
-- Construction Companies
-- ============================================

UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'CONSTRUCTION' LIMIT 1)
WHERE code IN (
    'BUILDRIGHT',        -- Construction firm
    'BUILDRIGHT_ELEM'    -- Elementary version
);

-- ============================================
-- Verification
-- ============================================

DO $$
DECLARE
    total_count INTEGER;
    null_count INTEGER;
    mapped_count INTEGER;
    rec RECORD;
BEGIN
    SELECT COUNT(*) INTO total_count FROM ccm_company_rooms;
    SELECT COUNT(*) INTO null_count FROM ccm_company_rooms WHERE industry_id IS NULL;
    mapped_count := total_count - null_count;

    RAISE NOTICE '';
    RAISE NOTICE '✅ Company Industry Mapping Updated';
    RAISE NOTICE '   - Total companies: %', total_count;
    RAISE NOTICE '   - Companies with industry: %', mapped_count;
    RAISE NOTICE '   - Companies still NULL: %', null_count;
    RAISE NOTICE '';

    -- Show industry distribution
    RAISE NOTICE 'Industry Distribution:';
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

    IF null_count > 0 THEN
        RAISE NOTICE '⚠️  Companies still missing industry_id:';
        FOR rec IN
            SELECT code, name
            FROM ccm_company_rooms
            WHERE industry_id IS NULL
            ORDER BY code
        LOOP
            RAISE NOTICE '   - % (%)', rec.code, rec.name;
        END LOOP;
        RAISE NOTICE '';
        RAISE NOTICE '💡 Please manually map these companies to industries';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '🎉 All companies successfully mapped to industries!';
        RAISE NOTICE '';
    END IF;
END $$;
