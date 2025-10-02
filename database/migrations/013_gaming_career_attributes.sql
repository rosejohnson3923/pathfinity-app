-- ================================================
-- Gaming Career Attributes
-- Engagement ratings and metadata for gaming careers
-- ================================================

INSERT INTO career_attributes (
    career_code,
    ers_student_engagement, erp_parent_engagement, ere_employer_engagement,
    interaction_frequency,
    lir_legacy_rating, eir_emerging_rating, air_ai_first_rating,
    industry_sector, career_cluster,
    automation_risk, remote_work_potential,
    fun_facts, day_in_life_description, why_its_exciting
) VALUES

-- ==== ELEMENTARY GAMING CAREERS ====
('ELEM_GAME_TESTER', 85, 60, 70, 'MIF', 30, 70, 40,
 'Technology', 'Information Technology', 'Medium', 'High',
 ARRAY[
   'Game testers play games before anyone else',
   'They help make games better and more fun',
   'Bug reports can change how games work'
 ],
 'Play different parts of games many times, write down problems you find, suggest improvements, work with game developers',
 'Be the first to play new games and help make them amazing!'),

('ELEM_ANIMATOR', 90, 70, 80, 'MIF', 40, 85, 70,
 'Creative', 'Arts, A/V Technology & Communications', 'Low', 'High',
 ARRAY[
   'Pixar animators bring toys to life',
   'One second of animation can take hours to create',
   'Animation is used in games, movies, and apps'
 ],
 'Draw characters, create movement frame by frame, use animation software, work with art teams',
 'Bring characters to life and create magical moving stories!'),

('ELEM_STREAMER', 95, 40, 75, 'HIF', 10, 90, 60,
 'Entertainment', 'Arts, A/V Technology & Communications', 'Low', 'Full',
 ARRAY[
   'Top streamers have millions of fans',
   'You can stream from anywhere in the world',
   'Streaming is like having your own TV show'
 ],
 'Play games while talking to viewers, create fun content, edit videos, build a community of fans',
 'Share your gaming adventures with friends around the world!'),

('ELEM_VOICE_ACTOR', 88, 65, 75, 'LIF', 50, 70, 30,
 'Entertainment', 'Arts, A/V Technology & Communications', 'Low', 'High',
 ARRAY[
   'Voice actors bring characters to life',
   'They can voice multiple characters in one game',
   'Famous actors often voice game characters'
 ],
 'Practice different voices, record in studios, work with directors, bring emotion to characters',
 'Become the voice of beloved game characters!'),

-- ==== MIDDLE SCHOOL GAMING CAREERS ====
('MID_LEVEL_DESIGNER', 92, 75, 85, 'MIF', 20, 85, 65,
 'Game Design', 'Information Technology', 'Low', 'High',
 ARRAY[
   'Level designers create entire game worlds',
   'Famous levels become gaming legends',
   'Psychology helps design fun challenges'
 ],
 'Sketch level layouts, test gameplay flow, place enemies and items, work with artists and programmers',
 'Design the worlds that millions of players will explore and love!'),

('MID_CHARACTER_ARTIST', 88, 72, 82, 'LIF', 25, 80, 75,
 'Creative', 'Arts, A/V Technology & Communications', 'Low', 'High',
 ARRAY[
   'Character artists create gaming icons',
   'One character can take weeks to perfect',
   'Great characters become cultural phenomena'
 ],
 'Design character looks, create 3D models, paint textures, work with animators',
 'Create the heroes and villains players will never forget!'),

('MID_CONCEPT_ARTIST', 87, 73, 80, 'LIF', 30, 82, 68,
 'Creative', 'Arts, A/V Technology & Communications', 'Low', 'High',
 ARRAY[
   'Concept art inspires entire games',
   'Artists imagine worlds before they exist',
   'Concept art becomes collectible'
 ],
 'Create initial designs, paint environments, design creatures, inspire the team with visuals',
 'Be the first to imagine new worlds and bring them to life!'),

('MID_SOUND_DESIGNER', 82, 68, 78, 'LIF', 35, 75, 60,
 'Audio Production', 'Arts, A/V Technology & Communications', 'Low', 'High',
 ARRAY[
   'Sound effects make games feel real',
   'One game can have thousands of sounds',
   'Sound designers create imaginary noises'
 ],
 'Record real sounds, create digital effects, compose ambient music, test audio in games',
 'Create the sounds that make virtual worlds feel alive!'),

