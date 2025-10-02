-- ================================================
-- Specialized Industry Careers from Teacher Dashboard
-- Based on career focus areas: Culinary, Library Science, Environmental, Community
-- ================================================

INSERT INTO career_paths (
    career_code, career_name, icon, color,
    grade_category, min_grade_level, max_grade_level,
    access_tier, career_category, description,
    is_active, display_order, is_featured, tags
) VALUES

-- ==== CULINARY & FOOD SERVICE CAREERS ====
-- Elementary Level

('ELEM_CHEF', 'Chef', '👨‍🍳', '#F59E0B',
 'elementary', 'K', '5', 'basic', 'Culinary Arts',
 'Creates delicious meals and new recipes in restaurants',
 true, 180, true, ARRAY['culinary', 'food', 'creative']),

('ELEM_BAKER', 'Baker', '🥖', '#D97706',
 'elementary', 'K', '5', 'basic', 'Culinary Arts',
 'Makes bread, cakes, and pastries for people to enjoy',
 true, 181, false, ARRAY['culinary', 'baking', 'food']),

('ELEM_FARMER', 'Farmer', '🌾', '#84CC16',
 'elementary', 'K', '5', 'basic', 'Agriculture',
 'Grows food and raises animals that feed our communities',
 true, 182, false, ARRAY['agriculture', 'food', 'environment']),

-- Middle School Level

('MID_PASTRY_CHEF', 'Pastry Chef', '🍰', '#EC4899',
 'middle', '6', '8', 'premium', 'Culinary Arts',
 'Specializes in creating desserts, pastries, and sweet treats',
 true, 280, false, ARRAY['culinary', 'pastry', 'creative']),

('MID_FOOD_SCIENTIST', 'Food Scientist', '🔬', '#8B5CF6',
 'middle', '6', '8', 'premium', 'Food Science',
 'Studies food safety, nutrition, and develops new food products',
 true, 281, false, ARRAY['science', 'food', 'research']),

('MID_RESTAURANT_MGR', 'Restaurant Manager', '🍽️', '#EF4444',
 'middle', '6', '8', 'basic', 'Hospitality',
 'Manages restaurant operations and ensures great customer experiences',
 true, 282, false, ARRAY['management', 'hospitality', 'food']),

('MID_FOOD_CRITIC', 'Food Critic', '📝', '#06B6D4',
 'middle', '6', '8', 'premium', 'Media & Journalism',
 'Reviews restaurants and writes about food experiences',
 true, 283, false, ARRAY['writing', 'food', 'media']),

-- High School Level

('HIGH_SOMMELIER', 'Sommelier', '🍷', '#991B1B',
 'high', '9', '12', 'premium', 'Culinary Arts',
 'Wine expert who helps select and pair wines with food',
 true, 400, false, ARRAY['culinary', 'wine', 'hospitality']),

('HIGH_FOOD_ENGINEER', 'Food Engineer', '⚙️', '#059669',
 'high', '9', '12', 'premium', 'Food Technology',
 'Designs food processing systems and equipment',
 true, 401, false, ARRAY['engineering', 'food', 'technology']),

('HIGH_CULINARY_INSTRUCTOR', 'Culinary Instructor', '👩‍🏫', '#7C3AED',
 'high', '9', '12', 'basic', 'Education',
 'Teaches culinary arts and cooking techniques to students',
 true, 402, false, ARRAY['education', 'culinary', 'teaching']),

-- ==== LIBRARY & INFORMATION SCIENCE CAREERS ====
-- Elementary Level

('ELEM_LIBRARIAN', 'Librarian', '📚', '#3B82F6',
 'elementary', 'K', '5', 'basic', 'Library Science',
 'Helps people find books and information they need',
 true, 183, true, ARRAY['library', 'books', 'education']),

('ELEM_STORYTELLER', 'Storyteller', '📖', '#A855F7',
 'elementary', 'K', '5', 'basic', 'Arts & Entertainment',
 'Shares stories that entertain and teach important lessons',
 true, 184, false, ARRAY['storytelling', 'education', 'creative']),

