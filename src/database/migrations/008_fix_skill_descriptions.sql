-- ============================================================
-- Fix Missing skill_description Fields
-- Date: 2025-01-22
-- Issue: 4,040 records have NULL/blank skill_description
-- Solution: Generate meaningful descriptions from skill_name
-- ============================================================

-- Step 1: Create function to generate descriptions from skill names
CREATE OR REPLACE FUNCTION generate_skill_description(
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
BEGIN
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
        grade_level := 'elementary';
    ELSIF p_grade IN ('6', '7', '8') THEN
        grade_level := 'middle school';
    ELSE
        grade_level := 'high school';
    END IF;

    -- Generate description based on subject and skill
    CASE p_subject
        WHEN 'Math' THEN
            description := 'Develop ' || grade_level || ' mathematics skills to ' || lower(p_skill_name) ||
                          '. This skill builds mathematical reasoning and problem-solving abilities.';

        WHEN 'ELA', 'English' THEN
            description := 'Master ' || grade_level || ' language arts concepts to ' || lower(p_skill_name) ||
                          '. This skill enhances reading comprehension, writing, and communication.';

        WHEN 'Science' THEN
            description := 'Explore ' || grade_level || ' science concepts to ' || lower(p_skill_name) ||
                          '. This skill develops scientific thinking and understanding of the natural world.';

        WHEN 'Social Studies' THEN
            description := 'Learn ' || grade_level || ' social studies to ' || lower(p_skill_name) ||
                          '. This skill builds understanding of history, geography, and society.';

        WHEN 'Algebra1', 'Algebra' THEN
            description := 'Master algebraic concepts to ' || lower(p_skill_name) ||
                          '. This skill develops advanced mathematical reasoning and equation-solving abilities.';

        WHEN 'Precalculus' THEN
            description := 'Advance pre-calculus skills to ' || lower(p_skill_name) ||
                          '. This skill prepares students for calculus and higher mathematics.';

        ELSE
            -- Generic fallback
            description := 'Learn ' || grade_level || ' ' || lower(p_subject) || ' skills to ' || lower(p_skill_name) ||
                          '. This skill is essential for academic success.';
    END CASE;

    RETURN description;
END;
$$;

-- Step 2: Update all NULL or empty skill_description fields
UPDATE skills_master
SET skill_description = generate_skill_description(skill_name, subject, grade)
WHERE skill_description IS NULL
   OR skill_description = '';

-- Step 3: Verify the fix
SELECT
    grade,
    subject,
    COUNT(*) as total_skills,
    COUNT(CASE WHEN skill_description IS NOT NULL AND skill_description != '' THEN 1 END) as has_description,
    COUNT(CASE WHEN skill_description IS NULL OR skill_description = '' THEN 1 END) as missing_description
FROM skills_master
GROUP BY grade, subject
ORDER BY
    CASE
        WHEN grade = 'Pre-K' THEN -1
        WHEN grade = 'K' THEN 0
        ELSE grade::INTEGER
    END, subject;

-- Step 4: Show examples of the new descriptions
SELECT
    grade,
    subject,
    skill_name,
    skill_description
FROM skills_master
WHERE skill_name IN (
    'Count to 100',
    'Determine the main idea of a passage',
    'Identify and correct errors with plural and possessive nouns',
    'Solve quadratic equations'
)
ORDER BY
    CASE
        WHEN grade = 'Pre-K' THEN -1
        WHEN grade = 'K' THEN 0
        ELSE grade::INTEGER
    END;

-- Step 5: Drop the function (cleanup)
DROP FUNCTION IF EXISTS generate_skill_description(TEXT, TEXT, TEXT);