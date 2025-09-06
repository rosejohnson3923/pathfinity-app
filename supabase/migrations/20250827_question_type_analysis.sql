-- Migration for Question Type Analysis Tables
-- This captures raw data for analyzing why true_false questions are detected as counting

-- 1. Analysis runs tracking
CREATE TABLE IF NOT EXISTS analysis_runs (
    id SERIAL PRIMARY KEY,
    run_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    run_type VARCHAR(50), -- 'before_fix' or 'after_fix'
    question_type_focus VARCHAR(100), -- 'true_false', 'counting', etc.
    fix_description TEXT,
    git_commit_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Main capture table for ALL raw responses
CREATE TABLE IF NOT EXISTS raw_data_captures (
    id SERIAL PRIMARY KEY,
    capture_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analysis_run_id INTEGER REFERENCES analysis_runs(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    user_id UUID,
    
    -- Context fields (what was requested)
    requested_grade VARCHAR(50),
    requested_subject VARCHAR(100),
    requested_skill VARCHAR(255),
    requested_container_type VARCHAR(50),
    requested_career VARCHAR(255),
    requested_character VARCHAR(100),
    
    -- Source information
    source_service VARCHAR(255),
    source_method VARCHAR(255),
    
    -- Raw data storage (JSONB for flexibility)
    raw_request JSONB,
    raw_response JSONB,
    raw_context JSONB,
    
    -- Tracking
    has_error BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    processing_time_ms INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Question type analysis for systematic testing
CREATE TABLE IF NOT EXISTS question_type_analysis (
    id SERIAL PRIMARY KEY,
    analysis_run_id INTEGER REFERENCES analysis_runs(id) ON DELETE CASCADE,
    capture_id INTEGER REFERENCES raw_data_captures(id) ON DELETE CASCADE,
    question_type VARCHAR(100),
    
    -- Test parameters
    test_grade VARCHAR(50),
    test_subject VARCHAR(100),
    test_skill VARCHAR(255),
    test_container VARCHAR(50),
    
    -- Capture points (before/after at each stage)
    stage_1_ai_request JSONB,
    stage_2_ai_response JSONB,
    stage_3_type_detected VARCHAR(100),
    stage_4_converted_question JSONB,
    stage_5_rendered_question JSONB,
    stage_6_validation_input JSONB,
    stage_7_validation_result JSONB,
    
    -- Key field tracking
    question_text TEXT,
    detected_type_by_ai VARCHAR(100),
    detected_type_by_validator VARCHAR(100),
    detected_type_by_converter VARCHAR(100),
    final_type_used VARCHAR(100),
    
    -- Problems found
    type_mismatch BOOLEAN DEFAULT FALSE,
    field_missing TEXT[],
    unexpected_transformation TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Type detection events (critical for true_false vs counting issue)
CREATE TABLE IF NOT EXISTS type_detection_captures (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    capture_id INTEGER REFERENCES raw_data_captures(id) ON DELETE CASCADE,
    
    -- Input to detection
    input_text TEXT,
    input_object JSONB,
    
    -- Detection process
    detection_service VARCHAR(255),
    detection_method VARCHAR(255),
    detection_order INTEGER,
    
    -- Results
    detected_type VARCHAR(100),
    detection_rule_used TEXT,
    confidence_score FLOAT,
    
    -- Conflicts
    alternative_type_detected VARCHAR(100),
    conflict_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. True/False specific analysis
CREATE TABLE IF NOT EXISTS true_false_analysis (
    id SERIAL PRIMARY KEY,
    capture_id INTEGER REFERENCES raw_data_captures(id) ON DELETE CASCADE,
    
    -- Question content
    question_starts_with_true_false BOOLEAN,
    question_text TEXT,
    has_visual_field BOOLEAN,
    visual_content TEXT,
    
    -- Grade/Subject context
    grade VARCHAR(50),
    subject VARCHAR(100),
    
    -- Detection results
    initially_detected_as VARCHAR(100),
    finally_rendered_as VARCHAR(100),
    
    -- Why it was misdetected
    misdetection_reason TEXT,
    detection_service_path TEXT[],
    
    -- Correct answer format
    correct_answer_field_name VARCHAR(100),
    correct_answer_type VARCHAR(50),
    correct_answer_value TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for analysis queries
CREATE INDEX IF NOT EXISTS idx_captures_timestamp ON raw_data_captures(capture_timestamp);
CREATE INDEX IF NOT EXISTS idx_captures_analysis_run ON raw_data_captures(analysis_run_id);
CREATE INDEX IF NOT EXISTS idx_captures_grade ON raw_data_captures(requested_grade);
CREATE INDEX IF NOT EXISTS idx_captures_subject ON raw_data_captures(requested_subject);
CREATE INDEX IF NOT EXISTS idx_captures_service ON raw_data_captures(source_service);
CREATE INDEX IF NOT EXISTS idx_type_analysis_run ON question_type_analysis(analysis_run_id);
CREATE INDEX IF NOT EXISTS idx_type_analysis_type ON question_type_analysis(question_type);
CREATE INDEX IF NOT EXISTS idx_detection_type ON type_detection_captures(detected_type);
CREATE INDEX IF NOT EXISTS idx_true_false_misdetection ON true_false_analysis(initially_detected_as);

-- Analysis views for quick insights
CREATE OR REPLACE VIEW true_false_misdetections AS
SELECT 
    tfa.id,
    tfa.grade,
    tfa.subject,
    tfa.question_text,
    tfa.initially_detected_as,
    tfa.misdetection_reason,
    rdc.source_service,
    rdc.source_method,
    rdc.analysis_run_id,
    ar.run_type,
    ar.question_type_focus
FROM true_false_analysis tfa
JOIN raw_data_captures rdc ON tfa.capture_id = rdc.id
LEFT JOIN analysis_runs ar ON rdc.analysis_run_id = ar.id
WHERE tfa.question_starts_with_true_false = true
  AND tfa.initially_detected_as != 'true_false';

CREATE OR REPLACE VIEW detection_order_issues AS
SELECT 
    tdc.detected_type,
    tdc.detection_order,
    tdc.detection_rule_used,
    tdc.input_text,
    rdc.requested_grade,
    rdc.requested_subject
FROM type_detection_captures tdc
JOIN raw_data_captures rdc ON tdc.capture_id = rdc.id
WHERE tdc.input_text ILIKE 'true or false:%'
ORDER BY tdc.detection_order;

-- Grant permissions (adjust based on your Supabase setup)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;