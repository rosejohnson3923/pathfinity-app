-- ================================================
-- High Parent Engagement Career Attributes
-- Very high parent approval + super high student engagement for sports
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

-- ==== RELIGIOUS & FAITH-BASED CAREERS - High Parent Engagement ====

('ELEM_PASTOR', 75, 95, 88, 'HIF', 95, 50, 20,
 'Religious', 'Human Services', 'Low', 'Low',
 ARRAY[
   'Pastors guide communities of faith',
   'They perform weddings and celebrations',
   'Ministers help people through hard times'
 ],
 'Lead services, visit families, prepare sermons, counsel members, organize events',
 'Guide and support your community through faith!'),

('ELEM_YOUTH_MINISTER', 80, 93, 85, 'HIF', 90, 55, 25,
 'Religious', 'Education & Training', 'Low', 'Low',
 ARRAY[
   'Youth ministers make faith fun for kids',
   'They organize camps and mission trips',
   'They mentor young people through challenges'
 ],
 'Plan youth activities, teach lessons, organize events, mentor teens, lead worship',
 'Help young people grow in faith and life!'),

('MID_CHAPLAIN', 78, 92, 87, 'MIF', 88, 58, 22,
 'Religious', 'Human Services', 'Low', 'Medium',
 ARRAY[
   'Chaplains serve in hospitals and military',
   'They provide comfort in crisis',
   'Chaplains work with all faiths'
 ],
 'Provide spiritual care, counsel patients, support families, lead services, offer comfort',
 'Bring spiritual support where it''s needed most!'),

('MID_MISSION_WORKER', 82, 90, 83, 'LIF', 85, 60, 20,
 'Religious', 'Human Services', 'Low', 'Low',
 ARRAY[
   'Missionaries serve communities worldwide',
   'They build schools and hospitals',
   'Mission work combines faith and service'
 ],
 'Serve communities, teach skills, build infrastructure, share faith, provide aid',
 'Make a difference through faith and service!'),

('MID_WORSHIP_LEADER', 85, 91, 84, 'HIF', 80, 65, 30,
 'Religious', 'Arts, A/V Technology & Communications', 'Low', 'Low',
 ARRAY[
   'Worship leaders inspire through music',
   'They lead thousands in song',
   'Music ministry touches hearts'
 ],
 'Select music, lead rehearsals, perform services, teach music, inspire worship',
 'Lead others in worship through music!'),

('HIGH_THEOLOGIAN', 72, 91, 86, 'LIF', 92, 55, 25,
 'Religious', 'Education & Training', 'Low', 'High',
 ARRAY[
   'Theologians study ancient wisdom',
   'They teach at universities',
   'Theology shapes worldviews'
 ],
 'Study texts, teach classes, write books, lecture, research beliefs',
 'Explore the deepest questions of faith and meaning!'),

('HIGH_RELIGIOUS_ED', 76, 92, 85, 'MIF', 88, 58, 28,
 'Religious', 'Education & Training', 'Low', 'Medium',
 ARRAY[
   'Religious educators shape faith formation',
   'They develop curriculum for all ages',
   'Education strengthens communities'
 ],
 'Develop programs, train teachers, create curriculum, organize events, guide learning',
 'Shape how communities learn and grow in faith!'),

-- ==== NONPROFIT & PHILANTHROPY - High Parent Engagement ====

('ELEM_CHARITY_WORKER', 82, 92, 85, 'HIF', 85, 65, 30,
 'Nonprofit', 'Human Services', 'Low', 'Medium',
 ARRAY[
   'Charity workers change lives daily',
   'They provide essential services',
   'Charities feed and shelter millions'
 ],
 'Help clients, organize donations, coordinate volunteers, run programs, track impact',
 'Help those who need it most every day!'),

('ELEM_FUNDRAISER', 78, 90, 86, 'MIF', 80, 68, 35,
 'Nonprofit', 'Business Management & Administration', 'Low', 'High',
 ARRAY[
   'Fundraisers make good work possible',
   'They organize amazing events',
   'Great fundraisers raise millions'
 ],
 'Plan events, write appeals, meet donors, track donations, celebrate success',
 'Raise money to change the world!'),

