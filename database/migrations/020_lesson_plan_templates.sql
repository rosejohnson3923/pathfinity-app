-- ================================================
-- Lesson Plan Template System
-- Three-dimensional framework for career education
-- ================================================

-- Drop existing tables if needed to restart
DROP TABLE IF EXISTS lesson_plan_instances CASCADE;
DROP TABLE IF EXISTS lesson_plan_templates CASCADE;
DROP TABLE IF EXISTS template_types CASCADE;
DROP TABLE IF EXISTS student_learning_paths CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;

-- Template type definitions (the 10 combinations)
CREATE TABLE template_types (
    template_type_code VARCHAR(50) PRIMARY KEY,
    access_tier VARCHAR(20) NOT NULL CHECK (access_tier IN ('select', 'premium')),
    application_path VARCHAR(20) NOT NULL CHECK (application_path IN ('standard', 'trade_skill', 'corporate', 'entrepreneur')),
    knowledge_mode VARCHAR(20) NOT NULL CHECK (knowledge_mode IN ('standard', 'ai_first')),

    -- Display info
    template_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10),

    -- Pricing implications
    requires_booster BOOLEAN DEFAULT false,
    booster_type VARCHAR(50), -- NULL for standard, otherwise 'trade_skill', 'corporate', 'entrepreneur'
    requires_ai_addon BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(access_tier, application_path, knowledge_mode)
);

-- Master template library
CREATE TABLE lesson_plan_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_type_code VARCHAR(50) REFERENCES template_types(template_type_code),

    -- Template metadata
    lesson_number INTEGER NOT NULL, -- Order in sequence
    module_name VARCHAR(100) NOT NULL, -- e.g., "Foundation", "Skills", "Application"
    lesson_title_template VARCHAR(200) NOT NULL, -- e.g., "Introduction to {career_name}"

    -- Grade adaptations
    grade_category VARCHAR(20) NOT NULL CHECK (grade_category IN ('elementary', 'middle', 'high')),

    -- Time allocation
    duration_minutes INTEGER DEFAULT 30,

    -- Learning structure (templates with placeholders)
    objectives_template JSONB NOT NULL, -- Learning objectives with {career} placeholders

    -- Content sections (all support {career_name}, {career_skills}, etc. placeholders)
    warm_up_template JSONB NOT NULL,
    instruction_template JSONB NOT NULL,
    practice_template JSONB NOT NULL,
    assessment_template JSONB NOT NULL,
    extension_template JSONB,

    -- Application path specific content
    -- Standard: General career exploration
    -- Trade/Skill: Certification prep, hands-on skills
    -- Corporate: Professional skills, office readiness
    -- Entrepreneur: Business building, innovation
    application_focus JSONB, -- Specific activities for each path

    -- Knowledge mode specific content
    -- Standard: Traditional tools and methods
    -- AIFirst: AI-augmented workflows
    ai_integration JSONB, -- NULL for standard, AI tools/prompts for ai_first

    -- Resources (can be customized per career)
    required_tools JSONB,
    optional_resources JSONB,

    -- Skills mapping
    skills_developed JSONB, -- Generic skills this lesson develops
    career_specific_skills_placeholder TEXT, -- How to map to career-specific skills

    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(template_type_code, module_name, lesson_number, grade_category)
);

-- Actual lesson instances generated from templates for specific careers
CREATE TABLE lesson_plan_instances (
    instance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES lesson_plan_templates(template_id),
    career_code VARCHAR(100) REFERENCES career_paths(career_code),

    -- Instantiated content (template placeholders replaced with career-specific content)
    lesson_title VARCHAR(200) NOT NULL,
    objectives JSONB NOT NULL,
    warm_up JSONB NOT NULL,
    instruction JSONB NOT NULL,
    practice JSONB NOT NULL,
    assessment JSONB NOT NULL,
    extension JSONB,

    -- Career-specific customizations
    career_context JSONB, -- Industry examples, role models, etc.
    career_vocabulary JSONB, -- Terms specific to this career
    career_tools JSONB, -- Software/tools used in this career

    -- AI customizations for AIFirst mode
    ai_prompts JSONB, -- Career-specific prompts
    ai_use_cases JSONB, -- How AI is used in this specific career

    -- Metadata
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN DEFAULT false,

    UNIQUE(template_id, career_code)
);

-- Student learning paths (which template type they're following)
CREATE TABLE student_learning_paths (
    path_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References users table
    career_code VARCHAR(100) REFERENCES career_paths(career_code),
    template_type_code VARCHAR(50) REFERENCES template_types(template_type_code),

    -- Path details
    grade_category VARCHAR(20) NOT NULL,
    total_lessons INTEGER NOT NULL DEFAULT 0,
    completed_lessons INTEGER NOT NULL DEFAULT 0,

    -- Dates
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    target_completion_date DATE,
    actual_completion_date DATE,

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, career_code, template_type_code)
);

