-- ================================================================
-- PathIQ Profiles Persistence Migration
-- Persistent storage for PathIQ gamification system
-- ================================================================

-- ================================================================
-- 1. PATHIQ PROFILES TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS pathiq_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  tenant_id VARCHAR(255) NOT NULL,

  -- XP & Leveling
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  level INTEGER DEFAULT 1 CHECK (level >= 1),
  next_level_xp INTEGER DEFAULT 100 CHECK (next_level_xp > 0),
  lifetime_xp INTEGER DEFAULT 0 CHECK (lifetime_xp >= 0),

  -- Daily Progress
  daily_xp_earned INTEGER DEFAULT 0,
  last_xp_date DATE DEFAULT CURRENT_DATE,

  -- Streak Tracking
  streak_days INTEGER DEFAULT 0 CHECK (streak_days >= 0),
  best_streak INTEGER DEFAULT 0 CHECK (best_streak >= 0),
  last_active_date DATE DEFAULT CURRENT_DATE,

  -- Achievements
  achievements JSONB DEFAULT '[]',
  -- Example structure:
  -- [{
  --   "id": "first-steps",
  --   "unlockedAt": "2025-10-09T19:30:00Z",
  --   "xpAwarded": 25
  -- }]

  -- Hint System
  hints_used_today INTEGER DEFAULT 0,
  free_hints_remaining INTEGER DEFAULT 10 CHECK (free_hints_remaining >= 0),
  hints_used_lifetime INTEGER DEFAULT 0,

  -- PathIQ Ranking
  pathiq_rank INTEGER,
  pathiq_tier VARCHAR(50) DEFAULT 'Bronze',
  -- Tiers: Bronze, Silver, Gold, Platinum, Diamond, PathIQ Master

  -- Grade & Context
  grade_level VARCHAR(10),
  career VARCHAR(100),
  companion VARCHAR(100),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_daily_xp CHECK (daily_xp_earned >= 0),
  CONSTRAINT valid_tier CHECK (pathiq_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'PathIQ Master'))
);

-- ================================================================
-- 2. XP TRANSACTIONS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,

  -- Transaction Details
  amount INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'spent')),
  reason TEXT NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('learning', 'hint', 'achievement', 'streak', 'bonus')),

  -- Context
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  session_id VARCHAR(255),
  container VARCHAR(20),
  subject VARCHAR(50),
  skill_id VARCHAR(100),

  -- PathIQ Validation
  pathiq_verified BOOLEAN DEFAULT true,
  multiplier DECIMAL(3,2) DEFAULT 1.0,

  -- Metadata
  timestamp TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_amount CHECK (
    (type = 'earned' AND amount > 0) OR
    (type = 'spent' AND amount < 0)
  )
);

-- ================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ================================================================

-- PathIQ Profiles indexes
CREATE INDEX IF NOT EXISTS idx_pathiq_profiles_user
  ON pathiq_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_pathiq_profiles_tenant
  ON pathiq_profiles(tenant_id);

CREATE INDEX IF NOT EXISTS idx_pathiq_profiles_xp
  ON pathiq_profiles(xp DESC, level DESC);

CREATE INDEX IF NOT EXISTS idx_pathiq_profiles_rank
  ON pathiq_profiles(pathiq_rank)
  WHERE pathiq_rank IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_pathiq_profiles_streak
  ON pathiq_profiles(streak_days DESC)
  WHERE streak_days > 0;

CREATE INDEX IF NOT EXISTS idx_pathiq_profiles_grade
  ON pathiq_profiles(grade_level, career);

