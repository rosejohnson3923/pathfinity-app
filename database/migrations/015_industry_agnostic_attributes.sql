-- ================================================
-- Industry-Agnostic Career Attributes
-- Higher parent/employer engagement for traditional careers
-- Higher student engagement due to gaming context
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

-- ==== ELEMENTARY CAREERS - High visibility, traditional ====

('ELEM_PHOTOGRAPHER', 82, 85, 80, 'HIF', 75, 65, 45,
 'Creative Services', 'Arts, A/V Technology & Communications', 'Medium', 'High',
 ARRAY[
   'Gaming photographers capture esports moments',
   'Photo mode in games inspires real photography',
   'Game screenshots are a form of photography'
 ],
 'Take photos at events, edit images, meet with clients, set up equipment',
 'Capture epic gaming moments and create visual stories!'),

('ELEM_SALES_REP', 78, 80, 85, 'HIF', 80, 60, 35,
 'Business', 'Marketing', 'Medium', 'Medium',
 ARRAY[
   'Game sales reps help stores stock the best games',
   'They know what gamers want',
   'Sales drives the gaming industry forward'
 ],
 'Meet customers, explain products, answer questions, process orders',
 'Help gamers find their next favorite game!'),

('ELEM_CUSTOMER_SERVICE', 75, 75, 82, 'HIF', 70, 65, 40,
 'Service', 'Business Management & Administration', 'High', 'Full',
 ARRAY[
   'Game support helps millions of players',
   'They solve gaming problems every day',
   'Customer service keeps games running smoothly'
 ],
 'Answer calls and emails, solve problems, help customers, document issues',
 'Be a gaming hero who helps players succeed!'),

-- ==== MIDDLE SCHOOL CAREERS - Professional growth paths ====

('MID_COPYWRITER', 85, 82, 88, 'MIF', 60, 75, 55,
 'Marketing', 'Arts, A/V Technology & Communications', 'Low', 'Full',
 ARRAY[
   'Game copywriters create legendary taglines',
   'Words sell games before they launch',
   'Great copy builds gaming communities'
 ],
 'Write compelling content, research topics, collaborate with teams, revise drafts',
 'Write words that excite millions of gamers!'),

('MID_VIDEO_EDITOR', 90, 78, 85, 'MIF', 45, 85, 65,
 'Media Production', 'Arts, A/V Technology & Communications', 'Low', 'High',
 ARRAY[
   'Gaming videos get billions of views',
   'Editors create viral gaming moments',
   'Every gaming channel needs great editors'
 ],
 'Cut and arrange footage, add effects, sync audio, collaborate with directors',
 'Edit gaming content that entertains millions!'),

('MID_SOCIAL_MEDIA_SPEC', 92, 70, 83, 'HIF', 20, 90, 60,
 'Digital Marketing', 'Marketing', 'Low', 'Full',
 ARRAY[
   'Gaming social media creates global communities',
   'Viral gaming posts break the internet',
   'Social media launches gaming careers'
 ],
 'Create posts, engage followers, analyze metrics, plan campaigns',
 'Build gaming communities that span the globe!'),

('MID_RECRUITER', 82, 85, 90, 'MIF', 65, 70, 45,
 'Human Resources', 'Business Management & Administration', 'Low', 'High',
 ARRAY[
   'Game industry recruiters find star developers',
   'They build dream gaming teams',
   'Gaming talent is in high demand'
 ],
 'Screen resumes, interview candidates, negotiate offers, build relationships',
 'Build the gaming studios of tomorrow!'),

('MID_NUTRITIONIST', 85, 88, 85, 'MIF', 70, 75, 40,
 'Health & Wellness', 'Health Science', 'Low', 'High',
 ARRAY[
   'Esports nutritionists fuel champions',
   'Proper nutrition improves gaming performance',
   'Pro gamers have nutrition coaches'
 ],
 'Create meal plans, educate clients, track progress, stay current on research',
 'Help gamers achieve peak performance through nutrition!'),

('MID_FITNESS_TRAINER', 88, 82, 80, 'HIF', 60, 70, 30,
 'Health & Fitness', 'Education & Training', 'Low', 'Medium',
 ARRAY[
   'Esports athletes need fitness trainers',
   'Gaming fitness prevents injuries',
   'Physical health improves mental gaming'
 ],
 'Lead workouts, create exercise plans, motivate clients, track progress',
 'Keep gamers healthy and at their best!'),