('MID_GRANT_WRITER', 74, 89, 87, 'LIF', 75, 70, 40,
 'Nonprofit', 'Communications', 'Low', 'Full',
 ARRAY[
   'Grant writers secure millions in funding',
   'They make programs possible',
   'Writing skills create impact'
 ],
 'Research grants, write proposals, track deadlines, report outcomes, build relationships',
 'Write proposals that fund world-changing work!'),

('MID_VOLUNTEER_COORD', 80, 91, 84, 'HIF', 78, 68, 32,
 'Nonprofit', 'Human Services', 'Low', 'Medium',
 ARRAY[
   'Volunteer coordinators mobilize communities',
   'They manage hundreds of helpers',
   'Volunteers are the heart of nonprofits'
 ],
 'Recruit volunteers, organize schedules, train helpers, coordinate events, recognize service',
 'Mobilize people power for good!'),

('MID_PROGRAM_DIRECTOR', 79, 90, 88, 'MIF', 76, 72, 38,
 'Nonprofit', 'Business Management & Administration', 'Low', 'Medium',
 ARRAY[
   'Program directors create lasting change',
   'They manage life-changing programs',
   'Directors see their impact daily'
 ],
 'Design programs, manage staff, track outcomes, secure funding, engage community',
 'Lead programs that transform communities!'),

('HIGH_FOUNDATION_DIR', 75, 93, 91, 'LIF', 82, 68, 35,
 'Philanthropy', 'Business Management & Administration', 'Low', 'Medium',
 ARRAY[
   'Foundation directors give away millions',
   'They fund breakthrough solutions',
   'Foundations change society'
 ],
 'Review proposals, allocate funds, measure impact, build partnerships, guide strategy',
 'Direct resources to solve big problems!'),

('HIGH_PHILANTHROPIST', 77, 94, 90, 'LIF', 70, 75, 40,
 'Philanthropy', 'Business Management & Administration', 'Low', 'Low',
 ARRAY[
   'Philanthropists change the world',
   'They tackle global challenges',
   'Giving creates lasting legacies'
 ],
 'Identify causes, fund solutions, build organizations, inspire others, measure change',
 'Use resources to create a better world!'),

('HIGH_DEV_DIRECTOR', 76, 91, 89, 'MIF', 78, 70, 38,
 'Nonprofit', 'Business Management & Administration', 'Low', 'Medium',
 ARRAY[
   'Development directors fuel missions',
   'They build donor relationships',
   'Fundraising enables impact'
 ],
 'Cultivate donors, plan campaigns, manage teams, track goals, celebrate milestones',
 'Secure resources for important causes!'),

('HIGH_IMPACT_INVESTOR', 73, 89, 92, 'LIF', 65, 85, 55,
 'Social Finance', 'Finance', 'Low', 'High',
 ARRAY[
   'Impact investors earn returns doing good',
   'They fund social enterprises',
   'Investment can solve problems'
 ],
 'Evaluate ventures, structure deals, monitor impact, advise companies, measure returns',
 'Invest in companies that improve the world!'),

-- ==== HUMANITARIAN CAREERS - High Parent Engagement ====

('ELEM_PEACE_WORKER', 80, 91, 86, 'MIF', 85, 70, 30,
 'Humanitarian', 'Human Services', 'Low', 'Low',
 ARRAY[
   'Peace workers prevent conflicts',
   'They bring enemies together',
   'Peace building saves lives'
 ],
 'Mediate conflicts, facilitate dialogue, teach peace, build trust, prevent violence',
 'Help communities live in peace!'),

('ELEM_DISASTER_HELPER', 85, 93, 88, 'MIF', 80, 75, 35,
 'Emergency Services', 'Law, Public Safety & Security', 'Low', 'Low',
 ARRAY[
   'Disaster workers are first responders',
   'They save lives in emergencies',
   'Relief workers bring hope'
 ],
 'Respond to disasters, distribute aid, set up shelters, comfort victims, coordinate help',
 'Be there when people need help most!'),

