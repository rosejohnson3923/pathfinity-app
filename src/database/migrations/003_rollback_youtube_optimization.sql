-- ============================================================
-- Rollback Script: Remove YouTube Optimization
-- Only run this if you need to undo the optimization changes
-- ============================================================

-- Drop the trigger first
DROP TRIGGER IF EXISTS trigger_optimize_skill_on_insert ON skills_master;

-- Drop the functions
DROP FUNCTION IF EXISTS optimize_skill_on_insert();
DROP FUNCTION IF EXISTS generate_search_variants(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS generate_youtube_search_term(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS extract_skill_key_terms(TEXT);

-- Drop the indexes
DROP INDEX IF EXISTS idx_youtube_search_terms;
DROP INDEX IF EXISTS idx_grade_subject;

-- Remove the columns
ALTER TABLE skills_master
DROP COLUMN IF EXISTS youtube_search_terms,
DROP COLUMN IF EXISTS simplified_terms,
DROP COLUMN IF EXISTS search_variants;

-- Verify rollback
SELECT
    column_name
FROM information_schema.columns
WHERE table_name = 'skills_master'
  AND column_name IN ('youtube_search_terms', 'simplified_terms', 'search_variants');