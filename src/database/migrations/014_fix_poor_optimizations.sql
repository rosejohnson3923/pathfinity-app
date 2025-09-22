-- ============================================================
-- Fix poor YouTube optimizations
-- Issues: missing key words, punctuation, wrong extractions
-- ============================================================

-- Step 1: Create a MUCH better optimization function
CREATE OR REPLACE FUNCTION generate_youtube_search_term_v3(
    p_skill_name TEXT,
    p_subject TEXT,
    p_grade TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    skill_lower TEXT;
    cleaned_skill TEXT;
    primary_term TEXT;
    grade_text TEXT;
    grade_num INTEGER;
    stop_words TEXT[] := ARRAY['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'as', 'is', 'was', 'are', 'were'];
BEGIN
    skill_lower := lower(p_skill_name);

    -- Remove punctuation except dashes
    cleaned_skill := REGEXP_REPLACE(skill_lower, '[?!.,;:]', '', 'g');

    -- Handle specific patterns
    IF cleaned_skill LIKE '%sight words%' THEN
        primary_term := 'sight words';
    ELSIF cleaned_skill LIKE '%blend%onset%rime%' THEN
        primary_term := 'blend onset rime';
    ELSIF cleaned_skill LIKE '%short % word%' THEN
        -- Extract the vowel sound pattern
        primary_term := REGEXP_REPLACE(cleaned_skill, '.*(short [aeiou] word).*', '\1', 'g');
    ELSIF cleaned_skill LIKE '%long % word%' THEN
        primary_term := REGEXP_REPLACE(cleaned_skill, '.*(long [aeiou] word).*', '\1', 'g');
    ELSIF cleaned_skill LIKE '%which number is%' THEN
        primary_term := 'compare numbers';
    ELSIF cleaned_skill LIKE '%beside and next to%' THEN
        primary_term := 'beside and next to';
    ELSIF cleaned_skill LIKE '%left and right%' THEN
        primary_term := 'left and right';
    ELSIF cleaned_skill LIKE '%put%sounds%order%' THEN
        primary_term := 'sound order phonics';
    ELSIF cleaned_skill LIKE '% - %' THEN
        -- Handle dash patterns (ranges and clarifications)
        DECLARE
            base_skill TEXT;
            dash_content TEXT;
        BEGIN
            base_skill := TRIM(SPLIT_PART(cleaned_skill, ' - ', 1));
            dash_content := TRIM(SPLIT_PART(cleaned_skill, ' - ', 2));

            -- Remove common prefixes
            base_skill := REGEXP_REPLACE(base_skill, '^(identify|choose|find|determine|understand|analyze|evaluate|demonstrate|explain|describe|compare|solve|apply|use|calculate|interpret|distinguish|recognize|assess|which)\s+', '', 'g');

            -- Include dash content if meaningful
            IF dash_content LIKE 'up to %' OR
               dash_content LIKE '% to %' OR
               LENGTH(dash_content) <= 20 THEN
                primary_term := base_skill || ' ' || dash_content;
            ELSE
                primary_term := base_skill;
            END IF;
        END;
    ELSE
        -- General case: remove common prefixes and extract core concept
        cleaned_skill := REGEXP_REPLACE(cleaned_skill, '^(identify|choose the|find the|determine|understand|analyze|evaluate|demonstrate|explain|describe|compare|solve|apply|use|which|put the|read)\s+', '', 'g');

        -- Remove "that matches the picture" and similar suffixes
        cleaned_skill := REGEXP_REPLACE(cleaned_skill, '\s+(that matches the picture|in order|set \d+).*$', '', 'g');

        -- Take the cleaned skill as primary term
        primary_term := cleaned_skill;
    END IF;

    -- Clean up the primary term
    primary_term := REGEXP_REPLACE(primary_term, '\s+', ' ', 'g');
    primary_term := TRIM(primary_term);

    -- Remove any remaining stop words at the beginning
    FOR i IN 1..array_length(stop_words, 1) LOOP
        IF primary_term LIKE stop_words[i] || ' %' THEN
            primary_term := SUBSTRING(primary_term FROM LENGTH(stop_words[i]) + 2);
        END IF;
    END LOOP;

    -- Ensure we have meaningful content
    IF LENGTH(primary_term) < 3 OR primary_term = ANY(stop_words) THEN
        -- Fallback to cleaned original
        primary_term := REGEXP_REPLACE(skill_lower, '[?!.,;:]', '', 'g');
    END IF;

    -- Determine grade text
    IF p_grade = 'Pre-K' OR p_grade = 'K' THEN
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

    RETURN primary_term || ' ' || p_subject || ' ' || grade_text;
END;
$$;

-- Step 2: Test on problematic examples
SELECT
    skill_name,
    youtube_search_terms as current,
    generate_youtube_search_term_v3(skill_name, subject, grade) as improved
FROM skills_master
WHERE skill_name IN (
    'Blend onset and rime together to make a word',
    'Which number is larger?',
    'Read sight words set 2: and, had, is, let, to',
    'Put the sounds in order',
    'Choose the short i word that matches the picture: lowercase',
    'Beside and next to',
    'Find the short o word',
    'Left and right'
)
ORDER BY skill_name;

-- Step 3: Update ALL skills with the improved function
UPDATE skills_master
SET youtube_search_terms = generate_youtube_search_term_v3(skill_name, subject, grade);

-- Step 4: Verify improvements on Pre-K
SELECT
    skill_name,
    youtube_search_terms
FROM skills_master
WHERE grade = 'Pre-K'
ORDER BY RANDOM()
LIMIT 20;

-- Step 5: Clean up
DROP FUNCTION IF EXISTS generate_youtube_search_term_v3(TEXT, TEXT, TEXT);