-- ================================================
-- High Parent Engagement Careers
-- Religious, Nonprofit, Philanthropy, Humanitarian, Professional Sports
-- ================================================

INSERT INTO career_paths (
    career_code, career_name, icon, color,
    grade_category, min_grade_level, max_grade_level,
    access_tier, career_category, description,
    is_active, display_order, is_featured, tags
) VALUES

-- ==== RELIGIOUS & FAITH-BASED CAREERS ====
-- Elementary Level

('ELEM_PASTOR', 'Pastor/Minister', '⛪', '#8B5CF6',
 'elementary', 'K', '5', 'basic', 'Religious Services',
 'Leads religious services and helps people in their faith',
 true, 190, false, ARRAY['religious', 'faith', 'community']),

('ELEM_YOUTH_MINISTER', 'Youth Minister', '🙏', '#7C3AED',
 'elementary', 'K', '5', 'basic', 'Religious Services',
 'Teaches and guides young people in faith communities',
 true, 191, false, ARRAY['religious', 'youth', 'education']),

-- Middle School Level

('MID_CHAPLAIN', 'Chaplain', '✝️', '#9333EA',
 'middle', '6', '8', 'basic', 'Religious Services',
 'Provides spiritual care in hospitals, military, and schools',
 true, 293, false, ARRAY['religious', 'counseling', 'care']),

('MID_MISSION_WORKER', 'Missionary', '🌍', '#A855F7',
 'middle', '6', '8', 'premium', 'Religious Services',
 'Travels to share faith and help communities worldwide',
 true, 294, false, ARRAY['religious', 'travel', 'service']),

('MID_WORSHIP_LEADER', 'Worship Leader', '🎵', '#6366F1',
 'middle', '6', '8', 'basic', 'Religious Services',
 'Leads music and worship in religious services',
 true, 295, false, ARRAY['religious', 'music', 'leadership']),

-- High School Level

('HIGH_THEOLOGIAN', 'Theologian', '📖', '#7C3AED',
 'high', '9', '12', 'premium', 'Religious Studies',
 'Studies and teaches religious texts and beliefs',
 true, 420, false, ARRAY['religious', 'education', 'research']),

('HIGH_RELIGIOUS_ED', 'Religious Education Director', '📚', '#8B5CF6',
 'high', '9', '12', 'basic', 'Religious Education',
 'Develops and leads religious education programs',
 true, 421, false, ARRAY['religious', 'education', 'leadership']),

-- ==== NONPROFIT & PHILANTHROPY CAREERS ====
-- Elementary Level

('ELEM_CHARITY_WORKER', 'Charity Worker', '❤️', '#EF4444',
 'elementary', 'K', '5', 'basic', 'Nonprofit',
 'Helps run organizations that support people in need',
 true, 192, false, ARRAY['nonprofit', 'charity', 'helping']),

('ELEM_FUNDRAISER', 'Fundraiser', '💝', '#DC2626',
 'elementary', 'K', '5', 'basic', 'Nonprofit',
 'Raises money to help good causes and charities',
 true, 193, false, ARRAY['nonprofit', 'fundraising', 'community']),

-- Middle School Level

('MID_GRANT_WRITER', 'Grant Writer', '✍️', '#F87171',
 'middle', '6', '8', 'premium', 'Nonprofit',
 'Writes proposals to get funding for important projects',
 true, 296, false, ARRAY['nonprofit', 'writing', 'fundraising']),

('MID_VOLUNTEER_COORD', 'Volunteer Coordinator', '🤝', '#EF4444',
 'middle', '6', '8', 'basic', 'Nonprofit',
 'Organizes volunteers to help community programs',
 true, 297, false, ARRAY['nonprofit', 'volunteer', 'organizing']),

('MID_PROGRAM_DIRECTOR', 'Program Director', '📋', '#DC2626',
 'middle', '6', '8', 'premium', 'Nonprofit',
 'Manages programs that help communities',
 true, 298, false, ARRAY['nonprofit', 'management', 'programs']),

-- High School Level

