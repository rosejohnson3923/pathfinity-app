-- ================================================
-- Supplementary Migration for Missing Components
-- ================================================
-- Run this if the first migration was incomplete

-- Check and add missing columns to career_paths
DO $$
BEGIN
    -- Check if daily_tasks column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'career_paths' AND column_name = 'daily_tasks'
    ) THEN
        ALTER TABLE career_paths ADD COLUMN daily_tasks TEXT[];
    END IF;

    -- Check if salary_range exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'career_paths' AND column_name = 'salary_range'
    ) THEN
        ALTER TABLE career_paths ADD COLUMN salary_range VARCHAR(50);
    END IF;

    -- Check if required_skills exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'career_paths' AND column_name = 'required_skills'
    ) THEN
        ALTER TABLE career_paths ADD COLUMN required_skills TEXT[];
    END IF;

    -- Check if growth_outlook exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'career_paths' AND column_name = 'growth_outlook'
    ) THEN
        ALTER TABLE career_paths ADD COLUMN growth_outlook VARCHAR(50);
    END IF;

    -- Check if education_required exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'career_paths' AND column_name = 'education_required'
    ) THEN
        ALTER TABLE career_paths ADD COLUMN education_required VARCHAR(100);
    END IF;
END $$;

-- Create missing tables if they don't exist

-- Career access analytics (if missing)
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

-- Premium conversion funnel (if missing)
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

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_career_access_analytics
    ON career_access_events(tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_career_access_premium_conversion
    ON career_access_events(tenant_id, was_premium, completed_upgrade);

-- Create missing view (subscription_metrics)
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

-- Final check
SELECT
    'Migration Complete - Component Count:' as status,
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_name = 'career_paths'
     AND column_name IN ('access_tier', 'min_grade_level', 'grade_category',
                         'daily_tasks', 'salary_range', 'required_skills')) as columns_added,
    (SELECT COUNT(*) FROM information_schema.tables
     WHERE table_schema = 'public'
     AND table_name IN ('subscription_tiers', 'tenant_subscriptions',
                       'career_access_events', 'premium_conversion_funnel')) as tables_created,
    (SELECT COUNT(*) FROM pg_views
     WHERE schemaname = 'public'
     AND viewname IN ('premium_conversion_metrics', 'high_value_premium_careers',
                     'subscription_metrics')) as views_created;