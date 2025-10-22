-- ================================================================
-- CHECK cb_perpetual_rooms SCHEMA
-- ================================================================

-- Check column names
SELECT
  'cb_perpetual_rooms columns:' as info,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'cb_perpetual_rooms'
ORDER BY ordinal_position;

-- Check GLOBAL01 room data
SELECT
  'GLOBAL01 room data:' as info,
  *
FROM cb_perpetual_rooms
WHERE room_code = 'GLOBAL01';