('HIGH_FOUNDATION_DIR', 'Foundation Director', '🏛️', '#991B1B',
 'high', '9', '12', 'premium', 'Philanthropy',
 'Leads organizations that give money to good causes',
 true, 422, false, ARRAY['philanthropy', 'leadership', 'giving']),

('HIGH_PHILANTHROPIST', 'Philanthropist', '💎', '#B91C1C',
 'high', '9', '12', 'premium', 'Philanthropy',
 'Uses wealth to help solve world problems',
 true, 423, true, ARRAY['philanthropy', 'giving', 'impact']),

('HIGH_DEV_DIRECTOR', 'Development Director', '📈', '#DC2626',
 'high', '9', '12', 'premium', 'Nonprofit',
 'Leads fundraising efforts for nonprofit organizations',
 true, 424, false, ARRAY['nonprofit', 'fundraising', 'leadership']),

('HIGH_IMPACT_INVESTOR', 'Impact Investor', '🌟', '#EF4444',
 'high', '9', '12', 'premium', 'Social Finance',
 'Invests money in companies that do good for society',
 true, 425, false, ARRAY['impact', 'investing', 'social']),

-- ==== HUMANITARIAN CAREERS ====
-- Elementary Level

('ELEM_PEACE_WORKER', 'Peace Worker', '☮️', '#06B6D4',
 'elementary', 'K', '5', 'basic', 'Humanitarian',
 'Helps people resolve conflicts peacefully',
 true, 194, false, ARRAY['peace', 'humanitarian', 'conflict']),

('ELEM_DISASTER_HELPER', 'Disaster Relief Worker', '🚨', '#0891B2',
 'elementary', 'K', '5', 'basic', 'Emergency Services',
 'Helps people after natural disasters and emergencies',
 true, 195, false, ARRAY['disaster', 'relief', 'emergency']),

-- Middle School Level

('MID_HUMANITARIAN', 'Humanitarian Aid Worker', '🤲', '#0EA5E9',
 'middle', '6', '8', 'premium', 'Humanitarian',
 'Delivers aid to people in crisis around the world',
 true, 299, true, ARRAY['humanitarian', 'aid', 'global']),

('MID_REFUGEE_WORKER', 'Refugee Support Worker', '🏠', '#06B6D4',
 'middle', '6', '8', 'premium', 'Humanitarian',
 'Helps refugees find safety and start new lives',
 true, 300, false, ARRAY['refugee', 'humanitarian', 'support']),

('MID_HUMAN_RIGHTS', 'Human Rights Advocate', '⚖️', '#0284C7',
 'middle', '6', '8', 'premium', 'Advocacy',
 'Fights for people''s rights and freedoms',
 true, 301, false, ARRAY['rights', 'advocacy', 'justice']),

-- High School Level

('HIGH_UN_WORKER', 'UN Program Officer', '🌐', '#0369A1',
 'high', '9', '12', 'premium', 'International Relations',
 'Works with the United Nations to solve global problems',
 true, 426, false, ARRAY['UN', 'international', 'diplomacy']),

('HIGH_PEACE_MEDIATOR', 'International Mediator', '🕊️', '#075985',
 'high', '9', '12', 'premium', 'Conflict Resolution',
 'Helps countries and groups resolve conflicts peacefully',
 true, 427, false, ARRAY['peace', 'mediation', 'international']),

('HIGH_RELIEF_DIRECTOR', 'Relief Operations Director', '🚁', '#0C4A6E',
 'high', '9', '12', 'premium', 'Emergency Management',
 'Manages large-scale disaster relief operations',
 true, 428, false, ARRAY['disaster', 'management', 'relief']),

('HIGH_GLOBAL_HEALTH', 'Global Health Specialist', '🌍', '#0EA5E9',
 'high', '9', '12', 'premium', 'Public Health',
 'Works to improve health conditions worldwide',
 true, 429, false, ARRAY['health', 'global', 'humanitarian']),

-- ==== PROFESSIONAL SPORTS CAREERS ====
-- Elementary Level

('ELEM_SOCCER_PLAYER', 'Soccer Player', '⚽', '#10B981',
 'elementary', 'K', '5', 'basic', 'Professional Sports',
 'Plays soccer professionally for teams around the world',
 true, 196, true, ARRAY['sports', 'soccer', 'athlete']),

