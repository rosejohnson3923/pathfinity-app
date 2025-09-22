-- ============================================================
-- Migration: Add YouTube Search Optimization to skills_master (FIXED)
-- Date: 2025-01-22
-- Description: Adds columns and functions to optimize skill names for YouTube searching
-- Fixed: Proper handling of 'K' grade without integer casting
-- ============================================================

-- Step 1: Add new columns to skills_master table
ALTER TABLE skills_master
ADD COLUMN IF NOT EXISTS youtube_search_terms TEXT,
ADD COLUMN IF NOT EXISTS simplified_terms TEXT[],
ADD COLUMN IF NOT EXISTS search_variants TEXT[];

-- Add comment to columns for documentation
COMMENT ON COLUMN skills_master.youtube_search_terms IS 'Optimized search query for YouTube API';
COMMENT ON COLUMN skills_master.simplified_terms IS 'Key terms extracted from skill_name';
COMMENT ON COLUMN skills_master.search_variants IS 'Alternative search queries for better results';

-- Step 2: Create function to extract key terms from skill names
CREATE OR REPLACE FUNCTION extract_skill_key_terms(skill_name TEXT)
RETURNS TEXT[]
LANGUAGE plpgsql
AS $$
DECLARE
    simplified TEXT;
    key_terms TEXT[];
BEGIN
    -- Remove common educational prefixes
    simplified := REGEXP_REPLACE(skill_name, '(?i)^(determine|identify|understand|analyze|evaluate|demonstrate|explain|describe|compare and contrast|solve|apply|use)\s+', '', 'g');

    -- Remove common suffixes
    simplified := REGEXP_REPLACE(simplified, '(?i)\s+(in a passage|in context|with accuracy|correctly)$', '', 'g');

    -- Extract specific academic terms if present
    key_terms := ARRAY[]::TEXT[];

    -- Math terms
    IF simplified ~* 'addition' THEN key_terms := array_append(key_terms, 'addition'); END IF;
    IF simplified ~* 'subtraction' THEN key_terms := array_append(key_terms, 'subtraction'); END IF;
    IF simplified ~* 'multiplication' THEN key_terms := array_append(key_terms, 'multiplication'); END IF;
    IF simplified ~* 'division' THEN key_terms := array_append(key_terms, 'division'); END IF;
    IF simplified ~* 'fraction' THEN key_terms := array_append(key_terms, 'fractions'); END IF;
    IF simplified ~* 'decimal' THEN key_terms := array_append(key_terms, 'decimals'); END IF;
    IF simplified ~* 'percent' THEN key_terms := array_append(key_terms, 'percentages'); END IF;
    IF simplified ~* 'integer' THEN key_terms := array_append(key_terms, 'integers'); END IF;
    IF simplified ~* 'equation' THEN key_terms := array_append(key_terms, 'equations'); END IF;
    IF simplified ~* 'graph' THEN key_terms := array_append(key_terms, 'graphs'); END IF;
    IF simplified ~* 'counting' OR simplified ~* 'count' THEN key_terms := array_append(key_terms, 'counting'); END IF;
    IF simplified ~* 'number' THEN key_terms := array_append(key_terms, 'numbers'); END IF;
    IF simplified ~* 'shape' THEN key_terms := array_append(key_terms, 'shapes'); END IF;

    -- ELA terms
    IF simplified ~* 'main idea' THEN key_terms := array_append(key_terms, 'main idea'); END IF;
    IF simplified ~* 'theme' THEN key_terms := array_append(key_terms, 'theme'); END IF;
    IF simplified ~* 'character' THEN key_terms := array_append(key_terms, 'character'); END IF;
    IF simplified ~* 'plot' THEN key_terms := array_append(key_terms, 'plot'); END IF;
    IF simplified ~* 'vocabulary' THEN key_terms := array_append(key_terms, 'vocabulary'); END IF;
    IF simplified ~* 'grammar' THEN key_terms := array_append(key_terms, 'grammar'); END IF;
    IF simplified ~* 'comprehension' THEN key_terms := array_append(key_terms, 'comprehension'); END IF;
    IF simplified ~* 'context clue' THEN key_terms := array_append(key_terms, 'context clues'); END IF;
    IF simplified ~* 'letter' THEN key_terms := array_append(key_terms, 'letters'); END IF;
    IF simplified ~* 'sound' THEN key_terms := array_append(key_terms, 'sounds'); END IF;
    IF simplified ~* 'phonics' THEN key_terms := array_append(key_terms, 'phonics'); END IF;

    -- Science terms
    IF simplified ~* 'cell' THEN key_terms := array_append(key_terms, 'cells'); END IF;
    IF simplified ~* 'atom' THEN key_terms := array_append(key_terms, 'atoms'); END IF;
    IF simplified ~* 'energy' THEN key_terms := array_append(key_terms, 'energy'); END IF;
    IF simplified ~* 'force' THEN key_terms := array_append(key_terms, 'forces'); END IF;
    IF simplified ~* 'ecosystem' THEN key_terms := array_append(key_terms, 'ecosystems'); END IF;
    IF simplified ~* 'photosynthesis' THEN key_terms := array_append(key_terms, 'photosynthesis'); END IF;
    IF simplified ~* 'animal' THEN key_terms := array_append(key_terms, 'animals'); END IF;
    IF simplified ~* 'plant' THEN key_terms := array_append(key_terms, 'plants'); END IF;
    IF simplified ~* 'weather' THEN key_terms := array_append(key_terms, 'weather'); END IF;

    -- If no specific terms found, use the simplified version
    IF array_length(key_terms, 1) IS NULL THEN
        key_terms := string_to_array(lower(simplified), ' ');
        -- Keep only meaningful words (length > 2)
        key_terms := ARRAY(
            SELECT word FROM unnest(key_terms) AS word
            WHERE length(word) > 2
        );
    END IF;

    RETURN key_terms;