('MID_HUMANITARIAN', 83, 92, 89, 'LIF', 75, 80, 40,
 'Humanitarian', 'Human Services', 'Low', 'Low',
 ARRAY[
   'Humanitarian workers serve globally',
   'They risk their lives to help others',
   'Aid workers are modern heroes'
 ],
 'Deliver aid, assess needs, coordinate relief, document conditions, advocate for help',
 'Bring hope to crisis zones worldwide!'),

('MID_REFUGEE_WORKER', 81, 91, 87, 'MIF', 78, 77, 35,
 'Humanitarian', 'Human Services', 'Low', 'Medium',
 ARRAY[
   'Refugee workers help millions flee danger',
   'They provide new beginnings',
   'Supporting refugees saves families'
 ],
 'Process arrivals, provide services, teach skills, find housing, reunite families',
 'Help refugees build new lives in safety!'),

('MID_HUMAN_RIGHTS', 79, 90, 88, 'LIF', 72, 82, 45,
 'Advocacy', 'Law, Public Safety & Security', 'Low', 'High',
 ARRAY[
   'Human rights advocates fight injustice',
   'They protect the vulnerable',
   'Advocacy changes laws and lives'
 ],
 'Document violations, advocate for victims, lobby governments, raise awareness, pursue justice',
 'Stand up for human dignity worldwide!'),

('HIGH_UN_WORKER', 76, 91, 90, 'LIF', 70, 78, 42,
 'International Relations', 'Government & Public Administration', 'Low', 'Medium',
 ARRAY[
   'UN workers tackle global challenges',
   'They work in 193 countries',
   'The UN prevents wars and famines'
 ],
 'Develop programs, negotiate agreements, coordinate aid, monitor progress, build peace',
 'Work for peace and progress globally!'),

('HIGH_PEACE_MEDIATOR', 74, 90, 89, 'LIF', 75, 75, 38,
 'Conflict Resolution', 'Law, Public Safety & Security', 'Low', 'Medium',
 ARRAY[
   'Mediators end wars and save lives',
   'They bring sworn enemies to the table',
   'Peace agreements last generations'
 ],
 'Facilitate negotiations, build trust, draft agreements, monitor ceasefires, prevent conflicts',
 'Negotiate peace between nations!'),

('HIGH_RELIEF_DIRECTOR', 78, 92, 91, 'LIF', 72, 78, 40,
 'Emergency Management', 'Law, Public Safety & Security', 'Low', 'Low',
 ARRAY[
   'Relief directors coordinate massive operations',
   'They manage millions in aid',
   'Directors save thousands of lives'
 ],
 'Coordinate response, manage resources, lead teams, liaise with governments, ensure delivery',
 'Lead life-saving relief operations!'),

('HIGH_GLOBAL_HEALTH', 80, 91, 90, 'LIF', 68, 82, 50,
 'Public Health', 'Health Science', 'Low', 'Medium',
 ARRAY[
   'Global health workers fight pandemics',
   'They bring healthcare to billions',
   'Public health saves more lives than medicine'
 ],
 'Design interventions, train workers, monitor disease, coordinate responses, evaluate impact',
 'Improve health for entire populations!'),

-- ==== PROFESSIONAL SPORTS - Super High Student Engagement ====

('ELEM_SOCCER_PLAYER', 98, 88, 85, 'HIF', 70, 80, 25,
 'Professional Sports', 'Arts, A/V Technology & Communications', 'Low', 'Low',
 ARRAY[
   'Soccer is the world''s most popular sport',
   'Players become global superstars',
   'World Cup is watched by billions'
 ],
 'Train daily, play matches, travel with team, meet fans, maintain fitness',
 'Play the beautiful game professionally!'),

('ELEM_BASEBALL_PLAYER', 96, 90, 87, 'HIF', 85, 65, 20,
 'Professional Sports', 'Arts, A/V Technology & Communications', 'Low', 'Low',
 ARRAY[
   'Baseball is America''s pastime',
   'Players can earn millions per year',
   'Baseball legends never die'
 ],
 'Practice hitting, field positions, play games, sign autographs, stay in shape',
 'Hit home runs in packed stadiums!'),

