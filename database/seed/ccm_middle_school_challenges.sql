-- ============================================
-- CCM MIDDLE SCHOOL CHALLENGES - 60 Total
-- 10 Companies × 6 P Categories
-- Ages 11-14, relatable small business scenarios
-- ============================================

-- Helper function for lens multipliers (create if not exists)
CREATE OR REPLACE FUNCTION get_lens_multipliers(p_cat TEXT)
RETURNS JSONB AS $$
BEGIN
    RETURN CASE p_cat
        WHEN 'people' THEN '{"ceo": 1.25, "chro": 1.30, "coo": 1.0, "cfo": 1.0, "cmo": 1.0, "cto": 1.0}'::jsonb
        WHEN 'product' THEN '{"cto": 1.30, "cmo": 1.15, "ceo": 1.0, "cfo": 1.0, "chro": 1.0, "coo": 1.0}'::jsonb
        WHEN 'process' THEN '{"coo": 1.25, "cfo": 1.20, "cto": 1.15, "ceo": 1.0, "cmo": 1.0, "chro": 1.0}'::jsonb
        WHEN 'place' THEN '{"coo": 1.25, "ceo": 1.25, "cfo": 1.0, "cmo": 1.0, "chro": 1.0, "cto": 1.0}'::jsonb
        WHEN 'promotion' THEN '{"cmo": 1.30, "ceo": 1.15, "coo": 1.0, "cfo": 1.0, "chro": 1.0, "cto": 1.0}'::jsonb
        WHEN 'price' THEN '{"cfo": 1.30, "ceo": 1.25, "coo": 1.0, "cmo": 1.0, "chro": 1.0, "cto": 1.0}'::jsonb
    END;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- BEANBUZZ COFFEE (Middle School) - 6 Challenges
-- Local coffee shop chain, 350 employees, 25 locations
-- ========================================

-- PEOPLE: Barista Training and Turnover
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Keeping Great Baristas',
    'Our baristas keep quitting after just a few months. Training new employees costs money and takes time, and customers notice when their favorite barista leaves. We need to figure out how to make BeanBuzz a great place to work so people want to stay longer.',
    'People challenges are about hiring good workers, training them well, and keeping them happy so they stay. Great businesses create workplaces where employees enjoy their jobs and want to do their best.',
    'people', 'people', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BEANBUZZ' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I want BeanBuzz to be known as a great place to work. Happy employees make customers happy, which helps our whole business grow. I''ll think about what makes a workplace somewhere people want to stay.',
        'cfo', 'I keep track of our money. Training new baristas costs about $1,500 each time, and we''ve trained 80 new people this year. That''s $120,000! If we can keep baristas longer, we''ll save money and make better coffee.',
        'cmo', 'I handle marketing and know that customers love seeing familiar, friendly faces. When baristas leave, customers feel like they''re losing a friend. Keeping great baristas helps keep loyal customers.',
        'cto', 'I manage our technology. Maybe better scheduling apps or easier order systems could make baristas'' jobs less stressful. Technology can help employees do their jobs better.',
        'chro', 'I''m the HR leader, so employee happiness is my main job. I can look at pay, schedules, benefits, and training to figure out why people leave and how to make them want to stay.',
        'coo', 'I run our daily operations across 25 stores. I see how understaffing stresses out the team and hurts service. Better retention means smoother operations and happier teams.'
    ),
    get_lens_multipliers('people'),
    ARRAY['employee_retention', 'training', 'workplace_culture', 'coffee_shop']
);

-- PRODUCT: Menu Variety vs. Simplicity
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Too Many Menu Choices?',
    'Our menu has 40 different drinks, but data shows customers mostly order the same 10 drinks. Having so many options slows down service and confuses customers. Should we simplify our menu or keep variety to please everyone?',
    'Product challenges are about what you sell and how it helps customers. Great products balance what customers want, what''s easy to make, and what makes money.',
    'product', 'product', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BEANBUZZ' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I think about our brand. Should BeanBuzz be known for simple, perfect drinks or endless choices? This decision shapes what customers think of us.',
        'cfo', 'I look at the numbers. We stock ingredients for 40 drinks but most go unused and spoil. Simpler menus could reduce waste and save money. But would we lose customers?',
        'cmo', 'I study customer preferences. Maybe customers like feeling they have choices even if they always order the same thing. I need to understand what customers really value.',
        'cto', 'I manage our ordering system. Simpler menus mean faster orders and fewer mistakes. Technology can help us see which drinks people actually order.',
        'chro', 'I think about barista training. Teaching 40 drinks takes weeks. A simpler menu means faster training and fewer mistakes, which reduces employee stress.',
        'coo', 'I run the shops and see long lines when menus are complicated. As COO, I know simpler menus mean faster service. But operations must match what customers want.'
    ),
    get_lens_multipliers('product'),
    ARRAY['menu_design', 'product_variety', 'customer_choice', 'operations']
);

-- PROCESS: Mobile Ordering System
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Adding Mobile Ordering',
    'Customers want to order on their phones and skip the line. Building a mobile app would cost $50,000, but it could make ordering faster and bring in more customers during busy morning hours.',
    'Process challenges are about how work gets done. Great processes make things faster, easier, and better for both employees and customers.',
    'process', 'process', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BEANBUZZ' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I see mobile ordering as the future. Customers expect convenience. But $50,000 is a lot for a small chain. I need to decide if this investment fits our strategy.',
        'cfo', 'I manage our budget. $50,000 is a big expense. Will mobile ordering bring in enough new customers to be worth it? I need to calculate if this investment makes financial sense.',
        'cmo', 'I handle marketing. Mobile ordering could attract busy customers who don''t have time to wait in line. This could help us compete with big chains. It''s a marketing advantage.',
        'cto', 'I would build the app, so this is my area. I need to make sure it works well, integrates with our current system, and is easy for customers to use. Technology quality matters.',
        'chro', 'I think about our employees. Mobile orders could reduce wait times, but they might also stress out baristas if too many orders come in at once. I need to prepare the team.',
        'coo', 'I run operations and manage workflow in all our stores. As COO, I need to figure out how mobile orders fit with walk-in customers so neither group has a bad experience.'
    ),
    get_lens_multipliers('process'),
    ARRAY['mobile_ordering', 'technology_investment', 'customer_convenience', 'digital']
);

-- PLACE: New Location Selection
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Where to Open Next?',
    'We want to open our 26th location. We''ve found two great options: one near a college campus with lots of students, another in a business district with office workers. Each location serves different customers at different times.',
    'Place challenges are about where and how customers can buy your products. Great location decisions consider who your customers are and when they need you.',
    'place', 'place', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BEANBUZZ' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I think about long-term growth. College students could become lifelong customers, but they have less money. Office workers spend more but might only come weekdays. Both have advantages.',
        'cfo', 'I analyze the costs and revenue. College area has cheaper rent but students spend less. Business district rent is higher but office workers buy premium drinks. I need to calculate which makes more profit.',
        'cmo', 'I study customer behavior. College students want a hangout space and Wi-Fi. Office workers want speed and convenience. As CMO, each location needs different marketing and atmosphere.',
        'cto', 'I think about technology needs. College students might use mobile ordering more. Business district might need faster service during rush hour. Different locations need different tech solutions.',
        'chro', 'I handle staffing. College area might need evening and weekend staff. Business district needs early morning crew. Different locations have different staffing needs and challenges.',
        'coo', 'I evaluate location details—parking, foot traffic, competing coffee shops. As COO, I know successful locations need the right mix of visibility, accessibility, and customer traffic patterns.'
    ),
    get_lens_multipliers('place'),
    ARRAY['location_strategy', 'site_selection', 'customer_targeting', 'expansion']
);

-- PROMOTION: Social Media vs. Traditional Marketing
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Instagram or Newspaper Ads?',
    'We have $10,000 for marketing. We could run newspaper ads reaching older customers, or focus on Instagram and TikTok reaching younger customers. Different marketing reaches different people.',
    'Promotion challenges are about letting customers know you exist and why they should choose you. Great marketing reaches the right people with the right message.',
    'promotion', 'promotion', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BEANBUZZ' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I think about who our customers are now and who we want them to be. This decision shapes BeanBuzz''s future. Do we focus on our current customers or reach new ones?',
        'cfo', 'I track marketing results. Social media is cheaper and reaches more people, but newspaper ads might reach customers who spend more. I need to measure which marketing brings the best return.',
        'cmo', 'Marketing is my specialty. As CMO, I know social media lets us show our personality and build community. Newspapers are traditional but might reach loyal, daily coffee buyers. Each has strengths.',
        'cto', 'I manage digital tools. Social media marketing requires technology—posting, tracking, analyzing. I can help measure social media success and automate some marketing tasks.',
        'chro', 'I think about our employees. Social media marketing could involve baristas posting photos and stories, making them brand ambassadors. This needs training and guidelines.',
        'coo', 'I ensure our shops can handle marketing success. If marketing works and brings more customers, operations must be ready to serve them well. Marketing promises must match reality.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['social_media_marketing', 'traditional_marketing', 'marketing_budget', 'customer_acquisition']
);

-- PRICE: Loyalty Program Pricing
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Free Drink Loyalty Program',
    'Should we start a loyalty card where customers get a free drink after buying 10? This rewards regular customers but costs money. We need to decide if giving away free drinks will make customers visit more often.',
    'Price challenges are about what to charge and how to give customers good value. Smart pricing keeps customers happy while making enough money to stay in business.',
    'price', 'price', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'BEANBUZZ' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I want loyal customers who visit regularly. A loyalty program might turn occasional customers into daily customers. But I need to make sure it helps our business grow.',
        'cfo', 'I calculate costs. If we give away 10% of drinks for free, that''s a lot of money. But if customers visit twice as often, we still make more money. As CFO, I need to do the math.',
        'cmo', 'I understand customer psychology. People love loyalty programs and feeling rewarded. As CMO, this could be great marketing that makes customers choose us over competitors.',
        'cto', 'I would build the digital loyalty system. Should it be a physical card or a phone app? Technology makes tracking easier and can send customers reminders.',
        'chro', 'I think about employee training. Baristas need to explain the program and track cards. This adds to their job duties, so training and clear processes matter.',
        'coo', 'I manage daily operations. Loyalty programs require tracking systems that work smoothly. As COO, I need to make sure this doesn''t slow down service or create confusion.'
    ),
    get_lens_multipliers('price'),
    ARRAY['loyalty_program', 'customer_rewards', 'pricing_strategy', 'repeat_business']
);

-- ========================================
-- SLICECITY PIZZA (Middle School) - 6 Challenges
-- Fast-casual pizza, 650 employees, 45 locations
-- ========================================

-- PEOPLE: Student Worker Management
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Hiring High School Students',
    'Many of our workers are high school students who can only work limited hours. They''re energetic and affordable, but they need more training and supervision. Should we hire more students or focus on full-time adult workers?',
    'People challenges are about hiring good workers, training them well, and keeping them happy so they stay. Great businesses create workplaces where employees enjoy their jobs and want to do their best.',
    'people', 'people', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SLICECITY' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of Slice City, I think about our company culture. Student workers bring energy and connect us to schools and families. But running a business requires reliability too.',
        'cfo', 'I look at costs. Students earn less per hour but need more training and supervision time. Full-time workers cost more but are more experienced. As CFO, I calculate total costs.',
        'cmo', 'I think about our community connections. Student workers help us connect to schools and do fundraisers. This builds goodwill and brings in families. It''s good for our reputation.',
        'cto', 'I manage our scheduling system. Students have complex availability with school and activities. Better scheduling technology could make student scheduling easier.',
        'chro', 'I''m the HR leader. Working with students requires understanding labor laws, school schedules, and first-job training. As CHRO, I can develop programs that help students succeed.',
        'coo', 'I run operations in 45 locations. I need reliable staffing to maintain quality and service. Students are great but require strong supervision systems. Operational consistency matters.'
    ),
    get_lens_multipliers('people'),
    ARRAY['student_workers', 'staffing_strategy', 'youth_employment', 'training']
);