-- Progress tracking
CREATE TABLE lesson_progress (
    progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    instance_id UUID REFERENCES lesson_plan_instances(instance_id),
    path_id UUID REFERENCES student_learning_paths(path_id),

    -- Progress metrics
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'skipped')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),

    -- Section progress
    warm_up_completed BOOLEAN DEFAULT false,
    instruction_completed BOOLEAN DEFAULT false,
    practice_completed BOOLEAN DEFAULT false,
    assessment_completed BOOLEAN DEFAULT false,
    extension_completed BOOLEAN DEFAULT false,

    -- Performance
    assessment_score DECIMAL(5, 2),
    time_spent_minutes INTEGER DEFAULT 0,

    -- AI interaction tracking (for AIFirst paths)
    ai_interactions_count INTEGER DEFAULT 0,
    ai_prompts_used JSONB,

    -- Dates
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, instance_id)
);

-- Insert the 10 template types
INSERT INTO template_types (template_type_code, access_tier, application_path, knowledge_mode, template_name, description, icon, requires_booster, booster_type, requires_ai_addon) VALUES
-- Select tier templates
('SELECT_STANDARD', 'select', 'standard', 'standard', 'Select Career Exploration', 'Traditional career exploration for select tier careers', '📚', false, NULL, false),
('SELECT_STANDARD_AI', 'select', 'standard', 'ai_first', 'Select Career + AI', 'AI-enhanced career exploration for select tier', '🤖', false, NULL, true),

-- Premium tier templates
('PREMIUM_STANDARD', 'premium', 'standard', 'standard', 'Premium Career Deep Dive', 'In-depth exploration of premium careers', '⭐', false, NULL, false),
('PREMIUM_STANDARD_AI', 'premium', 'standard', 'ai_first', 'Premium Career + AI', 'AI-powered premium career exploration', '🌟', false, NULL, true),

-- Trade/Skill focused templates
('PREMIUM_TRADE', 'premium', 'trade_skill', 'standard', 'Trade Skills Certification', 'Certification prep and hands-on skills', '🔧', true, 'trade_skill', false),
('PREMIUM_TRADE_AI', 'premium', 'trade_skill', 'ai_first', 'Trade Skills + AI', 'Modern trade skills with AI tools', '🛠️', true, 'trade_skill', true),

-- Corporate focused templates
('PREMIUM_CORPORATE', 'premium', 'corporate', 'standard', 'Corporate Professional', 'Corporate skills and office readiness', '💼', true, 'corporate', false),
('PREMIUM_CORPORATE_AI', 'premium', 'corporate', 'ai_first', 'Corporate + AI', 'AI-powered corporate productivity', '🏢', true, 'corporate', true),

-- Entrepreneur focused templates
('PREMIUM_ENTREPRENEUR', 'premium', 'entrepreneur', 'standard', 'Entrepreneurship Path', 'Build your own business', '🚀', true, 'entrepreneur', false),
('PREMIUM_ENTREPRENEUR_AI', 'premium', 'entrepreneur', 'ai_first', 'AI Entrepreneur', 'AI-powered startup building', '🦄', true, 'entrepreneur', true);

-- Sample template: Elementary lesson for any template type
INSERT INTO lesson_plan_templates (
    template_type_code, lesson_number, module_name, lesson_title_template,
    grade_category, duration_minutes,
    objectives_template, warm_up_template, instruction_template,
    practice_template, assessment_template, extension_template,
    application_focus, ai_integration
) VALUES
-- Select Standard Elementary Template
('SELECT_STANDARD', 1, 'Foundation', 'What is a {career_name}?',
 'elementary', 30,
 '["Understand what a {career_name} does", "Identify tools used by {career_name}s", "Explore daily activities of a {career_name}"]',
 '{
    "activity": "Career Guessing Game",
    "time": 5,
    "description": "Show tools/images related to {career_name} and have students guess the career"
 }',
 '{
    "introduction": "Learn about the exciting world of {career_name}s",
    "video": "Day in the Life of a {career_name} (3-5 min)",
    "discussion_points": ["What surprised you?", "What looks fun?", "What looks challenging?"],
    "vocabulary": "{career_vocabulary}"
 }',
 '{
    "activity": "Be a {career_name} for 10 minutes",
    "materials": "{career_tools}",
    "steps": ["Role play scenario", "Use simple tools", "Solve a problem like a {career_name}"],
    "group_work": true
 }',
 '{
    "type": "Draw and Describe",
    "task": "Draw yourself as a {career_name} and write 3 things you would do",
    "success_criteria": ["Shows understanding of role", "Identifies key activities", "Shows creativity"]
 }',
 '{
    "home_activity": "Interview someone who works as/with {career_name}s",
    "advanced": "Research famous {career_name}s and their contributions"
 }',
 NULL, -- No special application focus for standard
 NULL), -- No AI integration for non-AI mode