('ELEM_COACH', 92, 92, 88, 'HIF', 80, 70, 30,
 'Sports Coaching', 'Education & Training', 'Low', 'Low',
 ARRAY[
   'Coaches shape champions',
   'Great coaches become legends',
   'Coaching is teaching life lessons'
 ],
 'Plan practices, teach skills, motivate players, strategize games, mentor athletes',
 'Build championship teams and change lives!'),

('ELEM_REFEREE', 85, 88, 85, 'HIF', 82, 65, 25,
 'Sports Officiating', 'Arts, A/V Technology & Communications', 'Low', 'Low',
 ARRAY[
   'Referees keep games fair',
   'They make split-second decisions',
   'Top refs work championship games'
 ],
 'Study rules, officiate games, make calls, manage players, stay fit',
 'Keep the game fair and exciting!'),

('MID_FOOTBALL_PLAYER', 99, 89, 88, 'HIF', 75, 70, 22,
 'Professional Sports', 'Arts, A/V Technology & Communications', 'Low', 'Low',
 ARRAY[
   'Football players are hometown heroes',
   'Super Bowl is America''s biggest event',
   'NFL players inspire millions'
 ],
 'Train intensively, study plays, compete weekly, recover properly, inspire fans',
 'Play America''s game at the highest level!'),

('MID_BASKETBALL_PLAYER', 98, 88, 87, 'HIF', 72, 75, 25,
 'Professional Sports', 'Arts, A/V Technology & Communications', 'Low', 'Low',
 ARRAY[
   'Basketball players are global icons',
   'NBA reaches fans worldwide',
   'Players become business moguls'
 ],
 'Practice shots, run drills, play games, travel extensively, engage fans',
 'Dominate the court professionally!'),

('MID_TENNIS_PLAYER', 94, 89, 86, 'MIF', 78, 68, 20,
 'Professional Sports', 'Arts, A/V Technology & Communications', 'Low', 'Low',
 ARRAY[
   'Tennis players compete globally',
   'Grand Slams are legendary events',
   'Tennis champions earn millions'
 ],
 'Train technique, compete tournaments, travel worldwide, maintain ranking, stay fit',
 'Compete at Wimbledon and win Grand Slams!'),

('MID_GOLFER', 93, 90, 87, 'MIF', 82, 65, 18,
 'Professional Sports', 'Arts, A/V Technology & Communications', 'Low', 'Low',
 ARRAY[
   'Golf is played at beautiful courses',
   'Pro golfers can play into their 50s',
   'Masters winners become legends'
 ],
 'Practice swings, play tournaments, travel tours, work with sponsors, perfect technique',
 'Play the world''s most prestigious courses!'),

('MID_SPORTS_TRAINER', 88, 91, 89, 'HIF', 75, 72, 35,
 'Sports Medicine', 'Health Science', 'Low', 'Medium',
 ARRAY[
   'Trainers keep athletes healthy',
   'They prevent career-ending injuries',
   'Every team needs great trainers'
 ],
 'Assess injuries, provide treatment, design rehab, prevent problems, tape athletes',
 'Keep champions at peak performance!'),

('MID_SPORTS_AGENT', 86, 88, 90, 'MIF', 70, 75, 40,
 'Sports Management', 'Business Management & Administration', 'Low', 'High',
 ARRAY[
   'Agents negotiate million-dollar deals',
   'They manage athletes'' careers',
   'Top agents are power brokers'
 ],
 'Negotiate contracts, secure endorsements, manage image, guide decisions, protect interests',
 'Build athletes'' careers and wealth!'),

('MID_SPORTS_PSYCH', 84, 89, 88, 'LIF', 65, 80, 45,
 'Sports Psychology', 'Health Science', 'Low', 'High',
 ARRAY[
   'Mental game wins championships',
   'Psychology gives competitive edge',
   'Every elite athlete uses psychology'
 ],
 'Assess mental state, teach techniques, build confidence, manage pressure, enhance focus',
 'Train the minds of champions!'),

