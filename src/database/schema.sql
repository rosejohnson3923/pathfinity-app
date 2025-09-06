-- PostgreSQL Schema for Question Type Analysis
-- Focus: Capturing raw data to identify true_false detection issues

-- 1. Analysis runs tracking
CREATE TABLE IF NOT EXISTS analysis_runs (
    id SERIAL PRIMARY KEY,
    run_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    run_type VARCHAR(50), -- 'before_fix' or 'after_fix'
    question_type_focus VARCHAR(100), -- 'true_false', 'counting', etc.
    fix_description TEXT,
    git_commit_hash VARCHAR(255)
);

-- 2. Main capture table for ALL raw responses
CREATE TABLE IF NOT EXISTS raw_data_captures (
    id SERIAL PRIMARY KEY,
    capture_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analysis_run_id INTEGER REFERENCES analysis_runs(id),
    session_id VARCHAR(255),
    user_id VARCHAR(255),
    
    -- Context fields (what was requested)
    requested_grade VARCHAR(50),
    requested_subject VARCHAR(100),
    requested_skill VARCHAR(255),
    requested_container_type VARCHAR(50),
    requested_career VARCHAR(255),
    requested_character VARCHAR(100),
    
    -- Source information
    source_service VARCHAR(255), -- 'AILearningJourneyService', 'JITService', etc.
    source_method VARCHAR(255),  -- 'generateLearnContent', 'detectType', etc.
    
    -- Raw data storage (JSONB for flexibility)
    raw_request JSONB,      -- Exact request sent
    raw_response JSONB,     -- Exact response received
    raw_context JSONB,      -- Any context data (user, profile, etc.)
    
    -- Tracking
    has_error BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    processing_time_ms INTEGER
);

-- 3. Question type analysis for systematic testing
CREATE TABLE IF NOT EXISTS question_type_analysis (
    id SERIAL PRIMARY KEY,
    analysis_run_id INTEGER REFERENCES analysis_runs(id),
    capture_id INTEGER REFERENCES raw_data_captures(id),
    question_type VARCHAR(100),
    
    -- Test parameters
    test_grade VARCHAR(50),
    test_subject VARCHAR(100),
    test_skill VARCHAR(255),
    test_container VARCHAR(50),
    
    -- Capture points (before/after at each stage)
    stage_1_ai_request JSONB,      -- What we sent to AI
    stage_2_ai_response JSONB,     -- What AI returned
    stage_3_type_detected VARCHAR(100), -- What type was detected
    stage_4_converted_question JSONB,   -- After conversion
    stage_5_rendered_question JSONB,    -- What renderer received
    stage_6_validation_input JSONB,     -- What validator received
    stage_7_validation_result JSONB,    -- Validation output
    
    -- Key field tracking
    question_text TEXT,
    detected_type_by_ai VARCHAR(100),
    detected_type_by_validator VARCHAR(100),
    detected_type_by_converter VARCHAR(100),
    final_type_used VARCHAR(100),
    
    -- Problems found
    type_mismatch BOOLEAN,
    field_missing TEXT[],
    unexpected_transformation TEXT
);

-- 4. Type detection events (critical for true_false vs counting issue)
CREATE TABLE IF NOT EXISTS type_detection_captures (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    capture_id INTEGER REFERENCES raw_data_captures(id),
    
    -- Input to detection
    input_text TEXT,
    input_object JSONB,
    
    -- Detection process
    detection_service VARCHAR(255),
    detection_method VARCHAR(255),
    detection_order INTEGER, -- Which check ran first, second, etc.
    
    -- Results
    detected_type VARCHAR(100),
    detection_rule_used TEXT,
    confidence_score FLOAT,
    
    -- Conflicts
    alternative_type_detected VARCHAR(100),
    conflict_reason TEXT
);

-- 5. True/False specific analysis
CREATE TABLE IF NOT EXISTS true_false_analysis (
    id SERIAL PRIMARY KEY,
    capture_id INTEGER REFERENCES raw_data_captures(id),
    
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
    detection_service_path TEXT[], -- Services it went through
    
    -- Correct answer format
    correct_answer_field_name VARCHAR(100),
    correct_answer_type VARCHAR(50),
    correct_answer_value TEXT
);

-- Create indexes for analysis queries
CREATE INDEX idx_captures_timestamp ON raw_data_captures(capture_timestamp);
CREATE INDEX idx_captures_analysis_run ON raw_data_captures(analysis_run_id);
CREATE INDEX idx_captures_grade ON raw_data_captures(requested_grade);
CREATE INDEX idx_captures_subject ON raw_data_captures(requested_subject);
CREATE INDEX idx_captures_service ON raw_data_captures(source_service);
CREATE INDEX idx_type_analysis_run ON question_type_analysis(analysis_run_id);
CREATE INDEX idx_type_analysis_type ON question_type_analysis(question_type);
CREATE INDEX idx_detection_type ON type_detection_captures(detected_type);
CREATE INDEX idx_true_false_misdetection ON true_false_analysis(initially_detected_as);

-- Analysis views for quick insights
CREATE OR REPLACE VIEW true_false_misdetections AS
SELECT 
    tfa.grade,
    tfa.subject,
    tfa.question_text,
    tfa.initially_detected_as,
    tfa.misdetection_reason,
    rdc.source_service,
    rdc.source_method
FROM true_false_analysis tfa
JOIN raw_data_captures rdc ON tfa.capture_id = rdc.id
WHERE tfa.question_starts_with_true_false = true
  AND tfa.initially_detected_as != 'true_false';

CREATE OR REPLACE VIEW detection_order_issues AS
SELECT 
    tdc.detected_type,
    tdc.detection_order,
    tdc.detection_rule_used,
    tdc.input_text
FROM type_detection_captures tdc
WHERE tdc.input_text ILIKE 'true or false:%'
ORDER BY tdc.detection_order;