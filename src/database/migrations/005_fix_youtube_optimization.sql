-- ============================================================
-- Fix YouTube Optimization Functions
-- Date: 2025-01-22
-- Issue: Functions are extracting "and" as primary term instead of meaningful content
-- ============================================================

-- Step 1: Drop the broken functions
DROP FUNCTION IF EXISTS extract_skill_key_terms(TEXT);
DROP FUNCTION IF EXISTS generate_youtube_search_term(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS generate_search_variants(TEXT, TEXT, TEXT);

-- Step 2: Create IMPROVED function to extract key terms from skill names
CREATE OR REPLACE FUNCTION extract_skill_key_terms(skill_name TEXT)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
    simplified TEXT;
    key_terms TEXT[];
    words TEXT[];
    stop_words TEXT[] := ARRAY['and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for',
                               'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were',
                               'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did',
                               'will', 'would', 'could', 'should', 'may', 'might', 'can'];
BEGIN
    -- Remove common educational prefixes
    simplified := REGEXP_REPLACE(skill_name, '(?i)^(identify|determine|understand|analyze|evaluate|demonstrate|explain|describe|compare|solve|apply|use|find|calculate|interpret|distinguish|recognize|assess)\s+', '', 'g');

    -- Handle "identify and correct" pattern specially
    IF skill_name ~* 'identify and correct' THEN
        simplified := REGEXP_REPLACE(simplified, '(?i)^and correct\s+', '', 'g');
    END IF;

    -- Remove common suffixes
    simplified := REGEXP_REPLACE(simplified, '(?i)\s+(in a passage|in context|with accuracy|correctly|properly|effectively)$', '', 'g');

    -- Extract specific academic terms if present
    key_terms := ARRAY[]::TEXT[];

    -- Grammar terms (high priority)
    IF simplified ~* 'plural' AND simplified ~* 'possessive' AND simplified ~* 'noun' THEN
        key_terms := array_append(key_terms, 'plural possessive nouns');
    ELSIF simplified ~* 'possessive noun' THEN
        key_terms := array_append(key_terms, 'possessive nouns');
    ELSIF simplified ~* 'plural noun' THEN
        key_terms := array_append(key_terms, 'plural nouns');
    ELSIF simplified ~* 'noun' THEN
        key_terms := array_append(key_terms, 'nouns');
    END IF;

    -- Math terms
    IF simplified ~* 'addition' THEN key_terms := array_append(key_terms, 'addition'); END IF;
    IF simplified ~* 'subtraction' THEN key_terms := array_append(key_terms, 'subtraction'); END IF;
    IF simplified ~* 'multiplication' THEN key_terms := array_append(key_terms, 'multiplication'); END IF;
    IF simplified ~* 'division' THEN key_terms := array_append(key_terms, 'division'); END IF;
    IF simplified ~* 'fraction' THEN key_terms := array_append(key_terms, 'fractions'); END IF;
    IF simplified ~* 'decimal' THEN key_terms := array_append(key_terms, 'decimals'); END IF;
    IF simplified ~* 'percent' THEN key_terms := array_append(key_terms, 'percentages'); END IF;
    IF simplified ~* 'equation' THEN key_terms := array_append(key_terms, 'equations'); END IF;
    IF simplified ~* 'graph' THEN key_terms := array_append(key_terms, 'graphs'); END IF;
    IF simplified ~* 'counting' OR simplified ~* 'count' THEN key_terms := array_append(key_terms, 'counting'); END IF;

    -- ELA terms
    IF simplified ~* 'main idea' THEN key_terms := array_append(key_terms, 'main idea'); END IF;
    IF simplified ~* 'theme' THEN key_terms := array_append(key_terms, 'theme'); END IF;
    IF simplified ~* 'character' THEN key_terms := array_append(key_terms, 'characters'); END IF;
    IF simplified ~* 'plot' THEN key_terms := array_append(key_terms, 'plot'); END IF;
    IF simplified ~* 'vocabulary' THEN key_terms := array_append(key_terms, 'vocabulary'); END IF;
    IF simplified ~* 'grammar' THEN key_terms := array_append(key_terms, 'grammar'); END IF;
    IF simplified ~* 'comprehension' THEN key_terms := array_append(key_terms, 'reading comprehension'); END IF;
    IF simplified ~* 'context clue' THEN key_terms := array_append(key_terms, 'context clues'); END IF;
    IF simplified ~* 'verb' THEN key_terms := array_append(key_terms, 'verbs'); END IF;
    IF simplified ~* 'adjective' THEN key_terms := array_append(key_terms, 'adjectives'); END IF;
    IF simplified ~* 'adverb' THEN key_terms := array_append(key_terms, 'adverbs'); END IF;
    IF simplified ~* 'pronoun' THEN key_terms := array_append(key_terms, 'pronouns'); END IF;
    IF simplified ~* 'preposition' THEN key_terms := array_append(key_terms, 'prepositions'); END IF;

    -- Science terms
    IF simplified ~* 'photosynthesis' THEN key_terms := array_append(key_terms, 'photosynthesis'); END IF;
    IF simplified ~* 'ecosystem' THEN key_terms := array_append(key_terms, 'ecosystems'); END IF;
    IF simplified ~* 'energy' THEN key_terms := array_append(key_terms, 'energy'); END IF;
    IF simplified ~* 'force' THEN key_terms := array_append(key_terms, 'forces'); END IF;
    IF simplified ~* 'motion' THEN key_terms := array_append(key_terms, 'motion'); END IF;
    IF simplified ~* 'matter' THEN key_terms := array_append(key_terms, 'matter'); END IF;
    IF simplified ~* 'cell' THEN key_terms := array_append(key_terms, 'cells'); END IF;
    IF simplified ~* 'weather' THEN key_terms := array_append(key_terms, 'weather'); END IF;
    IF simplified ~* 'planet' THEN key_terms := array_append(key_terms, 'planets'); END IF;
    IF simplified ~* 'animal' THEN key_terms := array_append(key_terms, 'animals'); END IF;
    IF simplified ~* 'plant' THEN key_terms := array_append(key_terms, 'plants'); END IF;

    -- If no specific terms found, extract meaningful words
    IF array_length(key_terms, 1) IS NULL THEN
        words := string_to_array(lower(simplified), ' ');

        -- Filter out stop words and short words
        key_terms := ARRAY(
            SELECT word FROM unnest(words) AS word
            WHERE length(word) > 2
            AND NOT (word = ANY(stop_words))
            ORDER BY length(word) DESC
            LIMIT 3
        );
    END IF;

    -- If still empty, use the original simplified version
    IF array_length(key_terms, 1) IS NULL THEN
        key_terms := ARRAY[lower(simplified)];
    END IF;

    RETURN key_terms;
END;
$$;

-- Step 3: Create IMPROVED function to generate grade-appropriate search terms
CREATE OR REPLACE FUNCTION generate_youtube_search_term(
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
BEGIN
    -- Get key terms
    key_terms := extract_skill_key_terms(p_skill_name);
    skill_lower := lower(p_skill_name);

    -- Special handling for specific patterns
    IF skill_lower LIKE '%plural%possessive%noun%' THEN
        primary_term := 'plural possessive nouns';
    ELSIF skill_lower LIKE '%possessive%noun%' THEN
        primary_term := 'possessive nouns';
    ELSIF skill_lower LIKE '%plural%noun%' THEN
        primary_term := 'plural nouns';
    ELSIF array_length(key_terms, 1) > 0 THEN
        primary_term := key_terms[1];
    ELSE
        -- Fallback: extract the core concept
        primary_term := REGEXP_REPLACE(p_skill_name, '(?i)^(identify and correct errors with|identify|determine|understand|analyze|evaluate|demonstrate|explain|describe)\s+', '', 'g');
        primary_term := lower(primary_term);
    END IF;

    -- Ensure we don't have just "and" or other stop words
    IF primary_term IN ('and', 'or', 'the', 'a', 'an', 'with', 'for', 'to') THEN
        -- Extract the actual content after these words
        IF skill_lower LIKE '%errors with%' THEN
            primary_term := REGEXP_REPLACE(skill_lower, '.*errors with\s+', '', 'g');
        ELSE
            primary_term := REGEXP_REPLACE(skill_lower, '(?i)^(identify and correct|identify|determine)\s+', '', 'g');
        END IF;
    END IF;

    -- Clean up the primary term
    primary_term := REGEXP_REPLACE(primary_term, '\s+', ' ', 'g');
    primary_term := TRIM(primary_term);

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

-- Step 4: Create IMPROVED function to generate search variants
CREATE OR REPLACE FUNCTION generate_search_variants(
    p_skill_name TEXT,
    p_subject TEXT,
    p_grade TEXT
)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
    key_terms TEXT[];
    variants TEXT[];
    grade_text TEXT;
    grade_num INTEGER;
    age_group TEXT;
    primary_term TEXT;
BEGIN
    key_terms := extract_skill_key_terms(p_skill_name);
    variants := ARRAY[]::TEXT[];

    -- Get the primary term (same logic as above)
    IF array_length(key_terms, 1) > 0 THEN
        primary_term := key_terms[1];
    ELSE
        primary_term := lower(p_skill_name);
    END IF;

    -- Determine grade grouping
    IF p_grade = 'K' OR p_grade = 'Pre-K' THEN
        grade_text := 'kindergarten';
        age_group := 'for kids';
    ELSE
        BEGIN
            grade_num := p_grade::INTEGER;
            IF grade_num <= 5 THEN
                IF grade_num = 1 THEN
                    grade_text := '1st grade';
                ELSIF grade_num = 2 THEN
                    grade_text := '2nd grade';
                ELSIF grade_num = 3 THEN
                    grade_text := '3rd grade';
                ELSE
                    grade_text := grade_num || 'th grade';
                END IF;
                age_group := 'for kids';
            ELSIF grade_num <= 8 THEN
                grade_text := grade_num || 'th grade';
                age_group := 'middle school';
            ELSE
                grade_text := grade_num || 'th grade';
                age_group := 'high school';
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                grade_text := p_grade || ' grade';
                age_group := 'educational';
        END;
    END IF;

    -- Generate meaningful variants
    variants := array_append(variants, primary_term || ' ' || grade_text || ' lesson');
    variants := array_append(variants, p_subject || ' ' || primary_term || ' ' || age_group);
    variants := array_append(variants, 'how to ' || primary_term || ' ' || grade_text);
    variants := array_append(variants, primary_term || ' ' || age_group || ' ' || p_subject);

    RETURN variants;
END;
$$;

-- Step 5: Test the fix with the problematic example
SELECT
    skill_name,
    generate_youtube_search_term(skill_name, subject, grade) as new_search_term,
    extract_skill_key_terms(skill_name) as new_key_terms
FROM skills_master
WHERE skill_name = 'Identify and correct errors with plural and possessive nouns'
LIMIT 1;

-- Step 6: Re-optimize ALL records with the fixed functions
UPDATE skills_master
SET
    youtube_search_terms = generate_youtube_search_term(skill_name, subject, grade),
    simplified_terms = extract_skill_key_terms(skill_name),
    search_variants = generate_search_variants(skill_name, subject, grade);

-- Step 7: Verify the fix worked
SELECT
    grade,
    subject,
    skill_name,
    youtube_search_terms,
    simplified_terms
FROM skills_master
WHERE skill_name LIKE '%plural%possessive%'
   OR skill_name LIKE 'Identify and correct%'
ORDER BY grade, subject
LIMIT 10;