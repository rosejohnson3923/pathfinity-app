-- ================================================
-- Specialized Industry Career Attributes
-- High engagement for careers students see in their communities
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

-- ==== CULINARY CAREERS ====

('ELEM_CHEF', 92, 85, 82, 'HIF', 80, 65, 30,
 'Culinary', 'Hospitality & Tourism', 'Low', 'Low',
 ARRAY[
   'Chefs create art you can eat',
   'Top chefs become TV celebrities',
   'Every culture has unique cuisines to explore'
 ],
 'Plan menus, prepare ingredients, cook meals, taste test dishes, train staff',
 'Create delicious food that brings joy to people every day!'),

('ELEM_BAKER', 88, 83, 80, 'HIF', 85, 60, 25,
 'Culinary', 'Hospitality & Tourism', 'Medium', 'Low',
 ARRAY[
   'Bakers wake up before dawn to make fresh bread',
   'The smell of baking makes everyone happy',
   'Baking is both art and science'
 ],
 'Mix dough, shape breads, decorate cakes, manage ovens, create new recipes',
 'Fill the world with the wonderful smell of fresh-baked goods!'),

('ELEM_FARMER', 85, 88, 85, 'MIF', 90, 70, 45,
 'Agriculture', 'Agriculture, Food & Natural Resources', 'Low', 'Low',
 ARRAY[
   'Farmers feed the entire world',
   'Modern farms use amazing technology',
   'Farmers work with nature every day'
 ],
 'Plant crops, care for animals, harvest food, maintain equipment, manage land',
 'Grow the food that feeds your community!'),

('MID_PASTRY_CHEF', 90, 82, 83, 'MIF', 75, 70, 35,
 'Culinary', 'Hospitality & Tourism', 'Low', 'Low',
 ARRAY[
   'Pastry chefs are edible artists',
   'Wedding cakes can cost thousands',
   'Chocolate sculptures are real art'
 ],
 'Design desserts, temper chocolate, decorate cakes, develop recipes, manage kitchen',
 'Create sweet masterpieces that celebrate life''s special moments!'),

('MID_FOOD_SCIENTIST', 82, 86, 88, 'LIF', 60, 85, 65,
 'Food Science', 'Science, Technology, Engineering & Mathematics', 'Low', 'High',
 ARRAY[
   'Food scientists make food safer',
   'They invent new foods we love',
   'Food science prevents illness'
 ],
 'Test food safety, develop products, analyze nutrition, research preservation, document findings',
 'Innovate the future of food and nutrition!'),

('MID_RESTAURANT_MGR', 78, 84, 87, 'HIF', 75, 65, 40,
 'Hospitality', 'Hospitality & Tourism', 'Low', 'Low',
 ARRAY[
   'Restaurant managers create experiences',
   'They handle million-dollar operations',
   'Great managers build loyal customers'
 ],
 'Schedule staff, manage inventory, handle customers, oversee service, track finances',
 'Create dining experiences people remember!'),

('MID_FOOD_CRITIC', 85, 75, 78, 'LIF', 70, 75, 50,
 'Media', 'Arts, A/V Technology & Communications', 'Low', 'High',
 ARRAY[
   'Food critics can make or break restaurants',
   'They travel the world tasting food',
   'Critics shape food culture'
 ],
 'Visit restaurants, taste dishes, take notes, write reviews, photograph food',
 'Share your passion for food with the world!'),

('HIGH_SOMMELIER', 76, 82, 85, 'LIF', 85, 60, 20,
 'Culinary', 'Hospitality & Tourism', 'Low', 'Low',
 ARRAY[
   'Sommeliers can identify wines blindfolded',
   'Wine knowledge spans centuries',
   'Top sommeliers earn six figures'
 ],
 'Taste wines, create pairings, manage cellars, train staff, advise customers',
 'Become an expert in the art and science of wine!'),

('HIGH_FOOD_ENGINEER', 78, 85, 90, 'LIF', 50, 85, 70,
 'Food Technology', 'Science, Technology, Engineering & Mathematics', 'Low', 'High',
 ARRAY[
   'Food engineers design factory systems',
   'They make mass production possible',
   'Innovation feeds billions'
 ],
 'Design equipment, optimize processes, ensure safety, solve problems, test systems',
 'Engineer systems that feed the world efficiently!'),

