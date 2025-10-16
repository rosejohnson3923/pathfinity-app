-- ============================================
-- FIX: Company Room Industry Associations
-- ============================================
-- Run this script in Supabase SQL Editor to fix NULL industry_id references
-- in cc_company_rooms table

-- STEP 1: Diagnose the problem
-- ============================================

-- Check what industries exist
SELECT '=== AVAILABLE INDUSTRIES ===' as step;
SELECT id, code, name FROM cc_industries ORDER BY name;

-- Check company rooms and their current industry associations
SELECT '=== COMPANY ROOMS (CURRENT STATE) ===' as step;
SELECT
    cr.code,
    cr.name as company_name,
    cr.industry_id,
    i.name as industry_name,
    CASE WHEN cr.industry_id IS NULL THEN '❌ NULL' ELSE '✅ OK' END as status
FROM cc_company_rooms cr
LEFT JOIN cc_industries i ON cr.industry_id = i.id
ORDER BY cr.name;

-- Count how many have NULL industry_id
SELECT '=== PROBLEM SUMMARY ===' as step;
SELECT
    COUNT(*) as total_rooms,
    COUNT(industry_id) as rooms_with_industry,
    COUNT(*) - COUNT(industry_id) as rooms_with_null_industry
FROM cc_company_rooms;


-- STEP 2: Fix the associations
-- ============================================

-- Update MEDICORE (Healthcare/Medical)
UPDATE cc_company_rooms
SET industry_id = (
    SELECT id FROM cc_industries
    WHERE name ILIKE '%healthcare%'
       OR name ILIKE '%medical%'
       OR name ILIKE '%health%'
       OR code = 'HEALTH'
    ORDER BY name
    LIMIT 1
)
WHERE code = 'MEDICORE';

-- Update CLOUDPEAK (Technology/Software)
UPDATE cc_company_rooms
SET industry_id = (
    SELECT id FROM cc_industries
    WHERE name ILIKE '%technology%'
       OR name ILIKE '%software%'
       OR name ILIKE '%tech%'
       OR code = 'TECH'
    ORDER BY name
    LIMIT 1
)
WHERE code = 'CLOUDPEAK';

-- Update TRENDFWD (Retail/Fashion)
UPDATE cc_company_rooms
SET industry_id = (
    SELECT id FROM cc_industries
    WHERE name ILIKE '%retail%'
       OR name ILIKE '%fashion%'
       OR name ILIKE '%store%'
       OR code = 'RETAIL'
    ORDER BY name
    LIMIT 1
)
WHERE code = 'TRENDFWD';

-- Update HORIZON (Finance/Banking)
UPDATE cc_company_rooms
SET industry_id = (
    SELECT id FROM cc_industries
    WHERE name ILIKE '%finance%'
       OR name ILIKE '%banking%'
       OR name ILIKE '%bank%'
       OR code = 'FINANCE'
    ORDER BY name
    LIMIT 1
)
WHERE code = 'HORIZON';

-- Update QUICKSERVE (Food Service/Restaurant)
UPDATE cc_company_rooms
SET industry_id = (
    SELECT id FROM cc_industries
    WHERE name ILIKE '%food%'
       OR name ILIKE '%restaurant%'
       OR name ILIKE '%hospitality%'
       OR code = 'FOOD'
    ORDER BY name
    LIMIT 1
)
WHERE code = 'QUICKSERVE';

-- Update SKYCONNECT (Transportation/Airlines)
UPDATE cc_company_rooms
SET industry_id = (
    SELECT id FROM cc_industries
    WHERE name ILIKE '%transport%'
       OR name ILIKE '%airline%'
       OR name ILIKE '%aviation%'
       OR code = 'TRANSPORT'
    ORDER BY name
    LIMIT 1
)
WHERE code = 'SKYCONNECT';

-- Update GREENGRID (Energy/Utilities)
UPDATE cc_company_rooms
SET industry_id = (
    SELECT id FROM cc_industries
    WHERE name ILIKE '%energy%'
       OR name ILIKE '%utility%'
       OR name ILIKE '%utilities%'
       OR name ILIKE '%power%'
       OR code = 'ENERGY'
    ORDER BY name
    LIMIT 1
)
WHERE code = 'GREENGRID';

-- Update NEXTGEN (Telecommunications)
UPDATE cc_company_rooms
SET industry_id = (
    SELECT id FROM cc_industries
    WHERE name ILIKE '%telecom%'
       OR name ILIKE '%communication%'
       OR name ILIKE '%mobile%'
       OR code = 'TELECOM'
    ORDER BY name
    LIMIT 1
)
WHERE code = 'NEXTGEN';

-- Update PLAYFORGE (Gaming/Entertainment)
UPDATE cc_company_rooms
SET industry_id = (
    SELECT id FROM cc_industries
    WHERE name ILIKE '%entertainment%'
       OR name ILIKE '%gaming%'
       OR name ILIKE '%game%'
       OR name ILIKE '%media%'
       OR code = 'GAMING'
    ORDER BY name
    LIMIT 1
)
WHERE code = 'PLAYFORGE';

-- Update BUILDRIGHT (Construction/Real Estate)
UPDATE cc_company_rooms
SET industry_id = (
    SELECT id FROM cc_industries
    WHERE name ILIKE '%construction%'
       OR name ILIKE '%real estate%'
       OR name ILIKE '%building%'
       OR code = 'CONSTRUCT'
    ORDER BY name
    LIMIT 1
)
WHERE code = 'BUILDRIGHT';

-- FALLBACK: If any rooms still have NULL, assign the first available industry
UPDATE cc_company_rooms
SET industry_id = (SELECT id FROM cc_industries ORDER BY name LIMIT 1)
WHERE industry_id IS NULL;


-- STEP 3: Verify the fix
-- ============================================

SELECT '=== COMPANY ROOMS (AFTER FIX) ===' as step;
SELECT
    cr.code,
    cr.name as company_name,
    cr.industry_id,
    i.name as industry_name,
    i.code as industry_code,
    CASE WHEN cr.industry_id IS NULL THEN '❌ NULL' ELSE '✅ FIXED' END as status
FROM cc_company_rooms cr
LEFT JOIN cc_industries i ON cr.industry_id = i.id
ORDER BY cr.name;

-- Final verification - should show 0 NULL industries
SELECT '=== FINAL VERIFICATION ===' as step;
SELECT
    COUNT(*) as total_rooms,
    COUNT(industry_id) as rooms_with_industry,
    COUNT(*) - COUNT(industry_id) as rooms_with_null_industry,
    CASE
        WHEN COUNT(*) - COUNT(industry_id) = 0 THEN '✅ ALL ROOMS HAVE INDUSTRIES'
        ELSE '❌ STILL HAVE NULL INDUSTRIES'
    END as final_status
FROM cc_company_rooms;

-- Test the JOIN query that was failing in the code
SELECT '=== TEST JOIN QUERY (like startExecutiveDecisionSession) ===' as step;
SELECT
    cr.id,
    cr.code,
    cr.name,
    cr.industry_id,
    i.id as industries_id,
    i.name as industries_name,
    i.code as industries_code,
    CASE
        WHEN i.id IS NOT NULL THEN '✅ JOIN WORKS'
        ELSE '❌ JOIN FAILED - cc_industries is NULL'
    END as join_status
FROM cc_company_rooms cr
LEFT JOIN cc_industries i ON cr.industry_id = i.id
LIMIT 5;

SELECT '=== FIX COMPLETE ===' as step;
