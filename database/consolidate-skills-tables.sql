-- ================================================================
-- CONSOLIDATE SKILLS TABLES MIGRATION
-- ================================================================
-- This script consolidates skills_master_v2 into skills_master
-- and renames the grade column to grade_level for consistency
-- 
-- IMPORTANT: Run this script in order, section by section
-- ================================================================

-- SECTION 1: BACKUP AND VERIFY CURRENT STATE
-- ================================================================

-- 1.1 Check current state of both tables
SELECT 
    'BEFORE MIGRATION' as status,
    'skills_master' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN grade = '10' AND subject = 'Algebra1' THEN 1 END) as algebra1_grade10,
    COUNT(CASE WHEN grade = 'K' THEN 1 END) as grade_k,
    COUNT(DISTINCT grade) as unique_grades
FROM skills_master
UNION ALL
SELECT 
    'BEFORE MIGRATION' as status,
    'skills_master_v2' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN grade_level = '10' THEN 1 END) as grade10_records,
    0 as grade_k,
    COUNT(DISTINCT grade_level) as unique_grades
FROM skills_master_v2;

-- 1.2 Show what will be deleted (Grade 10 Algebra1 from skills_master)
SELECT 
    subject,
    grade,
    COUNT(*) as records_to_delete,
    STRING_AGG(DISTINCT skills_area, ', ' ORDER BY skills_area) as areas_affected
FROM skills_master 
WHERE grade = '10' AND subject = 'Algebra1'
GROUP BY subject, grade;

-- SECTION 2: DELETE DUPLICATE ALGEBRA1 RECORDS
-- ================================================================

-- 2.1 Delete Grade 10 Algebra1 records from skills_master
-- These will be replaced with the more complete data from skills_master_v2
DELETE FROM skills_master 
WHERE grade = '10' AND subject = 'Algebra1';

-- 2.2 Verify deletion
SELECT 
    'AFTER DELETION' as status,
    COUNT(*) as remaining_records,
    COUNT(CASE WHEN grade = '10' THEN 1 END) as remaining_grade10,
    STRING_AGG(DISTINCT subject, ', ' ORDER BY subject) as grade10_subjects
FROM skills_master
WHERE grade = '10';

-- SECTION 3: RENAME COLUMN FROM grade TO grade_level
-- ================================================================

-- 3.1 Add new grade_level column if it doesn't exist
ALTER TABLE skills_master 
ADD COLUMN IF NOT EXISTS grade_level VARCHAR(10);

-- 3.2 Copy data from grade to grade_level
UPDATE skills_master 
SET grade_level = grade
WHERE grade_level IS NULL;

-- 3.3 Verify the column has been populated
SELECT 
    COUNT(*) as total_records,
    COUNT(grade) as has_grade,
    COUNT(grade_level) as has_grade_level,
    COUNT(DISTINCT grade_level) as unique_grade_levels,
    STRING_AGG(DISTINCT grade_level, ', ' ORDER BY grade_level) as grade_levels
FROM skills_master;

-- 3.4 Drop the old grade column (OPTIONAL - uncomment if you want to remove it)
-- ALTER TABLE skills_master DROP COLUMN grade;

-- SECTION 4: MIGRATE DATA FROM skills_master_v2
-- ================================================================

-- 4.1 Insert all records from skills_master_v2 into skills_master
-- Note: Skip Precalculus since it already exists, insert everything else
INSERT INTO skills_master (
    id,
    subject,
    grade,           -- Still required as NOT NULL
    grade_level,     -- New column we're using
    skills_area,
    skills_cluster,
    skill_number,
    skill_name,
    skill_description,
    difficulty_level,
    estimated_time_minutes,
    prerequisites,
    created_at,
    updated_at
)
SELECT 
    id,              -- Both tables use UUID id
    CASE 
        WHEN subject = 'Algebra 1' THEN 'Algebra1'
        WHEN subject = 'Social Studies' THEN 'SocialStudies'
        ELSE subject
    END as subject,  -- Map to constraint-compliant names
    grade_level,     -- Populate grade with same value
    grade_level,     -- Direct mapping
    skills_area,
    skills_cluster,
    skill_number,
    skill_name,
    skill_description,
    difficulty_level,
    estimated_time_minutes,
    NULL::uuid[] as prerequisites,   -- Type mismatch: skills_master wants uuid[], v2 has text[]
    created_at,
    updated_at