-- PRODUCT: Build-Your-Own vs. Pre-Set Pizzas
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Customization or Speed?',
    'Customers love our build-your-own pizza option, but it slows down the line. Pre-set pizza combinations would be faster, but customers might miss making their own choices. How do we balance customization with speed?',
    'Product challenges are about what you sell and how it helps customers. Great products balance what customers want, what''s easy to make, and what makes money.',
    'product', 'product', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SLICECITY' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, our brand is about fresh, customizable pizza. But if customers wait 20 minutes, they might go elsewhere. I need to preserve what makes us special while keeping service fast.',
        'cfo', 'I analyze efficiency. Custom pizzas take 30% longer to make, which limits how many customers we can serve. Faster service means more sales. But do customers pay for customization?',
        'cmo', 'I study customer satisfaction. As CMO, I know customization is part of our appeal. Maybe we can offer both—popular pre-set combos for speed and custom options for those who want them.',
        'cto', 'I manage our ordering system. Better technology could speed up custom orders—touchscreens, visual builders, clear displays to the kitchen. Technology can help balance speed and choice.',
        'chro', 'I think about employee training. Custom orders require more skills and decision-making. Pre-set pizzas are easier to teach. Simpler processes might reduce training time and mistakes.',
        'coo', 'I run kitchen operations. As COO, I see the bottlenecks. Maybe we could design our kitchen flow better, or prep popular custom combinations. Operations can improve both speed and customization.'
    ),
    get_lens_multipliers('product'),
    ARRAY['customization', 'service_speed', 'product_design', 'customer_experience']
);

-- PROCESS: Online Ordering Integration
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Too Many Ordering Platforms',
    'Customers can order from our website, app, DoorDash, and Grubhub. Each platform is a separate system, causing confusion and mistakes. An integrated system would cost $75,000 but could reduce errors by 50%.',
    'Process challenges are about how work gets done. Great processes make things faster, easier, and better for both employees and customers.',
    'process', 'process', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SLICECITY' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I want smooth operations and happy customers. Multiple platforms reach more people but create chaos. This investment could solve a real problem.',
        'cfo', 'I evaluate the $75,000 cost. We''re remaking orders due to mistakes, which costs money and wastes ingredients. As CFO, if integration saves money long-term, it''s worth it.',
        'cmo', 'I think about customer experience. Order mistakes hurt our reputation. As CMO, reliable service across all platforms is important for our brand and customer trust.',
        'cto', 'I would implement the integrated system. As CTO, this is my expertise. I can evaluate different solutions and make sure whichever system we choose works smoothly.',
        'chro', 'I consider employee stress. Managing multiple systems frustrates workers and leads to burnout. Better systems make jobs easier and can improve employee satisfaction.',
        'coo', 'I run kitchen operations across 45 locations. As COO, order chaos slows us down and causes mistakes. Integration would streamline operations and let us focus on making great pizza.'
    ),
    get_lens_multipliers('process'),
    ARRAY['system_integration', 'order_management', 'technology_efficiency', 'multi_platform']
);

-- PLACE: Delivery Radius Decision
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'How Far Should We Deliver?',
    'Should we deliver within 3 miles or 5 miles? Longer delivery reaches more customers but pizza might arrive cold, and drivers spend more time on the road. Shorter delivery keeps pizza hot but limits our reach.',
    'Place challenges are about where and how customers can buy your products. Great location decisions consider who your customers are and when they need you.',
    'place', 'place', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SLICECITY' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I care about customer experience. Pizza quality matters most. I''d rather deliver less far with hot pizza than deliver everywhere with cold pizza. Brand reputation is crucial.',
        'cfo', 'I look at delivery costs. Longer drives mean higher gas costs and fewer deliveries per driver. But reaching more customers means more orders. As CFO, I need to find the profitable balance.',
        'cmo', 'I think about customer expectations. People understand that far distances take longer. As CMO, I can set clear delivery zones and manage expectations so customers know what we can deliver.',
        'cto', 'I manage routing technology. Better GPS and routing systems could optimize driver routes and keep pizza hot longer. Technology might let us deliver further without quality loss.',
        'chro', 'I think about driver safety and satisfaction. Long drives can be tiring and risky. As CHRO, I need to consider what''s reasonable and safe to ask from our delivery drivers.',
        'coo', 'I oversee all operations. As COO, I need to consider driver efficiency, pizza quality, customer satisfaction, and operational costs. The right delivery radius balances all these factors.'
    ),
    get_lens_multipliers('place'),
    ARRAY['delivery_strategy', 'service_area', 'food_quality', 'logistics']
);

-- PROMOTION: School Fundraiser Program
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Pizza Night Fundraisers',
    'Local schools want us to host fundraiser nights where we donate 20% of sales back to the school. This brings in customers and builds community goodwill, but it reduces our profit on those nights.',
    'Promotion challenges are about letting customers know you exist and why they should choose you. Great marketing reaches the right people with the right message.',
    'promotion', 'promotion', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SLICECITY' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, community connections are important. Fundraisers make us part of the community, not just a business. This builds long-term loyalty even if we make less money that night.',
        'cfo', 'I calculate the costs. We give away 20% of sales, but fundraiser nights often bring in 3x normal customers. As CFO, I need to see if higher volume makes up for lower margins.',
        'cmo', 'I love this idea! As CMO, fundraisers are great marketing—families try us who might not have before, and we become the "community pizza place." The goodwill is valuable.',
        'cto', 'I would track fundraiser results. Technology helps us measure how many first-time customers come back later. Data shows if fundraisers create lasting customer relationships.',
        'chro', 'I think about employee experience. Fundraiser nights are busy and energetic. Staff need to be prepared, but these events can also be fun and show employees we care about community.',
        'coo', 'I manage busy operations. As COO, fundraiser nights require extra prep and staffing. I need to ensure we''re operationally ready to deliver great service when crowds come in.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['community_engagement', 'fundraising', 'cause_marketing', 'local_business']
);

-- PRICE: Family Meal Deal Pricing
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Family Meal Bundle Deal',
    'Should we offer a family meal deal—2 pizzas, breadsticks, and drinks for $35? This is cheaper than ordering separately, which means less profit per order, but might bring in more families.',
    'Price challenges are about what to charge and how to give customers good value. Smart pricing keeps customers happy while making enough money to stay in business.',
    'price', 'price', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SLICECITY' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I want Slice City to be the family pizza destination. A family deal could make us the obvious choice for family dinners. Lower profit per order might mean more total orders.',
        'cfo', 'I analyze the numbers. The bundle costs us $18 to make and we sell for $35, that''s $17 profit. Individual pricing gives us $20 profit. As CFO, I need to know if volume increase justifies lower margin.',
        'cmo', 'I study customer behavior. Families love deals and feeling like they''re getting value. As CMO, this bundle could attract families every week instead of occasionally. Deals drive regular visits.',
        'cto', 'I manage our ordering system. Meal deals need clear pricing in all our systems. Technology should make ordering bundles easy and ensure correct pricing across all platforms.',
        'chro', 'I think about operational impact on employees. Bundles could be easier—fewer customization decisions. Or they could be harder—special packaging and preparation. Training needs to reflect new offerings.',
        'coo', 'I oversee operations. Family meal deals need prep, packaging, and coordination. As COO, I''ll ensure kitchens can handle bundle orders efficiently without slowing down other orders.'
    ),
    get_lens_multipliers('price'),
    ARRAY['bundle_pricing', 'family_deals', 'value_pricing', 'meal_packages']
);

-- ========================================
-- PAGECRAFT BOOKS (Middle School) - 6 Challenges
-- Independent bookstore chain, 280 employees, 18 locations
-- ========================================

-- PEOPLE: Hiring Book Lovers vs. Sales Experience
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Passionate Readers or Experienced Sellers?',
    'When hiring booksellers, should we prioritize people who love books and reading, or people with retail sales experience? Book lovers give great recommendations but might need sales training. Experienced sellers know retail but might not know books well.',
    'People challenges are about hiring good workers, training them well, and keeping them happy so they stay. Great businesses create workplaces where employees enjoy their jobs and want to do their best.',
    'people', 'people', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PAGECRAFT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I think about PageCraft''s identity. Are we a retail store that sells books, or a community of book lovers who happen to run a business? This hiring choice reflects our values.',
        'cfo', 'I track sales performance. Experienced sellers might sell more initially, but book lovers build lasting customer relationships. As CFO, I need to measure which approach drives better long-term revenue.',
        'cmo', 'I manage our brand. As CMO, passionate readers create authentic customer connections. People come to PageCraft for recommendations and community, not just transactions. That''s our competitive advantage.',
        'cto', 'I think about technology training. Retail experience includes cash registers and inventory systems. Book lovers might need more tech training. I can make systems easier to learn.',
        'chro', 'I''m the HR leader, so hiring is my specialty. As CHRO, I can look for people with both traits, or create training that gives book lovers sales skills. We don''t have to choose just one.',
        'coo', 'I run daily operations in 18 stores. Both skills matter—sales keep us profitable, book knowledge keeps customers coming back. Maybe different roles need different strengths.'
    ),
    get_lens_multipliers('people'),
    ARRAY['hiring_strategy', 'employee_skills', 'cultural_fit', 'retail_expertise']
);

-- PRODUCT: Used Books vs. New Books Only
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Should We Sell Used Books?',
    'Adding used books could attract budget-conscious readers and reduce waste. However, used books give us smaller profits and might make our stores feel less upscale. Do we add used books or stay new-only?',
    'Product challenges are about what you sell and how it helps customers. Great products balance what customers want, what''s easy to make, and what makes money.',
    'product', 'product', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PAGECRAFT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I consider our brand positioning. Used books could make reading more accessible, fitting our community mission. But does it change how customers see us? This is a strategic brand decision.',
        'cfo', 'I analyze profitability. Used books have lower margins—we might make $3 instead of $8 per book. But we could sell more total books. As CFO, volume versus margin is the key question.',
        'cmo', 'I study customer needs. Many readers, especially students, can''t afford new books. As CMO, used books expand our customer base and show we care about accessibility. It''s good for community reputation.',
        'cto', 'I manage inventory systems. Used books are harder to track—each one is unique. Our technology would need upgrades to handle used book inventory efficiently.',
        'chro', 'I think about staffing. Evaluating used book condition and pricing requires trained judgment. Employees need new skills to assess quality and set fair prices.',
        'coo', 'I run store operations. As COO, used books require extra space, organization, and quality control. Operations become more complex, but could also attract more foot traffic.'
    ),
    get_lens_multipliers('product'),
    ARRAY['product_mix', 'used_goods', 'sustainability', 'affordability']
);

-- PROCESS: Inventory Management System
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Better Inventory Tracking',
    'We often run out of popular books or order too many copies that don''t sell. A better inventory system costs $40,000 but could reduce overstock by 30% and prevent stockouts of bestsellers.',
    'Process challenges are about how work gets done. Great processes make things faster, easier, and better for both employees and customers.',
    'process', 'process', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PAGECRAFT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, having the right books at the right time is crucial. Customers leave disappointed when we''re out of stock. This system could improve customer satisfaction and sales.',
        'cfo', 'I calculate costs and savings. We waste $60,000 yearly on books that don''t sell. As CFO, if this $40,000 system reduces waste by 30%, it pays for itself in 2 years. That''s a good investment.',
        'cmo', 'I think about customer experience. Nothing frustrates readers more than searching for a book we don''t have. Better inventory means happier customers and better reviews.',
        'cto', 'I would implement this system. As CTO, good inventory software connects to sales data and predicts what books we''ll need. Technology can actually predict trends before we run out.',
        'chro', 'I consider employee impact. Staff spend lots of time manually checking inventory and placing orders. Better systems free them up to help customers instead of counting books.',
        'coo', 'I manage operations across 18 stores. As COO, inventory problems waste money and space. Better tracking means more efficient operations, less waste, and happier customers who find what they want.'
    ),
    get_lens_multipliers('process'),
    ARRAY['inventory_management', 'system_upgrade', 'efficiency', 'stock_optimization']
);

