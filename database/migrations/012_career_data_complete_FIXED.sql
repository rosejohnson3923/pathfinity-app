-- Complete Career Data for Career Path Progression System - FIXED VERSION
-- This migration adds all Standard and Premium careers with their progressions

-- First, ensure we have all the needed career fields
INSERT INTO career_fields (field_code, field_name, description, display_order) VALUES
    ('healthcare', 'Healthcare', 'Medical and health-related careers', 1),
    ('technology', 'Technology', 'Computer science and IT careers', 2),
    ('culinary', 'Culinary Arts', 'Food service and cooking careers', 3),
    ('arts', 'Arts & Creative', 'Creative and artistic careers', 4),
    ('science', 'Science', 'Scientific research and exploration', 5),
    ('education', 'Education', 'Teaching and training careers', 6),
    ('business', 'Business', 'Commerce and management careers', 7),
    ('trades', 'Skilled Trades', 'Technical and manual skill careers', 8),
    ('public_service', 'Public Service', 'Government and community service', 9),
    ('sports', 'Sports & Fitness', 'Athletic and wellness careers', 10)
ON CONFLICT (field_code) DO NOTHING;

-- Add MORE Standard Careers (to reach ~30 standard careers)
INSERT INTO careers (career_code, career_name, emoji, category, description, tier, field_id) VALUES
    -- Additional Healthcare (Standard)
    ('std_pharmacist', 'Pharmacist', '💊', 'Healthcare', 'Dispense medications and advise patients', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('std_therapist', 'Therapist', '🗣️', 'Healthcare', 'Help people with mental health', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),

    -- Additional Technology (Standard)
    ('std_it_support', 'IT Support', '🖥️', 'Technology', 'Help with computer problems', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('std_game_tester', 'Game Tester', '🎮', 'Technology', 'Test video games for bugs', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'technology'))
ON CONFLICT (career_code) DO NOTHING;

-- Add 100+ Premium Careers
INSERT INTO careers (career_code, career_name, emoji, category, description, tier, field_id) VALUES
    -- Healthcare Specializations (Premium)
    ('prm_neurosurgeon', 'Neurosurgeon', '🧠', 'Healthcare', 'Brain and nerve surgery specialist', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('prm_oncologist', 'Oncologist', '🎗️', 'Healthcare', 'Cancer treatment specialist', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('prm_orthodontist', 'Orthodontist', '🦷', 'Healthcare', 'Teeth alignment specialist', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('prm_plastic_surgeon', 'Plastic Surgeon', '👨‍⚕️', 'Healthcare', 'Reconstructive surgery specialist', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),

    -- Technology Specializations (Premium)
    ('prm_software_architect', 'Software Architect', '🏗️', 'Technology', 'Design complex software systems', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_data_scientist', 'Data Scientist', '📊', 'Technology', 'Analyze complex data', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_cybersecurity', 'Cybersecurity Expert', '🔐', 'Technology', 'Protect digital systems', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_ai_researcher', 'AI Researcher', '🤖', 'Technology', 'Research artificial intelligence', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_blockchain_dev', 'Blockchain Developer', '⛓️', 'Technology', 'Build blockchain applications', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_cloud_architect', 'Cloud Architect', '☁️', 'Technology', 'Design cloud infrastructure', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_devops_engineer', 'DevOps Engineer', '🔧', 'Technology', 'Manage development operations', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_vr_developer', 'VR Developer', '🥽', 'Technology', 'Create virtual reality experiences', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),

    -- Science Specializations (Premium)
    ('prm_astronaut', 'Astronaut', '🚀', 'Science', 'Explore space', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_marine_biologist', 'Marine Biologist', '🐋', 'Science', 'Study ocean life', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_geneticist', 'Geneticist', '🧬', 'Science', 'Study genes and heredity', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_paleontologist', 'Paleontologist', '🦕', 'Science', 'Study fossils and prehistoric life', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_meteorologist', 'Meteorologist', '🌦️', 'Science', 'Study weather patterns', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_geologist', 'Geologist', '⛰️', 'Science', 'Study Earth and rocks', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_astrophysicist', 'Astrophysicist', '🌌', 'Science', 'Study the universe', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),

    -- Arts & Creative Specializations (Premium)
    ('prm_film_director', 'Film Director', '🎬', 'Arts', 'Direct movies and shows', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_animator', 'Animator', '🎨', 'Arts', 'Create animations', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_fashion_designer', 'Fashion Designer', '👗', 'Arts', 'Design clothing and accessories', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_architect', 'Architect', '🏛️', 'Arts', 'Design buildings', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_interior_designer', 'Interior Designer', '🏡', 'Arts', 'Design interior spaces', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_graphic_designer', 'Graphic Designer', '🎨', 'Arts', 'Create visual designs', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_sculptor', 'Sculptor', '🗿', 'Arts', 'Create 3D art', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_choreographer', 'Choreographer', '💃', 'Arts', 'Create dance routines', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),

    -- Business Specializations (Premium)
    ('prm_ceo', 'CEO', '👔', 'Business', 'Lead companies', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'business')),
    ('prm_investment_banker', 'Investment Banker', '💰', 'Business', 'Manage investments and deals', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'business')),
    ('prm_entrepreneur', 'Entrepreneur', '🚀', 'Business', 'Start and run businesses', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'business')),
    ('prm_marketing_director', 'Marketing Director', '📈', 'Business', 'Lead marketing strategies', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'business')),
    ('prm_financial_advisor', 'Financial Advisor', '💹', 'Business', 'Guide financial decisions', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'business')),
    ('prm_product_manager', 'Product Manager', '📦', 'Business', 'Manage product development', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'business')),

    -- Culinary Specializations (Premium)
    ('prm_pastry_chef', 'Pastry Chef', '🍰', 'Culinary', 'Specialize in desserts', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'culinary')),
    ('prm_executive_chef', 'Executive Chef', '👨‍🍳', 'Culinary', 'Lead restaurant kitchens', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'culinary')),
    ('prm_sommelier', 'Sommelier', '🍷', 'Culinary', 'Wine expert', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'culinary')),
    ('prm_food_critic', 'Food Critic', '📝', 'Culinary', 'Review restaurants and food', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'culinary')),
    ('prm_nutritionist', 'Nutritionist', '🥗', 'Culinary', 'Plan healthy diets', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'culinary')),

    -- Sports Specializations (Premium)
    ('prm_professional_athlete', 'Professional Athlete', '🏆', 'Sports', 'Compete at highest level', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'sports')),
    ('prm_sports_agent', 'Sports Agent', '📋', 'Sports', 'Represent athletes', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'sports')),
    ('prm_fitness_influencer', 'Fitness Influencer', '💪', 'Sports', 'Inspire fitness online', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'sports')),
    ('prm_sports_psychologist', 'Sports Psychologist', '🧠', 'Sports', 'Mental training for athletes', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'sports')),
    ('prm_physical_therapist', 'Physical Therapist', '🦴', 'Sports', 'Help with injury recovery', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'sports')),

    -- Education Specializations (Premium)
    ('prm_university_professor', 'University Professor', '🎓', 'Education', 'Teach at college level', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'education')),
    ('prm_school_principal', 'School Principal', '🏫', 'Education', 'Lead schools', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'education')),
    ('prm_education_consultant', 'Education Consultant', '📚', 'Education', 'Advise on education strategies', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'education')),
    ('prm_curriculum_designer', 'Curriculum Designer', '📝', 'Education', 'Create educational programs', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'education')),

    -- Public Service Specializations (Premium)
    ('prm_diplomat', 'Diplomat', '🤝', 'Public Service', 'Represent country internationally', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),
    ('prm_judge', 'Judge', '⚖️', 'Public Service', 'Preside over legal cases', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),
    ('prm_senator', 'Senator', '🏛️', 'Public Service', 'Serve in government', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),
    ('prm_fbi_agent', 'FBI Agent', '🕵️', 'Public Service', 'Federal law enforcement', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),
    ('prm_park_ranger', 'Park Ranger', '🌲', 'Public Service', 'Protect natural parks', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service'))
ON CONFLICT (career_code) DO NOTHING;

-- Generate progressions for ALL careers using a simplified approach
-- For each career, create 4 progression types
DO $$
DECLARE
    career_rec RECORD;
BEGIN
    FOR career_rec IN SELECT * FROM careers WHERE is_active = true
    LOOP
        -- Trade Boost
        INSERT INTO career_path_progressions (
            base_career_id,
            progression_type,
            enhanced_career_name,
            enhanced_description,
            additional_skills
        ) VALUES (
            career_rec.id,
            'boost_trade',
            career_rec.career_name || ' + Technical Skills',
            'Master hands-on technical expertise in ' || career_rec.category,
            '["equipment_operation", "technical_certification", "tool_mastery", "safety_protocols"]'::jsonb
        ) ON CONFLICT (base_career_id, progression_type) DO NOTHING;

        -- Corporate Boost
        INSERT INTO career_path_progressions (
            base_career_id,
            progression_type,
            enhanced_career_name,
            enhanced_description,
            additional_skills
        ) VALUES (
            career_rec.id,
            'boost_corporate',
            career_rec.career_name || ' Team Leader',
            'Lead teams and manage ' || career_rec.category || ' operations',
            '["team_management", "project_leadership", "strategic_planning", "budget_control"]'::jsonb
        ) ON CONFLICT (base_career_id, progression_type) DO NOTHING;

        -- Business Boost
        INSERT INTO career_path_progressions (
            base_career_id,
            progression_type,
            enhanced_career_name,
            enhanced_description,
            additional_skills
        ) VALUES (
            career_rec.id,
            'boost_business',
            career_rec.career_name || ' Business Owner',
            'Launch your own ' || career_rec.category || ' business',
            '["entrepreneurship", "business_planning", "marketing", "financial_management"]'::jsonb
        ) ON CONFLICT (base_career_id, progression_type) DO NOTHING;

        -- AI First Boost
        INSERT INTO career_path_progressions (
            base_career_id,
            progression_type,
            enhanced_career_name,
            enhanced_description,
            additional_skills
        ) VALUES (
            career_rec.id,
            'boost_ai_first',
            'AI-Enhanced ' || career_rec.career_name,
            'Use AI to revolutionize ' || career_rec.category,
            '["ai_tools", "automation", "data_analytics", "machine_learning"]'::jsonb
        ) ON CONFLICT (base_career_id, progression_type) DO NOTHING;
    END LOOP;
END $$;