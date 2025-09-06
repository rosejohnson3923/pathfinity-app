/*
  # Fix user_points_balance View for Single Row Queries

  1. Problem
    - The user_points_balance view returns multiple rows when queried with eq(user_id, X)
    - This causes errors when clients expect a single row

  2. Solution
    - Update the view to use COALESCE for aggregations
    - Ensure zero values instead of NULL for empty results
    - This allows the view to work correctly with single() queries
*/

-- Drop dependent view first
DROP VIEW IF EXISTS leaderboard_rankings;

-- Drop and recreate the user_points_balance view
DROP VIEW IF EXISTS user_points_balance;

CREATE OR REPLACE VIEW user_points_balance
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  tenant_id,
  COALESCE(SUM(points_amount), 0) as total_points,
  COALESCE(SUM(CASE WHEN transaction_type = 'earned' THEN points_amount ELSE 0 END), 0) as points_earned,
  COALESCE(SUM(CASE WHEN transaction_type = 'spent' THEN ABS(points_amount) ELSE 0 END), 0) as points_spent
FROM points_transactions
GROUP BY user_id, tenant_id;

-- Recreate the leaderboard_rankings view
CREATE OR REPLACE VIEW leaderboard_rankings
WITH (security_invoker = true)
AS
WITH user_stats AS (
  SELECT 
    up.id as user_id,
    up.tenant_id,
    up.full_name,
    up.avatar_url,
    up.grade_level,
    COALESCE(pb.total_points, 0) as total_points,
    COUNT(ua.id) as total_achievements,
    MAX(COALESCE(s.current_count, 0)) as longest_streak
  FROM user_profiles up
  LEFT JOIN user_points_balance pb ON up.id = pb.user_id
  LEFT JOIN user_achievements ua ON up.id = ua.user_id
  LEFT JOIN streaks s ON up.id = s.user_id AND s.is_active = true
  WHERE up.role = 'student'
  GROUP BY up.id, up.tenant_id, up.full_name, up.avatar_url, up.grade_level, pb.total_points
)
SELECT 
  *,
  ROW_NUMBER() OVER (PARTITION BY tenant_id ORDER BY total_points DESC) as points_rank,
  ROW_NUMBER() OVER (PARTITION BY tenant_id ORDER BY total_achievements DESC) as achievements_rank,
  ROW_NUMBER() OVER (PARTITION BY tenant_id ORDER BY longest_streak DESC) as streak_rank
FROM user_stats;