('HIGH_CULINARY_INSTRUCTOR', 83, 86, 84, 'MIF', 80, 70, 35,
 'Education', 'Education & Training', 'Low', 'Medium',
 ARRAY[
   'Culinary teachers inspire chefs',
   'They pass on centuries of knowledge',
   'Students become your legacy'
 ],
 'Plan lessons, demonstrate techniques, guide practice, evaluate skills, mentor students',
 'Teach the next generation of culinary artists!'),

-- ==== LIBRARY & INFORMATION SCIENCE ====

('ELEM_LIBRARIAN', 86, 90, 85, 'HIF', 90, 60, 40,
 'Library Science', 'Education & Training', 'Medium', 'Medium',
 ARRAY[
   'Librarians are information detectives',
   'Libraries are community hearts',
   'Librarians champion literacy'
 ],
 'Help patrons, organize books, plan programs, teach research, manage collections',
 'Connect people with the knowledge they seek!'),

('ELEM_STORYTELLER', 90, 85, 75, 'HIF', 95, 55, 20,
 'Entertainment', 'Arts, A/V Technology & Communications', 'Low', 'Medium',
 ARRAY[
   'Stories shape how we see the world',
   'Storytellers keep culture alive',
   'Every culture has unique stories'
 ],
 'Learn stories, practice telling, engage audiences, create voices, travel to venues',
 'Bring stories to life and inspire imaginations!'),

('MID_ARCHIVIST', 75, 83, 86, 'LIF', 85, 65, 45,
 'Information Science', 'Arts, A/V Technology & Communications', 'Low', 'High',
 ARRAY[
   'Archivists preserve history',
   'They handle priceless documents',
   'Digital archives last forever'
 ],
 'Catalog items, preserve materials, digitize documents, assist researchers, maintain databases',
 'Safeguard history for future generations!'),

('MID_RESEARCH_LIBRARIAN', 78, 85, 87, 'LIF', 80, 70, 50,
 'Library Science', 'Education & Training', 'Low', 'High',
 ARRAY[
   'Research librarians are expert investigators',
   'They help breakthrough discoveries',
   'Information is power'
 ],
 'Conduct research, teach skills, manage databases, assist scholars, curate resources',
 'Help researchers make world-changing discoveries!'),

('MID_INFO_SPECIALIST', 80, 82, 88, 'MIF', 60, 80, 65,
 'Information Technology', 'Information Technology', 'Medium', 'Full',
 ARRAY[
   'Information specialists organize chaos',
   'They make data useful',
   'Every company needs information management'
 ],
 'Organize data, design systems, train users, maintain databases, improve access',
 'Turn information chaos into organized knowledge!'),

('HIGH_DATA_LIBRARIAN', 76, 84, 89, 'LIF', 40, 85, 75,
 'Data Science', 'Information Technology', 'Low', 'Full',
 ARRAY[
   'Data librarians manage research data',
   'They enable scientific breakthroughs',
   'Data is the new oil'
 ],
 'Manage datasets, ensure compliance, teach data literacy, preserve research, enable sharing',
 'Manage the data driving scientific discovery!'),

('HIGH_DIGITAL_ARCHIVIST', 74, 82, 87, 'LIF', 30, 90, 70,
 'Digital Preservation', 'Information Technology', 'Low', 'Full',
 ARRAY[
   'Digital archivists save our digital heritage',
   'They preserve social media history',
   'Digital preservation is forever'
 ],
 'Preserve digital content, migrate formats, manage metadata, ensure access, document processes',
 'Preserve our digital world for the future!'),

('HIGH_INFO_ARCHITECT', 82, 83, 90, 'LIF', 35, 88, 68,
 'Information Design', 'Information Technology', 'Low', 'Full',
 ARRAY[
   'Information architects design how we find things',
   'They make websites intuitive',
   'Good IA is invisible but essential'
 ],
 'Design structures, create taxonomies, test usability, map user journeys, guide development',
 'Design how millions navigate information!'),

-- ==== ENVIRONMENTAL & CONSERVATION ====

('ELEM_PARK_RANGER', 92, 88, 85, 'MIF', 85, 70, 30,
 'Environmental', 'Agriculture, Food & Natural Resources', 'Low', 'Low',
 ARRAY[
   'Park rangers protect natural treasures',
   'They see amazing wildlife daily',
   'Rangers are nature''s guardians'
 ],
 'Patrol parks, educate visitors, protect wildlife, maintain trails, respond to emergencies',
 'Protect nature''s wonders for everyone to enjoy!'),