('ELEM_BASEBALL_PLAYER', 'Baseball Player', '⚾', '#059669',
 'elementary', 'K', '5', 'basic', 'Professional Sports',
 'Plays baseball professionally in major leagues',
 true, 197, true, ARRAY['sports', 'baseball', 'athlete']),

('ELEM_COACH', 'Sports Coach', '🏃', '#047857',
 'elementary', 'K', '5', 'basic', 'Sports Coaching',
 'Teaches and trains athletes to be their best',
 true, 198, false, ARRAY['sports', 'coaching', 'teaching']),

('ELEM_REFEREE', 'Referee/Umpire', '🏁', '#065F46',
 'elementary', 'K', '5', 'basic', 'Sports Officiating',
 'Makes sure sports games are played fairly',
 true, 199, false, ARRAY['sports', 'officiating', 'fairness']),

-- Middle School Level

('MID_FOOTBALL_PLAYER', 'Football Player', '🏈', '#15803D',
 'middle', '6', '8', 'premium', 'Professional Sports',
 'Plays American football professionally',
 true, 302, true, ARRAY['sports', 'football', 'athlete']),

('MID_BASKETBALL_PLAYER', 'Basketball Player', '🏀', '#166534',
 'middle', '6', '8', 'premium', 'Professional Sports',
 'Plays basketball professionally',
 true, 303, true, ARRAY['sports', 'basketball', 'athlete']),

('MID_TENNIS_PLAYER', 'Tennis Player', '🎾', '#14532D',
 'middle', '6', '8', 'premium', 'Professional Sports',
 'Competes professionally in tennis tournaments',
 true, 304, false, ARRAY['sports', 'tennis', 'athlete']),

('MID_GOLFER', 'Professional Golfer', '⛳', '#052E16',
 'middle', '6', '8', 'premium', 'Professional Sports',
 'Plays golf professionally on tours',
 true, 305, false, ARRAY['sports', 'golf', 'athlete']),

('MID_SPORTS_TRAINER', 'Athletic Trainer', '💪', '#10B981',
 'middle', '6', '8', 'basic', 'Sports Medicine',
 'Helps athletes stay healthy and recover from injuries',
 true, 306, false, ARRAY['sports', 'health', 'training']),

('MID_SPORTS_AGENT', 'Sports Agent', '📝', '#059669',
 'middle', '6', '8', 'premium', 'Sports Management',
 'Represents athletes and negotiates contracts',
 true, 307, false, ARRAY['sports', 'agent', 'business']),

('MID_SPORTS_PSYCH', 'Sports Psychologist', '🧠', '#047857',
 'middle', '6', '8', 'premium', 'Sports Psychology',
 'Helps athletes with mental preparation and performance',
 true, 308, false, ARRAY['sports', 'psychology', 'mental']),

('MID_SPORTS_CASTER', 'Sports Broadcaster', '🎙️', '#065F46',
 'middle', '6', '8', 'basic', 'Sports Media',
 'Announces games and reports on sports news',
 true, 309, false, ARRAY['sports', 'media', 'broadcasting']),

('MID_SCOUT', 'Talent Scout', '🔍', '#064E3B',
 'middle', '6', '8', 'basic', 'Talent Scouting',
 'Finds and recruits talented young athletes',
 true, 310, false, ARRAY['sports', 'scouting', 'talent']),

-- High School Level

('HIGH_NFL_PLAYER', 'NFL Player', '🏈', '#15803D',
 'high', '9', '12', 'premium', 'Professional Sports',
 'Plays in the National Football League',
 true, 430, true, ARRAY['sports', 'NFL', 'football', 'professional']),

('HIGH_NBA_PLAYER', 'NBA Player', '🏀', '#166534',
 'high', '9', '12', 'premium', 'Professional Sports',
 'Plays in the National Basketball Association',
 true, 431, true, ARRAY['sports', 'NBA', 'basketball', 'professional']),

