-- ============================================
-- Step 1: Create CCM Industries Table
-- Separate industry classifications for Career Challenge Multiplayer
-- ============================================

-- Create ccm_industries table (without touching ccm_company_rooms yet)
CREATE TABLE IF NOT EXISTS ccm_industries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10), -- emoji
    color_scheme JSONB DEFAULT '{"primary": "#3B82F6", "secondary": "#1E40AF"}',

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_ccm_industries_code ON ccm_industries(code);
CREATE INDEX idx_ccm_industries_active ON ccm_industries(is_active);

-- Seed all CCM industries
INSERT INTO ccm_industries (code, name, description, icon, color_scheme, display_order)
VALUES
    (
        'FOOD',
        'Food & Beverage',
        'Restaurants, cafes, and food service businesses',
        '🍽️',
        '{"primary": "#F59E0B", "secondary": "#D97706"}'::jsonb,
        1
    ),
    (
        'RETAIL',
        'Retail',
        'Stores and retail businesses selling products directly to consumers',
        '🛍️',
        '{"primary": "#8B5CF6", "secondary": "#7C3AED"}'::jsonb,
        2
    ),
    (
        'HEALTH',
        'Health & Wellness',
        'Fitness centers, wellness programs, and health services',
        '🏥',
        '{"primary": "#10B981", "secondary": "#059669"}'::jsonb,
        3
    ),
    (
        'ENTERTAINMENT',
        'Entertainment',
        'Gaming, entertainment venues, and recreational businesses',
        '🎮',
        '{"primary": "#EC4899", "secondary": "#DB2777"}'::jsonb,
        4
    ),
    (
        'TRANSPORTATION',
        'Transportation',
        'Transportation and logistics services',
        '🚗',
        '{"primary": "#3B82F6", "secondary": "#2563EB"}'::jsonb,
        5
    ),
    (
        'TECHNOLOGY',
        'Technology',
        'Software, apps, and tech products',
        '💻',
        '{"primary": "#06B6D4", "secondary": "#0891B2"}'::jsonb,
        6
    ),
    (
        'FASHION',
        'Fashion & Apparel',
        'Clothing, accessories, and fashion retail',
        '👕',
        '{"primary": "#EF4444", "secondary": "#DC2626"}'::jsonb,
        7
    ),
    (
        'EDUCATION',
        'Education',
        'Educational services and learning centers',
        '📚',
        '{"primary": "#14B8A6", "secondary": "#0D9488"}'::jsonb,
        8
    ),
    (
        'HOSPITALITY',
        'Hospitality',
        'Hotels, resorts, and hospitality services',
        '🏨',
        '{"primary": "#F97316", "secondary": "#EA580C"}'::jsonb,
        9
    ),
    (
        'SERVICES',
        'Professional Services',
        'Consulting and professional service businesses',
        '💼',
        '{"primary": "#6366F1", "secondary": "#4F46E5"}'::jsonb,
        10
    ),
    (
        'CONSTRUCTION',
        'Construction',
        'Building and construction services',
        '🏗️',
        '{"primary": "#EA580C", "secondary": "#DC2626"}'::jsonb,
        11
    ),
    (
        'HEALTHCARE',
        'Healthcare',
        'Medical services and healthcare providers',
        '🏥',
        '{"primary": "#059669", "secondary": "#0891B2"}'::jsonb,
        12
    )
ON CONFLICT (code) DO NOTHING;

-- Update trigger
CREATE OR REPLACE FUNCTION update_ccm_industries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ccm_industries_timestamp
BEFORE UPDATE ON ccm_industries
FOR EACH ROW EXECUTE FUNCTION update_ccm_industries_updated_at();

-- Grant permissions
GRANT SELECT ON ccm_industries TO authenticated;
GRANT SELECT ON ccm_industries TO anon;

-- Add comment
COMMENT ON TABLE ccm_industries IS
'Industry classifications for CCM multiplayer companies. Separate from cc_industries to allow independent management of CCM content.';

-- ============================================
-- Verification
-- ============================================

DO $$
DECLARE
    industry_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO industry_count FROM ccm_industries;

    RAISE NOTICE '';
    RAISE NOTICE '✅ CCM Industries Table Created';
    RAISE NOTICE '   - Total industries seeded: %', industry_count;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Next: Run 02_update_ccm_company_rooms_industry_ids.sql';
    RAISE NOTICE '';
END $$;
