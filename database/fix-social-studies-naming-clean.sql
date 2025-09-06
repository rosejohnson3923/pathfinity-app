-- ================================================================
-- FIX SOCIAL STUDIES NAMING - CLEAN VERSION
-- ================================================================
-- Updates SocialStudies to "Social Studies" with proper constraint
-- ================================================================

-- Step 1: Drop the existing check constraint
ALTER TABLE skills_master 
DROP CONSTRAINT IF EXISTS skills_master_subject_check;

-- Step 2: Update all SocialStudies records to "Social Studies"
UPDATE skills_master 
SET subject = 'Social Studies' 
WHERE subject = 'SocialStudies';

-- Step 3: Add new check constraint with all existing subjects
ALTER TABLE skills_master 
ADD CONSTRAINT skills_master_subject_check 
CHECK (subject IN (
    'Math',
    'Science', 
    'ELA',
    'Social Studies',  -- Changed from SocialStudies
    'Algebra1',
    'Precalculus'
));

-- Step 4: Update generation_queue to match
UPDATE generation_queue 
SET subject = 'Social Studies' 
WHERE subject = 'SocialStudies';

-- Step 5: Update question_type_testing if it exists
UPDATE question_type_testing 
SET subject = 'Social Studies' 
WHERE subject = 'SocialStudies';

-- Step 6: Verify the updates
SELECT 
    'Updated Subject Counts' as report_type,
    subject,
    COUNT(*) as count
FROM skills_master
GROUP BY subject
ORDER BY subject;

-- Step 7: Verify Grade 10 specifically
SELECT 
    'Grade 10 Subjects' as report_type,
    subject,
    COUNT(*) as count
FROM skills_master
WHERE grade_level = '10'
GROUP BY subject
ORDER BY subject;

-- Final Summary
SELECT 
    'Update Complete!' as status,
    (SELECT COUNT(*) FROM skills_master WHERE subject = 'Social Studies') as total_social_studies_skills,
    (SELECT COUNT(*) FROM skills_master WHERE subject = 'Social Studies' AND grade_level = '10') as grade_10_social_studies_skills,
    (SELECT COUNT(*) FROM generation_queue WHERE subject = 'Social Studies' AND student_id = 'Taylor') as taylor_queue_items;