-- Select Standard AI Elementary Template
('SELECT_STANDARD_AI', 1, 'Foundation', 'What is a {career_name} in the AI Age?',
 'elementary', 30,
 '["Understand what a {career_name} does", "Learn how AI helps {career_name}s", "Try simple AI tools for {career_name}s"]',
 '{
    "activity": "AI vs Human {career_name}",
    "time": 5,
    "description": "Compare how {career_name}s worked before and after AI"
 }',
 '{
    "introduction": "Discover how AI is changing {career_name} careers",
    "demo": "Show AI tool used by {career_name}s",
    "discussion_points": ["How does AI help?", "What do humans still do better?"],
    "vocabulary": "{career_vocabulary} + AI terms"
 }',
 '{
    "activity": "Use AI to help with {career_name} task",
    "ai_tool": "Pathfinity Safe AI Assistant",
    "prompts": ["Help me {career_task_1}", "What would a {career_name} do if..."],
    "safety": "All prompts are pre-approved and monitored"
 }',
 '{
    "type": "Show AI Collaboration",
    "task": "Complete a {career_name} task with AI help and explain what AI did",
    "success_criteria": ["Used AI appropriately", "Can explain AI role", "Completed task"]
 }',
 '{
    "challenge": "Create a {career_name} project using AI",
    "reflection": "How will AI change this career in the future?"
 }',
 NULL, -- Standard application
 '{
    "tools": ["Pathfinity Safe AI Chat"],
    "prompts_library": true,
    "safety_level": "elementary",
    "parent_visibility": true
 }');

-- Function to generate a lesson instance from template
CREATE OR REPLACE FUNCTION generate_lesson_instance(
    p_template_id UUID,
    p_career_code VARCHAR(100)
) RETURNS UUID AS $$
DECLARE
    v_instance_id UUID;
    v_template lesson_plan_templates%ROWTYPE;
    v_career career_paths%ROWTYPE;
    v_lesson_title VARCHAR(200);
BEGIN
    -- Get template and career info
    SELECT * INTO v_template FROM lesson_plan_templates WHERE template_id = p_template_id;
    SELECT * INTO v_career FROM career_paths WHERE career_code = p_career_code;

    -- Replace placeholders in title
    v_lesson_title := REPLACE(v_template.lesson_title_template, '{career_name}', v_career.career_name);

    -- Create instance with replaced placeholders
    INSERT INTO lesson_plan_instances (
        template_id, career_code, lesson_title,
        objectives, warm_up, instruction, practice, assessment, extension,
        career_context, career_vocabulary
    ) VALUES (
        p_template_id, p_career_code, v_lesson_title,
        -- Replace placeholders in JSON content
        v_template.objectives_template,
        v_template.warm_up_template,
        v_template.instruction_template,
        v_template.practice_template,
        v_template.assessment_template,
        v_template.extension_template,
        -- Add career-specific context
        jsonb_build_object(
            'career_name', v_career.career_name,
            'career_description', v_career.description,
            'career_category', v_career.career_category
        ),
        jsonb_build_object(
            'select_terms', ARRAY['profession', 'career', 'job', 'work'],
            'career_specific', v_career.tags
        )
    ) RETURNING instance_id INTO v_instance_id;

    RETURN v_instance_id;
END;
$$ LANGUAGE plpgsql;

-- View to show available lesson plans for a student
CREATE OR REPLACE VIEW student_available_lessons AS
SELECT
    tt.template_type_code,
    tt.template_name,
    tt.access_tier,
    tt.application_path,
    tt.knowledge_mode,
    lpt.lesson_number,
    lpt.module_name,
    lpt.lesson_title_template,
    lpt.grade_category,
    lpt.duration_minutes
FROM template_types tt
JOIN lesson_plan_templates lpt ON tt.template_type_code = lpt.template_type_code
WHERE lpt.is_active = true
ORDER BY tt.template_type_code, lpt.module_name, lpt.lesson_number;

-- Summary
SELECT
    '📚 Lesson Template System' as system,
    COUNT(DISTINCT template_type_code) as template_types,
    COUNT(DISTINCT CONCAT(access_tier, '-', application_path, '-', knowledge_mode)) as unique_combinations,
    'Ready for template population' as status
FROM template_types;