('ELEM_WILDLIFE_RESCUE', 88, 85, 82, 'MIF', 75, 75, 25,
 'Animal Care', 'Agriculture, Food & Natural Resources', 'Low', 'Low',
 ARRAY[
   'Wildlife rescuers save endangered species',
   'Every rescue makes a difference',
   'They work with amazing animals'
 ],
 'Rescue animals, provide medical care, rehabilitate wildlife, release to wild, educate public',
 'Save wild animals and return them to nature!'),

('MID_CONSERVATIONIST', 83, 86, 88, 'LIF', 70, 80, 55,
 'Environmental Science', 'Science, Technology, Engineering & Mathematics', 'Low', 'Medium',
 ARRAY[
   'Conservationists save ecosystems',
   'They fight climate change',
   'Conservation protects our future'
 ],
 'Study ecosystems, develop plans, monitor species, write reports, advocate for protection',
 'Protect Earth''s precious ecosystems!'),

('MID_ENV_EDUCATOR', 86, 84, 83, 'MIF', 65, 75, 45,
 'Education', 'Education & Training', 'Low', 'Medium',
 ARRAY[
   'Environmental educators inspire change',
   'They create tomorrow''s environmentalists',
   'Education saves the planet'
 ],
 'Teach programs, lead nature walks, develop curriculum, engage communities, inspire action',
 'Teach others to protect our planet!'),

('MID_RECYCLING_COORD', 78, 82, 85, 'HIF', 60, 75, 50,
 'Environmental Services', 'Agriculture, Food & Natural Resources', 'Medium', 'High',
 ARRAY[
   'Recycling coordinators reduce waste',
   'They save resources for the future',
   'Recycling creates green jobs'
 ],
 'Manage programs, educate public, track metrics, coordinate pickups, improve systems',
 'Lead the fight against waste!'),

('HIGH_ENV_ENGINEER', 80, 87, 91, 'LIF', 55, 85, 70,
 'Environmental Engineering', 'Science, Technology, Engineering & Mathematics', 'Low', 'High',
 ARRAY[
   'Environmental engineers clean our world',
   'They design green technologies',
   'Engineers solve climate challenges'
 ],
 'Design solutions, test water quality, develop systems, ensure compliance, innovate technology',
 'Engineer solutions to environmental challenges!'),

('HIGH_CLIMATE_SCIENTIST', 85, 85, 90, 'LIF', 40, 90, 75,
 'Climate Science', 'Science, Technology, Engineering & Mathematics', 'Low', 'High',
 ARRAY[
   'Climate scientists predict our future',
   'Their research shapes policy',
   'Science fights climate change'
 ],
 'Collect data, analyze trends, model climate, publish research, advise governments',
 'Study Earth''s climate to save our future!'),

('HIGH_SUSTAINABILITY_MGR', 82, 86, 89, 'MIF', 45, 88, 60,
 'Sustainability', 'Business Management & Administration', 'Low', 'High',
 ARRAY[
   'Sustainability managers make companies green',
   'They save money and the planet',
   'Every company needs sustainability'
 ],
 'Develop strategies, measure impact, implement programs, train staff, report progress',
 'Make businesses environmentally responsible!'),

('HIGH_RENEWABLE_ENERGY', 84, 88, 92, 'LIF', 30, 95, 80,
 'Energy', 'Science, Technology, Engineering & Mathematics', 'Low', 'High',
 ARRAY[
   'Renewable energy powers the future',
   'Solar and wind are booming industries',
   'Clean energy fights climate change'
 ],
 'Design systems, install equipment, monitor performance, maintain technology, innovate solutions',
 'Power the world with clean energy!'),

-- ==== COMMUNITY & CIVIC ENGAGEMENT ====

('ELEM_MAYOR', 85, 90, 88, 'MIF', 90, 60, 30,
 'Government', 'Government & Public Administration', 'Low', 'Low',
 ARRAY[
   'Mayors lead entire cities',
   'They make decisions affecting thousands',
   'Mayors shape communities'
 ],
 'Lead meetings, make decisions, meet citizens, solve problems, represent city',
 'Lead your community to a brighter future!'),

('ELEM_SOCIAL_WORKER', 82, 88, 86, 'HIF', 85, 70, 35,
 'Social Services', 'Human Services', 'Low', 'Medium',
 ARRAY[
   'Social workers change lives',
   'They help families stay together',
   'Social work is a calling'
 ],
 'Visit families, assess needs, connect resources, advocate for clients, document cases',
 'Help families overcome challenges and thrive!'),

