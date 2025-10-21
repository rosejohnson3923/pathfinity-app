-- ============================================
-- Step 2: Update ccm_company_rooms with correct industry_id
-- Maps companies to their industries in ccm_industries table
-- ============================================

-- PREREQUISITE: Run 01_create_ccm_industries_table.sql first

-- ============================================
-- 1. Drop old foreign key constraint
-- ============================================

ALTER TABLE ccm_company_rooms
DROP CONSTRAINT IF EXISTS ccm_company_rooms_industry_id_fkey;

-- ============================================
-- 2. Set all industry_id to NULL temporarily
-- ============================================

UPDATE ccm_company_rooms
SET industry_id = NULL;

-- ============================================
-- 3. Update with correct industry_id from ccm_industries
-- ============================================

-- Update Food & Beverage companies
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'FOOD' LIMIT 1)
WHERE code IN (
    'BEANBUZZ',      -- Coffee shop chain
    'QUICKSERVE'     -- Fast food chain
);

-- Update Retail companies
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'RETAIL' LIMIT 1)
WHERE code IN (
    'PAGECRAFT',     -- Bookstore chain
    'PAWPARADISE',   -- Pet supply stores
    'STYLEVAULT',    -- Fashion retail
    'TRENDFWD'       -- Fashion retail
);

-- Update Health & Wellness companies
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'HEALTH' LIMIT 1)
WHERE code IN (
    'ACTIVELIFE'     -- Recreation centers
);

-- Update Entertainment companies
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'ENTERTAINMENT' LIMIT 1)
WHERE code IN (
    'PIXELQUEST',    -- Gaming arcade
    'PLAYFORGE'      -- Game studio
);

-- Update Transportation companies
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'TRANSPORTATION' LIMIT 1)
WHERE code IN (
    'WHEELIE'        -- Bike share service
);

-- Update Technology companies
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'TECHNOLOGY' LIMIT 1)
WHERE code IN (
    'APPCRAFT',      -- App development
    'SKYCONNECT',    -- Telecom
    'CLOUDPEAK',     -- Cloud services
    'NEXTGEN'        -- Tech startup
);

-- Update Fashion companies
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'FASHION' LIMIT 1)
WHERE code IN (
    'TREADSMART'     -- Shoe store
);

-- Update Education companies
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'EDUCATION' LIMIT 1)
WHERE code IN (
    'SKILLSPROUT'    -- Learning center
);

-- Update Hospitality companies
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'HOSPITALITY' LIMIT 1)
WHERE code IN (
    'HORIZON'        -- Hotel chain
);

-- Update Professional Services companies
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'SERVICES' LIMIT 1)
WHERE code IN (
    'GREENGRID'      -- Sustainability consulting
);

-- Update Healthcare companies (medical services)
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'HEALTHCARE' LIMIT 1)
WHERE code IN (
    'MEDICORE'       -- Medical device company
);

-- Update Construction companies
UPDATE ccm_company_rooms
SET industry_id = (SELECT id FROM ccm_industries WHERE code = 'CONSTRUCTION' LIMIT 1)
WHERE code IN (
    'BUILDRIGHT'     -- Construction firm
);

-- ============================================
-- 4. Handle Elementary Versions
-- ============================================

-- Update elementary versions to match their parent company's industry
UPDATE ccm_company_rooms elem
SET industry_id = parent.industry_id
FROM ccm_company_rooms parent
WHERE elem.code LIKE '%_ELEM'
AND parent.code = REPLACE(elem.code, '_ELEM', '')
AND parent.industry_id IS NOT NULL;

-- ============================================
-- 5. Add new foreign key constraint
-- ============================================

ALTER TABLE ccm_company_rooms
ADD CONSTRAINT ccm_company_rooms_industry_id_fkey
FOREIGN KEY (industry_id) REFERENCES ccm_industries(id);

-- Add comment
COMMENT ON COLUMN ccm_company_rooms.industry_id IS
'Foreign key to ccm_industries (NOT cc_industries). CCM has its own industry classifications separate from Career Challenge.';

-- ============================================
-- Verification
-- ============================================

DO $$
DECLARE
    total_count INTEGER;
    null_count INTEGER;
    mapped_count INTEGER;
    industry_breakdown TEXT;
    rec RECORD;
BEGIN
    SELECT COUNT(*) INTO total_count FROM ccm_company_rooms;
    SELECT COUNT(*) INTO null_count FROM ccm_company_rooms WHERE industry_id IS NULL;
    mapped_count := total_count - null_count;

    -- Get industry breakdown (using CTE to avoid nested aggregate functions)
    SELECT string_agg(
        format('   - %s: %s companies', name, company_count),
        E'\n'
        ORDER BY display_order
    )
    INTO industry_breakdown
    FROM (
        SELECT
            i.name,
            i.display_order,
            COUNT(c.id) as company_count
        FROM ccm_industries i
        LEFT JOIN ccm_company_rooms c ON c.industry_id = i.id
        GROUP BY i.name, i.display_order
    ) industry_counts;

    RAISE NOTICE '';
    RAISE NOTICE '✅ CCM Company Industry Mapping Complete';
    RAISE NOTICE '   - Total companies: %', total_count;
    RAISE NOTICE '   - Companies with industry: %', mapped_count;
    RAISE NOTICE '   - Companies still NULL: %', null_count;
    RAISE NOTICE '';

    IF industry_breakdown IS NOT NULL THEN
        RAISE NOTICE 'Industry Distribution:';
        RAISE NOTICE '%', industry_breakdown;
        RAISE NOTICE '';
    END IF;

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
        RAISE NOTICE '💡 Add missing company mappings in the UPDATE statements above';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '🎉 All companies successfully mapped to industries!';
        RAISE NOTICE '';
    END IF;
END $$;
