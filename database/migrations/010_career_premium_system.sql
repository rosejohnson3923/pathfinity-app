-- ============================================
-- Career Premium System Migration
-- ============================================
-- Adds premium tier support to career system
-- Enables revenue generation through tiered access
-- Maintains grade-appropriate career progression

-- Add premium fields to existing career_paths table
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS access_tier VARCHAR(20) DEFAULT 'basic' CHECK (access_tier IN ('basic', 'premium'));
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS min_grade_level VARCHAR(10) NOT NULL DEFAULT 'K';
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS max_grade_level VARCHAR(10);
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS grade_category VARCHAR(20) CHECK (grade_category IN ('elementary', 'middle', 'high', 'all'));

-- Visual elements (if not already present)
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS icon VARCHAR(10);
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS color VARCHAR(20);

-- Additional career details
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS daily_tasks TEXT[];
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS required_skills TEXT[];
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS salary_range VARCHAR(50);
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS growth_outlook VARCHAR(50);
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS education_required VARCHAR(100);

-- Premium metadata
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS premium_since DATE;
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS premium_reason TEXT;
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS expected_revenue_impact DECIMAL(10,2);

-- Sorting and display
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 999;
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE;

-- Analytics
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS basic_selections INTEGER DEFAULT 0;
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS premium_selections INTEGER DEFAULT 0;
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS upgrade_trigger_count INTEGER DEFAULT 0;
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS last_selected_at TIMESTAMP WITH TIME ZONE;

-- Create grade level numeric mapping for easier queries
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS min_grade_level_num INTEGER GENERATED ALWAYS AS (
        CASE min_grade_level
            WHEN 'K' THEN 0
            WHEN '1' THEN 1
            WHEN '2' THEN 2
            WHEN '3' THEN 3
            WHEN '4' THEN 4
            WHEN '5' THEN 5
            WHEN '6' THEN 6
            WHEN '7' THEN 7
            WHEN '8' THEN 8
            WHEN '9' THEN 9
            WHEN '10' THEN 10
            WHEN '11' THEN 11
            WHEN '12' THEN 12
            ELSE 0
        END
    ) STORED;

ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS max_grade_level_num INTEGER GENERATED ALWAYS AS (
        CASE max_grade_level
            WHEN 'K' THEN 0
            WHEN '1' THEN 1
            WHEN '2' THEN 2
            WHEN '3' THEN 3
            WHEN '4' THEN 4
            WHEN '5' THEN 5
            WHEN '6' THEN 6
            WHEN '7' THEN 7
            WHEN '8' THEN 8
            WHEN '9' THEN 9
            WHEN '10' THEN 10
            WHEN '11' THEN 11
            WHEN '12' THEN 12
            ELSE 12
        END
    ) STORED;

-- Subscription tiers table
CREATE TABLE IF NOT EXISTS subscription_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_code VARCHAR(20) NOT NULL UNIQUE,
    tier_name VARCHAR(100) NOT NULL,

    -- Pricing
    monthly_price DECIMAL(10,2) NOT NULL,
    annual_price DECIMAL(10,2),

    -- Features
    includes_premium_careers BOOLEAN DEFAULT FALSE,
    custom_career_slots INTEGER DEFAULT 0,
    white_label_allowed BOOLEAN DEFAULT FALSE,
    analytics_access VARCHAR(20) DEFAULT 'basic', -- basic, advanced, full

    -- Limits
    max_students INTEGER,
    max_teachers INTEGER,

    -- Stripe integration
    stripe_product_id VARCHAR(100),
    stripe_price_id_monthly VARCHAR(100),
    stripe_price_id_annual VARCHAR(100),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_available_for_signup BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenant subscriptions
CREATE TABLE IF NOT EXISTS tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    tier_id UUID REFERENCES subscription_tiers(id),

    -- Subscription details
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'pending', 'past_due')),
    current_period_start DATE NOT NULL DEFAULT CURRENT_DATE,
    current_period_end DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '30 days'),

    -- Trial management
    is_trial BOOLEAN DEFAULT FALSE,
    trial_end_date DATE,
    converted_from_trial BOOLEAN DEFAULT FALSE,

    -- Billing
    stripe_subscription_id VARCHAR(100),
    stripe_customer_id VARCHAR(100),
    payment_method VARCHAR(50),
    last_payment_date DATE,
    next_payment_date DATE,

    -- Usage tracking
    students_enrolled INTEGER DEFAULT 0,
    careers_accessed TEXT[],
    premium_careers_accessed TEXT[],
    last_career_access TIMESTAMP WITH TIME ZONE,
    custom_careers_created INTEGER DEFAULT 0,

    -- Metadata
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure one active subscription per tenant
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_subscription_per_tenant
    ON tenant_subscriptions(tenant_id)
    WHERE status = 'active';

-- Career access analytics
CREATE TABLE IF NOT EXISTS career_access_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    career_code VARCHAR(50) NOT NULL,

    -- Event details
    event_type VARCHAR(50) NOT NULL
        CHECK (event_type IN ('view', 'select', 'preview_locked', 'details_view', 'favorite')),
    was_premium BOOLEAN DEFAULT FALSE,
    had_access BOOLEAN DEFAULT TRUE,

    -- Conversion tracking
    showed_upgrade_prompt BOOLEAN DEFAULT FALSE,
    clicked_upgrade BOOLEAN DEFAULT FALSE,
    completed_upgrade BOOLEAN DEFAULT FALSE,
    upgrade_revenue DECIMAL(10,2),

    -- Context
    user_grade VARCHAR(10),
    user_role VARCHAR(20), -- student, teacher, parent
    session_id UUID,
    referrer_page VARCHAR(100),
    time_spent_seconds INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Premium conversion funnel
