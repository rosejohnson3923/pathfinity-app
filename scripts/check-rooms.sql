-- Check all perpetual rooms
SELECT
  room_code,
  room_name,
  status,
  is_featured,
  feature_order,
  created_at
FROM ccm_perpetual_rooms
ORDER BY feature_order, created_at;