('MID_COMMUNITY_MANAGER', 85, 65, 75, 'HIF', 15, 85, 45,
 'Communications', 'Marketing', 'Low', 'Full',
 ARRAY[
   'Community managers are player advocates',
   'They shape how games evolve',
   'Great communities make games last longer'
 ],
 'Talk with players online, organize events, share news and updates, gather feedback for developers',
 'Be the voice of millions of players and help shape their favorite games!'),

('MID_ESPORTS_PLAYER', 98, 35, 85, 'HIF', 5, 95, 30,
 'Esports', 'Hospitality & Tourism', 'Low', 'Medium',
 ARRAY[
   'Prize pools can reach $40 million',
   'Esports fills stadiums like traditional sports',
   'Players become international celebrities'
 ],
 'Practice 8-12 hours daily, compete in tournaments, work with coaches, stream practice sessions',
 'Compete on the world stage and become a gaming champion!'),

('MID_CONTENT_CREATOR', 93, 55, 78, 'HIF', 8, 92, 65,
 'Media', 'Arts, A/V Technology & Communications', 'Low', 'Full',
 ARRAY[
   'Content creators influence game popularity',
   'Videos can get millions of views',
   'Creators often work with game companies'
 ],
 'Record gameplay, edit videos, write scripts, engage with audience, create thumbnails',
 'Entertain and educate millions with your gaming content!'),

('MID_QA_ANALYST', 80, 70, 75, 'MIF', 40, 70, 50,
 'Quality Assurance', 'Information Technology', 'Medium', 'High',
 ARRAY[
   'QA analysts ensure games work perfectly',
   'They test every possible player action',
   'Finding major bugs saves companies millions'
 ],
 'Test game features systematically, document issues, verify fixes, suggest improvements',
 'Be the guardian of game quality and player satisfaction!'),

('MID_MOTION_CAPTURE', 83, 67, 77, 'LIF', 20, 80, 65,
 'Technology', 'Arts, A/V Technology & Communications', 'Low', 'Medium',
 ARRAY[
   'Motion capture makes games ultra-realistic',
   'Actors perform stunts for game characters',
   'Technology captures every subtle movement'
 ],
 'Set up capture equipment, direct actor performances, clean up data, integrate into games',
 'Turn real human movement into amazing game animations!'),

('MID_NARRATIVE_DESIGNER', 86, 73, 77, 'LIF', 30, 80, 55,
 'Creative Writing', 'Arts, A/V Technology & Communications', 'Low', 'High',
 ARRAY[
   'Game stories rival Hollywood movies',
   'Players make choices that change the story',
   'Great narratives win awards'
 ],
 'Write character dialogue, create branching storylines, design quests, collaborate with designers',
 'Craft epic stories that players will experience and shape!'),

('MID_UI_DESIGNER', 84, 76, 80, 'MIF', 25, 82, 70,
 'Design', 'Arts, A/V Technology & Communications', 'Low', 'High',
 ARRAY[
   'UI design affects how players feel',
   'Good UI is invisible but essential',
   'Mobile gaming needs special UI design'
 ],
 'Design menus and HUD elements, create button layouts, test user flows, improve accessibility',
 'Design the interfaces that millions of players use every day!'),

('MID_ESPORTS_COACH', 87, 70, 80, 'MIF', 10, 90, 35,
 'Esports', 'Education & Training', 'Low', 'Medium',
 ARRAY[
   'Coaches develop world champions',
   'Strategy wins tournaments',
   'Mental coaching is as important as game skills'
 ],
 'Analyze gameplay footage, develop team strategies, run practice sessions, provide mental support',
 'Guide teams to victory and develop the next generation of champions!'),

-- ==== HIGH SCHOOL GAMING CAREERS ====
('HIGH_GAME_PROGRAMMER', 88, 82, 90, 'LIF', 15, 85, 80,
 'Software Engineering', 'Information Technology', 'Low', 'High',
 ARRAY[
   'Programmers bring games to life with code',
   'One programmer can impact millions of players',
   'Game programming combines art and science'
 ],
 'Write game logic code, optimize performance, fix bugs, implement new features',
 'Transform creative ideas into playable realities through code!'),

('HIGH_AI_ENGINEER', 85, 80, 92, 'LIF', 10, 85, 95,
 'Artificial Intelligence', 'Information Technology', 'Low', 'High',
 ARRAY[
   'AI makes game enemies smart and challenging',
   'Machine learning creates adaptive gameplay',
   'AI is the future of gaming'
 ],
 'Program NPC behaviors, develop learning algorithms, create decision trees, optimize AI performance',
 'Create intelligent game systems that amaze and challenge players!'),