END;
$$;

-- Step 3: Create function to generate grade-appropriate search terms
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
    age_group TEXT;
    primary_term TEXT;
BEGIN
    -- Get key terms
    key_terms := extract_skill_key_terms(p_skill_name);

    -- Determine grade-appropriate language
    -- Handle 'K' and 'Pre-K' specially
    IF p_grade = 'K' OR p_grade = 'Pre-K' THEN
        grade_text := 'kindergarten';
        age_group := 'for kids';
    ELSE
        -- For numeric grades, convert to integer
        BEGIN
            grade_num := p_grade::INTEGER;

            IF grade_num <= 2 THEN
                IF grade_num = 1 THEN
                    grade_text := '1st grade';
                ELSIF grade_num = 2 THEN
                    grade_text := '2nd grade';
                END IF;
                age_group := 'for kids';
            ELSIF grade_num = 3 THEN
                grade_text := '3rd grade';
                age_group := 'for kids';
            ELSIF grade_num <= 5 THEN
                grade_text := grade_num || 'th grade';
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
                -- If conversion fails, use the grade as-is
                grade_text := p_grade || ' grade';
                age_group := 'educational';
        END;
    END IF;

    -- Get primary term
    IF array_length(key_terms, 1) > 0 THEN
        primary_term := key_terms[1];
    ELSE
        primary_term := lower(p_skill_name);
    END IF;

    -- Generate optimized search term
    RETURN primary_term || ' ' || p_subject || ' ' || grade_text;
END;
$$;

-- Step 4: Create function to generate search variants
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
BEGIN
    key_terms := extract_skill_key_terms(p_skill_name);
    variants := ARRAY[]::TEXT[];

    -- Determine grade grouping
    -- Handle 'K' and 'Pre-K' specially
    IF p_grade = 'K' OR p_grade = 'Pre-K' THEN
        grade_text := 'kindergarten';
        age_group := 'for kids';
    ELSE
        -- For numeric grades, convert to integer
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
                -- If conversion fails, use the grade as-is
                grade_text := p_grade || ' grade';
                age_group := 'educational';
        END;
    END IF;

    -- Generate variants
    IF array_length(key_terms, 1) > 0 THEN
        -- Variant 1: Key term with grade
        variants := array_append(variants, key_terms[1] || ' ' || grade_text || ' lesson');

        -- Variant 2: Subject focused
        variants := array_append(variants, p_subject || ' ' || key_terms[1] || ' ' || age_group);

        -- Variant 3: Tutorial style
        variants := array_append(variants, 'how to ' || key_terms[1] || ' ' || grade_text);

        -- Variant 4: Educational query based on age group
        IF age_group = 'for kids' THEN
            variants := array_append(variants, key_terms[1] || ' for kids educational');
        ELSIF age_group = 'middle school' THEN
            variants := array_append(variants, key_terms[1] || ' middle school ' || p_subject);
        ELSIF age_group = 'high school' THEN
            variants := array_append(variants, key_terms[1] || ' high school ' || p_subject);
        ELSE
            variants := array_append(variants, key_terms[1] || ' ' || p_subject || ' lesson');
        END IF;
    ELSE
        -- Fallback variants
        variants := array_append(variants, lower(p_skill_name) || ' ' || grade_text);
        variants := array_append(variants, p_subject || ' ' || lower(p_skill_name) || ' lesson');
    END IF;

    RETURN variants;
END;
$$;

-- Step 5: Update existing records for grades K, 1, 7, and 10
UPDATE skills_master
SET
    youtube_search_terms = generate_youtube_search_term(skill_name, subject, grade),
    simplified_terms = extract_skill_key_terms(skill_name),
    search_variants = generate_search_variants(skill_name, subject, grade)
WHERE grade IN ('K', '1', '7', '10')
  AND youtube_search_terms IS NULL;

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_youtube_search_terms ON skills_master(youtube_search_terms);
CREATE INDEX IF NOT EXISTS idx_grade_subject ON skills_master(grade, subject);

-- Step 7: Create a trigger to automatically optimize new skills
CREATE OR REPLACE FUNCTION optimize_skill_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Automatically generate optimized search terms for new skills
    NEW.youtube_search_terms := generate_youtube_search_term(NEW.skill_name, NEW.subject, NEW.grade);
    NEW.simplified_terms := extract_skill_key_terms(NEW.skill_name);
    NEW.search_variants := generate_search_variants(NEW.skill_name, NEW.subject, NEW.grade);
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_optimize_skill_on_insert
    BEFORE INSERT ON skills_master
    FOR EACH ROW
    EXECUTE FUNCTION optimize_skill_on_insert();

-- Step 8: Verify the update worked
-- This query will show you examples of the optimization
SELECT
    grade,
    subject,
    skill_name,
    youtube_search_terms,
    simplified_terms,
    search_variants[1] as first_variant
FROM skills_master
WHERE grade IN ('K', '1', '7', '10')
ORDER BY grade, subject
LIMIT 20;

-- Show statistics
SELECT
    grade,
    COUNT(*) as total_skills,
    COUNT(youtube_search_terms) as optimized_skills
FROM skills_master
WHERE grade IN ('K', '1', '7', '10')
GROUP BY grade
ORDER BY
    CASE
        WHEN grade = 'K' THEN 0
        ELSE grade::INTEGER
    END;