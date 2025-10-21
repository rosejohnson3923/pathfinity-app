-- ============================================
-- Diagnostic: List ALL Companies in Database
-- Shows code, name, current industry
-- ============================================

-- Show all companies sorted by code
SELECT
    code,
    name,
    grade_category,
    COALESCE((SELECT name FROM ccm_industries WHERE id = industry_id), 'NULL') as current_industry,
    industry_id
FROM ccm_company_rooms
ORDER BY code;

-- Count by status
SELECT
    CASE
        WHEN industry_id IS NULL THEN 'NULL'
        ELSE 'MAPPED'
    END as status,
    COUNT(*) as count
FROM ccm_company_rooms
GROUP BY
    CASE
        WHEN industry_id IS NULL THEN 'NULL'
        ELSE 'MAPPED'
    END;

-- Show distinct company codes that have NULL industry
SELECT code
FROM ccm_company_rooms
WHERE industry_id IS NULL
ORDER BY code;
