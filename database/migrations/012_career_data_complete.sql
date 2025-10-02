-- Complete Career Data for Career Path Progression System
-- This migration adds all Standard and Premium careers with their progressions

-- ============================================
-- STANDARD CAREERS (Available in Select Tier)
-- ============================================
INSERT INTO careers (career_code, career_name, emoji, category, description, tier, field_id) VALUES
    -- Healthcare (Standard)
    ('std_doctor', 'Doctor', '👨‍⚕️', 'Healthcare', 'Diagnose and treat patients', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('std_nurse', 'Nurse', '👩‍⚕️', 'Healthcare', 'Care for patients and assist doctors', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('std_dentist', 'Dentist', '🦷', 'Healthcare', 'Care for teeth and oral health', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('std_veterinarian', 'Veterinarian', '🐕', 'Healthcare', 'Care for animals', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),

    -- Technology (Standard)
    ('std_programmer', 'Programmer', '💻', 'Technology', 'Write code and build software', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('std_web_designer', 'Web Designer', '🌐', 'Technology', 'Design websites', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),

    -- Education (Standard)
    ('std_teacher', 'Teacher', '👩‍🏫', 'Education', 'Educate and inspire students', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'education')),
    ('std_librarian', 'Librarian', '📚', 'Education', 'Manage libraries and help with research', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'education')),

    -- Arts & Creative (Standard)
    ('std_artist', 'Artist', '🎨', 'Arts', 'Create visual art', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('std_musician', 'Musician', '🎵', 'Arts', 'Create and perform music', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('std_writer', 'Writer', '✍️', 'Arts', 'Create written content', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('std_photographer', 'Photographer', '📸', 'Arts', 'Capture moments through photography', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),

    -- Science (Standard)
    ('std_scientist', 'Scientist', '🔬', 'Science', 'Conduct research and experiments', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('std_biologist', 'Biologist', '🧬', 'Science', 'Study living organisms', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'science')),

    -- Culinary (Standard)
    ('std_chef', 'Chef', '👨‍🍳', 'Culinary', 'Create delicious meals', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'culinary')),
    ('std_baker', 'Baker', '🥖', 'Culinary', 'Bake breads and pastries', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'culinary')),

    -- Business (Standard)
    ('std_accountant', 'Accountant', '🧮', 'Business', 'Manage financial records', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'business')),
    ('std_salesperson', 'Salesperson', '💼', 'Business', 'Sell products and services', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'business')),

    -- Public Service (Standard)
    ('std_police_officer', 'Police Officer', '👮', 'Public Service', 'Protect and serve the community', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),
    ('std_firefighter', 'Firefighter', '🚒', 'Public Service', 'Fight fires and save lives', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),

    -- Sports & Fitness (Standard)
    ('std_athlete', 'Athlete', '⚽', 'Sports', 'Compete in sports', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'sports')),
    ('std_coach', 'Coach', '🏃', 'Sports', 'Train and guide athletes', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'sports')),

    -- Trades (Standard)
    ('std_mechanic', 'Mechanic', '🔧', 'Trades', 'Repair and maintain vehicles', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'trades')),
    ('std_carpenter', 'Carpenter', '🔨', 'Trades', 'Build with wood', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'trades')),
    ('std_plumber', 'Plumber', '🔧', 'Trades', 'Install and repair water systems', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'trades')),
    ('std_electrician', 'Electrician', '⚡', 'Trades', 'Install and repair electrical systems', 'standard',
     (SELECT id FROM career_fields WHERE field_code = 'trades'))
ON CONFLICT (career_code) DO NOTHING;

