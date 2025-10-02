-- ================================================
-- Intelligent Interaction Frequency Assignment
-- Based on how often students actually encounter these professionals
-- ================================================

-- Start with the base rule: Elementary = HIF, Middle = MIF, High = LIF
UPDATE career_attributes ca
SET
    interaction_frequency = CASE
        WHEN cp.grade_category = 'elementary' THEN 'HIF'::frequency_indicator
        WHEN cp.grade_category = 'middle' THEN 'MIF'::frequency_indicator
        WHEN cp.grade_category = 'high' THEN 'LIF'::frequency_indicator
    END,
    updated_at = CURRENT_TIMESTAMP
FROM career_paths cp
WHERE ca.career_code = cp.career_code;

-- Now apply intelligent overrides based on actual career characteristics

-- HIGH FREQUENCY OVERRIDES (professionals students see regularly)
UPDATE career_attributes ca
SET interaction_frequency = 'HIF'
FROM career_paths cp
WHERE ca.career_code = cp.career_code
    AND (
        -- Education professionals (seen daily at school)
        cp.career_name ILIKE '%teacher%'
        OR cp.career_name ILIKE '%principal%'
        OR cp.career_name ILIKE '%coach%'
        OR cp.career_name ILIKE '%librarian%'

        -- Healthcare (regular checkups)
        OR cp.career_name ILIKE '%doctor%'
        OR cp.career_name ILIKE '%dentist%'
        OR cp.career_name ILIKE '%nurse%'

        -- Daily services
        OR cp.career_name IN ('Bus Driver', 'Mail Carrier', 'Cashier', 'Store Manager')

        -- Public safety (visible in community)
        OR cp.career_name ILIKE '%police%'
        OR cp.career_name ILIKE '%firefighter%'

        -- Food service (restaurants, cafeterias)
        OR cp.career_name ILIKE '%chef%'
        OR cp.career_name ILIKE '%baker%'

        -- Retail/Banking (regular family visits)
        OR cp.career_name IN ('Bank Teller', 'Real Estate Agent')
    );

-- MEDIUM FREQUENCY OVERRIDES (occasional encounters)
UPDATE career_attributes ca
SET interaction_frequency = 'MIF'
FROM career_paths cp
WHERE ca.career_code = cp.career_code
    AND (
        -- Professional services (occasional family use)
        cp.career_name ILIKE '%lawyer%'
        OR cp.career_name ILIKE '%accountant%'
        OR cp.career_name ILIKE '%veterinarian%'
        OR cp.career_name ILIKE '%mechanic%'
        OR cp.career_name ILIKE '%plumber%'
        OR cp.career_name ILIKE '%electrician%'

        -- Creative professionals (events, media)
        OR cp.career_name ILIKE '%photographer%'
        OR cp.career_name ILIKE '%musician%'
        OR cp.career_name ILIKE '%artist%'
        OR cp.career_name ILIKE '%designer%'

        -- Technology (behind the scenes but products used daily)
        OR cp.career_name IN ('Web Designer', 'App Developer', 'YouTuber/Content Creator')
    );

-- LOW FREQUENCY OVERRIDES (rarely encountered directly)
UPDATE career_attributes ca
SET interaction_frequency = 'LIF'
FROM career_paths cp
WHERE ca.career_code = cp.career_code
    AND (
        -- Highly specialized/behind-the-scenes
        cp.career_name ILIKE '%scientist%'
        OR cp.career_name ILIKE '%researcher%'
        OR cp.career_name ILIKE '%engineer%'
        OR cp.career_name ILIKE '%analyst%'
        OR cp.career_name ILIKE '%developer%'

        -- Rare professions
        OR cp.career_name ILIKE '%astronaut%'
        OR cp.career_name ILIKE '%archaeologist%'
        OR cp.career_name ILIKE '%marine biologist%'

        -- High-level business
        OR cp.career_name ILIKE '%ceo%'
        OR cp.career_name ILIKE '%investment%'
        OR cp.career_name ILIKE '%venture%'
        OR cp.career_name ILIKE '%hedge%'

        -- Specialized tech
        OR cp.career_name ILIKE '%blockchain%'
        OR cp.career_name ILIKE '%quantum%'
        OR cp.career_name ILIKE '%ai%'
        OR cp.career_name ILIKE '%machine learning%'
    );

-- Detailed breakdown by category
SELECT
    '📊 FREQUENCY DISTRIBUTION BY GRADE' as report,
    cp.grade_category,
    ca.interaction_frequency,
    COUNT(*) as count,
    STRING_AGG(cp.career_name, ', ' ORDER BY cp.career_name) as careers
FROM career_paths cp
JOIN career_attributes ca ON cp.career_code = ca.career_code
GROUP BY cp.grade_category, ca.interaction_frequency
ORDER BY
    CASE cp.grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
    END,
    ca.interaction_frequency;

-- Summary
SELECT
    '📈 SUMMARY' as report,
    'Total' as category,
    COUNT(*) as careers,
    ROUND(100.0 * COUNT(CASE WHEN interaction_frequency = 'HIF' THEN 1 END) / COUNT(*), 1) || '% HIF' as high_freq,
    ROUND(100.0 * COUNT(CASE WHEN interaction_frequency = 'MIF' THEN 1 END) / COUNT(*), 1) || '% MIF' as med_freq,
    ROUND(100.0 * COUNT(CASE WHEN interaction_frequency = 'LIF' THEN 1 END) / COUNT(*), 1) || '% LIF' as low_freq
FROM career_attributes

UNION ALL

SELECT
    '',
    cp.grade_category,
    COUNT(*),
    ROUND(100.0 * COUNT(CASE WHEN ca.interaction_frequency = 'HIF' THEN 1 END) / COUNT(*), 1) || '%',
    ROUND(100.0 * COUNT(CASE WHEN ca.interaction_frequency = 'MIF' THEN 1 END) / COUNT(*), 1) || '%',
    ROUND(100.0 * COUNT(CASE WHEN ca.interaction_frequency = 'LIF' THEN 1 END) / COUNT(*), 1) || '%'
FROM career_paths cp
JOIN career_attributes ca ON cp.career_code = ca.career_code
GROUP BY cp.grade_category
ORDER BY category DESC;