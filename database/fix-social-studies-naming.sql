-- ================================================================
-- FIX SOCIAL STUDIES NAMING
-- ================================================================
-- Updates SocialStudies to "Social Studies" (with space)
-- ================================================================

-- Step 1: Drop the existing check constraint on skills_master
ALTER TABLE skills_master 
DROP CONSTRAINT IF EXISTS skills_master_subject_check;

-- Step 2: Add a new check constraint that allows "Social Studies" with space
ALTER TABLE skills_master 
ADD CONSTRAINT skills_master_subject_check 
CHECK (subject IN ('Math', 'Science', 'ELA', 'Social Studies', 'Algebra1', 'Precalculus', 'WorldLanguages'));

-- Step 3: Update all SocialStudies records to "Social Studies"
UPDATE skills_master 
SET subject = 'Social Studies' 
WHERE subject = 'SocialStudies';

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
    'Skills Master' as table_name,
    subject,
    COUNT(*) as record_count
FROM skills_master
WHERE grade_level = '10'
GROUP BY subject
ORDER BY subject;

-- Show generation queue subjects
SELECT 
    'Generation Queue' as table_name,
    subject,
    COUNT(*) as record_count
FROM generation_queue
WHERE student_id = 'Taylor'
AND grade_level = '10'
GROUP BY subject
ORDER BY subject;

-- Summary
SELECT 
    'Update Complete!' as status,
    (SELECT COUNT(*) FROM skills_master WHERE subject = 'Social Studies') as social_studies_skills,
    (SELECT COUNT(*) FROM generation_queue WHERE subject = 'Social Studies') as social_studies_queue_items;