-- PLACE: Online Store Strategy
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Competing with Amazon Online',
    'Should we invest $30,000 in a better online store with shipping? We can''t match Amazon''s prices or speed, but we could offer personal recommendations, signed books, and support local businesses. Is online worth it for an independent bookstore?',
    'Place challenges are about where and how customers can buy your products. Great location decisions consider who your customers are and when they need you.',
    'place', 'place', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PAGECRAFT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I know we can''t beat Amazon on price or speed. But we offer something they don''t—personal service and community connection. Online could extend those values beyond our physical stores.',
        'cfo', 'I evaluate the investment. $30,000 for online sales, but shipping costs reduce profits. As CFO, I need to see if enough customers will pay slightly more for our personal touch and local support.',
        'cmo', 'I love this idea! As CMO, our strength is relationships and curation. An online store with staff picks, local author features, and personalized recommendations differentiates us from Amazon.',
        'cto', 'I would build the online store. As CTO, I can create features Amazon doesn''t have—video recommendations from staff, virtual book clubs, local delivery options. Technology can enhance our personal touch.',
        'chro', 'I think about staffing. Online orders require fulfillment, shipping, and customer service. These are new skills. I''d need to train staff or hire for these roles.',
        'coo', 'I run operations. As COO, online sales add complexity—packing, shipping, returns, inventory coordination between stores and online. Operations must be ready for this expansion.'
    ),
    get_lens_multipliers('place'),
    ARRAY['ecommerce', 'online_retail', 'omnichannel', 'independent_business']
);

-- PROMOTION: Author Events and Book Clubs
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Investing in Community Events',
    'We could spend $2,000 monthly on author visits, book clubs, and reading events. These events bring people together but don''t directly sell many books. Are community events good marketing or expensive extras?',
    'Promotion challenges are about letting customers know you exist and why they should choose you. Great marketing reaches the right people with the right message.',
    'promotion', 'promotion', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PAGECRAFT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I believe bookstores should be community gathering places, not just retail stores. Events create connections that build lasting loyalty. This is about long-term relationships, not quick sales.',
        'cfo', 'I measure results. Events cost $24,000 yearly but attendance is free. As CFO, I need to track if event attendees become regular customers who spend more over time.',
        'cmo', 'I love community events! As CMO, this is marketing that builds authentic relationships. People remember experiences—meeting an author or discussing a book with friends. This makes PageCraft special.',
        'cto', 'I can enhance events with technology. Live-streaming author talks, virtual book clubs, event registration systems. Technology can extend event reach beyond people physically present.',
        'chro', 'I think about staff involvement. Employees running events connect with customers in meaningful ways. This can be fulfilling work that makes staff proud to work here.',
        'coo', 'I manage event logistics. As COO, events require space, setup, and coordination. I need to ensure events run smoothly without disrupting normal shopping. Good planning makes both possible.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['community_events', 'author_events', 'book_clubs', 'experiential_marketing']
);

-- PRICE: Membership Discount Program
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Annual Membership for Discounts',
    'Should we offer a $25 annual membership that gives 10% off all purchases? This could increase customer loyalty and regular visits, but it reduces our profit margin on each sale to members.',
    'Price challenges are about what to charge and how to give customers good value. Smart pricing keeps customers happy while making enough money to stay in business.',
    'price', 'price', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PAGECRAFT' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I want customers who visit regularly, not occasionally. A membership program could turn casual browsers into committed readers who shop here first. That loyalty is valuable.',
        'cfo', 'I calculate the numbers. If members pay $25 and get 10% off, they need to spend $250 yearly for us to break even. As CFO, I need to estimate how many will spend more than that.',
        'cmo', 'I understand customer psychology. Memberships create belonging and commitment. As CMO, members will choose us over competitors because they''re already invested. This builds a community.',
        'cto', 'I would build the membership tracking system. Technology can automatically apply discounts, track member purchases, and send special offers. Good systems make membership feel valuable.',
        'chro', 'I think about employee training. Staff need to explain membership benefits and enroll customers. This requires sales skills and customer service training. Programs need clear guidelines.',
        'coo', 'I manage operations. As COO, membership programs need smooth systems—easy enrollment, clear discount application, member recognition. Operational simplicity makes programs successful.'
    ),
    get_lens_multipliers('price'),
    ARRAY['membership_program', 'customer_loyalty', 'discount_strategy', 'recurring_revenue']
);

-- ========================================
-- SCOOPSHOP ICE CREAM (Middle School) - 6 Challenges
-- Artisan ice cream shops, 310 employees, 22 locations
-- ========================================

-- PEOPLE: Seasonal vs. Year-Round Staffing
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Summer Rush Staffing',
    'Ice cream sales triple in summer. Should we hire lots of seasonal workers just for summer, or keep a stable year-round team? Seasonal hiring is cheaper but requires constant training. Year-round staff is more expensive but more experienced.',
    'People challenges are about hiring good workers, training them well, and keeping them happy so they stay. Great businesses create workplaces where employees enjoy their jobs and want to do their best.',
    'people', 'people', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SCOOPSHOP' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of The Scoop Shop, I think about service quality. Experienced staff make better ice cream and create better customer experiences. But I also need to be realistic about winter slowdowns.',
        'cfo', 'I analyze costs carefully. Year-round staff costs more in slow winter months when sales are low. Seasonal staff costs less overall but requires repeated hiring and training. As CFO, I need to compare total costs.',
        'cmo', 'I think about customer experience. Regular customers love seeing familiar faces. As CMO, consistent staff builds relationships. But maybe seasonal energy and excitement is part of summer''s fun?',
        'cto', 'I manage scheduling systems. Technology can help—easier seasonal onboarding, better schedule optimization, training videos. Tech can make seasonal hiring less painful.',
        'chro', 'I''m the HR leader. Seasonal hiring means constant recruiting, onboarding, and training. Year-round staff means career development and retention programs. As CHRO, each approach requires different HR strategies.',
        'coo', 'I run operations in 22 locations. Summer lines move faster with experienced staff. Winter quality stays better with year-round teams. As COO, I balance service quality with practical reality.'
    ),
    get_lens_multipliers('people'),
    ARRAY['seasonal_staffing', 'workforce_planning', 'employee_retention', 'hiring']
);

-- PRODUCT: Standard vs. Rotating Flavors
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Flavor Strategy: Classics or Creativity?',
    'Should we offer 20 standard flavors year-round, or have 12 classics plus 8 rotating seasonal flavors? Rotating flavors create excitement and give customers reasons to visit often. Standard flavors are simpler to manage and customers know what to expect.',
    'Product challenges are about what you sell and how it helps customers. Great products balance what customers want, what''s easy to make, and what makes money.',
    'product', 'product', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SCOOPSHOP' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I think about our brand identity. Should we be reliable (always have your favorite) or exciting (always something new)? Both approaches can work, but they create different customer expectations.',
        'cfo', 'I look at inventory and waste. Rotating flavors mean buying new ingredients monthly, with risk some flavors flop. Standard flavors mean efficient ingredient use. As CFO, I prefer predictability but understand excitement drives sales.',
        'cmo', 'I love rotating flavors! As CMO, they create buzz—customers share new discoveries on social media, visit more often to try limited flavors, and feel like insiders. This is great marketing.',
        'cto', 'I manage our ordering and display systems. Rotating flavors require frequent menu updates and staff training on new flavors. Technology can make this easier with digital menus and flavor information.',
        'chro', 'I think about employee engagement. Creating new flavors could be fun for staff—testing, naming, and promoting them. This could make work more interesting and creative, improving job satisfaction.',
        'coo', 'I run ice cream production and operations. As COO, rotating flavors are more complex—new recipes, ingredient sourcing, staff training. But they can also be exciting. Operations needs strong systems for both approaches.'
    ),
    get_lens_multipliers('product'),
    ARRAY['product_variety', 'flavor_strategy', 'seasonal_products', 'innovation']
);

-- PROCESS: Streamlining Service Speed
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Faster Service System',
    'Long summer lines make customers wait 15 minutes. We could add a pre-order system where customers order ahead on their phones, or redesign our serving process to be faster. Which approach better solves our speed problem?',
    'Process challenges are about how work gets done. Great processes make things faster, easier, and better for both employees and customers.',
    'process', 'process', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SCOOPSHOP' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, customer experience matters most. Long waits frustrate families. Both solutions could work, but they create different experiences. I need to think about what fits our brand best.',
        'cfo', 'I compare costs. Pre-order app costs $25,000 to build. Process redesign might just require training and layout changes. As CFO, I''ll evaluate which solution gives best results for the money.',
        'cmo', 'I consider customer expectations. Some families enjoy browsing flavors together. Others want quick pickup. As CMO, maybe we need both options—traditional service and mobile pickup.',
        'cto', 'I would build the pre-order system. As CTO, mobile ordering works great for busy parents. But technology only helps if in-store process is also efficient. We might need both improvements.',
        'chro', 'I think about employee stress. Long lines and rushing create pressure. Better processes or pre-orders could reduce stress. Happy, calm staff provide better service. I''d choose the solution that helps employees most.',
        'coo', 'I run operations and see the bottlenecks. As COO, I might be able to redesign flow—better scooping stations, clearer displays, streamlined toppings. Sometimes operational changes beat technology.'
    ),
    get_lens_multipliers('process'),
    ARRAY['service_speed', 'customer_experience', 'process_improvement', 'mobile_ordering']
);

-- PLACE: Mall Location vs. Standalone
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Where to Open Next Location?',
    'We''re opening our 23rd shop. Option A: A mall location with lots of foot traffic but high rent and limited hours. Option B: A standalone shop in a neighborhood with lower rent and more control but needing to build our own traffic.',
    'Place challenges are about where and how customers can buy your products. Great location decisions consider who your customers are and when they need you.',
    'place', 'place', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SCOOPSHOP' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I think about brand positioning. Mall locations might feel more corporate. Standalone shops feel more special and destination-worthy. Location choice affects how customers see us.',
        'cfo', 'I analyze the finances. Mall rent is $8,000/month with built-in traffic. Standalone is $3,500/month but needs marketing to drive traffic. As CFO, I need to calculate which location generates better profit.',
        'cmo', 'I think about customer experience and marketing. Standalone locations let us create unique spaces—outdoor seating, neighborhood events, local flavor. As CMO, this builds stronger community connections.',
        'cto', 'I consider practical factors. Mall hours are restricted—closed when mall closes. Standalone gives us flexibility for extended summer hours. This affects when customers can visit us.',
        'chro', 'I think about employee experience. Mall locations might be easier for teenage workers—public transportation, food court access. Standalone might need parking. Location affects who can work there.',
        'coo', 'I evaluate operational factors. As COO, malls provide security, maintenance, and traffic. Standalone means we handle everything but have more control. Both have advantages—it depends on our operations strengths.'
    ),
    get_lens_multipliers('place'),
    ARRAY['location_strategy', 'site_selection', 'mall_retail', 'standalone_stores']
);

-- PROMOTION: Birthday Party Program
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Birthday Party Package',
    'Should we offer birthday party packages—$200 for ice cream, decorations, and a party room for 12 kids? Parties bring in groups and create memories, but they require space, staff, and coordination during our busiest times.',
    'Promotion challenges are about letting customers know you exist and why they should choose you. Great marketing reaches the right people with the right message.',
    'promotion', 'promotion', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SCOOPSHOP' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, birthday parties create magical memories that families associate with The Scoop Shop forever. Kids who have birthdays here might visit for years. This builds emotional connections.',
        'cfo', 'I calculate party profitability. $200 for 12 kids plus party room and staff time. Food costs might be $60, labor $40, that''s $100 profit per party. As CFO, if we do 100 parties yearly, that''s $10,000 profit.',
        'cmo', 'I love this idea! As CMO, birthday parties are amazing word-of-mouth marketing. Every child at a party might ask their parents to take them. Plus, parents share party photos on social media. Great promotion!',
        'cto', 'I would build an online party booking system. Technology makes scheduling easy, prevents double-booking, and allows parents to customize online. Good systems make parties run smoothly.',
        'chro', 'I think about staffing. Birthday parties need dedicated staff during busy weekends. As CHRO, I need to hire and train party coordinators who are good with energetic kids. Special skills required.',
        'coo', 'I manage operations. Parties during busy summer weekends could interfere with regular customers. As COO, I need dedicated party space and schedules that don''t hurt normal business. Planning is crucial.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['birthday_parties', 'event_marketing', 'experiential_marketing', 'word_of_mouth']
);

