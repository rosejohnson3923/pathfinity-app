-- ================================================
-- Career Attributes Child Table Migration
-- Separates enrichment data from core career_paths table
-- ================================================

-- 1. Create frequency indicator enum type
DO $$ BEGIN
    CREATE TYPE frequency_indicator AS ENUM ('LIF', 'MIF', 'HIF');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create the career_attributes table
CREATE TABLE IF NOT EXISTS career_attributes (
    -- Primary key and foreign key
    career_code VARCHAR(100) PRIMARY KEY REFERENCES career_paths(career_code) ON DELETE CASCADE,

    -- Engagement Ratings (1-100 scale)
    ers_student_engagement INTEGER CHECK (ers_student_engagement BETWEEN 1 AND 100),
    erp_parent_engagement INTEGER CHECK (erp_parent_engagement BETWEEN 1 AND 100),
    ere_employer_engagement INTEGER CHECK (ere_employer_engagement BETWEEN 1 AND 100),

    -- Frequency Indicator
    interaction_frequency frequency_indicator,

    -- Industry Ratings (1-100 scale)
    lir_legacy_rating INTEGER CHECK (lir_legacy_rating BETWEEN 1 AND 100),
    eir_emerging_rating INTEGER CHECK (eir_emerging_rating BETWEEN 1 AND 100),
    air_ai_first_rating INTEGER CHECK (air_ai_first_rating BETWEEN 1 AND 100),

    -- Industry and Career Classification
    industry_sector VARCHAR(100),
    career_cluster VARCHAR(100),
    automation_risk VARCHAR(20) CHECK (automation_risk IN ('Low', 'Medium', 'High')),
    remote_work_potential VARCHAR(20) CHECK (remote_work_potential IN ('Low', 'Medium', 'High', 'Full')),

    -- Work Environment and Tools
    typical_work_environment TEXT[],
    key_tools_technologies TEXT[],

    -- Career Progression
    career_progression_paths TEXT[],
    related_careers TEXT[],
    entry_level_titles TEXT[],
    mid_level_titles TEXT[],
    senior_level_titles TEXT[],

    -- Educational and Skill Requirements
    minimum_education VARCHAR(100),
    preferred_education VARCHAR(100),
    certifications_helpful TEXT[],
    soft_skills_required TEXT[],
    technical_skills_required TEXT[],

    -- Compensation and Benefits (ranges)
    entry_level_salary_range VARCHAR(50),
    mid_level_salary_range VARCHAR(50),
    senior_level_salary_range VARCHAR(50),
    typical_benefits TEXT[],

    -- Engaging Content for Students
    fun_facts TEXT[],
    day_in_life_description TEXT,
    famous_professionals TEXT[],
    cool_projects_examples TEXT[],
    why_its_exciting TEXT,

    -- Computed Scores (stored for performance)
    total_engagement_score INTEGER GENERATED ALWAYS AS (
        (COALESCE(ers_student_engagement, 0) +
         COALESCE(erp_parent_engagement, 0) +
         COALESCE(ere_employer_engagement, 0)) / NULLIF(
            (CASE WHEN ers_student_engagement IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN erp_parent_engagement IS NOT NULL THEN 1 ELSE 0 END +
             CASE WHEN ere_employer_engagement IS NOT NULL THEN 1 ELSE 0 END), 0)
    ) STORED,

    future_readiness_score INTEGER GENERATED ALWAYS AS (
        CASE
            WHEN eir_emerging_rating IS NOT NULL AND air_ai_first_rating IS NOT NULL
            THEN (COALESCE(eir_emerging_rating, 0) * 2 + COALESCE(air_ai_first_rating, 0) * 3) / 5
            WHEN air_ai_first_rating IS NOT NULL
            THEN air_ai_first_rating
            WHEN eir_emerging_rating IS NOT NULL
            THEN eir_emerging_rating
            ELSE NULL
        END
    ) STORED,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_source VARCHAR(50), -- 'manual', 'bls', 'onet', 'ai_generated'
    last_validated DATE,
    notes TEXT
);

-- 3. Create indexes for performance
CREATE INDEX idx_career_attr_engagement ON career_attributes(total_engagement_score);
CREATE INDEX idx_career_attr_future ON career_attributes(future_readiness_score);
CREATE INDEX idx_career_attr_frequency ON career_attributes(interaction_frequency);
CREATE INDEX idx_career_attr_industry ON career_attributes(industry_sector);
CREATE INDEX idx_career_attr_ers ON career_attributes(ers_student_engagement);
CREATE INDEX idx_career_attr_air ON career_attributes(air_ai_first_rating);

