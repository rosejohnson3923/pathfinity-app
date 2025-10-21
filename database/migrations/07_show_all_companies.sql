-- ============================================
-- Show All Companies with Current Industries
-- ============================================

SELECT
    code,
    name,
    grade_category,
    COALESCE((SELECT name FROM ccm_industries WHERE id = industry_id), 'NULL') as current_industry
FROM ccm_company_rooms
ORDER BY name;
