-- ============================================================
-- Fix NULL skill_descriptions - Actually run the update!
-- Date: 2025-01-22
-- Issue: 4,040 records still have NULL skill_description
-- ============================================================

-- Step 1: Check current status
SELECT
    COUNT(*) as total_null_descriptions
FROM skills_master
WHERE skill_description IS NULL OR skill_description = '';

-- Step 2: Create the description generation function (if not exists)
CREATE OR REPLACE FUNCTION generate_skill_description_v2(
    p_skill_name TEXT,
    p_subject TEXT,
    p_grade TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    description TEXT;
    grade_level TEXT;
    clean_skill TEXT;
BEGIN
    -- Clean the skill name (remove dash content for description)
    IF p_skill_name LIKE '% - %' THEN
        clean_skill := SPLIT_PART(p_skill_name, ' - ', 1);
    ELSE
        clean_skill := p_skill_name;
    END IF;

    -- Make it lowercase for natural language
    clean_skill := lower(clean_skill);

    -- Determine grade level description
    IF p_grade = 'Pre-K' THEN
        grade_level := 'pre-kindergarten';
    ELSIF p_grade = 'K' THEN
        grade_level := 'kindergarten';
    ELSIF p_grade = '1' THEN
        grade_level := 'first grade';
    ELSIF p_grade = '2' THEN
        grade_level := 'second grade';
    ELSIF p_grade = '3' THEN
        grade_level := 'third grade';
    ELSIF p_grade IN ('4', '5') THEN
        grade_level := p_grade || 'th grade';
    ELSIF p_grade IN ('6', '7', '8') THEN
        grade_level := 'middle school';
    ELSIF p_grade IN ('9', '10', '11', '12') THEN
        grade_level := 'high school';
    ELSE
        grade_level := 'grade ' || p_grade;
    END IF;

    -- Generate description based on subject
    CASE p_subject
        WHEN 'Math' THEN
            description := 'Students will learn to ' || clean_skill ||
                          ' through engaging ' || grade_level || ' mathematics activities. ' ||
                          'This foundational skill helps build mathematical thinking and problem-solving abilities.';

        WHEN 'ELA', 'English' THEN
            description := 'Students will develop the ability to ' || clean_skill ||
                          ' using ' || grade_level || ' language arts strategies. ' ||
                          'This skill strengthens reading, writing, and communication skills.';

        WHEN 'Science' THEN
            description := 'Students will explore how to ' || clean_skill ||
                          ' through ' || grade_level || ' scientific investigation. ' ||
                          'This develops scientific reasoning and understanding of natural phenomena.';

        WHEN 'Social Studies' THEN
            description := 'Students will understand how to ' || clean_skill ||
                          ' while exploring ' || grade_level || ' social studies concepts. ' ||
                          'This builds knowledge of history, geography, and society.';

        WHEN 'Algebra1', 'Algebra' THEN
            description := 'Students will master how to ' || clean_skill ||
                          ' using algebraic methods and reasoning. ' ||
                          'This advanced math skill prepares students for higher-level mathematics.';

        WHEN 'Precalculus' THEN
            description := 'Students will learn to ' || clean_skill ||
                          ' using pre-calculus concepts and techniques. ' ||
                          'This prepares students for calculus and advanced mathematical analysis.';

        ELSE
            -- Generic fallback
            description := 'Students will learn to ' || clean_skill ||
                          ' in this ' || grade_level || ' ' || lower(p_subject) || ' lesson. ' ||
                          'This skill is essential for academic success and real-world application.';
    END CASE;

    RETURN description;
END;
$$;

-- Step 3: ACTUALLY UPDATE all NULL descriptions!
UPDATE skills_master
SET skill_description = generate_skill_description_v2(skill_name, subject, grade)
WHERE skill_description IS NULL OR skill_description = '';

-- Step 4: Verify the fix worked
SELECT
    'Before Fix' as status,
    4040 as count
UNION ALL
SELECT
    'After Fix - Still NULL' as status,
    COUNT(*) as count
FROM skills_master
WHERE skill_description IS NULL OR skill_description = '';

-- Step 5: Show examples of the new descriptions
SELECT
    grade,
    subject,
    skill_name,
    skill_description
FROM skills_master
WHERE skill_name IN (
    'Count to 100',
    'Identify plurals, singular possessives, and plural possessives',
    'Blend onset and rime together to make a word',
    'Three-dimensional shapes - above and below'
)
ORDER BY grade;

-- Step 6: Final statistics
SELECT
    COUNT(*) as total_skills,
    COUNT(skill_description) as has_description,
    COUNT(youtube_search_terms) as has_youtube_terms,
    COUNT(CASE WHEN skill_description IS NOT NULL AND youtube_search_terms IS NOT NULL THEN 1 END) as fully_ready
FROM skills_master;

-- Step 7: Clean up
DROP FUNCTION IF EXISTS generate_skill_description_v2(TEXT, TEXT, TEXT);