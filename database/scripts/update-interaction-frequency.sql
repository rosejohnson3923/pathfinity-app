-- ================================================
-- Update Interaction Frequency Based on Grade Categories
-- More intelligent assignment based on how often students encounter these professionals
-- ================================================

-- Show current distribution
SELECT
    '📊 BEFORE UPDATE' as status,
    cp.grade_category,
    ca.interaction_frequency,
    COUNT(*) as count
FROM career_paths cp
JOIN career_attributes ca ON cp.career_code = ca.career_code
GROUP BY cp.grade_category, ca.interaction_frequency
ORDER BY cp.grade_category, ca.interaction_frequency;

-- Update Elementary careers to HIF (High Interaction Frequency)
-- These are community helpers that children see regularly in daily life
UPDATE career_attributes ca
SET
    interaction_frequency = 'HIF',
    updated_at = CURRENT_TIMESTAMP
FROM career_paths cp
WHERE ca.career_code = cp.career_code
    AND cp.grade_category = 'elementary';

-- Update Middle School careers to MIF (Medium Interaction Frequency)
-- These are careers students know about but don't interact with daily
UPDATE career_attributes ca
SET
    interaction_frequency = 'MIF',
    updated_at = CURRENT_TIMESTAMP
FROM career_paths cp
WHERE ca.career_code = cp.career_code
    AND cp.grade_category = 'middle';

-- Update High School careers to LIF (Low Interaction Frequency)
-- These are specialized careers that students rarely encounter directly
UPDATE career_attributes ca
SET
    interaction_frequency = 'LIF',
    updated_at = CURRENT_TIMESTAMP
FROM career_paths cp
WHERE ca.career_code = cp.career_code
    AND cp.grade_category = 'high';

-- Override for specific careers that don't follow the pattern
-- Some middle/high careers might still be high frequency

-- Tech support, retail managers, bank tellers are seen frequently even though they're middle school level
UPDATE career_attributes ca
SET interaction_frequency = 'HIF'
FROM career_paths cp
WHERE ca.career_code = cp.career_code
    AND cp.career_name IN ('Bank Teller', 'Team Manager', 'Real Estate Agent')
    AND cp.grade_category = 'middle';

-- Some elementary careers might be less frequent
UPDATE career_attributes ca
SET interaction_frequency = 'MIF'
FROM career_paths cp
WHERE ca.career_code = cp.career_code
    AND cp.career_name IN ('Astronaut', 'Marine Biologist', 'Archaeologist')
    AND cp.grade_category = 'elementary';

-- Verify the update
SELECT
    '✅ AFTER UPDATE' as status,
    cp.grade_category,
    ca.interaction_frequency,
    COUNT(*) as count
FROM career_paths cp
JOIN career_attributes ca ON cp.career_code = ca.career_code
GROUP BY cp.grade_category, ca.interaction_frequency
ORDER BY cp.grade_category, ca.interaction_frequency;

-- Show some examples from each category
SELECT
    '📝 EXAMPLES' as section,
    cp.career_name,
    cp.grade_category,
    ca.interaction_frequency,
    CASE ca.interaction_frequency
        WHEN 'HIF' THEN 'Students see these professionals regularly'
        WHEN 'MIF' THEN 'Students occasionally encounter these professionals'
        WHEN 'LIF' THEN 'Students rarely interact with these professionals directly'
    END as explanation
FROM career_paths cp
JOIN career_attributes ca ON cp.career_code = ca.career_code
WHERE cp.career_name IN (
    -- Elementary examples
    'Teacher', 'Doctor', 'Firefighter',
    -- Middle examples
    'Programmer', 'Graphic Designer', 'Entrepreneur',
    -- High examples
    'AI/ML Engineer', 'Data Scientist', 'Investment Banker'
)
ORDER BY
    CASE cp.grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
    END,
    cp.career_name;

-- Summary statistics
SELECT
    '📈 FINAL SUMMARY' as report,
    COUNT(*) as total_careers,
    COUNT(CASE WHEN ca.interaction_frequency = 'HIF' THEN 1 END) as high_frequency,
    COUNT(CASE WHEN ca.interaction_frequency = 'MIF' THEN 1 END) as medium_frequency,
    COUNT(CASE WHEN ca.interaction_frequency = 'LIF' THEN 1 END) as low_frequency,
    ROUND(100.0 * COUNT(CASE WHEN ca.interaction_frequency = 'HIF' THEN 1 END) / COUNT(*), 1) as high_pct,
    ROUND(100.0 * COUNT(CASE WHEN ca.interaction_frequency = 'MIF' THEN 1 END) / COUNT(*), 1) as medium_pct,
    ROUND(100.0 * COUNT(CASE WHEN ca.interaction_frequency = 'LIF' THEN 1 END) / COUNT(*), 1) as low_pct
FROM career_attributes ca;