('HIGH_MLB_PLAYER', 'MLB Player', '⚾', '#14532D',
 'high', '9', '12', 'premium', 'Professional Sports',
 'Plays in Major League Baseball',
 true, 432, true, ARRAY['sports', 'MLB', 'baseball', 'professional']),

('HIGH_MLS_PLAYER', 'MLS Player', '⚽', '#052E16',
 'high', '9', '12', 'premium', 'Professional Sports',
 'Plays in Major League Soccer',
 true, 433, true, ARRAY['sports', 'MLS', 'soccer', 'professional']),

('HIGH_OLYMPIC_ATHLETE', 'Olympic Athlete', '🥇', '#10B981',
 'high', '9', '12', 'premium', 'Olympic Sports',
 'Competes at the Olympics representing their country',
 true, 434, true, ARRAY['sports', 'olympics', 'elite']),

('HIGH_SPORTS_GM', 'General Manager', '🏆', '#059669',
 'high', '9', '12', 'premium', 'Sports Management',
 'Manages entire sports teams and organizations',
 true, 435, false, ARRAY['sports', 'management', 'leadership']),

('HIGH_SPORTS_MED_DR', 'Sports Medicine Doctor', '⚕️', '#047857',
 'high', '9', '12', 'premium', 'Sports Medicine',
 'Provides medical care for professional athletes',
 true, 436, false, ARRAY['sports', 'medicine', 'doctor']),

('HIGH_SPORTS_ANALYST', 'Sports Analytics Director', '📊', '#065F46',
 'high', '9', '12', 'premium', 'Sports Analytics',
 'Uses data to improve team performance and strategy',
 true, 437, false, ARRAY['sports', 'analytics', 'data']),

('HIGH_FITNESS_EMPIRE', 'Fitness Entrepreneur', '💼', '#064E3B',
 'high', '9', '12', 'premium', 'Fitness Business',
 'Builds fitness brands and training businesses',
 true, 438, false, ARRAY['sports', 'fitness', 'entrepreneur']),

('HIGH_SPORTS_LAWYER', 'Sports Lawyer', '⚖️', '#052E16',
 'high', '9', '12', 'premium', 'Sports Law',
 'Handles legal matters for athletes and teams',
 true, 439, false, ARRAY['sports', 'law', 'legal']),

('HIGH_SPORTS_MARKETER', 'Sports Marketing Director', '📣', '#10B981',
 'high', '9', '12', 'premium', 'Sports Marketing',
 'Markets teams, athletes, and sporting events',
 true, 440, false, ARRAY['sports', 'marketing', 'promotion'])

ON CONFLICT (career_code) DO UPDATE SET
    career_name = EXCLUDED.career_name,
    description = EXCLUDED.description,
    tags = EXCLUDED.tags,
    updated_at = CURRENT_TIMESTAMP
WHERE career_paths.career_name != EXCLUDED.career_name;

-- Summary report
SELECT
    '📊 High Parent Engagement Careers' as report,
    CASE
        WHEN career_category LIKE '%Religious%' THEN 'Religious/Faith'
        WHEN career_category LIKE '%Nonprofit%' OR career_category LIKE '%Philanthropy%' THEN 'Nonprofit/Philanthropy'
        WHEN career_category LIKE '%Humanitarian%' OR career_category LIKE '%Emergency%' THEN 'Humanitarian'
        WHEN career_category LIKE '%Sport%' OR tags && ARRAY['sports'] THEN 'Professional Sports'
        ELSE 'Other'
    END as category_group,
    grade_category,
    COUNT(*) as count,
    COUNT(CASE WHEN access_tier = 'basic' THEN 1 END) as basic,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium
FROM career_paths
WHERE career_category IN ('Religious Services', 'Religious Studies', 'Religious Education',
                          'Nonprofit', 'Philanthropy', 'Social Finance',
                          'Humanitarian', 'Emergency Services', 'Emergency Management',
                          'Professional Sports', 'Sports Coaching', 'Sports Medicine',
                          'Sports Management', 'Sports Media', 'Sports Analytics')
   OR tags && ARRAY['religious', 'nonprofit', 'philanthropy', 'humanitarian', 'sports']
GROUP BY category_group, grade_category
ORDER BY category_group,
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
    END;