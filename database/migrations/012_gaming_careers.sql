-- ================================================
-- Gaming & Esports Careers Migration
-- Properly named career titles from Gaming Careers 2025
-- ================================================

-- Check for duplicates before inserting
DO $$
BEGIN
    RAISE NOTICE 'Starting gaming careers migration...';
END $$;

-- Gaming & Esports Industry Careers
INSERT INTO career_paths (
    career_code, career_name, icon, color,
    grade_category, min_grade_level, max_grade_level,
    access_tier, career_category, description,
    is_active, display_order, is_featured, tags
) VALUES

-- ==== ELEMENTARY LEVEL - Visible Gaming Careers ====
-- Kids can see and understand these roles

('ELEM_GAME_TESTER', 'Game Tester', '🎮', '#10B981',
 'elementary', 'K', '5', 'basic', 'Technology',
 'Tests video games to find bugs and make them more fun to play',
 true, 150, false, ARRAY['gaming', 'quality', 'tech']),

('ELEM_ANIMATOR', 'Animator', '🎨', '#F59E0B',
 'elementary', 'K', '5', 'premium', 'Arts & Design',
 'Creates moving characters and scenes for games and movies',
 true, 151, true, ARRAY['gaming', 'art', 'animation']),

('ELEM_STREAMER', 'Streamer', '📹', '#9333EA',
 'elementary', 'K', '5', 'basic', 'Media & Entertainment',
 'Plays games online while others watch and creates gaming content',
 true, 152, false, ARRAY['gaming', 'streaming', 'content']),

('ELEM_VOICE_ACTOR', 'Voice Actor', '🎙️', '#EC4899',
 'elementary', 'K', '5', 'premium', 'Arts & Entertainment',
 'Provides voices for game characters and animated shows',
 true, 153, false, ARRAY['gaming', 'acting', 'voice']),

-- ==== MIDDLE SCHOOL LEVEL - Accessible Technical Roles ====

('MID_LEVEL_DESIGNER', 'Level Designer', '🗺️', '#6366F1',
 'middle', '6', '8', 'basic', 'Game Design',
 'Designs game levels, maps, and worlds for players to explore',
 true, 250, false, ARRAY['gaming', 'design', 'creative']),

('MID_CHARACTER_ARTIST', 'Character Artist', '🎭', '#EC4899',
 'middle', '6', '8', 'premium', 'Arts & Design',
 'Creates and designs game characters and their appearances',
 true, 251, false, ARRAY['gaming', 'art', 'character']),

('MID_CONCEPT_ARTIST', 'Concept Artist', '🖌️', '#8B5CF6',
 'middle', '6', '8', 'premium', 'Arts & Design',
 'Creates initial visual ideas and designs for games',
 true, 252, false, ARRAY['gaming', 'art', 'concept']),

('MID_SOUND_DESIGNER', 'Sound Designer', '🎵', '#14B8A6',
 'middle', '6', '8', 'premium', 'Audio Production',
 'Creates sound effects and audio environments for games',
 true, 253, false, ARRAY['gaming', 'audio', 'sound']),

('MID_COMMUNITY_MANAGER', 'Community Manager', '👥', '#059669',
 'middle', '6', '8', 'basic', 'Communications',
 'Manages gaming communities and connects players with developers',
 true, 254, false, ARRAY['gaming', 'social', 'community']),

('MID_ESPORTS_PLAYER', 'Professional Gamer', '🏆', '#EF4444',
 'middle', '6', '8', 'basic', 'Esports',
 'Competes professionally in video game tournaments',
 true, 255, true, ARRAY['gaming', 'esports', 'competition']),

('MID_CONTENT_CREATOR', 'Content Creator', '🎬', '#F97316',
 'middle', '6', '8', 'basic', 'Media',
 'Creates gaming videos, guides, and entertainment content',
 true, 256, false, ARRAY['gaming', 'content', 'media']),

('MID_QA_ANALYST', 'QA Analyst', '🔍', '#0EA5E9',
 'middle', '6', '8', 'basic', 'Quality Assurance',
 'Tests games thoroughly to ensure quality and find issues',
 true, 257, false, ARRAY['gaming', 'qa', 'testing']),