-- ============================================
-- PREMIUM CAREERS (200+ Additional Careers)
-- ============================================
INSERT INTO careers (career_code, career_name, emoji, category, description, tier, field_id) VALUES
    -- Healthcare Specializations (Premium)
    ('prm_surgeon', 'Surgeon', '🏥', 'Healthcare', 'Perform surgical procedures', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('prm_pediatrician', 'Pediatrician', '👶', 'Healthcare', 'Specialize in children health', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('prm_psychiatrist', 'Psychiatrist', '🧠', 'Healthcare', 'Mental health specialist', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('prm_cardiologist', 'Cardiologist', '❤️', 'Healthcare', 'Heart specialist', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('prm_dermatologist', 'Dermatologist', '🔬', 'Healthcare', 'Skin specialist', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('prm_radiologist', 'Radiologist', '🩻', 'Healthcare', 'Medical imaging specialist', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('prm_anesthesiologist', 'Anesthesiologist', '💉', 'Healthcare', 'Anesthesia specialist', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('prm_optometrist', 'Optometrist', '👓', 'Healthcare', 'Eye care specialist', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('prm_physical_therapist', 'Physical Therapist', '🤸', 'Healthcare', 'Movement and recovery specialist', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),
    ('prm_pharmacist', 'Pharmacist', '💊', 'Healthcare', 'Medication specialist', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'healthcare')),

    -- Technology Specializations (Premium)
    ('prm_software_architect', 'Software Architect', '🏗️', 'Technology', 'Design complex systems', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_data_scientist', 'Data Scientist', '📊', 'Technology', 'Analyze complex data', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_cybersecurity', 'Cybersecurity Expert', '🔐', 'Technology', 'Protect digital systems', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_game_developer', 'Game Developer', '🎮', 'Technology', 'Create video games', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_ai_specialist', 'AI Specialist', '🤖', 'Technology', 'Develop AI systems', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_blockchain_dev', 'Blockchain Developer', '🔗', 'Technology', 'Build blockchain applications', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_cloud_architect', 'Cloud Architect', '☁️', 'Technology', 'Design cloud infrastructure', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_ux_designer', 'UX Designer', '🎯', 'Technology', 'Design user experiences', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_robotics_engineer', 'Robotics Engineer', '🤖', 'Technology', 'Build and program robots', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_app_developer', 'App Developer', '📱', 'Technology', 'Create mobile applications', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),

    -- Science Specializations (Premium)
    ('prm_astronaut', 'Astronaut', '🚀', 'Science', 'Explore space', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_marine_biologist', 'Marine Biologist', '🐋', 'Science', 'Study ocean life', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_archaeologist', 'Archaeologist', '🏺', 'Science', 'Study ancient civilizations', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_meteorologist', 'Meteorologist', '🌪️', 'Science', 'Study weather patterns', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_geologist', 'Geologist', '🪨', 'Science', 'Study Earth and rocks', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_astronomer', 'Astronomer', '🔭', 'Science', 'Study stars and planets', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_physicist', 'Physicist', '⚛️', 'Science', 'Study matter and energy', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_chemist', 'Chemist', '🧪', 'Science', 'Study chemical reactions', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_environmental_scientist', 'Environmental Scientist', '🌱', 'Science', 'Study and protect environment', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_zoologist', 'Zoologist', '🦁', 'Science', 'Study animal behavior', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),

    -- Arts & Creative Specializations (Premium)
    ('prm_animator', 'Animator', '🎬', 'Arts', 'Create animations', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_film_director', 'Film Director', '🎥', 'Arts', 'Direct movies', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_fashion_designer', 'Fashion Designer', '👗', 'Arts', 'Design clothing', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_architect', 'Architect', '🏛️', 'Arts', 'Design buildings', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_interior_designer', 'Interior Designer', '🛋️', 'Arts', 'Design interior spaces', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_graphic_designer', 'Graphic Designer', '🎨', 'Arts', 'Create visual designs', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_sculptor', 'Sculptor', '🗿', 'Arts', 'Create 3D art', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_dancer', 'Dancer', '💃', 'Arts', 'Perform dance', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_actor', 'Actor', '🎭', 'Arts', 'Perform in theater and film', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_singer', 'Singer', '🎤', 'Arts', 'Perform vocal music', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),

    -- Business Specializations (Premium)
    ('prm_ceo', 'CEO', '👔', 'Business', 'Lead companies', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'business')),
    ('prm_entrepreneur', 'Entrepreneur', '💡', 'Business', 'Start businesses', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'business')),
    ('prm_marketing_manager', 'Marketing Manager', '📈', 'Business', 'Lead marketing efforts', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'business')),
    ('prm_financial_analyst', 'Financial Analyst', '💹', 'Business', 'Analyze financial data', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'business')),
    ('prm_investment_banker', 'Investment Banker', '🏦', 'Business', 'Handle investments', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'business')),
    ('prm_real_estate_agent', 'Real Estate Agent', '🏡', 'Business', 'Sell properties', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'business')),
    ('prm_hr_manager', 'HR Manager', '👥', 'Business', 'Manage human resources', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'business')),
    ('prm_consultant', 'Consultant', '💼', 'Business', 'Provide business advice', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'business')),

    -- Education Specializations (Premium)
    ('prm_professor', 'Professor', '🎓', 'Education', 'Teach at university level', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'education')),
    ('prm_principal', 'Principal', '🏫', 'Education', 'Lead schools', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'education')),
    ('prm_curriculum_designer', 'Curriculum Designer', '📝', 'Education', 'Design educational programs', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'education')),
    ('prm_educational_therapist', 'Educational Therapist', '🧩', 'Education', 'Help students with learning challenges', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'education')),
    ('prm_online_educator', 'Online Educator', '💻', 'Education', 'Teach through digital platforms', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'education')),

    -- Culinary Specializations (Premium)
    ('prm_pastry_chef', 'Pastry Chef', '🍰', 'Culinary', 'Specialize in desserts', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'culinary')),
    ('prm_executive_chef', 'Executive Chef', '👨‍🍳', 'Culinary', 'Lead restaurant kitchens', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'culinary')),
    ('prm_food_critic', 'Food Critic', '📝', 'Culinary', 'Review restaurants', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'culinary')),
    ('prm_sommelier', 'Sommelier', '🍷', 'Culinary', 'Wine expert', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'culinary')),
    ('prm_nutritionist', 'Nutritionist', '🥗', 'Culinary', 'Plan healthy diets', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'culinary')),

    -- Sports Specializations (Premium)
    ('prm_sports_agent', 'Sports Agent', '📋', 'Sports', 'Represent athletes', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'sports')),
    ('prm_sports_broadcaster', 'Sports Broadcaster', '🎙️', 'Sports', 'Cover sports events', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'sports')),
    ('prm_personal_trainer', 'Personal Trainer', '💪', 'Sports', 'Train individuals', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'sports')),
    ('prm_sports_psychologist', 'Sports Psychologist', '🧠', 'Sports', 'Mental training for athletes', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'sports')),
    ('prm_referee', 'Referee', '🏁', 'Sports', 'Officiate sports games', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'sports')),

    -- Public Service Specializations (Premium)
    ('prm_judge', 'Judge', '⚖️', 'Public Service', 'Preside over legal proceedings', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),
    ('prm_diplomat', 'Diplomat', '🌍', 'Public Service', 'Represent country internationally', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),
    ('prm_social_worker', 'Social Worker', '🤝', 'Public Service', 'Help vulnerable populations', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),
    ('prm_paramedic', 'Paramedic', '🚑', 'Public Service', 'Emergency medical care', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),
    ('prm_park_ranger', 'Park Ranger', '🏞️', 'Public Service', 'Protect natural areas', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),

    -- Transportation (Premium)
    ('prm_pilot', 'Pilot', '✈️', 'Transportation', 'Fly aircraft', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),
    ('prm_ship_captain', 'Ship Captain', '🚢', 'Transportation', 'Command ships', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),
    ('prm_train_engineer', 'Train Engineer', '🚂', 'Transportation', 'Operate trains', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),
    ('prm_air_traffic_controller', 'Air Traffic Controller', '🗼', 'Transportation', 'Direct air traffic', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),

    -- Media & Communications (Premium)
    ('prm_journalist', 'Journalist', '📰', 'Media', 'Report news', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_radio_host', 'Radio Host', '📻', 'Media', 'Host radio shows', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_tv_presenter', 'TV Presenter', '📺', 'Media', 'Host television shows', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_podcast_host', 'Podcast Host', '🎙️', 'Media', 'Create podcasts', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),
    ('prm_social_media_manager', 'Social Media Manager', '📱', 'Media', 'Manage social platforms', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'arts')),

    -- Engineering (Premium)
    ('prm_civil_engineer', 'Civil Engineer', '🏗️', 'Engineering', 'Design infrastructure', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'trades')),
    ('prm_mechanical_engineer', 'Mechanical Engineer', '⚙️', 'Engineering', 'Design machines', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'trades')),
    ('prm_aerospace_engineer', 'Aerospace Engineer', '🚁', 'Engineering', 'Design aircraft', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'trades')),
    ('prm_chemical_engineer', 'Chemical Engineer', '⚗️', 'Engineering', 'Design chemical processes', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'trades')),
    ('prm_environmental_engineer', 'Environmental Engineer', '♻️', 'Engineering', 'Solve environmental problems', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'trades')),

    -- Agriculture & Nature (Premium)
    ('prm_farmer', 'Farmer', '🌾', 'Agriculture', 'Grow crops and raise livestock', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_botanist', 'Botanist', '🌿', 'Agriculture', 'Study plants', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_forester', 'Forester', '🌲', 'Agriculture', 'Manage forests', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_landscape_architect', 'Landscape Architect', '🏞️', 'Agriculture', 'Design outdoor spaces', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),

    -- Legal (Premium)
    ('prm_lawyer', 'Lawyer', '⚖️', 'Legal', 'Practice law', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),
    ('prm_prosecutor', 'Prosecutor', '📋', 'Legal', 'Prosecute criminal cases', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),
    ('prm_defense_attorney', 'Defense Attorney', '🛡️', 'Legal', 'Defend clients', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),
    ('prm_paralegal', 'Paralegal', '📚', 'Legal', 'Assist lawyers', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'public_service')),

    -- Unique/Specialized (Premium)
    ('prm_astronaut', 'Space Tourist Guide', '🛸', 'Future', 'Guide space tourism', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science')),
    ('prm_ethical_hacker', 'Ethical Hacker', '💻', 'Technology', 'Test security systems', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_drone_operator', 'Drone Operator', '🚁', 'Technology', 'Operate drones professionally', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_virtual_reality_designer', 'VR Designer', '🥽', 'Technology', 'Create VR experiences', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'technology')),
    ('prm_sustainability_consultant', 'Sustainability Consultant', '🌍', 'Environment', 'Advise on sustainability', 'premium',
     (SELECT id FROM career_fields WHERE field_code = 'science'))
