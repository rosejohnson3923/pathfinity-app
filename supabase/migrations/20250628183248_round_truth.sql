/*
  # Gamification and Achievement System

  1. New Tables
    - `achievements`
      - Available achievements and badges
    - `user_achievements`
      - Earned achievements by users
    - `points_transactions`
      - Point earning and spending history
    - `leaderboards`
      - Competitive rankings
    - `streaks`
      - Learning streak tracking
    - `rewards`
      - Redeemable rewards and privileges

  2. Security
    - Enable RLS on all tables
    - Add tenant isolation policies
    - Add user-specific access policies
*/

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL CHECK (category IN ('academic', 'collaboration', 'creativity', 'leadership', 'consistency', 'special')),
  rarity text DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points_value integer DEFAULT 0,
  criteria jsonb NOT NULL, -- conditions for earning the achievement
  is_active boolean DEFAULT true,
  is_repeatable boolean DEFAULT false,
  max_times_earnable integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  progress_data jsonb DEFAULT '{}', -- tracking progress toward achievement
  times_earned integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create points transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'bonus', 'penalty', 'adjustment')),
  points_amount integer NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('lesson', 'assessment', 'project', 'collaboration', 'achievement', 'streak', 'reward', 'manual')),
  source_id uuid, -- reference to the source record
  description text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  leaderboard_type text NOT NULL CHECK (leaderboard_type IN ('points', 'streaks', 'achievements', 'projects', 'collaboration')),
  scope text DEFAULT 'tenant' CHECK (scope IN ('tenant', 'grade', 'subject', 'class')),
  scope_filter jsonb DEFAULT '{}', -- additional filtering criteria
  time_period text DEFAULT 'all_time' CHECK (time_period IN ('daily', 'weekly', 'monthly', 'semester', 'all_time')),
  max_entries integer DEFAULT 100,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create streaks table
CREATE TABLE IF NOT EXISTS streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  streak_type text NOT NULL CHECK (streak_type IN ('daily_login', 'lesson_completion', 'subject_specific', 'project_activity')),
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE, -- for subject-specific streaks
  current_count integer DEFAULT 0,
  longest_count integer DEFAULT 0,
  last_activity_date date,
  streak_start_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, streak_type, subject_id)
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  reward_type text NOT NULL CHECK (reward_type IN ('privilege', 'item', 'experience', 'recognition')),
  points_cost integer NOT NULL,
  quantity_available integer, -- null for unlimited
  quantity_redeemed integer DEFAULT 0,
  is_active boolean DEFAULT true,
  valid_from date DEFAULT CURRENT_DATE,
  valid_until date,
  redemption_instructions text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user rewards redemptions table
CREATE TABLE IF NOT EXISTS user_reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  reward_id uuid REFERENCES rewards(id) ON DELETE CASCADE NOT NULL,
  points_spent integer NOT NULL,
  redeemed_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
  fulfillment_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Achievements policies
CREATE POLICY "Users can view achievements in their tenant"
  ON achievements FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage achievements in their tenant"
  ON achievements FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'product_admin')
    )
  );

-- User achievements policies
CREATE POLICY "Users can view achievements in their tenant"
  ON user_achievements FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can award achievements"
  ON user_achievements FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()));

-- Points transactions policies
CREATE POLICY "Users can view their own points transactions"
  ON points_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Educators can view points in their tenant"
  ON points_transactions FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "System can create points transactions"
  ON points_transactions FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()));

-- Leaderboards policies
CREATE POLICY "Users can view leaderboards in their tenant"
  ON leaderboards FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage leaderboards in their tenant"
  ON leaderboards FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'product_admin')
    )
  );

-- Streaks policies
CREATE POLICY "Users can view their own streaks"
  ON streaks FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can manage streaks"
  ON streaks FOR ALL TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()));

-- Rewards policies
CREATE POLICY "Users can view rewards in their tenant"
  ON rewards FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can manage rewards in their tenant"
  ON rewards FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'product_admin')
    )
  );

-- User reward redemptions policies
CREATE POLICY "Users can view their own redemptions"
  ON user_reward_redemptions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can redeem rewards"
  ON user_reward_redemptions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage redemptions in their tenant"
  ON user_reward_redemptions FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'product_admin')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_achievements_tenant_id ON achievements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON points_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_leaderboards_tenant_id ON leaderboards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_streak_type ON streaks(streak_type);
CREATE INDEX IF NOT EXISTS idx_rewards_tenant_id ON rewards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_reward_redemptions_user_id ON user_reward_redemptions(user_id);

-- Add updated_at triggers
CREATE TRIGGER update_achievements_updated_at 
  BEFORE UPDATE ON achievements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at 
  BEFORE UPDATE ON user_achievements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at 
  BEFORE UPDATE ON leaderboards 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at 
  BEFORE UPDATE ON streaks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at 
  BEFORE UPDATE ON rewards 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_reward_redemptions_updated_at 
  BEFORE UPDATE ON user_reward_redemptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for user points balance
CREATE OR REPLACE VIEW user_points_balance AS
SELECT 
  user_id,
  tenant_id,
  SUM(points_amount) as total_points,
  SUM(CASE WHEN transaction_type = 'earned' THEN points_amount ELSE 0 END) as points_earned,
  SUM(CASE WHEN transaction_type = 'spent' THEN ABS(points_amount) ELSE 0 END) as points_spent
FROM points_transactions
GROUP BY user_id, tenant_id;

-- Create view for leaderboard rankings
CREATE OR REPLACE VIEW leaderboard_rankings AS
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