('MID_SPORTS_CASTER', 90, 87, 86, 'HIF', 75, 70, 35,
 'Sports Media', 'Arts, A/V Technology & Communications', 'Low', 'Medium',
 ARRAY[
   'Broadcasters bring games to millions',
   'Great calls become history',
   'Sportscasters are household names'
 ],
 'Call games, interview players, analyze plays, travel to events, engage audiences',
 'Be the voice of sports for millions!'),

('MID_SCOUT', 87, 88, 87, 'MIF', 78, 68, 32,
 'Talent Scouting', 'Business Management & Administration', 'Low', 'Medium',
 ARRAY[
   'Scouts discover future stars',
   'One great find changes franchises',
   'Scouting spans the globe'
 ],
 'Watch games, evaluate talent, write reports, track prospects, recommend signings',
 'Discover the next generation of stars!'),

('HIGH_NFL_PLAYER', 99, 91, 90, 'HIF', 70, 65, 20,
 'Professional Sports', 'Arts, A/V Technology & Communications', 'Low', 'Low',
 ARRAY[
   'NFL players are American heroes',
   'Average career earnings exceed $3 million',
   'Super Bowl champions become legends'
 ],
 'Train year-round, study playbooks, compete Sundays, recover properly, inspire communities',
 'Play in the NFL and become a legend!'),

('HIGH_NBA_PLAYER', 99, 90, 89, 'HIF', 68, 72, 22,
 'Professional Sports', 'Arts, A/V Technology & Communications', 'Low', 'Low',
 ARRAY[
   'NBA players are global superstars',
   'Basketball changes lives worldwide',
   'NBA champions make history'
 ],
 'Practice daily, play 82+ games, travel constantly, engage fans, build brand',
 'Dominate the NBA and inspire millions!'),

('HIGH_MLB_PLAYER', 97, 91, 88, 'HIF', 82, 62, 18,
 'Professional Sports', 'Arts, A/V Technology & Communications', 'Low', 'Low',
 ARRAY[
   'Baseball players play 162 games',
   'World Series champions are immortal',
   'MLB has the longest careers'
 ],
 'Take batting practice, field grounders, play games, travel cities, sign autographs',
 'Play Major League Baseball professionally!'),

('HIGH_MLS_PLAYER', 95, 88, 86, 'HIF', 65, 78, 25,
 'Professional Sports', 'Arts, A/V Technology & Communications', 'Low', 'Low',
 ARRAY[
   'Soccer is growing fastest in America',
   'MLS players compete globally',
   'World Cup creates superstars'
 ],
 'Train technically, play matches, travel leagues, engage fans, represent country',
 'Play professional soccer in MLS!'),

('HIGH_OLYMPIC_ATHLETE', 98, 93, 88, 'LIF', 80, 70, 20,
 'Olympic Sports', 'Arts, A/V Technology & Communications', 'Low', 'Low',
 ARRAY[
   'Olympians represent their countries',
   'Olympic gold is the ultimate prize',
   'Olympics inspire the world'
 ],
 'Train intensively, compete globally, peak quadrennially, inspire nations, chase gold',
 'Compete for Olympic gold and glory!'),

('HIGH_SPORTS_GM', 88, 90, 92, 'LIF', 72, 75, 45,
 'Sports Management', 'Business Management & Administration', 'Low', 'Low',
 ARRAY[
   'GMs build championship teams',
   'They manage hundred-million budgets',
   'Great GMs create dynasties'
 ],
 'Scout talent, make trades, manage salary, hire coaches, build culture',
 'Build championship sports franchises!'),

('HIGH_SPORTS_MED_DR', 85, 92, 91, 'MIF', 75, 78, 40,
 'Sports Medicine', 'Health Science', 'Low', 'Low',
 ARRAY[
   'Team doctors save careers',
   'They treat superstar athletes',
   'Sports medicine is cutting-edge'
 ],
 'Diagnose injuries, perform surgery, guide rehab, prevent problems, travel with teams',
 'Keep elite athletes healthy and competing!'),

