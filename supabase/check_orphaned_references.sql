-- Check for orphaned skill references after skills_master rebuild

-- Check daily_assignments with invalid skill_id references
SELECT 
    'ORPHANED DAILY ASSIGNMENTS' as section,
    COUNT(*) as count
FROM daily_assignments da
LEFT JOIN skills_master sm ON da.skill_id = sm.id
WHERE da.skill_id IS NOT NULL AND sm.id IS NULL;

-- Check student_skill_progress with invalid skill_id references  
SELECT 
    'ORPHANED STUDENT SKILL PROGRESS' as section,
    COUNT(*) as count
FROM student_skill_progress ssp
LEFT JOIN skills_master sm ON ssp.skill_id = sm.id
WHERE ssp.skill_id IS NOT NULL AND sm.id IS NULL;

-- Check assessments with invalid skills_topic_id references
SELECT 
    'ORPHANED ASSESSMENTS' as section,
    COUNT(*) as count
FROM assessments a
LEFT JOIN skills_master sm ON a.skills_topic_id = sm.id
WHERE a.skills_topic_id IS NOT NULL AND sm.id IS NULL;

-- Check lesson_plans with invalid skills_topic_id references
SELECT 
    'ORPHANED LESSON PLANS' as section,
    COUNT(*) as count
FROM lesson_plans lp
LEFT JOIN skills_master sm ON lp.skills_topic_id = sm.id
WHERE lp.skills_topic_id IS NOT NULL AND sm.id IS NULL;

-- Check student_progress with invalid skills_topic_id references
SELECT 
    'ORPHANED STUDENT PROGRESS' as section,
    COUNT(*) as count
FROM student_progress sp
LEFT JOIN skills_master sm ON sp.skills_topic_id = sm.id
WHERE sp.skills_topic_id IS NOT NULL AND sm.id IS NULL;