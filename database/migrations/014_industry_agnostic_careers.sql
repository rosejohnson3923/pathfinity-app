-- ================================================
-- Industry-Agnostic Careers from Gaming Careers 2025
-- These careers exist across many industries, not just gaming
-- ================================================

-- Check existing careers before inserting
DO $$
BEGIN
    RAISE NOTICE 'Adding industry-agnostic careers that apply across sectors...';
END $$;

INSERT INTO career_paths (
    career_code, career_name, icon, color,
    grade_category, min_grade_level, max_grade_level,
    access_tier, career_category, description,
    is_active, display_order, is_featured, tags
) VALUES

-- ==== ELEMENTARY LEVEL - Visible Everyday Careers ====

('ELEM_PHOTOGRAPHER', 'Photographer', '📷', '#EC4899',
 'elementary', 'K', '5', 'basic', 'Arts & Media',
 'Takes pictures to capture special moments and tell stories',
 true, 170, false, ARRAY['creative', 'visual', 'art']),

('ELEM_SALES_REP', 'Sales Representative', '🛍️', '#10B981',
 'elementary', 'K', '5', 'basic', 'Business',
 'Helps people find and buy things they need',
 true, 171, false, ARRAY['business', 'communication', 'service']),

('ELEM_CUSTOMER_SERVICE', 'Customer Service Representative', '🎧', '#3B82F6',
 'elementary', 'K', '5', 'basic', 'Service',
 'Helps customers and solves their problems',
 true, 172, false, ARRAY['service', 'communication', 'helping']),

-- ==== MIDDLE SCHOOL LEVEL - Professional Service Roles ====

('MID_COPYWRITER', 'Copywriter', '✍️', '#8B5CF6',
 'middle', '6', '8', 'basic', 'Communications',
 'Writes compelling content for ads, websites, and marketing',
 true, 270, false, ARRAY['writing', 'creative', 'marketing']),

('MID_VIDEO_EDITOR', 'Video Editor', '🎬', '#F59E0B',
 'middle', '6', '8', 'premium', 'Media Production',
 'Edits and assembles video footage to tell stories',
 true, 271, false, ARRAY['video', 'editing', 'creative']),

('MID_SOCIAL_MEDIA_SPEC', 'Social Media Specialist', '📱', '#06B6D4',
 'middle', '6', '8', 'basic', 'Digital Marketing',
 'Manages social media accounts and creates engaging content',
 true, 272, true, ARRAY['social', 'digital', 'marketing']),

('MID_RECRUITER', 'Recruiter', '🤝', '#EF4444',
 'middle', '6', '8', 'basic', 'Human Resources',
 'Finds and hires talented people for companies',
 true, 273, false, ARRAY['hr', 'people', 'talent']),

('MID_NUTRITIONIST', 'Nutritionist', '🥗', '#84CC16',
 'middle', '6', '8', 'premium', 'Health & Wellness',
 'Helps people eat healthy and make good food choices',
 true, 274, false, ARRAY['health', 'nutrition', 'wellness']),

('MID_FITNESS_TRAINER', 'Fitness Trainer', '💪', '#DC2626',
 'middle', '6', '8', 'basic', 'Health & Fitness',
 'Teaches people how to exercise and stay healthy',
 true, 275, false, ARRAY['fitness', 'health', 'coaching']),

('MID_CONTENT_STRATEGIST', 'Content Strategist', '📊', '#7C3AED',
 'middle', '6', '8', 'premium', 'Marketing',
 'Plans what content to create and when to share it',
 true, 276, false, ARRAY['strategy', 'content', 'planning']),

('MID_MOTION_DESIGNER', 'Motion Designer', '🎯', '#F97316',
 'middle', '6', '8', 'premium', 'Design',
 'Creates animated graphics and visual effects',
 true, 277, false, ARRAY['animation', 'design', 'motion']),

('MID_TALENT_AGENT', 'Talent Agent', '⭐', '#A855F7',
 'middle', '6', '8', 'basic', 'Entertainment',
 'Represents and promotes talented performers',
 true, 278, false, ARRAY['entertainment', 'talent', 'management']),

('MID_CASTING_DIRECTOR', 'Casting Director', '🎭', '#0EA5E9',
 'middle', '6', '8', 'premium', 'Entertainment',
 'Chooses the right actors for movies and shows',
 true, 279, false, ARRAY['entertainment', 'casting', 'talent']),

-- ==== HIGH SCHOOL LEVEL - Specialized Professional Careers ====

('HIGH_ACCOUNTANT', 'Accountant', '📊', '#059669',
 'high', '9', '12', 'basic', 'Finance',
 'Manages financial records and helps with taxes',
 true, 380, false, ARRAY['finance', 'accounting', 'business']),

('HIGH_HR_MANAGER', 'Human Resources Manager', '👥', '#7C3AED',
 'high', '9', '12', 'basic', 'Human Resources',
 'Manages employee relations and company culture',
 true, 381, false, ARRAY['hr', 'management', 'people']),

('HIGH_COMPLIANCE_OFFICER', 'Compliance Officer', '⚖️', '#991B1B',
 'high', '9', '12', 'premium', 'Legal & Compliance',
 'Ensures companies follow laws and regulations',
 true, 382, false, ARRAY['compliance', 'legal', 'regulatory']),

