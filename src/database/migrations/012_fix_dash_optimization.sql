-- ============================================================
-- Fix YouTube optimization for skills with dashes
-- Preserve important context after the dash
-- ============================================================

-- Step 1: Create improved function that handles dashes better
CREATE OR REPLACE FUNCTION generate_youtube_search_term_v2(
    p_skill_name TEXT,
    p_subject TEXT,
    p_grade TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    key_terms TEXT[];
    grade_text TEXT;
    grade_num INTEGER;
    primary_term TEXT;
    skill_lower TEXT;
    base_skill TEXT;
    dash_content TEXT;
BEGIN
    skill_lower := lower(p_skill_name);

    -- Check if skill has a dash with meaningful content
    IF skill_lower LIKE '% - %' THEN
        base_skill := TRIM(SPLIT_PART(skill_lower, ' - ', 1));
        dash_content := TRIM(SPLIT_PART(skill_lower, ' - ', 2));

        -- Remove common prefixes from base skill
        base_skill := REGEXP_REPLACE(base_skill, '(?i)^(identify|determine|understand|analyze|evaluate|demonstrate|explain|describe|compare|solve|apply|use|find|calculate|interpret|distinguish|recognize|assess)\s+', '', 'g');

        -- Combine base skill with dash content for specific patterns
        IF dash_content LIKE 'up to %' OR dash_content LIKE '% to %' THEN
            -- For number ranges, include the range
            primary_term := base_skill || ' ' || dash_content;
        ELSIF dash_content IN ('above and below', 'beside and next to', 'left and right', 'same and different') THEN
            -- For spatial/comparison concepts, include them
            primary_term := base_skill || ' ' || dash_content;
        ELSIF LENGTH(dash_content) < 20 THEN
            -- For short clarifications, include them
            primary_term := base_skill || ' ' || dash_content;
        ELSE
            -- For long content, just use base skill
            primary_term := base_skill;
        END IF;
    ELSE
        -- No dash, use existing extraction logic
        key_terms := extract_skill_key_terms(p_skill_name);
        IF array_length(key_terms, 1) > 0 THEN
            primary_term := key_terms[1];
        ELSE
            primary_term := lower(p_skill_name);
        END IF;
    END IF;

    -- Clean up the primary term
    primary_term := REGEXP_REPLACE(primary_term, '\s+', ' ', 'g');
    primary_term := TRIM(primary_term);

    -- Ensure we don't have just stop words
    IF primary_term IN ('and', 'or', 'the', 'a', 'an', 'with', 'for', 'to') THEN
        primary_term := lower(p_skill_name);
    END IF;

    -- Determine grade-appropriate language
    IF p_grade = 'K' OR p_grade = 'Pre-K' THEN
        grade_text := 'kindergarten';
    ELSE
        BEGIN
            grade_num := p_grade::INTEGER;
            IF grade_num = 1 THEN
                grade_text := '1st grade';
            ELSIF grade_num = 2 THEN
                grade_text := '2nd grade';
            ELSIF grade_num = 3 THEN
                grade_text := '3rd grade';
            ELSE
                grade_text := grade_num || 'th grade';
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                grade_text := p_grade || ' grade';
        END;
    END IF;

    -- Generate optimized search term
    RETURN primary_term || ' ' || p_subject || ' ' || grade_text;
END;
$$;

-- Step 2: Test the improvement on problematic examples
SELECT
    skill_name,
    youtube_search_terms as old_optimization,
    generate_youtube_search_term_v2(skill_name, subject, grade) as new_optimization
FROM skills_master
WHERE skill_name IN (
    'Three-dimensional shapes - above and below',
    'Three-dimensional shapes - beside and next to',
    'Count pictures - up to 5',
    'Identify and correct errors with plural and possessive nouns'
)
ORDER BY skill_name;

-- Step 3: Update all skills with the improved optimization
UPDATE skills_master
SET youtube_search_terms = generate_youtube_search_term_v2(skill_name, subject, grade);

-- Step 4: Verify the improvements
SELECT
    skill_name,
    youtube_search_terms
FROM skills_master
WHERE skill_name LIKE '% - %'
ORDER BY
    CASE
        WHEN grade = 'Pre-K' THEN -1
        WHEN grade = 'K' THEN 0
        ELSE grade::INTEGER
    END
LIMIT 20;

-- Step 5: Clean up
DROP FUNCTION IF EXISTS generate_youtube_search_term_v2(TEXT, TEXT, TEXT);