('HIGH_SPORTS_ANALYST', 86, 88, 89, 'LIF', 60, 85, 65,
 'Sports Analytics', 'Information Technology', 'Low', 'High',
 ARRAY[
   'Analytics revolutionized sports',
   'Data wins championships',
   'Moneyball changed everything'
 ],
 'Analyze performance, build models, identify patterns, recommend strategies, measure impact',
 'Use data to build winning teams!'),

('HIGH_FITNESS_EMPIRE', 89, 89, 88, 'MIF', 55, 88, 55,
 'Fitness Business', 'Business Management & Administration', 'Low', 'Medium',
 ARRAY[
   'Fitness entrepreneurs build empires',
   'Social media creates fitness stars',
   'Wellness industry is booming'
 ],
 'Create programs, build brand, engage followers, develop products, inspire transformation',
 'Build a fitness empire and change lives!'),

('HIGH_SPORTS_LAWYER', 82, 90, 91, 'LIF', 70, 72, 40,
 'Sports Law', 'Law, Public Safety & Security', 'Low', 'High',
 ARRAY[
   'Sports lawyers negotiate mega-deals',
   'They protect athletes'' interests',
   'Sports law is high-stakes'
 ],
 'Negotiate contracts, handle disputes, protect rights, manage endorsements, advise clients',
 'Navigate the legal side of sports!'),

('HIGH_SPORTS_MARKETER', 87, 88, 89, 'MIF', 62, 82, 58,
 'Sports Marketing', 'Marketing', 'Low', 'High',
 ARRAY[
   'Sports marketing creates legends',
   'Campaigns reach billions globally',
   'Marketing builds sports brands'
 ],
 'Create campaigns, manage partnerships, build brands, engage fans, measure impact',
 'Market sports to the world!')

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

-- Summary report showing parent and student engagement
WITH categorized_careers AS (
    SELECT
        ca.*,
        CASE
            WHEN ca.career_code LIKE '%PASTOR%' OR ca.career_code LIKE '%CHAPLAIN%' OR ca.career_code LIKE '%THEO%' THEN 'Religious/Faith'
            WHEN ca.career_code LIKE '%CHARITY%' OR ca.career_code LIKE '%GRANT%' OR ca.career_code LIKE '%FOUNDATION%' THEN 'Nonprofit/Philanthropy'
            WHEN ca.career_code LIKE '%HUMANITARIAN%' OR ca.career_code LIKE '%REFUGEE%' OR ca.career_code LIKE '%UN_%' THEN 'Humanitarian'
            WHEN ca.career_code LIKE '%SOCCER%' OR ca.career_code LIKE '%FOOTBALL%' OR ca.career_code LIKE '%BASEBALL%'
                 OR ca.career_code LIKE '%BASKETBALL%' OR ca.career_code LIKE '%ATHLETE%' OR ca.career_code LIKE '%SPORTS%'
                 OR ca.career_code LIKE '%NFL%' OR ca.career_code LIKE '%NBA%' OR ca.career_code LIKE '%MLB%' OR ca.career_code LIKE '%MLS%' THEN 'Professional Sports'
            ELSE 'Other'
        END as category
    FROM career_attributes ca
    WHERE ca.career_code IN (
        SELECT career_code FROM career_paths
        WHERE career_category IN ('Religious Services', 'Religious Studies', 'Religious Education',
                                  'Nonprofit', 'Philanthropy', 'Social Finance',
                                  'Humanitarian', 'Emergency Services', 'Emergency Management',
                                  'Professional Sports', 'Sports Coaching', 'Sports Medicine',
                                  'Sports Management', 'Sports Media', 'Sports Analytics')
           OR tags && ARRAY['religious', 'nonprofit', 'philanthropy', 'humanitarian', 'sports']
    )
)
SELECT
    '📊 Parent & Student Engagement Summary' as report,
    category,
    COUNT(*) as careers,
    ROUND(AVG(ers_student_engagement), 1) as avg_student,
    ROUND(AVG(erp_parent_engagement), 1) as avg_parent,
    ROUND(AVG(ere_employer_engagement), 1) as avg_employer
FROM categorized_careers
WHERE category != 'Other'
GROUP BY category
ORDER BY AVG(erp_parent_engagement) DESC;