('MID_CONTENT_STRATEGIST', 84, 83, 87, 'LIF', 35, 85, 65,
 'Marketing', 'Marketing', 'Low', 'Full',
 ARRAY[
   'Gaming content strategy builds empires',
   'Strategic content grows gaming brands',
   'Content calendars drive gaming engagement'
 ],
 'Plan content calendars, analyze performance, guide teams, develop strategies',
 'Shape how gaming content reaches millions!'),

('MID_MOTION_DESIGNER', 88, 76, 84, 'LIF', 30, 88, 70,
 'Design', 'Arts, A/V Technology & Communications', 'Low', 'High',
 ARRAY[
   'Game UI motion is everywhere',
   'Motion design makes games feel alive',
   'Every gaming app needs motion design'
 ],
 'Create animations, design transitions, collaborate with teams, test user experience',
 'Make gaming interfaces come to life!'),

('MID_TALENT_AGENT', 83, 80, 85, 'MIF', 75, 65, 35,
 'Entertainment', 'Arts, A/V Technology & Communications', 'Low', 'Medium',
 ARRAY[
   'Gaming talent agents rep top streamers',
   'They negotiate million-dollar gaming deals',
   'Esports stars need representation'
 ],
 'Scout talent, negotiate contracts, book opportunities, manage relationships',
 'Launch the careers of gaming superstars!'),

('MID_CASTING_DIRECTOR', 85, 78, 83, 'LIF', 70, 65, 30,
 'Entertainment', 'Arts, A/V Technology & Communications', 'Low', 'Medium',
 ARRAY[
   'Games need voice actor casting',
   'Motion capture casting is crucial',
   'Finding the right voice defines characters'
 ],
 'Hold auditions, review portfolios, collaborate with directors, make selections',
 'Cast the voices that bring games to life!'),

-- ==== HIGH SCHOOL CAREERS - Established professional paths ====

('HIGH_ACCOUNTANT', 78, 90, 92, 'MIF', 85, 55, 45,
 'Finance', 'Finance', 'High', 'High',
 ARRAY[
   'Gaming companies need expert accountants',
   'Virtual economies need real accounting',
   'Esports prize pools require financial experts'
 ],
 'Prepare financial statements, file taxes, audit records, advise clients',
 'Manage the finances of gaming empires!'),

('HIGH_HR_MANAGER', 82, 88, 90, 'MIF', 75, 65, 40,
 'Human Resources', 'Business Management & Administration', 'Low', 'High',
 ARRAY[
   'Game studios need great HR',
   'HR builds gaming company culture',
   'They manage talent in creative industries'
 ],
 'Manage policies, resolve conflicts, oversee benefits, guide hiring',
 'Build amazing gaming workplace cultures!'),

('HIGH_COMPLIANCE_OFFICER', 75, 85, 92, 'LIF', 70, 70, 35,
 'Legal & Compliance', 'Law, Public Safety & Security', 'Low', 'High',
 ARRAY[
   'Gaming compliance ensures fair play',
   'Age ratings need compliance experts',
   'Loot box regulations require compliance'
 ],
 'Review regulations, audit processes, train staff, report to authorities',
 'Keep gaming fair and legal worldwide!'),

('HIGH_BUSINESS_DEV_MGR', 85, 85, 91, 'MIF', 60, 75, 50,
 'Business Development', 'Business Management & Administration', 'Low', 'High',
 ARRAY[
   'Gaming partnerships worth billions',
   'Business dev brings games to new platforms',
   'Strategic deals shape gaming future'
 ],
 'Identify opportunities, build relationships, negotiate deals, analyze markets',
 'Create gaming partnerships that change the industry!'),

('HIGH_DATA_ENTRY_SPEC', 68, 70, 75, 'HIF', 65, 40, 25,
 'Administration', 'Business Management & Administration', 'High', 'Full',
 ARRAY[
   'Gaming data entry tracks player stats',
   'Accurate data improves games',
   'Remote work perfect for gaming fans'
 ],
 'Enter data accurately, verify information, maintain databases, meet deadlines',
 'Support gaming operations with accurate data!'),

