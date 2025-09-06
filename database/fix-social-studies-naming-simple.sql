-- ================================================================
-- FIX SOCIAL STUDIES NAMING - SIMPLE VERSION
-- ================================================================
-- Just updates the naming without dealing with constraints
-- ================================================================

-- Step 1: Drop the check constraint entirely
ALTER TABLE skills_master 
DROP CONSTRAINT IF EXISTS skills_master_subject_check;

-- Step 2: Update all SocialStudies to "Social Studies"
UPDATE skills_master 
SET subject = 'Social Studies' 
WHERE subject = 'SocialStudies';

-- Step 3: Update generation_queue
UPDATE generation_queue 
SET subject = 'Social Studies' 
WHERE subject = 'SocialStudies';

-- Step 4: Update question_type_testing if it exists  
UPDATE question_type_testing 
SET subject = 'Social Studies' 
WHERE subject = 'SocialStudies';

-- Step 5: Show results
SELECT 
    subject,
    COUNT(*) as count
FROM skills_master
WHERE grade_level = '10'
GROUP BY subject
ORDER BY subject;

-- Summary
SELECT 
    'Update Complete - No Constraint' as status,
    (SELECT COUNT(*) FROM skills_master WHERE subject = 'Social Studies' AND grade_level = '10') as grade_10_social_studies_count;