-- PRICE: Premium vs. Value Pricing
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Pricing Strategy: Premium or Affordable?',
    'Our handmade ice cream costs $5.50 per scoop—more than grocery store ice cream but less than fancy gelato shops. Should we raise prices to $6.50 (positioning as premium artisan) or lower to $4.50 (attracting more families)? Different pricing sends different messages.',
    'Price challenges are about what to charge and how to give customers good value. Smart pricing keeps customers happy while making enough money to stay in business.',
    'price', 'price', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'SCOOPSHOP' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, pricing reflects our brand. Higher prices say "premium quality," lower prices say "family friendly." Both can work, but once we choose, changing later is hard. This is a strategic brand decision.',
        'cfo', 'I analyze the math. At $6.50, we need to sell 15% fewer scoops to make the same money. At $4.50, we need to sell 25% more. As CFO, I study customer price sensitivity carefully.',
        'cmo', 'I think about customer perception. As CMO, price sends a quality signal. Higher prices might attract customers seeking special treats. Lower prices attract families visiting more often. Who do we want?',
        'cto', 'I consider operational impacts. Lower prices mean higher volume—more stress on systems and staff. Higher prices mean lower volume but potentially easier operations. Technology needs to support either strategy.',
        'chro', 'I think about employee tips. Higher prices might mean better tips. But lower prices mean more customers and potentially more total tips. Pricing affects employee income beyond their wages.',
        'coo', 'I run operations. As COO, higher volume (from lower prices) strains capacity—longer lines, more stress. Lower volume (from higher prices) is operationally easier but needs same staffing. I''d consider what we can handle.'
    ),
    get_lens_multipliers('price'),
    ARRAY['pricing_strategy', 'value_positioning', 'premium_pricing', 'price_perception']
);

-- ========================================
-- PAWPARADISE PET SUPPLIES (Middle School) - 6 Challenges
-- Regional pet supply stores, 420 employees, 28 locations
-- ========================================

-- PEOPLE: Pet Expert Hiring
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Hiring Animal Lovers',
    'Should we hire employees who really know about animals and pets, or people with retail experience? Pet experts give great advice but might not know how to run a cash register. Retail workers know stores but might not know the difference between hamster and guinea pig food.',
    'People challenges are about hiring good workers, training them well, and keeping them happy so they stay. Great businesses create workplaces where employees enjoy their jobs and want to do their best.',
    'people', 'people', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PAWPARADISE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I think about what makes Paw Paradise special. Pet owners trust us for advice. Hiring animal experts shows we care about pets, not just sales. This builds our reputation.',
        'cfo', 'I track sales data. Pet knowledge might help customers buy the right products, reducing returns. But retail skills drive higher sales. As CFO, I need to see which creates better revenue.',
        'cmo', 'I love the idea of pet experts! As CMO, knowledgeable staff is our best marketing. Pet owners tell friends about employees who helped them. Word-of-mouth from happy customers is priceless.',
        'cto', 'I can create training tools. Videos about products, pet care guides on tablets, quick reference apps. Technology can give retail workers pet knowledge faster than traditional training.',
        'chro', 'I''m the HR leader. As CHRO, I can create hiring profiles that look for both skills, or develop training that gives pet lovers retail skills. We can build the workforce we need.',
        'coo', 'I run operations. As COO, both matter—pet knowledge helps customers, retail skills keep stores running smoothly. Maybe different positions need different strengths—some floor staff as experts, others as retail specialists.'
    ),
    get_lens_multipliers('people'),
    ARRAY['hiring_strategy', 'expertise', 'retail_skills', 'customer_service']
);

-- PRODUCT: Natural vs. Budget Pet Food
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Premium Pet Food Focus',
    'Should we focus more on natural, premium pet foods or carry more budget brands? Premium foods are healthier and make bigger profits, but cost more. Budget brands help families on tight budgets afford pet care.',
    'Product challenges are about what you sell and how it helps customers. Great products balance what customers want, what''s easy to make, and what makes money.',
    'product', 'product', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PAWPARADISE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I want to help all pets, not just ones with wealthy owners. But premium products align with our quality image. This is a values question—who do we serve?',
        'cfo', 'I analyze profits. Premium food gives us 35% margins versus 15% on budget brands. As CFO, higher margins are attractive. But volume matters too—budget brands sell more units.',
        'cmo', 'I think about our brand position. As CMO, premium focus could make us the "quality pet store." But excluding budget shoppers might hurt our community-focused image. Positioning is tricky.',
        'cto', 'I manage inventory systems. Carrying both premium and budget products means more SKUs, more shelf space, more complexity. Technology helps track it all, but more variety creates operational challenges.',
        'chro', 'I consider employee perspectives. Staff might prefer selling products they believe in—quality food that keeps pets healthy. This could improve job satisfaction if we focus on premium.',
        'coo', 'I run operations. As COO, carrying both makes sense—different aisles, different customers. We can merchandise premium prominently while still offering budget options. Operations can handle variety.'
    ),
    get_lens_multipliers('product'),
    ARRAY['product_mix', 'premium_products', 'value_products', 'pet_health']
);

-- PROCESS: Adoption Event Coordination
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Weekend Adoption Events',
    'Local animal shelters want to hold adoption events at our stores every weekend. This brings in crowds and helps animals find homes, but disrupts normal shopping and requires staff time to coordinate.',
    'Process challenges are about how work gets done. Great processes make things faster, easier, and better for both employees and customers.',
    'process', 'process', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PAWPARADISE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, adoption events align with our mission of pet welfare. They create positive community connections. Even if it''s chaotic on weekends, it''s the right thing to do for animals.',
        'cfo', 'I measure impact. Adoption events bring crowds who might buy supplies for new pets. As CFO, I''d track if adoption day visitors become long-term customers buying food, toys, and supplies.',
        'cmo', 'I love this! As CMO, adoption events are incredible marketing—emotional, shareable, community-focused. People remember the store where they adopted their pet. This builds lifelong loyalty.',
        'cto', 'I think about logistics. Technology could help—online event schedules, waitlists, new pet starter pack recommendations. Tech can make adoption events run more smoothly.',
        'chro', 'I consider employee experience. Staff might love helping animals find homes—it''s meaningful work. But weekend disruption could stress teams. As CHRO, I''d ensure proper staffing and support.',
        'coo', 'I run operations. As COO, I need to plan space, supplies, and staffing for adoption events. With good processes, we can host events without hurting normal operations. Planning is everything.'
    ),
    get_lens_multipliers('process'),
    ARRAY['community_events', 'animal_welfare', 'event_management', 'social_impact']
);

-- PLACE: Grooming Service Addition
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Adding Grooming Services',
    'Should we add pet grooming services to our stores? This would give customers another reason to visit and could be profitable, but requires hiring groomers, building grooming areas, and managing appointment schedules.',
    'Place challenges are about where and how customers can buy your products. Great location decisions consider who your customers are and when they need you.',
    'place', 'place', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PAWPARADISE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, grooming services transform us from product seller to complete pet care destination. This is strategic—do we want to be retailers or service providers? Big decision.',
        'cfo', 'I analyze service economics. Grooming generates $45 per visit with decent margins. But initial investment is $25,000 per store for equipment and build-out. As CFO, I need to calculate payback period.',
        'cmo', 'I see grooming as great marketing. As CMO, customers visit monthly for grooming and buy products while here. Plus, well-groomed pets are walking advertisements for our services!',
        'cto', 'I would build booking and scheduling systems. Technology makes appointment management smooth and reduces no-shows with reminders. Good systems are critical for service businesses.',
        'chro', 'I need to hire and train groomers. As CHRO, this means new job categories, certifications, and skills. Groomers are specialists requiring different recruitment than retail staff.',
        'coo', 'I run store operations. As COO, grooming requires dedicated space, equipment, supplies, and workflow management. It''s operationally complex but could differentiate us from competitors.'
    ),
    get_lens_multipliers('place'),
    ARRAY['service_expansion', 'grooming', 'business_model', 'customer_services']
);

-- PROMOTION: Social Media Pet Photos
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Pet Photo Contest',
    'We want to run a monthly "cutest pet" photo contest on Instagram where customers share photos and vote. Winners get gift cards. This could boost social media following and engagement.',
    'Promotion challenges are about letting customers know you exist and why they should choose you. Great marketing reaches the right people with the right message.',
    'promotion', 'promotion', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PAWPARADISE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I love connecting with customers. Pet owners adore their animals and love sharing photos. This contest celebrates that bond and connects us emotionally with customers.',
        'cfo', 'I evaluate costs. Gift cards cost maybe $500 monthly. As CFO, if this grows our social media following and brings customers in, it''s worth it. Social media marketing is cost-effective.',
        'cmo', 'This is perfect! As CMO, people love sharing pet photos. User-generated content is authentic marketing. Plus, contestants will share with friends to get votes, spreading our brand naturally.',
        'cto', 'I manage our social media and website. As CTO, I can integrate contests, voting systems, and galleries. Technology makes contests easy to run and builds our online community.',
        'chro', 'I think about employee participation. Staff could feature their pets too, making them part of the campaign. This could be fun for employees and shows we practice what we preach about loving pets.',
        'coo', 'I ensure operational follow-through. Winners need their gift cards, featured photos need printing for stores. As COO, I make sure marketing campaigns connect smoothly to operations.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['social_media_marketing', 'user_generated_content', 'contests', 'community_engagement']
);

-- PRICE: Loyalty Rewards Program
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Pet Rewards Club',
    'Should we create a rewards program where customers earn points on every purchase that can be redeemed for free products? This encourages repeat visits but reduces our profit on redeemed items.',
    'Price challenges are about what to charge and how to give customers good value. Smart pricing keeps customers happy while making enough money to stay in business.',
    'price', 'price', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'PAWPARADISE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, loyalty programs turn occasional shoppers into regulars. Pet supplies are repeat purchases—food every month, treats regularly. Loyalty programs make us their default choice.',
        'cfo', 'I calculate program economics. If customers earn $1 in rewards per $20 spent, that''s 5% of revenue. As CFO, if loyalty increases visit frequency by 15%, we still come out ahead.',
        'cmo', 'I love loyalty programs! As CMO, they create belonging. Pet owners who are "members" of our club feel connected to Paw Paradise. This emotional bond is powerful marketing.',
        'cto', 'I would build the rewards tracking system. As CTO, technology makes this easy—automatic point tracking, app notifications, redemption at checkout. Good systems make loyalty feel rewarding.',
        'chro', 'I think about employee training. Staff need to explain the program and enroll customers. As CHRO, this requires sales skills and enthusiasm. Employee buy-in makes programs successful.',
        'coo', 'I manage operations. As COO, rewards programs need smooth redemption processes that don''t slow checkout. Operational simplicity makes customers love using their rewards.'
    ),
    get_lens_multipliers('price'),
    ARRAY['loyalty_program', 'rewards', 'customer_retention', 'repeat_business']
);

-- ========================================
-- QUESTGAMES HOBBIES (Middle School) - 6 Challenges
-- Game and hobby stores, 240 employees, 16 locations
-- ========================================