CREATE TABLE IF NOT EXISTS premium_conversion_funnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,

    -- Funnel stages
    viewed_premium_career BOOLEAN DEFAULT FALSE,
    viewed_premium_career_at TIMESTAMP WITH TIME ZONE,

    clicked_learn_more BOOLEAN DEFAULT FALSE,
    clicked_learn_more_at TIMESTAMP WITH TIME ZONE,

    viewed_pricing BOOLEAN DEFAULT FALSE,
    viewed_pricing_at TIMESTAMP WITH TIME ZONE,

    started_checkout BOOLEAN DEFAULT FALSE,
    started_checkout_at TIMESTAMP WITH TIME ZONE,

    completed_purchase BOOLEAN DEFAULT FALSE,
    completed_purchase_at TIMESTAMP WITH TIME ZONE,

    -- Attribution
    first_premium_career_viewed VARCHAR(50),
    converting_career VARCHAR(50), -- Which career triggered the conversion
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),

    -- Results
    subscription_id UUID REFERENCES tenant_subscriptions(id),
    revenue_generated DECIMAL(10,2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription tiers
INSERT INTO subscription_tiers (tier_code, tier_name, monthly_price, annual_price, includes_premium_careers, custom_career_slots, max_students, max_teachers)
VALUES
    ('basic', 'Basic', 0, 0, false, 0, 500, 10),
    ('premium', 'Premium', 49.00, 490.00, true, 0, 1000, 25),
    ('premium_plus', 'Premium Plus', 99.00, 990.00, true, 5, 2000, 50),
    ('enterprise', 'Enterprise', 499.00, 4990.00, true, -1, -1, -1) -- -1 means unlimited
ON CONFLICT (tier_code) DO UPDATE SET
    monthly_price = EXCLUDED.monthly_price,
    annual_price = EXCLUDED.annual_price,
    updated_at = NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_career_paths_tier_grade
    ON career_paths(access_tier, min_grade_level_num);
CREATE INDEX IF NOT EXISTS idx_career_paths_premium
    ON career_paths(access_tier) WHERE access_tier = 'premium';
CREATE INDEX IF NOT EXISTS idx_tenant_subscriptions_active
    ON tenant_subscriptions(tenant_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_career_access_analytics
    ON career_access_events(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_career_access_premium_conversion
    ON career_access_events(tenant_id, was_premium, completed_upgrade);

-- Analytics views for dashboard
CREATE OR REPLACE VIEW premium_conversion_metrics AS
SELECT
    DATE_TRUNC('week', created_at) as week,
    COUNT(DISTINCT tenant_id) as unique_tenants,
    COUNT(*) FILTER (WHERE event_type = 'preview_locked') as premium_views,
    COUNT(*) FILTER (WHERE showed_upgrade_prompt) as upgrade_prompts,
    COUNT(*) FILTER (WHERE clicked_upgrade) as upgrade_clicks,
    COUNT(*) FILTER (WHERE completed_upgrade) as conversions,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE completed_upgrade) /
        NULLIF(COUNT(*) FILTER (WHERE showed_upgrade_prompt), 0), 2
    ) as conversion_rate,
    SUM(upgrade_revenue) as total_revenue
FROM career_access_events
WHERE was_premium = true
GROUP BY week
ORDER BY week DESC;

-- High value premium careers
CREATE OR REPLACE VIEW high_value_premium_careers AS
SELECT
    cp.career_code,
    cp.career_name,
    cp.icon,
    cp.grade_category,
    COUNT(*) as total_views,
    COUNT(*) FILTER (WHERE cae.completed_upgrade) as conversions,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE cae.completed_upgrade) / COUNT(*), 2
    ) as conversion_rate
FROM career_access_events cae
JOIN career_paths cp ON cp.career_code = cae.career_code
WHERE cae.was_premium = true
GROUP BY cp.career_code, cp.career_name, cp.icon, cp.grade_category
HAVING COUNT(*) > 10
ORDER BY conversion_rate DESC, total_views DESC;

-- Subscription metrics view
CREATE OR REPLACE VIEW subscription_metrics AS
SELECT
    st.tier_name,
    COUNT(ts.id) as active_subscriptions,
    SUM(ts.students_enrolled) as total_students,
    AVG(ts.students_enrolled) as avg_students_per_tenant,
    COUNT(ts.id) * st.monthly_price as mrr,
    COUNT(ts.id) * st.annual_price as arr_potential
FROM tenant_subscriptions ts
JOIN subscription_tiers st ON st.id = ts.tier_id
WHERE ts.status = 'active'
GROUP BY st.tier_name, st.monthly_price, st.annual_price
ORDER BY st.monthly_price DESC;

-- Add comments for documentation
COMMENT ON TABLE career_paths IS 'Master table of all careers with premium tier support';
COMMENT ON COLUMN career_paths.access_tier IS 'Determines if career requires premium subscription';
COMMENT ON TABLE subscription_tiers IS 'Available subscription plans and their features';
COMMENT ON TABLE tenant_subscriptions IS 'Active subscriptions by tenant/school';
COMMENT ON TABLE career_access_events IS 'Tracks all career interactions for analytics';
COMMENT ON TABLE premium_conversion_funnel IS 'Detailed conversion tracking for premium upgrades';