-- 4. Update career_paths table - remove any duplicate columns if they exist
-- (These should now only be in career_attributes)
ALTER TABLE career_paths
    DROP COLUMN IF EXISTS typical_work_environment,
    DROP COLUMN IF EXISTS key_tools_technologies,
    DROP COLUMN IF EXISTS career_progression_paths,
    DROP COLUMN IF EXISTS related_careers,
    DROP COLUMN IF EXISTS fun_facts,
    DROP COLUMN IF EXISTS day_in_life_description,
    DROP COLUMN IF EXISTS famous_professionals,
    DROP COLUMN IF EXISTS entry_level_titles,
    DROP COLUMN IF EXISTS mid_level_titles,
    DROP COLUMN IF EXISTS senior_level_titles;

-- 5. Add any missing columns to career_paths that should stay there
ALTER TABLE career_paths
    ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 999,
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS featured_until DATE,
    ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 6. Create views for easy querying

-- View for complete career information
CREATE OR REPLACE VIEW careers_with_attributes AS
SELECT
    cp.*,
    ca.ers_student_engagement,
    ca.erp_parent_engagement,
    ca.ere_employer_engagement,
    ca.interaction_frequency,
    ca.lir_legacy_rating,
    ca.eir_emerging_rating,
    ca.air_ai_first_rating,
    ca.total_engagement_score,
    ca.future_readiness_score,
    ca.industry_sector,
    ca.career_cluster,
    ca.automation_risk,
    ca.remote_work_potential
FROM career_paths cp
LEFT JOIN career_attributes ca ON cp.career_code = ca.career_code;

-- View for student-facing career selection
CREATE OR REPLACE VIEW student_career_view AS
SELECT
    cp.career_code,
    cp.career_name,
    cp.icon,
    cp.color,
    cp.grade_category,
    cp.access_tier,
    ca.ers_student_engagement,
    ca.interaction_frequency,
    ca.fun_facts,
    ca.why_its_exciting,
    CASE
        WHEN ca.ers_student_engagement >= 80 THEN '🔥 Hot'
        WHEN ca.ers_student_engagement >= 60 THEN '⭐ Popular'
        ELSE NULL
    END as popularity_badge
FROM career_paths cp
LEFT JOIN career_attributes ca ON cp.career_code = ca.career_code
WHERE cp.is_active = true;

-- View for analytics dashboard
CREATE OR REPLACE VIEW career_analytics_view AS
SELECT
    cp.career_code,
    cp.career_name,
    cp.grade_category,
    cp.access_tier,
    ca.total_engagement_score,
    ca.future_readiness_score,
    ca.interaction_frequency,
    CASE
        WHEN ca.total_engagement_score >= 80 THEN 'Hot Career'
        WHEN ca.total_engagement_score >= 60 THEN 'Popular Career'
        WHEN ca.total_engagement_score >= 40 THEN 'Standard Career'
        ELSE 'Niche Career'
    END as popularity_tier,
    CASE
        WHEN ca.future_readiness_score >= 80 THEN 'Future-Proof'
        WHEN ca.future_readiness_score >= 60 THEN 'Future-Ready'
        WHEN ca.future_readiness_score >= 40 THEN 'Transitioning'
        ELSE 'Traditional'
    END as future_tier
FROM career_paths cp
LEFT JOIN career_attributes ca ON cp.career_code = ca.career_code;

-- 7. Insert default attributes for existing careers
INSERT INTO career_attributes (career_code)
SELECT career_code FROM career_paths
ON CONFLICT (career_code) DO NOTHING;