-- PEOPLE: Hiring Gamers vs. Retail Workers
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Gamers as Employees',
    'Should we hire people who love board games and know all the rules, or experienced retail workers? Gaming enthusiasts create excitement and teach customers games, but might lack professional retail skills.',
    'People challenges are about hiring good workers, training them well, and keeping them happy so they stay. Great businesses create workplaces where employees enjoy their jobs and want to do their best.',
    'people', 'people', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUESTGAMES' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of Quest Games, passion for gaming is part of our culture. Enthusiastic staff who play games create the experience customers love. This makes us different from big box stores.',
        'cfo', 'I track sales performance. Knowledgeable staff might recommend perfect games, building customer loyalty. But retail professionals drive more sales per hour. As CFO, which creates better long-term revenue?',
        'cmo', 'I love hiring gamers! As CMO, their authentic enthusiasm is contagious. They''re not just selling—they''re sharing their hobby. That authenticity makes Quest Games special.',
        'cto', 'I manage our inventory and point-of-sale systems. Technical retail skills are learnable. Gaming knowledge takes years. I can train gamers on registers faster than teaching non-gamers about games.',
        'chro', 'I''m the HR leader. As CHRO, I can look for people with both qualities, or develop training that gives gamers professional retail skills. Hiring for passion, training for skills might work.',
        'coo', 'I run operations. As COO, I need stores to run smoothly—opening on time, organized inventory, proper checkout procedures. Passion is great, but basic operational competence is necessary.'
    ),
    get_lens_multipliers('people'),
    ARRAY['hiring_strategy', 'passion_vs_experience', 'gaming_knowledge', 'retail_skills']
);

-- PRODUCT: Popular vs. Niche Games
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Mainstream or Specialty Games?',
    'Should we stock mostly popular games everyone knows (Monopoly, Uno, Settlers of Catan) or carry unique games serious gamers want? Mainstream games sell steadily but have small margins. Specialty games excite hobbyists but don''t sell as quickly.',
    'Product challenges are about what you sell and how it helps customers. Great products balance what customers want, what''s easy to make, and what makes money.',
    'product', 'product', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUESTGAMES' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, this defines our identity. Are we a mainstream toy store or a specialty hobby shop? Both can work, but they attract different customers and create different reputations.',
        'cfo', 'I analyze turnover rates. Popular games sell quickly with lower margins. Specialty games have higher margins but sit longer. As CFO, I need to balance inventory investment with profitability.',
        'cmo', 'I think about positioning. As CMO, specialty games make us destination for serious gamers. But mainstream games reach families and casual players. Who is our target customer?',
        'cto', 'I manage inventory systems. Niche games require detailed tracking—gaming enthusiasts ask about specific expansions and editions. Technology needs to handle complexity of specialty retail.',
        'chro', 'I consider employee expertise. Specialty games require staff knowledge to explain rules and recommend games. This means hiring and training gaming enthusiasts, not just retail workers.',
        'coo', 'I run stores. As COO, specialty games need demo copies, knowledgeable staff, and organized storage. Mainstream games are simpler operationally. Each strategy creates different operational needs.'
    ),
    get_lens_multipliers('product'),
    ARRAY['product_mix', 'niche_market', 'mainstream_products', 'inventory_strategy']
);

-- PROCESS: Game Night Events
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Weekly Game Nights',
    'Should we host free game nights where customers play games in our store? This builds community and lets people try before buying, but requires space, staff supervision, and happens during evening shopping hours.',
    'Process challenges are about how work gets done. Great processes make things faster, easier, and better for both employees and customers.',
    'process', 'process', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUESTGAMES' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, game nights transform us from store to community gathering place. This creates emotional connections beyond transactions. People become part of Quest Games community.',
        'cfo', 'I evaluate costs. Game nights use space and staff time without direct sales. As CFO, if participants become regular customers, it pays off. I need to track conversion from players to buyers.',
        'cmo', 'This is perfect! As CMO, game nights are experiential marketing. People try games, make friends, and associate fun memories with Quest Games. Word-of-mouth from participants is powerful.',
        'cto', 'I can support with technology. Online registration, event calendars, game library tracking, and community forums. Tech enhances in-person community building.',
        'chro', 'I think about staffing. Running game nights requires enthusiastic employees who teach games and manage groups. As CHRO, this needs scheduling and perhaps hiring dedicated community coordinators.',
        'coo', 'I manage store operations. As COO, game nights need space, tables, chairs, and organization. I need to set up after-hours or designate gaming areas that don''t disrupt shopping. Planning is key.'
    ),
    get_lens_multipliers('process'),
    ARRAY['community_events', 'experiential_retail', 'game_nights', 'customer_engagement']
);

-- PLACE: Online Sales Strategy
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Competing Online',
    'Should we invest in serious online sales? We can''t match Amazon''s prices or selection, but we could offer local pickup, expert recommendations, and support local business. Is online worth the investment for a small chain?',
    'Place challenges are about where and how customers can buy your products. Great location decisions consider who your customers are and when they need you.',
    'place', 'place', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUESTGAMES' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, online presence is probably necessary for survival. But we compete on expertise and community, not price. Online needs to reflect our strengths—recommendations, local connection.',
        'cfo', 'I analyze investment and returns. Building proper e-commerce costs $40,000. As CFO, I need to estimate online sales potential and whether it''s profitable or just prevents losing customers to online competitors.',
        'cmo', 'I see online as complementary. As CMO, customers research online, buy in-store. Or buy online, pick up in store. Multi-channel presence is modern marketing—we need to be where customers are.',
        'cto', 'I would build the online store. As CTO, I can create features big retailers don''t have—video game explanations, curated lists, local pickup benefits. Technology differentiates us.',
        'chro', 'I think about staffing. Online sales need fulfillment and customer service. As CHRO, these are new roles requiring different skills—online communication, packing, shipping coordination.',
        'coo', 'I run operations. As COO, online adds complexity—inventory coordination between stores and online, fulfillment space, shipping logistics. Operations must be ready for omnichannel retail.'
    ),
    get_lens_multipliers('place'),
    ARRAY['ecommerce', 'online_retail', 'omnichannel', 'local_business']
);

-- PROMOTION: Tournament Organization
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Monthly Game Tournaments',
    'We could organize monthly tournaments for popular games—entry fees cover prizes, and participants buy snacks and drinks. Tournaments create excitement and community but require significant staff time to organize.',
    'Promotion challenges are about letting customers know you exist and why they should choose you. Great marketing reaches the right people with the right message.',
    'promotion', 'promotion', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUESTGAMES' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, tournaments position Quest Games as the gaming hub. Competitive players are passionate advocates who influence their gaming groups. This builds leadership in our gaming community.',
        'cfo', 'I look at the economics. Entry fees might cover prizes, but not staff time. As CFO, if tournaments build customer loyalty that drives ongoing purchases, indirect value justifies direct costs.',
        'cmo', 'I love tournaments! As CMO, competitive events generate excitement and social media content. Winners share victories, participants tag us in posts. Tournament drama creates engaging marketing content.',
        'cto', 'I can build tournament management tools. As CTO, online registration, bracket systems, results tracking, and leaderboards make tournaments professional. Technology elevates the experience.',
        'chro', 'I think about staffing needs. As CHRO, tournaments need referees, organizers, and coordinators. These might be volunteer enthusiasts or paid positions. I''d develop tournament staff programs.',
        'coo', 'I manage tournament logistics. As COO, I need space, timing, supplies, and coordination. Tournaments are operationally complex but manageable with good processes and planning.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['tournaments', 'competitive_gaming', 'community_building', 'events']
);

-- PRICE: Discount vs. Full Price
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Pricing Strategy Decision',
    'Should we offer regular discounts and sales, or maintain consistent prices? Sales bring in bargain hunters and move inventory, but might train customers to wait for discounts. Consistent pricing maintains margins but might seem expensive.',
    'Price challenges are about what to charge and how to give customers good value. Smart pricing keeps customers happy while making enough money to stay in business.',
    'price', 'price', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'QUESTGAMES' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I think about brand positioning. Consistent pricing suggests quality and fairness. Discount pricing suggests value-seeking. Both strategies work, but they create different customer expectations.',
        'cfo', 'I analyze pricing psychology. Frequent sales might increase volume but reduce overall revenue if customers wait for discounts. As CFO, I''d model different scenarios to find optimal approach.',
        'cmo', 'I think strategically. As CMO, sales create excitement and urgency. But constant discounting devalues products. Maybe selective sales—new releases at full price, clearance sales for old inventory?',
        'cto', 'I manage pricing systems. Technology can enable dynamic pricing, targeted offers, or loyalty member discounts. Smart systems let us do both—full prices for some, targeted discounts for others.',
        'chro', 'I consider employee experience. Staff might get tired of customers always asking about discounts. As CHRO, consistent pricing could reduce negotiation stress and make jobs simpler.',
        'coo', 'I run operations. As COO, frequent sales complicate inventory management and require constant price changes. Consistent pricing is operationally simpler and reduces confusion.'
    ),
    get_lens_multipliers('price'),
    ARRAY['pricing_strategy', 'discounting', 'sales_promotions', 'everyday_pricing']
);

-- ========================================
-- ACTIVELIFE RECREATION (Middle School) - 6 Challenges
-- Community recreation centers, 520 employees, 35 locations
-- ========================================

-- PEOPLE: Youth Program Staff
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Hiring Youth Coaches',
    'Our youth sports and activity programs need more coaches. Should we hire young college students who relate well to kids, or experienced coaches who know sports better? College students are enthusiastic and affordable. Experienced coaches cost more but have better skills.',
    'People challenges are about hiring good workers, training them well, and keeping them happy so they stay. Great businesses create workplaces where employees enjoy their jobs and want to do their best.',
    'people', 'people', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'ACTIVELIFE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of ActiveLife, I care about kids having positive experiences. Young coaches might be more fun and relatable. Experienced coaches bring expertise. Both matter for different reasons.',
        'cfo', 'I look at costs. College students earn less, reducing program costs. Experienced coaches cost more but might attract more families willing to pay premium prices. As CFO, which drives better economics?',
        'cmo', 'I think about parent expectations. As CMO, parents want qualified coaches for their kids. But kids connect better with young, energetic coaches. Marketing needs to set the right expectations for our programs.',
        'cto', 'I manage scheduling and registration systems. Technology can help both types of coaches—training videos, drill libraries, communication tools. Tech can give young coaches resources to succeed.',
        'chro', 'I''m the HR leader. As CHRO, I can look for a mix—experienced head coaches with young assistant coaches. Or create training that gives enthusiastic young people coaching skills. Hybrid approaches often work best.',
        'coo', 'I run programs across 35 locations. As COO, I need reliable coaches who show up and run safe, fun programs. Experience matters for safety and program quality, but energy matters for kid engagement.'
    ),
    get_lens_multipliers('people'),
    ARRAY['coaching', 'youth_programs', 'hiring_strategy', 'program_quality']
);

-- PRODUCT: Fitness Classes vs. Sports Leagues
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Programs to Offer',
    'Should we focus more on fitness classes (yoga, Zumba, boot camps) or sports leagues (basketball, soccer, volleyball)? Fitness classes need instructors and equipment. Sports leagues need referees and field space. We can''t do everything equally well.',
    'Product challenges are about what you sell and how it helps customers. Great products balance what customers want, what''s easy to make, and what makes money.',
    'product', 'product', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'ACTIVELIFE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, this defines our identity. Are we a fitness center or a sports facility? Both serve wellness, but they attract different customers and require different resources. Strategic choice matters.',
        'cfo', 'I analyze revenue and costs. Fitness classes charge per person, sports leagues charge team registration. As CFO, I''ll compare profit per square foot—which use of space generates better returns?',
        'cmo', 'I study community needs. As CMO, maybe families want sports leagues while adults want fitness classes. Understanding our market helps us allocate resources to what our community actually wants.',
        'cto', 'I manage registration and scheduling systems. Sports leagues need team formation, schedule coordination, and field allocation. Fitness classes need enrollment caps and waitlists. Each requires different technology.',
        'chro', 'I think about staffing. Fitness instructors need certifications. Referees need training. As CHRO, different programs require different talent, affecting hiring and development strategies.',
        'coo', 'I manage facilities. As COO, gyms work for fitness classes. Fields work for sports. Our current facilities favor one over the other. Operational constraints affect what programs we can actually run well.'
    ),
    get_lens_multipliers('product'),
    ARRAY['program_mix', 'fitness_classes', 'sports_leagues', 'community_needs']
);

