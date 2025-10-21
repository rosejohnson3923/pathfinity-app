-- ============================================
-- Diagnose HORIZON and GREENGRID Current State
-- ============================================

-- Check if FINANCIAL and ENERGY industries exist
SELECT 'Industries Check:' as section;
SELECT code, name, id
FROM ccm_industries
WHERE code IN ('FINANCIAL', 'ENERGY');

-- Check current state of HORIZON companies
SELECT 'HORIZON Companies:' as section;
SELECT
    code,
    name,
    industry_id,
    (SELECT name FROM ccm_industries WHERE id = industry_id) as current_industry
FROM ccm_company_rooms
WHERE code IN ('HORIZON', 'HORIZON_ELEM');

-- Check current state of GREENGRID companies
SELECT 'GREENGRID Companies:' as section;
SELECT
    code,
    name,
    industry_id,
    (SELECT name FROM ccm_industries WHERE id = industry_id) as current_industry
FROM ccm_company_rooms
WHERE code IN ('GREENGRID', 'GREENGRID_ELEM');

-- Show all industries
SELECT 'All Industries:' as section;
SELECT code, name, display_order
FROM ccm_industries
ORDER BY display_order;