('MID_MOTION_CAPTURE', 'Motion Capture Specialist', '🏃', '#DC2626',
 'middle', '6', '8', 'premium', 'Technology',
 'Records real movements to create realistic game animations',
 true, 258, false, ARRAY['gaming', 'mocap', 'animation']),

('MID_NARRATIVE_DESIGNER', 'Narrative Designer', '📖', '#7C3AED',
 'middle', '6', '8', 'premium', 'Creative Writing',
 'Writes stories, quests, and dialogue for video games',
 true, 259, false, ARRAY['gaming', 'writing', 'narrative']),

('MID_UI_DESIGNER', 'UI Designer', '🎨', '#2563EB',
 'middle', '6', '8', 'basic', 'Design',
 'Designs game menus, interfaces, and player controls',
 true, 260, false, ARRAY['gaming', 'ui', 'design']),

('MID_ESPORTS_COACH', 'Esports Coach', '📋', '#DB2777',
 'middle', '6', '8', 'basic', 'Esports',
 'Trains and guides competitive gaming teams',
 true, 261, false, ARRAY['gaming', 'esports', 'coaching']),

-- ==== HIGH SCHOOL LEVEL - Advanced Technical & Business Roles ====

('HIGH_GAME_PROGRAMMER', 'Game Programmer', '💻', '#DC2626',
 'high', '9', '12', 'premium', 'Software Engineering',
 'Writes code that makes games work and brings designs to life',
 true, 350, true, ARRAY['gaming', 'programming', 'tech']),

('HIGH_AI_ENGINEER', 'AI Engineer', '🤖', '#059669',
 'high', '9', '12', 'premium', 'Artificial Intelligence',
 'Creates artificial intelligence for game characters and systems',
 true, 351, false, ARRAY['gaming', 'ai', 'programming']),

('HIGH_ENGINE_DEVELOPER', 'Game Engine Developer', '⚙️', '#7C3AED',
 'high', '9', '12', 'premium', 'Software Engineering',
 'Develops core technology and tools that power video games',
 true, 352, false, ARRAY['gaming', 'engine', 'tech']),

('HIGH_TECHNICAL_ARTIST', 'Technical Artist', '🎨', '#2563EB',
 'high', '9', '12', 'premium', 'Technical Design',
 'Bridges art and programming to create visual effects and tools',
 true, 353, false, ARRAY['gaming', 'tech-art', 'visual']),

('HIGH_GAME_PRODUCER', 'Game Producer', '🎬', '#DB2777',
 'high', '9', '12', 'premium', 'Project Management',
 'Manages game development projects from start to finish',
 true, 354, false, ARRAY['gaming', 'production', 'management']),

('HIGH_GAME_DIRECTOR', 'Game Director', '🎯', '#EA580C',
 'high', '9', '12', 'premium', 'Creative Direction',
 'Leads creative vision and overall game design',
 true, 355, true, ARRAY['gaming', 'direction', 'leadership']),

('HIGH_GAMEPLAY_ENGINEER', 'Gameplay Engineer', '🎮', '#0891B2',
 'high', '9', '12', 'premium', 'Software Engineering',
 'Programs core game mechanics and player interactions',
 true, 356, false, ARRAY['gaming', 'gameplay', 'programming']),

('HIGH_NETWORK_ENGINEER', 'Network Engineer', '🌐', '#9333EA',
 'high', '9', '12', 'premium', 'Network Technology',
 'Builds multiplayer systems and online game infrastructure',
 true, 357, false, ARRAY['gaming', 'networking', 'multiplayer']),

('HIGH_VR_DEVELOPER', 'VR/AR Developer', '🥽', '#16A34A',
 'high', '9', '12', 'premium', 'Emerging Technology',
 'Creates virtual and augmented reality gaming experiences',
 true, 358, true, ARRAY['gaming', 'vr', 'ar', 'tech']),

('HIGH_DATA_ANALYST', 'Game Data Analyst', '📊', '#E11D48',
 'high', '9', '12', 'basic', 'Analytics',
 'Analyzes player behavior and game metrics to improve experiences',
 true, 359, false, ARRAY['gaming', 'analytics', 'data']),

