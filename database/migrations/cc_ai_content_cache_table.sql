-- ================================================================
-- AI Content Cache Table for Career Challenge
-- Uses Azure AI Models from pathfinity-kv-2823
-- ================================================================

-- Create the AI content cache table
CREATE TABLE IF NOT EXISTS cc_ai_content_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Content identification
    industry_code VARCHAR(50),
    content_type VARCHAR(50) NOT NULL, -- 'challenge', 'role_card', 'synergy', 'full_industry'
    content_key VARCHAR(255) UNIQUE, -- Unique identifier for this content

    -- Request parameters (for regeneration if needed)
    request_params JSONB,

    -- Content data
    content_data JSONB NOT NULL, -- The actual generated content

    -- Metadata
    ai_model VARCHAR(50), -- Which AI model was used (from Azure)
    prompt_tokens INTEGER, -- Tokens used in prompt
    completion_tokens INTEGER, -- Tokens used in completion
    total_cost DECIMAL(10,4), -- Cost in dollars

    -- Quality metrics
    moderation_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'flagged'
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
CREATE INDEX IF NOT EXISTS idx_cc_ai_cache_industry ON cc_ai_content_cache(industry_code);
CREATE INDEX IF NOT EXISTS idx_cc_ai_cache_type ON cc_ai_content_cache(content_type);
CREATE INDEX IF NOT EXISTS idx_cc_ai_cache_key ON cc_ai_content_cache(content_key);
CREATE INDEX IF NOT EXISTS idx_cc_ai_cache_moderation ON cc_ai_content_cache(moderation_status);
CREATE INDEX IF NOT EXISTS idx_cc_ai_cache_expires ON cc_ai_content_cache(expires_at);

-- Enable RLS
ALTER TABLE cc_ai_content_cache ENABLE ROW LEVEL SECURITY;

-- Policy to allow reading approved content
DROP POLICY IF EXISTS "Approved content is viewable" ON cc_ai_content_cache;
CREATE POLICY "Approved content is viewable" ON cc_ai_content_cache
    FOR SELECT USING (moderation_status = 'approved' OR moderation_status = 'pending');

-- Policy for inserting new content (backend service)
DROP POLICY IF EXISTS "Service can insert content" ON cc_ai_content_cache;
CREATE POLICY "Service can insert content" ON cc_ai_content_cache
    FOR INSERT WITH CHECK (true);

-- Policy for updating content (moderation)
DROP POLICY IF EXISTS "Service can update content" ON cc_ai_content_cache;
CREATE POLICY "Service can update content" ON cc_ai_content_cache
    FOR UPDATE USING (true);

-- Update trigger
CREATE TRIGGER update_cc_ai_content_cache_updated_at BEFORE UPDATE ON cc_ai_content_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- Function to get or generate content
-- ================================================================
CREATE OR REPLACE FUNCTION cc_get_cached_content(
    p_content_key VARCHAR
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
    AND (moderation_status = 'approved' OR moderation_status = 'pending')
    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    ORDER BY created_at DESC
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
-- Function to store AI generated content
-- ================================================================
CREATE OR REPLACE FUNCTION cc_store_ai_content(
    p_industry_code VARCHAR,
    p_content_type VARCHAR,
    p_content_key VARCHAR,
    p_content_data JSONB,
    p_ai_model VARCHAR DEFAULT 'azure-gpt-4',
    p_expires_days INTEGER DEFAULT 30
) RETURNS UUID AS $$
DECLARE
    v_content_id UUID;
BEGIN
    INSERT INTO cc_ai_content_cache (
        industry_code,
        content_type,
        content_key,
        content_data,
        ai_model,
        expires_at,
        moderation_status
    ) VALUES (
        p_industry_code,
        p_content_type,
        p_content_key,
        p_content_data,
        p_ai_model,
        CURRENT_TIMESTAMP + (p_expires_days || ' days')::INTERVAL,
        'pending'
    )
    ON CONFLICT (content_key)
    DO UPDATE SET
        content_data = EXCLUDED.content_data,
        ai_model = EXCLUDED.ai_model,
        expires_at = EXCLUDED.expires_at,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_content_id;

    RETURN v_content_id;
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
-- Verification
-- ================================================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_ai_content_cache') THEN
        RAISE NOTICE '✅ AI Content Cache table created successfully';
        RAISE NOTICE 'You can now use Azure AI models to generate:';
        RAISE NOTICE '  - Dynamic challenges';
        RAISE NOTICE '  - New role cards';
        RAISE NOTICE '  - Industry-specific synergies';
        RAISE NOTICE '  - Complete industry packs';
    ELSE
        RAISE NOTICE '❌ Failed to create AI Content Cache table';
    END IF;
END $$;

-- Quick check
SELECT
    'cc_ai_content_cache' as table_name,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cc_ai_content_cache') as exists;