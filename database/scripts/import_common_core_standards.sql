-- ============================================
-- Import Script for Common Core Standards Data
-- ============================================
-- This script imports Common Core standards for grades 9-12 from the 
-- commonCore_HighSchool_Complete.txt file into the database tables

-- Clear existing data (optional - remove if appending)
-- TRUNCATE common_core_standards CASCADE;

-- Function to parse and import Common Core standards from text
CREATE OR REPLACE FUNCTION import_common_core_standards_from_text(
    p_file_content TEXT
) RETURNS INTEGER AS $$
DECLARE
    v_line TEXT;
    v_parts TEXT[];
    v_count INTEGER := 0;
    v_common_core_id VARCHAR(20);
    v_description TEXT;
    v_subject VARCHAR(50);
    v_grade VARCHAR(10);
    v_skills_area TEXT;
    v_skills_cluster TEXT;
    v_skill_number VARCHAR(20);
    v_skill_name TEXT;
    v_career_relevance TEXT[];
BEGIN
    -- Process each line
    FOR v_line IN SELECT unnest(string_to_array(p_file_content, E'\n'))
    LOOP
        -- Skip empty lines and header
        CONTINUE WHEN v_line IS NULL OR v_line = '' OR v_line LIKE '%CommonCoreID%';
        
        -- Split by tab
        v_parts := string_to_array(v_line, E'\t');
        
        -- Validate we have enough parts
        IF array_length(v_parts, 1) >= 8 THEN
            v_common_core_id := v_parts[1];
            v_description := v_parts[2];
            v_subject := v_parts[3];
            v_grade := v_parts[4];
            v_skills_area := v_parts[5];
            v_skills_cluster := v_parts[6];
            v_skill_number := v_parts[7];
            v_skill_name := v_parts[8];
            
            -- Parse career relevance if present
            IF array_length(v_parts, 1) >= 9 AND v_parts[9] IS NOT NULL THEN
                v_career_relevance := string_to_array(v_parts[9], ',');
            ELSE
                v_career_relevance := ARRAY[]::TEXT[];
            END IF;
            
            -- Determine cognitive level based on standard notation
            DECLARE
                v_cognitive_level VARCHAR(50);
                v_difficulty_level INTEGER;
            BEGIN
                -- Analyze standard level for cognitive complexity
                IF v_skill_number LIKE '%Create%' OR v_skill_number LIKE '%Design%' THEN
                    v_cognitive_level := 'Create';
                    v_difficulty_level := 5;
                ELSIF v_skill_number LIKE '%Evaluate%' OR v_skill_number LIKE '%Critique%' THEN
                    v_cognitive_level := 'Evaluate';
                    v_difficulty_level := 4;
                ELSIF v_skill_number LIKE '%Analyze%' OR v_skill_number LIKE '%Compare%' THEN
                    v_cognitive_level := 'Analyze';
                    v_difficulty_level := 4;
                ELSIF v_skill_number LIKE '%Apply%' OR v_skill_number LIKE '%Use%' THEN
                    v_cognitive_level := 'Apply';
                    v_difficulty_level := 3;
                ELSIF v_skill_number LIKE '%Understand%' OR v_skill_number LIKE '%Explain%' THEN
                    v_cognitive_level := 'Understand';
                    v_difficulty_level := 2;
                ELSE
                    v_cognitive_level := 'Remember';
                    v_difficulty_level := 2;
                END IF;
                
                -- Insert into common_core_standards table
                INSERT INTO common_core_standards (
                    common_core_id,
                    common_core_description,
                    subject,
                    grade,
                    skills_area,
                    skills_cluster,
                    skill_number,
                    skill_name,
                    domain_code,
                    cluster_code,
                    standard_level,
                    cognitive_level,
                    difficulty_level,
                    estimated_time_hours,
                    is_active,
                    is_essential
                ) VALUES (
                    v_common_core_id,
                    v_description,
                    v_subject,
                    v_grade,
                    v_skills_area,
                    v_skills_cluster,
                    v_skill_number,
                    v_skill_name,
                    CASE 
                        WHEN v_common_core_id LIKE 'HS%' THEN substring(v_common_core_id, 1, 5)
                        WHEN v_common_core_id LIKE 'RST%' THEN substring(v_common_core_id, 1, 3)
                        WHEN v_common_core_id LIKE 'W%' THEN substring(v_common_core_id, 1, 1)
                        ELSE NULL
                    END,
                    CASE
                        WHEN v_common_core_id LIKE '%-%' THEN split_part(v_common_core_id, '-', 2)
                        ELSE NULL
                    END,
                    CASE
                        WHEN v_common_core_id LIKE '%.%' THEN substring(v_common_core_id from position('.' in v_common_core_id))
                        ELSE NULL
                    END,
                    v_cognitive_level,
                    v_difficulty_level,
                    CASE v_difficulty_level
                        WHEN 5 THEN 8.0
                        WHEN 4 THEN 6.0
                        WHEN 3 THEN 4.0
                        WHEN 2 THEN 2.0
                        ELSE 1.5
                    END,
                    TRUE,
                    TRUE
                ) ON CONFLICT (common_core_id) DO UPDATE SET
                    common_core_description = EXCLUDED.common_core_description,
                    subject = EXCLUDED.subject,
                    grade = EXCLUDED.grade,
                    skills_area = EXCLUDED.skills_area,
                    skills_cluster = EXCLUDED.skills_cluster,
                    skill_number = EXCLUDED.skill_number,
                    skill_name = EXCLUDED.skill_name,
                    updated_at = NOW();
                
                -- Process career relevance
                IF array_length(v_career_relevance, 1) > 0 THEN
                    FOR i IN 1..array_length(v_career_relevance, 1) LOOP
                        -- Insert career-standard mapping
                        INSERT INTO career_standard_mapping (
                            career_code,
                            common_core_id,
                            relevance_level,
                            relevance_score,
                            application_context,
                            importance_entry_level,
                            importance_mid_career,
                            importance_senior_level
                        ) VALUES (
                            trim(v_career_relevance[i]),
                            v_common_core_id,
                            'Essential',
                            8,
                            'Direct application of ' || v_skill_name || ' in ' || trim(v_career_relevance[i]) || ' field',
                            CASE 
                                WHEN v_subject = 'Math' THEN 8
                                WHEN v_subject = 'ELA' THEN 7
                                ELSE 6
                            END,
                            7,
                            6
                        ) ON CONFLICT (career_code, common_core_id) DO UPDATE SET
                            relevance_score = EXCLUDED.relevance_score,
                            application_context = EXCLUDED.application_context;
                    END LOOP;
                END IF;
                
                v_count := v_count + 1;
            END;
        END IF;
    END LOOP;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Alternative: Direct INSERT statements for sample data
