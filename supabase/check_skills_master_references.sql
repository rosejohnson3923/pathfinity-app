-- Check for actual references to skills_master (not skills_topics)

-- Check daily_assignments that reference skills_master.id
SELECT 
    'DAILY ASSIGNMENTS REFERENCING SKILLS_MASTER' as section,
    COUNT(*) as total_records,
    COUNT(CASE WHEN skill_id IS NOT NULL THEN 1 END) as with_skill_id,
    COUNT(CASE WHEN skill_id IS NOT NULL AND sm.id IS NULL THEN 1 END) as orphaned
FROM daily_assignments da
LEFT JOIN skills_master sm ON da.skill_id = sm.id;

-- Check student_skill_progress that reference skills_master.id
SELECT 
    'STUDENT SKILL PROGRESS REFERENCING SKILLS_MASTER' as section,
    COUNT(*) as total_records,
    COUNT(CASE WHEN skill_id IS NOT NULL THEN 1 END) as with_skill_id,
    COUNT(CASE WHEN skill_id IS NOT NULL AND sm.id IS NULL THEN 1 END) as orphaned
FROM student_skill_progress ssp
LEFT JOIN skills_master sm ON ssp.skill_id = sm.id;

-- Check projects with skills arrays (these might contain skills_master IDs)
SELECT 
    'PROJECTS WITH SKILLS ARRAYS' as section,
    COUNT(*) as total_projects,
    COUNT(CASE WHEN skills_required IS NOT NULL AND array_length(skills_required, 1) > 0 THEN 1 END) as with_skills_required,
    COUNT(CASE WHEN skills_gained IS NOT NULL AND array_length(skills_gained, 1) > 0 THEN 1 END) as with_skills_gained
FROM projects;