-- PROCESS: Online Registration System
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Modernizing Registration',
    'Currently, families register by visiting our centers and filling out paper forms. An online system would cost $35,000 but let families register anytime from home. This would be more convenient but requires teaching older members how to use technology.',
    'Process challenges are about how work gets done. Great processes make things faster, easier, and better for both employees and customers.',
    'process', 'process', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'ACTIVELIFE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, convenience matters in today''s world. Families are busy—online registration removes barriers. But I worry about members who aren''t comfortable with technology. We need to serve everyone.',
        'cfo', 'I evaluate the investment. $35,000 is significant. As CFO, will online registration increase enrollments enough to justify the cost? I also need to factor in reduced staff time processing paper forms.',
        'cmo', 'I think about customer experience. As CMO, online registration is modern and expected. Younger families might choose facilities with convenient registration. This could be competitive advantage.',
        'cto', 'I would implement the system. As CTO, online registration also enables better data—tracking which programs fill quickly, understanding member preferences, sending reminders. Technology creates insights beyond just convenience.',
        'chro', 'I consider staff implications. As CHRO, online registration might reduce front desk work but requires staff to help members navigate the system. Training and support structures need development.',
        'coo', 'I run operations. As COO, online systems could reduce registration lines during busy periods. But I''d need to maintain alternative options for those uncomfortable with technology. Hybrid approach might work best.'
    ),
    get_lens_multipliers('process'),
    ARRAY['online_registration', 'digital_transformation', 'customer_convenience', 'technology_adoption']
);

-- PLACE: New Location Selection
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Expanding to New Neighborhood',
    'We want to open our 36th location. Two neighborhoods need recreational facilities. One is wealthy with families able to pay premium prices but already has some options. The other is lower-income with fewer recreation options but families have tight budgets.',
    'Place challenges are about where and how customers can buy your products. Great location decisions consider who your customers are and when they need you.',
    'place', 'place', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'ACTIVELIFE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, this is a values question. ActiveLife''s mission is community wellness for everyone. The lower-income area has greater need. But we also need revenue to sustain operations. Balancing mission and money is challenging.',
        'cfo', 'I analyze financial viability. Wealthy area generates higher revenue per member. Lower-income area serves more people at lower prices. As CFO, I need to determine which location supports our overall financial health.',
        'cmo', 'I think about community impact and reputation. As CMO, serving underserved communities builds powerful goodwill and aligns with our mission. Marketing story is stronger. But wealthy families also need healthy activities.',
        'cto', 'I consider practical factors. Technology needs are similar, but lower-income areas might need more support resources—scholarship management, payment plans. Systems should enable both models.',
        'chro', 'I think about staffing. Both locations need qualified staff. Lower-income areas might offer fewer job applicants. As CHRO, I''d assess local talent pools and recruitment challenges.',
        'coo', 'I evaluate operational feasibility. As COO, lower-income areas might have higher no-show rates and payment challenges requiring different processes. Both locations are operationally viable but require different management approaches.'
    ),
    get_lens_multipliers('place'),
    ARRAY['location_strategy', 'community_impact', 'social_mission', 'accessibility']
);

-- PROMOTION: Community Health Fair
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Free Health and Wellness Fair',
    'We could host a free community health fair with fitness demos, health screenings, and nutrition information. This would cost $5,000 but bring in hundreds of community members who might try our programs.',
    'Promotion challenges are about letting customers know you exist and why they should choose you. Great marketing reaches the right people with the right message.',
    'promotion', 'promotion', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'ACTIVELIFE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, health fairs align perfectly with our mission. Even if people don''t join immediately, we''re improving community wellness. This builds the kind of reputation that creates long-term success.',
        'cfo', 'I evaluate ROI. $5,000 cost for an event that might convert 20-30 members. As CFO, if those members stay a year, that''s $15,000 in revenue. The math works if we get good conversion.',
        'cmo', 'I love this idea! As CMO, health fairs are perfect marketing—people experience what we offer, meet our staff, and see our facilities. Experiential marketing creates stronger connections than any ad.',
        'cto', 'I would build registration and follow-up systems. Technology helps capture attendee information, send follow-up offers, and track which fair attendees become members. Data shows true ROI.',
        'chro', 'I think about staff involvement. Health fairs let employees showcase their expertise and passion. As CHRO, this could be fulfilling for staff and demonstrates our commitment to community wellness.',
        'coo', 'I manage event logistics. As COO, health fairs require coordination—booth setup, demo scheduling, vendor management, parking, and safety. With good planning, we can host great events that run smoothly.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['health_fair', 'community_events', 'experiential_marketing', 'wellness']
);

-- PRICE: Membership Pricing Structure
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Family Membership Discount',
    'Should we offer family memberships at $150/month (covering unlimited family members) versus individual memberships at $60/person/month? Family rates encourage whole-family wellness but mean less revenue per household.',
    'Price challenges are about what to charge and how to give customers good value. Smart pricing keeps customers happy while making enough money to stay in business.',
    'price', 'price', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'ACTIVELIFE' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, family memberships support our mission of community wellness. Kids whose families are active together develop healthy habits. But we need sustainable pricing to keep operating.',
        'cfo', 'I do the math. If average family has 3 people, individual pricing is $180/month versus $150 family rate. We lose $30 per family. As CFO, if family memberships increase enrollment by 25%, we come out ahead.',
        'cmo', 'I love family memberships! As CMO, they make ActiveLife the family wellness destination. Kids bring parents, parents bring kids. This creates multi-generational connections to our centers.',
        'cto', 'I manage membership systems. Technology can handle family accounts, tracking which family members attend what programs. Good systems make family memberships easy to manage.',
        'chro', 'I think about staff interactions. Family programs create different dynamics—parents and kids together, multi-age groups. As CHRO, staff training needs to address family program management.',
        'coo', 'I run facilities. As COO, family memberships might create crowding during family-friendly times. I need to manage capacity and ensure good experiences for all members, families and individuals.'
    ),
    get_lens_multipliers('price'),
    ARRAY['membership_pricing', 'family_discounts', 'pricing_structure', 'value_proposition']
);

-- ========================================
-- FITFUSION FITNESS (Middle School) - 6 Challenges
-- Boutique fitness studios, 380 employees, 26 locations
-- ========================================

-- PEOPLE: Instructor Personalities
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Motivating Instructors',
    'Our best instructors have vibrant personalities and pack classes. But some are almost too intense—pushing too hard and making beginners uncomfortable. Should we hire high-energy motivators or more encouraging, gentle instructors?',
    'People challenges are about hiring good workers, training them well, and keeping them happy so they stay. Great businesses create workplaces where employees enjoy their jobs and want to do their best.',
    'people', 'people', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'FITFUSION' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of FitFusion, instructor energy creates our brand experience. But intimidating beginners hurts retention. I need instructors who motivate without discouraging. Balance is key.',
        'cfo', 'I track retention rates. High-energy instructors fill classes but beginners might not return. Gentler instructors build loyal member bases. As CFO, long-term retention matters more than full first classes.',
        'cmo', 'I think about brand positioning. As CMO, are we intense boot camp or welcoming fitness community? Instructor personalities shape perception. We need consistency with our brand promise.',
        'cto', 'I manage class feedback systems. Technology can collect member ratings and comments. Data shows which instructor styles drive retention, referrals, and satisfaction. Metrics guide hiring.',
        'chro', 'I''m the HR leader who hires instructors. As CHRO, I can create instructor profiles for different class types—high-intensity for advanced, encouraging for beginners. Matching instructor to class level matters.',
        'coo', 'I run studios. As COO, different members want different experiences. Maybe offering variety—some intense classes, some beginner-friendly—lets members choose what works for them.'
    ),
    get_lens_multipliers('people'),
    ARRAY['instructor_hiring', 'teaching_style', 'customer_experience', 'fitness_culture']
);

-- PRODUCT: Class Variety vs. Signature Program
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Focus or Variety?',
    'Should we offer 15 different class types (yoga, cycling, boxing, HIIT, barre, etc.) or focus on perfecting 5 signature classes? Variety attracts different people. Focus builds reputation for excellence in specific areas.',
    'Product challenges are about what you sell and how it helps customers. Great products balance what customers want, what''s easy to make, and what makes money.',
    'product', 'product', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'FITFUSION' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, this is about competitive positioning. Do we compete on variety or excellence? Big gyms offer everything. Boutique studios typically specialize. Which strategy fits FitFusion?',
        'cfo', 'I analyze utilization. Some class types consistently fill; others run half-empty. As CFO, eliminating underperforming classes improves efficiency. But variety might be why people join—even if they mostly attend favorites.',
        'cmo', 'I think about marketing message. As CMO, specialization creates clear positioning—"best cycling studio" is stronger than "we offer cycling among other things." Focus makes marketing easier.',
        'cto', 'I manage scheduling systems. More class types mean complex scheduling and instructor allocation. Fewer types simplify operations. Technology handles either, but simplicity reduces confusion.',
        'chro', 'I hire and train instructors. As CHRO, signature focus means deep instructor expertise in fewer areas. Variety requires broader instructor capabilities or more specialized hiring. Training differs.',
        'coo', 'I run studios. As COO, more class types need more equipment types and more space configurations. Focused programs allow optimized studios. Operational efficiency favors focus.'
    ),
    get_lens_multipliers('product'),
    ARRAY['program_variety', 'specialization', 'class_offerings', 'product_strategy']
);

-- PROCESS: Class Reservation System
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'No-Show Problem',
    'Members reserve spots then don''t show up, leaving empty spots while others are wait-listed. Should we charge $10 no-show fees to reduce this, or keep reservations free to stay friendly? No-show fees work but might feel unwelcoming.',
    'Process challenges are about how work gets done. Great processes make things faster, easier, and better for both employees and customers.',
    'process', 'process', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'FITFUSION' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, empty spots waste instructor time and disappoint wait-listed members. But fees feel punitive. Maybe automated reminders or earlier cancel deadlines could reduce no-shows without fees.',
        'cfo', 'I calculate the cost. Empty spots in 30-person classes mean lost revenue. As CFO, if no-show fees reduce the problem by 50%, that improves studio utilization significantly. Economics favor fees.',
        'cmo', 'I worry about member experience. As CMO, fees might deter casual members or create negative feelings. Can we frame them as "commitment deposits" that encourage follow-through rather than punishments?',
        'cto', 'I build booking systems. As CTO, technology can send reminders, allow easy cancellations, manage waitlists automatically. Better systems might reduce no-shows without fees. Let data show what works.',
        'chro', 'I think about staff stress. Instructors prepare for full classes then find half-empty rooms. As CHRO, this is demoralizing. Whatever solution we choose should improve instructor experience.',
        'coo', 'I manage operations. As COO, no-shows complicate scheduling and capacity planning. Some studios use fees successfully while staying friendly. Clear policies and communication make fees work.'
    ),
    get_lens_multipliers('process'),
    ARRAY['reservation_system', 'no_show_policy', 'capacity_management', 'member_behavior']
);

