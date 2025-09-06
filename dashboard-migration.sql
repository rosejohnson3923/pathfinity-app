-- Migration: 20250827_question_type_analysis.sql
-- Purpose: Create analysis tables for question type monitoring and debugging
-- Date: 2025-08-27

-- ================================================================
-- ANALYSIS RUNS
-- ================================================================

CREATE TABLE IF NOT EXISTS analysis_runs (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_name VARCHAR(200),
    run_type VARCHAR(50) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'running',
    total_questions INTEGER DEFAULT 0,
    correct_detections INTEGER DEFAULT 0,
    misdetections INTEGER DEFAULT 0,
    detection_rate DECIMAL(5,2),
    metadata JSONB DEFAULT '{}',
    created_by VARCHAR(100),
    CONSTRAINT valid_status CHECK (status IN ('running', 'completed', 'failed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_analysis_runs_status ON analysis_runs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_date ON analysis_runs(started_at DESC);

-- ================================================================
-- RAW DATA CAPTURES
-- ================================================================

CREATE TABLE IF NOT EXISTS raw_data_captures (
    capture_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_run_id UUID REFERENCES analysis_runs(run_id),
    question_text TEXT NOT NULL,
    original_type VARCHAR(50),
    ai_generated_type VARCHAR(50),
    detected_type VARCHAR(50),
    grade_level VARCHAR(20),
    subject VARCHAR(100),
    container_type VARCHAR(50),
    student_id VARCHAR(100),
    capture_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raw_ai_response JSONB,
    processing_time_ms INTEGER,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_raw_captures_run ON raw_data_captures(analysis_run_id);
CREATE INDEX IF NOT EXISTS idx_raw_captures_type ON raw_data_captures(detected_type);
CREATE INDEX IF NOT EXISTS idx_raw_captures_student ON raw_data_captures(student_id);

-- ================================================================
-- TYPE DETECTION CAPTURES (Already exists, enhancing)
-- ================================================================

-- Add columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'type_detection_captures' 
                   AND column_name = 'detection_method') THEN
        ALTER TABLE type_detection_captures 
        ADD COLUMN detection_method VARCHAR(50) DEFAULT 'rule_based';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'type_detection_captures' 
                   AND column_name = 'confidence_score') THEN
        ALTER TABLE type_detection_captures 
        ADD COLUMN confidence_score DECIMAL(3,2);
    END IF;
END $$;

-- ================================================================
-- TRUE/FALSE ANALYSIS
-- ================================================================

CREATE TABLE IF NOT EXISTS true_false_analysis (
    analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_run_id UUID REFERENCES analysis_runs(run_id),
    question_text TEXT NOT NULL,
    detected_as VARCHAR(50),
    should_be_true_false BOOLEAN,
    detection_correct BOOLEAN,
    has_true_false_keywords BOOLEAN,
    has_options BOOLEAN,
    option_count INTEGER,
    contains_true_option BOOLEAN,
    contains_false_option BOOLEAN,
    pattern_matched VARCHAR(200),
    grade_level VARCHAR(20),
    subject VARCHAR(100),
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_tf_analysis_run ON true_false_analysis(analysis_run_id);
CREATE INDEX IF NOT EXISTS idx_tf_analysis_correct ON true_false_analysis(detection_correct);

-- ================================================================
-- MISDETECTION PATTERNS
-- ================================================================

CREATE TABLE IF NOT EXISTS misdetection_patterns (
    pattern_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_name VARCHAR(200) NOT NULL,
    from_type VARCHAR(50),
    to_type VARCHAR(50),
    frequency INTEGER DEFAULT 1,
    example_questions TEXT[],
    common_keywords TEXT[],
    grade_levels VARCHAR(20)[],
    subjects VARCHAR(100)[],
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_resolved BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_misdetection_types ON misdetection_patterns(from_type, to_type);
CREATE INDEX IF NOT EXISTS idx_misdetection_resolved ON misdetection_patterns(is_resolved);

-- ================================================================
-- PERFORMANCE METRICS
-- ================================================================

CREATE TABLE IF NOT EXISTS detection_performance_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE DEFAULT CURRENT_DATE,
    metric_hour INTEGER DEFAULT EXTRACT(HOUR FROM CURRENT_TIMESTAMP),
    question_type VARCHAR(50),
    total_detections INTEGER DEFAULT 0,
    correct_detections INTEGER DEFAULT 0,
    false_positives INTEGER DEFAULT 0,
    false_negatives INTEGER DEFAULT 0,
    avg_confidence DECIMAL(3,2),
    avg_detection_time_ms INTEGER,
    precision_score DECIMAL(3,2),
    recall_score DECIMAL(3,2),
    f1_score DECIMAL(3,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date, metric_hour, question_type)
);

CREATE INDEX IF NOT EXISTS idx_perf_metrics_date ON detection_performance_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_type ON detection_performance_metrics(question_type);

-- ================================================================
-- STORED PROCEDURES FOR ANALYSIS
-- ================================================================

-- Function to start an analysis run
CREATE OR REPLACE FUNCTION start_analysis_run(
    p_run_name VARCHAR,
    p_run_type VARCHAR,
    p_created_by VARCHAR DEFAULT 'system'
) RETURNS UUID AS $$
DECLARE
    v_run_id UUID;
BEGIN
    INSERT INTO analysis_runs (run_name, run_type, created_by, status)
    VALUES (p_run_name, p_run_type, p_created_by, 'running')
    RETURNING run_id INTO v_run_id;
    
    RETURN v_run_id;
END;
$$ LANGUAGE plpgsql;

-- Function to complete an analysis run
CREATE OR REPLACE FUNCTION complete_analysis_run(
    p_run_id UUID
) RETURNS VOID AS $$
BEGIN
    UPDATE analysis_runs
    SET completed_at = CURRENT_TIMESTAMP,
        status = 'completed',
        detection_rate = CASE 
            WHEN total_questions > 0 
            THEN (correct_detections::DECIMAL / total_questions * 100)
            ELSE 0 
        END
    WHERE run_id = p_run_id;
END;
$$ LANGUAGE plpgsql;

-- Function to analyze True/False detection
CREATE OR REPLACE FUNCTION analyze_true_false_detection(
    p_question_text TEXT,
    p_detected_type VARCHAR,
    p_grade_level VARCHAR,
    p_subject VARCHAR,
    p_run_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_analysis JSONB;
    v_keywords TEXT[] := ARRAY['true or false', 'true/false', 't/f', 't or f', 'true false'];
    v_has_keywords BOOLEAN;
    v_should_be_tf BOOLEAN;
    v_is_correct BOOLEAN;
BEGIN
    -- Check for keywords
    v_has_keywords := FALSE;
    FOR i IN 1..array_length(v_keywords, 1) LOOP
        IF LOWER(p_question_text) LIKE '%' || v_keywords[i] || '%' THEN
            v_has_keywords := TRUE;
            EXIT;
        END IF;
    END LOOP;
    
    -- Determine if it should be True/False
    v_should_be_tf := v_has_keywords;
    
    -- Check if detection was correct
    v_is_correct := (v_should_be_tf AND p_detected_type IN ('true_false', 'true_false_w_image', 'true_false_wo_image'))
                    OR (NOT v_should_be_tf AND p_detected_type NOT IN ('true_false', 'true_false_w_image', 'true_false_wo_image'));
    
    -- Build analysis JSON
    v_analysis := jsonb_build_object(
        'question_text', p_question_text,
        'detected_type', p_detected_type,
        'should_be_true_false', v_should_be_tf,
        'detection_correct', v_is_correct,
        'has_keywords', v_has_keywords,
        'grade_level', p_grade_level,
        'subject', p_subject
    );
    
    -- Store in analysis table if run_id provided
    IF p_run_id IS NOT NULL THEN
        INSERT INTO true_false_analysis (
            analysis_run_id,
            question_text,
            detected_as,
            should_be_true_false,
            detection_correct,
            has_true_false_keywords,
            grade_level,
            subject
        ) VALUES (
            p_run_id,
            p_question_text,
            p_detected_type,
            v_should_be_tf,
            v_is_correct,
            v_has_keywords,
            p_grade_level,
            p_subject
        );
    END IF;
    
    RETURN v_analysis;
END;
$$ LANGUAGE plpgsql;

-- Function to identify misdetection patterns
CREATE OR REPLACE FUNCTION identify_misdetection_patterns(
    p_days_back INTEGER DEFAULT 7
) RETURNS TABLE (
    pattern VARCHAR,
    from_type VARCHAR,
    to_type VARCHAR,
    frequency BIGINT,
    example TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CONCAT(tdc.expected_type, ' -> ', tdc.detected_type) as pattern,
        tdc.expected_type as from_type,
        tdc.detected_type as to_type,
        COUNT(*) as frequency,
        MIN(tdc.question_text) as example
    FROM type_detection_captures tdc
    WHERE tdc.is_correct = false
        AND tdc.created_at > CURRENT_TIMESTAMP - INTERVAL '1 day' * p_days_back
    GROUP BY tdc.expected_type, tdc.detected_type
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate performance metrics
CREATE OR REPLACE FUNCTION calculate_detection_metrics(
    p_question_type VARCHAR,
    p_date DATE DEFAULT CURRENT_DATE
) RETURNS JSONB AS $$
DECLARE
    v_metrics JSONB;
    v_total INTEGER;
    v_correct INTEGER;
    v_false_pos INTEGER;
    v_false_neg INTEGER;
    v_precision DECIMAL;
    v_recall DECIMAL;
    v_f1 DECIMAL;
BEGIN
    -- Get counts
    SELECT 
        COUNT(*),
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)
    INTO v_total, v_correct
    FROM type_detection_captures
    WHERE DATE(created_at) = p_date
        AND (detected_type = p_question_type OR expected_type = p_question_type);
    
    -- Calculate false positives and negatives
    SELECT COUNT(*) INTO v_false_pos
    FROM type_detection_captures
    WHERE DATE(created_at) = p_date
        AND detected_type = p_question_type
        AND expected_type != p_question_type;
    
    SELECT COUNT(*) INTO v_false_neg
    FROM type_detection_captures
    WHERE DATE(created_at) = p_date
        AND detected_type != p_question_type
        AND expected_type = p_question_type;
    
    -- Calculate precision, recall, F1
    IF (v_correct + v_false_pos) > 0 THEN
        v_precision := v_correct::DECIMAL / (v_correct + v_false_pos);
    ELSE
        v_precision := 0;
    END IF;
    
    IF (v_correct + v_false_neg) > 0 THEN
        v_recall := v_correct::DECIMAL / (v_correct + v_false_neg);
    ELSE
        v_recall := 0;
    END IF;
    
    IF (v_precision + v_recall) > 0 THEN
        v_f1 := 2 * (v_precision * v_recall) / (v_precision + v_recall);
    ELSE
        v_f1 := 0;
    END IF;
    
    v_metrics := jsonb_build_object(
        'question_type', p_question_type,
        'date', p_date,
        'total_detections', v_total,
        'correct_detections', v_correct,
        'false_positives', v_false_pos,
        'false_negatives', v_false_neg,
        'precision', ROUND(v_precision, 2),
        'recall', ROUND(v_recall, 2),
        'f1_score', ROUND(v_f1, 2)
    );
    
    -- Store in metrics table
    INSERT INTO detection_performance_metrics (
        metric_date,
        metric_hour,
        question_type,
        total_detections,
        correct_detections,
        false_positives,
        false_negatives,
        precision_score,
        recall_score,
        f1_score
    ) VALUES (
        p_date,
        EXTRACT(HOUR FROM CURRENT_TIMESTAMP),
        p_question_type,
        v_total,
        v_correct,
        v_false_pos,
        v_false_neg,
        v_precision,
        v_recall,
        v_f1
    )
    ON CONFLICT (metric_date, metric_hour, question_type)
    DO UPDATE SET
        total_detections = EXCLUDED.total_detections,
        correct_detections = EXCLUDED.correct_detections,
        false_positives = EXCLUDED.false_positives,
        false_negatives = EXCLUDED.false_negatives,
        precision_score = EXCLUDED.precision_score,
        recall_score = EXCLUDED.recall_score,
        f1_score = EXCLUDED.f1_score;
    
    RETURN v_metrics;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- INITIAL DATA
-- ================================================================

-- Create initial analysis run for testing
INSERT INTO analysis_runs (run_name, run_type, created_by)
VALUES ('Initial System Analysis', 'comprehensive', 'system')
ON CONFLICT DO NOTHING;

-- ================================================================
-- PERMISSIONS (if needed)
-- ================================================================

-- GRANT ALL ON ALL TABLES IN SCHEMA public TO your_app_role;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_role;