-- This can be used if file-based import is not available

-- Insert sample Common Core standards for Math (Grade 9-10)
INSERT INTO common_core_standards (
    common_core_id, common_core_description, subject, grade, 
    skills_area, skills_cluster, skill_number, skill_name,
    cognitive_level, difficulty_level, estimated_time_hours
) VALUES
    ('HSN-RN.A.1', 'Explain how the definition of the meaning of rational exponents follows from extending the properties of integer exponents', 
     'Math', '9-10', 'Number and Quantity', 'The Real Number System', 'HSN-RN.A.1', 'Rational exponents and properties',
     'Understand', 3, 4.0),
    
    ('HSN-RN.A.2', 'Rewrite expressions involving radicals and rational exponents using the properties of exponents',
     'Math', '9-10', 'Number and Quantity', 'The Real Number System', 'HSN-RN.A.2', 'Radicals and rational exponents',
     'Apply', 3, 4.0),
     
    ('HSA-SSE.A.1', 'Interpret expressions that represent a quantity in terms of its context',
     'Math', '9-10', 'Algebra', 'Seeing Structure in Expressions', 'HSA-SSE.A.1', 'Interpret expressions',
     'Analyze', 4, 6.0)
ON CONFLICT (common_core_id) DO NOTHING;

-- Insert sample career-standard mappings
INSERT INTO career_standard_mapping (
    career_code, common_core_id, relevance_level, relevance_score,
    application_context, importance_entry_level, importance_mid_career, importance_senior_level
) VALUES
    ('engineering', 'HSN-RN.A.1', 'Essential', 9, 
     'Understanding exponents is fundamental for engineering calculations', 8, 8, 7),
     
    ('data_science', 'HSN-RN.A.1', 'Recommended', 7,
     'Exponential functions appear in growth models and algorithms', 6, 7, 6),
     
    ('engineering', 'HSA-SSE.A.1', 'Essential', 10,
     'Interpreting mathematical expressions is critical for engineering design', 9, 9, 8),
     
    ('finance', 'HSA-SSE.A.1', 'Essential', 9,
     'Understanding compound interest and financial models requires expression interpretation', 8, 9, 9)
ON CONFLICT (career_code, common_core_id) DO NOTHING;

-- Create function to calculate skill prerequisites
CREATE OR REPLACE FUNCTION identify_skill_prerequisites() RETURNS void AS $$
BEGIN
    -- Update prerequisites for Number and Quantity standards
    UPDATE common_core_standards
    SET prerequisite_standards = ARRAY['HSN-RN.A.1']
    WHERE common_core_id = 'HSN-RN.A.2';
    
    -- Update prerequisites for Algebra standards
    UPDATE common_core_standards
    SET prerequisite_standards = ARRAY['HSN-RN.A.1', 'HSN-RN.A.2']
    WHERE common_core_id LIKE 'HSA-SSE%' AND common_core_id != 'HSA-SSE.A.1';
    
    -- Update corequisites for related standards
    UPDATE common_core_standards
    SET corequisite_standards = ARRAY['HSA-SSE.A.2']
    WHERE common_core_id = 'HSA-SSE.A.1';
END;
$$ LANGUAGE plpgsql;

-- Execute prerequisite identification
SELECT identify_skill_prerequisites();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cc_career_mapping ON career_standard_mapping(career_code, relevance_level);
CREATE INDEX IF NOT EXISTS idx_cc_grade_subject ON common_core_standards(grade, subject);
CREATE INDEX IF NOT EXISTS idx_cc_skills_area ON common_core_standards(skills_area, skills_cluster);

-- Verify import
SELECT 
    'Total Standards Imported' as metric,
    COUNT(*) as count
FROM common_core_standards
UNION ALL
SELECT 
    'Total Career Mappings' as metric,
    COUNT(*) as count
FROM career_standard_mapping
UNION ALL
SELECT 
    'Unique Careers Mapped' as metric,
    COUNT(DISTINCT career_code) as count
FROM career_standard_mapping;

-- Sample query to view imported data
SELECT 
    cs.common_core_id,
    cs.skill_name,
    cs.subject,
    cs.grade,
    STRING_AGG(DISTINCT csm.career_code, ', ') as relevant_careers
FROM common_core_standards cs
LEFT JOIN career_standard_mapping csm ON cs.common_core_id = csm.common_core_id
GROUP BY cs.common_core_id, cs.skill_name, cs.subject, cs.grade
ORDER BY cs.subject, cs.grade, cs.common_core_id
LIMIT 20;