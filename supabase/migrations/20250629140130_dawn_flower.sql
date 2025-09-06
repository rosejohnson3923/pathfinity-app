/*
  # Fix View Security Issue

  1. Problem
    - Views are defined with SECURITY DEFINER which bypasses RLS
    - This can lead to unauthorized data access

  2. Solution
    - Drop existing views
    - Recreate with SECURITY INVOKER to respect RLS policies
    - Ensure proper tenant isolation is maintained

  3. Views Updated
    - user_points_balance
    - leaderboard_rankings
*/

-- Drop dependent view first
DROP VIEW IF EXISTS leaderboard_rankings;

-- Drop the problematic view
DROP VIEW IF EXISTS user_points_balance;

-- Recreate user_points_balance view with SECURITY INVOKER
CREATE OR REPLACE VIEW user_points_balance
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  tenant_id,
  SUM(points_amount) as total_points,
  SUM(CASE WHEN transaction_type = 'earned' THEN points_amount ELSE 0 END) as points_earned,
  SUM(CASE WHEN transaction_type = 'spent' THEN ABS(points_amount) ELSE 0 END) as points_spent
FROM points_transactions
GROUP BY user_id, tenant_id;

-- Recreate leaderboard_rankings view with SECURITY INVOKER
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
    MAX(s.current_count) as longest_streak
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