ON CONFLICT (career_code) DO NOTHING;

-- ============================================
-- CAREER PATH PROGRESSIONS FOR ALL CAREERS
-- ============================================

-- Create a function to generate progressions for all careers
CREATE OR REPLACE FUNCTION generate_career_progressions()
RETURNS void AS $$
DECLARE
    career_record RECORD;
BEGIN
    FOR career_record IN SELECT * FROM careers WHERE is_active = true
    LOOP
        -- Generate Trade Boost progression
        INSERT INTO career_path_progressions (base_career_id, progression_type, enhanced_career_name, enhanced_description, additional_skills)
        VALUES (
            career_record.id,
            'boost_trade',
            career_record.career_name || ' + Technical Specialist',
            'Master hands-on technical skills and equipment in ' || career_record.category,
            '["equipment_mastery", "tool_proficiency", "technical_certification", "safety_protocols"]'::jsonb
        ) ON CONFLICT (base_career_id, progression_type) DO NOTHING;

        -- Generate Corporate Boost progression
        INSERT INTO career_path_progressions (base_career_id, progression_type, enhanced_career_name, enhanced_description, additional_skills)
        VALUES (
            career_record.id,
            'boost_corporate',
            career_record.career_name || ' Manager',
            'Lead teams and manage operations in ' || career_record.category,
            '["team_leadership", "project_management", "strategic_planning", "corporate_communication"]'::jsonb
        ) ON CONFLICT (base_career_id, progression_type) DO NOTHING;

        -- Generate Business Boost progression
        INSERT INTO career_path_progressions (base_career_id, progression_type, enhanced_career_name, enhanced_description, additional_skills)
        VALUES (
            career_record.id,
            'boost_business',
            career_record.career_name || ' Business Owner',
            'Start and run your own ' || career_record.category || ' business',
            '["business_planning", "financial_management", "marketing", "customer_acquisition"]'::jsonb
        ) ON CONFLICT (base_career_id, progression_type) DO NOTHING;

        -- Generate AI First Boost progression
        INSERT INTO career_path_progressions (base_career_id, progression_type, enhanced_career_name, enhanced_description, additional_skills)
        VALUES (
            career_record.id,
            'boost_ai_first',
            'AI-Enhanced ' || career_record.career_name,
            'Integrate AI and automation into ' || career_record.category,
            '["ai_tools", "prompt_engineering", "automation", "data_analytics"]'::jsonb
        ) ON CONFLICT (base_career_id, progression_type) DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to generate all progressions
SELECT generate_career_progressions();

-- ============================================
-- VERIFY DATA
-- ============================================
DO $$
DECLARE
    career_count INTEGER;
    progression_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO career_count FROM careers WHERE is_active = true;
    SELECT COUNT(*) INTO progression_count FROM career_path_progressions;

    RAISE NOTICE 'Total careers created: %', career_count;
    RAISE NOTICE 'Total progressions created: %', progression_count;
    RAISE NOTICE 'Expected progressions (careers x 4 booster types): %', career_count * 4;
END $$;