('HIGH_ENGINE_DEVELOPER', 82, 78, 90, 'LIF', 20, 80, 85,
 'Software Engineering', 'Information Technology', 'Low', 'High',
 ARRAY[
   'Game engines power thousands of games',
   'Engine developers are highly sought after',
   'Engines like Unreal are used for movies too'
 ],
 'Build core systems, optimize rendering, develop tools, maintain engine architecture',
 'Create the technology foundation that powers amazing games!'),

('HIGH_TECHNICAL_ARTIST', 86, 77, 84, 'LIF', 15, 83, 75,
 'Technical Design', 'Arts, A/V Technology & Communications', 'Low', 'High',
 ARRAY[
   'Technical artists bridge art and programming',
   'They make impossible visuals possible',
   'Shader programming creates visual magic'
 ],
 'Create visual effects, write shaders, optimize art assets, develop art tools',
 'Combine artistic vision with technical skills to create stunning visuals!'),

('HIGH_GAME_PRODUCER', 88, 82, 88, 'MIF', 40, 75, 50,
 'Project Management', 'Business Management & Administration', 'Low', 'Medium',
 ARRAY[
   'Producers ship multi-million dollar games',
   'They coordinate hundreds of developers',
   'Great producers become industry leaders'
 ],
 'Manage schedules and budgets, coordinate teams, communicate with stakeholders, solve problems',
 'Lead teams to create blockbuster games played by millions!'),

('HIGH_GAME_DIRECTOR', 90, 83, 90, 'LIF', 35, 80, 55,
 'Creative Direction', 'Arts, A/V Technology & Communications', 'Low', 'Medium',
 ARRAY[
   'Directors shape the entire game experience',
   'Legendary directors become household names',
   'Vision and leadership create masterpieces'
 ],
 'Define creative vision, guide all departments, make key decisions, inspire the team',
 'Lead the creation of games that define generations!'),

('HIGH_GAMEPLAY_ENGINEER', 87, 79, 87, 'LIF', 12, 86, 78,
 'Software Engineering', 'Information Technology', 'Low', 'High',
 ARRAY[
   'Gameplay engineers code the fun',
   'They make controls feel perfect',
   'Core mechanics define game success'
 ],
 'Program player controls, implement game mechanics, tune gameplay feel, create systems',
 'Code the core gameplay that makes games addictive and fun!'),

('HIGH_NETWORK_ENGINEER', 83, 77, 88, 'LIF', 15, 85, 75,
 'Network Technology', 'Information Technology', 'Low', 'High',
 ARRAY[
   'Network engineers enable global multiplayer',
   'They handle millions of concurrent players',
   'Low latency is their holy grail'
 ],
 'Build multiplayer systems, optimize netcode, handle server infrastructure, prevent cheating',
 'Connect millions of players in seamless online worlds!'),

('HIGH_VR_DEVELOPER', 90, 77, 88, 'LIF', 5, 95, 85,
 'Emerging Technology', 'Information Technology', 'Low', 'High',
 ARRAY[
   'VR is revolutionizing gaming',
   'Developers create impossible experiences',
   'The metaverse needs VR developers'
 ],
 'Create VR experiences, optimize for headsets, design interactions, solve motion sickness',
 'Build immersive worlds that blur reality and virtual!'),

('HIGH_DATA_ANALYST', 81, 76, 84, 'LIF', 20, 82, 72,
 'Analytics', 'Information Technology', 'Medium', 'Full',
 ARRAY[
   'Data reveals what players really want',
   'Analytics can predict game success',
   'Every click provides valuable insights'
 ],
 'Analyze player behavior, create reports, identify trends, recommend improvements',
 'Use data to make games more engaging and successful!'),

('HIGH_ECONOMY_DESIGNER', 80, 76, 86, 'LIF', 15, 85, 65,
 'Game Design', 'Finance', 'Low', 'Full',
 ARRAY[
   'Virtual economies generate real billions',
   'Balance affects player retention',
   'Economics meets game design'
 ],
 'Design progression systems, balance currencies, optimize monetization, prevent inflation',
 'Create engaging economies that keep players invested!'),

('HIGH_LOCALIZATION_SPEC', 78, 74, 80, 'LIF', 45, 70, 40,
 'Translation', 'Arts, A/V Technology & Communications', 'Medium', 'Full',
 ARRAY[
   'Games reach players in 30+ languages',
   'Cultural adaptation is crucial',
   'Localization can make or break success'
 ],
 'Translate text, adapt cultural content, manage voice recordings, test localized versions',
 'Help games connect with players around the world!'),