-- PLACE: Studio Location Strategy
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Expensive Premium vs. Affordable Locations',
    'For our next studio, we found two options: a trendy downtown area with high rent ($15,000/month) and wealthy customers, or a suburban shopping center with lower rent ($6,000/month) and middle-class families. Both could work but serve different markets.',
    'Place challenges are about where and how customers can buy your products. Great location decisions consider who your customers are and when they need you.',
    'place', 'place', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'FITFUSION' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, location shapes our brand. Downtown positions us as premium lifestyle brand. Suburban reaches families focused on value and convenience. Both are valid—but we need to choose our positioning.',
        'cfo', 'I analyze economics. Downtown needs 150 members at $120/month to cover $15K rent. Suburban needs only 60 members at $100/month for $6K rent. As CFO, suburban is less risky but downtown has higher upside.',
        'cmo', 'I think about marketing and brand. As CMO, downtown offers walking traffic, influencer members, Instagram-worthy aesthetic. Suburban offers parking, families, community focus. Different marketing approaches.',
        'cto', 'I consider practical infrastructure. Downtown might have better internet and urban amenities. Suburban has easier parking and loading. Technology needs are similar, but location affects member experience.',
        'chro', 'I think about staffing. Downtown might require more polished, fashion-forward staff. Suburban might prioritize family-friendly, relatable instructors. As CHRO, location affects hiring profile.',
        'coo', 'I run studios. As COO, downtown brings parking challenges, noise restrictions, smaller spaces. Suburban offers easier build-out, loading, parking. Operational complexity differs significantly.'
    ),
    get_lens_multipliers('place'),
    ARRAY['location_strategy', 'site_selection', 'market_positioning', 'real_estate']
);

-- PROMOTION: Social Media Influencers
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Paying Influencers',
    'Local fitness influencers with 10,000-50,000 followers would promote us for free classes. This could bring in followers, but might attract people more interested in Instagram photos than actual workouts. Should we partner with influencers?',
    'Promotion challenges are about letting customers know you exist and why they should choose you. Great marketing reaches the right people with the right message.',
    'promotion', 'promotion', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'FITFUSION' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I want members committed to fitness, not just selfies. But influencers reach thousands of potential members. Maybe their followers ARE serious about fitness—I shouldn''t assume otherwise.',
        'cfo', 'I calculate cost. Free classes for influencers costs us spots that could be sold. As CFO, if even 5% of their followers convert to paying members, the math works. Social media marketing is cost-effective.',
        'cmo', 'I love this! As CMO, influencer partnerships create authentic word-of-mouth at scale. Their followers trust their recommendations. Plus, they create content we can reshare. This is modern marketing.',
        'cto', 'I would track results. As CTO, unique booking codes show which influencers drive conversions. Data tells us which partnerships work. Technology makes influencer marketing measurable.',
        'chro', 'I think about instructor reactions. Staff might resent influencers getting free classes and attention. As CHRO, I''d ensure our community understands this is marketing, and instructor contributions are valued too.',
        'coo', 'I manage studios. As COO, influencers bringing followers could mean fuller classes and good energy. Or could mean crowding and selfie-taking disruptions. Clear guidelines help both scenarios work.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['influencer_marketing', 'social_media', 'partnerships', 'digital_marketing']
);

-- PRICE: Premium vs. Value Pricing
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Pricing Our Classes',
    'Our classes cost $30 each, more than big gyms ($10 group classes) but less than luxury studios ($40+). Should we raise prices to position as premium, or lower prices to attract more people? Pricing signals quality.',
    'Price challenges are about what to charge and how to give customers good value. Smart pricing keeps customers happy while making enough money to stay in business.',
    'price', 'price', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'FITFUSION' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, pricing is positioning. Higher prices signal premium quality and small class sizes. Lower prices signal accessibility and value. Once we choose, changing is hard. This defines our brand.',
        'cfo', 'I model scenarios. At $40/class, we need fewer members but might reduce volume. At $25/class, we need more members but increase accessibility. As CFO, I''d calculate revenue impact at different price and volume combinations.',
        'cmo', 'I think about customer psychology. As CMO, price affects perception. $40 suggests luxury experience. $25 suggests good value. Both can work—depends who we want to attract and how we want to be seen.',
        'cto', 'I manage systems. Technology enables tiered pricing—premium times at higher prices, off-peak at lower prices. Dynamic pricing could let us have both positioning strategies simultaneously.',
        'chro', 'I consider instructor compensation. As CHRO, premium pricing allows better instructor pay, attracting top talent. Value pricing might require volume to maintain instructor wages. Pay affects talent quality.',
        'coo', 'I think about operations. As COO, higher prices with smaller classes mean less wear on equipment and facilities. Lower prices with more volume strain capacity. Operational costs differ by pricing strategy.'
    ),
    get_lens_multipliers('price'),
    ARRAY['pricing_strategy', 'value_positioning', 'premium_pricing', 'market_segmentation']
);

-- ========================================
-- ARTBOX CREATIVE (Middle School) - 6 Challenges
-- Art supply store chain, 290 employees, 19 locations
-- ========================================

-- PEOPLE: Artists as Employees
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Hiring Working Artists',
    'Should we hire practicing artists who know materials deeply, or retail workers who know customer service? Artists give authentic advice but might prefer creating art to working retail. Retail workers are reliable but might not understand art supplies.',
    'People challenges are about hiring good workers, training them well, and keeping them happy so they stay. Great businesses create workplaces where employees enjoy their jobs and want to do their best.',
    'people', 'people', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'ARTBOX' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of ArtBox, having artists on staff makes us authentic. Artists understand customer needs because they ARE customers. This builds trust and community in ways regular retail can''t.',
        'cfo', 'I track sales and staffing costs. Artist knowledge might help customers buy right products, reducing returns. As CFO, if artist expertise increases sales by 10%, the investment in knowledgeable staff pays off.',
        'cmo', 'I love hiring artists! As CMO, staff who actually use our products create authentic marketing. They can demonstrate techniques, share tips, and build genuine relationships with artist customers.',
        'cto', 'I think about training systems. Technology can teach retail workers about art supplies through videos and guides. But there''s no substitute for experience. Artists bring knowledge technology can''t fully replace.',
        'chro', 'I''m the HR leader. As CHRO, artists might need flexible schedules for their art practice. I can create part-time roles or gallery shows featuring staff work. Supporting their art makes them better employees.',
        'coo', 'I run stores. As COO, I need reliable staff who handle opening, closing, and inventory. Artists bring passion; retail workers bring consistency. Maybe mixing both types creates the best teams.'
    ),
    get_lens_multipliers('people'),
    ARRAY['hiring_strategy', 'expertise', 'artist_employees', 'authenticity']
);

-- PRODUCT: Pro vs. Student Supplies
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Quality vs. Affordability',
    'Should we carry more professional-grade art supplies or student/beginner supplies? Pro materials give better results but cost 3x more. Student supplies help beginners afford art but might frustrate them with lower quality.',
    'Product challenges are about what you sell and how it helps customers. Great products balance what customers want, what''s easy to make, and what makes money.',
    'product', 'product', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'ARTBOX' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I want art to be accessible to everyone. But I also want artists to have great materials to create their best work. This is about serving different customer needs with different products.',
        'cfo', 'I analyze margins. Professional supplies have 40% margins; student supplies have 25% margins. But student supplies sell 5x more volume. As CFO, I need both—volume from beginners, margins from pros.',
        'cmo', 'I think about positioning. As CMO, carrying professional supplies positions us as serious art store. But focusing only on pros excludes kids and beginners. Maybe clearly separate sections serve both markets?',
        'cto', 'I manage inventory. Technology can track which quality levels sell to which customers. Data shows if we should expand pro lines or student lines. Systems enable smart product mix decisions.',
        'chro', 'I think about employee knowledge. As CHRO, staff need to know differences between quality levels and recommend appropriately. Training helps employees guide customers to products matching their skill and budget.',
        'coo', 'I run stores. As COO, professional supplies often need secure storage and careful handling. Student supplies are simpler. Different product mixes create different operational requirements.'
    ),
    get_lens_multipliers('product'),
    ARRAY['product_quality', 'market_segmentation', 'product_mix', 'accessibility']
);

-- PROCESS: Weekend Workshops
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Free Art Classes',
    'Should we offer free weekend art workshops where customers learn techniques using our products? This brings people into stores and lets them try supplies, but requires instructor time and materials. Do workshops sell enough products to justify the cost?',
    'Process challenges are about how work gets done. Great processes make things faster, easier, and better for both employees and customers.',
    'process', 'process', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'ARTBOX' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, workshops build community and make ArtBox a creative destination, not just a store. Even if direct sales don''t cover costs, the community connection creates long-term value.',
        'cfo', 'I evaluate costs. Workshops might cost $200 in materials and instructor time. As CFO, if participants spend $30 on supplies and 20% become regular customers, the math works out over time.',
        'cmo', 'I love workshops! As CMO, they''re experiential marketing that creates memories and skills. People remember learning to paint at ArtBox. This emotional connection beats any advertisement.',
        'cto', 'I would build registration systems. Technology handles sign-ups, sends reminders, tracks which workshops are popular, and measures if participants become customers. Data shows program ROI.',
        'chro', 'I think about instructors. As CHRO, teaching workshops could be fulfilling for artistic staff. This gives them creative outlets while working retail, potentially improving job satisfaction and retention.',
        'coo', 'I manage workshop logistics. As COO, I need space, supplies, cleanup, and scheduling that doesn''t disrupt shopping. With good planning, workshops enhance rather than complicate operations.'
    ),
    get_lens_multipliers('process'),
    ARRAY['workshops', 'community_education', 'experiential_marketing', 'art_classes']
);

-- PLACE: Online vs. In-Store
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Competing with Online',
    'Online art supply stores offer huge selection and low prices. Should we invest in better e-commerce, or focus on in-store experience with expert advice and workshops that online can''t match? We can''t beat online on price or selection.',
    'Place challenges are about where and how customers can buy your products. Great location decisions consider who your customers are and when they need you.',
    'place', 'place', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'ARTBOX' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, physical stores offer touch, feel, expert advice, and community that online can''t replicate. Our advantage is experience, not price. Should double down on what makes us special.',
        'cfo', 'I analyze channel economics. As CFO, e-commerce requires significant investment with thin margins. Enhanced in-store experience might drive loyalty and higher-margin sales better than fighting online price wars.',
        'cmo', 'I think about customer journey. As CMO, people research online but buy in-store to see colors and try materials. Or they buy basics online and visit stores for specialty items and advice. Omnichannel serves different needs.',
        'cto', 'I would enhance digital. As CTO, even if we focus on stores, customers expect online inventory checking, in-store pickup, and digital inspiration. Technology should enhance physical experience, not replace it.',
        'chro', 'I think about employee roles. As CHRO, focusing on experience means staff become consultants and educators, not just cashiers. This requires different skills and might be more fulfilling.',
        'coo', 'I run stores. As COO, experiential focus means different store design—demo areas, workshop space, consultation zones. Operations shift from pure retail to hybrid retail-education model.'
    ),
    get_lens_multipliers('place'),
    ARRAY['ecommerce', 'in_store_experience', 'omnichannel', 'competitive_strategy']
);

-- PROMOTION: Student Discount Program
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Student Discounts',
    'Should we offer 15% discounts to students with ID? This helps students afford art supplies and builds loyalty, but reduces profit margins. Students might become lifelong customers, but discounts cost money now.',
    'Promotion challenges are about letting customers know you exist and why they should choose you. Great marketing reaches the right people with the right message.',
    'promotion', 'promotion', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'ARTBOX' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, supporting student artists aligns with ArtBox''s mission of making art accessible. Students struggling with supply costs might give up art. We can help them continue creating.',
        'cfo', 'I calculate impact. If 20% of customers are students getting 15% off, that''s 3% total revenue reduction. As CFO, if student program increases student traffic by 30%, we actually gain revenue.',
        'cmo', 'I love student programs! As CMO, students share with classmates and professors, creating word-of-mouth in art schools. Plus, helping students builds brand loyalty for decades as they become professional artists.',
        'cto', 'I would build verification systems. Technology makes student ID checking and discount application automatic. Digital student cards and enrollment verification can streamline the process.',
        'chro', 'I think about staff interactions. As CHRO, student programs require clear policies about who qualifies and verification procedures. Training ensures consistent, fair application.',
        'coo', 'I manage operations. As COO, student discounts need clear signage and simple checkout processes. Operational simplicity prevents confusion and makes students feel welcomed, not questioned.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['student_discounts', 'discount_programs', 'community_support', 'youth_market']
);