('HIGH_PSYCHOLOGIST', 88, 88, 85, 'MIF', 80, 70, 35,
 'Mental Health', 'Health Science', 'Low', 'High',
 ARRAY[
   'Gaming psychologists study player behavior',
   'Mental health matters in esports',
   'They help with gaming addiction'
 ],
 'Conduct therapy sessions, assess patients, develop treatment plans, research',
 'Support mental health in gaming communities!'),

('HIGH_COPYEDITOR', 80, 82, 85, 'LIF', 75, 60, 40,
 'Publishing', 'Arts, A/V Technology & Communications', 'Medium', 'Full',
 ARRAY[
   'Game scripts need perfect editing',
   'Quest text requires careful editing',
   'Gaming journalism needs editors'
 ],
 'Review manuscripts, correct errors, improve clarity, work with authors',
 'Perfect gaming stories before millions play them!'),

('HIGH_VIDEOGRAPHER', 87, 83, 87, 'MIF', 60, 75, 50,
 'Media Production', 'Arts, A/V Technology & Communications', 'Low', 'Medium',
 ARRAY[
   'Esports events need videographers',
   'Gaming documentaries tell amazing stories',
   'Behind-the-scenes content is huge'
 ],
 'Film events, set up equipment, edit footage, deliver final products',
 'Capture the excitement of gaming events!'),

('HIGH_SUPPLY_CHAIN_MGR', 80, 87, 93, 'LIF', 70, 75, 55,
 'Operations', 'Transportation, Distribution & Logistics', 'Medium', 'High',
 ARRAY[
   'Console launches need perfect logistics',
   'Game distribution spans the globe',
   'Supply chains deliver games to millions'
 ],
 'Coordinate shipments, optimize routes, manage vendors, solve problems',
 'Deliver gaming products to eager fans worldwide!'),

('HIGH_RISK_ANALYST', 79, 86, 91, 'LIF', 65, 75, 60,
 'Risk Management', 'Finance', 'Low', 'High',
 ARRAY[
   'Gaming companies face unique risks',
   'Server downtime costs millions',
   'Risk analysis prevents gaming disasters'
 ],
 'Analyze data, identify threats, create models, present findings',
 'Protect gaming companies from threats!'),

('HIGH_MERGERS_ACQ_SPEC', 80, 88, 94, 'LIF', 75, 70, 45,
 'Corporate Finance', 'Finance', 'Low', 'High',
 ARRAY[
   'Gaming acquisitions make headlines',
   'Studio mergers reshape the industry',
   'Billion-dollar gaming deals happen yearly'
 ],
 'Analyze companies, structure deals, conduct due diligence, negotiate terms',
 'Orchestrate gaming industry mega-deals!'),

('HIGH_TAX_SPECIALIST', 75, 89, 90, 'MIF', 85, 50, 40,
 'Taxation', 'Finance', 'Medium', 'High',
 ARRAY[
   'Gaming tax law is complex',
   'International gaming needs tax experts',
   'Streamers need tax help'
 ],
 'Prepare returns, research tax law, advise clients, find deductions',
 'Navigate gaming industry tax complexities!'),

('HIGH_PAYROLL_SPEC', 72, 84, 88, 'MIF', 80, 55, 35,
 'Human Resources', 'Finance', 'High', 'High',
 ARRAY[
   'Game developers need reliable payroll',
   'Esports contracts are complex',
   'Bonuses reward gaming success'
 ],
 'Process payroll, calculate taxes, manage benefits, maintain records',
 'Ensure gaming professionals get paid on time!'),

('HIGH_AUDITOR', 76, 87, 92, 'LIF', 80, 60, 45,
 'Accounting', 'Finance', 'Medium', 'High',
 ARRAY[
   'Gaming companies need audits',
   'Virtual currency requires auditing',
   'Transparency builds trust'
 ],
 'Review financial records, test controls, identify issues, write reports',
 'Ensure gaming companies stay honest!'),