('HIGH_ESPORTS_MANAGER', 86, 72, 84, 'MIF', 8, 90, 40,
 'Esports Management', 'Business Management & Administration', 'Low', 'Medium',
 ARRAY[
   'Esports is a billion-dollar industry',
   'Managers build championship dynasties',
   'Teams travel the world competing'
 ],
 'Recruit players, manage contracts, coordinate travel, handle sponsorships',
 'Build and manage world-class competitive gaming teams!'),

('HIGH_MARKETING_MANAGER', 84, 74, 82, 'MIF', 35, 80, 55,
 'Marketing', 'Marketing', 'Low', 'High',
 ARRAY[
   'Game launches are global events',
   'Marketing creates cultural phenomena',
   'Viral campaigns reach millions instantly'
 ],
 'Create marketing campaigns, manage social media, work with influencers, analyze metrics',
 'Launch games that capture the world''s attention!'),

('HIGH_UX_RESEARCHER', 82, 78, 83, 'LIF', 15, 85, 68,
 'User Research', 'Information Technology', 'Low', 'High',
 ARRAY[
   'UX research shapes player experiences',
   'Player feedback drives game improvements',
   'Testing prevents costly mistakes'
 ],
 'Conduct player studies, analyze feedback, test prototypes, recommend design changes',
 'Discover what makes games truly fun and engaging!'),

('HIGH_TALENT_SCOUT', 83, 68, 82, 'MIF', 10, 88, 35,
 'Talent Management', 'Business Management & Administration', 'Low', 'Medium',
 ARRAY[
   'Scouts discover future champions',
   'One great find can change team fortunes',
   'Global talent search never stops'
 ],
 'Watch competitions, evaluate players, negotiate contracts, build relationships',
 'Find the next generation of gaming superstars!'),

('HIGH_STREAMING_ENGINEER', 81, 77, 89, 'LIF', 10, 90, 80,
 'Platform Engineering', 'Information Technology', 'Low', 'Full',
 ARRAY[
   'Streaming technology enables instant play',
   'Cloud gaming is the future',
   'Engineers serve millions simultaneously'
 ],
 'Build streaming infrastructure, optimize latency, implement codecs, scale systems',
 'Create technology that delivers games instantly worldwide!'),

('HIGH_COMPLIANCE_MANAGER', 76, 72, 78, 'LIF', 60, 60, 30,
 'Legal & Compliance', 'Law, Public Safety & Security', 'Low', 'High',
 ARRAY[
   'Compliance ensures games are legal worldwide',
   'Age ratings protect young players',
   'Regulations vary by country'
 ],
 'Review content for ratings, ensure legal compliance, manage certification, handle regulations',
 'Ensure games meet standards and reach their intended audiences!'),

('HIGH_BUSINESS_ANALYST', 79, 75, 81, 'LIF', 30, 78, 62,
 'Business Strategy', 'Business Management & Administration', 'Medium', 'Full',
 ARRAY[
   'Analysts identify market opportunities',
   'Business intelligence drives decisions',
   'Gaming market insights are valuable'
 ],
 'Analyze market trends, evaluate competitors, forecast revenues, recommend strategies',
 'Shape the business strategies of gaming companies!')

ON CONFLICT (career_code) DO UPDATE SET
    ers_student_engagement = EXCLUDED.ers_student_engagement,
    erp_parent_engagement = EXCLUDED.erp_parent_engagement,
    ere_employer_engagement = EXCLUDED.ere_employer_engagement,
    interaction_frequency = EXCLUDED.interaction_frequency,
    lir_legacy_rating = EXCLUDED.lir_legacy_rating,
    eir_emerging_rating = EXCLUDED.eir_emerging_rating,
    air_ai_first_rating = EXCLUDED.air_ai_first_rating,
    industry_sector = EXCLUDED.industry_sector,
    career_cluster = EXCLUDED.career_cluster,
    automation_risk = EXCLUDED.automation_risk,
    remote_work_potential = EXCLUDED.remote_work_potential,
    fun_facts = EXCLUDED.fun_facts,
    day_in_life_description = EXCLUDED.day_in_life_description,
    why_its_exciting = EXCLUDED.why_its_exciting,
    updated_at = CURRENT_TIMESTAMP;

-- Summary report
SELECT
    '📊 Gaming Career Attributes Summary' as report,
    grade_category,
    COUNT(*) as careers_with_attributes,
    ROUND(AVG(ers_student_engagement), 1) as avg_student_engagement,
    ROUND(AVG(future_readiness_score), 1) as avg_future_readiness
FROM career_paths cp
JOIN career_attributes ca ON cp.career_code = ca.career_code
WHERE cp.tags && ARRAY['gaming']
   OR cp.tags && ARRAY['esports']
GROUP BY grade_category
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
    END;