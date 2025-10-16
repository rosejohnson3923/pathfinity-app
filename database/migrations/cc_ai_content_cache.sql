-- ================================================================
-- AI Content Cache Table for Career Challenge
-- ================================================================
-- Stores AI-generated content for reuse and performance
-- ================================================================

CREATE TABLE IF NOT EXISTS cc_ai_content_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Content identification
    industry_code VARCHAR(50),
    content_type VARCHAR(50) NOT NULL, -- 'challenge', 'role_card', 'synergy', 'full_industry'
    content_key VARCHAR(255) UNIQUE, -- Unique identifier for this content

    -- Content data
    content_data JSONB NOT NULL, -- The actual generated content

    -- Metadata
    ai_model VARCHAR(50), -- Which AI model was used
    prompt_tokens INTEGER, -- Tokens used in prompt
    completion_tokens INTEGER, -- Tokens used in completion
    total_cost DECIMAL(10,4), -- Cost in dollars

    -- Quality metrics
    moderation_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    moderation_notes TEXT,
    quality_score DECIMAL(3,2), -- 0.00 to 1.00
    human_reviewed BOOLEAN DEFAULT false,
    reviewer_id TEXT,
    review_date TIMESTAMP WITH TIME ZONE,

    -- Usage tracking
    times_used INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,

    -- Expiration
    expires_at TIMESTAMP WITH TIME ZONE, -- Content expiration for refresh

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT valid_content_type CHECK (
        content_type IN ('challenge', 'role_card', 'synergy', 'full_industry', 'bulk_generation')
    ),
    CONSTRAINT valid_moderation_status CHECK (
        moderation_status IN ('pending', 'approved', 'rejected', 'flagged')
    )
);

-- Indexes for efficient querying
CREATE INDEX idx_cc_ai_cache_industry ON cc_ai_content_cache(industry_code);
CREATE INDEX idx_cc_ai_cache_type ON cc_ai_content_cache(content_type);
CREATE INDEX idx_cc_ai_cache_key ON cc_ai_content_cache(content_key);
CREATE INDEX idx_cc_ai_cache_moderation ON cc_ai_content_cache(moderation_status);
CREATE INDEX idx_cc_ai_cache_expires ON cc_ai_content_cache(expires_at);

-- Enable RLS
ALTER TABLE cc_ai_content_cache ENABLE ROW LEVEL SECURITY;

-- Policy to allow reading approved content
CREATE POLICY "Approved content is viewable" ON cc_ai_content_cache
    FOR SELECT USING (moderation_status = 'approved');

-- Update trigger
CREATE TRIGGER update_cc_ai_content_cache_updated_at BEFORE UPDATE ON cc_ai_content_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- Sample function to get or generate content
-- ================================================================
CREATE OR REPLACE FUNCTION cc_get_or_generate_content(
    p_content_type VARCHAR,
    p_content_key VARCHAR,
    p_industry_code VARCHAR DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_cached_content JSONB;
    v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Look for cached content
    SELECT content_data, expires_at
    INTO v_cached_content, v_expires_at
    FROM cc_ai_content_cache
    WHERE content_key = p_content_key
    AND moderation_status = 'approved'
    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    LIMIT 1;

    -- If found and not expired, update usage and return
    IF v_cached_content IS NOT NULL THEN
        UPDATE cc_ai_content_cache
        SET times_used = times_used + 1,
            last_used_at = CURRENT_TIMESTAMP
        WHERE content_key = p_content_key;

        RETURN v_cached_content;
    END IF;

    -- No cached content found
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- Function to approve AI content after moderation
-- ================================================================
CREATE OR REPLACE FUNCTION cc_approve_ai_content(
    p_content_id UUID,
    p_reviewer_id TEXT,
    p_quality_score DECIMAL DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE cc_ai_content_cache
    SET moderation_status = 'approved',
        human_reviewed = true,
        reviewer_id = p_reviewer_id,
        review_date = CURRENT_TIMESTAMP,
        quality_score = COALESCE(p_quality_score, quality_score),
        moderation_notes = p_notes
    WHERE id = p_content_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- Function to bulk approve content by industry
-- ================================================================
CREATE OR REPLACE FUNCTION cc_bulk_approve_industry_content(
    p_industry_code VARCHAR,
    p_reviewer_id TEXT
) RETURNS INTEGER AS $$
DECLARE
    v_approved_count INTEGER;
BEGIN
    UPDATE cc_ai_content_cache
    SET moderation_status = 'approved',
        human_reviewed = true,
        reviewer_id = p_reviewer_id,
        review_date = CURRENT_TIMESTAMP
    WHERE industry_code = p_industry_code
    AND moderation_status = 'pending';

    GET DIAGNOSTICS v_approved_count = ROW_COUNT;
    RETURN v_approved_count;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- END OF AI CONTENT CACHE SCHEMA
-- ================================================================