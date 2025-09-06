-- ============================================
-- AI Content Storage & Question Type Management
-- ============================================
-- This migration creates tables for storing AI-generated content
-- with proper validation and type safety for all 15 question types

-- 1. AI Generated Content Storage (Raw AI Responses)
CREATE TABLE IF NOT EXISTS ai_generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Content Identity (unique combination)
    student_grade VARCHAR(10) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    skill_code VARCHAR(100) NOT NULL,
    skill_name TEXT,
    career VARCHAR(100),
    character_id VARCHAR(50),
    container_type VARCHAR(20) NOT NULL CHECK (container_type IN ('learn', 'experience', 'discover')),
    
    -- Raw AI Response
    ai_request JSONB NOT NULL,           -- Exact request sent to AI
    ai_response JSONB NOT NULL,          -- Exact response from AI
    ai_model VARCHAR(50) NOT NULL,       -- Model used (gpt-4, etc.)
    ai_provider VARCHAR(50) DEFAULT 'azure', -- azure, openai, etc.
    
    -- Generation Metrics
    generation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generation_time_ms INTEGER,
    prompt_tokens INTEGER,
    completion_tokens INTEGER,
    total_tokens INTEGER,
    cost_estimate DECIMAL(10,4),
    
    -- Validation Status
    validation_status VARCHAR(20) DEFAULT 'pending',
    validation_errors JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint for content identity
    UNIQUE(tenant_id, student_grade, subject, skill_code, career, container_type)
);

-- 2. Validated Content Cache (Processed & Type-Safe)
CREATE TABLE IF NOT EXISTS content_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_content_id UUID REFERENCES ai_generated_content(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Content Identity (denormalized for fast lookup)
    student_grade VARCHAR(10) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    skill_code VARCHAR(100) NOT NULL,
    career VARCHAR(100),
    container_type VARCHAR(20) NOT NULL,
    
    -- Processed Content (guaranteed structure)
    intro JSONB,                         -- Introduction content
    practice_questions JSONB[],          -- Array of validated practice questions
    assessment_question JSONB,           -- Single assessment question
    
    -- Validation Metadata
    validation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type_corrections JSONB[],            -- Track what we fixed
    validation_score DECIMAL(5,2),       -- Quality score 0-100
    
    -- Performance Tracking
    processing_time_ms INTEGER,
    last_accessed TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    avg_completion_time_ms INTEGER,
    
    -- Caching
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    is_stale BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Index for fast lookups
    UNIQUE(tenant_id, student_grade, subject, skill_code, career, container_type)
);