-- PRICE: Membership vs. Per-Purchase
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Creative Club Membership',
    'Should we offer a $30 annual "Creative Club" membership with 10% off all purchases, exclusive workshops, and first access to new products? This builds commitment but means lower margins on member purchases.',
    'Price challenges are about what to charge and how to give customers good value. Smart pricing keeps customers happy while making enough money to stay in business.',
    'price', 'price', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'ARTBOX' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, membership programs turn customers into community members. Artists who feel they belong to Creative Club become advocates who refer friends. Emotional connection drives loyalty.',
        'cfo', 'I calculate economics. Members paying $30 upfront need to spend $300 yearly for us to break even on 10% discount. As CFO, if membership increases purchase frequency by 20%, we gain revenue despite discounts.',
        'cmo', 'I love membership ideas! As CMO, membership creates belonging and status. "Creative Club members" feel special and part of something. This emotional branding is powerful marketing.',
        'cto', 'I would build membership systems. As CTO, automatic discount application, member-only online content, and exclusive workshop registration make membership feel valuable. Technology enhances membership benefits.',
        'chro', 'I think about staff roles. As CHRO, staff become community managers who engage members, not just cashiers. This could make jobs more meaningful and interesting, improving employee satisfaction.',
        'coo', 'I manage operations. As COO, membership programs require tracking systems, exclusive workshop coordination, and member recognition. With good processes, membership enhances rather than complicates operations.'
    ),
    get_lens_multipliers('price'),
    ARRAY['membership_program', 'loyalty', 'pricing_strategy', 'community_building']
);

-- ========================================
-- TRAILBOUND OUTDOOR (Middle School) - 6 Challenges
-- Outdoor gear store chain, 470 employees, 31 locations
-- ========================================

-- PEOPLE: Outdoor Enthusiasts
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Hiring Adventurers',
    'Should we hire people who actively hike, camp, and explore outdoors, or experienced retail workers? Outdoor enthusiasts give authentic advice but might want to be outside, not inside working. Retail pros are reliable but might not truly understand gear.',
    'People challenges are about hiring good workers, training them well, and keeping them happy so they stay. Great businesses create workplaces where employees enjoy their jobs and want to do their best.',
    'people', 'people', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRAILBOUND' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO of TrailBound, authentic outdoor passion defines our brand. Customers trust advice from people who actually use the gear. Hiring enthusiasts, even with challenges, aligns with who we are.',
        'cfo', 'I track sales data. Knowledgeable staff might sell premium gear better, increasing average sale value. As CFO, if outdoor enthusiasts drive 15% higher sales, the extra training costs are worthwhile.',
        'cmo', 'I love hiring outdoor enthusiasts! As CMO, their authentic stories and experiences create powerful marketing. Customers connect with staff who share trip photos and trail recommendations.',
        'cto', 'I think about work-life balance. Technology enables flexible scheduling so outdoor enthusiasts can adventure and work. Mobile systems let staff check schedules and trade shifts easily.',
        'chro', 'I''m the HR leader. As CHRO, I can create policies supporting outdoor lifestyles—adventure days off, gear testing programs, flexible schedules. Supporting their passion makes them better employees.',
        'coo', 'I run stores. As COO, hiring outdoor enthusiasts means understanding seasonal availability—they might want summers for long trips. With good scheduling and coverage systems, we can make this work.'
    ),
    get_lens_multipliers('people'),
    ARRAY['hiring_strategy', 'outdoor_enthusiasts', 'authenticity', 'passion']
);

-- PRODUCT: Budget vs. Premium Gear
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Gear Quality Strategy',
    'Should we focus on premium, technical outdoor gear for serious adventurers, or carry more budget-friendly options for beginners and families? Premium gear has better margins but smaller market. Budget gear helps more people get outdoors.',
    'Product challenges are about what you sell and how it helps customers. Great products balance what customers want, what''s easy to make, and what makes money.',
    'product', 'product', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRAILBOUND' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, I want to get more people outdoors, which suggests affordability. But serious adventurers need reliable gear. Maybe serving both markets with clearly differentiated products works.',
        'cfo', 'I analyze profitability. Premium gear gives 45% margins; budget gear gives 25% margins. As CFO, mix matters—we need some premium profits to support overall business while making outdoor access affordable.',
        'cmo', 'I think about brand positioning. As CMO, are we the expert outfitter for serious adventures or the friendly store helping families start camping? Both are valid but create different marketing messages.',
        'cto', 'I manage product information systems. Technology can guide customers to appropriate gear for their experience level and budget. Smart recommendation systems help both beginners and experts find what they need.',
        'chro', 'I consider employee expertise. As CHRO, staff need knowledge to recommend budget options that work well and premium options worth the investment. Training helps employees guide customers at all levels.',
        'coo', 'I run stores. As COO, different product focuses need different inventory depth, staff expertise, and space allocation. Operations must support whatever product strategy we choose.'
    ),
    get_lens_multipliers('product'),
    ARRAY['product_quality', 'market_segmentation', 'outdoor_gear', 'accessibility']
);

-- PROCESS: Gear Rental Program
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Renting vs. Selling Only',
    'Should we rent camping and hiking gear (tents, backpacks, sleeping bags) in addition to selling? Rentals help beginners try gear before buying, but require cleaning, maintenance, and tracking systems.',
    'Process challenges are about how work gets done. Great processes make things faster, easier, and better for both employees and customers.',
    'process', 'process', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRAILBOUND' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, rental programs lower barriers to outdoor access. People hesitant to buy expensive gear can rent first. This aligns with our mission of getting more people outside.',
        'cfo', 'I analyze rental economics. Tent costing $200 could rent for $30/weekend. After 7 rentals, it''s paid off. As CFO, if rentals convert 30% to buyers, the program drives both rental revenue and future sales.',
        'cmo', 'I see rentals as marketing! As CMO, people renting gear are trying outdoor activities, often becoming enthusiasts who buy later. Rentals create trial experiences that build our customer base.',
        'cto', 'I would build rental management systems. As CTO, technology tracks inventory, availability, condition, and customer history. Good systems make rental operations manageable and prevent problems.',
        'chro', 'I think about staffing. As CHRO, rentals need staff to explain equipment, check condition, and process returns. This requires training and potentially dedicated rental coordinators.',
        'coo', 'I manage rental operations. As COO, rentals require cleaning facilities, repair processes, storage space, and damage policies. Operations become more complex but could enhance our business model.'
    ),
    get_lens_multipliers('process'),
    ARRAY['gear_rental', 'rental_program', 'try_before_buy', 'access']
);

-- PLACE: Destination Store Concept
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Store with Climbing Wall',
    'Should our next store include an indoor climbing wall and outdoor skills area where customers try gear? This creates unique experience but costs $200,000 extra to build and requires more space and staff.',
    'Place challenges are about where and how customers can buy your products. Great location decisions consider who your customers are and when they need you.',
    'place', 'place', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRAILBOUND' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, experiential retail creates destinations that online can''t match. Climbing walls make TrailBound a community hub, not just a store. This builds emotional connections justifying premium prices.',
        'cfo', 'I evaluate the investment. $200,000 is significant. As CFO, will experiential store generate enough additional traffic and sales to justify the cost? I''d need projected revenue increase to approve.',
        'cmo', 'I love this concept! As CMO, a climbing wall creates social media content, community events, and word-of-mouth marketing. It positions TrailBound as adventure destination, not just gear retailer.',
        'cto', 'I think about integrated technology. Digital climbing wall tracking, gear testing capture, and social sharing features. Technology can enhance the physical experience and capture valuable customer data.',
        'chro', 'I consider staffing. As CHRO, climbing walls need certified staff, safety training, and liability management. This requires specialized hiring and ongoing training beyond traditional retail.',
        'coo', 'I run operations. As COO, climbing walls add significant operational complexity—maintenance, safety inspections, scheduling, waivers. But done well, experiential retail creates competitive moats.'
    ),
    get_lens_multipliers('place'),
    ARRAY['experiential_retail', 'destination_store', 'climbing_wall', 'unique_experience']
);

-- PROMOTION: Guided Adventure Programs
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Leading Group Hikes',
    'Should we organize monthly guided hikes and camping trips led by our staff? Participants get expert guidance and try gear, but organizing trips takes staff time and adds liability concerns.',
    'Promotion challenges are about letting customers know you exist and why they should choose you. Great marketing reaches the right people with the right message.',
    'promotion', 'promotion', 'easy', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRAILBOUND' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, guided trips build community and confidence. Customers who adventure with us become loyal advocates. Even with liability concerns, community-building value might justify risks.',
        'cfo', 'I evaluate costs and benefits. Trips cost staff time but might charge participation fees covering costs. As CFO, if trip participants buy more gear after experiences, indirect benefits justify direct costs.',
        'cmo', 'I love guided adventures! As CMO, nothing builds brand loyalty like shared outdoor experiences. Participants form friendships, share photos, and tell stories about TrailBound adventures. Priceless marketing.',
        'cto', 'I would build trip management systems. Technology handles registration, waivers, packing lists, and communication. Good systems make organizing adventures efficient and safe.',
        'chro', 'I think about staff qualifications and liability. As CHRO, leading trips requires wilderness first aid, leadership training, and proper insurance. I''d develop certification programs and safety protocols.',
        'coo', 'I manage trip logistics. As COO, guided adventures require detailed planning—routes, permits, safety equipment, emergency plans. With proper processes, we can run safe, memorable adventures.'
    ),
    get_lens_multipliers('promotion'),
    ARRAY['guided_trips', 'experiential_marketing', 'adventure_programs', 'community_building']
);

-- PRICE: Gear Trade-In Program
INSERT INTO ccm_business_scenarios (title, description, context, business_driver, p_category, difficulty_level, grade_category, company_room_id, base_points, executive_pitches, lens_multipliers, tags)
VALUES (
    'Used Gear Exchange',
    'Should we accept used gear for trade-in credit toward new purchases? This helps customers upgrade affordably and reduces waste, but requires evaluating condition, refurbishing, and reselling used items.',
    'Price challenges are about what to charge and how to give customers good value. Smart pricing keeps customers happy while making enough money to stay in business.',
    'price', 'price', 'medium', 'middle',
    (SELECT id FROM ccm_company_rooms WHERE code = 'TRAILBOUND' LIMIT 1), 100,
    jsonb_build_object(
        'ceo', 'As CEO, trade-ins align with outdoor community values—reduce waste, make gear accessible, keep functional items in use. This is good for environment and customers, even if operationally complex.',
        'cfo', 'I analyze economics. Trade-ins mean buying used gear we resell at lower margins. As CFO, if trade-ins drive new gear purchases we otherwise wouldn''t get, the program creates incremental revenue worth pursuing.',
        'cmo', 'I see trade-ins as differentiation. As CMO, sustainability matters to outdoor enthusiasts. Trade-in programs demonstrate environmental commitment and make gear affordable for more people. Strong brand message.',
        'cto', 'I would build trade-in valuation systems. Technology helps evaluate condition, offer fair trade-in values, and track used inventory. Good systems make complex trade-in programs manageable.',
        'chro', 'I think about staff training. As CHRO, employees need to assess gear condition, make offers, and explain programs. This requires judgment and knowledge beyond basic retail skills.',
        'coo', 'I manage trade-in operations. As COO, used gear needs inspection, cleaning, minor repairs, and separate merchandising. Operations become more complex, but trade-ins could create sustainable competitive advantage.'
    ),
    get_lens_multipliers('price'),
    ARRAY['trade_in_program', 'used_gear', 'sustainability', 'circular_economy']
);

-- ========================================
-- COMPLETION: ALL 60 MIDDLE SCHOOL CHALLENGES
-- ========================================

COMMENT ON FUNCTION get_lens_multipliers IS
'Returns standard lens multiplier JSON for each P category. Ensures consistency across all challenges.';
