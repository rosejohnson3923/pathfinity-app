-- ================================================================
-- FIX SOCIAL STUDIES NAMING V2
-- ================================================================
-- First check what subjects exist, then update constraint
-- ================================================================

-- Step 1: First, let's see ALL unique subjects in the table
SELECT DISTINCT subject, COUNT(*) as count
FROM skills_master
GROUP BY subject
ORDER BY subject;

-- Step 2: Drop the existing check constraint
ALTER TABLE skills_master 
DROP CONSTRAINT IF EXISTS skills_master_subject_check;

-- Step 3: Update all SocialStudies records to "Social Studies" FIRST
UPDATE skills_master 
SET subject = 'Social Studies' 
WHERE subject = 'SocialStudies';

-- Step 4: Now add a new check constraint that includes all necessary subjects
-- Including all subjects that exist in the table
ALTER TABLE skills_master 
ADD CONSTRAINT skills_master_subject_check 
CHECK (subject IN (
    'Math', 
    'Science', 
    'ELA', 
    'Social Studies',
    'Algebra1', 
    'Precalculus', 
    'WorldLanguages',
    'Algebra',
    'Geometry',
    'English',
    'History',
    'Biology',
    'Chemistry',
    'Physics',
    'Spanish',
    'French',
    'Computer Science'
));

-- Step 5: Update generation_queue to match
UPDATE generation_queue 
SET subject = 'Social Studies' 
WHERE subject = 'SocialStudies';

-- Step 6: Update question_type_testing if it exists
UPDATE question_type_testing 
SET subject = 'Social Studies' 
WHERE subject = 'SocialStudies';

-- Step 7: Verify the updates
SELECT 
    'After Update - Skills Master' as report,
    subject,
    COUNT(*) as record_count
FROM skills_master
WHERE grade_level = '10'
GROUP BY subject
ORDER BY subject;

-- Summary
SELECT 
    'Update Complete!' as status,
    (SELECT COUNT(*) FROM skills_master WHERE subject = 'Social Studies') as social_studies_skills,
    (SELECT COUNT(DISTINCT subject) FROM skills_master) as total_unique_subjects;