-- 3. Question Type Registry (All 15 Types)
CREATE TABLE IF NOT EXISTS question_types (
    id VARCHAR(50) PRIMARY KEY,
    display_name TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Grade Level Availability
    min_grade VARCHAR(10),
    max_grade VARCHAR(10),
    grade_restrictions JSONB,  -- Specific restrictions per grade
    
    -- Subject Suitability
    suitable_subjects TEXT[],
    unsuitable_subjects TEXT[],
    
    -- Validation Rules
    required_fields TEXT[] NOT NULL,
    optional_fields TEXT[],
    validation_schema JSONB NOT NULL,
    
    -- Rendering Information
    ui_component VARCHAR(100) NOT NULL,
    supports_media BOOLEAN DEFAULT FALSE,
    supports_visual BOOLEAN DEFAULT FALSE,
    
    -- Complexity
    cognitive_level VARCHAR(50), -- remember, understand, apply, analyze, evaluate, create
    estimated_time_seconds INTEGER,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all 15 question types
INSERT INTO question_types (id, display_name, category, required_fields, validation_schema, ui_component) VALUES
('multiple_choice', 'Multiple Choice', 'selection', ARRAY['question', 'options', 'correctAnswer'], '{"type": "object"}', 'MultipleChoiceRenderer'),
('true_false', 'True/False', 'binary', ARRAY['question', 'correctAnswer'], '{"type": "object"}', 'TrueFalseRenderer'),
('short_answer', 'Short Answer', 'text', ARRAY['question', 'correctAnswer'], '{"type": "object"}', 'ShortAnswerRenderer'),
('fill_blank', 'Fill in the Blank', 'completion', ARRAY['question', 'blanks', 'correctAnswers'], '{"type": "object"}', 'FillBlankRenderer'),
('matching', 'Matching', 'association', ARRAY['question', 'pairs'], '{"type": "object"}', 'MatchingRenderer'),
('sequencing', 'Sequencing', 'ordering', ARRAY['question', 'items', 'correctOrder'], '{"type": "object"}', 'SequencingRenderer'),
('numeric', 'Numeric', 'calculation', ARRAY['question', 'correctAnswer', 'tolerance'], '{"type": "object"}', 'NumericRenderer'),
('counting', 'Counting', 'visual', ARRAY['question', 'visual', 'correctAnswer'], '{"type": "object"}', 'CountingRenderer'),
('drawing', 'Drawing', 'creative', ARRAY['question', 'canvas'], '{"type": "object"}', 'DrawingRenderer'),
('coding', 'Coding', 'programming', ARRAY['question', 'starterCode', 'testCases'], '{"type": "object"}', 'CodingRenderer'),
('true_false_w_image', 'True/False with Image', 'binary', ARRAY['question', 'image', 'correctAnswer'], '{"type": "object"}', 'TrueFalseImageRenderer'),
('true_false_wo_image', 'True/False without Image', 'binary', ARRAY['question', 'correctAnswer'], '{"type": "object"}', 'TrueFalseRenderer'),
('visual_pattern', 'Visual Pattern', 'pattern', ARRAY['question', 'pattern', 'correctAnswer'], '{"type": "object"}', 'VisualPatternRenderer'),
('word_problem', 'Word Problem', 'problem_solving', ARRAY['question', 'context', 'correctAnswer'], '{"type": "object"}', 'WordProblemRenderer'),
('creative_writing', 'Creative Writing', 'open_ended', ARRAY['question', 'prompt', 'rubric'], '{"type": "object"}', 'CreativeWritingRenderer');

-- 4. Question Validation Log (Track Every Question)
CREATE TABLE IF NOT EXISTS question_validation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_cache_id UUID REFERENCES content_cache(id) ON DELETE CASCADE,
    
    -- Question Identity
    container_type VARCHAR(20) NOT NULL,
    question_index INTEGER NOT NULL,
    question_phase VARCHAR(20) NOT NULL, -- 'practice' or 'assessment'
    
    -- Original vs Corrected
    original_type VARCHAR(50),
    detected_type VARCHAR(50),
    final_type VARCHAR(50) REFERENCES question_types(id),
    
    -- Question Content
    question_text TEXT,
    original_question JSONB,
    validated_question JSONB,
    
    -- Validation Results
    type_mismatch BOOLEAN DEFAULT FALSE,
    missing_fields TEXT[],
    extra_fields TEXT[],
    validation_errors JSONB[],
    auto_corrections JSONB[],
    
    -- Why it was detected as what
    detection_rules_applied TEXT[],
    detection_confidence DECIMAL(3,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Content Generation Queue (Pre-generation)
CREATE TABLE IF NOT EXISTS content_generation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- What to generate
    skill_code VARCHAR(100) NOT NULL,
    skill_name TEXT,
    subject VARCHAR(50) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    career VARCHAR(100),
    container_type VARCHAR(20) NOT NULL,
    
    -- Priority & Status
    priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
    status VARCHAR(20) DEFAULT 'pending', -- pending, generating, completed, failed
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- Timing
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results
    content_cache_id UUID REFERENCES content_cache(id),
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Question Type Usage Analytics
CREATE TABLE IF NOT EXISTS question_type_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    question_type VARCHAR(50) REFERENCES question_types(id),
    grade VARCHAR(10),
    subject VARCHAR(50),
    container_type VARCHAR(20),
    
    -- Usage Metrics
    times_generated INTEGER DEFAULT 0,
    times_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    avg_time_to_answer_ms INTEGER,
    
    -- Quality Metrics
    validation_failures INTEGER DEFAULT 0,
    type_misdetections INTEGER DEFAULT 0,
    user_reported_issues INTEGER DEFAULT 0,
    
    -- Date tracking
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Composite key for daily aggregation
    UNIQUE(tenant_id, question_type, grade, subject, container_type, date)
);

-- 7. Test Scenarios for Taylor (Grade 10)
CREATE TABLE IF NOT EXISTS test_scenarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    test_name VARCHAR(100) NOT NULL,
    student_name VARCHAR(50) DEFAULT 'Taylor',
    grade VARCHAR(10) DEFAULT '10',
    
    -- Test Configuration
    subjects TEXT[] DEFAULT ARRAY['Math', 'ELA', 'Science', 'Social Studies'],
    question_types_to_test TEXT[] DEFAULT ARRAY[
        'multiple_choice', 'true_false', 'short_answer', 'fill_blank', 'matching',
        'sequencing', 'numeric', 'counting', 'drawing', 'coding',
        'true_false_w_image', 'true_false_wo_image', 'visual_pattern',
        'word_problem', 'creative_writing'
    ],
    containers_to_test TEXT[] DEFAULT ARRAY['learn', 'experience', 'discover'],
    
    -- Test Status
    status VARCHAR(20) DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Results
    total_tests INTEGER,
    passed_tests INTEGER,
    failed_tests INTEGER,
    test_results JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES for performance
CREATE INDEX idx_ai_content_identity ON ai_generated_content(student_grade, subject, skill_code, container_type);
CREATE INDEX idx_content_cache_lookup ON content_cache(student_grade, subject, skill_code, container_type);
CREATE INDEX idx_content_cache_accessed ON content_cache(last_accessed DESC);
CREATE INDEX idx_generation_queue_status ON content_generation_queue(status, priority);
CREATE INDEX idx_validation_log_type ON question_validation_log(original_type, final_type);
CREATE INDEX idx_analytics_date ON question_type_analytics(date DESC);

-- VIEWS for analysis
CREATE OR REPLACE VIEW question_type_misdetections AS
SELECT 
    qvl.original_type,
    qvl.detected_type,
    qvl.final_type,
    COUNT(*) as occurrences,
    cc.student_grade,
    cc.subject,
    cc.container_type
FROM question_validation_log qvl
JOIN content_cache cc ON qvl.content_cache_id = cc.id
WHERE qvl.type_mismatch = true
GROUP BY qvl.original_type, qvl.detected_type, qvl.final_type, 
         cc.student_grade, cc.subject, cc.container_type
ORDER BY occurrences DESC;

CREATE OR REPLACE VIEW content_generation_performance AS
SELECT 
    DATE(generation_timestamp) as date,
    ai_model,
    container_type,
    AVG(generation_time_ms) as avg_generation_time,
    AVG(total_tokens) as avg_tokens,
    AVG(cost_estimate) as avg_cost,
    COUNT(*) as generations
FROM ai_generated_content
GROUP BY DATE(generation_timestamp), ai_model, container_type
ORDER BY date DESC;

-- Function to validate question structure
CREATE OR REPLACE FUNCTION validate_question_structure(
    question JSONB,
    question_type VARCHAR
) RETURNS JSONB AS $$
DECLARE
    required_fields TEXT[];
    missing_fields TEXT[] := '{}';
    field TEXT;
BEGIN
    -- Get required fields for this question type
    SELECT qt.required_fields INTO required_fields
    FROM question_types qt
    WHERE qt.id = question_type;
    
    -- Check each required field
    FOREACH field IN ARRAY required_fields
    LOOP
        IF NOT question ? field THEN
            missing_fields := array_append(missing_fields, field);
        END IF;
    END LOOP;
    
    -- Return validation result
    RETURN jsonb_build_object(
        'is_valid', cardinality(missing_fields) = 0,
        'missing_fields', missing_fields,
        'question_type', question_type
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger to update access count and timestamp
CREATE OR REPLACE FUNCTION update_content_access() RETURNS TRIGGER AS $$
BEGIN
    NEW.last_accessed = NOW();
    NEW.access_count = OLD.access_count + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_cache_access_trigger
    BEFORE UPDATE ON content_cache
    FOR EACH ROW
    WHEN (OLD.access_count IS DISTINCT FROM NEW.access_count)
    EXECUTE FUNCTION update_content_access();