('HIGH_ECONOMY_DESIGNER', 'Game Economy Designer', '💰', '#F59E0B',
 'high', '9', '12', 'premium', 'Game Design',
 'Designs and balances in-game economies and monetization',
 true, 360, false, ARRAY['gaming', 'economy', 'design']),

('HIGH_LOCALIZATION_SPEC', 'Localization Specialist', '🌍', '#8B5CF6',
 'high', '9', '12', 'basic', 'Translation',
 'Adapts games for different languages and cultures',
 true, 361, false, ARRAY['gaming', 'localization', 'translation']),

('HIGH_ESPORTS_MANAGER', 'Esports Manager', '🏅', '#14B8A6',
 'high', '9', '12', 'basic', 'Esports Management',
 'Manages professional esports teams and events',
 true, 362, false, ARRAY['gaming', 'esports', 'management']),

('HIGH_MARKETING_MANAGER', 'Gaming Marketing Manager', '📢', '#F97316',
 'high', '9', '12', 'basic', 'Marketing',
 'Develops marketing strategies for games and gaming products',
 true, 363, false, ARRAY['gaming', 'marketing', 'business']),

('HIGH_UX_RESEARCHER', 'UX Researcher', '🔬', '#0EA5E9',
 'high', '9', '12', 'premium', 'User Research',
 'Studies how players interact with games to improve design',
 true, 364, false, ARRAY['gaming', 'ux', 'research']),

('HIGH_TALENT_SCOUT', 'Esports Talent Scout', '🔍', '#6366F1',
 'high', '9', '12', 'basic', 'Talent Management',
 'Discovers and recruits talented players for esports teams',
 true, 365, false, ARRAY['gaming', 'esports', 'scouting']),

('HIGH_STREAMING_ENGINEER', 'Streaming Platform Engineer', '📡', '#EC4899',
 'high', '9', '12', 'premium', 'Platform Engineering',
 'Builds technology for game streaming services',
 true, 366, false, ARRAY['gaming', 'streaming', 'infrastructure']),

('HIGH_COMPLIANCE_MANAGER', 'Gaming Compliance Manager', '📋', '#10B981',
 'high', '9', '12', 'basic', 'Legal & Compliance',
 'Ensures games meet legal and rating requirements',
 true, 367, false, ARRAY['gaming', 'compliance', 'legal']),

('HIGH_BUSINESS_ANALYST', 'Gaming Business Analyst', '💼', '#EF4444',
 'high', '9', '12', 'basic', 'Business Strategy',
 'Analyzes gaming market trends and business opportunities',
 true, 368, false, ARRAY['gaming', 'business', 'strategy'])

ON CONFLICT (career_code) DO UPDATE SET
    career_name = EXCLUDED.career_name,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    updated_at = CURRENT_TIMESTAMP
WHERE career_paths.career_name != EXCLUDED.career_name;

-- Report on what was added
WITH gaming_summary AS (
    SELECT
        grade_category,
        access_tier,
        COUNT(*) as count
    FROM career_paths
    WHERE tags && ARRAY['gaming']
       OR tags && ARRAY['esports']
       OR career_category ILIKE '%game%'
       OR career_category ILIKE '%esport%'
    GROUP BY grade_category, access_tier
)
SELECT
    '📊 Gaming Careers Summary' as report,
    grade_category,
    SUM(CASE WHEN access_tier = 'basic' THEN count ELSE 0 END) as basic_count,
    SUM(CASE WHEN access_tier = 'premium' THEN count ELSE 0 END) as premium_count,
    SUM(count) as total
FROM gaming_summary
GROUP BY grade_category
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
    END;

-- List all gaming careers for verification
SELECT
    '🎮 All Gaming Careers' as section,
    career_name,
    grade_category,
    access_tier,
    career_category
FROM career_paths
WHERE tags && ARRAY['gaming']
   OR tags && ARRAY['esports']
   OR career_category ILIKE '%game%'
   OR career_category ILIKE '%esport%'
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
    END,
    career_name;