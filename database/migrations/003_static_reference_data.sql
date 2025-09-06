-- ============================================
-- Static Reference Data Migration
-- ============================================
-- Move all static configuration data from source code to database
-- This includes question types, skill mappings, grade configurations, etc.

-- 1. Question Type Definitions (Currently hardcoded in source)
CREATE TABLE IF NOT EXISTS question_type_definitions (
    id VARCHAR(50) PRIMARY KEY,
    display_name TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- Grade Level Configuration
    min_grade INTEGER NOT NULL,
    max_grade INTEGER NOT NULL,
    grade_exceptions JSONB, -- Specific grade rules
    
    -- Subject Configuration
    suitable_subjects TEXT[],
    unsuitable_subjects TEXT[],
    subject_exceptions JSONB, -- Subject-specific rules
    
    -- Required Fields for Validation
    required_fields TEXT[] NOT NULL,
    optional_fields TEXT[],
    validation_schema JSONB NOT NULL,
    
    -- UI Configuration
    ui_component VARCHAR(100) NOT NULL,
    ui_config JSONB, -- Component-specific settings
    supports_media BOOLEAN DEFAULT FALSE,
    supports_visual BOOLEAN DEFAULT FALSE,
    supports_code BOOLEAN DEFAULT FALSE,
    
    -- Complexity & Timing
    cognitive_level VARCHAR(50), -- Bloom's taxonomy
    base_time_seconds INTEGER,
    time_multiplier_by_grade JSONB, -- {"1": 2.0, "10": 0.5}
    
    -- Detection Rules (CRITICAL for True/False vs Counting issue)
    detection_priority INTEGER NOT NULL DEFAULT 100, -- Lower = higher priority
    detection_patterns TEXT[], -- Regex patterns to match
    detection_keywords TEXT[], -- Keywords to look for
    detection_rules JSONB, -- Complex detection logic
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    is_experimental BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all 15 question types with proper detection priority
INSERT INTO question_type_definitions (
    id, display_name, category, min_grade, max_grade,
    suitable_subjects, required_fields, validation_schema,
    ui_component, detection_priority, detection_patterns
) VALUES
-- CRITICAL: True/False must have highest priority (lowest number)
('true_false', 'True/False', 'binary', 1, 12, 
 ARRAY['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Pre-calculus'],
 ARRAY['question', 'correctAnswer'], '{"type": "object"}',
 'TrueFalseRenderer', 10, -- HIGHEST PRIORITY
 ARRAY['^true or false:', '^true/false:', '^t/f:', '^is (this|it) true']),

('true_false_w_image', 'True/False with Image', 'binary', 1, 12,
 ARRAY['Math', 'Science', 'Social Studies'],
 ARRAY['question', 'image', 'correctAnswer'], '{"type": "object"}',
 'TrueFalseImageRenderer', 11,
 ARRAY['^true or false:.*image', 'image.*true or false']),

('true_false_wo_image', 'True/False without Image', 'binary', 1, 12,
 ARRAY['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Pre-calculus'],
 ARRAY['question', 'correctAnswer'], '{"type": "object"}',
 'TrueFalseRenderer', 12,
 ARRAY['^true or false:', '^is the following (true|false)']),

('multiple_choice', 'Multiple Choice', 'selection', 1, 12,
 ARRAY['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Pre-calculus'],
 ARRAY['question', 'options', 'correctAnswer'], '{"type": "object"}',
 'MultipleChoiceRenderer', 20,
 ARRAY['which of the following', 'choose the correct', 'select the best']),

('fill_blank', 'Fill in the Blank', 'completion', 2, 12,
 ARRAY['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Pre-calculus'],
 ARRAY['question', 'blanks', 'correctAnswers'], '{"type": "object"}',
 'FillBlankRenderer', 30,
 ARRAY['___+', '\[blank\]', 'fill in the blank']),

('matching', 'Matching', 'association', 3, 12,
 ARRAY['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Pre-calculus'],
 ARRAY['question', 'pairs'], '{"type": "object"}',
 'MatchingRenderer', 40,
 ARRAY['match the following', 'pair each', 'connect']),

('sequencing', 'Sequencing', 'ordering', 4, 12,
 ARRAY['Math', 'ELA', 'Science', 'Social Studies'],
 ARRAY['question', 'items', 'correctOrder'], '{"type": "object"}',
 'SequencingRenderer', 50,
 ARRAY['put in order', 'arrange', 'sequence', 'sort']),

('numeric', 'Numeric', 'calculation', 5, 12,
 ARRAY['Math', 'Science', 'Algebra 1', 'Pre-calculus'],
 ARRAY['question', 'correctAnswer', 'tolerance'], '{"type": "object"}',
 'NumericRenderer', 60,
 ARRAY['calculate', 'solve for', 'find the value', 'what is \d+']),

('short_answer', 'Short Answer', 'text', 3, 12,
 ARRAY['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Pre-calculus'],
 ARRAY['question', 'correctAnswer'], '{"type": "object"}',
 'ShortAnswerRenderer', 70,
 ARRAY['explain', 'describe', 'write', 'answer in .* words']),

('word_problem', 'Word Problem', 'problem_solving', 4, 12,
 ARRAY['Math', 'Science', 'Algebra 1', 'Pre-calculus'],
 ARRAY['question', 'context', 'correctAnswer'], '{"type": "object"}',
 'WordProblemRenderer', 80,
 ARRAY['a train travels', 'john has', 'if .* then']),

('visual_pattern', 'Visual Pattern', 'pattern', 3, 12,
 ARRAY['Math', 'Algebra 1', 'Pre-calculus'],
 ARRAY['question', 'pattern', 'correctAnswer'], '{"type": "object"}',
 'VisualPatternRenderer', 90,
 ARRAY['pattern', 'what comes next', 'complete the sequence']),

-- COUNTING: Should be LOWEST priority for Grade 10
('counting', 'Counting', 'visual', 1, 5, -- Only for Grades 1-5
 ARRAY['Math'],
 ARRAY['question', 'visual', 'correctAnswer'], '{"type": "object"}',
 'CountingRenderer', 100, -- LOWEST PRIORITY
 ARRAY['count the', 'how many', 'total number of']),

('drawing', 'Drawing', 'creative', 1, 12,
 ARRAY['Math', 'Science'],
 ARRAY['question', 'canvas'], '{"type": "object"}',
 'DrawingRenderer', 110,
 ARRAY['draw', 'sketch', 'illustrate']),

('coding', 'Coding', 'programming', 6, 12,
 ARRAY['Math', 'Science'],
 ARRAY['question', 'starterCode', 'testCases'], '{"type": "object"}',
 'CodingRenderer', 120,
 ARRAY['write a function', 'code', 'implement', 'program']),

('creative_writing', 'Creative Writing', 'open_ended', 6, 12,
 ARRAY['ELA', 'Social Studies'],
 ARRAY['question', 'prompt', 'rubric'], '{"type": "object"}',
 'CreativeWritingRenderer', 130,
 ARRAY['write an essay', 'compose', 'create a story']);

-- 2. Grade Configuration Table
CREATE TABLE IF NOT EXISTS grade_configurations (
    grade VARCHAR(10) PRIMARY KEY,
    grade_numeric INTEGER NOT NULL, -- For sorting
    grade_level VARCHAR(20) NOT NULL, -- Elementary, Middle, High
    
    -- Question Type Preferences
    preferred_question_types TEXT[],
    excluded_question_types TEXT[],
    
    -- Complexity Settings
    min_question_complexity INTEGER DEFAULT 1,
    max_question_complexity INTEGER DEFAULT 5,
    default_time_per_question INTEGER, -- seconds
    
    -- Subject Availability
    available_subjects TEXT[],
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO grade_configurations (grade, grade_numeric, grade_level, preferred_question_types, excluded_question_types, available_subjects) VALUES
('Pre-K', -1, 'Early', ARRAY['counting', 'true_false'], ARRAY['coding', 'creative_writing'], ARRAY['Math', 'ELA']),
('K', 0, 'Early', ARRAY['counting', 'true_false', 'multiple_choice'], ARRAY['coding', 'creative_writing'], ARRAY['Math', 'ELA']),
('1', 1, 'Elementary', ARRAY['counting', 'true_false', 'multiple_choice'], ARRAY['coding', 'creative_writing'], ARRAY['Math', 'ELA', 'Science']),
('2', 2, 'Elementary', ARRAY['counting', 'true_false', 'multiple_choice', 'fill_blank'], ARRAY['coding', 'creative_writing'], ARRAY['Math', 'ELA', 'Science']),
('3', 3, 'Elementary', ARRAY['multiple_choice', 'true_false', 'short_answer'], ARRAY['coding'], ARRAY['Math', 'ELA', 'Science', 'Social Studies']),
('4', 4, 'Elementary', ARRAY['multiple_choice', 'true_false', 'short_answer', 'word_problem'], ARRAY['coding'], ARRAY['Math', 'ELA', 'Science', 'Social Studies']),
('5', 5, 'Elementary', ARRAY['multiple_choice', 'true_false', 'short_answer', 'word_problem'], ARRAY['coding'], ARRAY['Math', 'ELA', 'Science', 'Social Studies']),
('6', 6, 'Middle', ARRAY['multiple_choice', 'short_answer', 'word_problem'], ARRAY['counting'], ARRAY['Math', 'ELA', 'Science', 'Social Studies']),
('7', 7, 'Middle', ARRAY['multiple_choice', 'short_answer', 'word_problem'], ARRAY['counting'], ARRAY['Math', 'ELA', 'Science', 'Social Studies']),
('8', 8, 'Middle', ARRAY['multiple_choice', 'short_answer', 'word_problem'], ARRAY['counting'], ARRAY['Math', 'ELA', 'Science', 'Social Studies']),
('9', 9, 'High', ARRAY['multiple_choice', 'short_answer', 'word_problem', 'coding'], ARRAY['counting'], ARRAY['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1']),
('10', 10, 'High', ARRAY['multiple_choice', 'short_answer', 'word_problem', 'coding', 'creative_writing'], ARRAY['counting'], ARRAY['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Pre-calculus']),
('11', 11, 'High', ARRAY['multiple_choice', 'short_answer', 'word_problem', 'coding', 'creative_writing'], ARRAY['counting'], ARRAY['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 2', 'Pre-calculus']),
('12', 12, 'High', ARRAY['multiple_choice', 'short_answer', 'word_problem', 'coding', 'creative_writing'], ARRAY['counting'], ARRAY['Math', 'ELA', 'Science', 'Social Studies', 'Calculus', 'Statistics']);

-- 3. Subject Configuration Table
CREATE TABLE IF NOT EXISTS subject_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_code VARCHAR(50) NOT NULL UNIQUE,
    subject_name TEXT NOT NULL,
    subject_category VARCHAR(50), -- Core, Advanced, Elective
    
    -- Grade Availability
    min_grade VARCHAR(10),
    max_grade VARCHAR(10),
    
    -- Question Type Preferences by Subject
    preferred_question_types TEXT[],
    excluded_question_types TEXT[],
    
    -- Skill Organization
    uses_skill_clusters BOOLEAN DEFAULT TRUE,
    cluster_naming_pattern TEXT, -- 'A.', 'Chapter 1', etc.
    
    -- Content Settings
    default_difficulty INTEGER DEFAULT 3,
    requires_visual_support BOOLEAN DEFAULT FALSE,
    requires_calculator BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO subject_configurations (subject_code, subject_name, subject_category, min_grade, max_grade, preferred_question_types) VALUES
('MATH', 'Math', 'Core', 'Pre-K', '12', ARRAY['multiple_choice', 'numeric', 'word_problem']),
('ELA', 'English Language Arts', 'Core', 'Pre-K', '12', ARRAY['multiple_choice', 'short_answer', 'creative_writing']),
('SCI', 'Science', 'Core', '1', '12', ARRAY['multiple_choice', 'short_answer', 'true_false']),
('SS', 'Social Studies', 'Core', '3', '12', ARRAY['multiple_choice', 'short_answer', 'matching']),
('ALG1', 'Algebra 1', 'Advanced', '8', '10', ARRAY['numeric', 'word_problem', 'multiple_choice']),
('PRECALC', 'Pre-calculus', 'Advanced', '10', '12', ARRAY['numeric', 'word_problem', 'coding']);

-- 4. Skills Master Table (Import from text files)
-- This replaces skillsDataComplete files
CREATE TABLE IF NOT EXISTS skills_master_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core Identity
    subject VARCHAR(50) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    skills_area TEXT NOT NULL,
    skills_cluster VARCHAR(10) NOT NULL,
    skill_number VARCHAR(20) NOT NULL,
    skill_name TEXT NOT NULL,
    
    -- Extended Metadata
    skill_description TEXT,
    prerequisites TEXT[],
    learning_objectives TEXT[],
    
    -- Difficulty & Timing
    difficulty_level INTEGER DEFAULT 3,
    estimated_time_minutes INTEGER DEFAULT 20,
    mastery_threshold INTEGER DEFAULT 80, -- percentage
    
    -- Question Type Associations
    recommended_question_types TEXT[],
    excluded_question_types TEXT[],
    
    -- Content Hints
    requires_visual BOOLEAN DEFAULT FALSE,
    requires_calculator BOOLEAN DEFAULT FALSE,
    requires_manipulatives BOOLEAN DEFAULT FALSE,
    
    -- Standards Alignment
    common_core_standard TEXT,
    state_standard TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_optional BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    source_file TEXT, -- Track where it was imported from
    import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(subject, grade, skill_number)
);

-- 5. Question Type Detection Rules (Solves the True/False vs Counting issue)
CREATE TABLE IF NOT EXISTS detection_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(100) NOT NULL,
    question_type VARCHAR(50) REFERENCES question_type_definitions(id),
    
    -- Rule Configuration
    priority INTEGER NOT NULL, -- Lower = higher priority
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Detection Logic
    detection_type VARCHAR(50), -- 'pattern', 'keyword', 'structure', 'composite'
    pattern_regex TEXT,
    keywords TEXT[],
    
    -- Conditions
    grade_condition JSONB, -- {"min": "1", "max": "5"}
    subject_condition TEXT[],
    
    -- Additional Checks
    must_have_fields TEXT[],
    must_not_have_fields TEXT[],
    
    -- Confidence
    confidence_score DECIMAL(3,2) DEFAULT 1.0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert detection rules with CORRECT PRIORITY
INSERT INTO detection_rules (rule_name, question_type, priority, detection_type, pattern_regex) VALUES
-- TRUE/FALSE MUST BE FIRST
('True/False Pattern', 'true_false', 1, 'pattern', '(?i)^(true\s+or\s+false|true/false|t/f):'),
('True/False Question', 'true_false', 2, 'pattern', '(?i)^is\s+(this|it|the\s+following)\s+true'),
('True/False Statement', 'true_false', 3, 'keyword', NULL), -- Uses keywords array

-- Multiple choice patterns
('Multiple Choice Options', 'multiple_choice', 10, 'structure', NULL),
('Which Following', 'multiple_choice', 11, 'pattern', '(?i)which\s+of\s+the\s+following'),

-- Fill in blank patterns
('Blank Underscores', 'fill_blank', 20, 'pattern', '___+'),
('Fill Blank Text', 'fill_blank', 21, 'pattern', '(?i)fill\s+in\s+the\s+blank'),

-- COUNTING SHOULD BE LAST for Grade 10
('Count Pattern', 'counting', 90, 'pattern', '(?i)^count\s+the'),
('How Many Pattern', 'counting', 91, 'pattern', '(?i)^how\s+many'),
('Counting with Visual', 'counting', 92, 'composite', NULL); -- Requires visual field

-- 6. Create indexes for performance
CREATE INDEX idx_question_types_priority ON question_type_definitions(detection_priority);
CREATE INDEX idx_question_types_grade ON question_type_definitions(min_grade, max_grade);
CREATE INDEX idx_detection_rules_priority ON detection_rules(priority);
CREATE INDEX idx_detection_rules_type ON detection_rules(question_type);
CREATE INDEX idx_skills_master_lookup ON skills_master_v2(subject, grade, skill_number);
CREATE INDEX idx_grade_config_numeric ON grade_configurations(grade_numeric);

-- 7. Helper functions for question type detection
CREATE OR REPLACE FUNCTION detect_question_type(
    p_question_text TEXT,
    p_grade VARCHAR(10),
    p_subject VARCHAR(50),
    p_has_visual BOOLEAN DEFAULT FALSE,
    p_has_options BOOLEAN DEFAULT FALSE
) RETURNS VARCHAR AS $$
DECLARE
    v_detected_type VARCHAR(50);
    v_rule RECORD;
BEGIN
    -- Check rules in priority order
    FOR v_rule IN 
        SELECT dr.*, qtd.id as type_id
        FROM detection_rules dr
        JOIN question_type_definitions qtd ON dr.question_type = qtd.id
        WHERE dr.is_active = TRUE
        ORDER BY dr.priority ASC
    LOOP
        -- Check pattern match
        IF v_rule.pattern_regex IS NOT NULL THEN
            IF p_question_text ~* v_rule.pattern_regex THEN
                -- Check grade condition if exists
                IF v_rule.grade_condition IS NULL OR 
                   (p_grade::INTEGER >= (v_rule.grade_condition->>'min')::INTEGER AND
                    p_grade::INTEGER <= (v_rule.grade_condition->>'max')::INTEGER) THEN
                    RETURN v_rule.type_id;
                END IF;
            END IF;
        END IF;
        
        -- Check structure-based detection
        IF v_rule.detection_type = 'structure' THEN
            IF v_rule.type_id = 'multiple_choice' AND p_has_options THEN
                RETURN 'multiple_choice';
            END IF;
        END IF;
        
        -- Check composite rules (e.g., counting needs visual)
        IF v_rule.detection_type = 'composite' THEN
            IF v_rule.type_id = 'counting' AND p_has_visual AND p_grade::INTEGER <= 5 THEN
                RETURN 'counting';
            END IF;
        END IF;
    END LOOP;
    
    -- Default fallback
    RETURN 'short_answer';
END;
$$ LANGUAGE plpgsql;

-- 8. View to get appropriate question types for a grade/subject
CREATE OR REPLACE VIEW grade_subject_question_types AS
SELECT 
    gc.grade,
    sc.subject_code,
    sc.subject_name,
    qtd.id as question_type,
    qtd.display_name,
    qtd.detection_priority,
    CASE 
        WHEN qtd.id = ANY(gc.excluded_question_types) THEN 'Excluded'
        WHEN qtd.id = ANY(gc.preferred_question_types) THEN 'Preferred'
        WHEN gc.grade_numeric >= qtd.min_grade AND gc.grade_numeric <= qtd.max_grade THEN 'Available'
        ELSE 'Not Suitable'
    END as suitability
FROM grade_configurations gc
CROSS JOIN subject_configurations sc
CROSS JOIN question_type_definitions qtd
WHERE sc.is_active = TRUE
  AND qtd.is_active = TRUE
ORDER BY gc.grade_numeric, sc.subject_code, qtd.detection_priority;

-- 9. Import function for skills data
CREATE OR REPLACE FUNCTION import_skills_from_text(
    p_subject VARCHAR,
    p_grade VARCHAR,
    p_skills_area TEXT,
    p_skills_cluster VARCHAR,
    p_skill_number VARCHAR,
    p_skill_name TEXT,
    p_source_file TEXT DEFAULT 'manual_import'
) RETURNS UUID AS $$
DECLARE
    v_skill_id UUID;
BEGIN
    INSERT INTO skills_master_v2 (
        subject, grade, skills_area, skills_cluster, 
        skill_number, skill_name, source_file
    ) VALUES (
        p_subject, p_grade, p_skills_area, p_skills_cluster,
        p_skill_number, p_skill_name, p_source_file
    )
    ON CONFLICT (subject, grade, skill_number) 
    DO UPDATE SET
        skill_name = EXCLUDED.skill_name,
        updated_at = NOW()
    RETURNING id INTO v_skill_id;
    
    RETURN v_skill_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Diagnostic queries
-- Check detection priority for True/False vs Counting
SELECT 
    id,
    display_name,
    detection_priority,
    detection_patterns
FROM question_type_definitions
WHERE id IN ('true_false', 'true_false_wo_image', 'true_false_w_image', 'counting')
ORDER BY detection_priority;

-- Check what question types are appropriate for Grade 10
SELECT 
    question_type,
    display_name,
    suitability,
    COUNT(*) as subject_count
FROM grade_subject_question_types
WHERE grade = '10'
GROUP BY question_type, display_name, suitability
ORDER BY suitability, question_type;