-- Middle School Level

('MID_ARCHIVIST', 'Archivist', '🗄️', '#6B7280',
 'middle', '6', '8', 'premium', 'Information Science',
 'Preserves important historical documents and records',
 true, 284, false, ARRAY['history', 'preservation', 'research']),

('MID_RESEARCH_LIBRARIAN', 'Research Librarian', '🔍', '#0891B2',
 'middle', '6', '8', 'premium', 'Library Science',
 'Helps people find specialized information for research',
 true, 285, false, ARRAY['research', 'library', 'information']),

('MID_INFO_SPECIALIST', 'Information Specialist', '💾', '#4F46E5',
 'middle', '6', '8', 'basic', 'Information Technology',
 'Organizes and manages digital information systems',
 true, 286, false, ARRAY['information', 'technology', 'data']),

-- High School Level

('HIGH_DATA_LIBRARIAN', 'Data Librarian', '📊', '#7C3AED',
 'high', '9', '12', 'premium', 'Data Science',
 'Manages research data and helps scientists organize information',
 true, 403, false, ARRAY['data', 'library', 'science']),

('HIGH_DIGITAL_ARCHIVIST', 'Digital Archivist', '💻', '#10B981',
 'high', '9', '12', 'premium', 'Digital Preservation',
 'Preserves digital content and electronic records',
 true, 404, false, ARRAY['digital', 'preservation', 'technology']),

('HIGH_INFO_ARCHITECT', 'Information Architect', '🏗️', '#F59E0B',
 'high', '9', '12', 'premium', 'Information Design',
 'Designs how information is organized and accessed',
 true, 405, false, ARRAY['design', 'information', 'ux']),

-- ==== ENVIRONMENTAL & CONSERVATION CAREERS ====
-- Elementary Level

('ELEM_PARK_RANGER', 'Park Ranger', '🏞️', '#10B981',
 'elementary', 'K', '5', 'basic', 'Environmental Science',
 'Protects nature and teaches people about the environment',
 true, 185, true, ARRAY['environment', 'nature', 'conservation']),

('ELEM_WILDLIFE_RESCUE', 'Wildlife Rescuer', '🦌', '#059669',
 'elementary', 'K', '5', 'premium', 'Animal Care',
 'Helps injured wild animals and returns them to nature',
 true, 186, false, ARRAY['animals', 'conservation', 'care']),

-- Middle School Level

('MID_CONSERVATIONIST', 'Conservation Scientist', '🌳', '#16A34A',
 'middle', '6', '8', 'premium', 'Environmental Science',
 'Studies how to protect natural resources and ecosystems',
 true, 287, false, ARRAY['science', 'environment', 'research']),

('MID_ENV_EDUCATOR', 'Environmental Educator', '🌍', '#22C55E',
 'middle', '6', '8', 'basic', 'Education',
 'Teaches people about environmental protection and sustainability',
 true, 288, false, ARRAY['education', 'environment', 'teaching']),

('MID_RECYCLING_COORD', 'Recycling Coordinator', '♻️', '#84CC16',
 'middle', '6', '8', 'basic', 'Environmental Services',
 'Manages recycling programs to reduce waste',
 true, 289, false, ARRAY['recycling', 'environment', 'sustainability']),

-- High School Level

('HIGH_ENV_ENGINEER', 'Environmental Engineer', '🔧', '#059669',
 'high', '9', '12', 'premium', 'Environmental Engineering',
 'Designs solutions to environmental problems',
 true, 406, false, ARRAY['engineering', 'environment', 'technology']),

('HIGH_CLIMATE_SCIENTIST', 'Climate Scientist', '🌡️', '#0EA5E9',
 'high', '9', '12', 'premium', 'Climate Science',
 'Studies climate change and its impacts on Earth',
 true, 407, true, ARRAY['science', 'climate', 'research']),