('HIGH_BRAND_STRATEGIST', 86, 84, 89, 'LIF', 45, 85, 60,
 'Marketing', 'Marketing', 'Low', 'High',
 ARRAY[
   'Gaming brands are worth billions',
   'Brand strategy defines gaming identity',
   'Iconic gaming brands last decades'
 ],
 'Research markets, develop positioning, guide creative, measure success',
 'Build legendary gaming brands!'),

('HIGH_MEDIA_BUYER', 79, 82, 87, 'MIF', 60, 70, 50,
 'Advertising', 'Marketing', 'Medium', 'High',
 ARRAY[
   'Gaming ads reach millions daily',
   'Media buying launches games',
   'Strategic ad placement drives sales'
 ],
 'Research media options, negotiate rates, place ads, track performance',
 'Put games in front of the right audience!'),

('HIGH_MERCHANDISER', 75, 80, 85, 'HIF', 75, 60, 35,
 'Retail', 'Marketing', 'Medium', 'Medium',
 ARRAY[
   'Gaming merchandise is huge business',
   'Store displays sell games',
   'Collectibles drive gaming culture'
 ],
 'Plan displays, analyze sales, coordinate with buyers, visit stores',
 'Create gaming retail experiences that excite!'),

('HIGH_CUSTOMER_SUCCESS', 86, 86, 92, 'MIF', 35, 85, 55,
 'Customer Relations', 'Business Management & Administration', 'Low', 'Full',
 ARRAY[
   'Gaming customer success retains players',
   'Happy gamers become loyal fans',
   'Success teams prevent player churn'
 ],
 'Onboard clients, monitor usage, solve problems, identify opportunities',
 'Ensure gamers love their experience!'),

('HIGH_SECURITY_ANALYST', 85, 85, 93, 'LIF', 40, 85, 75,
 'Cybersecurity', 'Information Technology', 'Low', 'Full',
 ARRAY[
   'Gaming security stops hackers',
   'Protecting player data is crucial',
   'Anti-cheat systems need security experts'
 ],
 'Monitor systems, investigate threats, implement security, respond to incidents',
 'Defend gaming networks from cyber threats!')

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

-- Summary report showing higher engagement
SELECT
    '📊 Industry-Agnostic Engagement Summary' as report,
    grade_category,
    COUNT(*) as careers,
    ROUND(AVG(ers_student_engagement), 1) as avg_student,
    ROUND(AVG(erp_parent_engagement), 1) as avg_parent,  
    ROUND(AVG(ere_employer_engagement), 1) as avg_employer
FROM career_paths cp
JOIN career_attributes ca ON cp.career_code = ca.career_code
WHERE cp.career_code IN (
    'ELEM_PHOTOGRAPHER', 'ELEM_SALES_REP', 'ELEM_CUSTOMER_SERVICE',
    'MID_COPYWRITER', 'MID_VIDEO_EDITOR', 'MID_SOCIAL_MEDIA_SPEC',
    'MID_RECRUITER', 'MID_NUTRITIONIST', 'MID_FITNESS_TRAINER',
    'MID_CONTENT_STRATEGIST', 'MID_MOTION_DESIGNER', 'MID_TALENT_AGENT',
    'MID_CASTING_DIRECTOR', 'HIGH_ACCOUNTANT', 'HIGH_HR_MANAGER',
    'HIGH_COMPLIANCE_OFFICER', 'HIGH_BUSINESS_DEV_MGR', 'HIGH_DATA_ENTRY_SPEC',
    'HIGH_PSYCHOLOGIST', 'HIGH_COPYEDITOR', 'HIGH_VIDEOGRAPHER',
    'HIGH_SUPPLY_CHAIN_MGR', 'HIGH_RISK_ANALYST', 'HIGH_MERGERS_ACQ_SPEC',
    'HIGH_TAX_SPECIALIST', 'HIGH_PAYROLL_SPEC', 'HIGH_AUDITOR',
    'HIGH_BRAND_STRATEGIST', 'HIGH_MEDIA_BUYER', 'HIGH_MERCHANDISER',
    'HIGH_CUSTOMER_SUCCESS', 'HIGH_SECURITY_ANALYST'
)
GROUP BY grade_category
ORDER BY
    CASE grade_category
        WHEN 'elementary' THEN 1
        WHEN 'middle' THEN 2
        WHEN 'high' THEN 3
    END;
