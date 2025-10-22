-- ================================================================
-- CLEAN UP DUPLICATE SPECTATORS IN cb_spectators
-- Keep only one record per (perpetual_room_id, user_id)
-- ================================================================

-- Check for duplicates BEFORE cleanup
SELECT
  'Duplicates BEFORE cleanup:' as status,
  perpetual_room_id,
  user_id,
  COUNT(*) as duplicate_count
FROM cb_spectators
GROUP BY perpetual_room_id, user_id
HAVING COUNT(*) > 1;

-- Delete duplicates, keeping the most recent record
WITH ranked_spectators AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY perpetual_room_id, user_id
      ORDER BY started_spectating_at DESC NULLS LAST
    ) as row_num
  FROM cb_spectators
)
DELETE FROM cb_spectators
WHERE id IN (
  SELECT id
  FROM ranked_spectators
  WHERE row_num > 1
);

-- Verify cleanup
SELECT
  'Duplicates AFTER cleanup:' as status,
  perpetual_room_id,
  user_id,
  COUNT(*) as duplicate_count
FROM cb_spectators
GROUP BY perpetual_room_id, user_id
HAVING COUNT(*) > 1;

-- Show remaining spectators
SELECT
  'Remaining spectators:' as status,
  COUNT(*) as total_count
FROM cb_spectators;

-- Verify UNIQUE constraint exists
SELECT
  'UNIQUE constraint status:' as status,
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'cb_spectators'::regclass
  AND contype = 'u';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Duplicate spectators cleaned up - only one record per room+user remains';
END $$;