('MID_CITY_PLANNER', 79, 84, 87, 'LIF', 70, 75, 55,
 'Urban Planning', 'Architecture & Construction', 'Low', 'High',
 ARRAY[
   'City planners design the future',
   'They create livable communities',
   'Planning shapes how we live'
 ],
 'Design layouts, review proposals, engage community, analyze data, create plans',
 'Design cities where people love to live!'),

('MID_COMMUNITY_ORG', 84, 82, 84, 'HIF', 65, 75, 40,
 'Community Development', 'Human Services', 'Low', 'Medium',
 ARRAY[
   'Community organizers create change',
   'They give people a voice',
   'Organizing builds power'
 ],
 'Plan events, mobilize residents, build coalitions, advocate for change, facilitate meetings',
 'Empower communities to create positive change!'),

('MID_YOUTH_COUNSELOR', 86, 85, 84, 'HIF', 75, 70, 35,
 'Youth Services', 'Human Services', 'Low', 'Medium',
 ARRAY[
   'Youth counselors guide the next generation',
   'They prevent problems before they start',
   'Mentoring changes lives'
 ],
 'Counsel youth, lead groups, plan activities, connect resources, support families',
 'Guide young people to bright futures!'),

('HIGH_POLICY_ANALYST', 76, 86, 89, 'LIF', 70, 75, 60,
 'Public Policy', 'Government & Public Administration', 'Low', 'High',
 ARRAY[
   'Policy analysts shape laws',
   'They influence government decisions',
   'Good policy improves lives'
 ],
 'Research issues, analyze data, write reports, brief officials, evaluate programs',
 'Create policies that improve society!'),

('HIGH_NONPROFIT_DIR', 83, 87, 88, 'MIF', 60, 75, 45,
 'Nonprofit Management', 'Business Management & Administration', 'Low', 'Medium',
 ARRAY[
   'Nonprofit directors lead missions',
   'They create social impact',
   'Nonprofits change the world'
 ],
 'Lead organization, fundraise, manage programs, build partnerships, measure impact',
 'Lead organizations that make the world better!'),

('HIGH_URBAN_DESIGNER', 80, 83, 86, 'LIF', 55, 82, 65,
 'Urban Design', 'Architecture & Construction', 'Low', 'Medium',
 ARRAY[
   'Urban designers create beautiful spaces',
   'They make cities walkable',
   'Design improves quality of life'
 ],
 'Design spaces, create renderings, engage stakeholders, plan landscapes, guide development',
 'Create public spaces where communities thrive!'),

('HIGH_PUBLIC_HEALTH', 81, 88, 90, 'MIF', 65, 80, 55,
 'Public Health', 'Health Science', 'Low', 'High',
 ARRAY[
   'Public health saves millions',
   'They prevent epidemics',
   'Health equity matters'
 ],
 'Analyze health data, develop programs, educate communities, coordinate responses, evaluate impact',
 'Protect and improve entire communities'' health!')

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
    '📊 Specialized Industries Engagement' as report,
    CASE
        WHEN career_code LIKE '%CHEF%' OR career_code LIKE '%BAKER%' OR career_code LIKE '%FOOD%' THEN 'Culinary'
        WHEN career_code LIKE '%LIBRAR%' OR career_code LIKE '%ARCHIV%' OR career_code LIKE '%INFO%' THEN 'Library/Information'
        WHEN career_code LIKE '%ENV%' OR career_code LIKE '%PARK%' OR career_code LIKE '%WILDLIFE%' OR career_code LIKE '%CLIMATE%' THEN 'Environmental'
        WHEN career_code LIKE '%MAYOR%' OR career_code LIKE '%SOCIAL%' OR career_code LIKE '%CITY%' OR career_code LIKE '%COMMUNITY%' THEN 'Community/Civic'
        ELSE 'Other'
    END as industry,
    COUNT(*) as careers,
    ROUND(AVG(ers_student_engagement), 1) as avg_student,
    ROUND(AVG(erp_parent_engagement), 1) as avg_parent,
    ROUND(AVG(ere_employer_engagement), 1) as avg_employer
FROM career_attributes
WHERE career_code IN (
    SELECT career_code FROM career_paths
    WHERE career_code LIKE 'ELEM_CHEF' OR career_code LIKE 'ELEM_BAKER'
       OR career_code LIKE 'ELEM_LIBRARIAN' OR career_code LIKE 'ELEM_PARK_RANGER'
       OR career_code LIKE 'ELEM_MAYOR' OR career_code LIKE '%FOOD%'
       OR career_code LIKE '%ENV%' OR career_code LIKE '%COMMUNITY%'
)
GROUP BY industry
ORDER BY industry;