('HIGH_BUSINESS_DEV_MGR', 'Business Development Manager', '📈', '#0891B2',
 'high', '9', '12', 'premium', 'Business Development',
 'Identifies new business opportunities and partnerships',
 true, 383, false, ARRAY['business', 'development', 'strategy']),

('HIGH_DATA_ENTRY_SPEC', 'Data Entry Specialist', '⌨️', '#6B7280',
 'high', '9', '12', 'basic', 'Administration',
 'Enters and manages data in computer systems',
 true, 384, false, ARRAY['data', 'admin', 'technical']),

('HIGH_PSYCHOLOGIST', 'Psychologist', '🧠', '#EC4899',
 'high', '9', '12', 'premium', 'Mental Health',
 'Studies behavior and helps people with mental health',
 true, 385, true, ARRAY['psychology', 'mental-health', 'counseling']),

('HIGH_COPYEDITOR', 'Copy Editor', '📝', '#3B82F6',
 'high', '9', '12', 'basic', 'Publishing',
 'Reviews and corrects written content for errors',
 true, 386, false, ARRAY['editing', 'writing', 'publishing']),

('HIGH_VIDEOGRAPHER', 'Videographer', '📹', '#DC2626',
 'high', '9', '12', 'premium', 'Media Production',
 'Films and produces professional videos',
 true, 387, false, ARRAY['video', 'production', 'creative']),

('HIGH_SUPPLY_CHAIN_MGR', 'Supply Chain Manager', '🚚', '#059669',
 'high', '9', '12', 'premium', 'Operations',
 'Manages how products move from factories to customers',
 true, 388, false, ARRAY['logistics', 'supply-chain', 'operations']),

('HIGH_RISK_ANALYST', 'Risk Analyst', '⚠️', '#EF4444',
 'high', '9', '12', 'premium', 'Risk Management',
 'Identifies and analyzes potential business risks',
 true, 389, false, ARRAY['risk', 'analysis', 'finance']),

('HIGH_MERGERS_ACQ_SPEC', 'Mergers & Acquisitions Specialist', '🤝', '#7C3AED',
 'high', '9', '12', 'premium', 'Corporate Finance',
 'Helps companies buy and merge with other companies',
 true, 390, false, ARRAY['finance', 'mergers', 'corporate']),

('HIGH_TAX_SPECIALIST', 'Tax Specialist', '💰', '#10B981',
 'high', '9', '12', 'basic', 'Taxation',
 'Helps individuals and businesses with tax planning',
 true, 391, false, ARRAY['tax', 'finance', 'accounting']),

('HIGH_PAYROLL_SPEC', 'Payroll Specialist', '💵', '#F59E0B',
 'high', '9', '12', 'basic', 'Human Resources',
 'Manages employee salaries and benefits',
 true, 392, false, ARRAY['payroll', 'hr', 'finance']),

('HIGH_AUDITOR', 'Auditor', '🔍', '#6366F1',
 'high', '9', '12', 'premium', 'Accounting',
 'Reviews financial records to ensure accuracy',
 true, 393, false, ARRAY['audit', 'finance', 'compliance']),

('HIGH_BRAND_STRATEGIST', 'Brand Strategist', '🎨', '#A855F7',
 'high', '9', '12', 'premium', 'Marketing',
 'Develops strategies to build and promote brands',
 true, 394, false, ARRAY['branding', 'strategy', 'marketing']),

('HIGH_MEDIA_BUYER', 'Media Buyer', '📺', '#0EA5E9',
 'high', '9', '12', 'basic', 'Advertising',
 'Purchases advertising space and time for clients',
 true, 395, false, ARRAY['advertising', 'media', 'marketing']),

('HIGH_MERCHANDISER', 'Merchandiser', '🏷️', '#84CC16',
 'high', '9', '12', 'basic', 'Retail',
 'Plans and manages product displays in stores',
 true, 396, false, ARRAY['retail', 'merchandising', 'sales']),

('HIGH_CUSTOMER_SUCCESS', 'Customer Success Manager', '🌟', '#8B5CF6',
 'high', '9', '12', 'premium', 'Customer Relations',
 'Ensures customers achieve success with products',
 true, 397, false, ARRAY['customer', 'success', 'relationship']),

('HIGH_SECURITY_ANALYST', 'Security Analyst', '🔒', '#DC2626',
 'high', '9', '12', 'premium', 'Cybersecurity',
 'Protects computer systems from security threats',
 true, 398, false, ARRAY['security', 'cyber', 'technology'])

ON CONFLICT (career_code) DO UPDATE SET
    career_name = EXCLUDED.career_name,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    updated_at = CURRENT_TIMESTAMP
WHERE career_paths.career_name != EXCLUDED.career_name;

-- Summary report
WITH industry_summary AS (
    SELECT
        grade_category,
        access_tier,
        COUNT(*) as count
    FROM career_paths
    WHERE career_code LIKE 'ELEM_%'
       OR career_code LIKE 'MID_%'
       OR career_code LIKE 'HIGH_%'
    GROUP BY grade_category, access_tier
)
SELECT
    '📊 Industry-Agnostic Careers Summary' as report,
    grade_category,
    SUM(CASE WHEN access_tier = 'basic' THEN count ELSE 0 END) as basic_count,
    SUM(CASE WHEN access_tier = 'premium' THEN count ELSE 0 END) as premium_count,
    SUM(count) as total
FROM industry_summary
GROUP BY grade_category
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
    END;