-- 8. Update with some initial data based on career names (temporary defaults)
UPDATE career_attributes ca
SET
    -- Student engagement based on career appeal to young people
    ers_student_engagement = CASE
        WHEN cp.career_name ILIKE '%game%' THEN 95
        WHEN cp.career_name ILIKE '%youtube%' THEN 92
        WHEN cp.career_name ILIKE '%athlete%' THEN 88
        WHEN cp.career_name ILIKE '%artist%' THEN 85
        WHEN cp.career_name ILIKE '%chef%' THEN 82
        WHEN cp.career_name ILIKE '%photographer%' THEN 80
        WHEN cp.career_name ILIKE '%programmer%' THEN 75
        WHEN cp.career_name ILIKE '%designer%' THEN 78
        WHEN cp.career_name ILIKE '%engineer%' THEN 65
        WHEN cp.career_name ILIKE '%teacher%' THEN 60
        WHEN cp.career_name ILIKE '%doctor%' THEN 70
        WHEN cp.career_name ILIKE '%scientist%' THEN 68
        ELSE 50
    END,

    -- Parent engagement based on traditional career values
    erp_parent_engagement = CASE
        WHEN cp.career_name ILIKE '%doctor%' THEN 95
        WHEN cp.career_name ILIKE '%lawyer%' THEN 90
        WHEN cp.career_name ILIKE '%engineer%' THEN 88
        WHEN cp.career_name ILIKE '%teacher%' THEN 75
        WHEN cp.career_name ILIKE '%nurse%' THEN 80
        WHEN cp.career_name ILIKE '%manager%' THEN 82
        WHEN cp.career_name ILIKE '%scientist%' THEN 85
        WHEN cp.career_name ILIKE '%youtube%' THEN 35
        WHEN cp.career_name ILIKE '%game%' THEN 40
        ELSE 60
    END,

    -- Employer engagement based on market demand
    ere_employer_engagement = CASE
        WHEN cp.career_name ILIKE '%engineer%' THEN 92
        WHEN cp.career_name ILIKE '%data%' THEN 95
        WHEN cp.career_name ILIKE '%developer%' THEN 90
        WHEN cp.career_name ILIKE '%analyst%' THEN 85
        WHEN cp.career_name ILIKE '%manager%' THEN 88
        WHEN cp.career_name ILIKE '%nurse%' THEN 93
        WHEN cp.career_name ILIKE '%teacher%' THEN 70
        ELSE 65
    END,

    -- Interaction frequency based on how often students encounter these careers
    interaction_frequency = CASE
        WHEN cp.career_name ILIKE ANY(ARRAY['%teacher%', '%doctor%', '%nurse%', '%police%', '%firefighter%']) THEN 'HIF'::frequency_indicator
        WHEN cp.career_name ILIKE ANY(ARRAY['%programmer%', '%manager%', '%analyst%']) THEN 'MIF'::frequency_indicator
        ELSE 'LIF'::frequency_indicator
    END,

    -- Legacy industry rating
    lir_legacy_rating = CASE
        WHEN cp.career_name ILIKE ANY(ARRAY['%farmer%', '%librarian%', '%teacher%']) THEN 85
        WHEN cp.career_name ILIKE ANY(ARRAY['%doctor%', '%lawyer%', '%banker%']) THEN 75
        ELSE 40
    END,

    -- Emerging industry rating
    eir_emerging_rating = CASE
        WHEN cp.career_name ILIKE ANY(ARRAY['%renewable%', '%sustain%', '%green%']) THEN 90
        WHEN cp.career_name ILIKE ANY(ARRAY['%data%', '%cloud%', '%cyber%']) THEN 85
        WHEN cp.career_name ILIKE ANY(ARRAY['%bio%', '%genetic%']) THEN 80
        ELSE 45
    END,

    -- AI-first industry rating
    air_ai_first_rating = CASE
        WHEN cp.career_name ILIKE '%ai%' OR cp.career_name ILIKE '%machine learning%' THEN 98
        WHEN cp.career_name ILIKE '%data scientist%' THEN 92
        WHEN cp.career_name ILIKE '%automat%' THEN 88
        WHEN cp.career_name ILIKE '%developer%' THEN 75
        WHEN cp.career_name ILIKE '%analyst%' THEN 70
        ELSE 30
    END,

    data_source = 'initial_migration',
    updated_at = CURRENT_TIMESTAMP
FROM career_paths cp
WHERE ca.career_code = cp.career_code
  AND ca.ers_student_engagement IS NULL;

-- 9. Grant permissions
GRANT SELECT ON career_attributes TO anon;
GRANT SELECT ON career_attributes TO authenticated;
GRANT SELECT ON careers_with_attributes TO anon;
GRANT SELECT ON careers_with_attributes TO authenticated;
GRANT SELECT ON student_career_view TO anon;
GRANT SELECT ON student_career_view TO authenticated;

-- 10. Verification query
SELECT
    'Migration Complete' as status,
    COUNT(*) as total_careers,
    COUNT(ca.career_code) as careers_with_attributes,
    AVG(ca.ers_student_engagement) as avg_student_engagement,
    COUNT(CASE WHEN ca.interaction_frequency IS NOT NULL THEN 1 END) as careers_with_frequency
FROM career_paths cp
LEFT JOIN career_attributes ca ON cp.career_code = ca.career_code;