FROM skills_master_v2
WHERE subject != 'Precalculus'  -- Skip Precalculus as it already exists
ON CONFLICT (id) DO UPDATE SET
    subject = EXCLUDED.subject,
    grade = EXCLUDED.grade,
    grade_level = EXCLUDED.grade_level,
    skills_area = EXCLUDED.skills_area,
    skills_cluster = EXCLUDED.skills_cluster,
    skill_number = EXCLUDED.skill_number,
    skill_name = EXCLUDED.skill_name,
    skill_description = EXCLUDED.skill_description,
    difficulty_level = EXCLUDED.difficulty_level,
    estimated_time_minutes = EXCLUDED.estimated_time_minutes,
    updated_at = NOW();

-- 4.2 Verify migration results
SELECT 
    'AFTER MIGRATION' as status,
    COUNT(*) as total_records,
    COUNT(DISTINCT grade_level) as unique_grades,
    STRING_AGG(DISTINCT grade_level, ', ' ORDER BY grade_level) as grade_levels
FROM skills_master;

-- SECTION 5: DETAILED VERIFICATION
-- ================================================================

-- 5.1 Check records by grade_level for demo users
SELECT 
    grade_level,
    COUNT(*) as skill_count,
    COUNT(DISTINCT subject) as subject_count,
    STRING_AGG(DISTINCT subject, ', ' ORDER BY subject) as subjects
FROM skills_master
WHERE grade_level IN ('K', '2', '4', '6', '8', '10', '12')
GROUP BY grade_level
ORDER BY 
    CASE grade_level
        WHEN 'K' THEN 0
        ELSE CAST(grade_level AS INTEGER)
    END;

-- 5.2 Verify Grade 10 has all expected subjects
SELECT 
    subject,
    COUNT(*) as skill_count,
    COUNT(DISTINCT skills_area) as area_count,
    MIN(skill_number) as first_skill,
    MAX(skill_number) as last_skill
FROM skills_master
WHERE grade_level = '10'
GROUP BY subject
ORDER BY subject;

-- 5.3 Final summary
SELECT 
    'MIGRATION COMPLETE' as message,
    (SELECT COUNT(*) FROM skills_master) as skills_master_total,
    (SELECT COUNT(*) FROM skills_master WHERE grade_level = 'K') as grade_k_count,
    (SELECT COUNT(*) FROM skills_master WHERE grade_level = '10') as grade_10_count,
    (SELECT COUNT(DISTINCT subject) FROM skills_master WHERE grade_level = '10') as grade_10_subjects,
    CASE 
        WHEN (SELECT COUNT(*) FROM skills_master WHERE grade_level = '10') > 1600
        THEN '✅ Migration successful!'
        ELSE '⚠️ Please check migration - Grade 10 count seems low'
    END as status;

-- SECTION 6: UPDATE CONTENT GENERATION TABLES
-- ================================================================

-- 6.1 Update cache_warming_config to reference skills_master
UPDATE cache_warming_config
SET updated_at = NOW()
WHERE grade_level = '10';

-- Note: The actual table reference will need to be updated in the application code
-- since the table name is likely hardcoded in the generation functions

-- 6.2 Clear existing generation queue to start fresh
DELETE FROM generation_queue 
WHERE student_id = 'Taylor' AND grade_level = '10';

-- 6.3 Update any stored procedures or functions that reference skills_master_v2
-- (This will need to be done based on what functions exist in your database)

-- IMPORTANT NOTES:
-- ================
-- 1. skills_master_v2 is LEFT INTACT for backup purposes
-- 2. The 'grade' column in skills_master is kept but can be dropped later
-- 3. All code should now reference skills_master with grade_level column
-- 4. Content Generation Queue functions need to be updated to use skills_master