-- XP Transactions indexes
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user
  ON xp_transactions(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_tenant
  ON xp_transactions(tenant_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_session
  ON xp_transactions(session_id)
  WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_xp_transactions_category
  ON xp_transactions(category, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_type
  ON xp_transactions(type, timestamp DESC);

-- ================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ================================================================

-- PathIQ Profiles RLS
ALTER TABLE pathiq_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pathiq profile"
  ON pathiq_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own pathiq profile"
  ON pathiq_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pathiq profile"
  ON pathiq_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- XP Transactions RLS
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own xp transactions"
  ON xp_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own xp transactions"
  ON xp_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Transactions are immutable (no updates or deletes)
-- Only insert policy, no update/delete policies

-- ================================================================
-- 5. TRIGGERS
-- ================================================================

-- Update updated_at timestamp
CREATE TRIGGER update_pathiq_profiles_updated_at
  BEFORE UPDATE ON pathiq_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Reset daily XP at midnight
CREATE OR REPLACE FUNCTION reset_daily_xp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_xp_date < CURRENT_DATE THEN
    NEW.daily_xp_earned = 0;
    NEW.last_xp_date = CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reset_daily_xp_trigger
  BEFORE UPDATE ON pathiq_profiles
  FOR EACH ROW
  EXECUTE FUNCTION reset_daily_xp();

-- Calculate streak on profile update
CREATE OR REPLACE FUNCTION calculate_streak()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if last active was yesterday
  IF NEW.last_active_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Increment streak
    NEW.streak_days = OLD.streak_days + 1;
    NEW.best_streak = GREATEST(OLD.best_streak, NEW.streak_days);
  ELSIF NEW.last_active_date < CURRENT_DATE - INTERVAL '1 day' THEN
    -- Streak broken
    NEW.streak_days = 1;
  END IF;

  NEW.last_active_date = CURRENT_DATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_streak_trigger
  BEFORE UPDATE ON pathiq_profiles
  FOR EACH ROW
  WHEN (OLD.last_active_date < CURRENT_DATE)
  EXECUTE FUNCTION calculate_streak();

-- ================================================================
-- 6. HELPER FUNCTIONS
-- ================================================================

-- Award XP to user
CREATE OR REPLACE FUNCTION award_xp(
  p_user_id UUID,
  p_tenant_id VARCHAR(255),
  p_amount INTEGER,
  p_reason TEXT,
  p_category VARCHAR(20),
  p_session_id VARCHAR(255) DEFAULT NULL,
  p_container VARCHAR(20) DEFAULT NULL,
  p_subject VARCHAR(50) DEFAULT NULL,
  p_skill_id VARCHAR(100) DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_profile pathiq_profiles%ROWTYPE;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_level_ups INTEGER := 0;
  v_transaction_id UUID;
BEGIN
  -- Get current profile
  SELECT * INTO v_profile
  FROM pathiq_profiles
  WHERE user_id = p_user_id;

  -- Create profile if doesn't exist
  IF NOT FOUND THEN
    INSERT INTO pathiq_profiles (user_id, tenant_id, xp, level, next_level_xp, lifetime_xp)
    VALUES (p_user_id, p_tenant_id, 0, 1, 100, 0)
    RETURNING * INTO v_profile;
  END IF;

  -- Calculate new XP
  v_new_xp := v_profile.xp + p_amount;
  v_new_level := v_profile.level;

  -- Check for level ups
  WHILE v_new_xp >= v_profile.next_level_xp LOOP
    v_new_xp := v_new_xp - v_profile.next_level_xp;
    v_new_level := v_new_level + 1;
    v_level_ups := v_level_ups + 1;
    v_profile.next_level_xp := 100 + (v_new_level * 50) + FLOOR(POW(v_new_level, 1.5));
  END LOOP;

  -- Update profile
  UPDATE pathiq_profiles
  SET
    xp = v_new_xp,
    level = v_new_level,
    next_level_xp = v_profile.next_level_xp,
    lifetime_xp = lifetime_xp + p_amount,
    daily_xp_earned = daily_xp_earned + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING xp INTO v_new_xp;

  -- Record transaction
  INSERT INTO xp_transactions (
    user_id, tenant_id, amount, type, reason, category,
    balance_after, session_id, container, subject, skill_id
  )
  VALUES (
    p_user_id, p_tenant_id, p_amount, 'earned', p_reason, p_category,
    v_new_xp + (v_new_level * 100), p_session_id, p_container, p_subject, p_skill_id
  )
  RETURNING id INTO v_transaction_id;

  -- Return result
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'amount_awarded', p_amount,
    'new_xp', v_new_xp,
    'new_level', v_new_level,
    'level_ups', v_level_ups
  );
END;
$$ LANGUAGE plpgsql;

-- Spend XP (for hints)
CREATE OR REPLACE FUNCTION spend_xp(
  p_user_id UUID,
  p_tenant_id VARCHAR(255),
  p_amount INTEGER,
  p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_current_xp INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Get current XP
  SELECT xp INTO v_current_xp
  FROM pathiq_profiles
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profile not found');
  END IF;

  -- Check if user has enough XP
  IF v_current_xp < ABS(p_amount) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient XP');
  END IF;

  -- Deduct XP
  UPDATE pathiq_profiles
  SET xp = xp + p_amount, -- p_amount should be negative
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING xp INTO v_current_xp;

  -- Record transaction
  INSERT INTO xp_transactions (
    user_id, tenant_id, amount, type, reason, category, balance_after
  )
  VALUES (
    p_user_id, p_tenant_id, p_amount, 'spent', p_reason, 'hint', v_current_xp
  )
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'amount_spent', ABS(p_amount),
    'remaining_xp', v_current_xp
  );
END;
$$ LANGUAGE plpgsql;

-- Get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(
  p_tenant_id VARCHAR(255),
  p_grade_level VARCHAR(10) DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  xp INTEGER,
  level INTEGER,
  streak_days INTEGER,
  career VARCHAR(100),
  companion VARCHAR(100)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY pp.xp DESC, pp.level DESC) AS rank,
    pp.user_id,
    pp.xp,
    pp.level,
    pp.streak_days,
    pp.career,
    pp.companion
  FROM pathiq_profiles pp
  WHERE pp.tenant_id = p_tenant_id
    AND (p_grade_level IS NULL OR pp.grade_level = p_grade_level)
  ORDER BY pp.xp DESC, pp.level DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 7. ANALYTICS VIEWS
-- ================================================================

CREATE OR REPLACE VIEW pathiq_leaderboard_view AS
SELECT
  pp.tenant_id,
  pp.grade_level,
  pp.user_id,
  pp.xp,
  pp.level,
  pp.streak_days,
  pp.lifetime_xp,
  pp.achievements,
  pp.career,
  pp.companion,
  pp.pathiq_tier,
  ROW_NUMBER() OVER (
    PARTITION BY pp.tenant_id, pp.grade_level
    ORDER BY pp.xp DESC, pp.level DESC
  ) AS rank_in_grade,
  ROW_NUMBER() OVER (
    PARTITION BY pp.tenant_id
    ORDER BY pp.xp DESC, pp.level DESC
  ) AS rank_in_tenant
FROM pathiq_profiles pp;

CREATE OR REPLACE VIEW xp_analytics_view AS
SELECT
  xt.tenant_id,
  xt.category,
  xt.type,
  DATE_TRUNC('day', xt.timestamp) AS date,
  COUNT(*) AS transaction_count,
  SUM(ABS(xt.amount)) AS total_xp,
  AVG(ABS(xt.amount)) AS avg_xp_per_transaction,
  COUNT(DISTINCT xt.user_id) AS unique_users
FROM xp_transactions xt
GROUP BY xt.tenant_id, xt.category, xt.type, DATE_TRUNC('day', xt.timestamp);

-- ================================================================
-- 8. COMMENTS
-- ================================================================

COMMENT ON TABLE pathiq_profiles IS 'Persistent storage for PathIQ gamification profiles';
COMMENT ON TABLE xp_transactions IS 'Immutable transaction log of all XP earned and spent';
COMMENT ON FUNCTION award_xp IS 'Award XP to user with automatic level-up calculation';
COMMENT ON FUNCTION spend_xp IS 'Deduct XP for hint purchases';
COMMENT ON FUNCTION get_leaderboard IS 'Retrieve leaderboard rankings for a tenant';
COMMENT ON VIEW pathiq_leaderboard_view IS 'Pre-calculated leaderboard rankings by grade and tenant';
COMMENT ON VIEW xp_analytics_view IS 'Daily XP analytics aggregated by category and type';

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