('HIGH_SUSTAINABILITY_MGR', 'Sustainability Manager', '🌱', '#10B981',
 'high', '9', '12', 'premium', 'Sustainability',
 'Helps organizations become more environmentally friendly',
 true, 408, false, ARRAY['sustainability', 'business', 'environment']),

('HIGH_RENEWABLE_ENERGY', 'Renewable Energy Specialist', '☀️', '#FCD34D',
 'high', '9', '12', 'premium', 'Energy',
 'Develops clean energy solutions like solar and wind power',
 true, 409, false, ARRAY['energy', 'renewable', 'technology']),

-- ==== COMMUNITY & CIVIC ENGAGEMENT CAREERS ====
-- Elementary Level

('ELEM_MAYOR', 'Mayor', '🏛️', '#6366F1',
 'elementary', 'K', '5', 'basic', 'Government',
 'Leads a city and makes decisions for the community',
 true, 187, false, ARRAY['government', 'leadership', 'community']),

('ELEM_SOCIAL_WORKER', 'Social Worker', '🤝', '#EC4899',
 'elementary', 'K', '5', 'basic', 'Social Services',
 'Helps families and children who need support',
 true, 188, false, ARRAY['social', 'helping', 'community']),

-- Middle School Level

('MID_CITY_PLANNER', 'City Planner', '🏙️', '#8B5CF6',
 'middle', '6', '8', 'premium', 'Urban Planning',
 'Designs how cities grow and develop',
 true, 290, false, ARRAY['planning', 'urban', 'design']),

('MID_COMMUNITY_ORG', 'Community Organizer', '📢', '#F97316',
 'middle', '6', '8', 'basic', 'Community Development',
 'Brings people together to improve their neighborhoods',
 true, 291, false, ARRAY['community', 'organizing', 'social']),

('MID_YOUTH_COUNSELOR', 'Youth Counselor', '👥', '#06B6D4',
 'middle', '6', '8', 'basic', 'Youth Services',
 'Mentors and guides young people through challenges',
 true, 292, false, ARRAY['youth', 'counseling', 'mentoring']),

-- High School Level

('HIGH_POLICY_ANALYST', 'Policy Analyst', '📋', '#4F46E5',
 'high', '9', '12', 'premium', 'Public Policy',
 'Studies and recommends government policies',
 true, 410, false, ARRAY['policy', 'government', 'analysis']),

('HIGH_NONPROFIT_DIR', 'Nonprofit Director', '❤️', '#DC2626',
 'high', '9', '12', 'premium', 'Nonprofit Management',
 'Leads organizations that help communities',
 true, 411, false, ARRAY['nonprofit', 'leadership', 'community']),

('HIGH_URBAN_DESIGNER', 'Urban Designer', '🌆', '#7C3AED',
 'high', '9', '12', 'premium', 'Urban Design',
 'Creates beautiful and functional public spaces',
 true, 412, false, ARRAY['design', 'urban', 'architecture']),

('HIGH_PUBLIC_HEALTH', 'Public Health Specialist', '🏥', '#EF4444',
 'high', '9', '12', 'premium', 'Public Health',
 'Works to improve health outcomes for entire communities',
 true, 413, false, ARRAY['health', 'public', 'community'])

ON CONFLICT (career_code) DO UPDATE SET
    career_name = EXCLUDED.career_name,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    updated_at = CURRENT_TIMESTAMP
WHERE career_paths.career_name != EXCLUDED.career_name;

-- Summary report
SELECT
    '📊 Specialized Industries Summary' as report,
    career_category,
    grade_category,
    COUNT(*) as count
FROM career_paths
WHERE career_code IN (
    SELECT career_code FROM career_paths
    WHERE career_category IN ('Culinary Arts', 'Library Science', 'Environmental Science', 'Government', 'Community Development')
       OR tags && ARRAY['culinary', 'library', 'environment', 'community', 'civic']
)
GROUP BY career_category, grade_category
ORDER BY career_category,
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
    END;